//! Metadata of a library item, read without converting it: what the match was
//! (game, map, mode, date, length, players, sides, result) and what made the
//! file (converter and version), plus the points its thumbnail is drawn from.
//!
//! Only open formats are read here: `.3dheat` containers, Parquet and CSV
//! tables, Tacview ACMI, Valve demos (Counter-Strike 2, Dota 2), Watcher
//! sessions and extracted levels. Every other replay format is read by its own
//! converter, never by the library (`extractors.rs`, the converter's `info`
//! verb); without one installed the library knows its name, size and date.

use std::collections::BTreeSet;
use std::fs::File;
use std::io::{BufRead, BufReader, Read, Seek, SeekFrom};
use std::path::Path;

use anyhow::{anyhow, bail, Context, Result};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::kinds::{game_from_path, game_id, Class, Kind};

/// Everything the catalogue keeps about an item, beyond its path, size and time.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct Meta {
    pub game: Option<String>,
    pub map: Option<String>,
    pub mode: Option<String>,
    /// Unix milliseconds.
    pub started: Option<i64>,
    /// Seconds.
    pub duration: Option<f64>,
    pub players: Option<i64>,
    pub player_names: Vec<String>,
    pub teams: Vec<String>,
    /// The winning side's name, `draw`, or a result word the format gives.
    pub outcome: Option<String>,
    pub game_version: Option<String>,
    pub converter: Option<String>,
    pub converter_version: Option<String>,
    pub title: Option<String>,
    /// The match's own id or name, which links a converted file to its replay.
    pub match_id: Option<String>,
    /// Anything else worth showing, as JSON.
    pub extra: Value,
    /// Where the thumbnail's heat comes from: (x, y, weight), y up the picture.
    pub points: Vec<[f32; 3]>,
    /// The level picture the heat sits on, when known: (file, world rect x0, y0, x1, y1).
    pub underlay: Option<(String, [f32; 4])>,
    /// A level's pictures of the world with their rects (x0, y0 south, x1, y1 north), for matches played on it.
    pub pictures: Vec<(String, [f32; 4])>,
    /// The deep pass's work is in this record (ACMI tracks, full hash).
    pub deep: bool,
    /// The file it was made from, by name (a converter's match document lists its demos).
    pub source_name: Option<String>,
    /// Not something the library keeps (a delimited text file that is no telemetry table).
    pub skip: bool,
}

/// Reads the fast metadata of a classified file: headers, manifests, summaries.
pub fn read_fast(path: &Path, class: &Class) -> Result<Meta> {
    let mut m = match (class.kind, class.format) {
        (Kind::Match, "3dheat") => read_container(path)?,
        (Kind::Match, "parquet") => read_parquet(path)?,
        (Kind::Match, "csv") => read_csv(path)?,
        (Kind::Recording, "acmi") => read_acmi(path, false)?,
        (Kind::Replay, "dem") => read_dem(path)?,
        (Kind::Session, _) => read_watcher(path)?,
        (Kind::Models, "model-pack") | (Kind::Models, "figure-pack") => read_pack(path)?,
        (Kind::Level, _) | (Kind::Models, _) => read_level(path)?,
        _ => Meta::default(),
    };
    if m.game.is_none() {
        m.game = class.game.map(str::to_owned).or_else(|| game_from_path(path).map(str::to_owned));
    }
    if m.started.is_none() {
        m.started = date_from_name(&path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default());
    }
    if m.title.is_none() {
        m.title = Some(display_stem(path));
    }
    Ok(m)
}

/// The deep pass: what needs the whole file (an ACMI recording's length, pilots and tracks).
pub fn read_deep(path: &Path, class: &Class) -> Result<Option<Meta>> {
    match (class.kind, class.format) {
        (Kind::Recording, "acmi") => read_acmi(path, true).map(Some),
        (Kind::Match, "parquet") => table_points(path).map(|pts| (!pts.is_empty()).then(|| Meta { points: pts, deep: true, ..Default::default() })),
        _ => Ok(None),
    }
}

/// A sample of a table's positions seen from above, by its `heat3d` reading
/// instructions (the columns and which axis is up): for the thumbnail of a
/// table without a summary.
pub fn table_points(path: &Path) -> Result<Vec<[f32; 3]>> {
    use heat3d_core::parquet::{Kind as K, Out, ParquetFile, Spec};
    let pq = ParquetFile::open(heat3d_core::source::map(path)?)?;
    let Some(h) = pq.hints().and_then(|h| serde_json::from_str::<Value>(&h).ok()) else { return Ok(Vec::new()) };
    let col = |k: &str, d: &str| h.pointer(&format!("/columns/{k}")).and_then(Value::as_str).unwrap_or(d).to_owned();
    let up = h.pointer("/axes/up").and_then(Value::as_str).unwrap_or("y");
    let flip = |a: &str| h.pointer(&format!("/axes/flip{a}")).and_then(Value::as_bool).unwrap_or(false);
    // East and north on the picture, as the viewer turns the table: its z (south) is y or z, flipped by the hints.
    let (a, b, flip_b) = if up == "z" { (col("x", "x"), col("y", "y"), !flip("Y")) } else { (col("x", "x"), col("z", "z"), !flip("Z")) };
    if !pq.has_column(&a) || !pq.has_column(&b) {
        return Ok(Vec::new());
    }
    let specs = [Spec { name: a, kind: K::F32 }, Spec { name: b, kind: K::F32 }];
    let r = pq.read(&specs, &[], false)?;
    let (Out::F32(xs), Out::F32(ys)) = (&r.columns[0], &r.columns[1]) else { return Ok(Vec::new()) };
    let fx = if flip("X") { -1.0 } else { 1.0 };
    let fy = if flip_b { -1.0 } else { 1.0 };
    let n = xs.len().min(ys.len());
    let step = (n / 40_000).max(1);
    Ok((0..n).step_by(step).filter(|&i| xs[i].is_finite() && ys[i].is_finite()).map(|i| [xs[i] * fx, ys[i] * fy, 1.0]).collect())
}

/// A file's name without the format's extensions.
pub fn display_stem(path: &Path) -> String {
    let n = path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
    let lower = n.to_ascii_lowercase();
    for ext in [".zip.acmi", ".txt.acmi", ".acmi", ".3dheat", ".parquet", ".wrpl", ".dem", ".rec", ".wowsreplay", ".wotreplay", ".replay", ".glb", ".csv", ".tsv", ".h3dcars"] {
        if lower.ends_with(ext) {
            return n[..n.len() - ext.len()].to_owned();
        }
    }
    n
}

