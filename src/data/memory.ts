import { int, lang, num, t } from '../i18n';
import type { ColumnMapping } from '../state/types';
import type { HostMemory } from './hostMemory';
import { effectiveGpuBudget } from '../render/budget';
import { MAX_SORTABLE_ROWS } from './sort';

/**
 * Memory budgeting for ingest.
 *
 * A viewer for datasets this size has to answer "will this fit" *before* it
 * spends four minutes finding out, because the failure mode of getting it wrong
 * is not a caught exception — it is an out-of-memory tab crash that loses
 * everything. So the cost per row is modelled explicitly from the mapping, the
 * row count is taken from Parquet footers where it is exact, and the verdict is
 * shown next to the Load button with a way to shrink the job if it doesn't fit.
 */

/** Steady-state bytes per row, by column. */
const B_POSITION = 12; // three f32, always present (a flat axis is still an array)
const B_TIME = 4;
const B_LIFETIME = 4;
const B_PERSON = 4;
const B_TEAM = 2;
const B_ATTR = 4;
/**
 * The session column, which the model used to omit entirely.
 *
 * Found by listing what a loaded dataset actually retains and comparing it with
 * this sum: 58 bytes a row held against 50 predicted, and the gap was exactly
 * this column plus the source-file one below. A `Uint32Array` the length of the
 * dataset does not become invisible for being forgotten here — it becomes an
 * under-estimate, which is the direction that ends in a dead tab.
 */
const B_SESSION = 4;
/**
 * The `Source file` column, added during ingest whenever more than one file is
 * merged, so it never appears in `mapping.extra`.
 *
 * See `ingestFiles`: the tag exists so a merged dataset can be filtered back down
 * to one test run. It costs the same as any other category column.
 */
const B_SOURCE = 4;

/**
 * What the itemised sum misses, as a multiplier on the peak.
 *
 * The per-column arithmetic below is exact about the arrays it names and blind to
 * everything an allocator does around them: the Parquet decoder's working set,
 * the copy `finish()` makes to trim each column to its final length, and buffers
 * that have been released but not yet returned. Measured on a real load —
 * `ingestMemory.test.ts`, millions of rows over several files — the true peak
 * came to 1.9x the itemised figure, with the arrays themselves accounting for
 * well under half of the high-water mark.
 *
 * 2.0 rather than 1.9, because the measurement is a floor: it was taken in Node,
 * which has none of the renderer, GPU staging or structured-clone cost the browser
 * adds on top. This being an over-estimate costs a stride that was not strictly
 * needed. It being an under-estimate costs a tab, mid-load, having said "fits" —
 * which is what happened, and the reason this constant exists.
 */
const PEAK_OVERHEAD = 2.0;

/** GPU bytes per row: RGBA16UI position/team, plus RG16UI time/lifetime. */
const B_GPU_POSITION = 8;
const B_GPU_TIME = 4;

export interface Footprint {
  /** Bytes retained once loaded. */
  steadyBytes: number;
  /**
   * Bytes needed at the worst moment during ingest.
   *
   * Higher than steady because merging accumulates absolute time as float64 and
   * the time sort applies a permutation, which means a second copy of every
   * column existing briefly alongside the first.
   */
  peakBytes: number;
  /** Bytes of GPU texture the renderer will allocate. */
  gpuBytes: number;
  steadyPerRow: number;
  peakPerRow: number;
  gpuPerRow: number;
  rows: number;
  /**
   * Whether the load will have to sort, which carries a hard row ceiling.
   *
   * The renderer requires rows ascending in time, so a mapped time column means a
   * permutation over every row, and `MAX_SORTABLE_ROWS` is where that stops being
   * something a browser tab should attempt. It matters *here*, in the estimate,
   * because the check used to live only inside the sort itself: a selection of
   * hundreds of millions of rows was read in full — gigabytes and several
   * minutes — and only then refused, with the progress line still reading
   * "Sorting by time". Knowing it beforehand turns that into a verdict next to
   * the Load button.
   */
  sorts: boolean;
}

