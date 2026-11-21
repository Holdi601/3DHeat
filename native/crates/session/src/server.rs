//! The session server on the network: serves the web build, speaks the
//! session protocol over a WebSocket (`/ws`), and hands out files the host
//! published by content hash only (`/a/<sha256>`), never by path.
//!
//! Every connection has a reader (size checked before decoding, then
//! `Session::message`) and a writer with a bounded queue: a client that
//! falls more than 8 MB behind is cut off, and presence goes through a
//! one-slot channel of its own, so a slow client loses only presence frames,
//! never operations.
//!
//! By default only this machine and the local network get an answer; the
//! internet (expert mode) has to be asked for, and needs TLS.

use axum::body::Body;
use axum::extract::ws::{CloseFrame, Message, WebSocket, WebSocketUpgrade};
use axum::extract::{ConnectInfo, DefaultBodyLimit, Path, Query, Request, State};
use axum::http::{header, HeaderMap, HeaderName, HeaderValue, StatusCode};
use axum::middleware::{self, Next};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::Router;
use futures_util::{SinkExt, StreamExt};
use prost::Message as _;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::net::{IpAddr, SocketAddr};
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::{Arc, Mutex, RwLock};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::io::AsyncWriteExt;
use tokio::sync::{mpsc, watch, Semaphore};
use tower::ServiceExt;
use tower_http::services::{ServeDir, ServeFile};
use tower_http::set_header::SetResponseHeaderLayer;

use crate::auth;
use crate::lan;
use crate::proto::{self, client_msg, server_msg, ClientMsg, CloseReason, Dataset, ServerMsg};
use crate::session::{Config, ConnId, Out, Session};
use crate::tls::{self, TlsMode};

/// A control message from a client, at most (checked before decoding).
pub const MAX_CLIENT_MSG: usize = 64 * 1024;
/// What may wait to be sent to one client before it is cut off.
pub const MAX_BACKLOG: usize = 8 * 1024 * 1024;
/// A session file the host opens, at most.
pub const MAX_LOAD: usize = 64 * 1024 * 1024;

pub fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

#[derive(Clone, Debug)]
pub struct ServeConfig {
    pub bind: SocketAddr,
    /// The web build (`dist/`); without it the server says how to make one.
    pub web_root: Option<PathBuf>,
    pub tls: TlsMode,
    /// Answer addresses outside the local network (expert mode; needs TLS).
    pub expose: bool,
    /// Origins besides the server's own allowed to open the WebSocket (a dev server).
    pub allow_origins: Vec<String>,
    pub session: Config,
    pub password: Option<String>,
    /// The host's token; a random one when none.
    pub host_token: Option<String>,
    /// Where the certificate and published uploads are kept.
    pub state_dir: PathBuf,
    /// Files published for download from the start (the first one is the session's data).
    pub publish: Vec<PathBuf>,
    /// An upload the host publishes, at most, bytes.
    pub max_upload: u64,
}

