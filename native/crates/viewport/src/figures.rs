//! The box replay's figures and cubes, as the WebGPU renderer draws them in its scene pass
//! (src/render/webgpu/figures.ts, `drawScene`): each figure mesh sent once by the page a slice
//! at a time (`viewport_mesh`) and kept by its id, each frame's instances in the packet, one
//! instanced draw a mesh - the solid parts writing depth, the see-through parts (propeller
//! discs, canopies) after everything solid without it. The cubes and their look lines are the
//! plain box replay's (`CUBE_WGSL`, `LOOK_WGSL`). Same WGSL as the page (`wgsl/figure.wgsl`,
//! `cube.wgsl`, `look.wgsl`), same blending, same reverse-Z depth test.

use std::collections::HashMap;

use wgpu::util::DeviceExt;

use crate::generated::*;
use crate::packet::Packet;
use crate::renderer::{DEPTH_FORMAT, SCENE_FORMAT};

const W_FIGURE: &str = include_str!("../wgsl/figure.wgsl");
const W_CUBE: &str = include_str!("../wgsl/cube.wgsl");
const W_LOOK: &str = include_str!("../wgsl/look.wgsl");
const W_LINE: &str = include_str!("../wgsl/line.wgsl");
const W_SYMBOL: &str = include_str!("../wgsl/symbol.wgsl");

/// Bytes of the scene uniforms each draw reads (`SCENE_UNIFORM_BYTES`).
pub const SCENE_UNIFORM_BYTES: u64 = 64 + 16 * 8;

struct FigureMesh {
    buf: wgpu::Buffer,
    count: u32,
    total: u64,
    received: u64,
    /// Whether any vertex is see-through (alpha under `SEE_THROUGH_BELOW`).
    see: bool,
}

/// Per-frame vertex data (instances, cubes), written in one go before the submit.
struct VertexRing {
    buf: wgpu::Buffer,
    data: Vec<u8>,
}

/// What one packet draws: the offsets its instances and cubes landed at.
#[derive(Default)]
pub struct FigureFrame {
    /// Per drawn batch: mesh id, instance count, byte offset of its instances.
    batches: Vec<(u32, u32, u64)>,
    cubes: Option<(u32, u64)>,
    /// Vertex count and byte offset of the scene's triangles, the trails and the overlay lines.
    tris: Option<(u32, u64)>,
    trails: Option<(u32, u64)>,
    overlay: Option<(u32, u64)>,
    /// Instance count and byte offset of the far-off glyphs.
    glyphs: Option<(u32, u64)>,
}

impl FigureFrame {
    pub fn is_empty(&self) -> bool {
        self.batches.is_empty() && self.cubes.is_none() && self.tris.is_none() && self.trails.is_none() && self.overlay.is_none() && self.glyphs.is_none()
    }
}

pub struct Figures {
    layout: wgpu::BindGroupLayout,
    solid: wgpu::RenderPipeline,
    see: wgpu::RenderPipeline,
    cube: wgpu::RenderPipeline,
    look: wgpu::RenderPipeline,
    /// `LINE_WGSL` four ways (`buildLinePipeline`): the solid triangles, the see-through ones,
    /// the trails, and the overlay drawn over everything.
    tri: wgpu::RenderPipeline,
    tri_see: wgpu::RenderPipeline,
    trail: wgpu::RenderPipeline,
    overlay: wgpu::RenderPipeline,
    /// The far-off glyphs (`symbols/shaders.ts`): one quad an instance, from the atlas the page made.
    glyph: wgpu::RenderPipeline,
    glyph_layout: wgpu::BindGroupLayout,
    atlas: Option<wgpu::TextureView>,
    sampler: wgpu::Sampler,
    cube_vb: wgpu::Buffer,
    cube_ib: wgpu::Buffer,
    look_vb: wgpu::Buffer,
    meshes: HashMap<u32, FigureMesh>,
    ring: VertexRing,
    /// Bytes the meshes hold on the GPU.
    pub bytes: u64,
}

fn alpha_blend() -> wgpu::BlendState {
    wgpu::BlendState {
        color: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::SrcAlpha, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
        alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::One, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
    }
}

