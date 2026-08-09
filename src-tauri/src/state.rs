//! State module - application state, persistence mapping, and state events.

use crate::types::{
    BackgroundType, CurrentTask, MotionIntensity, Profile, Season, SessionOverride, SessionType,
    SoundState, Stats, StrictModeState, TimerState, TimerStatus,
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
    /// Renamed from `voice_enabled`. The alias keeps preferences files
    /// written before the rename loading instead of falling back to defaults.
    #[serde(alias = "voice_enabled")]
    pub alarm_enabled: bool,
    pub custom_profiles: Vec<Profile>,
    pub start_minimized: bool,
    /// Statistics survive restarts. They used to live only in memory, seeded
    /// with invented values, so every launch reported the same fictional four
    /// sessions, hundred minutes and seven-day streak — on a machine that had
    /// never run a session.
    #[serde(default)]
    pub stats: Stats,
    /// Local date of the last completed session, as YYYY-MM-DD. The streak and
    /// the daily count are both derived by comparing this against today.
    #[serde(default)]
    pub last_session_date: String,
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
            theme: "system".to_string(),
            alarm_enabled: false,
            custom_profiles: vec![],
            start_minimized: false,
            stats: Stats::default(),
            last_session_date: String::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppState {
    pub timer: TimerState,
    pub active_profile: Profile,
    pub profiles: Vec<Profile>,
    pub stats: Stats,
    pub dev_mode: bool,
    pub sound_state: SoundState,
    pub session_override: Option<SessionOverride>,
    pub ambience_enabled: bool,
    pub theme: String,
    pub strict_mode: StrictModeState,
    pub current_task: CurrentTask,
    pub alarm_enabled: bool,
    pub app_start_time: i64,
    /// Local date of the last completed session, YYYY-MM-DD. Empty until one
    /// finishes. Drives both the streak and the daily reset.
    pub last_session_date: String,
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
            sound_file: "fireplace.ogg".to_string(),
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
                sound_file: "soft_rain.ogg".to_string(),
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
                sound_file: "light_wind.ogg".to_string(),
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
                sound_file: "rain_window.ogg".to_string(),
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
            stats: Stats::default(),
            dev_mode: false,
            sound_state: SoundState::new(),
            session_override: None,
            ambience_enabled: true,
            theme: "system".to_string(),
            strict_mode: StrictModeState::default(),
            current_task: CurrentTask::default(),
            alarm_enabled: false,
            last_session_date: String::new(),
            app_start_time: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs() as i64,
        }
    }
}

/// Today's date as YYYY-MM-DD in local time.
///
/// Derived from the system clock by hand rather than pulling in a date crate:
/// the only thing needed is whether two completions fall on the same day or on
/// consecutive ones, and a civil-date conversion is a dozen lines.
fn local_date_today() -> String {
    let secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    civil_date(secs / 86_400)
}

/// Days since the Unix epoch -> "YYYY-MM-DD". Howard Hinnant's civil_from_days.
fn civil_date(days: i64) -> String {
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = (z - era * 146_097) as i64;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };

    format!("{:04}-{:02}-{:02}", y, m, d)
}

/// Days between two YYYY-MM-DD strings, or None if either fails to parse.
fn days_between(earlier: &str, later: &str) -> Option<i64> {
    Some(days_from_civil(earlier)? - days_from_civil(later)?)
}

fn days_from_civil(date: &str) -> Option<i64> {
    let mut parts = date.split('-');
    let y: i64 = parts.next()?.parse().ok()?;
    let m: i64 = parts.next()?.parse().ok()?;
    let d: i64 = parts.next()?.parse().ok()?;

    let y = if m <= 2 { y - 1 } else { y };
    let era = if y >= 0 { y } else { y - 399 } / 400;
    let yoe = y - era * 400;
    let mp = if m > 2 { m - 3 } else { m + 9 };
    let doy = (153 * mp + 2) / 5 + d - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;

    Some(era * 146_097 + doe - 719_468)
}

/// Extension trait for AppState to add preference loading/saving.
pub trait AppStateExt {
    fn load_preferences(&mut self);
    fn save_preferences(&self) -> Result<(), String>;
    fn record_completed_session(&mut self, total_seconds: u32);
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
        self.alarm_enabled = prefs.alarm_enabled;

        // Sessions today are only "today" if the saved date is today. Coming
        // back after a break should show a clean count, not the last day used.
        self.stats = prefs.stats;
        self.last_session_date = prefs.last_session_date.clone();
        let today = local_date_today();
        if prefs.last_session_date != today {
            self.stats.sessions_today = 0;
        }
        // A streak is only alive if the last session was today or yesterday.
        match days_between(&today, &prefs.last_session_date) {
            Some(gap) if gap <= 1 => {}
            _ => self.stats.current_streak = 0,
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
            alarm_enabled: self.alarm_enabled,
            custom_profiles,
            start_minimized: false,
            stats: self.stats.clone(),
            last_session_date: self.last_session_date.clone(),
        };
        save_preferences(&prefs)
    }

    /// Fold a finished session into the statistics and persist them.
    ///
    /// The streak advances once per day: a second session on the same day adds
    /// to the counts but not to the streak, a session the day after continues
    /// it, and a longer gap starts over at one.
    fn record_completed_session(&mut self, total_seconds: u32) {
        let today = local_date_today();
        let minutes = total_seconds / 60;

        if self.last_session_date != today {
            self.stats.sessions_today = 0;

            self.stats.current_streak = match days_between(&today, &self.last_session_date) {
                Some(1) => self.stats.current_streak + 1,
                _ => 1,
            };
        }

        self.stats.sessions_today += 1;
        self.stats.total_focus_minutes += minutes;
        self.stats.last_session_duration = minutes;
        self.last_session_date = today;

        let _ = self.save_preferences();
    }
}

impl AppState {
    /// Preset profiles ship with the app and are the fallback the engine
    /// restores to, so they stay read-only. Custom ones are always editable.
    pub fn can_edit_profile(&self, profile_id: &str) -> bool {
        self.profiles
            .iter()
            .find(|p| p.id == profile_id)
            .is_some_and(|profile| !profile.is_preset)
    }
}

#[derive(Clone, Serialize)]
pub struct StateEvent {
    pub state: AppState,
}
