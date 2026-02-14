use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink, Source};
use serde::{Deserialize, Serialize};
use std::io::Cursor;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use sysinfo::System;
use tauri::{AppHandle, Emitter, State};

/// Get sound data based on sound file name
/// Returns the embedded sound data for the given sound file name
fn get_sound_data(sound_file: &str) -> &'static [u8] {
    match sound_file {
        "fireplace.mp3" => include_bytes!("../sounds/fireplace.mp3"),
        "soft_rain.mp3" => include_bytes!("../sounds/soft_rain.mp3"),
        "light_wind.mp3" => include_bytes!("../sounds/light_wind.mp3"),
        "rain_window.mp3" => include_bytes!("../sounds/rain_window.mp3"),
        _ => include_bytes!("../sounds/fireplace.mp3"), // Default fallback
    }
}

/// Parse duration string like "1m", "30s", "2m30s" into seconds
fn parse_duration(input: &str) -> Result<u32, String> {
    let input = input.to_lowercase();
    let mut total_seconds: u32 = 0;
    let mut current_number = String::new();

    for c in input.chars() {
        if c.is_ascii_digit() {
            current_number.push(c);
        } else if c == 'm' {
            let minutes: u32 = current_number.parse().map_err(|_| "Invalid number")?;
            total_seconds += minutes * 60;
            current_number.clear();
        } else if c == 's' {
            let seconds: u32 = current_number.parse().map_err(|_| "Invalid number")?;
            total_seconds += seconds;
            current_number.clear();
        } else {
            return Err(format!("Invalid character '{}' in duration", c));
        }
    }

    // If there's a number without unit, treat as minutes
    if !current_number.is_empty() {
        let minutes: u32 = current_number.parse().map_err(|_| "Invalid number")?;
        total_seconds += minutes * 60;
    }

    if total_seconds == 0 {
        return Err("Duration cannot be zero".to_string());
    }

    Ok(total_seconds)
}

