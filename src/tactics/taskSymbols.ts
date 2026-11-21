/**
 * The board's task symbols, drawn by the board itself in the manner of the
 * APP-6 / MIL-STD-2525 task graphics (no symbol files of anyone else): a
 * pictogram and the task's letters on a dark plate - the badge a unit wears
 * and the mark at a task's place on the map - and a flat cone for a sector.
 *
 * One drawing per task as strokes in a box of -1..1 (y up), turned into a
 * GPU figure mesh (`figures/instances.ts`: drawn as an instance facing the
 * camera at a size on screen, so it reads at any zoom; the team's colour
 * tints the strokes) and into SVG for the legend and the picker.
 */

import { MESH_STRIDE, type FigureMesh } from '../figures/instances';
import { taskDef, type TaskKind } from './tasks';

type P = [number, number];
export interface Stroke {
  pts: P[];
  /** A filled convex shape instead of a line. */
  fill?: boolean;
}

/** The badge's plate: its half width and half height in glyph units. */
export const PLATE: P = [1.75, 0.95];

const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, n = 12): P[] => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + ((a1 - a0) * i) / n;
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
});
/** A line ending in a filled head. */
const arrow = (pts: P[], h = 0.32): Stroke[] => {
  const [ax, ay] = pts[pts.length - 2];
  const [bx, by] = pts[pts.length - 1];
  const l = Math.hypot(bx - ax, by - ay) || 1;
  const ux = (bx - ax) / l;
  const uy = (by - ay) / l;
  const base: P = [bx - ux * h, by - uy * h];
  return [{ pts: [...pts.slice(0, -1), base] }, { pts: [[bx, by], [base[0] - uy * h * 0.6, base[1] + ux * h * 0.6], [base[0] + uy * h * 0.6, base[1] - ux * h * 0.6]], fill: true }];
};

