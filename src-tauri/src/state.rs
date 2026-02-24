//! State module - application state, persistence mapping, and state events.

use crate::types::{
    AppStats, BackgroundType, CurrentTask, MotionIntensity, Profile, Season, SessionOverride,
    SessionType, SoundState, Stats, StrictModeState, SystemStats, TimerState, TimerStatus,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Preferences {
    pub active_profile_id: String,
    pub ambience_enabled: bool,
    #[serde(default)]
    pub play_ambient_sound: bool,
    pub volume: u8,
    pub is_muted: bool,
    pub dev_mode: bool,
    pub theme: String,
    pub voice_enabled: bool,
    pub custom_profiles: Vec<Profile>,
    pub start_minimized: bool,
    #[serde(default)]
    pub debug_license_override: Option<String>,
}

impl Default for Preferences {
    fn default() -> Self {
        Self {
            active_profile_id: "winter-deep".to_string(),
            ambience_enabled: true,
            play_ambient_sound: false,
            volume: 50,
            is_muted: false,
            dev_mode: false,
            theme: "dark".to_string(),
            voice_enabled: false,
            custom_profiles: vec![],
            start_minimized: false,
            debug_license_override: None,
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

/// Extension trait for AppState to add preference loading/saving.
pub trait AppStateExt {
    fn load_preferences(&mut self);
    fn save_preferences(&self) -> Result<(), String>;
}

impl AppStateExt for AppState {
    fn load_preferences(&mut self) {
        use crate::storage::load_preferences;

        let prefs = load_preferences();
        self.dev_mode = prefs.dev_mode;
        self.ambience_enabled = prefs.ambience_enabled;
        self.sound_state.play_ambient_sound = prefs.play_ambient_sound;
        self.sound_state.volume = prefs.volume;
        self.sound_state.is_muted = prefs.is_muted;
        self.theme = prefs.theme;
        self.voice_enabled = prefs.voice_enabled;

        #[cfg(debug_assertions)]
        {
            use crate::license::{DevLicenseOverride, DevOverrides};

            let override_mode = match prefs.debug_license_override.as_deref() {
                Some("force_free") => DevLicenseOverride::ForceFree,
                Some("force_trial") => DevLicenseOverride::ForceTrial,
                Some("force_pro") => DevLicenseOverride::ForcePro,
                Some("force_founder") => DevLicenseOverride::ForceFounder,
                Some("simulate_expired_trial") => DevLicenseOverride::SimulateExpiredTrial,
                _ => DevLicenseOverride::None,
            };

            DevOverrides::set_override(override_mode);
        }

        for profile in prefs.custom_profiles {
            if !self.profiles.iter().any(|p| p.id == profile.id) {
                self.profiles.push(profile);
            }
        }

        if let Some(profile) = self
            .profiles
            .iter()
            .find(|p| p.id == prefs.active_profile_id)
        {
            self.active_profile = profile.clone();
            self.timer.status = TimerStatus::Idle;
            self.timer.session_type = SessionType::Focus;
            self.timer.current_session = 1;
            self.timer.total_sessions = profile.sessions_per_cycle;
            self.timer.remaining_seconds = profile.focus_duration;
            self.timer.total_seconds = profile.focus_duration;
        }
    }

    fn save_preferences(&self) -> Result<(), String> {
        use crate::storage::save_preferences;

        let custom_profiles: Vec<Profile> = self
            .profiles
            .iter()
            .filter(|p| !p.is_preset)
            .cloned()
            .collect();

        let prefs = Preferences {
            active_profile_id: self.active_profile.id.clone(),
            ambience_enabled: self.ambience_enabled,
            play_ambient_sound: self.sound_state.play_ambient_sound,
            volume: self.sound_state.volume,
            is_muted: self.sound_state.is_muted,
            dev_mode: self.dev_mode,
            theme: self.theme.clone(),
            voice_enabled: self.voice_enabled,
            custom_profiles,
            start_minimized: false,
            debug_license_override: {
                #[cfg(debug_assertions)]
                {
                    use crate::license::{DevLicenseOverride, DevOverrides};
                    match DevOverrides::get().override_mode {
                        DevLicenseOverride::None => None,
                        DevLicenseOverride::ForceFree => Some("force_free".to_string()),
                        DevLicenseOverride::ForceTrial => Some("force_trial".to_string()),
                        DevLicenseOverride::ForcePro => Some("force_pro".to_string()),
                        DevLicenseOverride::ForceFounder => Some("force_founder".to_string()),
                        DevLicenseOverride::SimulateExpiredTrial => {
                            Some("simulate_expired_trial".to_string())
                        }
                    }
                }
                #[cfg(not(debug_assertions))]
                {
                    None
                }
            },
        };
        save_preferences(&prefs)
    }
}

impl AppState {
    pub fn count_custom_profiles(&self) -> usize {
        self.profiles.iter().filter(|p| !p.is_preset).count()
    }

    pub fn can_create_profile(&self, is_pro: bool) -> bool {
        if is_pro {
            true
        } else {
            self.count_custom_profiles() < 1
        }
    }

    pub fn can_edit_profile(&self, is_pro: bool, profile_id: &str) -> bool {
        if let Some(profile) = self.profiles.iter().find(|p| p.id == profile_id) {
            if profile.is_preset {
                return false;
            }

            if is_pro {
                true
            } else {
                self.count_custom_profiles() <= 1
            }
        } else {
            false
        }
    }
}

#[derive(Clone, Serialize)]
pub struct StateEvent {
    pub state: AppState,
}
