import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import { curateInsights, rankInsights, sampleSize, spreadFails } from './curate';
import { peaks, throughRoute } from './detectors';
import { fitPlace } from './fit';
import { highlightLines } from './highlight';
import type { Insight } from './types';
import { plainInsight } from '../ui/insights/plain';
import { pctText, ratioText } from '../ui/insights/say';

function ins(p: Partial<Insight> & { kind: string }): Insight {
  return {
    id: p.kind + Math.random(),
    detector: p.kind.split('.')[0] as Insight['detector'],
    sentence: { key: `insights.say.${p.kind}`, params: { ratio: 3 } },
    strength: 0.8,
    effect: { measure: 'rateRatio', value: 3, raw: 3, lo: 2, hi: 4 },
    confidence: { p: 1e-6, q: 1e-5, level: 'high', tests: 100, method: '' },
    evidence: {},
    place: null,
    time: null,
    filters: [],
    subject: {},
    ...p,
  };
}

const place = (x: number, z: number, radius: number) => ({ x, y: 0, z, radius, grid: 'mid' as const, cell: 10 });

describe('curateInsights', () => {
  it('leaves out findings that say nothing, each with its reason', () => {
    const spawn = ins({ kind: 'spawn.trap', place: place(100, 100, 30), evidence: { spawns: 40 } });
    const all = [
      ins({ kind: 'zones.hot', place: place(500, 500, 400), evidence: { count: 300, expected: 20, mapCount: 400, presence: 50, mapPresence: 1000 } }),
      ins({ kind: 'zones.cold', place: place(300, 300, 20), evidence: { count: 2, expected: 30, presence: 400, mapPresence: 1000 } }),
      ins({ kind: 'power.safe', place: place(110, 100, 20), evidence: { deaths: 1, presence: 30, mapDeaths: 500, mapPresence: 1000 } }),
      ins({ kind: 'zones.hot', place: place(700, 700, 20), evidence: { count: 4, expected: 0.4, presence: 1, mapPresence: 1000 } }),
      ins({ kind: 'zones.hot', place: place(200, 800, 20), subject: { eventKind: 'spawn' }, evidence: { count: 90, expected: 9 } }),
      spawn,
      ins({ kind: 'power.kd', place: place(600, 200, 8), evidence: { kills: 40, deaths: 5 } }),
    ];
    const { kept, dropped } = curateInsights(all, { mapExtent: 1000, presence: 1000 });
    expect(dropped.map((d) => d.reason).sort()).toEqual(['exposure', 'fewEvents', 'spawn', 'trivialKind', 'wholeMap']);
    expect(kept.map((k) => k.kind).sort()).toEqual(['power.kd', 'spawn.trap']);
    expect(kept.every((k) => typeof k.usefulness === 'number')).toBe(true);
  });

  it('marks a hot zone hardly anyone stands in as a target area', () => {
    const z = ins({ kind: 'zones.hot', place: place(500, 500, 20), evidence: { count: 365, expected: 3.7, mapCount: 1100, presence: 3, mapPresence: 1000 } });
    curateInsights([z], { mapExtent: 1000, presence: 1000 });
    expect(z.variant).toBe('target');
    expect(sampleSize(z)).toBe(365);
  });

  it('ranks a tight place over a sprawling one of the same evidence', () => {
    const tight = ins({ kind: 'power.kd', place: place(100, 100, 10), evidence: { kills: 50, deaths: 5 } });
    const wide = ins({ kind: 'power.kd', place: place(500, 500, 150), evidence: { kills: 50, deaths: 5 } });
    const { kept } = curateInsights([wide, tight], { mapExtent: 1000, presence: 1000 });
    expect(kept[0]).toBe(tight);
  });
});

describe('peaks', () => {
  it('splits a sprawling area into its hot spots', () => {
    // A 10 x 1 strip of cells with two bumps, at 2 and at 7.
    const w = 10;
    const score = (c: number) => [1, 3, 9, 3, 1, 1, 4, 8, 4, 1][c];
    const out = peaks([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], w, score);
    expect(out[0]).toContain(2);
    expect(out[1]).toContain(7);
    expect(out.every((p) => p.length <= 3)).toBe(true);
  });
});

function dataset(points: Array<[number, number, number, number]>): Dataset {
  return {
    id: 'd',
    count: points.length,
    px: Float32Array.from(points.map((p) => p[0])),
    py: Float32Array.from(points.map((p) => p[1])),
    pz: Float32Array.from(points.map((p) => p[2])),
    teamId: null,
    personId: null,
    teamLabels: [],
    personLabels: [],
    attrs: [{ name: 'event', kind: 'category', categories: ['position', 'explosion'], data: Uint32Array.from(points.map((p) => p[3])) }],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 1000, maxY: 3000, maxZ: 1000 },
  } as unknown as Dataset;
}

