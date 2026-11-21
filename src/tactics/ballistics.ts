/**
 * Throws and launches bound by each game's physics (`throws.json`): a
 * projectile leaves at its launch speed - for a thrown one times the throw
 * strength, plus a share of the thrower's own running and jumping - falls at
 * the game's gravity and slows with its drag. From that the board knows how
 * far a throw can reach in each direction (the envelope drawn round the
 * thrower), clamps a landing point beyond it to the edge, and draws the real
 * arc to where it lands, never an unlimited one.
 *
 * Everything here works in metres and metres a second; the board converts
 * with its units per metre.
 */

import DATA from './throws.json';
import type { Vec3 } from './plan';

export type ThrowMove = 'stand' | 'run' | 'jump' | 'runjump';
export const THROW_MOVES: ThrowMove[] = ['stand', 'run', 'jump', 'runjump'];

export interface Projectile {
  id: string;
  name: string;
  kind: 'thrown' | 'launched';
  /** Launch speed, m/s (a thrown one at full strength). */
  speed: number;
  /** m/s^2 down. */
  gravity: number;
  /** Quadratic drag, 1/m: the deceleration is drag * |v| * v. */
  drag: number;
  /** How much of the thrower's own velocity the projectile takes along (thrown only). */
  carry: number;
  /** The thrower's run speed and jump speed (up), m/s. */
  run: number;
  jump: number;
  strengths: { id: string; factor: number }[];
  /** Where the game ends it, metres from the thrower; absent: where it lands. */
  maxRange?: number;
  src: 'game' | 'public' | 'estimate';
  source?: string;
  note?: string;
}

type Raw = Omit<Projectile, 'carry' | 'run' | 'jump' | 'strengths'> & Partial<Pick<Projectile, 'carry' | 'run' | 'jump' | 'strengths'>> & { unitsPerMetre?: number };

/** The table in metres: a game whose numbers are in its own units (CS2's inches) converted. */
const BY_GAME: Record<string, Projectile[]> = Object.fromEntries(
  Object.entries((DATA as unknown as { games: Record<string, Raw[]> }).games).map(([game, list]) => [
    game,
    list.map((r) => {
      const k = r.unitsPerMetre && r.unitsPerMetre > 0 ? 1 / r.unitsPerMetre : 1;
      return {
        ...r,
        speed: r.speed * k,
        gravity: r.gravity * k,
        drag: r.drag / k,
        carry: r.kind === 'thrown' ? (r.carry ?? 1) : 0,
        run: (r.run ?? 0) * k,
        jump: (r.jump ?? 0) * k,
        strengths: r.strengths?.length ? r.strengths : [{ id: 'full', factor: 1 }],
      } as Projectile;
    }),
  ]),
);

/** Where each projectile's numbers come from, by source id. */
export const THROW_SOURCES = (DATA as unknown as { sources: Record<string, { title: string; url?: string }> }).sources;

/** The projectiles a board game offers; the generic ones for a game without its own (the air games launch by range, not arc). */
export function projectilesFor(game: string): Projectile[] {
  return BY_GAME[game] ?? BY_GAME.generic;
}

export function projectileById(id: string): Projectile | null {
  for (const list of Object.values(BY_GAME)) for (const p of list) if (p.id === id) return p;
  return null;
}

/** How a throw is made: what, how hard, and how the thrower moves as it lets go. */
export interface ThrowSpec {
  projectile: Projectile;
  strength: number;
  move: ThrowMove;
}

/** A spec from the board's `weapon` string, "projectile|strength|move"; null when it names nothing known. */
export function parseThrow(weapon: string | undefined): ThrowSpec | null {
  if (!weapon) return null;
  const [id, s, m] = weapon.split('|');
  const projectile = projectileById(id);
  if (!projectile) return null;
  const strength = projectile.strengths.find((x) => x.id === s)?.factor ?? projectile.strengths[0].factor;
  return { projectile, strength, move: (THROW_MOVES as string[]).includes(m) ? (m as ThrowMove) : 'stand' };
}

export function throwKey(projectile: string, strength: string, move: ThrowMove): string {
  return `${projectile}|${strength}|${move}`;
}

/** The launch velocity, m/s, horizontal along (dx, dz) at an elevation (radians). */
function launch(spec: ThrowSpec, dx: number, dz: number, elevation: number): Vec3 {
  const p = spec.projectile;
  const v = p.speed * (p.kind === 'thrown' ? spec.strength : 1);
  const c = Math.cos(elevation);
  const out = { x: dx * v * c, y: v * Math.sin(elevation), z: dz * v * c };
  if (p.kind === 'thrown') {
    const run = spec.move === 'run' || spec.move === 'runjump' ? p.run * p.carry : 0;
    const up = spec.move === 'jump' || spec.move === 'runjump' ? p.jump * p.carry : 0;
    out.x += dx * run;
    out.z += dz * run;
    out.y += up;
  }
  return out;
}

