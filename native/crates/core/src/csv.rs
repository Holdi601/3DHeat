//! Delimited text, scanned as `ingestCsv` (`src/data/ingest.ts`) with `CsvScanner`
//! (`src/data/csv.ts`) scans it, on every core.
//!
//! What the web app does, and so what this does, byte for byte:
//!
//! - A quote anywhere outside quotes opens a quoted run, and inside one a lone
//!   quote closes it while a doubled one stays inside. The delimiter and the line
//!   ends only count outside quotes. A line ends at LF, CR or CRLF.
//! - The first line ends the header (whatever it is, a blank line included); a
//!   line that is one empty field is blank and no row; a row of more than 4096
//!   fields is an error.
//! - A field is trimmed of spaces and tabs and then of one surrounding pair of
//!   quotes. A number is read by `parseNumberBytes`, NaN for anything else; text
//!   is decoded as `TextDecoder` decodes it (a leading BOM dropped, bad bytes as
//!   U+FFFD) with `""` read as `"`.
//! - A field a short row lacks keeps the value the slot had in the row before
//!   (0, or dictionary id 0, before any row set it), exactly as the web app's row
//!   buffers do.
//! - Number clauses, then set clauses, decide a row; one passing row in `stride`
//!   is kept; a kept row whose mapped axis is not finite is rejected.
//!
//! In parallel: the file is cut into ranges at line ends, and each range is
//! scanned on its own. Whether a byte is inside quotes is the parity of the
//! quotes before it (every quote flips the state, a doubled one inside quotes
//! flipping it twice), and a range's scan ends inside quotes exactly when the
//! range holds an odd number of them, so the scans themselves tell which cuts
//! fell inside quotes; those are moved and their ranges scanned again
//! (`fix_cuts`), and the file is read once, not once for quotes and once more.
//! What crosses a cut is put back together in file order: the dictionaries
//! (labels re-interned range by range, so ids are first appearance in the file),
//! the stride's count of passing rows before each range (counted in a first
//! pass when the stride is above one), and the values a short row inherits
//! (a range whose rows need a value from before it is scanned again, once the
//! ranges before it say what that value is).

use std::borrow::Cow;
use std::collections::HashMap;
use std::hash::{BuildHasherDefault, Hasher};
use std::mem::MaybeUninit;

use rayon::prelude::*;

use crate::filter::{Clause, FilterStats, Test};
use crate::table::Dict;

/// What `ingestCsv` sets up before it scans: which file column feeds which slot.
#[derive(Debug, Clone, Default)]
pub struct CsvPlan {
    pub delimiter: u8,
    /// Per number slot, its column index in the file.
    pub number_columns: Vec<usize>,
    /// The number slot collected at double width (the time), if any.
    pub wide_slot: Option<usize>,
    /// Per text slot, its column index in the file.
    pub text_columns: Vec<usize>,
    /// Number slots of x, y, z when mapped: a row whose mapped axis is not finite is rejected.
    pub axis_slots: [Option<usize>; 3],
    /// Range clauses on number slots, and set clauses on text slots. Their slots are
    /// read only to decide: a passing row does not push them.
    pub number_tests: Vec<(usize, Clause)>,
    pub text_tests: Vec<(usize, Clause)>,
    /// Keep one passing row in `stride`.
    pub stride: usize,
    /// The first line is a header (always, as the web app reads CSV).
    pub has_header: bool,
}

/// What the scan collected, slot for slot.
#[derive(Debug, Clone, Default)]
pub struct CsvColumns {
    /// Per number slot; empty for the wide slot and for test-only slots.
    pub numbers: Vec<Vec<f32>>,
    /// The wide slot's values.
    pub wide: Option<Vec<f64>>,
    /// Per text slot; empty ids for test-only slots (their labels still interned).
    pub texts: Vec<Dict>,
    pub rows: usize,
    pub rejected: usize,
    pub filtered: Option<FilterStats>,
}

/// `MAX_FIELDS` of `CsvScanner`.
pub const MAX_FIELDS: usize = 4096;

const LF: u8 = 10;
const CR: u8 = 13;
const QUOTE: u8 = 34;
const SPACE: u8 = 32;
const TAB: u8 = 9;

/// A text slot no row has set yet: the web app's row buffer still holds id 0.
const INITIAL: u32 = u32::MAX;

/// Below this a file is scanned on one thread.
const PARALLEL_MIN_BYTES: usize = 1 << 20;

/// Scans `bytes` by `plan`, on every core.
pub fn scan_csv(bytes: &[u8], plan: &CsvPlan) -> anyhow::Result<CsvColumns> {
    let parts = if bytes.len() < PARALLEL_MIN_BYTES {
        1
    } else {
        rayon::current_num_threads().max(1) * 4
    };
    scan_csv_parts(bytes, plan, parts)
}

/// `scan_csv` with the file cut into (at most) `parts` ranges; 1 is one sequential scan.
pub fn scan_csv_parts(bytes: &[u8], plan: &CsvPlan, parts: usize) -> anyhow::Result<CsvColumns> {
    let p = Prep::new(plan)?;
    let guessed = split(bytes, p.delim, parts);
    if guessed.len() <= 1 {
        return sequential(bytes, &p);
    }
    let initial = State::initial(&p);
    // The stride counts passing rows over the whole file: with one above 1, the
    // first pass only counts them.
    let count_mode = p.step > 1;
    let first: Vec<RangeOut> = guessed
        .par_iter()
        .enumerate()
        .map(|(k, &(s, e))| {
            scan_range(
                &p,
                &bytes[s..e],
                k == 0,
                (k == 0).then_some(&initial),
                count_mode,
                0,
            )
        })
        .collect();
    let (ranges, mut outs) = fix_cuts(bytes, &p, &initial, guessed, first, count_mode)?;
    let slices: Vec<&[u8]> = ranges.iter().map(|&(s, e)| &bytes[s..e]).collect();
    let incoming = fold_states(&initial, &outs);
    rescan_dirty(&p, &slices, &incoming, &mut outs, count_mode)?;
    if count_mode {
        if outs.iter().any(|o| o.initial_tested) {
            return sequential(bytes, &p);
        }
        let mut offsets = Vec::with_capacity(outs.len());
        let mut seen = 0u64;
        for o in &outs {
            offsets.push(seen);
            seen += o.passed;
        }
        drop(outs);
        outs = slices
            .par_iter()
            .enumerate()
            .map(|(k, buf)| {
                finished(scan_range(
                    &p,
                    buf,
                    k == 0,
                    Some(&incoming[k]),
                    false,
                    offsets[k],
                ))
            })
            .collect::<anyhow::Result<Vec<_>>>()?;
    }
    if outs.iter().any(|o| o.initial_tested) {
        // A set clause read a text slot before any row had set it: the web app
        // then caches that answer for id 0 for the whole file, which only one
        // pass in order reproduces.
        return sequential(bytes, &p);
    }
    Ok(assemble(&p, outs))
}

fn sequential(bytes: &[u8], p: &Prep) -> anyhow::Result<CsvColumns> {
    let initial = State::initial(p);
    let out = finished(scan_range(p, bytes, true, Some(&initial), false, 0))?;
    Ok(assemble(p, vec![out]))
}

/// A range scanned from a true line start: its error is the file's.
fn finished(mut out: RangeOut) -> anyhow::Result<RangeOut> {
    match out.error.take() {
        Some(e) => Err(e),
        None => Ok(out),
    }
}

/// Puts right the cuts that fell inside quotes.
///
/// The cuts were guessed at line ends without regard to quotes, because knowing
/// where quotes are would take a pass over the whole file first. Whether a range
/// begins inside quotes is the parity of the quotes before it, and each range's
/// scan ends inside quotes exactly when it holds an odd number of them, whatever
/// it assumed at its start. So after the scan every cut is known good or bad; a
/// bad cut moves to the first line end outside quotes after it (or goes, when its
/// range has none), and only the ranges whose bounds moved are scanned again.
fn fix_cuts(
    bytes: &[u8],
    p: &Prep,
    initial: &State,
    guessed: Vec<(usize, usize)>,
    first: Vec<RangeOut>,
    count_mode: bool,
) -> anyhow::Result<(Vec<(usize, usize)>, Vec<RangeOut>)> {
    let mut starts = Vec::with_capacity(guessed.len());
    let mut odd = false;
    for (k, &(s, e)) in guessed.iter().enumerate() {
        if k == 0 || !odd {
            starts.push(s);
        } else if let Some(x) = line_start_after(bytes, s, e, true).filter(|&x| x < e) {
            starts.push(x);
        }
        // A range that stopped at an error did not see all its quotes.
        let o = &first[k];
        odd ^= if o.error.is_some() {
            count_quotes(&bytes[s..e]) & 1 == 1
        } else {
            o.end_in_quotes
        };
    }
    let n = bytes.len();
    let ranges: Vec<(usize, usize)> = starts
        .iter()
        .enumerate()
        .map(|(k, &s)| (s, starts.get(k + 1).copied().unwrap_or(n)))
        .collect();
    let mut kept: HashMap<(usize, usize), RangeOut> = guessed.into_iter().zip(first).collect();
    let outs: Vec<RangeOut> = ranges
        .par_iter()
        .enumerate()
        .map(|(k, &(s, e))| match kept.get(&(s, e)) {
            Some(_) => None,
            None => Some(scan_range(
                p,
                &bytes[s..e],
                k == 0,
                (k == 0).then_some(initial),
                count_mode,
                0,
            )),
        })
        .collect::<Vec<_>>()
        .into_iter()
        .zip(&ranges)
        .map(|(again, r)| finished(again.unwrap_or_else(|| kept.remove(r).unwrap())))
        .collect::<anyhow::Result<_>>()?;
    Ok((ranges, outs))
}

fn rescan_dirty(
    p: &Prep,
    slices: &[&[u8]],
    incoming: &[State],
    outs: &mut [RangeOut],
    count_mode: bool,
) -> anyhow::Result<()> {
    let dirty: Vec<usize> = (0..outs.len()).filter(|&k| outs[k].dirty).collect();
    if dirty.is_empty() {
        return Ok(());
    }
    let again: Vec<(usize, RangeOut)> = dirty
        .par_iter()
        .map(|&k| {
            finished(scan_range(
                p,
                slices[k],
                k == 0,
                Some(&incoming[k]),
                count_mode,
                0,
            ))
            .map(|o| (k, o))
        })
        .collect::<anyhow::Result<_>>()?;
    for (k, o) in again {
        outs[k] = o;
    }
    Ok(())
}

// ------------------------------------------------------------------ numbers

