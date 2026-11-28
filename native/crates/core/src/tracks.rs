//! The GPU tracks' keys built by the core over every row it holds: what the page's
//! `buildSteps` (`src/render/gpuTracks/store.ts`) builds from its own copy, which for a large
//! load is every `page_step`-th row only. Ported step for step, the same numbers on the same
//! rows (`native/vectors/tracks`, checked by `tests/track_vectors.rs` here and
//! `src/render/gpuTracks/coreKeys.test.ts` on the page):
//!
//! - each person's own position samples in time order (an events column's other rows and rows
//!   with no position left out, `positionRows`);
//! - samples that only hold a moving unit's last position marked (`heldSamples`);
//! - lossless (every sample but doubled times) when the keys fit `max_keys`, else the first of
//!   the tolerances whose dead-reckoning test brings them under it;
//! - keys in 16 bits across their chunk's span (`CHUNK_KEYS` keys, `chunkSpan`, q16), the
//!   attitude as a quaternion in four signed bytes from yaw, pitch and roll (`poseFrame`,
//!   `quatOfFrame`), a gap bit on the key before each gap in the samples (`markGaps`);
//! - each person's key range, chunk spans' offset, span of its keys and first and last key time,
//!   for the page's track table (kinds, meshes, colours, hold, dead span stay the page's).
//!
//! Every person's work is its own, so it runs on all cores. JavaScript's number rules are kept
//! where they decide a value: `Math.round` rounds halves up, `Math.min`/`max` pass NaN on and
//! order signed zeros, `Math.hypot` is V8's, and sin/cos are fdlibm's (`libm`).

use rayon::prelude::*;

/// Keys a chunk span holds, and the u32 of one (origin x, y, z, step, first time, time step, two spare).
pub const CHUNK_SHIFT: u32 = 6;
pub const CHUNK_KEYS: usize = 1 << CHUNK_SHIFT;
pub const CHUNK_U32: usize = 8;
/// A key's two u32: x | y << 16, z | t << 16.
pub const KEY_U32: usize = 2;
/// In a key's attitude word: a gap follows the key.
pub const GAP_BIT: u32 = 0x8000_0000;
/// Words a person's entry takes in `TrackKeys::person_words`.
pub const PERSON_U32: usize = 12;
/// A person's entry flag: its samples have gaps.
pub const PERSON_GAPS: u32 = 1;

const STEPS: f64 = 65535.0;
const MAX_GAP: f64 = 4.0;
const TOLERANCES: [f64; 8] = [0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0];
const GAP_MIN_S: f64 = 1.5;
const GAP_FACTOR: f64 = 4.0;
const GAP_MOVED_M: f64 = 1.0;

/// The rows the keys are made from: the core's role columns (and the page's roll and events).
pub struct TrackInput<'a> {
    pub px: &'a [f32],
    pub py: &'a [f32],
    pub pz: &'a [f32],
    pub time: &'a [f32],
    pub person: &'a [u32],
    pub yaw: Option<&'a [f32]>,
    pub pitch: Option<&'a [f32]>,
    /// Degrees (the `roll` column).
    pub roll: Option<&'a [f32]>,
    /// The events column's ids and, per id, whether its rows are the unit's own positions.
    pub events: Option<(&'a [u32], &'a [bool])>,
    /// Per person: a name worn by several (no track).
    pub shared: Option<&'a [u8]>,
    pub persons: usize,
}

pub struct TrackOptions {
    /// Data units in a metre.
    pub units: f64,
    /// Most keys the GPU can hold.
    pub max_keys: usize,
}

/// A person's keys: where they are and what they span.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct PersonKeys {
    pub first: u32,
    /// 0: no track (no samples, a shared name).
    pub count: u32,
    /// Where its chunk spans start in `chunks` (u32).
    pub chunk: u32,
    /// The span of its keys: origin x, y, z, position step, first time, time step (the track's slots 8-13).
    pub span: [f32; 6],
    pub t0: f32,
    pub t1: f32,
    pub gaps: bool,
}

