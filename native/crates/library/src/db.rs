//! The catalogue: one SQLite file, local only. Items reference files where
//! they lie; nothing is copied or moved unless the user asks. Filtering,
//! facets, search and sorting run in SQL with indexes, so 100k+ items answer
//! in milliseconds.

use std::path::Path;

use anyhow::{Context, Result};
use rusqlite::types::Value as Sql;
use rusqlite::{params, params_from_iter, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::meta::Meta;

pub const SCHEMA_VERSION: i64 = 1;
/// Bumped when the level reader names levels differently: the catalogue's levels are then read again.
const LEVELS_READ: &str = "2";

const SCHEMA: &str = r#"
CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS roots (
  id INTEGER PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  watch INTEGER NOT NULL DEFAULT 1,
  added INTEGER NOT NULL,
  last_scan INTEGER,
  scan_ms INTEGER,
  online INTEGER NOT NULL DEFAULT 1,
  files INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  root INTEGER REFERENCES roots(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  format TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  game TEXT,
  map TEXT,
  mode TEXT,
  started INTEGER,
  duration REAL,
  players INTEGER,
  teams TEXT,
  outcome TEXT,
  game_version TEXT,
  converter TEXT,
  converter_version TEXT,
  match_id TEXT,
  stem TEXT,
  source_name TEXT,
  extra TEXT,
  size INTEGER NOT NULL,
  mtime INTEGER NOT NULL,
  qhash TEXT,
  sha256 TEXT,
  has_thumb INTEGER NOT NULL DEFAULT 0,
  deep INTEGER NOT NULL DEFAULT 0,
  rating INTEGER NOT NULL DEFAULT 0,
  flag INTEGER NOT NULL DEFAULT 0,
  label TEXT,
  note TEXT,
  missing INTEGER NOT NULL DEFAULT 0,
  added INTEGER NOT NULL,
  scanned INTEGER NOT NULL,
  error TEXT,
  source INTEGER REFERENCES items(id) ON DELETE SET NULL,
  conv TEXT
);
CREATE INDEX IF NOT EXISTS items_game ON items(game, map);
CREATE INDEX IF NOT EXISTS items_map ON items(map);
CREATE INDEX IF NOT EXISTS items_started ON items(started);
CREATE INDEX IF NOT EXISTS items_kind ON items(kind);
CREATE INDEX IF NOT EXISTS items_qhash ON items(qhash);
CREATE INDEX IF NOT EXISTS items_sha ON items(sha256);
CREATE INDEX IF NOT EXISTS items_source ON items(source);
CREATE INDEX IF NOT EXISTS items_root ON items(root);
CREATE INDEX IF NOT EXISTS items_match ON items(match_id);
CREATE INDEX IF NOT EXISTS items_stem ON items(stem);
CREATE INDEX IF NOT EXISTS items_name ON items(name);
CREATE INDEX IF NOT EXISTS items_added ON items(added);
CREATE TABLE IF NOT EXISTS players (item INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE, name TEXT NOT NULL, PRIMARY KEY (item, name)) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS players_name ON players(name);
CREATE TABLE IF NOT EXISTS thumbs (item INTEGER PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE, png BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL COLLATE NOCASE);
CREATE TABLE IF NOT EXISTS item_tags (item INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE, tag INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY (item, tag)) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS item_tags_tag ON item_tags(tag);
CREATE TABLE IF NOT EXISTS collections (id INTEGER PRIMARY KEY, name TEXT NOT NULL, smart INTEGER NOT NULL DEFAULT 0, query TEXT, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS collection_items (collection INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE, item INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE, added INTEGER NOT NULL, PRIMARY KEY (collection, item)) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS collection_items_item ON collection_items(item);
CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY, item INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE, kind TEXT NOT NULL, label TEXT, target TEXT, created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS links_item ON links(item);
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL,
  item INTEGER REFERENCES items(id) ON DELETE SET NULL,
  extractor TEXT NOT NULL,
  extractor_version TEXT,
  game TEXT,
  label TEXT,
  args TEXT,
  state TEXT NOT NULL,
  progress REAL,
  message TEXT,
  hint TEXT,
  log TEXT,
  outputs TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created INTEGER NOT NULL,
  started INTEGER,
  finished INTEGER
);
CREATE INDEX IF NOT EXISTS jobs_state ON jobs(state);
CREATE INDEX IF NOT EXISTS jobs_item ON jobs(item);
CREATE TABLE IF NOT EXISTS map_status (extractor TEXT PRIMARY KEY, json TEXT NOT NULL, checked INTEGER NOT NULL);
CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(text, tokenize = 'unicode61 remove_diacritics 2');
"#;

pub fn now_ms() -> i64 {
    std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis() as i64).unwrap_or(0)
}

/// Opens (and creates or migrates) the catalogue.
pub fn open(path: &Path) -> Result<Connection> {
    if let Some(dir) = path.parent() {
        std::fs::create_dir_all(dir).ok();
    }
    let c = Connection::open(path).with_context(|| format!("opening the catalogue {}", path.display()))?;
    c.busy_timeout(std::time::Duration::from_secs(10))?;
    c.execute_batch("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON; PRAGMA temp_store = MEMORY; PRAGMA cache_size = -65536;")?;
    c.execute_batch(SCHEMA)?;
    c.execute("INSERT INTO kv(key, value) VALUES ('schema', ?1) ON CONFLICT(key) DO NOTHING", params![SCHEMA_VERSION.to_string()])?;
    // Levels read before their map was the game's own name (a DCS region is its
    // theatre's, `meta::read_level`) are read again by the next scan: they are few.
    if kv_get(&c, "levels-read").as_deref() != Some(LEVELS_READ) {
        c.execute("UPDATE items SET mtime = 0 WHERE kind = 'level'", [])?;
        kv_set(&c, "levels-read", LEVELS_READ)?;
    }
    Ok(c)
}

pub fn kv_get(c: &Connection, key: &str) -> Option<String> {
    c.query_row("SELECT value FROM kv WHERE key = ?1", params![key], |r| r.get(0)).optional().ok().flatten()
}

pub fn kv_set(c: &Connection, key: &str, value: &str) -> Result<()> {
    c.execute("INSERT INTO kv(key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value", params![key, value])?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Writing items
// ---------------------------------------------------------------------------

/// A scanned file, ready to be written.
pub struct Scanned {
    pub path: String,
    pub root: Option<i64>,
    pub kind: &'static str,
    pub format: &'static str,
    pub name: String,
    pub size: i64,
    pub mtime: i64,
    pub qhash: Option<String>,
    pub sha256: Option<String>,
    pub meta: Meta,
    pub thumb: Option<Vec<u8>>,
    pub error: Option<String>,
}

/// Writes (inserts or updates) scanned items, keeping what the user set (rating, tags, notes).
pub fn upsert(c: &mut Connection, batch: &[Scanned]) -> Result<Vec<i64>> {
    let tx = c.transaction()?;
    let now = now_ms();
    let mut ids = Vec::with_capacity(batch.len());
    {
        let mut up = tx.prepare_cached(
            "INSERT INTO items (path, root, kind, format, name, title, game, map, mode, started, duration, players, teams, outcome, game_version, converter, converter_version, match_id, extra, size, mtime, qhash, sha256, has_thumb, deep, missing, added, scanned, error, stem, source_name)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, 0, ?26, ?26, ?27, ?28, ?29)
             ON CONFLICT(path) DO UPDATE SET root = excluded.root, kind = excluded.kind, format = excluded.format, name = excluded.name, title = excluded.title, game = excluded.game, map = excluded.map, mode = excluded.mode,
               started = excluded.started, duration = excluded.duration, players = excluded.players, teams = excluded.teams, outcome = excluded.outcome, game_version = excluded.game_version,
               converter = excluded.converter, converter_version = excluded.converter_version, match_id = excluded.match_id, extra = excluded.extra, size = excluded.size, mtime = excluded.mtime,
               qhash = excluded.qhash, sha256 = COALESCE(excluded.sha256, CASE WHEN items.size = excluded.size AND items.mtime = excluded.mtime THEN items.sha256 END),
               has_thumb = excluded.has_thumb, deep = excluded.deep, missing = 0, scanned = excluded.scanned, error = excluded.error, stem = excluded.stem, source_name = excluded.source_name
             RETURNING id",
        )?;
        let mut del_players = tx.prepare_cached("DELETE FROM players WHERE item = ?1")?;
        let mut add_player = tx.prepare_cached("INSERT OR IGNORE INTO players(item, name) VALUES (?1, ?2)")?;
        let mut thumb = tx.prepare_cached("INSERT INTO thumbs(item, png) VALUES (?1, ?2) ON CONFLICT(item) DO UPDATE SET png = excluded.png")?;
        let mut del_thumb = tx.prepare_cached("DELETE FROM thumbs WHERE item = ?1")?;
        for s in batch {
            let m = &s.meta;
            let teams = (!m.teams.is_empty()).then(|| serde_json::to_string(&m.teams).unwrap());
            let extra = (!m.extra.is_null()).then(|| m.extra.to_string());
            let id: i64 = up.query_row(
                params![
                    s.path, s.root, s.kind, s.format, s.name, m.title, m.game, m.map, m.mode, m.started, m.duration, m.players, teams, m.outcome, m.game_version, m.converter, m.converter_version, m.match_id, extra, s.size,
                    s.mtime, s.qhash, s.sha256, s.thumb.is_some() as i64, m.deep as i64, now, s.error, crate::meta::display_stem(std::path::Path::new(&s.path)), m.source_name
                ],
                |r| r.get(0),
            )?;
            del_players.execute(params![id])?;
            for n in &m.player_names {
                add_player.execute(params![id, n])?;
            }
            match &s.thumb {
                Some(png) => thumb.execute(params![id, png])?,
                None => del_thumb.execute(params![id])?,
            };
            ids.push(id);
        }
    }
    for id in &ids {
        reindex_tx(&tx, *id)?;
    }
    tx.commit()?;
    Ok(ids)
}

/// The search text of an item: its names, map, game, mode, players, tags, note.
fn reindex_tx(c: &Connection, id: i64) -> Result<()> {
    let text: Option<String> = c
        .query_row(
            "SELECT coalesce(i.title,'') || ' ' || i.name || ' ' || coalesce(i.map,'') || ' ' || coalesce(i.game,'') || ' ' || coalesce(i.mode,'') || ' ' || coalesce(i.outcome,'') || ' ' || coalesce(i.note,'') || ' ' ||
                    coalesce((SELECT group_concat(name, ' ') FROM players WHERE item = i.id), '') || ' ' ||
                    coalesce((SELECT group_concat(t.name, ' ') FROM item_tags it JOIN tags t ON t.id = it.tag WHERE it.item = i.id), '')
             FROM items i WHERE i.id = ?1",
            params![id],
            |r| r.get(0),
        )
        .optional()?;
    c.execute("DELETE FROM items_fts WHERE rowid = ?1", params![id])?;
    if let Some(t) = text {
        c.execute("INSERT INTO items_fts(rowid, text) VALUES (?1, ?2)", params![id, t])?;
    }
    Ok(())
}

pub fn reindex(c: &Connection, ids: &[i64]) -> Result<()> {
    for id in ids {
        reindex_tx(c, *id)?;
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Querying
// ---------------------------------------------------------------------------

/// A filter: every field narrows; lists are "any of". Also what a smart collection keeps.
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq)]
#[serde(default, rename_all = "camelCase")]
pub struct Filter {
    pub q: String,
    pub game: Vec<String>,
    pub map: Vec<String>,
    pub mode: Vec<String>,
    pub outcome: Vec<String>,
    pub kind: Vec<String>,
    pub format: Vec<String>,
    pub tag: Vec<String>,
    pub player: Vec<String>,
    pub converter: Vec<String>,
    pub year: Vec<String>,
    /// `none`, `current`, `outdated`, `failed`, `na` (nothing to convert).
    pub conv: Vec<String>,
    pub rating: Option<i64>,
    pub flag: Option<i64>,
    pub from: Option<i64>,
    pub to: Option<i64>,
    pub collection: Option<i64>,
    pub root: Option<i64>,
    pub missing: Option<bool>,
    pub dupes: Option<bool>,
}

/// One dimension of the filter, so facets can leave their own out.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Dim {
    Game,
    Map,
    Mode,
    Outcome,
    Kind,
    Format,
    Tag,
    Player,
    Converter,
    Year,
    Conv,
    Rating,
    Flag,
    None,
}

impl Filter {
    /// Parses `a=b&a=c&rating=3` (the URL's query).
    pub fn from_query(pairs: &[(String, String)]) -> Self {
        let mut f = Filter::default();
        for (k, v) in pairs {
            let list = match k.as_str() {
                "game" => Some(&mut f.game),
                "map" => Some(&mut f.map),
                "mode" => Some(&mut f.mode),
                "outcome" => Some(&mut f.outcome),
                "kind" => Some(&mut f.kind),
                "format" => Some(&mut f.format),
                "tag" => Some(&mut f.tag),
                "player" => Some(&mut f.player),
                "converter" => Some(&mut f.converter),
                "year" => Some(&mut f.year),
                "conv" => Some(&mut f.conv),
                _ => None,
            };
            if let Some(l) = list {
                l.push(v.clone());
                continue;
            }
            match k.as_str() {
                "q" => f.q = v.clone(),
                "rating" => f.rating = v.parse().ok(),
                "flag" => f.flag = v.parse().ok(),
                "from" => f.from = v.parse().ok(),
                "to" => f.to = v.parse().ok(),
                "collection" => f.collection = v.parse().ok(),
                "root" => f.root = v.parse().ok(),
                "missing" => f.missing = Some(v == "1" || v == "true"),
                "dupes" => f.dupes = Some(v == "1" || v == "true"),
                _ => {}
            }
        }
        f
    }

    /// The SQL condition over `items i`, and its parameters; `skip` leaves one dimension out.
    pub fn sql(&self, c: &Connection, skip: Dim) -> Result<(String, Vec<Sql>)> {
        let mut w: Vec<String> = Vec::new();
        let mut p: Vec<Sql> = Vec::new();
        let any_of = |w: &mut Vec<String>, p: &mut Vec<Sql>, col: &str, vals: &[String]| {
            if vals.is_empty() {
                return;
            }
            let (blank, named): (Vec<&String>, Vec<&String>) = vals.iter().partition(|v| v.is_empty());
            let mut ors = Vec::new();
            if !named.is_empty() {
                ors.push(format!("{col} IN ({})", vec!["?"; named.len()].join(",")));
                p.extend(named.into_iter().map(|v| Sql::Text(v.clone())));
            }
            if !blank.is_empty() {
                ors.push(format!("({col} IS NULL OR {col} = '')"));
            }
            w.push(format!("({})", ors.join(" OR ")));
        };
        if skip != Dim::Game {
            any_of(&mut w, &mut p, "i.game", &self.game);
        }
        if skip != Dim::Map {
            any_of(&mut w, &mut p, "i.map", &self.map);
        }
        if skip != Dim::Mode {
            any_of(&mut w, &mut p, "i.mode", &self.mode);
        }
        if skip != Dim::Outcome {
            any_of(&mut w, &mut p, "i.outcome", &self.outcome);
        }
        if skip != Dim::Kind {
            any_of(&mut w, &mut p, "i.kind", &self.kind);
        }
        if skip != Dim::Format {
            any_of(&mut w, &mut p, "i.format", &self.format);
        }
        if skip != Dim::Converter {
            any_of(&mut w, &mut p, "(i.converter || ' ' || coalesce(i.converter_version, ''))", &self.converter);
        }
        if skip != Dim::Year {
            any_of(&mut w, &mut p, "strftime('%Y', i.started / 1000, 'unixepoch')", &self.year);
        }
        if skip != Dim::Conv && !self.conv.is_empty() {
            let vals: Vec<String> = self.conv.iter().map(|v| if v == "na" { String::new() } else { v.clone() }).collect();
            any_of(&mut w, &mut p, "i.conv", &vals);
        }
        if skip != Dim::Tag && !self.tag.is_empty() {
            w.push(format!("i.id IN (SELECT it.item FROM item_tags it JOIN tags t ON t.id = it.tag WHERE t.name IN ({}))", vec!["?"; self.tag.len()].join(",")));
            p.extend(self.tag.iter().map(|v| Sql::Text(v.clone())));
        }
        if skip != Dim::Player && !self.player.is_empty() {
            w.push(format!("i.id IN (SELECT item FROM players WHERE name IN ({}))", vec!["?"; self.player.len()].join(",")));
            p.extend(self.player.iter().map(|v| Sql::Text(v.clone())));
        }
        if skip != Dim::Rating {
            if let Some(r) = self.rating {
                w.push("i.rating >= ?".into());
                p.push(Sql::Integer(r));
            }
        }
        if skip != Dim::Flag {
            if let Some(f) = self.flag {
                w.push("i.flag = ?".into());
                p.push(Sql::Integer(f));
            }
        }
        if let Some(t) = self.from {
            w.push("i.started >= ?".into());
            p.push(Sql::Integer(t));
        }
        if let Some(t) = self.to {
            w.push("i.started < ?".into());
            p.push(Sql::Integer(t));
        }
        if let Some(r) = self.root {
            w.push("i.root = ?".into());
            p.push(Sql::Integer(r));
        }
        match self.missing {
            Some(true) => w.push("i.missing = 1".into()),
            Some(false) => w.push("i.missing = 0".into()),
            None => {}
        }
        if self.dupes == Some(true) {
            w.push("i.qhash IN (SELECT qhash FROM items WHERE qhash IS NOT NULL AND missing = 0 GROUP BY qhash HAVING count(*) > 1)".into());
        }
        if let Some(cid) = self.collection {
            let smart: Option<(i64, Option<String>)> = c.query_row("SELECT smart, query FROM collections WHERE id = ?1", params![cid], |r| Ok((r.get(0)?, r.get(1)?))).optional()?;
            match smart {
                Some((1, q)) => {
                    let inner: Filter = q.and_then(|q| serde_json::from_str(&q).ok()).unwrap_or_default();
                    // A smart collection is its saved filter; it never names itself.
                    let inner = Filter { collection: None, ..inner };
                    let (s, ip) = inner.sql(c, Dim::None)?;
                    w.push(format!("({s})"));
                    p.extend(ip);
                }
                _ => {
                    w.push("i.id IN (SELECT item FROM collection_items WHERE collection = ?)".into());
                    p.push(Sql::Integer(cid));
                }
            }
        }
        let q = self.q.trim();
        if !q.is_empty() {
            let terms: Vec<String> = q.split_whitespace().map(|t| t.chars().filter(|c| c.is_alphanumeric() || *c == '_' || *c == '-').collect::<String>()).filter(|t| !t.is_empty()).map(|t| format!("\"{}\"*", t.replace('"', ""))).collect();
            if !terms.is_empty() {
                w.push("i.id IN (SELECT rowid FROM items_fts WHERE items_fts MATCH ?)".into());
                p.push(Sql::Text(terms.join(" AND ")));
            }
        }
        if w.is_empty() {
            w.push("1".into());
        }
        Ok((w.join(" AND "), p))
    }
}

/// An item in a listing: what a grid cell or a list row shows.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Row {
    pub id: i64,
    pub kind: String,
    pub format: String,
    pub name: String,
    pub title: Option<String>,
    pub game: Option<String>,
    pub map: Option<String>,
    pub mode: Option<String>,
    pub started: Option<i64>,
    pub duration: Option<f64>,
    pub players: Option<i64>,
    pub outcome: Option<String>,
    pub size: i64,
    pub thumb: bool,
    pub rating: i64,
    pub flag: i64,
    pub label: Option<String>,
    pub missing: bool,
    pub conv: Option<String>,
    pub converter: Option<String>,
    pub converter_version: Option<String>,
}

