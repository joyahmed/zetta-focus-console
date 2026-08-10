//! Timer module - Timer-related commands and processing

use super::parser::{format_time, parse_command_with_quotes, parse_duration};
use crate::sound::get_sound_data;
use crate::state::{AppState, AppStateExt, StateEvent};
use crate::types::{
    CurrentTask, SessionOverride, SessionType, Stats, StrictModeState, TaskCategory, TimerState,
    TimerStatus,
};
use crate::EngineState;
use sysinfo::System;
use tauri::{AppHandle, Emitter, State};

// ============================================================================
// TAURI COMMANDS
// ============================================================================

/// Hand the new state to everything that renders it.
///
/// The tray used to be told about the session by the frontend, which read the
/// state out of an event and posted it back to Rust — the one thing the app is
/// built not to do. It reads the same state directly now, and the two surfaces
/// cannot disagree because there is one call site for both.
fn publish(app_handle: &AppHandle, app_state: &AppState) {
    let _ = app_handle.emit(
        "state-updated",
        StateEvent {
            state: app_state.clone(),
        },
    );
    crate::tray::apply(app_handle, app_state);
}

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

    publish(&app_handle, &app_state);

    Ok(format!("Theme set to {}", theme))
}

#[tauri::command]
pub fn set_total_sessions(
    total_sessions: u32,
    state: State<EngineState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    if total_sessions < 1 || total_sessions > 20 {
        return Err("Total sessions must be between 1 and 20".to_string());
    }

    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;
    app_state.timer.total_sessions = total_sessions;
    // Reset current session to 1 if it exceeds the new total
    if app_state.timer.current_session > total_sessions {
        app_state.timer.current_session = 1;
    }

    publish(&app_handle, &app_state);

    Ok(format!("Total sessions set to {}", total_sessions))
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

    let result = process_command(&mut app_state, &mut sound_manager, &cmd, &args);

    // Save preferences after command execution (only for preference-modifying commands)
    let should_save = matches!(
        cmd.as_str(),
        "devmode"
            | "ambience"
            | "sound"
            | "profile"
            | "background"
            | "reset"
            | "theme"
            | "alarm"
            | "history"
    );
    if should_save {
        let _ = app_state.save_preferences();
    }

    publish(&app_handle, &app_state);

    Ok(result)
}

// ============================================================================
// TERMINAL HISTORY
// ============================================================================

/// How many commands the console remembers. Matches what the localStorage
/// version kept, and is a hundred lines rather than a hundred kilobytes.
const TERMINAL_HISTORY_LIMIT: usize = 100;

#[tauri::command]
pub fn get_terminal_history(state: State<EngineState>) -> Result<Vec<String>, String> {
    let app_state = state.app_state.lock().map_err(|e| e.to_string())?;
    Ok(app_state.terminal_history.clone())
}

/// Record a command the console actually ran.
///
/// Deliberately separate from `execute_command`: most calls to that come from
/// buttons and keyboard shortcuts rather than from typing, and a history full
/// of `sound mute` from the volume control would be useless to arrow back
/// through. The console decides what counts as a line it typed.
#[tauri::command]
pub fn push_terminal_history(command: String, state: State<EngineState>) -> Result<(), String> {
    let command = command.trim().to_string();
    if command.is_empty() {
        return Ok(());
    }

    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;

    // Running the same command twice in a row should not cost two entries;
    // every shell collapses that, and it is what makes arrowing back usable.
    if app_state.terminal_history.last() == Some(&command) {
        return Ok(());
    }

    app_state.terminal_history.push(command);
    let overflow = app_state
        .terminal_history
        .len()
        .saturating_sub(TERMINAL_HISTORY_LIMIT);
    if overflow > 0 {
        app_state.terminal_history.drain(..overflow);
    }

    app_state.save_preferences()
}

/// Adopt a history the console is holding from somewhere else.
///
/// This exists for one upgrade: history written to `localStorage` by an earlier
/// build, which the console hands over the first time it opens. It refuses to
/// overwrite a history that already has something in it, so a stale copy in the
/// webview cannot clobber the real one on disk.
#[tauri::command]
pub fn import_terminal_history(
    history: Vec<String>,
    state: State<EngineState>,
) -> Result<Vec<String>, String> {
    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;

    if !app_state.terminal_history.is_empty() {
        return Ok(app_state.terminal_history.clone());
    }

    let start = history.len().saturating_sub(TERMINAL_HISTORY_LIMIT);
    app_state.terminal_history = history[start..]
        .iter()
        .map(|entry| entry.trim().to_string())
        .filter(|entry| !entry.is_empty())
        .collect();

    app_state.save_preferences()?;
    Ok(app_state.terminal_history.clone())
}

// ============================================================================
// COMMAND PROCESSING
// ============================================================================

