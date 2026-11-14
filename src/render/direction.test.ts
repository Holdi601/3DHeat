import { describe, expect, it } from 'vitest';
import type { Dataset } from '../state/types';
import {
  bearingOf,
  computeDirections,
  DIR_NONE,
  packBearing,
  spotDirections,
  unpackBearing,
  wedgeNorm,
  wedgeUniforms,
  wedgeTriangle,
  wedgeWeight,
} from './direction';
import { HEAT_VS, HEAT_FS } from './webgl2/shaders';
import { HEAT_WGSL, HEAT_UNIFORM_BYTES } from './webgpu/shaders';

function ds(rows: Array<{ x: number; z: number; t: number; p: number; yaw?: number; other?: number }>, people: string[], others?: string[]): Dataset {
  const n = rows.length;
  const f = (k: (r: (typeof rows)[number]) => number) => Float32Array.from(rows.map(k));
  return {
    id: 'dir', name: 'dir', count: n,
    px: f((r) => r.x), py: new Float32Array(n), pz: f((r) => r.z),
    time: f((r) => r.t), epochMs: null, lifetime: null, maxLifetimeGap: 0, personShared: null,
    yaw: rows.some((r) => r.yaw !== undefined) ? f((r) => r.yaw ?? NaN) : null, pitch: null,
    personId: Uint32Array.from(rows.map((r) => r.p)), teamId: null,
    personLabels: people, teamLabels: [],
    sessionId: null, sessionLabels: [], sessionRows: null, sessionStart: null, sessionEnd: null,
    personTeam: null, personSlot: null, teamSizes: null,
    attrs: others
      ? [{ name: 'other', kind: 'category', data: Uint32Array.from(rows.map((r) => r.other ?? 0)), min: 0, max: others.length - 1, categories: others }]
      : [],
    warnings: [],
    bounds: { minX: 0, minY: 0, minZ: 0, maxX: 1, maxY: 1, maxZ: 1 },
    timeRange: [0, 1], timeSorted: true,
  } as Dataset;
}