const ROW_COLS: &str = "i.id, i.kind, i.format, i.name, i.title, i.game, i.map, i.mode, i.started, i.duration, i.players, i.outcome, i.size, i.has_thumb, i.rating, i.flag, i.label, i.missing, i.conv, i.converter, i.converter_version";

fn row(r: &rusqlite::Row) -> rusqlite::Result<Row> {
    Ok(Row {
        id: r.get(0)?,
        kind: r.get(1)?,
        format: r.get(2)?,
        name: r.get(3)?,
        title: r.get(4)?,
        game: r.get(5)?,
        map: r.get(6)?,
        mode: r.get(7)?,
        started: r.get(8)?,
        duration: r.get(9)?,
        players: r.get(10)?,
        outcome: r.get(11)?,
        size: r.get(12)?,
        thumb: r.get::<_, i64>(13)? != 0,
        rating: r.get(14)?,
        flag: r.get(15)?,
        label: r.get(16)?,
        missing: r.get::<_, i64>(17)? != 0,
        conv: r.get(18)?,
        converter: r.get(19)?,
        converter_version: r.get(20)?,
    })
}

/// The order of a listing: a column and a direction; ties by id.
pub fn order_by(sort: &str, desc: bool) -> String {
    let col = match sort {
        "name" => "coalesce(i.title, i.name) COLLATE NOCASE",
        "size" => "i.size",
        "duration" => "i.duration",
        "rating" => "i.rating",
        "map" => "i.map COLLATE NOCASE",
        "game" => "i.game",
        "added" => "i.added",
        "players" => "i.players",
        // Undated items (levels, packs) after every dated match, by their file time.
        _ => "i.started",
    };
    let dir = if desc { "DESC" } else { "ASC" };
    format!("{col} {dir} NULLS LAST, i.mtime {dir}, i.id {dir}")
}

