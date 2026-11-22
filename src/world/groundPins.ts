/**
 * The recording's own ground under a streamed theatre: where its vehicles
 * drove, and at what height.
 *
 * A recorded vehicle's height is the game's ground, and the streamed real
 * earth differs from the game's by metres, more in the hills: close up, tanks
 * sank into slopes or hovered over them, each a little differently. Where the
 * game's own terrain is at hand (a DCS area from the levels folder) the tiles
 * take its heights (`dcsGround.ts`); everywhere else they take the vehicles'.
 * Each tile, as it is built at its level of detail, moves its grid points
 * near a vehicle by how far that vehicle sat off the grid's own surface, so
 * the ground drawn at that detail passes under the vehicles - rebuilt with
 * the tile whenever its detail changes, in the stream worker, nothing read
 * back. A vehicle further off than `PIN_MAX` (a bridge, a roof, a bad row) is
 * left out, and the recording's heights are never touched.
 */

// The pins themselves are worked out from a dataset in `pinsOfData.ts`, on the page; this half runs in the stream worker.

/** A recording's ground points: latitude, longitude, height in metres, three numbers each. */
export type GroundPins = Float64Array;

/** Metres off the drawn ground beyond which a vehicle does not move it: a bridge, a roof, or the data's own error. */
export const PIN_MAX = 20;
/** Metres round a vehicle the ground is moved over, at the finest detail. */
const PIN_REACH = 40;
/** Pins by cells of a hundredth of a degree, for a tile to find its own. */
export class PinIndex {
  private readonly cells = new Map<number, number[]>();
  constructor(readonly pins: GroundPins) {
    for (let i = 0; i < pins.length; i += 3) {
      const k = PinIndex.key(Math.floor(pins[i] * 100), Math.floor(pins[i + 1] * 100));
      const list = this.cells.get(k);
      if (list) list.push(i);
      else this.cells.set(k, [i]);
    }
  }

  private static key(a: number, b: number): number {
    return a * 100_000 + b;
  }

  /** Each pin in the box, by its offset in `pins`. */
  each(south: number, west: number, north: number, east: number, fn: (i: number) => void): void {
    const a0 = Math.floor(south * 100);
    const a1 = Math.floor(north * 100);
    const b0 = Math.floor(west * 100);
    const b1 = Math.floor(east * 100);
    // A box of more cells than there are pins: go through the pins instead.
    if ((a1 - a0 + 1) * (b1 - b0 + 1) > this.cells.size) {
      for (const list of this.cells.values())
        for (const i of list) {
          const la = this.pins[i];
          const lo = this.pins[i + 1];
          if (la >= south && la <= north && lo >= west && lo <= east) fn(i);
        }
      return;
    }
    for (let a = a0; a <= a1; a++)
      for (let b = b0; b <= b1; b++) {
        const list = this.cells.get(PinIndex.key(a, b));
        if (!list) continue;
        for (const i of list) {
          const la = this.pins[i];
          const lo = this.pins[i + 1];
          if (la >= south && la <= north && lo >= west && lo <= east) fn(i);
        }
      }
  }
}

/**
 * A tile's height grid moved onto the pins in it (see the top): `heights` is
 * `grid` x `grid` points, the first at global Web Mercator pixel (px0, py0) at
 * scale `S`, `dx` pixels apart, `mpp` metres a pixel; `skip` marks points that
 * already have the game's own height. In place; returns the pins used.
 */
export function pinHeights(
  heights: Float32Array,
  grid: number,
  px0: number,
  py0: number,
  dx: number,
  S: number,
  mpp: number,
  box: { south: number; west: number; north: number; east: number },
  index: PinIndex,
  skip: Uint8Array | null,
): number {
  const sum = new Float32Array(heights.length);
  const weight = new Float32Array(heights.length);
  const reach = Math.max(1, Math.ceil(PIN_REACH / (dx * mpp)));
  const pins = index.pins;
  let used = 0;
  index.each(box.south, box.west, box.north, box.east, (p) => {
    const lat = pins[p];
    const lon = pins[p + 1];
    const s = Math.sin((lat * Math.PI) / 180);
    const fx = (((lon + 180) / 360) * S - px0) / dx;
    const fy = ((0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * S - py0) / dx;
    const i0 = Math.floor(fx);
    const j0 = Math.floor(fy);
    if (i0 < 0 || j0 < 0 || i0 + 1 >= grid || j0 + 1 >= grid) return;
    const u = fx - i0;
    const v = fy - j0;
    const k = j0 * grid + i0;
    const h0 = heights[k] * (1 - u) * (1 - v) + heights[k + 1] * u * (1 - v) + heights[k + grid] * (1 - u) * v + heights[k + grid + 1] * u * v;
    const off = pins[p + 2] - h0;
    if (!Number.isFinite(off) || Math.abs(off) > PIN_MAX) return;
    used++;
    for (let j = Math.max(0, j0 - reach + 1); j <= Math.min(grid - 1, j0 + reach); j++)
      for (let i = Math.max(0, i0 - reach + 1); i <= Math.min(grid - 1, i0 + reach); i++) {
        const q = j * grid + i;
        if (skip && skip[q]) continue;
        const w = 1 / (1e-3 + Math.hypot(i - fx, j - fy));
        sum[q] += w * off;
        weight[q] += w;
      }
  });
  if (used) for (let q = 0; q < heights.length; q++) if (weight[q] > 0) heights[q] += sum[q] / weight[q];
  return used;
}
