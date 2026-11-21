//! The 3DHeat server: the native core's data API, with the web viewer and the
//! multiplayer session server (`heat3d-session`) around it.
//!
//! - `data_router`: the protocol (`heat3d-proto`) over HTTP and WebSocket:
//!   `POST /` one frame in, one frame out; `GET /ws` a WebSocket of frames.
//!   Mounted at `/v1`.
//! - `spawn_local`: the app window's own server, on a loopback port: the viewer
//!   and `/v1`, the owner known by a key only the window is told.
//! - `cli`: `3dheat serve`, the session server with `/v1` mounted, headless or
//!   from the app (`3dheat-app serve`, or `3dheat-app --host` beside the window).
//!
//! Who may do what (`Access`): the owner may name files by path; everyone else
//! uses only files the host shared. Without a key, a request from this machine
//! is the owner's; with one, only a request carrying it.

pub mod cli;

use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;

use anyhow::{Context, Result};
use axum::body::Bytes;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{ConnectInfo, DefaultBodyLimit, State};
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::Router;
use heat3d_core::service::{Access, Core};
use tower_http::services::{ServeDir, ServeFile};

#[derive(Clone)]
struct Shared {
    core: Arc<Core>,
    owner_key: Option<Arc<str>>,
}

impl Shared {
    fn access(&self, peer: SocketAddr, headers: &HeaderMap) -> Access {
        match &self.owner_key {
            Some(k) => {
                let given = headers.get("x-heat3d-key").and_then(|v| v.to_str().ok());
                if given == Some(k) {
                    Access::OWNER
                } else {
                    Access::REMOTE
                }
            }
            None if peer.ip().is_loopback() => Access::OWNER,
            None => Access::REMOTE,
        }
    }
}

/// The data API, to mount at `/v1`. `cors` answers pages of other origins (the
/// app's `heat3d` scheme fallback); `owner_key` see the module doc.
pub fn data_router(core: Arc<Core>, owner_key: Option<String>, cors: bool) -> Router {
    let shared = Shared { core, owner_key: owner_key.map(Arc::from) };
    let mut r = Router::new()
        .route("/", post(frame))
        .route("/ws", get(socket))
        .layer(DefaultBodyLimit::max(64 << 20))
        .with_state(shared);
    if cors {
        r = r.layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_methods([axum::http::Method::POST])
                .allow_headers([header::CONTENT_TYPE, axum::http::HeaderName::from_static("x-heat3d-key")])
                .max_age(std::time::Duration::from_secs(86_400)),
        );
    }
    r
}

async fn frame(State(s): State<Shared>, ConnectInfo(peer): ConnectInfo<SocketAddr>, headers: HeaderMap, body: Bytes) -> Response {
    let access = s.access(peer, &headers);
    let core = s.core.clone();
    match tokio::task::spawn_blocking(move || core.handle_as(&body, access)).await {
        Ok(out) => ([(header::CONTENT_TYPE, "application/x-heat3d-frame")], out).into_response(),
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    }
}

async fn socket(ws: WebSocketUpgrade, State(s): State<Shared>, ConnectInfo(peer): ConnectInfo<SocketAddr>, headers: HeaderMap) -> Response {
    let access = s.access(peer, &headers);
    let core = s.core.clone();
    ws.max_message_size(64 << 20).on_upgrade(move |w| session(w, core, access))
}

async fn session(mut s: WebSocket, core: Arc<Core>, access: Access) {
    while let Some(Ok(msg)) = s.recv().await {
        let Message::Binary(req) = msg else { continue };
        let core = core.clone();
        let Ok(out) = tokio::task::spawn_blocking(move || core.handle_as(&req, access)).await else { break };
        if s.send(Message::Binary(out.into())).await.is_err() {
            break;
        }
    }
}

/// The app window's own server: on `127.0.0.1` at a free port, the viewer from
/// `web` at `/` and the data API at `/v1`, owner by `owner_key`. Serves in the
/// background of the current Tokio runtime; returns where it listens.
///
/// The window loads the viewer from here rather than from Tauri's scheme: the
/// page, its workers and their workers are then plain HTTP of one origin
/// (WebView2 does not hand a custom scheme to nested workers, and hands its
/// answers over at about 0.1 GB/s, a loopback port at several times that).
pub async fn spawn_local(core: Arc<Core>, web: Option<PathBuf>, owner_key: String) -> Result<SocketAddr> {
    let listener = tokio::net::TcpListener::bind(SocketAddr::from(([127, 0, 0, 1], 0))).await.context("binding a loopback port")?;
    let addr = listener.local_addr()?;
    let mut app = Router::new().nest_service("/v1", data_router(core, Some(owner_key), true));
    if let Some(dir) = web {
        let index = dir.join("index.html");
        app = app.fallback_service(ServeDir::new(dir).fallback(ServeFile::new(index)));
    }
    let svc = app.into_make_service_with_connect_info::<SocketAddr>();
    tokio::spawn(async move {
        if let Err(e) = axum::serve(listener, svc).await {
            eprintln!("3DHeat: the window's server stopped: {e}");
        }
    });
    Ok(addr)
}
