//! Tacview ACMI recordings, read as `src/data/acmi.ts` reads them: the same
//! columns in the same order, the same values bit for bit, the same labels in
//! the same order of first appearance. The native app hands the web app this
//! table in place of running `parseAcmi`, so every deviation is a bug - the few
//! that are known are listed here.
//!
//! - `Date.parse` (ReferenceTime) is reproduced for the ISO forms: `YYYY`,
//!   `YYYY-MM`, `YYYY-MM-DD`, extended `±YYYYYY` years, a time after `T`, `t` or
//!   spaces (`HH:mm`, `:ss`, `.fraction` truncated to milliseconds), then `Z`,
//!   `z`, `±HH:mm` or `±HHmm`, or a date followed by `Z`. JavaScript reads a
//!   date-time without an offset as local time; here it is UTC (Tacview writes
//!   `Z`). The legacy forms V8 also accepts (`Jun 2 2011`, `2011/06/02`) are not
//!   read: no ReferenceTime, as for an invalid one.
//! - `Math.sin`/`Math.cos` in V8 and Rust's (the platform's) may differ in the
//!   last bit for some arguments, so X and Y can differ by an ulp (well under a
//!   micrometre); every other value is exact.
//!
//! The JavaScript keeps each sample's properties as a shared copy-on-write map.
//! Here no sample holds a map: every property change is logged per key as (row,
//! object, value), and each output column replays its key's log against the rows
//! in order. A recording of tens of millions of positions costs a few numbers a
//! row while reading, and every column is built on its own core.

use std::borrow::Cow;
use std::collections::HashMap;
use std::hash::{BuildHasherDefault, Hasher};

use rayon::prelude::*;

use crate::jsnum::{days_from_civil, js_number};
use crate::table::{Column, Dict};

/// One line kind's count, as `AcmiTable.completeness` in acmi.ts.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Completeness {
    pub seen: u64,
    pub decoded: u64,
    pub partial: u64,
    pub raw: u64,
    pub lost: u64,
}

/// What `parseAcmi` returns, column for column.
#[derive(Debug, Clone, Default)]
pub struct AcmiTable {
    pub columns: Vec<String>,
    /// `Column::Num` for a Float64Array column, `Column::Text` for a string[] one.
    pub data: Vec<Column>,
    pub rows: usize,
    pub title: String,
    pub reference_time: Option<f64>,
    pub reference_lon: f64,
    pub reference_lat: f64,
    pub flat_world: bool,
    /// Object 0's properties in insertion order, as the JS object holds them.
    pub globals: Vec<(String, String)>,
    /// In insertion order, as the JS object holds them.
    pub completeness: Vec<(String, Completeness)>,
}

const EARTH: f64 = 6378137.0;
const F: f64 = 1.0 / 298.257223563;
const E2: f64 = F * (2.0 - F);

/// No object: a row of the recording's own (a comment, an event about no object seen).
const NONE: u32 = u32::MAX;
const UNSET: u32 = u32::MAX;

// ---------------------------------------------------------------------------
// The file's text
// ---------------------------------------------------------------------------

/// The text of a recording: a zip's first member (stored or deflated), else the bytes as UTF-8.
pub fn acmi_text(bytes: &[u8]) -> anyhow::Result<String> {
    if bytes.len() >= 4 && bytes[..4] == [0x50, 0x4b, 0x03, 0x04] {
        return unzip_first(bytes);
    }
    Ok(utf8(bytes))
}

/// `new TextDecoder('utf-8').decode(bytes)`: a leading BOM dropped, invalid
/// sequences replaced by U+FFFD per maximal subpart (as WHATWG and Rust both do).
fn utf8(bytes: &[u8]) -> String {
    let b = bytes.strip_prefix(&[0xEF, 0xBB, 0xBF]).unwrap_or(bytes);
    String::from_utf8_lossy(b).into_owned()
}

fn rd16(z: &[u8], i: usize) -> anyhow::Result<usize> {
    match z.get(i..i + 2) {
        Some(b) => Ok(u16::from_le_bytes([b[0], b[1]]) as usize),
        None => anyhow::bail!("offset is outside the bounds of the zip"),
    }
}

fn rd32(z: &[u8], i: usize) -> anyhow::Result<usize> {
    match z.get(i..i + 4) {
        Some(b) => Ok(u32::from_le_bytes([b[0], b[1], b[2], b[3]]) as usize),
        None => anyhow::bail!("offset is outside the bounds of the zip"),
    }
}

/// The first file of a zip, stored or deflated: what a `.zip.acmi` holds.
fn unzip_first(z: &[u8]) -> anyhow::Result<String> {
    // Sizes from the central directory: a streamed zip leaves them 0 in the local header.
    let mut eocd = None;
    if z.len() >= 22 {
        let lo = z.len().saturating_sub(65557);
        let mut i = z.len() - 22;
        loop {
            if rd32(z, i)? == 0x06054b50 {
                eocd = Some(i);
                break;
            }
            if i == lo {
                break;
            }
            i -= 1;
        }
    }
    let Some(eocd) = eocd else { anyhow::bail!("not a zip: no end of central directory") };
    let cd = rd32(z, eocd + 16)?;
    if rd32(z, cd)? != 0x02014b50 {
        anyhow::bail!("zip central directory not found");
    }
    let method = rd16(z, cd + 10)?;
    let csize = rd32(z, cd + 20)?;
    let local = rd32(z, cd + 42)?;
    let name_len = rd16(z, local + 26)?;
    let extra_len = rd16(z, local + 28)?;
    let start = local + 30 + name_len + extra_len;
    // `subarray` clamps to the buffer.
    let a = start.min(z.len());
    let data = &z[a..(start + csize).min(z.len())];
    if method == 0 {
        return Ok(utf8(data));
    }
    if method != 8 {
        anyhow::bail!("zip method {method} is not supported");
    }
    Ok(utf8(&inflate_raw(data)?))
}

/// Raw deflate, as `DecompressionStream('deflate-raw')`: a truncated stream or
/// data after its end is an error.
fn inflate_raw(data: &[u8]) -> anyhow::Result<Vec<u8>> {
    let mut d = flate2::Decompress::new(false);
    let mut out: Vec<u8> = Vec::with_capacity(data.len().saturating_mul(4).max(1024));
    loop {
        if out.len() == out.capacity() {
            out.reserve(out.capacity());
        }
        let (in0, out0) = (d.total_in(), d.total_out());
        let status = d.decompress_vec(&data[in0 as usize..], &mut out, flate2::FlushDecompress::None)?;
        if status == flate2::Status::StreamEnd {
            break;
        }
        if d.total_in() == in0 && d.total_out() == out0 {
            anyhow::bail!("the compressed data ends early");
        }
    }
    if d.total_in() as usize != data.len() {
        anyhow::bail!("junk found after the end of the compressed data");
    }
    Ok(out)
}

// ---------------------------------------------------------------------------
// JavaScript string semantics
// ---------------------------------------------------------------------------

/// The characters `String.prototype.trim` and the regex `\s` take.
fn is_js_space(c: char) -> bool {
    matches!(
        c,
        '\u{9}' | '\u{a}' | '\u{b}' | '\u{c}' | '\u{d}' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}' | '\u{2028}' | '\u{2029}' | '\u{202f}' | '\u{205f}' | '\u{3000}' | '\u{feff}'
    )
}

fn js_trim(s: &str) -> &str {
    s.trim_matches(is_js_space)
}

/// `toLowerCase()`, borrowing when there is nothing to change.
fn js_lower(s: &str) -> Cow<'_, str> {
    if s.bytes().all(|b| b.is_ascii() && !b.is_ascii_uppercase()) {
        Cow::Borrowed(s)
    } else {
        Cow::Owned(s.to_lowercase())
    }
}

