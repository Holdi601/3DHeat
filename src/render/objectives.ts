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
import { OBJECTIVE_LAYERS as OBJECTIVE_LAYER_LIST, siteActive, toWorld, zoneAt, type Objective, type ObjectiveLayer, type ObjectiveTimeline, type Vec3 } from '../match/objectives';
import { runSlice, WAIT, type SliceJob } from '../data/slices';
import { MAX_ZONES, ZONE_PART, ZONE_STATE_FLOATS, ZONE_VERTEX_FLOATS } from './zoneShaders';

/** One battle's objectives and where its replay seconds are on the dataset's clock. */
export interface ObjectiveSource {
  match: string;
  objectives: Objective[];
  timeline: ObjectiveTimeline | null;
  /** Replay seconds = dataset seconds + offset. */
  offset: number;
  /** The team label each owner number stands for, where it is not the number itself (a DCS campaign's coalitions). */
  ownerLabels?: Record<number, string>;
}

/** A label to place over the view. */
export interface ObjectiveLabel {
  x: number;
  y: number;
  z: number;
  kind: 'zone' | 'site' | 'spawn' | 'airfield' | 'helipad' | 'base' | 'target';
  text: string;
  /** Its colour, 0..1. */
  rgb: [number, number, number];
  /** Higher first when labels would cover each other. */
  priority: number;
  /** A zone's capture under way, 0..1, and the capturing side's colour. */
  progress?: number;
  by?: [number, number, number];
}

/** The shapes of one objective, laid on the ground. */
interface Placed {
  o: Objective;
  match: string;
  /** Where its label goes. */
  anchor: Vec3;
  /** Its outlines, each a closed (or, `open`, an open) run of points. */
  outlines: { pts: Float32Array; closed: boolean }[];
  /**
   * Its filled shapes, as triangles: each the outline shrunk toward its middle
   * step by step (`ZONE_STEPS`, `MARK_STEPS`), every point laid on the ground,
   * so a zone's disc follows the hill it lies on.
   */
  discs: Float32Array[][];
}

/** A zone's disc from just outside its edge in: a dark rim (it reads on any ground), the edge band, the progress band, then the fill. */
const ZONE_STEPS = [1.05, 1, 0.88, 0.77, 0.6, 0.4, 0.2, 0];
/** A spawn's or a marker's: the edge band, then the fill. */
const MARK_STEPS = [1, 0.72, 0.35, 0];
/** The triangles' height above the ground, over the lines' (the triangles between two points cut a rise less). */
const TRI_LIFT = 2;

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
/** A bomb site while its round is shown (`siteActive`): amber, apart from both teams' colours. */
const SITE: [number, number, number] = [1, 0.74, 0.18];
/** The owner a bomb site has while it is the one played: drawn in `SITE`, not a team's colour. */
const SITE_OWNER = 255;
/** A bomb site's rooms are a few metres high: its outline and fill lie this close over the floor (data units). */
const SITE_LIFT = 0.05;
const SITE_TRI_LIFT = 0.08;

/** The ground's height under a point; null where there is none (no level, nothing below). */
export type GroundAt = (x: number, z: number) => number | null;

/**
 * The battles to draw: those the replay plays or the heat shows (the picked
 * matches), with their objectives; the summaries without any left out.
 */
export function objectiveSources(
  d: Dataset | null,
  games: (Pick<GameMatch, 'match' | 'objectives'> & { ownerLabels?: Record<number, string> })[],
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
    ...(g.ownerLabels ? { ownerLabels: g.ownerLabels } : {}),
  }));
}

/** The zone states the picture depends on at `t` (dataset seconds), as a key: it changes only when a zone does. */
export function stateKey(sources: ObjectiveSource[], t: number): string {
  if (sources.length !== 1) return '';
  const s = sources[0];
  // A bomb site lights while its round is shown.
  let sites = '';
  for (const o of s.objectives) if (o.active.length) sites += siteActive(o, t + s.offset) ? '1' : '0';
  if (!s.timeline) return sites;
  let key = sites;
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

/**
 * A closed outline (xyz, the first point again at the end) shrunk toward
 * (`cx`, `cz`) by each of `steps`, each laid on the ground; off the ground
 * (`ground` null) the heights go from the outline's to `cy`.
 */
function shrunk(outline: Float32Array, cx: number, cy: number, cz: number, steps: number[], ground: GroundAt | null, lift: number): Float32Array[] {
  const n = outline.length / 3;
  return steps.map((s) => {
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const x = cx + (outline[i * 3] - cx) * s;
      const z = cz + (outline[i * 3 + 2] - cz) * s;
      const g = ground ? ground(x, z) : null;
      out[i * 3] = x;
      out[i * 3 + 1] = g !== null ? g + lift : cy + (outline[i * 3 + 1] - cy) * Math.min(1, s);
      out[i * 3 + 2] = z;
    }
    return out;
  });
}

