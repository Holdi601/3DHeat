//! A stand-in for GitHub on 127.0.0.1, for the manager's tests and the
//! panel's smoke test (`testbins/serve-fake.rs`): `releases/latest` of a few
//! repositories, their assets, and one asset that redirects away. The
//! extractor in its archives is `testbins/fake-extractor.rs`, built by cargo.

#![allow(dead_code)]

use std::collections::HashMap;
use std::io::Write;
use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};

use axum::extract::{Path as UrlPath, State};
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::Router;
use serde_json::json;
use sha2::{Digest, Sha256};

pub const PLATFORM: &str = if cfg!(windows) { "windows-x64" } else { "linux-x64" };

/// One release: its tag and files; `digest` given for the archive unless `no_digest`.
#[derive(Clone, Default)]
pub struct Release {
    pub tag: String,
    pub files: Vec<(String, Vec<u8>)>,
    pub digests: HashMap<String, String>,
    /// Assets whose download URL redirects to a host other than this one.
    pub redirect_away: Vec<String>,
}

#[derive(Default)]
pub struct Releases {
    pub by_repo: HashMap<String, Release>,
    pub api_calls: usize,
}

pub type Shared = Arc<Mutex<Releases>>;

pub fn sha256_hex(b: &[u8]) -> String {
    Sha256::digest(b).iter().map(|x| format!("{x:02x}")).collect()
}

/// The fake extractor program cargo built beside the tests.
pub fn fake_exe() -> PathBuf {
    let name = format!("fake-extractor{}", std::env::consts::EXE_SUFFIX);
    let me = std::env::current_exe().unwrap();
    // Beside an example; for a test, `<target>/<profile>/examples` (the test may run from a separate build folder).
    let profile = if cfg!(debug_assertions) { "debug" } else { "release" };
    let mut places = vec![me.parent().unwrap().join(&name), me.parent().unwrap().parent().unwrap().join("examples").join(&name)];
    if let Some(t) = option_env!("CARGO_TARGET_TMPDIR") {
        places.push(Path::new(t).parent().unwrap().join(profile).join("examples").join(&name));
    }
    let p = places.iter().find(|p| p.is_file()).cloned().unwrap_or_else(|| places[0].clone());
    assert!(p.is_file(), "{} is not built: run `cargo test -p heat3d-extractors` (it builds the examples) or `cargo build -p heat3d-extractors --examples`", p.display());
    p
}

/// The archive of one extractor version, as the release CI makes it: `<id>/<id>[.exe]` in a zip (Windows) or tar.gz.
pub fn archive(id: &str, program: &Path) -> Vec<u8> {
    let bytes = std::fs::read(program).unwrap();
    if cfg!(windows) {
        let mut w = zip::ZipWriter::new(std::io::Cursor::new(Vec::new()));
        let o = zip::write::SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);
        w.add_directory(format!("{id}/"), o).unwrap();
        w.start_file(format!("{id}/{id}.exe"), o).unwrap();
        w.write_all(&bytes).unwrap();
        w.start_file(format!("{id}/_internal/readme.txt"), o).unwrap();
        w.write_all(b"fake").unwrap();
        w.finish().unwrap().into_inner()
    } else {
        let mut b = tar::Builder::new(flate2::write::GzEncoder::new(Vec::new(), flate2::Compression::fast()));
        let mut h = tar::Header::new_gnu();
        h.set_size(bytes.len() as u64);
        h.set_mode(0o755);
        b.append_data(&mut h, format!("{id}/{id}"), &bytes[..]).unwrap();
        let mut h = tar::Header::new_gnu();
        h.set_size(0);
        h.set_entry_type(tar::EntryType::Symlink);
        b.append_link(&mut h, format!("{id}/self"), format!("{id}")).unwrap();
        b.into_inner().unwrap().finish().unwrap()
    }
}

/// A release of `id` at `version` with its archive and `SHA256SUMS` (and the API digest).
pub fn release(id: &str, version: &str, program: &Path) -> Release {
    let ext = if cfg!(windows) { "windows-x64.zip" } else { "linux-x64.tar.gz" };
    let name = format!("{id}-{version}-{ext}");
    let a = archive(id, program);
    let sum = sha256_hex(&a);
    let sums = format!("{sum}  {name}\n");
    let mut r = Release { tag: format!("v{version}"), files: vec![(name.clone(), a), ("SHA256SUMS".into(), sums.into_bytes())], ..Default::default() };
    r.digests.insert(name, format!("sha256:{sum}"));
    r
}

async fn latest(State((s, addr)): State<(Shared, SocketAddr)>, UrlPath((owner, name)): UrlPath<(String, String)>) -> Response {
    let mut s = s.lock().unwrap();
    s.api_calls += 1;
    let Some(r) = s.by_repo.get(&format!("{owner}/{name}")) else {
        return (StatusCode::NOT_FOUND, "{\"message\":\"Not Found\"}").into_response();
    };
    let assets: Vec<_> = r
        .files
        .iter()
        .map(|(f, b)| {
            let url = if r.redirect_away.contains(f) {
                format!("http://{addr}/away")
            } else {
                format!("http://{addr}/dl/{owner}/{name}/{}/{f}", r.tag)
            };
            json!({ "name": f, "size": b.len(), "browser_download_url": url, "digest": r.digests.get(f) })
        })
        .collect();
    axum::Json(json!({ "tag_name": r.tag, "draft": false, "prerelease": false, "assets": assets })).into_response()
}

async fn download(State((s, _)): State<(Shared, SocketAddr)>, UrlPath((owner, name, tag, file)): UrlPath<(String, String, String, String)>) -> Response {
    let s = s.lock().unwrap();
    let hit = s.by_repo.get(&format!("{owner}/{name}")).filter(|r| r.tag == tag).and_then(|r| r.files.iter().find(|(f, _)| *f == file));
    match hit {
        Some((_, b)) => ([(header::CONTENT_TYPE, "application/octet-stream")], b.clone()).into_response(),
        None => StatusCode::NOT_FOUND.into_response(),
    }
}

async fn away() -> Response {
    (StatusCode::FOUND, [(header::LOCATION, "http://example.invalid/x.zip")]).into_response()
}

/// Serves the releases on 127.0.0.1 at a free port.
pub async fn serve(releases: Shared) -> SocketAddr {
    let l = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = l.local_addr().unwrap();
    let app = Router::new()
        .route("/repos/{owner}/{name}/releases/latest", get(latest))
        .route("/dl/{owner}/{name}/{tag}/{file}", get(download))
        .route("/away", get(away))
        .with_state((releases, addr));
    tokio::spawn(async move { axum::serve(l, app).await.unwrap() });
    addr
}

/// An index of `ids`, each at `Holdi601/Fake-<id>`, every one built for this platform.
pub fn index(ids: &[&str]) -> String {
    let entries: Vec<_> = ids
        .iter()
        .map(|id| {
            json!({
                "id": id, "name": format!("Fake {id}"), "games": ["A game"], "what": "A fake extractor for tests",
                "repo": format!("Holdi601/Fake-{id}"),
                "assets": { "windows-x64": "{id}-{version}-windows-x64.zip", "linux-x64": "{id}-{version}-linux-x64.tar.gz" },
                "exe": { "windows-x64": "{id}/{id}.exe", "linux-x64": "{id}/{id}" },
                "sums": "SHA256SUMS"
            })
        })
        .collect();
    json!({ "format": "3dheat-extractors", "version": 1, "extractors": entries }).to_string()
}
