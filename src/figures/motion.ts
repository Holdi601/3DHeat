/**
 * How a tracked thing moves between its samples, for box replay: along a
 * smooth curve through the samples rather than a straight line from each to
 * the next, turned by the shortest arc from one attitude to the next.
 *
 * Positions: a cubic Hermite curve through the samples, in time, its velocity
 * at each sample the three-point estimate from its neighbours. The curve
 * passes through every kept sample, so nothing real is moved; between two it
 * has no corner, so a track sampled four times a second no longer kinks at
 * every sample. A tangent is held to one and a half times the step it leads
 * into, so a sample that stops or jumps cannot throw a loop.
 *
 * Samples that are not where the thing was are left out:
 * - event rows of things it fired (a shot, a tracer, an impact far away) when
 *   the data has position rows to go by;
 * - a client's dead reckoning. A game client that hears nothing from a distant
 *   unit moves it on in a straight line at its last speed and turning at its
 *   last roll rate, then snaps it to where the next update says it was - a
 *   War Thunder replay records just that, 5 to 75 m snaps after runs of exactly
 *   straight, exactly even steps. The run's own samples are dropped and the
 *   curve goes from the update before to the update after.
 *
 * Attitude: each kept sample's heading, pitch and roll as a rotation, and
 * between two samples the rotation along the shortest arc (slerp), so a roll
 * across 180 degrees turns the short way and nothing spins. Fast movers - over
 * about 35 m/s, aircraft and missiles - point their nose along the curve's
 * velocity and keep their data's roll about it: an attitude that comes in
 * bursts (the same heading four samples running, then a jump) cannot then
 * swing the nose away from where the thing is going.
 *
 * Roll's sign is measured, not assumed: in a turn an aircraft banks into the
 * turn, so when most samples in clear turns roll the other way the data's roll
 * counts the other way round (War Thunder's) and is turned over.
 */

import type { Dataset } from '../state/types';
import type { Frame3, Vec3 } from '../race/geometry';
import { poseFrame } from './kit';

/** Above this many rows nothing is precomputed: the cursor's straight lines are used. */
const ROW_LIMIT = 8_000_000;
/** Event labels whose rows are positions of the thing itself. */
const POSITION_EVENT = /^(position|pos|move|moved|sample|state|tick|update|spawn|spawned|alive)?$/i;
/** Event labels whose rows are somewhere else: what was fired, where it struck. */
const ELSEWHERE_EVENT = /^(shot|shots|tracer|impact|impacts|torpedo|explosion|flak|projectile|bullet|shell|weapon_fire|fire|fired)$/i;

export interface MotionSample {
  x: number;
  y: number;
  z: number;
  /** Velocity, data units a second. */
  vx: number;
  vy: number;
  vz: number;
  /** Attitude as a rotation from the figure frame (x forward, y up, z right), when the data has one. */
  q: [number, number, number, number];
  hasAttitude: boolean;
}

/**
 * Which rows are a thing's own positions, by the event column: per event
 * label 1 or 0 (`own`), and the column's ids; both null when the data has no
 * event column and every row counts.
 */
export function positionRows(d: Dataset): { own: Uint8Array | null; ids: Uint32Array | null } {
  const ev = d.attrs.find((a) => a.kind === 'category' && a.categories && /^events?$/i.test(a.name.trim()));
  if (!ev) return { own: null, ids: null };
  const labels = ev.categories!.map((c) => c.trim());
  const hasPositions = labels.some((l) => /^(position|pos|move|sample|state|tick)$/i.test(l));
  const ok = labels.map((l) => (hasPositions ? POSITION_EVENT.test(l) : !ELSEWHERE_EVENT.test(l)));
  return { own: Uint8Array.from(ok, (v) => (v ? 1 : 0)), ids: ev.data as Uint32Array };
}

export function emptySample(): MotionSample {
  return { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, q: [0, 0, 0, 1], hasAttitude: false };
}

const cache = new WeakMap<Dataset, MotionModel | null>();

