//! The gateway: everything a stranger's bytes reach first. TLS, HTTP and the
//! WebSocket, every limit, the session's rules (`Session`), the host's and the
//! members' tokens. It needs no file, no process and no network of its own:
//! the core hands it each TCP connection as a byte stream and serves it the
//! few things that need the user's rights (the web build, published files,
//! uploads, the data API, the audit log), each on a stream of its own
//! (`HostLink`).
//!
//! `3dheat serve` runs it as a separate, locked-down process (`run_child`,
//! the `gateway` subcommand; see `heat3d-sandbox`); tests and `--no-sandbox`
//! run it in the core's own process, the same code over in-memory streams.

use axum::body::Body;
use axum::extract::ws::{CloseFrame, Message, WebSocket, WebSocketUpgrade};
use axum::extract::{ConnectInfo, Path, Query, Request, State};
use axum::http::{header, HeaderMap, HeaderName, HeaderValue, Method, StatusCode};
use axum::middleware::{self, Next};
use axum::response::{IntoResponse, Response};
use axum::routing::{any, get, post};
use axum::Router;
use futures_util::{SinkExt, StreamExt};
use hyper_util::rt::{TokioIo, TokioTimer};
use prost::Message as _;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::future::Future;
use std::net::{IpAddr, SocketAddr};
use std::pin::Pin;
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll};
use std::time::Duration;
use tokio::io::{AsyncRead, AsyncWrite, ReadBuf};
use tokio::sync::{mpsc, watch, Semaphore};
use tokio::time::{Instant, Sleep};
use tower::ServiceExt;
use tower_http::set_header::SetResponseHeaderLayer;

use crate::auth;
use crate::ipc::Mux;
use crate::lan;
use crate::limits::PerIp;
use crate::proxy::{TrustedProxies, Via};
use crate::proto::{self, client_msg, server_msg, ClientMsg, CloseReason, Dataset, ServerMsg};
use crate::session::{Config, ConnId, Out, Session, Target};

/// A control message from a client, at most (checked before decoding).
pub const MAX_CLIENT_MSG: usize = 64 * 1024;
/// What may wait to be sent to one client before it is cut off.
pub const MAX_BACKLOG: usize = 8 * 1024 * 1024;
/// A session file the host opens, at most.
pub const MAX_LOAD: usize = 64 * 1024 * 1024;
/// A request's head (request line and headers), at most.
pub const MAX_HEAD: usize = 16 * 1024;
/// How long a client has for its TLS handshake, and for each request's head.
pub const HANDSHAKE: Duration = Duration::from_secs(10);
/// A connection with nothing read or written this long is closed.
pub const IDLE: Duration = Duration::from_secs(75);
/// A write that makes no progress this long (a client that stopped reading) closes the connection.
pub const WRITE_STALL: Duration = Duration::from_secs(30);
/// A WebSocket's hello within this.
pub const HELLO_WITHIN: Duration = Duration::from_secs(5);

pub fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

/// The network's limits, per address and in all.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NetLimits {
    /// TCP connections at once, from one address and in all.
    pub conns_per_addr: usize,
    pub conns: usize,
    /// HTTP requests from one address: a burst, then so many a second.
    pub requests_burst: f64,
    pub requests_per_sec: f64,
    /// WebSocket upgrades from one address: a burst, then so many a second.
    pub upgrades_burst: f64,
    pub upgrades_per_sec: f64,
}

impl Default for NetLimits {
    fn default() -> Self {
        Self {
            conns_per_addr: 64,
            conns: 1024,
            requests_burst: 400.0,
            requests_per_sec: 100.0,
            upgrades_burst: 20.0,
            upgrades_per_sec: 1.0,
        }
    }
}

/// The data the session starts on (a file the host published at the start).
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct StartData {
    pub name: String,
    pub hash: String,
    pub size: u64,
}

/// Everything the gateway is told by the core when it starts.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GatewayConfig {
    pub expose: bool,
    pub allow_origins: Vec<String>,
    pub session: Config,
    /// The session password's argon2id hash (the password itself stays with the core).
    pub password_phc: Option<String>,
    pub host_token: String,
    pub dataset: Option<StartData>,
    /// The certificate chain and key, PEM; none for plain HTTP (this machine only).
    pub tls_cert_pem: Option<String>,
    pub tls_key_pem: Option<String>,
    /// A real certificate (not the self-signed one): browsers are told to keep to HTTPS.
    pub hsts: bool,
    /// Paths of services the core mounts (the data API): forwarded for members only.
    pub mounts: Vec<String>,
    /// Paths of services for the host's own browser only (its local usage
    /// statistics): forwarded with the host's token only, marked as the host's.
    #[serde(default)]
    pub host_mounts: Vec<String>,
    pub limits: NetLimits,
    /// Reverse proxies and tunnels trusted to name the client (`proxy.rs`).
    #[serde(default)]
    pub proxies: TrustedProxies,
}

/// The way to what needs the user's rights: the core's router in this
/// process, or the core across the channel.
#[derive(Clone)]
pub enum HostLink {
    Local {
        router: Router,
        audit: Arc<dyn Fn(String) + Send + Sync>,
    },
    Remote(Mux),
}

impl HostLink {
    /// A request for the core (a file, a published asset, an upload, the data API).
    pub async fn http(&self, req: Request) -> Response {
        match self {
            HostLink::Local { router, .. } => match router.clone().oneshot(req).await {
                Ok(r) => r,
                Err(e) => match e {},
            },
            HostLink::Remote(mux) => {
                let Ok(io) = mux.open(b"http").await else {
                    return StatusCode::SERVICE_UNAVAILABLE.into_response();
                };
                let Ok((mut tx, conn)) =
                    hyper::client::conn::http1::handshake::<_, Body>(TokioIo::new(io)).await
                else {
                    return StatusCode::SERVICE_UNAVAILABLE.into_response();
                };
                tokio::spawn(async move {
                    let _ = conn.await;
                });
                match tx.send_request(req).await {
                    Ok(r) => r.map(Body::new),
                    Err(_) => StatusCode::BAD_GATEWAY.into_response(),
                }
            }
        }
    }

