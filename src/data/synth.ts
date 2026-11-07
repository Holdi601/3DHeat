import type { Dataset } from '../state/types';
import { emptyBounds } from '../state/types';
import { msg, say, sayDataset, type Msg } from './msg';

export interface SynthOptions {
  rows: number;
  teams: number;
  playersPerTeam: number;
  /** Half-extent of the playable area on world X/Z. */
  extent: number;
  /** Vertical span walked over, world Y. */
  heightRange: number;
  tickSeconds: number;
  seed: number;
}

export const DEFAULT_SYNTH: SynthOptions = {
  rows: 8_000_000,
  teams: 8,
  playersPerTeam: 12,
  extent: 4000,
  heightRange: 220,
  tickSeconds: 0.25,
  seed: 1337,
};

/**
 * Synthetic telemetry that behaves like a battle royale match: teams drop in
 * separate regions, then get squeezed toward a shrinking circle.
 *
 * The point is a realistic *density distribution* — sparse edges, dense
 * contested pockets, hot paths between them. Uniform noise would make the
 * heatmap look fine at any budget and hide exactly the artefacts worth catching.
 */
export function generateSynthetic(
  opts: SynthOptions,
  onProgress?: (rowsDone: number, total: number) => void,
): Dataset {
  const players = Math.max(1, opts.teams * opts.playersPerTeam);
  const ticks = Math.max(1, Math.floor(opts.rows / players));
  const count = ticks * players;

  const px = new Float32Array(count);
  const py = new Float32Array(count);
  const pz = new Float32Array(count);
  const time = new Float32Array(count);
  const yaw = new Float32Array(count);
  const pitch = new Float32Array(count);
  const personId = new Uint32Array(count);
  const teamId = new Uint16Array(count);

  const rnd = mulberry32(opts.seed);

  // Per-player live state.
  const cx = new Float32Array(players);
  const cy = new Float32Array(players);
  const cz = new Float32Array(players);
  const vx = new Float32Array(players);
  const vy = new Float32Array(players);
  const vz = new Float32Array(players);
  const phase = new Float32Array(players);
  const wobble = new Float32Array(players);

  // Team drop zones spread around the ring so early heat is well separated.
  for (let p = 0; p < players; p++) {
    const team = Math.floor(p / opts.playersPerTeam);
    const a = (team / opts.teams) * Math.PI * 2 + rnd() * 0.5;
    const r = opts.extent * (0.55 + rnd() * 0.4);
    cx[p] = Math.cos(a) * r + (rnd() - 0.5) * 220;
    cz[p] = Math.sin(a) * r + (rnd() - 0.5) * 220;
    cy[p] = rnd() * opts.heightRange * 0.25;
    phase[p] = rnd() * Math.PI * 2;
    wobble[p] = 0.4 + rnd() * 1.6;
  }

  // The circle centre drifts a little so the hot zone isn't dead centre.
  const finalX = (rnd() - 0.5) * opts.extent * 0.5;
  const finalZ = (rnd() - 0.5) * opts.extent * 0.5;

  const progressEvery = Math.max(1, Math.floor(ticks / 100));
  let w = 0;

  for (let t = 0; t < ticks; t++) {
    const tt = t / ticks;
    const secs = t * opts.tickSeconds;
    // Circle radius shrinks with a couple of plateaus, like real phases.
    const phaseStep = Math.floor(tt * 6) / 6;
    const ringR = opts.extent * (1 - 0.92 * easeInOut(phaseStep + (tt - phaseStep) * 0.35));

    for (let p = 0; p < players; p++) {
      const team = Math.floor(p / opts.playersPerTeam);

      // Steer toward a point on the ring, with per-player wander.
      const wanderA = phase[p] + secs * 0.05 * wobble[p];
      const targetR = ringR * (0.15 + 0.8 * ((p * 37) % 11) / 11);
      const tx = finalX + Math.cos(wanderA) * targetR;
      const tz = finalZ + Math.sin(wanderA) * targetR;

      const dx = tx - cx[p];
      const dz = tz - cz[p];
      const d = Math.hypot(dx, dz) + 1e-4;
      const accel = 0.9;
      vx[p] += (dx / d) * accel + (rnd() - 0.5) * 1.4;
      vz[p] += (dz / d) * accel + (rnd() - 0.5) * 1.4;
      // Terrain-ish vertical motion: slow undulation plus occasional climbs.
      vy[p] += (Math.sin(cx[p] * 0.0013) + Math.cos(cz[p] * 0.0011)) * 0.08 + (rnd() - 0.5) * 0.25;

      const damp = 0.86;
      vx[p] *= damp;
      vy[p] *= damp;
      vz[p] *= damp;

      cx[p] += vx[p];
      cy[p] += vy[p];
      cz[p] += vz[p];
      const half = opts.heightRange;
      if (cy[p] < 0) {
        cy[p] = 0;
        vy[p] = Math.abs(vy[p]) * 0.3;
      } else if (cy[p] > half) {
        cy[p] = half;
        vy[p] = -Math.abs(vy[p]) * 0.3;
      }

      px[w] = cx[p];
      py[w] = cy[p];
      pz[w] = cz[p];
      time[w] = secs;
      yaw[w] = Math.atan2(vx[p], -vz[p]);
      pitch[w] = Math.max(-1.2, Math.min(1.2, -vy[p] * 0.25));
      personId[w] = p;
      teamId[w] = team;
      w++;
    }

    if (onProgress && t % progressEvery === 0) onProgress(w, count);
  }

  const bounds = emptyBounds();
  for (let i = 0; i < count; i++) {
    if (px[i] < bounds.minX) bounds.minX = px[i];
    if (px[i] > bounds.maxX) bounds.maxX = px[i];
    if (py[i] < bounds.minY) bounds.minY = py[i];
    if (py[i] > bounds.maxY) bounds.maxY = py[i];
    if (pz[i] < bounds.minZ) bounds.minZ = pz[i];
    if (pz[i] > bounds.maxZ) bounds.maxZ = pz[i];
  }

  const dataset: Dataset = {
    id: `synth-${opts.seed}-${count}`,
    // Said from `said` below, in the language of wherever this runs.
    name: '',
    count,
    px,
    py,
    pz,
    time,
    epochMs: null,
    yaw,
    pitch,
    personId,
    teamId,
    personLabels: Array.from({ length: players }, (_, i) => `P${String(i).padStart(3, '0')}`),
    teamLabels: Array.from({ length: opts.teams }, (_, i) => `Team ${i + 1}`),
    // One continuous run, which is what synthetic data is: every player is
    // sampled on every tick from start to finish. Sessions exist to describe
    // real telemetry, where that is not true.
    sessionId: null,
    sessionLabels: [],
    sessionRows: null,
    sessionStart: null,
    sessionEnd: null,
    // Every tick emits one sample per player, so each row is superseded exactly
    // one tick later; the final tick has no successor.
    lifetime: Float32Array.from({ length: count }, (_, i) =>
      i < count - players ? opts.tickSeconds : -1,
    ),
    maxLifetimeGap: opts.tickSeconds,
    // Distinct names, one sample apiece per tick, so no name is worn by two
    // things at once. Real exports are not so tidy — see `Dataset.personShared`.
    personShared: null,
    personTeam: Uint16Array.from({ length: players }, (_, i) =>
      Math.floor(i / opts.playersPerTeam),
    ),
    personSlot: Uint16Array.from({ length: players }, (_, i) => i % opts.playersPerTeam),
    teamSizes: Uint32Array.from({ length: opts.teams }, () => opts.playersPerTeam),
    attrs: [],
    warnings: [],
    said: {
      name: msg('data.synth.name'),
      notes: [
        msg('data.synth.rows', { count, rows: countMsg(count) }),
        msg('data.synth.players', { count: players }),
      ],
      warnings: [],
    },
    bounds,
    timeRange: [0, (ticks - 1) * opts.tickSeconds],
    // Rows are emitted tick-major, so the whole array is already ascending in time.
    timeSorted: true,
  };
  sayDataset(dataset);
  return dataset;
}

function easeInOut(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 2 * c * c : 1 - 2 * (1 - c) * (1 - c);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A count in a few characters - "950", "12k", "3.4M", "1.25B" - in the viewer's language. */
export function formatCount(n: number): string {
  return say(countMsg(n));
}

/** `formatCount` as a message, for a worker to send. */
export function countMsg(n: number): Msg | string {
  if (n >= 1e9) return msg('data.count.billions', { n: { num: n / 1e9, digits: 2 } });
  if (n >= 1e6) return msg('data.count.millions', { n: { num: n / 1e6, digits: n >= 1e7 ? 0 : 1 } });
  if (n >= 1e3) return msg('data.count.thousands', { n: { num: n / 1e3, digits: 0 } });
  return String(n);
}
