//! Making a session public: reachable from the internet through the host's
//! own domain (a reverse proxy the host runs), a Cloudflare Tunnel
//! (`cloudflared`, user level: no admin, no service), or a port forward on
//! the host's router (expert). The host's own browser asks for it
//! (`/__heat3d/public`, forwarded with the host's token only).
//!
//! What it needs comes from the host's **local configuration**
//! (`local.json` in the server's state folder, or `--local-config`), which
//! never belongs in a repository:
//!
//! ```json
//! {
//!   "trustedProxies": ["192.168.1.20"],
//!   "ownDomain": {
//!     "url": "https://sessions.example.org:8443",
//!     "upstream": "192.168.1.10",
//!     "start": ["ssh", "-o", "BatchMode=yes", "me@proxy-box", "~/heat3d-proxy/ctl.sh start {upstream}"],
//!     "stop": ["ssh", "-o", "BatchMode=yes", "me@proxy-box", "~/heat3d-proxy/ctl.sh stop"],
//!     "checkVia": "192.168.1.20:8443"
//!   },
//!   "cloudflared": { "path": "C:/tools/cloudflared.exe", "tunnel": "my-tunnel", "hostname": "sessions.example.org" },
//!   "portForward": { "url": "https://sessions.example.org:7878" },
//!   "share": { "catalog": "D:/levels", "blocked": ["D:/levels/secret"], "blockedWords": ["codename"] }
//! }
//! ```
//!
//! - `ownDomain.start` / `stop`: commands that start and stop the proxy
//!   (`{upstream}` becomes this machine's address and the server's port; the
//!   server's certificate is written to the start command's input, so the
//!   proxy can check it is talking to this server).
//! - `cloudflared`: without `tunnel`, a quick tunnel (a random
//!   `trycloudflare.com` address, no account); with `tunnel` and `hostname`,
//!   that named tunnel. While it runs the server believes `CF-Connecting-IP`
//!   from loopback (`heat3d_session::proxy`).
//!
//! After starting, a **self-test** fetches `/session.json` through the public
//! address (and through the proxy on the local network where `checkVia`
//! names it), so the host knows before sending the link. Stopping (or ending
//! the server) stops the proxy or the tunnel.

use axum::body::Bytes;
use axum::extract::State;
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::Router;
use heat3d_session::proxy::{Net, TrustedProxies};
use heat3d_session::server::Control;
use serde::{Deserialize, Serialize};
use std::net::{IpAddr, SocketAddr};
use std::path::{Path, PathBuf};
use std::sync::{Arc, OnceLock};
use std::time::Duration;
use tokio::io::AsyncWriteExt;
use tokio::sync::Mutex;

/// The host's local configuration (see the module doc).
#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalConfig {
    #[serde(default)]
    pub trusted_proxies: Vec<Net>,
    pub own_domain: Option<OwnDomain>,
    pub cloudflared: Option<Cloudflared>,
    pub port_forward: Option<PortForward>,
    pub share: Option<ShareLocal>,
    /// `true`: the headless server updates itself (as `serve --auto-update`); else it only says so.
    pub auto_update: Option<bool>,
    /// `false`: no update check at all (as `serve --no-update-check`).
    pub update_check: Option<bool>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OwnDomain {
    pub url: String,
    /// This machine's address the proxy forwards to (the server's port is added); default: its first LAN address.
    pub upstream: Option<IpAddr>,
    pub start: Vec<String>,
    pub stop: Vec<String>,
    /// The proxy's own address on the local network, for a self-test through it.
    pub check_via: Option<SocketAddr>,
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Cloudflared {
    pub path: Option<PathBuf>,
    pub tunnel: Option<String>,
    pub hostname: Option<String>,
}

#[derive(Clone, Debug, Default, Deserialize)]
pub struct PortForward {
    pub url: Option<String>,
}

#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShareLocal {
    pub catalog: Option<PathBuf>,
    #[serde(default)]
    pub blocked: Vec<String>,
    #[serde(default)]
    pub blocked_words: Vec<String>,
}

