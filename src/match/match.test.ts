import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from '../state/store';
import type { Dataset } from '../state/types';
import { applyFocus, focusFilters, roundSession } from './focus';
import {
  aggregate,
  halves,
  isDraw,
  isPistol,
  isSuicide,
  parseMatchDoc,
  placeName,
  plantSite,
  plantTime,
  startsHalf,
  type MatchDoc,
  type MatchKill,
  type MatchRound,
} from './matchDoc';

function round(number: number, winnerTeam: string, p: Partial<MatchRound> = {}): MatchRound {
  const winner = p.winner ?? (winnerTeam === 'Alpha' ? (number <= 12 ? 'T' : 'CT') : number <= 12 ? 'CT' : 'T');
  return {
    number,
    start: number * 100,
    end: number * 100 + 60,
    until: number * 100 + 70,
    winner,
    winnerTeam,
    reason: 'elimination',
    score: {},
    sides: number <= 12 ? { Alpha: 'T', Bravo: 'CT' } : { Alpha: 'CT', Bravo: 'T' },
    equipment: { T: 20000, CT: 22000 },
    buy: number === 1 || number === 13 ? { T: 'pistol', CT: 'pistol' } : { T: 'full', CT: 'eco' },
    plant: null,
    survivors: {},
    clutches: [],
    kills: [],
    ...p,
  };
}

function doc(rounds: MatchRound[], match = 'alpha-vs-bravo-m1-mirage'): MatchDoc {
  return {
    format: 'heat3d-cs2-match',
    version: 1,
    match,
    map: 'de_mirage',
    demos: [],
    teams: ['Alpha', 'Bravo'],
    score: { Alpha: 13, Bravo: 2 },
    rounds,
    incomplete: [],
    players: [
      {
        name: 'ace', steamid: '1', team: 'Alpha', kills: 20, deaths: 10, assists: 3, flashAssists: 1, diff: 10, adr: 90,
        kast: 80, headshotPct: 50, openingKills: 4, openingDeaths: 1, tradeKills: 2, tradedDeaths: 1, multiKills: {},
        clutches: 1, clutchesWon: 1, utilityDamage: 20, enemiesFlashed: 3, plants: 1, defuses: 0, teamkills: 0, roundsPlayed: 15,
      },
    ],
  };
}