/** A closed outline's middle (its points', the repeated last one left out). */
function middle(pts: Float32Array): [number, number, number] {
  const n = Math.max(1, pts.length / 3 - 1);
  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < n; i++) {
    x += pts[i * 3] / n;
    y += pts[i * 3 + 1] / n;
    z += pts[i * 3 + 2] / n;
  }
  return [x, y, z];
}

/**
 * The zones' discs as `zoneShaders.ts` reads them: the rim, the band, the
 * capture band and the fill between their shrunk outlines (`ZONE_STEPS`),
 * each point with its zone's middle, part, angle, zone and radius.
 */
function zoneVerts(zones: Placed[]): Float32Array {
  let need = 0;
  for (const p of zones) for (const d of p.discs) need += (d.length - 1) * (d[0].length / 3 - 1) * 6;
  const out = new Float32Array(need * ZONE_VERTEX_FLOATS);
  let v = 0;
  zones.forEach((p, zi) => {
    for (const d of p.discs) {
      const n = d[0].length / 3 - 1;
      const mid = d[d.length - 1];
      const mx = mid[0];
      const my = mid[1];
      const mz = mid[2];
      let r = 0;
      for (let i = 0; i < n; i++) r = Math.max(r, Math.hypot(d[1][i * 3] - mx, d[1][i * 3 + 2] - mz));
      for (let k = 0; k + 1 < d.length; k++) {
        const part = k === 0 ? ZONE_PART.rim : k === 1 ? ZONE_PART.band : k === 2 ? ZONE_PART.capture : ZONE_PART.fill;
        const a = d[k];
        const b = d[k + 1];
        for (let i = 0; i < n; i++) {
          for (const [q, j] of [[a, i], [b, i], [a, i + 1], [a, i + 1], [b, i], [b, i + 1]] as const) {
            const o = v * ZONE_VERTEX_FLOATS;
            out[o] = q[j * 3];
            out[o + 1] = q[j * 3 + 1];
            out[o + 2] = q[j * 3 + 2];
            out[o + 3] = mx;
            out[o + 4] = my;
            out[o + 5] = mz;
            out[o + 6] = part;
            out[o + 7] = j / n;
            out[o + 8] = zi;
            out[o + 9] = r;
            v++;
          }
        }
      }
    }
  });
  return out;
}

/** Appends the triangles between two shrunk outlines (`a` outer, `b` inner), the first `upTo` pieces of them; the vertex count after. */
function appendBand(out: Float32Array, v: number, a: Float32Array, b: Float32Array, upTo: number, rgb: readonly number[], alpha: number): number {
  const n = Math.min(upTo, a.length / 3 - 1);
  for (let i = 0; i < n; i++) {
    const j = i + 1;
    for (const [p, k] of [[a, i], [b, i], [a, j], [a, j], [b, i], [b, j]] as const) {
      const o = v * 7;
      out[o] = p[k * 3];
      out[o + 1] = p[k * 3 + 1];
      out[o + 2] = p[k * 3 + 2];
      out[o + 3] = rgb[0];
      out[o + 4] = rgb[1];
      out[o + 5] = rgb[2];
      out[o + 6] = alpha;
      v++;
    }
  }
  return v;
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
      const lift = (o.type === 'bomb_site' ? SITE_LIFT : LIFT) * scale;
      const r = o.radius * scale;
      const p: Placed = {
        o,
        match: src.match,
        anchor: [c[0], baseY + lift, c[2]],
        outlines: [],
        discs: [],
      };
      const tl = (o.type === 'bomb_site' ? SITE_TRI_LIFT : TRI_LIFT) * scale;
      if (o.shape === 'points' && o.points.length) {
        const seenPt = new Set<string>();
        for (const q of o.points) {
          const k = `${Math.round(q[0])},${Math.round(q[2])}`;
          if (seenPt.has(k)) continue;
          seenPt.add(k);
          const w = toWorld(q, axes);
          const pr = Math.max(4 * scale, Math.min(r || 10 * scale, 25 * scale));
          const pts = ring(w[0], w[1], w[2], pr, SMALL, gr, lift);
          p.outlines.push({ pts, closed: true });
          p.discs.push(shrunk(pts, w[0], w[1], w[2], MARK_STEPS, gr, tl));
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
        // A zone's fill, heavy edge and progress band are triangles (`discs`); its line is the edge seen through the ground.
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
      // The filled shapes: a zone's disc (whatever its outline), a marker's, a target's; not an area's.
      if (o.layer !== 'areas' && !p.discs.length && p.outlines.length && p.outlines[0].closed) {
        const edge = p.outlines[0].pts;
        const m = o.shape === 'outline' || o.shape === 'box' ? middle(edge) : [c[0], baseY, c[2]];
        p.discs.push(shrunk(edge, m[0], m[1], m[2], o.layer === 'zones' ? ZONE_STEPS : MARK_STEPS, gr, tl));
      }
      out.push(p);
      yield;
    }
  }
  return out;
}

