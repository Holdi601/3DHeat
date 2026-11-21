/**
 * Engagements: who fought whom, from when to when - the exchanges of fire
 * between two tracks, read from the recording's events, for the tactical
 * display's engagement lines.
 *
 * An exchange is the contact events (fire, launch, hit, damage, kill, death)
 * of one pair of tracks, one naming the other (the other-party column; a
 * weapon's row counts for whoever launched it), with no gap longer than
 * `GAP_S` between them. A track is one life: a respawn is a new track, so an
 * exchange never spans one. Its line is shown from `before` seconds ahead of
 * the first contact to `after` seconds past the last, cut where either life
 * ends and where one side disengages:
 *
 * - out of ammunition or fuel, where the data has those columns (the value
 *   reaching nothing, or fuel under 5% of what the track started with);
 * - retreating: the distance between them growing for `RETREAT_S` seconds on
 *   end, by at least a sixth, with no contact in between - and when the side
 *   moving off faced more opponents in the exchange than it had friends in
 *   it, the reason is that it was outnumbered.
 *
 * Worked out once per dataset, a few milliseconds at a time.
 */

import { CANON } from '../../data/canonical';
import { otherColumn } from '../../render/direction';
import type { Dataset } from '../../state/types';
import { personAt, unitsOf } from './units';

/** Seconds of quiet that end an exchange. */
export const GAP_S = 10;
/** Seconds the distance must keep growing to count as a retreat. */
export const RETREAT_S = 3;
/** How far past the last contact disengagement is looked for, seconds: the longest `after` there is. */
export const HORIZON_S = 120;
const STEP_S = 0.5;

export type EndReason = 'contact' | 'death' | 'retreat' | 'outnumbered' | 'ammo' | 'fuel';

export interface Exchange {
  /** The two tracks (person ids), a < b. */
  a: number;
  b: number;
  /** First and last contact. */
  t0: number;
  t1: number;
  /** Contact events in it, by each side. */
  byA: number;
  byB: number;
  /** Where the line must end however long `after` is: a life's end, or one side disengaging. */
  hardEnd: number;
  /** Why it ends at `hardEnd` ('contact' when nothing ended it before the horizon). */
  reason: EndReason;
  /** The side that disengaged (a person), -1 for none. */
  by: number;
  /** Where the line may start: the later of the two lives' starts. */
  hardStart: number;
}

export interface Engagements {
  exchanges: Exchange[];
  /** Exchanges by start time, and the longest one's span, for finding those around a time. */
  maxSpan: number;
}

/** Contact events, as the taxonomy names them and as raw recordings often do. */
const CONTACT = /^(fire|fired|shot|shots?_?fired|launch(ed)?|hit|damage[d]?|kill(ed)?|death|died|destroyed)$/i;
const OTHER = /^(other|target|victim|killer|offender|shooter_?target|hit_?target)$/i;
const SHOOTER = /^(shooter|launcher|attacker|parent)$/i;

/** The rows of each track in time order: `rows[off[p] .. off[p + 1])`. */
function trackRows(d: Dataset): { off: Int32Array; rows: Int32Array } {
  const P = d.personLabels.length;
  const off = new Int32Array(P + 1);
  const pid = d.personId!;
  for (let r = 0; r < d.count; r++) off[pid[r] + 1]++;
  for (let p = 0; p < P; p++) off[p + 1] += off[p];
  const fill = off.slice(0, P);
  const rows = new Int32Array(d.count);
  for (let r = 0; r < d.count; r++) rows[fill[pid[r]]++] = r;
  const time = d.time!;
  if (!d.timeSorted) for (let p = 0; p < P; p++) rows.subarray(off[p], off[p + 1]).sort((x, y) => time[x] - time[y]);
  return { off, rows };
}

/** A track's position at a time: its last sample at or before it, null outside its life. */
function posAt(d: Dataset, tr: { off: Int32Array; rows: Int32Array }, p: number, t: number): [number, number, number] | null {
  let lo = tr.off[p];
  let hi = tr.off[p + 1] - 1;
  const time = d.time!;
  if (hi < lo || t < time[tr.rows[lo]] || t > time[tr.rows[hi]]) return null;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (time[tr.rows[m]] <= t) lo = m;
    else hi = m - 1;
  }
  const r = tr.rows[lo];
  return [d.px[r], d.py[r], d.pz[r]];
}

