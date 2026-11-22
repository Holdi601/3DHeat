//! The converters and extractors the Extractors manager installed. The library
//! holds no converter code: it runs the installed programs, as separate
//! processes, by the verbs of the extractor contract (docs/library.md):
//!
//! - `convert <input> -o <out>`: one replay into one match file under `out`;
//! - `info --json <input>`: a replay's metadata, for formats only the converter reads;
//! - `status --json`: the maps of the user's install, new, changed or outdated against the levels folder;
//! - `extract <map>... -o <levels>`: maps into levels.
//!
//! What is installed is read from the manager's folders (`<data>/extractors/<id>/current`
//! and the program it names), as the manager itself reads it; an `installed.json`
//! (`<data>/extractors/installed.json`, or `HEAT3D_EXTRACTORS`) may add or override
//! entries (a development setup, the tests). An entry may
//! name its own verbs (`convert`, `info`, `status`, `extract`, each an argument
//! list with `{input}`, `{out}`, `{maps}`, `{levels}`); the known extractors'
//! defaults are below. Tools that stay on this machine by design are never listed.

use std::path::{Path, PathBuf};

use serde::Serialize;
use serde_json::Value;

/// A converter or extractor the library can run.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Extractor {
    pub id: String,
    pub name: String,
    pub version: Option<String>,
    pub installed: bool,
    /// The program and its first arguments.
    #[serde(skip)]
    pub command: Vec<String>,
    #[serde(skip)]
    pub env: Vec<(String, String)>,
    pub games: Vec<String>,
    /// Replay formats it converts (`wrpl`, `dem`, ...).
    pub converts: Vec<String>,
    /// The converter names its outputs carry (`manifest.converter.name`).
    pub produces: Vec<String>,
    pub maps: bool,
    #[serde(skip)]
    pub convert: Vec<String>,
    #[serde(skip)]
    pub info: Vec<String>,
    #[serde(skip)]
    pub status: Vec<String>,
    #[serde(skip)]
    pub extract: Vec<String>,
}

/// The known extractors: (id, name, games, converts, produces, maps).
const KNOWN: &[(&str, &str, &[&str], &[&str], &[&str], bool)] = &[
    ("heat3d-warthunder", "War Thunder", &["warthunder"], &["wrpl"], &["heat3d-wt-replay"], true),
    ("heat3d-cs2", "Counter-Strike 2", &["cs2"], &["dem"], &["heat3d-cs2", "heat3d-cs2-demo", "cs2-demo"], true),
    ("heat3d-r6", "Rainbow Six Siege replays", &["r6"], &["rec"], &["heat3d-r6-replay", "heat3d-r6"], false),
    ("heat3d-r6-maps", "Rainbow Six Siege maps", &["r6"], &[], &[], true),
    ("heat3d-dota-replay", "Dota 2 replays", &["dota2"], &["dem"], &["heat3d-dota-replay"], false),
    ("heat3d-dota-maps", "Dota 2 map", &["dota2"], &[], &[], true),
    ("heat3d-wows", "World of Warships", &["wows"], &["wowsreplay"], &["heat3d-wows-replay", "heat3d-wows"], false),
    ("heat3d-wot", "World of Tanks", &["wot"], &["wotreplay"], &["heat3d-wot-replay", "heat3d-wot"], false),
    ("heat3d-squad", "Squad", &["squad"], &["ue-replay"], &["heat3d-squad-demo", "heat3d-squad"], false),
    ("heat3d-riot", "League of Legends and VALORANT", &["lol", "valorant"], &["rofl"], &["heat3d-riot"], false),
    ("heat3d-dcs", "DCS World", &["dcs"], &[], &[], true),
    ("heat3d-battlefield", "Battlefield", &["bf6", "bf4", "bf1"], &[], &[], true),
    ("heat3d-reforger", "Arma Reforger", &["reforger"], &[], &[], true),
    ("heat3d-forza", "Forza", &["forza"], &[], &[], true),
    ("heat3d-acrally", "Assetto Corsa Rally", &["acrally"], &[], &[], true),
    ("heat3d-beamng", "BeamNG.drive", &["beamng"], &[], &[], true),
    ("heat3d-il2", "IL-2 Sturmovik", &["il2"], &[], &[], true),
];

