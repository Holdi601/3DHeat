//! New maps: what an installed map extractor finds in the user's install
//! against what it already extracted (`<exe> status --json`), and extracting
//! them (`<exe> extract ... --progress-json`), whose JSON lines the panel
//! follows map by map. The manager keeps the last status of each extractor
//! until a fresh refresh or an extract finishes; nothing of it is stored.

use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::io::{AsyncBufReadExt, BufReader};

use crate::manager::Manager;

const STATES: &[&str] = &["new", "changed", "outdated", "current", "missing"];
const MAX_MAPS: usize = 20_000;
const MAX_STATUS_OUT: usize = 16 << 20;
const MAX_LOG: usize = 500;

#[derive(Clone, Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct MapLine {
    pub id: String,
    pub title: String,
    /// `new`, `changed`, `outdated`, `current`, `missing`.
    pub state: String,
    pub extracted_version: Option<String>,
}

#[derive(Clone, Debug, Default, Serialize, PartialEq)]
pub struct Counts {
    pub new: u64,
    pub changed: u64,
    pub outdated: u64,
    pub current: u64,
    pub missing: u64,
}

#[derive(Clone, Debug, Serialize, PartialEq)]
pub struct Game {
    pub game: String,
    pub label: String,
    pub found: bool,
    pub build: Option<String>,
    pub maps: Vec<MapLine>,
    pub counts: Counts,
}

/// What `status --json` said (or why it said nothing), and when (seconds since 1970).
#[derive(Clone, Debug, Serialize, PartialEq)]
pub struct Status {
    pub version: Option<String>,
    pub levels: Option<String>,
    pub games: Vec<Game>,
    pub error: Option<String>,
    pub at: u64,
}

fn now() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0)
}

fn clip(s: &str, n: usize) -> String {
    s.chars().filter(|c| !c.is_control()).take(n).collect()
}

/// A map or game key as the extractor names it: plain, and never taken for an option.
fn key_ok(s: &str) -> bool {
    !s.is_empty() && s.len() <= 200 && !s.starts_with('-') && !s.chars().any(char::is_control)
}

fn failed(e: &str) -> Status {
    Status { version: None, levels: None, games: vec![], error: Some(e.into()), at: now() }
}

/// Reads an extractor's `status --json` answer.
pub fn parse_status(stdout: &[u8]) -> Status {
    let text = String::from_utf8_lossy(stdout);
    let Some(v) = text.find('{').and_then(|at| serde_json::from_str::<Value>(text[at..].trim()).ok()) else {
        return failed("the extractor's status said nothing readable");
    };
    let s = |v: &Value, k: &str, n: usize| v.get(k).and_then(Value::as_str).map(|x| clip(x, n));
    let Some(games) = v.get("games").and_then(Value::as_array) else { return failed("the extractor's status listed no games") };
    let mut total = 0;
    let games = games
        .iter()
        .take(64)
        .filter_map(|g| {
            let game = s(g, "game", 200).filter(|k| key_ok(k))?;
            let maps: Vec<MapLine> = g
                .get("maps")
                .and_then(Value::as_array)
                .map(|m| m.as_slice())
                .unwrap_or_default()
                .iter()
                .filter_map(|m| {
                    let state = s(m, "state", 16).filter(|x| STATES.contains(&x.as_str()))?;
                    let id = s(m, "id", 200).filter(|k| key_ok(k))?;
                    Some(MapLine { title: s(m, "title", 200).unwrap_or_else(|| id.clone()), id, state, extracted_version: s(m, "extracted_version", 64) })
                })
                .take(MAX_MAPS.saturating_sub(total))
                .collect();
            total += maps.len();
            let mut counts = Counts::default();
            for m in &maps {
                *match m.state.as_str() {
                    "new" => &mut counts.new,
                    "changed" => &mut counts.changed,
                    "outdated" => &mut counts.outdated,
                    "current" => &mut counts.current,
                    _ => &mut counts.missing,
                } += 1;
            }
            // The extractor's own counts where it gives them (a list may be cut short here).
            if let Some(c) = g.get("counts") {
                let n = |k: &str, d: u64| c.get(k).and_then(Value::as_u64).unwrap_or(d);
                counts = Counts {
                    new: n("new", counts.new),
                    changed: n("changed", counts.changed),
                    outdated: n("outdated", counts.outdated),
                    current: n("current", counts.current),
                    missing: n("missing", counts.missing),
                };
            }
            Some(Game {
                label: s(g, "label", 200).unwrap_or_else(|| game.clone()),
                game,
                found: g.get("found").and_then(Value::as_bool).unwrap_or(false),
                build: s(g, "build", 100),
                maps,
                counts,
            })
        })
        .collect();
    Status { version: s(&v, "version", 64), levels: s(&v, "levels", 1024), games, error: None, at: now() }
}