    /// A line for the audit log (kept by the core).
    pub fn audit(&self, line: String) {
        match self {
            HostLink::Local { audit, .. } => audit(line),
            HostLink::Remote(mux) => {
                let mux = mux.clone();
                tokio::spawn(async move {
                    let msg = serde_json::json!({ "audit": line }).to_string();
                    mux.control(msg.as_bytes()).await;
                });
            }
        }
    }
}

enum Outgoing {
    Bytes(Arc<Vec<u8>>),
    Close(CloseReason),
}

struct ConnTx {
    tx: mpsc::Sender<Outgoing>,
    queued: Arc<AtomicUsize>,
    presence: watch::Sender<Option<Arc<Vec<u8>>>>,
}

/// What the gateway refused, counted for one audit line a minute.
#[derive(Default)]
struct Refusals {
    conns: AtomicU64,
    requests: AtomicU64,
    upgrades: AtomicU64,
    handshakes: AtomicU64,
}

pub struct Gateway {
    session: Mutex<Session>,
    conns: Mutex<HashMap<ConnId, ConnTx>>,
    next_conn: AtomicU64,
    hashing: Semaphore,
    /// Password checks waiting or running, in all and by address: a flood of
    /// guesses cannot queue up work that outlasts it.
    checks: Mutex<(usize, std::collections::HashSet<String>)>,
    cfg: GatewayConfig,
    host: HostLink,
    limits: PerIp,
    tls: Option<tokio_rustls::TlsAcceptor>,
    router: Mutex<Option<Router>>,
    refused: Refusals,
    /// Every connection being served, for making room (`admit`).
    live: Mutex<HashMap<u64, Arc<Live>>>,
    next_live: AtomicU64,
    /// Who may name the client (changes while the server runs: the tunnel starts and stops).
    proxies: std::sync::RwLock<TrustedProxies>,
}

/// Where a connection is: what decides whether it may be ended to make room.
const HANDSHAKE_ST: u8 = 0;
const HTTP_ST: u8 = 1;
const WS_PENDING_ST: u8 = 2;
/// In the session (joined, or in the waiting room): never ended to make room.
const PLACED_ST: u8 = 3;

/// A connection being served.
pub struct Live {
    since: Instant,
    state: std::sync::atomic::AtomicU8,
    kill: tokio::sync::Notify,
}

impl Live {
    fn set(&self, st: u8) {
        self.state.store(st, Ordering::Relaxed);
    }

    /// Which goes first when room is needed: a handshake not finished, then a
    /// WebSocket that has not said hello, then plain HTTP.
    fn rank(&self) -> u8 {
        match self.state.load(Ordering::Relaxed) {
            HANDSHAKE_ST => 0,
            WS_PENDING_ST => 1,
            HTTP_ST => 2,
            _ => u8::MAX,
        }
    }
}

/// A connection's hold on its places (on the live list, and its address's
/// count): given back when the last of its holders ends (the HTTP side, and
/// a WebSocket that outlives it).
pub struct Hold {
    gw: Arc<Gateway>,
    id: u64,
    live: Arc<Live>,
    _slot: crate::limits::Slot,
}

impl Drop for Hold {
    fn drop(&mut self) {
        self.gw.live.lock().unwrap().remove(&self.id);
    }
}

fn encode(m: &ServerMsg) -> Arc<Vec<u8>> {
    Arc::new(m.encode_to_vec())
}

impl Gateway {
    pub fn new(cfg: GatewayConfig, host: HostLink) -> Result<Arc<Gateway>, String> {
        let mut session = Session::new(cfg.session.clone(), cfg.host_token.clone());
        if cfg.password_phc.is_some() {
            session.set_password_hash(cfg.password_phc.clone());
        }
        if let Some(d) = &cfg.dataset {
            session.set_dataset(Dataset {
                name: d.name.clone(),
                hash: d.hash.clone(),
                size: d.size,
                published: true,
                ..Default::default()
            });
        }
        let tls = match (&cfg.tls_cert_pem, &cfg.tls_key_pem) {
            (Some(c), Some(k)) => Some(tls_acceptor(c.as_bytes(), k.as_bytes())?),
            _ => None,
        };
        let gw = Arc::new(Gateway {
            session: Mutex::new(session),
            conns: Mutex::new(HashMap::new()),
            next_conn: AtomicU64::new(1),
            hashing: Semaphore::new(2),
            checks: Mutex::new((0, std::collections::HashSet::new())),
            // The hard cap is above the soft one (`limits.conns`), which `admit` keeps by making room.
            limits: PerIp::new(NetLimits { conns: cfg.limits.conns * 4, ..cfg.limits.clone() }),
            cfg,
            host,
            tls,
            router: Mutex::new(None),
            refused: Refusals::default(),
            live: Mutex::new(HashMap::new()),
            next_live: AtomicU64::new(1),
            proxies: std::sync::RwLock::new(TrustedProxies::default()),
        });
        gw.set_proxies(gw.cfg.proxies.clone());
        *gw.router.lock().unwrap() = Some(router(gw.clone()));
        gw.clone().ticker();
        Ok(gw)
    }

    /// Whom to believe about clients' addresses from now on. A session
    /// reached through a proxy or tunnel says it is exposed to the internet.
    pub fn set_proxies(&self, p: TrustedProxies) {
        self.session.lock().unwrap().cfg.exposed = self.cfg.expose || p.any();
        *self.proxies.write().unwrap() = p;
    }

    /// The HTTP side, as served on every connection (tests and the fuzzer call it directly).
    pub fn router(&self) -> Router {
        self.router.lock().unwrap().clone().expect("made in new")
    }

