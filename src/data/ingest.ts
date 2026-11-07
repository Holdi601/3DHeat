import type { BlockAttr, SourceBlock } from './builder';
import { CsvScanner, type FieldSink } from './csv';
import { Dictionary, GrowableF32, GrowableF64, GrowableU32 } from './growable';
import { msg, MsgError, say, type Msg } from './msg';
import type { ColumnMapping, TimeUnit } from '../state/types';

export interface IngestProgress {
  /** What is being done, in English: `msg` is what the main thread says. */
  label: string;
  msg: Msg;
  /** 0..1 where known. */
  fraction: number | null;
  rows: number;
}

export type ProgressFn = (p: IngestProgress) => void;

/** Progress with its message, and the English of it. */
export function progress(m: Msg, fraction: number | null, rows: number): IngestProgress {
  return { label: say(m), msg: m, fraction, rows };
}

/** Seconds per unit, for the units that are a plain scalar. */
const TIME_SCALE: Partial<Record<TimeUnit, number>> = {
  seconds: 1,
  milliseconds: 1e-3,
  microseconds: 1e-6,
  nanoseconds: 1e-9,
  unix_seconds: 1,
  unix_milliseconds: 1e-3,
};

export function isAbsoluteUnit(unit: TimeUnit): boolean {
  return unit === 'unix_seconds' || unit === 'unix_milliseconds' || unit === 'iso8601';
}

/**
 * Two position axes is the floor, not three.
 *
 * With two, the data is drawn as a plane inside the 3D scene, which is exactly
 * what a top-down map heatmap wants — height is often absent or meaningless. The
 * unmapped axis becomes a constant zero.
 */
export function assertAxes(mapping: ColumnMapping): void {
  const mapped = [mapping.x, mapping.y, mapping.z].filter(Boolean).length;
  if (mapped < 2) {
    throw new MsgError(msg('data.ingest.twoAxes'));
  }
}

interface Slots {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  dirX: number;
  dirY: number;
  dirZ: number;
  time: number;
  person: number;
  team: number;
  session: number;
  extra: number[];
}

/**
 * Parse a mapped delimited file into a SourceBlock.
 *
 * Only mapped columns are materialised, straight into typed arrays. A general
 * CSV library would allocate a JavaScript string for every field of every row;
 * at these sizes that allocation is the whole cost of ingest, and it is the
 * reason this parser exists.
 */
