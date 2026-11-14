/**
 * Heat weighed by value (`data/cost.ts`): a value column as each row's weight.
 *
 * The renderers read the column per row on the GPU, from the same lazily
 * uploaded per-chunk buffers the filters use, and scale it by one number so
 * the mean costly row weighs what a counted row does: the saturation that
 * suited the counts suits the money too. A row worth nothing draws nothing.
 * The scale is worked out once per column, never per frame.
 */

import type { Dataset } from '../state/types';

export interface ValueWeight {
  column: string;
  /** One over the mean magnitude of the rows that carry a value. */
  scale: number;
  /** Earned minus paid: both signs, drawn on the diverging ramp. */
  signed: boolean;
}

const scales = new WeakMap<Float32Array, number>();

export function valueWeight(ds: Dataset | null, column: string | null | undefined): ValueWeight | null {
  if (!ds || !column) return null;
  const a = ds.attrs.find((c) => c.name === column && c.kind === 'number');
  if (!a) return null;
  const data = a.data as Float32Array;
  let scale = scales.get(data);
  if (scale === undefined) {
    let sum = 0;
    let k = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      if (v !== 0 && v === v) {
        sum += Math.abs(v);
        k++;
      }
    }
    scale = k > 0 && sum > 0 ? k / sum : 1;
    scales.set(data, scale);
  }
  return { column, scale, signed: /^net_/i.test(column) || a.min < 0 };
}
