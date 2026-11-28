//! Heat from tiles in the native viewport (Stage 6), as the page's WebGPU pass
//! draws it (`src/render/webgpu/heatTilesPass.ts`, the same WGSL: `wgsl/heat_tiles.wgsl`).
//!
//! The page picks the tiles each frame (its LOD, ancestors standing in for tiles
//! not there yet) and sends the draw list (`SECTION_HEAT_TILES`): per tile its id
//! and the instance as the WebGPU pass packs it. The tiles themselves are read
//! here from the core's tile store by the pyramid's key - no copy through the
//! page - and decoded off the render thread with the page's channel weights
//! (the same arithmetic as `tileFormat.ts` `decodeTile`). A tile not decoded
//! yet is left out of the frame and `pending` says so; at most
//! `TILE_UPLOADS_PER_FRAME` layers are written a frame, so arriving tiles never
//! stall one.

use std::collections::{HashMap, HashSet};
use std::sync::{mpsc, Arc};

use heat3d_core::tiles::{decode_tile, TileStore, TILE};

use crate::generated::*;

/// `SECTION_HEAT_TILES`: what the page draws this frame.
#[derive(Clone, Default)]
pub struct TilesFrame {
    pub key: String,
    /// The pass's numbers after the view (the WGSL's `U` from `ground` on).
    pub uniform: [f32; 16],
    /// The ramp's curve while it is on.
    pub curve: Option<Vec<f32>>,
    /// 1 (heat) or 4 (heat and the group colour's Oklab a, b, L).
    pub components: u32,
    /// The weights' key (0: summed), and the weights (channels x components).
    pub wkey: u32,
    pub weights: Vec<f32>,
    /// Tile id, instance (`TILE_INST_FLOATS`: rect, uv, k, layer, cell, reach, hole).
    pub tiles: Vec<(u64, [f32; TILE_INST_FLOATS as usize])>,
}

/// A tile's texels as a layer takes them.
enum Texels {
    Heat(Vec<f32>),
    /// Half floats (heat, a, b, L) scaled to 1, and the scale.
    Rgba(Vec<u16>, f32),
}

/// What tells two decodings of a tile apart: its id and the weights' key (with their component count).
type Slot = (u64, u32);

struct Job {
    store: Arc<TileStore>,
    key: String,
    ids: Vec<u64>,
    weights: Arc<Vec<f32>>,
    components: u32,
    wkey: u32,
}

struct Done {
    key: String,
    slot: Slot,
    /// None: the tile holds no rows (or could not be read).
    texels: Option<Texels>,
    /// Read from the build's coarse estimate: read again once the pyramid is whole.
    estimate: bool,
}

/// A float as IEEE half bits, round to nearest (as `tileFormat.ts` `toHalf`).
pub fn to_half(v: f32) -> u16 {
    let x = v.to_bits();
    let sign = ((x >> 16) & 0x8000) as u16;
    let e = ((x >> 23) & 0xff) as i32 - 127 + 15;
    let m = x & 0x7f_ffff;
    if e >= 31 {
        return sign | 0x7c00;
    }
    if e <= 0 {
        if e < -10 {
            return sign;
        }
        let mm = (m | 0x80_0000) >> (1 - e);
        return sign | ((mm + 0x1000) >> 13) as u16;
    }
    sign | (((e as u32) << 10) + ((m + 0x1000) >> 13)) as u16
}

/// A tile's bytes decoded and weighed as the page's decoder does: one component, the weighed sum
/// (summed without weights for its channel count); four, the (heat, a, b, L) sums scaled to 1.
fn weigh(bytes: &[u8], weights: &[f32], components: u32) -> Option<Texels> {
    let t = decode_tile(bytes).ok()?;
    let n = TILE * TILE;
    let ch = t.channels;
    let w = (weights.len() == ch * components as usize).then_some(weights);
    match (w, components) {
        (Some(w), 4) => {
            let mut sums = vec![0f32; n * 4];
            for c in 0..ch {
                let k = &w[c * 4..c * 4 + 4];
                if k.iter().all(|&v| v == 0.0) {
                    continue;
                }
                for i in 0..n {
                    let v = t.cells[c * n + i];
                    if v == 0 {
                        continue;
                    }
                    let v = v as f32;
                    for j in 0..4 {
                        sums[i * 4 + j] += v * k[j];
                    }
                }
            }
            let big = sums.iter().fold(0f32, |a, &v| a.max(v.abs()));
            let amp = if big > 0.0 { big } else { 1.0 };
            Some(Texels::Rgba(sums.iter().map(|&v| to_half(v / amp)).collect(), amp))
        }
        _ => {
            let mut counts = vec![0f32; n];
            for c in 0..ch {
                let k = w.map(|w| w[c]).unwrap_or(1.0);
                if k == 0.0 {
                    continue;
                }
                for (o, &v) in counts.iter_mut().zip(&t.cells[c * n..(c + 1) * n]) {
                    *o += k * v as f32;
                }
            }
            Some(Texels::Heat(counts))
        }
    }
}

