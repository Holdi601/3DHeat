//! Parquet, read as the web app reads it (`src/data/parquet.ts`, `rowFilter.ts`)
//! but one row group per core.
//!
//! The values are those hyparquet would decode, coerced the way the web app
//! coerces them: a number request gets `toNumber(value)` (a timestamp its epoch
//! milliseconds, a 64-bit integer its nearest double, text `Number(text)` when
//! finite), a text request gets `displayValue(value)` (`String(number)`, a
//! timestamp's ISO text, a null as `""`), interned in order of first appearance.
//! Types the web app reads in ways not reproduced here (decimals, JSON, UUID,
//! nested columns) are refused as unsupported, and the viewer reads that file
//! itself.
//!
//! The row filter runs as in `selectRows`: row groups the statistics rule out are
//! skipped, the filter's columns are read and tested, and the requested columns
//! are read for the kept rows only. Page indexes are not used, so on a sparse
//! filter `rows_skipped` can come out lower than the web app's count; the rows
//! kept are the same.

use std::collections::HashMap;
use std::sync::Arc;

use anyhow::{anyhow, bail, Context, Result};
use arrow_array::{cast::AsArray, types::*, Array, ArrayRef, RecordBatch};
use arrow_schema::{DataType, Field, Schema, TimeUnit};
use bytes::Bytes;
use parquet::arrow::arrow_reader::{
    ArrowReaderMetadata, ArrowReaderOptions, ParquetRecordBatchReaderBuilder, RowSelection, RowSelector,
};
use parquet::arrow::ProjectionMask;
use parquet::basic::{ConvertedType, LogicalType, Type as PhysicalType};
use parquet::file::statistics::Statistics;
use rayon::prelude::*;

use crate::filter::{Clause, FilterStats, Test};
use crate::jsnum::{js_iso, js_number, js_string};
use crate::table::Dict;

/// What a column is wanted as.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Kind {
    F32,
    F64,
    Dict,
}

#[derive(Debug, Clone)]
pub struct Spec {
    pub name: String,
    pub kind: Kind,
}

#[derive(Debug, Clone)]
pub enum Out {
    F32(Vec<f32>),
    F64(Vec<f64>),
    Dict(Dict),
}

impl Out {
    fn new(kind: Kind, cap: usize) -> Self {
        match kind {
            Kind::F32 => Out::F32(Vec::with_capacity(cap)),
            Kind::F64 => Out::F64(Vec::with_capacity(cap)),
            Kind::Dict => Out::Dict(Dict::with_capacity(cap)),
        }
    }

    pub fn len(&self) -> usize {
        match self {
            Out::F32(v) => v.len(),
            Out::F64(v) => v.len(),
            Out::Dict(d) => d.len(),
        }
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    fn append(&mut self, other: Out) {
        match (self, other) {
            (Out::F32(a), Out::F32(b)) => a.extend_from_slice(&b),
            (Out::F64(a), Out::F64(b)) => a.extend_from_slice(&b),
            (Out::Dict(a), Out::Dict(b)) => a.append(&b),
            _ => unreachable!("one kind per column"),
        }
    }
}

/// One leaf column, as the viewer's schema list shows it.
#[derive(Debug, Clone)]
pub struct ColumnInfo {
    pub name: String,
    pub physical: String,
    pub logical: String,
    pub text: bool,
    pub timestamp: bool,
}

pub struct ReadResult {
    pub rows_total: u64,
    pub columns: Vec<Out>,
    pub rows: usize,
    pub filtered: Option<FilterStats>,
    pub kept_rows: Option<Vec<u32>>,
}

/// A Parquet file held in memory (usually a memory map) with its footer read.
pub struct ParquetFile {
    bytes: Bytes,
    meta: ArrowReaderMetadata,
    /// Top-level leaf columns: name to index among the schema's root fields.
    roots: HashMap<String, usize>,
}

/// The error a caller turns into "read it yourself".
#[derive(Debug)]
pub struct Unsupported(pub String);

impl std::fmt::Display for Unsupported {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "not read natively: {}", self.0)
    }
}

impl std::error::Error for Unsupported {}

