/**
 * The close-quarters walk: one pass over rows in time order, rounds kept
 * apart by their session, folding each row into the state of its round - who
 * is alive on which side, where each player stood over the last two seconds
 * and where they looked, the bomb or objective, the utility that went off -
 * and recording, at every death, the duel as it stood: both players' speed
 * and aim, the teammates able to cross their fire, the utility behind each,
 * the alive counts before and after. Everything the metrics (`finish.ts`)
 * need is in those records; nothing is kept per row.
 *
 * Rows come resolved (`CqbRows`): kinds, people, places and weapons as small
 * integers, so the viewer's columns (`run.ts`) and a summary's raw table
 * (`summary.ts`) feed the same walk.
 */

/** What a row is, for this walk. */
export const K_POS = 0;
export const K_KILL = 1;
export const K_DEATH = 2;
export const K_SPAWN = 3;
export const K_FLASH = 4;
export const K_SMOKE = 5;
export const K_HE = 6;
export const K_FIRE = 7;
export const K_PLANT = 8;
export const K_DEFUSE = 9;
/** Any other event: its result and loadout columns still count. */
export const K_EVENT = 10;
/** A row to pass over entirely (a thrown object's own flight samples). */
export const K_SKIP = 11;

/** A raw event label as this walk's kind; -1 when the canonical kind decides. */
export function rawKind(label: string): number {
  const s = label.trim().toLowerCase();
  if (/^(flash|flashbang|flashbang_detonate|flash_detonate)$/.test(s)) return K_FLASH;
  if (/^(smoke|smokegrenade_detonate|smoke_detonate)$/.test(s)) return K_SMOKE;
  if (/^(he|hegrenade_detonate|frag|grenade_detonate)$/.test(s)) return K_HE;
  if (/^(molotov|inferno|inferno_startburn|incendiary|incgrenade)$/.test(s)) return K_FIRE;
  if (/^(plant|planted|bomb_planted|objective_planted)$/.test(s)) return K_PLANT;
  if (/^(defuse|defused|bomb_defused)$/.test(s)) return K_DEFUSE;
  if (/^(grenade|projectile|nade|thrown|flight)$/.test(s)) return K_SKIP;
  return -1;
}

/** A canonical event kind (`data/canonical.ts` EVENT_KINDS name) as this walk's kind. */
export function canonKind(kind: string): number {
  switch (kind) {
    case 'position':
      return K_POS;
    case 'kill':
      return K_KILL;
    case 'death':
    case 'destroyed':
      return K_DEATH;
    case 'spawn':
      return K_SPAWN;
    case 'other':
      return K_EVENT;
    default:
      return K_EVENT;
  }
}

/** One slice of rows, resolved. Arrays are row-parallel; `null` where the data has no such column. */
export interface CqbRows {
  n: number;
  t: ArrayLike<number>;
  /** World position, y up. */
  x: ArrayLike<number>;
  y: ArrayLike<number>;
  z: ArrayLike<number>;
  /** View yaw, radians, `atan2(dx, -dz)` of the look direction (`data/ingest.ts`); NaN where unknown. */
  yaw: ArrayLike<number> | null;
  person: ArrayLike<number>;
  team: ArrayLike<number>;
  /** The round (or match) the row belongs to; -1 none. */
  session: ArrayLike<number>;
  kind: ArrayLike<number>;
  /** The other party (a kill's victim, a death's killer) as a person index; -1 none. */
  other: ArrayLike<number> | null;
  place: ArrayLike<number> | null;
  weapon: ArrayLike<number> | null;
  /** 1 when the row's side won the round, 0 lost, NaN unknown. */
  won: ArrayLike<number> | null;
  /** Non-zero when the row's player was blinded. */
  flashed: ArrayLike<number> | null;
  /** The row's buy as 0..1 (eco 0, full 1); NaN unknown. */
  buy: ArrayLike<number> | null;
  /** Whether the row counts (the view's filters); absent: all. */
  shown?: ArrayLike<number> | null;
  /** The dataset row of row 0, for the per-row situations (`CqbWalk.flags`). */
  row0?: number;
}

/** Per-row situation bits (`CqbWalk.flags`): blinded, a traded death, the opening duel, and the numbers. */
export const F_FLASHED = 1;
export const F_TRADED = 2;
export const F_OPENING = 4;
/** Bits 3-4: 1 more players alive than the enemy, 2 even, 3 fewer; 0 unknown. */
export const F_MAN_SHIFT = 3;

export interface WalkOptions {
  /** World units in a metre. */
  upm: number;
  /** Place cells (metres) when the data has no place column. */
  cell?: number;
  /** Dataset rows: when given, the walk writes each row's situation bits (`CqbWalk.flags`). */
  rows?: number;
}

