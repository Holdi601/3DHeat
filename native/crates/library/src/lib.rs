//! The 3DHeat Library: the local catalogue of replays, Tacview recordings,
//! demos, converted matches, extracted levels, model packs and Watcher
//! sessions, managed like photos in a photo library (docs/library.md).
//!
//! - `kinds`: what a file is by its name; `meta`: what is in it (open formats only);
//! - `db`: the SQLite catalogue, its filters, facets, search and collections;
//! - `scan`: walking folders, the fast and the deep pass;
//! - `thumb`: the thumbnails; `extractors` and `jobs`: the installed
//!   converters and the conversion queue;
//! - `api`: the JSON interface the page talks to (mounted by `heat3d-server`).
//!
//! Everything stays on this machine: the catalogue is never uploaded, and its
//! paths and player names never go into shared session files or usage
//! statistics.

pub mod api;
pub mod db;
pub mod extractors;
pub mod jobs;
pub mod kinds;
pub mod meta;
pub mod scan;
#[doc(hidden)]
pub mod testkit;
pub mod thumb;

use std::collections::VecDeque;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Condvar, Mutex, MutexGuard, RwLock};
use std::time::Duration;

use anyhow::{anyhow, Context, Result};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

/// The user's settings, kept in the catalogue.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct Settings {
    /// Where conversions go: `<output>\<game>\...`.
    pub output_dir: PathBuf,
    /// Where "Move into the library folder" moves files.
    pub library_dir: PathBuf,
    /// Jobs at once; 0: half the cores (and one per 4 GB of memory at most).
    pub max_jobs: usize,
    /// Hash network files whole too (reads every byte over the network).
    pub hash_network: bool,
    /// Watched folders are looked at again this often.
    pub rescan_minutes: u64,
    /// The levels folder, when not `HEAT3D_LEVELS` (or `<data>\levels`).
    pub levels_dir: Option<PathBuf>,
}

impl Default for Settings {
    fn default() -> Self {
        let data = data_dir();
        // Beside the levels folder when one is set (`<data>\levels`, `<data>\converted`).
        let base = std::env::var_os("HEAT3D_LEVELS").map(PathBuf::from).and_then(|l| l.parent().map(Path::to_path_buf)).unwrap_or_else(|| data.clone());
        Settings { output_dir: base.join("converted"), library_dir: base.join("library"), max_jobs: 0, hash_network: false, rescan_minutes: 10, levels_dir: None }
    }
}

/// The app's own data folder: `%LOCALAPPDATA%\3DHeat`, `$XDG_DATA_HOME/3dheat` (or `~/.local/share/3dheat`).
pub fn data_dir() -> PathBuf {
    if let Some(d) = std::env::var_os("HEAT3D_DATA_DIR") {
        return PathBuf::from(d);
    }
    #[cfg(windows)]
    {
        if let Some(l) = std::env::var_os("LOCALAPPDATA") {
            return PathBuf::from(l).join("3DHeat");
        }
    }
    if let Some(x) = std::env::var_os("XDG_DATA_HOME") {
        return PathBuf::from(x).join("3dheat");
    }
    std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".local/share/3dheat")).unwrap_or_else(|| PathBuf::from("3dheat-data"))
}

pub struct Library {
    pub data_dir: PathBuf,
    pub db_path: PathBuf,
    writer: Mutex<Connection>,
    readers: Mutex<Vec<Connection>>,
    progress: Mutex<scan::Progress>,
    scan_queue: Mutex<VecDeque<i64>>,
    scan_wake: Condvar,
    deep_wake: Condvar,
    deep_lock: Mutex<()>,
    pub jobs: jobs::Queue,
    extractors: RwLock<Vec<extractors::Extractor>>,
    settings: RwLock<Settings>,
    /// Put into thumbnail addresses, so a page of another origin cannot guess them.
    pub thumb_token: String,
}