pub struct TrackKeys {
    /// `KEY_U32` a key.
    pub keys_a: Vec<u32>,
    /// One a key: the attitude, snorm8 x4, `GAP_BIT` on a key a gap follows.
    pub keys_b: Vec<u32>,
    /// `CHUNK_U32` a chunk of `CHUNK_KEYS` keys, float32 bits.
    pub chunks: Vec<u32>,
    pub persons: Vec<PersonKeys>,
    pub keys: usize,
    /// 0: every sample kept; else the metres a reduced curve stays within.
    pub tolerance: f64,
    pub samples: usize,
    pub build_ms: f64,
}

impl TrackKeys {
    /// The persons' entries as the page reads them: first, count, chunk, span (6 x f32), t0, t1 (f32), flags.
    pub fn person_words(&self) -> Vec<u32> {
        let mut out = Vec::with_capacity(self.persons.len() * PERSON_U32);
        for p in &self.persons {
            out.extend_from_slice(&[p.first, p.count, p.chunk]);
            out.extend(p.span.iter().map(|v| v.to_bits()));
            out.extend_from_slice(&[p.t0.to_bits(), p.t1.to_bits(), if p.gaps { PERSON_GAPS } else { 0 }]);
        }
        out
    }

    /// Bytes the keys and spans hold.
    pub fn bytes(&self) -> usize {
        (self.keys_a.len() + self.keys_b.len() + self.chunks.len()) * 4
    }
}

// JavaScript's number rules, where the page's values depend on them.

/// `Math.round`: halves up.
fn js_round(x: f64) -> f64 {
    let f = x.floor();
    if x - f >= 0.5 { f + 1.0 } else { f }
}

/// `Math.min` of two: NaN wins, -0 below 0.
fn js_min(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else if a == b {
        if a.is_sign_negative() { a } else { b }
    } else if a < b {
        a
    } else {
        b
    }
}

/// `Math.max` of two: NaN wins, 0 above -0.
fn js_max(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() {
        f64::NAN
    } else if a == b {
        if a.is_sign_positive() { a } else { b }
    } else if a > b {
        a
    } else {
        b
    }
}

/// `x | 0` of a value in u32 range or NaN (0).
fn js_u(x: f64) -> u32 {
    if x.is_nan() { 0 } else { x as i64 as u32 }
}

/// V8's `Math.hypot` of three: scaled by the largest, Kahan-summed.
fn js_hypot3(a: f64, b: f64, c: f64) -> f64 {
    let v = [a.abs(), b.abs(), c.abs()];
    let mut max = 0.0f64;
    let mut nan = false;
    for &x in &v {
        if x.is_nan() {
            nan = true;
        } else if x > max {
            max = x;
        }
    }
    if max == f64::INFINITY {
        return f64::INFINITY;
    }
    if nan {
        return f64::NAN;
    }
    if max == 0.0 {
        return 0.0;
    }
    let (mut sum, mut comp) = (0.0f64, 0.0f64);
    for &x in &v {
        let n = x / max;
        let s = n * n - comp;
        let p = sum + s;
        comp = (p - sum) - s;
        sum = p;
    }
    sum.sqrt() * max
}

fn q16(v: f64, o: f64, st: f64) -> f64 {
    js_max(0.0, js_min(STEPS, js_round((v - o) / st)))
}

/// A float32 as JavaScript reads it back from a `Float32Array`.
fn f32r(v: f64) -> f64 {
    v as f32 as f64
}

/// `packQuat`: snorm8 x4.
fn pack_quat(q: &[f64; 4]) -> u32 {
    let b = |x: f64| {
        let v = js_round(js_max(-1.0, js_min(1.0, x)) * 127.0);
        (if v.is_nan() { 0 } else { v as i32 }) as u32 & 0xff
    };
    b(q[0]) | (b(q[1]) << 8) | (b(q[2]) << 16) | (b(q[3]) << 24)
}

