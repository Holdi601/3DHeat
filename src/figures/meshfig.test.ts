import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { buildMeshFigure, decodeLod, type MeshFigureData } from './meshfig';
import { MESH_FIGURES } from './meshes';
import { meshOf } from './instances';
import { turretOf } from './turret';

type Box = [number, number, number, number, number, number];

/** A box's 8 corners and 12 triangles, wound outward. */
function box([x0, y0, z0, x1, y1, z1]: Box): { p: number[]; t: number[] } {
  const p = [x0, y0, z0, x1, y0, z0, x1, y1, z0, x0, y1, z0, x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1];
  const t = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5];
  return { p, t };
}

/** Packs parts (each a list of boxes) the way the packer does: u16 header, positions over `lo`..`hi`, indices. */
function pack(parts: Box[][], lo: number[], hi: number[]): string {
  const head: number[] = [parts.length];
  const body: number[] = [];
  for (const boxes of parts) {
    const p: number[] = [];
    const t: number[] = [];
    for (const b of boxes) {
      const m = box(b);
      const o = p.length / 3;
      p.push(...m.p);
      t.push(...m.t.map((i) => i + o));
    }
    head.push(p.length / 3, t.length / 3);
    body.push(...p.map((v, i) => Math.round(((v - lo[i % 3]) / (hi[i % 3] - lo[i % 3])) * 65535)), ...t);
  }
  return Buffer.from(new Uint16Array([...head, ...body]).buffer).toString('base64');
}

const LO = [-3.5, 0, -1.6];
const HI = [4.5, 2.6, 1.6];
const HULL: Box = [-3, 0, -1.5, 3, 1.5, 1.5];
const DECK: Box = [-3, 1.5, -1.2, -1, 1.7, 1.2];
const TURRET: Box = [-1, 1.5, -1, 1, 2.4, 1];
const GUN: Box = [0.8, 1.9, -0.1, 4, 2.1, 0.1];
const TANK: MeshFigureData = {
  anchor: 'ground',
  box: [...LO, ...HI],
  parts: [
    { name: 'hull', pivot: [0, 0, 0] },
    { name: 'turret', pivot: [0, 1.5, 0], joint: 'yaw' },
    { name: 'gun', pivot: [0.6, 2.0, 0], joint: 'pitch', parent: 0, tone: 0.8 },
  ],
  gear: { top: 0.6, inner: 1.0 },
  lods: [pack([[HULL, DECK], [TURRET], [GUN]], LO, HI), pack([[HULL], [TURRET], [GUN]], LO, HI), pack([[HULL], [TURRET], [GUN]], LO, HI)],
};

describe('mesh figures', () => {
  it('decode inside their box, full, coarse and far', () => {
    const counts = [0, 1, 2].map((l) => decodeLod(TANK, l).reduce((s, p) => s + p.idx.length / 3, 0));
    expect(counts).toEqual([48, 36, 36]);
    const [hull] = decodeLod(TANK, 0);
    for (let i = 0; i < hull.p.length; i++) expect(Math.abs(hull.p[i] - [...box(HULL).p, ...box(DECK).p][i])).toBeLessThan(1e-3);
  });

  it('build a template with joints, team and track parts, and its own coarse and far builds', () => {
    const t = buildMeshFigure(TANK);
    expect(t.triangles).toBe(48);
    expect(t.min[0]).toBeCloseTo(-3, 2);
    expect(t.max[0]).toBeCloseTo(4, 2);
    expect(t.joints!.map((j) => j.kind)).toEqual(['yaw', 'pitch']);
    expect(t.joints![1].parent).toBe(0);
    expect(t.joints![1].pivot).toEqual([0.6, 2.0, 0]);
    // The hull's lower side triangles are the running gear (fixed, track colour); the rest is the team's.
    expect(t.fixed.length / 7).toBeGreaterThan(0);
    expect(t.fixed[3]).toBeLessThan(0.2);
    expect(t.team.length).toBeGreaterThan(t.fixed.length);
    // Normals point out of the solid: the hull's top faces up.
    let tops = 0;
    for (let v = 0; v < t.team.length / 7; v += 3) {
      if (t.teamJ![v] !== 0 || ![0, 1, 2].every((k) => t.team[(v + k) * 7 + 1] > 1.69)) continue;
      tops++;
      expect(t.teamN![v * 4 + 1]).toBeGreaterThan(0.9);
    }
    expect(tops).toBe(2);
    const c = t.coarse!();
    const f = t.far!();
    expect(c.triangles).toBeLessThan(t.triangles);
    expect(f.triangles).toBeLessThanOrEqual(c.triangles);
    expect(c.min).toEqual(t.min);
    expect(f.max).toEqual(t.max);
    expect(c.joints!.length).toBe(2);
    expect(meshOf(t).count).toBe(48 * 3);
    const tb = turretOf(t)!;
    expect(tb.px).toBe(0);
    expect(tb.max[0]).toBeCloseTo(1, 2);
  });

  it('draw a propeller disc where one is given', () => {
    const plane: MeshFigureData = {
      anchor: 'centre',
      box: [...LO, ...HI],
      parts: [{ name: 'airframe', pivot: [0, 0, 0] }],
      prop: { at: [3, 1, 0], diameter: 3 },
      lods: [pack([[HULL]], LO, HI)],
    };
    const t = buildMeshFigure(plane);
    expect(t.fixed.length).toBeGreaterThan(0);
    expect(t.max[1]).toBeCloseTo(2.5, 1);
  });

  it('replace catalogue figures that exist, each packed small', () => {
    for (const n of Object.keys(MESH_FIGURES)) expect(CATALOG[n], n).toBeDefined();
    const dir = new URL('./meshes/', import.meta.url);
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts') && x !== 'index.ts')) {
      expect(gzipSync(readFileSync(new URL(f, dir))).length, f).toBeLessThan(60_000);
    }
  });
});