impl Library {
    /// Opens the catalogue in `data_dir` (`<data>/library/library.sqlite`).
    pub fn open(data_dir: &Path) -> Result<Self> {
        let db_path = data_dir.join("library").join("library.sqlite");
        let writer = db::open(&db_path)?;
        let settings: Settings = db::kv_get(&writer, "settings").and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default();
        let mut r = [0u8; 12];
        getrandom_fill(&mut r);
        let lib = Library {
            data_dir: data_dir.to_path_buf(),
            db_path,
            writer: Mutex::new(writer),
            readers: Mutex::new(Vec::new()),
            progress: Mutex::new(scan::Progress::default()),
            scan_queue: Mutex::new(VecDeque::new()),
            scan_wake: Condvar::new(),
            deep_wake: Condvar::new(),
            deep_lock: Mutex::new(()),
            jobs: jobs::Queue::default(),
            extractors: RwLock::new(extractors::load(data_dir)),
            settings: RwLock::new(settings),
            thumb_token: r.iter().map(|b| format!("{b:02x}")).collect(),
        };
        Ok(lib)
    }

    /// Opens the catalogue and starts its background work: the scanner, the deep pass, the watch and the job workers.
    pub fn start(data_dir: &Path) -> Result<Arc<Self>> {
        let lib = Arc::new(Self::open(data_dir)?);
        let l = lib.clone();
        std::thread::Builder::new().name("heat3d-library-scan".into()).spawn(move || l.scan_loop())?;
        let l = lib.clone();
        std::thread::Builder::new().name("heat3d-library-deep".into()).spawn(move || l.deep_loop())?;
        let l = lib.clone();
        std::thread::Builder::new().name("heat3d-library-watch".into()).spawn(move || l.watch_loop())?;
        jobs::start(&lib);
        Ok(lib)
    }