/// A page of items and the total count.
pub fn list(c: &Connection, f: &Filter, sort: &str, desc: bool, offset: i64, limit: i64) -> Result<(i64, Vec<Row>)> {
    let (w, p) = f.sql(c, Dim::None)?;
    let total: i64 = c.query_row(&format!("SELECT count(*) FROM items i WHERE {w}"), params_from_iter(p.iter()), |r| r.get(0))?;
    let sql = format!("SELECT {ROW_COLS} FROM items i WHERE {w} ORDER BY {} LIMIT {} OFFSET {}", order_by(sort, desc), limit.clamp(1, 5000), offset.max(0));
    let mut st = c.prepare(&sql)?;
    let rows = st.query_map(params_from_iter(p.iter()), row)?.collect::<rusqlite::Result<Vec<_>>>()?;
    Ok((total, rows))
}

/// Every id the filter matches, in order (for "select all", "open all", "convert all").
pub fn ids(c: &Connection, f: &Filter, sort: &str, desc: bool) -> Result<Vec<i64>> {
    let (w, p) = f.sql(c, Dim::None)?;
    let mut st = c.prepare(&format!("SELECT i.id FROM items i WHERE {w} ORDER BY {}", order_by(sort, desc)))?;
    let out = st.query_map(params_from_iter(p.iter()), |r| r.get(0))?.collect::<rusqlite::Result<Vec<i64>>>()?;
    Ok(out)
}

