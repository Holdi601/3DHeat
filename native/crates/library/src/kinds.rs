//! What a file is, by its name: the kind of library item, its format, and the
//! game a format alone names. Nothing is opened here.

use std::path::Path;

/// What a library item is.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Kind {
    /// A raw replay or demo, as the game wrote it: converted before the viewer reads it.
    Replay,
    /// A recording the viewer reads as it is (Tacview ACMI).
    Recording,
    /// A match the viewer reads: a `.3dheat` container, or a table with its sidecars.
    Match,
    /// A Watcher session folder.
    Session,
    /// An extracted level, map or course.
    Level,
    /// A model or figure pack.
    Models,
}

impl Kind {
    pub fn as_str(self) -> &'static str {
        match self {
            Kind::Replay => "replay",
            Kind::Recording => "recording",
            Kind::Match => "match",
            Kind::Session => "session",
            Kind::Level => "level",
            Kind::Models => "models",
        }
    }

    pub fn parse(s: &str) -> Option<Kind> {
        Some(match s {
            "replay" => Kind::Replay,
            "recording" => Kind::Recording,
            "match" => Kind::Match,
            "session" => Kind::Session,
            "level" => Kind::Level,
            "models" => Kind::Models,
            _ => return None,
        })
    }

    /// Opened in the viewer as it is.
    pub fn viewable(self) -> bool {
        matches!(self, Kind::Recording | Kind::Match | Kind::Session)
    }
}

/// A classified file: its kind, format and, where the format says it, the game.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Class {
    pub kind: Kind,
    pub format: &'static str,
    pub game: Option<&'static str>,
}

/// Roles a match's side tables carry in their names (`<match>.<role>.parquet`):
/// members of the match, never items of their own.
const SIDE_ROLES: &[&str] = &[
    "events", "effects", "props", "packets", "flight", "messages", "objectives", "strings", "raw", "hits", "shots", "units", "rounds",
    "grenades", "damage", "economy", "chat", "kills", "states", "zones", "frames", "players", "infernos", "bombs", "items", "marks",
];

fn lower_name(path: &Path) -> String {
    path.file_name().map(|n| n.to_string_lossy().to_lowercase()).unwrap_or_default()
}

/// `a.events.parquet` -> true when `events` is a side role.
fn is_side_table(name: &str, ext: &str) -> bool {
    let stem = &name[..name.len() - ext.len()];
    match stem.rsplit_once('.') {
        Some((_, role)) => SIDE_ROLES.contains(&role),
        None => false,
    }
}

/// What a file is, from its name alone; `None` for files the library leaves out.
pub fn classify(path: &Path) -> Option<Class> {
    let name = lower_name(path);
    let c = |kind, format, game| Some(Class { kind, format, game });
    if name.starts_with("3dheat-index") || name.starts_with('.') {
        return None;
    }
    if name.ends_with(".3dheat") {
        return c(Kind::Match, "3dheat", None);
    }
    if name.ends_with(".zip.acmi") || name.ends_with(".txt.acmi") || name.ends_with(".acmi") {
        return c(Kind::Recording, "acmi", None);
    }
    if name.ends_with(".parquet") || name.ends_with(".pq") {
        let ext = if name.ends_with(".pq") { ".pq" } else { ".parquet" };
        if is_side_table(&name, ext) || name == "heat.parquet" || name == "heat.raw.parquet" {
            return None;
        }
        return c(Kind::Match, "parquet", None);
    }
    if name.ends_with(".wrpl") {
        return c(Kind::Replay, "wrpl", Some("warthunder"));
    }
    if name.ends_with(".dem") {
        // Counter-Strike 2 or Dota 2: the demo's header says which.
        return c(Kind::Replay, "dem", None);
    }
    if name.ends_with(".rec") {
        return c(Kind::Replay, "rec", Some("r6"));
    }
    if name.ends_with(".wowsreplay") {
        return c(Kind::Replay, "wowsreplay", Some("wows"));
    }
    if name.ends_with(".wotreplay") {
        return c(Kind::Replay, "wotreplay", Some("wot"));
    }
    if name.ends_with(".replay") {
        // Unreal Engine replays (Squad's server demos among them).
        return c(Kind::Replay, "ue-replay", None);
    }
    if name.ends_with(".rofl") {
        return c(Kind::Replay, "rofl", Some("lol"));
    }
    if name.ends_with(".glb") {
        return c(Kind::Level, "glb", None);
    }
    if name.ends_with(".h3dcars") {
        return c(Kind::Models, "h3dcars", None);
    }
    if name.ends_with(".h3dmodels") || name.ends_with(".h3dpack") {
        return c(Kind::Models, "pack", None);
    }
    if (name.starts_with("figures") && name.ends_with(".json")) && path.parent().and_then(|p| p.parent()).map(lower_name).as_deref() == Some("figure-packs") {
        return c(Kind::Models, "figures", None);
    }
    if name.ends_with(".csv") || name.ends_with(".tsv") {
        let ext = &name[name.len() - 4..];
        if is_side_table(&name, ext) {
            return None;
        }
        return c(Kind::Match, "csv", None);
    }
    None
}

