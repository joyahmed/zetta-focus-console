//! Zetta Focus Engine - Main entry point
//!
//! This module provides the core timer functionality with support for:
//! - Multiple focus profiles (seasons)
//! - Ambient sound playback
//! - Session tracking and statistics
//! - Pro features (Strict Mode, custom profiles, runtime overrides)

// Re-export modules from crate root
pub use crate::commands::{
    activate_key, activate_strict_mode, can_create_profile, check_strict_mode_failure,
    clear_debug_license_override, clear_license_storage, deactivate_strict_mode, execute_command,
    format_time, get_license, get_state, get_theme, get_trial_days_remaining, get_trial_status,
    is_pro, parse_command_with_quotes, parse_duration, process_command, set_debug_license_override,
    set_theme, tick_system_stats, tick_timer,
};

// Re-export types from crate root
pub use crate::types::{
    AppState, AppStats, BackgroundType, LicenseState, MotionIntensity, Profile, Season,
    SessionOverride, SessionType, SoundState, Stats, StrictModeState, SystemStats, TimerState,
    TimerStatus,
};

// Re-export license functions
pub use crate::license::{is_pro_enabled, LicenseManager};

// Import from crate root
use crate::license::get_license_state;
use crate::sound::SoundManager;
use crate::types::{AppState as AppStateType, AppStateExt};
use std::sync::Mutex;

/// Engine state that holds all application state
pub struct EngineState {
    pub app_state: Mutex<AppStateType>,
    pub sound_manager: Mutex<SoundManager>,
    pub license_manager: Mutex<LicenseManager>,
}

impl EngineState {
    pub fn new() -> Self {
        let mut app_state = AppStateType::new();
        app_state.load_preferences();

        // Load license state using LicenseManager
        let license_manager = LicenseManager::new();

        Self {
            app_state: Mutex::new(app_state),
            sound_manager: Mutex::new(SoundManager::new()),
            license_manager: Mutex::new(license_manager),
        }
    }
}
