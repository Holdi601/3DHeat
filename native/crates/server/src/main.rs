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
        Some("sandbox-check") => heat3d_server::cli::sandbox_check().await,
        Some("gateway-probe") => heat3d_server::cli::gateway_probe(&args.collect::<Vec<_>>()),
        Some("-h") | Some("--help") | None => println!("{}", heat3d_server::cli::HELP),
        Some(other) => {
            eprintln!("3dheat: unknown command `{other}`\n\n{}", heat3d_server::cli::HELP);
            std::process::exit(2);
        }
    }
}
