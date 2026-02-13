use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub remaining_seconds: u32,
    pub total_seconds: u32,
    pub status: TimerStatus,
    pub session_type: SessionType,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TimerStatus {
    Idle,
    Running,
    Paused,
    Completed,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum SessionType {
    Focus,
    ShortBreak,
    LongBreak,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub season: Season,
    pub motion_intensity: MotionIntensity,
    pub background_type: BackgroundType,
    pub focus_duration: u32,
    pub short_break_duration: u32,
    pub long_break_duration: u32,
    pub glow_color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Season {
    Spring,
    Summer,
    Autumn,
    Winter,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum MotionIntensity {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum BackgroundType {
    Gradient,
    Particles,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stats {
    pub sessions_today: u32,
    pub total_focus_minutes: u32,
    pub current_streak: u32,
    pub last_session_duration: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub timer: TimerState,
    pub active_profile: Profile,
    pub profiles: Vec<Profile>,
    pub stats: Stats,
    pub dev_mode: bool,
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

impl AppState {
    pub fn new() -> Self {
        let default_profile = Profile {
            id: "winter-deep".to_string(),
            name: "Winter Deep".to_string(),
            season: Season::Winter,
            motion_intensity: MotionIntensity::Low,
            background_type: BackgroundType::Gradient,
            focus_duration: 25 * 60,
            short_break_duration: 5 * 60,
            long_break_duration: 15 * 60,
            glow_color: "#60a5fa".to_string(),
        };

        let profiles = vec![
            default_profile.clone(),
            Profile {
                id: "summer-energy".to_string(),
                name: "Summer Energy".to_string(),
                season: Season::Summer,
                motion_intensity: MotionIntensity::High,
                background_type: BackgroundType::Particles,
                focus_duration: 25 * 60,
                short_break_duration: 5 * 60,
                long_break_duration: 15 * 60,
                glow_color: "#fbbf24".to_string(),
            },
            Profile {
                id: "spring-bloom".to_string(),
                name: "Spring Bloom".to_string(),
                season: Season::Spring,
                motion_intensity: MotionIntensity::Medium,
                background_type: BackgroundType::Gradient,
                focus_duration: 25 * 60,
                short_break_duration: 5 * 60,
                long_break_duration: 15 * 60,
                glow_color: "#34d399".to_string(),
            },
            Profile {
                id: "autumn-calm".to_string(),
                name: "Autumn Calm".to_string(),
                season: Season::Autumn,
                motion_intensity: MotionIntensity::Low,
                background_type: BackgroundType::Gradient,
                focus_duration: 25 * 60,
                short_break_duration: 5 * 60,
                long_break_duration: 15 * 60,
                glow_color: "#f97316".to_string(),
            },
        ];

        Self {
            timer: TimerState {
                remaining_seconds: 25 * 60,
                total_seconds: 25 * 60,
                status: TimerStatus::Idle,
                session_type: SessionType::Focus,
            },
            active_profile: default_profile,
            profiles,
            stats: Stats {
                sessions_today: 4,
                total_focus_minutes: 100,
                current_streak: 7,
                last_session_duration: 25,
            },
            dev_mode: false,
        }
    }
}

pub struct EngineState(pub Mutex<AppState>);

impl EngineState {
    pub fn new() -> Self {
        Self(Mutex::new(AppState::new()))
    }
}

#[derive(Clone, Serialize)]
pub struct StateEvent {
    pub state: AppState,
}

#[tauri::command]
pub fn get_state(state: State<EngineState>) -> Result<AppState, String> {
    let app_state = state.0.lock().map_err(|e| e.to_string())?;
    Ok(app_state.clone())
}

#[tauri::command]
pub fn execute_command(
    command: String,
    state: State<EngineState>,
    app_handle: AppHandle,
) -> Result<String, String> {
    let command_lower = command.to_lowercase();
    let parts: Vec<&str> = command_lower.split_whitespace().collect();
    let cmd = parts.first().map(|s| *s).unwrap_or("");
    let args = &parts[1..];

    let mut app_state = state.0.lock().map_err(|e| e.to_string())?;
    let result = process_command(&mut app_state, cmd, args);

    let _ = app_handle.emit(
        "state-updated",
        StateEvent {
            state: app_state.clone(),
        },
    );

    Ok(result)
}

fn process_command(app_state: &mut AppState, cmd: &str, args: &[&str]) -> String {
    match cmd {
        "help" => "Available commands:
  focus start [minutes]  - Start a focus session (default: 25 min)
  focus stop             - Stop current session
  focus pause            - Pause current session
  focus resume           - Resume paused session
  profile [name]        - Switch to a profile
  profile list           - List all available profiles
  season [name]          - Change season (spring/summer/autumn/winter)
  config show            - Show current configuration
  stats                  - Show detailed statistics
  devmode on/off         - Toggle developer mode
  clear                  - Clear terminal
  help                   - Show this help message"
            .to_string(),

        "focus" => match args.first() {
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
                format!("Starting focus session for {} minutes...", minutes)
            }
            Some(&"stop") => {
                if app_state.timer.status == TimerStatus::Idle {
                    return "Error: No active session to stop.".to_string();
                }
                app_state.timer.status = TimerStatus::Idle;
                app_state.timer.remaining_seconds = app_state.active_profile.focus_duration;
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
            _ => {
                "Error: Unknown focus command. Usage: focus start [minutes] | stop | pause | resume"
                    .to_string()
            }
        },

        "profile" => match args.first() {
            Some(&"list") => {
                let profiles_list: Vec<String> = app_state
                    .profiles
                    .iter()
                    .map(|p| format!("  {} - {}", p.id, p.name))
                    .collect();
                format!("Available profiles:\n{}", profiles_list.join("\n"))
            }
            None => {
                format!(
                    "Current profile: {}\nUse \"profile list\" to see all profiles.",
                    app_state.active_profile.id
                )
            }
            Some(profile_id) => {
                if let Some(profile) = app_state
                    .profiles
                    .iter()
                    .find(|p| p.id.as_str() == *profile_id)
                {
                    app_state.active_profile = profile.clone();
                    format!("Switched to profile: {}", profile.name)
                } else {
                    format!("Error: Profile \"{}\" not found. Use \"profile list\" to see available profiles.", profile_id)
                }
            }
        },

        "season" => match args.first() {
            None => {
                format!("Current season: {:?}", app_state.active_profile.season)
            }
            Some(&"spring") => {
                app_state.active_profile.season = Season::Spring;
                app_state.active_profile.glow_color = "#34d399".to_string();
                "Season set to: spring".to_string()
            }
            Some(&"summer") => {
                app_state.active_profile.season = Season::Summer;
                app_state.active_profile.glow_color = "#fbbf24".to_string();
                "Season set to: summer".to_string()
            }
            Some(&"autumn") => {
                app_state.active_profile.season = Season::Autumn;
                app_state.active_profile.glow_color = "#f97316".to_string();
                "Season set to: autumn".to_string()
            }
            Some(&"winter") => {
                app_state.active_profile.season = Season::Winter;
                app_state.active_profile.glow_color = "#60a5fa".to_string();
                "Season set to: winter".to_string()
            }
            _ => "Error: Invalid season. Choose from: spring, summer, autumn, winter".to_string(),
        },

        "config" => match args.first() {
            Some(&"show") => {
                format!(
                    "Current Configuration:
  Profile: {}
  Season: {:?}
  Motion: {:?}
  Background: {:?}
  Focus: {} min
  Short Break: {} min
  Long Break: {} min",
                    app_state.active_profile.name,
                    app_state.active_profile.season,
                    app_state.active_profile.motion_intensity,
                    app_state.active_profile.background_type,
                    app_state.active_profile.focus_duration / 60,
                    app_state.active_profile.short_break_duration / 60,
                    app_state.active_profile.long_break_duration / 60
                )
            }
            _ => "Error: Unknown config command. Usage: config show".to_string(),
        },

        "stats" => {
            format!(
                "Statistics:
  Sessions Today: {}
  Total Focus: {} minutes
  Current Streak: {} days
  Last Session: {} minutes",
                app_state.stats.sessions_today,
                app_state.stats.total_focus_minutes,
                app_state.stats.current_streak,
                app_state.stats.last_session_duration
            )
        }

        "devmode" => match args.first() {
            Some(&"on") => {
                app_state.dev_mode = true;
                "Developer mode enabled.".to_string()
            }
            Some(&"off") => {
                app_state.dev_mode = false;
                "Developer mode disabled.".to_string()
            }
            _ => "Error: Usage: devmode on | off".to_string(),
        },

        "clear" => "__CLEAR__".to_string(),

        "" => String::new(),

        _ => {
            format!(
                "Error: Unknown command \"{}\". Type \"help\" for available commands.",
                cmd
            )
        }
    }
}

#[tauri::command]
pub fn tick_timer(state: State<EngineState>, app_handle: AppHandle) -> Result<(), String> {
    let mut app_state = state.0.lock().map_err(|e| e.to_string())?;

    if app_state.timer.status == TimerStatus::Running && app_state.timer.remaining_seconds > 0 {
        app_state.timer.remaining_seconds -= 1;

        if app_state.timer.remaining_seconds == 0 {
            app_state.timer.status = TimerStatus::Completed;
            app_state.stats.sessions_today += 1;
            app_state.stats.total_focus_minutes += app_state.timer.total_seconds / 60;
            app_state.stats.last_session_duration = app_state.timer.total_seconds / 60;
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
