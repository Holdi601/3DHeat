/**
 * The GPU tracks in the WebGL2 renderer: the store's tracks and keys uploaded
 * once as integer textures; each frame one transform-feedback pass places
 * every unit at the playhead (`gpuTracks/glsl.ts`) into an instance buffer,
 * which one instanced draw shows as darts; the few units big enough to be
 * figures are placed on the CPU (`gpuTracks/near.ts`) and drawn as figure
 * batches; then the weapons' streaks and the death markers, each one
 * instanced draw. The CPU does nothing per unit beyond a box test.
 */

import { INSTANCE_STRIDE, MESH_STRIDE } from '../../figures/instances';
import { figureGlslVs } from '../figureShaders';
import { EVAL_GLSL_FS, EVAL_GLSL_VS, MARK_GLSL_VS, STREAK_GLSL_VS, TRAIL_GLSL_VS, TRAIL_SEGMENTS_GL } from '../gpuTracks/glsl';
import { nearFigures } from '../gpuTracks/near';
import { sameKeys, type GpuTrackStore } from '../gpuTracks/store';
import type { GpuTracksParams, SymbolParams } from '../types';
import type { GlSymbols } from './symbols';
import { dartMesh } from '../symbols/darts';

/** Every domain's dart in one mesh: each feedback row keeps its own shape (`symbols/darts.ts`). */
const DART_ALL = dartMesh();
import type { GlFigures } from './figures';
import { compileProgram, GlError, UniformCache } from './glutil';
import { LINE_FS } from './shaders';

/** Pixels across a death's marker. */
const MARKER_PX = 9;

interface Uploaded {
  store: GpuTrackStore;
  width: number;
  tracks: WebGLTexture;
  keysA: WebGLTexture;
  keysB: WebGLTexture;
  vis: WebGLTexture;
  visSent: Uint32Array | null | undefined;
  instances: WebGLBuffer;
  dartBuf: WebGLBuffer;
  dartVao: WebGLVertexArrayObject;
  streakVao: WebGLVertexArrayObject;
  marks: WebGLBuffer | null;
  markVao: WebGLVertexArrayObject | null;
  bytes: number;
}

