//! The pinned index of the extractors (`src/extractors/extractors.json` of the
//! viewer, built into this crate): which programs exist, where their releases
//! are, what their files are called. Only a repository named here is ever
//! asked or downloaded from.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// The index as shipped: the same file the viewer's panel reads.
pub const SHIPPED: &str = include_str!("../../../../src/extractors/extractors.json");

/// One extractor of the index.
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct Entry {
    /// The executable's name, `heat3d-...`.
    pub id: String,
    pub name: String,
    pub games: Vec<String>,
    /// What it does, in a line.
    pub what: String,
    /// `owner/name` on GitHub.
    pub repo: String,
    /// The release asset per platform (`windows-x64`, `linux-x64`, `macos-arm64`), `{id}` and `{version}` filled in.
    pub assets: BTreeMap<String, String>,
    /// The program inside the archive per platform, the same placeholders.
    pub exe: BTreeMap<String, String>,
    /// The checksums asset (`sha256sum` format).
    pub sums: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
struct Doc {
    format: String,
    version: u32,
    extractors: Vec<Entry>,
}

/// The extractors, in the index's order.
#[derive(Clone, Debug)]
pub struct Index {
    pub entries: Vec<Entry>,
}

/// The platform this build runs on, as the index names it; `None` where no extractor is built.
pub fn platform() -> Option<&'static str> {
    if cfg!(all(windows, target_arch = "x86_64")) {
        Some("windows-x64")
    } else if cfg!(all(target_os = "linux", target_arch = "x86_64")) {
        Some("linux-x64")
    } else if cfg!(all(target_os = "macos", target_arch = "aarch64")) {
        Some("macos-arm64")
    } else {
        None
    }
}

fn id_ok(s: &str) -> bool {
    s.starts_with("heat3d-") && s.len() <= 64 && s.bytes().all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-')
}

fn repo_ok(s: &str) -> bool {
    let name = |p: &str| !p.is_empty() && p.len() <= 100 && p != "." && p != ".." && p.bytes().all(|b| b.is_ascii_alphanumeric() || b"-_.".contains(&b));
    matches!(s.split_once('/'), Some((o, n)) if name(o) && name(n) && !n.contains('/'))
}

/// A template's text with only `{id}` and `{version}` in braces, and plain path characters.
fn template_ok(t: &str, path: bool) -> bool {
    let plain = t.replace("{id}", "").replace("{version}", "");
    !t.is_empty()
        && plain.bytes().all(|b| b.is_ascii_alphanumeric() || b"-_.".contains(&b) || (path && b == b'/'))
        && (!path || t.split('/').all(|p| !p.is_empty() && p != "." && p != ".."))
}

impl Entry {
    /// The asset's name for this platform and version.
    pub fn asset(&self, platform: &str, version: &str) -> Option<String> {
        self.assets.get(platform).map(|t| t.replace("{id}", &self.id).replace("{version}", version))
    }

    /// The program's path inside the unpacked archive, `/`-separated.
    pub fn exe_path(&self, platform: &str) -> Option<String> {
        self.exe.get(platform).map(|t| t.replace("{id}", &self.id).replace("{version}", ""))
    }

    /// Whether there is a build for this platform.
    pub fn supports(&self, platform: &str) -> bool {
        self.assets.contains_key(platform) && self.exe.contains_key(platform)
    }
}

impl Index {
    /// Reads and checks an index: every id, repository, name and path plain, nothing twice.
    pub fn parse(text: &str) -> Result<Index, String> {
        let doc: Doc = serde_json::from_str(text).map_err(|e| format!("extractors index: {e}"))?;
        if doc.format != "3dheat-extractors" || doc.version != 1 {
            return Err("extractors index: not a version 1 index".into());
        }
        let mut ids = std::collections::HashSet::new();
        for e in &doc.extractors {
            let bad = |what: &str| Err(format!("extractors index: {} has a bad {what}", e.id));
            if !id_ok(&e.id) || !ids.insert(e.id.clone()) {
                return bad("or repeated id");
            }
            if !repo_ok(&e.repo) {
                return bad("repository");
            }
            if e.assets.is_empty() || e.assets.values().any(|t| !template_ok(t, false) || !t.contains("{version}")) {
                return bad("asset name");
            }
            if e.exe.keys().ne(e.assets.keys()) || e.exe.values().any(|t| !template_ok(t, true) || t.contains("{version}")) {
                return bad("program path");
            }
            if !template_ok(&e.sums, false) || e.sums.contains('{') {
                return bad("checksums name");
            }
        }
        Ok(Index { entries: doc.extractors })
    }

