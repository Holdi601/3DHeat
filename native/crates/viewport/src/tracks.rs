//! The GPU tracks (`src/render/webgpu/tracks.ts`): every unit of a large load placed by the GPU.
//!
//! The page sends the store once (`viewport_tracks`, `src/render/native/nativeTracks.ts`): a
//! begin message with the meshes' ids, the runs and the draws' arguments as the web lays them
//! out (`gpuLayout.ts`), then the tracks, keys and attitudes in slices. Each frame's packet
//! carries the place shader's uniform and, when they change, the visibility bits. The frame
//! then runs the same WGSL as the web (`tracks_place.wgsl`, `tracks_finish.wgsl`): place puts
//! every unit at the playhead and appends its instance to its mesh's run, finish writes each
//! run's count into the indirect draws, and the scene pass draws one indirect instanced draw a
//! mesh with the figures' pipeline (`figures.rs`, meshes resident by id). No CPU work per unit.
//!
//! Trails, drop lines and weapon streaks: the place shader writes them as line segments into
//! the trail buffer (`TRACKS_TRAIL_ROOM` vertices, as the web), the deaths' marks pass
//! (`tracks_marks.wgsl`, from the store's markers) adds theirs, finish writes the vertex count
//! into an indirect line draw. The far-off glyphs' run (after the meshes' runs in the
//! instances) is drawn with the figures' glyph pipeline, one indirect quad draw.
//!
//! A load the core holds more rows of than the page (`pageStep` > 1) is drawn from the core's
//! keys (`heat3d_core::tracks`, over every row): the app builds them from the dataset handle and
//! hands them over here (`core_keys`, no IPC), and the page's begin message for such a store
//! (`BEGIN_CORE`) sends only its track table, which the core's chunk spans follow in the same
//! buffer; keys and attitudes go from the core's arrays straight into buffers mapped at creation.

use std::sync::Arc;

use heat3d_core::tracks::TrackKeys;

use crate::figures::Figures;
use crate::generated::*;
use crate::packet::TracksFrame;

const W_PLACE: &str = include_str!("../wgsl/tracks_place.wgsl");
const W_FINISH: &str = include_str!("../wgsl/tracks_finish.wgsl");
const W_MARKS: &str = include_str!("../wgsl/tracks_marks.wgsl");
const W_TRAIL: &str = include_str!("../wgsl/tracks_trail.wgsl");
/// The arrays the page sends: tracks (+ aim keys), keys, keys past the first buffer, attitudes,
/// the deaths' marks (x, y, z, time) and their colours.
const ARRAYS: usize = 6;

/// Message kinds (`nativeTracks.ts`).
const BEGIN: u32 = 0;
const SLICE: u32 = 1;
const FREE: u32 = 2;
/// A begin message for a store drawn from the core's keys (`core_keys`, same id).
const BEGIN_CORE: u32 = 3;
/// Keys the first key buffer holds (`KEYS_PER_BUFFER` in `store.ts`); the rest go in the second.
const KEYS_PER_BUFFER: u64 = (1 << 28) - (1 << 16);

struct Store {
    id: u32,
    tracks: u32,
    meshes: Vec<u32>,
    run_first: Vec<u32>,
    run_room: Vec<u32>,
    /// Where the glyphs' run starts in the instances (after the meshes' runs, `gpuLayout.ts`).
    glyph_first: u32,
    /// The `ARRAYS`; the bytes each will hold and has.
    bufs: Vec<wgpu::Buffer>,
    want: [u64; ARRAYS],
    got: [u64; ARRAYS],
    counts: wgpu::Buffer,
    args: wgpu::Buffer,
    args_init: wgpu::Buffer,
    args_bytes: u64,
    instances: wgpu::Buffer,
    vis: wgpu::Buffer,
    trail: wgpu::Buffer,
    trail_args: wgpu::Buffer,
    place_group: wgpu::BindGroup,
    finish_group: wgpu::BindGroup,
    /// The marks pass's bindings and how many marks, when the store has any.
    marks: Option<(wgpu::BindGroup, u32)>,
    bytes: u64,
}

