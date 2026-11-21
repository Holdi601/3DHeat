import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { ALIASES, CATALOG, FIGURES } from './catalog';
import { installFigurePack, installFigurePackIndex, loadPackFigures, packFigureLoaded, removeFigurePack, type FigurePack } from './figurepack';
import { decodePackFigure, encodePackFigure, lodWords } from './figurepackBin';
import { figureForName } from './match';
import type { MeshFigureData } from './meshfig';

const REPO = fileURLToPath(new URL('../..', import.meta.url));

/** A one-box hull, packed as the packer does (u16 part count, vertex and triangle counts, positions over box, indices). */
function boxFigure(): MeshFigureData {
  const p = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1].map((v) => v * 65535);
  const t = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5];
  const u = new Uint16Array([1, 8, 12, ...p, ...t]);
  const b64 = Buffer.from(u.buffer).toString('base64');
  return { anchor: 'ground', box: [-2, 0, -1, 2, 2, 1], parts: [{ name: 'hull', pivot: [0, 0, 0] }], lods: [b64, b64, b64] };
}

describe('the local figure pack', () => {
  it('replaces the figures it names while installed and puts them back', () => {
    const name = 'tiger-i-e';
    const before = CATALOG[name].build();
    const pack: FigurePack = { version: 1, figures: { [name]: boxFigure(), 'no-such-figure': boxFigure() } };
    expect(installFigurePack(CATALOG, pack, FIGURES)).toBe(1);
    try {
      const t = CATALOG[name].build();
      expect(t.max[0] - t.min[0]).toBeCloseTo(4, 2);
      expect(t.triangles).toBe(12);
      expect(FIGURES[name]().triangles).toBe(12);
    } finally {
      removeFigurePack(CATALOG, FIGURES);
    }
    expect(CATALOG[name].build().triangles).toBe(before.triangles);
  });

  it('draws a unit of another shape as its own variant while installed', () => {
    const name = 'tiger-i-e';
    const variant = `${name}@test-unit`;
    const pack: FigurePack = { version: 1, figures: { [variant]: boxFigure() }, units: { 'Test_Unit_X': variant, 'test_unit_y': 'no-such@figure' } };
    expect(installFigurePack(CATALOG, pack, FIGURES, ALIASES)).toBe(1);
    try {
      expect(CATALOG[variant].domain).toBe(CATALOG[name].domain);
      expect(CATALOG[variant].build().triangles).toBe(12);
      expect(figureForName('test_unit_x')).toBe(variant);
      expect(ALIASES['test_unit_y']).toBeUndefined();
    } finally {
      removeFigurePack(CATALOG, FIGURES);
    }
    expect(CATALOG[variant]).toBeUndefined();
    expect(FIGURES[variant]).toBeUndefined();
    expect(ALIASES['test_unit_x']).toBeUndefined();
  });

  it('sends a figure binary and gets the same figure back', () => {
    const m = boxFigure();
    const back = decodePackFigure(encodePackFigure(m)) as MeshFigureData;
    expect(back.box).toEqual(m.box);
    expect(back.parts).toEqual(m.parts);
    for (let i = 0; i < m.lods.length; i++) expect(Array.from(lodWords(back.lods[i]))).toEqual(Array.from(lodWords(m.lods[i])));
    // Two parts, positions jumping across the whole range and indices going back and forth: still bit for bit.
    const words = [2, 3, 1, 2, 2, 0, 65535, 1, 65535, 0, 40000, 7, 7, 7, 2, 0, 1, 12, 65535, 0, 0, 65535, 9, 0, 1, 1, 0, 1, 1];
    const odd = { ...m, lods: [new Uint16Array(words)] };
    expect(Array.from(lodWords(decodePackFigure(encodePackFigure(odd))!.lods[0]))).toEqual(words);
    expect(decodePackFigure(new Uint8Array(16))).toBeNull();
  });

  it('takes a figure from an index only once its data is fetched', async () => {
    const name = 'tiger-i-e';
    const variant = `${name}@test-lazy`;
    const before = CATALOG[name].build().triangles;
    const asked: string[] = [];
    vi.stubGlobal('fetch', async (url: string) => {
      asked.push(url);
      return new Response(encodePackFigure(boxFigure()).slice().buffer, { status: 200 });
    });
    try {
      expect(installFigurePackIndex(CATALOG, { version: 1, figures: { [name]: 'a1', [variant]: 'b2' }, units: { test_lazy_unit: variant } }, FIGURES, ALIASES)).toBe(2);
      expect(figureForName('test_lazy_unit')).toBe(variant);
      expect(asked).toEqual([]);
      // Not here yet: the catalogue's own figure (the variant its kin's), and the data is asked for.
      expect(CATALOG[variant].build().triangles).toBe(before);
      await loadPackFigures([name, variant, 'not-in-the-index']);
      expect(packFigureLoaded(name) && packFigureLoaded(variant)).toBe(true);
      expect(asked.length).toBe(2);
      expect(asked.every((u) => /\/f\/.+\?v=(a1|b2)$/.test(u))).toBe(true);
      expect(CATALOG[name].build().triangles).toBe(12);
      expect(CATALOG[variant].build().triangles).toBe(12);
      await loadPackFigures([name]);
      expect(asked.length).toBe(2);
    } finally {
      removeFigurePack(CATALOG, FIGURES);
      vi.unstubAllGlobals();
    }
    expect(CATALOG[name].build().triangles).toBe(before);
    expect(CATALOG[variant]).toBeUndefined();
    expect(packFigureLoaded(name)).toBe(false);
  });

  it('ignores what is not a pack', () => {
    expect(installFigurePack(CATALOG, { version: 2, figures: {} } as unknown as FigurePack)).toBe(0);
    expect(installFigurePack(CATALOG, { version: 1, figures: { 'tiger-i-e': { anchor: 'ground' } } } as unknown as FigurePack)).toBe(0);
  });

  it('never enters the repository', () => {
    // The ignore rules guard the pack's usual names, and no tracked file is one (or holds a carved figure).
    const ignore = readFileSync(new URL('../../.gitignore', import.meta.url), 'utf8');
    for (const rule of ['local-pack/', 'figure-pack*.json', '*.figpack.json']) expect(ignore).toContain(rule);
    let files: string[];
    try {
      files = execFileSync('git', ['ls-files', '-z'], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 28 }).split('\0').filter(Boolean);
    } catch {
      return; // not a git checkout: nothing tracked to look at
    }
    expect(files.filter((f) => /(^|\/)local-pack\/|figure-pack[^/]*\.json$|\.figpack\.json$/i.test(f))).toEqual([]);
    // A carved figure's mark in any tracked source or data file: one `git grep` (reading every file here took
    // seconds under a full test run). Exit 1 is "none found".
    const run = () => spawnSync('git', ['grep', '-l', '-E', '"carved"[[:space:]]*:[[:space:]]*true', '--', '*.json', '*.ts', '*.js', ':!exporters/'], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 26 });
    let grep = run();
    // A process the machine could not start just then (no status) is tried once more.
    if (grep.status === null) grep = run();
    expect(grep.status === 0 || grep.status === 1, `git grep: status ${grep.status}, ${grep.error ?? ''} ${grep.stderr}`).toBe(true);
    expect(grep.stdout.split('\n').filter(Boolean)).toEqual([]);
    // Two git processes: room for them while the whole suite runs.
  }, 30_000);
});
