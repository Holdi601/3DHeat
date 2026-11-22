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
//! Not yet (first step): trails and drop lines, the deaths' marks, the glyphs' run. The trail
//! buffer is a stub the uniform gives no room in.

use crate::figures::Figures;
use crate::generated::*;
use crate::packet::TracksFrame;

const W_PLACE: &str = include_str!("../wgsl/tracks_place.wgsl");
const W_FINISH: &str = include_str!("../wgsl/tracks_finish.wgsl");

/// Message kinds (`nativeTracks.ts`).
const BEGIN: u32 = 0;
const SLICE: u32 = 1;
const FREE: u32 = 2;

struct Store {
    id: u32,
    tracks: u32,
    meshes: Vec<u32>,
    run_first: Vec<u32>,
    run_room: Vec<u32>,
    /// tracks (+ aim keys), keysA, keysA1, keysB; the bytes each will hold and has.
    bufs: Vec<wgpu::Buffer>,
    want: [u64; 4],
    got: [u64; 4],
    counts: wgpu::Buffer,
    args: wgpu::Buffer,
    args_init: wgpu::Buffer,
    args_bytes: u64,
    instances: wgpu::Buffer,
    vis: wgpu::Buffer,
    place_group: wgpu::BindGroup,
    finish_group: wgpu::BindGroup,
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
    uniform: wgpu::Buffer,
    mesh_count: wgpu::Buffer,
    trail: wgpu::Buffer,
    trail_args: wgpu::Buffer,
    store: Option<Store>,
    /// Whether this frame placed the units (the scene pass draws them).
    placed: bool,
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

fn words(b: &[u8], k: usize) -> u32 {
    u32::from_le_bytes([b[k * 4], b[k * 4 + 1], b[k * 4 + 2], b[k * 4 + 3]])
}

impl Tracks {
    /// The pipelines, made when the viewport starts (the place shader is the largest the web compiles).
    pub fn new(device: &wgpu::Device) -> Self {
        let place = compute(device, "tracks place", W_PLACE, "place");
        let finish = compute(device, "tracks finish", W_FINISH, "finish");
        let buf = |label: &str, size: u64, usage: wgpu::BufferUsages| device.create_buffer(&wgpu::BufferDescriptor { label: Some(label), size, usage, mapped_at_creation: false });
        let uniform = buf("tracks uniforms", TRACKS_UNIFORM_BYTES as u64, wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST);
        let mesh_count = buf("tracks mesh count", 16, wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST);
        let s = wgpu::BufferUsages::STORAGE;
        let trail = buf("track trails (none yet)", 64, s);
        let trail_args = buf("track trail draw", 16, s);
        Self { place, finish, uniform, mesh_count, trail, trail_args, store: None, placed: false }
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
    }

