//! Settings module - Settings and license commands

use crate::license::LicenseManager;
#[cfg(debug_assertions)]
use crate::license::{DevLicenseOverride, DevOverrides};
use crate::types::{LicenseState, StateEvent, StrictModeState, TimerStatus};
use crate::EngineState;
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{AppHandle, Emitter, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrialStatus {
    pub state: String,
    pub days_remaining: u32,
}

#[tauri::command]
pub fn get_trial_status(state: State<EngineState>) -> Result<TrialStatus, String> {
    let license_manager = state.license_manager.lock().map_err(|e| e.to_string())?;

    let license_type = license_manager.get_license_type();
    let days_remaining = license_manager.get_trial_days_remaining();

    Ok(TrialStatus {
        state: license_type,
        days_remaining,
    })
}

#[tauri::command]
pub fn get_license(state: State<EngineState>) -> Result<LicenseState, String> {
    // DIAGNOSTIC: Track get_license command
    eprintln!("[DIAGNOSTIC] get_license command called - using shared EngineState");

    let license_manager = state.license_manager.lock().map_err(|e| e.to_string())?;

    // DIAGNOSTIC: Log the license state being returned
    eprintln!("[DIAGNOSTIC] Returning license from shared state: type={}", license_manager.get_license_type());

    // Use the license_manager from state directly instead of creating a new instance
    Ok(LicenseState {
        license_type: license_manager.get_license_type(),
        issued_at: None,
        expires_at: None,
        signature: license_manager.get_signature(),
    })
}

#[tauri::command]
pub fn activate_key(state: State<EngineState>, key: String) -> Result<String, String> {
    // DIAGNOSTIC: Track license activation
    eprintln!("[DIAGNOSTIC] activate_key command called");
    eprintln!("[DIAGNOSTIC] Key (first 20 chars): {}...", &key.chars().take(20).collect::<String>());

    let mut license_manager = state.license_manager.lock().map_err(|e| e.to_string())?;

    // DIAGNOSTIC: Log current state before activation
    eprintln!("[DIAGNOSTIC] Current tier before activation: {:?}", license_manager.get_tier());

    license_manager.activate_key(&key)?;

    // DIAGNOSTIC: Log new state after activation
    eprintln!("[DIAGNOSTIC] Activation successful! New tier: {:?}", license_manager.get_tier());

    Ok(format!(
        "License key activated successfully! Your license type is now {}.",
        license_manager.get_license_type()
    ))
}

#[tauri::command]
pub fn is_pro(state: State<EngineState>) -> Result<bool, String> {
    let license_manager = state.license_manager.lock().map_err(|e| e.to_string())?;
    Ok(license_manager.is_pro_enabled())
}

#[tauri::command]
pub fn get_trial_days_remaining(state: State<EngineState>) -> Result<u32, String> {
    let license_manager = state.license_manager.lock().map_err(|e| e.to_string())?;
    Ok(license_manager.get_trial_days_remaining())
}

/// Check if user can create a new profile based on license tier and current profile count
#[tauri::command]
pub fn can_create_profile(state: State<EngineState>) -> Result<CanCreateProfileResult, String> {
    let license_manager = state.license_manager.lock().map_err(|e| e.to_string())?;
    let is_pro = license_manager.is_pro_enabled();

    let app_state = state.app_state.lock().map_err(|e| e.to_string())?;
    let custom_count = app_state.count_custom_profiles();

    let can_create = if is_pro {
        true // Trial, Pro, Founder - unlimited
    } else {
        // Free tier - can only have 1 custom profile
        custom_count < 1
    };

    Ok(CanCreateProfileResult {
        can_create,
        is_pro,
        custom_profile_count: custom_count,
        message: if can_create {
            String::new()
        } else if is_pro {
            "Cannot create more profiles".to_string()
        } else {
            "Custom profiles are a Pro feature. Upgrade to unlock unlimited access.".to_string()
        },
    })
}

/// Result type for can_create_profile command
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CanCreateProfileResult {
    pub can_create: bool,
    pub is_pro: bool,
    pub custom_profile_count: usize,
    pub message: String,
}

// ============================================================================
// DEBUG PANEL COMMANDS (Debug builds only)
// ============================================================================

#[cfg(debug_assertions)]
#[tauri::command]
pub fn set_debug_license_override(override_mode: String) -> Result<String, String> {
    let mode = match override_mode.as_str() {
        "force_free" => DevLicenseOverride::ForceFree,
        "force_trial" => DevLicenseOverride::ForceTrial,
        "force_pro" => DevLicenseOverride::ForcePro,
        "force_founder" => DevLicenseOverride::ForceFounder,
        "simulate_expired_trial" => DevLicenseOverride::SimulateExpiredTrial,
        "none" => DevLicenseOverride::None,
        _ => return Err(format!("Unknown override mode: {}", override_mode)),
    };

    DevOverrides::set_override(mode);
    Ok(format!("Debug override set to: {}", override_mode))
}

#[cfg(debug_assertions)]
#[tauri::command]
pub fn clear_debug_license_override() -> Result<String, String> {
    DevOverrides::clear();
    Ok("Debug override cleared".to_string())
}

#[cfg(debug_assertions)]
#[tauri::command]
pub fn clear_license_storage() -> Result<String, String> {
    let path = LicenseManager::get_license_path();
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
        Ok(format!("License storage cleared: {:?}", path))
    } else {
        Ok("No license file to clear".to_string())
    }
}

