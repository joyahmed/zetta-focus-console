//! Timer module - Timer-related commands and processing

use super::parser::{format_time, parse_command_with_quotes, parse_duration};
use crate::sound::get_sound_data;
use crate::types::{
    AppState, AppStateExt, SessionOverride, SessionType, StateEvent, Stats, StrictModeState,
    TimerState, TimerStatus,
};
use crate::EngineState;
use sysinfo::System;
use tauri::{AppHandle, Emitter, State};

// ============================================================================
// TAURI COMMANDS
// ============================================================================

#[tauri::command]
pub fn get_state(state: State<EngineState>) -> Result<AppState, String> {
    let app_state = state.app_state.lock().map_err(|e| e.to_string())?;
    Ok(app_state.clone())
}

#[tauri::command]
pub fn get_theme(state: State<EngineState>) -> Result<String, String> {
    let app_state = state.app_state.lock().map_err(|e| e.to_string())?;
    Ok(app_state.theme.clone())
}

#[tauri::command]
pub fn set_theme(
    theme: String,
    state: State<EngineState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    let valid_themes = ["dark", "light", "system"];
    if !valid_themes.contains(&theme.as_str()) {
        return Err("Invalid theme. Use: dark, light, or system".to_string());
    }

    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;
    app_state.theme = theme.clone();
    let _ = app_state.save_preferences();

    let _ = app_handle.emit(
        "state-updated",
        StateEvent {
            state: app_state.clone(),
        },
    );

    Ok(format!("Theme set to {}", theme))
}

#[tauri::command]
pub fn execute_command(
    command: String,
    state: State<EngineState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    // Parse command while preserving case for quoted strings
    let parts: Vec<String> = parse_command_with_quotes(&command);
    let cmd = parts.first().map(|s| s.to_lowercase()).unwrap_or_default();
    let args: Vec<&str> = parts[1..].iter().map(|s| s.as_str()).collect();

    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;
    let mut sound_manager = state.sound_manager.lock().map_err(|e| e.to_string())?;
    let license_manager = state.license_manager.lock().map_err(|e| e.to_string())?;
    let is_pro = license_manager.is_pro_enabled();

    let result = process_command(&mut app_state, &mut sound_manager, &cmd, &args, is_pro);

    // Save preferences after command execution (only for preference-modifying commands)
    let should_save = matches!(
        cmd.as_str(),
        "devmode" | "ambience" | "sound" | "profile" | "background" | "reset" | "theme"
    );
    if should_save {
        let _ = app_state.save_preferences();
    }

    let _ = app_handle.emit(
        "state-updated",
        StateEvent {
            state: app_state.clone(),
        },
    );

    Ok(result)
}

// ============================================================================
// COMMAND PROCESSING
// ============================================================================

pub fn process_command(
    app_state: &mut AppState,
    sound_manager: &mut crate::sound::SoundManager,
    cmd: &str,
    args: &[&str],
    is_pro: bool,
) -> String {
    // Show Pro features in help if user has Pro
    let pro_features = if is_pro {
        "
 🔵 Pro Commands:
   strict on             - Enable Strict Mode (commitment mode)
   strict off            - Disable Strict Mode (when idle)
   timer [duration]      - Runtime override (Pro)
   break [duration]     - Runtime override (Pro)
   loop [count]         - Runtime override (Pro)
   profile create        - Create custom profile (Pro)
   profile edit [id]     - Edit custom profile (Pro)
   profile duplicate     - Duplicate profile (Pro)
   devmode on/off       - Developer diagnostics (Pro)
   engine state         - Engine state inspection (Pro)
   engine reset         - Reset engine (Pro)
   app usage            - App diagnostics (Pro)"
    } else {
        "
 🔵 Pro Commands (requires Pro license):
   strict on/off        - Commitment mode (Pro)
   timer/break/loop     - Runtime overrides (Pro)
   profile create/edit  - Custom profiles (Pro)
   devmode              - Developer diagnostics (Pro)

   Upgrade to Pro to unlock these features."
    };

    match cmd {
        "help" => help_command(pro_features),

        "focus" => focus_command(args, app_state, sound_manager),

        "strict" => strict_command(args, app_state, is_pro),

        "timer" => timer_override_command(args, app_state, is_pro),

        "break" => break_override_command(args, app_state, is_pro),

        "loop" => loop_override_command(args, app_state, is_pro),

        "start" => start_command(app_state, sound_manager),

        "stop" => stop_command(app_state, sound_manager),

        "override" => override_command(args, app_state),

        "status" => status_command(app_state),

        "pause" => pause_command(app_state, sound_manager),

        "resume" => resume_command(app_state, sound_manager),

        "profile" => {
            crate::commands::profile::profile_command(args, app_state, sound_manager, is_pro)
        }

        "season" => season_command(args, app_state),

        "config" => config_command(args, app_state),

        "stats" => stats_command(app_state),

        "devmode" => devmode_command(args, app_state, is_pro),

        "ambience" => ambience_command(args, app_state),

        "background" => background_command(args, app_state),

        "reset" => reset_command(app_state, sound_manager),

        "theme" => theme_command(args, app_state),

        "engine" => engine_command(args, app_state, is_pro),

        "app" => app_command(args, app_state, is_pro),

        "system" | "sysinfo" => system_command(),

        "memory" => memory_command(),

        "cpu" => cpu_command(),

        "sound" => sound_command(args, app_state, sound_manager),

        "clear" => "__CLEAR__".to_string(),

        "" => String::new(),

        _ => format!(
            "Error: Unknown command \"{}\". Type \"help\" for available commands.",
            cmd
        ),
    }
}