impl ServeConfig {
    pub fn new(bind: SocketAddr, state_dir: PathBuf) -> Self {
        Self {
            bind,
            web_root: None,
            tls: TlsMode::SelfSigned(state_dir.join("tls")),
            expose: false,
            allow_origins: Vec::new(),
            session: Config::default(),
            password: None,
            host_token: None,
            state_dir,
            publish: Vec::new(),
            max_upload: 8 * 1024 * 1024 * 1024,
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

#[derive(Clone, Debug)]
struct Asset {
    path: PathBuf,
    size: u64,
    name: String,
}

struct App {
    session: Mutex<Session>,
    conns: Mutex<HashMap<ConnId, ConnTx>>,
    next_conn: AtomicU64,
    assets: RwLock<HashMap<String, Asset>>,
    hashing: Semaphore,
    cfg: ServeConfig,
}

/// A running server.
pub struct Running {
    pub addr: SocketAddr,
    pub host_token: String,
    /// The certificate's SHA-256 fingerprint, with TLS.
    pub fingerprint: Option<String>,
    pub scheme: &'static str,
    handle: axum_server::Handle,
    task: tokio::task::JoinHandle<std::io::Result<()>>,
    ticker: tokio::task::JoinHandle<()>,
}

impl Running {
    /// The address to open as the host (the token in the fragment never reaches a server log).
    pub fn host_url(&self, host: &str) -> String {
        format!(
            "{}://{}:{}/#host={}",
            self.scheme,
            host,
            self.addr.port(),
            self.host_token
        )
    }

    pub fn join_url(&self, host: &str) -> String {
        format!("{}://{}:{}/#join", self.scheme, host, self.addr.port())
    }

    pub async fn stop(self) {
        self.handle.graceful_shutdown(Some(Duration::from_secs(2)));
        self.ticker.abort();
        let _ = self.task.await;
    }

    pub async fn wait(self) -> std::io::Result<()> {
        let r = self.task.await.unwrap_or(Ok(()));
        self.ticker.abort();
        r
    }
}

fn encode(m: &ServerMsg) -> Arc<Vec<u8>> {
    Arc::new(m.encode_to_vec())
}

impl App {
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
                    Out::HashPassword(pw) => {
                        let app = self.clone();
                        let cost = s.cfg.cost;
                        tokio::spawn(async move {
                            let phc =
                                tokio::task::spawn_blocking(move || auth::hash_password(&pw, cost))
                                    .await
                                    .ok();
                            let outs = app.session.lock().unwrap().set_password_hash(phc);
                            app.dispatch(outs);
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
}

/// Starts the server; it runs until `stop`.
pub async fn start(cfg: ServeConfig) -> Result<Running, String> {
    let _ = rustls::crypto::ring::default_provider().install_default();
    if cfg.expose && matches!(cfg.tls, TlsMode::Off) {
        return Err("reaching the server from the internet needs TLS (drop --plain-http)".into());
    }
    if matches!(cfg.tls, TlsMode::Off) && !cfg.bind.ip().is_loopback() {
        return Err(
            "plain HTTP only on this machine (bind 127.0.0.1): browsers on other machines need TLS"
                .into(),
        );
    }
    let material = tls::material(&cfg.tls)?;
    let host_token = cfg.host_token.clone().unwrap_or_else(auth::token);
    let mut scfg = cfg.session.clone();
    scfg.tls = material.is_some();
    scfg.exposed = cfg.expose;
    let mut session = Session::new(scfg.clone(), host_token.clone());
    if let Some(pw) = &cfg.password {
        if pw.chars().count() < auth::MIN_PASSWORD {
            return Err(format!(
                "the session password needs at least {} characters",
                auth::MIN_PASSWORD
            ));
        }
        session.set_password_hash(Some(auth::hash_password(pw, scfg.cost)));
    }
    let mut assets = HashMap::new();
    for (i, p) in cfg.publish.iter().enumerate() {
        let (hash, size) = hash_file(p)
            .await
            .map_err(|e| format!("{}: {e}", p.display()))?;
        let name = p
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();
        if i == 0 {
            session.set_dataset(Dataset {
                name: name.clone(),
                hash: hash.clone(),
                size,
                published: true,
                ..Default::default()
            });
        }
        assets.insert(
            hash,
            Asset {
                path: p.clone(),
                size,
                name,
            },
        );
    }
    let app = Arc::new(App {
        session: Mutex::new(session),
        conns: Mutex::new(HashMap::new()),
        next_conn: AtomicU64::new(1),
        assets: RwLock::new(assets),
        hashing: Semaphore::new(2),
        cfg: cfg.clone(),
    });

    let router = router(app.clone());
    let listener =
        std::net::TcpListener::bind(cfg.bind).map_err(|e| format!("bind {}: {e}", cfg.bind))?;
    listener.set_nonblocking(true).map_err(|e| e.to_string())?;
    let addr = listener.local_addr().map_err(|e| e.to_string())?;
    let handle = axum_server::Handle::new();
    let svc = router.into_make_service_with_connect_info::<SocketAddr>();
    let (task, fingerprint, scheme) = match material {
        Some(m) => {
            let rc = axum_server::tls_rustls::RustlsConfig::from_pem(m.cert_pem, m.key_pem)
                .await
                .map_err(|e| format!("TLS: {e}"))?;
            let mut server = axum_server::from_tcp_rustls(listener, rc).handle(handle.clone());
            server
                .http_builder()
                .http1()
                .timer(hyper_util::rt::TokioTimer::new())
                .header_read_timeout(Duration::from_secs(10));
            (
                tokio::spawn(async move { server.serve(svc).await }),
                Some(m.fingerprint),
                "https",
            )
        }
        None => {
            let mut server = axum_server::from_tcp(listener).handle(handle.clone());
            server
                .http_builder()
                .http1()
                .timer(hyper_util::rt::TokioTimer::new())
                .header_read_timeout(Duration::from_secs(10));
            (
                tokio::spawn(async move { server.serve(svc).await }),
                None,
                "http",
            )
        }
    };

    // Presence and the clock, ten times a second: one frame for everyone,
    // each connection's slot overwritten, so the slow skip frames.
    let tick_app = app.clone();
    let ticker = tokio::spawn(async move {
        let mut iv = tokio::time::interval(Duration::from_millis(100));
        iv.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Skip);
        loop {
            iv.tick().await;
            let (frame, outs) = tick_app.session.lock().unwrap().tick(now_ms());
            if let Some(f) = frame {
                let bytes = encode(&f);
                let joined = tick_app
                    .session
                    .lock()
                    .unwrap()
                    .resolve(&crate::session::Target::Joined);
                let conns = tick_app.conns.lock().unwrap();
                for c in joined {
                    if let Some(tx) = conns.get(&c) {
                        let _ = tx.presence.send(Some(bytes.clone()));
                    }
                }
            }
            tick_app.dispatch(outs);
        }
    });
    Ok(Running {
        addr,
        host_token,
        fingerprint,
        scheme,
        handle,
        task,
        ticker,
    })
}

/// The security headers on every answer.
fn secured<S: Clone + Send + Sync + 'static>(r: Router<S>) -> Router<S> {
    let h = |name: &'static str, value: &'static str| {
        SetResponseHeaderLayer::overriding(
            HeaderName::from_static(name),
            HeaderValue::from_static(value),
        )
    };
    r.layer(h(
        "content-security-policy",
        "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; \
         connect-src 'self' wss: https:; font-src 'self' data:; media-src 'self' blob:; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'none'",
    ))
    .layer(h("x-content-type-options", "nosniff"))
    .layer(h("x-frame-options", "DENY"))
    .layer(h("referrer-policy", "no-referrer"))
    .layer(h("cross-origin-opener-policy", "same-origin"))
    .layer(h("cross-origin-resource-policy", "same-origin"))
    .layer(h("permissions-policy", "camera=(), microphone=(), geolocation=()"))
}

fn router(app: Arc<App>) -> Router {
    let mut r = Router::new()
        .route("/session.json", get(info))
        .route("/ws", get(ws))
        .route("/a/{hash}", get(asset))
        .route("/api/docs", get(docs_get))
        .route(
            "/api/load",
            post(docs_load).layer(DefaultBodyLimit::max(MAX_LOAD)),
        )
        .route(
            "/api/publish",
            post(publish).layer(DefaultBodyLimit::disable()),
        );
    r = match &app.cfg.web_root {
        Some(root) => r.fallback_service(
            ServeDir::new(root)
                .append_index_html_on_directories(true)
                .fallback(ServeFile::new(root.join("index.html"))),
        ),
        None => r.fallback(|| async {
            (
                StatusCode::NOT_FOUND,
                "No web build: run `npm run build` and pass --web dist",
            )
        }),
    };
    secured(r)
        .layer(middleware::from_fn_with_state(app.clone(), guard))
        .with_state(app)
}

/// Only this machine and the local network, unless the host exposed the server.
/// A page from an origin the host allowed (`--allow-origin`, a dev server) may
/// call the server's HTTP side too; no other origin is answered for.
async fn guard(
    State(app): State<Arc<App>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    req: Request,
    next: Next,
) -> Response {
    if !app.cfg.expose && !lan::is_local(peer.ip()) {
        return StatusCode::FORBIDDEN.into_response();
    }
    let allowed = req
        .headers()
        .get(header::ORIGIN)
        .and_then(|v| v.to_str().ok())
        .filter(|o| app.cfg.allow_origins.iter().any(|a| a == o))
        .and_then(|o| HeaderValue::from_str(o).ok());
    let Some(origin) = allowed else {
        return next.run(req).await;
    };
    let mut res = if req.method() == axum::http::Method::OPTIONS {
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

async fn info(State(app): State<Arc<App>>) -> Response {
    let s = app.session.lock().unwrap();
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
fn origin_ok(app: &App, h: &HeaderMap) -> bool {
    let Some(origin) = h.get(header::ORIGIN).and_then(|v| v.to_str().ok()) else {
        // Not a browser: the origin check is against other sites' pages.
        return true;
    };
    if app.cfg.allow_origins.iter().any(|o| o == origin) {
        return true;
    }
    let Some(host) = h.get(header::HOST).and_then(|v| v.to_str().ok()) else {
        return false;
    };
    let scheme = if matches!(app.cfg.tls, TlsMode::Off) {
        "http"
    } else {
        "https"
    };
    origin == format!("{scheme}://{host}")
}

async fn ws(
    State(app): State<Arc<App>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    up: WebSocketUpgrade,
) -> Response {
    if !origin_ok(&app, &headers) {
        return StatusCode::FORBIDDEN.into_response();
    }
    up.max_message_size(MAX_CLIENT_MSG)
        .max_frame_size(MAX_CLIENT_MSG)
        .on_upgrade(move |sock| run_conn(app, sock, peer.ip()))
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

async fn run_conn(app: Arc<App>, sock: WebSocket, ip: IpAddr) {
    let conn = app.next_conn.fetch_add(1, Ordering::Relaxed);
    let (mut sink, mut stream) = sock.split();
    let connected = app.session.lock().unwrap().connect(conn, ip, now_ms());
    if let Err(code) = connected {
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
    let (tx, mut rx) = mpsc::channel::<Outgoing>(4096);
    let queued = Arc::new(AtomicUsize::new(0));
    let (ptx, mut prx) = watch::channel::<Option<Arc<Vec<u8>>>>(None);
    app.conns.lock().unwrap().insert(
        conn,
        ConnTx {
            tx: tx.clone(),
            queued: queued.clone(),
            presence: ptx,
        },
    );

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
        // A hello within ten seconds, then something (a ping at least) every minute.
        let wait = if hello_done {
            Duration::from_secs(60)
        } else {
            Duration::from_secs(10)
        };
        let next = tokio::select! {
            n = tokio::time::timeout(wait, stream.next()) => n,
            _ = tx.closed() => break,
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
            app.dispatch(vec![Out::Send(crate::session::Target::Conn(conn), ack)]);
            if bad > 10 {
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
            let outs = hello(&app, conn, h).await;
            app.dispatch(outs);
            continue;
        }
        let outs = app
            .session
            .lock()
            .unwrap()
            .message(conn, m, data.len(), now_ms());
        app.dispatch(outs);
    }
    app.conns.lock().unwrap().remove(&conn);
    let outs = app.session.lock().unwrap().disconnect(conn, now_ms());
    app.dispatch(outs);
    drop(tx);
    let _ = tokio::time::timeout(Duration::from_secs(3), writer).await;
}

/// A hello: the password checked off the session's lock, two at a time at most.
async fn hello(app: &Arc<App>, conn: ConnId, h: proto::Hello) -> Vec<Out> {
    let (phc, locked, flooded) = {
        let mut s = app.session.lock().unwrap();
        let now = now_ms();
        (s.password_to_check(&h), s.locked(conn, now), s.flooded(now))
    };
    let mut ok = None;
    if let (Some(phc), 0) = (phc, locked) {
        if flooded {
            tokio::time::sleep(Duration::from_millis(1000)).await;
        }
        let Ok(_permit) = app.hashing.acquire().await else {
            return vec![];
        };
        let pw = h.password.clone();
        ok = Some(
            tokio::task::spawn_blocking(move || auth::verify_password(&pw, &phc))
                .await
                .unwrap_or(false),
        );
    }
    app.session.lock().unwrap().hello(conn, &h, ok, now_ms())
}

fn hex64(s: &str) -> bool {
    s.len() == 64
        && s.bytes()
            .all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase())
}

/// A published file by its hash, for a joined member (Range requests work).
async fn asset(
    State(app): State<Arc<App>>,
    Path(hash): Path<String>,
    headers: HeaderMap,
    req: Request,
) -> Response {
    if !hex64(&hash) {
        return StatusCode::NOT_FOUND.into_response();
    }
    if !app
        .session
        .lock()
        .unwrap()
        .asset_token_ok(&bearer(&headers))
    {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    let Some(a) = app.assets.read().unwrap().get(&hash).cloned() else {
        return StatusCode::NOT_FOUND.into_response();
    };
    let mut res = match ServeFile::new(&a.path).oneshot(req).await {
        Ok(r) => r.map(Body::new),
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    let h = res.headers_mut();
    h.insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("application/octet-stream"),
    );
    h.insert(
        header::CACHE_CONTROL,
        HeaderValue::from_static("private, max-age=31536000, immutable"),
    );
    if let Ok(v) = HeaderValue::from_str(&format!(
        "attachment; filename=\"{}\"",
        a.name.replace(
            |c: char| !c.is_ascii_alphanumeric() && c != '.' && c != '-' && c != '_',
            "_"
        )
    )) {
        h.insert(header::CONTENT_DISPOSITION, v);
    }
    let _ = a.size;
    res
}

fn host_only(app: &App, headers: &HeaderMap) -> bool {
    app.session.lock().unwrap().is_host_token(&bearer(headers))
}

/// The shared documents, for the host saving the session.
async fn docs_get(State(app): State<Arc<App>>, headers: HeaderMap) -> Response {
    if !host_only(&app, &headers) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    let body = app.session.lock().unwrap().docs_json();
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
async fn docs_load(State(app): State<Arc<App>>, headers: HeaderMap, body: String) -> Response {
    if !host_only(&app, &headers) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    let r = app.session.lock().unwrap().load_docs(&body);
    match r {
        Ok(outs) => {
            app.dispatch(outs);
            StatusCode::NO_CONTENT.into_response()
        }
        Err(e) => (StatusCode::UNPROCESSABLE_ENTITY, format!("{e:?}")).into_response(),
    }
}

#[derive(serde::Deserialize)]
struct PublishQuery {
    name: Option<String>,
}

/// The host publishes a file (its data, its level) for members to fetch by hash.
async fn publish(
    State(app): State<Arc<App>>,
    headers: HeaderMap,
    Query(q): Query<PublishQuery>,
    body: Body,
) -> Response {
    if !host_only(&app, &headers) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    let dir = app.cfg.state_dir.join("assets");
    if tokio::fs::create_dir_all(&dir).await.is_err() {
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }
    let tmp = dir.join(format!("upload-{}.part", auth::token()));
    let Ok(mut f) = tokio::fs::File::create(&tmp).await else {
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    };
    let mut hasher = Sha256::new();
    let mut size = 0u64;
    let mut stream = body.into_data_stream();
    while let Some(chunk) = stream.next().await {
        let Ok(chunk) = chunk else {
            let _ = tokio::fs::remove_file(&tmp).await;
            return StatusCode::BAD_REQUEST.into_response();
        };
        size += chunk.len() as u64;
        if size > app.cfg.max_upload || f.write_all(&chunk).await.is_err() {
            drop(f);
            let _ = tokio::fs::remove_file(&tmp).await;
            return StatusCode::PAYLOAD_TOO_LARGE.into_response();
        }
        hasher.update(&chunk);
    }
    let _ = f.flush().await;
    drop(f);
    let hash = hex::encode(hasher.finalize());
    let path = dir.join(&hash);
    if tokio::fs::rename(&tmp, &path).await.is_err() {
        let _ = tokio::fs::remove_file(&tmp).await;
    }
    let name = crate::text::clean(q.name.as_deref().unwrap_or("data"), 200, false);
    app.assets
        .write()
        .unwrap()
        .insert(hash.clone(), Asset { path, size, name });
    (
        [(header::CONTENT_TYPE, "application/json")],
        serde_json::json!({ "hash": hash, "size": size }).to_string(),
    )
        .into_response()
}

async fn hash_file(p: &std::path::Path) -> std::io::Result<(String, u64)> {
    use tokio::io::AsyncReadExt;
    let mut f = tokio::fs::File::open(p).await?;
    let mut h = Sha256::new();
    let mut buf = vec![0u8; 1 << 20];
    let mut size = 0u64;
    loop {
        let n = f.read(&mut buf).await?;
        if n == 0 {
            break;
        }
        size += n as u64;
        h.update(&buf[..n]);
    }
    Ok((hex::encode(h.finalize()), size))
}
