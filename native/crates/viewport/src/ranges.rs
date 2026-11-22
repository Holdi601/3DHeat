//! The engagement ranges as the WebGPU renderer draws them (src/render/webgpu/ranges.ts), with the
//! same WGSL (`wgsl/range_shell.wgsl`, `range_ground.wgsl`, `range_capture.wgsl`): the units' views
//! taken from the level into a depth array before the scene pass (the faces the page's
//! `ViewshedPlan` picks, a few a frame), then in the scene the ground they see shaded and the
//! shells, cut by them. The page packs every uniform; the shell mesh comes once.

use crate::generated::*;
use crate::packet::{Packet, Ranges as RangeDraw};
use crate::renderer::{DEPTH_FORMAT, SCENE_FORMAT};

const W_SHELL: &str = include_str!("../wgsl/range_shell.wgsl");
const W_GROUND: &str = include_str!("../wgsl/range_ground.wgsl");
const W_CAPTURE: &str = include_str!("../wgsl/range_capture.wgsl");

const VIEW_FORMAT: wgpu::TextureFormat = wgpu::TextureFormat::Depth32Float;

pub struct Ranges {
    view_layout: wgpu::BindGroupLayout,
    capture_layout: wgpu::BindGroupLayout,
    shell: wgpu::RenderPipeline,
    ground: wgpu::RenderPipeline,
    capture: wgpu::RenderPipeline,
    /// The shell mesh (`shellMesh`): the sphere's vertices, then the cone's.
    mesh: Option<(wgpu::Buffer, u32, u32)>,
    instances: Option<wgpu::Buffer>,
    layers: Vec<wgpu::TextureView>,
    array: wgpu::TextureView,
}

/// What one packet's ranges draw with: the shells' and the ground's bind groups.
#[derive(Default)]
pub struct RangeGroups {
    pub shell: Option<wgpu::BindGroup>,
    pub ground: Option<wgpu::BindGroup>,
}

