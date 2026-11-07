/**
 * A simplified car, built from a `CarState`.
 *
 * An open-wheeler in the lap's colour - nose, cockpit with a helmet in it,
 * sidepods, wings - so the front is obvious from any angle and nothing hides
 * the wheels: four round wheels, the front ones turned by the steering, each
 * on its wishbones, pushrod and upright. The body rides on the suspension: it
 * sinks, pitches and rolls with the travel of the four corners, so the arms
 * move as the car brakes, turns and lands. Brake lights, and whatever else the
 * lap carries drawn by the channel table's hints (`CHANNELS` in schema.ts):
 *
 * - each per-wheel channel with a `glyph` is drawn on its wheel by that
 *   glyph's entry in `WHEEL_GLYPHS` below - tyre colour, slip ring, the
 *   pushrod coloured by its travel, brake glow, wear band, load bar;
 * - each `lamp` channel that is on lights a lamp over the airbox in its colour -
 *   ABS or traction control acting, DRS open, pit limiter, handbrake.
 *
 * A new channel of an existing kind is one line in the channel table and
 * nothing here. A new kind of glyph is one entry in `WHEEL_GLYPHS` (and its
 * flat twin on the car's card, `CARD_GLYPHS` in RaceHud.tsx).
 */

import {
  box,
  headingFrame,
  at,
  mix,
  shade,
  slipColor,
  temperatureColor,
  travelColor,
  type Frame3,
  type Rgb,
  type Vec3,
  type VertexBuffer,
} from './geometry';
import type { CarModel } from './carModel';
import type { CarState } from './replay';
import { CHANNELS, type WheelGlyph } from './schema';
import { disc, lightOn, loft, rod, tread, wheel as drawWheel, type Section } from './shapes';

export interface GlyphOptions {
  /** Size multiplier: 1 is a real car's size. */
  scale: number;
  /** +1 or -1: which way a positive steer turns the car (see `LapMotion`). */
  steerSign: number;
  /** +1 when the game's right wheels are on the frame's right, -1 when mirrored. */
  wheelSide: number;
  /** Draw the per-wheel telemetry and the lamps (off: a plain car). */
  telemetry: boolean;
  /** Highlight: the car the camera follows or the list has selected. */
  selected: boolean;
  /**
   * `plain`: the shape and the colour only - a fraction of the triangles, for
   * a crowd of cars nobody is looking at closely. `full` by default.
   */
  detail?: 'full' | 'plain';
  /** The car's own body, in place of the single-seater. See `carMatch.ts`. */
  model?: CarModel;
}

/** How far under the recorded position the road is, metres. */
export const WHEEL_HEIGHT = 0.3;

/** Axles forward of the car's centre, metres. */
const FRONT_AXLE = 1.45;
const REAR_AXLE = -1.3;
/** Half the track: wheel centre from the centreline. */
const TRACK = 0.8;
const WHEEL_R = 0.33;
const FRONT_W = 0.3;
const REAR_W = 0.38;
/** Most the front wheels turn at full lock, radians. */
const LOCK = 0.5;
/**
 * How far the body moves over a corner from full droop to full bump, metres:
 * more than a real car's, so it shows from a chase camera.
 */
const TRAVEL = 0.12;

const TYRE: Rgb = [0.13, 0.13, 0.14];
const RIM: Rgb = [0.72, 0.73, 0.77];
const CARBON: Rgb = [0.15, 0.15, 0.17];
/** The suspension arms: light enough to read against the tyres and the road. */
const ARM: Rgb = [0.62, 0.63, 0.67];

/** A lamp is on above this share of its display range. */
const LAMP_ON = 0.5;

