//! A stand-in extractor for the manager's tests: answers the contract's
//! command line (`--version`, `--check --json`, `status --json`, `extract`)
//! and, started without arguments, notes in the levels folder that it ran and
//! how, then stays open a few seconds as a window would. Its id is its file
//! name, its version the folder the manager installed it in.
//!
//! Its "game install" is `<levels>/.fake-install.txt`, one map id a line (a
//! test adds a line to make a new map appear); what it extracted is in the
//! manifest `<levels>/fakegame/.heat3d-extract.json`. A map named `broken`
//! fails to extract.

use std::path::{Path, PathBuf};

use serde_json::{json, Value};

fn manifest_path(levels: &Path) -> PathBuf {
    levels.join("fakegame").join(".heat3d-extract.json")
}

fn manifest(levels: &Path) -> Value {
    std::fs::read_to_string(manifest_path(levels)).ok().and_then(|t| serde_json::from_str(&t).ok()).unwrap_or_else(|| json!({ "schema": 1, "entries": {} }))
}

fn install(levels: &Path) -> Option<Vec<String>> {
    let t = std::fs::read_to_string(levels.join(".fake-install.txt")).ok()?;
    Some(t.lines().map(str::trim).filter(|l| !l.is_empty()).map(String::from).collect())
}

/// Each map's state, as the contract defines them.
fn maps(levels: &Path, version: &str) -> Vec<(String, &'static str, Option<String>)> {
    let m = manifest(levels);
    let entries = m["entries"].as_object().cloned().unwrap_or_default();
    let have = install(levels).unwrap_or_default();
    let mut out: Vec<_> = have
        .iter()
        .map(|id| match entries.get(id).and_then(|e| e["extractor_version"].as_str()) {
            None => (id.clone(), "new", None),
            Some(v) if v == version => (id.clone(), "current", Some(v.to_string())),
            Some(v) => (id.clone(), "outdated", Some(v.to_string())),
        })
        .collect();
    for (id, e) in &entries {
        if !have.contains(id) {
            out.push((id.clone(), "missing", e["extractor_version"].as_str().map(String::from)));
        }
    }
    out
}

fn main() {
    let exe = std::env::current_exe().unwrap();
    let id = exe.file_stem().unwrap().to_string_lossy().to_string();
    let version = exe.parent().and_then(|p| p.parent()).and_then(|p| p.file_name()).map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
    let levels_s = std::env::var("HEAT3D_LEVELS").unwrap_or_default();
    let levels = Path::new(&levels_s);
    let managed = std::env::var("HEAT3D_MANAGED").as_deref() == Ok("1");
    let args: Vec<String> = std::env::args().skip(1).collect();
    match args.iter().map(String::as_str).collect::<Vec<_>>().as_slice() {
        ["--version"] => println!("{id} {version}"),
        ["--check", "--json"] => println!(
            "{}",
            json!({
                "id": id, "version": version, "levels": levels_s,
                "checks": [
                    { "id": "managed", "label": "Started by the panel", "ok": managed, "detail": "" },
                    { "id": "game", "label": "Game install found", "ok": false, "detail": "no game on a test machine" },
                    { "id": "disk", "label": "Free disk space", "ok": true, "detail": "enough" }
                ]
            })
        ),
        ["status", "--json"] => {
            let maps = maps(levels, &version);
            let count = |s: &str| maps.iter().filter(|m| m.1 == s).count();
            let list: Vec<Value> = maps.iter().map(|(m, s, v)| json!({ "id": m, "title": format!("Map {m}"), "state": s, "extracted_version": v })).collect();
            println!(
                "{}",
                json!({ "id": id, "version": version, "levels": levels_s, "games": [{
                    "game": "fakegame", "label": "Fake game", "found": install(levels).is_some(), "build": null, "maps": list,
                    "counts": { "new": count("new"), "changed": count("changed"), "outdated": count("outdated"), "current": count("current"), "missing": count("missing") }
                }]})
            );
        }
        ["extract", rest @ ..] => {
            let flag = |f: &str| rest.contains(&f);
            let named: Vec<String> = rest.iter().filter(|a| !a.starts_with("--") && **a != "fakegame").map(|a| a.to_string()).collect();
            let chosen: Vec<String> = maps(levels, &version)
                .into_iter()
                .filter(|(m, s, _)| {
                    named.contains(m) || (flag("--new") && *s == "new") || (flag("--outdated") && *s == "outdated") || (flag("--all") && *s != "missing")
                })
                .map(|(m, _, _)| m)
                .collect();
            println!("{}", json!({ "event": "start", "total": chosen.len() }));
            let mut man = manifest(levels);
            let (mut ok, mut bad) = (0, 0);
            for (i, m) in chosen.iter().enumerate() {
                std::thread::sleep(std::time::Duration::from_millis(300));
                if m == "broken" {
                    bad += 1;
                    println!("{}", json!({ "event": "map", "index": i + 1, "id": m, "state": "failed", "detail": "unreadable" }));
                    continue;
                }
                std::fs::create_dir_all(levels.join("fakegame")).unwrap();
                std::fs::write(levels.join("fakegame").join(format!("{m}.glb")), b"glTF").unwrap();
                man["entries"][m] = json!({ "extractor_version": version, "outputs": [format!("fakegame/{m}.glb")] });
                std::fs::write(manifest_path(levels), man.to_string()).unwrap();
                ok += 1;
                println!("{}", json!({ "event": "map", "index": i + 1, "id": m, "state": "ok", "detail": "" }));
            }
            println!("{}", json!({ "event": "done", "ok": ok, "failed": bad }));
        }
        [] => {
            std::fs::create_dir_all(levels).unwrap();
            std::fs::write(levels.join(format!("ran-{id}.txt")), format!("{version} managed={managed}")).unwrap();
            std::thread::sleep(std::time::Duration::from_secs(3));
        }
        _ => std::process::exit(2),
    }
}
