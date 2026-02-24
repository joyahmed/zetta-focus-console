# Rust Backend Architecture (Tauri)

This file explains the current Rust backend layout after cleanup/refactor.

## Module map

- `src-tauri/src/lib.rs`
  - Tauri bootstrap, tray/shortcuts wiring, command registration.
- `src-tauri/src/engine.rs`
  - Defines shared `EngineState` (`app_state`, `sound_manager`, `license_manager`).
- `src-tauri/src/state.rs`
  - App state ownership and persistence mapping:
  - `AppState`, `Preferences`, `StateEvent`, `AppStateExt`.
- `src-tauri/src/types.rs`
  - Domain/data types only (`TimerState`, `Profile`, enums, stats, etc.).
  - Re-exports state types from `state.rs` for compatibility.
- `src-tauri/src/commands/*.rs`
  - Command handlers and command router.
  - `timer.rs` handles most runtime commands.
  - `settings.rs` handles license/settings/strict-mode commands.
  - `profile.rs` handles profile CRUD/switch.
  - `parser.rs` has command parsing helpers.
- `src-tauri/src/sound.rs`
  - Low-level audio playback (`SoundManager`) and embedded sound assets.
- `src-tauri/src/storage.rs`
  - Preferences/license read/write.

## State ownership

- Canonical runtime state is in `EngineState.app_state: Mutex<AppState>`.
- `AppState` is loaded with defaults via `AppState::new()` then preferences via `load_preferences()`.
- Frontend receives snapshots via `state-updated` events (`StateEvent`).

## Sound behavior (current)

- User intent:
  - `sound play` => sets `sound_state.is_playing = true` (enabled).
  - `sound stop` => sets `is_playing = false` (disabled) and stops sink.
  - `sound mute` => toggles `is_muted`.
- Output gating:
  - Real audio output is synchronized by `sync_sound_output_with_timer()` in `commands/timer.rs`.
  - Audio is only audible when:
    - timer is `Running`
    - `is_playing == true`
    - `is_muted == false`
  - If timer is not running, playback is paused (intent is retained).

## Debugging checklist

1. State seems wrong:
   - Check `commands/timer.rs::process_command` and emitted `state-updated` events.
2. Preferences not sticking:
   - Check `state.rs::save_preferences` and `storage.rs` file path (`get_preferences_path`).
3. Sound plays unexpectedly:
   - Check `sync_sound_output_with_timer` and `sound_command` branches.
4. Profile behavior weird:
   - Check `commands/profile.rs` and whether active profile values update `app_state`.

## Why this refactor

- State definitions were mixed into `types.rs`, making ownership boundaries blurry.
- Placeholder command files (`commands/sound.rs`, `commands/stats.rs`) created noise without behavior.
- Legacy dead code (`license::get_license_state`, unused SoundManager fields) made debugging harder.

Now:
- state lifecycle is centralized in `state.rs`
- domain structs stay in `types.rs`
- dead/placeholder code is removed
