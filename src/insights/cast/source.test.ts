import { describe, expect, it } from 'vitest';
import type { AttributeColumn, Dataset } from '../../state/types';
import { CANON } from '../../data/canonical';
import { castMatch, castSource, trackAt } from './source';
import { findMoments } from './moments';

/**
 * A synthetic replay shaped as a War Thunder server replay reads: each life a
 * track ("name #id"), the player column joining them, one destruction written
 * as a `dead` row, the `kill` row and a `death` row at the same moment, the
 * wreck's further `dead` rows as it falls, and its position rows going on at
 * alive 0 until it is removed. The names are made up.
 */
interface Row {
  t: number;
  track: string;
  event: string;
  other?: string;
  alive?: number;
  x?: number;
}

const TEAM: Record<string, number> = { Ash: 0, Birch: 0, Cedar: 1, Dune: 1, Elm: 1, Launcher: 1 };

function dataset(rows: Row[]): Dataset {
  rows = [...rows].sort((a, b) => a.t - b.t);
  const n = rows.length;
  const tracks = [...new Set(rows.map((r) => r.track))];
  const players = [...new Set(tracks.map((t) => t.split(' #')[0]))];
  const raw = [...new Set(rows.map((r) => r.event))];
  const canonOf = (e: string) => (e === 'dead' || e === 'death' ? 'death' : e);
  const canon = [...new Set(raw.map(canonOf))];
  const others = ['', ...new Set(rows.map((r) => r.other ?? '').filter(Boolean))];
  const cat = (name: string, cats: string[], f: (r: Row) => string): AttributeColumn => ({
    name,
    kind: 'category',
    data: Uint32Array.from(rows, (r) => cats.indexOf(f(r))),
    min: 0,
    max: cats.length - 1,
    categories: cats,
  });
  const attrs: AttributeColumn[] = [
    cat('event', raw, (r) => r.event),
    cat(CANON.event, canon, (r) => canonOf(r.event)),
    cat('player', players, (r) => r.track.split(' #')[0]),
    cat('other', others, (r) => r.other ?? ''),
    // An AI unit: a part of a player's missile battery, listed apart.
    cat('ai', ['false', 'true'], (r) => (r.track.startsWith('Launcher') ? 'true' : 'false')),
    { name: 'alive', kind: 'number', data: Float32Array.from(rows, (r) => r.alive ?? NaN), min: 0, max: 1 },
  ];
  return {
    id: 'cast-wt',
    name: 'cast-wt',
    count: n,
    px: Float32Array.from(rows, (r) => r.x ?? 0),
    py: new Float32Array(n),
    pz: new Float32Array(n),
    time: Float32Array.from(rows, (r) => r.t),
    personId: Uint32Array.from(rows, (r) => tracks.indexOf(r.track)),
    personLabels: tracks,
    personShared: null,
    sessionId: null,
    sessionLabels: ['match'],
    teamId: Uint32Array.from(rows, (r) => TEAM[r.track.split(' #')[0]]),
    teamLabels: ['1', '2'],
    lifetime: null,
    yaw: null,
    pitch: null,
    timeSorted: true,
    bounds: { minX: -1000, minY: 0, minZ: -1000, maxX: 1000, maxY: 10, maxZ: 1000 },
    timeRange: [rows[0].t, rows[n - 1].t],
    attrs,
  } as unknown as Dataset;
}

/** Position rows of a track from `from` to `to`, alive until `dies` and a wreck after. */
function life(track: string, from: number, to: number, dies = Infinity, x = 0): Row[] {
  const out: Row[] = [];
  for (let t = from; t <= to; t += 1) out.push({ t, track, event: 'position', alive: t < dies ? 1 : 0, x });
  return out;
}

/** One destruction as the replay writes it: `dead` and `death` of the victim, `kill` of the killer, the same instant. */
function destroy(t: number, killer: string, victim: string, wreckRows = 0): Row[] {
  const name = (s: string) => s.split(' #')[0];
  const out: Row[] = [
    { t, track: victim, event: 'dead' },
    { t, track: killer, event: 'kill', other: name(victim) },
    { t, track: victim, event: 'death', other: name(killer) },
  ];
  // The wreck falling: more `dead` rows, the same death.
  for (let i = 1; i <= wreckRows; i++) out.push({ t: t + 1.5 * i, track: victim, event: 'dead' });
  return out;
}