/// A date in a file name (`2026.11.05 23.27.45`, `2026-11-05_23-27-45`, `20261010-052056`), as Unix ms (UTC).
pub fn date_from_name(name: &str) -> Option<i64> {
    let d: Vec<u8> = name.bytes().collect();
    let digits_at = |i: usize, n: usize| d.get(i..i + n).filter(|s| s.iter().all(u8::is_ascii_digit)).map(|s| std::str::from_utf8(s).unwrap().parse::<i64>().unwrap());
    for i in 0..d.len() {
        // YYYY?MM?DD with a separator, or YYYYMMDD.
        let (y, mo, da, next) = if let (Some(y), Some(mo), Some(da)) = (digits_at(i, 4), digits_at(i + 5, 2), digits_at(i + 8, 2)) {
            if !matches!(d[i + 4], b'.' | b'-' | b'_') || d[i + 7] != d[i + 4] {
                continue;
            }
            (y, mo, da, i + 10)
        } else if let (Some(y), Some(mo), Some(da)) = (digits_at(i, 4), digits_at(i + 4, 2), digits_at(i + 6, 2)) {
            if i > 0 && d[i - 1].is_ascii_digit() {
                continue;
            }
            (y, mo, da, i + 8)
        } else {
            continue;
        };
        if !(1990..=2100).contains(&y) || !(1..=12).contains(&mo) || !(1..=31).contains(&da) {
            continue;
        }
        // A time after one separator: HH?MM?SS or HHMMSS.
        let mut secs = 0;
        if d.get(next).is_some_and(|c| matches!(c, b' ' | b'_' | b'-' | b'T')) {
            let t = next + 1;
            if let (Some(h), Some(mi), Some(s)) = (digits_at(t, 2), digits_at(t + 3, 2), digits_at(t + 6, 2)) {
                if (0..24).contains(&h) && mi < 60 && s < 61 {
                    secs = h * 3600 + mi * 60 + s;
                }
            } else if let (Some(h), Some(mi), Some(s)) = (digits_at(t, 2), digits_at(t + 2, 2), digits_at(t + 4, 2)) {
                if (0..24).contains(&h) && mi < 60 && s < 61 {
                    secs = h * 3600 + mi * 60 + s;
                }
            }
        }
        return Some((days_from_civil(y, mo, da) * 86_400 + secs) * 1000);
    }
    None
}

