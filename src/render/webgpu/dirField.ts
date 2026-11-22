import type { FrameParams } from '../types';
import { FIELD_ARROW_VERTS, fieldCells } from '../dirFieldShared';

/**
 * The direction field (WebGPU): the twin of webgl2/dirField.ts, which explains
 * it. One RGBA16F texel a cell, written by the heat pipeline with `dirCfg.w`
 * set: sum(w dx), sum(w dy), sum(w). WebGPU's framebuffer rows run downwards,
 * so a cell's row is flipped where it becomes a position, and the field's
 * vectors (y up, like clip space) where they step through texture space.
 */

const COMMON = /* wgsl */ `
struct FieldUniforms {
  // cells xy, canvas pixels zw
  size  : vec4<f32>,
  // 1 / heat gain, saturation, widen (pixels, the outline), time (s, < 0 still)
  cfg   : vec4<f32>,
  color : vec4<f32>,
};
@group(0) @binding(0) var<uniform> u : FieldUniforms;
@group(0) @binding(1) var field : texture_2d<f32>;
@group(0) @binding(2) var fieldSamp : sampler;
`;

export const ARROW_WGSL = /* wgsl */ `
${COMMON}
struct ArrowOut {
  @builtin(position) pos : vec4<f32>,
  @location(0) alpha : f32,
};
const SHAPE = array<vec2<f32>, ${FIELD_ARROW_VERTS}>(
  vec2<f32>(-0.5, -1.0), vec2<f32>(0.18, -1.0), vec2<f32>(-0.5, 1.0),
  vec2<f32>(0.18, -1.0), vec2<f32>(0.18, 1.0), vec2<f32>(-0.5, 1.0),
  vec2<f32>(0.18, -3.2), vec2<f32>(0.5, 0.0), vec2<f32>(0.18, 3.2)
);
@vertex
fn vsArrow(@builtin(vertex_index) vid : u32, @builtin(instance_index) inst : u32) -> ArrowOut {
  var out : ArrowOut;
  let cells = vec2<i32>(u.size.xy);
  let c = vec2<i32>(i32(inst) % cells.x, i32(inst) / cells.x);
  var sum = vec3<f32>(0.0);
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let q = clamp(c + vec2<i32>(dx, dy), vec2<i32>(0), cells - 1);
      var w = 1.0;
      if (dx == 0 && dy == 0) { w = 2.0; }
      sum += textureLoad(field, q, 0).xyz * w;
    }
  }
  sum *= 0.1;
  let m = sum.xy / max(sum.z, 1e-12);
  let r = length(m);
  // Only where the cell itself carries heat: see the WebGL2 copy.
  let amount = textureLoad(field, c, 0).z * u.cfg.x / max(1e-9, u.cfg.y);
  if (sum.z <= 0.0 || r < 0.03 || amount < 0.004) {
    out.pos = vec4<f32>(2.0, 2.0, 2.0, 1.0);
    out.alpha = 0.0;
    return out;
  }
  let dir = m / r;
  let across = vec2<f32>(-dir.y, dir.x);
  let cellPx = u.size.zw / u.size.xy;
  let cell = min(cellPx.x, cellPx.y);
  let len = cell * (0.3 + 0.62 * r);
  let halfW = max(0.75, cell * 0.035) + u.cfg.z;
  let s = SHAPE[vid];
  let px = dir * (s.x * len + sign(s.x) * u.cfg.z) + across * s.y * halfW;
  let uv = (vec2<f32>(c) + 0.5) / u.size.xy;
  let center = vec2<f32>(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0);
  out.pos = vec4<f32>(center + px / u.size.zw * 2.0, 0.0, 1.0);
  out.alpha = clamp(sqrt(amount), 0.0, 1.0) * (0.35 + 0.65 * r);
  return out;
}
@fragment
fn fsArrow(in : ArrowOut) -> @location(0) vec4<f32> {
  return vec4<f32>(u.color.rgb, u.color.a * in.alpha);
}
`;