/** Samples a player keeps: two seconds at 8 Hz. */
const RING = 16;
/** Seconds over which a duellist's speed is measured: who moved into the fight. */
export const SPEED_WINDOW = 1;
/** Seconds before a death the pre-aim is read at. */
export const PRE_AIM = 0.75;
/** Seconds within which a teammate's kill trades a death. */
export const TRADE_SECS = 5;
/** Seconds a flash supports a duel for, and metres from either duellist. */
export const FLASH_SECS = 3;
export const UTIL_RANGE = 15;
/** Seconds a smoke stands. */
export const SMOKE_SECS = 18;
/** Metres a crossfire partner may stand from the enemy, and the angle (degrees) its line must differ by. */
export const CROSS_RANGE = 25;
export const CROSS_ANGLE = 35;
/** Metres a second within which a player counts as holding still; above `MOVE` as moving. */
export const STILL = 0.75;
export const MOVE = 1.5;
/** Metres from the nearest teammate beyond which a player is lurking. */
export const LURK = 30;
/** Metres between players of one stack; rotation: away beyond `AWAY`, arrived within `NEAR`. */
export const STACK = 10;
export const AWAY = 30;
export const NEAR = 12;
/** Seconds after entering a place a death counts against the entry (the fatal funnel). */
export const FUNNEL_SECS = 2.5;
/** Seconds between clock snapshots of a round. */
export const CLOCK = 10;
/** Teams a snapshot keeps alive counts for. */
export const MAX_TEAMS = 8;
/** Duels kept at most (the rest are counted only). */
const MAX_DUELS = 400_000;

export class Slot {
  alive = false;
  seen = false;
  deaths = 0;
  lastDeathT = -1e9;
  rt = new Float64Array(RING);
  rx = new Float32Array(RING);
  ry = new Float32Array(RING);
  rz = new Float32Array(RING);
  ryaw = new Float32Array(RING);
  head = 0;
  cnt = 0;
  place = -1;
  entry = -1;
  entryT = -1e9;
  buy = NaN;
  lastT = NaN;
  watchOpen = -1;
  watchPlant = -1;
  /** Dataset row of the player's last row so far (-1 none). */
  lastRow = -1;
  constructor(
    readonly person: number,
    public team: number,
  ) {}

  push(t: number, x: number, y: number, z: number, yaw: number): void {
    const h = this.head;
    this.rt[h] = t;
    this.rx[h] = x;
    this.ry[h] = y;
    this.rz[h] = z;
    this.ryaw[h] = yaw;
    this.head = (h + 1) % RING;
    if (this.cnt < RING) this.cnt++;
  }

  /** Ring index of the latest sample at or before `t` (the oldest if none is); -1 without samples. */
  at(t: number): number {
    for (let k = 1; k <= this.cnt; k++) {
      const i = (this.head - k + RING) % RING;
      if (this.rt[i] <= t + 1e-6) return i;
    }
    return this.cnt ? (this.head - this.cnt + RING) % RING : -1;
  }

  latest(): number {
    return this.cnt ? (this.head - 1 + RING) % RING : -1;
  }

  /** Mean speed over the `win` seconds before `t` (world units a second); NaN with too few samples. */
  speed(t: number, win: number): number {
    const a = this.at(t);
    if (a < 0) return NaN;
    let b = -1;
    for (let k = 1; k <= this.cnt; k++) {
      const i = (this.head - k + RING) % RING;
      if (this.rt[i] <= this.rt[a] - win + 1e-6) {
        b = i;
        break;
      }
      b = i;
    }
    const dt = this.rt[a] - this.rt[b];
    if (b < 0 || dt < win * 0.4) return NaN;
    return Math.hypot(this.rx[a] - this.rx[b], this.rz[a] - this.rz[b]) / dt;
  }
}

export interface Utility {
  t: number;
  x: number;
  z: number;
  team: number;
  kind: number;
  thrower: number;
}

export interface Round {
  id: number;
  start: number;
  lastT: number;
  slots: Slot[];
  by: Map<number, Slot>;
  plantT: number;
  plantTeam: number;
  plantX: number;
  plantZ: number;
  plantAlive: number[] | null;
  defused: boolean;
  util: Utility[];
  wonSum: Float64Array;
  wonN: Float64Array;
  nextClock: number;
  duels: number[];
  /** Snapshot indices: the round's opening state and every change. */
  snaps: number[];
  /** Kills paired later: [killer slot person, time] for kill rows without a victim. */
  pendingKills: { killer: number; t: number }[];
  /** Per team at the opening duel: the largest group within `STACK` metres. */
  stack: Int8Array | null;
  /** Clutches: team -> [person, snapshot] when the team first came down to one. */
  clutch: Map<number, [number, number]>;
}

