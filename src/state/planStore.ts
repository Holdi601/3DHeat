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
import { BASE_LAYER, editable, shown, emptyPlan, keyAt, layerOf, newId, onBoard, playbackAt, posesAt, readPlan, type ArrowStyle, type NoteShow, type Plan, type PlanDrawing, type PlanFigure, type PlanNote, type TrackChannel, type Vec3 } from '../tactics/plan';
import { aimAt, withKey } from '../tactics/keyframes';
import { parseThrow, projectileById, projectilesFor, solveThrow, throwKey, type ThrowMove } from '../tactics/ballistics';
import { templateOf } from '../tactics/scene';
import { applyOps, diffPlans, isOpBatch, type OpBatch } from '../tactics/ops';
import { loadAuthor, loadLocal, saveAuthor, saveLocal } from '../tactics/autosave';
import { gamePreset } from '../tactics/games';
import { CATALOG } from '../figures/catalog';
import { figureLabel } from '../tactics/names';
import { applyTransform, type GizmoMode, type Transform } from '../tactics/gizmo';
import type { Mode } from '../tactics/speeds';
import { routeModes, stepStart, unitsPerMetre } from '../tactics/timing';

export type BoardTool = 'select' | 'place' | 'waypoints' | 'throw' | 'area' | 'note' | 'draw' | 'erase' | 'measure';

/** The board's tools in toolbar order, with their keys: a digit each, and a letter where one is free of the camera's. */
export const BOARD_TOOLS: { id: BoardTool; digit: string; letter: string }[] = [
  { id: 'select', digit: '1', letter: 'V' },
  { id: 'place', digit: '2', letter: 'P' },
  { id: 'waypoints', digit: '3', letter: 'L' },
  { id: 'throw', digit: '4', letter: 'H' },
  { id: 'area', digit: '5', letter: 'O' },
  { id: 'note', digit: '6', letter: 'N' },
  { id: 'draw', digit: '7', letter: 'B' },
  { id: 'erase', digit: '8', letter: 'X' },
  { id: 'measure', digit: '9', letter: 'U' },
];

interface Draft {
  /** A route or arrow, a throw, an area, or a drawn circle. */
  kind: 'arrow' | 'throw' | 'area' | 'circle';
  style?: ArrowStyle;
  points: Vec3[];
  team: string;
  /** The figure a route starts at, when it was begun on one. */
  figure?: string;
  /** A group route: every figure that gets it, each from where it stands (`figure` is the first). */
  group?: string[];
}

/** A ruler on the board: points clicked with the Measure tool; `done` once finished, kept on screen until the next. */
export interface BoardMeasure {
  points: Vec3[];
  done: boolean;
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
  /** A group route keeps the group's shape (each figure offset from the clicked points), or sends all along the same points. */
  formation: boolean;
  measure: BoardMeasure | null;
  /** Moving a selected figure: the next click puts it there. */
  moving: boolean;
  playing: boolean;
  /** Playback time, seconds from the plan's start. */
  playTime: number;
  past: Plan[];
  future: Plan[];
  /** The layer new things go on. */
  activeLayer: string;
  /** Draw only the active layer's routes and arrows; the other shown layers' routes still play. */
  routesActiveOnly: boolean;
  /** Who this viewer's edits are signed with. */
  author: string;
  /** Every edit of this session as operations (`tactics/ops.ts`), oldest first; at most `LOG_KEEP`. */
  log: OpBatch[];
  /** Counts the batches, never reset: what a peer asks "since" in a shared session. */
  rev: number;
  /** The browser copy: when it was last written or read back, and whether it failed for want of room. */
  autosave: { at: string | null; restored: boolean; full: boolean };
  /** A moment of playback shown while paused (the time slider), seconds from the plan's start; null shows the step's start. */
  scrub: number | null;
  /** The next click on the board points the selected figure's turret (and gun), eyes or sensor there, keyed at the moment shown. */
  aiming: 'turret' | 'view' | 'sensor' | null;
  setScrub: (t: number | null) => void;
  /** A keyframe of a figure's channel at `t` (the moment shown when absent); null removes it. */
  setTrackKey: (figure: string, channel: TrackChannel, v: number | null, t?: number) => void;
  /** When a route is to be at one of its points, seconds from its step's start; null: by its modes. */
  setArrival: (arrow: string, point: number, seconds: number | null) => void;
  startAim: (what: 'turret' | 'view' | 'sensor' | null) => void;
  /** The Draw tool: what it draws, in which colour and width (metres; 0 the game's usual), shown in its step or in all. */
  drawStyle: { kind: PlanDrawing['kind']; color: [number, number, number]; width: number; always: boolean };
  /** A freehand stroke being drawn (the button is down). */
  stroke: Vec3[] | null;
  /** How the next note looks and when it shows. */
  noteStyle: { color: [number, number, number]; size: number; show: NoteShow; duration: number };
  /** How the Throw tool throws: the projectile (`tactics/throws.json`), the strength and how the thrower moves. */
  throwSpec: { projectile: string; strength: string; move: ThrowMove };
  setThrowSpec: (s: Partial<PlanState['throwSpec']>) => void;
  setDrawStyle: (s: Partial<PlanState['drawStyle']>) => void;
  setNoteStyle: (s: Partial<PlanState['noteStyle']>) => void;
  beginStroke: (at: Vec3) => void;
  extendStroke: (at: Vec3) => void;
  endStroke: () => void;
  /** A note's text, colour, size and when it shows. */
  setNote: (id: string, patch: Partial<Pick<PlanNote, 'text' | 'color' | 'size' | 'show' | 'start' | 'duration'>>) => void;
  setDrawing: (id: string, patch: Partial<Pick<PlanDrawing, 'color' | 'width' | 'always'>>) => void;

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
  /** Ends the route, arrow, area or ruler being drawn (Enter, double click, right click, Esc). */
  finish: () => void;
  /** Takes back the last point of what is being drawn (Backspace); drops it when only its start is left. */
  undoPoint: () => void;
  setFormation: (on: boolean) => void;
  cancel: () => void;
  /** Removes every selected thing in one undo step. */
  removeSelection: () => void;
  selectAll: () => void;
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