/// Tools that stay on this machine and are never offered.
pub fn local_only(id: &str) -> bool {
    let l = id.to_ascii_lowercase();
    l.contains("fetch")
}

fn strings(v: Option<&Value>) -> Vec<String> {
    v.and_then(Value::as_array).map(|a| a.iter().filter_map(|x| x.as_str().map(str::to_owned)).collect()).unwrap_or_default()
}

/// Where the manager keeps its list: `HEAT3D_EXTRACTORS` (a file or a folder), else `<data>/extractors/installed.json`.
pub fn installed_file(data_dir: &Path) -> PathBuf {
    match std::env::var_os("HEAT3D_EXTRACTORS").map(PathBuf::from) {
        Some(p) if p.is_dir() => p.join("installed.json"),
        Some(p) => p,
        None => data_dir.join("extractors").join("installed.json"),
    }
}

/// Every known extractor, installed or not, with what is installed filled in.
pub fn load(data_dir: &Path) -> Vec<Extractor> {
    let file = installed_file(data_dir);
    let doc: Value = std::fs::read(&file).ok().and_then(|b| serde_json::from_slice(&b).ok()).unwrap_or(Value::Null);
    let base = file.parent().map(Path::to_path_buf).unwrap_or_default();
    let mut out: Vec<Extractor> = KNOWN
        .iter()
        .map(|(id, name, games, converts, produces, maps)| Extractor {
            id: (*id).into(),
            name: (*name).into(),
            version: None,
            installed: false,
            command: Vec::new(),
            env: Vec::new(),
            games: games.iter().map(|s| s.to_string()).collect(),
            converts: converts.iter().map(|s| s.to_string()).collect(),
            produces: produces.iter().map(|s| s.to_string()).collect(),
            maps: *maps,
            convert: ["convert", "{input}", "-o", "{out}"].map(String::from).to_vec(),
            info: ["info", "--json", "{input}"].map(String::from).to_vec(),
            status: ["status", "--json"].map(String::from).to_vec(),
            extract: ["extract", "{maps}", "-o", "{levels}"].map(String::from).to_vec(),
        })
        .collect();
    // What the Extractors manager installed (native/crates/extractors, docs/extractors.md):
    // `<data>/extractors/<id>/current` names the version, `<data>/extractors/<id>/<version>/<id>/<id>[.exe]` is the program.
    for x in out.iter_mut() {
        let root = data_dir.join("extractors").join(&x.id);
        let Some(v) = std::fs::read_to_string(root.join("current")).ok().map(|v| v.trim().to_owned()).filter(|v| !v.is_empty()) else { continue };
        let exe = root.join(&v).join(&x.id).join(if cfg!(windows) { format!("{}.exe", x.id) } else { x.id.clone() });
        if exe.is_file() {
            x.installed = true;
            x.version = Some(v);
            x.command = vec![exe.to_string_lossy().into_owned()];
            x.env = vec![("HEAT3D_MANAGED".into(), "1".into())];
        }
    }
    // The readers that name their own `convert` in the list.
    let mut own_convert: Vec<String> = Vec::new();
    for e in doc.get("extractors").and_then(Value::as_array).into_iter().flatten() {
        let Some(id) = e.get("id").and_then(Value::as_str) else { continue };
        if local_only(id) {
            continue;
        }
        // The program: `command` (a list) or `exe` (a path, relative to installed.json).
        let mut command = strings(e.get("command"));
        if command.is_empty() {
            if let Some(exe) = e.get("exe").and_then(Value::as_str) {
                let p = Path::new(exe);
                command.push(if p.is_absolute() { exe.to_owned() } else { base.join(p).to_string_lossy().into_owned() });
            }
        }
        if command.is_empty() {
            continue;
        }
        let at = match out.iter().position(|x| x.id == id) {
            Some(i) => i,
            None => {
                out.push(Extractor {
                    id: id.into(),
                    name: e.get("name").and_then(Value::as_str).unwrap_or(id).into(),
                    version: None,
                    installed: false,
                    command: Vec::new(),
                    env: Vec::new(),
                    games: Vec::new(),
                    converts: Vec::new(),
                    produces: Vec::new(),
                    maps: false,
                    convert: ["convert", "{input}", "-o", "{out}"].map(String::from).to_vec(),
                    info: ["info", "--json", "{input}"].map(String::from).to_vec(),
                    status: ["status", "--json"].map(String::from).to_vec(),
                    extract: ["extract", "{maps}", "-o", "{levels}"].map(String::from).to_vec(),
                });
                out.len() - 1
            }
        };
        let x = &mut out[at];
        x.installed = true;
        x.command = command;
        x.version = e.get("version").and_then(Value::as_str).map(str::to_owned);
        if let Some(env) = e.get("env").and_then(Value::as_object) {
            x.env = env.iter().filter_map(|(k, v)| Some((k.clone(), v.as_str()?.to_owned()))).collect();
        }
        for (key, list) in [("games", &mut x.games), ("converts", &mut x.converts), ("produces", &mut x.produces)] {
            let v = strings(e.get(key));
            if !v.is_empty() {
                *list = v;
            }
        }
        if let Some(m) = e.get("maps").and_then(Value::as_bool) {
            x.maps = m;
        }
        if e.get("convert").is_some() {
            own_convert.push(x.id.clone());
        }
        for (key, verb) in [("convert", &mut x.convert), ("info", &mut x.info), ("status", &mut x.status), ("extract", &mut x.extract)] {
            match e.get(key) {
                Some(Value::Array(_)) => *verb = strings(e.get(key)),
                Some(Value::Bool(false)) | Some(Value::Null) => verb.clear(),
                _ => {}
            }
        }
    }
    // Every reader takes `convert <replay> -o <out>` since its window release; an
    // older install of these takes the replay without a verb.
    for x in out.iter_mut() {
        let Some((_, first)) = WITH_CONVERT.iter().find(|(id, _)| *id == x.id) else { continue };
        if own_convert.contains(&x.id) {
            continue;
        }
        if x.version.as_deref().is_some_and(|v| compare_versions(v, first) == std::cmp::Ordering::Less) {
            x.convert = ["{input}", "-o", "{out}"].map(String::from).to_vec();
        }
    }
    out.retain(|x| !local_only(&x.id));
    out
}