// The body, as cross-sections from front to back: forward, half-width,
// half-height, height of the centre.
const TUB: Section[] = [
  { x: 2.3, w: 0.05, h: 0.04, z: 0.24 },
  { x: 2.15, w: 0.1, h: 0.08, z: 0.27 },
  { x: 1.8, w: 0.14, h: 0.12, z: 0.33 },
  { x: 1.3, w: 0.19, h: 0.17, z: 0.38 },
  { x: 0.7, w: 0.25, h: 0.22, z: 0.4 },
  { x: 0.1, w: 0.29, h: 0.24, z: 0.38 },
  { x: -0.5, w: 0.27, h: 0.22, z: 0.37 },
  { x: -1.1, w: 0.17, h: 0.15, z: 0.33 },
  { x: -1.55, w: 0.1, h: 0.09, z: 0.3 },
  { x: -1.75, w: 0.05, h: 0.05, z: 0.3 },
];
const ENGINE_COVER: Section[] = [
  { x: 0.0, w: 0.08, h: 0.05, z: 0.66 },
  { x: -0.15, w: 0.14, h: 0.15, z: 0.74 },
  { x: -0.5, w: 0.15, h: 0.15, z: 0.68 },
  { x: -1.0, w: 0.11, h: 0.11, z: 0.54 },
  { x: -1.5, w: 0.06, h: 0.06, z: 0.4 },
];
const HELMET: Section[] = [
  { x: 0.36, w: 0.02, h: 0.02, z: 0.72 },
  { x: 0.31, w: 0.1, h: 0.09, z: 0.72 },
  { x: 0.2, w: 0.12, h: 0.12, z: 0.73 },
  { x: 0.09, w: 0.09, h: 0.09, z: 0.72 },
  { x: 0.05, w: 0.02, h: 0.02, z: 0.71 },
];
/** The right sidepod; the left is its mirror. */
const SIDEPOD: Section[] = [
  { x: 0.62, w: 0.2, h: 0.1, z: 0.36, y: 0.38 },
  { x: 0.5, w: 0.27, h: 0.17, z: 0.35, y: 0.42 },
  { x: 0.0, w: 0.27, h: 0.17, z: 0.33, y: 0.41 },
  { x: -0.6, w: 0.2, h: 0.12, z: 0.29, y: 0.32 },
  { x: -1.1, w: 0.1, h: 0.07, z: 0.25, y: 0.18 },
];
/** The halo over the cockpit, as a polyline from the front pillar round one side. */
const HALO: [number, number, number][] = [
  [0.62, 0, 0.6],
  [0.5, 0, 0.84],
  [0.38, 0.17, 0.84],
  [0.12, 0.24, 0.8],
  [-0.02, 0.25, 0.63],
];

/** Where a car's wheels are, FL, FR, RL, RR: its own body's, or the single-seater's. */
export function wheelPlaces(model: CarModel | undefined, wheelSide: number): { fx: number; side: number; radius: number }[] {
  if (model) return model.wheels.map((w) => ({ fx: w.fx, side: w.side * wheelSide, radius: w.radius }));
  const r = TRACK * wheelSide;
  return [
    { fx: FRONT_AXLE, side: -r, radius: WHEEL_R },
    { fx: FRONT_AXLE, side: r, radius: WHEEL_R },
    { fx: REAR_AXLE, side: -r, radius: WHEEL_R },
    { fx: REAR_AXLE, side: r, radius: WHEEL_R },
  ];
}

/** Each glyph's colour for a value of 0 to 1: the wheels, the card and the help mode's key all take it from here. */
export const GLYPH_COLORS: Record<WheelGlyph, (value: number) => Rgb> = {
  tyreColour: temperatureColor,
  slipRing: slipColor,
  suspensionBar: travelColor,
  brakeGlow: (v) => mix([0.25, 0.2, 0.2], [1, 0.45, 0.1], v),
  wearBand: (v) => mix([0.9, 0.9, 0.9], [1, 0.2, 0.2], v),
  loadBar: travelColor,
};

function norm(value: number, range: [number, number] | undefined): number {
  if (!range) return value;
  return (value - range[0]) / (range[1] - range[0]);
}

/**
 * What each glyph shows for one wheel, from the lap's per-wheel channels:
 * each channel's value on its display range (0..1), or for the slip ring the
 * largest slip as the game reports it (1 is the edge of grip). A glyph with
 * no channel in this lap is absent.
 */
export function wheelGlyphValues(
  state: CarState,
  wheel: number,
): Partial<Record<WheelGlyph, number>> {
  const out: Partial<Record<WheelGlyph, number>> = {};
  for (const [family, values] of Object.entries(state.wheels)) {
    const info = CHANNELS[family];
    const v = values[wheel];
    if (!info?.glyph || !Number.isFinite(v)) continue;
    if (info.glyph === 'slipRing') {
      out.slipRing = Math.max(out.slipRing ?? 0, Math.abs(v));
    } else if (out[info.glyph] === undefined) {
      out[info.glyph] = norm(v, info.display);
    }
  }
  return out;
}

