/**
 * Where people look, as lines in the 3D view: a view cone from the eyes of
 * a player whose data says where they look (a shooter's view angles), a
 * turret's aim along its gun, and the recording player's own camera as a
 * small camera with its view frustum. Geometry only; `tactical.ts` decides
 * who gets which and draws them with the other display aids.
 *
 * A recorded camera is a track of its own: an object whose type or kind is
 * `camera`, or whose name ends in "camera" - its rows where the camera was,
 * its heading and pitch where it looked, and its field of view in a `fov`
 * column where the data has one.
 */

import type { AttributeColumn, Dataset } from '../state/types';

export type Vec3 = [number, number, number];

/** A frame to draw in: where, and the way it looks (forward), its up and its right. */
export interface LookFrame {
  o: Vec3;
  fwd: Vec3;
  up: Vec3;
  right: Vec3;
}

/** The vertical field of view a horizontal one gives at an aspect (width over height), degrees. */
export function verticalFov(horizontal: number, aspect: number): number {
  return (2 * Math.atan(Math.tan((horizontal * Math.PI) / 360) / Math.max(1e-6, aspect)) * 180) / Math.PI;
}

const at = (f: LookFrame, a: number, r: number, u: number): Vec3 => [
  f.o[0] + f.fwd[0] * a + f.right[0] * r + f.up[0] * u,
  f.o[1] + f.fwd[1] * a + f.right[1] * r + f.up[1] * u,
  f.o[2] + f.fwd[2] * a + f.right[2] * r + f.up[2] * u,
];

/**
 * A view cone as line segments (pairs of points): from the eye to the four
 * corners of the view at `length`, the far rim, and a fainter rim halfway
 * (the second list). `fovH` the horizontal field of view, degrees; 0 gives
 * just the line of sight.
 */
export function viewCone(f: LookFrame, fovH: number, aspect: number, length: number): { edges: [Vec3, Vec3][]; mid: [Vec3, Vec3][] } {
  if (!(fovH > 0)) return { edges: [[f.o, at(f, length, 0, 0)]], mid: [] };
  const h = Math.tan((Math.min(170, fovH) * Math.PI) / 360);
  const v = Math.tan((Math.min(170, verticalFov(fovH, aspect)) * Math.PI) / 360);
  const corners = (d: number): Vec3[] => [at(f, d, -h * d, v * d), at(f, d, h * d, v * d), at(f, d, h * d, -v * d), at(f, d, -h * d, -v * d)];
  const far = corners(length);
  const half = corners(length / 2);
  const edges: [Vec3, Vec3][] = [];
  for (let i = 0; i < 4; i++) {
    edges.push([f.o, far[i]]);
    edges.push([far[i], far[(i + 1) % 4]]);
  }
  // The line of sight down the middle, to where it ends.
  edges.push([f.o, at(f, length, 0, 0)]);
  const mid: [Vec3, Vec3][] = [];
  for (let i = 0; i < 4; i++) mid.push([half[i], half[(i + 1) % 4]]);
  return { edges, mid };
}

/**
 * A camera, `size` long, as line segments: a box for its body behind the
 * eye, a short lens in front, and its view frustum out to `reach` with a
 * small mark on the frustum's top edge so up reads.
 */
export function cameraGlyph(f: LookFrame, fovH: number, aspect: number, size: number, reach: number): [Vec3, Vec3][] {
  const out: [Vec3, Vec3][] = [];
  const box = (a0: number, a1: number, r: number, u: number) => {
    const c: Vec3[] = [];
    for (const a of [a0, a1]) c.push(at(f, a, -r, u), at(f, a, r, u), at(f, a, r, -u), at(f, a, -r, -u));
    for (let i = 0; i < 4; i++) {
      out.push([c[i], c[(i + 1) % 4]]);
      out.push([c[4 + i], c[4 + ((i + 1) % 4)]]);
      out.push([c[i], c[4 + i]]);
    }
  };
  // The body behind the eye, the lens in front of it.
  box(-size, -size * 0.25, size * 0.32, size * 0.24);
  box(-size * 0.25, 0, size * 0.14, size * 0.14);
  const cone = viewCone(f, fovH > 0 ? fovH : 60, aspect, reach);
  out.push(...cone.edges);
  // Which way is up: a small triangle above the far rim's top edge.
  const h = Math.tan(((fovH > 0 ? Math.min(170, fovH) : 60) * Math.PI) / 360);
  const v = Math.tan((verticalFov(fovH > 0 ? fovH : 60, aspect) * Math.PI) / 360);
  const l = at(f, reach, -h * reach * 0.3, v * reach);
  const r = at(f, reach, h * reach * 0.3, v * reach);
  const top = at(f, reach, 0, v * reach * 1.35);
  out.push([l, top], [top, r]);
  return out;
}

const camCache = new WeakMap<Dataset, { persons: Uint8Array; fov: AttributeColumn | null }>();

/** The persons of a dataset that are a recorded camera, and its field-of-view column; worked out once. */
export function cameraTracks(d: Dataset): { persons: Uint8Array; fov: AttributeColumn | null; any: boolean } {
  let hit = camCache.get(d);
  if (!hit) {
    const labels = d.personLabels ?? [];
    const persons = new Uint8Array(Math.max(1, labels.length));
    labels.forEach((l, p) => {
      if (/(^|[\s_:(·-])camera\)?$/i.test(l.trim())) persons[p] = 1;
    });
    const kind = d.attrs.find((a) => a.kind === 'category' && /^(kind|type|class)$/i.test(a.name.trim()) && a.categories?.some((c) => /^camera$/i.test(c.trim())));
    if (kind && d.personId) {
      const cam = kind.categories!.map((c) => /^camera$/i.test(c.trim()));
      const ids = kind.data as Uint32Array;
      for (let r = 0; r < d.count; r++) if (cam[ids[r]] && d.personId[r] < persons.length) persons[d.personId[r]] = 1;
    }
    const fov = d.attrs.find((a) => a.kind === 'number' && /^(fov|cameraFov|camFov|fieldOfView)$/i.test(a.name.trim())) ?? null;
    hit = { persons, fov };
    camCache.set(d, hit);
  }
  return { ...hit, any: hit.persons.some((v) => v === 1) };
}

/** A recorded field of view at a row, degrees (horizontal), or NaN; radians in the data are taken as such. */
export function fovAt(col: AttributeColumn | null, row: number): number {
  if (!col || row < 0) return NaN;
  const v = (col.data as Float32Array)[row];
  if (!Number.isFinite(v) || v <= 0) return NaN;
  return v < Math.PI ? (v * 180) / Math.PI : v;
}
