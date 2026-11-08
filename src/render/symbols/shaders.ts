/**
 * The glyph shaders, for both backends: every far-off symbol, weapon glyph
 * and decoy as a screen-facing quad of constant pixel size, one instanced
 * draw from the atlas (`atlas.ts`). Each instance is a figure instance
 * (`figures/instances.ts`): origin + pixel size, forward + alpha, up, team
 * colour + the word (`symbolClass.ts`) below -1000, so the GPU tracks write
 * them in their place pass and the CPU paths in their per-unit pass, and
 * the shader picks the cells, colours, turn and heading tick from the word.
 *
 * Out: premultiplied colour, so that the glows add (alpha 0) and the rest
 * blends over; no depth test - a map symbol is never hidden by a hill.
 */

import { ATLAS_COLUMNS, ATLAS_HEIGHT, ATLAS_WIDTH, CELL, LAYOUT } from './atlas';
import { C_AAM, C_AGM, C_GUIDED_BOMB, C_SAM, C_SHIP, D_BOMB, D_CHAFF, D_FLARE, D_MISC, D_MISSILE, D_ROCKET, D_SEA, D_SHELL, D_SUB, WORD_BASE, WORD_DEAD, WORD_MOVING } from './shaderConsts';

/** Uniform floats: viewProj, view (w, h, style, mode), opt (ticks, -, -, -), cam, 16 sides. */
export const SYMBOL_UNIFORM_FLOATS = 16 + 4 + 4 + 4 + 64;
/** The quad reaches this far past the cell's edge, in cell half-widths: room for the heading tick. */
export const QUAD = 1.5;

const f = (x: number) => (Number.isInteger(x) ? `${x}.0` : `${x}`);

/** The arithmetic both languages share, written once in a C-like subset that is valid in both after `lang`. */
function common(lang: 'glsl' | 'wgsl'): string {
  const g = lang === 'glsl';
  const fn = (ret: string, name: string, args: string, body: string) =>
    g ? `${ret === 'f32' ? 'float' : ret === 'i32' ? 'int' : ret === 'u32' ? 'uint' : ret === 'v3' ? 'vec3' : ret} ${name}(${args.replace(/(\w+) : (\w+)/g, (_, n, t) => `${t === 'u32' ? 'uint' : t === 'i32' ? 'int' : t === 'f32' ? 'float' : t} ${n}`)}) {${body}}`
      : `fn ${name}(${args}) -> ${ret === 'v3' ? 'vec3<f32>' : ret} {${body}}`;
  const v3 = g ? 'vec3' : 'vec3<f32>';
  return [
    // The effect glyph for a weapon or decoy: its cell (atlas.ts EFFECTS order).
    fn('i32', 'effectCell', 'dom : u32, cls : u32', `
  if (dom == ${D_ROCKET}u) { return ${LAYOUT.effects + 1}; }
  if (dom == ${D_BOMB}u) { return select(${LAYOUT.effects + 2}, ${LAYOUT.effects + 3}, cls == ${C_GUIDED_BOMB}u); }
  if (dom == ${D_FLARE}u) { return ${LAYOUT.effects + 4}; }
  if (dom == ${D_CHAFF}u) { return ${LAYOUT.effects + 5}; }
  if (dom == ${D_MISC}u) { return ${LAYOUT.effects + 6}; }
  if (dom == ${D_SHELL}u) { return ${LAYOUT.effects + 7}; }
  return ${LAYOUT.effects};`),
    // A missile's body colour by its class: air-to-air white-blue, surface-to-air red-orange, air-to-ground amber, anti-ship green.
    fn('v3', 'weaponColour', 'dom : u32, cls : u32', `
  if (dom == ${D_BOMB}u) { return ${v3}(0.42, 0.42, 0.4); }
  if (dom == ${D_FLARE}u) { return ${v3}(1.0, 0.97, 0.85); }
  if (dom == ${D_CHAFF}u) { return ${v3}(0.82, 0.84, 0.87); }
  if (dom == ${D_MISC}u) { return ${v3}(0.6, 0.6, 0.6); }
  if (cls == ${C_AAM}u) { return ${v3}(0.85, 0.93, 1.0); }
  if (cls == ${C_SAM}u) { return ${v3}(1.0, 0.5, 0.3); }
  if (cls == ${C_AGM}u) { return ${v3}(1.0, 0.78, 0.32); }
  if (cls == ${C_SHIP}u) { return ${v3}(0.55, 1.0, 0.62); }
  return ${v3}(0.95, 0.95, 0.95);`),
    fn('v3', 'glowColour', 'dom : u32', `
  if (dom == ${D_FLARE}u) { return ${v3}(1.6, 1.35, 0.85); }
  if (dom == ${D_SHELL}u) { return ${v3}(1.4, 1.0, 0.45); }
  return ${v3}(1.5, 0.95, 0.45);`),
    // A frame's domain: air (open below), ground, sea, sub (open above).
    fn('u32', 'frameDomain', 'dom : u32', `
  if (dom >= 1u && dom <= ${D_ROCKET}u) { return 0u; }
  if (dom == ${D_SEA}u) { return 2u; }
  if (dom == ${D_SUB}u) { return 3u; }
  return 1u;`),
  ].join('\n');
}