function run<T>(g: Generator<unknown, T, void>): T {
  for (;;) {
    const r = g.next();
    if (r.done) return r.value;
  }
}

describe('fitPlace', () => {
  it('fits the footprint and the height band to the events, not to the grid and the sky', () => {
    const pts: Array<[number, number, number, number]> = [];
    // 200 explosions in a 10 m spot at ground level (y 0..4), and aircraft far above and around.
    for (let i = 0; i < 200; i++) pts.push([500 + (i % 10), (i % 5) * 1, 500 + Math.floor(i / 20), 1]);
    for (let i = 0; i < 200; i++) pts.push([450 + (i % 100), 2500, 450 + (i % 100), 0]);
    const ds = dataset(pts);
    const z = ins({ kind: 'zones.hot', place: place(505, 505, 120), filters: [{ by: 'category', column: 'event', values: ['explosion'] }] });
    const f = run(fitPlace(ds, z))!;
    expect(f.fitted).toBe(true);
    expect(f.count).toBe(200);
    expect(f.radius).toBeLessThan(15);
    expect(f.floor).toBeGreaterThanOrEqual(-0.5);
    expect(f.ceil).toBeLessThan(10);
    expect(Math.hypot(f.x - 505, f.z - 505)).toBeLessThan(3);
    const lines = highlightLines(f, ds, 0.5);
    expect(lines.count).toBeGreaterThan(128);
  });
});

describe('plainInsight', () => {
  it('says a target area in plain words, with its share and the time spent there', () => {
    const z = ins({
      kind: 'zones.hot',
      sentence: { key: 'insights.say.zones.hot', params: { ratio: 54.9, kind: 'explosion', count: 365, expected: 3.7 } },
      place: place(500, 500, 150),
      evidence: { count: 365, expected: 3.7, mapCount: 1100, presence: 3, mapPresence: 1000 },
    });
    curateInsights([z], { mapExtent: 1000, presence: 1000 });
    const p = plainInsight(z, null, false);
    expect(p.what).toMatch(/33% of all .* \(365 of 1,100\) happened in this area about/);
    expect(p.compare).toMatch(/Hardly anyone spends time here \(0\.3% of all time\)/);
    expect(p.why.length).toBeGreaterThan(20);
    expect(p.todo.length).toBeGreaterThan(20);
    expect(p.evidence).toMatch(/Rests on 365 events/);
  });
});

