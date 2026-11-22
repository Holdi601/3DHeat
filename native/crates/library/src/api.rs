//! The library's JSON interface, independent of the HTTP server that mounts it
//! (`heat3d-server` at `/__heat3d/library`, for the app's window and the
//! development server only; never for a session's members).

use std::path::PathBuf;
use std::sync::atomic::Ordering;
use std::sync::Arc;

use anyhow::{anyhow, Result};
use rusqlite::{params, OptionalExtension};
use serde::Deserialize;
use serde_json::{json, Value};

use crate::db::{self, Filter};
use crate::{jobs, Library, Settings};

/// What an answer carries.
pub enum Body {
    Json(Value),
    Bytes(Vec<u8>, &'static str),
    /// A file to send whole, with the name it is offered under.
    File(PathBuf, String),
}

pub struct Answer {
    pub status: u16,
    pub body: Body,
}

fn ok(v: Value) -> Result<Answer> {
    Ok(Answer { status: 200, body: Body::Json(v) })
}

fn not_found() -> Result<Answer> {
    Ok(Answer { status: 404, body: Body::Json(json!({ "error": "not found" })) })
}

/// `a=1&b=x%20y` into pairs.
pub fn parse_query(q: &str) -> Vec<(String, String)> {
    q.split('&').filter(|s| !s.is_empty()).map(|kv| {
        let (k, v) = kv.split_once('=').unwrap_or((kv, ""));
        (decode(k), decode(v))
    }).collect()
}

fn decode(s: &str) -> String {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        match b[i] {
            b'+' => out.push(b' '),
            b'%' if i + 2 < b.len() => {
                match u8::from_str_radix(std::str::from_utf8(&b[i + 1..i + 3]).unwrap_or("zz"), 16) {
                    Ok(v) => {
                        out.push(v);
                        i += 2;
                    }
                    Err(_) => out.push(b'%'),
                }
            }
            c => out.push(c),
        }
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

fn q<'a>(query: &'a [(String, String)], key: &str) -> Option<&'a str> {
    query.iter().find(|(k, _)| k == key).map(|(_, v)| v.as_str())
}

fn body<T: for<'de> Deserialize<'de> + Default>(b: &[u8]) -> Result<T> {
    if b.is_empty() {
        return Ok(T::default());
    }
    serde_json::from_slice(b).map_err(|e| anyhow!("bad request body: {e}"))
}

#[derive(Deserialize, Default)]
#[serde(default, rename_all = "camelCase")]
struct Ids {
    ids: Vec<i64>,
    filter: Option<Filter>,
    sort: Option<String>,
    desc: Option<bool>,
    force: bool,
}

impl Ids {
    /// The ids named, or every id a filter matches.
    fn resolve(&self, lib: &Library) -> Result<Vec<i64>> {
        if let Some(f) = &self.filter {
            return db::ids(&*lib.reader()?, f, self.sort.as_deref().unwrap_or("started"), self.desc.unwrap_or(true));
        }
        Ok(self.ids.clone())
    }
}

/// Answers one request: `path` is what follows `/__heat3d/library/`.
pub fn handle(lib: &Arc<Library>, method: &str, path: &str, query: &str, req: &[u8]) -> Answer {
    match route(lib, method, path.trim_matches('/'), &parse_query(query), req) {
        Ok(a) => a,
        Err(e) => Answer { status: 400, body: Body::Json(json!({ "error": format!("{e:#}") })) },
    }
}

