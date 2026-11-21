//! The engine's GPU chunk layout, built natively.
//!
//! Exactly what `WebgpuRenderer.flushDataUpload` (src/render/webgpu/renderer.ts)
//! packs from a dataset: rows in time order, cut into chunks of `CHUNK_ROWS`, each
//! quantised against its own box and time span:
//!   positions: two u32 per row, `x | y << 16` and `z | group << 16`;
//!   times:     one u32 per row, `time | lifetime << 16`, 65535 for no lifetime.
//! A lifetime is the gap to the person's next sample (`computeLifetimes` in
//! src/data/builder.ts), none where the next sample is at the same instant
//! somewhere else.

use std::time::Instant;

use rayon::prelude::*;

use crate::sort::{is_ascending, order_by_time};

/// Rows per chunk, as `CHUNK_ROWS` in src/render/types.ts.
pub const CHUNK_ROWS: usize = 1 << 23;

/// Columns in load order.
#[derive(Default)]
pub struct Rows {
    pub x: Vec<f32>,
    pub y: Vec<f32>,
    pub z: Vec<f32>,
    /// Seconds, rebased so float32 holds them precisely.
    pub time: Option<Vec<f32>>,
    pub person: Option<Vec<u32>>,
    pub group: Option<Vec<u16>>,
}

impl Rows {
    pub fn len(&self) -> usize {
        self.x.len()
    }

    pub fn is_empty(&self) -> bool {
        self.x.is_empty()
    }
}

#[derive(Debug, Clone)]
pub struct Chunk {
    pub start: usize,
    pub rows: usize,
    pub aabb_min: [f32; 3],
    pub aabb_size: [f32; 3],
    pub time_min: f32,
    pub time_scale: f32,
    pub life_scale: f32,
    pub positions: Vec<u32>,
    pub times: Vec<u32>,
}

#[derive(Debug, Default, Clone, Copy)]
pub struct BuildTiming {
    pub sort_ms: f64,
    pub lifetime_ms: f64,
    pub pack_ms: f64,
}

pub struct ChunkSet {
    pub rows: usize,
    pub time_min: f64,
    pub time_max: f64,
    pub max_lifetime_gap: f32,
    pub chunks: Vec<Chunk>,
    pub timing: BuildTiming,
}

#[inline]
fn clamp_u16(v: f64) -> u32 {
    // `clampU16`: `(v + 0.5) | 0` within [0, 65535].
    if v < 0.0 {
        0
    } else if v > 65535.0 {
        65535
    } else {
        (v + 0.5) as u32
    }
}

