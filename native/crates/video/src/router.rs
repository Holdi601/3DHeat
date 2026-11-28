//! The signalling, mounted in the session server at `/__heat3d/video` as a
//! member service: the gateway forwards a request only with a joined member's
//! token, and names who it is (`x-heat3d-member`, `x-heat3d-role`), what the
//! role may have (`x-heat3d-video-limit`) and where it is (`x-heat3d-peer`,
//! `x-heat3d-lan`). A request without those never came through the gateway:
//! refused.
//!
//! - `POST /info`: whether the host sends video, and the codecs it encodes;
//! - `POST /offer`: the page's SDP offer, codecs and first camera; the answer;
//! - `POST /renew`: keeps the member's stream (every few seconds; it ends 15 s after the last);
//! - `POST /stop`: ends it;
//! - `POST /stats`: the streams' numbers, for the host only.

use std::net::IpAddr;
use std::sync::{Arc, OnceLock};

use axum::extract::{DefaultBodyLimit, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::post;
use axum::{Json, Router};
use serde::Deserialize;

use crate::encode::{self, Codec};
use crate::host::VideoHost;
use crate::stream::{self, Offer};
use crate::view::{RoleLimit, ViewParams};

/// The gateway's headers (it strips any a client sends; `to_core` copies none of these).
pub const MEMBER: &str = "x-heat3d-member";
pub const ROLE: &str = "x-heat3d-role";
pub const LIMIT: &str = "x-heat3d-video-limit";
pub const PEER: &str = "x-heat3d-peer";
pub const LAN: &str = "x-heat3d-lan";

/// Who asks, as the gateway named them.
#[derive(Clone, Debug)]
pub struct Who {
    pub member: u64,
    pub role: String,
    pub limit: RoleLimit,
    pub peer: IpAddr,
    pub lan: bool,
}

pub fn who(h: &HeaderMap) -> Option<Who> {
    let s = |k: &str| h.get(k).and_then(|v| v.to_str().ok());
    Some(Who {
        member: s(MEMBER)?.parse().ok()?,
        role: s(ROLE)?.to_owned(),
        limit: RoleLimit::parse(s(LIMIT)?)?,
        peer: s(PEER)?.parse().ok()?,
        lan: s(LAN)? == "1",
    })
}

/// A refusal: the host's words, and a short code the page turns into its own (`kind`:
/// session, lan, bad, off, full, viewport, start, none, host).
fn refuse_as(code: StatusCode, kind: &str, why: &str) -> Response {
    (code, Json(serde_json::json!({ "error": why, "code": kind }))).into_response()
}

fn refuse(code: StatusCode, why: &str) -> Response {
    let kind = match code {
        StatusCode::FORBIDDEN => "session",
        StatusCode::BAD_REQUEST => "bad",
        StatusCode::NOT_FOUND => "none",
        _ => "start",
    };
    refuse_as(code, kind, why)
}

pub fn router(host: Arc<VideoHost>) -> Router {
    Router::new()
        .route("/info", post(info))
        .route("/offer", post(offer))
        .route("/renew", post(renew))
        .route("/stop", post(stop))
        .route("/stats", post(stats))
        .layer(DefaultBodyLimit::max(64 * 1024))
        .with_state(host)
}

fn codecs() -> &'static Vec<(Codec, bool)> {
    static C: OnceLock<Vec<(Codec, bool)>> = OnceLock::new();
    C.get_or_init(encode::codecs)
}

async fn info(State(host): State<Arc<VideoHost>>, headers: HeaderMap) -> Response {
    let Some(w) = who(&headers) else { return refuse(StatusCode::FORBIDDEN, "not through the session") };
    let list = tokio::task::spawn_blocking(codecs).await.map(|c| c.clone()).unwrap_or_default();
    let ready = host.source().is_some_and(|s| s.ready());
    Json(serde_json::json!({
        "available": ready && host.enabled() && !list.is_empty(),
        "viewport": ready,
        "max": host.max_streams(), "running": host.running(), "encoded": host.encoded(),
        "lan": w.lan,
        "codecs": list.iter().map(|(c, hw)| serde_json::json!({ "codec": c, "hardware": hw })).collect::<Vec<_>>(),
        "limit": { "width": w.limit.width, "height": w.limit.height, "fps": w.limit.fps, "kbps": w.limit.kbps },
    }))
    .into_response()
}