/// Reverse-Z: nearer is larger, an equal depth passes (`GPU_DEPTH_TEST`).
fn depth(write: bool) -> Option<wgpu::DepthStencilState> {
    Some(wgpu::DepthStencilState { format: DEPTH_FORMAT, depth_write_enabled: write, depth_compare: wgpu::CompareFunction::GreaterEqual, stencil: Default::default(), bias: Default::default() })
}

/// The cube's 24 corners (position, normal) and 36 indices (`buildCubeGeometry`).
fn cube_geometry() -> (Vec<f32>, Vec<u16>) {
    let faces: [([f32; 3], [[f32; 3]; 4]); 6] = [
        ([0.0, 0.0, 1.0], [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]]),
        ([0.0, 0.0, -1.0], [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]]),
        ([1.0, 0.0, 0.0], [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]]),
        ([-1.0, 0.0, 0.0], [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]]),
        ([0.0, 1.0, 0.0], [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]]),
        ([0.0, -1.0, 0.0], [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]]),
    ];
    let mut v = Vec::with_capacity(6 * 4 * 6);
    let mut idx = Vec::with_capacity(36);
    for (fi, (n, corners)) in faces.iter().enumerate() {
        for c in corners {
            v.extend_from_slice(c);
            v.extend_from_slice(n);
        }
        let b = (fi * 4) as u16;
        idx.extend_from_slice(&[b, b + 1, b + 2, b, b + 2, b + 3]);
    }
    (v, idx)
}