impl LocalConfig {
    /// `file`, or `local.json` in `state_dir`; empty when there is none. A broken file is an error.
    pub fn load(file: Option<&Path>, state_dir: &Path) -> Result<Self, String> {
        let p = file
            .map(Path::to_path_buf)
            .unwrap_or_else(|| state_dir.join("local.json"));
        match std::fs::read_to_string(&p) {
            Ok(text) => serde_json::from_str(&text).map_err(|e| format!("{}: {e}", p.display())),
            Err(_) if file.is_none() => Ok(Self::default()),
            Err(e) => Err(format!("{}: {e}", p.display())),
        }
    }
}

/// The ways to make a session public.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Mode {
    OwnDomain,
    Cloudflare,
    PortForward,
}

/// One self-test: what was tried, whether it worked, in a few words.
#[derive(Clone, Debug, Serialize)]
pub struct Check {
    pub what: &'static str,
    pub ok: bool,
    pub detail: String,
}

#[derive(Default)]
struct Now {
    mode: Option<Mode>,
    /// `off`, `starting`, `on`, `failed`.
    phase: &'static str,
    url: Option<String>,
    checks: Vec<Check>,
    error: Option<String>,
    tunnel: Option<tokio::process::Child>,
}

/// What the server tells the controller about itself.
pub struct ServerFacts {
    pub port: u16,
    pub bind: IpAddr,
    pub tls: bool,
    pub expose: bool,
    /// The server's certificate (PEM file), for the proxy to check.
    pub cert_file: Option<PathBuf>,
    pub base: TrustedProxies,
}

pub struct Public {
    cfg: LocalConfig,
    facts: ServerFacts,
    control: OnceLock<Arc<Control>>,
    now: Mutex<Now>,
}

/// Where the host's browser asks to go public and to stop.
pub const PUBLIC_ROUTE: &str = "/__heat3d/public";

impl Public {
    pub fn new(cfg: LocalConfig, facts: ServerFacts) -> Arc<Self> {
        Arc::new(Self {
            cfg,
            facts,
            control: OnceLock::new(),
            now: Mutex::new(Now {
                phase: "off",
                ..Default::default()
            }),
        })
    }

    /// The running server's control (whom it believes about addresses), once it runs.
    pub fn attach(&self, control: Arc<Control>) {
        let _ = self.control.set(control);
    }

    pub fn router(self: &Arc<Self>) -> Router {
        Router::new()
            .route("/", get(status))
            .route("/start", post(start))
            .route("/stop", post(stop))
            .with_state(self.clone())
    }

    fn cloudflared_path(&self) -> Option<PathBuf> {
        if let Some(p) = self.cfg.cloudflared.as_ref().and_then(|c| c.path.clone()) {
            return p.is_file().then_some(p);
        }
        let exe = if cfg!(windows) {
            "cloudflared.exe"
        } else {
            "cloudflared"
        };
        let mut dirs: Vec<PathBuf> = std::env::var_os("PATH")
            .map(|p| std::env::split_paths(&p).collect())
            .unwrap_or_default();
        if let Some(d) = std::env::current_exe()
            .ok()
            .and_then(|e| e.parent().map(Path::to_path_buf))
        {
            dirs.push(d);
        }
        dirs.into_iter().map(|d| d.join(exe)).find(|p| p.is_file())
    }

    fn upstream(&self) -> Result<String, String> {
        let ip = match self.cfg.own_domain.as_ref().and_then(|o| o.upstream) {
            Some(ip) => ip,
            None if !self.facts.bind.is_unspecified() => self.facts.bind,
            None => heat3d_session::tls::local_ips()
                .into_iter()
                .find(|a| a.is_ipv4() && !a.is_loopback() && heat3d_session::lan::is_local(*a))
                .ok_or("no local network address for the proxy to reach")?,
        };
        if self.facts.bind.is_loopback() && !ip.is_loopback() {
            return Err("the server listens on this machine only: start it on the local network (--bind 0.0.0.0) for the proxy to reach it".into());
        }
        Ok(SocketAddr::new(ip, self.facts.port).to_string())
    }

