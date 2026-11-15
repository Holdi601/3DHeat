/**
 * Synthetic matches with planted maneuvers, and null matches with none, for
 * the detectors' tests (`maneuver.test.ts`) and the precision figures in
 * docs/maneuver.md. Metres, one unit a metre, a sample a second. Each
 * scenario names the kinds planted (they must be found) and the kinds that
 * are also really there as a by-product (a flank's fixing force is also a
 * frontal approach); anything else found counts against precision.
 */

import type { EvKind, ManeuverKind, MatchTracks, MEvent, UnitTrack } from './types';

type Pos = [number, number, number];
type Path = (t: number) => Pos | null;

interface SUnit {
  id: number;
  team: number;
  cls: number;
  at: Path;
  /** Dies at this time (a death event, the track ends). */
  dies?: number;
}

export interface Scenario {
  name: string;
  tracks: MatchTracks;
  planted: ManeuverKind[];
  allowed: ManeuverKind[];
}

const TANK = 5;
const INF = 12;
const FIGHTER = 0;
const ATTACK = 1;
const SPAA = 7;
const SHIP = 10;

/** Piecewise-linear through `[t, x, z]` (y fixed or per point), held before the first and after the last. */
export function way(pts: ([number, number, number] | [number, number, number, number])[], y = 0): Path {
  return (t) => {
    if (t <= pts[0][0]) return [pts[0][1], pts[0][3] ?? y, pts[0][2]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      if (t <= b[0]) {
        const f = (t - a[0]) / (b[0] - a[0] || 1);
        return [a[1] + (b[1] - a[1]) * f, (a[3] ?? y) + ((b[3] ?? y) - (a[3] ?? y)) * f, a[2] + (b[2] - a[2]) * f];
      }
    }
    const l = pts[pts.length - 1];
    return [l[1], l[3] ?? y, l[2]];
  };
}

const still = (x: number, z: number, y = 0): Path => () => [x, y, z];
const offset = (p: Path, dx: number, dz: number): Path => (t) => {
  const q = p(t);
  return q ? [q[0] + dx, q[1], q[2] + dz] : null;
};

/** Deterministic random numbers. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(units: SUnit[], evs: { t: number; kind: EvKind; unit: number; tcls?: number }[], dur: number, step = 1): MatchTracks {
  const tracks: UnitTrack[] = [];
  const events: MEvent[] = [];
  const byId = new Map(units.map((u) => [u.id, u]));
  for (const u of units) {
    const t: number[] = [];
    const x: number[] = [];
    const y: number[] = [];
    const z: number[] = [];
    for (let s = 0; s <= dur; s += step) {
      if (u.dies !== undefined && s > u.dies) break;
      const p = u.at(s);
      if (!p) continue;
      t.push(s);
      x.push(p[0]);
      y.push(p[1]);
      z.push(p[2]);
    }
    tracks.push({ id: u.id, team: u.team, dom: 0, cls: u.cls, t: Float64Array.from(t), x: Float32Array.from(x), y: Float32Array.from(y), z: Float32Array.from(z) });
    if (u.dies !== undefined) {
      const p = u.at(u.dies) ?? [0, 0, 0];
      events.push({ t: u.dies, kind: 'death', unit: u.id, team: u.team, x: p[0], y: p[1], z: p[2], tcls: -1 });
    }
  }
  for (const e of evs) {
    const u = byId.get(e.unit)!;
    const p = u.at(e.t) ?? [0, 0, 0];
    events.push({ t: e.t, kind: e.kind, unit: e.unit, team: u.team, x: p[0], y: p[1], z: p[2], tcls: e.tcls ?? -1 });
  }
  events.sort((a, b) => a.t - b.t);
  // Domains as the collector sets them.
  const DOM = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 3];
  for (const tr of tracks) tr.dom = DOM[tr.cls] ?? 1;
  return { session: -1, t0: 0, upm: 1, teams: 2, units: tracks, events };
}

let nextId = 0;
const id = () => nextId++;

/** A line of standing units across x at depth z. */
function line(team: number, cls: number, z: number, xs: number[]): SUnit[] {
  return xs.map((x) => ({ id: id(), team, cls, at: still(x, z) }));
}

/** A group following `p` in a formation given by offsets. */
function group(team: number, cls: number, p: Path, offs: [number, number][], dies: (number | undefined)[] = []): SUnit[] {
  return offs.map(([dx, dz], i) => ({ id: id(), team, cls, at: offset(p, dx, dz), dies: dies[i] }));
}

