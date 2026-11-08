/**
 * The volumes as the heat shaders test them: a fixed block of uniforms, the
 * same for both backends, and the test itself in GLSL and in WGSL.
 *
 * Uniforms rather than a texture or a storage buffer because the heat vertex
 * stage is already at the sampler and storage-buffer floors the APIs guarantee,
 * and a few dozen vectors cost nothing to update: moving a volume rewrites the
 * block, nothing per row. Each row then pays a handful of dot products - per
 * volume, after the cheap rejections - so 100M rows stay on the GPU.
 */

import { compiled, type Volume, type VolumeFilter } from './volume';

/** Most volumes the shader tests; past it, the panel says which are not applied. */
export const MAX_GPU_VOLUMES = 8;
/** Most outline points of all prisms together. */
export const MAX_GPU_POLY_POINTS = 64;

/** Floats in the packed block: cfg vec4, then matrices, info, outline points. */
export const VOLUME_BLOCK_FLOATS = 4 + MAX_GPU_VOLUMES * 12 + MAX_GPU_VOLUMES * 4 + MAX_GPU_POLY_POINTS * 2;
export const VOLUME_BLOCK_BYTES = VOLUME_BLOCK_FLOATS * 4;

/** Offsets into the block, in floats. */
export const VOL_CFG = 0;
export const VOL_M = 4;
export const VOL_INFO = VOL_M + MAX_GPU_VOLUMES * 12;
export const VOL_POLY = VOL_INFO + MAX_GPU_VOLUMES * 4;

export interface VolumeDraw {
  /** 1 draws only the selection, 2 only what is outside it. */
  mode: 1 | 2;
  count: number;
  /** Laid out as above. cfg = (mode, count, hasInclude, 0). */
  block: Float32Array;
  /** Equal keys, equal tests: for invalidating the accumulated heat. */
  key: string;
  /** Visible volumes that did not fit and are not applied. */
  dropped: string[];
}

/**
 * Which visible volumes the GPU can test, in order: the first that fit. A
 * volume is left out when there is no room for it or its outline, and its id
 * comes back so the panel can say so - a filter silently missing one volume
 * would be read as the data having none there.
 */
export function gpuVolumeFit(volumes: readonly Volume[]): { fit: Volume[]; dropped: string[] } {
  const fit: Volume[] = [];
  const dropped: string[] = [];
  let points = 0;
  for (const v of volumes) {
    if (!v.visible) continue;
    const n = v.shape.kind === 'prism' ? v.shape.points.length : 0;
    if (fit.length >= MAX_GPU_VOLUMES || points + n > MAX_GPU_POLY_POINTS) {
      dropped.push(v.id);
      continue;
    }
    fit.push(v);
    points += n;
  }
  return { fit, dropped };
}

/** The filter as a uniform block, or null when it restricts nothing. */
export function packVolumes(volumes: readonly Volume[], filter: VolumeFilter, out?: Float32Array): VolumeDraw | null {
  if (filter === 'off') return null;
  const { fit, dropped } = gpuVolumeFit(volumes);
  if (fit.length === 0) return null;
  const block = out && out.length >= VOLUME_BLOCK_FLOATS ? out.fill(0) : new Float32Array(VOLUME_BLOCK_FLOATS);
  const mode = filter === 'inside' ? 1 : 2;
  let polyAt = 0;
  let hasInclude = 0;
  const keys: string[] = [filter];
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
    if (v.op !== 'exclude') hasInclude = 1;
    keys.push(`${v.op}:${JSON.stringify(v.shape)}`);
  });
  block[VOL_CFG] = mode;
  block[VOL_CFG + 1] = fit.length;
  block[VOL_CFG + 2] = hasInclude;
  return { mode, count: fit.length, block, key: keys.join('|'), dropped };
}

/**
 * GLSL ES 3.00: the uniforms and `volKeep(p)`, true when the row stays. Loops
 * have constant bounds and break early, which every GLSL ES driver accepts.
 */
