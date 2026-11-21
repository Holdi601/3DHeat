//! The viewer's dataset, built by the core: what `ingestFiles` and
//! `DatasetBuilder` (src/data/ingestFiles.ts, src/data/builder.ts) build in the
//! page from a selection of Parquet files, built here with every core.
//!
//! Per file, what `ingestParquet` does: the mapped columns read with the row
//! filter, the axes remapped and scaled, time in seconds, the look reduced to
//! yaw and pitch, rows without a position and rows off the stride dropped. Then
//! what the builder does: the files merged in order with shared dictionaries,
//! recordings far apart aligned, time rebased into float32, rows sorted by time,
//! the extent, the roster, the sessions, the lifetimes and the names worn twice.
//!
//! The result is held here and handed out by column (`Built`): the page takes
//! what it keeps, the engine the packed chunks (`pack_chunk`). Held to the web
//! builder by the shared vectors in `native/vectors/build`.
//!
//! What the web build adds on top and this does not (the canonical columns of
//! `canonical.ts`, the value columns of `cost.ts`, a person's objects of
//! `objectTracks.ts`, ISO-8601 text times) the page asks about first: a load that
//! needs them is built in the page.

use std::collections::HashMap;
use std::time::Instant;

use anyhow::{anyhow, Result};
use rayon::prelude::*;

use crate::filter::{Clause, FilterStats};
use crate::parquet::{Kind, Out, ParquetFile, Spec, Unsupported};
use crate::sort::sortable;
use crate::table::Dict;

/// `MAX_GROUPS` (src/render/types.ts): the most categories a column keeps, the most teams.
pub const MAX_GROUPS: usize = 4096;
/// `MAX_SESSIONS` (src/data/builder.ts): the most sessions that keep their labels.
pub const MAX_SESSIONS: usize = 100_000;
/// `SERIES_BREAK_S`: seconds between two sessions of one campaign round.
pub const SERIES_BREAK_S: f64 = 60.0;
/// `SOURCE_COLUMN`.
pub const SOURCE_COLUMN: &str = "Source file";

/// How the look is given (`ColumnMapping.lookMode`).
#[derive(Debug, Clone, Default)]
pub enum Look {
    #[default]
    None,
    YawPitch { yaw: Option<String>, pitch: Option<String>, degrees: bool },
    Vector { x: Option<String>, y: Option<String>, z: Option<String> },
}

/// The parts of a `ColumnMapping` a build reads.
#[derive(Debug, Clone, Default)]
pub struct Mapping {
    pub x: Option<String>,
    pub y: Option<String>,
    pub z: Option<String>,
    pub time: Option<String>,
    /// `TimeUnit`: "seconds", "milliseconds", "unix_milliseconds", ...
    pub time_unit: String,
    pub look: Look,
    pub person: Option<String>,
    pub team: Option<String>,
    pub session: Option<String>,
    /// Columns loaded with the rows, in order: name and whether numeric.
    pub extra: Vec<(String, bool)>,
    /// Columns left to be read when asked (`ColumnMapping.onDemand`), and whether numeric.
    pub on_demand: Vec<(String, bool)>,
    pub up_z: bool,
    pub flip: [bool; 3],
    /// `axes.scale`, 0 for 1.
    pub scale: f64,
}

#[derive(Debug, Clone, Default)]
pub struct BuildSpec {
    pub mapping: Mapping,
    pub filter: Vec<Clause>,
    pub stride: usize,
    /// Each file's name as the page knows it, for the `Source file` column.
    pub names: Vec<String>,
    /// `maxSessions`, 0 for `MAX_SESSIONS`.
    pub max_sessions: usize,
}

/// Why a file was not read, as the page says it (`data.ingestParquet.*`).
#[derive(Debug, Clone)]
pub struct Failure {
    /// A message key of the web app, or empty with `text` for any other error.
    pub key: String,
    pub params: Vec<(String, String)>,
    pub text: String,
}

/// What became of one file.
#[derive(Debug, Clone, Default)]
pub struct FileResult {
    pub rows: usize,
    pub rejected: usize,
    pub filtered: Option<FilterStats>,
    pub failure: Option<Failure>,
    /// The footer's `heat3d` entry, for the page's geo and time label.
    pub hints: Option<String>,
    /// Whether the file's time is wall-clock (a TIMESTAMP, unix units).
    pub time_absolute: bool,
}

/// A column of the built dataset, in sorted order.
pub enum Col {
    F32(Vec<f32>),
    U32(Vec<u32>),
    U16(Vec<u16>),
    U8(Vec<u8>),
}

impl Col {
    pub fn len(&self) -> usize {
        match self {
            Col::F32(v) => v.len(),
            Col::U32(v) => v.len(),
            Col::U16(v) => v.len(),
            Col::U8(v) => v.len(),
        }
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    pub fn bytes(&self) -> &[u8] {
        match self {
            Col::F32(v) => as_bytes(v),
            Col::U32(v) => as_bytes(v),
            Col::U16(v) => as_bytes(v),
            Col::U8(v) => v,
        }
    }

    /// The value at `i` as the GPU's filter columns take it.
    #[inline]
    pub fn get_f32(&self, i: usize) -> f32 {
        match self {
            Col::F32(v) => v[i],
            Col::U32(v) => v[i] as f32,
            Col::U16(v) => v[i] as f32,
            Col::U8(v) => v[i] as f32,
        }
    }

    /// The rows at `idx`, in that order.
    pub fn gather(&self, idx: &[u32]) -> Col {
        fn g<T: Copy + Send + Sync>(v: &[T], idx: &[u32]) -> Vec<T> {
            idx.par_iter().map(|&i| v[i as usize]).collect()
        }
        match self {
            Col::F32(v) => Col::F32(g(v, idx)),
            Col::U32(v) => Col::U32(g(v, idx)),
            Col::U16(v) => Col::U16(g(v, idx)),
            Col::U8(v) => Col::U8(g(v, idx)),
        }
    }
}

fn as_bytes<T: Copy>(v: &[T]) -> &[u8] {
    // SAFETY: plain numbers, no padding, any byte pattern valid as u8.
    unsafe { std::slice::from_raw_parts(v.as_ptr() as *const u8, std::mem::size_of_val(v)) }
}

/// An attribute column (`AttributeColumn`).
pub struct Attr {
    pub name: String,
    /// Category ids into `categories`, or numbers.
    pub data: Col,
    pub categories: Option<Vec<String>>,
    pub min: f64,
    pub max: f64,
}

/// The campaign series the files were arranged into (`Dataset.series`).
#[derive(Debug, Clone)]
pub struct Series {
    pub campaign: String,
    pub sessions: Vec<SeriesSession>,
}

#[derive(Debug, Clone)]
pub struct SeriesSession {
    pub session: u32,
    pub start: f64,
    pub end: f64,
    pub real_start: f64,
}

#[derive(Debug, Clone, Copy, Default)]
pub struct Bounds {
    pub min: [f64; 3],
    pub max: [f64; 3],
}

#[derive(Debug, Clone, Default)]
pub struct Timing {
    pub read_ms: f64,
    pub merge_ms: f64,
    pub sort_ms: f64,
    pub lifetime_ms: f64,
    pub total_ms: f64,
}

/// The dataset, built: `Dataset` in the page's terms.
pub struct Built {
    pub rows: usize,
    pub files: Vec<FileResult>,
    pub sources: usize,
    pub rejected: usize,
    pub x: Vec<f32>,
    pub y: Vec<f32>,
    pub z: Vec<f32>,
    pub time: Option<Vec<f32>>,
    pub epoch_ms: Option<f64>,
    pub time_origin: f64,
    pub time_range: [f64; 2],
    pub yaw: Option<Vec<f32>>,
    pub pitch: Option<Vec<f32>>,
    pub person: Option<Vec<u32>>,
    pub person_labels: Vec<String>,
    pub team: Option<Vec<u16>>,
    pub team_labels: Vec<String>,
    /// Teams before the ceiling dropped them (`groupsDropped`), 0 when kept.
    pub teams_dropped: usize,
    pub session: Option<Vec<u32>>,
    pub session_labels: Vec<String>,
    /// Sessions whose labels were dropped (`sessionsDropped`), 0 when kept.
    pub sessions_dropped: usize,
    pub session_rows: Option<Vec<u32>>,
    pub session_start: Option<Vec<f32>>,
    pub session_end: Option<Vec<f32>>,
    pub person_team: Option<Vec<u16>>,
    pub person_slot: Option<Vec<u16>>,
    pub team_sizes: Option<Vec<u32>>,
    pub lifetime: Option<Vec<f32>>,
    pub max_lifetime_gap: f64,
    pub person_shared: Option<Vec<u8>>,
    pub shared_count: usize,
    pub attrs: Vec<Attr>,
    /// Category columns past `MAX_GROUPS`, with their counts, in order.
    pub dropped_columns: Vec<(String, usize)>,
    pub bounds: Bounds,
    pub aligned: usize,
    pub series: Option<Series>,
    /// Where each row came from, in sorted order: the load order (only kept when
    /// columns are left to be read later).
    pub order: Option<Vec<u32>>,
    /// Per file, the read row (index among the rows its filter kept) of each row
    /// it gave, in load order; with each file's first load row.
    pub kept: Option<(Vec<Vec<u32>>, Vec<usize>)>,
    pub timing: Timing,
}

/// One file's rows on their way into the dataset.
struct Block {
    rows: usize,
    rejected: usize,
    filtered: Option<FilterStats>,
    hints: Option<String>,
    time_absolute: bool,
    person: Option<Vec<String>>,
    team: Option<Vec<String>>,
    session: Option<Vec<String>>,
    /// Per extra column of the mapping: the file's labels, when a category it has.
    cats: Vec<Option<Vec<String>>>,
    /// Per extra column: whether the file has it.
    has: Vec<bool>,
    /// A session id when every row has the same one (local), else -1.
    one_session: i64,
    campaign: String,
    real_start: f64,
    kept: Option<Vec<u32>>,
}

struct Slots<'a> {
    x: &'a mut [f32],
    y: &'a mut [f32],
    z: &'a mut [f32],
    time: Option<&'a mut [f64]>,
    yaw: Option<&'a mut [f32]>,
    pitch: Option<&'a mut [f32]>,
    person: Option<&'a mut [u32]>,
    team: Option<&'a mut [u32]>,
    session: Option<&'a mut [u32]>,
    nums: Vec<Option<&'a mut [f32]>>,
    cats: Vec<Option<&'a mut [u32]>>,
}