/// Days since 1970-01-01 (Howard Hinnant's algorithm).
pub fn days_from_civil(y: i64, m: i64, d: i64) -> i64 {
    let y = if m <= 2 { y - 1 } else { y };
    let era = if y >= 0 { y } else { y - 399 } / 400;
    let yoe = y - era * 400;
    let mp = (m + 9) % 12;
    let doy = (153 * mp + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146_097 + doe - 719_468
}

/// An ISO 8601 date-time (`2026-11-05T23:27:45.123+01:00`, `Z`, or none: UTC), as Unix ms.
pub fn parse_iso(s: &str) -> Option<i64> {
    let s = s.trim();
    let b = s.as_bytes();
    let num = |a: usize, n: usize| s.get(a..a + n).and_then(|x| x.parse::<i64>().ok());
    let (y, mo, d) = (num(0, 4)?, num(5, 2)?, num(8, 2)?);
    if b.get(4) != Some(&b'-') || b.get(7) != Some(&b'-') {
        return None;
    }
    let mut ms = days_from_civil(y, mo, d) * 86_400_000;
    if b.len() > 10 && matches!(b[10], b'T' | b't' | b' ') {
        let (h, mi) = (num(11, 2)?, num(14, 2)?);
        let sec = num(17, 2).unwrap_or(0);
        ms += (h * 3600 + mi * 60 + sec) * 1000;
        let mut i = 19;
        if b.get(i) == Some(&b'.') {
            i += 1;
            let start = i;
            while b.get(i).is_some_and(u8::is_ascii_digit) {
                i += 1;
            }
            let frac = &s[start..i];
            let f: String = frac.chars().chain("000".chars()).take(3).collect();
            ms += f.parse::<i64>().unwrap_or(0);
        }
        match b.get(i) {
            Some(b'+') | Some(b'-') => {
                let sign = if b[i] == b'+' { 1 } else { -1 };
                let oh = num(i + 1, 2).unwrap_or(0);
                let om = num(i + 4, 2).or_else(|| num(i + 3, 2)).unwrap_or(0);
                ms -= sign * (oh * 60 + om) * 60_000;
            }
            _ => {}
        }
    }
    Some(ms)
}

fn str_of(v: &Value, key: &str) -> Option<String> {
    match v.get(key)? {
        Value::String(s) if !s.trim().is_empty() => Some(s.trim().to_owned()),
        Value::Number(n) => Some(n.to_string()),
        _ => None,
    }
}

// ---------------------------------------------------------------------------
// .3dheat containers
// ---------------------------------------------------------------------------

/// The manifest, and the summary (`summary` role) or the match document (`match` role).
pub fn read_container(path: &Path) -> Result<Meta> {
    let file = File::open(path)?;
    // SAFETY: read-only map; a file changed while mapped gives wrong bytes, not unsafety in practice.
    let map = unsafe { memmap2::Mmap::map(&file)? };
    let c = heat3d_core::container::Container::open(&map)?;
    let man = &c.manifest;
    let mut m = Meta {
        game: str_of(man, "game").map(|g| game_id(&g).map(str::to_owned).unwrap_or(g)),
        map: str_of(man, "map"),
        mode: str_of(man, "mode"),
        started: str_of(man, "started").and_then(|s| parse_iso(&s)),
        match_id: str_of(man, "match"),
        ..Default::default()
    };
    if let Some(conv) = man.get("converter") {
        m.converter = str_of(conv, "name");
        m.converter_version = str_of(conv, "version");
    }
    let member = |role: &str| -> Option<Value> {
        let name = man.get("roles")?.get(role)?.as_str()?;
        let e = c.entry(name)?;
        // A match document of hundreds of MB is not worth its metadata.
        if e.size > 96 << 20 {
            return None;
        }
        let bytes = heat3d_core::container::member_bytes(&map, e).ok()?;
        serde_json::from_slice(&bytes).ok()
    };
    if let Some(s) = member("summary") {
        apply_summary(&mut m, &s);
    } else if let Some(d) = member("match") {
        apply_match_doc(&mut m, &d);
    }
    let rows: i64 = man.get("members").and_then(Value::as_array).map(|a| a.iter().filter(|x| x.get("role").and_then(Value::as_str) == Some("table")).filter_map(|x| x.get("rows")?.as_i64()).sum()).unwrap_or(0);
    if rows > 0 {
        merge_extra(&mut m.extra, json!({ "rows": rows }));
    }
    Ok(m)
}

fn merge_extra(into: &mut Value, add: Value) {
    if !into.is_object() {
        *into = json!({});
    }
    if let (Some(o), Value::Object(a)) = (into.as_object_mut(), add) {
        o.extend(a);
    }
}

/// The mass analysis's summary (docs/mass-analysis.md): length, players, sides, the winner and the grid.
pub fn apply_summary(m: &mut Meta, s: &Value) {
    m.duration = s.get("duration").and_then(Value::as_f64).or(m.duration);
    m.players = s.get("players").and_then(Value::as_i64).or(m.players);
    if m.map.is_none() {
        m.map = str_of(s, "map");
    }
    if m.mode.is_none() {
        m.mode = str_of(s, "mode");
    }
    if m.started.is_none() {
        m.started = str_of(s, "started").and_then(|x| parse_iso(&x));
    }
    if let Some(teams) = s.get("teams").and_then(Value::as_array) {
        m.teams = teams.iter().filter_map(|t| str_of(t, "name")).take(16).collect();
    }
    m.outcome = match s.get("winner") {
        Some(Value::String(w)) if !w.is_empty() => Some(w.clone()),
        Some(Value::Number(n)) => Some(n.to_string()),
        _ => None,
    };
    if let Some(ps) = s.get("playerStats").and_then(Value::as_array) {
        let names: BTreeSet<String> = ps.iter().filter_map(|p| str_of(p, "name").or_else(|| str_of(p, "id"))).collect();
        m.player_names = names.into_iter().take(400).collect();
    }
    if let Some(mission) = str_of(s, "mission") {
        merge_extra(&mut m.extra, json!({ "mission": mission }));
    }
    for k in ["units", "ai", "rows"] {
        if let Some(v) = s.get(k).and_then(Value::as_i64) {
            merge_extra(&mut m.extra, json!({ k: v }));
        }
    }
    if let Some(g) = s.get("grid") {
        m.points = grid_points(g);
    }
}

/// The summary grid's cells as weighted points: `ix`, `iz` (cell numbers), `p` (presence).
pub fn grid_points(g: &Value) -> Vec<[f32; 3]> {
    let cell = g.get("cell").and_then(Value::as_f64).unwrap_or(1.0) as f32;
    let arr = |k: &str| g.get(k).and_then(Value::as_array).cloned().unwrap_or_default();
    let (ix, iz, p) = (arr("ix"), arr("iz"), arr("p"));
    let n = ix.len().min(iz.len());
    (0..n)
        .filter_map(|i| {
            let x = ix[i].as_f64()? as f32;
            let z = iz[i].as_f64()? as f32;
            let w = p.get(i).and_then(Value::as_f64).unwrap_or(1.0) as f32;
            // The viewer's z points south; the picture's up is north.
            (w > 0.0).then_some([(x + 0.5) * cell, -(z + 0.5) * cell, w])
        })
        .collect()
}

/// A converter's match document (`<match>.match.json`): map, players, sides, the result.
pub fn apply_match_doc(m: &mut Meta, d: &Value) {
    if m.map.is_none() {
        m.map = str_of(d, "map").or_else(|| str_of(d, "level"));
    }
    if m.match_id.is_none() {
        m.match_id = str_of(d, "match");
    }
    if m.started.is_none() {
        m.started = str_of(d, "started").and_then(|s| parse_iso(&s));
    }
    if m.mode.is_none() {
        m.mode = str_of(d, "battleClass").or_else(|| str_of(d, "mode"));
    }
    if let Some(v) = str_of(d, "replayVersion").or_else(|| str_of(d, "gameVersion")) {
        m.game_version = Some(v);
    }
    // The demos or replays it was made from.
    if let Some(src) = d.get("demos").or_else(|| d.get("replays")).or_else(|| d.get("files")).and_then(Value::as_array).and_then(|a| a.first()) {
        m.source_name = src.as_str().map(str::to_owned).or_else(|| str_of(src, "name"));
    }
    // The length: the last round's end.
    if m.duration.is_none() {
        if let Some(last) = d.get("rounds").and_then(Value::as_array).and_then(|r| r.last()) {
            m.duration = last.get("until").or_else(|| last.get("end")).and_then(Value::as_f64);
        }
    }
    if let Some(players) = d.get("players").and_then(Value::as_array) {
        let names: BTreeSet<String> = players.iter().filter_map(|p| if p.is_string() { p.as_str().map(str::to_owned) } else { str_of(p, "name") }).collect();
        m.players = Some(names.len() as i64);
        m.player_names = names.into_iter().take(400).collect();
    }
    if let Some(teams) = d.get("teams").and_then(Value::as_array) {
        m.teams = teams.iter().filter_map(|t| if t.is_string() { t.as_str().map(str::to_owned) } else { str_of(t, "name") }).take(16).collect();
    }
    let result = d.get("result").or_else(|| d.get("results"));
    if let Some(w) = result.and_then(|r| str_of(r, "winner")) {
        m.outcome = Some(w);
    } else if let Some(score) = d.get("score") {
        // CS2: {"CT": 13, "T": 9} or [13, 9] with teams.
        if let Some(o) = score.as_object() {
            let best = o.iter().filter_map(|(k, v)| Some((k.clone(), v.as_f64()?))).max_by(|a, b| a.1.total_cmp(&b.1));
            let tie = o.values().filter_map(Value::as_f64).collect::<Vec<_>>();
            if tie.len() == 2 && tie[0] == tie[1] {
                m.outcome = Some("draw".into());
            } else if let Some((k, _)) = best {
                m.outcome = Some(k);
            }
            merge_extra(&mut m.extra, json!({ "score": score }));
        }
    }
}

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

/// A Parquet table: rows, columns and the `heat3d` footer; a `<stem>.match.json` beside it.
pub fn read_parquet(path: &Path) -> Result<Meta> {
    use parquet::file::reader::{FileReader, SerializedFileReader};
    let mut m = Meta::default();
    let reader = SerializedFileReader::new(File::open(path)?).context("reading the Parquet footer")?;
    let meta = reader.metadata().file_metadata();
    let cols: Vec<String> = meta.schema_descr().columns().iter().map(|c| c.name().to_owned()).collect();
    merge_extra(&mut m.extra, json!({ "rows": meta.num_rows(), "columns": cols.len() }));
    if let Some(kv) = meta.key_value_metadata() {
        for e in kv {
            if e.key == "heat3d" {
                if let Some(h) = e.value.as_deref().and_then(|v| serde_json::from_str::<Value>(v).ok()) {
                    m.game = str_of(&h, "game").map(|g| game_id(&g).map(str::to_owned).unwrap_or(g));
                    m.map = str_of(&h, "map").or_else(|| str_of(&h, "level"));
                    m.match_id = str_of(&h, "match");
                    if let Some(c) = h.get("converter") {
                        m.converter = str_of(c, "name").or_else(|| c.as_str().map(str::to_owned));
                        m.converter_version = str_of(c, "version");
                    }
                    // The table's kind (`cs2-demo`): the game, and what made it when nothing else says.
                    if let Some(kind) = str_of(&h, "kind") {
                        if m.game.is_none() {
                            m.game = kind.split('-').next().and_then(game_id).map(str::to_owned);
                        }
                        if m.converter.is_none() {
                            m.converter = Some(kind);
                        }
                    }
                }
            }
        }
    }
    beside_match_doc(path, &mut m);
    Ok(m)
}

fn beside_match_doc(path: &Path, m: &mut Meta) {
    let stem = display_stem(path);
    let doc = path.with_file_name(format!("{stem}.match.json"));
    if let Ok(md) = std::fs::metadata(&doc) {
        if md.len() < 48 << 20 {
            if let Ok(v) = std::fs::read(&doc).map_err(anyhow::Error::from).and_then(|b| serde_json::from_slice::<Value>(&b).map_err(Into::into)) {
                apply_match_doc(m, &v);
                if m.game.is_none() {
                    if let Some(f) = str_of(&v, "format") {
                        // `heat3d-cs2-match`, `heat3d-wt-replay-match`, ...
                        m.game = f.strip_prefix("heat3d-").and_then(|r| r.split('-').next()).and_then(game_id).map(str::to_owned);
                    }
                }
            }
        }
    }
    let summary = path.with_file_name(format!("{stem}.summary.json"));
    if let Ok(b) = std::fs::read(&summary) {
        if let Ok(v) = serde_json::from_slice::<Value>(&b) {
            apply_summary(m, &v);
        }
    }
}

/// A delimited text table: its columns.
pub fn read_csv(path: &Path) -> Result<Meta> {
    let mut first = String::new();
    BufReader::new(File::open(path)?).take(1 << 16).read_line(&mut first)?;
    let sep = if first.matches('\t').count() > first.matches(',').count() { '\t' } else { ',' };
    let cols: Vec<String> = first.trim_end().split(sep).map(|c| c.trim().trim_matches('"').to_ascii_lowercase()).collect();
    // A telemetry table has positions: x/y(/z), lat/lon, or prefixed forms of them (`pos_x`, `posX`).
    let has = |names: &[&str]| cols.iter().any(|c| names.iter().any(|n| c == n || c.ends_with(&format!("_{n}")) || c.ends_with(&format!(".{n}"))));
    let positions = (has(&["x", "posx"]) && has(&["y", "posy", "z", "posz"])) || (has(&["lat", "latitude"]) && has(&["lon", "lng", "long", "longitude"]));
    let mut m = Meta { extra: json!({ "columns": cols.len() }), skip: !positions, ..Default::default() };
    beside_match_doc(path, &mut m);
    Ok(m)
}

// ---------------------------------------------------------------------------
// Tacview ACMI
// ---------------------------------------------------------------------------

/// An ACMI text stream: the file, or a zip's first member (stored or deflated). `buf`: the
/// read size (small for the header alone: over a network every byte read counts).
fn acmi_reader(path: &Path, buf: usize) -> Result<Box<dyn BufRead>> {
    let mut f = File::open(path)?;
    let mut head = [0u8; 30];
    let n = f.read(&mut head)?;
    if n >= 30 && head[..4] == [0x50, 0x4b, 0x03, 0x04] {
        let method = u16::from_le_bytes([head[8], head[9]]);
        let name_len = u16::from_le_bytes([head[26], head[27]]) as u64;
        let extra_len = u16::from_le_bytes([head[28], head[29]]) as u64;
        f.seek(SeekFrom::Start(30 + name_len + extra_len))?;
        return Ok(match method {
            0 => Box::new(BufReader::with_capacity(buf, f)),
            8 => Box::new(BufReader::with_capacity(buf, flate2::read::DeflateDecoder::new(BufReader::with_capacity(buf, f)))),
            _ => bail!("zip method {method} not read"),
        });
    }
    f.seek(SeekFrom::Start(0))?;
    Ok(Box::new(BufReader::with_capacity(buf, f)))
}

/// DCS and IL-2 theatres by where their positions lie (as `src/world/theatres.ts`):
/// (game, name, south, north, west, east).
const THEATRES: &[(&str, &str, f64, f64, f64, f64)] = &[
    ("dcs", "Caucasus", 38.9, 48.4, 26.8, 49.3),
    ("dcs", "Nevada", 35.3, 38.3, -118.6, -112.4),
    ("dcs", "Normandy", 48.2, 51.2, -5.8, 2.2),
    ("dcs", "TheChannel", 49.7, 51.6, -0.1, 3.4),
    ("dcs", "Syria", 31.9, 37.7, 29.3, 42.4),
    ("dcs", "PersianGulf", 24.1, 27.9, 52.3, 59.6),
    ("dcs", "MarianaIslands", 12.5, 16.0, 143.5, 146.5),
    ("dcs", "Falklands", -56.0, -46.0, -76.0, -55.0),
    ("dcs", "SinaiMap", 25.9, 34.5, 28.1, 37.3),
    ("dcs", "Afghanistan", 23.0, 38.7, 60.3, 75.0),
    ("dcs", "Kola", 63.9, 74.2, -7.7, 52.1),
    ("dcs", "GermanyCW", 49.5, 54.5, 6.5, 14.5),
    ("dcs", "Iraq", 29.0, 37.5, 38.5, 48.5),
    ("il2", "Stalingrad", 47.5, 50.0, 42.0, 46.5),
    ("il2", "Moscow", 54.3, 57.0, 33.3, 38.3),
    ("il2", "Kuban", 43.9, 46.9, 35.5, 40.3),
    ("il2", "Rheinland", 49.5, 53.0, 3.0, 9.5),
    ("il2", "Normandy", 48.0, 51.5, -2.5, 2.6),
    ("il2", "Prokhorovka", 50.4, 51.4, 35.8, 37.6),
    ("il2", "Velikie Luki", 55.8, 56.9, 29.6, 31.5),
    ("il2", "Arras", 49.6, 50.9, 1.8, 3.9),
    ("il2", "Odessa", 45.3, 47.6, 29.5, 33.6),
    ("il2", "Leningrad", 59.2, 61.2, 26.7, 31.3),
    ("il2", "Korea", 34.5, 41.0, 124.0, 130.0),
];

/// The smallest theatre of `game` holding (lat, lon).
pub fn theatre_at(game: Option<&str>, lat: f64, lon: f64) -> Option<&'static str> {
    THEATRES
        .iter()
        .filter(|t| game.is_none_or(|g| g == t.0) && lat >= t.2 && lat <= t.3 && lon >= t.4 && lon <= t.5)
        .min_by(|a, b| ((a.3 - a.2) * (a.5 - a.4)).total_cmp(&((b.3 - b.2) * (b.5 - b.4))))
        .map(|t| t.1)
}