#[derive(Deserialize)]
struct Camera {
    view: Vec<f32>,
    fov: f32,
    #[serde(default)]
    ortho: bool,
    #[serde(default, rename = "orthoHeight")]
    ortho_height: f32,
    width: u32,
    height: u32,
}

#[derive(Deserialize)]
struct OfferBody {
    offer: str0m::change::SdpOffer,
    #[serde(default)]
    codecs: Vec<String>,
    camera: Camera,
    /// It follows the host's camera: the shared stream.
    #[serde(default)]
    follow: bool,
}

async fn offer(State(host): State<Arc<VideoHost>>, headers: HeaderMap, body: axum::body::Bytes) -> Response {
    let Some(w) = who(&headers) else { return refuse(StatusCode::FORBIDDEN, "not through the session") };
    if !w.lan {
        // Media goes straight between the two machines (host candidates only): a member reached
        // through a tunnel or proxy would need a TURN relay, and none is configured.
        return refuse_as(StatusCode::FORBIDDEN, "lan", "video needs the local network (no TURN relay is configured)");
    }
    let Ok(b) = serde_json::from_slice::<OfferBody>(&body) else { return refuse(StatusCode::BAD_REQUEST, "not an offer") };
    let Ok(view) = <[f32; 16]>::try_from(b.camera.view.as_slice()) else { return refuse(StatusCode::BAD_REQUEST, "the camera's view") };
    let c = ViewParams { view, fov: b.camera.fov, ortho: b.camera.ortho, ortho_height: b.camera.ortho_height, width: b.camera.width, height: b.camera.height, seq: 0, sent_ms: 0.0, follow_host: false };
    // The same checks as every camera message (finite, in range, within the role's size).
    let Some(view) = ViewParams::decode(&c.encode(), &w.limit) else { return refuse(StatusCode::BAD_REQUEST, "the camera") };
    let mut list: Vec<Codec> = b.codecs.iter().take(8).filter_map(|s| Codec::parse(s)).collect();
    if list.is_empty() {
        list.push(Codec::H264);
    }
    if !host.enabled() {
        return refuse_as(StatusCode::SERVICE_UNAVAILABLE, "off", "the host has video streams off");
    }
    if host.source().is_none() {
        return refuse_as(StatusCode::SERVICE_UNAVAILABLE, "viewport", "the host's native viewport is not running (Settings > Native viewport)");
    }
    let h = host.clone();
    let follow = b.follow;
    let r = tokio::task::spawn_blocking(move || stream::start(&h, w.member, w.limit, w.peer, Offer { sdp: b.offer, codecs: list, view, follow })).await;
    match r {
        Ok(Ok(a)) => Json(a).into_response(),
        Ok(Err(e)) => refuse_as(if e.code == "bad" { StatusCode::BAD_REQUEST } else { StatusCode::SERVICE_UNAVAILABLE }, e.code, &e.why),
        Err(_) => refuse(StatusCode::INTERNAL_SERVER_ERROR, "the stream did not start"),
    }
}

async fn renew(State(host): State<Arc<VideoHost>>, headers: HeaderMap) -> Response {
    let Some(w) = who(&headers) else { return refuse(StatusCode::FORBIDDEN, "not through the session") };
    if host.renew(w.member) {
        StatusCode::NO_CONTENT.into_response()
    } else {
        refuse(StatusCode::NOT_FOUND, "no stream")
    }
}

