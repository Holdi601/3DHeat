//! A model level's structures and water, and what they do to the heat (Stage 5), as the web
//! engine has them (`drawLevel`, `sealStructures`, `renderStructureDepth`, `peelDepthLayers`):
//!
//! - the water after the ground: a surface with its own tint, writing depth;
//! - the structures as see-through shells (faces, then edges) after everything solid in the
//!   scene, and their depth sealed into the scene's at the end of the pass, colour untouched,
//!   so the heat behind a wall is dimmed;
//! - the nearest structure surface in a target of its own when points behind the terrain are
//!   cut (`hideBehindGround`), so the heat tells a wall from a hillside;
//! - `HEAT_DEPTH_LAYERS` peeled layers behind the nearest surface, so the heat counts the walls
//!   in front of a row and dims per wall.
//!
//! The shaders are the engine's (`mesh.wgsl`, `wire.wgsl`, `peel.wgsl`). Untextured: the level's
//! atlas, image levels and world tiles are not sent to the viewport yet.

use crate::generated::*;
use crate::renderer::{module, tex2d, DEPTH_FORMAT, SCENE_FORMAT};
use crate::LevelMesh;

const W_MESH: &str = include_str!("../wgsl/mesh.wgsl");
const W_WIRE: &str = include_str!("../wgsl/wire.wgsl");
const W_PEEL: &str = include_str!("../wgsl/peel.wgsl");

impl LevelMesh {
    /// A 6-word header (vertex floats, ground indices, has colours, structure indices, edge
    /// indices, water indices), then positions+normals, colours, and the four index sets.
    /// None for an empty or short body.
    pub fn parse(b: &[u8]) -> Option<Self> {
        if b.len() < 24 {
            return None;
        }
        let w = |k: usize| u32::from_le_bytes([b[k * 4], b[k * 4 + 1], b[k * 4 + 2], b[k * 4 + 3]]) as usize;
        let (nv, ng, has_colours, ns, ne, nw) = (w(0), w(1), w(2) != 0, w(3), w(4), w(5));
        let nc = if has_colours { nv / 2 } else { 0 };
        if b.len() < 24 + (nv + nc + ng + ns + ne + nw) * 4 {
            return None;
        }
        let mut at = 24;
        let mut take = |n: usize| {
            let s = &b[at..at + n * 4];
            at += n * 4;
            s.chunks_exact(4).map(|c| [c[0], c[1], c[2], c[3]]).collect::<Vec<[u8; 4]>>()
        };
        let floats = |v: Vec<[u8; 4]>| v.into_iter().map(f32::from_le_bytes).collect::<Vec<f32>>();
        let words = |v: Vec<[u8; 4]>| v.into_iter().map(u32::from_le_bytes).collect::<Vec<u32>>();
        let vertices = floats(take(nv));
        let colours = has_colours.then(|| floats(take(nc)));
        Some(Self { vertices, colours, indices: words(take(ng)), structure: words(take(ns)), edges: words(take(ne)), water: words(take(nw)) })
    }
}

/// An index set of the level on the GPU.
pub struct Indices {
    pub buf: wgpu::Buffer,
    pub count: u32,
}

pub struct Occlusion {
    pub structure: Option<Indices>,
    pub edges: Option<Indices>,
    pub water: Option<Indices>,
    pub bytes: u64,
    /// The structures' faces: see-through, depth tested, writing none (`structPipeline`).
    pub faces: wgpu::RenderPipeline,
    /// Their depth, colour masked (`structDepthPipeline`): the seal and the structure depth.
    pub seal: wgpu::RenderPipeline,
    pub wire: wgpu::RenderPipeline,
    pub peel: wgpu::RenderPipeline,
    /// The peeled layers' targets, at the canvas's size.
    layers: Vec<(wgpu::Texture, wgpu::TextureView)>,
    layers_size: (u32, u32),
}

fn alpha_blend() -> wgpu::BlendState {
    wgpu::BlendState {
        color: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::SrcAlpha, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
        alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::One, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
    }
}

fn depth_state(write: bool) -> wgpu::DepthStencilState {
    // Reverse-Z: nearer is larger, an equal depth passes (`GPU_DEPTH_TEST`).
    wgpu::DepthStencilState {
        format: DEPTH_FORMAT,
        depth_write_enabled: Some(write),
        depth_compare: Some(wgpu::CompareFunction::GreaterEqual),
        stencil: Default::default(),
        bias: Default::default(),
    }
}