export class MotionModel {
  /** Kept sample rows, grouped by person, in time order within each. */
  readonly knots: Int32Array;
  /** Per person, where its knots start; `start[p + 1]` is where they end. */
  readonly start: Int32Array;
  /** Knot times, a copy for the binary search. */
  readonly times: Float64Array;
  /** 1 where the curve does not go on to the next knot (another session, a shared name, the end). */
  readonly end: Uint8Array;
  /** Velocity at each knot, data units a second. */
  readonly vel: Float32Array;
  /** Attitude at each knot, x y z w; null without a heading in the data. */
  readonly quat: Float32Array | null;
  /** -1 when the data's roll counts left wing down. */
  readonly rollSign: number;
  /** How many samples were left out as dead reckoning. */
  readonly reckoned: number;
  /** How many samples were left out for jumping off the track and back. */
  readonly outliers: number;
  /** How many samples' attitudes were put between their neighbours' as glitches. */
  readonly glitches: number;
  /** Data units in a metre. */
  readonly units: number;
  /** Per person, when the same unit goes on as another track (Infinity: it does not). */
  readonly next: Float64Array;
  /** Whether the rows say which are positions (an event column): a person with none is no moving thing. */
  readonly hasEvents: boolean;

  static of(d: Dataset): MotionModel | null {
    if (cache.has(d)) return cache.get(d)!;
    const m = d.time && d.personId && d.count > 1 && d.count <= ROW_LIMIT ? new MotionModel(d) : null;
    cache.set(d, m);
    return m;
  }

