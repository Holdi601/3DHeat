//! Sharing assets with a session's members: levels, the catalogue and
//! figure or model packs from the host's catalogue folder (the levels folder
//! the extractors write into), by content hash.
//!
//! Off until the host shares an item, and then only that item: the host
//! confirms holding the rights to it (logged with the time), the members
//! fetch its files by their SHA-256 (`/a/<hash>`) after its manifest, and
//! check each hash before using it. Paths never leave the host's machine:
//! members see a name, a kind and sizes.
//!
//! **Confidential** material is recognised and needs a second, explicit
//! confirmation with a warning before it is shared (the host decides who is
//! entitled to see it, e.g. colleagues under the same agreement): anything
//! under a folder the host's local configuration names (kept beside the
//! server's state, never in a repository), anything in a folder marked with
//! a `.3dheat-confidential` file (or under one), and anything whose path has
//! a word that marks confidential material. Links are followed before
//! checking, so a link from the catalogue into a confidential folder is
//! confidential too. What is not inside the catalogue folder, or is no item
//! of it, is never shared.
//!
//! Packs made from a game's own models (model packs, car packs, local figure
//! packs) are local by nature: never shared unless the host allows it for
//! that pack, with a warning.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::{Component, Path, PathBuf};

/// A file that marks its folder, and everything under it, as confidential.
pub const MARKER: &str = ".3dheat-confidential";

/// Words in a path's folder or file names that mark confidential or licensed material.
const WORDS: &[&str] = &["confidential", "under-nda", "not-for-release"];

/// What an item is, from where it sits and what it is called.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Kind {
    Level,
    Course,
    Layouts,
    Ranges,
    Cars,
    Catalog,
    FigurePack,
    ModelPack,
    Other,
}

impl Kind {
    /// Made from a game's own models: shared only when the host allows it per pack.
    pub fn extracted(self) -> bool {
        matches!(self, Kind::ModelPack | Kind::Cars | Kind::FigurePack)
    }
}

/// Whether an item may be shared.
#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(tag = "verdict", content = "reason", rename_all = "kebab-case")]
pub enum Verdict {
    /// With the host's confirmation that it may.
    Ok,
    /// A pack made from a game's models: only with the host's per-pack permission.
    Extracted,
    /// Marked confidential (why): only with the host's explicit per-item confirmation, warned.
    Confidential(&'static str),
    /// Never: not inside the catalogue folder, or not an item of it.
    Blocked(&'static str),
}

/// What the host's local configuration marks confidential, besides the built-in rules.
#[derive(Clone, Debug, Default)]
pub struct Blocklist {
    roots: Vec<String>,
    words: Vec<String>,
}

/// A path as compared: forward slashes, lower case, without Windows' `\\?\` prefix.
pub fn norm(p: &Path) -> String {
    let mut s = p.to_string_lossy().replace('\\', "/").to_lowercase();
    if let Some(r) = s.strip_prefix("//?/unc/") {
        s = format!("//{r}");
    } else if let Some(r) = s.strip_prefix("//?/") {
        s = r.to_string();
    }
    while s.len() > 1 && s.ends_with('/') && !s.ends_with(":/") {
        s.pop();
    }
    s
}

fn under(path: &str, root: &str) -> bool {
    path == root
        || (path.starts_with(root) && (root.ends_with('/') || path[root.len()..].starts_with('/')))
}

impl Blocklist {
    /// Folders (`roots`) and further words (`words`) from the local configuration.
    pub fn new(roots: &[String], words: &[String]) -> Self {
        Self {
            roots: roots
                .iter()
                .map(|r| norm(Path::new(r)))
                .filter(|r| !r.is_empty())
                .collect(),
            words: words
                .iter()
                .map(|w| w.trim().to_lowercase())
                .filter(|w| w.len() >= 3)
                .collect(),
        }
    }

    /// Why `path` is confidential, if it is.
    pub fn confidential(&self, path: &Path) -> Option<&'static str> {
        let mut forms = vec![norm(path)];
        // Followed through links and junctions: the place the bytes really are.
        if let Ok(real) = std::fs::canonicalize(path) {
            forms.push(norm(&real));
        }
        for f in &forms {
            if self.roots.iter().any(|r| under(f, r)) {
                return Some("confidential-folder");
            }
            let segments = f.split('/').filter(|s| !s.is_empty());
            for seg in segments {
                if WORDS.iter().any(|w| seg.contains(w))
                    || self.words.iter().any(|w| seg.contains(w.as_str()))
                {
                    return Some("confidential-name");
                }
            }
        }
        // A marker file in the item's folder or any above it.
        let real = std::fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf());
        let mut dir = if real.is_dir() {
            Some(real.as_path())
        } else {
            real.parent()
        };
        while let Some(d) = dir {
            if d.join(MARKER).exists() {
                return Some("confidential-marker");
            }
            dir = d.parent();
        }
        None
    }
}

