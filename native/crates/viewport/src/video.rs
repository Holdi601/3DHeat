//! Members' views for the video fallback (Stage 8), on the viewport's thread:
//! each drawn from the host page's last packet with the member's camera
//! (`renderer::member_view`), turned into NV12 by a compute pass (BT.601,
//! limited range: what the encoders take) and read back through a ring of
//! three buffers mapped asynchronously - the thread never waits on the GPU
//! for them; a view whose buffers are all still in flight skips its turn. A
//! small thread polls the device while a read-back is in flight, and the
//! picture goes to its stream from the map's callback, so a frame does not
//! wait for the host's next frame to be handed on.
//!
//! Budget: a member's view is drawn right after a host frame was presented
//! (in the gap before the next one), the most overdue view first, each at its
//! own rate (at most the role's, lowered by its link). While the page draws,
//! a governor sets how many views fit between two host frames: one every
//! second frame to start, up to two while the host's frames keep their pace,
//! halved (down to one every four frames) when a host frame came 30 %
//! late after a member's view was drawn - the host's own frames come first
//! (the no-frame-drops rule); late even at the fewest, the members' pictures
//! get smaller (down to half their size), and only then is a new view refused
//! (`saturated`). A view following the host (a stream shared by everyone who
//! follows it) draws the host's own camera in the host's shape. The
//! conversion pipeline compiles on a thread of its own. The
//! host's present intervals are kept so the streams' cost on its frames can
//! be told (`host_frames`). `HEAT3D_VIDEO_TRACE` set: a line every 5 s.

use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};

use crate::renderer::member_view::{MemberCamera, ViewState};
use crate::renderer::Renderer;

/// One member's picture, NV12.
pub struct VideoFrame {
    pub width: u32,
    pub height: u32,
    pub nv12: Vec<u8>,
    pub seq: u32,
    pub sent_ms: f64,
    pub drawn: Instant,
    /// From the draw's start to the bytes being read back.
    pub render_ms: f32,
}

pub type VideoSink = Arc<dyn Fn(VideoFrame) + Send + Sync>;

const CONVERT: &str = r#"
@group(0) @binding(0) var src: texture_2d<f32>;
@group(0) @binding(1) var<storage, read_write> dst: array<u32>;
struct P { w: u32, h: u32, _a: u32, _b: u32 }
@group(0) @binding(2) var<uniform> p: P;

fn luma(c: vec3f) -> u32 { return u32(clamp(round(16.0 + 65.481 * c.r + 128.553 * c.g + 24.966 * c.b), 0.0, 255.0)); }

// One invocation: a 4 x 2 block - two words of Y (four pixels each row) and one word of UV
// (two chroma samples, each the mean of a 2 x 2 square).
@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) g: vec3u) {
    let x0 = g.x * 4u;
    let y0 = g.y * 2u;
    if (x0 >= p.w || y0 >= p.h) { return; }
    var uv: u32 = 0u;
    var acc0 = vec3f(0.0);
    var acc1 = vec3f(0.0);
    for (var row = 0u; row < 2u; row++) {
        var word: u32 = 0u;
        for (var i = 0u; i < 4u; i++) {
            let c = textureLoad(src, vec2u(x0 + i, y0 + row), 0).rgb;
            word = word | (luma(c) << (8u * i));
            if (i < 2u) { acc0 += c; } else { acc1 += c; }
        }
        dst[((y0 + row) * p.w + x0) / 4u] = word;
    }
    for (var k = 0u; k < 2u; k++) {
        let c = select(acc1, acc0, k == 0u) * 0.25;
        let u = u32(clamp(round(128.0 - 37.797 * c.r - 74.203 * c.g + 112.0 * c.b), 0.0, 255.0));
        let v = u32(clamp(round(128.0 + 112.0 * c.r - 93.786 * c.g - 18.214 * c.b), 0.0, 255.0));
        uv = uv | (u << (16u * k)) | (v << (16u * k + 8u));
    }
    dst[(p.w * p.h + g.y * p.w + x0) / 4u] = uv;
}
"#;

struct Slot {
    buf: wgpu::Buffer,
    /// Drawn into and not yet handed on (or failed).
    busy: Arc<AtomicBool>,
}

