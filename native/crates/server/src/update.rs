//! Updates of the headless server (`3dheat`), in the way the other 3DHeat
//! tools do them: one request to GitHub's latest release, cached for six
//! hours, quiet when offline, off with `HEAT3D_NO_UPDATE`.
//!
//! Nothing is updated without being asked: `serve` says a newer release is
//! out and goes on; `3dheat update` asks before it updates (or takes `--yes`).
//! Only `serve --auto-update` (or `"autoUpdate": true` in the local config)
//! updates by itself. Either way the package is checked against the release's
//! minisign signature with the key below before anything is replaced, and the
//! new version is used from the next start: a running session is never cut.
//!
//! Only a portable copy (the zip or tar.gz) updates itself. One a package
//! manager installed (the .deb) is updated by it, and a container by pulling
//! its new image; for those there is only the notice.

use std::io::{IsTerminal, Write};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use heat3d_extractors::{unpack, verify, version};
use serde::{Deserialize, Serialize};

/// The repository whose releases carry the server's packages.
pub const REPO: &str = "Holdi601/3DHeat";

/// The public half of the release signing key, as Tauri's signer writes it
/// (base64 of the minisign key file). The app's updater checks the same key
/// (`plugins.updater.pubkey` in `crates/app-tauri/tauri.conf.json`; a test
/// keeps the two equal). The private half is kept by the maintainer, off
/// GitHub: releases are signed on their machine (`native/tools/sign-release`).
pub const PUBKEY: &str = "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDMyQzdBOTY0RkU1RUY4NzUKUldSMStGNytaS25ITW93SUQ3L2hyWWlaYnd6aFpWVDZ6aCtWdU91WVY2MHA1QTlsWXBla2g0MXgK";

const CACHE_SECS: u64 = 6 * 3600;
const PACKAGE_LIMIT: u64 = 512 << 20;

/// Set by the headless program: inside the app, the app's own updater does this.
pub static HEADLESS: AtomicBool = AtomicBool::new(false);

/// A published release, as much of it as the check needs.
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Release {
    pub version: String,
    pub page: String,
    pub notes: String,
    /// (name, download address) of each file.
    pub assets: Vec<(String, String)>,
}

#[derive(Serialize, Deserialize)]
struct Cached {
    checked: u64,
    release: Option<Release>,
}

pub fn current() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

/// `HEAT3D_NO_UPDATE` set to anything but empty, `0`, `false` or `no`.
pub fn switched_off() -> bool {
    match std::env::var("HEAT3D_NO_UPDATE") {
        Ok(v) => !matches!(v.trim().to_ascii_lowercase().as_str(), "" | "0" | "false" | "no"),
        Err(_) => false,
    }
}

fn now() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs()).unwrap_or(0)
}

fn cache_file() -> Option<PathBuf> {
    let base = std::env::var_os("LOCALAPPDATA")
        .map(|d| PathBuf::from(d).join("3DHeat"))
        .or_else(|| std::env::var_os("XDG_CACHE_HOME").map(|d| PathBuf::from(d).join("3dheat")))
        .or_else(|| std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".cache").join("3dheat")))?;
    Some(base.join("update-check-3DHeat.json"))
}

/// An error with what caused it ("error sending request" alone says nothing).
fn why(e: reqwest::Error) -> String {
    let mut s = e.to_string();
    let mut cause = std::error::Error::source(&e);
    while let Some(c) = cause {
        s.push_str(": ");
        s.push_str(&c.to_string());
        cause = c.source();
    }
    s
}

fn client(timeout: Duration) -> Result<reqwest::Client, String> {
    let _ = rustls::crypto::ring::default_provider().install_default();
    reqwest::Client::builder()
        .user_agent(concat!("3DHeat-server/", env!("CARGO_PKG_VERSION")))
        .https_only(true)
        .connect_timeout(Duration::from_secs(5))
        .timeout(timeout)
        .build()
        .map_err(|e| format!("no HTTPS client: {e}"))
}