/** The numeric column whose name matches, or null. */
function column(d: Dataset, re: RegExp): ArrayLike<number> | null {
  return d.attrs.find((a) => a.kind === 'number' && re.test(a.name.trim()))?.data ?? null;
}

export function* findEngagements(d: Dataset, sliceRows = 262_144): Generator<number, Engagements, void> {
  const none = { exchanges: [], maxSpan: 0 };
  const ev = d.attrs.find((a) => a.name === CANON.event && a.categories) ?? d.attrs.find((a) => /^event(_?type)?$/i.test(a.name.trim()) && a.categories);
  if (!ev || !d.personId || !d.time) return none;
  const pid = d.personId;
  const time = d.time;
  const index = unitsOf(d);
  // The other party: by its track's label, else by its unit's key or name at that moment.
  const byLabel = otherColumn(d);
  const otherCol = byLabel ? null : d.attrs.find((a) => a.kind === 'category' && OTHER.test(a.name.trim()) && a.categories);
  const unitByName = new Map<string, number>();
  index.units.forEach((u, i) => {
    unitByName.set(u.key, i);
    if (!unitByName.has(u.name)) unitByName.set(u.name, i);
  });
  const otherUnit = otherCol ? Int32Array.from(otherCol.categories!, (c) => (c ? (unitByName.get(c) ?? -1) : -1)) : null;
  if (!byLabel && !otherUnit) return none;
  // Overlaid matches name their tracks "Blue 1 · Match 01", while the other-party column says "Blue 4".
  const labelIndex = new Map(d.personLabels.map((l, i) => [l, i]));
  const suffix = d.personLabels.map((l) => {
    const at = l.indexOf(' · ');
    return at > 0 ? l.slice(at) : '';
  });
  const otherAt = (r: number): number => {
    if (byLabel) return byLabel.person[byLabel.data[r]];
    const c = (otherCol!.data as Uint32Array)[r];
    const name = otherCol!.categories![c];
    if (!name) return -1;
    const own = suffix[pid[r]];
    if (own) {
      const p = labelIndex.get(name + own);
      if (p !== undefined) return p;
    }
    const u = otherUnit![c];
    return u >= 0 ? personAt(index.units[u], time[r]) : -1;
  };
  const contact = ev.categories!.map((c) => CONTACT.test(c.trim()));
  const evData = ev.data as Uint32Array;
  // A weapon's rows count for whoever launched it.
  const launcher = (() => {
    const col = d.attrs.find((a) => SHOOTER.test(a.name.trim()) && a.categories);
    if (!col) return null;
    const by = new Map(d.personLabels.map((l, i) => [l, i]));
    return { data: col.data as Uint32Array, person: Int32Array.from(col.categories!, (c) => by.get(c) ?? -1) };
  })();
  const team = (p: number) => index.units[index.personUnit[p]]?.team ?? -1;
  const isWeapon = (p: number) => index.units[index.personUnit[p]]?.kind === 'weapon';
  const contacts: Array<[number, number, number]> = [];
  // When each track was killed: its own death row, or a kill row naming it.
  const died = new Map<number, number>();
  const deathKind = ev.categories!.map((c) => (/^(death|died|destroyed)$/i.test(c.trim()) ? 1 : /^kill(ed)?$/i.test(c.trim()) ? 2 : 0));
  for (let r = 0; r < d.count; r++) {
    if (r % sliceRows === sliceRows - 1) yield (0.6 * r) / d.count;
    if (!contact[evData[r]]) continue;
    const dk = deathKind[evData[r]];
    if (dk === 1) died.set(pid[r], time[r]);
    let a = pid[r];
    if (isWeapon(a) && launcher) a = launcher.person[launcher.data[r]];
    let b = otherAt(r);
    if (b >= 0 && isWeapon(b) && launcher) b = -1;
    if (dk === 2 && b >= 0) died.set(b, time[r]);
    if (a < 0 || b < 0 || a === b) continue;
    const ta = team(a);
    const tb = team(b);
    if (ta >= 0 && ta === tb) continue;
    contacts.push([time[r], a, b]);
  }
  contacts.sort((x, y) => x[0] - y[0]);
  // Pairs: contacts grouped into exchanges by the gap between them.
  const open = new Map<string, Exchange>();
  const out: Exchange[] = [];
  for (const [t, from, to] of contacts) {
    const a = Math.min(from, to);
    const b = Math.max(from, to);
    const key = `${a}:${b}`;
    let x = open.get(key);
    if (x && t - x.t1 > GAP_S) {
      out.push(x);
      x = undefined;
    }
    if (!x) {
      x = { a, b, t0: t, t1: t, byA: 0, byB: 0, hardEnd: t, reason: 'contact', by: -1, hardStart: t };
      open.set(key, x);
    }
    x.t1 = t;
    if (from === a) x.byA++;
    else x.byB++;
  }
  out.push(...open.values());
  out.sort((x, y) => x.t0 - y.t0);
  yield 0.7;

  // Where each must end, and why.
  const tr = trackRows(d);
  const life = (p: number): [number, number] => {
    const lo = tr.off[p];
    const hi = tr.off[p + 1] - 1;
    return hi >= lo ? [time[tr.rows[lo]], time[tr.rows[hi]]] : [Infinity, -Infinity];
  };
  const ammo = column(d, /^(ammo|ammunition|rounds?|bullets?)(_left|_remaining)?$/i);
  const fuel = column(d, /^fuel(_?(kg|frac|fraction|left|remaining|level))?$/i);
  const valueAt = (col: ArrayLike<number>, p: number, t: number) => {
    let lo = tr.off[p];
    let hi = tr.off[p + 1] - 1;
    if (hi < lo || t < time[tr.rows[lo]]) return NaN;
    while (lo < hi) {
      const m = (lo + hi + 1) >> 1;
      if (time[tr.rows[m]] <= t) lo = m;
      else hi = m - 1;
    }
    return col[tr.rows[lo]];
  };
  // Per exchange, who else fought each side in it: to tell a retreat from being outnumbered.
  const sides = (x: Exchange, p: number) => {
    const foes = new Set<number>();
    const friends = new Set<number>();
    for (const y of out) {
      if (y.t0 > x.t1 + GAP_S) break;
      if (y.t1 < x.t0 - GAP_S) continue;
      if (y.a === p || y.b === p) foes.add(y.a === p ? y.b : y.a);
    }
    // Friends: anyone who fought one of p's foes in that time.
    for (const y of out) {
      if (y.t0 > x.t1 + GAP_S) break;
      if (y.t1 < x.t0 - GAP_S) continue;
      for (const f of foes) {
        const mate = y.a === f ? y.b : y.b === f ? y.a : -1;
        if (mate >= 0 && mate !== p && team(mate) === team(p)) friends.add(mate);
      }
    }
    return { foes: foes.size, friends: friends.size + 1 };
  };
  let maxSpan = 0;
  for (let i = 0; i < out.length; i++) {
    const x = out[i];
    if (i % 128 === 127) yield 0.7 + (0.3 * i) / out.length;
    const la = life(x.a);
    const lb = life(x.b);
    x.hardStart = Math.max(la[0], lb[0]);
    const lifeEnd = Math.min(la[1], lb[1]);
    let end = Math.min(lifeEnd, x.t1 + HORIZON_S);
    // A life that ends: a death where one was recorded near its end, else the track just stops (the recording's end, a despawn).
    const first = la[1] <= lb[1] ? x.a : x.b;
    const killed = (died.get(first) ?? -Infinity) >= lifeEnd - 2;
    let reason: EndReason = lifeEnd <= x.t1 + HORIZON_S && killed ? 'death' : 'contact';
    let by = reason === 'death' ? first : -1;
    // Out of ammunition or fuel after the last contact.
    for (const [col, why] of [[ammo, 'ammo'], [fuel, 'fuel']] as const) {
      if (!col) continue;
      for (const p of [x.a, x.b]) {
        const start = valueAt(col, p, x.t0);
        for (let t = x.t1; t < end; t += STEP_S) {
          const v = valueAt(col, p, t);
          const empty = why === 'ammo' ? v <= 0 : start > 0 && v <= start * 0.05;
          if (Number.isFinite(v) && empty) {
            if (t < end) {
              end = Math.max(x.t1, t);
              reason = why;
              by = p;
            }
            break;
          }
        }
      }
    }
    // Retreat: the distance growing for RETREAT_S on end, by a sixth or more.
    let runStart = -1;
    let runFrom = 0;
    let prev = -1;
    let mover = -1;
    for (let t = x.t1; t < end; t += STEP_S) {
      const pa = posAt(d, tr, x.a, t);
      const pb = posAt(d, tr, x.b, t);
      if (!pa || !pb) break;
      const dist = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);
      // Samples come slower than the steps: an unchanged distance keeps a run going, a shrinking one ends it.
      const eps = Math.max(1e-6, prev * 1e-4);
      if (prev >= 0 && runStart >= 0 && Math.abs(dist - prev) <= eps) {
        prev = dist;
        continue;
      }
      if (prev >= 0 && dist > prev + eps) {
        if (runStart < 0) {
          runStart = t - STEP_S;
          runFrom = prev;
          // Who is moving off: whoever moved further from where the other was.
          const qa = posAt(d, tr, x.a, runStart);
          const qb = posAt(d, tr, x.b, runStart);
          if (qa && qb) {
            const ma = Math.hypot(pa[0] - qb[0], pa[2] - qb[2]) - Math.hypot(qa[0] - qb[0], qa[2] - qb[2]);
            const mb = Math.hypot(pb[0] - qa[0], pb[2] - qa[2]) - Math.hypot(qb[0] - qa[0], qb[2] - qa[2]);
            mover = ma >= mb ? x.a : x.b;
          }
        }
        if (t - runStart >= RETREAT_S && dist >= runFrom * (7 / 6)) {
          end = runStart;
          const s = mover >= 0 ? sides(x, mover) : null;
          reason = s && s.foes > s.friends ? 'outnumbered' : 'retreat';
          by = mover;
          break;
        }
      } else runStart = -1;
      prev = dist;
    }
    x.hardEnd = Math.max(x.t1, end);
    x.reason = reason;
    x.by = by;
    maxSpan = Math.max(maxSpan, x.hardEnd - x.hardStart);
  }
  return { exchanges: out, maxSpan };
}