struct View {
    id: u64,
    cam: MemberCamera,
    seq: u32,
    sent_ms: f64,
    fps: u32,
    due: Instant,
    sink: VideoSink,
    state: ViewState,
    target: Option<(wgpu::Texture, wgpu::TextureView, wgpu::Buffer, wgpu::BindGroup, (u32, u32))>,
    slots: Vec<Slot>,
}

/// The thread that polls the device while read-backs are in flight.
struct Poller {
    inflight: Arc<AtomicUsize>,
    stop: Arc<AtomicBool>,
    thread: std::thread::Thread,
}

impl Drop for Poller {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::Release);
        self.thread.unpark();
    }
}

pub struct Videos {
    views: Vec<View>,
    pipe: Option<(wgpu::ComputePipeline, wgpu::BindGroupLayout, wgpu::Buffer)>,
    /// The conversion pipeline being built on a thread of its own: its compile never lands on a host frame.
    pipe_building: Option<std::sync::mpsc::Receiver<(wgpu::ComputePipeline, wgpu::BindGroupLayout, wgpu::Buffer)>>,
    poller: Option<Poller>,
    last_present: Option<Instant>,
    intervals: Vec<f32>,
    /// Member views that fit between two host frames while the page draws (the governor).
    allow: f32,
    credit: f32,
    /// A member's view was drawn since the last host present.
    drew_since_present: bool,
    /// The host's usual frame interval (median of the last ones), ms.
    nominal: f32,
    /// The members' pictures' size, lowered (to half) when even the fewest views a frame make
    /// the host late, raised again while it keeps its pace: smaller pictures before refusals.
    scale: f32,
    scale_at: Instant,
    pub drawn: u64,
    pub skipped: u64,
    pub held_back: u64,
    trace: Option<(Instant, Vec<f32>)>,
}

impl Default for Videos {
    fn default() -> Self {
        Self {
            views: Vec::new(),
            pipe: None,
            pipe_building: None,
            poller: None,
            last_present: None,
            intervals: Vec::new(),
            allow: 0.5,
            credit: 0.5,
            drew_since_present: false,
            nominal: 0.0,
            scale: 1.0,
            scale_at: Instant::now(),
            drawn: 0,
            skipped: 0,
            held_back: 0,
            trace: std::env::var_os("HEAT3D_VIDEO_TRACE").map(|_| (Instant::now(), Vec::new())),
        }
    }
}

/// Fewest and most member views between two host frames while the page draws.
const ALLOW_MIN: f32 = 0.25;
const ALLOW_MAX: f32 = 2.0;
/// A host frame this much over its usual interval counts as late.
const LATE: f32 = 1.3;
/// The smallest the members' pictures get (of their size) before new views are refused.
const SCALE_MIN: f32 = 0.5;

impl Videos {
    pub fn open(&mut self, id: u64, cam: MemberCamera, seq: u32, sent_ms: f64, fps: u32, sink: VideoSink) {
        self.close(id);
        self.views.push(View { id, cam, seq, sent_ms, fps: fps.clamp(1, 120), due: Instant::now(), sink, state: ViewState::default(), target: None, slots: Vec::new() });
    }

    pub fn camera(&mut self, id: u64, cam: MemberCamera, seq: u32, sent_ms: f64) {
        if let Some(v) = self.views.iter_mut().find(|v| v.id == id) {
            v.cam = cam;
            v.seq = seq;
            v.sent_ms = sent_ms;
            // A moved camera is drawn at once (within the rate), not at the next tick of the clock.
            v.due = v.due.min(Instant::now());
        }
    }

    pub fn fps(&mut self, id: u64, fps: u32) {
        if let Some(v) = self.views.iter_mut().find(|v| v.id == id) {
            v.fps = fps.clamp(1, 120);
        }
    }

    pub fn close(&mut self, id: u64) {
        self.views.retain(|v| v.id != id);
        if self.views.is_empty() {
            self.poller = None;
        }
    }

    pub fn active(&self) -> bool {
        !self.views.is_empty()
    }

    /// No room for another view: the fewest views a frame at the smallest pictures still make the host late.
    pub fn saturated(&self) -> bool {
        self.allow <= ALLOW_MIN * 1.5 && self.scale <= SCALE_MIN + 0.01
    }

    /// How the members' pictures are drawn now: (views a host frame, size factor).
    pub fn budget(&self) -> (f32, f32) {
        (self.allow, self.scale)
    }