export interface Duel {
  round: number;
  t: number;
  rt: number;
  killer: number;
  victim: number;
  kTeam: number;
  vTeam: number;
  x: number;
  z: number;
  /** World units between them. */
  d: number;
  /** Speeds over `SPEED_WINDOW` (world units a second). */
  vk: number;
  vv: number;
  /** Radians between each one's view and the bearing to the other: at the death and `PRE_AIM` before. */
  offK: number;
  offV: number;
  preK: number;
  preV: number;
  pre: number;
  post: number;
  place: number;
  kPlace: number;
  weapon: number;
  flashedV: boolean;
  /** A flash of the killer's (victim's) side went off nearby in the seconds before. */
  flashK: boolean;
  flashV: boolean;
  smokeK: boolean;
  smokeV: boolean;
  /** Throwers of the flashes behind the killer's side. */
  flashBy: number[];
  /** Metres to the nearest alive teammate (Infinity alone). */
  nearK: number;
  nearV: number;
  /** Teammates of the killer (victim) holding still with a line crossing the killer's (victim's) onto the other. */
  crossK: number;
  crossV: number;
  teamkill: boolean;
  opening: boolean;
  postPlant: boolean;
  /** The duel that traded this death (the killer killed in turn by the victim's side), -1 none. */
  tradedBy: number;
  tradeT: number;
  /** Dataset rows of the kill and of the death (-1 unknown), for the per-row situations. */
  killRow: number;
  deathRow: number;
  /**
   * The victim's row before its death: the breakdown reads a death by the state the
   * victim carried just before it (docs/breakdown.md), so the situation goes there too.
   */
  victimPrev: number;
}

export interface Plant {
  round: number;
  person: number;
  team: number;
  pre: number;
  post: number;
}

export interface Rotation {
  round: number;
  team: number;
  person: number;
  /** 0 to the opening fight, 1 to the planted objective. */
  kind: 0 | 1;
  t0: number;
  ax: number;
  az: number;
  /** Seconds to arrive; NaN never. */
  took: number;
}

export interface CqbWalk {
  opt: Required<WalkOptions>;
  rounds: Map<number, Round>;
  order: Round[];
  duels: Duel[];
  duelsSeen: number;
  plants: Plant[];
  rotations: Rotation[];
  /** Utility thrown, by kind and team: [kind * MAX_TEAMS + team]. */
  utilCount: Float64Array;
  /** Flash records with the duels they supported. */
  flashes: { round: number; team: number; thrower: number; duels: number[] }[];
  // Snapshots, row-parallel arrays grown as needed.
  snapN: number;
  snapRound: Int32Array;
  snapT: Float32Array;
  snapAlive: Uint8Array;
  snapPlant: Int8Array;
  snapTsp: Float32Array;
  // Place entries (the fatal funnel).
  entN: number;
  entPlace: Int32Array;
  entTeam: Int16Array;
  entDied: Uint8Array;
  entKilled: Uint8Array;
  // Lurk time by team: seconds alone beyond `LURK` and with the pack.
  lurkT: Float64Array;
  packT: Float64Array;
  /** Rounds where someone died twice without respawning: the data is not elimination rounds. */
  multiDeath: number;
  placeCells: boolean;
  hasYaw: boolean;
  hasPlace: boolean;
  hasWon: boolean;
  hasBuy: boolean;
  hasFlashed: boolean;
  /** Per dataset row, the situation bits (F_*); null unless asked for (`createWalk` with `rows`). */
  flags: Uint8Array | null;
}

const grow = <T extends Int32Array | Float32Array | Uint8Array | Int8Array | Int16Array>(a: T, need: number): T => {
  if (need <= a.length) return a;
  const b = new (a.constructor as new (n: number) => T)(Math.max(need, a.length * 2));
  b.set(a);
  return b;
};

export function createWalk(opt: WalkOptions): CqbWalk {
  return {
    opt: { upm: opt.upm > 0 ? opt.upm : 1, cell: opt.cell ?? 8, rows: opt.rows ?? 0 },
    rounds: new Map(),
    order: [],
    duels: [],
    duelsSeen: 0,
    plants: [],
    rotations: [],
    utilCount: new Float64Array(4 * MAX_TEAMS),
    flashes: [],
    snapN: 0,
    snapRound: new Int32Array(1024),
    snapT: new Float32Array(1024),
    snapAlive: new Uint8Array(1024 * MAX_TEAMS),
    snapPlant: new Int8Array(1024),
    snapTsp: new Float32Array(1024),
    entN: 0,
    entPlace: new Int32Array(1024),
    entTeam: new Int16Array(1024),
    entDied: new Uint8Array(1024),
    entKilled: new Uint8Array(1024),
    lurkT: new Float64Array(MAX_TEAMS),
    packT: new Float64Array(MAX_TEAMS),
    multiDeath: 0,
    placeCells: false,
    hasYaw: false,
    hasPlace: false,
    hasWon: false,
    hasBuy: false,
    hasFlashed: false,
    flags: opt.rows ? new Uint8Array(opt.rows) : null,
  };
}

