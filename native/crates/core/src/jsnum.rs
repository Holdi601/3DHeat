//! Numbers the way the web app's JavaScript reads and writes them.
//!
//! The native readers must hand the web app exactly what its own readers would:
//! a category column keyed by `String(value)` groups rows by that text, and a
//! number read from text goes through `Number(text)`. Both differ from Rust's
//! defaults (`1e21` against `1000000000000000000000`, `"inf"` parsing, empty
//! text being zero), so they are reproduced here once.

/// `Number(text)`: whitespace trimmed, empty is 0, `0x`/`0o`/`0b` prefixes,
/// `Infinity` spelled exactly, anything else unparsable is NaN.
pub fn js_number(text: &str) -> f64 {
    let s = text.trim_matches(is_js_space);
    if s.is_empty() {
        return 0.0;
    }
    let b = s.as_bytes();
    if b.len() > 2 && b[0] == b'0' {
        let radix = match b[1] {
            b'x' | b'X' => 16,
            b'o' | b'O' => 8,
            b'b' | b'B' => 2,
            _ => 0,
        };
        if radix != 0 {
            let digits = &s[2..];
            let mut v = 0f64;
            for c in digits.chars() {
                match c.to_digit(radix) {
                    Some(d) => v = v * radix as f64 + d as f64,
                    None => return f64::NAN,
                }
            }
            return v;
        }
    }
    let (sign, body) = match b[0] {
        b'+' => (1.0, &s[1..]),
        b'-' => (-1.0, &s[1..]),
        _ => (1.0, s),
    };
    if body == "Infinity" {
        return sign * f64::INFINITY;
    }
    // Rust accepts "inf", "nan" and "infinity" in any case; JavaScript does not.
    let ok = !body.is_empty()
        && body.bytes().all(|c| c.is_ascii_digit() || matches!(c, b'.' | b'e' | b'E' | b'+' | b'-'))
        && body.bytes().next().is_some_and(|c| c.is_ascii_digit() || c == b'.');
    if !ok {
        return f64::NAN;
    }
    match body.parse::<f64>() {
        Ok(v) => sign * v,
        Err(_) => f64::NAN,
    }
}

/// The characters `String.prototype.trim` removes.
fn is_js_space(c: char) -> bool {
    matches!(
        c,
        '\u{9}' | '\u{a}' | '\u{b}' | '\u{c}' | '\u{d}' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}' | '\u{2028}' | '\u{2029}' | '\u{202f}' | '\u{205f}' | '\u{3000}' | '\u{feff}'
    )
}

/// `String(number)`: the shortest round-trip text, in JavaScript's notation.
pub fn js_string(v: f64) -> String {
    let mut buf = ryu_js::Buffer::new();
    buf.format(v).to_string()
}

/// `new Date(ms).toISOString()`: `YYYY-MM-DDTHH:mm:ss.sssZ`, extended years signed.
pub fn js_iso(ms: f64) -> String {
    if !ms.is_finite() {
        return String::new();
    }
    let ms = ms.floor() as i64;
    let days = ms.div_euclid(86_400_000);
    let rem = ms.rem_euclid(86_400_000);
    let (y, m, d) = civil_from_days(days);
    let (h, mi, s, milli) = (rem / 3_600_000, rem / 60_000 % 60, rem / 1000 % 60, rem % 1000);
    let year = if (0..=9999).contains(&y) {
        format!("{y:04}")
    } else if y < 0 {
        format!("-{:06}", -y)
    } else {
        format!("+{y:06}")
    };
    format!("{year}-{m:02}-{d:02}T{h:02}:{mi:02}:{s:02}.{milli:03}Z")
}

/// Days since 1970-01-01 to a proleptic Gregorian date (Howard Hinnant's algorithm).
fn civil_from_days(z: i64) -> (i64, u32, u32) {
    let z = z + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = (doy - (153 * mp + 2) / 5 + 1) as u32;
    let m = if mp < 10 { mp + 3 } else { mp - 9 } as u32;
    (if m <= 2 { y + 1 } else { y }, m, d)
}

/// Days from 1970-01-01 to a date, the inverse of `civil_from_days`.
pub fn days_from_civil(y: i64, m: u32, d: u32) -> i64 {
    let y = if m <= 2 { y - 1 } else { y };
    let era = y.div_euclid(400);
    let yoe = y.rem_euclid(400);
    let mp = (m as i64 + 9) % 12;
    let doy = (153 * mp + 2) / 5 + d as i64 - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146_097 + doe - 719_468
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn number_like_javascript() {
        assert_eq!(js_number(""), 0.0);
        assert_eq!(js_number("  12 "), 12.0);
        assert_eq!(js_number("0x1A"), 26.0);
        assert_eq!(js_number("-Infinity"), f64::NEG_INFINITY);
        assert!(js_number("inf").is_nan());
        assert!(js_number("nan").is_nan());
        assert!(js_number("1,5").is_nan());
        assert_eq!(js_number(".5"), 0.5);
        assert_eq!(js_number("5."), 5.0);
        assert_eq!(js_number("1e3"), 1000.0);
        assert!(js_number("e3").is_nan());
    }

    #[test]
    fn string_like_javascript() {
        assert_eq!(js_string(1.0), "1");
        assert_eq!(js_string(1.5), "1.5");
        assert_eq!(js_string(1e21), "1e+21");
        assert_eq!(js_string(0.1f32 as f64), "0.10000000149011612");
        assert_eq!(js_string(-0.0), "0");
        assert_eq!(js_string(f64::NAN), "NaN");
    }

    #[test]
    fn iso_like_javascript() {
        assert_eq!(js_iso(0.0), "1970-01-01T00:00:00.000Z");
        assert_eq!(js_iso(1_700_000_000_123.0), "2023-11-14T22:13:20.123Z");
        assert_eq!(js_iso(-1.0), "1969-12-31T23:59:59.999Z");
        assert_eq!(days_from_civil(2023, 11, 14), 19675);
    }
}
