//! The viewport in a window: a thread of its own that owns the renderer and the
//! surface, fed by messages from the app (frames from the page, the dataset,
//! the level, resizes, read-backs).
//!
//! The page drives it: each of the page's frames sends one packet, and the
//! thread draws whatever packets have come since its last present (each one's
//! heat pass in order, so accumulation is the page's), then presents once.

use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::mpsc::{channel, Receiver, RecvTimeoutError, Sender};
use std::sync::Arc;
use std::thread::JoinHandle;
use std::time::Duration;

use heat3d_core::dataset::Dataset;
use parking_lot::Mutex;

use crate::loader::{self, PageChunk};
use crate::packet::{self, Packet};
use crate::renderer::{Captured, GpuChunk, LevelMesh, Renderer};

type Reply<T> = Box<dyn FnOnce(T) + Send>;

pub enum Msg {
    Packet(Vec<u8>),
    Resize(u32, u32),
    /// A dataset the core built (rows straight from it), or none; `rows` all of them, `budget` GPU bytes for rows.
    CoreDataset {
        ds: Option<Arc<Dataset>>,
        budget: u64,
        /// The page's count of datasets, echoed in the snapshot (`dataGen`): a snapshot from
        /// before this one says nothing about its rows.
        gen: u32,
    },
    /// A load the page built: its chunks follow as `PageChunk`s.
    PageDataset {
        rows: u64,
        has_time: bool,
        budget: u64,
        gen: u32,
    },
    PageChunk(Vec<u8>),
    /// One chunk's rows of a filter column the page holds (a load the page built).
    PageColumn(Vec<u8>),
    /// One chunk's per-row data for the heat modes (`heatmodes::RowData`).
    Rows(Vec<u8>),
    Level(Option<LevelMesh>),
    Capture(Reply<Option<Captured>>),
    /// The heat field once the page's packet `after` (its sequence number) is drawn.
    ReadHeat(usize, u32, Reply<Option<Vec<f32>>>),
    /// The heat under a canvas pixel.
    Probe(f32, f32, Reply<Option<f32>>),
    /// A slice of a figure mesh (`Figures::mesh_slice`).
    Mesh(Vec<u8>),
    /// The glyph atlas (`Figures::set_atlas`).
    Glyphs(Vec<u8>),
    Times(Reply<String>),
    Hide(bool),
    Stop,
    // Internal: from the loader threads.
    Chunk(u64, GpuChunk),
    Column(u64, usize, String, Option<wgpu::Buffer>),
    Dropped(u64, u64),
}

/// What the page reads back after each frame, without a round trip to the thread.
#[derive(Default, Clone)]
pub struct Snapshot {
    pub json: String,
}

pub struct Viewport {
    tx: Sender<Msg>,
    thread: Option<JoinHandle<()>>,
    pub snapshot: Arc<Mutex<Snapshot>>,
    pub info: String,
}

/// How a surface for the window is made on an instance (called per backend tried).
pub type MakeSurface = Box<dyn Fn(&wgpu::Instance) -> anyhow::Result<wgpu::Surface<'static>> + Send>;

/// Backends in the order tried: `WGPU_BACKEND` when set, else Vulkan, then DX12 on Windows.
fn backends() -> Vec<wgpu::Backends> {
    if let Some(b) = wgpu::Backends::from_env().filter(|b| !b.is_empty()) {
        return vec![b];
    }
    let mut v = vec![wgpu::Backends::VULKAN];
    if cfg!(windows) {
        v.push(wgpu::Backends::DX12);
    }
    v
}

