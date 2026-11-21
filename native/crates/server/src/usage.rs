//! `/__heat3d/usage`: the viewer's local usage statistics (docs/usage-statistics.md)
//! for the native servers, by the same rules as the dev server's route
//! (vite.config.ts) and the schema the page keeps (src/usage/schema.ts).
//!
//! Not mounted yet. `3dheat serve` serves every request through the sandboxed
//! gateway, which hands the core each request as a stranger's (192.0.2.1), so
//! the loopback check below would refuse the host too; mounting it there needs
//! the gateway to say a request is the host's own. Until then a browser of
//! `3dheat serve` gets no JSON from this path and keeps its statistics in the
//! browser alone.
//!
//! Off unless switched on: a usage folder given, `HEAT3D_USAGE=1` (with
//! `HEAT3D_USAGE_DIR`), or `"usageStats": true` in the `tools/local-data.json`
//! of the checkout the web build is in (`<web>/../tools/local-data.json`, with
//! its `usageDir`). Off, every request answers 204 and nothing is written.
//! On, only the host's own browser (a loopback address, the server's own
//! origin) is answered: a session member's statistics are not the host's to keep.
//!
//! - `GET`: 200 `{"enabled":true}`.
//! - `POST`: `{ "v": 1, "events": [...] }` as JSON, at most 512 KB and 2,000
//!   events, every event passing the schema field by field, or the batch is
//!   refused whole (400). Appended to `usage-YYYY-MM-DD.jsonl` (UTC date).
//! - `DELETE` with `X-Heat3d-Usage: 1`: removes the usage files.

use std::collections::HashSet;
use std::fs::OpenOptions;
use std::io::Write;
use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use axum::body::Bytes;
use axum::extract::{ConnectInfo, DefaultBodyLimit, State};
use axum::http::{header, HeaderMap, Method, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::any;
use axum::Router;
use serde_json::{Map, Value};

const MAX_BYTES: usize = 512 * 1024;
const MAX_EVENTS: usize = 2000;
const MAX_FILE: u64 = 64 * 1024 * 1024;

const KINDS: &[&str] = &[
    "session", "end", "time", "pick", "load", "use", "open", "close", "set", "search", "help", "friction", "error", "fps", "degrade", "seen",
    "feedback",
];
const SOURCES: &[&str] = &["palette", "key", "button", "quick", "context", "auto", "f1", "hover", "drop"];
const WORKSPACES: &[&str] = &["heat", "race", "match", "plan", "vehicle"];
const LOAD_METHODS: &[&str] = &["files", "folder", "drop", "session", "catalogue", "generator", "native", "other"];
const FRICTION: &[&str] = &["undo", "quick-close", "rage", "repeat-search", "dead", "lost", "toggle"];
const FEEDBACK: &[&str] = &["unclear", "broken", "wish"];
const PREFIXES: &[&str] = &["ctl", "sec", "cmd", "task", "ws", "more", "panel", "mode", "cam", "scr", "data", "err", "tool", "area"];
const FIELDS: &[&str] = &["t", "k", "s", "id", "src", "ws", "mode", "n", "ms", "sc", "v", "q", "note", "dev"];
const FILE_EXT: &[&str] = &[
    "parquet", "csv", "tsv", "txt", "json", "jsonl", "acmi", "zip", "wrpl", "dem", "rec", "replay", "wowsreplay", "wotreplay", "glb", "gltf", "obj",
    "bin", "pb", "gz", "zst", "arrow", "heat3d", "png", "jpg", "jpeg", "webp", "mp4", "log", "xml", "yml", "yaml", "pak", "vpk", "bsp", "map", "exe",
    "dll",
];

#[derive(Clone)]
pub struct UsageConfig {
    pub dir: PathBuf,
    /// The English message keys, when the checkout's are there: `ctl:` and `sec:` ids must be one.
    pub keys: Option<Arc<HashSet<String>>>,
}

impl UsageConfig {
    /// On or off from the flag, the environment and the checkout around `web` (see the module doc).
    pub fn find(flag: Option<PathBuf>, web: Option<&Path>) -> Option<UsageConfig> {
        let checkout = web.and_then(|w| w.canonicalize().ok()).and_then(|w| w.parent().map(Path::to_path_buf));
        let env = std::env::var("HEAT3D_USAGE").ok();
        let env_dir = std::env::var_os("HEAT3D_USAGE_DIR").map(PathBuf::from);
        let dir = if let Some(d) = flag {
            Some(d)
        } else if env.as_deref() == Some("0") {
            None
        } else if env.as_deref() == Some("1") {
            Some(env_dir.clone().unwrap_or_else(|| PathBuf::from("usage")))
        } else {
            let local = checkout.as_ref().map(|c| c.join("tools").join("local-data.json"));
            let j: Option<Value> = local.and_then(|p| std::fs::read_to_string(p).ok()).and_then(|t| serde_json::from_str(&t).ok());
            match j {
                Some(j) if j.get("usageStats") == Some(&Value::Bool(true)) => Some(
                    env_dir
                        .or_else(|| j.get("usageDir").and_then(Value::as_str).map(PathBuf::from))
                        .unwrap_or_else(|| checkout.clone().unwrap().join("tools").join(".usage")),
                ),
                _ => None,
            }
        }?;
        let keys = checkout.and_then(|c| english_keys(&c.join("src").join("i18n").join("locales").join("en")));
        Some(UsageConfig { dir, keys })
    }
}

fn english_keys(dir: &Path) -> Option<Arc<HashSet<String>>> {
    let mut keys = HashSet::new();
    for e in std::fs::read_dir(dir).ok()?.flatten() {
        if e.path().extension().and_then(|x| x.to_str()) != Some("json") {
            continue;
        }
        if let Some(Value::Object(m)) = std::fs::read_to_string(e.path()).ok().and_then(|t| serde_json::from_str(&t).ok()) {
            keys.extend(m.keys().cloned());
        }
    }
    (!keys.is_empty()).then(|| Arc::new(keys))
}

// ------------------------------------------------------------------ the schema

fn segment_ok(p: &str) -> bool {
    let mut parts = p.split('.');
    let first = parts.next().unwrap_or("");
    let word = |s: &str| !s.is_empty() && s.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'_' || b == b'-');
    first.as_bytes().first().is_some_and(|b| b.is_ascii_lowercase()) && word(first) && parts.all(word)
}