fn split<'a, T>(rest: &mut Option<&'a mut [T]>, len: usize) -> Option<&'a mut [T]> {
    rest.take().map(|r| {
        let (a, b) = r.split_at_mut(len);
        *rest = Some(b);
        a
    })
}

/// Seconds per unit (`TIME_SCALE` in src/data/ingest.ts).
fn time_scale(unit: &str) -> f64 {
    match unit {
        "milliseconds" | "unix_milliseconds" => 1e-3,
        "microseconds" => 1e-6,
        "nanoseconds" => 1e-9,
        _ => 1.0,
    }
}

fn is_absolute(unit: &str) -> bool {
    matches!(unit, "unix_seconds" | "unix_milliseconds" | "iso8601")
}

fn failure(key: &str, params: &[(&str, &str)]) -> anyhow::Error {
    anyhow!(FailureError(Failure {
        key: key.into(),
        params: params.iter().map(|(k, v)| (k.to_string(), v.to_string())).collect(),
        text: String::new(),
    }))
}

#[derive(Debug)]
struct FailureError(Failure);

/// No file gave a row: what became of each, for the page to say why.
#[derive(Debug)]
pub struct NoRows(pub Vec<FileResult>);

impl std::fmt::Display for NoRows {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "no rows")
    }
}

impl std::error::Error for NoRows {}

impl std::fmt::Display for FailureError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{} {:?}", self.0.key, self.0.params)
    }
}

impl std::error::Error for FailureError {}

/// Whether the core builds this load, and if not why: what the page then builds itself.
pub fn check(files: &[ParquetFile], spec: &BuildSpec) -> Result<()> {
    let m = &spec.mapping;
    let mapped = [&m.x, &m.y, &m.z].iter().filter(|c| c.is_some()).count();
    if mapped < 2 {
        return Err(Unsupported("fewer than two axes".into()).into());
    }
    for f in files {
        if let Some(t) = &m.time {
            if m.time_unit == "iso8601" && f.columns().iter().any(|c| &c.name == t && c.text && !c.timestamp) {
                return Err(Unsupported("ISO-8601 text times".into()).into());
            }
        }
        if m.person.is_some() && m.person.as_deref() != Some("entity") && f.has_column("pawn") && f.has_column("entity") {
            return Err(Unsupported("a person's objects (pawn and entity)".into()).into());
        }
    }
    Ok(())
}

