/**
 * Routes for line heat: each person's way from where they started to where it
 * ended, as the segments between their consecutive samples.
 *
 * Line heat draws a line from every sample of a person to their next one and
 * splats it with the same falloff the point heat gives a sprite, only sideways.
 * What it shows is where people *went*, not where they stood - a corridor run
 * through once is as visible as a room camped in. That is only meaningful
 * between a beginning and an end: a line from where someone died to where they
 * respawned crosses the map through walls, and a line from the last sample of
 * one match to the first of the next crosses it between worlds. So a route has
 * an explicit start and end, chosen by event:
 *
 *   - `starts`: the values of the event column that begin a route (spawn,
 *     respawn, deploy, ...). None chosen: a route begins at a person's first
 *     sample, and again at the first sample after an end.
 *   - `ends`: the values that end it (death, extraction, teleport, ...). The end
 *     row is part of the route - the line runs to where they died. None chosen:
 *     a route ends where the person's track does.
 *   - `points`: the values whose rows are positions along the route. None
 *     chosen: every row of the person is. Worth narrowing when the event column
 *     also carries rows placed somewhere else than the person - a grenade's
 *     landing point attributed to its thrower would otherwise pull the line
 *     across the map and back.
 *
 * A route also ends where the person's track does anyway: at a session change,
 * at a gap the ingest decided has no successor (`lifetime` < 0), and never
 * through a name worn by several things at once (`personShared`). These are the
 * same rules the box replay's trails follow, for the same reasons.
 *
 * The result is one link per row, not a list of segments: a row that ends a
 * segment knows the row it came from. That keeps the segments in the dataset's
 * own order - by time of their end - so the time window, the sampler, the
 * filters and the group sign all work on them exactly as on points, with no
 * second index. A segment is drawn from its end row; filters see the values of
 * the row it ends at.
 */

import { TrackTable } from './trackTable';
import type { AttributeColumn, Dataset, ViewMode } from '../state/types';

export interface LineSettings {
  /** The category column that holds the events, or null for whole tracks. */
  column: string | null;
  /** Values that begin a route. Empty: a track's first sample does. */
  starts: string[];
  /** Values that end a route. Empty: the track's end does. */
  ends: string[];
  /** Values whose rows lie along the route. Empty: every row does. */
  points: string[];
  /**
   * The longest step drawn, in world units. A person's next sample further away
   * than this is a jump (a respawn, a teleport, a drop), not somewhere they went:
   * the route breaks there and carries on from the far end. Null: no limit.
   */
  maxJump?: number | null;
  /**
   * What the lines' colour says: plain heat, each group in its own hue as in team
   * heat, or one side against the other as in difference. Does not change the routes.
   */
  view?: LineView;
}

export type LineView = 'heat' | 'teams' | 'difference';

/**
 * The heat mode a frame is coloured by. Lines are drawn by the same shaders as the
 * points, so the routes can wear any of the three: this is the one place that says
 * which, and everything that asks "is this difference or team heat?" asks it here.
 */
export function heatModeFor(mode: ViewMode, lines: LineSettings): ViewMode {
  if (mode !== 'heat-lines') return mode;
  if (lines.view === 'teams') return 'heat-teams';
  return lines.view === 'difference' ? 'heat-difference' : mode;
}

/** Bits of `LineData.flags`. */
export const LINE_SEGMENT = 1;
/** The segment begins a route: round its start off. */
export const LINE_START_CAP = 2;
/** The segment ends a route: round its end off. */
export const LINE_END_CAP = 4;

export interface LineData {
  /**
   * The row each row's segment starts at. Only meaningful where `flags` has
   * `LINE_SEGMENT`; elsewhere 0.
   */
  from: Uint32Array;
  /** `LINE_*` bits per row. */
  flags: Uint8Array;
  /** Box every position lies in, for quantising segment starts. */
  min: [number, number, number];
  size: [number, number, number];
  /** Segments drawn. */
  segments: number;
  /** Routes begun. */
  routes: number;
  /** Routes that reached one of the `ends`, out of `routes`. */
  ended: number;
  /** Steps left undrawn for being longer than `LineSettings.maxJump`. */
  jumps: number;
  /**
   * The longest segment in time, seconds. Playback has to look this far past
   * the playhead for the segment someone is in the middle of, whose end row is
   * still in the future.
   */
  maxSeconds: number;
}

