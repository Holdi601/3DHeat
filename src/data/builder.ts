import { TrackTable } from './trackTable';
import { Dictionary, GrowableF32, GrowableU32 } from './growable';
import { msg, MsgError, sayDataset, type Msg } from './msg';
import { radixSortIndices } from './sort';
import { MAX_GROUPS } from '../render/types';
import type { AttributeColumn, Dataset, GeoReference } from '../state/types';
import { emptyBounds } from '../state/types';

/**
 * Most sessions worth *listing*.
 *
 * The session column exists for two things: a picker to choose a match from, and
 * a boundary, so that nothing joins a player's last sample of one match to their
 * first of the next. Only the picker has a size limit. It needs *labels*, and
 * labels are strings, which `postMessage` clones rather than transfers; the
 * boundary needs only the ids, which transfer for free and are kept however many
 * there are.
 *
 * 100,000 is far past any list a person will scroll and still only a few
 * megabytes to clone. Beyond it the column has stopped being something to choose
 * from — the folder that prompted this had millions of sessions at only a
 * handful of rows apiece — and listing it costs a tab.
 */
const MAX_SESSIONS = 100_000;

/**
 * One parsed file, before it is merged with its siblings.
 *
 * Time is deliberately absolute float64 seconds rather than the float32 relative
 * seconds the renderer wants. Rebasing has to happen against the origin of the
 * *whole set*, not per file: rebasing each file against its own first timestamp
 * would stack four different afternoons on top of each other. Float64 is needed
 * to hold an absolute epoch without losing sub-second resolution — a float32 can
 * only resolve about two minutes at 1.7e9.
 */
export interface SourceBlock {
  rows: number;
  px: Float32Array;
  py: Float32Array;
  pz: Float32Array;
  time: Float64Array | null;
  /** True when `time` is an epoch rather than an offset from the file's start. */
  timeIsAbsolute: boolean;
  yaw: Float32Array | null;
  pitch: Float32Array | null;
  personIds: Uint32Array | null;
  personLabels: string[];
  teamIds: Uint32Array | null;
  teamLabels: string[];
  sessionIds: Uint32Array | null;
  sessionLabels: string[];
  attrs: BlockAttr[];
  /** Rows the parser refused, for reporting. */
  rejected: number;
  /**
   * Which file this block came from.
   *
   * Retained as an attribute when more than one file is loaded, which is what
   * makes "compare this test run against that one" a filter and a difference split
   * rather than a separate code path.
   */
  sourceName?: string;
  /**
   * Where the block's positions are on the earth, before the axis mapping:
   * only a source that says so (an ACMI recording) sets it. See `GeoReference`.
   */
  geo?: GeoReference;
}

/** Attribute name for the synthesised per-row file origin. */
export const SOURCE_COLUMN = 'Source file';

export type BlockAttr =
  | { name: string; kind: 'number'; data: Float32Array }
  | { name: string; kind: 'category'; data: Uint32Array; categories: string[] };

/**
 * Accumulates several files into one Dataset.
 *
 * Merging as we go rather than concatenating at the end matters for peak memory:
 * this holds one file's arrays plus the growing result, instead of every file's
 * arrays plus a full-size copy of all of them.
 *
 * Dictionaries are shared across files, so the same player name in two test runs
 * is one person with one colour and one interpolated track, rather than two that
 * happen to overlap.
 */
export class DatasetBuilder {
  /**
   * Expected total rows, when known.
   *
   * Parquet keeps the row count in its footer, so for the common case the exact
   * total is known before a single row is read. Pre-sizing on it removes both the
   * reallocation copies and the up-to-60% growth slack — and makes `finish()`
   * hand back the buffer itself instead of a trimmed copy.
   */
  private readonly expected: number;
  private readonly px: GrowableF32;
  private readonly py: GrowableF32;
  private readonly pz: GrowableF32;
  private time: Float64Array | null = null;
  private timeLen = 0;
  private timeAbsolute = false;
  private yaw: GrowableF32 | null = null;
  private pitch: GrowableF32 | null = null;
  private person: GrowableU32 | null = null;
  private team: GrowableU32 | null = null;
  private session: GrowableU32 | null = null;
  private readonly personDict = new Dictionary();
  private readonly teamDict = new Dictionary();
  private readonly sessionDict = new Dictionary();