/// The release a GitHub API answer describes.
pub fn parse_release(v: &serde_json::Value) -> Option<Release> {
    let version = version::from_tag(v.get("tag_name")?.as_str()?)?;
    let s = |k: &str| v.get(k).and_then(|x| x.as_str()).unwrap_or("").to_string();
    let assets = v
        .get("assets")
        .and_then(|a| a.as_array())
        .map(|a| {
            a.iter()
                .filter_map(|x| Some((x.get("name")?.as_str()?.to_string(), x.get("browser_download_url")?.as_str()?.to_string())))
                .collect()
        })
        .unwrap_or_default();
    Some(Release { version, page: s("html_url"), notes: s("body"), assets })
}

/// The latest release: from the cache when it is under six hours old (unless
/// `fresh`), else from GitHub. `Ok(None)`: nothing released yet.
pub async fn latest(fresh: bool) -> Result<Option<Release>, String> {
    let cache = cache_file();
    if !fresh {
        if let Some(c) = cache.as_ref().and_then(|p| std::fs::read(p).ok()).and_then(|b| serde_json::from_slice::<Cached>(&b).ok()) {
            if now().saturating_sub(c.checked) < CACHE_SECS {
                return Ok(c.release);
            }
        }
    }
    let url = format!("https://api.github.com/repos/{REPO}/releases/latest");
    let r = client(Duration::from_secs(5))?
        .get(&url)
        .header("Accept", "application/vnd.github+json")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await
        .map_err(|e| format!("GitHub could not be reached ({})", why(e.without_url())))?;
    let release = match r.status().as_u16() {
        200 => {
            let v: serde_json::Value = r.json().await.map_err(|e| format!("GitHub's answer: {}", e.without_url()))?;
            Some(parse_release(&v).ok_or("GitHub's answer names no version")?)
        }
        404 => None,
        403 | 429 => return Err("GitHub's limit of requests is reached; try again in an hour".into()),
        s => return Err(format!("GitHub answered {s}")),
    };
    if let Some(p) = cache {
        // Best effort: a read-only home (a container) just asks again next time.
        let _ = std::fs::create_dir_all(p.parent().unwrap_or(Path::new(".")));
        let _ = std::fs::write(&p, serde_json::to_vec(&Cached { checked: now(), release: release.clone() }).unwrap_or_default());
    }
    Ok(release)
}

/// The release, when it is newer than this program.
pub fn newer(r: Option<Release>) -> Option<Release> {
    r.filter(|r| version::compare(&r.version, current()) == std::cmp::Ordering::Greater)
}

/// The first lines of the release notes, for a notice.
pub fn excerpt(notes: &str, lines: usize) -> String {
    let mut out: Vec<&str> = notes.lines().map(str::trim_end).filter(|l| !l.trim().is_empty()).take(lines).collect();
    if notes.lines().filter(|l| !l.trim().is_empty()).count() > lines {
        out.push("  ...");
    }
    out.iter().map(|l| format!("    {l}")).collect::<Vec<_>>().join("\n")
}

/// The one-line notice, as the other tools print it.
pub fn notice(r: &Release) -> String {
    format!("[3dheat] 3DHeat {} is out (this is {}). {}", r.version, current(), r.page)
}

/// How this copy was installed, which decides who updates it.
#[derive(Debug, PartialEq)]
pub enum Install {
    /// The zip or tar.gz: the folder the program is in.
    Portable(PathBuf),
    /// By a package manager (the .deb): it updates the program.
    Package,
    /// In a container: a new image updates it.
    Container,
}

pub fn install() -> Install {
    if std::env::var_os("HEAT3D_CONTAINER").is_some() || Path::new("/.dockerenv").exists() {
        return Install::Container;
    }
    let exe = std::env::current_exe().ok().and_then(|p| p.canonicalize().ok());
    match exe {
        Some(p) if cfg!(unix) && p.starts_with("/usr") => Install::Package,
        Some(p) => Install::Portable(p.parent().map(Path::to_path_buf).unwrap_or_default()),
        None => Install::Package,
    }
}

/// What to do instead, where this copy does not update itself.
pub fn how_else(i: &Install) -> &'static str {
    match i {
        Install::Package => "installed by a package: update it with your package manager (apt, dnf)",
        Install::Container => "running in a container: pull and start the new image",
        Install::Portable(_) => "",
    }
}

