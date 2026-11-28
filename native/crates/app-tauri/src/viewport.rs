//! The native viewport (Stage 5, preview) in a viewer window: `heat3d-viewport`
//! draws into the window itself, below its page, which turns transparent while
//! the viewport runs (`window_layer.rs` has the layering per platform).
//!
//! The page asks for it (Settings > Native viewport (preview)), and then sends
//! each frame to `viewport_frame`; the camera, the plan, the filters and the
//! time window ride in that packet (`src/render/native/framePacket.ts`). Input
//! stays with the page: it sees every click, keeps its panels' hit areas and
//! moves the camera that the packets carry.

use std::collections::HashMap;
use std::sync::Mutex;

use heat3d_viewport::{Msg, Viewport};
use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{Manager, WebviewWindow};

/// The running viewports, by window label.
#[derive(Default)]
pub struct Viewports(Mutex<HashMap<String, Viewport>>);

fn with<R>(window: &WebviewWindow, f: impl FnOnce(&Viewport) -> R) -> Option<R> {
    let all = window.state::<Viewports>();
    let map = all.0.lock().unwrap();
    map.get(window.label()).map(f)
}

fn raw<'a>(request: &'a Request<'_>) -> &'a [u8] {
    match request.body() {
        InvokeBody::Raw(b) => b,
        _ => &[],
    }
}

/// Starts the viewport in this window; the adapter and backend it got, or why it could not.
#[tauri::command]
pub async fn viewport_start(window: WebviewWindow) -> Result<String, String> {
    if let Some(info) = with(&window, |v| v.info.clone()) {
        return Ok(info);
    }
    #[cfg(not(target_os = "linux"))]
    let (make, size) = {
        let size = window.inner_size().map_err(|e| e.to_string())?;
        let target = window.as_ref().window();
        let make: heat3d_viewport::viewport::MakeSurface =
            Box::new(move |instance: &heat3d_viewport::wgpu::Instance| instance.create_surface(target.clone()).map_err(|e| anyhow::anyhow!("{e}")));
        (make, (size.width, size.height))
    };
    // Wayland: wgpu draws into a subsurface of its own below the page's surface
    // (`window_layer::linux`); drawn into the window's own surface it would cover the page.
    #[cfg(target_os = "linux")]
    let (make, size) = linux_surface(&window).await?;
    let started = tauri::async_runtime::spawn_blocking(move || Viewport::start(make, size)).await.map_err(|e| e.to_string()).and_then(|r| r.map_err(|e| format!("{e:#}")));
    #[cfg(target_os = "linux")]
    if started.is_err() {
        let w = window.as_ref().window();
        let _ = window.run_on_main_thread(move || crate::window_layer::linux::stop(&w));
    }
    let vp = started?;
    let info = vp.info.clone();
    // The page shows the viewport through itself from here on.
    window.set_background_color(Some(tauri::window::Color(0, 0, 0, 0))).map_err(|e| e.to_string())?;
    window.state::<Viewports>().0.lock().unwrap().insert(window.label().to_owned(), vp);
    Ok(info)
}

/// Stops it: the page draws again (and turns opaque).
#[tauri::command]
pub fn viewport_stop(window: WebviewWindow) {
    let vp = window.state::<Viewports>().0.lock().unwrap().remove(window.label());
    drop(vp);
    // The subsurface goes once its wgpu surface has.
    #[cfg(target_os = "linux")]
    {
        let w = window.as_ref().window();
        let _ = window.run_on_main_thread(move || crate::window_layer::linux::stop(&w));
    }
    let _ = window.set_background_color(None);
}