/// DCS terrain folders (`Mods/terrains/<folder>`, as the DCS converter names a
/// theatre) whose theatre id differs (as `DCS_FOLDERS` in `src/world/theatres.ts`).
const DCS_FOLDERS: &[(&str, &str)] = &[("GermanyColdWar", "GermanyCW"), ("MarianasWWII", "MarianaIslandsWWII"), ("Sinai", "SinaiMap")];

/// The theatre id of a DCS terrain folder (the folder itself when it is the id).
pub fn dcs_theatre(folder: &str) -> &str {
    DCS_FOLDERS.iter().find(|(f, _)| f.eq_ignore_ascii_case(folder)).map_or(folder, |(_, id)| id)
}

/// A recording's header (the globals before the first time frame); `deep` reads
/// on to the end: the length, the pilots, a sample of positions.
pub fn read_acmi(path: &Path, deep: bool) -> Result<Meta> {
    let mut r = acmi_reader(path, if deep { 1 << 20 } else { 16 << 10 })?;
    let mut m = Meta::default();
    let mut globals = serde_json::Map::new();
    let (mut ref_lat, mut ref_lon) = (0.0f64, 0.0f64);
    let mut last_time = 0.0f64;
    let mut frames = false;
    let mut pilots: BTreeSet<String> = BTreeSet::new();
    let mut coalitions: BTreeSet<String> = BTreeSet::new();
    let mut samples: Vec<[f32; 3]> = Vec::new();
    let mut seen_pos: u64 = 0;
    let mut rng: u64 = 0x9E37_79B9_7F4A_7C15;
    const CAP: usize = 24_000;
    let mut line = Vec::with_capacity(512);
    loop {
        line.clear();
        if r.read_until(b'\n', &mut line)? == 0 {
            break;
        }
        let l = trim_line(&line);
        if l.is_empty() {
            continue;
        }
        if l[0] == b'#' {
            if let Some(t) = std::str::from_utf8(&l[1..]).ok().and_then(|s| s.trim().parse::<f64>().ok()) {
                last_time = t;
            }
            if !deep && frames {
                break;
            }
            frames = true;
            continue;
        }
        if let Some(rest) = l.strip_prefix(b"0,") {
            let text = String::from_utf8_lossy(rest);
            for prop in split_props(&text) {
                if let Some((k, v)) = prop.split_once('=') {
                    match k {
                        "ReferenceLongitude" => ref_lon = v.parse().unwrap_or(0.0),
                        "ReferenceLatitude" => ref_lat = v.parse().unwrap_or(0.0),
                        _ => {}
                    }
                    if globals.len() < 40 && v.len() < 2000 {
                        globals.insert(k.to_owned(), Value::String(v.replace("\\,", ",")));
                    }
                }
            }
            continue;
        }
        if !frames {
            if let Some(v) = l.strip_prefix(b"FileVersion=") {
                globals.insert("FileVersion".into(), Value::String(String::from_utf8_lossy(v).into_owned()));
            }
            continue;
        }
        if !deep || l[0] == b'-' {
            continue;
        }
        // An object's line: `id,T=lon|lat|alt|...,Name=...,Pilot=...`.
        let text = String::from_utf8_lossy(l);
        for prop in split_props(&text).skip(1) {
            if let Some(t) = prop.strip_prefix("T=") {
                let mut it = t.split('|');
                let lon = it.next().and_then(|x| x.parse::<f64>().ok());
                let lat = it.next().and_then(|x| x.parse::<f64>().ok());
                if let (Some(lon), Some(lat)) = (lon, lat) {
                    seen_pos += 1;
                    // Reservoir sample: a fair share of every part of the recording.
                    let p = [(lon + ref_lon) as f32, (lat + ref_lat) as f32, 1.0];
                    if samples.len() < CAP {
                        samples.push(p);
                    } else {
                        rng ^= rng << 13;
                        rng ^= rng >> 7;
                        rng ^= rng << 17;
                        let j = rng % seen_pos;
                        if (j as usize) < CAP {
                            samples[j as usize] = p;
                        }
                    }
                }
            } else if let Some(p) = prop.strip_prefix("Pilot=") {
                if pilots.len() < 2000 && !p.is_empty() {
                    pilots.insert(p.replace("\\,", ","));
                }
            } else if let Some(c) = prop.strip_prefix("Coalition=") {
                if coalitions.len() < 16 && !c.is_empty() {
                    coalitions.insert(c.to_owned());
                }
            }
        }
    }
    let g = |k: &str| globals.get(k).and_then(Value::as_str).map(str::to_owned).filter(|s| !s.is_empty());
    let source = g("DataSource").unwrap_or_default();
    m.game = if source.to_ascii_lowercase().contains("dcs") {
        Some("dcs".into())
    } else if source.to_ascii_lowercase().contains("il-2") || source.to_ascii_lowercase().contains("il2") {
        Some("il2".into())
    } else if source.to_ascii_lowercase().contains("falcon") || source.to_ascii_lowercase().contains("bms") {
        Some("bms".into())
    } else if source.to_ascii_lowercase().contains("war thunder") {
        Some("warthunder".into())
    } else {
        None
    };
    m.game_version = (!source.is_empty()).then(|| source.clone());
    m.title = g("Title");
    // When it was recorded (the mission's own date, ReferenceTime, can be any year).
    let name = path.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
    m.started = g("RecordingTime").and_then(|s| parse_iso(&s)).or_else(|| date_from_name(&name)).or_else(|| g("ReferenceTime").and_then(|s| parse_iso(&s)));
    if deep {
        m.duration = Some(last_time);
        // Tacview names the pilot of every unit, the AI's too: a count of pilots, not of players.
        merge_extra(&mut m.extra, json!({ "pilots": pilots.len() }));
        m.player_names = pilots.into_iter().take(400).collect();
        m.teams = coalitions.into_iter().collect();
        if !samples.is_empty() {
            let mut lats: Vec<f32> = samples.iter().map(|p| p[1]).collect();
            let mut lons: Vec<f32> = samples.iter().map(|p| p[0]).collect();
            lats.sort_by(f32::total_cmp);
            lons.sort_by(f32::total_cmp);
            let (mlat, mlon) = (lats[lats.len() / 2] as f64, lons[lons.len() / 2] as f64);
            m.map = theatre_at(m.game.as_deref(), mlat, mlon).map(str::to_owned);
            // Longitude to east metres at this latitude, so the picture is not stretched.
            let k = (mlat.to_radians().cos() as f32).max(0.05);
            m.points = samples.iter().map(|p| [p[0] * k, p[1], 1.0]).collect();
        }
        m.deep = true;
    } else if ref_lat != 0.0 || ref_lon != 0.0 {
        m.map = theatre_at(m.game.as_deref(), ref_lat, ref_lon).map(str::to_owned);
    }
    let keep: serde_json::Map<String, Value> = globals.into_iter().filter(|(k, _)| matches!(k.as_str(), "Title" | "DataSource" | "DataRecorder" | "Author" | "Category" | "Briefing" | "Comments" | "FileVersion" | "RecordingTime")).collect();
    merge_extra(&mut m.extra, json!({ "acmi": keep }));
    Ok(m)
}

