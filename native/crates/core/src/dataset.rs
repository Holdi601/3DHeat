//! Datasets built by the core (`build`), held under a handle for the viewer to
//! take apart: its columns (`ReadDatasetColumns`), the engine's chunks packed on
//! request (`ReadChunk`), and the columns left in the files until asked for.
//!
//! Every column lives in one place. In the app's window a column the viewer takes
//! whole goes out in shared memory (`SharedSink`), and the core then reads that
//! same memory: one copy for both. A copy the viewer takes thinned (every k-th
//! row, past `page_rows`) is made when asked and not kept; the core keeps every
//! row, and the chunks hold every row.

use std::collections::HashMap;
use std::sync::{Arc, Mutex, RwLock};

use anyhow::{anyhow, bail, Result};
use rayon::prelude::*;

use crate::build::{self, Built, ChunkInfo, Col, MAX_GROUPS};
use crate::parquet::{Kind, Out, ParquetFile, Spec};
use crate::table::Dict;

/// Memory the core and the viewer's window both see (a WebView2 shared buffer).
pub trait SharedMemory: Send + Sync {
    fn ptr(&self) -> *mut u8;
    fn len(&self) -> usize;
    fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

/// Makes shared memory and hands it to the window, tagged with an id the window
/// matches to the reply that names it.
pub trait SharedSink: Send + Sync {
    fn create(&self, bytes: usize) -> Result<Arc<dyn SharedMemory>>;
    fn post(&self, mem: &Arc<dyn SharedMemory>, id: u64) -> Result<()>;
}

/// Where a column's values are.
enum Stored {
    Owned(Col),
    /// In shared memory: its element type and row count.
    Shared(Arc<dyn SharedMemory>, Elem, usize),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Elem {
    F32,
    U32,
    U16,
    U8,
}

impl Elem {
    pub fn name(self) -> &'static str {
        match self {
            Elem::F32 => "f32",
            Elem::U32 => "u32",
            Elem::U16 => "u16",
            Elem::U8 => "u8",
        }
    }

