//! Types module - All data structures for the Zetta Focus engine

use serde::{Deserialize, Serialize};

// ============================================================================
// TIMER TYPES
// ============================================================================

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
pub struct TimerState {
    pub remaining_seconds: u32,
    pub total_seconds: u32,
    pub status: TimerStatus,
    pub session_type: SessionType,
    /// Current session number in the cycle (1-indexed)
    pub current_session: u32,
    /// Total number of sessions in the cycle
    pub total_sessions: u32,
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

/// Default number of sessions per cycle
fn default_sessions_per_cycle() -> u32 {
    4
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
pub struct Profile {
    pub id: String,
    pub name: String,
    pub season: Season,
    pub motion_intensity: MotionIntensity,
    pub background_type: BackgroundType,
    pub focus_duration: u32,
    pub short_break_duration: u32,
    pub long_break_duration: u32,
    /// Number of focus sessions per cycle (default: 4)
    #[serde(default = "default_sessions_per_cycle")]
    pub sessions_per_cycle: u32,
    pub glow_color: String,
    pub sound_file: String,
    pub default_volume: u8,
    #[serde(default)]
    pub is_preset: bool,
}

// ============================================================================
// STATS TYPES
// ============================================================================

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

impl Default for SystemStats {
    fn default() -> Self {
        Self::new()
    }
}

impl SystemStats {
    pub fn new() -> Self {
        use sysinfo::System;
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppStats {
    pub cpu_usage: f32,
    pub memory_used: u64,
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

// ============================================================================
// SOUND TYPES
// ============================================================================

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

// ============================================================================
// LICENSE TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseState {
    pub license_type: String,
    pub issued_at: Option<String>,
    pub expires_at: Option<String>,
    pub signature: Option<String>,
}

impl Default for LicenseState {
    fn default() -> Self {
        Self {
            license_type: "Free".to_string(),
            issued_at: None,
            expires_at: None,
            signature: None,
        }
    }
}

impl LicenseState {
    /// Check if the current license is Pro or Founder
    pub fn is_pro(&self) -> bool {
        self.license_type == "Pro" || self.license_type == "Founder"
    }

    /// Check if the license is Founder (permanent status)
    pub fn is_founder(&self) -> bool {
        self.license_type == "Founder"
    }
}

// ============================================================================
// STRICT MODE TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StrictModeState {
    pub is_active: bool,
    pub session_start_timestamp: Option<i64>,
    pub was_force_closed: bool,
}

impl Default for StrictModeState {
    fn default() -> Self {
        Self {
            is_active: false,
            session_start_timestamp: None,
            was_force_closed: false,
        }
    }
}

// ============================================================================
// TASK/INTENTION TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TaskCategory {
    Coding,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CurrentTask {
    pub category: TaskCategory,
    pub title: String,
}

impl Default for CurrentTask {
    fn default() -> Self {
        Self {
            category: TaskCategory::Coding,
            title: String::new(),
        }
    }
}

impl CurrentTask {
    pub fn is_empty(&self) -> bool {
        self.title.trim().is_empty()
    }
}

// ============================================================================
// PREFERENCES TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Preferences {
    pub active_profile_id: String,
    pub ambience_enabled: bool,
    pub volume: u8,
    pub is_muted: bool,
    pub dev_mode: bool,
    pub theme: String,
    pub voice_enabled: bool,
    pub custom_profiles: Vec<Profile>,
    pub start_minimized: bool,
}

impl Default for Preferences {
    fn default() -> Self {
        Self {
            active_profile_id: "winter-deep".to_string(),
            ambience_enabled: true,
            volume: 50,
            is_muted: false,
            dev_mode: false,
            theme: "dark".to_string(),
            voice_enabled: false,
            custom_profiles: vec![],
            start_minimized: false,
        }
    }
}

// ============================================================================
// SESSION OVERRIDE TYPES
// ============================================================================

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

// ============================================================================
// APP STATE
// ============================================================================

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
    pub theme: String,
    pub strict_mode: StrictModeState,
    pub current_task: CurrentTask,
    pub voice_enabled: bool,
    pub app_start_time: i64,
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
            sessions_per_cycle: 4,
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
                sessions_per_cycle: 4,
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
                sessions_per_cycle: 4,
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
                sessions_per_cycle: 4,
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
                current_session: 1,
                total_sessions: 4,
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
            theme: "dark".to_string(),
            strict_mode: StrictModeState::default(),
            current_task: CurrentTask::default(),
            voice_enabled: false,
            app_start_time: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs() as i64,
        }
    }
}