fn file_like(p: &str) -> bool {
    p.rsplit_once('.').is_some_and(|(_, ext)| FILE_EXT.contains(&ext.to_ascii_lowercase().as_str()))
}

/// The id rules of `validId` in src/usage/schema.ts.
pub fn valid_id(id: &str, keys: Option<&HashSet<String>>) -> bool {
    if id.is_empty() || id.chars().count() > 160 {
        return false;
    }
    let Some((prefix, rest)) = id.split_once(':') else { return false };
    if !PREFIXES.contains(&prefix) {
        return false;
    }
    let parts: Vec<&str> = rest.split('/').collect();
    if parts.len() > if prefix == "ctl" { 2 } else { 1 } {
        return false;
    }
    for p in &parts {
        if *p == "_" && prefix == "ctl" && parts.len() == 2 {
            continue;
        }
        let shape = match prefix {
            "scr" => p.split_once('x').is_some_and(|(w, h)| (1..=5).contains(&w.len()) && (1..=5).contains(&h.len()) && w.bytes().chain(h.bytes()).all(|b| b.is_ascii_digit())),
            "data" => p.split('+').all(|t| !t.is_empty() && t.bytes().all(|b| b.is_ascii_lowercase())),
            _ => segment_ok(p),
        };
        if !shape {
            return false;
        }
        let known = keys.is_some_and(|k| k.contains(*p));
        if !known && file_like(p) {
            return false;
        }
        if keys.is_some() && (prefix == "sec" || prefix == "ctl") && !known {
            return false;
        }
    }
    true
}

fn int_in(v: &Value, lo: f64, hi: f64) -> bool {
    v.as_f64().is_some_and(|x| x.fract() == 0.0 && x >= lo && x <= hi)
}

fn text_ok(v: &Value, max: usize, lines: bool) -> bool {
    v.as_str().is_some_and(|s| {
        let n = s.chars().count();
        n > 0 && n <= max && !s.chars().any(|c| (c as u32) < 0x20 && !(lines && c == '\n') || c == '\u{7f}')
    })
}

fn enum_ok(s: &str) -> bool {
    let b = s.as_bytes();
    !b.is_empty()
        && b.len() <= 32
        && (b[0].is_ascii_lowercase() || b[0].is_ascii_digit())
        && b.iter().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || b"_+.-".contains(c))
}

