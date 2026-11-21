//! The dataset build against the shared vectors (`native/vectors/build`): each
//! case built by the core must give what the web app's build wrote down in
//! `expected.json` (`src/data/native/buildVectors.test.ts`).

use std::path::PathBuf;

use heat3d_core::build::{build, BuildSpec, Built, Col, Look, Mapping};
use heat3d_core::filter::Clause;
use heat3d_core::parquet::ParquetFile;
use heat3d_core::source::map;
use serde_json::Value;

fn dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../vectors/build")
}

fn s(v: &Value) -> Option<String> {
    v.as_str().filter(|s| !s.is_empty()).map(str::to_owned)
}

/// A `ColumnMapping` (over `emptyColumnMapping()`) as the page sends it.
fn spec_of(c: &Value) -> BuildSpec {
    let m = &c["mapping"];
    let numeric = |n: &str| m["extraNumeric"].get(n).and_then(Value::as_bool).unwrap_or(true);
    let look = match m["lookMode"].as_str().unwrap_or("none") {
        "yawPitch" => Look::YawPitch { yaw: s(&m["yaw"]), pitch: s(&m["pitch"]), degrees: m["angleUnit"].as_str().unwrap_or("degrees") == "degrees" },
        "vector" => Look::Vector { x: s(&m["dirX"]), y: s(&m["dirY"]), z: s(&m["dirZ"]) },
        _ => Look::None,
    };
    let axes = &m["axes"];
    let filter = m["rowFilter"]
        .as_array()
        .map(|a| {
            a.iter()
                .map(|f| match f["kind"].as_str() {
                    Some("set") => Clause::Set {
                        column: f["column"].as_str().unwrap().into(),
                        values: f["values"].as_array().unwrap().iter().map(|v| v.as_str().unwrap().into()).collect(),
                    },
                    _ => Clause::Range { column: f["column"].as_str().unwrap().into(), min: f["min"].as_f64(), max: f["max"].as_f64() },
                })
                .collect()
        })
        .unwrap_or_default();
    BuildSpec {
        mapping: Mapping {
            x: s(&m["x"]),
            y: s(&m["y"]),
            z: s(&m["z"]),
            time: s(&m["time"]),
            time_unit: m["timeUnit"].as_str().unwrap_or("seconds").into(),
            look,
            person: s(&m["personId"]),
            team: s(&m["teamId"]),
            session: s(&m["sessionId"]),
            extra: m["extra"].as_array().map(|a| a.iter().map(|v| v.as_str().unwrap()).map(|n| (n.to_owned(), numeric(n))).collect()).unwrap_or_default(),
            on_demand: vec![],
            up_z: axes["up"].as_str().unwrap_or("z") == "z",
            flip: [axes["flipX"].as_bool().unwrap_or(false), axes["flipY"].as_bool().unwrap_or(false), axes["flipZ"].as_bool().unwrap_or(false)],
            scale: axes["scale"].as_f64().unwrap_or(1.0),
        },
        filter,
        stride: c["stride"].as_u64().unwrap_or(1) as usize,
        names: c["files"].as_array().unwrap().iter().map(|f| f.as_str().unwrap().into()).collect(),
        max_sessions: 0,
    }
}

fn b64(s: &str) -> Vec<u8> {
    let val = |c: u8| -> u32 {
        match c {
            b'A'..=b'Z' => (c - b'A') as u32,
            b'a'..=b'z' => (c - b'a' + 26) as u32,
            b'0'..=b'9' => (c - b'0' + 52) as u32,
            b'+' => 62,
            _ => 63,
        }
    };
    let b: Vec<u8> = s.bytes().filter(|&c| c != b'=').collect();
    let mut out = Vec::with_capacity(b.len() * 3 / 4);
    for q in b.chunks(4) {
        let mut n = 0u32;
        for (i, &c) in q.iter().enumerate() {
            n |= val(c) << (18 - 6 * i);
        }
        for i in 0..q.len().saturating_sub(1) {
            out.push((n >> (16 - 8 * i)) as u8);
        }
    }
    out
}

/// A packed column of the expected file as raw little-endian words.
fn words(v: &Value) -> Option<(String, Vec<u8>)> {
    if v.is_null() {
        return None;
    }
    Some((v["type"].as_str().unwrap().to_owned(), b64(v["b64"].as_str().unwrap())))
}