fn trim_line(l: &[u8]) -> &[u8] {
    let mut e = l.len();
    while e > 0 && matches!(l[e - 1], b'\n' | b'\r') {
        e -= 1;
    }
    let s = if l.starts_with(&[0xEF, 0xBB, 0xBF]) { 3 } else { 0 };
    &l[s.min(e)..e]
}

/// An ACMI line's comma-separated properties, `\,` kept inside a value.
fn split_props(s: &str) -> impl Iterator<Item = &str> {
    let b = s.as_bytes();
    let mut start = 0;
    let mut i = 0;
    std::iter::from_fn(move || {
        if start > b.len() {
            return None;
        }
        while i < b.len() {
            if b[i] == b',' && (i == 0 || b[i - 1] != b'\\') {
                let out = &s[start..i];
                i += 1;
                start = i;
                return Some(out);
            }
            i += 1;
        }
        let out = &s[start..];
        start = b.len() + 1;
        Some(out)
    })
}

pub fn hex(b: &[u8]) -> String {
    b.iter().map(|x| format!("{x:02x}")).collect()
}

// ---------------------------------------------------------------------------
// Valve demos (Counter-Strike 2, Dota 2)
// ---------------------------------------------------------------------------

/// Protobuf fields of a message: (field number, wire type, varint value or bytes).
fn pb_fields(mut b: &[u8]) -> Vec<(u64, u8, u64, &[u8])> {
    let mut out = Vec::new();
    while !b.is_empty() {
        let Some((key, n)) = varint(b) else { break };
        b = &b[n..];
        let (field, wt) = (key >> 3, (key & 7) as u8);
        match wt {
            0 => {
                let Some((v, n)) = varint(b) else { break };
                out.push((field, 0, v, &b[..0]));
                b = &b[n..];
            }
            1 => {
                if b.len() < 8 {
                    break;
                }
                out.push((field, 1, u64::from_le_bytes(b[..8].try_into().unwrap()), &b[..8]));
                b = &b[8..];
            }
            2 => {
                let Some((len, n)) = varint(b) else { break };
                let len = len as usize;
                if b.len() < n + len {
                    break;
                }
                out.push((field, 2, len as u64, &b[n..n + len]));
                b = &b[n + len..];
            }
            5 => {
                if b.len() < 4 {
                    break;
                }
                out.push((field, 5, u32::from_le_bytes(b[..4].try_into().unwrap()) as u64, &b[..4]));
                b = &b[4..];
            }
            _ => break,
        }
    }
    out
}