/// Reads and decodes off the render thread, a job at a time.
fn worker(jobs: mpsc::Receiver<Job>, done: mpsc::Sender<Done>) {
    use rayon::prelude::*;
    while let Ok(j) = jobs.recv() {
        let read = j.store.read(&j.key, &j.ids, u64::MAX);
        let mut out: Vec<Done> = Vec::new();
        match read {
            Ok(r) => {
                out = r
                    .tiles
                    .par_iter()
                    .map(|(id, b, est)| Done { key: j.key.clone(), slot: (*id, j.wkey), texels: weigh(b, &j.weights, j.components), estimate: *est })
                    .collect();
                for id in r.empty.iter() {
                    out.push(Done { key: j.key.clone(), slot: (*id, j.wkey), texels: None, estimate: false });
                }
                // Pending (still building) or deferred: asked again by a later frame.
                for id in r.pending.iter().chain(r.deferred.iter()) {
                    out.push(Done { key: j.key.clone(), slot: (*id, u32::MAX), texels: None, estimate: false });
                }
            }
            Err(e) => crate::note(&format!("viewport: heat tiles: {e:#}")),
        }
        for d in out {
            if done.send(d).is_err() {
                return;
            }
        }
    }
}

/// One texture array of layers: heat (r32float) or team colours (rgba16float).
struct Bank {
    tex: wgpu::Texture,
    view: wgpu::TextureView,
    four: bool,
    /// Slot -> (layer, last frame drawn, the team colours' scale).
    layers: HashMap<Slot, (u32, u64, f32)>,
    free: Vec<u32>,
}

impl Bank {
    fn new(device: &wgpu::Device, four: bool) -> Self {
        let n = if four { TILE_LAYERS_RGBA } else { TILE_LAYERS };
        let tex = device.create_texture(&wgpu::TextureDescriptor {
            label: Some(if four { "heat tiles rgba" } else { "heat tiles" }),
            size: wgpu::Extent3d { width: TILE as u32, height: TILE as u32, depth_or_array_layers: n },
            mip_level_count: 1,
            sample_count: 1,
            dimension: wgpu::TextureDimension::D2,
            format: if four { wgpu::TextureFormat::Rgba16Float } else { wgpu::TextureFormat::R32Float },
            usage: wgpu::TextureUsages::TEXTURE_BINDING | wgpu::TextureUsages::COPY_DST,
            view_formats: &[],
        });
        let view = tex.create_view(&wgpu::TextureViewDescriptor { dimension: Some(wgpu::TextureViewDimension::D2Array), ..Default::default() });
        Self { tex, view, four, layers: HashMap::new(), free: (0..n).rev().collect() }
    }

    /// A layer for `slot`, the least recently drawn given up when none is free (never one drawn this frame).
    fn take(&mut self, frame: u64) -> Option<u32> {
        if let Some(l) = self.free.pop() {
            return Some(l);
        }
        let (&old, &(layer, used, _)) = self.layers.iter().filter(|(_, v)| v.1 < frame).min_by_key(|(_, v)| v.1)?;
        let _ = used;
        self.layers.remove(&old);
        Some(layer)
    }

    fn upload(&mut self, queue: &wgpu::Queue, slot: Slot, texels: &Texels, frame: u64) -> Option<u32> {
        let layer = self.take(frame)?;
        let (bytes, amp): (&[u8], f32) = match texels {
            Texels::Heat(v) => (bytemuck::cast_slice(v), 1.0),
            Texels::Rgba(v, amp) => (bytemuck::cast_slice(v), *amp),
        };
        queue.write_texture(
            wgpu::TexelCopyTextureInfo { texture: &self.tex, mip_level: 0, origin: wgpu::Origin3d { x: 0, y: 0, z: layer }, aspect: wgpu::TextureAspect::All },
            bytes,
            wgpu::TexelCopyBufferLayout { offset: 0, bytes_per_row: Some(TILE as u32 * if self.four { 8 } else { 4 }), rows_per_image: Some(TILE as u32) },
            wgpu::Extent3d { width: TILE as u32, height: TILE as u32, depth_or_array_layers: 1 },
        );
        self.layers.insert(slot, (layer, frame, amp));
        Some(layer)
    }

