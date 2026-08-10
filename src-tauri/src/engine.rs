//! Zetta Focus Engine - Main entry point
//!
//! This module provides the core timer functionality with support for:
//! - Multiple focus profiles (seasons)
//! - Ambient sound playback
//! - Session tracking and statistics
//! - Strict Mode, custom profiles and runtime overrides

// Re-export commands from crate root
pub use crate::commands::{
    execute_command, get_state, get_terminal_history, get_theme, import_terminal_history,
    push_terminal_history, set_theme, set_total_sessions, tick_timer,
};

use crate::sound::SoundManager;
use crate::state::{AppState as AppStateType, AppStateExt};
use std::sync::Mutex;

/// Engine state that holds all application state
pub struct EngineState {
    pub app_state: Mutex<AppStateType>,
    pub sound_manager: Mutex<SoundManager>,
}

impl EngineState {
    pub fn new() -> Self {
        let mut app_state = AppStateType::new();
        app_state.load_preferences();

        Self {
            app_state: Mutex::new(app_state),
            sound_manager: Mutex::new(SoundManager::new()),
        }
    }
}

impl Default for EngineState {
    fn default() -> Self {
        Self::new()
    }
}