/// What a file under the catalogue root is, from its path under it (`/`-separated); None for what is no item.
pub fn classify(rel: &str) -> Option<(Kind, String, String)> {
    let parts: Vec<&str> = rel.split('/').filter(|p| !p.is_empty()).collect();
    let file = *parts.last()?;
    let lower = file.to_lowercase();
    if file.starts_with('.') {
        return None;
    }
    let top = if parts.len() > 1 { parts[0] } else { "" };
    let stem = |f: &str| {
        let f = f.strip_suffix(".layouts.json").unwrap_or(f);
        f.rsplit_once('.')
            .map(|(s, _)| s.to_string())
            .unwrap_or_else(|| f.to_string())
    };
    if top == "figure-packs" {
        return (lower.starts_with("figures") && lower.ends_with(".json")).then(|| {
            (
                Kind::FigurePack,
                String::new(),
                if parts.len() > 2 {
                    parts[1].to_string()
                } else {
                    stem(file)
                },
            )
        });
    }
    if top == "model-packs" {
        return (parts.len() == 3 && file == "model-pack.json")
            .then(|| (Kind::ModelPack, parts[1].to_string(), parts[1].to_string()));
    }
    let game = top.to_string();
    if parts.len() == 2 && file == "catalog.json" {
        return Some((Kind::Catalog, game.clone(), game));
    }
    if lower.ends_with(".layouts.json") {
        return Some((Kind::Layouts, game, stem(file)));
    }
    if lower == "ranges.json" {
        return Some((Kind::Ranges, game.clone(), game));
    }
    if lower.ends_with(".h3dcars") {
        return Some((Kind::Cars, game, stem(file)));
    }
    if lower.ends_with(".glb") || lower.ends_with(".gltf") {
        let kind = if parts.contains(&"courses") {
            Kind::Course
        } else {
            Kind::Level
        };
        return Some((kind, game, stem(file)));
    }
    None
}

/// The verdict on `rel` under `root`: blocked when it is not inside the root, confidential when marked so.
pub fn verdict(
    list: &Blocklist,
    root: &Path,
    rel: &str,
) -> (Verdict, Option<(Kind, String, String)>) {
    let Some(path) = inside(root, rel) else {
        return (Verdict::Blocked("outside"), None);
    };
    let Some(what) = classify(rel) else {
        return (Verdict::Blocked("not-an-item"), None);
    };
    if let Some(why) = list.confidential(&path) {
        return (Verdict::Confidential(why), Some(what));
    }
    // A model pack's units, a level's side files: the folder is checked as well.
    if let Some(dir) = path.parent() {
        if let Some(why) = list.confidential(dir) {
            return (Verdict::Confidential(why), Some(what));
        }
    }
    if what.0.extracted() {
        return (Verdict::Extracted, Some(what));
    }
    (Verdict::Ok, Some(what))
}

/// `rel` under `root`, when it names a file inside it (no `..`, no root or drive of its own,
/// and still inside once links are followed).
pub fn inside(root: &Path, rel: &str) -> Option<PathBuf> {
    if rel.is_empty()
        || rel.len() > 1024
        || rel.contains('\\')
        || rel.contains(':')
        || rel.contains('\0')
    {
        return None;
    }
    let p = Path::new(rel);
    if !p.components().all(|c| matches!(c, Component::Normal(_))) {
        return None;
    }
    let full = root.join(p);
    let real_root = std::fs::canonicalize(root).ok()?;
    let real = std::fs::canonicalize(&full).ok()?;
    if !real.starts_with(&real_root) || !real.is_file() {
        return None;
    }
    Some(full)
}

