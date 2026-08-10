//! Types module - shared domain data structures.

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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub season: Season,
    pub motion_intensity: MotionIntensity,
    pub focus_duration: u32,
    pub short_break_duration: u32,
    pub long_break_duration: u32,
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

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Stats {
    pub sessions_today: u32,
    pub total_focus_minutes: u32,
    pub current_streak: u32,
    pub last_session_duration: u32,
}

/// What one day came to.
///
/// The statistics were four running totals, which can say you have done three
/// sessions today and a hundred and forty minutes in all, and nothing whatever
/// about the week those minutes fell in. A day is the smallest unit worth
/// keeping: finer than that is a log, and this is not an analytics product.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DayRecord {
    /// Local date, YYYY-MM-DD.
    pub date: String,
    pub sessions: u32,
    pub focus_minutes: u32,
}

// ============================================================================
// SOUND/SETTINGS TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoundState {
    pub current_sound: Option<String>,
    pub play_ambient_sound: bool,
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
            play_ambient_sound: false,
            volume: 50,
            is_playing: false,
            is_muted: false,
        }
    }
}

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
// SESSION OVERRIDE TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionOverride {
    pub focus_duration: Option<u32>,
    pub break_duration: Option<u32>,
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

    pub fn is_active(&self) -> bool {
        self.focus_duration.is_some() || self.break_duration.is_some() || self.loop_count.is_some()
    }

    pub fn validate(&self) -> Result<(), String> {
        if let Some(focus) = self.focus_duration {
            if !(5..=10800).contains(&focus) {
                return Err("Focus duration must be between 5 seconds and 180 minutes".to_string());
            }
        }

        if let Some(break_dur) = self.break_duration {
            if !(1..=3600).contains(&break_dur) {
                return Err("Break duration must be between 1 second and 60 minutes".to_string());
            }
        }

        if let Some(loops) = self.loop_count {
            if !(1..=100).contains(&loops) {
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
// RE-EXPORTED STATE TYPES
// ============================================================================

pub use crate::state::AppState;
