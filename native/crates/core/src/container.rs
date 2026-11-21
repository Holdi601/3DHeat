//! `.3dheat` containers (docs/container.md), read as `src/data/container.ts` reads them.
//!
//! A container is a ZIP whose tables are stored, so each table is a byte range of
//! the container, read in place (here: a slice of the memory map). Only the
//! central directory, the manifest and the local headers are read on open.

use std::borrow::Cow;
use std::io::Read;

use anyhow::{anyhow, bail, Context, Result};
use serde_json::Value;

/// The major format version read (any minor).
pub const FORMAT_MAJOR: u32 = 1;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Entry {
    pub name: String,
    /// 0 stored, 8 deflate.
    pub method: u16,
    pub compressed: u64,
    pub size: u64,
    /// Offset of the local header.
    pub header: u64,
    /// Offset of the member's data.
    pub data: u64,
}

#[derive(Debug, Clone)]
pub struct Container {
    pub manifest_json: String,
    pub manifest: Value,
    /// In central-directory order.
    pub entries: Vec<Entry>,
}

fn u16_at(b: &[u8], o: usize) -> Result<u16> {
    b.get(o..o + 2).map(|s| u16::from_le_bytes([s[0], s[1]])).ok_or_else(|| anyhow!("ZIP truncated"))
}

fn u32_at(b: &[u8], o: usize) -> Result<u32> {
    b.get(o..o + 4).map(|s| u32::from_le_bytes([s[0], s[1], s[2], s[3]])).ok_or_else(|| anyhow!("ZIP truncated"))
}

fn u64_at(b: &[u8], o: usize) -> Result<u64> {
    b.get(o..o + 8).map(|s| u64::from_le_bytes(s.try_into().unwrap())).ok_or_else(|| anyhow!("ZIP truncated"))
}

/// The ZIP's central directory.
pub fn central_directory(b: &[u8]) -> Result<Vec<Entry>> {
    let min = b.len().saturating_sub(65_557);
    let eocd = (min..=b.len().saturating_sub(22))
        .rev()
        .find(|&i| u32_at(b, i).ok() == Some(0x0605_4b50))
        .ok_or_else(|| anyhow!("not a ZIP container"))?;
    let mut count = u16_at(b, eocd + 10)? as u64;
    let mut cd_size = u32_at(b, eocd + 12)? as u64;
    let mut cd_offset = u32_at(b, eocd + 16)? as u64;
    if count == 0xffff || cd_size == 0xffff_ffff || cd_offset == 0xffff_ffff {
        let loc = eocd.checked_sub(20).ok_or_else(|| anyhow!("ZIP64 locator missing"))?;
        if u32_at(b, loc)? != 0x0706_4b50 {
            bail!("ZIP64 locator missing");
        }
        let at = u64_at(b, loc + 8)? as usize;
        if u32_at(b, at)? != 0x0606_4b50 {
            bail!("ZIP64 record missing");
        }
        count = u64_at(b, at + 32)?;
        cd_size = u64_at(b, at + 40)?;
        cd_offset = u64_at(b, at + 48)?;
    }
    let cd = b
        .get(cd_offset as usize..(cd_offset + cd_size) as usize)
        .ok_or_else(|| anyhow!("central directory outside the file"))?;
    let mut out = Vec::with_capacity(count as usize);
    let mut p = 0usize;
    for _ in 0..count {
        if u32_at(cd, p)? != 0x0201_4b50 {
            bail!("bad central directory");
        }
        let method = u16_at(cd, p + 10)?;
        let mut compressed = u32_at(cd, p + 20)? as u64;
        let mut size = u32_at(cd, p + 24)? as u64;
        let n = u16_at(cd, p + 28)? as usize;
        let m = u16_at(cd, p + 30)? as usize;
        let k = u16_at(cd, p + 32)? as usize;
        let mut header = u32_at(cd, p + 42)? as u64;
        let name = String::from_utf8_lossy(cd.get(p + 46..p + 46 + n).ok_or_else(|| anyhow!("ZIP truncated"))?)
            .into_owned();
        let mut e = p + 46 + n;
        while e + 4 <= p + 46 + n + m {
            let id = u16_at(cd, e)?;
            let len = u16_at(cd, e + 2)? as usize;
            if id == 1 {
                let mut q = e + 4;
                if size == 0xffff_ffff {
                    size = u64_at(cd, q)?;
                    q += 8;
                }
                if compressed == 0xffff_ffff {
                    compressed = u64_at(cd, q)?;
                    q += 8;
                }
                if header == 0xffff_ffff {
                    header = u64_at(cd, q)?;
                }
            }
            e += 4 + len;
        }
        let h = header as usize;
        if u32_at(b, h)? != 0x0403_4b50 {
            bail!("bad local header for {name}");
        }
        let data = header + 30 + u16_at(b, h + 26)? as u64 + u16_at(b, h + 28)? as u64;
        out.push(Entry { name, method, compressed, size, header, data });
        p += 46 + n + m + k;
    }
    Ok(out)
}