export const VOLUME_GLSL = `
uniform vec4 uVolCfg;                        // mode (0 off, 1 inside, 2 outside), count, hasInclude
uniform vec4 uVolM[${MAX_GPU_VOLUMES * 3}];   // world -> unit space, 3 rows a volume
uniform vec4 uVolInfo[${MAX_GPU_VOLUMES}];    // shape code, +1 include / -1 exclude, outline start, outline count
uniform vec4 uVolPoly[${MAX_GPU_POLY_POINTS / 2}]; // outline points, two a vector

vec2 volPoint(int k) {
  vec4 v = uVolPoly[k >> 1];
  return (k & 1) == 0 ? v.xy : v.zw;
}

bool volHolds(int i, vec3 p) {
  vec4 info = uVolInfo[i];
  vec4 ph = vec4(p, 1.0);
  float uy = dot(uVolM[i * 3 + 1], ph);
  int code = int(info.x + 0.5);
  if (code == 4) {
    if (abs(uy) > 1.0) return false;
    int start = int(info.z + 0.5);
    int n = int(info.w + 0.5);
    bool inside = false;
    vec2 b = volPoint(start + n - 1);
    for (int k = 0; k < ${MAX_GPU_POLY_POINTS}; k++) {
      if (k >= n) break;
      vec2 a = volPoint(start + k);
      if ((a.y > p.z) != (b.y > p.z) && p.x < (b.x - a.x) * (p.z - a.y) / (b.y - a.y) + a.x) inside = !inside;
      b = a;
    }
    return inside;
  }
  float ux = dot(uVolM[i * 3], ph);
  float uz = dot(uVolM[i * 3 + 2], ph);
  if (code == 1) return abs(ux) <= 1.0 && abs(uy) <= 1.0 && abs(uz) <= 1.0;
  if (code == 2) return ux * ux + uy * uy + uz * uz <= 1.0;
  return ux * ux + uz * uz <= 1.0 && abs(uy) <= 1.0;
}

/** In an include volume (or there is none) and in no exclude volume. */
bool volSelected(vec3 p) {
  int count = int(uVolCfg.y + 0.5);
  bool inInclude = false;
  for (int i = 0; i < ${MAX_GPU_VOLUMES}; i++) {
    if (i >= count) break;
    if (uVolInfo[i].y > 0.0) {
      if (!inInclude && volHolds(i, p)) inInclude = true;
    } else if (volHolds(i, p)) {
      return false;
    }
  }
  return uVolCfg.z < 0.5 || inInclude;
}

bool volKeep(vec3 p) {
  if (uVolCfg.x < 0.5) return true;
  bool sel = volSelected(p);
  return uVolCfg.x < 1.5 ? sel : !sel;
}
`;

/** WGSL: the uniform block at `@group(0) @binding(binding)` and `volKeep(p)`. */
export function volumeWgsl(binding: number): string {
  return /* wgsl */ `
struct VolumeUniforms {
  cfg  : vec4<f32>,
  m    : array<vec4<f32>, ${MAX_GPU_VOLUMES * 3}>,
  info : array<vec4<f32>, ${MAX_GPU_VOLUMES}>,
  poly : array<vec4<f32>, ${MAX_GPU_POLY_POINTS / 2}>,
};
@group(0) @binding(${binding}) var<uniform> vol : VolumeUniforms;

fn volPoint(k : i32) -> vec2<f32> {
  let v = vol.poly[k >> 1u];
  if ((k & 1) == 0) { return v.xy; }
  return v.zw;
}

fn volHolds(i : i32, p : vec3<f32>) -> bool {
  let info = vol.info[i];
  let ph = vec4<f32>(p, 1.0);
  let uy = dot(vol.m[i * 3 + 1], ph);
  let code = i32(info.x + 0.5);
  if (code == 4) {
    if (abs(uy) > 1.0) { return false; }
    let start = i32(info.z + 0.5);
    let n = i32(info.w + 0.5);
    var inside = false;
    var b = volPoint(start + n - 1);
    for (var k = 0; k < n; k = k + 1) {
      let a = volPoint(start + k);
      if ((a.y > p.z) != (b.y > p.z) && p.x < (b.x - a.x) * (p.z - a.y) / (b.y - a.y) + a.x) { inside = !inside; }
      b = a;
    }
    return inside;
  }
  let ux = dot(vol.m[i * 3], ph);
  let uz = dot(vol.m[i * 3 + 2], ph);
  if (code == 1) { return abs(ux) <= 1.0 && abs(uy) <= 1.0 && abs(uz) <= 1.0; }
  if (code == 2) { return ux * ux + uy * uy + uz * uz <= 1.0; }
  return ux * ux + uz * uz <= 1.0 && abs(uy) <= 1.0;
}

fn volSelected(p : vec3<f32>) -> bool {
  let count = min(i32(vol.cfg.y + 0.5), ${MAX_GPU_VOLUMES});
  var inInclude = false;
  for (var i = 0; i < count; i = i + 1) {
    if (vol.info[i].y > 0.0) {
      if (!inInclude && volHolds(i, p)) { inInclude = true; }
    } else if (volHolds(i, p)) {
      return false;
    }
  }
  return vol.cfg.z < 0.5 || inInclude;
}

fn volKeep(p : vec3<f32>) -> bool {
  if (vol.cfg.x < 0.5) { return true; }
  let sel = volSelected(p);
  if (vol.cfg.x < 1.5) { return sel; }
  return !sel;
}
`;
}
