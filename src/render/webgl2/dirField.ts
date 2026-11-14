import type { FrameParams } from '../types';
import { compileProgram, createTexture, UniformCache } from './glutil';
import { FIELD_ARROW_VERTS, fieldCells } from '../dirFieldShared';

/**
 * The direction field (WebGL2): where the heat points, one cell per arrow.
 *
 * The heat pass runs a second time over the same sprites into a small RGBA16F
 * target - one texel a cell - with the splat shader writing each row's screen
 * direction weighted by its heat, and that weight (`uDirOut`). So a texel holds
 * sum(w dx), sum(w dy), sum(w): its mean direction is a division, its mean
 * resultant length the length of that, and how much is there the weight, in
 * the heat's own units. It accumulates frame over frame exactly as the heat
 * does, so it converges with it and does not flicker. Drawn over the
 * composited picture as arrows, streamlines, or both.
 */

const ARROW_VS = `#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uField;
uniform ivec2 uCells;
uniform vec2  uCanvas;      // target pixels
uniform float uGainInv;     // 1 / heat gain: back to the heat's units
uniform float uSaturation;
uniform float uWiden;       // pixels added to the half width: the outline pass
out float vAlpha;
${'' /* the arrow: a shaft of two triangles and a head of one */}
const vec2 SHAPE[${FIELD_ARROW_VERTS}] = vec2[${FIELD_ARROW_VERTS}](
  vec2(-0.5, -1.0), vec2(0.18, -1.0), vec2(-0.5, 1.0),
  vec2(0.18, -1.0), vec2(0.18, 1.0), vec2(-0.5, 1.0),
  vec2(0.18, -3.2), vec2(0.5, 0.0), vec2(0.18, 3.2)
);
void main() {
  ivec2 c = ivec2(gl_InstanceID % uCells.x, gl_InstanceID / uCells.x);
  // The cell and its neighbours, the cell counted twice: an arrow says the
  // neighbourhood, and a lone cell's arrow would twitch with every new sample.
  vec3 sum = vec3(0.0);
  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      ivec2 q = clamp(c + ivec2(dx, dy), ivec2(0), uCells - 1);
      sum += texelFetch(uField, q, 0).xyz * ((dx == 0 && dy == 0) ? 2.0 : 1.0);
    }
  }
  sum *= 0.1;
  vec2 m = sum.xy / max(sum.z, 1e-12);
  float r = length(m);
  // Drawn only where the cell itself carries heat: the neighbourhood steadies
  // the direction, it must not spread arrows onto empty ground beside the heat.
  float amount = texelFetch(uField, c, 0).z * uGainInv / max(1e-9, uSaturation);
  if (sum.z <= 0.0 || r < 0.03 || amount < 0.004) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    vAlpha = 0.0;
    return;
  }
  vec2 dir = m / r;
  vec2 across = vec2(-dir.y, dir.x);
  vec2 cellPx = uCanvas / vec2(uCells);
  float cell = min(cellPx.x, cellPx.y);
  // Length by concentration, opacity by amount: a long bright arrow is a lot of
  // heat all going one way.
  float len = cell * (0.3 + 0.62 * r);
  float halfW = max(0.75, cell * 0.035) + uWiden;
  vec2 s = SHAPE[gl_VertexID];
  vec2 px = dir * (s.x * len + sign(s.x) * uWiden) + across * s.y * halfW;
  vec2 center = (vec2(c) + 0.5) / vec2(uCells) * 2.0 - 1.0;
  gl_Position = vec4(center + px / uCanvas * 2.0, 0.0, 1.0);
  vAlpha = clamp(sqrt(amount), 0.0, 1.0) * (0.35 + 0.65 * r);
}
`;

const ARROW_FS = `#version 300 es
precision highp float;
in float vAlpha;
uniform vec4 uColor;
out vec4 outColor;
void main() {
  outColor = vec4(uColor.rgb, uColor.a * vAlpha);
}
`;

const STREAM_VS = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID & 1) << 1), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

/**
 * Streamlines: a line integral along the field through a sparse dot noise, so
 * each dot draws a streak along the local mean direction. Animated by moving a
 * pulse down every streak; the noise is pinned to the screen, the field to the
 * heat beneath it.
 */