const ATLAS = `const float ATLAS_W = ${f(ATLAS_WIDTH)}; const float ATLAS_H = ${f(ATLAS_HEIGHT)};`;

export function symbolGlslVs(): string {
  return `#version 300 es
precision highp float;
precision highp int;
layout(location = 4) in vec4 iOrigin;   // x, y, z, px (times uSign)
layout(location = 5) in vec4 iForward;  // x, y, z, alpha
layout(location = 6) in vec4 iUp;
layout(location = 7) in vec4 iTeam;     // r, g, b, -${WORD_BASE} - word
uniform mat4 uViewProj;
uniform vec4 uView;    // viewport px w, h, style, mode
uniform vec4 uOpt;     // heading ticks, sign of the size, -, -
uniform vec4 uCam;
uniform vec4 uSides[16];
out vec2 vUv;
flat out ivec2 vCells;   // frame, icon (-1: none)
flat out vec4 vFill;     // rgb, alpha of the fill (0: none)
flat out vec4 vLine;     // rgb, 1: shape-only patterns
flat out vec4 vGlow;     // rgb, alpha
flat out vec4 vHalo;     // rgb, alpha
flat out vec4 vTick;     // direction in the quad, on, alpha
uint select(uint a, uint b, bool c) { return c ? b : a; }
int select(int a, int b, bool c) { return c ? b : a; }
${common('glsl')}
void main() {
  int corner = gl_VertexID % 6;
  vec2 q = vec2(corner == 1 || corner == 2 || corner == 4 ? 1.0 : -1.0, corner == 2 || corner == 4 || corner == 5 ? 1.0 : -1.0);
  float px = iOrigin.w * uOpt.y;
  float alpha = iForward.w;
  vec4 clip = uViewProj * vec4(iOrigin.xyz, 1.0);
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  vUv = vec2(0.0);
  vCells = ivec2(-1);
  vFill = vec4(0.0); vLine = vec4(0.0); vGlow = vec4(0.0); vHalo = vec4(0.0); vTick = vec4(0.0);
  if (px <= 0.0 || alpha <= 0.002 || clip.w <= 0.0 || iTeam.w > -999.5) return;
  uint word = uint(-iTeam.w - 999.5);
  uint cls = word & 255u;
  uint team = (word >> 8u) & 255u;
  uint dom = (word >> 16u) & 15u;
  bool moving = (word & ${WORD_MOVING}u) != 0u;
  int style = int(uView.z);
  bool symbol = uView.w > 1.5;
  // The heading on screen: where a step along forward lands.
  float k = 0.01 * distance(iOrigin.xyz, uCam.xyz) + 0.01;
  vec4 clip2 = uViewProj * vec4(iOrigin.xyz + iForward.xyz * k, 1.0);
  vec2 dir = clip2.w > 0.0 ? (clip2.xy / clip2.w - clip.xy / clip.w) * uView.xy : vec2(0.0);
  float dl = length(dir);
  vec2 head = dl > 1e-4 ? dir / dl : vec2(0.0, 1.0);
  bool effect = dom >= ${D_FLARE}u && dom != 14u;
  bool weapon = dom >= ${D_MISSILE}u && dom <= ${D_ROCKET}u;
  bool natoMissile = symbol && dom == ${D_MISSILE}u && style != 2;
  bool turn = false;
  vec4 side = uSides[int(min(team, 15u))];
  vec3 dark = vec3(0.06);
  vHalo = vec4(0.97, 0.97, 0.95, 0.75);
  if (effect || (weapon && !natoMissile)) {
    vCells = ivec2(-1, effectCell(dom, cls));
    vFill = vec4(weaponColour(dom, cls), 1.0);
    vLine = vec4(dark, 0.0);
    vGlow = vec4(glowColour(dom), (dom == ${D_MISSILE}u || dom == ${D_ROCKET}u || dom == ${D_FLARE}u || dom == ${D_SHELL}u) ? 1.0 : 0.0);
    vHalo = dom == ${D_FLARE}u || dom == ${D_CHAFF}u ? vec4(0.0) : vec4(0.05, 0.05, 0.05, 0.55);
    turn = dl > 1e-4;
  } else if (style == 1) {
    vCells = ivec2(-1, ${LAYOUT.russianIcons} + int(cls));
    vLine = vec4(side.rgb, 0.0);
    turn = moving && dl > 1e-4;
  } else if (style == 2) {
    vCells = ivec2(-1, ${LAYOUT.mapGlyphs} + int(dom));
    vFill = vec4(abs(iTeam.rgb), 1.0);
    vLine = vec4(dark, 0.0);
    vHalo = vec4(0.0, 0.0, 0.0, 0.45);
    vTick = vec4(head, moving ? 1.0 : 0.0, 1.0);
  } else {
    int aff = int(side.a + 0.5);
    vCells = ivec2(${LAYOUT.natoFrames} + aff * 4 + int(frameDomain(dom)), ${LAYOUT.natoIcons} + int(cls));
    vFill = vec4(side.rgb, 1.0);
    vLine = vec4(dark, style == 3 ? 1.0 + float(aff) : 0.0);
    vTick = vec4(head, moving ? 1.0 : 0.0, 1.0);
  }
  if (uOpt.x < 0.5) vTick.z = 0.0;
  // A wreck (\`data/deaths.ts\`): its fill greyed and the frame crossed out, as APP-6 and MIL-STD-2525 mark destroyed (tick.z -1).
  if ((word & ${WORD_DEAD}u) != 0u && !effect && !weapon) {
    vFill.rgb = mix(vec3(0.4), vFill.rgb, 0.3);
    vTick.z = -1.0;
  }
  vGlow.a *= alpha; vFill.a *= alpha; vHalo.a *= alpha; vTick.w = alpha;
  // Turned glyphs: the cell's up along the heading; the rest stand upright.
  vec2 o = q * ${f(QUAD)};
  if (turn) { vec2 r = vec2(head.y, -head.x); o = r * o.x + head * o.y; }
  vUv = q * ${f(QUAD)};
  vec2 ndc = o * px / uView.xy;
  gl_Position = vec4(clip.xy + ndc * clip.w, 0.0, clip.w);
}
`;
}

