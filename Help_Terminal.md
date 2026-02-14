# Zetta Focus Console — Terminal Help

## Overview

The Terminal is a power-user interface for controlling the focus engine.

It allows:

- Starting and stopping sessions
- Applying runtime overrides
- Managing profiles (future)
- Accessing advanced dev commands
- Fast keyboard-driven control

The terminal operates in a configuration → execution model.

---

## Opening & Closing

Open Terminal:
- Ctrl + K (recommended)
- `~` (optional)
- `:` (optional, Vim-style)

Close Terminal:
- Esc

---

## Navigation

Arrow Up / Down:
- Navigate command history

Page Up / Page Down:
- Scroll output

Terminal stores last 200–300 lines of output for performance.

---

## Core Commands

start  
Start a new session using current configuration.

stop  
Immediately stop current session.

pause  
Pause active session.

resume  
Resume paused session.

status  
Display current session state and configuration.

---

## Runtime Override

timer <focus> break <duration> loop <count>

Example:

timer 1m break 30s loop 4

This command:

- Creates temporary session override
- Does NOT auto-start session
- Requires session to be stopped
- Does NOT modify profile permanently

After setting override:

Run `start` to begin session.

---

## Override Management

override clear

Removes active session override and returns to profile defaults.

Override is automatically cleared when session completes naturally.

---

## Behavior Rules

- Cannot modify override while session is running
- Must stop session before applying override
- `start` does NOT restart an active session
- Explicit control is required

---

## Session Summary

After natural completion, terminal prints:

- Total focus time
- Break time
- Loops completed
- Effective configuration used

---

## Dev Mode Commands (If Enabled)

engine state  
app usage  
system usage  
engine reset  

These commands are available only in Dev Mode.

---

## Philosophy

Terminal commands are:

- Explicit
- Predictable
- Deterministic

No hidden side effects.
No automatic restarts.
No silent configuration changes.

---

End of Help_Terminal.md
