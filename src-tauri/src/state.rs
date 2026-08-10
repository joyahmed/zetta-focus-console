//! State module - application state, persistence mapping, and state events.

use crate::types::{
    CurrentTask, DayRecord, MotionIntensity, Profile, Season, SessionOverride, SessionType,
    SoundState, Stats, StrictModeState, TimerState, TimerStatus,
};
use serde::{Deserialize, Serialize};

/// How many days of history to keep.
///
/// The panel shows a week. Ninety days is what makes the week honest — a
/// fortnight to compare it against, and enough beyond that for a month's total
/// to mean something — while staying a few kilobytes of a file that is already
/// carrying every custom profile.
const SESSION_HISTORY_DAYS: usize = 90;

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
    /// The console's command history, oldest first.
    ///
    /// This lived in `localStorage` — the one piece of state the frontend
    /// owned, which is the single rule this project has. It also meant the
    /// history was tied to the webview's storage rather than to the app, so
    /// anything that cleared it took the history with it.
    #[serde(default)]
    pub terminal_history: Vec<String>,
    /// One entry per day that had a completed focus session, oldest first.
    #[serde(default)]
    pub session_history: Vec<DayRecord>,
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
            terminal_history: vec![],
            session_history: vec![],
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
    /// The console's command history, oldest first.
    ///
    /// Deliberately not part of the state event: every tick broadcasts the
    /// whole of `AppState` to the webview, and a hundred lines of shell history
    /// have no business riding along once a second. The console asks for it
    /// once when it opens.
    #[serde(skip)]
    pub terminal_history: Vec<String>,
    /// One entry per day that had a completed focus session, oldest first.
    ///
    /// Skipped for the same reason as the console history: ninety days of it
    /// has no business being re-serialised to the webview once a second when it
    /// changes a few times a day. The panel asks for it when it mounts and
    /// again whenever a session completes.
    #[serde(skip)]
    pub session_history: Vec<DayRecord>,
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
            terminal_history: Vec::new(),
            session_history: Vec::new(),
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
    fn fold_completed_session(&mut self, today: &str, minutes: u32);
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
        self.terminal_history = prefs.terminal_history;
        self.session_history = prefs.session_history;

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
            terminal_history: self.terminal_history.clone(),
            session_history: self.session_history.clone(),
        };
        save_preferences(&prefs)
    }

    /// Fold a finished session into the statistics and persist them.
    ///
    /// The streak advances once per day: a second session on the same day adds
    /// to the counts but not to the streak, a session the day after continues
    /// it, and a longer gap starts over at one.
    fn record_completed_session(&mut self, total_seconds: u32) {
        self.fold_completed_session(&local_date_today(), total_seconds / 60);
        let _ = self.save_preferences();
    }

    /// The bookkeeping half, with the date passed in and nothing written.
    ///
    /// Split out so the rollup can be tested at all: the day boundaries are
    /// where this gets interesting, and the alternative is a test that can only
    /// ever exercise today and writes to the real preferences file doing it.
    fn fold_completed_session(&mut self, today: &str, minutes: u32) {
        if self.last_session_date != today {
            self.stats.sessions_today = 0;

            self.stats.current_streak = match days_between(today, &self.last_session_date) {
                Some(1) => self.stats.current_streak + 1,
                _ => 1,
            };
        }

        self.stats.sessions_today += 1;
        self.stats.total_focus_minutes += minutes;
        self.stats.last_session_duration = minutes;
        self.last_session_date = today.to_string();

        // Fold it into today's row, or start one. Entries are appended in date
        // order because the only date ever written is today's.
        match self.session_history.last_mut() {
            Some(day) if day.date == today => {
                day.sessions += 1;
                day.focus_minutes += minutes;
            }
            _ => self.session_history.push(DayRecord {
                date: today.to_string(),
                sessions: 1,
                focus_minutes: minutes,
            }),
        }

        let overflow = self
            .session_history
            .len()
            .saturating_sub(SESSION_HISTORY_DAYS);
        if overflow > 0 {
            self.session_history.drain(..overflow);
        }

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

// ============================================================================
// TESTS
// ============================================================================

/// The date arithmetic and the day rollup.
///
/// Both are the kind of thing that looks obviously right and is wrong at a
/// boundary — a leap day, a year end, the difference between "two sessions
/// today" and "one session on each of two days". None of these touch disk:
/// `record_completed_session` saves preferences, so the rollup is exercised
/// through `fold_completed_session`, which is the part without the write.
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn civil_dates_round_trip() {
        for date in [
            "1970-01-01",
            "2000-02-29",
            "2024-02-29",
            "2026-08-10",
            "2026-12-31",
            "2027-01-01",
        ] {
            let days = days_from_civil(date).expect("parses");
            assert_eq!(civil_date(days), date, "{date} did not survive the trip");
        }
    }

    #[test]
    fn days_between_counts_forward_from_the_later_date() {
        assert_eq!(days_between("2026-08-10", "2026-08-09"), Some(1));
        assert_eq!(days_between("2026-08-10", "2026-08-10"), Some(0));
        // Across a month end, a year end and a leap day.
        assert_eq!(days_between("2026-09-01", "2026-08-31"), Some(1));
        assert_eq!(days_between("2027-01-01", "2026-12-31"), Some(1));
        assert_eq!(days_between("2024-03-01", "2024-02-29"), Some(1));
    }

    #[test]
    fn days_between_is_none_when_there_is_no_earlier_date() {
        // An empty `last_session_date` is what a fresh install has, and it must
        // not read as "yesterday" or every new install starts on a streak.
        assert_eq!(days_between("2026-08-10", ""), None);
    }

    #[test]
    fn two_sessions_on_one_day_are_one_row() {
        let mut state = AppState::new();

        state.fold_completed_session("2026-08-10", 25);
        state.fold_completed_session("2026-08-10", 50);

        assert_eq!(state.session_history.len(), 1);
        assert_eq!(state.session_history[0].sessions, 2);
        assert_eq!(state.session_history[0].focus_minutes, 75);
        assert_eq!(state.stats.sessions_today, 2);
    }

    #[test]
    fn a_new_day_is_a_new_row_and_resets_the_daily_count() {
        let mut state = AppState::new();

        state.fold_completed_session("2026-08-10", 25);
        state.fold_completed_session("2026-08-11", 30);

        assert_eq!(state.session_history.len(), 2);
        assert_eq!(state.session_history[1].date, "2026-08-11");
        assert_eq!(
            state.stats.sessions_today, 1,
            "the count is today's, not the total"
        );
        assert_eq!(
            state.stats.total_focus_minutes, 55,
            "the total is every day's"
        );
    }

    #[test]
    fn the_streak_advances_once_a_day_and_breaks_on_a_gap() {
        let mut state = AppState::new();

        state.fold_completed_session("2026-08-10", 25);
        assert_eq!(state.stats.current_streak, 1);

        // A second session the same day is not a second day.
        state.fold_completed_session("2026-08-10", 25);
        assert_eq!(state.stats.current_streak, 1);

        state.fold_completed_session("2026-08-11", 25);
        assert_eq!(state.stats.current_streak, 2);

        // Missing the 12th starts over rather than continuing.
        state.fold_completed_session("2026-08-13", 25);
        assert_eq!(state.stats.current_streak, 1);
    }

    #[test]
    fn history_stops_at_the_cap() {
        let mut state = AppState::new();

        // One session a day for well over the window.
        let mut day = days_from_civil("2026-01-01").unwrap();
        for _ in 0..(SESSION_HISTORY_DAYS + 25) {
            state.fold_completed_session(&civil_date(day), 25);
            day += 1;
        }

        assert_eq!(state.session_history.len(), SESSION_HISTORY_DAYS);
        assert_eq!(
            state.session_history.last().unwrap().date,
            civil_date(day - 1),
            "the newest day is kept"
        );
        assert_eq!(
            state.session_history.first().unwrap().date,
            civil_date(day - SESSION_HISTORY_DAYS as i64),
            "the oldest days are the ones dropped"
        );
    }

    #[test]
    fn a_day_the_clock_went_backwards_over_still_lands() {
        let mut state = AppState::new();

        state.fold_completed_session("2026-08-11", 25);
        // Out of order rather than dropped: the week is read by date, so an
        // earlier row after a later one is harmless, and losing the session
        // would not be.
        state.fold_completed_session("2026-08-10", 25);

        assert_eq!(state.session_history.len(), 2);
        assert_eq!(
            state
                .session_history
                .iter()
                .map(|d| d.sessions)
                .sum::<u32>(),
            2
        );
    }
}