const STREAM_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uField;
uniform vec2  uCanvas;
uniform float uGainInv;
uniform float uSaturation;
uniform float uTime;        // seconds; negative holds the streaks still
uniform vec4  uColor;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}
vec3 field(vec2 uv) {
  vec3 f = texture(uField, uv).xyz;
  return vec3(f.z > 0.0 ? f.xy / f.z : vec2(0.0), f.z);
}
void main() {
  vec3 f0 = field(vUv);
  float amount = f0.z * uGainInv / max(1e-9, uSaturation);
  float r0 = length(f0.xy);
  if (f0.z <= 0.0 || r0 < 0.03 || amount < 0.004) discard;
  const int STEPS = 12;
  const float STEP = 1.6;   // pixels
  float acc = 0.0;
  float phase = uTime < 0.0 ? 0.0 : uTime * 0.9;
  for (int side = 0; side < 2; side++) {
    vec2 uv = vUv;
    float dirSign = side == 0 ? -1.0 : 1.0;
    for (int k = 1; k <= STEPS; k++) {
      vec2 m = field(uv).xy;
      float ml = length(m);
      if (ml < 1e-4) break;
      uv += dirSign * (m / ml) * STEP / uCanvas;
      vec2 cellId = floor(uv * uCanvas / 3.0);
      float dot1 = step(0.93, hash(cellId));
      // Where along its streak this sample is: upstream behind, downstream ahead.
      float along = float(k) / float(STEPS) * dirSign;
      float pulse = uTime < 0.0
        ? 1.0 - abs(along)
        : fract(phase + hash(cellId + 7.0) - along * 0.5);
      acc += dot1 * pulse;
    }
  }
  float a = clamp(acc * 0.55, 0.0, 1.0) * clamp(sqrt(amount), 0.0, 1.0) * (0.3 + 0.7 * r0);
  if (a <= 0.003) discard;
  outColor = vec4(uColor.rgb, uColor.a * a);
}
`;

interface Prog {
  prog: WebGLProgram;
  u: UniformCache;
}

export class GlDirField {
  fbo: WebGLFramebuffer | null = null;
  scratchFbo: WebGLFramebuffer | null = null;
  tex: WebGLTexture | null = null;
  scratch: WebGLTexture | null = null;
  width = 0;
  height = 0;
  /** Set when the targets were just made: the next pass writes straight in rather than merging into nothing. */
  fresh = true;
  private arrow: Prog | null = null;
  private stream: Prog | null = null;

  constructor(private readonly gl: WebGL2RenderingContext) {}

  /** Targets for a heat buffer of hw x hh texels under a canvas hh / texelsPerPixel tall. */
  ensure(params: FrameParams, hw: number, hh: number, canvasH: number): void {
    const dir = params.direction!;
    const [w, h] = fieldCells(hw, hh, (dir.cell * hh) / Math.max(1, canvasH));
    if (w === this.width && h === this.height && this.fbo) return;
    this.free();
    const gl = this.gl;
    const make = (): [WebGLTexture, WebGLFramebuffer] => {
      const tex = createTexture(gl, {
        width: w,
        height: h,
        internalFormat: gl.RGBA16F,
        format: gl.RGBA,
        type: gl.HALF_FLOAT,
        filter: gl.LINEAR,
      });
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return [tex, fbo];
    };
    [this.tex, this.fbo] = make();
    [this.scratch, this.scratchFbo] = make();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.width = w;
    this.height = h;
    this.fresh = true;
  }

  /** Arrows and or streamlines over whatever is bound, with the heat's gain and saturation. */
  draw(params: FrameParams, canvasW: number, canvasH: number, vao: WebGLVertexArrayObject | null): void {
    const dir = params.direction;
    if (!dir || dir.field === 0 || !this.tex) return;
    const gl = this.gl;
    const gainInv = 1 / Math.max(1e-9, params.heatGain);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.bindVertexArray(vao);
    if (dir.field & 2) {
      const p = (this.stream ??= this.make(STREAM_VS, STREAM_FS, 'direction streams'));
      gl.useProgram(p.prog);
      p.u.i1('uField', 0);
      p.u.f2('uCanvas', canvasW, canvasH);
      p.u.f1('uGainInv', gainInv);
      p.u.f1('uSaturation', params.heat.saturation);
      p.u.f1('uTime', dir.time);
      gl.uniform4f(p.u.loc('uColor'), 0.92, 0.96, 1, 0.85);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (dir.field & 1) {
      const p = (this.arrow ??= this.make(ARROW_VS, ARROW_FS, 'direction arrows'));
      gl.useProgram(p.prog);
      p.u.i1('uField', 0);
      gl.uniform2i(p.u.loc('uCells'), this.width, this.height);
      p.u.f2('uCanvas', canvasW, canvasH);
      p.u.f1('uGainInv', gainInv);
      p.u.f1('uSaturation', params.heat.saturation);
      const cells = this.width * this.height;
      // A dark outline under a light arrow, so it reads over cold and hot alike.
      p.u.f1('uWiden', 1);
      gl.uniform4f(p.u.loc('uColor'), 0.02, 0.03, 0.05, 0.7);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, FIELD_ARROW_VERTS, cells);
      p.u.f1('uWiden', 0);
      gl.uniform4f(p.u.loc('uColor'), 0.97, 0.98, 1, 1);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, FIELD_ARROW_VERTS, cells);
    }
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
  }

  private make(vs: string, fs: string, label: string): Prog {
    const prog = compileProgram(this.gl, vs, fs, label);
    return { prog, u: new UniformCache(this.gl, prog) };
  }

  free(): void {
    const gl = this.gl;
    for (const t of [this.tex, this.scratch]) if (t) gl.deleteTexture(t);
    for (const f of [this.fbo, this.scratchFbo]) if (f) gl.deleteFramebuffer(f);
    this.tex = this.scratch = null;
    this.fbo = this.scratchFbo = null;
    this.width = this.height = 0;
  }

  dispose(): void {
    this.free();
    for (const p of [this.arrow, this.stream]) if (p) this.gl.deleteProgram(p.prog);
    this.arrow = this.stream = null;
  }
}