    async fn status_json(&self) -> serde_json::Value {
        let now = self.now.lock().await;
        serde_json::json!({
            "phase": now.phase,
            "mode": now.mode,
            "url": now.url,
            "checks": now.checks,
            "error": now.error,
            "modes": {
                "own-domain": { "available": self.cfg.own_domain.is_some(), "url": self.cfg.own_domain.as_ref().map(|o| o.url.clone()), "showsAddress": true },
                "cloudflare": { "available": self.cloudflared_path().is_some(), "named": self.cfg.cloudflared.as_ref().and_then(|c| c.tunnel.as_ref()).is_some(), "showsAddress": false },
                "port-forward": { "available": self.facts.expose, "url": self.cfg.port_forward.as_ref().and_then(|p| p.url.clone()), "port": self.facts.port, "showsAddress": true },
            },
        })
    }

    async fn go(self: &Arc<Self>, mode: Mode) -> Result<(String, Vec<Check>), String> {
        match mode {
            Mode::OwnDomain => {
                let od = self
                    .cfg
                    .own_domain
                    .clone()
                    .ok_or("no own domain in the local configuration")?;
                if !self.facts.tls {
                    return Err("the proxy needs the server on TLS (drop --plain-http)".into());
                }
                let up = self.upstream()?;
                let stdin = self
                    .facts
                    .cert_file
                    .as_ref()
                    .and_then(|f| std::fs::read(f).ok())
                    .ok_or("the server's certificate is missing")?;
                run(&od.start, &up, Some(&stdin), Duration::from_secs(90))
                    .await
                    .map_err(|e| format!("starting the proxy: {e}"))?;
                let url = od.url.trim_end_matches('/').to_string();
                let mut checks = Vec::new();
                if let Some(via) = od.check_via {
                    checks.push(self_test("proxy", &url, Some(via), 15).await);
                }
                checks.push(
                    self_test("public", &url, None, if checks.is_empty() { 15 } else { 4 }).await,
                );
                Ok((url, checks))
            }
            Mode::Cloudflare => {
                let exe = self
                    .cloudflared_path()
                    .ok_or("cloudflared not found (put it on the PATH or next to 3dheat)")?;
                let scheme = if self.facts.tls { "https" } else { "http" };
                let origin = format!("{scheme}://127.0.0.1:{}", self.facts.port);
                let named = self.cfg.cloudflared.clone().unwrap_or_default();
                let mut cmd = tokio::process::Command::new(&exe);
                cmd.arg("tunnel").arg("--no-autoupdate");
                if self.facts.tls {
                    // The last hop is this machine's loopback, to its self-signed certificate.
                    cmd.arg("--no-tls-verify");
                }
                match &named.tunnel {
                    Some(t) => {
                        cmd.args(["run", "--url", &origin, t]);
                    }
                    None => {
                        cmd.args(["--url", &origin]);
                    }
                }
                cmd.stdin(std::process::Stdio::null())
                    .stdout(std::process::Stdio::piped())
                    .stderr(std::process::Stdio::piped())
                    .kill_on_drop(true);
                let mut child = cmd.spawn().map_err(|e| format!("cloudflared: {e}"))?;
                let url = match (&named.tunnel, &named.hostname) {
                    (Some(_), Some(h)) => format!("https://{}", h.trim_end_matches('/')),
                    (Some(_), None) => {
                        return Err(
                            "a named tunnel needs its hostname in the local configuration".into(),
                        )
                    }
                    (None, _) => wait_quick_url(&mut child).await?,
                };
                // From now on loopback's CF-Connecting-IP names the visitor.
                if let Some(c) = self.control.get() {
                    c.set_proxies(TrustedProxies {
                        cloudflared: true,
                        ..self.facts.base.clone()
                    });
                }
                self.now.lock().await.tunnel = Some(child);
                let checks = vec![self_test("public", &url, None, 40).await];
                Ok((url, checks))
            }
            Mode::PortForward => {
                if !self.facts.expose {
                    return Err("start the server with --expose-internet (and forward the port on your router) for this".into());
                }
                let url = self
                    .cfg
                    .port_forward
                    .as_ref()
                    .and_then(|p| p.url.clone())
                    .unwrap_or_default();
                let checks = if url.is_empty() {
                    vec![]
                } else {
                    vec![self_test("public", url.trim_end_matches('/'), None, 6).await]
                };
                Ok((url.trim_end_matches('/').to_string(), checks))
            }
        }
    }

