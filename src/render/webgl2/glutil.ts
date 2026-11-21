export class GlError extends Error {}

/**
 * Programs started ahead of their first use (`warmPrograms`), by their
 * sources: compiled and linked by the driver in the background, so the
 * frame that first draws with them does not wait the hundreds of
 * milliseconds a big shader takes.
 */
const warmed = new WeakMap<WebGL2RenderingContext, Map<string, WebGLProgram>>();
let warming: WebGL2RenderingContext | null = null;

/**
 * Runs `build` (constructors that compile their programs) with every
 * compile started and none waited for: the programs are kept and handed
 * to the same compiles later. Nothing `build` makes is to be used.
 */
export function warmPrograms(gl: WebGL2RenderingContext, build: () => void): void {
  // The driver's own threads when it has them; Chrome's GPU process otherwise - either way not this thread.
  gl.getExtension('KHR_parallel_shader_compile');
  warming = gl;
  try {
    build();
  } catch {
    // A warm-up that fails leaves the real compile to say why.
  } finally {
    warming = null;
  }
}

/** Contexts that draw reverse-Z (render/depth.ts): their programs compile with `REVERSE_Z` defined. */
const reverseZ = new WeakSet<WebGL2RenderingContext>();

/** `EXT_clip_control`, as far as it is used here. */
export interface ClipControl {
  clipControlEXT(origin: number, depth: number): void;
}
export const CLIP_LOWER_LEFT = 0x8ca1;
export const CLIP_NEGATIVE_ONE_TO_ONE = 0x935e;
export const CLIP_ZERO_TO_ONE = 0x935f;

/**
 * Turn reverse-Z on for a context when it can: clip control to [0, 1], and its
 * programs compiled for it. Before any program is compiled. `?depth=classic`
 * keeps the classic layout, so the fallback a browser without the extension gets
 * can be exercised anywhere. Returns the extension when reverse-Z is on.
 */
export function enableReverseZ(gl: WebGL2RenderingContext): ClipControl | null {
  const classic = typeof location !== 'undefined' && new URLSearchParams(location.search).get('depth') === 'classic';
  const ext = classic ? null : (gl.getExtension('EXT_clip_control') as ClipControl | null);
  if (!ext) return null;
  ext.clipControlEXT(CLIP_LOWER_LEFT, CLIP_ZERO_TO_ONE);
  reverseZ.add(gl);
  return ext;
}

/** A source with `REVERSE_Z` defined after its version line, for a reverse-Z context. */
function withDepthDefine(gl: WebGL2RenderingContext, src: string): string {
  if (!reverseZ.has(gl)) return src;
  const nl = src.indexOf('\n');
  return nl < 0 ? src : `${src.slice(0, nl + 1)}#define REVERSE_Z 1\n${src.slice(nl + 1)}`;
}

export function compileProgram(
  gl: WebGL2RenderingContext,
  vsIn: string,
  fsIn: string,
  label: string,
  varyings?: string[],
): WebGLProgram {
  const vsSource = withDepthDefine(gl, vsIn);
  const fsSource = withDepthDefine(gl, fsIn);
  const key = `${label}\u0000${vsSource}\u0000${fsSource}\u0000${varyings?.join(',') ?? ''}`;
  const pool = warmed.get(gl);
  const ready = pool?.get(key);
  if (ready && warming !== gl) {
    pool!.delete(key);
    if (!gl.getProgramParameter(ready, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(ready);
      gl.deleteProgram(ready);
      throw new GlError(`Link failed for ${label}:
${log}`);
    }
    return ready;
  }
  if (warming === gl) {
    if (ready) return ready;
    // Started, not waited for: no status asked here.
    const p = gl.createProgram();
    if (!p) throw new GlError(`createProgram failed for ${label}`);
    const sh = (type: number, src: string) => {
      const x = gl.createShader(type)!;
      gl.shaderSource(x, src);
      gl.compileShader(x);
      gl.attachShader(p, x);
      return x;
    };
    const a = sh(gl.VERTEX_SHADER, vsSource);
    const b = sh(gl.FRAGMENT_SHADER, fsSource);
    if (varyings) gl.transformFeedbackVaryings(p, varyings, gl.INTERLEAVED_ATTRIBS);
    gl.linkProgram(p);
    gl.deleteShader(a);
    gl.deleteShader(b);
    let m = warmed.get(gl);
    if (!m) warmed.set(gl, (m = new Map()));
    m.set(key, p);
    return p;
  }
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource, `${label}.vert`);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource, `${label}.frag`);
  const prog = gl.createProgram();
  if (!prog) throw new GlError(`createProgram failed for ${label}`);
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  if (varyings) gl.transformFeedbackVaryings(prog, varyings, gl.INTERLEAVED_ATTRIBS);
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
  f4(name: string, x: number, y: number, z: number, w: number): void {
    const l = this.loc(name);
    if (l) this.gl.uniform4f(l, x, y, z, w);
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