/// `parseNumberBytes`: digits with an optional sign, fraction and exponent, NaN
/// for anything else (an empty field, trailing junk, a lone sign or dot).
pub fn parse_number_bytes(b: &[u8]) -> f64 {
    let end = b.len();
    let mut i = 0;
    if i >= end {
        return f64::NAN;
    }
    let mut sign = 1.0f64;
    if b[i] == b'+' {
        i += 1;
    } else if b[i] == b'-' {
        sign = -1.0;
        i += 1;
    }
    let first_digit = i;
    // The first 17 digits, as an integer: the same value the web app's running
    // `mantissa * 10 + digit` in doubles reaches while it stays below 2^53.
    let mut m = 0u64;
    let mut digits = 0u32;
    let mut exp = 0i64;
    let mut any = false;
    while i < end {
        let c = b[i].wrapping_sub(b'0');
        if c > 9 {
            break;
        }
        if digits < 17 {
            m = m * 10 + c as u64;
            digits += 1;
        } else {
            exp += 1;
        }
        any = true;
        i += 1;
    }
    if i < end && b[i] == b'.' {
        i += 1;
        while i < end {
            let c = b[i].wrapping_sub(b'0');
            if c > 9 {
                break;
            }
            if digits < 17 {
                m = m * 10 + c as u64;
                digits += 1;
                exp -= 1;
            }
            any = true;
            i += 1;
        }
    }
    if !any {
        return f64::NAN;
    }
    let mut exp = exp as f64;
    if i < end && (b[i] == b'e' || b[i] == b'E') {
        i += 1;
        let mut esign = 1.0f64;
        if i < end && b[i] == b'+' {
            i += 1;
        } else if i < end && b[i] == b'-' {
            esign = -1.0;
            i += 1;
        }
        let mut e = 0.0f64;
        let mut any_e = false;
        while i < end {
            let c = b[i];
            if !c.is_ascii_digit() {
                break;
            }
            e = e * 10.0 + (c - b'0') as f64;
            any_e = true;
            i += 1;
        }
        if any_e {
            exp += esign * e;
        }
    }
    if i != end {
        return f64::NAN;
    }
    let mantissa = if m < 1 << 53 {
        m as f64
    } else {
        mantissa_in_doubles(&b[first_digit..])
    };
    sign * mantissa * pow10(exp)
}

/// The running `mantissa * 10 + digit` in doubles over the first 17 digits, for
/// a mantissa past 2^53, where each step rounds.
#[cold]
fn mantissa_in_doubles(b: &[u8]) -> f64 {
    let mut mantissa = 0.0f64;
    let mut digits = 0;
    for &c in b {
        if c == b'.' {
            continue;
        }
        if !c.is_ascii_digit() || digits == 17 {
            break;
        }
        mantissa = mantissa * 10.0 + (c - b'0') as f64;
        digits += 1;
    }
    mantissa
}

const POW10_MIN: i32 = -323;
const POW10_MAX: i32 = 308;

/// `Math.pow(10, k)` for the integer (or infinite) `k` the parser produces: 0
/// below 1e-323 and infinity above 1e308, as in JavaScript. A table taken from
/// V8 rather than `powf`, which is the platform's and not always correctly
/// rounded (the Windows CRT gives 10^126 one ulp high).
#[inline]
fn pow10(k: f64) -> f64 {
    if k.is_nan() {
        return f64::NAN;
    }
    if k < POW10_MIN as f64 {
        return 0.0;
    }
    if k > POW10_MAX as f64 {
        return f64::INFINITY;
    }
    f64::from_bits(POW10_BITS[(k as i32 - POW10_MIN) as usize])
}