/// `buildMeshPipeline` with the level's four vertex buffers.
fn mesh_pipe(device: &wgpu::Device, m: &wgpu::ShaderModule, label: &str, depth_write: bool, colour_write: bool) -> wgpu::RenderPipeline {
    const POS_NORMAL: [wgpu::VertexAttribute; 2] = wgpu::vertex_attr_array![0 => Float32x3, 1 => Float32x3];
    const COLOUR: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![2 => Float32x3];
    const UV: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![3 => Float32x2];
    const TILE: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![4 => Uint32];
    let vbuf = |stride: u64, attrs: &'static [wgpu::VertexAttribute]| Some(wgpu::VertexBufferLayout { array_stride: stride, step_mode: wgpu::VertexStepMode::Vertex, attributes: attrs });
    device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
        label: Some(label),
        layout: None,
        vertex: wgpu::VertexState {
            module: m,
            entry_point: Some("vsMesh"),
            buffers: &[vbuf(24, &POS_NORMAL), vbuf(12, &COLOUR), vbuf(8, &UV), vbuf(4, &TILE)],
            compilation_options: Default::default(),
        },
        fragment: Some(wgpu::FragmentState {
            module: m,
            entry_point: Some("fsMesh"),
            // A zero write mask keeps the attachment bound and the fragment shader running (the
            // slice's discard still applies) while touching only depth.
            targets: &[Some(wgpu::ColorTargetState {
                format: SCENE_FORMAT,
                blend: Some(alpha_blend()),
                write_mask: if colour_write { wgpu::ColorWrites::ALL } else { wgpu::ColorWrites::empty() },
            })],
            compilation_options: Default::default(),
        }),
        primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
        depth_stencil: Some(depth_state(depth_write)),
        multisample: Default::default(),
        multiview_mask: None,
        cache: None,
    })
}

impl Occlusion {
    pub fn new(device: &wgpu::Device) -> Self {
        let m_mesh = module(device, "structures", W_MESH);
        let m_wire = module(device, "structure wire", W_WIRE);
        let m_peel = module(device, "depth peel", W_PEEL);
        const POS: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![0 => Float32x3];
        const UV: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![1 => Float32x2];
        const TILE: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![2 => Uint32];
        let vbuf = |stride: u64, attrs: &'static [wgpu::VertexAttribute]| Some(wgpu::VertexBufferLayout { array_stride: stride, step_mode: wgpu::VertexStepMode::Vertex, attributes: attrs });
        let wire = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("structure wire"),
            layout: None,
            vertex: wgpu::VertexState { module: &m_wire, entry_point: Some("vsWire"), buffers: &[vbuf(24, &POS)], compilation_options: Default::default() },
            fragment: Some(wgpu::FragmentState {
                module: &m_wire,
                entry_point: Some("fsWire"),
                targets: &[Some(wgpu::ColorTargetState { format: SCENE_FORMAT, blend: Some(alpha_blend()), write_mask: wgpu::ColorWrites::ALL })],
                compilation_options: Default::default(),
            }),
            primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::LineList, ..Default::default() },
            depth_stencil: Some(depth_state(false)),
            multisample: Default::default(),
            multiview_mask: None,
            cache: None,
        });
        // Depth only, no colour targets: the discard of what the last layer holds is the mechanism.
        let peel = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("depth peel"),
            layout: None,
            vertex: wgpu::VertexState { module: &m_peel, entry_point: Some("vsPeel"), buffers: &[vbuf(24, &POS), vbuf(8, &UV), vbuf(4, &TILE)], compilation_options: Default::default() },
            fragment: Some(wgpu::FragmentState { module: &m_peel, entry_point: Some("fsPeel"), targets: &[], compilation_options: Default::default() }),
            primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
            depth_stencil: Some(depth_state(true)),
            multisample: Default::default(),
            multiview_mask: None,
            cache: None,
        });
        Self {
            structure: None,
            edges: None,
            water: None,
            bytes: 0,
            faces: mesh_pipe(device, &m_mesh, "structure faces", false, true),
            seal: mesh_pipe(device, &m_mesh, "structure depth", true, false),
            wire,
            peel,
            layers: Vec::new(),
            layers_size: (0, 0),
        }
    }

    /// The level's structures, edges and water (none without a level).
    pub fn set_level(&mut self, device: &wgpu::Device, level: Option<&LevelMesh>) {
        use wgpu::util::DeviceExt;
        let set = |label: &str, idx: &[u32]| {
            (!idx.is_empty()).then(|| Indices {
                buf: device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some(label), contents: bytemuck::cast_slice(idx), usage: wgpu::BufferUsages::INDEX }),
                count: idx.len() as u32,
            })
        };
        let empty: &[u32] = &[];
        self.structure = set("level structures", level.map_or(empty, |l| &l.structure));
        self.edges = set("level structure edges", level.map_or(empty, |l| &l.edges));
        self.water = set("level water", level.map_or(empty, |l| &l.water));
        self.bytes = [&self.structure, &self.edges, &self.water].iter().filter_map(|s| s.as_ref()).map(|s| s.buf.size()).sum();
    }

    /// `activeLayers`: how many peeled layers the heat reads this frame.
    pub fn active_layers(&self, occlusion: f32) -> u32 {
        if occlusion > 0.0 && self.structure.is_some() {
            HEAT_DEPTH_LAYERS
        } else {
            0
        }
    }

    /// Peeled layer `k`'s view, once made.
    pub fn layer(&self, k: usize) -> Option<&wgpu::TextureView> {
        self.layers.get(k).map(|l| &l.1)
    }

    /// The layers' targets at the canvas's size.
    pub fn ensure_layers(&mut self, device: &wgpu::Device, width: u32, height: u32) {
        if self.layers_size == (width, height) && !self.layers.is_empty() {
            return;
        }
        let usage = wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::TEXTURE_BINDING;
        self.layers = (0..HEAT_DEPTH_LAYERS).map(|i| tex2d(device, &format!("depth peel {i}"), width, height, DEPTH_FORMAT, usage)).collect();
        self.layers_size = (width, height);
    }
}