/// The viewport's subsurface below the page (made on the main thread, where GTK lives), and the
/// wgpu surface on it from the raw Wayland handles; the size in pixels.
#[cfg(target_os = "linux")]
async fn linux_surface(window: &WebviewWindow) -> Result<(heat3d_viewport::viewport::MakeSurface, (u32, u32)), String> {
    use heat3d_viewport::wgpu::rwh::{RawDisplayHandle, RawWindowHandle, WaylandDisplayHandle, WaylandWindowHandle};
    let (tx, rx) = std::sync::mpsc::channel();
    let w = window.as_ref().window();
    window.run_on_main_thread(move || drop(tx.send(crate::window_layer::linux::start(&w)))).map_err(|e| e.to_string())?;
    let got = tauri::async_runtime::spawn_blocking(move || rx.recv_timeout(std::time::Duration::from_secs(10))).await.map_err(|e| e.to_string())?;
    let (display, surface, size) = got.map_err(|_| "the window did not answer".to_owned())??;
    let make: heat3d_viewport::viewport::MakeSurface = Box::new(move |instance: &heat3d_viewport::wgpu::Instance| {
        let display = std::ptr::NonNull::new(display as *mut std::ffi::c_void).ok_or_else(|| anyhow::anyhow!("no wl_display"))?;
        let surface = std::ptr::NonNull::new(surface as *mut std::ffi::c_void).ok_or_else(|| anyhow::anyhow!("no wl_surface"))?;
        let target = heat3d_viewport::wgpu::SurfaceTargetUnsafe::RawHandle {
            raw_display_handle: Some(RawDisplayHandle::Wayland(WaylandDisplayHandle::new(display))),
            raw_window_handle: RawWindowHandle::Wayland(WaylandWindowHandle::new(surface)),
        };
        // SAFETY: GTK's display and the subsurface `window_layer::linux` keeps until `viewport_stop`,
        // after the viewport (and this surface) is gone.
        unsafe { instance.create_surface_unsafe(target) }.map_err(|e| anyhow::anyhow!("{e}"))
    });
    Ok((make, size))
}

/// One frame (raw packet); answers the viewport's counters as JSON.
#[tauri::command]
pub fn viewport_frame(window: WebviewWindow, request: Request<'_>) -> String {
    let bytes = raw(&request).to_vec();
    with(&window, |v| {
        v.send(Msg::Packet(bytes));
        v.snapshot.lock().json.clone()
    })
    .unwrap_or_default()
}

/// The dataset to draw: a core-built one by handle (rows straight from the core), or a load
/// the page built (`rows`, its chunks following through `viewport_chunk`), or none.
#[tauri::command]
pub fn viewport_dataset(window: WebviewWindow, base: tauri::State<'_, crate::ViewerBase>, handle: Option<u64>, rows: u64, has_time: bool, budget: u64, gen: Option<u32>) -> Result<(), String> {
    let gen = gen.unwrap_or(0);
    let msg = match handle {
        Some(h) => Msg::CoreDataset { ds: Some(base.core.built_dataset(h).ok_or_else(|| format!("no dataset {h} in the core"))?), budget, gen },
        None if rows > 0 => Msg::PageDataset { rows, has_time, budget, gen },
        None => Msg::CoreDataset { ds: None, budget, gen },
    };
    with(&window, |v| v.send(msg)).ok_or_else(|| "no viewport".to_owned())
}

/// One chunk the page packed (raw: a 16-word header, positions, times).
#[tauri::command]
pub fn viewport_chunk(window: WebviewWindow, request: Request<'_>) {
    let bytes = raw(&request).to_vec();
    with(&window, |v| v.send(Msg::PageChunk(bytes)));
}

/// One chunk's rows of a filter column the page holds (raw; `loader::page_column`).
#[tauri::command]
pub fn viewport_column(window: WebviewWindow, request: Request<'_>) {
    let bytes = raw(&request).to_vec();
    with(&window, |v| v.send(Msg::PageColumn(bytes)));
}

/// One chunk's per-row data for the heat modes (raw; `heatmodes::RowData::parse`): bearings or
/// line heat's segment starts.
#[tauri::command]
pub fn viewport_rows(window: WebviewWindow, request: Request<'_>) {
    let bytes = raw(&request).to_vec();
    with(&window, |v| v.send(Msg::Rows(bytes)));
}

/// A slice of a figure mesh (raw: id, vertices, total bytes, offset, then the bytes; a total of 0
/// lets the mesh go, and id `u32::MAX` with it every mesh).
#[tauri::command]
pub fn viewport_mesh(window: WebviewWindow, request: Request<'_>) {
    let bytes = raw(&request).to_vec();
    with(&window, |v| v.send(Msg::Mesh(bytes)));
}