export async function ingestCsv(
  file: File,
  mapping: ColumnMapping,
  columns: string[],
  onProgress: ProgressFn,
  /** Keep one row in `stride`, for datasets that exceed the memory budget. */
  stride = 1,
): Promise<SourceBlock> {
  assertAxes(mapping);
  const delimiterByte = (mapping.delimiter || ',').charCodeAt(0);
  if (!Number.isFinite(delimiterByte)) throw new MsgError(msg('data.ingest.separator'));

  const indexOf = (name: string | null): number => (name ? columns.indexOf(name) : -1);
  const numberSlots: GrowableF32[] = [];
  /**
   * The one column collected at double width, and which slot it stands in.
   *
   * Kept beside `numberSlots` rather than widening it, so that positions and
   * measures keep their narrow type all the way through. The slot it occupies
   * holds an empty placeholder that nothing reads: every role gets its own slot
   * even when two roles name the same source column, so no other reader can
   * land on it.
   */
  let wide: { slot: number; data: GrowableF64 } | null = null;
  const textSlots: Array<{ dict: Dictionary; out: GrowableU32 }> = [];
  const sinkOf: Array<FieldSink[] | null> = columns.map(() => null);

  const attach = (colIndex: number, sink: FieldSink): void => {
    const list = sinkOf[colIndex];
    if (list) list.push(sink);
    else sinkOf[colIndex] = [sink];
  };
  const addNumber = (colIndex: number): number => {
    if (colIndex < 0) return -1;
    const slot = numberSlots.length;
    numberSlots.push(new GrowableF32());
    attach(colIndex, { kind: 'number', index: slot });
    return slot;
  };
  /**
   * A number column that has to keep its absolute magnitude: the time column.
   *
   * `1765530927104` — epoch milliseconds for a date in 2025 — rounds to the
   * nearest 131.072s in a float32, so a whole column of timestamps collapses
   * onto a few hundred instants. It cost one Parquet export 615,367 rows'
   * worth of resolution before it was noticed, and the arithmetic is identical
   * here for a CSV whose time column is given as unix milliseconds.
   */
  const addWideNumber = (colIndex: number): number => {
    if (colIndex < 0) return -1;
    const slot = numberSlots.length;
    numberSlots.push(new GrowableF32(1));
    wide = { slot, data: new GrowableF64() };
    attach(colIndex, { kind: 'number', index: slot });
    return slot;
  };
  const addText = (colIndex: number): number => {
    if (colIndex < 0) return -1;
    const slot = textSlots.length;
    textSlots.push({ dict: new Dictionary(), out: new GrowableU32() });
    attach(colIndex, { kind: 'dict', index: slot });
    return slot;
  };

  // ISO timestamps need Date parsing, so they go through a text slot; the
  // dictionary means each distinct timestamp string is parsed exactly once.
  const timeIsText = mapping.timeUnit === 'iso8601';

  const slots: Slots = {
    x: addNumber(indexOf(mapping.x)),
    y: addNumber(indexOf(mapping.y)),
    z: addNumber(indexOf(mapping.z)),
    yaw: mapping.lookMode === 'yawPitch' ? addNumber(indexOf(mapping.yaw)) : -1,
    pitch: mapping.lookMode === 'yawPitch' ? addNumber(indexOf(mapping.pitch)) : -1,
    dirX: mapping.lookMode === 'vector' ? addNumber(indexOf(mapping.dirX)) : -1,
    dirY: mapping.lookMode === 'vector' ? addNumber(indexOf(mapping.dirY)) : -1,
    dirZ: mapping.lookMode === 'vector' ? addNumber(indexOf(mapping.dirZ)) : -1,
    time: timeIsText ? addText(indexOf(mapping.time)) : addWideNumber(indexOf(mapping.time)),
    person: addText(indexOf(mapping.personId)),
    team: addText(indexOf(mapping.teamId)),
    session: addText(indexOf(mapping.sessionId)),
    extra: [],
  };
  const extraKinds: Array<'number' | 'category'> = [];
  const extraNames: string[] = [];
  for (const name of mapping.extra) {
    const ci = indexOf(name);
    if (ci < 0) continue;
    const asNumber = mapping.extraNumeric[name] ?? true;
    slots.extra.push(asNumber ? addNumber(ci) : addText(ci));
    extraKinds.push(asNumber ? 'number' : 'category');
    extraNames.push(name);
  }

  let rows = 0;
  let rejected = 0;
  let seen = 0;
  const step = Math.max(1, Math.floor(stride));
  const rowNumbers = new Float64Array(Math.max(1, numberSlots.length));
  const rowTexts = new Int32Array(Math.max(1, textSlots.length));

  const scanner = new CsvScanner(
    delimiterByte,
    sinkOf,
    {
      number: (i, v) => {
        rowNumbers[i] = v;
      },
      text: (i, v) => {
        rowTexts[i] = textSlots[i].dict.intern(v);
      },
      endRow: () => {
        // Decimation happens here so skipped rows cost only the scan, never an
        // array push or a dictionary insert.
        if (step > 1 && seen++ % step !== 0) return;
        // Reject rows whose position didn't parse instead of writing them as
        // zero: a NaN-turned-zero position paints a bright false hotspot at the
        // world origin, which looks like real data. Only the mapped axes are
        // checked — an unmapped one is legitimately absent, not broken.
        if (
          (slots.x >= 0 && !Number.isFinite(rowNumbers[slots.x])) ||
          (slots.y >= 0 && !Number.isFinite(rowNumbers[slots.y])) ||
          (slots.z >= 0 && !Number.isFinite(rowNumbers[slots.z]))
        ) {
          rejected++;
          return;
        }
        const wideSlot = wide ? wide.slot : -1;
        for (let i = 0; i < numberSlots.length; i++) {
          if (i === wideSlot) wide!.data.push(rowNumbers[i]);
          else numberSlots[i].push(rowNumbers[i]);
        }
        for (let i = 0; i < textSlots.length; i++) textSlots[i].out.push(rowTexts[i]);
        rows++;
      },
    },
    true,
  );

  const reader = file.stream().getReader();
  let bytesRead = 0;
  let lastReport = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    scanner.push(value);
    bytesRead += value.byteLength;
    if (bytesRead - lastReport > 8 << 20) {
      lastReport = bytesRead;
      onProgress(progress(msg('data.ingest.parsing', { file: file.name }), bytesRead / file.size, rows));
    }
  }
  scanner.end();

  if (rows === 0) {
    throw new MsgError(
      rejected > 0
        ? msg('data.ingest.allRejected', { count: rejected, file: file.name })
        : msg('data.ingest.noDataRows', { file: file.name }),
    );
  }

  // An unmapped axis becomes a constant-zero array, drawing the data as a plane
  // in the 3D scene — the normal case for a top-down map heatmap.
  const axis = (slot: number): Float32Array =>
    slot >= 0 ? numberSlots[slot].finish() : new Float32Array(rows);
  const { px, py, pz } = remapAxesInPlace(
    { x: axis(slots.x), y: axis(slots.y), z: axis(slots.z) },
    mapping,
    rows,
  );

  let time: Float64Array | null = null;
  if (slots.time >= 0) {
    time = timeIsText
      ? timeFromIsoStrings(textSlots[slots.time], rows)
      : timeFromNumbers(wide!.data.finish(), mapping.timeUnit, rows);
  }

  const pick = (slot: number): Float32Array | null =>
    slot >= 0 ? numberSlots[slot].finish() : null;
  const { yaw, pitch } = buildLookFrom(mapping, rows, {
    yawRaw: pick(slots.yaw),
    pitchRaw: pick(slots.pitch),
    dirX: pick(slots.dirX),
    dirY: pick(slots.dirY),
    dirZ: pick(slots.dirZ),
  });

  const attrs: BlockAttr[] = extraNames.map((name, i) => {
    const slot = slots.extra[i];
    if (extraKinds[i] === 'number') {
      return { name, kind: 'number', data: numberSlots[slot].finish() };
    }
    const s = textSlots[slot];
    return { name, kind: 'category', data: s.out.finish(), categories: s.dict.labels };
  });

  return {
    rows,
    px,
    py,
    pz,
    time,
    timeIsAbsolute: isAbsoluteUnit(mapping.timeUnit),
    yaw,
    pitch,
    personIds: slots.person >= 0 ? textSlots[slots.person].out.finish() : null,
    personLabels: slots.person >= 0 ? textSlots[slots.person].dict.labels : [],
    teamIds: slots.team >= 0 ? textSlots[slots.team].out.finish() : null,
    teamLabels: slots.team >= 0 ? textSlots[slots.team].dict.labels : [],
    sessionIds: slots.session >= 0 ? textSlots[slots.session].out.finish() : null,
    sessionLabels: slots.session >= 0 ? textSlots[slots.session].dict.labels : [],
    attrs,
    rejected,
  };
}

