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
//! The shaders are the engine's (`mesh.wgsl`, `wire.wgsl`, `peel.wgsl`, `map.wgsl`). The level is a
//! `GpuMesh` (`uploadMesh`): one vertex buffer, colours, UVs and tile numbers always backed, up to
//! five index sets (ground, structures, their edges, water, the ground's own edges once asked for),
//! its tile table and its texture (the level's atlas with its mip levels, `loadAtlas`) once sent.
//! The page's messages are `src/render/native/levelMessages.ts`.

use crate::generated::*;
use crate::renderer::{module, tex2d, DEPTH_FORMAT, SCENE_FORMAT};
use crate::LevelMesh;

const W_MESH: &str = include_str!("../wgsl/mesh.wgsl");
const W_WIRE: &str = include_str!("../wgsl/wire.wgsl");
const W_PEEL: &str = include_str!("../wgsl/peel.wgsl");
const W_MAP: &str = include_str!("../wgsl/map.wgsl");

impl LevelMesh {
    /// `LEVEL_MESH`'s body after its kind and id: a 10-word head (vertex floats, ground indices,
    /// has colours, structure indices, edge indices, water indices, has UVs, has tile numbers,
    /// tile-table floats, 0), the bounds (6 floats), then positions+normals, colours, UVs, tile
    /// numbers, the tile table and the four index sets. None for a short body.
    pub fn parse(b: &[u8]) -> Option<Self> {
        const HEAD: usize = 16 * 4;
        if b.len() < HEAD {
            return None;
        }
        let w = |k: usize| u32::from_le_bytes([b[k * 4], b[k * 4 + 1], b[k * 4 + 2], b[k * 4 + 3]]) as usize;
        let (nv, ng, has_colours, ns, ne, nw, has_uvs, has_tiles, nr) = (w(0), w(1), w(2) != 0, w(3), w(4), w(5), w(6) != 0, w(7) != 0, w(8));
        let n = nv / 6;
        let nc = if has_colours { n * 3 } else { 0 };
        let nu = if has_uvs { n * 2 } else { 0 };
        let nt = if has_tiles { n } else { 0 };
        let words = nv.checked_add(nc)?.checked_add(nu)?.checked_add(nt)?.checked_add(nr)?.checked_add(ng)?.checked_add(ns)?.checked_add(ne)?.checked_add(nw)?;
        if b.len() < HEAD + words.checked_mul(4)? {
            return None;
        }
        let mut at = HEAD;
        let mut take = |n: usize| {
            let s = &b[at..at + n * 4];
            at += n * 4;
            s
        };
        let floats = |s: &[u8]| s.chunks_exact(4).map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]])).collect::<Vec<f32>>();
        let words = |s: &[u8]| s.chunks_exact(4).map(|c| u32::from_le_bytes([c[0], c[1], c[2], c[3]])).collect::<Vec<u32>>();
        let bounds = floats(&b[40..64]);
        let vertices = floats(take(nv));
        let colours = has_colours.then(|| floats(take(nc)));
        let uvs = has_uvs.then(|| floats(take(nu)));
        let uv_tiles = has_tiles.then(|| words(take(nt)));
        let tile_rects = has_tiles.then(|| floats(take(nr)));
        Some(Self {
            vertices,
            colours,
            uvs,
            uv_tiles,
            tile_rects,
            indices: words(take(ng)),
            structure: words(take(ns)),
            edges: words(take(ne)),
            water: words(take(nw)),
            bounds: [bounds[0], bounds[1], bounds[2], bounds[3], bounds[4], bounds[5]],
        })
    }
}

/// `buildEdgeList`: every edge of a triangle list once, as line-list index pairs, in the order of
/// the sorted (low, high) keys - the web's order, so the lines blend alike.
pub fn edge_list(indices: &[u32]) -> Vec<u32> {
    let tris = indices.len() / 3;
    let mut keys = Vec::with_capacity(tris * 3);
    let mut add = |a: u32, b: u32| keys.push(((a.min(b) as u64) << 32) | a.max(b) as u64);
    for t in indices.chunks_exact(3) {
        add(t[0], t[1]);
        add(t[1], t[2]);
        add(t[2], t[0]);
    }
    keys.sort_unstable();
    keys.dedup();
    let mut out = Vec::with_capacity(keys.len() * 2);
    for k in keys {
        out.push((k >> 32) as u32);
        out.push(k as u32);
    }
    out
}

