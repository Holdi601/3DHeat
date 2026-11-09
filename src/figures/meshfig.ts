/**
 * Mesh figures: a figure taken from a free 3D model (CC0, public domain or
 * CC BY; never one taken from a game) where it is truer than the one built
 * from a spec - remeshed, simplified to a few thousand triangles, scaled to
 * the published size and stored compactly in `meshes/` (`MeshFigureData`).
 *
 * A mesh figure is a template like any built one, so it is placed, lit,
 * outlined, turned and charred the same way: the hull, turret and gun are
 * parts of their own, the turret turning about its ring's centre and the gun
 * raising about its trunnion; the running gear is the fixed track colour and
 * the rest the team's; a propeller gets the faint disc the built aircraft
 * have; the coarse and far builds are decimated copies stored beside it.
 * Decoding and the normals take a few milliseconds a figure, done in the
 * model worker (`modelWorker.ts`) like any other build.
 */

import type { Frame3, Rgb, Vec3 } from '../race/geometry';
import { atDetail, COARSE, FAR, finish, into, joint, newKit, PAINT, type Anchor, type Template } from './kit';
import { Mesh } from './mesh';
import { ring } from './parts';

/** One part of a mesh figure: the hull (no joint), a turret (`yaw`) or a gun (`pitch` on the turret `parent`). */
export interface MeshPart {
  name: string;
  /** A turret's ring centre, a gun's trunnion; template frame, metres. */
  pivot: Vec3;
  joint?: 'yaw' | 'pitch';
  /** The joint (index among the jointed parts) a gun rides on. */
  parent?: number;
  /** The team colour's shade on this part (default `HULL_TONE`). */
  tone?: number;
}

export interface MeshFigureData {
  anchor: Anchor;
  /** The box the 16-bit positions span: min x, y, z, max x, y, z. */
  box: number[];
  parts: MeshPart[];
  /** Running gear: hull triangles below `top` and further out than `inner` from the middle are track. */
  gear?: { top: number; inner: number };
  /** A propeller's hub and diameter: drawn as the faint disc of a turning propeller (the blades are in the mesh). */
  prop?: { at: Vec3; diameter: number };
  /** Crease angle for the normals, degrees. */
  crease?: number;
  /**
   * Full, coarse and far builds, base64: u16 part count, per part u16 vertex and triangle counts, then per part its
   * positions (u16 x, y, z over `box`) and triangles (u16 vertex indices).
   */
  lods: string[];
}

/** The team colour's shade on a mesh figure's body, as on a built hull. */
export const HULL_TONE = 0.86;
/** Crease angle for a mesh figure's normals, degrees: wider than a built figure's, as a remeshed surface's facets are small. */
const CREASE = 65;
/** A frame for `ring` that stands a disc upright, facing forward (as in `air.ts`). */
const FACING_FORWARD: Frame3 = {
  o: [0, 0, 0],
  f: [0, 1, 0],
  r: [0, 0, 1],
  u: [1, 0, 0],
};

function bytesOf(b64: string): Uint16Array {
  const s = atob(b64);
  const u8 = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
  return new Uint16Array(u8.buffer, 0, u8.length >> 1);
}

/** The parts of one level of detail: positions in metres and triangles, per part. */
export function decodeLod(m: MeshFigureData, lod: number): { p: Float32Array; idx: Uint16Array }[] {
  const d = bytesOf(m.lods[lod]);
  const n = d[0];
  let o = 1 + n * 2;
  const out: { p: Float32Array; idx: Uint16Array }[] = [];
  const b = m.box;
  for (let i = 0; i < n; i++) {
    const nv = d[1 + i * 2];
    const nt = d[2 + i * 2];
    const p = new Float32Array(nv * 3);
    for (let v = 0; v < nv * 3; v++) {
      const a = v % 3;
      p[v] = b[a] + (d[o + v] / 65535) * (b[a + 3] - b[a]);
    }
    o += nv * 3;
    out.push({ p, idx: d.slice(o, o + nt * 3) });
    o += nt * 3;
  }
  return out;
}

function buildLod(m: MeshFigureData, lod: number): Template {
  const k = newKit();
  const parts = decodeLod(m, lod);
  const joints: number[] = [];
  m.parts.forEach((part, i) => {
    let j = -1;
    if (part.joint) {
      const parent = part.parent !== undefined ? (joints[part.parent] ?? -1) : -1;
      j = joint(k, {
        kind: part.joint,
        pivot: [...part.pivot] as Vec3,
        parent,
        rest: 0,
        ...(part.joint === 'pitch' ? { pitch: 0 } : {}),
      });
      joints.push(j);
    }
    into(k, j);
    const { p, idx } = parts[i];
    if (!idx.length) return;
    const tone = part.tone ?? HULL_TONE;
    const body: Rgb = [tone, tone, tone];
    const team = new Mesh();
    const fixed = new Mesh();
    for (let v = 0; v < p.length; v += 3) {
      team.v([p[v], p[v + 1], p[v + 2]], body);
      fixed.v([p[v], p[v + 1], p[v + 2]], PAINT.track);
    }
    const gear = !part.joint ? m.gear : undefined;
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t],
        b = idx[t + 1],
        c = idx[t + 2];
      const dst = gear && (p[a * 3 + 1] + p[b * 3 + 1] + p[c * 3 + 1]) / 3 < gear.top && Math.abs(p[a * 3 + 2] + p[b * 3 + 2] + p[c * 3 + 2]) / 3 > gear.inner ? fixed : team;
      dst.tri(a, b, c);
    }
    const crease = m.crease ?? CREASE;
    if (team.idx.length) team.emit(k.team, { crease, wound: true });
    if (fixed.idx.length) fixed.emit(k.fixed, { crease, wound: true });
  });
  into(k, -1);
  if (m.prop) ring(k.fixed, FACING_FORWARD, m.prop.at[1], m.prop.at[2], m.prop.at[0] - 0.02, m.prop.diameter / 2, PAINT.rotor, 0.18, 28);
  return finish(k, m.anchor);
}

/** A mesh figure's template, its coarse and far builds made when first asked for, with the full one's bounds. */
export function buildMeshFigure(m: MeshFigureData): Template {
  const t = buildLod(m, 0);
  let c: Template | undefined;
  let f: Template | undefined;
  const lod = (i: number): Template => {
    const x = atDetail(i === 1 ? COARSE : FAR, () => buildLod(m, Math.min(i, m.lods.length - 1)));
    x.min = t.min;
    x.max = t.max;
    return x;
  };
  t.coarse = () => (c ??= lod(1));
  t.far = () => (f ??= lod(2));
  return t;
}
