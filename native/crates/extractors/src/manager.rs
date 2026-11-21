//! The extractors on this machine: what is installed (from the folders, and
//! nothing else is kept), what GitHub has, and the work of installing,
//! updating, removing, checking and starting them.
//!
//! On disk (`<data>` = `%LOCALAPPDATA%\3DHeat`, Linux `${XDG_DATA_HOME:-~/.local/share}/3dheat`):
//! `<data>/extractors/<id>/<version>/<id>/<id>[.exe]`, `<data>/extractors/<id>/current`
//! naming the version in use. An install unpacks beside it and switches
//! `current` only once the new version is complete; older versions are then
//! deleted. The extractors write their levels into `<data>/levels`.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::{Arc, Mutex, OnceLock};
use std::time::{Duration, Instant};

use reqwest::Url;
use serde::Serialize;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::index::{platform, Entry, Index};
use crate::unpack::{self, Kind};
use crate::{verify, version};

const API: &str = "https://api.github.com";
/// Where release downloads are served from (and redirected to).
const HOSTS: &[&str] = &["api.github.com", "github.com", "objects.githubusercontent.com", "release-assets.githubusercontent.com"];
const MAX_ARCHIVE: u64 = 4 << 30;
const MAX_SUMS: u64 = 1 << 20;
const MAX_API: usize = 4 << 20;
const MAX_CHECK_OUT: usize = 256 << 10;

/// Windows: no console window for the child, and its own process group (it outlives the app).
#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;
#[cfg(windows)]
const CREATE_NEW_PROCESS_GROUP: u32 = 0x0000_0200;

/// Where and how the manager works.
#[derive(Clone, Debug)]
pub struct Config {
    /// `<data>`: the extractors go into `<data>/extractors`.
    pub data: PathBuf,
    /// The levels folder the extractors write into (`HEAT3D_LEVELS` for them).
    pub levels: PathBuf,
    pub index: Index,
    /// The GitHub API's base; anything other than GitHub only in tests, and only on this machine.
    pub api: String,
    /// The platform to install for (`windows-x64`, `linux-x64`).
    pub platform: String,
    /// How long a release lookup is kept.
    pub cache_for: Duration,
    /// How long `--check --json` may take.
    pub check_timeout: Duration,
}

/// `<data>` of this user: `%LOCALAPPDATA%\3DHeat`, or `${XDG_DATA_HOME:-~/.local/share}/3dheat`.
pub fn default_data_dir() -> Option<PathBuf> {
    if cfg!(windows) {
        std::env::var_os("LOCALAPPDATA").filter(|v| !v.is_empty()).map(|d| PathBuf::from(d).join("3DHeat"))
    } else {
        let xdg = std::env::var_os("XDG_DATA_HOME").filter(|v| !v.is_empty()).map(PathBuf::from);
        xdg.or_else(|| std::env::var_os("HOME").filter(|v| !v.is_empty()).map(|h| PathBuf::from(h).join(".local").join("share")))
            .map(|d| d.join("3dheat"))
    }
}

/// Whether a URL names this machine (the only place a test may point the manager at).
pub fn loopback(url: &str) -> bool {
    Url::parse(url).is_ok_and(|u| {
        u.scheme() == "http" && matches!(u.host_str(), Some("127.0.0.1") | Some("[::1]") | Some("localhost")) && u.username().is_empty()
    })
}

impl Config {
    /// The user's own folders, the shipped index, GitHub. In debug builds only (tests, the
    /// panel's smoke test), `HEAT3D_EXTRACTORS_TEST_INDEX` (a file), `HEAT3D_EXTRACTORS_TEST_GITHUB`
    /// (a loopback URL) and `HEAT3D_EXTRACTORS_TEST_DATA` (a folder) stand in for them; a release
    /// build reads none of them.
    pub fn from_env() -> Option<Config> {
        let mut cfg = Config {
            data: default_data_dir()?,
            levels: PathBuf::new(),
            index: Index::shipped(),
            api: API.into(),
            platform: platform()?.into(),
            cache_for: Duration::from_secs(3 * 3600),
            check_timeout: Duration::from_secs(60),
        };
        #[cfg(debug_assertions)]
        {
            if let Some(p) = std::env::var_os("HEAT3D_EXTRACTORS_TEST_INDEX") {
                cfg.index = Index::parse(&std::fs::read_to_string(p).ok()?).ok()?;
            }
            if let Ok(u) = std::env::var("HEAT3D_EXTRACTORS_TEST_GITHUB") {
                cfg.api = loopback(&u).then(|| u.trim_end_matches('/').to_string())?;
            }
            if let Some(d) = std::env::var_os("HEAT3D_EXTRACTORS_TEST_DATA") {
                cfg.data = PathBuf::from(d);
            }
        }
        cfg.levels = std::env::var_os("HEAT3D_LEVELS").filter(|v| !v.is_empty()).map(PathBuf::from).unwrap_or_else(|| cfg.data.join("levels"));
        Some(cfg)
    }