// ============================================================================
// COMMAND HANDLERS
// ============================================================================

fn help_command(pro_features: &str) -> String {
    format!(
        "Available commands:
   start                  - Start session (uses override if set, else profile defaults)
   stop                   - Stop current session (override preserved)
   pause                  - Pause current session
   resume                 - Resume paused session
   status                 - Show current session status
   override clear         - Clear session override
   profile list           - List all available profiles
   profile switch [id]    - Switch to a profile
   season [name]         - Change season (spring/summer/autumn/winter)
   config show           - Show current configuration
   stats                 - Show detailed statistics
   ambience on/off       - Toggle ambient visuals
   sound play            - Play ambient sound
   sound stop            - Stop ambient sound
   sound volume [0-100]  - Set volume level
   sound mute            - Toggle mute
   system                - Show system information
   memory                - Show memory usage
   cpu                   - Show CPU usage
   theme [mode]          - Set theme (dark, light, system)
   clear                 - Clear terminal
   help                  - Show this help message{}",
        pro_features
    )
}

fn focus_command(
    args: &[&str],
    app_state: &mut AppState,
    sound_manager: &mut crate::sound::SoundManager,
) -> String {
    match args.first() {
        Some(&"start") => {
            let minutes = args.get(1).and_then(|m| m.parse().ok()).unwrap_or(25);
            if minutes <= 0 {
                return "Error: Invalid duration. Usage: focus start [minutes]".to_string();
            }
            let total_seconds = minutes * 60;
            app_state.timer = TimerState {
                remaining_seconds: total_seconds,
                total_seconds,
                status: TimerStatus::Running,
                session_type: SessionType::Focus,
            };
            if !app_state.sound_state.is_muted && !app_state.sound_state.is_playing {
                let sound_file = &app_state.active_profile.sound_file;
                let sound_data: &'static [u8] = get_sound_data(sound_file);
                app_state.sound_state.current_sound = Some(sound_file.clone());
                app_state.sound_state.is_playing = true;
                app_state.sound_state.volume = app_state.active_profile.default_volume;
                let _ = sound_manager.play(sound_data, app_state.sound_state.volume);
            }
            format!("Starting focus session for {} minutes...", minutes)
        }
        Some(&"stop") => {
            if app_state.timer.status == TimerStatus::Idle {
                return "Error: No active session to stop.".to_string();
            }
            if app_state.sound_state.is_playing {
                sound_manager.stop();
                app_state.sound_state.is_playing = false;
                app_state.sound_state.current_sound = None;
            }
            app_state.timer.status = TimerStatus::Idle;
            app_state.timer.remaining_seconds = app_state.active_profile.focus_duration;
            "Focus session stopped.".to_string()
        }
        Some(&"pause") => {
            if app_state.timer.status != TimerStatus::Running {
                return "Error: No running session to pause.".to_string();
            }
            if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
                sound_manager.pause();
            }
            app_state.timer.status = TimerStatus::Paused;
            "Focus session paused.".to_string()
        }
        Some(&"resume") => {
            if app_state.timer.status != TimerStatus::Paused {
                return "Error: No paused session to resume.".to_string();
            }
            if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
                sound_manager.resume();
            }
            app_state.timer.status = TimerStatus::Running;
            "Focus session resumed.".to_string()
        }
        _ => "Error: Unknown focus command. Usage: focus start [minutes] | stop | pause | resume"
            .to_string(),
    }
}