    /// Sends what the session said to send, closes what it said to close.
    fn dispatch(self: &Arc<Self>, outs: Vec<Out>) {
        if outs.is_empty() {
            return;
        }
        let mut sends: Vec<(Vec<ConnId>, Arc<Vec<u8>>)> = Vec::new();
        let mut closes = Vec::new();
        {
            let s = self.session.lock().unwrap();
            for o in outs {
                match o {
                    Out::Send(t, m) => sends.push((s.resolve(&t), encode(&m))),
                    Out::Close(c, r) => closes.push((c, r)),
                    Out::Audit(line) => self.host.audit(line),
                    Out::HashPassword(pw) => {
                        let gw = self.clone();
                        let cost = s.cfg.cost;
                        tokio::spawn(async move {
                            let phc =
                                tokio::task::spawn_blocking(move || auth::hash_password(&pw, cost))
                                    .await
                                    .ok();
                            let outs = gw.session.lock().unwrap().set_password_hash(phc);
                            gw.dispatch(outs);
                        });
                    }
                }
            }
        }
        let conns = self.conns.lock().unwrap();
        for (to, bytes) in sends {
            for c in to {
                if let Some(tx) = conns.get(&c) {
                    let n = bytes.len();
                    if tx.queued.load(Ordering::Relaxed) + n > MAX_BACKLOG {
                        let _ = tx.tx.try_send(Outgoing::Close(CloseReason::TooSlow));
                        continue;
                    }
                    tx.queued.fetch_add(n, Ordering::Relaxed);
                    if tx.tx.try_send(Outgoing::Bytes(bytes.clone())).is_err() {
                        tx.queued.fetch_sub(n, Ordering::Relaxed);
                        let _ = tx.tx.try_send(Outgoing::Close(CloseReason::TooSlow));
                    }
                }
            }
        }
        for (c, r) in closes {
            if let Some(tx) = conns.get(&c) {
                let _ = tx.tx.try_send(Outgoing::Close(r));
            }
        }
    }

    /// Presence and the clock, ten times a second; what was refused, once a minute.
    fn ticker(self: Arc<Self>) {
        let weak = Arc::downgrade(&self);
        drop(self);
        tokio::spawn(async move {
            let mut iv = tokio::time::interval(Duration::from_millis(100));
            iv.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Skip);
            let mut n = 0u64;
            loop {
                iv.tick().await;
                let Some(gw) = weak.upgrade() else { return };
                let (frame, outs) = gw.session.lock().unwrap().tick(now_ms());
                if let Some(f) = frame {
                    let bytes = encode(&f);
                    let joined = gw.session.lock().unwrap().resolve(&Target::Joined);
                    let conns = gw.conns.lock().unwrap();
                    for c in joined {
                        if let Some(tx) = conns.get(&c) {
                            let _ = tx.presence.send(Some(bytes.clone()));
                        }
                    }
                }
                gw.dispatch(outs);
                n += 1;
                if n % 600 == 0 {
                    gw.limits.forget_idle(now_ms());
                    let r = &gw.refused;
                    let (c, q, u, h) = (
                        r.conns.swap(0, Ordering::Relaxed),
                        r.requests.swap(0, Ordering::Relaxed),
                        r.upgrades.swap(0, Ordering::Relaxed),
                        r.handshakes.swap(0, Ordering::Relaxed),
                    );
                    if c + q + u + h > 0 {
                        gw.host.audit(
                            serde_json::json!({ "t": now_ms(), "event": "limits", "connections_refused": c, "requests_refused": q, "upgrades_refused": u, "handshakes_failed": h })
                                .to_string(),
                        );
                    }
                }
            }
        });
    }

    /// Serves one TCP connection (or the core's stream of one): TLS, then HTTP.
    pub async fn serve_conn<IO>(self: Arc<Self>, io: IO, peer: SocketAddr)
    where
        IO: AsyncRead + AsyncWrite + Unpin + Send + 'static,
    {
        if !self.cfg.expose && !lan::is_local(peer.ip()) {
            // Not this machine and not the local network: not even a TLS handshake.
            return;
        }
        // A trusted proxy's connections carry many clients: they count against the total only; each
        // request's client is then held to the per-address limits (`serve_http`, `guard`, the session).
        let shared = self.proxies.read().unwrap().trusts(peer.ip());
        let slot = if shared { self.limits.connect_shared() } else { self.limits.connect(peer.ip()) };
        let Some(slot) = slot else {
            self.refused.conns.fetch_add(1, Ordering::Relaxed);
            return;
        };
        let Some(hold) = self.admit(slot) else {
            self.refused.conns.fetch_add(1, Ordering::Relaxed);
            return;
        };
        let live = hold.live.clone();
        let io = IdleIo::new(io);
        let Some(router) = self.router.lock().unwrap().clone() else {
            return;
        };
        let serve = async {
            match &self.tls {
                Some(acc) => {
                    let tls = match tokio::time::timeout(HANDSHAKE, acc.accept(io)).await {
                        Ok(Ok(t)) => t,
                        _ => {
                            self.refused.handshakes.fetch_add(1, Ordering::Relaxed);
                            return;
                        }
                    };
                    live.set(HTTP_ST);
                    serve_http(tls, peer, router, hold.clone()).await
                }
                None => {
                    live.set(HTTP_ST);
                    serve_http(io, peer, router, hold.clone()).await
                }
            }
        };
        tokio::select! {
            _ = serve => {}
            _ = live.kill.notified() => {}
        }
    }

    /// A place for a new connection. When all `limits.conns` are taken, the
    /// oldest connection that is not in the session (a handshake not
    /// finished, a WebSocket without its hello, then plain HTTP) is ended to
    /// make room, so a flood of idle or slow connections cannot keep anyone
    /// out; members and the waiting room are never ended for it. None when
    /// every place is a member's.
    fn admit(self: &Arc<Self>, slot: crate::limits::Slot) -> Option<Arc<Hold>> {
        let mut live = self.live.lock().unwrap();
        if live.len() >= self.cfg.limits.conns {
            let victim = live
                .values()
                .filter(|l| l.rank() != u8::MAX && l.since.elapsed() > Duration::from_millis(500))
                .min_by_key(|l| (l.rank(), l.since))
                .cloned();
            match victim {
                Some(v) => {
                    // Ended now; it leaves the list when its task ends.
                    v.set(PLACED_ST + 1);
                    v.kill.notify_one();
                }
                None => return None,
            }
        }
        let id = self.next_live.fetch_add(1, Ordering::Relaxed);
        let l = Arc::new(Live {
            since: Instant::now(),
            state: std::sync::atomic::AtomicU8::new(HANDSHAKE_ST),
            kill: tokio::sync::Notify::new(),
        });
        live.insert(id, l.clone());
        Some(Arc::new(Hold { gw: self.clone(), id, live: l, _slot: slot }))
    }
}

