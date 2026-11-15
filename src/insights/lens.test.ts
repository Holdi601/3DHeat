import { describe, expect, it } from 'vitest';
import { CANON } from '../data/canonical';
import type { Dataset } from '../state/types';
import { FULL_SCOPE } from '../volumes/stats';
import { debriefPrompt } from './ai/prompt';
import { KB, KB_BY_ID, kbStats, PATTERNS, REF_BY_ID, REFERENCES } from './knowledge';
import { ofInsight, readReport, topEntries } from './lens';
import { aucTest, concentration, fitLanchester, spearman } from './lensMetrics';
import { baseDebrief } from './narrate';
import { insightsSync } from './run';

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

/** Poisson draw (Knuth), small means. */
function poisson(r: () => number, mean: number): number {
  const l = Math.exp(-mean);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= r();
  } while (p > l);
  return k - 1;
}

/**
 * Battles of two teams under aimed fire (Lanchester's square law): each second
 * a side loses units at a rate proportional to the other side's alive
 * strength, team 0 shooting `edge` times as well. With `air`, every unit is a
 * fighter, team 0 flying high and team 1 low, both at 200 m/s.
 */
function battles(matches: number, mode: 'ground' | 'air' | 'sea', seed = 3): Dataset {
  const air = mode === 'air';
  const r = rng(seed);
  type Row = { x: number; y: number; z: number; t: number; p: number; s: number; e: number; team: number };
  const rows: Row[] = [];
  const edge = 1.6;
  const k = 0.004;
  let persons = 0;
  for (let s = 0; s < matches; s++) {
    const t0 = s * 1000;
    const n = [6 + Math.floor(r() * 10), 6 + Math.floor(r() * 10)];
    const units: { p: number; team: number; alive: boolean; x: number; z: number; y: number; ph: number }[] = [];
    for (let team = 0; team < 2; team++)
      for (let i = 0; i < n[team]; i++)
        units.push({ p: persons++, team, alive: true, x: team === 0 ? 300 + r() * 100 : 600 + r() * 100, z: 200 + r() * 600, y: air ? (team === 0 ? 3000 : 1000) : 0, ph: r() * 6.28 });
    for (let sec = 0; sec < 400; sec++) {
      const alive = [0, 1].map((tm) => units.filter((u) => u.alive && u.team === tm));
      if (!alive[0].length || !alive[1].length) break;
      for (const u of units) {
        if (!u.alive) continue;
        // Air units circle at 200 m/s; ground units drift slowly.
        const speed = air ? 200 : 1;
        const a = u.ph + (sec * speed) / 400;
        rows.push({ x: u.x + Math.cos(a) * (air ? 400 : 5), y: u.y, z: u.z + Math.sin(a) * (air ? 400 : 5), t: t0 + sec, p: u.p, s, e: 0, team: u.team });
      }
      for (const tm of [0, 1]) {
        const shooters = alive[1 - tm];
        const rate = k * shooters.length * (tm === 1 ? edge : 1);
        let lost = Math.min(alive[tm].length, poisson(r, rate));
        while (lost-- > 0) {
          const live = alive[tm].filter((u) => u.alive);
          if (!live.length) break;
          const v = live[Math.floor(r() * live.length)];
          const killer = shooters[Math.floor(r() * shooters.length)];
          v.alive = false;
          rows.push({ x: v.x, y: v.y, z: v.z, t: t0 + sec + 0.5, p: v.p, s, e: 2, team: v.team });
          rows.push({ x: killer.x, y: killer.y, z: killer.z, t: t0 + sec + 0.5, p: killer.p, s, e: 1, team: killer.team });
          // The killer launched its weapon four seconds before.
          rows.push({ x: killer.x, y: killer.y, z: killer.z, t: t0 + sec - 3.5, p: killer.p, s, e: 3, team: killer.team });
        }
      }
    }
  }
  rows.sort((a, b) => a.t - b.t);
  const N = rows.length;
  const attrs: unknown[] = [{ name: CANON.event, kind: 'category', data: Uint32Array.from(rows, (q) => q.e), min: 0, max: 3, categories: ['position', 'kill', 'death', 'launch'] }];
  if (mode !== 'ground') attrs.push({ name: CANON.vehicleClass, kind: 'category', data: new Uint32Array(N), min: 0, max: 0, categories: [air ? 'fighter' : 'ship'] });
  return {
    id: mode,
    name: 'lens-synth',
    count: N,
    px: Float32Array.from(rows, (q) => q.x),
    py: Float32Array.from(rows, (q) => q.y),
    pz: Float32Array.from(rows, (q) => q.z),
    time: Float32Array.from(rows, (q) => q.t),
    epochMs: null,
    lifetime: Float32Array.from(rows, (q) => (q.e === 0 ? 1 : 0)),
    maxLifetimeGap: 1,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: Uint32Array.from(rows, (q) => q.p),
    teamId: Uint16Array.from(rows, (q) => q.team),
    personLabels: Array.from({ length: persons }, (_, i) => `p${i}`),
    teamLabels: ['red', 'blue'],
    sessionId: Uint32Array.from(rows, (q) => q.s),
    sessionLabels: Array.from({ length: matches }, (_, i) => `m${i}`),
    sessionRows: null,
    sessionStart: Float32Array.from({ length: matches }, (_, i) => i * 1000),
    sessionEnd: Float32Array.from({ length: matches }, (_, i) => i * 1000 + 400),
    personTeam: null,
    personSlot: null,
    teamSizes: null,
    attrs,
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 1000, maxY: air ? 3000 : 0, maxZ: 1000 },
    timeRange: [0, rows[N - 1].t],
    timeSorted: true,
  } as unknown as Dataset;
}

