//! The Extractors panel's route installs and starts programs: only the owner
//! reaches it. Through the session server, by the host's token (a member, a
//! stranger, a client naming the gateway's mark itself: 403); in the app
//! window's own server, by the window's key.

use heat3d_core::service::Core;
use heat3d_session::server::{start, ServeConfig};
use heat3d_session::tls::TlsMode;
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

async fn ask(addr: std::net::SocketAddr, method: &str, path: &str, headers: &str) -> (u16, String) {
    let mut s = tokio::net::TcpStream::connect(addr).await.unwrap();
    let req = format!("{method} {path} HTTP/1.1\r\nHost: {addr}\r\n{headers}Content-Length: 0\r\nConnection: close\r\n\r\n");
    s.write_all(req.as_bytes()).await.unwrap();
    let mut b = Vec::new();
    s.read_to_end(&mut b).await.unwrap();
    let text = String::from_utf8_lossy(&b).to_string();
    (text.split(' ').nth(1).and_then(|c| c.parse().ok()).unwrap_or(0), text)
}

/// A manager over an index of one fake extractor, its GitHub a closed port: nothing here goes out.
fn manager(dir: &std::path::Path) -> Arc<heat3d_extractors::Manager> {
    let index = r#"{"format":"3dheat-extractors","version":1,"extractors":[{"id":"heat3d-x","name":"X","games":[],"what":"",
        "repo":"Holdi601/X","assets":{"windows-x64":"{id}-{version}-windows-x64.zip","linux-x64":"{id}-{version}-linux-x64.tar.gz"},
        "exe":{"windows-x64":"{id}/{id}.exe","linux-x64":"{id}/{id}"},"sums":"SHA256SUMS"}]}"#;
    Arc::new(
        heat3d_extractors::Manager::new(heat3d_extractors::Config {
            data: dir.join("data"),
            levels: dir.join("levels"),
            index: heat3d_extractors::index::Index::parse(index).unwrap(),
            api: "http://127.0.0.1:9".into(),
            platform: "windows-x64".into(),
            cache_for: std::time::Duration::from_secs(60),
            check_timeout: std::time::Duration::from_secs(5),
            status_timeout: std::time::Duration::from_secs(60),
        })
        .unwrap(),
    )
}

#[tokio::test]
async fn only_the_host_reaches_the_extractors() {
    let dir = std::env::temp_dir().join(format!("heat3d-extractors-host-{}", std::process::id()));
    let mut cfg = ServeConfig::new("127.0.0.1:0".parse().unwrap(), dir.clone());
    cfg.tls = TlsMode::Off;
    cfg.host_token = Some("ab".repeat(32));
    cfg.host_mount.push(("/__heat3d/extractors".into(), heat3d_extractors::router(Some(manager(&dir)), heat3d_extractors::Auth::Host)));
    let running = start(cfg).await.unwrap();
    let addr = running.addr;
    let host = format!("Authorization: Bearer {}\r\n", "ab".repeat(32));
    let other = format!("Authorization: Bearer {}\r\n", "cd".repeat(32));

    for (what, h) in [("no token", ""), ("another token", other.as_str()), ("the gateway's mark, named by a client", "x-heat3d-host: 1\r\n")] {
        assert_eq!(ask(addr, "GET", "/__heat3d/extractors", h).await.0, 403, "{what}");
        assert_eq!(ask(addr, "POST", "/__heat3d/extractors/run/heat3d-x", h).await.0, 403, "{what}");
        assert_eq!(ask(addr, "POST", "/__heat3d/extractors/install/heat3d-x", h).await.0, 403, "{what}");
    }
    let (code, text) = ask(addr, "GET", "/__heat3d/extractors", &host).await;
    assert_eq!(code, 200, "{text}");
    assert!(text.contains("\"format\":\"3dheat-extractors-state\"") && text.contains("heat3d-x"));
    // The host's request reaches the manager: nothing installed to start.
    let (code, text) = ask(addr, "POST", "/__heat3d/extractors/run/heat3d-x", &host).await;
    assert_eq!(code, 409, "{text}");
    assert!(text.contains("not installed"));
    running.stop().await;
    let _ = std::fs::remove_dir_all(dir);
}

#[tokio::test]
async fn the_window_reaches_its_extractors_by_its_key() {
    let key = "k".repeat(64);
    let addr = heat3d_server::spawn_local(Arc::new(Core::new()), None, key.clone()).await.unwrap();
    assert_eq!(ask(addr, "GET", "/__heat3d/extractors", "").await.0, 403, "no key");
    assert_eq!(ask(addr, "GET", "/__heat3d/extractors", "x-heat3d-key: wrong\r\n").await.0, 403, "another key");
    assert_eq!(ask(addr, "POST", "/__heat3d/extractors/run/heat3d-warthunder", "").await.0, 403, "no key");
    // With the key: the manager answers (or says it does not work on this system).
    let (code, text) = ask(addr, "GET", "/__heat3d/extractors", &format!("x-heat3d-key: {key}\r\n")).await;
    assert!(code == 200 || code == 503, "{text}");
}
