# Zetta Focus Console — Dev Mode Implementation Plan

## 1. Purpose

Dev Mode is not a theme toggle.

Dev Mode exposes:
- Internal engine state
- Advanced terminal commands
- Debug controls
- Performance insight
- Unsafe or powerful operations (restricted)

Dev Mode strengthens the identity of Zetta Focus Console as a developer-first focus engine.

---

## 2. Activation Rules

Dev Mode should:

- Be disabled by default
- Be toggleable from Settings panel
- Persist across sessions
- Clearly indicate active state (subtle badge in header)

Optional (Advanced):
- Require confirmation before enabling
- Hide in production builds (config flag)

---

## 3. UI Behavior Changes When Dev Mode Is ON

### Header
- Show subtle "DEV" badge
- Possibly change accent color slightly

### Statistics Panel
- Show additional technical metrics:
  - App RAM (detailed)
  - Engine state
  - Event queue length
  - Last state transition timestamp

### Terminal
Unlock advanced commands.

---

## 4. Advanced Terminal Commands (Dev Mode Only)

Examples:

engine state  
engine reset  
debug timer  
app usage  
system usage  
emit event test  
reload engine  
export state  

Commands must:
- Be validated
- Never panic on invalid input
- Return structured output

---

## 5. Engine Responsibilities (Rust)

Create:

engine/dev.rs

DevState:
- is_dev_mode: bool

Functions:
- enable_dev_mode()
- disable_dev_mode()
- is_dev_mode_active()

Dev Mode must:
- Gate advanced commands
- Gate debug metrics
- Not affect core timer logic

---

## 6. State Transparency (Dev Mode Only)

Expose safe snapshot of:

- TimerState (Idle, Running, Paused, Completed)
- Active profile
- Sound state
- Motion intensity
- Internal timestamps

This snapshot must be read-only.

---

## 7. Safety Rules

Dev Mode must NOT:

- Corrupt persistence
- Allow unsafe system calls
- Expose arbitrary shell execution
- Crash engine on malformed command

Dev Mode increases visibility, not risk.

---

## 8. Performance Considerations

- Dev metrics should not poll aggressively
- Avoid high-frequency system monitoring
- Dev overlays must remain lightweight

---

## 9. Future Enhancements

- Live event stream viewer
- Internal state diff view
- Command history export
- Plugin inspection
- Engine log panel

---

## 10. Identity Alignment

Without Dev Mode:
Zetta Focus Console = Clean Focus Tool

With Dev Mode:
Zetta Focus Console = Focus Engine for Developers

Dev Mode enhances depth without polluting default UX.

---

End of Dev Mode Implementation Plan
