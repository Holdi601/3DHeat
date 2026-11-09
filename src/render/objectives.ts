/**
 * The battles' objectives drawn on the level, with the trails: capture zones
 * as rings on the ground in their owner's colour, faintly filled, with a
 * progress ring that fills with a capture under way; spawns as rings at each
 * spawn point in their team's colour; airfields, helipads and bases as
 * markers; battle, kill and exit areas as outlines; bombing targets as
 * crossed rings. Which battles: the ones played or picked (`objectiveSources`).
 *
 * The shapes follow the ground: every point is laid on the level's surface
 * (from above, so on what is there - a roof, a bridge), once per battle and
 * level, a slice a frame (`data/slices.ts`); a spawn high above it (an
 * aircraft's) stays at its own height. Each frame then only colours them by
 * the zones' state at the playhead and copies them out: a few thousand
 * vertices.
 *
 * The labels (a zone's letter, a spawn's count, what a marker is) are the
 * page's (`ui/match/ObjectiveLabels.tsx`), from `labels`.
 */

import type { Dataset, FilterSpec } from '../state/types';
import type { GameMatch } from '../match/wtMatch';
import { matchesOf, pickedMatches } from '../match/matches';
import { SOURCE_COLUMN } from '../data/builder';
import { toWorld, zoneAt, type Objective, type ObjectiveLayer, type ObjectiveTimeline, type Vec3 } from '../match/objectives';
import { runSlice, WAIT, type SliceJob } from '../data/slices';

/** One battle's objectives and where its replay seconds are on the dataset's clock. */
export interface ObjectiveSource {
  match: string;
  objectives: Objective[];
  timeline: ObjectiveTimeline | null;
  /** Replay seconds = dataset seconds + offset. */
  offset: number;
}

/** A label to place over the view. */
export interface ObjectiveLabel {
  x: number;
  y: number;
  z: number;
  kind: 'zone' | 'spawn' | 'airfield' | 'helipad' | 'base' | 'target';
  text: string;
  /** Its colour, 0..1. */
  rgb: [number, number, number];
  /** Higher first when labels would cover each other. */
  priority: number;
}

/** The shapes of one objective, laid on the ground. */
interface Placed {
  o: Objective;
  match: string;
  /** Where its label goes. */
  anchor: Vec3;
  /** Its outlines, each a closed (or, `open`, an open) run of points. */
  outlines: { pts: Float32Array; closed: boolean }[];
  /** A zone's inner rings, the faint fill. */
  fill: Float32Array[];
  /** A zone's progress ring: points round from north, the first again at the end. */
  ring: Float32Array[] | null;
}

/** Points round a circle. */
const CIRCLE = 72;
/** Points round a small ring (a spawn point's). */
const SMALL = 14;
/** Above the ground, so the lines are not lost in it. */
const LIFT = 1.2;
/** A spawn this far above the ground is in the air: drawn at its height. */
const AIRBORNE = 60;
/** Longest straight piece of an outline before it is laid on the ground again. */
const STEP = 20;

const NEUTRAL: [number, number, number] = [0.86, 0.86, 0.82];
const AREA: [number, number, number] = [0.92, 0.9, 0.62];
const TARGET: [number, number, number] = [1, 0.58, 0.16];

/** The ground's height under a point; null where there is none (no level, nothing below). */
export type GroundAt = (x: number, z: number) => number | null;

/**
 * The battles to draw: those the replay plays or the heat shows (the picked
 * matches), with their objectives; the summaries without any left out.
 */