  constructor(readonly d: Dataset) {
    const { time, personId, px, py, pz, count } = d;
    const t = time!;
    const pid = personId!;
    this.units = d.entitySize ? d.entitySize / 0.8 : 1;
    const persons = Math.max(1, d.personLabels.length);

    // Which rows are the thing's own positions.
    const { own, ids } = positionRows(d);
    this.hasEvents = !!own;
    const take = (r: number) => (!own || own[ids![r]] === 1) && Number.isFinite(px[r]) && Number.isFinite(t[r]);

    // Rows per person, in time order (the rows are in time order already).
    const counts = new Int32Array(persons + 1);
    for (let r = 0; r < count; r++) if (take(r)) counts[pid[r] + 1]++;
    for (let p = 0; p < persons; p++) counts[p + 1] += counts[p];
    const raw = new Int32Array(counts[persons]);
    const fill = counts.slice(0, persons);
    for (let r = 0; r < count; r++) if (take(r)) raw[fill[pid[r]]++] = r;

    // Drop samples at the same time as the one before (a re-timed or doubled row), and dead reckoning.
    const keep = new Uint8Array(raw.length);
    const eps = 0.03 * this.units;
    const moving = 0.5 * this.units;
    let reckoned = 0;
    const session = d.sessionId;
    // A converter that knows which samples were the client's guesses says so.
    const guessCol = d.attrs.find((a) => a.kind !== 'category' && /^extrapolated$/i.test(a.name.trim()));
    const guessed = guessCol ? (guessCol.data as Float32Array) : null;
    for (let p = 0; p < persons; p++) {
      const a = counts[p];
      const b = counts[p + 1];
      let last = -1;
      for (let k = a; k < b; k++) {
        const r = raw[k];
        if (last >= 0 && t[r] - t[last] < 1e-3 && (!session || session[r] === session[last])) continue;
        keep[k] = guessed && guessed[r] > 0.5 ? 2 : 1;
        if (keep[k] === 2) reckoned++;
        last = r;
      }
      // Runs of exactly straight, exactly even steps: k is inside one when k-1, k, k+1 are on one line
      // at one speed. Its samples after the first are the client's guesses; the first is the update.
      let prev2 = -1;
      let prev1 = -1;
      let inRun = false;
      for (let k = guessed ? b : a; k < b; k++) {
        if (!keep[k]) continue;
        const r = raw[k];
        if (prev2 >= 0) {
          const r1 = raw[prev1];
          const r0 = raw[prev2];
          const h0 = t[r1] - t[r0];
          const h1 = t[r] - t[r1];
          const sx = px[r1] - px[r0];
          const sy = py[r1] - py[r0];
          const sz = pz[r1] - pz[r0];
          const even = Math.abs(h0 - h1) < 0.02 * Math.max(h0, h1);
          const k1 = h1 / h0;
          const ex = px[r] - px[r1] - sx * k1;
          const ey = py[r] - py[r1] - sy * k1;
          const ez = pz[r] - pz[r1] - sz * k1;
          const straight = even && Math.hypot(ex, ey, ez) < eps && Math.hypot(sx, sy, sz) > moving * h0;
          const same = !session || (session[r] === session[r1] && session[r1] === session[raw[prev2]]);
          if (straight && same) {
            // prev1 and this one are guesses; prev2 (the run's first) is the update.
            if (keep[prev1] === 1) {
              keep[prev1] = 2;
              reckoned++;
            }
            keep[k] = 2;
            reckoned++;
            inRun = true;
          } else if (inRun) {
            inRun = false;
          }
        }
        prev2 = prev1;
        prev1 = k;
      }
    }
    // The last sample of a track is kept even if it was a guess, so the track does not end early.
    for (let p = 0; p < persons; p++) {
      for (let k = counts[p + 1] - 1; k >= counts[p]; k--) {
        if (keep[k] === 0) continue;
        if (keep[k] === 2) {
          keep[k] = 1;
          reckoned--;
        }
        break;
      }
    }
    this.reckoned = reckoned;

    // Samples that jump off the track and back: a fast mover's position more than a few metres off the
    // curve its neighbours either side describe (War Thunder's received samples now and then step
    // 30 m back along the track for one sample). Left out; the curve goes from the one before to the one after.
    let outliers = 0;
    const fastMover = 30 * this.units;
    const lim = 6 * this.units;
    const list: number[] = [];
    for (let p = 0; p < persons; p++) {
      list.length = 0;
      for (let k = counts[p]; k < counts[p + 1]; k++) if (keep[k] === 1) list.push(k);
      const devs = new Float64Array(list.length);
      for (let j = 2; j + 2 < list.length; j++) {
        const [r0, r1, r, r3, r4] = [raw[list[j - 2]], raw[list[j - 1]], raw[list[j]], raw[list[j + 1]], raw[list[j + 2]]];
        if (session && (session[r0] !== session[r4])) continue;
        const h = t[r3] - t[r1];
        const ha = t[r1] - t[r0];
        const hb = t[r4] - t[r3];
        if (!(h > 0 && ha > 0 && hb > 0) || h > 3) continue;
        const chord = Math.hypot(px[r3] - px[r1], py[r3] - py[r1], pz[r3] - pz[r1]);
        if (chord / h < fastMover) continue;
        // The curve from r1 to r3 with the tangents of the steps outside them, at r's time.
        const s = (t[r] - t[r1]) / h;
        const s2 = s * s;
        const s3 = s2 * s;
        const h00 = 2 * s3 - 3 * s2 + 1;
        const h10 = s3 - 2 * s2 + s;
        const h01 = -2 * s3 + 3 * s2;
        const h11 = s3 - s2;
        const pred = (a: Float32Array) => h00 * a[r1] + h10 * ((a[r1] - a[r0]) / ha) * h + h01 * a[r3] + h11 * ((a[r4] - a[r3]) / hb) * h;
        const dev = Math.hypot(px[r] - pred(px), py[r] - pred(py), pz[r] - pred(pz));
        devs[j] = dev / Math.max(lim, 0.25 * chord);
      }
      // The worst of neighbours that all look off: one bad sample bends the prediction for those beside it.
      for (let j = 2; j + 2 < list.length; j++) {
        if (devs[j] > 1 && devs[j] >= devs[j - 1] && devs[j] >= devs[j + 1]) {
          keep[list[j]] = 3;
          outliers++;
        }
      }
    }
    this.outliers = outliers;

    const start = new Int32Array(persons + 1);
    let n = 0;
    for (let p = 0; p < persons; p++) {
      start[p] = n;
      for (let k = counts[p]; k < counts[p + 1]; k++) if (keep[k] === 1) n++;
    }
    start[persons] = n;
    const knots = new Int32Array(n);
    n = 0;
    for (let k = 0; k < raw.length; k++) if (keep[k] === 1) knots[n++] = raw[k];
    this.knots = knots;
    this.start = start;
    const times = new Float64Array(n);
    for (let k = 0; k < n; k++) times[k] = t[knots[k]];
    this.times = times;

    const end = new Uint8Array(n);
    const shared = d.personShared;
    for (let p = 0; p < persons; p++) {
      const a = start[p];
      const b = start[p + 1];
      for (let k = a; k < b; k++) {
        const last = k === b - 1;
        end[k] = last || (shared && shared[p]) || (session && session[knots[k]] !== session[knots[k + 1]]) ? 1 : 0;
      }
    }
    this.end = end;

    // Velocity at each knot: the three-point estimate where both neighbours join, else the one step there is.
    const vel = new Float32Array(n * 3);
    for (let k = 0; k < n; k++) {
      const r = knots[k];
      const before = k > 0 && !end[k - 1] && pid[knots[k - 1]] === pid[r];
      const after = !end[k];
      let vx = 0;
      let vy = 0;
      let vz = 0;
      if (before && after) {
        const r0 = knots[k - 1];
        const r2 = knots[k + 1];
        const h0 = times[k] - times[k - 1];
        const h1 = times[k + 1] - times[k];
        const w0 = h1 / (h0 + h1);
        const w1 = h0 / (h0 + h1);
        vx = ((px[r] - px[r0]) / h0) * w0 + ((px[r2] - px[r]) / h1) * w1;
        vy = ((py[r] - py[r0]) / h0) * w0 + ((py[r2] - py[r]) / h1) * w1;
        vz = ((pz[r] - pz[r0]) / h0) * w0 + ((pz[r2] - pz[r]) / h1) * w1;
      } else if (after) {
        const r2 = knots[k + 1];
        const h = times[k + 1] - times[k];
        vx = (px[r2] - px[r]) / h;
        vy = (py[r2] - py[r]) / h;
        vz = (pz[r2] - pz[r]) / h;
      } else if (before) {
        const r0 = knots[k - 1];
        const h = times[k] - times[k - 1];
        vx = (px[r] - px[r0]) / h;
        vy = (py[r] - py[r0]) / h;
        vz = (pz[r] - pz[r0]) / h;
      }
      vel[k * 3] = vx;
      vel[k * 3 + 1] = vy;
      vel[k * 3 + 2] = vz;
    }
    this.vel = vel;

    // When the same unit goes on as another track (a converter cuts a unit's life into tracks), the
    // track before ends there: it is not held at its last place beside its successor.
    const next = new Float64Array(persons).fill(Infinity);
    const unitCol = d.attrs.find((a) => a.kind === 'category' && a.categories && /^(player|unit|unit.?id)$/i.test(a.name.trim()));
    if (unitCol) {
      const ids = unitCol.data as Uint32Array;
      const groups = new Map<number, number[]>();
      for (let p = 0; p < persons; p++) {
        if (start[p] >= start[p + 1]) continue;
        const key = ids[knots[start[p]]];
        if (!unitCol.categories![key]) continue;
        const g = groups.get(key);
        if (g) g.push(p);
        else groups.set(key, [p]);
      }
      for (const g of groups.values()) {
        if (g.length < 2) continue;
        g.sort((a, b) => times[start[a]] - times[start[b]]);
        for (let i = 0; i + 1 < g.length; i++) {
          const last = times[start[g[i] + 1] - 1];
          for (let j = i + 1; j < g.length; j++) {
            const first = times[start[g[j]]];
            if (first >= last - 0.5) {
              next[g[i]] = Math.max(first, last);
              break;
            }
          }
        }
      }
    }
    this.next = next;

    const rollCol = d.attrs.find((a) => a.kind !== 'category' && /^roll$/i.test(a.name.trim()));
    const roll = rollCol ? (rollCol.data as Float32Array) : null;
    this.rollSign = roll ? rollSignOf(this, roll) : 1;

    let glitches = 0;
    if (d.yaw) {
      const quat = new Float32Array(n * 4);
      const q: [number, number, number, number] = [0, 0, 0, 1];
      for (let k = 0; k < n; k++) {
        const r = knots[k];
        const rl = roll ? (roll[r] * Math.PI) / 180 : 0;
        const fr = poseFrame({ x: 0, y: 0, z: 0, yaw: Math.PI - d.yaw[r], pitch: d.pitch ? d.pitch[r] || 0 : 0, roll: Number.isFinite(rl) ? this.rollSign * rl : 0 });
        quatOfFrame(fr, q);
        // Keep each knot on the same side as the one before, so a slerp between them takes the short arc.
        if (k > 0 && pid[knots[k - 1]] === pid[r]) {
          const o = (k - 1) * 4;
          if (quat[o] * q[0] + quat[o + 1] * q[1] + quat[o + 2] * q[2] + quat[o + 3] * q[3] < 0) for (let i = 0; i < 4; i++) q[i] = -q[i];
        }
        quat.set(q, k * 4);
      }
      // One sample's attitude far off the way between its neighbours, turned to it faster than any
      // aircraft rolls (400 deg/s): a glitch (a roll of -38, -172, -118), put between them.
      const angle = (a: number, b: number) => 2 * Math.acos(Math.min(1, Math.abs(quat[a] * quat[b] + quat[a + 1] * quat[b + 1] + quat[a + 2] * quat[b + 2] + quat[a + 3] * quat[b + 3])));
      const fastest = (400 * Math.PI) / 180;
      const off = (60 * Math.PI) / 180;
      const mid = new Float32Array(4);
      for (let k = 1; k + 1 < n; k++) {
        if (end[k - 1] || end[k]) continue;
        const a = (k - 1) * 4;
        const b = k * 4;
        const c = (k + 1) * 4;
        const h0 = times[k] - times[k - 1];
        const h1 = times[k + 1] - times[k];
        if (!(angle(a, b) / h0 > fastest || angle(b, c) / h1 > fastest)) continue;
        slerp(quat, a, c, h0 / (h0 + h1), q);
        mid.set(q);
        const dev = 2 * Math.acos(Math.min(1, Math.abs(mid[0] * quat[b] + mid[1] * quat[b + 1] + mid[2] * quat[b + 2] + mid[3] * quat[b + 3])));
        if (dev < off) continue;
        const sign = quat[a] * q[0] + quat[a + 1] * q[1] + quat[a + 2] * q[2] + quat[a + 3] * q[3] < 0 ? -1 : 1;
        for (let i = 0; i < 4; i++) quat[b + i] = sign * q[i];
        glitches++;
      }
      this.quat = quat;
    } else this.quat = null;
    this.glitches = glitches;
  }

