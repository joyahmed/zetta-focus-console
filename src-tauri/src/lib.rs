mod commands;
mod engine;
mod sound;
mod storage;
mod types;

use engine::{
    execute_command, get_state, get_theme, set_theme, tick_system_stats, tick_timer, EngineState,
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
            tick_system_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
