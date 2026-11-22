//! The native viewport's renderer: the WebGPU engine's heat path (src/render/webgpu/renderer.ts)
//! on wgpu, with the same WGSL (`wgsl/`, exported from the engine).
//!
//! What it draws today: the level's ground (a model level's mesh), the heat as points - splatted,
//! or binned and folded (Stage 0's compute path, `heatBin.ts`) where that matches the splat - with
//! the frame's filters folded into pass bits, its time window as the plan's row bounds, the
//! lifetime fade, the group signs and team colours, accumulation across frames, and the
//! composite through the colour ramp. Reverse-Z depth throughout (`render/depth.ts`).
//!
//! Every uniform is packed as the WebGPU renderer packs it, lane for lane; the comments name the
//! TypeScript each block follows.

use std::collections::HashMap;
use std::num::NonZeroU64;
use std::sync::Arc;
use std::time::Instant;

use wgpu::util::DeviceExt;

use crate::generated::*;
use crate::overlays::ZoneSlot;
use crate::packet::{FilterSet, Packet};

pub const SCENE_FORMAT: wgpu::TextureFormat = wgpu::TextureFormat::Rgba8Unorm;
pub const DEPTH_FORMAT: wgpu::TextureFormat = wgpu::TextureFormat::Depth32Float;
/// What the scene clears to (`SCENE_CLEAR` in the WebGPU renderer).
/// How long a heat read waits for the packet it names before it takes what is drawn.
const HEAT_WAIT: std::time::Duration = std::time::Duration::from_millis(250);
const SCENE_CLEAR: [f64; 3] = [0.086, 0.09, 0.102];
const SCENE_UNIFORM_BYTES: usize = 64 + 16 * 8;
const BIN_PARAM_BYTES: usize = 96;
/// Binned only where rows outnumber texels this much (`BIN_MIN_ROWS_PER_TEXEL`).
const BIN_MIN_ROWS_PER_TEXEL: f64 = 0.25;
/// Sprites wider than this many texels splat (`BIN_TYPICAL_MAX`).
const BIN_TYPICAL_MAX: f32 = 12.0;
const BIN_RELEASE_FRAMES: u32 = 120;
/// Uniform slots a frame: heat ones are `HEAT_STRIDE` apart, everything else 256.
const RING_BYTES: u64 = 8 << 20;
const HEAT_STRIDE: u64 = 512;
const SIGN_TABLE_SIZE: usize = FILTER_MASK_WIDTH as usize;

fn align(n: u64, a: u64) -> u64 {
    n.div_ceil(a) * a
}

/// f32 to IEEE half bits, round to nearest (the curve table is r16float, as on the web).
pub fn f16_bits(v: f32) -> u16 {
    let x = v.to_bits();
    let sign = ((x >> 16) & 0x8000) as u16;
    let exp = ((x >> 23) & 0xff) as i32;
    let man = x & 0x7f_ffff;
    if exp == 0xff {
        return sign | 0x7c00 | if man != 0 { 0x200 } else { 0 };
    }
    let e = exp - 127 + 15;
    if e >= 0x1f {
        return sign | 0x7c00;
    }
    if e <= 0 {
        if e < -10 {
            return sign;
        }
        let m = (man | 0x80_0000) >> (1 - e);
        let round = (m >> 12) & 1;
        return sign | ((m >> 13) + round) as u16;
    }
    let half = sign as u32 | ((e as u32) << 10) | (man >> 13);
    let round = (man >> 12) & 1;
    (half + round) as u16
}

/// One chunk of rows on the GPU, as `WebgpuRenderer.landChunk` keeps it.
pub struct GpuChunk {
    pub index: usize,
    pub start: usize,
    pub rows: usize,
    pub aabb_min: [f32; 3],
    pub aabb_size: [f32; 3],
    pub time_min: f32,
    pub time_scale: f32,
    pub life_scale: f32,
    pub positions: wgpu::Buffer,
    pub times: Option<wgpu::Buffer>,
    pub pass_bits: Option<wgpu::Buffer>,
    pub pass_keys: Vec<String>,
    /// Filter columns, by the core's name, one f32 a row.
    pub columns: HashMap<String, wgpu::Buffer>,
    /// The split's and the weight's columns end to end (`filterValues`, binding 5), and for which.
    pub values: Option<wgpu::Buffer>,
    pub values_key: String,
    pub split_slot: i32,
    pub weight_slot: i32,
    pub bytes: u64,
}

/// The level's mesh: interleaved position + normal, optional colour, ground indices; the
/// structures' triangles and edges and the water's triangles (`occlusion.rs`).
#[derive(Default)]
pub struct LevelMesh {
    pub vertices: Vec<f32>,
    pub colours: Option<Vec<f32>>,
    pub indices: Vec<u32>,
    pub structure: Vec<u32>,
    pub edges: Vec<u32>,
    pub water: Vec<u32>,
}

struct GpuLevel {
    vertices: wgpu::Buffer,
    colours: wgpu::Buffer,
    uvs: wgpu::Buffer,
    tiles: wgpu::Buffer,
    indices: wgpu::Buffer,
    count: u32,
    bytes: u64,
}

/// This frame's bind groups for the level's water and structures (`occlusion_groups`).
#[derive(Default)]
struct OccGroups {
    water: Option<(wgpu::BindGroup, wgpu::BindGroup)>,
    faces: Option<(wgpu::BindGroup, wgpu::BindGroup)>,
    wire: Option<wgpu::BindGroup>,
    seal: Option<(wgpu::BindGroup, wgpu::BindGroup)>,
    /// Drawn once: after the trails where there are figures, else after the scene's solid parts.
    shells_drawn: std::cell::Cell<bool>,
}

struct HeatSet {
    tex: wgpu::Texture,
    view: wgpu::TextureView,
    scratch_view: wgpu::TextureView,
    _scratch: wgpu::Texture,
}

struct BinGrid {
    sums_view: wgpu::TextureView,
    radii_view: wgpu::TextureView,
    tiles: wgpu::Buffer,
    reach: wgpu::Buffer,
    w: u32,
    h: u32,
    _sums: wgpu::Texture,
    _radii: wgpu::Texture,
}

/// Stage 0's binning (`GpuHeatBin`): pipelines, buffers, the grid.
struct HeatBin {
    bin: wgpu::ComputePipeline,
    resolve: wgpu::ComputePipeline,
    dilate: wgpu::ComputePipeline,
    lut: wgpu::ComputePipeline,
    args_pipe: wgpu::ComputePipeline,
    fold: HashMap<wgpu::TextureFormat, wgpu::RenderPipeline>,
    list_pipe: HashMap<wgpu::TextureFormat, wgpu::RenderPipeline>,
    params: wgpu::Buffer,
    lut_params: wgpu::Buffer,
    lut_buf: wgpu::Buffer,
    list: wgpu::Buffer,
    args: wgpu::Buffer,
    bins: Option<wgpu::Buffer>,
    grid: Option<BinGrid>,
    lut_key: String,
    idle: u32,
}

/// What one binned frame needs (`BinFrame`).
struct BinFrame {
    width: u32,
    height: u32,
    perspective: bool,
    uniform_radius: f32,
    signed: bool,
    team: bool,
    weight: f32,
    centre: f32,
    edge: f32,
    falloff: f32,
    ramp_flags: u32,
    curve_dirty: bool,
}

fn channels_for(f: &BinFrame) -> u32 {
    3 + f.perspective as u32 + (f.perspective && f.signed) as u32 + if f.team { 3 } else { 0 }
}

/// Per-frame uniforms, written in one go before the submit.
struct Ring {
    buf: wgpu::Buffer,
    data: Vec<u8>,
}

impl Ring {
    fn push(&mut self, bytes: &[u8], stride: u64) -> u64 {
        let at = align(self.data.len() as u64, stride.max(256));
        self.data.resize(at as usize, 0);
        self.data.extend_from_slice(bytes);
        at
    }

    fn binding(&self, offset: u64, size: usize) -> wgpu::BindingResource<'_> {
        wgpu::BindingResource::Buffer(wgpu::BufferBinding { buffer: &self.buf, offset, size: NonZeroU64::new(size as u64) })
    }
}

/// Frame times and counts, for the page and the parity probe.
#[derive(Default, Clone)]
pub struct Stats {
    pub adapter: String,
    pub backend: String,
    pub heat_format: String,
    pub resident_rows: u64,
    pub dropped_rows: u64,
    pub gpu_bytes: u64,
    pub level_bytes: u64,
    pub frames: u64,
    pub packets: u64,
    pub binned: bool,
    pub filters_pending: bool,
    /// Present-to-present intervals and CPU encode times since the last `take_times`, ms.
    pub intervals: Vec<f32>,
    pub cpu: Vec<f32>,
    pub last_seq: u32,
}

impl Stats {
    pub fn json(&self) -> String {
        let list = |v: &[f32]| v.iter().map(|x| format!("{x:.3}")).collect::<Vec<_>>().join(",");
        format!(
            "{{\"adapter\":{:?},\"backend\":{:?},\"heatFormat\":{:?},\"residentRows\":{},\"droppedRows\":{},\"gpuBytes\":{},\"levelBytes\":{},\"frames\":{},\"packets\":{},\"binned\":{},\"filtersPending\":{},\"lastSeq\":{},\"intervals\":[{}],\"cpu\":[{}]}}",
            self.adapter,
            self.backend,
            self.heat_format,
            self.resident_rows,
            self.dropped_rows,
            self.gpu_bytes,
            self.level_bytes,
            self.frames,
            self.packets,
            self.binned,
            self.filters_pending,
            self.last_seq,
            list(&self.intervals),
            list(&self.cpu)
        )
    }
}

/// A frame read back: RGBA8, top row first.
pub struct Captured {
    pub width: u32,
    pub height: u32,
    pub rgba: Vec<u8>,
}

type Reply<T> = Box<dyn FnOnce(T) + Send>;

struct Readback {
    buffer: wgpu::Buffer,
    ready: Arc<std::sync::atomic::AtomicU8>,
    kind: ReadKind,
}

enum ReadKind {
    Capture { width: u32, height: u32, stride: u32, bgra: bool, reply: Reply<Option<Captured>> },
    Heat { width: u32, height: u32, stride: u32, channels: u32, max: usize, reply: Reply<Option<Vec<f32>>> },
    Probe { reply: Reply<Option<f32>> },
}

pub struct Renderer {
    pub device: wgpu::Device,
    pub queue: wgpu::Queue,
    pub info: wgpu::AdapterInfo,
    pub out_format: wgpu::TextureFormat,
    heat_f32: bool,
    ring: Ring,
    sampler: wgpu::Sampler,
    lut_tex: wgpu::Texture,
    lut_view: wgpu::TextureView,
    curve_tex: wgpu::Texture,
    curve_view: wgpu::TextureView,
    block_buf: wgpu::Buffer,
    sign_buf: wgpu::Buffer,
    signs: Vec<f32>,
    volume_buf: wgpu::Buffer,
    filter_table: wgpu::Buffer,
    empty: wgpu::Buffer,
    atlas_view: wgpu::TextureView,
    atlas_tiles: wgpu::Buffer,
    // Pipelines.
    splat: HashMap<wgpu::TextureFormat, wgpu::RenderPipeline>,
    decay: HashMap<wgpu::TextureFormat, wgpu::RenderPipeline>,
    merge: HashMap<wgpu::TextureFormat, wgpu::RenderPipeline>,
    composite: wgpu::RenderPipeline,
    mesh: wgpu::RenderPipeline,
    line: wgpu::RenderPipeline,
    grid: Option<(String, wgpu::Buffer, u32)>,
    /// The box replay's figures and cubes (`figures.rs`).
    pub figures: crate::figures::Figures,
    /// The capture zones, spawn marks and volume contours (`overlays.rs`).
    pub overlays: crate::overlays::Overlays,
    /// The engagement ranges (`ranges.rs`).
    pub ranges: crate::ranges::Ranges,
    /// Line heat, the wedges' bearings and the direction field (`heatmodes.rs`).
    pub modes: crate::heatmodes::HeatModes,
    /// The level's structures and water, the structure depth and the peeled layers (`occlusion.rs`).
    pub occ: crate::occlusion::Occlusion,
    /// The heat shader, kept for the formats made on first use (the direction field's).
    m_splat: wgpu::ShaderModule,
    m_decay: wgpu::ShaderModule,
    m_merge: wgpu::ShaderModule,
    /// The GPU tracks (`tracks.rs`).
    pub tracks: crate::tracks::Tracks,
    /// Heat from tiles (`heattiles.rs`).
    pub tiles: crate::heattiles::HeatTiles,
    filter_pass: wgpu::ComputePipeline,
    bin: Option<HeatBin>,
    // Targets.
    width: u32,
    height: u32,
    heat_w: u32,
    heat_h: u32,
    heat_format: wgpu::TextureFormat,
    scene: Option<(wgpu::Texture, wgpu::TextureView)>,
    depth: Option<(wgpu::Texture, wgpu::TextureView)>,
    struct_depth: Option<(wgpu::Texture, wgpu::TextureView)>,
    heat_sets: Vec<((u32, u32, wgpu::TextureFormat), HeatSet)>,
    // Data.
    pub chunks: Vec<Option<GpuChunk>>,
    pub resident_rows: u64,
    pub dropped_rows: u64,
    pub gpu_bytes: u64,
    level: Option<GpuLevel>,
    /// The filters drawn, and the ones asked for while their columns are on the way.
    applied: Option<FilterSet>,
    wanted: Option<FilterSet>,
    pub missing_columns: Vec<(usize, String)>,
    /// Columns a chunk cannot have (the dataset has none such): their filter is left out there.
    failed_columns: std::collections::HashSet<(usize, String)>,
    has_time: bool,
    /// The difference split's column and the value weight's, as the last packet named them.
    value_cols: (String, String),
    // State carried between packets.
    last_frame: Option<Packet>,
    curve_dirty: bool,
    binned: bool,
    readbacks: Vec<Readback>,
    pending_capture: Option<Reply<Option<Captured>>>,
    /// Heat reads asked for: at most `max` values, once packet `after` is drawn, asked when
    /// (`request_heat_after`). Several may wait - the exposure's meter and its follower each read.
    pending_heat: Vec<(usize, u32, Instant, Reply<Option<Vec<f32>>>)>,
    pending_probe: Option<(f32, f32, Reply<Option<f32>>)>,
    pub stats: Stats,
    last_present: Option<Instant>,
}

pub(crate) fn tex2d(device: &wgpu::Device, label: &str, w: u32, h: u32, format: wgpu::TextureFormat, usage: wgpu::TextureUsages) -> (wgpu::Texture, wgpu::TextureView) {
    let t = device.create_texture(&wgpu::TextureDescriptor {
        label: Some(label),
        size: wgpu::Extent3d { width: w.max(1), height: h.max(1), depth_or_array_layers: 1 },
        mip_level_count: 1,
        sample_count: 1,
        dimension: wgpu::TextureDimension::D2,
        format,
        usage,
        view_formats: &[],
    });
    let v = t.create_view(&Default::default());
    (t, v)
}

pub(crate) fn module(device: &wgpu::Device, label: &str, src: &str) -> wgpu::ShaderModule {
    device.create_shader_module(wgpu::ShaderModuleDescriptor { label: Some(label), source: wgpu::ShaderSource::Wgsl(src.into()) })
}

fn compute(device: &wgpu::Device, m: &wgpu::ShaderModule, entry: &str) -> wgpu::ComputePipeline {
    device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
        label: Some(entry),
        layout: None,
        module: m,
        entry_point: Some(entry),
        compilation_options: Default::default(),
        cache: None,
    })
}

pub(crate) const ADD: wgpu::BlendState = wgpu::BlendState {
    color: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::One, dst_factor: wgpu::BlendFactor::One, operation: wgpu::BlendOperation::Add },
    alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::One, dst_factor: wgpu::BlendFactor::One, operation: wgpu::BlendOperation::Add },
};

pub(crate) fn render_pipe(
    device: &wgpu::Device,
    m: &wgpu::ShaderModule,
    vs: &str,
    fs: &str,
    format: wgpu::TextureFormat,
    blend: Option<wgpu::BlendState>,
    buffers: &[Option<wgpu::VertexBufferLayout>],
    depth: Option<wgpu::DepthStencilState>,
) -> wgpu::RenderPipeline {
    device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
        label: Some(fs),
        layout: None,
        vertex: wgpu::VertexState { module: m, entry_point: Some(vs), buffers, compilation_options: Default::default() },
        fragment: Some(wgpu::FragmentState {
            module: m,
            entry_point: Some(fs),
            targets: &[Some(wgpu::ColorTargetState { format, blend, write_mask: wgpu::ColorWrites::ALL })],
            compilation_options: Default::default(),
        }),
        primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
        depth_stencil: depth,
        multisample: Default::default(),
        multiview_mask: None,
        cache: None,
    })
}

