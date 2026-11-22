import { describe, expect, it } from 'vitest';
import { selectTiles, tileWorldRect } from './lod';

/** Column-major view-projection of a camera at `eye` looking at `at` (y up), 60 degree fov, square. */
function lookAt(eye: number[], at: number[]): Float32Array {
  const sub = (a: number[], b: number[]) => a.map((v, i) => v - b[i]);
  const norm = (a: number[]) => {
    const l = Math.hypot(...a);
    return a.map((v) => v / l);
  };
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const f = norm(sub(at, eye));
  const s = norm(cross(f, [0, 1, 0]));
  const u = cross(s, f);
  const view = [s[0], u[0], -f[0], 0, s[1], u[1], -f[1], 0, s[2], u[2], -f[2], 0, -dot(s, eye), -dot(u, eye), dot(f, eye), 1];
  const t = 1 / Math.tan(Math.PI / 6);
  const n = 0.1;
  const fa = 1e6;
  const proj = [t, 0, 0, 0, 0, t, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, (2 * fa * n) / (n - fa), 0];
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) out[c * 4 + r] += proj[k * 4 + r] * view[c * 4 + k];
  return out;
}

const pyr = { x0: -1000, y0: -1000, size: 2000, leafLevel: 5 };
const place = { sx: 1, sz: 1, ground: 0 };

describe('heat tile LOD rings', () => {
  it('a far view takes coarse tiles only', () => {
    const eye = [0, 20000, 1];
    const t = selectTiles(pyr, place, {
      viewProj: lookAt(eye, [0, 0, 0]),
      cameraPos: new Float32Array(eye),
      perspective: true,
      pxPerUnit: 540,
      cellPx: 1.5,
      maxTiles: 160,
    });
    expect(t.length).toBeGreaterThan(0);
    expect(Math.max(...t.map((x) => x.level))).toBeLessThanOrEqual(2);
  });

  it('a low oblique view is finer near the eye than far off, within the cap', () => {
    const eye = [0, 30, -900];
    const t = selectTiles(pyr, place, {
      viewProj: lookAt(eye, [0, 0, 0]),
      cameraPos: new Float32Array(eye),
      perspective: true,
      pxPerUnit: 540,
      cellPx: 1.5,
      maxTiles: 160,
    });
    expect(t.length).toBeLessThanOrEqual(160);
    const dist = (x: (typeof t)[number]) => {
      const r = tileWorldRect(pyr, place, x);
      return Math.hypot((r[0] + r[2]) / 2 - eye[0], (r[1] + r[3]) / 2 - eye[2]);
    };
    const finest = t.reduce((a, b) => (b.level > a.level ? b : a));
    const coarsest = t.reduce((a, b) => (b.level < a.level ? b : a));
    expect(finest.level).toBeGreaterThan(coarsest.level);
    expect(dist(finest)).toBeLessThan(dist(coarsest));
    // Nothing wholly behind the camera.
    for (const x of t) expect(tileWorldRect(pyr, place, x)[3]).toBeGreaterThan(eye[2]);
  });

  it('tiles cover without overlap', () => {
    const eye = [200, 400, -600];
    const t = selectTiles(pyr, place, {
      viewProj: lookAt(eye, [0, 0, 0]),
      cameraPos: new Float32Array(eye),
      perspective: true,
      pxPerUnit: 540,
      cellPx: 1.5,
      maxTiles: 160,
    });
    for (let i = 0; i < t.length; i++)
      for (let j = i + 1; j < t.length; j++) {
        const [a, b] = t[i].level <= t[j].level ? [t[i], t[j]] : [t[j], t[i]];
        const d = b.level - a.level;
        expect(b.x >> d === a.x && b.y >> d === a.y).toBe(false);
      }
  });
});