// Patterns found on real recordings, rebuilt here from made-up numbers.
describe('what real data showed', () => {
  it('a busy cell with traffic all round is a hub (a spawn, an airfield), not a choke point', () => {
    // Sectors east, north-east, north ... south-east.
    expect(throughRoute([10, 10, 10, 10, 10, 10, 10, 10], 80)).toBe(false);
    expect(throughRoute([30, 4, 0, 4, 30, 4, 0, 4], 76)).toBe(true);
    expect(throughRoute([0, 0, 0, 0, 0, 0, 0, 0], 0)).toBe(false);
  });

  it('a place one match (or round) makes is that match, not the map', () => {
    expect(spreadFails({ matches: 20, active: 1, holding: 1, topShare: 1 })).toBe('oneMatch');
    expect(spreadFails({ matches: 20, active: 6, holding: 5, topShare: 0.7 })).toBe('oneMatch');
    expect(spreadFails({ matches: 300, active: 40, holding: 6, topShare: 0.1 })).toBe('fewMatches');
    expect(spreadFails({ matches: 300, active: 60, holding: 35, topShare: 0.1 })).toBeNull();
    expect(spreadFails({ matches: 20, active: 10, holding: 3, topShare: 0.45 })).toBe('oneMatch');
    expect(spreadFails({ matches: 2, active: 1, holding: 1, topShare: 1 })).toBeNull();
  });

  it('quiet ground, safe ground and chokes where lives start are the spawn, and kills by place are the power positions', () => {
    const spot = { x: 100, z: 100, radius: 10, starts: 40 };
    const all = [
      ins({ kind: 'zones.cold', place: place(104, 100, 10), subject: { eventKind: 'fire' }, evidence: { count: 0, expected: 99, presence: 30, mapPresence: 1000 } }),
      ins({ kind: 'power.safe', place: place(96, 100, 10), evidence: { deaths: 0, presence: 30, mapDeaths: 500, mapPresence: 1000 } }),
      ins({ kind: 'flow.choke', place: place(100, 110, 10), evidence: { crossings: 120 } }),
      ins({ kind: 'zones.hot', place: place(600, 600, 10), subject: { eventKind: 'kill' }, evidence: { count: 50, expected: 5, presence: 100, mapPresence: 1000 } }),
      ins({ kind: 'zones.hot', place: place(700, 600, 10), subject: { eventKind: 'takeoff' }, evidence: { count: 50, expected: 5, presence: 100, mapPresence: 1000 } }),
    ];
    const { kept, dropped } = curateInsights(all, { mapExtent: 1000, presence: 1000, spawns: [spot], powerRan: true });
    expect(kept).toEqual([]);
    expect(dropped.map((d) => d.reason).sort()).toEqual(['covered', 'spawn', 'spawn', 'spawn', 'trivialKind']);
  });

  it('a hot zone holding most of all its events is the whole fight, not a place in it', () => {
    const spread = { matches: 6, active: 6, holding: 6, topShare: 0.2 };
    const z = ins({ kind: 'zones.hot', spread, place: place(500, 500, 20), subject: { eventKind: 'death' }, evidence: { count: 18, mapCount: 22, expected: 1.1, presence: 210, mapPresence: 1000 } });
    expect(curateInsights([z], { mapExtent: 10000, presence: 1000 }).dropped.map((d) => d.reason)).toEqual(['mostOfIt']);
  });

  it('says a place once, whatever kinds of events stand out there, and a few of each kind at most', () => {
    const spread = { matches: 10, active: 10, holding: 8, topShare: 0.2 };
    const at = (k: string, s: number) => ins({ kind: 'zones.hot', strength: s, spread, place: place(500, 500, 10), subject: { eventKind: k }, evidence: { count: 40, expected: 4, presence: 100, mapPresence: 1000 } });
    const { kept, dropped } = curateInsights([at('fire', 0.9), at('hit', 0.8), at('damage', 0.7)], { mapExtent: 1000, presence: 1000 });
    // In one match, where the shooting was is that match's fight.
    expect(curateInsights([at('fire', 0.9)].map((i) => ({ ...i, spread: undefined })), { mapExtent: 1000, presence: 1000 }).dropped[0].reason).toBe('fewMatches');
    expect(kept.map((k) => k.subject.eventKind)).toEqual(['fire']);
    expect(dropped.filter((d) => d.reason === 'samePlace').length).toBe(2);
    const many = Array.from({ length: 8 }, (_, i) => ins({ kind: 'flow.choke', usefulness: 0.9 - i * 0.01 }));
    const out: { reason: string }[] = [];
    const ranked = rankInsights(many, out as never);
    expect(ranked.length).toBe(4);
    expect(out.length).toBe(4);
    expect(ranked.map((r) => r.usefulness)).toEqual([...ranked.map((r) => r.usefulness)].sort((a, b) => b! - a!));
  });

  it('says nothing as nothing, sizes in the data scale, shares without "0.0%"', () => {
    const z = ins({
      kind: 'zones.cold',
      sentence: { key: 'insights.say.zones.cold', params: { ratio: 34, kind: 'fire', count: 0, expected: 99 } },
      place: place(500, 500, 1140),
      evidence: { count: 0, expected: 99, presence: 35, mapPresence: 1000 },
    });
    // 2,280 inch-like units across at 39.4 units a metre is about 58 m, not 2,300.
    const report = { dataset: { upm: 39.37, sessionUnit: 'round' }, baseline: { presence: 1000 } } as never;
    const p = plainInsight(z, report, false);
    expect(p.what).toMatch(/^No .* at all in this area about 58 m across/);
    expect(pctText(0.0004)).toBe('under 0.1%');
    expect(pctText(0.0035)).toBe('0.35%');
    expect(pctText(0.46)).toBe('46%');
    // Against a baseline near nothing the factor means nothing: never "200000.4×".
    expect(ratioText(200000.4)).toBe('over 20');
    expect(ratioText(7.64)).toBe('7.6');
    // One death is a death, not "1 players".
    const choke = ins({ kind: 'flow.choke', sentence: { key: 'insights.say.flow.choke', params: { ratio: 3, crossings: 121, deaths: 1 } }, place: place(0, 0, 100), evidence: { crossings: 121, deaths: 1 } });
    expect(plainInsight(choke, report, false).what).toMatch(/and 1 player died here/);
    z.spread = { matches: 20, active: 12, holding: 9, topShare: 0.18 };
    expect(plainInsight(z, report, false).evidence).toMatch(/Seen in 9 of 20 rounds; the biggest single round makes 18% of it/);
  });
});