async fn serve_http<IO>(io: IO, peer: SocketAddr, router: Router, hold: Arc<Hold>)
where
    IO: AsyncRead + AsyncWrite + Unpin + Send + 'static,
{
    let svc = hyper::service::service_fn(move |mut req: hyper::Request<hyper::body::Incoming>| {
        // Each request's own client: behind a proxy that keeps connections open, one connection carries many.
        let client = hold.gw.proxies.read().unwrap().client(peer.ip(), req.headers());
        req.extensions_mut().insert(ConnectInfo(SocketAddr::new(client.ip, peer.port())));
        req.extensions_mut().insert(client.via);
        req.extensions_mut().insert(hold.clone());
        let r = router.clone();
        async move { r.oneshot(req.map(Body::new)).await }
    });
    let _ = hyper::server::conn::http1::Builder::new()
        .timer(TokioTimer::new())
        .header_read_timeout(HANDSHAKE)
        .max_buf_size(MAX_HEAD)
        .keep_alive(true)
        .serve_connection(TokioIo::new(io), svc)
        .with_upgrades()
        .await;
}

fn tls_acceptor(cert: &[u8], key: &[u8]) -> Result<tokio_rustls::TlsAcceptor, String> {
    use rustls::pki_types::pem::PemObject;
    use rustls::pki_types::{CertificateDer, PrivateKeyDer};
    let _ = rustls::crypto::ring::default_provider().install_default();
    let certs: Vec<CertificateDer<'static>> = CertificateDer::pem_slice_iter(cert)
        .collect::<Result<_, _>>()
        .map_err(|e| format!("certificate: {e}"))?;
    let key = PrivateKeyDer::from_pem_slice(key).map_err(|e| format!("key: {e}"))?;
    let mut c = rustls::ServerConfig::builder_with_protocol_versions(&[
        &rustls::version::TLS13,
        &rustls::version::TLS12,
    ])
    .with_no_client_auth()
    .with_single_cert(certs, key)
    .map_err(|e| format!("TLS: {e}"))?;
    c.alpn_protocols = vec![b"http/1.1".to_vec()];
    // No session tickets or resumption state kept beyond a small cache.
    c.session_storage = rustls::server::ServerSessionMemoryCache::new(256);
    Ok(tokio_rustls::TlsAcceptor::from(Arc::new(c)))
}

/// A connection that ends when nothing moves on it for `IDLE`, or when a
/// write makes no progress for `WRITE_STALL` (a client that stopped reading).
pub struct IdleIo<T> {
    io: T,
    idle: Pin<Box<Sleep>>,
    stall: Option<Pin<Box<Sleep>>>,
}

impl<T> IdleIo<T> {
    pub fn new(io: T) -> Self {
        Self {
            io,
            idle: Box::pin(tokio::time::sleep(IDLE)),
            stall: None,
        }
    }

    fn touch(&mut self) {
        self.idle.as_mut().reset(Instant::now() + IDLE);
    }
}

fn timed_out<T>() -> Poll<std::io::Result<T>> {
    Poll::Ready(Err(std::io::ErrorKind::TimedOut.into()))
}

impl<T: AsyncRead + Unpin> AsyncRead for IdleIo<T> {
    fn poll_read(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &mut ReadBuf<'_>,
    ) -> Poll<std::io::Result<()>> {
        let this = self.get_mut();
        let before = buf.filled().len();
        match Pin::new(&mut this.io).poll_read(cx, buf) {
            Poll::Ready(r) => {
                if buf.filled().len() > before {
                    this.touch();
                }
                Poll::Ready(r)
            }
            Poll::Pending => {
                if this.idle.as_mut().poll(cx).is_ready() {
                    return timed_out();
                }
                Poll::Pending
            }
        }
    }
}

impl<T: AsyncWrite + Unpin> AsyncWrite for IdleIo<T> {
    fn poll_write(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &[u8],
    ) -> Poll<std::io::Result<usize>> {
        let this = self.get_mut();
        match Pin::new(&mut this.io).poll_write(cx, buf) {
            Poll::Ready(r) => {
                if matches!(r, Ok(n) if n > 0) {
                    this.touch();
                }
                this.stall = None;
                Poll::Ready(r)
            }
            Poll::Pending => {
                let stall = this
                    .stall
                    .get_or_insert_with(|| Box::pin(tokio::time::sleep(WRITE_STALL)));
                if stall.as_mut().poll(cx).is_ready() || this.idle.as_mut().poll(cx).is_ready() {
                    return timed_out();
                }
                Poll::Pending
            }
        }
    }

