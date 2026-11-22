//! Heat tiles (Stage 6): heat over data of any size as a pyramid of tiles.
//!
//! - Out of core: the files' row groups are streamed through once, every core
//!   binning the rows of one group into a shared leaf grid; rows are never held,
//!   so memory is the grid's, whatever the row count.
//! - Level `l` covers the square extent with `2^l x 2^l` tiles of 256 x 256
//!   cells; each level is the next finer one summed 2 x 2.
//! - Coarse first: groups are visited in a shuffled order, and after the first
//!   sixteenth the coarse levels are published as an estimate (the sample scaled
//!   up), so a client sees the picture long before the pass ends.
//! - Keyed by filter hash (`TileQuery::key`): files, axes, filter (the time
//!   window is a range on the time column), split and leaf level. Equal queries
//!   share tiles across clients.
//! - Incremental: a query differing from a cached one in its filter visits only
//!   the row groups whose statistics say the change can touch them, subtracting
//!   their rows under the old filter and adding them under the new (exact:
//!   counts are integers), into a grid of differences. Only the tiles whose
//!   cells changed are decoded, changed and encoded again, and their ancestors;
//!   every other tile is copied from the cached pyramid as it is.
//! - On disk (`TileStore`): one folder per key, `tiles.bin` (every tile, packed)
//!   and `meta.json` (extent, levels, the byte range of each tile), evicted least
//!   recently used past a byte budget.
//!
//! A tile's bytes: a 32-byte header, then a zstd frame of its cells, channel
//! after channel, row after row, u16 or u32 little-endian:
//!
//! | at | size | field |
//! |----|------|-------|
//! | 0  | 4 | magic `H3DT` |
//! | 4  | 1 | version (1) |
//! | 5  | 1 | bytes per cell (2 or 4) |
//! | 6  | 1 | channels |
//! | 7  | 1 | flags (bit 0: estimate) |
//! | 8  | 1 | level |
//! | 12 | 4 | x |
//! | 16 | 4 | y |
//! | 20 | 4 | largest cell |
//! | 24 | 4 | cell bytes uncompressed |

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU32, AtomicU64, Ordering};
use std::sync::atomic::AtomicU64 as AtomicBits;
use std::sync::{Arc, Condvar, Mutex, RwLock};
use std::time::{Instant, SystemTime};

use anyhow::{anyhow, bail, Context, Result};
use bytes::Bytes;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::filter::Clause;
use crate::parquet::{Kind, Out, ParquetFile, Spec};

pub const TILE: usize = 256;
pub const MAGIC: &[u8; 4] = b"H3DT";
pub const HEADER: usize = 32;
pub const MAX_LEVEL: u32 = 7;
pub const DEFAULT_LEVEL: u32 = 5;
/// The first published estimate covers levels 0..ESTIMATE_LEVELS.
pub const ESTIMATE_LEVELS: u32 = 4;
/// Share of the row groups read before the estimate is published.
const SAMPLE_SHARE: usize = 16;
/// A split's named channels at most; every other value (and null) goes to one more, "other".
pub const SPLIT_NAMED: usize = 15;
/// A split's grid and levels stay under this (a channel more is a grid more): past it the leaf is coarser.
const SPLIT_GRID_BYTES: u64 = 2 << 30;
/// Row groups (of the shuffled order) whose split column names the channels of a split without listed values.
const DISCOVER_GROUPS: usize = 256;

/// `level << 56 | y << 28 | x`.
pub fn tile_id(level: u32, x: u32, y: u32) -> u64 {
    (level as u64) << 56 | (y as u64) << 28 | x as u64
}

pub fn tile_of(id: u64) -> (u32, u32, u32) {
    ((id >> 56) as u32, ((id >> 28) & 0x0fff_ffff) as u32, (id & 0x0fff_ffff) as u32)
}

/// One channel per value of a text column, and one more ("other") for the rows of
/// any other value or none. No values: the column's most common ones (at most
/// `SPLIT_NAMED`, in the rows a sample of the row groups keeps), sorted.
#[derive(Debug, Clone, PartialEq)]
pub struct Split {
    pub column: String,
    pub values: Vec<String>,
}

/// What a pyramid is of.
#[derive(Debug, Clone)]
pub struct TileQuery {
    pub files: Vec<PathBuf>,
    pub x: String,
    pub y: String,
    pub filter: Vec<Clause>,
    pub split: Option<Split>,
    pub leaf_level: u32,
}

fn clause_text(c: &Clause) -> String {
    match c {
        Clause::Range { column, min, max } => {
            format!("R\u{1f}{column}\u{1f}{}\u{1f}{}", min.map(|v| v.to_string()).unwrap_or_default(), max.map(|v| v.to_string()).unwrap_or_default())
        }
        Clause::Set { column, values } => {
            let mut v = values.clone();
            v.sort();
            v.dedup();
            format!("S\u{1f}{column}\u{1f}{}", v.join("\u{1e}"))
        }
    }
}

/// The active clauses, one per column (several on a column are ANDed by the
/// readers; kept in order), sorted so equal filters give equal keys.
fn canonical(filter: &[Clause]) -> Vec<Clause> {
    let mut v = crate::filter::active(filter);
    v.sort_by_key(clause_text);
    v.dedup_by(|a, b| clause_text(a) == clause_text(b));
    v
}

fn file_stamp(p: &Path) -> String {
    let m = std::fs::metadata(p).ok();
    let len = m.as_ref().map(|m| m.len()).unwrap_or(0);
    let t = m
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(SystemTime::UNIX_EPOCH).ok())
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    format!("{}\u{1f}{len}\u{1f}{t}", p.display())
}

impl TileQuery {
    /// Everything but the filter: queries with equal bases can start from each other.
    pub fn base(&self) -> String {
        let mut files: Vec<String> = self.files.iter().map(|p| file_stamp(p)).collect();
        files.sort();
        let split = self.split.as_ref().map(|s| format!("{}\u{1f}{}\u{1f}other", s.column, s.values.join("\u{1e}"))).unwrap_or_default();
        format!("heat-tiles-1\u{1d}{}\u{1d}{}\u{1d}{}\u{1d}{}\u{1d}{}", files.join("\u{1e}"), self.x, self.y, split, self.leaf_level)
    }

    /// The filter hash: equal queries, equal keys.
    pub fn key(&self) -> String {
        let f: Vec<String> = canonical(&self.filter).iter().map(clause_text).collect();
        let h = Sha256::digest(format!("{}\u{1d}{}", self.base(), f.join("\u{1d}")).as_bytes());
        h.iter().take(12).map(|b| format!("{b:02x}")).collect()
    }
}

