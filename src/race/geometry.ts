/**
 * Coloured geometry for the race scene: growable vertex buffers in the
 * renderer's line-vertex layout (xyz, rgba), boxes and quads with their
 * shading baked in, and the colours the race tab uses.
 */

import { oklchToRgb, teamHueCount, teamSlice } from '../render/colors';

export type Rgb = [number, number, number];

/** Seven floats a vertex, grown as needed and reused frame to frame. */
export class VertexBuffer {
  data = new Float32Array(7 * 4096);
  count = 0;

  reset(): void {
    this.count = 0;
  }

  private grow(extra: number): void {
    const need = (this.count + extra) * 7;
    if (need <= this.data.length) return;
    let size = this.data.length;
    while (size < need) size *= 2;
    const next = new Float32Array(size);
    next.set(this.data.subarray(0, this.count * 7));
    this.data = next;
  }

  vertex(x: number, y: number, z: number, r: number, g: number, b: number, a: number): void {
    this.grow(1);
    const o = this.count * 7;
    const d = this.data;
    d[o] = x;
    d[o + 1] = y;
    d[o + 2] = z;
    d[o + 3] = r;
    d[o + 4] = g;
    d[o + 5] = b;
    d[o + 6] = a;
    this.count++;
  }

  triangle(a: Vec3, b: Vec3, c: Vec3, col: Rgb, alpha = 1): void {
    this.vertex(a[0], a[1], a[2], col[0], col[1], col[2], alpha);
    this.vertex(b[0], b[1], b[2], col[0], col[1], col[2], alpha);
    this.vertex(c[0], c[1], c[2], col[0], col[1], col[2], alpha);
  }

  /** Two triangles, corners in order round the quad. */
  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, col: Rgb, alpha = 1): void {
    this.triangle(a, b, c, col, alpha);
    this.triangle(a, c, d, col, alpha);
  }

  line(a: Vec3, b: Vec3, col: Rgb, alpha = 1): void {
    this.vertex(a[0], a[1], a[2], col[0], col[1], col[2], alpha);
    this.vertex(b[0], b[1], b[2], col[0], col[1], col[2], alpha);
  }
}

export type Vec3 = [number, number, number];

/** A frame to build a shape in: origin and three axes, world space. */
export interface Frame3 {
  o: Vec3;
  /** Forward, right, up - unit vectors. */
  f: Vec3;
  r: Vec3;
  u: Vec3;
}

/** A point `fwd` ahead, `side` to the right and `up` above the frame's origin. */
export function at(fr: Frame3, fwd: number, side: number, up: number): Vec3 {
  return [
    fr.o[0] + fr.f[0] * fwd + fr.r[0] * side + fr.u[0] * up,
    fr.o[1] + fr.f[1] * fwd + fr.r[1] * side + fr.u[1] * up,
    fr.o[2] + fr.f[2] * fwd + fr.r[2] * side + fr.u[2] * up,
  ];
}

/** A level frame at (x, y, z) facing `heading` (atan2(dx, dz)). */
export function headingFrame(x: number, y: number, z: number, heading: number): Frame3 {
  const s = Math.sin(heading);
  const c = Math.cos(heading);
  return { o: [x, y, z], f: [s, 0, c], r: [-c, 0, s], u: [0, 1, 0] };
}

export function shade(col: Rgb, k: number): Rgb {
  return [col[0] * k, col[1] * k, col[2] * k];
}

export function mix(a: Rgb, b: Rgb, t: number): Rgb {
  const u = Math.max(0, Math.min(1, t));
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

/**
 * A box: `cx, cy, cz` its centre in the frame (forward, right, up), `l, w, h`
 * its length, width and height. Faces are shaded as if lit from above and a
 * little ahead, so the shape reads without a lighting pass.
 */
export function box(
  out: VertexBuffer,
  fr: Frame3,
  cx: number,
  cy: number,
  cz: number,
  l: number,
  w: number,
  h: number,
  col: Rgb,
  alpha = 1,
  topCol?: Rgb,
): void {
  const x0 = cx - l / 2;
  const x1 = cx + l / 2;
  const y0 = cy - w / 2;
  const y1 = cy + w / 2;
  const z0 = cz - h / 2;
  const z1 = cz + h / 2;
  const p = (a: number, b: number, c: number) => at(fr, a, b, c);
  // Top, then the four sides, then the bottom.
  out.quad(p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1), topCol ?? col, alpha);
  out.quad(p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), p(x1, y0, z1), shade(col, 0.86), alpha);
  out.quad(p(x0, y1, z0), p(x0, y0, z0), p(x0, y0, z1), p(x0, y1, z1), shade(col, 0.62), alpha);
  out.quad(p(x0, y0, z0), p(x1, y0, z0), p(x1, y0, z1), p(x0, y0, z1), shade(col, 0.74), alpha);
  out.quad(p(x1, y1, z0), p(x0, y1, z0), p(x0, y1, z1), p(x1, y1, z1), shade(col, 0.74), alpha);
  out.quad(p(x0, y1, z0), p(x1, y1, z0), p(x1, y0, z0), p(x0, y0, z0), shade(col, 0.4), alpha);
}

/**
 * The colour of lap `index` of `count`: the hues the team heat mode gives its
 * groups, so any number of laps stay as far apart on the colour wheel as they
 * can.
 *
 * Only the hue is the heat's. Its lightness is fixed because in the heat,
 * lightness is density; a car has no such constraint, and equal lightness is
 * exactly what makes two hues a quarter-turn apart collapse into one for a
 * colour-blind eye. So each slot's lightness and chroma are chosen, slot by
 * slot, to stand furthest from its neighbours under protan and deutan
 * simulation as well as normal vision - the checks of the dataviz palette
 * validator, against the dark surface, inside its lightness band.
 */