/** Each task's pictogram, in -0.8..0.8. */
const PICTO: Record<TaskKind | 'conflict', () => Stroke[]> = {
  attack: () => arrow([[-0.7, -0.7], [0.7, 0.7]], 0.42),
  seize: () => [...arrow([[-0.8, -0.6], [0.05, 0.05]]), { pts: arcPts(0.35, 0.3, 0.42, 0, Math.PI * 2, 16) }],
  secure: () => arrow(arcPts(0, 0, 0.62, Math.PI * 0.6, Math.PI * 2.35, 14), 0.3),
  breach: () => [{ pts: [[-0.35, -0.75], [-0.35, 0.75]] }, { pts: [[0.35, -0.75], [0.35, 0.75]] }, ...arrow([[-0.8, 0], [0.8, 0]])],
  sweep: () => arrow([[-0.7, 0.7], [0.7, 0.7], [0.7, 0.25], [-0.7, 0.25], [-0.7, -0.2], [0.7, -0.2], [0.7, -0.65], [-0.2, -0.65]], 0.28),
  ambush: () => [{ pts: arcPts(0.9, 0, 1.2, Math.PI * 0.78, Math.PI * 1.22, 10) }, { pts: [[-0.3, 0.45], [0.1, 0.3]] }, { pts: [[-0.38, 0], [0.05, 0]] }, { pts: [[-0.3, -0.45], [0.1, -0.3]] }, ...arrow([[0.2, 0], [0.8, 0]], 0.25)],
  defend: () => [{ pts: [[-0.7, 0.6], [-0.7, -0.5], [0.7, -0.5], [0.7, 0.6]] }, { pts: [[-0.7, 0.05], [-0.4, 0.05]] }, { pts: [[0.7, 0.05], [0.4, 0.05]] }, { pts: [[0, -0.5], [0, -0.2]] }],
  block: () => [{ pts: [[-0.8, 0], [0.45, 0]] }, { pts: [[0.45, -0.75], [0.45, 0.75]] }],
  delay: () => [...arrow([[0.8, 0.35], [-0.8, 0.35]], 0.28), { pts: [[0.8, -0.35], [-0.2, -0.35]] }, { pts: [[0.8, -0.6], [0.8, 0.6]] }],
  withdraw: () => [...arrow([[0, 0.75], [0, -0.75]], 0.34), { pts: [[-0.6, 0.75], [0.6, 0.75]] }],
  patrol: () => arrow([...arcPts(0, 0, 0.62, Math.PI * 0.15, Math.PI * 2.0, 18)], 0.3),
  screen: () => [{ pts: [[-0.8, 0.3], [0.8, 0.3]] }, { pts: [[-0.6, 0.3], [-0.6, -0.4]] }, { pts: [[0, 0.3], [0, -0.4]] }, { pts: [[0.6, 0.3], [0.6, -0.4]] }],
  guard: () => [{ pts: [[-0.65, 0.7], [0.65, 0.7], [0.6, -0.05], [0, -0.75], [-0.6, -0.05], [-0.65, 0.7]] }],
  recon: () => [{ pts: arcPts(0, -0.55, 0.95, Math.PI * 0.18, Math.PI * 0.82, 12) }, { pts: arcPts(0, 0.55, 0.95, Math.PI * 1.18, Math.PI * 1.82, 12) }, { pts: arcPts(0, 0, 0.18, 0, Math.PI * 2, 8), fill: true }],
  follow: () => [{ pts: [[-0.75, 0.6], [-0.15, 0], [-0.75, -0.6]] }, { pts: [[0.05, 0.6], [0.65, 0], [0.05, -0.6]] }],
  escort: () => [{ pts: [[-0.75, 0.75], [-0.15, 0.2], [-0.75, -0.35]] }, ...arrow([[-0.1, -0.5], [0.75, -0.5]], 0.28), { pts: [[0.1, 0.75], [0.7, 0.2], [0.1, -0.15]] }],
  overwatch: () => [{ pts: [[-0.7, -0.75], [-0.7, 0.75]] }, ...arrow([[-0.7, 0.35], [0.75, 0.7]], 0.28), ...arrow([[-0.7, -0.35], [0.75, -0.7]], 0.28)],
  suppress: () => arrow([[-0.8, -0.4], [-0.4, 0.3], [-0.05, -0.3], [0.3, 0.35], [0.8, 0.35]], 0.3),
  smoke: () => [{ pts: [[-0.8, 0.35], [-0.4, 0.6], [0, 0.35], [0.4, 0.6], [0.8, 0.35]] }, { pts: [[-0.8, -0.25], [-0.4, 0], [0, -0.25], [0.4, 0], [0.8, -0.25]] }, { pts: [[-0.6, -0.7], [0.6, -0.7]] }],
  orbit: () => [{ pts: [...arcPts(0.35, 0, 0.42, -Math.PI / 2, Math.PI / 2, 8), ...arcPts(-0.35, 0, 0.42, Math.PI / 2, Math.PI * 1.5, 8), [0.35, -0.42]] }, { pts: [[0.05, 0.42], [-0.2, 0.62], [-0.2, 0.22]], fill: true }],
  cas: () => [{ pts: arcPts(0, 0, 0.55, 0, Math.PI * 2, 16) }, { pts: [[-0.85, 0], [-0.25, 0]] }, { pts: [[0.25, 0], [0.85, 0]] }, { pts: [[0, -0.85], [0, -0.25]] }, { pts: [[0, 0.25], [0, 0.85]] }],
  sead: () => [{ pts: [[0.15, 0.85], [-0.45, 0.05], [0.1, 0.05], [-0.25, -0.85], [0.55, 0.2], [0, 0.2], [0.4, 0.85]] }],
  strike: () => [...arrow([[-0.7, 0.75], [0.1, -0.05]], 0.3), { pts: [[0.3, -0.25], [0.8, -0.75]] }, { pts: [[0.8, -0.25], [0.3, -0.75]] }],
  intercept: () => [...arrow([[-0.8, 0.7], [0.45, 0.05]], 0.28), ...arrow([[-0.8, -0.7], [0.45, -0.05]], 0.28)],
  hold: () => [{ pts: [[-0.3, -0.7], [-0.3, 0.7]] }, { pts: [[0.3, -0.7], [0.3, 0.7]] }],
  phaseLine: () => [{ pts: [[0, -0.85], [0, -0.35]] }, { pts: [[0, -0.15], [0, 0.15]] }, { pts: [[0, 0.35], [0, 0.85]] }],
  rally: () => [{ pts: [[-0.7, -0.55], [0.7, -0.55], [0, 0.7], [-0.7, -0.55]] }],
  roe: () => [{ pts: arcPts(0, 0, 0.65, 0, Math.PI * 2, 16) }, { pts: [[-0.46, -0.46], [0.46, 0.46]] }],
  alarm: () => [{ pts: arcPts(-0.6, 0, 0.45, -Math.PI / 4, Math.PI / 4, 6) }, { pts: arcPts(-0.6, 0, 0.85, -Math.PI / 4, Math.PI / 4, 8) }, { pts: arcPts(-0.6, 0, 1.25, -Math.PI / 4, Math.PI / 4, 10) }],
  game: () => [{ pts: [[-0.75, -0.6], [0.75, -0.6], [0.75, 0.6], [-0.75, 0.6], [-0.75, -0.6]] }],
  conflict: () => [{ pts: [[-0.8, -0.65], [0.8, -0.65], [0, 0.8], [-0.8, -0.65]] }, { pts: [[0, 0.35], [0, -0.15]] }, { pts: [[0, -0.32], [0, -0.42]] }],
};