    /// The index built into this program.
    pub fn shipped() -> Index {
        Index::parse(SHIPPED).expect("the shipped extractors index is valid")
    }

    pub fn get(&self, id: &str) -> Option<&Entry> {
        self.entries.iter().find(|e| e.id == id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_shipped_index_reads() {
        let i = Index::shipped();
        assert_eq!(i.entries.len(), 21);
        for e in &i.entries {
            assert!(e.repo.starts_with("Holdi601/"), "{}", e.id);
            assert!(e.supports("windows-x64"), "{}", e.id);
            assert_eq!(e.asset("windows-x64", "1.2.3").unwrap(), format!("{}-1.2.3-windows-x64.zip", e.id));
            assert_eq!(e.exe_path("windows-x64").unwrap(), format!("{0}/{0}.exe", e.id));
            assert_eq!(e.sums, "SHA256SUMS");
            assert!(!e.id.ends_with("-fetch") && !e.id.contains("models"), "{}", e.id);
        }
        let wt = i.get("heat3d-warthunder").unwrap();
        assert_eq!(wt.asset("linux-x64", "0.4.0").unwrap(), "heat3d-warthunder-0.4.0-linux-x64.tar.gz");
        assert_eq!(wt.exe_path("linux-x64").unwrap(), "heat3d-warthunder/heat3d-warthunder");
        assert_eq!(wt.asset("macos-arm64", "0.4.0").unwrap(), "heat3d-warthunder-0.4.0-macos-arm64.tar.gz");
        assert_eq!(wt.exe_path("macos-arm64").unwrap(), "heat3d-warthunder/heat3d-warthunder");
        for id in ["heat3d-battlefield", "heat3d-r6", "heat3d-r6-maps"] {
            assert!(!i.get(id).unwrap().supports("linux-x64") && !i.get(id).unwrap().supports("macos-arm64"), "{id}");
        }
        assert_eq!(i.entries.iter().filter(|e| e.supports("linux-x64")).count(), 18);
        assert_eq!(i.entries.iter().filter(|e| e.supports("macos-arm64")).count(), 9);
        assert!(i.get("heat3d-gamecapture").unwrap().supports("macos-arm64") && !i.get("heat3d-dcs").unwrap().supports("macos-arm64"));
    }

    #[test]
    fn a_bad_index_is_refused() {
        let ok = r#"{"format":"3dheat-extractors","version":1,"extractors":[{"id":"heat3d-x","name":"X","games":[],"what":"","repo":"a/b",
            "assets":{"windows-x64":"{id}-{version}.zip"},"exe":{"windows-x64":"{id}/{id}.exe"},"sums":"SHA256SUMS"}]}"#;
        assert!(Index::parse(ok).is_ok());
        for (from, to) in [
            (r#""a/b""#, r#""a/../b""#),
            (r#""a/b""#, r#""https://evil/x""#),
            (r#""heat3d-x""#, r#""../x""#),
            (r#""{id}-{version}.zip""#, r#""../{id}-{version}.zip""#),
            (r#""{id}-{version}.zip""#, r#""{id}.zip""#),
            (r#""{id}/{id}.exe""#, r#""../{id}.exe""#),
            (r#""{id}/{id}.exe""#, r#""/{id}.exe""#),
            (r#""SHA256SUMS""#, r#""a/SUMS""#),
            (r#""version":1"#, r#""version":2"#),
            (r#""sums":"#, r#""url":"x","sums":"#),
        ] {
            let bad = ok.replacen(from, to, 1);
            assert_ne!(bad, ok);
            assert!(Index::parse(&bad).is_err(), "{to}");
        }
    }
}
