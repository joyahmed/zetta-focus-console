//! Zetta Focus Engine - Main entry point
//!
//! This module provides the core timer functionality with support for:
//! - Multiple focus profiles (seasons)
//! - Ambient sound playback
//! - Session tracking and statistics
//! - Pro features (Strict Mode, custom profiles, runtime overrides)

// Re-export modules from crate root
pub use crate::commands::{
    activate_strict_mode, check_strict_mode_failure, deactivate_strict_mode, execute_command,
    format_time, get_license, get_state, get_theme, parse_command_with_quotes, parse_duration,
    process_command, set_theme, tick_system_stats, tick_timer,
};

// Re-export types from crate root
pub use crate::types::{
    AppState, AppStats, BackgroundType, LicenseState, MotionIntensity, Profile, Season,
    SessionOverride, SessionType, SoundState, Stats, StrictModeState, SystemStats, TimerState,
    TimerStatus,
};

// Import from crate root
use crate::sound::SoundManager;
use crate::storage::load_license;
use crate::types::{AppState as AppStateType, AppStateExt};
use std::sync::Mutex;

/// Engine state that holds all application state
pub struct EngineState {
    pub app_state: Mutex<AppStateType>,
    pub sound_manager: Mutex<SoundManager>,
    pub license_state: Mutex<crate::types::LicenseState>,
}

impl EngineState {
    pub fn new() -> Self {
        let mut app_state = AppStateType::new();
        app_state.load_preferences();

        // Load license state
        let license_state = load_license();

        // Check if previous Strict Mode session was force-closed
        // If so, mark it as failed
        if license_state.is_pro() {
            // The license is Pro, so we can check for Strict Mode failure
            // This is handled when the app starts
        }

        Self {
            app_state: Mutex::new(app_state),
            sound_manager: Mutex::new(SoundManager::new()),
            license_state: Mutex::new(license_state),
        }
    }
}
