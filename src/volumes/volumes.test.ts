import { describe, expect, it, beforeEach } from 'vitest';
import { parquetReadObjects } from 'hyparquet';
import type { Dataset } from '../state/types';
import {
  compileVolume,
  containsPoint,
  containsRows,
  dragCorner,
  dragHeight,
  pointInPolygon,
  regularPolygon,
  rotateShape,
  selection,
  selects,
  volumeFilter,
  volumesFromJson,
  volumesToJson,
  type Volume,
  type VolumeShape,
} from './volume';
import { MAX_GPU_VOLUMES, packVolumes, VOL_CFG, VOL_INFO } from './gpu';
import { computeStats, FULL_SCOPE, SELECTION_ID } from './stats';
import { BlobSink, exportTest, selectRows, statsCsv, writeRows } from './export';
import { fitHeights } from './fit';
import { VolumeGestures, rayToVertical, type GestureHost } from './gestures';
import { useVolumeStore } from './store';

const vol = (shape: VolumeShape, op: 'include' | 'exclude' = 'include', id = Math.random().toString(36)): Volume => ({
  id,
  name: id,
  color: '#ff0000',
  visible: true,
  op,
  shape,
});

const box = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number, yaw = 0): VolumeShape => ({
  kind: 'box',
  center: [cx, cy, cz],
  size: [sx, sy, sz],
  yaw,
  pitch: 0,
  roll: 0,
});

/** A small dataset: a 10 x 10 grid of rows on y = 0 and y = 5, two persons, times ascending. */
function grid(): Dataset {
  const n = 200;
  const px = new Float32Array(n);
  const py = new Float32Array(n);
  const pz = new Float32Array(n);
  const time = new Float32Array(n);
  const personId = new Uint32Array(n);
  const teamId = new Uint16Array(n);
  const lifetime = new Float32Array(n);
  const weapon = new Uint32Array(n);
  const speed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const k = i % 100;
    px[i] = k % 10;
    pz[i] = Math.floor(k / 10);
    py[i] = i < 100 ? 0 : 5;
    time[i] = i;
    personId[i] = i % 2;
    teamId[i] = i % 2;
    lifetime[i] = i < n - 2 ? 2 : -1;
    // Rifles in the low corner, pistols elsewhere.
    weapon[i] = px[i] < 3 && pz[i] < 3 ? 0 : 1;
    speed[i] = px[i];
  }
  return {
    id: 't',
    name: 'test',
    count: n,
    px,
    py,
    pz,
    time,
    epochMs: null,
    lifetime,
    maxLifetimeGap: 2,
    personShared: null,
    yaw: null,
    pitch: null,
    personId,
    teamId,
    personLabels: ['a', 'b'],
    teamLabels: ['red', 'blue'],
    sessionId: null,
    sessionLabels: [],
    sessionRows: null,
    sessionStart: null,
    sessionEnd: null,
    personTeam: new Uint16Array([0, 1]),
    personSlot: new Uint16Array([0, 0]),
    teamSizes: new Uint32Array([1, 1]),
    attrs: [
      { name: 'weapon', kind: 'category', data: weapon, min: 0, max: 1, categories: ['rifle', 'pistol'] },
      { name: 'speed', kind: 'number', data: speed, min: 0, max: 9 },
    ],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 9, maxY: 5, maxZ: 9 },
    timeRange: [0, n - 1],
    timeSorted: true,
  };
}

