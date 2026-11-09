import { teamMemberColor } from '../render/colors';
import type { Dataset } from '../state/types';
import { lowerBound, upperBound } from '../render/sampling';
import { holdLimit, type Ends } from './despawn';

/** Floats per cube instance: x,y,z, r,g,b, yaw,pitch. */
export const CUBE_STRIDE = 8;
/** Floats per trail vertex: x,y,z, r,g,b,a. */
export const TRAIL_STRIDE = 7;

/**
 * Live per-person positions for the team viewer.
 *
 * Deliberately holds no per-row index. A person -> rows index would cost 4 bytes
 * per row, which is 1.6GB on a 400M-row dataset, to answer a question about a few
 * hundred people. Instead this keeps O(persons) state and rides the global
 * time-ordered array with a cursor: stepping the playhead forward touches only
 * the rows that were actually crossed, so playback cost tracks the event rate,
 * not the dataset size.
 */
export class TrackCursor {
  private readonly persons: number;
  private readonly prevRow: Int32Array;
  private readonly nextRow: Int32Array;
  private readonly prevStamp: Int32Array;
  private readonly nextStamp: Int32Array;
  private readonly colors: Float32Array;
  /**
   * Tacview's Visible and Disabled (ACMI 2.2), per row where the recording
   * writes them: Visible 0 hides an object that is still there (a fog of war,
   * a virtual object), Disabled 1 is out of combat but not destroyed - drawn
   * greyed. Neither ends it; NaN is unsaid, visible and active.
   */
  private readonly visibleCol: Float32Array | null;
  private readonly disabledCol: Float32Array | null;

  /** First row with time > playhead. */
  private head = 0;
  private stamp = 0;
  private lastTime = Number.NEGATIVE_INFINITY;

  private cubeBuf = new Float32Array(0);
  /**
   * The row each cube of the last build stands for: the sample at or before
   * the playhead, for an interpolated box the one it is moving away from. What
   * a click on a box is answered with.
   */
  cubeRows = new Int32Array(0);
  private trailBuf = new Float32Array(0);

  /** Cap on rows touched by a single rebuild after a seek. */
  private readonly maxScan: number;

  /**
   * The session being played back, or -1 for all of them.
   *
   * A person is only the same moving thing within one session, so this is part of
   * the cursor's identity rather than a filter applied afterwards. Real telemetry
   * interleaves concurrent matches — three consecutive rows of the test export
   * belong to three different matches within the same minute — so without a
   * selection the "previous" and "next" sample either side of the playhead are
   * routinely from different matches and hundreds of metres apart, and the line
   * drawn between them crosses the map.
   */
  private session = -1;

  /**
   * The chosen session's rows, ascending; null when every row counts.
   *
   * Without it each frame walks the rest of the load to find a few people's next
   * sample, about 100 ms on 86M rows, and a trail decimated over all rows in its time
   * range keeps one in every so many of this session's samples.
   */
  private sessionList: Int32Array | null = null;

  constructor(private readonly dataset: Dataset) {
    this.persons = Math.max(1, dataset.personLabels.length);
    this.prevRow = new Int32Array(this.persons).fill(-1);
    this.nextRow = new Int32Array(this.persons).fill(-1);
    this.prevStamp = new Int32Array(this.persons).fill(-1);
    this.nextStamp = new Int32Array(this.persons).fill(-1);
    this.maxScan = Math.max(1 << 20, this.persons * 512);

    const flag = (name: string) => {
      const a = dataset.attrs.find((x) => x.kind === 'number' && x.name === name);
      return a ? (a.data as Float32Array) : null;
    };
    this.visibleCol = flag('Visible');
    this.disabledCol = flag('Disabled');

    this.colors = new Float32Array(this.persons * 3);
    const { personTeam, personSlot, teamSizes } = dataset;
    for (let p = 0; p < this.persons; p++) {
      const team = personTeam ? personTeam[p] : 0;
      const slot = personSlot ? personSlot[p] : p;
      const size = teamSizes ? teamSizes[team] : this.persons;
      const [r, g, b] = teamMemberColor(team, slot, size);
      this.colors[p * 3] = r;
      this.colors[p * 3 + 1] = g;
      this.colors[p * 3 + 2] = b;
    }
  }