/// The checks of `checkEvent` in src/usage/schema.ts: None when the event is allowed.
pub fn check_event(e: &Value, keys: Option<&HashSet<String>>) -> Option<&'static str> {
    let Value::Object(o) = e else { return Some("not an object") };
    if o.keys().any(|k| !FIELDS.contains(&k.as_str())) {
        return Some("field");
    }
    let get = |k: &str| o.get(k);
    let s = |k: &str| get(k).and_then(Value::as_str);
    if !get("t").is_some_and(|v| int_in(v, 1e12, 1e14)) {
        return Some("t");
    }
    let Some(k) = s("k").filter(|k| KINDS.contains(k)) else { return Some("k") };
    if !s("s").is_some_and(|x| (8..=16).contains(&x.len()) && x.bytes().all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))) {
        return Some("s");
    }
    if get("id").is_some() && !s("id").is_some_and(|x| valid_id(x, keys)) {
        return Some("id");
    }
    if get("src").is_some() && !s("src").is_some_and(|x| SOURCES.contains(&x)) {
        return Some("src");
    }
    if get("ws").is_some() && !s("ws").is_some_and(|x| WORKSPACES.contains(&x)) {
        return Some("ws");
    }
    let mode_ok = |x: &str| {
        let b = x.as_bytes();
        !b.is_empty() && b.len() <= 24 && b[0].is_ascii_lowercase() && b.iter().all(|c| c.is_ascii_lowercase() || *c == b'-')
    };
    if get("mode").is_some() && !s("mode").is_some_and(mode_ok) {
        return Some("mode");
    }
    for (f, hi) in [("n", 1e7), ("ms", 864e5), ("sc", 1e4)] {
        if get(f).is_some_and(|v| !int_in(v, 0.0, hi)) {
            return Some("number");
        }
    }
    if get("v").is_some() && !s("v").is_some_and(enum_ok) {
        return Some("v");
    }
    if let Some(q) = get("q") {
        if !(k == "search" && get("n").and_then(Value::as_f64) == Some(0.0) && text_ok(q, 80, false)) {
            return Some("q");
        }
    }
    if let Some(note) = get("note") {
        if !(k == "feedback" && text_ok(note, 500, true)) {
            return Some("note");
        }
    }
    if get("dev").is_some_and(|d| d.as_f64() != Some(1.0)) {
        return Some("dev");
    }
    let v = s("v").unwrap_or("");
    if k == "friction" && !FRICTION.contains(&v) {
        return Some("friction kind");
    }
    if k == "feedback" && !FEEDBACK.contains(&v) {
        return Some("feedback kind");
    }
    if (k == "pick" || k == "load") && get("v").is_some() && !LOAD_METHODS.contains(&v) {
        return Some("load method");
    }
    None
}

/// The events of a batch, or why it is refused.
pub fn check_batch(body: &[u8], keys: Option<&HashSet<String>>) -> Result<Vec<Map<String, Value>>, String> {
    let v: Value = serde_json::from_slice(body).map_err(|_| "json".to_string())?;
    let Value::Object(b) = v else { return Err("not an object".into()) };
    if b.get("v").and_then(Value::as_f64) != Some(1.0) {
        return Err("version".into());
    }
    if b.keys().any(|k| k != "v" && k != "events") {
        return Err("fields".into());
    }
    let Some(Value::Array(events)) = b.get("events") else { return Err("events".into()) };
    if events.is_empty() || events.len() > MAX_EVENTS {
        return Err("events".into());
    }
    let mut out = Vec::with_capacity(events.len());
    for (i, e) in events.iter().enumerate() {
        if let Some(why) = check_event(e, keys) {
            return Err(format!("event {i}: {why}"));
        }
        if let Value::Object(m) = e {
            out.push(m.clone());
        }
    }
    Ok(out)
}

// ------------------------------------------------------------------ the route

/// Today's date, UTC, as YYYY-MM-DD (civil from days, Howard Hinnant's algorithm).
fn today() -> String {
    let days = (SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0) / 86_400) as i64;
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = yoe + era * 400 + i64::from(m <= 2);
    format!("{y:04}-{m:02}-{d:02}")
}

fn same_origin(headers: &HeaderMap) -> bool {
    let Some(origin) = headers.get(header::ORIGIN).and_then(|v| v.to_str().ok()) else { return true };
    let host = headers.get(header::HOST).and_then(|v| v.to_str().ok()).unwrap_or("");
    origin.split_once("://").map(|(_, h)| h.trim_end_matches('/')) == Some(host)
}

