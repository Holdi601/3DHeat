import { useMemo, useState } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import type { Dataset, FilterSpec } from '../../state/types';
import { rgbToCss, teamBaseColor } from '../../render/colors';
import { int, t } from '../../i18n';
import { Check, Section } from '../controls';
import { usePlayhead } from './hooks';
import { personAt, sortUnits, unitsInPlay, unitsOf, type Unit, type UnitKind } from './units';
import { teamName } from './replayView';
import { selectAndFollow } from './ReplayOverlay';
import { clearLook, lookAtUnit } from './pair';

/** Rows a section lists before asking for a search. */
const MAX_ROWS = 400;

/** Show or hide units' tracks: through the person filter, so the Filters panel says so too. */
export function setUnitsShown(d: Dataset, persons: number[], shown: boolean): void {
  const s = useStore.getState();
  const f = s.filters.find((x) => x.kind === 'persons');
  const all = d.personLabels.length;
  const allowed = new Set<number>(f && f.kind === 'persons' ? f.allowed : Array.from({ length: all }, (_, i) => i));
  for (const p of persons) {
    if (shown) allowed.add(p);
    else allowed.delete(p);
  }
  const rest = s.filters.filter((x) => x.kind !== 'persons');
  s.setFilters(allowed.size >= all ? rest : [...rest, { kind: 'persons', allowed: [...allowed].sort((a, b) => a - b) } as FilterSpec]);
}

/**
 * Every unit of the replay, players and AI apart, each by name: a click
 * follows it and shows its data, the eye shows or hides it. Searchable;
 * dimmed while it is not in the match at the playhead.
 */
