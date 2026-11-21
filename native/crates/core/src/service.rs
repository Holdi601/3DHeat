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
use crate::dataset::{SharedMemory, SharedSink};
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
    /// Datasets built here (`BuildDataset`), by handle.
    built: Mutex<HashMap<u64, Arc<crate::dataset::Dataset>>>,
    /// Where shared memory comes from: the app's window, when there is one.
    sink: RwLock<Option<Arc<dyn SharedSink>>>,
    /// What each running build is doing, by the viewer's token.
    progress: Arc<Mutex<HashMap<String, (String, f64)>>>,
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
            built: Mutex::new(HashMap::new()),
            sink: RwLock::new(None),
            progress: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Lets the core hand columns and chunks to the app's window in shared memory.
    pub fn set_shared_sink(&self, sink: Arc<dyn SharedSink>) {
        *self.sink.write().unwrap() = Some(sink);
    }

    fn shared_sink(&self) -> Option<Arc<dyn SharedSink>> {
        self.sink.read().unwrap().clone()
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
                self.built.lock().unwrap().remove(&c.handle);
                self.chunk_sets.lock().unwrap().remove(&c.handle);
                Body::Closed(v1::Closed {})
            }
            Body::ReadColumns(r) => self.read_columns(r, out, access)?,
            Body::ReadTable(r) => self.read_table(r, out, access)?,
            Body::ScanCsv(r) => self.scan_csv(r, out, access)?,
            Body::BuildChunks(r) => self.build_chunks(r, access)?,
            Body::ReadChunk(r) if self.built.lock().unwrap().contains_key(&r.handle) => self.read_built_chunk(r, out)?,
            Body::BuildDataset(r) => self.build_dataset(r, access)?,
            Body::ReadDatasetColumns(r) => self.read_dataset_columns(r, out)?,
            Body::BuildProgress(p) => {
                let (phase, fraction) = self.progress.lock().unwrap().get(&p.token).cloned().unwrap_or_default();
                Body::BuildProgressReply(v1::BuildProgressReply { phase, fraction })
            }
            Body::ReadChunk(r) => {
                let set = self.chunk_sets.lock().unwrap().get(&r.handle).cloned().ok_or_else(|| anyhow!("no such chunks"))?;
                let c = set.chunks.get(r.index as usize).ok_or_else(|| anyhow!("no chunk {}", r.index))?;
                let data = match v1::ChunkPart::try_from(r.part).unwrap_or_default() {
                    v1::ChunkPart::Positions => out.u32s(&c.positions),
                    v1::ChunkPart::Times => out.u32s(&c.times),
                    _ => bail!("no such chunk part"),
                };
                Body::ChunkData(v1::ChunkData { index: r.index, part: r.part, data: Some(data), ..Default::default() })
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

impl Core {
    fn build_dataset(&self, r: v1::BuildDataset, access: Access) -> Result<Body> {
        let t0 = Instant::now();
        let mut files = Vec::with_capacity(r.files.len());
        for f in &r.files {
            let s = self.open(&Some(f.clone()), access)?;
            if s.format != Format::Parquet {
                return Err(Unsupported("datasets from anything but Parquet".into()).into());
            }
            files.push(ParquetFile::open(s.bytes)?);
        }
        let m = r.mapping.clone().unwrap_or_default();
        let name = |s: &str| (!s.is_empty()).then(|| s.to_owned());
        let look = match m.look_mode.as_str() {
            "yawPitch" => crate::build::Look::YawPitch { yaw: name(&m.yaw), pitch: name(&m.pitch), degrees: m.degrees },
            "vector" => crate::build::Look::Vector { x: name(&m.dir_x), y: name(&m.dir_y), z: name(&m.dir_z) },
            _ => crate::build::Look::None,
        };
        let spec = crate::build::BuildSpec {
            mapping: crate::build::Mapping {
                x: name(&m.x),
                y: name(&m.y),
                z: name(&m.z),
                time: name(&m.time),
                time_unit: if m.time_unit.is_empty() { "seconds".into() } else { m.time_unit.clone() },
                look,
                person: name(&m.person),
                team: name(&m.team),
                session: name(&m.session),
                extra: m.extra.iter().map(|e| (e.name.clone(), e.numeric)).collect(),
                on_demand: m.on_demand.iter().map(|e| (e.name.clone(), e.numeric)).collect(),
                up_z: m.up_z,
                flip: [m.flip_x, m.flip_y, m.flip_z],
                scale: m.scale,
            },
            filter: clauses_of(&r.filter),
            stride: r.stride.max(1) as usize,
            names: r.names.clone(),
            max_sessions: 0,
        };
        let token = r.progress_token.clone();
        let progress = self.progress.clone();
        let report = move |phase: &str, f: f64| {
            if !token.is_empty() {
                progress.lock().unwrap().insert(token.clone(), (phase.to_owned(), f));
            }
        };
        let built = crate::build::build(&files, &spec, &report);
        let file_of = |f: &crate::build::FileResult| {
            let fail = f.failure.clone().unwrap_or(crate::build::Failure { key: String::new(), params: vec![], text: String::new() });
            v1::BuiltFile {
                rows: f.rows as u64,
                rejected: f.rejected as u64,
                filtered: f.filtered.map(stats_of),
                failure_key: fail.key,
                failure_params: fail.params.into_iter().collect(),
                failure_text: fail.text,
                hints_json: f.hints.clone().unwrap_or_default(),
                time_absolute: f.time_absolute,
            }
        };
        let b = match built {
            Ok(b) => b,
            Err(e) => {
                self.progress.lock().unwrap().remove(&r.progress_token);
                return match e.downcast::<crate::build::NoRows>() {
                    Ok(none) => Ok(Body::DatasetBuilt(v1::DatasetBuilt { files: none.0.iter().map(file_of).collect(), ..Default::default() })),
                    Err(e) => Err(e),
                };
            }
        };
        report("chunks", 0.0);
        let mut reply = v1::DatasetBuilt {
            rows: b.rows as u64,
            files: b.files.iter().map(file_of).collect(),
            sources: b.sources as u32,
            rejected: b.rejected as u64,
            has_time: b.time.is_some(),
            epoch_ms: b.epoch_ms,
            time_origin: b.time_origin,
            time_range: b.time_range.to_vec(),
            person_labels: b.person_labels.clone(),
            team_labels: b.team_labels.clone(),
            teams_dropped: b.teams_dropped as u64,
            session_labels: b.session_labels.clone(),
            sessions_dropped: b.sessions_dropped as u64,
            max_lifetime_gap: b.max_lifetime_gap,
            shared_count: b.shared_count as u64,
            attrs: b
                .attrs
                .iter()
                .map(|a| v1::BuiltAttr { name: a.name.clone(), numeric: a.categories.is_none(), min: a.min, max: a.max, categories: a.categories.clone().unwrap_or_default() })
                .collect(),
            dropped_columns: b.dropped_columns.iter().map(|(n, c)| v1::DroppedColumn { name: n.clone(), count: *c as u64 }).collect(),
            bounds: [b.bounds.min.to_vec(), b.bounds.max.to_vec()].concat(),
            aligned: b.aligned as u64,
            series_json: b.series.as_ref().map_or(String::new(), |s| {
                serde_json::json!({
                    "campaign": s.campaign,
                    "breakSeconds": crate::build::SERIES_BREAK_S,
                    "sessions": s.sessions.iter().map(|x| serde_json::json!({"session": x.session, "start": x.start, "end": x.end, "realStart": x.real_start})).collect::<Vec<_>>(),
                })
                .to_string()
            }),
            on_demand: spec.mapping.on_demand.iter().map(|(c, _)| c.clone()).collect(),
            shared: self.shared_sink().is_some(),
            ..Default::default()
        };
        let timing = b.timing.clone();
        let t_pack = Instant::now();
        let (ds, names, page_gap) = crate::dataset::Dataset::new(b, files, spec, r.chunk_rows as usize, r.page_rows as usize);
        reply.chunks = ds
            .chunks
            .iter()
            .enumerate()
            .map(|(i, c)| v1::DatasetChunk {
                index: i as u32,
                start: c.start as u64,
                rows: c.rows as u32,
                aabb_min: c.aabb_min.to_vec(),
                aabb_size: c.aabb_size.to_vec(),
                time_min: c.time_min,
                time_scale: c.time_scale,
                life_scale: c.life_scale,
            })
            .collect();
        reply.page_rows = ds.page_rows() as u64;
        reply.page_step = ds.page_step as u32;
        reply.page_max_lifetime_gap = page_gap;
        reply.columns = names;
        reply.timing = Some(v1::Timing {
            read_ms: timing.read_ms,
            filter_ms: timing.merge_ms,
            sort_ms: timing.sort_ms + timing.lifetime_ms,
            pack_ms: t_pack.elapsed().as_secs_f64() * 1e3,
            total_ms: t0.elapsed().as_secs_f64() * 1e3,
            threads: rayon::current_num_threads() as u32,
        });
        reply.peak_memory_bytes = crate::memory::peak_bytes();
        let handle = self.next.fetch_add(1, Ordering::Relaxed);
        reply.handle = handle;
        self.built.lock().unwrap().insert(handle, Arc::new(ds));
        self.progress.lock().unwrap().remove(&r.progress_token);
        Ok(Body::DatasetBuilt(reply))
    }

    fn dataset(&self, handle: u64) -> Result<Arc<crate::dataset::Dataset>> {
        self.built.lock().unwrap().get(&handle).cloned().ok_or_else(|| anyhow!("no dataset {handle}"))
    }

    /// Memory for `bytes` the window will see: shared when asked and possible, else none (the payload).
    fn shared_memory(&self, want: bool, bytes: usize) -> Result<Option<(Arc<dyn SharedSink>, Arc<dyn SharedMemory>)>> {
        match (want, self.shared_sink()) {
            (true, Some(sink)) => {
                let mem = sink.create(bytes.max(8))?;
                Ok(Some((sink, mem)))
            }
            _ => Ok(None),
        }
    }

    fn read_dataset_columns(&self, r: v1::ReadDatasetColumns, out: &mut Payload) -> Result<Body> {
        let ds = self.dataset(r.handle)?;
        let mut cols = Vec::with_capacity(r.names.len());
        for name in &r.names {
            let mut col = v1::DatasetColumn { name: name.clone(), ..Default::default() };
            if r.by_chunk {
                let rows = ds.chunks.get(r.chunk as usize).ok_or_else(|| anyhow!("no chunk {}", r.chunk))?.rows;
                let shared = self.shared_memory(r.shared, rows * 4)?;
                let mut tmp: Vec<f32> = Vec::new();
                let ok = match &shared {
                    Some((_, mem)) => {
                        // SAFETY: fresh shared memory of at least `rows * 4` bytes, page aligned.
                        let dst = unsafe { std::slice::from_raw_parts_mut(mem.ptr() as *mut f32, rows) };
                        ds.chunk_column(name, r.chunk as usize, dst)?
                    }
                    None => {
                        tmp = vec![0f32; rows];
                        ds.chunk_column(name, r.chunk as usize, &mut tmp)?
                    }
                };
                if !ok {
                    continue;
                }
                col.element = "f32".into();
                col.count = rows as u64;
                match shared {
                    Some((sink, mem)) => {
                        col.shared_id = self.next.fetch_add(1, Ordering::Relaxed);
                        sink.post(&mem, col.shared_id)?;
                    }
                    None => col.values = Some(out.f32s(&tmp)),
                }
            } else {
                let sink = if r.shared { self.shared_sink() } else { None };
                let mut mem: Option<Arc<dyn SharedMemory>> = None;
                let mut tmp: Vec<u8> = Vec::new();
                let got = ds.page_column(name, &mut |bytes| match &sink {
                    Some(s) => {
                        let m = s.create(bytes.max(8))?;
                        let p = m.ptr();
                        mem = Some(m);
                        Ok(p)
                    }
                    None => {
                        tmp = vec![0u8; bytes];
                        Ok(tmp.as_mut_ptr())
                    }
                })?;
                let Some((elem, rows)) = got else { continue };
                col.element = elem.name().into();
                col.count = rows as u64;
                match (sink, mem) {
                    (Some(sink), Some(mem)) => {
                        col.shared_id = self.next.fetch_add(1, Ordering::Relaxed);
                        sink.post(&mem, col.shared_id)?;
                        // Taken whole: from now on the core reads the window's copy.
                        if ds.page_step == 1 {
                            ds.adopt_shared(name, mem);
                        }
                    }
                    _ => col.values = Some(out.push(&tmp)),
                }
                if let Some((numeric, cats, min, max)) = ds.on_demand_info(name) {
                    col.numeric = numeric;
                    col.categories = cats;
                    col.min = min;
                    col.max = max;
                }
            }
            cols.push(col);
        }
        Ok(Body::DatasetColumns(v1::DatasetColumns { columns: cols }))
    }

    fn read_built_chunk(&self, r: v1::ReadChunk, out: &mut Payload) -> Result<Body> {
        let ds = self.dataset(r.handle)?;
        let times = match v1::ChunkPart::try_from(r.part).unwrap_or_default() {
            v1::ChunkPart::Positions => false,
            v1::ChunkPart::Times => true,
            _ => bail!("no such chunk part"),
        };
        let bytes = ds.chunk_bytes(r.index as usize, times)?;
        let mut reply = v1::ChunkData { index: r.index, part: r.part, ..Default::default() };
        match self.shared_memory(r.shared, bytes)? {
            Some((sink, mem)) => {
                // SAFETY: fresh shared memory of `bytes`, page aligned.
                let words = unsafe { std::slice::from_raw_parts_mut(mem.ptr() as *mut u32, bytes / 4) };
                ds.pack(r.index as usize, times, words)?;
                reply.shared_id = self.next.fetch_add(1, Ordering::Relaxed);
                sink.post(&mem, reply.shared_id)?;
            }
            None => {
                let mut words = vec![0u32; bytes / 4];
                ds.pack(r.index as usize, times, &mut words)?;
                reply.data = Some(out.u32s(&words));
            }
        }
        Ok(Body::ChunkData(reply))
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
        Body::BuildDataset(_) => "build_dataset",
        Body::ReadDatasetColumns(_) => "read_dataset_columns",
        Body::BuildProgress(_) => "build_progress",
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