  addLayer: (name?: string) => string;
  renameLayer: (id: string, name: string) => void;
  setLayerVisible: (id: string, on: boolean) => void;
  setLayerLocked: (id: string, on: boolean) => void;
  setActiveLayer: (id: string) => void;
  /** Up (+1, over the next) or down (-1) the stack. */
  moveLayer: (id: string, by: -1 | 1) => void;
  /** A copy of a layer: its routes, areas, notes, drawings and figures, the routes of figures on other layers still theirs - an alternative plan for the same figures. */
  duplicateLayer: (id: string) => string | null;
  /** Removes a layer and what is on it (not the base layer). */
  removeLayer: (id: string) => void;
  moveSelectionToLayer: (id: string) => void;
  setRoutesActiveOnly: (on: boolean) => void;
  setAuthor: (name: string) => void;
  /** A batch from elsewhere (a peer, a file of operations): applied, logged, not undoable here. */
  applyRemote: (batch: OpBatch) => void;
}

/** Batches the session log keeps. */
export const LOG_KEEP = 2000;

/** The log entry for a change from one plan to the next; nothing when nothing changed. */
function logged(state: PlanState, from: Plan, to: Plan): Partial<PlanState> {
  if (from === to) return {};
  const ops = diffPlans(from, to);
  if (!ops.length) return {};
  const batch: OpBatch = { id: newId('o'), author: state.author || 'local', at: Date.now(), ops };
  return { log: [...(state.log.length >= LOG_KEEP ? state.log.slice(-LOG_KEEP + 1) : state.log), batch], rev: state.rev + 1 };
}

function edit(state: PlanState, next: Plan): Partial<PlanState> {
  return { plan: next, past: [...state.past.slice(-99), state.plan], future: [], ...logged(state, state.plan, next) };
}

/** The Draw tool's line width, plan units: its own, else half the game's arrow (wider for a highlighter). */
export function drawWidth(s: Pick<PlanState, 'drawStyle' | 'plan'>): number {
  const st = s.drawStyle;
  const metres = st.width > 0 ? st.width : gamePreset(s.plan.game).arrowWidth * (st.kind === 'highlight' ? 2 : 0.5);
  return metres * unitsPerMetre(s.plan);
}

/** What a new thing on the board carries for the layer it goes on. */
function onLayer(s: PlanState): { layer?: string } {
  return s.activeLayer !== BASE_LAYER && s.plan.layers.some((l) => l.id === s.activeLayer) ? { layer: s.activeLayer } : {};
}