impl Store {
    fn whole(&self) -> bool {
        self.want == self.got
    }
}

pub struct Tracks {
    place: wgpu::ComputePipeline,
    finish: wgpu::ComputePipeline,
    marks: wgpu::ComputePipeline,
    trail_pipeline: wgpu::RenderPipeline,
    uniform: wgpu::Buffer,
    mesh_count: wgpu::Buffer,
    store: Option<Store>,
    /// The core's keys for the store of this id, until its begin message takes them (`core_keys`).
    core: Option<(u32, Arc<TrackKeys>)>,
    /// Whether this frame placed the units (the scene pass draws them).
    placed: bool,
    /// Whether this frame's trails draw (`writeTracksUniform`'s `trailsOn`).
    trails_on: bool,
}

fn compute(device: &wgpu::Device, label: &str, src: &str, entry: &str) -> wgpu::ComputePipeline {
    let module = device.create_shader_module(wgpu::ShaderModuleDescriptor { label: Some(label), source: wgpu::ShaderSource::Wgsl(src.into()) });
    device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor { label: Some(label), layout: None, module: &module, entry_point: Some(entry), compilation_options: Default::default(), cache: None })
}

/// Groups of 64 for `n` threads, in rows of at most 65535 groups (the shader counts rows by `num_workgroups`).
fn dispatch(pass: &mut wgpu::ComputePass<'_>, n: u32) {
    let groups = n.div_ceil(64);
    if groups == 0 {
        return;
    }
    let x = groups.min(65535);
    pass.dispatch_workgroups(x, groups.div_ceil(x), 1);
}

fn e(binding: u32, b: &wgpu::Buffer) -> wgpu::BindGroupEntry<'_> {
    wgpu::BindGroupEntry { binding, resource: b.as_entire_binding() }
}

/// `data` into a buffer mapped at creation, from byte `at`, on every core (it may be a gigabyte).
fn fill_mapped(buf: &wgpu::Buffer, at: u64, data: &[u32]) {
    use rayon::prelude::*;
    if data.is_empty() {
        return;
    }
    let bytes: &[u8] = bytemuck::cast_slice(data);
    let mut view = buf.slice(at..at + bytes.len() as u64).get_mapped_range_mut().expect("mapped at creation");
    let mut w = view.slice(..);
    assert!(bytes.len() <= w.len(), "mapping too small");
    let ptr = w.as_raw_element_ptr().as_ptr() as usize;
    // SAFETY: the mapping is live and at least `bytes` long (checked above); each part writes its
    // own bytes of it, front to back, and nothing else touches it until `view` drops.
    bytes.par_chunks(1 << 22).enumerate().for_each(|(k, src)| unsafe { std::ptr::copy_nonoverlapping(src.as_ptr(), (ptr as *mut u8).add(k << 22), src.len()) });
}

fn words(b: &[u8], k: usize) -> u32 {
    u32::from_le_bytes([b[k * 4], b[k * 4 + 1], b[k * 4 + 2], b[k * 4 + 3]])
}