describe('containment', () => {
  it('tests a box, turned and not', () => {
    const v = vol(box(0, 0, 0, 2, 2, 2));
    expect(containsPoint(v, 0.9, 0.9, 0.9)).toBe(true);
    expect(containsPoint(v, 1.1, 0, 0)).toBe(false);
    // Turned 45 degrees: (1.3, 0, 0) is inside the diamond, (0.9, 0, 0.9) is not.
    const t = vol(box(0, 0, 0, 2, 2, 2, Math.PI / 4));
    expect(containsPoint(t, 1.3, 0, 0)).toBe(true);
    expect(containsPoint(t, 0.9, 0, 0.9)).toBe(false);
  });

  it('tests spheres, cylinders and prisms', () => {
    const s = vol({ kind: 'sphere', center: [1, 1, 1], radius: 1 });
    expect(containsPoint(s, 1.5, 1.5, 1.5)).toBe(true);
    expect(containsPoint(s, 1.7, 1.7, 1.7)).toBe(false);
    const c = vol({ kind: 'cylinder', x: 0, z: 0, radius: 2, floor: 0, ceil: 3 });
    expect(containsPoint(c, 1.4, 2.9, 1.4)).toBe(true);
    expect(containsPoint(c, 1.5, 1, 1.5)).toBe(false);
    expect(containsPoint(c, 0, 3.1, 0)).toBe(false);
    // An L-shaped (non-convex) prism.
    const l = vol({ kind: 'prism', points: [[0, 0], [4, 0], [4, 1], [1, 1], [1, 4], [0, 4]], floor: 0, ceil: 2 });
    expect(containsPoint(l, 3, 1, 0.5)).toBe(true);
    expect(containsPoint(l, 3, 1, 3)).toBe(false);
    expect(containsPoint(l, 0.5, 1, 3)).toBe(true);
  });

  it('a regular octagon holds its centre and not its bounding corners', () => {
    const pts = regularPolygon(0, 0, 10, 10, 8, Math.PI / 8);
    const flat = pts.flat();
    expect(pointInPolygon(flat, 0, 0)).toBe(true);
    expect(pointInPolygon(flat, 9.5, 9.5)).toBe(false);
  });

  it('combines include and exclude volumes', () => {
    const a = vol(box(0, 0, 0, 4, 4, 4));
    const hole = vol(box(0, 0, 0, 1, 1, 1), 'exclude');
    const vs = [a, hole];
    expect(selects(vs, 1.5, 0, 0)).toBe(true);
    expect(selects(vs, 0, 0, 0)).toBe(false);
    expect(selects(vs, 3, 0, 0)).toBe(false);
    // Only excludes: everything else is selected.
    expect(selects([hole], 3, 0, 0)).toBe(true);
    const keep = volumeFilter(vs, 'outside')!;
    expect(keep(0, 0, 0)).toBe(true);
    expect(keep(1.5, 0, 0)).toBe(false);
    expect(volumeFilter(vs, 'off')).toBeNull();
    expect(volumeFilter([{ ...a, visible: false }], 'inside')).toBeNull();
  });

  it('marks rows in bulk the same as point by point', () => {
    const d = grid();
    const v = vol(box(2, 0, 2, 3, 1, 3));
    const mask = containsRows(compileVolume(v), d.px, d.py, d.pz);
    for (let i = 0; i < d.count; i++) expect(mask[i]).toBe(containsPoint(v, d.px[i], d.py[i], d.pz[i]) ? 1 : 0);
    const sel = containsRows(selection([v]), d.px, d.py, d.pz);
    expect(Array.from(sel)).toEqual(Array.from(mask));
  });

  it('edits shapes with handles', () => {
    const b = box(0, 1, 0, 2, 2, 2) as Extract<VolumeShape, { kind: 'box' }>;
    // Corner 2 (+x, +z) dragged out to (3, 3): the opposite corner (-1, -1) stays.
    const d = dragCorner(b, 2, 3, 3) as typeof b;
    expect(d.size[0]).toBeCloseTo(4);
    expect(d.center[0]).toBeCloseTo(1);
    expect(d.center[2]).toBeCloseTo(1);
    const h = dragHeight(b, 'top', 10) as typeof b;
    expect(h.center[1] - h.size[1] / 2).toBeCloseTo(0);
    expect(h.center[1] + h.size[1] / 2).toBeCloseTo(10);
    // Turning a box's outline as a polygon agrees with turning its yaw.
    const r = rotateShape(b, Math.PI / 2) as typeof b;
    expect(r.yaw).toBeCloseTo(Math.PI / 2);
  });

  it('round-trips through JSON with fresh ids and rejects junk', () => {
    const vs = [vol(box(1, 2, 3, 4, 5, 6)), vol({ kind: 'sphere', center: [0, 0, 0], radius: 2 }, 'exclude')];
    const back = volumesFromJson(volumesToJson(vs));
    expect(back.map((v) => v.shape)).toEqual(vs.map((v) => v.shape));
    expect(back[1].op).toBe('exclude');
    expect(back[0].id).not.toBe(vs[0].id);
    expect(volumesFromJson('[{"shape":{"kind":"box"}}]')).toEqual([]);
    expect(() => volumesFromJson('{"x":1}')).toThrow();
  });
});

