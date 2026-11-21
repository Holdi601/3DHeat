/**
 * Append-only typed arrays.
 *
 * Two things matter at these sizes. First, growth is 1.6x rather than 2x: at
 * hundreds of megabytes per column, doubling routinely asks the allocator for a
 * gigabyte it does not need. Second and more importantly, when the row count is
 * known in advance — which it is for Parquet, from the footers — the buffer is
 * allocated once at exactly that size. That removes both the reallocation copies
 * and the up-to-60% slack, and lets `finish()` hand back the buffer itself
 * instead of a copy.
 */
const GROWTH = 1.6;
const MIN_CAPACITY = 1 << 16;

export class GrowableF32 {
  private buf: Float32Array;
  private n = 0;

  constructor(initial = MIN_CAPACITY) {
    this.buf = new Float32Array(Math.max(1, initial));
  }

  push(v: number): void {
    if (this.n === this.buf.length) this.grow(this.n + 1);
    this.buf[this.n++] = v;
  }

  /** Bulk append; avoids the per-element bounds check on the hot path. */
  pushAll(src: ArrayLike<number>, count: number): void {
    if (this.n + count > this.buf.length) this.grow(this.n + count);
    const buf = this.buf;
    const base = this.n;
    for (let i = 0; i < count; i++) buf[base + i] = src[i];
    this.n = base + count;
  }

  /** Append `count` zeros, to keep columns row-aligned. */
  pad(count: number): void {
    if (this.n + count > this.buf.length) this.grow(this.n + count);
    // A fresh buffer is already zero; only a reused region needs clearing.
    this.buf.fill(0, this.n, this.n + count);
    this.n += count;
  }

  get length(): number {
    return this.n;
  }

  /**
   * The finished column. Returns the backing buffer directly when it happens to
   * be exactly the right length, and only copies when it isn't.
   */
  finish(): Float32Array {
    return this.n === this.buf.length ? this.buf : this.buf.slice(0, this.n);
  }

  /** The live backing store, valid up to `length`. No copy. */
  raw(): Float32Array {
    return this.buf;
  }

  private grow(min: number): void {
    const next = new Float32Array(
      Math.max(min, MIN_CAPACITY, Math.ceil(this.buf.length * GROWTH)),
    );
    next.set(this.buf);
    this.buf = next;
  }
}

/**
 * The same thing at double width, for absolute timestamps.
 *
 * Epoch milliseconds do not survive a float32. At 1.77e12 ms — a date in 2025 —
 * the nearest representable neighbours are 2^17 ms apart, so a whole column of
 * them collapses onto instants 131.072 seconds apart. Measured on a real export:
 * 615,367 rows sampled every ten seconds came out holding 406 distinct instants,
 * every one an exact multiple of 131.072s, which made nine tenths of a person's
 * consecutive samples look simultaneous and left a thirty-second window with
 * nothing in it. Rebasing to the first timestamp fixes nothing, because by then
 * the resolution is already gone.
 */
export class GrowableF64 {
  private buf: Float64Array;
  private n = 0;

  constructor(initial = MIN_CAPACITY) {
    this.buf = new Float64Array(Math.max(1, initial));
  }

  push(v: number): void {
    if (this.n === this.buf.length) this.grow(this.n + 1);
    this.buf[this.n++] = v;
  }

  pushAll(src: ArrayLike<number>, count: number): void {
    if (this.n + count > this.buf.length) this.grow(this.n + count);
    const buf = this.buf;
    const base = this.n;
    for (let i = 0; i < count; i++) buf[base + i] = src[i];
    this.n = base + count;
  }

  pad(count: number): void {
    if (this.n + count > this.buf.length) this.grow(this.n + count);
    this.buf.fill(0, this.n, this.n + count);
    this.n += count;
  }

  get length(): number {
    return this.n;
  }

  finish(): Float64Array {
    return this.n === this.buf.length ? this.buf : this.buf.slice(0, this.n);
  }

  private grow(min: number): void {
    const next = new Float64Array(
      Math.max(min, MIN_CAPACITY, Math.ceil(this.buf.length * GROWTH)),
    );
    next.set(this.buf);
    this.buf = next;
  }
}

export class GrowableU32 {
  private buf: Uint32Array;
  private n = 0;

  constructor(initial = MIN_CAPACITY) {
    this.buf = new Uint32Array(Math.max(1, initial));
  }

  push(v: number): void {
    if (this.n === this.buf.length) this.grow(this.n + 1);
    this.buf[this.n++] = v;
  }

  pushAll(src: ArrayLike<number>, count: number): void {
    if (this.n + count > this.buf.length) this.grow(this.n + count);
    const buf = this.buf;
    const base = this.n;
    for (let i = 0; i < count; i++) buf[base + i] = src[i];
    this.n = base + count;
  }

  pad(count: number): void {
    if (this.n + count > this.buf.length) this.grow(this.n + count);
    this.buf.fill(0, this.n, this.n + count);
    this.n += count;
  }

  get length(): number {
    return this.n;
  }

  finish(): Uint32Array {
    return this.n === this.buf.length ? this.buf : this.buf.slice(0, this.n);
  }

  raw(): Uint32Array {
    return this.buf;
  }

  private grow(min: number): void {
    const next = new Uint32Array(Math.max(min, MIN_CAPACITY, Math.ceil(this.buf.length * GROWTH)));
    next.set(this.buf);
    this.buf = next;
  }
}

