//! The library end to end on a synthetic folder: scanning, the metadata of
//! every open format, thumbnails, duplicates, missing files, the conversion
//! queue with a stand-in converter (`src/bin/fake-converter.rs`), outdated
//! outputs, map status and extraction, and the JSON interface.

use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{Duration, Instant};

use heat3d_library::api::{self, Body};
use heat3d_library::db::{self, Filter};
use heat3d_library::{jobs, scan, testkit, Library, Settings};
use serde_json::{json, Value};

fn write(p: &Path, b: &[u8]) {
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, b).unwrap();
}

/// The synthetic library: files of every kind, a levels folder, and the stand-in converter installed.
fn setup(t: &Path, version: &str) -> (PathBuf, PathBuf) {
    let files = t.join("files");
    let data = t.join("data");
    write(&files.join("a/match1.3dheat"), &testkit::container("warthunder", "fake_map", "match1", "fake-converter", "0.1.0"));
    write(&files.join("a/copy/match1.3dheat"), &testkit::container("warthunder", "fake_map", "match1", "fake-converter", "0.1.0"));
    write(&files.join("a/match1.events.parquet"), b"PAR1");
    write(&files.join("a/notes.json"), b"{}");
    write(&files.join("b/Tacview-20260101-120000-DCS-Test.txt.acmi"), testkit::acmi(42.0, 42.0, 22).as_bytes());
    let text = testkit::acmi(36.0, -115.0, 10);
    write(&files.join("b/zipped.zip.acmi"), &testkit::zip(&[("zipped.txt.acmi", text.as_bytes())], true));
    write(&files.join("c/de_test.dem"), &testkit::dem("de_test", "csgo", 1800.5));
    write(&files.join("d/#2026.01.02 10.00.00.wrpl"), b"a replay only its converter reads");
    write(&files.join("d/bad.wrpl"), b"broken");
    write(&files.join("d/oodle.wrpl"), b"needs oodle");
    write(&files.join("d/slow.wrpl"), b"slow");
    write(&files.join("e/session1/meta.json"), br#"{"game":"forza","track":"Test track","started":1767225600,"seconds":321.5,"watcher":"0.9.0"}"#);
    write(&files.join("e/session1/events.jsonl"), b"{}\n");
    write(&files.join("e/session1/heat.parquet"), b"PAR1");
    let levels = data.join("levels");
    write(&levels.join("warthunder/fake_map/fake_map.glb"), b"glTF");
    write(&levels.join("warthunder/fake_map/fake_map_map.png"), &testkit::png(64, 64));
    write(
        &levels.join("warthunder/fake_map/fake_map.json"),
        br#"{"format":"x","tool":"fake-level 1.0","maps":[{"kind":"map","file":"fake_map_map.png","gameRect":{"x0":-200,"z0":-400,"x1":800,"z1":600}}]}"#,
    );
    // A DCS level is one region of its theatre; recordings name the theatre.
    write(&levels.join("dcs/Caucasus/r1/Caucasus_r1.glb"), b"glTF dcs");
    write(&levels.join("dcs/Caucasus/r1/Caucasus_r1.json"), br#"{"tool":"heat3d_ext_dcs","theatre":"Caucasus","level":"Caucasus_r1"}"#);
    let exe = env!("CARGO_BIN_EXE_fake-converter");
    write(
        &data.join("extractors/installed.json"),
        json!({ "extractors": [
            { "id": "heat3d-warthunder", "version": version, "command": [exe], "produces": ["fake-converter"] },
            { "id": "heat3d-x-fetch", "version": "1.0", "command": [exe] }
        ]})
        .to_string()
        .as_bytes(),
    );
    (files, data)
}

fn find(lib: &Library, name: &str) -> i64 {
    lib.reader().unwrap().query_row("SELECT id FROM items WHERE name = ?1 ORDER BY id LIMIT 1", [name], |r| r.get(0)).unwrap_or_else(|_| panic!("{name} not in the catalogue"))
}

fn detail(lib: &Library, id: i64) -> Value {
    db::detail(&lib.reader().unwrap(), id).unwrap().unwrap()
}

fn call(lib: &Arc<Library>, method: &str, path: &str, query: &str, body: Value) -> (u16, Value) {
    let a = api::handle(lib, method, path, query, body.to_string().as_bytes());
    match a.body {
        Body::Json(v) => (a.status, v),
        Body::Bytes(b, ct) => (a.status, json!({ "bytes": b.len(), "type": ct })),
        Body::File(p, n) => (a.status, json!({ "file": p, "name": n })),
    }
}

fn wait_jobs(lib: &Library) {
    let t = Instant::now();
    loop {
        let busy: i64 = lib.reader().unwrap().query_row("SELECT count(*) FROM jobs WHERE state IN ('queued', 'running')", [], |r| r.get(0)).unwrap();
        if busy == 0 {
            return;
        }
        assert!(t.elapsed() < Duration::from_secs(60), "jobs did not finish");
        std::thread::sleep(Duration::from_millis(100));
    }
}

#[test]
fn scans_reads_converts_and_extracts() {
    let tmp = tempfile::tempdir().unwrap();
    let (files, data) = setup(tmp.path(), "0.1.0");
    let lib = Library::start(&data).unwrap();
    lib.set_settings(Settings { output_dir: tmp.path().join("converted"), library_dir: tmp.path().join("library"), levels_dir: Some(data.join("levels")), max_jobs: 2, ..Default::default() }).unwrap();

    // Levels first, then the files.
    let lv = lib.add_root(&data.join("levels"), true).unwrap();
    let root = lib.add_root(&files, true).unwrap();
    // The background scanner may have started on them already; scanning again is harmless.
    lib.scan_now(lv).unwrap();
    let s = lib.scan_now(root).unwrap();
    assert_eq!(s.files, 10, "{s:?}");
    let errs: Vec<(String, String)> = { let c = lib.reader().unwrap(); let mut st = c.prepare("SELECT name, error FROM items WHERE error IS NOT NULL").unwrap(); let v = st.query_map([], |r| Ok((r.get(0)?, r.get(1)?))).unwrap().map(|r| r.unwrap()).collect(); v };
    assert_eq!(s.errors, 0, "{errs:?}");

    // A container: its manifest and summary, with a thumbnail on the level's map.
    let m = detail(&lib, find(&lib, "match1.3dheat"));
    assert_eq!((m["game"].as_str(), m["map"].as_str(), m["players"].as_i64(), m["outcome"].as_str()), (Some("warthunder"), Some("fake_map"), Some(2), Some("A")));
    assert_eq!(m["converterVersion"], "0.1.0");
    assert_eq!(m["thumb"], true);
    assert_eq!(m["playerNames"], json!(["Ann", "Ben"]));
    assert_eq!(m["level"]["name"], "fake_map.glb");
    assert_eq!(m["copies"].as_array().unwrap().len(), 1);
    // A Valve demo: its header and file info.
    let d = detail(&lib, find(&lib, "de_test.dem"));
    assert_eq!((d["game"].as_str(), d["map"].as_str(), d["gameVersion"].as_str()), (Some("cs2"), Some("de_test"), Some("build 1234")));
    assert!((d["duration"].as_f64().unwrap() - 1800.5).abs() < 0.01);
    // A replay only its converter reads: the date from its name.
    let w = detail(&lib, find(&lib, "#2026.01.02 10.00.00.wrpl"));
    assert_eq!(w["game"], "warthunder");
    assert_eq!(w["started"], (heat3d_library::meta::days_from_civil(2026, 1, 2) * 86_400 + 36_000) * 1000);
    assert_eq!(w["conv"], "none");
    // A Watcher session, and a level with its picture.
    let se = detail(&lib, find(&lib, "session1"));
    assert_eq!((se["kind"].as_str(), se["game"].as_str(), se["map"].as_str()), (Some("session"), Some("forza"), Some("Test track")));
    let l = detail(&lib, find(&lib, "fake_map.glb"));
    assert_eq!((l["kind"].as_str(), l["game"].as_str(), l["thumb"].as_bool()), (Some("level"), Some("warthunder"), Some(true)));

    // An ACMI recording: the header at once, the rest in the deep pass.
    let a = find(&lib, "Tacview-20260101-120000-DCS-Test.txt.acmi");
    let ad = detail(&lib, a);
    assert_eq!((ad["game"].as_str(), ad["map"].as_str(), ad["title"].as_str()), (Some("dcs"), Some("Caucasus"), Some("Test mission")));
    assert_eq!(ad["level"]["name"].as_str(), Some("Caucasus_r1.glb"), "{}", ad["level"]);
    while scan::deep_round(&lib, 64).unwrap() > 0 {}
    let ad = detail(&lib, a);
    assert_eq!(ad["extra"]["pilots"], 3);
    assert_eq!(ad["playerNames"], json!(["Bandit", "Viper 1", "Viper 2"]));
    assert!((ad["duration"].as_f64().unwrap() - 10.5).abs() < 1e-9);
    assert_eq!(ad["thumb"], true);
    assert!(ad["sha256"].as_str().is_some_and(|s| s.len() == 64));
    let z = detail(&lib, find(&lib, "zipped.zip.acmi"));
    assert_eq!((z["map"].as_str(), z["extra"]["pilots"].as_i64()), (Some("Nevada"), Some(3)));

    // Filters, facets, search.
    let c = lib.reader().unwrap();
    let (n, _) = db::list(&c, &Filter { game: vec!["warthunder".into()], kind: vec!["replay".into()], ..Default::default() }, "name", false, 0, 50).unwrap();
    assert_eq!(n, 4);
    assert_eq!(db::list(&c, &Filter { player: vec!["Bandit".into()], ..Default::default() }, "name", false, 0, 50).unwrap().0, 2);
    assert_eq!(db::list(&c, &Filter { q: "viper".into(), ..Default::default() }, "name", false, 0, 50).unwrap().0, 2);
    assert_eq!(db::list(&c, &Filter { dupes: Some(true), ..Default::default() }, "name", false, 0, 50).unwrap().0, 2);
    let f = db::facets(&c, &Filter::default()).unwrap();
    assert!(f["game"].as_array().unwrap().len() >= 4);
    drop(c);

    // Unchanged files are not read again; a deleted one is missing, its rating kept.
    let id = find(&lib, "de_test.dem");
    db::edit(&mut lib.writer().unwrap(), &db::Edit { ids: vec![id], rating: Some(5), ..Default::default() }).unwrap();
    std::fs::remove_file(files.join("c/de_test.dem")).unwrap();
    let s = lib.scan_now(root).unwrap();
    assert_eq!((s.changed, s.missing), (0, 1), "{s:?}");
    let d = detail(&lib, id);
    assert_eq!((d["missing"].as_bool(), d["rating"].as_i64()), (Some(true), Some(5)));

    // An offline folder: nothing under it changes.
    let gone = lib.add_root(&tmp.path().join("nowhere"), true);
    assert!(gone.is_ok());
    let s = lib.scan_now(gone.unwrap()).unwrap();
    assert!(s.offline);

    // Conversion: one good, one failing, one needing Oodle; outputs under converted\<game>.
    let good = find(&lib, "#2026.01.02 10.00.00.wrpl");
    let bad = find(&lib, "bad.wrpl");
    let oodle = find(&lib, "oodle.wrpl");
    let r = jobs::queue_convert(&lib, &[good, bad, oodle], false).unwrap();
    assert_eq!(r["queued"], 3, "{r}");
    // Queued twice: skipped.
    let r2 = jobs::queue_convert(&lib, &[good], false).unwrap();
    assert!(r2["queued"] == 0 || r2["skipped"].as_array().unwrap().is_empty() == false);
    wait_jobs(&lib);
    let out = tmp.path().join("converted/warthunder/fake_map/#2026.01.02 10.00.00.3dheat");
    assert!(out.is_file(), "the output is where it belongs");
    assert!(!tmp.path().join("converted/warthunder/.staging").exists());
    let g = detail(&lib, good);
    assert_eq!(g["conv"], "current", "{g}");
    assert_eq!(g["outputs"].as_array().unwrap().len(), 1);
    let b = detail(&lib, bad);
    assert_eq!((b["conv"].as_str(), b["jobs"][0]["state"].as_str()), (Some("failed"), Some("failed")));
    assert!(b["jobs"][0]["message"].as_str().unwrap().contains("not a replay"), "{}", b["jobs"][0]);
    let o = detail(&lib, oodle);
    assert_eq!(o["jobs"][0]["hint"], "oodle");
    // Retry runs it again (and it fails again, with its log kept).
    let job = o["jobs"][0]["id"].as_i64().unwrap();
    jobs::retry(&lib, job).unwrap();
    wait_jobs(&lib);
    assert!(jobs::job_log(&lib, job).unwrap().unwrap().contains("Oodle"));

    // Cancel a running job.
    let slow = find(&lib, "slow.wrpl");
    jobs::queue_convert(&lib, &[slow], false).unwrap();
    let t = Instant::now();
    let sid = loop {
        let r: Option<(i64, String)> = lib.reader().unwrap().query_row("SELECT id, state FROM jobs WHERE item = ?1 ORDER BY id DESC LIMIT 1", [slow], |r| Ok((r.get(0)?, r.get(1)?))).ok();
        if let Some((id, s)) = r {
            if s == "running" {
                break id;
            }
        }
        assert!(t.elapsed() < Duration::from_secs(20));
        std::thread::sleep(Duration::from_millis(50));
    };
    jobs::cancel(&lib, sid).unwrap();
    wait_jobs(&lib);
    assert!(t.elapsed() < Duration::from_secs(25), "cancel ended the converter");
    let st: String = lib.reader().unwrap().query_row("SELECT state FROM jobs WHERE id = ?1", [sid], |r| r.get(0)).unwrap();
    assert_eq!(st, "cancelled");

    // A demo with no converter installed: the job says which one to install.
    write(&files.join("c/de_two.dem"), &testkit::dem("de_two", "csgo", 60.0));
    lib.scan_now(root).unwrap();
    let two = find(&lib, "de_two.dem");
    jobs::queue_convert(&lib, &[two], false).unwrap();
    wait_jobs(&lib);
    let t2 = detail(&lib, two);
    assert_eq!(t2["jobs"][0]["hint"], "install:heat3d-cs2", "{}", t2["jobs"][0]);

    // A newer converter: the outputs made with the old one are outdated, and so are their replays.
    setup(tmp.path(), "9.9.9");
    lib.reload_extractors().unwrap();
    assert_eq!(detail(&lib, good)["conv"], "outdated");
    assert_eq!(detail(&lib, find(&lib, "match1.3dheat"))["conv"], "outdated");
    // Tools that stay local are never listed.
    assert!(lib.extractors().iter().all(|x| !x.id.contains("fetch")));

    // Map status and extraction of the new and changed maps.
    let x = lib.extractors().into_iter().find(|x| x.id == "heat3d-warthunder").unwrap();
    jobs::map_status(&lib, &x).unwrap();
    let (_, lv) = call(&lib, "GET", "levels", "", Value::Null);
    let e = lv["extractors"].as_array().unwrap().iter().find(|e| e["id"] == "heat3d-warthunder").unwrap().clone();
    assert_eq!((e["new"].as_i64(), e["changed"].as_i64()), (Some(1), Some(1)), "{e}");
    let (_, r) = call(&lib, "POST", "extract", "", json!({ "extractor": "heat3d-warthunder", "game": "warthunder" }));
    assert!(r["job"].as_i64().is_some(), "{r}");
    wait_jobs(&lib);
    assert!(data.join("levels/warthunder/m_new.glb").is_file());
    assert!(data.join("levels/warthunder/m_changed.glb").is_file());
    assert!(!data.join("levels/warthunder/m_ok.glb").exists());

    // The JSON interface.
    let (st, v) = call(&lib, "GET", "items", "game=warthunder&kind=match&sort=name&desc=0", Value::Null);
    assert_eq!(st, 200);
    assert_eq!(v["total"], 3, "{v}");
    let (_, v) = call(&lib, "GET", &format!("thumb/{}/{}", lib.thumb_token, find(&lib, "match1.3dheat")), "", Value::Null);
    assert_eq!(v["type"], "image/png");
    let (st, _) = call(&lib, "GET", &format!("thumb/wrong/{}", find(&lib, "match1.3dheat")), "", Value::Null);
    assert_eq!(st, 404);
    let (_, v) = call(&lib, "POST", "open", "", json!({ "ids": [good, find(&lib, "session1")] }));
    // The replay opens as its converted match; the session as its table.
    let names: Vec<&str> = v["files"].as_array().unwrap().iter().map(|f| f["name"].as_str().unwrap()).collect();
    assert!(names.contains(&"#2026.01.02 10.00.00.3dheat") && names.contains(&"session1.parquet"), "{v}");
    let (_, v) = call(&lib, "POST", "collections", "", json!({ "name": "Best", "ids": [good] }));
    let cid = v["id"].as_i64().unwrap();
    let (_, v) = call(&lib, "GET", "items", &format!("collection={cid}"), Value::Null);
    assert_eq!(v["total"], 1);
    let (_, v) = call(&lib, "POST", "collections", "", json!({ "name": "War Thunder replays", "smart": { "game": ["warthunder"], "kind": ["replay"] } }));
    let smart = v["id"].as_i64().unwrap();
    let (_, v) = call(&lib, "GET", "collections", "", Value::Null);
    assert_eq!(v.as_array().unwrap().iter().find(|c| c["id"] == smart).unwrap()["count"], 4);
    let (_, v) = call(&lib, "POST", "edit", "", json!({ "ids": [good], "addTags": ["ace"], "flag": 1 }));
    assert_eq!(v["changed"], 1);
    let (_, v) = call(&lib, "GET", "facets", "tag=ace", Value::Null);
    assert_eq!(v["totals"]["items"], 1);
    let (_, v) = call(&lib, "GET", "duplicates", "", Value::Null);
    assert_eq!(v["groups"].as_array().unwrap().len(), 1);
    let (st, _) = call(&lib, "GET", "nothing/here", "", Value::Null);
    assert_eq!(st, 404);

    // Move into the library folder: the file and the catalogue follow.
    let (_, v) = call(&lib, "POST", "move", "", json!({ "ids": [find(&lib, "zipped.zip.acmi")] }));
    assert_eq!(v["moved"], 1, "{v}");
    assert!(tmp.path().join("library/dcs/zipped.zip.acmi").is_file());
    assert!(!files.join("b/zipped.zip.acmi").exists());
    lib.jobs.shutdown();
}

#[test]
fn a_hundred_thousand_items_answer_fast() {
    // The catalogue at the size the library is built for, filled directly.
    let tmp = tempfile::tempdir().unwrap();
    let lib = Library::open(tmp.path()).unwrap();
    let games = ["warthunder", "cs2", "dcs", "r6", "wows", "dota2"];
    let mut batch = Vec::new();
    for i in 0..100_000i64 {
        batch.push(db::Scanned {
            path: format!("D:/lib/{}/{i}.3dheat", games[(i % 6) as usize]),
            root: None,
            kind: if i % 3 == 0 { "replay" } else { "match" },
            format: "3dheat",
            name: format!("{i}.3dheat"),
            size: 1000 + i,
            mtime: i,
            qhash: Some(format!("{:x}", i % 99_000)),
            sha256: None,
            meta: heat3d_library::meta::Meta {
                game: Some(games[(i % 6) as usize].into()),
                map: Some(format!("map_{}", i % 150)),
                mode: Some(["RB", "AB", "SB"][(i % 3) as usize].into()),
                started: Some(1_700_000_000_000 + i * 60_000),
                duration: Some(600.0),
                players: Some(10 + i % 20),
                player_names: vec![format!("player{}", i % 5000), format!("player{}", (i * 7) % 5000)],
                outcome: Some(["A", "B"][(i % 2) as usize].into()),
                title: Some(format!("match {i}")),
                ..Default::default()
            },
            thumb: None,
            error: None,
        });
        if batch.len() == 5000 {
            db::upsert(&mut lib.writer().unwrap(), &batch).unwrap();
            batch.clear();
        }
    }
    let c = lib.reader().unwrap();
    let t = Instant::now();
    let f = Filter { game: vec!["cs2".into()], mode: vec!["AB".into()], ..Default::default() };
    let (n, rows) = db::list(&c, &f, "started", true, 0, 200).unwrap();
    let list_ms = t.elapsed().as_millis();
    assert!(n > 0 && rows.len() == 200);
    let t = Instant::now();
    db::facets(&c, &f).unwrap();
    let facet_ms = t.elapsed().as_millis();
    let t = Instant::now();
    let (n, _) = db::list(&c, &Filter { q: "player42".into(), ..Default::default() }, "started", true, 0, 200).unwrap();
    let search_ms = t.elapsed().as_millis();
    assert!(n > 0);
    let t = Instant::now();
    let (n, _) = db::list(&c, &Filter { dupes: Some(true), ..Default::default() }, "started", true, 0, 200).unwrap();
    let dupes_ms = t.elapsed().as_millis();
    assert_eq!(n, 2000);
    println!("100k items: list {list_ms} ms, facets {facet_ms} ms, search {search_ms} ms, duplicates {dupes_ms} ms");
    // Debug builds on a shared machine: generous; release answers in a fraction.
    assert!(list_ms < 2000 && facet_ms < 8000 && search_ms < 2000 && dupes_ms < 4000);
}
