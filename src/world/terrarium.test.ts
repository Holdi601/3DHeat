import { describe, expect, it } from 'vitest';
import { decodeTerrarium, terrariumHeight } from './terrarium';

/** The Terrarium colour of a height: the encoder's side, for the test. */
function encode(h: number): [number, number, number] {
  const v = h + 32768;
  const r = Math.floor(v / 256);
  const g = Math.floor(v) % 256;
  const b = Math.round((v - Math.floor(v)) * 256);
  return [r, g, b];
}

describe('Terrarium elevation', () => {
  it('decodes heights from colour', () => {
    expect(terrariumHeight(128, 0, 0)).toBe(0);
    expect(terrariumHeight(0, 0, 0)).toBe(-32768);
    // Mount Elbrus, 5642 m, and the Dead Sea shore, -430 m.
    expect(terrariumHeight(...encode(5642))).toBe(5642);
    expect(terrariumHeight(...encode(-430))).toBe(-430);
    expect(terrariumHeight(...encode(12.5))).toBe(12.5);
  });

  it('decodes a whole image, one height per pixel', () => {
    const heights = [0, 1000.25, -10994, 8848];
    const rgba = new Uint8ClampedArray(heights.length * 4);
    heights.forEach((h, i) => {
      rgba.set([...encode(h), 255], i * 4);
    });
    expect(Array.from(decodeTerrarium(rgba))).toEqual(heights);
  });
});