/// Whether a buffer of `bytes` may be made on `device` (its limit, and wgpu's 4-byte rule).
pub fn buffer_fits(device: &wgpu::Device, bytes: u64) -> bool {
    bytes <= device.limits().max_buffer_size
}

/// An index set of the level on the GPU.
pub struct Indices {
    pub buf: wgpu::Buffer,
    pub count: u32,
}

/// A model level's mesh, or a world tile's, on the GPU (`GpuMesh` in the web renderer).
pub struct GpuMesh {
    pub vertices: wgpu::Buffer,
    pub colours: wgpu::Buffer,
    pub uvs: wgpu::Buffer,
    pub tiles: wgpu::Buffer,
    /// The repeating images' rectangles in the atlas (`tileRects`), when any.
    pub tile_table: Option<wgpu::Buffer>,
    /// Its texture once sent: the level's atlas, a tile's image.
    pub texture: Option<(wgpu::Texture, wgpu::TextureView)>,
    pub ground: Option<Indices>,
    pub structure: Option<Indices>,
    pub edges: Option<Indices>,
    pub water: Option<Indices>,
    /// The ground's own edges (`ensureGroundWire`), built off the render thread once asked for.
    pub ground_wire: Option<Indices>,
    /// The ground's indices kept for that, until it is built.
    pub ground_cpu: Option<std::sync::Arc<Vec<u32>>>,
    pub wire_asked: bool,
    /// (min x, y, z, max x, y, z); infinite for the level.
    pub bounds: [f32; 6],
    pub bytes: u64,
    texture_bytes: u64,
    pub tile: bool,
}