fn bytes<T: Copy>(v: &[T]) -> Vec<u8> {
    // SAFETY: plain numbers.
    unsafe { std::slice::from_raw_parts(v.as_ptr() as *const u8, std::mem::size_of_val(v)) }.to_vec()
}

fn check_col(case: &str, what: &str, want: &Value, got: Option<(&str, Vec<u8>)>, ulps: u32) {
    match (words(want), got) {
        (None, None) => {}
        (Some((t, w)), Some((gt, g))) => {
            assert_eq!(t, gt, "{case}: {what} type");
            assert_eq!(w.len(), g.len(), "{case}: {what} length");
            if w != g {
                assert!(t == "f32" && ulps > 0, "{case}: {what} differs");
                for (i, (a, b)) in w.chunks(4).zip(g.chunks(4)).enumerate() {
                    let a = u32::from_le_bytes(a.try_into().unwrap()) as i64;
                    let b = u32::from_le_bytes(b.try_into().unwrap()) as i64;
                    assert!((a - b).abs() <= ulps as i64, "{case}: {what}[{i}] {} vs {}", f32::from_bits(a as u32), f32::from_bits(b as u32));
                }
            }
        }
        (w, g) => panic!("{case}: {what} present {} vs {}", w.is_some(), g.is_some()),
    }
}

fn f32s(v: &Option<Vec<f32>>) -> Option<(&'static str, Vec<u8>)> {
    v.as_ref().map(|v| ("f32", bytes(v)))
}

fn close(case: &str, what: &str, want: &Value, got: f64) {
    let w = want.as_f64().unwrap_or(f64::NAN);
    assert!(w == got || (w - got).abs() <= 1e-9 * w.abs().max(1.0), "{case}: {what} {w} vs {got}");
}