export function objectiveSources(
  d: Dataset | null,
  games: GameMatch[],
  timelines: Record<string, ObjectiveTimeline>,
  filters: FilterSpec[],
  session: number,
): ObjectiveSource[] {
  const withObjectives = games.filter((g) => g.objectives && g.objectives.length);
  if (!withObjectives.length) return [];
  const offset = d && d.epochMs === null ? (d.timeOrigin ?? 0) : 0;
  let shown = withObjectives;
  if (d) {
    const set = matchesOf(d);
    if (set.via !== 'whole') {
      const picked = pickedMatches(set, filters, session);
      const ids = set.entries.filter((e) => picked === null || picked.includes(e.index)).map((e) => e.id);
      shown = withObjectives.filter((g) => ids.some((id) => id === g.match || id.startsWith(g.match)));
    } else {
      const id = set.entries[0]?.id ?? '';
      const one = withObjectives.filter((g) => id === g.match || id.startsWith(g.match));
      if (one.length) shown = one;
    }
  }
  // The heat's filter by file (the mode picked, `ObjectivesPanel`): its battles only.
  const byFile = d ? filters.find((f) => f.kind === 'categories' && f.column === SOURCE_COLUMN) : undefined;
  if (d && byFile && byFile.kind === 'categories') {
    const labels = d.attrs.find((a) => a.name === SOURCE_COLUMN)?.categories ?? [];
    const allowed = byFile.allowed.map((i) => labels[i] ?? '');
    shown = shown.filter((g) => allowed.some((l) => l.startsWith(g.match)));
  }
  return shown.map((g) => ({
    match: g.match,
    objectives: g.objectives!,
    timeline: timelines[g.match] ?? null,
    offset,
  }));
}

/** The zone states the picture depends on at `t` (dataset seconds), as a key: it changes only when a zone does. */
export function stateKey(sources: ObjectiveSource[], t: number): string {
  if (sources.length !== 1) return '';
  const s = sources[0];
  if (!s.timeline) return '';
  let key = '';
  for (const [zone, tl] of s.timeline.zones) {
    const z = zoneAt(tl, t + s.offset);
    key += `${zone}${z.owner}:${z.progress};`;
  }
  return key;
}

function ring(cx: number, cy: number, cz: number, r: number, n: number, ground: GroundAt | null, lift: number): Float32Array {
  const out = new Float32Array((n + 1) * 3);
  for (let i = 0; i <= n; i++) {
    // From north, clockwise as a map is read.
    const a = (i / n) * Math.PI * 2;
    const x = cx + Math.sin(a) * r;
    const z = cz - Math.cos(a) * r;
    const g = ground ? ground(x, z) : null;
    out[i * 3] = x;
    out[i * 3 + 1] = (g ?? cy) + lift;
    out[i * 3 + 2] = z;
  }
  return out;
}

/** A run of corners laid on the ground, a point every `STEP` at most. */
function path(corners: Vec3[], closed: boolean, ground: GroundAt | null, lift: number): Float32Array {
  const pts: number[] = [];
  const n = corners.length;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[2] - a[2]);
    const k = Math.max(1, Math.ceil(len / STEP));
    for (let j = 0; j < k; j++) {
      const f = j / k;
      const x = a[0] + (b[0] - a[0]) * f;
      const z = a[2] + (b[2] - a[2]) * f;
      const y = a[1] + (b[1] - a[1]) * f;
      const g = ground ? ground(x, z) : null;
      pts.push(x, (g ?? y) + lift, z);
    }
  }
  const end = closed ? corners[0] : corners[n - 1];
  const g = ground ? ground(end[0], end[2]) : null;
  pts.push(end[0], (g ?? end[1]) + lift, end[2]);
  return Float32Array.from(pts);
}

