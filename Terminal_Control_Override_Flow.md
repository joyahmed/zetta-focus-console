# Zetta Focus Console --- Terminal Control & Override Flow

## 1. Purpose

Define clean, consistent terminal behavior for:

-   Starting sessions
-   Stopping sessions
-   Applying runtime overrides
-   Maintaining engine safety

This ensures predictable behavior for power users.

------------------------------------------------------------------------

## 2. Core Command Structure

### Session Control Commands

start\
stop\
pause\
resume\
status

These commands control session lifecycle only.

------------------------------------------------------------------------

## 3. Runtime Override Command

timer 1m break 30s loop 4

This command:

-   Does NOT auto-start the session
-   Does NOT modify profile permanently
-   Creates temporary runtime override
-   Requires session to be stopped first

------------------------------------------------------------------------

## 4. Recommended Power Workflow

stop\
timer 1m break 30s loop 4\
start

Alternative explicit form:

focus stop\
timer 1m break 30s loop 4\
focus start

Short form is preferred for clean grammar.

------------------------------------------------------------------------

## 5. Safety Rules

If session is running and user types:

timer 1m break 30s loop 4

Engine must respond:

"Stop current session before applying override."

Override cannot mutate active running session.

------------------------------------------------------------------------

## 6. Override Lifecycle

When user runs:

timer 1m break 30s loop 4

Engine:

-   Parses and validates values
-   Stores SessionOverride in memory
-   Prints confirmation
-   Waits for `start`

When `start` is executed:

-   If override exists → use override config
-   Else → use profile defaults

When session completes:

-   Automatically clear override
-   Return to profile defaults

------------------------------------------------------------------------

## 7. Stop Behavior

When user runs:

stop

Engine must:

-   Immediately cancel session
-   Preserve override (if exists)
-   Allow user to restart with same override

Override should NOT auto-clear on manual stop.

Override clears only when session finishes naturally or when explicitly
cleared.

------------------------------------------------------------------------

## 8. Explicit Override Clear Command

override clear

This command:

-   Removes active SessionOverride
-   Reverts to profile defaults
-   Does not affect current session unless stopped

------------------------------------------------------------------------

## 9. Engine Model (Rust)

struct SessionOverride { focus_duration: Option`<u64>`{=html},
break_duration: Option`<u64>`{=html}, loop_count: Option`<u32>`{=html},
}

struct EngineState { active_profile: Profile, session_override:
Option`<SessionOverride>`{=html}, }

Effective config logic:

if session_override exists: use merged config else: use profile defaults

------------------------------------------------------------------------

## 10. Identity Outcome

This design ensures:

-   Clean command grammar
-   Power-user speed
-   Safe session handling
-   No accidental persistence
-   Clear mental model

Zetta Focus Console remains:

Predictable.\
Powerful.\
Structured.

------------------------------------------------------------------------

End of Terminal Control & Override Flow Plan