// -------------------------------------------------------------------- shared

/**
 * Apply scale, per-axis flips and the up-axis convention, in place.
 *
 * World space is Y-up. Most game engines are Z-up, so the common case relabels
 * which array is which rather than copying — at these sizes a copy per axis is
 * hundreds of megabytes of pointless traffic.
 */
export function remapAxesInPlace(
  raw: { x: Float32Array; y: Float32Array; z: Float32Array },
  mapping: ColumnMapping,
  rows: number,
): { px: Float32Array; py: Float32Array; pz: Float32Array } {
  const { axes } = mapping;
  const s = axes.scale || 1;
  const sx = (axes.flipX ? -1 : 1) * s;
  const sy = (axes.flipY ? -1 : 1) * s;
  const sz = (axes.flipZ ? -1 : 1) * s;

  if (axes.up === 'z') {
    // ds(x, y, z) -> world(x, z, y)
    const px = raw.x;
    const py = raw.z;
    const pz = raw.y;
    for (let i = 0; i < rows; i++) {
      px[i] *= sx;
      py[i] *= sz;
      pz[i] *= sy;
    }
    return { px, py, pz };
  }
  for (let i = 0; i < rows; i++) {
    raw.x[i] *= sx;
    raw.y[i] *= sy;
    raw.z[i] *= sz;
  }
  return { px: raw.x, py: raw.y, pz: raw.z };
}