    /// How long the thread may wait for messages before a view is due.
    pub fn wait(&self) -> Option<Duration> {
        let now = Instant::now();
        self.views.iter().map(|v| v.due.saturating_duration_since(now)).min()
    }

    /// The host frame was presented: its interval counts for the governor and the measurements.
    pub fn host_presented(&mut self) {
        let now = Instant::now();
        if let Some(p) = self.last_present {
            let dt = (now - p).as_secs_f32() * 1e3;
            if self.intervals.len() >= 600 {
                self.intervals.drain(..300);
            }
            self.intervals.push(dt);
            if self.intervals.len() % 30 == 0 || self.nominal == 0.0 {
                let mut s = self.intervals[self.intervals.len().saturating_sub(120)..].to_vec();
                s.sort_by(|a, b| a.total_cmp(b));
                self.nominal = s[s.len() / 2];
            }
            // Late after a member's view was drawn (30 % over its pace: past the page's own jitter,
            // before a frame is missed): fewer views until the host keeps its pace again.
            if self.drew_since_present && self.nominal > 0.0 && dt > self.nominal * LATE {
                if self.allow <= ALLOW_MIN && self.scale > SCALE_MIN && self.scale_at.elapsed() > Duration::from_secs(2) {
                    self.scale = (self.scale * 0.85).max(SCALE_MIN);
                    self.scale_at = Instant::now();
                }
                self.allow = (self.allow * 0.5).max(ALLOW_MIN);
                self.credit = self.credit.min(0.0) - 2.0;
            } else {
                self.allow = (self.allow + 0.01).min(ALLOW_MAX);
                if self.allow >= 1.0 && self.scale < 1.0 && self.scale_at.elapsed() > Duration::from_secs(4) {
                    self.scale = (self.scale + 0.1).min(1.0);
                    self.scale_at = Instant::now();
                }
            }
            self.credit = (self.credit + self.allow).min(ALLOW_MAX);
        }
        self.drew_since_present = false;
        self.last_present = Some(now);
    }

    /// p50, p99 and max of the host's present intervals over the last ~5-10 s.
    pub fn host_frames(&self) -> Option<(f32, f32, f32)> {
        if self.intervals.len() < 10 {
            return None;
        }
        let mut s = self.intervals.clone();
        s.sort_by(|a, b| a.total_cmp(b));
        let at = |p: f32| s[((s.len() - 1) as f32 * p).round() as usize];
        Some((at(0.5), at(0.99), at(1.0)))
    }

    /// Draws the views that are due, the most overdue first (`host_active`: the page is drawing,
    /// so as many as the governor lets fit before the next host frame; else up to two).
    pub fn tick(&mut self, r: &mut Renderer, host_active: bool) {
        if self.views.is_empty() {
            return;
        }
        self.ensure_poller(&r.device);
        let now = Instant::now();
        let mut order: Vec<usize> = (0..self.views.len()).filter(|&i| self.views[i].due <= now).collect();
        order.sort_by_key(|&i| self.views[i].due);
        let mut done = 0;
        for i in order {
            if host_active {
                if self.credit < 1.0 {
                    self.held_back += 1;
                    break;
                }
            } else if done >= 2 {
                break;
            }
            let period = Duration::from_secs_f64(1.0 / self.views[i].fps as f64);
            self.views[i].due = (self.views[i].due + period).max(now);
            let t0 = Instant::now();
            if self.draw(r, i) {
                done += 1;
                self.drawn += 1;
                if host_active {
                    self.credit -= 1.0;
                    self.drew_since_present = true;
                }
                if let Some((_, cpu)) = self.trace.as_mut() {
                    cpu.push(t0.elapsed().as_secs_f32() * 1e3);
                }
            } else {
                self.skipped += 1;
            }
        }
        self.trace_line();
    }

