//! The core behind the protocol: one request frame in, one reply frame out.
//!
//! Transport-free on purpose. The native app's window reaches it over Tauri's
//! custom protocol; Stage 2b's browser clients will reach the same `Core` over
//! WSS. Bulk data goes in the frame's payload, never in protobuf fields.

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex, RwLock};
use std::time::Instant;

use anyhow::{anyhow, bail, Result};
use heat3d_proto::v1::{self, envelope::Body, ColumnKind, ErrorCode};
use heat3d_proto::{frame, unframe, PROTOCOL};

use crate::chunks::{build, ChunkSet};
use crate::filter::Clause;
use crate::parquet::{Kind, Out, ParquetFile, Spec, Unsupported};
use crate::source::{self, Format, Source};
use crate::table::{Column, Dict};

/// Bytes of a reply's payload, each buffer at an 8-byte boundary.
#[derive(Default)]
pub struct Payload {
    pub bytes: Vec<u8>,
}

impl Payload {
    pub fn push(&mut self, data: &[u8]) -> v1::Buffer {
        while self.bytes.len() % 8 != 0 {
            self.bytes.push(0);
        }
        let offset = self.bytes.len() as u64;
        self.bytes.extend_from_slice(data);
        v1::Buffer { offset, length: data.len() as u64 }
    }

    pub fn f32s(&mut self, v: &[f32]) -> v1::Buffer {
        self.push(as_bytes(v))
    }

    pub fn f64s(&mut self, v: &[f64]) -> v1::Buffer {
        self.push(as_bytes(v))
    }

    pub fn u32s(&mut self, v: &[u32]) -> v1::Buffer {
        self.push(as_bytes(v))
    }
}

/// A slice of plain numbers as its little-endian bytes (every target this builds for is little-endian).
fn as_bytes<T: Copy>(v: &[T]) -> &[u8] {
    // SAFETY: f32, f64 and u32 have no padding and any byte pattern is a valid u8.
    unsafe { std::slice::from_raw_parts(v.as_ptr() as *const u8, std::mem::size_of_val(v)) }
}

#[cfg(not(target_endian = "little"))]
compile_error!("the protocol's buffers are little-endian");

/// What a caller may ask for.
#[derive(Debug, Clone, Copy)]
pub struct Access {
    /// Name files by path on this machine. The app's own window may; a client of
    /// the server from elsewhere may not, and names only files the host shared.
    pub paths: bool,
}

impl Access {
    pub const OWNER: Access = Access { paths: true };
    pub const REMOTE: Access = Access { paths: false };
}

pub struct Core {
    /// Files the window handed over, by token.
    tokens: RwLock<HashMap<String, PathBuf>>,
    next: AtomicU64,
    chunk_sets: Mutex<HashMap<u64, Arc<ChunkSet>>>,
    datasets: Mutex<HashMap<u64, Vec<(PathBuf, String)>>>,
    served: Mutex<HashMap<String, u64>>,
}

impl Default for Core {
    fn default() -> Self {
        Self::new()
    }
}

impl Core {
    pub fn new() -> Self {
        Self {
            tokens: RwLock::new(HashMap::new()),
            next: AtomicU64::new(1),
            chunk_sets: Mutex::new(HashMap::new()),
            datasets: Mutex::new(HashMap::new()),
            served: Mutex::new(HashMap::new()),
        }
    }

    /// Lets the window name a file by token rather than by path.
    pub fn register_file(&self, path: PathBuf) -> String {
        let token = format!("f{}", self.next.fetch_add(1, Ordering::Relaxed));
        self.tokens.write().unwrap().insert(token.clone(), path);
        token
    }

    pub fn token_path(&self, token: &str) -> Option<PathBuf> {
        self.tokens.read().unwrap().get(token).cloned()
    }

    fn resolve(&self, f: &Option<v1::FileRef>, access: Access) -> Result<(PathBuf, String)> {
        let f = f.as_ref().ok_or_else(|| anyhow!("no file named"))?;
        let path = match &f.source {
            Some(v1::file_ref::Source::Path(_)) if !access.paths => bail!(Denied("files by path".into())),
            Some(v1::file_ref::Source::Path(p)) => PathBuf::from(p),
            Some(v1::file_ref::Source::Token(t)) => self.token_path(t).ok_or_else(|| anyhow!("unknown file token {t}"))?,
            None => bail!("no file named"),
        };
        Ok((path, f.member.clone()))
    }

    fn open(&self, f: &Option<v1::FileRef>, access: Access) -> Result<Source> {
        let (p, m) = self.resolve(f, access)?;
        source::open(&p, &m)
    }