export function bytesPerRow(
  m: ColumnMapping,
  /** How many files are being merged; decides whether a source tag is added. */
  fileCount = 1,
): {
  steady: number;
  peak: number;
  gpu: number;
} {
  const hasTime = !!m.time;
  const hasPerson = !!m.personId;
  const hasTeam = !!m.teamId;
  const attrCount = m.extra.length;

  const steady =
    B_POSITION +
    (hasTime ? B_TIME : 0) +
    (hasTime && hasPerson ? B_LIFETIME : 0) +
    (hasPerson ? B_PERSON : 0) +
    (hasTeam ? B_TEAM : 0) +
    (m.sessionId ? B_SESSION : 0) +
    (fileCount > 1 ? B_SOURCE : 0) +
    attrCount * B_ATTR;

  // Transient cost during ingest, itemised because it used to be dominated by a
  // full duplicate of every column and no longer is:
  //   - float64 absolute time while merging, until the global origin is known
  //   - radix sort scratch: 4-byte keys plus two index arrays
  //   - one 4-byte-per-row buffer that the permutation reuses for every column
  //   - the group column is u32 until it is narrowed to u16 after sorting
  //
  // Pre-sizing from the Parquet row count removes the *reallocation* copies, but
  // it does not make the peak equal to this sum: `finish()` still copies each
  // column down to its exact length, and the decoder has a working set of its
  // own. Both live in `PEAK_OVERHEAD` rather than here, because neither is a
  // per-column constant — the earlier claim that there was "no growth slack and
  // no reallocation copy to account for" was true of the itemised terms and
  // wrong about the total, which is how a load came to be labelled "fits" and
  // then died.
  const transient =
    (hasTime ? 8 + 12 + 4 : 0) + (hasTeam ? 4 : 0);

  const gpu = B_GPU_POSITION + (hasTime && hasPerson ? B_GPU_TIME : 0);
  return { steady, peak: Math.ceil((steady + transient) * PEAK_OVERHEAD), gpu };
}

export function estimateFootprint(m: ColumnMapping, rows: number, fileCount = 1): Footprint {
  const per = bytesPerRow(m, fileCount);
  return {
    rows,
    steadyPerRow: per.steady,
    peakPerRow: per.peak,
    gpuPerRow: per.gpu,
    steadyBytes: rows * per.steady,
    peakBytes: rows * per.peak,
    gpuBytes: rows * per.gpu,
    // A mapped time column is what forces the permutation. Without one the rows
    // keep their file order and no sort happens, so no ceiling applies.
    sorts: !!m.time,
  };
}

/**
 * What parsing several files at once may spend.
 *
 * The whole-load estimate above is about the worst moment of a load, which is
 * the sort in `finish()`, after every file has been parsed and released. Before
 * that, the load holds the builder's arrays — allocated once for the whole
 * selection when the row count is known — plus whatever the files being parsed
 * hold outside it. One file at a time, that second term was a single file and
 * vanished into `PEAK_OVERHEAD`. Several at a time, it is several files, so the
 * parser threads are granted only what the budget leaves once the builder is
 * counted, and each file reserves its estimated cost from that before it starts.
 */

/** Bytes a row holds in the columns a parse produces and the builder merges into. */
function parseBytesPerRow(m: ColumnMapping): number {
  return (
    B_POSITION +
    // Absolute time stays float64 until the global origin is known.
    (m.time ? 8 : 0) +
    (m.lookMode !== 'none' ? 8 : 0) +
    (m.personId ? 4 : 0) +
    // The group column is u32 until it is narrowed after sorting.
    (m.teamId ? 4 : 0) +
    (m.sessionId ? 4 : 0) +
    m.extra.length * B_ATTR
  );
}

/**
 * A file's parse against its block alone.
 *
 * Eight times the block: the block itself, the copy beside it while rows without
 * a position are compacted out (or, for CSV, while a growable buffer moves to a
 * larger one), and the decoder's working set, which for text columns dwarfs their
 * ids. Measured: at 3 or 5, thirty parser threads took a tab over its limit on 86M
 * rows with names; at 8 they did not. Too high costs some parallelism, too low
 * costs the tab.
 */
const PARSE_OVERHEAD = 8;

/**
 * Growable buffers at the moment they grow: the old one and the new one at 1.6x
 * its size. Only when the row count was an estimate, because an exact count
 * pre-sizes every column and nothing grows.
 */
const GROWTH_PEAK = 2.6;

/** Estimated bytes one file holds while it is parsed, until it is merged. */
export function fileParseBytes(m: ColumnMapping, rows: number): number {
  // Rows rather than rows / stride: the parsers read every row of a file and
  // decimate afterwards, so a stride does not shrink this.
  return Math.ceil(Math.max(0, rows) * parseBytesPerRow(m) * PARSE_OVERHEAD);
}

/**
 * Bytes left for files in flight, once the builder's own arrays are counted.
 *
 * Zero or less means there is no room for a second file beside the first, and
 * the load runs one file at a time as it always did — a single file is never
 * refused here, because the whole-load check has already admitted it.
 */
