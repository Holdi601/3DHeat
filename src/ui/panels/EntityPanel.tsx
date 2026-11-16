import { useEffect, useMemo, useState } from 'react';
import { rgbToCss, teamMemberColor } from '../../render/colors';
import { filterSlots } from '../../render/filterTables';
import { MAX_FILTER_SLOTS } from '../../render/types';
import { useStore } from '../../state/store';
import type { Dataset, FilterSpec } from '../../state/types';
import { Section } from '../controls';
import { int, t } from '../../i18n';
import { prepareUnits, unitsReady, type Unit } from '../replay/units';
import { SortControl } from '../sort/SortControl';
import { useSort, useSorted } from '../sort/useSort';

/** Rows rendered at once. The real datasets have tens of thousands of entities. */
const PAGE = 200;
/** Players past this many: only those in play at the playhead are listed (a search still finds all). */
const MANY_PLAYERS = 40;

/**
 * Isolate specific people or entities.
 *
 * The lists here can be enormous — the real exports carry 33,618 named entities,
 * because every AI actor is one — so this is search-first with a capped result
 * list rather than a scrollable roster. Rendering all of them would cost more
 * than a frame of heat.
 *
 * The selection applies everywhere: on the CPU side in the box replay (track
 * visibility and cube building), and in the heat modes as one of the four shader
 * filter slots, over the person ids — the mask behind a slot holds 65,536 ids,
 * enough for those tens of thousands. Taking a slot means it can be crowded out
 * by column filters, and then the panel says so rather than leaving the heat to
 * quietly show everyone.
 *
 * Listed as people name them (`replay/units.ts`): the players, and when there
 * are many only those in play at the playhead; the AI folded away beneath.
 */
