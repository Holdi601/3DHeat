/**
 * The race tab's world geometry, rebuilt each frame the replay or the view
 * changes: every lap's driven line, the map painted along the track, a marker
 * where the cars were lined up, a burst where a lap hit something, and the
 * cars themselves - flashing as they hit. With many laps shown, the lines are
 * thinned to a point every metre and a half and the cars other than the ones
 * looked at are drawn plainer, so dozens of laps still draw at frame rate.
 */

import type { RaceState } from '../state/raceStore';
import type { Analysis, Finding } from './analysis';
import { carBody } from './carMatch';
import { buildCar } from './glyph';
import { impacts, type Impact } from './impacts';
import { CAUSE_COLORS, deltaColor, lapColor, mix, VertexBuffer, type Rgb, type Vec3 } from './geometry';
import type { LapTrace } from './lap';
import { frameTimes, stateAt, type CarState } from './replay';
import { smooth } from './segments';
import { lapsIn, mistakeDensity } from './stats';

export interface RaceFrame {
  lines: VertexBuffer;
  tris: VertexBuffer;
  /** Each visible lap's state this frame, by lap id. */
  cars: Map<string, CarState>;
}

/** Colour of every lap, in load order - stable as laps are hidden. */
export function lapColors(state: Pick<RaceState, 'laps'>): Map<string, Rgb> {
  const out = new Map<string, Rgb>();
  state.laps.forEach((lap, i) => out.set(lap.id, lapColor(i, state.laps.length)));
  return out;
}

/** Which colour group a finding's cause belongs to on the "why" map. */
export function causeGroup(f: Finding): keyof typeof CAUSE_COLORS {
  return f.source === 'driver' ? f.phase : f.source;
}

/** Lift above the recorded position for lines and maps: the car's reference point is ~0.5 m up. */
// A car's recorded position is its reference point, 0.28 to 0.47 m above the
// road on the extracted Forza courses (exporters/gamecapture README). The map
// sits just above the lowest of that, so it is never under the road, and the
// lines above the map.
const LINE_LIFT = -0.12;
/** How long a car flashes after a hit, s. */
const FLASH = 0.8;
const CRASH_COLOR: Rgb = [1, 0.2, 0.14];
const HIT_COLOR: Rgb = [1, 0.66, 0.12];
/** Past this many cars on view, the ones not looked at are drawn plainer. */
const PLAIN_PAST = 10;
/**
 * A driven line keeps a point at least this far from the last, m: closer for
 * the laps looked at, further for a crowd of others - every vertex of every
 * line goes to the GPU every frame.
 */
const LINE_STEP = 1.5;
const CROWD_LINE_STEP = 6;

const thinned = new WeakMap<LapTrace, Map<number, Uint32Array>>();

/** A lap's samples a line is drawn through: one every `step` metres, and the last. */
function lineIndices(lap: LapTrace, step: number): Uint32Array {
  const known = thinned.get(lap) ?? new Map<number, Uint32Array>();
  thinned.set(lap, known);
  const had = known.get(step);
  if (had) return had;
  const { x, z } = lap.channels;
  const keep: number[] = [0];
  for (let i = 1; i < lap.count; i++) {
    const j = keep[keep.length - 1];
    if (Math.hypot(x[i] - x[j], z[i] - z[j]) >= step || i === lap.count - 1) keep.push(i);
  }
  const out = Uint32Array.from(keep);
  known.set(step, out);
  return out;
}

/** How many laps made a mistake at a metre, as a colour: one hue, from dim to bright. */
export function mistakeColor(t: number): Rgb {
  return mix([0.36, 0.2, 0.13], [1, 0.5, 0.16], Math.max(0, Math.min(1, t)));
}
const MAP_LIFT = -0.2;
const SURFACE_LIFT = -0.3;

export class RaceScene {
  private readonly frame: RaceFrame = {
    lines: new VertexBuffer(),
    tris: new VertexBuffer(),
    cars: new Map(),
  };