describe('the knowledge base', () => {
  it('has unique ids, known patterns, resolving references and links', () => {
    const ids = new Set<string>();
    const pats = new Set(PATTERNS.map((p) => p.id));
    const bad: string[] = [];
    for (const e of KB) {
      if (ids.has(e.id)) bad.push(`duplicate ${e.id}`);
      ids.add(e.id);
      if (!e.id.startsWith(`${e.type}.`)) bad.push(`${e.id}: id does not start with its type`);
      if (!e.refs.length) bad.push(`${e.id}: no references`);
      for (const r of e.refs) if (!REF_BY_ID.has(r)) bad.push(`${e.id}: unknown reference ${r}`);
      for (const p of Object.keys(e.patterns)) if (!pats.has(p)) bad.push(`${e.id}: unknown pattern ${p}`);
      for (const s of e.see ?? []) if (!KB_BY_ID.has(s)) bad.push(`${e.id}: unknown link ${s}`);
      if (e.quote && !REF_BY_ID.get(e.quote.ref)?.pd) bad.push(`${e.id}: quote from a work not in the public domain`);
      if (e.type === 'case' && !(e.when && e.outcome && e.scale)) bad.push(`${e.id}: case without when, outcome or scale`);
    }
    expect(bad).toEqual([]);
    const st = kbStats();
    expect(st.cases).toBeGreaterThanOrEqual(40);
    expect(st.references).toBeGreaterThanOrEqual(120);
  });

  it('reaches every pattern from some entry', () => {
    const used = new Set(KB.flatMap((e) => Object.keys(e.patterns)));
    expect(PATTERNS.filter((p) => !used.has(p.id)).map((p) => p.id)).toEqual([]);
  });
});