    fn testing(&self) -> bool {
        self.api != API
    }

    /// Whether the manager may ask this URL: GitHub over HTTPS, or the test server it was pointed at.
    fn allowed(&self, url: &Url) -> bool {
        if self.testing() {
            let base = Url::parse(&self.api).ok();
            return loopback(url.as_str()) && base.is_some_and(|b| b.host() == url.host() && b.port() == url.port());
        }
        url.scheme() == "https" && url.port().is_none() && url.host_str().is_some_and(|h| HOSTS.contains(&h)) && url.username().is_empty()
    }
}

/// A release asset.
#[derive(Clone, Debug, Serialize)]
pub struct Asset {
    pub name: String,
    pub url: String,
    pub size: u64,
    /// GitHub's `sha256:<hex>`, where it reports one.
    pub digest: Option<String>,
}

/// The latest published release of an extractor, for this platform.
#[derive(Clone, Debug, Serialize)]
pub struct Release {
    pub version: String,
    pub archive: Asset,
    pub sums: Asset,
}

/// An install or update under way, or how the last one failed.
#[derive(Clone, Debug, Serialize)]
pub struct Job {
    pub version: String,
    /// `lookup`, `download`, `verify`, `unpack`, `check`, `failed`.
    pub phase: &'static str,
    pub done: u64,
    pub total: u64,
    pub error: Option<String>,
}

/// One line of an extractor's `--check --json`.
#[derive(Clone, Debug, Serialize, PartialEq)]
pub struct CheckLine {
    pub id: String,
    pub label: String,
    pub ok: bool,
    pub detail: String,
}

/// What `--check --json` said, or why it said nothing.
#[derive(Clone, Debug, Serialize, PartialEq)]
pub struct Check {
    pub version: Option<String>,
    pub levels: Option<String>,
    pub checks: Vec<CheckLine>,
    pub error: Option<String>,
}

#[derive(Default)]
struct Inner {
    latest: HashMap<String, (Instant, Result<Release, String>)>,
    jobs: HashMap<String, Job>,
    running: HashMap<String, std::process::Child>,
    checks: HashMap<String, Check>,
}

/// The manager. One per process (`shared`): two would race over the same folders.
pub struct Manager {
    cfg: Config,
    http: reqwest::Client,
    inner: Mutex<Inner>,
}

fn clip(s: &str, n: usize) -> String {
    s.chars().filter(|c| !c.is_control() || *c == '\n').take(n).collect()
}

/// Reads an extractor's `--check --json` answer.
pub fn parse_check(stdout: &[u8]) -> Check {
    let fail = |e: &str| Check { version: None, levels: None, checks: vec![], error: Some(e.into()) };
    let text = String::from_utf8_lossy(stdout);
    // One object; tolerate a line of noise before it.
    let Some(v) = text.find('{').and_then(|at| serde_json::from_str::<Value>(text[at..].trim()).ok()) else {
        return fail("the extractor's check said nothing readable");
    };
    let s = |v: &Value, k: &str, n: usize| v.get(k).and_then(Value::as_str).map(|x| clip(x, n));
    let Some(lines) = v.get("checks").and_then(Value::as_array) else { return fail("the extractor's check listed no checks") };
    let checks = lines
        .iter()
        .take(64)
        .filter_map(|c| {
            Some(CheckLine {
                id: s(c, "id", 64)?,
                label: s(c, "label", 200).unwrap_or_default(),
                ok: c.get("ok")?.as_bool()?,
                detail: s(c, "detail", 600).unwrap_or_default(),
            })
        })
        .collect();
    Check { version: s(&v, "version", 64), levels: s(&v, "levels", 1024), checks, error: None }
}