/// The server package of this system, by the release's naming.
pub fn package_name(ver: &str) -> Option<String> {
    let arch = match std::env::consts::ARCH {
        "x86_64" => "x64",
        "aarch64" => "arm64",
        _ => return None,
    };
    match std::env::consts::OS {
        "windows" => Some(format!("3dheat-server-{ver}-windows-{arch}.zip")),
        "linux" => Some(format!("3dheat-server-{ver}-linux-{arch}.tar.gz")),
        _ => None,
    }
}

/// Checks `data` against a Tauri-style signature file (base64 of a minisign signature).
pub fn verify_signature(data: &[u8], sig_file: &[u8], pubkey_b64: &str) -> Result<(), String> {
    use base64::Engine;
    let b64 = base64::engine::general_purpose::STANDARD;
    let key_text = b64.decode(pubkey_b64.trim()).map_err(|_| "the release key is not base64".to_string())?;
    let key = minisign_verify::PublicKey::decode(&String::from_utf8_lossy(&key_text)).map_err(|e| format!("the release key: {e}"))?;
    let sig_text = b64
        .decode(String::from_utf8_lossy(sig_file).trim())
        .map_err(|_| "the signature file is not base64".to_string())?;
    let sig = minisign_verify::Signature::decode(&String::from_utf8_lossy(&sig_text)).map_err(|e| format!("the signature: {e}"))?;
    key.verify(data, &sig, false).map_err(|_| "the signature does not match: the package was not made by 3DHeat's release key".to_string())
}

async fn download(http: &reqwest::Client, url: &str) -> Result<Vec<u8>, String> {
    let mut r = http.get(url).send().await.map_err(|e| format!("the download did not start ({})", e.without_url()))?;
    if !r.status().is_success() {
        return Err(format!("the download answered {}", r.status().as_u16()));
    }
    let mut out = Vec::new();
    while let Some(c) = r.chunk().await.map_err(|e| format!("the download broke off ({})", e.without_url()))? {
        out.extend_from_slice(&c);
        if out.len() as u64 > PACKAGE_LIMIT {
            return Err("the download is larger than a server package can be".into());
        }
    }
    Ok(out)
}

/// Downloads this system's package of `r`, checks its signature (and its line in
/// `SHA256SUMS`), and puts the new program and web build in place of this copy's.
/// The running process keeps its files; the next start uses the new ones.
pub async fn apply(r: &Release) -> Result<String, String> {
    let dir = match install() {
        Install::Portable(d) => d,
        other => return Err(how_else(&other).to_string()),
    };
    let name = package_name(&r.version).ok_or("there is no server package for this system")?;
    let find = |n: &str| r.assets.iter().find(|(a, _)| a == n).map(|(_, u)| u.clone());
    let url = find(&name).ok_or_else(|| format!("release {} has no {name}", r.version))?;
    let sig_url = find(&format!("{name}.sig")).ok_or_else(|| format!("release {} is not signed yet ({name}.sig is missing)", r.version))?;
    let http = client(Duration::from_secs(600))?;
    let data = download(&http, &url).await?;
    let sig = download(&http, &sig_url).await?;
    verify_signature(&data, &sig, PUBKEY)?;
    if let Some(sums_url) = find("SHA256SUMS") {
        let sums = String::from_utf8_lossy(&download(&http, &sums_url).await?).to_string();
        verify::verify(&verify::sha256_hex(&data), &name, &sums, None)?;
    }
    let stage = dir.join(".3dheat-update");
    let _ = std::fs::remove_dir_all(&stage);
    std::fs::create_dir_all(&stage).map_err(|e| format!("{}: {e} (is the folder writable?)", stage.display()))?;
    let archive = stage.join(&name);
    std::fs::write(&archive, &data).map_err(|e| format!("{}: {e}", archive.display()))?;
    let kind = unpack::Kind::of(&name).ok_or("an unknown package format")?;
    let top = name.trim_end_matches(".zip").trim_end_matches(".tar.gz").to_string();
    let out = stage.join("new");
    unpack::unpack(&archive, kind, &out, &top).map_err(|e| format!("unpacking {name}: {e}"))?;
    let new = out.join(&top);
    let exe_name = if cfg!(windows) { "3dheat.exe" } else { "3dheat" };
    if !new.join(exe_name).is_file() {
        return Err(format!("{name} holds no {exe_name}"));
    }
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = std::fs::set_permissions(new.join(exe_name), std::fs::Permissions::from_mode(0o755));
    }
    for item in [exe_name, "dist", "LICENSE", "README.txt", "3dheat.service"] {
        let (from, to) = (new.join(item), dir.join(item));
        if !from.exists() {
            continue;
        }
        let old = dir.join(format!("{item}.old"));
        let _ = remove_any(&old);
        // A running program may be renamed (Windows too), not overwritten.
        if to.exists() {
            std::fs::rename(&to, &old).map_err(|e| format!("{}: {e}", to.display()))?;
        }
        std::fs::rename(&from, &to).map_err(|e| format!("{}: {e}", to.display()))?;
    }
    let _ = std::fs::remove_dir_all(&stage);
    Ok(format!("3DHeat {} is in place of {}; restart the server to use it", r.version, current()))
}