describe('match documents', () => {
  it('reads a summary and refuses anything else', () => {
    const d = doc([round(1, 'Alpha')]);
    expect(parseMatchDoc(JSON.stringify(d)).match).toBe(d.match);
    expect(() => parseMatchDoc('{"format":"heat3d-lap"}', 'lap.json')).toThrow(/not a CS2 match summary/);
    expect(() => parseMatchDoc('nope', 'x.json')).toThrow(/not JSON/);
  });

  it('splits the score into halves', () => {
    const rounds = [...Array.from({ length: 12 }, (_, i) => round(i + 1, i < 9 ? 'Alpha' : 'Bravo')), round(13, 'Alpha')];
    const h = halves(doc(rounds));
    expect(h.first).toEqual({ Alpha: 9, Bravo: 3 });
    expect(h.second).toEqual({ Alpha: 1, Bravo: 0 });
    expect(h.overtimeRounds).toBe(0);
    // Overtime is no half's: 12-12 after 24 rounds, then 4-2 in overtime.
    const long = [
      ...Array.from({ length: 24 }, (_, i) => round(i + 1, i % 2 ? 'Alpha' : 'Bravo')),
      ...['Alpha', 'Alpha', 'Bravo', 'Alpha', 'Bravo', 'Alpha'].map((w, i) => round(25 + i, w)),
    ];
    const o = halves(doc(long));
    expect(o.first).toEqual({ Alpha: 6, Bravo: 6 });
    expect(o.second).toEqual({ Alpha: 6, Bravo: 6 });
    expect(o.overtime).toEqual({ Alpha: 4, Bravo: 2 });
    expect(o.overtimeRounds).toBe(6);
  });

  it('adds matches up: sides, pistols, buys, sites, openings, players', () => {
    const kill = (attackerSide: 'T' | 'CT', place: string) => ({
      time: 10, attacker: 'a', attackerSide, victim: 'v', victimSide: attackerSide === 'T' ? 'CT' : 'T', assister: null,
      flashAssist: false, weapon: 'AK-47', headshot: false, wallbang: false, throughSmoke: false, opening: true, traded: false,
      trade: false, teamkill: false, after: false, place,
    }) as MatchRound['kills'][number];
    const a = doc([
      round(1, 'Alpha', { kills: [kill('T', 'BombsiteA')], plant: { site: 'A', time: 0, player: 'ace', x: 0, y: 0, z: 0 } }),
      round(2, 'Bravo', { kills: [kill('T', 'BombsiteA')] }),
    ]);
    const b = doc([round(13, 'Alpha', { kills: [kill('CT', 'Middle')] })], 'other');
    const agg = aggregate([a, b]);
    expect(agg.rounds).toBe(3);
    // Round 1 T won, round 2 CT won, round 13 Alpha as CT won.
    expect(agg.sides.T).toEqual({ played: 3, won: 1 });
    expect(agg.sides.CT).toEqual({ played: 3, won: 2 });
    expect(agg.pistol.T).toEqual({ played: 2, won: 1 });
    expect(agg.buys.T.full).toEqual({ played: 1, won: 0 });
    expect(agg.buys.CT.eco).toEqual({ played: 1, won: 1 });
    expect(agg.sites.A).toEqual({ played: 1, won: 1 });
    expect(agg.openings[0]).toEqual({ place: 'BombsiteA', duels: 2, tWon: 2 });
    // The opening side won rounds 1 (T) and 13 (CT), not round 2.
    expect(agg.openingConverted).toEqual({ played: 3, won: 2 });
    expect(agg.players[0]).toMatchObject({ name: 'ace', matches: 2, kills: 40, rounds: 30, adr: 90, kast: 80 });
  });

  it('reads a version 1 and a version 2 document alike', () => {
    // The same plant, 25 s into round 3 (freeze over at match second 300): v1 in match seconds, v2 into the round.
    const plant = (time: number, site: string | number) => ({ site, time, player: 'ace', x: 0, y: 0, z: 0 });
    const v1 = doc([round(3, 'Alpha', { plant: plant(325, 'A') })]);
    const v2 = { ...doc([round(3, 'Alpha', { plant: plant(25, 'A') })]), version: 2 };
    expect(plantTime(v1, v1.rounds[0])).toBe(25);
    expect(plantTime(v2, v2.rounds[0])).toBe(25);
    expect(plantTime(v2, round(4, 'Alpha'))).toBeNaN();
    // A site the demo did not say: empty in v2, an entity number in v1.
    expect(plantSite(v2.rounds[0])).toBe('A');
    expect(plantSite(round(5, 'Alpha', { plant: plant(20, '') }))).toBe('');
    expect(plantSite(round(5, 'Alpha', { plant: plant(20, 417) }))).toBe('');
    expect(plantSite(round(5, 'Alpha', { plant: plant(20, '417') }))).toBe('');
    // Half length and pistol rounds: the document's own in v2, MR12 and the buy in v1.
    expect([12, 13, 24, 25, 28].map((n) => startsHalf(v1, n))).toEqual([false, true, false, true, true]);
    const mr15 = { ...v2, halfLength: 15, pistolRounds: [1, 16] };
    expect([13, 16, 30, 31, 34].map((n) => startsHalf(mr15, n))).toEqual([false, true, false, true, true]);
    expect(halves({ ...mr15, rounds: [round(14, 'Alpha'), round(16, 'Bravo'), round(31, 'Alpha')] })).toMatchObject({
      first: { Alpha: 1, Bravo: 0 },
      second: { Alpha: 0, Bravo: 1 },
      overtime: { Alpha: 1, Bravo: 0 },
      overtimeRounds: 1,
    });
    expect(startsHalf({ ...v2, halfLength: null }, 13)).toBe(true);
    expect(isPistol(mr15, round(16, 'Alpha', { buy: { T: 'eco', CT: 'eco' } }), 'T')).toBe(true);
    expect(isPistol(mr15, round(13, 'Alpha'), 'T')).toBe(false);
    expect(isPistol(v1, round(13, 'Alpha'), 'T')).toBe(true);
  });

  it('counts plants on an unknown site apart, under no site name', () => {
    const plant = (site: string | number) => ({ site, time: 20, player: 'ace', x: 0, y: 0, z: 0 });
    const v2 = { ...doc([round(2, 'Alpha', { plant: plant('') }), round(3, 'Bravo', { plant: plant('B') })]), version: 2 };
    const v1 = doc([round(2, 'Alpha', { plant: plant(417) })], 'older');
    const agg = aggregate([v2, v1]);
    expect(agg.sites).toEqual({ B: { played: 1, won: 0 } });
    expect(agg.unknownSite).toEqual({ played: 2, won: 2 });
  });

  it('keeps a draw a draw: no side, no team, no converted opening', () => {
    const kill = (attackerSide: 'T' | 'CT', p: Partial<MatchKill> = {}): MatchKill => ({
      time: 10, attacker: 'a', attackerSide, victim: 'v', victimSide: attackerSide === 'T' ? 'CT' : 'T', assister: null,
      flashAssist: false, weapon: 'AK-47', headshot: false, wallbang: false, throughSmoke: false, opening: true, traded: false,
      trade: false, teamkill: false, after: false, place: 'Middle', ...p,
    });
    const draw = round(1, '', {
      winner: '', reason: 'draw', kills: [kill('T')],
      plant: { site: 'A', time: 30, player: 'ace', x: 0, y: 0, z: 0 },
    });
    expect(isDraw(draw)).toBe(true);
    expect(isDraw(round(2, 'Alpha'))).toBe(false);
    const d = { ...doc([draw, round(2, 'Alpha')]), version: 2, pistolRounds: [1] };
    expect(halves(d).first).toEqual({ Alpha: 1, Bravo: 0 });
    const agg = aggregate([d]);
    expect(agg.draws).toBe(1);
    expect(agg.sides.T).toEqual({ played: 2, won: 1 });
    expect(agg.sides.CT).toEqual({ played: 2, won: 0 });
    expect(agg.pistol).toEqual({ T: { played: 1, won: 0 }, CT: { played: 1, won: 0 } });
    expect(agg.sites.A).toEqual({ played: 1, won: 0 });
    expect(agg.openingConverted).toEqual({ played: 1, won: 0 });
    expect(agg.reasons).toEqual({ draw: 1, elimination: 1 });
    expect(Object.keys(agg.sides)).toEqual(['T', 'CT']);
    // A suicide is no opening duel; version 1 has no flag and is told by the names.
    const own = kill('T', { attacker: 'ace', victim: 'ace', victimSide: 'T', teamkill: true });
    expect(isSuicide(own)).toBe(true);
    expect(isSuicide({ ...own, suicide: false, victim: 'bob' })).toBe(false);
    expect(isSuicide(kill('T', { suicide: true }))).toBe(true);
    const opened = aggregate([doc([round(2, 'Alpha', { kills: [{ ...own, suicide: true }, kill('CT', { place: 'BombsiteB' })] })])]);
    expect(opened.openings).toEqual([{ place: 'BombsiteB', duels: 1, tWon: 0 }]);
  });

  it('writes place names as words', () => {
    expect(placeName('TopofMid')).toBe('Top of Mid');
    expect(placeName('BombsiteA')).toBe('Bombsite A');
    expect(placeName('CTSpawn')).toBe('CTSpawn');
    expect(placeName('')).toBe('—');
  });
});

