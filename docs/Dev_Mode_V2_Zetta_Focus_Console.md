# Zetta Focus Console

# Dev_Mode_V2 --- Experimental Engine Layer

------------------------------------------------------------------------

## 1. Positioning Strategy

Dev Mode V2 will be implemented fully in the engine, but **not
distributed in the Pro Trial release**.

This creates:

-   Suspense
-   Future expansion potential
-   Marketing leverage
-   Architectural readiness

Public Messaging:

> "Experimental Mode is under active development and will be unlocked in
> a future release."

Internally: All core systems are implemented and stable.

------------------------------------------------------------------------

## 2. Identity

Default Mode: Clean, distraction-free focus tool.

Dev Mode V2: Instrumented focus engine for developers.

------------------------------------------------------------------------

## 3. Architecture Overview

engine/ core.rs snapshot.rs dev.rs events.rs

Dev Mode is engine-owned, not frontend-owned.

------------------------------------------------------------------------

## 4. Dev State (engine/dev.rs)

``` rust
pub struct DevState {
    pub is_active: bool,
}
```

Functions: - enable() - disable() - is_active()

Frontend cannot bypass this state.

------------------------------------------------------------------------

## 5. Engine Snapshot System (engine/snapshot.rs)

``` rust
pub struct EngineSnapshot {
    pub timer_state: String,
    pub phase: String,
    pub remaining_secs: u64,
    pub current_session: u8,
    pub total_sessions: u8,
    pub sound_profile: String,
    pub last_transition_ts: u64,
    pub uptime_secs: u64,
}
```

Exposed through: get_engine_snapshot()

Only accessible when Dev Mode active.

------------------------------------------------------------------------

## 6. Event System (engine/events.rs)

Circular buffer (max 50 events):

``` rust
pub struct EngineEvent {
    pub timestamp: u64,
    pub message: String,
}
```

Exposed via: get_recent_events()

Memory-safe. No unbounded growth.

------------------------------------------------------------------------

## 7. Structured Command System

``` rust
pub enum DevCommand {
    Snapshot,
    ResetEngine,
    DebugTimer,
    ExportState,
    ReloadEngine,
}
```

Handler:

``` rust
pub fn handle_dev_command(cmd: DevCommand) -> Result<DevResponse, DevError>
```

Always structured response. Never panic. Never unsafe.

------------------------------------------------------------------------

## 8. Experimental Controls

Allowed: - Reset Engine - Export Snapshot - Reload Engine

Blocked: - Arbitrary shell execution - Unsafe file access - Persistence
corruption

------------------------------------------------------------------------

## 9. Strict Mode (Sub-layer)

Optional sub-toggle inside Dev Mode:

-   Disable pause
-   Lock profile edits mid-session
-   Enforce full cycle completion

Purpose: Discipline reinforcement.

------------------------------------------------------------------------

## 10. Performance Constraints

-   Dev polling only when panel visible
-   Snapshot lightweight
-   Event buffer capped
-   \<2% runtime overhead

Core timer logic untouched.

------------------------------------------------------------------------

## 11. Trial Strategy

Implementation Status: Fully built internally.

Distribution Status: Hidden in Pro Trial builds.

Benefits:

-   Builds anticipation
-   Allows internal stabilization
-   Creates roadmap milestone
-   Supports future "Pro+" positioning

Marketing Line:

> "Experimental Engine Mode --- Coming Soon."

------------------------------------------------------------------------

End of Dev_Mode_V2 Documentation