  private readonly numberAttrs = new Map<string, GrowableF32>();
  private readonly categoryAttrs = new Map<string, { out: GrowableU32; dict: Dictionary }>();
  /** Order columns were first seen, so the UI list is stable. */
  private readonly attrOrder: string[] = [];

  private rows = 0;
  private rejected = 0;
  private sources = 0;
  /**
   * The blocks' shared geographic reference: undefined before the first block,
   * null once two blocks disagree or one has none, since positions projected
   * about two different points cannot share one backdrop.
   */
  private geo: GeoReference | null | undefined = undefined;

  constructor(expectedRows = 0) {
    this.expected = Math.max(0, Math.floor(expectedRows));
    this.px = new GrowableF32(this.expected || undefined);
    this.py = new GrowableF32(this.expected || undefined);
    this.pz = new GrowableF32(this.expected || undefined);
  }

  get rowCount(): number {
    return this.rows;
  }

  /** Capacity for an optional column that appears part-way through a load. */
  private capacity(): number | undefined {
    return this.expected || undefined;
  }

  append(block: SourceBlock): void {
    const n = block.rows;
    this.sources++;
    this.rejected += block.rejected;
    if (n === 0) return;
    this.geo = mergeGeo(this.geo, block.geo ?? null);
    const base = this.rows;

    appendF32(this.px, block.px, n);
    appendF32(this.py, block.py, n);
    appendF32(this.pz, block.pz, n);

    if (block.time) {
      this.time = growF64(this.time, base + n, this.expected);
      this.time.set(block.time.subarray(0, n), base);
      this.timeLen = base + n;
      this.timeAbsolute = this.timeAbsolute || block.timeIsAbsolute;
    } else if (this.time) {
      // A file with no time column among files that have one: pad so the arrays
      // stay aligned rather than silently shifting every later row.
      this.time = growF64(this.time, base + n, this.expected);
      this.timeLen = base + n;
    }

    // Optional columns can appear in a later file than the first. Back-fill the
    // rows already accumulated so every column stays row-aligned.
    if (block.yaw) {
      this.yaw ??= zeroFilled(base, this.capacity());
      appendF32(this.yaw, block.yaw, n);
    } else if (this.yaw) {
      padF32(this.yaw, n);
    }
    if (block.pitch) {
      this.pitch ??= zeroFilled(base, this.capacity());
      appendF32(this.pitch, block.pitch, n);
    } else if (this.pitch) {
      padF32(this.pitch, n);
    }

    if (block.personIds) {
      this.person ??= zeroFilledU32(base, this.capacity());
      const remap = remapDictionary(block.personLabels, this.personDict);
      for (let i = 0; i < n; i++) this.person.push(remap[block.personIds[i]]);
    } else if (this.person) {
      padU32(this.person, n);
    }

    if (block.sessionIds) {
      this.session ??= zeroFilledU32(base, this.capacity());
      const remap = remapDictionary(block.sessionLabels, this.sessionDict);
      for (let i = 0; i < n; i++) this.session.push(remap[block.sessionIds[i]]);
    } else if (this.session) {
      padU32(this.session, n);
    }

    if (block.teamIds) {
      this.team ??= zeroFilledU32(base, this.capacity());
      const remap = remapDictionary(block.teamLabels, this.teamDict);
      for (let i = 0; i < n; i++) this.team.push(remap[block.teamIds[i]]);
    } else if (this.team) {
      padU32(this.team, n);
    }

    // Synthesise the file-origin column. Cheap to carry (4 bytes/row, one
    // category per file) and it turns "compare these two test runs" into the same
    // filter and difference-split machinery every other column uses.
    const blockAttrs =
      block.sourceName === undefined
        ? block.attrs
        : [
            ...block.attrs,
            {
              name: SOURCE_COLUMN,
              kind: 'category' as const,
              data: new Uint32Array(n), // every row is category 0 within this block
              categories: [block.sourceName],
            },
          ];

    const seen = new Set<string>();
    for (const attr of blockAttrs) {
      seen.add(attr.name);
      if (!this.numberAttrs.has(attr.name) && !this.categoryAttrs.has(attr.name)) {
        this.attrOrder.push(attr.name);
      }
      if (attr.kind === 'number') {
        let g = this.numberAttrs.get(attr.name);
        if (!g) {
          g = zeroFilled(base, this.capacity());
          this.numberAttrs.set(attr.name, g);
        }
        appendF32(g, attr.data, n);
      } else {
        let c = this.categoryAttrs.get(attr.name);
        if (!c) {
          c = { out: zeroFilledU32(base, this.capacity()), dict: new Dictionary() };
          // Index 0 is reserved as the empty label so back-filled rows read as
          // missing rather than as whichever category happened to be first.
          c.dict.intern('');
          this.categoryAttrs.set(attr.name, c);
        }
        const remap = remapDictionary(attr.categories, c.dict);
        for (let i = 0; i < n; i++) c.out.push(remap[attr.data[i]]);
      }
    }
    // Columns this file lacks still need their rows.
    for (const [name, g] of this.numberAttrs) if (!seen.has(name)) padF32(g, n);
    for (const [name, c] of this.categoryAttrs) if (!seen.has(name)) padU32(c.out, n);

    this.rows = base + n;
  }

