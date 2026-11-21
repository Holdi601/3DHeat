//! The pentest's authentication and authorisation checks against a running
//! session server on this machine: forged and replayed tokens, the waiting
//! room, invite reuse, every escalation a viewer or a draw-only member could
//! try, a batch mixing allowed and forbidden operations, role changes
//! rotating the token, bans by key and by address, and the HTTP side with
//! wrong tokens. Prints PASS or FAIL per check.
//!
//!   authprobe <https://ADDR:PORT> <host token> <password>
//!
//! ADDR is this machine (loopback or one of its own LAN addresses).

use ed25519_dalek::{Signer, SigningKey};
use futures_util::{SinkExt, StreamExt};
use heat3d_session::proto::{
    self, client_msg, server_msg, AdminAction, AdminKind, Batch, ClientMsg, Dataset, Err, FollowSet,
    Hello, InviteNew, LookHere, Op, OpKind, Pose, Role, ServerMsg, SettingsSet, Vec3,
};
use prost::Message as _;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio_tungstenite::tungstenite::Message;

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

type Io = tokio_rustls::client::TlsStream<TcpStream>;
type Ws = tokio_tungstenite::WebSocketStream<Io>;

struct Env {
    addr: SocketAddr,
    tls: tokio_rustls::TlsConnector,
    host: String,
}

impl Env {
    async fn tls(&self) -> Io {
        let t = TcpStream::connect(self.addr).await.expect("connect");
        let name = rustls::pki_types::ServerName::try_from("localhost").unwrap();
        self.tls.connect(name, t).await.expect("tls")
    }

    async fn ws(&self) -> Ws {
        let req = tokio_tungstenite::tungstenite::client::IntoClientRequest::into_client_request(
            format!("wss://{}/ws", self.host),
        )
        .unwrap();
        tokio_tungstenite::client_async(req, self.tls().await)
            .await
            .expect("upgrade")
            .0
    }

    /// A raw HTTP request; the status code.
    async fn http(&self, req: &str) -> u16 {
        let mut s = self.tls().await;
        s.write_all(req.as_bytes()).await.unwrap();
        let mut b = vec![0u8; 512];
        let n = tokio::time::timeout(Duration::from_secs(10), s.read(&mut b))
            .await
            .ok()
            .and_then(|r| r.ok())
            .unwrap_or(0);
        let head = String::from_utf8_lossy(&b[..n]);
        head.split(' ').nth(1).and_then(|c| c.parse().ok()).unwrap_or(0)
    }
}

/// A client of the session.
struct Client {
    ws: Ws,
    nonce: Vec<u8>,
    seen: Vec<server_msg::Body>,
    rid: u32,
}

impl Client {
    async fn open(env: &Env) -> Client {
        let mut ws = env.ws().await;
        let mut nonce = Vec::new();
        if let Ok(Some(Ok(Message::Binary(b)))) =
            tokio::time::timeout(Duration::from_secs(5), ws.next()).await
        {
            if let Ok(ServerMsg {
                body: Some(server_msg::Body::Challenge(c)),
            }) = ServerMsg::decode(b.as_ref())
            {
                nonce = c.nonce;
            }
        }
        Client { ws, nonce, seen: Vec::new(), rid: 1 }
    }

    async fn send(&mut self, body: client_msg::Body) -> u32 {
        self.rid += 1;
        let m = ClientMsg { rid: self.rid, body: Some(body) };
        let _ = self.ws.send(Message::Binary(m.encode_to_vec().into())).await;
        self.rid
    }

    async fn hello(&mut self, mut h: Hello, key: Option<&SigningKey>) {
        h.proto = 1;
        if let Some(k) = key {
            let mut m = heat3d_session::auth::JOIN_CONTEXT.to_vec();
            m.extend_from_slice(&self.nonce);
            h.key_pub = k.verifying_key().to_bytes().to_vec();
            h.key_sig = k.sign(&m).to_bytes().to_vec();
        }
        self.send(client_msg::Body::Hello(h)).await;
    }

    /// Reads until `f` matches something new, or `ms` pass.
    async fn until<T>(&mut self, ms: u64, f: impl Fn(&server_msg::Body) -> Option<T>) -> Option<T> {
        for b in &self.seen {
            if let Some(t) = f(b) {
                return Some(t);
            }
        }
        let end = tokio::time::Instant::now() + Duration::from_millis(ms);
        loop {
            let left = end.saturating_duration_since(tokio::time::Instant::now());
            match tokio::time::timeout(left, self.ws.next()).await {
                Ok(Some(Ok(Message::Binary(b)))) => {
                    if let Ok(ServerMsg { body: Some(body) }) = ServerMsg::decode(b.as_ref()) {
                        let hit = f(&body);
                        self.seen.push(body);
                        if hit.is_some() {
                            return hit;
                        }
                    }
                }
                Ok(Some(Ok(_))) => {}
                _ => return None,
            }
        }
    }