fn compare(case: &str, e: &Value, b: &Built, failed: &[String]) {
    assert_eq!(e["count"].as_u64().unwrap() as usize, b.rows, "{case}: rows");
    let want_failed: Vec<String> = e["failed"].as_array().unwrap().iter().map(|v| v.as_str().unwrap().into()).collect();
    assert_eq!(want_failed, failed, "{case}: failed files");
    check_col(case, "px", &e["px"], Some(("f32", bytes(&b.x))), 0);
    check_col(case, "py", &e["py"], Some(("f32", bytes(&b.y))), 0);
    check_col(case, "pz", &e["pz"], Some(("f32", bytes(&b.z))), 0);
    check_col(case, "time", &e["time"], f32s(&b.time), 0);
    let look_ulps = if case.contains("vector") { 1 } else { 0 };
    check_col(case, "yaw", &e["yaw"], f32s(&b.yaw), look_ulps);
    check_col(case, "pitch", &e["pitch"], f32s(&b.pitch), look_ulps);
    check_col(case, "personId", &e["personId"], b.person.as_ref().map(|v| ("u32", bytes(v))), 0);
    check_col(case, "teamId", &e["teamId"], b.team.as_ref().map(|v| ("u16", bytes(v))), 0);
    check_col(case, "sessionId", &e["sessionId"], b.session.as_ref().map(|v| ("u32", bytes(v))), 0);
    check_col(case, "sessionRows", &e["sessionRows"], b.session_rows.as_ref().map(|v| ("u32", bytes(v))), 0);
    check_col(case, "sessionStart", &e["sessionStart"], f32s(&b.session_start), 0);
    check_col(case, "sessionEnd", &e["sessionEnd"], f32s(&b.session_end), 0);
    check_col(case, "personTeam", &e["personTeam"], b.person_team.as_ref().map(|v| ("u16", bytes(v))), 0);
    check_col(case, "personSlot", &e["personSlot"], b.person_slot.as_ref().map(|v| ("u16", bytes(v))), 0);
    check_col(case, "teamSizes", &e["teamSizes"], b.team_sizes.as_ref().map(|v| ("u32", bytes(v))), 0);
    check_col(case, "lifetime", &e["lifetime"], f32s(&b.lifetime), 0);
    check_col(case, "personShared", &e["personShared"], b.person_shared.as_ref().map(|v| ("u8", v.clone())), 0);
    let labels = |v: &Value| -> Vec<String> { v.as_array().unwrap().iter().map(|s| s.as_str().unwrap().into()).collect() };
    assert_eq!(labels(&e["personLabels"]), b.person_labels, "{case}: person labels");
    assert_eq!(labels(&e["teamLabels"]), b.team_labels, "{case}: team labels");
    assert_eq!(labels(&e["sessionLabels"]), b.session_labels, "{case}: session labels");
    close(case, "maxLifetimeGap", &e["maxLifetimeGap"], b.max_lifetime_gap);
    close(case, "timeOrigin", &e["timeOrigin"], b.time_origin);
    match b.epoch_ms {
        Some(v) => close(case, "epochMs", &e["epochMs"], v),
        None => assert!(e["epochMs"].is_null(), "{case}: epochMs"),
    }
    close(case, "timeRange[0]", &e["timeRange"][0], b.time_range[0]);
    close(case, "timeRange[1]", &e["timeRange"][1], b.time_range[1]);
    for (k, name) in ["X", "Y", "Z"].iter().enumerate() {
        close(case, &format!("min{name}"), &e["bounds"][format!("min{name}")], b.bounds.min[k]);
        close(case, &format!("max{name}"), &e["bounds"][format!("max{name}")], b.bounds.max[k]);
    }
    assert_eq!(e["recordingsAligned"].as_u64().unwrap() as usize, b.aligned, "{case}: aligned");
    match (&e["series"], &b.series) {
        (Value::Null, None) => {}
        (s, Some(g)) => {
            assert_eq!(s["campaign"].as_str().unwrap(), g.campaign, "{case}: campaign");
            let ss = s["sessions"].as_array().unwrap();
            assert_eq!(ss.len(), g.sessions.len(), "{case}: series sessions");
            for (w, g) in ss.iter().zip(&g.sessions) {
                assert_eq!(w["session"].as_u64().unwrap() as u32, g.session, "{case}: series session");
                close(case, "series start", &w["start"], g.start);
                close(case, "series end", &w["end"], g.end);
                close(case, "series realStart", &w["realStart"], g.real_start);
            }
        }
        (w, g) => panic!("{case}: series {w} vs {}", g.is_some()),
    }
    let attrs = e["attrs"].as_array().unwrap();
    assert_eq!(attrs.iter().map(|a| a["name"].as_str().unwrap().to_owned()).collect::<Vec<_>>(), b.attrs.iter().map(|a| a.name.clone()).collect::<Vec<_>>(), "{case}: attrs");
    for (w, g) in attrs.iter().zip(&b.attrs) {
        let what = format!("attr {}", g.name);
        close(case, &format!("{what} min"), &w["min"], g.min);
        close(case, &format!("{what} max"), &w["max"], g.max);
        match (&w["categories"], &g.categories) {
            (Value::Null, None) => {}
            (c, Some(l)) => assert_eq!(&labels(c), l, "{case}: {what} categories"),
            _ => panic!("{case}: {what} kind"),
        }
        let data = match &g.data {
            Col::F32(v) => ("f32", bytes(v)),
            Col::U32(v) => ("u32", bytes(v)),
            Col::U16(v) => ("u16", bytes(v)),
            Col::U8(v) => ("u8", v.clone()),
        };
        check_col(case, &what, &w["data"], Some(data), 0);
    }
    // The warnings the build decides, as facts.
    let warn = e["warnings"].as_array().unwrap();
    let dropped: Vec<(String, usize)> = warn
        .iter()
        .filter(|w| w["key"] == "data.builder.columnDropped")
        .map(|w| (w["values"]["column"].as_str().unwrap().into(), w["values"]["count"].as_u64().unwrap() as usize))
        .collect();
    assert_eq!(dropped, b.dropped_columns, "{case}: dropped columns");
    let shared = warn.iter().find(|w| w["key"] == "data.builder.sharedNames").map_or(0, |w| w["values"]["shared"]["int"].as_u64().unwrap() as usize);
    assert_eq!(shared, b.shared_count, "{case}: names worn twice");
    let notes = e["notes"].as_array().unwrap();
    let files = notes.iter().find(|w| w["key"] == "data.builder.files").map_or(1, |w| w["values"]["count"].as_u64().unwrap() as usize);
    assert_eq!(files, b.sources.max(1), "{case}: files");
    let rejected = notes.iter().find(|w| w["key"] == "data.builder.rejected").map_or(0, |w| w["values"]["count"].as_u64().unwrap() as usize);
    assert_eq!(rejected, b.rejected, "{case}: rejected");
}

