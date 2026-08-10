//! Timer module - Timer-related commands and processing

use super::parser::{format_time, parse_command_with_quotes, parse_duration};
use crate::sound::get_sound_data;
use crate::state::{AppState, AppStateExt, StateEvent};
use crate::types::{
    CurrentTask, DayRecord, SessionOverride, SessionType, Stats, StrictModeState, TaskCategory,
    TimerState, TimerStatus,
};
use crate::EngineState;
use sysinfo::{CpuRefreshKind, MemoryRefreshKind, RefreshKind, System};
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
        "devmode" | "ambience" | "sound" | "profile" | "reset" | "theme" | "alarm" | "history"
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
// SESSION HISTORY
// ============================================================================

#[tauri::command]
pub fn get_session_history(state: State<EngineState>) -> Result<Vec<DayRecord>, String> {
    let app_state = state.app_state.lock().map_err(|e| e.to_string())?;
    Ok(app_state.session_history.clone())
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

        // `focus` used to be its own start/stop/pause/resume, written before
        // those existed as commands and never updated: `focus start` hardcoded
        // four sessions, ignored any override, and never entered the cycle, so
        // it ran one session and stopped. It was in no help text and nothing in
        // the interface called it. `OverrideField::from_keyword` already reads
        // `focus` as a synonym for `timer` inside a compound command, so it is
        // one here too — `focus 50m` and `timer 50m` are the same thing.
        "focus" => timer_override_command(args, app_state),

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
                // Seconds, like everywhere else the override is printed. This
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
            "Current Configuration:\n  Profile: {}\n  Season: {:?}\n  Motion: {:?}\n  Focus: {} min\n  Short Break: {} min\n  Long Break: {} min",
            app_state.active_profile.name,
            app_state.active_profile.season,
            app_state.active_profile.motion_intensity,
            app_state.active_profile.focus_duration / 60,
            app_state.active_profile.short_break_duration / 60,
            app_state.active_profile.long_break_duration / 60
        ),
        _ => "Error: Unknown config command. Usage: config show".to_string(),
    }
}

