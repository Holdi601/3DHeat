/**
 * Weapons, shots and hits in box replay, the way Tacview shows them: a
 * weapon in flight as its figure with a fading smoke trail, gunfire as tracer
 * streaks flying from the gun, an impact as a short burst, a hit as a flash
 * on the unit hit and a kill as an explosion where it died.
 *
 * What is drawn comes from the table's own rows:
 * - weapon tracks (things whose figure is a munition: kind missile, rocket,
 *   bomb, torpedo; ACMI's Weapon+Missile) - the figure is the figure layer's,
 *   the smoke behind it and the burst where its track ends are drawn here;
 * - ACMI bullets and shells (Projectile+Bullet, +Shell) as tracer streaks
 *   along their own tracks, explosions (Misc+Explosion) as fireballs;
 * - shot rows with a direction (CS2 `shot`, WoT `shot` and `tracer`, WoWs
 *   `shot` and `torpedo`) as tracers from where they were fired, out to the
 *   matching `impact` (by the `shot` column) or the weapon's range;
 * - `impact`, `explosion` and `flak` rows as bursts;
 * - hit rows on the unit hit (`hit*`, `struck`, `hurt`, `module_destroyed`)
 *   as a flash on it, and death rows as an explosion. Where the data names
 *   the attacker but has no shots (War Thunder), a short burst of tracers is
 *   drawn from the attacker to the victim, arriving at the hit - drawn DASHED,
 *   because the rounds are inferred from the hit, not read from the data;
 * - weapon releases with no flight of their own (War Thunder `launch` rows)
 *   as a bomb falling, or a rocket flying on, from the launcher's position
 *   and velocity - also inferred, drawn paler.
 *
 * Everything is at true size up close and kept to a few pixels at distance,
 * as the figures are.
 */

import type { VertexBuffer, Vec3 } from '../race/geometry';
import type { Dataset } from '../state/types';
import { CATALOG } from '../figures/catalog';
import { dataToWorld } from './pose';
import { emptySample, type MotionModel, type MotionSample } from '../figures/motion';

type Rgb = [number, number, number];

export interface WeaponView {
  /** Playhead, dataset seconds. */
  t: number;
  /** Session played back, -1 for all. */
  session: number;
  /** The camera, data space. */
  eye: Vec3;
  /** Data units one pixel covers at a point. */
  pixelSize: (x: number, y: number, z: number) => number;
  motion: MotionModel | null;
  /** A row's figure name, null for none. */
  kindOfRow: (row: number) => string | null;
  colorOfPerson: (person: number) => Rgb;
  /**
   * Where a segment from `a` along `dir` (unit) for `len` first meets the
   * level, as a distance along it; null when it does not, undefined when the
   * level cannot say yet (its index is still being built).
   */
  ground?: (a: Vec3, dir: Vec3, len: number) => number | null | undefined;
}

/** The live boxes of this frame, with the figure each got ('' none, '~projectile', '~explosion'). */
export interface LiveBoxes {
  cubes: Float32Array;
  stride: number;
  count: number;
  rows: Int32Array;
  kinds: string[];
}

const SHOT = /^(shot|shots|tracer|fire|fired|weapon_fire|bullet|gunfire)$/i;
const TORPEDO_SHOT = /^torpedo$/i;
const IMPACT = /^(impact|impacts|explosion|explode|exploded|detonation|detonate|flak|splash)$/i;
const MUZZLE = /^(gun_shot|gunshot|muzzle|muzzle_flash)$/i;
const HIT = /^(hit|hit_.*|struck|hurt|player_hurt|damaged|module_destroyed|hasbeenhitby)$/i;
const DEATH = /^(death|died|killed|destroyed|player_death|hasbeendestroyed)$/i;
const KILL = /^(kill|kills)$/i;
const LAUNCH = /^(launch|launched|release|released|drop|dropped|hasfired)$/i;
/** Weapons whose hits are not gunfire: no tracers to a hit by these. */
const EXPLOSIVE = /bomb|^de_sc|^sc_?\d|^sd_?\d|fab_?\d|an_?m\d|ofab|^m\d{2}_|rocket|^rs_?\d|^rp_|hvar|tiny_tim|torpedo|missile|aim_|^r_\d|ffar|^pc_|^ab_\d|^kh_/i;
const MS = 1;

