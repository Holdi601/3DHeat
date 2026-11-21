//! `/__heat3d/extractors`: the Extractors panel's route, for the owner of this
//! machine only.
//!
//! - In the app window's own server (`heat3d_server::spawn_local`): a request
//!   from this machine carrying the window's key (`x-heat3d-key`), which only
//!   the window is told.
//! - In `3dheat serve`: mounted as a host-only service (`ServeConfig::host_mount`).
//!   The gateway forwards a request only with the host's token and marks it as
//!   the host's; the core then sees it as from this machine. Members of a
//!   session and strangers get 403 from the gateway and never reach it.
//!
//! - `GET /` the state (`Manager::state`).
//! - `POST /refresh` looks up the latest releases (`?fresh=1`: past the cache), then the state.
//! - `POST /install/{id}` installs or updates in the background (202); the state shows the progress.
//! - `POST /update-all` updates every installed extractor with a newer release.
//! - `POST /remove/{id}`, `POST /run/{id}`, `POST /check/{id}`.

use std::net::SocketAddr;
use std::sync::Arc;

use axum::extract::{ConnectInfo, Path, Query, Request, State};
use axum::http::{header, HeaderMap, StatusCode};
use axum::middleware::{self, Next};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use serde_json::json;

use crate::manager::Manager;

/// Who may use the route (see the module doc).
#[derive(Clone)]
pub enum Auth {
    /// The app window: from this machine, with this key.
    Key(Arc<str>),
    /// Behind the session server's gateway: what it marked as the host's (seen as from this machine).
    Host,
}

fn same(a: &[u8], b: &[u8]) -> bool {
    a.len() == b.len() && a.iter().zip(b).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

async fn guard(State(auth): State<Auth>, req: Request, next: Next) -> Response {
    let local = req.extensions().get::<ConnectInfo<SocketAddr>>().is_some_and(|c| c.0.ip().is_loopback());
    let ok = local
        && match &auth {
            Auth::Key(k) => req.headers().get("x-heat3d-key").is_some_and(|v| same(v.as_bytes(), k.as_bytes())),
            Auth::Host => true,
        };
    if !ok {
        return StatusCode::FORBIDDEN.into_response();
    }
    let mut res = next.run(req).await;
    res.headers_mut().insert(header::CACHE_CONTROL, header::HeaderValue::from_static("no-store"));
    res
}

type M = Arc<Manager>;

fn refused(code: StatusCode, why: String) -> Response {
    (code, Json(json!({ "error": why }))).into_response()
}

async fn state(State(m): State<M>) -> Response {
    Json(m.state()).into_response()
}

#[derive(serde::Deserialize)]
struct Fresh {
    fresh: Option<String>,
}

async fn refresh(State(m): State<M>, Query(q): Query<Fresh>) -> Response {
    m.refresh(q.fresh.as_deref() == Some("1")).await;
    Json(m.state()).into_response()
}

async fn install(State(m): State<M>, Path(id): Path<String>) -> Response {
    match m.install(&id) {
        Ok(()) => (StatusCode::ACCEPTED, Json(m.state())).into_response(),
        Err(e) => refused(StatusCode::CONFLICT, e),
    }
}

async fn update_all(State(m): State<M>) -> Response {
    let started = m.update_all().await;
    (StatusCode::ACCEPTED, Json(json!({ "started": started }))).into_response()
}

async fn remove(State(m): State<M>, Path(id): Path<String>) -> Response {
    match m.remove(&id) {
        Ok(()) => Json(m.state()).into_response(),
        Err(e) => refused(StatusCode::CONFLICT, e),
    }
}

async fn run(State(m): State<M>, Path(id): Path<String>) -> Response {
    match m.run(&id) {
        Ok(()) => Json(m.state()).into_response(),
        Err(e) => refused(StatusCode::CONFLICT, e),
    }
}

async fn check(State(m): State<M>, Path(id): Path<String>) -> Response {
    Json(m.check_and_keep(&id).await).into_response()
}

async fn unavailable(_: HeaderMap) -> Response {
    refused(StatusCode::SERVICE_UNAVAILABLE, "the extractors manager does not work on this system".into())
}

/// The route, to mount at `/__heat3d/extractors`; without a manager (`Manager::shared` gave none) every request gets 503.
pub fn router(manager: Option<Arc<Manager>>, auth: Auth) -> Router {
    let r = match manager {
        Some(m) => Router::new()
            .route("/", get(state))
            .route("/refresh", post(refresh))
            .route("/install/{id}", post(install))
            .route("/update-all", post(update_all))
            .route("/remove/{id}", post(remove))
            .route("/run/{id}", post(run))
            .route("/check/{id}", post(check))
            .with_state(m),
        None => Router::new().fallback(unavailable),
    };
    r.layer(middleware::from_fn_with_state(auth, guard))
}
