import { parquetMetadataAsync } from 'hyparquet';
import { DatasetBuilder, type SourceBlock } from './builder';
import { ingestCsv, type IngestProgress } from './ingest';
import { ingestParquet } from './ingestParquet';
import { ingestAcmi } from './ingestAcmi';
import { ingestOcap } from './ingestOcap';
import { ingestGeo } from './ingestGeo';
import { fileParseBytes, parseHeadroom } from './memory';
import { errorMsg, msg, MsgError, say, sayDataset, type Msg } from './msg';
import { asyncBufferFromFile } from './parquet';
import { detectFormat } from './sourcePreview';
import type { ColumnMapping, Dataset } from '../state/types';

/** Parse one file into a block, wherever that happens: this thread or a worker. */
export type ParseFileFn = (
  file: File,
  mapping: ColumnMapping,
  columns: string[],
  stride: number,
  onProgress: (p: IngestProgress) => void,
) => Promise<SourceBlock>;

/** Parsing in this thread. The default, and what each parser worker runs. */
export const parseHere: ParseFileFn = async (file, mapping, columns, stride, onProgress) => {
  if (file.size === 0) throw new MsgError(msg('data.ingestFiles.emptyFile'));
  const format = detectFormat(file.name);
  if (format === 'acmi') return ingestAcmi(file, mapping, onProgress, stride);
  if (format === 'ocap') return ingestOcap(file, mapping, onProgress, stride);
  if (format === 'geo') return ingestGeo(file, mapping, onProgress, stride);
  return format === 'parquet'
    ? ingestParquet(file, mapping, onProgress, stride)
    : ingestCsv(file, mapping, columns, onProgress, stride);
};

/**
 * A parser thread that died, as opposed to a file that could not be read.
 *
 * A file's own failure is reported and the others carry on. A thread that died
 * took its file with it for a reason that is not the file's — memory, most
 * likely — and carrying on with the others is how that reason repeats, so it
 * ends the load, exactly as the death of the one ingest thread always did.
 */
export class ParserCrash extends MsgError {}

export interface IngestFilesOptions {
  files: File[];
  mapping: ColumnMapping;
  /** Header order, needed only by the CSV path. */
  columns: string[];
  name: string;
  /**
   * Keep one row in `stride`. The escape hatch for a selection that exceeds the
   * memory budget: a uniform subsample has the same heat distribution, so a
   * decimated view is a faithful view with more noise rather than a wrong one.
   */
  stride?: number;
  /**
   * Total rows expected across the selection, when known.
   *
   * Parquet keeps the count in its footer, so this is usually exact and known
   * before anything is read. Passing it lets every column be allocated once at
   * the right size instead of grown, which removes both the reallocation copies
   * and the growth slack.
   */
  expectedRows?: number;
  /**
   * Files parsed at once: the "Parser threads" budget. 1, the default, parses
   * one file after another.
   */
  threads?: number;
  /**
   * The RAM budget in bytes, which the files being parsed share with the
   * builder. Without one, only `threads` limits how many are in flight.
   */
  ramBudget?: number;
  /** Where one file is parsed. Defaults to this thread; the worker hands in its pool. */
  parseFile?: ParseFileFn;
  onProgress?: (p: IngestProgress) => void;
}

export interface IngestFilesResult {
  dataset: Dataset;
  /**
   * Files that could not be read, with the reason. Never silently dropped.
   * `why` is the reason as a message, for the main thread to say in its language.
   */
  failures: Array<{ file: string; reason: string; why: Msg | string }>;
}

/**
 * Read a whole selection into one dataset.
 *
 * Lives outside the worker so it can be tested directly against real files.
 *
 * Files are merged into a shared builder as they are parsed, rather than
 * concatenated afterwards: peak memory stays at the files being parsed plus the
 * growing result, and the person/team dictionaries are shared, so the same player
 * across several test runs is one person with one colour and one continuous track.
 *
 * With more than one parser thread, several files are parsed at once — as many
 * as `threads`, and only as many as the RAM budget leaves room for beside the
 * builder (see `parseInOrder`). They are still merged one at a time in selection
 * order, so the dataset is the one a sequential load builds.
 *
 * A folder of telemetry is routinely heterogeneous — movement events next to
 * damage events with an entirely different schema, plus the occasional 0-byte
 * file. One unreadable file must not throw away the others' work, so failures
 * are collected and reported rather than raised, unless nothing loaded at all.
 */