/// JavaScript's default sort: by UTF-16 code units.
fn js_cmp(a: &str, b: &str) -> std::cmp::Ordering {
    if a.is_ascii() && b.is_ascii() {
        return a.cmp(b);
    }
    a.encode_utf16().cmp(b.encode_utf16())
}

/// An array index key, which a JS object lists first, in numeric order.
fn array_index(k: &str) -> Option<u64> {
    let b = k.as_bytes();
    if b.is_empty() || b.len() > 10 || !b.iter().all(u8::is_ascii_digit) || (b.len() > 1 && b[0] == b'0') {
        return None;
    }
    let v: u64 = k.parse().ok()?;
    (v < 4_294_967_295).then_some(v)
}

/// `JSON.stringify` of a string.
fn json_str(out: &mut String, s: &str) {
    out.push('"');
    let mut run = 0;
    for (i, b) in s.bytes().enumerate() {
        let esc: &str = match b {
            b'"' => "\\\"",
            b'\\' => "\\\\",
            0x08 => "\\b",
            0x0c => "\\f",
            b'\n' => "\\n",
            b'\r' => "\\r",
            b'\t' => "\\t",
            0..=0x1f => "",
            _ => continue,
        };
        out.push_str(&s[run..i]);
        if esc.is_empty() {
            out.push_str(&format!("\\u{b:04x}"));
        } else {
            out.push_str(esc);
        }
        run = i + 1;
    }
    out.push_str(&s[run..]);
    out.push('"');
}

/// `Date.parse` for the ISO forms (see the module notes): milliseconds, or None.
fn date_parse(s: &str) -> Option<f64> {
    let b = s.as_bytes();
    let mut i = 0usize;
    let digits = |i: &mut usize, n: usize| -> Option<i64> {
        let d = b.get(*i..*i + n)?;
        if !d.iter().all(u8::is_ascii_digit) {
            return None;
        }
        *i += n;
        Some(d.iter().fold(0i64, |a, &c| a * 10 + (c - b'0') as i64))
    };
    let year = match b.first()? {
        b'+' | b'-' => {
            let neg = b[0] == b'-';
            i = 1;
            let y = digits(&mut i, 6)?;
            if neg && y == 0 {
                return None;
            }
            if neg {
                -y
            } else {
                y
            }
        }
        _ => digits(&mut i, 4)?,
    };
    let (mut month, mut day) = (1i64, 1i64);
    if b.get(i) == Some(&b'-') {
        i += 1;
        month = digits(&mut i, 2)?;
        if b.get(i) == Some(&b'-') {
            i += 1;
            day = digits(&mut i, 2)?;
        }
    }
    let (mut h, mut mi, mut sec, mut ms) = (0i64, 0i64, 0i64, 0i64);
    let mut offset = 0i64;
    if i < b.len() {
        match b[i] {
            b'Z' | b'z' if i + 1 == b.len() => i += 1,
            b'T' | b't' | b' ' => {
                if b[i] == b' ' {
                    while b.get(i) == Some(&b' ') {
                        i += 1;
                    }
                } else {
                    i += 1;
                }
                h = digits(&mut i, 2)?;
                if b.get(i) != Some(&b':') {
                    return None;
                }
                i += 1;
                mi = digits(&mut i, 2)?;
                if b.get(i) == Some(&b':') {
                    i += 1;
                    sec = digits(&mut i, 2)?;
                    if b.get(i) == Some(&b'.') {
                        i += 1;
                        let start = i;
                        while b.get(i).is_some_and(u8::is_ascii_digit) {
                            i += 1;
                        }
                        if i == start {
                            return None;
                        }
                        // The first three digits; the rest ignored.
                        for k in 0..3 {
                            let d = if start + k < i { (b[start + k] - b'0') as i64 } else { 0 };
                            ms = ms * 10 + d;
                        }
                    }
                }
                match b.get(i) {
                    None => {}
                    Some(b'Z' | b'z') => i += 1,
                    Some(&c @ (b'+' | b'-')) => {
                        i += 1;
                        let oh = digits(&mut i, 2)?;
                        if b.get(i) == Some(&b':') {
                            i += 1;
                        }
                        let om = digits(&mut i, 2)?;
                        if oh > 23 || om > 59 {
                            return None;
                        }
                        offset = (oh * 60 + om) * if c == b'-' { -1 } else { 1 };
                    }
                    _ => return None,
                }
            }
            _ => return None,
        }
    }
    if i != b.len() {
        return None;
    }
    if !(1..=12).contains(&month) || !(1..=31).contains(&day) {
        return None;
    }
    if (h > 23 || mi > 59 || sec > 59) && !(h == 24 && mi == 0 && sec == 0 && ms == 0) {
        return None;
    }
    let days = days_from_civil(year, month as u32, 1) + day - 1;
    let t = days as f64 * 86_400_000.0 + (h * 3_600_000 + mi * 60_000 + sec * 1000 + ms - offset * 60_000) as f64;
    (t.abs() <= 8.64e15).then_some(t)
}

// ---------------------------------------------------------------------------
// Lines and fields
// ---------------------------------------------------------------------------

/// A line's comma-separated fields, `\x` taken as a literal x (`splitFields`).
enum Fields<'a> {
    Fast(std::str::Split<'a, char>),
    Slow(std::vec::IntoIter<String>),
}

impl<'a> Iterator for Fields<'a> {
    type Item = Cow<'a, str>;
    fn next(&mut self) -> Option<Cow<'a, str>> {
        match self {
            Fields::Fast(s) => s.next().map(Cow::Borrowed),
            Fields::Slow(v) => v.next().map(Cow::Owned),
        }
    }
}

fn split_fields(line: &str) -> Fields<'_> {
    if !line.contains('\\') {
        return Fields::Fast(line.split(','));
    }
    let mut out = Vec::new();
    let mut cur = String::new();
    let mut it = line.chars();
    while let Some(c) = it.next() {
        if c == '\\' {
            match it.next() {
                Some(n) => cur.push(n),
                None => cur.push('\\'),
            }
            continue;
        }
        if c == ',' {
            out.push(std::mem::take(&mut cur));
            continue;
        }
        cur.push(c);
    }
    out.push(cur);
    Fields::Slow(out.into_iter())
}

// ---------------------------------------------------------------------------
// The reader
// ---------------------------------------------------------------------------

#[derive(Default)]
struct Fx(u64);

impl Hasher for Fx {
    fn finish(&self) -> u64 {
        // murmur3's fmix64: the multiply-rotate rounds leave the low bits weak.
        let mut h = self.0;
        h ^= h >> 33;
        h = h.wrapping_mul(0xff51_afd7_ed55_8ccd);
        h ^= h >> 33;
        h = h.wrapping_mul(0xc4ce_b9fe_1a85_ec53);
        h ^ (h >> 33)
    }
    fn write(&mut self, bytes: &[u8]) {
        const K: u64 = 0x517c_c1b7_2722_0a95;
        let mut h = self.0;
        let mut c = bytes.chunks_exact(8);
        for w in &mut c {
            h = (h.rotate_left(5) ^ u64::from_le_bytes(w.try_into().unwrap())).wrapping_mul(K);
        }
        for &x in c.remainder() {
            h = (h.rotate_left(5) ^ x as u64).wrapping_mul(K);
        }
        self.0 = h;
    }
    fn write_u8(&mut self, i: u8) {
        self.0 = (self.0.rotate_left(5) ^ i as u64).wrapping_mul(0x517c_c1b7_2722_0a95);
    }
}

type FxMap<K, V> = HashMap<K, V, BuildHasherDefault<Fx>>;