    fn poll_flush(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<std::io::Result<()>> {
        let this = self.get_mut();
        match Pin::new(&mut this.io).poll_flush(cx) {
            Poll::Pending => {
                let stall = this
                    .stall
                    .get_or_insert_with(|| Box::pin(tokio::time::sleep(WRITE_STALL)));
                if stall.as_mut().poll(cx).is_ready() {
                    return timed_out();
                }
                Poll::Pending
            }
            r => {
                this.stall = None;
                r
            }
        }
    }

    fn poll_shutdown(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<std::io::Result<()>> {
        Pin::new(&mut self.get_mut().io).poll_shutdown(cx)
    }
}

/// The security headers on every answer.
fn secured<S: Clone + Send + Sync + 'static>(r: Router<S>, hsts: bool) -> Router<S> {
    let h = |name: &'static str, value: &'static str| {
        SetResponseHeaderLayer::overriding(
            HeaderName::from_static(name),
            HeaderValue::from_static(value),
        )
    };
    let r = r
        .layer(h(
            "content-security-policy",
            "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; \
             connect-src 'self' wss: https:; font-src 'self' data:; media-src 'self' blob:; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'none'",
        ))
        .layer(h("x-content-type-options", "nosniff"))
        .layer(h("x-frame-options", "DENY"))
        .layer(h("referrer-policy", "no-referrer"))
        .layer(h("cross-origin-opener-policy", "same-origin"))
        .layer(h("cross-origin-resource-policy", "same-origin"))
        .layer(h("x-permitted-cross-domain-policies", "none"))
        .layer(h("permissions-policy", "camera=(), microphone=(), geolocation=(), usb=(), serial=(), hid=()"));
    if hsts {
        r.layer(h("strict-transport-security", "max-age=31536000"))
    } else {
        r
    }
}

fn router(gw: Arc<Gateway>) -> Router {
    let mut r = Router::new()
        .route("/session.json", get(info))
        .route("/ws", get(ws))
        .route("/a/{hash}", get(asset))
        .route("/api/shared", get(shared_items))
        .route("/api/docs", get(docs_get))
        .route("/api/load", post(docs_load))
        .route("/api/publish", post(publish));
    for m in &gw.cfg.mounts {
        r = r
            .route(m, any(mounted))
            .route(&format!("{m}/{{*rest}}"), any(mounted));
    }
    for m in &gw.cfg.host_mounts {
        r = r
            .route(m, any(host_mounted))
            .route(&format!("{m}/{{*rest}}"), any(host_mounted));
    }
    r = r.fallback(static_file);
    secured(r, gw.cfg.hsts)
        .layer(middleware::from_fn_with_state(gw.clone(), guard))
        .with_state(gw)
}

/// Only this machine and the local network, unless the host exposed the
/// server; every address within its request budget. A page from an origin
/// the host allowed (`--allow-origin`, a dev server) may call the server's
/// HTTP side too; no other origin is answered for.
async fn guard(
    State(gw): State<Arc<Gateway>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    req: Request,
    next: Next,
) -> Response {
    // Through a trusted proxy or tunnel the client is wherever it is: the host made the session public.
    let via = req.extensions().get::<Via>().copied().unwrap_or(Via::Direct);
    if !gw.cfg.expose && via == Via::Direct && !lan::is_local(peer.ip()) {
        return StatusCode::FORBIDDEN.into_response();
    }
    if !gw.limits.request(peer.ip(), now_ms()) {
        gw.refused.requests.fetch_add(1, Ordering::Relaxed);
        return (StatusCode::TOO_MANY_REQUESTS, [(header::RETRY_AFTER, "2")]).into_response();
    }
    let allowed = req
        .headers()
        .get(header::ORIGIN)
        .and_then(|v| v.to_str().ok())
        .filter(|o| gw.cfg.allow_origins.iter().any(|a| a == o))
        .and_then(|o| HeaderValue::from_str(o).ok());
    let Some(origin) = allowed else {
        return next.run(req).await;
    };
    let mut res = if req.method() == Method::OPTIONS {
        StatusCode::NO_CONTENT.into_response()
    } else {
        next.run(req).await
    };
    let h = res.headers_mut();
    h.insert(header::ACCESS_CONTROL_ALLOW_ORIGIN, origin);
    h.insert(
        header::ACCESS_CONTROL_ALLOW_METHODS,
        HeaderValue::from_static("GET, POST"),
    );
    h.insert(
        header::ACCESS_CONTROL_ALLOW_HEADERS,
        HeaderValue::from_static("authorization, content-type, range"),
    );
    h.insert(header::VARY, HeaderValue::from_static("origin"));
    res
}

async fn info(State(gw): State<Arc<Gateway>>) -> Response {
    let s = gw.session.lock().unwrap();
    let body = serde_json::json!({
        "app": "3dheat",
        "proto": crate::session::PROTO,
        "name": s.cfg.name,
        "password": s.password_to_check(&proto::Hello::default()).is_some(),
        "tls": s.cfg.tls,
        "exposed": s.cfg.exposed,
    });
    (
        [
            (header::CONTENT_TYPE, "application/json"),
            (header::CACHE_CONTROL, "no-store"),
        ],
        body.to_string(),
    )
        .into_response()
}

fn bearer(h: &HeaderMap) -> String {
    h.get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .unwrap_or("")
        .to_string()
}

/// Whether the WebSocket's origin is the server's own (or one allowed): no other site's page may open it.
fn origin_ok(gw: &Gateway, h: &HeaderMap, via: Via) -> bool {
    let Some(origin) = h.get(header::ORIGIN).and_then(|v| v.to_str().ok()) else {
        // Not a browser: the origin check is against other sites' pages.
        return true;
    };
    if gw.cfg.allow_origins.iter().any(|o| o == origin) {
        return true;
    }
    let Some(host) = h.get(header::HOST).and_then(|v| v.to_str().ok()) else {
        return false;
    };
    let scheme = if gw.tls.is_none() { "http" } else { "https" };
    // Through a proxy or tunnel the browser's page is HTTPS whatever the last hop is.
    origin == format!("{scheme}://{host}") || (via != Via::Direct && origin == format!("https://{host}"))
}

async fn ws(
    State(gw): State<Arc<Gateway>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    hold: Option<axum::Extension<Arc<Hold>>>,
    via: Option<axum::Extension<Via>>,
    headers: HeaderMap,
    up: WebSocketUpgrade,
) -> Response {
    if !origin_ok(&gw, &headers, via.map(|v| v.0).unwrap_or(Via::Direct)) {
        return StatusCode::FORBIDDEN.into_response();
    }
    if !gw.limits.upgrade(peer.ip(), now_ms()) {
        gw.refused.upgrades.fetch_add(1, Ordering::Relaxed);
        return (StatusCode::TOO_MANY_REQUESTS, [(header::RETRY_AFTER, "5")]).into_response();
    }
    // No compression (axum offers none): no decompression bombs.
    up.max_message_size(MAX_CLIENT_MSG)
        .max_frame_size(MAX_CLIENT_MSG)
        .write_buffer_size(64 * 1024)
        .max_write_buffer_size(MAX_BACKLOG)
        .on_upgrade(move |sock| run_conn(gw, sock, peer.ip(), hold.map(|h| h.0)))
}

async fn send_close(
    sock: &mut futures_util::stream::SplitSink<WebSocket, Message>,
    reason: CloseReason,
) {
    let code = match reason {
        CloseReason::Kicked | CloseReason::BannedNow => 4001,
        CloseReason::TooSlow => 4002,
        CloseReason::Abuse => 4003,
        CloseReason::Replaced => 4004,
        CloseReason::Shutdown => 1001,
        CloseReason::CloseUnspecified => 4000,
    };
    let _ = tokio::time::timeout(
        Duration::from_secs(2),
        sock.send(Message::Close(Some(CloseFrame {
            code,
            reason: "".into(),
        }))),
    )
    .await;
}

async fn run_conn(gw: Arc<Gateway>, sock: WebSocket, ip: IpAddr, hold: Option<Arc<Hold>>) {
    // The WebSocket keeps the connection's places while it lasts.
    let live = hold.as_ref().map(|h| h.live.clone());
    let mark = |st: u8| {
        if let Some(l) = &live {
            if l.state.load(Ordering::Relaxed) <= PLACED_ST {
                l.set(st);
            }
        }
    };
    mark(WS_PENDING_ST);
    let evicted = async {
        match &live {
            Some(l) => l.kill.notified().await,
            None => std::future::pending().await,
        }
    };
    tokio::pin!(evicted);
    let conn = gw.next_conn.fetch_add(1, Ordering::Relaxed);
    let (mut sink, mut stream) = sock.split();
    let connected = gw.session.lock().unwrap().connect(conn, ip, now_ms());
    let challenge = match connected {
        Ok(outs) => outs,
        Err(code) => {
            let m = ServerMsg {
                body: Some(server_msg::Body::Denied(proto::Denied {
                    code: code as i32,
                    retry_ms: 5000,
                })),
            };
            let _ = sink.send(Message::Binary(m.encode_to_vec().into())).await;
            send_close(&mut sink, CloseReason::CloseUnspecified).await;
            return;
        }
    };
    let (tx, mut rx) = mpsc::channel::<Outgoing>(4096);
    let queued = Arc::new(AtomicUsize::new(0));
    let (ptx, mut prx) = watch::channel::<Option<Arc<Vec<u8>>>>(None);
    gw.conns.lock().unwrap().insert(
        conn,
        ConnTx {
            tx: tx.clone(),
            queued: queued.clone(),
            presence: ptx,
        },
    );
    gw.dispatch(challenge);

    // The writer: the queue first, presence when there is room.
    let wq = queued.clone();
    let writer = tokio::spawn(async move {
        loop {
            tokio::select! {
                biased;
                o = rx.recv() => match o {
                    Some(Outgoing::Bytes(b)) => {
                        wq.fetch_sub(b.len(), Ordering::Relaxed);
                        let sent = tokio::time::timeout(Duration::from_secs(15), sink.send(Message::Binary((*b).clone().into()))).await;
                        if !matches!(sent, Ok(Ok(()))) { break; }
                    }
                    Some(Outgoing::Close(r)) => { send_close(&mut sink, r).await; break; }
                    None => break,
                },
                ch = prx.changed() => {
                    if ch.is_err() { break; }
                    let b = prx.borrow_and_update().clone();
                    if let Some(b) = b {
                        let sent = tokio::time::timeout(Duration::from_secs(15), sink.send(Message::Binary((*b).clone().into()))).await;
                        if !matches!(sent, Ok(Ok(()))) { break; }
                    }
                }
            }
        }
    });

    let mut hello_done = false;
    let mut bad = 0u32;
    loop {
        // A hello soon, then something (a ping at least) every minute.
        let wait = if hello_done {
            Duration::from_secs(60)
        } else {
            HELLO_WITHIN
        };
        let next = tokio::select! {
            n = tokio::time::timeout(wait, stream.next()) => n,
            _ = tx.closed() => break,
            // Ended to make room (it had not said hello yet).
            _ = &mut evicted => break,
        };
        let Ok(Some(Ok(frame))) = next else { break };
        let data = match frame {
            Message::Binary(b) => b,
            Message::Ping(_) | Message::Pong(_) => continue,
            Message::Close(_) => break,
            Message::Text(_) => {
                let _ = tx.try_send(Outgoing::Close(CloseReason::Abuse));
                break;
            }
        };
        if data.len() > MAX_CLIENT_MSG {
            break;
        }
        let Ok(m) = ClientMsg::decode(data.as_ref()) else {
            bad += 1;
            let ack = ServerMsg {
                body: Some(server_msg::Body::Ack(proto::Ack {
                    rid: 0,
                    code: proto::Err::BadMessage as i32,
                    retry_ms: 0,
                })),
            };
            gw.dispatch(vec![Out::Send(Target::Conn(conn), ack)]);
            if bad > 10 || !hello_done {
                let _ = tx.try_send(Outgoing::Close(CloseReason::Abuse));
                break;
            }
            continue;
        };
        if !hello_done {
            let Some(client_msg::Body::Hello(h)) = m.body else {
                let _ = tx.try_send(Outgoing::Close(CloseReason::CloseUnspecified));
                break;
            };
            hello_done = true;
            let outs = hello(&gw, conn, h).await;
            gw.dispatch(outs);
            // In the session or its waiting room: this connection is never ended to make room.
            if gw.session.lock().unwrap().placed(conn) {
                mark(PLACED_ST);
            }
            continue;
        }
        let outs = gw
            .session
            .lock()
            .unwrap()
            .message(conn, m, data.len(), now_ms());
        gw.dispatch(outs);
    }
    gw.conns.lock().unwrap().remove(&conn);
    let outs = gw.session.lock().unwrap().disconnect(conn, now_ms());
    gw.dispatch(outs);
    drop(tx);
    let _ = tokio::time::timeout(Duration::from_secs(3), writer).await;
}

/// A hello: the password checked off the session's lock, two at a time at most.
/// Password checks waiting or running at once, at most (two run, the rest wait).
const CHECKS_QUEUED: usize = 8;

/// A hello: the password checked off the session's lock, two at a time at
/// most, one per address, and only so many waiting: past that a guess is
/// turned away at once (not counted as a failure), so a flood of guesses
/// from many addresses cannot pile up work that goes on after it.
async fn hello(gw: &Arc<Gateway>, conn: ConnId, h: proto::Hello) -> Vec<Out> {
    let (phc, locked, flooded, addr) = {
        let mut s = gw.session.lock().unwrap();
        let now = now_ms();
        (s.password_to_check(&h), s.locked(conn, now), s.flooded(now), s.addr_of(conn))
    };
    let mut ok = None;
    if let (Some(phc), 0) = (phc, locked) {
        {
            let mut q = gw.checks.lock().unwrap();
            if q.0 >= CHECKS_QUEUED || !q.1.insert(addr.clone()) {
                drop(q);
                gw.refused.requests.fetch_add(1, Ordering::Relaxed);
                return gw.session.lock().unwrap().busy(conn, 3000);
            }
            q.0 += 1;
        }
        struct Done<'a>(&'a Gateway, String);
        impl Drop for Done<'_> {
            fn drop(&mut self) {
                let mut q = self.0.checks.lock().unwrap();
                q.0 -= 1;
                q.1.remove(&self.1);
            }
        }
        let _done = Done(gw, addr);
        if flooded {
            tokio::time::sleep(Duration::from_millis(1000)).await;
        }
        let Ok(_permit) = gw.hashing.acquire().await else {
            return vec![];
        };
        let pw = h.password.clone();
        ok = Some(
            tokio::task::spawn_blocking(move || auth::verify_password(&pw, &phc))
                .await
                .unwrap_or(false),
        );
    }
    gw.session.lock().unwrap().hello(conn, &h, ok, now_ms())
}

