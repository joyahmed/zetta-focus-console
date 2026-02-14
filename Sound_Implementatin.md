# Zetta Focus Console — Sound System Implementation Plan

## 1. Philosophy

Sound must support focus, not distract.

It should:
- Be profile-driven
- Be controlled entirely by Rust engine
- Persist across sessions
- Remain lightweight and minimal

Sound is environmental, not dominant.

---

## 2. Architecture Overview

Frontend (React):
- Volume slider UI
- Mute toggle
- Profile sound selection
- No audio business logic

Rust Engine:
- Owns sound state
- Controls play / pause / stop
- Emits events to UI
- Handles persistence
- Ensures only one active stream

---

## 3. V1 Sound Features

- Ambient loop per profile
- Volume control (0–100%)
- Mute toggle
- Auto-switch when profile changes
- Auto-pause when timer stops
- Resume on timer start (optional)

---

## 4. Rust Structure

Suggested modules:

engine/
  sound.rs
  state.rs

SoundState:
- current_sound: Option<String>
- volume: u8
- is_playing: bool
- is_muted: bool

Functions:
- play(profile_id)
- stop()
- set_volume(value)
- toggle_mute()
- switch_profile(profile_id)

---

## 5. Profile Sound Mapping

Each profile defines:

- sound_file
- default_volume

Example:

Winter Deep → fireplace.mp3
Summer Energy → soft_rain.mp3
Spring Bloom → light_wind.mp3

Sound must auto-update when profile changes.

---

## 6. Performance Rules

- Single audio stream only
- No overlapping layers
- No multi-track mixing (V1)
- Avoid high-bitrate audio files
- No background sound if muted

---

## 7. UI Guidelines

- Keep sound subtle
- No large sound panels
- Use small slider
- Keep controls minimal

---

## 8. Future Enhancements (Phase 2)

- Crossfade transitions
- White noise mode
- Custom sound upload
- Sound intensity presets
- Per-profile advanced tuning

---

End of Sound Implementation Plan
