//! `3dheat serve [OPTIONS]`: the 3DHeat server, headless. The multiplayer
//! session server with the native core's data API; see `heat3d_server::cli`.

use std::sync::Arc;

use heat3d_core::service::Core;

#[tokio::main]
async fn main() {
    let mut args = std::env::args().skip(1);
    // The update check is this program's: inside the app, the app's updater does it.
    heat3d_server::update::HEADLESS.store(true, std::sync::atomic::Ordering::Relaxed);
    match args.next().as_deref() {
        Some("serve") => heat3d_server::cli::serve(args.collect(), Arc::new(Core::new()), None).await,
        Some("--check-update") | Some("check-update") => std::process::exit(heat3d_server::update::check_command().await),
        Some("update") => {
            let yes = args.any(|a| a == "--yes" || a == "-y");
            std::process::exit(heat3d_server::update::update_command(yes).await)
        }
        Some("healthcheck") => heat3d_server::cli::healthcheck(&args.collect::<Vec<_>>()),
        Some("--version") | Some("-V") => println!("3dheat {}", heat3d_server::update::current()),
        Some("gateway") => heat3d_server::cli::gateway().await,
        Some("library") => heat3d_server::library::cli(args.collect()).await,
        Some("sandbox-check") => heat3d_server::cli::sandbox_check().await,
        Some("gateway-probe") => heat3d_server::cli::gateway_probe(&args.collect::<Vec<_>>()),
        None if double_clicked() => {
            if explain_and_offer_hosting() {
                // A window instead of the console: the host page opens in the browser.
                heat3d_server::cli::serve(vec!["--window".into()], Arc::new(Core::new()), None).await
            }
        }
        Some("-h") | Some("--help") | None => println!("{}", heat3d_server::cli::HELP),
        Some(other) => {
            eprintln!("3dheat: unknown command `{other}`\n\n{}", heat3d_server::cli::HELP);
            std::process::exit(2);
        }
    }
}

/// Started from Explorer (a double-click), not from a terminal: the console is this program's alone,
/// and closes the moment the help is printed. Windows only; elsewhere a file manager does not start it.
#[cfg(windows)]
fn double_clicked() -> bool {
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetConsoleProcessList(list: *mut u32, count: u32) -> u32;
    }
    let mut list = [0u32; 4];
    // SAFETY: the buffer holds `count` entries; the call only writes into it.
    unsafe { GetConsoleProcessList(list.as_mut_ptr(), list.len() as u32) <= 1 }
}

#[cfg(not(windows))]
fn double_clicked() -> bool {
    false
}

/// A double-click on the headless server: offer to host a session from this PC
/// at once (the host page opens in the browser, a small window says how to
/// stop), else offer the server guide. A message box, not a console that
/// vanishes. True: host now.
#[cfg(windows)]
fn explain_and_offer_hosting() -> bool {
    #[link(name = "user32")]
    unsafe extern "system" {
        fn MessageBoxW(owner: *mut std::ffi::c_void, text: *const u16, caption: *const u16, kind: u32) -> i32;
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn FreeConsole() -> i32;
    }
    let wide = |s: &str| s.encode_utf16().chain(std::iter::once(0)).collect::<Vec<u16>>();
    let caption = wide(&format!("3DHeat server {}", heat3d_server::update::current()));
    // SAFETY: no arguments; the console window this process owns alone goes away.
    unsafe { FreeConsole() };
    let ask = wide(
        "Host a 3DHeat session from this PC now?\n\n\
         Yes: the session server starts and the host page opens in your browser. \
         Invite people from its Session panel (Invite people).\n\n\
         No: show the guide for running the server on a NAS, a VPS or a home server instead.",
    );
    // MB_YESNOCANCEL | MB_ICONQUESTION | MB_SETFOREGROUND
    // SAFETY: both strings are NUL-terminated UTF-16 that outlive the call; no owner window.
    let answer = unsafe { MessageBoxW(std::ptr::null_mut(), ask.as_ptr(), caption.as_ptr(), 0x3 | 0x20 | 0x1_0000) };
    match answer {
        // IDYES
        6 => true,
        // IDNO
        7 => {
            let _ = std::process::Command::new("explorer")
                .arg("https://github.com/Holdi601/3DHeat/blob/main/docs/native-app.md#letting-others-in-3dheat-serve")
                .spawn();
            false
        }
        _ => false,
    }
}

#[cfg(not(windows))]
fn explain_and_offer_hosting() -> bool {
    println!("{}", heat3d_server::cli::HELP);
    false
}
