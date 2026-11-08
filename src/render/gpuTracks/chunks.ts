/**
 * The chunk spans keys are counted from (`store.ts`): a span a `CHUNK_KEYS`
 * keys of a track, origin x, y, z, a position step, first time and a time
 * step, as float32, keys in 16 bits of it. On its own, without the figures,
 * so the lean overlay's decode workers can write keys with it.
 */

/** Keys a chunk span holds, and the u32 of one (origin x, y, z, step, first time, time step, two spare). */
export const CHUNK_SHIFT = 6;
export const CHUNK_KEYS = 1 << CHUNK_SHIFT;
export const CHUNK_U32 = 8;
/** Steps a coordinate or the time spans within a chunk (16 bits). */
const STEPS = 65535;

const q16 = (v: number, o: number, st: number) => Math.max(0, Math.min(STEPS, Math.round((v - o) / st)));

/** The largest float32 at or below `v`. */
function f32Below(v: number): number {
  const f = Math.fround(v);
  return f <= v ? f : Math.fround(v - Math.abs(v) * 2 ** -23);
}

/** A float32 step at least `extent / STEPS`, so 16 bits reach across. */
function f32Step(extent: number): number {
  const need = Math.max(extent, 1e-6) / STEPS;
  let st = Math.fround(need * (1 + 1e-6));
  while (st < need) st = Math.fround(st * (1 + 2 ** -20));
  return st;
}

/**
 * One chunk of `n` keys from `buf` (x, y, z, t a key, in time order, at least
 * a millisecond apart): its span into `span` at `so` (`CHUNK_U32`, float32 as
 * the GPU reads it) and its keys into `keysA` from key `at`. What a builder
 * without the data's own float32 values (the lean overlay) writes keys with.
 */
export function encodeChunk(buf: Float64Array, n: number, keysA: Uint32Array, at: number, span: Float32Array, so: number): void {
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let k = 0; k < n; k++) {
    const o = k * 4;
    x0 = Math.min(x0, buf[o]);
    x1 = Math.max(x1, buf[o]);
    y0 = Math.min(y0, buf[o + 1]);
    y1 = Math.max(y1, buf[o + 1]);
    z0 = Math.min(z0, buf[o + 2]);
    z1 = Math.max(z1, buf[o + 2]);
  }
  x0 = f32Below(x0);
  y0 = f32Below(y0);
  z0 = f32Below(z0);
  const st = f32Step(Math.max(x1 - x0, y1 - y0, z1 - z0));
  const t0 = f32Below(buf[3]);
  const ts = f32Step(buf[(n - 1) * 4 + 3] - t0);
  span[so] = x0;
  span[so + 1] = y0;
  span[so + 2] = z0;
  span[so + 3] = st;
  span[so + 4] = t0;
  span[so + 5] = ts;
  let lastQt = -1;
  for (let k = 0; k < n; k++) {
    const o = k * 4;
    const qt = Math.min(STEPS, Math.max(lastQt + 1, q16(buf[o + 3], t0, ts)));
    lastQt = qt;
    keysA[(at + k) * 2] = (q16(buf[o], x0, st) | (q16(buf[o + 1], y0, st) << 16)) >>> 0;
    keysA[(at + k) * 2 + 1] = (q16(buf[o + 2], z0, st) | (qt << 16)) >>> 0;
  }
}