/** The lamp channels that are on at this moment, with their colours. */
export function litLamps(state: CarState): { name: string; short: string; color: string }[] {
  const out: { name: string; short: string; color: string }[] = [];
  for (const [name, v] of Object.entries(state.values)) {
    const info = CHANNELS[name];
    if (info?.input !== 'lamp' || !Number.isFinite(v)) continue;
    if (norm(v, info.display ?? [0, 1]) > LAMP_ON) {
      out.push({ name, short: info.short ?? name, color: info.lamp ?? '#ffb14a' });
    }
  }
  return out;
}

function hexRgb(css: string): Rgb {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(css);
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [1, 0.7, 0.3];
}

/** Where a wheel is and how it sits, for the glyphs drawn on it. */
interface WheelDraw {
  out: VertexBuffer;
  /** The car's frame on the road, scaled. */
  car: Frame3;
  /** The body's frame: the car's, moved by the suspension. */
  body: Frame3;
  /** The wheel's own frame, turned with the steering, scaled. */
  wheel: Frame3;
  /** Forward position of the axle and side (signed) of the wheel in the car frame. */
  fx: number;
  side: number;
  /** Hub height above the road; the tyre's radius and width. */
  hub: number;
  radius: number;
  width: number;
  /** World units a metre of the model is. */
  scale: number;
  value: number;
  /** A closed body: what hangs inboard of the wheel would not show. */
  closed?: boolean;
}

/**
 * The glyphs drawn on or beside a wheel, by kind. `tyreColour` and
 * `suspensionBar` also change the wheel and the body themselves (see
 * `buildCar`); the entries here are what is added on top.
 */
export const WHEEL_GLYPHS: Record<WheelGlyph, (d: WheelDraw) => void> = {
  tyreColour: () => {},
  // The pushrod, coloured by how far the corner is into its travel.
  suspensionBar: (d) => {
    const [a, b] = pushrod(d);
    rod(d.out, a, b, 0.06 * d.scale, travelColor(Math.max(0, Math.min(1, d.value))));
  },
  // A ring on the ground, faint while there is grip in hand.
  slipRing: ({ out, wheel, value }) => {
    const alpha = Math.max(0.12, Math.min(1, (value - 0.3) / 0.7));
    ring(out, wheel, 0, 0, 0.04, 0.5, 0.62, slipColor(value), alpha);
  },
  // A disc glowing on the wheel's outer face.
  brakeGlow: ({ out, wheel, side, hub, width, value }) => {
    const col = GLYPH_COLORS.brakeGlow(value);
    disc(out, wheel, Math.sign(side) * (width / 2 + 0.012), hub, 0.16, col);
  },
  // A band round the tread's outer edge, white while new, red as it wears.
  wearBand: ({ out, wheel, side, hub, radius, width, value }) => {
    const col = GLYPH_COLORS.wearBand(value);
    tread(out, wheel, Math.sign(side) * width * 0.36, hub, radius + 0.012, width * 0.2, col, 18);
  },
  // A post beside the wheel as tall as the load on it.
  loadBar: ({ out, car, fx, side, value }) => {
    const t = Math.max(0, Math.min(1.2, value));
    box(
      out,
      car,
      fx + 0.45,
      Math.sign(side) * 1.1,
      0.1 + t * 0.6,
      0.12,
      0.12,
      0.2 + t * 1.2,
      travelColor(Math.min(1, t)),
    );
  },
};

/** The two ends of a wheel's pushrod: low on the upright, high on the tub. */
function pushrod({ body, wheel, fx, side, hub, radius, width, closed }: WheelDraw): [Vec3, Vec3] {
  const sg = Math.sign(side);
  // On a closed body: up the wheel's outer face, from the hub to the arch.
  if (closed) return [at(wheel, 0, sg * (width / 2 + 0.03), hub), at(body, fx, side + sg * (width / 2 + 0.03), hub + radius)];
  return [at(wheel, 0, -sg * (width / 2 + 0.07), hub - 0.06), at(body, fx - 0.08, sg * 0.12, fx > 0 ? 0.56 : 0.46)];
}

