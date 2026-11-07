import { describe, expect, it } from 'vitest';
import { VertexBuffer } from '../race/geometry';
import { CATALOG } from './catalog';
import { extent, place, poseFrame, TemplateCache } from './kit';
import { buildGround } from './ground';

/**
 * Ground classes whose real members are longer or taller than a vehicle's
 * 20 m by 7 m: a hangar is about 40 m long and 12 m high; a VL80 electric locomotive is two sections, 32.8 m; a V-1
 * ramp 48 m; an S-300 TEL's canisters stand upright about 10 m high, an S-200
 * launcher's raised missile about 8 m; a 76N6 Clam Shell sits on its 40V6
 * tower about 25 m up, a Patriot mast group's masts reach about 20 m.
 */
const LONGEST: Record<string, number> = { rail: 35, ramp: 50, radar: 35, building: 60 };
const TALLEST: Record<string, number> = { sam: 11, radar: 30, building: 15 };

describe('figure catalogue', () => {
  const built = Object.entries(CATALOG).map(([name, e]) => ({ name, e, t: e.build() }));

  it('builds every figure with finite vertices and a sane triangle count', () => {
    for (const { name, t } of built) {
      expect(t.triangles, name).toBeGreaterThan(10);
      expect(t.triangles, name).toBeLessThan(12000);
      for (const d of [t.team, t.fixed]) {
        expect(d.length % 21, name).toBe(0);
        // One check per buffer: an expect per coordinate makes this test take seconds.
        expect(d.every(Number.isFinite), name).toBe(true);
      }
    }
  });

  it('keeps people about a person tall and vehicles about their stated size', () => {
    for (const { name, e, t } of built) {
      const x = extent(t);
      if (e.domain === 'person' && name === 'soldier') expect(x.height).toBeGreaterThan(1.6), expect(x.height).toBeLessThan(2.0);
      if (e.domain === 'ground') {
        // Emplacements, riders and an optical tracker are real things under 3 m.
        expect(x.length, name).toBeGreaterThan(0.8);
        expect(x.length, name).toBeLessThan(LONGEST[e.cls] ?? 20);
        expect(x.height, name).toBeLessThan(TALLEST[e.cls] ?? 7);
      }
    }
  });

  it('stands ground figures on the ground and centres aircraft', () => {
    for (const { name, e, t } of built) {
      if (e.domain === 'ground' || e.domain === 'person') expect(t.min[1], name).toBeGreaterThan(-0.05);
      if (e.domain === 'air') {
        expect(t.anchor, name).toBe('centre');
        // The box's middle stays near the body axis; a big aircraft's tall fin
        // (a B-52H's stands about 6 m over its fuselage) lifts it in proportion.
        expect(Math.abs(t.min[1] + t.max[1]) / 2, name).toBeLessThan(Math.max(2.5, (t.max[1] - t.min[1]) * 0.35));
      }
    }
  });

  it('builds the named air-defence vehicles differently from each other', () => {
    const names = ['zsu-23-4-shilka', '2k22-tunguska', 'flakpanzer-gepard', 'roland-marder'];
    const sigs = names.map((n) => {
      const t = CATALOG[n].build();
      const x = extent(t);
      return `${t.triangles}|${x.length.toFixed(1)}|${x.height.toFixed(1)}`;
    });
    expect(new Set(sigs).size).toBe(names.length);
  });
});

describe('placing a figure', () => {
  it('turns the template forward onto the heading and moves it', () => {
    const t = buildGround({ chassis: 'static', length: 4, width: 2, hullHeight: 1 });
    const out = new VertexBuffer();
    place(out, t, { x: 10, y: 0, z: 5, yaw: Math.PI / 2 }, [1, 0, 0]);
    let maxX = -Infinity;
    let minX = Infinity;
    for (let i = 0; i < out.count; i++) {
      maxX = Math.max(maxX, out.data[i * 7]);
      minX = Math.min(minX, out.data[i * 7]);
    }
    // Heading pi/2 looks along +x: the 4 m length lies along x, round x = 10.
    expect(maxX).toBeCloseTo(12, 5);
    expect(minX).toBeCloseTo(8, 5);
  });

  it('colours the team part and leaves the fixed part', () => {
    const t = CATALOG['m1a2-abrams'].build();
    const out = new VertexBuffer();
    place(out, t, { x: 0, y: 0, z: 0, yaw: 0 }, [0, 1, 0]);
    let teamish = 0;
    for (let i = 0; i < out.count; i++) if (out.data[i * 7 + 4] > 0.3 && out.data[i * 7 + 3] === 0) teamish++;
    expect(teamish).toBeGreaterThan(t.team.length / 7 / 2);
  });

  it('keeps the pose frame orthonormal under pitch and roll', () => {
    const fr = poseFrame({ x: 0, y: 0, z: 0, yaw: 0.7, pitch: 0.4, roll: -0.9 });
    const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    for (const v of [fr.f, fr.r, fr.u]) expect(dot(v, v)).toBeCloseTo(1, 9);
    expect(dot(fr.f, fr.r)).toBeCloseTo(0, 9);
    expect(dot(fr.f, fr.u)).toBeCloseTo(0, 9);
    expect(dot(fr.r, fr.u)).toBeCloseTo(0, 9);
  });

  it('builds a template once', () => {
    const cache = new TemplateCache();
    let n = 0;
    const make = () => (n++, CATALOG.soldier.build());
    cache.get('soldier', make);
    cache.get('soldier', make);
    expect(n).toBe(1);
  });
});