export function symbolGlslFs(): string {
  return `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uAtlas;
in vec2 vUv;
flat in ivec2 vCells;
flat in vec4 vFill;
flat in vec4 vLine;
flat in vec4 vGlow;
flat in vec4 vHalo;
flat in vec4 vTick;
out vec4 o;
${ATLAS}
vec4 cell(int c, vec2 uv) {
  if (c < 0 || abs(uv.x) > 1.0 || abs(uv.y) > 1.0) return vec4(0.0);
  vec2 org = vec2(float(c % ${ATLAS_COLUMNS}), float(c / ${ATLAS_COLUMNS})) * ${f(CELL)};
  vec2 p = org + (vec2(uv.x, -uv.y) * 0.5 + 0.5) * ${f(CELL)};
  return textureLod(uAtlas, p / vec2(ATLAS_W, ATLAS_H), 0.0);
}
float seg(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  return length(p - a - ab * t);
}
void main() {
  vec4 s = max(cell(vCells.x, vUv), cell(vCells.y, vUv));
  float fill = s.r * vFill.a;
  float line = s.g * vTick.w;
  float halo = s.a;
  ${PATTERN_GLSL}
  // The heading tick: from the frame's edge out along the way it moves.
  float d = seg(vUv, vTick.xy * 0.68, vTick.xy * 1.42);
  float aa = fwidth(d);
  if (vTick.z > 0.5) {
    line = max(line, (1.0 - smoothstep(0.055 - aa, 0.055 + aa, d)) * vTick.w);
    halo = max(halo, 1.0 - smoothstep(0.13 - aa, 0.13 + aa, d));
  }
  // Destroyed: an X across the frame.
  float dx = min(seg(vUv, vec2(-0.82, -0.82), vec2(0.82, 0.82)), seg(vUv, vec2(-0.82, 0.82), vec2(0.82, -0.82)));
  float ax = fwidth(dx);
  if (vTick.z < -0.5) {
    line = max(line, (1.0 - smoothstep(0.07 - ax, 0.07 + ax, dx)) * vTick.w);
    halo = max(halo, 1.0 - smoothstep(0.16 - ax, 0.16 + ax, dx));
  }
  vec4 c = vec4(vHalo.rgb, 1.0) * halo * vHalo.a;
  c = c * (1.0 - fill) + vec4(vFill.rgb, 1.0) * fill;
  c = c * (1.0 - line) + vec4(vLine.rgb, 1.0) * line;
  c.rgb += vGlow.rgb * s.b * vGlow.a;
  if (c.a <= 0.002 && dot(c.rgb, vec3(1.0)) <= 0.002) discard;
  o = c;
}
`;
}

