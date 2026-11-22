//! Rows onto the GPU straight from the core: each chunk packed by the core
//! (`Dataset::pack`, the layout `WebgpuRenderer.landChunk` keeps) into a buffer
//! mapped at creation, so no copy of it is ever made in between and the page
//! holds none of it.

use std::collections::HashMap;
use std::sync::Arc;

use heat3d_core::dataset::Dataset;

use crate::renderer::GpuChunk;

fn mapped(device: &wgpu::Device, label: &str, bytes: u64) -> wgpu::Buffer {
    device.create_buffer(&wgpu::BufferDescriptor {
        label: Some(label),
        size: bytes.max(4).next_multiple_of(4),
        usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
        mapped_at_creation: true,
    })
}

/// Whether the core's dataset has per-row times (and so lifetimes) in its chunks.
pub fn has_times(ds: &Dataset) -> bool {
    !ds.chunks.is_empty() && ds.chunk_bytes(0, true).is_ok()
}

/// Chunk `i` of `ds` on the GPU. Rows past `max_binding` bytes of positions cannot be bound as one.
pub fn upload_chunk(device: &wgpu::Device, ds: &Dataset, i: usize) -> anyhow::Result<GpuChunk> {
    let info = ds.chunks[i];
    let rows = info.rows;
    let positions = mapped(device, "chunk positions", rows as u64 * 8);
    {
        let mut range = positions.slice(..).get_mapped_range_mut();
        let words: &mut [u32] = bytemuck::cast_slice_mut(&mut range[..rows * 8]);
        ds.pack(i, false, words)?;
    }
    positions.unmap();
    let times = if has_times(ds) {
        let t = mapped(device, "chunk times", rows as u64 * 4);
        {
            let mut range = t.slice(..).get_mapped_range_mut();
            let words: &mut [u32] = bytemuck::cast_slice_mut(&mut range[..rows * 4]);
            ds.pack(i, true, words)?;
        }
        t.unmap();
        Some(t)
    } else {
        None
    };
    let f = |v: [f64; 3]| [v[0] as f32, v[1] as f32, v[2] as f32];
    let bytes = positions.size() + times.as_ref().map_or(0, |t| t.size());
    Ok(GpuChunk {
        index: i,
        start: info.start,
        rows,
        aabb_min: f(info.aabb_min),
        aabb_size: f(info.aabb_size),
        time_min: info.time_min as f32,
        time_scale: info.time_scale as f32,
        life_scale: info.life_scale as f32,
        positions,
        times,
        pass_bits: None,
        pass_keys: Vec::new(),
        columns: HashMap::new(),
        values: None,
        values_key: String::new(),
        split_slot: -1,
        weight_slot: -1,
        bytes,
    })
}

/// One chunk's rows of a column as the filter pass reads them (f32 a row), or None when the core has no such column.
pub fn upload_column(device: &wgpu::Device, ds: &Arc<Dataset>, chunk: usize, name: &str) -> anyhow::Result<Option<wgpu::Buffer>> {
    let rows = ds.chunks[chunk].rows;
    let buf = mapped(device, "filter column", rows as u64 * 4);
    let ok = {
        let mut range = buf.slice(..).get_mapped_range_mut();
        let out: &mut [f32] = bytemuck::cast_slice_mut(&mut range[..rows * 4]);
        ds.chunk_column(name, chunk, out)?
    };
    buf.unmap();
    Ok(ok.then_some(buf))
}

/// A chunk the page packed (a load the core did not build), as it arrived over IPC.
pub struct PageChunk {
    pub index: usize,
    pub start: usize,
    pub rows: usize,
    pub aabb_min: [f32; 3],
    pub aabb_size: [f32; 3],
    pub time_min: f32,
    pub time_scale: f32,
    pub life_scale: f32,
    pub positions: Vec<u8>,
    pub times: Option<Vec<u8>>,
}

impl PageChunk {
    /// The header the page sends before the bytes, 16 words: index, start, rows, has times,
    /// box min xyz, box size xyz, time min, time scale, life scale, three spare.
    pub fn parse(bytes: &[u8]) -> anyhow::Result<Self> {
        const HEAD: usize = 64;
        anyhow::ensure!(bytes.len() >= HEAD, "chunk header");
        let w = |k: usize| u32::from_le_bytes([bytes[k * 4], bytes[k * 4 + 1], bytes[k * 4 + 2], bytes[k * 4 + 3]]);
        let f = |k: usize| f32::from_bits(w(k));
        let rows = w(2) as usize;
        let has_times = w(3) != 0;
        let pos_end = HEAD + rows * 8;
        anyhow::ensure!(bytes.len() >= pos_end + if has_times { rows * 4 } else { 0 }, "chunk bytes");
        Ok(Self {
            index: w(0) as usize,
            start: w(1) as usize,
            rows,
            aabb_min: [f(4), f(5), f(6)],
            aabb_size: [f(7), f(8), f(9)],
            time_min: f(10),
            time_scale: f(11),
            life_scale: f(12),
            positions: bytes[HEAD..pos_end].to_vec(),
            times: has_times.then(|| bytes[pos_end..pos_end + rows * 4].to_vec()),
        })
    }

    pub fn upload(self, device: &wgpu::Device) -> GpuChunk {
        use wgpu::util::DeviceExt;
        let mk = |label: &str, data: &[u8]| {
            device.create_buffer_init(&wgpu::util::BufferInitDescriptor { label: Some(label), contents: data, usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST })
        };
        let positions = mk("chunk positions", &self.positions);
        let times = self.times.as_ref().map(|t| mk("chunk times", t));
        let bytes = positions.size() + times.as_ref().map_or(0, |t| t.size());
        GpuChunk {
            index: self.index,
            start: self.start,
            rows: self.rows,
            aabb_min: self.aabb_min,
            aabb_size: self.aabb_size,
            time_min: self.time_min,
            time_scale: self.time_scale,
            life_scale: self.life_scale,
            positions,
            times,
            pass_bits: None,
            pass_keys: Vec::new(),
            columns: HashMap::new(),
            values: None,
            values_key: String::new(),
            split_slot: -1,
            weight_slot: -1,
            bytes,
        }
    }
}

/// A filter column the page sent for one chunk: chunk, rows (0: the page has no such column),
/// the name's length and bytes (padded to words), then the rows as f32.
pub fn page_column(device: &wgpu::Device, bytes: &[u8]) -> anyhow::Result<(usize, String, Option<wgpu::Buffer>)> {
    use wgpu::util::DeviceExt;
    anyhow::ensure!(bytes.len() >= 12, "column header");
    let w = |k: usize| u32::from_le_bytes([bytes[k * 4], bytes[k * 4 + 1], bytes[k * 4 + 2], bytes[k * 4 + 3]]) as usize;
    let (chunk, rows, len) = (w(0), w(1), w(2));
    let at = 12 + len.div_ceil(4) * 4;
    anyhow::ensure!(bytes.len() >= at + rows * 4, "column bytes");
    let name = String::from_utf8_lossy(&bytes[12..12 + len]).into_owned();
    let buf = (rows > 0).then(|| {
        device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("filter column"),
            contents: &bytes[at..at + rows * 4],
            usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST,
        })
    });
    Ok((chunk, name, buf))
}
