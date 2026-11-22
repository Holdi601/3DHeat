import { describe, expect, it } from 'vitest';
import { PIN_MAX, PinIndex, pinHeights } from './groundPins';
import { tileBox } from './tiles';

const GRID = 33;

/** A tile's grid over flat ground at `h` metres, and where a lat/lon falls on it (fractional grid point). */
function tile(z: number, x: number, y: number, h: number) {
  const S = 256 * 2 ** z;
  const px0 = x * 256;
  const py0 = y * 256;
  const dx = 256 / (GRID - 1);
  const box = tileBox(x, y, z);
  const at = (lat: number, lon: number) => {
    const s = Math.sin((lat * Math.PI) / 180);
    return [(((lon + 180) / 360) * S - px0) / dx, ((0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * S - py0) / dx];
  };
  const sample = (heights: Float32Array, lat: number, lon: number) => {
    const [fx, fy] = at(lat, lon);
    const i = Math.floor(fx);
    const j = Math.floor(fy);
    const u = fx - i;
    const v = fy - j;
    const k = j * GRID + i;
    return heights[k] * (1 - u) * (1 - v) + heights[k + 1] * u * (1 - v) + heights[k + GRID] * (1 - u) * v + heights[k + GRID + 1] * u * v;
  };
  return { S, px0, py0, dx, box, heights: new Float32Array(GRID * GRID).fill(h), sample };
}

describe("the recording's vehicles' ground under a streamed tile", () => {
  // A tile at zoom 12 over the Levant: about 40 m a grid step.
  const z = 12;
  const x = 2459;
  const y = 1619;

  it('passes the ground drawn at that detail under a vehicle that sat off it', () => {
    const t = tile(z, x, y, 100);
    const lat = (t.box.north + t.box.south) / 2;
    const lon = (t.box.east + t.box.west) / 2;
    const used = pinHeights(t.heights, GRID, t.px0, t.py0, t.dx, t.S, 30, t.box, new PinIndex(Float64Array.of(lat, lon, 106)), null);
    expect(used).toBe(1);
    expect(Math.abs(t.sample(t.heights, lat, lon) - 106)).toBeLessThan(0.5);
    // Far from it the ground is as it was.
    expect(t.heights[0]).toBe(100);
  });

  it('leaves the ground alone for a vehicle far off it, and for one outside the tile', () => {
    const t = tile(z, x, y, 100);
    const lat = (t.box.north + t.box.south) / 2;
    const lon = (t.box.east + t.box.west) / 2;
    const pins = Float64Array.of(lat, lon, 100 + PIN_MAX + 5, t.box.north + 1, lon, 110);
    expect(pinHeights(t.heights, GRID, t.px0, t.py0, t.dx, t.S, 30, t.box, new PinIndex(pins), null)).toBe(0);
    expect(t.heights.every((h) => h === 100)).toBe(true);
  });
});