fn strict_command(args: &[&str], app_state: &mut AppState, is_pro: bool) -> String {
    if !is_pro {
        return "Error: Strict Mode is a Pro feature. Upgrade to unlock unlimited access."
            .to_string();
    }

    match args.first() {
        Some(&"on") | Some(&"enable") => {
            if app_state.timer.status != TimerStatus::Idle {
                return "Error: Strict Mode can only be activated when timer is idle.".to_string();
            }

            app_state.strict_mode.is_active = true;
            app_state.strict_mode.was_force_closed = false;
            app_state.strict_mode.session_start_timestamp = Some(
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_secs() as i64,
            );

            "Strict Mode activated!\n\nWhen you start a session:\n  - Pause is disabled\n  - Stop is disabled\n  - Duration editing is disabled\n  - Force-close will mark session as FAILED\n\nType 'start' to begin your commitment session.".to_string()
        }
        Some(&"off") | Some(&"disable") => {
            if app_state.timer.status == TimerStatus::Running {
                return "Error: Cannot deactivate Strict Mode while session is running."
                    .to_string();
            }

            app_state.strict_mode = StrictModeState::default();

            "Strict Mode deactivated.".to_string()
        }
        _ => {
            let status = if app_state.strict_mode.is_active {
                "ACTIVE - Session cannot be paused or stopped"
            } else {
                "INACTIVE - Use 'strict on' to enable"
            };
            format!("Strict Mode: {}", status)
        }
    }
}

fn timer_override_command(args: &[&str], app_state: &mut AppState, is_pro: bool) -> String {
    if !is_pro {
        return "Error: Runtime overrides are a Pro feature. Upgrade to unlock unlimited access."
            .to_string();
    }

    if app_state.strict_mode.is_active && app_state.timer.status == TimerStatus::Running {
        return "Cannot modify duration while Strict Mode is active.".to_string();
    }

    if app_state.timer.status == TimerStatus::Running {
        return "Stop current session before applying override.".to_string();
    }

    if let Some(duration_str) = args.first() {
        match parse_duration(duration_str) {
            Ok(seconds) => {
                if seconds < 5 || seconds > 10800 {
                    return "Error: Focus duration must be between 5 seconds and 180 minutes."
                        .to_string();
                }
                let override_state = app_state
                    .session_override
                    .get_or_insert(SessionOverride::new());
                override_state.focus_duration = Some(seconds);
                if let Err(e) = override_state.validate() {
                    return format!("Error: {}", e);
                }

                build_override_message(override_state)
            }
            Err(e) => format!("Error: {}", e),
        }
    } else {
        "Error: Missing duration. Usage: timer 1m | timer 30s | timer 2m".to_string()
    }
}

fn break_override_command(args: &[&str], app_state: &mut AppState, is_pro: bool) -> String {
    if !is_pro {
        return "Error: Runtime overrides are a Pro feature. Upgrade to unlock unlimited access."
            .to_string();
    }

    if app_state.strict_mode.is_active && app_state.timer.status == TimerStatus::Running {
        return "Cannot modify duration while Strict Mode is active.".to_string();
    }

    if app_state.timer.status == TimerStatus::Running {
        return "Stop current session before applying override.".to_string();
    }

    if let Some(duration_str) = args.first() {
        match parse_duration(duration_str) {
            Ok(seconds) => {
                if seconds < 1 || seconds > 3600 {
                    return "Error: Break duration must be between 1 second and 60 minutes."
                        .to_string();
                }
                let override_state = app_state
                    .session_override
                    .get_or_insert(SessionOverride::new());
                override_state.break_duration = Some(seconds);
                if let Err(e) = override_state.validate() {
                    return format!("Error: {}", e);
                }

                build_override_message(override_state)
            }
            Err(e) => format!("Error: {}", e),
        }
    } else {
        "Error: Missing duration. Usage: break 30s | break 5m".to_string()
    }
}