    async fn ack(&mut self, rid: u32) -> Option<i32> {
        self.until(3000, |b| match b {
            server_msg::Body::Ack(a) if a.rid == rid => Some(a.code),
            _ => None,
        })
        .await
    }

    async fn denied(&mut self) -> Option<i32> {
        self.until(5000, |b| match b {
            server_msg::Body::Denied(d) => Some(d.code),
            _ => None,
        })
        .await
    }

    async fn welcome(&mut self) -> Option<proto::Welcome> {
        self.until(5000, |b| match b {
            server_msg::Body::Welcome(w) => Some(w.clone()),
            _ => None,
        })
        .await
    }

    async fn closed(&mut self) -> bool {
        tokio::time::timeout(Duration::from_secs(8), async {
            loop {
                match self.ws.next().await {
                    None | Some(Err(_)) | Some(Ok(Message::Close(_))) => return true,
                    _ => {}
                }
            }
        })
        .await
        .unwrap_or(false)
    }
}

fn pose() -> Option<Pose> {
    Some(Pose {
        position: Some(Vec3 { x: 1.0, y: 2.0, z: 3.0 }),
        forward: Some(Vec3 { x: 0.0, y: 0.0, z: -1.0 }),
        fov: 60.0,
        aspect: 1.5,
        ..Default::default()
    })
}

fn admin(kind: AdminKind, target: u32, role: Role) -> client_msg::Body {
    client_msg::Body::Admin(AdminAction { kind: kind as i32, target, role: role as i32, ..Default::default() })
}

fn add(doc: &str, coll: &str, id: &str) -> client_msg::Body {
    client_msg::Body::Batch(Batch {
        doc: doc.into(),
        id: format!("b-{id}-{}", rand_id()),
        ops: vec![Op { kind: OpKind::Add as i32, coll: coll.into(), id: id.into(), json: "{}".into(), ..Default::default() }],
        at: 0.0,
    })
}

fn rand_id() -> String {
    heat3d_session::auth::token()[..12].to_string()
}

