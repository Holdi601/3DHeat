/**
 * The events a Tacview recording leaves unsaid. A DCS server's recording
 * holds positions and removals only: no launch, hit, kill, take-off or
 * landing. As Tacview's own debriefing does, they are worked out from how
 * things move, appear and end (every one `inferred`):
 *
 *   launch     a missile, rocket, bomb or torpedo appearing; its launcher the
 *              unit nearest where it appeared (or the one the caller names)
 *   burst      a gun's shells or bullets, one event a burst (gaps under
 *              `BURST_GAP_S`), at the gun when the first round left, rounds counted
 *   hit        a weapon whose last stretch (its last sample moved on at its
 *              speed to the frame it was removed in) passes within
 *              `HIT_REACH_M` of a unit not its launcher (a shell `SHELL_REACH_M`)
 *   miss       a missile, rocket, bomb or torpedo ending near no unit: where
 *              it struck or burst, on the ground or in the air
 *   damage     each hit, on the unit hit
 *   kill/death a unit removed within `KILL_WINDOW_S` of the last hit on it
 *              (an aircraft `AIR_WINDOW_S`: a shot down aircraft falls a while),
 *              `shot down` when it was flying when hit
 *   crash      a flying aircraft removed with no hit on it, diving or low
 *   takeoff    a fixed-wing aircraft past `FLY_MS` (a helicopter moving or
 *              climbing) after standing on the ground; landing the reverse,
 *              placed at the touchdown, `damaged` when it was hit in the air
 *   touchdown  ground contact without a landing (a touch and go)
 *   stop       a stop on the ground of `STOP_S` or more (`taxi` / `parked`)
 *   rearm      a stop of `REARM_S` or more after a landing, before the next
 *              take-off: rearmed or refuelled most likely (no recording says)
 *   eject      a parachutist appearing near an aircraft
 *   spawn      a unit's first sample
 *
 * Where the ground is: the recording's AGL where it has one, else the height an aircraft stood at last (near there), or
 * an aerodrome, FARP or carrier of the recording (also the airfield named);
 * a miss is on the ground near a ground unit's height. The removals of a
 * frame are judged once the frame is over, so a target written gone before
 * the weapon that struck it still counts.
 *
 * Positions in metres (x and y level, z up), times in seconds. Used by the
 * ACMI converter (`tools/acmi-to-parquet.mjs`, which writes a row an event)
 * and by the load of a recording converted before it (`data/canonical.ts`,
 * which relabels the rows the events stand on).
 */

export const HIT_REACH_M = 40;
export const SHELL_REACH_M = 15;
export const KILL_WINDOW_S = 60;
export const AIR_WINDOW_S = 120;
/** An aircraft removed within this many seconds of a hit was killed by it whatever its speed. */
const QUICK_S = 10;
/** Metres a second an aircraft removed long after a hit must still be moving to have been killed by it. */
const FLYING_MS = 20;
/** Fixed wing: slower than this on the ground, faster in the air. */
const GROUND_MS = 35;
export const FLY_MS = 50;
const STOP_S = 20;
const SETTLE_S = 3;
const PARK_S = 120;
const REARM_S = 120;
const BURST_GAP_S = 1;
/** Seconds past which a unit's last sample is where it stands, not moved on at its speed. */
const STALE_S = 3;
const STRETCH_S = 1;
const LAUNCH_REACH_M = 1500;
const EJECT_REACH_M = 500;
const PAD_REACH_M = 5000;
const CELL = 2000;
const RING = 32;

const TARGET = /(^|\+)(Air|Ground|Sea)(\+|$)/i;
const NOT_TARGET = /Bullseye|Navaid|Waypoint|Decoy|Flare|Chaff|Shrapnel|Debris|Container|Parachutist|Weapon|Missile|Rocket|Bomb|Shell|Bullet|Projectile|Torpedo|Grenade/i;
const PAD = /Aerodrome|FARP|AircraftCarrier/i;
const STATIC = /(^|\+)(Static|Building)(\+|$)/i;
const WEAPON = /(^|\+)(Missile|Rocket|Bomb|Torpedo|Weapon)(\+|$)/i;
const SHELL = /(^|\+)(Shell|Bullet|Projectile)(\+|$)/i;
const CHUTE = /Parachutist/i;
const AIR = /(^|\+)Air(\+|$)/i;
const HELI = /Rotorcraft|Helicopter/i;