#[test]
fn the_core_builds_what_the_web_builds() {
    let cases: Value = serde_json::from_str(&std::fs::read_to_string(dir().join("cases.json")).unwrap()).unwrap();
    let expected: Value = serde_json::from_str(&std::fs::read_to_string(dir().join("expected.json")).unwrap()).unwrap();
    for c in cases.as_array().unwrap() {
        let name = c["name"].as_str().unwrap();
        let spec = spec_of(c);
        let files: Vec<ParquetFile> = spec.names.iter().map(|f| ParquetFile::open(map(&dir().join(f)).unwrap()).unwrap()).collect();
        let b = build(&files, &spec, &|_, _| {}).unwrap_or_else(|e| panic!("{name}: {e:#}"));
        let failed: Vec<String> = b.files.iter().zip(&spec.names).filter(|(r, _)| r.failure.is_some()).map(|(_, n)| n.clone()).collect();
        compare(name, &expected[name], &b, &failed);
    }
}

/// The same through the protocol: a dataset built, its columns read, its chunks packed.
#[test]
fn the_protocol_hands_a_built_dataset_out() {
    use heat3d_core::service::Core;
    use heat3d_proto::v1::{self, envelope::Body};
    use heat3d_proto::{frame, unframe, PROTOCOL};
    let core = Core::new();
    let ask = |body: Body| -> (v1::Envelope, Vec<u8>) {
        let out = core.handle(&frame(&v1::Envelope { protocol: PROTOCOL, id: 1, body: Some(body), ..Default::default() }, &[]));
        let (env, payload) = unframe(&out).unwrap();
        (env, payload.to_vec())
    };
    let file = |n: &str| v1::FileRef { source: Some(v1::file_ref::Source::Path(dir().join(n).to_string_lossy().into())), member: String::new() };
    let mapping = v1::DatasetMapping {
        x: "x".into(),
        y: "y".into(),
        z: "z".into(),
        time: "time".into(),
        time_unit: "seconds".into(),
        person: "player".into(),
        team: "team".into(),
        up_z: true,
        scale: 1.0,
        extra: vec![v1::ExtraColumn { name: "speed".into(), numeric: true }],
        on_demand: vec![v1::ExtraColumn { name: "gear".into(), numeric: false }],
        ..Default::default()
    };
    let (env, _) = ask(Body::BuildDataset(v1::BuildDataset { files: vec![file("a.parquet")], names: vec!["a.parquet".into()], mapping: Some(mapping), stride: 1, chunk_rows: 128, page_rows: 100, ..Default::default() }));
    let Some(Body::DatasetBuilt(b)) = env.body else { panic!("{:?}", env.body) };
    assert_eq!(b.rows, 297);
    assert_eq!(b.chunks.len(), 3);
    assert_eq!((b.page_step, b.page_rows), (3, 99));
    assert!(b.columns.iter().any(|c| c == "@px") && b.columns.iter().any(|c| c == "speed"));
    // The viewer's copy: every third row.
    let (env, payload) = ask(Body::ReadDatasetColumns(v1::ReadDatasetColumns { handle: b.handle, names: vec!["@px".into(), "@lifetime".into(), "gear".into()], ..Default::default() }));
    let Some(Body::DatasetColumns(c)) = env.body else { panic!() };
    assert_eq!(c.columns.len(), 3);
    assert_eq!(c.columns[0].values.as_ref().unwrap().length, 99 * 4);
    assert_eq!(c.columns[1].values.as_ref().unwrap().length, 99 * 4);
    let gear = &c.columns[2];
    assert_eq!((gear.element.as_str(), gear.numeric), ("u32", false));
    assert_eq!(gear.categories[0], "");
    assert!(payload.len() >= 3 * 99 * 4);
    // A chunk's filter column, and its packed parts.
    let (env, _) = ask(Body::ReadDatasetColumns(v1::ReadDatasetColumns { handle: b.handle, names: vec!["speed".into()], by_chunk: true, chunk: 2, ..Default::default() }));
    let Some(Body::DatasetColumns(c)) = env.body else { panic!() };
    assert_eq!(c.columns[0].values.as_ref().unwrap().length, (297 - 256) * 4);
    for (part, per) in [(v1::ChunkPart::Positions, 8), (v1::ChunkPart::Times, 4)] {
        let (env, _) = ask(Body::ReadChunk(v1::ReadChunk { handle: b.handle, index: 1, part: part as i32, shared: false }));
        let Some(Body::ChunkData(d)) = env.body else { panic!() };
        assert_eq!(d.data.unwrap().length, 128 * per);
    }
}
