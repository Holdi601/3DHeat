import { describe, expect, it } from 'vitest';
import type { Engine } from '../render/engine';
import { applyView, captureView, readViews, viewsToJson } from './savedViews';
import { useStore } from './store';
import type { Dataset } from './types';

function dataset(): Dataset {
  return {
    id: 'views',
    name: 'views.parquet',
    count: 4,
    px: new Float32Array(4),
    py: new Float32Array(4),
    pz: new Float32Array(4),
    time: Float32Array.from([0, 1, 2, 3]),
    epochMs: null,
    lifetime: null,
    maxLifetimeGap: 0,
    personShared: null,
    yaw: null,
    pitch: null,
    personId: Uint32Array.from([0, 0, 1, 1]),
    teamId: Uint16Array.from([0, 0, 1, 1]),
    personLabels: ['Ann', 'Ben'],
    teamLabels: ['Blue', 'Red'],
    sessionId: Uint32Array.from([0, 0, 1, 1]),
    sessionLabels: ['Round 1', 'Round 2'],
    sessionRows: Uint32Array.from([2, 2]),
    sessionStart: Float32Array.from([0, 2]),
    sessionEnd: Float32Array.from([1, 3]),
    personTeam: Uint16Array.from([0, 1]),
    personSlot: null,
    teamSizes: null,
    attrs: [
      { name: 'event', kind: 'category', categories: ['kill', 'death', 'fire'], data: Uint32Array.from([0, 1, 2, 0]), min: 0, max: 2 },
      { name: 'speed', kind: 'number', data: Float32Array.from([1, 2, 3, 4]), min: 1, max: 4 },
    ],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 10, maxY: 10, maxZ: 10 },
    timeRange: [0, 3],
    timeSorted: true,
  } as unknown as Dataset;
}

/** Just what the views read and set of the engine. */
function fakeEngine() {
  const pose = { position: { x: 1, y: 2, z: 3 }, forward: { x: 0, y: 0, z: -1 } };
  return {
    pose,
    cameraPose: () => ({ position: { ...pose.position }, forward: { ...pose.forward } }),
    setCameraPose: (p: typeof pose.position, f: typeof pose.forward) => {
      pose.position = { ...p };
      pose.forward = { ...f };
    },
    camera: { orthoHeight: 100 },
    live: { playhead: 2.5 },
    invalidate: () => undefined,
  };
}

describe('saved views', () => {
  it('captures by names and puts back the filters, the groups, the match and the camera', () => {
    const st = useStore.getState();
    st.setDataset(dataset());
    useStore.getState().setFilters([
      { kind: 'categories', column: 'event', allowed: [0, 2] },
      { kind: 'range', column: 'speed', min: 2, max: 3 },
    ]);
    useStore.getState().toggleTeam(1, false);
    useStore.getState().patchTeam({ session: 1 });
    const eng = fakeEngine();
    const v = captureView(eng as unknown as Engine);
    expect(v.filters).toEqual([
      { by: 'category', column: 'event', values: ['kill', 'fire'] },
      { by: 'range', column: 'speed', min: 2, max: 3 },
    ]);
    expect(v.hiddenTeams).toEqual(['Red']);
    expect(v.session).toBe('Round 2');
    expect(v.timeline.playhead).toBe(2.5);

    // Everything changed, then the view back.
    useStore.getState().setFilters([]);
    useStore.getState().toggleTeam(1, true);
    useStore.getState().patchTeam({ session: -1 });
    eng.setCameraPose({ x: 9, y: 9, z: 9 }, { x: 1, y: 0, z: 0 });
    const missing = applyView(eng as unknown as Engine, v);
    expect(missing).toEqual([]);
    const s = useStore.getState();
    expect(s.filters).toEqual([
      { kind: 'categories', column: 'event', allowed: [0, 2] },
      { kind: 'range', column: 'speed', min: 2, max: 3 },
    ]);
    expect(s.teamVisibility[1]).toBe(false);
    expect(s.team.session).toBe(1);
    expect(eng.pose.position).toEqual({ x: 1, y: 2, z: 3 });
  });

  it('says what a different dataset lacks, and reads back only views from JSON', () => {
    const eng = fakeEngine();
    const v = captureView(eng as unknown as Engine);
    v.filters.push({ by: 'range', column: 'altitude', min: 0, max: 1 });
    v.session = 'Round 9';
    const missing = applyView(eng as unknown as Engine, v);
    expect(missing).toContain('altitude');
    expect(missing).toContain('Round 9');
    const json = viewsToJson([{ id: 'a', name: 'Choke', note: 'Watch the gap', savedAt: 1, dataset: 'views.parquet', view: v }]);
    const back = readViews(JSON.parse(json));
    expect(back).toHaveLength(1);
    expect(back[0].note).toBe('Watch the gap');
    expect(readViews({ views: [{ name: 'x' }, { view: { mode: 'heat-simple', camera: { position: { x: 'a' } }, timeline: {} } }] })).toEqual([]);
  });
});
