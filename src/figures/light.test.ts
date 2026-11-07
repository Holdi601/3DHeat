import { describe, expect, it } from 'vitest';
import { VertexBuffer } from '../race/geometry';
import { CATALOG } from './catalog';
import { place, poseFrame } from './kit';
import { shade } from './light';

describe('figure light', () => {
  it('lights the side towards the sun brighter than the side away, and the top brighter than the belly', () => {
    const lit = shade([0.8, 0.8, 0.8], [0, 1, 0], 0)[0];
    const belly = shade([0.8, 0.8, 0.8], [0, -1, 0], 0)[0];
    expect(lit).toBeGreaterThan(belly * 2);
    const toward = shade([0.5, 0.5, 0.5], [0.6, 0.6, 0.53], 0)[0];
    const away = shade([0.5, 0.5, 0.5], [-0.6, 0.6, -0.53], 0)[0];
    expect(toward).toBeGreaterThan(away);
    // Glass gives back the sky; an unlit normal keeps its colour.
    expect(shade([0.2, 0.2, 0.2], [0, 1, 0], 1)[2]).toBeGreaterThan(shade([0.2, 0.2, 0.2], [0, 1, 0], 0)[2]);
    expect(shade([0.3, 0.4, 0.5], [0, 0, 0], 0)).toEqual([0.3, 0.4, 0.5]);
  });

  it('places a figure with the same colours shade() gives its turned normals', () => {
    const t = CATALOG['f-16c'].build();
    const pose = { x: 5, y: 100, z: -3, yaw: 0.7, pitch: 0.2, roll: -0.5 };
    const team: [number, number, number] = [0.3, 0.5, 0.9];
    const out = new VertexBuffer();
    place(out, t, pose, team);
    const { f, u, r } = poseFrame(pose);
    const nf = t.fixed.length / 7;
    // Every 50th vertex of the team part (placed after the fixed part).
    for (let v = 0; v < t.team.length / 7; v += 50) {
      const n = t.teamN!;
      const w: [number, number, number] = [0, 1, 2].map((c) => f[c] * n[v * 4] + u[c] * n[v * 4 + 1] + r[c] * n[v * 4 + 2]) as [number, number, number];
      const want = shade([team[0] * t.team[v * 7 + 3], team[1] * t.team[v * 7 + 4], team[2] * t.team[v * 7 + 5]], w, n[v * 4 + 3]);
      for (let c = 0; c < 3; c++) expect(out.data[(nf + v) * 7 + 3 + c]).toBeCloseTo(want[c], 5);
    }
  });

  it('gives every vertex of every vehicle a unit normal or none', () => {
    for (const name of ['f-16c', 'm1a2-abrams', 'arleigh-burke', 'ah-64d-apache', 'aim-120c']) {
      const t = CATALOG[name].build();
      for (const n of [t.teamN!, t.fixedN!]) {
        for (let i = 0; i < n.length; i += 4) {
          const l = Math.hypot(n[i], n[i + 1], n[i + 2]);
          expect(l === 0 || Math.abs(l - 1) < 1e-3, name).toBe(true);
        }
      }
    }
  });

  it('builds a coarse figure with fewer triangles and the same bounds', () => {
    const t = CATALOG['su-27'].build();
    const c = t.coarse!();
    expect(c.triangles).toBeLessThan(t.triangles * 0.6);
    expect(c.min).toEqual(t.min);
    expect(c.max).toEqual(t.max);
  });
});