/// Sorts, computes lifetimes and packs. Consumes the columns to free them as it goes.
pub fn build(rows: Rows, chunk_rows: usize) -> ChunkSet {
    let n = rows.len();
    let chunk_rows = if chunk_rows == 0 { CHUNK_ROWS } else { chunk_rows };
    let mut timing = BuildTiming::default();

    let t0 = Instant::now();
    let (order, time) = match &rows.time {
        Some(t) if !is_ascending(t) => {
            let (o, s) = order_by_time(t);
            (Some(o), Some(s))
        }
        Some(t) => (None, Some(t.clone())),
        None => (None, None),
    };
    let Rows { x, y, z, person, group, .. } = rows;
    let at = |r: usize| -> usize { order.as_ref().map_or(r, |o| o[r] as usize) };
    timing.sort_ms = t0.elapsed().as_secs_f64() * 1e3;

    // Lifetimes, in sorted order. Each core takes a run of rows and joins each
    // person's samples within it; the runs are then stitched person by person.
    // Where there are too many people for a table per run, a second sort instead.
    let t1 = Instant::now();
    let mut life: Vec<f32> = Vec::new();
    let mut max_gap = 0f32;
    if let (Some(t), Some(p)) = (&time, &person) {
        life = vec![-1f32; n];
        let joins = |a: usize, b: usize| -> Option<f32> {
            let gap = t[b] - t[a];
            let (ia, ib) = (at(a), at(b));
            if gap == 0.0 && (x[ia] != x[ib] || y[ia] != y[ib] || z[ia] != z[ib]) {
                return None;
            }
            Some(gap)
        };
        let people = p.par_iter().copied().max().map_or(0, |m| m as usize + 1);
        let runs = rayon::current_num_threads().max(1);
        if people <= (n / runs / 4).max(1 << 16) {
            let len = n.div_ceil(runs).max(1);
            const NONE: u32 = u32::MAX;
            let ends: Vec<(Vec<u32>, Vec<u32>, f32)> = life
                .par_chunks_mut(len)
                .enumerate()
                .map(|(k, out)| {
                    let base = k * len;
                    let mut first = vec![NONE; people];
                    let mut last = vec![NONE; people];
                    let mut mx = 0f32;
                    for (o, r) in (base..base + out.len()).enumerate() {
                        let q = p[at(r)] as usize;
                        let prev = last[q];
                        if prev == NONE {
                            first[q] = r as u32;
                        } else if let Some(g) = joins(prev as usize, r) {
                            out[prev as usize - base] = g;
                            mx = mx.max(g);
                        }
                        last[q] = r as u32;
                        let _ = o;
                    }
                    (first, last, mx)
                })
                .collect();
            let mut carry = vec![NONE; people];
            for (first, last, mx) in &ends {
                max_gap = max_gap.max(*mx);
                for q in 0..people {
                    if first[q] != NONE && carry[q] != NONE {
                        if let Some(g) = joins(carry[q] as usize, first[q] as usize) {
                            life[carry[q] as usize] = g;
                            max_gap = max_gap.max(g);
                        }
                    }
                    if last[q] != NONE {
                        carry[q] = last[q];
                    }
                }
            }
        } else {
            let mut keys: Vec<u64> = (0..n).into_par_iter().map(|r| ((p[at(r)] as u64) << 32) | r as u64).collect();
            keys.par_sort_unstable();
            let gaps: Vec<(u32, f32)> = keys
                .par_windows(2)
                .filter_map(|w| {
                    if (w[0] >> 32) != (w[1] >> 32) {
                        return None;
                    }
                    let a = w[0] as u32 as usize;
                    joins(a, w[1] as u32 as usize).map(|g| (a as u32, g))
                })
                .collect();
            drop(keys);
            for &(a, g) in &gaps {
                life[a as usize] = g;
                max_gap = max_gap.max(g);
            }
        }
    }
    timing.lifetime_ms = t1.elapsed().as_secs_f64() * 1e3;

    let t2 = Instant::now();
    let starts: Vec<usize> = (0..n).step_by(chunk_rows).collect();
    let chunks: Vec<Chunk> = starts
        .par_iter()
        .map(|&start| {
            let rows = chunk_rows.min(n - start);
            let mut mn = [f64::INFINITY; 3];
            let mut mx = [f64::NEG_INFINITY; 3];
            for r in start..start + rows {
                let i = at(r);
                for (k, v) in [x[i], y[i], z[i]].into_iter().enumerate() {
                    let v = v as f64;
                    if v < mn[k] {
                        mn[k] = v;
                    }
                    if v > mx[k] {
                        mx[k] = v;
                    }
                }
            }
            let size: Vec<f64> = (0..3).map(|k| (mx[k] - mn[k]).max(1e-6)).collect();
            let s: Vec<f64> = size.iter().map(|d| 65535.0 / d).collect();
            let mut positions = Vec::with_capacity(rows * 2);
            for r in start..start + rows {
                let i = at(r);
                let g = group.as_ref().map_or(0, |g| g[i] as u32);
                positions.push(clamp_u16((x[i] as f64 - mn[0]) * s[0]) | (clamp_u16((y[i] as f64 - mn[1]) * s[1]) << 16));
                positions.push(clamp_u16((z[i] as f64 - mn[2]) * s[2]) | (g << 16));
            }
            let (mut time_min, mut time_scale, mut life_scale, mut times) = (0f32, 1f32, 1f32, Vec::new());
            if let Some(t) = &time {
                if !life.is_empty() {
                    let t_min = t[start] as f64;
                    let span = (t[start + rows - 1] as f64 - t_min).max(1e-6);
                    let cap = (max_gap as f64).max(1e-6);
                    let (inv_t, inv_l) = (65535.0 / span, 65534.0 / cap);
                    times = (start..start + rows)
                        .map(|r| {
                            let q = clamp_u16((t[r] as f64 - t_min) * inv_t);
                            let l = life[r];
                            let ql = if l < 0.0 { 65535 } else { clamp_u16(l as f64 * inv_l).min(65534) };
                            q | (ql << 16)
                        })
                        .collect();
                    time_min = t_min as f32;
                    time_scale = (span / 65535.0) as f32;
                    life_scale = (cap / 65534.0) as f32;
                }
            }
            Chunk {
                start,
                rows,
                aabb_min: [mn[0] as f32, mn[1] as f32, mn[2] as f32],
                aabb_size: [size[0] as f32, size[1] as f32, size[2] as f32],
                time_min,
                time_scale,
                life_scale,
                positions,
                times,
            }
        })
        .collect();
    timing.pack_ms = t2.elapsed().as_secs_f64() * 1e3;
    let (time_min, time_max) = match &time {
        Some(t) if n > 0 => (t[0] as f64, t[n - 1] as f64),
        _ => (0.0, 0.0),
    };
    ChunkSet { rows: n, time_min, time_max, max_lifetime_gap: max_gap, chunks, timing }
}

/// A chunk part as little-endian bytes.
pub fn le_bytes(words: &[u32]) -> Vec<u8> {
    let mut out = Vec::with_capacity(words.len() * 4);
    for w in words {
        out.extend_from_slice(&w.to_le_bytes());
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn packs_like_the_engine() {
        let rows = Rows {
            x: vec![0.0, 10.0, 5.0, 2.5],
            y: vec![0.0, 0.0, 1.0, 1.0],
            z: vec![0.0, 0.0, 0.0, 0.0],
            time: Some(vec![3.0, 0.0, 1.0, 2.0]),
            person: Some(vec![0, 0, 1, 0]),
            group: Some(vec![2, 1, 0, 3]),
        };
        let set = build(rows, 2);
        assert_eq!(set.chunks.len(), 2);
        // Sorted: rows 1 (t0,p0), 2 (t1,p1), 3 (t2,p0), 0 (t3,p0).
        let c0 = &set.chunks[0];
        assert_eq!(c0.aabb_min, [5.0, 0.0, 0.0]);
        assert_eq!(c0.positions, [65535, 1 << 16, 65535 << 16, 0]);
        // Person 0: gaps 2 (t0->t2) and 1 (t2->t3), max 2.
        assert_eq!(set.max_lifetime_gap, 2.0);
        assert_eq!(c0.times[0] >> 16, 65534);
        assert_eq!(c0.times[1] >> 16, 65535);
        assert_eq!(set.chunks[1].times[1] >> 16, 65535);
        assert_eq!(set.chunks[1].times[0] >> 16, 32767);
    }
}
