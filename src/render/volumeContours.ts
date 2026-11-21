/**
 * Where the volumes cut the level: a line on every surface along each visible
 * volume's boundary, in the volume's colour, so a volume reads as the ground
 * and the walls it takes in rather than as a box floating over them.
 *
 * A screen pass over the scene's depth, in both backends: each pixel's world
 * position is rebuilt from the depth, and each volume's boundary function -
 * zero on its surface, negative inside - is evaluated there. A pixel the
 * boundary crosses (|f| under a pixel's change of f) is lit; across an edge in
 * the depth, where the next pixel is another surface, nothing is. No geometry is built and
 * nothing is read back; a volume moved is a new uniform block. The volumes'
 * transforms are the heat filter's (volumes/gpu.ts), packed the same way.
 */

import { create } from 'zustand';
import { MAX_GPU_POLY_POINTS, MAX_GPU_VOLUMES, VOLUME_BLOCK_FLOATS, VOLUME_GLSL, VOL_CFG, VOL_INFO, VOL_M, VOL_POLY, gpuVolumeFit, volumeWgsl } from '../volumes/gpu';
import { compiled, type Volume } from '../volumes/volume';

export interface VolumeContourDraw {
  /** The volumes in the heat filter's layout; cfg = (1, count, 0, line width px). */
  block: Float32Array;
  /** Per volume: linear RGB and alpha. */
  colors: Float32Array;
  count: number;
}

interface ContourPrefs {
  /** Draw the lines. */
  on: boolean;
  /** Their width, device pixels. */
  width: number;
  set: (p: Partial<Pick<ContourPrefs, 'on' | 'width'>>) => void;
}

const KEY = 'heat3d.volumeContours';

function saved(): Pick<ContourPrefs, 'on' | 'width'> {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (v && typeof v === 'object') return { on: v.on !== false, width: Number.isFinite(v.width) ? Math.max(0.5, Math.min(8, v.width)) : 1.5 };
  } catch {
    // No storage: the defaults.
  }
  return { on: true, width: 1.5 };
}

export const useContourPrefs = create<ContourPrefs>((set, get) => ({
  ...saved(),
  set: (p) => {
    set(p);
    try {
      localStorage.setItem(KEY, JSON.stringify({ on: get().on, width: get().width }));
    } catch {
      // The setting lasts this session.
    }
  },
}));

