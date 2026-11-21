import { afterEach, describe, expect, it } from 'vitest';
import { Engine } from './engine';
import { useStore } from '../state/store';

/**
 * The exposure lock, without a GPU: the engine is built without its constructor
 * (it wants a canvas and a renderer) and given only what metering reads.
 */
interface LockSeam {
  autoExposePending: number;
  shownSaturation: number | null;
  dataset: unknown;
  meterSoon(): void;
  lockExposure(on: boolean): void;
}

const engine = (): LockSeam => {
  const e = Object.create(Engine.prototype) as LockSeam;
  Object.assign(e, { autoExposePending: 0, shownSaturation: null, dataset: {} });
  return e;
};

const initial = useStore.getState().heat;
afterEach(() => useStore.setState({ heat: initial }));

describe('the exposure lock', () => {
  it('lets a new filter, kind or load meter the scale again while unlocked', () => {
    const e = engine();
    e.meterSoon();
    expect(e.autoExposePending).toBeGreaterThan(0);
  });

  it('keeps the scale while locked: nothing meters by itself', () => {
    const e = engine();
    e.shownSaturation = 42;
    e.lockExposure(true);
    const h = useStore.getState().heat;
    expect(h.exposureLocked).toBe(true);
    expect(h.followExposure).toBe(false);
    // Locked at what was on screen, a glide stopped where it was.
    expect(h.saturation).toBe(42);
    e.meterSoon();
    expect(e.autoExposePending).toBe(0);
  });

  it('unlocks into following the view, metered again', () => {
    const e = engine();
    e.lockExposure(true);
    e.lockExposure(false);
    const h = useStore.getState().heat;
    expect(h.exposureLocked).toBe(false);
    expect(h.followExposure).toBe(true);
    expect(e.autoExposePending).toBeGreaterThan(0);
  });
});
