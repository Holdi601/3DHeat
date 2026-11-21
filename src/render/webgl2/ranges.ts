/**
 * The engagement ranges in WebGL2 (`ranges/`): the units' views taken from
 * the level into a depth array (a few faces a frame, `ViewshedPlan`), the
 * ground they see shaded, and the shells drawn over the scene, cut by them.
 * Nothing is read back.
 */

import type { Bounds } from '../../state/types';
import type { FrameParams, RangeDraw } from '../types';
import { CLIP_NEGATIVE_ONE_TO_ONE, CLIP_LOWER_LEFT, CLIP_ZERO_TO_ONE, compileProgram, UniformCache, type ClipControl } from './glutil';
import { SHELL_FLOATS, shellMesh } from '../../ranges/shells';
import { SHELL_GLSL_FS, SHELL_GLSL_VS } from '../../ranges/shellShaders';
import { CAPTURE_GLSL_FS, CAPTURE_GLSL_VS, FACES, GROUND_GLSL_FS, GROUND_GLSL_VS, MAX_VIEWS, VIEW_FACE, VIEW_LAYERS } from '../../ranges/viewshedShaders';
import { ViewshedPlan, type RangeView } from '../../ranges/viewshed';

/** What a level mesh needs to be drawn into a view: its positions (24-byte stride) and index sets. */
export interface RangeMesh {
  vbo: WebGLBuffer;
  groundIbo: WebGLBuffer | null;
  structIbo: WebGLBuffer | null;
  groundCount: number;
  structCount: number;
  bounds: Bounds | null;
}

/** The texture unit the views' depth is read from. */
const VIEW_UNIT = 7;

/** Whether a box comes within `r` of a point. */
export function boxNear(b: Bounds | null, p: ArrayLike<number>, r: number): boolean {
  if (!b) return true;
  const dx = Math.max(b.minX - p[0], 0, p[0] - b.maxX);
  const dy = Math.max(b.minY - p[1], 0, p[1] - b.maxY);
  const dz = Math.max(b.minZ - p[2], 0, p[2] - b.maxZ);
  return dx * dx + dy * dy + dz * dz <= r * r;
}

export class GlRanges {
  private readonly shell: { prog: WebGLProgram; u: UniformCache };
  private readonly capture: { prog: WebGLProgram; u: UniformCache };
  private readonly ground: { prog: WebGLProgram; u: UniformCache };
  private readonly meshBuf: WebGLBuffer;
  private readonly instBuf: WebGLBuffer;
  private readonly vao: WebGLVertexArrayObject;
  private readonly sphere: number;
  private readonly cone: number;
  private instCapacity = 0;
  private readonly depth: WebGLTexture;
  private readonly fbos: WebGLFramebuffer[] = [];
  private readonly posVaos = new WeakMap<WebGLBuffer, WebGLVertexArrayObject>();
  readonly plan = new ViewshedPlan();
  private readonly views = new Float32Array(MAX_VIEWS * 6 * 4);
  private readonly groundBand = new Float32Array(MAX_VIEWS * 4);
  private readonly groundCol = new Float32Array(MAX_VIEWS * 4);
  private readonly groundDir = new Float32Array(MAX_VIEWS * 4);