/// The GPU tracks' store, a message at a time (raw: `nativeTracks.ts`, `Tracks::message`).
#[tauri::command]
pub fn viewport_tracks(window: WebviewWindow, request: Request<'_>) {
    let bytes = raw(&request).to_vec();
    with(&window, |v| v.send(Msg::Tracks(bytes)));
}

/// The GPU tracks' keys for a core-built dataset, built by the core over every row it holds
/// (`heat3d_core::tracks`) and handed to the viewport for the page's store `id` (no IPC for the
/// keys). Answers what the page's track table needs: the keys' count, the chunk spans' words,
/// the persons, the tolerance and samples and the build's milliseconds, then each person's entry
/// (`TrackKeys::person_words`); an empty answer when the keys do not fit `maxKeys`.
#[tauri::command]
pub async fn viewport_core_tracks(window: WebviewWindow, base: tauri::State<'_, crate::ViewerBase>, handle: u64, id: u32, req: heat3d_core::tracks::TrackRequest) -> Result<Response, String> {
    let ds = base.core.built_dataset(handle).ok_or_else(|| format!("no dataset {handle} in the core"))?;
    let built = tauri::async_runtime::spawn_blocking(move || heat3d_core::tracks::build_for(&ds, &req)).await.map_err(|e| e.to_string())?.map_err(|e| format!("{e:#}"))?;
    let Some(k) = built else { return Ok(Response::new(Vec::new())) };
    let head = [k.keys as u32, k.chunks.len() as u32, k.persons.len() as u32, (k.tolerance as f32).to_bits(), k.samples as u32, (k.build_ms as f32).to_bits()];
    let mut out: Vec<u32> = head.to_vec();
    out.extend(k.person_words());
    with(&window, |v| v.send(Msg::CoreTracks(id, std::sync::Arc::new(k)))).ok_or("no viewport")?;
    Ok(Response::new(bytemuck_bytes(&out)))
}

fn bytemuck_bytes(w: &[u32]) -> Vec<u8> {
    w.iter().flat_map(|x| x.to_le_bytes()).collect()
}

/// The core's heat-tile store, where the viewport reads the tiles a frame draws by the pyramid's key.
#[tauri::command]
pub fn viewport_heat_tiles(window: WebviewWindow, base: tauri::State<'_, crate::ViewerBase>) -> Result<(), String> {
    let store = base.core.tile_store().map_err(|e| format!("{e:#}"))?;
    with(&window, |v| v.send(Msg::TileStore(store))).ok_or_else(|| "no viewport".to_owned())
}

/// The glyph atlas the page made (raw RGBA8, `ATLAS_WIDTH` x `ATLAS_HEIGHT`).
#[tauri::command]
pub fn viewport_glyphs(window: WebviewWindow, request: Request<'_>) {
    let bytes = raw(&request).to_vec();
    with(&window, |v| v.send(Msg::Glyphs(bytes)));
}

/// A part of one of the level's messages (raw, `loader::Parts`; `src/render/native/levelMessages.ts`:
/// none, a mesh, its atlas, an image level's picture).
#[tauri::command]
pub fn viewport_level(window: WebviewWindow, request: Request<'_>) {
    let bytes = raw(&request).to_vec();
    with(&window, |v| v.send(Msg::Level(bytes)));
}

/// Shown or not (the page hides it while a view the viewport cannot draw yet is up).
#[tauri::command]
pub fn viewport_hide(window: WebviewWindow, hidden: bool) {
    with(&window, |v| v.send(Msg::Hide(hidden)));
}

/// The window resized: the surface follows.
pub fn resized(window: &tauri::Window, w: u32, h: u32) {
    let all = window.state::<Viewports>();
    let map = all.0.lock().unwrap();
    if let Some(v) = map.get(window.label()) {
        v.send(Msg::Resize(w, h));
    }
}

