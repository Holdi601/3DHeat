//! For the panel's smoke test (tools/smoke-extractors.mjs): a stand-in GitHub
//! with two fake extractors released (one at 1.0.0 and later 1.1.0), and the
//! Extractors route on 127.0.0.1 with a manager pointed at it and at a
//! scratch folder. Prints `listening <port>` and serves until killed.
//! `POST /__fake/publish` publishes 1.1.0 of the first.
//!
//!   cargo run -p heat3d-extractors --example serve-fake -- <scratch folder>

#[path = "../tests/fake/mod.rs"]
mod fake;

use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use axum::routing::post;
use axum::Router;
use heat3d_extractors::index::Index;
use heat3d_extractors::{router, Auth, Config, Manager};

#[tokio::main]
async fn main() {
    let dir = std::path::PathBuf::from(std::env::args().nth(1).expect("a scratch folder"));
    let program = fake::fake_exe();
    let releases: fake::Shared = Arc::new(Mutex::new(Default::default()));
    releases.lock().unwrap().by_repo.insert("Holdi601/Fake-heat3d-alpha".into(), fake::release("heat3d-alpha", "1.0.0", &program));
    releases.lock().unwrap().by_repo.insert("Holdi601/Fake-heat3d-beta".into(), fake::release("heat3d-beta", "2.0.0", &program));
    let gh = fake::serve(releases.clone()).await;
    let m = Manager::new(Config {
        data: dir.join("data"),
        levels: dir.join("levels"),
        index: Index::parse(&fake::index(&["heat3d-alpha", "heat3d-beta", "heat3d-gamma"])).unwrap(),
        api: format!("http://{gh}"),
        platform: fake::PLATFORM.into(),
        cache_for: Duration::from_secs(3600),
        check_timeout: Duration::from_secs(60),
    })
    .unwrap();
    let (r, p) = (releases.clone(), program.clone());
    let app = Router::new()
        .nest_service("/__heat3d/extractors", router(Some(Arc::new(m)), Auth::Host))
        .route(
            "/__fake/publish",
            post(move || {
                let (r, p) = (r.clone(), p.clone());
                async move {
                    r.lock().unwrap().by_repo.insert("Holdi601/Fake-heat3d-alpha".into(), fake::release("heat3d-alpha", "1.1.0", &p));
                    "ok"
                }
            }),
        );
    let l = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    println!("listening {}", l.local_addr().unwrap().port());
    axum::serve(l, app.into_make_service_with_connect_info::<SocketAddr>()).await.unwrap();
}