export function parseHeadroom(
  m: ColumnMapping,
  ramBudget: number,
  /** Rows the builder will hold: the expected total after the stride. */
  loadRows: number,
  fileCount: number,
  /** Whether `loadRows` is exact (every file Parquet), so nothing grows. */
  exact: boolean,
): number {
  const perRow = parseBytesPerRow(m) + (fileCount > 1 ? B_SOURCE : 0);
  const builder = Math.max(0, loadRows) * perRow * (exact ? 1 : GROWTH_PEAK);
  return Math.max(0, ramBudget - builder);
}

export interface Budgets {
  /** Bytes of system memory to use for row data. Never above `ramMax`. */
  ram: number;
  /** Bytes of GPU memory to use for row textures. Never above `gpuMax`. */
  gpu: number;
  /**
   * Ceilings from detection: the defaults, and normally the maxima.
   *
   * The reason for a ceiling at all is that the failure mode of guessing high is
   * an out-of-memory tab crash that loses a multi-minute load, and no amount of
   * willingness makes memory appear.
   */
  ramMax: number;
  gpuMax: number;
  /**
   * Whether `ramMax` came from a figure the browser truncated.
   *
   * Chrome and Edge clamp `navigator.deviceMemory` to 8GiB to limit
   * fingerprinting — so a machine with 16GB and one with 256GB report the same
   * number, and the 60% share of it comes to 4.8GB either way. When that clamp is
   * what is binding, the ceiling is not a measurement of anything and refusing to
   * go past it is refusing on the strength of a number known to be wrong.
   *
   * False whenever the host reported real memory, which is the normal case in
   * development — see `HOST_MEMORY_ROUTE`.
   */
  ramCapped: boolean;
  /**
   * The highest the RAM budget may be set to.
   *
   * Above `ramMax` in the two cases where `ramMax` is not a statement about this
   * machine's hardware:
   *
   *   - the browser clamped the figure (see `ramCapped`), so we do not know the
   *     machine's memory and the person using it does;
   *   - the default was held down by how much is *free right now*, which is a
   *     snapshot and not a limit. Someone with 64GB installed and 24GB free gets
   *     a 19GB default, and pinning the ceiling there refuses a number their
   *     hardware can plainly support once they close something.
   *
   * Past `ramMax` the figure stops being our measurement and becomes the user's
   * judgement, which the panel says plainly.
   */
  ramCeiling: number;
  /** Installed and currently-free bytes, when the host could report them. */
  ramTotalBytes: number | null;
  ramFreeBytes: number | null;
  /**
   * The highest the GPU budget may be set to.
   *
   * Separate from `gpuMax` for the same reason `ramCeiling` is: with no VRAM API
   * in the browser, `gpuMax` is either a share of what the host measured or an
   * inference from the largest texture a context admits to. In the second case it
   * is not a fact about the card, and a hard stop there refused a 2.32GB load on
   * a 16GB one.
   */
  gpuCeiling: number;
  /** The card memory the host reported, when it could read it. */
  vramBytes: number | null;
  /**
   * Logical cores available, and the number this machine should actually use.
   *
   * `cpu` is the parser threads: how many files a load parses at once, each in
   * a worker of its own, within the RAM budget (see `parseHeadroom`).
   */
  cpuMax: number;
  cpu: number;
  /** Where each figure came from, for display. */
  ramSource: string;
  gpuSource: string;
  cpuSource: string;
  /** Renderer string when the driver will tell us, for the user to judge VRAM. */
  gpuName: string | null;
}

/** Floors used when detection reports nothing at all. */
const FALLBACK_RAM_MAX = 4 * 1024 ** 3;
const FALLBACK_GPU_BUDGET = 2 * 1024 ** 3;

/**
 * The value of `navigator.deviceMemory` that usually means "this or more".
 *
 * Chrome and Edge clamp the reported figure to 8 to limit fingerprinting, so on
 * those a 16GB laptop and a 256GB workstation both say 8 and the figure has
 * stopped being a measurement. Not universal, though: Playwright's bundled
 * Chromium reports 32 on a 64GB machine, so a value *above* 8 is a browser that
 * is not clamping and should be believed.
 *
 * Hence the test for equality rather than `>=`. A machine with exactly 8GiB
 * installed is indistinguishable from a clamped larger one and gets treated as
 * clamped — which costs nothing, because the only consequence is headroom above
 * the default that such a machine has no reason to use.
 */
const DEVICE_MEMORY_CAP_GIB = 8;

/** Share of detected RAM spent on row data, leaving room for everything else. */
const RAM_SHARE = 0.6;

/**
 * Share of *currently free* memory spent on row data.
 *
 * Higher than the share of total, because free memory is already net of whatever
 * else is running — taking 60% of it as well would be discounting twice. Not all
 * of it, because the browser's own overhead for these arrays (page tables, the
 * decoder's working set, the GPU driver's staging copies) is real and is not
 * counted in the per-row model.
 */
