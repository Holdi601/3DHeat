//! A tiled terrain natively (Stage 5), as the web engine has it (`webgpu/terrain.ts`,
//! `webgpu/boxes.ts`): the tiles' 16-bit heights and their classes in two texture arrays, a layer
//! a tile; one node grid drawn instanced, a node an instance, each frame's nodes from the page; and
//! the terrain's placed objects, one unit cube drawn per object, a buffer per cell of the map, in
//! every pass the level's structures go through (faces, the depth seal, the structure depth, the
//! peeled layers). The page's messages are `src/render/native/nativeTerrain.ts`; the shaders the
//! engine's (`terrain.wgsl`, `box.wgsl`, `peel_box.wgsl`).

use std::collections::HashMap;

use crate::generated::*;
use crate::renderer::{module, DEPTH_FORMAT, SCENE_FORMAT};

const W_TERRAIN: &str = include_str!("../wgsl/terrain.wgsl");
const W_BOX: &str = include_str!("../wgsl/box.wgsl");
const W_PEEL_BOX: &str = include_str!("../wgsl/peel_box.wgsl");

/// The terrain's tiles and node grid, once the page has sent `LEVEL_TERRAIN`.
struct Tiles {
    heights: wgpu::Texture,
    classes: wgpu::Texture,
    group2: wgpu::BindGroup,
    side: u32,
    layers: u32,
    grid: wgpu::Buffer,
    grid_index: wgpu::Buffer,
    grid_count: u32,
    cube: wgpu::Buffer,
    cube_index: wgpu::Buffer,
    cube_count: u32,
}

/// This frame's terrain (`SECTION_TERRAIN`): the nodes, the classes' colours on, the cells in view.
#[derive(Clone, Debug, Default)]
pub struct TerrainFrame {
    pub nodes: Vec<f32>,
    pub count: u32,
    pub colours: bool,
    pub cells: Vec<u32>,
}

pub struct Terrain {
    pub pipeline: wgpu::RenderPipeline,
    /// The boxes' pipelines: see-through faces, solid faces, depth only, the peeled layers.
    pub shell: wgpu::RenderPipeline,
    pub solid: wgpu::RenderPipeline,
    pub depth: wgpu::RenderPipeline,
    pub peel: wgpu::RenderPipeline,
    tiles: Option<Tiles>,
    uniform: wgpu::Buffer,
    instances: Option<wgpu::Buffer>,
    /// The placed objects by the page's cell id: their instances and count.
    cells: HashMap<u32, (wgpu::Buffer, u32)>,
    pub bytes: u64,
}

fn depth_state(write: bool) -> wgpu::DepthStencilState {
    wgpu::DepthStencilState { format: DEPTH_FORMAT, depth_write_enabled: Some(write), depth_compare: Some(wgpu::CompareFunction::GreaterEqual), stencil: Default::default(), bias: Default::default() }
}

fn blend() -> wgpu::BlendState {
    wgpu::BlendState {
        color: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::SrcAlpha, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
        alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::One, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
    }
}

const INSTANCE: [wgpu::VertexAttribute; 3] = wgpu::vertex_attr_array![5 => Float32x4, 6 => Float32x4, 7 => Float32x4];

fn pipe(device: &wgpu::Device, m: &wgpu::ShaderModule, label: &str, vs: &str, first: wgpu::VertexBufferLayout<'_>, colour: Option<bool>, depth_write: bool) -> wgpu::RenderPipeline {
    let inst = wgpu::VertexBufferLayout { array_stride: BOX_FLOATS as u64 * 4, step_mode: wgpu::VertexStepMode::Instance, attributes: &INSTANCE };
    let targets = [colour.map(|all| wgpu::ColorTargetState { format: SCENE_FORMAT, blend: Some(blend()), write_mask: if all { wgpu::ColorWrites::ALL } else { wgpu::ColorWrites::empty() } })];
    device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
        label: Some(label),
        layout: None,
        vertex: wgpu::VertexState { module: m, entry_point: Some(vs), buffers: &[Some(first), Some(inst)], compilation_options: Default::default() },
        fragment: Some(wgpu::FragmentState {
            module: m,
            entry_point: Some(if colour.is_some() { "fsMesh" } else { "fsPeel" }),
            targets: if colour.is_some() { &targets } else { &[] },
            compilation_options: Default::default(),
        }),
        primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
        depth_stencil: Some(depth_state(depth_write)),
        multisample: Default::default(),
        multiview_mask: None,
        cache: None,
    })
}