/** Shape-only style: the fill's pattern by affiliation (friend solid, hostile hatched, neutral empty, unknown dotted). */
const PATTERN_GLSL = `if (vLine.a > 0.5) {
    float aff = vLine.a - 1.0;
    float shade = 0.0;
    if (aff > 0.5 && aff < 1.5) shade = 0.45;
    else if (aff > 1.5 && aff < 2.5) shade = step(0.5, fract((vUv.x + vUv.y) * 4.0)) * 0.9;
    else if (aff < 0.5) shade = step(length(fract(vUv * 4.0) - 0.5), 0.18) * 0.9;
    line = max(line, s.r * shade * vTick.w);
    fill = s.r * 0.92 * vFill.a;
  }`;
const PATTERN_WGSL = `if (in.line.a > 0.5) {
    let aff = in.line.a - 1.0;
    var shade = 0.0;
    if (aff > 0.5 && aff < 1.5) { shade = 0.45; } else if (aff > 1.5 && aff < 2.5) { shade = step(0.5, fract((in.uv.x + in.uv.y) * 4.0)) * 0.9; } else if (aff < 0.5) { shade = step(length(fract(in.uv * 4.0) - 0.5), 0.18) * 0.9; }
    line = max(line, s.r * shade * in.tick.w);
    fill = s.r * 0.92 * in.fill.a;
  }`;