export class GlTracks {
  private readonly evalProg: WebGLProgram;
  private readonly evalU: UniformCache;
  private readonly dartProg: WebGLProgram;
  private readonly dartU: UniformCache;
  private readonly streakProg: WebGLProgram;
  private readonly streakU: UniformCache;
  private readonly markProg: WebGLProgram;
  private readonly markU: UniformCache;
  private readonly trailProg: WebGLProgram;
  private readonly trailU: UniformCache;
  private readonly emptyVao: WebGLVertexArrayObject;
  private readonly tf: WebGLTransformFeedback;
  private up: Uploaded | null = null;
  bytes = 0;

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.evalProg = this.feedbackProgram();
    this.evalU = new UniformCache(gl, this.evalProg);
    this.dartProg = compileProgram(gl, figureGlslVs(), LINE_FS, 'track darts');
    this.dartU = new UniformCache(gl, this.dartProg);
    this.streakProg = compileProgram(gl, STREAK_GLSL_VS, LINE_FS, 'track streaks');
    this.streakU = new UniformCache(gl, this.streakProg);
    this.markProg = compileProgram(gl, MARK_GLSL_VS, LINE_FS, 'track marks');
    this.markU = new UniformCache(gl, this.markProg);
    this.trailProg = compileProgram(gl, TRAIL_GLSL_VS, LINE_FS, 'track trails');
    this.trailU = new UniformCache(gl, this.trailProg);
    this.emptyVao = gl.createVertexArray()!;
    this.tf = gl.createTransformFeedback()!;
  }

  /** Most keys the textures hold: a square of the largest texture. */
  static maxBytes(gl: WebGL2RenderingContext): number {
    const side = Math.min(16384, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
    return side * side * 8;
  }

  private feedbackProgram(): WebGLProgram {
    const gl = this.gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new GlError(`track eval: ${gl.getShaderInfoLog(s)}`);
      return s;
    };
    const p = gl.createProgram()!;
    const vs = sh(gl.VERTEX_SHADER, EVAL_GLSL_VS);
    const fs = sh(gl.FRAGMENT_SHADER, EVAL_GLSL_FS);
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.transformFeedbackVaryings(p, ['oOrigin', 'oForward', 'oUp', 'oTeam'], gl.INTERLEAVED_ATTRIBS);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new GlError(`track eval link: ${gl.getProgramInfoLog(p)}`);
    return p;
  }

  /** An integer texture `width` wide holding `data` (`comps` u32 a texel), its last row padded. */
  private texture(data: Uint32Array, comps: 1 | 2 | 4, width: number): WebGLTexture {
    const gl = this.gl;
    const texels = Math.max(1, Math.ceil(data.length / comps));
    const h = Math.max(1, Math.ceil(texels / width));
    const fmt = comps === 1 ? [gl.R32UI, gl.RED_INTEGER] : comps === 2 ? [gl.RG32UI, gl.RG_INTEGER] : [gl.RGBA32UI, gl.RGBA_INTEGER];
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, fmt[0], width, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    const full = Math.floor(texels / width);
    // Whole rows straight from the data, a few hundred at a time; the last, part-filled row from a padded copy.
    for (let y = 0; y < full; y += 512) {
      const rows = Math.min(512, full - y);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, y, width, rows, fmt[1], gl.UNSIGNED_INT, data.subarray(y * width * comps, (y + rows) * width * comps));
    }
    const rest = data.length - full * width * comps;
    if (rest > 0 || data.length === 0) {
      const row = new Uint32Array(width * comps);
      row.set(data.subarray(full * width * comps));
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, full, width, 1, fmt[1], gl.UNSIGNED_INT, row);
    }
    return tex;
  }

  /** The deaths into `buf`: x, y, z, time and the colour, 20 bytes each. */
  private markBuffer(s: GpuTrackStore, buf: WebGLBuffer): WebGLBuffer {
    const gl = this.gl;
    const mk = s.markers!;
    const data = new ArrayBuffer(mk.count * 20);
    const f = new Float32Array(data);
    const u = new Uint32Array(data);
    for (let i = 0; i < mk.count; i++) {
      f.set(mk.data.subarray(i * 4, i * 4 + 4), i * 5);
      u[i * 5 + 4] = mk.colour[i];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buf;
  }

  private upload(s: GpuTrackStore): Uploaded {
    const gl = this.gl;
    const width = Math.min(16384, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number);
    // The tracks with their chunk spans after them.
    const tracks = this.texture(s.trackData, 4, width);
    const keysA = this.texture(s.keysA, 2, width);
    const keysB = this.texture(s.keysB.length ? s.keysB : new Uint32Array(1), 1, width);
    const vis = this.texture(new Uint32Array(Math.max(1, Math.ceil(s.tracks / 32))), 1, width);
    const instances = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    gl.bufferData(gl.ARRAY_BUFFER, Math.max(1, s.tracks) * INSTANCE_STRIDE * 4, gl.DYNAMIC_COPY);
    // The darts, their instances straight from the feedback buffer.
    const dart = DART_ALL;
    const dartBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, dartBuf);
    gl.bufferData(gl.ARRAY_BUFFER, dart.data, gl.STATIC_DRAW);
    const dartVao = gl.createVertexArray()!;
    gl.bindVertexArray(dartVao);
    const M = MESH_STRIDE * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, M, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, M, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, M, 28);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, M, 44);
    // The movement floats: the darts' shape is in the last (`symbols/darts.ts`).
    for (let k = 0; k < 3; k++) {
      gl.enableVertexAttribArray(8 + k);
      gl.vertexAttribPointer(8 + k, 4, gl.FLOAT, false, M, 48 + k * 16);
    }
    const instanceAttrs = () => {
      gl.bindBuffer(gl.ARRAY_BUFFER, instances);
      for (let k = 0; k < 4; k++) {
        gl.enableVertexAttribArray(4 + k);
        gl.vertexAttribPointer(4 + k, 4, gl.FLOAT, false, INSTANCE_STRIDE * 4, k * 16);
        gl.vertexAttribDivisor(4 + k, 1);
      }
    };
    instanceAttrs();
    const streakVao = gl.createVertexArray()!;
    gl.bindVertexArray(streakVao);
    instanceAttrs();
    let marks: WebGLBuffer | null = null;
    let markVao: WebGLVertexArrayObject | null = null;
    const mk = s.markers;
    if (mk && mk.count) {
      marks = this.markBuffer(s, gl.createBuffer()!);
      markVao = gl.createVertexArray()!;
      gl.bindVertexArray(markVao);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 20, 0);
      gl.vertexAttribDivisor(0, 1);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, true, 20, 16);
      gl.vertexAttribDivisor(1, 1);
    }
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    const bytes = s.trackData.byteLength + s.keysA.byteLength + s.keysB.byteLength + s.tracks * INSTANCE_STRIDE * 4 + (mk?.count ?? 0) * 20;
    return { store: s, width, tracks, keysA, keysB, vis, visSent: undefined, instances, dartBuf, dartVao, streakVao, marks, markVao, bytes };
  }

  private release(): void {
    const u = this.up;
    if (!u) return;
    const gl = this.gl;
    for (const t of [u.tracks, u.keysA, u.keysB, u.vis]) gl.deleteTexture(t);
    for (const b of [u.instances, u.dartBuf, u.marks]) if (b) gl.deleteBuffer(b);
    for (const v of [u.dartVao, u.streakVao, u.markVao]) if (v) gl.deleteVertexArray(v);
    this.up = null;
    this.bytes = 0;
  }

  /** Places and draws every unit; `figures` draws the ones near enough to be figures. */
  /** `rel` is the view relative to a point by the camera, which the near figures are drawn in (FrameParams.viewProjRel). */
  draw(p: GpuTracksParams, viewProj: Float32Array, camera: ArrayLike<number>, figures: GlFigures, rel: { viewProj: Float32Array; camera: ArrayLike<number>; origin: ArrayLike<number> }): void {
    const gl = this.gl;
    const s = p.store;
    if (this.up && this.up.store !== s && sameKeys(this.up.store, s)) {
      // Recoloured: only the tracks' table again (the markers' colours with it), not the keys.
      gl.deleteTexture(this.up.tracks);
      this.up.tracks = this.texture(s.trackData, 4, this.up.width);
      if (this.up.marks && s.markers) this.up.marks = this.markBuffer(s, this.up.marks);
      this.up.store = s;
    }
    if (!this.up || this.up.store !== s) {
      this.release();
      this.up = this.upload(s);
      this.bytes = this.up.bytes;
    }
    const up = this.up;
    const visible = p.visible ?? null;
    if (visible && visible !== up.visSent) {
      gl.bindTexture(gl.TEXTURE_2D, up.vis);
      const words = new Uint32Array(Math.ceil(visible.length / up.width) * up.width);
      words.set(visible);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, up.width, words.length / up.width, gl.RED_INTEGER, gl.UNSIGNED_INT, words);
    }
    up.visSent = visible;
    const weapons = p.weapons ?? 1.5;

    // Every unit placed, into the instance buffer.
    gl.useProgram(this.evalProg);
    const tex = [up.tracks, up.keysA, up.keysB, up.vis];
    const names = ['uTracks', 'uKeysA', 'uKeysB', 'uVis'];
    for (let k = 0; k < 4; k++) {
      gl.activeTexture(gl.TEXTURE0 + k);
      gl.bindTexture(gl.TEXTURE_2D, tex[k]);
      this.evalU.i1(names[k], k);
    }
    gl.activeTexture(gl.TEXTURE0);
    const U = this.evalU;
    U.i1('uW', up.width);
    U.mat4('uViewProj', viewProj);
    gl.uniform4f(U.loc('uCam'), camera[0], camera[1], camera[2], p.t);
    gl.uniform1f(U.loc('uTLo'), p.t - Math.fround(p.t));
    gl.uniform4f(U.loc('uPx'), p.focalPx, p.orthoPx, p.minPixels, p.stale);
    gl.uniform4f(U.loc('uLod'), s.units, p.scale, p.fullPx, p.dartPx);
    gl.uniform4f(U.loc('uOpt'), weapons > 0 ? weapons : -1, visible ? 0 : 1, 0, 0);
    gl.uniform4f(U.loc('uSym'), p.farMode ?? 0, p.symbolThreshold ?? 36, p.symbolPx ?? 28, 0);
    gl.bindVertexArray(this.emptyVao);
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.tf);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, up.instances);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, s.tracks);
    gl.endTransformFeedback();
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.disable(gl.RASTERIZER_DISCARD);

    // Darts.
    gl.useProgram(this.dartProg);
    this.dartU.mat4('uViewProj', viewProj);
    this.dartU.f3('uCameraPos', camera[0], camera[1], camera[2]);
    this.dartU.f1('uFadeStart', 1e9);
    this.dartU.f1('uFadeEnd', 1e9 + 1);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(true);
    gl.bindVertexArray(up.dartVao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, DART_ALL.count, s.tracks);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);

    // The figures, near enough to be more than darts.
    const near = nearFigures(s, { t: p.t, viewProj, camera, focalPx: p.focalPx, orthoPx: p.orthoPx, minPixels: p.minPixels, stale: p.stale, scale: p.scale, fullPx: p.fullPx, dartPx: p.dartPx, visible, noWeapons: weapons <= 0, farMode: p.farMode ?? 0, symbolThreshold: p.symbolThreshold ?? 36, origin: rel.origin });
    if (near.length) figures.draw(near, rel.viewProj, rel.camera);

    // Weapons' streaks and the deaths, as lines over the figures.
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    if (weapons > 0) {
      gl.useProgram(this.streakProg);
      this.streakU.mat4('uViewProj', viewProj);
      this.streakU.f1('uStreak', weapons);
      this.streakU.f3('uCameraPos', camera[0], camera[1], camera[2]);
      this.streakU.f1('uFadeStart', 1e9);
      this.streakU.f1('uFadeEnd', 1e9 + 1);
      gl.bindVertexArray(up.streakVao);
      gl.drawArraysInstanced(gl.LINES, 0, 2, s.tracks);
    }
    // Trails and drop lines (as the WebGPU place shader writes them), from the placed instances.
    const drop = p.dropFloor ?? null;
    if (p.trailSeconds > 0 || drop !== null) {
      gl.useProgram(this.trailProg);
      const T = this.trailU;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, up.tracks);
      T.i1('uTracks', 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, up.keysA);
      T.i1('uKeysA', 1);
      gl.activeTexture(gl.TEXTURE0);
      T.i1('uW', up.width);
      T.mat4('uViewProj', viewProj);
      gl.uniform4f(T.loc('uCam'), camera[0], camera[1], camera[2], p.t);
      gl.uniform1f(T.loc('uTLo'), p.t - Math.fround(p.t));
      gl.uniform4f(T.loc('uTrail'), p.trailSeconds, drop === null ? 0 : 1, drop ?? 0, TRAIL_SEGMENTS_GL);
      gl.uniform1f(T.loc('uDropWeapons'), p.weaponDrops ? 1 : 0);
      T.f3('uCameraPos', camera[0], camera[1], camera[2]);
      T.f1('uFadeStart', 1e9);
      T.f1('uFadeEnd', 1e9 + 1);
      gl.bindVertexArray(up.streakVao);
      gl.drawArraysInstanced(gl.LINES, 0, (TRAIL_SEGMENTS_GL + 1) * 2, s.tracks);
    }
    const markSeconds = p.markerSeconds ?? 0;
    if (up.markVao && markSeconds > 0 && s.markers) {
      gl.useProgram(this.markProg);
      this.markU.mat4('uViewProj', viewProj);
      gl.uniform4f(this.markU.loc('uCam'), camera[0], camera[1], camera[2], p.t);
      gl.uniform4f(this.markU.loc('uMark'), markSeconds, MARKER_PX, p.focalPx, p.orthoPx);
      this.markU.f3('uCameraPos', camera[0], camera[1], camera[2]);
      this.markU.f1('uFadeStart', 1e9);
      this.markU.f1('uFadeEnd', 1e9 + 1);
      gl.bindVertexArray(up.markVao);
      gl.drawArraysInstanced(gl.LINES, 0, 6, s.markers.count);
    }
    gl.bindVertexArray(null);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  /** The glyphs (symbols, weapons, decoys) from this frame's placed rows: one instanced quad draw. */
  drawGlyphs(glyphs: GlSymbols, sp: SymbolParams, viewProj: Float32Array, camera: ArrayLike<number>, w: number, h: number): void {
    const up = this.up;
    if (!up) return;
    glyphs.drawFrom(up.streakVao, up.store.tracks, -1, sp, viewProj, camera, w, h);
  }

  dispose(): void {
    this.release();
    const gl = this.gl;
    for (const p of [this.evalProg, this.dartProg, this.streakProg, this.markProg, this.trailProg]) gl.deleteProgram(p);
    gl.deleteVertexArray(this.emptyVao);
    gl.deleteTransformFeedback(this.tf);
  }
}