/**
 * How close to the expected row count still counts as a complete load.
 *
 * Not 1: the expected figure comes from Parquet footers and counts every row in
 * the file, while rows without a usable position are dropped on the way in, so a
 * small shortfall is normal and warning about it would train people to ignore the
 * warning. 5% is well below any of the real shortfalls seen — the one that
 * prompted this was 81%.
 */
const SHORTFALL_TOLERANCE = 0.95;

export async function ingestFiles(opts: IngestFilesOptions): Promise<IngestFilesResult> {
  const { files, mapping, columns, name, onProgress } = opts;
  const parseFile = opts.parseFile ?? parseHere;
  const stride = Math.max(1, Math.floor(opts.stride ?? 1));
  const expected = opts.expectedRows ? Math.ceil(opts.expectedRows / stride) : 0;
  const builder = new DatasetBuilder(expected);
  const failures: IngestFilesResult['failures'] = [];
  const total = files.length;
  const threads = total > 1 ? Math.max(1, Math.floor(opts.threads ?? 1)) : 1;

  /**
   * Progress across the selection, kept per file because several can be in
   * flight. One file at a time this is exactly the old blend — `(i + f) / total`
   * and the merged rows plus the current file's — so a sequential load reports
   * as it always did.
   */
  const fraction = new Float64Array(total);
  const partial = new Float64Array(total);
  let fractionSum = 0;
  let partialRows = 0;
  let merged = 0;
  let running = 0;

  const parseOne = async (i: number): Promise<SourceBlock> => {
    const file = files[i];
    const report = (p: IngestProgress) => {
      if (p.fraction !== null) {
        fractionSum += p.fraction - fraction[i];
        fraction[i] = p.fraction;
      }
      partialRows += p.rows - partial[i];
      partial[i] = p.rows;
      const step = total > 1 ? msg('data.ingestFiles.fileStep', { file: i + 1, files: total, step: p.msg }) : p.msg;
      onProgress?.({
        label: say(step),
        msg: step,
        // Blend per-file progress into progress across the whole selection. An
        // unknown fraction blanks the bar only when this is the one file being
        // read; with others in flight, theirs is still known.
        fraction: p.fraction === null && running <= 1 ? null : (merged + fractionSum) / total,
        rows: builder.rowCount + partialRows,
      });
    };
    running++;
    try {
      return await parseFile(file, mapping, columns, stride, report);
    } finally {
      running--;
      // Read, though perhaps not merged yet: it counts as done.
      fractionSum += 1 - fraction[i];
      fraction[i] = 1;
    }
  };

  const take = (i: number, outcome: Outcome<SourceBlock>) => {
    const file = files[i];
    fractionSum -= fraction[i];
    partialRows -= partial[i];
    fraction[i] = 0;
    partial[i] = 0;
    merged++;
    try {
      if (!outcome.ok) throw outcome.error;
      const block = outcome.value;
      // Tag the origin only when there is more than one file. With a single file
      // the column would be a constant, and a constant column costs 4 bytes a row
      // to tell you nothing.
      builder.append(total > 1 ? { ...block, sourceName: file.name } : block);
    } catch (err) {
      if (err instanceof ParserCrash) throw err;
      const why = errorMsg(err);
      failures.push({ file: file.name, reason: say(why), why });
      // A single-file load has nothing to fall back on, so surface it directly.
      if (total === 1) throw err;
    }
  };

  if (threads === 1) {
    // One after another, in the order everything is merged in however the
    // files are parsed.
    for (let i = 0; i < total; i++) {
      let outcome: Outcome<SourceBlock>;
      try {
        outcome = { ok: true, value: await parseOne(i) };
      } catch (error) {
        outcome = { ok: false, error };
      }
      take(i, outcome);
    }
  } else {
    const sizes = await rowsPerFile(files, opts.expectedRows ?? 0);
    // With no total given, the builder still grows to the files' own counts.
    const builderRows = expected || Math.ceil(sizes.rows.reduce((a, b) => a + b, 0) / stride);
    const headroom =
      opts.ramBudget === undefined
        ? Number.POSITIVE_INFINITY
        : parseHeadroom(mapping, opts.ramBudget, builderRows, total, sizes.exact && expected > 0);
    await parseInOrder({
      count: total,
      threads,
      headroom,
      cost: (i) => fileParseBytes(mapping, sizes.rows[i]),
      parse: parseOne,
      take,
    });
  }

  if (builder.rowCount === 0) {
    const detail = failures.map((f) => msg('data.ingestFiles.fileFailed', { file: f.file, reason: f.why }));
    throw new MsgError(
      detail.length ? msg('data.ingestFiles.noRowsBecause', { files: { each: detail, between: '\n' } }) : msg('data.ingestFiles.noRows'),
    );
  }

  // Each step of the build reports itself. One "Sorting by time" line used to
  // cover the whole of `finish()` — the sort, a gather over every row for each of
  // ten columns, the extent scan, the roster, the session summary and a lifetime
  // per row — so the last thing anyone saw before a minute of silence named only
  // the first of those. It read as a freeze, and it was reported as one.
  const loaded = builder.rowCount;
  const dataset = builder.finish(name, (step) =>
    onProgress?.({ label: say(step), msg: step, fraction: null, rows: loaded }),
  );
  if (mapping.entitySize) dataset.entitySize = mapping.entitySize * (mapping.axes.scale || 1);
  dataset.axes = { ...mapping.axes };
  const roles: NonNullable<typeof dataset.roleColumns> = {};
  if (mapping.x) roles.x = mapping.x;
  if (mapping.y) roles.y = mapping.y;
  if (mapping.z) roles.z = mapping.z;
  if (mapping.time) roles.time = mapping.time;
  if (mapping.personId) roles.person = mapping.personId;
  if (mapping.teamId) roles.team = mapping.teamId;
  if (mapping.sessionId) roles.session = mapping.sessionId;
  dataset.roleColumns = roles;

  /**
   * A load that came back materially short says so on the dataset itself.
   *
   * This is the failure mode worth shouting about, because it does not look like
   * one: a heatmap built from a fifth of the rows is a perfectly plausible
   * heatmap. It happened for a mundane reason — the files were moved on disk
   * while the load was running, so the references the picker had handed over went
   * stale and half of the files became unreadable mid-read. The load reported
   * success, drew a picture, and was wrong.
   *
   * `warnings` rather than a progress line because progress scrolls past and this
   * has to survive into the loaded dataset, where the panel shows it.
   */
  const said = dataset.said!;
  if (expected > 0 && loaded < expected * SHORTFALL_TOLERANCE) {
    const missing = expected - loaded;
    const values = {
      loaded: { int: loaded },
      expected,
      missing,
      percent: { num: (missing / expected) * 100, digits: 0 },
      count: failures.length,
    };
    said.warnings.push(
      msg(failures.length > 0 ? 'data.ingestFiles.shortUnread' : 'data.ingestFiles.shortDropped', values),
    );
  }
  if (stride > 1) said.notes.push(msg('data.ingestFiles.stride', { stride: { int: stride }, ord: { ordinal: stride } }));
  if (failures.length > 0) said.notes.push(msg('data.ingestFiles.skipped', { count: failures.length }));
  sayDataset(dataset);
  return { dataset, failures };
}