fn remove_any(p: &Path) -> std::io::Result<()> {
    if p.is_dir() {
        std::fs::remove_dir_all(p)
    } else if p.exists() {
        std::fs::remove_file(p)
    } else {
        Ok(())
    }
}

/// What an update left behind (the old program, which could not be removed while it ran).
pub fn clean_old() {
    if let Install::Portable(dir) = install() {
        for item in ["3dheat.exe", "3dheat", "dist", "LICENSE", "README.txt", "3dheat.service"] {
            let _ = remove_any(&dir.join(format!("{item}.old")));
        }
    }
}

/// `serve`'s check, beside the running session: a notice, or with `auto` the update on disk.
pub async fn serve_check(auto: bool) {
    if switched_off() || !HEADLESS.load(Ordering::Relaxed) {
        return;
    }
    clean_old();
    loop {
        if let Ok(Some(r)) = latest(false).await.map(newer) {
            let i = install();
            if auto && matches!(i, Install::Portable(_)) {
                eprintln!("[3dheat] 3DHeat {} is out (this is {}); updating", r.version, current());
                match apply(&r).await {
                    Ok(msg) => eprintln!("[3dheat] {msg}"),
                    Err(e) => eprintln!("[3dheat] {} is out; not updated: {e}", r.version),
                }
                return;
            }
            eprintln!("{}", notice(&r));
            match i {
                Install::Portable(_) => eprintln!("[3dheat] Update with `3dheat update` (it asks first), or start with --auto-update."),
                other => eprintln!("[3dheat] {}.", how_else(&other)),
            }
        }
        tokio::time::sleep(Duration::from_secs(CACHE_SECS)).await;
    }
}

/// `3dheat --check-update`: asks GitHub (no cache) and says.
pub async fn check_command() -> i32 {
    match latest(true).await {
        Ok(r) => match newer(r.clone()) {
            Some(r) => {
                println!("{}", notice(&r));
                if !r.notes.trim().is_empty() {
                    println!("{}", excerpt(&r.notes, 8));
                }
                match install() {
                    Install::Portable(_) => println!("Update with `3dheat update`."),
                    other => println!("{}.", how_else(&other)),
                }
                0
            }
            None => {
                println!("3DHeat {} is the latest{}.", current(), if r.is_none() { " (nothing released yet)" } else { "" });
                0
            }
        },
        Err(e) => {
            eprintln!("3dheat: the update check failed: {e}");
            1
        }
    }
}