  /** The person's last knot at or before `t`, or -1 when it has none yet. */
  knotAt(p: number, t: number): number {
    let lo = this.start[p];
    let hi = this.start[p + 1];
    if (lo >= hi || this.times[lo] > t) return -1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.times[mid] <= t) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  /**
   * Where person `p` is at `t`, on the curve, and how it is turned; false when
   * it has no knot by then, or (with `session` >= 0) its knot is another
   * session's.
   */
  at(p: number, t: number, session: number, out: MotionSample): boolean {
    const k = this.knotAt(p, t);
    if (k < 0) return false;
    const d = this.d;
    if (session >= 0 && d.sessionId && d.sessionId[this.knots[k]] !== session) return false;
    this.evaluate(k, t, out);
    return true;
  }

  /** The curve at `t` from knot `k` (held at `k` when the curve does not go on). */
  evaluate(k: number, t: number, out: MotionSample): void {
    const { px, py, pz } = this.d;
    const r0 = this.knots[k];
    const vel = this.vel;
    if (this.end[k] || t <= this.times[k]) {
      out.x = px[r0];
      out.y = py[r0];
      out.z = pz[r0];
      out.vx = vel[k * 3];
      out.vy = vel[k * 3 + 1];
      out.vz = vel[k * 3 + 2];
      this.attitude(k, k, 0, out);
      return;
    }
    const r1 = this.knots[k + 1];
    const h = this.times[k + 1] - this.times[k];
    const s = Math.min(1, (t - this.times[k]) / h);
    const cx = px[r1] - px[r0];
    const cy = py[r1] - py[r0];
    const cz = pz[r1] - pz[r0];
    const chord = Math.hypot(cx, cy, cz);
    // Tangents, in units of the step, held to 1.5 chords.
    let m0x = vel[k * 3] * h;
    let m0y = vel[k * 3 + 1] * h;
    let m0z = vel[k * 3 + 2] * h;
    let m1x = vel[k * 3 + 3] * h;
    let m1y = vel[k * 3 + 4] * h;
    let m1z = vel[k * 3 + 5] * h;
    const l0 = Math.hypot(m0x, m0y, m0z);
    const l1 = Math.hypot(m1x, m1y, m1z);
    const cap = 1.5 * chord;
    if (l0 > cap) {
      const f = cap / l0;
      m0x *= f;
      m0y *= f;
      m0z *= f;
    }
    if (l1 > cap) {
      const f = cap / l1;
      m1x *= f;
      m1y *= f;
      m1z *= f;
    }
    const s2 = s * s;
    const s3 = s2 * s;
    const h00 = 2 * s3 - 3 * s2 + 1;
    const h10 = s3 - 2 * s2 + s;
    const h01 = -2 * s3 + 3 * s2;
    const h11 = s3 - s2;
    out.x = h00 * px[r0] + h10 * m0x + h01 * px[r1] + h11 * m1x;
    out.y = h00 * py[r0] + h10 * m0y + h01 * py[r1] + h11 * m1y;
    out.z = h00 * pz[r0] + h10 * m0z + h01 * pz[r1] + h11 * m1z;
    const d00 = 6 * s2 - 6 * s;
    const d10 = 3 * s2 - 4 * s + 1;
    const d11 = 3 * s2 - 2 * s;
    out.vx = (d00 * -cx + d10 * m0x + d11 * m1x) / h;
    out.vy = (d00 * -cy + d10 * m0y + d11 * m1y) / h;
    out.vz = (d00 * -cz + d10 * m0z + d11 * m1z) / h;
    this.attitude(k, k + 1, s, out);
  }