/** Whether an objective is drawn as lines: the areas and the targets' crosses; the rest are discs. */
function linesOf(o: Objective): boolean {
  return o.layer === 'areas' || o.layer === 'targets';
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
  /** The share of their alpha the filled shapes' edges keep over everything (`top`): faint in the replay, whole over the heat. */
  xray: number;
}

/** Triangles, seven floats a vertex (xyz, rgba). */
export interface ObjectiveTris {
  data: Float32Array;
  count: number;
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
   * The filled shapes, made again only when what they show changes (a zone's
   * owner or capture, the layers, the battles), each time in new arrays: on
   * the ground (`ground`, depth tested), and their edges over everything
   * (`top`), so a zone behind a hill still shows.
   */
  ground: ObjectiveTris | null = null;
  top: ObjectiveTris | null = null;
  /** What the markers' shapes were made for. */
  private markFor: Placed[] | null = null;
  private markKey = '';
  /**
   * The zones' discs (`zoneShaders.ts`): their vertices made once a battle,
   * `ZONE_VERTEX_FLOATS` each; their state at the playhead, `ZONE_STATE_FLOATS` a zone.
   */
  zones: { verts: Float32Array; count: number; state: Float32Array } | null = null;
  private zoneFor: Placed[] | null = null;

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
    this.buildTris(f, placed, one);
    // Room for every point twice, as line pieces, plus what is there.
    let need = baseCount;
    for (const p of placed) {
      if (!f.layers[p.o.layer] || !linesOf(p.o)) continue;
      for (const o of p.outlines) need += (o.pts.length / 3) * 2;
    }
    const labels: ObjectiveLabel[] = [];
    // No lines to add (the zones are only discs): the labels, and `base` as it is.
    const lines = need > baseCount;
    if (lines && this.buf.length < need * 7) this.buf = new Float32Array(need * 7 * 1.5);
    const out = this.buf;
    if (lines && base && baseCount) out.set(base.subarray(0, baseCount * 7));
    let v = baseCount;
    for (const p of placed) {
      const o = p.o;
      if (!f.layers[o.layer]) continue;
      const teamRgb = o.team ? f.teamColor(o.team) : NEUTRAL;
      if (o.layer === 'zones') {
        // Its owner and the capture at the playhead: the replay's, when one battle is shown.
        const st = this.zoneState(o, f, one);
        const rgb = ownerRgb(st.owner, f);
        if (o.type === 'bomb_site') {
          // A site's room by its name, in amber while its round is shown.
          labels.push({ x: p.anchor[0], y: p.anchor[1], z: p.anchor[2], kind: 'site', text: o.name, rgb, priority: st.owner ? 5 : 4 });
          continue;
        }
        // A capture under way: how far it has come and by whom, for the letter's ring.
        const by = st.progress > 0 ? 2 : st.progress < 0 ? 1 : 0;
        const capturing = by && (Math.abs(st.progress) < 100 || st.owner !== by);
        labels.push({
          progress: capturing ? Math.min(1, Math.abs(st.progress) / 100) : 0,
          by: capturing ? f.teamColor(by) : undefined,
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
      if (linesOf(o)) for (const ol of p.outlines) v = appendRun(out, v, ol.pts, ol.pts.length / 3, rgb, a);
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
    return lines ? { data: out, count: v } : { data: base, count: baseCount };
  }

  /** Nothing drawn: the labels go too. */
  clear(): void {
    if (this.labels.length) this.setLabels([]);
    this.ground = null;
    this.top = null;
    this.markFor = null;
    this.zones = null;
    this.zoneFor = null;
  }

  /** A zone's owner and capture at the playhead: the replay's, when one battle is shown. */
  private zoneState(o: Objective, f: ObjectiveFrame, one: ObjectiveSource | null): { owner: number; progress: number } {
    if (o.active.length) return { owner: one && siteActive(o, f.t + one.offset) ? SITE_OWNER : 0, progress: 0 };
    return one && one.timeline ? zoneAt(one.timeline.zones.get(o.letter), f.t + one.offset, o.ownerAtStart) : { owner: one ? o.ownerAtStart : 0, progress: 0 };
  }

  /**
   * The filled shapes: the markers' (`ground`, `top`) made again only with
   * the layers or the colours; the zones' (`zones`) only with the battles,
   * their state - owner, capture - a few floats a zone a frame, which the
   * shaders read (`zoneShaders.ts`).
   */
  private buildTris(f: ObjectiveFrame, placed: Placed[], one: ObjectiveSource | null): void {
    const layers = OBJECTIVE_LAYER_LIST.map((l) => (f.layers[l] ? 1 : 0)).join('');
    const look = `${layers}|${f.xray}|${f.teamColor(1).join(',')}|${f.teamColor(2).join(',')}`;
    if (this.markFor !== placed || this.markKey !== look) {
      this.markFor = placed;
      this.markKey = look;
      const marks = this.trisOf(f, placed.filter((p) => p.o.layer !== 'zones'));
      this.ground = marks.ground;
      this.top = marks.top;
    }
    const zones = f.layers.zones ? placed.filter((p) => p.o.layer === 'zones' && p.discs.length).slice(0, MAX_ZONES) : [];
    if (this.zoneFor !== placed || (this.zones !== null) !== zones.length > 0) {
      this.zoneFor = placed;
      this.zones = zones.length ? { verts: zoneVerts(zones), count: 0, state: new Float32Array(MAX_ZONES * ZONE_STATE_FLOATS) } : null;
      if (this.zones) this.zones.count = this.zones.verts.length / ZONE_VERTEX_FLOATS;
    }
    if (!this.zones) return;
    const st = this.zones.state;
    zones.forEach((p, i) => {
      const z = this.zoneState(p.o, f, one);
      const rgb = ownerRgb(z.owner, f);
      const by = z.progress > 0 ? 2 : z.progress < 0 ? 1 : 0;
      const capturing = by && (Math.abs(z.progress) < 100 || z.owner !== by);
      const cap = by ? f.teamColor(by) : NEUTRAL;
      const o = i * ZONE_STATE_FLOATS;
      st[o] = rgb[0];
      st[o + 1] = rgb[1];
      st[o + 2] = rgb[2];
      st[o + 3] = z.owner ? 1 : 0;
      st[o + 4] = cap[0];
      st[o + 5] = cap[1];
      st[o + 6] = cap[2];
      st[o + 7] = capturing ? Math.min(1, Math.abs(z.progress) / 100) : 0;
    });
  }

  /** The filled shapes of `placed`, on the ground and over everything. */
  private trisOf(f: ObjectiveFrame, placed: Placed[]): { ground: ObjectiveTris | null; top: ObjectiveTris | null } {
    let need = 0;
    for (const p of placed) {
      if (!f.layers[p.o.layer]) continue;
      for (const d of p.discs) need += (d.length - 1) * (d[0].length / 3 - 1) * 6;
    }
    if (!need) return { ground: null, top: null };
    const g = new Float32Array(need * 7);
    const t = new Float32Array(need * 7);
    let gv = 0;
    let tv = 0;
    for (const p of placed) {
      const o = p.o;
      if (!f.layers[o.layer] || !p.discs.length) continue;
      const rgb = o.layer === 'targets' ? TARGET : o.team ? f.teamColor(o.team) : NEUTRAL;
      for (const d of p.discs) {
        const n = d[0].length / 3 - 1;
        gv = appendBand(g, gv, d[0], d[1], n, rgb, 0.85);
        tv = appendBand(t, tv, d[0], d[1], n, rgb, 0.85 * f.xray);
        for (let i = 1; i + 1 < d.length; i++) gv = appendBand(g, gv, d[i], d[i + 1], n, rgb, 0.3);
      }
    }
    return { ground: gv ? { data: g, count: gv } : null, top: tv ? { data: t, count: tv } : null };
  }

  private setLabels(labels: ObjectiveLabel[]): void {
    const same =
      labels.length === this.labels.length &&
      labels.every((l, i) => {
        const m = this.labels[i];
        return m.text === l.text && m.progress === l.progress && m.by?.[0] === l.by?.[0] && m.x === l.x && m.y === l.y && m.z === l.z && m.rgb[0] === l.rgb[0] && m.rgb[1] === l.rgb[1] && m.rgb[2] === l.rgb[2];
      });
    if (same) return;
    this.labels = labels;
    this.rev++;
  }
}

/** A zone's colour for its owner: a team's, the played bomb site's amber, or nobody's. */
function ownerRgb(owner: number, f: ObjectiveFrame): [number, number, number] {
  return owner === SITE_OWNER ? SITE : owner ? f.teamColor(owner) : NEUTRAL;
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