#[tauri::command]
pub fn activate_strict_mode(
    state: State<EngineState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    let license_manager = state.license_manager.lock().map_err(|e| e.to_string())?;

    // Use the new is_pro_enabled() function for feature gating
    if !license_manager.is_pro_enabled() {
        return Err(
            "Strict Mode is a Pro feature. Upgrade to unlock unlimited access.".to_string(),
        );
    }
    drop(license_manager);

    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;

    if app_state.timer.status != TimerStatus::Idle {
        return Err("Strict Mode can only be activated when timer is idle.".to_string());
    }

    app_state.strict_mode.is_active = true;
    app_state.strict_mode.was_force_closed = false;
    app_state.strict_mode.session_start_timestamp = Some(
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64,
    );

    let _ = app_handle.emit(
        "state-updated",
        StateEvent {
            state: app_state.clone(),
        },
    );

    Ok("Strict Mode activated. Session cannot be paused or stopped until completed. Type 'start' to begin.".to_string())
}

#[tauri::command]
pub fn deactivate_strict_mode(
    state: State<EngineState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    let license_manager = state.license_manager.lock().map_err(|e| e.to_string())?;

    // Use the new is_pro_enabled() function for feature gating
    if !license_manager.is_pro_enabled() {
        return Err("Strict Mode is a Pro feature.".to_string());
    }
    drop(license_manager);

    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;

    if app_state.timer.status == TimerStatus::Running {
        return Err("Cannot deactivate Strict Mode while session is running.".to_string());
    }

    app_state.strict_mode = StrictModeState::default();

    let _ = app_handle.emit(
        "state-updated",
        StateEvent {
            state: app_state.clone(),
        },
    );

    Ok("Strict Mode deactivated.".to_string())
}

#[tauri::command]
pub fn check_strict_mode_failure(
    state: State<EngineState>,
    app_handle: AppHandle,
) -> Result<Option<String>, String> {
    let license_manager = state.license_manager.lock().map_err(|e| e.to_string())?;

    // Use the new is_pro_enabled() function for feature gating
    if !license_manager.is_pro_enabled() {
        return Ok(None);
    }
    drop(license_manager);

    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;

    if app_state.strict_mode.is_active && app_state.strict_mode.was_force_closed {
        let failure_msg =
            "Previous Strict Mode session was marked as FAILED due to force-close.".to_string();

        app_state.strict_mode = StrictModeState::default();

        let _ = app_handle.emit(
            "state-updated",
            StateEvent {
                state: app_state.clone(),
            },
        );

        Ok(Some(failure_msg))
    } else {
        Ok(None)
    }
}