export function EntityPanel() {
  const dataset = useStore((s) => s.dataset);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const [query, setQuery] = useState('');

  const personFilter = filters.find((f) => f.kind === 'persons');
  const selected = useMemo(
    () => new Set(personFilter && personFilter.kind === 'persons' ? personFilter.allowed : []),
    [personFilter],
  );

  // Players and AI as the replay's unit list tells them (`units.ts`); weapons are their launchers'.
  // The panel is always mounted, so a dataset handed over without its index
  // (any setDataset that skipped `prepareUnits`) has it worked out a few
  // milliseconds a frame here, not in one long render.
  const [prepared, setPrepared] = useState<Dataset | null>(null);
  useEffect(() => {
    if (!dataset || unitsReady(dataset)) return;
    let live = true;
    // A slice a frame from the frame after this commit, which the new dataset already fills.
    void prepareUnits(dataset, true).then(() => {
      if (live) setPrepared(dataset);
    });
    return () => {
      live = false;
    };
  }, [dataset]);
  const index = useMemo(() => (dataset ? unitsReady(dataset) : null), [dataset, prepared]);
  const [players, ai] = useMemo(() => {
    const p: Unit[] = [];
    const a: Unit[] = [];
    for (const u of index?.units ?? []) if (u.kind === 'player') p.push(u);
    else if (u.kind === 'ai') a.push(u);
    return [p, a];
  }, [index]);
  const sort = useSort<Unit>(
    'entities',
    [
      { id: 'name', label: t('ui.sort.name'), key: (u) => u.name },
      { id: 'vehicle', label: t('ui.sort.vehicle'), key: (u) => u.vehicle },
      { id: 'team', label: t('ui.sort.team'), key: (u) => (u.team >= 0 ? String(dataset?.teamLabels[u.team] ?? '') : '') },
      { id: 'time', label: t('ui.sort.time'), key: (u) => u.spans[0]?.[0], kind: 'number', dir: 'asc' },
    ],
    'name',
  );
  const sortedPlayers = useSorted(players, sort);
  const sortedAi = useSorted(ai, sort);
  const many = players.length > MANY_PLAYERS && !!dataset?.time;
  // Whole seconds, so a playing timeline re-lists once a second at most.
  const now = useStore((s) => (many ? Math.floor(s.timeline.playhead) : 0));
  const q = query.trim().toLowerCase();
  const hit = (u: Unit) => !q || u.name.toLowerCase().includes(q) || u.vehicle.toLowerCase().includes(q);
  const shownPlayers = useMemo(() => {
    const out: Unit[] = [];
    for (const u of sortedPlayers) {
      if (!hit(u)) continue;
      // Many players: those in play now (a search lists all it finds).
      if (many && !q && !u.spans.some(([a, b]) => a <= now + 1 && b >= now)) continue;
      out.push(u);
      if (out.length >= PAGE) break;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedPlayers, q, many, now]);
  const [aiOpen, setAiOpen] = useState(false);
  const shownAi = useMemo(() => {
    if (!aiOpen && !q) return [];
    const out: Unit[] = [];
    for (const u of sortedAi) {
      if (!hit(u)) continue;
      out.push(u);
      if (out.length >= PAGE) break;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedAi, q, aiOpen]);
  const matchCount = shownPlayers.length + shownAi.length;

  if (!dataset || dataset.personLabels.length === 0) return null;
  const total = dataset.personLabels.length;
  // The slot the shader gives the selection; past the last one the heat ignores it.
  const at = filters.findIndex((f) => f.kind === 'persons');
  const noSlot = at >= 0 && (filterSlots(dataset, filters)[at] ?? -1) >= MAX_FILTER_SLOTS;

  const setSelection = (next: Set<number>) => {
    const rest = filters.filter((f) => f.kind !== 'persons');
    // An empty selection means "no restriction", not "show nobody" — the latter
    // is a blank screen that looks like a bug.
    setFilters(next.size === 0 ? rest : [...rest, { kind: 'persons', allowed: [...next] } as FilterSpec]);
  };

  const isOn = (u: Unit) => u.persons.some((p) => selected.has(p));
  const toggle = (u: Unit) => {
    const next = new Set(selected);
    const on = isOn(u);
    for (const p of u.persons) {
      if (on) next.delete(p);
      else next.add(p);
    }
    setSelection(next);
  };
  const personsOf = (list: Unit[]) => list.flatMap((u) => u.persons);
  const row = (u: Unit) => (
    <div className="team-row" key={u.key}>
      <input type="checkbox" checked={isOn(u)} onChange={() => toggle(u)} />
      <span className="swatch" style={{ background: colourOf(u.persons[0]) }} />
      <span className="name" title={u.vehicle ? `${u.name} · ${u.vehicle}` : u.name}>
        {u.name || <em style={{ opacity: 0.5 }}>{t('heat.entityPanel.unnamed')}</em>}
      </span>
    </div>
  );

  const colourOf = (p: number): string => {
    const team = dataset.personTeam ? dataset.personTeam[p] : 0;
    const slot = dataset.personSlot ? dataset.personSlot[p] : p;
    const size = dataset.teamSizes ? dataset.teamSizes[team] : total;
    return rgbToCss(teamMemberColor(team, slot, size));
  };

  return (
    <Section
      title={t('heat.entityPanel.title')}
      right={
        <span style={{ color: 'var(--text-faint)' }}>
          {selected.size > 0
            ? t('heat.entityPanel.selectedOf', { selected: int(selected.size), total: int(total) })
            : int(total)}
        </span>
      }
    >
      <div className="hint">{t('heat.entityPanel.hint')}</div>
      {noSlot && <div className="err">{t('heat.entityPanel.noSlot')}</div>}
      <input
        type="text"
        placeholder={t('heat.entityPanel.search', { count: total })}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <SortControl sort={sort} />
      {many && !q && <div className="hint">{t('heat.entityPanel.inPlay', { count: players.length })}</div>}
      {q && (
        <div className="hint">
          {matchCount >= PAGE
            ? t('heat.entityPanel.matchesFirst', { count: matchCount, page: int(PAGE) })
            : t('heat.entityPanel.matches', { count: matchCount })}
        </div>
      )}

      <div className="team-list" style={{ maxHeight: 260 }}>
        {shownPlayers.map(row)}
        {matchCount === 0 && q && (
          <div className="hint" style={{ opacity: 0.7 }}>
            {t('heat.entityPanel.noMatch', { query })}
          </div>
        )}
      </div>
      {ai.length > 0 && (
        <details open={aiOpen || !!q} onToggle={(e) => setAiOpen((e.target as HTMLDetailsElement).open)}>
          <summary>{t('heat.entityPanel.ai', { count: ai.length })}</summary>
          <div className="team-list" style={{ maxHeight: 220 }}>
            {shownAi.map(row)}
          </div>
        </details>
      )}

      <div className="row">
        <button
          disabled={matchCount === 0}
          title={t('heat.entityPanel.addShownTitle')}
          onClick={() => setSelection(new Set([...selected, ...personsOf(shownPlayers), ...personsOf(shownAi)]))}
        >
          {t('heat.entityPanel.addShown')}
        </button>
        <button
          disabled={matchCount === 0}
          title={t('heat.entityPanel.onlyShownTitle')}
          onClick={() => setSelection(new Set([...personsOf(shownPlayers), ...personsOf(shownAi)]))}
        >
          {t('heat.entityPanel.onlyShown')}
        </button>
        <button disabled={selected.size === 0} onClick={() => setSelection(new Set())}>
          {t('heat.entityPanel.clear')}
        </button>
      </div>
    </Section>
  );
}
