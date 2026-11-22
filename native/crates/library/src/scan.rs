//! Scanning: walks a folder, finds what the library keeps, and reads the new
//! and changed files' metadata on every core, writing in batches. A file whose
//! size and time are unchanged is not opened again; a file gone is marked
//! missing (its ratings, tags and notes are kept); a folder that cannot be
//! reached (an unplugged drive, the NAS asleep) is marked offline and nothing
//! under it changes.
//!
//! Two passes: the fast one (names, sizes, headers, manifests, summaries,
//! thumbnails) shows the items at once; the deep one reads what needs the whole
//! file (an ACMI recording's tracks and length, full SHA-256 hashes) in the
//! background, a few files at a time.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Instant;

use anyhow::Result;
use rayon::prelude::*;
use rusqlite::params;
use serde::Serialize;
use serde_json::Value;

use crate::db::{self, now_ms, Scanned};
use crate::kinds::{classify, is_watcher_session, skip_dir, Class, Kind};
use crate::meta::{self, Meta};
use crate::thumb;
use crate::Library;

/// What the scanner is doing, for the status line.
#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Progress {
    pub running: bool,
    pub phase: String,
    pub root: Option<String>,
    pub found: u64,
    pub changed: u64,
    pub done: u64,
    pub deep_left: u64,
    pub last: Option<Stats>,
}

/// One scan's numbers.
#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats {
    pub root: String,
    pub files: u64,
    pub changed: u64,
    pub missing: u64,
    pub errors: u64,
    pub walk_ms: u64,
    pub read_ms: u64,
    pub total_ms: u64,
    pub offline: bool,
}

/// A candidate: a file (or a Watcher session folder) the library keeps.
struct Found {
    path: PathBuf,
    class: Class,
    size: u64,
    mtime: i64,
}

fn mtime_ms(md: &std::fs::Metadata) -> i64 {
    md.modified().ok().and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok()).map(|d| d.as_millis() as i64).unwrap_or(0)
}

/// A path on the network (`\\server\share`): read with fewer threads, not hashed whole by default.
pub fn is_network(p: &Path) -> bool {
    let s = p.to_string_lossy();
    s.starts_with("\\\\") || s.starts_with("//")
}

/// Walks a folder for what the library keeps.
fn walk(root: &Path, progress: &dyn Fn(u64)) -> Vec<Found> {
    let mut out = Vec::new();
    let mut it = walkdir::WalkDir::new(root).follow_links(false).into_iter();
    loop {
        let e = match it.next() {
            None => break,
            Some(Err(_)) => continue,
            Some(Ok(e)) => e,
        };
        if e.file_type().is_dir() {
            if e.depth() > 0 && skip_dir(&e.file_name().to_string_lossy()) {
                it.skip_current_dir();
                continue;
            }
            // A model or figure pack: the folder is one item.
            let parent = e.path().parent().and_then(|p| p.file_name()).map(|n| n.to_string_lossy().to_ascii_lowercase());
            if e.depth() > 0 && matches!(parent.as_deref(), Some("model-packs") | Some("figure-packs")) {
                let (mut size, mut mtime) = (0u64, 0i64);
                for f in std::fs::read_dir(e.path()).into_iter().flatten().flatten() {
                    if let Ok(m) = f.metadata() {
                        size += m.len();
                        mtime = mtime.max(mtime_ms(&m));
                    }
                }
                let format = if parent.as_deref() == Some("model-packs") { "model-pack" } else { "figure-pack" };
                out.push(Found { path: e.path().to_path_buf(), class: Class { kind: Kind::Models, format, game: None }, size, mtime });
                it.skip_current_dir();
                continue;
            }
            if is_watcher_session(e.path()) {
                let size = ["heat.parquet", "events.jsonl", "meta.json"].iter().filter_map(|f| std::fs::metadata(e.path().join(f)).ok()).map(|m| m.len()).sum();
                let mtime = std::fs::metadata(e.path().join("meta.json")).map(|m| mtime_ms(&m)).unwrap_or(0);
                out.push(Found { path: e.path().to_path_buf(), class: Class { kind: Kind::Session, format: "watcher", game: None }, size, mtime });
                it.skip_current_dir();
            }
            continue;
        }
        let Some(class) = classify(e.path()) else { continue };
        let Ok(md) = e.metadata() else { continue };
        out.push(Found { path: e.path().to_path_buf(), class, size: md.len(), mtime: mtime_ms(&md) });
        if out.len() % 2048 == 0 {
            progress(out.len() as u64);
        }
    }
    out
}