type Kind = 'target' | 'air' | 'heli' | 'pad' | 'weapon' | 'shell' | 'chute' | 'other';

export function acmiKindOf(type: string): Kind {
  if (CHUTE.test(type)) return 'chute';
  if (SHELL.test(type) && !/Missile|Rocket|Bomb|Torpedo/i.test(type)) return 'shell';
  if (WEAPON.test(type) && !/Decoy|Flare|Chaff/i.test(type)) return 'weapon';
  if (PAD.test(type)) return 'pad';
  if (!TARGET.test(type) || NOT_TARGET.test(type)) return 'other';
  if (AIR.test(type) && !/(^|\+)Ground(\+|$)/i.test(type)) return HELI.test(type) ? 'heli' : 'air';
  return 'target';
}

export interface AcmiEvent<K, R, I> {
  /** The Event label: launch, burst, hit, miss, damage, kill, death, crash, takeoff, landing, touchdown, stop, rearm, eject, spawn. */
  kind: string;
  t: number;
  x: number;
  y: number;
  z: number;
  /** Whose row it is. */
  subject: K;
  /** Whether the subject was removed before the event (its row would come after its end). */
  subjectGone: boolean;
  /** The row the event stands on, where one does (null: none). */
  ref: R | null;
  shooter: K | null;
  target: K | null;
  weapon: K | null;
  /** shot down, destroyed, ground, air, damaged, taxi, parked, touch and go... */
  detail: string;
  /** The aerodrome, FARP or carrier's key nearby, null for none known. */
  airfield: K | null;
  rounds: number;
  /** What the caller said of each (at its last `sample`), null for none. */
  subjectInfo: I;
  shooterInfo: I | null;
  targetInfo: I | null;
  weaponInfo: I | null;
  airfieldInfo: I | null;
}

interface Obj<K, R, I> {
  key: K;
  info: I;
  kind: Kind;
  shooter: Obj<K, R, I> | null;
  bomb: boolean;
  x: number;
  y: number;
  z: number;
  t: number;
  vx: number;
  vy: number;
  vz: number;
  n: number;
  cell: number;
  gone: number;
  ref: R | null;
  hits: Hit<K, R, I>[];
  // Aircraft.
  state: 0 | 1 | 2;
  gref: number;
  gx: number;
  gy: number;
  ring: { t: number; x: number; y: number; z: number; ref: R | null }[];
  hitInAir: boolean;
  stop: { t: number; x: number; y: number; z: number; ref: R | null } | null;
  landed: number;
  longStop: { t: number; x: number; y: number; z: number; ref: R | null } | null;
  touch: { t: number; x: number; y: number; z: number; ref: R | null } | null;
  /** Since when it has been slow enough to be on the ground (NaN: it is not). */
  slow: number;
  /** When it last moved over the ground. */
  moved: number;
  /** Height above the ground where the recording says (Tacview's AGL), else NaN. */
  agl: number;
  /** Climbed clear of the ground since the take-off (a touch before that is the take-off itself). */
  climbed: boolean;
}

interface Hit<K, R, I> {
  t: number;
  shooter: Obj<K, R, I> | null;
  weapon: Obj<K, R, I>;
  /** The weapon's removal row. */
  ref: R | null;
  air: boolean;
}

interface Burst<K, R, I> {
  t0: number;
  t1: number;
  n: number;
  x: number;
  y: number;
  z: number;
  weapon: Obj<K, R, I>;
}

const cellKey = (cx: number, cy: number) => (cx + 0x8000) * 0x10000 + (cy + 0x8000);
const cellOf = (x: number, y: number) => cellKey(Math.floor(x / CELL), Math.floor(y / CELL));

export class AcmiEventFinder<K, R, I> {
  private readonly objs = new Map<K, Obj<K, R, I>>();
  private readonly cells = new Map<number, Set<Obj<K, R, I>>>();
  private readonly pending: Obj<K, R, I>[] = [];
  private readonly bursts = new Map<Obj<K, R, I>, Burst<K, R, I>>();
  private burstCheck = -Infinity;
  /** Counts by event label. */
  readonly counts: Record<string, number> = {};

  private readonly emit: (e: AcmiEvent<K, R, I>) => void;

  constructor(emit: (e: AcmiEvent<K, R, I>) => void) {
    this.emit = emit;
  }