/** Smoke white, tracer gold, the paler gold of inferred rounds, fire, dark smoke. */
const SMOKE: Rgb = [0.9, 0.9, 0.88];
const TRACER: Rgb = [1.0, 0.82, 0.32];
const TRACER_INFERRED: Rgb = [1.0, 0.86, 0.45];
const FIRE: Rgb = [1.0, 0.55, 0.15];
const FIRE_CORE: Rgb = [1.0, 0.9, 0.55];
const DARK: Rgb = [0.18, 0.17, 0.16];

interface Shot {
  /** When it was fired. */
  t: number;
  row: number;
  o: Vec3;
  dir: Vec3;
  speed: number;
  range: number;
  /**
   * Where it struck, for a row written at the hit (War Thunder: at the shooter, with the hit point):
   * the round is flown from where the shooter was when it fired.
   */
  end?: Vec3;
  person?: number;
}

interface Burst {
  t: number;
  /** A gun's muzzle flash rather than a burst. */
  flash?: boolean;
  x: number;
  y: number;
  z: number;
  /** Radius at its largest, metres. */
  r: number;
  seconds: number;
}

interface Struck {
  t: number;
  victim: number;
  attacker: number;
  kill: boolean;
  gun: boolean;
}

interface Launch {
  t: number;
  launcher: number;
  kind: 'bomb' | 'rocket' | 'torpedo' | 'missile';
  /** Worked out on first need: release point and velocity, and how long it flies. */
  p0?: Vec3;
  v0?: Vec3;
  flight?: number;
  settled?: boolean;
}

interface WeaponEnd {
  person: number;
  t: number;
  x: number;
  y: number;
  z: number;
  r: number;
}

interface Events {
  shots: Shot[];
  bursts: Burst[];
  struck: Struck[];
  launches: Launch[];
  ends: WeaponEnd[];
  longestShot: number;
}

const cache = new WeakMap<Dataset, Events>();

function category(d: Dataset, re: RegExp): { ids: Uint32Array; labels: string[] } | null {
  const a = d.attrs.find((c) => c.kind === 'category' && c.categories && re.test(c.name.trim()));
  return a ? { ids: a.data as Uint32Array, labels: a.categories! } : null;
}

function numeric(d: Dataset, re: RegExp): Float32Array | null {
  const a = d.attrs.find((c) => c.kind !== 'category' && re.test(c.name.trim()));
  return a ? (a.data as Float32Array) : null;
}

/** The unit vector a row's heading and pitch point along, null when the row has none. */
function directionOf(d: Dataset, row: number): Vec3 | null {
  if (!d.yaw) return null;
  const yaw = d.yaw[row];
  const pitch = d.pitch ? d.pitch[row] : 0;
  // A look vector of zeros comes out as exactly this (atan2(0, -0), atan2(0, 0)): no direction.
  if (Math.abs(yaw - Math.fround(Math.PI)) < 1e-7 && pitch === 0) return null;
  const c = Math.cos(pitch);
  return [Math.sin(yaw) * c, Math.sin(pitch), -Math.cos(yaw) * c];
}

/** Persons by every name they go by: the track label, its name before " #", a player column's value. */
function namesOf(d: Dataset): Map<string, number[]> {
  const out = new Map<string, number[]>();
  const add = (name: string, p: number) => {
    const k = name.trim().toLowerCase();
    if (!k) return;
    const list = out.get(k);
    if (!list) out.set(k, [p]);
    else if (list[list.length - 1] !== p && !list.includes(p)) list.push(p);
  };
  d.personLabels.forEach((l, p) => {
    add(l, p);
    const cut = l.lastIndexOf(' #');
    if (cut > 0) add(l.slice(0, cut), p);
  });
  const player = category(d, /^(player|name|pilot|unit|player.?name)$/i);
  if (player && d.personId) {
    const seen = new Uint8Array(d.personLabels.length);
    for (let r = 0; r < d.count; r++) {
      const p = d.personId[r];
      if (seen[p]) continue;
      seen[p] = 1;
      add(player.labels[player.ids[r]] ?? '', p);
    }
  }
  return out;
}