  /**
   * @param onPhase Called as each step of the build begins.
   *
   * The build is not one step, and pretending it is caused a bug report. The
   * caller emitted a single "Sorting by time" line and then handed control to
   * this method, which sorts, permutes nine or ten columns, scans for bounds,
   * builds the roster, summarises sessions and computes a lifetime per row. On
   * forty million rows that is a long silence under a label naming only the first
   * of those, and a long silence is indistinguishable from a hang.
   */
  finish(
    name: string,
    onPhase?: (label: Msg) => void,
    /**
     * Ceiling on how many sessions keep their labels. Defaults to `MAX_SESSIONS`.
     *
     * Injectable only so the behaviour can be tested without building a hundred
     * thousand sessions to trip it: a test that has to construct the pathological
     * input at full size is a test nobody runs.
     */
    maxSessions: number = MAX_SESSIONS,
  ): Dataset {
    const n = this.rows;
    if (n === 0) throw new MsgError(msg('data.builder.noRows'));
    const phase = (key: string, values?: Msg['values']) => onPhase?.(msg(key, values));

    const px = this.px.finish();
    const py = this.py.finish();
    const pz = this.pz.finish();

    // Rebase absolute time onto its own minimum, in float32 seconds. This is the
    // step that has to see all files at once.
    let time: Float32Array | null = null;
    let epochMs: number | null = null;
    let timeOrigin = 0;
    if (this.time && this.timeLen === n) {
      let min = Infinity;
      for (let i = 0; i < n; i++) {
        const v = this.time[i];
        if (Number.isFinite(v) && v < min) min = v;
      }
      if (Number.isFinite(min)) {
        time = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const v = this.time[i];
          time[i] = Number.isFinite(v) ? v - min : 0;
        }
        if (this.timeAbsolute) epochMs = min * 1000;
        else timeOrigin = min;
      }
    }

    const warnings: Msg[] = [];
    const attrsRaw: AttributeColumn[] = [];
    for (const attrName of this.attrOrder) {
      const num = this.numberAttrs.get(attrName);
      if (num) {
        const data = num.finish();
        attrsRaw.push({ name: attrName, kind: 'number', data, ...minMax(data) });
        continue;
      }
      const cat = this.categoryAttrs.get(attrName);
      if (cat) {
        // Same ceiling as groups, for the same reason: a category is something
        // you tick in a list or put on one side of a difference, and both read a
        // table `MAX_GROUPS` wide. A column with a quarter of a million values —
        // a session key, a GUID — cannot be either, so retaining it would cost 4
        // bytes a row and a dictionary the size of the dataset to make a list
        // nobody can scroll and a mask that silently rejects everything past its
        // end. The rows themselves are untouched.
        if (cat.dict.size > MAX_GROUPS) {
          warnings.push(
            msg('data.builder.columnDropped', {
              column: attrName,
              count: cat.dict.size,
              shown: { int: cat.dict.size },
              max: { int: MAX_GROUPS },
            }),
          );
          continue;
        }
        attrsRaw.push({
          name: attrName,
          kind: 'category',
          data: cat.out.finish(),
          min: 0,
          max: Math.max(0, cat.dict.size - 1),
          categories: cat.dict.labels,
        });
      }
    }