/** Premultiplied alpha: glows add, the rest blends over. */
export const SYMBOL_BLEND = { color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' } } as const;

export function symbolWgsl(): string {
  return /* wgsl */ `
struct SU {
  viewProj : mat4x4<f32>,
  view : vec4<f32>,   // viewport px w, h, style, mode
  opt : vec4<f32>,    // heading ticks, sign of the size
  cam : vec4<f32>,
  sides : array<vec4<f32>, 16>,
};
@group(0) @binding(0) var<uniform> u : SU;
@group(0) @binding(1) var atlas : texture_2d<f32>;
@group(0) @binding(2) var samp : sampler;

struct GOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) uv : vec2<f32>,
  @location(1) @interpolate(flat) cells : vec2<i32>,
  @location(2) @interpolate(flat) fill : vec4<f32>,
  @location(3) @interpolate(flat) line : vec4<f32>,
  @location(4) @interpolate(flat) glow : vec4<f32>,
  @location(5) @interpolate(flat) halo : vec4<f32>,
  @location(6) @interpolate(flat) tick : vec4<f32>,
};
${common('wgsl')}

@vertex
fn vsGlyph(@builtin(vertex_index) vi : u32, @location(4) origin : vec4<f32>, @location(5) forward : vec4<f32>, @location(6) upAxis : vec4<f32>, @location(7) team : vec4<f32>) -> GOut {
  var out : GOut;
  let corner = vi % 6u;
  let q = vec2<f32>(select(-1.0, 1.0, corner == 1u || corner == 2u || corner == 4u), select(-1.0, 1.0, corner == 2u || corner == 4u || corner == 5u));
  let px = origin.w * u.opt.y;
  let alpha = forward.w;
  let clip = u.viewProj * vec4<f32>(origin.xyz, 1.0);
  out.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  out.uv = vec2<f32>(0.0);
  out.cells = vec2<i32>(-1, -1);
  out.fill = vec4<f32>(0.0);
  out.line = vec4<f32>(0.0);
  out.glow = vec4<f32>(0.0);
  out.halo = vec4<f32>(0.0);
  out.tick = vec4<f32>(0.0);
  if (px <= 0.0 || alpha <= 0.002 || clip.w <= 0.0 || team.w > -999.5) { return out; }
  let word = u32(-team.w - 999.5);
  let cls = word & 255u;
  let tm = (word >> 8u) & 255u;
  let dom = (word >> 16u) & 15u;
  let moving = (word & ${WORD_MOVING}u) != 0u;
  let style = i32(u.view.z);
  let symbol = u.view.w > 1.5;
  let k = 0.01 * distance(origin.xyz, u.cam.xyz) + 0.01;
  let clip2 = u.viewProj * vec4<f32>(origin.xyz + forward.xyz * k, 1.0);
  var dir = vec2<f32>(0.0);
  if (clip2.w > 0.0) { dir = (clip2.xy / clip2.w - clip.xy / clip.w) * u.view.xy; }
  let dl = length(dir);
  var head = vec2<f32>(0.0, 1.0);
  if (dl > 1e-4) { head = dir / dl; }
  let effect = dom >= ${D_FLARE}u && dom != 14u;
  let weapon = dom >= ${D_MISSILE}u && dom <= ${D_ROCKET}u;
  let natoMissile = symbol && dom == ${D_MISSILE}u && style != 2;
  var turn = false;
  let side = u.sides[min(tm, 15u)];
  let dark = vec3<f32>(0.06);
  out.halo = vec4<f32>(0.97, 0.97, 0.95, 0.75);
  if (effect || (weapon && !natoMissile)) {
    out.cells = vec2<i32>(-1, effectCell(dom, cls));
    out.fill = vec4<f32>(weaponColour(dom, cls), 1.0);
    out.line = vec4<f32>(dark, 0.0);
    out.glow = vec4<f32>(glowColour(dom), select(0.0, 1.0, dom == ${D_MISSILE}u || dom == ${D_ROCKET}u || dom == ${D_FLARE}u || dom == ${D_SHELL}u));
    out.halo = select(vec4<f32>(0.05, 0.05, 0.05, 0.55), vec4<f32>(0.0), dom == ${D_FLARE}u || dom == ${D_CHAFF}u);
    turn = dl > 1e-4;
  } else if (style == 1) {
    out.cells = vec2<i32>(-1, ${LAYOUT.russianIcons} + i32(cls));
    out.line = vec4<f32>(side.rgb, 0.0);
    turn = moving && dl > 1e-4;
  } else if (style == 2) {
    out.cells = vec2<i32>(-1, ${LAYOUT.mapGlyphs} + i32(dom));
    out.fill = vec4<f32>(abs(team.rgb), 1.0);
    out.line = vec4<f32>(dark, 0.0);
    out.halo = vec4<f32>(0.0, 0.0, 0.0, 0.45);
    out.tick = vec4<f32>(head, select(0.0, 1.0, moving), 1.0);
  } else {
    let aff = i32(side.a + 0.5);
    out.cells = vec2<i32>(${LAYOUT.natoFrames} + aff * 4 + i32(frameDomain(dom)), ${LAYOUT.natoIcons} + i32(cls));
    out.fill = vec4<f32>(side.rgb, 1.0);
    out.line = vec4<f32>(dark, select(0.0, 1.0 + f32(aff), style == 3));
    out.tick = vec4<f32>(head, select(0.0, 1.0, moving), 1.0);
  }
  if (u.opt.x < 0.5) { out.tick.z = 0.0; }
  // A wreck (\`data/deaths.ts\`): its fill greyed and the frame crossed out, as APP-6 and MIL-STD-2525 mark destroyed (tick.z -1).
  if ((word & ${WORD_DEAD}u) != 0u && !effect && !weapon) {
    out.fill = vec4<f32>(mix(vec3<f32>(0.4), out.fill.rgb, 0.3), out.fill.a);
    out.tick.z = -1.0;
  }
  out.glow.a = out.glow.a * alpha;
  out.fill.a = out.fill.a * alpha;
  out.halo.a = out.halo.a * alpha;
  out.tick.w = alpha;
  var o = q * ${f(QUAD)};
  if (turn) { let r = vec2<f32>(head.y, -head.x); o = r * o.x + head * o.y; }
  out.uv = q * ${f(QUAD)};
  let ndc = o * px / u.view.xy;
  out.pos = vec4<f32>(clip.xy + ndc * clip.w, 0.0, clip.w);
  return out;
}

const ATLAS_W = ${f(ATLAS_WIDTH)};
const ATLAS_H = ${f(ATLAS_HEIGHT)};

fn cellAt(c : i32, uv : vec2<f32>) -> vec4<f32> {
  let org = vec2<f32>(f32(max(c, 0) % ${ATLAS_COLUMNS}), f32(max(c, 0) / ${ATLAS_COLUMNS})) * ${f(CELL)};
  let p = org + (vec2<f32>(clamp(uv.x, -1.0, 1.0), -clamp(uv.y, -1.0, 1.0)) * 0.5 + 0.5) * ${f(CELL)};
  let s = textureSampleLevel(atlas, samp, p / vec2<f32>(ATLAS_W, ATLAS_H), 0.0);
  if (c < 0 || abs(uv.x) > 1.0 || abs(uv.y) > 1.0) { return vec4<f32>(0.0); }
  return s;
}

fn seg(p : vec2<f32>, a : vec2<f32>, b : vec2<f32>) -> f32 {
  let ab = b - a;
  let t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
  return length(p - a - ab * t);
}

@fragment
fn fsGlyph(in : GOut) -> @location(0) vec4<f32> {
  let s = max(cellAt(in.cells.x, in.uv), cellAt(in.cells.y, in.uv));
  var fill = s.r * in.fill.a;
  var line = s.g * in.tick.w;
  var halo = s.a;
  ${PATTERN_WGSL}
  let dd = seg(in.uv, in.tick.xy * 0.68, in.tick.xy * 1.42);
  let aa = fwidth(dd);
  if (in.tick.z > 0.5) {
    line = max(line, (1.0 - smoothstep(0.055 - aa, 0.055 + aa, dd)) * in.tick.w);
    halo = max(halo, 1.0 - smoothstep(0.13 - aa, 0.13 + aa, dd));
  }
  // Destroyed: an X across the frame.
  let dx = min(seg(in.uv, vec2<f32>(-0.82, -0.82), vec2<f32>(0.82, 0.82)), seg(in.uv, vec2<f32>(-0.82, 0.82), vec2<f32>(0.82, -0.82)));
  let ax = fwidth(dx);
  if (in.tick.z < -0.5) {
    line = max(line, (1.0 - smoothstep(0.07 - ax, 0.07 + ax, dx)) * in.tick.w);
    halo = max(halo, 1.0 - smoothstep(0.16 - ax, 0.16 + ax, dx));
  }
  var c = vec4<f32>(in.halo.rgb, 1.0) * halo * in.halo.a;
  c = c * (1.0 - fill) + vec4<f32>(in.fill.rgb, 1.0) * fill;
  c = c * (1.0 - line) + vec4<f32>(in.line.rgb, 1.0) * line;
  c = vec4<f32>(c.rgb + in.glow.rgb * s.b * in.glow.a, c.a);
  if (c.a <= 0.002 && dot(c.rgb, vec3<f32>(1.0)) <= 0.002) { discard; }
  return c;
}
`;
}