  /**
   * Which session to track, by index into `dataset.sessionLabels`; -1 for all.
   *
   * Changing it invalidates every cursor, so it forces the next `update` down the
   * rebuild path rather than the cheap forward one.
   */
  setSession(session: number): void {
    if (session === this.session) return;
    this.session = session;
    this.sessionList = session >= 0 ? this.rowsOfSession(session) : null;
    this.lastTime = Number.NEGATIVE_INFINITY;
    this.head = 0;
    this.prevRow.fill(-1);
    this.nextRow.fill(-1);
  }

  private rowsOfSession(session: number): Int32Array | null {
    const { sessionId, count } = this.dataset;
    if (!sessionId) return null;
    let n = 0;
    for (let i = 0; i < count; i++) if (sessionId[i] === session) n++;
    const list = new Int32Array(n);
    n = 0;
    for (let i = 0; i < count; i++) if (sessionId[i] === session) list[n++] = i;
    return list;
  }

  /** Where in a walk over the rows this row falls: an index into the session's list, or the row itself. */
  private walkIndex(row: number): number {
    const list = this.sessionList;
    if (!list) return row;
    let lo = 0;
    let hi = list.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (list[mid] < row) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /** Move the cursor to `t` (dataset seconds). Cheap forward, rebuilds backward. */
  update(t: number): void {
    const { time, personId, count } = this.dataset;
    if (!time || !personId) return;

    const newHead = upperBound(time, t, 0, count);
    if (t < this.lastTime || newHead < this.head) {
      this.rebuild(newHead);
    } else {
      // Forward: every row crossed is, by ordering, a newer sample for its person.
      const list = this.sessionList;
      const end = this.walkIndex(newHead);
      for (let k = this.walkIndex(this.head); k < end; k++) {
        const i = list ? list[k] : k;
        this.prevRow[personId[i]] = i;
      }
      this.head = newHead;
      this.fillNext();
    }
    this.lastTime = t;
  }

  private rebuild(newHead: number): void {
    const { personId } = this.dataset;
    if (!personId) return;
    this.head = newHead;
    this.prevRow.fill(-1);
    const gen = ++this.stamp;
    let scanned = 0;
    // Walk backwards; the first time a person appears is their latest sample.
    const list = this.sessionList;
    for (let k = this.walkIndex(newHead) - 1; k >= 0 && scanned < this.maxScan; k--, scanned++) {
      const i = list ? list[k] : k;
      const p = personId[i];
      if (this.prevStamp[p] !== gen) {
        this.prevStamp[p] = gen;
        this.prevRow[p] = i;
      }
    }
    this.fillNext();
  }

  private fillNext(): void {
    const { personId, count } = this.dataset;
    if (!personId) return;
    const gen = ++this.stamp;
    this.nextRow.fill(-1);
    let scanned = 0;
    let found = 0;
    const list = this.sessionList;
    const end = list ? list.length : count;
    for (let k = this.walkIndex(this.head); k < end && scanned < this.maxScan && found < this.persons; k++, scanned++) {
      const i = list ? list[k] : k;
      const p = personId[i];
      if (this.nextStamp[p] !== gen) {
        this.nextStamp[p] = gen;
        this.nextRow[p] = i;
        found++;
      }
    }
  }

  /**
   * Cube instances for everyone with a usable sample at `t`.
   *
   * Where a person has samples on both sides of the playhead the position is
   * interpolated, which is what makes playback read as motion instead of a
   * stroboscope. Someone with no later sample is held for `staleSeconds` and
   * then dropped, so eliminated players don't linger forever - or, given
   * `ends` (`despawn.ts`), as the data says they end, or as long as their
   * own sample rate says.
   */
  buildCubes(
    t: number,
    interpolate: boolean,
    staleSeconds: number,
    visible: (person: number) => boolean,
    ends: Ends | null = null,
  ): { data: Float32Array; count: number } {
    const {
      time,
      px,
      py,
      pz,
      yaw,
      pitch,
      lifetime,
      personShared,
      sessionId: sessions,
    } = this.dataset;
    if (!time) return { data: this.cubeBuf, count: 0 };
    if (this.cubeBuf.length < this.persons * CUBE_STRIDE) {
      this.cubeBuf = new Float32Array(this.persons * CUBE_STRIDE);
    }
    if (this.cubeRows.length < this.persons) this.cubeRows = new Int32Array(this.persons);
    const out = this.cubeBuf;
    const shown = this.visibleCol;
    const disabled = this.disabledCol;
    let n = 0;

    for (let p = 0; p < this.persons; p++) {
      const a = this.prevRow[p];
      if (a < 0) continue;
      if (!visible(p)) continue;
      // Hidden by the recording (Visible=0) until a row shows it again.
      if (shown && shown[a] < 0.5) continue;
      const b = this.nextRow[p];
      const ta = time[a];

      let x: number;
      let y: number;
      let z: number;
      let yw: number;
      let pt: number;

      // One position to the next position *of the same player in the same
      // match*, and nothing else.
      //
      // `lifetime[a] >= 0` is exactly that test, already computed:
      // `computeLifetimes` fills the column with -1 and writes a gap only where
      // a row's successor is the same person inside the same session, so a
      // non-negative value means `b` is that successor. Reading it here instead
      // of comparing sessions directly also keeps the rule on loads whose
      // session column had too many values to list.
      //
      // The second half is identity: a name shared by several things at once —
      // every AI in every match logging as one name — is not a player, and the
      // line between two of its samples joins two different creatures. Those
      // are the long straight lines that filled the viewer.
      const joinable =
        b >= 0 &&
        !(personShared && personShared[p]) &&
        (lifetime ? lifetime[a] >= 0 : !sessions || sessions[a] === sessions[b]);

      // Past its end row (`despawn.ts`): gone.
      if (ends && t > ends.end[p]) continue;

      if (interpolate && joinable) {
        const tb = time[b];
        const span = tb - ta;
        const f = span > 1e-9 ? clamp01((t - ta) / span) : 0;
        x = px[a] + (px[b] - px[a]) * f;
        y = py[a] + (py[b] - py[a]) * f;
        z = pz[a] + (pz[b] - pz[a]) * f;
        yw = yaw ? lerpAngle(yaw[a], yaw[b], f) : 0;
        pt = pitch ? pitch[a] + (pitch[b] - pitch[a]) * f : 0;
      } else {
        // Past its data: held a few of its own sample intervals where asked (`despawn.ts`), never longer than the lifetime.
        if (t - ta > (ends ? holdLimit(ends, p, staleSeconds) : staleSeconds)) continue;
        x = px[a];
        y = py[a];
        z = pz[a];
        yw = yaw ? yaw[a] : 0;
        pt = pitch ? pitch[a] : 0;
      }

      const o = n * CUBE_STRIDE;
      out[o] = x;
      out[o + 1] = y;
      out[o + 2] = z;
      out[o + 3] = this.colors[p * 3];
      out[o + 4] = this.colors[p * 3 + 1];
      out[o + 5] = this.colors[p * 3 + 2];
      if (disabled && disabled[a] >= 0.5) {
        // Out of combat: its colour half way to grey.
        for (let c = 3; c < 6; c++) out[o + c] = out[o + c] * 0.5 + 0.25;
      }
      out[o + 6] = yw;
      out[o + 7] = pt;
      this.cubeRows[n] = a;
      n++;
    }
    return { data: out, count: n };
  }

  /**
   * Trailing history as line segments, newest opaque and fading backwards.
   *
   * Bounded by `maxVerts`: a long trail on a dense dataset would otherwise
   * generate more geometry than the entire team-viewer frame.
   */
  buildTrails(
    t: number,
    seconds: number,
    visible: (person: number) => boolean,
    maxVerts = 1 << 17,
  ): { data: Float32Array; count: number } {
    const {
      time,
      personId,
      px,
      py,
      pz,
      count,
      personShared,
      sessionId: sessions,
    } = this.dataset;
    if (!time || !personId || seconds <= 0) return { data: this.trailBuf, count: 0 };

    const list = this.sessionList;
    const lo = this.walkIndex(lowerBound(time, t - seconds, 0, count));
    const hi = this.walkIndex(this.head);
    const rows = hi - lo;
    if (rows <= 1) return { data: this.trailBuf, count: 0 };

    // One segment per consecutive pair per person, so verts ~= 2 * rows.
    const needed = Math.min(maxVerts, rows * 2) * TRAIL_STRIDE;
    if (this.trailBuf.length < needed) this.trailBuf = new Float32Array(needed);
    const out = this.trailBuf;
    const step = Math.max(1, Math.ceil((rows * 2) / maxVerts));

    const lastRowOf = new Int32Array(this.persons).fill(-1);
    let v = 0;
    const limit = Math.floor(out.length / TRAIL_STRIDE) - 2;

    for (let k = lo; k < hi; k += step) {
      const i = list ? list[k] : k;
      const p: number = personId[i];
      // A name worn by several things at once has no track to draw. One bot
      // name covered hundreds of matches in a week of data, and its consecutive
      // "samples" typically sat hundreds of metres apart — every segment a line
      // across the map between two different creatures.
      if (personShared && personShared[p]) continue;
      const prev = lastRowOf[p];
      lastRowOf[p] = i;
      if (prev < 0) continue;
      if (!visible(p)) continue;
      if (v > limit) break;
      // A trail is the same claim as an interpolation — "these two samples are
      // one movement" — so it stops at a session boundary for the same reason.
      //
      // Compared here rather than read off `lifetime`, because the decimation
      // below means `prev` is the last row of `p` that was *sampled*, not their
      // immediate successor, so a non-negative lifetime on `prev` would not
      // vouch for this particular pair.
      if (sessions && sessions[prev] !== sessions[i]) continue;

      const r = this.colors[p * 3];
      const g = this.colors[p * 3 + 1];
      const b = this.colors[p * 3 + 2];
      const aAge = 1 - (t - time[prev]) / seconds;
      const bAge = 1 - (t - time[i]) / seconds;

      v = pushVert(out, v, px[prev], py[prev], pz[prev], r, g, b, clamp01(aAge) * 0.8);
      v = pushVert(out, v, px[i], py[i], pz[i], r, g, b, clamp01(bAge) * 0.8);
    }
    return { data: out, count: v };
  }

  /** Raw samples in the window as cubes, for when interpolation hides detail. */
  buildRawSamples(
    t: number,
    seconds: number,
    visible: (person: number) => boolean,
    maxCubes = 1 << 16,
  ): { data: Float32Array; count: number } {
    const { time, personId, px, py, pz, yaw, pitch, count } = this.dataset;
    if (!time || !personId) return { data: this.cubeBuf, count: 0 };
    const list = this.sessionList;
    const lo = this.walkIndex(seconds > 0 ? lowerBound(time, t - seconds, 0, count) : 0);
    const hi = this.walkIndex(this.head);
    const rows = Math.max(0, hi - lo);
    if (rows === 0) return { data: this.cubeBuf, count: 0 };

    const take = Math.min(maxCubes, rows);
    const step = Math.max(1, Math.floor(rows / take));
    const needed = take * CUBE_STRIDE;
    if (this.cubeBuf.length < needed) this.cubeBuf = new Float32Array(needed);
    if (this.cubeRows.length < take) this.cubeRows = new Int32Array(take);
    const out = this.cubeBuf;
    let n = 0;
    for (let k = lo; k < hi && n < take; k += step) {
      const i = list ? list[k] : k;
      const p = personId[i];
      if (!visible(p)) continue;
      const o = n * CUBE_STRIDE;
      out[o] = px[i];
      out[o + 1] = py[i];
      out[o + 2] = pz[i];
      out[o + 3] = this.colors[p * 3];
      out[o + 4] = this.colors[p * 3 + 1];
      out[o + 5] = this.colors[p * 3 + 2];
      out[o + 6] = yaw ? yaw[i] : 0;
      out[o + 7] = pitch ? pitch[i] : 0;
      this.cubeRows[n] = i;
      n++;
    }
    return { data: out, count: n };
  }

  personColor(p: number): [number, number, number] {
    return [this.colors[p * 3], this.colors[p * 3 + 1], this.colors[p * 3 + 2]];
  }
}

function pushVert(
  out: Float32Array,
  v: number,
  x: number,
  y: number,
  z: number,
  r: number,
  g: number,
  b: number,
  a: number,
): number {
  const o = v * TRAIL_STRIDE;
  out[o] = x;
  out[o + 1] = y;
  out[o + 2] = z;
  out[o + 3] = r;
  out[o + 4] = g;
  out[o + 5] = b;
  out[o + 6] = a;
  return v + 1;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Interpolate yaw the short way round so crossing ±π doesn't spin the cube. */
function lerpAngle(a: number, b: number, f: number): number {
  const TWO_PI = Math.PI * 2;
  let d = (b - a) % TWO_PI;
  if (d > Math.PI) d -= TWO_PI;
  if (d < -Math.PI) d += TWO_PI;
  return a + d * f;
}
