//! "Host this session": the host's own browser on the server's machine takes
//! the host's place without the host address. Only a same-page JSON POST from
//! a loopback page, straight over loopback, with no forwarding header of any
//! kind, and never on a server reachable from the internet or with the claim
//! switched off.

use heat3d_session::auth::{self, Cost};
use heat3d_session::proxy::TrustedProxies;
use heat3d_session::server::{start, Running, ServeConfig};
use heat3d_session::tls::TlsMode;
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;

async fn server(local_claim: bool, proxies: TrustedProxies) -> Running {
    let dir = std::env::temp_dir().join(format!("heat3d-claim-test-{}", auth::token()));
    let mut cfg = ServeConfig::new("127.0.0.1:0".parse().unwrap(), dir);
    cfg.tls = TlsMode::Off;
    cfg.session.cost = Cost::TEST;
    cfg.local_claim = local_claim;
    cfg.proxies = proxies;
    start(cfg).await.expect("server")
}

/// A POST to the claim with these header lines (Host first, given by the caller); status and body.
async fn claim(r: &Running, method: &str, lines: &str) -> (u16, String) {
    let mut s = TcpStream::connect(r.addr).await.unwrap();
    let req = format!("{method} /api/host-claim HTTP/1.1\r\n{lines}Content-Length: 2\r\nConnection: close\r\n\r\n{{}}");
    s.write_all(req.as_bytes()).await.unwrap();
    let mut all = Vec::new();
    let _ = tokio::time::timeout(Duration::from_secs(5), s.read_to_end(&mut all)).await;
    let text = String::from_utf8_lossy(&all).to_string();
    let code = text.split(' ').nth(1).and_then(|c| c.parse().ok()).unwrap_or(0);
    let body = text.split("\r\n\r\n").nth(1).unwrap_or("").to_string();
    (code, body)
}

fn page(r: &Running) -> String {
    let port = r.addr.port();
    format!("Host: 127.0.0.1:{port}\r\nOrigin: http://127.0.0.1:{port}\r\nContent-Type: application/json\r\nSec-Fetch-Site: same-origin\r\n")
}

#[tokio::test]
async fn the_hosts_own_page_on_this_machine_gets_the_host_token() {
    let r = server(true, TrustedProxies::default()).await;
    let token = r.host_url("x").rsplit('=').next().unwrap().to_string();
    let (code, body) = claim(&r, "POST", &page(&r)).await;
    assert_eq!(code, 200, "{body}");
    assert!(body.contains(&token), "{body}");
    // `localhost` is the same machine too.
    let port = r.addr.port();
    let lh = format!("Host: localhost:{port}\r\nOrigin: http://localhost:{port}\r\nContent-Type: application/json\r\n");
    assert_eq!(claim(&r, "POST", &lh).await.0, 200);
}

#[tokio::test]
async fn anything_else_is_refused() {
    let r = server(true, TrustedProxies::default()).await;
    let port = r.addr.port();
    let base = page(&r);
    let cases: Vec<(&str, String)> = vec![
        // Another site's page (its fetch would need a preflight it never gets; a form post sends no JSON).
        ("other origin", base.replace(&format!("Origin: http://127.0.0.1:{port}"), "Origin: https://evil.example")),
        ("no origin", base.replace(&format!("Origin: http://127.0.0.1:{port}\r\n"), "")),
        ("cross-site fetch", base.replace("same-origin", "cross-site")),
        ("not JSON", base.replace("application/json", "text/plain")),
        // A proxy or tunnel carried it in.
        ("forwarded", format!("{base}X-Forwarded-For: 203.0.113.7\r\n")),
        ("cloudflared", format!("{base}CF-Connecting-IP: 203.0.113.7\r\n")),
        ("forwarded header", format!("{base}Forwarded: for=203.0.113.7\r\n")),
        ("real ip", format!("{base}X-Real-IP: 203.0.113.7\r\n")),
        // A proxy that rewrote Host to loopback: the browser's Origin still names the public page.
        ("public origin", base.replace(&format!("Origin: http://127.0.0.1:{port}"), "Origin: https://heat.example.org")),
        // Asked by a name that is no loopback (a LAN address, a domain).
        ("lan host", base.replace(&format!("127.0.0.1:{port}"), &format!("192.168.1.20:{port}"))),
    ];
    for (what, lines) in cases {
        let (code, body) = claim(&r, "POST", &lines).await;
        assert_eq!(code, 403, "{what}: {body}");
    }
    // Only a POST.
    assert_ne!(claim(&r, "GET", &base).await.0, 200);
}

#[tokio::test]
async fn off_when_switched_off_or_through_a_trusted_proxy() {
    let r = server(false, TrustedProxies::default()).await;
    assert_eq!(claim(&r, "POST", &page(&r)).await.0, 403);
    // Loopback trusted as a proxy (a tunnel or proxy on this machine): even a plain request is the proxy's.
    let proxied = TrustedProxies { proxies: vec!["127.0.0.1".parse().unwrap()], cloudflared: true };
    let r = server(true, proxied).await;
    let (code, _) = claim(&r, "POST", &format!("{}X-Forwarded-For: 127.0.0.1\r\n", page(&r))).await;
    assert_eq!(code, 403);
}
