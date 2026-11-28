/**
 * The numbers the Maneuvers tab claims, on synthetic data shaped like the
 * real thing: a War Thunder destruction (one `death` row, `dead` rows for the
 * falling wreck, the wreck's position rows until it is removed) is one loss
 * and its wreck does not move; a respawn is a second death; a missile
 * defence is shown to be meant only while a missile is seen flying at the
 * aircraft; the kills and losses are those in the time the result names; the
 * camera is fitted to the maneuver, not to the map.
 */

import { describe, expect, it } from 'vitest';
import { setLanguage } from '../../i18n';
import { resultOf, tagOf, titleOf } from '../../ui/insights/maneuverText';
import { threatsOf } from './air';
import { analyseMatch } from './analyse';
import { oneDeathALife } from './collect';
import { buildCtx, workedOf } from './context';
import { maneuverLines, maneuverTags, type Paint } from './lines';
import { createManeuverJob, stepManeuver } from './pass';
import { scenarios } from './synth';
import type { Maneuver, MatchTracks, MEvent, UnitTrack } from './types';
import { viewOf } from './view';

// The taxonomy indices the pass is told (as `run.ts` reads them off `data/canonical.ts`).
const POS = 0;
const LAUNCH = 2;
const KILL = 7;
const DEATH = 8;
const TANK = 5;

/** Rows as the converter writes them: [time, person, team, event, x, y, z]. */
type Row = [number, number, number, number, number, number, number];

/** The movement pass over rows, the dead spans given as `data/deaths.ts` works them out. */
function passOver(rows: Row[], persons: number, dead?: { start: number[]; from: number[]; to: number[] }) {
  const meta = {
    persons,
    teams: 2,
    sessions: 0,
    sessionStart: null,
    personShared: null,
    position: POS,
    eventMap: Int8Array.from({ length: 23 }, (_, i) => i),
    classMap: Int8Array.from({ length: 17 }, (_, i) => i),
  };
  const scope = { lifetimeNow: null, timeLo: -Infinity, timeHi: Infinity, session: -1, groupShown: null, filters: [] };
  const job = createManeuverJob(meta as never, scope as never, {
    upm: 1,
    events: { kill: KILL, death: DEATH, destroyed: 9, crash: 10, fire: 1, launch: LAUNCH, hit: 3, capture: 19 },
    ...(dead ? { dead: { start: Int32Array.from(dead.start), from: Float64Array.from(dead.from), to: Float64Array.from(dead.to) } } : {}),
  });
  const col = (k: number) => rows.map((r) => r[k]);
  const chunk = {
    n: rows.length,
    time: Float32Array.from(col(0)),
    person: Uint32Array.from(col(1)),
    team: Uint16Array.from(col(2)),
    event: Uint32Array.from(col(3)),
    px: Float32Array.from(col(4)),
    py: Float32Array.from(col(5)),
    pz: Float32Array.from(col(6)),
    cls: Uint32Array.from(rows.map(() => TANK)),
    session: null,
    filt: [],
  };
  stepManeuver(job, chunk as never);
  return job;
}

/** A tank of team `team` driving east from x0 at 5 m/s, a row a second over [t0, t1]. */
function drive(p: number, team: number, x0: number, t0: number, t1: number): Row[] {
  const out: Row[] = [];
  for (let t = t0; t <= t1; t++) out.push([t, p, team, POS, x0 + 5 * (t - t0), 0, 0]);
  return out;
}