pub fn rows_by_id(c: &Connection, ids: &[i64]) -> Result<Vec<Row>> {
    let mut out = Vec::new();
    for chunk in ids.chunks(500) {
        let sql = format!("SELECT {ROW_COLS} FROM items i WHERE i.id IN ({})", vec!["?"; chunk.len()].join(","));
        let mut st = c.prepare(&sql)?;
        out.extend(st.query_map(params_from_iter(chunk.iter()), row)?.collect::<rusqlite::Result<Vec<_>>>()?);
    }
    Ok(out)
}

/// Counts per value of each dimension, each over the filter without its own dimension.
pub fn facets(c: &Connection, f: &Filter) -> Result<Value> {
    let mut out = serde_json::Map::new();
    let dims: &[(&str, Dim, &str)] = &[
        ("game", Dim::Game, "i.game"),
        ("map", Dim::Map, "i.map"),
        ("mode", Dim::Mode, "i.mode"),
        ("outcome", Dim::Outcome, "i.outcome"),
        ("kind", Dim::Kind, "i.kind"),
        ("format", Dim::Format, "i.format"),
        ("converter", Dim::Converter, "CASE WHEN i.converter IS NULL THEN NULL ELSE i.converter || ' ' || coalesce(i.converter_version, '') END"),
        ("year", Dim::Year, "strftime('%Y', i.started / 1000, 'unixepoch')"),
        ("conv", Dim::Conv, "coalesce(i.conv, 'na')"),
        ("rating", Dim::Rating, "i.rating"),
        ("flag", Dim::Flag, "i.flag"),
    ];
    for (name, dim, expr) in dims {
        let (w, p) = f.sql(c, *dim)?;
        let limit = if *name == "map" { 400 } else { 100 };
        let mut st = c.prepare_cached(&format!("SELECT {expr} AS v, count(*) AS n FROM items i WHERE {w} GROUP BY v ORDER BY n DESC LIMIT {limit}"))?;
        let vals: Vec<Value> = st
            .query_map(params_from_iter(p.iter()), |r| {
                let v: Sql = r.get(0)?;
                let n: i64 = r.get(1)?;
                Ok(json!({ "v": match v { Sql::Text(s) => Value::String(s), Sql::Integer(i) => json!(i), Sql::Real(f) => json!(f), _ => Value::String(String::new()) }, "n": n }))
            })?
            .collect::<rusqlite::Result<_>>()?;
        out.insert((*name).into(), Value::Array(vals));
    }
    // Tags and players: through their tables.
    let (w, p) = f.sql(c, Dim::Tag)?;
    let mut st = c.prepare_cached(&format!("SELECT t.name, count(*) n FROM items i JOIN item_tags it ON it.item = i.id JOIN tags t ON t.id = it.tag WHERE {w} GROUP BY t.name ORDER BY n DESC LIMIT 200"))?;
    let tags: Vec<Value> = st.query_map(params_from_iter(p.iter()), |r| Ok(json!({ "v": r.get::<_, String>(0)?, "n": r.get::<_, i64>(1)? })))?.collect::<rusqlite::Result<_>>()?;
    out.insert("tag".into(), Value::Array(tags));
    let (w, p) = f.sql(c, Dim::Player)?;
    let mut st = c.prepare_cached(&format!("SELECT pl.name, count(*) n FROM items i JOIN players pl ON pl.item = i.id WHERE {w} GROUP BY pl.name ORDER BY n DESC LIMIT 60"))?;
    let players: Vec<Value> = st.query_map(params_from_iter(p.iter()), |r| Ok(json!({ "v": r.get::<_, String>(0)?, "n": r.get::<_, i64>(1)? })))?.collect::<rusqlite::Result<_>>()?;
    out.insert("player".into(), Value::Array(players));
    let (w, p) = f.sql(c, Dim::None)?;
    let (n, bytes, secs, lo, hi): (i64, Option<i64>, Option<f64>, Option<i64>, Option<i64>) =
        c.query_row(&format!("SELECT count(*), sum(size), sum(duration), min(started), max(started) FROM items i WHERE {w}"), params_from_iter(p.iter()), |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?)))?;
    out.insert("totals".into(), json!({ "items": n, "bytes": bytes.unwrap_or(0), "seconds": secs.unwrap_or(0.0), "from": lo, "to": hi }));
    Ok(Value::Object(out))
}

