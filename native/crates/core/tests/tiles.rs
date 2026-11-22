//! Heat tiles on synthetic files: counts equal a brute-force binning, and an
//! incremental (delta) pyramid equals the one built from scratch.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use arrow_array::{Float32Array, Float64Array, RecordBatch, StringArray};
use arrow_schema::{DataType, Field, Schema};
use heat3d_core::filter::Clause;
use heat3d_core::tiles::{decode_tile, tile_id, Split, TileQuery, TileStore, TILE};
use parquet::arrow::ArrowWriter;
use parquet::file::properties::WriterProperties;

struct Rows {
    x: Vec<f32>,
    y: Vec<f32>,
    t: Vec<f64>,
    team: Vec<&'static str>,
}

fn rows(seed: u64, n: usize, t0: f64) -> Rows {
    let mut s = seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
    let mut r = || {
        s ^= s << 13;
        s ^= s >> 7;
        s ^= s << 17;
        (s >> 11) as f64 / (1u64 << 53) as f64
    };
    let mut out = Rows { x: vec![], y: vec![], t: vec![], team: vec![] };
    for i in 0..n {
        out.x.push((r() * 2000.0 - 1000.0) as f32);
        out.y.push((r() * r() * 1500.0 - 700.0) as f32);
        out.t.push(t0 + i as f64 * 0.5);
        out.team.push(if r() < 0.4 { "red" } else { "blue" });
    }
    out
}

fn write(path: &Path, r: &Rows) {
    let schema = Arc::new(Schema::new(vec![
        Field::new("x", DataType::Float32, false),
        Field::new("y", DataType::Float32, false),
        Field::new("time", DataType::Float64, false),
        Field::new("team", DataType::Utf8, false),
    ]));
    let batch = RecordBatch::try_new(
        schema.clone(),
        vec![
            Arc::new(Float32Array::from(r.x.clone())),
            Arc::new(Float32Array::from(r.y.clone())),
            Arc::new(Float64Array::from(r.t.clone())),
            Arc::new(StringArray::from(r.team.clone())),
        ],
    )
    .unwrap();
    let props = WriterProperties::builder().set_max_row_group_row_count(Some(250)).build();
    let mut w = ArrowWriter::try_new(std::fs::File::create(path).unwrap(), schema, Some(props)).unwrap();
    w.write(&batch).unwrap();
    w.close().unwrap();
}

fn leaf_counts(store: &TileStore, key: &str, leaf: u32, channels: usize) -> Vec<u64> {
    let n = TILE << leaf;
    let mut out = vec![0u64; n * n * channels];
    let ids: Vec<u64> = (0..1u32 << leaf).flat_map(|y| (0..1u32 << leaf).map(move |x| tile_id(leaf, x, y))).collect();
    let r = store.read(key, &ids, u64::MAX).unwrap();
    for (_, b, est) in r.tiles {
        assert!(!est);
        let t = decode_tile(&b).unwrap();
        for c in 0..channels {
            for row in 0..TILE {
                for col in 0..TILE {
                    out[c * n * n + (t.y as usize * TILE + row) * n + t.x as usize * TILE + col] += t.cells[c * TILE * TILE + row * TILE + col] as u64;
                }
            }
        }
    }
    out
}

fn wait(store: &Arc<TileStore>, q: &TileQuery) -> heat3d_core::tiles::Status {
    let mut st = store.query(q.clone()).unwrap();
    while !st.complete {
        if let Some(b) = store.build_of(&q.key()) {
            b.wait();
            st = b.status();
        } else {
            st = store.query(q.clone()).unwrap();
        }
        assert!(st.error.is_empty(), "{}", st.error);
    }
    st
}