const FREE_SHARE = 0.8;

/**
 * Share of the card's memory spent on row textures, and the most the slider
 * allows.
 *
 * Row data is not the only thing on the GPU: the scene, depth and heat targets
 * (the last of which is four-channel float in team mode, and at 4K that is
 * hundreds of megabytes), the level's geometry, and the browser's own
 * compositing. 70% leaves those room while being four times what the old
 * inference allowed on a 16GB card. The ceiling goes higher because a person who
 * knows their card is idle knows more than this constant does.
 */
const VRAM_SHARE = 0.7;
const VRAM_CEILING_SHARE = 0.9;

/**
 * How far past an *inferred* GPU ceiling the slider may go.
 *
 * Only when the host could not measure the card. The inference has no upper
 * relationship to reality — the largest texture a context admits to is the same
 * number on a 2GB part and a 24GB one — so a hard stop at it is a stop at
 * nothing. Eight times the 2GB fallback reaches 16GB, which is an ordinary
 * desktop card today.
 */
const INFERRED_VRAM_HEADROOM = 8;

/**
 * How far past the detected ceiling the user may go when that ceiling is the
 * browser clamp rather than a measurement.
 *
 * Four times 4.8GB reaches 19.2GB, which covers a 32GiB machine at the same 60%
 * share. Not derived from anything measurable, because there is nothing to derive
 * it from — it is a bound on how far a single slider drag can overcommit, chosen
 * so that a plausible workstation is reachable and a 256GB request is not.
 */
const CAPPED_HEADROOM = 4;

/**
 * The most typed-array memory one tab can hold, whatever the machine has.
 *
 * Not a share of anything — a wall. Chrome allocates `ArrayBuffer` backing stores
 * inside V8's sandbox, which is a fixed reservation per renderer, so the limit is
 * a property of the browser and identical on a 16GB laptop and a 256GB
 * workstation. Measured with `probe-alloc-ceiling.mjs`: a page reached 15.75GB in
 * 128MB blocks and then failed with `RangeError: Array buffer allocation failed`.
 *
 * 12GB rather than 15.75, because that measurement was taken in an otherwise
 * idle tab. A load has to fit the dataset *and* the renderer's own buffers, the
 * decoder's working set and the GPU staging copies inside the same wall, and a
 * budget that leaves no room for them is a budget that cannot be spent.
 *
 * This is why free system memory alone was not enough to make the budget honest:
 * the host reported 24GB free and 80% of it came to 19GB, which is above anything
 * a tab can allocate at all.
 */
export const MAX_TAB_ARRAY_BYTES = 12 * 1024 ** 3;

/** Smallest budget worth offering; below this nothing useful loads. */
export const MIN_RAM_BUDGET = 256 * 1024 ** 2;
export const MIN_GPU_BUDGET = 128 * 1024 ** 2;

/**
 * Work out how much we can safely use.
 *
 * There are two very different situations here and the difference is worth being
 * blunt about, because the numbers look equally authoritative either way.
 *
 * **With a `host` reading** — the normal case in development, from the dev
 * server's own `os.totalmem()`/`os.freemem()` — the figures are exact. A share of
 * installed keeps the budget proportionate to the hardware, and a larger share of
 * *free* keeps it from claiming memory already spoken for; the smaller wins.
 *
 * **Without one** — any static deployment — nothing in the browser will say. No
 * API reports free memory, none reports VRAM, and `navigator.deviceMemory` is
 * clamped to 8GiB by Chrome and Edge, so the best available signals are that
 * clamped figure, this tab's own JS heap ceiling, and the core count. The result
 * is deliberately conservative and is flagged as such through `ramCapped`, so the
 * panel can offer a way past a ceiling that is not really this machine's.
 *
 * A share rather than all of it in both cases, because the browser, the Parquet
 * decoder and the rest of the page need room too, and a budget that is right on
 * average but wrong on a machine with a browser full of other tabs costs the user
 * their whole load.
 */
/**
 * What the renderer can tell us about the GPU.
 *
 * Passed in rather than probed here, because probing means creating a second GL
 * context, and on a low-end machine that can evict the one the app is drawing
 * with — a diagnostic that breaks the thing it is diagnosing.
 */
export interface GpuHint {
  gpuName?: string | null;
  maxTextureSize?: number;
  maxBufferBytes?: number | null;
}

