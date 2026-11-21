//! Rows in time order, on every core, past the web app's 400 million.
//!
//! The web app sorts with a radix sort over float keys (`src/data/sort.ts`),
//! limited by what one tab can allocate. Here each key is the time's sortable bits
//! above the row's index, so one parallel sort of plain integers gives a stable
//! order: equal times keep their file order, as the web app's sort keeps them.

use rayon::prelude::*;

/// A float as an unsigned integer that orders the same way (`floatKeyToSortableUint`).
#[inline]
pub fn sortable(v: f32) -> u32 {
    let u = v.to_bits();
    if u & 0x8000_0000 != 0 {
        !u
    } else {
        u | 0x8000_0000
    }
}

#[inline]
pub fn unsortable(k: u32) -> f32 {
    f32::from_bits(if k & 0x8000_0000 != 0 { k & 0x7fff_ffff } else { !k })
}

pub fn is_ascending(t: &[f32]) -> bool {
    t.par_windows(2).all(|w| w[0] <= w[1])
}

/// The stable order of `time`, ascending, and the times in that order.
pub fn order_by_time(time: &[f32]) -> (Vec<u32>, Vec<f32>) {
    assert!(time.len() <= u32::MAX as usize, "rows past 2^32 need wider row ids");
    let mut keys: Vec<u64> = time.par_iter().enumerate().map(|(i, &t)| ((sortable(t) as u64) << 32) | i as u64).collect();
    keys.par_sort_unstable();
    let order = keys.par_iter().map(|&k| k as u32).collect();
    let sorted = keys.par_iter().map(|&k| unsortable((k >> 32) as u32)).collect();
    (order, sorted)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn stable_and_signed() {
        let t = [3.0, -1.0, 3.0, 0.0, -0.5, 2.0];
        let (o, s) = order_by_time(&t);
        assert_eq!(o, [1, 4, 3, 5, 0, 2]);
        assert_eq!(s, [-1.0, -0.5, 0.0, 2.0, 3.0, 3.0]);
        assert!(is_ascending(&s) && !is_ascending(&t));
    }
}