    // Release the float64 time accumulator now that the f32 relative column
    // exists: it is 8 bytes per row and nothing below needs it.
    this.time = null;

    // Concatenated files are essentially never globally time-ordered, so this
    // sort is the normal path rather than an exception.
    phase('data.builder.phase.sort');
    const order = time && !isAscending(time) ? radixSortIndices(time) : null;

    const yaw = this.yaw ? this.yaw.finish() : null;
    const pitch = this.pitch ? this.pitch.finish() : null;
    const personRaw = this.person ? this.person.finish() : null;
    const sessionRaw = this.session ? this.session.finish() : null;
    let teamRaw = this.team ? this.team.finish() : null;
    const attrs: AttributeColumn[] = attrsRaw;

    // A column with more distinct values than can be grouped by is not a group,
    // it is an id — one value per player, per match, per row. The rows are
    // otherwise perfectly good, so drop the *grouping* and keep the load. This
    // used to throw, which meant a read of several hundred MB and millions of
    // rows was discarded at the last step because of one auto-mapping guess.
    //
    // Checked before the sort below so the column is not permuted on the way out.
    if (teamRaw && this.teamDict.size > MAX_GROUPS) {
      warnings.push(
        msg('data.builder.groupsDropped', {
          count: this.teamDict.size,
          shown: { int: this.teamDict.size },
          max: { int: MAX_GROUPS },
        }),
      );
      teamRaw = null;
      this.team = null;
    }
    const teamLabels = teamRaw ? this.teamDict.labels : [];
    const teamCount = teamRaw ? this.teamDict.size : 0;

    if (order) {
      // One scratch buffer shared by every column: 4 bytes per row total,
      // rather than a duplicate of each column.
      const permuter = new Permuter(n);
      const cols = [px, py, pz, time, yaw, pitch, personRaw, sessionRaw, teamRaw].filter(Boolean);
      const totalCols = cols.length + attrs.length;
      let done = 0;
      // Per column rather than once for the lot: this is the longest step in the
      // build on a large load — a full gather over every row, repeated ten or so
      // times — and it is the one that most needs to be seen moving.
      const step = () => phase('data.builder.phase.reorder', { done: { int: ++done }, total: { int: totalCols } });
      for (const col of cols) {
        step();
        permuter.apply(col as Float32Array | Uint32Array, order);
      }
      for (const c of attrs) {
        step();
        permuter.apply(c.data, order);
      }
    }

    // Narrow to 16 bits only now, after sorting, so the wide array is short-lived.
    let teamId: Uint16Array | null = null;
    if (teamRaw) {
      teamId = new Uint16Array(n);
      for (let i = 0; i < n; i++) teamId[i] = teamRaw[i];
    }

    const dataset: Dataset = {
      id: `ds-${Date.now()}-${n}`,
      name,
      count: n,
      px,
      py,
      pz,
      time,
      epochMs,
      timeOrigin,
      yaw,
      pitch,
      personId: personRaw,
      teamId,
      personLabels: this.personDict.labels,
      teamLabels,
      sessionId: sessionRaw,
      sessionLabels: sessionRaw ? this.sessionDict.labels : [],
      sessionRows: null,
      sessionStart: null,
      sessionEnd: null,
      personTeam: null,
      personSlot: null,
      teamSizes: null,
      lifetime: null,
      maxLifetimeGap: 0,
      personShared: null,
      attrs,
      warnings: [],
      bounds: emptyBounds(),
      timeRange: time ? [time[0], time[n - 1]] : [0, 0],
      timeSorted: true,
      ...(this.geo ? { geo: { ...this.geo } } : {}),
    };