/// A pyramid's description, on disk as `meta.json`.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Meta {
    pub key: String,
    pub base: String,
    pub filter: Vec<String>,
    pub x0: f64,
    pub y0: f64,
    pub size: f64,
    pub leaf_level: u32,
    pub channels: u32,
    pub channel_names: Vec<String>,
    /// The last channel holds a split's other rows (its name is empty).
    #[serde(default)]
    pub other: bool,
    pub rows_total: u64,
    pub rows_counted: u64,
    pub level_max: Vec<u32>,
    pub how: String,
    pub delta_base: String,
    pub groups: u64,
    pub groups_read: u64,
    pub first_ms: f64,
    pub total_ms: f64,
    /// Per level, tile `y * 2^l + x` -> [offset, length] in `tiles.bin`; empty tiles absent.
    pub index: Vec<HashMap<u32, [u64; 2]>>,
    pub bytes: u64,
    /// Tiles encoded by this build (a delta copies the others from its base).
    #[serde(default)]
    pub tiles_written: u64,
}

// ---------------------------------------------------------------- tiles

/// Encodes one tile of `cells` (channel after channel, 256 x 256 each).
pub fn encode_tile(level: u32, x: u32, y: u32, channels: usize, cells: &[u32], estimate: bool) -> Vec<u8> {
    let max = cells.iter().copied().max().unwrap_or(0);
    let wide = max > u16::MAX as u32;
    let raw: Vec<u8> = if wide {
        cells.iter().flat_map(|v| v.to_le_bytes()).collect()
    } else {
        cells.iter().flat_map(|&v| (v as u16).to_le_bytes()).collect()
    };
    let z = zstd::bulk::compress(&raw, 3).expect("zstd on memory");
    let mut out = Vec::with_capacity(HEADER + z.len());
    out.extend_from_slice(MAGIC);
    out.push(1);
    out.push(if wide { 4 } else { 2 });
    out.push(channels as u8);
    out.push(estimate as u8);
    out.push(level as u8);
    out.extend_from_slice(&[0, 0, 0]);
    out.extend_from_slice(&x.to_le_bytes());
    out.extend_from_slice(&y.to_le_bytes());
    out.extend_from_slice(&max.to_le_bytes());
    out.extend_from_slice(&(raw.len() as u32).to_le_bytes());
    out.extend_from_slice(&[0, 0, 0, 0]);
    out.extend_from_slice(&z);
    out
}

/// A decoded tile.
#[derive(Debug, Clone)]
pub struct Tile {
    pub level: u32,
    pub x: u32,
    pub y: u32,
    pub channels: usize,
    pub estimate: bool,
    pub max: u32,
    pub cells: Vec<u32>,
}

pub fn decode_tile(b: &[u8]) -> Result<Tile> {
    if b.len() < HEADER || &b[..4] != MAGIC || b[4] != 1 {
        bail!("not a heat tile");
    }
    let width = b[5] as usize;
    let channels = b[6] as usize;
    let raw_len = u32::from_le_bytes(b[24..28].try_into()?) as usize;
    if !(width == 2 || width == 4) || channels == 0 || raw_len != TILE * TILE * channels * width {
        bail!("bad heat tile header");
    }
    let raw = zstd::bulk::decompress(&b[HEADER..], raw_len)?;
    let cells: Vec<u32> = if width == 4 {
        raw.chunks_exact(4).map(|c| u32::from_le_bytes(c.try_into().unwrap())).collect()
    } else {
        raw.chunks_exact(2).map(|c| u16::from_le_bytes(c.try_into().unwrap()) as u32).collect()
    };
    Ok(Tile {
        level: b[8] as u32,
        x: u32::from_le_bytes(b[12..16].try_into()?),
        y: u32::from_le_bytes(b[16..20].try_into()?),
        channels,
        estimate: b[7] & 1 != 0,
        max: u32::from_le_bytes(b[20..24].try_into()?),
        cells,
    })
}

// ---------------------------------------------------------------- the grid

/// The leaf grid, every channel, counted by all cores at once.
struct Grid {
    n: usize,
    channels: usize,
    cells: Vec<u32>,
}

impl Grid {
    fn new(n: usize, channels: usize) -> Self {
        // Zeroed pages straight from the allocator: no pass over hundreds of MB.
        Self { n, channels, cells: vec![0u32; n * n * channels] }
    }

    fn atomics(&self) -> &[AtomicU32] {
        // SAFETY: AtomicU32 has u32's size and alignment; while the slice is
        // shared every access goes through it, never through `cells`.
        unsafe { std::slice::from_raw_parts(self.cells.as_ptr() as *const AtomicU32, self.cells.len()) }
    }

}

/// Levels 0..=top from `cells` (level `top`, `channels` planes), each the next finer summed 2 x 2.
fn pyramid(cells: Vec<u32>, top: u32, channels: usize) -> Vec<Vec<u32>> {
    let mut out: Vec<Vec<u32>> = vec![Vec::new(); top as usize + 1];
    out[top as usize] = cells;
    for l in (0..top as usize).rev() {
        out[l] = downsample(&out[l + 1], TILE << (l + 1), channels, 2);
    }
    out
}

/// `cells` (`n x n` per channel) summed over `f x f` blocks.
fn downsample(cells: &[u32], n: usize, channels: usize, f: usize) -> Vec<u32> {
    let nc = n / f;
    let mut coarse = vec![0u32; nc * nc * channels];
    coarse.par_chunks_mut(nc).enumerate().for_each(|(row, dst)| {
        let c = row / nc;
        let y = row % nc;
        let base = c * n * n;
        let mut acc = vec![0u64; nc];
        for r in 0..f {
            let src = &cells[base + (y * f + r) * n..base + (y * f + r + 1) * n];
            for (x, a) in acc.iter_mut().enumerate() {
                *a += src[x * f..x * f + f].iter().map(|&v| v as u64).sum::<u64>();
            }
        }
        for (d, a) in dst.iter_mut().zip(acc) {
            *d = a.min(u32::MAX as u64) as u32;
        }
    });
    coarse
}

/// One level's tiles, encoded: (x, y, bytes), empty ones left out.
fn encode_level(cells: &[u32], level: u32, channels: usize, estimate: bool, scale: f64) -> Vec<(u32, u32, Vec<u8>)> {
    let tiles = 1u32 << level;
    let n = TILE << level;
    (0..tiles * tiles)
        .into_par_iter()
        .filter_map(|t| {
            let (tx, ty) = (t % tiles, t / tiles);
            let mut buf = vec![0u32; TILE * TILE * channels];
            let mut any = false;
            for c in 0..channels {
                for row in 0..TILE {
                    let src = c * n * n + (ty as usize * TILE + row) * n + tx as usize * TILE;
                    let dst = &mut buf[c * TILE * TILE + row * TILE..c * TILE * TILE + (row + 1) * TILE];
                    dst.copy_from_slice(&cells[src..src + TILE]);
                    any |= dst.iter().any(|&v| v != 0);
                }
            }
            if !any {
                return None;
            }
            if scale != 1.0 {
                for v in buf.iter_mut() {
                    *v = ((*v as f64) * scale).round().min(u32::MAX as f64) as u32;
                }
            }
            Some((tx, ty, encode_tile(level, tx, ty, channels, &buf, estimate)))
        })
        .collect()
}