async fn usage(
    State(cfg): State<Option<Arc<UsageConfig>>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    method: Method,
    headers: HeaderMap,
    body: Bytes,
) -> Response {
    let Some(cfg) = cfg else { return StatusCode::NO_CONTENT.into_response() };
    // The host's own browser only.
    if !peer.ip().is_loopback() || !same_origin(&headers) {
        return StatusCode::FORBIDDEN.into_response();
    }
    match method {
        Method::GET => ([(header::CONTENT_TYPE, "application/json"), (header::CACHE_CONTROL, "no-store")], "{\"enabled\":true}").into_response(),
        Method::DELETE => {
            if headers.get("x-heat3d-usage").and_then(|v| v.to_str().ok()) != Some("1") {
                return StatusCode::FORBIDDEN.into_response();
            }
            if let Ok(dir) = std::fs::read_dir(&cfg.dir) {
                for e in dir.flatten() {
                    let n = e.file_name().to_string_lossy().to_string();
                    if n.starts_with("usage-") && n.ends_with(".jsonl") && n.len() == "usage-YYYY-MM-DD.jsonl".len() {
                        let _ = std::fs::remove_file(e.path());
                    }
                }
            }
            StatusCode::NO_CONTENT.into_response()
        }
        Method::POST => {
            let ct = headers.get(header::CONTENT_TYPE).and_then(|v| v.to_str().ok()).unwrap_or("");
            if !(ct.starts_with("application/json") || ct.starts_with("text/plain")) {
                return StatusCode::UNSUPPORTED_MEDIA_TYPE.into_response();
            }
            let events = match check_batch(&body, cfg.keys.as_deref()) {
                Ok(e) => e,
                Err(why) => return (StatusCode::BAD_REQUEST, why).into_response(),
            };
            let file = cfg.dir.join(format!("usage-{}.jsonl", today()));
            if std::fs::metadata(&file).is_ok_and(|m| m.len() > MAX_FILE) {
                return StatusCode::INSUFFICIENT_STORAGE.into_response();
            }
            let mut text = String::new();
            for e in events {
                text.push_str(&serde_json::to_string(&Value::Object(e)).unwrap_or_default());
                text.push('\n');
            }
            let wrote = std::fs::create_dir_all(&cfg.dir)
                .and_then(|_| OpenOptions::new().create(true).append(true).open(&file))
                .and_then(|mut f| f.write_all(text.as_bytes()));
            match wrote {
                Ok(()) => StatusCode::NO_CONTENT.into_response(),
                Err(_) => StatusCode::INTERNAL_SERVER_ERROR.into_response(),
            }
        }
        _ => StatusCode::METHOD_NOT_ALLOWED.into_response(),
    }
}

/// The route, to mount at `/__heat3d/usage`; `None` answers 204 to everything.
pub fn usage_router(cfg: Option<UsageConfig>) -> Router {
    Router::new()
        .route("/", any(usage))
        .layer(DefaultBodyLimit::max(MAX_BYTES))
        .with_state(cfg.map(Arc::new))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ids_carry_no_content() {
        let keys: HashSet<String> = ["heat.datasetPanel.title", "replay.events.csv"].iter().map(|s| s.to_string()).collect();
        assert!(valid_id("cmd:play", None));
        assert!(valid_id("sec:heat.datasetPanel.title", Some(&keys)));
        assert!(valid_id("ctl:heat.datasetPanel.title/replay.events.csv", Some(&keys)));
        assert!(valid_id("scr:1920x1080", None));
        assert!(valid_id("data:csv+parquet", None));
        for bad in ["sec:Some Level", "cmd:PlayerOne", "ctl:a/b/c", "sec:movement.parquet", "cmd:C:/x", "nope:x", "sec:heat.other"] {
            assert!(!valid_id(bad, Some(&keys)), "{bad}");
        }
    }

    #[test]
    fn batches_are_checked_whole() {
        let ok = br#"{"v":1,"events":[{"t":1800000000000,"k":"search","s":"abcdef12","n":0,"q":"ruler"}]}"#;
        assert_eq!(check_batch(ok, None).unwrap().len(), 1);
        let words_elsewhere = br#"{"v":1,"events":[{"t":1800000000000,"k":"use","s":"abcdef12","id":"cmd:play","q":"x"}]}"#;
        assert!(check_batch(words_elsewhere, None).is_err());
        let extra = br#"{"v":1,"events":[{"t":1800000000000,"k":"use","s":"abcdef12","file":"x"}]}"#;
        assert!(check_batch(extra, None).is_err());
        assert!(check_batch(br#"{"v":2,"events":[]}"#, None).is_err());
    }

    #[test]
    fn today_is_a_date() {
        let d = today();
        assert_eq!(d.len(), 10);
        assert!(d.starts_with("20"));
    }
}
