//! 3DHeat as a native app: the unchanged viewer in a window of its own, with the
//! native core (`heat3d-core`) behind it.
//!
//! The viewer reaches the core through the embedded server on a loopback port
//! with a key only this window knows (`core_endpoint`): a POST of one protocol
//! frame, answered with one frame, raw bytes both ways, from the page and from
//! its workers alike. Measured against the `heat3d` URI scheme (`protocol.rs`),
//! which stays as the fallback: WebView2 hands a custom scheme's answer over in
//! pieces, at about 0.1 GB/s, the loopback port at many times that.
//!
//! Files the viewer picks or drops stay `File`s in the page, so every feature
//! works as in the browser; on Windows the page also hands them to the core
//! (`files.rs`), which then reads them in place.
//!
//! The app embeds the 3DHeat server (`heat3d-server`), the same one that runs
//! headless as `3dheat serve`: the multiplayer session server with the core's
//! data API.
//!   3dheat-app serve [OPTIONS]    headless, no window: the server alone
//!   3dheat-app --host [OPTIONS]   the window, and a session hosted beside it, on the
//!                             same core (what the window loaded, the session serves)
//! The options are `3dheat serve`'s (`3dheat --help`).

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod files;
mod protocol;
mod shared;
mod window_layer;

use std::sync::Arc;

use heat3d_core::service::Core;
use tauri::Manager;

/// Where the window's own requests go, and the key that makes them the owner's.
#[derive(Clone, serde::Serialize)]
struct Endpoint {
    url: String,
    key: String,
}

/// The machine as the viewer's budgets read it (`src/data/hostMemory.ts`): in a
/// browser the dev server answers `/__host/memory`; in the app, this. Above all
/// the card's memory, which no page can learn and which sets the GPU budget.
#[tauri::command]
fn host_memory() -> serde_json::Value {
    let (vram, source) = vram_bytes();
    serde_json::json!({
        "totalBytes": heat3d_core::memory::total_bytes(),
        "cpus": std::thread::available_parallelism().map(|n| n.get()).unwrap_or(0),
        "platform": std::env::consts::OS,
        "vramBytes": vram,
        "vramSource": source,
    })
}

/// The largest adapter's own memory (DXGI), on Windows.
fn vram_bytes() -> (Option<u64>, &'static str) {
    #[cfg(windows)]
    {
        use windows::Win32::Graphics::Dxgi::{CreateDXGIFactory1, IDXGIFactory1};
        // SAFETY: plain DXGI queries.
        let best = unsafe {
            CreateDXGIFactory1::<IDXGIFactory1>().ok().map(|f| {
                let mut best = 0u64;
                let mut i = 0;
                while let Ok(a) = f.EnumAdapters1(i) {
                    if let Ok(d) = a.GetDesc1() {
                        best = best.max(d.DedicatedVideoMemory as u64);
                    }
                    i += 1;
                }
                best
            })
        };
        if let Some(b) = best.filter(|&b| b > 0) {
            return (Some(b), "DXGI");
        }
    }
    (None, "")
}

#[tauri::command]
fn core_endpoint(endpoint: tauri::State<'_, Option<Endpoint>>) -> Option<Endpoint> {
    endpoint.inner().clone()
}

fn random_key() -> String {
    let mut b = [0u8; 24];
    getrandom::fill(&mut b).expect("the system's random source");
    b.iter().map(|x| format!("{x:02x}")).collect()
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let web_beside_exe = || {
        let d = std::env::current_exe().ok()?.parent()?.join("web");
        d.join("index.html").is_file().then_some(d)
    };
    if args.first().map(String::as_str) == Some("gateway") {
        // The session server's gateway, started locked down by `serve` or `--host`.
        tokio_runtime().block_on(heat3d_server::cli::gateway());
    }
    if args.first().map(String::as_str) == Some("serve") {
        let rt = tokio_runtime();
        rt.block_on(heat3d_server::cli::serve(args[1..].to_vec(), Arc::new(Core::new()), web_beside_exe()));
        return;
    }
    let host_args: Option<Vec<String>> = args.iter().position(|a| a == "--host").map(|i| args[i + 1..].to_vec());

    window_layer::prepare();
    let core = Arc::new(Core::new());
    let scheme_core = core.clone();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![core_endpoint, host_memory, shared::shared_echo])
        .register_asynchronous_uri_scheme_protocol("heat3d", move |_ctx, request, responder| {
            let core = scheme_core.clone();
            // Off the event loop: a load takes seconds, and the window keeps drawing meanwhile.
            std::thread::spawn(move || responder.respond(protocol::answer(&core, request)));
        })
        .setup(move |app| {
            // The viewer as the app bundles it, which the servers hand out.
            let web = app.path().resource_dir().ok().map(|d| d.join("web")).filter(|d| d.join("index.html").is_file());
            // The window's own server: loopback only, the owner by a key only this
            // window is told. The window loads the viewer from it too (`spawn_local`).
            let key = random_key();
            let addr = tauri::async_runtime::block_on(heat3d_server::spawn_local(core.clone(), web.clone(), key.clone()))
                .map_err(|e| eprintln!("the window's core server did not start ({e:#}); using the heat3d scheme"))
                .ok();
            app.manage(addr.map(|a| Endpoint { url: format!("http://{a}/v1"), key }));
            let url = match (addr, &web) {
                (Some(a), Some(_)) => tauri::WebviewUrl::External(format!("http://{a}/").parse().expect("a loopback URL")),
                _ => tauri::WebviewUrl::App("index.html".into()),
            };
            let window = tauri::WebviewWindowBuilder::new(app, "main", url)
                .title("3DHeat")
                .inner_size(1600.0, 1000.0)
                .min_inner_size(900.0, 600.0)
                // HTML drag and drop, as in a browser: the viewer takes the dropped files itself.
                .disable_drag_drop_handler()
                .build()?;
            files::attach(&window, core.clone());
            // Columns and chunks into the page with no copy on the way (Windows).
            #[cfg(windows)]
            shared::sink::attach(&window, &core);
            window_layer::attach(&window);
            if let Some(rest) = host_args.clone() {
                // A session hosted beside the window, on the same core.
                let (core, web) = (core.clone(), web.clone());
                tauri::async_runtime::spawn(heat3d_server::cli::serve(rest, core, web));
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("3DHeat failed to start");
}

fn tokio_runtime() -> tokio::runtime::Runtime {
    tokio::runtime::Builder::new_multi_thread().enable_all().build().expect("a Tokio runtime")
}