impl Ranges {
    pub fn new(device: &wgpu::Device) -> Self {
        let uniform = wgpu::BindGroupLayoutEntry {
            binding: 0,
            visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
            ty: wgpu::BindingType::Buffer { ty: wgpu::BufferBindingType::Uniform, has_dynamic_offset: false, min_binding_size: None },
            count: None,
        };
        let view_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            label: Some("range views"),
            entries: &[
                uniform,
                wgpu::BindGroupLayoutEntry {
                    binding: 1,
                    visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Texture { sample_type: wgpu::TextureSampleType::Depth, view_dimension: wgpu::TextureViewDimension::D2Array, multisampled: false },
                    count: None,
                },
            ],
        });
        let capture_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor { label: Some("range capture"), entries: &[uniform] });
        let pl = |l: &wgpu::BindGroupLayout| device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor { label: None, bind_group_layouts: &[Some(l)], immediate_size: 0 });
        let module = |label: &str, src: &str| device.create_shader_module(wgpu::ShaderModuleDescriptor { label: Some(label), source: wgpu::ShaderSource::Wgsl(src.into()) });
        let (m_shell, m_ground, m_capture) = (module("range shells", W_SHELL), module("range ground", W_GROUND), module("range views", W_CAPTURE));
        let (view_pl, capture_pl) = (pl(&view_layout), pl(&capture_layout));
        let primitive = wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, cull_mode: None, ..Default::default() };
        // Reverse-Z: nearer is larger, an equal depth passes (`GPU_DEPTH_TEST`).
        let scene_depth = |bias: wgpu::DepthBiasState| {
            Some(wgpu::DepthStencilState { format: DEPTH_FORMAT, depth_write_enabled: Some(false), depth_compare: Some(wgpu::CompareFunction::GreaterEqual), stencil: Default::default(), bias })
        };

        const MESH_ATTRS: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![0 => Float32x4];
        const INST_ATTRS: [wgpu::VertexAttribute; 6] = wgpu::vertex_attr_array![1 => Float32x4, 2 => Float32x4, 3 => Float32x4, 4 => Float32x4, 5 => Float32x4, 6 => Float32x4];
        let shell = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("range shells"),
            layout: Some(&view_pl),
            vertex: wgpu::VertexState {
                module: &m_shell,
                entry_point: Some("vsShell"),
                buffers: &[
                    Some(wgpu::VertexBufferLayout { array_stride: 16, step_mode: wgpu::VertexStepMode::Vertex, attributes: &MESH_ATTRS }),
                    Some(wgpu::VertexBufferLayout { array_stride: SHELL_FLOATS as u64 * 4, step_mode: wgpu::VertexStepMode::Instance, attributes: &INST_ATTRS }),
                ],
                compilation_options: Default::default(),
            },
            fragment: Some(wgpu::FragmentState {
                module: &m_shell,
                entry_point: Some("fsShell"),
                targets: &[Some(wgpu::ColorTargetState {
                    format: SCENE_FORMAT,
                    // Added light, the alpha left alone.
                    blend: Some(wgpu::BlendState {
                        color: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::SrcAlpha, dst_factor: wgpu::BlendFactor::One, operation: wgpu::BlendOperation::Add },
                        alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::Zero, dst_factor: wgpu::BlendFactor::One, operation: wgpu::BlendOperation::Add },
                    }),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
                compilation_options: Default::default(),
            }),
            primitive,
            depth_stencil: scene_depth(Default::default()),
            multisample: Default::default(),
            multiview_mask: None,
            cache: None,
        });
        const POS_ATTRS: [wgpu::VertexAttribute; 1] = wgpu::vertex_attr_array![0 => Float32x3];
        // The level's vertices: position then normal.
        let pos = [Some(wgpu::VertexBufferLayout { array_stride: 24, step_mode: wgpu::VertexStepMode::Vertex, attributes: &POS_ATTRS })];
        let ground = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("range ground"),
            layout: Some(&view_pl),
            vertex: wgpu::VertexState { module: &m_ground, entry_point: Some("vsGround"), buffers: &pos, compilation_options: Default::default() },
            fragment: Some(wgpu::FragmentState {
                module: &m_ground,
                entry_point: Some("fsGround"),
                targets: &[Some(wgpu::ColorTargetState {
                    format: SCENE_FORMAT,
                    blend: Some(wgpu::BlendState {
                        color: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::SrcAlpha, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
                        alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::One, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
                    }),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
                compilation_options: Default::default(),
            }),
            primitive,
            depth_stencil: scene_depth(wgpu::DepthBiasState { constant: 4, slope_scale: 1.0, clamp: 0.0 }),
            multisample: Default::default(),
            multiview_mask: None,
            cache: None,
        });
        let capture = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("range views"),
            layout: Some(&capture_pl),
            vertex: wgpu::VertexState { module: &m_capture, entry_point: Some("vsCapture"), buffers: &pos, compilation_options: Default::default() },
            fragment: Some(wgpu::FragmentState { module: &m_capture, entry_point: Some("fsCapture"), targets: &[], compilation_options: Default::default() }),
            primitive,
            depth_stencil: Some(wgpu::DepthStencilState { format: VIEW_FORMAT, depth_write_enabled: Some(true), depth_compare: Some(wgpu::CompareFunction::Less), stencil: Default::default(), bias: Default::default() }),
            multisample: Default::default(),
            multiview_mask: None,
            cache: None,
        });
        let depth = device.create_texture(&wgpu::TextureDescriptor {
            label: Some("range views"),
            size: wgpu::Extent3d { width: VIEW_FACE, height: VIEW_FACE, depth_or_array_layers: VIEW_LAYERS },
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: VIEW_FORMAT,
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::TEXTURE_BINDING,
            view_formats: &[],
        });
        let layers = (0..VIEW_LAYERS)
            .map(|i| {
                depth.create_view(&wgpu::TextureViewDescriptor { dimension: Some(wgpu::TextureViewDimension::D2), base_array_layer: i, array_layer_count: Some(1), ..Default::default() })
            })
            .collect();
        let array = depth.create_view(&wgpu::TextureViewDescriptor { dimension: Some(wgpu::TextureViewDimension::D2Array), ..Default::default() });
        Self { view_layout, capture_layout, shell, ground, capture, mesh: None, instances: None, layers, array }
    }

    /// A packet's mesh (when new) and this frame's shells. With several packets in one draw the last
    /// one's shells are drawn for all - only its scene is shown.
    pub fn take(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, r: &RangeDraw) {
        if let Some(m) = r.mesh.as_ref().filter(|m| !m.is_empty()) {
            let buf = device.create_buffer(&wgpu::BufferDescriptor { label: Some("range shell mesh"), size: (m.len() * 4) as u64, usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST, mapped_at_creation: false });
            queue.write_buffer(&buf, 0, bytemuck::cast_slice(m));
            self.mesh = Some((buf, r.sphere, r.cone));
        }
        if !r.instances.is_empty() {
            let bytes = (r.instances.len() * 4) as u64;
            if self.instances.as_ref().is_none_or(|b| b.size() < bytes) {
                let size = bytes.max(64 * SHELL_FLOATS as u64 * 4) * 2;
                self.instances = Some(device.create_buffer(&wgpu::BufferDescriptor { label: Some("range shells"), size, usage: wgpu::BufferUsages::VERTEX | wgpu::BufferUsages::COPY_DST, mapped_at_creation: false }));
            }
            queue.write_buffer(self.instances.as_ref().unwrap(), 0, bytemuck::cast_slice(&r.instances));
        }
    }

    pub fn view_group(&self, device: &wgpu::Device, buf: &wgpu::Buffer, offset: u64, size: u64) -> wgpu::BindGroup {
        device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("range views"),
            layout: &self.view_layout,
            entries: &[
                wgpu::BindGroupEntry { binding: 0, resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding { buffer: buf, offset, size: wgpu::BufferSize::new(size) }) },
                wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::TextureView(&self.array) },
            ],
        })
    }

    /// The faces this packet takes (`takeViews`), each a pass of its own before the scene's, the
    /// level's ground drawn into it (`uniforms`: each face's capture uniforms' offset in `buf`).
    #[allow(clippy::too_many_arguments)]
    pub fn take_views(&self, device: &wgpu::Device, encoder: &mut wgpu::CommandEncoder, r: &RangeDraw, buf: &wgpu::Buffer, uniforms: &[u64], vertices: &wgpu::Buffer, indices: &wgpu::Buffer, count: u32) {
        for ((layer, _), off) in r.captures.iter().zip(uniforms) {
            let Some(view) = self.layers.get(*layer as usize) else { continue };
            let group = device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: Some("range view"),
                layout: &self.capture_layout,
                entries: &[wgpu::BindGroupEntry { binding: 0, resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding { buffer: buf, offset: *off, size: wgpu::BufferSize::new(CAPTURE_UNIFORM_BYTES as u64) }) }],
            });
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("range view"),
                color_attachments: &[],
                depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                    view,
                    depth_ops: Some(wgpu::Operations { load: wgpu::LoadOp::Clear(1.0), store: wgpu::StoreOp::Store }),
                    stencil_ops: None,
                }),
                timestamp_writes: None,
                occlusion_query_set: None,
                multiview_mask: None,
            });
            pass.set_pipeline(&self.capture);
            pass.set_bind_group(0, &group, &[]);
            pass.set_vertex_buffer(0, vertices.slice(..));
            pass.set_index_buffer(indices.slice(..), wgpu::IndexFormat::Uint32);
            pass.draw_indexed(0..count, 0, 0..1);
        }
    }

    /// The ground each unit sees within reach (`drawGround`): the level drawn again, shaded.
    pub fn draw_ground(&self, pass: &mut wgpu::RenderPass<'_>, group: Option<&wgpu::BindGroup>, vertices: &wgpu::Buffer, indices: &wgpu::Buffer, count: u32) {
        let Some(g) = group else { return };
        pass.set_pipeline(&self.ground);
        pass.set_bind_group(0, g, &[]);
        pass.set_vertex_buffer(0, vertices.slice(..));
        pass.set_index_buffer(indices.slice(..), wgpu::IndexFormat::Uint32);
        pass.draw_indexed(0..count, 0, 0..1);
    }

    /// The shells over everything solid (`drawShells`): the spheres, then the cones from `cone_start`.
    pub fn draw_shells(&self, pass: &mut wgpu::RenderPass<'_>, p: &Packet, group: Option<&wgpu::BindGroup>) {
        let (Some(r), Some(g), Some((mesh, sphere, cone)), Some(inst)) = (p.ranges.as_ref(), group, &self.mesh, &self.instances) else { return };
        if r.count == 0 {
            return;
        }
        pass.set_pipeline(&self.shell);
        pass.set_bind_group(0, g, &[]);
        pass.set_vertex_buffer(0, mesh.slice(..));
        pass.set_vertex_buffer(1, inst.slice(..));
        pass.draw(0..*sphere, 0..r.count);
        if r.cone_start < r.count {
            pass.draw(*sphere..*sphere + *cone, r.cone_start..r.count);
        }
    }
}