/// The whole record of one item, with its tags, collections, links, players and related items.
pub fn detail(c: &Connection, id: i64) -> Result<Option<Value>> {
    let base = c
        .query_row(
            "SELECT path, kind, format, name, title, game, map, mode, started, duration, players, teams, outcome, game_version, converter, converter_version, match_id, extra, size, mtime, qhash, sha256, rating, flag, label, note, missing, added, scanned, error, source, conv, has_thumb, root
             FROM items WHERE id = ?1",
            params![id],
            |r| {
                let teams: Option<String> = r.get(11)?;
                let extra: Option<String> = r.get(17)?;
                Ok(json!({
                    "id": id, "path": r.get::<_, String>(0)?, "kind": r.get::<_, String>(1)?, "format": r.get::<_, String>(2)?, "name": r.get::<_, String>(3)?,
                    "title": r.get::<_, Option<String>>(4)?, "game": r.get::<_, Option<String>>(5)?, "map": r.get::<_, Option<String>>(6)?, "mode": r.get::<_, Option<String>>(7)?,
                    "started": r.get::<_, Option<i64>>(8)?, "duration": r.get::<_, Option<f64>>(9)?, "players": r.get::<_, Option<i64>>(10)?,
                    "teams": teams.and_then(|t| serde_json::from_str::<Value>(&t).ok()), "outcome": r.get::<_, Option<String>>(12)?,
                    "gameVersion": r.get::<_, Option<String>>(13)?, "converter": r.get::<_, Option<String>>(14)?, "converterVersion": r.get::<_, Option<String>>(15)?,
                    "matchId": r.get::<_, Option<String>>(16)?, "extra": extra.and_then(|t| serde_json::from_str::<Value>(&t).ok()),
                    "size": r.get::<_, i64>(18)?, "mtime": r.get::<_, i64>(19)?, "qhash": r.get::<_, Option<String>>(20)?, "sha256": r.get::<_, Option<String>>(21)?,
                    "rating": r.get::<_, i64>(22)?, "flag": r.get::<_, i64>(23)?, "label": r.get::<_, Option<String>>(24)?, "note": r.get::<_, Option<String>>(25)?,
                    "missing": r.get::<_, i64>(26)? != 0, "added": r.get::<_, i64>(27)?, "scanned": r.get::<_, i64>(28)?, "error": r.get::<_, Option<String>>(29)?,
                    "source": r.get::<_, Option<i64>>(30)?, "conv": r.get::<_, Option<String>>(31)?, "thumb": r.get::<_, i64>(32)? != 0, "root": r.get::<_, Option<i64>>(33)?,
                }))
            },
        )
        .optional()?;
    let Some(mut d) = base else { return Ok(None) };
    let strings = |sql: &str| -> Result<Vec<String>> {
        let mut st = c.prepare(sql)?;
        let v = st.query_map(params![id], |r| r.get::<_, String>(0))?.collect::<rusqlite::Result<Vec<_>>>()?;
        Ok(v)
    };
    d["tags"] = json!(strings("SELECT t.name FROM item_tags it JOIN tags t ON t.id = it.tag WHERE it.item = ?1 ORDER BY t.name")?);
    d["playerNames"] = json!(strings("SELECT name FROM players WHERE item = ?1 ORDER BY name LIMIT 400")?);
    let mut st = c.prepare("SELECT c.id, c.name FROM collection_items ci JOIN collections c ON c.id = ci.collection WHERE ci.item = ?1")?;
    d["collections"] = Value::Array(st.query_map(params![id], |r| Ok(json!({ "id": r.get::<_, i64>(0)?, "name": r.get::<_, String>(1)? })))?.collect::<rusqlite::Result<_>>()?);
    let mut st = c.prepare("SELECT id, kind, label, target, created FROM links WHERE item = ?1 ORDER BY created DESC")?;
    d["links"] = Value::Array(
        st.query_map(params![id], |r| Ok(json!({ "id": r.get::<_, i64>(0)?, "kind": r.get::<_, String>(1)?, "label": r.get::<_, Option<String>>(2)?, "target": r.get::<_, Option<String>>(3)?, "created": r.get::<_, i64>(4)? })))?
            .collect::<rusqlite::Result<_>>()?,
    );
    // What it was converted into, and from.
    let mut st = c.prepare(&format!("SELECT {ROW_COLS} FROM items i WHERE i.source = ?1 ORDER BY i.mtime DESC"))?;
    d["outputs"] = serde_json::to_value(st.query_map(params![id], row)?.collect::<rusqlite::Result<Vec<_>>>()?)?;
    if let Some(src) = d["source"].as_i64() {
        d["sourceItem"] = serde_json::to_value(rows_by_id(c, &[src])?.pop())?;
    }
    // Copies: the same quick fingerprint elsewhere.
    if let Some(q) = d["qhash"].as_str() {
        let mut st = c.prepare("SELECT id, path FROM items WHERE qhash = ?1 AND id <> ?2 LIMIT 20")?;
        d["copies"] = Value::Array(st.query_map(params![q, id], |r| Ok(json!({ "id": r.get::<_, i64>(0)?, "path": r.get::<_, String>(1)? })))?.collect::<rusqlite::Result<_>>()?);
    }
    // The level it is played on.
    if let (Some(g), Some(m)) = (d["game"].as_str().map(str::to_owned), d["map"].as_str().map(str::to_owned)) {
        if d["kind"] != "level" {
            let lvl: Option<(i64, String)> = c
                .query_row("SELECT id, name FROM items WHERE kind = 'level' AND game = ?1 AND map = ?2 COLLATE NOCASE AND missing = 0 ORDER BY name COLLATE NOCASE LIMIT 1", params![g, m], |r| Ok((r.get(0)?, r.get(1)?)))
                .optional()?;
            d["level"] = lvl.map(|(i, n)| json!({ "id": i, "name": n })).unwrap_or(Value::Null);
        }
    }
    let mut st = c.prepare("SELECT id, kind, extractor, state, message, hint, progress, finished FROM jobs WHERE item = ?1 ORDER BY id DESC LIMIT 5")?;
    d["jobs"] = Value::Array(
        st.query_map(params![id], |r| {
            Ok(json!({ "id": r.get::<_, i64>(0)?, "kind": r.get::<_, String>(1)?, "extractor": r.get::<_, String>(2)?, "state": r.get::<_, String>(3)?, "message": r.get::<_, Option<String>>(4)?, "hint": r.get::<_, Option<String>>(5)?, "progress": r.get::<_, Option<f64>>(6)?, "finished": r.get::<_, Option<i64>>(7)? }))
        })?
        .collect::<rusqlite::Result<_>>()?,
    );
    Ok(Some(d))
}

