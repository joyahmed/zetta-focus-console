//! Commands module - Tauri commands and command processing

mod parser;
mod profile;
mod timer;

pub use timer::{
    execute_command, get_state, get_theme, set_theme, set_total_sessions, tick_system_stats,
    tick_timer,
};