impl Manager {
    pub fn new(cfg: Config) -> Result<Manager, String> {
        // HTTPS by ring (as the session server), with the system's certificates.
        let _ = rustls::crypto::ring::default_provider().install_default();
        let policy_cfg = cfg.clone();
        let http = reqwest::Client::builder()
            .user_agent(concat!("3DHeat-extractors/", env!("CARGO_PKG_VERSION")))
            .https_only(!cfg.testing())
            .connect_timeout(Duration::from_secs(20))
            .read_timeout(Duration::from_secs(60))
            .redirect(reqwest::redirect::Policy::custom(move |a| {
                if a.previous().len() >= 5 {
                    a.error("too many redirects")
                } else if policy_cfg.allowed(a.url()) {
                    a.follow()
                } else {
                    a.error("a redirect away from GitHub")
                }
            }))
            .build()
            .map_err(|e| format!("no HTTPS client: {e}"))?;
        Ok(Manager { cfg, http, inner: Mutex::new(Inner::default()) })
    }

    /// This process's manager, made on first use; `None` where it cannot work (no data folder, no build for this platform).
    pub fn shared() -> Option<Arc<Manager>> {
        static M: OnceLock<Option<Arc<Manager>>> = OnceLock::new();
        M.get_or_init(|| Config::from_env().and_then(|c| Manager::new(c).ok()).map(Arc::new)).clone()
    }

    pub fn config(&self) -> &Config {
        &self.cfg
    }

    fn root(&self, id: &str) -> PathBuf {
        self.cfg.data.join("extractors").join(id)
    }

    fn entry(&self, id: &str) -> Result<&Entry, String> {
        self.cfg.index.get(id).filter(|e| e.supports(&self.cfg.platform)).ok_or_else(|| format!("no extractor {id} for this system"))
    }

    fn exe(&self, e: &Entry, version: &str) -> PathBuf {
        let mut p = self.root(&e.id).join(version);
        p.extend(e.exe_path(&self.cfg.platform).unwrap_or_default().split('/'));
        p
    }

    /// The installed version, read from the folder: `current`, when it names a complete install.
    pub fn installed(&self, id: &str) -> Option<String> {
        let e = self.entry(id).ok()?;
        let v = std::fs::read_to_string(self.root(id).join("current")).ok()?;
        let v = version::from_tag(v.trim())?;
        self.exe(e, &v).is_file().then_some(v)
    }

    fn running(&self, id: &str) -> bool {
        let mut inner = self.inner.lock().unwrap();
        match inner.running.get_mut(id).map(|c| c.try_wait()) {
            Some(Ok(None)) => true,
            Some(_) => {
                inner.running.remove(id);
                false
            }
            None => false,
        }
    }

    fn busy(&self, id: &str) -> bool {
        self.inner.lock().unwrap().jobs.get(id).is_some_and(|j| j.phase != "failed")
    }

    // ------------------------------------------------------------- GitHub

    async fn get(&self, url: &str, limit: u64) -> Result<reqwest::Response, String> {
        let u = Url::parse(url).map_err(|_| "a bad address".to_string())?;
        if !self.cfg.allowed(&u) {
            return Err(format!("not a GitHub address: {}", u.host_str().unwrap_or("")));
        }
        let r = self
            .http
            .get(u)
            .header("Accept", "application/vnd.github+json, application/octet-stream")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .send()
            .await
            .map_err(|e| format!("GitHub could not be reached ({})", e.without_url()))?;
        match r.status().as_u16() {
            200 => {}
            404 => return Err("no release published yet".into()),
            403 | 429 => return Err("GitHub's limit of requests is reached; try again in an hour".into()),
            s => return Err(format!("GitHub answered {s}")),
        }
        if r.content_length().is_some_and(|n| n > limit) {
            return Err("the download is larger than expected".into());
        }
        Ok(r)
    }

    async fn body(&self, url: &str, limit: u64) -> Result<Vec<u8>, String> {
        let mut r = self.get(url, limit).await?;
        let mut out = Vec::new();
        while let Some(c) = r.chunk().await.map_err(|e| format!("the download broke off ({})", e.without_url()))? {
            out.extend_from_slice(&c);
            if out.len() as u64 > limit {
                return Err("the download is larger than expected".into());
            }
        }
        Ok(out)
    }

