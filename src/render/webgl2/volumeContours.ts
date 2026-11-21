/**
 * Where the volumes cut the level, in WebGL2 (`render/volumeContours.ts`): one
 * fullscreen pass over the scene's depth, blended over the composited picture.
 */

import { VOL_CFG, VOL_INFO, VOL_M, VOL_POLY, VOLUME_BLOCK_FLOATS } from '../../volumes/gpu';
import type { FrameParams } from '../types';
import { invert4, VOLUME_CONTOUR_FS, type VolumeContourDraw } from '../volumeContours';
import { compileProgram, UniformCache } from './glutil';
import { FULLSCREEN_VS } from './shaders';

export class GlVolumeContours {
  private readonly prog: WebGLProgram;
  private readonly u: UniformCache;
  private readonly inv = new Float32Array(16);

  constructor(private readonly gl: WebGL2RenderingContext) {
    this.prog = compileProgram(gl, FULLSCREEN_VS, VOLUME_CONTOUR_FS, 'volume contours');
    this.u = new UniformCache(gl, this.prog);
  }

  /** `reverse`: the depth is reverse-Z in [0, 1] (clip control); otherwise OpenGL's classic layout, cleared to 1. */
  draw(params: FrameParams, c: VolumeContourDraw, depth: WebGLTexture, reverse: boolean, vao: WebGLVertexArrayObject): void {
    const gl = this.gl;
    const u = this.u;
    gl.useProgram(this.prog);
    const b = c.block;
    gl.uniform4f(u.loc('uVolCfg'), b[VOL_CFG], b[VOL_CFG + 1], b[VOL_CFG + 2], b[VOL_CFG + 3]);
    const m = u.loc('uVolM[0]') ?? u.loc('uVolM');
    if (m) gl.uniform4fv(m, b.subarray(VOL_M, VOL_INFO));
    const info = u.loc('uVolInfo[0]') ?? u.loc('uVolInfo');
    if (info) gl.uniform4fv(info, b.subarray(VOL_INFO, VOL_POLY));
    const poly = u.loc('uVolPoly[0]') ?? u.loc('uVolPoly');
    if (poly) gl.uniform4fv(poly, b.subarray(VOL_POLY, VOLUME_BLOCK_FLOATS));
    const col = u.loc('uVolColor[0]') ?? u.loc('uVolColor');
    if (col) gl.uniform4fv(col, c.colors);
    u.mat4('uInvViewProj', invert4(params.viewProj, this.inv));
    u.f2('uDepthMode', reverse ? 0 : 1, reverse ? 0 : 1);
    u.i1('uDepth', 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, depth);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
  }

  dispose(): void {
    this.gl.deleteProgram(this.prog);
  }
}