fn route(lib: &Arc<Library>, method: &str, path: &str, query: &[(String, String)], req: &[u8]) -> Result<Answer> {
    let parts: Vec<&str> = path.split('/').collect();
    let id = |i: usize| parts.get(i).and_then(|s| s.parse::<i64>().ok());
    match (method, parts.as_slice()) {
        ("GET", ["status"]) => status(lib),
        ("GET", ["roots"]) => roots(lib),
        ("POST", ["roots"]) => {
            #[derive(Deserialize, Default)]
            struct Add {
                path: String,
                #[serde(default = "yes")]
                watch: bool,
            }
            fn yes() -> bool {
                true
            }
            let a: Add = body(req)?;
            let p = PathBuf::from(a.path.trim());
            if a.path.trim().is_empty() {
                return Err(anyhow!("no folder given"));
            }
            if !p.is_dir() {
                return Err(anyhow!("not a folder (or not reachable now): {}", p.display()));
            }
            ok(json!({ "id": lib.add_root(&p, a.watch)? }))
        }
        ("DELETE", ["roots", _]) => ok(json!({ "removed": lib.remove_root(id(1).ok_or_else(|| anyhow!("no id"))?)? })),
        ("POST", ["roots", _, "scan"]) => {
            lib.queue_scan(id(1).ok_or_else(|| anyhow!("no id"))?);
            ok(json!({ "queued": 1 }))
        }
        ("POST", ["roots", _, "watch"]) => {
            #[derive(Deserialize, Default)]
            struct W {
                watch: bool,
            }
            let w: W = body(req)?;
            lib.writer()?.execute("UPDATE roots SET watch = ?1 WHERE id = ?2", params![w.watch as i64, id(1)])?;
            ok(json!({}))
        }
        ("POST", ["scan"]) => ok(json!({ "queued": lib.queue_scan_all()? })),
        ("GET", ["suggest"]) => ok(json!({ "folders": suggest(lib)? })),
        ("GET", ["items"]) => {
            let f = Filter::from_query(query);
            let sort = q(query, "sort").unwrap_or("started");
            let desc = q(query, "desc").map(|v| v != "0").unwrap_or(true);
            let offset = q(query, "offset").and_then(|v| v.parse().ok()).unwrap_or(0);
            let limit = q(query, "limit").and_then(|v| v.parse().ok()).unwrap_or(200);
            let (total, rows) = db::list(&*lib.reader()?, &f, sort, desc, offset, limit)?;
            ok(json!({ "total": total, "offset": offset, "items": rows }))
        }
        ("GET", ["ids"]) => {
            let f = Filter::from_query(query);
            let ids = db::ids(&*lib.reader()?, &f, q(query, "sort").unwrap_or("started"), q(query, "desc").map(|v| v != "0").unwrap_or(true))?;
            ok(json!({ "ids": ids }))
        }
        ("GET", ["facets"]) => ok(db::facets(&*lib.reader()?, &Filter::from_query(query))?),
        ("GET", ["item", _]) => match db::detail(&*lib.reader()?, id(1).unwrap_or(-1))? {
            Some(d) => ok(d),
            None => not_found(),
        },
        ("POST", ["edit"]) => {
            let e: db::Edit = body(req)?;
            ok(json!({ "changed": db::edit(&mut *lib.writer()?, &e)? }))
        }
        ("GET", ["thumb", token, _]) => {
            if *token != lib.thumb_token {
                return not_found();
            }
            let png: Option<Vec<u8>> = lib.reader()?.query_row("SELECT png FROM thumbs WHERE item = ?1", params![id(2)], |r| r.get(0)).optional()?;
            match png {
                Some(p) => Ok(Answer { status: 200, body: Body::Bytes(p, "image/png") }),
                None => not_found(),
            }
        }
        ("GET", ["file", _]) => {
            let (p, name) = lib.open_path(id(1).unwrap_or(-1))?;
            if !p.is_file() {
                return Ok(Answer { status: 410, body: Body::Json(json!({ "error": "the file is not there now (its drive offline?)" })) });
            }
            Ok(Answer { status: 200, body: Body::File(p, name) })
        }
        ("POST", ["open"]) => {
            let ids: Ids = body(req)?;
            let ids = ids.resolve(lib)?;
            let rows = db::rows_by_id(&*lib.reader()?, &ids)?;
            let mut out = Vec::new();
            let mut not = Vec::new();
            for r in rows {
                if r.kind == "level" || r.kind == "models" || r.kind == "replay" {
                    not.push(json!({ "id": r.id, "name": r.name, "kind": r.kind, "conv": r.conv }));
                    continue;
                }
                let (p, name) = lib.open_path(r.id)?;
                let size = std::fs::metadata(&p).map(|m| m.len()).ok();
                match size {
                    Some(size) => out.push(json!({ "id": r.id, "name": name, "size": size, "kind": r.kind, "format": r.format, "game": r.game, "map": r.map })),
                    None => not.push(json!({ "id": r.id, "name": r.name, "kind": r.kind, "missing": true })),
                }
            }
            // A replay opens as its newest converted match.
            let c = lib.reader()?;
            for n in not.iter_mut() {
                if n["kind"] == "replay" {
                    let conv: Option<(i64, String)> = c.query_row("SELECT id, name FROM items WHERE source = ?1 AND missing = 0 ORDER BY mtime DESC LIMIT 1", params![n["id"].as_i64()], |r| Ok((r.get(0)?, r.get(1)?))).optional()?;
                    if let Some((cid, _)) = conv {
                        let (p, name) = lib.open_path(cid)?;
                        if let Ok(m) = std::fs::metadata(&p) {
                            out.push(json!({ "id": cid, "name": name, "size": m.len(), "kind": "match", "of": n["id"] }));
                            n["opened"] = json!(true);
                        }
                    }
                }
            }
            not.retain(|n| n["opened"] != true);
            ok(json!({ "files": out, "skipped": not }))
        }
        ("GET", ["collections"]) => ok(db::collections(&*lib.reader()?)?),
        ("POST", ["collections"]) => {
            #[derive(Deserialize, Default)]
            #[serde(default)]
            struct New {
                name: String,
                smart: Option<Filter>,
                ids: Vec<i64>,
            }
            let n: New = body(req)?;
            ok(json!({ "id": db::create_collection(&*lib.writer()?, &n.name, n.smart.as_ref(), &n.ids)? }))
        }
        ("POST", ["collections", _, "add"]) => {
            let ids: Ids = body(req)?;
            let ids = ids.resolve(lib)?;
            db::collection_add(&*lib.writer()?, id(1).unwrap_or(-1), &ids)?;
            ok(json!({ "added": ids.len() }))
        }
        ("POST", ["collections", _, "remove"]) => {
            let ids: Ids = body(req)?;
            db::collection_remove(&*lib.writer()?, id(1).unwrap_or(-1), &ids.ids)?;
            ok(json!({}))
        }
        ("POST", ["collections", _, "rename"]) => {
            #[derive(Deserialize, Default)]
            struct R {
                name: String,
            }
            let r: R = body(req)?;
            lib.writer()?.execute("UPDATE collections SET name = ?1 WHERE id = ?2", params![r.name.trim().chars().take(120).collect::<String>(), id(1)])?;
            ok(json!({}))
        }
        ("DELETE", ["collections", _]) => {
            lib.writer()?.execute("DELETE FROM collections WHERE id = ?1", params![id(1)])?;
            ok(json!({}))
        }
        ("GET", ["duplicates"]) => ok(db::duplicates(&*lib.reader()?, q(query, "limit").and_then(|v| v.parse().ok()).unwrap_or(200))?),
        ("GET", ["jobs"]) => ok(jobs::list(lib, q(query, "limit").and_then(|v| v.parse().ok()).unwrap_or(300))?),
        ("POST", ["convert"]) => {
            let ids: Ids = body(req)?;
            let force = ids.force;
            let ids = ids.resolve(lib)?;
            ok(jobs::queue_convert(lib, &ids, force)?)
        }
        ("POST", ["jobs", _, "cancel"]) => {
            jobs::cancel(lib, id(1).unwrap_or(-1))?;
            ok(json!({}))
        }
        ("POST", ["jobs", _, "retry"]) => {
            jobs::retry(lib, id(1).unwrap_or(-1))?;
            ok(json!({}))
        }
        ("GET", ["jobs", _, "log"]) => ok(json!({ "log": jobs::job_log(lib, id(1).unwrap_or(-1))? })),
        ("POST", ["jobs", "clear"]) => ok(json!({ "cleared": jobs::clear_finished(lib)? })),
        ("POST", ["queue", "pause"]) => {
            lib.jobs.paused.store(true, Ordering::SeqCst);
            ok(json!({ "paused": true }))
        }
        ("POST", ["queue", "resume"]) => {
            lib.jobs.paused.store(false, Ordering::SeqCst);
            lib.jobs.wake();
            ok(json!({ "paused": false }))
        }
        ("GET", ["extractors"]) => ok(json!({ "extractors": lib.extractors(), "file": crate::extractors::installed_file(&lib.data_dir) })),
        ("POST", ["extractors", "reload"]) => {
            lib.reload_extractors()?;
            ok(json!({ "extractors": lib.extractors() }))
        }
        ("GET", ["levels"]) => levels(lib),
        ("POST", ["maps", "status"]) => {
            #[derive(Deserialize, Default)]
            #[serde(default)]
            struct S {
                extractor: Option<String>,
            }
            let s: S = body(req)?;
            let mut out = Vec::new();
            for x in lib.extractors().iter().filter(|x| x.installed && x.maps && s.extractor.as_deref().is_none_or(|e| e == x.id)) {
                match jobs::map_status(lib, x) {
                    Ok(_) => out.push(json!({ "extractor": x.id, "ok": true })),
                    Err(e) => out.push(json!({ "extractor": x.id, "error": format!("{e:#}") })),
                }
            }
            ok(json!({ "checked": out }))
        }
        ("POST", ["extract"]) => {
            #[derive(Deserialize, Default)]
            #[serde(default)]
            struct E {
                extractor: String,
                game: Option<String>,
                maps: Vec<String>,
            }
            let e: E = body(req)?;
            ok(json!({ "job": jobs::queue_extract(lib, &e.extractor, e.game.as_deref(), &e.maps)? }))
        }
        ("GET", ["settings"]) => ok(json!({ "settings": lib.settings(), "levels": lib.levels_dir(), "dataDir": lib.data_dir, "catalogue": lib.db_path, "jobLimit": jobs::job_limit(lib.settings().max_jobs) })),
        ("PUT", ["settings"]) | ("POST", ["settings"]) => {
            let s: Settings = body(req)?;
            lib.set_settings(s)?;
            ok(json!({ "settings": lib.settings() }))
        }
        ("POST", ["move"]) => {
            let ids: Ids = body(req)?;
            ok(lib.move_into_library(&ids.resolve(lib)?)?)
        }
        ("POST", ["links"]) => {
            #[derive(Deserialize, Default)]
            #[serde(default)]
            struct L {
                ids: Vec<i64>,
                kind: String,
                label: String,
                target: String,
            }
            let l: L = body(req)?;
            if !matches!(l.kind.as_str(), "session" | "analysis" | "note" | "shared") {
                return Err(anyhow!("unknown link kind"));
            }
            db::add_link(&*lib.writer()?, &l.ids, &l.kind, &l.label.chars().take(200).collect::<String>(), &l.target.chars().take(2000).collect::<String>())?;
            ok(json!({}))
        }
        _ => not_found(),
    }
}