fn varint(b: &[u8]) -> Option<(u64, usize)> {
    let mut v = 0u64;
    for (i, &x) in b.iter().enumerate().take(10) {
        v |= ((x & 0x7f) as u64) << (7 * i);
        if x & 0x80 == 0 {
            return Some((v, i + 1));
        }
    }
    None
}

/// One demo command at `b`: (command, payload), decompressed when flagged.
fn dem_command(b: &[u8]) -> Option<(u64, Vec<u8>)> {
    let (cmd, n1) = varint(b)?;
    let (_tick, n2) = varint(&b[n1..])?;
    let (size, n3) = varint(&b[n1 + n2..])?;
    let at = n1 + n2 + n3;
    let body = b.get(at..at + size as usize)?;
    // DEM_IsCompressed (64): snappy.
    if cmd & 64 != 0 {
        let raw = snap::raw::Decoder::new().decompress_vec(body).ok()?;
        Some((cmd & !64, raw))
    } else {
        Some((cmd, body.to_vec()))
    }
}

/// A Source 2 demo (`PBDEMS2`): the file header (map, server, game, build) and
/// the file info at the end (the length).
pub fn read_dem(path: &Path) -> Result<Meta> {
    let mut f = File::open(path)?;
    let len = f.metadata()?.len();
    let mut head = vec![0u8; 16 * 1024];
    let n = f.read(&mut head)?;
    head.truncate(n);
    if !head.starts_with(b"PBDEMS2\0") {
        bail!("not a Source 2 demo");
    }
    let info_at = u32::from_le_bytes(head[8..12].try_into().unwrap()) as u64;
    let (cmd, body) = dem_command(&head[16..]).ok_or_else(|| anyhow!("no file header"))?;
    if cmd != 1 {
        bail!("the demo does not start with its file header");
    }
    let mut m = Meta::default();
    let s = |v: &[u8]| String::from_utf8_lossy(v).trim().to_owned();
    let mut dir = String::new();
    for (field, wt, v, bytes) in pb_fields(&body) {
        match (field, wt) {
            (3, 2) => merge_extra(&mut m.extra, json!({ "server": s(bytes) })),
            (5, 2) => m.map = Some(s(bytes)).filter(|x| !x.is_empty()),
            (6, 2) => dir = s(bytes),
            (13, 0) => m.game_version = Some(format!("build {v}")),
            _ => {}
        }
    }
    let d = dir.to_ascii_lowercase();
    m.game = if d.contains("dota") { Some("dota2".into()) } else if d.contains("csgo") || d.contains("cs2") { Some("cs2".into()) } else { None };
    // DEM_FileInfo (2): playback_time (float, field 1).
    if info_at > 16 && info_at < len {
        let mut tail = Vec::new();
        f.seek(SeekFrom::Start(info_at))?;
        // The file info is a few hundred bytes (Dota 2's game info a few KB).
        f.take(256 << 10).read_to_end(&mut tail)?;
        if let Some((2, info)) = dem_command(&tail) {
            for (field, wt, v, bytes) in pb_fields(&info) {
                if (field, wt) == (1, 5) {
                    m.duration = Some(f32::from_bits(v as u32) as f64);
                }
                if (field, wt) == (4, 2) {
                    read_game_info(&mut m, bytes);
                }
            }
        }
    }
    Ok(m)
}

