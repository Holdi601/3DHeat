//! Reads Parquet files the way the native app does and prints what it took.
//!
//!   heat3d-ingest <file|folder>... [--rows N] [--x x --y y --z z --time time --person player --group team]
//!                 [--range col:min:max]... [--set col:a,b]... [--stride N] [--no-chunks]
//!
//! `--rows N` takes files (repeating them when there are too few) until N rows,
//! for measuring loads larger than the folder. Prints one JSON object: rows,
//! seconds per phase and peak memory.

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
