//! Attacks on a session server, for the pentest (docs/multiplayer.md,
//! "Security"): floods of connections and requests from many addresses of
//! this machine (127.0.0.2 and up: Windows and Linux answer the whole
//! 127.0.0.0/8 as loopback), slow clients, spam from admitted members,
//! oversized and malformed messages, password guessing. Only ever against a
//! server on this machine: it refuses any other address.
//!
//!   attack <https://127.0.0.1:PORT> <mode> [args]
//!
//! Modes:
//!   wsflood N SECS        N WebSockets (TLS and upgrade), idle, held SECS
//!   tcpflood N SECS       N TCP connections that never say anything
//!   slowloris N SECS      N requests whose head arrives a byte every 5 s
//!   slowread N SECS PATH  N downloads of PATH read a byte a second
//!   httpflood N SECS      N clients asking for / and /session.json as fast as they can
//!   brute N               N password guesses from N/5 addresses
//!   spam INVITE N SECS    N members by an invite: batches, look-here, follow, huge and broken frames
//!   probe INVITE SECS     one member pinging: round trips and /session.json, p50/p99/max
//!
//! Every mode prints one JSON line of what happened.

use futures_util::{SinkExt, StreamExt};
use heat3d_session::proto::{
    client_msg, server_msg, Batch, ClientMsg, FollowSet, Hello, LookHere, Op, OpKind, Ping, Pose,
    ServerMsg, Vec3,
};
use prost::Message as _;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpSocket, TcpStream};
use tokio_tungstenite::tungstenite::Message;

type Tls = tokio_rustls::client::TlsStream<TcpStream>;

#[derive(Debug)]
struct AnyCert;

impl rustls::client::danger::ServerCertVerifier for AnyCert {
    fn verify_server_cert(
        &self,
        _: &rustls::pki_types::CertificateDer<'_>,
        _: &[rustls::pki_types::CertificateDer<'_>],
        _: &rustls::pki_types::ServerName<'_>,
        _: &[u8],
        _: rustls::pki_types::UnixTime,
    ) -> Result<rustls::client::danger::ServerCertVerified, rustls::Error> {
        Ok(rustls::client::danger::ServerCertVerified::assertion())
    }
    fn verify_tls12_signature(
        &self,
        _: &[u8],
        _: &rustls::pki_types::CertificateDer<'_>,
        _: &rustls::DigitallySignedStruct,
    ) -> Result<rustls::client::danger::HandshakeSignatureValid, rustls::Error> {
        Ok(rustls::client::danger::HandshakeSignatureValid::assertion())
    }
    fn verify_tls13_signature(
        &self,
        _: &[u8],
        _: &rustls::pki_types::CertificateDer<'_>,
        _: &rustls::DigitallySignedStruct,
    ) -> Result<rustls::client::danger::HandshakeSignatureValid, rustls::Error> {
        Ok(rustls::client::danger::HandshakeSignatureValid::assertion())
    }
    fn supported_verify_schemes(&self) -> Vec<rustls::SignatureScheme> {
        rustls::crypto::ring::default_provider()
            .signature_verification_algorithms
            .supported_schemes()
    }
}

struct Target {
    addr: SocketAddr,
    tls: bool,
    host: String,
    connector: tokio_rustls::TlsConnector,
}

enum Conn {
    Plain(TcpStream),
    Tls(Box<Tls>),
}

impl Target {
    /// A TCP connection from 127.0.0.`src` (2..=254).
    async fn tcp(&self, src: u8) -> std::io::Result<TcpStream> {
        let s = TcpSocket::new_v4()?;
        s.bind(SocketAddr::new(
            IpAddr::V4(Ipv4Addr::new(127, 0, 0, src)),
            0,
        ))?;
        tokio::time::timeout(Duration::from_secs(10), s.connect(self.addr))
            .await
            .map_err(|_| std::io::ErrorKind::TimedOut)?
    }