function hexColor(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [1, 1, 1];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

let last: { volumes: readonly Volume[]; width: number; out: VolumeContourDraw | null } | null = null;

/** The visible volumes packed for the pass; null for none or switched off. The same object while nothing changes. */
export function volumeContourDraw(volumes: readonly Volume[]): VolumeContourDraw | null {
  const prefs = useContourPrefs.getState();
  if (!prefs.on) return null;
  if (last && last.volumes === volumes && last.width === prefs.width) return last.out;
  const { fit } = gpuVolumeFit(volumes);
  let out: VolumeContourDraw | null = null;
  if (fit.length) {
    const block = new Float32Array(VOLUME_BLOCK_FLOATS);
    const colors = new Float32Array(MAX_GPU_VOLUMES * 4);
    let polyAt = 0;
    fit.forEach((v, i) => {
      const c = compiled(v);
      for (let k = 0; k < 12; k++) block[VOL_M + i * 12 + k] = c.m[k];
      const n = c.poly ? c.poly.length / 2 : 0;
      block[VOL_INFO + i * 4] = c.code;
      block[VOL_INFO + i * 4 + 1] = v.op === 'exclude' ? -1 : 1;
      block[VOL_INFO + i * 4 + 2] = polyAt;
      block[VOL_INFO + i * 4 + 3] = n;
      if (c.poly) for (let k = 0; k < c.poly.length; k++) block[VOL_POLY + polyAt * 2 + k] = c.poly[k];
      polyAt += n;
      const [r, g, b] = hexColor(v.color);
      colors.set([r, g, b, v.op === 'exclude' ? 0.7 : 0.95], i * 4);
    });
    block[VOL_CFG] = 1;
    block[VOL_CFG + 1] = fit.length;
    block[VOL_CFG + 3] = prefs.width * (globalThis.devicePixelRatio || 1);
    out = { block, colors, count: fit.length };
  }
  last = { volumes, width: prefs.width, out };
  return out;
}

/** The inverse of a column-major 4x4 matrix, in doubles; the identity when it is singular. */
export function invert4(m: ArrayLike<number>, out = new Float32Array(16)): Float32Array {
  const a = Array.from({ length: 16 }, (_, i) => m[i]);
  const inv = new Array<number>(16);
  inv[0] = a[5] * a[10] * a[15] - a[5] * a[11] * a[14] - a[9] * a[6] * a[15] + a[9] * a[7] * a[14] + a[13] * a[6] * a[11] - a[13] * a[7] * a[10];
  inv[4] = -a[4] * a[10] * a[15] + a[4] * a[11] * a[14] + a[8] * a[6] * a[15] - a[8] * a[7] * a[14] - a[12] * a[6] * a[11] + a[12] * a[7] * a[10];
  inv[8] = a[4] * a[9] * a[15] - a[4] * a[11] * a[13] - a[8] * a[5] * a[15] + a[8] * a[7] * a[13] + a[12] * a[5] * a[11] - a[12] * a[7] * a[9];
  inv[12] = -a[4] * a[9] * a[14] + a[4] * a[10] * a[13] + a[8] * a[5] * a[14] - a[8] * a[6] * a[13] - a[12] * a[5] * a[10] + a[12] * a[6] * a[9];
  inv[1] = -a[1] * a[10] * a[15] + a[1] * a[11] * a[14] + a[9] * a[2] * a[15] - a[9] * a[3] * a[14] - a[13] * a[2] * a[11] + a[13] * a[3] * a[10];
  inv[5] = a[0] * a[10] * a[15] - a[0] * a[11] * a[14] - a[8] * a[2] * a[15] + a[8] * a[3] * a[14] + a[12] * a[2] * a[11] - a[12] * a[3] * a[10];
  inv[9] = -a[0] * a[9] * a[15] + a[0] * a[11] * a[13] + a[8] * a[1] * a[15] - a[8] * a[3] * a[13] - a[12] * a[1] * a[11] + a[12] * a[3] * a[9];
  inv[13] = a[0] * a[9] * a[14] - a[0] * a[10] * a[13] - a[8] * a[1] * a[14] + a[8] * a[2] * a[13] + a[12] * a[1] * a[10] - a[12] * a[2] * a[9];
  inv[2] = a[1] * a[6] * a[15] - a[1] * a[7] * a[14] - a[5] * a[2] * a[15] + a[5] * a[3] * a[14] + a[13] * a[2] * a[7] - a[13] * a[3] * a[6];
  inv[6] = -a[0] * a[6] * a[15] + a[0] * a[7] * a[14] + a[4] * a[2] * a[15] - a[4] * a[3] * a[14] - a[12] * a[2] * a[7] + a[12] * a[3] * a[6];
  inv[10] = a[0] * a[5] * a[15] - a[0] * a[7] * a[13] - a[4] * a[1] * a[15] + a[4] * a[3] * a[13] + a[12] * a[1] * a[7] - a[12] * a[3] * a[5];
  inv[14] = -a[0] * a[5] * a[14] + a[0] * a[6] * a[13] + a[4] * a[1] * a[14] - a[4] * a[2] * a[13] - a[12] * a[1] * a[6] + a[12] * a[2] * a[5];
  inv[3] = -a[1] * a[6] * a[11] + a[1] * a[7] * a[10] + a[5] * a[2] * a[11] - a[5] * a[3] * a[10] - a[9] * a[2] * a[7] + a[9] * a[3] * a[6];
  inv[7] = a[0] * a[6] * a[11] - a[0] * a[7] * a[10] - a[4] * a[2] * a[11] + a[4] * a[3] * a[10] + a[8] * a[2] * a[7] - a[8] * a[3] * a[6];
  inv[11] = -a[0] * a[5] * a[11] + a[0] * a[7] * a[9] + a[4] * a[1] * a[11] - a[4] * a[3] * a[9] - a[8] * a[1] * a[7] + a[8] * a[3] * a[5];
  inv[15] = a[0] * a[5] * a[10] - a[0] * a[6] * a[9] - a[4] * a[1] * a[10] + a[4] * a[2] * a[9] + a[8] * a[1] * a[6] - a[8] * a[2] * a[5];
  const det = a[0] * inv[0] + a[1] * inv[4] + a[2] * inv[8] + a[3] * inv[12];
  if (!det || !Number.isFinite(det)) {
    out.fill(0);
    out[0] = out[5] = out[10] = out[15] = 1;
    return out;
  }
  for (let i = 0; i < 16; i++) out[i] = inv[i] / det;
  return out;
}

/** The boundary function, CPU side, for the tests: as the shaders compute it. */
export function boundaryValue(v: Volume, x: number, y: number, z: number): number {
  const c = compiled(v);
  const m = c.m;
  const ux = m[0] * x + m[1] * y + m[2] * z + m[3];
  const uy = m[4] * x + m[5] * y + m[6] * z + m[7];
  const uz = m[8] * x + m[9] * y + m[10] * z + m[11];
  if (c.code === 1) return Math.max(Math.abs(ux), Math.abs(uy), Math.abs(uz)) - 1;
  if (c.code === 2) return Math.hypot(ux, uy, uz) - 1;
  if (c.code === 4 && c.poly) {
    const p = c.poly;
    const n = p.length / 2;
    let d = Infinity;
    let inside = false;
    for (let k = 0, j = n - 1; k < n; j = k++) {
      const ax = p[k * 2];
      const az = p[k * 2 + 1];
      const bx = p[j * 2];
      const bz = p[j * 2 + 1];
      const ex = bx - ax;
      const ez = bz - az;
      const h = Math.max(0, Math.min(1, ((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez || 1)));
      d = Math.min(d, Math.hypot(x - ax - ex * h, z - az - ez * h));
      if (az > z !== bz > z && x < ((bx - ax) * (z - az)) / (bz - az) + ax) inside = !inside;
    }
    const half = 1 / Math.max(1e-9, Math.hypot(m[4], m[5], m[6]));
    return Math.max(inside ? -d : d, (Math.abs(uy) - 1) * half);
  }
  return Math.max(Math.hypot(ux, uz) - 1, Math.abs(uy) - 1);
}

/** GLSL ES 3.00 fragment shader of the pass. With FULLSCREEN_VS (vUv 0..1, y up). */
export const VOLUME_CONTOUR_FS = `#version 300 es
precision highp float;
precision highp int;
${VOLUME_GLSL}
uniform sampler2D uDepth;
uniform mat4 uInvViewProj;
uniform vec4 uVolColor[${MAX_GPU_VOLUMES}];
// x: 1 when the depth buffer is OpenGL's [-1, 1] layout, y: the depth it clears to.
uniform vec2 uDepthMode;
in vec2 vUv;
out vec4 outColor;

float volEdge(int i, vec3 p) {
  vec4 info = uVolInfo[i];
  vec4 ph = vec4(p, 1.0);
  float ux = dot(uVolM[i * 3], ph);
  float uy = dot(uVolM[i * 3 + 1], ph);
  float uz = dot(uVolM[i * 3 + 2], ph);
  int code = int(info.x + 0.5);
  if (code == 1) return max(max(abs(ux), abs(uy)), abs(uz)) - 1.0;
  if (code == 2) return length(vec3(ux, uy, uz)) - 1.0;
  if (code == 4) {
    int start = int(info.z + 0.5);
    int n = int(info.w + 0.5);
    float d = 1e30;
    bool inside = false;
    vec2 b = volPoint(start + n - 1);
    for (int k = 0; k < ${MAX_GPU_POLY_POINTS}; k++) {
      if (k >= n) break;
      vec2 a = volPoint(start + k);
      vec2 e = b - a;
      vec2 q = p.xz - a;
      float h = clamp(dot(q, e) / max(dot(e, e), 1e-12), 0.0, 1.0);
      d = min(d, length(q - e * h));
      if ((a.y > p.z) != (b.y > p.z) && p.x < (b.x - a.x) * (p.z - a.y) / (b.y - a.y) + a.x) inside = !inside;
      b = a;
    }
    float halfH = 1.0 / max(1e-9, length(uVolM[i * 3 + 1].xyz));
    return max(inside ? -d : d, (abs(uy) - 1.0) * halfH);
  }
  return max(length(vec2(ux, uz)) - 1.0, abs(uy) - 1.0);
}

void main() {
  float depth = texture(uDepth, vUv).r;
  float z = uDepthMode.x > 0.5 ? depth * 2.0 - 1.0 : depth;
  vec4 w = uInvViewProj * vec4(vUv * 2.0 - 1.0, z, 1.0);
  vec3 p = w.xyz / w.w;
  int count = int(uVolCfg.y + 0.5);
  float width = max(0.5, uVolCfg.w);
  vec4 col = vec4(0.0);
  // The functions first, then their derivatives in a loop of fixed length with no
  // early exit: derivatives inside a loop that can break are undefined on some drivers.
  float fs[${MAX_GPU_VOLUMES}];
  for (int i = 0; i < ${MAX_GPU_VOLUMES}; i++) fs[i] = i < count ? volEdge(i, p) : 1e3;
  for (int i = 0; i < ${MAX_GPU_VOLUMES}; i++) {
    float f = fs[i];
    float fx = dFdx(f);
    float fy = dFdy(f);
    float fw = abs(fx) + abs(fy);
    // Smooth across a surface; across an edge in the depth, only where the sign changes.
    // Across an edge in the depth the next pixel is another surface, far off or the sky: no line there.
    float a = fw > 0.25 ? 0.0 : 1.0 - smoothstep(0.5 * width, 0.5 * width + 1.0, abs(f) / max(fw, 1e-12));
    vec4 c = uVolColor[i];
    float alpha = i < count ? a * c.a : 0.0;
    if (alpha > col.a) col = vec4(c.rgb, alpha);
  }
  // The sky: nothing to cut.
  if (depth == uDepthMode.y) col.a = 0.0;
  outColor = vec4(col.rgb, col.a);
}
`;

/** WGSL: the pass, the volumes at binding 0, its own uniforms at 1, the depth at 2. */
export function volumeContourWgsl(): string {
  return /* wgsl */ `
${volumeWgsl(0)}
struct ContourUniforms {
  color : array<vec4<f32>, ${MAX_GPU_VOLUMES}>,
  inv : mat4x4<f32>,
  // width, height, clear depth, 0
  view : vec4<f32>,
};
@group(0) @binding(1) var<uniform> cu : ContourUniforms;
@group(0) @binding(2) var depthTex : texture_depth_2d;

struct VsOut {
  @builtin(position) pos : vec4<f32>,
};

@vertex
fn vsContour(@builtin(vertex_index) vid : u32) -> VsOut {
  var out : VsOut;
  let p = vec2<f32>(f32((vid & 1u) << 1u), f32(vid & 2u));
  out.pos = vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
  return out;
}

fn volEdge(i : i32, p : vec3<f32>) -> f32 {
  let info = vol.info[i];
  let ph = vec4<f32>(p, 1.0);
  let ux = dot(vol.m[i * 3], ph);
  let uy = dot(vol.m[i * 3 + 1], ph);
  let uz = dot(vol.m[i * 3 + 2], ph);
  let code = i32(info.x + 0.5);
  if (code == 1) { return max(max(abs(ux), abs(uy)), abs(uz)) - 1.0; }
  if (code == 2) { return length(vec3<f32>(ux, uy, uz)) - 1.0; }
  if (code == 4) {
    let start = i32(info.z + 0.5);
    let n = i32(info.w + 0.5);
    var d = 1e30;
    var inside = false;
    var b = volPoint(start + n - 1);
    for (var k = 0; k < ${MAX_GPU_POLY_POINTS}; k++) {
      if (k >= n) { break; }
      let a = volPoint(start + k);
      let e = b - a;
      let q = p.xz - a;
      let h = clamp(dot(q, e) / max(dot(e, e), 1e-12), 0.0, 1.0);
      d = min(d, length(q - e * h));
      if ((a.y > p.z) != (b.y > p.z) && p.x < (b.x - a.x) * (p.z - a.y) / (b.y - a.y) + a.x) { inside = !inside; }
      b = a;
    }
    let halfH = 1.0 / max(1e-9, length(vol.m[i * 3 + 1].xyz));
    return max(select(d, -d, inside), (abs(uy) - 1.0) * halfH);
  }
  return max(length(vec2<f32>(ux, uz)) - 1.0, abs(uy) - 1.0);
}

@fragment
fn fsContour(in : VsOut) -> @location(0) vec4<f32> {
  let px = vec2<i32>(in.pos.xy);
  let depth = textureLoad(depthTex, px, 0);
  let ndc = vec2<f32>(in.pos.x / cu.view.x * 2.0 - 1.0, 1.0 - in.pos.y / cu.view.y * 2.0);
  let w = cu.inv * vec4<f32>(ndc, depth, 1.0);
  let p = w.xyz / w.w;
  let count = i32(vol.cfg.y + 0.5);
  let width = max(0.5, vol.cfg.w);
  var col = vec4<f32>(0.0);
  var fs : array<f32, ${MAX_GPU_VOLUMES}>;
  for (var i = 0; i < ${MAX_GPU_VOLUMES}; i++) { fs[i] = select(1e3, volEdge(i, p), i < count); }
  for (var i = 0; i < ${MAX_GPU_VOLUMES}; i++) {
    let f = fs[i];
    let fx = dpdx(f);
    let fy = dpdy(f);
    let fw = abs(fx) + abs(fy);
    let a = select(1.0 - smoothstep(0.5 * width, 0.5 * width + 1.0, abs(f) / max(fw, 1e-12)), 0.0, fw > 0.25);
    let c = cu.color[i];
    let alpha = select(0.0, a * c.a, i < count);
    if (alpha > col.a) { col = vec4<f32>(c.rgb, alpha); }
  }
  if (depth == cu.view.z) { col.a = 0.0; }
  return col;
}
`;
}
