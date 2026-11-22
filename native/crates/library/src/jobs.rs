//! The conversion queue: jobs kept in the catalogue (so the history survives a
//! restart), run by a few workers as separate processes of the installed
//! converters, at below-normal priority. Pause stops new jobs from starting;
//! cancel ends a running one; a failed job keeps its log and the reason in
//! words, and can be retried.
//!
//! A converter writes into a staging folder of its own job; only when it ends
//! well are its files moved into `converted\<game>\...`, replacing an older
//! output of the same match (the newest converter's output wins), so a half
//! written file never shows up in the library.

use std::collections::{HashSet, VecDeque};
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::{Arc, Condvar, Mutex};
use std::time::{Duration, Instant};

use anyhow::{anyhow, Context, Result};
use rusqlite::{params, OptionalExtension};
use serde_json::{json, Value};

use crate::db::now_ms;
use crate::extractors::{self, Extractor};
use crate::Library;

#[derive(Default)]
pub struct Queue {
    pub paused: AtomicBool,
    cancel: Mutex<HashSet<i64>>,
    wake: Condvar,
    lock: Mutex<()>,
    pub running: AtomicUsize,
    stop: AtomicBool,
}

impl Queue {
    pub fn wake(&self) {
        self.wake.notify_all();
    }

    pub fn cancel(&self, id: i64) {
        self.cancel.lock().unwrap().insert(id);
        self.wake();
    }

    fn cancelled(&self, id: i64) -> bool {
        self.cancel.lock().unwrap().contains(&id)
    }

    pub fn shutdown(&self) {
        self.stop.store(true, Ordering::SeqCst);
        self.wake();
    }
}

/// How many jobs may run at once: the setting, else half the cores, and never
/// more than one per 4 GB of memory (a converter can hold a large replay).
pub fn job_limit(setting: usize) -> usize {
    let cpus = std::thread::available_parallelism().map(|n| n.get()).unwrap_or(4);
    let by_ram = (heat3d_core::memory::total_bytes() / (4 << 30)).max(1) as usize;
    let want = if setting == 0 { (cpus / 2).max(1) } else { setting };
    want.min(by_ram).clamp(1, 16)
}

/// Starts the workers.
pub fn start(lib: &Arc<Library>) {
    // A job that was running when the library stopped runs again.
    if let Ok(c) = lib.writer() {
        let _ = c.execute("UPDATE jobs SET state = 'queued', progress = NULL WHERE state = 'running'", []);
    }
    for _ in 0..16 {
        let lib = lib.clone();
        std::thread::Builder::new().name("heat3d-library-job".into()).spawn(move || worker(&lib)).expect("a job worker thread");
    }
}

fn worker(lib: &Library) {
    let q = &lib.jobs;
    loop {
        if q.stop.load(Ordering::SeqCst) {
            return;
        }
        let limit = job_limit(lib.settings().max_jobs);
        let claimed = if !q.paused.load(Ordering::SeqCst) && q.running.load(Ordering::SeqCst) < limit { claim(lib).ok().flatten() } else { None };
        let Some(job) = claimed else {
            let g = q.lock.lock().unwrap();
            let _ = q.wake.wait_timeout(g, Duration::from_millis(1500));
            continue;
        };
        q.running.fetch_add(1, Ordering::SeqCst);
        let id = job.id;
        let result = run(lib, &job);
        q.running.fetch_sub(1, Ordering::SeqCst);
        let cancelled = q.cancel.lock().unwrap().remove(&id);
        let (state, message, hint) = match (&result, cancelled) {
            (_, true) => ("cancelled", Some("Cancelled".to_owned()), None),
            (Ok(n), _) => ("done", Some(format!("{n} file{} written", if *n == 1 { "" } else { "s" })), None),
            (Err(e), _) => {
                let (m, h) = explain(e, &job.log.lock().unwrap());
                ("failed", Some(m), h)
            }
        };
        let log: Vec<String> = job.log.lock().unwrap().iter().cloned().collect();
        if let Ok(c) = lib.writer() {
            let _ = c.execute(
                "UPDATE jobs SET state = ?1, message = ?2, hint = ?3, log = ?4, finished = ?5, progress = CASE WHEN ?1 = 'done' THEN 1 ELSE progress END WHERE id = ?6",
                params![state, message, hint, log.join("\n"), now_ms(), id],
            );
        }
        let _ = lib.relink();
        q.wake();
    }
}