/** Raw numeric time column -> float64 seconds, preserving absolute epochs. */
export function timeFromNumbers(
  src: Float32Array | Float64Array,
  unit: TimeUnit,
  rows: number,
): Float64Array {
  const scale = TIME_SCALE[unit] ?? 1;
  const out = new Float64Array(rows);
  for (let i = 0; i < rows; i++) {
    const v = src[i];
    out[i] = Number.isFinite(v) ? v * scale : NaN;
  }
  return out;
}

function timeFromIsoStrings(
  slot: { dict: Dictionary; out: GrowableU32 },
  rows: number,
): Float64Array {
  return timeFromIsoLabels(slot.dict.labels, slot.out.finish(), rows);
}

/**
 * Seconds since the epoch for rows whose time is an ISO-8601 string, given as
 * dictionary ids into `labels`. Shared by the CSV and Parquet readers, so a
 * string time column means the same thing in either format.
 */
export function timeFromIsoLabels(labels: string[], ids: Uint32Array, rows: number): Float64Array {
  // One Date.parse per distinct string rather than per row.
  const parsed = new Float64Array(Math.max(1, labels.length));
  let anyValid = false;
  for (let i = 0; i < labels.length; i++) {
    const t = Date.parse(labels[i]);
    parsed[i] = Number.isNaN(t) ? NaN : t / 1000;
    if (!Number.isNaN(t)) anyValid = true;
  }
  if (!anyValid) throw new MsgError(msg('data.ingest.noIsoTimes'));
  const out = new Float64Array(rows);
  for (let i = 0; i < rows; i++) out[i] = parsed[ids[i]];
  return out;
}

export interface LookSources {
  yawRaw: Float32Array | null;
  pitchRaw: Float32Array | null;
  dirX: Float32Array | null;
  dirY: Float32Array | null;
  dirZ: Float32Array | null;
}

/**
 * Reduce whichever look representation the source uses to yaw/pitch radians in
 * the renderer's Y-up world. Two angles rather than a vector halves the memory
 * and is what both the cube orientation and the look ray want anyway.
 */
export function buildLookFrom(
  mapping: ColumnMapping,
  rows: number,
  src: LookSources,
): { yaw: Float32Array | null; pitch: Float32Array | null } {
  if (mapping.lookMode === 'yawPitch' && src.yawRaw) {
    const k = mapping.angleUnit === 'degrees' ? Math.PI / 180 : 1;
    const yaw = new Float32Array(rows);
    for (let i = 0; i < rows; i++) yaw[i] = (src.yawRaw[i] || 0) * k;
    let pitch: Float32Array | null = null;
    if (src.pitchRaw) {
      pitch = new Float32Array(rows);
      for (let i = 0; i < rows; i++) pitch[i] = (src.pitchRaw[i] || 0) * k;
    }
    return { yaw, pitch };
  }

  if (mapping.lookMode === 'vector' && src.dirX && src.dirY && src.dirZ) {
    const yaw = new Float32Array(rows);
    const pitch = new Float32Array(rows);
    const { up, flipX, flipY, flipZ } = mapping.axes;
    const zUp = up === 'z';
    const fx = flipX ? -1 : 1;
    const fy = flipY ? -1 : 1;
    const fz = flipZ ? -1 : 1;
    for (let i = 0; i < rows; i++) {
      // Same relabelling and flips the positions went through, so the ray
      // points where the cube does - in a mirrored-source world as well.
      const wx = (src.dirX[i] || 0) * fx;
      const wy = zUp ? (src.dirZ[i] || 0) * fz : (src.dirY[i] || 0) * fy;
      const wz = zUp ? (src.dirY[i] || 0) * fy : (src.dirZ[i] || 0) * fz;
      yaw[i] = Math.atan2(wx, -wz);
      pitch[i] = Math.atan2(wy, Math.hypot(wx, wz));
    }
    return { yaw, pitch };
  }

  return { yaw: null, pitch: null };
}