/** Whether the data can have routes at all: a person and a time for every row. */
export function canDrawLines(ds: Dataset): boolean {
  return !!ds.time && ds.personLabels.length > 0;
}

/**
 * The column most likely to hold events: a category column named like one.
 *
 * Among several, the first match in this order; the user can pick another.
 */
export function guessEventColumn(ds: Dataset): AttributeColumn | null {
  const cats = ds.attrs.filter((a) => a.kind === 'category' && a.categories);
  const names = [/^event(name|type)?$/i, /^(kind|type|action)$/i, /event|kind|action|type/i];
  for (const re of names) {
    const hit = cats.find((a) => re.test(a.name));
    if (hit) return hit;
  }
  return null;
}

const START_WORDS = /spawn|deploy|join|enter|start|begin|respawn|revive|land(ed|ing)?\b|drop/i;
const END_WORDS = /death|died|dead|kill(ed)?\b|eliminat|extract|evac|teleport|leave|left|disconnect|quit|exit|end|finish|downed/i;
const POINT_WORDS = /^(position|location|player ?location|move|movement|tick|sample|pos)$/i;

/**
 * Settings to start from for a dataset: its event column and the values in it
 * that read like a spawn, an end and a plain position.
 *
 * Only a suggestion, shown in the panel to change. "kill" is deliberately an
 * end only when it reads as having *been* killed: the killer's own row of a
 * kill event is a point on their route, not its end - so a bare "kill" is left
 * out of the guess, and "killed" or "death" go in.
 */
export function suggestLineSettings(ds: Dataset): LineSettings {
  const col = guessEventColumn(ds);
  if (!col || !col.categories) return { column: null, starts: [], ends: [], points: [] };
  const values = col.categories.filter((c) => c !== '');
  const isKill = (v: string) => /^kills?$/i.test(v.trim());
  const starts = values.filter((v) => START_WORDS.test(v) && !END_WORDS.test(v));
  const ends = values.filter((v) => END_WORDS.test(v) && !isKill(v) && !starts.includes(v));
  const points = values.filter((v) => POINT_WORDS.test(v.trim()));
  return { column: col.name, starts, ends, points: points.length ? [...points, ...starts, ...ends] : [] };
}

/** `TrackTable.mark`: the route's next segment is its first. */
const ROUTE_FRESH = 1;
/** `TrackTable.mark`: the ingest found nothing that follows the track's last row. */
const NO_SUCCESSOR = 2;

/** About how many rows' steps are measured for the jump limit: enough for the shape, on any size of data. */
const JUMP_SAMPLE = 16_000_000;
/** A share of the steps this small counts as nobody moving that far. */
const JUMP_EMPTY = 0.0002;
/** How wide the empty range must be, in doublings of the squared length: two is one doubling of the length. */
const JUMP_GAP_BINS = 2;

/**
 * The longest step that is still walking, read off the data, or null when the
 * data shows no such line.
 *
 * Where people jump, the steps fall into two groups with next to nothing between
 * them: what a person covers between two samples, and the width of the map. On
 * the data this was written against, 99% of steps were under 124 m, about 1% over
 * 500 m, and 0.004% in between. The limit goes in the middle of that empty range.
 * With no empty range there is no telling a jump from a fast car, so nothing is
 * cut. That is why this looks for a gap instead of taking some multiple of a
 * typical step: on data where most people stand still that would cut real moves.
 */