/** A small stroke font for the badges' letters, in 0..1 (y up). */
const FONT: Record<string, P[][]> = {
  A: [[[0, 0], [0.5, 1], [1, 0]], [[0.22, 0.42], [0.78, 0.42]]],
  B: [[[0, 0], [0, 1], [0.7, 1], [0.9, 0.85], [0.9, 0.64], [0.7, 0.52], [0, 0.52]], [[0.7, 0.52], [1, 0.36], [1, 0.15], [0.8, 0], [0, 0]]],
  C: [[[1, 0.85], [0.8, 1], [0.2, 1], [0, 0.8], [0, 0.2], [0.2, 0], [0.8, 0], [1, 0.15]]],
  D: [[[0, 0], [0, 1], [0.6, 1], [1, 0.7], [1, 0.3], [0.6, 0], [0, 0]]],
  E: [[[1, 1], [0, 1], [0, 0], [1, 0]], [[0, 0.5], [0.7, 0.5]]],
  F: [[[1, 1], [0, 1], [0, 0]], [[0, 0.5], [0.7, 0.5]]],
  G: [[[1, 0.85], [0.8, 1], [0.2, 1], [0, 0.8], [0, 0.2], [0.2, 0], [0.8, 0], [1, 0.2], [1, 0.45], [0.55, 0.45]]],
  H: [[[0, 0], [0, 1]], [[1, 0], [1, 1]], [[0, 0.5], [1, 0.5]]],
  I: [[[0.5, 0], [0.5, 1]], [[0.2, 1], [0.8, 1]], [[0.2, 0], [0.8, 0]]],
  K: [[[0, 0], [0, 1]], [[1, 1], [0, 0.4]], [[0.3, 0.62], [1, 0]]],
  L: [[[0, 1], [0, 0], [1, 0]]],
  M: [[[0, 0], [0, 1], [0.5, 0.45], [1, 1], [1, 0]]],
  N: [[[0, 0], [0, 1], [1, 0], [1, 1]]],
  O: [[[0.2, 0], [0, 0.2], [0, 0.8], [0.2, 1], [0.8, 1], [1, 0.8], [1, 0.2], [0.8, 0], [0.2, 0]]],
  P: [[[0, 0], [0, 1], [0.8, 1], [1, 0.85], [1, 0.6], [0.8, 0.45], [0, 0.45]]],
  R: [[[0, 0], [0, 1], [0.8, 1], [1, 0.85], [1, 0.6], [0.8, 0.45], [0, 0.45]], [[0.5, 0.45], [1, 0]]],
  S: [[[1, 0.85], [0.8, 1], [0.2, 1], [0, 0.8], [0, 0.64], [0.2, 0.52], [0.8, 0.48], [1, 0.36], [1, 0.2], [0.8, 0], [0.2, 0], [0, 0.15]]],
  T: [[[0, 1], [1, 1]], [[0.5, 1], [0.5, 0]]],
  U: [[[0, 1], [0, 0.2], [0.2, 0], [0.8, 0], [1, 0.2], [1, 1]]],
  W: [[[0, 1], [0.2, 0], [0.5, 0.6], [0.8, 0], [1, 1]]],
  Y: [[[0, 1], [0.5, 0.5], [1, 1]], [[0.5, 0.5], [0.5, 0]]],
  Z: [[[0, 1], [1, 1], [0, 0], [1, 0]]],
  '?': [[[0, 0.75], [0.2, 1], [0.8, 1], [1, 0.8], [1, 0.6], [0.5, 0.4], [0.5, 0.22]], [[0.5, 0.07], [0.5, 0]]],
  '!': [[[0.5, 1], [0.5, 0.3]], [[0.5, 0.1], [0.5, 0]]],
};