/// A member's bytes: a stored one in place, a deflated one inflated.
pub fn member_bytes<'a>(b: &'a [u8], e: &Entry) -> Result<Cow<'a, [u8]>> {
    let raw = b
        .get(e.data as usize..(e.data + e.compressed) as usize)
        .ok_or_else(|| anyhow!("member {} outside the file", e.name))?;
    match e.method {
        0 => Ok(Cow::Borrowed(raw)),
        8 => {
            let mut out = Vec::with_capacity(e.size as usize);
            flate2::read::DeflateDecoder::new(raw).read_to_end(&mut out).context("inflating a member")?;
            Ok(Cow::Owned(out))
        }
        m => bail!("ZIP method {m} not read"),
    }
}

/// The major of a manifest's format version (`format_version`, or the first drafts' `version`).
pub fn format_major(m: &Value) -> u32 {
    let v = m.get("format_version").or_else(|| m.get("version"));
    let s = match v {
        Some(Value::String(s)) => s.clone(),
        Some(Value::Number(n)) => n.to_string(),
        _ => "1".into(),
    };
    s.split('.').next().and_then(|x| x.trim().parse().ok()).unwrap_or(0)
}

impl Container {
    pub fn open(b: &[u8]) -> Result<Self> {
        let entries = central_directory(b)?;
        let man = entries.iter().find(|e| e.name == "manifest.json").ok_or_else(|| anyhow!("no manifest"))?;
        let text = String::from_utf8(member_bytes(b, man)?.into_owned()).context("manifest is not UTF-8")?;
        let manifest: Value = serde_json::from_str(&text).context("manifest is not JSON")?;
        if manifest.get("format").and_then(Value::as_str) != Some("3dheat") {
            bail!("not a 3dheat container");
        }
        if format_major(&manifest) != FORMAT_MAJOR {
            bail!("container format is newer than this core reads");
        }
        Ok(Self { manifest_json: text, manifest, entries })
    }

    pub fn entry(&self, name: &str) -> Option<&Entry> {
        self.entries.iter().find(|e| e.name == name)
    }

    /// Manifest members as (name, role), in manifest order.
    pub fn members(&self) -> Vec<(String, String)> {
        self.manifest
            .get("members")
            .and_then(Value::as_array)
            .map(|a| {
                a.iter()
                    .filter_map(|m| {
                        Some((m.get("name")?.as_str()?.to_owned(), m.get("role")?.as_str().unwrap_or("").to_owned()))
                    })
                    .collect()
            })
            .unwrap_or_default()
    }

    /// The tables: members of role `table` that are stored, in manifest order.
    pub fn tables(&self) -> Vec<&Entry> {
        self.members()
            .into_iter()
            .filter(|(_, r)| r == "table")
            .filter_map(|(n, _)| self.entry(&n))
            .filter(|e| e.method == 0)
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A minimal stored ZIP writer, for tests.
    pub fn zip(members: &[(&str, &[u8])]) -> Vec<u8> {
        let mut out = Vec::new();
        let mut cd = Vec::new();
        for (name, data) in members {
            let off = out.len() as u32;
            out.extend_from_slice(&0x0403_4b50u32.to_le_bytes());
            out.extend_from_slice(&[20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            out.extend_from_slice(&(data.len() as u32).to_le_bytes());
            out.extend_from_slice(&(data.len() as u32).to_le_bytes());
            out.extend_from_slice(&(name.len() as u16).to_le_bytes());
            out.extend_from_slice(&0u16.to_le_bytes());
            out.extend_from_slice(name.as_bytes());
            out.extend_from_slice(data);
            cd.extend_from_slice(&0x0201_4b50u32.to_le_bytes());
            cd.extend_from_slice(&[20, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            cd.extend_from_slice(&(data.len() as u32).to_le_bytes());
            cd.extend_from_slice(&(data.len() as u32).to_le_bytes());
            cd.extend_from_slice(&(name.len() as u16).to_le_bytes());
            cd.extend_from_slice(&[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            cd.extend_from_slice(&off.to_le_bytes());
            cd.extend_from_slice(name.as_bytes());
        }
        let cd_off = out.len() as u32;
        out.extend_from_slice(&cd);
        out.extend_from_slice(&0x0605_4b50u32.to_le_bytes());
        out.extend_from_slice(&[0, 0, 0, 0]);
        out.extend_from_slice(&(members.len() as u16).to_le_bytes());
        out.extend_from_slice(&(members.len() as u16).to_le_bytes());
        out.extend_from_slice(&(cd.len() as u32).to_le_bytes());
        out.extend_from_slice(&cd_off.to_le_bytes());
        out.extend_from_slice(&0u16.to_le_bytes());
        out
    }

    #[test]
    fn opens_a_stored_container() {
        let man = br#"{"format":"3dheat","format_version":"1.3","roles":{"table":"t.parquet"},"members":[{"name":"t.parquet","role":"table"},{"name":"m.json","role":"match"}]}"#;
        let z = zip(&[("manifest.json", man), ("t.parquet", b"PAR1xxPAR1"), ("m.json", b"{}")]);
        let c = Container::open(&z).unwrap();
        let t = c.tables();
        assert_eq!(t.len(), 1);
        assert_eq!(&*member_bytes(&z, t[0]).unwrap(), b"PAR1xxPAR1");
        assert!(Container::open(&zip(&[("manifest.json", br#"{"format":"3dheat","format_version":"2.0"}"#)])).is_err());
    }
}