    async fn fetch_latest(&self, e: &Entry) -> Result<Release, String> {
        let url = format!("{}/repos/{}/releases/latest", self.cfg.api, e.repo);
        let body = self.body(&url, MAX_API as u64).await?;
        let v: Value = serde_json::from_slice(&body).map_err(|_| "GitHub's answer was not readable".to_string())?;
        if v.get("draft").and_then(Value::as_bool) == Some(true) {
            return Err("no release published yet".into());
        }
        let tag = v.get("tag_name").and_then(Value::as_str).unwrap_or("");
        let version = version::from_tag(tag).ok_or_else(|| format!("the latest release has no plain version ({})", clip(tag, 40)))?;
        let find = |name: &str| -> Option<Asset> {
            v.get("assets")?.as_array()?.iter().find(|a| a.get("name").and_then(Value::as_str) == Some(name)).and_then(|a| {
                Some(Asset {
                    name: name.to_string(),
                    url: a.get("browser_download_url")?.as_str()?.to_string(),
                    size: a.get("size").and_then(Value::as_u64).unwrap_or(0),
                    digest: a.get("digest").and_then(Value::as_str).map(String::from),
                })
            })
        };
        let name = e.asset(&self.cfg.platform, &version).ok_or("no build for this system")?;
        let archive = find(&name).ok_or_else(|| format!("version {version} has no build for this system yet"))?;
        let sums = find(&e.sums).ok_or_else(|| format!("version {version} has no checksums"))?;
        Ok(Release { version, archive, sums })
    }

    /// The latest release, from the cache while it is fresh (an error for ten minutes).
    pub async fn latest(&self, id: &str, fresh: bool) -> Result<Release, String> {
        let e = self.entry(id)?.clone();
        if !fresh {
            if let Some((at, r)) = self.inner.lock().unwrap().latest.get(id) {
                let keep = if r.is_ok() { self.cfg.cache_for } else { Duration::from_secs(600).min(self.cfg.cache_for) };
                if at.elapsed() < keep {
                    return r.clone();
                }
            }
        }
        let r = self.fetch_latest(&e).await;
        self.inner.lock().unwrap().latest.insert(id.to_string(), (Instant::now(), r.clone()));
        r
    }

    /// Looks up every extractor's latest release (cached ones are kept unless `fresh`).
    pub async fn refresh(self: &Arc<Self>, fresh: bool) {
        let mut set = tokio::task::JoinSet::new();
        for e in self.cfg.index.entries.iter().filter(|e| e.supports(&self.cfg.platform)) {
            let (m, id) = (self.clone(), e.id.clone());
            set.spawn(async move { m.latest(&id, fresh).await.ok() });
        }
        while set.join_next().await.is_some() {}
    }

    // ------------------------------------------------------------- install

    fn set_job(&self, id: &str, version: &str, phase: &'static str, done: u64, total: u64) {
        let j = Job { version: version.into(), phase, done, total, error: None };
        self.inner.lock().unwrap().jobs.insert(id.into(), j);
    }

    /// Starts installing (or updating to) the latest release in the background.
    pub fn install(self: &Arc<Self>, id: &str) -> Result<(), String> {
        self.entry(id)?;
        if self.running(id) {
            return Err("close the extractor first".into());
        }
        {
            let mut inner = self.inner.lock().unwrap();
            if inner.jobs.get(id).is_some_and(|j| j.phase != "failed") {
                return Err("already being installed".into());
            }
            inner.jobs.insert(id.into(), Job { version: String::new(), phase: "lookup", done: 0, total: 0, error: None });
        }
        let (m, id) = (self.clone(), id.to_string());
        tokio::spawn(async move { m.install_now(&id).await });
        Ok(())
    }

    /// Installs the latest release now: download, verify, unpack beside the old one, switch, clean up, check.
    /// A failure stays in the state (`job.phase` `failed`) until the next install or remove.
    pub async fn install_now(&self, id: &str) -> Result<(), String> {
        let r = self.install_steps(id).await;
        let mut inner = self.inner.lock().unwrap();
        match &r {
            Ok(()) => {
                inner.jobs.remove(id);
            }
            Err(err) => {
                let j = inner.jobs.entry(id.into()).or_insert(Job { version: String::new(), phase: "failed", done: 0, total: 0, error: None });
                j.phase = "failed";
                j.error = Some(err.clone());
            }
        }
        r
    }