    /// Stops whatever is public; quiet when nothing is.
    pub async fn shut(&self) {
        let (mode, tunnel) = {
            let mut now = self.now.lock().await;
            let m = now.mode.take();
            now.phase = "off";
            now.url = None;
            now.checks.clear();
            now.error = None;
            (m, now.tunnel.take())
        };
        if let Some(mut t) = tunnel {
            let _ = t.kill().await;
        }
        if let Some(c) = self.control.get() {
            c.set_proxies(self.facts.base.clone());
        }
        if mode == Some(Mode::OwnDomain) {
            if let Some(od) = &self.cfg.own_domain {
                if let Err(e) = run(&od.stop, "", None, Duration::from_secs(60)).await {
                    eprintln!("3dheat: stopping the proxy: {e}");
                }
            }
        }
    }
}

/// Runs a configured command (`{upstream}` filled in), its input `stdin`; the error in a line.
async fn run(
    argv: &[String],
    upstream: &str,
    stdin: Option<&[u8]>,
    limit: Duration,
) -> Result<(), String> {
    let Some((exe, args)) = argv.split_first() else {
        return Err("no command configured".into());
    };
    let args: Vec<String> = args
        .iter()
        .map(|a| a.replace("{upstream}", upstream))
        .collect();
    let mut cmd = tokio::process::Command::new(exe);
    cmd.args(&args)
        .stdin(if stdin.is_some() {
            std::process::Stdio::piped()
        } else {
            std::process::Stdio::null()
        })
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .kill_on_drop(true);
    cmd.stdout(std::process::Stdio::null());
    let mut child = cmd.spawn().map_err(|e| format!("{exe}: {e}"))?;
    if let (Some(data), Some(mut w)) = (stdin, child.stdin.take()) {
        let _ = w.write_all(data).await;
        drop(w);
    }
    // Its error stream, read alongside (a process it leaves running may hold the pipe open: not waited for).
    let mut err_pipe = child.stderr.take();
    let reader = tokio::spawn(async move {
        use tokio::io::AsyncReadExt;
        let mut buf = Vec::new();
        if let Some(e) = err_pipe.as_mut() {
            let _ = e.take(64 * 1024).read_to_end(&mut buf).await;
        }
        buf
    });
    let status = tokio::time::timeout(limit, child.wait())
        .await
        .map_err(|_| "timed out".to_string())?
        .map_err(|e| e.to_string())?;
    if status.success() {
        reader.abort();
        return Ok(());
    }
    let err = tokio::time::timeout(Duration::from_secs(2), reader)
        .await
        .ok()
        .and_then(|r| r.ok())
        .unwrap_or_default();
    let err = String::from_utf8_lossy(&err);
    Err(err
        .lines()
        .rev()
        .find(|l| !l.trim().is_empty())
        .unwrap_or("failed")
        .chars()
        .take(200)
        .collect())
}

