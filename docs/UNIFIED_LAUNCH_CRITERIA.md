# Unified Launch Criteria - Zetta Focus Console V1

## Philosophy

Zetta Focus Console V1 is a **minimal, disciplined, developer-grade focus engine**. Execute fewer features extremely well. No complexity. No productivity theater. Only intentional focus.

## Core Principles

- Execute fewer features extremely well
- No complexity. No productivity theater. Only intentional focus.
- Performance first: <80MB RAM, <1% CPU, <2s startup
- Terminal is the signature experience - everything keyboard-driven

---

## Phase 1: Foundation (Must Have)

### Global Hotkeys

| Hotkey | Action |
|--------|--------|
| `Ctrl+Alt+S` | Start/Stop timer (system-wide) |
| `Ctrl+Alt+P` | Pause/Resume (system-wide) |
| `Ctrl+T` | Open terminal (system-wide) |

**Requirements:**
- Must work system-wide from any application
- No delay, no flicker, no focus stealing
- Instant response - if hotkeys feel unreliable, the product feels amateur

### System Tray

- Minimize to tray on close
- Tray icon shows state:
  - **Green** = Focus running
  - **Blue** = Break
  - **Gray** = Idle
  - **Red** = Strict Mode active
- Tray menu:
  - Start
  - Stop
  - Pause
  - Resume
  - Settings
  - Quit

**Requirements:**
- Instant response, no lag when restoring window
- Clean icon design
- No memory spikes

### Terminal Excellence

- Persistent command history
- Tab completion
- Command aliases:
  - `s`, `st`, `start` → start session
  - `r`, `stop` → stop session
  - `p`, `pause` → pause session
  - `resume` → resume session
- Clean, minimal output
- Instant feedback (no UI jitter)

**Example output:**
```
> status
Session: Running  Category: coding  Task: Zetta Cloud  Remaining: 18m 42s
```

---

## Phase 2: Discipline (Must Have)

### Strict Mode

- Toggle in settings: `strict on` / `strict off`
- Prevents early stop/pause
- Visual indicator: Red gradient timer ring
- Red tray icon when active
- Red terminal accent when active

**Purpose:** Strict Mode represents commitment. It reinforces the discipline identity.

### Task/Intention System

- Simple task input before session
- Category: `coding` or `other` (only two categories)
- Title: freeform string
- Task displayed during session

**Terminal flow:**
```
> task set "Zetta Cloud" --category coding
> start
```

**Session display:**
```
Session: Running
Category: coding
Task: Zetta Cloud
Remaining: 24m 10s
```

**Purpose:** Tasks exist only to bind intention to a session - NOT a todo manager.

---

## Phase 3: Polish (Should Have)

### Voice Cues (Optional)

- Off by default
- Calm, professional tone (no motivational cringe)
- Session start: "Started [task] [category] session."
- Break start: "Break started."
- Session complete: "[task] [category] session completed."
- Configurable on/off in settings

### Performance Transparency

- `system usage` command showing:
  - CPU usage (app and system)
  - Memory usage
  - App uptime

**No dashboards. No graphs. Just clean terminal output.**

---

## Phase 4: Nice to Have

### Startup Options

- Start with Windows option (default: OFF)
- Start minimized to tray

### Trial Model

- 30-day full Pro access
- All features visible during trial
- No artificial restrictions
- Users must experience full identity

---

## Launch Criteria Checklist

When ALL of these are complete, V1 is ready:

- [ ] Global hotkeys work flawlessly from any app
- [ ] Tray feels native and responsive
- [ ] Terminal feels smooth and professional
- [ ] Strict Mode enforces commitment (no cheating)
- [ ] Task system provides session context
- [ ] Performance stays under 80MB RAM
- [ ] CPU idle remains under 1%
- [ ] Startup time under 2 seconds
- [ ] No UI jank or lag
- [ ] Builds successfully for Windows

---

## What's NOT in V1 (Explicitly Excluded)

- Git integration
- VS Code extension
- Webhooks/automation
- Plugin system
- Multi-device sync
- Analytics dashboard
- Cloud features
- Local API server
- Project tagging beyond task title
- Team collaboration features

These dilute identity. Core must remain sharp.

---

## Performance Budget

| Metric | Target |
|--------|--------|
| Memory Usage | <80MB |
| CPU Idle | <1% |
| CPU Active | <5% |
| Startup Time | <2 seconds |
| Binary Size | <15MB |

---

## Implementation Quality Standards

Developer Mode must feel:

1. **Instant** - No perceptible delay
2. **Reliable** - Works every time
3. **Minimal** - No visual clutter
4. **Predictable** - Consistent behavior
5. **Lightweight** - Respects machine resources

---

Document Version: 1.0 (Unified)
Project: Zetta Focus Console

