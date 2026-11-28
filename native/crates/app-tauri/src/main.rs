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
//!   3dheat-app --library          the Library's own window (its own start-menu entry);
//!                             items open from it in viewer windows of their own
//! The options are `3dheat serve`'s (`3dheat --help`).

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod files;
mod memory;
mod protocol;
mod requirements;
mod shared;
mod update;
mod video;
mod viewport;
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

/// The Library's folder picker: a folder's path, or none when cancelled.
#[tauri::command]
async fn pick_folder() -> Option<String> {
    tauri::async_runtime::spawn_blocking(|| rfd::FileDialog::new().set_title("Add a folder to the 3DHeat Library").pick_folder())
        .await
        .ok()
        .flatten()
        .map(|p| p.to_string_lossy().into_owned())
}

/// Where a viewer window loads from, and the core it hands its files to.
struct ViewerBase {
    url: Option<String>,
    core: Arc<Core>,
    /// The viewer as the app bundles it, which a session it hosts hands out.
    web: Option<std::path::PathBuf>,
}

/// Whether this app hosts a session already (`host_session`).
static HOSTING: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

/// "Host a session" in the session panel: the session server starts inside
/// the app, on this window's core, and the host page opens in the browser
/// (where the host invites people); no terminal. Says why when it cannot
/// start (the port is taken, say) instead of ending the app.
#[tauri::command]
async fn host_session(base: tauri::State<'_, ViewerBase>) -> Result<String, String> {
    if HOSTING.swap(true, std::sync::atomic::Ordering::SeqCst) {
        return Ok("running".into());
    }
    if let Err(e) = heat3d_server::cli::can_serve(7878, base.web.as_deref()) {
        HOSTING.store(false, std::sync::atomic::Ordering::SeqCst);
        return Err(e);
    }
    let (core, web) = (base.core.clone(), base.web.clone());
    let mut args = vec!["--open".to_string()];
    args.extend(window_origin(base.url.as_deref()));
    tauri::async_runtime::spawn(async move {
        heat3d_server::cli::serve(args, core, web).await;
        HOSTING.store(false, std::sync::atomic::Ordering::SeqCst);
    });
    Ok("started".into())
}

/// `--allow-origin` for this app's window (its loopback server's origin): the window joins the
/// session the app hosts - as its host, to share what it draws (heat from tiles: the pyramid's
/// key) - which a session lets in only from its own origin otherwise.
fn window_origin(served: Option<&str>) -> Vec<String> {
    served.map(|u| vec!["--allow-origin".to_string(), u.trim_end_matches('/').to_string()]).unwrap_or_default()
}