/// A job being run.
struct Job {
    id: i64,
    kind: String,
    item: Option<i64>,
    extractor: String,
    game: Option<String>,
    args: Value,
    log: Mutex<VecDeque<String>>,
}

fn claim(lib: &Library) -> Result<Option<Job>> {
    let c = lib.writer()?;
    let row = c
        .query_row(
            "UPDATE jobs SET state = 'running', started = ?1, attempts = attempts + 1, progress = NULL, message = NULL, hint = NULL
             WHERE id = (SELECT id FROM jobs WHERE state = 'queued' ORDER BY id LIMIT 1)
             RETURNING id, kind, item, extractor, game, args",
            params![now_ms()],
            |r| Ok((r.get::<_, i64>(0)?, r.get::<_, String>(1)?, r.get::<_, Option<i64>>(2)?, r.get::<_, String>(3)?, r.get::<_, Option<String>>(4)?, r.get::<_, Option<String>>(5)?)),
        )
        .optional()?;
    Ok(row.map(|(id, kind, item, extractor, game, args)| Job { id, kind, item, extractor, game, args: args.and_then(|a| serde_json::from_str(&a).ok()).unwrap_or(Value::Null), log: Mutex::new(VecDeque::new()) }))
}

/// Why a job failed, in words, and what to do: `install:<id>`, `oodle`, `game`.
fn explain(e: &anyhow::Error, log: &VecDeque<String>) -> (String, Option<String>) {
    let text = format!("{e:#}");
    let all = format!("{text}\n{}", log.iter().cloned().collect::<Vec<_>>().join("\n")).to_ascii_lowercase();
    if let Some(id) = text.strip_prefix("not installed: ") {
        return (format!("The converter {id} is not installed"), Some(format!("install:{id}")));
    }
    if all.contains("oodle") {
        return ("Needs the Oodle library from your own game install (the converter says where to point it)".into(), Some("oodle".into()));
    }
    if all.contains("game install") || all.contains("install not found") || all.contains("--game") {
        return ("The converter did not find the game's install; set its folder in the Extractors panel".into(), Some("game".into()));
    }
    // The converter's own words: its last error line, else its last line (not the library's markers).
    let own = || log.iter().rev().filter(|l| !l.trim().is_empty() && !l.starts_with("> ") && !l.starts_with("exit "));
    let last = own().find(|l| l.to_ascii_lowercase().contains("error")).or_else(|| own().next()).cloned().unwrap_or_default();
    let msg = if last.is_empty() { text } else { format!("{text}: {}", last.chars().take(300).collect::<String>()) };
    (msg, None)
}

fn push_log(job: &Job, line: String) {
    let mut l = job.log.lock().unwrap();
    if l.len() >= 200 {
        l.pop_front();
    }
    l.push_back(line);
}

/// A progress figure a converter printed: `{"progress": 0.4}`, `40%`, or `3/10`.
pub fn parse_progress(line: &str) -> Option<f64> {
    let t = line.trim();
    if t.starts_with('{') {
        if let Ok(v) = serde_json::from_str::<Value>(t) {
            if let Some(p) = v.get("progress").and_then(Value::as_f64) {
                return Some(if p > 1.0 { p / 100.0 } else { p }.clamp(0.0, 1.0));
            }
        }
    }
    for w in t.split_whitespace() {
        if let Some(n) = w.strip_suffix('%').and_then(|n| n.parse::<f64>().ok()) {
            return Some((n / 100.0).clamp(0.0, 1.0));
        }
        if let Some((a, b)) = w.trim_matches(|c: char| !c.is_ascii_digit() && c != '/').split_once('/') {
            if let (Ok(a), Ok(b)) = (a.parse::<f64>(), b.parse::<f64>()) {
                if b > 0.0 && a <= b {
                    return Some(a / b);
                }
            }
        }
    }
    None
}