/// `Math.pow(10, k)` as V8 computes it, for k in -323..=308 (bits).
#[rustfmt::skip]
static POW10_BITS: [u64; 632] = [
    0x0000000000000002, 0x0000000000000014, 0x00000000000000ca, 0x00000000000007e8,
    0x0000000000004f10, 0x00000000000316a2, 0x00000000001ee257, 0x000000000134d761,
    0x000000000c1069cd, 0x0000000078a42205, 0x00000004b6695433, 0x0000002f201d49fb,
    0x000001d74124e3d1, 0x000012688b70e62b, 0x0000b8157268fdaf, 0x000730d67819e8d2,
    0x0031fa182c40c60d, 0x0066789e3750f791, 0x009c16c5c5253575, 0x00d18e3b9b374169,
    0x0105f1ca820511c3, 0x013b6e3d22865634, 0x017124e63593f5e1, 0x01a56e1fc2f8f359,
    0x01dac9a7b3b7302f, 0x0210be08d0527e1d, 0x0244ed8b04671da5, 0x027a28edc580e50e,
    0x02b059949b708f29, 0x02e46ff9c24cb2f3, 0x03198bf832dfdfb0, 0x034feef63f97d79c,
    0x0383f559e7bee6c1, 0x03b8f2b061aea072, 0x03ef2f5c7a1a488e, 0x04237d99cc506d59,
    0x04585d003f6488af, 0x048e74404f3daadb, 0x04c308a831868ac9, 0x04f7cad23de82d7b,
    0x052dbd86cd6238d9, 0x05629674405d6388, 0x05973c115074bc6a, 0x05cd0b15a491eb84,
    0x060226ed86db3333, 0x0636b0a8e891ffff, 0x066c5cd322b67fff, 0x06a1ba03f5b21000,
    0x06d62884f31e93ff, 0x070bb2a62fe638ff, 0x07414fa7ddefe3a0, 0x0775a391d56bdc87,
    0x07ab0c764ac6d3a9, 0x07e0e7c9eebc444a, 0x081521bc6a6b555c, 0x084a6a2b85062ab3,
    0x0880825b3323dab0, 0x08b4a2f1ffecd15c, 0x08e9cbae7fe805b3, 0x09201f4d0ff10390,
    0x0954272053ed4474, 0x098930e868e89591, 0x09bf7d228322baf5, 0x09f3ae3591f5b4d9,
    0x0a2899c2f6732210, 0x0a5ec033b40fea93, 0x0a9338205089f29c, 0x0ac8062864ac6f43,
    0x0afe07b27dd78b14, 0x0b32c4cf8ea6b6ec, 0x0b677603725064a8, 0x0b9d53844ee47dd1,
    0x0bd25432b14ecea3, 0x0c06e93f5da2824c, 0x0c3ca38f350b22df, 0x0c71e6398126f5cb,
    0x0ca65fc7e170b33e, 0x0cdbf7b9d9cce00d, 0x0d117ad428200c08, 0x0d45d98932280f0a,
    0x0d7b4feb7eb212cd, 0x0db111f32f2f4bc0, 0x0de5566ffafb1eb0, 0x0e1aac0bf9b9e65c,
    0x0e50ab877c142ffa, 0x0e84d6695b193bf8, 0x0eba0c03b1df8af6, 0x0ef047824f2bb6da,
    0x0f245962e2f6a490, 0x0f596fbb9bb44db4, 0x0f8fcbaa82a16121, 0x0fc3df4a91a4dcb5,
    0x0ff8d71d360e13e2, 0x102f0ce4839198db, 0x1063680ed23aff89, 0x1098421286c9bf6b,
    0x10ce5297287c2f45, 0x1102f39e794d9d8b, 0x1137b08617a104ee, 0x116d9ca79d89462a,
    0x11a281e8c275cbda, 0x11d72262f3133ed1, 0x120ceafbafd80e85, 0x124212dd4de70913,
    0x12769794a160cb58, 0x12ac3d79c9b8fe2e, 0x12e1a66c1e139edd, 0x1316100725988694,
    0x134b9408eefea839, 0x13813c85955f2923, 0x13b58ba6fab6f36c, 0x13eaee90b964b047,
    0x1420d51a73deee2d, 0x14550a6110d6a9b8, 0x148a4cf9550c5426, 0x14c0701bd527b498,
    0x14f48c22ca71a1bd, 0x1529af2b7d0e0a2d, 0x15600d7b2e28c65c, 0x159410d9f9b2f7f3,
    0x15c91510781fb5f0, 0x15ff5a549627a36c, 0x16339874ddd8c623, 0x16687e92154ef7ac,
    0x169e9e369aa2b597, 0x16d322e220a5b17e, 0x1707eb9aa8cf1dde, 0x173de6815302e556,
    0x1772b010d3e1cf56, 0x17a75c1508da432b, 0x17dd331a4b10d3f6, 0x18123ff06eea847a,
    0x1846cfec8aa52598, 0x187c83e7ad4e6efe, 0x18b1d270cc51055f, 0x18e6470cff6546b6,
    0x191bd8d03f3e9864, 0x1951678227871f3e, 0x1985c162b168e70e, 0x19bb31bb5dc320d2,
    0x19f0ff151a99f483, 0x1a253eda614071a4, 0x1a5a8e90f9908e0d, 0x1a90991a9bfa58c8,
    0x1ac4bf6142f8eefa, 0x1af9ef3993b72ab8, 0x1b303583fc527ab3, 0x1b6442e4fb671960,
    0x1b99539e3a40dfb8, 0x1bcfa885c8d117a6, 0x1c03c9539d82aec8, 0x1c38bba884e35a7a,
    0x1c6eea92a61c3118, 0x1ca3529ba7d19eaf, 0x1cd8274291c6065b, 0x1d0e3113363787f2,
    0x1d42deac01e2b4f7, 0x1d779657025b6235, 0x1dad7becc2f23ac2, 0x1de26d73f9d764b9,
    0x1e1708d0f84d3de7, 0x1e4ccb0536608d61, 0x1e81fee341fc585d, 0x1eb67e9c127b6e74,
    0x1eec1e43171a4a11, 0x1f2192e9ee706e4b, 0x1f55f7a46a0c89dd, 0x1f8b758d848fac55,
    0x1fc1297872d9cbb5, 0x1ff573d68f903ea2, 0x202ad0cc33744e4b, 0x2060c27fa028b0ef,
    0x2094f31f8832dd2a, 0x20ca2fe76a3f9475, 0x21005df0a267bcc9, 0x2134756ccb01abfb,
    0x216992c7fdc216fa, 0x219ff779fd329cb9, 0x21d3faac3e3fa1f3, 0x2208f9574dcf8a70,
    0x223f37ad21436d0c, 0x227382cc34ca2428, 0x22a8637f41fcad32, 0x22de7c5f127bd87e,
    0x23130dbb6b8d674f, 0x2347d12a4670c123, 0x237dc574d80cf16b, 0x23b29b69070816e3,
    0x23e7424348ca1c9c, 0x241d12d41afca3c3, 0x24522bc490dde65a, 0x2486b6b5b5155ff0,
    0x24bc6463225ab7ec, 0x24f1bebdf578b2f4, 0x25262e6d72d6dfb0, 0x255bba08cf8c979d,
    0x2591544581b7dec2, 0x25c5a956e225d672, 0x25fb13ac9aaf4c0f, 0x2630ec4be0ad8f89,
    0x2665275ed8d8f36c, 0x269a71368f0f3047, 0x26d086c219697e2c, 0x2704a8729fc3ddb7,
    0x2739d28f47b4d525, 0x277023998cd10537, 0x27a42c7ff0054685, 0x27d9379fec069826,
    0x280f8587e7083e30, 0x2843b374f06526de, 0x2878a0522c7e7095, 0x28aec866b79e0cba,
    0x28e33d4032c2c7f5, 0x29180c903f7379f2, 0x294e0fb44f50586e, 0x2982c9d0b1923745,
    0x29b77c44ddf6c516, 0x29ed5b561574765b, 0x2a225915cd68c9f9, 0x2a56ef5b40c2fc77,
    0x2a8cab3210f3bb95, 0x2ac1eaff4a98553d, 0x2af665bf1d3e6a8d, 0x2b2bff2ee48e0530,
    0x2b617f7d4ed8c33e, 0x2b95df5ca28ef40d, 0x2bcb5733cb32b111, 0x2c0116805effaeaa,
    0x2c355c2076bf9a55, 0x2c6ab328946f80ea, 0x2ca0aff95cc5b092, 0x2cd4dbf7b3f71cb7,
    0x2d0a12f5a0f4e3e5, 0x2d404bd984990e6f, 0x2d745ecfe5bf520b, 0x2da97683df2f268d,
    0x2ddfd424d6faf031, 0x2e13e497065cd61f, 0x2e48ddbcc7f40ba6, 0x2e7f152bf9f10e90,
    0x2eb36d3b7c36a91a, 0x2ee8488a5b445360, 0x2f1e5aacf2156838, 0x2f52f8ac174d6123,
    0x2f87b6d71d20b96c, 0x2fbda48ce468e7c7, 0x2ff286d80ec190dc, 0x3027288e1271f513,
    0x305cf2b1970e7258, 0x309217aefe690777, 0x30c69d9abe034955, 0x30fc45016d841baa,
    0x3131ab20e472914a, 0x316615e91d8f359d, 0x319b9b6364f30304, 0x31d1411e1f17e1e3,
    0x32059165a6ddda5b, 0x323af5bf109550f2, 0x3270d9976a5d5297, 0x32a50ffd44f4a73d,
    0x32da53fc9631d10d, 0x3310747ddddf22a8, 0x3344919d5556eb52, 0x3379b604aaaca626,
    0x33b011c2eaabe7d8, 0x33e41633a556e1ce, 0x34191bc08eac9a41, 0x344f62b0b257c0d2,
    0x34839dae6f76d883, 0x34b8851a0b548ea4, 0x34eea6608e29b24d, 0x352327fc58da0f70,
    0x3557f1fb6f10934c, 0x358dee7a4ad4b81f, 0x35c2b50c6ec4f313, 0x35f7624f8a762fd8,
    0x362d3ae36d13bbce, 0x366244ce242c5561, 0x3696d601ad376ab9, 0x36cc8b8218854567,
    0x3701d7314f534b61, 0x37364cfda3281e39, 0x376be03d0bf225c7, 0x37a16c262777579c,
    0x37d5c72fb1552d83, 0x380b38fb9daa78e4, 0x3841039d428a8b8f, 0x38754484932d2e72,
    0x38aa95a5b7f87a0f, 0x38e09d8792fb4c49, 0x3914c4e977ba1f5c, 0x3949f623d5a8a733,
    0x398039d665896880, 0x39b4484bfeebc2a0, 0x39e95a5efea6b347, 0x3a1fb0f6be506019,
    0x3a53ce9a36f23c10, 0x3a88c240c4aecb14, 0x3abef2d0f5da7dd9, 0x3af357c299a88ea7,
    0x3b282db34012b251, 0x3b5e392010175ee6, 0x3b92e3b40a0e9b4f, 0x3bc79ca10c924223,
    0x3bfd83c94fb6d2ac, 0x3c32725dd1d243ac, 0x3c670ef54646d497, 0x3c9cd2b297d889bc,
    0x3cd203af9ee75616, 0x3d06849b86a12b9b, 0x3d3c25c268497682, 0x3d719799812dea11,
    0x3da5fd7fe1796495, 0x3ddb7cdfd9d7bdbb, 0x3e112e0be826d695, 0x3e45798ee2308c3a,
    0x3e7ad7f29abcaf48, 0x3eb0c6f7a0b5ed8d, 0x3ee4f8b588e368f1, 0x3f1a36e2eb1c432d,
    0x3f50624dd2f1a9fc, 0x3f847ae147ae147b, 0x3fb999999999999a, 0x3ff0000000000000,
    0x4024000000000000, 0x4059000000000000, 0x408f400000000000, 0x40c3880000000000,
    0x40f86a0000000000, 0x412e848000000000, 0x416312d000000000, 0x4197d78400000000,
    0x41cdcd6500000000, 0x4202a05f20000000, 0x42374876e8000000, 0x426d1a94a2000000,
    0x42a2309ce5400000, 0x42d6bcc41e900000, 0x430c6bf526340000, 0x4341c37937e08000,
    0x4376345785d8a000, 0x43abc16d674ec800, 0x43e158e460913d00, 0x4415af1d78b58c40,
    0x444b1ae4d6e2ef50, 0x4480f0cf064dd592, 0x44b52d02c7e14af7, 0x44ea784379d99db4,
    0x45208b2a2c280291, 0x4554adf4b7320335, 0x4589d971e4fe8402, 0x45c027e72f1f1281,
    0x45f431e0fae6d721, 0x46293e5939a08cea, 0x465f8def8808b024, 0x4693b8b5b5056e17,
    0x46c8a6e32246c99c, 0x46fed09bead87c03, 0x4733426172c74d82, 0x476812f9cf7920e3,
    0x479e17b84357691b, 0x47d2ced32a16a1b1, 0x48078287f49c4a1d, 0x483d6329f1c35ca5,
    0x48725dfa371a19e7, 0x48a6f578c4e0a061, 0x48dcb2d6f618c879, 0x4911efc659cf7d4c,
    0x49466bb7f0435c9e, 0x497c06a5ec5433c6, 0x49b18427b3b4a05c, 0x49e5e531a0a1c873,
    0x4a1b5e7e08ca3a8f, 0x4a511b0ec57e649a, 0x4a8561d276ddfdc0, 0x4ababa4714957d30,
    0x4af0b46c6cdd6e3e, 0x4b24e1878814c9ce, 0x4b5a19e96a19fc41, 0x4b905031e2503da9,
    0x4bc4643e5ae44d13, 0x4bf97d4df19d6057, 0x4c2fdca16e04b86d, 0x4c63e9e4e4c2f344,
    0x4c98e45e1df3b015, 0x4ccf1d75a5709c1b, 0x4d03726987666191, 0x4d384f03e93ff9f5,
    0x4d6e62c4e38ff872, 0x4da2fdbb0e39fb47, 0x4dd7bd29d1c87a19, 0x4e0dac74463a989f,
    0x4e428bc8abe49f64, 0x4e772ebad6ddc73d, 0x4eacfa698c95390c, 0x4ee21c81f7dd43a7,
    0x4f16a3a275d49491, 0x4f4c4c8b1349b9b5, 0x4f81afd6ec0e1411, 0x4fb61bcca7119916,
    0x4feba2bfd0d5ff5b, 0x502145b7e285bf99, 0x50559725db272f7f, 0x508afcef51f0fb5f,
    0x50c0de1593369d1b, 0x50f5159af8044462, 0x512a5b01b605557b, 0x516078e111c3556d,
    0x5194971956342ac8, 0x51c9bcdfabc1357a, 0x5200160bcb58c16c, 0x52341b8ebe2ef1c7,
    0x526922726dbaae39, 0x529f6b0f092959c7, 0x52d3a2e965b9d81d, 0x53088ba3bf284e24,
    0x533eae8caef261ad, 0x53732d17ed577d0c, 0x53a7f85de8ad5c4f, 0x53ddf67562d8b363,
    0x5412ba095dc7701e, 0x5447688bb5394c25, 0x547d42aea2879f2e, 0x54b249ad2594c37d,
    0x54e6dc186ef9f45c, 0x551c931e8ab87173, 0x5551dbf316b346e8, 0x558652efdc6018a2,
    0x55bbe7abd3781eca, 0x55f170cb642b133f, 0x5625ccfe3d35d80e, 0x565b403dcc834e12,
    0x569108269fd210cb, 0x56c54a3047c694fe, 0x56fa9cbc59b83a3d, 0x5730a1f5b8132466,
    0x5764ca732617ed80, 0x5799fd0fef9de8e0, 0x57d03e29f5c2b18c, 0x58044db473335def,
    0x583961219000356b, 0x586fb969f40042c5, 0x58a3d3e2388029bb, 0x58d8c8dac6a0342a,
    0x590efb1178484135, 0x59435ceaeb2d28c1, 0x59783425a5f872f1, 0x59ae412f0f768fad,
    0x59e2e8bd69aa19cc, 0x5a17a2ecc414a03f, 0x5a4d8ba7f519c84f, 0x5a827748f9301d32,
    0x5ab7151b377c247e, 0x5aecda62055b2d9e, 0x5b22087d4358fc82, 0x5b568a9c942f3ba3,
    0x5b8c2d43b93b0a8c, 0x5bc19c4a53c4e697, 0x5bf6035ce8b6203d, 0x5c2b843422e3a84d,
    0x5c6132a095ce4930, 0x5c957f48bb41db7c, 0x5ccadf1aea12525b, 0x5d00cb70d24b7379,
    0x5d34fe4d06de5057, 0x5d6a3de04895e46d, 0x5da066ac2d5daec4, 0x5dd4805738b51a75,
    0x5e09a06d06e26112, 0x5e400444244d7cab, 0x5e7405552d60dbd6, 0x5ea906aa78b912cc,
    0x5edf485516e7577f, 0x5f138d352e5096af, 0x5f48708279e4bc5b, 0x5f7e8ca3185deb72,
    0x5fb317e5ef3ab327, 0x5fe7dddf6b095ff1, 0x601dd55745cbb7ed, 0x6052a5568b9f52f4,
    0x60874eac2e8727b1, 0x60bd22573a28f19d, 0x60f2357684599702, 0x6126c2d4256ffcc3,
    0x615c73892ecbfbf4, 0x6191c835bd3f7d78, 0x61c63a432c8f5cd6, 0x61fbc8d3f7b3340c,
    0x62315d847ad00087, 0x6265b4e5998400a9, 0x629b221effe500d4, 0x62d0f5535fef2084,
    0x630532a837eae8a5, 0x633a7f5245e5a2cf, 0x63708f936baf85c1, 0x63a4b378469b6732,
    0x63d9e056584240fe, 0x64102c35f729689f, 0x6444374374f3c2c6, 0x647945145230b378,
    0x64af965966bce056, 0x64e3bdf7e0360c36, 0x6518ad75d8438f43, 0x654ed8d34e547314,
    0x6583478410f4c7ec, 0x65b819651531f9e8, 0x65ee1fbe5a7e7861, 0x6622d3d6f88f0b3d,
    0x665788ccb6b2ce0c, 0x668d6affe45f818f, 0x66c262dfeebbb0f9, 0x66f6fb97ea6a9d38,
    0x672cba7de5054486, 0x6761f48eaf234ad4, 0x679671b25aec1d89, 0x67cc0e1ef1a724eb,
    0x680188d357087713, 0x6835eb082cca94d7, 0x686b65ca37fd3a0d, 0x68a11f9e62fe4448,
    0x68d56785fbbdd55a, 0x690ac1677aad4ab1, 0x6940b8e0acac4eaf, 0x6974e718d7d7625a,
    0x69aa20df0dcd3af1, 0x69e0548b68a044d6, 0x6a1469ae42c8560c, 0x6a498419d37a6b8f,
    0x6a7fe52048590673, 0x6ab3ef342d37a408, 0x6ae8eb0138858d0a, 0x6b1f25c186a6f04c,
    0x6b537798f4285630, 0x6b88557f31326bbb, 0x6bbe6adefd7f06aa, 0x6bf302cb5e6f642a,
    0x6c27c37e360b3d35, 0x6c5db45dc38e0c82, 0x6c9290ba9a38c7d1, 0x6cc734e940c6f9c6,
    0x6cfd022390f8b837, 0x6d3221563a9b7323, 0x6d66a9abc9424feb, 0x6d9c5416bb92e3e6,
    0x6dd1b48e353bce70, 0x6e0621b1c28ac20c, 0x6e3baa1e332d728f, 0x6e714a52dffc6799,
    0x6ea59ce797fb817f, 0x6edb04217dfa61df, 0x6f10e294eebc7d2c, 0x6f451b3a2a6b9c76,
    0x6f7a6208b5068394, 0x6fb07d457124123d, 0x6fe49c96cd6d16cc, 0x7019c3bc80c85c7f,
    0x70501a55d07d39cf, 0x708420eb449c8843, 0x70b9292615c3aa54, 0x70ef736f9b3494e9,
    0x7123a825c100dd11, 0x7158922f31411456, 0x718eb6bafd91596b, 0x71c33234de7ad7e3,
    0x71f7fec216198ddc, 0x722dfe729b9ff153, 0x7262bf07a143f6d4, 0x72976ec98994f489,
    0x72cd4a7bebfa31ab, 0x73024e8d737c5f0b, 0x7336e230d05b76cd, 0x736c9abd04725481,
    0x73a1e0b622c774d0, 0x73d658e3ab795204, 0x740bef1c9657a686, 0x74417571ddf6c814,
    0x7475d2ce55747a18, 0x74ab4781ead1989e, 0x74e10cb132c2ff63, 0x75154fdd7f73bf3c,
    0x754aa3d4df50af0b, 0x7580a6650b926d67, 0x75b4cffe4e7708c0, 0x75ea03fde214caf1,
    0x7620427ead4cfed6, 0x7654531e58a03e8c, 0x768967e5eec84e2f, 0x76bfc1df6a7a61bb,
    0x76f3d92ba28c7d15, 0x7728cf768b2f9c5a, 0x775f03542dfb8370, 0x779362149cbd3226,
    0x77c83a99c3ec7eb0, 0x77fe494034e79e5c, 0x7832edc82110c2f9, 0x7867a93a2954f3b8,
    0x789d9388b3aa30a5, 0x78d27c35704a5e67, 0x79071b42cc5cf601, 0x793ce2137f743382,
    0x79720d4c2fa8a031, 0x79a6909f3b92c83d, 0x79dc34c70a777a4d, 0x7a11a0fc668aac70,
    0x7a46093b802d578c, 0x7a7b8b8a6038ad6f, 0x7ab137367c236c65, 0x7ae585041b2c477f,
    0x7b1ae64521f7595e, 0x7b50cfeb353a97db, 0x7b8503e602893dd2, 0x7bba44df832b8d46,
    0x7bf06b0bb1fb384c, 0x7c2485ce9e7a065f, 0x7c59a742461887f6, 0x7c9008896bcf54fa,
    0x7cc40aabc6c32a38, 0x7cf90d56b873f4c7, 0x7d2f50ac6690f1f8, 0x7d63926bc01a973b,
    0x7d987706b0213d0a, 0x7dce94c85c298c4c, 0x7e031cfd3999f7b0, 0x7e37e43c8800759c,
    0x7e6ddd4baa009303, 0x7ea2aa4f4a405be2, 0x7ed754e31cd072da, 0x7f0d2a1be4048f90,
    0x7f423a516e82d9ba, 0x7f76c8e5ca239029, 0x7fac7b1f3cac7433, 0x7fe1ccf385ebc8a0,
];

