//! The Library's HTTP side: `heat3d_library::api` at `/__heat3d/library`, on
//! the app window's own loopback server (by the window's key) and on
//! `3dheat library serve` (the development server's backend, loopback only).
//! Never on the session server: nothing of the catalogue reaches a member.
//!
//! Who may ask: the window (its key), or with no key a page on this machine
//! that names the library in a header no other origin can send without a
//! preflight this server never answers; the Host must be this machine (no DNS
//! rebinding). Thumbnails need neither: their address holds a random token
//! only an allowed page learns.

use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;

use anyhow::{Context, Result};
use axum::body::{Body, Bytes};
use axum::extract::{ConnectInfo, DefaultBodyLimit, Request, State};
use axum::http::{header, HeaderMap, HeaderValue, Method, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::Router;
use heat3d_core::service::Core;
use heat3d_library::api::{self, Body as ApiBody};
use heat3d_library::Library;
use tower::ServiceExt;
use tower_http::services::ServeFile;

#[derive(Clone)]
struct Lib {
    lib: Arc<Library>,
    core: Arc<Core>,
    key: Option<Arc<str>>,
}

fn host_is_local(headers: &HeaderMap) -> bool {
    let Some(h) = headers.get(header::HOST).and_then(|v| v.to_str().ok()) else { return false };
    let name = h.rsplit_once(':').map(|(n, p)| if p.chars().all(|c| c.is_ascii_digit()) { n } else { h }).unwrap_or(h);
    matches!(name, "127.0.0.1" | "localhost" | "[::1]")
}

impl Lib {
    fn allowed(&self, peer: SocketAddr, headers: &HeaderMap) -> bool {
        if !peer.ip().is_loopback() || !host_is_local(headers) {
            return false;
        }
        match &self.key {
            Some(k) => {
                let given = headers.get("x-heat3d-key").and_then(|v| v.to_str().ok()).unwrap_or("");
                heat3d_session::auth::same_token(given, k)
            }
            None => headers.get("x-heat3d-library").is_some(),
        }
    }
}

/// The library's routes, to nest at `/__heat3d/library`. `key`: the window's key; `None`: the no-key rules above.
pub fn router(lib: Arc<Library>, core: Arc<Core>, key: Option<String>) -> Router {
    let state = Lib { lib, core, key: key.map(Arc::from) };
    Router::new().fallback(answer).layer(DefaultBodyLimit::max(16 << 20)).with_state(state)
}

async fn answer(State(s): State<Lib>, ConnectInfo(peer): ConnectInfo<SocketAddr>, req: Request) -> Response {
    let method = req.method().clone();
    let path = req.uri().path().to_owned();
    let query = req.uri().query().unwrap_or("").to_owned();
    let is_thumb = method == Method::GET && path.trim_start_matches('/').starts_with("thumb/");
    if !is_thumb && !s.allowed(peer, req.headers()) {
        return StatusCode::FORBIDDEN.into_response();
    }
    if is_thumb && (!peer.ip().is_loopback() || !host_is_local(req.headers())) {
        return StatusCode::FORBIDDEN.into_response();
    }
    let range = req.headers().get(header::RANGE).cloned();
    let body: Bytes = match axum::body::to_bytes(req.into_body(), 16 << 20).await {
        Ok(b) => b,
        Err(_) => return StatusCode::PAYLOAD_TOO_LARGE.into_response(),
    };
    let lib = s.lib.clone();
    let m = method.as_str().to_owned();
    let a = match tokio::task::spawn_blocking(move || api::handle(&lib, &m, &path, &query, &body)).await {
        Ok(a) => a,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    let status = StatusCode::from_u16(a.status).unwrap_or(StatusCode::OK);
    match a.body {
        ApiBody::Json(v) => (status, [(header::CONTENT_TYPE, "application/json"), (header::CACHE_CONTROL, "no-store")], v.to_string()).into_response(),
        ApiBody::Bytes(b, ct) => (status, [(header::CONTENT_TYPE, ct), (header::CACHE_CONTROL, "private, max-age=3600")], b).into_response(),
        ApiBody::File(p, name) => send_file(&s.core, p, &name, range).await,
    }
}

/// A file whole or by range, with the core's token for it: the window hands the
/// token to the core, which then reads the file in place.
async fn send_file(core: &Core, p: PathBuf, name: &str, range: Option<HeaderValue>) -> Response {
    let token = core.register_file(p.clone());
    let mut req = Request::new(Body::empty());
    if let Some(r) = range {
        req.headers_mut().insert(header::RANGE, r);
    }
    let mut res = match ServeFile::new(&p).oneshot(req).await {
        Ok(r) => r.map(Body::new),
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    let h = res.headers_mut();
    if let Ok(v) = HeaderValue::from_str(&token) {
        h.insert("x-heat3d-token", v);
    }
    // The name, percent-encoded (it can hold any character).
    let enc: String = name.bytes().map(|b| if b.is_ascii_alphanumeric() || b"-_.".contains(&b) { (b as char).to_string() } else { format!("%{b:02X}") }).collect();
    if let Ok(v) = HeaderValue::from_str(&enc) {
        h.insert("x-heat3d-name", v);
    }
    h.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    res
}

/// `3dheat library ...`: the catalogue from the command line.
///   3dheat library serve [--port N] [--data DIR]        the API on 127.0.0.1 (the development server proxies to it)
///   3dheat library scan DIR... [--data DIR] [--deep]   add folders, scan them now, print the numbers
pub async fn cli(args: Vec<String>) {
    let mut port = 5349u16;
    let mut data: Option<PathBuf> = None;
    let mut deep = false;
    let mut dirs = Vec::new();
    let verb = args.first().cloned().unwrap_or_default();
    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--port" => {
                port = args.get(i + 1).and_then(|p| p.parse().ok()).unwrap_or(port);
                i += 1;
            }
            "--data" => {
                data = args.get(i + 1).map(PathBuf::from);
                i += 1;
            }
            "--deep" => deep = true,
            d => dirs.push(PathBuf::from(d)),
        }
        i += 1;
    }
    let data = data.unwrap_or_else(heat3d_library::data_dir);
    let r = match verb.as_str() {
        "serve" => serve(port, &data).await,
        "scan" => scan(&data, &dirs, deep),
        _ => {
            eprintln!("3dheat library serve [--port N] [--data DIR]\n3dheat library scan DIR... [--data DIR] [--deep]");
            std::process::exit(2);
        }
    };
    if let Err(e) = r {
        eprintln!("3dheat library: {e:#}");
        std::process::exit(1);
    }
}

