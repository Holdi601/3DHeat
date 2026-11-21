//! Reads Parquet files the way the native app does and prints what it took.
//!
//!   heat3d-ingest <file|folder>... [--rows N] [--x x --y y --z z --time time --person player --group team]
//!                 [--range col:min:max]... [--set col:a,b]... [--stride N] [--no-chunks]
//!                 [--dataset [--page-rows N]]
//!
//! `--rows N` takes files (repeating them when there are too few) until N rows,
//! for measuring loads larger than the folder. Prints one JSON object: rows,
//! seconds per phase and peak memory. `--dataset` builds the viewer's whole
//! dataset the way the app does (`build`, `dataset`: merge, time, sort, extent,
//! roster, lifetimes) and packs every chunk, instead of the bare chunk layout.

use std::path::PathBuf;
use std::time::Instant;

use anyhow::{bail, Result};
use heat3d_core::bulk::{load, BulkSpec};
use heat3d_core::chunks::{build, CHUNK_ROWS};
use heat3d_core::filter::Clause;
use heat3d_core::memory;
use heat3d_core::parquet::ParquetFile;
use heat3d_core::source::map;

fn main() -> Result<()> {
    let mut args = std::env::args().skip(1);
    let mut paths: Vec<PathBuf> = Vec::new();
    let mut want: Option<u64> = None;
    let mut spec = BulkSpec {
        x: Some("x".into()),
        y: Some("y".into()),
        z: Some("z".into()),
        time: Some("time".into()),
        person: Some("player".into()),
        group: Some("team".into()),
        time_scale: 1.0,
        ..Default::default()
    };
    let mut chunks = true;
    let mut dataset = false;
    let mut page_rows = 0usize;
    while let Some(a) = args.next() {
        let mut val = || args.next().ok_or_else(|| anyhow::anyhow!("{a} needs a value"));
        match a.as_str() {
            "--rows" => want = Some(val()?.parse()?),
            "--x" => spec.x = Some(val()?),
            "--y" => spec.y = Some(val()?),
            "--z" => spec.z = Some(val()?),
            "--time" => spec.time = Some(val()?),
            "--person" => spec.person = Some(val()?),
            "--group" => spec.group = Some(val()?),
            "--stride" => spec.stride = val()?.parse()?,
            "--no-chunks" => chunks = false,
            "--dataset" => dataset = true,
            "--page-rows" => page_rows = val()?.parse()?,
            "--range" => {
                let v = val()?;
                let p: Vec<&str> = v.split(':').collect();
                if p.len() != 3 {
                    bail!("--range col:min:max");
                }
                spec.filter.push(Clause::Range { column: p[0].into(), min: p[1].parse().ok(), max: p[2].parse().ok() });
            }
            "--set" => {
                let v = val()?;
                let (c, vals) = v.split_once(':').ok_or_else(|| anyhow::anyhow!("--set col:a,b"))?;
                spec.filter.push(Clause::Set { column: c.into(), values: vals.split(',').map(String::from).collect() });
            }
            _ if a.starts_with("--") => bail!("unknown option {a}"),
            _ => {
                let p = PathBuf::from(&a);
                if p.is_dir() {
                    let mut v: Vec<PathBuf> = std::fs::read_dir(&p)?
                        .filter_map(|e| e.ok().map(|e| e.path()))
                        .filter(|p| p.extension().is_some_and(|e| e == "parquet"))
                        .collect();
                    v.sort();
                    paths.extend(v);
                } else {
                    paths.push(p);
                }
            }
        }
    }
    if paths.is_empty() {
        bail!("no files");
    }
    let t0 = Instant::now();
    let mut files = Vec::new();
    let mut rows = 0u64;
    let mut i = 0;
    loop {
        let f = ParquetFile::open(map(&paths[i % paths.len()])?)?;
        rows += f.rows();
        files.push(f);
        i += 1;
        match want {
            Some(w) if rows < w => continue,
            None if i < paths.len() => continue,
            _ => break,
        }
    }
    let open_ms = t0.elapsed().as_secs_f64() * 1e3;
    if dataset {
        return build_dataset(files, &spec, open_ms, t0, page_rows);
    }
    let bulk = load(&files, &spec)?;
    let after_read = memory::peak_bytes();
    let n = bulk.rows.len();
    let mut out = serde_json::json!({
        "files": files.len(),
        "rowsRead": bulk.rows_read,
        "rows": n,
        "threads": rayon::current_num_threads(),
        "openMs": open_ms,
        "readMs": bulk.read_ms,
        "peakAfterReadBytes": after_read,
        "people": bulk.person_count,
        "groups": bulk.group_labels.len(),
    });
    if chunks {
        let set = build(bulk.rows, CHUNK_ROWS);
        let o = out.as_object_mut().unwrap();
        o.insert("chunks".into(), set.chunks.len().into());
        o.insert("sortMs".into(), set.timing.sort_ms.into());
        o.insert("lifetimeMs".into(), set.timing.lifetime_ms.into());
        o.insert("packMs".into(), set.timing.pack_ms.into());
        o.insert("maxLifetimeGap".into(), (set.max_lifetime_gap as f64).into());
        let bytes: usize = set.chunks.iter().map(|c| (c.positions.len() + c.times.len()) * 4).sum();
        o.insert("chunkBytes".into(), bytes.into());
    }
    let o = out.as_object_mut().unwrap();
    o.insert("totalMs".into(), (t0.elapsed().as_secs_f64() * 1e3).into());
    o.insert("peakBytes".into(), memory::peak_bytes().into());
    o.insert("memoryBytes".into(), memory::total_bytes().into());
    println!("{}", serde_json::to_string_pretty(&out)?);
    Ok(())
}