    async fn install_steps(&self, id: &str) -> Result<(), String> {
        let e = self.entry(id)?.clone();
        let rel = self.latest(id, false).await?;
        if self.installed(id).as_deref() == Some(rel.version.as_str()) {
            return Ok(());
        }
        let v = rel.version.clone();
        let root = self.root(id);
        std::fs::create_dir_all(&root).map_err(|err| format!("cannot write {}: {err}", root.display()))?;
        self.set_job(id, &v, "download", 0, rel.archive.size);
        let sums = String::from_utf8(self.body(&rel.sums.url, MAX_SUMS).await?).map_err(|_| "the checksums are not text".to_string())?;
        verify::sum_for(&sums, &rel.archive.name).ok_or_else(|| format!("{} is not in the release's checksums", rel.archive.name))?;
        let part = root.join(format!(".download-{v}"));
        let got = self.download(id, &rel, &part).await;
        let hash = match got {
            Ok(h) => h,
            Err(err) => {
                let _ = std::fs::remove_file(&part);
                return Err(err);
            }
        };
        self.set_job(id, &v, "verify", rel.archive.size, rel.archive.size);
        if let Err(err) = verify::verify(&hash, &rel.archive.name, &sums, rel.archive.digest.as_deref()) {
            let _ = std::fs::remove_file(&part);
            return Err(err);
        }
        self.set_job(id, &v, "unpack", 0, 0);
        let kind = Kind::of(&rel.archive.name).ok_or("an archive of an unknown kind")?;
        let staging = root.join(format!(".unpack-{v}"));
        let _ = std::fs::remove_dir_all(&staging);
        let (p, s, top) = (part.clone(), staging.clone(), e.id.clone());
        let unpacked = tokio::task::spawn_blocking(move || unpack::unpack(&p, kind, &s, &top)).await.map_err(|_| "unpacking failed".to_string())?;
        let _ = std::fs::remove_file(&part);
        if let Err(err) = unpacked {
            let _ = std::fs::remove_dir_all(&staging);
            return Err(format!("the archive was refused: {err}"));
        }
        let mut exe = staging.clone();
        exe.extend(e.exe_path(&self.cfg.platform).unwrap_or_default().split('/'));
        if !exe.is_file() {
            let _ = std::fs::remove_dir_all(&staging);
            return Err("the archive holds no program where the index says".into());
        }
        let dest = root.join(&v);
        let _ = std::fs::remove_dir_all(&dest);
        std::fs::rename(&staging, &dest).map_err(|err| format!("cannot put the new version in place: {err}"))?;
        let tmp = root.join(".current");
        std::fs::write(&tmp, &v).and_then(|_| std::fs::rename(&tmp, root.join("current"))).map_err(|err| format!("cannot switch versions: {err}"))?;
        self.clean(id);
        self.set_job(id, &v, "check", 0, 0);
        let c = self.check(id).await;
        self.inner.lock().unwrap().checks.insert(id.into(), c);
        Ok(())
    }

    /// Everything in the extractor's folder but `current` and the version it names (older versions, leftovers).
    fn clean(&self, id: &str) {
        let keep = self.installed(id);
        let Ok(dir) = std::fs::read_dir(self.root(id)) else { return };
        for d in dir.flatten() {
            let n = d.file_name().to_string_lossy().to_string();
            if n == "current" || Some(&n) == keep.as_ref() {
                continue;
            }
            // A file in use (Windows) stays until the next clean-up.
            let _ = if d.path().is_dir() { std::fs::remove_dir_all(d.path()) } else { std::fs::remove_file(d.path()) };
        }
    }