/** The line's span for these settings: `before` ahead of the first contact, `after` past the last, inside the hard limits. */
export function exchangeSpan(x: Exchange, before: number, after: number): [number, number] {
  const from = Math.max(x.hardStart, x.t0 - Math.max(0, before));
  const to = Math.min(x.hardEnd, x.t1 + Math.max(0, after));
  return [from, Math.max(from, to)];
}

/**
 * The exchanges whose line is shown at `now`, and which phase each is in:
 * `lead` before the first contact, `fight` between first and last, `tail` after.
 */
export function activeExchanges(e: Engagements, now: number, before: number, after: number): Array<{ x: Exchange; phase: 'lead' | 'fight' | 'tail' }> {
  const list = e.exchanges;
  // Exchanges start in order: none starting after now + before can be on.
  let hi = list.length;
  let lo = 0;
  const limit = now + Math.max(0, before);
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (list[m].t0 <= limit) lo = m + 1;
    else hi = m;
  }
  const out: Array<{ x: Exchange; phase: 'lead' | 'fight' | 'tail' }> = [];
  const reach = e.maxSpan + Math.max(0, before) + Math.max(0, after);
  for (let i = lo - 1; i >= 0; i--) {
    const x = list[i];
    if (x.t0 < now - reach) break;
    const [a, b] = exchangeSpan(x, before, after);
    if (now < a || now > b) continue;
    out.push({ x, phase: now < x.t0 ? 'lead' : now <= x.t1 ? 'fight' : 'tail' });
  }
  return out;
}

/**
 * The tracks the engagement lines are drawn between this frame: the engine
 * places these on the CPU with the followed unit, so the lines meet the
 * figures where they are drawn.
 */
export const engagedTracks = new Set<number>();

const cache = new WeakMap<Dataset, Engagements | Promise<Engagements>>();

/** The dataset's engagements, worked out between frames the first time they are asked for. */
export function engagementsOf(d: Dataset, run: (g: Generator<number, Engagements, void>) => Promise<Engagements | null>): Engagements | null {
  const c = cache.get(d);
  if (c && !(c instanceof Promise)) return c;
  if (!c) {
    const p = run(findEngagements(d)).then((e) => {
      const v = e ?? { exchanges: [], maxSpan: 0 };
      cache.set(d, v);
      return v;
    });
    cache.set(d, p);
  }
  return null;
}