const DT = 1 / 120;
const MAX_T = 60;

/**
 * A flight from the origin until it comes down through `dy` metres (the
 * target's height over the thrower) - the points every so often, metres from
 * the thrower - or until the game ends it (its range cap).
 */
export function fly(spec: ThrowSpec, dx: number, dz: number, elevation: number, dy: number, keep = false): { distance: number; time: number; points: Vec3[]; capped: boolean } {
  const p = spec.projectile;
  const v = launch(spec, dx, dz, elevation);
  let x = 0;
  let y = 0;
  let z = 0;
  const points: Vec3[] = keep ? [{ x: 0, y: 0, z: 0 }] : [];
  const cap = p.maxRange ?? Infinity;
  for (let t = 0; t < MAX_T; t += DT) {
    const speed = Math.hypot(v.x, v.y, v.z);
    const k = p.drag * speed;
    v.x -= v.x * k * DT;
    v.z -= v.z * k * DT;
    v.y -= (p.gravity + v.y * k) * DT;
    const nx = x + v.x * DT;
    const ny = y + v.y * DT;
    const nz = z + v.z * DT;
    const d = Math.hypot(nx, nz);
    if (d >= cap) {
      if (keep) points.push({ x: nx, y: ny, z: nz });
      return { distance: cap, time: t, points, capped: true };
    }
    // Coming down through the target's height.
    if (v.y < 0 && ny <= dy && y > dy) {
      const u = (y - dy) / (y - ny);
      const lx = x + (nx - x) * u;
      const lz = z + (nz - z) * u;
      if (keep) points.push({ x: lx, y: dy, z: lz });
      return { distance: Math.hypot(lx, lz), time: t + DT * u, points, capped: false };
    }
    x = nx;
    y = ny;
    z = nz;
    if (keep && Math.round(t / DT) % 6 === 0) points.push({ x, y, z });
    // Below the target and falling: it never gets there.
    if (v.y < 0 && y < dy) break;
  }
  return { distance: 0, time: MAX_T, points, capped: false };
}

/** The elevations tried, radians: from 30 degrees down to 75 up. */
const ELEVATIONS = Array.from({ length: 22 }, (_, i) => ((-30 + i * 5) * Math.PI) / 180);

/** How far a throw reaches along a direction to a target `dy` metres over the thrower, and at which elevation. */
export function reach(spec: ThrowSpec, dx: number, dz: number, dy: number): { distance: number; elevation: number } {
  let best = { distance: 0, elevation: Math.PI / 4 };
  for (const e of ELEVATIONS) {
    const f = fly(spec, dx, dz, e, dy);
    if (f.distance > best.distance) best = { distance: f.distance, elevation: e };
  }
  // Refined round the best by halving the step.
  let step = (5 * Math.PI) / 180;
  for (let i = 0; i < 4; i++) {
    step /= 2;
    for (const e of [best.elevation - step, best.elevation + step]) {
      const f = fly(spec, dx, dz, e, dy);
      if (f.distance > best.distance) best = { distance: f.distance, elevation: e };
    }
  }
  return best;
}

/** The reach in `n` directions round the thrower, metres, at its own height: the envelope drawn on the board. */
export function envelope(spec: ThrowSpec, n = 48): number[] {
  // A thrower's own movement goes the way it throws, so every direction is alike; launched ones too.
  const r = reach(spec, 1, 0, 0).distance;
  return Array.from({ length: n }, () => r);
}

/**
 * The flight from `from` to `to` (metres): the low arc that lands there when
 * it can be reached - else the furthest throw that way, landing short, at the
 * edge of the reach. Points are metres in the world.
 */
export function solveThrow(spec: ThrowSpec, from: Vec3, to: Vec3): { points: Vec3[]; landing: Vec3; reachable: boolean; time: number } {
  const hx = to.x - from.x;
  const hz = to.z - from.z;
  const want = Math.hypot(hx, hz);
  const dx = want > 1e-6 ? hx / want : 1;
  const dz = want > 1e-6 ? hz / want : 0;
  const dy = to.y - from.y;
  const top = reach(spec, dx, dz, dy);
  const world = (pts: Vec3[]) => pts.map((p) => ({ x: from.x + p.x, y: from.y + p.y, z: from.z + p.z }));
  if (top.distance < want - 1e-3) {
    const f = fly(spec, dx, dz, top.elevation, dy, true);
    return { points: world(f.points), landing: { x: from.x + dx * f.distance, y: to.y, z: from.z + dz * f.distance }, reachable: false, time: f.time };
  }
  // The low arc: the elevation under the best one whose flight lands at the target, by halving.
  let lo = ELEVATIONS[0];
  let hi = top.elevation;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (fly(spec, dx, dz, mid, dy).distance < want) lo = mid;
    else hi = mid;
  }
  const f = fly(spec, dx, dz, hi, dy, true);
  return { points: world(f.points), landing: { ...to }, reachable: true, time: f.time };
}