  /**
   * `clip`: the clip control a reverse-Z context draws with (render/depth.ts). The
   * views are taken the classic way round, in a depth array of their own, so it is
   * turned back for them; the scene's ground and shells test the scene's way.
   */
  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly clip: ClipControl | null = null,
  ) {
    const make = (vs: string, fs: string, label: string) => {
      const prog = compileProgram(gl, vs, fs, label);
      return { prog, u: new UniformCache(gl, prog) };
    };
    this.shell = make(SHELL_GLSL_VS, SHELL_GLSL_FS, 'range shells');
    this.capture = make(CAPTURE_GLSL_VS, CAPTURE_GLSL_FS, 'range views');
    this.ground = make(GROUND_GLSL_VS, GROUND_GLSL_FS, 'range ground');
    const mesh = shellMesh();
    this.sphere = mesh.sphere;
    this.cone = mesh.cone;
    this.meshBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.meshBuf);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.data, gl.STATIC_DRAW);
    this.instBuf = gl.createBuffer()!;
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.meshBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instBuf);
    for (let i = 0; i < 6; i++) {
      gl.enableVertexAttribArray(1 + i);
      gl.vertexAttribDivisor(1 + i, 1);
    }
    this.instPointers(0);
    gl.bindVertexArray(null);

    this.depth = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.depth);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.DEPTH_COMPONENT32F, VIEW_FACE, VIEW_FACE, VIEW_LAYERS);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
  }

  /** Whether faces are still waiting to be taken. */
  get pending(): boolean {
    return this.plan.pending;
  }

  /** The instance attributes from instance `first` on (WebGL2 has no first instance). */
  private instPointers(first: number): void {
    const gl = this.gl;
    const stride = SHELL_FLOATS * 4;
    for (let i = 0; i < 6; i++) gl.vertexAttribPointer(1 + i, 4, gl.FLOAT, false, stride, first * stride + i * 16);
  }

  private posVao(m: RangeMesh): WebGLVertexArrayObject {
    let v = this.posVaos.get(m.vbo);
    if (!v) {
      const gl = this.gl;
      v = gl.createVertexArray()!;
      gl.bindVertexArray(v);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
      gl.bindVertexArray(null);
      this.posVaos.set(m.vbo, v);
    }
    return v;
  }

  private drawMesh(m: RangeMesh): void {
    const gl = this.gl;
    gl.bindVertexArray(this.posVao(m));
    if (m.groundIbo && m.groundCount) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.groundIbo);
      gl.drawElements(gl.TRIANGLES, m.groundCount, gl.UNSIGNED_INT, 0);
    }
    if (m.structIbo && m.structCount) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.structIbo);
      gl.drawElements(gl.TRIANGLES, m.structCount, gl.UNSIGNED_INT, 0);
    }
  }

  private fbo(layer: number): WebGLFramebuffer {
    let f = this.fbos[layer];
    if (!f) {
      const gl = this.gl;
      f = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, this.depth, 0, layer);
      gl.drawBuffers([gl.NONE]);
      gl.readBuffer(gl.NONE);
      this.fbos[layer] = f;
    }
    return f;
  }

  /**
   * Take this frame's faces from the level `meshes` (every mesh, not only those
   * in view). Leaves the framebuffer unbound: the scene pass binds its own.
   */
  takeViews(r: RangeDraw, meshes: readonly RangeMesh[], level: unknown): void {
    const gl = this.gl;
    const todo = r.los || r.ground ? this.plan.plan(r.views, level, r.facesPerFrame) : [];
    if (!todo.length) return;
    const { prog, u } = this.capture;
    gl.useProgram(prog);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
    this.clip?.clipControlEXT(CLIP_LOWER_LEFT, CLIP_NEGATIVE_ONE_TO_ONE);
    gl.viewport(0, 0, VIEW_FACE, VIEW_FACE);
    for (const layer of todo) {
      const v = r.views[Math.floor(layer / 6)]!;
      const [a, rt, up] = FACES[layer % 6];
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo(layer));
      gl.clearDepth(1);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      u.f3('uEye', v.eye[0], v.eye[1], v.eye[2]);
      u.f3('uAx', a[0], a[1], a[2]);
      u.f3('uRt', rt[0], rt[1], rt[2]);
      u.f3('uUp', up[0], up[1], up[2]);
      u.f1('uNear', Math.max(1e-3, v.far * 1e-5));
      u.f1('uFar', v.far);
      for (const m of meshes) if (boxNear(m.bounds, v.eye, v.far)) this.drawMesh(m);
    }
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.clip?.clipControlEXT(CLIP_LOWER_LEFT, CLIP_ZERO_TO_ONE);
    gl.depthFunc(this.sceneTest);
  }

  /** The scene's depth test: greater-or-equal under reverse-Z. */
  private get sceneTest(): number {
    return this.clip ? this.gl.GEQUAL : this.gl.LEQUAL;
  }

  private bindViews(u: UniformCache, params: FrameParams, r: RangeDraw): void {
    const gl = this.gl;
    this.plan.uniforms(r.views, params.origin, this.views);
    const loc = u.loc('uViews[0]');
    if (loc) gl.uniform4fv(loc, this.views);
    u.f4('uFaces', VIEW_FACE, r.bias, 0, 0);
    gl.activeTexture(gl.TEXTURE0 + VIEW_UNIT);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.depth);
    u.i1('uViewDepth', VIEW_UNIT);
    gl.activeTexture(gl.TEXTURE0);
  }

  /** The ground each view sees within reach, over the level drawn (`meshes`: those in view). */
  drawGround(params: FrameParams, r: RangeDraw, meshes: readonly RangeMesh[]): void {
    if (!r.ground) return;
    const live = r.views;
    const near = meshes.filter((m) => live.some((v) => v && boxNear(m.bounds, v.eye, v.band[2])));
    if (!near.length) return;
    const gl = this.gl;
    const { prog, u } = this.ground;
    gl.useProgram(prog);
    u.mat4('uViewProj', params.viewProj);
    u.f3('uOrigin', params.origin[0], params.origin[1], params.origin[2]);
    this.bindViews(u, params, r);
    let n = 0;
    for (let i = 0; i < MAX_VIEWS; i++) {
      const v: RangeView | null = live[i] ?? null;
      this.groundBand.set(v ? [v.band[0], v.band[1], v.band[2], r.opacity] : [0, 0, 0, 0], i * 4);
      this.groundCol.set(v ? [v.colour[0], v.colour[1], v.colour[2], 1] : [0, 0, 0, 0], i * 4);
      this.groundDir.set(v?.cone ? [v.cone.fwd[0], v.cone.fwd[1], v.cone.fwd[2], v.cone.tanH] : [0, 0, 0, 0], i * 4);
      if (v) n = i + 1;
    }
    const lb = u.loc('uGround[0]');
    if (lb) gl.uniform4fv(lb, this.groundBand);
    const lc = u.loc('uGroundCol[0]');
    if (lc) gl.uniform4fv(lc, this.groundCol);
    const ld = u.loc('uGroundDir[0]');
    if (ld) gl.uniform4fv(ld, this.groundDir);
    u.i1('uViewCount', n);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.depthFunc(this.sceneTest);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    // Pulled towards the camera, which is up under reverse-Z.
    if (this.clip) gl.polygonOffset(1, 4);
    else gl.polygonOffset(-1, -4);
    for (const m of near) this.drawMesh(m);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
  }

  /** The shells, added onto the scene: depth tested, not written, in any order. */
  drawShells(params: FrameParams, r: RangeDraw): void {
    if (!r.count) return;
    const gl = this.gl;
    const n = r.count * SHELL_FLOATS;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instBuf);
    if (this.instCapacity < n) {
      this.instCapacity = Math.max(n, 64 * SHELL_FLOATS) * 2;
      gl.bufferData(gl.ARRAY_BUFFER, this.instCapacity * 4, gl.DYNAMIC_DRAW);
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, r.shells, 0, n);
    const { prog, u } = this.shell;
    gl.useProgram(prog);
    u.mat4('uViewProj', params.viewProjRel);
    const o = params.origin;
    u.f4('uCam', params.cameraPos[0] - o[0], params.cameraPos[1] - o[1], params.cameraPos[2] - o[2], r.opacity);
    u.f4('uStyle', r.faces ? 1 : 0, r.lines ? 1 : 0, r.los ? 1 : 0, 0);
    this.bindViews(u, params, r);
    const cull = gl.isEnabled(gl.CULL_FACE);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ZERO, gl.ONE);
    gl.depthMask(false);
    gl.depthFunc(this.sceneTest);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instBuf);
    this.instPointers(0);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, this.sphere, r.count);
    if (r.coneStart < r.count) {
      this.instPointers(r.coneStart);
      gl.drawArraysInstanced(gl.TRIANGLES, this.sphere, this.cone, r.count - r.coneStart);
      this.instPointers(0);
    }
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    if (cull) gl.enable(gl.CULL_FACE);
  }

  dispose(): void {
    const gl = this.gl;
    for (const f of this.fbos) if (f) gl.deleteFramebuffer(f);
    gl.deleteTexture(this.depth);
    gl.deleteBuffer(this.meshBuf);
    gl.deleteBuffer(this.instBuf);
    gl.deleteVertexArray(this.vao);
    for (const p of [this.shell, this.capture, this.ground]) gl.deleteProgram(p.prog);
  }
}