impl Figures {
    pub fn new(device: &wgpu::Device) -> Self {
        let layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            label: Some("scene uniforms"),
            entries: &[wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
                ty: wgpu::BindingType::Buffer { ty: wgpu::BufferBindingType::Uniform, has_dynamic_offset: false, min_binding_size: None },
                count: None,
            }],
        });
        let pl = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor { label: Some("scene uniforms"), bind_group_layouts: &[&layout], push_constant_ranges: &[] });
        let module = |label: &str, src: &str| device.create_shader_module(wgpu::ShaderModuleDescriptor { label: Some(label), source: wgpu::ShaderSource::Wgsl(src.into()) });
        let m_fig = module("figures", W_FIGURE);
        let m_cube = module("cube", W_CUBE);
        let m_look = module("look", W_LOOK);

        const MESH_ATTRS: [wgpu::VertexAttribute; 7] = wgpu::vertex_attr_array![0 => Float32x3, 1 => Float32x4, 2 => Float32x4, 3 => Float32, 8 => Float32x4, 9 => Float32x4, 10 => Float32x4];
        const INST_ATTRS: [wgpu::VertexAttribute; 4] = wgpu::vertex_attr_array![4 => Float32x4, 5 => Float32x4, 6 => Float32x4, 7 => Float32x4];
        let figure = |alpha_pass: f64, write: bool| {
            let constants = [("alphaPass", alpha_pass)];
            let options = wgpu::PipelineCompilationOptions { constants: &constants, ..Default::default() };
            device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
                label: Some(if alpha_pass > 1.5 { "figures see-through" } else { "figures" }),
                layout: Some(&pl),
                vertex: wgpu::VertexState {
                    module: &m_fig,
                    entry_point: Some("vsFigure"),
                    buffers: &[
                        wgpu::VertexBufferLayout { array_stride: MESH_STRIDE as u64 * 4, step_mode: wgpu::VertexStepMode::Vertex, attributes: &MESH_ATTRS },
                        wgpu::VertexBufferLayout { array_stride: INSTANCE_STRIDE as u64 * 4, step_mode: wgpu::VertexStepMode::Instance, attributes: &INST_ATTRS },
                    ],
                    compilation_options: options.clone(),
                },
                fragment: Some(wgpu::FragmentState {
                    module: &m_fig,
                    entry_point: Some("fsFigure"),
                    targets: &[Some(wgpu::ColorTargetState { format: SCENE_FORMAT, blend: Some(alpha_blend()), write_mask: wgpu::ColorWrites::ALL })],
                    compilation_options: options,
                }),
                primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
                depth_stencil: depth(write),
                multisample: Default::default(),
                multiview: None,
                cache: None,
            })
        };
        let solid = figure(1.0, true);
        let see = figure(2.0, false);

        const CUBE_VERT: [wgpu::VertexAttribute; 2] = wgpu::vertex_attr_array![0 => Float32x3, 1 => Float32x3];
        const CUBE_INST: [wgpu::VertexAttribute; 3] = wgpu::vertex_attr_array![2 => Float32x3, 3 => Float32x3, 4 => Float32x2];
        let cube = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("cube"),
            layout: Some(&pl),
            vertex: wgpu::VertexState {
                module: &m_cube,
                entry_point: Some("vsCube"),
                buffers: &[
                    wgpu::VertexBufferLayout { array_stride: 24, step_mode: wgpu::VertexStepMode::Vertex, attributes: &CUBE_VERT },
                    wgpu::VertexBufferLayout { array_stride: 32, step_mode: wgpu::VertexStepMode::Instance, attributes: &CUBE_INST },
                ],
                compilation_options: Default::default(),
            },
            fragment: Some(wgpu::FragmentState {
                module: &m_cube,
                entry_point: Some("fsCube"),
                targets: &[Some(wgpu::ColorTargetState { format: SCENE_FORMAT, blend: None, write_mask: wgpu::ColorWrites::ALL })],
                compilation_options: Default::default(),
            }),
            primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
            depth_stencil: depth(true),
            multisample: Default::default(),
            multiview: None,
            cache: None,
        });
        const LOOK_VERT: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![0 => Float32];
        const LOOK_INST: [wgpu::VertexAttribute; 3] = wgpu::vertex_attr_array![1 => Float32x3, 2 => Float32x3, 3 => Float32x2];
        let look = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("look"),
            layout: Some(&pl),
            vertex: wgpu::VertexState {
                module: &m_look,
                entry_point: Some("vsLook"),
                buffers: &[
                    wgpu::VertexBufferLayout { array_stride: 4, step_mode: wgpu::VertexStepMode::Vertex, attributes: &LOOK_VERT },
                    wgpu::VertexBufferLayout { array_stride: 32, step_mode: wgpu::VertexStepMode::Instance, attributes: &LOOK_INST },
                ],
                compilation_options: Default::default(),
            },
            fragment: Some(wgpu::FragmentState {
                module: &m_look,
                entry_point: Some("fsLook"),
                targets: &[Some(wgpu::ColorTargetState { format: SCENE_FORMAT, blend: Some(alpha_blend()), write_mask: wgpu::ColorWrites::ALL })],
                compilation_options: Default::default(),
            }),
            primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::LineList, ..Default::default() },
            depth_stencil: depth(false),
            multisample: Default::default(),
            multiview: None,
            cache: None,
        });
        let (cv, ci) = cube_geometry();
        let cube_vb = device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some("cube verts"), contents: bytemuck::cast_slice(&cv), usage: wgpu::BufferUsages::VERTEX });
        let cube_ib = device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some("cube indices"), contents: bytemuck::cast_slice(&ci), usage: wgpu::BufferUsages::INDEX });
        let look_vb = device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some("look verts"), contents: bytemuck::cast_slice(&[0f32, 1.0]), usage: wgpu::BufferUsages::VERTEX });
        let ring = VertexRing { buf: Self::ring_buffer(device, 1 << 20), data: Vec::with_capacity(1 << 20) };
        let m_line = module("line", W_LINE);
        const LINE_ATTRS: [wgpu::VertexAttribute; 2] = wgpu::vertex_attr_array![0 => Float32x3, 1 => Float32x4];
        let line = |topology: wgpu::PrimitiveTopology, always: bool, alpha_pass: f64| {
            let tris = topology == wgpu::PrimitiveTopology::TriangleList;
            let constants = [("alphaPass", alpha_pass)];
            let options = wgpu::PipelineCompilationOptions { constants: &constants, ..Default::default() };
            device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
                label: Some("line"),
                layout: Some(&pl),
                vertex: wgpu::VertexState {
                    module: &m_line,
                    entry_point: Some("vsLine"),
                    buffers: &[wgpu::VertexBufferLayout { array_stride: 28, step_mode: wgpu::VertexStepMode::Vertex, attributes: &LINE_ATTRS }],
                    compilation_options: options.clone(),
                },
                fragment: Some(wgpu::FragmentState {
                    module: &m_line,
                    entry_point: Some("fsLine"),
                    targets: &[Some(wgpu::ColorTargetState { format: SCENE_FORMAT, blend: Some(alpha_blend()), write_mask: wgpu::ColorWrites::ALL })],
                    compilation_options: options,
                }),
                primitive: wgpu::PrimitiveState { topology, ..Default::default() },
                depth_stencil: Some(wgpu::DepthStencilState {
                    format: DEPTH_FORMAT,
                    depth_write_enabled: tris && alpha_pass < 1.5,
                    depth_compare: if always { wgpu::CompareFunction::Always } else { wgpu::CompareFunction::GreaterEqual },
                    stencil: Default::default(),
                    bias: Default::default(),
                }),
                multisample: Default::default(),
                multiview: None,
                cache: None,
            })
        };
        let tri = line(wgpu::PrimitiveTopology::TriangleList, false, 1.0);
        let tri_see = line(wgpu::PrimitiveTopology::TriangleList, false, 2.0);
        let trail = line(wgpu::PrimitiveTopology::LineList, false, 0.0);
        let overlay = line(wgpu::PrimitiveTopology::LineList, true, 0.0);
        let glyph_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            label: Some("glyphs"),
            entries: &[
                wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Buffer { ty: wgpu::BufferBindingType::Uniform, has_dynamic_offset: false, min_binding_size: None },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry {
                    binding: 1,
                    visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Texture { sample_type: wgpu::TextureSampleType::Float { filterable: true }, view_dimension: wgpu::TextureViewDimension::D2, multisampled: false },
                    count: None,
                },
                wgpu::BindGroupLayoutEntry { binding: 2, visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT, ty: wgpu::BindingType::Sampler(wgpu::SamplerBindingType::Filtering), count: None },
            ],
        });
        let gl = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor { label: Some("glyphs"), bind_group_layouts: &[&glyph_layout], push_constant_ranges: &[] });
        let m_sym = module("glyphs", W_SYMBOL);
        // SYMBOL_BLEND: premultiplied.
        let premul = wgpu::BlendComponent { src_factor: wgpu::BlendFactor::One, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add };
        let glyph = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("glyphs"),
            layout: Some(&gl),
            vertex: wgpu::VertexState {
                module: &m_sym,
                entry_point: Some("vsGlyph"),
                buffers: &[wgpu::VertexBufferLayout { array_stride: INSTANCE_STRIDE as u64 * 4, step_mode: wgpu::VertexStepMode::Instance, attributes: &INST_ATTRS }],
                compilation_options: Default::default(),
            },
            fragment: Some(wgpu::FragmentState {
                module: &m_sym,
                entry_point: Some("fsGlyph"),
                targets: &[Some(wgpu::ColorTargetState { format: SCENE_FORMAT, blend: Some(wgpu::BlendState { color: premul, alpha: premul }), write_mask: wgpu::ColorWrites::ALL })],
                compilation_options: Default::default(),
            }),
            primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
            depth_stencil: Some(wgpu::DepthStencilState { format: DEPTH_FORMAT, depth_write_enabled: false, depth_compare: wgpu::CompareFunction::Always, stencil: Default::default(), bias: Default::default() }),
            multisample: Default::default(),
            multiview: None,
            cache: None,
        });
        let sampler = device.create_sampler(&wgpu::SamplerDescriptor { mag_filter: wgpu::FilterMode::Linear, min_filter: wgpu::FilterMode::Linear, ..Default::default() });
        Self { layout, solid, see, cube, look, tri, tri_see, trail, overlay, glyph, glyph_layout, atlas: None, sampler, cube_vb, cube_ib, look_vb, meshes: HashMap::new(), ring, bytes: 0 }
    }

    fn ring_buffer(device: &wgpu::Device, size: u64) -> wgpu::Buffer {
        device.create_buffer(&wgpu::BufferDescriptor { label: Some("figure instances"), size, usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST, mapped_at_creation: false })
    }

    /// The bind group of one scene-uniform slot, for every pipeline here.
    pub fn group(&self, device: &wgpu::Device, uniforms: &wgpu::Buffer, offset: u64) -> wgpu::BindGroup {
        device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("figures"),
            layout: &self.layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding { buffer: uniforms, offset, size: wgpu::BufferSize::new(SCENE_UNIFORM_BYTES) }),
            }],
        })
    }

    /// One slice of a mesh from the page: id, vertices, total bytes, offset, then the bytes. A
    /// total of 0 lets the mesh go. The mesh is drawn once all of it has come.
    pub fn mesh_slice(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, bytes: &[u8]) -> anyhow::Result<()> {
        anyhow::ensure!(bytes.len() >= 16, "mesh header");
        let w = |k: usize| u32::from_le_bytes([bytes[k * 4], bytes[k * 4 + 1], bytes[k * 4 + 2], bytes[k * 4 + 3]]);
        let (id, count, total, at) = (w(0), w(1), w(2) as u64, w(3) as u64);
        let data = &bytes[16..];
        // Every mesh let go: a page starting over (its ids start over too).
        if total == 0 && id == u32::MAX {
            self.clear_meshes();
            return Ok(());
        }
        if total == 0 {
            if let Some(m) = self.meshes.remove(&id) {
                self.bytes = self.bytes.saturating_sub(m.total);
            }
            return Ok(());
        }
        anyhow::ensure!(at + data.len() as u64 <= total && data.len() % 4 == 0, "mesh slice out of bounds");
        let m = self.meshes.entry(id).or_insert_with(|| {
            self.bytes += total;
            let buf = device.create_buffer(&wgpu::BufferDescriptor {
                label: Some("figure mesh"),
                size: total.max(16).next_multiple_of(4),
                usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST,
                mapped_at_creation: false,
            });
            FigureMesh { buf, count, total, received: 0, see: false }
        });
        queue.write_buffer(&m.buf, at, data);
        m.received += data.len() as u64;
        // Alpha is each vertex's seventh float (`seeThrough`): slices hold whole vertices.
        let floats: &[f32] = bytemuck::cast_slice(data);
        m.see |= floats.iter().skip(6).step_by(MESH_STRIDE as usize).any(|a| *a < SEE_THROUGH_BELOW);
        Ok(())
    }

    /// Lets every mesh go (the viewport stops, or the page starts over).
    pub fn clear_meshes(&mut self) {
        self.meshes.clear();
        self.bytes = 0;
    }

    /// A frame's start: the instance data written afresh.
    pub fn begin(&mut self) {
        self.ring.data.clear();
    }

    /// Room for `extra` more bytes in the instance buffer. When it must grow, what earlier packets of
    /// this frame wrote goes into the old buffer (their draws read it), and the new one starts empty.
    fn reserve(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, extra: u64) {
        let need = self.ring.data.len() as u64 + extra;
        if need <= self.ring.buf.size() {
            return;
        }
        if !self.ring.data.is_empty() {
            queue.write_buffer(&self.ring.buf, 0, &self.ring.data);
            self.ring.data.clear();
        }
        let size = extra.max(self.ring.buf.size() * 2).next_multiple_of(1 << 16);
        self.ring.buf = Self::ring_buffer(device, size);
    }

    fn push(&mut self, bytes: &[u8]) -> u64 {
        let at = self.ring.data.len() as u64;
        self.ring.data.extend_from_slice(bytes);
        at
    }

    /// A packet's figures and cubes into the instance buffer; what its scene pass will draw.
    pub fn prepare(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, p: &Packet) -> FigureFrame {
        let mut f = FigureFrame::default();
        let inst_bytes = (p.instances.len() * 4) as u64;
        let cube_bytes = (p.cubes.len() * 4) as u64;
        let glyph_bytes = p.glyphs.as_ref().map_or(0, |g| g.instances.len() * 4) as u64;
        let geo_bytes = ((p.tris.len() + p.trails.len() + p.overlay.len()) * 4) as u64 + glyph_bytes;
        if inst_bytes + cube_bytes + geo_bytes == 0 {
            return f;
        }
        self.reserve(device, queue, inst_bytes + cube_bytes + geo_bytes);
        let stride = INSTANCE_STRIDE as usize;
        let mut first = 0usize;
        let mut runs = Vec::new();
        for &(mesh, count) in &p.figures {
            let n = count as usize * stride;
            // A mesh not whole here yet is left out, as the web leaves out one still on its way.
            if self.meshes.get(&mesh).is_some_and(|m| m.received >= m.total) {
                runs.push((mesh, count, first));
            }
            first += n;
        }
        let base = self.push(bytemuck::cast_slice(&p.instances));
        f.batches = runs.into_iter().map(|(mesh, count, at)| (mesh, count, base + at as u64 * 4)).collect();
        if !p.cubes.is_empty() {
            let at = self.push(bytemuck::cast_slice(&p.cubes));
            f.cubes = Some(((p.cubes.len() / 8) as u32, at));
        }
        let mut geo = |v: &[f32]| (!v.is_empty()).then(|| ((v.len() / 7) as u32, self.push(bytemuck::cast_slice(v))));
        f.tris = geo(&p.tris);
        f.trails = geo(&p.trails);
        f.overlay = geo(&p.overlay);
        // Glyphs only once the atlas is here.
        if let (Some(g), true) = (&p.glyphs, self.atlas.is_some()) {
            if !g.instances.is_empty() {
                f.glyphs = Some(((g.instances.len() / INSTANCE_STRIDE as usize) as u32, self.push(bytemuck::cast_slice(&g.instances))));
            }
        }
        f
    }

    /// The instance data of the frame's packets, before the submit.
    pub fn flush(&mut self, queue: &wgpu::Queue) {
        if !self.ring.data.is_empty() {
            queue.write_buffer(&self.ring.buf, 0, &self.ring.data);
        }
    }

    /// The cubes (with `cube` the uniforms at the cube size) and their look lines (`look`, at the
    /// look length), as `drawScene` draws them before the figures.
    pub fn draw_cubes(&self, pass: &mut wgpu::RenderPass<'_>, f: &FigureFrame, cube: &wgpu::BindGroup, look: Option<&wgpu::BindGroup>) {
        let Some((n, at)) = f.cubes else { return };
        pass.set_pipeline(&self.cube);
        pass.set_bind_group(0, cube, &[]);
        pass.set_vertex_buffer(0, self.cube_vb.slice(..));
        pass.set_vertex_buffer(1, self.ring.buf.slice(at..));
        pass.set_index_buffer(self.cube_ib.slice(..), wgpu::IndexFormat::Uint16);
        pass.draw_indexed(0..36, 0, 0..n);
        if let Some(g) = look {
            pass.set_pipeline(&self.look);
            pass.set_bind_group(0, g, &[]);
            pass.set_vertex_buffer(0, self.look_vb.slice(..));
            pass.set_vertex_buffer(1, self.ring.buf.slice(at..));
            pass.draw(0..2, 0..n);
        }
    }

    /// The figures' solid parts (`see` false) or, after everything solid, their see-through ones.
    pub fn draw(&self, pass: &mut wgpu::RenderPass<'_>, f: &FigureFrame, group: &wgpu::BindGroup, see: bool) {
        let mut set = false;
        for &(mesh, count, at) in &f.batches {
            let Some(m) = self.meshes.get(&mesh) else { continue };
            if see && !m.see {
                continue;
            }
            if !set {
                pass.set_pipeline(if see { &self.see } else { &self.solid });
                pass.set_bind_group(0, group, &[]);
                set = true;
            }
            pass.set_vertex_buffer(0, m.buf.slice(..));
            pass.set_vertex_buffer(1, self.ring.buf.slice(at..));
            pass.draw(0..m.count, 0..count);
        }
    }

    fn lines(&self, pass: &mut wgpu::RenderPass<'_>, pipeline: &wgpu::RenderPipeline, at: Option<(u32, u64)>, group: &wgpu::BindGroup) {
        let Some((n, at)) = at else { return };
        pass.set_pipeline(pipeline);
        pass.set_bind_group(0, group, &[]);
        pass.set_vertex_buffer(0, self.ring.buf.slice(at..));
        pass.draw(0..n, 0..1);
    }

    /// The scene's triangles: solid (writing depth), or after everything solid the see-through ones.
    pub fn draw_tris(&self, pass: &mut wgpu::RenderPass<'_>, f: &FigureFrame, group: &wgpu::BindGroup, see: bool) {
        self.lines(pass, if see { &self.tri_see } else { &self.tri }, f.tris, group);
    }

    pub fn draw_trails(&self, pass: &mut wgpu::RenderPass<'_>, f: &FigureFrame, group: &wgpu::BindGroup) {
        self.lines(pass, &self.trail, f.trails, group);
    }

    /// The ruler and probe lines, last and without depth testing.
    pub fn draw_overlay(&self, pass: &mut wgpu::RenderPass<'_>, f: &FigureFrame, group: &wgpu::BindGroup) {
        self.lines(pass, &self.overlay, f.overlay, group);
    }

    /// The glyph atlas the page made (`symbolAtlas`), RGBA8 `ATLAS_WIDTH` x `ATLAS_HEIGHT`.
    pub fn set_atlas(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, pixels: &[u8]) -> anyhow::Result<()> {
        anyhow::ensure!(pixels.len() >= (ATLAS_WIDTH * ATLAS_HEIGHT * 4) as usize, "glyph atlas of {} bytes", pixels.len());
        let tex = device.create_texture_with_data(
            queue,
            &wgpu::TextureDescriptor {
                label: Some("glyph atlas"),
                size: wgpu::Extent3d { width: ATLAS_WIDTH, height: ATLAS_HEIGHT, depth_or_array_layers: 1 },
                mip_level_count: 1,
                sample_count: 1,
                dimension: wgpu::TextureDimension::D2,
                format: wgpu::TextureFormat::Rgba8Unorm,
                usage: wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::COPY_DST,
                view_formats: &[],
            },
            wgpu::util::TextureDataOrder::LayerMajor,
            &pixels[..(ATLAS_WIDTH * ATLAS_HEIGHT * 4) as usize],
        );
        self.atlas = Some(tex.create_view(&Default::default()));
        Ok(())
    }

    /// The glyphs' bind group at one uniform slot (`SYMBOL_UNIFORM_FLOATS`), once the atlas is here.
    pub fn glyph_group(&self, device: &wgpu::Device, uniforms: &wgpu::Buffer, offset: u64) -> Option<wgpu::BindGroup> {
        let atlas = self.atlas.as_ref()?;
        Some(device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("glyphs"),
            layout: &self.glyph_layout,
            entries: &[
                wgpu::BindGroupEntry {
                    binding: 0,
                    resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding { buffer: uniforms, offset, size: wgpu::BufferSize::new(SYMBOL_UNIFORM_FLOATS as u64 * 4) }),
                },
                wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::TextureView(atlas) },
                wgpu::BindGroupEntry { binding: 2, resource: wgpu::BindingResource::Sampler(&self.sampler) },
            ],
        }))
    }

    /// Whether this frame has glyphs to draw.
    pub fn has_glyphs(f: &FigureFrame) -> bool {
        f.glyphs.is_some()
    }

    /// The far-off glyphs, over everything in the scene (`drawScene`), six vertices an instance.
    pub fn draw_glyphs(&self, pass: &mut wgpu::RenderPass<'_>, f: &FigureFrame, group: &wgpu::BindGroup) {
        let Some((n, at)) = f.glyphs else { return };
        pass.set_pipeline(&self.glyph);
        pass.set_bind_group(0, group, &[]);
        pass.set_vertex_buffer(0, self.ring.buf.slice(at..));
        pass.draw(0..6, 0..n);
    }
}