/**
 * The viewer's own cars: a body for each kind of car and each era, built here
 * from a handful of proportions. They take nothing from any game's files, and
 * a body of a kind and era is no particular car. Given a real car (`carSpecs.ts`)
 * the same shape is built to that car's published size and silhouette, modelled
 * after the car itself. There is no badge and no maker's grille on any of them.
 * These are what ships with the viewer, and what a car is drawn as when no car
 * file holds it.
 *
 * A body is two lofts. The lower one runs nose to tail, its sides cut up round
 * the wheels so the arches are real; the cabin stands on it, narrower at the
 * roof than at the belt, its steep faces drawn as glass. Lamps and a wing are
 * added on the outside.
 */

import { finishModel, type CarModel } from './carModel';
import type { CarSpec } from './carSpecs';

export type BodyKind =
  | 'saloon'
  | 'coupe'
  | 'hatch'
  | 'estate'
  | 'sports'
  | 'supercar'
  | 'muscle'
  | 'suv'
  | 'pickup'
  | 'van'
  | 'micro';

export type BodyEra = 'classic' | 'retro' | 'modern';

export const BODY_KINDS: BodyKind[] = ['saloon', 'coupe', 'hatch', 'estate', 'sports', 'supercar', 'muscle', 'suv', 'pickup', 'van', 'micro'];
export const BODY_ERAS: BodyEra[] = ['classic', 'retro', 'modern'];

/** The era a car's year falls in; a car of unknown year is taken as a modern one. */
export function eraOf(year: number | null | undefined): BodyEra {
  if (!year) return 'modern';
  return year < 1980 ? 'classic' : year < 2000 ? 'retro' : 'modern';
}

/** Metres. Heights are over the road; `x` is forward from the car's middle. */
interface Proportions {
  length: number;
  halfWidth: number;
  /** Wheel centres, forward from the middle. */
  front: number;
  rear: number;
  radius: number;
  clearance: number;
  /** Top of the lower body: at the nose, at the windscreen's foot, at the rear screen's foot, at the tail. */
  nose: number;
  cowl: number;
  deck: number;
  tail: number;
  /** The cabin: foot of the windscreen, the roof's front and back, foot of the rear screen, the roof's height. */
  screen: number;
  roofFront: number;
  roofBack: number;
  rearScreen: number;
  roof: number;
  /** The cabin's top half-width, as a share of the body's. */
  tumble: number;
}