/// One file of a shared item.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ManifestFile {
    /// Under the item, `/`-separated: the file's name, or its place in a pack's folder.
    pub path: String,
    pub hash: String,
    pub size: u64,
}

/// What members fetch first: the item's files by hash.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Manifest {
    pub format: String,
    pub version: u32,
    pub kind: Kind,
    pub game: String,
    pub name: String,
    pub files: Vec<ManifestFile>,
}

/// At most, in one shared item.
pub const MAX_FILES: usize = 20_000;
pub const MAX_BYTES: u64 = 16 * 1024 * 1024 * 1024;

/// The files an item is shared with: a level with its layouts and side file
/// beside it, a pack with everything in its folder; each with its place
/// under the item and its path on disk, and why any of them is confidential
/// (every one is checked again: one confidential file makes the item so).
pub fn files_of(
    list: &Blocklist,
    root: &Path,
    rel: &str,
    kind: Kind,
) -> Result<(Vec<(String, PathBuf)>, Option<&'static str>), &'static str> {
    let main = inside(root, rel).ok_or("outside")?;
    let dir = main.parent().ok_or("outside")?.to_path_buf();
    let file = main
        .file_name()
        .map(|f| f.to_string_lossy().to_string())
        .unwrap_or_default();
    let mut out = vec![(file.clone(), main.clone())];
    match kind {
        Kind::Level | Kind::Course => {
            let stem = file
                .rsplit_once('.')
                .map(|(s, _)| s)
                .unwrap_or(&file)
                .to_string();
            for side in side_files(&dir, &stem, &file) {
                let p = dir.join(&side);
                out.push((side, p));
            }
            // A .gltf's own buffers and images, where it names them beside or below it.
            if file.to_lowercase().ends_with(".gltf") {
                for uri in gltf_uris(&main) {
                    if out.iter().any(|(n, _)| *n == uri) {
                        continue;
                    }
                    let p = dir.join(&uri);
                    if p.is_file() {
                        out.push((uri, p));
                    }
                }
            }
        }
        Kind::ModelPack => {
            out.clear();
            walk(&dir, "", &mut out, 0)?;
        }
        _ => {}
    }
    let mut confidential = None;
    for (_, p) in &out {
        if confidential.is_none() {
            confidential = list.confidential(p);
        }
        let real = std::fs::canonicalize(p).map_err(|_| "unreadable")?;
        if !real.starts_with(std::fs::canonicalize(root).map_err(|_| "outside")?) {
            return Err("outside");
        }
    }
    if out.len() > MAX_FILES {
        return Err("too-many-files");
    }
    Ok((out, confidential))
}

/// The files beside a level that are its own: its layouts, its side file,
/// its map pictures, its tiled terrain (`<stem>.json`, `<stem>.layouts.json`,
/// `<stem>_map.png`, `<stem>.terrain.bin`, ...), sorted. A file that belongs to
/// another level of the same folder with a longer name (`dust_old.json`
/// beside `dust.glb` and `dust_old.glb`) is that level's, not this one's;
/// hidden files and other models are left out.
pub fn side_files(dir: &Path, stem: &str, main: &str) -> Vec<String> {
    let Ok(rd) = std::fs::read_dir(dir) else {
        return Vec::new();
    };
    let names: Vec<String> = rd
        .flatten()
        .filter(|e| e.file_type().is_ok_and(|t| t.is_file()))
        .map(|e| e.file_name().to_string_lossy().to_string())
        .filter(|n| !n.starts_with('.'))
        .collect();
    let is_model = |n: &str| {
        let l = n.to_lowercase();
        l.ends_with(".glb") || l.ends_with(".gltf")
    };
    let stem_of = |n: &str| n.rsplit_once('.').map(|(s, _)| s.to_string()).unwrap_or_else(|| n.to_string());
    // The level stems of this folder: what a side file may belong to.
    let stems: Vec<String> = names.iter().filter(|n| is_model(n)).map(|n| stem_of(n)).collect();
    let belongs = |n: &str, s: &str| n.len() > s.len() && n.starts_with(s) && matches!(n.as_bytes()[s.len()], b'.' | b'_');
    let mut out: Vec<String> = names
        .iter()
        .filter(|n| n.as_str() != main && !is_model(n) && belongs(n, stem))
        // The longest level stem it matches is the level it belongs to.
        .filter(|n| !stems.iter().any(|o| o.len() > stem.len() && belongs(n, o)))
        .cloned()
        .collect();
    out.sort();
    out
}

/// The relative file names a .gltf names for its buffers and images (no data:
/// URIs, nothing up a folder, no absolute paths: only files beside or below it).
fn gltf_uris(p: &Path) -> Vec<String> {
    let Ok(text) = std::fs::read_to_string(p) else {
        return Vec::new();
    };
    let Ok(v) = serde_json::from_str::<serde_json::Value>(&text) else {
        return Vec::new();
    };
    let mut out: Vec<String> = Vec::new();
    for key in ["buffers", "images"] {
        for it in v.get(key).and_then(|x| x.as_array()).into_iter().flatten() {
            let Some(uri) = it.get("uri").and_then(|u| u.as_str()) else {
                continue;
            };
            if uri.len() > 512 || uri.contains(':') || uri.contains('\\') || uri.contains('%') || uri.contains('\0') {
                continue;
            }
            if Path::new(uri).components().all(|c| matches!(c, Component::Normal(_))) && !out.iter().any(|o| o == uri) {
                out.push(uri.to_string());
            }
        }
    }
    out
}

/// What sharing `rel` would send in all, bytes: a level with its side files, a
/// pack with its folder; the file alone for anything else.
pub fn total_size(root: &Path, rel: &str, kind: Kind, size: u64) -> u64 {
    let Some(main) = inside(root, rel) else {
        return size;
    };
    let (Some(dir), Some(file)) = (main.parent(), main.file_name()) else {
        return size;
    };
    match kind {
        Kind::Level | Kind::Course => {
            let file = file.to_string_lossy().to_string();
            let stem = file.rsplit_once('.').map(|(s, _)| s).unwrap_or(&file).to_string();
            size + side_files(dir, &stem, &file)
                .iter()
                .filter_map(|n| std::fs::metadata(dir.join(n)).ok())
                .map(|m| m.len())
                .sum::<u64>()
        }
        Kind::ModelPack => {
            let mut files = Vec::new();
            if walk(dir, "", &mut files, 0).is_err() {
                return size;
            }
            files.iter().filter_map(|(_, p)| std::fs::metadata(p).ok()).map(|m| m.len()).sum()
        }
        _ => size,
    }
}

fn walk(
    dir: &Path,
    prefix: &str,
    out: &mut Vec<(String, PathBuf)>,
    depth: usize,
) -> Result<(), &'static str> {
    if depth > 6 || out.len() > MAX_FILES {
        return Err("too-many-files");
    }
    let mut entries: Vec<_> = std::fs::read_dir(dir)
        .map_err(|_| "unreadable")?
        .flatten()
        .collect();
    entries.sort_by_key(|e| e.file_name());
    for e in entries {
        let name = e.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let p = e.path();
        let rel = if prefix.is_empty() {
            name.clone()
        } else {
            format!("{prefix}/{name}")
        };
        if p.is_dir() {
            walk(&p, &rel, out, depth + 1)?;
        } else if p.is_file() {
            out.push((rel, p));
        }
    }
    Ok(())
}

