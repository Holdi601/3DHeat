//! A stand-in extractor for the manager's tests: answers the contract's
//! command line (`--version`, `--check --json`) and, started without
//! arguments, notes in the levels folder that it ran and how, then stays
//! open a few seconds as a window would. Its id is its file name, its
//! version the folder the manager installed it in.

fn main() {
    let exe = std::env::current_exe().unwrap();
    let id = exe.file_stem().unwrap().to_string_lossy().to_string();
    let version = exe.parent().and_then(|p| p.parent()).and_then(|p| p.file_name()).map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
    let levels = std::env::var("HEAT3D_LEVELS").unwrap_or_default();
    let managed = std::env::var("HEAT3D_MANAGED").as_deref() == Ok("1");
    let args: Vec<String> = std::env::args().skip(1).collect();
    match args.iter().map(String::as_str).collect::<Vec<_>>().as_slice() {
        ["--version"] => println!("{id} {version}"),
        ["--check", "--json"] => println!(
            "{}",
            serde_json::json!({
                "id": id, "version": version, "levels": levels,
                "checks": [
                    { "id": "managed", "label": "Started by the panel", "ok": managed, "detail": "" },
                    { "id": "game", "label": "Game install found", "ok": false, "detail": "no game on a test machine" },
                    { "id": "disk", "label": "Free disk space", "ok": true, "detail": "enough" }
                ]
            })
        ),
        [] => {
            std::fs::create_dir_all(&levels).unwrap();
            std::fs::write(std::path::Path::new(&levels).join(format!("ran-{id}.txt")), format!("{version} managed={managed}")).unwrap();
            std::thread::sleep(std::time::Duration::from_secs(3));
        }
        _ => std::process::exit(2),
    }
}
