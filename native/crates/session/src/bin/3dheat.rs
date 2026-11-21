//! `3dheat serve`: hosts a multiplayer session from the web build, headless.
//! Open the host address it prints in a browser to be the host; others
//! open the join address. See docs/multiplayer.md.

#![forbid(unsafe_code)]

use heat3d_session::auth::Cost;
use heat3d_session::server::{start, ServeConfig};
use heat3d_session::tls::{local_ips, TlsMode};
use std::net::{IpAddr, SocketAddr};
use std::path::PathBuf;

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
    --publish FILE         Publish a file for members to fetch by its hash (repeatable; the first is the session's data)
    --cert FILE --key FILE Use this certificate (PEM) instead of the self-signed one
    --plain-http           No TLS: only on this machine (binds 127.0.0.1)
    --allow-origin ORIGIN  Also accept the WebSocket from this origin (a dev server; repeatable)
    --state-dir DIR        Where the certificate and uploads are kept
    --host-token HEX       The host's token (default: a new random one each start)
    --expose-internet      EXPERT: answer addresses outside the local network. Not hardened yet
                           (Stage 3): use only with a strong password and invite links.
";

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

#[tokio::main]
async fn main() {
    let mut args = std::env::args().skip(1);
    match args.next().as_deref() {
        Some("serve") => {}
        Some("-h") | Some("--help") | None => {
            println!("{USAGE}");
            return;
        }
        Some(other) => fail(&format!("unknown command `{other}`")),
    }
    let mut port = 7878u16;
    let mut bind: Option<IpAddr> = None;
    let mut web: Option<PathBuf> = None;
    let mut plain = false;
    let (mut cert, mut key) = (None, None);
    let mut cfg = ServeConfig::new("0.0.0.0:7878".parse().unwrap(), state_dir());
    let rest: Vec<String> = args.collect();
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
    cfg.web_root = web.or_else(web_root);
    if cfg.web_root.is_none() {
        eprintln!("3dheat: no web build found (run `npm run build`, then pass --web dist); serving the session only");
    }
    if cfg.expose {
        eprintln!(
            "\n  WARNING: --expose-internet answers the whole internet. The session server is not hardened\n  \
             for that yet (Stage 3: sandboxing, fuzzing in CI, a pentest). Use a strong password, prefer\n  \
             invite links, keep the waiting room on, and stop the server when the session ends.\n"
        );
    }
    let running = match start(cfg.clone()).await {
        Ok(r) => r,
        Err(e) => fail(&e),
    };
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
    if let Some(fp) = &running.fingerprint {
        println!("  Certificate SHA-256: {fp}");
        println!(
            "  (self-signed: browsers warn once; compare this fingerprint before you accept it)"
        );
    }
    if cfg.password.is_none() {
        println!("  No password: everyone waits in the waiting room until you let them in, or joins by an invite link.");
    }
    tokio::select! {
        r = running.wait() => if let Err(e) = r { eprintln!("3dheat: {e}"); std::process::exit(1); },
        _ = tokio::signal::ctrl_c() => { println!("stopping"); }
    }
}