const LINE4: [number, number][] = [
  [-90, 0],
  [-30, 0],
  [30, 0],
  [90, 0],
];
const LINE3: [number, number][] = [
  [-60, 0],
  [0, 0],
  [60, 0],
];
const COL3: [number, number][] = [
  [0, 0],
  [0, -50],
  [0, -100],
];

/** A kill by `killer` and the death of `victim` at once (the victim must die then). */
function kill(t: number, killer: SUnit): { t: number; kind: EvKind; unit: number } {
  return { t, kind: 'kill', unit: killer.id };
}

export function scenarios(): Scenario[] {
  nextId = 0;
  const out: Scenario[] = [];

  // Frontal assault: a line of four drives straight at a standing line.
  {
    const b = line(1, TANK, 0, [-200, -100, 0, 100, 200]);
    const a = group(0, TANK, way([[0, 0, -2600], [300, 0, -300], [600, 0, -300]]), LINE4, [undefined, 330]);
    out.push({ name: 'frontal', tracks: build([...a, ...b], [kill(330, b[2])], 600), planted: ['frontalAssault'], allowed: ['formation'] });
  }
  // Flank: a fixing force stands in front, a group comes round the west end.
  {
    const b = line(1, TANK, 0, [-200, -100, 0, 100, 200]);
    const fix = line(0, TANK, -650, [-150, 0, 150]);
    const fl = group(0, TANK, way([[0, -3200, -1600], [150, -3200, 0], [330, -500, 0], [600, -500, 0]]), COL3.map(([x, z]) => [z, x] as [number, number]), []);
    out.push({ name: 'flank', tracks: withDeaths(build([...b, ...fix, ...fl], [kill(340, fl[0]), kill(345, fl[1])], 600), [b[0], b[1]], [340, 345]), planted: ['flank'], allowed: ['formation'] });
  }
  // Pincer: the same with a second group round the east end at the same time.
  {
    const b = line(1, TANK, 0, [-200, -100, 0, 100, 200]);
    const fix = line(0, TANK, -650, [-150, 0, 150]);
    const w = group(0, TANK, way([[0, -3200, -1600], [150, -3200, 0], [330, -500, 0], [600, -500, 0]]), [[0, 0], [-50, 0], [-100, 0]]);
    const e = group(0, TANK, way([[0, 3200, -1600], [150, 3200, 0], [330, 500, 0], [600, 500, 0]]), [[0, 0], [50, 0], [100, 0]]);
    out.push({ name: 'pincer', tracks: build([...b, ...fix, ...w, ...e], [], 600), planted: ['pincer'], allowed: ['flank', 'formation', 'encirclement', 'concentration'] });
  }
  // Encirclement: six close in from all round on a group of three and hold the ring.
  {
    const b = group(1, TANK, still(0, 0), [[-40, 0], [40, 0], [0, 40]], [undefined, 500]);
    const a: SUnit[] = [];
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      a.push({ id: id(), team: 0, cls: TANK, at: way([[0, Math.cos(ang) * 2600, Math.sin(ang) * 2600], [250, Math.cos(ang) * 500, Math.sin(ang) * 500], [700, Math.cos(ang) * 500, Math.sin(ang) * 500]]) });
    }
    out.push({ name: 'encirclement', tracks: build([...a, ...b], [kill(500, a[0])], 700), planted: ['encirclement'], allowed: ['frontalAssault', 'flank', 'pincer', 'concentration', 'ambush'] });
  }
  // Penetration: a column drives through the gap in the middle of a standing line, on through.
  {
    const b = line(1, TANK, 0, [-900, -600, -300, 300, 600, 900]);
    const a = group(0, TANK, way([[0, 0, -2600], [500, 0, 1900]]), COL3);
    out.push({ name: 'penetration', tracks: build([...a, ...b], [], 600), planted: ['penetration'], allowed: ['frontalAssault', 'formation'] });
  }
  // Bounding overwatch: two pairs of infantry, one moves 8 s while the other covers it, eight times.
  {
    const pairs: SUnit[] = [];
    const bound = 8;
    const speed = 3;
    for (let p = 0; p < 2; p++)
      for (let k = 0; k < 2; k++) {
        const pts: [number, number, number][] = [];
        let z = p === 0 ? 0 : -6;
        pts.push([0, k * 6 + p * 3, z]);
        for (let i = 0; i < 10; i++) {
          const t0 = 20 + i * bound;
          const moving = i % 2 === p;
          if (moving) {
            pts.push([t0, k * 6 + p * 3, z]);
            z += speed * bound;
            pts.push([t0 + bound, k * 6 + p * 3, z]);
          }
        }
        pairs.push({ id: id(), team: 0, cls: INF, at: way(pts) });
      }
    const fire: { t: number; kind: EvKind; unit: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const t0 = 20 + i * bound;
      const cover = i % 2 === 0 ? 1 : 0;
      fire.push({ t: t0 + 3, kind: 'fire', unit: pairs[cover * 2].id }, { t: t0 + 5, kind: 'fire', unit: pairs[cover * 2 + 1].id });
    }
    const enemy = line(1, INF, 400, [0, 10]);
    out.push({ name: 'bounding', tracks: build([...pairs, ...enemy], fire, 140), planted: ['bounding'], allowed: ['formation'] });
  }
  // Ambush: a column on the road runs into three that have waited two minutes beside it, and loses three.
  {
    const b = group(1, TANK, still(0, 0), [[-40, 0], [0, 30], [40, 0]]);
    const a = group(0, TANK, way([[0, -4200, 450], [600, 4200, 450]]), [[0, 0], [-60, 0], [-120, 0], [-180, 0]], [266, 270, 276]);
    const evs = [
      { t: 262, kind: 'fire' as EvKind, unit: b[0].id },
      { t: 263, kind: 'fire' as EvKind, unit: b[1].id },
      kill(266, b[0]),
      kill(270, b[1]),
      kill(276, b[2]),
      { t: 268, kind: 'fire' as EvKind, unit: a[3].id },
    ];
    out.push({ name: 'ambush', tracks: build([...a, ...b], evs, 400), planted: ['ambush'], allowed: ['frontalAssault', 'flank', 'formation', 'tempo'] });
  }
  // Withdrawal and pursuit: a group in contact turns away; the enemy follows.
  {
    const a = group(0, TANK, way([[0, 0, -500], [100, 0, -500], [300, 0, -2800], [400, 0, -2800]]), LINE3);
    const b = group(1, TANK, way([[0, 0, 0], [110, 0, 0], [300, 0, -1900], [400, 0, -1900]]), LINE3);
    out.push({ name: 'withdrawal', tracks: build([...a, ...b], [], 400), planted: ['withdrawal', 'pursuit'], allowed: ['formation', 'frontalAssault'] });
  }
  // Feint: one tank shows at P1; the enemy at P2 hurries over; the main body hits P2.
  {
    const p1 = group(1, TANK, still(-2500, 0), [[-50, 0], [50, 0]]);
    const p2stay = group(1, TANK, still(2500, 0), [[0, 0]]);
    const p2go = group(1, TANK, way([[0, 2500, 0], [110, 2500, 0], [200, -1900, 0], [600, -1900, 0]]), [[-60, 30], [0, 30], [60, 30]]);
    const f1 = group(0, TANK, way([[0, -2500, -2200], [100, -2500, -650], [600, -2500, -650]]), [[0, 0]]);
    const main = group(0, TANK, way([[0, 2500, -3400], [100, 2500, -3400], [230, 2500, -600], [600, 2500, -600]]), [[-120, 0], [-60, 0], [0, 0], [60, 0], [120, 0]]);
    out.push({
      name: 'feint',
      tracks: build([...p1, ...p2stay, ...p2go, ...f1, ...main], [], 600),
      planted: ['feint'],
      allowed: ['frontalAssault', 'flank', 'formation', 'concentration', 'dispersion', 'pursuit', 'withdrawal'],
    });
  }
  // Screen: a scout 900 m ahead of a body of four, meeting the enemy first.
  {
    const body = way([[0, 0, -4000], [600, 0, 2000]]);
    const main = group(0, TANK, body, [[-60, -40], [60, -40], [-60, 40], [60, 40]]);
    const scout = group(0, TANK, offset(body, 0, 900), [[0, 0]]);
    const b = line(1, TANK, 600, [-300, 0, 300]);
    out.push({ name: 'screen', tracks: build([...main, ...scout, ...b], [], 420), planted: ['screen'], allowed: ['frontalAssault', 'formation', 'penetration'] });
  }
  // Defence in depth: two belts of four, 600 m apart; the enemy comes on; the front belt fires first, then the rear.
  {
    const f1 = line(1, TANK, 0, [-450, -150, 150, 450]);
    const f2 = line(1, TANK, 900, [-450, -150, 150, 450]);
    const a = group(0, TANK, way([[0, 0, -3000], [250, 0, -500], [600, 0, -500]]), LINE4, [260, undefined, 330]);
    out.push({ name: 'depth', tracks: build([...f1, ...f2, ...a], [kill(260, f1[1]), kill(330, f2[2])], 600), planted: ['defenceInDepth'], allowed: ['frontalAssault', 'formation'] });
  }
  // Interior lines: one side's two groups 1.6 km apart between the other's, 6 km apart; units shift between them.
  {
    const bw = group(1, TANK, still(-3000, 0), [[0, -40], [0, 40], [40, 0]]);
    const be = group(1, TANK, still(3000, 0), [[0, -40], [0, 40], [40, 0]]);
    const aw = group(0, TANK, still(-800, 0), [[0, -40], [0, 40]]);
    const ae = group(0, TANK, still(800, 0), [[0, -40], [0, 40]]);
    const shuttle: SUnit = { id: id(), team: 0, cls: TANK, at: way([[0, -800, 0], [100, -800, 0], [200, 800, 0], [300, 800, 0], [400, -800, 0], [600, -800, 0]]) };
    out.push({ name: 'interior', tracks: build([...bw, ...be, ...aw, ...ae, shuttle], [], 600), planted: ['interiorLines'], allowed: ['formation'] });
  }
  // Concentration: four pairs 5 km apart converge on one point and attack.
  {
    const a: SUnit[] = [];
    for (const [x, z] of [
      [-2500, -2500],
      [2500, -2500],
      [-2500, 1000],
      [2500, 1000],
    ])
      a.push(...group(0, TANK, way([[0, x, z], [100, x, z], [280, 0, -900], [600, 0, -900]]), [[-40, 0], [40, 0]]));
    const b = line(1, TANK, 0, [-100, 0, 100]);
    out.push({ name: 'concentration', tracks: build([...a, ...b], [], 600), planted: ['concentration'], allowed: ['frontalAssault', 'flank', 'pincer', 'encirclement', 'formation', 'penetration'] });
  }
  // Missile defence: a launch at 40 km; the target cranks 50°, notches, drags or pumps.
  for (const kind of ['crank', 'notch', 'drag', 'pump'] as const) {
    const sh = way([[0, -30000, 0, 9000], [300, 30000, 0, 9000]]);
    const shooter: SUnit = { id: id(), team: 1, cls: FIGHTER, at: sh };
    const v = 250;
    const t0 = 60;
    // The target flies west at the shooter until the launch, then turns.
    const head = (t: number): number => {
      if (t < t0 + 3) return Math.PI;
      const dt = t - t0 - 3;
      const turn = kind === 'crank' ? 50 : kind === 'notch' ? 90 : 180;
      if (kind === 'pump') return dt < 25 ? Math.PI - Math.PI : Math.PI;
      return Math.PI - (turn * Math.PI) / 180;
    };
    const pts: [number, number, number, number][] = [];
    let x = 30000;
    let z = 0;
    for (let t = 0; t <= 300; t++) {
      pts.push([t, x, z, 8000]);
      const h = head(t);
      x += Math.cos(h) * v;
      z += Math.sin(h) * v;
    }
    const target: SUnit = { id: id(), team: 0, cls: FIGHTER, at: way(pts) };
    out.push({ name: `missile-${kind}`, tracks: build([shooter, target], [{ t: t0, kind: 'launch', unit: shooter.id }], 300), planted: [kind], allowed: kind === 'pump' ? ['drag'] : [] });
  }
  // Combat air patrol and grinder.
  {
    const orbit = (phase: number, r: number, v: number, cx: number, cz: number): Path => (t) => {
      const a = phase + (t * v) / r;
      return [cx + Math.cos(a) * r, 7000, cz + Math.sin(a) * r];
    };
    const cap: SUnit = { id: id(), team: 0, cls: FIGHTER, at: orbit(0, 9000, 200, 0, 0) };
    out.push({ name: 'cap', tracks: build([cap], [], 900), planted: ['cap'], allowed: [] });
    const g1: SUnit = { id: id(), team: 0, cls: FIGHTER, at: orbit(0, 9000, 200, 0, 0) };
    const g2: SUnit = { id: id(), team: 0, cls: FIGHTER, at: orbit(Math.PI, 9000, 200, 0, 0) };
    out.push({ name: 'grinder', tracks: build([g1, g2], [], 900), planted: ['grinder'], allowed: [] });
  }
  // The wall: four abreast at an enemy pair ahead.
  {
    const w = way([[0, -60000, 0, 9000], [240, 0, 0, 9000]]);
    const a = group(0, FIGHTER, w, [[0, -3000], [0, -1000], [0, 1000], [0, 3000]]);
    const b = group(1, FIGHTER, way([[0, 40000, 0, 9000], [240, 30000, 0, 9000]]), [[0, -1000], [0, 1000]]);
    out.push({ name: 'wall', tracks: build([...a, ...b], [], 240), planted: ['wall'], allowed: ['formation', 'airPincer', 'leadTrail'] });
  }
  // Air pincer: a pair splits 60° each way and comes at an enemy from both sides.
  {
    const e: SUnit = { id: id(), team: 1, cls: FIGHTER, at: still(0, 0, 9000) };
    const mk = (side: number): SUnit => {
      const pts: [number, number, number, number][] = [];
      let x = -55000;
      let z = side * 800;
      for (let t = 0; t <= 300; t++) {
        pts.push([t, x, z, 9000]);
        const toE = Math.atan2(-z, -x);
        const h = t < 60 ? 0 : t < 180 ? side * (70 * Math.PI) / 180 : toE;
        x += Math.cos(h) * 220;
        z += Math.sin(h) * 220;
      }
      return { id: id(), team: 0, cls: FIGHTER, at: way(pts) };
    };
    out.push({ name: 'airPincer', tracks: build([e, mk(1), mk(-1)], [], 300), planted: ['airPincer'], allowed: ['formation', 'wall'] });
  }
  // Angles fight and energy fight: a pair turning flat at low speed; a pair zooming up and down.
  for (const kind of ['anglesFight', 'energyFight'] as const) {
    const mk = (phase: number): Path => (t) => {
      if (t < 30) return [-8000 + t * 250 * (phase ? -1 : 1) + (phase ? 16000 : 0), 5000, phase ? 300 : -300];
      const a = phase + ((t - 30) * (kind === 'anglesFight' ? 150 : 220)) / 700;
      const y = kind === 'anglesFight' ? 5000 : 5000 + 900 * Math.sin((t - 30) / 8);
      return [Math.cos(a) * 700 - 500 + (phase ? 1000 : 0), y, Math.sin(a) * 700];
    };
    const a: SUnit = { id: id(), team: 0, cls: FIGHTER, at: mk(0) };
    const b: SUnit = { id: id(), team: 1, cls: FIGHTER, at: mk(Math.PI), dies: 110 };
    out.push({ name: kind, tracks: build([a, b], [kill(110, a)], 150), planted: [kind], allowed: ['anglesFight', 'energyFight', 'cap', 'grinder'] });
  }
  // Strike package and SEAD: four fly in together; two strike the air defence first, then the rest.
  {
    const route = way([[0, -60000, 0, 6000], [240, -8000, 0, 6000], [400, 0, 0, 6000]]);
    const pkg = group(0, ATTACK, route, [[-1000, 0], [1000, 0], [-1000, -1500], [1000, -1500]]);
    const sam: SUnit = { id: id(), team: 1, cls: SPAA, at: still(0, 1000), dies: 250 };
    const tg = [0, 1, 2].map((i) => ({ id: id(), team: 1, cls: TANK, at: still(800 * i, -1000), dies: 300 + i * 20 }) as SUnit);
    const evs = [kill(250, pkg[2]), kill(300, pkg[3]), kill(320, pkg[3]), kill(340, pkg[2])];
    out.push({ name: 'strike', tracks: build([...pkg, sam, ...tg], evs, 420), planted: ['strikePackage', 'sead'], allowed: ['formation', 'wall'] });
  }
  // Crossing the T: a column of four steams east across the head of an enemy column of four steaming north.
  {
    const a = group(0, SHIP, way([[0, -12000, 9000], [900, 12000, 9000]]), [[0, 0], [-500, 0], [-1000, 0], [-1500, 0]]);
    const b = group(1, SHIP, way([[0, 0, -6000], [900, 0, 3000]]), [[0, 0], [0, -500], [0, -1000], [0, -1500]]);
    out.push({ name: 'crossingT', tracks: build([...a, ...b], [], 900), planted: ['crossingT', 'lineOfBattle'], allowed: ['formation', 'frontalAssault', 'flank', 'screen'] });
  }
  out.push(...nulls());
  return out;
}

