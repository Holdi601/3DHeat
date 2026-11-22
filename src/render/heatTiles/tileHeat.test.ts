import { describe, expect, it } from 'vitest';
import { emptyColumnMapping } from '../../state/types';
import type { SourcePreview } from '../../data/sourcePreview';
import { followSessionTiles, startTileHeat, stopTileHeat, tilePlacement, tilesPossible, useTileHeat, useTileHeatShare, type TileEngine } from './tileHeat';
import type { HeatTileSource, PyramidInfo, TileTransport } from './source';

const info: PyramidInfo = { key: 'k1', x0: 0, y0: 0, size: 100, leafLevel: 3, complete: true, estimateLevels: 0, levelMax: [], rowsCounted: 5, fraction: 1, how: 'full', error: '' };
const transport: TileTransport = { query: async () => info, read: async () => ({ tiles: [], empty: [], pending: [], deferred: [] }) };

function fakeEngine() {
  const e = { src: null as HeatTileSource | null, framed: 0 };
  const engine: TileEngine = {
    setHeatTiles: (s) => (e.src = s),
    heatTiles: () => e.src,
    invalidate: () => {},
    frameAround: () => e.framed++,
  };
  return { e, engine };
}

const preview = (rows: string[][]): SourcePreview => ({ format: 'parquet', fileName: 'a.parquet', columns: ['px', 'py', 'pz'], rows, numeric: [true, true, true], rowCount: 1, rowCountExact: true, fileBytes: 1, delimiter: ',', logicalTypes: {}, hints: null });

describe('heat from tiles', () => {
  it('puts the plane where the rows would go, per up axis and flips', () => {
    const m = { ...emptyColumnMapping(), x: 'px', y: 'py', z: 'pz' };
    m.axes = { up: 'z', flipX: false, flipY: true, flipZ: false, scale: 2 };
    const p = tilePlacement(m, preview([['1', '2', '5'], ['0', '0', '3']]));
    expect(p).toEqual({ x: 'px', y: 'py', place: { sx: 2, sz: -2, ground: 6 } });
    m.axes = { up: 'y', flipX: true, flipY: false, flipZ: false, scale: 1 };
    expect(tilePlacement(m, null)).toEqual({ x: 'px', y: 'pz', place: { sx: -1, sz: 1, ground: 0 } });
    expect(tilesPossible(false, preview([]), m)).toBe(false);
    expect(tilesPossible(true, { ...preview([]), format: 'csv' }, m)).toBe(false);
    expect(tilesPossible(true, preview([]), { ...m, z: null })).toBe(false);
    expect(tilesPossible(true, preview([]), m)).toBe(true);
  });

  it('starts, shares its key, and stops', async () => {
    const { e, engine } = fakeEngine();
    startTileHeat(engine, transport, { sx: 1, sz: 1, ground: 0 }, 'files', true);
    expect(useTileHeat.getState().on).toBe(true);
    await new Promise((r) => setTimeout(r, 300));
    expect(e.framed).toBe(1);
    expect(useTileHeatShare.getState().doc.key).toBe('k1');
    expect(useTileHeat.getState().key).toBe('k1');
    // The host's own window is not turned into a member by its own document.
    await followSessionTiles(engine, { key: 'other' }, { origin: 'http://h', token: 't' });
    expect(useTileHeat.getState().from).toBe('files');
    stopTileHeat();
    expect(e.src).toBe(null);
    expect(useTileHeat.getState().on).toBe(false);
    expect(useTileHeatShare.getState().doc).toEqual({});
  });

  it("follows the session host's key, and stops with it", async () => {
    const { e, engine } = fakeEngine();
    await followSessionTiles(engine, { key: 'k2', sx: 1, sz: 1, ground: 0 }, { origin: 'http://h', token: 't' });
    expect(useTileHeat.getState().from).toBe('session');
    const first = e.src;
    await followSessionTiles(engine, { key: 'k2' }, { origin: 'http://h', token: 't' });
    expect(e.src).toBe(first);
    await followSessionTiles(engine, {}, { origin: 'http://h', token: 't' });
    expect(useTileHeat.getState().on).toBe(false);
    expect(e.src).toBe(null);
  });
});