describe('lens statistics', () => {
  it('recovers Lanchester exponents by Poisson regression', () => {
    const r = rng(11);
    const y: number[] = [];
    const la: number[] = [];
    const lb: number[] = [];
    for (let i = 0; i < 3000; i++) {
      const A = 2 + Math.floor(r() * 20);
      const B = 2 + Math.floor(r() * 20);
      y.push(poisson(r, 0.05 * B));
      la.push(Math.log(A));
      lb.push(Math.log(B));
    }
    const sq = fitLanchester(y, la, lb, 10)!;
    expect(sq.p).toBeGreaterThan(0.85);
    expect(sq.p).toBeLessThan(1.15);
    expect(Math.abs(sq.q)).toBeLessThan(0.15);
    expect(sq.law).toBe('square');
    const y2 = la.map((a, i) => poisson(r, 0.004 * Math.exp(a) * Math.exp(lb[i])));
    const lin = fitLanchester(y2, la, lb, 10)!;
    expect(lin.q).toBeGreaterThan(0.8);
    expect(lin.law).toBe('linear');
  });

  it('measures concentration against time spent, not against the number of places', () => {
    const even = concentration(Array(200).fill(10), Array(200).fill(100));
    expect(even.top5).toBeCloseTo(0.05, 2);
    expect(even.gini).toBeLessThan(0.02);
    // Few deaths over many places: sparse, not concentrated.
    const sparse = concentration(Array.from({ length: 2000 }, (_, i) => (i % 20 === 0 ? 1 : 0)), Array(2000).fill(100));
    expect(sparse.top5 - sparse.nullTop5).toBeLessThan(0.1);
    const hot = concentration([500, ...Array(199).fill(1)], Array(200).fill(100));
    expect(hot.top5).toBeGreaterThan(0.6);
    expect(hot.top5 - hot.nullTop5).toBeGreaterThan(0.4);
    expect(hot.gini).toBeGreaterThan(0.5);
  });

  it('ranks with ties: Spearman and the Mann-Whitney AUC', () => {
    expect(spearman([1, 2, 3, 4, 5], [10, 20, 30, 40, 50])).toBeCloseTo(1, 10);
    expect(spearman([1, 2, 3, 4, 5], [5, 4, 3, 2, 1])).toBeCloseTo(-1, 10);
    expect(aucTest([5, 6, 7], [1, 2, 3]).auc).toBe(1);
    expect(aucTest([1, 2, 3], [1, 2, 3]).auc).toBeCloseTo(0.5, 10);
  });
});

