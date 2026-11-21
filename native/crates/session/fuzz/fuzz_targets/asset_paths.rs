//! Any request line through the gateway and the core, as a stranger, a
//! member and the host: never a file outside the web build or other than a
//! published one (a secret beside the web build must never come back), never
//! a panic.

#![no_main]

use axum::body::Body;
use axum::extract::ConnectInfo;
use heat3d_session::gateway::Gateway;
use libfuzzer_sys::fuzz_target;
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::{Arc, OnceLock};
use tower::ServiceExt;

const SECRET: &str = "SECRET-OUTSIDE-THE-WEB-BUILD";
const HOST: &str = "1111111111111111111111111111111111111111111111111111111111111111";

struct World {
    rt: tokio::runtime::Runtime,
    gw: Arc<Gateway>,
}

fn world() -> &'static World {
    static W: OnceLock<World> = OnceLock::new();
    W.get_or_init(|| {
        let dir = std::env::temp_dir().join(format!("heat3d-fuzz-paths-{}", std::process::id()));
        let web = dir.join("web");
        std::fs::create_dir_all(web.join("assets")).unwrap();
        std::fs::write(web.join("index.html"), "<!doctype html>index").unwrap();
        std::fs::write(web.join("assets").join("a.js"), "console.log(1)").unwrap();
        std::fs::write(dir.join("secret.txt"), SECRET).unwrap();
        std::fs::write(dir.join("published.bin"), "published").unwrap();
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();
        let hash = "a".repeat(64);
        let gw = rt.block_on(async {
            heat3d_session::server::test_gateway(
                web,
                dir.join("state"),
                HOST.into(),
                vec![(hash, dir.join("published.bin"))],
            )
            .unwrap()
        });
        World { rt, gw }
    })
}

fuzz_target!(|data: &[u8]| {
    if data.is_empty() {
        return;
    }
    let w = world();
    let who = data[0] % 3;
    let method = match data[0] / 3 % 4 {
        0 => "GET",
        1 => "HEAD",
        2 => "POST",
        _ => "OPTIONS",
    };
    let raw = String::from_utf8_lossy(&data[1..]);
    let path: String = raw
        .chars()
        .filter(|c| !c.is_control() && *c != ' ')
        .take(600)
        .collect();
    let uri = if path.starts_with('/') {
        path.clone()
    } else {
        format!("/{path}")
    };
    let Ok(uri) = uri.parse::<axum::http::Uri>() else {
        return;
    };
    let mut req = axum::http::Request::builder().method(method).uri(uri);
    match who {
        1 => req = req.header("authorization", format!("Bearer {HOST}")),
        2 => req = req.header("authorization", format!("Bearer {}", "2".repeat(64))),
        _ => {}
    }
    let Ok(mut req) = req.body(Body::empty()) else {
        return;
    };
    req.extensions_mut()
        .insert(ConnectInfo(SocketAddr::from(([127, 0, 0, 1], 5555))));
    let router = w.gw.router();
    let res = w.rt.block_on(async move {
        let r = router.oneshot(req).await.unwrap();
        axum::body::to_bytes(r.into_body(), 1 << 20)
            .await
            .unwrap_or_default()
    });
    assert!(
        !String::from_utf8_lossy(&res).contains(SECRET),
        "a file outside the web build came back for {path:?}"
    );
    let _ = PathBuf::new();
});