/// `quatOfFrame(poseFrame({yaw, pitch, roll}))`.
fn attitude(yaw: f64, pitch: f64, roll: f64) -> [f64; 4] {
    let (s, c) = (libm::sin(yaw), libm::cos(yaw));
    let mut f = [s, 0.0, c];
    let mut r = [-c, 0.0, s];
    let mut u = [0.0, 1.0, 0.0];
    if pitch != 0.0 && !pitch.is_nan() {
        let (cp, sp) = (libm::cos(pitch), libm::sin(pitch));
        let f2 = [f[0] * cp + u[0] * sp, f[1] * cp + u[1] * sp, f[2] * cp + u[2] * sp];
        u = [u[0] * cp - f[0] * sp, u[1] * cp - f[1] * sp, u[2] * cp - f[2] * sp];
        f = f2;
    }
    if roll != 0.0 && !roll.is_nan() {
        let (cr, sr) = (libm::cos(roll), libm::sin(roll));
        let r2 = [r[0] * cr - u[0] * sr, r[1] * cr - u[1] * sr, r[2] * cr - u[2] * sr];
        u = [u[0] * cr + r[0] * sr, u[1] * cr + r[1] * sr, u[2] * cr + r[2] * sr];
        r = r2;
    }
    let (m00, m01, m02) = (f[0], u[0], r[0]);
    let (m10, m11, m12) = (f[1], u[1], r[1]);
    let (m20, m21, m22) = (f[2], u[2], r[2]);
    let tr = m00 + m11 + m22;
    let mut q = [0.0; 4];
    if tr > 0.0 {
        let s = (tr + 1.0).sqrt() * 2.0;
        q[3] = 0.25 * s;
        q[0] = (m21 - m12) / s;
        q[1] = (m02 - m20) / s;
        q[2] = (m10 - m01) / s;
    } else if m00 > m11 && m00 > m22 {
        let s = (1.0 + m00 - m11 - m22).sqrt() * 2.0;
        q[3] = (m21 - m12) / s;
        q[0] = 0.25 * s;
        q[1] = (m01 + m10) / s;
        q[2] = (m02 + m20) / s;
    } else if m11 > m22 {
        let s = (1.0 + m11 - m00 - m22).sqrt() * 2.0;
        q[3] = (m02 - m20) / s;
        q[0] = (m01 + m10) / s;
        q[1] = 0.25 * s;
        q[2] = (m12 + m21) / s;
    } else {
        let s = (1.0 + m22 - m00 - m11).sqrt() * 2.0;
        q[3] = (m10 - m01) / s;
        q[0] = (m02 + m20) / s;
        q[1] = (m12 + m21) / s;
        q[2] = 0.25 * s;
    }
    q
}

/// The columns as f64 at a row.
struct Cols<'a> {
    px: &'a [f32],
    py: &'a [f32],
    pz: &'a [f32],
    time: &'a [f32],
}

impl Cols<'_> {
    #[inline]
    fn x(&self, r: u32) -> f64 {
        self.px[r as usize] as f64
    }
    #[inline]
    fn y(&self, r: u32) -> f64 {
        self.py[r as usize] as f64
    }
    #[inline]
    fn z(&self, r: u32) -> f64 {
        self.pz[r as usize] as f64
    }
    #[inline]
    fn t(&self, r: u32) -> f64 {
        self.time[r as usize] as f64
    }
}

/// A pointer shared by threads that each write their own part.
#[derive(Clone, Copy)]
struct Part<T>(*mut T);
unsafe impl<T> Send for Part<T> {}
unsafe impl<T> Sync for Part<T> {}