impl ParquetFile {
    pub fn open(bytes: Bytes) -> Result<Self> {
        let plain = match ArrowReaderMetadata::load(&bytes, ArrowReaderOptions::new()) {
            Ok(m) => m,
            Err(first) => {
                // hyparquet-writer (which the converters use) writes an empty list with
                // element type BYTE; arrow-rs insists on the declared type. Same bytes, patched.
                let footer = footer_of(&bytes).ok_or(first)?;
                let mut fixed = footer.to_vec();
                patch_empty_lists(&mut fixed).ok_or_else(|| anyhow!("unreadable Parquet footer"))?;
                let md = parquet::file::metadata::ParquetMetaDataReader::decode_metadata(&fixed)
                    .context("reading the Parquet footer")?;
                ArrowReaderMetadata::try_new(Arc::new(md), ArrowReaderOptions::new())?
            }
        };
        // Text columns read as dictionaries, so a column of a few names over millions
        // of rows is decoded once per name, not once per row.
        let schema = dictionary_schema(plain.schema());
        let meta = ArrowReaderMetadata::try_new(plain.metadata().clone(), ArrowReaderOptions::new().with_schema(schema))
            .unwrap_or(plain);
        let mut roots = HashMap::new();
        let schema = meta.metadata().file_metadata().schema_descr();
        for (i, f) in schema.root_schema().get_fields().iter().enumerate() {
            if f.is_primitive() {
                roots.insert(f.name().to_owned(), i);
            }
        }
        Ok(Self { bytes, meta, roots })
    }

    pub fn rows(&self) -> u64 {
        self.meta.metadata().file_metadata().num_rows().max(0) as u64
    }

    pub fn row_groups(&self) -> usize {
        self.meta.metadata().num_row_groups()
    }

    /// The footer's `heat3d` entry: the file's own reading instructions.
    pub fn hints(&self) -> Option<String> {
        self.meta
            .metadata()
            .file_metadata()
            .key_value_metadata()?
            .iter()
            .find(|kv| kv.key == "heat3d")
            .and_then(|kv| kv.value.clone())
    }

    pub fn columns(&self) -> Vec<ColumnInfo> {
        let schema = self.meta.metadata().file_metadata().schema_descr();
        let mut out = Vec::new();
        for f in schema.root_schema().get_fields() {
            if !f.is_primitive() {
                continue;
            }
            let info = f.get_basic_info();
            let physical = f.get_physical_type();
            let logical = match info.logical_type_ref() {
                Some(l) => logical_name(l),
                None if info.converted_type() != ConvertedType::NONE => info.converted_type().to_string(),
                None => String::new(),
            };
            let timestamp = logical.contains("TIMESTAMP") || logical.contains("DATE");
            out.push(ColumnInfo {
                name: f.name().to_owned(),
                physical: physical.to_string(),
                text: matches!(physical, PhysicalType::BYTE_ARRAY | PhysicalType::FIXED_LEN_BYTE_ARRAY),
                logical,
                timestamp,
            });
        }
        out
    }

    /// The smallest value of a numeric column, from the footer's statistics alone.
    pub fn min_of(&self, name: &str) -> Option<f64> {
        let &root = self.roots.get(name)?;
        let schema = self.meta.metadata().file_metadata().schema_descr();
        let leaf = (0..schema.num_columns()).find(|&i| schema.get_column_root_idx(i) == root)?;
        let mut lo = f64::INFINITY;
        for rg in self.meta.metadata().row_groups() {
            let (a, _) = numeric_span(rg.column(leaf).statistics()?)?;
            lo = lo.min(a);
        }
        lo.is_finite().then_some(lo)
    }

    pub fn has_column(&self, name: &str) -> bool {
        self.roots.contains_key(name)
    }