const BASE: Record<BodyKind, Proportions> = {
  saloon: { length: 4.6, halfWidth: 0.9, front: 1.42, rear: -1.28, radius: 0.32, clearance: 0.15, nose: 0.68, cowl: 0.92, deck: 0.98, tail: 0.95, screen: 0.82, roofFront: 0.2, roofBack: -0.78, rearScreen: -1.32, roof: 1.42, tumble: 0.78 },
  coupe: { length: 4.5, halfWidth: 0.9, front: 1.4, rear: -1.25, radius: 0.33, clearance: 0.13, nose: 0.62, cowl: 0.86, deck: 0.92, tail: 0.92, screen: 0.72, roofFront: 0.05, roofBack: -0.6, rearScreen: -1.5, roof: 1.32, tumble: 0.76 },
  hatch: { length: 4.05, halfWidth: 0.87, front: 1.3, rear: -1.2, radius: 0.31, clearance: 0.14, nose: 0.7, cowl: 0.95, deck: 1.0, tail: 0.98, screen: 0.78, roofFront: 0.22, roofBack: -1.42, rearScreen: -1.86, roof: 1.44, tumble: 0.8 },
  estate: { length: 4.75, halfWidth: 0.9, front: 1.45, rear: -1.3, radius: 0.32, clearance: 0.15, nose: 0.68, cowl: 0.92, deck: 0.98, tail: 0.98, screen: 0.86, roofFront: 0.26, roofBack: -2.02, rearScreen: -2.28, roof: 1.45, tumble: 0.8 },
  sports: { length: 4.25, halfWidth: 0.89, front: 1.3, rear: -1.15, radius: 0.32, clearance: 0.12, nose: 0.56, cowl: 0.8, deck: 0.84, tail: 0.86, screen: 0.4, roofFront: -0.16, roofBack: -0.68, rearScreen: -1.25, roof: 1.24, tumble: 0.72 },
  supercar: { length: 4.5, halfWidth: 0.98, front: 1.38, rear: -1.28, radius: 0.34, clearance: 0.1, nose: 0.46, cowl: 0.74, deck: 0.86, tail: 0.9, screen: 0.82, roofFront: 0.1, roofBack: -0.4, rearScreen: -1.3, roof: 1.14, tumble: 0.66 },
  muscle: { length: 4.8, halfWidth: 0.95, front: 1.5, rear: -1.28, radius: 0.34, clearance: 0.14, nose: 0.74, cowl: 0.94, deck: 0.96, tail: 0.96, screen: 0.6, roofFront: -0.05, roofBack: -0.68, rearScreen: -1.5, roof: 1.36, tumble: 0.74 },
  suv: { length: 4.75, halfWidth: 0.95, front: 1.45, rear: -1.35, radius: 0.4, clearance: 0.26, nose: 0.98, cowl: 1.14, deck: 1.2, tail: 1.18, screen: 0.92, roofFront: 0.36, roofBack: -2.0, rearScreen: -2.28, roof: 1.8, tumble: 0.86 },
  pickup: { length: 5.6, halfWidth: 1.0, front: 1.85, rear: -1.65, radius: 0.42, clearance: 0.28, nose: 1.1, cowl: 1.24, deck: 1.3, tail: 1.32, screen: 1.15, roofFront: 0.62, roofBack: -0.5, rearScreen: -0.72, roof: 1.92, tumble: 0.86 },
  van: { length: 5.0, halfWidth: 0.98, front: 1.6, rear: -1.55, radius: 0.34, clearance: 0.18, nose: 0.92, cowl: 1.14, deck: 1.2, tail: 1.2, screen: 1.5, roofFront: 0.98, roofBack: -2.34, rearScreen: -2.46, roof: 2.1, tumble: 0.92 },
  micro: { length: 2.9, halfWidth: 0.74, front: 0.92, rear: -0.9, radius: 0.24, clearance: 0.12, nose: 0.62, cowl: 0.8, deck: 0.86, tail: 0.84, screen: 0.72, roofFront: 0.26, roofBack: -0.82, rearScreen: -1.2, roof: 1.36, tumble: 0.82 },
};

/** How an era changes a body: how square its ends are, its screens, its waist. */
const ERAS: Record<BodyEra, { square: number; rake: number; belt: number; size: number; roof: number; clearance: number }> = {
  classic: { square: 0.84, rake: 0.55, belt: -0.12, size: 0.95, roof: 1.03, clearance: 0.05 },
  retro: { square: 0.96, rake: 0.8, belt: -0.05, size: 0.98, roof: 1.0, clearance: 0.01 },
  modern: { square: 0.66, rake: 1.25, belt: 0.05, size: 1.02, roof: 1.0, clearance: 0 },
};

function between(points: [number, number][], x: number): number {
  for (let i = 0; i + 1 < points.length; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (x <= x0 && x >= x1) return x0 === x1 ? y0 : y0 + ((x0 - x) / (x0 - x1)) * (y1 - y0);
  }
  return points[points.length - 1][1];
}

const made = new Map<string, CarModel>();

/** A kind's proportions at a real car's published size: the shape stays the kind's. */
function toSize(b: Proportions, spec: CarSpec): Proportions {
  const along = spec.length / b.length;
  const up = spec.height / b.roof;
  const middle = ((b.front + b.rear) / 2) * along;
  const half = spec.length / 2;
  const look = spec.look;
  return {
    ...b,
    length: spec.length,
    halfWidth: spec.width / 2,
    front: middle + spec.wheelbase / 2,
    rear: middle - spec.wheelbase / 2,
    nose: look ? look.nose * spec.height : b.nose * up,
    cowl: look ? look.cowl * spec.height : b.cowl * up,
    deck: look ? look.deck * spec.height : b.deck * up,
    tail: look ? look.tail * spec.height : b.tail * up,
    roof: spec.height,
    screen: look ? look.screen * half : b.screen * along,
    roofFront: look ? look.roofFront * half : b.roofFront * along,
    roofBack: look ? look.roofBack * half : b.roofBack * along,
    rearScreen: look ? look.rearScreen * half : b.rearScreen * along,
    tumble: look ? look.tumble : b.tumble,
    // The wheel keeps to the car, a microcar's small and a long car's a little larger.
    radius: Math.min(b.radius, spec.length * 0.075),
  };
}