    phase('data.builder.phase.extent');
    const b = dataset.bounds;
    const { px: fx, py: fy, pz: fz } = dataset;
    for (let i = 0; i < n; i++) {
      if (fx[i] < b.minX) b.minX = fx[i];
      if (fx[i] > b.maxX) b.maxX = fx[i];
      if (fy[i] < b.minY) b.minY = fy[i];
      if (fy[i] > b.maxY) b.maxY = fy[i];
      if (fz[i] < b.minZ) b.minZ = fz[i];
      if (fz[i] > b.maxZ) b.maxZ = fz[i];
    }

    phase('data.builder.phase.roster');
    const roster = buildRoster(dataset.personId, dataset.teamId, this.personDict.size, teamCount, n);
    dataset.personTeam = roster.personTeam;
    dataset.personSlot = roster.personSlot;
    dataset.teamSizes = roster.teamSizes;

    if (sessionRaw && this.sessionDict.size <= maxSessions) {
      phase('data.builder.phase.sessions');
      const stats = summariseSessions(sessionRaw, dataset.time, this.sessionDict.size, n);
      dataset.sessionRows = stats.rows;
      dataset.sessionStart = stats.start;
      dataset.sessionEnd = stats.end;
    }

    if (dataset.time && dataset.personId) {
      phase('data.builder.phase.lifetimes');
      const life = computeLifetimes(
        dataset.time,
        dataset.personId,
        this.personDict.size,
        n,
        dataset.sessionId,
        dataset.px,
        dataset.py,
        dataset.pz,
        attrs.filter((a) => a.kind === 'category').map((a) => a.data as Uint32Array),
        // A hundredth of the diagonal of the loaded extent. On the test level
        // that is tens of metres: far beyond the couple of metres between a
        // shotgun's pellet spawns, far below the hundreds of metres typically
        // between two bots sharing a name. Squared, to keep a square root out of
        // the loop.
        (() => {
          const d = dataset.bounds;
          const dx = d.maxX - d.minX;
          const dy = d.maxY - d.minY;
          const dz = d.maxZ - d.minZ;
          const diag = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const sep = diag * 0.01;
          return sep * sep;
        })(),
      );
      dataset.lifetime = life.lifetime;
      dataset.maxLifetimeGap = life.maxGap;
      dataset.personShared = life.shared;
      if (life.sharedCount > 0) {
        const examples: Array<string | Msg> = [];
        for (let p = 0; p < life.shared.length && examples.length < 3; p++) {
          if (life.shared[p]) examples.push(this.personDict.labels[p] || msg('data.builder.blankName'));
        }
        warnings.push(
          msg('data.builder.sharedNames', {
            shared: { int: life.sharedCount },
            total: this.personDict.size,
            examples: { each: examples, between: ', ' },
            more: life.sharedCount > examples.length ? 'yes' : 'no',
          }),
        );
      }
    }

    /**
     * Stop *listing* a session column that is really an id.
     *
     * This is the bug that killed tabs. `sessionLabels` is a plain string array,
     * and strings cannot be transferred across `postMessage`: the structured
     * clone copies every one of them into the receiving thread as its own heap
     * object. On one folder of the test export the Session column held
     * **millions** of distinct timestamps, so finishing the ingest meant cloning
     * millions of strings — and the tab died with `Out of Memory` at what looked like
     * the last phase the worker had announced, "Computing lifetimes", because
     * nothing after that point reports anything.
     *
     * The same ingest completes in Node, where there is no `postMessage`, within
     * a few percent of its memory estimate — which is what pinned the cost to the
     * hand-off rather than to the load.
     *
     * Only the *labels* go. The ids are a Uint32Array of four bytes a row that
     * `postMessage` hands over without copying, and they are what tells the team
     * viewer that two samples belong to two different matches. Dropping them as
     * well — which this did at first, on the grounds that a column too big to
     * list is a column nobody wants — turned every boundary check downstream
     * into a no-op, because each is written as "compare the sessions if we have
     * them". Interpolation and trails then joined a player's last sample of one
     * match to their first of the next, and the viewer filled with straight lines
     * hundreds of metres long. Saving four bytes a row is not worth that; the
     * millions of strings were the whole cost.
     */
    if (sessionRaw && this.sessionDict.size > maxSessions) {
      warnings.push(
        msg('data.builder.sessionsDropped', {
          count: this.sessionDict.size,
          shown: { int: this.sessionDict.size },
          max: { int: maxSessions },
        }),
      );
      dataset.sessionLabels = [];
      dataset.sessionRows = null;
      dataset.sessionStart = null;
      dataset.sessionEnd = null;
    }

