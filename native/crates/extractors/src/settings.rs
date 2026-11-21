//! The manager's own settings, in `<data>/extractors/manager.json`: whether
//! updates are installed without asking, and the versions the user chose to
//! skip. Nothing else, and nothing of it goes into a session or shared file.

use std::collections::BTreeMap;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::version;

#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    /// Updates installed by a refresh without asking (off unless the user turns it on).
    #[serde(default)]
    pub auto_update: bool,
    /// Per extractor, a release version not to offer (until a newer one is out).
    #[serde(default)]
    pub skip: BTreeMap<String, String>,
}

impl Settings {
    /// The settings in `file`, or the defaults when there are none (or they do not read).
    pub fn load(file: &Path) -> Settings {
        let mut s: Settings = std::fs::read_to_string(file).ok().and_then(|t| serde_json::from_str(&t).ok()).unwrap_or_default();
        s.skip.retain(|id, v| id.len() <= 64 && version::from_tag(v).as_deref() == Some(v.as_str()));
        s
    }

    /// Writes them whole (a temporary file renamed over the old one).
    pub fn save(&self, file: &Path) -> Result<(), String> {
        let tmp = file.with_extension("json.tmp");
        let text = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        std::fs::create_dir_all(file.parent().unwrap_or(Path::new(".")))
            .and_then(|_| std::fs::write(&tmp, text))
            .and_then(|_| std::fs::rename(&tmp, file))
            .map_err(|e| format!("cannot keep the settings: {e}"))
    }

    /// Whether `latest` of `id` is the version the user skipped.
    pub fn skipped(&self, id: &str, latest: &str) -> bool {
        self.skip.get(id).is_some_and(|v| version::compare(v, latest).is_eq())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn settings_round_trip_and_default_off() {
        let dir = std::env::temp_dir().join(format!("heat3d-settings-{}", std::process::id()));
        let file = dir.join("manager.json");
        assert_eq!(Settings::load(&file), Settings::default());
        assert!(!Settings::default().auto_update);
        let mut s = Settings::default();
        s.skip.insert("heat3d-x".into(), "1.2.0".into());
        s.save(&file).unwrap();
        let back = Settings::load(&file);
        assert_eq!(back, s);
        assert!(back.skipped("heat3d-x", "1.2.0") && !back.skipped("heat3d-x", "1.3.0") && !back.skipped("heat3d-y", "1.2.0"));
        std::fs::write(&file, r#"{"autoUpdate":true,"skip":{"heat3d-x":"../evil"}}"#).unwrap();
        let s = Settings::load(&file);
        assert!(s.auto_update && s.skip.is_empty());
        let _ = std::fs::remove_dir_all(dir);
    }
}