    /// One `viewport_tracks` message: a store begun, a slice of one of its arrays, or the store let go.
    pub fn message(&mut self, device: &wgpu::Device, queue: &wgpu::Queue, b: &[u8]) -> anyhow::Result<()> {
        anyhow::ensure!(b.len() >= 8 && b.len() % 4 == 0, "tracks message of {} bytes", b.len());
        match words(b, 0) {
            BEGIN => {
                anyhow::ensure!(b.len() >= 9 * 4, "tracks begin");
                let (id, tracks, m, vis_words) = (words(b, 1), words(b, 2), words(b, 3) as usize, words(b, 4) as u64);
                let want = [words(b, 5) as u64, words(b, 6) as u64, words(b, 7) as u64, words(b, 8) as u64];
                let head = 9;
                anyhow::ensure!(b.len() / 4 == head + m + (m + 1) * 2 + (m + 1) * 4, "tracks begin of {} words for {m} meshes", b.len() / 4);
                let all: Vec<u32> = (0..b.len() / 4).map(|k| words(b, k)).collect();
                let meshes = all[head..head + m].to_vec();
                let runs = &all[head + m..head + m + (m + 1) * 2];
                let args = &all[head + m + (m + 1) * 2..];
                let run_first: Vec<u32> = (0..m).map(|i| runs[i * 2]).collect();
                let run_room: Vec<u32> = (0..m).map(|i| runs[i * 2 + 1]).collect();
                let total = runs[m * 2] as u64 + runs[m * 2 + 1] as u64;
                self.store = None;
                self.store = Some(self.make(device, queue, id, tracks, meshes, run_first, run_room, runs, args, want, vis_words, total));
            }
            SLICE => {
                anyhow::ensure!(b.len() >= 16, "tracks slice");
                let (id, which, at) = (words(b, 1), words(b, 2) as usize, words(b, 3) as u64);
                let Some(s) = self.store.as_mut().filter(|s| s.id == id) else { return Ok(()) };
                let data = &b[16..];
                anyhow::ensure!(which < 4 && at + data.len() as u64 <= s.want[which], "tracks slice out of bounds");
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
        want: [u64; 4],
        vis_words: u64,
        total: u64,
    ) -> Store {
        let s = wgpu::BufferUsages::STORAGE;
        let dst = wgpu::BufferUsages::COPY_DST;
        let buf = |label: &str, size: u64, usage: wgpu::BufferUsages| {
            device.create_buffer(&wgpu::BufferDescriptor { label: Some(label), size: size.max(16).next_multiple_of(4), usage, mapped_at_creation: false })
        };
        let bufs: Vec<wgpu::Buffer> = ["tracks", "track keys", "track keys (2)", "track attitudes"].iter().zip(want).map(|(l, n)| buf(l, n, s | dst)).collect();
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
        queue.write_buffer(&self.mesh_count, 0, bytemuck::cast_slice(&[m as u32, 0, 0, 0]));
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
                e(7, &self.trail),
                e(8, &vis),
                e(9, &bufs[2]),
            ],
        });
        let finish_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("tracks finish"),
            layout: &self.finish.get_bind_group_layout(0),
            entries: &[e(0, &runs_buf), e(1, &counts), e(2, &args_buf), e(3, &self.mesh_count), e(4, &self.trail_args)],
        });
        let bytes = bufs.iter().map(|b| b.size()).sum::<u64>() + runs_buf.size() + counts.size() + 2 * args_bytes + instances.size() + vis.size();
        Store { id, tracks, meshes, run_first, run_room, bufs, want, got: [0; 4], counts, args: args_buf, args_init, args_bytes, instances, vis, place_group, finish_group, bytes }
    }

    /// Places every unit for this packet's frame: a compute pass before the scene pass that draws
    /// them. False when the packet has no tracks or the store is not whole here yet.
    pub fn compute(&mut self, queue: &wgpu::Queue, encoder: &mut wgpu::CommandEncoder, f: Option<&TracksFrame>) -> bool {
        self.placed = false;
        let (Some(f), Some(s)) = (f, self.store.as_ref()) else { return false };
        if f.id != s.id || !s.whole() {
            return false;
        }
        queue.write_buffer(&self.uniform, 0, bytemuck::cast_slice(&f.uniform));
        if let Some(v) = &f.vis {
            let n = (v.len() as u64 * 4).min(s.vis.size()) as usize / 4;
            queue.write_buffer(&s.vis, 0, bytemuck::cast_slice(&v[..n]));
        }
        // Counters to zero and the draws' instance counts with them, in the encoder: each packet of a
        // present places afresh.
        encoder.clear_buffer(&s.counts, 0, None);
        encoder.copy_buffer_to_buffer(&s.args_init, 0, &s.args, 0, s.args_bytes);
        let mut pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor { label: Some("tracks"), timestamp_writes: None });
        pass.set_pipeline(&self.place);
        pass.set_bind_group(0, &s.place_group, &[]);
        dispatch(&mut pass, s.tracks);
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
}