    async fn download(&self, id: &str, rel: &Release, to: &Path) -> Result<String, String> {
        use tokio::io::AsyncWriteExt;
        let limit = if rel.archive.size > 0 { rel.archive.size } else { MAX_ARCHIVE }.min(MAX_ARCHIVE);
        let mut r = self.get(&rel.archive.url, limit).await?;
        let total = r.content_length().unwrap_or(rel.archive.size);
        let mut f = tokio::fs::File::create(to).await.map_err(|err| format!("cannot write the download: {err}"))?;
        let mut h = Sha256::new();
        let mut done = 0u64;
        while let Some(c) = r.chunk().await.map_err(|e| format!("the download broke off ({})", e.without_url()))? {
            done += c.len() as u64;
            if done > limit {
                return Err("the download is larger than expected".into());
            }
            h.update(&c);
            f.write_all(&c).await.map_err(|err| format!("cannot write the download: {err}"))?;
            self.set_job(id, &rel.version, "download", done, total);
        }
        f.flush().await.map_err(|err| format!("cannot write the download: {err}"))?;
        Ok(verify::hex(&h.finalize()))
    }

    /// Starts updating every installed extractor that has a newer release; the ids started.
    pub async fn update_all(self: &Arc<Self>) -> Vec<String> {
        self.refresh(false).await;
        let mut started = vec![];
        for e in &self.cfg.index.entries {
            let Some(have) = self.installed(&e.id) else { continue };
            let newer = self.latest(&e.id, false).await.is_ok_and(|r| version::compare(&r.version, &have).is_gt());
            if newer && self.install(&e.id).is_ok() {
                started.push(e.id.clone());
            }
        }
        started
    }

    /// Deletes the extractor's folder.
    pub fn remove(&self, id: &str) -> Result<(), String> {
        self.entry(id)?;
        if self.running(id) {
            return Err("close the extractor first".into());
        }
        if self.busy(id) {
            return Err("it is being installed".into());
        }
        let root = self.root(id);
        if root.exists() {
            std::fs::remove_dir_all(&root).map_err(|err| format!("cannot delete {}: {err}", root.display()))?;
        }
        let mut inner = self.inner.lock().unwrap();
        inner.checks.remove(id);
        inner.jobs.remove(id);
        Ok(())
    }

    // ------------------------------------------------------------- run and check