    pub fn writer(&self) -> Result<MutexGuard<'_, Connection>> {
        self.writer.lock().map_err(|_| anyhow!("the catalogue's writer is poisoned"))
    }

    /// A read connection (WAL: reads never wait for the writer).
    pub fn reader(&self) -> Result<Reader<'_>> {
        let c = self.readers.lock().unwrap().pop();
        let c = match c {
            Some(c) => c,
            None => {
                let c = Connection::open_with_flags(&self.db_path, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX).context("opening a catalogue reader")?;
                c.busy_timeout(Duration::from_secs(10))?;
                c.execute_batch("PRAGMA cache_size = -32768; PRAGMA temp_store = MEMORY;")?;
                c
            }
        };
        Ok(Reader { lib: self, conn: Some(c) })
    }

    pub fn settings(&self) -> Settings {
        self.settings.read().unwrap().clone()
    }

    pub fn set_settings(&self, s: Settings) -> Result<()> {
        db::kv_set(&*self.writer()?, "settings", &serde_json::to_string(&s)?)?;
        *self.settings.write().unwrap() = s;
        self.jobs.wake();
        Ok(())
    }

    /// The levels folder the extractors write into and the viewer reads: the setting, `HEAT3D_LEVELS`, else `<data>/levels`.
    pub fn levels_dir(&self) -> PathBuf {
        if let Some(d) = self.settings.read().unwrap().levels_dir.clone() {
            return d;
        }
        std::env::var_os("HEAT3D_LEVELS").map(PathBuf::from).unwrap_or_else(|| self.data_dir.join("levels"))
    }

    pub fn extractors(&self) -> Vec<extractors::Extractor> {
        self.extractors.read().unwrap().clone()
    }

    /// Reads the manager's list again (after an install or an update), and marks outputs outdated.
    pub fn reload_extractors(&self) -> Result<()> {
        *self.extractors.write().unwrap() = extractors::load(&self.data_dir);
        self.relink()
    }

    /// Links outputs to their replays and sets every replay's and output's conversion state.
    pub fn relink(&self) -> Result<()> {
        let all = self.extractors();
        let c = self.writer()?;
        db::relink(&c, &|conv, ver| extractors::output_current(&all, conv, ver))
    }

    pub fn progress(&self) -> scan::Progress {
        let mut p = self.progress.lock().unwrap().clone();
        p.deep_left = scan::deep_left(self);
        p
    }

    pub fn set_progress(&self, f: impl FnOnce(&mut scan::Progress)) {
        f(&mut self.progress.lock().unwrap());
    }

    /// Adds a folder (and scans it); an existing one is scanned again.
    pub fn add_root(&self, path: &Path, watch: bool) -> Result<i64> {
        let p = std::fs::canonicalize(path).map(strip_verbatim).unwrap_or_else(|_| path.to_path_buf());
        let s = p.to_string_lossy().into_owned();
        let c = self.writer()?;
        c.execute("INSERT INTO roots(path, watch, added) VALUES (?1, ?2, ?3) ON CONFLICT(path) DO UPDATE SET watch = excluded.watch", params![s, watch as i64, db::now_ms()])?;
        let id: i64 = c.query_row("SELECT id FROM roots WHERE path = ?1", params![s], |r| r.get(0))?;
        drop(c);
        self.queue_scan(id);
        Ok(id)
    }

    /// Takes a folder out; its items go (files stay where they are). Items another root holds stay.
    pub fn remove_root(&self, id: i64) -> Result<usize> {
        let mut c = self.writer()?;
        let tx = c.transaction()?;
        let n = tx.execute("DELETE FROM items WHERE root = ?1", params![id])?;
        tx.execute("DELETE FROM roots WHERE id = ?1", params![id])?;
        tx.execute("DELETE FROM items_fts WHERE rowid NOT IN (SELECT id FROM items)", [])?;
        tx.commit()?;
        Ok(n)
    }

    pub fn queue_scan(&self, root: i64) {
        let mut q = self.scan_queue.lock().unwrap();
        if !q.contains(&root) {
            q.push_back(root);
        }
        self.scan_wake.notify_all();
    }

    pub fn queue_scan_all(&self) -> Result<usize> {
        let ids: Vec<i64> = {
            let c = self.reader()?;
            let mut st = c.prepare("SELECT id FROM roots ORDER BY id")?;
            let v = st.query_map([], |r| r.get(0))?.collect::<rusqlite::Result<_>>()?;
            v
        };
        for id in &ids {
            self.queue_scan(*id);
        }
        Ok(ids.len())
    }

    /// Scans one root now, on this thread (tests and the command line).
    pub fn scan_now(&self, root: i64) -> Result<scan::Stats> {
        let path: String = self.reader()?.query_row("SELECT path FROM roots WHERE id = ?1", params![root], |r| r.get(0))?;
        let r = scan::scan_root(self, root, Path::new(&path));
        self.set_progress(|p| {
            p.running = false;
            p.phase = String::new();
            if let Ok(s) = &r {
                p.last = Some(s.clone());
            }
        });
        r
    }

    fn scan_loop(&self) {
        loop {
            let next = {
                let mut q = self.scan_queue.lock().unwrap();
                loop {
                    if let Some(id) = q.pop_front() {
                        break id;
                    }
                    q = self.scan_wake.wait(q).unwrap();
                }
            };
            if let Err(e) = self.scan_now(next) {
                eprintln!("3DHeat Library: scan of folder {next} failed: {e:#}");
            }
            self.deep_wake.notify_all();
        }
    }

    fn deep_loop(&self) {
        loop {
            // A few files at a time, while no fast scan runs.
            let busy = self.progress.lock().unwrap().running;
            let n = if busy { 0 } else { scan::deep_round(self, 8).unwrap_or(0) };
            if n == 0 {
                let g = self.deep_lock.lock().unwrap();
                let _ = self.deep_wake.wait_timeout(g, Duration::from_secs(20));
            }
        }
    }

    fn watch_loop(&self) {
        loop {
            let minutes = self.settings().rescan_minutes.max(1);
            std::thread::sleep(Duration::from_secs(minutes * 60));
            let ids: Vec<i64> = self
                .reader()
                .ok()
                .and_then(|c| {
                    let mut st = c.prepare("SELECT id FROM roots WHERE watch = 1").ok()?;
                    let v: Vec<i64> = st.query_map([], |r| r.get(0)).ok()?.filter_map(|r| r.ok()).collect();
                    Some(v)
                })
                .unwrap_or_default();
            for id in ids {
                self.queue_scan(id);
            }
        }
    }

    /// Moves items' files into the library folder (`<library>\<game>\<name>`); the catalogue follows.
    pub fn move_into_library(&self, ids: &[i64]) -> Result<serde_json::Value> {
        let dest_root = self.settings().library_dir;
        let mut moved = 0;
        let mut failed = Vec::new();
        for id in ids {
            let (path, game, kind): (String, Option<String>, String) = self.reader()?.query_row("SELECT path, game, kind FROM items WHERE id = ?1", params![id], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))?;
            let src = PathBuf::from(&path);
            if src.starts_with(&dest_root) || kind == "session" {
                continue;
            }
            let dir = dest_root.join(game.as_deref().unwrap_or("other"));
            let r = (|| -> Result<PathBuf> {
                std::fs::create_dir_all(&dir)?;
                let name = src.file_name().ok_or_else(|| anyhow!("no file name"))?.to_string_lossy().into_owned();
                let stem = meta::display_stem(&src);
                let ext = name[stem.len()..].to_owned();
                let mut dest = dir.join(&name);
                let mut k = 1;
                while dest.exists() {
                    dest = dir.join(format!("{stem} ({k}){ext}"));
                    k += 1;
                }
                if std::fs::rename(&src, &dest).is_err() {
                    std::fs::copy(&src, &dest)?;
                    std::fs::remove_file(&src)?;
                }
                // A match's side files go with it (`<stem>.events.parquet`, `<stem>.match.json`).
                if let Some(parent) = src.parent() {
                    for e in std::fs::read_dir(parent)?.flatten() {
                        let n = e.file_name().to_string_lossy().into_owned();
                        if n.starts_with(&format!("{stem}.")) && e.path() != src {
                            let _ = std::fs::rename(e.path(), dir.join(&n));
                        }
                    }
                }
                Ok(dest)
            })();
            match r {
                Ok(dest) => {
                    let c = self.writer()?;
                    let root: Option<i64> = c.query_row("SELECT id FROM roots WHERE ?1 LIKE path || '%' ORDER BY length(path) DESC LIMIT 1", params![dest.to_string_lossy()], |r| r.get(0)).ok();
                    c.execute("UPDATE items SET path = ?1, name = ?2, root = ?3 WHERE id = ?4", params![dest.to_string_lossy(), dest.file_name().map(|n| n.to_string_lossy().into_owned()), root, id])?;
                    moved += 1;
                }
                Err(e) => failed.push(serde_json::json!({ "id": id, "error": format!("{e:#}") })),
            }
        }
        Ok(serde_json::json!({ "moved": moved, "failed": failed, "to": dest_root }))
    }

    /// The file the viewer opens for an item: the file itself, a Watcher session's table.
    pub fn open_path(&self, id: i64) -> Result<(PathBuf, String)> {
        let (path, kind, name): (String, String, String) = self.reader()?.query_row("SELECT path, kind, name FROM items WHERE id = ?1", params![id], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))?;
        if kind == "session" {
            return Ok((Path::new(&path).join("heat.parquet"), format!("{name}.parquet")));
        }
        Ok((PathBuf::from(path), name))
    }
}

/// A pooled read connection, returned on drop.
pub struct Reader<'a> {
    lib: &'a Library,
    conn: Option<Connection>,
}

impl std::ops::Deref for Reader<'_> {
    type Target = Connection;
    fn deref(&self) -> &Connection {
        self.conn.as_ref().unwrap()
    }
}

impl Drop for Reader<'_> {
    fn drop(&mut self) {
        if let Some(c) = self.conn.take() {
            let mut pool = self.lib.readers.lock().unwrap();
            if pool.len() < 8 {
                pool.push(c);
            }
        }
    }
}

/// `\\?\C:\x` -> `C:\x` (what `canonicalize` gives on Windows).
fn strip_verbatim(p: PathBuf) -> PathBuf {
    let s = p.to_string_lossy();
    if let Some(r) = s.strip_prefix(r"\\?\UNC\") {
        return PathBuf::from(format!(r"\\{r}"));
    }
    if let Some(r) = s.strip_prefix(r"\\?\") {
        return PathBuf::from(r);
    }
    p
}

fn getrandom_fill(b: &mut [u8]) {
    getrandom::fill(b).expect("the system's random source");
}
