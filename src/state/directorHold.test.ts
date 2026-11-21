import { afterEach, describe, expect, it, vi } from 'vitest';
import { useReplayStore } from './replayStore';
import { flyTo } from '../ui/replay/replayView';
import type { Engine } from '../render/engine';
import type { Dataset } from './types';

/** An engine with no level: every view is clear, the camera at the origin looking north. */
function fakeEngine(): Engine {
  return {
    cameraPose: () => ({ position: { x: 0, y: 100, z: 0 }, forward: { x: 0, y: 0, z: -1 } }),
    setCameraPose: () => undefined,
    inspector: { surfaceHit: () => null },
  } as unknown as Engine;
}

const dataset = { unitsPerMetre: 1, bounds: { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 } } as unknown as Dataset;

describe("a jump to an event takes the camera from the tactical display's director", () => {
  afterEach(() => {
    useReplayStore.getState().setLook({ on: false, director: false });
    useReplayStore.getState().holdDirector(false);
    vi.unstubAllGlobals();
  });

  it('holds the director until it is resumed or switched on again', () => {
    vi.stubGlobal('requestAnimationFrame', () => 0);
    const r = useReplayStore.getState();
    r.setLook({ on: true, director: true });
    useReplayStore.setState({ follow: 4, followUnit: 'u4' });
    expect(useReplayStore.getState().directorHeld).toBe(false);
    flyTo(fakeEngine(), dataset, { x: 500, y: 0, z: -500 }, 120);
    const s = useReplayStore.getState();
    expect(s.directorHeld).toBe(true);
    expect(s.follow).toBeNull();
    s.holdDirector(false);
    expect(useReplayStore.getState().directorHeld).toBe(false);
    flyTo(fakeEngine(), dataset, { x: 0, y: 0, z: -500 }, 120);
    expect(useReplayStore.getState().directorHeld).toBe(true);
    useReplayStore.getState().setLook({ director: true });
    expect(useReplayStore.getState().directorHeld).toBe(false);
  });

  it('leaves the director alone when there is none', () => {
    vi.stubGlobal('requestAnimationFrame', () => 0);
    useReplayStore.getState().setLook({ on: true, director: false });
    flyTo(fakeEngine(), dataset, { x: 500, y: 0, z: -500 }, 120);
    expect(useReplayStore.getState().directorHeld).toBe(false);
  });
});