function roundOf(w: CqbWalk, s: number, t: number): Round {
  let r = w.rounds.get(s);
  if (!r) {
    r = {
      id: s,
      start: t,
      lastT: t,
      slots: [],
      by: new Map(),
      plantT: NaN,
      plantTeam: -1,
      plantX: 0,
      plantZ: 0,
      plantAlive: null,
      defused: false,
      util: [],
      wonSum: new Float64Array(MAX_TEAMS),
      wonN: new Float64Array(MAX_TEAMS),
      nextClock: CLOCK,
      duels: [],
      snaps: [],
      pendingKills: [],
      stack: null,
      clutch: new Map(),
    };
    w.rounds.set(s, r);
    w.order.push(r);
  }
  return r;
}

function slotOf(r: Round, person: number, team: number): Slot {
  let s = r.by.get(person);
  if (!s) {
    s = new Slot(person, team);
    r.by.set(person, s);
    r.slots.push(s);
  } else if (team >= 0 && s.team < 0) s.team = team;
  return s;
}

function alive(r: Round, out: number[]): number[] {
  out.fill(0);
  for (const s of r.slots) if (s.alive && s.team >= 0 && s.team < MAX_TEAMS) out[s.team]++;
  return out;
}

const scratchAlive = new Array<number>(MAX_TEAMS).fill(0);

function snapshot(w: CqbWalk, r: Round, t: number): number {
  const i = w.snapN++;
  if (i >= w.snapRound.length) {
    w.snapRound = grow(w.snapRound, i + 1);
    w.snapT = grow(w.snapT, i + 1);
    w.snapPlant = grow(w.snapPlant, i + 1);
    w.snapTsp = grow(w.snapTsp, i + 1);
    w.snapAlive = grow(w.snapAlive, (i + 1) * MAX_TEAMS);
  }
  w.snapRound[i] = r.id;
  w.snapT[i] = t - r.start;
  const a = alive(r, scratchAlive);
  for (let k = 0; k < MAX_TEAMS; k++) w.snapAlive[i * MAX_TEAMS + k] = a[k];
  w.snapPlant[i] = Number.isFinite(r.plantT) ? r.plantTeam : -1;
  w.snapTsp[i] = Number.isFinite(r.plantT) ? t - r.plantT : 0;
  r.snaps.push(i);
  return i;
}

const wrap = (a: number) => {
  let v = (a + Math.PI) % (2 * Math.PI);
  if (v < 0) v += 2 * Math.PI;
  return Math.abs(v - Math.PI);
};

/** Radians between a's view at ring index ia and the bearing from a to b at ring index ib. */
function offset(a: Slot, ia: number, b: Slot, ib: number): number {
  if (ia < 0 || ib < 0) return NaN;
  const yaw = a.ryaw[ia];
  if (!Number.isFinite(yaw)) return NaN;
  const dx = b.rx[ib] - a.rx[ia];
  const dz = b.rz[ib] - a.rz[ia];
  if (dx === 0 && dz === 0) return NaN;
  return wrap(yaw - Math.atan2(dx, -dz));
}

function nearestMate(r: Round, s: Slot, t: number, upm: number): number {
  const i = s.latest();
  if (i < 0) return NaN;
  let best = Infinity;
  for (const o of r.slots) {
    if (o === s || !o.alive || o.team !== s.team) continue;
    const j = o.latest();
    if (j < 0 || t - o.rt[j] > 2) continue;
    best = Math.min(best, Math.hypot(o.rx[j] - s.rx[i], o.rz[j] - s.rz[i]));
  }
  return best / upm;
}

/** Teammates of `s` holding still within range of `foe` whose line onto it differs from `s`'s by the crossing angle. */
function crossers(r: Round, s: Slot, foe: Slot, t: number, upm: number): number {
  const fi = foe.at(t);
  const si = s.at(t);
  if (fi < 0 || si < 0) return 0;
  const fx = foe.rx[fi];
  const fz = foe.rz[fi];
  const b0 = Math.atan2(s.rx[si] - fx, -(s.rz[si] - fz));
  let n = 0;
  for (const o of r.slots) {
    if (o === s || !o.alive || o.team !== s.team) continue;
    const j = o.at(t);
    if (j < 0 || t - o.rt[j] > 2) continue;
    const dx = o.rx[j] - fx;
    const dz = o.rz[j] - fz;
    if (Math.hypot(dx, dz) > CROSS_RANGE * upm) continue;
    const v = o.speed(t, SPEED_WINDOW);
    if (!(v / upm <= STILL)) continue;
    if (wrap(Math.atan2(dx, -dz) - b0) >= (CROSS_ANGLE * Math.PI) / 180) n++;
  }
  return n;
}