/** Letters as strokes, centred on (cx, cy), `h` high. */
function text(s: string, cx: number, cy: number, h: number, maxW: number): Stroke[] {
  const w = h * 0.62;
  const gap = h * 0.24;
  const n = s.length;
  const k = Math.min(1, maxW / (n * w + (n - 1) * gap));
  const W = w * k;
  const H = h * k;
  const G = gap * k;
  const x0 = cx - (n * W + (n - 1) * G) / 2;
  const out: Stroke[] = [];
  [...s].forEach((ch, i) => {
    for (const line of FONT[ch] ?? []) out.push({ pts: line.map(([x, y]) => [x0 + i * (W + G) + x * W, cy - H / 2 + y * H] as P) });
  });
  return out;
}

const fit = (ss: Stroke[], cx: number, cy: number, k: number): Stroke[] => ss.map((s) => ({ ...s, pts: s.pts.map(([x, y]) => [cx + x * k, cy + y * k] as P) }));

/** A badge's drawing: the pictogram on the left, the letters on the right; a conflict a lone warning sign. */
export function badgeStrokes(kind: TaskKind | 'conflict'): { picto: Stroke[]; letters: Stroke[] } {
  if (kind === 'conflict') return { picto: fit(PICTO.conflict(), 0, 0, 1), letters: [] };
  return { picto: fit(PICTO[kind](), -0.98, 0, 0.82), letters: text(taskDef(kind).code, 0.72, 0, 0.98, 1.75) };
}

/** A pictogram alone, -1..1. */
export function pictoStrokes(kind: TaskKind | 'conflict'): Stroke[] {
  return PICTO[kind]();
}