impl Terrain {
    pub fn new(device: &wgpu::Device) -> Self {
        const GRID: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![0 => Float32x3];
        const CORNER: [wgpu::VertexAttribute; 2] = wgpu::vertex_attr_array![0 => Float32x3, 1 => Float32x3];
        const CORNER_ONLY: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![0 => Float32x3];
        let vb = |stride: u64, attributes: &'static [wgpu::VertexAttribute]| wgpu::VertexBufferLayout { array_stride: stride, step_mode: wgpu::VertexStepMode::Vertex, attributes };
        let m_terrain = module(device, "terrain", W_TERRAIN);
        let m_box = module(device, "boxes", W_BOX);
        let m_peel = module(device, "boxes peel", W_PEEL_BOX);
        let uniform = device.create_buffer(&wgpu::BufferDescriptor { label: Some("terrain uniforms"), size: 16 * 16 + 16, usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST, mapped_at_creation: false });
        // The terrain's nodes: the grid, then INSTANCE_FLOATS (12) per node as the boxes' rows.
        let terrain_inst = wgpu::VertexBufferLayout { array_stride: TERRAIN_INSTANCE_FLOATS as u64 * 4, step_mode: wgpu::VertexStepMode::Instance, attributes: &INSTANCE };
        let pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("terrain"),
            layout: None,
            vertex: wgpu::VertexState { module: &m_terrain, entry_point: Some("vsTerrain"), buffers: &[Some(vb(12, &GRID)), Some(terrain_inst)], compilation_options: Default::default() },
            fragment: Some(wgpu::FragmentState {
                module: &m_terrain,
                entry_point: Some("fsMesh"),
                targets: &[Some(wgpu::ColorTargetState { format: SCENE_FORMAT, blend: Some(blend()), write_mask: wgpu::ColorWrites::ALL })],
                compilation_options: Default::default(),
            }),
            primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
            depth_stencil: Some(depth_state(true)),
            multisample: Default::default(),
            multiview_mask: None,
            cache: None,
        });
        Self {
            pipeline,
            shell: pipe(device, &m_box, "boxes shell", "vsBox", vb(24, &CORNER), Some(true), false),
            solid: pipe(device, &m_box, "boxes solid", "vsBox", vb(24, &CORNER), Some(true), true),
            depth: pipe(device, &m_box, "boxes depth", "vsBox", vb(24, &CORNER), Some(false), true),
            peel: pipe(device, &m_peel, "boxes peel", "vsPeelBox", vb(24, &CORNER_ONLY), None, true),
            tiles: None,
            uniform,
            instances: None,
            cells: HashMap::new(),
            bytes: 0,
        }
    }

    pub fn active(&self) -> bool {
        self.tiles.is_some()
    }

    /// One of the page's terrain messages (`LEVEL_TERRAIN`, `LEVEL_TERRAIN_TILE`, `LEVEL_BOXES`).
    pub fn message(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, b: &[u8]) -> anyhow::Result<()> {
        use wgpu::util::DeviceExt;
        let w = |k: usize| -> anyhow::Result<u32> {
            anyhow::ensure!(b.len() >= k * 4 + 4, "terrain message short");
            Ok(u32::from_le_bytes([b[k * 4], b[k * 4 + 1], b[k * 4 + 2], b[k * 4 + 3]]))
        };
        let words = |at: usize, n: usize| -> anyhow::Result<&[u8]> {
            anyhow::ensure!(b.len() >= (at + n) * 4, "terrain message short");
            Ok(&b[at * 4..(at + n) * 4])
        };
        match w(0)? {
            LEVEL_TERRAIN => {
                self.tiles = None;
                self.cells.clear();
                self.instances = None;
                self.bytes = 0;
                let (side, layers, gnv, gni, cnv, cni) = (w(1)?, w(2)?, w(3)? as usize, w(4)? as usize, w(5)? as usize, w(6)? as usize);
                if side == 0 {
                    return Ok(());
                }
                let lim = device.limits();
                let layers = layers.min(lim.max_texture_array_layers);
                anyhow::ensure!(side <= lim.max_texture_dimension_2d, "terrain tiles of {side} past the device's {}", lim.max_texture_dimension_2d);
                let palette = words(7, 64)?;
                let mut at = 7 + 64;
                let grid_v = words(at, gnv)?;
                at += gnv;
                let grid_i = words(at, gni)?;
                at += gni;
                let cube_v = words(at, cnv)?;
                at += cnv;
                let cube_i = words(at, cni)?;
                let mut u = palette.to_vec();
                u.extend_from_slice(&(side as f32).to_le_bytes());
                u.resize(16 * 16 + 16, 0);
                queue.write_buffer(&self.uniform, 0, &u);
                let tex = |label: &str, format| {
                    device.create_texture(&wgpu::TextureDescriptor {
                        label: Some(label),
                        size: wgpu::Extent3d { width: side, height: side, depth_or_array_layers: layers },
                        mip_level_count: 1,
                        sample_count: 1,
                        dimension: wgpu::TextureDimension::D2,
                        format,
                        usage: wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::COPY_DST,
                        view_formats: &[],
                    })
                };
                let heights = tex("terrain heights", wgpu::TextureFormat::R16Uint);
                let classes = tex("terrain classes", wgpu::TextureFormat::R8Uint);
                let array = |t: &wgpu::Texture| t.create_view(&wgpu::TextureViewDescriptor { dimension: Some(wgpu::TextureViewDimension::D2Array), ..Default::default() });
                let group2 = device.create_bind_group(&wgpu::BindGroupDescriptor {
                    label: Some("terrain tiles"),
                    layout: &self.pipeline.get_bind_group_layout(2),
                    entries: &[
                        wgpu::BindGroupEntry { binding: 0, resource: wgpu::BindingResource::TextureView(&array(&heights)) },
                        wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::TextureView(&array(&classes)) },
                        wgpu::BindGroupEntry { binding: 2, resource: self.uniform.as_entire_binding() },
                    ],
                });
                let init = |label: &str, data: &[u8], usage| device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some(label), contents: data, usage });
                self.bytes = side as u64 * side as u64 * 3 * layers as u64;
                self.tiles = Some(Tiles {
                    heights,
                    classes,
                    group2,
                    side,
                    layers,
                    grid: init("terrain grid", grid_v, wgpu::BufferUsages::VERTEX),
                    grid_index: init("terrain grid index", grid_i, wgpu::BufferUsages::INDEX),
                    grid_count: gni as u32,
                    cube: init("box cube", cube_v, wgpu::BufferUsages::VERTEX),
                    cube_index: init("box cube index", cube_i, wgpu::BufferUsages::INDEX),
                    cube_count: cni as u32,
                });
            }
            LEVEL_TERRAIN_TILE => {
                let Some(t) = &self.tiles else { return Ok(()) };
                let slot = w(1)?;
                anyhow::ensure!(slot < t.layers, "terrain layer {slot} past {}", t.layers);
                let n = (t.side * t.side) as usize;
                let hb = (n * 2).div_ceil(4) * 4;
                anyhow::ensure!(b.len() >= 8 + hb + n, "terrain tile short");
                let put = |tex: &wgpu::Texture, data: &[u8], bpp: u32| {
                    queue.write_texture(
                        wgpu::TexelCopyTextureInfo { texture: tex, mip_level: 0, origin: wgpu::Origin3d { x: 0, y: 0, z: slot }, aspect: Default::default() },
                        data,
                        wgpu::TexelCopyBufferLayout { offset: 0, bytes_per_row: Some(t.side * bpp), rows_per_image: Some(t.side) },
                        wgpu::Extent3d { width: t.side, height: t.side, depth_or_array_layers: 1 },
                    )
                };
                put(&t.heights, &b[8..8 + n * 2], 2);
                put(&t.classes, &b[8 + hb..8 + hb + n], 1);
            }
            LEVEL_BOXES => {
                let (id, count) = (w(1)?, w(2)? as usize);
                if id == u32::MAX {
                    self.cells.clear();
                    return Ok(());
                }
                if let Some((buf, _)) = self.cells.remove(&id) {
                    self.bytes = self.bytes.saturating_sub(buf.size());
                }
                if count == 0 || self.tiles.is_none() {
                    return Ok(());
                }
                let data = words(3, count * BOX_FLOATS as usize)?;
                anyhow::ensure!(crate::occlusion::buffer_fits(device, data.len() as u64), "a cell of {count} boxes past the device's buffer size");
                let buf = device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some("boxes"), contents: data, usage: wgpu::BufferUsages::VERTEX });
                self.bytes += buf.size();
                self.cells.insert(id, (buf, count as u32));
            }
            k => anyhow::bail!("terrain message kind {k}"),
        }
        Ok(())
    }

    /// The frame's nodes into the instance buffer (grown as needed); false with nothing to draw.
    pub fn prepare(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, f: &TerrainFrame) -> bool {
        if self.tiles.is_none() || f.count == 0 {
            return false;
        }
        let bytes = (f.count as u64 * TERRAIN_INSTANCE_FLOATS as u64 * 4).min(f.nodes.len() as u64 * 4);
        if !crate::occlusion::buffer_fits(device, bytes) {
            return false;
        }
        if self.instances.as_ref().is_none_or(|b| b.size() < bytes) {
            self.instances = Some(device.create_buffer(&wgpu::BufferDescriptor {
                label: Some("terrain nodes"),
                size: bytes.max(64 * 1024),
                usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST,
                mapped_at_creation: false,
            }));
        }
        queue.write_buffer(self.instances.as_ref().unwrap(), 0, bytemuck::cast_slice(&f.nodes[..bytes as usize / 4]));
        true
    }

    /// The nodes, after `prepare`, with the ground's uniform group and the plain texture group.
    pub fn draw(&self, pass: &mut wgpu::RenderPass<'_>, f: &TerrainFrame, group0: &wgpu::BindGroup, atlas: &wgpu::BindGroup) {
        let (Some(t), Some(inst)) = (&self.tiles, &self.instances) else { return };
        let count = f.count.min((inst.size() / (TERRAIN_INSTANCE_FLOATS as u64 * 4)) as u32);
        pass.set_pipeline(&self.pipeline);
        pass.set_bind_group(0, group0, &[]);
        pass.set_bind_group(1, atlas, &[]);
        pass.set_bind_group(2, &t.group2, &[]);
        pass.set_vertex_buffer(0, t.grid.slice(..));
        pass.set_vertex_buffer(1, inst.slice(..));
        pass.set_index_buffer(t.grid_index.slice(..), wgpu::IndexFormat::Uint32);
        pass.draw_indexed(0..t.grid_count, 0, 0..count);
    }

    /// Whether any cell the frame names is held (the boxes count as structures then).
    pub fn any_boxes(&self, f: Option<&TerrainFrame>) -> bool {
        f.is_some_and(|f| f.cells.iter().any(|c| self.cells.contains_key(c)))
    }

    /// The cells in view with the pipeline and bind groups already set (`GpuBoxes.draw`).
    pub fn draw_boxes(&self, pass: &mut wgpu::RenderPass<'_>, f: &TerrainFrame) {
        let Some(t) = &self.tiles else { return };
        pass.set_vertex_buffer(0, t.cube.slice(..));
        pass.set_index_buffer(t.cube_index.slice(..), wgpu::IndexFormat::Uint32);
        for id in &f.cells {
            if let Some((buf, n)) = self.cells.get(id) {
                pass.set_vertex_buffer(1, buf.slice(..));
                pass.draw_indexed(0..t.cube_count, 0, 0..*n);
            }
        }
    }
}