function support(r: Round, team: number, t: number, a: Slot, ai: number, b: Slot, bi: number, kind: number, secs: number, range: number, by?: number[]): boolean {
  let hit = false;
  for (const u of r.util) {
    if (u.kind !== kind || u.team !== team || u.t > t || t - u.t > secs) continue;
    const near = (s: Slot, i: number) => i >= 0 && Math.hypot(s.rx[i] - u.x, s.rz[i] - u.z) <= range;
    if (near(a, ai) || near(b, bi)) {
      hit = true;
      if (by && !by.includes(u.thrower)) by.push(u.thrower);
    }
  }
  return hit;
}

/** Sizes of each team's largest group of alive players within `STACK` metres of one another. */
function stacks(r: Round, upm: number): Int8Array {
  const out = new Int8Array(MAX_TEAMS);
  for (let team = 0; team < MAX_TEAMS; team++) {
    const ss = r.slots.filter((s) => s.alive && s.team === team && s.cnt > 0);
    if (!ss.length) continue;
    const comp = ss.map((_, i) => i);
    const find = (i: number): number => (comp[i] === i ? i : (comp[i] = find(comp[i])));
    for (let i = 0; i < ss.length; i++)
      for (let j = i + 1; j < ss.length; j++) {
        const a = ss[i].latest();
        const b = ss[j].latest();
        if (Math.hypot(ss[i].rx[a] - ss[j].rx[b], ss[i].rz[a] - ss[j].rz[b]) <= STACK * upm) comp[find(i)] = find(j);
      }
    const size = new Map<number, number>();
    for (let i = 0; i < ss.length; i++) size.set(find(i), (size.get(find(i)) ?? 0) + 1);
    out[team] = Math.max(...size.values());
  }
  return out;
}

function watch(w: CqbWalk, r: Round, kind: 0 | 1, team: number, t: number, ax: number, az: number): void {
  for (const s of r.slots) {
    if (!s.alive || (team >= 0 && s.team !== team) || s.team < 0) continue;
    const i = s.latest();
    if (i < 0 || Math.hypot(s.rx[i] - ax, s.rz[i] - az) <= AWAY * w.opt.upm) continue;
    const k = w.rotations.length;
    w.rotations.push({ round: r.id, team: s.team, person: s.person, kind, t0: t, ax, az, took: NaN });
    if (kind === 0) s.watchOpen = k;
    else s.watchPlant = k;
  }
}

function entryOf(w: CqbWalk, s: Slot, place: number, t: number): void {
  const i = w.entN++;
  if (i >= w.entPlace.length) {
    w.entPlace = grow(w.entPlace, i + 1);
    w.entTeam = grow(w.entTeam, i + 1);
    w.entDied = grow(w.entDied, i + 1);
    w.entKilled = grow(w.entKilled, i + 1);
  }
  w.entPlace[i] = place;
  w.entTeam[i] = s.team;
  w.entDied[i] = 0;
  w.entKilled[i] = 0;
  s.entry = i;
  s.entryT = t;
}

/** A death: the duel as it stood, then the victim down. */
/** The duel a kill or death row at `t` belongs to when the other row already made it. */
function duelOf(w: CqbWalk, r: Round, victim: number, t: number): Duel | null {
  for (let j = r.duels.length - 1; j >= 0; j--) {
    const d = w.duels[r.duels[j]];
    if (Math.abs(d.t - t) > 0.5) break;
    if (d.victim === victim) return d;
  }
  return null;
}

