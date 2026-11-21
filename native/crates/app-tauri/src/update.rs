//! Updates of the app from its GitHub releases, through Tauri's updater: the
//! release's `latest.json` names the new version, its notes and the installer,
//! and the installer is taken only when its minisign signature matches the
//! public key in `tauri.conf.json` (`plugins.updater.pubkey`). The releases are
//! signed on the maintainer's machine; the private key is not on GitHub.
//!
//! The app asks before it updates: the viewer shows the new version with an
//! excerpt of its notes and "Update now", "Later" and "Skip this version"
//! (`src/ui/AppUpdateBanner.tsx`). Only with "Update automatically" switched on
//! (Settings) does it update by itself: it downloads the new version in the
//! background, checks it the same way, and installs it when the app closes, so
//! a session in progress is never cut. `HEAT3D_NO_UPDATE=1` turns checking off.
//!
//! The installer (Windows) and the AppImage (Linux) update in place. A .deb or
//! .rpm install is the package manager's to update; there the notice links the
//! release page.

use std::path::PathBuf;
use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_updater::{Update, UpdaterExt};

/// The releases page, for installs the updater cannot replace.
pub const RELEASES: &str = "https://github.com/Holdi601/3DHeat/releases/latest";
const FIRST_CHECK: Duration = Duration::from_secs(20);
const EVERY: Duration = Duration::from_secs(6 * 3600);

/// The user's choices, kept in the app's config folder (`update.json`): the
/// window's own storage does not last, its origin being a new loopback port each start.
#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    /// Update without asking (installed when the app closes).
    #[serde(default)]
    pub auto: bool,
    /// A version the user chose to skip: not offered again.
    #[serde(default)]
    pub skip: Option<String>,
    /// The app version whose first-run system check was shown.
    #[serde(default)]
    pub checked_requirements: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Available {
    pub version: String,
    pub notes: String,
    pub date: Option<String>,
}

#[derive(Default)]
pub struct State {
    settings: Mutex<Option<Settings>>,
    available: Mutex<Option<Available>>,
    update: Mutex<Option<Update>>,
    /// The checked installer, waiting for the app to close (auto) or for "Update now".
    ready: Mutex<Option<Vec<u8>>>,
    phase: Mutex<(&'static str, String)>,
}

fn settings_file<R: Runtime>(app: &AppHandle<R>) -> Option<PathBuf> {
    app.path().app_config_dir().ok().map(|d| d.join("update.json"))
}

pub fn settings<R: Runtime>(app: &AppHandle<R>) -> Settings {
    let st = app.state::<State>();
    let mut s = st.settings.lock().unwrap();
    if s.is_none() {
        *s = Some(
            settings_file(app)
                .and_then(|p| std::fs::read(p).ok())
                .and_then(|b| serde_json::from_slice(&b).ok())
                .unwrap_or_default(),
        );
    }
    s.clone().unwrap_or_default()
}

pub fn save<R: Runtime>(app: &AppHandle<R>, new: Settings) -> Result<(), String> {
    let p = settings_file(app).ok_or("no config folder")?;
    if let Some(d) = p.parent() {
        std::fs::create_dir_all(d).map_err(|e| e.to_string())?;
    }
    std::fs::write(&p, serde_json::to_vec_pretty(&new).unwrap_or_default()).map_err(|e| e.to_string())?;
    *app.state::<State>().settings.lock().unwrap() = Some(new);
    Ok(())
}

/// Whether the updater can replace this install itself.
pub fn can_install() -> bool {
    cfg!(windows) || std::env::var_os("APPIMAGE").is_some()
}

fn switched_off() -> bool {
    match std::env::var("HEAT3D_NO_UPDATE") {
        Ok(v) => !matches!(v.trim().to_ascii_lowercase().as_str(), "" | "0" | "false" | "no"),
        Err(_) => false,
    }
}

fn set_phase<R: Runtime>(app: &AppHandle<R>, phase: &'static str, error: String) {
    *app.state::<State>().phase.lock().unwrap() = (phase, error);
}

fn status_of<R: Runtime>(app: &AppHandle<R>) -> serde_json::Value {
    let st = app.state::<State>();
    let (phase, error) = st.phase.lock().unwrap().clone();
    serde_json::json!({
        "current": app.package_info().version.to_string(),
        "settings": settings(app),
        "available": st.available.lock().unwrap().clone(),
        "ready": st.ready.lock().unwrap().is_some(),
        "canInstall": can_install(),
        "phase": phase,
        "error": error,
        "off": switched_off(),
        "releases": RELEASES,
    })
}

async fn check<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    set_phase(app, "checking", String::new());
    let found = app.updater().map_err(|e| e.to_string())?.check().await.map_err(|e| e.to_string())?;
    let st = app.state::<State>();
    match found {
        Some(u) => {
            *st.available.lock().unwrap() =
                Some(Available { version: u.version.clone(), notes: u.body.clone().unwrap_or_default(), date: u.date.map(|d| d.to_string()) });
            *st.update.lock().unwrap() = Some(u);
        }
        None => {
            *st.available.lock().unwrap() = None;
            *st.update.lock().unwrap() = None;
        }
    }
    set_phase(app, "idle", String::new());
    Ok(())
}