// ---------------------------------------------------------------- reading the files

struct Source {
    file: ParquetFile,
}

struct Frame {
    x0: f64,
    y0: f64,
    size: f64,
    n: usize,
}

fn open_sources(files: &[PathBuf]) -> Result<Vec<Source>> {
    files
        .par_iter()
        .map(|p| {
            let bytes = crate::source::map(p)?;
            Ok(Source { file: ParquetFile::open(bytes).with_context(|| format!("reading {}", p.display()))? })
        })
        .collect()
}

/// The square the files' x/y statistics span (a little margin so the maximum falls inside).
fn extent(sources: &[Source], x: &str, y: &str) -> Result<(f64, f64, f64)> {
    let (mut x0, mut x1, mut y0, mut y1) = (f64::INFINITY, f64::NEG_INFINITY, f64::INFINITY, f64::NEG_INFINITY);
    for s in sources {
        for g in 0..s.file.row_groups() {
            let (a, b) = s.file.group_span(g, x).ok_or_else(|| anyhow!("no statistics for {x}: the extent needs them"))?;
            let (c, d) = s.file.group_span(g, y).ok_or_else(|| anyhow!("no statistics for {y}: the extent needs them"))?;
            x0 = x0.min(a);
            x1 = x1.max(b);
            y0 = y0.min(c);
            y1 = y1.max(d);
        }
    }
    if !x0.is_finite() || !y0.is_finite() {
        bail!("no rows");
    }
    let size = (x1 - x0).max(y1 - y0).max(1e-6) * 1.000_01;
    let (cx, cy) = ((x0 + x1) * 0.5, (y0 + y1) * 0.5);
    Ok((cx - size * 0.5, cy - size * 0.5, size))
}

/// Bins one row group's rows that `clauses` keep, adding `sign` (1, or u32::MAX to subtract);
/// `touched` (a bit per leaf tile) gets the tiles a row went into. With a split,
/// `names` are its named channels; the rows of any other value go to the channel after them.
#[allow(clippy::too_many_arguments)]
fn bin_group(src: &Source, g: usize, q: &TileQuery, names: &[String], clauses: &[Clause], frame: &Frame, grid: &[AtomicU32], sign: u32, touched: Option<&[AtomicBits]>) -> Result<u64> {
    let mut specs = vec![Spec { name: q.x.clone(), kind: Kind::F64 }, Spec { name: q.y.clone(), kind: Kind::F64 }];
    if let Some(s) = &q.split {
        specs.push(Spec { name: s.column.clone(), kind: Kind::Dict });
    }
    let cols = src.file.read_group_where(g, &specs, clauses)?;
    let (Out::F64(xs), Out::F64(ys)) = (&cols[0], &cols[1]) else { bail!("x/y not numeric") };
    let channel: Option<(Vec<i32>, &[u32])> = match (&q.split, cols.get(2)) {
        (Some(_), Some(Out::Dict(d))) => {
            let map = d.labels.iter().map(|l| names.iter().position(|v| v == l).unwrap_or(names.len()) as i32).collect();
            Some((map, &d.ids))
        }
        _ => None,
    };
    let n = frame.n;
    let inv = n as f64 / frame.size;
    let plane = n * n;
    let side = n / TILE;
    let mut mine = vec![0u64; if touched.is_some() { (side * side).div_ceil(64) } else { 0 }];
    let mut counted = 0u64;
    for i in 0..xs.len() {
        let cx = ((xs[i] - frame.x0) * inv).floor();
        let cy = ((ys[i] - frame.y0) * inv).floor();
        if !(cx >= 0.0 && cy >= 0.0 && cx < n as f64 && cy < n as f64) {
            continue;
        }
        let c = match &channel {
            Some((map, ids)) => {
                let c = map[ids[i] as usize];
                if c < 0 {
                    continue;
                }
                c as usize
            }
            None => 0,
        };
        grid[c * plane + cy as usize * n + cx as usize].fetch_add(sign, Ordering::Relaxed);
        if !mine.is_empty() {
            let t = (cy as usize / TILE) * side + cx as usize / TILE;
            mine[t / 64] |= 1 << (t % 64);
        }
        counted += 1;
    }
    if let Some(all) = touched {
        for (a, &m) in all.iter().zip(&mine) {
            if m != 0 {
                a.fetch_or(m, Ordering::Relaxed);
            }
        }
    }
    Ok(counted)
}

/// A split's named channels when it lists none: its column's most common values
/// in the rows `clauses` keep of the first groups of `order`, sorted.
fn discover(sources: &[Source], order: &[(usize, usize)], column: &str, clauses: &[Clause]) -> Result<Vec<String>> {
    let spec = [Spec { name: column.to_owned(), kind: Kind::Dict }];
    let counts = order[..order.len().min(DISCOVER_GROUPS)]
        .par_iter()
        .map(|&(f, g)| -> Result<HashMap<String, u64>> {
            let cols = sources[f].file.read_group_where(g, &spec, clauses)?;
            let mut m = HashMap::new();
            if let Some(Out::Dict(d)) = cols.first() {
                let mut per = vec![0u64; d.labels.len()];
                for &id in &d.ids {
                    per[id as usize] += 1;
                }
                for (l, c) in d.labels.iter().zip(per) {
                    if c > 0 {
                        *m.entry(l.clone()).or_insert(0) += c;
                    }
                }
            }
            Ok(m)
        })
        .try_reduce(HashMap::new, |mut a, b| {
            for (k, v) in b {
                *a.entry(k).or_insert(0) += v;
            }
            Ok(a)
        })?;
    let mut v: Vec<(String, u64)> = counts.into_iter().collect();
    v.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));
    // Null reads as "": those rows are the other channel's.
    let mut names: Vec<String> = v.into_iter().filter(|(l, _)| !l.is_empty()).take(SPLIT_NAMED).map(|(l, _)| l).collect();
    names.sort();
    Ok(names)
}

/// Visit order: a fixed shuffle, so any prefix is a fair sample of the files.
fn shuffled(mut work: Vec<(usize, usize)>) -> Vec<(usize, usize)> {
    let mut s: u64 = 0x9e37_79b9_7f4a_7c15;
    for i in (1..work.len()).rev() {
        s ^= s << 13;
        s ^= s >> 7;
        s ^= s << 17;
        work.swap(i, (s % (i as u64 + 1)) as usize);
    }
    work
}

