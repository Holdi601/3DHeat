/**
 * Fires on things: from the moment the data says a part of a unit caught
 * fire until it is out, with where on the unit it burns, so the fire layer
 * (`figures/fires.ts`) can draw flames and smoke on it, a wreck's too.
 *
 * What says so, in any dataset: an event row at the thing whose label is
 * `fire_on` (or `fire`, `burning`, `on_fire`) and the matching `fire_off`
 * (`extinguished`, `fire_out`) - by a `fireId` column where there is one,
 * else the oldest fire still burning. Where the fire is: `fireLocalX/Y/Z`, in
 * the thing's own frame (forward, up, right; metres), as War Thunder's
 * converter writes them; NaN where the data does not say. A fire never put
 * out burns until the thing's last row. Not gun bursts: War Thunder's
 * `fire_start` / `fire_stop` are a gun firing, and are not read here.
 */

import type { AttributeColumn, Dataset } from '../state/types';
import { personRows } from './flight';

export const FIRE_ON = /^(fire_on|on_fire|burning|fire)$/i;
export const FIRE_OFF = /^(fire_off|fire_out|extinguished)$/i;

/** What burns, for where a fire with no place of its own is drawn and how big. */
export const FireBody = { Ground: 0, Air: 1, Ship: 2 } as const;
export type FireBody = (typeof FireBody)[keyof typeof FireBody];

export interface Fires {
  /** How many spans; each array below has one entry (local: three) per span, sorted by `from`. */
  count: number;
  person: Int32Array;
  from: Float64Array;
  to: Float64Array;
  /** Where on the thing (forward, up, right; metres), NaN for not said. */
  local: Float32Array;
  body: Uint8Array;
  /** The longest span, seconds: how far back from a time a burning span can start. */
  longest: number;
}

const NONE: Fires = { count: 0, person: new Int32Array(0), from: new Float64Array(0), to: new Float64Array(0), local: new Float32Array(0), body: new Uint8Array(0), longest: 0 };
const cache = new WeakMap<Dataset, Fires>();

function named(d: Dataset, re: RegExp, kind: 'number' | 'category'): AttributeColumn | null {
  return d.attrs.find((a) => a.kind === kind && re.test(a.name.trim())) ?? null;
}

function bodyOf(label: string): FireBody {
  if (/ship|boat|destroyer|cruiser|frigate|naval/i.test(label)) return FireBody.Ship;
  if (/air|plane|fighter|bomber|heli/i.test(label)) return FireBody.Air;
  return FireBody.Ground;
}

/** Every fire in the data (`Fires`). Worked out once a dataset. */
export function firesOf(d: Dataset): Fires {
  const hit = cache.get(d);
  if (hit) return hit;
  const ev = named(d, /^events?$/i, 'category');
  const idx = personRows(d);
  const time = d.time;
  const on = ev ? ev.categories!.map((c) => FIRE_ON.test(c.trim())) : null;
  if (!ev || !idx || !time || !on || !on.some(Boolean)) {
    cache.set(d, NONE);
    return NONE;
  }
  const off = ev.categories!.map((c) => FIRE_OFF.test(c.trim()));
  const ids = ev.data as Uint32Array;
  const fireId = named(d, /^fire_?id$/i, 'category');
  const kind = named(d, /^(kind|type|class)$/i, 'category');
  const lx = named(d, /^fire_?local_?x$/i, 'number');
  const ly = named(d, /^fire_?local_?y$/i, 'number');
  const lz = named(d, /^fire_?local_?z$/i, 'number');
  const P: number[] = [];
  const F: number[] = [];
  const T: number[] = [];
  const L: number[] = [];
  const B: number[] = [];
  const persons = Math.max(1, d.personLabels.length);
  // Per person: the spans still burning, by fire id (-1 none), oldest first.
  const open: { id: number; k: number }[] = [];
  for (let p = 0; p < persons; p++) {
    open.length = 0;
    const a = idx.start[p];
    const b = idx.start[p + 1];
    if (a === b) continue;
    const lastT = time[idx.rows[b - 1]];
    for (let k = a; k < b; k++) {
      const r = idx.rows[k];
      const e = ids[r];
      const fid = fireId ? (fireId.data as Uint32Array)[r] : -1;
      if (on[e]) {
        const n = P.length;
        P.push(p);
        F.push(time[r]);
        T.push(Infinity);
        const x = lx ? lx.data[r] : NaN;
        const y = ly ? ly.data[r] : NaN;
        const z = lz ? lz.data[r] : NaN;
        L.push(x, y, z);
        B.push(kind ? bodyOf(kind.categories![(kind.data as Uint32Array)[r]] ?? '') : FireBody.Ground);
        open.push({ id: fid, k: n });
      } else if (off[e]) {
        let j = fireId ? open.findIndex((o) => o.id === fid) : 0;
        if (j < 0) j = 0;
        if (open.length) {
          T[open[j].k] = time[r];
          open.splice(j, 1);
        }
      }
    }
    for (const o of open) T[o.k] = lastT;
  }
  if (!P.length) {
    cache.set(d, NONE);
    return NONE;
  }
  const order = P.map((_, i) => i).sort((i, j) => F[i] - F[j]);
  const n = order.length;
  const out: Fires = {
    count: n,
    person: Int32Array.from(order, (i) => P[i]),
    from: Float64Array.from(order, (i) => F[i]),
    to: Float64Array.from(order, (i) => Math.max(F[i], T[i])),
    local: new Float32Array(n * 3),
    body: Uint8Array.from(order, (i) => B[i]),
    longest: 0,
  };
  order.forEach((i, k) => {
    out.local[k * 3] = L[i * 3];
    out.local[k * 3 + 1] = L[i * 3 + 1];
    out.local[k * 3 + 2] = L[i * 3 + 2];
    out.longest = Math.max(out.longest, out.to[k] - out.from[k]);
  });
  cache.set(d, out);
  return out;
}

/**
 * The spans burning at `t`: calls `visit(k)` for each, newest first, at
 * most `limit` of them; returns how many it visited. No allocation: the
 * spans are sorted by start, so only those started within `longest` seconds
 * before `t` are looked at.
 */
export function burningAt(f: Fires, t: number, limit: number, visit: (k: number) => boolean | void): number {
  if (!f.count) return 0;
  // The first span starting after t.
  let lo = 0;
  let hi = f.count;
  while (lo < hi) {
    const m = (lo + hi) >>> 1;
    if (f.from[m] <= t) lo = m + 1;
    else hi = m;
  }
  let n = 0;
  const since = t - f.longest;
  for (let k = lo - 1; k >= 0 && f.from[k] >= since && n < limit; k--) {
    if (t < f.to[k] && visit(k) !== false) n++;
  }
  return n;
}