    /// Answers one request frame from the owner (the app's own window).
    pub fn handle(&self, request: &[u8]) -> Vec<u8> {
        self.handle_as(request, Access::OWNER)
    }

    /// Answers one request frame from a caller with `access`.
    pub fn handle_as(&self, request: &[u8], access: Access) -> Vec<u8> {
        let (env, _) = match unframe(request) {
            Ok(x) => x,
            Err(e) => return reply(0, error(ErrorCode::Invalid, format!("bad frame: {e}")), Payload::default()),
        };
        let id = env.id;
        let mut payload = Payload::default();
        let body = match self.dispatch(env.body, &mut payload, access) {
            Ok(b) => b,
            Err(e) => {
                payload = Payload::default();
                let code = if e.downcast_ref::<Unsupported>().is_some() {
                    ErrorCode::Unsupported
                } else if e.downcast_ref::<Denied>().is_some() {
                    ErrorCode::Invalid
                } else {
                    ErrorCode::Internal
                };
                error(code, format!("{e:#}"))
            }
        };
        reply(id, body, payload)
    }

    fn dispatch(&self, body: Option<Body>, out: &mut Payload, access: Access) -> Result<Body> {
        let body = body.ok_or_else(|| anyhow!("empty request"))?;
        *self.served.lock().unwrap().entry(kind_of(&body).into()).or_default() += 1;
        Ok(match body {
            Body::Hello(_) => Body::HelloReply(v1::HelloReply {
                core: "heat3d-core".into(),
                core_version: env!("CARGO_PKG_VERSION").into(),
                threads: rayon::current_num_threads() as u32,
                memory_bytes: crate::memory::total_bytes(),
                formats: vec!["parquet".into(), "csv".into(), "acmi".into(), "3dheat".into()],
                served: self.served.lock().unwrap().clone(),
            }),
            Body::Echo(e) => {
                let n = e.payload_bytes.min(1 << 32) as usize;
                let mut v = vec![0u8; n];
                for (i, b) in v.iter_mut().enumerate().step_by(4096) {
                    *b = i as u8;
                }
                out.push(&v);
                Body::Echo(e)
            }
            Body::OpenDataset(o) => self.open_dataset(o, access)?,
            Body::CloseDataset(c) => {
                self.datasets.lock().unwrap().remove(&c.handle);
                self.chunk_sets.lock().unwrap().remove(&c.handle);
                Body::Closed(v1::Closed {})
            }
            Body::ReadColumns(r) => self.read_columns(r, out, access)?,
            Body::ReadTable(r) => self.read_table(r, out, access)?,
            Body::ScanCsv(r) => self.scan_csv(r, out, access)?,
            Body::BuildChunks(r) => self.build_chunks(r, access)?,
            Body::ReadChunk(r) => {
                let set = self.chunk_sets.lock().unwrap().get(&r.handle).cloned().ok_or_else(|| anyhow!("no such chunks"))?;
                let c = set.chunks.get(r.index as usize).ok_or_else(|| anyhow!("no chunk {}", r.index))?;
                let data = match v1::ChunkPart::try_from(r.part).unwrap_or_default() {
                    v1::ChunkPart::Positions => out.u32s(&c.positions),
                    v1::ChunkPart::Times => out.u32s(&c.times),
                    _ => bail!("no such chunk part"),
                };
                Body::ChunkData(v1::ChunkData { index: r.index, part: r.part, data: Some(data) })
            }
            Body::Query(q) => match q.kind {
                Some(v1::query::Kind::Count(c)) => {
                    let clauses = clauses_of(&c.filter);
                    let mut rc = v1::RowCount::default();
                    for f in &c.files {
                        let s = self.open(&Some(f.clone()), access)?;
                        let pf = ParquetFile::open(s.bytes)?;
                        let st = pf.count(&clauses)?;
                        rc.matched += st.kept;
                        rc.scanned_rows += st.rows;
                        rc.rows_skipped += st.rows_skipped;
                        rc.groups += st.groups;
                        rc.groups_skipped += st.groups_skipped;
                        rc.scanned_files += 1;
                    }
                    Body::QueryReply(v1::QueryReply { kind: Some(v1::query_reply::Kind::Count(rc)) })
                }
                None => bail!("empty query"),
            },
            _ => return Err(Unsupported("this request".into()).into()),
        })
    }