/// Extension trait for AppState to add preference loading/saving
pub trait AppStateExt {
    fn load_preferences(&mut self);
    fn save_preferences(&self) -> Result<(), String>;
}

impl AppStateExt for AppState {
    /// Load preferences from disk and apply to state
    fn load_preferences(&mut self) {
        use crate::storage::load_preferences;

        let prefs = load_preferences();

        // Apply preferences to state
        self.dev_mode = prefs.dev_mode;
        self.ambience_enabled = prefs.ambience_enabled;
        self.sound_state.volume = prefs.volume;
        self.sound_state.is_muted = prefs.is_muted;
        self.theme = prefs.theme;
        self.voice_enabled = prefs.voice_enabled;

        // Add custom profiles to the profiles list
        for profile in prefs.custom_profiles {
            // Only add if not already in list
            if !self.profiles.iter().any(|p| p.id == profile.id) {
                self.profiles.push(profile);
            }
        }

        // Set active profile if it exists
        if let Some(profile) = self
            .profiles
            .iter()
            .find(|p| p.id == prefs.active_profile_id)
        {
            self.active_profile = profile.clone();
            // Timer state is not persisted; align startup timer with restored active profile.
            self.timer.status = TimerStatus::Idle;
            self.timer.session_type = SessionType::Focus;
            self.timer.current_session = 1;
            self.timer.total_sessions = profile.sessions_per_cycle;
            self.timer.remaining_seconds = profile.focus_duration;
            self.timer.total_seconds = profile.focus_duration;
        }
    }

    /// Save current state as preferences to disk
    fn save_preferences(&self) -> Result<(), String> {
        use crate::storage::save_preferences;

        // Get custom profiles (non-preset profiles)
        let custom_profiles: Vec<Profile> = self
            .profiles
            .iter()
            .filter(|p| !p.is_preset)
            .cloned()
            .collect();

        let prefs = Preferences {
            active_profile_id: self.active_profile.id.clone(),
            ambience_enabled: self.ambience_enabled,
            volume: self.sound_state.volume,
            is_muted: self.sound_state.is_muted,
            dev_mode: self.dev_mode,
            theme: self.theme.clone(),
            voice_enabled: self.voice_enabled,
            custom_profiles,
            start_minimized: false,
        };
        save_preferences(&prefs)
    }
}

impl AppState {
    /// Count custom (non-preset) profiles
    pub fn count_custom_profiles(&self) -> usize {
        self.profiles.iter().filter(|p| !p.is_preset).count()
    }

    /// Check if user can create a new profile based on license tier
    /// - Trial/Pro/Founder: Always can create (unlimited)
    /// - Free: Can only create if they have less than 1 custom profile
    pub fn can_create_profile(&self, is_pro: bool) -> bool {
        if is_pro {
            true // Trial, Pro, Founder - unlimited
        } else {
            // Free tier - can only have 1 custom profile
            self.count_custom_profiles() < 1
        }
    }

    /// Check if user can edit a custom profile based on license tier
    /// - Trial/Pro/Founder: Can edit any custom profile
    /// - Free: Can only edit their single custom profile (if exists)
    pub fn can_edit_profile(&self, is_pro: bool, profile_id: &str) -> bool {
        // Find the profile
        if let Some(profile) = self.profiles.iter().find(|p| p.id == profile_id) {
            // Can't edit preset profiles
            if profile.is_preset {
                return false;
            }

            if is_pro {
                true // Trial, Pro, Founder - can edit
            } else {
                // Free tier - can only edit their single custom profile
                self.count_custom_profiles() <= 1
            }
        } else {
            false // Profile doesn't exist
        }
    }

    /// Check if user can create multiple custom profiles based on license tier
    /// - Trial/Pro/Founder: Yes
    /// - Free: No
    pub fn can_create_multiple_profiles(&self, is_pro: bool) -> bool {
        is_pro
    }
}

// ============================================================================
// EVENT TYPES
// ============================================================================

#[derive(Clone, Serialize)]
pub struct StateEvent {
    pub state: AppState,
}