/** Deaths for units killed by name (kept for clarity where a scenario builds them after the fact). */
function withDeaths(m: MatchTracks, units: SUnit[], at: number[]): MatchTracks {
  units.forEach((u, i) => {
    const p = u.at(at[i]) ?? [0, 0, 0];
    m.events.push({ t: at[i], kind: 'death', unit: u.id, team: u.team, x: p[0], y: p[1], z: p[2], tcls: -1 });
    const tr = m.units.find((x) => x.id === u.id)!;
    const n = tr.t.findIndex((t) => t > at[i]);
    if (n >= 0) {
      tr.t = tr.t.slice(0, n);
      tr.x = tr.x.slice(0, n);
      tr.y = tr.y.slice(0, n);
      tr.z = tr.z.slice(0, n);
    }
  });
  m.events.sort((a, b) => a.t - b.t);
  return m;
}

/** Smooth random walks. */
function wander(r: () => number, team: number, cls: number, cx: number, cz: number, half: number, speed: number, dur: number): SUnit {
  const pts: [number, number, number][] = [];
  let x = cx + (r() - 0.5) * 2 * half;
  let z = cz + (r() - 0.5) * 2 * half;
  let h = r() * Math.PI * 2;
  for (let t = 0; t <= dur; t += 10) {
    pts.push([t, x, z]);
    h += (r() - 0.5) * 1.6;
    x += Math.cos(h) * speed * 10 * (0.3 + r());
    z += Math.sin(h) * speed * 10 * (0.3 + r());
    if (Math.abs(x - cx) > half) h = Math.PI - h;
    if (Math.abs(z - cz) > half) h = -h;
    x = Math.max(cx - half, Math.min(cx + half, x));
    z = Math.max(cz - half, Math.min(cz + half, z));
  }
  return { id: id(), team, cls, at: way(pts) };
}