    fn open_dataset(&self, o: v1::OpenDataset, access: Access) -> Result<Body> {
        let mut files = Vec::new();
        let mut refs = Vec::new();
        for f in &o.files {
            let (path, member) = self.resolve(&Some(f.clone()), access)?;
            let s = source::open(&path, &member)?;
            let mut info = v1::FileInfo { name: s.name.clone(), bytes: s.bytes.len() as u64, ..Default::default() };
            match s.format {
                Format::Parquet => {
                    let pf = ParquetFile::open(s.bytes.clone())?;
                    info.format = v1::Format::Parquet as i32;
                    info.rows = pf.rows();
                    info.rows_exact = true;
                    info.row_groups = pf.row_groups() as u32;
                    info.hints_json = pf.hints().unwrap_or_default();
                    info.columns = pf
                        .columns()
                        .into_iter()
                        .map(|c| v1::ColumnInfo { name: c.name, physical: c.physical, logical: c.logical, text: c.text, timestamp: c.timestamp })
                        .collect();
                }
                Format::Container => {
                    let c = crate::container::Container::open(&s.bytes)?;
                    info.format = v1::Format::Container as i32;
                    info.manifest_json = c.manifest_json.clone();
                    let roles: HashMap<String, String> = c.members().into_iter().collect();
                    info.members = c
                        .entries
                        .iter()
                        .map(|e| v1::ContainerMember {
                            name: e.name.clone(),
                            role: roles.get(&e.name).cloned().unwrap_or_default(),
                            method: e.method as u32,
                            compressed_bytes: e.compressed,
                            bytes: e.size,
                            data_offset: e.data,
                        })
                        .collect();
                }
                Format::Acmi => info.format = v1::Format::Acmi as i32,
                Format::Csv => info.format = v1::Format::Csv as i32,
            }
            files.push(info);
            refs.push((path, member));
        }
        let handle = self.next.fetch_add(1, Ordering::Relaxed);
        self.datasets.lock().unwrap().insert(handle, refs);
        Ok(Body::DatasetInfo(v1::DatasetInfo { handle, files }))
    }

    fn read_columns(&self, r: v1::ReadColumns, out: &mut Payload, access: Access) -> Result<Body> {
        let t0 = Instant::now();
        let s = self.open(&r.file, access)?;
        if s.format != Format::Parquet {
            bail!("{} is not a Parquet table", s.name);
        }
        let pf = ParquetFile::open(s.bytes)?;
        let specs: Vec<Spec> = r
            .columns
            .iter()
            .map(|c| Spec {
                name: c.name.clone(),
                kind: match ColumnKind::try_from(c.kind).unwrap_or_default() {
                    ColumnKind::F64 => Kind::F64,
                    ColumnKind::Dict => Kind::Dict,
                    _ => Kind::F32,
                },
            })
            .collect();
        let res = pf.read(&specs, &clauses_of(&r.filter), r.kept_rows)?;
        let read_ms = t0.elapsed().as_secs_f64() * 1e3;
        let mut cols = Vec::with_capacity(res.columns.len());
        for (spec, col) in specs.iter().zip(res.columns) {
            cols.push(match col {
                Out::F32(v) => v1::ColumnData { name: spec.name.clone(), kind: ColumnKind::F32 as i32, values: Some(out.f32s(&v)), labels: vec![] },
                Out::F64(v) => v1::ColumnData { name: spec.name.clone(), kind: ColumnKind::F64 as i32, values: Some(out.f64s(&v)), labels: vec![] },
                Out::Dict(d) => dict_column(&spec.name, d, out),
            });
        }
        let kept_rows = res.kept_rows.map(|k| out.u32s(&k));
        Ok(Body::Columns(v1::Columns {
            rows_total: res.rows_total,
            rows: res.rows as u64,
            filtered: res.filtered.map(stats_of),
            columns: cols,
            kept_rows,
            timing: Some(v1::Timing {
                read_ms,
                total_ms: t0.elapsed().as_secs_f64() * 1e3,
                threads: rayon::current_num_threads() as u32,
                ..Default::default()
            }),
        }))
    }

    fn read_table(&self, r: v1::ReadTable, out: &mut Payload, access: Access) -> Result<Body> {
        let s = self.open(&r.file, access)?;
        if s.format != Format::Acmi {
            bail!("{} is not a recording", s.name);
        }
        let text = crate::acmi::acmi_text(&s.bytes)?;
        let stem = strip_acmi_ext(&s.name);
        let t = crate::acmi::parse_acmi(&text, &stem);
        drop(text);
        let mut cols = Vec::with_capacity(t.columns.len());
        for (name, col) in t.columns.iter().zip(t.data) {
            cols.push(match col {
                Column::Num(v) => v1::ColumnData { name: name.clone(), kind: ColumnKind::F64 as i32, values: Some(out.f64s(&v)), labels: vec![] },
                Column::Text(d) => dict_column(name, d, out),
            });
        }
        let info = serde_json::json!({
            "title": t.title,
            "referenceTime": t.reference_time,
            "reference": { "lon": t.reference_lon, "lat": t.reference_lat },
            "flatWorld": t.flat_world,
            "globals": serde_json::Map::from_iter(t.globals.into_iter().map(|(k, v)| (k, serde_json::Value::String(v)))),
            "completeness": serde_json::Map::from_iter(t.completeness.into_iter().map(|(k, c)| (k, serde_json::json!({
                "seen": c.seen, "decoded": c.decoded, "partial": c.partial, "raw": c.raw, "lost": c.lost
            })))),
        });
        Ok(Body::Table(v1::Table { rows: t.rows as u64, columns: cols, info_json: info.to_string() }))
    }