function death(w: CqbWalk, r: Round, victim: Slot, killer: Slot | null, t: number, rows: CqbRows, i: number, fromKillRow: boolean): void {
  if (t - victim.lastDeathT < 0.5) {
    const d = duelOf(w, r, victim.person, t);
    if (d && fromKillRow) d.killRow = (rows.row0 ?? 0) + i;
    else if (d) d.deathRow = (rows.row0 ?? 0) + i;
    return;
  }
  if (!victim.alive && victim.seen && victim.deaths > 0) return;
  victim.lastDeathT = t;
  victim.deaths++;
  const pre = snapshot(w, r, t);
  victim.alive = false;
  if (victim.deaths === 2) w.multiDeath++;
  const post = snapshot(w, r, t);
  const upm = w.opt.upm;
  // Funnel: the victim died soon after entering where it still stood.
  if (victim.entry >= 0 && t - victim.entryT <= FUNNEL_SECS && w.entPlace[victim.entry] === victim.place) w.entDied[victim.entry] = 1;
  if (killer && killer.entry >= 0 && t - killer.entryT <= FUNNEL_SECS && w.entPlace[killer.entry] === killer.place) w.entKilled[killer.entry] = 1;
  if (!killer || killer === victim) return;
  w.duelsSeen++;
  if (w.duels.length >= MAX_DUELS) return;
  const ki = killer.at(t);
  const vi = victim.at(t);
  const kp = killer.at(t - PRE_AIM);
  const vp = victim.at(t - PRE_AIM);
  const teamkill = killer.team === victim.team;
  const kx = ki >= 0 ? killer.rx[ki] : rows.x[i];
  const kz = ki >= 0 ? killer.rz[ki] : rows.z[i];
  const ky = ki >= 0 ? killer.ry[ki] : rows.y[i];
  const vx = vi >= 0 ? victim.rx[vi] : rows.x[i];
  const vz = vi >= 0 ? victim.rz[vi] : rows.z[i];
  const vy = vi >= 0 ? victim.ry[vi] : rows.y[i];
  const flashBy: number[] = [];
  const opening = !teamkill && !r.duels.some((k) => !w.duels[k].teamkill);
  const place = rows.place ? (fromKillRow ? victim.place : rows.place[i]) : victim.place;
  const d: Duel = {
    round: r.id,
    t,
    rt: t - r.start,
    killer: killer.person,
    victim: victim.person,
    kTeam: killer.team,
    vTeam: victim.team,
    x: (kx + vx) / 2,
    z: (kz + vz) / 2,
    d: Math.hypot(kx - vx, ky - vy, kz - vz),
    vk: killer.speed(t, SPEED_WINDOW),
    vv: victim.speed(t, SPEED_WINDOW),
    offK: offset(killer, ki, victim, vi),
    offV: offset(victim, vi, killer, ki),
    preK: offset(killer, kp, victim, vp),
    preV: offset(victim, vp, killer, kp),
    pre,
    post,
    place: place ?? -1,
    kPlace: killer.place,
    weapon: rows.weapon ? rows.weapon[i] : -1,
    flashedV: !fromKillRow && !!rows.flashed && rows.flashed[i] > 0,
    flashK: support(r, killer.team, t, killer, ki, victim, vi, K_FLASH, FLASH_SECS, UTIL_RANGE * upm, flashBy),
    flashV: support(r, victim.team, t, killer, ki, victim, vi, K_FLASH, FLASH_SECS, UTIL_RANGE * upm),
    smokeK: support(r, killer.team, t, killer, ki, victim, vi, K_SMOKE, SMOKE_SECS, UTIL_RANGE * upm),
    smokeV: support(r, victim.team, t, killer, ki, victim, vi, K_SMOKE, SMOKE_SECS, UTIL_RANGE * upm),
    flashBy,
    nearK: nearestMate(r, killer, t, upm),
    nearV: NaN,
    crossK: crossers(r, killer, victim, t, upm),
    crossV: crossers(r, victim, killer, t, upm),
    teamkill,
    opening,
    postPlant: Number.isFinite(r.plantT) && r.plantT <= t,
    tradedBy: -1,
    tradeT: NaN,
    killRow: fromKillRow ? (rows.row0 ?? 0) + i : -1,
    deathRow: fromKillRow ? -1 : (rows.row0 ?? 0) + i,
    victimPrev: victim.lastRow,
  };
  // The victim's nearest teammate as it stood before going down.
  victim.alive = true;
  d.nearV = nearestMate(r, victim, t, upm);
  victim.alive = false;
  const k = w.duels.length;
  w.duels.push(d);
  if (!teamkill) {
    // This kill trades an earlier death of the killer's side to the victim.
    for (let j = r.duels.length - 1; j >= 0; j--) {
      const e = w.duels[r.duels[j]];
      if (t - e.t > TRADE_SECS) break;
      if (!e.teamkill && e.killer === victim.person && e.vTeam === killer.team && e.tradedBy < 0) {
        e.tradedBy = k;
        e.tradeT = t - e.t;
        break;
      }
    }
    for (const b of flashBy) {
      const f = w.flashes.find((x) => x.round === r.id && x.thrower === b && x.duels.length < 16);
      if (f) f.duels.push(k);
    }
  }
  r.duels.push(k);
  if (opening) {
    victim.alive = true;
    r.stack = stacks(r, upm);
    victim.alive = false;
    watch(w, r, 0, -1, t, d.x, d.z);
  }
  // Clutch: a side down to its last player against at least one.
  const a = alive(r, scratchAlive);
  for (let team = 0; team < MAX_TEAMS; team++) {
    if (a[team] !== 1 || r.clutch.has(team)) continue;
    const foes = a.reduce((s, v, k2) => s + (k2 === team ? 0 : v), 0);
    if (foes < 1) continue;
    const last = r.slots.find((s) => s.alive && s.team === team);
    if (last) r.clutch.set(team, [last.person, post]);
  }
}

