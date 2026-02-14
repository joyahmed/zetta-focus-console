//! Settings module - Settings and license commands

use crate::storage::load_license;
use crate::types::{LicenseState, StrictModeState, StateEvent, TimerStatus};
use crate::EngineState;
use tauri::{AppHandle, Emitter, State};

#[tauri::command]
pub fn get_license(state: State<EngineState>) -> Result<LicenseState, String> {
    let license = state.license_state.lock().map_err(|e| e.to_string())?;
    Ok(license.clone())
}

#[tauri::command]
pub fn activate_strict_mode(
    state: State<EngineState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    let license = state.license_state.lock().map_err(|e| e.to_string())?;

    if !license.is_pro() {
        return Err(
            "Strict Mode is a Pro feature. Please upgrade to Pro or Founder edition.".to_string(),
        );
    }
    drop(license);

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
    let license = state.license_state.lock().map_err(|e| e.to_string())?;

    if !license.is_pro() {
        return Err("Strict Mode is a Pro feature.".to_string());
    }
    drop(license);

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
    let license = state.license_state.lock().map_err(|e| e.to_string())?;

    if !license.is_pro() {
        return Ok(None);
    }
    drop(license);

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