/**
 * A wheel's suspension: upright, two wishbones from the tub to it, the track
 * rod on a front wheel and the drive shaft on a rear one. The pushrod is a
 * glyph's when the lap has the travel (see `WHEEL_GLYPHS.suspensionBar`).
 */
function suspension(d: WheelDraw, pushrodToo: boolean): void {
  const { out, body, wheel, fx, side, hub, width, scale } = d;
  const sg = Math.sign(side);
  const front = fx > 0;
  const inboard = -sg * (width / 2 + 0.05);
  const lower = at(wheel, 0, inboard, hub - 0.1);
  const upper = at(wheel, 0, inboard, hub + 0.12);
  const t = 0.035 * scale;
  rod(out, lower, upper, 0.06 * scale, CARBON);
  const z = front ? [0.27, 0.47] : [0.24, 0.44];
  const across = front ? [0.16, 0.15] : [0.13, 0.11];
  // Each wishbone an A: a leg forward and a leg back on the tub, meeting at the upright.
  const arms: [number, number, number, Vec3][] = [
    [fx + (front ? 0.22 : 0.3), across[0], z[0], lower],
    [fx - (front ? 0.25 : 0.15), across[0], z[0], lower],
    [fx + (front ? 0.18 : 0.22), across[1], z[1], upper],
    [fx - (front ? 0.2 : 0.12), across[1], z[1], upper],
  ];
  for (const [x, y, h, end] of arms) rod(out, at(body, x, sg * y, h), end, t, ARM);
  if (front) {
    rod(out, at(body, fx + 0.12, sg * 0.16, 0.36), at(wheel, 0.13, inboard, hub), t, ARM);
  } else {
    rod(out, at(body, fx, sg * 0.08, 0.3), at(wheel, 0, -sg * (width / 2 + 0.02), hub), 0.05 * scale, CARBON);
  }
  if (pushrodToo) {
    const [a, b] = pushrod(d);
    rod(out, a, b, 0.045 * scale, ARM);
  }
}