/// An adapter for `surface` (or none), Vulkan first.
pub fn adapter(make: Option<&MakeSurface>) -> anyhow::Result<(wgpu::Instance, wgpu::Adapter, Option<wgpu::Surface<'static>>)> {
    let mut last = anyhow::anyhow!("no GPU adapter");
    for b in backends() {
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor { backends: b, ..wgpu::InstanceDescriptor::new_without_display_handle_from_env() });
        let surface = match make.map(|m| m(&instance)) {
            Some(Ok(s)) => Some(s),
            Some(Err(e)) => {
                last = e;
                continue;
            }
            None => None,
        };
        match pollster::block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
            power_preference: wgpu::PowerPreference::HighPerformance,
            compatible_surface: surface.as_ref(),
            force_fallback_adapter: false,
            // The card's own limits, not rounded down to a bucket: one binding per chunk wants all of it.
            apply_limit_buckets: false,
        })) {
            Ok(a) => return Ok((instance, a, surface)),
            Err(e) => last = e.into(),
        }
    }
    Err(last)
}

impl Viewport {
    pub fn start(make: MakeSurface, size: (u32, u32)) -> anyhow::Result<Self> {
        let (tx, rx) = channel::<Msg>();
        let snapshot = Arc::new(Mutex::new(Snapshot::default()));
        let (ready_tx, ready_rx) = channel::<anyhow::Result<String>>();
        let snap = snapshot.clone();
        let self_tx = tx.clone();
        let thread = std::thread::Builder::new().name("viewport".into()).spawn(move || {
            let (_instance, adapter, surface) = match adapter(Some(&make)) {
                Ok(x) => x,
                Err(e) => {
                    let _ = ready_tx.send(Err(e));
                    return;
                }
            };
            let surface = surface.expect("a surface");
            let caps = surface.get_capabilities(&adapter);
            let format = caps.formats.iter().copied().find(|f| !f.is_srgb()).unwrap_or(caps.formats[0]);
            let renderer = match Renderer::new(&adapter, format) {
                Ok(r) => r,
                Err(e) => {
                    let _ = ready_tx.send(Err(e));
                    return;
                }
            };
            // Premultiplied alpha where the compositor offers it (a Wayland subsurface); opaque otherwise.
            let alpha = caps.alpha_modes.first().copied().unwrap_or(wgpu::CompositeAlphaMode::Auto);
            let config = wgpu::SurfaceConfiguration {
                usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
                format,
                width: size.0.max(1),
                height: size.1.max(1),
                // Mailbox where offered: each of the page's frames is presented as it comes and the
                // compositor shows the newest at its refresh, so the page's clock paces the view
                // and nothing waits on a vsync of its own. Fifo otherwise (a present every refresh,
                // see `run`). `HEAT3D_VIEWPORT_PRESENT` = fifo | immediate and
                // `HEAT3D_VIEWPORT_LATENCY` = frames queued, for measuring the alternatives.
                present_mode: match std::env::var("HEAT3D_VIEWPORT_PRESENT").as_deref() {
                    Ok("fifo") => wgpu::PresentMode::Fifo,
                    Ok("immediate") if caps.present_modes.contains(&wgpu::PresentMode::Immediate) => wgpu::PresentMode::Immediate,
                    _ if caps.present_modes.contains(&wgpu::PresentMode::Mailbox) => wgpu::PresentMode::Mailbox,
                    _ => wgpu::PresentMode::Fifo,
                },
                desired_maximum_frame_latency: std::env::var("HEAT3D_VIEWPORT_LATENCY").ok().and_then(|v| v.parse().ok()).unwrap_or(2),
                alpha_mode: alpha,
                color_space: wgpu::SurfaceColorSpace::Auto,
                view_formats: vec![],
            };
            surface.configure(&renderer.device, &config);
            let info = format!("{} ({:?}, {:?}, heat {})", renderer.info.name, renderer.info.backend, format, if renderer.heat_precision_f32() { "f32" } else { "f16" });
            let _ = ready_tx.send(Ok(info));
            run(renderer, surface, config, rx, self_tx, snap);
        })?;
        let info = ready_rx.recv().map_err(|_| anyhow::anyhow!("the viewport thread stopped"))??;
        Ok(Self { tx, thread: Some(thread), snapshot, info })
    }