function dataset(): Dataset {
  return {
    id: 'd', name: 'd', count: 4,
    px: new Float32Array(4), py: new Float32Array(4), pz: new Float32Array(4),
    time: new Float32Array([0, 1, 2, 3]), epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null,
    yaw: null, pitch: null, personId: new Uint32Array(4), teamId: new Uint16Array(4),
    personLabels: ['ace', 'bob'], teamLabels: ['T', 'CT'],
    sessionId: new Uint32Array([0, 0, 1, 1]),
    sessionLabels: [roundSession('m1', 1), roundSession('m1', 2)],
    sessionRows: new Uint32Array([2, 2]), sessionStart: new Float32Array([0, 2]), sessionEnd: new Float32Array([1, 3]),
    personTeam: null, personSlot: null, teamSizes: null,
    attrs: [
      { name: 'match', kind: 'category', data: new Uint32Array(4), min: 0, max: 1, categories: ['m0', 'm1'] },
      { name: 'event', kind: 'category', data: new Uint32Array(4), min: 0, max: 2, categories: ['position', 'kill', 'death'] },
      { name: 'round', kind: 'number', data: new Float32Array([1, 1, 2, 2]), min: 1, max: 2 },
    ],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 0, maxY: 0, maxZ: 0 },
    timeRange: [0, 3],
    timeSorted: true,
  } as Dataset;
}

describe('showing a match in the heatmap', () => {
  beforeEach(() => {
    useStore.getState().setDataset(dataset());
    useStore.getState().setFilters([]);
  });

  it('turns a round, a player and events into the heatmap filters', () => {
    const { filters, missing, session } = focusFilters(dataset(), {
      match: 'm1',
      round: 2,
      player: 'bob',
      side: 'CT',
      events: ['kill', 'death'],
    });
    expect(missing).toEqual([]);
    expect(filters).toEqual([
      { kind: 'categories', column: 'match', allowed: [1] },
      { kind: 'range', column: 'round', min: 2, max: 2 },
      { kind: 'categories', column: 'event', allowed: [1, 2] },
      { kind: 'persons', allowed: [1] },
      { kind: 'teams', allowed: [1] },
    ]);
    expect(session).toBe(1);
  });

  it('says what it could not show rather than showing nothing', () => {
    const { missing } = focusFilters(dataset(), { match: 'nope', player: 'zed' });
    expect(missing).toEqual(['match: nope not in the loaded data', 'player zed not in the loaded data']);
  });

  it('replays a round as boxes from its start', () => {
    expect(applyFocus({ match: 'm1', round: 2 }, true)).toEqual([]);
    const s = useStore.getState();
    expect(s.mode).toBe('team');
    expect(s.team.session).toBe(1);
    expect(s.timeline.mode).toBe('play');
    expect(s.timeline.playhead).toBe(2);
    expect(s.filters).toHaveLength(2);
  });
});