/// A published file's address: 64 lower-case hex digits, nothing else.
pub fn hex64(s: &str) -> bool {
    s.len() == 64
        && s.bytes()
            .all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase())
}

/// A request for the core, with only the headers it needs.
fn to_core(method: Method, path_and_query: &str, from: &HeaderMap, body: Body) -> Request {
    let mut req = Request::new(body);
    *req.method_mut() = method;
    *req.uri_mut() = path_and_query
        .parse()
        .unwrap_or_else(|_| "/".parse().unwrap());
    let h = req.headers_mut();
    for name in [
        header::RANGE,
        header::IF_RANGE,
        header::IF_NONE_MATCH,
        header::IF_MODIFIED_SINCE,
        header::CONTENT_TYPE,
        header::CONTENT_LENGTH,
        header::ACCEPT_ENCODING,
    ] {
        if let Some(v) = from.get(&name) {
            h.insert(name, v.clone());
        }
    }
    h.insert(header::HOST, HeaderValue::from_static("core"));
    req
}

/// A published file by its hash, for a joined member (Range requests work).
async fn asset(
    State(gw): State<Arc<Gateway>>,
    Path(hash): Path<String>,
    headers: HeaderMap,
) -> Response {
    if !hex64(&hash) {
        return StatusCode::NOT_FOUND.into_response();
    }
    if !gw.session.lock().unwrap().asset_token_ok(&bearer(&headers)) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    gw.host
        .http(to_core(
            Method::GET,
            &format!("/a/{hash}"),
            &headers,
            Body::empty(),
        ))
        .await
}

