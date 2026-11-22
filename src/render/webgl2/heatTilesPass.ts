/**
 * Heat tiles into the heat target, WebGL2 (the WebGPU pass's twin,
 * `webgpu/heatTilesPass.ts`): a quad per tile, counts as density, added
 * one/one into the bound heat framebuffer; tiles in an R32F texture array,
 * at most UPLOADS_PER_FRAME new layers a frame. With the draw's `kernel`
 * the cells are drawn as the rows' sprites, and team colours come from a
 * second RGBA16F array, as the WebGPU pass describes.
 */

import { TEAM_LIGHTNESS } from '../colors';
import { KERNEL_MIN_CELLS, type HeatTileDraw } from '../heatTiles/source';
import { TILE } from '../heatTiles/tileFormat';
import { CURVE_LUT_SIZE } from '../../state/curve';

const LAYERS = 192;
/** Half-float RGBA layers, made the first time team colours draw. */
const LAYERS_RGBA = 160;
const UPLOADS_PER_FRAME = 6;
/** Cells each way a pixel reads at most (as the WebGPU pass). */
const KERNEL_TAPS = 5;

const VS = `#version 300 es
uniform mat4 uViewProj;
uniform float uGround;
uniform vec4 uRect;
uniform vec4 uUv;
uniform float uReach;
out vec2 vUv;
out float vDepth;
void main() {
  vec2 c = vec2(float(gl_VertexID == 1 || gl_VertexID == 4 || gl_VertexID == 5), float(gl_VertexID == 2 || gl_VertexID == 3 || gl_VertexID == 5));
  // The quad grown by the sprite's reach; the texture coordinates run on past the tile's edge.
  vec2 w = mix(uRect.xy - uReach, uRect.zw + uReach, c);
  vec2 f = (w - uRect.xy) / max(uRect.zw - uRect.xy, vec2(1e-20));
  gl_Position = uViewProj * vec4(w.x, uGround, w.y, 1.0);
  vUv = mix(uUv.xy, uUv.zw, f);
  vDepth = gl_Position.w;
}`;

const FS = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;
uniform sampler2DArray uTiles;
uniform int uLayer;
uniform float uK;
uniform vec4 uUv;
uniform float uCell;
uniform float uKernelOn, uPersp, uRadius, uMinPx, uMaxPx, uPpu, uCentre, uEdge, uFalloff, uSmooth, uKeepMass, uNeutralL;
uniform int uFour;
// The ramp's curve as the rows' splat reads it (centre at 0, rim at the end), linear between entries.
uniform float uUseCurve;
uniform sampler2D uCurve;
in vec2 vUv;
in float vDepth;
out vec4 outColor;
vec4 cell(ivec2 p) {
  vec4 v = texelFetch(uTiles, ivec3(clamp(p, ivec2(0), ivec2(${TILE - 1})), uLayer), 0);
  return uFour == 1 ? v : vec4(v.r, 0.0, 0.0, 0.0);
}
// Heat alone: neutral in a team colour target (uNeutralL is 0 for a one-channel one).
vec4 shade(vec4 v) { return uFour == 1 ? v : vec4(v.r, 0.0, 0.0, v.r * uNeutralL); }
float ramp(float d) {
  float t;
  if (uUseCurve > 0.5) {
    float f = clamp(d, 0.0, 1.0) * ${CURVE_LUT_SIZE - 1}.0;
    int i = int(floor(f));
    t = mix(texelFetch(uCurve, ivec2(i, 0), 0).r, texelFetch(uCurve, ivec2(min(i + 1, ${CURVE_LUT_SIZE - 1}), 0), 0).r, f - floor(f));
  } else {
    t = pow(1.0 - d, uFalloff);
    if (uSmooth > 0.5) t = smoothstep(0.0, 1.0, t);
  }
  return mix(uEdge, uCentre, t);
}
void main() {
  vec2 p = vUv * ${TILE}.0;
  if (uKernelOn < 0.5) {
    vec2 pb = p - 0.5;
    vec2 b = floor(pb);
    vec2 f = pb - b;
    ivec2 q = ivec2(b);
    vec4 v = mix(mix(cell(q), cell(q + ivec2(1, 0)), f.x), mix(cell(q + ivec2(0, 1)), cell(q + ivec2(1, 1)), f.x), f.y);
    outColor = shade(v * uK);
    return;
  }
  float w = uPersp > 0.5 ? max(vDepth, 1e-6) : 1.0;
  float px = uRadius * uPpu / w;
  px = max(uMinPx, uMaxPx > 0.0 ? min(px, uMaxPx) : px);
  float rW = px * w / max(uPpu, 1e-20);
  float rEff = max(rW, ${KERNEL_MIN_CELLS} * uCell);
  float kept = (uKeepMass > 0.5 ? uRadius : rW) / rEff;
  float rTex = rEff / max(uCell, 1e-20);
  int n = min(int(ceil(rTex)), ${KERNEL_TAPS});
  ivec2 lo = ivec2(round(min(uUv.xy, uUv.zw) * ${TILE}.0));
  ivec2 hi = ivec2(round(max(uUv.xy, uUv.zw) * ${TILE}.0));
  ivec2 base = ivec2(floor(p));
  vec4 acc = vec4(0.0);
  for (int dy = -${KERNEL_TAPS}; dy <= ${KERNEL_TAPS}; dy++) {
    if (dy < -n || dy > n) continue;
    for (int dx = -${KERNEL_TAPS}; dx <= ${KERNEL_TAPS}; dx++) {
      if (dx < -n || dx > n) continue;
      ivec2 q = base + ivec2(dx, dy);
      if (q.x < lo.x || q.y < lo.y || q.x >= hi.x || q.y >= hi.y) continue;
      float d = length(p - (vec2(q) + 0.5)) / rTex;
      if (d >= 1.0) continue;
      acc += cell(q) * ramp(d);
    }
  }
  outColor = shade(acc * (uK * kept * kept));
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`heat tiles shader: ${gl.getShaderInfoLog(s)}`);
  return s;
}