/// The levels index (`.3dheat-index.json`) of a levels folder: relative path to (bytes, sha256, extractor, game build).
fn level_index(root: &Path) -> HashMap<String, (u64, String, Option<String>, Option<String>)> {
    let mut out = HashMap::new();
    let Ok(b) = std::fs::read(root.join(".3dheat-index.json")) else { return out };
    let Ok(Value::Object(o)) = serde_json::from_slice::<Value>(&b) else { return out };
    for (k, v) in o {
        let (Some(bytes), Some(sha)) = (v.get("bytes").and_then(Value::as_u64), v.get("sha256").and_then(Value::as_str)) else { continue };
        out.insert(k.replace('\\', "/"), (bytes, sha.to_owned(), v.get("extractor").and_then(Value::as_str).map(str::to_owned), v.get("gameBuild").and_then(Value::as_str).map(str::to_owned)));
    }
    out
}

/// The levels the catalogue knows with pictures: (game, map) -> pictures.
pub fn level_pictures(lib: &Library) -> HashMap<(String, String), Vec<(String, [f32; 4])>> {
    let mut out = HashMap::new();
    let Ok(c) = lib.reader() else { return out };
    let Ok(mut st) = c.prepare("SELECT game, map, extra FROM items WHERE kind = 'level' AND missing = 0 AND extra LIKE '%\"pictures\"%'") else { return out };
    let rows = st.query_map([], |r| Ok((r.get::<_, Option<String>>(0)?, r.get::<_, Option<String>>(1)?, r.get::<_, Option<String>>(2)?)));
    for (g, m, e) in rows.into_iter().flatten().flatten() {
        let (Some(g), Some(m), Some(e)) = (g, m, e) else { continue };
        let Ok(v) = serde_json::from_str::<Value>(&e) else { continue };
        let pics: Vec<(String, [f32; 4])> = v["pictures"]
            .as_array()
            .into_iter()
            .flatten()
            .filter_map(|p| {
                let r = p["rect"].as_array()?;
                Some((p["file"].as_str()?.to_owned(), [r.first()?.as_f64()? as f32, r.get(1)?.as_f64()? as f32, r.get(2)?.as_f64()? as f32, r.get(3)?.as_f64()? as f32]))
            })
            .collect();
        // Several levels of one map (a DCS theatre's regions): all their pictures, the best is picked per item.
        out.entry((g, m.to_ascii_lowercase())).or_insert_with(Vec::new).extend(pics);
    }
    out
}

/// The picture whose world rect holds most of the heat, the smallest of those that hold 80 %.
pub fn pick_picture<'a>(pics: &'a [(String, [f32; 4])], pts: &[[f32; 3]]) -> Option<&'a (String, [f32; 4])> {
    let total: f32 = pts.iter().map(|p| p[2]).sum();
    if total <= 0.0 {
        return None;
    }
    let share = |r: &[f32; 4]| pts.iter().filter(|p| p[0] >= r[0] && p[0] <= r[2] && p[1] >= r[1] && p[1] <= r[3]).map(|p| p[2]).sum::<f32>() / total;
    pics.iter().filter(|(_, r)| share(r) >= 0.8).min_by(|a, b| ((a.1[2] - a.1[0]) * (a.1[3] - a.1[1])).total_cmp(&((b.1[2] - b.1[0]) * (b.1[3] - b.1[1]))))
}

