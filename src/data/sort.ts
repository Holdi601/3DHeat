/**
 * Radix sort producing a permutation, for putting rows in time order.
 *
 * The whole renderer depends on rows being ascending in time — that invariant is
 * what reduces a timeline window to two binary searches instead of a scan over
 * hundreds of millions of rows. So the sort has to be linear, not O(n log n):
 * `Array.prototype.sort` on a ten-million-element index array takes tens of
 * seconds, three passes of counting sort take well under one.
 */

import { msg, MsgError } from './msg';

/**
 * Above this, sorting in a browser tab is the wrong tool. The largest load run is
 * 264M rows, where the sort was not what bound but the RAM budget. This limit is above
 * that and has not itself been run: it is there to stop a refusal the RAM budget would
 * not make, not because 400M rows are known to work.
 */
export const MAX_SORTABLE_ROWS = 400_000_000;

/**
 * Reinterpret IEEE-754 float bits so that unsigned integer order matches float
 * order: flip every bit of negatives, flip just the sign bit of positives.
 */
export function floatKeyToSortableUint(u: number): number {
  return u & 0x80000000 ? ~u : u | 0x80000000;
}

/**
 * Sort row indices ascending by `values`.
 *
 * `subset` restricts the sort to those rows, which lets a "drop the unparseable
 * rows" pass and the time sort be applied as one permutation instead of two full
 * copies of every column.
 */
export function radixSortIndices(values: Float32Array, subset?: Uint32Array): Uint32Array {
  const n = subset ? subset.length : values.length;
  if (n > MAX_SORTABLE_ROWS) {
    throw new MsgError(msg('data.sort.tooMany', { count: n, rows: { int: n } }));
  }

  const bits = new Uint32Array(values.buffer, values.byteOffset, values.length);
  const keys = new Uint32Array(values.length);
  for (let i = 0; i < values.length; i++) keys[i] = floatKeyToSortableUint(bits[i]);

  let src = new Uint32Array(n);
  if (subset) src.set(subset);
  else for (let i = 0; i < n; i++) src[i] = i;
  let dst = new Uint32Array(n);

  // 11 + 11 + 10 bits: three passes rather than four 8-bit ones.
  const passes: Array<[shift: number, buckets: number]> = [
    [0, 2048],
    [11, 2048],
    [22, 1024],
  ];

  for (const [shift, buckets] of passes) {
    const count = new Uint32Array(buckets + 1);
    const mask = buckets - 1;
    for (let i = 0; i < n; i++) {
      count[((keys[src[i]] >>> shift) & mask) + 1]++;
    }
    for (let b = 0; b < buckets; b++) count[b + 1] += count[b];
    for (let i = 0; i < n; i++) {
      const idx = src[i];
      dst[count[(keys[idx] >>> shift) & mask]++] = idx;
    }
    const t = src;
    src = dst;
    dst = t;
  }

  return src;
}