/// A property value: a span of the text, or (unescaped or joined) of the arena.
#[derive(Clone, Copy)]
struct ValRef {
    /// Top bit set: in the arena.
    start: u64,
    len: u32,
}

const IN_ARENA: u64 = 1 << 63;

/// One property set: `key=value` on `obj`'s line, before row `row` was written.
#[derive(Clone, Copy)]
struct Change {
    row: u32,
    obj: u32,
    val: ValRef,
}

#[derive(Clone, Copy)]
struct Pos {
    lon: f64,
    lat: f64,
    alt: f64,
    roll: f64,
    pitch: f64,
    yaw: f64,
    u: f64,
    v: f64,
    heading: f64,
}

const NAN: f64 = f64::NAN;
const AT_REFERENCE: Pos =
    Pos { lon: 0.0, lat: 0.0, alt: 0.0, roll: NAN, pitch: NAN, yaw: NAN, u: NAN, v: NAN, heading: NAN };

struct Obj {
    id: String,
    pos: Pos,
    seen: bool,
    alive: bool,
}

/// Rows as they are written: the raw position, and indices for the rest.
#[derive(Default)]
struct Rows {
    t: Vec<f64>,
    lon: Vec<f64>,
    lat: Vec<f64>,
    alt: Vec<f64>,
    head: Vec<f64>,
    pitch: Vec<f64>,
    roll: Vec<f64>,
    u: Vec<f64>,
    v: Vec<f64>,
    obj: Vec<u32>,
    info: Vec<u32>,
    ev: Vec<u32>,
}

/// Line kinds in `count` order of first appearance.
const KINDS: [&str; 8] = ["comment", "header", "time", "removed", "event", "global", "position", "properties"];
const K_COMMENT: usize = 0;
const K_HEADER: usize = 1;
const K_TIME: usize = 2;
const K_REMOVED: usize = 3;
const K_EVENT: usize = 4;
const K_GLOBAL: usize = 5;
const K_POSITION: usize = 6;
const K_PROPERTIES: usize = 7;

const NOT_NUMERIC: [&str; 20] = [
    "T",
    "Type",
    "Name",
    "Pilot",
    "Group",
    "Country",
    "Coalition",
    "Color",
    "Shape",
    "Parent",
    "Next",
    "CallSign",
    "Registration",
    "Squawk",
    "ICAO24",
    "Label",
    "FocusedTarget",
    "LockedTarget",
    "Importance",
    "Debug",
];

/// Text properties with a column of their own, and the names `strCols[k]` finds:
/// its own keys and what every JS object inherits.
const NOT_TEXT_EXTRA: [&str; 23] = [
    "Type",
    "Name",
    "Pilot",
    "Group",
    "Country",
    "Coalition",
    "Color",
    "Object",
    "Event",
    "EventObjects",
    "RecordingInfo",
    "constructor",
    "__defineGetter__",
    "__defineSetter__",
    "hasOwnProperty",
    "__lookupGetter__",
    "__lookupSetter__",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toString",
    "valueOf",
    "__proto__",
    "toLocaleString",
];

/// Object 0's properties, kept as a JS object keeps them.
#[derive(Default)]
struct Globals {
    entries: Vec<(String, String)>,
    index: FxMap<String, usize>,
    indexed: bool,
}

impl Globals {
    fn set(&mut self, key: &str, value: &str) {
        // `obj['__proto__'] = text` sets nothing.
        if key == "__proto__" {
            return;
        }
        if let Some(&i) = self.index.get(key) {
            self.entries[i].1.clear();
            self.entries[i].1.push_str(value);
            return;
        }
        self.indexed |= array_index(key).is_some();
        self.index.insert(key.to_owned(), self.entries.len());
        self.entries.push((key.to_owned(), value.to_owned()));
    }

    /// Own keys in JS order: array indices ascending, then the rest as inserted.
    fn ordered(&self) -> Vec<&(String, String)> {
        if !self.indexed {
            return self.entries.iter().collect();
        }
        let mut idx: Vec<(u64, &(String, String))> =
            self.entries.iter().filter_map(|e| array_index(&e.0).map(|v| (v, e))).collect();
        idx.sort_by_key(|x| x.0);
        let mut out: Vec<&(String, String)> = idx.into_iter().map(|x| x.1).collect();
        out.extend(self.entries.iter().filter(|e| array_index(&e.0).is_none()));
        out
    }

    fn json(&self) -> String {
        let mut s = String::from("{");
        for (i, (k, v)) in self.ordered().into_iter().enumerate() {
            if i > 0 {
                s.push(',');
            }
            json_str(&mut s, k);
            s.push(':');
            json_str(&mut s, v);
        }
        s.push('}');
        s
    }
}

struct Reader<'a> {
    text: &'a str,
    arena: String,
    objects: Vec<Obj>,
    index: FxMap<String, u32>,
    key_ids: FxMap<String, u32>,
    key_names: Vec<String>,
    key_text: Vec<bool>,
    key_num: Vec<bool>,
    key_not_numeric: Vec<bool>,
    changes: Vec<Vec<Change>>,
    rows: Rows,
    /// (Event, EventObjects) per event row; 0 is a position's empty pair.
    events: Vec<(String, String)>,
    /// RecordingInfo as it stood: one entry each time it changed.
    infos: Vec<String>,
    info: u32,
    globals: Globals,
    kinds: [u64; 8],
    kind_order: Vec<usize>,
    t: f64,
    ref_lon: f64,
    ref_lat: f64,
    ref_time: Option<f64>,
    title: String,
}

const EV_NONE: u32 = 0;
const EV_REMOVED: u32 = 1;
const EV_UNPLACED: u32 = 2;

impl<'a> Reader<'a> {
    fn new(text: &'a str, name: &str) -> Self {
        Reader {
            text,
            arena: String::new(),
            objects: Vec::new(),
            index: FxMap::default(),
            key_ids: FxMap::default(),
            key_names: Vec::new(),
            key_text: Vec::new(),
            key_num: Vec::new(),
            key_not_numeric: Vec::new(),
            changes: Vec::new(),
            rows: Rows::default(),
            events: ["", "Removed", "Unplaced"].iter().map(|e| (e.to_string(), String::new())).collect(),
            infos: vec![String::new()],
            info: 0,
            globals: Globals::default(),
            kinds: [0; 8],
            kind_order: Vec::new(),
            t: 0.0,
            ref_lon: 0.0,
            ref_lat: 0.0,
            ref_time: None,
            title: name.to_owned(),
        }
    }

    fn count(&mut self, kind: usize) {
        if self.kinds[kind] == 0 {
            self.kind_order.push(kind);
        }
        self.kinds[kind] += 1;
    }

    fn sample(&mut self, obj: u32, p: Pos, ev: u32) {
        let r = &mut self.rows;
        r.t.push(self.t);
        r.lon.push(p.lon);
        r.lat.push(p.lat);
        r.alt.push(p.alt);
        // Heading: the given one, else the yaw (Tacview's yaw is a true heading).
        let head = if p.heading.is_finite() { p.heading } else { p.yaw };
        r.head.push(if head.is_finite() { head } else { f64::NAN });
        r.pitch.push(p.pitch);
        r.roll.push(p.roll);
        r.u.push(p.u);
        r.v.push(p.v);
        r.obj.push(obj);
        r.info.push(self.info);
        r.ev.push(ev);
    }

    fn event(&mut self, label: String, objects: String) -> u32 {
        self.events.push((label, objects));
        (self.events.len() - 1) as u32
    }

    fn set_global(&mut self, key: &str, value: &str) {
        self.globals.set(key, value);
        self.infos.push(self.globals.json());
        self.info = (self.infos.len() - 1) as u32;
    }

