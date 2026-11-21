//! The app window's own server answers its window only: a request without
//! the window's key (another page of this machine reaching for loopback
//! ports, say) gets nothing, not even a stranger's rights.

use std::sync::Arc;

use heat3d_core::service::Core;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

async fn status(addr: std::net::SocketAddr, key: Option<&str>) -> u16 {
    let mut s = tokio::net::TcpStream::connect(addr).await.unwrap();
    let key = key.map(|k| format!("x-heat3d-key: {k}\r\n")).unwrap_or_default();
    let req = format!("POST /v1 HTTP/1.1\r\nHost: x\r\nOrigin: https://evil.example\r\nContent-Type: text/plain\r\n{key}Content-Length: 4\r\nConnection: close\r\n\r\nabcd");
    s.write_all(req.as_bytes()).await.unwrap();
    let mut b = Vec::new();
    s.read_to_end(&mut b).await.unwrap();
    String::from_utf8_lossy(&b).split(' ').nth(1).and_then(|c| c.parse().ok()).unwrap_or(0)
}

#[tokio::test]
async fn the_window_server_wants_its_key() {
    let addr = heat3d_server::spawn_local(Arc::new(Core::new()), None, "k".repeat(48)).await.unwrap();
    assert_eq!(status(addr, None).await, 403);
    assert_eq!(status(addr, Some("guess")).await, 403);
    // With the key: the core answers (a malformed frame is still an answer).
    assert_eq!(status(addr, Some(&"k".repeat(48))).await, 200);
}
