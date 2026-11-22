//! Builds heat-tile pyramids the way a session host does and prints what it took.
//!
//!   heat3d-tiles <file|folder>... [--rows N] [--x x --y y] [--level L] [--cache DIR]
//!                [--range col:min:max]... [--set col:a,b]... [--split col:a,b]
//!                [--window time:lo:hi]... [--view N]
//!
//! Builds the pyramid of the filter (cold unless cached), then for every
//! `--window` the pyramid of the filter plus that time range: the first from a
//! full pass, the next ones incrementally from the one before when they can be.
//! `--view N` reads the tiles of a view of N x N leaf tiles plus the coarse
//! levels, decoded, as a client would. `--rows N` repeats the files until N rows.
//! Prints one JSON object per step.

use std::path::PathBuf;
use std::sync::Arc;
use std::time::Instant;

use anyhow::{bail, Result};
use heat3d_core::filter::Clause;
use heat3d_core::memory;
use heat3d_core::parquet::ParquetFile;
use heat3d_core::source::map;
use heat3d_core::tiles::{decode_tile, default_root, tile_id, Split, Status, TileQuery, TileStore};

fn main() -> Result<()> {
    let mut args = std::env::args().skip(1);
    let mut paths: Vec<PathBuf> = Vec::new();
    let mut want: Option<u64> = None;
    let (mut x, mut y) = ("x".to_string(), "y".to_string());
    let mut level = heat3d_core::tiles::DEFAULT_LEVEL;
    let mut cache = default_root();
    let mut filter: Vec<Clause> = Vec::new();
    let mut split: Option<Split> = None;
    let mut windows: Vec<Clause> = Vec::new();
    let mut view = 4u32;
    let range = |v: &str| -> Result<Clause> {
        let p: Vec<&str> = v.split(':').collect();
        if p.len() != 3 {
            bail!("range col:min:max");
        }
        Ok(Clause::Range { column: p[0].into(), min: p[1].parse().ok(), max: p[2].parse().ok() })
    };
    while let Some(a) = args.next() {
        let mut val = || args.next().ok_or_else(|| anyhow::anyhow!("{a} needs a value"));
        match a.as_str() {
            "--rows" => want = Some(val()?.parse()?),
            "--x" => x = val()?,
            "--y" => y = val()?,
            "--level" => level = val()?.parse()?,
            "--cache" => cache = PathBuf::from(val()?),
            "--view" => view = val()?.parse()?,
            "--range" => filter.push(range(&val()?)?),
            "--window" => windows.push(range(&val()?)?),
            "--set" | "--split" => {
                let v = val()?;
                let (c, vals) = v.split_once(':').ok_or_else(|| anyhow::anyhow!("{a} col:a,b"))?;
                let values: Vec<String> = vals.split(',').map(String::from).collect();
                if a == "--set" {
                    filter.push(Clause::Set { column: c.into(), values });
                } else {
                    split = Some(Split { column: c.into(), values });
                }
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
    // Files until `want` rows (footers only).
    let mut files = Vec::new();
    let mut rows = 0u64;
    let mut i = 0;
    loop {
        let p = &paths[i % paths.len()];
        rows += ParquetFile::open(map(p)?)?.rows();
        files.push(p.clone());
        i += 1;
        match want {
            Some(w) if rows < w => continue,
            None if i < paths.len() => continue,
            _ => break,
        }
    }
    let store = Arc::new(TileStore::open(cache, 64 << 30)?);
    let mut queries = vec![filter.clone()];
    for w in &windows {
        let mut f = filter.clone();
        f.push(w.clone());
        queries.push(f);
    }
    for f in queries {
        let q = TileQuery { files: files.clone(), x: x.clone(), y: y.clone(), filter: f.clone(), split: split.clone(), leaf_level: level };
        let t0 = Instant::now();
        let mut st = store.query(q.clone())?;
        let key = q.key();
        let mut first_view_ms = None;
        let was_cached = st.cached;
        if !st.complete {
            // Poll as a client would: the first coarse view as soon as it is readable.
            loop {
                std::thread::sleep(std::time::Duration::from_millis(5));
                let b = store.build_of(&key);
                st = match &b {
                    Some(b) => b.status(),
                    None => store.query(q.clone())?,
                };
                st.cached = was_cached;
                if !st.error.is_empty() {
                    bail!("{}", st.error);
                }
                if first_view_ms.is_none() && (st.estimate_levels > 0 || st.complete) {
                    first_view_ms = Some(t0.elapsed().as_secs_f64() * 1e3);
                }
                if st.complete {
                    break;
                }
            }
        }
        let full_ms = t0.elapsed().as_secs_f64() * 1e3;
        let (tiles, bytes, decode_ms) = read_view(&store, &key, &st, view)?;
        print(&st, rows, files.len(), first_view_ms.unwrap_or(full_ms), full_ms, tiles, bytes, decode_ms, &f)?;
    }
    Ok(())
}

/// A client's view: every tile of levels 0..=3, then `view x view` leaf tiles at the centre.
fn read_view(store: &TileStore, key: &str, st: &Status, view: u32) -> Result<(usize, u64, f64)> {
    let leaf = st.meta.leaf_level;
    let mut ids = Vec::new();
    for l in 0..=leaf.min(3) {
        for y in 0..1u32 << l {
            for x in 0..1u32 << l {
                ids.push(tile_id(l, x, y));
            }
        }
    }
    if leaf > 3 {
        let c = (1u32 << leaf) / 2;
        let h = view / 2;
        for y in c.saturating_sub(h)..(c + h).min(1 << leaf) {
            for x in c.saturating_sub(h)..(c + h).min(1 << leaf) {
                ids.push(tile_id(leaf, x, y));
            }
        }
    }
    let r = store.read(key, &ids, u64::MAX)?;
    let t0 = Instant::now();
    let mut bytes = 0u64;
    for (_, b, _) in &r.tiles {
        bytes += b.len() as u64;
        decode_tile(b)?;
    }
    Ok((r.tiles.len(), bytes, t0.elapsed().as_secs_f64() * 1e3))
}

#[allow(clippy::too_many_arguments)]
fn print(st: &Status, rows: u64, files: usize, first_ms: f64, full_ms: f64, tiles: usize, bytes: u64, decode_ms: f64, f: &[Clause]) -> Result<()> {
    let m = &st.meta;
    let out = serde_json::json!({
        "key": m.key,
        "filter": format!("{f:?}"),
        "how": m.how,
        "cached": st.cached,
        "files": files,
        "rows": rows,
        "rowsCounted": m.rows_counted,
        "leafLevel": m.leaf_level,
        "groups": m.groups,
        "groupsRead": m.groups_read,
        "firstViewMs": first_ms,
        "fullMs": full_ms,
        "buildFirstMs": m.first_ms,
        "buildTotalMs": m.total_ms,
        "pyramidBytes": m.bytes,
        "viewTiles": tiles,
        "viewBytes": bytes,
        "viewDecodeMs": decode_ms,
        "levelMax": m.level_max,
        "peakBytes": memory::peak_bytes(),
        "threads": rayon::current_num_threads(),
    });
    println!("{}", serde_json::to_string(&out)?);
    Ok(())
}