function eventsOf(d: Dataset, units: number, motion: MotionModel | null, kindOfRow: (row: number) => string | null): Events {
  let e = cache.get(d);
  if (e) return e;
  e = { shots: [], bursts: [], struck: [], launches: [], ends: [], longestShot: 0 };
  cache.set(d, e);
  const time = d.time;
  const ev = category(d, /^events?$/i);
  if (!time || !d.personId) return e;
  const pid = d.personId;

  // Weapon tracks: where each ends, a burst.
  const persons = d.personLabels.length;
  const firstRow = new Int32Array(persons).fill(-1);
  const lastRow = new Int32Array(persons).fill(-1);
  for (let r = 0; r < d.count; r++) {
    const p = pid[r];
    if (firstRow[p] < 0) firstRow[p] = r;
    lastRow[p] = r;
  }
  let weaponTracks = 0;
  for (let p = 0; p < persons; p++) {
    if (firstRow[p] < 0) continue;
    const kind = kindOfRow(firstRow[p]);
    const cls = kind ? CATALOG[kind] : null;
    if (!cls || cls.domain !== 'missile') continue;
    weaponTracks++;
    const r = lastRow[p];
    const big = /bomb/i.test(cls.cls) ? 14 : /torpedo/i.test(cls.cls) ? 10 : 6;
    e.ends.push({ person: p, t: time[r], x: d.px[r], y: d.py[r], z: d.pz[r], r: big });
  }
  e.ends.sort((a, b) => a.t - b.t);
  if (!ev) return e;

  const labels = ev.labels.map((l) => l.trim());
  const isShot = labels.map((l) => SHOT.test(l) || TORPEDO_SHOT.test(l));
  const isImpact = labels.map((l) => IMPACT.test(l));
  const isMuzzle = labels.map((l) => MUZZLE.test(l));
  const target = [numeric(d, /^target.?x$/i), numeric(d, /^target.?y$/i), numeric(d, /^target.?z$/i)];
  const isHit = labels.map((l) => HIT.test(l));
  const isDeath = labels.map((l) => DEATH.test(l));
  const isKill = labels.map((l) => KILL.test(l));
  const isLaunch = labels.map((l) => LAUNCH.test(l));
  const hasDeath = isDeath.some(Boolean);
  // WoWs writes each hit twice, at the victim (`hurt`) and the attacker (`damage`); only the victim's counts.
  const tracerIds = new Set<number>();
  const shotCol = numeric(d, /^shot$/i);
  const valueCol = numeric(d, /^(value|speed)$/i);
  const other = category(d, /^(other|attacker|killer|victim|target)$/i);
  const weapon = category(d, /^(weapon|ammo|ammunition)$/i);
  const names = other ? namesOf(d) : null;

  // Impacts by shot id, for where a shot ends.
  const impactAt = new Map<number, Vec3>();
  for (let r = 0; r < d.count; r++) {
    const id = ev.ids[r];
    if (isImpact[id]) {
      if (shotCol && Number.isFinite(shotCol[r]) && !impactAt.has(shotCol[r])) impactAt.set(shotCol[r], [d.px[r], d.py[r], d.pz[r]]);
    } else if (shotCol && /^tracer$/i.test(labels[id]) && Number.isFinite(shotCol[r])) tracerIds.add(shotCol[r]);
  }

  const who = (name: string, t: number): number => {
    const list = names?.get(name.trim().toLowerCase());
    if (!list) return -1;
    if (list.length === 1 || !motion) return list[0];
    let best = list[0];
    let bestGap = Infinity;
    for (const p of list) {
      const a = motion.start[p];
      const b = motion.start[p + 1];
      if (a >= b) continue;
      const gap = Math.max(0, motion.times[a] - t, t - motion.times[b - 1]);
      if (gap < bestGap) {
        bestGap = gap;
        best = p;
      }
    }
    return best;
  };

  for (let r = 0; r < d.count; r++) {
    const id = ev.ids[r];
    const t = time[r];
    if (isShot[id]) {
      const sid = shotCol ? shotCol[r] : NaN;
      // A WoT shot that has its tracer: the tracer is drawn.
      if (/^shot$/i.test(labels[id]) && Number.isFinite(sid) && tracerIds.has(sid)) continue;
      const end = Number.isFinite(sid) ? impactAt.get(sid) : undefined;
      const o: Vec3 = [d.px[r], d.py[r], d.pz[r]];
      let dir = directionOf(d, r);
      let range = 0;
      if (end) {
        const dx = end[0] - o[0];
        const dy = end[1] - o[1];
        const dz = end[2] - o[2];
        range = Math.hypot(dx, dy, dz);
        if (range > 1e-6) dir = [dx / range, dy / range, dz / range];
      }
      const kind = kindOfRow(r);
      const person = kind ? CATALOG[kind]?.domain === 'person' : false;
      const torpedo = TORPEDO_SHOT.test(labels[id]);
      const v = valueCol ? valueCol[r] / units : NaN;
      // A speed where the row gives one (a WoT tracer's, a WoWs shell's), else the weapon's kind.
      const speed = (Number.isFinite(v) && v > 30 && v < 3000 ? v : torpedo ? 30 : person ? 2500 : 850) * units;
      // A row at the hit, with where it struck (in the table's own frame): fired range / speed before,
      // from where the shooter was then.
      const tx = target[0] ? target[0][r] : NaN;
      if (Number.isFinite(tx) && target[1] && target[2]) {
        const w = dataToWorld({ x: tx, y: target[1][r], z: target[2][r] }, d.axes);
        const len = Math.hypot(w.x - o[0], w.y - o[1], w.z - o[2]);
        if (len > 1e-3) {
          const sp = 850 * units;
          e.shots.push({ t: t - len / sp, row: r, o, dir: [(w.x - o[0]) / len, (w.y - o[1]) / len, (w.z - o[2]) / len], speed: sp, range: len, end: [w.x, w.y, w.z], person: pid[r] });
          e.longestShot = Math.max(e.longestShot, len / sp);
          continue;
        }
      }
      if (!dir) continue;
      if (!range) range = (torpedo ? 3000 : person ? 60 : 1500) * units;
      // A person's gun is at the eye, not the feet.
      if (person) o[1] += 1.45 * units;
      e.shots.push({ t, row: r, o, dir, speed, range });
      e.longestShot = Math.max(e.longestShot, range / speed);
    } else if (isMuzzle[id]) {
      e.bursts.push({ t, x: d.px[r], y: d.py[r], z: d.pz[r], r: 1.2, seconds: 0.15, flash: true });
    } else if (isImpact[id]) {
      e.bursts.push({ t, x: d.px[r], y: d.py[r], z: d.pz[r], r: /flak/i.test(labels[id]) ? 6 : 3, seconds: 0.9 });
    } else if (isHit[id] || isDeath[id] || (!hasDeath && isKill[id])) {
      // At the victim, the attacker named; for a kill row at the killer, the other way round.
      const reversed = !hasDeath && isKill[id];
      const named = other ? who(other.labels[other.ids[r]] ?? '', t) : -1;
      const victim = reversed ? named : pid[r];
      const attacker = reversed ? pid[r] : named;
      if (victim < 0) continue;
      const w = weapon ? (weapon.labels[weapon.ids[r]] ?? '') : '';
      const last = e.struck[e.struck.length - 1];
      // The same hit written twice (War Thunder's severe and critical rows): one marker.
      if (last && last.t === t && last.victim === victim && last.kill === !isHit[id]) continue;
      e.struck.push({ t, victim, attacker, kill: !isHit[id], gun: !EXPLOSIVE.test(w) });
    } else if (isLaunch[id] && weaponTracks === 0) {
      const w = (weapon ? (weapon.labels[weapon.ids[r]] ?? '') : '').toLowerCase();
      const kind = /bomb/.test(w) ? 'bomb' : /rocket/.test(w) ? 'rocket' : /torpedo/.test(w) ? 'torpedo' : /missile/.test(w) ? 'missile' : null;
      if (kind) e.launches.push({ t, launcher: pid[r], kind });
    }
  }
  e.shots.sort((a, b) => a.t - b.t);
  return e;
}