async fn serve(port: u16, data: &std::path::Path) -> Result<()> {
    let lib = Library::start(data)?;
    let app = Router::new().nest("/__heat3d/library", router(lib, Arc::new(Core::new()), None));
    let listener = tokio::net::TcpListener::bind(SocketAddr::from(([127, 0, 0, 1], port))).await.with_context(|| format!("binding 127.0.0.1:{port}"))?;
    println!("3DHeat Library on http://{}/__heat3d/library (catalogue in {})", listener.local_addr()?, data.display());
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;
    Ok(())
}

fn scan(data: &std::path::Path, dirs: &[PathBuf], deep: bool) -> Result<()> {
    let lib = Library::open(data)?;
    for d in dirs {
        let id = lib.add_root(d, true)?;
        let s = lib.scan_now(id)?;
        let secs = s.total_ms as f64 / 1000.0;
        println!(
            "{}: {} files ({} new or changed, {} missing, {} unreadable) in {:.2} s (walk {:.2} s, read {:.2} s): {:.0} files/s",
            s.root,
            s.files,
            s.changed,
            s.missing,
            s.errors,
            secs,
            s.walk_ms as f64 / 1000.0,
            s.read_ms as f64 / 1000.0,
            s.files as f64 / secs.max(1e-3)
        );
    }
    if deep {
        let t = std::time::Instant::now();
        let mut n = 0;
        loop {
            let k = heat3d_library::scan::deep_round(&lib, 64)?;
            if k == 0 {
                break;
            }
            n += k;
        }
        println!("deep pass: {n} files in {:.1} s", t.elapsed().as_secs_f64());
    }
    Ok(())
}
