//! Member services through the gateway (the video fallback's signalling, Stage 8),
//! against a running server on loopback: only a joined member's token gets through;
//! the gateway names member, role, the role's video limit and the address itself,
//! and whatever a client puts in those headers is dropped; POST only, small bodies,
//! a budget per member. A member's own token after a kick is refused.

use axum::http::HeaderMap;
use futures_util::{SinkExt, StreamExt};
use heat3d_session::auth::{self, Cost};
use heat3d_session::proto::{client_msg, server_msg, ClientMsg, Hello, Role, ServerMsg};
use heat3d_session::server::{start, Running, ServeConfig};
use heat3d_session::tls::TlsMode;
use prost::Message as _;
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio_tungstenite::tungstenite::Message;

/// Echoes what the gateway named, as the core's member service sees it.
fn echo() -> axum::Router {
    axum::Router::new().route(
        "/{*rest}",
        axum::routing::post(|h: HeaderMap, body: axum::body::Bytes| async move {
            let g = |k: &str| h.get(k).and_then(|v| v.to_str().ok()).unwrap_or("-").to_owned();
            format!("member={} role={} limit={} peer={} lan={} body={}", g("x-heat3d-member"), g("x-heat3d-role"), g("x-heat3d-video-limit"), g("x-heat3d-peer"), g("x-heat3d-lan"), body.len())
        }),
    )
}

async fn server() -> Running {
    let dir = std::env::temp_dir().join(format!("heat3d-member-mount-{}", auth::token()));
    let mut cfg = ServeConfig::new("127.0.0.1:0".parse().unwrap(), dir);
    cfg.tls = TlsMode::Off;
    cfg.host_token = Some("ab".repeat(32));
    cfg.session.cost = Cost::TEST;
    cfg.session.max_per_addr = 64;
    cfg.member_mount.push(("/__heat3d/video".into(), echo()));
    start(cfg).await.expect("server")
}

/// Joins as the host (by its token); the member token the welcome hands out, and the socket (kept open: a member is joined while connected).
async fn join_host(r: &Running) -> (String, tokio_tungstenite::WebSocketStream<TcpStream>) {
    use tokio_tungstenite::tungstenite::client::IntoClientRequest;
    let req = format!("ws://{}/ws", r.addr).into_client_request().unwrap();
    let tcp = TcpStream::connect(r.addr).await.unwrap();
    let (mut ws, _) = tokio_tungstenite::client_async(req, tcp).await.unwrap();
    let _ = tokio::time::timeout(Duration::from_secs(5), ws.next()).await;
    let h = Hello { proto: 1, name: "host".into(), host_token: "ab".repeat(32), client_key: auth::token(), ..Default::default() };
    ws.send(Message::Binary(ClientMsg { rid: 1, body: Some(client_msg::Body::Hello(h)) }.encode_to_vec().into())).await.unwrap();
    let end = tokio::time::Instant::now() + Duration::from_secs(5);
    loop {
        let left = end.saturating_duration_since(tokio::time::Instant::now());
        match tokio::time::timeout(left, ws.next()).await {
            Ok(Some(Ok(Message::Binary(b)))) => {
                if let Some(server_msg::Body::Welcome(w)) = ServerMsg::decode(b.as_ref()).ok().and_then(|m| m.body) {
                    assert_eq!(w.role, Role::Host as i32);
                    return (w.resume, ws);
                }
            }
            Ok(Some(Ok(_))) => {}
            other => panic!("no welcome: {other:?}"),
        }
    }
}

async fn ask(r: &Running, method: &str, path: &str, headers: &str, body: &str) -> (u16, String) {
    let mut s = TcpStream::connect(r.addr).await.unwrap();
    let req = format!("{method} {path} HTTP/1.1\r\nHost: {}\r\n{headers}Content-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}", r.addr, body.len());
    s.write_all(req.as_bytes()).await.unwrap();
    let mut b = Vec::new();
    let _ = tokio::time::timeout(Duration::from_secs(5), s.read_to_end(&mut b)).await;
    let text = String::from_utf8_lossy(&b).to_string();
    (text.split(' ').nth(1).and_then(|c| c.parse().ok()).unwrap_or(0), text)
}

#[tokio::test]
async fn only_joined_members_and_the_gateway_names_them() {
    let r = server().await;
    let forged = "x-heat3d-member: 1\r\nx-heat3d-role: host\r\nx-heat3d-video-limit: 7680,4320,120,100000\r\nx-heat3d-lan: 1\r\n";
    // No token, a forged identity, the host's token itself (not a member's), a made-up token.
    assert_eq!(ask(&r, "POST", "/__heat3d/video/offer", "", "{}").await.0, 401);
    assert_eq!(ask(&r, "POST", "/__heat3d/video/offer", forged, "{}").await.0, 401);
    let host_token = format!("Authorization: Bearer {}\r\n", "ab".repeat(32));
    assert_eq!(ask(&r, "POST", "/__heat3d/video/info", &host_token, "{}").await.0, 401);
    assert_eq!(ask(&r, "POST", "/__heat3d/video/info", &format!("Authorization: Bearer {}\r\n", "cd".repeat(32)), "{}").await.0, 401);

    let (token, ws) = join_host(&r).await;
    let me = format!("Authorization: Bearer {token}\r\n");
    // A joined member: named by the gateway, whatever it claims itself.
    let (code, text) = ask(&r, "POST", "/__heat3d/video/info", &format!("{me}{forged}"), "{\"a\":1}").await;
    assert_eq!(code, 200, "{text}");
    assert!(text.contains("role=host") && text.contains("limit=1920,1080,60,12000") && text.contains("peer=127.0.0.1") && text.contains("lan=1") && text.contains("body=7"), "{text}");
    assert!(!text.contains("7680"), "the client's own limit never reaches the service: {text}");
    // POST only; bodies over the cap refused before the core sees them.
    assert_eq!(ask(&r, "GET", "/__heat3d/video/info", &me, "").await.0, 405);
    let big = "x".repeat(65 * 1024);
    assert_eq!(ask(&r, "POST", "/__heat3d/video/offer", &me, &big).await.0, 413);
    // Offers: six a minute per member (the big one above took one).
    let mut codes = Vec::new();
    for _ in 0..7 {
        codes.push(ask(&r, "POST", "/__heat3d/video/offer", &me, "{}").await.0);
    }
    assert!(codes[..5].iter().all(|c| *c == 200) && codes[5..].iter().all(|c| *c == 429), "{codes:?}");
    // Gone from the session: the token no longer opens anything.
    drop(ws);
    tokio::time::sleep(Duration::from_millis(300)).await;
    assert_eq!(ask(&r, "POST", "/__heat3d/video/renew", &me, "").await.0, 401);
    r.stop().await;
}