/// CGameInfo.dota (field 4): match id, mode, winner, the players' names.
fn read_game_info(m: &mut Meta, b: &[u8]) {
    for (field, wt, _, dota) in pb_fields(b) {
        if (field, wt) != (4, 2) {
            continue;
        }
        let mut names = BTreeSet::new();
        for (f, wt, v, bytes) in pb_fields(dota) {
            match (f, wt) {
                (1, 0) => m.match_id = Some(v.to_string()),
                (2, 0) => m.mode = Some(format!("mode {v}")),
                (3, 0) => m.outcome = Some(match v { 2 => "Radiant".into(), 3 => "Dire".into(), _ => v.to_string() }),
                (5, 2) => {
                    for (pf, pwt, _, pb) in pb_fields(bytes) {
                        if (pf, pwt) == (2, 2) {
                            let n = String::from_utf8_lossy(pb).trim().to_owned();
                            if !n.is_empty() {
                                names.insert(n);
                            }
                        }
                    }
                }
                _ => {}
            }
        }
        if !names.is_empty() {
            m.players = Some(names.len() as i64);
            m.player_names = names.into_iter().collect();
            m.teams = vec!["Radiant".into(), "Dire".into()];
        }
    }
}

// ---------------------------------------------------------------------------
// Watcher sessions, levels
// ---------------------------------------------------------------------------

/// A Watcher session folder's `meta.json`.
pub fn read_watcher(dir: &Path) -> Result<Meta> {
    let v: Value = serde_json::from_slice(&std::fs::read(dir.join("meta.json"))?).context("meta.json")?;
    let mut m = Meta {
        game: str_of(&v, "game").map(|g| game_id(&g).map(str::to_owned).unwrap_or(g)),
        map: str_of(&v, "track").or_else(|| str_of(&v, "map")).or_else(|| str_of(&v, "level")),
        ..Default::default()
    };
    m.started = match v.get("started") {
        Some(Value::Number(n)) => n.as_f64().map(|s| if s > 1e12 { s as i64 } else { (s * 1000.0) as i64 }),
        Some(Value::String(s)) => parse_iso(s),
        _ => None,
    };
    m.duration = v.get("seconds").and_then(Value::as_f64);
    m.converter = Some("heat3d-watcher".into());
    m.converter_version = str_of(&v, "watcher").or_else(|| str_of(&v, "version"));
    if let Some(s) = str_of(&v, "source") {
        merge_extra(&mut m.extra, json!({ "source": s }));
    }
    Ok(m)
}

/// An extracted level (`.glb`) or a model pack: the game from its folders, and
/// the picture beside it (`<name>_map.png`, a `preview` folder's top view).
pub fn read_level(path: &Path) -> Result<Meta> {
    let stem = display_stem(path);
    let mut m = Meta { map: Some(stem.clone()), title: Some(stem.clone()), ..Default::default() };
    let dir = path.parent().unwrap_or(Path::new("."));
    // The level's own description (`<name>.json` beside it, War Thunder's levels): the extractor and its pictures.
    let desc = dir.join(format!("{stem}.json"));
    if let Ok(b) = std::fs::read(&desc).ok().filter(|b| b.len() < 8 << 20).ok_or(()) {
        if let Ok(v) = serde_json::from_slice::<Value>(&b) {
            if let Some(t) = str_of(&v, "tool") {
                m.converter = Some(t);
            }
            // A DCS level is one region of a theatre (`Caucasus_r1`, `Caucasus_Beslan`):
            // its map is the theatre, the name recordings and missions use.
            if let Some(t) = str_of(&v, "theatre") {
                m.map = Some(dcs_theatre(&t).to_owned());
            }
            if let Some(maps) = v.get("maps").and_then(Value::as_array) {
                for mp in maps {
                    if let (Some(file), Some(r)) = (str_of(mp, "file"), mp.get("gameRect")) {
                        let f = |k: &str| r.get(k).and_then(Value::as_f64).unwrap_or(0.0) as f32;
                        let rect = [f("x0"), f("z0"), f("x1"), f("z1")];
                        let p = dir.join(file);
                        if p.is_file() && rect[2] > rect[0] && rect[3] > rect[1] {
                            m.pictures.push((p.to_string_lossy().into_owned(), rect));
                        }
                    }
                }
                // The whole map for the level's own thumbnail: the largest rect.
                m.underlay = m.pictures.iter().max_by(|a, b| ((a.1[2] - a.1[0]) * (a.1[3] - a.1[1])).total_cmp(&((b.1[2] - b.1[0]) * (b.1[3] - b.1[1])))).cloned();
                if !m.pictures.is_empty() {
                    let pics: Vec<Value> = m.pictures.iter().map(|(f, r)| json!({ "file": f, "rect": r })).collect();
                    merge_extra(&mut m.extra, json!({ "pictures": pics }));
                }
            }
        }
    }
    if m.underlay.is_none() {
        for cand in [format!("{stem}_map.png"), format!("{stem}_terrain.png"), format!("{stem}.png"), format!("{stem}-top.png")] {
            let p = dir.join(&cand);
            if p.is_file() {
                m.underlay = Some((p.to_string_lossy().into_owned(), [0.0; 4]));
                break;
            }
        }
    }
    if m.underlay.is_none() {
        if let Ok(rd) = std::fs::read_dir(dir.join("preview")).or_else(|_| std::fs::read_dir(dir)) {
            let mut pics: Vec<_> = rd.filter_map(|e| e.ok()).map(|e| e.path()).filter(|p| p.extension().is_some_and(|x| x.eq_ignore_ascii_case("png")) && p.to_string_lossy().to_ascii_lowercase().contains("top")).collect();
            pics.sort();
            if let Some(p) = pics.first() {
                m.underlay = Some((p.to_string_lossy().into_owned(), [0.0; 4]));
            }
        }
    }
    Ok(m)
}