// --------------------------------------------------------------------- text

/// The field as `TextDecoder.decode` and `unescapeQuotes` give it.
fn field_text(b: &[u8]) -> Cow<'_, str> {
    let b = b.strip_prefix(&[0xEF, 0xBB, 0xBF]).unwrap_or(b);
    let s = String::from_utf8_lossy(b);
    if b.contains(&QUOTE) && s.contains("\"\"") {
        Cow::Owned(s.replace("\"\"", "\""))
    } else {
        s
    }
}

/// A field's bytes trimmed of spaces and tabs, then of one surrounding pair of quotes.
#[inline]
fn trim_field(buf: &[u8], mut s: usize, mut e: usize) -> (usize, usize) {
    while s < e && (buf[s] == SPACE || buf[s] == TAB) {
        s += 1;
    }
    while e > s && (buf[e - 1] == SPACE || buf[e - 1] == TAB) {
        e -= 1;
    }
    if e - s >= 2 && buf[s] == QUOTE && buf[e - 1] == QUOTE {
        s += 1;
        e -= 1;
    }
    (s, e)
}

#[derive(Default)]
struct FxHasher(u64);

impl Hasher for FxHasher {
    #[inline]
    fn write(&mut self, bytes: &[u8]) {
        const K: u64 = 0x51_7c_c1_b7_27_22_0a_95;
        let mut h = self.0;
        let mut c = bytes.chunks_exact(8);
        for w in &mut c {
            h = (h.rotate_left(5) ^ u64::from_le_bytes(w.try_into().unwrap())).wrapping_mul(K);
        }
        for &b in c.remainder() {
            h = (h.rotate_left(5) ^ b as u64).wrapping_mul(K);
        }
        self.0 = h;
    }
    #[inline]
    fn write_u8(&mut self, b: u8) {
        self.0 = (self.0.rotate_left(5) ^ b as u64).wrapping_mul(0x51_7c_c1_b7_27_22_0a_95);
    }
    #[inline]
    fn finish(&self) -> u64 {
        self.0
    }
}

/// One range's dictionary, in its own order of first appearance.
#[derive(Default)]
struct LocalDict {
    map: HashMap<Box<str>, u32, BuildHasherDefault<FxHasher>>,
    labels: Vec<Box<str>>,
}

impl LocalDict {
    #[inline]
    fn intern(&mut self, s: &str) -> u32 {
        if let Some(&id) = self.map.get(s) {
            return id;
        }
        let id = self.labels.len() as u32;
        self.labels.push(s.into());
        self.map.insert(s.into(), id);
        id
    }
}

// --------------------------------------------------------------------- plan

#[derive(Clone, Copy)]
enum Sink {
    Num(usize),
    Txt(usize),
}

/// The plan, laid out for the scan.
struct Prep {
    delim: u8,
    /// One past the highest mapped column.
    ncols: usize,
    col_sinks: Vec<Vec<Sink>>,
    /// Columns with sinks, ascending.
    mapped_cols: Vec<usize>,
    num_slots: usize,
    txt_slots: usize,
    wide: Option<usize>,
    num_only: Vec<bool>,
    txt_only: Vec<bool>,
    axes: Vec<usize>,
    num_tests: Vec<(usize, Test)>,
    txt_tests: Vec<(usize, Test)>,
    filtering: bool,
    step: u64,
    has_header: bool,
    test_slots: usize,
}

impl Prep {
    fn new(plan: &CsvPlan) -> anyhow::Result<Self> {
        let num_slots = plan.number_columns.len();
        let txt_slots = plan.text_columns.len();
        let ncols = plan
            .number_columns
            .iter()
            .chain(&plan.text_columns)
            .map(|&c| c + 1)
            .max()
            .unwrap_or(0);
        let mut col_sinks: Vec<Vec<Sink>> = vec![Vec::new(); ncols];
        for (slot, &c) in plan.number_columns.iter().enumerate() {
            col_sinks[c].push(Sink::Num(slot));
        }
        for (slot, &c) in plan.text_columns.iter().enumerate() {
            col_sinks[c].push(Sink::Txt(slot));
        }
        let mapped_cols = (0..ncols).filter(|&c| !col_sinks[c].is_empty()).collect();
        if let Some(w) = plan.wide_slot {
            anyhow::ensure!(w < num_slots, "CSV plan: wide slot {w} out of range");
        }
        let mut num_only = vec![false; num_slots];
        let mut num_tests = Vec::new();
        for (slot, c) in &plan.number_tests {
            anyhow::ensure!(*slot < num_slots, "CSV plan: test slot {slot} out of range");
            num_only[*slot] = true;
            num_tests.push((*slot, c.compile()));
        }
        let mut txt_only = vec![false; txt_slots];
        let mut txt_tests = Vec::new();
        for (slot, c) in &plan.text_tests {
            anyhow::ensure!(*slot < txt_slots, "CSV plan: test slot {slot} out of range");
            txt_only[*slot] = true;
            txt_tests.push((*slot, c.compile()));
        }
        let axes: Vec<usize> = plan.axis_slots.iter().flatten().copied().collect();
        for &a in &axes {
            anyhow::ensure!(a < num_slots, "CSV plan: axis slot {a} out of range");
        }
        let test_slots = num_only.iter().chain(&txt_only).filter(|&&t| t).count();
        Ok(Self {
            delim: plan.delimiter,
            ncols,
            col_sinks,
            mapped_cols,
            num_slots,
            txt_slots,
            wide: plan.wide_slot,
            filtering: !num_tests.is_empty() || !txt_tests.is_empty(),
            num_only,
            txt_only,
            axes,
            num_tests,
            txt_tests,
            step: plan.stride.max(1) as u64,
            has_header: plan.has_header,
            test_slots,
        })
    }
}