/// Whether a row group's rows can be kept differently by `old` and `new`, on the statistics.
fn may_differ(src: &Source, g: usize, old: &[Clause], new: &[Clause]) -> bool {
    let by_col = |cs: &[Clause]| -> HashMap<String, Vec<String>> {
        let mut m: HashMap<String, Vec<String>> = HashMap::new();
        for c in cs {
            m.entry(c.column().to_owned()).or_default().push(clause_text(c));
        }
        m
    };
    let (om, nm) = (by_col(old), by_col(new));
    let cols: HashSet<&String> = om.keys().chain(nm.keys()).collect();
    let shared: Vec<Clause> = old.iter().filter(|c| om.get(c.column()) == nm.get(c.column())).cloned().collect();
    // Rows the unchanged clauses drop are dropped under both.
    if !src.file.group_may_match(g, &shared) {
        return false;
    }
    for col in cols {
        if om.get(col) == nm.get(col) {
            continue;
        }
        let o: Vec<Clause> = old.iter().filter(|c| c.column() == col).cloned().collect();
        let n: Vec<Clause> = new.iter().filter(|c| c.column() == col).cloned().collect();
        // Both rule the group out: no row kept either way.
        if !src.file.group_may_match(g, &o) && !src.file.group_may_match(g, &n) {
            continue;
        }
        // Both keep every row: ranges spanning the group's values (no nulls).
        let keeps_all = |cs: &[Clause]| -> bool {
            cs.iter().all(|c| match c {
                Clause::Range { min, max, .. } => match src.file.group_span(g, col) {
                    Some((lo, hi)) => {
                        src.file.group_nulls(g, col) == Some(0) && min.is_none_or(|m| lo >= m) && max.is_none_or(|m| hi <= m)
                    }
                    None => false,
                },
                Clause::Set { .. } => false,
            })
        };
        if keeps_all(&o) && keeps_all(&n) {
            continue;
        }
        return true;
    }
    false
}

// ---------------------------------------------------------------- building

/// What a build is doing, for `HeatPyramid`.
#[derive(Debug, Clone, Default)]
pub struct Status {
    pub meta: Meta,
    pub fraction: f64,
    pub complete: bool,
    pub estimate_levels: u32,
    pub error: String,
    /// Answered from the cache (`meta.how` says how it was built).
    pub cached: bool,
}

pub struct Build {
    status: Mutex<Status>,
    /// Estimate tiles while building: id -> bytes.
    estimate: RwLock<HashMap<u64, Bytes>>,
    done: (Mutex<bool>, Condvar),
}

impl Build {
    pub fn status(&self) -> Status {
        self.status.lock().unwrap().clone()
    }
    pub fn wait(&self) {
        let (m, cv) = &self.done;
        let mut d = m.lock().unwrap();
        while !*d {
            d = cv.wait(d).unwrap();
        }
    }
}

/// Leaf level that fits `budget` bytes for the grid and its levels.
fn fitting_level(want: u32, channels: usize, budget: u64) -> u32 {
    let mut l = want.min(MAX_LEVEL);
    while l > 0 {
        let n = (TILE << l) as u64;
        // leaf + the levels (a third) + their copy when summing.
        if n * n * channels as u64 * 4 * 7 / 3 <= budget {
            break;
        }
        l -= 1;
    }
    l
}