/// Runs a process to its end, logging its output; ends it on cancel.
fn run_process(lib: &Library, job: &Job, x: &Extractor, args: &[String], cwd: Option<&Path>) -> Result<()> {
    let mut cmd = Command::new(&x.command[0]);
    cmd.args(&x.command[1..]).args(args).envs(x.env.iter().map(|(k, v)| (k.as_str(), v.as_str()))).env("HEAT3D_LEVELS", lib.levels_dir()).stdin(Stdio::null()).stdout(Stdio::piped()).stderr(Stdio::piped());
    if let Some(d) = cwd {
        cmd.current_dir(d);
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        // No console window; below-normal priority, so the machine stays responsive.
        cmd.creation_flags(0x0800_0000 | 0x0000_4000);
    }
    push_log(job, format!("> {} {}", x.id, args.join(" ")));
    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Err(anyhow!("not installed: {}", x.id)),
        Err(e) => return Err(e).context("starting the converter"),
    };
    let progress = Arc::new(Mutex::new(None::<f64>));
    let mut readers = Vec::new();
    for stream in [child.stdout.take().map(|s| Box::new(s) as Box<dyn std::io::Read + Send>), child.stderr.take().map(|s| Box::new(s) as Box<dyn std::io::Read + Send>)].into_iter().flatten() {
        let (tx, progress) = (std::sync::mpsc::channel::<String>(), progress.clone());
        let (send, recv) = tx;
        readers.push((
            std::thread::spawn(move || {
                for line in BufReader::new(stream).lines().map_while(Result::ok) {
                    if let Some(p) = parse_progress(&line) {
                        *progress.lock().unwrap() = Some(p);
                    }
                    if send.send(line).is_err() {
                        break;
                    }
                }
            }),
            recv,
        ));
    }
    let t0 = Instant::now();
    let mut last_write = Instant::now();
    let status = loop {
        for (_, r) in &readers {
            while let Ok(l) = r.try_recv() {
                push_log(job, l);
            }
        }
        if lib.jobs.cancelled(job.id) {
            let _ = child.kill();
            let _ = child.wait();
            return Err(anyhow!("cancelled"));
        }
        if let Some(s) = child.try_wait()? {
            break s;
        }
        if last_write.elapsed() > Duration::from_millis(700) {
            last_write = Instant::now();
            let p = *progress.lock().unwrap();
            let last = job.log.lock().unwrap().back().cloned();
            if let Ok(c) = lib.writer() {
                let _ = c.execute("UPDATE jobs SET progress = ?1, message = ?2 WHERE id = ?3", params![p, last.map(|l| l.chars().take(200).collect::<String>()), job.id]);
            }
        }
        std::thread::sleep(Duration::from_millis(150));
    };
    for (h, r) in readers {
        let _ = h.join();
        while let Ok(l) = r.try_recv() {
            push_log(job, l);
        }
    }
    push_log(job, format!("exit {} after {:.1} s", status.code().map(|c| c.to_string()).unwrap_or_else(|| "signal".into()), t0.elapsed().as_secs_f64()));
    if !status.success() {
        return Err(anyhow!("the converter ended with code {}", status.code().unwrap_or(-1)));
    }
    Ok(())
}

fn run(lib: &Library, job: &Job) -> Result<usize> {
    let all = lib.extractors();
    let x = all.iter().find(|x| x.id == job.extractor).cloned().ok_or_else(|| anyhow!("not installed: {}", job.extractor))?;
    if !x.installed || x.command.is_empty() {
        return Err(anyhow!("not installed: {}", x.id));
    }
    match job.kind.as_str() {
        "convert" => convert(lib, job, &x),
        "extract" => extract(lib, job, &x),
        k => Err(anyhow!("unknown job kind {k}")),
    }
}

fn convert(lib: &Library, job: &Job, x: &Extractor) -> Result<usize> {
    if x.convert.is_empty() {
        return Err(anyhow!("{} does not convert replays", x.id));
    }
    let item = job.item.ok_or_else(|| anyhow!("the replay is no longer in the library"))?;
    let (path, game): (String, Option<String>) = lib.reader()?.query_row("SELECT path, game FROM items WHERE id = ?1", params![item], |r| Ok((r.get(0)?, r.get(1)?)))?;
    if !Path::new(&path).is_file() {
        return Err(anyhow!("the replay is missing (its drive offline?): {path}"));
    }
    let game = game.or_else(|| job.game.clone()).unwrap_or_else(|| "other".into());
    let out_root = lib.settings().output_dir.join(&game);
    let staging = out_root.join(".staging").join(format!("job-{}", job.id));
    let _ = std::fs::remove_dir_all(&staging);
    std::fs::create_dir_all(&staging).with_context(|| format!("creating {}", staging.display()))?;
    let args = extractors::fill(&x.convert, Some(&path), Some(&staging.to_string_lossy()), &[], Some(&lib.levels_dir().to_string_lossy()));
    let r = run_process(lib, job, x, &args, Some(&staging));
    let moved = r.and_then(|_| move_outputs(&staging, &out_root));
    let _ = std::fs::remove_dir_all(&staging);
    let _ = std::fs::remove_dir(out_root.join(".staging"));
    let moved = moved?;
    if moved.is_empty() {
        return Err(anyhow!("the converter wrote nothing"));
    }
    let ids = crate::scan::add_files(lib, &moved)?;
    let c = lib.writer()?;
    for id in &ids {
        c.execute("UPDATE items SET source = ?1 WHERE id = ?2", params![item, id])?;
    }
    c.execute("UPDATE jobs SET outputs = ?1 WHERE id = ?2", params![serde_json::to_string(&ids)?, job.id])?;
    Ok(moved.len())
}