/// Which maps to extract: those of some states, or named ones; of one game, or every game.
#[derive(Clone, Debug, Default, Deserialize)]
#[serde(default)]
pub struct ExtractRequest {
    pub game: Option<String>,
    pub new: bool,
    pub changed: bool,
    pub outdated: bool,
    pub maps: Vec<String>,
}

/// The command line for an extract, every game key and map id one the last status listed.
pub fn extract_args(req: &ExtractRequest, status: &Status) -> Result<Vec<String>, String> {
    let mut args = vec!["extract".to_string()];
    let games: Vec<&Game> = match &req.game {
        Some(g) => vec![status.games.iter().find(|x| &x.game == g).ok_or("no such game in the extractor's status")?],
        None => status.games.iter().collect(),
    };
    if let Some(g) = &req.game {
        args.extend(["--game".to_string(), g.clone()]);
    }
    for (on, flag) in [(req.new, "--new"), (req.changed, "--changed"), (req.outdated, "--outdated")] {
        if on {
            args.push(flag.into());
        }
    }
    for m in &req.maps {
        if !key_ok(m) || !games.iter().any(|g| g.maps.iter().any(|x| &x.id == m)) {
            return Err("a map the extractor's status does not list".into());
        }
        args.push(m.clone());
    }
    if args.len() == 1 + 2 * usize::from(req.game.is_some()) {
        return Err("nothing chosen to extract".into());
    }
    args.push("--progress-json".into());
    Ok(args)
}

/// One map an extract finished.
#[derive(Clone, Debug, Serialize, PartialEq)]
pub struct MapDone {
    pub index: u64,
    pub id: String,
    /// `ok` or `failed`.
    pub state: String,
    pub detail: String,
}

/// An extract under way, or how the last one went.
#[derive(Clone, Debug, Default, Serialize, PartialEq)]
pub struct Extract {
    pub running: bool,
    pub total: u64,
    pub ok: u64,
    pub failed: u64,
    /// The maps finished so far, in order (the last few hundred).
    pub maps: Vec<MapDone>,
    pub error: Option<String>,
    pub finished: bool,
}

impl Extract {
    /// Takes one line of `--progress-json`; anything else is ignored.
    pub fn take(&mut self, line: &str) {
        let Ok(v) = serde_json::from_str::<Value>(line.trim()) else { return };
        let n = |k: &str| v.get(k).and_then(Value::as_u64);
        let s = |k: &str, len: usize| v.get(k).and_then(Value::as_str).map(|x| clip(x, len)).unwrap_or_default();
        match v.get("event").and_then(Value::as_str) {
            Some("start") => self.total = n("total").unwrap_or(0),
            Some("map") => {
                let state = if s("state", 16) == "ok" { "ok" } else { "failed" };
                if state == "ok" {
                    self.ok += 1;
                } else {
                    self.failed += 1;
                }
                self.maps.push(MapDone { index: n("index").unwrap_or(self.ok + self.failed), id: s("id", 200), state: state.into(), detail: s("detail", 600) });
                if self.maps.len() > MAX_LOG {
                    self.maps.remove(0);
                }
            }
            Some("done") => {
                self.finished = true;
                self.ok = n("ok").unwrap_or(self.ok);
                self.failed = n("failed").unwrap_or(self.failed);
            }
            _ => {}
        }
    }
}