fn run_build(q: TileQuery, key: String, dir: PathBuf, base: Option<(Meta, PathBuf)>, build: Arc<Build>, threads: Option<&rayon::ThreadPool>) -> Result<Meta> {
    let t0 = Instant::now();
    let sources = open_sources(&q.files)?;
    let filter = canonical(&q.filter);
    let rows_total: u64 = sources.iter().map(|s| s.file.rows()).sum();
    let all: Vec<(usize, usize)> = sources.iter().enumerate().flat_map(|(f, s)| (0..s.file.row_groups()).map(move |g| (f, g))).collect();
    // Groups the statistics rule out hold no rows of the filter's; the rest in a fixed shuffle.
    let order = shuffled(all.iter().copied().filter(|&(f, g)| sources[f].file.group_may_match(g, &filter)).collect());
    // A split's named channels (a delta keeps its base's), then one for the other rows.
    let names: Vec<String> = match (&q.split, &base) {
        (None, _) => Vec::new(),
        (Some(_), Some((m, _))) => m.channel_names[..m.channel_names.len().saturating_sub(m.other as usize)].to_vec(),
        (Some(s), None) if s.values.is_empty() => discover(&sources, &order, &s.column, &filter)?,
        (Some(s), None) => s.values.iter().take(SPLIT_NAMED).cloned().collect(),
    };
    let other = q.split.is_some();
    let channels = names.len() + other as usize;
    let channels = channels.max(1);
    let channel_names = if other { names.iter().cloned().chain([String::new()]).collect() } else { vec![String::new()] };
    let (x0, y0, size, leaf) = match &base {
        Some((m, _)) => (m.x0, m.y0, m.size, m.leaf_level),
        None => {
            let (x0, y0, size) = extent(&sources, &q.x, &q.y)?;
            let mut budget = (crate::memory::available_bytes() / 3).max(256 << 20);
            if channels > 1 {
                budget = budget.min(SPLIT_GRID_BYTES);
            }
            (x0, y0, size, fitting_level(q.leaf_level, channels, budget))
        }
    };
    let n = TILE << leaf;
    let frame = Frame { x0, y0, size, n };
    let mut meta = Meta {
        key: key.clone(),
        base: q.base(),
        filter: filter.iter().map(clause_text).collect(),
        x0,
        y0,
        size,
        leaf_level: leaf,
        channels: channels as u32,
        channel_names,
        other,
        rows_total,
        ..Default::default()
    };
    meta.groups = all.len() as u64;
    build.status.lock().unwrap().meta = meta.clone();

    let grid = Grid::new(n, channels);
    let counted = AtomicU64::new(0);
    let read = AtomicU64::new(0);
    let failed: Mutex<Option<anyhow::Error>> = Mutex::new(None);
    let visit = |items: &[(usize, usize)], clauses: &[Clause], sign: u32, grid: &[AtomicU32], touched: Option<&[AtomicBits]>| {
        let work = || {
            items.par_iter().for_each(|&(f, g)| {
                if failed.lock().unwrap().is_some() {
                    return;
                }
                match bin_group(&sources[f], g, &q, &names, clauses, &frame, grid, sign, touched) {
                    Ok(c) => {
                        if sign == 1 {
                            counted.fetch_add(c, Ordering::Relaxed);
                        } else {
                            counted.fetch_sub(c, Ordering::Relaxed);
                        }
                    }
                    Err(e) => *failed.lock().unwrap() = Some(e),
                }
                let r = read.fetch_add(1, Ordering::Relaxed) + 1;
                if r % 8 == 0 {
                    build.status.lock().unwrap().fraction = r as f64 / all.len().max(1) as f64;
                }
            })
        };
        match threads {
            Some(p) => p.install(work),
            None => work(),
        }
    };

    let packed = if let Some((bm, bdir)) = &base {
        // Incremental: only the groups the change touches, into a grid of differences
        // (wrapping: a cell's old rows out, its new rows in), then only the tiles that changed.
        meta.how = "delta".into();
        meta.delta_base = bm.key.clone();
        let old: Vec<Clause> = parse_clauses(&bm.filter);
        counted.store(bm.rows_counted, Ordering::Relaxed);
        let groups: Vec<(usize, usize)> = all.iter().copied().filter(|&(f, g)| may_differ(&sources[f], g, &old, &filter)).collect();
        let side = 1usize << leaf;
        let touched: Vec<AtomicBits> = (0..(side * side).div_ceil(64)).map(|_| AtomicBits::new(0)).collect();
        let atoms = grid.atomics();
        visit(&groups, &old, u32::MAX, atoms, Some(&touched));
        visit(&groups, &filter, 1, atoms, Some(&touched));
        meta.groups_read = groups.len() as u64;
        if let Some(e) = failed.lock().unwrap().take() {
            return Err(e);
        }
        let bits: Vec<u64> = touched.iter().map(|a| a.load(Ordering::Relaxed)).collect();
        pack_delta(&grid, &bits, bm, bdir)?
    } else {
        meta.how = "full".into();
        let candidate_rows: u64 = order.iter().map(|&(f, g)| sources[f].file.group_rows(g)).sum();
        let first = order.len().div_ceil(SAMPLE_SHARE).max(1).min(order.len());
        let atoms = grid.atomics();
        visit(&order[..first], &filter, 1, atoms, None);
        if first < order.len() {
            // Coarse first: the sample, scaled up, as the first picture.
            let sampled: u64 = order[..first].iter().map(|&(f, g)| sources[f].file.group_rows(g)).sum();
            let scale = candidate_rows as f64 / sampled.max(1) as f64;
            let est_levels = ESTIMATE_LEVELS.min(leaf + 1);
            let top = est_levels - 1;
            let levels = pyramid(downsample(&grid.cells, n, channels, 1 << (leaf - top)), top, channels);
            let mut est = HashMap::new();
            for l in 0..est_levels {
                for (x, y, b) in encode_level(&levels[l as usize], l, channels, true, scale) {
                    est.insert(tile_id(l, x, y), Bytes::from(b));
                }
            }
            *build.estimate.write().unwrap() = est;
            let mut st = build.status.lock().unwrap();
            st.estimate_levels = est_levels;
            st.meta.first_ms = t0.elapsed().as_secs_f64() * 1e3;
            st.meta.level_max = levels.iter().map(|l| (*l.iter().max().unwrap_or(&0) as f64 * scale) as u32).collect();
            meta.first_ms = st.meta.first_ms;
        }
        visit(&order[first..], &filter, 1, atoms, None);
        meta.groups_read = order.len() as u64;
        if let Some(e) = failed.lock().unwrap().take() {
            return Err(e);
        }
        // Every level, packed.
        pack_full(pyramid(grid.cells, leaf, channels), channels)
    };
    meta.rows_counted = counted.load(Ordering::Relaxed);
    let Packed { pack, index, level_max, written } = packed;
    meta.level_max = level_max;
    meta.index = index;
    meta.tiles_written = written;
    std::fs::create_dir_all(&dir)?;
    meta.bytes = pack.len() as u64;
    let tmp = dir.join("tiles.bin.part");
    std::fs::write(&tmp, &pack)?;
    std::fs::rename(&tmp, dir.join("tiles.bin"))?;
    meta.total_ms = t0.elapsed().as_secs_f64() * 1e3;
    if meta.first_ms == 0.0 {
        meta.first_ms = meta.total_ms;
    }
    std::fs::write(dir.join("meta.json"), serde_json::to_vec(&meta)?)?;
    Ok(meta)
}

fn parse_clauses(texts: &[String]) -> Vec<Clause> {
    texts
        .iter()
        .filter_map(|t| {
            let p: Vec<&str> = t.split('\u{1f}').collect();
            match p.as_slice() {
                ["R", col, lo, hi] => Some(Clause::Range { column: col.to_string(), min: lo.parse().ok(), max: hi.parse().ok() }),
                ["S", col, vals] => Some(Clause::Set { column: col.to_string(), values: vals.split('\u{1e}').map(String::from).collect() }),
                _ => None,
            }
        })
        .collect()
}

/// A pyramid's tiles, packed: the bytes of `tiles.bin`, its index, each level's largest cell.
struct Packed {
    pack: Vec<u8>,
    index: Vec<HashMap<u32, [u64; 2]>>,
    level_max: Vec<u32>,
    written: u64,
}

/// The largest cell, from a tile's header.
fn header_max(b: &[u8]) -> u32 {
    u32::from_le_bytes(b[20..24].try_into().unwrap())
}

/// Every tile of every level encoded.
fn pack_full(levels: Vec<Vec<u32>>, channels: usize) -> Packed {
    let mut out = Packed { pack: Vec::new(), index: Vec::new(), level_max: Vec::new(), written: 0 };
    for (l, cells) in levels.iter().enumerate() {
        out.level_max.push(cells.iter().copied().max().unwrap_or(0));
        let mut idx = HashMap::new();
        for (x, y, b) in encode_level(cells, l as u32, channels, false, 1.0) {
            idx.insert(y * (1 << l) + x, [out.pack.len() as u64, b.len() as u64]);
            out.pack.extend_from_slice(&b);
            out.written += 1;
        }
        out.index.push(idx);
    }
    out
}

/// A delta's pyramid: `diff` (the leaf grid's change, wrapping) added to the
/// base's tiles where a row went (`touched`, a bit per leaf tile) and a cell
/// changed; those tiles and their ancestors encoded again, every other tile's
/// bytes copied from the base as they are.
fn pack_delta(diff: &Grid, touched: &[u64], bm: &Meta, bdir: &Path) -> Result<Packed> {
    let base = crate::source::map(&bdir.join("tiles.bin"))?;
    pack_delta_from(diff, touched, bm, &base)
}