describe('directional heat', () => {
  it('packs a bearing into a byte and back within a step', () => {
    for (let b = -Math.PI; b < Math.PI; b += 0.01) {
      const q = packBearing(b);
      expect(q).toBeLessThan(DIR_NONE);
      const d = Math.atan2(Math.sin(unpackBearing(q) - b), Math.cos(unpackBearing(q) - b));
      expect(Math.abs(d)).toBeLessThanOrEqual(Math.PI / 255 + 1e-6);
    }
  });

  it('keeps a wedge’s heat equal to its disc’s at any opening and softness', () => {
    for (const open of [20, 60, 90, 180, 300, 360]) {
      for (const soft of [0, 0.3, 1]) {
        const w = wedgeUniforms(open, soft);
        let sum = 0;
        const N = 3600;
        for (let k = 0; k < N; k++) sum += wedgeWeight(-Math.PI + ((k + 0.5) / N) * 2 * Math.PI, w.half, w.soft) * w.norm;
        expect(sum / N).toBeCloseTo(1, 2);
      }
    }
    expect(wedgeNorm(Math.PI, 0)).toBe(1);
  });

  it('draws a narrow wedge as a triangle that holds every pixel it lights', () => {
    const inside = (t: [number, number][], x: number, y: number) => {
      const s = (a: [number, number], b: [number, number]) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
      const d = [s(t[0], t[1]), s(t[1], t[2]), s(t[2], t[0])];
      return (d[0] >= -1e-9 && d[1] >= -1e-9 && d[2] >= -1e-9) || (d[0] <= 1e-9 && d[1] <= 1e-9 && d[2] <= 1e-9);
    };
    for (const [open, soft, px, edge] of [[30, 0, 4, 0.75], [30, 0, 40, 3], [60, 0.35, 8, 1.5], [90, 0.2, 200, 0.75]] as const) {
      const w = wedgeUniforms(open, soft);
      const tri = wedgeTriangle(w.half, w.soft, px, edge);
      let lit = 0;
      for (let i = -60; i <= 60; i++) {
        for (let j = -60; j <= 60; j++) {
          const x = i / 60;
          const y = j / 60;
          const d = Math.hypot(x, y);
          if (d > 1 || d < 1e-4) continue;
          // The fragment stage's weight, its pixel antialiasing included.
          const off = Math.abs(Math.atan2(y, x));
          const aa = Math.min(edge / Math.max(d * px, 1e-3), Math.min(w.half, Math.PI - w.half));
          const sw = Math.max(w.soft, aa);
          const e = Math.min(1, Math.max(0, (off - (w.half - sw)) / (2 * sw)));
          if (e >= 1) continue;
          lit++;
          expect(inside(tri, x, y), `${open} ${soft} ${px}: ${x},${y}`).toBe(true);
        }
      }
      expect(lit).toBeGreaterThan(0);
    }
  });

  it('points kills from killer to victim and deaths from victim to killer', async () => {
    // a at the origin kills b, 10 m east (+x); the death row is b's.
    const d = ds(
      [
        { x: 0, z: 0, t: 0, p: 0 },
        { x: 10, z: 0, t: 0, p: 1 },
        { x: 0, z: 0, t: 1, p: 0, other: 2 },
        { x: 10, z: 0, t: 1, p: 1, other: 1 },
      ],
      ['a', 'b'],
      ['', 'a', 'b'],
    );
    const r = (await computeDirections(d, 'other'))!;
    expect(r.counts.other).toBe(2);
    expect(unpackBearing(r.angles[2])).toBeCloseTo(bearingOf(1, 0), 1);
    expect(unpackBearing(r.angles[3])).toBeCloseTo(bearingOf(-1, 0) + 2 * Math.PI, 1);
    expect(r.angles[0]).toBe(DIR_NONE);
    // The victim's spot: the kill came in from the west, heading east.
    const near = (cx: number) => (i: number) => Math.abs(d.px[i] - cx) < 1 && Math.abs(d.pz[i]) < 1;
    const s = (await spotDirections(d, r, 0, d.count, near(10), () => true))!;
    expect(s.incoming.n).toBe(1);
    expect(s.incoming.mean).toBeCloseTo(bearingOf(1, 0), 3);
    expect(s.outgoing.n).toBe(1);
  });

  it('takes movement from the previous sample and view from the yaw', async () => {
    const d = ds(
      [
        { x: 0, z: 0, t: 0, p: 0, yaw: 0.5 },
        { x: 0, z: -5, t: 1, p: 0, yaw: 0.5 },
      ],
      ['a'],
    );
    const m = (await computeDirections(d, 'movement'))!;
    expect(m.angles[0]).toBe(DIR_NONE);
    expect(unpackBearing(m.angles[1])).toBeCloseTo(0, 1);
    const v = (await computeDirections(d, 'auto'))!;
    expect(unpackBearing(v.angles[1])).toBeCloseTo(0.5, 1);
  });

  it('takes a source per event kind', async () => {
    const d = ds(
      [
        { x: 0, z: 0, t: 0, p: 0, yaw: 1 },
        { x: 10, z: 0, t: 0, p: 1, yaw: 1 },
        { x: 0, z: 0, t: 1, p: 0, yaw: 1, other: 2 },
      ],
      ['a', 'b'],
      ['', 'a', 'b'],
    );
    d.attrs.push({ name: 'event', kind: 'category', data: Uint32Array.of(0, 0, 1), min: 0, max: 1, categories: ['position', 'kill'] });
    const r = (await computeDirections(d, 'view', { by: { kill: 'other' } }))!;
    expect(unpackBearing(r.angles[0])).toBeCloseTo(1, 1);
    expect(unpackBearing(r.angles[2])).toBeCloseTo(bearingOf(1, 0), 1);
  });

  it('shaders carry the wedge on both backends', () => {
    for (const src of [HEAT_VS, HEAT_FS]) expect(src).toContain('uWedge');
    expect(HEAT_WGSL).toContain('dirCfg');
    expect(HEAT_WGSL).toContain('@binding(16)');
    // The ring's stride is 512: room left.
    expect(HEAT_UNIFORM_BYTES).toBeLessThanOrEqual(512);
    expect(HEAT_UNIFORM_BYTES % 16).toBe(0);
  });
});