/// Folder names never walked into: build output, version control, our own staging.
pub fn skip_dir(name: &str) -> bool {
    let n = name.to_ascii_lowercase();
    n.starts_with('.') || matches!(n.as_str(), "node_modules" | "__pycache__" | "$recycle.bin" | "system volume information")
}

/// A Watcher session folder: `meta.json` beside `events.jsonl` or `heat.parquet`.
pub fn is_watcher_session(dir: &Path) -> bool {
    dir.join("meta.json").is_file() && (dir.join("events.jsonl").is_file() || dir.join("heat.parquet").is_file())
}

/// The canonical game id for a name a file, a folder or a header uses.
pub fn game_id(raw: &str) -> Option<&'static str> {
    let s = raw.trim().to_ascii_lowercase().replace(['_', ' ', '.'], "-");
    let s = s.as_str();
    Some(match s {
        "warthunder" | "war-thunder" | "wt" => "warthunder",
        "dcs" | "dcs-world" => "dcs",
        "cs2" | "csgo" | "counter-strike-2" | "counter-strike" => "cs2",
        "dota" | "dota2" | "dota-2" => "dota2",
        "r6" | "rainbow-six-siege" | "siege" | "r6s" => "r6",
        "wows" | "world-of-warships" => "wows",
        "wot" | "world-of-tanks" => "wot",
        "squad" => "squad",
        "il2" | "il-2" | "il-2-sturmovik" => "il2",
        "battlefield-6" | "bf6" => "bf6",
        "battlefield-4" | "bf4" => "bf4",
        "battlefield-1" | "bf1" => "bf1",
        "forza" | "forza-horizon" | "forza-motorsport" => "forza",
        "acrally" | "assetto-corsa-rally" => "acrally",
        "beamng" | "beamng-drive" => "beamng",
        "arma-reforger" | "reforger" => "reforger",
        "hell-let-loose-vietnam" | "hll-vietnam" => "hllv",
        "lol" | "league-of-legends" => "lol",
        "valorant" => "valorant",
        "falcon-bms" | "bms" => "bms",
        "unreal-test-level" => "unreal",
        _ => return None,
    })
}

/// The game a path's folders name (`levels\warthunder\...`, `replays-raw\cs2\...`), nearest first.
pub fn game_from_path(path: &Path) -> Option<&'static str> {
    path.ancestors().skip(1).take(6).find_map(|p| p.file_name().and_then(|n| game_id(&n.to_string_lossy())))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn classifies_by_name() {
        let k = |p: &str| classify(&PathBuf::from(p)).map(|c| (c.kind, c.format, c.game));
        assert_eq!(k("a/b/x.3dheat"), Some((Kind::Match, "3dheat", None)));
        assert_eq!(k("a/Tacview-1.zip.acmi"), Some((Kind::Recording, "acmi", None)));
        assert_eq!(k("a/#2026.11.05 23.27.45.wrpl"), Some((Kind::Replay, "wrpl", Some("warthunder"))));
        assert_eq!(k("a/m1.parquet"), Some((Kind::Match, "parquet", None)));
        assert_eq!(k("a/m1.events.parquet"), None);
        assert_eq!(k("a/m1.match.json"), None);
        assert_eq!(k("a/3dheat-index.jsonl.gz"), None);
        assert_eq!(k("a/de_dust2.glb"), Some((Kind::Level, "glb", None)));
        assert_eq!(k("a/figure-packs/p/figures.json"), Some((Kind::Models, "figures", None)));
        assert_eq!(k("a/notes.json"), None);
        assert_eq!(k("a/x.dem"), Some((Kind::Replay, "dem", None)));
    }

    #[test]
    fn games_from_folders() {
        assert_eq!(game_from_path(&PathBuf::from("E:/d/levels/warthunder/avg/avg.glb")), Some("warthunder"));
        assert_eq!(game_from_path(&PathBuf::from("E:/d/replays-raw/cs2/pro/x.dem")), Some("cs2"));
        assert_eq!(game_from_path(&PathBuf::from("E:/d/stuff/x.dem")), None);
        assert_eq!(game_id("Battlefield 6"), Some("bf6"));
    }
}