/// The replay readers that once took replays without a verb, and their first release with `convert`.
const WITH_CONVERT: &[(&str, &str)] = &[("heat3d-warthunder", "0.4.0"), ("heat3d-wows", "0.3.0"), ("heat3d-wot", "0.3.0"), ("heat3d-squad", "0.3.0"), ("heat3d-r6", "0.7.0")];

/// The extractor that converts `format` of `game`: installed ones first.
pub fn converter_for<'a>(all: &'a [Extractor], game: Option<&str>, format: &str) -> Option<&'a Extractor> {
    let fits = |x: &&Extractor| x.converts.iter().any(|f| f == format) && game.is_none_or(|g| x.games.is_empty() || x.games.iter().any(|y| y == g));
    all.iter().filter(fits).find(|x| x.installed).or_else(|| all.iter().find(fits))
}

/// Whether an output of `converter` at `version` is as new as what is installed:
/// `None` when no installed extractor makes that converter's output.
pub fn output_current(all: &[Extractor], converter: &str, version: Option<&str>) -> Option<bool> {
    let x = all.iter().find(|x| x.installed && x.produces.iter().any(|p| p == converter))?;
    let installed = x.version.as_deref()?;
    // An output that does not say its converter's version cannot be judged.
    let v = version?;
    Some(compare_versions(v, installed) != std::cmp::Ordering::Less)
}

/// Dotted versions compared number by number (`0.2.10` > `0.2.9`); a `v` prefix ignored.
pub fn compare_versions(a: &str, b: &str) -> std::cmp::Ordering {
    let parts = |s: &str| -> Vec<u64> { s.trim().trim_start_matches(['v', 'V']).split(['.', '-', '+']).map(|p| p.chars().take_while(char::is_ascii_digit).collect::<String>().parse().unwrap_or(0)).collect() };
    let (pa, pb) = (parts(a), parts(b));
    for i in 0..pa.len().max(pb.len()) {
        let (x, y) = (pa.get(i).copied().unwrap_or(0), pb.get(i).copied().unwrap_or(0));
        if x != y {
            return x.cmp(&y);
        }
    }
    std::cmp::Ordering::Equal
}