impl GpuMesh {
    /// `uploadMesh`: None for an empty mesh or one past the device's buffer size.
    pub fn new(device: &wgpu::Device, l: &LevelMesh, label: &str, tile: bool) -> Option<Self> {
        use wgpu::util::DeviceExt;
        let n = l.vertices.len() / 6;
        if n == 0 || l.indices.is_empty() && l.structure.is_empty() && l.water.is_empty() {
            return None;
        }
        let biggest = [l.vertices.len(), n * 3, l.indices.len(), l.structure.len(), l.edges.len(), l.water.len()].into_iter().max().unwrap_or(0) as u64 * 4;
        if !buffer_fits(device, biggest) {
            crate::note(&format!("viewport: {label}: {biggest} bytes past the device's buffer size, not drawn"));
            return None;
        }
        let vb = |what: &str, data: &[u8], usage: wgpu::BufferUsages| device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some(&format!("{label} {what}")), contents: data, usage });
        // Colours, UVs and tile numbers always backed, so the pipeline's layout never changes:
        // white, -1 ("no texture here"), zeroes.
        let white;
        let colours: &[f32] = match &l.colours {
            Some(c) if c.len() >= n * 3 => &c[..n * 3],
            _ => {
                white = vec![1f32; n * 3];
                &white
            }
        };
        let none;
        let uvs: &[f32] = match &l.uvs {
            Some(u) if u.len() >= n * 2 => &u[..n * 2],
            _ => {
                none = vec![-1f32; n * 2];
                &none
            }
        };
        let vertices = vb("verts", bytemuck::cast_slice(&l.vertices[..n * 6]), wgpu::BufferUsages::VERTEX);
        let colours = vb("colours", bytemuck::cast_slice(colours), wgpu::BufferUsages::VERTEX);
        let uvs = vb("uvs", bytemuck::cast_slice(uvs), wgpu::BufferUsages::VERTEX);
        let (tiles, tile_table) = match (&l.uv_tiles, &l.tile_rects) {
            (Some(t), Some(r)) if t.len() >= n && !r.is_empty() => {
                let mut rects = r.clone();
                rects.resize(rects.len().div_ceil(4).max(1) * 4, 0.0);
                (vb("tiles", bytemuck::cast_slice(&t[..n]), wgpu::BufferUsages::VERTEX), Some(vb("tile table", bytemuck::cast_slice(&rects), wgpu::BufferUsages::STORAGE)))
            }
            _ => (
                device.create_buffer(&wgpu::BufferDescriptor { label: Some(&format!("{label} tiles (none)")), size: (n * 4).max(4) as u64, usage: wgpu::BufferUsages::VERTEX, mapped_at_creation: false }),
                None,
            ),
        };
        let set = |what: &str, idx: &[u32]| (!idx.is_empty()).then(|| Indices { buf: vb(what, bytemuck::cast_slice(idx), wgpu::BufferUsages::INDEX), count: idx.len() as u32 });
        let ground = set("ground indices", &l.indices);
        let structure = set("structure indices", &l.structure);
        let edges = set("structure edges", &l.edges);
        let water = set("water indices", &l.water);
        let bytes = vertices.size()
            + colours.size()
            + uvs.size()
            + tiles.size()
            + tile_table.as_ref().map_or(0, |b| b.size())
            + [&ground, &structure, &edges, &water].iter().filter_map(|s| s.as_ref()).map(|s| s.buf.size()).sum::<u64>();
        Some(Self {
            vertices,
            colours,
            uvs,
            tiles,
            tile_table,
            texture: None,
            ground,
            structure,
            edges,
            water,
            ground_wire: None,
            ground_cpu: (!l.indices.is_empty()).then(|| std::sync::Arc::new(l.indices.clone())),
            wire_asked: false,
            bounds: l.bounds,
            bytes,
            texture_bytes: 0,
            tile,
        })
    }

    /// Its texture from `mips` levels of RGBA, each half the one before (`LEVEL_IMAGE`). Refused
    /// past the device's texture size or when the bytes are short.
    pub fn set_image(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, width: u32, height: u32, mips: u32, pixels: &[u8]) -> anyhow::Result<()> {
        let limit = device.limits().max_texture_dimension_2d;
        anyhow::ensure!(width >= 1 && height >= 1 && width <= limit && height <= limit, "image {width} x {height} past the device's {limit}");
        let full = 32 - width.max(height).leading_zeros();
        let mips = mips.clamp(1, full);
        let tex = device.create_texture(&wgpu::TextureDescriptor {
            label: Some(if self.tile { "tile image" } else { "level atlas" }),
            size: wgpu::Extent3d { width, height, depth_or_array_layers: 1 },
            mip_level_count: mips,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            // rgba8unorm, not sRGB: the file's colours reach the frame as they are (`loadAtlas`).
            format: wgpu::TextureFormat::Rgba8Unorm,
            usage: wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::COPY_DST,
            view_formats: &[],
        });
        let (mut w, mut h, mut at) = (width, height, 0usize);
        for mip in 0..mips {
            let n = (w * h * 4) as usize;
            anyhow::ensure!(pixels.len() >= at + n, "image level {mip} short");
            queue.write_texture(
                wgpu::TexelCopyTextureInfo { texture: &tex, mip_level: mip, origin: Default::default(), aspect: Default::default() },
                &pixels[at..at + n],
                wgpu::TexelCopyBufferLayout { offset: 0, bytes_per_row: Some(w * 4), rows_per_image: Some(h) },
                wgpu::Extent3d { width: w, height: h, depth_or_array_layers: 1 },
            );
            at += n;
            w = (w / 2).max(1);
            h = (h / 2).max(1);
        }
        let view = tex.create_view(&Default::default());
        if let Some((_, old)) = self.texture.replace((tex, view)).map(|(t, _)| ((), t)) {
            self.bytes -= self.texture_bytes.min(self.bytes);
            old.destroy();
        }
        self.texture_bytes = at as u64;
        self.bytes += at as u64;
        Ok(())
    }

    /// The ground's edges, built (`edge_list`) off the render thread.
    pub fn set_ground_wire(&mut self, device: &wgpu::Device, edges: &[u32]) {
        use wgpu::util::DeviceExt;
        self.ground_cpu = None;
        if edges.is_empty() || !buffer_fits(device, edges.len() as u64 * 4) {
            return;
        }
        let buf = device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some("ground edges"), contents: bytemuck::cast_slice(edges), usage: wgpu::BufferUsages::INDEX });
        self.bytes += buf.size();
        self.ground_wire = Some(Indices { buf, count: edges.len() as u32 });
    }

    pub fn buffers(&self) -> LevelBuffers<'_> {
        LevelBuffers { vertices: &self.vertices, colours: &self.colours, uvs: &self.uvs, tiles: &self.tiles }
    }
}