/// Rows per person in row order (time order: the rows are), own positions only: `start` (persons + 1) and the rows.
fn group(inp: &TrackInput) -> (Vec<usize>, Vec<u32>) {
    let n = inp.time.len().min(inp.px.len()).min(inp.person.len());
    let persons = inp.persons;
    let ok = |r: usize| -> bool { inp.events.is_none_or(|(ids, own)| own.get(ids[r] as usize).copied().unwrap_or(false)) && inp.px[r].is_finite() };
    // A stable counting sort over blocks of rows, each block on a core.
    let blocks = (rayon::current_num_threads() * 2).min(n / 65536 + 1).max(1);
    let per = n.div_ceil(blocks);
    let mut counts: Vec<Vec<u32>> = (0..blocks)
        .into_par_iter()
        .map(|b| {
            let mut c = vec![0u32; persons];
            for r in b * per..((b + 1) * per).min(n) {
                let p = inp.person[r] as usize;
                if p < persons && ok(r) {
                    c[p] += 1;
                }
            }
            c
        })
        .collect();
    let mut start = vec![0usize; persons + 1];
    for p in 0..persons {
        let mut at = start[p];
        for c in counts.iter_mut() {
            let k = c[p] as usize;
            c[p] = at as u32;
            at += k;
        }
        start[p + 1] = at;
    }
    let mut rows = vec![0u32; start[persons]];
    let out = Part(rows.as_mut_ptr());
    counts.into_par_iter().enumerate().for_each(|(b, mut at)| {
        let out = out;
        for r in b * per..((b + 1) * per).min(n) {
            let p = inp.person[r] as usize;
            if p < persons && ok(r) {
                // SAFETY: each block writes the places its counts gave it, disjoint from every other's.
                unsafe { *out.0.add(at[p] as usize) = r as u32 };
                at[p] += 1;
            }
        }
    });
    (start, rows)
}

/// Cuts `v` into consecutive parts of the given lengths.
fn cut<'a, T>(mut v: &'a mut [T], lens: impl Iterator<Item = usize>) -> Vec<&'a mut [T]> {
    let mut out = Vec::new();
    for n in lens {
        let (a, b) = v.split_at_mut(n);
        out.push(a);
        v = b;
    }
    out
}

/// `heldSamples` for one person's rows.
fn held_person(rows: &[u32], c: &Cols, units: f64, held: &mut [u8]) {
    let b = rows.len();
    let same = |i: usize, j: usize| c.x(rows[i]) == c.x(rows[j]) && c.y(rows[i]) == c.y(rows[j]) && c.z(rows[i]) == c.z(rows[j]);
    let dist = |i: usize, j: usize| js_hypot3(c.x(rows[j]) - c.x(rows[i]), c.y(rows[j]) - c.y(rows[i]), c.z(rows[j]) - c.z(rows[i]));
    let mut k = 1;
    while k + 1 < b {
        if !same(k, k - 1) {
            k += 1;
            continue;
        }
        let mut e = k;
        while e + 1 < b && same(e + 1, k - 1) {
            e += 1;
        }
        let from = k - 1;
        if from > 0 && e < b - 1 && c.t(rows[e + 1]) - c.t(rows[from]) < MAX_GAP {
            let v_in = dist(from - 1, from) / js_max(1e-3, c.t(rows[from]) - c.t(rows[from - 1]));
            let v_out = dist(e, e + 1) / js_max(1e-3, c.t(rows[e + 1]) - c.t(rows[from]));
            if v_in > units && (v_out - v_in).abs() < 0.3 * v_in {
                for h in held.iter_mut().take(e + 1).skip(k) {
                    *h = 1;
                }
            }
        }
        k = e + 1;
    }
}