    const notes: Msg[] = [msg('data.builder.rows', { count: n })];
    if (this.sources > 1) notes.push(msg('data.builder.files', { count: this.sources }));
    if (this.rejected > 0) notes.push(msg('data.builder.rejected', { count: this.rejected }));
    // Said here and again on the main thread, in the viewer's language (see data/msg).
    dataset.said = { name, notes, warnings };
    sayDataset(dataset);
    return dataset;
  }
}

// ------------------------------------------------------------------ internals

/**
 * The reference a load keeps after one more block: the first block's, as long
 * as every block carries the same one. Exact equality, because the blocks of
 * one recording share the very numbers its header gave.
 */
export function mergeGeo(kept: GeoReference | null | undefined, next: GeoReference | null): GeoReference | null {
  if (kept === undefined) return next;
  if (!kept || !next) return null;
  return kept.lat0 === next.lat0 && kept.lon0 === next.lon0 && kept.projection === next.projection ? kept : null;
}

/**
 * How long each row stays current: the gap to the same person's next sample.
 *
 * This is what lets timeline playback show one live position per person instead
 * of an ever-growing pile of stale ones. A row with no successor gets -1 rather
 * than a guessed duration, because what that means — left, died, or simply
 * stopped being logged — is a viewing decision made at render time.
 *
 * Requires `time` ascending, which the sort above guarantees, so a single
 * forward pass with one cursor per person is enough.
 */
function computeLifetimes(
  time: Float32Array,
  personId: Uint32Array,
  personCount: number,
  rows: number,
  sessionId: Uint32Array | null,
  px: Float32Array,
  py: Float32Array,
  pz: Float32Array,
  /**
   * Every retained *categorical* column, for deciding whether two rows are the
   * same kind of record. Numbers are left out deliberately: a duration or a
   * score differing between two rows says nothing about what they are.
   */
  categories: Uint32Array[],
  /**
   * How far apart two simultaneous records must be before they are taken as
   * evidence of two entities, squared, in world units.
   *
   * Needed because plenty of event types legitimately write several rows at one
   * instant a short way apart: a shotgun blast logs a shot event per pellet,
   * each from its own muzzle position,
   * which is why requiring the same kind of record was not enough on its own —
   * it left many times more names marked than both qualifiers together. Derived
   * from the extent of the data rather than fixed, because the world units
   * depend on the axis mapping.
   */
  minSeparationSq: number,
): { lifetime: Float32Array; maxGap: number; shared: Uint8Array; sharedCount: number } {
  const lifetime = new Float32Array(rows).fill(-1);
  const tracks = new TrackTable(personCount);
  const shared = new Uint8Array(Math.max(1, personCount));
  const cats = categories.length;
  let maxGap = 0;
  let sharedCount = 0;
  for (let i = 0; i < rows; i++) {
    const p = personId[i];
    // A person's last row of one match has no successor, however soon they
    // appear in the next one. Without this the gap between the two is recorded
    // as a lifetime — on a dataset of concatenated matches that is the *largest*
    // gap in the file, and `maxLifetimeGap` is what the fade defaults are
    // derived from, so one player rejoining set the fade for everybody.
    //
    // Per match and not per person, because matches interleave: see `TrackTable`.
    const track = tracks.track(p, sessionId ? sessionId[i] : 0);
    const prev = tracks.last[track];
    if (prev >= 0) {
      const gap = time[i] - time[prev];
      if (gap === 0 && (px[i] !== px[prev] || py[i] !== py[prev] || pz[i] !== pz[prev])) {
        // Two places at one instant. Whatever these two rows are, they are not
        // one position followed by the next, so no lifetime is written and the
        // pair can never be joined. Position rather than a distance threshold,
        // because the world units depend on the axis mapping.
        //
        // Most of these are one event logged from both sides: this export
        // writes an ability event once per party, under the same name at the
        // same instant, one carrying each party's
        // position — hundreds of thousands of such pairs in two files. They are
        // records of different kinds, and two different kinds of record say
        // nothing about identity, so they mark nobody.
        //
        // When the two rows are the same kind of record *and* far enough apart
        // to be two places, the name itself is worn by more than one thing.
        // Both qualifiers are what make the conclusion safe: over two files,
        // the bare test marked most names, each qualifier alone still left far
        // too many, and together they leave a handful. See
        // `Dataset.personShared` for the table and for what that handful is.
        if (shared[p] === 0) {
          const dx = px[i] - px[prev];
          const dy = py[i] - py[prev];
          const dz = pz[i] - pz[prev];
          if (dx * dx + dy * dy + dz * dz > minSeparationSq) {
            let sameKind = true;
            for (let c = 0; c < cats; c++) {
              if (categories[c][i] !== categories[c][prev]) {
                sameKind = false;
                break;
              }
            }
            if (sameKind) {
              shared[p] = 1;
              sharedCount++;
            }
          }
        }
      } else {
        lifetime[prev] = gap;
        if (gap > maxGap) maxGap = gap;
      }
    }
    tracks.last[track] = i;
  }
  return { lifetime, maxGap, shared, sharedCount };
}