export function suggestMaxJump(ds: Dataset): number | null {
  const hist = stepHistogram(ds);
  if (!hist || hist.steps === 0) return null;
  // One bin per doubling of the squared length: two of the histogram's.
  const bins = new Float64Array(Math.ceil(hist.counts.length / 2));
  hist.counts.forEach((c, i) => {
    bins[i >> 1] += c;
  });
  const lengthAt = (bin: number) => hist.edges[Math.min(bin * 2, hist.edges.length - 1)];
  const steps = hist.steps;
  let seen = 0;
  let median = 0;
  while (median < bins.length - 1 && seen + bins[median] < steps / 2) seen += bins[median++];
  const empty = steps * JUMP_EMPTY;
  for (let b = median + 1; b < bins.length; b++) {
    if (bins[b] >= empty) continue;
    let end = b;
    while (end < bins.length && bins[end] < empty) end++;
    let beyond = 0;
    for (let k = end; k < bins.length; k++) beyond += bins[k];
    if (end - b >= JUMP_GAP_BINS && beyond >= empty) return Math.sqrt(lengthAt(b) * lengthAt(end));
    b = end;
  }
  return null;
}

/** How long a person's steps are: a count per length, on a logarithmic scale. */
export interface StepHistogram {
  /** The bins' edges, world units: one more than `counts`. */
  edges: number[];
  counts: number[];
  /** Steps counted, those of zero length left out. */
  steps: number;
}

const histograms = new WeakMap<Dataset, StepHistogram | null>();

/**
 * The lengths of the steps people took, four bins to a doubling of the length,
 * trimmed to the bins in use. Worked out once for a dataset. Sampled by person,
 * not by row: a step needs its row's predecessor, so the rows of a person who is
 * sampled have to be walked anyway, and the others need not be.
 */
export function stepHistogram(ds: Dataset): StepHistogram | null {
  const known = histograms.get(ds);
  if (known !== undefined) return known;
  const person = ds.personId;
  if (!person || ds.count < 2) {
    histograms.set(ds, null);
    return null;
  }
  const { px, py, pz } = ds;
  const session = ds.sessionId;
  const lifetime = ds.lifetime;
  const shared = ds.personShared;
  const people = ds.personLabels.length;
  const tracks = new TrackTable(people);
  // Two bins per doubling of the squared length is four per doubling of the length.
  const raw = new Float64Array(256);
  // At least a few people whatever the rows: one person may be standing still.
  const stride = Math.max(1, Math.min(Math.ceil(ds.count / JUMP_SAMPLE), Math.ceil(people / 8)));
  let steps = 0;
  for (let i = 0; i < ds.count; i++) {
    const p: number = person[i];
    if (p % stride !== 0 || p >= people || (shared && shared[p])) continue;
    const track = tracks.track(p, session ? session[i] : 0);
    const a = tracks.last[track];
    tracks.last[track] = i;
    if (a < 0) continue;
    if (lifetime && lifetime[a] < 0) continue;
    const dx = px[i] - px[a];
    const dy = py[i] - py[a];
    const dz = pz[i] - pz[a];
    const sq = dx * dx + dy * dy + dz * dz;
    if (sq <= 0) continue;
    raw[Math.max(0, Math.min(255, Math.floor(Math.log2(sq) * 2) + 80))]++;
    steps++;
  }
  // Whole doublings of the squared length at the start, so that pairs of bins add up to them.
  let first = 0;
  while (first < 255 && raw[first] === 0) first++;
  first -= first % 2;
  let last = 255;
  while (last > first && raw[last] === 0) last--;
  const counts = Array.from(raw.subarray(first, last + 1));
  const edges = Array.from({ length: counts.length + 1 }, (_, i) => Math.sqrt(2 ** ((first + i - 80) / 2)));
  const out = { edges, counts, steps };
  histograms.set(ds, out);
  return out;
}

/**
 * Which track each row is on, for as long as the dataset lives.
 *
 * Finding a row's track is most of a walk over the rows, 70% of the first build on 86M
 * rows, and it does not change between the rebuilds of a limit being tried out. Four
 * bytes a row, only on a load that has been looked at as lines.
 */