    /// Reads `specs` for the rows the filter keeps, in file order.
    pub fn read(&self, specs: &[Spec], clauses: &[Clause], kept_rows: bool) -> Result<ReadResult> {
        for s in specs {
            if !self.roots.contains_key(&s.name) {
                bail!("the file has no column {}", s.name);
            }
        }
        let md = self.meta.metadata();
        let groups = md.num_row_groups();
        let total = self.rows();
        let starts: Vec<u64> = md
            .row_groups()
            .iter()
            .scan(0u64, |at, g| {
                let s = *at;
                *at += g.num_rows().max(0) as u64;
                Some(s)
            })
            .collect();

        let active = crate::filter::active(clauses);
        let mut tests: Vec<(usize, Test)> = Vec::new();
        for c in &active {
            let t = c.compile();
            match self.roots.get(c.column()) {
                Some(&i) => tests.push((i, t)),
                // A column the file lacks is empty in every row: all pass, or none.
                None if t.null() => {}
                None => {
                    return Ok(ReadResult {
                        rows_total: total,
                        columns: specs.iter().map(|s| Out::new(s.kind, 0)).collect(),
                        rows: 0,
                        filtered: Some(FilterStats {
                            rows: total,
                            kept: 0,
                            rows_skipped: total,
                            groups: groups as u64,
                            groups_skipped: groups as u64,
                        }),
                        kept_rows: kept_rows.then(Vec::new),
                    })
                }
            }
        }
        let filtering = !active.is_empty();

        // Which groups the statistics cannot rule out, and per group which rows pass.
        let candidates: Vec<usize> = (0..groups)
            .filter(|&g| !filtering || !self.pruned(g, &active))
            .collect();
        let keeps: Vec<Option<Vec<bool>>> = if tests.is_empty() {
            candidates.iter().map(|_| None).collect()
        } else {
            candidates
                .par_iter()
                .map(|&g| self.test_group(g, &tests).map(Some))
                .collect::<Result<_>>()?
        };
        let kept_per: Vec<usize> = candidates
            .iter()
            .zip(&keeps)
            .map(|(&g, k)| match k {
                Some(k) => k.iter().filter(|&&b| b).count(),
                None => md.row_group(g).num_rows() as usize,
            })
            .collect();
        let rows: usize = kept_per.iter().sum();

        // The requested columns, for the groups that kept anything.
        let work: Vec<(usize, &Option<Vec<bool>>, usize)> = candidates
            .iter()
            .zip(&keeps)
            .zip(&kept_per)
            .filter(|(_, &n)| n > 0)
            .map(|((&g, k), &n)| (g, k, n))
            .collect();
        let parts: Vec<Vec<Out>> = work
            .par_iter()
            .map(|&(g, keep, n)| self.read_group(g, specs, keep.as_deref(), n))
            .collect::<Result<_>>()?;

        let mut columns: Vec<Out> = specs.iter().map(|s| Out::new(s.kind, rows)).collect();
        for part in parts {
            for (c, p) in columns.iter_mut().zip(part) {
                c.append(p);
            }
        }
        let kept = kept_rows.then(|| {
            let mut v = Vec::with_capacity(rows);
            for &(g, keep, _) in &work {
                let s = starts[g] as u32;
                match keep {
                    Some(k) => v.extend(k.iter().enumerate().filter(|(_, &b)| b).map(|(i, _)| s + i as u32)),
                    None => v.extend(s..s + md.row_group(g).num_rows() as u32),
                }
            }
            v
        });
        let scanned: u64 = candidates.iter().map(|&g| md.row_group(g).num_rows() as u64).sum();
        Ok(ReadResult {
            rows_total: total,
            columns,
            rows,
            filtered: filtering.then_some(FilterStats {
                rows: total,
                kept: rows as u64,
                rows_skipped: total - scanned,
                groups: groups as u64,
                groups_skipped: (groups - candidates.len()) as u64,
            }),
            kept_rows: kept,
        })
    }

    /// Rows of each group the filter keeps, read from its columns alone: the count `countMatches` gives.
    pub fn count(&self, clauses: &[Clause]) -> Result<FilterStats> {
        let r = self.read(&[], clauses, false)?;
        Ok(r.filtered.unwrap_or(FilterStats {
            rows: r.rows_total,
            kept: r.rows_total,
            rows_skipped: 0,
            groups: self.row_groups() as u64,
            groups_skipped: 0,
        }))
    }

    /// Rows of one row group.
    pub fn group_rows(&self, g: usize) -> u64 {
        self.meta.metadata().row_group(g).num_rows().max(0) as u64
    }

    /// A numeric column's span in one row group, from its statistics (None: no usable statistics).
    pub fn group_span(&self, g: usize, name: &str) -> Option<(f64, f64)> {
        let &root = self.roots.get(name)?;
        let schema = self.meta.metadata().file_metadata().schema_descr();
        let leaf = (0..schema.num_columns()).find(|&i| schema.get_column_root_idx(i) == root)?;
        let col = schema.column(leaf);
        if col.logical_type_ref().is_some() || col.converted_type() != ConvertedType::NONE {
            return None;
        }
        numeric_span(self.meta.metadata().row_group(g).column(leaf).statistics()?)
    }

    /// Nulls of a column in one row group, from its statistics.
    pub fn group_nulls(&self, g: usize, name: &str) -> Option<u64> {
        let &root = self.roots.get(name)?;
        let schema = self.meta.metadata().file_metadata().schema_descr();
        let leaf = (0..schema.num_columns()).find(|&i| schema.get_column_root_idx(i) == root)?;
        self.meta.metadata().row_group(g).column(leaf).statistics()?.null_count_opt()
    }

    /// Whether the statistics leave a row group that `clauses` might keep rows of.
    pub fn group_may_match(&self, g: usize, clauses: &[Clause]) -> bool {
        let active = crate::filter::active(clauses);
        active.is_empty() || !self.pruned(g, &active)
    }