export function detectBudgets(hint?: GpuHint | null, host?: HostMemory | null): Budgets {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const perf = performance as Performance & {
    memory?: { jsHeapSizeLimit?: number; usedJSHeapSize?: number };
  };

  // ---- RAM
  const notes: string[] = [];
  let ramMax = FALLBACK_RAM_MAX;
  let detected = false;
  let ramCapped = false;
  /** Hardware bound from the host, when it reported one. See `ramCeiling`. */
  let hostCeiling = 0;

  /**
   * The host's own reading, when the page was served by something that can take
   * one. Preferred over everything below, because it is the only figure here that
   * is a measurement of this machine rather than an inference about it.
   *
   * Both numbers are used, and the smaller wins. A share of *total* keeps the
   * budget proportionate to the hardware; a larger share of *free* keeps it from
   * claiming memory that is currently spoken for — on a machine with 64GB
   * installed and 3GB free, 60% of total is a promise the OS cannot keep, and
   * finding that out means an out-of-memory crash partway through a long load.
   */
  if (host && host.totalBytes > 0) {
    const fromTotal = host.totalBytes * RAM_SHARE;
    const fromFree = host.freeBytes !== null ? host.freeBytes * FREE_SHARE : Infinity;
    ramMax = Math.min(fromTotal, fromFree);
    // The hardware bound, which is what the slider may be raised to. Free memory
    // decides the *default* because it is what is safe this second; it must not
    // decide the maximum, because closing an editor changes it and no measurement
    // of a moment should stand in the way of that.
    hostCeiling = fromTotal;
    detected = true;
    notes.push(
      host.freeBytes !== null
        ? t('data.memory.ram.host', {
            total: formatBytes(host.totalBytes),
            free: formatBytes(host.freeBytes),
            basis: fromFree < fromTotal ? 'free' : 'installed',
            percent: int((fromFree < fromTotal ? FREE_SHARE : RAM_SHARE) * 100),
          })
        : t('data.memory.ram.hostTotal', { total: formatBytes(host.totalBytes), percent: int(RAM_SHARE * 100) }),
    );
  } else if (typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0) {
    // Reported in GiB, rounded down to a power of two and capped at 8. Spend at
    // most 60% on row data.
    ramMax = nav.deviceMemory * 1024 ** 3 * RAM_SHARE;
    detected = true;
    // At the cap the figure has stopped being a measurement, and the ceiling
    // derived from it stops being one too. Recorded so the panel can offer a way
    // past it instead of presenting 4.8GB as this machine's limit.
    ramCapped = nav.deviceMemory === DEVICE_MEMORY_CAP_GIB;
    notes.push(
      t(ramCapped ? 'data.memory.ram.deviceCapped' : 'data.memory.ram.device', {
        // A power of two: 0.25, 0.5, 1, 2 ... 8.
        gib: num(nav.deviceMemory, nav.deviceMemory >= 1 ? 0 : nav.deviceMemory >= 0.5 ? 1 : 2),
        percent: int(RAM_SHARE * 100),
      }),
    );
  }

  /**
   * The tab's own heap ceiling, as a cap on the figure above.
   *
   * Only when there is no host reading. Typed-array backing stores are allocated
   * outside the V8 heap and are not counted against `jsHeapSizeLimit`, so this
   * number says very little about how much row data a tab can hold — the `* 4`
   * below is a fudge factor standing in for the thing we cannot see. Where the
   * host has told us the real memory, that guess is not a safety net, it is a
   * worse measurement overruling a better one: Chrome's ~4GB heap limit would
   * clamp a 64GB machine to about 17GB for no reason connected to its hardware.
   */
  const heapLimit = host ? undefined : perf.memory?.jsHeapSizeLimit;
  if (typeof heapLimit === 'number' && heapLimit > 0) {
    const used = perf.memory?.usedJSHeapSize ?? 0;
    const headroom = Math.max(0, heapLimit - used);
    // Typed-array data is external to the heap, so this wall is softer than it
    // looks; allow a multiple of it rather than treating it as the whole budget.
    const fromHeap = headroom * 4;
    if (!detected || fromHeap < ramMax) {
      notes.push(t('data.memory.ram.heap', { limit: formatBytes(heapLimit), free: formatBytes(headroom) }));
      if (!detected) ramMax = fromHeap;
      else ramMax = Math.min(ramMax, fromHeap);
      detected = true;
      // The heap wall is a real property of this tab, so once it is the binding
      // constraint the ceiling is a measurement again and the override no longer
      // applies — raising the budget past it would not help.
      ramCapped = false;
    }
  }
  if (!detected) notes.push(t('data.memory.ram.nothing'));
  ramMax = Math.max(MIN_RAM_BUDGET, ramMax);
  let ramCeiling = Math.max(
    ramMax,
    // A browser clamp is not a measurement, so allow headroom over it...
    ramCapped ? ramMax * CAPPED_HEADROOM : 0,
    // ...and neither is a free-memory snapshot, so allow up to the hardware share.
    hostCeiling,
  );
  /**
   * And then the tab's own wall, over everything above.
   *
   * The machine's memory sets what it would be *sensible* to spend; this sets what
   * the tab can spend at all. Applied last and to both figures, because a default
   * above it is a promise the allocator refuses and a ceiling above it is a slider
   * position that cannot work — the budget said 19GB while a page tops out near
   * 15.75GB of typed arrays, so the numbers on screen had left the realm of the
   * possible before anyone pressed Load.
   */
  if (ramMax > MAX_TAB_ARRAY_BYTES) {
    notes.push(t('data.memory.ram.tabCap', { max: formatBytes(MAX_TAB_ARRAY_BYTES) }));
  }
  ramMax = Math.max(MIN_RAM_BUDGET, Math.min(ramMax, MAX_TAB_ARRAY_BYTES));
  ramCeiling = Math.max(ramMax, Math.min(ramCeiling, MAX_TAB_ARRAY_BYTES));

  // ---- GPU
  // No API reports VRAM. The largest texture a context will admit to correlates
  // loosely with card class — enough to tell an integrated part from a discrete
  // one, not enough to size a budget precisely — so it only shifts the default
  // between conservative values.
  const gpuName = hint?.gpuName ?? null;
  const maxTex = hint?.maxTextureSize ?? 0;
  let gpuMax = FALLBACK_GPU_BUDGET;
  let gpuSource = t('data.memory.gpu.default');
  if (maxTex >= 16384) {
    gpuMax = 4 * 1024 ** 3;
    gpuSource = t('data.memory.gpu.discrete', { px: int(maxTex) });
  } else if (maxTex > 0) {
    gpuMax = 1 * 1024 ** 3;
    gpuSource = t('data.memory.gpu.modest', { px: int(maxTex) });
  }
  // A discrete card with a raised buffer limit is the one case where something
  // closer to a real capacity signal exists, since drivers scale it with VRAM.
  const maxBuf = hint?.maxBufferBytes ?? null;
  if (maxBuf && maxBuf > 0) {
    // Row data is spread over many buffers, so the single-buffer limit is a floor
    // on total capacity rather than a ceiling; 8 of them is a cautious read.
    const fromBuf = maxBuf * 8;
    if (fromBuf > gpuMax) {
      gpuMax = fromBuf;
      gpuSource = t('data.memory.gpu.buffer', { buffer: formatBytes(maxBuf), total: formatBytes(fromBuf) });
    }
  }
  /**
   * The host's reading of the card, which replaces every inference above.
   *
   * All of that is guesswork standing in for a number nobody exposes to a page;
   * where the serving process could read it properly, the guess is not a safety
   * net but a worse measurement overruling a better one. It had a real cost: a
   * 2GB inferred ceiling refused a 2.32GB load on a 16GB card.
   */
  let gpuCeiling = 0;
  if (host?.vramBytes) {
    gpuMax = host.vramBytes * VRAM_SHARE;
    gpuCeiling = host.vramBytes * VRAM_CEILING_SHARE;
    gpuSource = t('data.memory.gpu.card', {
      vram: formatBytes(host.vramBytes),
      source: host.vramSource ?? t('data.memory.gpu.host'),
      percent: int(VRAM_SHARE * 100),
    });
  }
  gpuMax = Math.max(MIN_GPU_BUDGET, gpuMax);
  // With no measurement, the ceiling has to be well above the inference, because
  // the inference is not a fact about the card: the texture-size heuristic
  // separates integrated from discrete and stops there, so 2GB and 24GB read
  // alike. Eight times the 2GB default reaches 16GB, which is an ordinary card.
  gpuCeiling = Math.max(gpuCeiling, host?.vramBytes ? gpuMax : gpuMax * INFERRED_VRAM_HEADROOM);

  // ---- CPU
  const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 0;
  const cpuMax = Math.max(1, cores || 4);
  // Leave a couple of cores for the compositor and the render loop; an ingest
  // that saturates every core makes the page stop repainting, which reads as a
  // hang even though it is progressing.
  const cpu = Math.max(1, Math.min(cpuMax, cpuMax > 4 ? cpuMax - 2 : cpuMax - 1 || 1));
  const cpuSource = cores
    ? t('data.memory.cpu.cores', { count: cores })
    : t('data.memory.cpu.unknown', { assumed: int(4) });

  return {
    // The *detected* figure is still the default. The override raises what is
    // reachable, not what is assumed.
    ram: ramMax,
    gpu: gpuMax,
    ramMax,
    gpuMax,
    ramCapped,
    ramCeiling,
    ramTotalBytes: host?.totalBytes ?? null,
    ramFreeBytes: host?.freeBytes ?? null,
    gpuCeiling,
    vramBytes: host?.vramBytes ?? null,
    cpu,
    cpuMax,
    ramSource: notes.join('; '),
    gpuSource,
    cpuSource,
    gpuName,
  };
}

