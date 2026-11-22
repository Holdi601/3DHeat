//! A synthetic library for the UI smoke test and screenshots (never real data):
//!
//!   library-demo <dir> [--table FILE.parquet] [--matches N]
//!
//! writes `<dir>/files` (matches of several made-up games and maps with heat
//! pictures, Tacview recordings, demos, replays to convert), `<dir>/data/levels`
//! (levels with map pictures) and `<dir>/data/extractors/installed.json`
//! naming the stand-in converter beside this program.

use std::path::{Path, PathBuf};

use heat3d_library::testkit;

fn write(p: &Path, b: &[u8]) {
    std::fs::create_dir_all(p.parent().unwrap()).unwrap();
    std::fs::write(p, b).unwrap();
}

/// A summary with a heat grid of its own shape: a few hot spots around a route.
fn summary(seed: u64, players: usize, winner: &str, duration: f64) -> String {
    let mut r = seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
    let mut next = || {
        r ^= r << 13;
        r ^= r >> 7;
        r ^= r << 17;
        (r % 10_000) as f64 / 10_000.0
    };
    let spots: Vec<(f64, f64, f64)> = (0..5).map(|_| (next() * 60.0 - 30.0, next() * 40.0 - 20.0, 2.0 + next() * 6.0)).collect();
    let (mut ix, mut iz, mut p) = (Vec::new(), Vec::new(), Vec::new());
    for x in -36i32..36 {
        for z in -24i32..24 {
            let mut v = 0.0;
            for (sx, sz, w) in &spots {
                let d2 = (x as f64 - sx).powi(2) + (z as f64 - sz).powi(2);
                v += 40.0 * (-d2 / (2.0 * w * w)).exp();
            }
            if v > 0.6 {
                ix.push(x);
                iz.push(z);
                p.push((v * 10.0).round() / 10.0);
            }
        }
    }
    let names: Vec<String> = (0..players).map(|i| format!("{{\"name\":\"Player {}\"}}", (seed as usize * 7 + i * 13) % 97)).collect();
    format!(
        r#"{{"format":"3dheat-summary","version":2,"duration":{duration},"players":{players},"teams":[{{"name":"Blue"}},{{"name":"Red"}}],"winner":"{winner}","playerStats":[{}],"grid":{{"cell":50,"ix":{ix:?},"iz":{iz:?},"p":{p:?}}}}}"#,
        names.join(",")
    )
}

fn container(game: &str, map: &str, stem: &str, version: &str, started: &str, summary: &str, table: Option<&[u8]>) -> Vec<u8> {
    let mut members = vec![format!(r#"{{"name":"{stem}.summary.json","role":"summary"}}"#)];
    let mut roles = format!(r#""summary":"{stem}.summary.json""#);
    if table.is_some() {
        members.insert(0, format!(r#"{{"name":"{stem}.parquet","role":"table","compression":"stored"}}"#));
        roles = format!(r#""table":"{stem}.parquet",{roles}"#);
    }
    let manifest = format!(
        r#"{{"format":"3dheat","format_version":"1.0","game":"{game}","source":"demo","converter":{{"name":"fake-converter","version":"{version}"}},"match":"{stem}","map":"{map}","mode":"Demo","started":"{started}","roles":{{{roles}}},"members":[{}]}}"#,
        members.join(",")
    );
    let sname = format!("{stem}.summary.json");
    let tname = format!("{stem}.parquet");
    let mut parts: Vec<(&str, &[u8])> = vec![("manifest.json", manifest.as_bytes())];
    if let Some(t) = table {
        parts.push((&tname, t));
    }
    parts.push((&sname, summary.as_bytes()));
    testkit::zip(&parts, false)
}

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let dir = PathBuf::from(args.first().expect("library-demo <dir> [--table FILE] [--matches N]"));
    let table = args.iter().position(|a| a == "--table").and_then(|i| args.get(i + 1)).map(|p| std::fs::read(p).expect("the table"));
    let n: usize = args.iter().position(|a| a == "--matches").and_then(|i| args.get(i + 1)).and_then(|v| v.parse().ok()).unwrap_or(36);
    let files = dir.join("files");
    let data = dir.join("data");
    let games = [("warthunder", ["forest_valley", "desert_town", "harbour_bay"]), ("cs2", ["de_alpha", "de_bravo", "de_charlie"]), ("dcs", ["Caucasus", "Syria", "Nevada"])];
    for i in 0..n {
        let (game, maps) = games[i % 3];
        let map = maps[(i / 3) % 3];
        let stem = format!("{map}_match_{i:03}");
        let day = 1 + (i % 28);
        let started = format!("2026-{:02}-{day:02}T{:02}:{:02}:00Z", 1 + (i / 28) % 12, 10 + i % 12, (i * 7) % 60);
        let s = summary(i as u64 + 1, 6 + (i * 5) % 20, if i % 3 == 0 { "Red" } else { "Blue" }, 600.0 + (i * 97 % 1800) as f64);
        let version = if i % 5 == 0 { "0.0.9" } else { "0.1.0" };
        let with_table = table.as_deref().filter(|_| i % 4 == 0);
        write(&files.join(game).join(map).join(format!("{stem}.3dheat")), &container(game, map, &stem, version, &started, &s, with_table));
    }
    // Recordings and demos.
    for (i, (lat, lon)) in [(42.0, 42.0), (34.5, 36.0), (36.2, -115.0)].iter().enumerate() {
        write(&files.join("tacview").join(format!("Tacview-2026030{}-1{i}0000-DCS-Demo.txt.acmi", i + 1)), testkit::acmi(*lat, *lon, 120 + i * 40).as_bytes());
    }
    for (i, m) in ["de_alpha", "de_bravo"].iter().enumerate() {
        write(&files.join("demos").join(format!("team-a-vs-team-b-m{}-{m}.dem", i + 1)), &testkit::dem(m, "csgo", 2100.0 + i as f32 * 300.0));
    }
    // Replays only their converter reads; one fails, one needs Oodle.
    for name in ["#2026.04.01 20.15.00.wrpl", "#2026.04.02 21.30.00.wrpl", "#2026.04.03 19.05.00.wrpl", "bad.wrpl", "oodle.wrpl"] {
        write(&files.join("replays").join(name), format!("demo replay {name}").as_bytes());
    }
    // Levels with their pictures.
    for (k, map) in games[0].1.iter().enumerate() {
        let d = data.join("levels").join("warthunder").join(map);
        write(&d.join(format!("{map}.glb")), format!("glTF {map}").as_bytes());
        write(&d.join(format!("{map}_map.png")), &testkit::png(256 + k as u32 * 8, 256 + k as u32 * 8));
        write(
            &d.join(format!("{map}.json")),
            format!(r#"{{"tool":"demo-level 1.0","maps":[{{"kind":"map","file":"{map}_map.png","gameRect":{{"x0":-1800,"z0":-1200,"x1":1800,"z1":1200}}}}]}}"#).as_bytes(),
        );
    }
    let exe = std::env::current_exe().unwrap().with_file_name(if cfg!(windows) { "fake-converter.exe" } else { "fake-converter" });
    write(
        &data.join("extractors").join("installed.json"),
        format!(
            r#"{{"extractors":[{{"id":"heat3d-warthunder","name":"War Thunder","version":"0.1.0","command":[{:?}],"produces":["fake-converter"]}}]}}"#,
            exe.to_string_lossy()
        )
        .as_bytes(),
    );
    println!("{}", dir.display());
}