pub fn process_command(
    app_state: &mut AppState,
    sound_manager: &mut crate::sound::SoundManager,
    cmd: &str,
    args: &[&str],
) -> String {
    // Handle command aliases
    let cmd = match cmd {
        // Start aliases
        "s" | "st" => "start",
        // Stop aliases
        "r" => "stop",
        // Pause aliases
        "p" => "pause",
        // Resume is already "resume"
        _ => cmd,
    };

    let advanced_commands = "
 🔵 Advanced Commands:
   strict on             - Enable Strict Mode (commitment mode)
   strict off            - Disable Strict Mode (when idle)
   timer 50m             - Focus override; combines, e.g. timer 50m break 10m loop 3
   break 10m             - Break override
   loop 3                - Sessions in the cycle
   profile create        - Create custom profile
   profile edit [id]     - Edit custom profile
   profile duplicate     - Duplicate profile
   profile delete [id]   - Delete a custom profile
   devmode on/off        - Developer diagnostics
   engine state          - Engine state inspection
   engine reset          - Reset engine
   app usage             - App diagnostics";

    let result = match cmd {
        "help" => help_command(advanced_commands),

        "focus" => focus_command(args, app_state),

        "strict" => strict_command(args, app_state),

        "task" => task_command(args, app_state),

        "timer" => timer_override_command(args, app_state),

        "break" => break_override_command(args, app_state),

        "loop" => loop_override_command(args, app_state),

        "sessions" => sessions_command(args, app_state),

        "start" => start_command(app_state),

        "stop" => stop_command(app_state),

        "override" => override_command(args, app_state),

        "status" => status_command(app_state),

        "pause" => pause_command(app_state),

        "resume" => resume_command(app_state),

        "profile" => crate::commands::profile::profile_command(args, app_state, sound_manager),

        "season" => season_command(args, app_state),

        "config" => config_command(args, app_state),

        "stats" => stats_command(app_state),

        "devmode" => devmode_command(args, app_state),

        "ambience" => ambience_command(args, app_state),

        "background" => background_command(args, app_state),

        "reset" => reset_command(app_state, sound_manager),

        "theme" => theme_command(args, app_state),

        "engine" => engine_command(args, app_state),

        "app" => app_command(args),

        "system" | "sysinfo" => system_command(),

        "memory" => memory_command(),

        "cpu" => cpu_command(),

        "usage" => usage_command(app_state),

        "alarm" => alarm_command(args, app_state),

        "sound" => sound_command(args, app_state, sound_manager),

        "history" => history_command(args, app_state),

        "clear" => "__CLEAR__".to_string(),

        "" => String::new(),

        _ => format!(
            "Error: Unknown command \"{}\". Type \"help\" for available commands.",
            cmd
        ),
    };

    sync_sound_output_with_timer(app_state, sound_manager);
    result
}

// ============================================================================
// COMMAND HANDLERS
// ============================================================================

fn help_command(advanced_commands: &str) -> String {
    format!(
        "Available commands:
   start                  - Start session (uses override if set, else profile defaults)
   stop                   - Stop current session (override preserved)
   pause                  - Pause current session
   resume                 - Resume paused session
   status                 - Show current session status
   override clear         - Clear session override
   sessions [count]       - Set or view sessions per cycle (1-20)
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
   alarm on/off          - Toggle the end-of-session alarms
   history               - Show the commands you have run
   history clear         - Forget them
   system                - Show system information
   memory                - Show memory usage
   cpu                   - Show CPU usage
   usage                 - Show app usage stats (CPU, memory, uptime)
   theme [mode]          - Set theme (dark, light, system)
   clear                 - Clear terminal
   help                  - Show this help message{}",
        advanced_commands
    )
}

fn focus_command(args: &[&str], app_state: &mut AppState) -> String {
    match args.first() {
        Some(&"start") => {
            let minutes = args
                .get(1)
                .and_then(|m| m.parse::<f64>().ok())
                .unwrap_or(25.0);
            if !minutes.is_finite() || minutes <= 0.0 {
                return "Error: Invalid duration. Usage: focus start [minutes]".to_string();
            }
            let total_seconds = (minutes * 60.0).round() as u32;
            app_state.timer = TimerState {
                remaining_seconds: total_seconds,
                total_seconds,
                status: TimerStatus::Running,
                session_type: SessionType::Focus,
                current_session: 1,
                total_sessions: 4,
            };
            format!("Starting focus session for {} minutes...", minutes)
        }
        Some(&"stop") => {
            if app_state.timer.status == TimerStatus::Idle {
                return "Error: No active session to stop.".to_string();
            }
            // Both halves, for the same reason as `stop`: a stale
            // `total_seconds` makes the ring's progress nonsense.
            app_state.timer.status = TimerStatus::Idle;
            app_state.timer.remaining_seconds = app_state.active_profile.focus_duration;
            app_state.timer.total_seconds = app_state.active_profile.focus_duration;
            "Focus session stopped.".to_string()
        }
        Some(&"pause") => {
            if app_state.timer.status != TimerStatus::Running {
                return "Error: No running session to pause.".to_string();
            }
            app_state.timer.status = TimerStatus::Paused;
            "Focus session paused.".to_string()
        }
        Some(&"resume") => {
            if app_state.timer.status != TimerStatus::Paused {
                return "Error: No paused session to resume.".to_string();
            }
            app_state.timer.status = TimerStatus::Running;
            "Focus session resumed.".to_string()
        }
        _ => "Error: Unknown focus command. Usage: focus start [minutes] | stop | pause | resume"
            .to_string(),
    }
}