const rowTrackCache = new WeakMap<Dataset, { ids: Int32Array; count: number }>();

function rowTracks(ds: Dataset, person: NonNullable<Dataset['personId']>): { ids: Int32Array; count: number } {
  const have = rowTrackCache.get(ds);
  if (have) return have;
  const session = ds.sessionId;
  const table = new TrackTable(ds.personLabels.length);
  const ids = new Int32Array(ds.count);
  for (let i = 0; i < ds.count; i++) ids[i] = table.track(person[i], session ? session[i] : 0);
  const made = { ids, count: table.count };
  rowTrackCache.set(ds, made);
  return made;
}

/** A key that changes whenever the routes would. */
export function lineSettingsKey(s: LineSettings): string {
  return [s.column ?? '', s.starts.join('\u0001'), s.ends.join('\u0001'), s.points.join('\u0001'), s.maxJump ?? ''].join('\u0002');
}

/** Membership of each category index in a set of values, or null for "none chosen". */
function lookup(col: AttributeColumn | null, values: string[]): Uint8Array | null {
  if (!col || !col.categories || values.length === 0) return null;
  const want = new Set(values);
  const out = new Uint8Array(col.categories.length);
  col.categories.forEach((c, i) => {
    if (want.has(c)) out[i] = 1;
  });
  return out;
}

export function buildLines(ds: Dataset, settings: LineSettings): LineData {
  const n = ds.count;
  const from = new Uint32Array(n);
  const flags = new Uint8Array(n);
  const { px, py, pz } = ds;

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = px[i];
    const y = py[i];
    const z = pz[i];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const box = n
    ? { min: [minX, minY, minZ] as [number, number, number], size: [maxX - minX, maxY - minY, maxZ - minZ] as [number, number, number] }
    : { min: [0, 0, 0] as [number, number, number], size: [0, 0, 0] as [number, number, number] };
  box.size = box.size.map((v) => Math.max(1e-6, v)) as [number, number, number];

  const person = ds.personId;
  if (!person || !ds.time || n === 0) return { from, flags, ...box, segments: 0, routes: 0, ended: 0, jumps: 0, maxSeconds: 0 };
  const time = ds.time;

  const col = settings.column
    ? (ds.attrs.find((a) => a.name === settings.column && a.kind === 'category') ?? null)
    : null;
  const events = col ? (col.data as Uint32Array) : null;
  const isStart = lookup(col, settings.starts);
  const isEnd = lookup(col, settings.ends);
  const isPoint = lookup(col, settings.points);
  const lifetime = ds.lifetime;
  const shared = ds.personShared;

  // Per person in each match, because matches interleave (see `TrackTable`): the
  // route's last row, or -1 when no route is open; and whether the next segment is
  // the route's first.
  const people = ds.personLabels.length;
  const { ids, count } = rowTracks(ds, person);
  const last = new Int32Array(count).fill(-1);
  const mark = new Uint8Array(count);
  // What the walk asks of a track's last row, kept with the track: x, y, z, time.
  const where = new Float32Array(count * 4);
  let segments = 0;
  let routes = 0;
  let ended = 0;
  let jumps = 0;
  let maxSeconds = 0;
  const maxJumpSq = settings.maxJump ? settings.maxJump * settings.maxJump : Infinity;

  // What the walk asks of a track's last row, kept with the track: that row is far
  // away by now, and asking it costs a cache miss per row.
  const keep = (t: number, row: number) => {
    last[t] = row;
    const at = t * 4;
    where[at] = px[row];
    where[at + 1] = py[row];
    where[at + 2] = pz[row];
    where[at + 3] = time[row];
    if (lifetime && lifetime[row] < 0) mark[t] |= NO_SUCCESSOR;
    else mark[t] &= ~NO_SUCCESSOR;
  };
  const close = (t: number) => {
    const r = last[t];
    if (r >= 0 && flags[r] & LINE_SEGMENT) flags[r] |= LINE_END_CAP;
    last[t] = -1;
  };
  const open = (t: number, row: number) => {
    keep(t, row);
    mark[t] |= ROUTE_FRESH;
    routes++;
  };

  for (let i = 0; i < n; i++) {
    const p: number = person[i];
    if (p >= people || (shared && shared[p])) continue;
    const e = events ? events[i] : 0;
    const starts = isStart !== null && isStart[e] === 1;
    const ends = isEnd !== null && isEnd[e] === 1;
    // A row that is neither a start, an end nor a chosen point is not on any
    // route: it neither extends one nor breaks it.
    if (!starts && !ends && isPoint !== null && isPoint[e] !== 1) continue;

    const t = ids[i];
    // The track itself ends here: a gap the ingest decided nothing follows.
    if (last[t] >= 0 && mark[t] & NO_SUCCESSOR) close(t);

    // Too far to have gone there: the route stops where it was, and a new one
    // starts at the far end, whichever kind of row that is.
    if (last[t] >= 0) {
      const at = t * 4;
      const dx = px[i] - where[at];
      const dy = py[i] - where[at + 1];
      const dz = pz[i] - where[at + 2];
      if (dx * dx + dy * dy + dz * dz > maxJumpSq) {
        close(t);
        jumps++;
        if (!starts && !ends) open(t, i);
        if (!starts) continue;
      }
    }

    if (starts) {
      // A spawn while a route is open ends that route where it was, without a
      // line to the spawn point.
      if (last[t] >= 0) close(t);
      open(t, i);
    } else if (last[t] < 0) {
      // No route open. Without chosen starts any sample begins one; with them,
      // this row lies outside every route.
      if (isStart === null && !ends) open(t, i);
      continue;
    } else {
      const a = last[t];
      from[i] = a;
      flags[i] = LINE_SEGMENT | (mark[t] & ROUTE_FRESH ? LINE_START_CAP : 0);
      mark[t] &= ~ROUTE_FRESH;
      segments++;
      const seconds = time[i] - where[t * 4 + 3];
      if (seconds > maxSeconds) maxSeconds = seconds;
      keep(t, i);
    }

    if (ends && last[t] >= 0) {
      ended++;
      close(t);
    }
  }
  for (let t = 0; t < count; t++) if (last[t] >= 0) close(t);

  return { from, flags, ...box, segments, routes, ended, jumps, maxSeconds };
}

