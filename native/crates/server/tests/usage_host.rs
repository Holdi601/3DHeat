//! The local usage statistics through the session server: the host's own
//! browser only, by the host's token. Anyone else (a member, a stranger, a
//! client that names the gateway's mark itself) gets 403 and nothing is
//! written.

use heat3d_server::usage::{usage_router, UsageConfig};
use heat3d_session::server::{start, ServeConfig};
use heat3d_session::tls::TlsMode;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

async fn ask(addr: std::net::SocketAddr, method: &str, headers: &str, body: &str) -> (u16, String) {
    let mut s = tokio::net::TcpStream::connect(addr).await.unwrap();
    let req = format!("{method} /__heat3d/usage HTTP/1.1\r\nHost: {addr}\r\n{headers}Content-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}", body.len());
    s.write_all(req.as_bytes()).await.unwrap();
    let mut b = Vec::new();
    s.read_to_end(&mut b).await.unwrap();
    let text = String::from_utf8_lossy(&b).to_string();
    let code = text.split(' ').nth(1).and_then(|c| c.parse().ok()).unwrap_or(0);
    (code, text)
}

#[tokio::test]
async fn only_the_host_reaches_the_usage_statistics() {
    let dir = std::env::temp_dir().join(format!("heat3d-usage-host-{}", std::process::id()));
    let usage = dir.join("usage");
    let mut cfg = ServeConfig::new("127.0.0.1:0".parse().unwrap(), dir.clone());
    cfg.tls = TlsMode::Off;
    cfg.host_token = Some("ab".repeat(32));
    cfg.host_mount.push(("/__heat3d/usage".into(), usage_router(Some(UsageConfig { dir: usage.clone(), keys: None }))));
    let running = start(cfg).await.unwrap();
    let addr = running.addr;
    let host = format!("Authorization: Bearer {}\r\n", "ab".repeat(32));
    let other = format!("Authorization: Bearer {}\r\n", "cd".repeat(32));

    assert_eq!(ask(addr, "GET", "", "").await.0, 403, "no token");
    assert_eq!(ask(addr, "GET", &other, "").await.0, 403, "another token");
    assert_eq!(ask(addr, "GET", "x-heat3d-host: 1\r\n", "").await.0, 403, "the gateway's mark, named by a client");
    let (code, text) = ask(addr, "GET", &host, "").await;
    assert_eq!(code, 200, "{text}");
    assert!(text.contains("\"enabled\":true"));
    // A batch from a stranger is refused before it is read; the host's reaches the route's own checks.
    assert_eq!(ask(addr, "POST", "x-heat3d-host: 1\r\n", r#"{"v":1,"events":[]}"#).await.0, 403);
    assert_eq!(ask(addr, "POST", &host, r#"{"v":1,"events":[]}"#).await.0, 400);
    assert_eq!(ask(addr, "DELETE", &other, "").await.0, 403);
    assert!(!usage.exists() || std::fs::read_dir(&usage).unwrap().next().is_none(), "nothing written");
    running.stop().await;
    let _ = std::fs::remove_dir_all(dir);
}
