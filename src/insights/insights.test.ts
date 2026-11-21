import { describe, expect, it } from 'vitest';
import { CANON } from '../data/canonical';
import type { Level } from '../render/level';
import type { Dataset } from '../state/types';
import { FULL_SCOPE } from '../volumes/stats';
import { insightsSync } from './run';
import { bhAdjust, binomTwoSided, binomUpper, rateTest, shareTest, wilson } from './stats';
import { gridFor } from './pass';

/** A small seeded random. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const POWER = [500, 300];
const CHOKE = [500, 700];

/**
 * Matches of two teams of six on a 1000 x 1000 ground. Everyone walks from
 * their spawn through one gap (the choke) towards the far side. With `planted`:
 * a quarter of red's kills are made from one spot (the power position), the
 * first red player makes 40% of red's kills, and half of blue's lives end
 * within half a minute of the spawn (the spawn trap). Without it, kills and
 * deaths fall anywhere on the way, by anyone.
 */
function synth(planted: boolean, matches = 30, seed = 7): Dataset {
  const r = rng(seed);
  type Row = { x: number; z: number; t: number; p: number; s: number; e: number; team: number; life: number };
  const rows: Row[] = [];
  const P = 12;
  for (let s = 0; s < matches; s++) {
    const t0 = s * 1000;
    const deaths: { t: number; x: number; z: number; victim: number }[] = [];
    for (let p = 0; p < P; p++) {
      const team = p < 6 ? 0 : 1;
      const home = team === 0 ? [100, 100] : [900, 900];
      let t = 0;
      while (t < 300) {
        // A life: spawn, to the gap, beyond it.
        const sx = home[0] + (r() - 0.5) * 200;
        const sz = home[1] + (r() - 0.5) * 200;
        const ex = r() * 1000;
        const ez = team === 0 ? 750 + r() * 250 : r() * 250;
        const early = planted && team === 1 && r() < 0.5;
        const len = early ? 10 + r() * 20 : 60 + r() * 200;
        const end = Math.min(300, t + len);
        const dies = end < 300;
        for (let k = 0; t + k <= end; k++) {
          const f = k / Math.max(1, end - t);
          const [x, z] =
            f < 0.5
              ? [sx + (CHOKE[0] - sx) * f * 2, sz + (CHOKE[1] - sz) * f * 2]
              : [CHOKE[0] + (ex - CHOKE[0]) * (f - 0.5) * 2, CHOKE[1] + (ez - CHOKE[1]) * (f - 0.5) * 2];
          rows.push({ x: x + (r() - 0.5) * 4, z: z + (r() - 0.5) * 4, t: t0 + t + k, p, s, e: 0, team, life: t + k + 1 <= end ? 1 : 0 });
          if (dies && t + k + 1 > end) deaths.push({ t: t0 + t + k + 0.5, x, z, victim: p });
        }
        t = end + 5;
      }
    }
    for (const d of deaths) {
      const vTeam = d.victim < 6 ? 0 : 1;
      rows.push({ x: d.x, z: d.z, t: d.t, p: d.victim, s, e: 2, team: vTeam, life: 0 });
      const kTeam = 1 - vTeam;
      let killer = kTeam * 6 + Math.floor(r() * 6);
      if (planted && kTeam === 0 && r() < 0.4) killer = 0;
      const atPower = planted && kTeam === 0 && r() < 0.25;
      const kx = atPower ? POWER[0] + (r() - 0.5) * 1.5 : d.x + (r() - 0.5) * 60;
      const kz = atPower ? POWER[1] + (r() - 0.5) * 1.5 : d.z + (r() - 0.5) * 60;
      rows.push({ x: kx, z: kz, t: d.t, p: killer, s, e: 1, team: kTeam, life: 0 });
    }
  }
  rows.sort((a, b) => a.t - b.t);
  const n = rows.length;
  return {
    id: 'synth',
    name: 'synth',
    count: n,
    px: Float32Array.from(rows, (q) => q.x),
    py: new Float32Array(n),
    pz: Float32Array.from(rows, (q) => q.z),
    time: Float32Array.from(rows, (q) => q.t),
    epochMs: null,
    lifetime: Float32Array.from(rows, (q) => q.life),
    maxLifetimeGap: 1,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: Uint32Array.from(rows, (q) => q.p),
    teamId: Uint16Array.from(rows, (q) => q.team),
    personLabels: Array.from({ length: P }, (_, i) => `p${i}`),
    teamLabels: ['red', 'blue'],
    sessionId: Uint32Array.from(rows, (q) => q.s),
    sessionLabels: Array.from({ length: matches }, (_, i) => `m${i}`),
    sessionRows: null,
    sessionStart: Float32Array.from({ length: matches }, (_, i) => i * 1000),
    sessionEnd: Float32Array.from({ length: matches }, (_, i) => i * 1000 + 300),
    personTeam: Uint16Array.from({ length: P }, (_, i) => (i < 6 ? 0 : 1)),
    personSlot: null,
    teamSizes: null,
    attrs: [{ name: CANON.event, kind: 'category', data: Uint32Array.from(rows, (q) => q.e), min: 0, max: 2, categories: ['position', 'kill', 'death'] }],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 1000, maxY: 0, maxZ: 1000 },
    timeRange: [0, rows[n - 1].t],
    timeSorted: true,
  } as unknown as Dataset;
}

