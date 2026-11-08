/**
 * The tactics board's state: the plan being made, the tool in hand, the step
 * shown, what is selected and what is half drawn, playback, and an undo
 * history of whole plans (plans are small; a copy per edit is simpler and
 * safer than inverse operations).
 *
 * The board answers clicks on the level with a world point (the engine finds
 * it, see `Engine.boardClick`); everything a click does is here.
 */

import { create } from 'zustand';
import { emptyPlan, keyAt, newId, onBoard, playbackAt, readPlan, type ArrowStyle, type Plan, type PlanFigure, type Vec3 } from '../tactics/plan';
import { gamePreset } from '../tactics/games';
import { CATALOG } from '../figures/catalog';
import { figureLabel } from '../tactics/names';
import { applyTransform, type GizmoMode, type Transform } from '../tactics/gizmo';
import type { Mode } from '../tactics/speeds';
import { routeModes, stepStart } from '../tactics/timing';

export type BoardTool = 'select' | 'place' | 'arrow' | 'throw' | 'area' | 'note' | 'erase';

interface Draft {
  kind: 'arrow' | 'throw' | 'area';
  style?: ArrowStyle;
  points: Vec3[];
  team: string;
  /** The figure an arrow starts at, when it was begun on one. */
  figure?: string;
}

export interface PlanState {
  plan: Plan;
  tool: BoardTool;
  /** The palette's choice: what `place` puts down, what a throw lands. */
  kind: string;
  team: string;
  arrowStyle: ArrowStyle;
  /** Heading for the next placed figure, radians (box yaw). */
  yaw: number;
  step: number;
  /** The primary selection (the last picked): a figure, arrow, area or note id, or `<arrow>#<point>`. */
  selected: string | null;
  /** Everything selected; `selected` is its last. */
  selection: string[];
  /** What the gizmo does, and how the keys pick it (W/E/R, or Blender's G/R/S). */
  gizmo: GizmoMode;
  keyScheme: 'editor' | 'blender';
  /** Moved things that stand on the ground land on the surface. */
  snapGround: boolean;
  /** Grid for Ctrl-snapped moves, plan units (0: a metre); angle step for Ctrl-snapped turns, degrees. */
  grid: number;
  angleStep: number;
  /** The plan as a gizmo drag began, while one is under way. */
  dragBase: Plan | null;
  draft: Draft | null;
  /** Moving a selected figure: the next click puts it there. */
  moving: boolean;
  playing: boolean;
  /** Playback time, seconds from the plan's start. */
  playTime: number;
  past: Plan[];
  future: Plan[];

  setGame: (game: string) => void;
  setTool: (tool: BoardTool) => void;
  setKind: (kind: string) => void;
  setTeam: (team: string) => void;
  setArrowStyle: (s: ArrowStyle) => void;
  setStep: (step: number) => void;
  addStep: () => void;
  removeStep: (step: number) => void;
  setStepSeconds: (step: number, seconds: number) => void;
  setFigureScale: (k: number) => void;
  setTitle: (t: string) => void;
  /** A click on the board at a world point; `hit` is the figure under the click, if any. */
  click: (at: Vec3, hit: string | null, additive?: boolean) => void;
  /** Select these references; `additive` toggles them in the selection instead. */
  selectRefs: (refs: string[], additive: boolean) => void;
  setGizmo: (m: GizmoMode) => void;
  setKeyScheme: (k: 'editor' | 'blender') => void;
  setSnapGround: (on: boolean) => void;
  setGrid: (grid: number, angleStep: number) => void;
  beginDrag: () => void;
  /** The drag so far, from where it began. */
  dragPreview: (t: Transform) => void;
  endDrag: () => void;
  cancelDrag: () => void;
  /** One recorded transform of the selection (typed numbers). */
  transformSelection: (t: Transform) => void;
  setFigureAngles: (id: string, a: { yaw?: number; pitch?: number; roll?: number }) => void;
  setAreaRadius: (id: string, r: number) => void;
  setSegmentMode: (arrow: string, segment: number | 'all', mode: Mode) => void;
  setPause: (arrow: string, point: number, seconds: number) => void;
  setProfile: (figure: string, profile: string | null) => void;
  setSpeedOverride: (figure: string, mode: Mode, metresPerSecond: number | null) => void;
  setUnitsPerMetre: (k: number | null) => void;
  setRealTime: (on: boolean) => void;
  /** Ends the arrow or area being drawn (double click, Enter, right click). */
  finish: () => void;
  cancel: () => void;
  rotateSelected: (by: number) => void;
  setLabel: (id: string, label: string) => void;
  remove: (id: string) => void;
  select: (id: string | null) => void;
  startMove: () => void;
  undo: () => void;
  redo: () => void;
  play: (on: boolean) => void;
  setPlayTime: (t: number) => void;
  load: (text: string, level: string) => void;
  clear: () => void;
}