/// The quick tunnel's address from cloudflared's log lines.
pub fn quick_url(line: &str) -> Option<String> {
    let i = line.find("https://")?;
    let url: String = line[i..]
        .chars()
        .take_while(|c| c.is_ascii_alphanumeric() || matches!(c, ':' | '/' | '.' | '-'))
        .collect();
    let host = url.strip_prefix("https://")?;
    (host.ends_with(".trycloudflare.com")
        && host.len() > ".trycloudflare.com".len()
        && !host.starts_with("api."))
    .then_some(url)
}

async fn wait_quick_url(child: &mut tokio::process::Child) -> Result<String, String> {
    use tokio::io::AsyncBufReadExt;
    let (Some(err), Some(out)) = (child.stderr.take(), child.stdout.take()) else {
        return Err("cloudflared: no output".into());
    };
    let (tx, mut rx) = tokio::sync::mpsc::channel::<String>(1);
    for stream in [
        Box::new(err) as Box<dyn tokio::io::AsyncRead + Unpin + Send>,
        Box::new(out),
    ] {
        let tx = tx.clone();
        tokio::spawn(async move {
            let mut lines = tokio::io::BufReader::new(stream).lines();
            let mut sent = false;
            // Read on to the end, so cloudflared never blocks on a full pipe.
            while let Ok(Some(l)) = lines.next_line().await {
                if !sent {
                    if let Some(u) = quick_url(&l) {
                        let _ = tx.send(u).await;
                        sent = true;
                    }
                }
            }
        });
    }
    drop(tx);
    match tokio::time::timeout(Duration::from_secs(40), rx.recv()).await {
        Ok(Some(u)) => Ok(u),
        _ => Err("cloudflared gave no address (is the internet reachable?)".into()),
    }
}

/// Fetches `<url>/session.json` (through `via` when given) until it answers as a 3DHeat server or `secs` pass.
async fn self_test(what: &'static str, url: &str, via: Option<SocketAddr>, secs: u64) -> Check {
    let end = tokio::time::Instant::now() + Duration::from_secs(secs);
    loop {
        let last = match fetch_info(url, via).await {
            Ok(()) => {
                return Check {
                    what,
                    ok: true,
                    detail: String::new(),
                }
            }
            Err(e) => e,
        };
        if tokio::time::Instant::now() + Duration::from_secs(2) > end {
            return Check {
                what,
                ok: false,
                detail: last,
            };
        }
        tokio::time::sleep(Duration::from_secs(2)).await;
    }
}

/// One fetch with the system's `curl` (Windows 10 and later, macOS and Linux have it): the certificate is checked.
async fn fetch_info(url: &str, via: Option<SocketAddr>) -> Result<(), String> {
    let mut cmd = tokio::process::Command::new("curl");
    cmd.args(["-sS", "--max-time", "8", "-H", "Accept: application/json"]);
    if let Some(v) = via {
        let host = url.strip_prefix("https://").unwrap_or(url);
        let host = host.split('/').next().unwrap_or(host);
        let (name, port) = match host.rsplit_once(':') {
            Some((n, p)) => (n.to_string(), p.to_string()),
            None => (host.to_string(), "443".into()),
        };
        cmd.arg("--resolve")
            .arg(format!("{name}:{port}:{}", v.ip()));
    }
    cmd.arg(format!("{url}/session.json"))
        .stdin(std::process::Stdio::null())
        .kill_on_drop(true);
    let out = tokio::time::timeout(Duration::from_secs(10), cmd.output())
        .await
        .map_err(|_| "timed out".to_string())?
        .map_err(|e| format!("curl: {e}"))?;
    if !out.status.success() {
        let err = String::from_utf8_lossy(&out.stderr);
        return Err(err.trim().chars().take(160).collect());
    }
    let v: serde_json::Value =
        serde_json::from_slice(&out.stdout).map_err(|_| "not a 3DHeat server".to_string())?;
    if v["app"] == "3dheat" {
        Ok(())
    } else {
        Err("not a 3DHeat server".into())
    }
}

fn json(v: serde_json::Value) -> Response {
    (
        [
            (header::CONTENT_TYPE, "application/json"),
            (header::CACHE_CONTROL, "no-store"),
        ],
        v.to_string(),
    )
        .into_response()
}

