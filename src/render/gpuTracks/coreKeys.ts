/**
 * The GPU tracks' keys built by the native core over every row it holds
 * (`native/crates/core/src/tracks.rs`), for a load the page holds every
 * `pageStep`-th row of: the page's own store (`store.ts`) is built from its
 * copy as always (the CPU's picks, labels and cards read it), the viewport
 * draws the core's keys. What the core is asked, what it answers, and the
 * track table that goes with its keys: the page's (kinds, meshes, colours,
 * symbol class), with each track's key range, chunk spans, span and gap flag
 * the core's, and its hold and dead span worked out again over the core's
 * first and last key. A person the core has keys for and the page no row of
 * (thinned by row, a short-lived unit can lose every row) gets a track after
 * the page's: a far-off dart in its team's colour, as a track of no known kind.
 */

import type { Dataset } from '../../state/types';
import { positionRows } from '../../figures/motion';
import { endsOf, holdAfterKeys } from '../../data/despawn';
import { deathsOf, lastDeadSpan, packDeadSpan } from '../../data/deaths';
import { FLAG_GAPS, HOLD_ON, setDeadSpan, TRACK_U32, TrackFigures, type GpuTrackStore } from './store';

/** Words a person's entry takes in the core's answer: first key, count, chunk (u32), span (6 x f32), t0, t1 (f32), flags. */
export const PERSON_U32 = 12;
/** Words before the entries: keys, chunk u32, persons, tolerance (f32), samples, build ms (f32). */
export const CORE_HEAD_U32 = 6;
const PERSON_GAPS = 1;

/** What the core builds the keys with (`tracks::TrackRequest`). */
export interface CoreTracksRequest {
  maxKeys: number;
  units: number;
  persons: number;
  events: string | null;
  own: number[];
  roll: string | null;
}

export interface CoreKeys {
  keys: number;
  chunkU32: number;
  tolerance: number;
  samples: number;
  buildMs: number;
  /** `PERSON_U32` a person. */
  persons: Uint32Array;
}

/** The request for dataset `d`: its units, events column (own positions only) and roll column, as `buildSteps` reads them. */
export function coreTracksRequest(d: Dataset, maxKeys: number): CoreTracksRequest {
  const ev = d.attrs.find((a) => a.kind === 'category' && a.categories && /^events?$/i.test(a.name.trim()));
  const { own } = positionRows(d);
  const roll = d.attrs.find((a) => a.kind !== 'category' && /^roll$/i.test(a.name.trim()));
  return {
    maxKeys,
    units: d.entitySize ? d.entitySize / 0.8 : 1,
    persons: Math.max(1, d.personLabels.length),
    events: ev && own ? ev.name : null,
    own: own ? Array.from(own) : [],
    roll: roll ? roll.name : null,
  };
}

/** The core's answer (`viewport_core_tracks`): its counts, then an entry a person. */
export function parseCoreKeys(buf: ArrayBuffer): CoreKeys {
  const u = new Uint32Array(buf);
  const f = new Float32Array(buf);
  const n = u[2];
  return { keys: u[0], chunkU32: u[1], tolerance: f[3], samples: u[4], buildMs: f[5], persons: u.subarray(CORE_HEAD_U32, CORE_HEAD_U32 + n * PERSON_U32) };
}

/** The tracks drawn from the core's keys: the table, how many, and per mesh how many may draw with it. */
export interface CoreTable {
  table: Uint32Array;
  tracks: number;
  meshTracks: Uint32Array;
  /** Tracks of persons the page has no row of (after the page's). */
  extra: number;
}

/**
 * The track table (tracks only, `TRACK_U32` a track, at least one) for the core's keys: the
 * page's store's with each track's key range, chunk offset (its spans follow the table in the
 * viewport's buffer), span, gap flag, hold and dead span from the core's entry for its person;
 * then a track for each person with keys the page has no track for.
 */
export function coreTrackTable(s: GpuTrackStore, k: CoreKeys): CoreTable {
  const d = s.dataset;
  const e = k.persons;
  const persons = Math.floor(e.length / PERSON_U32);
  const missing: number[] = [];
  for (let p = 0; p < persons; p++) if (e[p * PERSON_U32 + 1] > 0 && !(s.trackOf[p] >= 0)) missing.push(p);
  const tracks = s.tracks + missing.length;
  const head = Math.max(1, tracks) * TRACK_U32;
  const out = new Uint32Array(head);
  out.set(s.trackData.subarray(0, Math.max(1, s.tracks) * TRACK_U32));
  const f = new Float32Array(out.buffer);
  const ef = new Float32Array(e.buffer, e.byteOffset, e.length);
  const meshTracks = s.meshTracks.slice();
  if (missing.length) {
    const figures = new TrackFigures(d);
    missing.forEach((p, j) => figures.place(out, f, (s.tracks + j) * TRACK_U32, p, -1, !!d.yaw));
    for (let m = 0; m < meshTracks.length; m++) meshTracks[m] += figures.meshTracks[m];
  }
  const ends = endsOf(d);
  const deaths = deathsOf(d);
  for (let i = 0; i < tracks; i++) {
    const o = i * TRACK_U32;
    const p = i < s.tracks ? s.personOf[i] : missing[i - s.tracks];
    const q = p * PERSON_U32;
    if (q + PERSON_U32 > e.length || e[q + 1] === 0) {
      // No keys in the core for it: drawn as none.
      out[o + 1] = 0;
      continue;
    }
    out[o] = e[q];
    out[o + 1] = e[q + 1];
    out[o + 7] = head + e[q + 2];
    for (let j = 0; j < 6; j++) out[o + 8 + j] = e[q + 3 + j];
    out[o + 5] = ((out[o + 5] & ~FLAG_GAPS) | (e[q + 11] & PERSON_GAPS ? FLAG_GAPS : 0)) >>> 0;
    const t0 = ef[q + 9];
    const t1 = ef[q + 10];
    const hold = holdAfterKeys(ends, p, t1);
    f[o + 14] = hold === Infinity ? HOLD_ON : hold + 1;
    const span = deaths.any ? lastDeadSpan(deaths, p) : null;
    setDeadSpan(out, o, span ? packDeadSpan(span[0], span[1], t0, t1) : 0);
  }
  return { table: out, tracks, meshTracks, extra: missing.length };
}
