//! `3dheat serve`: hosts a multiplayer session from the web build, with the
//! native core's data API at `/v1`. Open the host address it prints in a browser
//! to be the host; others open the join address. See docs/multiplayer.md and
//! docs/native-app.md. Headless (`3dheat`) or from the app (`3dheat-app serve`,
//! `3dheat-app --host ...` beside the window).

use heat3d_session::auth::Cost;
use heat3d_session::proxy::{Net, TrustedProxies};
use heat3d_session::server::{start, GatewayCommand, ServeConfig, ShareConfig};
use heat3d_session::share::Blocklist;
use heat3d_session::tls::{local_ips, TlsMode};
use std::net::{IpAddr, SocketAddr};
use std::path::PathBuf;
use std::sync::Arc;

use heat3d_core::service::Core;

const USAGE: &str = "\
3dheat serve - host a 3DHeat multiplayer session

USAGE:
    3dheat serve [OPTIONS]

OPTIONS:
    --port N               Port (default 7878)
    --bind ADDR            Address to listen on (default 0.0.0.0; 127.0.0.1 with --plain-http)
    --web DIR              The web build to serve (default: ./dist, or dist next to the program)
    --name NAME            The session's name
    --password-env VAR     The session password, from an environment variable (at least 12 characters)
    --password-file FILE   The session password, from the first line of a file
    --no-waiting-room      Members with the password join at once (invite links always do)
    --max-clients N        Connections at most (default 32)
    --max-per-addr N       Connections from one address at most (default 3)
    --max-waiting N        Clients in the waiting room at most (default 16)
    --max-connections N    TCP connections at most, all clients together (default 1024)
    --publish FILE         Publish a file for members to fetch by its hash (repeatable; the first is the session's data)
    --cert FILE --key FILE Use this certificate (PEM) instead of the self-signed one
    --plain-http           No TLS: only on this machine (binds 127.0.0.1)
    --allow-origin ORIGIN  Also accept the WebSocket from this origin (a dev server; repeatable)
    --state-dir DIR        Where the certificate and uploads are kept
    --host-token HEX       The host's token (default: a new random one each start)
    --no-sandbox           Run the network gateway inside this process, not as its own
                           locked-down process (for debugging; not with --expose-internet)
    --expose-internet      EXPERT: answer addresses outside the local network (needs TLS).
                           Use a strong password, invite links and the waiting room.
    --trusted-proxy ADDR   A reverse proxy (address or network) whose X-Forwarded-For /
                           X-Real-IP name the client (repeatable); nobody else's are believed
    --trust-cloudflared    Believe CF-Connecting-IP from cloudflared on this machine (a tunnel
                           you run yourself; the server's own tunnel does this by itself)
    --local-config FILE    This machine's settings for going public and sharing (default:
                           local.json in the state folder; never put it in a repository)
    --catalog DIR          The catalogue folder items may be shared from (default: HEAT3D_LEVELS)
";

pub const HELP: &str = USAGE;

/// `gateway`: the session server's network gateway, started by `serve` only
/// (its settings and connections come over standard input).
pub async fn gateway() -> ! {
    std::process::exit(heat3d_session::server::gateway_main().await)
}

/// `sandbox-check`: starts a gateway process locked down as `serve` does and
/// has it try what a gateway someone took over would try: read and list the
/// user's files, write there, connect to this machine, listen, start a
/// program. Prints each, and fails when any was allowed.
pub async fn sandbox_check() -> ! {
    let dir = std::env::temp_dir().join(format!("heat3d-sandbox-check-{}", std::process::id()));
    let _ = std::fs::create_dir_all(&dir);
    let file = dir.join("secret.txt");
    let _ = std::fs::write(&file, "a file of the user's");
    let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap_or_else(|e| fail(&format!("listen: {e}")));
    let port = listener.local_addr().map(|a| a.port()).unwrap_or(0);
    let exe = std::env::current_exe().unwrap_or_else(|e| fail(&e.to_string()));
    let (f, d, p) = (file.display().to_string(), dir.display().to_string(), port.to_string());
    let mut child = heat3d_sandbox::spawn(&exe, &["gateway-probe", &quote(&f), &quote(&d), &p]).unwrap_or_else(|e| fail(&format!("starting the gateway: {e}")));
    let mut out = String::new();
    use tokio::io::AsyncBufReadExt;
    let mut lines = tokio::io::BufReader::new(&mut child.stdout).lines();
    let read = async {
        while let Ok(Some(l)) = lines.next_line().await {
            // The gateway listens: try to reach it, as a client on this machine would.
            if let Some(p) = l.strip_prefix("PORT ").and_then(|p| p.trim().parse::<u16>().ok()) {
                let to = std::net::SocketAddr::from(([127, 0, 0, 1], p));
                let _ = tokio::time::timeout(std::time::Duration::from_secs(2), tokio::net::TcpStream::connect(to)).await;
                continue;
            }
            out.push_str(&l);
            out.push('\n');
        }
    };
    let _ = tokio::time::timeout(std::time::Duration::from_secs(30), read).await;
    child.wait().await;
    let _ = std::fs::remove_dir_all(&dir);
    let how = heat3d_sandbox::started_as();
    if !how.is_empty() {
        println!("{how}");
    }
    print!("{out}");
    let lines: Vec<&str> = out.lines().filter(|l| l.ends_with(": ALLOWED") || l.ends_with(": blocked")).collect();
    let allowed = lines.iter().filter(|l| l.ends_with("ALLOWED")).count();
    std::process::exit(if lines.len() == 6 && allowed == 0 { 0 } else { 1 })
}

/// `gateway-probe FILE DIR PORT`: the inside of `sandbox-check`.
pub fn gateway_probe(args: &[String]) -> ! {
    let said = heat3d_sandbox::lockdown().unwrap_or_else(|e| format!("lockdown failed: {e}"));
    println!("{said}");
    let port = args.get(2).and_then(|p| p.parse().ok()).unwrap_or(9);
    for l in heat3d_sandbox::probe(args.first().map(String::as_str).unwrap_or(""), args.get(1).map(String::as_str).unwrap_or(""), port) {
        println!("{l}");
    }
    std::process::exit(0)
}

/// An argument with spaces, quoted for the Windows command line (paths here have no quotes).
fn quote(s: &str) -> String {
    if cfg!(windows) && s.contains(' ') {
        format!("\"{s}\"")
    } else {
        s.to_string()
    }
}

fn fail(msg: &str) -> ! {
    eprintln!("3dheat: {msg}\n\n{USAGE}");
    std::process::exit(2);
}

fn state_dir() -> PathBuf {
    let base = std::env::var_os("APPDATA")
        .or_else(|| std::env::var_os("XDG_STATE_HOME"))
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".local/state")));
    base.unwrap_or_else(|| PathBuf::from("."))
        .join("3dheat")
        .join("serve")
}