    async fn conn(&self, src: u8) -> std::io::Result<Conn> {
        let t = self.tcp(src).await?;
        if !self.tls {
            return Ok(Conn::Plain(t));
        }
        let name = rustls::pki_types::ServerName::try_from("localhost").unwrap();
        let s = tokio::time::timeout(Duration::from_secs(10), self.connector.connect(name, t))
            .await
            .map_err(|_| std::io::ErrorKind::TimedOut)??;
        Ok(Conn::Tls(Box::new(s)))
    }

    fn ws_url(&self) -> String {
        format!("{}://{}/ws", if self.tls { "wss" } else { "ws" }, self.host)
    }
}

type Ws = tokio_tungstenite::WebSocketStream<Box<dyn Io>>;
trait Io: tokio::io::AsyncRead + tokio::io::AsyncWrite + Unpin + Send {}
impl<T: tokio::io::AsyncRead + tokio::io::AsyncWrite + Unpin + Send> Io for T {}

impl Conn {
    fn boxed(self) -> Box<dyn Io> {
        match self {
            Conn::Plain(t) => Box::new(t),
            Conn::Tls(t) => Box::new(*t),
        }
    }
}

async fn ws(t: &Target, src: u8) -> Result<Ws, String> {
    let c = t.conn(src).await.map_err(|e| e.to_string())?;
    let req =
        tokio_tungstenite::tungstenite::client::IntoClientRequest::into_client_request(t.ws_url())
            .map_err(|e| e.to_string())?;
    let (w, _) = tokio::time::timeout(
        Duration::from_secs(10),
        tokio_tungstenite::client_async(req, c.boxed()),
    )
    .await
    .map_err(|_| "upgrade timed out".to_string())?
    .map_err(|e| match e {
        tokio_tungstenite::tungstenite::Error::Http(r) => format!("http {}", r.status().as_u16()),
        e => e.to_string(),
    })?;
    Ok(w)
}

fn src_of(i: usize) -> u8 {
    2 + (i % 250) as u8
}

fn msg(body: client_msg::Body) -> Message {
    Message::Binary(
        ClientMsg {
            rid: 0,
            body: Some(body),
        }
        .encode_to_vec()
        .into(),
    )
}

fn pose(a: f32) -> Pose {
    Pose {
        position: Some(Vec3 {
            x: 100.0 * a.cos(),
            y: 50.0,
            z: 100.0 * a.sin(),
        }),
        forward: Some(Vec3 {
            x: -a.cos(),
            y: -0.3,
            z: -a.sin(),
        }),
        fov: 60.0,
        aspect: 1.7,
        ..Default::default()
    }
}

/// Joins by an invite; the socket after the welcome (or None).
async fn join(t: &Target, src: u8, invite: &str, name: &str) -> Option<Ws> {
    let mut w = ws(t, src).await.ok()?;
    let _challenge = tokio::time::timeout(Duration::from_secs(5), w.next())
        .await
        .ok()??;
    w.send(msg(client_msg::Body::Hello(Hello {
        proto: 1,
        name: name.into(),
        invite: invite.into(),
        client_key: format!("u:{name}"),
        ..Default::default()
    })))
    .await
    .ok()?;
    let until = Instant::now() + Duration::from_secs(10);
    while Instant::now() < until {
        let m = tokio::time::timeout(Duration::from_secs(5), w.next())
            .await
            .ok()??
            .ok()?;
        if let Message::Binary(b) = m {
            match ServerMsg::decode(b.as_ref()) {
                Ok(ServerMsg {
                    body: Some(server_msg::Body::Welcome(_)),
                }) => return Some(w),
                Ok(ServerMsg {
                    body: Some(server_msg::Body::Denied(_)),
                }) => return None,
                _ => {}
            }
        }
    }
    None
}

fn pct(v: &mut [f64]) -> serde_json::Value {
    if v.is_empty() {
        return serde_json::json!(null);
    }
    v.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let p = |q: f64| v[((v.len() as f64 - 1.0) * q).round() as usize];
    serde_json::json!({ "n": v.len(), "p50_ms": p(0.5), "p99_ms": p(0.99), "max_ms": v[v.len() - 1] })
}

#[tokio::main(flavor = "multi_thread", worker_threads = 8)]
async fn main() {
    let _ = rustls::crypto::ring::default_provider().install_default();
    let args: Vec<String> = std::env::args().skip(1).collect();
    let url = args.first().cloned().unwrap_or_default();
    let (tls, rest) = if let Some(r) = url.strip_prefix("https://") {
        (true, r)
    } else if let Some(r) = url.strip_prefix("http://") {
        (false, r)
    } else {
        eprintln!("attack <https://127.0.0.1:PORT> <mode> ...");
        std::process::exit(2);
    };
    let host = rest.trim_end_matches('/').to_string();
    let addr: SocketAddr = host.parse().expect("an address and port");
    // This machine only.
    assert!(
        addr.ip().is_loopback(),
        "attack only a server on this machine"
    );
    let cfg = rustls::ClientConfig::builder()
        .dangerous()
        .with_custom_certificate_verifier(Arc::new(AnyCert))
        .with_no_client_auth();
    let t = Arc::new(Target {
        addr,
        tls,
        host,
        connector: tokio_rustls::TlsConnector::from(Arc::new(cfg)),
    });
    let mode = args.get(1).cloned().unwrap_or_default();
    let n: usize = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(100);
    let secs: u64 = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(20);
    let ok = Arc::new(AtomicU64::new(0));
    let refused = Arc::new(AtomicU64::new(0));
    let closed_early = Arc::new(AtomicU64::new(0));
    let start = Instant::now();
    let mut tasks = Vec::new();
    match mode.as_str() {
        "wsflood" => {
            for i in 0..n {
                let (t, ok, refused, closed_early) =
                    (t.clone(), ok.clone(), refused.clone(), closed_early.clone());
                tasks.push(tokio::spawn(async move {
                    match ws(&t, src_of(i)).await {
                        Ok(mut w) => {
                            ok.fetch_add(1, Ordering::Relaxed);
                            // Idle: no hello. How long does the server keep it?
                            let held = tokio::time::timeout(Duration::from_secs(secs), async {
                                while let Some(Ok(_)) = w.next().await {}
                            })
                            .await;
                            if held.is_ok() {
                                closed_early.fetch_add(1, Ordering::Relaxed);
                            }
                        }
                        Err(_) => {
                            refused.fetch_add(1, Ordering::Relaxed);
                        }
                    }
                }));
                if i % 200 == 199 {
                    tokio::time::sleep(Duration::from_millis(20)).await;
                }
            }
        }
        "tcpflood" => {
            for i in 0..n {
                let (t, ok, refused, closed_early) =
                    (t.clone(), ok.clone(), refused.clone(), closed_early.clone());
                tasks.push(tokio::spawn(async move {
                    match t.tcp(src_of(i)).await {
                        Ok(mut s) => {
                            ok.fetch_add(1, Ordering::Relaxed);
                            let mut b = [0u8; 16];
                            if let Ok(Ok(0)) | Ok(Err(_)) =
                                tokio::time::timeout(Duration::from_secs(secs), s.read(&mut b))
                                    .await
                            {
                                closed_early.fetch_add(1, Ordering::Relaxed);
                            }
                        }
                        Err(_) => {
                            refused.fetch_add(1, Ordering::Relaxed);
                        }
                    }
                }));
            }
        }
        "slowloris" => {
            for i in 0..n {
                let (t, ok, refused, closed_early) =
                    (t.clone(), ok.clone(), refused.clone(), closed_early.clone());
                tasks.push(tokio::spawn(async move {
                    let Ok(c) = t.conn(src_of(i)).await else {
                        refused.fetch_add(1, Ordering::Relaxed);
                        return;
                    };
                    let mut c = c.boxed();
                    ok.fetch_add(1, Ordering::Relaxed);
                    let _ = c.write_all(b"GET / HTTP/1.1\r\nHost: localhost\r\n").await;
                    let end = Instant::now() + Duration::from_secs(secs);
                    while Instant::now() < end {
                        tokio::time::sleep(Duration::from_secs(5)).await;
                        if c.write_all(b"X").await.is_err() || c.flush().await.is_err() {
                            closed_early.fetch_add(1, Ordering::Relaxed);
                            return;
                        }
                    }
                }));
            }
        }
        "slowread" => {
            let path = args.get(4).cloned().unwrap_or_else(|| "/".into());
            for i in 0..n {
                let (t, ok, refused, closed_early, path) = (
                    t.clone(),
                    ok.clone(),
                    refused.clone(),
                    closed_early.clone(),
                    path.clone(),
                );
                tasks.push(tokio::spawn(async move {
                    let Ok(c) = t.conn(src_of(i)).await else {
                        refused.fetch_add(1, Ordering::Relaxed);
                        return;
                    };
                    let mut c = c.boxed();
                    ok.fetch_add(1, Ordering::Relaxed);
                    let _ = c
                        .write_all(
                            format!("GET {path} HTTP/1.1\r\nHost: localhost\r\n\r\n").as_bytes(),
                        )
                        .await;
                    let end = Instant::now() + Duration::from_secs(secs);
                    let mut b = [0u8; 1];
                    while Instant::now() < end {
                        match c.read(&mut b).await {
                            Ok(0) | Err(_) => {
                                closed_early.fetch_add(1, Ordering::Relaxed);
                                return;
                            }
                            _ => tokio::time::sleep(Duration::from_secs(1)).await,
                        }
                    }
                }));
            }
        }
        "httpflood" => {
            let reqs = Arc::new(AtomicU64::new(0));
            let limited = Arc::new(AtomicU64::new(0));
            for i in 0..n {
                let (t, reqs, limited, refused) =
                    (t.clone(), reqs.clone(), limited.clone(), refused.clone());
                tasks.push(tokio::spawn(async move {
                    let end = Instant::now() + Duration::from_secs(secs);
                    while Instant::now() < end {
                        let Ok(c) = t.conn(src_of(i)).await else {
                            refused.fetch_add(1, Ordering::Relaxed);
                            tokio::time::sleep(Duration::from_millis(50)).await;
                            continue;
                        };
                        let mut c = c.boxed();
                        for k in 0..50 {
                            let p = if k % 2 == 0 { "/" } else { "/session.json" };
                            if c.write_all(
                                format!("GET {p} HTTP/1.1\r\nHost: localhost\r\n\r\n").as_bytes(),
                            )
                            .await
                            .is_err()
                            {
                                break;
                            }
                            let mut head = Vec::new();
                            let mut b = [0u8; 4096];
                            // The status line is enough; the rest is read and dropped.
                            match tokio::time::timeout(Duration::from_secs(5), c.read(&mut b)).await
                            {
                                Ok(Ok(n)) if n > 0 => head.extend_from_slice(&b[..n]),
                                _ => break,
                            }
                            reqs.fetch_add(1, Ordering::Relaxed);
                            if head.starts_with(b"HTTP/1.1 429") {
                                limited.fetch_add(1, Ordering::Relaxed);
                            }
                            // Drain what is left of the answer for a moment.
                            let _ = tokio::time::timeout(Duration::from_millis(5), c.read(&mut b))
                                .await;
                        }
                    }
                }));
            }
            for t in tasks {
                let _ = t.await;
            }
            println!(
                "{}",
                serde_json::json!({ "mode": mode, "clients": n, "secs": secs, "requests": reqs.load(Ordering::Relaxed), "limited_429": limited.load(Ordering::Relaxed), "connects_refused": refused.load(Ordering::Relaxed) })
            );
            return;
        }
        "brute" => {
            let denied = Arc::new(AtomicU64::new(0));
            let locked = Arc::new(AtomicU64::new(0));
            for i in 0..n {
                let (t, denied, locked, refused) =
                    (t.clone(), denied.clone(), locked.clone(), refused.clone());
                tasks.push(tokio::spawn(async move {
                    let Ok(mut w) = ws(&t, src_of(i / 5)).await else {
                        refused.fetch_add(1, Ordering::Relaxed);
                        return;
                    };
                    let _ = tokio::time::timeout(Duration::from_secs(5), w.next()).await;
                    let _ = w
                        .send(msg(client_msg::Body::Hello(Hello {
                            proto: 1,
                            name: "guess".into(),
                            password: format!("wrong password {i:08}"),
                            ..Default::default()
                        })))
                        .await;
                    while let Ok(Some(Ok(m))) =
                        tokio::time::timeout(Duration::from_secs(15), w.next()).await
                    {
                        if let Message::Binary(b) = m {
                            if let Ok(ServerMsg {
                                body: Some(server_msg::Body::Denied(d)),
                            }) = ServerMsg::decode(b.as_ref())
                            {
                                if d.code == heat3d_session::proto::Err::LockedOut as i32 {
                                    locked.fetch_add(1, Ordering::Relaxed);
                                } else {
                                    denied.fetch_add(1, Ordering::Relaxed);
                                }
                                break;
                            }
                        }
                    }
                }));
                if i % 20 == 19 {
                    tokio::time::sleep(Duration::from_millis(10)).await;
                }
            }
            for t in tasks {
                let _ = t.await;
            }
            println!(
                "{}",
                serde_json::json!({ "mode": mode, "guesses": n, "addresses": n.div_ceil(5), "wrong_password": denied.load(Ordering::Relaxed), "locked_out": locked.load(Ordering::Relaxed), "refused": refused.load(Ordering::Relaxed), "secs": start.elapsed().as_secs_f64() })
            );
            return;
        }
        "spam" => {
            let invite = args.get(2).cloned().unwrap_or_default();
            let n: usize = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(10);
            let secs: u64 = args.get(4).and_then(|s| s.parse().ok()).unwrap_or(20);
            let sent = Arc::new(AtomicU64::new(0));
            let limited = Arc::new(AtomicU64::new(0));
            let cut = Arc::new(AtomicU64::new(0));
            for i in 0..n {
                let (t, invite, sent, limited, cut, ok) = (
                    t.clone(),
                    invite.clone(),
                    sent.clone(),
                    limited.clone(),
                    cut.clone(),
                    ok.clone(),
                );
                tasks.push(tokio::spawn(async move {
                    let Some(w) = join(&t, 210 + (i % 40) as u8, &invite, &format!("spam{i}")).await else {
                        return;
                    };
                    ok.fetch_add(1, Ordering::Relaxed);
                    let (mut tx, mut rx) = w.split();
                    let reader = tokio::spawn(async move {
                        while let Some(Ok(m)) = rx.next().await {
                            if let Message::Binary(b) = m {
                                if let Ok(ServerMsg {
                                    body: Some(server_msg::Body::Ack(a)),
                                }) = ServerMsg::decode(b.as_ref())
                                {
                                    if a.code == heat3d_session::proto::Err::RateLimited as i32 {
                                        limited.fetch_add(1, Ordering::Relaxed);
                                    }
                                }
                            }
                        }
                        cut.fetch_add(1, Ordering::Relaxed);
                    });
                    let end = Instant::now() + Duration::from_secs(secs);
                    let big = "x".repeat(15_000);
                    let mut k = 0u64;
                    while Instant::now() < end {
                        k += 1;
                        let m = match k % 6 {
                            // A batch of 500 marks with long notes.
                            0 | 1 => msg(client_msg::Body::Batch(Batch {
                                doc: "marks".into(),
                                id: format!("spam{i}-{k}"),
                                ops: (0..4)
                                    .map(|j| Op {
                                        kind: OpKind::Add as i32,
                                        coll: "pins".into(),
                                        id: format!("s{i}-{k}-{j}"),
                                        json: format!(r#"{{"text":"{big}"}}"#),
                                        ..Default::default()
                                    })
                                    .collect(),
                                at: 0.0,
                            })),
                            2 => msg(client_msg::Body::Look(LookHere {
                                pose: Some(pose(k as f32)),
                                note: "look".into(),
                                follow: k % 4 == 0,
                                ..Default::default()
                            })),
                            3 => msg(client_msg::Body::Follow(FollowSet { mode: 2, leader: 0 })),
                            // Over the size limit, broken bytes, text: the server should cut these off.
                            4 if i % 5 == 0 => Message::Binary(vec![0x0a; 70_000].into()),
                            4 if i % 5 == 1 => {
                                Message::Binary(vec![0xff, 0xff, 0xff, 0xff, 0x0f].into())
                            }
                            4 if i % 5 == 2 => Message::Text("{\"__proto__\":{}}".into()),
                            _ => msg(client_msg::Body::Ping(Ping { t: k as f64 })),
                        };
                        if tx.send(m).await.is_err() {
                            break;
                        }
                        sent.fetch_add(1, Ordering::Relaxed);
                    }
                    reader.abort();
                }));
            }
            for t in tasks {
                let _ = t.await;
            }
            println!(
                "{}",
                serde_json::json!({ "mode": mode, "members": n, "joined": ok.load(Ordering::Relaxed), "messages_sent": sent.load(Ordering::Relaxed), "rate_limited_acks": limited.load(Ordering::Relaxed), "cut_off": cut.load(Ordering::Relaxed), "secs": secs })
            );
            return;
        }
        "probe" => {
            let invite = args.get(2).cloned().unwrap_or_default();
            let secs: u64 = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(20);
            // A member's browser tries again a few times, as the viewer does.
            let mut joined = None;
            for _ in 0..8 {
                joined = join(&t, 254, &invite, "probe").await;
                if joined.is_some() {
                    break;
                }
                tokio::time::sleep(Duration::from_millis(700)).await;
            }
            let Some(w) = joined else {
                println!("{}", serde_json::json!({ "mode": mode, "joined": false }));
                return;
            };
            let (mut tx, mut rx) = w.split();
            let rtts = Arc::new(std::sync::Mutex::new(Vec::new()));
            let r2 = rtts.clone();
            let t0 = Instant::now();
            let reader = tokio::spawn(async move {
                while let Some(Ok(m)) = rx.next().await {
                    if let Message::Binary(b) = m {
                        if let Ok(ServerMsg {
                            body: Some(server_msg::Body::Pong(p)),
                        }) = ServerMsg::decode(b.as_ref())
                        {
                            let now = t0.elapsed().as_secs_f64() * 1000.0;
                            r2.lock().unwrap().push(now - p.t);
                        }
                    }
                }
            });
            let mut http = Vec::new();
            let end = Instant::now() + Duration::from_secs(secs);
            while Instant::now() < end {
                let _ = tx
                    .send(msg(client_msg::Body::Ping(Ping {
                        t: t0.elapsed().as_secs_f64() * 1000.0,
                    })))
                    .await;
                let q = Instant::now();
                if let Ok(c) = t.conn(253).await {
                    let mut c = c.boxed();
                    let _ = c.write_all(b"GET /session.json HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n").await;
                    let mut b = Vec::new();
                    if tokio::time::timeout(Duration::from_secs(10), c.read_to_end(&mut b))
                        .await
                        .is_ok()
                        && b.starts_with(b"HTTP/1.1 200")
                    {
                        http.push(q.elapsed().as_secs_f64() * 1000.0);
                    }
                }
                tokio::time::sleep(Duration::from_millis(250)).await;
            }
            reader.abort();
            let mut r = rtts.lock().unwrap().clone();
            println!(
                "{}",
                serde_json::json!({ "mode": mode, "ws_round_trip": pct(&mut r), "http_session_json": pct(&mut http) })
            );
            return;
        }
        _ => {
            eprintln!("unknown mode {mode}");
            std::process::exit(2);
        }
    }
    for t in tasks {
        let _ = t.await;
    }
    println!(
        "{}",
        serde_json::json!({ "mode": mode, "tried": n, "established": ok.load(Ordering::Relaxed), "refused": refused.load(Ordering::Relaxed), "closed_by_server_before_end": closed_early.load(Ordering::Relaxed), "hold_secs": secs, "secs": start.elapsed().as_secs_f64() })
    );
}