  /**
   * The curve of person `p` from `from` to `to`, as points `step` seconds or
   * less apart and on every kept sample, in time order; `emit` returns false
   * to stop. A break in the track (another session, a gap the track does not
   * cross) starts a new piece: `emit`'s `join` is false for its first point.
   */
  trail(p: number, from: number, to: number, step: number, out: MotionSample, emit: (s: MotionSample, t: number, join: boolean) => boolean): void {
    const a = this.start[p];
    const b = this.start[p + 1];
    if (a >= b || to < this.times[a]) return;
    let k = this.knotAt(p, from);
    let t = from;
    if (k < 0) {
      k = a;
      t = this.times[a];
    }
    let join = false;
    while (k < b && t <= to) {
      if (this.end[k]) {
        // The track does not go on from here: its last point, if a piece did not just end on it.
        if (!join) {
          this.evaluate(k, this.times[k], out);
          if (!emit(out, this.times[k], false)) return;
        }
        join = false;
        k++;
        if (k < b) t = this.times[k];
        continue;
      }
      const t1 = Math.min(to, this.times[k + 1]);
      const n = Math.min(32, Math.max(1, Math.ceil((t1 - t) / step)));
      for (let i = 0; i <= n; i++) {
        if (i === 0 && join) continue;
        const ti = t + ((t1 - t) * i) / n;
        this.evaluate(k, ti, out);
        if (!emit(out, ti, i > 0 || join)) return;
      }
      join = true;
      if (t1 >= to) return;
      k++;
      t = this.times[k];
    }
  }

