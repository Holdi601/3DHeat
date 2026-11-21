//! The headless `3dheat.exe` links the Visual C++ runtime statically, as the app
//! does (tauri-build's `staticVCRuntime`), so neither needs the VC++
//! redistributable: what is left is the Universal CRT, which Windows 10 and 11
//! ship. Checked with `dumpbin /dependents` (docs/native-app.md).

fn main() {
    let msvc = std::env::var("CARGO_CFG_TARGET_ENV").as_deref() == Ok("msvc");
    if !msvc {
        return;
    }
    for lib in [
        "libvcruntimed.lib",
        "vcruntime.lib",
        "vcruntimed.lib",
        "libcmtd.lib",
        "msvcrt.lib",
        "msvcrtd.lib",
        "libucrt.lib",
        "libucrtd.lib",
    ] {
        println!("cargo:rustc-link-arg-bins=/NODEFAULTLIB:{lib}");
    }
    for lib in ["libcmt.lib", "libvcruntime.lib", "ucrt.lib"] {
        println!("cargo:rustc-link-arg-bins=/DEFAULTLIB:{lib}");
    }
    println!("cargo:rerun-if-changed=build.rs");
}
