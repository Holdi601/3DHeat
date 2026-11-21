//! The client's address behind a reverse proxy or a tunnel, against a running
//! server on loopback: forwarding headers from a peer nobody trusts change
//! nothing (one address, one budget, one lockout), a trusted proxy's name the
//! client (each client its own budget and lockout), and cloudflared's header
//! counts only once the tunnel is trusted.

use futures_util::{SinkExt, StreamExt};
use heat3d_session::auth::{self, Cost};
use heat3d_session::gateway::NetLimits;
use heat3d_session::proto::{self, client_msg, server_msg, ClientMsg, Hello, ServerMsg};
use heat3d_session::proxy::TrustedProxies;
use heat3d_session::server::{start, Running, ServeConfig};
use heat3d_session::tls::TlsMode;
use prost::Message as _;
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio_tungstenite::tungstenite::Message;

const PW: &str = "correct horse battery";

async fn server(proxies: TrustedProxies, limits: NetLimits) -> Running {
    let dir = std::env::temp_dir().join(format!("heat3d-proxy-test-{}", auth::token()));
    let mut cfg = ServeConfig::new("127.0.0.1:0".parse().unwrap(), dir);
    cfg.tls = TlsMode::Off;
    cfg.password = Some(PW.into());
    cfg.session.cost = Cost::TEST;
    cfg.session.max_per_addr = 64;
    cfg.limits = limits;
    cfg.proxies = proxies;
    start(cfg).await.expect("server")
}

fn proxied(addr: &str) -> TrustedProxies {
    TrustedProxies {
        proxies: vec![addr.parse().unwrap()],
        cloudflared: false,
    }
}

/// A GET with these extra header lines; the status code.
async fn get(r: &Running, extra: &str) -> u16 {
    let mut s = TcpStream::connect(r.addr).await.unwrap();
    let req = format!(
        "GET /session.json HTTP/1.1\r\nHost: {}\r\n{extra}Connection: close\r\n\r\n",
        r.addr
    );
    s.write_all(req.as_bytes()).await.unwrap();
    let mut b = vec![0u8; 256];
    let n = tokio::time::timeout(Duration::from_secs(5), s.read(&mut b))
        .await
        .ok()
        .and_then(|r| r.ok())
        .unwrap_or(0);
    String::from_utf8_lossy(&b[..n])
        .split(' ')
        .nth(1)
        .and_then(|c| c.parse().ok())
        .unwrap_or(0)
}

/// A hello with `password`, the WebSocket opened with these extra headers; the code it was denied with (0: let in or waiting).
async fn try_join(r: &Running, headers: &[(&str, &str)], password: &str) -> i32 {
    use tokio_tungstenite::tungstenite::client::IntoClientRequest;
    let mut req = format!("ws://{}/ws", r.addr).into_client_request().unwrap();
    for (k, v) in headers {
        req.headers_mut().insert(
            axum::http::HeaderName::from_bytes(k.as_bytes()).unwrap(),
            axum::http::HeaderValue::from_str(v).unwrap(),
        );
    }
    let tcp = TcpStream::connect(r.addr).await.unwrap();
    let Ok((mut ws, _)) = tokio_tungstenite::client_async(req, tcp).await else {
        return -1;
    };
    // The challenge first; an unproven key is fine here.
    let _ = tokio::time::timeout(Duration::from_secs(5), ws.next()).await;
    let h = Hello {
        proto: 1,
        name: format!("n{}", auth::token()[..6].to_string()),
        password: password.into(),
        client_key: auth::token(),
        ..Default::default()
    };
    let m = ClientMsg {
        rid: 1,
        body: Some(client_msg::Body::Hello(h)),
    };
    ws.send(Message::Binary(m.encode_to_vec().into()))
        .await
        .unwrap();
    let end = tokio::time::Instant::now() + Duration::from_secs(5);
    loop {
        let left = end.saturating_duration_since(tokio::time::Instant::now());
        match tokio::time::timeout(left, ws.next()).await {
            Ok(Some(Ok(Message::Binary(b)))) => {
                match ServerMsg::decode(b.as_ref()).ok().and_then(|m| m.body) {
                    Some(server_msg::Body::Denied(d)) => return d.code,
                    Some(server_msg::Body::Waiting(_)) | Some(server_msg::Body::Welcome(_)) => {
                        return 0
                    }
                    _ => {}
                }
            }
            Ok(Some(Ok(_))) => {}
            _ => return -2,
        }
    }
}

fn tight() -> NetLimits {
    NetLimits {
        requests_burst: 5.0,
        requests_per_sec: 0.001,
        ..NetLimits::default()
    }
}