export function UnitList() {
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const session = useStore((s) => s.team.session);
  const follow = useReplayStore((s) => s.followUnit);
  const selected = useReplayStore((s) => s.selected);
  const target = useReplayStore((s) => s.target);
  const now = usePlayhead();
  const [query, setQuery] = useState('');
  // Decoys, shells and debris: hundreds in an air combat recording, out of the lists unless asked for.
  const [decoys, setDecoys] = useState(false);
  const index = useMemo(() => (dataset ? unitsOf(dataset) : null), [dataset]);
  const allowed = useMemo(() => {
    const f = filters.find((x) => x.kind === 'persons');
    return f && f.kind === 'persons' ? new Set(f.allowed) : null;
  }, [filters]);
  // Only the units of the matches being played.
  const inPlay = useMemo(() => {
    if (!dataset) return null;
    const f = filters.find((x) => x.kind === 'categories' && /^(match(_?id)?|source file)$/i.test(x.column.trim()));
    return unitsInPlay(dataset, session, f && f.kind === 'categories' ? { column: f.column, allowed: f.allowed } : null);
  }, [dataset, session, filters]);
  const groups = useMemo(() => {
    if (!index) return null;
    const q = query.trim().toLowerCase();
    const match = (u: Unit) => (!inPlay || inPlay.has(u.key)) && (!q || u.name.toLowerCase().includes(q) || u.vehicle.toLowerCase().includes(q));
    const by = (k: UnitKind) => sortUnits(index.units.filter((u) => u.kind === k && match(u) && (decoys || !u.decoy)));
    return { player: by('player'), ai: by('ai'), weapon: by('weapon'), decoys: index.units.reduce((n, u) => n + (u.decoy && match(u) ? 1 : 0), 0) };
  }, [index, query, inPlay, decoys]);
  if (!dataset || !index || !groups || index.units.length === 0) return null;
  const visible = (u: Unit) => !allowed || u.persons.some((p) => allowed.has(p));
  const live = (u: Unit) => u.spans.some(([a, b]) => a <= now && now <= b);

  const row = (u: Unit) => {
    const shown = visible(u);
    const color = u.team >= 0 ? rgbToCss(teamBaseColor(u.team)) : '#9aa3ad';
    return (
      <div
        key={u.key}
        className={`unit-row${live(u) ? '' : ' gone'}${follow === u.key ? ' followed' : ''}${selected === u.key ? ' selected' : ''}${target === u.key ? ' target' : ''}${shown ? '' : ' hidden'}`}
        onClick={(e) => {
          // Ctrl or Alt: look at it from the followed unit instead.
          if ((e.ctrlKey || e.altKey) && follow && follow !== u.key) {
            if (target === u.key) clearLook();
            else lookAtUnit(u, personAt(u, now));
            return;
          }
          if (follow === u.key) {
            useReplayStore.getState().stopFollow();
            return;
          }
          // Not in the match now: to when it next is, else only its card.
          const next = live(u) ? null : u.spans.map((s) => s[0]).filter((a) => a > now).sort((a, b) => a - b)[0];
          if (next !== undefined && next !== null) useStore.getState().seek(next + 0.05);
          if (live(u) || next !== undefined) selectAndFollow(u, personAt(u, next ?? now));
          else useReplayStore.getState().select(u.key);
        }}
        title={t('replay.units.rowTitle', { name: u.name, team: u.team >= 0 ? teamName(dataset, u.team) : '—' })}
      >
        <span className="swatch" style={{ background: color }} />
        <span className="who">{u.name}</span>
        {u.vehicle && !u.name.startsWith(u.vehicle) && <span className="veh">{u.vehicle}</span>}
        {follow && follow !== u.key && (
          <button
            className={`look${target === u.key ? ' on' : ''}`}
            title={target === u.key ? t('replay.lookAt.clearTitle') : t('replay.lookAt.rowTitle')}
            onClick={(e) => {
              e.stopPropagation();
              if (target === u.key) clearLook();
              else lookAtUnit(u, personAt(u, now));
            }}
          >
            ⌖
          </button>
        )}
        <button
          className={`eye${shown ? '' : ' off'}`}
          title={shown ? t('replay.units.hide') : t('replay.units.show')}
          onClick={(e) => {
            e.stopPropagation();
            setUnitsShown(dataset, u.persons, !shown);
          }}
        >
          {shown ? '◉' : '○'}
        </button>
      </div>
    );
  };

  const block = (kind: UnitKind, list: Unit[], open: boolean) => {
    if (!list.length) return null;
    const persons = list.flatMap((u) => u.persons);
    const anyShown = list.some(visible);
    return (
      <details className="unit-group" open={open}>
        <summary>
          <span>
            {t(`replay.units.${kind}`)} <span className="count">{int(list.length)}</span>
          </span>
          <button
            className="small link"
            onClick={(e) => {
              e.preventDefault();
              setUnitsShown(dataset, persons, !anyShown);
            }}
          >
            {anyShown ? t('replay.units.hideAll') : t('replay.units.showAll')}
          </button>
        </summary>
        {list.slice(0, MAX_ROWS).map(row)}
        {list.length > MAX_ROWS && <div className="hint">{t('replay.units.more', { count: list.length - MAX_ROWS })}</div>}
      </details>
    );
  };

  return (
    <Section title={t('replay.units.title')} defaultOpen right={<span className="count">{int(inPlay ? inPlay.size : index.units.length)}</span>}>
      <input className="unit-search" type="search" placeholder={t('replay.units.search')} value={query} onChange={(e) => setQuery(e.target.value)} />
      {block('player', groups.player, true)}
      {block('ai', groups.ai, groups.player.length === 0 || !!query)}
      {block('weapon', groups.weapon, !!query)}
      {groups.decoys > 0 && (
        <Check label={t('far.decoys', { count: groups.decoys })} checked={decoys} onChange={setDecoys} title={t('far.decoysTitle')} />
      )}
      {index.aiFrom === 'none' && <div className="hint">{t('replay.units.noAi')}</div>}
      {index.aiFrom === 'pilot' && <div className="hint">{t('replay.units.aiByPilot')}</div>}
      {index.aiFrom === 'userId' && <div className="hint">{t('replay.units.aiByUser')}</div>}
    </Section>
  );
}