impl Manager {
    /// The extractor's map status: the kept one unless `fresh` (or none is kept), else `status --json` now.
    pub async fn map_status(&self, id: &str, fresh: bool) -> Status {
        if !fresh {
            if let Some(s) = self.inner.lock().unwrap().status.get(id) {
                return s.clone();
            }
        }
        let s = self.run_status(id).await;
        self.inner.lock().unwrap().status.insert(id.into(), s.clone());
        s
    }

    async fn run_status(&self, id: &str) -> Status {
        let (_, c) = match self.command(id) {
            Ok(c) => c,
            Err(e) => return failed(&e),
        };
        let mut c = tokio::process::Command::from(c);
        c.args(["status", "--json"]).env("HEAT3D_NO_UPDATE", "1").stdout(std::process::Stdio::piped()).stderr(std::process::Stdio::null()).kill_on_drop(true);
        let out = match tokio::time::timeout(self.cfg.status_timeout, c.output()).await {
            Err(_) => return failed("the map status took too long"),
            Ok(Err(e)) => return failed(&format!("could not start it: {e}")),
            Ok(Ok(o)) => o,
        };
        let mut s = parse_status(&out.stdout[..out.stdout.len().min(MAX_STATUS_OUT)]);
        if s.error.is_some() && !out.status.success() {
            s.error = Some(format!("the map status ended with {}", out.status));
        }
        s
    }

    pub(crate) fn extracting(&self, id: &str) -> bool {
        self.inner.lock().unwrap().extracts.get(id).is_some_and(|x| x.running)
    }

    /// Starts extracting maps in the background; the state follows it map by map.
    pub async fn extract(self: &Arc<Self>, id: &str, req: ExtractRequest) -> Result<(), String> {
        if self.running(id) {
            return Err("close the extractor's window first".into());
        }
        if self.busy(id) || self.extracting(id) {
            return Err("it is busy".into());
        }
        let status = self.map_status(id, false).await;
        let args = extract_args(&req, &status)?;
        let (_, c) = self.command(id)?;
        let mut c = tokio::process::Command::from(c);
        c.args(&args).env("HEAT3D_NO_UPDATE", "1").stdout(std::process::Stdio::piped()).stderr(std::process::Stdio::null()).kill_on_drop(true);
        let mut child = c.spawn().map_err(|e| format!("could not start it: {e}"))?;
        let stdout = child.stdout.take().ok_or("no output from the extractor")?;
        let cancel = Arc::new(tokio::sync::Notify::new());
        {
            let mut inner = self.inner.lock().unwrap();
            if inner.extracts.get(id).is_some_and(|x| x.running) {
                return Err("it is busy".into());
            }
            inner.extracts.insert(id.into(), Extract { running: true, ..Default::default() });
            inner.cancels.insert(id.into(), cancel.clone());
        }
        let (m, id) = (self.clone(), id.to_string());
        tokio::spawn(async move {
            let mut lines = BufReader::new(stdout).lines();
            let mut cancelled = false;
            loop {
                tokio::select! {
                    l = lines.next_line() => match l {
                        Ok(Some(l)) => {
                            if let Some(x) = m.inner.lock().unwrap().extracts.get_mut(&id) {
                                x.take(&l[..l.len().min(64 << 10)]);
                            }
                        }
                        _ => break,
                    },
                    _ = cancel.notified() => {
                        cancelled = true;
                        let _ = child.start_kill();
                        break;
                    }
                }
            }
            let ended = tokio::time::timeout(Duration::from_secs(30), child.wait()).await;
            m.inner.lock().unwrap().cancels.remove(&id);
            // The counts after the extract, taken before it is said to be over: whoever follows the
            // extract (the panel) reads the new counts with its end.
            m.map_status(&id, true).await;
            {
                let mut inner = m.inner.lock().unwrap();
                if let Some(x) = inner.extracts.get_mut(&id) {
                    x.running = false;
                    if cancelled {
                        x.error = Some("stopped".into());
                    } else if !x.finished {
                        x.error = Some(match ended {
                            Ok(Ok(s)) if s.success() => "the extract ended without saying it was done".into(),
                            Ok(Ok(s)) => format!("the extract ended with {s}"),
                            _ => "the extract did not end".into(),
                        });
                    }
                }
            }
        });
        Ok(())
    }