    fn trace_line(&mut self) {
        let hf = self.host_frames().unwrap_or_default();
        let Some((at, cpu)) = self.trace.as_mut() else { return };
        if at.elapsed() < Duration::from_secs(5) {
            return;
        }
        cpu.sort_by(|a, b| a.total_cmp(b));
        let q = |p: f32| cpu.get(((cpu.len().max(1) - 1) as f32 * p) as usize).copied().unwrap_or(0.0);
        let line = format!(
            "video: {} views, drawn {} skipped {} held back {}, allow {:.2}, member draw cpu p50/max {:.2}/{:.2} ms, host p50/p99/max {:.1}/{:.1}/{:.1} ms",
            self.views.len(),
            self.drawn,
            self.skipped,
            self.held_back,
            self.allow,
            q(0.5),
            q(1.0),
            hf.0,
            hf.1,
            hf.2
        );
        *at = Instant::now();
        cpu.clear();
        crate::note(&line);
    }

    fn ensure_poller(&mut self, device: &wgpu::Device) {
        if self.poller.is_some() {
            return;
        }
        let inflight = Arc::new(AtomicUsize::new(0));
        let stop = Arc::new(AtomicBool::new(false));
        let (n, s, d) = (inflight.clone(), stop.clone(), device.clone());
        let spawned = std::thread::Builder::new().name("video read-back".into()).spawn(move || {
            while !s.load(Ordering::Acquire) {
                if n.load(Ordering::Acquire) > 0 {
                    let _ = d.poll(wgpu::PollType::Poll);
                    std::thread::sleep(Duration::from_millis(1));
                } else {
                    std::thread::park_timeout(Duration::from_millis(50));
                }
            }
        });
        if let Ok(h) = spawned {
            self.poller = Some(Poller { inflight, stop, thread: h.thread().clone() });
        }
    }