/// The viewer's dataset, built and packed as the app builds it.
fn build_dataset(files: Vec<ParquetFile>, spec: &heat3d_core::bulk::BulkSpec, open_ms: f64, t0: Instant, page_rows: usize) -> Result<()> {
    use heat3d_core::build::{build, BuildSpec, Mapping};
    use heat3d_core::dataset::Dataset;
    let names: Vec<String> = (0..files.len()).map(|i| format!("file{i}.parquet")).collect();
    let bs = BuildSpec {
        mapping: Mapping {
            x: spec.x.clone(),
            y: spec.y.clone(),
            z: spec.z.clone(),
            time: spec.time.clone(),
            time_unit: "seconds".into(),
            person: spec.person.clone(),
            team: spec.group.clone(),
            up_z: true,
            scale: 1.0,
            ..Default::default()
        },
        filter: spec.filter.clone(),
        stride: spec.stride.max(1),
        names,
        max_sessions: 0,
    };
    let count = files.len();
    let b = build(&files, &bs, &|_, _| {})?;
    let timing = b.timing.clone();
    let (rows, people) = (b.rows, b.person_labels.len());
    let after_build = memory::peak_bytes();
    let t1 = Instant::now();
    let (ds, _, _) = Dataset::new(b, files, bs, CHUNK_ROWS, page_rows);
    let infos_ms = t1.elapsed().as_secs_f64() * 1e3;
    // Every chunk packed once, as the window asks for them, one at a time.
    let t2 = Instant::now();
    let mut bytes = 0usize;
    let mut buf: Vec<u32> = Vec::new();
    for i in 0..ds.chunks.len() {
        for times in [false, true] {
            let Ok(n) = ds.chunk_bytes(i, times) else { continue };
            buf.resize(n / 4, 0);
            ds.pack(i, times, &mut buf)?;
            bytes += n;
        }
    }
    let pack_ms = t2.elapsed().as_secs_f64() * 1e3;
    let out = serde_json::json!({
        "mode": "dataset",
        "files": count,
        "rows": rows,
        "people": people,
        "threads": rayon::current_num_threads(),
        "openMs": open_ms,
        "readMs": timing.read_ms,
        "mergeMs": timing.merge_ms,
        "sortMs": timing.sort_ms,
        "lifetimeMs": timing.lifetime_ms,
        "buildMs": timing.total_ms,
        "chunkInfoMs": infos_ms,
        "packMs": pack_ms,
        "chunks": ds.chunks.len(),
        "chunkBytes": bytes,
        "pageRows": ds.page_rows(),
        "peakAfterBuildBytes": after_build,
        "totalMs": t0.elapsed().as_secs_f64() * 1e3,
        "peakBytes": memory::peak_bytes(),
        "memoryBytes": memory::total_bytes(),
    });
    println!("{}", serde_json::to_string_pretty(&out)?);
    Ok(())
}