/** Clamp a user-chosen budget into the detected range. */
export function clampBudgets(b: Budgets): Budgets {
  return {
    ...b,
    // Against the ceiling, not the detected maximum, so a deliberate override
    // survives a re-clamp instead of springing back to 4.8GB. `ramCeiling` equals
    // `ramMax` whenever the detection was real, so this is the same clamp as
    // before on every machine where the old behaviour was right.
    ram: Math.max(MIN_RAM_BUDGET, Math.min(b.ramCeiling ?? b.ramMax, b.ram)),
    // Same reasoning as for RAM: with no VRAM API in the browser, `gpuMax` is
    // often an inference rather than a measurement, and the ceiling is where a
    // deliberate override is allowed to sit.
    gpu: Math.max(MIN_GPU_BUDGET, Math.min(b.gpuCeiling ?? b.gpuMax, b.gpu)),
    cpu: Math.max(1, Math.min(b.cpuMax, Math.round(b.cpu))),
  };
}

export type Verdict = 'fits' | 'tight' | 'too-big';

export interface FitCheck {
  verdict: Verdict;
  /** Rows that would fit within both budgets. */
  maxRows: number;
  /** Take every Nth row to fit. 1 means no decimation needed. */
  suggestedStride: number;
  /**
   * What the binding constraint is.
   *
   * `'sort'` is not a budget but a hard algorithmic ceiling: the renderer needs
   * rows ascending in time, and above `MAX_SORTABLE_ROWS` that permutation is not
   * something to attempt in a tab. It belongs here because it used to be enforced
   * only inside the sort — so a selection over the limit was read in full, ten
   * gigabytes and minutes of work, and refused at the very last step.
   */
  limitedBy: 'ram' | 'gpu' | 'sort' | null;
  messages: string[];
}