fn pack_delta_from(diff: &Grid, touched: &[u64], bm: &Meta, base: &[u8]) -> Result<Packed> {
    let leaf = bm.leaf_level as usize;
    let channels = diff.channels;
    let (n, plane, cells_per) = (diff.n, diff.n * diff.n, TILE * TILE * diff.channels);
    let base_tile = |l: usize, t: u32| -> Option<&[u8]> { bm.index.get(l)?.get(&t).map(|&[o, len]| &base[o as usize..(o + len) as usize]) };
    let cells_of = |l: usize, t: u32| -> Result<Vec<u32>> {
        match base_tile(l, t) {
            Some(b) => Ok(decode_tile(b)?.cells),
            None => Ok(vec![0u32; cells_per]),
        }
    };
    // Leaf tiles a row went into whose cells changed: the base's plus the difference.
    let side = 1u32 << leaf;
    let cand: Vec<u32> = (0..side * side).filter(|&t| touched[t as usize / 64] >> (t % 64) & 1 == 1).collect();
    let mut cur: HashMap<u32, Vec<u32>> = cand
        .par_iter()
        .filter_map(|&t| {
            let (tx, ty) = ((t % side) as usize, (t / side) as usize);
            let at = |c: usize, row: usize| c * plane + (ty * TILE + row) * n + tx * TILE;
            let changed = (0..channels).any(|c| (0..TILE).any(|row| diff.cells[at(c, row)..at(c, row) + TILE].iter().any(|&v| v != 0)));
            if !changed {
                return None;
            }
            let mut cells = match cells_of(leaf, t) {
                Ok(c) => c,
                Err(e) => return Some(Err(e)),
            };
            for c in 0..channels {
                for row in 0..TILE {
                    let src = &diff.cells[at(c, row)..at(c, row) + TILE];
                    let dst = &mut cells[c * TILE * TILE + row * TILE..c * TILE * TILE + (row + 1) * TILE];
                    for (d, &v) in dst.iter_mut().zip(src) {
                        *d = d.wrapping_add(v);
                    }
                }
            }
            Some(Ok((t, cells)))
        })
        .collect::<Result<_>>()?;
    // Level by level up: the changed tiles encoded, their parents summed 2 x 2 from
    // the changed children and the base's other children.
    let mut dirty: Vec<HashSet<u32>> = vec![HashSet::new(); leaf + 1];
    let mut encoded: Vec<Vec<(u32, Vec<u8>)>> = vec![Vec::new(); leaf + 1];
    for l in (0..=leaf).rev() {
        let ls = 1u32 << l;
        dirty[l] = cur.keys().copied().collect();
        encoded[l] = cur
            .par_iter()
            .filter(|(_, cells)| cells.iter().any(|&v| v != 0))
            .map(|(&t, cells)| (t, encode_tile(l as u32, t % ls, t / ls, channels, cells, false)))
            .collect();
        if l == 0 {
            break;
        }
        let ps = ls / 2;
        let parents: HashSet<u32> = cur.keys().map(|&t| (t / ls / 2) * ps + (t % ls) / 2).collect();
        let parents: Vec<u32> = parents.into_iter().collect();
        let next: HashMap<u32, Vec<u32>> = parents
            .par_iter()
            .map(|&p| -> Result<(u32, Vec<u32>)> {
                let (px, py) = (p % ps, p / ps);
                let mut out = vec![0u32; cells_per];
                for q in 0..4u32 {
                    let ct = (py * 2 + q / 2) * ls + px * 2 + q % 2;
                    let owned;
                    let child: &[u32] = match cur.get(&ct) {
                        Some(c) => c,
                        None => {
                            owned = cells_of(l, ct)?;
                            &owned
                        }
                    };
                    let (oy, ox) = ((q / 2) as usize * TILE / 2, (q % 2) as usize * TILE / 2);
                    for c in 0..channels {
                        let (src, dst) = (&child[c * TILE * TILE..(c + 1) * TILE * TILE], c * TILE * TILE);
                        for row in 0..TILE {
                            let d = dst + (oy + row / 2) * TILE + ox;
                            for col in 0..TILE {
                                out[d + col / 2] = out[d + col / 2].saturating_add(src[row * TILE + col]);
                            }
                        }
                    }
                }
                Ok((p, out))
            })
            .collect::<Result<_>>()?;
        cur = next;
    }
    let mut out = Packed { pack: Vec::with_capacity(base.len()), index: vec![HashMap::new(); leaf + 1], level_max: vec![0; leaf + 1], written: 0 };
    for l in 0..=leaf {
        for (&t, &[o, len]) in &bm.index[l] {
            if dirty[l].contains(&t) {
                continue;
            }
            let b = &base[o as usize..(o + len) as usize];
            out.level_max[l] = out.level_max[l].max(header_max(b));
            out.index[l].insert(t, [out.pack.len() as u64, len]);
            out.pack.extend_from_slice(b);
        }
        for (t, b) in &encoded[l] {
            out.level_max[l] = out.level_max[l].max(header_max(b));
            out.index[l].insert(*t, [out.pack.len() as u64, b.len() as u64]);
            out.pack.extend_from_slice(b);
            out.written += 1;
        }
    }
    Ok(out)
}

// ---------------------------------------------------------------- the store

struct Entry {
    meta: Arc<Meta>,
    pack: Option<Bytes>,
    used: u64,
}

/// The tile cache on disk, its builds, its LRU.
pub struct TileStore {
    root: PathBuf,
    budget: u64,
    entries: Mutex<HashMap<String, Entry>>,
    builds: Mutex<HashMap<String, Arc<Build>>>,
    clock: AtomicU64,
    /// One build at a time: each takes every core.
    gate: Mutex<()>,
    pool: Option<rayon::ThreadPool>,
}

/// Where tiles go when nothing says: `HEAT3D_TILE_CACHE`, else the user's local data folder.
pub fn default_root() -> PathBuf {
    if let Some(p) = std::env::var_os("HEAT3D_TILE_CACHE") {
        return PathBuf::from(p);
    }
    let base = std::env::var_os("LOCALAPPDATA")
        .or_else(|| std::env::var_os("XDG_CACHE_HOME"))
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".cache")))
        .unwrap_or_else(std::env::temp_dir);
    base.join("3DHeat").join("heat-tiles")
}

impl TileStore {
    /// A store at `root` keeping at most `budget` bytes of tiles. Existing pyramids are adopted,
    /// oldest first in line for eviction.
    pub fn open(root: PathBuf, budget: u64) -> Result<Self> {
        std::fs::create_dir_all(&root)?;
        let mut found: Vec<(SystemTime, String, Meta)> = Vec::new();
        for e in std::fs::read_dir(&root)?.flatten() {
            let mp = e.path().join("meta.json");
            let Ok(b) = std::fs::read(&mp) else {
                // A build that never finished.
                let _ = std::fs::remove_dir_all(e.path());
                continue;
            };
            let Ok(m) = serde_json::from_slice::<Meta>(&b) else { continue };
            let t = std::fs::metadata(&mp).and_then(|m| m.modified()).unwrap_or(SystemTime::UNIX_EPOCH);
            found.push((t, m.key.clone(), m));
        }
        found.sort_by_key(|f| f.0);
        let entries = found.into_iter().enumerate().map(|(i, (_, k, m))| (k, Entry { meta: Arc::new(m), pack: None, used: i as u64 })).collect::<HashMap<_, _>>();
        let n = entries.len() as u64;
        let threads = std::env::var("HEAT3D_TILE_THREADS").ok().and_then(|v| v.parse().ok());
        let pool = threads.and_then(|t: usize| rayon::ThreadPoolBuilder::new().num_threads(t).build().ok());
        Ok(Self { root, budget, entries: Mutex::new(entries), builds: Mutex::new(HashMap::new()), clock: AtomicU64::new(n + 1), gate: Mutex::new(()), pool })
    }