/// Moves a job's outputs from staging to their place, replacing older ones; returns where they went.
fn move_outputs(staging: &Path, out_root: &Path) -> Result<Vec<PathBuf>> {
    let mut out = Vec::new();
    for e in walkdir::WalkDir::new(staging).into_iter().filter_map(|e| e.ok()).filter(|e| e.file_type().is_file()) {
        let rel = e.path().strip_prefix(staging)?;
        let dest = out_root.join(rel);
        if let Some(d) = dest.parent() {
            std::fs::create_dir_all(d)?;
        }
        if std::fs::rename(e.path(), &dest).is_err() {
            std::fs::copy(e.path(), &dest).with_context(|| format!("writing {}", dest.display()))?;
        }
        // One match, one file: only what the library keeps is added (side files stay beside it).
        if crate::kinds::classify(&dest).is_some() {
            out.push(dest);
        }
    }
    Ok(out)
}

fn extract(lib: &Library, job: &Job, x: &Extractor) -> Result<usize> {
    if x.extract.is_empty() {
        return Err(anyhow!("{} does not extract maps", x.id));
    }
    let maps: Vec<String> = job.args.get("maps").and_then(Value::as_array).map(|a| a.iter().filter_map(|m| m.as_str().map(str::to_owned)).collect()).unwrap_or_default();
    let levels = lib.levels_dir();
    let game = job.game.clone().or_else(|| x.games.first().cloned()).unwrap_or_else(|| "other".into());
    let out = levels.join(&game);
    std::fs::create_dir_all(&out)?;
    let args = extractors::fill(&x.extract, None, Some(&out.to_string_lossy()), &maps, Some(&out.to_string_lossy()));
    run_process(lib, job, x, &args, None)?;
    // The new levels into the catalogue, and the map status checked again.
    let found: Vec<PathBuf> = walkdir::WalkDir::new(&out).into_iter().filter_map(|e| e.ok()).filter(|e| e.file_type().is_file() && crate::kinds::classify(e.path()).is_some()).map(|e| e.path().to_path_buf()).collect();
    crate::scan::add_files(lib, &found)?;
    let _ = map_status(lib, x);
    Ok(maps.len().max(1))
}

/// Queues conversions of items; returns (queued, skipped with reasons).
pub fn queue_convert(lib: &Library, ids: &[i64], force: bool) -> Result<Value> {
    let all = lib.extractors();
    let c = lib.writer()?;
    let mut queued = 0;
    let mut skipped: Vec<Value> = Vec::new();
    for id in ids {
        let row: Option<(String, String, Option<String>, Option<String>, String)> =
            c.query_row("SELECT kind, format, game, conv, name FROM items WHERE id = ?1", params![id], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?))).optional()?;
        let Some((kind, format, game, conv, name)) = row else { continue };
        // A converted match: convert its replay again.
        let (target, format, game, conv) = if kind == "match" {
            let src: Option<(i64, String, Option<String>, Option<String>)> = c
                .query_row("SELECT r.id, r.format, r.game, r.conv FROM items m JOIN items r ON r.id = m.source WHERE m.id = ?1", params![id], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?)))
                .optional()?;
            match src {
                Some((rid, f, g, cv)) => (rid, f, g, cv),
                None => {
                    skipped.push(json!({ "id": id, "name": name, "reason": "already a match file" }));
                    continue;
                }
            }
        } else if kind != "replay" {
            skipped.push(json!({ "id": id, "name": name, "reason": "opens as it is" }));
            continue;
        } else {
            (*id, format, game, conv)
        };
        if !force && conv.as_deref() == Some("current") {
            skipped.push(json!({ "id": id, "name": name, "reason": "converted already" }));
            continue;
        }
        let busy: i64 = c.query_row("SELECT count(*) FROM jobs WHERE item = ?1 AND state IN ('queued', 'running')", params![target], |r| r.get(0))?;
        if busy > 0 {
            skipped.push(json!({ "id": id, "name": name, "reason": "in the queue" }));
            continue;
        }
        let Some(x) = extractors::converter_for(&all, game.as_deref(), &format) else {
            skipped.push(json!({ "id": id, "name": name, "reason": "no converter for this format" }));
            continue;
        };
        c.execute(
            "INSERT INTO jobs(kind, item, extractor, extractor_version, game, label, state, created) VALUES ('convert', ?1, ?2, ?3, ?4, ?5, 'queued', ?6)",
            params![target, x.id, x.version, game, name, now_ms()],
        )?;
        queued += 1;
    }
    drop(c);
    lib.jobs.wake();
    Ok(json!({ "queued": queued, "skipped": skipped }))
}

