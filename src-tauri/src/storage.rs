//! Storage module - Data persistence for preferences and license

use std::fs;
use std::path::PathBuf;

use crate::types::{LicenseState, Preferences};

/// Get the app data directory for the current OS
pub fn get_app_data_dir() -> PathBuf {
    let base_dir = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    base_dir.join("ZettaFocus")
}

/// Get the preferences file path
pub fn get_preferences_path() -> PathBuf {
    get_app_data_dir().join("preferences.json")
}

/// Get the license file path
pub fn get_license_path() -> PathBuf {
    get_app_data_dir().join("license.json")
}

/// Load preferences from disk, with fallback to defaults if corrupted or missing
pub fn load_preferences() -> Preferences {
    let path = get_preferences_path();

    eprintln!("[DEBUG] Loading preferences from: {:?}", path);

    if !path.exists() {
        eprintln!("[DEBUG] Preferences file does not exist, using defaults");
        return Preferences::default();
    }

    match fs::read_to_string(&path) {
        Ok(content) => {
            eprintln!("[DEBUG] Preferences content: {}", content);
            match serde_json::from_str::<Preferences>(&content) {
                Ok(prefs) => prefs,
                Err(e) => {
                    eprintln!("[DEBUG] Failed to parse preferences: {}", e);
                    Preferences::default()
                }
            }
        }
        Err(e) => {
            eprintln!("[DEBUG] Failed to read preferences file: {}", e);
            Preferences::default()
        }
    }
}

/// Save preferences to disk
pub fn save_preferences(prefs: &Preferences) -> Result<(), String> {
    let path = get_preferences_path();

    eprintln!("[DEBUG] Saving preferences to: {:?}", path);

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let content = serde_json::to_string_pretty(prefs).map_err(|e| e.to_string())?;
    eprintln!("[DEBUG] Preferences content to save: {}", content);
    fs::write(&path, content).map_err(|e| e.to_string())?;

    Ok(())
}

/// Load license state from disk
pub fn load_license() -> LicenseState {
    let path = get_license_path();

    if !path.exists() {
        return LicenseState::default();
    }

    match fs::read_to_string(&path) {
        Ok(content) => match serde_json::from_str::<LicenseState>(&content) {
            Ok(license) => license,
            Err(e) => {
                eprintln!("Failed to parse license: {}", e);
                LicenseState::default()
            }
        },
        Err(e) => {
            eprintln!("Failed to read license file: {}", e);
            LicenseState::default()
        }
    }
}

/// Save license state to disk
pub fn save_license(license: &LicenseState) -> Result<(), String> {
    let path = get_license_path();

    // Ensure directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let content = serde_json::to_string_pretty(license).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())?;

    Ok(())
}
