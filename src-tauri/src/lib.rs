mod commands;
mod engine;
mod license;
mod sound;
mod storage;
mod types;

use engine::{
    activate_key, execute_command, get_license, get_state, get_theme, is_pro,
    set_theme, tick_system_stats, tick_timer, get_trial_days_remaining, EngineState,
    set_debug_license_override, clear_debug_license_override, clear_license_storage,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(EngineState::new())
        .invoke_handler(tauri::generate_handler![
            get_state,
            get_theme,
            set_theme,
            execute_command,
            tick_timer,
            tick_system_stats,
            get_license,
            activate_key,
            is_pro,
            get_trial_days_remaining,
            set_debug_license_override,
            clear_debug_license_override,
            clear_license_storage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