/// Reads and builds. `progress` hears each phase's name as it starts.
pub fn build(files: &[ParquetFile], spec: &BuildSpec, progress: &(dyn Fn(&str, f64) + Sync)) -> Result<Built> {
    let t0 = Instant::now();
    check(files, spec)?;
    let m = &spec.mapping;
    let step = spec.stride.max(1);
    let filtering = !crate::filter::active(&spec.filter).is_empty();
    let deferred = !m.on_demand.is_empty();

    // Each file's share of the arrays: the rows its filter keeps, on the stride.
    progress("count", 0.0);
    let counts: Vec<Result<u64>> = if filtering {
        files.par_iter().map(|f| f.count(&spec.filter).map(|s| s.kept)).collect()
    } else {
        files.iter().map(|f| Ok(f.rows())).collect()
    };
    let slot: Vec<usize> = counts.iter().map(|c| c.as_ref().map_or(0, |&k| (k as usize).div_ceil(step))).collect();
    let cap: usize = slot.iter().sum();

    let mut x = vec![0f32; cap];
    let mut y = vec![0f32; cap];
    let mut z = vec![0f32; cap];
    let mut time = m.time.as_ref().map(|_| vec![0f64; cap]);
    let (has_yaw, has_pitch) = match &m.look {
        Look::YawPitch { yaw, pitch, .. } => (yaw.is_some(), yaw.is_some() && pitch.is_some()),
        Look::Vector { x, y, z } => {
            let all = x.is_some() && y.is_some() && z.is_some();
            (all, all)
        }
        Look::None => (false, false),
    };
    let mut yaw = has_yaw.then(|| vec![0f32; cap]);
    let mut pitch = has_pitch.then(|| vec![0f32; cap]);
    let mut person = m.person.as_ref().map(|_| vec![0u32; cap]);
    let mut team = m.team.as_ref().map(|_| vec![0u32; cap]);
    let mut session = m.session.as_ref().map(|_| vec![0u32; cap]);
    let any_has = |c: &str| files.iter().any(|f| f.has_column(c));
    let mut nums: Vec<Option<Vec<f32>>> = m.extra.iter().map(|(c, num)| (*num && any_has(c)).then(|| vec![0f32; cap])).collect();
    let mut cats: Vec<Option<Vec<u32>>> = m.extra.iter().map(|(c, num)| (!*num && any_has(c)).then(|| vec![0u32; cap])).collect();

    // Read, a few files at once, each spreading its row groups over every core.
    progress("read", 0.0);
    let t_read = Instant::now();
    let mut results: Vec<Option<Result<Block>>> = (0..files.len()).map(|_| None).collect();
    {
        let mut parts: Vec<(usize, Slots)> = Vec::with_capacity(files.len());
        let mut rx = Some(&mut x[..]);
        let mut ry = Some(&mut y[..]);
        let mut rz = Some(&mut z[..]);
        let mut rt = time.as_deref_mut();
        let mut ryaw = yaw.as_deref_mut();
        let mut rpitch = pitch.as_deref_mut();
        let mut rp = person.as_deref_mut();
        let mut rteam = team.as_deref_mut();
        let mut rs = session.as_deref_mut();
        let mut rn: Vec<Option<&mut [f32]>> = nums.iter_mut().map(|v| v.as_deref_mut()).collect();
        let mut rc: Vec<Option<&mut [u32]>> = cats.iter_mut().map(|v| v.as_deref_mut()).collect();
        for (i, &len) in slot.iter().enumerate() {
            parts.push((
                i,
                Slots {
                    x: split(&mut rx, len).unwrap(),
                    y: split(&mut ry, len).unwrap(),
                    z: split(&mut rz, len).unwrap(),
                    time: split(&mut rt, len),
                    yaw: split(&mut ryaw, len),
                    pitch: split(&mut rpitch, len),
                    person: split(&mut rp, len),
                    team: split(&mut rteam, len),
                    session: split(&mut rs, len),
                    nums: rn.iter_mut().map(|r| split(r, len)).collect(),
                    cats: rc.iter_mut().map(|r| split(r, len)).collect(),
                },
            ));
        }
        // Few files at once: each holds its columns whole until copied in, and spreads its row groups over every core anyway.
        let at_once = (rayon::current_num_threads() / 8).clamp(2, 4);
        let mut parts = parts.into_iter();
        let total = files.len().max(1);
        let mut done = 0usize;
        loop {
            let batch: Vec<_> = parts.by_ref().take(at_once).collect();
            if batch.is_empty() {
                break;
            }
            let got: Vec<(usize, Result<Block>)> = batch
                .into_par_iter()
                .map(|(i, s)| {
                    let r = match &counts[i] {
                        Err(e) => Err(anyhow!("{e:#}")),
                        Ok(_) => read_file(&files[i], spec, s, step, deferred),
                    };
                    (i, r)
                })
                .collect();
            for (i, r) in got {
                results[i] = Some(r);
                done += 1;
            }
            progress("read", done as f64 / total as f64);
        }
    }
    let read_ms = t_read.elapsed().as_secs_f64() * 1e3;

    // What each file gave; a file that failed gives nothing (`failures`), unless it is the only one.
    let t_merge = Instant::now();
    let mut outcomes = Vec::with_capacity(files.len());
    let mut blocks: Vec<Option<Block>> = Vec::with_capacity(files.len());
    for r in results.into_iter() {
        match r.unwrap() {
            Ok(b) => {
                outcomes.push(FileResult {
                    rows: b.rows,
                    rejected: b.rejected,
                    filtered: b.filtered,
                    failure: None,
                    hints: b.hints.clone(),
                    time_absolute: b.time_absolute,
                });
                blocks.push(Some(b));
            }
            Err(e) => {
                let f = match e.downcast::<FailureError>() {
                    Ok(f) => f.0,
                    Err(e) if e.downcast_ref::<Unsupported>().is_some() => return Err(e),
                    Err(e) => Failure { key: String::new(), params: vec![], text: format!("{e:#}") },
                };
                outcomes.push(FileResult { failure: Some(f), ..Default::default() });
                blocks.push(None);
            }
        }
    }

    // Rows close up where a file gave fewer than its share.
    let given: Vec<usize> = blocks.iter().map(|b| b.as_ref().map_or(0, |b| b.rows)).collect();
    let n: usize = given.iter().sum();
    if n < cap {
        squeeze(&mut x, &slot, &given);
        squeeze(&mut y, &slot, &given);
        squeeze(&mut z, &slot, &given);
        for v in [&mut yaw, &mut pitch].into_iter().flatten() {
            squeeze(v, &slot, &given);
        }
        if let Some(v) = &mut time {
            squeeze(v, &slot, &given);
        }
        for v in [&mut person, &mut team, &mut session].into_iter().flatten() {
            squeeze(v, &slot, &given);
        }
        for v in nums.iter_mut().flatten() {
            squeeze(v, &slot, &given);
        }
        for v in cats.iter_mut().flatten() {
            squeeze(v, &slot, &given);
        }
    }
    let mut starts = Vec::with_capacity(given.len());
    let mut at = 0usize;
    for &g in &given {
        starts.push(at);
        at += g;
    }
    if n == 0 {
        return Err(NoRows(outcomes).into());
    }

    // One dictionary per column across the files, in file order (`remapDictionary`).
    let remap = |col: &mut Vec<u32>, labels_of: &dyn Fn(&Block) -> Option<&Vec<String>>, dict: &mut Dict| {
        let maps: Vec<Vec<u32>> = blocks
            .iter()
            .map(|b| match b {
                Some(b) if b.rows > 0 => labels_of(b).map_or(Vec::new(), |l| l.iter().map(|s| dict.intern(s)).collect()),
                _ => Vec::new(),
            })
            .collect();
        let mut parts = Vec::new();
        let mut rest = &mut col[..n];
        for &g in &given {
            let (a, b) = rest.split_at_mut(g);
            parts.push(a);
            rest = b;
        }
        parts.into_par_iter().zip(maps.par_iter()).for_each(|(s, mp)| {
            if !mp.is_empty() {
                s.iter_mut().for_each(|v| *v = mp[*v as usize]);
            }
        });
    };
    let mut person_dict = Dict::new();
    if let Some(p) = person.as_mut() {
        remap(p, &|b| b.person.as_ref(), &mut person_dict);
    }
    let mut team_dict = Dict::new();
    if let Some(t) = team.as_mut() {
        remap(t, &|b| b.team.as_ref(), &mut team_dict);
    }
    let mut session_dict = Dict::new();
    if let Some(s) = session.as_mut() {
        remap(s, &|b| b.session.as_ref(), &mut session_dict);
    }

    // Attribute columns in the order first seen, the file-origin column after a file's own.
    let multi = files.len() > 1;
    let mut order_names: Vec<usize> = Vec::new(); // index into extra, or usize::MAX for the source
    for b in blocks.iter().flatten() {
        if b.rows == 0 {
            continue;
        }
        for (k, h) in b.has.iter().enumerate() {
            if *h && !order_names.contains(&k) {
                order_names.push(k);
            }
        }
        if multi && !order_names.contains(&usize::MAX) {
            order_names.push(usize::MAX);
        }
    }
    let mut cat_dicts: Vec<Option<Dict>> = (0..m.extra.len()).map(|_| None).collect();
    for (k, col) in cats.iter_mut().enumerate() {
        if let Some(col) = col {
            let mut d = Dict::new();
            d.intern("");
            remap(col, &|b| b.cats[k].as_ref(), &mut d);
            cat_dicts[k] = Some(d);
        }
    }
    let mut source: Option<(Vec<u32>, Dict)> = None;
    if multi {
        let mut d = Dict::new();
        d.intern("");
        let mut col = vec![0u32; n];
        for (i, b) in blocks.iter().enumerate() {
            if let Some(b) = b {
                if b.rows > 0 {
                    let id = d.intern(spec.names.get(i).map_or("", |s| s.as_str()));
                    col[starts[i]..starts[i] + b.rows].par_iter_mut().for_each(|v| *v = id);
                }
            }
        }
        source = Some((col, d));
    }

    // Per block: its first row, one session, campaign and real start (`alignRecordings`).
    let mut b_start = Vec::new();
    let mut b_session = Vec::new();
    let mut b_campaign = Vec::new();
    let mut b_real = Vec::new();
    for (i, b) in blocks.iter().enumerate() {
        let Some(b) = b else { continue };
        if b.rows == 0 {
            continue;
        }
        b_start.push(starts[i]);
        b_session.push(match (&session, b.one_session) {
            (Some(s), o) if o >= 0 => s[starts[i]] as i64,
            _ => -1,
        });
        b_campaign.push(b.campaign.clone());
        b_real.push(b.real_start);
    }
    let sources = blocks.iter().filter(|b| b.is_some()).count();
    let rejected: usize = blocks.iter().flatten().map(|b| b.rejected).sum();
    let time_absolute = blocks.iter().flatten().any(|b| b.rows > 0 && b.time_absolute);
    let kept = deferred.then(|| (blocks.iter_mut().map(|b| b.as_mut().and_then(|b| b.kept.take()).unwrap_or_default()).collect(), starts.clone()));
    drop(blocks);
    x.truncate(n);
    y.truncate(n);
    z.truncate(n);
    for v in [&mut yaw, &mut pitch].into_iter().flatten() {
        v.truncate(n);
    }
    for v in [&mut person, &mut team, &mut session].into_iter().flatten() {
        v.truncate(n);
    }
    for v in nums.iter_mut().flatten() {
        v.truncate(n);
    }
    for v in cats.iter_mut().flatten() {
        v.truncate(n);
    }
    if let Some(t) = &mut time {
        t.truncate(n);
    }

    // ------------------------------------------------------------ finish
    progress("time", 0.0);
    let mut aligned = 0usize;
    let mut series = None;
    if let (Some(t), Some(_)) = (time.as_mut(), session.as_ref()) {
        let (a, s) = align_recordings(t, &b_start, &b_session, &b_campaign, &b_real, n);
        aligned = a;
        series = s;
    }
    let (mut time32, mut epoch_ms, mut time_origin) = (None, None, 0.0);
    if let Some(t) = time.take() {
        let min = t.par_iter().copied().filter(|v| v.is_finite()).reduce(|| f64::INFINITY, f64::min);
        if min.is_finite() {
            time32 = Some(t.par_iter().map(|&v| if v.is_finite() { (v - min) as f32 } else { 0.0 }).collect::<Vec<f32>>());
            if time_absolute && aligned == 0 {
                epoch_ms = Some(min * 1000.0);
            } else {
                time_origin = min;
            }
        }
    }

    // Attributes in their order; a category past the ceiling dropped, with a warning.
    let mut attrs = Vec::new();
    let mut dropped_columns = Vec::new();
    let mut nums_by: Vec<Option<Vec<f32>>> = nums;
    let mut cats_by: Vec<Option<Vec<u32>>> = cats;
    for &k in &order_names {
        if k == usize::MAX {
            let (col, d) = source.take().unwrap();
            push_category(&mut attrs, &mut dropped_columns, SOURCE_COLUMN, col, d.labels);
            continue;
        }
        let name = &m.extra[k].0;
        if let Some(v) = nums_by[k].take() {
            let (mn, mx) = min_max(&v);
            attrs.push(Attr { name: name.clone(), data: Col::F32(v), categories: None, min: mn, max: mx });
        } else if let Some(v) = cats_by[k].take() {
            let d = cat_dicts[k].take().unwrap();
            push_category(&mut attrs, &mut dropped_columns, name, v, d.labels);
        }
    }
    drop(nums_by);
    drop(cats_by);
    let merge_ms = t_merge.elapsed().as_secs_f64() * 1e3;

    // Sorted by time, every column permuted alike.
    progress("sort", 0.0);
    let t_sort = Instant::now();
    let order: Option<Vec<u32>> = match &time32 {
        Some(t) if !t.par_windows(2).all(|w| !(w[1] < w[0])) => Some(stable_order(t)),
        _ => None,
    };
    let teams_dropped = if team.is_some() && team_dict.labels.len() > MAX_GROUPS { team_dict.labels.len() } else { 0 };
    if teams_dropped > 0 {
        team = None;
    }
    // Narrowed to 16 bits before the sort: half the bytes to move.
    let mut team16: Option<Vec<u16>> = team.take().map(|t| t.par_iter().map(|&v| v as u16).collect());
    if let Some(o) = &order {
        let f = |v: &mut Vec<f32>| *v = o.par_iter().map(|&i| v[i as usize]).collect();
        let u = |v: &mut Vec<u32>| *v = o.par_iter().map(|&i| v[i as usize]).collect();
        f(&mut x);
        f(&mut y);
        f(&mut z);
        if let Some(t) = &mut time32 {
            f(t);
        }
        for v in [&mut yaw, &mut pitch].into_iter().flatten() {
            f(v);
        }
        for v in [&mut person, &mut session].into_iter().flatten() {
            u(v);
        }
        if let Some(t) = &mut team16 {
            *t = o.par_iter().map(|&i| t[i as usize]).collect();
        }
        for a in &mut attrs {
            a.data = a.data.gather(o);
        }
    }
    let sort_ms = t_sort.elapsed().as_secs_f64() * 1e3;

    let time_range = match &time32 {
        Some(t) => [t[0] as f64, t[n - 1] as f64],
        None => [0.0, 0.0],
    };
    progress("extent", 0.0);
    let bounds = extent_of(&x, &y, &z);
    progress("roster", 0.0);
    let (person_team, person_slot, team_sizes) = match &person {
        Some(p) if !person_dict.labels.is_empty() => {
            let (a, b, c) = roster(p, team16.as_deref(), person_dict.labels.len(), if team16.is_some() { team_dict.labels.len() } else { 0 });
            (Some(a), Some(b), Some(c))
        }
        _ => (None, None, None),
    };
    let max_sessions = if spec.max_sessions > 0 { spec.max_sessions } else { MAX_SESSIONS };
    let (mut session_rows, mut session_start, mut session_end) = (None, None, None);
    if let Some(s) = &session {
        if session_dict.labels.len() <= max_sessions {
            progress("sessions", 0.0);
            let (r, a, b) = summarise_sessions(s, time32.as_deref(), session_dict.labels.len());
            session_rows = Some(r);
            session_start = Some(a);
            session_end = Some(b);
        }
    }
    let t_life = Instant::now();
    let (mut lifetime, mut max_gap, mut person_shared, mut shared_count) = (None, 0.0, None, 0usize);
    if let (Some(t), Some(p)) = (&time32, &person) {
        progress("lifetimes", 0.0);
        let cat_cols: Vec<&[u32]> = attrs
            .iter()
            .filter(|a| a.categories.is_some())
            .filter_map(|a| match &a.data {
                Col::U32(v) => Some(&v[..]),
                _ => None,
            })
            .collect();
        let d = [bounds.max[0] - bounds.min[0], bounds.max[1] - bounds.min[1], bounds.max[2] - bounds.min[2]];
        let diag = (d[0] * d[0] + d[1] * d[1] + d[2] * d[2]).sqrt();
        let sep = diag * 0.01;
        let life = lifetimes(&Rows { time: t, person: p, session: session.as_deref(), x: &x, y: &y, z: &z, cats: &cat_cols, step: 1 }, person_dict.labels.len(), sep * sep);
        lifetime = Some(life.lifetime);
        max_gap = life.max_gap;
        shared_count = life.shared_count;
        person_shared = Some(life.shared);
    }
    let lifetime_ms = t_life.elapsed().as_secs_f64() * 1e3;
    let mut session_labels = if session.is_some() { session_dict.labels } else { Vec::new() };
    let mut sessions_dropped = 0;
    if session.is_some() && session_labels.len() > max_sessions {
        sessions_dropped = session_labels.len();
        session_labels = Vec::new();
        session_rows = None;
        session_start = None;
        session_end = None;
    }

    Ok(Built {
        rows: n,
        files: outcomes,
        sources,
        rejected,
        x,
        y,
        z,
        time: time32,
        epoch_ms,
        time_origin,
        time_range,
        yaw,
        pitch,
        person,
        person_labels: person_dict.labels,
        team_labels: if team16.is_some() { team_dict.labels } else { Vec::new() },
        team: team16,
        teams_dropped,
        session,
        session_labels,
        sessions_dropped,
        session_rows,
        session_start,
        session_end,
        person_team,
        person_slot,
        team_sizes,
        lifetime,
        max_lifetime_gap: max_gap,
        person_shared,
        shared_count,
        attrs,
        dropped_columns,
        bounds,
        aligned,
        series,
        order: if deferred { order.or_else(|| Some((0..n as u32).collect())) } else { None },
        kept,
        timing: Timing { read_ms, merge_ms, sort_ms, lifetime_ms, total_ms: t0.elapsed().as_secs_f64() * 1e3 },
    })
}