/// Queues an extraction of maps (all new, changed and outdated ones when `maps` is empty).
pub fn queue_extract(lib: &Library, extractor: &str, game: Option<&str>, maps: &[String]) -> Result<i64> {
    let all = lib.extractors();
    let x = all.iter().find(|x| x.id == extractor).ok_or_else(|| anyhow!("unknown extractor {extractor}"))?;
    let maps: Vec<String> = if maps.is_empty() {
        let st = lib.reader()?.query_row("SELECT json FROM map_status WHERE extractor = ?1", params![extractor], |r| r.get::<_, String>(0)).optional()?;
        let v: Value = st.and_then(|s| serde_json::from_str(&s).ok()).unwrap_or(Value::Null);
        status_maps(&v).into_iter().filter(|m| m.1 != "current" && game.is_none_or(|g| m.2.as_deref().is_none_or(|mg| mg == g))).map(|m| m.0).collect()
    } else {
        maps.to_vec()
    };
    let label = if maps.len() == 1 { maps[0].clone() } else { format!("{} maps", maps.len()) };
    let c = lib.writer()?;
    c.execute(
        "INSERT INTO jobs(kind, extractor, extractor_version, game, label, args, state, created) VALUES ('extract', ?1, ?2, ?3, ?4, ?5, 'queued', ?6)",
        params![x.id, x.version, game.map(str::to_owned).or_else(|| x.games.first().cloned()), label, json!({ "maps": maps }).to_string(), now_ms()],
    )?;
    let id = c.last_insert_rowid();
    drop(c);
    lib.jobs.wake();
    Ok(id)
}

/// The maps of a `status --json` answer: (id, state, game, name). Tolerant of
/// `maps` or `levels`, `state` or `status`.
pub fn status_maps(v: &Value) -> Vec<(String, String, Option<String>, Option<String>)> {
    let list = v.get("maps").or_else(|| v.get("levels")).and_then(Value::as_array).cloned().unwrap_or_default();
    list.iter()
        .filter_map(|m| {
            let id = m.get("id").or_else(|| m.get("map")).or_else(|| m.get("name")).and_then(Value::as_str)?.to_owned();
            let state = m.get("state").or_else(|| m.get("status")).and_then(Value::as_str).unwrap_or("new").to_ascii_lowercase();
            let game = m.get("game").and_then(Value::as_str).or_else(|| v.get("game").and_then(Value::as_str)).map(str::to_owned);
            let name = m.get("name").and_then(Value::as_str).map(str::to_owned);
            Some((id, state, game, name))
        })
        .collect()
}

/// Runs an extractor's `status --json` and keeps the answer.
pub fn map_status(lib: &Library, x: &Extractor) -> Result<Value> {
    if !x.installed || x.status.is_empty() {
        return Err(anyhow!("not installed: {}", x.id));
    }
    let mut cmd = Command::new(&x.command[0]);
    cmd.args(&x.command[1..]).args(&x.status).envs(x.env.iter().map(|(k, v)| (k.as_str(), v.as_str()))).env("HEAT3D_LEVELS", lib.levels_dir()).stdin(Stdio::null());
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000 | 0x0000_4000);
    }
    let out = cmd.output().with_context(|| format!("running {} status", x.id))?;
    if !out.status.success() {
        return Err(anyhow!("{} status ended with code {}: {}", x.id, out.status.code().unwrap_or(-1), String::from_utf8_lossy(&out.stderr).lines().last().unwrap_or("")));
    }
    let text = String::from_utf8_lossy(&out.stdout);
    // The JSON document: the whole output, or its last line that is one.
    let v: Value = serde_json::from_str(text.trim()).or_else(|_| text.lines().rev().find_map(|l| serde_json::from_str::<Value>(l.trim()).ok()).ok_or(())).map_err(|_| anyhow!("{} status gave no JSON", x.id))?;
    lib.writer()?.execute(
        "INSERT INTO map_status(extractor, json, checked) VALUES (?1, ?2, ?3) ON CONFLICT(extractor) DO UPDATE SET json = excluded.json, checked = excluded.checked",
        params![x.id, v.to_string(), now_ms()],
    )?;
    Ok(v)
}

