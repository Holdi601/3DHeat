//! A stand-in converter for the library's tests (never shipped): speaks the
//! extractor contract's verbs on made-up files.
//!
//!   fake-converter convert <input> -o <out>   writes <out>/<map>/<stem>.3dheat, prints progress
//!   fake-converter status --json              three maps: new, changed, current
//!   fake-converter extract <maps>... -o <dir> writes <dir>/<map>.glb
//!
//! An input whose name holds `bad` fails; `oodle` fails asking for Oodle; `slow` takes 30 s.

use std::io::Write;

use heat3d_library::testkit::container;

fn main() {
    let mut args: Vec<String> = std::env::args().skip(1).collect();
    let out_of = |args: &[String]| args.iter().position(|a| a == "-o").and_then(|i| args.get(i + 1)).cloned().unwrap_or_else(|| ".".into());
    // A replay with no verb before it (as War Thunder's reader takes it): convert.
    if args.first().is_some_and(|a| !matches!(a.as_str(), "convert" | "status" | "extract")) {
        args.insert(0, "convert".into());
    }
    match args.first().map(String::as_str) {
        Some("convert") => {
            let input = std::path::PathBuf::from(&args[1]);
            let out = std::path::PathBuf::from(out_of(&args));
            let name = input.file_name().unwrap().to_string_lossy().to_lowercase();
            println!("reading {}", input.display());
            if name.contains("slow") {
                std::thread::sleep(std::time::Duration::from_secs(30));
            }
            if name.contains("oodle") {
                eprintln!("error: this replay needs oo2core_9_win64.dll (Oodle) from your own game install; pass --oodle");
                std::process::exit(3);
            }
            if name.contains("bad") {
                eprintln!("error: not a replay");
                std::process::exit(2);
            }
            println!("50%");
            let stem = input.file_stem().unwrap().to_string_lossy().into_owned();
            let map = "fake_map";
            std::fs::create_dir_all(out.join(map)).unwrap();
            std::fs::write(out.join(map).join(format!("{stem}.3dheat")), container("warthunder", map, &stem, "fake-converter", env!("CARGO_PKG_VERSION"))).unwrap();
            println!("{{\"progress\": 1.0}}");
            println!("ok {map}/{stem}.3dheat");
        }
        Some("status") => {
            println!(r#"{{"game":"warthunder","maps":[{{"id":"m_new","state":"new","name":"New map"}},{{"id":"m_changed","state":"changed"}},{{"id":"m_ok","state":"current"}}]}}"#);
        }
        Some("extract") => {
            let out = std::path::PathBuf::from(out_of(&args));
            std::fs::create_dir_all(&out).unwrap();
            for m in args[1..].iter().take_while(|a| *a != "-o") {
                std::fs::File::create(out.join(format!("{m}.glb"))).unwrap().write_all(format!("glTF {m}").as_bytes()).unwrap();
                println!("ok {m}");
            }
        }
        _ => {
            eprintln!("fake-converter convert|status|extract");
            std::process::exit(2);
        }
    }
}