  /** `hasLevel`: a course model is loaded, so the laps' own track surface is not drawn. */
  build(state: RaceState, clock: number, hasLevel = false, hover: number | null = null): RaceFrame {
    const { lines, tris, cars } = this.frame;
    lines.reset();
    tris.reset();
    cars.clear();
    const analysis = state.analysis;
    const colors = lapColors(state);
    const visible = state.laps.filter((l) => !state.hidden[l.id]);

    const crowd = visible.length > PLAIN_PAST;
    const looked = new Set([state.focusId, state.follow, analysis?.alignment.reference.id]);
    if (state.view.lines) {
      for (const lap of visible) {
        const { x, y, z } = lap.channels;
        const col = colors.get(lap.id)!;
        const at = lineIndices(lap, crowd && !looked.has(lap.id) ? CROWD_LINE_STEP : LINE_STEP);
        for (let k = 1; k < at.length; k++) {
          const a = at[k - 1];
          const b = at[k];
          lines.line([x[a], y[a] + LINE_LIFT, z[a]], [x[b], y[b] + LINE_LIFT, z[b]], col, 0.9);
        }
      }
    }

    if (analysis && state.view.surface && !hasLevel) this.surface(analysis);
    if (analysis && state.view.map === 'mistakes') this.mistakes(state, analysis);
    else if (analysis && state.view.map !== 'none' && state.focusId) this.map(state, analysis);
    if (analysis && state.replay.mode === 'anchor' && hover === null) {
      this.anchor(analysis, state.replay.anchorS, [1, 1, 1]);
    }
    // The charts' cursor, on the track.
    if (analysis && hover !== null) this.anchor(analysis, hover, [1, 0.85, 0.3]);

    // Where each lap hit something.
    if (state.view.lines || state.view.cars) {
      for (const lap of visible) for (const hit of impacts(lap)) this.burst(hit, colors.get(lap.id)!, state.view.carScale);
    }

    if (analysis && state.view.cars) {
      const times = frameTimes(analysis.alignment, state.replay.mode, clock, state.offsets, hover);
      for (const lap of visible) {
        const motion = state.motions.get(lap.id);
        if (!motion) continue;
        const t = times.get(lap.id) ?? clock;
        const car = stateAt(motion, t);
        cars.set(lap.id, car);
        buildCar(tris, car, colors.get(lap.id)!, {
          scale: state.view.carScale,
          steerSign: motion.steerSign,
          wheelSide: motion.wheelSide,
          telemetry: state.view.telemetry,
          selected: state.follow === lap.id,
          detail: crowd && !looked.has(lap.id) ? 'plain' : 'full',
          model: state.view.carShapes ? carBody(lap, state.carPacks).model : undefined,
        });
        // The moment of a hit: a shock ring spreading from the car.
        for (const hit of impacts(lap)) {
          const since = t - hit.time;
          if (since >= 0 && since < FLASH) this.flash(car, hit, since / FLASH, state.view.carScale);
        }
      }
    }
    return this.frame;
  }

  /**
   * A burst over where a lap struck something: a spiked star in the impact's
   * colour - red for a crash, amber for a hit - standing up so it reads from
   * any side, on a post with a ring in the lap's colour at its foot. As big
   * as the cars are drawn, so it reads beside them.
   */
  private burst(hit: Impact, lapCol: Rgb, scale: number): void {
    const { tris, lines } = this.frame;
    const crash = hit.kind === 'crash';
    const col: Rgb = crash ? CRASH_COLOR : HIT_COLOR;
    const k = Math.max(1, scale);
    const r = (crash ? 1.6 : 1) * k;
    const h = (crash ? 3 : 2.2) * k;
    const foot = 0.9 * k;
    const c: Vec3 = [hit.x, hit.y + h, hit.z];
    lines.line([hit.x, hit.y + LINE_LIFT, hit.z], c, col, 0.9);
    const points = 8;
    for (const plane of [0, 1, 2]) {
      const p = (a: number, rr: number): Vec3 => {
        const u = Math.cos(a) * rr;
        const v = Math.sin(a) * rr;
        return plane === 0 ? [c[0] + u, c[1] + v, c[2]] : plane === 1 ? [c[0], c[1] + v, c[2] + u] : [c[0] + u, c[1], c[2] + v];
      };
      for (let k = 0; k < points * 2; k++) {
        const a0 = (k / (points * 2)) * Math.PI * 2;
        const a1 = ((k + 1) / (points * 2)) * Math.PI * 2;
        const r0 = k % 2 ? r * 0.42 : r;
        const r1 = k % 2 ? r : r * 0.42;
        tris.triangle(c, p(a0, r0), p(a1, r1), k % 2 ? col : [Math.min(1, col[0] + 0.15), Math.min(1, col[1] + 0.25), Math.min(1, col[2] + 0.2)], 0.95);
      }
    }
    const ring = 20;
    for (let k = 0; k < ring; k++) {
      const a0 = (k / ring) * Math.PI * 2;
      const a1 = ((k + 1) / ring) * Math.PI * 2;
      lines.line(
        [hit.x + Math.cos(a0) * foot, hit.y + LINE_LIFT, hit.z + Math.sin(a0) * foot],
        [hit.x + Math.cos(a1) * foot, hit.y + LINE_LIFT, hit.z + Math.sin(a1) * foot],
        lapCol,
        0.9,
      );
    }
  }