export class WeaponLayer {
  private readonly s = emptySample();
  private readonly s2 = emptySample();
  /** Drawn last frame, for the stats line. */
  drawn = 0;

  build(d: Dataset, view: WeaponView, live: LiveBoxes, out: VertexBuffer): number {
    const units = d.entitySize ? d.entitySize / 0.8 : 1;
    const e = eventsOf(d, units, view.motion, view.kindOfRow);
    const t = view.t;
    const px = view.pixelSize;
    let n = 0;
    const inSession = (row: number) => view.session < 0 || !d.sessionId || d.sessionId[row] === view.session;

    // Weapons in flight: smoke behind them; bullets and shells as streaks; explosions as fireballs.
    const m = view.motion;
    for (let i = 0; i < live.count; i++) {
      const kind = live.kinds[i];
      if (!kind) continue;
      const row = live.rows[i];
      if (row < 0 || !d.personId) continue;
      const p = d.personId[row];
      const c = i * live.stride;
      const at: Vec3 = [live.cubes[c], live.cubes[c + 1], live.cubes[c + 2]];
      if (kind === '~projectile') {
        if (m && m.at(p, t - 0.05, view.session, this.s2)) {
          this.streak(out, [this.s2.x, this.s2.y, this.s2.z], at, view, TRACER, 0.95, 0.3 * units, 2);
          n++;
        }
        continue;
      }
      if (kind === '~explosion') {
        const r = Math.max(5 * units, 8 * px(at[0], at[1], at[2]));
        ball(out, at, r, FIRE, 0.6);
        n++;
        continue;
      }
      const cls = CATALOG[kind];
      if (!cls || cls.domain !== 'missile' || !m) continue;
      const bomb = /bomb/i.test(cls.cls);
      this.smoke(out, p, t, bomb ? 1.5 : 7, bomb ? 0.25 : 1, view, units);
      n++;
    }

    // Where weapon tracks ended: a burst.
    for (const w of e.ends) {
      if (w.t > t) break;
      const age = t - w.t;
      if (age > 2.5) continue;
      this.explosion(out, [w.x, w.y, w.z], age, w.r * units, 2.5, view);
      n++;
    }

    // Shots: the round flies from the gun at its speed, out to its impact or range.
    const shots = e.shots;
    const span = e.longestShot + 0.1;
    for (let i = lowerBound(shots, t - span); i < shots.length && shots[i].t <= t; i++) {
      let s = shots[i];
      if (!inSession(s.row)) continue;
      if (s.end && s.person !== undefined && m && m.at(s.person, s.t, view.session, this.s)) {
        // From the gun where it fired, to where the round struck.
        const o: Vec3 = [this.s.x, this.s.y, this.s.z];
        const dx = s.end[0] - o[0], dy = s.end[1] - o[1], dz = s.end[2] - o[2];
        const len = Math.hypot(dx, dy, dz);
        if (len > 1e-3) s = { ...s, o, dir: [dx / len, dy / len, dz / len], range: len };
      }
      const age = t - s.t;
      const flown = age * s.speed;
      if (flown > s.range + s.speed * 0.05) continue;
      const len = Math.min(s.range, Math.max(30 * units, s.speed * 0.035));
      const head = Math.min(s.range, flown);
      const tail = Math.max(0, head - len);
      if (head <= tail) continue;
      const a: Vec3 = [s.o[0] + s.dir[0] * tail, s.o[1] + s.dir[1] * tail, s.o[2] + s.dir[2] * tail];
      const b: Vec3 = [s.o[0] + s.dir[0] * head, s.o[1] + s.dir[1] * head, s.o[2] + s.dir[2] * head];
      this.streak(out, a, b, view, TRACER, flown > s.range ? 0.5 : 1, 0.3 * units, 3);
      n++;
    }

    for (let i = lowerBound(e.bursts, t - 1); i < e.bursts.length && e.bursts[i].t <= t; i++) {
      const b = e.bursts[i];
      if (b.flash) {
        const age = t - b.t;
        if (age > b.seconds) continue;
        const r = Math.max(b.r * units, 3 * px(b.x, b.y, b.z));
        ball(out, [b.x, b.y, b.z], r, FIRE_CORE, 0.95 * (1 - age / b.seconds));
        n++;
        continue;
      }
      this.explosion(out, [b.x, b.y, b.z], t - b.t, b.r * units, b.seconds, view);
      n++;
    }

    // Hits and kills, with inferred rounds from the attacker where the data has no shots of its own.
    const struck = e.struck;
    const inferRounds = shots.length === 0;
    for (let i = lowerBound(struck, t - 3); i < struck.length && struck[i].t <= t + 2.5; i++) {
      const h = struck[i];
      if (!m) break;
      if (inferRounds && h.gun && h.attacker >= 0 && h.attacker !== h.victim) n += this.inferredBurst(out, h, view, units);
      if (h.t > t) continue;
      const age = t - h.t;
      if (h.kill) {
        if (age > 3) continue;
        // Where it died, not where its wreck went.
        if (!m.at(h.victim, h.t, view.session, this.s)) continue;
        this.explosion(out, [this.s.x, this.s.y, this.s.z], age, 7 * units, 3, view);
        n++;
      } else {
        if (age > 0.7) continue;
        // On the unit hit, as it flies on.
        if (!m.at(h.victim, t, view.session, this.s)) continue;
        const at: Vec3 = [this.s.x, this.s.y, this.s.z];
        const r = Math.max(2.5 * units, 7 * px(at[0], at[1], at[2])) * (0.6 + age);
        ball(out, at, r, FIRE_CORE, 0.85 * (1 - age / 0.7));
        n++;
      }
    }

    // Releases with no flight in the data: a bomb falls, a rocket flies on, from the launcher's state.
    for (let i = lowerBound(e.launches, t - 60); i < e.launches.length && e.launches[i].t <= t; i++) {
      const l = e.launches[i];
      if (!m) break;
      if (!this.settle(l, view, units)) continue;
      const age = t - l.t;
      const flight = l.flight!;
      if (age > flight + 2.5) continue;
      if (age > flight) {
        const at = this.ballistic(l, flight, units);
        this.explosion(out, at, age - flight, (l.kind === 'bomb' ? 14 : 6) * units, 2.5, view);
        n++;
        continue;
      }
      const at = this.ballistic(l, age, units);
      const prev = this.ballistic(l, Math.max(0, age - (l.kind === 'bomb' ? 0.6 : 1.2)), units);
      // Drawn paler: inferred, not read.
      this.streak(out, prev, at, view, l.kind === 'bomb' ? [0.75, 0.75, 0.72] : SMOKE, 0.45, (l.kind === 'bomb' ? 0.35 : 0.8) * units, 2);
      const r = Math.max(0.4 * units, 3 * px(at[0], at[1], at[2]));
      ball(out, at, r, l.kind === 'bomb' ? [0.3, 0.3, 0.28] : FIRE_CORE, 0.8);
      n++;
    }
    this.drawn = n;
    return n;
  }

