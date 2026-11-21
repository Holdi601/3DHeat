fn main() {
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
            ])),
    )
    .expect("the app's build manifest");
}