    fn scan_csv(&self, r: v1::ScanCsv, out: &mut Payload, access: Access) -> Result<Body> {
        let t0 = Instant::now();
        let s = self.open(&r.file, access)?;
        let slot = |v: i32| (v >= 0).then_some(v as usize);
        let tests = |v: &[v1::CsvTest]| -> Vec<(usize, Clause)> {
            v.iter().filter_map(|t| Some((t.slot as usize, clause_of(t.clause.as_ref()?)?))).collect()
        };
        let plan = crate::csv::CsvPlan {
            delimiter: u8::try_from(r.delimiter).map_err(|_| Unsupported("a separator past one byte".into()))?,
            number_columns: r.number_columns.iter().map(|&c| c.max(0) as usize).collect(),
            wide_slot: slot(r.wide_slot),
            text_columns: r.text_columns.iter().map(|&c| c.max(0) as usize).collect(),
            axis_slots: [0, 1, 2].map(|k| r.axis_slots.get(k).and_then(|&v| slot(v))),
            number_tests: tests(&r.number_tests),
            text_tests: tests(&r.text_tests),
            stride: r.stride.max(1) as usize,
            has_header: true,
        };
        let res = crate::csv::scan_csv(&s.bytes, &plan)?;
        let numbers = res
            .numbers
            .iter()
            .enumerate()
            .map(|(i, v)| {
                if Some(i) == plan.wide_slot {
                    let w = res.wide.as_deref().unwrap_or(&[]);
                    v1::ColumnData { kind: ColumnKind::F64 as i32, values: Some(out.f64s(w)), ..Default::default() }
                } else {
                    v1::ColumnData { kind: ColumnKind::F32 as i32, values: Some(out.f32s(v)), ..Default::default() }
                }
            })
            .collect();
        let texts = res.texts.into_iter().map(|d| dict_column("", d, out)).collect();
        Ok(Body::CsvColumns(v1::CsvColumns {
            rows: res.rows as u64,
            rejected: res.rejected as u64,
            filtered: res.filtered.map(stats_of),
            numbers,
            texts,
            timing: Some(v1::Timing { total_ms: t0.elapsed().as_secs_f64() * 1e3, threads: rayon::current_num_threads() as u32, ..Default::default() }),
        }))
    }

    fn build_chunks(&self, r: v1::BuildChunks, access: Access) -> Result<Body> {
        let t0 = Instant::now();
        let mut files = Vec::with_capacity(r.files.len());
        for f in &r.files {
            let s = self.open(&Some(f.clone()), access)?;
            if s.format != Format::Parquet {
                return Err(Unsupported("chunks from anything but Parquet".into()).into());
            }
            files.push(ParquetFile::open(s.bytes)?);
        }
        let name = |s: &str| (!s.is_empty()).then(|| s.to_owned());
        let spec = crate::bulk::BulkSpec {
            x: name(&r.x),
            y: name(&r.y),
            z: name(&r.z),
            time: name(&r.time),
            person: name(&r.person),
            group: name(&r.group),
            time_scale: r.time_scale,
            filter: clauses_of(&r.filter),
            stride: r.stride.max(1) as usize,
        };
        let bulk = crate::bulk::load(&files, &spec)?;
        drop(files);
        let read_ms = bulk.read_ms;
        let (rows_read, labels) = (bulk.rows_read, bulk.group_labels);
        let set = build(bulk.rows, r.chunk_rows as usize);
        let handle = self.next.fetch_add(1, Ordering::Relaxed);
        let reply = v1::ChunkSet {
            handle,
            rows: set.rows as u64,
            rows_read,
            time_min: set.time_min,
            time_max: set.time_max,
            max_lifetime_gap: set.max_lifetime_gap,
            chunks: set
                .chunks
                .iter()
                .enumerate()
                .map(|(i, c)| v1::ChunkInfo {
                    index: i as u32,
                    start: c.start as u64,
                    rows: c.rows as u32,
                    aabb_min: c.aabb_min.to_vec(),
                    aabb_size: c.aabb_size.to_vec(),
                    time_min: c.time_min,
                    time_scale: c.time_scale,
                    life_scale: c.life_scale,
                })
                .collect(),
            timing: Some(v1::Timing {
                read_ms,
                sort_ms: set.timing.sort_ms + set.timing.lifetime_ms,
                pack_ms: set.timing.pack_ms,
                total_ms: t0.elapsed().as_secs_f64() * 1e3,
                threads: rayon::current_num_threads() as u32,
                ..Default::default()
            }),
            peak_memory_bytes: crate::memory::peak_bytes(),
            group_labels: labels,
        };
        self.chunk_sets.lock().unwrap().insert(handle, Arc::new(set));
        Ok(Body::ChunkSet(reply))
    }
}