/// Downloads the update and checks its signature (the updater refuses a mismatch).
async fn download<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let st = app.state::<State>();
    if st.ready.lock().unwrap().is_some() {
        return Ok(());
    }
    let u = st.update.lock().unwrap().clone().ok_or("no update to download")?;
    set_phase(app, "downloading", String::new());
    let bytes = u.download(|_, _| {}, || {}).await.map_err(|e| e.to_string())?;
    *st.ready.lock().unwrap() = Some(bytes);
    set_phase(app, "ready", String::new());
    Ok(())
}

/// Installs a downloaded update: on Windows the installer takes over and the
/// app closes; an AppImage is replaced and the app starts again.
fn install<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let st = app.state::<State>();
    let u = st.update.lock().unwrap().clone().ok_or("no update")?;
    let bytes = st.ready.lock().unwrap().take().ok_or("the update is not downloaded")?;
    u.install(bytes).map_err(|e| e.to_string())
}

/// Checks once soon after start, then every six hours; with "Update
/// automatically" on, downloads what it finds (installed at close).
pub fn start<R: Runtime>(app: AppHandle<R>) {
    if switched_off() {
        return;
    }
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(FIRST_CHECK).await;
        loop {
            match check(&app).await {
                Ok(()) => {
                    let s = settings(&app);
                    let offered = app.state::<State>().available.lock().unwrap().clone();
                    if let Some(a) = offered {
                        if s.auto && can_install() {
                            if let Err(e) = download(&app).await {
                                set_phase(&app, "failed", e);
                            }
                        } else if s.skip.as_deref() != Some(a.version.as_str()) {
                            eprintln!("3DHeat {} is out (this is {})", a.version, app.package_info().version);
                        }
                    }
                }
                Err(e) => set_phase(&app, "failed", e),
            }
            tokio::time::sleep(EVERY).await;
        }
    });
}

/// When the app closes: an update downloaded by "Update automatically" is installed now.
pub fn on_exit<R: Runtime>(app: &AppHandle<R>) {
    if settings(app).auto && app.state::<State>().ready.lock().unwrap().is_some() {
        if let Err(e) = install(app) {
            eprintln!("3DHeat: the update was not installed: {e}");
        }
    }
}

#[tauri::command]
pub fn update_status(app: AppHandle) -> serde_json::Value {
    status_of(&app)
}

/// Asks GitHub now (the Settings button).
#[tauri::command]
pub async fn update_check(app: AppHandle) -> serde_json::Value {
    if let Err(e) = check(&app).await {
        set_phase(&app, "failed", e);
    }
    status_of(&app)
}

/// "Update now": download, check, install, start again. Where the updater cannot
/// replace the install (.deb, .rpm), opens the release page instead.
#[tauri::command]
pub async fn update_now(app: AppHandle) -> Result<serde_json::Value, String> {
    if !can_install() {
        crate::requirements::open_url(RELEASES)?;
        return Ok(status_of(&app));
    }
    if let Err(e) = download(&app).await {
        set_phase(&app, "failed", e.clone());
        return Err(e);
    }
    set_phase(&app, "installing", String::new());
    if let Err(e) = install(&app) {
        set_phase(&app, "failed", e.clone());
        return Err(e);
    }
    app.restart();
}

/// The choices: "Update automatically", "Skip this version", and that the system check was seen.
#[tauri::command]
pub fn update_settings(app: AppHandle, auto: Option<bool>, skip: Option<String>, checked_requirements: Option<String>) -> Result<serde_json::Value, String> {
    let mut s = settings(&app);
    if let Some(a) = auto {
        s.auto = a;
    }
    if let Some(v) = skip {
        s.skip = (!v.is_empty()).then_some(v);
    }
    if let Some(v) = checked_requirements {
        s.checked_requirements = Some(v);
    }
    save(&app, s)?;
    Ok(status_of(&app))
}

#[cfg(test)]
mod tests {
    #[test]
    fn settings_read_with_fields_missing() {
        let s: super::Settings = serde_json::from_str(r#"{"auto":true}"#).unwrap();
        assert!(s.auto);
        assert_eq!(s.skip, None);
        let s: super::Settings = serde_json::from_str("{}").unwrap();
        assert!(!s.auto);
    }
}