describe('deaths as the data writes them', () => {
  it('counts a destruction once and keeps the wreck still, as the dead spans say', () => {
    // Tank 0 is destroyed at 10 s: one death row, three dead rows as the wreck burns, the wreck's rows until 30 s.
    const rows: Row[] = [...drive(0, 0, 0, 0, 30), [10, 0, 0, DEATH, 50, 0, 0], [10, 0, 0, DEATH, 50, 0, 0], [10.4, 0, 0, DEATH, 50, 0, 0], [12, 0, 0, DEATH, 50, 0, 0], [10, 1, 1, KILL, 400, 0, 0], ...drive(1, 1, 400, 0, 30)];
    const job = passOver(rows, 2, { start: [0, 1, 1], from: [10], to: [Infinity] });
    const [m] = job.c.finish(2);
    const deaths = m.events.filter((e) => e.kind === 'death');
    expect(deaths.map((e) => [e.unit, e.t])).toEqual([[0, 10]]);
    const tank = m.units.find((u) => u.id === 0)!;
    // The wreck's rows after the death are not the tank moving.
    expect(Math.max(...tank.t)).toBeLessThan(10);
    expect(m.events.filter((e) => e.kind === 'kill')).toHaveLength(1);
  });

  it('counts a respawn as a second death', () => {
    // Dead from 10 to 15 s, alive again, dead for good at 25 s.
    const rows: Row[] = [...drive(0, 0, 0, 0, 30), [10, 0, 0, DEATH, 50, 0, 0], [10.2, 0, 0, DEATH, 50, 0, 0], [25, 0, 0, DEATH, 125, 0, 0], [25.5, 0, 0, DEATH, 125, 0, 0]];
    const job = passOver(rows, 1, { start: [0, 2], from: [10, 25], to: [15, Infinity] });
    const [m] = job.c.finish(2);
    expect(m.events.filter((e) => e.kind === 'death').map((e) => e.t)).toEqual([10, 25]);
    const tank = m.units[0];
    expect([...tank.t].filter((t) => t >= 10 && t < 15)).toEqual([]);
    expect([...tank.t].some((t) => t >= 15 && t < 25)).toBe(true);
  });

  it('counts a destruction once without dead spans too: no death again before the unit lived again', () => {
    const track: UnitTrack = { id: 3, team: 0, dom: 1, cls: TANK, t: Float64Array.from([0, 5, 9, 20, 22]), x: new Float32Array(5), y: new Float32Array(5), z: new Float32Array(5) };
    const ev = (t: number): MEvent => ({ t, kind: 'death', unit: 3, team: 0, x: 0, y: 0, z: 0, tcls: -1 });
    // Three death rows of one destruction at 9.5-12 s; alive again at 20 s, dead again at 23 s.
    const kept = oneDeathALife([ev(9.5), ev(9.5), ev(12), ev(23)], () => track);
    expect(kept.map((e) => e.t)).toEqual([9.5, 23]);
  });
});

describe('whether it worked', () => {
  it('is more taken out than lost, said in plain words', () => {
    expect(workedOf(5, 3, 0)).toBe(1);
    expect(workedOf(2, 3, 0)).toBe(0);
    expect(workedOf(2, 2, 0)).toBe(null);
    expect(workedOf(0, 0, 0)).toBe(null);
    expect(workedOf(0, 0, 1)).toBe(1);
  });

  it('counts the kills and losses of its units over the time it names', () => {
    const s = scenarios().find((x) => x.name === 'ambush')!;
    const r = analyseMatch(s.tracks)!;
    const m = r.maneuvers.find((x) => x.kind === 'ambush')!;
    const o = m.outcome;
    expect(o.from).toBeDefined();
    expect(o.until).toBeGreaterThanOrEqual(m.t1);
    const mine = new Set(m.units);
    const inside = (e: MEvent) => mine.has(e.unit) && e.t - r.start >= o.from! && e.t - r.start <= o.until!;
    expect(o.kills).toBe(s.tracks.events.filter((e) => e.kind === 'kill' && inside(e)).length);
    expect(o.losses).toBe(s.tracks.events.filter((e) => e.kind === 'death' && inside(e)).length);
    setLanguage('en');
    expect(resultOf(m)).toContain(`took out ${o.kills}`);
  });
});

