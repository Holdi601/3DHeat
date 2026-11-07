export class GlError extends Error {}

export function compileProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string,
  label: string,
): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource, `${label}.vert`);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource, `${label}.frag`);
  const prog = gl.createProgram();
  if (!prog) throw new GlError(`createProgram failed for ${label}`);
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  // Shaders can be released as soon as the program is linked.
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new GlError(`Link failed for ${label}:\n${log}`);
  }
  return prog;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
  label: string,
): WebGLShader {
  const sh = gl.createShader(type);
  if (!sh) throw new GlError(`createShader failed for ${label}`);
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh) ?? '';
    gl.deleteShader(sh);
    throw new GlError(`Compile failed for ${label}:\n${log}\n${numberLines(source)}`);
  }
  return sh;
}

function numberLines(src: string): string {
  return src
    .split('\n')
    .map((l, i) => `${String(i + 1).padStart(4, ' ')} | ${l}`)
    .join('\n');
}

/**
 * Uniform locations resolved once and cached by name. Uniform lookups by string
 * every frame is one of the classic WebGL performance mistakes.
 */
export class UniformCache {
  private readonly map = new Map<string, WebGLUniformLocation | null>();
  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly prog: WebGLProgram,
  ) {}

  loc(name: string): WebGLUniformLocation | null {
    let l = this.map.get(name);
    if (l === undefined) {
      l = this.gl.getUniformLocation(this.prog, name);
      this.map.set(name, l);
    }
    return l;
  }

  f1(name: string, v: number): void {
    const l = this.loc(name);
    if (l) this.gl.uniform1f(l, v);
  }
  i1(name: string, v: number): void {
    const l = this.loc(name);
    if (l) this.gl.uniform1i(l, v);
  }
  f2(name: string, x: number, y: number): void {
    const l = this.loc(name);
    if (l) this.gl.uniform2f(l, x, y);
  }
  f3(name: string, x: number, y: number, z: number): void {
    const l = this.loc(name);
    if (l) this.gl.uniform3f(l, x, y, z);
  }
  mat4(name: string, m: Float32Array): void {
    const l = this.loc(name);
    if (l) this.gl.uniformMatrix4fv(l, false, m);
  }
}

export interface FloatTargetSupport {
  /** Can we render to a 32-bit float colour attachment? */
  renderF32: boolean;
  /** Can we *blend* into a 32-bit float attachment? Needs EXT_float_blend. */
  blendF32: boolean;
  renderF16: boolean;
  /** Can a 32-bit float texture use LINEAR filtering? Half-float always can. */
  linearF32: boolean;
}

export function probeFloatSupport(gl: WebGL2RenderingContext): FloatTargetSupport {
  // EXT_color_buffer_float makes R16F/R32F colour-renderable in WebGL2.
  const cbf = gl.getExtension('EXT_color_buffer_float');
  const floatBlend = gl.getExtension('EXT_float_blend');
  // Half-float blending is allowed by EXT_color_buffer_float alone; 32-bit
  // blending additionally needs EXT_float_blend or the draw silently no-ops.
  const support = {
    renderF32: !!cbf,
    blendF32: !!cbf && !!floatBlend,
    renderF16: !!cbf || !!gl.getExtension('EXT_color_buffer_half_float'),
    linearF32: !!gl.getExtension('OES_texture_float_linear'),
  };
  // `?heat=f16` forces the half-float accumulation path.
  //
  // Not a debugging leftover: half float is what a machine without
  // EXT_float_blend actually gets, and its arithmetic behaves differently enough
  // — 11 bits of mantissa instead of 24 — that bugs live there and nowhere else.
  // Without a way to select it, that path is only ever exercised by users.
  if (forcedHeatPrecision() === 'f16') {
    support.renderF32 = false;
    support.blendF32 = false;
  }
  return support;
}

/** Heat precision forced by the URL, if any. */
export function forcedHeatPrecision(): 'f16' | 'f32' | null {
  if (typeof location === 'undefined') return null;
  const v = new URLSearchParams(location.search).get('heat');
  return v === 'f16' || v === 'f32' ? v : null;
}

export function createTexture(
  gl: WebGL2RenderingContext,
  opts: {
    width: number;
    height: number;
    internalFormat: number;
    format: number;
    type: number;
    data?: ArrayBufferView | null;
    filter?: number;
  },
): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new GlError('createTexture failed');
  // Checked rather than attempted. `texStorage2D` past MAX_TEXTURE_SIZE does not
  // throw: it leaves an unallocated texture behind, every later `texSubImage2D`
  // on it fails with INVALID_OPERATION, and sampling it returns zero. That is a
  // silent wrong picture rather than an error, and it has cost real time here
  // twice — once for a sign table sized by a column's cardinality, and once for a
  // block index texture a driver happened to be too small for.
  const limit = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  if (opts.width > limit || opts.height > limit) {
    throw new GlError(
      `texture ${opts.width}x${opts.height} exceeds this driver's ${limit}px limit`,
    );
  }
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texStorage2D(gl.TEXTURE_2D, 1, opts.internalFormat, opts.width, opts.height);
  if (opts.data) {
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      opts.width,
      opts.height,
      opts.format,
      opts.type,
      opts.data,
    );
  }
  const f = opts.filter ?? gl.NEAREST;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

export function checkFramebuffer(gl: WebGL2RenderingContext, label: string): void {
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new GlError(`Framebuffer ${label} incomplete: 0x${status.toString(16)}`);
  }
}
