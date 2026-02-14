
# Zetta Focus Console — Command Palette + Terminal Integration

## 1. Concept Overview

Zetta Focus will use a hybrid command system:

- Search-style Command Trigger in header
- Full Terminal Modal for execution and logs

This creates a clean UI while preserving console power.

---

## 2. Header Command Trigger

### Visual Design

- Slim rounded input field
- Height: 32–36px
- Subtle border
- No heavy shadow
- Minimal padding
- Monospace placeholder

Placeholder Text:
Type a command… (Ctrl + T)

This input is NOT a real inline executor.
It is a trigger that opens the Terminal Modal.

---

## 3. Keyboard Shortcut

Open Command Modal:
Ctrl + T

Close Modal:
Esc

Behavior:
- Ctrl + T opens modal
- Input inside modal auto-focused
- Esc closes modal
- Previous UI state preserved

---

## 4. Terminal Modal Structure

Modal occupies:
- 70–85% width
- 60–75% height
- Centered
- Slight backdrop blur (glass allowed here)

Structure:

Header:
Zetta Focus — Console

Body:
Scrollable output log

Footer:
Command input line

---

## 5. Input Behavior

When modal opens:
- Cursor auto-focused
- Command history accessible via ↑ / ↓
- Enter executes command
- Invalid command shows inline error

---

## 6. Execution Flow

User Action:
Ctrl + T
Type command
Press Enter

System:
- Rust engine parses command
- Returns structured response
- Response rendered in log
- Session state updated if required

---

## 7. Runtime Override Flow

Example:

timer 1m break 30s loop 4
start

Flow:
- Override stored temporarily
- start required to execute
- After completion override clears automatically

---

## 8. Dev Mode Integration

If Dev Mode enabled:

Additional commands available:
engine state
app usage
system usage
engine reset

Dev Mode may optionally enable expanded log view.

---

## 9. Auto-Close Behavior (Optional Enhancement)

Option A:
Modal remains open after execution.

Option B:
Modal auto-closes after successful command (for quick commands).

Recommended:
Keep modal open by default for clarity.

---

## 10. Design Identity

Base UI:
Solid structured grid.

Command System:
Floating glass modal.

This creates a two-layer system:

Layer 1 — Focus Grid
Layer 2 — Command Engine

---

## 11. Why This Model Works

- Clean layout
- No oversized terminal panel
- Discoverable power feature
- Developer-friendly
- Premium feel
- Minimal visual noise

---

End of Command Palette + Terminal Integration Plan