  /** A ring spreading from a car as it hits, `f` 0 to 1 through the flash. */
  private flash(car: CarState, hit: Impact, f: number, scale: number): void {
    const tris = this.frame.tris;
    const col = hit.kind === 'crash' ? CRASH_COLOR : HIT_COLOR;
    const r0 = (2 + f * 5) * scale;
    const r1 = r0 + 0.5 * scale;
    const y = car.y + 0.4 * scale;
    const n = 28;
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2;
      const a1 = ((k + 1) / n) * Math.PI * 2;
      const p = (a: number, r: number): Vec3 => [car.x + Math.cos(a) * r, y, car.z + Math.sin(a) * r];
      tris.quad(p(a0, r0), p(a0, r1), p(a1, r1), p(a1, r0), col, 0.9 * (1 - f));
    }
  }

  private density: { key: string; values: Float32Array; top: number } | null = null;

  /**
   * Where the laps make mistakes: along the track, how many of them made one
   * at each metre - of every kind or the one picked in the statistics - wider
   * and brighter where more did.
   */
  private mistakes(state: RaceState, analysis: Analysis): void {
    const key = `${state.mass.classes?.join(',') ?? '*'}|${state.mass.mistake ?? '*'}`;
    if (!this.density || this.density.key !== key || this.densityOf !== analysis) {
      const values = mistakeDensity(analysis, lapsIn(analysis, state.mass.classes), state.mass.mistake);
      let top = 0;
      for (const v of values) top = Math.max(top, v);
      this.density = { key, values, top };
      this.densityOf = analysis;
    }
    const { values, top } = this.density;
    this.ribbon(
      analysis,
      (i) => (values[i] > 0 ? 3 + 10 * (values[i] / Math.max(1, top)) : 2),
      (i) => (values[i] > 0 ? [mistakeColor(values[i] / Math.max(1, top)), 0.95] : [[0.35, 0.36, 0.4], 0.5]),
    );
  }

  private densityOf: Analysis | null = null;

  /** A ribbon along the reference path, coloured per grid point. */
  private ribbon(
    analysis: Analysis,
    width: (i: number) => number,
    color: (i: number) => [Rgb, number] | null,
  ): void {
    const ref = analysis.alignment.laps.find((l) => l.lap === analysis.alignment.reference)!;
    const { x, y, z } = ref.channels;
    const tris = this.frame.tris;
    for (let i = ref.first; i < ref.last; i++) {
      const c = color(i);
      if (!c) continue;
      const j = i + 1;
      // Sideways at each end, from the direction of travel.
      const side = (k: number): Vec3 => {
        const a = Math.max(ref.first, k - 1);
        const b = Math.min(ref.last, k + 1);
        const dx = x[b] - x[a];
        const dz = z[b] - z[a];
        const len = Math.hypot(dx, dz) || 1;
        return [-dz / len, 0, dx / len];
      };
      const si = side(i);
      const sj = side(j);
      const wi = width(i) / 2;
      const wj = width(j) / 2;
      const p = (k: number, s: Vec3, w: number): Vec3 => [
        x[k] + s[0] * w,
        y[k] + MAP_LIFT,
        z[k] + s[2] * w,
      ];
      tris.quad(p(i, si, -wi), p(i, si, wi), p(j, sj, wj), p(j, sj, -wj), c[0], c[1]);
    }
  }

  private map(state: RaceState, analysis: Analysis): void {
    const id = state.focusId!;
    if (state.view.map === 'where') {
      const where = analysis.where.get(id);
      if (!where) return;
      const scale = mapScale(where);
      this.ribbon(
        analysis,
        () => 6,
        (i) => (Number.isFinite(where[i]) ? [deltaColor(where[i], scale), 0.9] : null),
      );
      return;
    }
    // Why: each finding painted over where its cause is, in its cause's
    // colour, wider for a costlier one.
    const findings = analysis.findings.filter((f) => f.lapId === id && f.outcome === 'loss');
    const byIndex = new Map<number, Finding>();
    for (const f of findings) {
      const a = Math.min(f.from, f.to);
      const b = Math.max(f.from, f.to);
      for (let i = a; i <= b; i++) {
        const had = byIndex.get(i);
        if (!had || had.cost < f.cost) byIndex.set(i, f);
      }
    }
    const top = findings.length ? findings[0].cost : 1;
    const selected = state.selected !== null ? analysis.findings[state.selected] : null;
    this.ribbon(
      analysis,
      (i) => {
        const f = byIndex.get(i);
        return f ? 3 + 9 * Math.sqrt(f.cost / top) : 2;
      },
      (i) => {
        const f = byIndex.get(i);
        if (!f) return [[0.35, 0.36, 0.4], 0.5];
        const col = CAUSE_COLORS[causeGroup(f)];
        return [f === selected ? [1, 1, 1] : col, 0.92];
      },
    );
  }

  /**
   * The track as the laps describe it, for a game whose course has not been
   * extracted: as wide as the laps spread across it plus a margin, at least a
   * car-and-a-half either side of the line, with its edges marked.
   */
  private surface(analysis: Analysis): void {
    const ref = analysis.alignment.laps.find((l) => l.lap === analysis.alignment.reference)!;
    const n = ref.channels.x.length;
    const left = new Float32Array(n).fill(Number.NaN);
    const right = new Float32Array(n).fill(Number.NaN);
    for (let i = ref.first; i <= ref.last; i++) {
      let lo = 0;
      let hi = 0;
      for (const l of analysis.alignment.laps) {
        const d = l.channels.lateral[i];
        if (Number.isFinite(d) && Math.abs(d) < 25) {
          lo = Math.min(lo, d);
          hi = Math.max(hi, d);
        }
      }
      left[i] = Math.max(hi + 2, 4);
      right[i] = Math.min(lo - 2, -4);
    }
    const l = smooth(left, 8);
    const r = smooth(right, 8);
    const { x, y, z } = ref.channels;
    const tris = this.frame.tris;
    const lines = this.frame.lines;
    const asphalt: Rgb = [0.2, 0.21, 0.23];
    const edge: Rgb = [0.75, 0.76, 0.8];
    const side = (k: number): Vec3 => {
      const a = Math.max(ref.first, k - 1);
      const b = Math.min(ref.last, k + 1);
      const dx = x[b] - x[a];
      const dz = z[b] - z[a];
      const len = Math.hypot(dx, dz) || 1;
      // Left of the direction of travel, as the alignment measures it.
      return [-dz / len, 0, dx / len];
    };
    const p = (k: number, w: number): Vec3 => {
      const s = side(k);
      return [x[k] + s[0] * w, y[k] + SURFACE_LIFT, z[k] + s[2] * w];
    };
    for (let i = ref.first; i < ref.last; i++) {
      const j = i + 1;
      tris.quad(p(i, r[i]), p(i, l[i]), p(j, l[j]), p(j, r[j]), asphalt, 1);
      lines.line(p(i, l[i]), p(j, l[j]), edge, 0.6);
      lines.line(p(i, r[i]), p(j, r[j]), edge, 0.6);
    }
  }

  /** A post: where the cars were lined up, or where the charts' cursor is. */
  private anchor(analysis: Analysis, anchorS: number, color: Rgb): void {
    const ref = analysis.alignment.laps.find((l) => l.lap === analysis.alignment.reference)!;
    const step = analysis.alignment.grid[1] - analysis.alignment.grid[0];
    const i = Math.max(ref.first, Math.min(ref.last, Math.round(anchorS / step)));
    const { x, y, z } = ref.channels;
    const base: Vec3 = [x[i], y[i] - 0.5, z[i]];
    const topP: Vec3 = [x[i], y[i] + 14, z[i]];
    this.frame.lines.line(base, topP, color, 0.9);
    // A flag at the top, so the post is findable from far off.
    this.frame.tris.triangle(
      topP,
      [x[i], y[i] + 10, z[i]],
      [x[i] + 3, y[i] + 12, z[i]],
      color,
      0.9,
    );
  }
}

/** The where map's colour scale: most of the lap in range, the spikes clipped. */
export function mapScale(where: Float32Array): number {
  const values: number[] = [];
  for (const v of where) if (Number.isFinite(v)) values.push(Math.abs(v));
  if (!values.length) return 1;
  values.sort((a, b) => a - b);
  return Math.max(1e-4, values[Math.floor(values.length * 0.95)]);
}