fn status(lib: &Library) -> Result<Answer> {
    let c = lib.reader()?;
    let (items, missing, bytes): (i64, i64, Option<i64>) = c.query_row("SELECT count(*), sum(missing), sum(size) FROM items", [], |r| Ok((r.get(0)?, r.get::<_, Option<i64>>(1)?.unwrap_or(0), r.get(2)?)))?;
    let roots: i64 = c.query_row("SELECT count(*) FROM roots", [], |r| r.get(0))?;
    let outdated: i64 = c.query_row("SELECT count(*) FROM items WHERE conv = 'outdated'", [], |r| r.get(0))?;
    let unconverted: i64 = c.query_row("SELECT count(*) FROM items WHERE conv = 'none' AND missing = 0", [], |r| r.get(0))?;
    let jobs: (i64, i64, i64) = c.query_row(
        "SELECT sum(state = 'queued'), sum(state = 'running'), sum(state = 'failed') FROM jobs",
        [],
        |r| Ok((r.get::<_, Option<i64>>(0)?.unwrap_or(0), r.get::<_, Option<i64>>(1)?.unwrap_or(0), r.get::<_, Option<i64>>(2)?.unwrap_or(0))),
    )?;
    ok(json!({
        "items": items, "missing": missing, "bytes": bytes.unwrap_or(0), "roots": roots, "outdated": outdated, "unconverted": unconverted,
        "jobs": { "queued": jobs.0, "running": jobs.1, "failed": jobs.2, "paused": lib.jobs.paused.load(Ordering::SeqCst) },
        "scan": lib.progress(), "thumbToken": lib.thumb_token, "version": env!("CARGO_PKG_VERSION"),
    }))
}