  /** Rounds from the attacker that arrive on the victim at the hit: five, 90 ms apart, dashed. */
  private inferredBurst(out: VertexBuffer, h: Struck, view: WeaponView, units: number): number {
    const m = view.motion!;
    const speed = 850 * units;
    const t = view.t;
    let n = 0;
    for (let k = 0; k < 5; k++) {
      const arrive = h.t - k * 0.09;
      if (arrive < t - 0.05) continue;
      if (!m.at(h.attacker, arrive, view.session, this.s) || !m.at(h.victim, arrive, view.session, this.s2)) return n;
      const dx = this.s2.x - this.s.x;
      const dy = this.s2.y - this.s.y;
      const dz = this.s2.z - this.s.z;
      const dist = Math.hypot(dx, dy, dz);
      if (dist > 2000 * units || dist < 1e-3) return n;
      const fired = arrive - dist / speed;
      if (t < fired) continue;
      // The gun is where the attacker was when it fired; the round goes to where the victim is when it arrives.
      if (!m.at(h.attacker, fired, view.session, this.s)) continue;
      const o: Vec3 = [this.s.x, this.s.y, this.s.z];
      const ex = this.s2.x - o[0];
      const ey = this.s2.y - o[1];
      const ez = this.s2.z - o[2];
      const len = Math.hypot(ex, ey, ez);
      const flown = Math.min(len, (t - fired) * speed);
      const streak = Math.min(len, 30 * units);
      const head = flown;
      const tail = Math.max(0, head - streak);
      const at = (s: number): Vec3 => [o[0] + (ex * s) / len, o[1] + (ey * s) / len, o[2] + (ez * s) / len];
      // Dashed: three pieces with gaps, the mark of rounds the data does not have.
      for (let j = 0; j < 3; j++) {
        const s0 = tail + ((head - tail) * j) / 3;
        const s1 = s0 + ((head - tail) / 3) * 0.55;
        this.streak(out, at(s0), at(s1), view, TRACER_INFERRED, 0.95, 0.25 * units, 2.5);
      }
      n++;
    }
    return n;
  }