/** Null matches: nothing planted, nothing should be found at medium confidence or above. */
export function nulls(): Scenario[] {
  const out: Scenario[] = [];
  for (let k = 0; k < 6; k++) {
    const r = rng(100 + k);
    // Random walks, each side on its own half (no contact).
    const apart = [...Array.from({ length: 6 }, () => wander(r, 0, TANK, -4000, 0, 2500, 5, 900)), ...Array.from({ length: 6 }, () => wander(r, 1, TANK, 4000, 0, 2500, 5, 900))];
    out.push({ name: `null-apart-${k}`, tracks: build(apart, [], 900), planted: [], allowed: [] });
    // Random walks mixed on one field.
    const mixed = [...Array.from({ length: 6 }, () => wander(r, 0, TANK, 0, 0, 3000, 5, 900)), ...Array.from({ length: 6 }, () => wander(r, 1, TANK, 0, 0, 3000, 5, 900))];
    out.push({ name: `null-mixed-${k}`, tracks: build(mixed, [], 900), planted: [], allowed: [] });
    // Everyone standing at random places.
    const stand: SUnit[] = [];
    for (let i = 0; i < 16; i++) stand.push({ id: id(), team: i % 2, cls: TANK, at: still((r() - 0.5) * 6000, (r() - 0.5) * 6000) });
    out.push({ name: `null-static-${k}`, tracks: build(stand, [], 600), planted: [], allowed: [] });
    // Aircraft on straight random legs, no launches.
    const air: SUnit[] = [];
    for (let i = 0; i < 6; i++) {
      const a = r() * Math.PI * 2;
      const x0 = (r() - 0.5) * 80000;
      const z0 = (r() - 0.5) * 80000;
      air.push({ id: id(), team: i % 2, cls: FIGHTER, at: way([[0, x0, z0, 8000], [600, x0 + Math.cos(a) * 140000, z0 + Math.sin(a) * 140000, 8000]]) });
    }
    out.push({ name: `null-air-${k}`, tracks: build(air, [], 600), planted: [], allowed: [] });
    // Infantry milling about in a loose crowd, no enemy near.
    const crowd = Array.from({ length: 8 }, () => wander(r, 0, INF, 0, 0, 60, 1.5, 300));
    const far = Array.from({ length: 4 }, () => wander(r, 1, INF, 3000, 3000, 60, 1.5, 300));
    out.push({ name: `null-crowd-${k}`, tracks: build([...crowd, ...far], [], 300), planted: [], allowed: [] });
  }
  return out;
}