/// Folders on this machine worth adding, that are there and not added yet: the
/// levels and conversion folders, the Watcher's sessions, Tacview's recordings,
/// and the replay folders of games in the Steam libraries.
fn suggest(lib: &Library) -> Result<Vec<Value>> {
    let home = std::env::var_os("USERPROFILE").or_else(|| std::env::var_os("HOME")).map(PathBuf::from);
    let mut c: Vec<(PathBuf, String)> = vec![
        (lib.levels_dir(), "levels".into()),
        (lib.settings().output_dir, "converted".into()),
        (lib.data_dir.join("Watcher").join("sessions"), "watcher".into()),
    ];
    if let Some(h) = &home {
        c.push((h.join("Documents").join("Tacview"), "tacview".into()));
    }
    // Steam's libraries: `libraryfolders.vdf` names each one's folder.
    let mut steam: Vec<PathBuf> = Vec::new();
    for base in [std::env::var_os("ProgramFiles(x86)").map(|p| PathBuf::from(p).join("Steam")), home.as_ref().map(|h| h.join(".local/share/Steam")), home.as_ref().map(|h| h.join(".steam/steam"))].into_iter().flatten() {
        if let Ok(text) = std::fs::read_to_string(base.join("steamapps").join("libraryfolders.vdf")) {
            for line in text.lines() {
                let l = line.trim();
                if let Some(rest) = l.strip_prefix("\"path\"") {
                    let p = rest.trim().trim_matches('"').replace("\\\\", "\\");
                    steam.push(PathBuf::from(p));
                }
            }
            steam.push(base);
        }
    }
    steam.sort();
    steam.dedup();
    for lib_dir in &steam {
        let common = lib_dir.join("steamapps").join("common");
        for (game, sub, what) in [
            ("War Thunder", "Replays", "warthunder"),
            ("dota 2 beta", "game/dota/replays", "dota2"),
            ("World of Warships", "replays", "wows"),
        ] {
            c.push((common.join(game).join(sub), what.into()));
        }
    }
    let have: Vec<String> = {
        let r = lib.reader()?;
        let mut st = r.prepare("SELECT path FROM roots")?;
        let v = st.query_map([], |r| r.get(0))?.collect::<rusqlite::Result<_>>()?;
        v
    };
    let mut out = Vec::new();
    for (p, what) in c {
        let s = p.to_string_lossy().into_owned();
        if p.is_dir() && !have.iter().any(|h| h.eq_ignore_ascii_case(&s)) && !out.iter().any(|v: &Value| v["path"] == s) {
            out.push(json!({ "path": s, "what": what }));
        }
    }
    Ok(out)
}