/** Whether new things can go on the active layer (it is not locked). */
function canDraw(s: PlanState): boolean {
  return !s.plan.layers.find((l) => l.id === s.activeLayer)?.locked;
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
    // A figure on a locked layer still starts a route or a throw (on the active layer); a hidden one does not.
    if (!onBoard(f, step) || !shown(plan, f)) continue;
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
// The board as it was left, when the browser kept it (`tactics/autosave.ts`).
const restored = loadLocal();
const startPlan = restored?.plan ?? emptyPlan(first.id, first.teams);

export const usePlanStore = create<PlanState>((set, get) => ({
  plan: startPlan,
  tool: 'select',
  kind: 'soldier',
  team: startPlan.teams[0].id,
  activeLayer: BASE_LAYER,
  routesActiveOnly: false,
  author: loadAuthor(),
  log: [],
  rev: 0,
  autosave: { at: restored?.at ?? null, restored: !!restored, full: false },
  scrub: null,
  aiming: null,
  setScrub: (t) => {
    const s = get();
    if (t === null) {
      set({ scrub: null });
      return;
    }
    const at = playbackAt(s.plan, t);
    set({ scrub: Math.max(0, Math.min(at.total, t)), step: at.step, playing: false, draft: null });
  },
  setTrackKey: (id, channel, v, t) => {
    const s = get();
    const plan = clone(s.plan);
    const f = plan.figures.find((x) => x.id === id);
    if (!f) return;
    const tracks = withKey(f.tracks, channel, t ?? momentOf(s).time, v);
    if (tracks) f.tracks = tracks;
    else delete f.tracks;
    set(edit(s, plan));
  },
  setArrival: (id, point, seconds) => {
    const s = get();
    const plan = clone(s.plan);
    const a = plan.arrows.find((x) => x.id === id);
    if (!a || point < 1 || point >= a.points.length) return;
    const at = Array.from({ length: a.points.length }, (_, i) => a.at?.[i] ?? null);
    at[point] = seconds !== null && Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
    if (at.some((x) => x !== null)) a.at = at;
    else delete a.at;
    set(edit(s, plan));
  },
  startAim: (aiming) => set({ aiming: aiming && get().selected ? aiming : null, draft: null }),
  throwSpec: { projectile: projectilesFor(startPlan.game)[0].id, strength: projectilesFor(startPlan.game)[0].strengths[0].id, move: 'stand' },
  setThrowSpec: (p) => {
    const next = { ...get().throwSpec, ...p };
    const proj = projectileById(next.projectile);
    // A strength the projectile does not have becomes its first.
    if (proj && !proj.strengths.some((x) => x.id === next.strength)) next.strength = proj.strengths[0].id;
    set({ throwSpec: next });
  },
  drawStyle: { kind: 'stroke', color: [1, 0.85, 0.25], width: 0, always: false },
  stroke: null,
  noteStyle: { color: [1, 1, 1], size: 13, show: 'step', duration: 5 },
  setDrawStyle: (p) => set({ drawStyle: { ...get().drawStyle, ...p }, tool: 'draw', draft: null }),
  setNoteStyle: (p) => set({ noteStyle: { ...get().noteStyle, ...p } }),
  beginStroke: (at) => {
    const s = get();
    if (s.tool !== 'draw' || s.drawStyle.kind === 'circle' || !canDraw(s)) return;
    set({ stroke: [at], scrub: null });
  },
  extendStroke: (at) => {
    const s = get();
    if (!s.stroke) return;
    const last = s.stroke[s.stroke.length - 1];
    // A point every so often along the way, not one per pointer event.
    if (Math.hypot(at.x - last.x, at.z - last.z) < drawWidth(s) * 0.5) return;
    set({ stroke: [...s.stroke, at] });
  },
  endStroke: () => {
    const s = get();
    const pts = s.stroke;
    if (!pts) return;
    const plan = clone(s.plan);
    const st = s.drawStyle;
    plan.drawings.push({ id: newId('d'), step: s.step, kind: st.kind === 'highlight' ? 'highlight' : 'stroke', points: pts, color: st.color, width: drawWidth(s), ...(st.always ? { always: true } : {}), ...onLayer(s) });
    set({ ...edit(s, plan), stroke: null });
  },
  setNote: (id, patch) => {
    const s = get();
    const plan = clone(s.plan);
    const n = plan.notes.find((x) => x.id === id);
    if (!n) return;
    Object.assign(n, patch);
    if (n.show !== 'timed') {
      delete n.start;
      delete n.duration;
    } else {
      n.start = Math.max(0, n.start ?? momentOf(s).time);
      n.duration = Math.max(0.1, n.duration ?? s.noteStyle.duration);
    }
    if (n.show === 'step') delete n.show;
    set(edit(s, plan));
  },
  setDrawing: (id, patch) => {
    const s = get();
    const plan = clone(s.plan);
    const d = plan.drawings.find((x) => x.id === id);
    if (!d) return;
    Object.assign(d, patch);
    if (!d.always) delete d.always;
    set(edit(s, plan));
  },
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
  formation: true,
  measure: null,
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
    const proj = projectilesFor(preset.id)[0];
    set({ ...edit(s, plan), team: plan.teams[0].id, kind: preset.palette[0].items[0] ?? 'soldier', throwSpec: { projectile: proj.id, strength: proj.strengths[0].id, move: 'stand' } });
  },
  setTool: (tool) => {
    // A route half drawn is kept, not lost, when the tool changes.
    if (get().draft) get().finish();
    set({ tool, draft: null, moving: false, measure: tool === 'measure' ? get().measure : null });
  },
  setKind: (kind) => set({ kind, tool: 'place', draft: null }),
  setTeam: (team) => set({ team }),
  setArrowStyle: (arrowStyle) => set({ arrowStyle, tool: 'waypoints', draft: null }),
  setStep: (step) => set({ step: Math.max(0, Math.min(get().plan.steps.length - 1, step)), draft: null, playing: false, scrub: null }),
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
    plan.drawings = plan.drawings.filter((d) => d.always || d.step !== step).map((d) => (d.step > step ? { ...d, step: d.step - 1 } : d.step === step ? { ...d, step: Math.max(0, step - 1) } : d));
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
    set({ plan, ...logged(s, s.plan, plan) });
  },
  setTitle: (title) => {
    const s = get();
    const plan = { ...s.plan, title };
    set({ plan, ...logged(s, s.plan, plan) });
  },

  click: (at, ref, additive) => {
    const s = get();
    // Placing and drawing start from figures only.
    const hit = s.tool === 'select' || s.tool === 'erase' ? ref : ref && s.plan.figures.some((f) => f.id === ref) ? ref : null;
    const step = s.step;
    // Aiming: the selected figure's turret and gun, eyes or sensor at the clicked point, at the moment shown.
    if (s.aiming) {
      const f = s.plan.figures.find((x) => x.id === s.selected);
      const m = momentOf(s);
      const pose = f && posesAt(s.plan, m.step, m.u).get(f.id);
      if (f && pose) {
        const t = templateOf(f.kind);
        const eye = { x: pose.x, y: pose.y + (t ? t.max[1] * 0.8 * Math.max(0.05, s.plan.figureScale) : 1.6), z: pose.z };
        const aim = aimAt(eye, pose.yaw, at);
        const plan = clone(s.plan);
        const g = plan.figures.find((x) => x.id === f.id)!;
        const [ych, pch]: [TrackChannel, TrackChannel] = s.aiming === 'turret' ? ['turret', 'gun'] : s.aiming === 'view' ? ['viewYaw', 'viewPitch'] : ['sensorYaw', 'sensorPitch'];
        g.tracks = withKey(withKey(g.tracks, ych, m.time, aim.yaw), pch, m.time, aim.pitch);
        set({ ...edit(s, plan), aiming: null });
      } else set({ aiming: null });
      return;
    }
    // Drawing works on the step's start: a moment shown from the time slider gives way to it.
    if (s.scrub !== null && s.tool !== 'select' && s.tool !== 'measure') set({ scrub: null });
    // Nothing new goes on a locked layer.
    if ((s.tool === 'place' || s.tool === 'waypoints' || s.tool === 'throw' || s.tool === 'area' || s.tool === 'note' || s.tool === 'draw') && !canDraw(s)) return;
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
        plan.figures.push({ id, kind: s.kind, team: s.team, label: `${figureLabel(s.kind)} ${n}`, keys: { [step]: { ...at, yaw: s.yaw } }, from: step, ...onLayer(s) });
        set({ ...edit(s, plan), selected: id, selection: [id] });
        return;
      }
      case 'waypoints':
      case 'throw': {
        if (!s.draft) {
          const kind = s.tool === 'throw' ? 'throw' : 'arrow';
          const style = s.tool === 'throw' ? 'throw' : s.arrowStyle;
          // Several figures selected and the click on one of them, or off every figure: one route for the group.
          const group = s.tool === 'waypoints' && style === 'move' ? movableSelection(s.plan, step, s.selection) : [];
          if (group.length > 1 && (!hit || group.includes(hit))) {
            const keys = group.map((id) => keyAt(s.plan.figures.find((f) => f.id === id)!, step)!);
            const c = keys.reduce((a, k) => ({ x: a.x + k.x / keys.length, y: a.y + k.y / keys.length, z: a.z + k.z / keys.length }), { x: 0, y: 0, z: 0 });
            const lead = s.plan.figures.find((f) => f.id === group[0])!;
            set({ draft: { kind, style, points: [c], team: lead.team, figure: group[0], group } });
            return;
          }
          // Begun on a figure: the arrow starts at it and becomes its route (or its throw).
          const f = hit ? s.plan.figures.find((x) => x.id === hit) : null;
          const k = f ? keyAt(f, step) : null;
          const start = k ? { x: k.x, y: k.y, z: k.z } : at;
          set({ draft: { kind, style, points: [start], team: f?.team ?? s.team, figure: f?.id } });
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
        const ns = s.noteStyle;
        const white = ns.color.every((c) => c >= 0.999);
        plan.notes.push({
          id: newId('n'),
          step,
          at,
          text,
          ...(white ? {} : { color: ns.color }),
          ...(ns.size !== 13 ? { size: ns.size } : {}),
          ...(ns.show !== 'step' ? { show: ns.show } : {}),
          ...(ns.show === 'timed' ? { start: momentOf(s).time, duration: ns.duration } : {}),
          ...onLayer(s),
        });
        set(edit(s, plan));
        return;
      }
      case 'erase': {
        const f = hit ? s.plan.figures.find((x) => x.id === hit) : undefined;
        const id = (f && !editable(s.plan, f) ? null : hit) ?? nearestThing(s.plan, step, at);
        if (id) get().remove(id);
        return;
      }
      case 'measure': {
        const m = s.measure;
        if (!m || m.done) {
          set({ measure: { points: [at], done: false } });
          return;
        }
        const last = m.points[m.points.length - 1];
        if (Math.hypot(at.x - last.x, at.y - last.y, at.z - last.z) < 1e-3) return;
        set({ measure: { points: [...m.points, at], done: false } });
        return;
      }
      case 'draw': {
        // Freehand strokes come from a drag (`beginStroke`); a click draws a circle: the middle, then the edge.
        if (s.drawStyle.kind !== 'circle') return;
        if (!s.draft) {
          set({ draft: { kind: 'circle', points: [at], team: s.team } });
          return;
        }
        set({ draft: { ...s.draft, points: [s.draft.points[0], at] } });
        get().finish();
        return;
      }
    }
  },

  finish: () => {
    const s = get();
    if (s.tool === 'measure' && s.measure && !s.measure.done) {
      set({ measure: s.measure.points.length >= 2 ? { ...s.measure, done: true } : null });
      return;
    }
    const d = s.draft;
    if (!d) return;
    const plan = clone(s.plan);
    if (d.group && d.points.length >= 2) {
      // Each figure of the group its own route: from where it stands, through
      // the clicked points (offset by where it stood in the group, to keep the
      // shape), replacing its route in this step.
      const c = d.points[0];
      for (const fid of d.group) {
        const f = plan.figures.find((x) => x.id === fid);
        const k = f && keyAt(f, s.step);
        if (!f || !k) continue;
        const off = s.formation ? { x: k.x - c.x, z: k.z - c.z } : { x: 0, z: 0 };
        const points = [{ x: k.x, y: k.y, z: k.z }, ...d.points.slice(1).map((p) => ({ x: p.x + off.x, y: p.y, z: p.z + off.z }))];
        plan.arrows = plan.arrows.filter((a) => !(a.step === s.step && a.figure === fid && a.style === 'move' && layerOf(a) === s.activeLayer));
        plan.arrows.push({ id: newId('r'), step: s.step, team: f.team, style: 'move', points, figure: fid, ...onLayer(s) });
      }
      set({ ...edit(s, plan), draft: null });
      return;
    }
    if (d.kind === 'circle' && d.points.length >= 2) {
      const st = s.drawStyle;
      plan.drawings.push({ id: newId('d'), step: s.step, kind: 'circle', points: d.points.slice(0, 2), color: st.color, width: drawWidth(s), ...(st.always ? { always: true } : {}), ...onLayer(s) });
    } else if (d.kind === 'area' && d.points.length >= 2) {
      const [c, e] = d.points;
      plan.areas.push({ id: newId('a'), step: s.step, team: d.team, centre: c, radius: Math.max(0.5, Math.hypot(e.x - c.x, e.z - c.z)), label: '', ...onLayer(s) });
    } else if (d.kind !== 'area' && d.kind !== 'circle' && d.points.length >= 2) {
      const id = newId('r');
      const arrow = { id, step: s.step, team: d.team, style: d.style ?? 'move', points: d.points, ...(d.figure ? { figure: d.figure } : {}), ...onLayer(s) } as Plan['arrows'][number];
      if (d.kind === 'throw') {
        // No further than the game's physics carry it: a landing past the reach comes in to its edge.
        const ts = s.throwSpec;
        const spec = parseThrow(throwKey(ts.projectile, ts.strength, ts.move));
        if (spec) {
          const upm = unitsPerMetre(plan);
          const m = (p: Vec3) => ({ x: p.x / upm, y: p.y / upm, z: p.z / upm });
          const r = solveThrow(spec, m(d.points[0]), m(d.points[d.points.length - 1]));
          if (!r.reachable) {
            const l = { x: r.landing.x * upm, y: d.points[d.points.length - 1].y, z: r.landing.z * upm };
            arrow.points = [d.points[0], l];
          }
          arrow.weapon = throwKey(ts.projectile, ts.strength, ts.move);
        }
        // The utility lands at the end and stays from this step on.
        const kind = CATALOG[s.kind]?.domain === 'marker' ? s.kind : 'cs2-smoke';
        const lands = newId('f');
        const end = arrow.points[arrow.points.length - 1];
        plan.figures.push({ id: lands, kind, team: d.team, label: figureLabel(kind), keys: { [s.step]: { ...end, yaw: 0 } }, from: s.step, ...onLayer(s) });
        arrow.lands = lands;
      }
      // A figure's new route replaces its old one in this step on this layer (another layer's is an alternative).
      if (arrow.figure && arrow.style === 'move') plan.arrows = plan.arrows.filter((a) => !(a.step === s.step && a.figure === arrow.figure && a.style === 'move' && layerOf(a) === s.activeLayer));
      plan.arrows.push(arrow);
    } else {
      set({ draft: null });
      return;
    }
    set({ ...edit(s, plan), draft: null });
  },
  undoPoint: () => {
    const s = get();
    if (s.tool === 'measure' && s.measure && !s.measure.done) {
      set({ measure: s.measure.points.length > 1 ? { ...s.measure, points: s.measure.points.slice(0, -1) } : null });
      return;
    }
    if (!s.draft) return;
    set({ draft: s.draft.points.length > 1 ? { ...s.draft, points: s.draft.points.slice(0, -1) } : null });
  },
  setFormation: (formation) => set({ formation }),
  cancel: () => set({ draft: null, moving: false, measure: null }),
  removeSelection: () => {
    const s = get();
    if (!s.selection.length) return;
    const start = s.plan;
    // Whole things first; a point of an arrow removed with it is gone already.
    const whole = s.selection.filter((r) => !r.includes('#'));
    const points = s.selection.filter((r) => r.includes('#')).sort((a, b) => Number(b.split('#')[1]) - Number(a.split('#')[1]));
    for (const r of [...whole, ...points]) get().remove(r);
    // One undo step for the lot.
    const after = get();
    if (after.plan !== start) set({ past: [...s.past.slice(-99), start], future: [], selection: [], selected: null });
  },
  selectAll: () => {
    const s = get();
    const p = s.plan;
    const ok = (e: { layer?: string }) => editable(p, e);
    const refs = [
      ...p.figures.filter((f) => onBoard(f, s.step) && ok(f)).map((f) => f.id),
      ...p.arrows.filter((a) => a.step === s.step && ok(a)).map((a) => a.id),
      ...p.areas.filter((a) => a.step === s.step && ok(a)).map((a) => a.id),
      ...p.notes.filter((n) => n.step === s.step && ok(n)).map((n) => n.id),
      ...(p.drawings ?? []).filter((x) => (x.always || x.step === s.step) && ok(x)).map((x) => x.id),
    ];
    set({ selection: refs, selected: refs[refs.length - 1] ?? null, tool: 'select', draft: null });
  },
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
    plan.drawings = plan.drawings.filter((d) => d.id !== id);
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
    if (s.dragBase !== s.plan) set({ past: [...s.past.slice(-99), s.dragBase], future: [], ...logged(s, s.dragBase, s.plan) });
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
    set({ plan: prev, past: s.past.slice(0, -1), future: [s.plan, ...s.future], draft: null, dragBase: null, step: Math.min(s.step, prev.steps.length - 1), ...logged(s, s.plan, prev) });
  },
  redo: () => {
    const s = get();
    const next = s.future[0];
    if (!next) return;
    set({ plan: next, past: [...s.past, s.plan], future: s.future.slice(1), draft: null, step: Math.min(s.step, next.steps.length - 1), ...logged(s, s.plan, next) });
  },
  play: (on) => {
    const s = get();
    if (on) {
      // From the moment on the time slider, else from the start of the shown step.
      const before = s.scrub ?? stepStart(s.plan, s.step);
      set({ playing: true, playTime: before, draft: null, scrub: null });
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
    set({ ...edit(s, plan), step: 0, selected: null, selection: [], draft: null, team: plan.teams[0].id, activeLayer: BASE_LAYER });
  },
  clear: () => {
    const s = get();
    const preset = gamePreset(s.plan.game);
    set({ ...edit(s, emptyPlan(preset.id, preset.teams, s.plan.level)), step: 0, selected: null, selection: [], draft: null, activeLayer: BASE_LAYER });
  },

  addLayer: (name) => {
    const s = get();
    const plan = clone(s.plan);
    const id = newId('l');
    plan.layers.push({ id, name: name || `Layer ${plan.layers.length + 1}`, visible: true, locked: false });
    set({ ...edit(s, plan), activeLayer: id });
    return id;
  },
  renameLayer: (id, name) => {
    const s = get();
    const plan = clone(s.plan);
    const l = plan.layers.find((x) => x.id === id);
    if (!l || !name.trim() || l.name === name.trim()) return;
    l.name = name.trim();
    set(edit(s, plan));
  },
  setLayerVisible: (id, on) => layerFlag(id, 'visible', on),
  setLayerLocked: (id, on) => layerFlag(id, 'locked', on),
  setActiveLayer: (id) => {
    const s = get();
    const l = s.plan.layers.find((x) => x.id === id);
    if (!l) return;
    set({ activeLayer: id, draft: null });
    // The layer drawn on is shown.
    if (!l.visible) get().setLayerVisible(id, true);
  },
  moveLayer: (id, by) => {
    const s = get();
    const plan = clone(s.plan);
    const i = plan.layers.findIndex((l) => l.id === id);
    const j = i + by;
    // The base layer stays at the bottom.
    if (i <= 0 || j <= 0 || j >= plan.layers.length) return;
    [plan.layers[i], plan.layers[j]] = [plan.layers[j], plan.layers[i]];
    set(edit(s, plan));
  },
  duplicateLayer: (id) => {
    const s = get();
    const plan = clone(s.plan);
    const src = plan.layers.find((l) => l.id === id);
    if (!src) return null;
    const nid = newId('l');
    plan.layers.splice(plan.layers.indexOf(src) + 1, 0, { id: nid, name: `${src.name} (2)`, visible: true, locked: false });
    const on = (e: { layer?: string }) => layerOf(e) === id;
    // Figures on the layer are copied; routes of figures on other layers stay theirs.
    const figureIds = new Map<string, string>();
    for (const f of plan.figures.filter(on)) {
      const nf = { ...structuredClone(f), id: newId('f'), layer: nid };
      figureIds.set(f.id, nf.id);
      plan.figures.push(nf);
    }
    for (const a of plan.arrows.filter(on)) {
      plan.arrows.push({ ...structuredClone(a), id: newId('r'), layer: nid, ...(a.figure ? { figure: figureIds.get(a.figure) ?? a.figure } : {}), ...(a.lands ? { lands: figureIds.get(a.lands) ?? a.lands } : {}) });
    }
    for (const a of plan.areas.filter(on)) plan.areas.push({ ...structuredClone(a), id: newId('a'), layer: nid });
    for (const n of plan.notes.filter(on)) plan.notes.push({ ...structuredClone(n), id: newId('n'), layer: nid });
    for (const x of plan.drawings.filter(on)) plan.drawings.push({ ...structuredClone(x), id: newId('d'), layer: nid });
    // The copy is the one worked on: the original hidden, so its routes do not play under it.
    src.visible = false;
    set({ ...edit(s, plan), activeLayer: nid, selection: [], selected: null });
    return nid;
  },
  removeLayer: (id) => {
    const s = get();
    if (id === BASE_LAYER || !s.plan.layers.some((l) => l.id === id)) return;
    const plan = clone(s.plan);
    const on = (e: { layer?: string }) => layerOf(e) === id;
    const gone = new Set(plan.figures.filter(on).map((f) => f.id));
    plan.layers = plan.layers.filter((l) => l.id !== id);
    plan.figures = plan.figures.filter((f) => !on(f));
    plan.arrows = plan.arrows.filter((a) => !on(a) && !(a.figure && gone.has(a.figure)) && !(a.lands && gone.has(a.lands)));
    plan.areas = plan.areas.filter((a) => !on(a));
    plan.notes = plan.notes.filter((n) => !on(n));
    plan.drawings = plan.drawings.filter((x) => !on(x));
    set({ ...edit(s, plan), activeLayer: s.activeLayer === id ? BASE_LAYER : s.activeLayer, selection: [], selected: null });
  },
  moveSelectionToLayer: (id) => {
    const s = get();
    if (!s.plan.layers.some((l) => l.id === id) || !s.selection.length) return;
    const plan = clone(s.plan);
    const ids = new Set(s.selection.map((r) => r.split('#')[0]));
    for (const coll of [plan.figures, plan.arrows, plan.areas, plan.notes, plan.drawings] as { id: string; layer?: string }[][]) {
      for (const e of coll) {
        if (!ids.has(e.id)) continue;
        if (id === BASE_LAYER) delete e.layer;
        else e.layer = id;
      }
    }
    set(edit(s, plan));
  },
  setRoutesActiveOnly: (routesActiveOnly) => set({ routesActiveOnly }),
  setAuthor: (author) => {
    saveAuthor(author);
    set({ author });
  },
  applyRemote: (batch) => {
    const s = get();
    if (!isOpBatch(batch) || s.log.some((b) => b.id === batch.id)) return;
    const plan = applyOps(s.plan, batch.ops);
    set({
      plan,
      log: [...(s.log.length >= LOG_KEEP ? s.log.slice(-LOG_KEEP + 1) : s.log), batch],
      rev: s.rev + 1,
      step: Math.min(s.step, Math.max(0, plan.steps.length - 1)),
      activeLayer: plan.layers.some((l) => l.id === s.activeLayer) ? s.activeLayer : BASE_LAYER,
    });
  },
}));