    fn size(self) -> usize {
        match self {
            Elem::F32 | Elem::U32 => 4,
            Elem::U16 => 2,
            Elem::U8 => 1,
        }
    }
}

/// A column's values, wherever they are.
#[derive(Clone, Copy)]
pub enum View<'a> {
    F32(&'a [f32]),
    U32(&'a [u32]),
    U16(&'a [u16]),
    U8(&'a [u8]),
}

impl View<'_> {
    pub fn len(&self) -> usize {
        match self {
            View::F32(v) => v.len(),
            View::U32(v) => v.len(),
            View::U16(v) => v.len(),
            View::U8(v) => v.len(),
        }
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    pub fn elem(&self) -> Elem {
        match self {
            View::F32(_) => Elem::F32,
            View::U32(_) => Elem::U32,
            View::U16(_) => Elem::U16,
            View::U8(_) => Elem::U8,
        }
    }

    #[inline]
    pub fn f32_at(&self, i: usize) -> f32 {
        match self {
            View::F32(v) => v[i],
            View::U32(v) => v[i] as f32,
            View::U16(v) => v[i] as f32,
            View::U8(v) => v[i] as f32,
        }
    }

    pub fn bytes(&self) -> &[u8] {
        match self {
            View::F32(v) => as_bytes(v),
            View::U32(v) => as_bytes(v),
            View::U16(v) => as_bytes(v),
            View::U8(v) => v,
        }
    }

    /// Every `step`-th row, as little-endian bytes into `out`.
    fn thin_into(&self, step: usize, out: &mut [u8]) {
        let size = self.elem().size();
        let src = self.bytes();
        out.par_chunks_mut(size * 65536).enumerate().for_each(|(k, o)| {
            for (j, d) in o.chunks_mut(size).enumerate() {
                let r = (k * 65536 + j) * step;
                d.copy_from_slice(&src[r * size..r * size + size]);
            }
        });
    }
}

fn as_bytes<T: Copy>(v: &[T]) -> &[u8] {
    // SAFETY: plain numbers, no padding.
    unsafe { std::slice::from_raw_parts(v.as_ptr() as *const u8, std::mem::size_of_val(v)) }
}

impl Stored {
    fn view(&self) -> View<'_> {
        match self {
            Stored::Owned(Col::F32(v)) => View::F32(v),
            Stored::Owned(Col::U32(v)) => View::U32(v),
            Stored::Owned(Col::U16(v)) => View::U16(v),
            Stored::Owned(Col::U8(v)) => View::U8(v),
            // SAFETY: the memory lives as long as `mem`, holds `n` elements of `e`, and
            // is aligned (a shared buffer starts on a page).
            Stored::Shared(mem, e, n) => unsafe {
                match e {
                    Elem::F32 => View::F32(std::slice::from_raw_parts(mem.ptr() as *const f32, *n)),
                    Elem::U32 => View::U32(std::slice::from_raw_parts(mem.ptr() as *const u32, *n)),
                    Elem::U16 => View::U16(std::slice::from_raw_parts(mem.ptr() as *const u16, *n)),
                    Elem::U8 => View::U8(std::slice::from_raw_parts(mem.ptr(), *n)),
                }
            },
        }
    }
}

/// A column read on demand: its values in sorted order and what the viewer is told of it.
pub struct OnDemand {
    pub numeric: bool,
    pub categories: Vec<String>,
    pub min: f64,
    pub max: f64,
}

/// A built dataset held by the core.
pub struct Dataset {
    pub rows: usize,
    pub chunks: Vec<ChunkInfo>,
    pub max_lifetime_gap: f64,
    pub page_step: usize,
    columns: RwLock<HashMap<String, Stored>>,
    /// What a load reads its later columns from: the files, the spec, where each
    /// file's rows went, and the sort.
    files: Vec<ParquetFile>,
    spec: build::BuildSpec,
    kept: Option<(Vec<Vec<u32>>, Vec<usize>)>,
    order: Option<Vec<u32>>,
    on_demand: Mutex<HashMap<String, OnDemand>>,
    read_lock: Mutex<()>,
}

/// The role columns' names, as `ReadDatasetColumns` asks for them.
pub const ROLE_COLUMNS: [&str; 17] = [
    "@px",
    "@py",
    "@pz",
    "@time",
    "@lifetime",
    "@yaw",
    "@pitch",
    "@person",
    "@team",
    "@session",
    "@sessionRows",
    "@sessionStart",
    "@sessionEnd",
    "@personTeam",
    "@personSlot",
    "@teamSizes",
    "@personShared",
];

/// Columns of the viewer's copy, rather than one value a row.
fn per_row(name: &str) -> bool {
    !matches!(name, "@sessionRows" | "@sessionStart" | "@sessionEnd" | "@personTeam" | "@personSlot" | "@teamSizes" | "@personShared")
}

impl Dataset {
    /// Takes a build apart into columns. `page_rows` (0: all) decides the viewer's copy.
    pub fn new(mut b: Built, files: Vec<ParquetFile>, spec: build::BuildSpec, chunk_rows: usize, page_rows: usize) -> (Self, Vec<String>, f64) {
        let n = b.rows;
        let page_step = if page_rows > 0 && n > page_rows { n.div_ceil(page_rows) } else { 1 };
        let chunk_rows = if chunk_rows == 0 { crate::chunks::CHUNK_ROWS } else { chunk_rows };
        let chunks = build::chunk_infos(&b.x, &b.y, &b.z, b.time.as_deref(), b.lifetime.is_some(), b.max_lifetime_gap, chunk_rows);
        let mut cols: HashMap<String, Stored> = HashMap::new();
        let mut put = |name: &str, c: Option<Col>| {
            if let Some(c) = c {
                cols.insert(name.to_owned(), Stored::Owned(c));
            }
        };
        // The viewer's copy, when thinned, has lifetimes of its own: the gap to the next of its rows.
        let mut page_gap = b.max_lifetime_gap;
        let mut page_life = None;
        if page_step > 1 {
            if let (Some(t), Some(p)) = (&b.time, &b.person) {
                // Read in place, every k-th row: no copy of the columns for it.
                let cat_refs: Vec<&[u32]> = b
                    .attrs
                    .iter()
                    .filter(|a| a.categories.is_some())
                    .filter_map(|a| match &a.data {
                        Col::U32(v) => Some(&v[..]),
                        _ => None,
                    })
                    .collect();
                let d = [b.bounds.max[0] - b.bounds.min[0], b.bounds.max[1] - b.bounds.min[1], b.bounds.max[2] - b.bounds.min[2]];
                let sep = (d[0] * d[0] + d[1] * d[1] + d[2] * d[2]).sqrt() * 0.01;
                let rows = build::Rows { time: t, person: p, session: b.session.as_deref(), x: &b.x, y: &b.y, z: &b.z, cats: &cat_refs, step: page_step };
                let l = build::lifetimes(&rows, b.person_labels.len(), sep * sep);
                page_gap = l.max_gap;
                page_life = Some(l.lifetime);
            }
        }
        put("@px", Some(Col::F32(std::mem::take(&mut b.x))));
        put("@py", Some(Col::F32(std::mem::take(&mut b.y))));
        put("@pz", Some(Col::F32(std::mem::take(&mut b.z))));
        put("@time", b.time.take().map(Col::F32));
        put("@lifetime", b.lifetime.take().map(Col::F32));
        put("@pageLifetime", page_life.map(Col::F32));
        put("@yaw", b.yaw.take().map(Col::F32));
        put("@pitch", b.pitch.take().map(Col::F32));
        put("@person", b.person.take().map(Col::U32));
        put("@team", b.team.take().map(Col::U16));
        put("@session", b.session.take().map(Col::U32));
        put("@sessionRows", b.session_rows.take().map(Col::U32));
        put("@sessionStart", b.session_start.take().map(Col::F32));
        put("@sessionEnd", b.session_end.take().map(Col::F32));
        put("@personTeam", b.person_team.take().map(Col::U16));
        put("@personSlot", b.person_slot.take().map(Col::U16));
        put("@teamSizes", b.team_sizes.take().map(Col::U32));
        put("@personShared", b.person_shared.take().map(Col::U8));
        let mut names: Vec<String> = ROLE_COLUMNS.iter().filter(|c| cols.contains_key(**c)).map(|c| c.to_string()).collect();
        for a in std::mem::take(&mut b.attrs) {
            names.push(a.name.clone());
            cols.insert(a.name, Stored::Owned(a.data));
        }
        let ds = Dataset {
            rows: n,
            chunks,
            max_lifetime_gap: b.max_lifetime_gap,
            page_step,
            columns: RwLock::new(cols),
            files,
            spec,
            kept: b.kept.take(),
            order: b.order.take(),
            on_demand: Mutex::new(HashMap::new()),
            read_lock: Mutex::new(()),
        };
        (ds, names, page_gap)
    }

    /// Rows of the viewer's copy.
    pub fn page_rows(&self) -> usize {
        self.rows.div_ceil(self.page_step)
    }

    fn with<R>(&self, name: &str, f: impl FnOnce(View) -> R) -> Option<R> {
        let cols = self.columns.read().unwrap();
        cols.get(name).map(|s| f(s.view()))
    }

    /// A column of the viewer's copy, written by `write` into memory of `bytes`.
    /// Returns its element type, or None when there is no such column.
    pub fn page_column(&self, name: &str, alloc: &mut dyn FnMut(usize) -> Result<*mut u8>) -> Result<Option<(Elem, usize)>> {
        let src = if name == "@lifetime" && self.page_step > 1 { "@pageLifetime" } else { name };
        if !self.columns.read().unwrap().contains_key(src) {
            if !self.on_demand.lock().unwrap().contains_key(name) && !self.is_on_demand(name) {
                return Ok(None);
            }
            self.read_on_demand(name)?;
        }
        let step = if per_row(name) && src != "@pageLifetime" { self.page_step } else { 1 };
        let got = self.with(src, |v| -> Result<(Elem, usize)> {
            let e = v.elem();
            let rows = if step > 1 { v.len().div_ceil(step) } else { v.len() };
            let bytes = rows * e.size();
            let ptr = alloc(bytes)?;
            // SAFETY: `alloc` gave `bytes` writable bytes.
            let out = unsafe { std::slice::from_raw_parts_mut(ptr, bytes) };
            if step > 1 {
                v.thin_into(step, out);
            } else {
                let src = v.bytes();
                out.par_chunks_mut(1 << 24).zip(src.par_chunks(1 << 24)).for_each(|(o, s)| o.copy_from_slice(s));
            }
            Ok((e, rows))
        });
        got.transpose()
    }

    /// The column now lives in `mem` (the viewer took it whole): the core reads it there.
    pub fn adopt_shared(&self, name: &str, mem: Arc<dyn SharedMemory>) {
        let mut cols = self.columns.write().unwrap();
        if let Some(s) = cols.get(name) {
            let v = s.view();
            let (e, n) = (v.elem(), v.len());
            if mem.len() >= n * e.size() {
                cols.insert(name.to_owned(), Stored::Shared(mem, e, n));
            }
        }
    }

    /// One chunk's rows of a column, as float32 (the GPU's filter columns).
    pub fn chunk_column(&self, name: &str, chunk: usize, out: &mut [f32]) -> Result<bool> {
        let c = *self.chunks.get(chunk).ok_or_else(|| anyhow!("no chunk {chunk}"))?;
        if !self.columns.read().unwrap().contains_key(name) {
            if !self.is_on_demand(name) {
                return Ok(false);
            }
            self.read_on_demand(name)?;
        }
        Ok(self
            .with(name, |v| {
                out[..c.rows].par_chunks_mut(65536).enumerate().for_each(|(k, o)| {
                    for (j, d) in o.iter_mut().enumerate() {
                        *d = v.f32_at(c.start + k * 65536 + j);
                    }
                });
            })
            .is_some())
    }

    /// Bytes of one chunk part: positions (8 a row) or times (4 a row).
    pub fn chunk_bytes(&self, chunk: usize, times: bool) -> Result<usize> {
        let c = self.chunks.get(chunk).ok_or_else(|| anyhow!("no chunk {chunk}"))?;
        if times && !self.columns.read().unwrap().contains_key("@lifetime") {
            bail!("no times");
        }
        Ok(c.rows * if times { 4 } else { 8 })
    }

    /// Packs one chunk part into `out` (`chunk_bytes` long).
    pub fn pack(&self, chunk: usize, times: bool, out: &mut [u32]) -> Result<()> {
        let c = *self.chunks.get(chunk).ok_or_else(|| anyhow!("no chunk {chunk}"))?;
        let cols = self.columns.read().unwrap();
        let f = |n: &str| -> Result<&[f32]> {
            match cols.get(n).map(|s| s.view()) {
                Some(View::F32(v)) => Ok(v),
                _ => Err(anyhow!("no column {n}")),
            }
        };
        if times {
            let life = f("@lifetime")?;
            build::pack_times(&c, f("@time")?, life, self.max_lifetime_gap, out);
        } else {
            let group = match cols.get("@team").map(|s| s.view()) {
                Some(View::U16(v)) => Some(v),
                _ => None,
            };
            build::pack_positions(&c, f("@px")?, f("@py")?, f("@pz")?, group, out);
        }
        Ok(())
    }

    fn is_on_demand(&self, name: &str) -> bool {
        self.spec.mapping.on_demand.iter().any(|(c, _)| c == name)
    }

    /// What the viewer is told of a column read on demand.
    pub fn on_demand_info(&self, name: &str) -> Option<(bool, Vec<String>, f64, f64)> {
        self.on_demand.lock().unwrap().get(name).map(|o| (o.numeric, o.categories.clone(), o.min, o.max))
    }

    /// Reads a column left in the files: each file's kept rows, in load order,
    /// then sorted as every other column was.
    fn read_on_demand(&self, name: &str) -> Result<()> {
        let _one = self.read_lock.lock().unwrap();
        if self.columns.read().unwrap().contains_key(name) {
            return Ok(());
        }
        let numeric = self.spec.mapping.on_demand.iter().find(|(c, _)| c == name).map(|(_, n)| *n).ok_or_else(|| anyhow!("no column {name}"))?;
        let (kept, starts) = self.kept.as_ref().ok_or_else(|| anyhow!("no row map"))?;
        let n = self.rows;
        let spec = [Spec { name: name.to_owned(), kind: if numeric { Kind::F32 } else { Kind::Dict } }];
        let parts: Vec<Option<Out>> = self
            .files
            .par_iter()
            .enumerate()
            .map(|(i, f)| -> Result<Option<Out>> {
                if kept[i].is_empty() || !f.has_column(name) {
                    return Ok(None);
                }
                let mut r = f.read(&spec, &self.spec.filter, false)?;
                Ok(r.columns.pop())
            })
            .collect::<Result<_>>()?;
        let (col, info) = if numeric {
            let mut v = vec![0f32; n];
            for (i, p) in parts.iter().enumerate() {
                if let Some(Out::F32(src)) = p {
                    for (j, &r) in kept[i].iter().enumerate() {
                        v[starts[i] + j] = src[r as usize];
                    }
                }
            }
            let (mut mn, mut mx) = (f32::INFINITY, f32::NEG_INFINITY);
            for &x in v.iter().filter(|x| x.is_finite()) {
                mn = mn.min(x);
                mx = mx.max(x);
            }
            let (mn, mx) = (if mn.is_finite() { mn as f64 } else { 0.0 }, if mx.is_finite() { mx as f64 } else { 0.0 });
            (Col::F32(v), OnDemand { numeric: true, categories: vec![], min: mn, max: mx })
        } else {
            let mut d = Dict::new();
            d.intern("");
            let mut v = vec![0u32; n];
            for (i, p) in parts.iter().enumerate() {
                if let Some(Out::Dict(src)) = p {
                    let map: Vec<u32> = src.labels.iter().map(|l| d.intern(l)).collect();
                    for (j, &r) in kept[i].iter().enumerate() {
                        v[starts[i] + j] = map[src.ids[r as usize] as usize];
                    }
                }
            }
            if d.labels.len() > MAX_GROUPS {
                bail!("{name} has {} values, past the {MAX_GROUPS} a category column keeps", d.labels.len());
            }
            let max = d.labels.len().saturating_sub(1) as f64;
            (Col::U32(v), OnDemand { numeric: false, categories: d.labels, min: 0.0, max })
        };
        let col = match &self.order {
            Some(o) => col.gather(o),
            None => col,
        };
        self.columns.write().unwrap().insert(name.to_owned(), Stored::Owned(col));
        self.on_demand.lock().unwrap().insert(name.to_owned(), info);
        Ok(())
    }

    /// Gives back a column read on demand (the viewer evicted it).
    pub fn drop_column(&self, name: &str) {
        if self.is_on_demand(name) {
            self.columns.write().unwrap().remove(name);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn thins_every_kth_row() {
        let v = View::U32(&[0, 1, 2, 3, 4, 5, 6]);
        let mut out = vec![0u8; 3 * 4];
        v.thin_into(3, &mut out);
        let got: Vec<u32> = out.chunks(4).map(|c| u32::from_le_bytes(c.try_into().unwrap())).collect();
        assert_eq!(got, [0, 3, 6]);
    }
}