    fn tick(&self) -> u64 {
        self.clock.fetch_add(1, Ordering::Relaxed)
    }

    /// The pyramid for `q`: cached, being built, or started now (in the background).
    pub fn query(self: &Arc<Self>, q: TileQuery) -> Result<Status> {
        if q.files.is_empty() {
            bail!("no files");
        }
        let key = q.key();
        if self.entries.lock().unwrap().contains_key(&key) {
            return Ok(self.status_of(&key).expect("cached"));
        }
        let mut builds = self.builds.lock().unwrap();
        if let Some(b) = builds.get(&key) {
            return Ok(b.status());
        }
        let build = Arc::new(Build { status: Mutex::new(Status::default()), estimate: RwLock::new(HashMap::new()), done: (Mutex::new(false), Condvar::new()) });
        build.status.lock().unwrap().meta.how = "queued".into();
        builds.insert(key.clone(), build.clone());
        drop(builds);
        let me = self.clone();
        let k = key.clone();
        std::thread::Builder::new().name("heat-tiles".into()).spawn(move || {
            let gate = me.gate.lock().unwrap();
            let base = me.delta_base(&q);
            let dir = me.root.join(&k);
            let r = run_build(q, k.clone(), dir.clone(), base, build.clone(), me.pool.as_ref());
            drop(gate);
            match r {
                Ok(meta) => {
                    me.entries.lock().unwrap().insert(k.clone(), Entry { meta: Arc::new(meta.clone()), pack: None, used: me.tick() });
                    let mut st = build.status.lock().unwrap();
                    st.meta = meta;
                    st.meta.index = Vec::new();
                    st.complete = true;
                    st.fraction = 1.0;
                    drop(st);
                    me.evict();
                }
                Err(e) => {
                    let _ = std::fs::remove_dir_all(&dir);
                    build.status.lock().unwrap().error = format!("{e:#}");
                }
            }
            // A failed build stays listed with its error until asked again.
            let failed = !build.status.lock().unwrap().error.is_empty();
            {
                let (m, cv) = &build.done;
                *m.lock().unwrap() = true;
                cv.notify_all();
            }
            if !failed {
                me.builds.lock().unwrap().remove(&k);
            } else {
                // Asked again later: tried again.
                std::thread::sleep(std::time::Duration::from_secs(2));
                me.builds.lock().unwrap().remove(&k);
            }
        })?;
        Ok(self.builds.lock().unwrap().get(&key).map(|b| b.status()).unwrap_or_else(|| {
            let mut s = Status::default();
            s.meta.key = key;
            s
        }))
    }

    /// The pyramid of `key`, cached or building; None when there is none. Starts nothing.
    pub fn status_of(&self, key: &str) -> Option<Status> {
        if let Some(e) = self.entries.lock().unwrap().get_mut(key) {
            e.used = self.tick();
            let mut m = (*e.meta).clone();
            m.index = Vec::new();
            return Some(Status { meta: m, fraction: 1.0, complete: true, estimate_levels: 0, error: String::new(), cached: true });
        }
        self.build_of(key).map(|b| b.status())
    }

    /// Builds queued or running.
    pub fn builds_running(&self) -> usize {
        self.builds.lock().unwrap().len()
    }

    /// The build of `key`, while one runs.
    pub fn build_of(&self, key: &str) -> Option<Arc<Build>> {
        self.builds.lock().unwrap().get(key).cloned()
    }

    /// A cached pyramid whose filter differs from `q`'s, cheaper to start from than a full pass.
    fn delta_base(&self, q: &TileQuery) -> Option<(Meta, PathBuf)> {
        let base = q.base();
        let want: HashSet<String> = canonical(&q.filter).iter().map(clause_text).collect();
        let entries = self.entries.lock().unwrap();
        let best = entries
            .values()
            .filter(|e| e.meta.base == base && !e.meta.index.is_empty())
            .map(|e| {
                let have: HashSet<String> = e.meta.filter.iter().cloned().collect();
                let cols: HashSet<String> = want.symmetric_difference(&have).map(|t| t.split('\u{1f}').nth(1).unwrap_or("").to_owned()).collect();
                (cols.len(), e.used, e.meta.clone())
            })
            .min_by_key(|(c, used, _)| (*c, u64::MAX - used))?;
        let m = (*best.2).clone();
        drop(entries);
        // Worth it only when the change leaves most groups alone.
        let sources = open_sources(&q.files).ok()?;
        let old = parse_clauses(&m.filter);
        let new = canonical(&q.filter);
        // Full: every group the new filter may keep. Delta: each touched group read
        // under the old filter and the new, where each may keep rows; plus the leaf's load.
        let (mut delta, mut full) = (1usize, 0usize);
        for s in &sources {
            for g in 0..s.file.row_groups() {
                let may_new = s.file.group_may_match(g, &new) as usize;
                full += may_new;
                if may_differ(s, g, &old, &new) {
                    delta += may_new + s.file.group_may_match(g, &old) as usize;
                }
            }
        }
        (delta < full).then(|| (m.clone(), self.root.join(&m.key)))
    }

    /// Tiles of `key` by id, at most `budget` bytes; estimates while it builds.
    pub fn read(&self, key: &str, ids: &[u64], budget: u64) -> Result<TileRead> {
        let mut out = TileRead::default();
        let mut spent = 0u64;
        let (meta, pack) = {
            let mut entries = self.entries.lock().unwrap();
            match entries.get_mut(key) {
                Some(e) => {
                    e.used = self.tick();
                    if e.pack.is_none() {
                        e.pack = Some(crate::source::map(&self.root.join(key).join("tiles.bin"))?);
                    }
                    (Some(e.meta.clone()), e.pack.clone())
                }
                None => (None, None),
            }
        };
        let estimate = if meta.is_none() { self.build_of(key) } else { None };
        if meta.is_none() && estimate.is_none() {
            bail!("no pyramid {key}: query it first");
        }
        for &id in ids {
            let (l, y, x) = tile_of(id);
            let bytes: Option<Bytes> = match (&meta, &pack) {
                (Some(m), Some(p)) => {
                    if l > m.leaf_level || x >= 1 << l || y >= 1 << l {
                        out.empty.push(id);
                        continue;
                    }
                    m.index[l as usize].get(&(y * (1 << l) + x)).map(|&[o, n]| p.slice(o as usize..(o + n) as usize))
                }
                _ => {
                    let b = estimate.as_ref().unwrap();
                    let lv = b.status.lock().unwrap().estimate_levels;
                    if l >= lv {
                        out.pending.push(id);
                        continue;
                    }
                    b.estimate.read().unwrap().get(&id).cloned()
                }
            };
            match bytes {
                None => out.empty.push(id),
                Some(b) => {
                    if spent > 0 && spent + b.len() as u64 > budget {
                        out.deferred.push(id);
                        continue;
                    }
                    spent += b.len() as u64;
                    out.tiles.push((id, b, meta.is_none()));
                }
            }
        }
        Ok(out)
    }

