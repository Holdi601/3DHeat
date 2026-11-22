//! The heat modes besides plain points (Stage 5), as the web engine draws them:
//!
//! - line heat: each row's segment from its route's previous sample, splatted by
//!   `heat_line.wgsl` (the splat with `lineHeatWgsl`'s changes) from the segment
//!   starts the page packs per chunk (`packLineStarts`, binding 14);
//! - directional wedges: each row's bearing a byte (binding 16, `chunkDirs`), the
//!   wedge's shape in the heat uniform's lanes 96-100;
//! - the direction field over the heat: the same sprites into a small target of
//!   its own (`GpuDirField`), drawn as arrows and streamlines in the composite
//!   (`dir_arrow.wgsl`, `dir_stream.wgsl`);
//! - the rate map is the splat's and the composite's own (`FLAG_RATE`, composite
//!   lanes 15-19): nothing here.
//!
//! The per-row data comes from the page (`viewport_rows`): the page holds the
//! rows (a load the page built, or a core load the page keeps whole).

use std::collections::HashMap;

use crate::generated::*;
use crate::renderer::{module, render_pipe, tex2d, ADD};

/// `viewport_rows` kinds.
pub const ROW_DIRS: u32 = 0;
pub const ROW_LINES: u32 = 1;

/// One chunk's per-row data as the page sent it.
pub struct RowData {
    pub kind: u32,
    /// The page's dataset count it belongs to (`datasetGen`).
    pub gen: u32,
    /// The chunk, or `u32::MAX` to drop every chunk's of this kind.
    pub chunk: u32,
    /// The box line heat's segment starts are quantised to: min, then size.
    pub line_box: [f32; 6],
    /// The chunk's whole size in bytes, and where these bytes go in it: a chunk comes in slices
    /// (a whole chunk's segment starts in one message took WebView2's browser process down).
    pub total: u32,
    pub offset: u32,
    pub bytes: Vec<u8>,
}

impl RowData {
    /// A 12-word header (kind, gen, chunk, byte count, the chunk's total, the offset, the line
    /// box), then the bytes.
    pub fn parse(b: &[u8]) -> anyhow::Result<Self> {
        anyhow::ensure!(b.len() >= HEADER, "rows header");
        let w = |k: usize| u32::from_le_bytes([b[k * 4], b[k * 4 + 1], b[k * 4 + 2], b[k * 4 + 3]]);
        let n = w(3) as usize;
        anyhow::ensure!(b.len() >= HEADER + n, "rows bytes");
        anyhow::ensure!(w(5) as u64 + n as u64 <= w(4) as u64, "rows slice past its chunk");
        let mut line_box = [0f32; 6];
        for (k, v) in line_box.iter_mut().enumerate() {
            *v = f32::from_bits(w(6 + k));
        }
        Ok(Self { kind: w(0), gen: w(1), chunk: w(2), line_box, total: w(4), offset: w(5), bytes: b[HEADER..HEADER + n].to_vec() })
    }
}

const HEADER: usize = 48;

impl RowData {
    /// One whole chunk's data in one slice (tests).
    pub fn whole(kind: u32, chunk: u32, line_box: [f32; 6], bytes: Vec<u8>) -> Self {
        Self { kind, gen: 0, chunk, line_box, total: bytes.len() as u32, offset: 0, bytes }
    }
}

/// The direction field's targets (`GpuDirField.ensure`).
pub struct Field {
    pub view: wgpu::TextureView,
    pub scratch_view: wgpu::TextureView,
    _tex: wgpu::Texture,
    _scratch: wgpu::Texture,
    pub width: u32,
    pub height: u32,
    /// Just made: the next pass writes straight in.
    pub fresh: bool,
}

pub const FIELD_FORMAT: wgpu::TextureFormat = wgpu::TextureFormat::Rgba16Float;
const FIELD_UNIFORM_BYTES: u64 = 48;

/// `fieldCells`.
pub fn field_cells(hw: u32, hh: u32, cell_texels: f32) -> (u32, u32) {
    let c = cell_texels.max(2.0);
    let n = |v: u32| ((v as f32 / c).round() as u32).clamp(1, 1024);
    (n(hw), n(hh))
}

pub struct HeatModes {
    /// Per chunk index: bearings (a byte a row), segment starts (three words a row).
    pub dirs: HashMap<usize, wgpu::Buffer>,
    pub lines: HashMap<usize, wgpu::Buffer>,
    /// Chunks still coming in slices, by kind and chunk.
    arriving: HashMap<(u32, usize), wgpu::Buffer>,
    pub line_box: [f32; 6],
    pub bytes: u64,
    /// `viewport_rows` messages taken, for the page's count of those it sent (`rowsTaken`).
    pub taken: u64,
    m_line: wgpu::ShaderModule,
    line_pipes: HashMap<wgpu::TextureFormat, wgpu::RenderPipeline>,
    pub field: Option<Field>,
    arrow: wgpu::RenderPipeline,
    stream: wgpu::RenderPipeline,
    /// Outline, arrow, streams: one small uniform buffer each (`GpuDirField.ubufs`).
    ubufs: Vec<wgpu::Buffer>,
}

