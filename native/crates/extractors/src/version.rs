//! Release versions: `v1.2.3` (a leading `v`, numbers by dots; anything from
//! a `-` or `+` on is not compared).

use std::cmp::Ordering;

/// The version a tag names (`v1.2.3` → `1.2.3`), when it is a plain one, safe as a folder name.
pub fn from_tag(tag: &str) -> Option<String> {
    let v = tag.strip_prefix('v').or_else(|| tag.strip_prefix('V')).unwrap_or(tag);
    let ok = !v.is_empty()
        && v.len() <= 64
        && v.as_bytes()[0].is_ascii_digit()
        && v.bytes().all(|b| b.is_ascii_alphanumeric() || b"._+-".contains(&b))
        && !v.contains("..");
    ok.then(|| v.to_string())
}

fn numbers(v: &str) -> Vec<u64> {
    let v = v.strip_prefix('v').or_else(|| v.strip_prefix('V')).unwrap_or(v);
    let core = v.split(['-', '+']).next().unwrap_or("");
    core.split('.').map(|p| p.trim().parse::<u64>().unwrap_or(0)).collect()
}

/// Compares two versions number by number, a missing number as 0 (`1.2` = `1.2.0`).
pub fn compare(a: &str, b: &str) -> Ordering {
    let (a, b) = (numbers(a), numbers(b));
    for i in 0..a.len().max(b.len()) {
        match a.get(i).unwrap_or(&0).cmp(b.get(i).unwrap_or(&0)) {
            Ordering::Equal => {}
            o => return o,
        }
    }
    Ordering::Equal
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn versions_compare_by_number() {
        assert_eq!(compare("v1.2.3", "1.2.3"), Ordering::Equal);
        assert_eq!(compare("1.10.0", "1.9.9"), Ordering::Greater);
        assert_eq!(compare("1.2", "1.2.0"), Ordering::Equal);
        assert_eq!(compare("1.2.0", "1.2.1"), Ordering::Less);
        assert_eq!(compare("2.0.0-rc.1", "2.0.0"), Ordering::Equal);
        assert_eq!(compare("2.0.0+build.7", "1.99.0"), Ordering::Greater);
        assert_eq!(compare("v0.10", "v0.9"), Ordering::Greater);
    }

    #[test]
    fn tags_name_plain_versions() {
        assert_eq!(from_tag("v1.2.3").as_deref(), Some("1.2.3"));
        assert_eq!(from_tag("0.4.0-rc.1").as_deref(), Some("0.4.0-rc.1"));
        for bad in ["", "v", "latest", "v1/2", "v1..2", "v1\\2", "v..", "v1 2"] {
            assert_eq!(from_tag(bad), None, "{bad}");
        }
    }
}