/// An argument list with its placeholders filled: `{maps}` expands to many.
pub fn fill(args: &[String], input: Option<&str>, out: Option<&str>, maps: &[String], levels: Option<&str>) -> Vec<String> {
    let mut v = Vec::new();
    for a in args {
        if a == "{maps}" {
            v.extend(maps.iter().cloned());
            continue;
        }
        v.push(a.replace("{input}", input.unwrap_or("")).replace("{out}", out.unwrap_or("")).replace("{levels}", levels.unwrap_or("")));
    }
    v
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cmp::Ordering;

    #[test]
    fn versions() {
        assert_eq!(compare_versions("0.2.10", "0.2.9"), Ordering::Greater);
        assert_eq!(compare_versions("v1.0", "1.0.0"), Ordering::Equal);
        assert_eq!(compare_versions("0.1.0", "0.2.4"), Ordering::Less);
    }

    #[test]
    fn installed_list_and_local_tools_left_out() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("extractors").join("installed.json");
        std::fs::create_dir_all(file.parent().unwrap()).unwrap();
        std::fs::write(
            &file,
            r#"{"extractors":[
                {"id":"heat3d-warthunder","version":"0.2.4","exe":"heat3d-warthunder/heat3d-warthunder.exe"},
                {"id":"heat3d-x-fetch","version":"1.0","exe":"x.exe"},
                {"id":"heat3d-new","name":"New","version":"0.1","command":["python","-m","x"],"converts":["foo"],"games":["newgame"],"convert":["{input}","--out","{out}"]}
            ]}"#,
        )
        .unwrap();
        let all = load(dir.path());
        assert!(all.iter().all(|x| !x.id.contains("fetch")));
        let wt = converter_for(&all, Some("warthunder"), "wrpl").unwrap();
        assert!(wt.installed);
        assert!(wt.command[0].ends_with("heat3d-warthunder.exe"));
        // CS2's demos: known, not installed.
        let cs = converter_for(&all, Some("cs2"), "dem").unwrap();
        assert_eq!((cs.id.as_str(), cs.installed), ("heat3d-cs2", false));
        let new = converter_for(&all, None, "foo").unwrap();
        assert_eq!(fill(&new.convert, Some("a.foo"), Some("out"), &[], None), vec!["a.foo", "--out", "out"]);
        assert_eq!(output_current(&all, "heat3d-wt-replay", Some("0.2.0")), Some(false));
        assert_eq!(output_current(&all, "heat3d-wt-replay", Some("0.2.4")), Some(true));
        assert_eq!(output_current(&all, "acmi-to-parquet", Some("0.1.0")), None);
        // An old War Thunder reader takes the replay without a verb; one not installed gets `convert`.
        assert_eq!(fill(&wt.convert, Some("r.wrpl"), Some("out"), &[], None), vec!["r.wrpl", "-o", "out"]);
        let wows = all.iter().find(|x| x.id == "heat3d-wows").unwrap();
        assert_eq!(fill(&wows.convert, Some("r.wowsreplay"), Some("out"), &[], None), vec!["convert", "r.wowsreplay", "-o", "out"]);
    }

    #[test]
    fn readers_from_their_window_release_take_convert() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("extractors").join("installed.json");
        std::fs::create_dir_all(file.parent().unwrap()).unwrap();
        std::fs::write(
            &file,
            r#"{"extractors":[
                {"id":"heat3d-warthunder","version":"0.4.0","exe":"wt.exe"},
                {"id":"heat3d-r6","version":"v0.6.0","exe":"r6.exe"},
                {"id":"heat3d-squad","version":"0.2.0","exe":"sq.exe","convert":["convert","{input}","-o","{out}"]}
            ]}"#,
        )
        .unwrap();
        let all = load(dir.path());
        let verb = |id: &str| all.iter().find(|x| x.id == id).unwrap().convert.first().cloned().unwrap_or_default();
        assert_eq!(verb("heat3d-warthunder"), "convert");
        assert_eq!(verb("heat3d-r6"), "{input}");
        assert_eq!(verb("heat3d-squad"), "convert");
    }
}