// ---------------------------------------------------------------------------
// What the user sets
// ---------------------------------------------------------------------------

/// Changes to a selection: rating, flag, colour label, note, tags added or taken off.
#[derive(Debug, Default, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct Edit {
    pub ids: Vec<i64>,
    pub rating: Option<i64>,
    pub flag: Option<i64>,
    pub label: Option<Option<String>>,
    pub note: Option<Option<String>>,
    pub add_tags: Vec<String>,
    pub remove_tags: Vec<String>,
}

pub fn edit(c: &mut Connection, e: &Edit) -> Result<usize> {
    let tx = c.transaction()?;
    for id in &e.ids {
        if let Some(r) = e.rating {
            tx.execute("UPDATE items SET rating = ?1 WHERE id = ?2", params![r.clamp(0, 5), id])?;
        }
        if let Some(f) = e.flag {
            tx.execute("UPDATE items SET flag = ?1 WHERE id = ?2", params![f.clamp(-1, 1), id])?;
        }
        if let Some(l) = &e.label {
            tx.execute("UPDATE items SET label = ?1 WHERE id = ?2", params![l, id])?;
        }
        if let Some(n) = &e.note {
            tx.execute("UPDATE items SET note = ?1 WHERE id = ?2", params![n.as_deref().map(|s| s.chars().take(20_000).collect::<String>()), id])?;
        }
        for t in &e.add_tags {
            let t = t.trim();
            if t.is_empty() || t.len() > 80 {
                continue;
            }
            tx.execute("INSERT INTO tags(name) VALUES (?1) ON CONFLICT(name) DO NOTHING", params![t])?;
            tx.execute("INSERT OR IGNORE INTO item_tags(item, tag) SELECT ?1, id FROM tags WHERE name = ?2", params![id, t])?;
        }
        for t in &e.remove_tags {
            tx.execute("DELETE FROM item_tags WHERE item = ?1 AND tag = (SELECT id FROM tags WHERE name = ?2)", params![id, t])?;
        }
    }
    if !e.add_tags.is_empty() || !e.remove_tags.is_empty() || e.note.is_some() {
        reindex(&tx, &e.ids)?;
        tx.execute("DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag FROM item_tags)", [])?;
    }
    tx.commit()?;
    Ok(e.ids.len())
}

pub fn collections(c: &Connection) -> Result<Value> {
    let mut st = c.prepare("SELECT c.id, c.name, c.smart, c.query, c.created, (SELECT count(*) FROM collection_items WHERE collection = c.id) FROM collections c ORDER BY c.smart, c.name COLLATE NOCASE")?;
    let mut out = Vec::new();
    let rows: Vec<(i64, String, i64, Option<String>, i64, i64)> = st.query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?, r.get(5)?)))?.collect::<rusqlite::Result<_>>()?;
    for (id, name, smart, query, created, n) in rows {
        let count = if smart == 1 {
            let f = Filter { collection: Some(id), ..Default::default() };
            let (w, p) = f.sql(c, Dim::None)?;
            c.query_row(&format!("SELECT count(*) FROM items i WHERE {w}"), params_from_iter(p.iter()), |r| r.get::<_, i64>(0))?
        } else {
            n
        };
        out.push(json!({ "id": id, "name": name, "smart": smart == 1, "query": query.and_then(|q| serde_json::from_str::<Value>(&q).ok()), "created": created, "count": count }));
    }
    Ok(Value::Array(out))
}