/// The thumbnail of an item from its metadata.
pub fn thumbnail(m: &Meta, pictures: &HashMap<(String, String), Vec<(String, [f32; 4])>>) -> Option<Vec<u8>> {
    if !m.points.is_empty() {
        let pic = match (&m.game, &m.map) {
            (Some(g), Some(mp)) => pictures.get(&(g.clone(), mp.to_ascii_lowercase())).and_then(|p| pick_picture(p, &m.points)),
            _ => None,
        };
        return thumb::render(&m.points, pic.map(|(f, r)| (Path::new(f.as_str()), *r)));
    }
    m.underlay.as_ref().and_then(|(f, _)| thumb::render(&[], Some((Path::new(f), [0.0; 4]))))
}

/// Reads one candidate's fast metadata, fingerprint and thumbnail.
fn read_one(f: &Found, root_id: Option<i64>, levels: &HashMap<String, (u64, String, Option<String>, Option<String>)>, levels_root: &Path, pictures: &HashMap<(String, String), Vec<(String, [f32; 4])>>) -> Scanned {
    let (mut meta, error) = match meta::read_fast(&f.path, &f.class) {
        Ok(m) => (m, None),
        Err(e) => {
            let mut m = Meta::default();
            m.title = Some(meta::display_stem(&f.path));
            m.game = f.class.game.map(str::to_owned).or_else(|| crate::kinds::game_from_path(&f.path).map(str::to_owned));
            m.started = meta::date_from_name(&f.path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default());
            (m, Some(format!("{e:#}")))
        }
    };
    let mut sha = None;
    if f.class.kind == Kind::Level || f.class.kind == Kind::Models {
        if let Ok(rel) = f.path.strip_prefix(levels_root) {
            if let Some((bytes, s, ex, build)) = levels.get(&rel.to_string_lossy().replace('\\', "/")) {
                if *bytes == f.size {
                    sha = Some(s.clone());
                    if meta.converter.is_none() {
                        meta.converter = ex.clone();
                    }
                    meta.game_version = build.clone();
                }
            }
        }
    }
    let qhash = if f.path.is_dir() { None } else { meta::quick_hash(&f.path, f.size).ok() };
    let thumb = thumbnail(&meta, pictures);
    // The points are in the thumbnail now; the catalogue does not keep them.
    meta.points = Vec::new();
    Scanned {
        path: f.path.to_string_lossy().into_owned(),
        root: root_id,
        kind: f.class.kind.as_str(),
        format: f.class.format,
        name: f.path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default(),
        size: f.size as i64,
        mtime: f.mtime,
        qhash,
        sha256: sha,
        meta,
        thumb,
        error,
    }
}

