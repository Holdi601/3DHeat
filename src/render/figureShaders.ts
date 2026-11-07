/**
 * The shaders that draw instanced figures (`figures/instances.ts`), for both
 * renderers, made from the figures' light (`figures/light.ts`) so that the
 * GPU and the CPU placing can never light a figure differently: the
 * constants are written into the source, the formula is `shade`'s line for
 * line.
 *
 * Vertex inputs: the mesh (position, colour, normal + gloss, tint) and the
 * instance (origin + scale, forward + alpha, up, team colour). Output: the
 * world position (for the distance fade the other scene geometry has) and
 * the lit colour.
 */

import { AMBIENT, GROUND_COLOR, SHEEN_BASE, SHEEN_COLOR, SHEEN_UP, SKY_COLOR, SUN_COLOR, SUN_DIR, UNLIT } from '../figures/light';

const f = (v: number) => {
  const s = String(Number(v.toPrecision(9)));
  return /[.eE]/.test(s) ? s : `${s}.0`;
};
const v3 = (fn: string, a: readonly number[]) => `${fn}(${f(a[0])}, ${f(a[1])}, ${f(a[2])})`;

/** `shade` in GLSL ES 3.0. */
function glslShade(): string {
  return `
vec3 shadeFigure(vec3 base, vec3 n, float gloss) {
  if (n.x == 0.0 && n.y == 0.0 && n.z == 0.0) return min(vec3(1.0), base * ${f(UNLIT)});
  float sun = max(0.0, dot(n, ${v3('vec3', SUN_DIR)}));
  float h = 0.5 + 0.5 * n.y;
  float up = max(0.0, n.y);
  float sheen = gloss * (${f(SHEEN_BASE)} + ${f(SHEEN_UP)} * up * up);
  vec3 ground = ${v3('vec3', GROUND_COLOR)};
  vec3 light = ${f(AMBIENT)} + ground + (${v3('vec3', SKY_COLOR)} - ground) * h + ${v3('vec3', SUN_COLOR)} * sun;
  return min(vec3(1.0), base * light + sheen * ${v3('vec3', SHEEN_COLOR)});
}`;
}

/** `shade` in WGSL. */
function wgslShade(): string {
  return `
fn shadeFigure(base : vec3<f32>, n : vec3<f32>, gloss : f32) -> vec3<f32> {
  if (n.x == 0.0 && n.y == 0.0 && n.z == 0.0) { return min(vec3<f32>(1.0), base * ${f(UNLIT)}); }
  let sun = max(0.0, dot(n, ${v3('vec3<f32>', SUN_DIR)}));
  let h = 0.5 + 0.5 * n.y;
  let up = max(0.0, n.y);
  let sheen = gloss * (${f(SHEEN_BASE)} + ${f(SHEEN_UP)} * up * up);
  let ground = ${v3('vec3<f32>', GROUND_COLOR)};
  let light = ${f(AMBIENT)} + ground + (${v3('vec3<f32>', SKY_COLOR)} - ground) * h + ${v3('vec3<f32>', SUN_COLOR)} * sun;
  return min(vec3<f32>(1.0), base * light + sheen * ${v3('vec3<f32>', SHEEN_COLOR)});
}`;
}

export function figureGlslVs(): string {
  return `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec4 aColor;
layout(location = 2) in vec4 aNormal;   // nx, ny, nz, gloss
layout(location = 3) in float aTint;
layout(location = 4) in vec4 iOrigin;   // x, y, z, scale
layout(location = 5) in vec4 iForward;  // x, y, z, alpha
layout(location = 6) in vec4 iUp;
layout(location = 7) in vec4 iTeam;
uniform mat4 uViewProj;
out vec4 vColor;
out vec3 vWorld;
${glslShade()}
void main() {
  vec3 f = iForward.xyz;
  vec3 u = iUp.xyz;
  vec3 r = cross(f, u);
  vec3 p = aPos * iOrigin.w;
  vec3 world = iOrigin.xyz + f * p.x + u * p.y + r * p.z;
  vec3 n = f * aNormal.x + u * aNormal.y + r * aNormal.z;
  vec3 base = aTint > 0.5 ? iTeam.rgb * aColor.rgb : aColor.rgb;
  vColor = vec4(shadeFigure(base, n, aNormal.w), aColor.a * iForward.w);
  vWorld = world;
  gl_Position = uViewProj * vec4(world, 1.0);
}
`;
}

export function figureWgsl(): string {
  return /* wgsl */ `
struct SceneUniforms {
  viewProj : mat4x4<f32>,
  camera   : vec4<f32>,
  cfg      : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : SceneUniforms;

struct FigureOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) colour : vec4<f32>,
  @location(1) world : vec3<f32>,
};
${wgslShade()}

@vertex
fn vsFigure(
  @location(0) position : vec3<f32>,
  @location(1) colour : vec4<f32>,
  @location(2) normal : vec4<f32>,
  @location(3) tint : f32,
  @location(4) origin : vec4<f32>,
  @location(5) forward : vec4<f32>,
  @location(6) upAxis : vec4<f32>,
  @location(7) team : vec4<f32>,
) -> FigureOut {
  var out : FigureOut;
  let f = forward.xyz;
  let up = upAxis.xyz;
  let r = cross(f, up);
  let p = position * origin.w;
  let world = origin.xyz + f * p.x + up * p.y + r * p.z;
  let n = f * normal.x + up * normal.y + r * normal.z;
  var base = colour.rgb;
  if (tint > 0.5) { base = team.rgb * colour.rgb; }
  out.colour = vec4<f32>(shadeFigure(base, n, normal.w), colour.a * forward.w);
  out.world = world;
  out.pos = u.viewProj * vec4<f32>(world, 1.0);
  return out;
}

@fragment
fn fsFigure(in : FigureOut) -> @location(0) vec4<f32> {
  let d = distance(in.world, u.camera.xyz);
  let fade = 1.0 - smoothstep(u.cfg.x, u.cfg.y, d);
  if (fade <= 0.001) { discard; }
  return vec4<f32>(in.colour.rgb, in.colour.a * fade);
}
`;
}