describe('lens metrics on simulated battles', () => {
  it('measures attrition, force ratios, trades, initiative and key terrain on the ground', () => {
    const rep = insightsSync(battles(60, 'ground'), FULL_SCOPE);
    const L = rep.lens!;
    expect(L.lanchester).toBeDefined();
    expect(L.lanchester!.p).toBeGreaterThan(0.6);
    expect(L.lanchester!.p).toBeLessThan(1.4);
    expect(Math.abs(L.lanchester!.q)).toBeLessThan(0.4);
    expect(L.exchange!.byTeam.find((t) => t.team === 'red')!.ratio!).toBeGreaterThan(1);
    expect(L.forceRatio!.kills).toBeGreaterThan(100);
    expect(L.trades!.deaths).toBeGreaterThan(100);
    expect(L.initiative!.engagements).toBeGreaterThan(10);
    expect(L.keyTerrain!.matches).toBe(60);
    expect(L.fieldsOfFire?.source).toBe('ground');
    expect(L.energy).toBeUndefined();
  });

  it('reads the energy state of aircraft', () => {
    const rep = insightsSync(battles(40, 'air'), FULL_SCOPE);
    const E = rep.lens!.energy!;
    expect(rep.lens!.domain.air).toBe(1);
    expect(E.kills).toBeGreaterThan(50);
    // Team 0 flies high and shoots better: killers carry more energy than victims.
    expect(E.auc).toBeGreaterThan(0.6);
    expect(E.killerMedian).toBeGreaterThan(E.victimMedian);
    expect(rep.lens!.fieldsOfFire).toBeUndefined();
  });

  it('measures combat power, ranges, the kill chain, dispersion, sorties and the salvo model', () => {
    const rep = insightsSync(battles(60, 'ground'), FULL_SCOPE);
    const L = rep.lens!;
    // Red shoots 1.6 times as well per unit: it kills more per unit-hour.
    expect(L.combatPower!.better).toBe('red');
    expect(L.combatPower!.cev).toBeGreaterThan(1.2);
    expect(L.combatPower!.lo).toBeGreaterThan(1);
    // Every kill follows its launch by four seconds.
    const chain = L.killChain!.groups[0];
    expect(chain.launchToKill!.p50).toBeCloseTo(4, 0);
    expect(L.ranges!.groups[0].kill!.p50).toBeGreaterThan(100);
    expect(L.dispersion!.bins).toBeGreaterThan(10);
    const sea = insightsSync(battles(60, 'sea'), FULL_SCOPE).lens!;
    expect(sea.domain.sea).toBe(1);
    expect(sea.salvo!.alpha).toBeGreaterThan(0);
    expect(sea.salvo!.bins).toBeGreaterThan(50);
    const air = insightsSync(battles(40, 'air'), FULL_SCOPE).lens!;
    expect(air.ranges!.groups.find((g) => g.group === 'air')!.launch).not.toBeNull();
    const names = readReport(rep).map((x) => x.about);
    for (const id of ['lens.combatPower', 'lens.ranges', 'lens.killChain', 'lens.dispersion']) expect(names).toContain(id);
  });

  it('judges findings and metrics through the literature, in the debrief and for a model', () => {
    const rep = insightsSync(battles(60, 'ground'), FULL_SCOPE);
    const readings = readReport(rep, 'auto');
    const lanch = readings.find((x) => x.about === 'lens.lanchester')!;
    expect(lanch.literature.map((h) => h.id)).toContain('concept.lanchester-square');
    expect(lanch.literature[0].cites).toMatch(/\(.*\d{4}/);
    // A lens that does not fit an entry leaves it out.
    expect(readReport(rep, 'design').flatMap((x) => x.literature).every((h) => KB_BY_ID.get(h.id)!.lenses.includes('design'))).toBe(true);
    const d = baseDebrief(rep, (i) => i.kind);
    const lens = d.paragraphs.filter((p) => p.role);
    expect(lens.some((p) => p.role === 'metrics')).toBe(true);
    expect(lens.some((p) => p.role === 'literature' && /\d{4}\)/.test(p.text))).toBe(true);
    expect(lens.every((p) => p.cites.length === 0)).toBe(true);
    const prompt = debriefPrompt(rep, (k) => k, { language: 'en', names: false });
    expect(prompt.user).toContain('Knowledge:');
    expect(prompt.user).toContain('concept.lanchester-square');
    expect(prompt.system).toContain('curly braces');
    expect(debriefPrompt(rep, (k) => k, { language: 'en', names: false, lens: false }).user).not.toContain('Knowledge:');
    expect(topEntries(rep, 'auto').length).toBeGreaterThan(5);
  });

  it('maps every detector kind onto patterns', () => {
    const kinds = ['power.kd', 'power.safe', 'zones.hot', 'zones.cold', 'cover.open', 'cover.dense', 'cover.slow', 'cover.fast', 'spawn.trap', 'spawn.safe', 'spawn.strong', 'classPlace.strong', 'classPlace.weak', 'classPlace.actorStrong', 'classPlace.actorWeak', 'players.over', 'players.under', 'players.fragile', 'players.durable', 'flow.choke', 'flow.flank', 'value.earned', 'value.lost'];
    const pats = new Set(PATTERNS.map((p) => p.id));
    for (const kind of kinds) {
      const s = ofInsight({ kind, strength: 0.5, effect: { value: 2 }, evidence: {}, sentence: { params: {} }, subject: {} } as never);
      expect(s, kind).not.toBeNull();
      for (const p of Object.keys(s!.patterns)) expect(pats.has(p), `${kind}: ${p}`).toBe(true);
    }
  });
});

describe('bibliography verification marker', () => {
  it('carries a valid ISO date where present', () => {
    const bad = REFERENCES.filter((r) => r.verified !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(r.verified)).map((r) => r.id);
    expect(bad).toEqual([]);
  });

  it('names how far a verified reference was checked', () => {
    const bad = REFERENCES.filter((r) => r.verified !== undefined && r.verifiedLevel !== 'detail' && r.verifiedLevel !== 'existence').map((r) => r.id);
    expect(bad).toEqual([]);
  });
});