export function buildCar(out: VertexBuffer, state: CarState, color: Rgb, o: GlyphOptions): void {
  const k = o.scale;
  const fr: Frame3 = headingFrame(state.x, state.y, state.z, state.heading);
  // Scale about the car's own origin. The telemetry is the car's position -
  // its reference point sits 0.3 to 0.5 m up - so the model is lowered to put
  // its wheels on the road.
  const s: Frame3 = {
    o: [fr.o[0], fr.o[1] - WHEEL_HEIGHT, fr.o[2]],
    f: scaled(fr.f, k),
    r: scaled(fr.r, k),
    u: [0, k, 0],
  };
  const glyphs = [0, 1, 2, 3].map((w) => (o.telemetry ? wheelGlyphValues(state, w) : {}));

  const steer = Number.isFinite(state.steer) ? state.steer * o.steerSign * LOCK : 0;
  const model = o.model;
  const wheels = wheelPlaces(model, o.wheelSide).map((w): [number, number] => [w.fx, w.side]);
  const middle = (wheels[0][0] + wheels[2][0]) / 2;

  // The body on its springs: each corner down by how far it is into its
  // travel, and the plane through the four - sink, pitch and roll - is where
  // the body sits. Without the travel it sits level.
  const travel = glyphs.map((g) => g.suspensionBar ?? Number.NaN);
  let lift = 0;
  let pitch = 0;
  let roll = 0;
  if (travel.every(Number.isFinite)) {
    const drop = travel.map((t) => (Math.max(0, Math.min(1, t)) - 0.5) * TRAVEL);
    let xx = 0;
    let yy = 0;
    wheels.forEach(([x, y], w) => {
      lift -= drop[w] / 4;
      pitch -= drop[w] * (x - middle);
      roll -= drop[w] * y;
      xx += (x - middle) ** 2;
      yy += y * y;
    });
    pitch /= xx;
    roll /= yy;
    lift -= pitch * middle;
  }
  // A shear rather than a turn: for a few degrees the same, and every point
  // of the body keeps its place along the car.
  const b: Frame3 = {
    o: at(s, 0, 0, lift),
    f: [s.f[0] + s.u[0] * pitch, s.f[1] + s.u[1] * pitch, s.f[2] + s.u[2] * pitch],
    r: [s.r[0] + s.u[0] * roll, s.r[1] + s.u[1] * roll, s.r[2] + s.u[2] * roll],
    u: s.u,
  };

  const body = o.selected ? mix(color, [1, 1, 1], 0.15) : color;
  const top = mix(body, [1, 1, 1], 0.14);
  if (model) {
    modelCar(out, s, b, model, body, top, state, steer, wheels, glyphs, o);
    return;
  }
  if (o.detail === 'plain') {
    plainCar(out, s, b, body, top, state, steer, wheels, k);
    return;
  }
  loft(out, b, TUB, body, { topCol: top, segments: 20 });
  loft(out, b, ENGINE_COVER, body, { topCol: top, segments: 18 });
  for (const sg of [-1, 1]) {
    loft(out, b, SIDEPOD.map((p) => ({ ...p, y: (p.y ?? 0) * sg })), shade(body, 0.94), { topCol: top, segments: 16, round: 3.2 });
  }
  // The cockpit opening, the driver's helmet, the halo over it.
  {
    const n = 12;
    const c = at(b, 0.3, 0, 0.63);
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      out.triangle(
        c,
        at(b, 0.3 + Math.cos(a0) * 0.32, Math.sin(a0) * 0.17, 0.63),
        at(b, 0.3 + Math.cos(a1) * 0.32, Math.sin(a1) * 0.17, 0.63),
        [0.05, 0.05, 0.06],
      );
    }
  }
  loft(out, b, HELMET, [0.93, 0.93, 0.9], { round: 2, segments: 14 });
  for (const sg of [-1, 1]) {
    for (let i = sg > 0 ? 0 : 1; i + 1 < HALO.length; i++) {
      const [x0, y0, z0] = HALO[i];
      const [x1, y1, z1] = HALO[i + 1];
      rod(out, at(b, x0, y0 * sg, z0), at(b, x1, y1 * sg, z1), 0.045 * k, CARBON);
    }
  }
  // The floor, the wings and what holds them.
  box(out, b, 0, 0, 0.1, 1.9, 1.3, 0.04, CARBON);
  box(out, b, -1.45, 0, 0.12, 0.8, 0.95, 0.05, CARBON);
  box(out, b, 2.2, 0, 0.09, 0.38, 1.76, 0.035, shade(body, 0.9), 1, top);
  for (const sg of [-1, 1]) {
    box(out, b, 2.08, sg * 0.5, 0.15, 0.18, 0.66, 0.03, shade(body, 0.8), 1, top);
    box(out, b, 2.15, sg * 0.88, 0.13, 0.45, 0.025, 0.16, CARBON);
    rod(out, at(b, 2.05, sg * 0.06, 0.24), at(b, 2.05, sg * 0.12, 0.1), 0.03 * k, CARBON);
  }
  box(out, b, -2.0, 0, 0.88, 0.3, 0.95, 0.05, body, 1, top);
  box(out, b, -2.08, 0, 0.98, 0.2, 0.95, 0.04, shade(body, 0.85), 1, top);
  rod(out, at(b, -1.6, 0, 0.45), at(b, -1.95, 0, 0.86), 0.06 * k, CARBON);
  // Brake lights - the rain light and the endplates' edges: dark, or lit by
  // how hard it brakes.
  const lit = Math.max(0, Math.min(1, state.brake));
  const brakeCol: Rgb =
    lit > 0.05 ? mix([0.6, 0.05, 0.05], [1, 0.15, 0.1], lit) : [0.3, 0.04, 0.04];
  box(out, b, -1.78, 0, 0.36, 0.05, 0.18, 0.1, brakeCol);
  for (const sg of [-1, 1]) {
    box(out, b, -2.0, sg * 0.49, 0.8, 0.5, 0.03, 0.42, CARBON);
    box(out, b, -2.26, sg * 0.49, 0.8, 0.03, 0.04, 0.36, brakeCol);
  }
  // Lamps over the airbox for each aid or switch that is on, in a row.
  if (o.telemetry) {
    const lamps = litLamps(state);
    lamps.forEach((lamp, n) => {
      const across = (n - (lamps.length - 1) / 2) * 0.3;
      box(out, b, -0.2, across, 0.98, 0.24, 0.22, 0.12, hexRgb(lamp.color));
    });
  }
  // Selected: a halo on the ground, so the car stands out in a crowd.
  if (o.selected) ring(out, s, 0, 0, 0.03, 2.7, 2.85, [1, 1, 1], 0.55);

  wheels.forEach(([fx, side], w) => {
    const g = glyphs[w];
    const front = w < 2;
    const width = front ? FRONT_W : REAR_W;
    const tyreCol = g.tyreColour !== undefined ? temperatureColor(g.tyreColour) : TYRE;
    // Each wheel turned about its own centre, on the road: the body moves
    // over it.
    const hubAt = at(s, fx, side, 0);
    const wf = headingFrame(hubAt[0], hubAt[1], hubAt[2], state.heading + (front ? steer : 0));
    const ws: Frame3 = { o: hubAt, f: scaled(wf.f, k), r: scaled(wf.r, k), u: [0, k, 0] };
    drawWheel(out, ws, 0, WHEEL_R, WHEEL_R, width, tyreCol, RIM, Math.sign(side), 18);
    const d: WheelDraw = { out, car: s, body: b, wheel: ws, fx, side, hub: WHEEL_R, radius: WHEEL_R, width, scale: k, value: 0 };
    suspension(d, g.suspensionBar === undefined);
    for (const [kind, value] of Object.entries(g) as [WheelGlyph, number][]) {
      WHEEL_GLYPHS[kind]({ ...d, value });
    }
  });
}

