# Zetta Focus Console --- Override & Start Command Revision Plan

## 1. Purpose

Clarify separation between:

-   Session configuration
-   Session execution

Ensure predictable and safe terminal behavior.

------------------------------------------------------------------------

## 2. Command Phases

### Phase 1 --- Configuration

timer `<focus>`{=html} break `<duration>`{=html} loop `<count>`{=html}

Example:

timer 1m break 30s loop 4

This command:

-   Does NOT start session
-   Creates temporary SessionOverride
-   Validates input
-   Prints confirmation
-   Waits for explicit execution

------------------------------------------------------------------------

### Phase 2 --- Execution

start

This command:

-   Starts session using:
    -   SessionOverride (if exists)
    -   Otherwise active profile defaults

start must never silently modify profile.

------------------------------------------------------------------------

## 3. Recommended Power Workflow

stop\
timer 1m break 30s loop 4\
start

Clear and predictable behavior.

------------------------------------------------------------------------

## 4. Terminal Feedback After Override

After running:

timer 1m break 30s loop 4

Terminal must respond:

Override set: - Focus: 1m - Break: 30s - Loops: 4

Run `start` to begin session.

This removes ambiguity.

------------------------------------------------------------------------

## 5. Safety Rules

If session is currently running and user runs:

timer ...

Engine must respond:

"Stop current session before applying override."

Override cannot mutate active running session.

------------------------------------------------------------------------

## 6. start Command Behavior

Case 1 --- Session not running: - Start normally.

Case 2 --- Session already running: - Return message: "Session already
running. Use `stop` before restarting."

Do NOT auto-restart silently.

------------------------------------------------------------------------

## 7. Override Lifecycle

-   Override persists after manual stop.
-   Override clears automatically after session completes naturally.
-   Override clears on app restart.
-   User may manually clear using:

override clear

------------------------------------------------------------------------

## 8. Minimal Stable Command Set

start\
stop\
pause\
resume\
status\
timer `<focus>`{=html} break `<duration>`{=html} loop `<count>`{=html}\
override clear

------------------------------------------------------------------------

## 9. Design Philosophy

-   Configuration and execution are separate.
-   No hidden side effects.
-   Explicit control over implicit behavior.
-   Console behavior must be predictable.

------------------------------------------------------------------------

End of Override & Start Revision Plan
