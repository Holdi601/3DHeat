//! A whole selection of Parquet files read into the engine's chunk layout in one
//! go: every file and every row group on its own core, straight into arrays sized
//! once, then sorted and packed (`chunks`). This is the path that has no tab to
//! fit in; the viewer's own load (`service` `ReadColumns`) reads file by file.

use std::time::Instant;

use anyhow::{anyhow, Result};
use rayon::prelude::*;

use crate::chunks::Rows;
use crate::filter::Clause;
use crate::parquet::{Kind, Out, ParquetFile, Spec};
use crate::table::Dict;

#[derive(Debug, Clone, Default)]
pub struct BulkSpec {
    pub x: Option<String>,
    pub y: Option<String>,
    pub z: Option<String>,
    pub time: Option<String>,
    pub person: Option<String>,
    pub group: Option<String>,
    /// Seconds per unit of the time column.
    pub time_scale: f64,
    pub filter: Vec<Clause>,
    pub stride: usize,
}

pub struct Bulk {
    pub rows: Rows,
    pub rows_read: u64,
    pub group_labels: Vec<String>,
    pub person_count: usize,
    /// What `time` counts from, in the source's seconds.
    pub time_origin: f64,
    pub read_ms: f64,
}

/// Files read at once; each spreads its row groups over every core as well.
const FILES_AT_ONCE: usize = 8;