export type Outcome<T> = { ok: true; value: T } | { ok: false; error: unknown };

export interface InOrderOptions<T> {
  count: number;
  /** Parses allowed to run at once. */
  threads: number;
  /** Bytes the started-but-untaken items may reserve between them. */
  headroom: number;
  /** Estimated bytes item `i` holds from its start until it is taken. */
  cost: (i: number) => number;
  parse: (i: number) => Promise<T>;
  /**
   * Called once per item, strictly in index order. Throwing ends the run: the
   * promise rejects with that error and nothing further is started.
   */
  take: (i: number, outcome: Outcome<T>) => void;
}

/**
 * Parse up to `threads` items at once, and hand the results over in order.
 *
 * The order is the point. A merged dataset depends on the order its files are
 * appended in — the person and group dictionaries number names by first sight,
 * rows sit in file order until the sort, and the sort is stable — so a parallel
 * load has to append exactly as a sequential one does or it is a different
 * dataset. Items therefore start in index order, a finished one waits for those
 * before it, and `take` sees them in order whatever order they finished in.
 *
 * Memory is reserved, not hoped for. Each item reserves its estimated cost when
 * it starts and releases it only when taken, so a file that has finished and is
 * waiting for an earlier, slower one still counts. Another item starts only if
 * its cost fits in what is left of `headroom`; when nothing at all is reserved
 * one starts regardless, which is the sequential load the budget was checked
 * against, so the load always makes progress and never does worse than before.
 *
 * Pure: the parsing itself is injected, which is what lets the scheduling be
 * tested without workers.
 */