/// The picture of the page's packet `after` (its sequence number) or the next frame's: width,
/// height (u32 each), then RGBA. The rows are read from the viewport's mapped read-back here, off
/// its thread (`capture.rs`), and the slot goes back to its ring when the picture drops.
///
/// With `shared` (Windows), the rows go straight into WebView2 shared memory posted to the page
/// under that id (`src/data/native/shared.ts`) and only the size comes back: a 1080p picture is
/// 8 MB, and through the IPC it cost a video render about 35 ms a frame.
#[tauri::command]
pub async fn viewport_capture(window: WebviewWindow, after: Option<u32>, shared: Option<u64>) -> Result<Response, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    with(&window, |v| v.send(Msg::Capture(after.unwrap_or(0), Box::new(move |c| drop(tx.send(c)))))).ok_or("no viewport")?;
    let out = tauri::async_runtime::spawn_blocking(move || -> Result<Vec<u8>, String> {
        let c = rx.recv_timeout(std::time::Duration::from_secs(10)).ok().flatten().ok_or("no frame")?;
        let mut out = Vec::with_capacity(8 + if shared.is_some() { 0 } else { (c.width * c.height * 4) as usize });
        out.extend_from_slice(&c.width.to_le_bytes());
        out.extend_from_slice(&c.height.to_le_bytes());
        match shared {
            #[cfg(windows)]
            Some(id) => {
                use heat3d_core::dataset::SharedSink;
                let sink = crate::shared::sink::WebviewSink { window };
                let len = (c.width * c.height * 4) as usize;
                let mem = sink.create(len).map_err(|e| e.to_string())?;
                // SAFETY: the sink's memory, `len` bytes, not yet posted: only this thread sees it.
                let rows = unsafe { std::slice::from_raw_parts_mut(mem.ptr(), len) };
                c.write_rgba_into(rows);
                drop(c);
                sink.post(&mem, id).map_err(|e| e.to_string())?;
            }
            _ => c.write_rgba(&mut out),
        }
        Ok(out)
    })
    .await
    .map_err(|e| e.to_string())??;
    Ok(Response::new(out))
}

/// The heat field, subsampled to at most `max` values (f32), for the exposure; read once the
/// page's packet `after` is drawn (0: at the next frame), as the web engine reads the frame it
/// has just submitted - the packets and this command may reach the viewport in either order.
#[tauri::command]
pub async fn viewport_read_heat(window: WebviewWindow, max: usize, after: Option<u32>) -> Result<Response, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    with(&window, |v| v.send(Msg::ReadHeat(max, after.unwrap_or(0), Box::new(move |c| drop(tx.send(c)))))).ok_or("no viewport")?;
    let got = tauri::async_runtime::spawn_blocking(move || rx.recv_timeout(std::time::Duration::from_secs(10)).ok().flatten()).await.map_err(|e| e.to_string())?;
    let v = got.ok_or("no heat")?;
    Ok(Response::new(v.iter().flat_map(|x| x.to_le_bytes()).collect::<Vec<u8>>()))
}

/// The heat under one canvas pixel (`probeHeat`; the page divides it).
#[tauri::command]
pub async fn viewport_probe(window: WebviewWindow, x: f32, y: f32) -> Result<Option<f32>, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    with(&window, |v| {
        v.send(Msg::Probe(
            x,
            y,
            Box::new(move |c| {
                let _ = tx.send(c);
            }),
        ))
    })
    .ok_or("no viewport")?;
    tauri::async_runtime::spawn_blocking(move || rx.recv_timeout(std::time::Duration::from_secs(5)).ok().flatten()).await.map_err(|e| e.to_string())
}

/// The viewport's counters as `viewport_frame` answers them, without a frame: the page asks
/// while columns or rows are on their way and it draws nothing itself.
#[tauri::command]
pub fn viewport_snapshot(window: WebviewWindow) -> String {
    with(&window, |v| v.snapshot.lock().json.clone()).unwrap_or_default()
}

/// Present intervals and CPU times since the last call (the parity probe).
#[tauri::command]
pub async fn viewport_times(window: WebviewWindow) -> Result<String, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    with(&window, |v| v.send(Msg::Times(Box::new(move |s| drop(tx.send(s)))))).ok_or("no viewport")?;
    tauri::async_runtime::spawn_blocking(move || rx.recv_timeout(std::time::Duration::from_secs(10)).ok()).await.map_err(|e| e.to_string())?.ok_or_else(|| "no answer".to_owned())
}