describe('insight statistics', () => {
  it('has exact binomial tails, Wilson intervals and BH q-values', () => {
    // P(X >= 8 | 10, 0.5) = 56/1024.
    expect(binomUpper(8, 10, 0.5)).toBeCloseTo(56 / 1024, 10);
    expect(binomTwoSided(5, 10, 0.5)).toBe(1);
    const [lo, hi] = wilson(5, 10);
    expect(lo).toBeCloseTo(0.2366, 3);
    expect(hi).toBeCloseTo(0.7634, 3);
    const q = Array.from(bhAdjust([0.01, 0.04, 0.03, 0.5]));
    [0.04, 0.16 / 3, 0.16 / 3, 0.5].forEach((v, i) => expect(q[i]).toBeCloseTo(v, 12));
  });

  it('shrinks a handful of events towards no effect', () => {
    const few = rateTest(3, 1, 100, 100);
    const many = rateTest(300, 100, 1000, 1000);
    expect(few.raw).toBeCloseTo(3, 5);
    expect(few.shrunk).toBeLessThan(2);
    expect(many.shrunk).toBeGreaterThan(2.8);
    expect(many.p).toBeLessThan(1e-10);
    expect(shareTest(3, 3, 50, 100).shrunk).toBeLessThan(shareTest(30, 30, 50, 100).shrunk);
  });

  it('sizes the grid in round cells, a metre at the least', () => {
    const g = gridFor(0, 0, 1000, 1000);
    expect(g.f).toBe(2);
    expect(g.nx).toBeLessThanOrEqual(513);
    expect(gridFor(0, 0, 50, 20).f).toBe(1);
  });
});

describe('insights', () => {
  const report = insightsSync(synth(true), FULL_SCOPE);
  const of = (kind: string) => report.insights.filter((i) => i.kind === kind);

  it('pins the power position down to its spot', () => {
    const p = of('power.kd');
    expect(p.length).toBeGreaterThan(0);
    const top = p[0];
    expect(Math.hypot(top.place!.x - POWER[0], top.place!.z - POWER[1])).toBeLessThan(4);
    expect(top.place!.grid).toBe('fine');
    expect(top.confidence.q).toBeLessThan(0.05);
    expect(top.effect.value).toBeGreaterThan(1.5);
  });

  it('finds the spawn trap and names the side', () => {
    const s = of('spawn.trap');
    expect(s.length).toBeGreaterThan(0);
    expect(s[0].subject.team).toBe('blue');
  });

  it('finds the over-performer among comparable players', () => {
    const o = of('players.over');
    expect(o.map((i) => i.subject.person)).toContain('p0');
    expect(o[0].filters).toEqual([{ by: 'person', values: ['p0'] }]);
  });

  it('finds the choke point', () => {
    const c = of('flow.choke');
    expect(c.length).toBeGreaterThan(0);
    expect(Math.min(...c.map((i) => Math.hypot(i.place!.x - CHOKE[0], i.place!.z - CHOKE[1])))).toBeLessThan(30);
  });

  it('ranks by strength and says it all as plain JSON', () => {
    // Strongest first within each kind (the list leads with a few of every kind).
    const byKind = new Map<string, number[]>();
    for (const i of report.insights) {
      const k = i.kind;
      byKind.set(k, [...(byKind.get(k) ?? []), i.strength]);
    }
    for (const s of byKind.values()) expect(s).toEqual([...s].sort((a, b) => b - a));
    expect(JSON.parse(JSON.stringify(report))).toEqual(report);
    expect(new Set(report.insights.map((i) => i.id)).size).toBe(report.insights.length);
    for (const i of report.insights) expect(i.sentence.key).toBe(`insights.say.${i.kind}`);
  });

  it('measures cover by the level geometry where there is a level', () => {
    // Geometry over the western half only: buildings there, open ground east.
    const v: number[] = [];
    for (let x = 0; x < 500; x += 4) for (let z = 0; z < 1000; z += 4) v.push(x, 0, z, 0, 1, 0);
    const level = { kind: 'model', vertices: new Float32Array(v) } as unknown as Level;
    const r = insightsSync(synth(true), FULL_SCOPE, level);
    expect(r.dataset.hasLevel).toBe(true);
    expect(r.detectors.find((d) => d.id === 'cover')!.tests).toBe(2);
    // Every event's cover read against 31,000 level vertices: real work, given room while the whole suite runs.
  }, 30_000);

  it('finds no power position, spawn trap or star player in noise', () => {
    const noise = insightsSync(synth(false, 30, 11), FULL_SCOPE);
    const kinds = noise.insights.map((i) => i.kind);
    expect(kinds).not.toContain('power.kd');
    expect(kinds).not.toContain('spawn.trap');
    expect(kinds).not.toContain('players.over');
  });
});