fn loop_override_command(args: &[&str], app_state: &mut AppState, is_pro: bool) -> String {
    if !is_pro {
        return "Error: Runtime overrides are a Pro feature. Upgrade to unlock unlimited access."
            .to_string();
    }

    if app_state.strict_mode.is_active && app_state.timer.status == TimerStatus::Running {
        return "Cannot modify loop count while Strict Mode is active.".to_string();
    }

    if app_state.timer.status == TimerStatus::Running {
        return "Stop current session before applying override.".to_string();
    }

    if let Some(count_str) = args.first() {
        match count_str.parse::<u32>() {
            Ok(count) => {
                if count < 1 || count > 100 {
                    return "Error: Loop count must be between 1 and 100.".to_string();
                }
                let override_state = app_state
                    .session_override
                    .get_or_insert(SessionOverride::new());
                override_state.loop_count = Some(count);

                build_override_message(override_state)
            }
            Err(_) => "Error: Invalid loop count. Must be a number between 1 and 100.".to_string(),
        }
    } else {
        "Error: Missing count. Usage: loop 4".to_string()
    }
}

fn build_override_message(override_state: &SessionOverride) -> String {
    let mut info = vec![];
    if let Some(f) = override_state.focus_duration {
        info.push(format!("Focus: {}s", f));
    }
    if let Some(b) = override_state.break_duration {
        info.push(format!("Break: {}s", b));
    }
    if let Some(l) = override_state.loop_count {
        info.push(format!("Loops: {}", l));
    }

    format!(
        "Override set:\n  - {}\n\nRun `start` to begin session.",
        info.join("\n  - ")
    )
}

fn start_command(
    app_state: &mut AppState,
    sound_manager: &mut crate::sound::SoundManager,
) -> String {
    if app_state.timer.status == TimerStatus::Running {
        return "Session already running. Use `stop` before restarting.".to_string();
    }

    if app_state.strict_mode.is_active {
        app_state.strict_mode.session_start_timestamp = Some(
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs() as i64,
        );
    }

    let focus_seconds = app_state
        .session_override
        .as_ref()
        .and_then(|o| o.focus_duration)
        .unwrap_or(app_state.active_profile.focus_duration);

    app_state.timer = TimerState {
        remaining_seconds: focus_seconds,
        total_seconds: focus_seconds,
        status: TimerStatus::Running,
        session_type: SessionType::Focus,
    };

    if !app_state.sound_state.is_muted && !app_state.sound_state.is_playing {
        let sound_file = &app_state.active_profile.sound_file;
        let sound_data: &'static [u8] = get_sound_data(sound_file);
        app_state.sound_state.current_sound = Some(sound_file.clone());
        app_state.sound_state.is_playing = true;
        app_state.sound_state.volume = app_state.active_profile.default_volume;
        let _ = sound_manager.play(sound_data, app_state.sound_state.volume);
    }

    let override_info = if let Some(ref override_state) = app_state.session_override {
        if override_state.is_active() {
            let mut info = vec![];
            if let Some(f) = override_state.focus_duration {
                info.push(format!("focus: {}s", f));
            }
            if let Some(b) = override_state.break_duration {
                info.push(format!("break: {}s", b));
            }
            if let Some(l) = override_state.loop_count {
                info.push(format!("loops: {}", l));
            }
            format!(" [Override: {}]", info.join(", "))
        } else {
            String::new()
        }
    } else {
        String::new()
    };

    format!("Starting session...{}", override_info)
}

fn stop_command(
    app_state: &mut AppState,
    sound_manager: &mut crate::sound::SoundManager,
) -> String {
    if app_state.timer.status == TimerStatus::Idle {
        return "Error: No active session to stop.".to_string();
    }

    if app_state.strict_mode.is_active {
        app_state.strict_mode.was_force_closed = true;
        app_state.strict_mode.is_active = false;

        if app_state.sound_state.is_playing {
            sound_manager.stop();
            app_state.sound_state.is_playing = false;
            app_state.sound_state.current_sound = None;
        }
        app_state.timer.status = TimerStatus::Idle;
        app_state.timer.remaining_seconds = app_state.active_profile.focus_duration;

        return "Strict Mode session marked as FAILED (manually stopped). Session reset."
            .to_string();
    }

    if app_state.sound_state.is_playing {
        sound_manager.stop();
        app_state.sound_state.is_playing = false;
        app_state.sound_state.current_sound = None;
    }
    app_state.timer.status = TimerStatus::Idle;
    app_state.timer.remaining_seconds = app_state.active_profile.focus_duration;

    let override_msg = if app_state.session_override.is_some() {
        " Override preserved."
    } else {
        ""
    };
    format!("Session stopped.{}", override_msg)
}

