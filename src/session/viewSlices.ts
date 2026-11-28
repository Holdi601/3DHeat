/**
 * The viewer's view as slices for the view sync (`viewSync.ts`): what each
 * workspace shows and how, read from its store and put back through it.
 * Every value that arrives goes through `shaped` against this viewer's own
 * (fields it has, types it holds); names - a filter's values, a team, a
 * match, a unit - are matched by name, as a saved view is, so the same data
 * loaded twice means the same thing on both.
 *
 * Not here: the camera (following and "look here" move it), the data and
 * the level themselves (sharing them is the session's asset sharing), and
 * what the shared layers already carry (the tactics board, marks, notes).
 */

import type { Engine } from '../render/engine';
import { toFilterSpec } from '../insights/apply';
import { useStore } from '../state/store';
import type { FilterSpec, SplitRule, ViewMode } from '../state/types';
import { raceClock, useRaceStore } from '../state/raceStore';
import { useReplayStore } from '../state/replayStore';
import { useMatchStore } from '../state/matchStore';
import { useVehicleStore } from '../state/vehicleStore';
import { usePlanStore } from '../state/planStore';
import { useObjectivesStore } from '../state/objectivesStore';
import { useInspectStore } from '../state/inspectStore';
import { useContourPrefs } from '../render/volumeContours';
import { filterToSaved, type SavedFilter } from '../state/savedViews';
import { shaped, type ClockValue, type ViewSlice } from './viewSync';

const MODES: ViewMode[] = ['heat-simple', 'heat-difference', 'heat-teams', 'heat-lines', 'team'];
const TABS = ['heat', 'race', 'match', 'plan', 'vehicle'] as const;

const pick = <T extends object, K extends keyof T>(o: T, keys: readonly K[]): Pick<T, K> => {
  const out = {} as Pick<T, K>;
  for (const k of keys) if (o[k] !== undefined) out[k] = o[k];
  return out;
};

/** The heat settings shared: not what the engine works out itself (the exposure it follows, the palette it picked). */
function heatOf(): Record<string, unknown> {
  const { teamPaletteActive: _p, ...h } = useStore.getState().heat;
  if (h.followExposure) delete (h as Partial<typeof h>).saturation;
  return h;
}

const HEAT_NULL = new Set(['weightBy']);
const LINE_NULL = new Set(['column', 'maxJump']);

/** The replay's display settings shared: labels, cards, aids, the map, the overlay, the selected unit. */
const REPLAY_KEYS = [
  'labels',
  'labelFields',
  'cardFields',
  'cardFieldsGround',
  'cardFieldsSea',
  'graph',
  'declutter',
  'labelAi',
  'overlayLabels',
  'overlayMarkers',
  'labelRules',
  'aids',
  'map',
  'mapTrail',
  'mapNames',
  'hud',
  'labelScale',
  'subtitles',
  'geo',
  'limits',
  'buildings',
  'ranges',
  'dropLines',
  'eventKinds',
  'eventUnit',
  'overlay',
  'selected',
  'pauseOnEvent',
] as const;
const REPLAY_NULL = new Set(['dropLines', 'eventKinds', 'eventUnit', 'selected', 'groups', 'only']);

const VEHICLE_KEYS = [
  'vehicle',
  'matches',
  'shooters',
  'weapons',
  'outcomes',
  'layer',
  'areaBy',
  'breakdown',
  'colourBy',
  'showPoints',
  'showHeat',
  'showArrows',
  'plates',
  'fit',
  'radius',
  'exposure',
  'turntable',
  'spin',
] as const;
const VEHICLE_NULL = new Set(['vehicle', 'matches', 'shooters', 'weapons', 'outcomes']);

interface FilterSlice {
  filters: SavedFilter[];
  hidden: string[];
  positive: string[];
  negative: string[];
  split: SplitRule;
}

function labelsOf(idx: number[], labels: string[]): string[] {
  return idx.map((i) => labels[i]).filter((v): v is string => typeof v === 'string');
}