  /** The launcher's position and velocity at release, and how long the weapon flies before it meets the ground. */
  private settle(l: Launch, view: WeaponView, units: number): boolean {
    if (l.settled) return true;
    const m = view.motion!;
    if (!l.p0) {
      if (!m.at(l.launcher, l.t, -1, this.s)) {
        l.settled = true;
        l.flight = 0;
        return false;
      }
      const v: Vec3 = [this.s.vx, this.s.vy, this.s.vz];
      if (l.kind === 'rocket' || l.kind === 'missile') {
        // On along the launcher's nose, some 400 m/s faster.
        const sp = Math.hypot(v[0], v[1], v[2]) || 1;
        const k = (sp + 400 * units) / sp;
        v[0] *= k;
        v[1] *= k;
        v[2] *= k;
      }
      l.p0 = [this.s.x, this.s.y, this.s.z];
      l.v0 = v;
    }
    // Step along the path until it meets the level, the data's floor at the latest.
    const floor = view.motion ? (this.floor ??= floorOf(view.motion)) : -Infinity;
    const limit = l.kind === 'bomb' ? 90 : 8;
    // A second a step for a bomb (a ray cast each against the level), a quarter for a rocket.
    const dt = l.kind === 'bomb' ? 1 : 0.25;
    let prev = this.ballistic(l, 0, units);
    let known = true;
    for (let a = dt; a <= limit; a += dt) {
      const next = this.ballistic(l, a, units);
      const dir: Vec3 = [next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]];
      const len = Math.hypot(dir[0], dir[1], dir[2]);
      if (len > 0 && view.ground) {
        const hit = view.ground(prev, [dir[0] / len, dir[1] / len, dir[2] / len], len);
        if (hit === undefined) known = false;
        else if (hit !== null) {
          l.flight = a - dt + (dt * hit) / len;
          l.settled = known;
          return true;
        }
      }
      if (next[1] < floor) {
        l.flight = a;
        l.settled = known;
        return true;
      }
      prev = next;
    }
    l.flight = limit;
    l.settled = known;
    return true;
  }

  private floor: number | undefined;

  private ballistic(l: Launch, age: number, units: number): Vec3 {
    const g = l.kind === 'bomb' || l.kind === 'torpedo' ? 9.81 * units : 0;
    return [l.p0![0] + l.v0![0] * age, l.p0![1] + l.v0![1] * age - 0.5 * g * age * age, l.p0![2] + l.v0![2] * age];
  }

  /** A fireball that grows and turns to smoke: its size at true size, or a few pixels at distance. */
  private explosion(out: VertexBuffer, at: Vec3, age: number, radius: number, seconds: number, view: WeaponView): void {
    if (age < 0 || age > seconds) return;
    const px = view.pixelSize(at[0], at[1], at[2]);
    const r = Math.max(radius, 10 * px);
    const grow = Math.min(1, age / 0.35);
    const fade = 1 - age / seconds;
    // Fire first, then smoke rising out of it.
    // A bright core inside a translucent fireball, then smoke rising out of it.
    if (age < seconds * 0.5) {
      const k = 1 - age / (seconds * 0.5);
      ball(out, at, r * (0.25 + 0.35 * grow), FIRE_CORE, 0.85 * k);
      ball(out, at, r * (0.4 + 0.6 * grow), FIRE, 0.45 * k);
    }
    const smoke: Vec3 = [at[0], at[1] + r * 0.5 * (age / seconds), at[2]];
    ball(out, smoke, r * (0.4 + 0.7 * (age / seconds)) * grow, DARK, 0.3 * fade);
  }

  /** The smoke a weapon leaves: its curve over the last `seconds`, widening and fading with age. */
  private smoke(out: VertexBuffer, person: number, t: number, seconds: number, width: number, view: WeaponView, units: number): void {
    const m = view.motion!;
    const pts: number[] = [];
    m.trail(person, t - seconds, t, 0.08, this.s2, (s, ts, join) => {
      if (!join) pts.length = 0;
      pts.push(s.x, s.y, s.z, ts);
      return true;
    });
    if (pts.length < 8) return;
    for (let i = 4; i < pts.length; i += 4) {
      const age0 = t - pts[i - 1];
      const age1 = t - pts[i + 3];
      const a: Vec3 = [pts[i - 4], pts[i - 3], pts[i - 2]];
      const b: Vec3 = [pts[i], pts[i + 1], pts[i + 2]];
      const w0 = width * units * (1 + age0 * 0.8);
      const w1 = width * units * (1 + age1 * 0.8);
      const al0 = 0.7 * Math.max(0, 1 - age0 / seconds);
      const al1 = 0.7 * Math.max(0, 1 - age1 / seconds);
      this.quad(out, a, b, w0, w1, view, SMOKE, al0, al1, 1.5);
    }
  }

  private streak(out: VertexBuffer, a: Vec3, b: Vec3, view: WeaponView, col: Rgb, alpha: number, width: number, minPx: number): void {
    this.quad(out, a, b, width, width, view, col, alpha * 0.35, alpha, minPx);
  }

  /** A band from a to b facing the camera, `wa` and `wb` wide (at least `minPx` pixels). */
  private quad(out: VertexBuffer, a: Vec3, b: Vec3, wa: number, wb: number, view: WeaponView, col: Rgb, alA: number, alB: number, minPx: number): void {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    const mx = (a[0] + b[0]) / 2 - view.eye[0];
    const my = (a[1] + b[1]) / 2 - view.eye[1];
    const mz = (a[2] + b[2]) / 2 - view.eye[2];
    let sx = dy * mz - dz * my;
    let sy = dz * mx - dx * mz;
    let sz = dx * my - dy * mx;
    const sl = Math.hypot(sx, sy, sz);
    if (sl < 1e-12) return;
    sx /= sl;
    sy /= sl;
    sz /= sl;
    const ha = Math.max(wa, minPx * view.pixelSize(a[0], a[1], a[2])) / 2;
    const hb = Math.max(wb, minPx * view.pixelSize(b[0], b[1], b[2])) / 2;
    const [r, g, bl] = col;
    const v = (x: number, y: number, z: number, al: number) => out.vertex(x, y, z, r, g, bl, al * MS);
    v(a[0] - sx * ha, a[1] - sy * ha, a[2] - sz * ha, alA);
    v(a[0] + sx * ha, a[1] + sy * ha, a[2] + sz * ha, alA);
    v(b[0] + sx * hb, b[1] + sy * hb, b[2] + sz * hb, alB);
    v(a[0] - sx * ha, a[1] - sy * ha, a[2] - sz * ha, alA);
    v(b[0] + sx * hb, b[1] + sy * hb, b[2] + sz * hb, alB);
    v(b[0] - sx * hb, b[1] - sy * hb, b[2] - sz * hb, alB);
  }
}