fn push_category(attrs: &mut Vec<Attr>, dropped: &mut Vec<(String, usize)>, name: &str, data: Vec<u32>, labels: Vec<String>) {
    if labels.len() > MAX_GROUPS {
        dropped.push((name.to_owned(), labels.len()));
        return;
    }
    let max = labels.len().saturating_sub(1) as f64;
    attrs.push(Attr { name: name.to_owned(), data: Col::U32(data), categories: Some(labels), min: 0.0, max });
}

/// `minMax` of the builder: over the finite values, 0 when none.
fn min_max(v: &[f32]) -> (f64, f64) {
    let (mn, mx) = v
        .par_iter()
        .filter(|x| x.is_finite())
        .fold(|| (f32::INFINITY, f32::NEG_INFINITY), |(a, b), &x| (a.min(x), b.max(x)))
        .reduce(|| (f32::INFINITY, f32::NEG_INFINITY), |(a, b), (c, d)| (a.min(c), b.max(d)));
    (if mn.is_finite() { mn as f64 } else { 0.0 }, if mx.is_finite() { mx as f64 } else { 0.0 })
}

/// Moves each file's rows to follow the previous file's, where files gave fewer than their share.
fn squeeze<T: Copy>(v: &mut [T], slot: &[usize], given: &[usize]) {
    let mut from = 0usize;
    let mut to = 0usize;
    for (&s, &g) in slot.iter().zip(given) {
        if from != to {
            v.copy_within(from..from + g, to);
        }
        from += s;
        to += g;
    }
}