    /// Stops an extract under way (the map in progress is not finished).
    pub fn cancel_extract(&self, id: &str) -> bool {
        self.inner.lock().unwrap().cancels.get(id).map(|c| c.notify_one()).is_some()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const STATUS: &str = r#"{"id":"heat3d-x","version":"1.0.0","levels":"L","games":[{"game":"g","label":"Game","found":true,"build":null,
        "maps":[{"id":"a","title":"A","state":"new","extracted_version":null},{"id":"b","title":"B","state":"current","extracted_version":"1.0.0"},
        {"id":"--all","title":"evil","state":"new"},{"id":"c","state":"bogus"}],"counts":{"new":1,"changed":0,"outdated":0,"current":1,"missing":0}}]}"#;

    #[test]
    fn status_is_read_and_checked() {
        let s = parse_status(STATUS.as_bytes());
        assert_eq!(s.error, None);
        assert_eq!(s.games.len(), 1);
        let g = &s.games[0];
        assert_eq!(g.maps.iter().map(|m| m.id.as_str()).collect::<Vec<_>>(), ["a", "b"], "an option-like id and a bad state are dropped");
        assert_eq!((g.counts.new, g.counts.current), (1, 1));
        assert!(parse_status(b"oops").error.is_some());
        let replay = parse_status(br#"{"games":[{"game":"r","label":"R","found":true,"maps":[]}]}"#);
        assert_eq!(replay.games[0].counts, Counts::default());
    }

    #[test]
    fn extract_args_name_only_listed_maps() {
        let s = parse_status(STATUS.as_bytes());
        let r = |game: Option<&str>, new: bool, maps: &[&str]| ExtractRequest { game: game.map(String::from), new, maps: maps.iter().map(|m| m.to_string()).collect(), ..Default::default() };
        assert_eq!(extract_args(&r(None, true, &[]), &s).unwrap(), ["extract", "--new", "--progress-json"]);
        assert_eq!(extract_args(&r(Some("g"), false, &["a"]), &s).unwrap(), ["extract", "--game", "g", "a", "--progress-json"]);
        assert!(extract_args(&r(None, false, &[]), &s).is_err(), "nothing chosen");
        assert!(extract_args(&r(Some("g"), false, &[]), &s).is_err(), "nothing chosen");
        assert!(extract_args(&r(None, false, &["--all"]), &s).is_err());
        assert!(extract_args(&r(None, false, &["zzz"]), &s).is_err());
        assert!(extract_args(&r(Some("other"), true, &[]), &s).is_err());
    }

    #[test]
    fn progress_lines_are_followed() {
        let mut x = Extract::default();
        for l in [r#"{"event":"start","total":2}"#, "noise", r#"{"event":"map","index":1,"id":"a","state":"ok","detail":""}"#,
            r#"{"event":"map","index":2,"id":"b","state":"failed","detail":"no file"}"#, r#"{"event":"done","ok":1,"failed":1}"#] {
            x.take(l);
        }
        assert_eq!((x.total, x.ok, x.failed, x.finished), (2, 1, 1, true));
        assert_eq!(x.maps[1].detail, "no file");
    }
}