fn stats_command(app_state: &mut AppState) -> String {
    let mut out = format!(
        "Statistics:\n  Sessions Today: {}\n  Total Focus: {} minutes\n  Current Streak: {} days\n  Last Session: {} minutes",
        app_state.stats.sessions_today,
        app_state.stats.total_focus_minutes,
        app_state.stats.current_streak,
        app_state.stats.last_session_duration
    );

    // The running totals cannot say anything about a week, which is the span a
    // person actually judges their own work over.
    let week = &app_state.session_history[app_state.session_history.len().saturating_sub(7)..];

    if !week.is_empty() {
        let sessions: u32 = week.iter().map(|day| day.sessions).sum();
        let minutes: u32 = week.iter().map(|day| day.focus_minutes).sum();
        let best = week.iter().max_by_key(|day| day.focus_minutes);

        out.push_str(&format!(
            "\n\nLast {} recorded {}:\n  Sessions: {}\n  Focus: {} minutes\n  Daily average: {} minutes",
            week.len(),
            if week.len() == 1 { "day" } else { "days" },
            sessions,
            minutes,
            minutes / week.len() as u32
        ));

        if let Some(day) = best {
            out.push_str(&format!(
                "\n  Best day: {} ({} minutes over {} session{})",
                day.date,
                day.focus_minutes,
                day.sessions,
                if day.sessions == 1 { "" } else { "s" }
            ));
        }
    }

    out
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
    app_state.stats = Stats::default();
    // With the totals gone, a week of history left behind would be a panel
    // reporting five sessions this week next to none today.
    app_state.session_history.clear();
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
            app_state.stats = Stats::default();
            app_state.session_history.clear();
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

/// The three probes below ask `sysinfo` for exactly what they print.
///
/// They each built a `System::new_all()` first — the same mistake the engine
/// was already fixed for once, where a five-second poll was snapshotting every
/// process on the machine to read two numbers. These are on demand rather than
/// on a timer, so it cost less, but `new_all` still walks every process, disk,
/// network interface and temperature sensor before `refresh_memory` throws all
/// of it away.
fn system_command() -> String {
    let mut sys = System::new_with_specifics(
        RefreshKind::new()
            .with_memory(MemoryRefreshKind::everything())
            .with_cpu(CpuRefreshKind::new()),
    );
    sys.refresh_memory();
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
    let mut sys =
        System::new_with_specifics(RefreshKind::new().with_memory(MemoryRefreshKind::everything()));
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
    let mut sys =
        System::new_with_specifics(RefreshKind::new().with_cpu(CpuRefreshKind::everything()));
    // CPU usage is a delta between two refreshes, so a single snapshot reads
    // zero on every core. This is the same trap that had the engine's own
    // meters reporting nothing before they were given a long-lived probe.
    sys.refresh_cpu_all();
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
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

// ============================================================================
// TESTS
// ============================================================================

/// The session cycle, which is the part of this app most worth pinning down.
///
/// `cargo test` used to run nothing at all, and every bug the cycle has had was
/// found by using the app: the loop count that was parsed and never applied,
/// the compound `timer 50m break 10m loop 3` that kept only its first clause,
/// the counter that went back to 1/4 whenever a break was stopped. Those are
/// all pure transitions on `AppState`, which makes them the cheapest thing in
/// the project to hold still.
///
/// Nothing below goes through `tick_timer` or `process_command`: the first
/// would need a real second to pass, and the second a real audio device. The
/// engine's own functions take `&mut AppState` and nothing else, so they are
/// called directly — no Tauri app handle, no `SoundManager`, and no writes to
/// the preferences file on disk.
#[cfg(test)]
mod tests {
    use super::*;

    /// A profile with durations short enough to read in an assertion: two
    /// minutes of focus, one of short break, three of long, three per cycle.
    fn state() -> AppState {
        let mut app_state = AppState::new();
        app_state.active_profile.focus_duration = 120;
        app_state.active_profile.short_break_duration = 60;
        app_state.active_profile.long_break_duration = 180;
        app_state.active_profile.sessions_per_cycle = 3;
        app_state.timer.total_sessions = 3;
        app_state.timer.remaining_seconds = 120;
        app_state.timer.total_seconds = 120;
        app_state
    }

    // ------------------------------------------------------------------
    // Overrides
    // ------------------------------------------------------------------

    #[test]
    fn the_headline_command_sets_all_three_clauses() {
        let mut app_state = state();

        let message = timer_override_command(&["50m", "break", "10m", "loop", "3"], &mut app_state);

        let over = app_state.session_override.as_ref().unwrap();
        assert_eq!(over.focus_duration, Some(3000));
        assert_eq!(over.break_duration, Some(600));
        assert_eq!(over.loop_count, Some(3));
        assert!(message.contains("Focus: 50m"), "{message}");
        assert!(message.contains("Break: 10m"), "{message}");
        assert!(message.contains("Sessions: 3"), "{message}");
    }

    #[test]
    fn any_of_the_three_can_lead() {
        let mut app_state = state();

        break_override_command(&["10m", "loop", "3"], &mut app_state);

        let over = app_state.session_override.as_ref().unwrap();
        assert_eq!(
            over.focus_duration, None,
            "the focus duration should have been left alone"
        );
        assert_eq!(over.break_duration, Some(600));
        assert_eq!(over.loop_count, Some(3));
    }

    #[test]
    fn clauses_accumulate_across_commands() {
        let mut app_state = state();

        timer_override_command(&["50m"], &mut app_state);
        loop_override_command(&["4"], &mut app_state);

        let over = app_state.session_override.as_ref().unwrap();
        assert_eq!(over.focus_duration, Some(3000));
        assert_eq!(over.loop_count, Some(4));
    }

    #[test]
    fn a_trailing_word_that_is_not_a_field_is_an_error() {
        let mut app_state = state();

        let message = timer_override_command(&["50m", "sessions", "3"], &mut app_state);

        assert!(message.starts_with("Error:"), "{message}");
        assert!(app_state.session_override.is_none());
    }

    #[test]
    fn a_clause_with_no_value_is_an_error() {
        let mut app_state = state();

        let message = timer_override_command(&["50m", "break"], &mut app_state);

        assert!(message.starts_with("Error:"), "{message}");
        assert!(message.contains("break duration"), "{message}");
    }

    #[test]
    fn out_of_range_values_are_refused() {
        let mut app_state = state();

        assert!(timer_override_command(&["200m"], &mut app_state).starts_with("Error:"));
        assert!(break_override_command(&["90m"], &mut app_state).starts_with("Error:"));
        assert!(loop_override_command(&["0"], &mut app_state).starts_with("Error:"));
        assert!(app_state.session_override.is_none());
    }

    #[test]
    fn an_override_cannot_be_set_mid_session() {
        let mut app_state = state();
        start_command(&mut app_state);

        let message = timer_override_command(&["50m"], &mut app_state);

        assert_eq!(message, "Stop current session before applying override.");
        assert!(app_state.session_override.is_none());
    }

    #[test]
    fn durations_are_reported_the_way_they_were_typed() {
        assert_eq!(humanize_seconds(3000), "50m");
        assert_eq!(humanize_seconds(90), "1m 30s");
        assert_eq!(humanize_seconds(45), "45s");
    }

    #[test]
    fn asking_about_the_override_answers_in_minutes_too() {
        let mut app_state = state();
        timer_override_command(&["50m", "break", "10m"], &mut app_state);

        let message = override_command(&[], &mut app_state);

        assert!(message.contains("Focus: 50m"), "{message}");
        assert!(message.contains("Break: 10m"), "{message}");
        assert!(!message.contains("3000s"), "{message}");
    }

    // ------------------------------------------------------------------
    // Starting
    // ------------------------------------------------------------------

    #[test]
    fn start_uses_the_profile_when_nothing_overrides_it() {
        let mut app_state = state();

        start_command(&mut app_state);

        assert_eq!(app_state.timer.status, TimerStatus::Running);
        assert_eq!(app_state.timer.session_type, SessionType::Focus);
        assert_eq!(app_state.timer.remaining_seconds, 120);
        assert_eq!(app_state.timer.total_seconds, 120);
        assert_eq!(app_state.timer.current_session, 1);
        assert_eq!(app_state.timer.total_sessions, 3);
    }

    #[test]
    fn start_applies_the_override() {
        let mut app_state = state();
        timer_override_command(&["50m", "loop", "5"], &mut app_state);

        let message = start_command(&mut app_state);

        assert_eq!(app_state.timer.remaining_seconds, 3000);
        assert_eq!(app_state.timer.total_sessions, 5);
        assert!(message.contains("50m focus"), "{message}");
        assert!(message.contains("5 sessions"), "{message}");
    }

    #[test]
    fn starting_again_mid_cycle_keeps_the_session_number() {
        let mut app_state = state();
        start_command(&mut app_state);
        advance_from_finished(&mut app_state); // focus -> short break
        advance_from_finished(&mut app_state); // short break -> idle at session 2

        start_command(&mut app_state);

        assert_eq!(app_state.timer.current_session, 2);
    }

    #[test]
    fn start_refuses_to_restart_a_running_session() {
        let mut app_state = state();
        start_command(&mut app_state);
        app_state.timer.remaining_seconds = 42;

        let message = start_command(&mut app_state);

        assert!(message.starts_with("Session already running"), "{message}");
        assert_eq!(app_state.timer.remaining_seconds, 42, "the clock was reset");
    }

    // ------------------------------------------------------------------
    // The cycle
    // ------------------------------------------------------------------

    #[test]
    fn a_finished_focus_run_rolls_into_its_short_break() {
        let mut app_state = state();
        start_command(&mut app_state);

        let alarm = advance_from_finished(&mut app_state);

        assert_eq!(alarm, ALARM_SESSION_END);
        assert_eq!(app_state.timer.session_type, SessionType::ShortBreak);
        assert_eq!(
            app_state.timer.status,
            TimerStatus::Running,
            "breaks start themselves"
        );
        assert_eq!(app_state.timer.remaining_seconds, 60);
        assert_eq!(
            app_state.timer.current_session, 1,
            "the break belongs to the session it followed"
        );
    }

    #[test]
    fn a_finished_short_break_waits_at_the_next_session() {
        let mut app_state = state();
        start_command(&mut app_state);
        advance_from_finished(&mut app_state);

        let alarm = advance_from_finished(&mut app_state);

        assert_eq!(alarm, ALARM_BREAK_END);
        assert_eq!(app_state.timer.session_type, SessionType::Focus);
        assert_eq!(
            app_state.timer.status,
            TimerStatus::Idle,
            "coming back to the desk is a decision"
        );
        assert_eq!(app_state.timer.current_session, 2);
        assert_eq!(app_state.timer.remaining_seconds, 120);
    }

    #[test]
    fn the_last_focus_run_of_the_cycle_earns_the_long_break() {
        let mut app_state = state();
        start_command(&mut app_state);
        app_state.timer.current_session = 3; // the last of three

        advance_from_finished(&mut app_state);

        assert_eq!(app_state.timer.session_type, SessionType::LongBreak);
        assert_eq!(app_state.timer.remaining_seconds, 180);
    }

    #[test]
    fn the_long_break_ends_the_cycle_and_retires_the_override() {
        let mut app_state = state();
        timer_override_command(&["50m", "loop", "3"], &mut app_state);
        start_command(&mut app_state);
        app_state.timer.current_session = 3;
        advance_from_finished(&mut app_state); // -> long break

        let alarm = advance_from_finished(&mut app_state);

        assert_eq!(alarm, ALARM_CYCLE_END);
        assert!(
            app_state.session_override.is_none(),
            "the override outlived the cycle it belonged to"
        );
        assert_eq!(app_state.timer.status, TimerStatus::Idle);
        assert_eq!(app_state.timer.current_session, 1);
        assert_eq!(
            app_state.timer.total_sessions, 3,
            "back to the profile's cycle"
        );
        assert_eq!(
            app_state.timer.remaining_seconds, 120,
            "back to the profile's duration"
        );
    }

    #[test]
    fn a_whole_three_session_cycle_ends_where_it_started() {
        let mut app_state = state();

        // focus, break, focus, break, focus, long break.
        for _ in 0..6 {
            if app_state.timer.status == TimerStatus::Idle {
                start_command(&mut app_state);
            }
            advance_from_finished(&mut app_state);
        }

        assert_eq!(app_state.timer.status, TimerStatus::Idle);
        assert_eq!(app_state.timer.session_type, SessionType::Focus);
        assert_eq!(app_state.timer.current_session, 1);
    }

    #[test]
    fn a_break_override_applies_to_both_kinds_of_break() {
        let mut app_state = state();
        break_override_command(&["3m", "loop", "2"], &mut app_state);

        assert_eq!(effective_break_seconds(&app_state, false), 180);
        assert_eq!(effective_break_seconds(&app_state, true), 180);
    }

    // ------------------------------------------------------------------
    // Ad-hoc runs
    // ------------------------------------------------------------------

    #[test]
    fn a_duration_without_a_loop_count_is_a_one_off() {
        let mut app_state = state();
        timer_override_command(&["20m"], &mut app_state);

        start_command(&mut app_state);

        assert!(is_adhoc_run(&app_state));
        assert_eq!(
            app_state.timer.total_sessions, 1,
            "no cycle was asked for, so none should be borrowed"
        );
    }

    #[test]
    fn a_one_off_ends_without_a_break_and_takes_its_override_with_it() {
        let mut app_state = state();
        timer_override_command(&["20m"], &mut app_state);
        start_command(&mut app_state);

        let alarm = advance_from_finished(&mut app_state);

        assert_eq!(alarm, ALARM_SESSION_END);
        assert_eq!(
            app_state.timer.session_type,
            SessionType::Focus,
            "nothing follows a one-off"
        );
        assert_eq!(app_state.timer.status, TimerStatus::Idle);
        assert!(app_state.session_override.is_none());
        assert_eq!(
            app_state.timer.remaining_seconds, 120,
            "the profile's duration is back"
        );
        assert_eq!(app_state.timer.total_sessions, 3);
    }

    #[test]
    fn adding_a_loop_count_turns_a_one_off_into_a_cycle() {
        let mut app_state = state();
        timer_override_command(&["20m", "loop", "3"], &mut app_state);

        start_command(&mut app_state);

        assert!(!is_adhoc_run(&app_state));
        assert_eq!(app_state.timer.total_sessions, 3);

        advance_from_finished(&mut app_state);
        assert_eq!(app_state.timer.session_type, SessionType::ShortBreak);
    }

    // ------------------------------------------------------------------
    // Stopping
    // ------------------------------------------------------------------

    #[test]
    fn stopping_a_focus_run_abandons_the_cycle_but_keeps_the_override() {
        let mut app_state = state();
        timer_override_command(&["50m", "loop", "3"], &mut app_state);
        start_command(&mut app_state);
        app_state.timer.current_session = 2;

        let message = stop_command(&mut app_state);

        assert_eq!(app_state.timer.status, TimerStatus::Idle);
        assert_eq!(app_state.timer.current_session, 1);
        assert!(app_state.session_override.is_some());
        assert!(message.contains("Override preserved"), "{message}");
        // Both halves, or the ring draws a progress the session cannot have.
        assert_eq!(app_state.timer.remaining_seconds, 3000);
        assert_eq!(app_state.timer.total_seconds, 3000);
    }

    #[test]
    fn stopping_a_break_moves_the_cycle_on_rather_than_ending_it() {
        let mut app_state = state();
        start_command(&mut app_state);
        advance_from_finished(&mut app_state); // -> short break

        let message = stop_command(&mut app_state);

        assert_eq!(
            app_state.timer.current_session, 2,
            "stopping a break used to send the counter back to 1"
        );
        assert_eq!(app_state.timer.session_type, SessionType::Focus);
        assert!(message.contains("Session 2/3 is up next"), "{message}");
    }

    #[test]
    fn stopping_a_long_break_closes_the_cycle() {
        let mut app_state = state();
        start_command(&mut app_state);
        app_state.timer.current_session = 3;
        advance_from_finished(&mut app_state); // -> long break

        let message = stop_command(&mut app_state);

        assert_eq!(message, "Break ended. Cycle complete.");
        assert_eq!(app_state.timer.current_session, 1);
    }

    #[test]
    fn stopping_an_idle_timer_is_an_error() {
        let mut app_state = state();

        assert!(stop_command(&mut app_state).starts_with("Error:"));
    }

    // ------------------------------------------------------------------
    // Pause, resume and strict mode
    // ------------------------------------------------------------------

    #[test]
    fn pause_and_resume_round_trip() {
        let mut app_state = state();
        start_command(&mut app_state);

        pause_command(&mut app_state);
        assert_eq!(app_state.timer.status, TimerStatus::Paused);

        resume_command(&mut app_state);
        assert_eq!(app_state.timer.status, TimerStatus::Running);
    }

    #[test]
    fn strict_mode_disables_pause_and_stop() {
        let mut app_state = state();
        strict_command(&["on"], &mut app_state);
        start_command(&mut app_state);

        assert!(pause_command(&mut app_state).starts_with("Error:"));
        assert!(stop_command(&mut app_state).starts_with("Error:"));
        assert_eq!(app_state.timer.status, TimerStatus::Running);
    }

    #[test]
    fn strict_mode_cannot_be_armed_mid_session_or_dropped_during_one() {
        let mut app_state = state();
        start_command(&mut app_state);

        assert!(strict_command(&["on"], &mut app_state).starts_with("Error:"));
        assert!(!app_state.strict_mode.is_active);

        app_state.strict_mode.is_active = true;
        assert!(strict_command(&["off"], &mut app_state).starts_with("Error:"));
        assert!(app_state.strict_mode.is_active);
    }

    // ------------------------------------------------------------------
    // Terminal history
    // ------------------------------------------------------------------

    #[test]
    fn history_lists_and_clears() {
        let mut app_state = state();
        app_state.terminal_history = vec!["start".into(), "status".into()];

        let listing = history_command(&[], &mut app_state);
        assert!(listing.contains("start"), "{listing}");
        assert!(listing.contains("status"), "{listing}");

        history_command(&["clear"], &mut app_state);
        assert!(app_state.terminal_history.is_empty());
        assert_eq!(
            history_command(&[], &mut app_state),
            "No command history yet."
        );
    }
    // ------------------------------------------------------------------
    // The two lists that describe this one
    // ------------------------------------------------------------------

    /// Synonyms and aliases that the in-app help list is allowed not to name.
    ///
    /// `sysinfo` and `focus` are second spellings of `system` and `timer`, and
    /// a help list that names every spelling is longer without being more
    /// useful. Tab completion still offers them, because there it costs a line.
    const HELP_MAY_OMIT: &[&str] = &["sysinfo", "focus"];

    /// Every top-level command, read out of the engine's own dispatch.
    ///
    /// Read rather than restated: a hand-kept copy of this list is a third
    /// place to forget, which is the whole problem being tested for.
    fn engine_commands() -> Vec<String> {
        let source = include_str!("timer.rs");

        let start = source
            .find("let result = match cmd {")
            .expect("the dispatch match should still open this way");
        let region = &source[start..];
        let end = region
            .find("_ => format!(")
            .expect("the dispatch match should still end with the unknown-command arm");

        let mut commands = Vec::new();
        for line in region[..end].lines() {
            let line = line.trim();
            if !line.starts_with('"') {
                continue;
            }
            let Some((left, _)) = line.split_once("=>") else {
                continue;
            };
            for word in left.split('|') {
                let word = word.trim().trim_matches('"');
                if !word.is_empty() {
                    commands.push(word.to_string());
                }
            }
        }

        assert!(
            commands.len() > 20,
            "only found {} commands — the parser above has stopped matching the source",
            commands.len()
        );
        commands
    }

    /// Does `listing` offer `command`, either alone or as the head of a longer
    /// entry like `profile list`?
    fn offers(listing: &str, command: &str) -> bool {
        listing.contains(&format!("'{command}'")) || listing.contains(&format!("'{command} "))
    }

    fn slice_between<'a>(source: &'a str, open: &str, close: &str) -> &'a str {
        let start = source.find(open).unwrap_or_else(|| panic!("no {open:?}"));
        let rest = &source[start..];
        let end = rest.find(close).unwrap_or_else(|| panic!("no {close:?}"));
        &rest[..end]
    }

    #[test]
    fn tab_completion_offers_every_command() {
        let listing = slice_between(
            include_str!("../../../src/hooks/use-terminal-modal.ts"),
            "const COMMANDS = [",
            "];",
        );

        let missing: Vec<String> = engine_commands()
            .into_iter()
            .filter(|command| !offers(listing, command))
            .collect();

        // `timer`, `break` and `loop` were all missing here — the three the app
        // is pitched on, so the one line the README leads with was the one line
        // Tab would not finish.
        assert!(
            missing.is_empty(),
            "these commands exist but Tab does not complete them: {missing:?}"
        );
    }

    #[test]
    fn the_help_list_names_every_command() {
        let listing = slice_between(
            include_str!("../../../src/configs/modal-config.ts"),
            "export const commandGroups",
            "\n];",
        );

        let missing: Vec<String> = engine_commands()
            .into_iter()
            .filter(|command| !HELP_MAY_OMIT.contains(&command.as_str()))
            .filter(|command| !offers(listing, command))
            .collect();

        // The list's own comment says it has to be the whole command set
        // rather than a sample of it. It had drifted back into a sample.
        assert!(
            missing.is_empty(),
            "these commands exist but `help` does not list them: {missing:?}"
        );
    }
}