/// The stable order of `time`, as the web app's radix sort gives it.
pub fn stable_order(t: &[f32]) -> Vec<u32> {
    assert!(t.len() <= u32::MAX as usize, "rows past 2^32 need wider row ids");
    let mut keys: Vec<u64> = t.par_iter().enumerate().map(|(i, &v)| ((sortable(v) as u64) << 32) | i as u64).collect();
    keys.par_sort_unstable();
    keys.par_iter().map(|&k| k as u32).collect()
}

fn read_file(f: &ParquetFile, spec: &BuildSpec, mut s: Slots, step: usize, deferred: bool) -> Result<Block> {
    let m = &spec.mapping;
    let total = f.rows();
    if total == 0 {
        return Err(failure("data.ingestParquet.noRows", &[]));
    }
    let mut specs: Vec<Spec> = Vec::new();
    let mut need = |name: &Option<String>, role: &str, kind: Kind| -> Result<Option<usize>> {
        let Some(c) = name else { return Ok(None) };
        if !f.has_column(c) {
            return Err(failure("data.ingestParquet.noColumn", &[("column", c), ("role", role)]));
        }
        specs.push(Spec { name: c.clone(), kind });
        Ok(Some(specs.len() - 1))
    };
    let sx = need(&m.x, "x", Kind::F32)?;
    let sy = need(&m.y, "y", Kind::F32)?;
    let sz = need(&m.z, "z", Kind::F32)?;
    let (mut syaw, mut spitch, mut sdx, mut sdy, mut sdz, mut degrees) = (None, None, None, None, None, false);
    match &m.look {
        Look::YawPitch { yaw, pitch, degrees: d } => {
            syaw = need(yaw, "yaw", Kind::F32)?;
            spitch = need(pitch, "pitch", Kind::F32)?;
            degrees = *d;
        }
        Look::Vector { x, y, z } => {
            sdx = need(x, "dirX", Kind::F32)?;
            sdy = need(y, "dirY", Kind::F32)?;
            sdz = need(z, "dirZ", Kind::F32)?;
        }
        Look::None => {}
    }
    let timestamp = m.time.as_ref().is_some_and(|t| f.columns().iter().any(|c| &c.name == t && c.timestamp));
    let unit = if timestamp || m.time_unit == "iso8601" { "unix_milliseconds" } else { m.time_unit.as_str() };
    let st = need(&m.time, "time", Kind::F64)?;
    let sp = need(&m.person, "person", Kind::Dict)?;
    let steam = need(&m.team, "team", Kind::Dict)?;
    let ss = need(&m.session, "session", Kind::Dict)?;
    let mut sextra = Vec::with_capacity(m.extra.len());
    for (c, num) in &m.extra {
        if f.has_column(c) {
            specs.push(Spec { name: c.clone(), kind: if *num { Kind::F32 } else { Kind::Dict } });
            sextra.push(Some(specs.len() - 1));
        } else {
            sextra.push(None);
        }
    }
    let hints = f.hints();
    let r = f.read(&specs, &spec.filter, false)?;
    let filtered = r.filtered;
    let n = r.rows;
    let time_absolute = is_absolute(unit);
    if n == 0 {
        return Ok(Block {
            rows: 0,
            rejected: 0,
            filtered,
            hints,
            time_absolute: false,
            person: None,
            team: None,
            session: None,
            cats: vec![None; m.extra.len()],
            has: vec![false; m.extra.len()],
            one_session: -1,
            campaign: String::new(),
            real_start: f64::NAN,
            kept: deferred.then(Vec::new),
        });
    }
    let mut cols: Vec<Option<Out>> = r.columns.into_iter().map(Some).collect();
    let mut f32_of = |k: Option<usize>| -> Option<Vec<f32>> {
        k.and_then(|k| match cols[k].take() {
            Some(Out::F32(v)) => Some(v),
            _ => None,
        })
    };
    let rx = f32_of(sx);
    let ry = f32_of(sy);
    let rz = f32_of(sz);
    let yraw = f32_of(syaw);
    let praw = f32_of(spitch);
    let dx = f32_of(sdx);
    let dy = f32_of(sdy);
    let dz = f32_of(sdz);
    let tm = st.and_then(|k| match cols[k].take() {
        Some(Out::F64(v)) => Some(v),
        _ => None,
    });
    let mut dict_of = |k: Option<usize>| -> Option<Dict> {
        k.and_then(|k| match cols[k].take() {
            Some(Out::Dict(d)) => Some(d),
            _ => None,
        })
    };
    let pd = dict_of(sp);
    let td = dict_of(steam);
    let sd = dict_of(ss);
    let extras: Vec<Option<Out>> = sextra.iter().map(|k| k.and_then(|k| cols[k].take())).collect();

    // The axes: scale, flips, and Z-up relabelled to Y-up (`remapAxesInPlace`).
    let sc = if m.scale != 0.0 { m.scale } else { 1.0 };
    let sgn = |b: bool| if b { -1.0 } else { 1.0 };
    let (fx, fy, fz) = (sgn(m.flip[0]) * sc, sgn(m.flip[1]) * sc, sgn(m.flip[2]) * sc);
    let raw = |v: &Option<Vec<f32>>, i: usize| v.as_ref().map_or(0.0, |v| v[i]);
    let world = |i: usize| -> (f32, f32, f32) {
        let (a, b, c) = (raw(&rx, i) as f64, raw(&ry, i) as f64, raw(&rz, i) as f64);
        if m.up_z {
            ((a * fx) as f32, (c * fz) as f32, (b * fy) as f32)
        } else {
            ((a * fx) as f32, (b * fy) as f32, (c * fz) as f32)
        }
    };
    // Rows on the stride with a whole position.
    let mut keep: Vec<u32> = Vec::with_capacity(n.div_ceil(step));
    let mut i = 0;
    while i < n {
        let (a, b, c) = world(i);
        if a.is_finite() && b.is_finite() && c.is_finite() {
            keep.push(i as u32);
        }
        i += step;
    }
    let kept = keep.len();
    if kept == 0 {
        return Err(failure("data.ingestParquet.noPositions", &[]));
    }
    let tscale = time_scale(unit);
    for (o, &r) in keep.iter().enumerate() {
        let r = r as usize;
        let (a, b, c) = world(r);
        s.x[o] = a;
        s.y[o] = b;
        s.z[o] = c;
    }
    if let (Some(out), Some(t)) = (s.time.as_deref_mut(), &tm) {
        for (o, &r) in keep.iter().enumerate() {
            let v = t[r as usize];
            out[o] = if v.is_finite() { v * tscale } else { f64::NAN };
        }
    }
    // The look as yaw and pitch radians in the Y-up world (`buildLookFrom`).
    match &m.look {
        Look::YawPitch { .. } => {
            if let (Some(out), Some(y)) = (s.yaw.as_deref_mut(), &yraw) {
                let k = if degrees { std::f64::consts::PI / 180.0 } else { 1.0 };
                for (o, &r) in keep.iter().enumerate() {
                    out[o] = (or_zero(y[r as usize]) * k) as f32;
                }
                if let (Some(out), Some(p)) = (s.pitch.as_deref_mut(), &praw) {
                    for (o, &r) in keep.iter().enumerate() {
                        out[o] = (or_zero(p[r as usize]) * k) as f32;
                    }
                }
            }
        }
        Look::Vector { .. } => {
            if let (Some(oy), Some(op), Some(dx), Some(dy), Some(dz)) = (s.yaw.as_deref_mut(), s.pitch.as_deref_mut(), &dx, &dy, &dz) {
                let (gx, gy, gz) = (sgn(m.flip[0]), sgn(m.flip[1]), sgn(m.flip[2]));
                for (o, &r) in keep.iter().enumerate() {
                    let r = r as usize;
                    let wx = or_zero(dx[r]) * gx;
                    let wy = if m.up_z { or_zero(dz[r]) * gz } else { or_zero(dy[r]) * gy };
                    let wz = if m.up_z { or_zero(dy[r]) * gy } else { or_zero(dz[r]) * gz };
                    oy[o] = wx.atan2(-wz) as f32;
                    op[o] = wy.atan2(wx.hypot(wz)) as f32;
                }
            }
        }
        Look::None => {}
    }
    let ids = |d: &Option<Dict>, out: Option<&mut [u32]>| {
        if let (Some(d), Some(out)) = (d, out) {
            for (o, &r) in keep.iter().enumerate() {
                out[o] = d.ids[r as usize];
            }
        }
    };
    ids(&pd, s.person.as_deref_mut());
    ids(&td, s.team.as_deref_mut());
    ids(&sd, s.session.as_deref_mut());
    let mut one_session = -1i64;
    if let Some(d) = &sd {
        let first = d.ids[keep[0] as usize];
        one_session = if keep.iter().all(|&r| d.ids[r as usize] == first) { first as i64 } else { -1 };
    }
    let mut cats = vec![None; m.extra.len()];
    let mut has = vec![false; m.extra.len()];
    let mut campaign = String::new();
    let mut real_start = f64::NAN;
    for (k, e) in extras.iter().enumerate() {
        let Some(e) = e else { continue };
        has[k] = true;
        let name = &m.extra[k].0;
        match e {
            Out::F32(v) => {
                if let Some(out) = s.nums[k].as_deref_mut() {
                    for (o, &r) in keep.iter().enumerate() {
                        out[o] = v[r as usize];
                    }
                }
                if name == "sessionStart" {
                    real_start = keep.iter().map(|&r| v[r as usize] as f64).find(|t| t.is_finite()).unwrap_or(f64::NAN);
                }
            }
            Out::Dict(d) => {
                if let Some(out) = s.cats[k].as_deref_mut() {
                    for (o, &r) in keep.iter().enumerate() {
                        out[o] = d.ids[r as usize];
                    }
                }
                if name == "campaign" {
                    let first = d.ids[keep[0] as usize];
                    if keep.iter().all(|&r| d.ids[r as usize] == first) {
                        campaign = d.labels.get(first as usize).cloned().unwrap_or_default();
                    }
                }
                cats[k] = Some(d.labels.clone());
            }
            Out::F64(_) => {}
        }
    }
    // A recording's session label ends in its start, to the minute.
    if let Some(d) = &sd {
        if d.labels.len() == 1 {
            if let Some(exact) = stamp_seconds(&d.labels[0]) {
                if !real_start.is_finite() || (exact - real_start).abs() < 300.0 {
                    real_start = exact;
                }
            }
        }
    }
    Ok(Block {
        rows: kept,
        rejected: n - kept,
        filtered,
        hints,
        time_absolute,
        person: pd.map(|d| d.labels),
        team: td.map(|d| d.labels),
        session: sd.map(|d| d.labels),
        cats,
        has,
        one_session,
        campaign,
        real_start,
        kept: deferred.then_some(keep),
    })
}