/// A viewer window of its own, for items the Library's window opens
/// (`?libraryOpen=<ids>[&how=mass|session]`; nothing else is let through).
#[tauri::command]
async fn open_viewer(app: tauri::AppHandle, base: tauri::State<'_, ViewerBase>, query: String) -> Result<(), String> {
    let ok = query.strip_prefix("?libraryOpen=").is_some_and(|rest| {
        let (ids, how) = rest.split_once("&how=").unwrap_or((rest, "view"));
        !ids.is_empty() && ids.chars().all(|c| c.is_ascii_digit() || c == ',') && matches!(how, "view" | "mass" | "session")
    });
    if !ok {
        return Err("not a Library address".into());
    }
    let url = match &base.url {
        Some(u) => tauri::WebviewUrl::External(format!("{u}{query}").parse().map_err(|e| format!("{e}"))?),
        None => tauri::WebviewUrl::App(format!("index.html{query}").into()),
    };
    static NEXT: std::sync::atomic::AtomicU32 = std::sync::atomic::AtomicU32::new(1);
    let label = format!("viewer-{}", NEXT.fetch_add(1, std::sync::atomic::Ordering::Relaxed));
    let window = window_layer::options(tauri::WebviewWindowBuilder::new(&app, label, url))
        .title("3DHeat")
        .inner_size(1600.0, 1000.0)
        .min_inner_size(900.0, 600.0)
        .disable_drag_drop_handler()
        .build()
        .map_err(|e| e.to_string())?;
    files::attach(&window, base.core.clone());
    #[cfg(windows)]
    shared::sink::attach(&window, &base.core);
    window_layer::attach(&window);
    Ok(())
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
    if args.first().map(String::as_str) == Some("--check-requirements") {
        // The installer's check, before any window (installer/hooks.nsh).
        std::process::exit(requirements::cli(&args));
    }
    let host_args: Option<Vec<String>> = args.iter().position(|a| a == "--host").map(|i| args[i + 1..].to_vec());
    let library_window = args.iter().any(|a| a == "--library");

    window_layer::prepare();
    let core = Arc::new(Core::new());
    let scheme_core = core.clone();
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(update::State::default())
        .manage(viewport::Viewports::default())
        .invoke_handler(tauri::generate_handler![
            core_endpoint,
            memory::host_memory,
            shared::shared_echo,
            requirements::requirements,
            requirements::open_fix,
            update::update_status,
            update::update_check,
            update::update_now,
            update::update_settings,
            pick_folder,
            open_viewer,
            host_session,
            viewport::viewport_start,
            viewport::viewport_stop,
            viewport::viewport_frame,
            viewport::viewport_dataset,
            viewport::viewport_chunk,
            viewport::viewport_column,
            viewport::viewport_rows,
            viewport::viewport_level,
            viewport::viewport_hide,
            viewport::viewport_capture,
            viewport::viewport_read_heat,
            viewport::viewport_probe,
            viewport::viewport_snapshot,
            viewport::viewport_mesh,
            viewport::viewport_glyphs,
            viewport::viewport_tracks,
            viewport::viewport_core_tracks,
            viewport::viewport_heat_tiles,
            viewport::viewport_times
        ])
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
            // The Library's catalogue, on this machine only (docs/library.md): scanning,
            // thumbnails and conversions run in its own threads, off the window's.
            let library = heat3d_library::Library::start(&heat3d_library::data_dir()).map_err(|e| eprintln!("the Library did not start ({e:#})")).ok();
            let addr = tauri::async_runtime::block_on(heat3d_server::spawn_local_with(core.clone(), web.clone(), key.clone(), library))
                .map_err(|e| eprintln!("the window's core server did not start ({e:#}); using the heat3d scheme"))
                .ok();
            app.manage(addr.map(|a| Endpoint { url: format!("http://{a}/v1"), key }));
            let served = match (addr, &web) {
                (Some(a), Some(_)) => Some(format!("http://{a}/")),
                _ => None,
            };
            app.manage(ViewerBase { url: served.clone(), core: core.clone(), web: web.clone() });
            let query = if library_window { "?library" } else { "" };
            let url = match &served {
                Some(u) => tauri::WebviewUrl::External(format!("{u}{query}").parse().expect("a loopback URL")),
                None => tauri::WebviewUrl::App(format!("index.html{query}").into()),
            };
            let window = window_layer::options(tauri::WebviewWindowBuilder::new(app, "main", url))
                .title(if library_window { "3DHeat Library" } else { "3DHeat" })
                .inner_size(1600.0, 1000.0)
                .min_inner_size(900.0, 600.0)
                // HTML drag and drop, as in a browser: the viewer takes the dropped files itself.
                .disable_drag_drop_handler()
                .build()?;
            files::attach(&window, core.clone());
            // Session members whose device cannot draw the data get their view as video, drawn by
            // this window's native viewport (Stage 8; offers are refused while it is off).
            heat3d_video::host().set_source(Some(Arc::new(video::AppVideo { app: app.handle().clone() })));
            // Columns and chunks into the page with no copy on the way (Windows).
            #[cfg(windows)]
            shared::sink::attach(&window, &core);
            window_layer::attach(&window);
            if let Some(mut rest) = host_args.clone() {
                // A session hosted beside the window, on the same core; the window may join it.
                rest.extend(window_origin(served.as_deref()));
                let (core, web) = (core.clone(), web.clone());
                tauri::async_runtime::spawn(heat3d_server::cli::serve(rest, core, web));
            }
            // Asks GitHub for a newer release; updates only when asked to (update.rs).
            update::start(app.handle().clone());
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("3DHeat failed to start")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                update::on_exit(app);
            }
        });
}

fn tokio_runtime() -> tokio::runtime::Runtime {
    tokio::runtime::Builder::new_multi_thread().enable_all().build().expect("a Tokio runtime")
}