/** One texture array of tile layers: heat (R32F) or team colours (RGBA16F). */
interface Bank {
  tex: WebGLTexture;
  four: boolean;
  layerOf: Map<string, { layer: number; used: number; data: ArrayBufferView }>;
  free: number[];
}

export class GlHeatTiles {
  private readonly prog: WebGLProgram;
  private readonly heat: Bank;
  private rgba: Bank | null = null;
  private readonly vao: WebGLVertexArrayObject;
  private readonly loc: Record<string, WebGLUniformLocation | null>;
  private frame = 0;

  constructor(private readonly gl: WebGL2RenderingContext) {
    const p = gl.createProgram()!;
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`heat tiles program: ${gl.getProgramInfoLog(p)}`);
    this.prog = p;
    this.loc = Object.fromEntries(['uViewProj', 'uGround', 'uRect', 'uUv', 'uTiles', 'uLayer', 'uK', 'uReach', 'uCell', 'uKernelOn', 'uPersp', 'uRadius', 'uMinPx', 'uMaxPx', 'uPpu', 'uCentre', 'uEdge', 'uFalloff', 'uSmooth', 'uKeepMass', 'uNeutralL', 'uFour', 'uUseCurve', 'uCurve'].map((n) => [n, gl.getUniformLocation(p, n)]));
    this.heat = this.bank(false, LAYERS);
    this.vao = gl.createVertexArray()!;
    this.curve = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.curve);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.R32F, CURVE_LUT_SIZE, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  private readonly curve: WebGLTexture;
  private curveKey = '';

  private bank(four: boolean, layers: number): Bank {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, four ? gl.RGBA16F : gl.R32F, TILE, TILE, layers);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    const free: number[] = [];
    for (let i = layers - 1; i >= 0; i--) free.push(i);
    return { tex, four, layerOf: new Map(), free };
  }

  private layerFor(b: Bank, key: string, data: ArrayBufferView, budget: { left: number }): number | null {
    const gl = this.gl;
    const hit = b.layerOf.get(key);
    if (hit && hit.data === data) {
      hit.used = this.frame;
      return hit.layer;
    }
    if (budget.left <= 0) return null;
    let layer: number;
    if (hit) layer = hit.layer;
    else if (b.free.length > 0) layer = b.free.pop()!;
    else {
      let oldK = '';
      let old = Infinity;
      for (const [k, v] of b.layerOf) if (v.used < old && v.used < this.frame) [oldK, old] = [k, v.used];
      if (!oldK) return null;
      layer = b.layerOf.get(oldK)!.layer;
      b.layerOf.delete(oldK);
    }
    budget.left--;
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, b.tex);
    if (b.four) gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, TILE, TILE, 1, gl.RGBA, gl.HALF_FLOAT, data);
    else gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, TILE, TILE, 1, gl.RED, gl.FLOAT, data);
    b.layerOf.set(key, { layer, used: this.frame, data });
    return layer;
  }

  /** Draws into the bound framebuffer (viewport set; `fourTarget` when it holds team colours); leaves blending off. */
  draw(d: HeatTileDraw & { uploadsPending?: boolean }, viewProj: Float32Array, fourTarget: boolean): void {
    const gl = this.gl;
    this.frame++;
    d.uploadsPending = false;
    if (d.tiles.length === 0 || d.scale === 0) return;
    const budget = { left: UPLOADS_PER_FRAME };
    const four = d.components === 4;
    const bank = four ? (this.rgba ??= this.bank(true, LAYERS_RGBA)) : this.heat;
    gl.useProgram(this.prog);
    gl.uniform1i(this.loc.uFour, four ? 1 : 0);
    gl.uniform1f(this.loc.uNeutralL, fourTarget ? TEAM_LIGHTNESS : 0);
    gl.bindVertexArray(this.vao);
    gl.uniformMatrix4fv(this.loc.uViewProj, false, viewProj);
    gl.uniform1f(this.loc.uGround, d.ground);
    const k = d.kernel;
    gl.uniform1f(this.loc.uKernelOn, k ? 1 : 0);
    if (k) {
      gl.uniform1f(this.loc.uPersp, k.perspective ? 1 : 0);
      gl.uniform1f(this.loc.uRadius, k.radius);
      gl.uniform1f(this.loc.uMinPx, k.minPx);
      gl.uniform1f(this.loc.uMaxPx, k.maxPx);
      gl.uniform1f(this.loc.uPpu, k.pxPerUnit);
      gl.uniform1f(this.loc.uCentre, k.centre);
      gl.uniform1f(this.loc.uEdge, k.edge);
      gl.uniform1f(this.loc.uFalloff, Math.max(0.01, k.falloff));
      gl.uniform1f(this.loc.uSmooth, k.smoothRamp ? 1 : 0);
      gl.uniform1f(this.loc.uKeepMass, k.keepMass ? 1 : 0);
    }
    const curve = !!k?.curve && k.curve.length === CURVE_LUT_SIZE;
    gl.uniform1f(this.loc.uUseCurve, curve ? 1 : 0);
    gl.activeTexture(gl.TEXTURE1);
    // Put back after: the renderer's own passes may count on what unit 1 holds (a state query, no GPU wait).
    const unit1 = gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture | null;
    gl.bindTexture(gl.TEXTURE_2D, this.curve);
    if (curve && k!.curveKey !== this.curveKey) {
      this.curveKey = k!.curveKey ?? '';
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, CURVE_LUT_SIZE, 1, gl.RED, gl.FLOAT, k!.curve!);
    }
    gl.uniform1i(this.loc.uCurve, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.loc.uTiles, 0);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    for (const t of d.tiles) {
      const texels = four ? t.rgba : t.counts;
      if (!texels) continue;
      const layer = this.layerFor(bank, t.key, texels, budget);
      if (layer === null) {
        d.uploadsPending = true;
        continue;
      }
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, bank.tex);
      gl.uniform4fv(this.loc.uRect, t.rect);
      gl.uniform4fv(this.loc.uUv, t.uv);
      gl.uniform1i(this.loc.uLayer, layer);
      // With the kernel a cell's count is its rows' heat; without, density. Team colour layers are scaled to 1.
      gl.uniform1f(this.loc.uK, (k ? 1 : t.perCount) * (four ? t.amp : 1) * d.scale);
      gl.uniform1f(this.loc.uCell, t.cell);
      gl.uniform1f(this.loc.uReach, k ? t.reach : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, unit1);
    gl.activeTexture(gl.TEXTURE0);
  }

  dispose(): void {
    this.gl.deleteTexture(this.heat.tex);
    if (this.rgba) this.gl.deleteTexture(this.rgba.tex);
    this.gl.deleteProgram(this.prog);
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteTexture(this.curve);
  }
}