    fn store(&mut self, v: &str) -> ValRef {
        let len = u32::try_from(v.len()).expect("a property value over 4 GB");
        let base = self.text.as_ptr() as usize;
        let p = v.as_ptr() as usize;
        if p >= base && p + v.len() <= base + self.text.len() {
            return ValRef { start: (p - base) as u64, len };
        }
        let start = self.arena.len() as u64 | IN_ARENA;
        self.arena.push_str(v);
        ValRef { start, len }
    }

    fn key_id(&mut self, key: &str) -> usize {
        if let Some(&k) = self.key_ids.get(key) {
            return k as usize;
        }
        let k = self.key_names.len();
        self.key_ids.insert(key.to_owned(), k as u32);
        self.key_names.push(key.to_owned());
        self.key_text.push(false);
        self.key_num.push(false);
        self.key_not_numeric.push(NOT_NUMERIC.contains(&key));
        self.changes.push(Vec::new());
        k
    }

    fn slot(&self, id: &str) -> Option<u32> {
        self.index.get(id).copied()
    }

    fn line(&mut self, line: &str) {
        if line.is_empty() {
            return;
        }
        if let Some(rest) = line.strip_prefix("//") {
            self.count(K_COMMENT);
            let ev = self.event(format!("Comment: {}", js_trim(rest)), String::new());
            self.sample(NONE, AT_REFERENCE, ev);
            return;
        }
        if line.starts_with("FileType=") || line.starts_with("FileVersion=") {
            self.count(K_HEADER);
            let eq = line.find('=').unwrap();
            self.set_global(&line[..eq], &line[eq + 1..]);
            return;
        }
        match line.as_bytes()[0] {
            b'#' => {
                self.count(K_TIME);
                let v = js_number(&line[1..]);
                if v.is_finite() {
                    self.t = v;
                }
                return;
            }
            b'-' => {
                self.count(K_REMOVED);
                let gone = js_lower(js_trim(&line[1..]));
                // The object leaves: an event where it was last.
                if let Some(s) = self.index.remove(gone.as_ref()) {
                    let o = &mut self.objects[s as usize];
                    o.alive = false;
                    if o.seen {
                        let p = o.pos;
                        self.sample(s, p, EV_REMOVED);
                    }
                }
                return;
            }
            _ => {}
        }
        let mut fields = split_fields(line);
        let first = fields.next().unwrap();
        let id = js_lower(js_trim(&first));
        if id == "0" {
            self.count(if line.starts_with("Event=") || line.contains(",Event=") { K_EVENT } else { K_GLOBAL });
            for f in fields {
                let Some(eq) = f.find('=') else { continue };
                let (key, value) = (&f[..eq], &f[eq + 1..]);
                match key {
                    "ReferenceLongitude" => self.ref_lon = or_zero(js_number(value)),
                    "ReferenceLatitude" => self.ref_lat = or_zero(js_number(value)),
                    "ReferenceTime" => {
                        if let Some(ms) = date_parse(value) {
                            self.ref_time = Some(ms / 1000.0);
                        }
                        // Kept as written too: the mission's start, for the Match tab.
                        self.set_global(key, value);
                    }
                    "Event" => self.global_event(value),
                    _ => {
                        if key == "Title" {
                            self.title = value.to_owned();
                        }
                        self.set_global(key, value);
                    }
                }
            }
            return;
        }
        let slot = match self.slot(&id) {
            Some(s) => s,
            None => {
                let s = self.objects.len() as u32;
                // An altitude never written is sea level, as Tacview reads it.
                let pos = Pos { lon: f64::NAN, lat: f64::NAN, alt: 0.0, ..AT_REFERENCE };
                self.objects.push(Obj { id: id.clone().into_owned(), pos, seen: false, alive: true });
                self.index.insert(id.into_owned(), s);
                s
            }
        };
        let mut moved = false;
        let row = self.rows.t.len() as u32;
        for f in fields {
            let Some(eq) = f.find('=') else { continue };
            let (key, value) = (&f[..eq], &f[eq + 1..]);
            if key == "T" {
                let o = &mut self.objects[slot as usize].pos;
                let mut p = [""; 9];
                let mut n = 0usize;
                for part in value.split('|') {
                    if n < 9 {
                        p[n] = part;
                    }
                    n += 1;
                }
                o.lon = num(p[0], o.lon);
                o.lat = num(p[1], o.lat);
                o.alt = num(p[2], o.alt);
                if n == 5 {
                    o.u = num(p[3], o.u);
                    o.v = num(p[4], o.v);
                } else if n == 6 {
                    o.roll = num(p[3], o.roll);
                    o.pitch = num(p[4], o.pitch);
                    o.yaw = num(p[5], o.yaw);
                } else if n >= 9 {
                    o.roll = num(p[3], o.roll);
                    o.pitch = num(p[4], o.pitch);
                    o.yaw = num(p[5], o.yaw);
                    o.u = num(p[6], o.u);
                    o.v = num(p[7], o.v);
                    o.heading = num(p[8], o.heading);
                }
                moved = true;
            } else {
                let k = self.key_id(key);
                if !self.key_text[k] {
                    if self.key_not_numeric[k] || (!value.is_empty() && !number(value).is_finite()) {
                        self.key_text[k] = true;
                    } else if !value.is_empty() {
                        self.key_num[k] = true;
                    }
                }
                let val = self.store(value);
                self.changes[k].push(Change { row, obj: slot, val });
            }
        }
        let o = &mut self.objects[slot as usize];
        if moved && o.pos.lon.is_finite() && o.pos.lat.is_finite() {
            o.seen = true;
            let p = o.pos;
            self.count(K_POSITION);
            self.sample(slot, p, EV_NONE);
        } else {
            self.count(K_PROPERTIES);
        }
    }

    /// `0,Event=Kind|id|id...|text`, or the named-field form.
    fn global_event(&mut self, value: &str) {
        let parts: Vec<&str> = value.split('|').collect();
        let kind = js_trim(parts[0]);
        // Named fields (Timeout: SourceId:507|AmmoType:FOX2|TargetId:201|Outcome:Kill): the
        // ids are SourceId's and TargetId's, the text all the fields as written.
        let named = parts.len() > 2 && parts[1..].iter().all(|x| js_trim(x).is_empty() || named_field(x));
        let ids: Vec<String> = if named {
            parts[1..]
                .iter()
                .filter(|x| source_or_target(x))
                .map(|x| js_lower(js_trim(&x[x.find(':').unwrap() + 1..])).into_owned())
                .filter(|x| !x.is_empty())
                .collect()
        } else {
            parts[1..1.max(parts.len() - 1)]
                .iter()
                .map(|x| js_lower(js_trim(x)).into_owned())
                .filter(|x| !x.is_empty())
                .collect()
        };
        let text: Cow<str> = if named {
            Cow::Owned(parts[1..].iter().map(|x| js_trim(x)).filter(|x| !x.is_empty()).collect::<Vec<_>>().join("|"))
        } else if parts.len() > 1 {
            Cow::Borrowed(parts[parts.len() - 1])
        } else {
            Cow::Borrowed("")
        };
        let label = if text.is_empty() { kind.to_owned() } else { format!("{kind}: {text}") };
        let at = ids.iter().find_map(|x| self.slot(x).filter(|&s| self.objects[s as usize].seen));
        let ev = self.event(label, ids.join(" "));
        match at {
            Some(s) => {
                let p = self.objects[s as usize].pos;
                self.sample(s, p, ev);
            }
            // About no object seen: at the reference point, as the recording's own.
            None => self.sample(NONE, AT_REFERENCE, ev),
        }
    }
}

/// `Number(value) || 0`.
fn or_zero(v: f64) -> f64 {
    if v.is_nan() || v == 0.0 {
        0.0
    } else {
        v
    }
}