const W_HEAT_LINE: &str = include_str!("../wgsl/heat_line.wgsl");
const W_DIR_ARROW: &str = include_str!("../wgsl/dir_arrow.wgsl");
const W_DIR_STREAM: &str = include_str!("../wgsl/dir_stream.wgsl");

impl HeatModes {
    pub fn new(device: &wgpu::Device, out_format: wgpu::TextureFormat) -> Self {
        let alpha = wgpu::BlendState {
            color: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::SrcAlpha, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
            alpha: wgpu::BlendComponent { src_factor: wgpu::BlendFactor::One, dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha, operation: wgpu::BlendOperation::Add },
        };
        let m_arrow = module(device, "direction arrows", W_DIR_ARROW);
        let m_stream = module(device, "direction streams", W_DIR_STREAM);
        let ubufs = (0..3)
            .map(|_| {
                device.create_buffer(&wgpu::BufferDescriptor {
                    label: Some("direction field"),
                    size: FIELD_UNIFORM_BYTES,
                    usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
                    mapped_at_creation: false,
                })
            })
            .collect();
        Self {
            dirs: HashMap::new(),
            lines: HashMap::new(),
            arriving: HashMap::new(),
            line_box: [0.0, 0.0, 0.0, 1.0, 1.0, 1.0],
            bytes: 0,
            taken: 0,
            m_line: module(device, "line heat", W_HEAT_LINE),
            line_pipes: HashMap::new(),
            field: None,
            arrow: render_pipe(device, &m_arrow, "vsArrow", "fsArrow", out_format, Some(alpha), &[], None),
            stream: render_pipe(device, &m_stream, "vsStream", "fsStream", out_format, Some(alpha), &[], None),
            ubufs,
        }
    }

    /// A new dataset: the old rows' data goes.
    pub fn clear(&mut self) {
        self.dirs.clear();
        self.lines.clear();
        self.arriving.clear();
        self.bytes = 0;
    }

    /// Takes one chunk's data (`viewport_rows`), or drops every chunk's of its kind.
    /// Takes one slice of a chunk's data (`viewport_rows`), or drops every chunk's of its kind. A
    /// chunk is drawn with its data once the last slice is in.
    pub fn put(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, r: RowData) {
        let map = if r.kind == ROW_LINES { &mut self.lines } else { &mut self.dirs };
        if r.chunk == u32::MAX {
            for b in map.values() {
                self.bytes -= b.size();
            }
            map.clear();
            self.arriving.retain(|k, _| k.0 != r.kind);
            return;
        }
        if r.kind == ROW_LINES {
            self.line_box = r.line_box;
        }
        if r.total == 0 || r.total % 4 != 0 || r.offset % 4 != 0 {
            return;
        }
        let key = (r.kind, r.chunk as usize);
        if r.offset == 0 {
            // A buffer the card has no room for is invalid, and every slice written into it an
            // error: that chunk keeps its discs (or points) instead (seen at 100M rows with other
            // programs on the card).
            let oom = device.push_error_scope(wgpu::ErrorFilter::OutOfMemory);
            let invalid = device.push_error_scope(wgpu::ErrorFilter::Validation);
            let buf = device.create_buffer(&wgpu::BufferDescriptor {
                label: Some(if r.kind == ROW_LINES { "line starts" } else { "bearings" }),
                size: r.total as u64,
                usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
                mapped_at_creation: false,
            });
            let error = pollster::block_on(invalid.pop()).or(pollster::block_on(oom.pop()));
            if let Some(e) = error {
                self.arriving.remove(&key);
                crate::note(&format!("viewport: no room for chunk {}'s per-row data ({} bytes): {e}", r.chunk, r.total));
                return;
            }
            self.arriving.insert(key, buf);
        }
        let Some(buf) = self.arriving.get(&key) else { return };
        if !r.bytes.is_empty() {
            queue.write_buffer(buf, r.offset as u64, &r.bytes);
        }
        if r.offset as usize + r.bytes.len() >= r.total as usize {
            let buf = self.arriving.remove(&key).unwrap();
            self.bytes += buf.size();
            if let Some(old) = map.insert(r.chunk as usize, buf) {
                self.bytes -= old.size();
            }
        }
    }

    /// The line heat pipeline into `format` (`lineHeatPipelineFor`).
    pub fn line_pipe(&mut self, device: &wgpu::Device, format: wgpu::TextureFormat) -> wgpu::RenderPipeline {
        self.line_pipes.entry(format).or_insert_with(|| render_pipe(device, &self.m_line, "vsHeat", "fsHeat", format, Some(ADD), &[], None)).clone()
    }

    /// `GpuDirField.ensure`: cells for the heat's size and the frame's spacing; true when made new.
    pub fn ensure_field(&mut self, device: &wgpu::Device, cell: f32, hw: u32, hh: u32, canvas_h: u32) -> bool {
        let (w, h) = field_cells(hw, hh, cell * hh as f32 / canvas_h.max(1) as f32);
        if self.field.as_ref().is_some_and(|f| f.width == w && f.height == h) {
            return false;
        }
        let usage = wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::TEXTURE_BINDING;
        let (tex, view) = tex2d(device, "direction field", w, h, FIELD_FORMAT, usage);
        let (scratch, scratch_view) = tex2d(device, "direction field scratch", w, h, FIELD_FORMAT, usage);
        self.field = Some(Field { view, scratch_view, _tex: tex, _scratch: scratch, width: w, height: h, fresh: true });
        true
    }