fn web_root() -> Option<PathBuf> {
    let here = PathBuf::from("dist");
    if here.join("index.html").is_file() {
        return Some(here);
    }
    let exe = std::env::current_exe().ok()?;
    let near = exe.parent()?.join("dist");
    near.join("index.html").is_file().then_some(near)
}

/// Runs `serve` with `rest` (the options after it) until stopped. The data API
/// answers from `core`, which the app shares with its window. `default_web` is
/// the viewer to serve when `--web` is not given (the app's bundled one).
pub async fn serve(rest: Vec<String>, core: Arc<Core>, default_web: Option<PathBuf>) {
    let mut port = 7878u16;
    let mut bind: Option<IpAddr> = None;
    let mut web: Option<PathBuf> = None;
    let mut plain = false;
    let mut no_sandbox = false;
    let mut trusted: Vec<Net> = Vec::new();
    let mut trust_cloudflared = false;
    let mut local_config: Option<PathBuf> = None;
    let mut catalog: Option<PathBuf> = None;
    let (mut cert, mut key) = (None, None);
    let mut cfg = ServeConfig::new("0.0.0.0:7878".parse().unwrap(), state_dir());
    let mut i = 0;
    let val = |i: &mut usize, name: &str| -> String {
        *i += 1;
        rest.get(*i)
            .cloned()
            .unwrap_or_else(|| fail(&format!("{name} needs a value")))
    };
    while i < rest.len() {
        match rest[i].as_str() {
            "--port" => {
                port = val(&mut i, "--port")
                    .parse()
                    .unwrap_or_else(|_| fail("--port: a number"))
            }
            "--bind" => {
                bind = Some(
                    val(&mut i, "--bind")
                        .parse()
                        .unwrap_or_else(|_| fail("--bind: an IP address")),
                )
            }
            "--web" => web = Some(PathBuf::from(val(&mut i, "--web"))),
            "--name" => cfg.session.name = val(&mut i, "--name"),
            "--password-env" => {
                let var = val(&mut i, "--password-env");
                cfg.password = Some(
                    std::env::var(&var).unwrap_or_else(|_| fail(&format!("{var} is not set"))),
                );
            }
            "--password-file" => {
                let f = val(&mut i, "--password-file");
                let text =
                    std::fs::read_to_string(&f).unwrap_or_else(|e| fail(&format!("{f}: {e}")));
                cfg.password = Some(text.lines().next().unwrap_or("").trim_end().to_string());
            }
            "--no-waiting-room" => cfg.session.waiting_room = false,
            "--max-clients" => {
                cfg.session.max_clients = val(&mut i, "--max-clients")
                    .parse()
                    .unwrap_or_else(|_| fail("--max-clients: a number"))
            }
            "--max-per-addr" => {
                cfg.session.max_per_addr = val(&mut i, "--max-per-addr")
                    .parse()
                    .unwrap_or_else(|_| fail("--max-per-addr: a number"))
            }
            "--max-waiting" => {
                cfg.session.max_waiting = val(&mut i, "--max-waiting")
                    .parse()
                    .unwrap_or_else(|_| fail("--max-waiting: a number"))
            }
            "--max-connections" => {
                cfg.limits.conns = val(&mut i, "--max-connections")
                    .parse()
                    .unwrap_or_else(|_| fail("--max-connections: a number"))
            }
            "--no-sandbox" => no_sandbox = true,
            "--publish" => cfg.publish.push(PathBuf::from(val(&mut i, "--publish"))),
            "--cert" => cert = Some(PathBuf::from(val(&mut i, "--cert"))),
            "--key" => key = Some(PathBuf::from(val(&mut i, "--key"))),
            "--plain-http" => plain = true,
            "--allow-origin" => cfg.allow_origins.push(val(&mut i, "--allow-origin")),
            "--state-dir" => cfg.state_dir = PathBuf::from(val(&mut i, "--state-dir")),
            "--host-token" => {
                let t = val(&mut i, "--host-token");
                if t.len() < 32 || !t.bytes().all(|b| b.is_ascii_hexdigit()) {
                    fail("--host-token: at least 32 hex digits");
                }
                cfg.host_token = Some(t.to_lowercase());
            }
            "--expose-internet" => cfg.expose = true,
            "--trusted-proxy" => trusted.push(
                val(&mut i, "--trusted-proxy")
                    .parse()
                    .unwrap_or_else(|e: String| fail(&format!("--trusted-proxy: {e}"))),
            ),
            "--trust-cloudflared" => trust_cloudflared = true,
            "--local-config" => local_config = Some(PathBuf::from(val(&mut i, "--local-config"))),
            "--catalog" => catalog = Some(PathBuf::from(val(&mut i, "--catalog"))),
            // Tests only: a cheap password hash.
            "--test-cost" => cfg.session.cost = Cost::TEST,
            "-h" | "--help" => {
                println!("{USAGE}");
                return;
            }
            other => fail(&format!("unknown option `{other}`")),
        }
        i += 1;
    }
    cfg.tls = match (plain, cert, key) {
        (true, None, None) => TlsMode::Off,
        (false, Some(c), Some(k)) => TlsMode::Files { cert: c, key: k },
        (false, None, None) => TlsMode::SelfSigned(cfg.state_dir.join("tls")),
        _ => fail("--cert and --key go together, and not with --plain-http"),
    };
    let ip = bind.unwrap_or_else(|| {
        if plain {
            "127.0.0.1".parse().unwrap()
        } else {
            "0.0.0.0".parse().unwrap()
        }
    });
    cfg.bind = SocketAddr::new(ip, port);
    cfg.web_root = web.or(default_web).or_else(web_root);
    // This machine's own settings: the proxy it trusts, how it goes public, what it may share.
    let local = crate::public::LocalConfig::load(local_config.as_deref(), &cfg.state_dir).unwrap_or_else(|e| fail(&e));
    trusted.extend(local.trusted_proxies.iter().copied());
    cfg.proxies = TrustedProxies { proxies: trusted, cloudflared: trust_cloudflared };
    let share = local.share.clone().unwrap_or_default();
    let catalog = catalog
        .or(share.catalog.clone())
        .or_else(|| std::env::var_os("HEAT3D_LEVELS").map(PathBuf::from))
        .filter(|d| d.is_dir());
    cfg.share = catalog.map(|root| ShareConfig { root, blocklist: Blocklist::new(&share.blocked, &share.blocked_words) });
    let cert_file = match &cfg.tls {
        TlsMode::SelfSigned(dir) => Some(dir.join("cert.pem")),
        TlsMode::Files { cert, .. } => Some(cert.clone()),
        TlsMode::Off => None,
    };
    // The native core's data API beside the session: a member's browser reads the
    // host's data through it, with the member's token (the gateway checks it) and a
    // member's rights only: never files by path. The owner's key is one nobody is told.
    cfg.mount.push(("/v1".into(), crate::data_router(core, Some(heat3d_session::auth::token()), false)));
    // The local usage statistics (off unless switched on, docs/usage-statistics.md):
    // the host's own browser only, by its token; members never reach them.
    cfg.host_mount.push((
        "/__heat3d/usage".into(),
        crate::usage::usage_router(crate::usage::UsageConfig::find(None, cfg.web_root.as_deref())),
    ));
    // The Extractors panel's route (docs/extractors.md): installs and starts programs on
    // this machine, so the host's own browser only, by its token, as the statistics.
    cfg.host_mount.push((
        "/__heat3d/extractors".into(),
        heat3d_extractors::router(heat3d_extractors::Manager::shared(), heat3d_extractors::Auth::Host),
    ));
    if no_sandbox && cfg.expose {
        fail("--no-sandbox and --expose-internet do not go together");
    }
    if !no_sandbox {
        cfg.gateway = Some(GatewayCommand::this_program().unwrap_or_else(|e| fail(&e)));
    }
    // Going public: the host's browser asks (`/__heat3d/public`, the host's token only).
    let public = crate::public::Public::new(
        local.clone(),
        crate::public::ServerFacts {
            port,
            bind: ip,
            tls: !matches!(cfg.tls, TlsMode::Off),
            expose: cfg.expose,
            cert_file,
            base: cfg.proxies.clone(),
        },
    );
    cfg.host_mount.push((crate::public::PUBLIC_ROUTE.into(), public.router()));
    if cfg.web_root.is_none() {
        eprintln!("3dheat: no web build found (run `npm run build`, then pass --web dist); serving the session only");
    }
    if cfg.expose {
        eprintln!(
            "\n  NOTE: --expose-internet answers the whole internet. The server is hardened for it (see the\n  \
             security notes in docs/multiplayer.md), but your address is visible and nothing filters floods\n  \
             in front of it. Use a strong password, prefer invite links, keep the waiting room on, and stop\n  \
             the server when the session ends.\n"
        );
    }
    let running = match start(cfg.clone()).await {
        Ok(r) => r,
        Err(e) => fail(&e),
    };
    public.attach(running.control());
    let host = if ip.is_unspecified() {
        "127.0.0.1".to_string()
    } else {
        ip.to_string()
    };
    println!(
        "3DHeat session \"{}\" on {}",
        cfg.session.name, running.addr
    );
    println!(
        "  Host (open this yourself, keep it private): {}",
        running.host_url(&host)
    );
    if ip.is_unspecified() {
        for a in local_ips()
            .into_iter()
            .filter(|a| !a.is_loopback() && heat3d_session::lan::is_local(*a))
        {
            let h = if a.is_ipv6() {
                format!("[{a}]")
            } else {
                a.to_string()
            };
            println!("  Join: {}", running.join_url(&h));
        }
    } else {
        println!("  Join: {}", running.join_url(&host));
    }
    match &running.sandbox {
        Some(how) => println!("  Gateway sandbox: {how}"),
        None => println!("  Gateway: in this process (--no-sandbox)"),
    }
    if let Some(fp) = &running.fingerprint {
        println!("  Certificate SHA-256: {fp}");
        println!(
            "  (self-signed: browsers warn once; compare this fingerprint before you accept it)"
        );
    }
    if cfg.password.is_none() {
        println!("  No password: everyone waits in the waiting room until you let them in, or joins by an invite link.");
    }
    if cfg.proxies.any() {
        let names: Vec<String> = cfg.proxies.proxies.iter().map(|n| n.to_string()).collect();
        println!(
            "  Client addresses believed from: {}{}",
            names.join(", "),
            if cfg.proxies.cloudflared { " cloudflared (loopback)" } else { "" }
        );
    }
    if cfg.share.is_some() {
        println!("  Sharing: catalogue items the host confirms (session panel); confidential ones are blocked");
    }
    let code = tokio::select! {
        r = running.wait() => match r { Err(e) => { eprintln!("3dheat: {e}"); 1 } Ok(()) => 0 },
        _ = tokio::signal::ctrl_c() => { println!("stopping"); 0 }
    };
    // Nothing stays public after the server: the proxy or tunnel ends with it.
    public.shut().await;
    if code != 0 {
        std::process::exit(code);
    }
}