/** The missile-defence scenario of `kind`, with a missile the data follows from the shooter at `t0`: `at` the target, or at the ground ahead. */
function withMissile(kind: 'crank' | 'drag', at: 'target' | 'ground', t0 = 60, flight = 30): MatchTracks {
  const s = scenarios().find((x) => x.name === `missile-${kind}`)!.tracks;
  const [shooter, target] = s.units;
  const posOf = (u: UnitTrack, t: number): [number, number, number] => {
    let i = 0;
    while (i + 1 < u.t.length && u.t[i + 1] <= t) i++;
    const j = Math.min(u.t.length - 1, i + 1);
    const f = u.t[j] > u.t[i] ? Math.max(0, Math.min(1, (t - u.t[i]) / (u.t[j] - u.t[i]))) : 0;
    return [u.x[i] + (u.x[j] - u.x[i]) * f, u.y[i] + (u.y[j] - u.y[i]) * f, u.z[i] + (u.z[j] - u.z[i]) * f];
  };
  // Pure pursuit at 1,100 m/s, a sample every quarter second.
  const T: number[] = [];
  const X: number[] = [];
  const Y: number[] = [];
  const Z: number[] = [];
  let p = posOf(shooter, t0);
  const ground: [number, number, number] = [p[0] + 5000, 0, p[2] - 20000];
  for (let t = t0; t <= t0 + flight; t += 0.25) {
    T.push(t);
    X.push(p[0]);
    Y.push(p[1]);
    Z.push(p[2]);
    const q = at === 'target' ? posOf(target, t) : ground;
    const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
    if (d < 300) break;
    const k = Math.min(1, (1100 * 0.25) / d);
    p = [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
  }
  const w: UnitTrack = { id: 999, team: shooter.team, dom: -1, cls: 13, t: Float64Array.from(T), x: Float32Array.from(X), y: Float32Array.from(Y), z: Float32Array.from(Z) };
  return { ...s, weapons: [w] };
}

const air = (m: MatchTracks) => (analyseMatch(m)?.maneuvers ?? []).filter((x) => ['crank', 'notch', 'drag', 'pump'].includes(x.kind));

describe('missile defence: on purpose only when the data shows it', () => {
  it('is shown when the angle was held while a missile flew at the aircraft', () => {
    const [m] = air(withMissile('crank', 'target'));
    expect(m?.kind).toBe('crank');
    expect(m.intent).toBe('shown');
    expect(m.foes).toHaveLength(1);
    // The missile is drawn and named, beside the aircraft and the shooter.
    expect(m.owners?.some((o) => o.weapon)).toBe(true);
    setLanguage('en');
    expect(titleOf(m)).toBe('Crank');
    expect(tagOf(m)).toBe(m.outcome.losses ? 'failed' : 'worked');
  });

  it('is no missile defence at all when the only missile flew at the ground', () => {
    expect(air(withMissile('crank', 'ground'))).toEqual([]);
  });

  it('is not shown when the missile was gone before the turn', () => {
    // A two-second flight that ends before the target turns (3 s after the shot).
    const [m] = air(withMissile('drag', 'target', 60, 2));
    expect(m?.intent).toBe('unproven');
    expect(m.level).not.toBe('high');
    setLanguage('en');
    expect(titleOf(m)).toBe('Flew away from the shooter');
    expect(['escaped', 'shotDown']).toContain(tagOf(m));
  });

  it('takes no aircraft for the target of a missile that flies on to a tank below it', () => {
    const track = (id: number, team: number, cls: number, f: (t: number) => [number, number, number]): UnitTrack => {
      const T = Array.from({ length: 121 }, (_, i) => i);
      const P = T.map(f);
      return { id, team, dom: cls === 4 ? 0 : 1, cls, t: Float64Array.from(T), x: Float32Array.from(P.map((p) => p[0])), y: Float32Array.from(P.map((p) => p[1])), z: Float32Array.from(P.map((p) => p[2])) };
    };
    // A helicopter creeping 150 m over a tank 10 km from an anti-tank launcher; the missile flies at the tank.
    const heli = track(1, 0, 4, (t) => [10000, 150, 40 + t * 2]);
    const tank = track(2, 0, 5, () => [10000, 0, 0]);
    const launcher = track(3, 1, 6, () => [0, 0, 0]);
    const T: number[] = [];
    for (let t = 50; t <= 60; t += 0.25) T.push(t);
    const missile: UnitTrack = { id: 9, team: 1, dom: -1, cls: 13, t: Float64Array.from(T), x: Float32Array.from(T.map((t) => (t - 50) * 1000)), y: new Float32Array(T.length), z: new Float32Array(T.length) };
    const m: MatchTracks = { session: -1, t0: 0, upm: 1, teams: 2, units: [heli, tank, launcher], events: [], weapons: [missile] };
    expect(threatsOf(buildCtx(m)!)).toEqual([]);
    // Without the tank there, the same missile is flying at the helicopter.
    expect(threatsOf(buildCtx({ ...m, units: [heli, launcher] })!)!.map((x) => x.tgt)).toEqual([0]);
  });

  it('is never claimed from a launch alone', () => {
    const s = scenarios().find((x) => x.name === 'missile-crank')!.tracks;
    const [m] = air(s);
    expect(m?.kind).toBe('crank');
    expect(m.intent).toBe('unproven');
    expect(m.confidence).toBeLessThan(0.75);
    setLanguage('en');
    expect(titleOf(m)).toBe('Flew at an angle to the shooter');
    expect(resultOf(m)).not.toMatch(/Worked|missile missed/);
  });
});

describe('the camera on a picked maneuver', () => {
  const base: Maneuver = {
    id: 'x',
    kind: 'crank',
    domain: 'air',
    team: 0,
    against: 1,
    t0: 0,
    t1: 30,
    confidence: 0.8,
    level: 'high',
    units: [7],
    place: { x: 0, y: 0, z: 0, radius: 20000 },
    paths: [],
    outlines: [],
    evidence: {},
    outcome: { kills: 0, losses: 0, captures: 0, exchange: 1, baseline: 1, secs: 30, paid: 1 },
    patterns: {},
    kb: [],
  };

  it('fits the maneuver and whoever comes near it, not a shooter far off', () => {
    const own: [number, number, number][] = [
      [0, 3000, 0],
      [2000, 3000, 0],
    ];
    const near: [number, number, number][] = [
      [3000, 3000, 500],
      [2500, 3000, 200],
    ];
    const far: [number, number, number][] = [
      [40000, 6000, 0],
      [38000, 6000, 0],
    ];
    const m: Maneuver = {
      ...base,
      paths: [own, near, far],
      owners: [
        { unit: 7, team: 0, n: 1 },
        { unit: 9, team: 1, n: 1, weapon: true },
        { unit: 8, team: 1, n: 1 },
      ],
    };
    const v = viewOf(m, 1);
    expect(v.r).toBeGreaterThanOrEqual(1500);
    expect(v.r).toBeLessThan(5000);
    expect(Math.hypot(v.x - 1500, v.z - 250)).toBeLessThan(1000);
    // Never closer than an aircraft's turn.
    expect(viewOf({ ...m, paths: [own.map(([x, y, z]) => [x / 100, y, z] as [number, number, number])], owners: [{ unit: 7, team: 0, n: 1 }] }, 1).r).toBe(600);
  });
});

describe('the 3D ways of a picked maneuver', () => {
  it('draws each way in its owner colour, the enemy outline in the enemy colour, and labels whose each way is', () => {
    const RED: [number, number, number] = [1, 0, 0];
    const BLUE: [number, number, number] = [0, 0, 1];
    const MISSILE: [number, number, number] = [1, 1, 0];
    const paint: Paint = {
      owner: (o) => (o.weapon ? MISSILE : o.team === 0 ? BLUE : RED),
      team: (t) => (t === 0 ? BLUE : RED),
      name: (o) => (o.weapon ? 'missile' : o.unit >= 0 ? `unit ${o.unit}` : `team ${o.team}`),
    };
    const m: Maneuver = {
      id: 'f',
      kind: 'flank',
      domain: 'ground',
      team: 0,
      against: 1,
      t0: 0,
      t1: 10,
      confidence: 0.9,
      level: 'high',
      units: [4, 5],
      place: { x: 0, y: 0, z: 0, radius: 100 },
      paths: [
        [
          [0, 0, 0],
          [50, 0, 0],
        ],
        [
          [0, 0, 50],
          [50, 0, 80],
        ],
      ],
      owners: [
        { unit: -1, team: 0, n: 2 },
        { unit: 7, team: 1, n: 1, weapon: true },
      ],
      outlines: [
        [
          [100, 0],
          [110, 0],
          [110, 10],
        ],
      ],
      evidence: {},
      outcome: { kills: 0, losses: 0, captures: 0, exchange: 1, baseline: 1, secs: 10, paid: null },
      patterns: {},
      kb: [],
    };
    const l = maneuverLines([m], 'f', paint)!;
    const colourOf = (v: number) => [l.data[v * 7 + 3], l.data[v * 7 + 4], l.data[v * 7 + 5]];
    // The first segment is the group's way (its team's colour); the enemy's outline comes last.
    expect(colourOf(0)).toEqual(BLUE);
    expect(colourOf(l.count - 1)).toEqual(RED);
    expect([...Array(l.count).keys()].some((v) => colourOf(v).join() === MISSILE.join())).toBe(true);
    expect(maneuverTags(m, paint).map((x) => [x.text, x.rgb])).toEqual([
      ['team 0', BLUE],
      ['missile', MISSILE],
    ]);
  });
});
