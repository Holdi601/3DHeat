//! TLS for the session server: a self-signed certificate for the local
//! network, made once and kept (so its fingerprint stays the same for the
//! people who checked it), or a real certificate and key the host names.

use rcgen::{CertificateParams, DnType, KeyPair, SanType};
use sha2::{Digest, Sha256};
use std::net::IpAddr;
use std::path::{Path, PathBuf};

#[derive(Clone, Debug)]
pub enum TlsMode {
    /// No TLS: only for a server bound to this machine (browsers treat localhost as secure).
    Off,
    /// A self-signed certificate kept in this folder.
    SelfSigned(PathBuf),
    /// A certificate chain and its private key, PEM files (e.g. from Let's Encrypt).
    Files { cert: PathBuf, key: PathBuf },
}

/// The PEM of a certificate chain and key, and the first certificate's SHA-256 fingerprint.
pub struct Material {
    pub cert_pem: Vec<u8>,
    pub key_pem: Vec<u8>,
    pub fingerprint: String,
}

/// This machine's addresses on its networks, for the certificate's names.
pub fn local_ips() -> Vec<IpAddr> {
    let mut ips: Vec<IpAddr> = if_addrs::get_if_addrs()
        .map(|v| v.into_iter().map(|i| i.ip()).collect())
        .unwrap_or_default();
    ips.push("127.0.0.1".parse().unwrap());
    ips.push("::1".parse().unwrap());
    ips.sort();
    ips.dedup();
    ips
}

fn fingerprint_of_pem(pem: &[u8]) -> String {
    // The first certificate's DER, from between its PEM lines.
    let text = String::from_utf8_lossy(pem);
    let body: String = text
        .lines()
        .skip_while(|l| !l.starts_with("-----BEGIN CERTIFICATE"))
        .skip(1)
        .take_while(|l| !l.starts_with("-----END"))
        .collect();
    let der = base64_decode(&body);
    let d = Sha256::digest(&der);
    d.iter()
        .map(|b| format!("{b:02X}"))
        .collect::<Vec<_>>()
        .join(":")
}

fn base64_decode(s: &str) -> Vec<u8> {
    const T: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = Vec::with_capacity(s.len() * 3 / 4);
    let (mut acc, mut bits) = (0u32, 0u32);
    for c in s.bytes() {
        let Some(v) = T.iter().position(|&t| t == c) else {
            continue;
        };
        acc = (acc << 6) | v as u32;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((acc >> bits) as u8);
        }
    }
    out
}

/// The certificate for `mode`: read, or made and kept.
pub fn material(mode: &TlsMode) -> Result<Option<Material>, String> {
    match mode {
        TlsMode::Off => Ok(None),
        TlsMode::Files { cert, key } => {
            let cert_pem =
                std::fs::read(cert).map_err(|e| format!("certificate {}: {e}", cert.display()))?;
            let key_pem = std::fs::read(key).map_err(|e| format!("key {}: {e}", key.display()))?;
            let fingerprint = fingerprint_of_pem(&cert_pem);
            Ok(Some(Material {
                cert_pem,
                key_pem,
                fingerprint,
            }))
        }
        TlsMode::SelfSigned(dir) => self_signed(dir).map(Some),
    }
}

fn self_signed(dir: &Path) -> Result<Material, String> {
    let (cp, kp, sp) = (
        dir.join("cert.pem"),
        dir.join("key.pem"),
        dir.join("names.txt"),
    );
    let ips = local_ips();
    let names: Vec<String> = ips.iter().map(|i| i.to_string()).collect();
    // Kept while it still names every address this machine has.
    if let (Ok(c), Ok(k), Ok(s)) = (
        std::fs::read(&cp),
        std::fs::read(&kp),
        std::fs::read_to_string(&sp),
    ) {
        let kept: Vec<&str> = s.lines().collect();
        if names.iter().all(|n| kept.contains(&n.as_str())) {
            let fingerprint = fingerprint_of_pem(&c);
            return Ok(Material {
                cert_pem: c,
                key_pem: k,
                fingerprint,
            });
        }
    }
    let mut params =
        CertificateParams::new(vec!["localhost".to_string()]).map_err(|e| e.to_string())?;
    params
        .distinguished_name
        .push(DnType::CommonName, "3DHeat session (self-signed)");
    for ip in &ips {
        params.subject_alt_names.push(SanType::IpAddress(*ip));
    }
    if let Ok(host) = std::env::var("COMPUTERNAME").or_else(|_| std::env::var("HOSTNAME")) {
        if let Ok(n) = host.to_lowercase().try_into() {
            params.subject_alt_names.push(SanType::DnsName(n));
        }
    }
    let now = std::time::SystemTime::now();
    params.not_before = now.into();
    params.not_after = (now + std::time::Duration::from_secs(825 * 24 * 3600)).into();
    let key = KeyPair::generate().map_err(|e| e.to_string())?;
    let cert = params.self_signed(&key).map_err(|e| e.to_string())?;
    let cert_pem = cert.pem().into_bytes();
    let key_pem = key.serialize_pem().into_bytes();
    std::fs::create_dir_all(dir).map_err(|e| format!("{}: {e}", dir.display()))?;
    std::fs::write(&cp, &cert_pem).map_err(|e| e.to_string())?;
    std::fs::write(&kp, &key_pem).map_err(|e| e.to_string())?;
    std::fs::write(&sp, names.join("\n")).map_err(|e| e.to_string())?;
    let fingerprint = fingerprint_of_pem(&cert_pem);
    Ok(Material {
        cert_pem,
        key_pem,
        fingerprint,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn self_signed_is_kept() {
        let dir = std::env::temp_dir().join(format!("heat3d-tls-{}", std::process::id()));
        let a = material(&TlsMode::SelfSigned(dir.clone()))
            .unwrap()
            .unwrap();
        let b = material(&TlsMode::SelfSigned(dir.clone()))
            .unwrap()
            .unwrap();
        assert_eq!(a.fingerprint, b.fingerprint);
        assert_eq!(a.fingerprint.len(), 32 * 3 - 1);
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn base64() {
        assert_eq!(base64_decode("aGVsbG8="), b"hello");
    }
}