function indicesOf(names: unknown, labels: string[]): number[] {
  return Array.isArray(names)
    ? names
        .filter((n): n is string => typeof n === 'string')
        .map((n) => labels.indexOf(n))
        .filter((i) => i >= 0)
    : [];
}

function captureFilters(): FilterSlice {
  const s = useStore.getState();
  const ds = s.dataset;
  const labels = {
    categories: (c: string) => ds?.attrs.find((a) => a.name === c)?.categories,
    teams: ds?.teamLabels ?? [],
    persons: ds?.personLabels ?? [],
  };
  return {
    filters: s.filters.map((f) => filterToSaved(f, labels)).filter((f): f is SavedFilter => !!f),
    hidden: Object.entries(s.teamVisibility)
      .filter(([, v]) => v === false)
      .map(([k]) => labels.teams[Number(k)])
      .filter((v): v is string => v !== undefined),
    positive: labelsOf(s.positiveTeams, labels.teams),
    negative: labelsOf(s.negativeTeams, labels.teams),
    split: s.split,
  };
}

function readSplit(v: unknown): SplitRule | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (o.kind === 'teams') return { kind: 'teams' };
  if (typeof o.column !== 'string' || o.column.length > 200) return null;
  const nums = (x: unknown, n?: number) => Array.isArray(x) && x.length <= 4000 && x.every((y) => typeof y === 'number' && Number.isFinite(y)) && (n === undefined || x.length === n);
  if (o.kind === 'categories' && nums(o.positive) && nums(o.negative))
    return {
      kind: 'categories',
      column: o.column,
      positive: o.positive as number[],
      negative: o.negative as number[],
    };
  if (o.kind === 'range' && nums(o.positive, 2) && nums(o.negative, 2))
    return {
      kind: 'range',
      column: o.column,
      positive: o.positive as [number, number],
      negative: o.negative as [number, number],
    };
  return null;
}

function applyFilters(v: unknown): void {
  if (!v || typeof v !== 'object') return;
  const o = v as Partial<FilterSlice>;
  const st = useStore.getState();
  const ds = st.dataset;
  if (!ds) return;
  const out: FilterSpec[] = [];
  for (const f of Array.isArray(o.filters) ? o.filters.slice(0, 64) : []) {
    if (!f || typeof f !== 'object') continue;
    if (f.by === 'range') {
      if (typeof f.column === 'string' && Number.isFinite(f.min) && Number.isFinite(f.max) && ds.attrs.some((a) => a.name === f.column))
        out.push({ kind: 'range', column: f.column, min: f.min, max: f.max });
      continue;
    }
    if (!Array.isArray(f.values) || !f.values.every((x) => typeof x === 'string')) continue;
    if (f.by === 'category' && typeof f.column !== 'string') continue;
    if (f.by !== 'category' && f.by !== 'team' && f.by !== 'person') continue;
    const spec = toFilterSpec(ds, f);
    if (spec) out.push(spec);
  }
  st.setFilters(out);
  const hidden = new Set(indicesOf(o.hidden, ds.teamLabels));
  ds.teamLabels.forEach((_, i) => {
    const hide = hidden.has(i);
    if ((useStore.getState().teamVisibility[i] === false) !== hide) useStore.getState().toggleTeam(i, !hide);
  });
  const pos = indicesOf(o.positive, ds.teamLabels);
  const neg = indicesOf(o.negative, ds.teamLabels);
  if (pos.length || neg.length) useStore.getState().setTeamSplit(pos, neg);
  const split = readSplit(o.split);
  if (split) useStore.getState().setSplit(split);
}