/// A `T=` field: empty (or absent) keeps the previous value.
fn num(s: &str, prev: f64) -> f64 {
    if s.is_empty() {
        prev
    } else {
        number(s)
    }
}

/// `Number(s)`: plain decimals of up to 15 digits directly - exact, as the
/// integer and the power of ten are, and IEEE division rounds correctly
/// (Clinger's fast path) - anything else through `js_number`.
fn number(s: &str) -> f64 {
    const POW10: [f64; 16] = [1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15];
    let b = s.as_bytes();
    let (neg, mut i) = match b.first() {
        Some(b'-') => (true, 1),
        Some(b'+') => (false, 1),
        _ => (false, 0),
    };
    let (mut m, mut digits, mut frac, mut dot) = (0u64, 0usize, 0usize, false);
    while i < b.len() {
        match b[i] {
            c @ b'0'..=b'9' => {
                if digits == 15 {
                    return js_number(s);
                }
                m = m * 10 + (c - b'0') as u64;
                digits += 1;
                frac += dot as usize;
            }
            b'.' if !dot => dot = true,
            _ => return js_number(s),
        }
        i += 1;
    }
    if digits == 0 {
        return js_number(s);
    }
    let v = m as f64 / POW10[frac];
    if neg {
        -v
    } else {
        v
    }
}

/// `/^\s*[A-Za-z]+\s*:/`
fn named_field(x: &str) -> bool {
    let s = x.trim_start_matches(is_js_space);
    let r = s.trim_start_matches(|c: char| c.is_ascii_alphabetic());
    r.len() < s.len() && r.trim_start_matches(is_js_space).starts_with(':')
}

/// `/^\s*(SourceId|TargetId)\s*:/i`
fn source_or_target(x: &str) -> bool {
    let s = x.trim_start_matches(is_js_space).as_bytes();
    s.len() >= 8
        && (s[..8].eq_ignore_ascii_case(b"sourceid") || s[..8].eq_ignore_ascii_case(b"targetid"))
        && std::str::from_utf8(&s[8..]).is_ok_and(|r| r.trim_start_matches(is_js_space).starts_with(':'))
}

// ---------------------------------------------------------------------------
// The table
// ---------------------------------------------------------------------------

/// `parseAcmi(text, name)`.
pub fn parse_acmi(text: &str, name: &str) -> AcmiTable {
    let mut r = Reader::new(text, name);
    // `split(/\r?\n/)`, joining continued lines (ending in one `\`).
    let mut acc = String::new();
    let mut rest = text;
    loop {
        let (raw, last) = match rest.find('\n') {
            Some(i) => {
                let piece = &rest[..i];
                rest = &rest[i + 1..];
                (piece.strip_suffix('\r').unwrap_or(piece), false)
            }
            None => (rest, true),
        };
        if raw.ends_with('\\') && !raw.ends_with("\\\\") {
            acc.push_str(&raw[..raw.len() - 1]);
            acc.push('\n');
        } else if acc.is_empty() {
            r.line(raw);
        } else {
            acc.push_str(raw);
            let joined = std::mem::take(&mut acc);
            r.line(&joined);
        }
        if last {
            break;
        }
    }
    if !acc.is_empty() {
        let joined = std::mem::take(&mut acc);
        r.line(&joined);
    }
    // Objects that never got a position: their properties at the reference point, not lost.
    let mut unplaced = 0u64;
    for s in 0..r.objects.len() {
        let o = &r.objects[s];
        if !o.alive || o.seen {
            continue;
        }
        unplaced += 1;
        r.sample(s as u32, AT_REFERENCE, EV_UNPLACED);
    }
    r.finish(unplaced)
}

/// What a text column of the object's properties shows: its id and up to two keys' values.
type MakeLabel = fn(&str, Option<&str>, Option<&str>) -> String;

enum Job {
    Keyed([Option<usize>; 2], MakeLabel),
    Num(usize),
    Event,
    EventObjects,
    Info,
}

impl<'a> Reader<'a> {
    fn val(&self, v: ValRef) -> &str {
        let (start, len) = ((v.start & !IN_ARENA) as usize, v.len as usize);
        if v.start & IN_ARENA != 0 {
            &self.arena[start..start + len]
        } else {
            &self.text[start..start + len]
        }
    }

    fn finish(mut self, unplaced: u64) -> AcmiTable {
        let n = self.rows.t.len();
        let rows = std::mem::take(&mut self.rows);
        let uv = |i: usize| rows.u[i].is_finite() && rows.v[i].is_finite();
        let flat_world = n > 0 && (0..n).into_par_iter().all(uv);
        // U and V as columns whenever any row has them; flatWorld says whether every row does.
        let has_uv = (0..n).into_par_iter().any(uv);

        let key = |k: &str| self.key_ids.get(k).map(|&k| k as usize);
        let name = |k: usize| self.key_names[k].as_str();
        let mut extra_keys: Vec<usize> = (0..self.key_names.len())
            .filter(|&k| self.key_num[k] && !self.key_text[k] && !["Heading", "Altitude"].contains(&name(k)))
            .collect();
        extra_keys.sort_by(|&a, &b| js_cmp(&self.key_names[a], &self.key_names[b]));
        let mut text_extra: Vec<usize> =
            (0..self.key_names.len()).filter(|&k| self.key_text[k] && !NOT_TEXT_EXTRA.contains(&name(k))).collect();
        text_extra.sort_by(|&a, &b| js_cmp(&self.key_names[a], &self.key_names[b]));

        let one = |k: &str| Job::Keyed([key(k), None], (|_, v, _| v.unwrap_or("").to_owned()) as MakeLabel);
        let mut jobs = vec![
            Job::Keyed([key("Name"), key("Pilot")], object_label as MakeLabel),
            Job::Keyed([key("Coalition"), key("Color")], |_, c, k| c.or(k).unwrap_or("").to_owned()),
            one("Type"),
            one("Name"),
            one("Pilot"),
            one("Group"),
            one("Country"),
            one("Color"),
            Job::Event,
            Job::EventObjects,
            Job::Info,
        ];
        jobs.extend(extra_keys.iter().map(|&k| Job::Num(k)));
        jobs.extend(text_extra.iter().map(|&k| Job::Keyed([Some(k), None], |_, v, _| v.unwrap_or("").to_owned())));

        let this = &self;
        let rows_ref = &rows;
        let (mut built, (lat, lon, xy, time)) = rayon::join(
            || jobs.par_iter().map(|j| this.column(j, rows_ref)).collect::<Vec<Column>>(),
            || {
                let (ref_lat, ref_lon) = (this.ref_lat, this.ref_lon);
                let lat: Vec<f64> = rows_ref.lat.par_iter().map(|&v| ref_lat + v).collect();
                let lon: Vec<f64> = rows_ref.lon.par_iter().map(|&v| ref_lon + v).collect();
                let project = TangentPlane::new(ref_lat, ref_lon);
                let xy: Vec<(f64, f64)> = lat.par_iter().zip(lon.par_iter()).map(|(&a, &o)| project.at(a, o)).collect();
                let t0 = this.ref_time.unwrap_or(0.0);
                let time: Vec<f64> = rows_ref.t.par_iter().map(|&t| t0 + t).collect();
                (lat, lon, xy, time)
            },
        );
        let (x, y): (Vec<f64>, Vec<f64>) = xy.into_par_iter().unzip();

        let mut recording = Dict::with_capacity(n);
        if n > 0 {
            let id = recording.intern(&self.title);
            recording.ids.resize(n, id);
        }

        let mut text_cols = built.split_off(11 + extra_keys.len());
        let extra_cols = built.split_off(11);
        let mut own = built.into_iter();
        let mut next = || own.next().unwrap();
        let (object, coalition, typ, name_c, pilot, group, country, color, event, event_objects, info) =
            (next(), next(), next(), next(), next(), next(), next(), next(), next(), next(), next());

        let mut columns: Vec<String> = [
            "Time",
            "X",
            "Y",
            "Altitude",
            "Object",
            "Coalition",
            "Heading",
            "Pitch",
            "Roll",
            "Type",
            "Name",
            "Pilot",
            "Group",
            "Country",
            "Color",
            "Event",
            "Latitude",
            "Longitude",
            "Recording",
            "EventObjects",
            "RecordingInfo",
        ]
        .iter()
        .map(|s| s.to_string())
        .collect();
        let Rows { alt, head, pitch, roll, u, v, .. } = rows;
        let mut data = vec![
            Column::Num(time),
            Column::Num(x),
            Column::Num(y),
            Column::Num(alt),
            object,
            coalition,
            Column::Num(head),
            Column::Num(pitch),
            Column::Num(roll),
            typ,
            name_c,
            pilot,
            group,
            country,
            color,
            event,
            Column::Num(lat),
            Column::Num(lon),
            Column::Text(recording),
            event_objects,
            info,
        ];
        if has_uv {
            columns.push("U".into());
            columns.push("V".into());
            data.push(Column::Num(u));
            data.push(Column::Num(v));
        }
        columns.extend(extra_keys.iter().map(|&k| self.key_names[k].clone()));
        data.extend(extra_cols);
        columns.extend(text_extra.iter().map(|&k| self.key_names[k].clone()));
        data.append(&mut text_cols);

        let mut completeness: Vec<(String, Completeness)> = self
            .kind_order
            .iter()
            .map(|&k| {
                let seen = self.kinds[k];
                let part = if k == K_PROPERTIES { seen } else { 0 };
                (KINDS[k].to_owned(), Completeness { seen, decoded: seen - part, partial: part, raw: 0, lost: 0 })
            })
            .collect();
        if unplaced > 0 {
            completeness.push((
                "unplacedObjects".into(),
                Completeness { seen: unplaced, decoded: unplaced, partial: 0, raw: 0, lost: 0 },
            ));
        }
        AcmiTable {
            columns,
            data,
            rows: n,
            title: self.title.clone(),
            reference_time: self.ref_time,
            reference_lon: self.ref_lon,
            reference_lat: self.ref_lat,
            flat_world,
            globals: self.globals.ordered().into_iter().cloned().collect(),
            completeness,
        }
    }

