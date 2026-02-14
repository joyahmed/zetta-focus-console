# Zetta Focus Console --- Runtime Override Implementation Plan

## 1. Purpose

Runtime Override allows fast session configuration via terminal without
modifying profiles.

This enables:

-   Instant experimental sessions
-   Power-user speed
-   No modal interaction
-   No persistent mutation
-   Clean engine separation

Profiles remain untouched.

------------------------------------------------------------------------

## 2. Core Philosophy

Profiles = Persistent Defaults\
Override = Temporary Session Layer

Override must:

-   Apply only to current session
-   Never auto-save
-   Clear automatically after session ends
-   Be visible in UI when active

------------------------------------------------------------------------

## 3. Example Commands

timer 1m break 30s loop 4\
timer 45s break 10s loop 8\
timer 2m break 15s

start\
stop

Override does not require save.

------------------------------------------------------------------------

## 4. Engine Architecture (Rust)

Add:

struct SessionOverride { focus_duration: Option`<u64>`{=html},
break_duration: Option`<u64>`{=html}, loop_count: Option`<u32>`{=html},
}

struct EngineState { active_profile: Profile, session_override:
Option`<SessionOverride>`{=html}, }

Effective config logic:

effective_config = if session_override exists: merge(profile_defaults,
session_override) else: profile_defaults

------------------------------------------------------------------------

## 5. Runtime Behavior

When user runs:

timer 1m break 30s loop 4

Engine must:

-   Parse arguments
-   Validate values
-   Create SessionOverride
-   Store override in memory
-   Print confirmation
-   Not start automatically (unless designed to)

When session ends:

session_override = None

------------------------------------------------------------------------

## 6. Validation Rules

-   Focus duration: 5s -- 180m
-   Break duration: 1s -- 60m
-   Loop count: 1 -- 100
-   Reject invalid syntax
-   Never panic on malformed input

------------------------------------------------------------------------

## 7. UI Behavior

When override is active:

-   Show indicator: "Session Override Active"
-   Display effective durations
-   Do not modify profile panel permanently

After session ends:

-   Indicator disappears
-   UI returns to profile defaults

------------------------------------------------------------------------

## 8. Safety Rules

Override must:

-   Never write to disk
-   Never modify preset or custom profiles
-   Clear on app restart
-   Clear on session completion

------------------------------------------------------------------------

## 9. Future Expansion

Override system later becomes foundation for:

-   Custom profile persistence
-   Profile duplication
-   Profile editing transactions
-   Import/export system

------------------------------------------------------------------------

## 10. Identity Impact

Runtime Override makes Zetta Focus Console:

-   Fast
-   Developer-oriented
-   Experiment-friendly
-   Command-driven

Without sacrificing safety.

------------------------------------------------------------------------

End of Runtime Override Implementation Plan