/// A file's SHA-256 and size.
pub fn hash_file(p: &Path) -> std::io::Result<(String, u64)> {
    use std::io::Read;
    let mut f = std::fs::File::open(p)?;
    let mut h = Sha256::new();
    let mut buf = vec![0u8; 1 << 20];
    let mut size = 0u64;
    loop {
        let n = f.read(&mut buf)?;
        if n == 0 {
            break;
        }
        size += n as u64;
        h.update(&buf[..n]);
    }
    Ok((hex::encode(h.finalize()), size))
}

/// The catalogue's items under `root`, each with its verdict (confidential ones marked so);
/// what cannot be shared at all is only counted. `(items, blocked)`.
pub fn list(blocks: &Blocklist, root: &Path) -> (Vec<serde_json::Value>, usize) {
    let mut files = Vec::new();
    let _ = walk_list(root, "", &mut files, 0);
    let mut items = Vec::new();
    let mut blocked = 0usize;
    for (rel, size) in files {
        let (v, what) = verdict(blocks, root, &rel);
        let Some((kind, game, name)) = what else {
            continue;
        };
        if kind == Kind::Layouts {
            continue; // shared with its level
        }
        match v {
            Verdict::Blocked(_) => blocked += 1,
            _ => items.push(serde_json::json!({
                "path": rel, "kind": kind, "game": game, "name": name, "size": size,
                "total": total_size(root, &rel, kind, size),
                "extracted": kind.extracted(),
                "confidential": matches!(v, Verdict::Confidential(_)),
            })),
        }
    }
    (items, blocked)
}

