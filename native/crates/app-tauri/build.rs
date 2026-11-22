/// FNV-1a 64 of the SVG with its line ends as LF, in hex (`tools/icons.mjs` writes the same).
fn svg_stamp(svg: &[u8]) -> String {
    let mut h: u64 = 0xcbf29ce484222325;
    for b in svg.iter().filter(|b| **b != b'\r') {
        h ^= *b as u64;
        h = h.wrapping_mul(0x100000001b3);
    }
    format!("{h:016x}")
}

/// The icons are generated from `icons/icon.svg` and not committed, so a set made from an older
/// logo survives a checkout and ends up in the exe. Refused here: made from this icon.svg or not at all.
fn icons_current() {
    println!("cargo:rerun-if-changed=icons/icon.svg");
    println!("cargo:rerun-if-changed=icons/source.stamp");
    println!("cargo:rerun-if-changed=icons/icon.ico");
    let svg = std::fs::read("icons/icon.svg").expect("icons/icon.svg");
    let have = std::fs::read_to_string("icons/source.stamp").unwrap_or_default();
    let ico = std::path::Path::new("icons/icon.ico").exists();
    if !ico || have.trim() != svg_stamp(&svg) {
        panic!(
            "the app's icons are {}: run `npm run icons` in native/ (tools/icons.mjs) and build again",
            if ico { "not made from the current icons/icon.svg" } else { "missing" }
        );
    }
}

fn main() {
    icons_current();
    // The app's own commands, as permissions: the window is served from the app's
    // loopback server, a remote origin to Tauri, which may call only what a
    // capability grants (capabilities/default.json).
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(tauri_build::AppManifest::new().commands(&[
                "core_endpoint",
                "shared_echo",
                "host_memory",
                "requirements",
                "open_fix",
                "update_status",
                "update_check",
                "update_now",
                "update_settings",
                "viewport_start",
                "viewport_stop",
                "viewport_frame",
                "viewport_dataset",
                "viewport_chunk",
                "viewport_column",
                "viewport_level",
                "viewport_hide",
                "viewport_capture",
                "viewport_read_heat",
                "viewport_probe",
                "viewport_snapshot",
                "viewport_mesh",
                "viewport_glyphs",
                "viewport_times",
            ])),
    )
    .expect("the app's build manifest");
}