impl Tracks {
    /// The pipelines, made when the viewport starts (the place shader is the largest the web compiles).
    pub fn new(device: &wgpu::Device) -> Self {
        let place = compute(device, "tracks place", W_PLACE, "place");
        let finish = compute(device, "tracks finish", W_FINISH, "finish");
        let marks = compute(device, "tracks marks", W_MARKS, "marks");
        // The trails: position + colour a vertex, a line list, blended, depth tested but not written (`GpuTracks.create`).
        let tm = device.create_shader_module(wgpu::ShaderModuleDescriptor { label: Some("tracks trail"), source: wgpu::ShaderSource::Wgsl(W_TRAIL.into()) });
        let attrs = wgpu::vertex_attr_array![0 => Float32x4, 1 => Float32x4];
        let trail_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("tracks trail"),
            layout: None,
            vertex: wgpu::VertexState {
                module: &tm,
                entry_point: Some("vsTrail"),
                compilation_options: Default::default(),
                buffers: &[Some(wgpu::VertexBufferLayout { array_stride: 32, step_mode: wgpu::VertexStepMode::Vertex, attributes: &attrs })],
            },
            fragment: Some(wgpu::FragmentState {
                module: &tm,
                entry_point: Some("fsTrail"),
                compilation_options: Default::default(),
                targets: &[Some(wgpu::ColorTargetState { format: crate::renderer::SCENE_FORMAT, blend: Some(crate::figures::alpha_blend()), write_mask: wgpu::ColorWrites::ALL })],
            }),
            primitive: wgpu::PrimitiveState { topology: wgpu::PrimitiveTopology::LineList, ..Default::default() },
            depth_stencil: crate::figures::depth(false),
            multisample: Default::default(),
            multiview_mask: None,
            cache: None,
        });
        let buf = |label: &str, size: u64, usage: wgpu::BufferUsages| device.create_buffer(&wgpu::BufferDescriptor { label: Some(label), size, usage, mapped_at_creation: false });
        let uniform = buf("tracks uniforms", TRACKS_UNIFORM_BYTES as u64, wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST);
        let mesh_count = buf("tracks mesh count", 16, wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST);
        Self { place, finish, marks, trail_pipeline, uniform, mesh_count, store: None, core: None, placed: false, trails_on: false }
    }

    /// GPU bytes the store holds.
    pub fn bytes(&self) -> u64 {
        self.store.as_ref().map_or(0, |s| s.bytes)
    }

    /// The id of the store whole here (0: none), for the snapshot.
    pub fn ready_id(&self) -> u32 {
        self.store.as_ref().filter(|s| s.whole()).map_or(0, |s| s.id)
    }

    /// Lets the store go (a new dataset).
    pub fn clear(&mut self) {
        self.store = None;
        self.core = None;
    }

    /// The core's keys for the store the page begins next with this id (`BEGIN_CORE`).
    pub fn core_keys(&mut self, id: u32, keys: Arc<TrackKeys>) {
        self.core = Some((id, keys));
    }

    /// One `viewport_tracks` message: a store begun, a slice of one of its arrays, or the store let go.
    pub fn message(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, b: &[u8]) -> anyhow::Result<()> {
        anyhow::ensure!(b.len() >= 8 && b.len() % 4 == 0, "tracks message of {} bytes", b.len());
        match words(b, 0) {
            kind @ (BEGIN | BEGIN_CORE) => {
                let head = 5 + ARRAYS;
                anyhow::ensure!(b.len() >= head * 4, "tracks begin");
                let (id, tracks, m, vis_words) = (words(b, 1), words(b, 2), words(b, 3) as usize, words(b, 4) as u64);
                let want: [u64; ARRAYS] = std::array::from_fn(|i| words(b, 5 + i) as u64);
                anyhow::ensure!(b.len() / 4 == head + m + (m + 1) * 2 + (m + 1) * 4, "tracks begin of {} words for {m} meshes", b.len() / 4);
                let all: Vec<u32> = (0..b.len() / 4).map(|k| words(b, k)).collect();
                let meshes = all[head..head + m].to_vec();
                let runs = &all[head + m..head + m + (m + 1) * 2];
                let args = &all[head + m + (m + 1) * 2..];
                let run_first: Vec<u32> = (0..m).map(|i| runs[i * 2]).collect();
                let run_room: Vec<u32> = (0..m).map(|i| runs[i * 2 + 1]).collect();
                let total = runs[m * 2] as u64 + runs[m * 2 + 1] as u64;
                let core = match kind {
                    // Taken: once on the GPU the CPU copy goes (a gigabyte at 100M rows).
                    BEGIN_CORE => Some(self.core.take().filter(|c| c.0 == id).map(|c| c.1).ok_or_else(|| anyhow::anyhow!("no core keys for tracks store {id}"))?),
                    _ => None,
                };
                if core.is_none() {
                    self.core = None;
                }
                self.store = None;
                self.store = Some(self.make(device, queue, id, tracks, meshes, run_first, run_room, runs, args, want, vis_words, total, core.as_deref()));
            }
            SLICE => {
                anyhow::ensure!(b.len() >= 16, "tracks slice");
                let (id, which, at) = (words(b, 1), words(b, 2) as usize, words(b, 3) as u64);
                let Some(s) = self.store.as_mut().filter(|s| s.id == id) else { return Ok(()) };
                let data = &b[16..];
                anyhow::ensure!(which < ARRAYS && at + data.len() as u64 <= s.want[which], "tracks slice out of bounds");
                queue.write_buffer(&s.bufs[which], at, data);
                // A recolour sends the tracks' table again over what is there: counted once.
                s.got[which] = s.got[which].max(at + data.len() as u64);
            }
            FREE => self.store = None,
            k => anyhow::bail!("tracks message kind {k}"),
        }
        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    fn make(
        &self,
        device: &wgpu::Device,
        queue: &wgpu::Queue,
        id: u32,
        tracks: u32,
        meshes: Vec<u32>,
        run_first: Vec<u32>,
        run_room: Vec<u32>,
        runs: &[u32],
        args: &[u32],
        want: [u64; ARRAYS],
        vis_words: u64,
        total: u64,
        core: Option<&TrackKeys>,
    ) -> Store {
        let s = wgpu::BufferUsages::STORAGE;
        let dst = wgpu::BufferUsages::COPY_DST;
        let buf = |label: &str, size: u64, usage: wgpu::BufferUsages| {
            device.create_buffer(&wgpu::BufferDescriptor { label: Some(label), size: size.max(16).next_multiple_of(4), usage, mapped_at_creation: false })
        };
        let labels = ["tracks", "track keys", "track keys (2)", "track attitudes", "track marks", "track mark colours"];
        let mut want = want;
        let mut got = [0u64; ARRAYS];
        let bufs: Vec<wgpu::Buffer> = match core {
            None => labels.iter().zip(want).map(|(l, n)| buf(l, n, s | dst)).collect(),
            Some(k) => {
                // The page sends the table only; the core's chunk spans after it, its keys and
                // attitudes whole, written now into buffers mapped at creation.
                let keys = k.keys as u64;
                let first = keys.min(KEYS_PER_BUFFER) as usize;
                let a = &k.keys_a[..];
                let parts: [&[u32]; 4] = [&k.chunks, &a[..first * 2], &a[first * 2..], &k.keys_b];
                let at0 = want[0];
                let mut v = Vec::with_capacity(ARRAYS);
                for (i, l) in labels.iter().enumerate() {
                    if i < 4 {
                        let (at, n) = if i == 0 { (at0, at0 + parts[0].len() as u64 * 4) } else { (0, parts[i].len() as u64 * 4) };
                        let b = device.create_buffer(&wgpu::BufferDescriptor { label: Some(l), size: n.max(16).next_multiple_of(4), usage: s | dst, mapped_at_creation: true });
                        fill_mapped(&b, at, parts[i]);
                        b.unmap();
                        if i > 0 {
                            want[i] = n;
                            got[i] = n;
                        }
                        v.push(b);
                    } else {
                        v.push(buf(l, want[i], s | dst));
                    }
                }
                v
            }
        };
        let m = meshes.len();
        let runs_buf = buf("track runs", (runs.len() * 4) as u64, s | dst);
        queue.write_buffer(&runs_buf, 0, bytemuck::cast_slice(runs));
        let counts = buf("track counts", ((m + 2) * 4) as u64, s | dst);
        let args_bytes = (args.len() * 4) as u64;
        let args_buf = buf("track draws", args_bytes, s | wgpu::BufferUsages::INDIRECT | dst);
        let args_init = buf("track draws at the start", args_bytes, wgpu::BufferUsages::COPY_SRC | dst);
        queue.write_buffer(&args_init, 0, bytemuck::cast_slice(args));
        let instances = buf("track instances", (total * INSTANCE_STRIDE as u64 * 4).max(64), s | wgpu::BufferUsages::VERTEX);
        let vis = buf("track visibility", vis_words * 4, s | dst);
        let trail = buf("track trails", TRACKS_TRAIL_ROOM as u64 * 32, s | wgpu::BufferUsages::VERTEX);
        let trail_args = buf("track trail draw", 16, s | wgpu::BufferUsages::INDIRECT | dst);
        // One instance; finish writes the vertex count.
        queue.write_buffer(&trail_args, 0, bytemuck::cast_slice(&[0u32, 1, 0, 0]));
        queue.write_buffer(&self.mesh_count, 0, bytemuck::cast_slice(&[m as u32, TRACKS_TRAIL_ROOM, 0, 0]));
        let place_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("tracks place"),
            layout: &self.place.get_bind_group_layout(0),
            entries: &[
                e(0, &self.uniform),
                e(1, &bufs[0]),
                e(2, &bufs[1]),
                e(3, &bufs[3]),
                e(4, &runs_buf),
                e(5, &counts),
                e(6, &instances),
                e(7, &trail),
                e(8, &vis),
                e(9, &bufs[2]),
            ],
        });
        let finish_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("tracks finish"),
            layout: &self.finish.get_bind_group_layout(0),
            entries: &[e(0, &runs_buf), e(1, &counts), e(2, &args_buf), e(3, &self.mesh_count), e(4, &trail_args)],
        });
        // A mark is a vec4 (x, y, z, time).
        let mark_count = (want[4] / 16) as u32;
        let marks = (mark_count > 0).then(|| {
            let g = device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: Some("tracks marks"),
                layout: &self.marks.get_bind_group_layout(0),
                entries: &[e(0, &self.uniform), e(1, &bufs[4]), e(2, &bufs[5]), e(3, &counts), e(4, &trail)],
            });
            (g, mark_count)
        });
        let bytes = bufs.iter().map(|b| b.size()).sum::<u64>() + runs_buf.size() + counts.size() + 2 * args_bytes + instances.size() + vis.size() + trail.size();
        Store { id, tracks, meshes, run_first, run_room, glyph_first: runs[m * 2], bufs, want, got, counts, args: args_buf, args_init, args_bytes, instances, vis, trail, trail_args, place_group, finish_group, marks, bytes }
    }

    /// A packet's visibility bits, sent only when they change: taken from every packet, the ones
    /// not drawn (an earlier packet of a present, a composite-only frame) too, or they were lost.
    pub fn take_vis(&mut self, queue: &wgpu::Queue, f: &TracksFrame) {
        let (Some(v), Some(s)) = (&f.vis, self.store.as_ref()) else { return };
        if f.id != s.id {
            return;
        }
        let n = (v.len() as u64 * 4).min(s.vis.size()) as usize / 4;
        queue.write_buffer(&s.vis, 0, bytemuck::cast_slice(&v[..n]));
    }

    /// Places every unit for this packet's frame: a compute pass before the scene pass that draws
    /// them. False when the packet has no tracks or the store is not whole here yet.
    pub fn compute(&mut self, queue: &wgpu::Queue, encoder: &mut wgpu::CommandEncoder, f: Option<&TracksFrame>) -> bool {
        self.placed = false;
        self.trails_on = false;
        let (Some(f), Some(s)) = (f, self.store.as_ref()) else { return false };
        if f.id != s.id || !s.whole() {
            return false;
        }
        queue.write_buffer(&self.uniform, 0, bytemuck::cast_slice(&f.uniform));
        // Counters to zero and the draws' instance counts with them, in the encoder: each packet of a
        // present places afresh.
        encoder.clear_buffer(&s.counts, 0, None);
        encoder.copy_buffer_to_buffer(&s.args_init, 0, &s.args, 0, s.args_bytes);
        let mut pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor { label: Some("tracks"), timestamp_writes: None });
        pass.set_pipeline(&self.place);
        pass.set_bind_group(0, &s.place_group, &[]);
        dispatch(&mut pass, s.tracks);
        // The uniform's lanes as `writeTracksUniform` fills them: the marks' seconds (0: their pass
        // does not run), trail seconds, weapons' streak, drop lines.
        let lane = |k: usize| f32::from_bits(f.uniform[k]);
        let mark_seconds = lane(34);
        if let Some((g, n)) = s.marks.as_ref().filter(|_| mark_seconds > 0.0) {
            pass.set_pipeline(&self.marks);
            pass.set_bind_group(0, g, &[]);
            dispatch(&mut pass, *n);
        }
        self.trails_on = lane(32) > 0.0 || lane(33) > 0.0 || mark_seconds > 0.0 || f.uniform[38] != 0;
        pass.set_pipeline(&self.finish);
        pass.set_bind_group(0, &s.finish_group, &[]);
        pass.dispatch_workgroups((s.meshes.len() as u32 + 2).div_ceil(64), 1, 1);
        drop(pass);
        self.placed = true;
        true
    }

    /// The units, inside the scene pass: one indirect instanced draw a mesh whole here, the solid
    /// parts (`see` false) or, after everything solid, the see-through ones.
    pub fn draw(&self, pass: &mut wgpu::RenderPass<'_>, figures: &Figures, group: &wgpu::BindGroup, see: bool) {
        let Some(s) = self.store.as_ref().filter(|_| self.placed) else { return };
        let mut set = false;
        for (i, &id) in s.meshes.iter().enumerate() {
            if s.run_room[i] == 0 {
                continue;
            }
            let Some((mesh, has_see)) = figures.mesh_whole(id) else { continue };
            if see && !has_see {
                continue;
            }
            if !set {
                figures.set_pipeline(pass, see);
                pass.set_bind_group(0, group, &[]);
                set = true;
            }
            pass.set_vertex_buffer(0, mesh.slice(..));
            pass.set_vertex_buffer(1, s.instances.slice(s.run_first[i] as u64 * INSTANCE_STRIDE as u64 * 4..));
            pass.draw_indirect(&s.args, i as u64 * 16);
        }
    }

    /// The trails, drop lines, streaks and marks, inside the scene pass after the units: one
    /// indirect line draw (`drawTrails`), with the scene uniform at `plain` in `ring`.
    pub fn draw_trails(&self, pass: &mut wgpu::RenderPass<'_>, device: &wgpu::Device, ring: &wgpu::Buffer, plain: u64) {
        let Some(s) = self.store.as_ref().filter(|_| self.placed && self.trails_on) else { return };
        let g = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("tracks trail"),
            layout: &self.trail_pipeline.get_bind_group_layout(0),
            entries: &[wgpu::BindGroupEntry { binding: 0, resource: wgpu::BindingResource::Buffer(wgpu::BufferBinding { buffer: ring, offset: plain, size: wgpu::BufferSize::new(crate::figures::SCENE_UNIFORM_BYTES) }) }],
        });
        pass.set_pipeline(&self.trail_pipeline);
        pass.set_bind_group(0, &g, &[]);
        pass.set_vertex_buffer(0, s.trail.slice(..));
        pass.draw_indirect(&s.trail_args, 0);
    }

    /// The far-off glyphs' run (symbols, weapons, decoys), over everything in the scene: one
    /// indirect quad draw with the glyph pipeline (`drawGlyphs`); its count is after the meshes' draws.
    pub fn draw_glyphs(&self, pass: &mut wgpu::RenderPass<'_>, figures: &Figures, group: &wgpu::BindGroup) {
        let Some(s) = self.store.as_ref().filter(|_| self.placed) else { return };
        figures.draw_glyphs_indirect(pass, group, &s.instances, s.glyph_first as u64 * INSTANCE_STRIDE as u64 * 4, &s.args, s.meshes.len() as u64 * 16);
    }
}
