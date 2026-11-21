import { describe, expect, it } from 'vitest';
import { byGame, classify, fingerprint, glbExtras, levelFor, linkLayouts, type CatalogItem } from './catalogIndex';

const item = (path: string): CatalogItem => ({ path, ...classify(path)!, bytes: 1, mtime: 1, sha256: null, extractor: null, gameBuild: null });

describe('catalogue folder index', () => {
  it('tells the extracts apart by where they sit', () => {
    expect(classify('battlefield-4/MP_Prison.glb')).toEqual({ game: 'battlefield-4', kind: 'level', name: 'MP_Prison' });
    expect(classify('battlefield-4/MP_Prison.layouts.json')).toEqual({ game: 'battlefield-4', kind: 'layouts', name: 'MP_Prison' });
    expect(classify('forza/courses/cedar_run.glb')?.kind).toBe('course');
    expect(classify('warthunder/ranges.json')?.kind).toBe('ranges');
    expect(classify('figure-packs/local-pack/figures-r39i.json')).toEqual({ game: '', kind: 'figure-pack', name: 'local-pack' });
    expect(classify('model-packs/warthunder/model-pack.json')).toEqual({ game: 'warthunder', kind: 'model-pack', name: 'warthunder' });
    expect(classify('model-packs/warthunder/us_m1a2_sep.glb')).toBeNull();
    expect(classify('model-packs/warthunder/hit-parts.json')).toBeNull();
    expect(classify('warthunder/catalog.json')).toEqual({ game: 'warthunder', kind: 'catalog', name: 'warthunder' });
    expect(classify('figure-packs/local-pack/decisions.tsv')).toBeNull();
    expect(classify('r6/export.log')).toBeNull();
    expect(classify('.3dheat-index.json')).toBeNull();
  });

  it('joins a level to its layouts and finds the level for a map', () => {
    const items = linkLayouts(['battlefield-4/MP_Naval.glb', 'battlefield-1/MP_Naval.glb', 'cs2/de_dust2.glb', 'cs2/de_dust2.layouts.json'].map(item));
    expect(items.find((i) => i.name === 'de_dust2' && i.kind === 'level')?.layouts).toBe('cs2/de_dust2.layouts.json');
    expect(levelFor(items, 'DE_DUST2')?.path).toBe('cs2/de_dust2.glb');
    // Two games' levels of one name: none picked by itself, unless the game says.
    expect(levelFor(items, 'MP_Naval')).toBeNull();
    expect(levelFor(items, 'MP_Naval', 'battlefield-1')?.path).toBe('battlefield-1/MP_Naval.glb');
    expect(byGame(items).map((g) => g.game)).toEqual(['battlefield-1', 'battlefield-4', 'cs2']);
  });

  it('fingerprints by content, extractor and build', () => {
    expect(fingerprint({ sha256: null, extractor: 'x', gameBuild: null })).toBeNull();
    expect(fingerprint({ sha256: 'ab', extractor: 'heat3d-cs2 1.0.4', gameBuild: '14100' })).toBe('sha256:ab|heat3d-cs2 1.0.4|14100');
    const json = new TextEncoder().encode(JSON.stringify({ asset: { version: '2.0', extras: { source: 'heat3d-battlefield-maps', version: '0.2.1' } } }));
    const head = new Uint8Array(20 + json.length);
    const dv = new DataView(head.buffer);
    dv.setUint32(0, 0x46546c67, true);
    dv.setUint32(12, json.length, true);
    dv.setUint32(16, 0x4e4f534a, true);
    head.set(json, 20);
    expect(glbExtras(head)).toEqual({ extractor: 'heat3d-battlefield-maps 0.2.1', gameBuild: null });
  });
});