#[test]
fn pyramid_counts_and_deltas() {
    let dir = std::env::temp_dir().join(format!("heat3d-tiles-test-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    let data: Vec<Rows> = (0..3).map(|i| rows(i + 1, 5000, i as f64 * 10_000.0)).collect();
    let files: Vec<PathBuf> = data
        .iter()
        .enumerate()
        .map(|(i, r)| {
            let p = dir.join(format!("m{i}.parquet"));
            write(&p, r);
            p
        })
        .collect();
    let store = Arc::new(TileStore::open(dir.join("cache"), 1 << 30).unwrap());
    // "red" listed: blue rows go to the other channel.
    let split = Some(Split { column: "team".into(), values: vec!["red".into()] });
    let q = |filter: Vec<Clause>| TileQuery { files: files.clone(), x: "x".into(), y: "y".into(), filter, split: split.clone(), leaf_level: 1 };

    // Full: every row in its cell and channel.
    let all = wait(&store, &q(vec![]));
    assert_eq!(all.meta.how, "full");
    assert_eq!(all.meta.rows_counted, 15_000);
    assert_eq!((all.meta.channels, all.meta.other, all.meta.channel_names.clone()), (2, true, vec!["red".to_string(), String::new()]));
    let m = &all.meta;
    let n = TILE << m.leaf_level;
    let brute = |lo: f64, hi: f64| {
        let mut v = vec![0u64; n * n * 2];
        for r in &data {
            for i in 0..r.x.len() {
                if r.t[i] < lo || r.t[i] > hi {
                    continue;
                }
                let cx = ((r.x[i] as f64 - m.x0) * n as f64 / m.size).floor() as usize;
                let cy = ((r.y[i] as f64 - m.y0) * n as f64 / m.size).floor() as usize;
                let c = if r.team[i] == "red" { 0 } else { 1 };
                v[c * n * n + cy * n + cx] += 1;
            }
        }
        v
    };
    assert_eq!(leaf_counts(&store, &m.key, m.leaf_level, 2), brute(f64::NEG_INFINITY, f64::INFINITY));
    // Level 0 sums to every row.
    let r0 = store.read(&m.key, &[tile_id(0, 0, 0)], u64::MAX).unwrap();
    let t0 = decode_tile(&r0.tiles[0].1).unwrap();
    assert_eq!(t0.cells.iter().map(|&v| v as u64).sum::<u64>(), 15_000);

    // A time window inside the second file: a pass over the groups it may keep only.
    let w = |lo: f64, hi: f64| vec![Clause::Range { column: "time".into(), min: Some(lo), max: Some(hi) }];
    let a = wait(&store, &q(w(10_400.0, 11_900.0)));
    assert_eq!(a.meta.how, "full");
    assert!(a.meta.groups_read < a.meta.groups / 3, "read {} of {}", a.meta.groups_read, a.meta.groups);
    assert_eq!(leaf_counts(&store, &a.meta.key, a.meta.leaf_level, 2), brute(10_400.0, 11_900.0));
    // Moved: incrementally from the cached window, only the groups at the moved edge read.
    let b = wait(&store, &q(w(10_600.0, 11_900.0)));
    assert_eq!(b.meta.how, "delta");
    assert!(b.meta.groups_read <= 3, "read {}", b.meta.groups_read);
    assert_eq!(leaf_counts(&store, &b.meta.key, b.meta.leaf_level, 2), brute(10_600.0, 11_900.0));
    // Asked again: cached.
    let again = store.query(q(w(10_600.0, 11_900.0))).unwrap();
    assert!(again.cached && again.complete && again.meta.how == "delta");

    // No values listed: the column's values found in the rows, sorted, then the other channel (empty here).
    let auto = TileQuery { split: Some(Split { column: "team".into(), values: vec![] }), ..q(vec![]) };
    let st = wait(&store, &auto);
    assert_eq!(st.meta.channel_names, vec!["blue".to_string(), "red".to_string(), String::new()]);
    let c = leaf_counts(&store, &st.meta.key, st.meta.leaf_level, 3);
    let plane = n * n;
    let b = brute(f64::NEG_INFINITY, f64::INFINITY);
    assert_eq!(&c[..plane], &b[plane..]);
    assert_eq!(&c[plane..2 * plane], &b[..plane]);
    assert!(c[2 * plane..].iter().all(|&v| v == 0));
    let _ = std::fs::remove_dir_all(&dir);
}

/// The tile both builds read (`native/vectors/tiles/tile.bin`, `src/render/heatTiles/tileFormat.test.ts`):
/// level 3, tile (2, 5), two channels, a u32 cell; `UPDATE_VECTORS=1` writes it again.
#[test]
fn shared_tile_vector() {
    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../vectors/tiles/tile.bin");
    let mut cells = vec![0u32; TILE * TILE * 2];
    cells[1] = 3;
    cells[TILE + 2] = 70_000;
    cells[TILE * TILE + 1] = 4;
    if std::env::var_os("UPDATE_VECTORS").is_some() {
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(&path, heat3d_core::tiles::encode_tile(3, 2, 5, 2, &cells, false)).unwrap();
    }
    let t = decode_tile(&std::fs::read(&path).expect("native/vectors/tiles/tile.bin (UPDATE_VECTORS=1 writes it)")).unwrap();
    assert_eq!((t.level, t.x, t.y, t.channels, t.max, t.estimate), (3, 2, 5, 2, 70_000, false));
    assert_eq!(t.cells, cells);
}