/// What the row buffers hold where a range begins.
#[derive(Clone)]
struct State {
    nums: Vec<f64>,
    txts: Vec<Option<String>>,
}

impl State {
    fn initial(p: &Prep) -> Self {
        Self {
            nums: vec![0.0; p.num_slots],
            txts: vec![None; p.txt_slots],
        }
    }
}

/// The state where each range begins, from the values each range left behind.
fn fold_states(initial: &State, outs: &[RangeOut]) -> Vec<State> {
    let mut states = Vec::with_capacity(outs.len());
    let mut st = initial.clone();
    for o in outs {
        states.push(st.clone());
        for (slot, v) in o.out_nums.iter().enumerate() {
            if let Some(v) = v {
                st.nums[slot] = *v;
            }
        }
        for (slot, v) in o.out_txts.iter().enumerate() {
            if let Some(v) = v {
                st.txts[slot] = Some(v.clone());
            }
        }
    }
    states
}

// -------------------------------------------------------------------- split

/// Ranges of whole lines as far as line ends tell, cut without regard to quotes
/// (`fix_cuts` puts right a cut that fell inside them).
fn split(bytes: &[u8], delim: u8, parts: usize) -> Vec<(usize, usize)> {
    let n = bytes.len();
    if parts <= 1 || n == 0 || matches!(delim, LF | CR | QUOTE) {
        return vec![(0, n)];
    }
    let bounds: Vec<usize> = (0..=parts)
        .map(|k| ((k as u128 * n as u128) / parts as u128) as usize)
        .collect();
    let found: Vec<Option<usize>> = (1..parts)
        .into_par_iter()
        .map(|k| {
            (bounds[k]..bounds[k + 1])
                .find(|&pos| is_line_end(bytes, pos))
                .map(|pos| pos + 1)
        })
        .collect();
    let mut starts = vec![0usize];
    for s in found.into_iter().flatten() {
        if s < n && s > *starts.last().unwrap() {
            starts.push(s);
        }
    }
    let mut ranges = Vec::with_capacity(starts.len());
    for (k, &s) in starts.iter().enumerate() {
        ranges.push((s, starts.get(k + 1).copied().unwrap_or(n)));
    }
    ranges
}

/// A byte after which a line starts, outside quotes: LF, or a CR not followed by LF.
#[inline]
fn is_line_end(bytes: &[u8], pos: usize) -> bool {
    let c = bytes[pos];
    c == LF || (c == CR && bytes.get(pos + 1) != Some(&LF))
}

fn count_quotes(b: &[u8]) -> usize {
    b.chunks(1 << 16)
        .map(|c| c.iter().fold(0u32, |a, &x| a + (x == QUOTE) as u32) as usize)
        .sum()
}

/// The first line start after a line end outside quotes in `lo..hi`.
fn line_start_after(bytes: &[u8], lo: usize, hi: usize, mut in_quotes: bool) -> Option<usize> {
    for pos in lo..hi {
        let c = bytes[pos];
        if c == QUOTE {
            in_quotes = !in_quotes;
        } else if !in_quotes && is_line_end(bytes, pos) {
            return Some(pos + 1);
        }
    }
    None
}

// --------------------------------------------------------------------- scan

/// Bits of the bytes in `b[..64]` that are the delimiter, a quote or a line end.
#[inline]
fn block_mask(b: &[u8; 64], d: u8) -> u64 {
    #[cfg(target_arch = "x86_64")]
    unsafe {
        use std::arch::x86_64::*;
        let vd = _mm_set1_epi8(d as i8);
        let vq = _mm_set1_epi8(QUOTE as i8);
        let vl = _mm_set1_epi8(LF as i8);
        let vc = _mm_set1_epi8(CR as i8);
        let mut m = 0u64;
        for k in 0..4 {
            let v = _mm_loadu_si128(b.as_ptr().add(16 * k) as *const __m128i);
            let x = _mm_or_si128(
                _mm_or_si128(_mm_cmpeq_epi8(v, vd), _mm_cmpeq_epi8(v, vq)),
                _mm_or_si128(_mm_cmpeq_epi8(v, vl), _mm_cmpeq_epi8(v, vc)),
            );
            m |= (_mm_movemask_epi8(x) as u32 as u64 & 0xffff) << (16 * k);
        }
        m
    }
    #[cfg(not(target_arch = "x86_64"))]
    {
        let mut m = 0u64;
        for (k, &c) in b.iter().enumerate() {
            if c == d || c == QUOTE || c == LF || c == CR {
                m |= 1 << k;
            }
        }
        m
    }
}

/// What one range collected.
#[derive(Default)]
struct RangeOut {
    nums: Vec<Vec<f32>>,
    wide: Vec<f64>,
    dicts: Vec<LocalDict>,
    ids: Vec<Vec<u32>>,
    rows: u64,
    rejected: u64,
    filtered_rows: u64,
    filtered_out: u64,
    /// Rows that passed the filter (what the stride counts).
    passed: u64,
    /// Per slot, the value the range left behind; `None` when no row of it set one.
    out_nums: Vec<Option<f64>>,
    out_txts: Vec<Option<String>>,
    /// A row needed a value from before the range, which was not known.
    dirty: bool,
    /// A set clause read a text slot no row had set yet.
    initial_tested: bool,
    /// The scan ended inside quotes: the range holds an odd number of them.
    end_in_quotes: bool,
    /// What stopped the scan; the file's error only when the range began at a true line start.
    error: Option<anyhow::Error>,
}

struct Scan<'a> {
    p: &'a Prep,
    count_mode: bool,
    /// Only the values left behind are tracked any more (a dirty range).
    state_only: bool,
    incoming_known: bool,
    header_pending: bool,
    seen: u64,
    cur_num: Vec<f64>,
    cur_txt: Vec<u32>,
    set_num: Vec<bool>,
    set_txt: Vec<bool>,
    span_num: Vec<Option<(usize, usize)>>,
    span_txt: Vec<Option<(usize, usize)>>,
    /// Per text slot, the bytes it last interned and their id.
    last_txt: Vec<Option<(usize, usize, u32)>>,
    known_num: Vec<bool>,
    known_txt: Vec<bool>,
    unknown_all: usize,
    unknown_test: usize,
    /// Per set clause, per dictionary id: 0 untested, 1 pass, 2 fail.
    cache: Vec<Vec<u8>>,
    spans: Vec<(usize, usize)>,
    fcount: usize,
    overflow: bool,
    first_empty: bool,
    out: RangeOut,
}

fn scan_range(
    p: &Prep,
    buf: &[u8],
    first: bool,
    incoming: Option<&State>,
    count_mode: bool,
    seen: u64,
) -> RangeOut {
    let mut out = RangeOut {
        nums: vec![Vec::new(); p.num_slots],
        dicts: (0..p.txt_slots).map(|_| LocalDict::default()).collect(),
        ids: vec![Vec::new(); p.txt_slots],
        ..Default::default()
    };
    let known = incoming.is_some();
    let mut cur_num = vec![0.0; p.num_slots];
    let mut cur_txt = vec![INITIAL; p.txt_slots];
    if let Some(st) = incoming {
        cur_num.copy_from_slice(&st.nums);
        for (slot, v) in st.txts.iter().enumerate() {
            if let Some(label) = v {
                // Already in the dictionary of an earlier range: re-interning it here
                // leaves the order of first appearance as it is.
                cur_txt[slot] = out.dicts[slot].intern(label);
            }
        }
    }
    if !count_mode && !p.filtering && buf.len() > 4096 {
        // The rows, guessed from the line ends in the first 64 KiB, to spare most
        // regrowths. Not when filtering: what passes is anyone's guess.
        let sample = &buf[..buf.len().min(1 << 16)];
        let lines = sample.iter().filter(|&&c| c == LF).count().max(1);
        let rows =
            (buf.len() as u128 * lines as u128 * 102 / 100 / sample.len() as u128) as usize + 16;
        let rows = rows / p.step as usize + 1;
        for (slot, v) in out.nums.iter_mut().enumerate() {
            if !p.num_only[slot] && Some(slot) != p.wide {
                v.reserve(rows);
            }
        }
        if p.wide.is_some() {
            out.wide.reserve(rows);
        }
        for (slot, v) in out.ids.iter_mut().enumerate() {
            if !p.txt_only[slot] {
                v.reserve(rows);
            }
        }
    }
    let mut s = Scan {
        p,
        count_mode,
        state_only: false,
        incoming_known: known,
        header_pending: first && p.has_header,
        seen,
        cur_num,
        cur_txt,
        set_num: vec![false; p.num_slots],
        set_txt: vec![false; p.txt_slots],
        span_num: vec![None; p.num_slots],
        span_txt: vec![None; p.txt_slots],
        last_txt: vec![None; p.txt_slots],
        known_num: vec![known; p.num_slots],
        known_txt: vec![known; p.txt_slots],
        unknown_all: if known { 0 } else { p.num_slots + p.txt_slots },
        unknown_test: if known { 0 } else { p.test_slots },
        cache: vec![Vec::new(); p.txt_tests.len()],
        spans: vec![(0, 0); p.ncols],
        fcount: 0,
        overflow: false,
        first_empty: false,
        out,
    };
    if let Err(e) = s.run(buf) {
        s.out.error = Some(e);
    }
    s.finish(buf)
}

