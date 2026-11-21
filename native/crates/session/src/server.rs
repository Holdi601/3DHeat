//! The session server's core: the part with the user's rights. It listens
//! on the port, keeps the files (the web build, what the host published,
//! uploads), mounts the native core's data API, writes the audit log, and
//! starts the **gateway** (`gateway.rs`), which does everything else: TLS,
//! HTTP, the WebSocket and the session's rules.
//!
//! With a sandbox (`ServeConfig::gateway`, what `3dheat serve` does) the
//! gateway is a locked-down process of its own (`heat3d-sandbox`): the core
//! accepts each TCP connection and relays its bytes over the channel
//! (`ipc.rs`), and serves the gateway's requests for files on streams of the
//! same channel, never trusting what they claim beyond what any member
//! could ask. Without one (tests, `--no-sandbox`) the gateway runs in this
//! process, the same code.
//!
//! By default only this machine and the local network get an answer; the
//! internet (expert mode) has to be asked for, and needs TLS.

use axum::body::Body;
use axum::extract::{ConnectInfo, Path, Query, Request, State};
use axum::http::{header, HeaderValue, StatusCode};
use axum::middleware::{self, Next};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::Router;
use futures_util::StreamExt;
use hyper_util::rt::TokioIo;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::io::Write as _;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::{Arc, Mutex, RwLock};
use std::time::Duration;
use tokio::io::AsyncWriteExt;
use tokio::sync::watch;
use tower::ServiceExt;
use tower_http::services::{ServeDir, ServeFile};

use crate::auth;
use crate::gateway::{self, Gateway, GatewayConfig, HostLink, NetLimits, StartData};
use crate::ipc::Mux;
use crate::limits::PerIp;
use crate::proxy::TrustedProxies;
use crate::share::{self, Blocklist};
use crate::session::Config;
use crate::tls::{self, TlsMode};

pub use crate::gateway::{now_ms, MAX_BACKLOG, MAX_CLIENT_MSG, MAX_LOAD};

/// How to start the gateway as its own process: this program, with these arguments.
#[derive(Clone, Debug)]
pub struct GatewayCommand {
    pub exe: PathBuf,
    pub args: Vec<String>,
}

impl GatewayCommand {
    /// This very program, `gateway`: what `3dheat serve` (and the app) answer to.
    pub fn this_program() -> Result<Self, String> {
        Ok(Self {
            exe: std::env::current_exe().map_err(|e| format!("this program's path: {e}"))?,
            args: vec!["gateway".into()],
        })
    }
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
    /// Where the certificate, published uploads and the audit log are kept.
    pub state_dir: PathBuf,
    /// Files published for download from the start (the first one is the session's data).
    pub publish: Vec<PathBuf>,
    /// An upload the host publishes, at most, bytes.
    pub max_upload: u64,
    /// More services under paths of their own (`3dheat serve` mounts the native
    /// core's data API at `/v1`, crates/server). Members reach them with their
    /// token, by POST, with a member's rights only.
    pub mount: Vec<(String, Router)>,
    /// Services for the host's own browser only (`3dheat serve` mounts its local
    /// usage statistics at `/__heat3d/usage`): the gateway forwards them with the
    /// host's token only; they see such a request as from this machine.
    pub host_mount: Vec<(String, Router)>,
    /// The network's limits.
    pub limits: NetLimits,
    /// The gateway as a locked-down process of its own; None: in this process.
    pub gateway: Option<GatewayCommand>,
    /// Reverse proxies and tunnels trusted to name the client (`proxy.rs`);
    /// `Running::set_proxies` changes it while the server runs.
    pub proxies: TrustedProxies,
    /// The catalogue folder the host may share items of, and what is blocked (`share.rs`); None: no sharing.
    pub share: Option<ShareConfig>,
}

/// Sharing from the host's catalogue folder.
#[derive(Clone, Debug)]
pub struct ShareConfig {
    pub root: PathBuf,
    pub blocklist: Blocklist,
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
            mount: Vec::new(),
            host_mount: Vec::new(),
            limits: NetLimits::default(),
            gateway: None,
            proxies: TrustedProxies::default(),
            share: None,
        }
    }
}

/// A running server.
pub struct Running {
    pub addr: SocketAddr,
    pub host_token: String,
    /// The certificate's SHA-256 fingerprint, with TLS.
    pub fingerprint: Option<String>,
    pub scheme: &'static str,
    /// What the gateway gave up, in words (with a sandbox).
    pub sandbox: Option<String>,
    stop: watch::Sender<bool>,
    task: tokio::task::JoinHandle<std::io::Result<()>>,
    control: Arc<Control>,
}

