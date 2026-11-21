//! Checksums: a download is used only when its SHA-256 is the one its
//! release's `SHA256SUMS` names, and the one GitHub reports for the asset
//! (`digest`, `sha256:<hex>`) where it reports one.

use sha2::{Digest, Sha256};

/// Lowercase hex of a hash.
pub fn hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02x}")).collect()
}

/// The SHA-256 of some bytes, as lowercase hex.
pub fn sha256_hex(bytes: &[u8]) -> String {
    hex(&Sha256::digest(bytes))
}

fn is_hex64(s: &str) -> bool {
    s.len() == 64 && s.bytes().all(|b| b.is_ascii_hexdigit())
}

/// The hash a `sha256sum` file names for `file` (`<64 hex>  <name>`, or `<hex> *<name>`), lowercase.
pub fn sum_for(sums: &str, file: &str) -> Option<String> {
    let mut found = None;
    for line in sums.lines() {
        let line = line.trim_end_matches('\r');
        let Some((h, rest)) = line.split_once(char::is_whitespace) else { continue };
        let name = rest.trim_start().trim_start_matches('*');
        if is_hex64(h) && name == file {
            if found.is_some() {
                return None; // named twice: trusted neither
            }
            found = Some(h.to_ascii_lowercase());
        }
    }
    found
}

/// Checks a download's hash (lowercase hex) against the sums file and the API's digest.
pub fn verify(actual: &str, file: &str, sums: &str, digest: Option<&str>) -> Result<(), String> {
    let Some(want) = sum_for(sums, file) else {
        return Err(format!("{file} is not in the release's checksums"));
    };
    if want != actual {
        return Err(format!("{file} does not match its checksum"));
    }
    if let Some(d) = digest.filter(|d| !d.is_empty()) {
        match d.split_once(':') {
            Some(("sha256", h)) if h.eq_ignore_ascii_case(actual) => {}
            Some(("sha256", _)) => return Err(format!("{file} does not match the digest GitHub reports")),
            _ => {} // another algorithm: the sums file decided
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn checksums_decide() {
        let h = sha256_hex(b"hello");
        assert_eq!(h, "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
        let sums = format!("{}  other.zip\n{h}  x-1.0.0-windows-x64.zip\r\n", "0".repeat(64));
        assert_eq!(verify(&h, "x-1.0.0-windows-x64.zip", &sums, None), Ok(()));
        assert_eq!(verify(&h, "x-1.0.0-windows-x64.zip", &sums, Some(&format!("sha256:{}", h.to_uppercase()))), Ok(()));
        assert!(verify(&h, "x-1.0.0-windows-x64.zip", &sums, Some(&format!("sha256:{}", "1".repeat(64)))).is_err());
        assert!(verify(&sha256_hex(b"hellO"), "x-1.0.0-windows-x64.zip", &sums, None).is_err(), "mismatch");
        assert!(verify(&h, "missing.zip", &sums, None).is_err());
        assert!(verify(&h, "x", &format!("{h} *x\n"), None).is_ok(), "binary mode marker");
        assert!(verify(&h, "x", &format!("{h}  x\n{h}  x\n"), None).is_err(), "named twice");
        assert!(verify(&h, "x", &format!("{}  x\n", &h[..60]), None).is_err(), "short hash");
    }
}