/**
 * Decide whether a load should proceed.
 *
 * Returns a stride rather than just refusing, because a decimated view of a
 * dataset that doesn't fit is far more useful than no view: heat is an
 * average, so every Nth row gives the same picture with more noise — exactly
 * the tradeoff the renderer already makes per frame.
 */
/**
 * Why the budget is what it is, when it is not a fact about the hardware.
 *
 * Appended to the fit messages rather than left to the resource panel, because
 * this is the moment it matters: "close to the budget" invites the reading "this
 * machine is nearly full", and in both cases below that reading is wrong — the
 * number is either a browser privacy clamp or a snapshot of a busy moment.
 * Someone told only the first half will reach for a stride they do not need.
 *
 * Empty when the budget genuinely is the hardware share, so the common case gains
 * no noise.
 */
function budgetNote(b: Budgets, limitedBy: 'ram' | 'gpu' | 'sort'): string {
  // The sort ceiling is not a budget and has its own explanation at the call
  // site; saying anything about memory here would be the same mistake this
  // function exists to avoid.
  if (limitedBy === 'sort') return '';
  if (limitedBy === 'gpu') {
    // The GPU note, and only when the GPU is what refused the load. Explaining
    // the RAM budget while the GPU is the blocker is worse than saying nothing:
    // it invites closing programs to free memory that was never short. That is
    // exactly what happened — a 2GB GPU ceiling refused a load and the message
    // underneath it talked about 63GB of RAM.
    return t('data.memory.note.gpu', { source: b.gpuSource, max: formatBytes(b.gpuMax) });
  }
  if (b.ramCapped) {
    return t('data.memory.note.capped');
  }
  if (b.ramCeiling > b.ramMax * 1.001) {
    return b.ramTotalBytes !== null && b.ramFreeBytes !== null
      ? t('data.memory.note.busyHeld', {
          total: formatBytes(b.ramTotalBytes),
          used: formatBytes(b.ramTotalBytes - b.ramFreeBytes),
          ceiling: formatBytes(b.ramCeiling),
        })
      : t('data.memory.note.busy', { ceiling: formatBytes(b.ramCeiling) });
  }
  return '';
}

/** Two sentences, the second when there is one. */
function andNote(sentence: string, note: string): string {
  return note ? `${sentence} ${note}` : sentence;
}

/** "Loading every 6th row fits (~1,234 rows) ...", the ordinal the language's own. */
function strideMessage(stride: number, rows: number): string {
  return t('data.memory.fit.stride', {
    stride: int(stride),
    ord: new Intl.PluralRules(lang(), { type: 'ordinal' }).select(stride),
    rows: Math.floor(rows / stride),
  });
}