    fn command(&self, id: &str) -> Result<(PathBuf, std::process::Command), String> {
        let e = self.entry(id)?;
        let v = self.installed(id).ok_or("not installed")?;
        let exe = self.exe(e, &v);
        let _ = std::fs::create_dir_all(&self.cfg.levels);
        let mut c = std::process::Command::new(&exe);
        c.current_dir(exe.parent().unwrap_or(Path::new(".")))
            .env("HEAT3D_MANAGED", "1")
            .env("HEAT3D_LEVELS", &self.cfg.levels)
            .stdin(Stdio::null());
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            c.creation_flags(CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP);
        }
        Ok((exe, c))
    }

    /// Opens the extractor's own window, as a program of its own.
    pub fn run(&self, id: &str) -> Result<(), String> {
        if self.running(id) {
            return Err("already open".into());
        }
        let (_, mut c) = self.command(id)?;
        let child = c.stdout(Stdio::null()).stderr(Stdio::null()).spawn().map_err(|err| format!("could not start it: {err}"))?;
        self.inner.lock().unwrap().running.insert(id.into(), child);
        Ok(())
    }

    /// Asks the extractor what it needs (`--check --json`): the game found, files from the user's install, room.
    pub async fn check(&self, id: &str) -> Check {
        let fail = |e: String| Check { version: None, levels: None, checks: vec![], error: Some(e) };
        let (_, c) = match self.command(id) {
            Ok(c) => c,
            Err(err) => return fail(err),
        };
        let mut c = tokio::process::Command::from(c);
        c.args(["--check", "--json"]).env("HEAT3D_NO_UPDATE", "1").stdout(Stdio::piped()).stderr(Stdio::null()).kill_on_drop(true);
        let out = match tokio::time::timeout(self.cfg.check_timeout, c.output()).await {
            Err(_) => return fail("the check took too long".into()),
            Ok(Err(err)) => return fail(format!("could not start it: {err}")),
            Ok(Ok(o)) => o,
        };
        let mut c = parse_check(&out.stdout[..out.stdout.len().min(MAX_CHECK_OUT)]);
        if c.error.is_some() && !out.status.success() {
            c.error = Some(format!("the check ended with {}", out.status));
        }
        c
    }

    /// Runs the check and keeps its answer for the panel.
    pub async fn check_and_keep(&self, id: &str) -> Check {
        let c = self.check(id).await;
        self.inner.lock().unwrap().checks.insert(id.into(), c.clone());
        c
    }

    // ------------------------------------------------------------- the panel's view

    /// Free space where the extractors and levels go.
    pub fn free_space(&self) -> Option<u64> {
        let mut p = self.cfg.data.as_path();
        while !p.exists() {
            p = p.parent()?;
        }
        fs4::available_space(p).ok()
    }

    /// Everything the panel shows, as JSON.
    pub fn state(&self) -> Value {
        let list: Vec<Value> = self
            .cfg
            .index
            .entries
            .iter()
            .map(|e| {
                let supported = e.supports(&self.cfg.platform);
                let installed = if supported { self.installed(&e.id) } else { None };
                let running = self.running(&e.id);
                let inner = self.inner.lock().unwrap();
                let latest = inner.latest.get(&e.id).map(|(_, r)| r.clone());
                json!({
                    "id": e.id, "name": e.name, "games": e.games, "what": e.what, "repo": e.repo,
                    "supported": supported,
                    "installed": installed,
                    "latest": latest.as_ref().and_then(|r| r.as_ref().ok()).map(|r| r.version.clone()),
                    "latestSize": latest.as_ref().and_then(|r| r.as_ref().ok()).map(|r| r.archive.size),
                    "latestError": latest.as_ref().and_then(|r| r.as_ref().err()).cloned(),
                    "running": running,
                    "job": inner.jobs.get(&e.id),
                    "check": inner.checks.get(&e.id),
                })
            })
            .collect();
        json!({
            "format": "3dheat-extractors-state",
            "platform": self.cfg.platform,
            "data": self.cfg.data.join("extractors"),
            "levels": self.cfg.levels,
            "free": self.free_space(),
            "extractors": list,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn checks_are_read() {
        let out = br#"Starting...
{"id":"heat3d-x","version":"1.0.0","levels":"L","checks":[{"id":"game","label":"Game found","ok":true,"detail":"in X"},
 {"id":"oodle","label":"Oodle","ok":false},{"label":"no id","ok":true}]}"#;
        let c = parse_check(out);
        assert_eq!(c.error, None);
        assert_eq!(c.version.as_deref(), Some("1.0.0"));
        assert_eq!(c.checks.len(), 2);
        assert!(c.checks[0].ok && !c.checks[1].ok);
        assert!(parse_check(b"Traceback").error.is_some());
        assert!(parse_check(b"{\"id\":\"x\"}").error.is_some());
    }

    #[test]
    fn only_github_or_the_test_server_is_asked() {
        let mut cfg = Config {
            data: PathBuf::from("d"),
            levels: PathBuf::from("l"),
            index: Index::shipped(),
            api: API.into(),
            platform: "windows-x64".into(),
            cache_for: Duration::from_secs(1),
            check_timeout: Duration::from_secs(1),
        };
        let ok = |c: &Config, u: &str| c.allowed(&Url::parse(u).unwrap());
        assert!(ok(&cfg, "https://api.github.com/repos/a/b/releases/latest"));
        assert!(ok(&cfg, "https://github.com/a/b/releases/download/v1/x.zip"));
        assert!(ok(&cfg, "https://objects.githubusercontent.com/x"));
        assert!(!ok(&cfg, "http://github.com/a"));
        assert!(!ok(&cfg, "https://github.com:8443/a"));
        assert!(!ok(&cfg, "https://evil.example/x"));
        assert!(!ok(&cfg, "https://github.com.evil.example/x"));
        assert!(!ok(&cfg, "https://user@github.com/x"));
        assert!(!ok(&cfg, "http://127.0.0.1:1234/x"));
        cfg.api = "http://127.0.0.1:1234".into();
        assert!(ok(&cfg, "http://127.0.0.1:1234/dl/x.zip"));
        assert!(!ok(&cfg, "http://127.0.0.1:9999/dl/x.zip"));
        assert!(!ok(&cfg, "https://github.com/a"), "a test manager asks its test server only");
        assert!(loopback("http://127.0.0.1:1"));
        assert!(!loopback("http://10.0.0.1:1") && !loopback("https://127.0.0.1:1") && !loopback("http://127.0.0.1.evil.example/"));
    }
}