/// The queue, newest first, with counts by state.
pub fn list(lib: &Library, limit: i64) -> Result<Value> {
    let c = lib.reader()?;
    let mut st = c.prepare("SELECT id, kind, item, extractor, extractor_version, game, label, state, progress, message, hint, attempts, created, started, finished FROM jobs ORDER BY CASE state WHEN 'running' THEN 0 WHEN 'queued' THEN 1 ELSE 2 END, id DESC LIMIT ?1")?;
    let jobs: Vec<Value> = st
        .query_map(params![limit], |r| {
            Ok(json!({
                "id": r.get::<_, i64>(0)?, "kind": r.get::<_, String>(1)?, "item": r.get::<_, Option<i64>>(2)?, "extractor": r.get::<_, String>(3)?, "extractorVersion": r.get::<_, Option<String>>(4)?,
                "game": r.get::<_, Option<String>>(5)?, "label": r.get::<_, Option<String>>(6)?, "state": r.get::<_, String>(7)?, "progress": r.get::<_, Option<f64>>(8)?, "message": r.get::<_, Option<String>>(9)?,
                "hint": r.get::<_, Option<String>>(10)?, "attempts": r.get::<_, i64>(11)?, "created": r.get::<_, i64>(12)?, "started": r.get::<_, Option<i64>>(13)?, "finished": r.get::<_, Option<i64>>(14)?,
            }))
        })?
        .collect::<rusqlite::Result<_>>()?;
    let mut counts = serde_json::Map::new();
    let mut st = c.prepare("SELECT state, count(*) FROM jobs GROUP BY state")?;
    for r in st.query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, i64>(1)?)))? {
        let (s, n) = r?;
        counts.insert(s, json!(n));
    }
    Ok(json!({ "jobs": jobs, "counts": counts, "paused": lib.jobs.paused.load(Ordering::SeqCst), "limit": job_limit(lib.settings().max_jobs), "running": lib.jobs.running.load(Ordering::SeqCst) }))
}

pub fn job_log(lib: &Library, id: i64) -> Result<Option<String>> {
    Ok(lib.reader()?.query_row("SELECT log FROM jobs WHERE id = ?1", params![id], |r| r.get::<_, Option<String>>(0)).optional()?.flatten())
}

pub fn retry(lib: &Library, id: i64) -> Result<()> {
    lib.writer()?.execute("UPDATE jobs SET state = 'queued', progress = NULL, message = NULL, hint = NULL, finished = NULL WHERE id = ?1 AND state IN ('failed', 'cancelled')", params![id])?;
    lib.jobs.wake();
    Ok(())
}

/// Cancels a job: a queued one at once, a running one when its process has ended.
pub fn cancel(lib: &Library, id: i64) -> Result<()> {
    let n = lib.writer()?.execute("UPDATE jobs SET state = 'cancelled', finished = ?1 WHERE id = ?2 AND state = 'queued'", params![now_ms(), id])?;
    if n == 0 {
        lib.jobs.cancel(id);
    }
    Ok(())
}

pub fn clear_finished(lib: &Library) -> Result<usize> {
    Ok(lib.writer()?.execute("DELETE FROM jobs WHERE state IN ('done', 'cancelled')", [])?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn progress_lines() {
        assert_eq!(parse_progress(r#"{"progress": 0.25}"#), Some(0.25));
        assert_eq!(parse_progress("reading 40% done"), Some(0.4));
        assert_eq!(parse_progress("[3/12] battle.wrpl"), Some(0.25));
        assert_eq!(parse_progress("ok out/a/b.3dheat"), None);
    }

    #[test]
    fn status_answers() {
        let v: Value = serde_json::from_str(r#"{"game":"warthunder","maps":[{"id":"avg_a","state":"new"},{"id":"avg_b","status":"Changed","name":"B"},{"map":"avg_c","state":"current"}]}"#).unwrap();
        let m = status_maps(&v);
        assert_eq!(m.len(), 3);
        assert_eq!(m[1], ("avg_b".into(), "changed".into(), Some("warthunder".into()), Some("B".into())));
        assert_eq!(m[2].1, "current");
    }
}