fn walk_list(
    dir: &Path,
    prefix: &str,
    out: &mut Vec<(String, u64)>,
    depth: usize,
) -> Result<(), ()> {
    if depth > 5 || out.len() > 50_000 {
        return Ok(());
    }
    let Ok(rd) = std::fs::read_dir(dir) else {
        return Ok(());
    };
    let mut entries: Vec<_> = rd.flatten().collect();
    entries.sort_by_key(|e| e.file_name());
    for e in entries {
        let name = e.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let rel = if prefix.is_empty() {
            name.clone()
        } else {
            format!("{prefix}/{name}")
        };
        let Ok(ft) = e.file_type() else { continue };
        if ft.is_dir() {
            walk_list(&e.path(), &rel, out, depth + 1)?;
        } else if ft.is_file() && classify(&rel).is_some() {
            out.push((rel, e.metadata().map(|m| m.len()).unwrap_or(0)));
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tree() -> PathBuf {
        let root = std::env::temp_dir().join(format!("heat3d-share-{}", crate::auth::token()));
        for (p, body) in [
            ("warthunder/alpha/alpha.glb", "glTF level"),
            ("warthunder/alpha/alpha.layouts.json", "{}"),
            ("warthunder/alpha/alpha.json", "{}"),
            ("warthunder/alpha/alpha.terrain.bin", "terrain"),
            ("warthunder/alpha/alpha_map.png", "png"),
            ("cs2/dust/dust.glb", "a"),
            ("cs2/dust/dust.layouts.json", "{}"),
            ("cs2/dust/dust_old.glb", "b"),
            ("cs2/dust/dust_old.layouts.json", "{}"),
            (
                "il2/moscow/moscow.gltf",
                r#"{"buffers":[{"uri":"geo.bin"},{"uri":"data:application/octet-stream;base64,AA=="}],"images":[{"uri":"tex/ground.png"},{"uri":"../../secret.png"},{"uri":"C:/x.png"}]}"#,
            ),
            ("il2/moscow/geo.bin", "bin"),
            ("il2/moscow/tex/ground.png", "png"),
            ("warthunder/ranges.json", "{}"),
            ("forza/courses/ring.glb", "course"),
            ("forza/forza.h3dcars", "cars"),
            ("model-packs/warthunder/model-pack.json", "{}"),
            ("model-packs/warthunder/units/t_80ud.glb", "unit"),
            ("figure-packs/local-pack/figures.json", "{}"),
            ("secret-game/beta/beta.glb", "confidential level"),
            ("marked/gamma/gamma.glb", "marked level"),
            ("marked/.3dheat-confidential", ""),
            ("games-not-for-release/delta/delta.glb", "unreleased"),
            ("Confidential-Maps/x/x.glb", "confidential maps"),
        ] {
            let f = root.join(p);
            std::fs::create_dir_all(f.parent().unwrap()).unwrap();
            std::fs::write(f, body).unwrap();
        }
        root
    }

    fn local(root: &Path) -> Blocklist {
        Blocklist::new(
            &[root.join("secret-game").to_string_lossy().to_string()],
            &["hushhush".into()],
        )
    }

    #[test]
    fn classify_by_place_and_name() {
        assert_eq!(
            classify("warthunder/alpha/alpha.glb").unwrap().0,
            Kind::Level
        );
        assert_eq!(classify("forza/courses/ring.glb").unwrap().0, Kind::Course);
        assert_eq!(
            classify("warthunder/alpha/alpha.layouts.json").unwrap().0,
            Kind::Layouts
        );
        assert_eq!(classify("warthunder/ranges.json").unwrap().0, Kind::Ranges);
        assert_eq!(classify("forza/forza.h3dcars").unwrap().0, Kind::Cars);
        assert_eq!(
            classify("model-packs/warthunder/model-pack.json")
                .unwrap()
                .0,
            Kind::ModelPack
        );
        assert!(classify("model-packs/warthunder/units/t_80ud.glb").is_none());
        assert_eq!(
            classify("figure-packs/local-pack/figures.json").unwrap().0,
            Kind::FigurePack
        );
        assert_eq!(classify("cs2/catalog.json").unwrap().0, Kind::Catalog);
        assert!(classify("warthunder/notes.txt").is_none());
        assert!(classify("warthunder/.hidden.glb").is_none());
    }

    #[test]
    fn confidential_items_are_recognised_and_what_is_outside_is_never_shared() {
        let root = tree();
        let bl = local(&root);
        let v = |rel: &str| verdict(&bl, &root, rel).0;
        assert_eq!(v("warthunder/alpha/alpha.glb"), Verdict::Ok);
        assert_eq!(v("forza/courses/ring.glb"), Verdict::Ok);
        assert_eq!(v("warthunder/ranges.json"), Verdict::Ok);
        // Named in the local configuration.
        assert_eq!(
            v("secret-game/beta/beta.glb"),
            Verdict::Confidential("confidential-folder")
        );
        // Marked with the marker file, in a folder above.
        assert_eq!(
            v("marked/gamma/gamma.glb"),
            Verdict::Confidential("confidential-marker")
        );
        // Words that mark confidential or unreleased material.
        assert_eq!(
            v("games-not-for-release/delta/delta.glb"),
            Verdict::Confidential("confidential-name")
        );
        assert_eq!(
            v("Confidential-Maps/x/x.glb"),
            Verdict::Confidential("confidential-name")
        );
        // A word from the local configuration.
        let hush = root.join("hushhush-maps/e/e.glb");
        std::fs::create_dir_all(hush.parent().unwrap()).unwrap();
        std::fs::write(&hush, "x").unwrap();
        assert_eq!(
            v("hushhush-maps/e/e.glb"),
            Verdict::Confidential("confidential-name")
        );
        // Packs made from games' models: only with per-pack permission.
        assert_eq!(
            v("model-packs/warthunder/model-pack.json"),
            Verdict::Extracted
        );
        assert_eq!(v("forza/forza.h3dcars"), Verdict::Extracted);
        assert_eq!(
            v("figure-packs/local-pack/figures.json"),
            Verdict::Extracted
        );
        // Not an item, not inside the root, or no such file.
        for bad in [
            "../x.glb",
            "warthunder/../../x.glb",
            "/etc/passwd",
            "C:/Windows/win.ini",
            "warthunder\\alpha\\alpha.glb",
            "",
            "warthunder/alpha/none.glb",
        ] {
            assert!(matches!(v(bad), Verdict::Blocked(_)), "{bad}");
        }
        assert_eq!(v("warthunder/alpha"), Verdict::Blocked("outside"));
        let _ = std::fs::remove_dir_all(&root);
    }

    #[test]
    fn a_shared_item_takes_its_side_files_and_each_is_checked() {
        let root = tree();
        let bl = local(&root);
        let (f, conf) = files_of(&bl, &root, "warthunder/alpha/alpha.glb", Kind::Level).unwrap();
        assert_eq!(conf, None);
        let names: Vec<&str> = f.iter().map(|(n, _)| n.as_str()).collect();
        assert_eq!(names, ["alpha.glb", "alpha.json", "alpha.layouts.json", "alpha.terrain.bin", "alpha_map.png"]);
        // Two levels in one folder: each takes its own side files only.
        let (f, _) = files_of(&bl, &root, "cs2/dust/dust.glb", Kind::Level).unwrap();
        let names: Vec<&str> = f.iter().map(|(n, _)| n.as_str()).collect();
        assert_eq!(names, ["dust.glb", "dust.layouts.json"]);
        let (f, _) = files_of(&bl, &root, "cs2/dust/dust_old.glb", Kind::Level).unwrap();
        let names: Vec<&str> = f.iter().map(|(n, _)| n.as_str()).collect();
        assert_eq!(names, ["dust_old.glb", "dust_old.layouts.json"]);
        // A .gltf takes the buffers and images it names, nothing outside its folder.
        let (f, _) = files_of(&bl, &root, "il2/moscow/moscow.gltf", Kind::Level).unwrap();
        let names: Vec<&str> = f.iter().map(|(n, _)| n.as_str()).collect();
        assert_eq!(names, ["moscow.gltf", "geo.bin", "tex/ground.png"]);
        // What the host is told it would send: the level with its side files.
        assert_eq!(total_size(&root, "warthunder/alpha/alpha.glb", Kind::Level, 10), 10 + 2 + 2 + 7 + 3);
        let (pack, conf) = files_of(
            &bl,
            &root,
            "model-packs/warthunder/model-pack.json",
            Kind::ModelPack,
        )
        .unwrap();
        assert_eq!(conf, None);
        let names: Vec<&str> = pack.iter().map(|(n, _)| n.as_str()).collect();
        assert_eq!(names, ["model-pack.json", "units/t_80ud.glb"]);
        // A file in a pack's folder that is marked confidential makes the whole pack confidential.
        std::fs::write(
            root.join("model-packs/warthunder/units/.3dheat-confidential"),
            "",
        )
        .unwrap();
        assert_eq!(
            files_of(
                &bl,
                &root,
                "model-packs/warthunder/model-pack.json",
                Kind::ModelPack
            )
            .unwrap()
            .1,
            Some("confidential-marker")
        );
        // Outside the root: never.
        assert_eq!(
            files_of(&bl, &root, "../x.glb", Kind::Level).unwrap_err(),
            "outside"
        );
        let _ = std::fs::remove_dir_all(&root);
    }

    #[test]
    fn the_list_marks_confidential_items() {
        let root = tree();
        let (items, blocked) = list(&local(&root), &root);
        let text = serde_json::to_string(&items).unwrap();
        assert_eq!(blocked, 0);
        for name in ["beta", "gamma", "delta", "x"] {
            let it = items
                .iter()
                .find(|i| i["name"] == name)
                .unwrap_or_else(|| panic!("{name} in {text}"));
            assert_eq!(it["confidential"], true, "{name}");
        }
        assert!(items
            .iter()
            .any(|i| i["name"] == "alpha" && i["confidential"] == false));
        assert!(text.contains("alpha") && !text.contains("alpha.layouts"));
        assert!(items
            .iter()
            .any(|i| i["kind"] == "model-pack" && i["extracted"] == true));
        let _ = std::fs::remove_dir_all(&root);
    }

    #[test]
    fn paths_compare_without_case_or_prefixes() {
        assert_eq!(norm(Path::new(r"\\?\E:\Data\Levels\")), "e:/data/levels");
        assert_eq!(norm(Path::new(r"\\?\UNC\nas\Data\X")), "//nas/data/x");
        assert!(under("e:/data/levels/x", "e:/data/levels"));
        assert!(!under("e:/data/levels2/x", "e:/data/levels"));
        let bl = Blocklist::new(&[r"\\nas\Data\Secret".into()], &[]);
        assert!(under(
            &norm(Path::new(r"\\NAS\data\secret\a.csv")),
            &bl.roots[0]
        ));
    }
}