/** A row's situation bits as it stands before the row: blinded, and the numbers on each side. */
function situation(w: CqbWalk, r: Round, s: Slot, rows: CqbRows, i: number, t: number): number {
  if (s.team < 0 || s.team >= MAX_TEAMS) return 0;
  let f = 0;
  if (rows.flashed && rows.flashed[i] > 0) f |= F_FLASHED;
  else {
    const x = rows.x[i];
    const z = rows.z[i];
    const range = UTIL_RANGE * w.opt.upm;
    for (let k = r.util.length - 1; k >= 0; k--) {
      const u = r.util[k];
      if (t - u.t > FLASH_SECS) break;
      if (u.kind === K_FLASH && u.team !== s.team && u.t <= t && Math.hypot(u.x - x, u.z - z) <= range) {
        f |= F_FLASHED;
        break;
      }
    }
  }
  if (s.alive) {
    const a = alive(r, scratchAlive);
    const own = a[s.team];
    let enemy = 0;
    for (let k = 0; k < MAX_TEAMS; k++) if (k !== s.team) enemy = Math.max(enemy, a[k]);
    if (own > 0 && enemy > 0) f |= (own > enemy ? 1 : own === enemy ? 2 : 3) << F_MAN_SHIFT;
  }
  return f;
}

/** The situation bits known only after the fact: opening duels and traded deaths. */
export function finishFlags(w: CqbWalk): Uint8Array | null {
  const f = w.flags;
  if (!f) return null;
  const set = (row: number, bit: number) => {
    if (row >= 0 && row < f.length) f[row] |= bit;
  };
  for (const d of w.duels) {
    if (d.teamkill) continue;
    if (d.opening) {
      set(d.killRow, F_OPENING);
      set(d.deathRow, F_OPENING);
      set(d.victimPrev, F_OPENING);
    }
    if (d.tradedBy >= 0) {
      set(d.deathRow, F_TRADED);
      set(d.victimPrev, F_TRADED);
    }
  }
  return f;
}