fn override_command(args: &[&str], app_state: &mut AppState) -> String {
    match args.first() {
        Some(&"clear") => {
            app_state.session_override = None;
            "Override cleared.".to_string()
        }
        _ => {
            if let Some(ref override_state) = app_state.session_override {
                if override_state.is_active() {
                    let mut info = vec![];
                    if let Some(f) = override_state.focus_duration {
                        info.push(format!("Focus: {}s", f));
                    }
                    if let Some(b) = override_state.break_duration {
                        info.push(format!("Break: {}s", b));
                    }
                    if let Some(l) = override_state.loop_count {
                        info.push(format!("Loops: {}", l));
                    }
                    format!("Current override:\n  - {}", info.join("\n  - "))
                } else {
                    "No override active.".to_string()
                }
            } else {
                "No override active.".to_string()
            }
        }
    }
}

fn status_command(app_state: &mut AppState) -> String {
    let timer_status = match app_state.timer.status {
        TimerStatus::Idle => "Idle",
        TimerStatus::Running => "Running",
        TimerStatus::Paused => "Paused",
        TimerStatus::Completed => "Completed",
    };

    let mut info = vec![
        format!(
            "Timer: {} ({})",
            timer_status,
            format_time(app_state.timer.remaining_seconds)
        ),
        format!("Profile: {}", app_state.active_profile.name),
    ];

    if app_state.strict_mode.is_active {
        info.push("Strict Mode: ACTIVE (cannot pause/stop)".to_string());
    }

    if let Some(ref override_state) = app_state.session_override {
        if override_state.is_active() {
            let mut override_info = vec![];
            if let Some(f) = override_state.focus_duration {
                override_info.push(format!("focus {}s", f));
            }
            if let Some(b) = override_state.break_duration {
                override_info.push(format!("break {}s", b));
            }
            if let Some(l) = override_state.loop_count {
                override_info.push(format!("{} loops", l));
            }
            info.push(format!("Override: {}", override_info.join(", ")));
        }
    }

    info.join("\n")
}

fn pause_command(
    app_state: &mut AppState,
    sound_manager: &mut crate::sound::SoundManager,
) -> String {
    if app_state.timer.status != TimerStatus::Running {
        return "Error: No running session to pause.".to_string();
    }

    if app_state.strict_mode.is_active {
        return "Error: Pause is disabled during Strict Mode. Session must run to completion."
            .to_string();
    }

    if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
        sound_manager.pause();
    }
    app_state.timer.status = TimerStatus::Paused;
    "Session paused.".to_string()
}

fn resume_command(
    app_state: &mut AppState,
    sound_manager: &mut crate::sound::SoundManager,
) -> String {
    if app_state.timer.status != TimerStatus::Paused {
        return "Error: No paused session to resume.".to_string();
    }
    if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
        sound_manager.resume();
    }
    app_state.timer.status = TimerStatus::Running;
    "Session resumed.".to_string()
}

fn season_command(args: &[&str], app_state: &mut AppState) -> String {
    match args.first() {
        None => format!("Current season: {:?}", app_state.active_profile.season),
        Some(&"spring") => {
            app_state.active_profile.season = crate::types::Season::Spring;
            app_state.active_profile.glow_color = "#34d399".to_string();
            "Season set to: spring".to_string()
        }
        Some(&"summer") => {
            app_state.active_profile.season = crate::types::Season::Summer;
            app_state.active_profile.glow_color = "#fbbf24".to_string();
            "Season set to: summer".to_string()
        }
        Some(&"autumn") => {
            app_state.active_profile.season = crate::types::Season::Autumn;
            app_state.active_profile.glow_color = "#f97316".to_string();
            "Season set to: autumn".to_string()
        }
        Some(&"winter") => {
            app_state.active_profile.season = crate::types::Season::Winter;
            app_state.active_profile.glow_color = "#60a5fa".to_string();
            "Season set to: winter".to_string()
        }
        _ => "Error: Invalid season. Choose from: spring, summer, autumn, winter".to_string(),
    }
}