  private attitude(a: number, b: number, s: number, out: MotionSample): void {
    const q = this.quat;
    if (!q) {
      out.hasAttitude = false;
      return;
    }
    out.hasAttitude = true;
    slerp(q, a * 4, b * 4, s, out.q);
  }
}

/**
 * +1 when the data's roll is right wing down, -1 when it counts the other way:
 * in samples that are clearly turning, at speed, with a clear bank, whether the
 * bank is into the turn. Too few such samples: +1.
 */
function rollSignOf(m: MotionModel, roll: Float32Array): number {
  const { knots, vel, end } = m;
  const fast = 40 * m.units;
  let agree = 0;
  let n = 0;
  for (let k = 1; k + 1 < knots.length; k++) {
    if (end[k - 1] || end[k]) continue;
    const r = knots[k];
    const rl = roll[r];
    if (!(Math.abs(rl) > 25 && Math.abs(rl) < 85)) continue;
    const vx = vel[k * 3];
    const vz = vel[k * 3 + 2];
    const sp = Math.hypot(vx, vz);
    if (sp < fast) continue;
    // Turn rate from the velocities either side: + is clockwise seen from above, the right-hand turn in this world.
    const ax = vel[(k - 1) * 3];
    const az = vel[(k - 1) * 3 + 2];
    const bx = vel[(k + 1) * 3];
    const bz = vel[(k + 1) * 3 + 2];
    const dt = m.times[k + 1] - m.times[k - 1];
    const turn = Math.atan2(ax * bz - az * bx, ax * bx + az * bz);
    // With forward (sin y, -cos y) and right (cos y, sin y), a right turn makes a.x b.z - a.z b.x positive.
    const rate = (turn / dt) * (180 / Math.PI);
    if (Math.abs(rate) < 6) continue;
    n++;
    if (Math.sign(rate) === Math.sign(rl)) agree++;
  }
  return n >= 40 && agree / n < 0.3 ? -1 : 1;
}