async fn stop(State(host): State<Arc<VideoHost>>, headers: HeaderMap) -> Response {
    let Some(w) = who(&headers) else { return refuse(StatusCode::FORBIDDEN, "not through the session") };
    host.stop(w.member);
    StatusCode::NO_CONTENT.into_response()
}

async fn stats(State(host): State<Arc<VideoHost>>, headers: HeaderMap) -> Response {
    match who(&headers) {
        Some(w) if w.role == "host" => Json(host.stats_json()).into_response(),
        _ => refuse_as(StatusCode::FORBIDDEN, "host", "the host's only"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::Request;
    use tower::ServiceExt;

    fn req(path: &str, headers: &[(&str, &str)], body: &str) -> Request<Body> {
        let mut r = Request::post(path).header("content-type", "application/json");
        for (k, v) in headers {
            r = r.header(*k, *v);
        }
        r.body(Body::from(body.to_owned())).unwrap()
    }

    const MEMBER_OK: [(&str, &str); 5] = [(MEMBER, "7"), (ROLE, "viewer"), (LIMIT, "1280,720,30,4000"), (PEER, "192.168.1.20"), (LAN, "1")];

    #[tokio::test]
    async fn only_through_the_gateway_and_by_role() {
        let r = router(Arc::new(VideoHost::new(4)));
        for path in ["/info", "/offer", "/renew", "/stop", "/stats"] {
            let res = r.clone().oneshot(req(path, &[], "{}")).await.unwrap();
            assert_eq!(res.status(), StatusCode::FORBIDDEN, "{path} without the gateway's headers");
        }
        // A broken limit header: as if not through the gateway.
        let bad = [(MEMBER, "7"), (ROLE, "viewer"), (LIMIT, "99999,1,1,1"), (PEER, "192.168.1.20"), (LAN, "1")];
        assert_eq!(r.clone().oneshot(req("/info", &bad, "{}")).await.unwrap().status(), StatusCode::FORBIDDEN);
        // Statistics are the host's.
        assert_eq!(r.clone().oneshot(req("/stats", &MEMBER_OK, "{}")).await.unwrap().status(), StatusCode::FORBIDDEN);
        let host = [(MEMBER, "1"), (ROLE, "host"), (LIMIT, "2560,1440,60,16000"), (PEER, "127.0.0.1"), (LAN, "1")];
        assert_eq!(r.clone().oneshot(req("/stats", &host, "{}")).await.unwrap().status(), StatusCode::OK);
        // Not on the LAN: no media (no TURN).
        let away = [(MEMBER, "7"), (ROLE, "viewer"), (LIMIT, "1280,720,30,4000"), (PEER, "203.0.113.5"), (LAN, "0")];
        let res = r.clone().oneshot(req("/offer", &away, "{}")).await.unwrap();
        assert_eq!(res.status(), StatusCode::FORBIDDEN);
        // With a code the page puts in its own words.
        let body = axum::body::to_bytes(res.into_body(), 4096).await.unwrap();
        let j: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(j["code"], "lan");
        // Garbage offers and cameras.
        assert_eq!(r.clone().oneshot(req("/offer", &MEMBER_OK, "{\"x\":1}")).await.unwrap().status(), StatusCode::BAD_REQUEST);
        let nan_cam = r#"{"offer":{"type":"offer","sdp":"v=0"},"camera":{"view":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],"fov":500,"width":800,"height":600}}"#;
        let res = r.clone().oneshot(req("/offer", &MEMBER_OK, nan_cam)).await.unwrap();
        assert!(res.status() == StatusCode::BAD_REQUEST, "{:?}", res.status());
        // A body over the limit.
        let big = "x".repeat(70 * 1024);
        assert_eq!(r.clone().oneshot(req("/offer", &MEMBER_OK, &big)).await.unwrap().status(), StatusCode::PAYLOAD_TOO_LARGE);
        // No viewport: refused (the cap and the source come before any socket).
        assert_eq!(r.clone().oneshot(req("/renew", &MEMBER_OK, "")).await.unwrap().status(), StatusCode::NOT_FOUND);
    }
}