const W_HEAT_SPLAT: &str = include_str!("../wgsl/heat_splat.wgsl");
const W_HEAT_BIN: &str = include_str!("../wgsl/heat_bin.wgsl");
const W_HEAT_LIST: &str = include_str!("../wgsl/heat_list.wgsl");
const W_HEAT_RESOLVE: &str = include_str!("../wgsl/heat_resolve.wgsl");
const W_HEAT_LUT: &str = include_str!("../wgsl/heat_lut.wgsl");
const W_HEAT_FOLD: &str = include_str!("../wgsl/heat_fold.wgsl");
const W_FILTER: &str = include_str!("../wgsl/filter_pass.wgsl");
const W_DECAY: &str = include_str!("../wgsl/decay.wgsl");
const W_MERGE: &str = include_str!("../wgsl/merge.wgsl");
const W_COMPOSITE: &str = include_str!("../wgsl/composite.wgsl");
const W_MESH: &str = include_str!("../wgsl/mesh.wgsl");
const W_LINE: &str = include_str!("../wgsl/line.wgsl");

impl Renderer {
    /// A device on `adapter`, drawing its output in `out_format` (the surface's, or an offscreen one).
    pub fn new(adapter: &wgpu::Adapter, out_format: wgpu::TextureFormat) -> anyhow::Result<Self> {
        let info = adapter.get_info();
        let have = adapter.features();
        // Float32 heat where the card blends and filters it (the web's `float32-blendable`): the
        // adapter's own format capabilities, which wgpu exposes behind this feature.
        let want = wgpu::Features::FLOAT32_FILTERABLE | wgpu::Features::TEXTURE_ADAPTER_SPECIFIC_FORMAT_FEATURES;
        let f32_ok = |f: wgpu::TextureFormat| {
            let flags = adapter.get_texture_format_features(f).flags;
            flags.contains(wgpu::TextureFormatFeatureFlags::BLENDABLE | wgpu::TextureFormatFeatureFlags::FILTERABLE)
        };
        let heat_f32 = have.contains(want) && f32_ok(wgpu::TextureFormat::R32Float) && f32_ok(wgpu::TextureFormat::Rgba32Float);
        let mut limits = adapter.limits();
        // As much as the card gives: one binding per chunk, up to 2 GiB.
        limits.max_storage_buffer_binding_size = limits.max_storage_buffer_binding_size.min(2_147_483_644);
        let (device, queue) = pollster::block_on(adapter.request_device(&wgpu::DeviceDescriptor {
            label: Some("3DHeat viewport"),
            required_features: if heat_f32 { want } else { wgpu::Features::empty() },
            required_limits: limits,
            ..Default::default()
        }))?;
        device.on_uncaptured_error(Arc::new(|e| crate::note(&format!("viewport: GPU error: {e:?}"))));
        let heat_format = if heat_f32 { wgpu::TextureFormat::R32Float } else { wgpu::TextureFormat::R16Float };

        let sampler = device.create_sampler(&wgpu::SamplerDescriptor {
            mag_filter: wgpu::FilterMode::Linear,
            min_filter: wgpu::FilterMode::Linear,
            mipmap_filter: wgpu::MipmapFilterMode::Linear,
            address_mode_u: wgpu::AddressMode::ClampToEdge,
            address_mode_v: wgpu::AddressMode::ClampToEdge,
            ..Default::default()
        });
        let tex_usage = wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::COPY_DST;
        let (lut_tex, lut_view) = tex2d(&device, "colour ramp", LUT_WIDTH, LUT_HEIGHT, wgpu::TextureFormat::Rgba8Unorm, tex_usage);
        let (curve_tex, curve_view) = tex2d(&device, "sprite ramp curve", CURVE_LUT_SIZE, 1, wgpu::TextureFormat::R16Float, tex_usage);
        let storage = wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST;
        let buf = |label: &str, size: u64, usage: wgpu::BufferUsages| device.create_buffer(&wgpu::BufferDescriptor { label: Some(label), size, usage, mapped_at_creation: false });
        let block_buf = buf("block starts", MAX_PLAN_BLOCKS as u64 * 4, storage);
        let sign_buf = buf("sign tables", (SIGN_TABLE_SIZE * 2 * 4) as u64, storage);
        let volume_buf = buf("volumes", VOLUME_BLOCK_FLOATS as u64 * 4, wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST);
        let filter_table = buf("filter table", 4096, storage);
        let empty = buf("empty storage", 16, storage);
        let ring = Ring { buf: buf("uniforms", RING_BYTES, wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST), data: Vec::with_capacity(1 << 20) };
        // The level's atlas placeholder: opaque white, one tile entry.
        let (atlas_tex, atlas_view) = tex2d(&device, "atlas placeholder", 1, 1, wgpu::TextureFormat::Rgba8Unorm, tex_usage);
        queue.write_texture(
            wgpu::TexelCopyTextureInfo { texture: &atlas_tex, mip_level: 0, origin: Default::default(), aspect: Default::default() },
            &[255, 255, 255, 255],
            wgpu::TexelCopyBufferLayout { offset: 0, bytes_per_row: Some(4), rows_per_image: None },
            wgpu::Extent3d { width: 1, height: 1, depth_or_array_layers: 1 },
        );
        let atlas_tiles = buf("atlas tiles", 16, storage);
        // Everything visible by default, as the page's first frame has it.
        let signs: Vec<f32> = (0..SIGN_TABLE_SIZE * 2).map(|i| if i < SIGN_TABLE_SIZE { 1.0 } else { 0.0 }).collect();
        queue.write_buffer(&sign_buf, 0, bytemuck::cast_slice(&signs));

        let m_splat = module(&device, "heat", W_HEAT_SPLAT);
        let m_decay = module(&device, "decay", W_DECAY);
        let m_merge = module(&device, "merge", W_MERGE);
        let m_comp = module(&device, "composite", W_COMPOSITE);
        let m_mesh = module(&device, "mesh", W_MESH);
        let m_filter = module(&device, "filter pass", W_FILTER);
        let heat_formats =
            if heat_f32 { [wgpu::TextureFormat::R32Float, wgpu::TextureFormat::Rgba32Float] } else { [wgpu::TextureFormat::R16Float, wgpu::TextureFormat::Rgba16Float] };
        let decay_blend = wgpu::BlendState {
            color: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::Zero, dst_factor: wgpu::BlendFactor::Src, operation: wgpu::BlendOperation::Add },
            alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::Zero, dst_factor: wgpu::BlendFactor::Src, operation: wgpu::BlendOperation::Add },
        };
        let mut splat = HashMap::new();
        let mut decay = HashMap::new();
        let mut merge = HashMap::new();
        for f in heat_formats {
            splat.insert(f, render_pipe(&device, &m_splat, "vsHeat", "fsHeat", f, Some(ADD), &[], None));
            decay.insert(f, render_pipe(&device, &m_decay, "vsFullscreen", "fsDecay", f, Some(decay_blend), &[], None));
            merge.insert(f, render_pipe(&device, &m_merge, "vsFullscreen", "fsMerge", f, Some(ADD), &[], None));
        }
        let composite = render_pipe(&device, &m_comp, "vsFullscreen", "fsComposite", out_format, None, &[], None);
        let vbuf =
            |stride: u64, attrs: &'static [wgpu::VertexAttribute]| wgpu::VertexBufferLayout { array_stride: stride, step_mode: wgpu::VertexStepMode::Vertex, attributes: attrs };
        const POS_NORMAL: [wgpu::VertexAttribute; 2] = wgpu::vertex_attr_array![0 => Float32x3, 1 => Float32x3];
        const COLOUR: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![2 => Float32x3];
        const UV: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![3 => Float32x2];
        const TILE: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![4 => Uint32];
        let alpha_blend = wgpu::BlendState {
            color: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::SrcAlpha, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
            alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::One, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
        };
        let mesh = render_pipe(
            &device,
            &m_mesh,
            "vsMesh",
            "fsMesh",
            SCENE_FORMAT,
            Some(alpha_blend),
            &[Some(vbuf(24, &POS_NORMAL)), Some(vbuf(12, &COLOUR)), Some(vbuf(8, &UV)), Some(vbuf(4, &TILE))],
            // Reverse-Z: nearer is larger, an equal depth passes (`GPU_DEPTH_TEST`).
            Some(wgpu::DepthStencilState {
                format: DEPTH_FORMAT,
                depth_write_enabled: Some(true),
                depth_compare: Some(wgpu::CompareFunction::GreaterEqual),
                stencil: Default::default(),
                bias: Default::default(),
            }),
        );
        let filter_pass = compute(&device, &m_filter, "main");
        let figures = crate::figures::Figures::new(&device, out_format);
        let overlays = crate::overlays::Overlays::new(&device, out_format);
        let ranges = crate::ranges::Ranges::new(&device);
        let modes = crate::heatmodes::HeatModes::new(&device, out_format);
        let occ = crate::occlusion::Occlusion::new(&device);
        let tracks = crate::tracks::Tracks::new(&device);
        let m_line = module(&device, "line", W_LINE);
        const LINE_ATTRS: [wgpu::VertexAttribute; 2] = wgpu::vertex_attr_array![0 => Float32x3, 1 => Float32x4];
        let line = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("line"),
            layout: None,
            vertex: wgpu::VertexState { module: &m_line, entry_point: Some("vsLine"), buffers: &[Some(vbuf(28, &LINE_ATTRS))], compilation_options: Default::default() },
            fragment: Some(wgpu::FragmentState {
                module: &m_line,
                entry_point: Some("fsLine"),
                targets: &[Some(wgpu::ColorTargetState { format: SCENE_FORMAT, blend: Some(alpha_blend), write_mask: wgpu::ColorWrites::ALL })],
                compilation_options: Default::default(),
            }),
            primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::LineList, ..Default::default() },
            depth_stencil: Some(wgpu::DepthStencilState {
                format: DEPTH_FORMAT,
                depth_write_enabled: Some(false),
                depth_compare: Some(wgpu::CompareFunction::GreaterEqual),
                stencil: Default::default(),
                bias: Default::default(),
            }),
            multisample: Default::default(),
            multiview_mask: None,
            cache: None,
        });

        let bin = {
            let m_bin = module(&device, "heat bin", W_HEAT_BIN);
            let m_list = module(&device, "heat bin list", W_HEAT_LIST);
            let m_res = module(&device, "heat bin resolve", W_HEAT_RESOLVE);
            let m_lut = module(&device, "heat bin kernel", W_HEAT_LUT);
            let m_fold = module(&device, "heat bin fold", W_HEAT_FOLD);
            let mut fold = HashMap::new();
            let mut list_pipe = HashMap::new();
            for f in heat_formats {
                fold.insert(f, render_pipe(&device, &m_fold, "vsFold", "fsFold", f, Some(ADD), &[], None));
                list_pipe.insert(f, render_pipe(&device, &m_list, "vsHeat", "fsHeat", f, Some(ADD), &[], None));
            }
            let lut_n = (BIN_LUT_LEVELS * BIN_LUT_SIDE * BIN_LUT_SIDE) as u64;
            Some(HeatBin {
                bin: compute(&device, &m_bin, "csBin"),
                resolve: compute(&device, &m_res, "csResolve"),
                dilate: compute(&device, &m_res, "csDilate"),
                lut: compute(&device, &m_lut, "csLut"),
                args_pipe: compute(&device, &m_fold, "csArgs"),
                fold,
                list_pipe,
                params: buf("heat bin params", BIN_PARAM_BYTES as u64, wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST),
                lut_params: buf("heat bin kernel params", 16, wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST),
                lut_buf: buf("heat bin kernel", lut_n * 8, storage),
                list: buf("heat bin list", (BIN_LIST_HEAD + BIN_LIST_ROWS) as u64 * 4, storage | wgpu::BufferUsages::COPY_SRC),
                args: buf("heat bin draws", BIN_SLOTS as u64 * 16, wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::INDIRECT),
                bins: None,
                grid: None,
                lut_key: String::new(),
                idle: 0,
            })
        };

        let stats = Stats { adapter: info.name.clone(), backend: format!("{:?}", info.backend), heat_format: format!("{heat_format:?}"), ..Default::default() };
        Ok(Self {
            device,
            queue,
            info,
            out_format,
            heat_f32,
            ring,
            sampler,
            lut_tex,
            lut_view,
            curve_tex,
            curve_view,
            block_buf,
            sign_buf,
            signs,
            volume_buf,
            filter_table,
            empty,
            atlas_view,
            atlas_tiles,
            splat,
            decay,
            merge,
            composite,
            mesh,
            line,
            grid: None,
            figures,
            overlays,
            ranges,
            modes,
            occ,
            m_splat,
            m_decay,
            m_merge,
            tracks,
            tiles: Default::default(),
            filter_pass,
            bin,
            width: 0,
            height: 0,
            heat_w: 0,
            heat_h: 0,
            heat_format,
            scene: None,
            depth: None,
            struct_depth: None,
            heat_sets: Vec::new(),
            chunks: Vec::new(),
            resident_rows: 0,
            dropped_rows: 0,
            gpu_bytes: 0,
            level: None,
            applied: None,
            wanted: None,
            missing_columns: Vec::new(),
            failed_columns: Default::default(),
            has_time: false,
            value_cols: (String::new(), String::new()),
            last_frame: None,
            curve_dirty: true,
            binned: false,
            readbacks: Vec::new(),
            pending_capture: None,
            pending_heat: Vec::new(),
            pending_probe: None,
            stats,
            last_present: None,
        })
    }

    pub fn heat_precision_f32(&self) -> bool {
        self.heat_f32
    }

    // ------------------------------------------------------------ data

    /// Drops every chunk (a new dataset follows, or none).
    pub fn clear_dataset(&mut self, has_time: bool) {
        self.chunks.clear();
        self.resident_rows = 0;
        self.dropped_rows = 0;
        self.gpu_bytes = 0;
        self.applied = None;
        self.wanted = None;
        self.missing_columns.clear();
        self.failed_columns.clear();
        self.has_time = has_time;
        self.modes.clear();
    }

    pub fn add_chunk(&mut self, c: GpuChunk) {
        let i = c.index;
        if self.chunks.len() <= i {
            self.chunks.resize_with(i + 1, || None);
        }
        self.resident_rows += c.rows as u64;
        self.gpu_bytes += c.bytes;
        // Filters already asked for need this chunk's columns too; until they come it is not drawn.
        let mut names: Vec<String> = self.wanted.as_ref().or(self.applied.as_ref()).map(|set| set.filters.iter().map(|f| f.column.clone()).collect()).unwrap_or_default();
        names.extend([self.value_cols.0.clone(), self.value_cols.1.clone()].into_iter().filter(|n| !n.is_empty()));
        for name in names {
            if !self.missing_columns.iter().any(|(k, n)| *k == i && *n == name) {
                self.missing_columns.push((i, name));
            }
        }
        self.chunks[i] = Some(c);
    }

    /// Whether a chunk has every column the drawn filters read (or cannot have it).
    fn filterable(&self, chunk: &GpuChunk) -> bool {
        self.applied.as_ref().is_none_or(|a| a.filters.iter().all(|f| chunk.columns.contains_key(&f.column) || self.failed_columns.contains(&(chunk.index, f.column.clone()))))
    }

    pub fn add_column(&mut self, chunk: usize, name: String, buffer: wgpu::Buffer) {
        if let Some(Some(c)) = self.chunks.get_mut(chunk) {
            self.gpu_bytes += buffer.size();
            c.columns.insert(name.clone(), buffer);
        }
        self.missing_columns.retain(|(k, n)| !(*k == chunk && *n == name));
    }

    pub fn set_level(&mut self, level: Option<&LevelMesh>) {
        self.occ.set_level(&self.device, level.filter(|l| !l.indices.is_empty() && l.vertices.len() >= 6));
        self.level = level.filter(|l| !l.indices.is_empty() && l.vertices.len() >= 6).map(|l| {
            let n = l.vertices.len() / 6;
            let vb = |label: &str, data: &[u8], usage: wgpu::BufferUsages| {
                self.device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some(label), contents: data, usage })
            };
            let white;
            let colours: &[f32] = match &l.colours {
                Some(c) if c.len() >= n * 3 => c,
                _ => {
                    white = vec![1f32; n * 3];
                    &white
                }
            };
            let uvs = vec![-1f32; n * 2];
            let vertices = vb("level verts", bytemuck::cast_slice(&l.vertices), wgpu::BufferUsages::VERTEX);
            let colours = vb("level colours", bytemuck::cast_slice(colours), wgpu::BufferUsages::VERTEX);
            let uvs = vb("level uvs", bytemuck::cast_slice(&uvs), wgpu::BufferUsages::VERTEX);
            let tiles = self.device.create_buffer(&wgpu::BufferDescriptor {
                label: Some("level tiles (none)"),
                size: (n * 4).max(4) as u64,
                usage: wgpu::BufferUsages::VERTEX,
                mapped_at_creation: false,
            });
            let indices = vb("level ground indices", bytemuck::cast_slice(&l.indices), wgpu::BufferUsages::INDEX);
            let bytes = vertices.size() + colours.size() + uvs.size() + tiles.size() + indices.size();
            GpuLevel { vertices, colours, uvs, tiles, indices, count: l.indices.len() as u32, bytes }
        });
    }

    pub fn level_bytes(&self) -> u64 {
        self.level.as_ref().map_or(0, |l| l.bytes + self.occ.bytes)
    }

    /// The filter columns the asked-for filters still need, chunk by chunk (fetched by the caller).
    pub fn wanted_columns(&self) -> Vec<(usize, String)> {
        self.missing_columns.clone()
    }

    // ------------------------------------------------------------ targets

    fn ensure_targets(&mut self, width: u32, height: u32, heat_scale: f32, channels: u32) {
        let hw = ((width as f32 * heat_scale).round() as u32).max(1);
        let hh = ((height as f32 * heat_scale).round() as u32).max(1);
        let format = match (channels, self.heat_f32) {
            (4, true) => wgpu::TextureFormat::Rgba32Float,
            (4, false) => wgpu::TextureFormat::Rgba16Float,
            (_, true) => wgpu::TextureFormat::R32Float,
            (_, false) => wgpu::TextureFormat::R16Float,
        };
        if width != self.width || height != self.height || self.scene.is_none() {
            let att = wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::TEXTURE_BINDING;
            self.scene = Some(tex2d(&self.device, "scene", width, height, SCENE_FORMAT, att));
            self.depth = Some(tex2d(&self.device, "depth", width, height, DEPTH_FORMAT, att));
            // The nearest structure surface; nothing draws it yet, so it holds the far plane
            // (0, a new texture's zeros) and the heat tells terrain from walls as with no walls.
            self.struct_depth = Some(tex2d(&self.device, "structure depth", width, height, DEPTH_FORMAT, att));
            self.heat_sets.clear();
            self.width = width;
            self.height = height;
        }
        self.heat_w = hw;
        self.heat_h = hh;
        self.heat_format = format;
        let key = (hw, hh, format);
        if let Some(i) = self.heat_sets.iter().position(|(k, _)| *k == key) {
            let s = self.heat_sets.remove(i);
            self.heat_sets.push(s);
        } else {
            let usage = wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::COPY_SRC;
            let (tex, view) = tex2d(&self.device, "heat", hw, hh, format, usage);
            let (scratch, scratch_view) = tex2d(&self.device, "heat scratch", hw, hh, format, usage);
            self.heat_sets.push((key, HeatSet { tex, view, scratch_view, _scratch: scratch }));
            // A few levels kept: the heat's resolution moves in powers of two with the sprites.
            while self.heat_sets.len() > 4 {
                self.heat_sets.remove(0);
            }
        }
    }

    fn heat(&self) -> &HeatSet {
        &self.heat_sets.last().expect("heat targets").1
    }

    // ------------------------------------------------------------ frames

    /// Takes a packet's tables, and its frame, without drawing (a frame that is not shown).
    fn take_tables(&mut self, p: &Packet) {
        if let Some(lut) = &p.color_lut {
            if lut.len() >= (LUT_WIDTH * LUT_HEIGHT * 4) as usize {
                self.queue.write_texture(
                    wgpu::TexelCopyTextureInfo { texture: &self.lut_tex, mip_level: 0, origin: Default::default(), aspect: Default::default() },
                    &lut[..(LUT_WIDTH * LUT_HEIGHT * 4) as usize],
                    wgpu::TexelCopyBufferLayout { offset: 0, bytes_per_row: Some(LUT_WIDTH * 4), rows_per_image: None },
                    wgpu::Extent3d { width: LUT_WIDTH, height: LUT_HEIGHT, depth_or_array_layers: 1 },
                );
            }
        }
        if let Some(curve) = &p.curve_lut {
            if curve.len() == CURVE_LUT_SIZE as usize {
                let half: Vec<u16> = curve.iter().map(|v| f16_bits(*v)).collect();
                self.queue.write_texture(
                    wgpu::TexelCopyTextureInfo { texture: &self.curve_tex, mip_level: 0, origin: Default::default(), aspect: Default::default() },
                    bytemuck::cast_slice(&half),
                    wgpu::TexelCopyBufferLayout { offset: 0, bytes_per_row: Some(CURVE_LUT_SIZE * 2), rows_per_image: None },
                    wgpu::Extent3d { width: CURVE_LUT_SIZE, height: 1, depth_or_array_layers: 1 },
                );
                self.curve_dirty = true;
            }
        }
        if let Some(s) = &p.signs {
            if s.len() == SIGN_TABLE_SIZE * 2 && *s != self.signs {
                self.signs.clone_from(s);
                self.queue.write_buffer(&self.sign_buf, 0, bytemuck::cast_slice(s));
            }
        }
        if let Some(v) = &p.volumes {
            if v.len() == VOLUME_BLOCK_FLOATS as usize {
                self.queue.write_buffer(&self.volume_buf, 0, bytemuck::cast_slice(v));
            }
        }
        if let Some(f) = &p.filters {
            self.want_filters(f.clone());
        }
        if let Some(top) = &p.top {
            self.figures.take_top(&self.device, top);
        }
        if let Some(o) = &p.overlays {
            self.overlays.take(&self.device, o);
        }
        if let Some(r) = &p.ranges {
            self.ranges.take(&self.device, &self.queue, r);
        }
        if let Some(v) = &p.values {
            self.value_cols = v.clone();
            for name in [v.0.clone(), v.1.clone()] {
                if name.is_empty() {
                    continue;
                }
                for c in self.chunks.iter().flatten() {
                    let k = (c.index, name.clone());
                    if !c.columns.contains_key(&name) && !self.failed_columns.contains(&k) && !self.missing_columns.contains(&k) {
                        self.missing_columns.push(k);
                    }
                }
            }
        }
    }

    /// `ensureFilterValues` with no filters (they are pass bits): the split's column, then the
    /// weight's, copied on the GPU from the chunk's own columns into one buffer. The slots (-1 for
    /// a column the dataset does not have), or None while a column is still on its way: the chunk
    /// is then left out, as with filters, rather than drawn unsplit or unweighted.
    fn ensure_values(&mut self, encoder: &mut wgpu::CommandEncoder, chunk: usize) -> Option<(i32, i32)> {
        let (split, weight) = self.value_cols.clone();
        let key = format!("{split}#{weight}");
        let device = self.device.clone();
        let split_failed = self.failed_columns.contains(&(chunk, split.clone()));
        let weight_failed = self.failed_columns.contains(&(chunk, weight.clone()));
        let Some(Some(c)) = self.chunks.get_mut(chunk) else { return None };
        if c.values_key == key {
            return Some((c.split_slot, c.weight_slot));
        }
        let mut srcs: Vec<wgpu::Buffer> = Vec::new();
        let mut slots = [-1i32, -1i32];
        for (k, (name, gone)) in [(&split, split_failed), (&weight, weight_failed)].into_iter().enumerate() {
            if name.is_empty() || gone {
                continue;
            }
            let b = c.columns.get(name)?;
            slots[k] = srcs.len() as i32;
            srcs.push(b.clone());
        }
        let row_bytes = c.rows as u64 * 4;
        if let Some(old) = c.values.take() {
            self.gpu_bytes = self.gpu_bytes.saturating_sub(old.size());
        }
        if !srcs.is_empty() {
            let buf = device.create_buffer(&wgpu::BufferDescriptor {
                label: Some("filter values"),
                size: (row_bytes * srcs.len() as u64).max(4),
                usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
                mapped_at_creation: false,
            });
            for (k, src) in srcs.iter().enumerate() {
                encoder.copy_buffer_to_buffer(src, 0, &buf, k as u64 * row_bytes, row_bytes);
            }
            self.gpu_bytes += buf.size();
            c.values = Some(buf);
        }
        c.values_key = key;
        c.split_slot = slots[0];
        c.weight_slot = slots[1];
        Some((slots[0], slots[1]))
    }

    /// New filters: drawn once every drawn chunk has their columns, the old ones until then
    /// (`FilterStaging`: the heat never mixes chunks filtered two ways).
    fn want_filters(&mut self, f: FilterSet) {
        let mut missing = Vec::new();
        // The split's and the weight's columns stay wanted when the filters change.
        let values = [self.value_cols.0.clone(), self.value_cols.1.clone()];
        let names = f.filters.iter().map(|flt| flt.column.clone()).chain(values.into_iter().filter(|n| !n.is_empty()));
        for name in names {
            for c in self.chunks.iter().flatten() {
                if !c.columns.contains_key(&name) && !self.failed_columns.contains(&(c.index, name.clone())) {
                    missing.push((c.index, name.clone()));
                }
            }
        }
        missing.sort();
        missing.dedup();
        self.missing_columns = missing;
        self.wanted = Some(f);
        self.promote_filters();
    }

    fn promote_filters(&mut self) {
        if self.missing_columns.is_empty() {
            if let Some(w) = self.wanted.take() {
                let table: &[u32] = &w.table;
                let bytes = (table.len() * 4).max(16) as u64;
                if bytes > self.filter_table.size() {
                    self.filter_table = self.device.create_buffer(&wgpu::BufferDescriptor {
                        label: Some("filter table"),
                        size: align(bytes * 2, 256),
                        usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
                        mapped_at_creation: false,
                    });
                }
                if !table.is_empty() {
                    self.queue.write_buffer(&self.filter_table, 0, bytemuck::cast_slice(table));
                }
                self.applied = Some(w);
            }
        }
        // The split's or the weight's column on its way counts too: the page keeps drawing until it lands.
        let values = [&self.value_cols.0, &self.value_cols.1];
        self.stats.filters_pending = self.wanted.is_some() || self.missing_columns.iter().any(|(_, n)| values.iter().any(|v| !v.is_empty() && *v == n));
    }

    /// A column a chunk lacked has arrived, or will never: try the filters again.
    pub fn columns_settled(&mut self) {
        self.promote_filters();
    }

    /// Drops a column nobody can give (the dataset has no such column): its filter is left out.
    pub fn column_failed(&mut self, chunk: usize, name: &str) {
        self.missing_columns.retain(|(k, n)| !(*k == chunk && n == name));
        self.failed_columns.insert((chunk, name.to_owned()));
        self.promote_filters();
    }

    /// Draws one packet's frame into `out` (a surface texture or an offscreen one), at `at` in it.
    pub fn draw(&mut self, packets: &[Packet], out: &wgpu::TextureView, out_size: (u32, u32), capture: bool) {
        let t0 = Instant::now();
        self.ring.data.clear();
        let mut encoder = self.device.create_command_encoder(&wgpu::CommandEncoderDescriptor { label: Some("frame") });
        self.figures.begin();
        let mut last: Option<Packet> = None;
        // The GPU tracks are placed and drawn for the last packet drawn only: an earlier packet's scene
        // is drawn over by the next (its heat pass is what counts), and placing every unit again for
        // each packet that queued up made a present cost as many placements and figure draws.
        let last_scene = packets.iter().rposition(|p| p.frame.is_some() && !p.flag(F_COMPOSITE_ONLY));
        for (i, p) in packets.iter().enumerate() {
            self.take_tables(p);
            if let Some(t) = &p.tracks {
                self.tracks.take_vis(&self.queue, t);
            }
            if p.frame.is_none() {
                continue;
            }
            self.stats.packets += 1;
            self.stats.last_seq = p.seq;
            let width = (p.f(F_WIDTH) as u32).max(1);
            let height = (p.f(F_HEIGHT) as u32).max(1);
            let channels = if p.flag(F_TEAM_COLORS) || p.flag(F_RATE_ON) { 4 } else { 1 };
            self.ensure_targets(width, height, p.f(F_HEAT_SCALE).max(1e-3), channels);
            if !p.flag(F_COMPOSITE_ONLY) {
                self.draw_scene(&mut encoder, p, Some(i) == last_scene);
                self.structure_depth(&mut encoder, p);
                self.peel_layers(&mut encoder, p);
                if p.f(F_MODE) as u32 != 4 {
                    self.draw_heat(&mut encoder, p, false);
                    if p.f(F_DIR_FIELD) > 0.0 {
                        self.draw_heat(&mut encoder, p, true);
                    }
                } else {
                    self.clear_heat(&mut encoder);
                }
            }
            last = Some(p.clone());
        }
        let p = match last.or_else(|| self.last_frame.clone()) {
            Some(p) => p,
            None => {
                // Nothing asked yet: the scene's background colour.
                let pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                    label: Some("empty"),
                    color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                        view: out,
                        resolve_target: None,
                        depth_slice: None,
                        ops: wgpu::Operations {
                            load: wgpu::LoadOp::Clear(wgpu::Color { r: SCENE_CLEAR[0], g: SCENE_CLEAR[1], b: SCENE_CLEAR[2], a: 1.0 }),
                            store: wgpu::StoreOp::Store,
                        },
                    })],
                    depth_stencil_attachment: None,
                    timestamp_writes: None,
                    occlusion_query_set: None,
                    multiview_mask: None,
                });
                drop(pass);
                self.queue.submit(Some(encoder.finish()));
                return;
            }
        };
        if self.scene.is_none() {
            let channels = if p.flag(F_TEAM_COLORS) { 4 } else { 1 };
            self.ensure_targets((p.f(F_WIDTH) as u32).max(1), (p.f(F_HEIGHT) as u32).max(1), p.f(F_HEAT_SCALE).max(1e-3), channels);
        }
        self.composite_into(&mut encoder, &p, out, out_size, false);
        if capture || self.pending_capture.is_some() {
            self.capture(&mut encoder, &p);
        }
        if !self.pending_heat.is_empty() {
            self.read_heat(&mut encoder);
        }
        if self.pending_probe.is_some() {
            self.probe(&mut encoder);
        }
        if !self.ring.data.is_empty() {
            self.queue.write_buffer(&self.ring.buf, 0, &self.ring.data);
        }
        self.figures.flush(&self.queue);
        self.queue.submit(Some(encoder.finish()));
        self.map_readbacks();
        self.last_frame = Some(p);
        let now = Instant::now();
        self.stats.cpu.push((now - t0).as_secs_f32() * 1e3);
        self.stats.frames += 1;
        self.stats.resident_rows = self.resident_rows;
        self.stats.dropped_rows = self.dropped_rows;
        self.stats.gpu_bytes = self.gpu_bytes + self.modes.bytes;
        self.stats.level_bytes = self.level_bytes();
        self.stats.binned = self.binned;
    }

    /// After the frame was presented: the present-to-present interval.
    pub fn presented(&mut self) {
        let now = Instant::now();
        if let Some(prev) = self.last_present {
            self.stats.intervals.push((now - prev).as_secs_f32() * 1e3);
            if self.stats.intervals.len() > 100_000 {
                self.stats.intervals.drain(..50_000);
                self.stats.cpu.drain(..self.stats.cpu.len().min(50_000));
            }
        }
        self.last_present = Some(now);
    }

    fn scene_uniform(&self, p: &Packet, fade: (f32, f32), size: f32, brightness: f32, relief: bool, vertex_colour: bool) -> Vec<u8> {
        // `pushSceneUniform`.
        let mut u = [0f32; SCENE_UNIFORM_BYTES / 4];
        let f = p.frame.as_ref().unwrap();
        u[..16].copy_from_slice(&f[F_VIEW_PROJ..F_VIEW_PROJ + 16]);
        u[16..19].copy_from_slice(&f[F_CAMERA_POS..F_CAMERA_POS + 3]);
        // The figures' spinning parts' clock (camera.w), the page's.
        u[19] = p.f(F_SPIN_TIME);
        u[20] = fade.0;
        u[21] = fade.1;
        u[22] = size;
        u[23] = brightness;
        u[24] = 1.0;
        u[25] = 1.0;
        u[26] = 1.0;
        u[27] = 0.0;
        if relief {
            u[28] = p.f(F_RELIEF_SLOPE);
            u[29] = p.f(F_RELIEF_SPACING);
            u[30] = p.f(F_RELIEF_STRENGTH);
            u[31] = p.f(F_RELIEF_INDEX_EVERY);
            u[32] = p.f(F_RELIEF_ELEV_RANGE);
            u[33] = p.f(F_RELIEF_LOW_Y);
            u[34] = p.f(F_RELIEF_HIGH_Y);
        } else {
            u[34] = 1.0;
        }
        u[35] = 0.0;
        let slice = p.flag(F_SLICE_ON);
        u[36] = if slice { p.f(F_SLICE_AXIS) } else { -1.0 };
        u[37] = if slice { p.f(F_SLICE_MIN) } else { 0.0 };
        u[38] = if slice { p.f(F_SLICE_MAX) } else { 0.0 };
        u[39] = if slice { p.f(F_SLICE_OUTSIDE) } else { 1.0 };
        let cull = p.flag(F_CULL_GEOMETRY);
        u[40..43].copy_from_slice(&f[F_CAMERA_FORWARD..F_CAMERA_FORWARD + 3]);
        u[43] = if p.flag(F_CULL_PLANAR) { 1.0 } else { 0.0 };
        u[44] = if cull { p.f(F_CULL_NEAR).max(0.0) } else { 0.0 };
        u[45] = if cull { p.f(F_CULL_FAR).max(0.0) } else { 0.0 };
        u[46] = if vertex_colour { 1.0 } else { 0.0 };
        u[47] = 0.0;
        bytemuck::cast_slice(&u).to_vec()
    }

    fn draw_scene(&mut self, encoder: &mut wgpu::CommandEncoder, p: &Packet, last: bool) {
        let ground = if p.flag(F_LEVEL_ON) && self.level.is_some() {
            let u = self.scene_uniform(p, (1e9, 1e9 + 1.0), p.f(F_LEVEL_OPACITY), p.f(F_LEVEL_BRIGHTNESS), true, p.flag(F_LEVEL_COLOURS));
            Some(self.ring.push(&u, 256))
        } else {
            None
        };
        let grid_on = p.flag(F_SHOW_GRID) || p.flag(F_SHOW_AXES);
        let grid_off = if grid_on {
            self.ensure_grid(p);
            let ext = p.f(F_GRID_EXTENT);
            let u = self.scene_uniform(p, (ext * 0.35, ext * 1.15), 0.0, 1.0, false, false);
            Some(self.ring.push(&u, 256))
        } else {
            None
        };
        let grid_group = grid_off.map(|off| {
            self.device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: Some("grid"),
                layout: &self.line.get_bind_group_layout(0),
                entries: &[wgpu::BindGroupEntry { binding: 0, resource: self.ring.binding(off, SCENE_UNIFORM_BYTES) }],
            })
        });
        // The figures and cubes: their instances in the frame's vertex buffer, their uniforms as
        // `drawScene` pushes them (the cubes' size, the look lines' length, the figures relative to the origin).
        let figs = self.figures.prepare(&self.device, &self.queue, p);
        // The GPU tracks placed first, in a compute pass of their own (`drawScene`).
        let tracks_on = self.tracks.compute(&self.queue, encoder, p.tracks.as_ref().filter(|_| last));
        let fig_groups = if figs.is_empty() && !tracks_on {
            None
        } else {
            let far = (1e9, 1e9 + 1.0);
            let cube = self.scene_uniform(p, far, p.f(F_CUBE_SIZE), 1.0, false, false);
            let look = self.scene_uniform(p, far, p.f(F_LOOK_LENGTH), 1.0, false, false);
            let mut rel = self.scene_uniform(p, far, 0.0, 1.0, false, false);
            {
                let f = p.frame.as_ref().unwrap();
                let mut put = |lane: usize, v: f32| rel[lane * 4..lane * 4 + 4].copy_from_slice(&v.to_le_bytes());
                for k in 0..16 {
                    put(k, f[F_VIEW_PROJ_REL + k]);
                }
                for k in 0..3 {
                    put(16 + k, f[F_CAMERA_POS + k] - f[F_ORIGIN + k]);
                }
            }
            let plain = self.scene_uniform(p, far, 0.0, 1.0, false, false);
            // The glyphs' uniforms (`GpuSymbols.write`): the view, the canvas, the style, the camera, the sides.
            let mut glyph_uniform = |gl: &crate::packet::Glyphs| {
                let f = p.frame.as_ref().unwrap();
                let mut u = vec![0f32; SYMBOL_UNIFORM_FLOATS as usize];
                u[..16].copy_from_slice(&f[F_VIEW_PROJ..F_VIEW_PROJ + 16]);
                u[16] = p.f(F_WIDTH);
                u[17] = p.f(F_HEIGHT);
                u[18] = gl.style;
                u[19] = gl.mode;
                u[20] = gl.ticks;
                u[21] = 1.0;
                u[24..27].copy_from_slice(&f[F_CAMERA_POS..F_CAMERA_POS + 3]);
                let n = gl.sides.len().min(64);
                u[28..28 + n].copy_from_slice(&gl.sides[..n]);
                self.ring.push(bytemuck::cast_slice(&u), 256)
            };
            let glyph = p.glyphs.as_ref().filter(|_| crate::figures::Figures::has_glyphs(&figs)).map(&mut glyph_uniform);
            // The GPU tracks' glyph run, with the frame's symbol settings (`drawGlyphs`).
            let track_glyph = p.tracks.as_ref().and_then(|t| t.glyphs.as_ref()).filter(|_| tracks_on).map(glyph_uniform);
            let (c, l, r, o) = (self.ring.push(&cube, 256), self.ring.push(&look, 256), self.ring.push(&rel, 256), self.ring.push(&plain, 256));
            let g = |off| self.figures.group(&self.device, &self.ring.buf, off);
            let glyph = glyph.and_then(|off| self.figures.glyph_group(&self.device, &self.ring.buf, off));
            let track_glyph = track_glyph.and_then(|off| self.figures.glyph_group(&self.device, &self.ring.buf, off));
            Some((g(c), p.flag(F_SHOW_LOOK).then(|| g(l)), g(r), g(o), glyph, track_glyph, o))
        };
        let ov = self.overlay_groups(p, true, (0.0, 0.0));
        let rg = self.range_groups(encoder, p);
        let occ = self.occlusion_groups(p);
        let scene = &self.scene.as_ref().unwrap().1;
        let depth = &self.depth.as_ref().unwrap().1;
        let groups = ground.map(|off| {
            let g0 = self.device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: Some("ground"),
                layout: &self.mesh.get_bind_group_layout(0),
                entries: &[wgpu::BindGroupEntry { binding: 0, resource: self.ring.binding(off, SCENE_UNIFORM_BYTES) }],
            });
            let g1 = self.device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: Some("atlas"),
                layout: &self.mesh.get_bind_group_layout(1),
                entries: &[
                    wgpu::BindGroupEntry { binding: 0, resource: wgpu::BindingResource::TextureView(&self.atlas_view) },
                    wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::Sampler(&self.sampler) },
                    wgpu::BindGroupEntry { binding: 2, resource: self.atlas_tiles.as_entire_binding() },
                ],
            });
            (g0, g1)
        });
        let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("scene"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: scene,
                resolve_target: None,
                depth_slice: None,
                ops: wgpu::Operations { load: wgpu::LoadOp::Clear(wgpu::Color { r: SCENE_CLEAR[0], g: SCENE_CLEAR[1], b: SCENE_CLEAR[2], a: 1.0 }), store: wgpu::StoreOp::Store },
            })],
            depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                view: depth,
                depth_ops: Some(wgpu::Operations { load: wgpu::LoadOp::Clear(0.0), store: wgpu::StoreOp::Store }),
                stencil_ops: None,
            }),
            timestamp_writes: None,
            occlusion_query_set: None,
            multiview_mask: None,
        });
        if let (Some((g0, g1)), Some(l)) = (&groups, &self.level) {
            pass.set_pipeline(&self.mesh);
            pass.set_bind_group(0, g0, &[]);
            pass.set_bind_group(1, g1, &[]);
            pass.set_vertex_buffer(0, l.vertices.slice(..));
            pass.set_vertex_buffer(1, l.colours.slice(..));
            pass.set_vertex_buffer(2, l.uvs.slice(..));
            pass.set_vertex_buffer(3, l.tiles.slice(..));
            pass.set_index_buffer(l.indices.slice(..), wgpu::IndexFormat::Uint32);
            pass.draw_indexed(0..l.count, 0, 0..1);
            // Water next: a surface, so it writes depth, with its own tint (`drawLevel`).
            if let (Some(g), Some(w)) = (&occ.water, &self.occ.water) {
                crate::occlusion::draw_set(&mut pass, &self.mesh, g, w);
            }
        }
        if let (Some(g), Some((_, buf, n))) = (&grid_group, &self.grid) {
            if *n > 0 {
                pass.set_pipeline(&self.line);
                pass.set_bind_group(0, g, &[]);
                pass.set_vertex_buffer(0, buf.slice(..));
                pass.draw(0..*n, 0..1);
            }
        }
        // In `drawScene`'s order: cubes, figures, the scene's triangles, trails; then what is
        // see-through, depth tested but not writing depth (`SEE_THROUGH_BELOW`); the far-off glyphs
        // over all of it; the overlay last.
        // The objectives under the units (`drawObjectivesUnder`): the marks on the ground (the zones'
        // discs among them), the edges, the zones' bands and the lines through it, before the figures.
        let under = p.top.as_ref().is_some_and(|t| t.under);
        let plain = fig_groups.as_ref().map(|g| &g.3);
        if under {
            if let Some(plain) = plain {
                self.figures.draw_ground(&mut pass, p, plain);
            }
            self.overlays.draw_zones(&mut pass, p, ZoneSlot::Ground, ov.zone_ground.as_ref());
            if let Some(plain) = plain {
                self.figures.draw_under_tris(&mut pass, p, plain);
            }
            self.overlays.draw_zones(&mut pass, p, ZoneSlot::Under, ov.zone_over.as_ref());
            if let Some(plain) = plain {
                self.figures.draw_under_lines(&mut pass, &figs, plain);
            }
        }
        if let Some((cube, look, rel, plain, _, _, plain_at)) = &fig_groups {
            self.figures.draw_cubes(&mut pass, &figs, cube, look.as_ref());
            self.figures.draw(&mut pass, &figs, rel, false);
            self.tracks.draw(&mut pass, &self.figures, plain, false);
            self.tracks.draw_trails(&mut pass, &self.device, &self.ring.buf, *plain_at);
            self.figures.draw_tris(&mut pass, &figs, plain, false);
            self.figures.draw_trails(&mut pass, &figs, plain);
            self.draw_shells(&mut pass, &occ);
            self.figures.draw(&mut pass, &figs, rel, true);
            self.tracks.draw(&mut pass, &self.figures, plain, true);
            self.figures.draw_tris(&mut pass, &figs, plain, true);
        }
        self.draw_shells(&mut pass, &occ);
        if !under {
            // `drawObjectivesOnGround`: the ground triangles, then the zones' discs on the ground.
            if let Some(plain) = plain {
                self.figures.draw_ground(&mut pass, p, plain);
            }
            self.overlays.draw_zones(&mut pass, p, ZoneSlot::Ground, ov.zone_ground.as_ref());
        }
        // The engagement ranges: the ground each unit sees within reach, then the shells over everything solid.
        if let (Some(g), Some(l)) = (&rg.ground, &self.level) {
            self.ranges.draw_ground(&mut pass, Some(g), &l.vertices, &l.indices, l.count);
        }
        self.ranges.draw_shells(&mut pass, p, rg.shell.as_ref());
        if let Some((_, _, _, plain, glyph, track_glyph, _)) = &fig_groups {
            if let Some(g) = track_glyph {
                self.tracks.draw_glyphs(&mut pass, &self.figures, g);
            }
            if let Some(g) = glyph {
                self.figures.draw_glyphs(&mut pass, &figs, g);
            }
            self.figures.draw_overlay(&mut pass, &figs, plain);
        }
        // Last in the pass, and depth only: what changes is the depth the heat pass samples, so a
        // wall occludes the heat behind it (`sealStructures`).
        if let (Some(g), Some(s), Some(l)) = (&occ.seal, &self.occ.structure, &self.level) {
            Self::level_buffers(l).set(&mut pass);
            crate::occlusion::draw_set(&mut pass, &self.occ.seal, g, s);
        }
    }

    /// The see-through structures, faces then edges, after everything solid (`drawLevel` shells).
    fn draw_shells(&self, pass: &mut wgpu::RenderPass<'_>, occ: &OccGroups) {
        if occ.shells_drawn.get() {
            return;
        }
        occ.shells_drawn.set(true);
        if let (Some(g), Some(s), Some(l)) = (&occ.faces, &self.occ.structure, &self.level) {
            Self::level_buffers(l).set(pass);
            crate::occlusion::draw_set(pass, &self.occ.faces, g, s);
        }
        if let (Some(g), Some(e), Some(l)) = (&occ.wire, &self.occ.edges, &self.level) {
            pass.set_pipeline(&self.occ.wire);
            pass.set_bind_group(0, g, &[]);
            pass.set_vertex_buffer(0, l.vertices.slice(..));
            pass.set_index_buffer(e.buf.slice(..), wgpu::IndexFormat::Uint32);
            pass.draw_indexed(0..e.count, 0, 0..1);
        }
    }

    /// A level surface's uniform (`pushSceneUniform` with a tint, a rim and flat shading).
    fn level_uniform(&mut self, p: &Packet, opacity: f32, tint: [f32; 3], fresnel: f32, flat: bool) -> u64 {
        let mut u = self.scene_uniform(p, (1e9, 1e9 + 1.0), opacity, p.f(F_LEVEL_BRIGHTNESS), false, false);
        let mut put = |lane: usize, v: f32| u[lane * 4..lane * 4 + 4].copy_from_slice(&v.to_le_bytes());
        put(24, tint[0]);
        put(25, tint[1]);
        put(26, tint[2]);
        put(27, fresnel);
        put(35, if flat { 1.0 } else { 0.0 });
        self.ring.push(&u, 256)
    }

    /// The mesh pipelines' two bind groups (the uniform, the atlas placeholder) for `pipe`.
    fn mesh_groups(&self, pipe: &wgpu::RenderPipeline, off: u64) -> (wgpu::BindGroup, wgpu::BindGroup) {
        let g0 = self.device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("level"),
            layout: &pipe.get_bind_group_layout(0),
            entries: &[wgpu::BindGroupEntry { binding: 0, resource: self.ring.binding(off, SCENE_UNIFORM_BYTES) }],
        });
        (g0, self.atlas_group(pipe))
    }

    fn atlas_group(&self, pipe: &wgpu::RenderPipeline) -> wgpu::BindGroup {
        self.device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("atlas"),
            layout: &pipe.get_bind_group_layout(1),
            entries: &[
                wgpu::BindGroupEntry { binding: 0, resource: wgpu::BindingResource::TextureView(&self.atlas_view) },
                wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::Sampler(&self.sampler) },
                wgpu::BindGroupEntry { binding: 2, resource: self.atlas_tiles.as_entire_binding() },
            ],
        })
    }

    /// This frame's bind groups for the water, the structures' faces, edges and seal (`pushMeshUniforms`).
    fn occlusion_groups(&mut self, p: &Packet) -> OccGroups {
        let mut g = OccGroups::default();
        if !p.flag(F_LEVEL_ON) || self.level.is_none() {
            return g;
        }
        let f = p.frame.as_ref().unwrap();
        let tint = [f[F_STRUCT_TINT], f[F_STRUCT_TINT + 1], f[F_STRUCT_TINT + 2]];
        let flat = p.flag(F_STRUCT_FLAT);
        if self.occ.water.is_some() && p.flag(F_WATER_SHOW) {
            let wt = [f[F_WATER_TINT], f[F_WATER_TINT + 1], f[F_WATER_TINT + 2]];
            let off = self.level_uniform(p, p.f(F_WATER_OPACITY), wt, 0.0, false);
            g.water = Some(self.mesh_groups(&self.mesh, off));
        }
        if self.occ.structure.is_some() {
            if p.flag(F_STRUCT_FACES) {
                let off = self.level_uniform(p, p.f(F_STRUCT_FACE_OPACITY), tint, 1.0, flat);
                g.faces = Some(self.mesh_groups(&self.occ.faces, off));
            }
            let off = self.level_uniform(p, p.f(F_STRUCT_FACE_OPACITY), tint, 1.0, flat);
            g.seal = Some(self.mesh_groups(&self.occ.seal, off));
        }
        if self.occ.edges.is_some() && p.flag(F_STRUCT_WIRE) {
            let off = self.level_uniform(p, p.f(F_STRUCT_WIRE_OPACITY), tint, 0.0, false);
            g.wire = Some(self.device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: Some("structure wire"),
                layout: &self.occ.wire.get_bind_group_layout(0),
                entries: &[wgpu::BindGroupEntry { binding: 0, resource: self.ring.binding(off, SCENE_UNIFORM_BYTES) }],
            }));
        }
        g
    }

    /// `renderStructureDepth`: the nearest structure surface in a target of its own, when points
    /// behind the terrain are cut. Cleared even with nothing drawn: no structure in front of anything.
    fn structure_depth(&mut self, encoder: &mut wgpu::CommandEncoder, p: &Packet) {
        if !p.flag(F_HIDE_BEHIND_GROUND) {
            return;
        }
        let groups = (p.flag(F_LEVEL_ON) && self.level.is_some() && self.occ.structure.is_some()).then(|| {
            let f = p.frame.as_ref().unwrap();
            let tint = [f[F_STRUCT_TINT], f[F_STRUCT_TINT + 1], f[F_STRUCT_TINT + 2]];
            let off = self.level_uniform(p, p.f(F_STRUCT_FACE_OPACITY), tint, 1.0, p.flag(F_STRUCT_FLAT));
            self.mesh_groups(&self.occ.seal, off)
        });
        let scene = &self.scene.as_ref().unwrap().1;
        let sd = &self.struct_depth.as_ref().unwrap().1;
        let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("structure depth"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: scene,
                resolve_target: None,
                depth_slice: None,
                ops: wgpu::Operations { load: wgpu::LoadOp::Load, store: wgpu::StoreOp::Store },
            })],
            depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                view: sd,
                depth_ops: Some(wgpu::Operations { load: wgpu::LoadOp::Clear(0.0), store: wgpu::StoreOp::Store }),
                stencil_ops: None,
            }),
            timestamp_writes: None,
            occlusion_query_set: None,
            multiview_mask: None,
        });
        if let (Some(g), Some(l), Some(s)) = (&groups, &self.level, &self.occ.structure) {
            Self::level_buffers(l).set(&mut pass);
            crate::occlusion::draw_set(&mut pass, &self.occ.seal, g, s);
        }
    }

    /// `peelDepthLayers`: each layer the structures behind the one before, the scene's depth first.
    fn peel_layers(&mut self, encoder: &mut wgpu::CommandEncoder, p: &Packet) {
        let layers = self.peel_count(p);
        if layers == 0 {
            return;
        }
        self.occ.ensure_layers(&self.device, self.width, self.height);
        let f = p.frame.as_ref().unwrap();
        let mut u = [0f32; PEEL_UNIFORM_BYTES as usize / 4];
        u[..16].copy_from_slice(&f[F_VIEW_PROJ..F_VIEW_PROJ + 16]);
        u[16] = self.width as f32;
        u[17] = self.height as f32;
        u[18] = PEEL_EPSILON_REVERSE;
        // No atlas natively yet: no cut-out texels.
        u[19] = 0.0;
        let off = self.ring.push(bytemuck::cast_slice(&u), 256);
        let atlas = self.atlas_group(&self.occ.peel);
        let (Some(l), Some(s)) = (&self.level, &self.occ.structure) else { return };
        let depth = &self.depth.as_ref().unwrap().1;
        for i in 0..layers as usize {
            let prev = if i == 0 { depth } else { self.occ.layer(i - 1).unwrap() };
            let g0 = self.device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: Some("depth peel"),
                layout: &self.occ.peel.get_bind_group_layout(0),
                entries: &[
                    wgpu::BindGroupEntry { binding: 0, resource: self.ring.binding(off, PEEL_UNIFORM_BYTES as usize) },
                    wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::TextureView(prev) },
                ],
            });
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("depth peel"),
                color_attachments: &[],
                depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                    view: self.occ.layer(i).unwrap(),
                    depth_ops: Some(wgpu::Operations { load: wgpu::LoadOp::Clear(0.0), store: wgpu::StoreOp::Store }),
                    stencil_ops: None,
                }),
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });
            pass.set_pipeline(&self.occ.peel);
            pass.set_bind_group(0, &g0, &[]);
            pass.set_bind_group(1, &atlas, &[]);
            pass.set_vertex_buffer(0, l.vertices.slice(..));
            pass.set_vertex_buffer(1, l.uvs.slice(..));
            pass.set_vertex_buffer(2, l.tiles.slice(..));
            pass.set_index_buffer(s.buf.slice(..), wgpu::IndexFormat::Uint32);
            pass.draw_indexed(0..s.count, 0, 0..1);
        }
    }

    /// How many peeled layers the heat reads this frame (`activeLayers`).
    fn peel_count(&self, p: &Packet) -> u32 {
        if !p.flag(F_LEVEL_ON) || self.level.is_none() {
            return 0;
        }
        self.occ.active_layers(p.f(F_OCCLUSION))
    }

    fn level_buffers(l: &GpuLevel) -> crate::occlusion::LevelBuffers<'_> {
        crate::occlusion::LevelBuffers { vertices: &l.vertices, colours: &l.colours, uvs: &l.uvs, tiles: &l.tiles }
    }

    /// The ground grid and the axes (`buildGridVertices`), made again when they change.
    fn ensure_grid(&mut self, p: &Packet) {
        let (spacing, extent, show_grid, show_axes) = (p.f(F_GRID_SPACING), p.f(F_GRID_EXTENT), p.flag(F_SHOW_GRID), p.flag(F_SHOW_AXES));
        let sig = format!("{spacing}|{extent}|{show_grid}|{show_axes}");
        if self.grid.as_ref().is_some_and(|g| g.0 == sig) {
            return;
        }
        let mut v: Vec<f32> = Vec::new();
        let mut push = |x: f32, y: f32, z: f32, r: f32, g: f32, b: f32, a: f32| v.extend_from_slice(&[x, y, z, r, g, b, a]);
        if show_grid && spacing > 0.0 {
            let n = ((extent / spacing).floor() as i64).min(2000);
            for i in -n..=n {
                if i == 0 {
                    continue;
                }
                let q = i as f32 * spacing;
                let major = i % 10 == 0;
                let c = if major { 0.34 } else { 0.2 };
                let a = if major { 0.85 } else { 0.5 };
                push(-extent, 0.0, q, c, c, c * 1.06, a);
                push(extent, 0.0, q, c, c, c * 1.06, a);
                push(q, 0.0, -extent, c, c, c * 1.06, a);
                push(q, 0.0, extent, c, c, c * 1.06, a);
            }
            push(-extent, 0.0, 0.0, 0.45, 0.3, 0.3, 0.8);
            push(extent, 0.0, 0.0, 0.45, 0.3, 0.3, 0.8);
            push(0.0, 0.0, -extent, 0.3, 0.3, 0.45, 0.8);
            push(0.0, 0.0, extent, 0.3, 0.3, 0.45, 0.8);
        }
        if show_axes {
            let len = extent * 0.06;
            push(0.0, 0.0, 0.0, 1.0, 0.25, 0.25, 1.0);
            push(len, 0.0, 0.0, 1.0, 0.25, 0.25, 1.0);
            push(0.0, 0.0, 0.0, 0.3, 1.0, 0.35, 1.0);
            push(0.0, len, 0.0, 0.3, 1.0, 0.35, 1.0);
            push(0.0, 0.0, 0.0, 0.35, 0.55, 1.0, 1.0);
            push(0.0, 0.0, len, 0.35, 0.55, 1.0, 1.0);
        }
        let n = (v.len() / 7) as u32;
        if v.is_empty() {
            v.resize(7, 0.0);
        }
        let buf = self.device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some("grid"), contents: bytemuck::cast_slice(&v), usage: wgpu::BufferUsages::VERTEX });
        self.grid = Some((sig, buf, n));
    }

    fn clear_target(encoder: &mut wgpu::CommandEncoder, view: &wgpu::TextureView, label: &str) {
        let _ = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some(label),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view,
                resolve_target: None,
                depth_slice: None,
                ops: wgpu::Operations { load: wgpu::LoadOp::Clear(wgpu::Color::TRANSPARENT), store: wgpu::StoreOp::Store },
            })],
            depth_stencil_attachment: None,
            timestamp_writes: None,
            occlusion_query_set: None,
            multiview_mask: None,
        });
    }

    fn clear_heat(&mut self, encoder: &mut wgpu::CommandEncoder) {
        let view = self.heat().view.clone();
        Self::clear_target(encoder, &view, "clear heat");
    }

    /// `drawHeat`: the accumulation, the filters, binned or splatted.
    /// The heat pass (`drawHeat`), or with `field` the same sprites into the direction field's
    /// own small target, accumulated the same way.
    fn draw_heat(&mut self, encoder: &mut wgpu::CommandEncoder, p: &Packet, field: bool) {
        let alpha = p.f(F_BLEND_ALPHA).clamp(0.0, 1.0);
        let accum = p.f(F_ACCUM) as u32;
        let extend = accum == 3;
        if accum != 0 && !extend && alpha <= 0.0 {
            return;
        }
        let mut fresh = false;
        let mut field_size = None;
        if field {
            self.modes.ensure_field(&self.device, p.f(F_DIR_CELL), self.heat_w, self.heat_h, self.height);
            let f = self.modes.field.as_mut().unwrap();
            fresh = std::mem::replace(&mut f.fresh, false);
            field_size = Some((f.width, f.height));
            self.heat_pipes_for(crate::heatmodes::FIELD_FORMAT);
        }
        let format = if field { crate::heatmodes::FIELD_FORMAT } else { self.heat_format };
        let direct = extend || accum == 0 || alpha >= 1.0 || fresh;
        let (heat_view, scratch_view) = match self.modes.field.as_ref().filter(|_| field) {
            Some(f) => (f.view.clone(), f.scratch_view.clone()),
            None => {
                let h = self.heat();
                (h.view.clone(), h.scratch_view.clone())
            }
        };
        let target = if direct { heat_view.clone() } else { scratch_view.clone() };
        if !extend || fresh {
            Self::clear_target(encoder, &target, if direct { "clear heat" } else { "clear heat scratch" });
        }
        // Heat from tiles (Stage 6) under the rows, where the target was just cleared; not the rate map's.
        if !field && p.heat_tiles.is_none() {
            self.tiles.pending = false;
        }
        if !field && !extend && !p.flag(F_RATE_ON) {
            if let (Some(t), Some(fr)) = (p.heat_tiles.as_ref(), p.frame.as_ref()) {
                self.tiles.draw(&self.device, &self.queue, encoder, &target, format, t, &fr[F_VIEW_PROJ..F_VIEW_PROJ + 16]);
            }
        }
        let weight = p.f(F_SAMPLE_WEIGHT) * p.f(F_HEAT_GAIN);
        if p.plan.is_empty() {
            if !direct {
                self.merge_heat(encoder, alpha, &heat_view, &scratch_view, format);
            }
            return;
        }
        self.build_pass_bits(encoder, p);

        // The plan's block starts, packed with a base per entry.
        let mut packed: Vec<u32> = Vec::new();
        let mut bases = Vec::new();
        for e in &p.plan {
            bases.push(packed.len() as u32);
            packed.extend_from_slice(&e.starts[..e.starts.len().min(MAX_PLAN_BLOCKS as usize)]);
        }
        packed.truncate(MAX_PLAN_BLOCKS as usize);
        if !packed.is_empty() {
            self.queue.write_buffer(&self.block_buf, 0, bytemuck::cast_slice(&packed));
        }

        // Line heat where there are routes to draw; points otherwise, not nothing.
        let lines = p.flag(F_LINE_HEAT) && !self.modes.lines.is_empty() && !field;
        let bin_frame = if field { None } else { self.bin_frame(p, lines, weight) };
        let sprites: Vec<u32> = p.plan.iter().map(|e| e.starts.len().min(MAX_PLAN_BLOCKS as usize) as u32 * SAMPLE_BLOCK).collect();
        let bin_bases = bin_frame.as_ref().map(|f| self.bin_begin(encoder, f, &sprites));
        if !field {
            self.binned = bin_frame.is_some();
            if let Some(b) = &mut self.bin {
                b.idle = if bin_frame.is_some() { 0 } else { b.idle + 1 };
                if b.idle == BIN_RELEASE_FRAMES {
                    b.bins = None;
                    b.grid = None;
                }
            }
        }
        let want_dirs = field || (p.flag(F_DIRECTION_ON) && p.f(F_DIR_HALF) < std::f32::consts::PI);

        let mut offsets: Vec<Option<u64>> = Vec::new();
        for (i, e) in p.plan.iter().enumerate() {
            let ok = match self.chunks.get(e.chunk as usize) {
                Some(Some(c)) => !e.starts.is_empty() && self.filterable(c),
                _ => false,
            };
            if !ok || bases[i] as usize + e.starts.len().min(MAX_PLAN_BLOCKS as usize) > MAX_PLAN_BLOCKS as usize {
                offsets.push(None);
                continue;
            }
            let Some((split_slot, weight_slot)) = self.ensure_values(encoder, e.chunk as usize) else {
                offsets.push(None);
                continue;
            };
            // A column split without its column on this chunk leaves the chunk out (as on the web).
            if p.f(F_SPLIT_MODE) as u32 != 0 && split_slot < 0 {
                offsets.push(None);
                continue;
            }
            let lanes = bin_bases.as_ref().map(|b| [b[i], e.chunk, i as u32, sprites[i]]);
            let has_dirs = want_dirs && self.modes.dirs.contains_key(&(e.chunk as usize));
            let u = self.heat_uniform(p, e.chunk as usize, e.min_row, e.max_row, weight, bases[i], lanes, (split_slot, weight_slot), field_size, has_dirs);
            offsets.push(Some(self.ring.push(&u, HEAT_STRIDE)));
        }

        if let Some(f) = bin_frame {
            self.bin_heat(encoder, p, &f, &target, &offsets, &sprites);
        } else {
            let pipe = if lines { self.modes.line_pipe(&self.device, format) } else { self.splat[&format].clone() };
            let groups: Vec<Option<wgpu::BindGroup>> = p
                .plan
                .iter()
                .zip(&offsets)
                .map(|(e, o)| o.map(|off| self.heat_group(&pipe.get_bind_group_layout(0), e.chunk as usize, off, &self.block_buf, false, lines)))
                .collect();
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some(if field { "direction field" } else { "heat" }),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &target,
                    resolve_target: None,
                    depth_slice: None,
                    ops: wgpu::Operations { load: wgpu::LoadOp::Load, store: wgpu::StoreOp::Store },
                })],
                depth_stencil_attachment: None,
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });
            pass.set_pipeline(&pipe);
            for (i, g) in groups.iter().enumerate() {
                if let Some(g) = g {
                    pass.set_bind_group(0, g, &[]);
                    pass.draw(0..sprites[i] * if lines { 18 } else { 3 }, 0..1);
                }
            }
        }
        if !direct {
            self.merge_heat(encoder, alpha, &heat_view, &scratch_view, format);
        }
    }

    /// The splat's, decay's and merge's pipelines into `format`, made on first use (the direction
    /// field's half-float target where the heat is float32).
    fn heat_pipes_for(&mut self, format: wgpu::TextureFormat) {
        if self.splat.contains_key(&format) {
            return;
        }
        let decay_blend = wgpu::BlendState {
            color: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::Zero, dst_factor: wgpu::BlendFactor::Src, operation: wgpu::BlendOperation::Add },
            alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::Zero, dst_factor: wgpu::BlendFactor::Src, operation: wgpu::BlendOperation::Add },
        };
        self.splat.insert(format, render_pipe(&self.device, &self.m_splat, "vsHeat", "fsHeat", format, Some(ADD), &[], None));
        self.decay.insert(format, render_pipe(&self.device, &self.m_decay, "vsFullscreen", "fsDecay", format, Some(decay_blend), &[], None));
        self.merge.insert(format, render_pipe(&self.device, &self.m_merge, "vsFullscreen", "fsMerge", format, Some(ADD), &[], None));
    }

    /// The splat's bindings for one chunk (`heatEntries`), `blocks` at binding 3. Bindings the
    /// pipeline's shader does not use are left out, as its derived layout has none of them.
    fn heat_group(&self, layout: &wgpu::BindGroupLayout, chunk: usize, offset: u64, blocks: &wgpu::Buffer, bin: bool, lines: bool) -> wgpu::BindGroup {
        let c = self.chunks[chunk].as_ref().unwrap();
        let depth = &self.depth.as_ref().unwrap().1;
        let sd = &self.struct_depth.as_ref().unwrap().1;
        let mut entries = vec![
            wgpu::BindGroupEntry { binding: 0, resource: self.ring.binding(offset, HEAT_UNIFORM_BYTES as usize) },
            wgpu::BindGroupEntry { binding: 1, resource: c.positions.as_entire_binding() },
            wgpu::BindGroupEntry { binding: 2, resource: c.times.as_ref().unwrap_or(&self.empty).as_entire_binding() },
            wgpu::BindGroupEntry { binding: 3, resource: blocks.as_entire_binding() },
            wgpu::BindGroupEntry { binding: 4, resource: self.sign_buf.as_entire_binding() },
            wgpu::BindGroupEntry { binding: 5, resource: c.values.as_ref().unwrap_or(&self.empty).as_entire_binding() },
            wgpu::BindGroupEntry { binding: 6, resource: c.pass_bits.as_ref().unwrap_or(&self.empty).as_entire_binding() },
            wgpu::BindGroupEntry { binding: 9, resource: wgpu::BindingResource::TextureView(depth) },
            wgpu::BindGroupEntry { binding: 10, resource: wgpu::BindingResource::TextureView(self.occ.layer(0).unwrap_or(depth)) },
            wgpu::BindGroupEntry { binding: 11, resource: wgpu::BindingResource::TextureView(self.occ.layer(1).unwrap_or(depth)) },
            wgpu::BindGroupEntry { binding: 12, resource: wgpu::BindingResource::TextureView(self.occ.layer(2).unwrap_or(depth)) },
            wgpu::BindGroupEntry { binding: 13, resource: wgpu::BindingResource::TextureView(sd) },
            wgpu::BindGroupEntry { binding: 15, resource: self.volume_buf.as_entire_binding() },
        ];
        if !bin {
            entries.push(wgpu::BindGroupEntry { binding: 7, resource: wgpu::BindingResource::TextureView(&self.curve_view) });
            entries.push(wgpu::BindGroupEntry { binding: 8, resource: wgpu::BindingResource::Sampler(&self.sampler) });
            entries.push(wgpu::BindGroupEntry { binding: 16, resource: self.modes.dirs.get(&chunk).unwrap_or(&self.empty).as_entire_binding() });
            if lines {
                entries.push(wgpu::BindGroupEntry { binding: 14, resource: self.modes.lines.get(&chunk).unwrap_or(&self.empty).as_entire_binding() });
            }
        } else {
            let b = self.bin.as_ref().unwrap();
            entries.push(wgpu::BindGroupEntry { binding: 17, resource: b.params.as_entire_binding() });
            entries.push(wgpu::BindGroupEntry { binding: 18, resource: b.bins.as_ref().unwrap().as_entire_binding() });
            entries.push(wgpu::BindGroupEntry { binding: 19, resource: b.list.as_entire_binding() });
        }
        self.device.create_bind_group(&wgpu::BindGroupDescriptor { label: Some("heat"), layout, entries: &entries })
    }

    /// `writeHeatUniform`, lane for lane.
    #[allow(clippy::too_many_arguments)]
    fn heat_uniform(
        &self,
        p: &Packet,
        chunk: usize,
        min_row: u32,
        max_row: u32,
        weight: f32,
        block_base: u32,
        bin_lanes: Option<[u32; 4]>,
        slots: (i32, i32),
        field: Option<(u32, u32)>,
        has_dirs: bool,
    ) -> Vec<u8> {
        let (split_slot, weight_slot) = slots;
        let c = self.chunks[chunk].as_ref().unwrap();
        let f = p.frame.as_ref().unwrap();
        let mut u = [0f32; HEAT_UNIFORM_BYTES as usize / 4];
        let mut i = [0u32; HEAT_UNIFORM_BYTES as usize / 4];
        let mut ints: Vec<usize> = Vec::new();
        u[..16].copy_from_slice(&f[F_VIEW_PROJ..F_VIEW_PROJ + 16]);
        let (pass_w, pass_h) = match field {
            Some((w, h)) => (w as f32, h as f32),
            None => (self.heat_w as f32, self.heat_h as f32),
        };
        u[16] = pass_w;
        u[17] = pass_h;
        let tpp = pass_h / (self.height.max(1) as f32);
        let min_px = p.f(F_MIN_PX);
        // A direction-field cell is many pixels: a sprite under most of one is held at three
        // quarters of a cell (see `writeHeatUniform`).
        u[18] = if field.is_some() { 0.75 } else { min_px.min(1.0).max(min_px * tpp) };
        u[19] = (p.f(F_MAX_PX) * tpp).max(1.0);
        u[20..23].copy_from_slice(&c.aabb_min);
        u[23] = if p.flag(F_LIFE_ON) { p.f(F_LIFE_FADE) } else { 0.0 };
        u[24..27].copy_from_slice(&c.aabb_size);
        u[27] = p.f(F_TEAM_COUNT).max(1.0);
        u[28] = p.f(F_RADIUS);
        u[29] = p.f(F_PROJ5);
        u[30] = p.f(F_CENTRE);
        u[31] = p.f(F_EDGE);
        u[32] = p.f(F_FALLOFF).max(0.01);
        u[33] = weight;
        u[34] = p.f(F_GROUND_Y);
        u[35] = if p.flag(F_LIFE_ON) { p.f(F_LIFE_NOW) } else { 0.0 };
        u[36] = c.time_min;
        u[37] = c.time_scale;
        u[38] = c.life_scale;
        u[39] = if p.flag(F_LIFE_ON) { p.f(F_LIFE_DEFAULT) } else { 0.0 };
        let use_lifetime = p.flag(F_LIFE_ON) && c.times.is_some();
        let mut flags = 0u32;
        if p.flag(F_PERSPECTIVE) {
            flags |= FLAG_PERSPECTIVE;
        }
        if p.flag(F_GROUND_PROJECTED) {
            flags |= FLAG_GROUND_PROJECTED;
        }
        if p.flag(F_USE_TEAM_SIGN) {
            flags |= FLAG_USE_TEAM_SIGN;
        }
        if use_lifetime {
            flags |= FLAG_USE_LIFETIME;
        }
        if p.flag(F_SMOOTH_RAMP) {
            flags |= FLAG_SMOOTH_RAMP;
        }
        if p.flag(F_USE_CURVE) {
            flags |= FLAG_USE_CURVE;
        }
        if p.flag(F_TEAM_COLORS) {
            flags |= FLAG_TEAM_COLORS;
        }
        if p.flag(F_RATE_ON) {
            flags |= FLAG_RATE;
        }
        if p.flag(F_ZOOM_INVARIANT) {
            flags |= FLAG_CONSERVE;
        }
        if has_dirs {
            flags |= FLAG_HAS_DIRS;
        }
        let mut put = |k: usize, v: u32, ints: &mut Vec<usize>| {
            i[k] = v;
            ints.push(k);
        };
        put(40, min_row, &mut ints);
        put(41, max_row.min(c.rows as u32), &mut ints);
        put(42, SAMPLE_BLOCK.trailing_zeros(), &mut ints);
        put(43, flags, &mut ints);
        let filtered = self.applied.as_ref().is_some_and(|a| !a.filters.is_empty()) && c.pass_bits.is_some() && !c.pass_keys.is_empty();
        put(44, filtered as u32, &mut ints);
        put(45, 0, &mut ints);
        put(46, 0, &mut ints);
        put(47, 0, &mut ints);
        if let Some(l) = bin_lanes {
            put(45, l[0], &mut ints);
            put(46, l[1], &mut ints);
            put(47, l[2], &mut ints);
            put(48, l[3], &mut ints);
        }
        put(56, c.rows as u32, &mut ints);
        put(57, block_base, &mut ints);
        u[58] = p.f(F_CULL_FAR);
        put(59, p.f(F_SPLIT_MODE) as u32 | ((split_slot.max(0) as u32) << 8), &mut ints);
        u[60..63].copy_from_slice(&f[F_CAMERA_POS..F_CAMERA_POS + 3]);
        u[63] = p.f(F_CULL_NEAR);
        u[64] = p.f(F_SPLIT_POSITIVE);
        u[65] = p.f(F_SPLIT_POSITIVE + 1);
        u[66] = p.f(F_SPLIT_NEGATIVE);
        u[67] = p.f(F_SPLIT_NEGATIVE + 1);
        u[68] = if p.flag(F_LEVEL_ON) { p.f(F_OCCLUSION).clamp(0.0, 1.0) } else { 0.0 };
        u[69] = p.f(F_NEAR);
        u[70] = p.f(F_FAR);
        u[71] = if self.heat_w > 0 { self.width as f32 / self.heat_w as f32 } else { 1.0 };
        let slice = p.flag(F_SLICE_ON) && p.flag(F_SLICE_CLIP_HEAT);
        u[72] = if slice { p.f(F_SLICE_AXIS) } else { -1.0 };
        u[73] = if slice { p.f(F_SLICE_MIN) } else { 0.0 };
        u[74] = if slice { p.f(F_SLICE_MAX) } else { 0.0 };
        u[75] = if slice { p.f(F_SLICE_OUTSIDE) } else { 1.0 };
        u[76] = p.f(F_OCCLUDED_EXTRA);
        u[77] = p.f(F_OCCLUSION_FLOOR);
        // How many peeled layers hold structures this frame (`activeLayers`).
        u[78] = self.peel_count(p) as f32;
        u[79] = if p.flag(F_HIDE_BEHIND_GROUND) { 1.0 } else { 0.0 };
        u[80..83].copy_from_slice(&f[F_CAMERA_FORWARD..F_CAMERA_FORWARD + 3]);
        u[83] = if p.flag(F_CULL_PLANAR) { 1.0 } else { 0.0 };
        u[84] = p.f(F_TEAM_NEUTRAL);
        u[85] = p.f(F_TEAM_SLICES).max(1.0);
        u[86] = p.f(F_SPLIT_SCALE);
        u[87] = p.f(F_SPLIT_SCALE + 1);
        // The box line heat's segment starts are quantised to, and playback's playhead and tail
        // (only where this chunk has row times).
        let lb = &self.modes.line_box;
        let trail = p.f(F_LINE_TRAIL_TAIL) > 0.0 && c.times.is_some();
        u[88..91].copy_from_slice(&lb[..3]);
        u[91] = if trail { p.f(F_LINE_TRAIL_NOW) } else { 0.0 };
        u[92..95].copy_from_slice(&lb[3..]);
        u[95] = if trail { p.f(F_LINE_TRAIL_TAIL) } else { 0.0 };
        // Directional heat: the field pass draws discs, the heat pass the wedge.
        let dir = p.flag(F_DIRECTION_ON) && field.is_none();
        u[96] = if dir { p.f(F_DIR_HALF) } else { std::f32::consts::PI };
        u[97] = if dir { p.f(F_DIR_SOFT) } else { 0.0 };
        u[98] = if dir { p.f(F_DIR_NORM) } else { 1.0 };
        u[99] = if field.is_some() { 1.0 } else { 0.0 };
        u[100] = if dir { p.f(F_DIR_CENTROID) } else { 0.0 };
        u[101] = if weight_slot >= 0 { weight_slot as f32 } else { -1.0 };
        u[102] = p.f(F_WEIGHT_SCALE);
        u[103] = p.f(F_PALETTE);
        for k in ints {
            u[k] = f32::from_bits(i[k]);
        }
        bytemuck::cast_slice(&u).to_vec()
    }

    /// `buildPassBits`: each drawn chunk's filters folded into one bit a row, where they changed.
    fn build_pass_bits(&mut self, encoder: &mut wgpu::CommandEncoder, p: &Packet) {
        let Some(applied) = self.applied.clone() else { return };
        if applied.filters.is_empty() {
            return;
        }
        let keys = applied.keys();
        let mut stale: Vec<usize> = Vec::new();
        for e in &p.plan {
            let c = e.chunk as usize;
            if let Some(Some(ch)) = self.chunks.get(c) {
                if ch.pass_keys != keys && !stale.contains(&c) {
                    stale.push(c);
                }
            }
        }
        if stale.is_empty() {
            return;
        }
        // Slot 2k: filter k ANDed in; slot 2k + 1: filter k written, the chunk's first.
        let mut params_off = Vec::new();
        for k in 0..applied.filters.len() as u32 {
            let and = self.ring.push(bytemuck::cast_slice(&[k, 0, 0, 0]), 256);
            let first = self.ring.push(bytemuck::cast_slice(&[k, 1, 0, 0]), 256);
            params_off.push((and, first));
        }
        let layout = self.filter_pass.get_bind_group_layout(0);
        let mut work: Vec<(wgpu::BindGroup, u32)> = Vec::new();
        for c in stale {
            let rows = self.chunks[c].as_ref().unwrap().rows;
            let row_words = rows.div_ceil(32);
            if self.chunks[c].as_ref().unwrap().pass_bits.is_none() {
                let b = self.device.create_buffer(&wgpu::BufferDescriptor {
                    label: Some("pass bits"),
                    size: (row_words * 4).max(4) as u64,
                    usage: wgpu::BufferUsages::STORAGE,
                    mapped_at_creation: false,
                });
                self.gpu_bytes += b.size();
                self.chunks[c].as_mut().unwrap().pass_bits = Some(b);
            }
            let ch = self.chunks[c].as_ref().unwrap();
            let mut dispatched = 0;
            for (k, flt) in applied.filters.iter().enumerate() {
                let Some(col) = ch.columns.get(&flt.column) else { continue };
                let off = if dispatched == 0 { params_off[k].1 } else { params_off[k].0 };
                let g = self.device.create_bind_group(&wgpu::BindGroupDescriptor {
                    label: Some("filter pass"),
                    layout: &layout,
                    entries: &[
                        wgpu::BindGroupEntry { binding: 0, resource: self.ring.binding(off, 16) },
                        wgpu::BindGroupEntry { binding: 1, resource: col.as_entire_binding() },
                        wgpu::BindGroupEntry { binding: 2, resource: self.filter_table.as_entire_binding() },
                        wgpu::BindGroupEntry { binding: 3, resource: ch.pass_bits.as_ref().unwrap().as_entire_binding() },
                    ],
                });
                work.push((g, (row_words as u32).div_ceil(64)));
                dispatched += 1;
            }
            let full = dispatched == applied.filters.len();
            self.chunks[c].as_mut().unwrap().pass_keys = if full { keys.clone() } else { Vec::new() };
        }
        let mut pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor { label: Some("filter pass"), timestamp_writes: None });
        pass.set_pipeline(&self.filter_pass);
        for (g, n) in &work {
            pass.set_bind_group(0, g, &[]);
            pass.dispatch_workgroups(*n, 1, 1);
        }
    }

    /// `binFrame`: binned where that matches the splat, else None.
    fn bin_frame(&self, p: &Packet, lines: bool, weight: f32) -> Option<BinFrame> {
        let bin = self.bin.as_ref()?;
        if std::env::var("HEAT3D_VIEWPORT_BIN").as_deref() == Ok("off") {
            return None;
        }
        if lines || p.flag(F_RATE_ON) || p.flag(F_DIRECTION_ON) || p.plan.len() > BIN_SLOTS as usize {
            return None;
        }
        if p.f(F_SPRITE_TEXELS) > BIN_TYPICAL_MAX {
            return None;
        }
        let tpp = self.heat_h as f32 / self.height.max(1) as f32;
        let min_px = p.f(F_MIN_PX);
        let min_r = min_px.min(1.0).max(min_px * tpp);
        let max_r = (p.f(F_MAX_PX) * tpp).max(1.0);
        let mut uniform_radius = 0.0;
        if !p.flag(F_PERSPECTIVE) {
            uniform_radius = (p.f(F_RADIUS) * p.f(F_PROJ5) * self.heat_h as f32 * 0.5).max(min_r).min(max_r);
            if uniform_radius > BIN_RMAX as f32 {
                return None;
            }
        }
        if std::env::var("HEAT3D_VIEWPORT_BIN").as_deref() != Ok("on") {
            let rows: u64 = p.plan.iter().map(|e| e.starts.len().min(MAX_PLAN_BLOCKS as usize) as u64 * SAMPLE_BLOCK as u64).sum();
            if (rows as f64) < self.heat_w as f64 * self.heat_h as f64 * BIN_MIN_ROWS_PER_TEXEL {
                return None;
            }
        }
        let f = BinFrame {
            width: self.heat_w,
            height: self.heat_h,
            perspective: p.flag(F_PERSPECTIVE),
            uniform_radius,
            signed: p.flag(F_USE_TEAM_SIGN) || p.flag(F_SIGNED) || p.f(F_MODE) as u32 == 1,
            team: p.flag(F_TEAM_COLORS),
            weight,
            centre: p.f(F_CENTRE),
            edge: p.f(F_EDGE),
            falloff: p.f(F_FALLOFF).max(0.01),
            ramp_flags: if p.flag(F_USE_CURVE) { FLAG_USE_CURVE } else { 0 } | if p.flag(F_SMOOTH_RAMP) { FLAG_SMOOTH_RAMP } else { 0 },
            curve_dirty: self.curve_dirty,
        };
        // `fits`: within one binding and BIN_MAX_BYTES.
        let cells = (f.width + 2 * BIN_APRON) as f64 * (f.height + 2 * BIN_APRON) as f64;
        let bytes = cells * (channels_for(&f) as f64 * 8.0 + 4.0 + BIN_SPARSE as f64 * if f.team { 3.0 } else { 2.0 } * 4.0) * 1.25;
        let limits = self.device.limits();
        let cap = (BIN_MAX_BYTES as f64).min(limits.max_storage_buffer_binding_size as f64).min(limits.max_buffer_size as f64);
        let _ = bin;
        (bytes <= cap).then_some(f)
    }

    /// `GpuHeatBin.begin`: grid, parameters, kernel table, list capacities; returns each entry's list base.
    fn bin_begin(&mut self, encoder: &mut wgpu::CommandEncoder, f: &BinFrame, slots: &[u32]) -> Vec<u32> {
        let channels = channels_for(f);
        let slot_words = if f.team { 3 } else { 2 };
        let gw = f.width + 2 * BIN_APRON;
        let gh = f.height + 2 * BIN_APRON;
        let device = self.device.clone();
        let b = self.bin.as_mut().unwrap();
        let bin_bytes = gw as u64 * gh as u64 * (channels as u64 * 8 + 4 + BIN_SPARSE as u64 * slot_words as u64 * 4);
        if b.bins.as_ref().is_none_or(|x| x.size() < bin_bytes) {
            b.bins = Some(device.create_buffer(&wgpu::BufferDescriptor {
                label: Some("heat bins"),
                size: align(bin_bytes, 256),
                usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
                mapped_at_creation: false,
            }));
        }
        if b.grid.as_ref().is_none_or(|g| g.w != gw || g.h != gh) {
            let usage = wgpu::TextureUsages::STORAGE_BINDING | wgpu::TextureUsages::TEXTURE_BINDING;
            let (sums, sums_view) = tex2d(&device, "heat bin sums", gw, gh, wgpu::TextureFormat::Rgba32Float, usage);
            let (radii, radii_view) = tex2d(&device, "heat bin radii", gw, gh, wgpu::TextureFormat::Rgba32Float, usage);
            let tile_bytes = ((gw.div_ceil(BIN_TILE) * gh.div_ceil(BIN_TILE) * 4) as u64).max(16);
            let mk =
                |label: &str| device.create_buffer(&wgpu::BufferDescriptor { label: Some(label), size: tile_bytes, usage: wgpu::BufferUsages::STORAGE, mapped_at_creation: false });
            b.grid = Some(BinGrid { sums_view, radii_view, tiles: mk("heat bin tiles"), reach: mk("heat bin reach"), w: gw, h: gh, _sums: sums, _radii: radii });
        }
        let plane = gw * gh * 2;
        let count_at = plane * channels;
        let slot_at = count_at + gw * gh;
        let mut next = 3;
        let ch_r = if f.perspective {
            next += 1;
            next - 1
        } else {
            0
        };
        let ch_a = if f.perspective && f.signed {
            next += 1;
            next - 1
        } else {
            0
        };
        let ch_t = if f.team { next } else { 0 };
        let flags = if f.perspective { BIN_FLAG_RADIUS } else { 0 } | if ch_a != 0 { BIN_FLAG_ABS } else { 0 } | if f.team { BIN_FLAG_TEAM } else { 0 };
        let mut w = [0u32; BIN_PARAM_BYTES / 4];
        w[..8].copy_from_slice(&[gw, gh, BIN_APRON, flags, plane, ch_r, ch_a, ch_t]);
        for (k, v) in [BIN_SCALE_W, BIN_SCALE_R, f.uniform_radius.min(BIN_RMAX as f32), f.weight].iter().enumerate() {
            w[8 + k] = v.to_bits();
        }
        w[12..16].copy_from_slice(&[gw.div_ceil(BIN_TILE), gh.div_ceil(BIN_TILE), f.width, f.height]);
        w[16..20].copy_from_slice(&[count_at, slot_at, BIN_SPARSE, slot_words]);
        for (k, v) in [f.centre, f.edge, f.falloff, f.ramp_flags as f32].iter().enumerate() {
            w[20 + k] = v.to_bits();
        }
        self.queue.write_buffer(&b.params, 0, bytemuck::cast_slice(&w));

        let total: u64 = slots.iter().map(|&n| n as u64).sum();
        let mut head = vec![0u32; BIN_LIST_HEAD as usize];
        let mut bases = Vec::new();
        let mut base = 0u32;
        for (i, &n) in slots.iter().enumerate() {
            let cap = if total > 0 { ((BIN_LIST_ROWS as u64 * n as u64) / total) as u32 } else { 0 };
            bases.push(base);
            if i < BIN_SLOTS as usize {
                head[BIN_SLOTS as usize + i] = cap;
            }
            base += cap;
        }
        self.queue.write_buffer(&b.list, 0, bytemuck::cast_slice(&head));
        encoder.clear_buffer(b.bins.as_ref().unwrap(), 0, Some(slot_at as u64 * 4));

        let lut_key = format!("{}|{}|{}|{}", f.centre, f.edge, f.falloff, f.ramp_flags);
        if lut_key != b.lut_key || (f.curve_dirty && f.ramp_flags & FLAG_USE_CURVE != 0) {
            b.lut_key = lut_key;
            self.queue.write_buffer(&b.lut_params, 0, bytemuck::cast_slice(&[f.centre, f.edge, f.falloff, f.ramp_flags as f32]));
            let g = device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: Some("heat bin kernel"),
                layout: &b.lut.get_bind_group_layout(0),
                entries: &[
                    wgpu::BindGroupEntry { binding: 0, resource: b.lut_params.as_entire_binding() },
                    wgpu::BindGroupEntry { binding: 1, resource: b.lut_buf.as_entire_binding() },
                    wgpu::BindGroupEntry { binding: 2, resource: wgpu::BindingResource::TextureView(&self.curve_view) },
                    wgpu::BindGroupEntry { binding: 3, resource: wgpu::BindingResource::Sampler(&self.sampler) },
                ],
            });
            let mut pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor { label: Some("heat bin kernel"), timestamp_writes: None });
            pass.set_pipeline(&b.lut);
            pass.set_bind_group(0, &g, &[]);
            pass.dispatch_workgroups((BIN_LUT_LEVELS * BIN_LUT_SIDE * BIN_LUT_SIDE).div_ceil(64), 1, 1);
        }
        self.curve_dirty = false;
        bases
    }

    /// `binHeat`: bin every plan entry, resolve, then fold and splat the listed rows into `target`.
    fn bin_heat(&mut self, encoder: &mut wgpu::CommandEncoder, p: &Packet, _f: &BinFrame, target: &wgpu::TextureView, offsets: &[Option<u64>], sprites: &[u32]) {
        let format = self.heat_format;
        let b = self.bin.as_ref().unwrap();
        let bin_layout = b.bin.get_bind_group_layout(0);
        let list_pipe = b.list_pipe[&format].clone();
        let list_layout = list_pipe.get_bind_group_layout(0);
        let bin_groups: Vec<Option<wgpu::BindGroup>> =
            p.plan.iter().zip(offsets).map(|(e, o)| o.map(|off| self.heat_group(&bin_layout, e.chunk as usize, off, &self.block_buf, true, false))).collect();
        let list_groups: Vec<Option<wgpu::BindGroup>> =
            p.plan.iter().zip(offsets).map(|(e, o)| o.map(|off| self.heat_group(&list_layout, e.chunk as usize, off, &b.list, false, false))).collect();
        let grid = b.grid.as_ref().unwrap();
        let bins = b.bins.as_ref().unwrap();
        let d = &self.device;
        let resolve_g = d.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("heat bin resolve"),
            layout: &b.resolve.get_bind_group_layout(0),
            entries: &[
                wgpu::BindGroupEntry { binding: 0, resource: b.params.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 1, resource: bins.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 2, resource: grid.tiles.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 3, resource: wgpu::BindingResource::TextureView(&grid.sums_view) },
                wgpu::BindGroupEntry { binding: 4, resource: wgpu::BindingResource::TextureView(&grid.radii_view) },
            ],
        });
        let dilate_g = d.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("heat bin reach"),
            layout: &b.dilate.get_bind_group_layout(0),
            entries: &[
                wgpu::BindGroupEntry { binding: 0, resource: b.params.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 2, resource: grid.tiles.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 5, resource: grid.reach.as_entire_binding() },
            ],
        });
        let args_g = d.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("heat bin draws"),
            layout: &b.args_pipe.get_bind_group_layout(0),
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 5,
                    resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding { buffer: &b.list, offset: 0, size: NonZeroU64::new(BIN_LIST_HEAD as u64 * 4) }),
                },
                wgpu::BindGroupEntry { binding: 6, resource: b.args.as_entire_binding() },
            ],
        });
        let fold_pipe = &b.fold[&format];
        let fold_g = d.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("heat fold"),
            layout: &fold_pipe.get_bind_group_layout(0),
            entries: &[
                wgpu::BindGroupEntry { binding: 0, resource: b.params.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::TextureView(&grid.sums_view) },
                wgpu::BindGroupEntry { binding: 2, resource: wgpu::BindingResource::TextureView(&grid.radii_view) },
                wgpu::BindGroupEntry { binding: 3, resource: grid.reach.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 4, resource: b.lut_buf.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 7, resource: bins.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 8, resource: wgpu::BindingResource::TextureView(&self.curve_view) },
                wgpu::BindGroupEntry { binding: 9, resource: wgpu::BindingResource::Sampler(&self.sampler) },
            ],
        });
        {
            let mut c = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor { label: Some("heat bin"), timestamp_writes: None });
            c.set_pipeline(&b.bin);
            for (i, g) in bin_groups.iter().enumerate() {
                if let Some(g) = g {
                    c.set_bind_group(0, g, &[]);
                    let groups = sprites[i].div_ceil(256);
                    let x = groups.min(32768);
                    c.dispatch_workgroups(x, groups.div_ceil(x), 1);
                }
            }
            let tw = grid.w.div_ceil(BIN_TILE);
            let th = grid.h.div_ceil(BIN_TILE);
            c.set_pipeline(&b.resolve);
            c.set_bind_group(0, &resolve_g, &[]);
            c.dispatch_workgroups(tw, th, 1);
            c.set_pipeline(&b.dilate);
            c.set_bind_group(0, &dilate_g, &[]);
            c.dispatch_workgroups(tw.div_ceil(8), th.div_ceil(8), 1);
            c.set_pipeline(&b.args_pipe);
            c.set_bind_group(0, &args_g, &[]);
            c.dispatch_workgroups(1, 1, 1);
        }
        let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("heat fold"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: target,
                resolve_target: None,
                depth_slice: None,
                ops: wgpu::Operations { load: wgpu::LoadOp::Load, store: wgpu::StoreOp::Store },
            })],
            depth_stencil_attachment: None,
            timestamp_writes: None,
            occlusion_query_set: None,
            multiview_mask: None,
        });
        pass.set_pipeline(fold_pipe);
        pass.set_bind_group(0, &fold_g, &[]);
        pass.draw(0..3, 0..1);
        pass.set_pipeline(&list_pipe);
        for (i, g) in list_groups.iter().enumerate() {
            if let Some(g) = g {
                pass.set_bind_group(0, g, &[]);
                pass.draw_indirect(&b.args, i as u64 * 16);
            }
        }
    }

    /// `mergeHeat`: acc = acc * (1 - a) + scratch * a.
    fn merge_heat(&mut self, encoder: &mut wgpu::CommandEncoder, alpha: f32, view: &wgpu::TextureView, scratch: &wgpu::TextureView, format: wgpu::TextureFormat) {
        let d_off = self.ring.push(bytemuck::cast_slice(&[1.0 - alpha, 0.0, 0.0, 0.0]), 256);
        let m_off = self.ring.push(bytemuck::cast_slice(&[alpha, 0.0, 0.0, 0.0]), 256);
        let decay = &self.decay[&format];
        let merge = &self.merge[&format];
        let dg = self.device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("decay"),
            layout: &decay.get_bind_group_layout(0),
            entries: &[wgpu::BindGroupEntry { binding: 0, resource: self.ring.binding(d_off, 16) }],
        });
        let mg = self.device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("merge"),
            layout: &merge.get_bind_group_layout(0),
            entries: &[
                wgpu::BindGroupEntry { binding: 0, resource: self.ring.binding(m_off, 16) },
                wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::TextureView(scratch) },
            ],
        });
        for (pipe, g, label) in [(decay, &dg, "heat decay"), (merge, &mg, "heat merge")] {
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some(label),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view,
                    resolve_target: None,
                    depth_slice: None,
                    ops: wgpu::Operations { load: wgpu::LoadOp::Load, store: wgpu::StoreOp::Store },
                })],
                depth_stencil_attachment: None,
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });
            pass.set_pipeline(pipe);
            pass.set_bind_group(0, g, &[]);
            pass.draw(0..3, 0..1);
        }
    }

    fn composite_uniform(&self, p: &Packet) -> [f32; COMPOSITE_UNIFORM_BYTES as usize / 4] {
        // `composite`.
        let mut u = [0f32; COMPOSITE_UNIFORM_BYTES as usize / 4];
        let signed = p.f(F_MODE) as u32 == 1 || p.flag(F_SIGNED);
        u[0] = 1.0 / p.f(F_HEAT_GAIN).max(1e-9);
        u[1] = p.f(F_SATURATION);
        u[2] = if signed { 1.0 } else { 0.0 };
        u[3] = p.f(F_RESPONSE);
        u[4] = p.f(F_FLOOR);
        u[5] = 0.0;
        u[6] = 1.0;
        u[7] = 1.0;
        u[8] = p.f(F_NEAR);
        u[9] = p.f(F_FAR);
        u[10] = 1.0 / self.width.max(1) as f32;
        u[11] = 1.0 / self.height.max(1) as f32;
        u[12] = if p.flag(F_PERSPECTIVE) { 1.0 } else { 0.0 };
        u[13] = if p.flag(F_TEAM_COLORS) { 1.0 } else { 0.0 };
        u[14] = p.f(F_TEAM_BOOST);
        // The rate map's (render/rateMap.ts): composite-only, so moving them never restarts the accumulation.
        u[15] = if p.flag(F_RATE_ON) { 1.0 } else { 0.0 };
        u[16] = p.f(F_RATE_OVERALL);
        u[17] = p.f(F_RATE_PRIOR);
        u[18] = p.f(F_RATE_MIN);
        u[19] = p.f(F_RATE_SPAN);
        u
    }

    fn composite_group(&mut self, p: &Packet, pipe: &wgpu::RenderPipeline) -> wgpu::BindGroup {
        let u = self.composite_uniform(p);
        let off = self.ring.push(bytemuck::cast_slice(&u), 256);
        self.device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("composite"),
            layout: &pipe.get_bind_group_layout(0),
            entries: &[
                wgpu::BindGroupEntry { binding: 0, resource: self.ring.binding(off, COMPOSITE_UNIFORM_BYTES as usize) },
                wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::TextureView(&self.scene.as_ref().unwrap().1) },
                wgpu::BindGroupEntry { binding: 2, resource: wgpu::BindingResource::TextureView(&self.heat().view) },
                wgpu::BindGroupEntry { binding: 3, resource: wgpu::BindingResource::TextureView(&self.lut_view) },
                wgpu::BindGroupEntry { binding: 4, resource: wgpu::BindingResource::Sampler(&self.sampler) },
                wgpu::BindGroupEntry { binding: 5, resource: wgpu::BindingResource::TextureView(&self.depth.as_ref().unwrap().1) },
            ],
        })
    }

    /// The picture into `out`, at the canvas's place in it; the rest of `out` the scene's colour.
    fn composite_into(&mut self, encoder: &mut wgpu::CommandEncoder, p: &Packet, out: &wgpu::TextureView, out_size: (u32, u32), _capture: bool) {
        let pipe = self.composite.clone();
        let g = self.composite_group(p, &pipe);
        let top = self.top_group(p);
        let origin = (p.f(F_VIEW_X).max(0.0), p.f(F_VIEW_Y).max(0.0));
        let ov = self.overlay_groups(p, false, origin);
        let field = if p.f(F_MODE) as u32 != 4 {
            self.modes.field_groups(
                &self.device,
                &self.queue,
                &self.sampler,
                p.f(F_DIR_FIELD) as u32,
                1.0 / p.f(F_HEAT_GAIN).max(1e-9),
                p.f(F_SATURATION),
                p.f(F_DIR_TIME),
                (self.width, self.height),
            )
        } else {
            Default::default()
        };
        let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("composite"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: out,
                resolve_target: None,
                depth_slice: None,
                ops: wgpu::Operations { load: wgpu::LoadOp::Clear(wgpu::Color { r: SCENE_CLEAR[0], g: SCENE_CLEAR[1], b: SCENE_CLEAR[2], a: 1.0 }), store: wgpu::StoreOp::Store },
            })],
            depth_stencil_attachment: None,
            timestamp_writes: None,
            occlusion_query_set: None,
            multiview_mask: None,
        });
        let x = p.f(F_VIEW_X).max(0.0);
        let y = p.f(F_VIEW_Y).max(0.0);
        let w = (self.width as f32).min(out_size.0 as f32 - x);
        let h = (self.height as f32).min(out_size.1 as f32 - y);
        if w >= 1.0 && h >= 1.0 {
            // The canvas's own size: a viewport clipped by the window's edge would squash the picture.
            pass.set_viewport(x, y, self.width as f32, self.height as f32, 0.0, 1.0);
            pass.set_scissor_rect(x as u32, y as u32, w as u32, h as u32);
            pass.set_pipeline(&pipe);
            pass.set_bind_group(0, &g, &[]);
            pass.draw(0..3, 0..1);
            field.draw(&mut pass);
            self.draw_over(&mut pass, p, &top, &ov);
        }
    }

    /// Over the finished picture, in the composite pass, in `composite`'s order: the volumes'
    /// contours, the objectives' triangles, the zones (unless they went under the units), the
    /// spawn marks, the lines and the kept lines.
    fn draw_over(&self, pass: &mut wgpu::RenderPass<'_>, p: &Packet, top: &Option<(Option<(u32, u64)>, wgpu::BindGroup)>, ov: &crate::overlays::OverlayGroups) {
        self.overlays.draw_contours(pass, ov.contour.as_ref());
        if let Some((_, group)) = top {
            self.figures.draw_top_tris(pass, p, group);
        }
        if !p.top.as_ref().is_some_and(|t| t.under) {
            self.overlays.draw_zones(pass, p, ZoneSlot::Top, ov.zone_over.as_ref());
        }
        self.overlays.draw_spawns(pass, p, ov.spawn.as_ref());
        if let Some((lines, group)) = top {
            self.figures.draw_top_lines(pass, p, *lines, group);
        }
    }

    /// The ranges' bind groups for one packet, and the faces of the units' views it takes, each in a
    /// pass of its own before the scene's (`takeViews`; only from a level the viewport holds).
    fn range_groups(&mut self, encoder: &mut wgpu::CommandEncoder, p: &Packet) -> crate::ranges::RangeGroups {
        let mut g = crate::ranges::RangeGroups::default();
        let Some(r) = p.ranges.as_ref() else { return g };
        let off = self.ring.push(bytemuck::cast_slice(&r.shell_uniform), 256);
        g.shell = Some(self.ranges.view_group(&self.device, &self.ring.buf, off, SHELL_UNIFORM_BYTES as u64));
        if self.level.is_none() {
            return g;
        }
        if let Some(u) = &r.ground {
            let off = self.ring.push(bytemuck::cast_slice(u), 256);
            g.ground = Some(self.ranges.view_group(&self.device, &self.ring.buf, off, GROUND_UNIFORM_BYTES as u64));
        }
        if !r.captures.is_empty() {
            let offs: Vec<u64> = r.captures.iter().map(|(_, c)| self.ring.push(bytemuck::cast_slice(c), 256)).collect();
            let l = self.level.as_ref().unwrap();
            self.ranges.take_views(&self.device, encoder, r, &self.ring.buf, &offs, &l.vertices, &l.indices, l.count);
        }
        g
    }

    /// The overlays' bind groups for one packet, their uniforms in the ring: in the scene the
    /// zones on the ground and under the units; over the picture the zones, the spawn marks and the
    /// contours (`origin`: where the canvas starts in the target).
    fn overlay_groups(&mut self, p: &Packet, scene: bool, origin: (f32, f32)) -> crate::overlays::OverlayGroups {
        use crate::overlays::Overlays;
        let mut g = crate::overlays::OverlayGroups::default();
        let Some(o) = p.overlays.as_ref() else { return g };
        let under = p.top.as_ref().is_some_and(|t| t.under);
        if let Some(z) = &o.zones {
            if scene && z.ground {
                let off = self.ring.push(bytemuck::cast_slice(&Overlays::zone_uniform(p, z, ZoneSlot::Ground)), 256);
                g.zone_ground = Some(self.overlays.zone_group(&self.device, &self.ring.buf, off));
            }
            // Under the units in the scene, else over the picture: at the frame's xray either way.
            if scene == under {
                let off = self.ring.push(bytemuck::cast_slice(&Overlays::zone_uniform(p, z, ZoneSlot::Top)), 256);
                g.zone_over = Some(self.overlays.zone_group(&self.device, &self.ring.buf, off));
            }
        }
        if scene {
            return g;
        }
        if let Some(s) = &o.spawns {
            let off = self.ring.push(bytemuck::cast_slice(&Overlays::spawn_uniform(p, s)), 256);
            g.spawn = Some(self.overlays.spawn_group(&self.device, &self.ring.buf, off));
        }
        if let (Some(c), Some((_, depth))) = (&o.contours, &self.depth) {
            let vol = self.ring.push(bytemuck::cast_slice(&c.block), 256);
            let u = self.ring.push(bytemuck::cast_slice(&Overlays::contour_uniform(c, self.width as f32, self.height as f32, origin)), 256);
            g.contour = Some(self.overlays.contour_group(&self.device, &self.ring.buf, vol, u, depth));
        }
        g
    }

    /// What the lines and marks over the finished picture need: their per-frame lines placed, and the
    /// plain scene uniforms (`topLines`). None when the packet has none.
    fn top_group(&mut self, p: &Packet) -> Option<(Option<(u32, u64)>, wgpu::BindGroup)> {
        p.top.as_ref()?;
        let lines = self.figures.push_top(&self.device, &self.queue, p);
        let u = self.scene_uniform(p, (1e9, 1e9 + 1.0), 0.0, 1.0, false, false);
        let off = self.ring.push(&u, 256);
        Some((lines, self.figures.group(&self.device, &self.ring.buf, off)))
    }

    /// The composite again into an offscreen copy, read back (`captureFrame`).
    fn capture(&mut self, encoder: &mut wgpu::CommandEncoder, p: &Packet) {
        let Some(reply) = self.pending_capture.take() else { return };
        let (w, h) = (self.width, self.height);
        let format = self.out_format;
        let (tex, view) = tex2d(&self.device, "capture", w, h, format, wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::COPY_SRC);
        let pipe = self.composite.clone();
        let g = self.composite_group(p, &pipe);
        let top = self.top_group(p);
        let ov = self.overlay_groups(p, false, (0.0, 0.0));
        {
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("capture"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    depth_slice: None,
                    ops: wgpu::Operations { load: wgpu::LoadOp::Clear(wgpu::Color::BLACK), store: wgpu::StoreOp::Store },
                })],
                depth_stencil_attachment: None,
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });
            pass.set_pipeline(&pipe);
            pass.set_bind_group(0, &g, &[]);
            pass.draw(0..3, 0..1);
            self.draw_over(&mut pass, p, &top, &ov);
        }
        let stride = align(w as u64 * 4, 256) as u32;
        let buffer = self.device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("capture read"),
            size: stride as u64 * h as u64,
            usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });
        encoder.copy_texture_to_buffer(
            wgpu::TexelCopyTextureInfo { texture: &tex, mip_level: 0, origin: Default::default(), aspect: Default::default() },
            wgpu::TexelCopyBufferInfo { buffer: &buffer, layout: wgpu::TexelCopyBufferLayout { offset: 0, bytes_per_row: Some(stride), rows_per_image: None } },
            wgpu::Extent3d { width: w, height: h, depth_or_array_layers: 1 },
        );
        let bgra = matches!(format, wgpu::TextureFormat::Bgra8Unorm | wgpu::TextureFormat::Bgra8UnormSrgb);
        self.readbacks.push(Readback { buffer, ready: Arc::new(0.into()), kind: ReadKind::Capture { width: w, height: h, stride, bgra, reply } });
    }

    /// The heat target read back, sampled to at most `max` values (`readHeatField`).
    fn read_heat(&mut self, encoder: &mut wgpu::CommandEncoder) {
        let (seq, asked) = (self.stats.last_seq, Instant::now());
        let (ready, waiting): (Vec<_>, Vec<_>) =
            std::mem::take(&mut self.pending_heat).into_iter().partition(|a| seq >= a.1 || asked - a.2 > HEAT_WAIT);
        self.pending_heat = waiting;
        for (max, _, _, reply) in ready {
            self.read_heat_one(encoder, max, reply);
        }
    }

    fn read_heat_one(&mut self, encoder: &mut wgpu::CommandEncoder, max: usize, reply: Reply<Option<Vec<f32>>>) {
        let (w, h) = (self.heat_w, self.heat_h);
        let channels = match self.heat_format {
            wgpu::TextureFormat::Rgba32Float | wgpu::TextureFormat::Rgba16Float => 4,
            _ => 1,
        };
        let texel = if self.heat_f32 { 4 } else { 2 } * channels;
        let stride = align(w as u64 * texel as u64, 256) as u32;
        let buffer = self.device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("heat read"),
            size: stride as u64 * h as u64,
            usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });
        encoder.copy_texture_to_buffer(
            wgpu::TexelCopyTextureInfo { texture: &self.heat().tex, mip_level: 0, origin: Default::default(), aspect: Default::default() },
            wgpu::TexelCopyBufferInfo { buffer: &buffer, layout: wgpu::TexelCopyBufferLayout { offset: 0, bytes_per_row: Some(stride), rows_per_image: None } },
            wgpu::Extent3d { width: w, height: h, depth_or_array_layers: 1 },
        );
        self.readbacks.push(Readback { buffer, ready: Arc::new(0.into()), kind: ReadKind::Heat { width: w, height: h, stride, channels, max, reply } });
    }

    /// The heat under one canvas pixel (`probeHeat`): the texel the heat target has there.
    fn probe(&mut self, encoder: &mut wgpu::CommandEncoder) {
        let Some((cx, cy, reply)) = self.pending_probe.take() else { return };
        let hx = (cx / self.width.max(1) as f32 * self.heat_w as f32).floor();
        let hy = (cy / self.height.max(1) as f32 * self.heat_h as f32).floor();
        if hx < 0.0 || hy < 0.0 || hx >= self.heat_w as f32 || hy >= self.heat_h as f32 {
            reply(None);
            return;
        }
        let buffer = self.device.create_buffer(&wgpu::BufferDescriptor {
            label: Some("probe"),
            size: 256,
            usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });
        encoder.copy_texture_to_buffer(
            wgpu::TexelCopyTextureInfo { texture: &self.heat().tex, mip_level: 0, origin: wgpu::Origin3d { x: hx as u32, y: hy as u32, z: 0 }, aspect: Default::default() },
            wgpu::TexelCopyBufferInfo { buffer: &buffer, layout: wgpu::TexelCopyBufferLayout { offset: 0, bytes_per_row: Some(256), rows_per_image: None } },
            wgpu::Extent3d { width: 1, height: 1, depth_or_array_layers: 1 },
        );
        self.readbacks.push(Readback { buffer, ready: Arc::new(0.into()), kind: ReadKind::Probe { reply } });
    }

    pub fn request_probe(&mut self, x: f32, y: f32, reply: Reply<Option<f32>>) {
        self.pending_probe = Some((x, y, reply));
    }

    pub fn request_capture(&mut self, reply: Reply<Option<Captured>>) {
        self.pending_capture = Some(reply);
    }

    pub fn request_heat(&mut self, max: usize, reply: Reply<Option<Vec<f32>>>) {
        self.request_heat_after(max, 0, reply);
    }

    /// As `request_heat`, read only once packet `after` is drawn: the page meters the frame it
    /// has just sent, and that packet may still be on its way. Reads asked meanwhile all wait
    /// their turn (one replacing another answered the first with nothing: the first exposure
    /// after a load then kept the analytic estimate, 3.6x the metered one).
    pub fn request_heat_after(&mut self, max: usize, after: u32, reply: Reply<Option<Vec<f32>>>) {
        self.pending_heat.push((max, after, Instant::now(), reply));
    }

    /// A heat read still waiting for its packet after `HEAT_WAIT`: served from whatever is drawn
    /// (a packet the page dropped, or a page that started its numbering over).
    pub fn heat_overdue(&self) -> bool {
        self.pending_heat.iter().any(|a| a.2.elapsed() > HEAT_WAIT)
    }

    fn map_readbacks(&mut self) {
        for r in &self.readbacks {
            if r.ready.load(std::sync::atomic::Ordering::Acquire) == 0 {
                let flag = r.ready.clone();
                r.ready.store(1, std::sync::atomic::Ordering::Release);
                r.buffer.slice(..).map_async(wgpu::MapMode::Read, move |res| {
                    flag.store(if res.is_ok() { 2 } else { 3 }, std::sync::atomic::Ordering::Release);
                });
            }
        }
    }

    /// Hands over read-backs that have arrived; call between frames.
    pub fn poll(&mut self) {
        let _ = self.device.poll(wgpu::PollType::Poll);
        let mut i = 0;
        while i < self.readbacks.len() {
            let state = self.readbacks[i].ready.load(std::sync::atomic::Ordering::Acquire);
            if state < 2 {
                i += 1;
                continue;
            }
            let r = self.readbacks.swap_remove(i);
            let ok = state == 2;
            match r.kind {
                ReadKind::Capture { width, height, stride, bgra, reply } => {
                    let out = ok.then(|| {
                        let data = r.buffer.slice(..).get_mapped_range().expect("mapped");
                        let mut rgba = Vec::with_capacity((width * height * 4) as usize);
                        for y in 0..height as usize {
                            let row = &data[y * stride as usize..y * stride as usize + width as usize * 4];
                            if bgra {
                                for px in row.chunks_exact(4) {
                                    rgba.extend_from_slice(&[px[2], px[1], px[0], px[3]]);
                                }
                            } else {
                                rgba.extend_from_slice(row);
                            }
                        }
                        Captured { width, height, rgba }
                    });
                    r.buffer.unmap();
                    reply(out);
                }
                ReadKind::Probe { reply } => {
                    let out = ok.then(|| {
                        let d = r.buffer.slice(..).get_mapped_range().expect("mapped");
                        // R, the density, is first in every format.
                        if self.heat_f32 {
                            f32::from_le_bytes([d[0], d[1], d[2], d[3]])
                        } else {
                            half_to_f32(u16::from_le_bytes([d[0], d[1]]))
                        }
                    });
                    r.buffer.unmap();
                    reply(out.filter(|v| v.is_finite()));
                }
                ReadKind::Heat { width, height, stride, channels, max, reply } => {
                    let out = ok.then(|| {
                        let data = r.buffer.slice(..).get_mapped_range().expect("mapped");
                        let texel = if self.heat_f32 { 4 } else { 2 };
                        let at = |x: usize, y: usize, c: usize| -> f32 {
                            let b = y * stride as usize + (x * channels as usize + c) * texel;
                            if self.heat_f32 {
                                f32::from_le_bytes([data[b], data[b + 1], data[b + 2], data[b + 3]])
                            } else {
                                half_to_f32(u16::from_le_bytes([data[b], data[b + 1]]))
                            }
                        };
                        let (w, h) = (width as usize, height as usize);
                        if max == 0 {
                            // Every channel of every texel, signed (the parity probe's `readHeatField(0, true)`).
                            let mut v = Vec::with_capacity(w * h * channels as usize);
                            for y in 0..h {
                                for x in 0..w {
                                    for c in 0..channels as usize {
                                        v.push(at(x, y, c));
                                    }
                                }
                            }
                            return v;
                        }
                        // As `readHeatField`: every stride-th texel's density, absolute, zeros kept.
                        let n = w * h;
                        let step = (n / max).max(1);
                        let mut v = Vec::with_capacity(n / step + 1);
                        let mut k = 0;
                        while k < n {
                            let val = at(k % w, k / w, 0);
                            v.push(if val.is_finite() { val.abs() } else { 0.0 });
                            k += step;
                        }
                        v
                    });
                    r.buffer.unmap();
                    reply(out);
                }
            }
        }
    }

    /// Present intervals and CPU times since the last call.
    pub fn take_times(&mut self) -> (Vec<f32>, Vec<f32>) {
        (std::mem::take(&mut self.stats.intervals), std::mem::take(&mut self.stats.cpu))
    }
}

pub fn half_to_f32(h: u16) -> f32 {
    let s = if h & 0x8000 != 0 { -1.0 } else { 1.0 };
    let e = ((h >> 10) & 0x1f) as i32;
    let m = (h & 0x3ff) as f32;
    match e {
        0 => s * m * 2f32.powi(-24),
        31 => {
            if m == 0.0 {
                s * f32::INFINITY
            } else {
                f32::NAN
            }
        }
        _ => s * (1.0 + m / 1024.0) * 2f32.powi(e - 15),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn half_round_trip() {
        for v in [0.0f32, 1.0, -2.5, 0.333, 65504.0, 1e-5] {
            let back = half_to_f32(f16_bits(v));
            assert!((back - v).abs() <= v.abs() * 1e-3 + 1e-7, "{v} -> {back}");
        }
    }
}