/// `3dheat update [--yes]`: asks before it updates, unless `--yes`.
pub async fn update_command(yes: bool) -> i32 {
    let r = match latest(true).await {
        Ok(r) => r,
        Err(e) => {
            eprintln!("3dheat: the update check failed: {e}");
            return 1;
        }
    };
    let Some(r) = newer(r) else {
        println!("3DHeat {} is the latest.", current());
        return 0;
    };
    println!("{}", notice(&r));
    if !r.notes.trim().is_empty() {
        println!("{}", excerpt(&r.notes, 8));
    }
    let i = install();
    if !matches!(i, Install::Portable(_)) {
        println!("{}.", how_else(&i));
        return 0;
    }
    if !yes {
        if !std::io::stdin().is_terminal() {
            println!("Run `3dheat update --yes` to update.");
            return 1;
        }
        print!("Update now? [Y/n] ");
        let _ = std::io::stdout().flush();
        let mut a = String::new();
        let _ = std::io::stdin().read_line(&mut a);
        if !matches!(a.trim().to_ascii_lowercase().as_str(), "" | "y" | "yes" | "j" | "ja") {
            println!("Not updated.");
            return 0;
        }
    }
    match apply(&r).await {
        Ok(msg) => {
            println!("{msg}");
            0
        }
        Err(e) => {
            eprintln!("3dheat: not updated: {e}");
            1
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_app_checks_the_same_key() {
        let conf = include_str!("../../app-tauri/tauri.conf.json");
        let v: serde_json::Value = serde_json::from_str(conf).unwrap();
        assert_eq!(v["plugins"]["updater"]["pubkey"].as_str(), Some(PUBKEY));
    }

    #[test]
    fn the_key_decodes() {
        // A wrong signature is refused, not mistaken for a bad key.
        let err = verify_signature(b"x", b"bm90IGEgc2lnbmF0dXJl", PUBKEY).unwrap_err();
        assert!(err.contains("signature"), "{err}");
    }

    /// A signature as `tauri signer sign` writes it (a throwaway key, not the release key).
    #[test]
    fn tauri_signatures_verify() {
        const KEY: &str = "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IEU5OUM3MTM3M0E3ODYzNEMKUldSTVkzZzZOM0djNlprQ28vMjJhMzg3U0dxd0JSeWlUT0piWkViN2JySGRINW92Wkc5aDdqcy8K";
        const SIG: &str = "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXkKUlVSTVkzZzZOM0djNll3dzhXTXlGUXFGVDJxc3pPMjAxeEUvMThUYmNRTXlvM2x3WHF3Sm5aSFlNZE9naXpnU3pWeXI2Y0p2SWlEWFZ2S2hSelBRMGFsMkpvTVg1dkhzK1F3PQp0cnVzdGVkIGNvbW1lbnQ6IHRpbWVzdGFtcDoxNzk1MzAxMzg4CWZpbGU6ZGF0YS50eHQKdVY5NkYzayszOWlyM2xGMGg5WjF6NWlXVGwvNHdoUjZ0Z3Fqamwwd3FuOXhVRUIyV0UwRlhCV3B4TkVPTFJEeDdpWmlaaEMxbDF2K2ptaVZ4dllWQXc9PQo=";
        let data = b"3DHeat signature test\n";
        verify_signature(data, SIG.as_bytes(), KEY).unwrap();
        assert!(verify_signature(b"3DHeat signature test!\n", SIG.as_bytes(), KEY).is_err());
        // Signed by another key: refused.
        assert!(verify_signature(data, SIG.as_bytes(), PUBKEY).is_err());
    }

    #[test]
    fn releases_read_from_the_api() {
        let v = serde_json::json!({
            "tag_name": "v0.2.0", "html_url": "https://github.com/x/y/releases/tag/v0.2.0", "body": "- one\n- two",
            "assets": [{"name": "SHA256SUMS", "browser_download_url": "https://github.com/x/y/releases/download/v0.2.0/SHA256SUMS"}]
        });
        let r = parse_release(&v).unwrap();
        assert_eq!(r.version, "0.2.0");
        assert_eq!(r.assets.len(), 1);
        assert!(newer(Some(r.clone())).is_some() == (version::compare("0.2.0", current()) == std::cmp::Ordering::Greater));
        assert_eq!(excerpt("a\n\nb\nc", 2), "    a\n    b\n      ...");
    }

    #[test]
    fn package_names() {
        if let Some(n) = package_name("1.2.3") {
            assert!(n.starts_with("3dheat-server-1.2.3-"));
            assert!(n.ends_with(".zip") || n.ends_with(".tar.gz"));
        }
    }
}