#[tokio::test]
async fn spoofed_forwarding_headers_from_an_untrusted_peer_change_nothing() {
    // Nobody trusted: loopback is the client, whatever the headers say.
    let r = server(TrustedProxies::default(), tight()).await;
    for i in 0..5 {
        let h = format!("X-Forwarded-For: 203.0.113.{i}\r\nX-Real-IP: 198.51.100.{i}\r\nCF-Connecting-IP: 192.0.2.{i}\r\n");
        assert_eq!(get(&r, &h).await, 200, "request {i}");
    }
    // Five used up: the sixth is refused, under any name it gives itself.
    assert_eq!(get(&r, "X-Forwarded-For: 203.0.113.77\r\n").await, 429);
    assert_eq!(get(&r, "X-Real-IP: 203.0.113.78\r\n").await, 429);
    assert_eq!(get(&r, "CF-Connecting-IP: 203.0.113.79\r\n").await, 429);
    r.stop().await;

    // A proxy is trusted, but this peer is not it: the same.
    let r = server(proxied("10.20.30.40"), tight()).await;
    for i in 0..5 {
        assert_eq!(get(&r, &format!("X-Real-IP: 203.0.113.{i}\r\n")).await, 200);
    }
    assert_eq!(get(&r, "X-Real-IP: 203.0.113.99\r\n").await, 429);
    r.stop().await;

    // Lockout: five wrong passwords under five spoofed names lock out the one real address.
    let r = server(proxied("10.20.30.40"), NetLimits::default()).await;
    for i in 0..5 {
        let a = format!("203.0.113.{i}");
        let want = if i < 4 {
            proto::Err::BadPassword
        } else {
            proto::Err::LockedOut
        };
        assert_eq!(
            try_join(
                &r,
                &[("x-forwarded-for", &a), ("x-real-ip", &a)],
                "wrong password!"
            )
            .await,
            want as i32,
            "try {i}"
        );
    }
    assert_eq!(
        try_join(&r, &[("x-forwarded-for", "198.51.100.1")], PW).await,
        proto::Err::LockedOut as i32
    );
    r.stop().await;
}

#[tokio::test]
async fn a_trusted_proxy_names_each_client() {
    let r = server(proxied("127.0.0.1"), tight()).await;
    // Each client has its own budget.
    for i in 0..5 {
        assert_eq!(
            get(&r, "X-Real-IP: 203.0.113.1\r\n").await,
            200,
            "request {i}"
        );
    }
    assert_eq!(get(&r, "X-Real-IP: 203.0.113.1\r\n").await, 429);
    assert_eq!(get(&r, "X-Forwarded-For: 203.0.113.1\r\n").await, 429);
    assert_eq!(get(&r, "X-Real-IP: 203.0.113.2\r\n").await, 200);
    assert_eq!(
        get(&r, "X-Forwarded-For: 6.6.6.6, 203.0.113.3\r\n").await,
        200
    );
    // The proxy's own requests (no header) are its own address's.
    for _ in 0..5 {
        assert_eq!(get(&r, "").await, 200);
    }
    assert_eq!(get(&r, "").await, 429);
    // A name that cannot be believed (loopback): one shared bucket, never the host's own.
    for _ in 0..5 {
        assert_eq!(get(&r, "X-Real-IP: 127.0.0.1\r\n").await, 200);
    }
    assert_eq!(get(&r, "X-Real-IP: 127.0.0.1\r\n").await, 429);
    assert_eq!(get(&r, "X-Real-IP: ::1\r\n").await, 429);
    r.stop().await;

    // Lockouts act on the real client: one is locked out, another is not.
    let r = server(proxied("127.0.0.1"), NetLimits::default()).await;
    for i in 0..5 {
        let want = if i < 4 {
            proto::Err::BadPassword
        } else {
            proto::Err::LockedOut
        };
        assert_eq!(
            try_join(&r, &[("x-real-ip", "203.0.113.5")], "wrong password!").await,
            want as i32,
            "try {i}"
        );
    }
    assert_eq!(
        try_join(&r, &[("x-real-ip", "203.0.113.5")], PW).await,
        proto::Err::LockedOut as i32
    );
    assert_eq!(try_join(&r, &[("x-real-ip", "203.0.113.6")], PW).await, 0);
    // The host's own browser (no header) is not locked out either.
    assert_eq!(try_join(&r, &[], PW).await, 0);
    r.stop().await;
}

#[tokio::test]
async fn cloudflareds_header_counts_once_the_tunnel_is_trusted() {
    let r = server(TrustedProxies::default(), tight()).await;
    let control = r.control();
    // Not yet: loopback is one address.
    for i in 0..5 {
        assert_eq!(
            get(&r, &format!("CF-Connecting-IP: 203.0.113.{i}\r\n")).await,
            200
        );
    }
    assert_eq!(get(&r, "CF-Connecting-IP: 203.0.113.50\r\n").await, 429);
    // The tunnel starts: each visitor is its own address (X-Forwarded-For still counts for nothing).
    control.set_proxies(TrustedProxies {
        proxies: vec![],
        cloudflared: true,
    });
    tokio::time::sleep(Duration::from_millis(100)).await;
    assert_eq!(get(&r, "CF-Connecting-IP: 203.0.113.51\r\n").await, 200);
    assert_eq!(
        get(
            &r,
            "CF-Connecting-IP: 203.0.113.52\r\nX-Forwarded-For: 203.0.113.53\r\n"
        )
        .await,
        200
    );
    assert_eq!(get(&r, "X-Forwarded-For: 203.0.113.53\r\n").await, 429);
    // The session says it is reachable from outside while it is.
    let mut s = TcpStream::connect(r.addr).await.unwrap();
    s.write_all(format!("GET /session.json HTTP/1.1\r\nHost: {}\r\nCF-Connecting-IP: 203.0.113.54\r\nConnection: close\r\n\r\n", r.addr).as_bytes()).await.unwrap();
    let mut body = String::new();
    let _ = tokio::time::timeout(Duration::from_secs(5), s.read_to_string(&mut body)).await;
    assert!(body.contains("\"exposed\":true"), "{body}");
    // Stopped: back to one address.
    control.set_proxies(TrustedProxies::default());
    tokio::time::sleep(Duration::from_millis(100)).await;
    assert_eq!(get(&r, "CF-Connecting-IP: 203.0.113.55\r\n").await, 429);
    r.stop().await;
}