/// The catalogue items the host shares, for a joined member: names, kinds, sizes and manifest hashes only.
async fn shared_items(State(gw): State<Arc<Gateway>>, headers: HeaderMap) -> Response {
    if !gw.session.lock().unwrap().asset_token_ok(&bearer(&headers)) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    gw.host.http(to_core(Method::GET, "/shared", &headers, Body::empty())).await
}

fn host_only(gw: &Gateway, headers: &HeaderMap) -> bool {
    gw.session.lock().unwrap().is_host_token(&bearer(headers))
}

/// The shared documents, for the host saving the session.
async fn docs_get(State(gw): State<Arc<Gateway>>, headers: HeaderMap) -> Response {
    if !host_only(&gw, &headers) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    let body = gw.session.lock().unwrap().docs_json();
    (
        [
            (header::CONTENT_TYPE, "application/json"),
            (header::CACHE_CONTROL, "no-store"),
        ],
        body,
    )
        .into_response()
}

/// The host opened a session file: its documents replace the shared ones.
/// The token is checked before a byte of the body is read.
async fn docs_load(State(gw): State<Arc<Gateway>>, headers: HeaderMap, body: Body) -> Response {
    if !host_only(&gw, &headers) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    let Ok(bytes) = axum::body::to_bytes(body, MAX_LOAD).await else {
        return StatusCode::PAYLOAD_TOO_LARGE.into_response();
    };
    let Ok(text) = std::str::from_utf8(&bytes) else {
        return StatusCode::UNPROCESSABLE_ENTITY.into_response();
    };
    let r = gw.session.lock().unwrap().load_docs(text);
    match r {
        Ok(mut outs) => {
            outs.push(Out::Audit(serde_json::json!({ "t": now_ms(), "event": "session_loaded", "bytes": bytes.len() }).to_string()));
            gw.dispatch(outs);
            StatusCode::NO_CONTENT.into_response()
        }
        // What was wrong, in a word (no input echoed back).
        Err(e) => (StatusCode::UNPROCESSABLE_ENTITY, crate::doc::error_word(&e)).into_response(),
    }
}