    fn clear(&mut self) {
        for (_, (l, _, _)) in self.layers.drain() {
            self.free.push(l);
        }
    }
}

const W_HEAT_TILES: &str = include_str!("../wgsl/heat_tiles.wgsl");

/// The tile pass and its tiles.
pub struct HeatTiles {
    store: Option<Arc<TileStore>>,
    jobs: Option<mpsc::Sender<Job>>,
    done_tx: mpsc::Sender<Done>,
    done: mpsc::Receiver<Done>,
    /// Decoded, waiting for a layer.
    ready: HashMap<Slot, Texels>,
    /// Holding no rows: never drawn, never asked again.
    empty: HashSet<u64>,
    /// Tiles of the build's estimate (drawn until the pyramid is whole, then read again).
    estimates: HashSet<u64>,
    asked: HashSet<Slot>,
    key: String,
    heat: Option<Bank>,
    rgba: Option<Bank>,
    module: Option<wgpu::ShaderModule>,
    pipes: HashMap<(wgpu::TextureFormat, bool), wgpu::RenderPipeline>,
    uniform: Option<wgpu::Buffer>,
    inst: Option<(wgpu::Buffer, usize)>,
    curve: Option<wgpu::Buffer>,
    frame: u64,
    /// Tiles the last frame wanted that were not drawn yet (being read, decoded, or over the uploads).
    pub pending: bool,
}

impl Default for HeatTiles {
    fn default() -> Self {
        let (done_tx, done) = mpsc::channel();
        Self {
            store: None,
            jobs: None,
            done_tx,
            done,
            ready: HashMap::new(),
            empty: HashSet::new(),
            estimates: HashSet::new(),
            asked: HashSet::new(),
            key: String::new(),
            heat: None,
            rgba: None,
            module: None,
            pipes: HashMap::new(),
            uniform: None,
            inst: None,
            curve: None,
            frame: 0,
            pending: false,
        }
    }
}

impl HeatTiles {
    /// The core's tile store, where the tiles are read by key.
    pub fn set_store(&mut self, store: Arc<TileStore>) {
        self.store = Some(store);
    }

    /// GPU bytes the layers hold.
    pub fn bytes(&self) -> u64 {
        let side = (TILE * TILE) as u64;
        self.heat.as_ref().map_or(0, |_| side * 4 * TILE_LAYERS as u64) + self.rgba.as_ref().map_or(0, |_| side * 8 * TILE_LAYERS_RGBA as u64)
    }

