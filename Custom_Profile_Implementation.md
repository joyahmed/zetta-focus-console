
# Zetta Focus Console — Custom Profile Implementation Plan

## 1. Purpose

Custom Profiles allow users to:

- Create personalized focus configurations
- Modify durations, sound, ambience, and intensity
- Save reusable focus environments
- Extend beyond preset seasonal profiles

Custom Profiles must:
- Be safe
- Be structured
- Never corrupt engine state
- Remain consistent with console identity

---

## 2. Profile Types

There are two profile categories:

### Preset Profiles
- Winter Deep
- Summer Energy
- Spring Bloom
- Autumn Calm

These are protected defaults.

### Custom Profiles
- User-created
- Editable
- Deletable
- Persisted locally

---

## 3. Core Editable Fields

Each custom profile must contain:

- id (string, unique)
- name (display name)
- focus_duration (minutes)
- short_break (minutes)
- long_break (minutes)
- motion_intensity (low | medium | high)
- ambience_type (snow | flame | shimmer | none)
- sound_file (optional)
- default_volume
- background_mode (gradient | particles | custom)

---

## 4. UI Flow

### Create Profile

Button:
[ Create Custom Profile ]

Opens Modal:

Fields:
- Profile Name
- Focus Duration
- Short Break
- Long Break
- Motion Intensity
- Sound Selection
- Background Mode

Buttons:
- Save
- Cancel

---

### Edit Profile

Only allowed for custom profiles.

Preset profiles:
- Can be duplicated
- Cannot be directly modified

---

### Delete Profile

- Confirmation required
- Cannot delete active profile
- If deleted, fallback to default preset

---

## 5. Engine Architecture (Rust)

Create:

engine/profile.rs

Struct:

Profile {
  id: String,
  name: String,
  is_preset: bool,
  focus_duration: u32,
  short_break: u32,
  long_break: u32,
  motion_intensity: MotionLevel,
  ambience_type: AmbienceType,
  sound_file: Option<String>,
  default_volume: u8,
  background_mode: BackgroundMode,
}

Engine must:

- Store profiles in memory
- Persist custom profiles to local storage
- Validate input before saving
- Prevent duplicate IDs

---

## 6. Persistence Strategy

Custom profiles should be:

- Saved locally (JSON or structured store)
- Loaded on app startup
- Validated on load
- Never allow corrupt structure

Preset profiles should:

- Be hardcoded in engine
- Not rely on storage

---

## 7. Runtime Behavior

When switching profile:

- If timer is running:
  - Changes apply next session
- If timer is idle:
  - Apply instantly

Sound and ambience should update immediately.
Focus durations should apply safely.

---

## 8. Terminal Integration

Add commands:

profile list
profile create
profile edit <id>
profile delete <id>
profile duplicate <id>
profile switch <id>

Advanced (Dev Mode only):

profile export
profile import

---

## 9. Safety Rules

- No arbitrary file paths
- No unsafe system calls
- Validate duration ranges (e.g., 1–180 min)
- Prevent negative values
- Prevent empty names

---

## 10. Future Enhancements

- Profile sharing (export file)
- Profile marketplace
- Profile versioning
- Profile locking
- Multi-profile scheduling

---

## 11. Identity Alignment

Presets → Mood-based experience  
Custom → Power-user control  

This keeps both simplicity and depth.

---

End of Custom Profile Implementation Plan