/** The lowest point any track reaches: what a weapon with no level under it stops at. */
function floorOf(m: MotionModel): number {
  return m.d.bounds.minY;
}

function lowerBound<T extends { t: number }>(a: T[], t: number): number {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** A ball of `r` around `c`, lit from above, the colour fading to `alpha`. */
const LAT = 7;
const LON = 12;
const UNIT: Vec3[] = [];
for (let i = 0; i <= LAT; i++) {
  const th = (Math.PI * i) / LAT;
  for (let j = 0; j <= LON; j++) {
    const ph = (2 * Math.PI * j) / LON;
    UNIT.push([Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)]);
  }
}
export function ball(out: VertexBuffer, c: Vec3, r: number, col: Rgb, alpha: number): void {
  if (alpha <= 0.01) return;
  const v = (k: number) => {
    const u = UNIT[k];
    const light = 0.75 + 0.25 * u[1];
    out.vertex(c[0] + u[0] * r, c[1] + u[1] * r, c[2] + u[2] * r, Math.min(1, col[0] * light), Math.min(1, col[1] * light), Math.min(1, col[2] * light), alpha);
  };
  for (let i = 0; i < LAT; i++) {
    for (let j = 0; j < LON; j++) {
      const a = i * (LON + 1) + j;
      const b = a + LON + 1;
      v(a);
      v(b);
      v(a + 1);
      v(a + 1);
      v(b);
      v(b + 1);
    }
  }
}

export type { MotionSample };