/// `v || 0`, as a double.
#[inline]
fn or_zero(v: f32) -> f64 {
    if v.is_nan() || v == 0.0 {
        0.0
    } else {
        v as f64
    }
}

/// Seconds of `YYYY-MM-DD[ T]HH:MM` at the end of a label, as `Date.parse` reads it in UTC.
fn stamp_seconds(label: &str) -> Option<f64> {
    let b = label.as_bytes();
    if b.len() < 16 {
        return None;
    }
    let s = &b[b.len() - 16..];
    let digit = |i: usize| s[i].is_ascii_digit();
    let ok = (0..4).all(digit)
        && s[4] == b'-'
        && digit(5)
        && digit(6)
        && s[7] == b'-'
        && digit(8)
        && digit(9)
        && (s[10] == b' ' || s[10] == b'T')
        && digit(11)
        && digit(12)
        && s[13] == b':'
        && digit(14)
        && digit(15);
    if !ok {
        return None;
    }
    let num = |a: usize, b: usize| -> i64 { s[a..b].iter().fold(0, |n, &c| n * 10 + (c - b'0') as i64) };
    let (y, mo, d, h, mi) = (num(0, 4), num(5, 7), num(8, 10), num(11, 13), num(14, 16));
    let leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
    let dim = [31, if leap { 29 } else { 28 }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if !(1..=12).contains(&mo) || d < 1 || d > dim[(mo - 1) as usize] || h > 24 || mi > 59 || (h == 24 && mi != 0) {
        return None;
    }
    // Days from the civil date (Howard Hinnant's algorithm).
    let yy = if mo <= 2 { y - 1 } else { y };
    let era = if yy >= 0 { yy } else { yy - 399 } / 400;
    let yoe = yy - era * 400;
    let mp = (mo + 9) % 12;
    let doy = (153 * mp + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    let days = era * 146097 + doe - 719468;
    Some((days * 86400 + h * 3600 + mi * 60) as f64)
}

/// `alignRecordings`: recordings far apart in time, each its own match, started together.
fn align_recordings(time: &mut [f64], starts: &[usize], session: &[i64], campaign: &[String], real: &[f64], n: usize) -> (usize, Option<Series>) {
    let b = starts.len();
    if b < 2 {
        return (0, None);
    }
    let mut seen = std::collections::HashSet::new();
    for &s in session {
        if s < 0 || !seen.insert(s) {
            return (0, None);
        }
    }
    let end = |k: usize| if k + 1 < b { starts[k + 1] } else { n };
    let mut lo = vec![f64::INFINITY; b];
    let mut hi = vec![f64::NEG_INFINITY; b];
    for k in 0..b {
        for &v in &time[starts[k]..end(k)] {
            if v < lo[k] {
                lo[k] = v;
            }
            if v > hi[k] {
                hi[k] = v;
            }
        }
    }
    let camp = &campaign[0];
    if !camp.is_empty() && campaign.iter().all(|c| c == camp) && real.iter().all(|t| t.is_finite()) {
        let mut order: Vec<usize> = (0..b).filter(|&k| hi[k] >= lo[k]).collect();
        order.sort_by(|&a, &c| {
            let d = real[a] - real[c];
            if d != 0.0 && !d.is_nan() {
                d.partial_cmp(&0.0).unwrap()
            } else {
                a.cmp(&c)
            }
        });
        let mut at = 0.0;
        let mut sessions = Vec::new();
        for &k in &order {
            let shift = at - lo[k];
            for v in &mut time[starts[k]..end(k)] {
                *v += shift;
            }
            sessions.push(SeriesSession { session: session[k] as u32, start: at, end: at + (hi[k] - lo[k]), real_start: real[k] });
            at += hi[k] - lo[k] + SERIES_BREAK_S;
        }
        return (order.len(), Some(Series { campaign: camp.clone(), sessions }));
    }
    let (mut first, mut last, mut covered) = (f64::INFINITY, f64::NEG_INFINITY, 0.0);
    for k in 0..b {
        if !(hi[k] >= lo[k]) {
            continue;
        }
        first = first.min(lo[k]);
        last = last.max(hi[k]);
        covered += hi[k] - lo[k];
    }
    if !(last - first > 4.0 * covered.max(1.0)) {
        return (0, None);
    }
    for k in 0..b {
        if !(hi[k] >= lo[k]) {
            continue;
        }
        let l = lo[k];
        for v in &mut time[starts[k]..end(k)] {
            *v -= l;
        }
    }
    (b, None)
}

/// `extentOf` (src/data/extent.ts): the box of the rows, outliers far off ignored.
pub fn extent_of(px: &[f32], py: &[f32], pz: &[f32]) -> Bounds {
    const FAR: f64 = 1e9;
    const SAMPLE: usize = 65536;
    const REACH: f64 = 10.0;
    let n = px.len();
    let ok = |v: f64| v > -FAR && v < FAR;
    let step = (n / SAMPLE).max(1);
    let (mut xs, mut ys, mut zs) = (Vec::new(), Vec::new(), Vec::new());
    let mut i = 0;
    while i < n {
        let (x, y, z) = (px[i] as f64, py[i] as f64, pz[i] as f64);
        if ok(x) && ok(y) && ok(z) {
            xs.push(x);
            ys.push(y);
            zs.push(z);
        }
        i += step;
    }
    let mut lo = [-FAR; 3];
    let mut hi = [FAR; 3];
    if !xs.is_empty() {
        let qs: Vec<(f64, f64)> = [xs, ys, zs]
            .into_iter()
            .map(|mut a| {
                a.sort_by(|p, q| p.partial_cmp(q).unwrap());
                let l = a.len() - 1;
                (a[(l as f64 * 0.01).floor() as usize], a[(l as f64 * 0.99).ceil() as usize])
            })
            .collect();
        let widest = qs.iter().map(|(a, c)| c - a).fold(f64::NEG_INFINITY, f64::max);
        for (k, (a, c)) in qs.iter().enumerate() {
            let reach = REACH * (c - a).max(widest).max(1e-6);
            lo[k] = (a - reach).max(-FAR);
            hi[k] = (c + reach).min(FAR);
        }
    }
    let fold = |acc: Bounds, i: usize| -> Bounds {
        let (x, y, z) = (px[i] as f64, py[i] as f64, pz[i] as f64);
        if !(x >= lo[0] && x <= hi[0] && y >= lo[1] && y <= hi[1] && z >= lo[2] && z <= hi[2]) {
            return acc;
        }
        let mut b = acc;
        for (k, v) in [x, y, z].into_iter().enumerate() {
            if v < b.min[k] {
                b.min[k] = v;
            }
            if v > b.max[k] {
                b.max[k] = v;
            }
        }
        b
    };
    let empty = Bounds { min: [f64::INFINITY; 3], max: [f64::NEG_INFINITY; 3] };
    (0..n).into_par_iter().fold(|| empty, fold).reduce(
        || empty,
        |a, b| Bounds {
            min: [a.min[0].min(b.min[0]), a.min[1].min(b.min[1]), a.min[2].min(b.min[2])],
            max: [a.max[0].max(b.max[0]), a.max[1].max(b.max[1]), a.max[2].max(b.max[2])],
        },
    )
}

/// `buildRoster`: person to team, person to slot within it, team sizes.
fn roster(person: &[u32], team: Option<&[u16]>, people: usize, teams: usize) -> (Vec<u16>, Vec<u16>, Vec<u32>) {
    let mut person_team = vec![0u16; people];
    if let Some(t) = team {
        let mut seen = vec![false; people];
        for (i, &p) in person.iter().enumerate() {
            let p = p as usize;
            if !seen[p] {
                seen[p] = true;
                person_team[p] = t[i];
            }
        }
    }
    let mut sizes = vec![0u32; teams.max(1)];
    let mut slot = vec![0u16; people];
    for p in 0..people {
        let t = person_team[p] as usize;
        slot[p] = sizes[t].min(65535) as u16;
        sizes[t] += 1;
    }
    (person_team, slot, sizes)
}

/// `summariseSessions`: rows and time span per session.
fn summarise_sessions(session: &[u32], time: Option<&[f32]>, count: usize) -> (Vec<u32>, Vec<f32>, Vec<f32>) {
    let size = count.max(1);
    let mut rows = vec![0u32; size];
    let mut start = vec![f32::INFINITY; size];
    let mut end = vec![f32::NEG_INFINITY; size];
    for (i, &s) in session.iter().enumerate() {
        let s = s as usize;
        rows[s] += 1;
        if let Some(t) = time {
            let v = t[i];
            if v < start[s] {
                start[s] = v;
            }
            if v > end[s] {
                end[s] = v;
            }
        }
    }
    for s in 0..size {
        if !start[s].is_finite() {
            start[s] = 0.0;
        }
        if !end[s].is_finite() {
            end[s] = 0.0;
        }
    }
    (rows, start, end)
}

/// The columns lifetimes read, in sorted order.
pub struct Rows<'a> {
    pub time: &'a [f32],
    pub person: &'a [u32],
    pub session: Option<&'a [u32]>,
    pub x: &'a [f32],
    pub y: &'a [f32],
    pub z: &'a [f32],
    pub cats: &'a [&'a [u32]],
    /// Every `step`-th row only (a thinned copy, read in place); 0 or 1 for all.
    pub step: usize,
}