/// Scans one root: new and changed files read, gone ones marked missing.
pub fn scan_root(lib: &Library, root_id: i64, root: &Path) -> Result<Stats> {
    let t0 = Instant::now();
    let mut stats = Stats { root: root.to_string_lossy().into_owned(), ..Default::default() };
    lib.set_progress(|p| {
        p.running = true;
        p.phase = "walk".into();
        p.root = Some(stats.root.clone());
        p.found = 0;
        p.changed = 0;
        p.done = 0;
    });
    if std::fs::metadata(root).map(|m| !m.is_dir()).unwrap_or(true) {
        lib.writer()?.execute("UPDATE roots SET online = 0 WHERE id = ?1", params![root_id])?;
        stats.offline = true;
        return Ok(stats);
    }
    let found = walk(root, &|n| lib.set_progress(|p| p.found = n));
    stats.files = found.len() as u64;
    stats.walk_ms = t0.elapsed().as_millis() as u64;
    // What the catalogue has under this root: path -> (id, size, mtime, missing).
    let known: HashMap<String, (i64, i64, i64, bool)> = {
        let c = lib.reader()?;
        let mut st = c.prepare("SELECT path, id, size, mtime, missing FROM items WHERE root = ?1")?;
        let rows = st.query_map(params![root_id], |r| Ok((r.get::<_, String>(0)?, (r.get(1)?, r.get(2)?, r.get(3)?, r.get::<_, i64>(4)? != 0))))?;
        rows.collect::<rusqlite::Result<_>>()?
    };
    let mut seen = std::collections::HashSet::with_capacity(found.len());
    let mut changed: Vec<&Found> = Vec::new();
    for f in &found {
        let key = f.path.to_string_lossy().into_owned();
        match known.get(&key) {
            Some((_, size, mtime, missing)) if *size == f.size as i64 && *mtime == f.mtime && !missing => {}
            _ => changed.push(f),
        }
        seen.insert(key);
    }
    // Levels first: the matches' thumbnails draw on their pictures.
    changed.sort_by_key(|f| if f.class.kind == Kind::Level { 0 } else { 1 });
    stats.changed = changed.len() as u64;
    lib.set_progress(|p| {
        p.phase = "read".into();
        p.found = found.len() as u64;
        p.changed = changed.len() as u64;
    });
    let t1 = Instant::now();
    let levels_root = crate::normal_path(&lib.levels_dir());
    let levels = level_index(&levels_root);
    let pool = rayon::ThreadPoolBuilder::new()
        // A network share: a few files at a time, so the NAS keeps serving everyone else.
        .num_threads(if is_network(root) { 4 } else { std::thread::available_parallelism().map(|n| n.get()).unwrap_or(4).min(16) })
        .build()?;
    let done = AtomicU64::new(0);
    let errors = AtomicU64::new(0);
    let (lv, rest): (Vec<&Found>, Vec<&Found>) = changed.iter().partition(|f| f.class.kind == Kind::Level);
    for part in [lv, rest] {
        let pictures = level_pictures(lib);
        for chunk in part.chunks(512) {
            let batch: Vec<Scanned> = pool.install(|| chunk.par_iter().map(|f| read_one(f, Some(root_id), &levels, &levels_root, &pictures)).collect());
            // What turned out not to be kept (a text file with no positions) is left out, as if not found.
            let (batch, skipped): (Vec<Scanned>, Vec<Scanned>) = batch.into_iter().partition(|s| !s.meta.skip);
            for s in &skipped {
                seen.remove(&s.path);
            }
            stats.files -= skipped.len() as u64;
            errors.fetch_add(batch.iter().filter(|s| s.error.is_some()).count() as u64, Ordering::Relaxed);
            db::upsert(&mut *lib.writer()?, &batch)?;
            let n = done.fetch_add(chunk.len() as u64, Ordering::Relaxed) + chunk.len() as u64;
            lib.set_progress(|p| p.done = n);
        }
    }
    stats.read_ms = t1.elapsed().as_millis() as u64;
    stats.errors = errors.load(Ordering::Relaxed);
    // Gone: missing now (kept, with everything the user set).
    let gone: Vec<i64> = known.iter().filter(|(p, v)| !v.3 && !seen.contains(*p)).map(|(_, v)| v.0).collect();
    stats.missing = gone.len() as u64;
    {
        let mut c = lib.writer()?;
        let tx = c.transaction()?;
        for id in &gone {
            tx.execute("UPDATE items SET missing = 1 WHERE id = ?1", params![id])?;
        }
        tx.execute(
            "UPDATE roots SET online = 1, last_scan = ?1, scan_ms = ?2, files = ?3 WHERE id = ?4",
            params![now_ms(), t0.elapsed().as_millis() as i64, found.len() as i64, root_id],
        )?;
        tx.commit()?;
    }
    lib.relink()?;
    stats.total_ms = t0.elapsed().as_millis() as u64;
    Ok(stats)
}

/// Adds or refreshes single files (a converter's outputs) under their root, or none.
pub fn add_files(lib: &Library, paths: &[PathBuf]) -> Result<Vec<i64>> {
    let roots: Vec<(i64, String)> = {
        let c = lib.reader()?;
        let mut st = c.prepare("SELECT id, path FROM roots")?;
        let v = st.query_map([], |r| Ok((r.get(0)?, r.get(1)?)))?.collect::<rusqlite::Result<_>>()?;
        v
    };
    let levels_root = crate::normal_path(&lib.levels_dir());
    let levels = level_index(&levels_root);
    let pictures = level_pictures(lib);
    let mut batch = Vec::new();
    for p in paths {
        // Spelled as a scan of its folder spells it, or the same file becomes a second item.
        let p = &crate::normal_path(p);
        let Some(class) = classify(p) else { continue };
        let Ok(md) = std::fs::metadata(p) else { continue };
        let root = roots.iter().filter(|(_, r)| p.starts_with(r)).max_by_key(|(_, r)| r.len()).map(|(id, _)| *id);
        batch.push(read_one(&Found { path: p.clone(), class, size: md.len(), mtime: mtime_ms(&md) }, root, &levels, &levels_root, &pictures));
    }
    db::upsert(&mut *lib.writer()?, &batch)
}