fn roots(lib: &Library) -> Result<Answer> {
    let c = lib.reader()?;
    let mut st = c.prepare("SELECT r.id, r.path, r.watch, r.added, r.last_scan, r.scan_ms, r.online, r.files, (SELECT count(*) FROM items WHERE root = r.id AND missing = 0) FROM roots r ORDER BY r.path")?;
    let rows: Vec<Value> = st
        .query_map([], |r| {
            Ok(json!({
                "id": r.get::<_, i64>(0)?, "path": r.get::<_, String>(1)?, "watch": r.get::<_, i64>(2)? != 0, "added": r.get::<_, i64>(3)?, "lastScan": r.get::<_, Option<i64>>(4)?,
                "scanMs": r.get::<_, Option<i64>>(5)?, "online": r.get::<_, i64>(6)? != 0, "files": r.get::<_, i64>(7)?, "items": r.get::<_, i64>(8)?,
            }))
        })?
        .collect::<rusqlite::Result<_>>()?;
    // Reachable now? (A drive unplugged since the last scan.)
    let rows: Vec<Value> = rows
        .into_iter()
        .map(|mut r| {
            let here = r["path"].as_str().map(|p| std::path::Path::new(p).is_dir()).unwrap_or(false);
            r["reachable"] = json!(here);
            r
        })
        .collect();
    ok(Value::Array(rows))
}