pub struct Occlusion {
    /// The ground as lines (`meshWirePipeline`, the level's wireframe look).
    pub ground_lines: wgpu::RenderPipeline,
    /// An image level's quad (`mapPipeline`).
    pub map: wgpu::RenderPipeline,
    /// The atlas's sampler: anisotropic, the ground seen at grazing angles (`atlasSampler`).
    pub atlas_sampler: wgpu::Sampler,
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
pub fn mesh_pipe(device: &wgpu::Device, m: &wgpu::ShaderModule, label: &str, depth_write: bool, colour_write: bool) -> wgpu::RenderPipeline {
    mesh_pipe_with(device, m, label, depth_write, colour_write, wgpu::PrimitiveTopology::TriangleList)
}

fn mesh_pipe_with(device: &wgpu::Device, m: &wgpu::ShaderModule, label: &str, depth_write: bool, colour_write: bool, topology: wgpu::PrimitiveTopology) -> wgpu::RenderPipeline {
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
        primitive: wgpu::PrimitiveState { topology, ..Default::default() },
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
        let m_map = module(device, "map", W_MAP);
        let map = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("map"),
            layout: None,
            vertex: wgpu::VertexState { module: &m_map, entry_point: Some("vsMap"), buffers: &[], compilation_options: Default::default() },
            fragment: Some(wgpu::FragmentState {
                module: &m_map,
                entry_point: Some("fsMap"),
                targets: &[Some(wgpu::ColorTargetState { format: SCENE_FORMAT, blend: Some(alpha_blend()), write_mask: wgpu::ColorWrites::ALL })],
                compilation_options: Default::default(),
            }),
            primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
            depth_stencil: Some(depth_state(true)),
            multisample: Default::default(),
            multiview_mask: None,
            cache: None,
        });
        let atlas_sampler = device.create_sampler(&wgpu::SamplerDescriptor {
            label: Some("atlas"),
            mag_filter: wgpu::FilterMode::Linear,
            min_filter: wgpu::FilterMode::Linear,
            mipmap_filter: wgpu::MipmapFilterMode::Linear,
            address_mode_u: wgpu::AddressMode::ClampToEdge,
            address_mode_v: wgpu::AddressMode::ClampToEdge,
            anisotropy_clamp: 8,
            ..Default::default()
        });
        Self {
            ground_lines: mesh_pipe_with(device, &m_mesh, "ground lines", true, true, wgpu::PrimitiveTopology::LineList),
            map,
            atlas_sampler,
            faces: mesh_pipe(device, &m_mesh, "structure faces", false, true),
            seal: mesh_pipe(device, &m_mesh, "structure depth", true, false),
            wire,
            peel,
            layers: Vec::new(),
            layers_size: (0, 0),
        }
    }

    /// `activeLayers`: how many peeled layers the heat reads this frame.
    pub fn active_layers(&self, occlusion: f32, any_structure: bool) -> u32 {
        if occlusion > 0.0 && any_structure {
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
        for w in [6u32, 3, 0, 3, 2, 0, 0, 0, 0, 0] {
            b.extend_from_slice(&w.to_le_bytes());
        }
        for v in [0f32; 6] {
            b.extend_from_slice(&v.to_le_bytes());
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

    #[test]
    fn edges_once_each_sorted() {
        // Two triangles sharing the edge 0-2: five edges, by (low, high).
        assert_eq!(edge_list(&[0, 1, 2, 0, 2, 3]), vec![0, 1, 0, 2, 0, 3, 1, 2, 2, 3]);
        assert!(edge_list(&[]).is_empty());
    }
}
