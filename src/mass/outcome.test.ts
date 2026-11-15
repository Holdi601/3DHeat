import { describe, expect, it } from 'vitest';
import type { LeanSpec } from '../overlay/lean/scan';
import { discoverNiches, roundsTable } from './niche';
import { discoverPlaces, scanFrame, type PlaceJob, type PlaceMatch } from './scan';
import { MassStore } from './store';
import { SummaryBuilder, summaryColumns } from './summarize';
import { UR_STRIDE, type OutcomeSection, type SummaryGrid, type SummaryHead } from './types';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

// ---------------------------------------------------------------------------
// The summary

const SPEC: LeanSpec = {
  time: 'time', timeScale: 1, x: 'x', y: 'y', z: 'z',
  axes: { up: 'y', flipX: false, flipY: false, flipZ: false, scale: 1 },
  track: 'track', match: null, event: 'event', team: 'team', look: 'none',
  dirX: null, dirY: null, dirZ: null, yaw: null, pitch: null, angleScale: 1, roll: null, meta: [], units: 1,
};
const COLUMNS = ['time', 'x', 'y', 'z', 'track', 'event', 'team', 'vehicle', 'ai', 'player', 'won', 'round', 'place', 'buy', 'weapon', 'other'];
const NUMERIC = new Set(['time', 'x', 'y', 'z', 'won', 'round']);

/** Four rounds of two sides of two; side `T` wins rounds 1 and 3. T's first player holds `Mid` (x 100) and fires an AWP. */
function roundsMatch() {
  const cols = summaryColumns(COLUMNS, (c) => NUMERIC.has(c), SPEC);
  const b = new SummaryBuilder(SPEC, cols, { id: 'r', manifest: { game: 'test', map: 'm1' } });
  const rows: Record<string, unknown[]> = Object.fromEntries(COLUMNS.map((c) => [c, []]));
  const push = (r: Record<string, unknown>) => COLUMNS.forEach((c) => rows[c].push(r[c] ?? null));
  for (let round = 1; round <= 4; round++) {
    const tWins = round % 2 === 1;
    const t0 = (round - 1) * 100;
    for (const [track, team, x, place] of [['t1', 'T', 100, 'Mid'], ['t2', 'T', 300, 'A'], ['c1', 'CT', 500, 'B'], ['c2', 'CT', 700, 'B']] as const) {
      const won = (team === 'T') === tWins ? 1 : 0;
      for (let s = 0; s <= 20; s++) push({ time: t0 + s, x: x + (round === 4 && track === 't1' ? 400 : 0), y: 0, z: 10, track: `${track}#${round}`, event: 'position', team, vehicle: 'agent', ai: false, player: track, won, round, place: round === 4 && track === 't1' ? 'B' : place, buy: round === 1 ? 'pistol' : 'full' });
    }
    push({ time: t0 + 10, x: 100, y: 0, z: 10, track: `t1#${round}`, event: 'kill', team: 'T', vehicle: 'agent', ai: false, player: 't1', won: tWins ? 1 : 0, round, weapon: 'AWP', other: `c1#${round}` });
  }
  const n = rows.time.length;
  b.add(Object.fromEntries(COLUMNS.map((c) => [c, rows[c]])), n);
  return b.finish();
}

describe('the summary counts rounds by result', () => {
  const s = roundsMatch();
  it('per side, unit, player and weapon', () => {
    expect(s.version).toBe(2);
    const T = s.teams.find((t) => t.name === 'T')!;
    expect(T.rounds).toEqual([2, 4]);
    expect(s.teams.find((t) => t.name === 'CT')!.rounds).toEqual([2, 4]);
    const awp = s.weapons.find((w) => w.name === 'AWP')!;
    expect(awp.rw).toEqual([2, 4]);
    const t1 = s.playerStats.find((p) => p.name === 't1')!;
    expect(t1.rw).toEqual([2, 4]);
    const agentT = s.vehicles.find((v) => v.key === 'agent' && s.teams[v.team].name === 'T')!;
    expect(agentT.rw).toEqual([4, 8]);
  });

  it('the rounds each side was in each cell, won and lost', () => {
    const g = s.grid!;
    expect(g.pw && g.pw.length).toBeTruthy();
    const slotT = s.teams.findIndex((t) => t.name === 'T');
    // Mid (x 100): T was there in rounds 1-3 (won 1 and 3, lost 2).
    let won = 0, lost = 0;
    for (let q = 0; q < g.pw!.length; q += 4) {
      const ci = g.pw![q];
      const x = (g.ix[ci] + 0.5) * g.cell;
      if (g.pw![q + 1] === slotT && Math.abs(x - 100) < g.cell) {
        won += g.pw![q + 2];
        lost += g.pw![q + 3];
      }
    }
    expect([won, lost]).toEqual([2, 1]);
  });

  it('every unit-round with its place, weapon, buy and the first kill', () => {
    const o = s.outcome!;
    expect(o.r.length).toBe(4 * 3);
    // Round 1: T won it and made the first kill.
    const slotT = s.teams.findIndex((t) => t.name === 'T');
    expect(o.r.slice(0, 3)).toEqual([1, slotT, slotT]);
    expect(o.u.length).toBe(16 * UR_STRIDE);
    const rowsT1 = [];
    for (let q = 0; q < o.u.length; q += UR_STRIDE) if (o.u[q + 3] >= 0) rowsT1.push(o.u.slice(q, q + UR_STRIDE));
    expect(rowsT1.length).toBe(4);
    expect(rowsT1.every((r) => o.weapons[r[3]] === 'AWP')).toBe(true);
    expect(rowsT1.map((r) => o.places[r[4]])).toEqual(['Mid', 'Mid', 'Mid', 'B']);
    expect(rowsT1.map((r) => r[5])).toEqual([1, 2, 2, 2]);
  });
});