export function stepWalk(w: CqbWalk, rows: CqbRows): void {
  const upm = w.opt.upm;
  const cell = w.opt.cell * upm;
  if (rows.yaw) w.hasYaw = true;
  if (rows.place) w.hasPlace = true;
  else w.placeCells = true;
  if (rows.won) w.hasWon = true;
  if (rows.buy) w.hasBuy = true;
  if (rows.flashed) w.hasFlashed = true;
  for (let i = 0; i < rows.n; i++) {
    if (rows.shown && !rows.shown[i]) continue;
    const kind = rows.kind[i];
    if (kind === K_SKIP) continue;
    const t = rows.t[i];
    if (!Number.isFinite(t)) continue;
    const r = roundOf(w, rows.session[i], t);
    if (t > r.lastT) r.lastT = t;
    const person = rows.person[i];
    const team = rows.team[i];
    if (rows.won && team >= 0 && team < MAX_TEAMS) {
      const v = rows.won[i];
      if (v === 0 || v === 1) {
        r.wonSum[team] += v;
        r.wonN[team]++;
      }
    }
    // Clock snapshots, once both sides are seen.
    if (t - r.start >= r.nextClock) {
      if (r.slots.some((s) => s.alive)) snapshot(w, r, t);
      r.nextClock = Math.floor((t - r.start) / CLOCK) * CLOCK + CLOCK;
    }
    if (person < 0) continue;
    const s = slotOf(r, person, team);
    if (rows.buy && !Number.isFinite(s.buy)) {
      const b = rows.buy[i];
      if (Number.isFinite(b)) s.buy = b;
    }
    if (w.flags) w.flags[(rows.row0 ?? 0) + i] = situation(w, r, s, rows, i, t);
    switch (kind) {
      case K_POS: {
        if (!s.seen) {
          s.seen = true;
          s.alive = true;
        }
        if (!s.alive) break;
        const yaw = rows.yaw ? rows.yaw[i] : NaN;
        const dt = Number.isFinite(s.lastT) ? Math.min(1, t - s.lastT) : 0;
        s.lastT = t;
        s.push(t, rows.x[i], rows.y[i], rows.z[i], yaw);
        // Place entries.
        const pl = rows.place ? rows.place[i] : ((Math.floor(rows.x[i] / cell) & 0xffff) << 16) | (Math.floor(rows.z[i] / cell) & 0xffff);
        if (pl >= 0 && pl !== s.place) {
          if (s.place !== -1) entryOf(w, s, pl, t);
          s.place = pl;
        }
        // Lurking: far from every alive teammate.
        if (dt > 0 && s.team >= 0 && s.team < MAX_TEAMS) {
          const near = nearestMate(r, s, t, upm);
          if (Number.isFinite(near)) {
            if (near > LURK) w.lurkT[s.team] += dt;
            else w.packT[s.team] += dt;
          }
        }
        // Rotations arriving.
        for (const k of [s.watchOpen, s.watchPlant]) {
          if (k < 0) continue;
          const ro = w.rotations[k];
          if (Number.isNaN(ro.took) && Math.hypot(rows.x[i] - ro.ax, rows.z[i] - ro.az) <= NEAR * upm) {
            ro.took = t - ro.t0;
            if (k === s.watchOpen) s.watchOpen = -1;
            else s.watchPlant = -1;
          }
        }
        break;
      }
      case K_SPAWN:
        s.seen = true;
        s.alive = true;
        s.cnt = 0;
        s.place = -1;
        break;
      case K_DEATH: {
        if (r.snaps.length === 0) snapshot(w, r, t);
        let killer: Slot | null = null;
        const o = rows.other ? rows.other[i] : -1;
        if (o >= 0) killer = r.by.get(o) ?? null;
        else {
          const pk = r.pendingKills.findIndex((p) => Math.abs(p.t - t) <= 0.5 && r.by.get(p.killer)?.team !== s.team);
          if (pk >= 0) {
            killer = r.by.get(r.pendingKills[pk].killer) ?? null;
            r.pendingKills.splice(pk, 1);
          }
        }
        if (!s.seen) {
          s.seen = true;
          s.alive = true;
        }
        death(w, r, s, killer, t, rows, i, false);
        s.watchOpen = s.watchPlant = -1;
        break;
      }
      case K_KILL: {
        const o = rows.other ? rows.other[i] : -1;
        const victim = o >= 0 ? r.by.get(o) : undefined;
        if (victim) {
          if (t - victim.lastDeathT < 0.5) {
            const d = duelOf(w, r, victim.person, t);
            if (d) d.killRow = (rows.row0 ?? 0) + i;
            break;
          }
          if (r.snaps.length === 0) snapshot(w, r, t);
          if (!victim.seen) {
            victim.seen = true;
            victim.alive = true;
          }
          death(w, r, victim, s, t, rows, i, true);
          victim.watchOpen = victim.watchPlant = -1;
        } else if (o < 0) {
          // No victim named: pair with a death of the other side at the same moment.
          const dIdx = r.duels.length ? r.duels[r.duels.length - 1] : -1;
          const last = dIdx >= 0 ? w.duels[dIdx] : null;
          if (!(last && Math.abs(last.t - t) <= 0.5 && last.killer === person)) r.pendingKills.push({ killer: person, t });
          if (r.pendingKills.length > 32) r.pendingKills.shift();
        }
        break;
      }
      case K_FLASH:
      case K_SMOKE:
      case K_HE:
      case K_FIRE: {
        const u: Utility = { t, x: rows.x[i], z: rows.z[i], team: s.team, kind, thrower: person };
        r.util.push(u);
        if (r.util.length > 64) r.util.splice(0, r.util.length - 64);
        if (s.team >= 0 && s.team < MAX_TEAMS) w.utilCount[(kind - K_FLASH) * MAX_TEAMS + s.team]++;
        if (kind === K_FLASH) w.flashes.push({ round: r.id, team: s.team, thrower: person, duels: [] });
        break;
      }
      case K_PLANT: {
        if (Number.isFinite(r.plantT)) break;
        if (r.snaps.length === 0) snapshot(w, r, t);
        const pre = snapshot(w, r, t);
        r.plantT = t;
        r.plantTeam = s.team;
        r.plantX = rows.x[i];
        r.plantZ = rows.z[i];
        r.plantAlive = alive(r, new Array(MAX_TEAMS).fill(0));
        const post = snapshot(w, r, t);
        w.plants.push({ round: r.id, person, team: s.team, pre, post });
        // The other side's players away from the objective rotate to it.
        for (let team = 0; team < MAX_TEAMS; team++) if (team !== s.team) watch(w, r, 1, team, t, r.plantX, r.plantZ);
        break;
      }
      case K_DEFUSE:
        r.defused = true;
        break;
      default:
        break;
    }
    s.lastRow = (rows.row0 ?? 0) + i;
  }
}
