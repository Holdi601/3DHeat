import { useEffect, useMemo } from 'react';
import { useStore } from '../../state/store';
import { useReplayStore } from '../../state/replayStore';
import { useRaceStore } from '../../state/raceStore';
import type { Dataset, FilterSpec } from '../../state/types';
import { buildOverlay, groupsWith, isOverlay, overlayGroups, type OverlayColour } from '../../match/overlay';
import { useMatchStore } from '../../state/matchStore';
import { int, t } from '../../i18n';
import { Check, Section, Segmented } from '../controls';
import { sortUnits, unitsOf } from './units';
import { leanOverlayOf } from '../../overlay/lean/load';

/** The loaded dataset while the overlay stands in for it, and the filters it had. */
let original: { d: Dataset; filters: FilterSpec[] } | null = null;
let built: { key: string; d: Dataset | null } | null = null;

/** The dataset loaded, not the overlay standing in for it. */
export function loadedDataset(): Dataset | null {
  const d = useStore.getState().dataset;
  return isOverlay(d) && original ? original.d : d;
}

/**
 * The figure overlay, as the heatmap tab's figure mode: while that mode is on,
 * the overlay of the picked groups stands in for the loaded dataset (its
 * filters put aside, as its columns are numbered anew); anywhere else the
 * loaded one is back, filters and all. A new load ends it.
 */
export function useFigureOverlay(): void {
  const tab = useRaceStore((s) => s.tab);
  const mode = useStore((s) => s.mode);
  const dataset = useStore((s) => s.dataset);
  const overlay = useReplayStore((s) => s.overlay);
  useEffect(() => {
    const on = tab === 'heat' && mode === 'team';
    const s = useStore.getState();
    // Something else was loaded meanwhile: it is the data now.
    if (!isOverlay(dataset) && original && dataset !== original.d) {
      original = null;
      built = null;
    }
    const base = isOverlay(dataset) ? original?.d ?? null : dataset;
    if (!on || !base) {
      if (isOverlay(dataset) && original) {
        const back = original;
        original = null;
        useStore.setState({ dataset: back.d, filters: back.filters });
      }
      return;
    }
    const key = JSON.stringify(overlay);
    // One player's: their tracks.
    const only = overlay.only ? (unitsOf(base).byKey.get(overlay.only)?.persons ?? []) : null;
    if (!built || built.key !== key || (original && original.d !== base)) built = { key, d: buildOverlay(base, { ...overlay, only }) };
    const next = built.d ?? base;
    if (next === dataset) return;
    if (!isOverlay(dataset)) original = { d: base, filters: s.filters };
    useStore.setState({ dataset: next, filters: next === base && original ? original.filters : [], team: { ...s.team, session: next === base ? s.team.session : -1 } });
    if (next !== base) s.seek(next.timeRange[0]);
  }, [tab, mode, dataset, overlay]);
}

/**
 * What the figure overlay lays over each other: which rounds or matches,
 * coloured by team or by round, perhaps only those one player took part in;
 * its labels and event markers, off unless asked.
 */
export function OverlayPanel() {
  const dataset = useStore((s) => s.dataset);
  const overlay = useReplayStore((s) => s.overlay);
  const labels = useReplayStore((s) => s.overlayLabels);
  const markers = useReplayStore((s) => s.overlayMarkers);
  const games = useMatchStore((s) => s.games);
  const docs = useMatchStore((s) => s.docs);
  const base = useMemo(() => (dataset ? loadedDataset() : null), [dataset]);
  const groups = useMemo(() => (base ? overlayGroups(base) : null), [base]);
  const players = useMemo(() => (base ? sortUnits(unitsOf(base).units.filter((u) => u.kind === 'player')) : []), [base]);
  // The groups the one player is in, when one is picked.
  const mine = useMemo(() => {
    if (!base || !groups || !overlay.only) return null;
    const u = unitsOf(base).byKey.get(overlay.only);
    return u ? groupsWith(base, groups, u.persons) : new Set<number>();
  }, [base, groups, overlay.only]);
  const r = useReplayStore.getState;
  // An overlay loaded straight into GPU tracks has its own panel (LeanOverlayPanel).
  if (!base || leanOverlayOf(base)) return null;
  if (!groups) {
    return (
      <Section title={t('replay.overlay.title')} defaultOpen>
        <div className="hint">{t('replay.overlay.single')}</div>
      </Section>
    );
  }
  const picked = overlay.groups;
  const isOn = (i: number) => picked === null || picked.includes(i);
  const nameOf = (id: string) => {
    const g = games.find((x) => id === x.match || id.startsWith(x.match));
    if (g) return `${g.map} · ${g.started.replace('T', ' ').replace(/\+.*$/, '')}`;
    const round = /^(.*) #(\d+)$/.exec(id);
    const doc = docs.find((x) => x.match === (round ? round[1] : id));
    if (doc && round) return t('replay.overlay.round', { match: doc.teams.join(' – '), round: Number(round[2]) });
    return id;
  };
  return (
    <Section title={t('replay.overlay.title')} defaultOpen right={<span className="count">{int(picked?.length ?? groups.groups.length)}</span>}>
      <div className="hint">{t(groups.via === 'session' ? 'replay.overlay.hintSessions' : 'replay.overlay.hintMatches')}</div>
      <Segmented<OverlayColour>
        value={overlay.colour}
        options={[
          { value: 'team', label: t('replay.overlay.byTeam') },
          { value: 'group', label: t('replay.overlay.byGroup') },
        ]}
        onChange={(colour) => r().setOverlay({ colour })}
      />
      {players.length > 0 && (
        <div className="field">
          <div className="label">
            <span>{t('replay.overlay.only')}</span>
          </div>
          <select value={overlay.only ?? ''} onChange={(e) => r().setOverlay({ only: e.target.value || null })}>
            <option value="">{t('replay.overlay.everyone')}</option>
            {players.map((u) => (
              <option key={u.key} value={u.key}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <Check label={t('replay.overlay.labels')} checked={labels} onChange={(v) => r().patchSaved({ overlayLabels: v })} />
      <Check label={t('replay.overlay.markers')} checked={markers} onChange={(v) => r().patchSaved({ overlayMarkers: v })} />
      <div className="row wrap" style={{ gap: 6, margin: '4px 0' }}>
        <button className="small link" onClick={() => r().setOverlay({ groups: null })}>
          {t('replay.overlay.all')}
        </button>
        <button className="small link" onClick={() => r().setOverlay({ groups: [] })}>
          {t('replay.overlay.none')}
        </button>
      </div>
      <div className="match-list overlay-list">
        {groups.groups.map((g) => (
          <label key={g.index} className={`check${mine && !mine.has(g.index) ? ' dim' : ''}`} title={mine && !mine.has(g.index) ? t('replay.overlay.notIn') : undefined}>
            <input
              type="checkbox"
              checked={isOn(g.index)}
              onChange={(e) => {
                const now = picked ?? groups.groups.map((x) => x.index);
                const next = e.target.checked ? [...now, g.index] : now.filter((x) => x !== g.index);
                r().setOverlay({ groups: next.length === groups.groups.length ? null : next });
              }}
            />
            <span>{nameOf(g.id)}</span>
          </label>
        ))}
      </div>
      {picked !== null && picked.length === 0 && <div className="hint warn">{t('replay.overlay.nothing')}</div>}
    </Section>
  );
}
