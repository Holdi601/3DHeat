import { describe, expect, it } from 'vitest';
import { KB_BY_ID, PATTERNS } from '../knowledge';
import { MANEUVER_TAGS } from '../knowledge/maneuver-tags';
import { analyseMatch } from './analyse';
import { ManeuverCollector } from './collect';
import { LINKS } from './kb';
import { shapeOf } from './groups';
import { scenarios } from './synth';
import { nullMatch } from './nulls';
import { maneuverSection, maneuverTable } from './summary';
import { MANEUVER_KINDS, type Maneuver } from './types';

const reported = (l: Maneuver[]) => l.filter((m) => m.level !== 'low');

describe('formation shapes', () => {
  it('reads line, column, wedge and echelon against the heading', () => {
    expect(shapeOf([-60, 0, 60], [0, 0, 0], 0, 1)).toBe('line');
    expect(shapeOf([0, 0, 0], [0, -50, -100], 0, 1)).toBe('column');
    expect(shapeOf([0, -40, 40, -80, 80], [0, -40, -40, -80, -80], 0, 1)).toBe('wedge');
    expect(shapeOf([0, 40, 80, 120], [0, -40, -80, -120], 0, 1)).toBe('echelon');
  });
});

describe('the movement analysis on synthetic matches', () => {
  const all = scenarios().map((s) => ({ s, r: analyseMatch(s.tracks) }));

  it('finds every planted maneuver', () => {
    const missed: string[] = [];
    for (const { s, r } of all) for (const k of s.planted) if (!reported(r?.maneuvers ?? []).some((m) => m.kind === k)) missed.push(`${s.name}: ${k}`);
    expect(missed).toEqual([]);
  });

  it('raises no false alarms on the null matches, and few on the planted ones', () => {
    let found = 0;
    let right = 0;
    const wrong: string[] = [];
    for (const { s, r } of all) {
      for (const m of reported(r?.maneuvers ?? [])) {
        found++;
        if (s.planted.includes(m.kind) || s.allowed.includes(m.kind)) right++;
        else wrong.push(`${s.name}: ${m.kind} ${m.confidence}`);
      }
    }
    const nullsFound = all.filter(({ s }) => s.name.startsWith('null')).flatMap(({ r }) => reported(r?.maneuvers ?? []));
    // The figure docs/maneuver.md quotes.
    console.log(`precision ${right}/${found} = ${(right / Math.max(1, found)).toFixed(3)}; false alarms on ${all.filter(({ s }) => s.name.startsWith('null')).length} null matches: ${nullsFound.length}`, wrong);
    expect(nullsFound.map((m) => m.kind)).toEqual([]);
    expect(right / Math.max(1, found)).toBeGreaterThanOrEqual(0.9);
  });

  it('judges the outcome and links the knowledge base', () => {
    const amb = all.find(({ s }) => s.name === 'ambush')!.r!.maneuvers.find((m) => m.kind === 'ambush')!;
    expect(amb.outcome.paid).toBe(1);
    expect(amb.outcome.kills).toBe(3);
    expect(amb.kb).toContain('concept.ambush');
    const pump = all.find(({ s }) => s.name === 'missile-pump')!.r!.maneuvers.find((m) => m.kind === 'pump')!;
    expect(pump.outcome.paid).toBe(1);
  });
});

describe('null models of the same match', () => {
  it('lose the interaction maneuvers when the sides no longer meet', () => {
    const kinds = ['flank', 'pincer', 'encirclement', 'penetration', 'ambush', 'withdrawal'] as const;
    const left: string[] = [];
    for (const s of scenarios().filter((x) => x.planted.some((k) => (kinds as readonly string[]).includes(k)))) {
      const real = analyseMatch(s.tracks)!;
      const ranges = ['air', 'ground', 'sea', 'infantry'].map((d) => real.range[d as 'air'] ?? 1000);
      // Either side moved in time; turned round the centre too, except where the defender sits at that very
      // centre (a ring round it, a flank on it): turning the attackers round it keeps the maneuver whole.
      const centred = s.name === 'encirclement' || s.name === 'flank';
      const nulls: ['shift' | 'rotate', number][] = [['shift', 0], ['shift', 1], ...(centred ? [] : ([['rotate', 0], ['rotate', 1]] as ['rotate', number][]))];
      for (const [kind, which] of nulls) {
        const r = analyseMatch(nullMatch(s.tracks, kind, 7, ranges, which));
        for (const m of reported(r?.maneuvers ?? [])) if (s.planted.includes(m.kind) && (kinds as readonly string[]).includes(m.kind)) left.push(`${s.name}/${kind}${which}: ${m.kind}`);
      }
    }
    expect(left).toEqual([]);
  });
});

describe('knowledge links', () => {
  it('resolve to entries and patterns', () => {
    const pats = new Set(PATTERNS.map((p) => p.id));
    const bad: string[] = [];
    for (const k of MANEUVER_KINDS) {
      for (const id of LINKS[k].kb) if (!KB_BY_ID.has(id)) bad.push(`${k}: ${id}`);
      for (const p of Object.keys(LINKS[k].patterns)) if (!pats.has(p)) bad.push(`${k}: pattern ${p}`);
    }
    for (const [id, p] of Object.entries(MANEUVER_TAGS)) {
      if (!KB_BY_ID.has(id)) bad.push(`tag on unknown entry ${id}`);
      for (const k of Object.keys(p)) if (!pats.has(k)) bad.push(`${id}: pattern ${k}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('collector and summary', () => {
  it('collects rows in any unit order and summarises per side', () => {
    const s = scenarios().find((x) => x.name === 'ambush')!;
    const c = new ManeuverCollector(1);
    // Units interleaved in reverse order: each unit's own rows stay in time order.
    for (const u of s.tracks.units.slice().reverse()) for (let i = 0; i < u.t.length; i++) c.sample(u.id, -1, u.team, u.cls, u.t[i], u.x[i], u.y[i], u.z[i]);
    for (const e of s.tracks.events) c.event(e.kind, e.unit, -1, e.team, e.t, e.x, e.y, e.z);
    const [m] = c.finish(2);
    const r = analyseMatch(m)!;
    expect(r.maneuvers.some((x) => x.kind === 'ambush')).toBe(true);
    const sec = maneuverSection(r);
    expect(sec.k.some((row) => row[0] === 'ambush' && row[1] === 1)).toBe(true);
    const table = maneuverTable([{ map: 'm', mode: 'x', teams: ['a', 'b'], sec }]);
    expect(table.find((t) => t.kind === 'ambush')?.n).toBe(1);
  });
});