describe('gpu packing', () => {
  it('packs the filter and drops what does not fit', () => {
    expect(packVolumes([vol(box(0, 0, 0, 1, 1, 1))], 'off')).toBeNull();
    const many = Array.from({ length: MAX_GPU_VOLUMES + 2 }, () => vol(box(0, 0, 0, 1, 1, 1)));
    const p = packVolumes(many, 'inside')!;
    expect(p.count).toBe(MAX_GPU_VOLUMES);
    expect(p.dropped.length).toBe(2);
    expect(p.block[VOL_CFG]).toBe(1);
    expect(p.block[VOL_INFO]).toBe(1);
    const q = packVolumes([vol(box(0, 0, 0, 1, 1, 1), 'exclude')], 'outside')!;
    expect(q.block[VOL_CFG]).toBe(2);
    expect(q.block[VOL_CFG + 2]).toBe(0);
    expect(q.block[VOL_INFO + 1]).toBe(-1);
  });
});

describe('statistics', () => {
  it('counts rows, shares, people, dwell and columns inside', () => {
    const d = grid();
    // x and z in [0, 2], low layer only: 9 cells of the 100, once (y = 0).
    const v = vol(box(1, 0, 1, 2.2, 1, 2.2), 'include', 'corner');
    const r = computeStats(d, [v]);
    const s = r.volumes[0];
    expect(s.rowsAll).toBe(9);
    expect(s.rows).toBe(9);
    expect(s.shareAll).toBeCloseTo(9 / 200);
    expect(s.persons).toBe(2);
    expect(s.teams).toBe(2);
    expect(s.dwell).toBeCloseTo(18);
    const weapon = s.columns.find((c) => c.name === 'weapon')!;
    expect(weapon.kind).toBe('category');
    if (weapon.kind === 'category') {
      expect(weapon.top[0].label).toBe('rifle');
      expect(weapon.top[0].share).toBe(1);
      // Rifles are 9 of 100 of all rows: inside they are all, an 11x lift.
      expect(weapon.top[0].lift).toBeCloseTo(100 / 9);
    }
    const speed = s.columns.find((c) => c.name === 'speed')!;
    if (speed.kind === 'number') {
      expect(speed.min).toBe(0);
      expect(speed.max).toBe(2);
      expect(speed.mean).toBeCloseTo(1);
      expect(speed.overallMean).toBeCloseTo(4.5);
    }
    expect(s.peakDensity).toBeGreaterThan(0);
  });

  it('respects the scope and adds the combination', () => {
    const d = grid();
    const a = vol(box(4.5, 2.5, 4.5, 10, 6, 10), 'include', 'all');
    const hole = vol(box(1, 2.5, 1, 2.2, 6, 2.2), 'exclude', 'hole');
    const r = computeStats(d, [a, hole], { ...FULL_SCOPE, timeLo: 0, timeHi: 99 });
    expect(r.shownRows).toBe(100);
    const all = r.volumes.find((s) => s.id === 'all')!;
    expect(all.rowsAll).toBe(200);
    expect(all.rows).toBe(100);
    expect(all.shareShown).toBe(1);
    const combo = r.volumes.find((s) => s.id === SELECTION_ID)!;
    expect(combo.rows).toBe(91);
  });

  it('counts entries and exits along each track', () => {
    const d = grid();
    // A strip x <= 4.5 at y = 0: each person's samples cross in and out of it along each row of the grid.
    const v = vol(box(2, 0, 4.5, 5, 1, 10));
    const s = computeStats(d, [v]).volumes[0];
    expect(s.entries).toBeGreaterThan(0);
    expect(s.exits).toBeGreaterThan(0);
  });

  it('writes the statistics as CSV', () => {
    const d = grid();
    const csv = statsCsv(computeStats(d, [vol(box(1, 0, 1, 2.2, 1, 2.2), 'include', 'c')]));
    expect(csv).toContain('c,summary,rows_all,9');
    expect(csv).toContain('c,weapon,rifle,9,1');
  });
});

describe('export', () => {
  it('selects the rows inside, with and without the scope', async () => {
    const d = grid();
    const v = vol(box(1, 2.5, 1, 2.2, 6, 2.2));
    expect((await selectRows(d, exportTest([v], null), null)).length).toBe(18);
    expect((await selectRows(d, exportTest([v], v.id), { ...FULL_SCOPE, timeLo: 100, timeHi: 300 })).length).toBe(9);
  });

  it('writes CSV with every column and the volume', async () => {
    const d = grid();
    const v = { ...vol(box(1, 0, 1, 2.2, 1, 2.2)), name: 'spawn' };
    const rows = await selectRows(d, exportTest([v], null), null);
    const sink = new BlobSink();
    await writeRows(d, rows, [v], 'csv', sink);
    const text = await sink.blob('text/csv').text();
    const lines = text.trim().split('\n');
    expect(lines[0]).toBe('time,x,y,z,person,team,weapon,speed,volume');
    expect(lines.length).toBe(10);
    expect(lines[1]).toBe('0,0,0,0,a,red,rifle,0,spawn');
  });

  it('writes Parquet that reads back', async () => {
    const d = grid();
    const v = vol(box(1, 0, 1, 2.2, 1, 2.2));
    const rows = await selectRows(d, exportTest([v], null), null);
    const sink = new BlobSink();
    await writeRows(d, rows, [v], 'parquet', sink);
    const buf = await sink.blob('application/octet-stream').arrayBuffer();
    const objs = (await parquetReadObjects({ file: buf })) as Record<string, unknown>[];
    expect(objs.length).toBe(9);
    expect(objs[0].weapon).toBe('rifle');
    expect(objs[3].z).toBe(1);
  });
});

