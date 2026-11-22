//! The overlays the WebGPU renderer draws over its scene, with the same WGSL (`wgsl/zone.wgsl`,
//! `spawn.wgsl`, `volume_contour.wgsl`): the capture zones' discs (src/render/webgpu/zones.ts) on
//! the ground, under the units or over the picture; the layout's spawn marks
//! (webgpu/spawnMarks.ts) and the volumes' lines where they cut the level
//! (webgpu/volumeContours.ts), both over the finished picture. The zones' vertices and the spawn
//! instances are kept, uploaded only when the page sends a new array; the uniforms of each draw
//! go into the frame's uniform ring like every other draw's.

use wgpu::util::DeviceExt;

use crate::generated::*;
use crate::packet::{self, Packet, Spawns, Zones};
use crate::renderer::{DEPTH_FORMAT, SCENE_FORMAT};

const W_ZONE: &str = include_str!("../wgsl/zone.wgsl");
const W_SPAWN: &str = include_str!("../wgsl/spawn.wgsl");
const W_CONTOUR: &str = include_str!("../wgsl/volume_contour.wgsl");

/// Where a zone draw goes (`ZoneSlot`): on the ground, through it under the units, or over the picture.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum ZoneSlot {
    Ground,
    Under,
    Top,
}

fn blend(premultiplied: bool) -> wgpu::BlendState {
    let src = if premultiplied { wgpu::BlendFactor::One } else { wgpu::BlendFactor::SrcAlpha };
    wgpu::BlendState {
        color: wgpu::BlendComponent { src_factor: src, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
        alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::One, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
    }
}

fn uniform_entry(binding: u32) -> wgpu::BindGroupLayoutEntry {
    wgpu::BindGroupLayoutEntry {
        binding,
        visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
        ty: wgpu::BindingType::Buffer { ty: wgpu::BufferBindingType::Uniform, has_dynamic_offset: false, min_binding_size: None },
        count: None,
    }
}

pub struct Overlays {
    zone_layout: wgpu::BindGroupLayout,
    zone_ground: wgpu::RenderPipeline,
    zone_under: wgpu::RenderPipeline,
    zone_top: wgpu::RenderPipeline,
    zone_buf: Option<wgpu::Buffer>,
    spawn_layout: wgpu::BindGroupLayout,
    spawn_marks: wgpu::RenderPipeline,
    spawn_lines: wgpu::RenderPipeline,
    spawn_buf: Option<wgpu::Buffer>,
    contour_layout: wgpu::BindGroupLayout,
    contour: wgpu::RenderPipeline,
}

/// The bind groups one packet's overlays draw with.
#[derive(Default)]
pub struct OverlayGroups {
    /// The zones on the ground (xray 0), and under the units or over the picture (the frame's xray).
    pub zone_ground: Option<wgpu::BindGroup>,
    pub zone_over: Option<wgpu::BindGroup>,
    pub spawn: Option<wgpu::BindGroup>,
    pub contour: Option<wgpu::BindGroup>,
}

impl Overlays {
    pub fn new(device: &wgpu::Device, out_format: wgpu::TextureFormat) -> Self {
        let module = |label: &str, src: &str| device.create_shader_module(wgpu::ShaderModuleDescriptor { label: Some(label), source: wgpu::ShaderSource::Wgsl(src.into()) });
        let layout = |label: &str, entries: &[wgpu::BindGroupLayoutEntry]| device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor { label: Some(label), entries });
        let pipeline_layout = |l: &wgpu::BindGroupLayout| device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor { label: None, bind_group_layouts: &[Some(l)], immediate_size: 0 });
        #[allow(clippy::too_many_arguments)]
        let make = |label: &str,
                    pl: &wgpu::PipelineLayout,
                    m: &wgpu::ShaderModule,
                    vs: &str,
                    fs: &str,
                    buffers: &[Option<wgpu::VertexBufferLayout<'_>>],
                    format: wgpu::TextureFormat,
                    premultiplied: bool,
                    depth: Option<wgpu::CompareFunction>| {
            device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
                label: Some(label),
                layout: Some(pl),
                vertex: wgpu::VertexState { module: m, entry_point: Some(vs), buffers, compilation_options: Default::default() },
                fragment: Some(wgpu::FragmentState {
                    module: m,
                    entry_point: Some(fs),
                    targets: &[Some(wgpu::ColorTargetState { format, blend: Some(blend(premultiplied)), write_mask: wgpu::ColorWrites::ALL })],
                    compilation_options: Default::default(),
                }),
                primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
                // In the scene pass the depth attachment is there either way: tested on the ground, not under the units.
                depth_stencil: depth.map(|c| wgpu::DepthStencilState { format: DEPTH_FORMAT, depth_write_enabled: Some(false), depth_compare: Some(c), stencil: Default::default(), bias: Default::default() }),
                multisample: Default::default(),
                multiview_mask: None,
                cache: None,
            })
        };

        let zone_layout = layout("zones", &[uniform_entry(0)]);
        let zl = pipeline_layout(&zone_layout);
        let zm = module("zones", W_ZONE);
        const ZONE_ATTRS: [wgpu::VertexAttribute; 3] = wgpu::vertex_attr_array![0 => Float32x3, 1 => Float32x3, 2 => Float32x4];
        let zb = [Some(wgpu::VertexBufferLayout { array_stride: ZONE_VERTEX_FLOATS as u64 * 4, step_mode: wgpu::VertexStepMode::Vertex, attributes: &ZONE_ATTRS })];
        // Reverse-Z: nearer is larger, an equal depth passes (`GPU_DEPTH_TEST`).
        let zone_ground = make("zones on the ground", &zl, &zm, "vsZone", "fsZone", &zb, SCENE_FORMAT, false, Some(wgpu::CompareFunction::GreaterEqual));
        let zone_under = make("zones under the units", &zl, &zm, "vsZone", "fsZone", &zb, SCENE_FORMAT, false, Some(wgpu::CompareFunction::Always));
        let zone_top = make("zones over the picture", &zl, &zm, "vsZone", "fsZone", &zb, out_format, false, None);

        let spawn_layout = layout("spawn marks", &[uniform_entry(0)]);
        let sl = pipeline_layout(&spawn_layout);
        let sm = module("spawn marks", W_SPAWN);
        const SPAWN_ATTRS: [wgpu::VertexAttribute; 3] = wgpu::vertex_attr_array![0 => Float32x4, 1 => Float32x4, 2 => Float32x4];
        let sb = [Some(wgpu::VertexBufferLayout { array_stride: SPAWN_INSTANCE_FLOATS as u64 * 4, step_mode: wgpu::VertexStepMode::Instance, attributes: &SPAWN_ATTRS })];
        let spawn_marks = make("spawn marks", &sl, &sm, "vsMark", "fsMark", &sb, out_format, true, None);
        let spawn_lines = make("spawn lines", &sl, &sm, "vsLine", "fsLine", &sb, out_format, true, None);

        let contour_layout = layout(
            "volume contours",
            &[
                uniform_entry(0),
                uniform_entry(1),
                wgpu::BindGroupLayoutEntry {
                    binding: 2,
                    visibility: wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Texture { sample_type: wgpu::TextureSampleType::Depth, view_dimension: wgpu::TextureViewDimension::D2, multisampled: false },
                    count: None,
                },
            ],
        );
        let cl = pipeline_layout(&contour_layout);
        let cm = module("volume contours", W_CONTOUR);
        let contour = make("volume contours", &cl, &cm, "vsContour", "fsContour", &[], out_format, false, None);

        Self { zone_layout, zone_ground, zone_under, zone_top, zone_buf: None, spawn_layout, spawn_marks, spawn_lines, spawn_buf: None, contour_layout, contour }
    }

    /// A packet's kept arrays, when new.
    pub fn take(&mut self, device: &wgpu::Device, o: &packet::Overlays) {
        let mk = |label: &str, v: &[f32]| device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some(label), contents: bytemuck::cast_slice(v), usage: wgpu::BufferUsages::VERTEX });
        if let Some(v) = o.zones.as_ref().and_then(|z| z.verts.as_ref()).filter(|v| !v.is_empty()) {
            self.zone_buf = Some(mk("zones", v));
        }
        if let Some(v) = o.spawns.as_ref().and_then(|s| s.data.as_ref()).filter(|v| !v.is_empty()) {
            self.spawn_buf = Some(mk("spawn marks", v));
        }
    }

    /// The zones' uniforms (`GpuZones.prepare`): the view, pixels a unit at one unit's depth, the
    /// smallest radius, the xray (0 on the ground), the zones' state.
    pub fn zone_uniform(p: &Packet, z: &Zones, slot: ZoneSlot) -> Vec<f32> {
        let f = p.frame.as_ref().unwrap();
        let mut u = vec![0f32; ZONE_UNIFORM_BYTES as usize / 4];
        u[..16].copy_from_slice(&f[F_VIEW_PROJ..F_VIEW_PROJ + 16]);
        u[16] = p.f(F_PROJ5) * p.f(F_HEIGHT) / 2.0;
        u[17] = z.min_px;
        u[18] = if slot == ZoneSlot::Ground { 0.0 } else { z.xray };
        let n = z.state.len().min(u.len() - 20);
        u[20..20 + n].copy_from_slice(&z.state[..n]);
        u
    }

    /// The spawn marks' uniforms (`spawnUniforms`): the view, the canvas, the pixel ratio, the camera.
    pub fn spawn_uniform(p: &Packet, s: &Spawns) -> Vec<f32> {
        let f = p.frame.as_ref().unwrap();
        let mut u = vec![0f32; SPAWN_UNIFORM_FLOATS as usize];
        u[..16].copy_from_slice(&f[F_VIEW_PROJ..F_VIEW_PROJ + 16]);
        u[16] = p.f(F_WIDTH);
        u[17] = p.f(F_HEIGHT);
        u[18] = s.dpr;
        u[20..23].copy_from_slice(&f[F_CAMERA_POS..F_CAMERA_POS + 3]);
        u
    }

    /// The contours' uniforms (`GpuVolumeContours.prepare`): colours, the inverse view, the canvas,
    /// the cleared depth (reverse-Z: 0), and where the canvas starts in the target.
    pub fn contour_uniform(c: &packet::Contours, width: f32, height: f32, origin: (f32, f32)) -> Vec<f32> {
        let mut u = vec![0f32; CONTOUR_UNIFORM_BYTES as usize / 4];
        let n = c.colors.len().min(MAX_GPU_VOLUMES as usize * 4);
        u[..n].copy_from_slice(&c.colors[..n]);
        let at = MAX_GPU_VOLUMES as usize * 4;
        u[at..at + 16].copy_from_slice(&c.inv[..16]);
        u[at + 16] = width;
        u[at + 17] = height;
        u[at + 20] = origin.0;
        u[at + 21] = origin.1;
        u
    }

    fn group(device: &wgpu::Device, layout: &wgpu::BindGroupLayout, entries: &[wgpu::BindGroupEntry<'_>]) -> wgpu::BindGroup {
        device.create_bind_group(&wgpu::BindGroupDescriptor { label: Some("overlays"), layout, entries })
    }

    fn uniform<'a>(binding: u32, buf: &'a wgpu::Buffer, offset: u64, size: u64) -> wgpu::BindGroupEntry<'a> {
        wgpu::BindGroupEntry { binding, resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding { buffer: buf, offset, size: wgpu::BufferSize::new(size) }) }
    }

    pub fn zone_group(&self, device: &wgpu::Device, buf: &wgpu::Buffer, offset: u64) -> wgpu::BindGroup {
        Self::group(device, &self.zone_layout, &[Self::uniform(0, buf, offset, ZONE_UNIFORM_BYTES as u64)])
    }

    pub fn spawn_group(&self, device: &wgpu::Device, buf: &wgpu::Buffer, offset: u64) -> wgpu::BindGroup {
        Self::group(device, &self.spawn_layout, &[Self::uniform(0, buf, offset, SPAWN_UNIFORM_FLOATS as u64 * 4)])
    }

    pub fn contour_group(&self, device: &wgpu::Device, buf: &wgpu::Buffer, volumes: u64, uniforms: u64, depth: &wgpu::TextureView) -> wgpu::BindGroup {
        Self::group(
            device,
            &self.contour_layout,
            &[
                Self::uniform(0, buf, volumes, VOLUME_BLOCK_FLOATS as u64 * 4),
                Self::uniform(1, buf, uniforms, CONTOUR_UNIFORM_BYTES as u64),
                wgpu::BindGroupEntry { binding: 2, resource: wgpu::BindingResource::TextureView(depth) },
            ],
        )
    }

    pub fn draw_zones(&self, pass: &mut wgpu::RenderPass<'_>, p: &Packet, slot: ZoneSlot, group: Option<&wgpu::BindGroup>) {
        let (Some(z), Some(buf), Some(g)) = (p.overlays.as_ref().and_then(|o| o.zones.as_ref()), &self.zone_buf, group) else { return };
        if z.count == 0 {
            return;
        }
        pass.set_pipeline(match slot {
            ZoneSlot::Ground => &self.zone_ground,
            ZoneSlot::Under => &self.zone_under,
            ZoneSlot::Top => &self.zone_top,
        });
        pass.set_bind_group(0, g, &[]);
        pass.set_vertex_buffer(0, buf.slice(..));
        pass.draw(0..z.count, 0..1);
    }

    /// The lines to their owners first (where asked), then the marks (`GpuSpawnMarks.draw`).
    pub fn draw_spawns(&self, pass: &mut wgpu::RenderPass<'_>, p: &Packet, group: Option<&wgpu::BindGroup>) {
        let (Some(s), Some(buf), Some(g)) = (p.overlays.as_ref().and_then(|o| o.spawns.as_ref()), &self.spawn_buf, group) else { return };
        pass.set_bind_group(0, g, &[]);
        pass.set_vertex_buffer(0, buf.slice(..));
        if s.lines {
            pass.set_pipeline(&self.spawn_lines);
            pass.draw(0..6, 0..s.count);
        }
        pass.set_pipeline(&self.spawn_marks);
        pass.draw(0..6, 0..s.count);
    }

    pub fn draw_contours(&self, pass: &mut wgpu::RenderPass<'_>, group: Option<&wgpu::BindGroup>) {
        let Some(g) = group else { return };
        pass.set_pipeline(&self.contour);
        pass.set_bind_group(0, g, &[]);
        pass.draw(0..3, 0..1);
    }
}
