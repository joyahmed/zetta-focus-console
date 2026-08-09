//! Storage module - Data persistence for preferences

use std::fs;
use std::path::PathBuf;

use crate::state::Preferences;

/// Get the app data directory for the current OS
pub fn get_app_data_dir() -> PathBuf {
    let base_dir = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    base_dir.join("ZettaFocus")
}

/// Get the preferences file path
pub fn get_preferences_path() -> PathBuf {
    get_app_data_dir().join("preferences.json")
}

/// Load preferences from disk, falling back to defaults if missing or corrupt.
///
/// A corrupt file is not an error worth surfacing: the app is perfectly usable
/// with defaults, and the next save overwrites it. Losing a theme preference is
/// not worth an error dialog on launch.
pub fn load_preferences() -> Preferences {
    let path = get_preferences_path();

    if !path.exists() {
        return Preferences::default();
    }

    fs::read_to_string(&path)
        .ok()
        .and_then(|content| serde_json::from_str::<Preferences>(&content).ok())
        .unwrap_or_default()
}

/// Save preferences to disk
pub fn save_preferences(prefs: &Preferences) -> Result<(), String> {
    let path = get_preferences_path();

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let content = serde_json::to_string_pretty(prefs).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())?;

    Ok(())
}