/**
 * Each row's segment for the GPU, `stride` u32 apiece for `rows` rows from
 * `start`: the segment's start quantised to the line box as x | y<<16 and
 * z | flags<<16, then how long the segment took, as the bits of an f32. A
 * stride of 4 leaves the fourth word 0 (the WebGL2 texture is four-wide).
 *
 * Quantised to the box of the whole data rather than to the chunk the row is in,
 * because a segment's start can be a row in another chunk, outside this one's box.
 * 16 bits over the whole extent is still a centimetre on a 650 m map.
 */
export function packLineStarts(
  ds: Dataset,
  lines: LineData,
  start: number,
  rows: number,
  stride: 3 | 4,
): Uint32Array {
  const out = new Uint32Array(rows * stride);
  const seconds = new Float32Array(out.buffer);
  const [mx, my, mz] = lines.min;
  const sx = 65535 / lines.size[0];
  const sy = 65535 / lines.size[1];
  const sz = 65535 / lines.size[2];
  const q = (v: number) => Math.max(0, Math.min(65535, Math.round(v)));
  const time = ds.time;
  for (let i = 0; i < rows; i++) {
    const r = start + i;
    const f = lines.flags[r];
    if (!(f & LINE_SEGMENT)) continue;
    const a = lines.from[r];
    const o = i * stride;
    out[o] = (q((ds.px[a] - mx) * sx) | (q((ds.py[a] - my) * sy) << 16)) >>> 0;
    out[o + 1] = (q((ds.pz[a] - mz) * sz) | (f << 16)) >>> 0;
    seconds[o + 2] = time ? time[r] - time[a] : 0;
  }
  return out;
}