/** Lays one battle's objectives on the ground, yielding now and then. */
function* place(sources: ObjectiveSource[], axes: Dataset['axes'] | null, ground: GroundAt | null, ready: () => boolean): SliceJob<Placed[]> {
  // The level's surface is indexed a slice a frame too: until it is, nothing is laid.
  if (ground) while (!ready()) yield WAIT;
  const out: Placed[] = [];
  const seen = new Set<string>();
  const scale = axes?.scale || 1;
  for (const src of sources) {
    for (const o of src.objectives) {
      const key = `${o.type}|${o.name}|${Math.round(o.position[0])}|${Math.round(o.position[2])}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const c = toWorld(o.position, axes);
      const g0 = ground ? ground(c[0], c[2]) : null;
      // An air spawn (or anything else far above the ground) is drawn where it is.
      const air = g0 !== null && c[1] - g0 > AIRBORNE * scale && o.layer === 'spawns';
      const gr = air ? null : ground;
      const baseY = air || g0 === null ? c[1] : g0;
      const lift = LIFT * scale;
      const r = o.radius * scale;
      const p: Placed = {
        o,
        match: src.match,
        anchor: [c[0], baseY + lift, c[2]],
        outlines: [],
        fill: [],
        ring: null,
      };
      if (o.shape === 'points' && o.points.length) {
        const seenPt = new Set<string>();
        for (const q of o.points) {
          const k = `${Math.round(q[0])},${Math.round(q[2])}`;
          if (seenPt.has(k)) continue;
          seenPt.add(k);
          const w = toWorld(q, axes);
          p.outlines.push({
            pts: ring(w[0], w[1], w[2], Math.max(4 * scale, Math.min(r || 10 * scale, 25 * scale)), SMALL, gr, lift),
            closed: true,
          });
        }
        // The label over the middle of them.
        let sx = 0;
        let sz = 0;
        for (const q of o.points) {
          const w = toWorld(q, axes);
          sx += w[0] / o.points.length;
          sz += w[2] / o.points.length;
        }
        const gy = gr ? gr(sx, sz) : null;
        p.anchor = [sx, (gy ?? baseY) + lift, sz];
      } else if (o.shape === 'outline' && o.points.length > 1) {
        p.outlines.push({
          pts: path(
            o.points.map((q) => toWorld(q, axes)),
            true,
            gr,
            lift,
          ),
          closed: true,
        });
      } else if (o.shape === 'box' && o.size) {
        // Its corners in the data's own frame, turned by its heading, then into the world.
        const hx = o.size[0] / 2;
        const hz = o.size[2] / 2;
        const h = (o.heading * Math.PI) / 180;
        const cs = Math.cos(h);
        const sn = Math.sin(h);
        const corners = [
          [-hx, -hz],
          [hx, -hz],
          [hx, hz],
          [-hx, hz],
        ].map(([x, z]) => toWorld([o.position[0] + x * cs - z * sn, o.position[1], o.position[2] + x * sn + z * cs], axes));
        p.outlines.push({ pts: path(corners, true, gr, lift), closed: true });
      } else if (r > 0) {
        const n = r > 400 * scale ? CIRCLE * 2 : CIRCLE;
        p.outlines.push({
          pts: ring(c[0], baseY, c[2], r, n, gr, lift),
          closed: true,
        });
        if (o.layer === 'zones') {
          // A heavier edge, a faint fill, and the progress ring inside it.
          p.outlines.push({
            pts: ring(c[0], baseY, c[2], Math.max(0, r - 0.8 * scale), n, gr, lift),
            closed: true,
          });
          for (const f of [0.2, 0.38, 0.56]) p.fill.push(ring(c[0], baseY, c[2], r * f, Math.max(24, Math.round(n * f)), gr, lift));
          p.ring = [0.78, 0.8, 0.82, 0.84].map((f) => ring(c[0], baseY, c[2], r * f, n, gr, lift));
        }
        if (o.layer === 'targets') {
          p.outlines.push({
            pts: path(
              [
                toWorld([o.position[0] - o.radius, o.position[1], o.position[2]], axes),
                toWorld([o.position[0] + o.radius, o.position[1], o.position[2]], axes),
              ],
              false,
              gr,
              lift,
            ),
            closed: false,
          });
          p.outlines.push({
            pts: path(
              [
                toWorld([o.position[0], o.position[1], o.position[2] - o.radius], axes),
                toWorld([o.position[0], o.position[1], o.position[2] + o.radius], axes),
              ],
              false,
              gr,
              lift,
            ),
            closed: false,
          });
        }
      } else {
        // A marker: a diamond of its own size (an airfield's bigger than a helipad's).
        const m = (o.type === 'airfield' ? 90 : o.type === 'base' ? 60 : 25) * scale;
        const corners: Vec3[] = [
          [c[0], baseY, c[2] - m],
          [c[0] + m, baseY, c[2]],
          [c[0], baseY, c[2] + m],
          [c[0] - m, baseY, c[2]],
        ];
        p.outlines.push({ pts: path(corners, true, gr, lift), closed: true });
        p.outlines.push({
          pts: path(
            corners.map((q) => [c[0] + (q[0] - c[0]) * 0.5, q[1], c[2] + (q[2] - c[2]) * 0.5] as Vec3),
            true,
            gr,
            lift,
          ),
          closed: true,
        });
      }
      out.push(p);
      yield;
    }
  }
  return out;
}

/** Appends the line pieces of a run of points (xyz) to `out` from vertex `v`; the vertex count after. */
function appendRun(out: Float32Array, v: number, pts: Float32Array, count: number, rgb: readonly number[], a: number): number {
  for (let i = 0; i + 1 < count; i++) {
    let o = v * 7;
    for (const j of [i, i + 1]) {
      out[o++] = pts[j * 3];
      out[o++] = pts[j * 3 + 1];
      out[o++] = pts[j * 3 + 2];
      out[o++] = rgb[0];
      out[o++] = rgb[1];
      out[o++] = rgb[2];
      out[o++] = a;
    }
    v += 2;
  }
  return v;
}

export interface ObjectiveFrame {
  sources: ObjectiveSource[];
  axes: Dataset['axes'] | null;
  layers: Record<ObjectiveLayer, boolean>;
  /** Dataset seconds. */
  t: number;
  /** A replay team's colour (1, 2). */
  teamColor: (team: number) => [number, number, number];
  ground: GroundAt | null;
  /** Whether the ground can be asked yet (the level's surface is indexed). */
  ready: () => boolean;
  /** Something that makes the ground ask again: the level, the axes. */
  groundKey: unknown;
}

/** The objectives' lines, kept between frames. */
export class ObjectiveLayerDraw {
  private key: unknown[] = [];
  private job: SliceJob<Placed[]> | null = null;
  private placed: Placed[] | null = null;
  private buf = new Float32Array(0);
  labels: ObjectiveLabel[] = [];
  /** Whether the shapes are still being laid on the ground. */
  get pending(): boolean {
    return this.job !== null;
  }
  /** Bumped when the labels change. */
  rev = 0;

  /**
   * The objectives' lines appended to `base` (its first `baseCount`
   * vertices, seven floats each); `base` itself when there is nothing to add.
   */
  build(f: ObjectiveFrame, base: Float32Array | null, baseCount: number): { data: Float32Array | null; count: number } {
    const key = [f.groundKey, f.axes, ...f.sources.map((s) => s.objectives)];
    if (key.length !== this.key.length || key.some((k, i) => k !== this.key[i])) {
      this.key = key;
      this.placed = null;
      this.job = f.sources.length ? place(f.sources, f.axes, f.ground, f.ready) : null;
    }
    if (this.job) {
      const r = runSlice(this.job);
      if (r) {
        this.placed = r.value;
        this.job = null;
      }
    }
    const placed = this.placed ?? [];
    const one = f.sources.length === 1 ? f.sources[0] : null;
    // Room for every point twice, as line pieces, plus what is there.
    let need = baseCount;
    for (const p of placed) {
      if (!f.layers[p.o.layer]) continue;
      for (const o of p.outlines) need += (o.pts.length / 3) * 2;
      for (const r of p.fill) need += (r.length / 3) * 2;
      if (p.ring) for (const r of p.ring) need += (r.length / 3) * 2;
    }
    const labels: ObjectiveLabel[] = [];
    if (need === baseCount) {
      this.setLabels(labels);
      return { data: base, count: baseCount };
    }
    if (this.buf.length < need * 7) this.buf = new Float32Array(need * 7 * 1.5);
    const out = this.buf;
    if (base && baseCount) out.set(base.subarray(0, baseCount * 7));
    let v = baseCount;
    for (const p of placed) {
      const o = p.o;
      if (!f.layers[o.layer]) continue;
      const teamRgb = o.team ? f.teamColor(o.team) : NEUTRAL;
      if (o.layer === 'zones') {
        // Its owner and the capture at the playhead: the replay's, when one battle is shown.
        const st =
          one && one.timeline ? zoneAt(one.timeline.zones.get(o.letter), f.t + one.offset, o.ownerAtStart) : { owner: one ? o.ownerAtStart : 0, progress: 0 };
        const rgb = st.owner ? f.teamColor(st.owner) : NEUTRAL;
        for (const ol of p.outlines) v = appendRun(out, v, ol.pts, ol.pts.length / 3, rgb, 0.95);
        for (const r of p.fill) v = appendRun(out, v, r, r.length / 3, rgb, st.owner ? 0.35 : 0.2);
        // A capture under way: the ring filled as far as it has come, in the capturing side's colour.
        const by = st.progress > 0 ? 2 : st.progress < 0 ? 1 : 0;
        if (p.ring && by && (Math.abs(st.progress) < 100 || st.owner !== by)) {
          const frac = Math.min(1, Math.abs(st.progress) / 100);
          for (const r of p.ring) v = appendRun(out, v, r, Math.max(2, Math.round((r.length / 3 - 1) * frac) + 1), f.teamColor(by), 1);
        }
        labels.push({
          x: p.anchor[0],
          y: p.anchor[1],
          z: p.anchor[2],
          kind: 'zone',
          text: o.letter,
          rgb,
          priority: 4,
        });
        continue;
      }
      const rgb = o.layer === 'areas' ? (o.type === 'battle_area' ? AREA : teamRgb) : o.layer === 'targets' ? TARGET : teamRgb;
      const a = o.layer === 'areas' ? (o.type === 'battle_area' ? 0.7 : 0.45) : 0.9;
      for (const ol of p.outlines) v = appendRun(out, v, ol.pts, ol.pts.length / 3, rgb, a);
      if (o.layer === 'spawns') {
        // How many began there; a spawn nobody used (an air spawn in a ground battle) says nothing.
        if (o.used)
          labels.push({
            x: p.anchor[0],
            y: p.anchor[1],
            z: p.anchor[2],
            kind: 'spawn',
            text: String(o.used),
            rgb,
            priority: 2,
          });
      } else if (o.layer === 'airfields') {
        labels.push({
          x: p.anchor[0],
          y: p.anchor[1],
          z: p.anchor[2],
          kind: o.type === 'helipad' ? 'helipad' : o.type === 'base' ? 'base' : 'airfield',
          text: '',
          rgb,
          priority: 3,
        });
      } else if (o.layer === 'targets') {
        labels.push({
          x: p.anchor[0],
          y: p.anchor[1],
          z: p.anchor[2],
          kind: 'target',
          text: '',
          rgb,
          priority: 1,
        });
      }
    }
    this.setLabels(labels);
    return { data: out, count: v };
  }

  /** Nothing drawn: the labels go too. */
  clear(): void {
    if (this.labels.length) this.setLabels([]);
  }

  private setLabels(labels: ObjectiveLabel[]): void {
    const same =
      labels.length === this.labels.length &&
      labels.every((l, i) => {
        const m = this.labels[i];
        return m.text === l.text && m.x === l.x && m.y === l.y && m.z === l.z && m.rgb[0] === l.rgb[0] && m.rgb[1] === l.rgb[1] && m.rgb[2] === l.rgb[2];
      });
    if (same) return;
    this.labels = labels;
    this.rev++;
  }
}

/** A capture or a zone lost, on the dataset's clock, where the zone is. */
export interface CaptureMark {
  /** Dataset seconds. */
  t: number;
  zone: string;
  team: number;
  kind: 'captured' | 'neutralised';
  match: string;
  x: number;
  y: number;
  z: number;
}

/** The capture events of `sources`, in time order, each where its zone is. */
export function captureMarks(d: Dataset, sources: ObjectiveSource[]): CaptureMark[] {
  const out: CaptureMark[] = [];
  for (const s of sources) {
    if (!s.timeline) continue;
    for (const e of s.timeline.events) {
      const o = s.objectives.find((x) => x.layer === 'zones' && x.letter === e.zone);
      const w = o ? toWorld(o.position, d.axes) : [NaN, NaN, NaN];
      out.push({
        t: e.time - s.offset,
        zone: e.zone,
        team: e.team,
        kind: e.kind,
        match: s.match,
        x: w[0],
        y: w[1],
        z: w[2],
      });
    }
  }
  return out.sort((a, b) => a.t - b.t);
}