pub struct Lifetimes {
    pub lifetime: Vec<f32>,
    pub max_gap: f64,
    pub shared: Vec<u8>,
    pub shared_count: usize,
}

/// `computeLifetimes`: each row's gap to its track's next row (a track is a person
/// within a session), and the names worn by two things at once. Each core takes a
/// run of rows; the runs are stitched track by track.
pub fn lifetimes(r: &Rows, people: usize, min_sep_sq: f64) -> Lifetimes {
    let st = r.step.max(1);
    let n = r.time.len().div_ceil(st);
    let mut lifetime = vec![-1f32; n];
    let shared: Vec<std::sync::atomic::AtomicU8> = (0..people.max(1)).map(|_| std::sync::atomic::AtomicU8::new(0)).collect();
    let sessions = r.session.map_or(1, |s| s.par_iter().copied().max().map_or(1, |m| m as usize + 1));
    let key = |i: usize| -> u64 { r.person[i * st] as u64 * sessions as u64 + r.session.map_or(0, |s| s[i * st] as u64) };
    // One pair of rows, a track's sample and its next: the shared-name test and the gap.
    let pair = |prev: usize, i: usize| -> Option<f64> {
        let p = r.person[i * st] as usize;
        let ti = r.time[i * st];
        let tp = r.time[prev * st];
        if ti == tp && shared[p].load(std::sync::atomic::Ordering::Relaxed) == 0 {
            let dx = r.x[i * st] as f64 - r.x[prev * st] as f64;
            let dy = r.y[i * st] as f64 - r.y[prev * st] as f64;
            let dz = r.z[i * st] as f64 - r.z[prev * st] as f64;
            if dx * dx + dy * dy + dz * dz > min_sep_sq && r.cats.iter().all(|c| c[i * st] == c[prev * st]) {
                shared[p].store(1, std::sync::atomic::Ordering::Relaxed);
            }
        }
        let gap = ti as f64 - tp as f64;
        if gap == 0.0 && (r.x[i * st] != r.x[prev * st] || r.y[i * st] != r.y[prev * st] || r.z[i * st] != r.z[prev * st]) {
            None
        } else {
            Some(gap)
        }
    };
    let runs = rayon::current_num_threads().max(1) * 4;
    let len = n.div_ceil(runs).max(1 << 16);
    const NONE: u32 = u32::MAX;
    let tracks = people.max(1) as u64 * sessions as u64;
    let dense = tracks <= 1 << 18;
    // Per run: each track's first and last row in it.
    type Ends = Vec<(u64, u32, u32)>;
    let ends: Vec<(Ends, f64)> = lifetime
        .par_chunks_mut(len)
        .enumerate()
        .map(|(k, out)| {
            let base = k * len;
            let mut mx = 0f64;
            let list: Ends;
            if dense {
                let mut first = vec![NONE; tracks as usize];
                let mut last = vec![NONE; tracks as usize];
                let mut seen: Vec<u32> = Vec::new();
                for i in base..base + out.len() {
                    let t = key(i) as usize;
                    let prev = last[t];
                    if prev == NONE {
                        first[t] = i as u32;
                        seen.push(t as u32);
                    } else if let Some(g) = pair(prev as usize, i) {
                        out[prev as usize - base] = g as f32;
                        mx = mx.max(g);
                    }
                    last[t] = i as u32;
                }
                seen.sort_unstable();
                list = seen.into_iter().map(|t| (t as u64, first[t as usize], last[t as usize])).collect();
            } else {
                let mut map: HashMap<u64, (u32, u32)> = HashMap::new();
                for i in base..base + out.len() {
                    let t = key(i);
                    match map.get_mut(&t) {
                        None => {
                            map.insert(t, (i as u32, i as u32));
                        }
                        Some(e) => {
                            let prev = e.1;
                            if let Some(g) = pair(prev as usize, i) {
                                out[prev as usize - base] = g as f32;
                                mx = mx.max(g);
                            }
                            e.1 = i as u32;
                        }
                    }
                }
                list = map.into_iter().map(|(t, (a, b))| (t, a, b)).collect();
            }
            (list, mx)
        })
        .collect();
    let mut max_gap = 0f64;
    let mut carry: HashMap<u64, u32> = HashMap::new();
    for (list, mx) in &ends {
        max_gap = max_gap.max(*mx);
        for &(t, first, last) in list {
            if let Some(&prev) = carry.get(&t) {
                if let Some(g) = pair(prev as usize, first as usize) {
                    lifetime[prev as usize] = g as f32;
                    max_gap = max_gap.max(g);
                }
            }
            carry.insert(t, last);
        }
    }
    let shared: Vec<u8> = shared.into_iter().map(|a| a.into_inner()).collect();
    let shared_count = shared.iter().filter(|&&s| s != 0).count();
    Lifetimes { lifetime, max_gap, shared, shared_count }
}

