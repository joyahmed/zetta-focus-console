//! Zetta Focus Engine - Main entry point
//!
//! This module provides the core timer functionality with support for:
//! - Multiple focus profiles (seasons)
//! - Ambient sound playback
//! - Session tracking and statistics
//! - Strict Mode, custom profiles and runtime overrides

// Re-export commands from crate root
pub use crate::commands::{
    execute_command, get_state, get_theme, set_theme, set_total_sessions, tick_system_stats,
    tick_timer,
};

use crate::sound::SoundManager;
use crate::state::{AppState as AppStateType, AppStateExt};
use std::sync::Mutex;
use sysinfo::System;

/// Engine state that holds all application state
pub struct EngineState {
    pub app_state: Mutex<AppStateType>,
    pub sound_manager: Mutex<SoundManager>,
    /// Kept alive between ticks rather than rebuilt each time. `System::new_all()`
    /// allocates a snapshot of every process, disk and network on the machine;
    /// doing that every five seconds to read two numbers is the single largest
    /// source of allocation churn in the app. Holding one also makes CPU usage
    /// *correct*: sysinfo reports it as a delta between two refreshes, so a
    /// freshly built System always reports zero.
    pub system: Mutex<System>,
}

impl EngineState {
    pub fn new() -> Self {
        let mut app_state = AppStateType::new();
        app_state.load_preferences();

        // Prime the CPU probe. sysinfo derives CPU usage from the delta between
        // two refreshes, so without a first reading here the first tick would
        // report 0% for both the system and the app.
        let mut system = System::new();
        system.refresh_cpu_usage();

        Self {
            app_state: Mutex::new(app_state),
            sound_manager: Mutex::new(SoundManager::new()),
            system: Mutex::new(system),
        }
    }
}

impl Default for EngineState {
    fn default() -> Self {
        Self::new()
    }
}