/// `choose` for one person: marks the rows kept as keys at `tol` metres; returns how many.
fn choose_person(rows: &[u32], held: &[u8], c: &Cols, tol: f64, units: f64, keep: &mut [u8]) -> usize {
    let b = rows.len();
    let tol_u = tol * units;
    let mut n = 0;
    let mut last: Option<usize> = None;
    let (mut vx, mut vy, mut vz) = (0.0f64, 0.0f64, 0.0f64);
    for k in 0..b {
        let r = rows[k];
        keep[k] = 0;
        if held[k] != 0 {
            continue;
        }
        if let Some(l) = last {
            if c.t(r) - c.t(rows[l]) < 1e-3 {
                continue;
            }
            if tol > 0.0 && k != b - 1 {
                let lr = rows[l];
                let dt = c.t(r) - c.t(lr);
                if dt < MAX_GAP {
                    let ex = c.x(r) - (c.x(lr) + vx * dt);
                    let ey = c.y(r) - (c.y(lr) + vy * dt);
                    let ez = c.z(r) - (c.z(lr) + vz * dt);
                    if ex * ex + ey * ey + ez * ez <= tol_u * tol_u {
                        continue;
                    }
                }
            }
        }
        keep[k] = 1;
        n += 1;
        let r0 = rows[k.saturating_sub(1)];
        let r1 = rows[(k + 1).min(b - 1)];
        let h = c.t(r1) - c.t(r0);
        if h > 1e-6 {
            vx = (c.x(r1) - c.x(r0)) / h;
            vy = (c.y(r1) - c.y(r0)) / h;
            vz = (c.z(r1) - c.z(r0)) / h;
        } else {
            vx = 0.0;
            vy = 0.0;
            vz = 0.0;
        }
        last = Some(k);
    }
    n
}

/// `markGaps` for one person's rows: 1 on each sample a gap follows; how many.
fn mark_gaps(rows: &[u32], c: &Cols, units: f64, out: &mut [u8]) -> usize {
    let n = rows.len();
    out.fill(0);
    if n < 3 {
        return 0;
    }
    let mut steps: Vec<f64> = Vec::with_capacity(n);
    for k in 0..n - 1 {
        let dt = c.t(rows[k + 1]) - c.t(rows[k]);
        if dt > 1e-3 {
            steps.push(dt);
        }
    }
    let m = steps.len();
    if m == 0 {
        return 0;
    }
    steps.sort_unstable_by(|a, b| a.total_cmp(b));
    let usual = steps[m >> 1];
    let least = js_max(GAP_MIN_S, GAP_FACTOR * usual);
    if steps[m - 1] <= least {
        return 0;
    }
    let moved = GAP_MOVED_M * units;
    let mut gaps = 0;
    for k in 0..n - 1 {
        let (r0, r1) = (rows[k], rows[k + 1]);
        if c.t(r1) - c.t(r0) <= least {
            continue;
        }
        let (dx, dy, dz) = (c.x(r1) - c.x(r0), c.y(r1) - c.y(r0), c.z(r1) - c.z(r0));
        if dx * dx + dy * dy + dz * dz <= moved * moved {
            continue;
        }
        out[k] = 1;
        gaps += 1;
    }
    gaps
}

/// The span of a person's kept keys (the track's slots 8-13), its first and last key time; None for no keys.
fn span_of(rows: &[u32], keep: &[u8], c: &Cols) -> Option<([f32; 6], f32, f32)> {
    let (mut x0, mut y0, mut z0, mut x1, mut y1, mut z1) = (f64::INFINITY, f64::INFINITY, f64::INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY);
    let (mut t0, mut t1) = (f64::INFINITY, f64::NEG_INFINITY);
    for (k, &r) in rows.iter().enumerate() {
        if keep[k] == 0 {
            continue;
        }
        x0 = js_min(x0, c.x(r));
        x1 = js_max(x1, c.x(r));
        y0 = js_min(y0, c.y(r));
        y1 = js_max(y1, c.y(r));
        z0 = js_min(z0, c.z(r));
        z1 = js_max(z1, c.z(r));
        t0 = js_min(t0, c.t(r));
        t1 = js_max(t1, c.t(r));
    }
    // `!(t1k >= t0k)`: no keys, or a time that is not a number.
    if t1 < t0 || t1.is_nan() || t0.is_nan() {
        return None;
    }
    let step = js_max(js_max(js_max(x1 - x0, y1 - y0), z1 - z0), 1e-6) / STEPS;
    let t_step = js_max(t1 - t0, 1e-6) / STEPS;
    Some(([x0 as f32, y0 as f32, z0 as f32, step as f32, t0 as f32, t_step as f32], t0 as f32, t1 as f32))
}