    /// One row group's `specs`, only the rows `clauses` keep (`read`'s rules, one group).
    pub fn read_group_where(&self, g: usize, specs: &[Spec], clauses: &[Clause]) -> Result<Vec<Out>> {
        let none = || specs.iter().map(|s| Out::new(s.kind, 0)).collect::<Vec<_>>();
        for s in specs {
            if !self.roots.contains_key(&s.name) {
                bail!("the file has no column {}", s.name);
            }
        }
        let active = crate::filter::active(clauses);
        let mut tests: Vec<(usize, Test)> = Vec::new();
        for c in &active {
            let t = c.compile();
            match self.roots.get(c.column()) {
                Some(&i) => tests.push((i, t)),
                None if t.null() => {}
                None => return Ok(none()),
            }
        }
        if !active.is_empty() && self.pruned(g, &active) {
            return Ok(none());
        }
        let rows = self.group_rows(g) as usize;
        if tests.is_empty() {
            return self.read_group(g, specs, None, rows);
        }
        let keep = self.test_group(g, &tests)?;
        let n = keep.iter().filter(|&&b| b).count();
        if n == 0 {
            return Ok(none());
        }
        self.read_group(g, specs, Some(&keep), n)
    }

    fn builder(&self, g: usize, roots: &[usize]) -> ParquetRecordBatchReaderBuilder<Bytes> {
        let schema = self.meta.metadata().file_metadata().schema_descr();
        let mask = ProjectionMask::roots(schema, roots.iter().copied());
        ParquetRecordBatchReaderBuilder::new_with_metadata(self.bytes.clone(), self.meta.clone())
            .with_row_groups(vec![g])
            .with_projection(mask)
            .with_batch_size(1 << 16)
    }

    /// Whether a group's statistics rule it out (`pruningFilter`).
    fn pruned(&self, g: usize, clauses: &[Clause]) -> bool {
        let rg = self.meta.metadata().row_group(g);
        let schema = self.meta.metadata().file_metadata().schema_descr();
        for c in clauses {
            let Some(&root) = self.roots.get(c.column()) else { continue };
            // A root primitive's leaf index is the count of leaves before it; for flat files, equal.
            let Some(leaf) = (0..schema.num_columns()).find(|&i| schema.get_column_root_idx(i) == root) else {
                continue;
            };
            let col = schema.column(leaf);
            let plain = col.logical_type_ref().is_none() && col.converted_type() == ConvertedType::NONE;
            let Some(stats) = rg.column(leaf).statistics() else { continue };
            match c {
                Clause::Range { min, max, .. } => {
                    if !plain {
                        continue;
                    }
                    let Some((lo, hi)) = numeric_span(stats) else { continue };
                    if max.is_some_and(|m| lo > m) || min.is_some_and(|m| hi < m) {
                        return true;
                    }
                }
                Clause::Set { values, .. } => {
                    if values.iter().any(|v| v.is_empty()) {
                        continue;
                    }
                    if let Statistics::ByteArray(s) = stats {
                        let (Some(lo), Some(hi)) = (s.min_opt(), s.max_opt()) else { continue };
                        if !stats.min_is_exact() || !stats.max_is_exact() {
                            continue;
                        }
                        if !values.iter().any(|v| v.as_bytes() >= lo.data() && v.as_bytes() <= hi.data()) {
                            return true;
                        }
                    } else if plain {
                        let Some((lo, hi)) = numeric_span(stats) else { continue };
                        let nums: Vec<f64> = values.iter().map(|v| js_number(v)).filter(|x| x.is_finite()).collect();
                        if nums.len() != values.len() {
                            continue;
                        }
                        if !nums.iter().any(|&x| x >= lo && x <= hi) {
                            return true;
                        }
                    }
                }
            }
        }
        false
    }

    fn test_group(&self, g: usize, tests: &[(usize, Test)]) -> Result<Vec<bool>> {
        let n = self.meta.metadata().row_group(g).num_rows() as usize;
        let mut keep = vec![true; n];
        let mut roots: Vec<usize> = tests.iter().map(|t| t.0).collect();
        roots.sort_unstable();
        roots.dedup();
        let reader = self.builder(g, &roots).build()?;
        let mut at = 0usize;
        for batch in reader {
            let batch = batch?;
            for (root, test) in tests {
                let arr = column_of(&batch, self.root_name(*root))?;
                test_array(&arr, test, &mut keep[at..at + batch.num_rows()])?;
            }
            at += batch.num_rows();
        }
        // Rows the decoder did not return cannot pass.
        for k in keep.iter_mut().skip(at) {
            *k = false;
        }
        Ok(keep)
    }

    fn root_name(&self, root: usize) -> &str {
        self.meta.metadata().file_metadata().schema_descr().root_schema().get_fields()[root].name()
    }