/**
 * The moment the board shows: while playing, the playback time (`engineTime`
 * when the engine's clock is newer than the store's); paused on the time
 * slider, that moment; else the start of the shown step.
 */
export function momentOf(s: Pick<PlanState, 'plan' | 'playing' | 'playTime' | 'scrub' | 'step'>, engineTime?: number | null): { step: number; u: number; time: number } {
  const t = s.playing ? (engineTime ?? s.playTime) : s.scrub;
  if (t !== null && t !== undefined) {
    const at = playbackAt(s.plan, t);
    return { step: at.step, u: at.u, time: Math.min(t, at.total) };
  }
  return { step: s.step, u: 0, time: stepStart(s.plan, s.step) };
}

/** Shows or hides, locks or unlocks a layer; what can no longer be changed leaves the selection. */
function layerFlag(id: string, flag: 'visible' | 'locked', on: boolean): void {
  const s = usePlanStore.getState();
  const plan = clone(s.plan);
  const l = plan.layers.find((x) => x.id === id);
  if (!l || l[flag] === on) return;
  l[flag] = on;
  const keep = s.selection.filter((r) => {
    const e = entityOf(plan, r.split('#')[0]);
    return !e || editable(plan, e);
  });
  usePlanStore.setState({ ...edit(s, plan), selection: keep, selected: keep[keep.length - 1] ?? null });
}

