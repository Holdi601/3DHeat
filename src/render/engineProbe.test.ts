import { afterEach, describe, expect, it, vi } from 'vitest';
import { Engine } from './engine';

/**
 * The Measure panel's live "Heat here", without a GPU.
 *
 * The engine is built without its constructor — that one wants a canvas and a
 * renderer — and given only what the live probe reads: a cursor, a renderer that
 * records the divisor it is asked to read with, and the gain the frame was
 * written with.
 */
interface ProbeSeam {
  renderer: { readHeatAt: (x: number, y: number, divisor: number) => number | null };
  frameGain: number;
  measureEnabled: boolean;
  cursorPx: { x: number; y: number } | null;
  lastProbe: number;
  measure: { heat: number | null };
  probeCursor(now: number): void;
}

afterEach(() => vi.unstubAllGlobals());

describe('the live heat probe', () => {
  it('undoes the half-float gain, as the one-shot probe does', () => {
    // The defect: the live readout divided by 1, so on a half-float target it was
    // a power of two away from the saturation point it is meant to be read against.
    vi.stubGlobal('window', { devicePixelRatio: 2 });
    const reads: number[][] = [];
    const engine = Object.create(Engine.prototype) as ProbeSeam;
    Object.assign(engine, {
      renderer: {
        readHeatAt: (x: number, y: number, divisor: number) => {
          reads.push([x, y, divisor]);
          return 4096 / divisor;
        },
      },
      frameGain: 8,
      measureEnabled: true,
      cursorPx: { x: 10, y: 20 },
      lastProbe: 0,
      measure: { heat: null },
    });
    engine.probeCursor(1000);
    expect(reads).toEqual([[20, 40, 8]]);
    expect(engine.measure.heat).toBe(512);

    // And it agrees with the one-shot reading.
    expect((engine as unknown as Engine).readHeatProbe(10, 20)).toBe(512);
  });

  it('reads rarely: a readback stalls the pipeline', () => {
    vi.stubGlobal('window', { devicePixelRatio: 1 });
    let n = 0;
    const engine = Object.create(Engine.prototype) as ProbeSeam;
    Object.assign(engine, {
      renderer: { readHeatAt: () => ++n },
      frameGain: 1,
      measureEnabled: true,
      cursorPx: { x: 0, y: 0 },
      lastProbe: 0,
      measure: { heat: null },
    });
    engine.probeCursor(1000);
    engine.probeCursor(1050);
    expect(n).toBe(1);
    engine.probeCursor(1200);
    expect(n).toBe(2);
  });
});