impl Scan<'_> {
    fn run(&mut self, buf: &[u8]) -> anyhow::Result<()> {
        let n = buf.len();
        let d = self.p.delim;
        let mut i = 0usize;
        let mut in_q = false;
        let mut field_start = 0usize;
        let mut base = 0usize;
        let mut tail = [0u8; 64];
        while base < n {
            let mut m = if base + 64 <= n {
                block_mask(buf[base..base + 64].try_into().unwrap(), d)
            } else {
                let len = n - base;
                tail[..len].copy_from_slice(&buf[base..]);
                block_mask(&tail, d) & ((1u64 << len) - 1)
            };
            while m != 0 {
                let pos = base + m.trailing_zeros() as usize;
                m &= m - 1;
                if pos < i {
                    continue;
                }
                let c = buf[pos];
                if in_q {
                    if c != QUOTE {
                        continue;
                    }
                    if pos + 1 < n && buf[pos + 1] == QUOTE {
                        i = pos + 2;
                        continue;
                    }
                    in_q = false;
                    i = pos + 1;
                    continue;
                }
                if c == QUOTE {
                    in_q = true;
                    i = pos + 1;
                    continue;
                }
                if c == d {
                    self.push_field(field_start, pos);
                    i = pos + 1;
                    field_start = i;
                    continue;
                }
                self.push_field(field_start, pos);
                self.flush_row(buf)?;
                i = if c == CR && pos + 1 < n && buf[pos + 1] == LF {
                    pos + 2
                } else {
                    pos + 1
                };
                field_start = i;
                self.fcount = 0;
                self.overflow = false;
            }
            base += 64;
        }
        if field_start < n || self.fcount > 0 {
            self.push_field(field_start, n);
            self.flush_row(buf)?;
        }
        self.out.end_in_quotes = in_q;
        Ok(())
    }

    #[inline]
    fn push_field(&mut self, s: usize, e: usize) {
        if self.fcount >= MAX_FIELDS {
            self.overflow = true;
            return;
        }
        if self.fcount == 0 {
            self.first_empty = s == e;
        }
        if self.fcount < self.p.ncols {
            self.spans[self.fcount] = (s, e);
        }
        self.fcount += 1;
    }

    #[inline]
    fn active_num(&self, slot: usize) -> bool {
        !self.state_only && (!self.count_mode || self.p.num_only[slot])
    }

    #[inline]
    fn active_txt(&self, slot: usize) -> bool {
        !self.state_only && (!self.count_mode || self.p.txt_only[slot])
    }

    #[inline]
    fn mark_num(&mut self, slot: usize) {
        if !self.known_num[slot] {
            self.known_num[slot] = true;
            self.unknown_all -= 1;
            if self.p.num_only[slot] {
                self.unknown_test -= 1;
            }
        }
    }

    #[inline]
    fn mark_txt(&mut self, slot: usize) {
        if !self.known_txt[slot] {
            self.known_txt[slot] = true;
            self.unknown_all -= 1;
            if self.p.txt_only[slot] {
                self.unknown_test -= 1;
            }
        }
    }

    fn flush_row(&mut self, buf: &[u8]) -> anyhow::Result<()> {
        if self.header_pending {
            self.header_pending = false;
            return Ok(());
        }
        if self.fcount == 1 && self.first_empty {
            return Ok(());
        }
        if self.overflow {
            anyhow::bail!("data.csv.tooManyFields: a row has more than {MAX_FIELDS} fields");
        }
        let p = self.p;
        let lim = self.fcount.min(p.ncols);
        for &c in &p.mapped_cols {
            if c >= lim {
                break;
            }
            let (s, e) = self.spans[c];
            let (s, e) = trim_field(buf, s, e);
            let mut num: Option<f64> = None;
            let mut txt: Option<Cow<'_, str>> = None;
            for &sink in &p.col_sinks[c] {
                match sink {
                    Sink::Num(slot) => {
                        if self.active_num(slot) {
                            let v = *num.get_or_insert_with(|| parse_number_bytes(&buf[s..e]));
                            self.cur_num[slot] = v;
                            self.set_num[slot] = true;
                            self.span_num[slot] = None;
                        } else {
                            self.span_num[slot] = Some((s, e));
                        }
                        self.mark_num(slot);
                    }
                    Sink::Txt(slot) => {
                        if self.active_txt(slot) {
                            // A run of the same text, as in telemetry sorted by player
                            // or session, skips decoding and hashing.
                            let id = match self.last_txt[slot] {
                                Some((ls, le, id)) if buf[ls..le] == buf[s..e] => id,
                                _ => {
                                    let t = txt.get_or_insert_with(|| field_text(&buf[s..e]));
                                    let id = self.out.dicts[slot].intern(t);
                                    self.last_txt[slot] = Some((s, e, id));
                                    id
                                }
                            };
                            self.cur_txt[slot] = id;
                            self.set_txt[slot] = true;
                            self.span_txt[slot] = None;
                        } else {
                            self.span_txt[slot] = Some((s, e));
                        }
                        self.mark_txt(slot);
                    }
                }
            }
        }
        if self.state_only {
            return Ok(());
        }
        if !self.incoming_known {
            let unknown = if self.count_mode {
                self.unknown_test
            } else {
                self.unknown_all
            };
            if unknown > 0 {
                self.out.dirty = true;
                self.state_only = true;
                return Ok(());
            }
        }
        if p.filtering {
            self.out.filtered_rows += 1;
            for (slot, test) in &p.num_tests {
                if !test.number(self.cur_num[*slot]) {
                    self.out.filtered_out += 1;
                    return Ok(());
                }
            }
            for k in 0..p.txt_tests.len() {
                if !self.passes_text(k) {
                    self.out.filtered_out += 1;
                    return Ok(());
                }
            }
        }
        self.out.passed += 1;
        if self.count_mode {
            return Ok(());
        }
        if p.step > 1 {
            let s = self.seen;
            self.seen += 1;
            if s % p.step != 0 {
                return Ok(());
            }
        }
        for &a in &p.axes {
            if !self.cur_num[a].is_finite() {
                self.out.rejected += 1;
                return Ok(());
            }
        }
        for slot in 0..p.num_slots {
            if p.num_only[slot] {
                continue;
            }
            if Some(slot) == p.wide {
                self.out.wide.push(self.cur_num[slot]);
            } else {
                self.out.nums[slot].push(self.cur_num[slot] as f32);
            }
        }
        for slot in 0..p.txt_slots {
            if !p.txt_only[slot] {
                self.out.ids[slot].push(self.cur_txt[slot]);
            }
        }
        self.out.rows += 1;
        Ok(())
    }

    /// `passesText`: one answer per dictionary id, the first one asked.
    fn passes_text(&mut self, k: usize) -> bool {
        let p = self.p;
        let (slot, ref test) = p.txt_tests[k];
        let mut id = self.cur_txt[slot];
        if id == INITIAL {
            self.out.initial_tested = true;
            id = 0;
        }
        let id = id as usize;
        let cache = &mut self.cache[k];
        if cache.len() <= id {
            cache.resize((id + 1).max(cache.len() * 2).max(256), 0);
        }
        let mut v = cache[id];
        if v == 0 {
            let pass = match self.out.dicts[slot].labels.get(id) {
                Some(label) => test.text(label),
                None => test.null(),
            };
            v = if pass { 1 } else { 2 };
            cache[id] = v;
        }
        v == 1
    }

    fn finish(mut self, buf: &[u8]) -> RangeOut {
        let p = self.p;
        self.out.out_nums = (0..p.num_slots)
            .map(|slot| match self.span_num[slot] {
                Some((s, e)) => Some(parse_number_bytes(&buf[s..e])),
                None => self.set_num[slot].then(|| self.cur_num[slot]),
            })
            .collect();
        self.out.out_txts = (0..p.txt_slots)
            .map(|slot| match self.span_txt[slot] {
                Some((s, e)) => Some(field_text(&buf[s..e]).into_owned()),
                None => self.set_txt[slot]
                    .then(|| self.out.dicts[slot].labels[self.cur_txt[slot] as usize].to_string()),
            })
            .collect();
        self.out
    }
}

// ------------------------------------------------------------------ assemble

/// The ranges' columns joined in file order. Each column's range parts are freed
/// as soon as it is joined, so the peak is the result and one column more.
fn assemble(p: &Prep, mut outs: Vec<RangeOut>) -> CsvColumns {
    let rows: u64 = outs.iter().map(|o| o.rows).sum();
    let rejected: u64 = outs.iter().map(|o| o.rejected).sum();
    let filtered = p.filtering.then(|| {
        let rows: u64 = outs.iter().map(|o| o.filtered_rows).sum();
        let out: u64 = outs.iter().map(|o| o.filtered_out).sum();
        FilterStats {
            rows,
            kept: rows - out,
            rows_skipped: 0,
            groups: 0,
            groups_skipped: 0,
        }
    });
    let mut numbers = Vec::with_capacity(p.num_slots);
    for slot in 0..p.num_slots {
        if p.num_only[slot] || Some(slot) == p.wide {
            numbers.push(Vec::new());
            continue;
        }
        let parts: Vec<Vec<f32>> = outs
            .iter_mut()
            .map(|o| std::mem::take(&mut o.nums[slot]))
            .collect();
        numbers.push(join(parts, |_, &v| v));
    }
    let wide = p.wide.map(|_| {
        join(
            outs.iter_mut()
                .map(|o| std::mem::take(&mut o.wide))
                .collect(),
            |_, &v| v,
        )
    });
    let mut texts = Vec::with_capacity(p.txt_slots);
    for slot in 0..p.txt_slots {
        let mut dict = Dict::new();
        let remaps: Vec<Vec<u32>> = outs
            .iter_mut()
            .map(|o| {
                std::mem::take(&mut o.dicts[slot])
                    .labels
                    .iter()
                    .map(|l| dict.intern(l))
                    .collect()
            })
            .collect();
        if !p.txt_only[slot] {
            let parts: Vec<Vec<u32>> = outs
                .iter_mut()
                .map(|o| std::mem::take(&mut o.ids[slot]))
                .collect();
            dict.ids = join(parts, |k, &id| {
                if id == INITIAL {
                    0
                } else {
                    remaps[k][id as usize]
                }
            });
        }
        texts.push(dict);
    }
    CsvColumns {
        numbers,
        wide,
        texts,
        rows: rows as usize,
        rejected: rejected as usize,
        filtered,
    }
}

/// `concat_map` over owned parts, which are freed when it returns.
fn join<S: Sync + Send, T: Send + Copy>(
    parts: Vec<Vec<S>>,
    f: impl Fn(usize, &S) -> T + Sync,
) -> Vec<T> {
    let slices: Vec<&[S]> = parts.iter().map(|v| v.as_slice()).collect();
    concat_map(&slices, f)
}