/** The same at 16 bits signed, for small per-vertex ids with -1 for none. */
export class GrowableI16 {
  private buf: Int16Array;
  private n = 0;

  constructor(initial = MIN_CAPACITY) {
    this.buf = new Int16Array(Math.max(1, initial));
  }

  push(v: number): void {
    if (this.n === this.buf.length) this.grow(this.n + 1);
    this.buf[this.n++] = v;
  }

  /** Append `count` copies of `v`. */
  fill(v: number, count: number): void {
    if (this.n + count > this.buf.length) this.grow(this.n + count);
    this.buf.fill(v, this.n, this.n + count);
    this.n += count;
  }

  get length(): number {
    return this.n;
  }

  finish(): Int16Array {
    return this.n === this.buf.length ? this.buf : this.buf.slice(0, this.n);
  }

  private grow(min: number): void {
    const next = new Int16Array(Math.max(min, MIN_CAPACITY, Math.ceil(this.buf.length * GROWTH)));
    next.set(this.buf);
    this.buf = next;
  }
}

/**
 * Maps repeated strings to dense integer ids.
 *
 * Player and team columns are usually GUIDs or names repeated across every row;
 * storing them as strings would cost more than all the positions combined, and
 * an integer id is what the GPU needs anyway.
 */
export class Dictionary {
  private readonly map = new Map<string, number>();
  readonly labels: string[] = [];

  intern(s: string): number {
    const hit = this.map.get(s);
    if (hit !== undefined) return hit;
    const id = this.labels.length;
    this.map.set(s, id);
    this.labels.push(s);
    return id;
  }

  get size(): number {
    return this.labels.length;
  }
}

/** Rows in one segment of a `SegmentedF64`: 128 MiB of doubles. */
const SEG_SHIFT = 24;
const SEG_ROWS = 1 << SEG_SHIFT;
const SEG_MASK = SEG_ROWS - 1;

/**
 * Doubles in segments of 128 MiB, for the absolute time a load merges in.
 *
 * Chromium will not allocate one ArrayBuffer of 2 GiB or more, however much
 * memory is free: past 268 million rows a single Float64Array cannot exist, and
 * every file after that point was reported unreadable. In segments the column
 * has no such ceiling, grows without a copy and without slack, and a segment is
 * only made when rows reach it.
 */
export class SegmentedF64 {
  private readonly segs: Float64Array[] = [];
  private n = 0;

  get length(): number {
    return this.n;
  }

  /** Grow to `min` rows; new rows are zero. */
  extend(min: number): void {
    while (this.segs.length * SEG_ROWS < min) this.segs.push(new Float64Array(SEG_ROWS));
    if (min > this.n) this.n = min;
  }

  get(i: number): number {
    return this.segs[i >>> SEG_SHIFT][i & SEG_MASK];
  }

  /** Write `count` values of `src` from row `at`, growing as needed. */
  write(src: ArrayLike<number>, count: number, at: number): void {
    this.extend(at + count);
    let done = 0;
    while (done < count) {
      const r = at + done;
      const seg = this.segs[r >>> SEG_SHIFT];
      const off = r & SEG_MASK;
      const take = Math.min(count - done, SEG_ROWS - off);
      if (src instanceof Float64Array) seg.set(src.subarray(done, done + take), off);
      else for (let k = 0; k < take; k++) seg[off + k] = src[done + k];
      done += take;
    }
  }

  /** Add `delta` to rows [lo, hi). */
  addRange(lo: number, hi: number, delta: number): void {
    for (let r = lo; r < hi; ) {
      const seg = this.segs[r >>> SEG_SHIFT];
      const off = r & SEG_MASK;
      const end = Math.min(hi - r, SEG_ROWS - off) + off;
      for (let k = off; k < end; k++) seg[k] += delta;
      r += end - off;
    }
  }

  /** Smallest and largest of rows [lo, hi), NaN skipped; [Infinity, -Infinity] when none. */
  minMax(lo: number, hi: number): [number, number] {
    let mn = Infinity;
    let mx = -Infinity;
    for (let r = lo; r < hi; ) {
      const seg = this.segs[r >>> SEG_SHIFT];
      const off = r & SEG_MASK;
      const end = Math.min(hi - r, SEG_ROWS - off) + off;
      for (let k = off; k < end; k++) {
        const v = seg[k];
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
      r += end - off;
    }
    return [mn, mx];
  }

  /** Rows [0, count) less `origin`, as float32; a value that is not finite becomes 0. */
  relativeF32(count: number, origin: number): Float32Array {
    const out = new Float32Array(count);
    for (let r = 0; r < count; ) {
      const seg = this.segs[r >>> SEG_SHIFT];
      const take = Math.min(count - r, SEG_ROWS);
      for (let k = 0; k < take; k++) {
        const v = seg[k];
        out[r + k] = Number.isFinite(v) ? v - origin : 0;
      }
      r += take;
    }
    return out;
  }

  /** The smallest finite value of rows [0, count), or Infinity. */
  finiteMin(count: number): number {
    let min = Infinity;
    for (let r = 0; r < count; ) {
      const seg = this.segs[r >>> SEG_SHIFT];
      const take = Math.min(count - r, SEG_ROWS);
      for (let k = 0; k < take; k++) {
        const v = seg[k];
        if (Number.isFinite(v) && v < min) min = v;
      }
      r += take;
    }
    return min;
  }
}