/** The rotation taking the figure frame (x forward, y up, z right) to `fr`, as x y z w. */
export function quatOfFrame(fr: Frame3, out: [number, number, number, number]): void {
  // Columns: local x -> f, local y -> u, local z -> r.
  const m00 = fr.f[0], m01 = fr.u[0], m02 = fr.r[0];
  const m10 = fr.f[1], m11 = fr.u[1], m12 = fr.r[1];
  const m20 = fr.f[2], m21 = fr.u[2], m22 = fr.r[2];
  const tr = m00 + m11 + m22;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    out[3] = 0.25 * s;
    out[0] = (m21 - m12) / s;
    out[1] = (m02 - m20) / s;
    out[2] = (m10 - m01) / s;
  } else if (m00 > m11 && m00 > m22) {
    const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
    out[3] = (m21 - m12) / s;
    out[0] = 0.25 * s;
    out[1] = (m01 + m10) / s;
    out[2] = (m02 + m20) / s;
  } else if (m11 > m22) {
    const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
    out[3] = (m02 - m20) / s;
    out[0] = (m01 + m10) / s;
    out[1] = 0.25 * s;
    out[2] = (m12 + m21) / s;
  } else {
    const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
    out[3] = (m10 - m01) / s;
    out[0] = (m02 + m20) / s;
    out[1] = (m12 + m21) / s;
    out[2] = 0.25 * s;
  }
}

/** Rotates `v` by the quaternion `q`. */
export function rotate(q: ArrayLike<number>, v: Vec3): Vec3 {
  const [x, y, z, w] = [q[0], q[1], q[2], q[3]];
  // t = 2 q.xyz x v; v' = v + w t + q.xyz x t
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  return [v[0] + w * tx + (y * tz - z * ty), v[1] + w * ty + (z * tx - x * tz), v[2] + w * tz + (x * ty - y * tx)];
}

/** The frame a quaternion turns the figure frame into, at `o`. */
export function frameOfQuat(q: ArrayLike<number>, o: Vec3): Frame3 {
  return { o, f: rotate(q, [1, 0, 0]), u: rotate(q, [0, 1, 0]), r: rotate(q, [0, 0, 1]) };
}