/** The car's shape and colour alone: body, wings, four wheels, the brake light. */
function plainCar(
  out: VertexBuffer,
  s: Frame3,
  b: Frame3,
  body: Rgb,
  top: Rgb,
  state: CarState,
  steer: number,
  wheels: [number, number][],
  k: number,
): void {
  loft(out, b, TUB, body, { topCol: top, segments: 8 });
  loft(out, b, ENGINE_COVER, body, { topCol: top, segments: 6 });
  box(out, b, 0, 0, 0.1, 1.9, 1.3, 0.04, CARBON);
  box(out, b, 2.2, 0, 0.09, 0.38, 1.76, 0.035, shade(body, 0.9), 1, top);
  box(out, b, -2.0, 0, 0.9, 0.3, 0.95, 0.12, body, 1, top);
  const lit = Math.max(0, Math.min(1, state.brake));
  box(out, b, -1.78, 0, 0.36, 0.05, 0.18, 0.1, lit > 0.05 ? mix([0.6, 0.05, 0.05], [1, 0.15, 0.1], lit) : [0.3, 0.04, 0.04]);
  wheels.forEach(([fx, side], w) => {
    const hubAt = at(s, fx, side, 0);
    const wf = headingFrame(hubAt[0], hubAt[1], hubAt[2], state.heading + (w < 2 ? steer : 0));
    const ws: Frame3 = { o: hubAt, f: scaled(wf.f, k), r: scaled(wf.r, k), u: [0, k, 0] };
    const width = w < 2 ? FRONT_W : REAR_W;
    tread(out, ws, 0, WHEEL_R, WHEEL_R, width, TYRE, 6);
    for (const face of [-1, 1]) disc(out, ws, face * width / 2, WHEEL_R, WHEEL_R, face === Math.sign(side) ? RIM : TYRE, 6);
  });
}