/** A figure, arrow, area, note or drawing by id. */
export function entityOf(plan: Plan, id: string): { id: string; layer?: string } | undefined {
  return plan.figures.find((x) => x.id === id) ?? plan.arrows.find((x) => x.id === id) ?? plan.areas.find((x) => x.id === id) ?? plan.notes.find((x) => x.id === id) ?? plan.drawings?.find((x) => x.id === id);
}

// The browser copy (`tactics/autosave.ts`): written a moment after the plan last changed, never on the frame path.
let saveTimer: ReturnType<typeof setTimeout> | null = null;
usePlanStore.subscribe((s, prev) => {
  if (s.plan === prev.plan || s.dragBase) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const st = usePlanStore.getState();
    const r = saveLocal(st.plan);
    if (r !== 'off') usePlanStore.setState({ autosave: { at: r === 'ok' ? new Date().toISOString() : st.autosave.at, restored: false, full: r === 'full' } });
  }, 800);
});

// Handle for the board's smoke test (tools/smoke-tactics.mjs); dev only.
if (import.meta.env?.DEV && typeof window !== 'undefined') (window as unknown as Record<string, unknown>).__3dheat_plan = usePlanStore;

/** The selected figures that move by themselves and stand on the board in `step`: who a group route is for. */
export function movableSelection(plan: Plan, step: number, selection: string[]): string[] {
  return selection.filter((id) => {
    const f = plan.figures.find((x) => x.id === id);
    return !!f && onBoard(f, step) && !!keyAt(f, step) && CATALOG[f.kind]?.domain !== 'marker' && CATALOG[f.kind]?.domain !== 'missile';
  });
}

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
  const ok = (e: { layer?: string }) => editable(plan, e);
  for (const a of plan.arrows) if (a.step === step && ok(a)) for (const p of a.points) consider(a.id, p, w * 4);
  for (const a of plan.areas) if (a.step === step && ok(a)) consider(a.id, a.centre, a.radius);
  for (const n of plan.notes) if (n.step === step && ok(n)) consider(n.id, n.at, w * 4);
  for (const d of plan.drawings ?? []) if ((d.always || d.step === step) && ok(d)) for (const p of d.points) consider(d.id, p, Math.max(w * 2, d.width * 3));
  return best;
}