async fn status(State(p): State<Arc<Public>>) -> Response {
    json(p.status_json().await)
}

#[derive(Deserialize)]
struct StartReq {
    mode: Mode,
}

async fn start(State(p): State<Arc<Public>>, body: Bytes) -> Response {
    let Ok(req) = serde_json::from_slice::<StartReq>(&body) else {
        return StatusCode::BAD_REQUEST.into_response();
    };
    {
        let mut now = p.now.lock().await;
        if now.phase == "starting" {
            return StatusCode::CONFLICT.into_response();
        }
        now.phase = "starting";
        now.error = None;
        now.checks.clear();
    }
    // Started in the background: the host's browser asks for the status until it is on or failed.
    let task = p.clone();
    tokio::spawn(async move { task.begin(req.mode).await });
    json(p.status_json().await)
}

impl Public {
    async fn begin(self: Arc<Self>, mode: Mode) {
        let p = self;
        // Whatever was public before ends first (one way at a time).
        let prev = p.now.lock().await.mode;
        if prev.is_some() {
            p.shut().await;
            p.now.lock().await.phase = "starting";
        }
        let r = p.go(mode).await;
        {
            let mut now = p.now.lock().await;
            now.mode = Some(mode);
            match r {
                Ok((url, checks)) => {
                    now.phase = "on";
                    now.url = Some(url).filter(|u| !u.is_empty());
                    now.checks = checks;
                    now.error = None;
                }
                Err(e) => {
                    now.phase = "failed";
                    now.error = Some(e);
                }
            }
        }
        // A start that failed leaves nothing running.
        if p.now.lock().await.phase == "failed" {
            let err = p.now.lock().await.error.clone();
            p.shut().await;
            let mut now = p.now.lock().await;
            now.phase = "failed";
            now.error = err;
        }
    }
}

async fn stop(State(p): State<Arc<Public>>) -> Response {
    p.shut().await;
    json(p.status_json().await)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_quick_tunnels_address_from_its_log() {
        let l = "2026-11-21T19:00:00Z INF |  https://brave-lion-sun-moon.trycloudflare.com                                 |";
        assert_eq!(
            quick_url(l).as_deref(),
            Some("https://brave-lion-sun-moon.trycloudflare.com")
        );
        assert_eq!(
            quick_url("INF Requesting new quick Tunnel on trycloudflare.com..."),
            None
        );
        assert_eq!(quick_url("see https://developers.cloudflare.com/x"), None);
        assert_eq!(quick_url("https://api.trycloudflare.com/tunnel"), None);
        assert_eq!(quick_url("https://.trycloudflare.com"), None);
    }

    #[test]
    fn the_local_configuration_reads_and_refuses_what_is_broken() {
        let dir =
            std::env::temp_dir().join(format!("heat3d-local-{}", heat3d_session::auth::token()));
        std::fs::create_dir_all(&dir).unwrap();
        assert!(LocalConfig::load(None, &dir).unwrap().own_domain.is_none());
        std::fs::write(
            dir.join("local.json"),
            r#"{ "trustedProxies": ["192.168.1.20"], "ownDomain": { "url": "https://x.example:8443", "start": ["a"], "stop": ["b"], "checkVia": "192.168.1.20:8443" } }"#,
        )
        .unwrap();
        let c = LocalConfig::load(None, &dir).unwrap();
        assert_eq!(c.trusted_proxies.len(), 1);
        assert_eq!(c.own_domain.unwrap().check_via.unwrap().port(), 8443);
        std::fs::write(
            dir.join("local.json"),
            r#"{ "trustedProxies": ["not an address"] }"#,
        )
        .unwrap();
        assert!(LocalConfig::load(None, &dir).is_err());
        assert!(LocalConfig::load(Some(&dir.join("none.json")), &dir).is_err());
        let _ = std::fs::remove_dir_all(&dir);
    }
}