export const STREAM_WGSL = /* wgsl */ `
${COMMON}
@vertex
fn vsStream(@builtin(vertex_index) vid : u32) -> @builtin(position) vec4<f32> {
  let p = vec2<f32>(f32((vid & 1u) << 1u), f32(vid & 2u));
  return vec4<f32>(p * 2.0 - 1.0, 0.0, 1.0);
}
fn hash(q : vec2<f32>) -> f32 {
  var p = fract(q * vec2<f32>(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}
fn fieldAt(uv : vec2<f32>) -> vec3<f32> {
  let f = textureSampleLevel(field, fieldSamp, uv, 0.0).xyz;
  var m = vec2<f32>(0.0);
  if (f.z > 0.0) { m = f.xy / f.z; }
  return vec3<f32>(m, f.z);
}
@fragment
fn fsStream(@builtin(position) frag : vec4<f32>) -> @location(0) vec4<f32> {
  let canvas = u.size.zw;
  let uv0 = frag.xy / canvas;
  let f0 = fieldAt(uv0);
  let amount = f0.z * u.cfg.x / max(1e-9, u.cfg.y);
  let r0 = length(f0.xy);
  if (f0.z <= 0.0 || r0 < 0.03 || amount < 0.004) { discard; }
  let STEPS = 12;
  let STEP = 1.6;
  var acc = 0.0;
  let still = u.cfg.w < 0.0;
  let phase = select(u.cfg.w * 0.9, 0.0, still);
  for (var side = 0; side < 2; side++) {
    var uv = uv0;
    let dirSign = select(1.0, -1.0, side == 0);
    for (var k = 1; k <= STEPS; k++) {
      let m = fieldAt(uv).xy;
      let ml = length(m);
      if (ml < 1e-4) { break; }
      // The field is y up, texture space y down.
      uv += dirSign * vec2<f32>(m.x, -m.y) / ml * STEP / canvas;
      let pixel = vec2<f32>(uv.x, 1.0 - uv.y) * canvas;
      let cellId = floor(pixel / 3.0);
      let dot1 = step(0.93, hash(cellId));
      let along = f32(k) / f32(STEPS) * dirSign;
      var pulse = 1.0 - abs(along);
      if (!still) { pulse = fract(phase + hash(cellId + 7.0) - along * 0.5); }
      acc += dot1 * pulse;
    }
  }
  let a = clamp(acc * 0.55, 0.0, 1.0) * clamp(sqrt(amount), 0.0, 1.0) * (0.3 + 0.7 * r0);
  if (a <= 0.003) { discard; }
  return vec4<f32>(u.color.rgb, u.color.a * a);
}
`;

const UNIFORM_BYTES = 48;
const FORMAT: GPUTextureFormat = 'rgba16float';

export class GpuDirField {
  tex: GPUTexture | null = null;
  scratch: GPUTexture | null = null;
  view: GPUTextureView | null = null;
  scratchView: GPUTextureView | null = null;
  width = 0;
  height = 0;
  /** Bumped when the targets are remade, for bind group keys. */
  generation = 0;
  /** Set when the targets were just made: the next pass writes straight in. */
  fresh = true;
  readonly format = FORMAT;
  private arrowPipe: GPURenderPipeline | null = null;
  private streamPipe: GPURenderPipeline | null = null;
  /** Outline, arrow, streams: one small uniform buffer each, written every frame they draw. */
  private readonly ubufs: GPUBuffer[];
  private groups = new Map<string, GPUBindGroup>();
  private readonly data = new Float32Array(UNIFORM_BYTES / 4);