fn kind_of(b: &Body) -> &'static str {
    match b {
        Body::Hello(_) => "hello",
        Body::Echo(_) => "echo",
        Body::OpenDataset(_) => "open_dataset",
        Body::CloseDataset(_) => "close_dataset",
        Body::ReadColumns(_) => "read_columns",
        Body::ReadTable(_) => "read_table",
        Body::ScanCsv(_) => "scan_csv",
        Body::BuildChunks(_) => "build_chunks",
        Body::ReadChunk(_) => "read_chunk",
        Body::Query(_) => "query",
        _ => "other",
    }
}

/// A request this caller may not make.
#[derive(Debug)]
pub struct Denied(pub String);

impl std::fmt::Display for Denied {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "not allowed from here: {}", self.0)
    }
}

impl std::error::Error for Denied {}

/// `<name>.acmi`, `.zip.acmi`, `.txt.acmi` without the extension, as `acmiTableOf` titles it.
fn strip_acmi_ext(name: &str) -> String {
    let lower = name.to_ascii_lowercase();
    for ext in [".zip.acmi", ".txt.acmi", ".acmi"] {
        if lower.ends_with(ext) {
            return name[..name.len() - ext.len()].to_owned();
        }
    }
    name.to_owned()
}

fn dict_column(name: &str, d: Dict, out: &mut Payload) -> v1::ColumnData {
    let (labels, ids) = d.into_parts();
    v1::ColumnData { name: name.to_owned(), kind: ColumnKind::Dict as i32, values: Some(out.u32s(&ids)), labels }
}

fn stats_of(s: crate::filter::FilterStats) -> v1::FilterStats {
    v1::FilterStats { rows: s.rows, kept: s.kept, rows_skipped: s.rows_skipped, groups: s.groups, groups_skipped: s.groups_skipped }
}

fn clause_of(c: &v1::RowFilterClause) -> Option<Clause> {
    Some(match c.test.as_ref()? {
        v1::row_filter_clause::Test::Set(s) => Clause::Set { column: c.column.clone(), values: s.values.clone() },
        v1::row_filter_clause::Test::Range(r) => Clause::Range { column: c.column.clone(), min: r.min, max: r.max },
    })
}

fn clauses_of(v: &[v1::RowFilterClause]) -> Vec<Clause> {
    v.iter().filter_map(clause_of).collect()
}

fn error(code: ErrorCode, message: String) -> Body {
    Body::Error(v1::Error { code: code as i32, message })
}

fn reply(reply_to: u64, body: Body, payload: Payload) -> Vec<u8> {
    let env = v1::Envelope { protocol: PROTOCOL, reply_to, body: Some(body), ..Default::default() };
    frame(&env, &payload.bytes)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hello_and_echo() {
        let core = Core::new();
        let req = |body| frame(&v1::Envelope { protocol: PROTOCOL, id: 5, body: Some(body), ..Default::default() }, &[]);
        let out = core.handle(&req(Body::Hello(v1::Hello { client: "test".into() })));
        let (env, _) = unframe(&out).unwrap();
        assert_eq!(env.reply_to, 5);
        assert!(matches!(env.body, Some(Body::HelloReply(_))));
        let out = core.handle(&req(Body::Echo(v1::Echo { payload_bytes: 1000 })));
        let (_, payload) = unframe(&out).unwrap();
        assert_eq!(payload.len(), 1000);
        let out = core.handle(&req(Body::ReadColumns(v1::ReadColumns { file: Some(v1::FileRef { source: Some(v1::file_ref::Source::Token("x".into())), member: String::new() }), ..Default::default() })));
        assert!(matches!(unframe(&out).unwrap().0.body, Some(Body::Error(_))));
    }
}