/// The level's vertex buffers, as the mesh shader takes them.
pub struct LevelBuffers<'a> {
    pub vertices: &'a wgpu::Buffer,
    pub colours: &'a wgpu::Buffer,
    pub uvs: &'a wgpu::Buffer,
    pub tiles: &'a wgpu::Buffer,
}

impl LevelBuffers<'_> {
    pub fn set(&self, pass: &mut wgpu::RenderPass<'_>) {
        pass.set_vertex_buffer(0, self.vertices.slice(..));
        pass.set_vertex_buffer(1, self.colours.slice(..));
        pass.set_vertex_buffer(2, self.uvs.slice(..));
        pass.set_vertex_buffer(3, self.tiles.slice(..));
    }
}

/// Indexed draws of one index set with a pipeline and its two bind groups.
pub fn draw_set(pass: &mut wgpu::RenderPass<'_>, pipe: &wgpu::RenderPipeline, groups: &(wgpu::BindGroup, wgpu::BindGroup), set: &Indices) {
    pass.set_pipeline(pipe);
    pass.set_bind_group(0, &groups.0, &[]);
    pass.set_bind_group(1, &groups.1, &[]);
    pass.set_index_buffer(set.buf.slice(..), wgpu::IndexFormat::Uint32);
    pass.draw_indexed(0..set.count, 0, 0..1);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn level_parses() {
        let mut b = Vec::new();
        for w in [6u32, 3, 0, 3, 2, 0] {
            b.extend_from_slice(&w.to_le_bytes());
        }
        for v in [1f32, 2.0, 3.0, 0.0, 1.0, 0.0] {
            b.extend_from_slice(&v.to_le_bytes());
        }
        for i in [0u32, 0, 0, 0, 0, 0, 0, 0] {
            b.extend_from_slice(&i.to_le_bytes());
        }
        let l = LevelMesh::parse(&b).unwrap();
        assert_eq!((l.vertices.len(), l.indices.len(), l.structure.len(), l.edges.len(), l.water.len()), (6, 3, 3, 2, 0));
        assert!(l.colours.is_none());
        assert!(LevelMesh::parse(&b[..b.len() - 4]).is_none());
        assert!(LevelMesh::parse(&[]).is_none());
    }
}