fn strict_command(args: &[&str], app_state: &mut AppState) -> String {
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

fn task_command(args: &[&str], app_state: &mut AppState) -> String {
    match args.first() {
        Some(&"set") => {
            // Parse: task set "title" --category coding|other
            let mut title = String::new();
            let mut category = TaskCategory::Coding;

            let args_vec: Vec<&str> = args[1..].to_vec();

            // Find the title (in quotes or until --category)
            let mut in_title = true;
            for arg in &args_vec {
                if *arg == "--category" {
                    in_title = false;
                    continue;
                }

                if in_title {
                    // Remove quotes if present
                    let clean_arg = arg.trim_matches('"').trim_matches('\'');
                    if !clean_arg.is_empty() {
                        if !title.is_empty() {
                            title.push(' ');
                        }
                        title.push_str(clean_arg);
                    }
                } else if *arg == "coding" {
                    category = TaskCategory::Coding;
                } else if *arg == "other" {
                    category = TaskCategory::Other;
                }
            }

            if title.is_empty() {
                return "Error: Task title is required. Usage: task set \"your task\" --category coding|other"
                    .to_string();
            }

            app_state.current_task = CurrentTask {
                category,
                title,
            };

            let category_str = match app_state.current_task.category {
                TaskCategory::Coding => "coding",
                TaskCategory::Other => "other",
            };

            format!("Task set: [{}] {}", category_str, app_state.current_task.title)
        }
        Some(&"clear") => {
            app_state.current_task = CurrentTask::default();
            "Task cleared.".to_string()
        }
        Some(&"show") | None => {
            if app_state.current_task.is_empty() {
                "No task set. Use 'task set \"title\" --category coding|other' to set a task."
                    .to_string()
            } else {
                let category_str = match app_state.current_task.category {
                    TaskCategory::Coding => "coding",
                    TaskCategory::Other => "other",
                };
                format!("Task: [{}] {}", category_str, app_state.current_task.title)
            }
        }
        _ => "Error: Unknown task command. Usage: task set \"title\" --category coding|other | task show | task clear"
            .to_string(),
    }
}

/// One field of the session override.
#[derive(Clone, Copy, PartialEq)]
enum OverrideField {
    Focus,
    Break,
    Loop,
}

impl OverrideField {
    fn from_keyword(word: &str) -> Option<Self> {
        match word {
            "timer" | "focus" => Some(Self::Focus),
            "break" => Some(Self::Break),
            "loop" => Some(Self::Loop),
            _ => None,
        }
    }

    fn noun(self) -> &'static str {
        match self {
            Self::Focus => "focus duration",
            Self::Break => "break duration",
            Self::Loop => "loop count",
        }
    }

    fn usage(self) -> &'static str {
        match self {
            Self::Focus => "Usage: timer 50m | timer 90s | timer 50m break 10m loop 3",
            Self::Break => "Usage: break 10m | break 30s",
            Self::Loop => "Usage: loop 3",
        }
    }

    /// Parses and range-checks one value for this field.
    fn value(self, raw: &str) -> Result<u32, String> {
        match self {
            Self::Focus => {
                let seconds = parse_duration(raw)?;
                if !(5..=10800).contains(&seconds) {
                    return Err(
                        "Focus duration must be between 5 seconds and 180 minutes.".to_string()
                    );
                }
                Ok(seconds)
            }
            Self::Break => {
                let seconds = parse_duration(raw)?;
                if !(1..=3600).contains(&seconds) {
                    return Err(
                        "Break duration must be between 1 second and 60 minutes.".to_string()
                    );
                }
                Ok(seconds)
            }
            Self::Loop => {
                let count: u32 = raw
                    .parse()
                    .map_err(|_| "Invalid loop count. Must be a number between 1 and 100.")?;
                if !(1..=100).contains(&count) {
                    return Err("Loop count must be between 1 and 100.".to_string());
                }
                Ok(count)
            }
        }
    }
}

/// Reads `50m break 10m loop 3` as three clauses rather than one value.
///
/// This is the command the app is pitched on — a whole session shape in one
/// line — and it never worked: each of the three handlers read `args.first()`
/// and dropped everything after it, so `timer 50m break 10m loop 3` set the
/// focus duration, silently discarded the break and the loop, and answered as
/// though it had done the lot. Any of the three words can lead, and the rest
/// follow as `<keyword> <value>` pairs, so `break 10m loop 3` reads the same
/// way round.
fn parse_override_clauses(
    args: &[&str],
    lead: OverrideField,
) -> Result<Vec<(OverrideField, u32)>, String> {
    let mut clauses = Vec::new();
    let mut field = lead;
    let mut index = 0;

    loop {
        let raw = args
            .get(index)
            .ok_or_else(|| format!("Error: Missing {}. {}", field.noun(), field.usage()))?;

        let value = field.value(raw).map_err(|e| format!("Error: {}", e))?;
        clauses.push((field, value));
        index += 1;

        let Some(word) = args.get(index) else { break };
        field = OverrideField::from_keyword(&word.to_lowercase()).ok_or_else(|| {
            format!(
                "Error: Unexpected \"{}\". Expected break or loop. {}",
                word,
                lead.usage()
            )
        })?;
        index += 1;
    }

    Ok(clauses)
}