/// The parts one after another, each value mapped (`k` is the part), copied in parallel.
fn concat_map<S: Sync, T: Send + Copy>(
    parts: &[&[S]],
    f: impl Fn(usize, &S) -> T + Sync,
) -> Vec<T> {
    let total: usize = parts.iter().map(|p| p.len()).sum();
    let mut out: Vec<T> = Vec::with_capacity(total);
    {
        let mut spare: &mut [MaybeUninit<T>] = &mut out.spare_capacity_mut()[..total];
        let mut dsts = Vec::with_capacity(parts.len());
        for part in parts {
            let (a, b) = std::mem::take(&mut spare).split_at_mut(part.len());
            dsts.push(a);
            spare = b;
        }
        dsts.into_par_iter()
            .zip(parts.par_iter())
            .enumerate()
            .for_each(|(k, (dst, src))| {
                for (d, s) in dst.iter_mut().zip(src.iter()) {
                    d.write(f(k, s));
                }
            });
    }
    // SAFETY: every element of 0..total was written above.
    unsafe { out.set_len(total) };
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn plan(nums: &[usize], texts: &[usize]) -> CsvPlan {
        CsvPlan {
            delimiter: b',',
            number_columns: nums.to_vec(),
            text_columns: texts.to_vec(),
            stride: 1,
            has_header: true,
            ..Default::default()
        }
    }

    fn bits(v: &[f32]) -> Vec<u32> {
        v.iter()
            .map(|x| if x.is_nan() { 0x7fc0_0000 } else { x.to_bits() })
            .collect()
    }

    /// Every way of cutting `text` gives the sequential result.
    fn scan_all(text: &str, plan: &CsvPlan) -> CsvColumns {
        let one = scan_csv_parts(text.as_bytes(), plan, 1).unwrap();
        for parts in [2, 3, 7, 16, 61] {
            let many = scan_csv_parts(text.as_bytes(), plan, parts).unwrap();
            assert_eq!(one.rows, many.rows, "parts {parts}");
            assert_eq!(one.rejected, many.rejected, "parts {parts}");
            assert_eq!(one.filtered, many.filtered, "parts {parts}");
            for (a, b) in one.numbers.iter().zip(&many.numbers) {
                assert_eq!(bits(a), bits(b), "parts {parts}");
            }
            assert_eq!(
                one.wide
                    .as_ref()
                    .map(|w| w.iter().map(|x| x.to_bits()).collect::<Vec<_>>()),
                many.wide
                    .as_ref()
                    .map(|w| w.iter().map(|x| x.to_bits()).collect::<Vec<_>>())
            );
            for (a, b) in one.texts.iter().zip(&many.texts) {
                assert_eq!(a.labels, b.labels, "parts {parts}");
                assert_eq!(a.ids, b.ids, "parts {parts}");
            }
        }
        one
    }

    #[test]
    fn numbers_as_parse_number_bytes() {
        let n = |s: &str| parse_number_bytes(s.as_bytes());
        assert_eq!(n("1.5"), 1.5);
        assert_eq!(n("-2"), -2.0);
        assert_eq!(n("+3"), 3.0);
        assert_eq!(n(".5"), 0.5);
        assert_eq!(n("5."), 5.0);
        assert_eq!(n("1e3"), 1000.0);
        assert_eq!(n("1E-2"), 0.01);
        assert_eq!(n("1e"), 1.0);
        assert_eq!(n("1e+"), 1.0);
        assert!(n("-0").is_sign_negative());
        for bad in [
            "", "-", ".", "e5", "1x", " 1", "1 ", "0x10", "Infinity", "NaN", "--1",
        ] {
            assert!(n(bad).is_nan(), "{bad:?}");
        }
        assert!(n("0e999999").is_nan());
        assert_eq!(n("1e999"), f64::INFINITY);
        assert_eq!(n("12345678901234567890"), 12345678901234567.0 * 1000.0);
    }

    #[test]
    fn header_blank_lines_quotes_and_line_ends() {
        let text = "a,b,c\r\n1,\"x,y\",2\n\n\r\n 3 ,\"q\"\"r\",\t4\r5,\"multi\nline\",6\n7,plain,8";
        let c = scan_all(text, &plan(&[0, 2], &[1]));
        assert_eq!(c.rows, 4);
        assert_eq!(c.numbers[0], [1.0, 3.0, 5.0, 7.0]);
        assert_eq!(c.numbers[1], [2.0, 4.0, 6.0, 8.0]);
        assert_eq!(c.texts[0].labels, ["x,y", "q\"r", "multi\nline", "plain"]);
        assert_eq!(c.texts[0].ids, [0, 1, 2, 3]);
    }

    #[test]
    fn short_rows_keep_the_row_before() {
        // Slot values persist from the previous row when a row lacks the field.
        let text = "x,y,t\n1\n2,3,a\n4\n5,6\n";
        let mut p = plan(&[0, 1], &[2]);
        p.axis_slots = [Some(0), Some(1), None];
        let c = scan_all(text, &p);
        assert_eq!(c.rows, 4);
        assert_eq!(c.numbers[0], [1.0, 2.0, 4.0, 5.0]);
        assert_eq!(c.numbers[1], [0.0, 3.0, 3.0, 6.0]);
        // Before any row set the text, id 0 - which "a" becomes.
        assert_eq!(c.texts[0].ids, [0, 0, 0, 0]);
        assert_eq!(c.texts[0].labels, ["a"]);
    }

    #[test]
    fn filter_stride_and_rejection() {
        let mut text = String::from("x,y,team,hp\n");
        for i in 0..5000 {
            let team = ["red", "blue", "\"red\"", ""][i % 4];
            let y = if i % 7 == 0 {
                String::new()
            } else {
                format!("{}", i * 2)
            };
            text.push_str(&format!("{i},{y},{team},{}\n", i % 100));
        }
        for stride in [1, 3] {
            let mut p = plan(&[0, 1, 3], &[2, 2]);
            p.axis_slots = [Some(0), Some(1), None];
            p.number_tests = vec![(
                2,
                Clause::Range {
                    column: "hp".into(),
                    min: Some(10.0),
                    max: None,
                },
            )];
            p.text_tests = vec![(
                1,
                Clause::Set {
                    column: "team".into(),
                    values: vec!["red".into()],
                },
            )];
            p.stride = stride;
            let c = scan_all(&text, &p);
            let mut want = Vec::new();
            let mut rejected = 0;
            let mut seen = 0;
            let mut kept = 0;
            for i in 0..5000 {
                if i % 100 < 10 || !(i % 4 == 0 || i % 4 == 2) {
                    continue;
                }
                kept += 1;
                if seen % stride != 0 {
                    seen += 1;
                    continue;
                }
                seen += 1;
                if i % 7 == 0 {
                    rejected += 1;
                    continue;
                }
                want.push(i as f32);
            }
            assert_eq!(c.numbers[0], want);
            assert_eq!(c.rejected, rejected);
            assert_eq!(
                c.filtered,
                Some(FilterStats {
                    rows: 5000,
                    kept,
                    ..Default::default()
                })
            );
            assert!(c.numbers[2].is_empty() && c.texts[1].ids.is_empty());
            assert_eq!(c.texts[1].labels, ["red", "blue", ""]);
        }
    }

    #[test]
    fn cuts_inside_quoted_newlines_and_ragged_rows() {
        let mut text = String::from("\u{feff}id,v,name,w\n");
        let mut seed = 7u64;
        let mut rnd = || {
            seed ^= seed << 13;
            seed ^= seed >> 7;
            seed ^= seed << 17;
            seed
        };
        for i in 0..20000 {
            let r = rnd();
            let name = match r % 9 {
                0 => "\"a\nb,c\"".to_string(),
                1 => "\"x\"\"y\"".to_string(),
                2 => "pl\"ai\"n".to_string(),
                3 => "\"\r\n\"".to_string(),
                4 => "\u{fc}\u{20ac}".to_string(),
                _ => format!("n{}", r % 50),
            };
            let line = match (r >> 8) % 11 {
                0 => format!("{i}"),
                1 => String::new(),
                2 => format!("{i},{},{name}", r % 1000),
                _ => format!("{i},{}.{},{name},{}", r % 1000, r % 10, (r >> 20) % 5),
            };
            text.push_str(&line);
            text.push_str(if r % 5 == 0 { "\r\n" } else { "\n" });
        }
        let mut p = plan(&[0, 1, 3], &[2]);
        p.wide_slot = Some(1);
        let c = scan_all(&text, &p);
        assert!(c.rows > 15000);
        p.stride = 3;
        p.text_tests = vec![(
            0,
            Clause::Set {
                column: "name".into(),
                values: vec!["n3".into(), "a\nb,c".into()],
            },
        )];
        p.text_columns.push(2);
        scan_all(&text, &p);
    }

    #[test]
    fn cuts_that_fall_inside_quotes() {
        // Most line ends are inside quotes, one quoted field spans many parts, and
        // the quotes inside hold commas enough to look like a row too wide.
        let mut text = String::from("a,b,c\n");
        for i in 0..3000 {
            text.push_str(&format!(
                "{i},\"l1\nl2\r\nl3\n{}\",{}\n",
                ",".repeat(i % 7),
                i * 3
            ));
        }
        text.push_str(&format!("1,\"{}\",2\n", "x,\n".repeat(5000)));
        for _ in 0..40 {
            text.push_str(&format!("1,\"x\n{}\n\",2\n", ",".repeat(5000)));
        }
        for i in 0..500 {
            text.push_str(&format!("{i},plain,{i}\n"));
        }
        text.push_str("9,\"unclosed\n1,2,3\n");
        let c = scan_all(&text, &plan(&[0, 2], &[1]));
        assert_eq!(c.rows, 3542);
        assert_eq!(c.texts[0].labels.len(), 7 + 4);
        assert_eq!(c.numbers[1][2999], 8997.0);
    }

    #[test]
    fn too_many_fields_is_an_error_except_in_the_header() {
        let wide = vec!["1"; MAX_FIELDS + 1].join(",");
        assert!(scan_csv_parts(format!("{wide}\n1\n").as_bytes(), &plan(&[0], &[]), 1).is_ok());
        assert!(scan_csv_parts(format!("a\n{wide}\n").as_bytes(), &plan(&[0], &[]), 1).is_err());
    }

    /// Throughput: `HEAT3D_CSV_BENCH=<file>`, a CSV with the columns
    /// `x,y,z,t,person,team,v,cat,hp,...`, scanned with and without a filter and stride.
    #[test]
    #[ignore]
    fn bench() {
        let Ok(path) = std::env::var("HEAT3D_CSV_BENCH") else {
            return;
        };
        let file = std::fs::File::open(path).unwrap();
        let map = unsafe { memmap2::Mmap::map(&file) }.unwrap();
        let mut p = plan(&[0, 1, 2, 3, 6], &[4, 5, 7]);
        p.wide_slot = Some(3);
        p.axis_slots = [Some(0), Some(1), Some(2)];
        let gb = map.len() as f64 / 1e9;
        let mut filtered = p.clone();
        filtered.number_columns.push(8);
        filtered.number_tests = vec![(
            5,
            Clause::Range {
                column: "hp".into(),
                min: Some(20.0),
                max: Some(120.0),
            },
        )];
        filtered.text_columns.push(5);
        filtered.text_tests = vec![(
            3,
            Clause::Set {
                column: "team".into(),
                values: vec!["red".into(), "blue".into()],
            },
        )];
        let mut strided = p.clone();
        strided.stride = 4;
        // One core, over the first 300 MB.
        let cut = map[..map.len().min(300_000_000)]
            .iter()
            .rposition(|&c| c == b'\n')
            .map_or(0, |x| x + 1);
        let t = std::time::Instant::now();
        let c = scan_csv_parts(&map[..cut], &p, 1).unwrap();
        let s = t.elapsed().as_secs_f64();
        eprintln!(
            "one core: {:.0} MB/s, {:.1} M rows/s",
            cut as f64 / s / 1e6,
            c.rows as f64 / s / 1e6
        );
        for (name, plan) in [
            ("plain", &p),
            ("filter", &filtered),
            ("stride 4", &strided),
            ("plain", &p),
        ] {
            let t = std::time::Instant::now();
            let c = scan_csv(&map, plan).unwrap();
            let s = t.elapsed().as_secs_f64();
            // Data rows in the file: the plain plan keeps and rejects them all.
            let rows = c.filtered.map_or(
                (c.rows + c.rejected) as u64 * plan.stride.max(1) as u64,
                |f| f.rows,
            );
            eprintln!(
                "{name}: {gb:.2} GB in {s:.3} s = {:.2} GB/s, {:.1} M rows/s read, {} rows kept, {} threads",
                gb / s,
                rows as f64 / s / 1e6,
                c.rows,
                rayon::current_num_threads()
            );
        }
    }

    /// The parity runner: `HEAT3D_CSV_PARITY=<dir>` with `cases.json` and the
    /// inputs, as the web app's harness reads them; writes `rs/<case>.json`.
    #[test]
    #[ignore]
    fn parity_dump() {
        let Ok(dir) = std::env::var("HEAT3D_CSV_PARITY") else {
            return;
        };
        parity::run(std::path::Path::new(&dir));
    }

    mod parity {
        use super::super::*;
        use serde_json::{json, Value};
        use std::path::Path;

        fn fnv(h: &mut u64, x: u64) {
            for b in x.to_le_bytes() {
                *h ^= b as u64;
                *h = h.wrapping_mul(0x100000001b3);
            }
        }

        fn f32s(v: &[f32], full: bool) -> Value {
            let b: Vec<u64> = v
                .iter()
                .map(|x| {
                    if x.is_nan() {
                        0x7fc0_0000
                    } else {
                        x.to_bits() as u64
                    }
                })
                .collect();
            digest(&b, full)
        }

        fn digest(b: &[u64], full: bool) -> Value {
            let mut h = 0xcbf29ce484222325u64;
            for &x in b {
                fnv(&mut h, x);
            }
            let mut o = json!({ "n": b.len(), "h": format!("{h:016x}") });
            if full {
                o["v"] = json!(b.iter().map(|x| format!("{x:x}")).collect::<Vec<_>>());
            }
            o
        }

        fn dict(d: &Dict, full: bool) -> Value {
            let ids: Vec<u64> = d.ids.iter().map(|&x| x as u64).collect();
            json!({ "ids": digest(&ids, full), "labels": d.labels })
        }

        /// The slots `ingestCsv` sets up for `mapping` over `columns`.
        fn build(m: &Value, columns: &[String], stride: usize) -> (CsvPlan, Value, bool) {
            let index_of = |k: &str| -> Option<usize> {
                m[k].as_str()
                    .and_then(|n| columns.iter().position(|c| c == n))
            };
            let mut plan = CsvPlan {
                delimiter: m["delimiter"].as_str().unwrap_or(",").as_bytes()[0],
                stride,
                has_header: true,
                ..Default::default()
            };
            let add_num = |plan: &mut CsvPlan, c: Option<usize>| {
                c.map(|c| {
                    plan.number_columns.push(c);
                    plan.number_columns.len() - 1
                })
            };
            let add_txt = |plan: &mut CsvPlan, c: Option<usize>| {
                c.map(|c| {
                    plan.text_columns.push(c);
                    plan.text_columns.len() - 1
                })
            };
            let x = add_num(&mut plan, index_of("x"));
            let y = add_num(&mut plan, index_of("y"));
            let z = add_num(&mut plan, index_of("z"));
            let time = index_of("time").map(|c| {
                let s = add_num(&mut plan, Some(c)).unwrap();
                plan.wide_slot = Some(s);
                s
            });
            let person = add_txt(&mut plan, index_of("personId"));
            let team = add_txt(&mut plan, index_of("teamId"));
            let session = add_txt(&mut plan, index_of("sessionId"));
            let mut extras = Vec::new();
            for name in m["extra"].as_array().into_iter().flatten() {
                let name = name.as_str().unwrap();
                let Some(ci) = columns.iter().position(|c| c == name) else {
                    continue;
                };
                let numeric = m["extraNumeric"][name].as_bool().unwrap_or(true);
                let slot = if numeric {
                    add_num(&mut plan, Some(ci))
                } else {
                    add_txt(&mut plan, Some(ci))
                };
                extras.push(json!({ "name": name, "numeric": numeric, "slot": slot }));
            }
            let mut none_pass = false;
            for c in m["rowFilter"].as_array().into_iter().flatten() {
                let column = c["column"].as_str().unwrap().to_string();
                let clause = if c["kind"] == "set" {
                    Clause::Set {
                        column: column.clone(),
                        values: c["values"]
                            .as_array()
                            .unwrap()
                            .iter()
                            .map(|v| v.as_str().unwrap().into())
                            .collect(),
                    }
                } else {
                    Clause::Range {
                        column: column.clone(),
                        min: c["min"].as_f64(),
                        max: c["max"].as_f64(),
                    }
                };
                if !clause.is_active() {
                    continue;
                }
                let Some(ci) = columns.iter().position(|n| *n == column) else {
                    if !clause.compile().null() {
                        none_pass = true;
                    }
                    continue;
                };
                if matches!(clause, Clause::Range { .. }) {
                    let s = add_num(&mut plan, Some(ci)).unwrap();
                    plan.number_tests.push((s, clause));
                } else {
                    let s = add_txt(&mut plan, Some(ci)).unwrap();
                    plan.text_tests.push((s, clause));
                }
            }
            plan.axis_slots = [x, y, z];
            let slots = json!({ "x": x, "y": y, "z": z, "time": time, "person": person, "team": team,
                "session": session, "extras": extras });
            (plan, slots, none_pass)
        }

        fn result(c: &CsvColumns, slots: &Value, full: bool) -> Value {
            let filtered = c
                .filtered
                .map(|f| json!({ "rows": f.rows, "kept": f.kept }));
            if c.rows == 0 {
                if let Some(f) = c.filtered.filter(|f| f.kept == 0) {
                    return json!({ "empty": true, "filtered": { "rows": f.rows, "kept": f.kept } });
                }
                let key = if c.rejected > 0 {
                    "data.ingest.allRejected"
                } else {
                    "data.ingest.noDataRows"
                };
                return json!({ "error": key });
            }
            let axis = |k: &str| match slots[k].as_u64() {
                Some(s) => f32s(&c.numbers[s as usize], full),
                None => f32s(&vec![0.0; c.rows], full),
            };
            let txt = |k: &str| match slots[k].as_u64() {
                Some(s) => dict(&c.texts[s as usize], full),
                None => Value::Null,
            };
            let time = c.wide.as_ref().map(|w| {
                let b: Vec<u64> = w
                    .iter()
                    .map(|&v| {
                        if v.is_finite() {
                            v.to_bits()
                        } else {
                            0x7ff8_0000_0000_0000
                        }
                    })
                    .collect();
                digest(&b, full)
            });
            let attrs: Vec<Value> = slots["extras"]
                .as_array()
                .unwrap()
                .iter()
                .map(|e| {
                    let s = e["slot"].as_u64().unwrap() as usize;
                    if e["numeric"].as_bool().unwrap() {
                        json!({ "name": e["name"], "data": f32s(&c.numbers[s], full) })
                    } else {
                        json!({ "name": e["name"], "dict": dict(&c.texts[s], full) })
                    }
                })
                .collect();
            json!({ "rows": c.rows, "rejected": c.rejected, "filtered": filtered,
                "px": axis("x"), "py": axis("y"), "pz": axis("z"), "time": time,
                "person": txt("person"), "team": txt("team"), "session": txt("session"), "attrs": attrs })
        }

        pub fn run(dir: &Path) {
            let cases: Value =
                serde_json::from_slice(&std::fs::read(dir.join("cases.json")).unwrap()).unwrap();
            let out_dir = dir.join("rs");
            std::fs::create_dir_all(&out_dir).unwrap();
            let only = std::env::var("HEAT3D_CSV_CASE").ok();
            for case in cases.as_array().unwrap() {
                let name = case["name"].as_str().unwrap();
                if only.as_deref().is_some_and(|o| o != name) {
                    continue;
                }
                let bytes =
                    std::fs::read(dir.join("inputs").join(case["file"].as_str().unwrap())).unwrap();
                let columns: Vec<String> = case["columns"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .map(|c| c.as_str().unwrap().into())
                    .collect();
                let stride = case["stride"].as_u64().unwrap_or(1) as usize;
                let (plan, slots, none_pass) = build(&case["mapping"], &columns, stride);
                let full = bytes.len() < 1 << 20;
                let mut outs = Vec::new();
                let mut timings = Vec::new();
                for parts in [1usize, 3, 17, 0] {
                    let t = std::time::Instant::now();
                    let r = if none_pass {
                        json!({ "empty": true, "filtered": { "rows": 0, "kept": 0 } })
                    } else {
                        let c = if parts == 0 {
                            scan_csv(&bytes, &plan)
                        } else {
                            scan_csv_parts(&bytes, &plan, parts)
                        };
                        match c {
                            Ok(c) => result(&c, &slots, full),
                            Err(e) => json!({ "error": e.to_string().split(':').next().unwrap() }),
                        }
                    };
                    timings.push(t.elapsed().as_secs_f64());
                    outs.push(r);
                }
                for k in 1..outs.len() {
                    assert_eq!(outs[0], outs[k], "{name}: cut into parts differs");
                }
                eprintln!("{name}: {:?}", timings);
                std::fs::write(
                    out_dir.join(format!("{name}.json")),
                    serde_json::to_vec(&outs[0]).unwrap(),
                )
                .unwrap();
            }
            // Number parsing and powers of ten, value by value.
            if let Ok(nums) = std::fs::read_to_string(dir.join("numbers.json")) {
                let list: Vec<String> = serde_json::from_str(&nums).unwrap();
                let out: Vec<String> = list
                    .iter()
                    .map(|s| format!("{:x}", parse_number_bytes(s.as_bytes()).to_bits()))
                    .collect();
                std::fs::write(
                    out_dir.join("numbers.json"),
                    serde_json::to_vec(&out).unwrap(),
                )
                .unwrap();
            }
            if let Ok(pow) = std::fs::read_to_string(dir.join("pow10.txt")) {
                let mut bad = 0;
                for line in pow.lines() {
                    let (k, b) = line.split_once(' ').unwrap();
                    let k: i32 = k.parse().unwrap();
                    let mine = format!("{:x}", pow10(k as f64).to_bits());
                    if mine != b {
                        bad += 1;
                        eprintln!("10^{k}: node {b}, rust {mine}");
                    }
                }
                assert_eq!(bad, 0, "powers of ten differ");
            }
        }
    }
}