    fn read_group(&self, g: usize, specs: &[Spec], keep: Option<&[bool]>, n: usize) -> Result<Vec<Out>> {
        let mut outs: Vec<Out> = specs.iter().map(|s| Out::new(s.kind, n)).collect();
        if specs.is_empty() {
            return Ok(outs);
        }
        let mut roots: Vec<usize> = specs.iter().map(|s| self.roots[&s.name]).collect();
        roots.sort_unstable();
        roots.dedup();
        let mut b = self.builder(g, &roots);
        if let Some(k) = keep {
            b = b.with_row_selection(selection_of(k));
        }
        let mut maps: Vec<Vec<u32>> = specs.iter().map(|_| Vec::new()).collect();
        for batch in b.build()? {
            let batch = batch?;
            for ((s, o), map) in specs.iter().zip(outs.iter_mut()).zip(maps.iter_mut()) {
                let arr = column_of(&batch, &s.name)?;
                append_array(&arr, o, map)?;
            }
        }
        Ok(outs)
    }
}

/// The file's Arrow schema with its text columns as dictionaries.
fn dictionary_schema(schema: &Arc<Schema>) -> Arc<Schema> {
    let fields: Vec<Field> = schema
        .fields()
        .iter()
        .map(|f| match f.data_type() {
            DataType::Utf8 | DataType::LargeUtf8 | DataType::Utf8View => f
                .as_ref()
                .clone()
                .with_data_type(DataType::Dictionary(Box::new(DataType::Int32), Box::new(DataType::Utf8))),
            _ => f.as_ref().clone(),
        })
        .collect();
    Arc::new(Schema::new_with_metadata(fields, schema.metadata().clone()))
}

/// The footer's thrift bytes.
fn footer_of(b: &[u8]) -> Option<&[u8]> {
    let n = b.len();
    if n < 12 || &b[n - 4..] != b"PAR1" {
        return None;
    }
    let len = u32::from_le_bytes(b[n - 8..n - 4].try_into().ok()?) as usize;
    b.get(n.checked_sub(8 + len)?..n - 8)
}

/// Rewrites every empty list of the thrift compact stream to element type STRUCT,
/// in place (the header keeps its size): an empty list's element type carries no
/// data, and the only empty lists a footer holds are lists of structs.
fn patch_empty_lists(b: &mut [u8]) -> Option<()> {
    fn varint(b: &[u8], p: &mut usize) -> Option<u64> {
        let mut v = 0u64;
        let mut shift = 0;
        loop {
            let c = *b.get(*p)?;
            *p += 1;
            v |= ((c & 0x7f) as u64) << shift;
            if c & 0x80 == 0 {
                return Some(v);
            }
            shift += 7;
            if shift > 63 {
                return None;
            }
        }
    }
    fn value(b: &mut [u8], p: &mut usize, t: u8, depth: u32) -> Option<()> {
        if depth > 64 {
            return None;
        }
        match t {
            1 | 2 => {}
            3 => *p += 1,
            4..=6 => {
                varint(b, p)?;
            }
            7 => *p += 8,
            8 => {
                let n = varint(b, p)? as usize;
                *p += n;
            }
            9 | 10 => {
                let h = *b.get(*p)?;
                let at = *p;
                *p += 1;
                let et = h & 0x0f;
                let n = if h >> 4 == 15 { varint(b, p)? as usize } else { (h >> 4) as usize };
                if n == 0 {
                    b[at] = (h & 0xf0) | 12;
                    return Some(());
                }
                for _ in 0..n {
                    if et == 1 || et == 2 {
                        *p += 1;
                    } else {
                        value(b, p, et, depth + 1)?;
                    }
                }
            }
            11 => {
                let n = varint(b, p)? as usize;
                if n > 0 {
                    let kv = *b.get(*p)?;
                    *p += 1;
                    for _ in 0..n {
                        value(b, p, kv >> 4, depth + 1)?;
                        value(b, p, kv & 0x0f, depth + 1)?;
                    }
                }
            }
            12 => loop {
                let h = *b.get(*p)?;
                *p += 1;
                if h == 0 {
                    break;
                }
                let ft = h & 0x0f;
                if h >> 4 == 0 {
                    varint(b, p)?;
                }
                value(b, p, ft, depth + 1)?;
            },
            _ => return None,
        }
        (*p <= b.len()).then_some(())
    }
    let mut p = 0;
    value(b, &mut p, 12, 0)
}

fn logical_name(l: &LogicalType) -> String {
    match l {
        LogicalType::String => "STRING".into(),
        LogicalType::Timestamp { .. } => "TIMESTAMP".into(),
        LogicalType::Date => "DATE".into(),
        LogicalType::Decimal { .. } => "DECIMAL".into(),
        LogicalType::Integer { .. } => "INTEGER".into(),
        LogicalType::Json => "JSON".into(),
        LogicalType::Uuid => "UUID".into(),
        LogicalType::Enum => "ENUM".into(),
        LogicalType::Time { .. } => "TIME".into(),
        LogicalType::Float16 => "FLOAT16".into(),
        other => format!("{other:?}").to_uppercase(),
    }
}