pub fn load(files: &[ParquetFile], spec: &BulkSpec) -> Result<Bulk> {
    let t0 = Instant::now();
    let step = spec.stride.max(1);
    let scale = if spec.time_scale > 0.0 { spec.time_scale } else { 1.0 };
    let filtering = !crate::filter::active(&spec.filter).is_empty();
    // Rows each file keeps: the footer's count, or the filter's from its columns alone.
    let kept: Vec<u64> = if filtering {
        files.par_iter().map(|f| f.count(&spec.filter).map(|s| s.kept)).collect::<Result<_>>()?
    } else {
        files.iter().map(|f| f.rows()).collect()
    };
    let after_stride: Vec<usize> = kept.iter().map(|&k| (k as usize).div_ceil(step)).collect();
    let n: usize = after_stride.iter().sum();
    let rows_read: u64 = files.iter().map(|f| f.rows()).sum();

    // The time origin from the footers' statistics, so float32 keeps its precision.
    let origin = spec.time.as_ref().map_or(0.0, |t| files.iter().filter_map(|f| f.min_of(t)).fold(f64::INFINITY, f64::min));
    let origin = if origin.is_finite() { origin } else { 0.0 };

    let mut x = vec![0f32; n];
    let mut y = vec![0f32; n];
    let mut z = vec![0f32; n];
    let mut time = spec.time.as_ref().map(|_| vec![0f32; n]);
    let mut person = spec.person.as_ref().map(|_| vec![0u32; n]);
    let mut group = spec.group.as_ref().map(|_| vec![0u16; n]);

    let mut specs = Vec::new();
    let mut slot = |name: &Option<String>, kind| -> Option<usize> {
        name.as_ref().map(|c| {
            specs.push(Spec { name: c.clone(), kind });
            specs.len() - 1
        })
    };
    let sx = slot(&spec.x, Kind::F32);
    let sy = slot(&spec.y, Kind::F32);
    let sz = slot(&spec.z, Kind::F32);
    let st = slot(&spec.time, Kind::F64);
    let sp = slot(&spec.person, Kind::Dict);
    let sg = slot(&spec.group, Kind::Dict);

    // Each file's share of every array.
    let mut people: Vec<Option<Dict>> = (0..files.len()).map(|_| None).collect();
    let mut groups: Vec<Option<Dict>> = (0..files.len()).map(|_| None).collect();
    {
        let mut parts = Vec::with_capacity(files.len());
        let (mut rx, mut ry, mut rz) = (&mut x[..], &mut y[..], &mut z[..]);
        let mut rt = time.as_deref_mut();
        let mut rp = person.as_deref_mut();
        let mut rg = group.as_deref_mut();
        let mut pi = people.iter_mut();
        let mut gi = groups.iter_mut();
        for (i, &len) in after_stride.iter().enumerate() {
            let (ax, bx) = rx.split_at_mut(len);
            let (ay, by) = ry.split_at_mut(len);
            let (az, bz) = rz.split_at_mut(len);
            rx = bx;
            ry = by;
            rz = bz;
            let at = rt.take().map(|r| {
                let (a, b) = r.split_at_mut(len);
                rt = Some(b);
                a
            });
            let ap = rp.take().map(|r| {
                let (a, b) = r.split_at_mut(len);
                rp = Some(b);
                a
            });
            let ag = rg.take().map(|r| {
                let (a, b) = r.split_at_mut(len);
                rg = Some(b);
                a
            });
            parts.push((i, ax, ay, az, at, ap, ag, pi.next().unwrap(), gi.next().unwrap()));
        }
        let mut parts = parts.into_iter();
        loop {
            let batch: Vec<_> = parts.by_ref().take(FILES_AT_ONCE).collect();
            if batch.is_empty() {
                break;
            }
            batch.into_par_iter().try_for_each(|(i, ax, ay, az, at, ap, ag, pd, gd)| -> Result<()> {
                let r = files[i].read(&specs, &spec.filter, false)?;
                let mut cols = r.columns;
                let mut take = |s: Option<usize>| s.map(|k| std::mem::replace(&mut cols[k], Out::F32(Vec::new())));
                let pick = |o: &Out, out: &mut [f32]| {
                    if let Out::F32(v) = o {
                        for (d, s) in out.iter_mut().zip(v.iter().step_by(step)) {
                            *d = *s;
                        }
                    }
                };
                if let Some(o) = take(sx) {
                    pick(&o, ax);
                }
                if let Some(o) = take(sy) {
                    pick(&o, ay);
                }
                if let Some(o) = take(sz) {
                    pick(&o, az);
                }
                if let (Some(Out::F64(v)), Some(out)) = (take(st), at) {
                    for (d, s) in out.iter_mut().zip(v.iter().step_by(step)) {
                        *d = ((s - origin) * scale) as f32;
                    }
                }
                if let (Some(Out::Dict(d)), Some(out)) = (take(sp), ap) {
                    for (o, s) in out.iter_mut().zip(d.ids.iter().step_by(step)) {
                        *o = *s;
                    }
                    *pd = Some(d);
                }
                if let (Some(Out::Dict(d)), Some(out)) = (take(sg), ag) {
                    for (o, s) in out.iter_mut().zip(d.ids.iter().step_by(step)) {
                        *o = (*s).min(65535) as u16;
                    }
                    *gd = Some(d);
                }
                Ok(())
            })?;
        }
    }

    // One dictionary across the files, in file order: ids remapped in place.
    let mut offsets = vec![0usize; files.len() + 1];
    for (i, &l) in after_stride.iter().enumerate() {
        offsets[i + 1] = offsets[i] + l;
    }
    let mut all_people = Dict::new();
    let mut person_count = 0;
    if let Some(p) = person.as_mut() {
        let remaps: Vec<Vec<u32>> =
            people.iter().map(|d| d.as_ref().map_or(Vec::new(), |d| d.labels.iter().map(|l| all_people.intern(l)).collect())).collect();
        person_count = all_people.labels.len();
        let mut rest = &mut p[..];
        let mut slices = Vec::new();
        for &l in &after_stride {
            let (a, b) = rest.split_at_mut(l);
            slices.push(a);
            rest = b;
        }
        slices.into_par_iter().zip(remaps.par_iter()).for_each(|(s, m)| {
            if !m.is_empty() {
                s.iter_mut().for_each(|v| *v = m[*v as usize]);
            }
        });
    }
    let mut all_groups = Dict::new();
    if let Some(g) = group.as_mut() {
        let remaps: Vec<Vec<u32>> =
            groups.iter().map(|d| d.as_ref().map_or(Vec::new(), |d| d.labels.iter().map(|l| all_groups.intern(l)).collect())).collect();
        let mut rest = &mut g[..];
        let mut slices = Vec::new();
        for &l in &after_stride {
            let (a, b) = rest.split_at_mut(l);
            slices.push(a);
            rest = b;
        }
        slices.into_par_iter().zip(remaps.par_iter()).for_each(|(s, m)| {
            if !m.is_empty() {
                s.iter_mut().for_each(|v| *v = m[*v as usize].min(65535) as u16);
            }
        });
    }
    if n == 0 && rows_read > 0 && !filtering {
        return Err(anyhow!("no rows read"));
    }
    Ok(Bulk {
        rows: Rows { x, y, z, time, person, group },
        rows_read,
        group_labels: all_groups.labels,
        person_count,
        time_origin: origin,
        read_ms: t0.elapsed().as_secs_f64() * 1e3,
    })
}