    /// Drops least recently used pyramids past the budget.
    fn evict(&self) {
        let mut entries = self.entries.lock().unwrap();
        let mut total: u64 = entries.values().map(|e| e.meta.bytes).sum();
        while total > self.budget && entries.len() > 1 {
            let Some(k) = entries.iter().min_by_key(|(_, e)| e.used).map(|(k, _)| k.clone()) else { break };
            let e = entries.remove(&k).unwrap();
            total -= e.meta.bytes;
            drop(e);
            let _ = std::fs::remove_dir_all(self.root.join(&k));
        }
    }

    pub fn cached_bytes(&self) -> u64 {
        self.entries.lock().unwrap().values().map(|e| e.meta.bytes).sum()
    }
}

#[derive(Default)]
pub struct TileRead {
    /// (id, bytes, estimate)
    pub tiles: Vec<(u64, Bytes, bool)>,
    pub empty: Vec<u64>,
    pub pending: Vec<u64>,
    pub deferred: Vec<u64>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tile_round_trip() {
        let mut cells = vec![0u32; TILE * TILE * 2];
        cells[5] = 7;
        cells[TILE * TILE + 9] = 70_000;
        let b = encode_tile(3, 2, 5, 2, &cells, true);
        let t = decode_tile(&b).unwrap();
        assert_eq!((t.level, t.x, t.y, t.channels, t.estimate, t.max), (3, 2, 5, 2, true, 70_000));
        assert_eq!(t.cells, cells);
        assert_eq!(tile_of(tile_id(7, 127, 3)), (7, 3, 127));
    }

    #[test]
    fn levels_sum_to_the_same() {
        let mut g = Grid::new(TILE * 2, 1);
        g.cells[0] = 1;
        g.cells[TILE * 2 * 300 + 400] = 5;
        let l = pyramid(g.cells, 1, 1);
        assert_eq!(l[0].iter().map(|&v| v as u64).sum::<u64>(), 6);
        assert_eq!(l[0][150 * TILE + 200], 5);
    }

    #[test]
    fn a_split_keeps_its_grid_bounded() {
        // Two teams and the other channel keep the plain leaf; more channels give up levels, never memory.
        assert_eq!(fitting_level(5, 3, SPLIT_GRID_BYTES), 5);
        assert_eq!(fitting_level(5, 4, SPLIT_GRID_BYTES), 4);
        assert_eq!(fitting_level(5, SPLIT_NAMED + 1, SPLIT_GRID_BYTES), 3);
    }

    #[test]
    fn keys_ignore_clause_order() {
        let q = |f: Vec<Clause>| TileQuery { files: vec!["a.parquet".into()], x: "x".into(), y: "y".into(), filter: f, split: None, leaf_level: 5 };
        let a = Clause::Range { column: "time".into(), min: Some(1.0), max: None };
        let b = Clause::Set { column: "team".into(), values: vec!["red".into(), "blue".into()] };
        let b2 = Clause::Set { column: "team".into(), values: vec!["blue".into(), "red".into()] };
        assert_eq!(q(vec![a.clone(), b]).key(), q(vec![b2, a.clone()]).key());
        assert_ne!(q(vec![a]).key(), q(vec![]).key());
        assert_eq!(parse_clauses(&[clause_text(&Clause::Range { column: "t".into(), min: Some(2.5), max: None })]), vec![Clause::Range { column: "t".into(), min: Some(2.5), max: None }]);
    }

    /// Every tile of every level, decoded, by level and index.
    fn tiles_of(p: &Packed) -> Vec<HashMap<u32, Vec<u32>>> {
        p.index.iter().map(|idx| idx.iter().map(|(&t, &[o, len])| (t, decode_tile(&p.pack[o as usize..(o + len) as usize]).unwrap().cells)).collect()).collect()
    }

    #[test]
    fn a_delta_rewrites_only_the_tiles_that_changed() {
        // Leaf level 2 (4 x 4 tiles), two channels; cells pseudo-random, some tiles empty.
        let (leaf, ch) = (2u32, 2usize);
        let n = TILE << leaf;
        let mut s: u64 = 7;
        let mut a = vec![0u32; n * n * ch];
        for (i, v) in a.iter_mut().enumerate() {
            s ^= s << 13;
            s ^= s >> 7;
            s ^= s << 17;
            let (x, y) = ((i % n) / TILE, ((i / n) % n) / TILE);
            if (x + y) % 3 != 0 && s % 5 == 0 {
                *v = (s % 1000) as u32;
            }
        }
        let base = pack_full(pyramid(a.clone(), leaf, ch), ch);
        let bm = Meta { leaf_level: leaf, channels: ch as u32, index: base.index.clone(), ..Default::default() };
        // Rows out of tile (1, 2) and into the empty tile (0, 0); tile (3, 3) touched with no net change.
        let mut b = a.clone();
        let mut diff = Grid::new(n, ch);
        let mut touched = vec![0u64; 1];
        let mut change = |x: usize, y: usize, c: usize, d: i64| {
            let i = c * n * n + y * n + x;
            let nv = (b[i] as i64 + d) as u32;
            diff.cells[i] = diff.cells[i].wrapping_add(nv.wrapping_sub(b[i]));
            b[i] = nv;
            let t = (y / TILE) * (1 << leaf) + x / TILE;
            touched[0] |= 1 << t;
        };
        let at = |tx: usize, ty: usize, o: usize| (tx * TILE + o, ty * TILE + o);
        let (x, y) = at(1, 2, 3);
        change(x, y, 1, 5);
        let (x, y) = at(1, 2, 40);
        change(x, y, 0, -(a[y * n + x] as i64));
        let (x, y) = at(0, 0, 9);
        change(x, y, 0, 12);
        let (x, y) = at(3, 3, 1);
        change(x, y, 0, 3);
        change(x, y, 0, -3);
        let delta = pack_delta_from(&diff, &touched, &bm, &base.pack).unwrap();
        let full = pack_full(pyramid(b, leaf, ch), ch);
        assert_eq!(delta.level_max, full.level_max);
        assert_eq!(tiles_of(&delta), tiles_of(&full));
        // Two leaf tiles and their ancestors: (1,2) and (0,0) at level 2, their parents (0,1) and (0,0) at 1, the root.
        assert_eq!(delta.written, 2 + 2 + 1);
    }
}