pub fn create_collection(c: &Connection, name: &str, smart: Option<&Filter>, items: &[i64]) -> Result<i64> {
    let name: String = name.trim().chars().take(120).collect();
    let name = if name.is_empty() { "Collection".to_owned() } else { name };
    c.execute(
        "INSERT INTO collections(name, smart, query, created) VALUES (?1, ?2, ?3, ?4)",
        params![name, smart.is_some() as i64, smart.map(|f| serde_json::to_string(&Filter { collection: None, ..f.clone() }).unwrap()), now_ms()],
    )?;
    let id = c.last_insert_rowid();
    collection_add(c, id, items)?;
    Ok(id)
}

pub fn collection_add(c: &Connection, id: i64, items: &[i64]) -> Result<()> {
    let now = now_ms();
    let mut st = c.prepare_cached("INSERT OR IGNORE INTO collection_items(collection, item, added) VALUES (?1, ?2, ?3)")?;
    for i in items {
        st.execute(params![id, i, now])?;
    }
    Ok(())
}

pub fn collection_remove(c: &Connection, id: i64, items: &[i64]) -> Result<()> {
    let mut st = c.prepare_cached("DELETE FROM collection_items WHERE collection = ?1 AND item = ?2")?;
    for i in items {
        st.execute(params![id, i])?;
    }
    Ok(())
}

/// Groups of copies: the same quick fingerprint (and the same full hash where both are known).
pub fn duplicates(c: &Connection, limit: i64) -> Result<Value> {
    let mut st = c.prepare(
        "SELECT qhash, count(*) n, max(size) FROM items WHERE qhash IS NOT NULL AND missing = 0 GROUP BY qhash HAVING n > 1 ORDER BY max(size) * (n - 1) DESC LIMIT ?1",
    )?;
    let groups: Vec<(String, i64, i64)> = st.query_map(params![limit], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))?.collect::<rusqlite::Result<_>>()?;
    let mut out = Vec::new();
    let mut wasted = 0i64;
    for (q, n, size) in groups {
        let mut st = c.prepare_cached("SELECT id, path, sha256, mtime FROM items WHERE qhash = ?1 AND missing = 0 ORDER BY mtime")?;
        let items: Vec<Value> = st.query_map(params![q], |r| Ok(json!({ "id": r.get::<_, i64>(0)?, "path": r.get::<_, String>(1)?, "sha256": r.get::<_, Option<String>>(2)?, "mtime": r.get::<_, i64>(3)? })))?.collect::<rusqlite::Result<_>>()?;
        // Confirmed when every copy's full hash is known and equal.
        let shas: Vec<&str> = items.iter().filter_map(|i| i["sha256"].as_str()).collect();
        let confirmed = shas.len() == items.len() && shas.windows(2).all(|w| w[0] == w[1]);
        wasted += size * (n - 1);
        out.push(json!({ "qhash": q, "count": n, "size": size, "confirmed": confirmed, "items": items }));
    }
    Ok(json!({ "groups": out, "wastedBytes": wasted }))
}

pub fn add_link(c: &Connection, items: &[i64], kind: &str, label: &str, target: &str) -> Result<()> {
    let now = now_ms();
    for i in items {
        c.execute("INSERT INTO links(item, kind, label, target, created) VALUES (?1, ?2, ?3, ?4, ?5)", params![i, kind, label, target, now])?;
    }
    Ok(())
}