// ---------------------------------------------------------------------------
// The place scan's win rate

const G = 64;
const CELL = 8;

/**
 * A match of `R` rounds on a 64 x 64 map: each side spawns at its edge and
 * takes one of three lanes a round, with a few stray cells; side `a` wins a
 * share of rounds that changes from match to match (its own balance). With
 * `plant`, side `a` wins `hi` of its rounds through the north lane and `lo`
 * of the rest; without, the lane says nothing.
 */
function laneMatch(seed: number, R: number, plant: { hi: number; lo: number } | null): SummaryGrid {
  const r = rng(seed * 7919 + 3);
  const base = 0.3 + 0.4 * r();
  const cells = new Map<number, { p: number; w: [number, number, number, number] }>();
  const at = (x: number, z: number) => {
    const k = z * G + x;
    let c = cells.get(k);
    if (!c) cells.set(k, (c = { p: 0, w: [0, 0, 0, 0] }));
    return c;
  };
  for (let round = 0; round < R; round++) {
    const lane = [Math.floor(r() * 3), Math.floor(r() * 3)];
    const pa = plant ? (lane[0] === 0 ? plant.hi : plant.lo) : base;
    const aWon = r() < pa;
    for (let side = 0; side < 2; side++) {
      const won = side === 0 ? aWon : !aWon;
      const seen = new Set<number>();
      const z0 = 8 + lane[side] * 20;
      for (let x = 2; x < G - 2; x++) {
        if (side === 0 ? x > 40 : x < 24) continue;
        for (let z = z0; z < z0 + 4; z++) seen.add(z * G + x);
      }
      for (let k = 0; k < 25; k++) seen.add(Math.floor(r() * G) + G * Math.floor(r() * G));
      for (const k of seen) {
        const c = at(k % G, Math.floor(k / G));
        c.p += 3;
        c.w[side * 2 + (won ? 0 : 1)]++;
      }
    }
  }
  const g: SummaryGrid = { cell: CELL, ix: [], iz: [], p: [], pt: [], pc: [], ph: [], y: [], y0: [], fx: [], fz: [], e: [], pw: [], bands: { by: 'height', floor: 0, unitsPerMetre: 1 }, ts: { cell: CELL * 8, minute: 60, v: [] } };
  for (const [k, c] of cells) {
    const i = g.ix.length;
    g.ix.push(k % G);
    g.iz.push(Math.floor(k / G));
    g.p.push(c.p);
    g.pt.push(c.p / 2, c.p / 2, 0);
    g.y.push(0);
    g.y0.push(0);
    g.fx.push(0);
    g.fz.push(0);
    if (c.w[0] + c.w[1]) g.pw!.push(i, 0, c.w[0], c.w[1]);
    if (c.w[2] + c.w[3]) g.pw!.push(i, 1, c.w[2], c.w[3]);
  }
  return g;
}

function laneJob(n: number, seed: number, plant: { hi: number; lo: number } | null): PlaceJob {
  const grids = Array.from({ length: n }, (_, i) => laneMatch(seed * 100003 + i, 24, plant));
  return {
    map: `lanes${seed}`,
    frame: scanFrame(grids.map(() => [0, 0, G * CELL, G * CELL] as [number, number, number, number]))!,
    plan: { events: [], classes: [], teams: ['a', 'b'], bands: false, win: true },
    read: async (visit: (m: PlaceMatch) => void) => grids.forEach((grid, i) => visit({ i, grid, teams: ['a', 'b'], duration: 1800 })),
  };
}