/** Shortest-arc slerp between quaternions at offsets `a` and `b` of `q`. */
function slerp(q: Float32Array, a: number, b: number, s: number, out: [number, number, number, number]): void {
  let bx = q[b], by = q[b + 1], bz = q[b + 2], bw = q[b + 3];
  const ax = q[a], ay = q[a + 1], az = q[a + 2], aw = q[a + 3];
  let cos = ax * bx + ay * by + az * bz + aw * bw;
  if (cos < 0) {
    cos = -cos;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  let k0: number;
  let k1: number;
  if (s <= 0 || a === b) {
    k0 = 1;
    k1 = 0;
  } else if (cos > 0.9995) {
    k0 = 1 - s;
    k1 = s;
  } else {
    const th = Math.acos(cos);
    const sn = Math.sin(th);
    k0 = Math.sin((1 - s) * th) / sn;
    k1 = Math.sin(s * th) / sn;
  }
  const x = ax * k0 + bx * k1;
  const y = ay * k0 + by * k1;
  const z = az * k0 + bz * k1;
  const w = aw * k0 + bw * k1;
  const l = Math.hypot(x, y, z, w) || 1;
  out[0] = x / l;
  out[1] = y / l;
  out[2] = z / l;
  out[3] = w / l;
}

/**
 * Turns `q` by the least rotation that puts its forward axis along `dir`
 * (a unit vector), keeping its roll about it.
 */
export function alignNose(q: [number, number, number, number], dir: Vec3, weight: number): void {
  if (weight <= 0) return;
  const f = rotate(q, [1, 0, 0]);
  const c = f[0] * dir[0] + f[1] * dir[1] + f[2] * dir[2];
  // Axis f x dir, angle acos(c), scaled by the weight.
  let ax = f[1] * dir[2] - f[2] * dir[1];
  let ay = f[2] * dir[0] - f[0] * dir[2];
  let az = f[0] * dir[1] - f[1] * dir[0];
  const sn = Math.hypot(ax, ay, az);
  if (sn < 1e-6) return;
  ax /= sn;
  ay /= sn;
  az /= sn;
  const angle = Math.atan2(sn, c) * Math.min(1, weight);
  const h = angle / 2;
  const s = Math.sin(h);
  const rx = ax * s, ry = ay * s, rz = az * s, rw = Math.cos(h);
  // r * q
  const [qx, qy, qz, qw] = q;
  q[0] = rw * qx + rx * qw + ry * qz - rz * qy;
  q[1] = rw * qy - rx * qz + ry * qw + rz * qx;
  q[2] = rw * qz + rx * qy - ry * qx + rz * qw;
  q[3] = rw * qw - rx * qx - ry * qy - rz * qz;
}

/** The weight a speed (data units a second) gives the velocity over the data's heading: 0 below 25 m/s, 1 above 40. */
export function noseWeight(speed: number, units: number): number {
  const v = speed / units;
  if (v <= 25) return 0;
  if (v >= 40) return 1;
  const x = (v - 25) / 15;
  return x * x * (3 - 2 * x);
}

/**
 * Puts the cursor's live boxes on their curves: rewrites each box's position,
 * heading and pitch (x, y, z, ..., yaw, pitch in the cube layout) and keeps
 * its attitude in `poses` (x y z w a box, `posed` 1 where it has one) for the
 * figures. A box the model has nothing for keeps the cursor's straight line.
 */
export class MotionRefiner {
  poses = new Float32Array(0);
  posed = new Uint8Array(0);
  /** How many boxes are left after the last refine. */
  count = 0;
  private readonly s = emptySample();

  refine(d: Dataset, cubes: Float32Array, stride: number, count: number, rows: Int32Array, t: number, session: number): MotionModel | null {
    if (this.posed.length < count) {
      this.poses = new Float32Array(Math.max(count, 64) * 4);
      this.posed = new Uint8Array(Math.max(count, 64));
    }
    this.posed.fill(0, 0, count);
    this.count = count;
    const m = MotionModel.of(d);
    if (!m || !d.personId) return m;
    const s = this.s;
    // A "track" with no position of its own - a converter's row of moments (explosions, flak) under one
    // empty name - is not a thing that moves: its box is left out.
    let w = 0;
    for (let r = 0; r < count; r++) {
      const row = rows[r];
      const p = row >= 0 ? d.personId[row] : -1;
      if (p >= 0 && m.hasEvents && m.start[p] === m.start[p + 1]) continue;
      // Over and gone on as another track of the same unit.
      if (p >= 0 && t >= m.next[p]) continue;
      if (w !== r) {
        cubes.copyWithin(w * stride, r * stride, r * stride + stride);
        rows[w] = row;
      }
      w++;
    }
    count = w;
    this.count = w;
    for (let i = 0; i < count; i++) {
      const row = rows[i];
      if (row < 0) continue;
      const p = d.personId[row];
      if (d.personShared && d.personShared[p]) continue;
      if (!m.at(p, t, session, s)) continue;
      const c = i * stride;
      cubes[c] = s.x;
      cubes[c + 1] = s.y;
      cubes[c + 2] = s.z;
      const speed = Math.hypot(s.vx, s.vy, s.vz);
      if (s.hasAttitude) {
        const w = noseWeight(speed, m.units);
        if (w > 0) alignNose(s.q, [s.vx / speed, s.vy / speed, s.vz / speed], w);
        this.poses.set(s.q, i * 4);
        this.posed[i] = 1;
        const f = rotate(s.q, [1, 0, 0]);
        cubes[c + 6] = Math.atan2(f[0], -f[2]);
        cubes[c + 7] = Math.asin(Math.max(-1, Math.min(1, f[1])));
      } else if (!d.yaw && speed > 0.2 * m.units) {
        // No heading in the data: the way the curve goes.
        cubes[c + 6] = Math.atan2(s.vx, -s.vz);
        cubes[c + 7] = speed > 25 * m.units ? Math.asin(Math.max(-1, Math.min(1, s.vy / speed))) : 0;
      }
    }
    return m;
  }
}