/// Levels and model packs by game, which replays use which level, the maps
/// matches are played on that no level is there for, and each map
/// extractor's last `status --json` (new, changed, outdated maps).
fn levels(lib: &Library) -> Result<Answer> {
    let c = lib.reader()?;
    let mut st = c.prepare(
        "SELECT l.id, l.kind, l.game, l.map, l.name, l.size, l.sha256, l.converter, l.game_version, l.has_thumb, l.missing, l.path, l.mtime,
           (SELECT count(*) FROM items u WHERE u.kind IN ('match', 'replay', 'recording', 'session') AND u.game = l.game AND u.map = l.map COLLATE NOCASE AND u.missing = 0)
         FROM items l WHERE l.kind IN ('level', 'models') ORDER BY l.game, l.map COLLATE NOCASE",
    )?;
    let levels: Vec<Value> = st
        .query_map([], |r| {
            Ok(json!({
                "id": r.get::<_, i64>(0)?, "kind": r.get::<_, String>(1)?, "game": r.get::<_, Option<String>>(2)?, "map": r.get::<_, Option<String>>(3)?, "name": r.get::<_, String>(4)?,
                "size": r.get::<_, i64>(5)?, "sha256": r.get::<_, Option<String>>(6)?, "extractor": r.get::<_, Option<String>>(7)?, "gameVersion": r.get::<_, Option<String>>(8)?,
                "thumb": r.get::<_, i64>(9)? != 0, "missing": r.get::<_, i64>(10)? != 0, "path": r.get::<_, String>(11)?, "mtime": r.get::<_, i64>(12)?, "uses": r.get::<_, i64>(13)?,
            }))
        })?
        .collect::<rusqlite::Result<_>>()?;
    let mut st = c.prepare(
        "SELECT u.game, u.map, count(*) n FROM items u WHERE u.kind IN ('match', 'replay', 'recording') AND u.missing = 0 AND u.game IS NOT NULL AND u.map IS NOT NULL AND u.map <> ''
           AND NOT EXISTS (SELECT 1 FROM items l WHERE l.kind = 'level' AND l.game = u.game AND l.map = u.map COLLATE NOCASE)
         GROUP BY u.game, u.map ORDER BY n DESC LIMIT 1000",
    )?;
    let without: Vec<Value> = st.query_map([], |r| Ok(json!({ "game": r.get::<_, String>(0)?, "map": r.get::<_, String>(1)?, "uses": r.get::<_, i64>(2)? })))?.collect::<rusqlite::Result<_>>()?;
    let mut st = c.prepare("SELECT extractor, json, checked FROM map_status")?;
    let statuses: Vec<(String, String, i64)> = st.query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))?.collect::<rusqlite::Result<_>>()?;
    let all = lib.extractors();
    let extractors: Vec<Value> = all
        .iter()
        .filter(|x| x.maps)
        .map(|x| {
            let st = statuses.iter().find(|s| s.0 == x.id);
            let maps = st.and_then(|s| serde_json::from_str::<Value>(&s.1).ok()).map(|v| jobs::status_maps(&v)).unwrap_or_default();
            let count = |k: &str| maps.iter().filter(|m| m.1 == k).count();
            json!({
                "id": x.id, "name": x.name, "games": x.games, "installed": x.installed, "version": x.version, "checked": st.map(|s| s.2),
                "new": count("new"), "changed": count("changed"), "outdated": count("outdated"),
                "maps": maps.iter().filter(|m| m.1 != "current").map(|m| json!({ "id": m.0, "state": m.1, "game": m.2, "name": m.3 })).collect::<Vec<_>>(),
            })
        })
        .collect();
    ok(json!({ "levels": levels, "withoutLevel": without, "extractors": extractors, "levelsDir": lib.levels_dir() }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn query_strings() {
        let p = parse_query("game=cs2&game=war%20thunder&q=a+b&x");
        assert_eq!(p[1], ("game".into(), "war thunder".into()));
        assert_eq!(p[2], ("q".into(), "a b".into()));
        assert_eq!(p[3], ("x".into(), "".into()));
        assert_eq!(decode("100%"), "100%");
    }
}