export function lapColor(index: number, count: number): Rgb {
  const n = Math.max(1, Math.floor(count));
  let palette = palettes.get(n);
  if (!palette) palettes.set(n, (palette = buildPalette(n)));
  return palette[Math.max(0, Math.min(n - 1, index))];
}

const palettes = new Map<number, Rgb[]>();

const LIGHTNESS = [0.52, 0.55, 0.58, 0.61, 0.64, 0.66];
const CHROMA = [0.12, 0.14, 0.16, 0.18];

function buildPalette(n: number): Rgb[] {
  const slices = teamHueCount(n);
  const out: Rgb[] = [];
  for (let i = 0; i < n; i++) {
    const hue = (teamSlice(i, n) + 0.5) / slices;
    let best: Rgb | null = null;
    let bestScore = -Infinity;
    for (const L of LIGHTNESS) {
      for (const C of CHROMA) {
        const rgb = oklchToRgb(hue, C, L);
        const lab = toOklab(rgb);
        // In the band after gamut clipping, with some colour left, and at
        // 3:1 against the surface so a thin line still reads.
        if (lab[0] < 0.49 || lab[0] > 0.665 || Math.hypot(lab[1], lab[2]) < 0.1) continue;
        if (contrast(rgb, SURFACE) < 3) continue;
        // Against the slot before, and the last against the first: on the
        // colour wheel those are neighbours too.
        const against = [out[i - 1], i === n - 1 && n > 2 ? out[0] : undefined].filter(
          (c): c is Rgb => !!c,
        );
        let score = against.length ? Infinity : Math.hypot(lab[1], lab[2]) * 100 + lab[0];
        for (const other of against) score = Math.min(score, separation(rgb, other));
        if (score > bestScore) {
          bestScore = score;
          best = rgb;
        }
      }
    }
    out.push(best ?? oklchToRgb(hue, 0.13, 0.6));
  }
  return out;
}

/** How far apart two colours are, as a fraction of the validator's targets: CVD 8, normal 15. */
function separation(a: Rgb, b: Rgb): number {
  const normal = distance(toOklab(a), toOklab(b)) * 100;
  let cvd = Infinity;
  for (const m of [PROTAN, DEUTAN])
    cvd = Math.min(cvd, distance(toOklab(simulate(a, m)), toOklab(simulate(b, m))) * 100);
  return Math.min(cvd / 8, normal / 15);
}

// Machado, Oliveira and Fernandes (2009), severity 1, on linear RGB - the
// simulation the validator's thresholds are calibrated against.
const PROTAN = [
  0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998,
];
const DEUTAN = [
  0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881,
];

function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function toGamma(c: number): number {
  const v = Math.max(0, Math.min(1, c));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
}

function simulate(rgb: Rgb, m: number[]): Rgb {
  const [r, g, b] = rgb.map(toLinear);
  return [
    toGamma(m[0] * r + m[1] * g + m[2] * b),
    toGamma(m[3] * r + m[4] * g + m[5] * b),
    toGamma(m[6] * r + m[7] * g + m[8] * b),
  ];
}

function toOklab(rgb: Rgb): [number, number, number] {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** The viewer's dark chart surface. */
const SURFACE: Rgb = [0x1c / 255, 0x1d / 255, 0x21 / 255];

function contrast(a: Rgb, b: Rgb): number {
  const lum = (c: Rgb) => {
    const [r, g, bl] = c.map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function rgbCss([r, g, b]: Rgb): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255);
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

/** Cold blue, working green, hot red: tyre and brake temperature. */
export function temperatureColor(t: number): Rgb {
  const stops: [number, Rgb][] = [
    [0, [0.2, 0.45, 1]],
    [0.35, [0.25, 0.85, 0.95]],
    [0.55, [0.3, 0.9, 0.35]],
    [0.75, [1, 0.85, 0.2]],
    [1, [1, 0.25, 0.2]],
  ];
  return ramp(stops, t);
}

/** Extended blue, mid white, compressed red: suspension travel. */
export function travelColor(t: number): Rgb {
  return ramp(
    [
      [0, [0.3, 0.55, 1]],
      [0.5, [0.92, 0.92, 0.92]],
      [1, [1, 0.3, 0.25]],
    ],
    t,
  );
}

/** Grip in hand green, at the limit amber, past it red: tyre slip. */
export function slipColor(t: number): Rgb {
  return ramp(
    [
      [0, [0.3, 0.85, 0.4]],
      [0.66, [1, 0.8, 0.2]],
      [1, [1, 0.2, 0.2]],
    ],
    t,
  );
}

/** Time lost red, time gained green, grey between: the "where" map. */
export function deltaColor(secondsPerMetre: number, scale: number): Rgb {
  const t = Math.max(-1, Math.min(1, secondsPerMetre / scale));
  return t >= 0
    ? mix([0.55, 0.55, 0.58], [1, 0.22, 0.2], t)
    : mix([0.55, 0.55, 0.58], [0.2, 0.85, 0.35], -t);
}

function ramp(stops: [number, Rgb][], t: number): Rgb {
  const v = Math.max(0, Math.min(1, Number.isFinite(t) ? t : 0));
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const [a, ca] = stops[i - 1];
      const [b, cb] = stops[i];
      return mix(ca, cb, (v - a) / (b - a));
    }
  }
  return stops[stops.length - 1][1];
}

/** Colours for the kinds of cause on the "why" map, by group. */
export const CAUSE_COLORS: Record<string, Rgb> = {
  braking: [1, 0.45, 0.2],
  entry: [0.95, 0.3, 0.75],
  exit: [0.3, 0.6, 1],
  straight: [1, 0.85, 0.25],
  car: [0.6, 0.6, 0.66],
  context: [0.45, 0.45, 0.5],
};