fn numeric_span(stats: &Statistics) -> Option<(f64, f64)> {
    if !stats.min_is_exact() || !stats.max_is_exact() {
        // Inexact bounds still bound; only truncated text is a concern, and numbers are never truncated.
    }
    Some(match stats {
        Statistics::Int32(s) => (*s.min_opt()? as f64, *s.max_opt()? as f64),
        Statistics::Int64(s) => (*s.min_opt()? as f64, *s.max_opt()? as f64),
        Statistics::Float(s) => (*s.min_opt()? as f64, *s.max_opt()? as f64),
        Statistics::Double(s) => (*s.min_opt()?, *s.max_opt()?),
        _ => return None,
    })
    .filter(|(lo, hi)| lo.is_finite() && hi.is_finite())
}

fn selection_of(keep: &[bool]) -> RowSelection {
    let mut sel: Vec<RowSelector> = Vec::new();
    let mut i = 0;
    while i < keep.len() {
        let v = keep[i];
        let mut j = i;
        while j < keep.len() && keep[j] == v {
            j += 1;
        }
        sel.push(if v { RowSelector::select(j - i) } else { RowSelector::skip(j - i) });
        i = j;
    }
    sel.into()
}

fn column_of(batch: &RecordBatch, name: &str) -> Result<ArrayRef> {
    batch.column_by_name(name).cloned().ok_or_else(|| anyhow!("column {name} missing from a batch"))
}

/// A value of a supported column, as the web app holds it once decoded.
enum V<'a> {
    Null,
    Num(f64),
    I64(i64),
    U64(u64),
    Bool(bool),
    /// Epoch milliseconds of a `Date`.
    Date(f64),
    Text(&'a str),
}

fn ms_of(unit: &TimeUnit, v: i64) -> f64 {
    // `new Date(Number(v / 1000n))`: BigInt division truncates toward zero.
    match unit {
        TimeUnit::Second => (v as f64) * 1000.0,
        TimeUnit::Millisecond => v as f64,
        TimeUnit::Microsecond => (v / 1000) as f64,
        TimeUnit::Nanosecond => (v / 1_000_000) as f64,
    }
}

