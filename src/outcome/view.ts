/**
 * The outcome analysis in the 3D view: each zone of a map coloured by how
 * much more (or less) often the side won when it held the zone - in a window
 * of the round, or at a moment of it (the time slider) - and each of the
 * side's opening routes coloured the same way. Diverging colours with a grey
 * midpoint (teal: won more, orange: won less; validated for colour-vision
 * deficiency in both themes), a "+" or "-" in the zone as a second cue.
 *
 * Lines in the engine's top-lines form (seven floats a vertex: x, y, z, r, g,
 * b, alpha), made once a selection and handed over (`mass/placeLines.ts`),
 * so a frame costs nothing.
 */

import { wilson } from '../insights/stats';
import { ROUTE_POINTS, type OutcomeGroup } from './features';
import type { OutcomeFinding } from './analyze';

/** Side-rounds of prior (at the side's own win rate) a zone's rate is shrunk with. */
const PRIOR = 10;
/** A zone shown needs this many side-rounds holding it. */
const MIN_WITH = 5;

export interface ZoneCell {
  zone: number;
  x0: number;
  z0: number;
  x1: number;
  z1: number;
  y: number;
  kWith: number;
  nWith: number;
  kWithout: number;
  nWithout: number;
  /** Win rate with (shrunk) minus without. */
  delta: number;
  lo: number;
  hi: number;
}

export interface RouteCell {
  route: number;
  path: number[];
  share: number;
  flank: boolean;
  kWith: number;
  nWith: number;
  nWithout: number;
  kWithout: number;
  delta: number;
}

export interface OutcomeMap {
  group: string;
  side: number;
  /** What the zones are about: a window (index) or a moment (slice index), and its seconds. */
  window: number | null;
  slice: number | null;
  from: number;
  to: number;
  base: number;
  zones: ZoneCell[];
  routes: RouteCell[];
  /** Heights for the routes: zone index by cell. */
  zone: number;
}

const shrunkDelta = (k1: number, n1: number, k0: number, n0: number, base: number) => (k1 + PRIOR * base) / (n1 + PRIOR) - (n0 ? k0 / n0 : base);

/** The zones and routes of a side, for a window or a slice (moment) of the round. */
export function outcomeMap(g: OutcomeGroup, side: number, sel: { window?: number; slice?: number }): OutcomeMap {
  const rounds = g.rounds.map((r, i) => ({ r, i })).filter((x) => x.r.side === side);
  const base = rounds.reduce((a, x) => a + x.r.won, 0) / Math.max(1, rounds.length);
  let from = 0, to = 0;
  const hasZone: (i: number, z: number) => boolean = (() => {
    if (sel.slice !== undefined) {
      from = sel.slice * g.slice;
      to = from + g.slice;
      const sets = new Map<number, Set<number>>();
      for (const { i } of rounds) {
        const s = new Set<number>();
        for (const v of g.held[i]) if (Math.floor(v / 65536) === sel.slice) s.add(v % 65536);
        sets.set(i, s);
      }
      return (i, z) => sets.get(i)!.has(z);
    }
    const w = sel.window ?? 0;
    [from, to] = g.windows[w];
    const ids = new Map<number, number>();
    for (const f of g.features) if (f.kind === 'hold' && f.side === side && f.window === w) ids.set(f.zone!, f.id);
    return (i, z) => {
      const id = ids.get(z);
      return id !== undefined && g.rounds[i].feats.has(id);
    };
  })();
  const live = rounds.filter((x) => x.r.len >= from + (to - from) / 2);
  const kAll = live.reduce((a, x) => a + x.r.won, 0);
  const zones: ZoneCell[] = [];
  g.zones.forEach((zn, z) => {
    let k1 = 0, n1 = 0;
    for (const x of live) if (hasZone(x.i, z)) {
      n1++;
      k1 += x.r.won;
    }
    if (n1 < MIN_WITH) return;
    const n0 = live.length - n1;
    const k0 = kAll - k1;
    const [lo, hi] = wilson(k1, n1);
    zones.push({
      zone: z, x0: zn.ix * g.zone, z0: zn.iz * g.zone, x1: (zn.ix + 1) * g.zone, z1: (zn.iz + 1) * g.zone, y: zn.y,
      kWith: k1, nWith: n1, kWithout: k0, nWithout: n0, delta: shrunkDelta(k1, n1, k0, n0, base), lo, hi,
    });
  });
  const routes: RouteCell[] = [];
  const rid = new Map<number, number>();
  for (const f of g.features) if (f.kind === 'route' && f.side === side) rid.set(f.route!, f.id);
  g.routes.forEach((rt, k) => {
    if (rt.side !== side) return;
    const id = rid.get(k);
    let k1 = 0, n1 = 0;
    for (const x of rounds) if (id !== undefined && x.r.feats.has(id)) {
      n1++;
      k1 += x.r.won;
    }
    const kAll2 = rounds.reduce((a, x) => a + x.r.won, 0);
    routes.push({ route: k, path: rt.path, share: rt.share, flank: rt.flank, kWith: k1, nWith: n1, kWithout: kAll2 - k1, nWithout: rounds.length - n1, delta: n1 >= MIN_WITH ? shrunkDelta(k1, n1, kAll2 - k1, rounds.length - n1, base) : 0 });
  });
  return { group: g.key, side, window: sel.window ?? null, slice: sel.slice ?? null, from, to, base, zones, routes, zone: g.zone };
}

/** The diverging colours: won more (teal), the grey midpoint, won less (orange). */
export const WIN_MORE: [number, number, number] = [0x1f / 255, 0xa3 / 255, 0x7a / 255];
export const WIN_LESS: [number, number, number] = [0xe0 / 255, 0x70 / 255, 0x2f / 255];
export const WIN_SAME: [number, number, number] = [0x8c / 255, 0x8c / 255, 0x87 / 255];
/** Difference in win rate at which a colour is at its pole. */
export const FULL_DELTA = 0.2;