export function parseInOrder<T>(opts: InOrderOptions<T>): Promise<void> {
  const { count, cost, parse, take } = opts;
  const threads = Math.max(1, Math.floor(opts.threads));
  return new Promise<void>((resolve, reject) => {
    const done = new Map<number, Outcome<T>>();
    const reservedBy = new Float64Array(count);
    let reserved = 0;
    let next = 0;
    let taken = 0;
    let running = 0;
    let over = false;

    const settle = (i: number, outcome: Outcome<T>) => {
      running--;
      done.set(i, outcome);
      pump();
    };

    const pump = () => {
      if (over) return;
      while (done.has(taken)) {
        const outcome = done.get(taken)!;
        done.delete(taken);
        reserved -= reservedBy[taken];
        try {
          take(taken, outcome);
        } catch (err) {
          over = true;
          reject(err);
          return;
        }
        taken++;
      }
      if (taken === count) {
        over = true;
        resolve();
        return;
      }
      while (next < count && running < threads) {
        const c = Math.max(0, cost(next));
        // Everything from `taken` up to `next` holds a reservation; with none
        // held, the next item goes whatever it costs.
        if (next > taken && reserved + c > opts.headroom) break;
        const i = next++;
        reservedBy[i] = c;
        reserved += c;
        running++;
        let job: Promise<T>;
        try {
          job = parse(i);
        } catch (err) {
          job = Promise.reject(err);
        }
        job.then(
          (value) => settle(i, { ok: true, value }),
          (error) => settle(i, { ok: false, error }),
        );
      }
    };

    pump();
  });
}

/**
 * Rows in each file, for reserving its parse before it starts.
 *
 * Exact from the Parquet footer, which is one small range read; a CSV gets its
 * share by bytes of whatever the selection's estimate leaves once the Parquet
 * files are counted. An unreadable footer gets the same share: the file will
 * most likely fail fast, and if not, the guess errs toward reserving.
 */
async function rowsPerFile(files: File[], expectedRows: number): Promise<{ rows: number[]; exact: boolean }> {
  const rows: number[] = files.map(() => -1);
  let counted = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size === 0) {
      rows[i] = 0;
      continue;
    }
    if (detectFormat(file.name) !== 'parquet') continue;
    try {
      rows[i] = Number((await parquetMetadataAsync(asyncBufferFromFile(file))).num_rows);
      counted += rows[i];
    } catch {
      /* shared out below */
    }
  }
  let exact = true;
  let rest = 0;
  for (let i = 0; i < files.length; i++) if (rows[i] < 0) rest += files[i].size;
  for (let i = 0; i < files.length; i++) {
    if (rows[i] >= 0) continue;
    exact = false;
    rows[i] =
      expectedRows > counted
        ? Math.ceil(((expectedRows - counted) * files[i].size) / Math.max(1, rest))
        : // No estimate to share: assume short lines, which reserves more, not less.
          Math.ceil(files[i].size / CSV_MIN_LINE_BYTES);
  }
  return { rows, exact };
}

/** The shortest plausible line of a positional CSV, for when nothing better is known. */
const CSV_MIN_LINE_BYTES = 16;
