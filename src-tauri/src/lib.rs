mod commands;
mod engine;
mod sound;
mod state;
mod storage;
mod types;

use engine::{
    execute_command, get_state, get_terminal_history, get_theme, import_terminal_history,
    push_terminal_history, set_theme, set_total_sessions, tick_timer, EngineState,
};

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

// ============================================================================
// GLOBAL SHORTCUTS AND TRAY SETUP
// ============================================================================

/// Setup global shortcuts for the app
fn setup_global_shortcuts(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Global shortcuts
    let toggle_window_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyH);
    let toggle_particles_shortcut = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyB);
    // Ctrl+H - Hide/Show window
    app.global_shortcut()
        .on_shortcut(toggle_window_shortcut, move |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        })?;

    // Ctrl+B - Toggle background particles
    let app_handle_particles = app.clone();
    app.global_shortcut().on_shortcut(
        toggle_particles_shortcut,
        move |_app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                let _ = app_handle_particles.emit("global-shortcut", "toggle_particles");
            }
        },
    )?;
    Ok(())
}

/// Setup system tray
fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let start_item = MenuItem::with_id(app, "start", "Start", true, None::<&str>)?;
    let stop_item = MenuItem::with_id(app, "stop", "Stop", true, None::<&str>)?;
    let pause_item = MenuItem::with_id(app, "pause", "Pause", true, None::<&str>)?;
    let resume_item = MenuItem::with_id(app, "resume", "Resume", true, None::<&str>)?;
    let settings_item = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &start_item,
            &stop_item,
            &pause_item,
            &resume_item,
            &settings_item,
            &quit_item,
        ],
    )?;

    let app_handle = app.clone();
    let _tray = TrayIconBuilder::with_id("main")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .tooltip("Zetta Focus Console - Idle")
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "start" => {
                let _ = app.emit("tray-action", "start");
            }
            "stop" => {
                let _ = app.emit("tray-action", "stop");
            }
            "pause" => {
                let _ = app.emit("tray-action", "pause");
            }
            "resume" => {
                let _ = app.emit("tray-action", "resume");
            }
            "settings" => {
                let _ = app.emit("tray-action", "settings");
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(move |tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(&app_handle)?;
    Ok(())
}

/// Update tray icon based on timer state
#[tauri::command]
fn update_tray_state(
    app_handle: AppHandle,
    status: String,
    session_type: String,
    strict_mode_active: Option<bool>,
) -> Result<(), String> {
    let is_strict = strict_mode_active.unwrap_or(false);

    let tooltip = match (status.as_str(), session_type.as_str(), is_strict) {
        ("running", "focus", true) => "Zetta Focus Console - Strict Mode",
        ("running", "focus", false) => "Zetta Focus Console - Focus",
        ("running", "short_break", _) | ("running", "long_break", _) => {
            "Zetta Focus Console - Break"
        }
        ("paused", _, _) => "Zetta Focus Console - Paused",
        ("completed", _, _) => "Zetta Focus Console - Completed",
        _ => "Zetta Focus Console - Idle",
    };

    if let Some(tray) = app_handle.tray_by_id("main") {
        let _ = tray.set_tooltip(Some(tooltip));

        // Note: Changing the actual tray icon color would require different icon assets
        // For now, we just update the tooltip to reflect strict mode
    }

    Ok(())
}

// ============================================================================
// AUTOSTART COMMANDS
// ============================================================================

/// Get the current autostart status
#[tauri::command]
fn get_autostart_enabled(app_handle: AppHandle) -> bool {
    use tauri_plugin_autostart::ManagerExt;

    let app = app_handle.autolaunch();
    app.is_enabled().unwrap_or(false)
}

/// Enable or disable autostart
#[tauri::command]
fn set_autostart_enabled(app_handle: AppHandle, enabled: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;

    let app = app_handle.autolaunch();
    if enabled {
        app.enable()
            .map_err(|e: tauri_plugin_autostart::Error| e.to_string())?;
    } else {
        app.disable()
            .map_err(|e: tauri_plugin_autostart::Error| e.to_string())?;
    }
    Ok(())
}

/// Get the start minimized preference - checks if app should start minimized
#[tauri::command]
fn get_start_minimized() -> bool {
    // Load preferences and check start_minimized
    let prefs = crate::storage::load_preferences();
    prefs.start_minimized
}

/// Set the start minimized preference
#[tauri::command]
fn set_start_minimized(enabled: bool) -> Result<(), String> {
    let mut prefs = crate::storage::load_preferences();
    prefs.start_minimized = enabled;
    crate::storage::save_preferences(&prefs).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .manage(EngineState::new())
        .invoke_handler(tauri::generate_handler![
            get_state,
            get_theme,
            set_theme,
            set_total_sessions,
            execute_command,
            tick_timer,
            // Tray commands
            update_tray_state,
            // Terminal history commands
            get_terminal_history,
            push_terminal_history,
            import_terminal_history,
            // Autostart commands
            get_autostart_enabled,
            set_autostart_enabled,
            get_start_minimized,
            set_start_minimized,
        ])
        .setup(|app| {
            // Check if app should start minimized based on preference
            let prefs = crate::storage::load_preferences();
            if prefs.start_minimized {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }

            // Setup global shortcuts
            if let Err(e) = setup_global_shortcuts(app.handle()) {
                eprintln!("[ERROR] Failed to setup global shortcuts: {}", e);
            }

            // Setup system tray
            if let Err(e) = setup_tray(app.handle()) {
                eprintln!("[ERROR] Failed to setup system tray: {}", e);
            }

            // Handle window close to minimize to tray
            let app_handle = app.handle().clone();
            if let Some(window) = app.get_webview_window("main") {
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Some(win) = app_handle.get_webview_window("main") {
                            let _ = win.hide();
                        }
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