/// `chunkSpan`: the span of kept rows `kept[from..to]` into `out` (float32 bits).
fn chunk_span(kept: &[u32], c: &Cols, out: &mut [u32]) {
    let (mut x0, mut y0, mut z0, mut x1, mut y1, mut z1) = (f64::INFINITY, f64::INFINITY, f64::INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY, f64::NEG_INFINITY);
    for &r in kept {
        x0 = js_min(x0, c.x(r));
        x1 = js_max(x1, c.x(r));
        y0 = js_min(y0, c.y(r));
        y1 = js_max(y1, c.y(r));
        z0 = js_min(z0, c.z(r));
        z1 = js_max(z1, c.z(r));
    }
    let (ox, oy, oz) = (f32r(x0), f32r(y0), f32r(z0));
    let st = (js_max(js_max(js_max(x1 - ox, y1 - oy), z1 - oz), 1e-6) / STEPS) * (1.0 + 1e-6);
    let t0 = f32r(c.t(kept[0]));
    let ts = (js_max(c.t(kept[kept.len() - 1]) - t0, 1e-6) / STEPS) * (1.0 + 1e-6);
    out[0] = (ox as f32).to_bits();
    out[1] = (oy as f32).to_bits();
    out[2] = (oz as f32).to_bits();
    out[3] = (st as f32).to_bits();
    out[4] = (t0 as f32).to_bits();
    out[5] = (ts as f32).to_bits();
}

/// One person's keys, attitudes and chunk spans into their parts; whether a gap bit was set.
#[allow(clippy::too_many_arguments)]
fn fill_person(rows: &[u32], keep: &[u8], c: &Cols, inp: &TrackInput, units: f64, keys_a: &mut [u32], keys_b: &mut [u32], chunks: &mut [u32]) -> bool {
    let kept: Vec<u32> = rows.iter().zip(keep).filter(|(_, &k)| k != 0).map(|(&r, _)| r).collect();
    let m = kept.len();
    let mut last_qt = -1.0f64;
    for n in 0..m {
        let r = kept[n];
        let ci = (n / CHUNK_KEYS) * CHUNK_U32;
        if n % CHUNK_KEYS == 0 {
            chunk_span(&kept[n..(n + CHUNK_KEYS).min(m)], c, &mut chunks[ci..ci + CHUNK_U32]);
            last_qt = -1.0;
        }
        let f = |k: usize| f32::from_bits(chunks[ci + k]) as f64;
        let st = f(3);
        let qt = js_min(STEPS, js_max(last_qt + 1.0, q16(c.t(r), f(4), f(5))));
        last_qt = qt;
        keys_a[n * 2] = js_u(q16(c.x(r), f(0), st)) | (js_u(q16(c.y(r), f(1), st)) << 16);
        keys_a[n * 2 + 1] = js_u(q16(c.z(r), f(2), st)) | (js_u(qt) << 16);
        if let Some(yaw) = inp.yaw {
            let rl = inp.roll.map_or(0.0, |v| (v[r as usize] as f64 * std::f64::consts::PI) / 180.0);
            let pitch = inp.pitch.map_or(0.0, |v| {
                let p = v[r as usize] as f64;
                if p.is_nan() { 0.0 } else { p }
            });
            let mut q = attitude(std::f64::consts::PI - yaw[r as usize] as f64, pitch, if rl.is_finite() { rl } else { 0.0 });
            if q[3] < 0.0 {
                for v in q.iter_mut() {
                    *v = -*v;
                }
            }
            keys_b[n] = pack_quat(&q);
        } else {
            keys_b[n] = 0;
        }
    }
    let mut marks = vec![0u8; rows.len()];
    if mark_gaps(rows, c, units, &mut marks) == 0 {
        return false;
    }
    let mut gaps = false;
    let mut cur: i64 = -1;
    let mut n: i64 = 0;
    for k in 0..rows.len() {
        if keep[k] != 0 {
            cur = n;
            n += 1;
        }
        if marks[k] != 0 && cur >= 0 && cur < m as i64 - 1 && keys_b[cur as usize] & GAP_BIT == 0 {
            keys_b[cur as usize] |= GAP_BIT;
            gaps = true;
        }
    }
    gaps
}

