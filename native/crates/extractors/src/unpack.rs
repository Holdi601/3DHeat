//! Unpacking a verified release archive into a fresh folder, member by
//! member, refusing anything that would land outside it: absolute paths,
//! drive letters, `..`, members outside the archive's one top folder, links
//! pointing out of it (and any link in a zip), devices; and archives that
//! unpack to more than a few gigabytes or too many files.

use std::fs::{self, File, OpenOptions};
use std::io::{self, Read};
use std::path::{Path, PathBuf};

const MAX_TOTAL: u64 = 8 << 30;
const MAX_ENTRIES: usize = 200_000;

/// The archive formats of the releases.
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Kind {
    Zip,
    TarGz,
}

impl Kind {
    /// By the asset's name.
    pub fn of(name: &str) -> Option<Kind> {
        if name.ends_with(".zip") {
            Some(Kind::Zip)
        } else if name.ends_with(".tar.gz") || name.ends_with(".tgz") {
            Some(Kind::TarGz)
        } else {
            None
        }
    }
}

/// A member's path as plain components, the first of them `top`; `None` when it is not one.
pub fn member_path(name: &str, top: &str) -> Option<Vec<String>> {
    let name = name.replace('\\', "/");
    if name.starts_with('/') || name.len() > 1024 {
        return None;
    }
    let parts: Vec<&str> = name.trim_end_matches('/').split('/').collect();
    let ok = |p: &&str| {
        !p.is_empty()
            && *p != "."
            && *p != ".."
            && !p.contains(':')
            && !p.ends_with(' ')
            && !p.chars().any(|c| c.is_control() || "<>\"|?*".contains(c))
    };
    (parts.first() == Some(&top) && parts.iter().all(ok)).then(|| parts.into_iter().map(String::from).collect())
}

/// Where a link at `member` (components) pointing to `target` ends up, as components; `None` outside the top folder.
pub fn link_target(member: &[String], target: &str) -> Option<Vec<String>> {
    let target = target.replace('\\', "/");
    if target.starts_with('/') || target.contains(':') || target.is_empty() {
        return None;
    }
    let mut at: Vec<String> = member[..member.len().saturating_sub(1)].to_vec();
    for p in target.split('/') {
        match p {
            "" | "." => {}
            ".." => {
                at.pop();
                if at.is_empty() {
                    return None; // above the top folder
                }
            }
            p => at.push(p.to_string()),
        }
    }
    (!at.is_empty()).then_some(at)
}

/// The member's place under `dest`, refused when a folder on the way is a link: a
/// chain of links, each inside by itself, could otherwise lead out.
fn join(dest: &Path, parts: &[String]) -> io::Result<PathBuf> {
    let mut p = dest.to_path_buf();
    for (i, part) in parts.iter().enumerate() {
        p.push(part);
        if i + 1 < parts.len() && fs::symlink_metadata(&p).is_ok_and(|m| m.file_type().is_symlink()) {
            return Err(bad(format!("an archive member behind a link: {}", parts.join("/"))));
        }
    }
    Ok(p)
}

fn bad(why: impl Into<String>) -> io::Error {
    io::Error::new(io::ErrorKind::InvalidData, why.into())
}

/// Writes one file (never through something already there), at most `room` bytes.
fn write_file(path: &Path, from: &mut dyn Read, room: u64, executable: bool) -> io::Result<u64> {
    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir)?;
    }
    let mut f = OpenOptions::new().write(true).create_new(true).open(path)?;
    let n = io::copy(&mut from.take(room + 1), &mut f)?;
    if n > room {
        return Err(bad("the archive unpacks to too much"));
    }
    set_executable(path, executable)?;
    Ok(n)
}

#[cfg(unix)]
fn set_executable(path: &Path, x: bool) -> io::Result<()> {
    use std::os::unix::fs::PermissionsExt;
    fs::set_permissions(path, fs::Permissions::from_mode(if x { 0o755 } else { 0o644 }))
}

#[cfg(not(unix))]
fn set_executable(_: &Path, _: bool) -> io::Result<()> {
    Ok(())
}

/// Unpacks `archive` into `dest` (created; must not exist), every member inside `dest/<top>`.
pub fn unpack(archive: &Path, kind: Kind, dest: &Path, top: &str) -> io::Result<()> {
    fs::create_dir_all(dest.parent().unwrap_or(dest))?;
    fs::create_dir(dest)?;
    match kind {
        Kind::Zip => unzip(archive, dest, top),
        Kind::TarGz => untar(archive, dest, top),
    }
}

fn unzip(archive: &Path, dest: &Path, top: &str) -> io::Result<()> {
    let mut zip = zip::ZipArchive::new(File::open(archive)?).map_err(|e| bad(format!("not a zip archive: {e}")))?;
    if zip.len() > MAX_ENTRIES {
        return Err(bad("the archive holds too many files"));
    }
    let mut total = 0u64;
    for i in 0..zip.len() {
        let mut f = zip.by_index(i).map_err(|e| bad(format!("zip member {i}: {e}")))?;
        let name = f.name().map_err(|e| bad(format!("zip member {i}: {e}")))?.to_string();
        let parts = member_path(&name, top).ok_or_else(|| bad(format!("an archive member outside its folder: {name}")))?;
        if f.is_symlink() {
            return Err(bad(format!("a link in the archive: {name}")));
        }
        let path = join(dest, &parts)?;
        if f.is_dir() {
            fs::create_dir_all(&path)?;
            continue;
        }
        let x = f.unix_mode().is_some_and(|m| m & 0o111 != 0);
        total += write_file(&path, &mut f, MAX_TOTAL - total, x)?;
    }
    Ok(())
}