    /// Draws view `i` and starts its read-back; false when it had to skip (nothing drawn yet, or
    /// every buffer still in flight).
    fn draw(&mut self, r: &mut Renderer, i: usize) -> bool {
        let mut cam = self.views[i].cam;
        if cam.follow_host {
            // The host's picture, its shape kept within the stream's size.
            let (hw, hh) = r.last_size;
            if hw < 8 || hh < 2 {
                return false;
            }
            let s = (cam.width as f64 / hw as f64).min(cam.height as f64 / hh as f64).min(1.0);
            cam.width = ((hw as f64 * s) as u32).max(64) / 8 * 8;
            cam.height = ((hh as f64 * s) as u32).max(64) / 2 * 2;
        }
        if self.scale < 1.0 {
            cam.width = ((cam.width as f32 * self.scale) as u32).max(64) / 8 * 8;
            cam.height = ((cam.height as f32 * self.scale) as u32).max(64) / 2 * 2;
        }
        let (w, h) = (cam.width, cam.height);
        if w < 8 || h < 2 || w % 8 != 0 || h % 2 != 0 {
            return false;
        }
        let Some(p) = r.member_packet(&cam) else { return false };
        let bytes = (w * h * 3 / 2) as u64;
        let device = r.device.clone();
        if self.pipe.is_none() {
            if self.pipe_building.is_none() {
                let (tx, rx) = std::sync::mpsc::channel();
                let d = device.clone();
                let _ = std::thread::Builder::new().name("video nv12 pipeline".into()).spawn(move || {
                    let m = d.create_shader_module(wgpu::ShaderModuleDescriptor { label: Some("nv12"), source: wgpu::ShaderSource::Wgsl(CONVERT.into()) });
                    // The layout from the shader itself, as the renderer's compute pipelines have it.
                    let pipe = d.create_compute_pipeline(&wgpu::ComputePipelineDescriptor { label: Some("nv12"), layout: None, module: &m, entry_point: Some("main"), compilation_options: Default::default(), cache: None });
                    let layout = pipe.get_bind_group_layout(0);
                    let uni = d.create_buffer(&wgpu::BufferDescriptor { label: Some("nv12 size"), size: 16, usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST, mapped_at_creation: false });
                    let _ = tx.send((pipe, layout, uni));
                });
                self.pipe_building = Some(rx);
            }
            match self.pipe_building.as_ref().map(|rx| rx.try_recv()) {
                Some(Ok(p)) => {
                    self.pipe = Some(p);
                    self.pipe_building = None;
                }
                Some(Err(std::sync::mpsc::TryRecvError::Disconnected)) => {
                    self.pipe_building = None;
                    return false;
                }
                _ => return false,
            }
        }
        let v = &mut self.views[i];
        if v.target.as_ref().is_none_or(|t| t.4 != (w, h)) {
            let (pipe_layout, uni) = {
                let p = self.pipe.as_ref().unwrap();
                (&p.1, &p.2)
            };
            let tex = device.create_texture(&wgpu::TextureDescriptor {
                label: Some("member view"),
                size: wgpu::Extent3d { width: w, height: h, depth_or_array_layers: 1 },
                mip_level_count: 1,
                sample_count: 1,
                dimension: wgpu::TextureDimension::D2,
                format: r.out_format,
                usage: wgpu::TextureUsages::RENDER_ATTACHMENT | wgpu::TextureUsages::TEXTURE_BINDING,
                view_formats: &[],
            });
            let view = tex.create_view(&Default::default());
            let nv12 = device.create_buffer(&wgpu::BufferDescriptor { label: Some("member nv12"), size: bytes, usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_SRC, mapped_at_creation: false });
            let group = device.create_bind_group(&wgpu::BindGroupDescriptor {
                label: Some("nv12"),
                layout: pipe_layout,
                entries: &[
                    wgpu::BindGroupEntry { binding: 0, resource: wgpu::BindingResource::TextureView(&view) },
                    wgpu::BindGroupEntry { binding: 1, resource: nv12.as_entire_binding() },
                    wgpu::BindGroupEntry { binding: 2, resource: uni.as_entire_binding() },
                ],
            });
            v.target = Some((tex, view, nv12, group, (w, h)));
        }
        // Buffers of another size go once they are back.
        v.slots.retain(|s| s.busy.load(Ordering::Acquire) || s.buf.size() == bytes);
        // A free read-back buffer of this size, or a new one (three at most).
        let slot = match v.slots.iter().position(|s| !s.busy.load(Ordering::Acquire) && s.buf.size() == bytes) {
            Some(k) => k,
            None if v.slots.len() < 3 => {
                let buf = device.create_buffer(&wgpu::BufferDescriptor { label: Some("member read-back"), size: bytes, usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST, mapped_at_creation: false });
                v.slots.push(Slot { buf, busy: Arc::new(AtomicBool::new(false)) });
                v.slots.len() - 1
            }
            None => return false,
        };
        let t0 = Instant::now();
        let (_, view, nv12, group, _) = v.target.as_ref().unwrap();
        r.draw_member(&mut v.state, &p, view, (w, h));
        let (pipe, _, uni) = self.pipe.as_ref().unwrap();
        r.queue.write_buffer(uni, 0, bytemuck::cast_slice(&[w, h, 0u32, 0u32]));
        let mut enc = device.create_command_encoder(&wgpu::CommandEncoderDescriptor { label: Some("member nv12") });
        {
            let mut pass = enc.begin_compute_pass(&wgpu::ComputePassDescriptor { label: Some("nv12"), timestamp_writes: None });
            pass.set_pipeline(pipe);
            pass.set_bind_group(0, group, &[]);
            pass.dispatch_workgroups((w / 4).div_ceil(8), (h / 2).div_ceil(8), 1);
        }
        let s = &v.slots[slot];
        enc.copy_buffer_to_buffer(nv12, 0, &s.buf, 0, bytes);
        r.queue.submit(Some(enc.finish()));
        s.busy.store(true, Ordering::Release);
        // Handed on from the map's callback (on the polling thread, or the viewport's own poll).
        let (busy, buf, sink, seq, sent_ms) = (s.busy.clone(), s.buf.clone(), v.sink.clone(), v.seq, v.sent_ms);
        let inflight = self.poller.as_ref().map(|p| p.inflight.clone());
        if let Some(p) = &self.poller {
            p.inflight.fetch_add(1, Ordering::AcqRel);
            p.thread.unpark();
        }
        s.buf.slice(..bytes).map_async(wgpu::MapMode::Read, move |res| {
            if res.is_ok() {
                let nv12 = match buf.slice(..bytes).get_mapped_range() {
                    Ok(m) => m.to_vec(),
                    Err(_) => Vec::new(),
                };
                buf.unmap();
                if !nv12.is_empty() {
                    sink(VideoFrame { width: w, height: h, nv12, seq, sent_ms, drawn: t0, render_ms: t0.elapsed().as_secs_f32() * 1e3 });
                }
            }
            busy.store(false, Ordering::Release);
            if let Some(n) = inflight {
                n.fetch_sub(1, Ordering::AcqRel);
            }
        });
        true
    }
}
