//! `3dheat serve [OPTIONS]`: the 3DHeat server, headless. The multiplayer
//! session server with the native core's data API; see `heat3d_server::cli`.

use std::sync::Arc;

use heat3d_core::service::Core;

#[tokio::main]
async fn main() {
    let mut args = std::env::args().skip(1);
    match args.next().as_deref() {
        Some("serve") => heat3d_server::cli::serve(args.collect(), Arc::new(Core::new()), None).await,
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