function replay(): Dataset {
  return dataset([
    ...life('Ash #1001', 0, 120),
    ...life('Birch #1002', 0, 120, 30, 100),
    ...life('Cedar #2001', 0, 120, 20, 300),
    ...life('Cedar #2002', 40, 120, 70, 300),
    ...life('Dune #2003', 0, 120, 24, 400),
    ...life('Elm #2004', 0, 120, 90, 500),
    // Ash takes two in four seconds; each wreck writes more `dead` rows as it falls.
    ...destroy(20, 'Ash #1001', 'Cedar #2001', 3),
    ...destroy(24, 'Ash #1001', 'Dune #2003', 2),
    // Elm takes Birch - both of Birch's tracks at once (one player, one kill).
    ...destroy(30, 'Elm #2004', 'Birch #1002', 2),
    ...life('Birch #1003', 0, 120, 30, 110),
    ...destroy(30, 'Elm #2004', 'Birch #1003'),
    // A kill credit with nobody seen dying.
    { t: 26, track: 'Ash #1001', event: 'kill' },
    // Cedar's second life, killed by Ash - the same shot destroys Cedar's launcher, listed as a unit of its own.
    ...life('Launcher #3001', 0, 120, 70, 320),
    ...destroy(70, 'Ash #1001', 'Cedar #2002', 1),
    { t: 70, track: 'Launcher #3001', event: 'dead' },
    { t: 70, track: 'Ash #1001', event: 'kill', other: 'uid 3001' },
    // Elm dies on its own (no killer).
    { t: 90, track: 'Elm #2004', event: 'dead' },
    { t: 90, track: 'Elm #2004', event: 'death' },
  ]);
}

describe('the caster reads War Thunder-shaped kills', () => {
  it('counts one death a destruction, however many rows the wreck writes, and one kill a shot', () => {
    const d = replay();
    const m = castMatch(d, [], -1)!;
    const src = castSource(d, m)!;
    const name = (u: number) => (u >= 0 ? src.players[u].name : '-');
    const kills = src.input.kills.map((k) => [k.time, name(k.killer), name(k.victim)]);
    expect(kills).toEqual([
      [20, 'Ash', 'Cedar'],
      [24, 'Ash', 'Dune'],
      [26, 'Ash', '-'],
      [30, 'Elm', 'Birch'],
      [70, 'Ash', 'Cedar'],
      [90, '-', 'Elm'],
    ]);
    expect(src.input.victimsNamed).toBe(true);
  });

  it('says a multi-kill of the kills seen, not of the kill credit without a victim', () => {
    const d = replay();
    const src = castSource(d, castMatch(d, [], -1)!)!;
    const ms = findMoments(src.input);
    const ash = src.players.findIndex((p) => p.name === 'Ash');
    // Ash's spell: told once (a standout, which tells the multi-kill too), of the two kills seen.
    const spell = ms.filter((m) => m.actor === ash && (m.kind === 'multiKill' || m.kind === 'standout'));
    expect(spell).toHaveLength(1);
    expect(spell[0].beats!.map((b) => [b.time, src.players[b.victim].name])).toEqual([[20, 'Cedar'], [24, 'Dune']]);
    // Ash's run alone (too few players for a standout): a multi-kill of the two kills seen, in four seconds, the credit at 26 not one of them.
    const multi = findMoments({ ...src.input, kills: src.input.kills.filter((k) => k.time <= 26) }).filter((m) => m.kind === 'multiKill');
    expect(multi.map((m) => m.params.n)).toEqual([2]);
    expect(multi[0].params.secs).toBe(4);
    // The lead-in starts four to eight seconds before the first kill.
    expect(spell[0].time - spell[0].from).toBeGreaterThanOrEqual(4);
    expect(spell[0].time - spell[0].from).toBeLessThanOrEqual(8);
    expect(ms.find((m) => m.kind === 'firstBlood')).toMatchObject({ time: 20 });
  });

  it('follows the life a player is in, not the wreck of the one before', () => {
    const d = replay();
    const src = castSource(d, castMatch(d, [], -1)!)!;
    const cedar = src.players.findIndex((p) => p.name === 'Cedar');
    // At 50 the first wreck's rows still run, but Cedar is alive in the second life.
    expect(d.personLabels[trackAt(src, cedar, 50)!.track]).toBe('Cedar #2002');
    // At the first death it is the life that died.
    expect(d.personLabels[trackAt(src, cedar, 20)!.track]).toBe('Cedar #2001');
    // At the second death, the second.
    expect(d.personLabels[trackAt(src, cedar, 70)!.track]).toBe('Cedar #2002');
  });
});