/// Format seconds into MM:SS display
fn format_time(seconds: u32) -> String {
    let mins = seconds / 60;
    let secs = seconds % 60;
    format!("{:02}:{:02}", mins, secs)
}

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
    pub sound_file: String,
    pub default_volume: u8,
    #[serde(default)]
    pub is_preset: bool,
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
pub struct SystemStats {
    pub cpu_usage: f32,
    pub memory_used: u64,
    pub memory_total: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppStats {
    pub cpu_usage: f32,
    pub memory_used: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoundState {
    pub current_sound: Option<String>,
    pub volume: u8,
    pub is_playing: bool,
    pub is_muted: bool,
}

impl Default for SoundState {
    fn default() -> Self {
        Self::new()
    }
}

impl SoundState {
    pub fn new() -> Self {
        Self {
            current_sound: None,
            volume: 50,
            is_playing: false,
            is_muted: false,
        }
    }
}

/// Session override for runtime configuration without modifying profiles
/// Override applies only to current session and clears automatically
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionOverride {
    pub focus_duration: Option<u32>, // in seconds
    pub break_duration: Option<u32>, // in seconds
    pub loop_count: Option<u32>,
}

impl SessionOverride {
    pub fn new() -> Self {
        Self {
            focus_duration: None,
            break_duration: None,
            loop_count: None,
        }
    }

    /// Check if any override is active
    pub fn is_active(&self) -> bool {
        self.focus_duration.is_some() || self.break_duration.is_some() || self.loop_count.is_some()
    }

    /// Validate override values
    pub fn validate(&self) -> Result<(), String> {
        // Focus duration: 5s -- 180m (10800s)
        if let Some(focus) = self.focus_duration {
            if focus < 5 || focus > 10800 {
                return Err("Focus duration must be between 5 seconds and 180 minutes".to_string());
            }
        }

        // Break duration: 1s -- 60m (3600s)
        if let Some(break_dur) = self.break_duration {
            if break_dur < 1 || break_dur > 3600 {
                return Err("Break duration must be between 1 second and 60 minutes".to_string());
            }
        }

        // Loop count: 1 -- 100
        if let Some(loops) = self.loop_count {
            if loops < 1 || loops > 100 {
                return Err("Loop count must be between 1 and 100".to_string());
            }
        }

        Ok(())
    }
}

impl Default for SessionOverride {
    fn default() -> Self {
        Self::new()
    }
}

pub struct SoundManager {
    sink: Option<Sink>,
    _stream: Option<OutputStream>,
    stream_handle: Option<OutputStreamHandle>,
    is_initialized: AtomicBool,
    current_sound_file: Option<String>,
}

impl SoundManager {
    pub fn new() -> Self {
        Self {
            sink: None,
            _stream: None,
            stream_handle: None,
            is_initialized: AtomicBool::new(false),
            current_sound_file: None,
        }
    }

    pub fn initialize(&mut self) -> Result<(), String> {
        if self.is_initialized.load(Ordering::SeqCst) {
            return Ok(());
        }

        match OutputStream::try_default() {
            Ok((stream, stream_handle)) => {
                self._stream = Some(stream);
                self.stream_handle = Some(stream_handle);
                self.is_initialized.store(true, Ordering::SeqCst);
                Ok(())
            }
            Err(e) => Err(format!("Failed to initialize audio: {}", e)),
        }
    }

    pub fn play(&mut self, sound_data: &'static [u8], volume: u8) -> Result<(), String> {
        if !self.is_initialized.load(Ordering::SeqCst) {
            self.initialize()?;
        }

        self.stop();

        let cursor = Cursor::new(sound_data);
        let source = Decoder::new(cursor).map_err(|e| format!("Failed to decode audio: {}", e))?;

        let stream_handle = self
            .stream_handle
            .as_ref()
            .ok_or_else(|| "Audio stream not initialized".to_string())?;

        let sink =
            Sink::try_new(stream_handle).map_err(|e| format!("Failed to create sink: {}", e))?;

        let volume_float = (volume as f32) / 100.0;
        sink.set_volume(volume_float);
        // Loop the ambient sound indefinitely
        sink.append(source.repeat_infinite());

        self.sink = Some(sink);
        Ok(())
    }

    pub fn stop(&mut self) {
        if let Some(sink) = self.sink.take() {
            sink.stop();
        }
    }

    pub fn set_volume(&mut self, volume: u8) {
        if let Some(sink) = &self.sink {
            let volume_float = (volume as f32) / 100.0;
            sink.set_volume(volume_float);
        }
    }

    pub fn pause(&mut self) {
        if let Some(sink) = &self.sink {
            sink.pause();
        }
    }

    pub fn resume(&mut self) {
        if let Some(sink) = &self.sink {
            sink.play();
        }
    }

    pub fn is_playing(&self) -> bool {
        self.sink
            .as_ref()
            .map(|s| !s.is_paused() && !s.empty())
            .unwrap_or(false)
    }
}

unsafe impl Send for SoundManager {}
unsafe impl Sync for SoundManager {}

impl Default for SystemStats {
    fn default() -> Self {
        Self::new()
    }
}

impl SystemStats {
    pub fn new() -> Self {
        let mut sys = System::new_all();
        sys.refresh_all();
        let cpus = sys.cpus();
        let cpu_usage = if !cpus.is_empty() {
            cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpus.len() as f32
        } else {
            0.0
        };

        Self {
            cpu_usage,
            memory_used: sys.used_memory() / 1024 / 1024,
            memory_total: sys.total_memory() / 1024 / 1024,
        }
    }
}

impl Default for AppStats {
    fn default() -> Self {
        Self::new()
    }
}

impl AppStats {
    pub fn new() -> Self {
        Self {
            cpu_usage: 0.0,
            memory_used: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub timer: TimerState,
    pub active_profile: Profile,
    pub profiles: Vec<Profile>,
    pub stats: Stats,
    pub system_stats: SystemStats,
    pub app_stats: AppStats,
    pub dev_mode: bool,
    pub sound_state: SoundState,
    pub session_override: Option<SessionOverride>,
    pub ambience_enabled: bool,
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
            sound_file: "fireplace.mp3".to_string(),
            default_volume: 50,
            is_preset: true,
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
                sound_file: "soft_rain.mp3".to_string(),
                default_volume: 40,
                is_preset: true,
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
                sound_file: "light_wind.mp3".to_string(),
                default_volume: 30,
                is_preset: true,
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
                sound_file: "rain_window.mp3".to_string(),
                default_volume: 35,
                is_preset: true,
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
            system_stats: SystemStats::new(),
            app_stats: AppStats::new(),
            dev_mode: false,
            sound_state: SoundState::new(),
            session_override: None,
            ambience_enabled: true,
        }
    }
}

pub struct EngineState {
    pub app_state: Mutex<AppState>,
    pub sound_manager: Mutex<SoundManager>,
}

impl EngineState {
    pub fn new() -> Self {
        Self {
            app_state: Mutex::new(AppState::new()),
            sound_manager: Mutex::new(SoundManager::new()),
        }
    }
}

#[derive(Clone, Serialize)]
pub struct StateEvent {
    pub state: AppState,
}

#[tauri::command]
pub fn get_state(state: State<EngineState>) -> Result<AppState, String> {
    let app_state = state.app_state.lock().map_err(|e| e.to_string())?;
    Ok(app_state.clone())
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

    let _ = app_handle.emit(
        "state-updated",
        StateEvent {
            state: app_state.clone(),
        },
    );

    Ok(result)
}

/// Parse command preserving quoted strings
fn parse_command_with_quotes(input: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut current = String::new();
    let mut in_quotes = false;

    for c in input.chars() {
        match c {
            '"' => {
                in_quotes = !in_quotes;
            }
            ' ' if !in_quotes => {
                if !current.is_empty() {
                    result.push(current.clone());
                    current.clear();
                }
            }
            _ => {
                current.push(c);
            }
        }
    }
    if !current.is_empty() {
        result.push(current);
    }

    result
}

fn process_command(
    app_state: &mut AppState,
    sound_manager: &mut SoundManager,
    cmd: &str,
    args: &[&str],
) -> String {
    match cmd {
        "help" => "Available commands:
  start                  - Start session (uses override if set, else profile defaults)
  stop                   - Stop current session (override preserved)
  pause                  - Pause current session
  resume                 - Resume paused session
  status                 - Show current session status
  timer [duration]       - Set focus duration (e.g., timer 1m, timer 30s)
  break [duration]       - Set break duration (e.g., break 30s, break 5m)
  loop [count]           - Set loop count (1-100)
  override clear         - Clear session override
  profile list           - List all available profiles
  profile switch [id]    - Switch to a profile
  profile create         - Create custom profile (see usage)
  profile delete [id]    - Delete a custom profile
  profile duplicate [src] [new] - Duplicate a profile
  season [name]          - Change season (spring/summer/autumn/winter)
  config show            - Show current configuration
  stats                  - Show detailed statistics
  devmode on/off         - Toggle developer mode
  ambience on/off        - Toggle ambient visuals
  sound play             - Play ambient sound
  sound stop             - Stop ambient sound
  sound volume [0-100]   - Set volume level
  sound mute             - Toggle mute
  system                 - Show system information
  memory                 - Show memory usage
  cpu                    - Show CPU usage
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
                // Auto-play sound when timer starts (if not muted)
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
                // Auto-pause sound when timer stops
                if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
                    sound_manager.pause();
                }
                app_state.timer.status = TimerStatus::Idle;
                app_state.timer.remaining_seconds = app_state.active_profile.focus_duration;
                "Focus session stopped.".to_string()
            }
            Some(&"pause") => {
                if app_state.timer.status != TimerStatus::Running {
                    return "Error: No running session to pause.".to_string();
                }
                // Auto-pause sound when timer pauses
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
                // Auto-resume sound when timer resumes
                if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
                    sound_manager.resume();
                }
                app_state.timer.status = TimerStatus::Running;
                "Focus session resumed.".to_string()
            }
            _ => {
                "Error: Unknown focus command. Usage: focus start [minutes] | stop | pause | resume"
                    .to_string()
            }
        },

        // Runtime override commands
        "timer" => {
            // Safety: Can't override while session is running
            if app_state.timer.status == TimerStatus::Running {
                return "Stop current session before applying override.".to_string();
            }

            if let Some(duration_str) = args.first() {
                match parse_duration(duration_str) {
                    Ok(seconds) => {
                        // Validate: 5s -- 180m (10800s)
                        if seconds < 5 || seconds > 10800 {
                            return "Error: Focus duration must be between 5 seconds and 180 minutes.".to_string();
                        }
                        let override_state = app_state
                            .session_override
                            .get_or_insert(SessionOverride::new());
                        override_state.focus_duration = Some(seconds);
                        if let Err(e) = override_state.validate() {
                            return format!("Error: {}", e);
                        }

                        // Build feedback message
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
                    Err(e) => format!("Error: {}", e),
                }
            } else {
                "Error: Missing duration. Usage: timer 1m | timer 30s | timer 2m".to_string()
            }
        }

        "break" => {
            // Safety: Can't override while session is running
            if app_state.timer.status == TimerStatus::Running {
                return "Stop current session before applying override.".to_string();
            }

            if let Some(duration_str) = args.first() {
                match parse_duration(duration_str) {
                    Ok(seconds) => {
                        // Validate: 1s -- 60m (3600s)
                        if seconds < 1 || seconds > 3600 {
                            return "Error: Break duration must be between 1 second and 60 minutes.".to_string();
                        }
                        let override_state = app_state
                            .session_override
                            .get_or_insert(SessionOverride::new());
                        override_state.break_duration = Some(seconds);
                        if let Err(e) = override_state.validate() {
                            return format!("Error: {}", e);
                        }

                        // Build feedback message
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
                    Err(e) => format!("Error: {}", e),
                }
            } else {
                "Error: Missing duration. Usage: break 30s | break 5m".to_string()
            }
        }

        "loop" => {
            // Safety: Can't override while session is running
            if app_state.timer.status == TimerStatus::Running {
                return "Stop current session before applying override.".to_string();
            }

            if let Some(count_str) = args.first() {
                match count_str.parse::<u32>() {
                    Ok(count) => {
                        // Validate: 1 -- 100
                        if count < 1 || count > 100 {
                            return "Error: Loop count must be between 1 and 100.".to_string();
                        }
                        let override_state = app_state
                            .session_override
                            .get_or_insert(SessionOverride::new());
                        override_state.loop_count = Some(count);

                        // Build feedback message
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
                    Err(_) => {
                        "Error: Invalid loop count. Must be a number between 1 and 100.".to_string()
                    }
                }
            } else {
                "Error: Missing count. Usage: loop 4".to_string()
            }
        }

        "start" => {
            // Case 2: Session already running
            if app_state.timer.status == TimerStatus::Running {
                return "Session already running. Use `stop` before restarting.".to_string();
            }

            // Get effective focus duration from override or profile
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

            // Auto-play sound when timer starts (if not muted)
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

        "stop" => {
            if app_state.timer.status == TimerStatus::Idle {
                return "Error: No active session to stop.".to_string();
            }
            // Auto-pause sound when timer stops
            if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
                sound_manager.pause();
            }
            // Override persists after manual stop (per revision plan)
            app_state.timer.status = TimerStatus::Idle;
            app_state.timer.remaining_seconds = app_state.active_profile.focus_duration;

            let override_msg = if app_state.session_override.is_some() {
                " Override preserved."
            } else {
                ""
            };
            format!("Session stopped.{}", override_msg)
        }

        "override" => match args.first() {
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
        },

        "status" => {
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

        "pause" => {
            if app_state.timer.status != TimerStatus::Running {
                return "Error: No running session to pause.".to_string();
            }
            // Auto-pause sound when timer pauses
            if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
                sound_manager.pause();
            }
            app_state.timer.status = TimerStatus::Paused;
            "Session paused.".to_string()
        }

        "resume" => {
            if app_state.timer.status != TimerStatus::Paused {
                return "Error: No paused session to resume.".to_string();
            }
            // Auto-resume sound when timer resumes
            if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
                sound_manager.resume();
            }
            app_state.timer.status = TimerStatus::Running;
            "Session resumed.".to_string()
        }

        "profile" => match args.first() {
            Some(&"list") => {
                let profiles_list: Vec<String> = app_state
                    .profiles
                    .iter()
                    .map(|p| {
                        let preset_tag = if p.is_preset {
                            " [preset]"
                        } else {
                            " [custom]"
                        };
                        format!("  {} - {}{}", p.id, p.name, preset_tag)
                    })
                    .collect();
                format!("Available profiles:\n{}", profiles_list.join("\n"))
            }
            Some(&"create") => {
                // Usage: profile create <name> <focus_min> <short_break_min> <long_break_min> <season> <intensity> <sound>
                // Example: profile create "My Profile" 25 5 15 winter low fireplace
                // ID is auto-generated from name
                if args.len() < 8 {
                    return "Usage: profile create <name> <focus_min> <short_break_min> <long_break_min> <season> <intensity> <sound>\nExample: profile create \"My Profile\" 25 5 15 winter low fireplace".to_string();
                }

                // Get name (quotes already stripped by parser)
                let name = args[1].to_string();

                // Check for duplicate profile name
                if app_state
                    .profiles
                    .iter()
                    .any(|p| p.name.to_lowercase() == name.to_lowercase())
                {
                    return format!("Error: A profile with name '{}' already exists.", name);
                }

                // Auto-generate ID from name: lowercase, replace spaces with hyphens, remove special chars
                let base_id: String = name
                    .to_lowercase()
                    .chars()
                    .map(|c| {
                        if c.is_alphanumeric() {
                            c
                        } else if c == ' ' {
                            '-'
                        } else {
                            '-'
                        }
                    })
                    .collect();

                // Remove consecutive hyphens and trim
                let mut clean_id = String::new();
                let mut prev_hyphen = false;
                for c in base_id.chars() {
                    if c == '-' {
                        if !prev_hyphen {
                            clean_id.push(c);
                        }
                        prev_hyphen = true;
                    } else {
                        clean_id.push(c);
                        prev_hyphen = false;
                    }
                }
                let clean_id = clean_id.trim_matches('-').to_string();

                // Ensure unique ID by adding suffix if needed
                let mut new_id = clean_id.clone();
                let mut suffix = 1;
                while app_state.profiles.iter().any(|p| p.id == new_id) {
                    new_id = format!("{}-{}", clean_id, suffix);
                    suffix += 1;
                }

                // Parse durations
                let focus_min: u32 = match args[2].parse::<u32>() {
                    Ok(v) if v >= 1 && v <= 180 => v * 60,
                    _ => return "Error: Focus duration must be 1-180 minutes.".to_string(),
                };
                let short_break_min: u32 = match args[3].parse::<u32>() {
                    Ok(v) if v >= 1 && v <= 60 => v * 60,
                    _ => return "Error: Short break must be 1-60 minutes.".to_string(),
                };
                let long_break_min: u32 = match args[4].parse::<u32>() {
                    Ok(v) if v >= 1 && v <= 60 => v * 60,
                    _ => return "Error: Long break must be 1-60 minutes.".to_string(),
                };

                // Parse season
                let season = match args[5] {
                    "spring" => Season::Spring,
                    "summer" => Season::Summer,
                    "autumn" => Season::Autumn,
                    "winter" => Season::Winter,
                    _ => {
                        return "Error: Season must be spring, summer, autumn, or winter."
                            .to_string()
                    }
                };

                // Parse intensity
                let intensity = match args[6] {
                    "low" => MotionIntensity::Low,
                    "medium" => MotionIntensity::Medium,
                    "high" => MotionIntensity::High,
                    _ => return "Error: Intensity must be low, medium, or high.".to_string(),
                };

                // Get sound file
                let sound_file = args[7].to_string();

                // Determine glow color based on season
                let glow_color = match season {
                    Season::Spring => "#34d399".to_string(),
                    Season::Summer => "#fbbf24".to_string(),
                    Season::Autumn => "#f97316".to_string(),
                    Season::Winter => "#60a5fa".to_string(),
                };

                let new_profile = Profile {
                    id: new_id.clone(),
                    name: name.clone(),
                    season,
                    motion_intensity: intensity,
                    background_type: BackgroundType::Gradient,
                    focus_duration: focus_min,
                    short_break_duration: short_break_min,
                    long_break_duration: long_break_min,
                    glow_color,
                    sound_file,
                    default_volume: 50,
                    is_preset: false,
                };

                app_state.profiles.push(new_profile);
                format!("Created custom profile '{}' with ID: {}", name, new_id)
            }
            Some(&"delete") => {
                if args.len() < 2 {
                    return "Usage: profile delete <id>".to_string();
                }
                let profile_id = args[1];

                // Find the profile
                if let Some(profile) = app_state.profiles.iter().find(|p| p.id == profile_id) {
                    // Cannot delete presets
                    if profile.is_preset {
                        return "Error: Cannot delete preset profiles. Only custom profiles can be deleted.".to_string();
                    }

                    // Cannot delete active profile
                    if app_state.active_profile.id == profile_id {
                        return "Error: Cannot delete the active profile. Switch to another profile first.".to_string();
                    }

                    // Remove the profile
                    app_state.profiles.retain(|p| p.id != profile_id);
                    format!("Deleted profile: {}", profile_id)
                } else {
                    format!("Error: Profile '{}' not found.", profile_id)
                }
            }
            Some(&"edit") => {
                // Usage: profile edit <id> <name> <focus_min> <short_break_min> <long_break_min> <season> <intensity> <sound>
                if args.len() < 9 {
                    return "Usage: profile edit <id> <name> <focus_min> <short_break_min> <long_break_min> <season> <intensity> <sound>".to_string();
                }
                let profile_id = args[1];
                let new_name = args[2].to_string();

                // Check if profile exists and is not a preset
                let profile_ref = app_state.profiles.iter().find(|p| p.id == profile_id);
                if profile_ref.is_none() {
                    return format!("Error: Profile '{}' not found.", profile_id);
                }
                if profile_ref.unwrap().is_preset {
                    return "Error: Cannot edit preset profiles. Only custom profiles can be edited.".to_string();
                }

                // Check for duplicate name (excluding current profile)
                if app_state
                    .profiles
                    .iter()
                    .any(|p| p.id != profile_id && p.name.to_lowercase() == new_name.to_lowercase())
                {
                    return format!("Error: A profile with name '{}' already exists.", new_name);
                }

                // Parse durations
                let focus_min: u32 = match args[3].parse::<u32>() {
                    Ok(v) if v >= 1 && v <= 180 => v * 60,
                    _ => return "Error: Focus duration must be 1-180 minutes.".to_string(),
                };
                let short_break_min: u32 = match args[4].parse::<u32>() {
                    Ok(v) if v >= 1 && v <= 60 => v * 60,
                    _ => return "Error: Short break must be 1-60 minutes.".to_string(),
                };
                let long_break_min: u32 = match args[5].parse::<u32>() {
                    Ok(v) if v >= 1 && v <= 60 => v * 60,
                    _ => return "Error: Long break must be 1-60 minutes.".to_string(),
                };

                // Parse season
                let season = match args[6].to_lowercase().as_str() {
                    "spring" => Season::Spring,
                    "summer" => Season::Summer,
                    "autumn" => Season::Autumn,
                    "winter" => Season::Winter,
                    _ => {
                        return "Error: Season must be spring, summer, autumn, or winter."
                            .to_string()
                    }
                };

                // Parse intensity
                let intensity = match args[7].to_lowercase().as_str() {
                    "low" => MotionIntensity::Low,
                    "medium" => MotionIntensity::Medium,
                    "high" => MotionIntensity::High,
                    _ => return "Error: Intensity must be low, medium, or high.".to_string(),
                };

                // Get sound file
                let sound_file = args[8].to_string();

                // Determine glow color based on season
                let glow_color = match season {
                    Season::Spring => "#34d399".to_string(),
                    Season::Summer => "#fbbf24".to_string(),
                    Season::Autumn => "#f97316".to_string(),
                    Season::Winter => "#60a5fa".to_string(),
                };

                // Now get mutable access and update
                if let Some(profile) = app_state.profiles.iter_mut().find(|p| p.id == profile_id) {
                    profile.name = new_name.clone();
                    profile.season = season;
                    profile.motion_intensity = intensity;
                    profile.focus_duration = focus_min;
                    profile.short_break_duration = short_break_min;
                    profile.long_break_duration = long_break_min;
                    profile.glow_color = glow_color;
                    profile.sound_file = sound_file;

                    // If this is the active profile, update timer if idle
                    if app_state.active_profile.id == profile_id
                        && app_state.timer.status == TimerStatus::Idle
                    {
                        app_state.timer.remaining_seconds = focus_min;
                        app_state.timer.total_seconds = focus_min;
                    }

                    format!("Updated profile: {}", new_name)
                } else {
                    format!("Error: Profile '{}' not found.", profile_id)
                }
            }
            Some(&"duplicate") => {
                if args.len() < 3 {
                    return "Usage: profile duplicate <source_id> <new_id>".to_string();
                }
                let source_id = args[1];
                let new_id = args[2].to_string();

                // Check if new ID already exists
                if app_state.profiles.iter().any(|p| p.id == new_id) {
                    return format!("Error: Profile with id '{}' already exists.", new_id);
                }

                // Find source profile
                if let Some(source) = app_state.profiles.iter().find(|p| p.id == source_id) {
                    let mut new_profile = source.clone();
                    new_profile.id = new_id.clone();
                    new_profile.name = format!("{} (Copy)", source.name);
                    new_profile.is_preset = false;

                    app_state.profiles.push(new_profile);
                    format!("Duplicated profile '{}' to '{}'", source_id, new_id)
                } else {
                    format!("Error: Source profile '{}' not found.", source_id)
                }
            }
            Some(&"switch") => {
                if args.len() < 2 {
                    return "Usage: profile switch <id>".to_string();
                }
                let profile_id = args[1];

                if let Some(profile) = app_state
                    .profiles
                    .iter()
                    .find(|p| p.id.as_str() == profile_id)
                {
                    app_state.active_profile = profile.clone();
                    // Update timer to match new profile's focus duration (only if idle)
                    if app_state.timer.status == TimerStatus::Idle {
                        app_state.timer.remaining_seconds = profile.focus_duration;
                        app_state.timer.total_seconds = profile.focus_duration;
                    }
                    // Auto-switch sound when profile changes if sound is playing
                    if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
                        let sound_data: &[u8] = get_sound_data(&profile.sound_file);
                        app_state.sound_state.current_sound = Some(profile.sound_file.clone());
                        app_state.sound_state.volume = profile.default_volume;
                        let _ = sound_manager.play(sound_data, app_state.sound_state.volume);
                    }
                    format!("Switched to profile: {}", profile.name)
                } else {
                    format!("Error: Profile \"{}\" not found. Use \"profile list\" to see available profiles.", profile_id)
                }
            }
            None => {
                format!(
                    "Current profile: {}\nUse \"profile list\" to see all profiles.",
                    app_state.active_profile.id
                )
            }
            Some(profile_id) => {
                // Legacy support: treat as switch command
                if let Some(profile) = app_state
                    .profiles
                    .iter()
                    .find(|p| p.id.as_str() == *profile_id)
                {
                    app_state.active_profile = profile.clone();
                    // Update timer to match new profile's focus duration (only if idle)
                    if app_state.timer.status == TimerStatus::Idle {
                        app_state.timer.remaining_seconds = profile.focus_duration;
                        app_state.timer.total_seconds = profile.focus_duration;
                    }
                    // Auto-switch sound when profile changes if sound is playing
                    if app_state.sound_state.is_playing && !app_state.sound_state.is_muted {
                        let sound_data: &[u8] = get_sound_data(&profile.sound_file);
                        app_state.sound_state.current_sound = Some(profile.sound_file.clone());
                        app_state.sound_state.volume = profile.default_volume;
                        let _ = sound_manager.play(sound_data, app_state.sound_state.volume);
                    }
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

        "ambience" => match args.first() {
            Some(&"on") => {
                app_state.ambience_enabled = true;
                "Ambience enabled.".to_string()
            }
            Some(&"off") => {
                app_state.ambience_enabled = false;
                "Ambience disabled.".to_string()
            }
            _ => {
                format!(
                    "Ambience: {}",
                    if app_state.ambience_enabled {
                        "enabled"
                    } else {
                        "disabled"
                    }
                )
            }
        },

        "background" => match args.first() {
            Some(&"gradient") => {
                app_state.active_profile.background_type = BackgroundType::Gradient;
                "Background set to: gradient".to_string()
            }
            Some(&"particles") => {
                app_state.active_profile.background_type = BackgroundType::Particles;
                "Background set to: particles".to_string()
            }
            _ => {
                format!(
                    "Background: {:?}",
                    app_state.active_profile.background_type
                )
            }
        },

        "reset" => {
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
            // Reset dev mode
            app_state.dev_mode = false;
            // Reset ambience
            app_state.ambience_enabled = true;
            // Reset sound state
            app_state.sound_state.volume = 50;
            app_state.sound_state.is_muted = false;
            if app_state.sound_state.is_playing {
                let _ = sound_manager.stop();
                app_state.sound_state.is_playing = false;
                app_state.sound_state.current_sound = None;
            }
            // Reset to default profile (Winter Deep) - this includes background_type to Gradient
            if let Some(default_profile) = app_state.profiles.iter().find(|p| p.id == "winter-deep") {
                app_state.active_profile = default_profile.clone();
            }
            "Settings reset to defaults.".to_string()
        }

        // Dev mode commands - only available when dev_mode is enabled
        "engine" => {
            if !app_state.dev_mode {
                return "Error: Dev mode required. Run 'devmode on' first.".to_string();
            }
            match args.first() {
                Some(&"state") => {
                    format!(
                        "Engine State:\n  Timer: {:?}\n  Remaining: {}s\n  Profile: {}\n  Override: {:?}\n  Dev Mode: {}\n  Ambience: {}",
                        app_state.timer.status,
                        app_state.timer.remaining_seconds,
                        app_state.active_profile.name,
                        app_state.session_override,
                        app_state.dev_mode,
                        app_state.ambience_enabled
                    )
                }
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

        "app" => {
            if !app_state.dev_mode {
                return "Error: Dev mode required. Run 'devmode on' first.".to_string();
            }
            match args.first() {
                Some(&"usage") => {
                    format!(
                        "App Usage:\n  CPU: {:.1}%\n  Memory: {} MB",
                        app_state.app_stats.cpu_usage, app_state.app_stats.memory_used
                    )
                }
                _ => "Error: Usage: app usage".to_string(),
            }
        }

        "system" | "sysinfo" => {
            let mut sys = System::new_all();
            sys.refresh_all();
            format!(
                "System Information:
  OS: {}
  Kernel: {}
  Hostname: {}
  CPU Cores: {}
  Total Memory: {} MB
  Used Memory: {} MB",
                System::name().unwrap_or_else(|| "Unknown".to_string()),
                System::kernel_version().unwrap_or_else(|| "Unknown".to_string()),
                System::host_name().unwrap_or_else(|| "Unknown".to_string()),
                sys.cpus().len(),
                sys.total_memory() / 1024 / 1024,
                sys.used_memory() / 1024 / 1024
            )
        }

        "memory" => {
            let mut sys = System::new_all();
            sys.refresh_memory();
            format!(
                "Memory Usage:
  Total: {} MB
  Used: {} MB
  Available: {} MB
  Usage: {:.1}%",
                sys.total_memory() / 1024 / 1024,
                sys.used_memory() / 1024 / 1024,
                sys.available_memory() / 1024 / 1024,
                (sys.used_memory() as f64 / sys.total_memory() as f64) * 100.0
            )
        }

        "cpu" => {
            let mut sys = System::new_all();
            sys.refresh_cpu_all();
            let cpus = sys.cpus();
            let avg_usage: f32 =
                cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpus.len() as f32;
            format!(
                "CPU Usage:
  Cores: {}
  Average Usage: {:.1}%
  Per Core:{}",
                cpus.len(),
                avg_usage,
                cpus.iter()
                    .enumerate()
                    .map(|(i, c)| format!("\n    Core {}: {:.1}%", i, c.cpu_usage()))
                    .collect::<String>()
            )
        }

        "sound" => match args.first() {
            Some(&"play") => {
                let sound_file = &app_state.active_profile.sound_file;
                app_state.sound_state.current_sound = Some(sound_file.clone());
                app_state.sound_state.is_playing = true;
                app_state.sound_state.volume = app_state.active_profile.default_volume;

                // Get sound data based on profile's sound_file
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
                        format!("Volume set to {}%", vol)
                    } else {
                        "Error: Invalid volume value. Use 0-100".to_string()
                    }
                } else {
                    format!("Current volume: {}%", app_state.sound_state.volume)
                }
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
            _ => {
                format!(
                    "Sound Status: {} | Volume: {}% | Muted: {}",
                    if app_state.sound_state.is_playing {
                        "Playing"
                    } else {
                        "Stopped"
                    },
                    app_state.sound_state.volume,
                    app_state.sound_state.is_muted
                )
            }
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
    let mut app_state = state.app_state.lock().map_err(|e| e.to_string())?;

    if app_state.timer.status == TimerStatus::Running && app_state.timer.remaining_seconds > 0 {
        app_state.timer.remaining_seconds -= 1;

        if app_state.timer.remaining_seconds == 0 {
            app_state.timer.status = TimerStatus::Completed;
            app_state.stats.sessions_today += 1;
            app_state.stats.total_focus_minutes += app_state.timer.total_seconds / 60;
            app_state.stats.last_session_duration = app_state.timer.total_seconds / 60;

            // Emit session completion summary
            let total_focus = app_state.timer.total_seconds;
            let focus_mins = total_focus / 60;
            let focus_secs = total_focus % 60;

            let summary = format!(
                "Session Complete!\n  Focus Time: {}m {}s\n  Profile: {}\n  Sessions Today: {}",
                focus_mins,
                focus_secs,
                app_state.active_profile.name,
                app_state.stats.sessions_today
            );

            let _ = app_handle.emit("session-complete", summary);

            // Clear override when session completes naturally
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

    // System CPU - average across all cores (each core returns 0-100%)
    let cpu_usage = if !cpus.is_empty() {
        cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpus.len() as f32
    } else {
        0.0
    };

    app_state.system_stats = SystemStats {
        cpu_usage: cpu_usage.min(100.0),
        memory_used: sys.used_memory() / 1024 / 1024,
        memory_total: sys.total_memory() / 1024 / 1024,
    };

    // Get current process (the app itself)
    sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

    let pid = sysinfo::Pid::from_u32(std::process::id());
    if let Some(process) = sys.process(pid) {
        let memory_used = process.memory() / 1024 / 1024;

        // CPU from sysinfo's process.cpu_usage() - this is percentage
        let cpu_percent = process.cpu_usage();

        app_state.app_stats = AppStats {
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