/// Links converted items to the replays they were made from (same game and
/// match name, or the replay's name in the match's) and sets each replay's state.
pub fn relink(c: &Connection, installed: &dyn Fn(&str, Option<&str>) -> Option<bool>) -> Result<()> {
    // Converted -> source: the file its match document names, else the replay of the same name (a
    // converter keeps the replay's stem or its match id), of the same game.
    c.execute_batch(
        "UPDATE items SET source = (
            SELECT r.id FROM items r WHERE r.kind IN ('replay', 'recording') AND r.name = items.source_name AND r.missing = 0 ORDER BY r.mtime DESC LIMIT 1)
         WHERE kind = 'match' AND source IS NULL AND source_name IS NOT NULL;
         UPDATE items SET source = (
            SELECT r.id FROM items r WHERE r.kind IN ('replay', 'recording') AND r.game IS items.game AND r.stem = items.stem AND r.missing = 0 ORDER BY r.mtime DESC LIMIT 1)
         WHERE kind = 'match' AND source IS NULL AND converter IS NOT NULL;
         UPDATE items SET source = (
            SELECT r.id FROM items r WHERE r.kind IN ('replay', 'recording') AND r.game IS items.game AND (r.stem = items.match_id OR r.match_id = items.match_id) AND r.missing = 0 ORDER BY r.mtime DESC LIMIT 1)
         WHERE kind = 'match' AND source IS NULL AND converter IS NOT NULL AND match_id IS NOT NULL;",
    )?;
    // Each converted item: current or outdated against the converter installed now.
    let mut st = c.prepare("SELECT id, converter, converter_version FROM items WHERE kind = 'match' AND converter IS NOT NULL")?;
    let rows: Vec<(i64, String, Option<String>)> = st.query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))?.collect::<rusqlite::Result<_>>()?;
    let mut up = c.prepare_cached("UPDATE items SET conv = ?1 WHERE id = ?2 AND conv IS NOT ?1")?;
    for (id, conv, ver) in rows {
        let state = match installed(&conv, ver.as_deref()) {
            Some(true) => Some("current"),
            Some(false) => Some("outdated"),
            None => None,
        };
        up.execute(params![state, id])?;
    }
    // Each replay: none, current or outdated by its newest output; failed by its last job.
    c.execute_batch(
        "UPDATE items SET conv = CASE
            WHEN EXISTS (SELECT 1 FROM items o WHERE o.source = items.id AND o.missing = 0 AND o.conv = 'outdated')
                 AND NOT EXISTS (SELECT 1 FROM items o WHERE o.source = items.id AND o.missing = 0 AND o.conv = 'current') THEN 'outdated'
            WHEN EXISTS (SELECT 1 FROM items o WHERE o.source = items.id AND o.missing = 0) THEN 'current'
            WHEN (SELECT state FROM jobs j WHERE j.item = items.id ORDER BY j.id DESC LIMIT 1) = 'failed' THEN 'failed'
            ELSE 'none' END
         WHERE kind = 'replay';",
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn scanned(path: &str, game: &str, map: &str, started: i64) -> Scanned {
        Scanned {
            path: path.into(),
            root: None,
            kind: "match",
            format: "3dheat",
            name: path.rsplit('/').next().unwrap().into(),
            size: 100,
            mtime: 1,
            qhash: Some(format!("q{path}")),
            sha256: None,
            meta: Meta { game: Some(game.into()), map: Some(map.into()), started: Some(started), player_names: vec!["Alice".into(), "Bob".into()], title: Some(path.into()), ..Default::default() },
            thumb: None,
            error: None,
        }
    }

    #[test]
    fn filters_facets_and_search() {
        let dir = tempfile::tempdir().unwrap();
        let mut c = open(&dir.path().join("lib.sqlite")).unwrap();
        let batch = vec![scanned("a/one", "cs2", "de_dust2", 1000), scanned("a/two", "cs2", "de_inferno", 2000), scanned("a/three", "warthunder", "avg_x", 3000)];
        let ids = upsert(&mut c, &batch).unwrap();
        assert_eq!(ids.len(), 3);
        let f = Filter { game: vec!["cs2".into()], ..Default::default() };
        let (n, rows) = list(&c, &f, "started", true, 0, 10).unwrap();
        assert_eq!(n, 2);
        assert_eq!(rows[0].map.as_deref(), Some("de_inferno"));
        // The game facet ignores the game filter; the map facet does not.
        let fc = facets(&c, &f).unwrap();
        assert_eq!(fc["game"].as_array().unwrap().len(), 2);
        assert_eq!(fc["map"].as_array().unwrap().len(), 2);
        // Search by player and by a prefix of a map.
        let f = Filter { q: "dus".into(), ..Default::default() };
        assert_eq!(list(&c, &f, "started", true, 0, 10).unwrap().0, 1);
        let f = Filter { player: vec!["Alice".into()], ..Default::default() };
        assert_eq!(list(&c, &f, "started", true, 0, 10).unwrap().0, 3);
    }

    #[test]
    fn edits_tags_collections_and_rescan_keep_user_data() {
        let dir = tempfile::tempdir().unwrap();
        let mut c = open(&dir.path().join("lib.sqlite")).unwrap();
        let ids = upsert(&mut c, &[scanned("a/one", "cs2", "m", 1), scanned("a/two", "cs2", "m", 2)]).unwrap();
        edit(&mut c, &Edit { ids: vec![ids[0]], rating: Some(4), flag: Some(1), add_tags: vec!["clutch".into()], ..Default::default() }).unwrap();
        // A rescan of the same file keeps the rating and the tag.
        upsert(&mut c, &[scanned("a/one", "cs2", "m2", 1)]).unwrap();
        let d = detail(&c, ids[0]).unwrap().unwrap();
        assert_eq!(d["rating"], 4);
        assert_eq!(d["tags"], json!(["clutch"]));
        assert_eq!(d["map"], "m2");
        let f = Filter { q: "clutch".into(), ..Default::default() };
        assert_eq!(list(&c, &f, "name", false, 0, 10).unwrap().0, 1);
        // A manual collection and a smart one.
        let manual = create_collection(&c, "Best", None, &[ids[1]]).unwrap();
        let smart = create_collection(&c, "Four stars", Some(&Filter { rating: Some(4), ..Default::default() }), &[]).unwrap();
        let f = Filter { collection: Some(manual), ..Default::default() };
        assert_eq!(list(&c, &f, "name", false, 0, 10).unwrap().1[0].id, ids[1]);
        let f = Filter { collection: Some(smart), ..Default::default() };
        assert_eq!(list(&c, &f, "name", false, 0, 10).unwrap().1[0].id, ids[0]);
        let cols = collections(&c).unwrap();
        assert_eq!(cols.as_array().unwrap().len(), 2);
        // Tags taken off; the unused tag is gone.
        edit(&mut c, &Edit { ids: vec![ids[0]], remove_tags: vec!["clutch".into()], ..Default::default() }).unwrap();
        assert_eq!(c.query_row("SELECT count(*) FROM tags", [], |r| r.get::<_, i64>(0)).unwrap(), 0);
    }

    #[test]
    fn duplicates_by_fingerprint() {
        let dir = tempfile::tempdir().unwrap();
        let mut c = open(&dir.path().join("lib.sqlite")).unwrap();
        let mut a = scanned("a/one", "cs2", "m", 1);
        let mut b = scanned("b/one", "cs2", "m", 1);
        a.qhash = Some("same".into());
        b.qhash = Some("same".into());
        upsert(&mut c, &[a, b, scanned("c/x", "cs2", "m", 1)]).unwrap();
        let d = duplicates(&c, 10).unwrap();
        assert_eq!(d["groups"].as_array().unwrap().len(), 1);
        assert_eq!(d["wastedBytes"], 100);
        let f = Filter { dupes: Some(true), ..Default::default() };
        assert_eq!(list(&c, &f, "name", false, 0, 10).unwrap().0, 2);
    }

    #[test]
    fn many_items_list_fast() {
        let dir = tempfile::tempdir().unwrap();
        let mut c = open(&dir.path().join("lib.sqlite")).unwrap();
        let games = ["cs2", "warthunder", "dcs", "r6"];
        let batch: Vec<Scanned> = (0..20_000).map(|i| scanned(&format!("p/{i}"), games[i % 4], &format!("map{}", i % 37), i as i64 * 1000)).collect();
        upsert(&mut c, &batch).unwrap();
        let t = std::time::Instant::now();
        let f = Filter { game: vec!["cs2".into()], map: vec!["map3".into()], ..Default::default() };
        let (n, _) = list(&c, &f, "started", true, 0, 200).unwrap();
        facets(&c, &f).unwrap();
        assert!(n > 0);
        // Generous for a debug build on a busy machine; the release build answers in milliseconds.
        assert!(t.elapsed().as_millis() < 3000, "{:?}", t.elapsed());
    }
}
