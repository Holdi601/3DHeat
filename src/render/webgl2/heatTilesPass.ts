/**
 * Heat tiles into the heat target, WebGL2 (the WebGPU pass's twin,
 * `webgpu/heatTilesPass.ts`): a quad per tile, counts as density, added
 * one/one into the bound heat framebuffer; tiles in an R32F texture array,
 * at most UPLOADS_PER_FRAME new layers a frame.
 */

import type { HeatTileDraw } from '../heatTiles/source';
import { TILE } from '../heatTiles/tileFormat';

const LAYERS = 192;
const UPLOADS_PER_FRAME = 6;

const VS = `#version 300 es
uniform mat4 uViewProj;
uniform float uGround;
uniform vec4 uRect;
uniform vec4 uUv;
out vec2 vUv;
void main() {
  vec2 c = vec2(float(gl_VertexID == 1 || gl_VertexID == 4 || gl_VertexID == 5), float(gl_VertexID == 2 || gl_VertexID == 3 || gl_VertexID == 5));
  gl_Position = uViewProj * vec4(mix(uRect.x, uRect.z, c.x), uGround, mix(uRect.y, uRect.w, c.y), 1.0);
  vUv = vec2(mix(uUv.x, uUv.z, c.x), mix(uUv.y, uUv.w, c.y));
}`;

const FS = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2DArray;
uniform sampler2DArray uTiles;
uniform int uLayer;
uniform float uK;
in vec2 vUv;
out vec4 outColor;
float cell(ivec2 p) { return texelFetch(uTiles, ivec3(clamp(p, ivec2(0), ivec2(${TILE - 1})), uLayer), 0).r; }
void main() {
  vec2 p = vUv * ${TILE}.0 - 0.5;
  vec2 b = floor(p);
  vec2 f = p - b;
  ivec2 q = ivec2(b);
  float v = mix(mix(cell(q), cell(q + ivec2(1, 0)), f.x), mix(cell(q + ivec2(0, 1)), cell(q + ivec2(1, 1)), f.x), f.y);
  outColor = vec4(v * uK, 0.0, 0.0, 0.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`heat tiles shader: ${gl.getShaderInfoLog(s)}`);
  return s;
}

export class GlHeatTiles {
  private readonly prog: WebGLProgram;
  private readonly tex: WebGLTexture;
  private readonly vao: WebGLVertexArrayObject;
  private readonly loc: Record<string, WebGLUniformLocation | null>;
  private readonly layerOf = new Map<string, { layer: number; used: number; counts: Float32Array }>();
  private readonly free: number[] = [];
  private frame = 0;

  constructor(private readonly gl: WebGL2RenderingContext) {
    const p = gl.createProgram()!;
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`heat tiles program: ${gl.getProgramInfoLog(p)}`);
    this.prog = p;
    this.loc = Object.fromEntries(['uViewProj', 'uGround', 'uRect', 'uUv', 'uTiles', 'uLayer', 'uK'].map((n) => [n, gl.getUniformLocation(p, n)]));
    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.tex);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.R32F, TILE, TILE, LAYERS);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    this.vao = gl.createVertexArray()!;
    for (let i = LAYERS - 1; i >= 0; i--) this.free.push(i);
  }

  private layerFor(key: string, counts: Float32Array, budget: { left: number }): number | null {
    const gl = this.gl;
    const hit = this.layerOf.get(key);
    if (hit && hit.counts === counts) {
      hit.used = this.frame;
      return hit.layer;
    }
    if (budget.left <= 0) return null;
    let layer: number;
    if (hit) layer = hit.layer;
    else if (this.free.length > 0) layer = this.free.pop()!;
    else {
      let oldK = '';
      let old = Infinity;
      for (const [k, v] of this.layerOf) if (v.used < old && v.used < this.frame) [oldK, old] = [k, v.used];
      if (!oldK) return null;
      layer = this.layerOf.get(oldK)!.layer;
      this.layerOf.delete(oldK);
    }
    budget.left--;
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.tex);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, TILE, TILE, 1, gl.RED, gl.FLOAT, counts);
    this.layerOf.set(key, { layer, used: this.frame, counts });
    return layer;
  }

  /** Draws into the bound framebuffer (viewport set); leaves blending off. */
  draw(d: HeatTileDraw & { uploadsPending?: boolean }, viewProj: Float32Array): void {
    const gl = this.gl;
    this.frame++;
    d.uploadsPending = false;
    if (d.tiles.length === 0 || d.scale === 0) return;
    const budget = { left: UPLOADS_PER_FRAME };
    gl.useProgram(this.prog);
    gl.bindVertexArray(this.vao);
    gl.uniformMatrix4fv(this.loc.uViewProj, false, viewProj);
    gl.uniform1f(this.loc.uGround, d.ground);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.loc.uTiles, 0);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    for (const t of d.tiles) {
      const layer = this.layerFor(t.key, t.counts, budget);
      if (layer === null) {
        d.uploadsPending = true;
        continue;
      }
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.tex);
      gl.uniform4fv(this.loc.uRect, t.rect);
      gl.uniform4fv(this.loc.uUv, t.uv);
      gl.uniform1i(this.loc.uLayer, layer);
      gl.uniform1f(this.loc.uK, t.perCount * d.scale);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
  }

  dispose(): void {
    this.gl.deleteTexture(this.tex);
    this.gl.deleteProgram(this.prog);
    this.gl.deleteVertexArray(this.vao);
  }
}
