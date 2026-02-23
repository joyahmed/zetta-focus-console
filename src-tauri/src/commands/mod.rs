//! Commands module - Tauri commands and command processing

mod parser;
mod profile;
mod settings;
mod sound;
mod stats;
mod timer;

pub use parser::{format_time, parse_command_with_quotes, parse_duration};
pub use timer::{
    execute_command, get_state, get_theme, process_command, set_theme, set_total_sessions,
    tick_system_stats, tick_timer,
};

pub use settings::{
    activate_key, activate_strict_mode, can_create_profile, check_strict_mode_failure,
    clear_debug_license_override, clear_license_storage, deactivate_strict_mode, get_license,
    get_trial_days_remaining, get_trial_status, is_pro, set_debug_license_override,
};