/// Calls `f` with each value of `arr` in order.
fn each_value(arr: &dyn Array, mut f: impl FnMut(usize, V<'_>)) -> Result<()> {
    macro_rules! prim {
        ($t:ty, $conv:expr) => {{
            let a = arr.as_primitive::<$t>();
            for i in 0..a.len() {
                if a.is_null(i) {
                    f(i, V::Null)
                } else {
                    f(i, $conv(a.value(i)))
                }
            }
        }};
    }
    match arr.data_type() {
        DataType::Float32 => prim!(Float32Type, |v: f32| V::Num(v as f64)),
        DataType::Float64 => prim!(Float64Type, V::Num),
        DataType::Float16 => prim!(Float16Type, |v: Half| V::Num(v.to_f64())),
        DataType::Int8 => prim!(Int8Type, |v: i8| V::Num(v as f64)),
        DataType::Int16 => prim!(Int16Type, |v: i16| V::Num(v as f64)),
        DataType::Int32 => prim!(Int32Type, |v: i32| V::Num(v as f64)),
        DataType::Int64 => prim!(Int64Type, V::I64),
        DataType::UInt8 => prim!(UInt8Type, |v: u8| V::Num(v as f64)),
        DataType::UInt16 => prim!(UInt16Type, |v: u16| V::Num(v as f64)),
        DataType::UInt32 => prim!(UInt32Type, |v: u32| V::Num(v as f64)),
        DataType::UInt64 => prim!(UInt64Type, V::U64),
        DataType::Date32 => prim!(Date32Type, |d: i32| V::Date(d as f64 * 86_400_000.0)),
        DataType::Date64 => prim!(Date64Type, |d: i64| V::Date(d as f64)),
        DataType::Timestamp(unit, _) => {
            let unit = unit.clone();
            match unit {
                TimeUnit::Second => prim!(TimestampSecondType, |v| V::Date(ms_of(&unit, v))),
                TimeUnit::Millisecond => prim!(TimestampMillisecondType, |v| V::Date(ms_of(&unit, v))),
                TimeUnit::Microsecond => prim!(TimestampMicrosecondType, |v| V::Date(ms_of(&unit, v))),
                TimeUnit::Nanosecond => prim!(TimestampNanosecondType, |v| V::Date(ms_of(&unit, v))),
            }
        }
        DataType::Boolean => {
            let a = arr.as_boolean();
            for i in 0..a.len() {
                f(i, if a.is_null(i) { V::Null } else { V::Bool(a.value(i)) });
            }
        }
        DataType::Utf8 => {
            let a = arr.as_string::<i32>();
            for i in 0..a.len() {
                f(i, if a.is_null(i) { V::Null } else { V::Text(a.value(i)) });
            }
        }
        DataType::LargeUtf8 => {
            let a = arr.as_string::<i64>();
            for i in 0..a.len() {
                f(i, if a.is_null(i) { V::Null } else { V::Text(a.value(i)) });
            }
        }
        DataType::Utf8View => {
            let a = arr.as_string_view();
            for i in 0..a.len() {
                f(i, if a.is_null(i) { V::Null } else { V::Text(a.value(i)) });
            }
        }
        DataType::Binary => {
            // hyparquet decodes BYTE_ARRAY as UTF-8 text by default.
            let a = arr.as_binary::<i32>();
            for i in 0..a.len() {
                if a.is_null(i) {
                    f(i, V::Null)
                } else {
                    let s = String::from_utf8_lossy(a.value(i));
                    f(i, V::Text(&s))
                }
            }
        }
        DataType::Dictionary(_, _) => {
            let a = arr.as_dictionary::<Int32Type>();
            let values = a.values();
            let texts: Vec<Option<String>> = match values.data_type() {
                DataType::Utf8 => {
                    let s = values.as_string::<i32>();
                    (0..s.len()).map(|i| (!s.is_null(i)).then(|| s.value(i).to_owned())).collect()
                }
                other => return Err(Unsupported(format!("dictionary of {other}")).into()),
            };
            let keys = a.keys();
            for i in 0..keys.len() {
                if keys.is_null(i) {
                    f(i, V::Null)
                } else {
                    match &texts[keys.value(i) as usize] {
                        Some(t) => f(i, V::Text(t)),
                        None => f(i, V::Null),
                    }
                }
            }
        }
        other => return Err(Unsupported(format!("Parquet column of type {other}")).into()),
    }
    Ok(())
}

type Half = half::f16;

fn test_array(arr: &ArrayRef, test: &Test, keep: &mut [bool]) -> Result<()> {
    each_value(arr.as_ref(), |i, v| {
        if !keep[i] {
            return;
        }
        let pass = match v {
            V::Null => test.null(),
            V::Num(x) => test.number(x),
            V::I64(x) => test.int64(x),
            V::U64(x) => test.uint64(x),
            V::Bool(b) => {
                if test.is_set() {
                    test.text(if b { "true" } else { "false" })
                } else {
                    test.number(if b { 1.0 } else { 0.0 })
                }
            }
            V::Date(ms) => {
                if test.is_set() {
                    test.text(&js_iso(ms))
                } else {
                    test.number(ms)
                }
            }
            V::Text(s) => test.text(s),
        };
        keep[i] = pass;
    })
}

fn to_number(v: &V<'_>) -> f64 {
    match v {
        V::Null => f64::NAN,
        V::Num(x) | V::Date(x) => *x,
        V::I64(x) => *x as f64,
        V::U64(x) => *x as f64,
        V::Bool(b) => *b as u8 as f64,
        V::Text(s) => {
            let n = js_number(s);
            if n.is_finite() {
                n
            } else {
                f64::NAN
            }
        }
    }
}

fn display(v: &V<'_>) -> String {
    match v {
        V::Null => String::new(),
        V::Num(x) => js_string(*x),
        V::I64(x) => x.to_string(),
        V::U64(x) => x.to_string(),
        V::Bool(b) => b.to_string(),
        V::Date(ms) => js_iso(*ms),
        V::Text(s) => (*s).to_owned(),
    }
}

/// Appends `arr` to `out`. `map` remembers, per dictionary value of the batch,
/// its id in `out` (`u32::MAX` until seen), so text is interned once per name.
fn append_array(arr: &ArrayRef, out: &mut Out, map: &mut Vec<u32>) -> Result<()> {
    match out {
        Out::F32(o) => each_value(arr.as_ref(), |_, v| o.push(to_number(&v) as f32)),
        Out::F64(o) => each_value(arr.as_ref(), |_, v| o.push(to_number(&v))),
        Out::Dict(d) => {
            if let DataType::Dictionary(_, vt) = arr.data_type() {
                if **vt == DataType::Utf8 {
                    let a = arr.as_dictionary::<Int32Type>();
                    let values = a.values().as_string::<i32>();
                    map.clear();
                    map.resize(values.len(), u32::MAX);
                    let mut empty = u32::MAX;
                    let keys = a.keys();
                    for i in 0..keys.len() {
                        let id = if keys.is_null(i) || values.is_null(keys.value(i) as usize) {
                            if empty == u32::MAX {
                                empty = d.intern("");
                            }
                            empty
                        } else {
                            let k = keys.value(i) as usize;
                            if map[k] == u32::MAX {
                                map[k] = d.intern(values.value(k));
                            }
                            map[k]
                        };
                        d.ids.push(id);
                    }
                    return Ok(());
                }
            }
            each_value(arr.as_ref(), |_, v| match v {
                V::Text(s) => d.push(s),
                other => d.push(&display(&other)),
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use arrow_array::{Float32Array, Float64Array, Int64Array, StringArray};
    use parquet::arrow::ArrowWriter;
    use parquet::file::properties::WriterProperties;

    fn sample() -> Bytes {
        let schema = Arc::new(Schema::new(vec![
            Field::new("x", DataType::Float32, true),
            Field::new("t", DataType::Float64, false),
            Field::new("who", DataType::Utf8, true),
            Field::new("n", DataType::Int64, false),
        ]));
        let mut buf = Vec::new();
        let props = WriterProperties::builder().set_max_row_group_row_count(Some(4)).build();
        let mut w = ArrowWriter::try_new(&mut buf, schema.clone(), Some(props)).unwrap();
        let b = RecordBatch::try_new(
            schema,
            vec![
                Arc::new(Float32Array::from(vec![Some(0.1), None, Some(2.0), Some(3.0), Some(4.0), Some(5.0), Some(6.0), Some(7.0), Some(8.0), Some(9.0)])),
                Arc::new(Float64Array::from((0..10).map(|i| i as f64 * 1.5).collect::<Vec<_>>())),
                Arc::new(StringArray::from(vec![Some("b"), Some("a"), None, Some("b"), Some("c"), Some("a"), Some("c"), Some("d"), Some("d"), Some("b")])),
                Arc::new(Int64Array::from((0..10).map(|i| i * 10).collect::<Vec<_>>())),
            ],
        )
        .unwrap();
        w.write(&b).unwrap();
        w.close().unwrap();
        Bytes::from(buf)
    }

    #[test]
    fn reads_like_the_web_app() {
        let f = ParquetFile::open(sample()).unwrap();
        assert_eq!(f.rows(), 10);
        assert_eq!(f.row_groups(), 3);
        let specs = vec![
            Spec { name: "x".into(), kind: Kind::F32 },
            Spec { name: "x".into(), kind: Kind::Dict },
            Spec { name: "who".into(), kind: Kind::Dict },
            Spec { name: "n".into(), kind: Kind::Dict },
            Spec { name: "t".into(), kind: Kind::F64 },
        ];
        let r = f.read(&specs, &[], true).unwrap();
        assert_eq!(r.rows, 10);
        let Out::F32(x) = &r.columns[0] else { panic!() };
        assert!(x[1].is_nan() && x[0] == 0.1);
        let Out::Dict(xs) = &r.columns[1] else { panic!() };
        assert_eq!(xs.labels[0], "0.10000000149011612");
        assert_eq!(xs.labels[1], "");
        let Out::Dict(who) = &r.columns[2] else { panic!() };
        assert_eq!(who.labels, ["b", "a", "", "c", "d"]);
        assert_eq!(who.ids, [0, 1, 2, 0, 3, 1, 3, 4, 4, 0]);
        assert_eq!(r.kept_rows.unwrap(), (0..10).collect::<Vec<u32>>());
    }

    #[test]
    fn filters_and_prunes() {
        let f = ParquetFile::open(sample()).unwrap();
        let specs = vec![Spec { name: "n".into(), kind: Kind::F64 }];
        let range = Clause::Range { column: "n".into(), min: Some(45.0), max: Some(75.0) };
        let r = f.read(&specs, &[range], true).unwrap();
        let Out::F64(n) = &r.columns[0] else { panic!() };
        assert_eq!(n, &[50.0, 60.0, 70.0]);
        let st = r.filtered.unwrap();
        assert_eq!((st.kept, st.groups, st.groups_skipped, st.rows_skipped), (3, 3, 2, 6));
        assert_eq!(r.kept_rows.unwrap(), [5, 6, 7]);

        let set = Clause::Set { column: "who".into(), values: vec!["d".into(), "".into()] };
        let r = f.read(&specs, &[set], false).unwrap();
        let Out::F64(n) = &r.columns[0] else { panic!() };
        assert_eq!(n, &[20.0, 70.0, 80.0]);

        let missing = Clause::Set { column: "nope".into(), values: vec!["x".into()] };
        assert_eq!(f.read(&specs, &[missing], false).unwrap().rows, 0);
    }
}