fn untar(archive: &Path, dest: &Path, top: &str) -> io::Result<()> {
    let mut tar = tar::Archive::new(flate2::read::GzDecoder::new(File::open(archive)?));
    let mut total = 0u64;
    for (count, entry) in tar.entries()?.enumerate() {
        if count >= MAX_ENTRIES {
            return Err(bad("the archive holds too many files"));
        }
        let mut e = entry?;
        let name = String::from_utf8(e.path_bytes().into_owned()).map_err(|_| bad("an archive member with a name that is not text"))?;
        let parts = member_path(&name, top).ok_or_else(|| bad(format!("an archive member outside its folder: {name}")))?;
        let path = join(dest, &parts)?;
        let kind = e.header().entry_type();
        let to = e.link_name_bytes().map(|b| String::from_utf8_lossy(&b).into_owned()).unwrap_or_default();
        let out = || bad(format!("a link out of the archive's folder: {name}"));
        if kind.is_dir() {
            fs::create_dir_all(&path)?;
        } else if kind.is_file() || kind == tar::EntryType::Continuous {
            let x = e.header().mode().is_ok_and(|m| m & 0o111 != 0);
            total += write_file(&path, &mut e, MAX_TOTAL - total, x)?;
        } else if kind.is_hard_link() {
            // A hard link names another member by its path in the archive.
            let from = join(dest, &member_path(&to, top).ok_or_else(out)?)?;
            if fs::symlink_metadata(&from).is_ok_and(|m| m.file_type().is_symlink()) {
                return Err(out());
            }
            let mut src = File::open(&from).map_err(|_| bad(format!("a link to nothing unpacked yet: {name}")))?;
            total += write_file(&path, &mut src, MAX_TOTAL - total, true)?;
        } else if kind.is_symlink() {
            link_target(&parts, &to).ok_or_else(out)?;
            symlink(&to, &path)?;
        } else if kind.is_pax_global_extensions() || kind.is_pax_local_extensions() || kind.is_gnu_longname() || kind.is_gnu_longlink() {
            // Read by the tar reader itself.
        } else {
            return Err(bad(format!("a device or other special file in the archive: {name}")));
        }
    }
    Ok(())
}

/// A link checked to stay inside (`link_target`).
#[cfg(unix)]
fn symlink(target: &str, at: &Path) -> io::Result<()> {
    if let Some(dir) = at.parent() {
        fs::create_dir_all(dir)?;
    }
    std::os::unix::fs::symlink(target.replace('\\', "/"), at)
}