describe('place scan: win rate', () => {
  it('finds the lane whose holders win, against the side\'s own rate in each match', async () => {
    const run = await discoverPlaces([laneJob(80, 1, { hi: 0.7, lo: 0.35 })]);
    const hit = run.findings.find((f) => f.event === 'win' && f.team === 'a' && f.dir === 1 && f.z < 20 * CELL && f.x < 44 * CELL);
    expect(hit, JSON.stringify(run.findings.map((f) => [f.measure, f.dir, Math.round(f.x / CELL), Math.round(f.z / CELL), f.q]))).toBeTruthy();
    expect(hit!.q).toBeLessThan(0.05);
  }, 120_000);

  it('holds the false discovery rate where lanes do not matter (many seeds)', async () => {
    let withAny = 0;
    let total = 0;
    const SEEDS = 20;
    for (let seed = 0; seed < SEEDS; seed++) {
      const run = await discoverPlaces([laneJob(50, 900 + seed, null)]);
      const wins = run.findings.filter((f) => f.event === 'win');
      total += wins.length;
      if (wins.length) withAny++;
    }
    // Under the complete null the FDR is the chance of any finding: 5% nominal, binomial slack over 20 runs.
    expect(withAny).toBeLessThanOrEqual(3);
    expect(total).toBeLessThanOrEqual(5);
  }, 300_000);
});

// ---------------------------------------------------------------------------
// The rounds niches

const WEAPONS = ['AK', 'M4', 'AWP', 'Deagle', 'MP9'];

/** A match head with only what the rounds table reads: two sides, the map, and unit-rounds. */
function roundsHead(r: () => number, i: number, effect: number): SummaryHead {
  const map = `m${i % 3}`;
  // Each match its own balance, and side 0 stronger on m2 throughout: base rates, never niches.
  const base = 0.3 + 0.3 * r() + (map === 'm2' ? 0.15 : 0);
  const rr: number[] = [];
  const u: number[] = [];
  for (let k = 0; k < 20; k++) {
    // Side 0 sometimes carries an AWP; on m1 that wins it rounds (with `effect`).
    const awp = r() < 0.4;
    const p = Math.min(0.95, base + (awp && map === 'm1' ? effect : 0));
    const aWon = r() < p;
    rr.push(k + 1, aWon ? 0 : 1, r() < 0.5 ? 0 : 1);
    for (let s = 0; s < 2; s++)
      for (let j = 0; j < 5; j++) {
        const w = s === 0 && j === 0 && awp ? 2 : [0, 1, 3, 4][Math.floor(r() * 4)];
        u.push(k, s, -1, w, Math.floor(r() * 4), Math.floor(r() * 3), (s === 0) === aWon ? 1 : 0);
      }
  }
  const outcome: OutcomeSection = { vehicles: [], weapons: WEAPONS, places: ['A', 'B', 'Mid', 'Long'], r: rr, u };
  return {
    format: '3dheat-summary', version: 2, id: `x${i}`, game: 'test', map, mode: null, mission: null, started: null, duration: 1800, rows: 0, units: 10, players: 10, ai: 0,
    teams: ['T', 'CT'].map((name) => ({ name, units: 5, players: 5, presence: 0, kills: 0, deaths: 0, won: null, val: [] })),
    winner: null, events: {}, vehicles: [], playerStats: [], weapons: [], economy: { columns: [] }, phases: { bins: 20, kinds: {}, minute: 60, minutes: {} },
    extent: null, kinds: [], classes: [], outcome, built: { by: 'test', at: '', ms: 0 },
  };
}

function roundsStore(n: number, seed: number, effect: number): MassStore {
  const r = rng(seed);
  const s = new MassStore();
  for (let i = 0; i < n; i++) s.add(`m${i}`, roundsHead(r, i, effect));
  return s;
}

describe('rounds niches', () => {
  it('find the weapon x map x side whose rounds are won beyond the side\'s own rate, and link its matches and rounds', () => {
    const s = roundsStore(120, 5, 0.3);
    const t = roundsTable(s, new Uint8Array(s.matches).fill(1));
    expect(t.rows).toBe(120 * 20 * 10);
    const run = discoverNiches([t], s.matches);
    expect(run.nulls?.['rounds:roundWin']).toBeGreaterThanOrEqual(1);
    const hit = run.findings.find((f) => f.target === 'roundWin' && f.dir === 1 && f.conds.some((c) => c.v === 'AWP') && f.conds.some((c) => c.v === 'm1'));
    expect(hit, JSON.stringify(run.findings.slice(0, 5).map((f) => [f.id, f.value, f.base, f.q]))).toBeTruthy();
    expect(hit!.value).toBeGreaterThan(hit!.base);
    expect(hit!.matchIds!.length).toBeGreaterThan(0);
    expect(hit!.rounds!.length).toBeGreaterThan(0);
    expect(hit!.wracc).toBeGreaterThan(0);
  }, 120_000);

  it('hold the false discovery rate on shuffled-free null data (many seeds)', () => {
    let withAny = 0;
    let total = 0;
    const SEEDS = 30;
    for (let seed = 0; seed < SEEDS; seed++) {
      const s = roundsStore(80, 300 + seed, 0);
      const run = discoverNiches([roundsTable(s, new Uint8Array(s.matches).fill(1))], s.matches);
      total += run.findings.length;
      if (run.findings.length) withAny++;
    }
    // Under the complete null the FDR is the chance of any finding: 5% nominal, binomial slack over 30 runs.
    expect(withAny).toBeLessThanOrEqual(3);
    expect(total).toBeLessThanOrEqual(5);
  }, 300_000);
});