  constructor(
    private readonly device: GPUDevice,
    private readonly canvasFormat: GPUTextureFormat,
    private readonly sampler: GPUSampler,
  ) {
    this.ubufs = [0, 1, 2].map((i) =>
      device.createBuffer({ label: `direction field ${i}`, size: UNIFORM_BYTES, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
    );
  }

  ensure(params: FrameParams, hw: number, hh: number, canvasH: number): void {
    const dir = params.direction!;
    const [w, h] = fieldCells(hw, hh, (dir.cell * hh) / Math.max(1, canvasH));
    if (w === this.width && h === this.height && this.tex) return;
    this.free();
    const make = (label: string) =>
      this.device.createTexture({
        label,
        size: [w, h],
        format: FORMAT,
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      });
    this.tex = make('direction field');
    this.scratch = make('direction field scratch');
    this.view = this.tex.createView();
    this.scratchView = this.scratch.createView();
    this.width = w;
    this.height = h;
    this.generation++;
    this.groups.clear();
    this.fresh = true;
  }

  /** Into the composite pass, after the picture and before the lines over it. */
  draw(pass: GPURenderPassEncoder, params: FrameParams, canvasW: number, canvasH: number): void {
    const dir = params.direction;
    if (!dir || dir.field === 0 || !this.view) return;
    const write = (i: number, widen: number, color: [number, number, number, number]) => {
      const d = this.data;
      d[0] = this.width;
      d[1] = this.height;
      d[2] = canvasW;
      d[3] = canvasH;
      d[4] = 1 / Math.max(1e-9, params.heatGain);
      d[5] = params.heat.saturation;
      d[6] = widen;
      d[7] = dir.time;
      d.set(color, 8);
      this.device.queue.writeBuffer(this.ubufs[i], 0, d as unknown as BufferSource);
    };
    if (dir.field & 2) {
      const pipe = (this.streamPipe ??= this.pipeline('streams', STREAM_WGSL, 'vsStream', 'fsStream'));
      write(2, 0, [0.92, 0.96, 1, 0.85]);
      pass.setPipeline(pipe);
      pass.setBindGroup(0, this.group('s', pipe, 2));
      pass.draw(3);
    }
    if (dir.field & 1) {
      const pipe = (this.arrowPipe ??= this.pipeline('arrows', ARROW_WGSL, 'vsArrow', 'fsArrow'));
      const cells = this.width * this.height;
      write(0, 1, [0.02, 0.03, 0.05, 0.7]);
      write(1, 0, [0.97, 0.98, 1, 1]);
      pass.setPipeline(pipe);
      pass.setBindGroup(0, this.group('a0', pipe, 0));
      pass.draw(FIELD_ARROW_VERTS, cells);
      pass.setBindGroup(0, this.group('a1', pipe, 1));
      pass.draw(FIELD_ARROW_VERTS, cells);
    }
  }

  private group(key: string, pipe: GPURenderPipeline, buf: number): GPUBindGroup {
    let g = this.groups.get(key);
    if (!g) {
      g = this.device.createBindGroup({
        layout: pipe.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this.ubufs[buf] } },
          { binding: 1, resource: this.view! },
          ...(key === 's' ? [{ binding: 2, resource: this.sampler }] : []),
        ],
      });
      this.groups.set(key, g);
    }
    return g;
  }

  private pipeline(label: string, code: string, vs: string, fs: string): GPURenderPipeline {
    const module = this.device.createShaderModule({ label: `direction ${label}`, code });
    return this.device.createRenderPipeline({
      label: `direction ${label}`,
      layout: 'auto',
      vertex: { module, entryPoint: vs },
      fragment: {
        module,
        entryPoint: fs,
        targets: [
          {
            format: this.canvasFormat,
            blend: {
              color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
              alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            },
          },
        ],
      },
      primitive: { topology: 'triangle-list' },
    });
  }

  free(): void {
    this.tex?.destroy();
    this.scratch?.destroy();
    this.tex = this.scratch = null;
    this.view = this.scratchView = null;
    this.width = this.height = 0;
    this.groups.clear();
  }

  dispose(): void {
    this.free();
    for (const b of this.ubufs) b.destroy();
  }
}
