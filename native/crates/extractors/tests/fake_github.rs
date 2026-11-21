//! The manager end to end against a stand-in GitHub on 127.0.0.1: install,
//! check, start, update, remove a fake extractor; and the downloads it must
//! refuse (a checksum or digest that does not match, a redirect away, no
//! release published).

mod fake;

use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use heat3d_extractors::index::Index;
use heat3d_extractors::{Config, Manager};

fn manager(api: String, dir: &Path) -> Arc<Manager> {
    let ids = ["heat3d-a", "heat3d-b", "heat3d-c", "heat3d-d", "heat3d-e"];
    Arc::new(
        Manager::new(Config {
            data: dir.join("data"),
            levels: dir.join("levels"),
            index: Index::parse(&fake::index(&ids)).unwrap(),
            api,
            platform: fake::PLATFORM.into(),
            cache_for: Duration::from_secs(3600),
            check_timeout: Duration::from_secs(60),
        })
        .unwrap(),
    )
}

async fn until(what: &str, mut f: impl FnMut() -> bool) {
    for _ in 0..200 {
        if f() {
            return;
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    panic!("timed out waiting for {what}");
}

fn exe_at(dir: &Path, id: &str, v: &str) -> PathBuf {
    dir.join("data").join("extractors").join(id).join(v).join(id).join(format!("{id}{}", std::env::consts::EXE_SUFFIX))
}

#[tokio::test(flavor = "multi_thread")]
async fn install_check_run_update_remove() {
    let program = fake::fake_exe();
    let dir = std::env::temp_dir().join(format!("heat3d-extractors-it-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    let releases: fake::Shared = Arc::new(Mutex::new(Default::default()));
    {
        let mut r = releases.lock().unwrap();
        r.by_repo.insert("Holdi601/Fake-heat3d-a".into(), fake::release("heat3d-a", "1.0.0", &program));
        // b: SHA256SUMS names another hash.
        let mut b = fake::release("heat3d-b", "1.0.0", &program);
        b.files[1].1 = format!("{}  {}\n", "0".repeat(64), b.files[0].0).into_bytes();
        b.digests.clear();
        r.by_repo.insert("Holdi601/Fake-heat3d-b".into(), b);
        // c: the API's digest disagrees.
        let mut c = fake::release("heat3d-c", "1.0.0", &program);
        let name = c.files[0].0.clone();
        c.digests.insert(name, format!("sha256:{}", "1".repeat(64)));
        r.by_repo.insert("Holdi601/Fake-heat3d-c".into(), c);
        // d: the archive's address redirects to another host.
        let mut d = fake::release("heat3d-d", "1.0.0", &program);
        d.redirect_away.push(d.files[0].0.clone());
        r.by_repo.insert("Holdi601/Fake-heat3d-d".into(), d);
        // e: nothing published.
    }
    let addr = fake::serve(releases.clone()).await;
    let m = manager(format!("http://{addr}"), &dir);

    // Nothing installed; the latest release is looked up once and kept.
    assert_eq!(m.installed("heat3d-a"), None);
    assert_eq!(m.latest("heat3d-a", false).await.unwrap().version, "1.0.0");
    assert_eq!(m.latest("heat3d-a", false).await.unwrap().version, "1.0.0");
    assert_eq!(releases.lock().unwrap().api_calls, 1, "cached");

    // Install: verified, unpacked into <data>/extractors/<id>/<version>, `current` switched.
    m.install_now("heat3d-a").await.unwrap();
    assert_eq!(m.installed("heat3d-a").as_deref(), Some("1.0.0"));
    assert!(exe_at(&dir, "heat3d-a", "1.0.0").is_file());
    let root = dir.join("data").join("extractors").join("heat3d-a");
    let mut left: Vec<String> = std::fs::read_dir(&root).unwrap().map(|e| e.unwrap().file_name().to_string_lossy().to_string()).collect();
    left.sort();
    assert_eq!(left, ["1.0.0", "current"], "no download or staging left behind");

    // Its requirements, from `--check --json`, with the panel's environment.
    let c = m.check("heat3d-a").await;
    assert_eq!(c.error, None);
    assert_eq!(c.version.as_deref(), Some("1.0.0"));
    assert_eq!(c.levels.as_deref(), Some(dir.join("levels").to_string_lossy().as_ref()));
    assert!(c.checks.iter().any(|l| l.id == "managed" && l.ok));
    assert!(c.checks.iter().any(|l| l.id == "game" && !l.ok));

    // Started as a program of its own, told it is managed and where the levels go.
    m.run("heat3d-a").unwrap();
    let ran = dir.join("levels").join("ran-heat3d-a.txt");
    until("the fake extractor to start", || ran.is_file()).await;
    assert_eq!(std::fs::read_to_string(&ran).unwrap(), "1.0.0 managed=true");
    assert_eq!(m.state()["extractors"][0]["running"], true);
    assert!(m.remove("heat3d-a").is_err(), "not removed while open");
    assert!(m.install("heat3d-a").is_err(), "not updated while open");
    until("the fake extractor to close", || m.state()["extractors"][0]["running"] == false).await;

    // A new release: found past the cache, updated to, the old version deleted.
    releases.lock().unwrap().by_repo.insert("Holdi601/Fake-heat3d-a".into(), fake::release("heat3d-a", "1.1.0", &program));
    assert_eq!(m.latest("heat3d-a", true).await.unwrap().version, "1.1.0");
    assert_eq!(m.state()["extractors"][0]["latest"], "1.1.0");
    assert_eq!(m.update_all().await, ["heat3d-a"]);
    until("the update", || m.state()["extractors"][0]["job"].is_null()).await;
    assert_eq!(m.installed("heat3d-a").as_deref(), Some("1.1.0"));
    assert!(!root.join("1.0.0").exists(), "the old version is gone");
    assert!(m.state()["extractors"][0]["check"]["checks"].is_array(), "checked after installing");
    assert!(m.update_all().await.is_empty(), "nothing newer");

    // Removed: its folder is gone.
    m.remove("heat3d-a").unwrap();
    assert!(!root.exists());
    assert_eq!(m.installed("heat3d-a"), None);

    // Refused downloads leave nothing behind.
    let e = m.install_now("heat3d-b").await.unwrap_err();
    assert!(e.contains("checksum"), "{e}");
    let e = m.install_now("heat3d-c").await.unwrap_err();
    assert!(e.contains("digest"), "{e}");
    let e = m.install_now("heat3d-d").await.unwrap_err();
    assert!(e.contains("GitHub could not be reached"), "{e}");
    let e = m.install_now("heat3d-e").await.unwrap_err();
    assert!(e.contains("no release"), "{e}");
    for id in ["heat3d-b", "heat3d-c", "heat3d-d", "heat3d-e"] {
        assert_eq!(m.installed(id), None);
        let r = dir.join("data").join("extractors").join(id);
        assert!(!r.exists() || std::fs::read_dir(&r).unwrap().next().is_none(), "{id} left files");
    }
    // Background installs report their failure.
    m.install("heat3d-b").unwrap();
    until("the failed install", || m.state()["extractors"][1]["job"]["phase"] == "failed").await;
    assert!(m.state()["extractors"][1]["job"]["error"].as_str().unwrap().contains("checksum"));
    let _ = std::fs::remove_dir_all(&dir);
}