fn config_command(args: &[&str], app_state: &mut AppState) -> String {
    match args.first() {
        Some(&"show") => format!(
            "Current Configuration:\n  Profile: {}\n  Season: {:?}\n  Motion: {:?}\n  Background: {:?}\n  Focus: {} min\n  Short Break: {} min\n  Long Break: {} min",
            app_state.active_profile.name,
            app_state.active_profile.season,
            app_state.active_profile.motion_intensity,
            app_state.active_profile.background_type,
            app_state.active_profile.focus_duration / 60,
            app_state.active_profile.short_break_duration / 60,
            app_state.active_profile.long_break_duration / 60
        ),
        _ => "Error: Unknown config command. Usage: config show".to_string(),
    }
}

fn stats_command(app_state: &mut AppState) -> String {
    format!(
        "Statistics:\n  Sessions Today: {}\n  Total Focus: {} minutes\n  Current Streak: {} days\n  Last Session: {} minutes",
        app_state.stats.sessions_today,
        app_state.stats.total_focus_minutes,
        app_state.stats.current_streak,
        app_state.stats.last_session_duration
    )
}

fn devmode_command(args: &[&str], app_state: &mut AppState, is_pro: bool) -> String {
    if !is_pro {
        return "Error: Developer mode is a Pro feature. Upgrade to unlock unlimited access."
            .to_string();
    }

    match args.first() {
        Some(&"on") => {
            app_state.dev_mode = true;
            "Developer mode enabled.".to_string()
        }
        Some(&"off") => {
            app_state.dev_mode = false;
            "Developer mode disabled.".to_string()
        }
        _ => "Error: Usage: devmode on | off".to_string(),
    }
}

fn ambience_command(args: &[&str], app_state: &mut AppState) -> String {
    match args.first() {
        Some(&"on") => {
            app_state.ambience_enabled = true;
            "Ambience enabled.".to_string()
        }
        Some(&"off") => {
            app_state.ambience_enabled = false;
            "Ambience disabled.".to_string()
        }
        _ => format!(
            "Ambience: {}",
            if app_state.ambience_enabled {
                "enabled"
            } else {
                "disabled"
            }
        ),
    }
}

fn background_command(args: &[&str], app_state: &mut AppState) -> String {
    match args.first() {
        Some(&"gradient") => {
            app_state.active_profile.background_type = crate::types::BackgroundType::Gradient;
            "Background set to: gradient".to_string()
        }
        Some(&"particles") => {
            app_state.active_profile.background_type = crate::types::BackgroundType::Particles;
            "Background set to: particles".to_string()
        }
        _ => format!("Background: {:?}", app_state.active_profile.background_type),
    }
}

fn reset_command(
    app_state: &mut AppState,
    sound_manager: &mut crate::sound::SoundManager,
) -> String {
    app_state.timer = TimerState {
        remaining_seconds: 25 * 60,
        total_seconds: 25 * 60,
        status: TimerStatus::Idle,
        session_type: SessionType::Focus,
    };
    app_state.session_override = None;
    app_state.stats = Stats {
        sessions_today: 0,
        total_focus_minutes: 0,
        current_streak: 0,
        last_session_duration: 0,
    };
    app_state.dev_mode = false;
    app_state.ambience_enabled = true;
    app_state.sound_state.volume = 50;
    app_state.sound_state.is_muted = false;
    if app_state.sound_state.is_playing {
        let _ = sound_manager.stop();
        app_state.sound_state.is_playing = false;
        app_state.sound_state.current_sound = None;
    }
    if let Some(default_profile) = app_state.profiles.iter().find(|p| p.id == "winter-deep") {
        app_state.active_profile = default_profile.clone();
    }
    "Settings reset to defaults.".to_string()
}

fn theme_command(args: &[&str], app_state: &mut AppState) -> String {
    match args.first() {
        Some(&"dark") => {
            app_state.theme = "dark".to_string();
            "Theme set to dark.".to_string()
        }
        Some(&"light") => {
            app_state.theme = "light".to_string();
            "Theme set to light.".to_string()
        }
        Some(&"system") => {
            app_state.theme = "system".to_string();
            "Theme set to system.".to_string()
        }
        _ => format!(
            "Current theme: {}. Usage: theme dark|light|system",
            app_state.theme
        ),
    }
}