    /// One output column, replaying its keys' changes against the rows in order.
    fn column(&self, job: &Job, rows: &Rows) -> Column {
        let n = rows.obj.len();
        let nobj = self.objects.len();
        let list = |k: Option<usize>| k.map_or(&[][..], |k| &self.changes[k][..]);
        match job {
            Job::Keyed(keys, make) => {
                let lists = [list(keys[0]), list(keys[1])];
                let mut at = [0usize; 2];
                let mut cur: Vec<[Option<ValRef>; 2]> = vec![[None, None]; nobj];
                let mut cache = vec![UNSET; nobj];
                let mut none = UNSET;
                let mut dict = Dict::with_capacity(n);
                for r in 0..n {
                    for k in 0..2 {
                        let l = lists[k];
                        while at[k] < l.len() && l[at[k]].row as usize <= r {
                            let c = l[at[k]];
                            cur[c.obj as usize][k] = Some(c.val);
                            cache[c.obj as usize] = UNSET;
                            at[k] += 1;
                        }
                    }
                    let o = rows.obj[r];
                    let id = if o == NONE {
                        if none == UNSET {
                            none = dict.intern(&make("", None, None));
                        }
                        none
                    } else {
                        let s = o as usize;
                        if cache[s] == UNSET {
                            let [a, b] = cur[s];
                            let label = make(&self.objects[s].id, a.map(|v| self.val(v)), b.map(|v| self.val(v)));
                            cache[s] = dict.intern(&label);
                        }
                        cache[s]
                    };
                    dict.ids.push(id);
                }
                Column::Text(dict)
            }
            Job::Num(k) => {
                let l = &self.changes[*k];
                let mut at = 0usize;
                let mut cur = vec![f64::NAN; nobj];
                let mut out = Vec::with_capacity(n);
                for r in 0..n {
                    while at < l.len() && l[at].row as usize <= r {
                        let c = l[at];
                        let v = self.val(c.val);
                        cur[c.obj as usize] = if v.is_empty() { f64::NAN } else { number(v) };
                        at += 1;
                    }
                    let o = rows.obj[r];
                    out.push(if o == NONE { f64::NAN } else { cur[o as usize] });
                }
                Column::Num(out)
            }
            Job::Event => Column::Text(indexed(&rows.ev, self.events.len(), |i| &self.events[i].0)),
            Job::EventObjects => Column::Text(indexed(&rows.ev, self.events.len(), |i| &self.events[i].1)),
            Job::Info => Column::Text(indexed(&rows.info, self.infos.len(), |i| &self.infos[i])),
        }
    }
}

/// `${pilot} (${name}) #${id}`, the parts that are there, or `(recording)`.
fn object_label(id: &str, name: Option<&str>, pilot: Option<&str>) -> String {
    if id.is_empty() {
        return "(recording)".into();
    }
    let (name, pilot) = (name.unwrap_or(""), pilot.unwrap_or(""));
    let mut s = String::with_capacity(name.len() + pilot.len() + id.len() + 5);
    if !pilot.is_empty() {
        s.push_str(pilot);
        s.push(' ');
    }
    if !name.is_empty() {
        s.push('(');
        s.push_str(name);
        s.push_str(") ");
    }
    s.push('#');
    s.push_str(id);
    js_trim(&s).to_owned()
}

/// A text column whose rows index a list of texts.
fn indexed<'s>(idx: &[u32], count: usize, text: impl Fn(usize) -> &'s str) -> Dict {
    let mut cache = vec![UNSET; count];
    let mut dict = Dict::with_capacity(idx.len());
    for &i in idx {
        let i = i as usize;
        if cache[i] == UNSET {
            cache[i] = dict.intern(text(i));
        }
        dict.ids.push(cache[i]);
    }
    dict
}

/// East and north metres on the plane touching the WGS84 ellipsoid at (lat0,
/// lon0), as `tangentPlane` in acmi.ts computes them, operation for operation.
pub struct TangentPlane {
    o: [f64; 3],
    sp: f64,
    cp: f64,
    sl: f64,
    cl: f64,
}

const RAD: f64 = std::f64::consts::PI / 180.0;

fn ecef(lat: f64, lon: f64, h: f64) -> [f64; 3] {
    let sl = (lat * RAD).sin();
    let cl = (lat * RAD).cos();
    let n = EARTH / (1.0 - E2 * sl * sl).sqrt();
    [(n + h) * cl * (lon * RAD).cos(), (n + h) * cl * (lon * RAD).sin(), (n * (1.0 - E2) + h) * sl]
}

impl TangentPlane {
    pub fn new(lat0: f64, lon0: f64) -> Self {
        TangentPlane {
            o: ecef(lat0, lon0, 0.0),
            sp: (lat0 * RAD).sin(),
            cp: (lat0 * RAD).cos(),
            sl: (lon0 * RAD).sin(),
            cl: (lon0 * RAD).cos(),
        }
    }