/// What the core changes in the running gateway: whom to believe about clients' addresses.
pub struct Control {
    proxies: RwLock<TrustedProxies>,
    link: Mutex<Option<CtlLink>>,
}

enum CtlLink {
    Local(Arc<Gateway>),
    Remote(Mux),
}

impl Control {
    fn new(p: TrustedProxies) -> Arc<Self> {
        Arc::new(Self { proxies: RwLock::new(p), link: Mutex::new(None) })
    }

    pub fn proxies(&self) -> TrustedProxies {
        self.proxies.read().unwrap().clone()
    }

    /// From now on, in the core and the gateway (and a gateway started again).
    pub fn set_proxies(&self, p: TrustedProxies) {
        *self.proxies.write().unwrap() = p.clone();
        match &*self.link.lock().unwrap() {
            Some(CtlLink::Local(gw)) => gw.set_proxies(p),
            Some(CtlLink::Remote(mux)) => {
                let mux = mux.clone();
                let msg = serde_json::json!({ "proxies": p }).to_string();
                tokio::spawn(async move { mux.control(msg.as_bytes()).await });
            }
            None => {}
        }
    }
}

impl Running {
    /// Whom the server believes about clients' addresses, changeable while it runs.
    pub fn control(&self) -> Arc<Control> {
        self.control.clone()
    }

    /// The address to open as the host (the token in the fragment never reaches a server log).
    pub fn host_url(&self, host: &str) -> String {
        format!("{}://{}:{}/#host={}", self.scheme, host, self.addr.port(), self.host_token)
    }

    pub fn join_url(&self, host: &str) -> String {
        format!("{}://{}:{}/#join", self.scheme, host, self.addr.port())
    }

    pub async fn stop(self) {
        let _ = self.stop.send(true);
        let _ = tokio::time::timeout(Duration::from_secs(3), self.task).await;
    }

    pub async fn wait(self) -> std::io::Result<()> {
        self.task.await.unwrap_or(Ok(()))
    }
}

#[derive(Clone, Debug)]
struct Asset {
    path: PathBuf,
    size: u64,
    name: String,
}

/// What the core keeps for the gateway's requests.
struct Store {
    assets: RwLock<HashMap<String, Asset>>,
    state_dir: PathBuf,
    max_upload: u64,
    /// Uploads at once, at most.
    uploading: tokio::sync::Semaphore,
    /// Bytes uploaded since the start: at most `UPLOADS_TOTAL` (a gateway someone
    /// took over cannot fill the disk through the host's uploads).
    uploaded: std::sync::atomic::AtomicU64,
    /// Items of the catalogue the host shares (`share.rs`).
    shared: RwLock<Vec<Shared>>,
}

/// An item the host shares: what members see of it, and the hashes it put on offer.
#[derive(Clone, Debug, serde::Serialize)]
struct Shared {
    id: String,
    kind: share::Kind,
    game: String,
    name: String,
    size: u64,
    files: usize,
    /// The manifest's hash: members fetch it first, then each file it names.
    manifest: String,
    /// Marked confidential: members are told it is for people entitled to see it only.
    confidential: bool,
    #[serde(skip)]
    hashes: Vec<String>,
}

/// What may be uploaded in all while the server runs, bytes.
const UPLOADS_TOTAL: u64 = 32 * 1024 * 1024 * 1024;

/// The audit log: one JSON line per event in `audit.log` in the state
/// folder, at most a thousand lines a minute (then one line saying how many
/// were left out), the file rolled over at 10 MB. Never a password or a token.
pub struct AuditLog {
    path: PathBuf,
    state: Mutex<(i64, u32, u64)>,
}

impl AuditLog {
    pub fn new(dir: &std::path::Path) -> Self {
        Self {
            path: dir.join("audit.log"),
            state: Mutex::new((0, 0, 0)),
        }
    }