/** The app's view slices. `engine` gives the live playhead. */
export function appSlices(engine: () => Engine | null): ViewSlice[] {
  return [
    {
      key: 'tab',
      // A workspace picks its mode, the figure overlay comes and goes.
      settles: ['mode', 'figures', 'filters', 'play'],
      deps: () => [useRaceStore.getState().tab],
      capture: () => useRaceStore.getState().tab,
      apply: (v) => {
        if (typeof v === 'string' && (TABS as readonly string[]).includes(v) && useRaceStore.getState().tab !== v) useRaceStore.getState().setTab(v as (typeof TABS)[number]);
      },
    },
    {
      key: 'mode',
      // The figure overlay (team mode on the heatmap) puts its own data, match and time in.
      settles: ['figures', 'filters', 'play'],
      deps: () => [useStore.getState().mode],
      capture: () => useStore.getState().mode,
      apply: (v) => {
        if (typeof v === 'string' && (MODES as string[]).includes(v) && useStore.getState().mode !== v) useStore.getState().setMode(v as ViewMode);
      },
    },
    {
      key: 'heat',
      deps: () => [useStore.getState().heat],
      capture: heatOf,
      apply: (v) => {
        const cur = heatOf();
        useStore.getState().patchHeat(
          shaped(cur, v, {
            nullable: HEAT_NULL,
            records: new Set(['dirSourceBy']),
          }) as never,
        );
      },
    },
    {
      key: 'figures',
      deps: () => [useStore.getState().team, useStore.getState().dataset],
      capture: () => {
        const s = useStore.getState();
        const { session, ...team } = s.team;
        return {
          ...team,
          match: session >= 0 ? (s.dataset?.sessionLabels[session] ?? null) : null,
        };
      },
      apply: (v) => {
        const s = useStore.getState();
        const { session: _s, ...team } = s.team;
        const next = shaped(team, v);
        const name = v && typeof v === 'object' ? (v as { match?: unknown }).match : undefined;
        const session = name === null ? -1 : typeof name === 'string' ? (s.dataset?.sessionLabels.indexOf(name) ?? -1) : s.team.session;
        s.patchTeam({
          ...next,
          session: name === undefined || (typeof name === 'string' && session < 0) ? s.team.session : session,
        });
      },
    },
    {
      key: 'lines',
      deps: () => [useStore.getState().lines],
      capture: () => useStore.getState().lines,
      apply: (v) => useStore.getState().patchLines(shaped({ maxJump: null, view: 'heat', ...useStore.getState().lines }, v, { nullable: LINE_NULL })),
    },
    {
      key: 'timeline',
      deps: () => {
        const t = useStore.getState().timeline;
        return [t.mode, t.window, t.loop, t.windowSeconds, t.fadeOut, t.defaultLifetime];
      },
      capture: () => pick(useStore.getState().timeline, ['mode', 'window', 'loop', 'windowSeconds', 'fadeOut', 'defaultLifetime']),
      apply: (v) => useStore.getState().patchTimeline(shaped(pick(useStore.getState().timeline, ['mode', 'window', 'loop', 'windowSeconds', 'fadeOut', 'defaultLifetime']), v)),
    },
    {
      key: 'filters',
      deps: () => {
        const s = useStore.getState();
        return [s.filters, s.teamVisibility, s.positiveTeams, s.negativeTeams, s.split, s.dataset];
      },
      capture: captureFilters,
      apply: applyFilters,
    },
    {
      key: 'slice',
      deps: () => [useStore.getState().slice],
      capture: () => useStore.getState().slice,
      apply: (v) => useStore.getState().patchSlice(shaped(useStore.getState().slice, v)),
    },
    {
      key: 'layers',
      deps: () => {
        const o = useObjectivesStore.getState();
        const c = useContourPrefs.getState();
        const i = useInspectStore.getState();
        return [o.on, o.labels, c.on, c.width, i.heatLabels, i.heatLabelCount];
      },
      capture: () => {
        const o = useObjectivesStore.getState();
        const c = useContourPrefs.getState();
        const i = useInspectStore.getState();
        return {
          objectives: o.on,
          objectiveLabels: o.labels,
          contours: c.on,
          contourWidth: c.width,
          heatLabels: i.heatLabels,
          heatLabelCount: i.heatLabelCount,
        };
      },
      apply: (v) => {
        const o = useObjectivesStore.getState();
        const c = useContourPrefs.getState();
        const i = useInspectStore.getState();
        const x = shaped(
          {
            objectives: o.on,
            objectiveLabels: o.labels,
            contours: c.on,
            contourWidth: c.width,
            heatLabels: i.heatLabels,
            heatLabelCount: i.heatLabelCount,
          },
          v,
        );
        if (o.on !== x.objectives) o.setOn(x.objectives);
        if (o.labels !== x.objectiveLabels) o.setLabels(x.objectiveLabels);
        if (c.on !== x.contours || c.width !== x.contourWidth) c.set({ on: x.contours, width: x.contourWidth });
        if (i.heatLabels !== x.heatLabels || i.heatLabelCount !== x.heatLabelCount)
          i.patch({
            heatLabels: x.heatLabels,
            heatLabelCount: x.heatLabelCount,
          });
      },
    },
    {
      key: 'replay',
      deps: () => {
        const r = useReplayStore.getState();
        return REPLAY_KEYS.map((k) => r[k]);
      },
      capture: () => pick(useReplayStore.getState(), REPLAY_KEYS),
      apply: (v) =>
        useReplayStore.setState(
          shaped(pick(useReplayStore.getState(), REPLAY_KEYS), v, {
            nullable: REPLAY_NULL,
          }),
        ),
    },
    {
      key: 'race',
      deps: () => {
        const r = useRaceStore.getState();
        return [r.view, r.hidden, r.referenceId, r.focusId, r.selected, r.follow, r.replay.mode, r.replay.anchorS, r.replay.loop];
      },
      capture: () => {
        const r = useRaceStore.getState();
        return {
          view: r.view,
          hidden: r.hidden,
          referenceId: r.referenceId,
          focusId: r.focusId,
          selected: r.selected,
          follow: r.follow,
          mode: r.replay.mode,
          anchorS: r.replay.anchorS,
          loop: r.replay.loop,
        };
      },
      apply: (v) => {
        const r = useRaceStore.getState();
        const cur = {
          view: r.view,
          hidden: r.hidden,
          referenceId: r.referenceId,
          focusId: r.focusId,
          selected: r.selected,
          follow: r.follow,
          mode: r.replay.mode,
          anchorS: r.replay.anchorS,
          loop: r.replay.loop,
        };
        const x = shaped(cur, v, {
          nullable: new Set(['referenceId', 'focusId', 'selected', 'follow', 'graphs']),
          records: new Set(['hidden']),
        });
        const mode = (['start', 'anchor', 'locked'] as const).includes(x.mode) ? x.mode : r.replay.mode;
        useRaceStore.setState({
          view: x.view,
          hidden: x.hidden,
          referenceId: x.referenceId,
          focusId: x.focusId,
          selected: x.selected,
          follow: x.follow,
          replay: { ...r.replay, mode, anchorS: x.anchorS, loop: x.loop },
        });
      },
    },
    {
      key: 'match',
      deps: () => [useMatchStore.getState().open, useMatchStore.getState().round],
      capture: () => ({
        open: useMatchStore.getState().open,
        round: useMatchStore.getState().round,
      }),
      apply: (v) => {
        const m = useMatchStore.getState();
        const x = shaped({ open: m.open, round: m.round }, v, {
          nullable: new Set(['round']),
        });
        if (x.open !== m.open) m.setOpen(x.open);
        if (x.round !== useMatchStore.getState().round && (x.round === null || Number.isInteger(x.round))) useMatchStore.getState().setRound(x.round);
      },
    },
    {
      key: 'vehicle',
      deps: () => {
        const s = useVehicleStore.getState();
        return VEHICLE_KEYS.map((k) => s[k]);
      },
      capture: () => pick(useVehicleStore.getState(), VEHICLE_KEYS),
      apply: (v) =>
        useVehicleStore.getState().patch(
          shaped(pick(useVehicleStore.getState(), VEHICLE_KEYS), v, {
            nullable: VEHICLE_NULL,
          }),
        ),
    },
    {
      key: 'board',
      deps: () => {
        const p = usePlanStore.getState();
        return [p.step, p.routesActiveOnly];
      },
      capture: () => ({
        step: usePlanStore.getState().step,
        routesActiveOnly: usePlanStore.getState().routesActiveOnly,
      }),
      apply: (v) => {
        const p = usePlanStore.getState();
        const x = shaped({ step: p.step, routesActiveOnly: p.routesActiveOnly }, v);
        if (x.step !== p.step && !p.playing) p.setStep(Math.round(x.step));
        if (x.routesActiveOnly !== p.routesActiveOnly) usePlanStore.setState({ routesActiveOnly: x.routesActiveOnly });
      },
    },
    // ---------------------------------------------------------------- the clocks
    {
      key: 'play',
      deps: () => {
        const t = useStore.getState().timeline;
        return [t.playing, t.speed, t.reverse, t.seekNonce];
      },
      capture: () => {
        const t = useStore.getState().timeline;
        return {
          playing: t.playing,
          speed: t.speed,
          reverse: !!t.reverse,
          n: t.seekNonce,
        };
      },
      apply: (v) => {
        const c = v as ClockValue;
        const st = useStore.getState();
        if (st.timeline.speed !== c.speed || !!st.timeline.reverse !== c.reverse)
          st.patchTimeline({
            speed: Math.max(0.01, Math.abs(c.speed)),
            reverse: c.reverse,
          });
        if (st.timeline.playing !== c.playing) useStore.getState().setPlaying(c.playing);
      },
      clock: {
        time: () => engine()?.live.playhead ?? useStore.getState().timeline.playhead,
        seek: (t) => useStore.getState().seek(t),
      },
    },
    {
      key: 'raceplay',
      deps: () => {
        const r = useRaceStore.getState().replay;
        return [r.playing, r.speed];
      },
      capture: () => {
        const r = useRaceStore.getState().replay;
        return { playing: r.playing, speed: r.speed, reverse: false };
      },
      apply: (v) => {
        const c = v as ClockValue;
        const r = useRaceStore.getState().replay;
        if (r.playing !== c.playing || r.speed !== c.speed)
          useRaceStore.getState().patchReplay({
            playing: c.playing,
            speed: Math.max(0.01, Math.abs(c.speed)),
          });
      },
      clock: {
        time: () => raceClock.time,
        seek: (t) => raceClock.set(Math.max(0, t)),
      },
    },
    {
      key: 'boardplay',
      deps: () => {
        const p = usePlanStore.getState();
        return [p.playing, p.scrub];
      },
      capture: () => ({
        playing: usePlanStore.getState().playing,
        speed: 1,
        reverse: false,
      }),
      apply: (v) => {
        const c = v as ClockValue;
        const p = usePlanStore.getState();
        if (p.playing !== c.playing) p.play(c.playing);
      },
      clock: {
        time: () => {
          const p = usePlanStore.getState();
          return p.playing ? (engine()?.boardPlayTime ?? p.playTime) : (p.scrub ?? p.playTime);
        },
        seek: (t) => {
          const p = usePlanStore.getState();
          const at = Math.max(0, t);
          if (p.playing) {
            p.setPlayTime(at);
            const e = engine();
            if (e) e.boardPlayTime = at;
          } else p.setScrub(at);
        },
      },
    },
  ];
}

/** What a slice is called in the UI: a message key under `session.sync.what.`. */
export const SLICE_WORDS: Record<string, string> = {
  tab: 'tab',
  mode: 'mode',
  heat: 'heat',
  figures: 'figures',
  lines: 'lines',
  timeline: 'timeline',
  filters: 'filters',
  slice: 'slice',
  layers: 'layers',
  replay: 'replay',
  race: 'race',
  match: 'match',
  vehicle: 'vehicle',
  board: 'board',
  play: 'play',
  raceplay: 'play',
  boardplay: 'play',
};