/** SVG path data for strokes, y down: open lines, and filled shapes apart. */
export function svgPaths(ss: Stroke[]): { lines: string; fills: string } {
  const d = (s: Stroke) => s.pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(3)} ${(-y).toFixed(3)}`).join('') + (s.fill ? 'Z' : '');
  return { lines: ss.filter((s) => !s.fill).map(d).join(''), fills: ss.filter((s) => s.fill).map(d).join('') };
}

// ---------------------------------------------------------------------------
// Meshes

function meshBuilder() {
  const v: number[] = [];
  /** A triangle, both ways round; `tint` 1 takes the team's colour. */
  const tri = (a: [number, number, number], b: [number, number, number], c: [number, number, number], rgb: [number, number, number], alpha: number, tint: number) => {
    for (const p of [a, b, c, a, c, b]) {
      const o = v.length;
      v.length += MESH_STRIDE;
      v.fill(0, o);
      v[o] = p[0];
      v[o + 1] = p[1];
      v[o + 2] = p[2];
      v[o + 3] = rgb[0];
      v[o + 4] = rgb[1];
      v[o + 5] = rgb[2];
      v[o + 6] = alpha;
      v[o + 11] = tint;
    }
  };
  return { v, tri };
}

/** Strokes as flat triangles at depth `z` (glyph x, y as template x, y): lines `hw` half wide with square ends. */
function strokeTris(b: ReturnType<typeof meshBuilder>, ss: Stroke[], hw: number, z: number, rgb: [number, number, number], alpha: number, tint: number): void {
  for (const s of ss) {
    if (s.fill) {
      for (let i = 1; i + 1 < s.pts.length; i++) b.tri([s.pts[0][0], s.pts[0][1], z], [s.pts[i][0], s.pts[i][1], z], [s.pts[i + 1][0], s.pts[i + 1][1], z], rgb, alpha, tint);
      continue;
    }
    for (let i = 0; i + 1 < s.pts.length; i++) {
      const [ax, ay] = s.pts[i];
      const [bx, by] = s.pts[i + 1];
      const l = Math.hypot(bx - ax, by - ay);
      if (l < 1e-6) continue;
      const ux = ((bx - ax) / l) * hw;
      const uy = ((by - ay) / l) * hw;
      const p0: [number, number, number] = [ax - ux - uy, ay - uy + ux, z];
      const p1: [number, number, number] = [bx + ux - uy, by + uy + ux, z];
      const p2: [number, number, number] = [bx + ux + uy, by + uy - ux, z];
      const p3: [number, number, number] = [ax - ux + uy, ay - uy - ux, z];
      b.tri(p0, p1, p2, rgb, alpha, tint);
      b.tri(p0, p2, p3, rgb, alpha, tint);
    }
  }
}

const meshes = new Map<string, FigureMesh>();
let nextId = -1000;

/**
 * A task's badge as a figure mesh, 1 unit high (template x right, y up, z
 * toward the camera when drawn facing it): a dark plate, a thin rim and
 * the strokes in the team's colour; a conflict's in warning red.
 */
export function badgeMesh(kind: TaskKind | 'conflict'): FigureMesh {
  let m = meshes.get(kind);
  if (m) return m;
  const b = meshBuilder();
  const k = 0.5 / PLATE[1];
  const [w, h] = kind === 'conflict' ? [1, 1] : PLATE;
  const plate: P[] = [[-w, -h + 0.25], [-w + 0.25, -h], [w - 0.25, -h], [w, -h + 0.25], [w, h - 0.25], [w - 0.25, h], [-w + 0.25, h], [-w, h - 0.25]];
  const sc = (pts: P[]): Stroke[] => [{ pts: pts.map(([x, y]) => [x * k, y * k] as P), fill: true }];
  const dark: [number, number, number] = [0.06, 0.07, 0.08];
  strokeTris(b, sc(plate), 0, 0, dark, 0.82, 0);
  const red: [number, number, number] = [1, 0.25, 0.2];
  const scaled = (ss: Stroke[]) => ss.map((s) => ({ ...s, pts: s.pts.map(([x, y]) => [x * k, y * k] as P) }));
  strokeTris(b, scaled([{ pts: [...plate, plate[0]] }]), 0.035 * k, 0.01, kind === 'conflict' ? red : [1, 1, 1], 1, kind === 'conflict' ? 0 : 1);
  const { picto, letters } = badgeStrokes(kind);
  strokeTris(b, scaled(picto), 0.075 * k, 0.02, kind === 'conflict' ? red : [1, 1, 1], 1, kind === 'conflict' ? 0 : 1);
  strokeTris(b, scaled(letters), 0.07 * k, 0.02, [1, 1, 1], 1, 1);
  m = { id: nextId--, data: new Float32Array(b.v), count: b.v.length / MESH_STRIDE };
  meshes.set(kind, m);
  return m;
}

/** A badge's width over its height. */
export const BADGE_ASPECT = PLATE[0] / PLATE[1];

/**
 * A sector as a flat cone, radius 1 (template x ahead, z right, lying in
 * y = 0): a faint fill, a solid rim and sides. Its width is rounded to 5
 * degrees, so a few meshes cover every sector.
 */
export function coneMesh(arc: number): FigureMesh {
  const deg = Math.max(5, Math.min(360, Math.round((arc * 180) / Math.PI / 5) * 5));
  let m = cones.get(deg);
  if (m) return m;
  const b = meshBuilder();
  const half = (deg * Math.PI) / 360;
  const n = Math.max(4, Math.ceil(deg / 6));
  const white: [number, number, number] = [1, 1, 1];
  const at = (a: number, r: number): [number, number, number] => [Math.cos(a) * r, 0, Math.sin(a) * r];
  for (let i = 0; i < n; i++) {
    const a0 = -half + (2 * half * i) / n;
    const a1 = -half + (2 * half * (i + 1)) / n;
    b.tri([0, 0, 0], at(a0, 0.985), at(a1, 0.985), white, 0.2, 1);
    b.tri(at(a0, 0.985), at(a0, 1), at(a1, 1), white, 0.85, 1);
    b.tri(at(a0, 0.985), at(a1, 1), at(a1, 0.985), white, 0.85, 1);
  }
  if (deg < 360) {
    for (const s of [-1, 1]) {
      const a = s * half;
      const nx = -Math.sin(a) * 0.005;
      const nz = Math.cos(a) * 0.005;
      const e = at(a, 1);
      b.tri([nx, 0, nz], [e[0] + nx, 0, e[2] + nz], [e[0] - nx, 0, e[2] - nz], white, 0.85, 1);
      b.tri([nx, 0, nz], [e[0] - nx, 0, e[2] - nz], [-nx, 0, -nz], white, 0.85, 1);
    }
  }
  m = { id: nextId--, data: new Float32Array(b.v), count: b.v.length / MESH_STRIDE };
  cones.set(deg, m);
  return m;
}

const cones = new Map<number, FigureMesh>();