/// Every person's keys; None when they do not fit `max_keys` even at the coarsest tolerance.
pub fn build_keys(inp: &TrackInput, o: &TrackOptions) -> Option<TrackKeys> {
    let t_start = std::time::Instant::now();
    let c = Cols { px: inp.px, py: inp.py, pz: inp.pz, time: inp.time };
    let persons = inp.persons;
    let (start, rows) = group(inp);
    let samples = rows.len();
    let lens = || (0..persons).map(|p| start[p + 1] - start[p]);
    let row_parts: Vec<&[u32]> = (0..persons).map(|p| &rows[start[p]..start[p + 1]]).collect();

    let mut held = vec![0u8; samples];
    cut(&mut held, lens()).into_par_iter().zip(row_parts.par_iter()).for_each(|(h, r)| held_person(r, &c, o.units, h));
    let mut keep = vec![0u8; samples];
    let choose = |keep: &mut Vec<u8>, tol: f64| -> usize {
        cut(keep, lens()).into_par_iter().zip(row_parts.par_iter()).enumerate().map(|(p, (k, r))| choose_person(r, &held[start[p]..start[p + 1]], &c, tol, o.units, k)).sum()
    };
    let mut tolerance = 0.0;
    let mut keys = choose(&mut keep, 0.0);
    for tol in TOLERANCES {
        if keys <= o.max_keys {
            break;
        }
        tolerance = tol;
        keys = choose(&mut keep, tol);
    }
    if keys > o.max_keys {
        return None;
    }

    // Each person's span and key count; the ones that get a track laid out one after the other.
    let mut entries: Vec<(PersonKeys, usize)> = (0..persons)
        .into_par_iter()
        .map(|p| {
            let (a, b) = (start[p], start[p + 1]);
            if a >= b || inp.shared.is_some_and(|s| s.get(p).copied().unwrap_or(0) != 0) {
                return (PersonKeys::default(), 0);
            }
            let k = &keep[a..b];
            match span_of(&rows[a..b], k, &c) {
                Some((span, t0, t1)) => {
                    let n = k.iter().filter(|&&v| v != 0).count();
                    (PersonKeys { count: n as u32, span, t0, t1, ..Default::default() }, n)
                }
                None => (PersonKeys::default(), 0),
            }
        })
        .collect();
    let (mut key, mut chunk) = (0usize, 0usize);
    for (e, n) in entries.iter_mut().filter(|e| e.1 > 0) {
        e.first = key as u32;
        e.chunk = chunk as u32;
        key += *n;
        chunk += n.div_ceil(CHUNK_KEYS) * CHUNK_U32;
    }
    let mut keys_a = vec![0u32; key * KEY_U32];
    let mut keys_b = vec![0u32; key];
    let mut chunks = vec![0u32; chunk];
    let a_parts = cut(&mut keys_a, entries.iter().map(|e| e.1 * KEY_U32));
    let b_parts = cut(&mut keys_b, entries.iter().map(|e| e.1));
    let c_parts = cut(&mut chunks, entries.iter().map(|e| e.1.div_ceil(CHUNK_KEYS) * CHUNK_U32));
    let gaps: Vec<bool> = a_parts
        .into_par_iter()
        .zip(b_parts)
        .zip(c_parts)
        .enumerate()
        .map(|(p, ((ka, kb), kc))| if entries[p].1 == 0 { false } else { fill_person(row_parts[p], &keep[start[p]..start[p + 1]], &c, inp, o.units, ka, kb, kc) })
        .collect();
    let persons_out: Vec<PersonKeys> = entries.into_iter().zip(gaps).map(|((e, _), g)| PersonKeys { gaps: g, ..e }).collect();
    Some(TrackKeys { keys_a, keys_b, chunks, persons: persons_out, keys: key, tolerance, samples, build_ms: t_start.elapsed().as_secs_f64() * 1000.0 })
}