export function bodyModel(kind: BodyKind, era: BodyEra, spec?: CarSpec): CarModel {
  const key = spec ? `${spec.name}/${era}` : `${kind}/${era}`;
  const known = made.get(key);
  if (known) return known;
  const b = spec ? toSize(BASE[kind], spec) : BASE[kind];
  // A real car's size is its size already: the era changes only how it is shaped.
  const e = spec ? { ...ERAS[era], size: 1, roof: 1, belt: 0, rake: spec.look ? 1 : ERAS[era].rake, clearance: 0 } : ERAS[era];
  const nose = (b.length / 2) * e.size;
  const tail = -nose;
  const half = b.halfWidth * e.size;
  const radius = b.radius * (era === 'classic' ? 0.95 : 1);
  const clearance = b.clearance + e.clearance;
  const front = b.front * e.size;
  const rear = b.rear * e.size;
  const archRadius = radius * 1.14;
  // A rake above 1 lays the screen back: its foot moves forward, its top stays.
  const screen = b.roofFront * e.size + (b.screen - b.roofFront) * e.size * e.rake;
  const rearScreen = b.roofBack * e.size + (b.rearScreen - b.roofBack) * e.size * e.rake;
  const top: [number, number][] = [
    [nose, b.nose + e.belt],
    [screen, b.cowl + e.belt],
    [rearScreen, b.deck + e.belt],
    [tail, b.tail + e.belt],
  ];
  const stations = new Set<number>([nose, nose - 0.12, nose - 0.38, screen, rearScreen, tail + 0.38, tail + 0.12, tail]);
  for (const axle of [front, rear]) {
    for (const t of [-1, -0.75, -0.4, 0, 0.4, 0.75, 1]) stations.add(axle + t * archRadius);
  }
  for (const x of [(front + rear) / 2, front - archRadius - 0.3, rear + archRadius + 0.3]) stations.add(x);
  const xs = [...stations].filter((x) => x <= nose && x >= tail).sort((p, q) => q - p);

  const positions: number[] = [];
  const faces: number[] = [];
  const ringOf = (x: number): [number, number][] => {
    // Narrower toward the ends, how much by the era.
    const fromEnd = Math.min(nose - x, x - tail);
    const plan = fromEnd >= 0.4 ? 1 : e.square + (1 - e.square) * Math.sqrt(fromEnd / 0.4);
    let w = half * plan;
    const t = between(top, x);
    let low = clearance;
    let onArch = false;
    for (const axle of [front, rear]) {
      const dx = (x - axle) / archRadius;
      if (Math.abs(dx) < 1) low = Math.max(low, radius + Math.sqrt(1 - dx * dx) * archRadius);
      if (Math.abs(dx) < 1.2) onArch = true;
    }
    // The width is the arches' width: between them the body stands in by the flare.
    if (!onArch) w -= spec?.flare ?? 0;
    low = Math.min(low, t - 0.06);
    const shoulder = t - (t - clearance) * 0.16;
    const right: [number, number][] = [
      [w * 0.68, clearance],
      [w, low],
      [w, Math.max(low, shoulder)],
      [w * 0.86, t],
    ];
    // Round the section: right side up, then left side down.
    return [...right, ...right.slice().reverse().map(([s, h]): [number, number] => [-s, h])];
  };
  const n = ringOf(0).length;
  for (const x of xs) for (const [s, h] of ringOf(x)) positions.push(x, s, h);
  for (let r = 0; r + 1 < xs.length; r++) {
    for (let i = 0; i < n; i++) {
      const a = r * n + i;
      const c = r * n + ((i + 1) % n);
      faces.push(a, c, a + n, c, c + n, a + n);
    }
  }
  for (const r of [0, xs.length - 1]) {
    for (let i = 1; i + 1 < n; i++) faces.push(r * n, r * n + i, r * n + i + 1);
  }
  const lowerFaces = faces.length / 3;

  // The cabin, from the screen's foot over the roof to the rear screen's foot. Each
  // station is a ring: belt, top of the side glass, roof edge, and the same on the
  // other side, so the glass has a painted rail over it. A curved roof adds a station.
  const arch = spec?.look?.arch ?? 0;
  const roofTop = b.roof * e.roof;
  const roofFront = b.roofFront * e.size;
  const roofBack = b.roofBack * e.size;
  const stations2: { x: number; h: number; up: boolean }[] = [
    { x: screen, h: 0, up: false },
    { x: roofFront, h: roofTop - arch * 0.14 * roofTop, up: true },
    ...(arch > 0 ? [{ x: (roofFront + roofBack) / 2, h: roofTop, up: true }] : []),
    { x: roofBack, h: roofTop - arch * 0.14 * roofTop, up: true },
    { x: rearScreen, h: 0, up: false },
  ];
  const start = positions.length / 3;
  const lowerWide = half * 0.9;
  const upperWide = half * b.tumble;
  for (const { x, h, up } of stations2) {
    const foot = between(top, x) - 0.02;
    const edge = up ? h : between(top, x) + 0.01;
    const wide = up ? upperWide : lowerWide;
    const rail = up ? wide + (lowerWide - wide) * 0.14 : lowerWide;
    const railHeight = up ? edge - (edge - foot) * 0.14 : edge;
    positions.push(x, -lowerWide, foot, x, -rail, railHeight, x, -wide, edge, x, wide, edge, x, rail, railHeight, x, lowerWide, foot);
  }
  // What each face of a ring is: 1 glass, 0 paint. The side panel behind the last
  // window is paint on a car with a separate boot, glass on one whose roof runs on.
  const marks: number[] = [];
  const last = stations2.length - 2;
  for (let r = 0; r <= last; r++) {
    for (let i = 0; i < 5; i++) {
      const at = start + r * 6 + i;
      const next = at + 1;
      faces.push(at, next, at + 6, next, next + 6, at + 6);
      const front = r === 0;
      const rear = r === last;
      const side = i === 0 || i === 4;
      const top2 = i === 2;
      const steep = front || rear;
      const glass = top2 ? steep : side ? !rear || rearScreen - roofBack > -0.3 : false;
      marks.push(glass ? 1 : 0, glass ? 1 : 0);
    }
  }
  const cabinEnd = faces.length / 3;
  // A slab on the body, in paint: the wing and what holds it.
  const slab = (x0: number, x1: number, y: number, z0: number, z1: number) => {
    const at = positions.length / 3;
    for (const x of [x0, x1]) for (const s of [-y, y]) for (const z of [z0, z1]) positions.push(x, s, z);
    faces.push(at, at + 1, at + 3, at, at + 3, at + 2, at + 4, at + 5, at + 7, at + 4, at + 7, at + 6);
    faces.push(at, at + 1, at + 5, at, at + 5, at + 4, at + 2, at + 3, at + 7, at + 2, at + 7, at + 6);
    faces.push(at, at + 2, at + 6, at, at + 6, at + 4, at + 1, at + 3, at + 7, at + 1, at + 7, at + 5);
  };
  const tailTop = b.tail + e.belt;
  if (spec?.wing === 'lip') slab(tail + 0.02, tail + 0.2, half * 0.84, tailTop, tailTop + 0.035);
  if (spec?.wing === 'duck') slab(tail + 0.02, tail + 0.42, half * 0.8, tailTop, tailTop + 0.11);
  if (spec?.wing === 'whale') {
    slab(tail - 0.04, tail + 0.5, half * 0.86, tailTop + 0.02, tailTop + 0.14);
  }
  if (spec?.wing === 'gt') {
    slab(tail + 0.04, tail + 0.4, half * 0.92, tailTop + 0.24, tailTop + 0.28);
    for (const side of [-0.62, 0.62]) {
      const at = positions.length / 3;
      slab(tail + 0.14, tail + 0.3, 0.02, tailTop, tailTop + 0.25);
      for (let v = at; v < positions.length / 3; v++) positions[v * 3 + 1] += side * half;
    }
  }
  // Older cars wear their bumpers on the outside, dark against any paint.
  const bumperFrom = faces.length / 3;
  if (spec && spec.from < 1995) {
    const bumper = clearance + (b.nose + e.belt - clearance) * 0.12;
    slab(nose - 0.08, nose + 0.012, half * e.square * 0.98, bumper, bumper + 0.09);
    slab(tail - 0.012, tail + 0.08, half * e.square * 0.98, bumper + 0.03, bumper + 0.12);
  }
  const paintEnd = faces.length / 3;

  // Headlamps, on the nose: a fan for a round one, a quad for the others.
  const noseWidth = half * e.square;
  const lampAt = b.nose + e.belt - (b.nose + e.belt - clearance) * 0.34;
  const lampFace = nose + 0.012;
  const lamp = (side: number, across: number, tall: number, round: boolean) => {
    const at = positions.length / 3;
    positions.push(lampFace, side, lampAt);
    const rim = round ? 10 : 4;
    for (let i = 0; i < rim; i++) {
      const a = round ? (i / rim) * Math.PI * 2 : ((i + 0.5) / 4) * Math.PI * 2;
      const stretch = round ? 1 : Math.SQRT2;
      positions.push(lampFace, side + Math.cos(a) * across * stretch, lampAt + Math.sin(a) * tall * stretch);
    }
    for (let i = 0; i < rim; i++) faces.push(at, at + 1 + i, at + 1 + ((i + 1) % rim));
  };
  for (const sg of [-1, 1]) {
    if (spec?.lamps === 'round2') lamp(sg * noseWidth * 0.66, 0.095, 0.095, true);
    if (spec?.lamps === 'round4') {
      lamp(sg * noseWidth * 0.76, 0.075, 0.075, true);
      lamp(sg * noseWidth * 0.44, 0.065, 0.065, true);
    }
    if (spec?.lamps === 'rect') lamp(sg * noseWidth * 0.64, 0.17, 0.065, false);
    if (spec?.lamps === 'slim') lamp(sg * noseWidth * 0.66, 0.2, 0.032, false);
  }

  const track = half - radius * 0.42;
  const wheels = [front, front, rear, rear].map((fx, w) => ({ fx, side: w % 2 ? track : -track, radius }));
  const lightHeight = b.tail + e.belt - 0.14;
  const model = finishModel(
    key,
    new Float32Array(positions),
    new Uint16Array(faces),
    wheels,
    [
      [tail, -half * 0.68, lightHeight],
      [tail, half * 0.68, lightHeight],
    ],
  );
  // The lower body is all paint, whatever its height, but for the grille across
  // its nose and a pickup's open bed.
  model.glass.fill(0, 0, lowerFaces);
  // The cabin is as marked; the wing and bumpers are paint, and what follows is lamps.
  marks.forEach((mark, k) => {
    model.glass[lowerFaces + k] = mark;
  });
  model.glass.fill(0, cabinEnd, paintEnd);
  for (let k = bumperFrom; k < paintEnd; k++) model.glass[k] = 1;
  model.glass.fill(2, paintEnd);
  for (let k = 0; k < lowerFaces; k++) {
    const corners = [0, 1, 2].map((c) => faces[k * 3 + c] * 3);
    const along = corners.reduce((sum, v) => sum + positions[v], 0) / 3;
    const facesUp = model.normals[k * 3 + 2] > 0.8;
    if (along > nose - 0.02 || (kind === 'pickup' && facesUp && along < rearScreen - 0.1 && along > tail + 0.15)) model.glass[k] = 1;
  }
  made.set(key, model);
  return model;
}