/**
 * Rows and time span per session, for the session picker.
 *
 * Computed here because it is one pass over a column that is already in cache,
 * and because the picker needs to say something useful about each session: a
 * list of forty ISO timestamps is unusable, and the same list with "1,842 rows,
 * 12 minutes" beside each is a list you can choose from.
 */
function summariseSessions(
  sessionId: Uint32Array,
  time: Float32Array | null,
  sessionCount: number,
  rows: number,
): { rows: Uint32Array; start: Float32Array; end: Float32Array } {
  const size = Math.max(1, sessionCount);
  const counts = new Uint32Array(size);
  const start = new Float32Array(size).fill(Number.POSITIVE_INFINITY);
  const end = new Float32Array(size).fill(Number.NEGATIVE_INFINITY);
  for (let i = 0; i < rows; i++) {
    const s = sessionId[i];
    counts[s]++;
    if (time) {
      const t = time[i];
      if (t < start[s]) start[s] = t;
      if (t > end[s]) end[s] = t;
    }
  }
  for (let s = 0; s < size; s++) {
    if (!Number.isFinite(start[s])) start[s] = 0;
    if (!Number.isFinite(end[s])) end[s] = 0;
  }
  return { rows: counts, start, end };
}

/** Map one file's local dictionary ids onto the shared dictionary's ids. */
function remapDictionary(labels: string[], target: Dictionary): Uint32Array {
  const remap = new Uint32Array(Math.max(1, labels.length));
  for (let i = 0; i < labels.length; i++) remap[i] = target.intern(labels[i]);
  return remap;
}

function appendF32(g: GrowableF32, src: Float32Array, n: number): void {
  g.pushAll(src, n);
}

function padF32(g: GrowableF32, n: number): void {
  g.pad(n);
}

function padU32(g: GrowableU32, n: number): void {
  g.pad(n);
}

function zeroFilled(backfill: number, capacity?: number): GrowableF32 {
  const g = new GrowableF32(Math.max(capacity ?? 0, backfill, 1));
  g.pad(backfill);
  return g;
}

function zeroFilledU32(backfill: number, capacity?: number): GrowableU32 {
  const g = new GrowableU32(Math.max(capacity ?? 0, backfill, 1));
  g.pad(backfill);
  return g;
}

/**
 * Sized once from the rows expected, like the other columns. Growing by 1.6 from nothing
 * failed outright past 220M rows: the step to 353M is 2.8 GB in one array, more than a
 * tab will allocate at once, and every file after that was reported unreadable.
 */