/// A model or figure pack folder: how many models, its own description (`model-pack.json`, `figures*.json`).
pub fn read_pack(dir: &Path) -> Result<Meta> {
    let mut models = 0u64;
    for e in std::fs::read_dir(dir)?.flatten() {
        let n = e.file_name().to_string_lossy().to_ascii_lowercase();
        if n.ends_with(".glb") || n.ends_with(".gltf") || n.ends_with(".h3dcars") {
            models += 1;
        }
    }
    let name = dir.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_default();
    let mut m = Meta { title: Some(name.clone()), map: None, game: game_id(&name).map(str::to_owned), extra: json!({ "models": models }), ..Default::default() };
    for desc in ["model-pack.json", "figures.json"] {
        if let Ok(b) = std::fs::read(dir.join(desc)) {
            if b.len() < 32 << 20 {
                if let Ok(v) = serde_json::from_slice::<Value>(&b) {
                    m.converter = str_of(&v, "tool").or_else(|| str_of(&v, "extractor"));
                    m.converter_version = str_of(&v, "version");
                    if let Some(g) = str_of(&v, "game") {
                        m.game = game_id(&g).map(str::to_owned).or(Some(g));
                    }
                    if let Some(n) = v.get("figures").or_else(|| v.get("models")).and_then(Value::as_array) {
                        merge_extra(&mut m.extra, json!({ "models": n.len() }));
                    }
                }
            }
            break;
        }
    }
    Ok(m)
}

/// The quick fingerprint: SHA-256 of the size and the first and last 64 KiB.
/// Equal files always match; different files almost never do. The full hash confirms.
pub fn quick_hash(path: &Path, size: u64) -> Result<String> {
    let mut f = File::open(path)?;
    let mut h = Sha256::new();
    h.update(size.to_le_bytes());
    let mut buf = vec![0u8; 64 * 1024];
    let n = read_full(&mut f, &mut buf)?;
    h.update(&buf[..n]);
    if size > 128 * 1024 {
        f.seek(SeekFrom::Start(size - 64 * 1024))?;
        let n = read_full(&mut f, &mut buf)?;
        h.update(&buf[..n]);
    }
    Ok(hex(&h.finalize()[..16]))
}

fn read_full(f: &mut File, buf: &mut [u8]) -> std::io::Result<usize> {
    let mut n = 0;
    while n < buf.len() {
        let k = f.read(&mut buf[n..])?;
        if k == 0 {
            break;
        }
        n += k;
    }
    Ok(n)
}

/// The full SHA-256 of a file.
pub fn full_hash(path: &Path) -> Result<String> {
    let mut f = BufReader::with_capacity(1 << 20, File::open(path)?);
    let mut h = Sha256::new();
    std::io::copy(&mut f, &mut h)?;
    Ok(hex(&h.finalize()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn dates_in_names() {
        let ms = |y: i64, mo: i64, d: i64, h: i64, mi: i64, s: i64| (days_from_civil(y, mo, d) * 86_400 + h * 3600 + mi * 60 + s) * 1000;
        assert_eq!(date_from_name("#2026.11.05 23.27.45.wrpl"), Some(ms(2026, 11, 5, 23, 27, 45)));
        assert_eq!(date_from_name("avg_RB_Bttl_2026-11-05_23-27-45_2b31.3dheat"), Some(ms(2026, 11, 5, 23, 27, 45)));
        assert_eq!(date_from_name("Tacview-20261010-052056-DCS.zip.acmi"), Some(ms(2026, 10, 10, 5, 20, 56)));
        assert_eq!(date_from_name("2game-vs-9z-m1-dust2.dem"), None);
        assert_eq!(days_from_civil(1970, 1, 1), 0);
    }

    #[test]
    fn iso_dates() {
        assert_eq!(parse_iso("1970-01-01T00:00:01Z"), Some(1000));
        assert_eq!(parse_iso("1970-01-01T01:00:00+01:00"), Some(0));
        assert_eq!(parse_iso("1970-01-01T00:00:00.250Z"), Some(250));
        assert_eq!(parse_iso("1970-01-02"), Some(86_400_000));
        assert_eq!(parse_iso("nope"), None);
    }

    #[test]
    fn theatres_by_position() {
        assert_eq!(theatre_at(Some("dcs"), 42.0, 42.0), Some("Caucasus"));
        assert_eq!(theatre_at(Some("dcs"), 50.5, 1.5), Some("TheChannel"));
        assert_eq!(theatre_at(Some("il2"), 45.0, 38.0), Some("Kuban"));
        assert_eq!(theatre_at(Some("dcs"), 0.0, 0.0), None);
    }

    #[test]
    fn dcs_levels_are_their_theatre() {
        let dir = tempfile::tempdir().unwrap();
        for (stem, theatre) in [("Caucasus_r1", "Caucasus"), ("GermanyCW_r2", "GermanyColdWar"), ("Normandy-Caen", "Normandy")] {
            std::fs::write(dir.path().join(format!("{stem}.glb")), b"glTF").unwrap();
            std::fs::write(dir.path().join(format!("{stem}.json")), format!(r#"{{"tool":"heat3d_ext_dcs","theatre":"{theatre}","level":"{stem}"}}"#)).unwrap();
        }
        let m = read_level(&dir.path().join("Caucasus_r1.glb")).unwrap();
        assert_eq!((m.map.as_deref(), m.title.as_deref()), (Some("Caucasus"), Some("Caucasus_r1")));
        assert_eq!(read_level(&dir.path().join("GermanyCW_r2.glb")).unwrap().map.as_deref(), Some("GermanyCW"));
        assert_eq!(read_level(&dir.path().join("Normandy-Caen.glb")).unwrap().map.as_deref(), Some("Normandy"));
        // A level without a theatre keeps its own name.
        std::fs::write(dir.path().join("de_alpha.glb"), b"glTF").unwrap();
        assert_eq!(read_level(&dir.path().join("de_alpha.glb")).unwrap().map.as_deref(), Some("de_alpha"));
    }

    #[test]
    fn props_keep_escaped_commas() {
        let v: Vec<&str> = split_props(r"a=1,Name=F\,16,c=").collect();
        assert_eq!(v, vec!["a=1", r"Name=F\,16", "c="]);
    }

    #[test]
    fn protobuf_fields() {
        // field 5 (map_name) = "de_x", field 13 (build) = 300
        let b = [0x2a, 4, b'd', b'e', b'_', b'x', 0x68, 0xac, 0x02];
        let f = pb_fields(&b);
        assert_eq!(f[0].0, 5);
        assert_eq!(f[0].3, b"de_x");
        assert_eq!((f[1].0, f[1].2), (13, 300));
    }
}