  /**
   * An object's sample (not its removal), on row `ref`. `shooter`: a weapon's
   * launcher when the caller knows it (else the nearest unit where it appeared).
   */
  sample(key: K, ref: R | null, t: number, x: number, y: number, z: number, type: string, info: I, shooter: K | null = null, agl = NaN): void {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(t)) return;
    if (!Number.isFinite(z)) z = 0;
    this.advance(t);
    let o = this.objs.get(key);
    if (!o) {
      const kind = acmiKindOf(type);
      if (kind === 'other') return;
      o = this.make(key, kind, ref, t, x, y, z, info);
      this.objs.set(key, o);
      this.first(o, type, shooter);
      if (o.kind === 'shell') return;
      if (this.located(o)) this.cellSet(o.cell).add(o);
      return;
    }
    o.info = info;
    o.agl = agl;
    const dt = t - o.t;
    if (dt <= 1e-3) {
      o.x = x;
      o.y = y;
      o.z = z;
      o.ref = ref;
      return;
    }
    // A sample that moved only some of its coordinates is a recorder's partial update, not a stop (for a
    // couple of seconds; still longer, it stands): the speed stands.
    // After a gap its mean speed over the gap (a recorder that skips a while is no stop either).
    const same = x === o.x && y === o.y;
    const held = same && t - o.moved < 2 && o.n > 1;
    if (!same) o.moved = t;
    if (!held) {
      o.vx = (x - o.x) / dt;
      o.vy = (y - o.y) / dt;
      o.vz = (z - o.z) / dt;
    }
    o.x = x;
    o.y = y;
    o.z = z;
    o.t = t;
    o.ref = ref;
    o.n++;
    if (this.located(o)) {
      const c = cellOf(x, y);
      if (c !== o.cell) {
        this.cells.get(o.cell)?.delete(o);
        o.cell = c;
        this.cellSet(c).add(o);
      }
    }
    if (o.kind === 'air' || o.kind === 'heli') this.flight(o);
  }

  /** An object removed at `t`, on row `ref`. */
  removed(key: K, ref: R | null, t: number): void {
    this.advance(t);
    const o = this.objs.get(key);
    if (!o) return;
    this.objs.delete(key);
    o.gone = t;
    if (o.kind === 'weapon' || o.kind === 'shell') this.weaponEnd(o, ref, t);
    else if (o.kind === 'target' || o.kind === 'air' || o.kind === 'heli') {
      o.ref = ref;
      this.pending.push(o);
    } else this.cells.get(o.cell)?.delete(o);
  }

  /** The time is now `t`: the removals of earlier frames are judged, bursts over are told. */
  advance(t: number): void {
    if (this.pending.length && this.pending[0].gone < t) {
      let k = 0;
      while (k < this.pending.length && this.pending[k].gone < t) this.judge(this.pending[k++]);
      this.pending.splice(0, k);
    }
    if (t - this.burstCheck >= BURST_GAP_S && this.bursts.size) {
      this.burstCheck = t;
      for (const [s, b] of this.bursts)
        if (t - b.t1 > BURST_GAP_S) {
          this.tellBurst(s, b);
          this.bursts.delete(s);
        }
    }
  }

  /** The recording is over: every removal judged, every burst told. */
  finish(): void {
    for (const u of this.pending) this.judge(u);
    this.pending.length = 0;
    for (const [s, b] of this.bursts) this.tellBurst(s, b);
    this.bursts.clear();
  }

  private make(key: K, kind: Kind, ref: R | null, t: number, x: number, y: number, z: number, info: I): Obj<K, R, I> {
    return {
      key, info, kind, shooter: null, bomb: false, x, y, z, t, vx: 0, vy: 0, vz: 0, n: 1, cell: cellOf(x, y), gone: NaN, ref, hits: [],
      state: 0, gref: NaN, gx: NaN, gy: NaN, ring: [], hitInAir: false, stop: null, landed: NaN, longStop: null, touch: null, climbed: false, slow: NaN, moved: t, agl: NaN,
    };
  }

  private located(o: Obj<K, R, I>): boolean {
    return o.kind === 'target' || o.kind === 'air' || o.kind === 'heli' || o.kind === 'pad';
  }

  /** An event of `o`'s; the others by their objects, each its key and what was said of it. */
  private tell(kind: string, o: Obj<K, R, I>, at: { t: number; x: number; y: number; z: number }, ref: R | null, who: { shooter?: Obj<K, R, I> | null; target?: Obj<K, R, I> | null; weapon?: Obj<K, R, I> | null; airfield?: Obj<K, R, I> | null }, detail = '', rounds = 0): void {
    this.counts[kind] = (this.counts[kind] ?? 0) + 1;
    const { shooter = null, target = null, weapon = null, airfield = null } = who;
    this.emit({
      kind, t: at.t, x: at.x, y: at.y, z: at.z, subject: o.key, subjectGone: o.gone < at.t, ref, detail, rounds,
      shooter: shooter?.key ?? null, target: target?.key ?? null, weapon: weapon?.key ?? null, airfield: airfield?.key ?? null,
      subjectInfo: o.info, shooterInfo: shooter?.info ?? null, targetInfo: target?.info ?? null, weaponInfo: weapon?.info ?? null, airfieldInfo: airfield?.info ?? null,
    });
  }

  /** What a new object's first sample says: a launch, a round of a burst, an ejection, a spawn. */
  private first(o: Obj<K, R, I>, type: string, shooter: K | null): void {
    if (o.kind === 'weapon' || o.kind === 'shell') {
      const named = shooter !== null ? this.objs.get(shooter) : undefined;
      const s = named && named.kind !== 'pad' ? named : this.nearest(o, LAUNCH_REACH_M, (u) => u.kind !== 'pad');
      o.shooter = s;
      o.bomb = /Bomb/i.test(type);
      if (o.kind === 'weapon') {
        this.tell('launch', o, o, o.ref, { shooter: s, weapon: o, airfield: s && s.state !== 2 ? this.padNear(s) : null });
        return;
      }
      if (!s) return;
      const b = this.bursts.get(s);
      if (b && o.t - b.t1 <= BURST_GAP_S) {
        b.n++;
        b.t1 = o.t;
      } else {
        if (b) this.tellBurst(s, b);
        this.bursts.set(s, { t0: o.t, t1: o.t, n: 1, x: s.x, y: s.y, z: s.z, weapon: o });
      }
      return;
    }
    if (o.kind === 'chute') {
      const a = this.nearest(o, EJECT_REACH_M, (u) => u.kind === 'air' || u.kind === 'heli', true);
      if (a) this.tell('eject', a, { t: o.t, x: a.x, y: a.y, z: a.z }, o.ref, {});
      return;
    }
    if (o.kind === 'pad' || STATIC.test(type)) return;
    this.tell('spawn', o, o, o.ref, {});
  }

  private tellBurst(s: Obj<K, R, I>, b: Burst<K, R, I>): void {
    this.tell('burst', s, { t: b.t0, x: b.x, y: b.y, z: b.z }, null, { shooter: s, weapon: b.weapon }, s.state === 2 ? 'air' : '', b.n);
  }

  /** The unit (`want`) nearest `o` within `reach` metres; `gone` too: removed in this frame. */
  private nearest(o: { x: number; y: number; z: number; t: number }, reach: number, want: (u: Obj<K, R, I>) => boolean, gone = false): Obj<K, R, I> | null {
    const cx = Math.floor(o.x / CELL);
    const cy = Math.floor(o.y / CELL);
    let best: Obj<K, R, I> | null = null;
    let bd = reach;
    const span = Math.ceil(reach / CELL);
    for (let i = -span; i <= span; i++)
      for (let j = -span; j <= span; j++) {
        const set = this.cells.get(cellKey(cx + i, cy + j));
        if (!set) continue;
        for (const u of set) {
          if (!want(u) || (!gone && u.gone < o.t)) continue;
          const lag = Math.abs(o.t - u.t) <= STALE_S ? o.t - u.t : 0;
          const d = Math.hypot(u.x + u.vx * lag - o.x, u.y + u.vy * lag - o.y, u.z + u.vz * lag - o.z);
          if (d < bd) {
            bd = d;
            best = u;
          }
        }
      }
    return best;
  }

  private padNear(o: { x: number; y: number; z: number; t: number }): Obj<K, R, I> | null {
    return this.nearest(o, PAD_REACH_M, (u) => u.kind === 'pad', true);
  }

  /** Where the ground is under an aircraft: an airfield near it, else where it stood last if near there. */
  private groundUnder(o: Obj<K, R, I>): number {
    if (Number.isFinite(o.agl)) return o.z - o.agl;
    const pad = this.nearest(o, PAD_REACH_M, (u) => u.kind === 'pad', true);
    if (pad) return pad.z;
    if (Number.isFinite(o.gref) && Math.hypot(o.x - o.gx, o.y - o.gy) < PAD_REACH_M) return o.gref;
    return NaN;
  }

  /** An aircraft's sample: on the ground or flying, and what changed. */
  private flight(o: Obj<K, R, I>): void {
    const here = { t: o.t, x: o.x, y: o.y, z: o.z, ref: o.ref };
    o.ring.push(here);
    if (o.ring.length > RING) o.ring.shift();
    const hs = Math.hypot(o.vx, o.vy);
    const ground = this.groundUnder(o);
    const above = o.z - ground;
    const heli = o.kind === 'heli';
    const slow = heli ? hs < 1.5 && Math.abs(o.vz) < 0.5 && !(above > 25) : hs < GROUND_MS && Math.abs(o.vz) < 5;
    if (!slow) o.slow = NaN;
    else if (Number.isNaN(o.slow)) o.slow = o.t;
    // Slow for a while, not for a sample: a recorder's jitter is no landing.
    const onGround = slow && (o.t - o.slow >= SETTLE_S || o.state === 0);
    const flying = heli ? hs > 5 || above > 10 : (hs > FLY_MS && !(above < 10)) || hs > 90;
    if (o.state !== 1 && onGround) {
      if (o.state === 2) this.landing(o, here);
      o.state = 1;
    } else if (o.state !== 2 && flying) {
      if (o.state === 1) {
        if (o.stop && !heli) this.stopOver(o);
        if (o.longStop) this.tell('rearm', o, o.longStop, o.longStop.ref, { airfield: this.padNear(o.longStop) }, 'stop at base');
        this.tell('takeoff', o, here, o.ref, { airfield: this.padNear(o) });
      }
      o.state = 2;
      o.hitInAir = false;
      o.longStop = null;
      o.stop = null;
      o.touch = null;
      o.climbed = false;
    }
    if (o.state === 1) {
      o.gref = o.z;
      o.gx = o.x;
      o.gy = o.y;
      // Stops on the ground: taxi holds and parking (a helicopter on the ground is stopped).
      if (heli) {
        if (!o.stop) o.stop = here;
        if (Number.isFinite(o.landed) && o.t - o.stop.t >= REARM_S) o.longStop = o.stop;
      } else if (hs < 1) {
        if (!o.stop) o.stop = here;
      } else if (hs > 2 && o.stop) this.stopOver(o);
    } else if (o.state === 2 && Number.isFinite(above)) {
      // Ground contact without a landing: low and fast, then up again.
      if (above > 30) o.climbed = true;
      if (above < 3 && !o.touch && o.climbed) o.touch = here;
      else if (above > 10 && o.touch) {
        this.tell('touchdown', o, o.touch, o.touch.ref, { airfield: this.padNear(o.touch) }, 'touch and go');
        o.touch = null;
      }
    }
  }

  private stopOver(o: Obj<K, R, I>): void {
    const s = o.stop!;
    const dur = o.t - s.t;
    if (dur >= STOP_S) this.tell('stop', o, s, s.ref, { airfield: this.padNear(s) }, dur >= PARK_S ? 'parked' : 'taxi');
    if (dur >= REARM_S && Number.isFinite(o.landed)) o.longStop = s;
    o.stop = null;
  }

  /** Down: the touchdown is where its height last settled, some samples back. */
  private landing(o: Obj<K, R, I>, here: { t: number; x: number; y: number; z: number; ref: R | null }): void {
    let td = here;
    for (let i = o.ring.length - 1; i >= 0; i--) {
      if (Math.abs(o.ring[i].z - here.z) > 4) break;
      td = o.ring[i];
    }
    o.touch = null;
    o.landed = td.t;
    this.tell('landing', o, td, td.ref, { airfield: this.padNear(td) }, o.hitInAir ? 'damaged' : '');
  }

  private weaponEnd(w: Obj<K, R, I>, ref: R | null, t: number): void {
    const shell = w.kind === 'shell';
    const reach = shell ? SHELL_REACH_M : HIT_REACH_M;
    const S = Math.min(STRETCH_S, Math.max(0, t - w.t) + 0.1);
    const ex = w.x + w.vx * S;
    const ey = w.y + w.vy * S;
    const cx0 = Math.floor(Math.min(w.x, ex) / CELL) - 1;
    const cx1 = Math.floor(Math.max(w.x, ex) / CELL) + 1;
    const cy0 = Math.floor(Math.min(w.y, ey) / CELL) - 1;
    const cy1 = Math.floor(Math.max(w.y, ey) / CELL) + 1;
    let best: Obj<K, R, I> | null = null;
    let bestD = reach;
    let bestS = S;
    let groundZ = NaN;
    let groundD = Infinity;
    for (let cx = cx0; cx <= cx1; cx++)
      for (let cy = cy0; cy <= cy1; cy++) {
        const set = this.cells.get(cellKey(cx, cy));
        if (!set) continue;
        for (const u of set) {
          if (u.kind === 'pad' || u.kind === 'target') {
            const g = Math.hypot(u.x - ex, u.y - ey);
            if (g < groundD && (u.kind === 'pad' || u.state !== 2)) {
              groundD = g;
              groundZ = u.z;
            }
          }
          if (u.kind === 'pad' || u === w.shooter || u.gone < w.t - 1) continue;
          // The unit at the weapon's last sample, both moving on from there in a straight line.
          const moving = Math.abs(w.t - u.t) <= STALE_S;
          const lag = moving ? w.t - u.t : 0;
          const dx = w.x - (u.x + u.vx * lag);
          const dy = w.y - (u.y + u.vy * lag);
          const dz = w.z - (u.z + u.vz * lag);
          const rx = w.vx - (moving ? u.vx : 0);
          const ry = w.vy - (moving ? u.vy : 0);
          const rz = w.vz - (moving ? u.vz : 0);
          const rr = rx * rx + ry * ry + rz * rz;
          const s = rr > 1e-9 ? Math.min(S, Math.max(0, -(dx * rx + dy * ry + dz * rz) / rr)) : 0;
          const d = Math.hypot(dx + rx * s, dy + ry * s, dz + rz * s);
          if (d < bestD) {
            bestD = d;
            best = u;
            bestS = s;
          }
        }
      }
    const at = { t, x: w.x + w.vx * bestS, y: w.y + w.vy * bestS, z: w.z + w.vz * bestS };
    if (!best) {
      if (shell) return;
      const detail = Number.isFinite(groundZ) ? (at.z - groundZ < 50 ? 'ground' : 'air') : w.bomb ? 'ground' : '';
      this.tell('miss', w, at, ref, { shooter: w.shooter, weapon: w }, detail);
      return;
    }
    const air = best.state === 2;
    best.hits.push({ t, shooter: w.shooter, weapon: w, ref, air });
    if (best.hits.length > 8) best.hits.shift();
    if (air) best.hitInAir = true;
    this.tell('hit', w, at, ref, { shooter: w.shooter, target: best, weapon: w }, air ? 'air' : 'ground');
    this.tell('damage', best, { t, x: best.x, y: best.y, z: best.z }, null, { shooter: w.shooter, target: best, weapon: w }, air ? 'air' : 'ground');
  }

  /** A unit removed: killed by the last hit on it, crashed, or just gone. */
  private judge(u: Obj<K, R, I>): void {
    this.cells.get(u.cell)?.delete(u);
    const window = u.kind === 'target' ? KILL_WINDOW_S : AIR_WINDOW_S;
    const at = { t: u.gone, x: u.x, y: u.y, z: u.z };
    const h = u.hits[u.hits.length - 1];
    const since = h ? u.gone - h.t : Infinity;
    if (h && since <= window && !(u.kind !== 'target' && since > QUICK_S && Math.hypot(u.vx, u.vy, u.vz) < FLYING_MS)) {
      const detail = h.air ? 'shot down' : 'destroyed';
      const s = h.shooter;
      if (s) this.tell('kill', s, { t: u.gone, x: s.x, y: s.y, z: s.z }, h.ref, { shooter: s, target: u, weapon: h.weapon }, detail);
      this.tell('death', u, at, u.ref, { shooter: s, target: u, weapon: h.weapon, airfield: h.air ? null : this.padNear(u) }, detail);
      return;
    }
    if (u.kind !== 'target' && u.state === 2) {
      const above = u.z - this.groundUnder(u);
      if (u.vz < -15 || (above < 30 && Math.hypot(u.vx, u.vy) > 40)) this.tell('crash', u, at, u.ref, { target: u }, u.hitInAir ? 'damaged' : '');
    }
  }

  private cellSet(c: number): Set<Obj<K, R, I>> {
    let s = this.cells.get(c);
    if (!s) this.cells.set(c, (s = new Set()));
    return s;
  }
}