describe('drawing', () => {
  beforeEach(() => {
    useVolumeStore.setState({ volumes: [], selected: null, drawing: null, past: [], future: [] });
  });

  /** A top-down host: one pixel is one world unit, the ground at y = 0. */
  const host = (d: Dataset | null): GestureHost => ({
    ground: (sx, sy) => [sx, 0, sy],
    plane: (sx, sy, y) => [sx, y, sy],
    toScreen: (p) => [p[0], p[2]],
    dataset: () => d,
  });

  it('draws a box with one drag and fits its height to the data', () => {
    const d = grid();
    const g = new VolumeGestures(host(d));
    useVolumeStore.getState().startDraw('box');
    expect(g.down(0, 0, { shift: false, alt: false })).toBe(true);
    g.move(4, 3, { shift: false, alt: false });
    g.up(4, 3, { shift: false, alt: false });
    const st = useVolumeStore.getState();
    expect(st.volumes.length).toBe(1);
    expect(st.drawing).toBeNull();
    const s = st.volumes[0].shape;
    expect(s.kind).toBe('box');
    if (s.kind === 'box') {
      expect(s.size[0]).toBeCloseTo(4);
      expect(s.size[2]).toBeCloseTo(3);
      // The data over it reaches y = 5: the box covers it.
      expect(s.center[1] + s.size[1] / 2).toBeGreaterThan(5);
    }
  });

  it('moves the selected volume by its body, undoes and deletes', () => {
    const g = new VolumeGestures(host(null));
    const v = useVolumeStore.getState().add(box(5, 1, 5, 4, 2, 4));
    expect(useVolumeStore.getState().selected).toBe(v.id);
    expect(g.down(5, 5, { shift: false, alt: false })).toBe(true);
    g.move(15, 5, { shift: false, alt: false });
    g.up(15, 5, { shift: false, alt: false });
    const moved = useVolumeStore.getState().volumes[0].shape;
    expect(moved.kind === 'box' && moved.center[0]).toBeCloseTo(15);
    g.key('KeyZ', true, false);
    const back = useVolumeStore.getState().volumes[0].shape;
    expect(back.kind === 'box' && back.center[0]).toBeCloseTo(5);
    g.key('Delete', false, false);
    expect(useVolumeStore.getState().volumes.length).toBe(0);
  });

  it('alt-drag moves a copy; a press off the volume is the camera', () => {
    const g = new VolumeGestures(host(null));
    useVolumeStore.getState().add(box(5, 1, 5, 4, 2, 4));
    expect(g.down(50, 50, { shift: false, alt: false })).toBe(false);
    g.down(5, 5, { shift: false, alt: true });
    g.move(20, 5, { shift: false, alt: true });
    g.up(20, 5, { shift: false, alt: true });
    expect(useVolumeStore.getState().volumes.length).toBe(2);
  });

  it('clicks out a polygon and closes it on the first point', () => {
    const g = new VolumeGestures(host(null));
    useVolumeStore.getState().startDraw('polygon');
    for (const [x, y] of [[0, 0], [100, 0], [100, 100], [0, 100]]) g.down(x, y, { shift: false, alt: false });
    g.down(1, 1, { shift: false, alt: false });
    const v = useVolumeStore.getState().volumes;
    expect(v.length).toBe(1);
    expect(v[0].shape.kind === 'prism' && v[0].shape.points.length).toBe(4);
  });

  it('finds the height under a ray on a vertical line', () => {
    // From (0, 10, -10) looking along +z: the line through (0, 0) is met at height 10.
    expect(rayToVertical([0, 10, -10], [0, 0, 1], 0, 0)).toBeCloseTo(10);
  });

  it('stands a volume over empty ground on the ground', () => {
    const s = fitHeights(null, box(0, 0, 0, 4, 1, 4), 2);
    expect(s.kind === 'box' && s.center[1] - s.size[1] / 2).toBeCloseTo(2);
  });
});