fn override_command_for(args: &[&str], app_state: &mut AppState, lead: OverrideField) -> String {
    if app_state.strict_mode.is_active && app_state.timer.status == TimerStatus::Running {
        return format!("Cannot modify {} while Strict Mode is active.", lead.noun());
    }

    if app_state.timer.status == TimerStatus::Running {
        return "Stop current session before applying override.".to_string();
    }

    let clauses = match parse_override_clauses(args, lead) {
        Ok(clauses) => clauses,
        Err(message) => return message,
    };

    let override_state = app_state
        .session_override
        .get_or_insert(SessionOverride::new());

    for (field, value) in clauses {
        match field {
            OverrideField::Focus => override_state.focus_duration = Some(value),
            OverrideField::Break => override_state.break_duration = Some(value),
            OverrideField::Loop => override_state.loop_count = Some(value),
        }
    }

    if let Err(e) = override_state.validate() {
        return format!("Error: {}", e);
    }

    build_override_message(override_state)
}

fn timer_override_command(args: &[&str], app_state: &mut AppState) -> String {
    override_command_for(args, app_state, OverrideField::Focus)
}

fn break_override_command(args: &[&str], app_state: &mut AppState) -> String {
    override_command_for(args, app_state, OverrideField::Break)
}

fn loop_override_command(args: &[&str], app_state: &mut AppState) -> String {
    override_command_for(args, app_state, OverrideField::Loop)
}

/// Seconds as a person would say them: `50m`, `90s`, `1m 30s`.
///
/// The override used to report itself in raw seconds — a fifty-minute focus
/// came back as "Focus: 3000s", which is the number the engine holds rather
/// than the one that was typed.
fn humanize_seconds(seconds: u32) -> String {
    match (seconds / 60, seconds % 60) {
        (0, s) => format!("{}s", s),
        (m, 0) => format!("{}m", m),
        (m, s) => format!("{}m {}s", m, s),
    }
}

fn build_override_message(override_state: &SessionOverride) -> String {
    let mut info = vec![];
    if let Some(f) = override_state.focus_duration {
        info.push(format!("Focus: {}", humanize_seconds(f)));
    }
    if let Some(b) = override_state.break_duration {
        info.push(format!("Break: {}", humanize_seconds(b)));
    }
    if let Some(l) = override_state.loop_count {
        info.push(format!("Sessions: {}", l));
    }

    format!(
        "Override set:\n  - {}\n\nRun `start` to begin session.",
        info.join("\n  - ")
    )
}

fn sessions_command(args: &[&str], app_state: &mut AppState) -> String {
    match args.first() {
        Some(&count_str) => {
            match count_str.parse::<u32>() {
                Ok(count) => {
                    if count < 1 || count > 20 {
                        return "Error: Sessions must be between 1 and 20.".to_string();
                    }
                    app_state.timer.total_sessions = count;
                    // Reset current session to 1 if it exceeds the new total
                    if app_state.timer.current_session > count {
                        app_state.timer.current_session = 1;
                    }
                    format!("Sessions per cycle set to {}", count)
                }
                Err(_) => {
                    "Error: Invalid session count. Must be a number between 1 and 20.".to_string()
                }
            }
        }
        None => {
            format!(
                "Sessions per cycle: {} (current: {}/{})",
                app_state.timer.total_sessions,
                app_state.timer.current_session,
                app_state.timer.total_sessions
            )
        }
    }
}