/// The engine's packing of one chunk (`flushDataUpload`, `timeQuantum`, `landChunk`).
#[derive(Debug, Clone, Copy, Default)]
pub struct ChunkInfo {
    pub start: usize,
    pub rows: usize,
    pub aabb_min: [f64; 3],
    pub aabb_size: [f64; 3],
    pub time_min: f64,
    pub time_scale: f64,
    pub life_scale: f64,
}

#[inline]
fn clamp_u16(v: f64) -> u32 {
    if v < 0.0 {
        0
    } else if v > 65535.0 {
        65535
    } else {
        (v + 0.5) as u32
    }
}

/// The chunks of `rows` rows over `n`, with their boxes and time quanta.
pub fn chunk_infos(x: &[f32], y: &[f32], z: &[f32], time: Option<&[f32]>, has_life: bool, max_gap: f64, chunk_rows: usize) -> Vec<ChunkInfo> {
    let n = x.len();
    (0..n)
        .step_by(chunk_rows)
        .collect::<Vec<_>>()
        .par_iter()
        .map(|&start| {
            let rows = chunk_rows.min(n - start);
            let mut mn = [f64::INFINITY; 3];
            let mut mx = [f64::NEG_INFINITY; 3];
            for i in start..start + rows {
                for (k, v) in [x[i], y[i], z[i]].into_iter().enumerate() {
                    let v = v as f64;
                    if v < mn[k] {
                        mn[k] = v;
                    }
                    if v > mx[k] {
                        mx[k] = v;
                    }
                }
            }
            let mut c = ChunkInfo {
                start,
                rows,
                aabb_min: mn,
                aabb_size: [(mx[0] - mn[0]).max(1e-6), (mx[1] - mn[1]).max(1e-6), (mx[2] - mn[2]).max(1e-6)],
                time_min: 0.0,
                time_scale: 1.0,
                life_scale: 1.0,
            };
            if let (Some(t), true) = (time, has_life) {
                let t_min = t[start] as f64;
                let span = (t[start + rows - 1] as f64 - t_min).max(1e-6);
                c.time_min = t_min;
                c.time_scale = span / 65535.0;
                c.life_scale = max_gap.max(1e-6) / 65534.0;
            }
            c
        })
        .collect()
}

/// A chunk's positions, two u32 a row: `x | y << 16`, `z | group << 16`.
pub fn pack_positions(c: &ChunkInfo, x: &[f32], y: &[f32], z: &[f32], group: Option<&[u16]>, out: &mut [u32]) {
    let s: Vec<f64> = c.aabb_size.iter().map(|d| 65535.0 / d).collect();
    let (x0, y0, z0) = (c.aabb_min[0], c.aabb_min[1], c.aabb_min[2]);
    out.par_chunks_mut(2 * 65536).enumerate().for_each(|(k, o)| {
        let base = c.start + k * 65536;
        for j in 0..o.len() / 2 {
            let r = base + j;
            let g = group.map_or(0, |g| g[r] as u32);
            o[j * 2] = clamp_u16((x[r] as f64 - x0) * s[0]) | (clamp_u16((y[r] as f64 - y0) * s[1]) << 16);
            o[j * 2 + 1] = clamp_u16((z[r] as f64 - z0) * s[2]) | (g << 16);
        }
    });
}

/// A chunk's times, one u32 a row: `time | lifetime << 16`, 65535 for no lifetime.
pub fn pack_times(c: &ChunkInfo, time: &[f32], life: &[f32], max_gap: f64, out: &mut [u32]) {
    let span = (time[c.start + c.rows - 1] as f64 - c.time_min).max(1e-6);
    let inv_t = 65535.0 / span;
    let inv_l = 65534.0 / max_gap.max(1e-6);
    out.par_chunks_mut(65536).enumerate().for_each(|(k, o)| {
        let base = c.start + k * 65536;
        for (j, w) in o.iter_mut().enumerate() {
            let r = base + j;
            let q = clamp_u16((time[r] as f64 - c.time_min) * inv_t);
            let l = life[r];
            let ql = if l < 0.0 { 65535 } else { clamp_u16(l as f64 * inv_l).min(65534) };
            *w = q | (ql << 16);
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stamps_read_as_date_parse() {
        assert_eq!(stamp_seconds("match 2024-03-05 17:42"), Some(1709660520.0));
        assert_eq!(stamp_seconds("2024-03-05T17:42"), Some(1709660520.0));
        assert_eq!(stamp_seconds("2024-02-30 10:00"), None);
        assert_eq!(stamp_seconds("x"), None);
    }

    #[test]
    fn lifetimes_by_track_and_shared_names() {
        // Person 0 in sessions 0 and 1 interleaved; person 1 twice at once far apart.
        let time = [0.0, 0.0, 1.0, 1.0, 2.0, 2.0];
        let person = [0, 1, 0, 1, 0, 0];
        let session = [0, 0, 1, 0, 0, 1];
        let x = [0.0, 0.0, 0.0, 100.0, 0.0, 0.0];
        let zero = [0.0f32; 6];
        let r = Rows { time: &time, person: &person, session: Some(&session), x: &x, y: &zero, z: &zero, cats: &[], step: 1 };
        let l = lifetimes(&r, 2, 1.0);
        assert_eq!(l.lifetime, [2.0, 1.0, 1.0, -1.0, -1.0, -1.0]);
        assert_eq!(l.max_gap, 2.0);
        assert_eq!(l.shared_count, 0);
        // Same instant, far apart, same kind: worn twice.
        let time = [5.0, 5.0];
        let x = [0.0, 50.0];
        let r = Rows { time: &time, person: &[0, 0], session: None, x: &x, y: &[0.0; 2], z: &[0.0; 2], cats: &[], step: 1 };
        let l = lifetimes(&r, 1, 1.0);
        assert_eq!(l.shared, [1]);
        assert_eq!(l.lifetime, [-1.0, -1.0]);
    }

    #[test]
    fn lifetimes_of_every_kth_row_in_place() {
        let n = 1000;
        let time: Vec<f32> = (0..n).map(|i| (i / 3) as f32).collect();
        let person: Vec<u32> = (0..n).map(|i| (i % 7) as u32).collect();
        let x: Vec<f32> = (0..n).map(|i| i as f32).collect();
        let zero = vec![0f32; n];
        let all = Rows { time: &time, person: &person, session: None, x: &x, y: &zero, z: &zero, cats: &[], step: 3 };
        let thin = lifetimes(&all, 7, 1.0);
        let pick = |v: &[f32]| -> Vec<f32> { v.iter().step_by(3).copied().collect() };
        let (t3, x3, z3) = (pick(&time), pick(&x), pick(&zero));
        let p3: Vec<u32> = person.iter().step_by(3).copied().collect();
        let copy = lifetimes(&Rows { time: &t3, person: &p3, session: None, x: &x3, y: &z3, z: &z3, cats: &[], step: 1 }, 7, 1.0);
        assert_eq!(thin.lifetime, copy.lifetime);
        assert_eq!(thin.max_gap, copy.max_gap);
    }
}