/// One round of the deep pass: up to `n` items read whole. Returns how many were done.
pub fn deep_round(lib: &Library, n: usize) -> Result<usize> {
    let hash_network = lib.settings().hash_network;
    let todo: Vec<(i64, String, String, String, i64, Option<String>)> = {
        let c = lib.reader()?;
        let mut st = c.prepare(
            "SELECT id, path, kind, format, size, sha256 FROM items WHERE missing = 0 AND kind NOT IN ('session', 'models') AND deep = 0 AND (
                format = 'acmi' OR (format = 'parquet' AND has_thumb = 0) OR sha256 IS NULL) ORDER BY id LIMIT ?1",
        )?;
        let v = st.query_map(params![n as i64], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?, r.get(5)?)))?.collect::<rusqlite::Result<_>>()?;
        v
    };
    if todo.is_empty() {
        return Ok(0);
    }
    let pictures = level_pictures(lib);
    let results: Vec<(i64, Option<Meta>, Option<String>, Option<Vec<u8>>)> = todo
        .par_iter()
        .with_max_len(1)
        .map(|(id, path, kind, format, _size, sha)| {
            let p = Path::new(path);
            let class = Class { kind: Kind::parse(kind).unwrap_or(Kind::Match), format: crate::kinds::classify(p).map(|c| c.format).unwrap_or("other"), game: None };
            let _ = format;
            let deep = meta::read_deep(p, &class).ok().flatten();
            let thumb = deep.as_ref().and_then(|m| thumbnail(m, &pictures));
            let sha = if sha.is_none() && (hash_network || !is_network(p)) { meta::full_hash(p).ok() } else { sha.clone() };
            (*id, deep, sha, thumb)
        })
        .collect();
    let mut c = lib.writer()?;
    let tx = c.transaction()?;
    for (id, deep, sha, thumb) in &results {
        if let Some(m) = deep {
            tx.execute(
                "UPDATE items SET duration = coalesce(?1, duration), players = coalesce(?2, players), map = coalesce(map, ?3), teams = coalesce(?4, teams), game = coalesce(game, ?5),
                   extra = json_patch(coalesce(extra, '{}'), ?7) WHERE id = ?6",
                params![m.duration, m.players, m.map, (!m.teams.is_empty()).then(|| serde_json::to_string(&m.teams).unwrap()), m.game, id, if m.extra.is_object() { m.extra.to_string() } else { "{}".into() }],
            )?;
            tx.execute("DELETE FROM players WHERE item = ?1", params![id])?;
            for name in &m.player_names {
                tx.execute("INSERT OR IGNORE INTO players(item, name) VALUES (?1, ?2)", params![id, name])?;
            }
            if let Some(png) = thumb {
                tx.execute("INSERT INTO thumbs(item, png) VALUES (?1, ?2) ON CONFLICT(item) DO UPDATE SET png = excluded.png", params![id, png])?;
                tx.execute("UPDATE items SET has_thumb = 1 WHERE id = ?1", params![id])?;
            }
        }
        tx.execute("UPDATE items SET deep = 1, sha256 = coalesce(?1, sha256) WHERE id = ?2", params![sha, id])?;
    }
    let ids: Vec<i64> = results.iter().map(|r| r.0).collect();
    db::reindex(&tx, &ids)?;
    tx.commit()?;
    Ok(results.len())
}

/// How many items the deep pass still has to read.
pub fn deep_left(lib: &Library) -> u64 {
    lib.reader()
        .ok()
        .and_then(|c| c.query_row("SELECT count(*) FROM items WHERE missing = 0 AND kind NOT IN ('session', 'models') AND deep = 0 AND (format = 'acmi' OR (format = 'parquet' AND has_thumb = 0) OR sha256 IS NULL)", [], |r| r.get::<_, i64>(0)).ok())
        .unwrap_or(0) as u64
}