#[derive(serde::Deserialize)]
struct PublishQuery {
    name: Option<String>,
}

/// The host publishes a file (its data, its level) for members to fetch by hash.
async fn publish(
    State(gw): State<Arc<Gateway>>,
    headers: HeaderMap,
    Query(q): Query<PublishQuery>,
    body: Body,
) -> Response {
    if !host_only(&gw, &headers) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    let name = crate::text::clean(q.name.as_deref().unwrap_or("data"), 200, false);
    let path = format!("/api/publish?name={}", percent(&name));
    let res = gw
        .host
        .http(to_core(Method::POST, &path, &headers, body))
        .await;
    if res.status().is_success() {
        gw.host.audit(
            serde_json::json!({ "t": now_ms(), "event": "published", "name": name }).to_string(),
        );
    }
    res
}

fn percent(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for b in s.bytes() {
        if b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_' | b'.') {
            out.push(b as char);
        } else {
            out.push_str(&format!("%{b:02X}"));
        }
    }
    out
}

/// A service the core mounts (the data API): for the session's members and
/// the host only, and only ever with a member's rights (never files by path).
async fn mounted(State(gw): State<Arc<Gateway>>, req: Request) -> Response {
    let (parts, body) = req.into_parts();
    if parts.method != Method::POST {
        return StatusCode::METHOD_NOT_ALLOWED.into_response();
    }
    if !gw
        .session
        .lock()
        .unwrap()
        .asset_token_ok(&bearer(&parts.headers))
    {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    let pq = parts
        .uri
        .path_and_query()
        .map(|p| p.as_str())
        .unwrap_or("/");
    gw.host
        .http(to_core(Method::POST, pq, &parts.headers, body))
        .await
}

/// The header by which the core knows a request is the host's own. Only the
/// gateway sets it, and only after checking the host's token: no client
/// header reaches the core but the few `to_core` copies, and this is not one.
pub const HOST_MARK: &str = "x-heat3d-host";

/// A service for the host's own browser (its usage statistics): with the
/// host's token, forwarded marked as the host's; anyone else, a member
/// included, gets 403 and the core never sees the request.
async fn host_mounted(State(gw): State<Arc<Gateway>>, req: Request) -> Response {
    let (parts, body) = req.into_parts();
    if !host_only(&gw, &parts.headers) {
        return StatusCode::FORBIDDEN.into_response();
    }
    let pq = parts.uri.path_and_query().map(|p| p.as_str()).unwrap_or("/");
    let mut r = to_core(parts.method, pq, &parts.headers, body);
    if let Some(v) = parts.headers.get("x-heat3d-usage") {
        r.headers_mut().insert(HeaderName::from_static("x-heat3d-usage"), v.clone());
    }
    r.headers_mut().insert(HeaderName::from_static(HOST_MARK), HeaderValue::from_static("1"));
    gw.host.http(r).await
}

/// The web build, from the core: GET and HEAD only, no body.
async fn static_file(State(gw): State<Arc<Gateway>>, req: Request) -> Response {
    let (parts, _) = req.into_parts();
    if parts.method != Method::GET && parts.method != Method::HEAD {
        return StatusCode::METHOD_NOT_ALLOWED.into_response();
    }
    let path = parts.uri.path();
    // Plain paths only: the core resolves them inside the web build (and refuses anything else again).
    if path.len() > 512
        || path.contains("..")
        || path.contains('\\')
        || path.contains("%")
        || path.contains("//")
    {
        return StatusCode::NOT_FOUND.into_response();
    }
    gw.host
        .http(to_core(parts.method, path, &parts.headers, Body::empty()))
        .await
}

/// Runs the gateway as the locked-down child of `3dheat serve`: the channel
/// on stdin and stdout, its settings the first thing on it, then the TCP
/// connections the core hands over until the core goes.
pub async fn run_child<R, W>(
    read: R,
    write: W,
    lockdown: impl FnOnce() -> Result<String, String>,
) -> Result<(), String>
where
    R: AsyncRead + Unpin + Send + 'static,
    W: AsyncWrite + Unpin + Send + 'static,
{
    let (mux, mut incoming) = Mux::new(read, write, false);
    let first = tokio::time::timeout(Duration::from_secs(30), incoming.control.recv())
        .await
        .map_err(|_| "no settings from the core".to_string())?
        .ok_or("the core went away")?;
    let cfg: GatewayConfig =
        serde_json::from_slice(&first).map_err(|e| format!("settings: {e}"))?;
    // Everything from here on handles strangers' bytes: give up what is left first.
    let how = lockdown()?;
    let gw = Gateway::new(cfg, HostLink::Remote(mux.clone()))?;
    mux.control(
        serde_json::json!({ "ready": true, "sandbox": how })
            .to_string()
            .as_bytes(),
    )
    .await;
    loop {
        tokio::select! {
            s = incoming.streams.recv() => {
                let Some((meta, io)) = s else { break };
                let Ok(peer) = std::str::from_utf8(&meta).unwrap_or("").parse::<SocketAddr>() else { continue };
                tokio::spawn(gw.clone().serve_conn(io, peer));
            }
            // The core's word while running: whom to believe about clients' addresses.
            c = incoming.control.recv() => {
                let Some(b) = c else { break };
                if let Ok(v) = serde_json::from_slice::<serde_json::Value>(&b) {
                    if let Some(p) = v.get("proxies").and_then(|p| serde_json::from_value::<TrustedProxies>(p.clone()).ok()) {
                        gw.set_proxies(p);
                    }
                }
            }
            _ = mux.closed() => break,
        }
    }
    Ok(())
}