function edit(state: PlanState, next: Plan): Partial<PlanState> {
  return { plan: next, past: [...state.past.slice(-99), state.plan], future: [] };
}

function clone(p: Plan): Plan {
  return structuredClone(p);
}

/**
 * The figure nearest a point on the board in `step`, within that figure's own
 * reach - `reachOf(f)`, about its size - so a tank on the board does not make
 * every soldier grabbable from tank lengths away.
 */
export function figureNear(plan: Plan, step: number, at: Vec3, reachOf: (f: PlanFigure) => number): PlanFigure | null {
  let best: PlanFigure | null = null;
  let bestD = Infinity;
  for (const f of plan.figures) {
    if (!onBoard(f, step)) continue;
    const k = keyAt(f, step);
    if (!k) continue;
    const d = Math.hypot(k.x - at.x, k.z - at.z);
    if (d < reachOf(f) && d < bestD) {
      bestD = d;
      best = f;
    }
  }
  return best;
}

const first = gamePreset('cs2');

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: emptyPlan(first.id, first.teams),
  tool: 'select',
  kind: 'soldier',
  team: first.teams[0].id,
  arrowStyle: 'move',
  yaw: 0,
  step: 0,
  selected: null,
  selection: [],
  gizmo: 'move',
  keyScheme: 'editor',
  snapGround: true,
  grid: 0,
  angleStep: 15,
  dragBase: null,
  draft: null,
  moving: false,
  playing: false,
  playTime: 0,
  past: [],
  future: [],

  setGame: (game) => {
    const s = get();
    const preset = gamePreset(game);
    const plan = clone(s.plan);
    plan.game = preset.id;
    // Keep the figures; the sides follow the game where the plan is still empty of them.
    if (!plan.figures.length && !plan.arrows.length) plan.teams = preset.teams;
    set({ ...edit(s, plan), team: plan.teams[0].id, kind: preset.palette[0].items[0] ?? 'soldier' });
  },
  setTool: (tool) => set({ tool, draft: null, moving: false }),
  setKind: (kind) => set({ kind, tool: 'place', draft: null }),
  setTeam: (team) => set({ team }),
  setArrowStyle: (arrowStyle) => set({ arrowStyle, tool: 'arrow', draft: null }),
  setStep: (step) => set({ step: Math.max(0, Math.min(get().plan.steps.length - 1, step)), draft: null, playing: false }),
  addStep: () => {
    const s = get();
    const plan = clone(s.plan);
    plan.steps.push({ name: String(plan.steps.length + 1), seconds: 4 });
    // Each figure starts the new step where its route in the last one ended.
    const last = plan.steps.length - 2;
    for (const f of plan.figures) {
      const route = plan.arrows.find((a) => a.step === last && a.figure === f.id && a.style === 'move');
      const end = route?.points[route.points.length - 1];
      const k = keyAt(f, last);
      if (end && k) {
        const prev = route!.points[route!.points.length - 2] ?? k;
        const moved = Math.hypot(end.x - prev.x, end.z - prev.z) > 1e-3;
        f.keys[last + 1] = { ...end, yaw: moved ? Math.atan2(end.x - prev.x, -(end.z - prev.z)) : k.yaw };
      }
    }
    set({ ...edit(s, plan), step: plan.steps.length - 1 });
  },
  removeStep: (step) => {
    const s = get();
    if (s.plan.steps.length <= 1) return;
    const plan = clone(s.plan);
    plan.steps.splice(step, 1);
    const shift = <T extends { step: number }>(xs: T[]) => xs.filter((x) => x.step !== step).map((x) => (x.step > step ? { ...x, step: x.step - 1 } : x));
    plan.arrows = shift(plan.arrows);
    plan.areas = shift(plan.areas);
    plan.notes = shift(plan.notes);
    for (const f of plan.figures) {
      const keys: PlanFigure['keys'] = {};
      for (const [k, v] of Object.entries(f.keys)) {
        const n = Number(k);
        if (n < step) keys[n] = v;
        else if (n > step) keys[n - 1] = v;
        else if (!f.keys[n - 1] && n > 0) keys[n - 1] = v;
        else if (n === 0) keys[0] = v;
      }
      f.keys = keys;
      if (f.from > step) f.from--;
      if (f.to !== undefined && f.to >= step) f.to = Math.max(f.from, f.to - 1);
    }
    plan.figures = plan.figures.filter((f) => Object.keys(f.keys).length);
    set({ ...edit(s, plan), step: Math.min(s.step, plan.steps.length - 1) });
  },
  setStepSeconds: (step, seconds) => {
    const s = get();
    const plan = clone(s.plan);
    if (!plan.steps[step]) return;
    plan.steps[step].seconds = Math.max(0.5, Math.min(120, seconds));
    set(edit(s, plan));
  },
  setFigureScale: (k) => {
    const s = get();
    const plan = clone(s.plan);
    plan.figureScale = Math.max(0.1, Math.min(200, k));
    set({ plan });
  },
  setTitle: (title) => set({ plan: { ...get().plan, title } }),

  click: (at, ref, additive) => {
    const s = get();
    // Placing and drawing start from figures only.
    const hit = s.tool === 'select' || s.tool === 'erase' ? ref : ref && s.plan.figures.some((f) => f.id === ref) ? ref : null;
    const step = s.step;
    switch (s.tool) {
      case 'select': {
        if (s.moving && s.selected) {
          const plan = clone(s.plan);
          const f = plan.figures.find((x) => x.id === s.selected);
          if (f) {
            const k = keyAt(f, step);
            const yaw = k ? (Math.hypot(at.x - k.x, at.z - k.z) > 0.01 ? Math.atan2(at.x - k.x, -(at.z - k.z)) : k.yaw) : 0;
            // Moving in a later step than the figure's first is a new place for this step on.
            f.keys[step] = { ...at, yaw: k && step > f.from ? yaw : (k?.yaw ?? yaw) };
          }
          set({ ...edit(s, plan), moving: false });
          return;
        }
        get().selectRefs(hit ? [hit] : [], !!additive);
        return;
      }
      case 'place': {
        if (!CATALOG[s.kind]) return;
        const plan = clone(s.plan);
        const id = newId('f');
        const n = plan.figures.filter((f) => f.kind === s.kind && f.team === s.team).length + 1;
        plan.figures.push({ id, kind: s.kind, team: s.team, label: `${figureLabel(s.kind)} ${n}`, keys: { [step]: { ...at, yaw: s.yaw } }, from: step });
        set({ ...edit(s, plan), selected: id, selection: [id] });
        return;
      }
      case 'arrow':
      case 'throw': {
        if (!s.draft) {
          // Begun on a figure: the arrow starts at it and becomes its route (or its throw).
          const f = hit ? s.plan.figures.find((x) => x.id === hit) : null;
          const k = f ? keyAt(f, step) : null;
          const start = k ? { x: k.x, y: k.y, z: k.z } : at;
          set({ draft: { kind: s.tool, style: s.tool === 'throw' ? 'throw' : s.arrowStyle, points: [start], team: f?.team ?? s.team, figure: f?.id } });
          return;
        }
        // A double click to finish delivers two clicks on the same spot first:
        // a point where the last one is adds nothing (and would leave a
        // zero-length last segment with no direction for the head).
        const last = s.draft.points[s.draft.points.length - 1];
        if (Math.hypot(at.x - last.x, at.y - last.y, at.z - last.z) < 1e-3) return;
        const draft = { ...s.draft, points: [...s.draft.points, at] };
        // A throw needs just its two ends.
        if (s.tool === 'throw') {
          set({ draft });
          get().finish();
          return;
        }
        set({ draft });
        return;
      }
      case 'area': {
        if (!s.draft) {
          set({ draft: { kind: 'area', points: [at], team: s.team } });
          return;
        }
        set({ draft: { ...s.draft, points: [s.draft.points[0], at] } });
        get().finish();
        return;
      }
      case 'note': {
        const text = typeof window !== 'undefined' && typeof window.prompt === 'function' ? window.prompt('Note') : '';
        if (!text) return;
        const plan = clone(s.plan);
        plan.notes.push({ id: newId('n'), step, at, text });
        set(edit(s, plan));
        return;
      }
      case 'erase': {
        const id = hit ?? nearestThing(s.plan, step, at);
        if (id) get().remove(id);
        return;
      }
    }
  },

  finish: () => {
    const s = get();
    const d = s.draft;
    if (!d) return;
    const plan = clone(s.plan);
    if (d.kind === 'area' && d.points.length >= 2) {
      const [c, e] = d.points;
      plan.areas.push({ id: newId('a'), step: s.step, team: d.team, centre: c, radius: Math.max(0.5, Math.hypot(e.x - c.x, e.z - c.z)), label: '' });
    } else if (d.kind !== 'area' && d.points.length >= 2) {
      const id = newId('r');
      const arrow = { id, step: s.step, team: d.team, style: d.style ?? 'move', points: d.points, ...(d.figure ? { figure: d.figure } : {}) } as Plan['arrows'][number];
      if (d.kind === 'throw') {
        // The utility lands at the end and stays from this step on.
        const kind = CATALOG[s.kind]?.domain === 'marker' ? s.kind : 'cs2-smoke';
        const lands = newId('f');
        const end = d.points[d.points.length - 1];
        plan.figures.push({ id: lands, kind, team: d.team, label: figureLabel(kind), keys: { [s.step]: { ...end, yaw: 0 } }, from: s.step });
        arrow.lands = lands;
      }
      // A figure's new route replaces its old one in this step.
      if (arrow.figure && arrow.style === 'move') plan.arrows = plan.arrows.filter((a) => !(a.step === s.step && a.figure === arrow.figure && a.style === 'move'));
      plan.arrows.push(arrow);
    } else {
      set({ draft: null });
      return;
    }
    set({ ...edit(s, plan), draft: null });
  },
  cancel: () => set({ draft: null, moving: false }),
  rotateSelected: (by) => {
    const s = get();
    if (!s.selected) {
      set({ yaw: s.yaw + by });
      return;
    }
    const plan = clone(s.plan);
    const f = plan.figures.find((x) => x.id === s.selected);
    if (!f) return;
    const k = keyAt(f, s.step);
    if (!k) return;
    f.keys[s.step] = { ...k, yaw: k.yaw + by };
    set(edit(s, plan));
  },
  setLabel: (id, label) => {
    const s = get();
    const plan = clone(s.plan);
    const f = plan.figures.find((x) => x.id === id);
    if (f) f.label = label;
    set(edit(s, plan));
  },
  remove: (id) => {
    const s = get();
    const plan = clone(s.plan);
    if (id.includes('#')) {
      // A waypoint: out of its arrow, which keeps at least its two ends.
      const [aid, idx] = id.split('#');
      const a = plan.arrows.find((x) => x.id === aid);
      const i = Number(idx);
      if (!a || a.points.length <= 2) return;
      a.points.splice(i, 1);
      a.modes?.splice(Math.min(i, a.modes.length - 1), 1);
      a.pauses?.splice(i, 1);
      const selection = s.selection.filter((r) => !r.startsWith(`${aid}#`));
      set({ ...edit(s, plan), selection, selected: selection[selection.length - 1] ?? null });
      return;
    }
    const f = plan.figures.find((x) => x.id === id);
    if (f && s.step > f.from) {
      // Gone from this step on, kept before it.
      f.to = s.step - 1;
    } else {
      plan.figures = plan.figures.filter((x) => x.id !== id);
      plan.arrows = plan.arrows.filter((a) => a.figure !== id && a.lands !== id);
    }
    plan.arrows = plan.arrows.filter((a) => a.id !== id);
    plan.areas = plan.areas.filter((a) => a.id !== id);
    plan.notes = plan.notes.filter((n) => n.id !== id);
    const selection = s.selection.filter((r) => r !== id && !r.startsWith(`${id}#`));
    set({ ...edit(s, plan), selection, selected: selection[selection.length - 1] ?? null });
  },
  select: (selected) => set({ selected, selection: selected ? [selected] : [], moving: false }),
  selectRefs: (refs, additive) => {
    const s = get();
    let selection = refs;
    if (additive) {
      selection = [...s.selection];
      for (const r of refs) {
        const i = selection.indexOf(r);
        if (i >= 0 && refs.length === 1) selection.splice(i, 1);
        else if (i < 0) selection.push(r);
      }
    }
    set({ selection, selected: selection[selection.length - 1] ?? null, moving: false });
  },
  setGizmo: (gizmo) => set({ gizmo, tool: 'select', draft: null }),
  setKeyScheme: (keyScheme) => set({ keyScheme }),
  setSnapGround: (snapGround) => set({ snapGround }),
  setGrid: (grid, angleStep) => set({ grid: Math.max(0, grid), angleStep: Math.max(0.1, angleStep) }),
  beginDrag: () => set({ dragBase: get().plan }),
  dragPreview: (t) => {
    const s = get();
    if (!s.dragBase) return;
    set({ plan: applyTransform(s.dragBase, s.step, s.selection, t) });
  },
  endDrag: () => {
    const s = get();
    if (!s.dragBase) return;
    if (s.dragBase !== s.plan) set({ past: [...s.past.slice(-99), s.dragBase], future: [] });
    set({ dragBase: null });
  },
  cancelDrag: () => {
    const s = get();
    if (s.dragBase) set({ plan: s.dragBase, dragBase: null });
  },
  transformSelection: (t) => {
    const s = get();
    if (!s.selection.length) return;
    set(edit(s, applyTransform(s.plan, s.step, s.selection, t)));
  },
  setFigureAngles: (id, a) => {
    const s = get();
    const plan = clone(s.plan);
    const f = plan.figures.find((x) => x.id === id);
    const k = f && keyAt(f, s.step);
    if (!f || !k) return;
    const nk = { ...k, ...a };
    if (!nk.pitch) delete nk.pitch;
    if (!nk.roll) delete nk.roll;
    f.keys[s.step] = nk;
    set(edit(s, plan));
  },
  setAreaRadius: (id, r) => {
    const s = get();
    const plan = clone(s.plan);
    const a = plan.areas.find((x) => x.id === id);
    if (!a || !(r > 0)) return;
    a.radius = r;
    set(edit(s, plan));
  },
  setSegmentMode: (id, segment, mode) => {
    const s = get();
    const plan = clone(s.plan);
    const a = plan.arrows.find((x) => x.id === id);
    if (!a) return;
    if (segment === 'all') {
      a.mode = mode;
      delete a.modes;
    } else {
      const f = plan.figures.find((x) => x.id === a.figure);
      const now = f ? routeModes(a, f) : Array.from({ length: a.points.length - 1 }, () => mode);
      a.modes = now.map((m, i) => (i === segment ? mode : m));
    }
    set(edit(s, plan));
  },
  setPause: (id, point, seconds) => {
    const s = get();
    const plan = clone(s.plan);
    const a = plan.arrows.find((x) => x.id === id);
    if (!a) return;
    const p = Array.from({ length: a.points.length }, (_, i) => a.pauses?.[i] ?? 0);
    p[point] = Math.max(0, Math.min(600, seconds || 0));
    a.pauses = p;
    set(edit(s, plan));
  },
  setProfile: (id, profile) => {
    const s = get();
    const plan = clone(s.plan);
    const f = plan.figures.find((x) => x.id === id);
    if (!f) return;
    if (profile) f.profile = profile;
    else delete f.profile;
    set(edit(s, plan));
  },
  setSpeedOverride: (id, mode, v) => {
    const s = get();
    const plan = clone(s.plan);
    const f = plan.figures.find((x) => x.id === id);
    if (!f) return;
    const sp = { ...(f.speeds ?? {}) };
    if (v && v > 0) sp[mode] = v;
    else delete sp[mode];
    if (Object.keys(sp).length) f.speeds = sp;
    else delete f.speeds;
    set(edit(s, plan));
  },
  setUnitsPerMetre: (k) => {
    const s = get();
    const plan = clone(s.plan);
    if (k && k > 0) plan.unitsPerMetre = k;
    else delete plan.unitsPerMetre;
    set(edit(s, plan));
  },
  setRealTime: (on) => {
    const s = get();
    const plan = clone(s.plan);
    if (on) delete plan.realTime;
    else plan.realTime = false;
    set(edit(s, plan));
  },
  startMove: () => set({ moving: !!get().selected, tool: 'select' }),
  undo: () => {
    const s = get();
    const prev = s.past[s.past.length - 1];
    if (!prev) return;
    set({ plan: prev, past: s.past.slice(0, -1), future: [s.plan, ...s.future], draft: null, dragBase: null, step: Math.min(s.step, prev.steps.length - 1) });
  },
  redo: () => {
    const s = get();
    const next = s.future[0];
    if (!next) return;
    set({ plan: next, past: [...s.past, s.plan], future: s.future.slice(1), draft: null, step: Math.min(s.step, next.steps.length - 1) });
  },
  play: (on) => {
    const s = get();
    if (on) {
      // From the start of the shown step.
      const before = stepStart(s.plan, s.step);
      set({ playing: true, playTime: before, draft: null });
    } else set({ playing: false });
  },
  setPlayTime: (t) => {
    const s = get();
    const at = playbackAt(s.plan, t);
    set({ playTime: Math.min(t, at.total), step: at.step, playing: s.playing && t < at.total });
  },
  load: (text, level) => {
    const s = get();
    const plan = readPlan(text);
    if (!plan.level) plan.level = level;
    set({ ...edit(s, plan), step: 0, selected: null, selection: [], draft: null, team: plan.teams[0].id });
  },
  clear: () => {
    const s = get();
    const preset = gamePreset(s.plan.game);
    set({ ...edit(s, emptyPlan(preset.id, preset.teams, s.plan.level)), step: 0, selected: null, selection: [], draft: null });
  },
}));

/** The arrow, area or note nearest a point, for the eraser. */
function nearestThing(plan: Plan, step: number, at: Vec3): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  const consider = (id: string, p: Vec3, reach: number) => {
    const d = Math.hypot(p.x - at.x, p.z - at.z);
    if (d < reach && d < bestD) {
      bestD = d;
      best = id;
    }
  };
  const w = gamePreset(plan.game).arrowWidth;
  for (const a of plan.arrows) if (a.step === step) for (const p of a.points) consider(a.id, p, w * 4);
  for (const a of plan.areas) if (a.step === step) consider(a.id, a.centre, a.radius);
  for (const n of plan.notes) if (n.step === step) consider(n.id, n.at, w * 4);
  return best;
}