    pub fn send(&self, m: Msg) {
        let _ = self.tx.send(m);
    }
}

impl Drop for Viewport {
    fn drop(&mut self) {
        let _ = self.tx.send(Msg::Stop);
        if let Some(t) = self.thread.take() {
            let _ = t.join();
        }
    }
}

struct Data {
    generation: Arc<AtomicU64>,
    core: Option<Arc<Dataset>>,
    fetching: Arc<AtomicBool>,
    /// The page's dataset count (`Msg::CoreDataset::gen`).
    page_gen: u32,
}

fn run(mut r: Renderer, surface: wgpu::Surface<'static>, mut config: wgpu::SurfaceConfiguration, rx: Receiver<Msg>, tx: Sender<Msg>, snap: Arc<Mutex<Snapshot>>) {
    let fifo = config.present_mode == wgpu::PresentMode::Fifo;
    let mut data = Data { generation: Arc::new(AtomicU64::new(0)), core: None, fetching: Arc::new(AtomicBool::new(false)), page_gen: 0 };
    let mut hidden = false;
    let mut dirty = true;
    // While the page sends frames, a present every display refresh (Fifo paces it): a refresh no
    // packet reached shows the last picture again rather than skipping, so the display's cadence
    // is the viewport's and not the beat between the page's clock and the display's.
    let mut active_until = std::time::Instant::now();
    // Where a frame goes that the surface does not take this time (`CurrentSurfaceTexture::Occluded`).
    let mut offscreen: Option<(wgpu::Texture, wgpu::TextureView, (u32, u32))> = None;
    loop {
        let active = std::time::Instant::now() < active_until;
        let first = if active {
            match rx.try_recv() {
                Ok(m) => Some(m),
                Err(std::sync::mpsc::TryRecvError::Empty) => None,
                Err(std::sync::mpsc::TryRecvError::Disconnected) => return,
            }
        } else {
            match rx.recv_timeout(Duration::from_millis(50)) {
                Ok(m) => Some(m),
                Err(RecvTimeoutError::Timeout) => None,
                Err(RecvTimeoutError::Disconnected) => return,
            }
        };
        let mut packets: Vec<Packet> = Vec::new();
        let mut want_capture = false;
        for m in first.into_iter().chain(rx.try_iter()) {
            match m {
                Msg::Stop => return,
                Msg::Packet(bytes) => match packet::decode(&bytes) {
                    Ok(p) => packets.push(p),
                    Err(e) => eprintln!("viewport: {e:#}"),
                },
                Msg::Resize(w, h) => {
                    if w > 0 && h > 0 && (w, h) != (config.width, config.height) {
                        config.width = w;
                        config.height = h;
                        surface.configure(&r.device, &config);
                        dirty = true;
                    }
                }
                Msg::Hide(h) => {
                    hidden = h;
                    dirty = true;
                }
                Msg::CoreDataset { ds, budget, gen: page_gen } => {
                    data.page_gen = page_gen;
                    let gen = data.generation.fetch_add(1, Ordering::SeqCst) + 1;
                    r.clear_dataset(ds.as_ref().is_some_and(|d| loader::has_times(d)));
                    data.core = ds.clone();
                    if let Some(ds) = ds {
                        let (device, tx, g) = (r.device.clone(), tx.clone(), data.generation.clone());
                        std::thread::Builder::new()
                            .name("viewport chunks".into())
                            .spawn(move || {
                                let mut used = 0u64;
                                let mut dropped = 0u64;
                                for i in 0..ds.chunks.len() {
                                    if g.load(Ordering::SeqCst) != gen {
                                        return;
                                    }
                                    let rows = ds.chunks[i].rows as u64;
                                    let bytes = rows * if loader::has_times(&ds) { 12 } else { 8 };
                                    if used + bytes > budget {
                                        dropped += rows;
                                        continue;
                                    }
                                    match loader::upload_chunk(&device, &ds, i) {
                                        Ok(c) => {
                                            used += bytes;
                                            let _ = tx.send(Msg::Chunk(gen, c));
                                        }
                                        Err(e) => {
                                            eprintln!("viewport: chunk {i}: {e:#}");
                                            dropped += rows;
                                        }
                                    }
                                }
                                let _ = tx.send(Msg::Dropped(gen, dropped));
                            })
                            .ok();
                    }
                    dirty = true;
                }
                Msg::PageDataset { has_time, gen, .. } => {
                    data.page_gen = gen;
                    data.generation.fetch_add(1, Ordering::SeqCst);
                    data.core = None;
                    r.clear_dataset(has_time);
                    dirty = true;
                }
                Msg::PageChunk(bytes) => match PageChunk::parse(&bytes) {
                    Ok(c) => {
                        let c = c.upload(&r.device);
                        r.add_chunk(c);
                    }
                    Err(e) => eprintln!("viewport: {e:#}"),
                },
                Msg::Rows(bytes) => match {
                    // Counted whatever they hold: the page waits until every one it sent is taken.
                    r.modes.taken += 1;
                    crate::heatmodes::RowData::parse(&bytes)
                } {
                    // Rows of an older dataset say nothing about this one's.
                    Ok(rows) if rows.gen == data.page_gen => {
                        r.modes.put(&r.device, &r.queue, rows);
                        dirty = true;
                    }
                    Ok(_) => {}
                    Err(e) => eprintln!("viewport: {e:#}"),
                },
                Msg::PageColumn(bytes) => match loader::page_column(&r.device, &bytes) {
                    Ok((chunk, name, Some(buf))) => {
                        r.add_column(chunk, name, buf);
                        r.columns_settled();
                        // Composited again so the counters (filtersPending) follow.
                        dirty = true;
                    }
                    Ok((chunk, name, None)) => {
                        r.column_failed(chunk, &name);
                        dirty = true;
                    }
                    Err(e) => eprintln!("viewport: {e:#}"),
                },
                Msg::Chunk(gen, c) => {
                    if gen == data.generation.load(Ordering::SeqCst) {
                        r.add_chunk(c);
                        dirty = true;
                    }
                }
                Msg::Dropped(gen, n) => {
                    if gen == data.generation.load(Ordering::SeqCst) {
                        r.dropped_rows = n;
                    }
                }
                Msg::Column(gen, chunk, name, buf) => {
                    if gen == data.generation.load(Ordering::SeqCst) {
                        match buf {
                            Some(b) => r.add_column(chunk, name, b),
                            None => r.column_failed(chunk, &name),
                        }
                        r.columns_settled();
                        dirty = true;
                    }
                }
                Msg::Level(l) => {
                    r.set_level(l.as_ref());
                    dirty = true;
                }
                Msg::Capture(reply) => {
                    r.request_capture(reply);
                    want_capture = true;
                }
                Msg::ReadHeat(max, after, reply) => {
                    r.request_heat_after(max, after, reply);
                    dirty = true;
                }
                Msg::Glyphs(bytes) => {
                    if let Err(e) = r.figures.set_atlas(&r.device, &r.queue, &bytes) {
                        eprintln!("viewport: {e:#}");
                    }
                }
                Msg::Mesh(bytes) => {
                    if let Err(e) = r.figures.mesh_slice(&r.device, &r.queue, &bytes) {
                        eprintln!("viewport: {e:#}");
                    }
                }
                Msg::Probe(x, y, reply) => {
                    r.request_probe(x, y, reply);
                    want_capture = true;
                }
                Msg::Times(reply) => {
                    let (iv, cpu) = r.take_times();
                    let list = |v: &[f32]| v.iter().map(|x| format!("{x:.3}")).collect::<Vec<_>>().join(",");
                    reply(format!("{{\"intervals\":[{}],\"cpu\":[{}],\"frames\":{},\"packets\":{}}}", list(&iv), list(&cpu), r.stats.frames, r.stats.packets));
                }
            }
        }
        // Filter columns the frames asked for, fetched from the core off this thread.
        let wanted = r.wanted_columns();
        if !wanted.is_empty() && !data.fetching.load(Ordering::SeqCst) {
            if let Some(ds) = data.core.clone() {
                data.fetching.store(true, Ordering::SeqCst);
                let (device, tx, g, fetching) = (r.device.clone(), tx.clone(), data.generation.clone(), data.fetching.clone());
                let gen = g.load(Ordering::SeqCst);
                std::thread::spawn(move || {
                    for (chunk, name) in wanted {
                        if g.load(Ordering::SeqCst) != gen {
                            break;
                        }
                        let buf = loader::upload_column(&device, &ds, chunk, &name).unwrap_or_else(|e| {
                            eprintln!("viewport: column {name}: {e:#}");
                            None
                        });
                        let _ = tx.send(Msg::Column(gen, chunk, name, buf));
                    }
                    fetching.store(false, Ordering::SeqCst);
                });
            }
        }
        r.poll();
        if !packets.is_empty() && fifo {
            active_until = std::time::Instant::now() + Duration::from_millis(500);
        }
        if packets.is_empty() && !want_capture && !dirty && !active && !r.heat_overdue() {
            continue;
        }
        dirty = false;
        let (frame, view) = match surface.get_current_texture() {
            // Suboptimal still shows, as before (the surface is set up again on the next resize).
            wgpu::CurrentSurfaceTexture::Success(f) | wgpu::CurrentSurfaceTexture::Suboptimal(f) => {
                let v = f.texture.create_view(&Default::default());
                (Some(f), v)
            }
            wgpu::CurrentSurfaceTexture::Outdated | wgpu::CurrentSurfaceTexture::Lost => {
                surface.configure(&r.device, &config);
                dirty = true;
                // The packets' heat passes still count: drawn on the next frame.
                continue;
            }
            other => {
                // Not shown this time (the window covered, or the compositor slow): drawn offscreen
                // all the same, so the heat passes and the read-backs the page waits on go on.
                if matches!(other, wgpu::CurrentSurfaceTexture::Validation) {
                    eprintln!("viewport: surface: validation error");
                    std::thread::sleep(Duration::from_millis(2));
                    continue;
                }
                if offscreen.as_ref().is_none_or(|o| o.2 != (config.width, config.height)) {
                    let t = r.device.create_texture(&wgpu::TextureDescriptor {
                        label: Some("viewport offscreen"),
                        size: wgpu::Extent3d { width: config.width.max(1), height: config.height.max(1), depth_or_array_layers: 1 },
                        mip_level_count: 1,
                        sample_count: 1,
                        dimension: wgpu::TextureDimension::D2,
                        format: config.format,
                        usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
                        view_formats: &[],
                    });
                    let v = t.create_view(&Default::default());
                    offscreen = Some((t, v, (config.width, config.height)));
                }
                (None, offscreen.as_ref().unwrap().1.clone())
            }
        };
        if hidden {
            r.draw(&[], &view, (config.width, config.height), false);
        } else {
            r.draw(&packets, &view, (config.width, config.height), false);
        }
        if let Some(f) = frame {
            r.queue.present(f);
            r.presented();
        }
        r.poll();
        let s = &r.stats;
        snap.lock().json = format!(
            "{{\"residentRows\":{},\"droppedRows\":{},\"gpuBytes\":{},\"levelBytes\":{},\"frames\":{},\"binned\":{},\"filtersPending\":{},\"lastSeq\":{},\"dataGen\":{},\"rowsTaken\":{},\"backend\":{:?},\"adapter\":{:?},\"heatFormat\":{:?}}}",
            r.resident_rows, r.dropped_rows, r.gpu_bytes, r.level_bytes(), s.frames, s.binned, s.filters_pending, s.last_seq, data.page_gen, r.modes.taken, s.backend, s.adapter, s.heat_format
        );
    }
}