function growF64(cur: Float64Array | null, min: number, expected = 0): Float64Array {
  if (cur && cur.length >= min) return cur;
  const grown = Math.max(min, Math.ceil((cur?.length ?? 1 << 16) * 1.6));
  let next: Float64Array;
  try {
    next = new Float64Array(Math.max(grown, expected));
  } catch {
    // The rows expected may be an overestimate: what is really needed may still fit.
    next = new Float64Array(grown);
  }
  if (cur) next.set(cur);
  return next;
}

export function isAscending(a: Float32Array): boolean {
  for (let i = 1; i < a.length; i++) if (a[i] < a[i - 1]) return false;
  return true;
}

/**
 * Applies one sort permutation to many columns, in place, via a single reusable
 * scratch buffer.
 *
 * Getting this right took two attempts and both failure modes are worth naming.
 * Permuting each column into a *fresh* array is fast but doubles peak memory
 * during the sort, which on a hundred-million-row dataset is the difference
 * between loading and an out-of-memory tab. Doing it truly in place by
 * cycle-following needs only a visited bit per row — but it chases pointers
 * through memory with no locality whatsoever, and measured on a multi-million-row
 * load it made the sort stage 27x slower (0.6s to 17.6s).
 *
 * So: gather into one 4-bytes-per-row scratch buffer shared by every column, then
 * copy back. The gather is the same random-read pass the fast version did, the
 * copy-back is purely sequential and nearly free, and the extra memory is 4 bytes
 * per row total rather than a duplicate of every column.
 */
export class Permuter {
  private readonly f32: Float32Array;
  private readonly u32: Uint32Array;

  constructor(rows: number) {
    // One allocation, two views: both column types are 4 bytes wide.
    const buf = new ArrayBuffer(Math.max(1, rows) * 4);
    this.f32 = new Float32Array(buf);
    this.u32 = new Uint32Array(buf);
  }

  apply(column: Float32Array | Uint32Array, order: Uint32Array): void {
    const n = order.length;
    if (column instanceof Float32Array) {
      const s = this.f32;
      for (let i = 0; i < n; i++) s[i] = column[order[i]];
      column.set(s.subarray(0, n));
    } else {
      const s = this.u32;
      for (let i = 0; i < n; i++) s[i] = column[order[i]];
      column.set(s.subarray(0, n));
    }
  }
}

export function permuteF32(src: Float32Array, order: Uint32Array): Float32Array {
  const out = new Float32Array(order.length);
  for (let i = 0; i < order.length; i++) out[i] = src[order[i]];
  return out;
}

export function permuteU32(src: Uint32Array, order: Uint32Array): Uint32Array {
  const out = new Uint32Array(order.length);
  for (let i = 0; i < order.length; i++) out[i] = src[order[i]];
  return out;
}

function minMax(a: Float32Array): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < a.length; i++) {
    const v = a[i];
    if (Number.isFinite(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return { min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : 0 };
}

/**
 * person -> team, and person -> index within that team. First observation wins,
 * which keeps a colour stable for someone who appears on two sides across files.
 */
function buildRoster(
  personId: Uint32Array | null,
  teamId: Uint16Array | null,
  personCount: number,
  teamCount: number,
  rows: number,
): {
  personTeam: Uint16Array | null;
  personSlot: Uint16Array | null;
  teamSizes: Uint32Array | null;
} {
  if (!personId || personCount === 0) {
    return { personTeam: null, personSlot: null, teamSizes: null };
  }
  const personTeam = new Uint16Array(personCount);
  const seen = new Uint8Array(personCount);
  if (teamId) {
    for (let i = 0; i < rows; i++) {
      const p = personId[i];
      if (!seen[p]) {
        seen[p] = 1;
        personTeam[p] = teamId[i];
      }
    }
  }
  const teams = Math.max(1, teamCount);
  const teamSizes = new Uint32Array(teams);
  const personSlot = new Uint16Array(personCount);
  for (let p = 0; p < personCount; p++) {
    const t = personTeam[p];
    personSlot[p] = Math.min(65535, teamSizes[t]);
    teamSizes[t]++;
  }
  return { personTeam, personSlot, teamSizes };
}