/** The car's own body on its wheels, with what the single-seater shows of the telemetry. */
function modelCar(
  out: VertexBuffer,
  s: Frame3,
  b: Frame3,
  model: CarModel,
  body: Rgb,
  top: Rgb,
  state: CarState,
  steer: number,
  wheels: [number, number][],
  glyphs: Partial<Record<WheelGlyph, number>>[],
  o: GlyphOptions,
): void {
  const k = o.scale;
  const full = o.detail !== 'plain';
  shell(out, b, model, body, top, o.wheelSide);
  const lit = Math.max(0, Math.min(1, state.brake));
  const brakeCol: Rgb = lit > 0.05 ? mix([0.6, 0.05, 0.05], [1, 0.15, 0.1], lit) : [0.3, 0.04, 0.04];
  for (const [fwd, side, up] of model.lights) box(out, b, fwd - 0.03, side * o.wheelSide, up, 0.08, 0.3, 0.09, brakeCol);
  if (full && o.telemetry) {
    const lamps = litLamps(state);
    lamps.forEach((lamp, n) => {
      const across = (n - (lamps.length - 1) / 2) * 0.3;
      box(out, b, 0, across, model.roof + 0.14, 0.24, 0.22, 0.12, hexRgb(lamp.color));
    });
  }
  if (o.selected) ring(out, s, 0, 0, 0.03, 2.7, 2.85, [1, 1, 1], 0.55);
  wheels.forEach(([fx, side], w) => {
    const g = glyphs[w];
    const radius = model.wheels[w].radius;
    const width = radius * 0.8;
    const front = w < 2;
    const hubAt = at(s, fx, side, 0);
    const wf = headingFrame(hubAt[0], hubAt[1], hubAt[2], state.heading + (front ? steer : 0));
    const ws: Frame3 = { o: hubAt, f: scaled(wf.f, k), r: scaled(wf.r, k), u: [0, k, 0] };
    const tyreCol = g.tyreColour !== undefined ? temperatureColor(g.tyreColour) : TYRE;
    drawWheel(out, ws, 0, radius, radius, width, tyreCol, RIM, Math.sign(side), full ? 18 : 8);
    if (!full) return;
    const d: WheelDraw = { out, car: s, body: b, wheel: ws, fx, side, hub: radius, radius, width, scale: k, value: 0, closed: true };
    for (const [kind, value] of Object.entries(g) as [WheelGlyph, number][]) {
      WHEEL_GLYPHS[kind]({ ...d, value });
    }
  });
}

/** Colour of the windows: dark enough to tell a car's shape by, in any lap's colour. */
const GLASS: Rgb = [0.07, 0.08, 0.1];
const HEADLAMP: Rgb = [1, 0.97, 0.85];

/** A model's triangles in the frame, each face lit by which way it looks. */
function shell(out: VertexBuffer, b: Frame3, model: CarModel, body: Rgb, top: Rgb, mirror: number): void {
  const { positions: p, faces, normals: n, glass } = model;
  const { o, f, r, u } = b;
  const size = Math.hypot(u[0], u[1], u[2]) || 1;
  for (let i = 0; i < faces.length / 3; i++) {
    const nf = n[i * 3];
    const ns = n[i * 3 + 1] * mirror;
    const nu = n[i * 3 + 2];
    const light = lightOn(
      (f[0] * nf + r[0] * ns + u[0] * nu) / size,
      (f[1] * nf + r[1] * ns + u[1] * nu) / size,
      (f[2] * nf + r[2] * ns + u[2] * nu) / size,
    );
    const col = glass[i] === 2 ? HEADLAMP : glass[i] ? GLASS : nu > 0.75 ? top : body;
    for (let c = 0; c < 3; c++) {
      const v = faces[i * 3 + c] * 3;
      const x = p[v];
      const y = p[v + 1] * mirror;
      const z = p[v + 2];
      out.vertex(
        o[0] + f[0] * x + r[0] * y + u[0] * z,
        o[1] + f[1] * x + r[1] * y + u[1] * z,
        o[2] + f[2] * x + r[2] * y + u[2] * z,
        col[0] * light,
        col[1] * light,
        col[2] * light,
        1,
      );
    }
  }
}

function scaled(v: [number, number, number], k: number): [number, number, number] {
  return [v[0] * k, v[1] * k, v[2] * k];
}

/** A flat ring in the frame's ground plane. */
function ring(
  out: VertexBuffer,
  fr: Frame3,
  cx: number,
  cy: number,
  h: number,
  inner: number,
  outer: number,
  col: Rgb,
  alpha: number,
): void {
  const n = 20;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const p = (a: number, r: number) => at(fr, cx + Math.cos(a) * r, cy + Math.sin(a) * r, h);
    out.quad(p(a0, inner), p(a0, outer), p(a1, outer), p(a1, inner), col, alpha);
  }
}
