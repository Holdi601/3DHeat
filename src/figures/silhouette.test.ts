/**
 * Guards the figures' silhouettes from all round against unintended change:
 * for a fixed set of figures (the reference types and a fifth of the rest,
 * picked by name), each view's projected width and height and covered area
 * are kept in `silhouette.snap.tsv`, and a build that moves one by more than
 * the tolerance fails. After an intended change, rewrite the snapshot with
 * `SIL_UPDATE=1 npx vitest run src/figures/silhouette.test.ts` and look at
 * the random-angle sheets (`FIGSIL=random`) before keeping it.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { iou, silhouette, SIL_VIEWS } from './silhouette';

const SNAP = fileURLToPath(new URL('./silhouette.snap.tsv', import.meta.url));

/** Types every check includes; the rest are sampled by a hash of the name. */
const ALWAYS = ['f-16c', 'f-a-18c', 'f-15c', 'su-27', 'mig-29a', 'a-10c', 'mi-24p-hind', 'ah-64d-apache', 't-72b', 'm1a2-abrams', 'leopard-2a6', 'arleigh-burke', 'bf-109-g6', 'spitfire-mk-ix', 'la-7', 'b-17g'];

function sampled(): string[] {
  const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  return Object.keys(CATALOG).filter((n) => ALWAYS.includes(n) || ((hash(n) % 5) + 5) % 5 === 0).filter((n) => CATALOG[n].domain !== 'marker');
}

/** Per view: width, height, area, as shares of the longest side (and its square), three digits. */
function stats(name: string): number[] {
  const t = CATALOG[name].build();
  const L = Math.max(t.max[0] - t.min[0], t.max[1] - t.min[1], t.max[2] - t.min[2], 0.1);
  const out: number[] = [L];
  for (const v of SIL_VIEWS) {
    const s = silhouette(t, v, 40);
    out.push(s.width / L, s.height / L, s.area / (L * L));
  }
  return out;
}

describe('figure silhouettes', () => {
  it('match the views kept in the snapshot', () => {
    const names = sampled();
    const now = new Map(names.map((n) => [n, stats(n)]));
    if (process.env.SIL_UPDATE || !existsSync(SNAP)) {
      const lines = [...now].map(([n, v]) => `${n}\t${v.map((x) => x.toFixed(3)).join(',')}`);
      writeFileSync(SNAP, lines.join('\n') + '\n');
      return;
    }
    const kept = new Map(
      readFileSync(SNAP, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((l) => {
          const [n, v] = l.split('\t');
          return [n, v.split(',').map(Number)] as const;
        }),
    );
    const off: string[] = [];
    for (const [n, v] of now) {
      const k = kept.get(n);
      if (!k) continue;
      // True size within 1 %, each view's extents within 3 % of the longest side, its area within 6 % of its own.
      if (Math.abs(v[0] - k[0]) > k[0] * 0.01) off.push(`${n}: size ${k[0]} -> ${v[0].toFixed(3)}`);
      for (let i = 0; i < SIL_VIEWS.length; i++) {
        const [w, h, a] = [v[1 + i * 3], v[2 + i * 3], v[3 + i * 3]];
        const [kw, kh, ka] = [k[1 + i * 3], k[2 + i * 3], k[3 + i * 3]];
        if (Math.abs(w - kw) > 0.03 || Math.abs(h - kh) > 0.03 || Math.abs(a - ka) > Math.max(0.004, ka * 0.06)) {
          off.push(`${n} ${SIL_VIEWS[i].name}: ${kw},${kh},${ka} -> ${w.toFixed(3)},${h.toFixed(3)},${a.toFixed(3)}`);
        }
      }
    }
    expect(off, off.slice(0, 20).join('\n')).toEqual([]);
  });

  it('draws the same shape from a view at any size it is asked for', () => {
    const t = CATALOG['f-16c'].build();
    for (const v of SIL_VIEWS) {
      const a = silhouette(t, v, 64);
      const b = silhouette(t, v, 64, a.cell);
      expect(iou(a.mask, b.mask)).toBe(1);
      expect(a.area).toBeGreaterThan(0);
    }
  });
});