    /// (east, north) at altitude 0.
    pub fn at(&self, lat: f64, lon: f64) -> (f64, f64) {
        let p = ecef(lat, lon, 0.0);
        let dx = p[0] - self.o[0];
        let dy = p[1] - self.o[1];
        let dz = p[2] - self.o[2];
        let e = -self.sl * dx + self.cl * dy;
        let n = -self.sp * self.cl * dx - self.sp * self.sl * dy + self.cp * dz;
        (e, n)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn recording() -> String {
        lines(&[
            "FileType=text/acmi/tacview",
            "FileVersion=2.2",
            "0,ReferenceTime=2026-11-07T10:00:00Z",
            "0,ReferenceLongitude=42",
            "0,ReferenceLatitude=43",
            "0,Title=Test\\, sortie",
            "#0",
            "a01,T=0.1|0.2|3000|0|5|90,Type=Air+FixedWing,Name=F-16C,Pilot=Viper 1,Coalition=Allies,IAS=210.5",
            "b02,T=0.15|0.25|2000,Type=Air+Rotorcraft,Name=Mi-24P,Coalition=Enemies",
            "#1.5",
            "a01,T=0.11||3100",
            "b02,T=|0.26|",
            "#2",
            "c03,T=0.11|0.2|3050|0|0|85,Type=Weapon+Missile,Name=AIM-9M,Parent=a01,Coalition=Allies",
            "0,Event=Destroyed|b02|",
            "#2.5",
            "-b02",
            "b02,T=0.2|0.2|0,Name=Wreck\\",
            " part two",
        ])
    }

    fn lines(l: &[&str]) -> String {
        l.join("\n")
    }

    fn col<'t>(t: &'t AcmiTable, name: &str) -> &'t Column {
        &t.data[t.columns.iter().position(|c| c == name).unwrap_or_else(|| panic!("no column {name}"))]
    }

    fn text(t: &AcmiTable, name: &str) -> Vec<String> {
        match col(t, name) {
            Column::Text(d) => d.ids.iter().map(|&i| d.labels[i as usize].clone()).collect(),
            Column::Num(_) => panic!("{name} is numeric"),
        }
    }

    fn nums(t: &AcmiTable, name: &str) -> Vec<f64> {
        match col(t, name) {
            Column::Num(v) => v.clone(),
            Column::Text(_) => panic!("{name} is text"),
        }
    }

    #[test]
    fn reads_every_sample_with_unchanged_fields_carried_over() {
        let t = parse_acmi(&recording(), "file");
        assert_eq!(t.rows, 8);
        assert_eq!(t.title, "Test, sortie");
        let name = text(&t, "Name");
        let alt = nums(&t, "Altitude");
        let lat = nums(&t, "Latitude");
        let second = name.iter().skip(1).position(|n| n == "F-16C").unwrap() + 1;
        assert_eq!(alt[second], 3100.0);
        let b = name.iter().enumerate().filter(|(_, n)| *n == "Mi-24P").nth(1).unwrap().0;
        assert!((lat[b] - 43.26).abs() < 1e-10);
        assert_eq!(alt[b], 2000.0);
        let ev = text(&t, "Event");
        let i = ev.iter().position(|e| e == "Destroyed").unwrap();
        assert!(text(&t, "Object")[i].contains("Mi-24P"));
        assert_eq!(name[t.rows - 1], "Wreck\n part two");
        let time = nums(&t, "Time");
        let day = crate::jsnum::days_from_civil(2026, 11, 7) as f64;
        assert_eq!(time[0], (day * 86_400_000.0 + 36_000_000.0) / 1000.0);
        assert_eq!(time[t.rows - 1] - time[0], 2.5);
        assert_eq!(nums(&t, "Heading")[0], 90.0);
        assert_eq!(t.columns[21..], ["IAS", "Parent"]);
        assert_eq!(t.columns.len(), t.data.len());
        assert!(t.data.iter().all(|c| c.len() == t.rows));
        // First-appearance order of the labels.
        let Column::Text(obj) = col(&t, "Object") else { panic!() };
        assert_eq!(obj.labels[..2], ["Viper 1 (F-16C) #a01", "(Mi-24P) #b02"]);
    }

    #[test]
    fn keeps_events_removals_globals_and_text_properties() {
        let t = parse_acmi(
            &lines(&[
                "FileType=text/acmi/tacview",
                "0,ReferenceLongitude=10",
                "0,ReferenceLatitude=50",
                "0,DataSource=Test sim,Author=Someone",
                "#0",
                "1,T=0.1|0.1|1000,Name=A,CallSign=Uzi 1,Health=1",
                "2,T=0.2|0.1|1000,Name=B,Health=dead",
                "#1",
                "0,Event=Bookmark|Merge",
                "0,Event=Message|1|2|Fox 2",
                "0,Comments=after the merge",
                "-2",
            ]),
            "recording",
        );
        let ev = text(&t, "Event");
        let obj = text(&t, "Object");
        let bookmark = ev.iter().position(|e| e == "Bookmark: Merge").unwrap();
        assert_eq!(obj[bookmark], "(recording)");
        assert_eq!(nums(&t, "X")[bookmark], 0.0);
        let message = ev.iter().position(|e| e == "Message: Fox 2").unwrap();
        assert!(obj[message].contains("#1"));
        assert_eq!(text(&t, "EventObjects")[message], "1 2");
        let removed = ev.iter().position(|e| e == "Removed").unwrap();
        assert!(obj[removed].contains("#2"));
        assert_eq!(
            text(&t, "RecordingInfo")[removed],
            concat!(
                r#"{"FileType":"text/acmi/tacview","DataSource":"Test sim","#,
                r#""Author":"Someone","Comments":"after the merge"}"#
            )
        );
        assert!(t.globals.contains(&("Comments".into(), "after the merge".into())));
        assert_eq!(text(&t, "CallSign")[0], "Uzi 1");
        assert!(text(&t, "Health").contains(&"dead".to_string()));
        assert!(!col(&t, "Health").is_numeric());
        assert_eq!(text(&t, "Recording"), vec!["recording"; t.rows]);
    }

    #[test]
    fn keeps_header_comments_unplaced_and_partial_uv() {
        let t = parse_acmi(
            &lines(&[
                "FileType=text/acmi/tacview",
                "FileVersion=2.2",
                "0,ReferenceLongitude=10",
                "0,ReferenceLatitude=50",
                "// a note in the file",
                "#0",
                "a01,T=0.1|0.2|3000|0|5|90|100|200|91,Name=F-16C",
                "b02,T=0.1|0.2|3000,Name=Su-27",
                "f0f,Type=Navaid+Static,Name=Beacon",
                "a01,FuelWeight=2000",
            ]),
            "file",
        );
        assert_eq!(t.globals[1], ("FileVersion".into(), "2.2".into()));
        let ev = text(&t, "Event");
        assert!(ev.contains(&"Comment: a note in the file".to_string()));
        let unplaced = ev.iter().position(|e| e == "Unplaced").unwrap();
        assert_eq!(text(&t, "Name")[unplaced], "Beacon");
        assert!(!t.flat_world);
        let first_pos = ev.iter().position(|e| e.is_empty()).unwrap();
        assert_eq!(nums(&t, "U")[first_pos], 100.0);
        assert!(nums(&t, "U")[first_pos + 1].is_nan());
        let c: HashMap<_, _> = t.completeness.iter().cloned().collect();
        assert_eq!(c["header"].seen, 2);
        assert_eq!(c["comment"].decoded, 1);
        assert_eq!(c["properties"], Completeness { seen: 2, decoded: 0, partial: 2, raw: 0, lost: 0 });
        assert_eq!(c["unplacedObjects"].seen, 1);
        let kinds: Vec<&str> = t.completeness.iter().map(|(k, _)| k.as_str()).collect();
        assert_eq!(kinds, ["header", "global", "comment", "time", "position", "properties", "unplacedObjects"]);
    }

    #[test]
    fn flat_world_when_every_row_has_uv() {
        let t = parse_acmi(
            &lines(&[
                "FileType=text/acmi/tacview",
                "#0",
                "1,T=0|0|100|5000|-2000,Name=x",
                "#1",
                "1,T=0|0.001|100|5100|-2000",
            ]),
            "r",
        );
        assert!(t.flat_world);
        assert_eq!(nums(&t, "U")[1], 5100.0);
        assert!((nums(&t, "Y")[1] - 110.6).abs() < 0.5);
    }

    #[test]
    fn named_event_fields_and_their_ids() {
        let t = parse_acmi(
            &lines(&[
                "FileType=text/acmi/tacview",
                "#0",
                "a01,T=1|2|3000,Name=F-16C",
                "0,Event=Timeout | SourceId:A01 | AmmoType:FOX2 | Outcome:Kill",
                "0,Event=LeftArea|a01|",
                "0,Event=K|zz|a01|text",
            ]),
            "r",
        );
        let ev = text(&t, "Event");
        assert_eq!(ev[1..], ["Timeout: SourceId:A01|AmmoType:FOX2|Outcome:Kill", "LeftArea", "K: text"]);
        assert_eq!(text(&t, "EventObjects")[1..], ["a01", "a01", "zz a01"]);
        assert!(text(&t, "Object")[1..].iter().all(|o| o == "(F-16C) #a01"));
    }

    #[test]
    fn javascript_object_quirks() {
        let t = parse_acmi(
            &lines(&[
                "FileType=x",
                "0,b=1,12=twelve,2=two,__proto__=p,4294967295=big,01=lead,b=again",
                "0,ReferenceLongitude=-0,ReferenceLatitude=abc",
                "#0",
                "1,T=1|1|1,constructor=ctor,Object=o,toString=5,Heading=9,\u{ff5a}=a,\u{1f600}=b,Zed=c",
            ]),
            "r",
        );
        let keys: Vec<&str> = t.globals.iter().map(|(k, _)| k.as_str()).collect();
        assert_eq!(keys, ["2", "12", "FileType", "b", "4294967295", "01"]);
        assert_eq!(t.globals[3].1, "again");
        assert_eq!(
            text(&t, "RecordingInfo")[0],
            r#"{"2":"two","12":"twelve","FileType":"x","b":"again","4294967295":"big","01":"lead"}"#
        );
        assert_eq!(t.reference_lon.to_bits(), 0f64.to_bits());
        assert_eq!(t.reference_lat, 0.0);
        // Inherited names are not text columns; numeric ones are; UTF-16 order.
        assert_eq!(t.columns[21..], ["toString", "Zed", "\u{1f600}", "\u{ff5a}"]);
    }

    #[test]
    fn continuation_crlf_and_escapes() {
        let t = parse_acmi(
            &lines(&[
                "FileType=x\r",
                "#0\r",
                "1,T=1|1|1,Name=a\\,b\\\\\r",
                "2,T=1|1|1,Name=c\\\r",
                "d\r",
                "3,T=1|1|1,Name=e\\",
            ]),
            "r",
        );
        assert_eq!(text(&t, "Name"), ["a,b\\", "c\nd", "e\n"]);
    }

    #[test]
    fn dates_as_date_parse_reads_them() {
        let d = date_parse;
        assert_eq!(d("2011-06-02T05:00:00Z"), Some(1306990800000.0));
        assert_eq!(d("2011-06-02T05:00:00.1239Z"), Some(1306990800123.0));
        assert_eq!(d("2011-06-02T05:00Z"), Some(1306990800000.0));
        assert_eq!(d("2011-06-02"), Some(1306972800000.0));
        assert_eq!(d("2011"), Some(1293840000000.0));
        assert_eq!(d("-000001-01-01T00:00:00Z"), Some(-62198755200000.0));
        assert_eq!(d("2011-06-02T05:00:00+02:00"), Some(1306983600000.0));
        assert_eq!(d("2011-06-02T05:00:00-0230"), Some(1306999800000.0));
        assert_eq!(d("2011-06-02T24:00:00Z"), Some(1307059200000.0));
        assert_eq!(d("2011-02-30T00:00:00Z"), Some(1299024000000.0));
        assert_eq!(d("+275760-09-13T00:00:00Z"), Some(8.64e15));
        for bad in [
            "",
            "garbage",
            "2011-06-02T05Z",
            "-000000-01-01",
            "2011-13-01",
            "2011-06-00",
            "2011-06-02T24:00:01Z",
            " 2011",
            "2011-06-02T05:00:00 Z",
            "+275760-09-13T00:00:00.001Z",
        ] {
            assert_eq!(d(bad), None, "{bad}");
        }
    }

    #[test]
    fn numbers_as_number_reads_them() {
        for s in [
            "0",
            "-0",
            "+5",
            "5.",
            ".5",
            "-.5",
            "123456789012345",
            "1234567890123456",
            "0.1",
            "3.14159265358979",
            "1e3",
            " 7 ",
            "0x1F",
            "",
            "-",
            ".",
            "1.2.3",
            "abc",
            "Infinity",
            "00012.50",
        ] {
            assert_eq!(number(s).to_bits(), js_number(s).to_bits(), "{s}");
        }
    }

    #[test]
    fn json_like_stringify() {
        let mut s = String::new();
        json_str(&mut s, "q\" b\\ \u{8}\u{c}\n\r\t \u{1} \u{1f} \u{7f} \u{e9} \u{1f600} \u{2028}");
        assert_eq!(s, "\"q\\\" b\\\\ \\b\\f\\n\\r\\t \\u0001 \\u001f \u{7f} \u{e9} \u{1f600} \u{2028}\"");
    }

    fn zip(body: &[u8], method: u16) -> Vec<u8> {
        use std::io::Write;
        let comp = if method == 8 {
            let mut e = flate2::write::DeflateEncoder::new(Vec::new(), flate2::Compression::default());
            e.write_all(body).unwrap();
            e.finish().unwrap()
        } else {
            body.to_vec()
        };
        let name = b"rec.txt.acmi";
        let mut local = vec![0u8; 30];
        local[..4].copy_from_slice(&0x04034b50u32.to_le_bytes());
        local[8..10].copy_from_slice(&method.to_le_bytes());
        local[26..28].copy_from_slice(&(name.len() as u16).to_le_bytes());
        let mut z = local;
        z.extend_from_slice(name);
        z.extend_from_slice(&comp);
        let cd = z.len() as u32;
        let mut c = vec![0u8; 46];
        c[..4].copy_from_slice(&0x02014b50u32.to_le_bytes());
        c[10..12].copy_from_slice(&method.to_le_bytes());
        c[20..24].copy_from_slice(&(comp.len() as u32).to_le_bytes());
        c[28..30].copy_from_slice(&(name.len() as u16).to_le_bytes());
        z.extend_from_slice(&c);
        z.extend_from_slice(name);
        let mut e = vec![0u8; 22];
        e[..4].copy_from_slice(&0x06054b50u32.to_le_bytes());
        e[16..20].copy_from_slice(&cd.to_le_bytes());
        z.extend_from_slice(&e);
        z
    }

    #[test]
    fn opens_zipped_and_bom_text() {
        assert_eq!(acmi_text(&zip(recording().as_bytes(), 8)).unwrap(), recording());
        let mut bom = vec![0xEF, 0xBB, 0xBF];
        bom.extend_from_slice(recording().as_bytes());
        assert_eq!(acmi_text(&zip(&bom, 0)).unwrap(), recording());
        assert_eq!(acmi_text(&bom).unwrap(), recording());
        assert_eq!(acmi_text(b"a\xffb").unwrap(), "a\u{fffd}b");
        assert!(acmi_text(&zip(recording().as_bytes(), 12)).is_err());
        assert!(acmi_text(b"PK\x03\x04 no directory").is_err());
    }
}