export function checkFit(fp: Footprint, budgets: Budgets): FitCheck {
  const messages: string[] = [];
  const ramRows = Math.floor(budgets.ram / Math.max(1, fp.peakPerRow));
  // The figure the renderer will be handed, decided the same way, so a load this
  // approves is a load that ends up resident.
  const gpuBudget = effectiveGpuBudget(budgets.gpu, budgets.gpuCeiling ?? budgets.gpuMax);
  const gpuRows = Math.floor(gpuBudget / Math.max(1, fp.gpuPerRow));
  // The sort's ceiling counts as a third constraint, and it is a hard one: past
  // it the load cannot succeed at any budget, so it has to bound `maxRows` and be
  // allowed to name itself as the reason.
  const sortRows = fp.sorts ? MAX_SORTABLE_ROWS : Number.POSITIVE_INFINITY;
  const maxRows = Math.max(1, Math.min(ramRows, gpuRows, sortRows));
  const limitedBy: 'ram' | 'gpu' | 'sort' =
    sortRows <= ramRows && sortRows <= gpuRows
      ? 'sort'
      : ramRows < gpuRows
        ? 'ram'
        : 'gpu';

  const ramUse = fp.peakBytes / budgets.ram;
  const gpuUse = fp.gpuBytes / gpuBudget;
  // Expressed as a fraction like the other two, so one comparison decides the
  // verdict. Over 1 means over the ceiling.
  const sortUse = fp.sorts ? fp.rows / MAX_SORTABLE_ROWS : 0;
  const worst = Math.max(ramUse, gpuUse, sortUse);

  let verdict: Verdict;
  if (worst <= 0.7) verdict = 'fits';
  else if (worst <= 1) verdict = 'tight';
  else verdict = 'too-big';

  const stride = verdict === 'too-big' ? Math.ceil(fp.rows / maxRows) : 1;

  if (verdict === 'too-big' && limitedBy === 'sort') {
    messages.push(
      t('data.memory.fit.pastSort', {
        rows: fp.rows,
        max: int(MAX_SORTABLE_ROWS),
        needs: formatBytes(fp.peakBytes),
        budget: formatBytes(budgets.ram),
      }),
    );
    messages.push(strideMessage(stride, fp.rows));
    messages.push(t('data.memory.fit.unmapTime'));
  } else if (verdict === 'too-big') {
    messages.push(
      t('data.memory.fit.tooBig', {
        peak: formatBytes(fp.peakBytes),
        gpu: formatBytes(fp.gpuBytes),
        rows: fp.rows,
        limit: limitedBy,
        budget: formatBytes(limitedBy === 'ram' ? budgets.ram : gpuBudget),
      }),
    );
    messages.push(strideMessage(stride, fp.rows));
    messages.push(andNote(t('data.memory.fit.alternatives'), budgetNote(budgets, limitedBy)));
  } else if (verdict === 'tight' && limitedBy === 'sort') {
    messages.push(t('data.memory.fit.nearSort', { rows: fp.rows, max: int(MAX_SORTABLE_ROWS) }));
  } else if (verdict === 'tight') {
    messages.push(
      andNote(
        t('data.memory.fit.tight', { peak: formatBytes(fp.peakBytes), budget: formatBytes(budgets.ram) }),
        budgetNote(budgets, limitedBy),
      ),
    );
  }

  return { verdict, maxRows, suggestedStride: stride, limitedBy: verdict === 'too-big' ? limitedBy : null, messages };
}

export function formatBytes(n: number): string {
  if (n >= 1024 ** 3) return t('data.memory.bytes.gb', { n: num(n / 1024 ** 3, 2) });
  if (n >= 1024 ** 2) return t('data.memory.bytes.mb', { n: num(n / 1024 ** 2, 0) });
  if (n >= 1024) return t('data.memory.bytes.kb', { n: num(n / 1024, 0) });
  return t('data.memory.bytes.b', { n: int(n) });
}

/**
 * Projected wall-clock load time.
 *
 * Rate measured on real Parquet exports (1.2M rows/s on a desktop CPU, single
 * threaded). Reported so a very large selection can be recognised as a
 * multi-minute job before it is started rather than after.
 */
export function estimateLoadSeconds(rows: number, rowsPerSecond = 1_200_000): number {
  return rows / rowsPerSecond;
}

export function formatDuration(seconds: number): string {
  if (seconds < 1) return t('data.memory.duration.underSecond');
  if (seconds < 90) return t('data.memory.duration.seconds', { s: int(seconds) });
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m < 60
    ? t('data.memory.duration.minutes', { m: int(m), s: int(s) })
    : t('data.memory.duration.hours', { h: int(Math.floor(m / 60)), m: int(m % 60) });
}