    /// Bind groups for the field's draws this frame, their uniforms written (`GpuDirField.draw`):
    /// the streams, then the arrows' outline and the arrows. None where nothing is drawn.
    #[allow(clippy::too_many_arguments)]
    pub fn field_groups(
        &self,
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        sampler: &wgpu::Sampler,
        field: u32,
        inv_gain: f32,
        saturation: f32,
        time: f32,
        canvas: (u32, u32),
    ) -> FieldGroups {
        let Some(f) = self.field.as_ref().filter(|_| field != 0) else { return FieldGroups::default() };
        let write = |i: usize, widen: f32, colour: [f32; 4]| {
            let d = [f.width as f32, f.height as f32, canvas.0 as f32, canvas.1 as f32, inv_gain, saturation, widen, time, colour[0], colour[1], colour[2], colour[3]];
            queue.write_buffer(&self.ubufs[i], 0, bytemuck::cast_slice(&d));
        };
        let group = |pipe: &wgpu::RenderPipeline, i: usize, samp: bool| {
            let mut entries = vec![
                wgpu::BindGroupEntry { binding: 0, resource: self.ubufs[i].as_entire_binding() },
                wgpu::BindGroupEntry { binding: 1, resource: wgpu::BindingResource::TextureView(&f.view) },
            ];
            if samp {
                entries.push(wgpu::BindGroupEntry { binding: 2, resource: wgpu::BindingResource::Sampler(sampler) });
            }
            device.create_bind_group(&wgpu::BindGroupDescriptor { label: Some("direction field"), layout: &pipe.get_bind_group_layout(0), entries: &entries })
        };
        let mut g = FieldGroups { cells: f.width * f.height, ..Default::default() };
        if field & 2 != 0 {
            write(2, 0.0, [0.92, 0.96, 1.0, 0.85]);
            g.stream = Some((self.stream.clone(), group(&self.stream, 2, true)));
        }
        if field & 1 != 0 {
            write(0, 1.0, [0.02, 0.03, 0.05, 0.7]);
            write(1, 0.0, [0.97, 0.98, 1.0, 1.0]);
            g.arrows = Some((self.arrow.clone(), group(&self.arrow, 0, false), group(&self.arrow, 1, false)));
        }
        g
    }
}

/// What the composite draws of the direction field (`HeatModes::field_groups`).
#[derive(Default)]
pub struct FieldGroups {
    pub cells: u32,
    pub stream: Option<(wgpu::RenderPipeline, wgpu::BindGroup)>,
    pub arrows: Option<(wgpu::RenderPipeline, wgpu::BindGroup, wgpu::BindGroup)>,
}

impl FieldGroups {
    /// Into the composite pass, after the picture and before the lines over it.
    pub fn draw(&self, pass: &mut wgpu::RenderPass<'_>) {
        if let Some((pipe, g)) = &self.stream {
            pass.set_pipeline(pipe);
            pass.set_bind_group(0, g, &[]);
            pass.draw(0..3, 0..1);
        }
        if let Some((pipe, outline, arrow)) = &self.arrows {
            pass.set_pipeline(pipe);
            pass.set_bind_group(0, outline, &[]);
            pass.draw(0..FIELD_ARROW_VERTS, 0..self.cells);
            pass.set_bind_group(0, arrow, &[]);
            pass.draw(0..FIELD_ARROW_VERTS, 0..self.cells);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cells_as_the_web() {
        // `fieldCells(1920, 1080, 48)`: 40 x 23 (rounded), at least one, at most 1024.
        assert_eq!(field_cells(1920, 1080, 48.0), (40, 23));
        assert_eq!(field_cells(10, 10, 100.0), (1, 1));
        assert_eq!(field_cells(8000, 8000, 1.0), (1024, 1024));
    }

    #[test]
    fn rows_parse() {
        let mut b = vec![0u8; HEADER];
        for (k, v) in [ROW_LINES, 7, 2, 12, 24, 12].iter().enumerate() {
            b[k * 4..k * 4 + 4].copy_from_slice(&v.to_le_bytes());
        }
        b[36..40].copy_from_slice(&5f32.to_le_bytes());
        b.extend_from_slice(&[1u8; 12]);
        let r = RowData::parse(&b).unwrap();
        assert_eq!((r.kind, r.gen, r.chunk, r.bytes.len(), r.total, r.offset), (ROW_LINES, 7, 2, 12, 24, 12));
        assert_eq!(r.line_box[3], 5.0);
        assert!(RowData::parse(&b[..30]).is_err());
        // A slice past its chunk's end.
        b[16..20].copy_from_slice(&20u32.to_le_bytes());
        assert!(RowData::parse(&b).is_err());
    }
}