fn engine_command(args: &[&str], app_state: &mut AppState, is_pro: bool) -> String {
    if !is_pro {
        return "Error: Dev mode required. Run 'devmode on' first.".to_string();
    }
    match args.first() {
        Some(&"state") => format!(
            "Engine State:\n  Timer: {:?}\n  Remaining: {}s\n  Profile: {}\n  Override: {:?}\n  Dev Mode: {}\n  Ambience: {}",
            app_state.timer.status,
            app_state.timer.remaining_seconds,
            app_state.active_profile.name,
            app_state.session_override,
            app_state.dev_mode,
            app_state.ambience_enabled
        ),
        Some(&"reset") => {
            app_state.timer = TimerState {
                remaining_seconds: 25 * 60,
                total_seconds: 25 * 60,
                status: TimerStatus::Idle,
                session_type: SessionType::Focus,
            };
            app_state.session_override = None;
            app_state.stats = Stats {
                sessions_today: 0,
                total_focus_minutes: 0,
                current_streak: 0,
                last_session_duration: 0,
            };
            "Engine reset to defaults.".to_string()
        }
        _ => "Error: Usage: engine state | reset".to_string(),
    }
}

fn app_command(args: &[&str], app_state: &mut AppState, is_pro: bool) -> String {
    if !is_pro {
        return "Error: Dev mode required. Run 'devmode on' first.".to_string();
    }
    match args.first() {
        Some(&"usage") => format!(
            "App Usage:\n  CPU: {:.1}%\n  Memory: {} MB",
            app_state.app_stats.cpu_usage, app_state.app_stats.memory_used
        ),
        _ => "Error: Usage: app usage".to_string(),
    }
}

fn system_command() -> String {
    let mut sys = System::new_all();
    sys.refresh_all();
    format!(
        "System Information:\n  OS: {}\n  Kernel: {}\n  Hostname: {}\n  CPU Cores: {}\n  Total Memory: {} MB\n  Used Memory: {} MB",
        System::name().unwrap_or_else(|| "Unknown".to_string()),
        System::kernel_version().unwrap_or_else(|| "Unknown".to_string()),
        System::host_name().unwrap_or_else(|| "Unknown".to_string()),
        sys.cpus().len(),
        sys.total_memory() / 1024 / 1024,
        sys.used_memory() / 1024 / 1024
    )
}

fn memory_command() -> String {
    let mut sys = System::new_all();
    sys.refresh_memory();
    format!(
        "Memory Usage:\n  Total: {} MB\n  Used: {} MB\n  Available: {} MB\n  Usage: {:.1}%",
        sys.total_memory() / 1024 / 1024,
        sys.used_memory() / 1024 / 1024,
        sys.available_memory() / 1024 / 1024,
        (sys.used_memory() as f64 / sys.total_memory() as f64) * 100.0
    )
}

fn cpu_command() -> String {
    let mut sys = System::new_all();
    sys.refresh_cpu_all();
    let cpus = sys.cpus();
    let avg_usage: f32 = cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpus.len() as f32;
    format!(
        "CPU Usage:\n  Cores: {}\n  Average Usage: {:.1}%\n  Per Core:{}",
        cpus.len(),
        avg_usage,
        cpus.iter()
            .enumerate()
            .map(|(i, c)| format!("\n    Core {}: {:.1}%", i, c.cpu_usage()))
            .collect::<String>()
    )
}