/// What the page asks the core to build tracks with (`viewport_core_tracks`).
#[derive(Debug, Clone, Default, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackRequest {
    pub max_keys: u64,
    pub units: f64,
    pub persons: u32,
    /// The events column's name and, per category id, whether its rows are own positions.
    pub events: Option<String>,
    #[serde(default)]
    pub own: Vec<u8>,
    /// The roll column's name (degrees).
    pub roll: Option<String>,
}

/// The keys of a dataset the core holds, over every row of it.
pub fn build_for(ds: &crate::dataset::Dataset, req: &TrackRequest) -> anyhow::Result<Option<TrackKeys>> {
    use crate::dataset::View;
    use anyhow::anyhow;
    for n in [req.roll.as_deref(), req.events.as_deref()].into_iter().flatten() {
        ds.ensure_column(n)?;
    }
    let names = ["@px", "@py", "@pz", "@time", "@person", "@yaw", "@pitch", "@personShared", req.roll.as_deref().unwrap_or(" "), req.events.as_deref().unwrap_or(" ")];
    ds.with_views(&names, |v| {
        let f32s = |i: usize| match v[i] {
            Some(View::F32(x)) => Some(x),
            _ => None,
        };
        let need = |i: usize| f32s(i).ok_or_else(|| anyhow!("no column {}", names[i]));
        let person = match v[4] {
            Some(View::U32(x)) => x,
            _ => return Ok(None),
        };
        let shared = match v[7] {
            Some(View::U8(x)) => Some(x),
            _ => None,
        };
        let own: Vec<bool> = req.own.iter().map(|&b| b != 0).collect();
        let events = match (req.events.as_ref(), v[9]) {
            (Some(_), Some(View::U32(ids))) => Some((ids, &own[..])),
            (Some(n), _) => return Err(anyhow!("no events column {n}")),
            _ => None,
        };
        let roll = match req.roll.as_ref() {
            Some(n) => Some(f32s(8).ok_or_else(|| anyhow!("no roll column {n}"))?),
            None => None,
        };
        let Some(time) = f32s(3) else { return Ok(None) };
        let inp = TrackInput { px: need(0)?, py: need(1)?, pz: need(2)?, time, person, yaw: f32s(5), pitch: f32s(6), roll, events, shared, persons: (req.persons as usize).max(1) };
        Ok(build_keys(&inp, &TrackOptions { units: req.units, max_keys: req.max_keys as usize }))
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn js_rules() {
        assert_eq!(js_round(2.5), 3.0);
        assert_eq!(js_round(-2.5), -2.0);
        assert_eq!(js_round(0.49999999999999994), 0.0);
        assert!(js_min(1.0, f64::NAN).is_nan());
        assert!(js_min(0.0, -0.0).is_sign_negative());
        assert!(js_max(-0.0, 0.0).is_sign_positive());
        assert_eq!(js_hypot3(3.0, 4.0, 0.0), 5.0);
        assert_eq!(pack_quat(&[f64::NAN, -1.0, 1.0, 0.5]), (0x81 << 8) | (127 << 16) | (64 << 24));
    }
}