    fn pipeline(&mut self, device: &wgpu::Device, format: wgpu::TextureFormat, four: bool) -> wgpu::RenderPipeline {
        let m = self.module.get_or_insert_with(|| crate::renderer::module(device, "heat tiles", W_HEAT_TILES)).clone();
        self.pipes
            .entry((format, four))
            .or_insert_with(|| {
                let constants = [("FOUR", if four { 1.0 } else { 0.0 })];
                device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
                    label: Some("heat tiles"),
                    layout: None,
                    vertex: wgpu::VertexState { module: &m, entry_point: Some("vs"), buffers: &[], compilation_options: Default::default() },
                    fragment: Some(wgpu::FragmentState {
                        module: &m,
                        entry_point: Some("fs"),
                        targets: &[Some(wgpu::ColorTargetState { format, blend: Some(crate::renderer::ADD), write_mask: wgpu::ColorWrites::ALL })],
                        compilation_options: wgpu::PipelineCompilationOptions { constants: &constants, ..Default::default() },
                    }),
                    primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::TriangleList, ..Default::default() },
                    depth_stencil: None,
                    multisample: Default::default(),
                    multiview_mask: None,
                    cache: None,
                })
            })
            .clone()
    }

    /// Draws `t` into `target` (cleared this frame), `view_proj` the frame's.
    #[allow(clippy::too_many_arguments)]
    pub fn draw(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, encoder: &mut wgpu::CommandEncoder, target: &wgpu::TextureView, format: wgpu::TextureFormat, t: &TilesFrame, view_proj: &[f32]) {
        self.frame += 1;
        self.pending = false;
        let Some(store) = self.store.clone() else {
            self.pending = !t.tiles.is_empty();
            return;
        };
        if t.key != self.key {
            // Another pyramid: nothing of the old one is drawn again.
            self.key = t.key.clone();
            self.ready.clear();
            self.empty.clear();
            self.estimates.clear();
            self.asked.clear();
            if let Some(b) = &mut self.heat {
                b.clear();
            }
            if let Some(b) = &mut self.rgba {
                b.clear();
            }
        }
        while let Ok(d) = self.done.try_recv() {
            if d.key != self.key {
                continue;
            }
            match d.texels {
                Some(x) => {
                    self.asked.remove(&d.slot);
                    if d.estimate {
                        self.estimates.insert(d.slot.0);
                    }
                    self.ready.insert(d.slot, x);
                }
                None if d.slot.1 == u32::MAX => {
                    // Not built yet, or over the read's budget: asked again.
                    self.asked.retain(|s| s.0 != d.slot.0);
                }
                None => {
                    self.asked.remove(&d.slot);
                    self.empty.insert(d.slot.0);
                }
            }
        }
        // The pyramid whole: what the estimate gave is read again (as the page drops its estimate tiles).
        if !self.estimates.is_empty() && self.frame % 8 == 0 && store.is_complete(&self.key) {
            let est = std::mem::take(&mut self.estimates);
            self.ready.retain(|s, _| !est.contains(&s.0));
            self.asked.retain(|s| !est.contains(&s.0));
            for b in [&mut self.heat, &mut self.rgba].into_iter().flatten() {
                let gone: Vec<Slot> = b.layers.keys().filter(|s| est.contains(&s.0)).copied().collect();
                for s in gone {
                    if let Some((l, _, _)) = b.layers.remove(&s) {
                        b.free.push(l);
                    }
                }
            }
        }
        let four = t.components == 4;
        let wkey = t.wkey ^ if four { 0x8000_0000 } else { 0 };
        let bank = if four { self.rgba.get_or_insert_with(|| Bank::new(device, true)) } else { self.heat.get_or_insert_with(|| Bank::new(device, false)) };
        let mut uploads = TILE_UPLOADS_PER_FRAME;
        let mut ask: Vec<u64> = Vec::new();
        let mut inst: Vec<f32> = Vec::with_capacity(t.tiles.len() * TILE_INST_FLOATS as usize);
        for (id, i) in &t.tiles {
            if self.empty.contains(id) {
                continue;
            }
            let slot = (*id, wkey);
            let have = match bank.layers.get_mut(&slot) {
                Some(v) => {
                    v.1 = self.frame;
                    Some((v.0, v.2))
                }
                None => match self.ready.get(&slot) {
                    Some(x) if uploads > 0 => {
                        uploads -= 1;
                        let up = bank.upload(queue, slot, x, self.frame);
                        if up.is_some() {
                            self.ready.remove(&slot);
                        }
                        up.map(|l| (l, bank.layers[&slot].2))
                    }
                    Some(_) => None,
                    None => {
                        if self.asked.insert(slot) {
                            ask.push(*id);
                        }
                        None
                    }
                },
            };
            let Some((layer, amp)) = have else {
                self.pending = true;
                continue;
            };
            let mut v = *i;
            if four {
                v[8] *= amp;
            }
            v[9] = layer as f32;
            inst.extend_from_slice(&v);
        }
        if !ask.is_empty() {
            if self.jobs.is_none() {
                let (tx, rx) = mpsc::channel();
                let done = self.done_tx.clone();
                let _ = std::thread::Builder::new().name("heat-tiles-viewport".into()).spawn(move || worker(rx, done));
                self.jobs = Some(tx);
            }
            let job = Job { store, key: self.key.clone(), ids: ask, weights: Arc::new(t.weights.clone()), components: t.components, wkey };
            if let Some(j) = &self.jobs {
                let _ = j.send(job);
            }
        }
        // Decoded tiles no frame wants any more (another weighing, panned away): let go.
        if self.ready.len() > 4 * TILE_LAYERS as usize {
            self.ready.clear();
        }
        let n = inst.len() / TILE_INST_FLOATS as usize;
        if n == 0 {
            return;
        }
        // The uniform: the view, then the page's numbers (neutral L only into a team colour target).
        let mut u = [0f32; 32];
        u[..16].copy_from_slice(&view_proj[..16]);
        u[16..].copy_from_slice(&t.uniform);
        let rgba_target = matches!(format, wgpu::TextureFormat::Rgba16Float | wgpu::TextureFormat::Rgba32Float);
        if !rgba_target {
            u[29] = 0.0;
        }
        let ubuf = self.uniform.get_or_insert_with(|| {
            device.create_buffer(&wgpu::BufferDescriptor { label: Some("heat tiles uniform"), size: 128, usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST, mapped_at_creation: false })
        });
        queue.write_buffer(ubuf, 0, bytemuck::cast_slice(&u));
        let curve = self.curve.get_or_insert_with(|| {
            device.create_buffer(&wgpu::BufferDescriptor { label: Some("heat tiles curve"), size: CURVE_LUT_SIZE as u64 * 4, usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST, mapped_at_creation: false })
        });
        if let Some(c) = &t.curve {
            queue.write_buffer(curve, 0, bytemuck::cast_slice(c));
        }
        if self.inst.as_ref().is_none_or(|(_, cap)| *cap < n) {
            let cap = n.next_power_of_two().max(256);
            let b = device.create_buffer(&wgpu::BufferDescriptor { label: Some("heat tile instances"), size: (cap * TILE_INST_FLOATS as usize * 4) as u64, usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_DST, mapped_at_creation: false });
            self.inst = Some((b, cap));
        }
        let ibuf = self.inst.as_ref().unwrap().0.clone();
        queue.write_buffer(&ibuf, 0, bytemuck::cast_slice(&inst));
        let (ubuf, curve) = (ubuf.clone(), curve.clone());
        let pipe = self.pipeline(device, format, four);
        let view = if four { &self.rgba.as_ref().unwrap().view } else { &self.heat.as_ref().unwrap().view };
        let bind = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("heat tiles"),
            layout: &pipe.get_bind_group_layout(0),
            entries: &[
                wgpu::BindGroupEntry { binding: 0, resource: ubuf.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 1, resource: ibuf.as_entire_binding() },
                wgpu::BindGroupEntry { binding: 2, resource: wgpu::BindingResource::TextureView(view) },
                wgpu::BindGroupEntry { binding: 3, resource: curve.as_entire_binding() },
            ],
        });
        let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("heat tiles"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment { view: target, depth_slice: None, resolve_target: None, ops: wgpu::Operations { load: wgpu::LoadOp::Load, store: wgpu::StoreOp::Store } })],
            depth_stencil_attachment: None,
            timestamp_writes: None,
            occlusion_query_set: None,
            multiview_mask: None,
        });
        pass.set_pipeline(&pipe);
        pass.set_bind_group(0, &bind, &[]);
        pass.draw(0..6, 0..n as u32);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn halves_as_the_page_writes_them() {
        assert_eq!(to_half(1.0), 0x3c00);
        assert_eq!(to_half(-2.0), 0xc000);
        assert_eq!(to_half(0.0), 0);
        assert_eq!(to_half(65504.0), 0x7bff);
        assert_eq!(to_half(1e9), 0x7c00);
    }

    #[test]
    fn weighs_the_shared_tile_as_the_page_does() {
        // native/vectors/tiles/tile.bin: two channels, cell 1 holds 3 and 4 (`tileFormat.test.ts`, `channels.test.ts`).
        let bytes = std::fs::read(concat!(env!("CARGO_MANIFEST_DIR"), "/../../vectors/tiles/tile.bin")).unwrap();
        let Some(Texels::Heat(c)) = weigh(&bytes, &[1.0, -1.0], 1) else { panic!() };
        assert_eq!(c[1], -1.0);
        // Weights of another channel count: summed.
        let Some(Texels::Heat(c)) = weigh(&bytes, &[2.0], 1) else { panic!() };
        assert_eq!(c[1], 7.0);
        let Some(Texels::Rgba(v, amp)) = weigh(&bytes, &[1.0, 0.5, 0.0, 0.7, 1.0, -0.5, 0.0, 0.7], 4) else { panic!() };
        assert!(amp > 0.0);
        assert_eq!(v[4], to_half(7.0 / amp));
        assert_eq!(v[5], to_half((3.0 * 0.5 - 4.0 * 0.5) / amp));
    }
}