/** A difference in win rate as a colour: grey at none, teal or orange at `FULL_DELTA` and beyond. */
export function deltaColor(d: number): [number, number, number] {
  const t = Math.max(-1, Math.min(1, (Number.isFinite(d) ? d : 0) / FULL_DELTA));
  const pole = t >= 0 ? WIN_MORE : WIN_LESS;
  const a = Math.abs(t);
  return [WIN_SAME[0] + (pole[0] - WIN_SAME[0]) * a, WIN_SAME[1] + (pole[1] - WIN_SAME[1]) * a, WIN_SAME[2] + (pole[2] - WIN_SAME[2]) * a];
}

export function cssColor(d: number): string {
  const [r, g, b] = deltaColor(d);
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

/** The map's lines: zones as squares (a "+" or "-" inside past a small difference), routes as paths with an arrowhead; the finding picked full. */
export function outcomeLines(m: OutcomeMap | null, focus: OutcomeFinding | null, heightAt: (x: number, z: number) => number): { data: Float32Array; count: number } | null {
  const out: number[] = [];
  const seg = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: [number, number, number], a: number) => out.push(x0, y0, z0, c[0], c[1], c[2], a, x1, y1, z1, c[0], c[1], c[2], a);
  const lift = m ? m.zone * 0.02 : 1;
  const square = (z: { x0: number; z0: number; x1: number; z1: number; y: number }, c: [number, number, number], a: number, inset: number) => {
    const y = z.y + lift;
    const x0 = z.x0 + inset, x1 = z.x1 - inset, z0 = z.z0 + inset, z1 = z.z1 - inset;
    seg(x0, y, z0, x1, y, z0, c, a);
    seg(x1, y, z0, x1, y, z1, c, a);
    seg(x1, y, z1, x0, y, z1, c, a);
    seg(x0, y, z1, x0, y, z0, c, a);
  };
  const dim = focus ? 0.45 : 1;
  if (m) {
    for (const z of m.zones) {
      const c = deltaColor(z.delta);
      const a = (0.45 + 0.55 * Math.min(1, z.nWith / 40)) * dim;
      const w = z.x1 - z.x0;
      square(z, c, a, w * 0.04);
      square(z, c, a * 0.7, w * 0.08);
      // A hatch that thickens with the difference, so a strong zone reads as filled from afar.
      const hatch = Math.round(Math.min(1, Math.abs(z.delta) / FULL_DELTA) * 6);
      for (let k = 1; k <= hatch; k++) {
        const f = k / (hatch + 1);
        const y = z.y + lift;
        const i0 = w * 0.08, x0 = z.x0 + i0, x1 = z.x1 - i0, z0 = z.z0 + i0, z1 = z.z1 - i0;
        seg(x0 + (x1 - x0) * f, y, z0, x0, y, z0 + (z1 - z0) * f, c, a * 0.55);
        seg(x1, y, z0 + (z1 - z0) * f, x0 + (x1 - x0) * f, y, z1, c, a * 0.55);
      }
      const cx = (z.x0 + z.x1) / 2, cz = (z.z0 + z.z1) / 2, y = z.y + lift, h = w * 0.18;
      if (z.delta > 0.05) {
        seg(cx - h, y, cz, cx + h, y, cz, c, a);
        seg(cx, y, cz - h, cx, y, cz + h, c, a);
      } else if (z.delta < -0.05) seg(cx - h, y, cz, cx + h, y, cz, c, a);
    }
    for (const r of m.routes) path(r.path, deltaColor(r.delta), (0.35 + 0.6 * Math.min(1, r.share * 4)) * dim);
  }
  function path(p: number[], c: [number, number, number], a: number) {
    const ys: number[] = [];
    for (let k = 0; k < ROUTE_POINTS; k++) ys.push(heightAt(p[k * 2], p[k * 2 + 1]) + lift * 2);
    for (let k = 0; k + 1 < ROUTE_POINTS; k++) seg(p[k * 2], ys[k], p[k * 2 + 1], p[k * 2 + 2], ys[k + 1], p[k * 2 + 3], c, a);
    // The arrowhead at its end.
    const n = ROUTE_POINTS - 1;
    const dx = p[n * 2] - p[n * 2 - 2], dz = p[n * 2 + 1] - p[n * 2 - 1];
    const len = Math.hypot(dx, dz);
    if (len > 0) {
      const ux = dx / len, uz = dz / len, s = Math.max(len * 0.6, (m?.zone ?? 10) * 0.25);
      for (const sgn of [-1, 1]) seg(p[n * 2], ys[n], p[n * 2 + 1], p[n * 2] - (ux + sgn * uz * 0.6) * s, ys[n], p[n * 2 + 1] - (uz - sgn * ux * 0.6) * s, c, a);
    }
  }
  if (focus) {
    const c = deltaColor(focus.diff);
    if (focus.zone) {
      square(focus.zone, c, 1, 0);
      square(focus.zone, c, 1, (focus.zone.x1 - focus.zone.x0) * 0.02);
    }
    if (focus.path) path(focus.path, c, 1);
    if (focus.point) {
      const [x, z] = focus.point;
      const y = heightAt(x, z) + lift;
      const h = (m?.zone ?? 50) * 0.5;
      seg(x, y, z, x, y + h, z, c, 1);
      seg(x - h * 0.3, y, z, x + h * 0.3, y, z, c, 1);
      seg(x, y, z - h * 0.3, x, y, z + h * 0.3, c, 1);
    }
  }
  return out.length ? { data: Float32Array.from(out), count: out.length / 7 } : null;
}