    pub fn write(&self, line: &str) {
        let now = now_ms();
        let mut st = self.state.lock().unwrap();
        let minute = now / 60_000;
        let mut out = String::new();
        if st.0 != minute {
            if st.2 > 0 {
                out.push_str(&serde_json::json!({ "t": now, "event": "audit_suppressed", "lines": st.2 }).to_string());
                out.push('\n');
            }
            *st = (minute, 0, 0);
        }
        if st.1 >= 1000 {
            st.2 += 1;
            return;
        }
        st.1 += 1;
        // The gateway's line, checked and stamped here: one line of JSON, nothing else.
        let v = match serde_json::from_str::<serde_json::Value>(line) {
            Ok(serde_json::Value::Object(mut m)) => {
                m.insert("at".into(), now.into());
                serde_json::Value::Object(m)
            }
            _ => serde_json::json!({ "t": now, "event": "audit_malformed" }),
        };
        out.push_str(&v.to_string());
        out.push('\n');
        if std::fs::metadata(&self.path).map(|m| m.len() > 10 * 1024 * 1024).unwrap_or(false) {
            let _ = std::fs::rename(&self.path, self.path.with_extension("log.1"));
        }
        if let Some(d) = self.path.parent() {
            let _ = std::fs::create_dir_all(d);
        }
        if let Ok(mut f) = std::fs::OpenOptions::new().create(true).append(true).open(&self.path) {
            let _ = f.write_all(out.as_bytes());
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
        return Err("plain HTTP only on this machine (bind 127.0.0.1): browsers on other machines need TLS".into());
    }
    let material = tls::material(&cfg.tls)?;
    let host_token = cfg.host_token.clone().unwrap_or_else(auth::token);
    let mut scfg = cfg.session.clone();
    scfg.tls = material.is_some();
    scfg.exposed = cfg.expose;
    let password_phc = match &cfg.password {
        Some(pw) if pw.chars().count() < auth::MIN_PASSWORD => {
            return Err(format!("the session password needs at least {} characters", auth::MIN_PASSWORD));
        }
        Some(pw) => Some(auth::hash_password(pw, scfg.cost)),
        None => None,
    };
    let mut assets = HashMap::new();
    let mut dataset = None;
    for (i, p) in cfg.publish.iter().enumerate() {
        let (hash, size) = hash_file(p).await.map_err(|e| format!("{}: {e}", p.display()))?;
        let name = p.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
        if i == 0 {
            dataset = Some(StartData { name: name.clone(), hash: hash.clone(), size });
        }
        assets.insert(hash, Asset { path: p.clone(), size, name });
    }
    let store = Arc::new(Store {
        assets: RwLock::new(assets),
        state_dir: cfg.state_dir.clone(),
        max_upload: cfg.max_upload,
        uploading: tokio::sync::Semaphore::new(2),
        uploaded: std::sync::atomic::AtomicU64::new(0),
        shared: RwLock::new(Vec::new()),
    });
    let audit = Arc::new(AuditLog::new(&cfg.state_dir));
    // Sharing from the catalogue: the host's browser only (the gateway forwards it with the host's token).
    let mut host_mount = cfg.host_mount.clone();
    host_mount.push((SHARE_ROUTE.into(), share_router(store.clone(), audit.clone(), cfg.share.clone())));
    let core = core_router(store, cfg.web_root.clone(), &cfg.mount, &host_mount);
    let gcfg = GatewayConfig {
        expose: cfg.expose,
        allow_origins: cfg.allow_origins.clone(),
        session: scfg,
        password_phc,
        host_token: host_token.clone(),
        dataset,
        tls_cert_pem: material.as_ref().map(|m| String::from_utf8_lossy(&m.cert_pem).to_string()),
        tls_key_pem: material.as_ref().map(|m| String::from_utf8_lossy(&m.key_pem).to_string()),
        hsts: matches!(cfg.tls, TlsMode::Files { .. }),
        mounts: cfg.mount.iter().map(|(p, _)| p.clone()).collect(),
        host_mounts: host_mount.iter().map(|(p, _)| p.clone()).collect(),
        limits: cfg.limits.clone(),
        proxies: cfg.proxies.clone(),
    };
    let control = Control::new(cfg.proxies.clone());

    let listener = std::net::TcpListener::bind(cfg.bind).map_err(|e| format!("bind {}: {e}", cfg.bind))?;
    listener.set_nonblocking(true).map_err(|e| e.to_string())?;
    let addr = listener.local_addr().map_err(|e| e.to_string())?;
    let listener = tokio::net::TcpListener::from_std(listener).map_err(|e| e.to_string())?;
    let (stop_tx, stop_rx) = watch::channel(false);
    audit.write(&serde_json::json!({ "t": now_ms(), "event": "start", "addr": addr.to_string(), "exposed": cfg.expose, "tls": material.is_some(), "sandbox": cfg.gateway.is_some() }).to_string());

    let (task, sandbox) = match cfg.gateway.clone() {
        None => {
            let a = audit.clone();
            let link = HostLink::Local { router: core, audit: Arc::new(move |l: String| a.write(&l)) };
            let gw = Gateway::new(gcfg, link)?;
            *control.link.lock().unwrap() = Some(CtlLink::Local(gw.clone()));
            (tokio::spawn(accept_local(listener, gw, stop_rx)), None)
        }
        Some(cmd) => {
            let (mux, how) = spawn_gateway(&cmd, &gcfg, core.clone(), audit.clone()).await?;
            *control.link.lock().unwrap() = Some(CtlLink::Remote(mux.clone()));
            let sup = Supervisor {
                cmd,
                gcfg,
                core,
                audit: audit.clone(),
                limits: PerIp::new(NetLimits { conns: cfg.limits.conns * 4, ..cfg.limits.clone() }),
                control: control.clone(),
            };
            (tokio::spawn(sup.run(listener, mux, stop_rx)), Some(how))
        }
    };
    Ok(Running {
        addr,
        host_token,
        fingerprint: material.map(|m| m.fingerprint),
        scheme: if matches!(cfg.tls, TlsMode::Off) { "http" } else { "https" },
        sandbox,
        stop: stop_tx,
        task,
        control,
    })
}

/// The gateway in this process: each connection straight to it.
async fn accept_local(listener: tokio::net::TcpListener, gw: Arc<Gateway>, mut stop: watch::Receiver<bool>) -> std::io::Result<()> {
    loop {
        tokio::select! {
            a = listener.accept() => {
                let Ok((tcp, peer)) = a else {
                    tokio::time::sleep(Duration::from_millis(50)).await;
                    continue;
                };
                let _ = tcp.set_nodelay(true);
                tokio::spawn(gw.clone().serve_conn(tcp, peer));
            }
            _ = stopped(&mut stop) => return Ok(()),
        }
    }
}

/// Until the server is told to stop.
async fn stopped(rx: &mut watch::Receiver<bool>) {
    while !*rx.borrow_and_update() {
        if rx.changed().await.is_err() {
            return;
        }
    }
}

/// The gateway process: started, told its settings, its requests served,
/// and started again should it end.
struct Supervisor {
    cmd: GatewayCommand,
    gcfg: GatewayConfig,
    core: Router,
    audit: Arc<AuditLog>,
    /// The core's own cap on connections, before a byte is relayed.
    limits: PerIp,
    control: Arc<Control>,
}

/// The gateway as its own process, and the channel to it: its settings
/// sent, its requests and audit lines served, until it is ready.
async fn spawn_gateway(cmd: &GatewayCommand, gcfg: &GatewayConfig, core: Router, audit: Arc<AuditLog>) -> Result<(Mux, String), String> {
    let args: Vec<&str> = cmd.args.iter().map(String::as_str).collect();
    let mut child = heat3d_sandbox::spawn(&cmd.exe, &args).map_err(|e| format!("starting the gateway: {e}"))?;
    let stdout = std::mem::replace(&mut child.stdout, Box::new(tokio::io::empty()));
    let stdin = std::mem::replace(&mut child.stdin, Box::new(tokio::io::sink()));
    let mut stderr = std::mem::replace(&mut child.stderr, Box::new(tokio::io::empty()));
    // What the gateway says on its error stream: the core's error stream, line by line.
    tokio::spawn(async move {
        use tokio::io::AsyncBufReadExt;
        let mut lines = tokio::io::BufReader::new(&mut stderr).lines();
        while let Ok(Some(l)) = lines.next_line().await {
            eprintln!("3dheat gateway: {}", l.chars().take(500).collect::<String>());
        }
    });
    let (mux, mut incoming) = Mux::new(stdout, stdin, true);
    mux.control(serde_json::to_string(gcfg).map_err(|e| e.to_string())?.as_bytes()).await;
    // Ready, or what went wrong.
    let ready = tokio::time::timeout(Duration::from_secs(20), incoming.control.recv()).await;
    let how = match ready {
        Ok(Some(b)) => match serde_json::from_slice::<serde_json::Value>(&b) {
            Ok(v) if v["ready"] == true => {
                let said = v["sandbox"].as_str().unwrap_or("").chars().take(300).collect::<String>();
                match heat3d_sandbox::started_as() {
                    "" => said,
                    how => how.to_string(),
                }
            }
            _ => return Err("the gateway did not start".into()),
        },
        _ => return Err("the gateway did not start (see its messages above)".into()),
    };
    // The gateway's requests (files, uploads, the data API) and audit lines.
    tokio::spawn(async move {
        loop {
            tokio::select! {
                s = incoming.streams.recv() => {
                    let Some((meta, io)) = s else { break };
                    if &meta[..] != b"http" { continue; }
                    tokio::spawn(serve_core(io, core.clone()));
                }
                c = incoming.control.recv() => {
                    let Some(b) = c else { break };
                    if let Ok(v) = serde_json::from_slice::<serde_json::Value>(&b) {
                        if let Some(line) = v["audit"].as_str() {
                            audit.write(line);
                        }
                    }
                }
            }
        }
    });
    // The child lives as long as the channel; it is killed when the channel ends.
    let m3 = mux.clone();
    tokio::spawn(async move {
        tokio::select! {
            _ = child.wait() => {}
            _ = m3.closed() => { child.kill(); child.wait().await; }
        }
    });
    Ok((mux, how))
}

impl Supervisor {
    async fn run(self, listener: tokio::net::TcpListener, mut mux: Mux, mut stop: watch::Receiver<bool>) -> std::io::Result<()> {
        let mut restarts = 0u32;
        loop {
            tokio::select! {
                a = listener.accept() => {
                    let Ok((tcp, peer)) = a else {
                        tokio::time::sleep(Duration::from_millis(50)).await;
                        continue;
                    };
                    if !self.gcfg.expose && !crate::lan::is_local(peer.ip()) {
                        continue;
                    }
                    // A trusted proxy carries many clients: its connections count against the total only.
                    let shared = self.control.proxies.read().unwrap().trusts(peer.ip());
                    let slot = if shared { self.limits.connect_shared() } else { self.limits.connect(peer.ip()) };
                    let Some(slot) = slot else { continue };
                    let _ = tcp.set_nodelay(true);
                    let mux = mux.clone();
                    tokio::spawn(async move {
                        let _slot = slot;
                        let Ok(mut stream) = mux.open(peer.to_string().as_bytes()).await else { return };
                        let mut tcp = tcp;
                        let _ = tokio::io::copy_bidirectional(&mut tcp, &mut stream).await;
                    });
                }
                _ = mux.closed() => {
                    restarts += 1;
                    self.audit.write(&serde_json::json!({ "t": now_ms(), "event": "gateway_ended", "restarts": restarts }).to_string());
                    eprintln!("3dheat: the gateway ended; starting it again (the session starts afresh)");
                    tokio::time::sleep(Duration::from_millis(500 * restarts.min(20) as u64)).await;
                    let gcfg = GatewayConfig { proxies: self.control.proxies(), ..self.gcfg.clone() };
                    match spawn_gateway(&self.cmd, &gcfg, self.core.clone(), self.audit.clone()).await {
                        Ok((m, _)) => {
                            *self.control.link.lock().unwrap() = Some(CtlLink::Remote(m.clone()));
                            mux = m;
                        }
                        Err(e) => {
                            eprintln!("3dheat: {e}");
                            if restarts > 20 { return Err(std::io::Error::other(e)); }
                        }
                    }
                }
                _ = stopped(&mut stop) => return Ok(()),
            }
        }
    }
}

/// One request of the gateway's, on its stream: HTTP/1.1 to the core's router.
async fn serve_core(io: tokio::io::DuplexStream, core: Router) {
    let svc = hyper::service::service_fn(move |req: hyper::Request<hyper::body::Incoming>| {
        let r = core.clone();
        async move { r.oneshot(req.map(Body::new)).await }
    });
    let _ = hyper::server::conn::http1::Builder::new()
        .max_buf_size(gateway::MAX_HEAD)
        .serve_connection(TokioIo::new(io), svc)
        .await;
}

/// What the core serves the gateway: the web build, published files by
/// hash, uploads, and the mounted services, which see every request as a
/// remote one (no address of this machine: never files by path).
fn core_router(store: Arc<Store>, web_root: Option<PathBuf>, mounts: &[(String, Router)], host_mounts: &[(String, Router)]) -> Router {
    let mut r = Router::new()
        .route("/a/{hash}", get(asset))
        .route("/api/publish", post(publish).layer(axum::extract::DefaultBodyLimit::disable()))
        .route("/shared", get(shared_list))
        .with_state(store);
    for (path, service) in mounts {
        r = r.nest_service(path, service.clone());
    }
    for (path, service) in host_mounts {
        r = r.nest_service(path, service.clone().layer(middleware::from_fn(host_marked)));
    }
    r = match web_root {
        Some(root) => r.fallback_service(
            ServeDir::new(&root)
                .append_index_html_on_directories(true)
                .fallback(ServeFile::new(root.join("index.html"))),
        ),
        None => r.fallback(|| async { (StatusCode::NOT_FOUND, "No web build: run `npm run build` and pass --web dist") }),
    };
    r.layer(middleware::from_fn(remote_only))
}

/// A service for the host's own browser: only what the gateway marked as the
/// host's (after checking the host's token) is seen as from this machine;
/// anything else is refused.
async fn host_marked(mut req: Request, next: Next) -> Response {
    if req.headers().get(gateway::HOST_MARK).and_then(|v| v.to_str().ok()) != Some("1") {
        return StatusCode::FORBIDDEN.into_response();
    }
    req.extensions_mut().insert(ConnectInfo(SocketAddr::from(([127, 0, 0, 1], 0))));
    next.run(req).await
}

/// Every request the core serves is a stranger's, whatever it says.
async fn remote_only(mut req: Request, next: Next) -> Response {
    req.extensions_mut().insert(ConnectInfo(SocketAddr::from(([192, 0, 2, 1], 0))));
    req.headers_mut().remove("x-heat3d-key");
    next.run(req).await
}

/// A published file by its hash (the gateway checked the member's token).
async fn asset(State(store): State<Arc<Store>>, Path(hash): Path<String>, req: Request) -> Response {
    if !gateway::hex64(&hash) {
        return StatusCode::NOT_FOUND.into_response();
    }
    let Some(a) = store.assets.read().unwrap().get(&hash).cloned() else {
        return StatusCode::NOT_FOUND.into_response();
    };
    let mut res = match ServeFile::new(&a.path).oneshot(req).await {
        Ok(r) => r.map(Body::new),
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    let h = res.headers_mut();
    h.insert(header::CONTENT_TYPE, HeaderValue::from_static("application/octet-stream"));
    h.insert(header::CACHE_CONTROL, HeaderValue::from_static("private, max-age=31536000, immutable"));
    if let Ok(v) = HeaderValue::from_str(&format!(
        "attachment; filename=\"{}\"",
        a.name.replace(|c: char| !c.is_ascii_alphanumeric() && c != '.' && c != '-' && c != '_', "_")
    )) {
        h.insert(header::CONTENT_DISPOSITION, v);
    }
    let _ = a.size;
    res
}

#[derive(serde::Deserialize)]
struct PublishQuery {
    name: Option<String>,
}

/// The host publishes a file (the gateway checked the host's token): kept by its hash, never by a name.
async fn publish(State(store): State<Arc<Store>>, Query(q): Query<PublishQuery>, body: Body) -> Response {
    let Ok(_permit) = store.uploading.try_acquire() else {
        return StatusCode::TOO_MANY_REQUESTS.into_response();
    };
    let dir = store.state_dir.join("assets");
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
        let all = store.uploaded.fetch_add(chunk.len() as u64, std::sync::atomic::Ordering::Relaxed) + chunk.len() as u64;
        if size > store.max_upload || all > UPLOADS_TOTAL || f.write_all(&chunk).await.is_err() {
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
    store.assets.write().unwrap().insert(hash.clone(), Asset { path, size, name });
    ([(header::CONTENT_TYPE, "application/json")], serde_json::json!({ "hash": hash, "size": size }).to_string()).into_response()
}

/// Where the host's browser lists, shares and stops sharing catalogue items.
pub const SHARE_ROUTE: &str = "/__heat3d/share";

/// The shared items as members see them: names, kinds, sizes, the manifest's hash; never a path.
async fn shared_list(State(store): State<Arc<Store>>) -> Response {
    let items = store.shared.read().unwrap().clone();
    json(serde_json::json!({ "items": items }))
}

#[derive(Clone)]
struct ShareState {
    store: Arc<Store>,
    audit: Arc<AuditLog>,
    cfg: Option<ShareConfig>,
}

fn share_router(store: Arc<Store>, audit: Arc<AuditLog>, cfg: Option<ShareConfig>) -> Router {
    Router::new()
        .route("/", get(share_index).post(share_item))
        .route("/stop", post(share_stop))
        .with_state(ShareState { store, audit, cfg })
}

fn json(v: serde_json::Value) -> Response {
    ([(header::CONTENT_TYPE, "application/json"), (header::CACHE_CONTROL, "no-store")], v.to_string()).into_response()
}

/// The catalogue's items the host could share (blocked ones only counted), and what is shared.
async fn share_index(State(st): State<ShareState>) -> Response {
    let shared = st.store.shared.read().unwrap().clone();
    let Some(cfg) = st.cfg.clone() else {
        return json(serde_json::json!({ "available": false, "items": [], "blocked": 0, "shared": shared }));
    };
    let (items, blocked) = tokio::task::spawn_blocking(move || share::list(&cfg.blocklist, &cfg.root)).await.unwrap_or_default();
    json(serde_json::json!({ "available": true, "items": items, "blocked": blocked, "shared": shared }))
}

#[derive(serde::Deserialize)]
struct ShareReq {
    path: String,
    /// The host confirms holding the rights to share it.
    #[serde(default)]
    rights: bool,
    /// The host allows this pack made from a game's models to be shared, warned.
    #[serde(default)]
    allow_extracted: bool,
    /// The host confirms sharing this item marked confidential, warned (only with people entitled to see it).
    #[serde(default)]
    confidential_ok: bool,
}

fn refuse(code: StatusCode, why: &str) -> Response {
    let mut r = json(serde_json::json!({ "error": why }));
    *r.status_mut() = code;
    r
}

/// Shares one item: checked against the block list, its files hashed and put on offer, its manifest made.
async fn share_item(State(st): State<ShareState>, body: axum::body::Bytes) -> Response {
    let Ok(req) = serde_json::from_slice::<ShareReq>(&body) else {
        return refuse(StatusCode::BAD_REQUEST, "shape");
    };
    let Some(cfg) = st.cfg.clone() else {
        return refuse(StatusCode::NOT_FOUND, "no-catalogue");
    };
    if !req.rights {
        return refuse(StatusCode::FORBIDDEN, "rights");
    }
    let (verdict, what) = share::verdict(&cfg.blocklist, &cfg.root, &req.path);
    let refused = |why: &str| {
        st.audit.write(&serde_json::json!({ "t": now_ms(), "event": "share_refused", "reason": why }).to_string());
        refuse(StatusCode::FORBIDDEN, why)
    };
    let Some((kind, game, name)) = what else {
        return refused("blocked");
    };
    match verdict {
        share::Verdict::Blocked(why) => return refused(why),
        share::Verdict::Confidential(_) if !req.confidential_ok => return refused("confidential"),
        _ => {}
    }
    if kind.extracted() && !req.allow_extracted {
        return refused("extracted");
    }
    let (bl, root, rel) = (cfg.blocklist.clone(), cfg.root.clone(), req.path.clone());
    let confidential_ok = req.confidential_ok;
    let marked = matches!(verdict, share::Verdict::Confidential(_));
    let hashed = tokio::task::spawn_blocking(move || -> Result<(Vec<(String, PathBuf, String, u64)>, bool), String> {
        let (files, conf) = share::files_of(&bl, &root, &rel, kind).map_err(|e| e.to_string())?;
        // One confidential file (in a pack's folder) makes the item confidential.
        if conf.is_some() && !confidential_ok {
            return Err("confidential".into());
        }
        let mut out = Vec::with_capacity(files.len());
        let mut total = 0u64;
        for (path, disk) in files {
            let (hash, size) = share::hash_file(&disk).map_err(|_| "unreadable".to_string())?;
            total += size;
            if total > share::MAX_BYTES {
                return Err("too-large".into());
            }
            out.push((path, disk, hash, size));
        }
        Ok((out, conf.is_some()))
    })
    .await
    .unwrap_or_else(|_| Err("failed".into()));
    let (files, confidential) = match hashed {
        Ok((f, c)) => (f, c || marked),
        Err(why) => return refused(&why),
    };
    let manifest = share::Manifest {
        format: "3dheat-share".into(),
        version: 1,
        kind,
        game: crate::text::clean(&game, 80, false),
        name: crate::text::clean(&name, 200, false),
        files: files.iter().map(|(p, _, h, s)| share::ManifestFile { path: p.clone(), hash: h.clone(), size: *s }).collect(),
    };
    let bytes = serde_json::to_vec(&manifest).unwrap_or_default();
    let mhash = hex::encode(Sha256::digest(&bytes));
    let dir = st.store.state_dir.join("assets");
    let mpath = dir.join(&mhash);
    if tokio::fs::create_dir_all(&dir).await.is_err() || tokio::fs::write(&mpath, &bytes).await.is_err() {
        return refuse(StatusCode::INTERNAL_SERVER_ERROR, "state");
    }
    let size: u64 = files.iter().map(|f| f.3).sum();
    let item = Shared {
        id: mhash[..16].to_string(),
        kind,
        game: manifest.game.clone(),
        name: manifest.name.clone(),
        size,
        files: files.len(),
        manifest: mhash.clone(),
        confidential,
        hashes: files.iter().map(|f| f.2.clone()).chain([mhash.clone()]).collect(),
    };
    {
        let mut assets = st.store.assets.write().unwrap();
        assets.insert(mhash.clone(), Asset { path: mpath, size: bytes.len() as u64, name: "manifest.json".into() });
        for (p, disk, hash, size) in &files {
            let leaf = p.rsplit('/').next().unwrap_or(p).to_string();
            assets.insert(hash.clone(), Asset { path: disk.clone(), size: *size, name: leaf });
        }
    }
    {
        let mut shared = st.store.shared.write().unwrap();
        shared.retain(|s| s.id != item.id);
        shared.push(item.clone());
    }
    // The host's confirmation, with the time: what was shared, never where it is.
    st.audit.write(
        &serde_json::json!({ "t": now_ms(), "event": "shared", "id": item.id, "kind": kind, "name": item.name, "files": item.files, "bytes": size, "rights_confirmed": true, "extracted_allowed": req.allow_extracted && kind.extracted(), "confidential_confirmed": confidential })
            .to_string(),
    );
    json(serde_json::json!({ "item": item }))
}

#[derive(serde::Deserialize)]
struct StopReq {
    id: String,
}

/// Stops sharing an item: its files are no longer on offer (unless another shared item has them too).
async fn share_stop(State(st): State<ShareState>, body: axum::body::Bytes) -> Response {
    let Ok(req) = serde_json::from_slice::<StopReq>(&body) else {
        return StatusCode::BAD_REQUEST.into_response();
    };
    let gone = {
        let mut shared = st.store.shared.write().unwrap();
        let Some(i) = shared.iter().position(|s| s.id == req.id) else {
            return StatusCode::NOT_FOUND.into_response();
        };
        shared.remove(i)
    };
    let keep: std::collections::HashSet<String> = st.store.shared.read().unwrap().iter().flat_map(|s| s.hashes.clone()).collect();
    {
        let mut assets = st.store.assets.write().unwrap();
        for h in &gone.hashes {
            if !keep.contains(h) {
                assets.remove(h);
            }
        }
    }
    st.audit.write(&serde_json::json!({ "t": now_ms(), "event": "unshared", "id": gone.id }).to_string());
    StatusCode::NO_CONTENT.into_response()
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

/// A gateway in this process over a core serving `web_root` (plain HTTP, no
/// request budget, `publish` published by hash), for tests and the fuzzer;
/// inside a Tokio runtime.
pub fn test_gateway(web_root: PathBuf, state_dir: PathBuf, host_token: String, publish: Vec<(String, PathBuf)>) -> Result<Arc<Gateway>, String> {
    let store = Arc::new(Store {
        assets: RwLock::new(
            publish
                .into_iter()
                .map(|(hash, path)| (hash, Asset { path, size: 0, name: "data".into() }))
                .collect(),
        ),
        state_dir,
        max_upload: 1 << 20,
        uploading: tokio::sync::Semaphore::new(2),
        uploaded: std::sync::atomic::AtomicU64::new(0),
        shared: RwLock::new(Vec::new()),
    });
    let core = core_router(store, Some(web_root), &[], &[]);
    let mut session = Config::default();
    session.cost = auth::Cost::TEST;
    let gcfg = GatewayConfig {
        expose: false,
        allow_origins: vec![],
        session,
        password_phc: None,
        host_token,
        dataset: None,
        tls_cert_pem: None,
        tls_key_pem: None,
        hsts: false,
        mounts: vec![],
        host_mounts: vec![],
        limits: NetLimits { requests_burst: 1e12, requests_per_sec: 1e12, ..NetLimits::default() },
        proxies: TrustedProxies::default(),
    };
    Gateway::new(gcfg, HostLink::Local { router: core, audit: Arc::new(|_| {}) })
}

/// The gateway's process: `3dheat gateway`, started by the core only.
pub async fn gateway_main() -> i32 {
    let r = gateway::run_child(tokio::io::stdin(), tokio::io::stdout(), heat3d_sandbox::lockdown).await;
    match r {
        Ok(()) => 0,
        Err(e) => {
            eprintln!("{e}");
            1
        }
    }
}