#[tokio::main]
async fn main() {
    let _ = rustls::crypto::ring::default_provider().install_default();
    let args: Vec<String> = std::env::args().skip(1).collect();
    let host = args[0].trim_start_matches("https://").trim_end_matches('/').to_string();
    let addr: SocketAddr = host.parse().expect("ADDR:PORT");
    let own = heat3d_session::tls::local_ips();
    assert!(addr.ip().is_loopback() || own.contains(&addr.ip()), "only a server on this machine");
    let (token, password) = (args[1].clone(), args[2].clone());
    let cfg = rustls::ClientConfig::builder()
        .dangerous()
        .with_custom_certificate_verifier(Arc::new(AnyCert))
        .with_no_client_auth();
    let env = Env { addr, tls: tokio_rustls::TlsConnector::from(Arc::new(cfg)), host: host.clone() };
    let mut fails = 0;
    let mut check = |name: &str, ok: bool, detail: String| {
        println!("{} {name}{}", if ok { "PASS" } else { "FAIL" }, if detail.is_empty() { String::new() } else { format!(" - {detail}") });
        if !ok {
            fails += 1;
        }
    };
    let code = |c: Option<i32>| c.and_then(|c| Err::try_from(c).ok());

    // The host.
    let hk = SigningKey::from_bytes(&rand32());
    let mut host_c = Client::open(&env).await;
    check("the server speaks first: a challenge of 32 bytes", host_c.nonce.len() == 32, String::new());
    host_c.hello(Hello { name: "Host".into(), host_token: token.clone(), ..Default::default() }, Some(&hk)).await;
    let hw = host_c.welcome().await;
    check("the host joins by its token", hw.as_ref().is_some_and(|w| w.role == Role::Host as i32), String::new());
    let host_id = hw.map(|w| w.you).unwrap_or(0);

    // Forged and replayed tokens.
    let mut c = Client::open(&env).await;
    c.hello(Hello { name: "forger".into(), host_token: heat3d_session::auth::token(), ..Default::default() }, None).await;
    let d = code(c.denied().await);
    check("a forged host token is refused like a wrong password", d == Some(Err::BadPassword), format!("{d:?}"));
    let mut c = Client::open(&env).await;
    c.hello(Hello { name: "replay".into(), resume: heat3d_session::auth::token(), ..Default::default() }, None).await;
    let d = code(c.denied().await);
    check("an unknown resume token is refused", d == Some(Err::NotFound), format!("{d:?}"));
    let mut c = Client::open(&env).await;
    c.send(admin(AdminKind::Kick, host_id, Role::Unspecified)).await;
    check("anything but a hello first: the connection is closed", c.closed().await, String::new());
    let mut c = Client::open(&env).await;
    c.hello(Hello { name: "sig".into(), key_pub: vec![7; 32], key_sig: vec![9; 64], ..Default::default() }, None).await;
    let d = code(c.denied().await);
    check("a hello with a bad key signature is refused", d == Some(Err::BadMessage), format!("{d:?}"));

    // The waiting room.
    let mut c = Client::open(&env).await;
    c.hello(Hello { name: "wrongpw".into(), password: "not the password at all".into(), ..Default::default() }, None).await;
    let d = code(c.denied().await);
    check("a wrong password is refused", d == Some(Err::BadPassword), format!("{d:?}"));
    let wk = SigningKey::from_bytes(&rand32());
    let mut waiter = Client::open(&env).await;
    waiter.hello(Hello { name: "waiter".into(), password: password.clone(), ..Default::default() }, Some(&wk)).await;
    let w = waiter.until(5000, |b| match b { server_msg::Body::Waiting(w) => Some(w.you), server_msg::Body::Welcome(_) => Some(0), _ => None }).await;
    check("the right password leads to the waiting room, not in", w.is_some_and(|x| x != 0), format!("{w:?}"));
    let r = waiter.send(add("marks", "pins", "w1")).await;
    let a = code(waiter.ack(r).await);
    check("a waiter's edits are refused (not joined)", a == Some(Err::NotJoined), format!("{a:?}"));
    let r = waiter.send(client_msg::Body::Hello(Hello { proto: 1, host_token: token.clone(), ..Default::default() })).await;
    let a = code(waiter.ack(r).await);
    check("a second hello (the host token, from the waiting room) is refused", a == Some(Err::Protocol), format!("{a:?}"));

    // Invites.
    let invite = |role: Role, uses: u32| client_msg::Body::Invite(InviteNew { role: role as i32, uses, ttl_ms: 600_000, label: "probe".into() });
    host_c.send(invite(Role::Viewer, 1)).await;
    let vinv = host_c.until(3000, |b| match b { server_msg::Body::Invite(i) if !i.token.is_empty() => Some(i.token.clone()), _ => None }).await.unwrap_or_default();
    host_c.seen.clear();
    host_c.send(invite(Role::Draw, 2)).await;
    let dinv = host_c.until(3000, |b| match b { server_msg::Body::Invite(i) if !i.token.is_empty() => Some(i.token.clone()), _ => None }).await.unwrap_or_default();
    host_c.seen.clear();
    host_c.send(invite(Role::Admin, 1)).await;
    let ainv = host_c.until(3000, |b| match b { server_msg::Body::Invite(i) if !i.token.is_empty() => Some(i.token.clone()), _ => None }).await.unwrap_or_default();
    host_c.seen.clear();
    let vk = SigningKey::from_bytes(&rand32());
    let mut viewer = Client::open(&env).await;
    viewer.hello(Hello { name: "viewer".into(), invite: vinv.clone(), ..Default::default() }, Some(&vk)).await;
    let vw = viewer.welcome().await;
    check("an invite lets in with its role, past the waiting room", vw.as_ref().is_some_and(|w| w.role == Role::Viewer as i32), String::new());
    let viewer_id = vw.as_ref().map(|w| w.you).unwrap_or(0);
    let mut c = Client::open(&env).await;
    c.hello(Hello { name: "reuse".into(), invite: vinv.clone(), ..Default::default() }, Some(&SigningKey::from_bytes(&rand32()))).await;
    let d = code(c.denied().await);
    check("a used-up invite does not let another browser in", d == Some(Err::BadPassword), format!("{d:?}"));

    // A viewer trying everything above it.
    let tries: Vec<(&str, client_msg::Body)> = vec![
        ("make itself admin", admin(AdminKind::SetRole, viewer_id, Role::Admin)),
        ("kick the host", admin(AdminKind::Kick, host_id, Role::Unspecified)),
        ("ban the host", admin(AdminKind::Ban, host_id, Role::Unspecified)),
        ("let the waiter in", admin(AdminKind::Admit, w.unwrap_or(0), Role::Admin)),
        ("make an invite", invite(Role::Admin, 5)),
        ("change the password", client_msg::Body::Settings(SettingsSet { password: "a new password 123456".into(), ..Default::default() })),
        ("lock everyone's camera", client_msg::Body::Follow(FollowSet { mode: 2, leader: viewer_id })),
        ("set the session's data as published", client_msg::Body::Dataset(Dataset { name: "x".into(), hash: "ab".repeat(32), published: true, ..Default::default() })),
        ("draw a mark", add("marks", "pins", "v1")),
        ("edit the tactics board", add("tactics", "figures", "v2")),
    ];
    for (what, body) in tries {
        let r = viewer.send(body).await;
        let a = code(viewer.ack(r).await);
        check(&format!("a viewer cannot {what}"), a == Some(Err::Forbidden), format!("{a:?}"));
    }
    let mut limited = None;
    for _ in 0..5 {
        let r = viewer.send(client_msg::Body::Look(LookHere { pose: pose(), note: "look".into(), ..Default::default() })).await;
        let a = code(viewer.ack(r).await);
        if a == Some(Err::RateLimited) {
            limited = a;
            break;
        }
    }
    check("look-here is limited to three a minute", limited == Some(Err::RateLimited), String::new());

    // A draw-only member: a batch mixing what it may and may not do.
    let dk = SigningKey::from_bytes(&rand32());
    let mut draw = Client::open(&env).await;
    draw.hello(Hello { name: "draw".into(), invite: dinv.clone(), ..Default::default() }, Some(&dk)).await;
    let dw = draw.welcome().await;
    let draw_id = dw.as_ref().map(|w| w.you).unwrap_or(0);
    let r = host_c.send(add("marks", "pins", "hostpin")).await;
    host_c.ack(r).await;
    let mixed = client_msg::Body::Batch(Batch {
        doc: "tactics".into(),
        id: format!("mixed-{}", rand_id()),
        ops: vec![
            Op { kind: OpKind::Add as i32, coll: "drawings".into(), id: "mine".into(), json: "{}".into(), ..Default::default() },
            Op { kind: OpKind::Add as i32, coll: "figures".into(), id: "notmine".into(), json: "{}".into(), ..Default::default() },
            Op { kind: OpKind::Meta as i32, json: r#"{"title":"taken over"}"#.into(), ..Default::default() },
        ],
        at: 0.0,
    });
    let r = draw.send(mixed).await;
    let a = code(draw.ack(r).await);
    let applied = draw.until(3000, |b| match b {
        server_msg::Body::Op(s) if s.batch.as_ref().is_some_and(|b| b.doc == "tactics") => Some(s.batch.as_ref().map(|b| b.ops.len()).unwrap_or(0)),
        _ => None,
    }).await;
    check("a mixed batch: the allowed operation goes in, the forbidden ones are dropped and said", a == Some(Err::Forbidden) && applied == Some(1), format!("{a:?}, applied {applied:?}"));
    let r = draw.send(client_msg::Body::Batch(Batch {
        doc: "marks".into(),
        id: format!("del-{}", rand_id()),
        ops: vec![Op { kind: OpKind::Del as i32, coll: "pins".into(), id: "hostpin".into(), ..Default::default() }],
        at: 0.0,
    })).await;
    let a = code(draw.ack(r).await);
    check("a draw-only member cannot erase the host's mark", a == Some(Err::Forbidden), format!("{a:?}"));

    // Token replay and rotation.
    let resume = dw.map(|w| w.resume).unwrap_or_default();
    let mut thief = Client::open(&env).await;
    thief.hello(Hello { name: "thief".into(), resume: resume.clone(), ..Default::default() }, Some(&SigningKey::from_bytes(&rand32()))).await;
    let d = code(thief.denied().await);
    check("a member's resume token from another browser does nothing", d == Some(Err::NotFound), format!("{d:?}"));
    draw.seen.clear();
    host_c.send(admin(AdminKind::SetRole, draw_id, Role::Elevated)).await;
    let nw = draw.welcome().await;
    check("a new role brings a new token", nw.as_ref().is_some_and(|w| w.resume != resume && w.role == Role::Elevated as i32), String::new());
    let code_old = env.http(&format!("GET /a/{} HTTP/1.1\r\nHost: x\r\nAuthorization: Bearer {resume}\r\n\r\n", "0".repeat(64))).await;
    check("the old token no longer fetches files", code_old == 401, format!("{code_old}"));

    // An admin against the host and another admin.
    let ak = SigningKey::from_bytes(&rand32());
    let mut adm = Client::open(&env).await;
    adm.hello(Hello { name: "admin".into(), invite: ainv.clone(), ..Default::default() }, Some(&ak)).await;
    let aw = adm.welcome().await;
    check("an admin invite (made by the host) lets in as admin", aw.as_ref().is_some_and(|w| w.role == Role::Admin as i32), String::new());
    for (what, body) in [
        ("kick the host", admin(AdminKind::Kick, host_id, Role::Unspecified)),
        ("make someone admin", admin(AdminKind::SetRole, viewer_id, Role::Admin)),
        ("make an admin invite", invite(Role::Admin, 1)),
        ("change the password", client_msg::Body::Settings(SettingsSet { password: "a new password 123456".into(), ..Default::default() })),
    ] {
        let r = adm.send(body).await;
        let a = code(adm.ack(r).await);
        check(&format!("an admin cannot {what}"), a == Some(Err::Forbidden), format!("{a:?}"));
    }

    // Bans: by key, and the key cannot be shed by naming another.
    host_c.send(admin(AdminKind::Ban, viewer_id, Role::Unspecified)).await;
    check("the banned viewer is cut off", viewer.closed().await, String::new());
    let mut back = Client::open(&env).await;
    back.hello(Hello { name: "someone else".into(), invite: vinv.clone(), ..Default::default() }, Some(&vk)).await;
    let d = code(back.denied().await);
    check("the banned browser (its key) under another name is refused", d == Some(Err::Banned), format!("{d:?}"));
    let mut back = Client::open(&env).await;
    back.hello(Hello { name: "viewer".into(), password: password.clone(), ..Default::default() }, Some(&SigningKey::from_bytes(&rand32()))).await;
    let d = code(back.denied().await);
    check("the banned name with a new key is refused", d == Some(Err::Banned), format!("{d:?}"));
    if !addr.ip().is_loopback() {
        let mut back = Client::open(&env).await;
        back.hello(Hello { name: "fresh".into(), password: password.clone(), ..Default::default() }, Some(&SigningKey::from_bytes(&rand32()))).await;
        let d = code(back.denied().await);
        check("a new key and name from the banned address is refused", d == Some(Err::Banned), format!("{d:?}"));
    }

    // The HTTP side.
    let h = |p: &str, auth: &str| format!("GET {p} HTTP/1.1\r\nHost: x\r\n{auth}\r\n");
    let s = env.http(&h(&format!("/a/{}", "0".repeat(64)), "")).await;
    check("files need a member's token", s == 401, format!("{s}"));
    let s = env.http(&h("/api/docs", &format!("Authorization: Bearer {}\r\n", nw.map(|w| w.resume).unwrap_or_default()))).await;
    check("a member's token is not the host's (/api/docs)", s == 401, format!("{s}"));
    let s = env.http(&"POST /api/load HTTP/1.1\r\nHost: x\r\nContent-Length: 104857600\r\n\r\n".to_string()).await;
    check("/api/load without the host token: refused before the body is read", s == 401, format!("{s}"));
    let s = env.http(&"POST /v1 HTTP/1.1\r\nHost: x\r\nContent-Length: 4\r\nx-heat3d-key: guess\r\n\r\nabcd".to_string()).await;
    check("the data API without a member's token: refused", s == 401, format!("{s}"));
    let s = env.http(&format!("GET /ws HTTP/1.1\r\nHost: {host}\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nOrigin: https://evil.example\r\n\r\n")).await;
    check("a WebSocket from another site's page is refused (CSWSH)", s == 403, format!("{s}"));
    let s = env.http(&"GET /..%2f..%2f..%2fWindows/win.ini HTTP/1.1\r\nHost: x\r\n\r\n".to_string()).await;
    check("an encoded path out of the web build is refused", s == 404, format!("{s}"));

    println!("{} checks failed", fails);
    std::process::exit(if fails == 0 { 0 } else { 1 });
}

fn rand32() -> [u8; 32] {
    let t = heat3d_session::auth::token();
    let mut b = [0u8; 32];
    for (i, c) in hex::decode(t).unwrap().into_iter().enumerate() {
        b[i] = c;
    }
    b
}
