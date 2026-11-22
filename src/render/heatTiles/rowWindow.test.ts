import { describe, expect, it } from 'vitest';
import type { ColumnMapping, Dataset } from '../../state/types';
import { groundRect } from './lod';
import { alignGroups, RowWindow, windowRect, type RowWindowHost } from './rowWindow';
import type { HeatTileSource, PyramidInfo } from './source';

const info: PyramidInfo = {
  key: 'k',
  x0: 0,
  y0: 0,
  size: 1024,
  leafLevel: 2,
  complete: true,
  estimateLevels: 0,
  levelMax: [],
  rowsCounted: 1000,
  fraction: 1,
  how: 'full',
  error: '',
  channelNames: ['blue', 'red', ''],
  otherChannel: true,
};

/** A source as the row window reads it: the view's ground and cells a radius set by the test. */
function fakeSource(rowsIn: number) {
  return {
    info,
    placement: { sx: 1, sz: -1, ground: 0 },
    stats: { radiusCells: 1, viewRect: [100, -200, 140, -160] as [number, number, number, number] | null },
    window: null as HeatTileSource['window'],
    rowsIn: () => rowsIn,
  };
}

function dataset(labels: string[], ids: number[]): Dataset {
  return { count: ids.length, teamLabels: labels, teamId: Uint16Array.from(ids), teamSizes: null, personTeam: null } as unknown as Dataset;
}

describe('row window', () => {
  it('the ground in view: where the corner rays meet it, null past the horizon', () => {
    // Looking straight down, parallel: clip x = (X - 10) / 5, clip y = (Z - 20) / 5 (column-major).
    const vp = new Float32Array(16);
    vp[0] = 0.2;
    vp[12] = -2;
    vp[9] = 0.2;
    vp[13] = -4;
    vp[15] = 1;
    expect(groundRect(vp, 0)!.map((v) => Math.round(v * 1e4) / 1e4)).toEqual([5, 15, 15, 25]);
    // Every corner behind the eye: nothing.
    vp[15] = -1;
    expect(groundRect(vp, 0)).toBeNull();
  });

  it('a window: the view grown by half each way, on leaf cells, in data and world', () => {
    const r = windowRect(fakeSource(0) as unknown as HeatTileSource, [100, -200, 140, -160])!;
    // Leaf 2: 1024 cells across 1024 units, a cell a unit; z is flipped (sz -1).
    expect(r.data).toEqual([80, 140, 160, 220]);
    expect(r.world).toEqual([80, -220, 160, -140]);
  });

  it('groups in the pyramid channel order, every named one there', () => {
    const ds = dataset(['red', 'green'], [0, 1, 0]);
    alignGroups(ds, ['blue', 'red', ''], true);
    expect(ds.teamLabels).toEqual(['blue', 'red', 'green']);
    expect(Array.from(ds.teamId!)).toEqual([1, 2, 1]);
  });

  it('loads the ground in view once zoomed in, fades back out and lets go zoomed out', async () => {
    const src = fakeSource(5000);
    let held: Dataset | null = null;
    const asked: ColumnMapping[] = [];
    const host: RowWindowHost = {
      ingest: async (_f, m) => {
        asked.push(m);
        return dataset(['red'], [0, 0]);
      },
      dataset: () => held,
      setDataset: (d) => (held = d),
    };
    const mapping = { x: 'px', y: 'py', z: 'pz', time: 't', rowFilter: [] } as unknown as ColumnMapping;
    const w = new RowWindow(src as unknown as HeatTileSource, { files: [], mapping, columns: [], x: 'px', y: 'py', maxRows: 1e6 }, host);
    // Not past the leaf: tiles.
    src.stats.radiusCells = 2.5;
    w.tick(0);
    expect(w.state).toBe('tiles');
    src.stats.radiusCells = 1.5;
    w.tick(0);
    await new Promise((r) => setTimeout(r, 0));
    expect(w.state).toBe('rows');
    expect(held).not.toBeNull();
    expect(src.window!.dataset).toBe(held);
    expect(src.window!.dir).toBe('in');
    // The window's rows: a range on each of the pyramid's columns, no time.
    expect(asked[0].time).toBeNull();
    expect(asked[0].rowFilter).toEqual([
      { column: 'px', kind: 'range', min: 80, max: 160 },
      { column: 'py', kind: 'range', min: 140, max: 220 },
    ]);
    // Faded in (the engine's part), then zoomed out: fades back from the end, then lets go.
    src.window!.t0 = 0;
    src.window!.done = true;
    src.stats.radiusCells = 3.5;
    w.tick(1000);
    expect(w.state).toBe('leaving');
    expect(src.window!.dir).toBe('out');
    expect(src.window!.t0).toBe(1000);
    src.window!.done = true;
    w.tick(1400);
    expect(w.state).toBe('tiles');
    expect(held).toBeNull();
    expect(src.window).toBeNull();
  });

  it('too many rows in view, or rows of a load: tiles stay', () => {
    const src = fakeSource(5e6);
    let held: Dataset | null = null;
    const host: RowWindowHost = { ingest: async () => dataset([], []), dataset: () => held, setDataset: (d) => (held = d) };
    const w = new RowWindow(src as unknown as HeatTileSource, { files: [], mapping: {} as ColumnMapping, columns: [], x: 'px', y: 'py', maxRows: 1e6 }, host);
    w.tick(0);
    expect(w.state).toBe('tiles');
    held = dataset([], []);
    src.rowsIn = () => 10;
    w.tick(0);
    expect(w.state).toBe('tiles');
  });
});
