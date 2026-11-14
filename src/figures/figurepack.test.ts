import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CATALOG, FIGURES } from './catalog';
import { installFigurePack, removeFigurePack, type FigurePack } from './figurepack';
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
    const mark = ['"carved"', 'true'].join(':');
    const carved = files.filter((f) => /\.(json|ts|js)$/.test(f) && !f.startsWith('exporters/')).filter((f) => {
      try {
        return readFileSync(`${REPO}/${f}`, 'utf8').replace(/\s/g, '').includes(mark);
      } catch {
        return false;
      }
    });
    expect(carved).toEqual([]);
  });
});