fn start_command(app_state: &mut AppState) -> String {
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

    let focus_seconds = effective_focus_seconds(&app_state);
    let total_sessions = effective_total_sessions(&app_state);

    // Starting after a break continues the cycle rather than restarting it.
    // `current_session` was hard-assigned 1 here, so even once the cycle
    // advanced, the next start would have knocked it back to the beginning.
    let current_session = app_state.timer.current_session.clamp(1, total_sessions);

    app_state.timer = TimerState {
        remaining_seconds: focus_seconds,
        total_seconds: focus_seconds,
        status: TimerStatus::Running,
        session_type: SessionType::Focus,
        current_session,
        total_sessions,
    };

    let override_info = if let Some(ref override_state) = app_state.session_override {
        if override_state.is_active() {
            let mut info = vec![];
            if let Some(f) = override_state.focus_duration {
                info.push(format!("{} focus", humanize_seconds(f)));
            }
            if let Some(b) = override_state.break_duration {
                info.push(format!("{} break", humanize_seconds(b)));
            }
            if let Some(l) = override_state.loop_count {
                info.push(format!("{} sessions", l));
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

fn stop_command(app_state: &mut AppState) -> String {
    if app_state.timer.status == TimerStatus::Idle {
        return "Error: No active session to stop.".to_string();
    }

    // Block stop during Strict Mode - user must complete the session
    if app_state.strict_mode.is_active {
        return "Error: Stop is disabled during Strict Mode. Session must run to completion."
            .to_string();
    }

    // Reset to whatever the next run will actually use, and reset both halves
    // of it. Setting `remaining_seconds` alone left `total_seconds` holding the
    // duration of the session just stopped, so after a 5-minute quick session
    // the timer read 1500 remaining out of 300 total — a progress of -400%,
    // which drove the ring's arc to five times its circumference and animated
    // it there. It also ignored a preserved override, so the clock claimed the
    // profile's duration for a session that would start at the override's.
    // Stopping a break ends the break, not the cycle.
    //
    // Breaks start themselves, so the only way past one is to stop it — and
    // treating that as abandoning the whole cycle meant the counter went back
    // to 1/4 every time, which looked as though it never advanced at all. This
    // is the same move the break would have made on its own, minus the alarm:
    // that marks a boundary the timer reached, not one you stepped over.
    if app_state.timer.session_type != SessionType::Focus {
        let ended_cycle = app_state.timer.session_type == SessionType::LongBreak;
        let _ = advance_from_finished(app_state);

        return if ended_cycle {
            "Break ended. Cycle complete.".to_string()
        } else {
            format!(
                "Break ended. Session {}/{} is up next.",
                app_state.timer.current_session, app_state.timer.total_sessions
            )
        };
    }

    let focus_seconds = effective_focus_seconds(&app_state);

    // Stopping a focus run abandons the cycle, not just the session, so the
    // counter goes back to the start rather than resuming halfway through.
    app_state.timer.status = TimerStatus::Idle;
    app_state.timer.current_session = 1;
    app_state.timer.remaining_seconds = focus_seconds;
    app_state.timer.total_seconds = focus_seconds;

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
            match app_state.session_override {
                // Minutes, like everywhere else the override is printed. This
                // and `status` were the two places the switch to minutes
                // missed, so a `timer 50m` set in one line came back as
                // "Focus: 3000s" when it was asked about in another.
                Some(ref override_state) if override_state.is_active() => {
                    let mut info = vec![];
                    if let Some(f) = override_state.focus_duration {
                        info.push(format!("Focus: {}", humanize_seconds(f)));
                    }
                    if let Some(b) = override_state.break_duration {
                        info.push(format!("Break: {}", humanize_seconds(b)));
                    }
                    if let Some(l) = override_state.loop_count {
                        info.push(format!("Sessions: {}", l));
                    }
                    format!("Current override:\n  - {}", info.join("\n  - "))
                }
                _ => "No override active.".to_string(),
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

    // Show task info if set
    if !app_state.current_task.is_empty() {
        let category_str = match app_state.current_task.category {
            TaskCategory::Coding => "coding",
            TaskCategory::Other => "other",
        };
        info.push(format!(
            "Task: [{}] {}",
            category_str, app_state.current_task.title
        ));
    }

    if app_state.strict_mode.is_active {
        info.push("Strict Mode: ACTIVE (cannot pause/stop)".to_string());
    }

    if let Some(ref override_state) = app_state.session_override {
        if override_state.is_active() {
            let mut override_info = vec![];
            if let Some(f) = override_state.focus_duration {
                override_info.push(format!("{} focus", humanize_seconds(f)));
            }
            if let Some(b) = override_state.break_duration {
                override_info.push(format!("{} break", humanize_seconds(b)));
            }
            if let Some(l) = override_state.loop_count {
                override_info.push(format!("{} sessions", l));
            }
            info.push(format!("Override: {}", override_info.join(", ")));
        }
    }

    info.join("\n")
}

fn pause_command(app_state: &mut AppState) -> String {
    if app_state.timer.status != TimerStatus::Running {
        return "Error: No running session to pause.".to_string();
    }

    if app_state.strict_mode.is_active {
        return "Error: Pause is disabled during Strict Mode. Session must run to completion."
            .to_string();
    }

    app_state.timer.status = TimerStatus::Paused;
    "Session paused.".to_string()
}

fn resume_command(app_state: &mut AppState) -> String {
    if app_state.timer.status != TimerStatus::Paused {
        return "Error: No paused session to resume.".to_string();
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

fn devmode_command(args: &[&str], app_state: &mut AppState) -> String {
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
        current_session: 1,
        total_sessions: 4,
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
    app_state.sound_state.play_ambient_sound = false;
    app_state.sound_state.volume = 50;
    app_state.sound_state.is_muted = false;
    let _ = sound_manager.stop();
    app_state.sound_state.is_playing = false;
    app_state.sound_state.current_sound = None;
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
        Some(&"toggle") => {
            // Toggle between dark and light (ignore system)
            let new_theme = if app_state.theme == "dark" {
                "light"
            } else {
                "dark"
            };
            app_state.theme = new_theme.to_string();
            format!("Theme toggled to {}.", new_theme)
        }
        _ => format!(
            "Current theme: {}. Usage: theme dark|light|system|toggle",
            app_state.theme
        ),
    }
}

fn engine_command(args: &[&str], app_state: &mut AppState) -> String {
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
                current_session: 1,
                total_sessions: 4,
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

fn app_command(args: &[&str]) -> String {
    match args.first() {
        Some(&"usage") => format!("Engine process:\n  Memory: {:.1} MB", engine_memory_mb()),
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

fn usage_command(app_state: &AppState) -> String {
    // Calculate uptime
    let current_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;
    let uptime_seconds = current_time - app_state.app_start_time;

    let hours = uptime_seconds / 3600;
    let minutes = (uptime_seconds % 3600) / 60;
    let seconds = uptime_seconds % 60;

    let uptime_str = if hours > 0 {
        format!("{}h {}m {}s", hours, minutes, seconds)
    } else if minutes > 0 {
        format!("{}m {}s", minutes, seconds)
    } else {
        format!("{}s", seconds)
    };

    format!(
        "Engine process:\n  Memory: {:.1} MB\n  Uptime: {}",
        engine_memory_mb(),
        uptime_str
    )
}

fn alarm_command(args: &[&str], app_state: &mut AppState) -> String {
    match args.first() {
        // "Voice announcements" is what these were before they became three
        // synthesised tones. The preference was renamed, the help text was
        // renamed, and this pair of strings was missed — so `alarm on` answered
        // about a feature the app no longer has.
        Some(&"on") => {
            app_state.alarm_enabled = true;
            "Alarms enabled. A tone at the end of each session, break and cycle.".to_string()
        }
        Some(&"off") => {
            app_state.alarm_enabled = false;
            "Alarms disabled.".to_string()
        }
        _ => {
            let status = if app_state.alarm_enabled {
                "enabled"
            } else {
                "disabled"
            };
            format!(
                "Alarm: {}\nUse 'alarm on' or 'alarm off' to toggle.",
                status
            )
        }
    }
}

/// The console's own history, which is engine state like everything else.
///
/// Worth having as a command rather than only as arrow keys: a hundred entries
/// is more than you can arrow through, and until it moved out of the webview
/// there was no way to clear it at all.
fn history_command(args: &[&str], app_state: &mut AppState) -> String {
    /// Enough to see what you have been doing without burying the console.
    const SHOWN: usize = 20;

    match args.first() {
        Some(&"clear") => {
            app_state.terminal_history.clear();
            "Command history cleared.".to_string()
        }
        None => {
            let total = app_state.terminal_history.len();
            if total == 0 {
                return "No command history yet.".to_string();
            }

            let start = total.saturating_sub(SHOWN);
            let lines: Vec<String> = app_state.terminal_history[start..]
                .iter()
                .enumerate()
                .map(|(i, command)| format!("  {:>3}  {}", start + i + 1, command))
                .collect();

            let heading = if start > 0 {
                format!("Command history (last {} of {}):", lines.len(), total)
            } else {
                format!("Command history ({}):", total)
            };

            format!("{}\n{}", heading, lines.join("\n"))
        }
        _ => "Error: Unknown history command. Usage: history | history clear".to_string(),
    }
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
            app_state.sound_state.play_ambient_sound = true;
            app_state.sound_state.volume = app_state.active_profile.default_volume;
            if app_state.timer.status == TimerStatus::Running && !app_state.sound_state.is_muted {
                format!("Ambient sound enabled: {}", sound_file)
            } else if app_state.sound_state.is_muted {
                "Ambient sound enabled but muted. Unmute while timer runs to hear it.".to_string()
            } else {
                "Ambient sound enabled. It will play while the timer is running.".to_string()
            }
        }
        Some(&"stop") => {
            sound_manager.stop();
            app_state.sound_state.play_ambient_sound = false;
            app_state.sound_state.is_playing = false;
            app_state.sound_state.current_sound = None;
            "Ambient sound stopped.".to_string()
        }
        Some(&"volume") => {
            if let Some(vol_str) = args.get(1) {
                match *vol_str {
                    "up" => {
                        let new_vol = (app_state.sound_state.volume + 10).min(100);
                        app_state.sound_state.volume = new_vol;
                        sound_manager.set_volume(new_vol);
                        return format!("Volume increased to {}%", new_vol);
                    }
                    "down" => {
                        let new_vol = app_state.sound_state.volume.saturating_sub(10);
                        app_state.sound_state.volume = new_vol;
                        sound_manager.set_volume(new_vol);
                        return format!("Volume decreased to {}%", new_vol);
                    }
                    _ => {
                        if let Ok(vol) = vol_str.parse::<u8>() {
                            let vol = vol.min(100);
                            app_state.sound_state.volume = vol;
                            sound_manager.set_volume(vol);
                            return format!("Volume set to {}%", vol);
                        } else {
                            return "Error: Invalid volume value. Use 0-100, or 'up'/'down'"
                                .to_string();
                        }
                    }
                }
            }
            format!("Current volume: {}%", app_state.sound_state.volume)
        }
        Some(&"mute") => {
            app_state.sound_state.is_muted = !app_state.sound_state.is_muted;
            if app_state.sound_state.is_muted {
                "Sound muted.".to_string()
            } else {
                "Sound unmuted.".to_string()
            }
        }
        _ => {
            let status = if app_state.sound_state.play_ambient_sound {
                if app_state.timer.status == TimerStatus::Running && !app_state.sound_state.is_muted
                {
                    if sound_manager.is_playing() {
                        "Playing"
                    } else {
                        "Enabled (starting)"
                    }
                } else if app_state.sound_state.is_muted {
                    "Enabled (muted)"
                } else {
                    "Enabled (waiting for timer)"
                }
            } else {
                "Stopped"
            };

            format!(
                "Sound Status: {} | Enabled: {} | Volume: {}% | Muted: {}",
                status,
                app_state.sound_state.play_ambient_sound,
                app_state.sound_state.volume,
                app_state.sound_state.is_muted
            )
        }
    }
}

fn sync_sound_output_with_timer(
    app_state: &mut AppState,
    sound_manager: &mut crate::sound::SoundManager,
) {
    let should_output = app_state.timer.status == TimerStatus::Running
        && app_state.sound_state.play_ambient_sound
        && !app_state.sound_state.is_muted;

    if should_output {
        if !sound_manager.is_playing() {
            sound_manager.resume();
        }

        if !sound_manager.is_playing() {
            let sound_file = app_state
                .sound_state
                .current_sound
                .clone()
                .unwrap_or_else(|| app_state.active_profile.sound_file.clone());
            app_state.sound_state.current_sound = Some(sound_file.clone());
            let sound_data: &[u8] = get_sound_data(&sound_file);
            let _ = sound_manager.play(sound_data, app_state.sound_state.volume);
        }

        app_state.sound_state.is_playing = sound_manager.is_playing();
        return;
    }

    if app_state.sound_state.play_ambient_sound {
        if sound_manager.is_playing() {
            sound_manager.pause();
        }
    } else {
        sound_manager.stop();
    }

    app_state.sound_state.is_playing = false;
}

// ============================================================================
// SESSION CYCLE
// ============================================================================

/// How long the next focus run is: the override if one is set, else the
/// profile's.
fn effective_focus_seconds(app_state: &AppState) -> u32 {
    app_state
        .session_override
        .as_ref()
        .and_then(|o| o.focus_duration)
        .unwrap_or(app_state.active_profile.focus_duration)
}

/// How long the next break is. A break override applies to either kind — it is
/// one field, and someone who asks for three-minute breaks means all of them.
fn effective_break_seconds(app_state: &AppState, long: bool) -> u32 {
    app_state
        .session_override
        .as_ref()
        .and_then(|o| o.break_duration)
        .unwrap_or(if long {
            app_state.active_profile.long_break_duration
        } else {
            app_state.active_profile.short_break_duration
        })
}

/// A duration typed into the clock or picked from the quick chips, with no
/// loop count asked for.
///
/// That is a one-off — twenty minutes on this, now — and it has nothing to do
/// with the profile's cycle. It should not borrow the profile's session count,
/// should not roll into the profile's break, and should not leave "Session 1/4"
/// on screen describing a cycle nobody started. Asking for `loop 3` alongside
/// the duration is asking for a cycle, and gets one.
fn is_adhoc_run(app_state: &AppState) -> bool {
    app_state
        .session_override
        .as_ref()
        .is_some_and(|o| o.focus_duration.is_some() && o.loop_count.is_none())
}

/// How many focus runs this cycle: the loop override if one is set, one for an
/// ad-hoc duration, else the profile's. The `loop` command has always accepted
/// a count and printed it back in the override message; nothing ever applied it
/// to the timer.
fn effective_total_sessions(app_state: &AppState) -> u32 {
    if is_adhoc_run(app_state) {
        return 1;
    }

    app_state
        .session_override
        .as_ref()
        .and_then(|o| o.loop_count)
        .unwrap_or(app_state.active_profile.sessions_per_cycle)
        .max(1)
}

/// What just finished, for the frontend to sound.
///
/// Three distinct moments, because they mean different things: one run of work
/// is done, a break is over and the desk wants you back, or the whole cycle is
/// finished and nothing is waiting.
const ALARM_SESSION_END: &str = "session";
const ALARM_BREAK_END: &str = "break";
const ALARM_CYCLE_END: &str = "cycle";

/// Move the cycle on from a finished timer.
///
/// The cycle did not exist before this. `current_session` was assigned 1 in
/// nine places and incremented in none, no break was ever started, and
/// `loop_count` was collected and displayed but never read — so the engine ran
/// exactly one focus session, stopped, and left "Session 1/4" on screen for
/// ever.
///
/// A finished focus run rolls straight into its break, because you are getting
/// up anyway. A finished break stops and waits, because coming back to the desk
/// should be a decision rather than a clock that started without you.
fn advance_cycle(app_state: &mut AppState, app_handle: &AppHandle) {
    let alarm = advance_from_finished(app_state);
    let _ = app_handle.emit("session-alarm", alarm);
}

/// The state transition itself, returning which alarm belongs to it.
///
/// Split from `advance_cycle` because stopping a break has to make the same
/// move without sounding anything: an alarm marks a boundary the timer reached
/// on its own, not one you walked over deliberately.
fn advance_from_finished(app_state: &mut AppState) -> &'static str {
    let finished = app_state.timer.session_type.clone();
    let current = app_state.timer.current_session;
    let total = app_state.timer.total_sessions.max(1);

    match finished {
        // A one-off ends when it ends. No break follows it, because nothing
        // follows it — and the override retires with it, so the next start is
        // the profile's again rather than a silent repeat of this duration.
        SessionType::Focus if is_adhoc_run(app_state) => {
            app_state.session_override = None;
            let seconds = effective_focus_seconds(app_state);

            app_state.timer = TimerState {
                remaining_seconds: seconds,
                total_seconds: seconds,
                status: TimerStatus::Idle,
                session_type: SessionType::Focus,
                current_session: 1,
                total_sessions: app_state.active_profile.sessions_per_cycle.max(1),
            };

            ALARM_SESSION_END
        }
        SessionType::Focus => {
            let is_final = current >= total;
            let seconds = effective_break_seconds(app_state, is_final);

            app_state.timer = TimerState {
                remaining_seconds: seconds,
                total_seconds: seconds,
                status: TimerStatus::Running,
                session_type: if is_final {
                    SessionType::LongBreak
                } else {
                    SessionType::ShortBreak
                },
                current_session: current,
                total_sessions: total,
            };

            ALARM_SESSION_END
        }
        SessionType::ShortBreak => {
            let seconds = effective_focus_seconds(app_state);

            app_state.timer = TimerState {
                remaining_seconds: seconds,
                total_seconds: seconds,
                status: TimerStatus::Idle,
                session_type: SessionType::Focus,
                current_session: current + 1,
                total_sessions: total,
            };

            ALARM_BREAK_END
        }
        SessionType::LongBreak => {
            // The long break only follows the last focus run, so reaching the
            // end of one is the end of the cycle. Back to session one, and the
            // override retires with the cycle it belonged to.
            app_state.session_override = None;
            let seconds = effective_focus_seconds(app_state);

            app_state.timer = TimerState {
                remaining_seconds: seconds,
                total_seconds: seconds,
                status: TimerStatus::Idle,
                session_type: SessionType::Focus,
                current_session: 1,
                total_sessions: app_state.active_profile.sessions_per_cycle.max(1),
            };

            ALARM_CYCLE_END
        }
    }
}

// ============================================================================
// TIMER AND STATS COMMANDS
// ============================================================================

#[tauri::command]
pub fn tick_timer(state: State<EngineState>, app_handle: AppHandle) -> Result<(), String> {
    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;
    let mut sound_manager = state.sound_manager.lock().map_err(|e| e.to_string())?;

    if app_state.timer.status == TimerStatus::Running && app_state.timer.remaining_seconds > 0 {
        app_state.timer.remaining_seconds -= 1;

        if app_state.timer.remaining_seconds == 0 {
            app_state.timer.status = TimerStatus::Completed;

            let finished_focus = app_state.timer.session_type == SessionType::Focus;
            let completed_seconds = app_state.timer.total_seconds;

            // Only focus counts. Every finished timer used to be folded into
            // the statistics, so once breaks existed a five-minute break would
            // have been filed as five minutes of focus and bumped the streak.
            if finished_focus {
                app_state.record_completed_session(completed_seconds);

                let strict_mode_completed_successfully = if app_state.strict_mode.is_active {
                    app_state.strict_mode = StrictModeState::default();
                    true
                } else {
                    false
                };

                let mut completion_msg = format!(
                    "Session Complete!\n  Focus Time: {}m {}s\n  Profile: {}\n  Session: {}/{}\n  Sessions Today: {}",
                    completed_seconds / 60,
                    completed_seconds % 60,
                    app_state.active_profile.name,
                    app_state.timer.current_session,
                    app_state.timer.total_sessions,
                    app_state.stats.sessions_today
                );

                if strict_mode_completed_successfully {
                    completion_msg.push_str("\n  Strict Mode: COMPLETED ✓");
                }

                let _ = app_handle.emit("session-complete", completion_msg);
            }

            advance_cycle(&mut app_state, &app_handle);
        }

        sync_sound_output_with_timer(&mut app_state, &mut sound_manager);

        publish(&app_handle, &app_state);
    }

    Ok(())
}

/// Read this process's memory on demand.
///
/// The app used to poll this every five seconds into `AppState` so a pair of
/// meters could render it. That cost a `sysinfo` refresh and a full state
/// broadcast on a timer, to display a number that could not be made honest:
/// a Tauri app is several processes sharing mapped pages, so no single figure
/// describes "the app". It is a diagnostic now — computed only when asked for,
/// and clearly the engine process rather than the whole application.
fn engine_memory_mb() -> f32 {
    let pid = sysinfo::Pid::from_u32(std::process::id());
    let mut sys = System::new();
    sys.refresh_processes(sysinfo::ProcessesToUpdate::Some(&[pid]), true);

    sys.process(pid)
        .map(|process| process.memory() as f32 / 1_048_576.0)
        .unwrap_or(0.0)
}