#[cfg(not(unix))]
fn symlink(_: &str, at: &Path) -> io::Result<()> {
    Err(bad(format!("a link in the archive: {}", at.display())))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    fn tmp(name: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("heat3d-unpack-{name}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&d);
        fs::create_dir_all(&d).unwrap();
        d
    }

    #[test]
    fn member_paths_stay_inside() {
        assert_eq!(member_path("x/a/b.exe", "x").unwrap(), ["x", "a", "b.exe"]);
        assert_eq!(member_path("x\\a\\b.exe", "x").unwrap(), ["x", "a", "b.exe"]);
        assert_eq!(member_path("x/", "x").unwrap(), ["x"]);
        for bad in ["/x/a", "x/../y", "x/./a", "y/a", "../x/a", "C:/x/a", "x/a:stream", "x//a", "", "x/a/..", "x/nul?", "x/a "] {
            assert!(member_path(bad, "x").is_none(), "{bad}");
        }
    }

    #[test]
    fn links_stay_inside() {
        let at: Vec<String> = ["x", "lib", "a.so"].iter().map(|s| s.to_string()).collect();
        assert_eq!(link_target(&at, "a.so.1").unwrap(), ["x", "lib", "a.so.1"]);
        assert_eq!(link_target(&at, "../bin/y").unwrap(), ["x", "bin", "y"]);
        assert!(link_target(&at, "../../y").is_none());
        assert!(link_target(&at, "/etc/passwd").is_none());
        assert!(link_target(&at, "C:/Windows").is_none());
    }

    fn zip_of(members: &[(&str, &[u8])]) -> Vec<u8> {
        let mut w = zip::ZipWriter::new(io::Cursor::new(Vec::new()));
        for (name, data) in members {
            w.start_file(*name, zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated)).unwrap();
            w.write_all(data).unwrap();
        }
        w.finish().unwrap().into_inner()
    }

    #[test]
    fn zips_unpack_and_escapes_are_refused() {
        let d = tmp("zip");
        let good = d.join("good.zip");
        fs::write(&good, zip_of(&[("x/x.exe", b"MZ"), ("x/_internal/lib.dll", b"lib")])).unwrap();
        unpack(&good, Kind::Zip, &d.join("out"), "x").unwrap();
        assert_eq!(fs::read(d.join("out/x/_internal/lib.dll")).unwrap(), b"lib");
        for (i, name) in ["../evil.txt", "x/../../evil.txt", "/abs.txt", "other/a.txt", "x/C:/a"].iter().enumerate() {
            let a = d.join(format!("bad{i}.zip"));
            fs::write(&a, zip_of(&[("x/x.exe", b"MZ"), (name, b"evil")])).unwrap();
            assert!(unpack(&a, Kind::Zip, &d.join(format!("bad{i}")), "x").is_err(), "{name}");
        }
        assert!(!d.join("evil.txt").exists() && !d.parent().unwrap().join("evil.txt").exists());
        // A symlink in a zip.
        let mut w = zip::ZipWriter::new(io::Cursor::new(Vec::new()));
        w.add_symlink("x/link", "../../outside", zip::write::SimpleFileOptions::default()).unwrap();
        fs::write(d.join("link.zip"), w.finish().unwrap().into_inner()).unwrap();
        assert!(unpack(&d.join("link.zip"), Kind::Zip, &d.join("link"), "x").is_err());
        let _ = fs::remove_dir_all(d);
    }

    fn tgz_of(build: impl FnOnce(&mut tar::Builder<flate2::write::GzEncoder<Vec<u8>>>)) -> Vec<u8> {
        let mut b = tar::Builder::new(flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::fast()));
        build(&mut b);
        b.into_inner().unwrap().finish().unwrap()
    }

    fn file(b: &mut tar::Builder<flate2::write::GzEncoder<Vec<u8>>>, name: &str, data: &[u8]) {
        let mut h = tar::Header::new_gnu();
        h.set_size(data.len() as u64);
        h.set_mode(0o755);
        h.set_entry_type(tar::EntryType::Regular);
        // Written raw: the builder's own path setter refuses `..`, which is what is tested here.
        h.as_old_mut().name[..name.len()].copy_from_slice(name.as_bytes());
        h.set_cksum();
        b.append(&h, data).unwrap();
    }

    fn link(b: &mut tar::Builder<flate2::write::GzEncoder<Vec<u8>>>, name: &str, to: &str, kind: tar::EntryType) {
        let mut h = tar::Header::new_gnu();
        h.set_size(0);
        h.set_entry_type(kind);
        h.as_old_mut().name[..name.len()].copy_from_slice(name.as_bytes());
        h.as_old_mut().linkname[..to.len()].copy_from_slice(to.as_bytes());
        h.set_cksum();
        b.append(&h, io::empty()).unwrap();
    }

    #[test]
    fn tarballs_unpack_and_escapes_are_refused() {
        let d = tmp("tgz");
        fs::write(d.join("good.tgz"), tgz_of(|b| {
            file(b, "x/x", b"ELF");
            link(b, "x/y", "x/x", tar::EntryType::Link);
        }))
        .unwrap();
        unpack(&d.join("good.tgz"), Kind::TarGz, &d.join("out"), "x").unwrap();
        assert_eq!(fs::read(d.join("out/x/y")).unwrap(), b"ELF");
        let cases: Vec<(&str, Vec<u8>)> = vec![
            ("dotdot", tgz_of(|b| file(b, "x/../../evil", b"e"))),
            ("absolute", tgz_of(|b| file(b, "/tmp/evil", b"e"))),
            ("outside", tgz_of(|b| file(b, "y/evil", b"e"))),
            ("symlink out", tgz_of(|b| link(b, "x/l", "../../etc", tar::EntryType::Symlink))),
            ("symlink absolute", tgz_of(|b| link(b, "x/l", "/etc/passwd", tar::EntryType::Symlink))),
            ("hard link out", tgz_of(|b| link(b, "x/l", "../etc/passwd", tar::EntryType::Link))),
            ("device", tgz_of(|b| link(b, "x/dev", "", tar::EntryType::Char))),
        ];
        // Links inside by themselves, but a chain of them leads out: nothing is written behind a link.
        #[cfg(unix)]
        cases_chain(&d);
        for (what, bytes) in cases {
            let a = d.join(format!("{}.tgz", what.replace(' ', "-")));
            fs::write(&a, bytes).unwrap();
            assert!(unpack(&a, Kind::TarGz, &d.join(what.replace(' ', "-")), "x").is_err(), "{what}");
        }
        let _ = fs::remove_dir_all(d);
    }

    #[cfg(unix)]
    fn cases_chain(d: &Path) {
        let a = d.join("chain.tgz");
        fs::write(&a, tgz_of(|b| {
            link(b, "x/d", ".", tar::EntryType::Symlink);
            link(b, "x/d/l", "..", tar::EntryType::Symlink);
            file(b, "x/d/l/evil", b"e");
        }))
        .unwrap();
        assert!(unpack(&a, Kind::TarGz, &d.join("chain"), "x").is_err());
        assert!(!d.join("evil").exists());
    }
}
