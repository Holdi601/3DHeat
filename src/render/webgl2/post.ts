/**
 * The tactical display's screen pass in WebGL2 (`post/tacticalPost.ts`): the
 * composite draws into `srcFbo` instead of the canvas, then glow (down, blur
 * across, blur down) and the final pass into the canvas.
 */

import { FULLSCREEN_VS } from './shaders';
import { checkFramebuffer, compileProgram, createTexture } from './glutil';
import { POST_BLUR_FS, POST_DOWN_FS, POST_FINAL_FS, POST_FLOATS, glowDivisor, packPostUniforms, passVec } from '../post/tacticalPost';
import type { FrameParams, PostDraw } from '../types';

interface Target {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
}

export class GlPost {
  private readonly down: WebGLProgram;
  private readonly blur: WebGLProgram;
  private readonly final: WebGLProgram;
  private src: Target | null = null;
  private glowA: Target | null = null;
  private glowB: Target | null = null;
  private w = 0;
  private h = 0;
  private gw = 0;
  private gh = 0;
  private readonly block = new Float32Array(POST_FLOATS);

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.down = compileProgram(gl, FULLSCREEN_VS, POST_DOWN_FS, 'post-down');
    this.blur = compileProgram(gl, FULLSCREEN_VS, POST_BLUR_FS, 'post-blur');
    this.final = compileProgram(gl, FULLSCREEN_VS, POST_FINAL_FS, 'post-final');
  }

  private target(w: number, h: number, label: string): Target {
    const gl = this.gl;
    const tex = createTexture(gl, { width: w, height: h, internalFormat: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE, filter: gl.LINEAR });
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    checkFramebuffer(gl, label);
    return { tex, fbo };
  }

  private free(t: Target | null): void {
    if (!t) return;
    this.gl.deleteTexture(t.tex);
    this.gl.deleteFramebuffer(t.fbo);
  }

  /** The framebuffer the composite draws into this frame, sized to the canvas. */
  begin(width: number, height: number, quality: PostDraw['quality']): WebGLFramebuffer {
    const div = glowDivisor(quality);
    const gw = Math.max(1, Math.ceil(width / div));
    const gh = Math.max(1, Math.ceil(height / div));
    if (!this.src || this.w !== width || this.h !== height) {
      this.free(this.src);
      this.src = this.target(width, height, 'post-src');
      this.w = width;
      this.h = height;
    }
    if (!this.glowA || this.gw !== gw || this.gh !== gh) {
      this.free(this.glowA);
      this.free(this.glowB);
      this.glowA = this.target(gw, gh, 'post-glowA');
      this.glowB = this.target(gw, gh, 'post-glowB');
      this.gw = gw;
      this.gh = gh;
    }
    return this.src.fbo;
  }

  private pass(
    prog: WebGLProgram,
    out: WebGLFramebuffer | null,
    w: number,
    h: number,
    src: WebGLTexture,
    depth: WebGLTexture,
    glow: WebGLTexture,
    extra: [number, number, number, number],
    vao: WebGLVertexArrayObject,
  ): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, out);
    gl.viewport(0, 0, w, h);
    gl.useProgram(prog);
    this.block.set(extra, 40);
    gl.uniform4fv(gl.getUniformLocation(prog, 'uP'), this.block);
    gl.uniform1i(gl.getUniformLocation(prog, 'uSrc'), 0);
    gl.uniform1i(gl.getUniformLocation(prog, 'uDepth'), 1);
    gl.uniform1i(gl.getUniformLocation(prog, 'uGlow'), 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, depth);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, glow);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Glow and the final pass, into the canvas. */
  run(params: FrameParams, post: PostDraw, depth: WebGLTexture, clear: readonly [number, number, number], vao: WebGLVertexArrayObject): void {
    const gl = this.gl;
    if (!this.src || !this.glowA || !this.glowB) return;
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    packPostUniforms(params, post, this.w, this.h, clear, this.block);
    if (post.quality > 0 && post.bloom > 0) {
      this.pass(this.down, this.glowA.fbo, this.gw, this.gh, this.src.tex, depth, this.glowB.tex, passVec('down', glowDivisor(post.quality)), vao);
      this.pass(this.blur, this.glowB.fbo, this.gw, this.gh, this.glowA.tex, depth, this.src.tex, passVec('blur', 1 / this.gw, 0), vao);
      this.pass(this.blur, this.glowA.fbo, this.gw, this.gh, this.glowB.tex, depth, this.glowB.tex, passVec('blur', 0, 1 / this.gh), vao);
    }
    this.pass(this.final, null, this.w, this.h, this.src.tex, depth, this.glowA.tex, passVec('final'), vao);
    gl.bindVertexArray(null);
  }

  dispose(): void {
    this.free(this.src);
    this.free(this.glowA);
    this.free(this.glowB);
    this.gl.deleteProgram(this.down);
    this.gl.deleteProgram(this.blur);
    this.gl.deleteProgram(this.final);
  }
}