fn sound_command(
    args: &[&str],
    app_state: &mut AppState,
    sound_manager: &mut crate::sound::SoundManager,
) -> String {
    match args.first() {
        Some(&"play") => {
            let sound_file = &app_state.active_profile.sound_file;
            app_state.sound_state.current_sound = Some(sound_file.clone());
            app_state.sound_state.is_playing = true;
            app_state.sound_state.volume = app_state.active_profile.default_volume;

            let sound_data: &[u8] = get_sound_data(sound_file);

            match sound_manager.play(sound_data, app_state.sound_state.volume) {
                Ok(_) => format!("Playing ambient sound: {}", sound_file),
                Err(e) => {
                    app_state.sound_state.is_playing = false;
                    format!("Warning: Sound system unavailable: {}. Add sound files to src-tauri/sounds/", e)
                }
            }
        }
        Some(&"stop") => {
            sound_manager.stop();
            app_state.sound_state.is_playing = false;
            "Ambient sound stopped.".to_string()
        }
        Some(&"volume") => {
            if let Some(vol_str) = args.get(1) {
                if let Ok(vol) = vol_str.parse::<u8>() {
                    let vol = vol.min(100);
                    app_state.sound_state.volume = vol;
                    sound_manager.set_volume(vol);
                    return format!("Volume set to {}%", vol);
                } else {
                    return "Error: Invalid volume value. Use 0-100".to_string();
                }
            }
            format!("Current volume: {}%", app_state.sound_state.volume)
        }
        Some(&"mute") => {
            app_state.sound_state.is_muted = !app_state.sound_state.is_muted;
            if app_state.sound_state.is_muted {
                sound_manager.pause();
                "Sound muted.".to_string()
            } else {
                sound_manager.resume();
                "Sound unmuted.".to_string()
            }
        }
        _ => format!(
            "Sound Status: {} | Volume: {}% | Muted: {}",
            if app_state.sound_state.is_playing {
                "Playing"
            } else {
                "Stopped"
            },
            app_state.sound_state.volume,
            app_state.sound_state.is_muted
        ),
    }
}

// ============================================================================
// TIMER AND STATS COMMANDS
// ============================================================================

#[tauri::command]
pub fn tick_timer(state: State<EngineState>, app_handle: AppHandle) -> Result<(), String> {
    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;

    if app_state.timer.status == TimerStatus::Running && app_state.timer.remaining_seconds > 0 {
        app_state.timer.remaining_seconds -= 1;

        if app_state.timer.remaining_seconds == 0 {
            app_state.timer.status = TimerStatus::Completed;
            app_state.stats.sessions_today += 1;
            app_state.stats.total_focus_minutes += app_state.timer.total_seconds / 60;
            app_state.stats.last_session_duration = app_state.timer.total_seconds / 60;

            let strict_mode_was_active = app_state.strict_mode.is_active;
            let strict_mode_completed_successfully = if strict_mode_was_active {
                app_state.strict_mode = StrictModeState::default();
                true
            } else {
                false
            };

            let total_focus = app_state.timer.total_seconds;
            let focus_mins = total_focus / 60;
            let focus_secs = total_focus % 60;

            let mut completion_msg = format!(
                "Session Complete!\n  Focus Time: {}m {}s\n  Profile: {}\n  Sessions Today: {}",
                focus_mins,
                focus_secs,
                app_state.active_profile.name,
                app_state.stats.sessions_today
            );

            if strict_mode_completed_successfully {
                completion_msg.push_str("\n  Strict Mode: COMPLETED ✓");
            }

            let _ = app_handle.emit("session-complete", completion_msg);

            app_state.session_override = None;
        }

        let _ = app_handle.emit(
            "state-updated",
            StateEvent {
                state: app_state.clone(),
            },
        );
    }

    Ok(())
}

#[tauri::command]
pub fn tick_system_stats(state: State<EngineState>, app_handle: AppHandle) -> Result<(), String> {
    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;

    let mut sys = System::new_all();
    sys.refresh_all();
    let cpus = sys.cpus();

    let cpu_usage = if !cpus.is_empty() {
        cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpus.len() as f32
    } else {
        0.0
    };

    app_state.system_stats = crate::types::SystemStats {
        cpu_usage: cpu_usage.min(100.0),
        memory_used: sys.used_memory() / 1024 / 1024,
        memory_total: sys.total_memory() / 1024 / 1024,
    };

    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let pid = sysinfo::Pid::from_u32(std::process::id());
    if let Some(process) = sys.process(pid) {
        let memory_used = process.memory() / 1024 / 1024;
        let cpu_percent = process.cpu_usage();

        app_state.app_stats = crate::types::AppStats {
            cpu_usage: cpu_percent.min(100.0),
            memory_used,
        };
    }

    let _ = app_handle.emit(
        "state-updated",
        StateEvent {
            state: app_state.clone(),
        },
    );

    Ok(())
}
