# Developer Mode Attraction Plan

## Making Zetta Focus Console Irresistible to Developers

---

## 1. Current State Analysis

### What Already Exists

The foundation is already in place:

| Component | Status | Description |
|-----------|--------|-------------|
| **Dev Mode Toggle** | ✅ Implemented | Simple toggle in Settings panel (`DevModeSection.tsx`) |
| **Terminal System** | ✅ Implemented | Full command palette with `Ctrl+T` trigger, history, autocomplete |
| **Command Parser** | ✅ Implemented | Rust-based parser handling 30+ commands |
| **Engine State Access** | ✅ Implemented | `engine state`, `engine reset`, `app usage`, `system usage` |
| **Stats Panel** | ✅ Implemented | Shows timer status, active profile in Dev Mode |
| **Debug Panel** | ✅ Implemented | License state simulator for testing |

### Existing Dev Mode Commands (Currently Pro-Locked)

```
engine state         - Show detailed engine state
engine reset         - Reset the engine
app usage            - App CPU and memory
system usage         - System CPU and memory
devmode on/off      - Toggle developer diagnostics
```

### What Developers See Today

When Dev Mode is enabled:
- "DEV" badge appears in header
- Stats panel shows Timer Status and Active Profile
- Terminal unlocks additional diagnostic commands
- Basic system metrics in MonitorSection

### Current Gaps

1. **No project awareness** - App doesn't know what project/context developer is working in
2. **No Git integration** - No branch info, commit context, or repo awareness
3. **No IDE integration** - No VS Code, JetBrains, or terminal emulator hooks
4. **No automation** - No webhooks, scripts, or external triggers
5. **No metrics export** - Focus data stays in the app
6. **No CLI** - No standalone command-line interface
7. **Limited terminal polish** - Commands work but lack developer ergonomics

---

## 2. Developer Pain Points

### What Developers Hate About Pomodoro Apps

| Pain Point | Description | Solution We Can Offer |
|------------|-------------|----------------------|
| **Resource Hogs** | Electron apps consume 500MB+ RAM | Tauri advantage: we're already lightweight |
| **Forced Workflow** | Rigid timers, no customization | Full runtime override via terminal |
| **Context Switching** | Switch to app to start/stop | Global hotkeys, CLI, system tray |
| **No Project Memory** | Don't remember what you were focusing on | Git integration, project tagging |
| **Analytics Lock-in** | Can't export or analyze data | JSON/CSV export, API access |
| **Interruptions** | Notifications break flow | Do Not Disturb integration, quiet modes |
| **No Automation** | Can't trigger from scripts | Webhooks, CLI, IPC |

### What Developers Actually Want

1. **Invisibility** - App should run in background, use minimal resources
2. **Keyboard First** - Every action reachable without mouse
3. **Scriptability** - Control via terminal, scripts, other tools
4. **Context** - Know what project/task they're focusing on
5. **Data Ownership** - Export, analyze, visualize their focus data
6. **Integration** - Connect with existing developer tools

---

## 3. Feature Proposals

### Priority 1: Quick Wins (Low Effort, High Impact)

#### 1.1 Global Hotkeys
```
Ctrl+Alt+S    - Start/Stop session (global, works in any app)
Ctrl+Alt+P    - Pause/Resume
Ctrl+Alt+D   - Quick toggle Dev Mode
```

**Why**: Developers hate switching contexts. Global hotkeys make the app invisible.

#### 1.2 System Tray Integration
- Minimize to tray on close
- Tray menu: Start, Stop, Pause, Status, Open, Quit
- Tray icon changes based on session state

**Why**: Developers want the app running but not in their face.

#### 1.3 Enhanced Terminal Experience
- Tab completion for commands
- Command aliases: `s` for `start`, `st` for `status`, `t` for `timer`
- Syntax highlighting for output
- Search within terminal output
- Persistent command history across sessions

**Why**: Terminal power users expect these ergonomics.

#### 1.4 CLI Companion Tool
```bash
# Separate CLI tool that communicates with the app
zetta start --duration 25m --project "feature-login"
zetta status
zetta stop
zetta stats --today --json
```

**Why**: Developers live in their terminal.

---

### Priority 2: Project Awareness (Medium Effort)

#### 2.1 Git Integration
```
# Auto-detect when in a git repo
$ zetta start
Detected: ~/projects/zetta-pomodoro-one (main branch)
Starting focus session for project: zetta-pomodoro-one

# Tag sessions with branch/commit
$ zetta start --branch feature/oauth --commit a1b2c3d
```

**Benefits**:
- Know what you're working on
- Track focus time per branch/feature
- Correlate focus sessions with PRs

#### 2.2 Project Profiles
```json
{
  "project": "zetta-pomodoro-one",
  "defaultDuration": 45,
  "breakDuration": 10,
  "autoStartBreak": true,
  "sound": "rain",
  "gitBranch": "main"
}
```

#### 2.3 VS Code Extension
```json
// In VS Code settings.json
{
  "zetta.focusDuration": 25,
  "zetta.autoStart": true,
  "zetta.showInStatusBar": true
}
```

- Status bar: Current session, time remaining
- Commands: Start, Stop, Pause from command palette
- Auto-start on coding activity

**Why**: Meet developers where they work.

---

### Priority 3: Automation & Integration (Medium-High Effort)

#### 3.1 Webhook System
```yaml
# Config file
webhooks:
  - event: session_start
    url: https://api.example.com/track
    method: POST
    body: |
      {
        "event": "focus_start",
        "project": "{{project}}",
        "duration": "{{duration}}",
        "timestamp": "{{timestamp}}"
      }

  - event: session_complete
    url: https://hooks.slack.com/services/xxx
    method: POST
    body: |
      {
        "text": "✅ Focus session complete! {{focus_minutes}} minutes on {{project}}"
      }
```

**Use Cases**:
- Track in personal analytics (Notion, Airtable)
- Notify team in Slack/Discord
- Log to time tracking apps
- Trigger CI/CD pipelines on focus completion

#### 3.2 Scripting API
```javascript
// zetta-api.js (local HTTP server)
const zetta = require('zetta-client');

await zetta.start({ duration: '25m', project: 'api-dev' });
const status = await zetta.status();
await zetta.stop();
const stats = await zetta.stats({ range: 'week' });
```

#### 3.3 Notification Integrations
- Native OS notifications (already exists partially)
- Custom notification sounds
- Do Not Disturb sync
- Focus mode sync with system

---

### Priority 4: Analytics & Insights (Medium Effort)

#### 4.1 Focus Analytics Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  FOCUS ANALYTICS - Last 30 Days                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Total Focus Time: 42h 30m  ████████████████░░░░░░░  │
│  Average Session: 28m        ████████░░░░░░░░░░░░░░  │
│  Longest Streak: 12 days    █████████████░░░░░░░░░  │
│                                                         │
│  By Project:                                           │
│  ├─ zetta-pomodoro-one  ████████████████████  65%   │
│  ├─ api-server          ████████░░░░░░░░░░░░  25%   │
│  └─ docs               ████░░░░░░░░░░░░░░░░  10%   │
│                                                         │
│  By Git Branch:                                        │
│  ├─ main               ████████████████░░░░░  50%   │
│  ├─ feature/oauth      ████████░░░░░░░░░░░░  25%   │
│  └─ bugfix/login       ██████░░░░░░░░░░░░░░  25%   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 4.2 Data Export
```bash
# Export formats
zetta export --format json --range month
zetta export --format csv --range all
zetta export --format markdown --range week
```

#### 4.3 API Endpoints (Local Server)
```
GET  /api/v1/status      - Current timer state
POST /api/v1/session     - Start/stop session
GET  /api/v1/stats       - Focus statistics
GET  /api/v1/projects    - Time per project
GET  /api/v1/export      - Full data export
```

---

### Priority 5: Advanced Developer Features (High Effort)

#### 5.1 Vim Mode
```
:set vim
# Now all navigation uses vim keys
j/k - Previous/next in lists
/ - Search
Esc - Close modal
:w - Save (in terminal)
```

#### 5.2 Strict Mode Enhancements
```
strict mode --enhance
  ├─ No pause allowed
  ├─ No stop allowed
  ├─ Force full session
  ├─ Block other apps (configurable)
  └─ DND activation
```

#### 5.3 Plugin System
```javascript
// plugins/zetta-plugin-toggl.js
module.exports = {
  name: 'toggl',
  onSessionStart: async (session) => {
    await toggl.startTimer({
      description: session.project,
      duration: session.duration
    });
  },
  onSessionComplete: async (session) => {
    await toggl.stopTimer();
  }
};
```

#### 5.4 Multi-Device Sync
- Cloud sync of settings and stats
- Session history across devices
- Shared team analytics

---

## 4. UI/UX Recommendations

### Design Principles for Developer Mode

| Principle | Implementation |
|-----------|----------------|
| **Minimal by Default** | Hide advanced features behind toggles |
| **Keyboard First** | Every action accessible via hotkey |
| **Terminal Native** | Style terminal to match iTerm2, Windows Terminal |
| **Dark Mode Default** | Developers prefer dark interfaces |
| **Monospace Everywhere** | Code font for all data display |
| **Low Resource** | Keep animations subtle, no bloat |

### Terminal Styling

```css
/* Terminal aesthetic */
.zetta-terminal {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  background: #1e1e1e;
  color: #d4d4d4;
  line-height: 1.5;
}

/* Syntax highlighting */
.command { color: #569cd6; }
.option { color: #9cdcfe; }
.string { color: #ce9178; }
.error { color: #f44747; }
.success { color: #6a9955; }
.prompt { color: #d4d4d4; }
```

### Visual Feedback

| Event | Visual Feedback |
|-------|-----------------|
| Session Start | Tray icon pulses green |
| Session Complete | Tray notification, sound |
| Break Start | Tray icon turns blue |
| Strict Mode | Red border, no controls visible |
| Dev Mode Active | Subtle yellow accent in header |

---

## 5. Integration Ideas

### Terminal Emulators

| Emulator | Integration |
|----------|-------------|
| **iTerm2** | Shell integration, trigger sessions from prompt |
| **Windows Terminal** | Run via wt.exe, status in tab title |
| **Alacritty** | Minimal config, fast execution |
| **Hyper** | Plugin system for custom integration |

### IDEs

| IDE | Integration |
|-----|-------------|
| **VS Code** | Extension with status bar, commands, git awareness |
| **JetBrains** | Plugin with tool window, git integration |
| **Neovim** | Lua plugin, LSP integration |
| **Emacs** | Minor mode, org-mode integration |

### Communication Tools

| Tool | Integration |
|------|-------------|
| **Slack** | `/zetta status`, webhooks for completions |
| **Discord** | Bot commands, activity updates |
| **Microsoft Teams** | Incoming webhooks |

### Time Tracking

| Tool | Integration |
|------|-------------|
| **Toggl** | Auto-sync sessions |
| **Clockify** | Export to workspace |
| **RescueTime** | Focus vs. break correlation |

---

## 6. Resource Optimization

### Maintaining Tauri Advantage

Current Tauri advantages we must preserve:
- Binary size: ~10MB (vs 100MB+ for Electron)
- Memory: ~50MB idle (vs 300MB+ for Electron)
- Startup: <1 second (vs 3-5 seconds for Electron)

### Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| **Lazy Loading** | Only load components when accessed |
| **Efficient Polling** | Dev metrics poll at 1s intervals, not 100ms |
| **Event-Driven** | Use Rust backend events, not React polling |
| **Minimal Dependencies** | Avoid heavy npm packages |
| **Native Features** | Use OS-native where possible |
| **Background Operation** | Minimize to tray, run in background |

### Performance Budget

```
Target Metrics:
├─ Memory Usage: <80MB total
├─ CPU Idle: <1%
├─ CPU Active: <5%
├─ Startup Time: <2 seconds
└─ Binary Size: <15MB
```

---

## 7. Priority Matrix

### Implementation Order

```
Phase 1: Foundation (Weeks 1-2)
├─ [x] Dev Mode toggle (already done)
├─ [1] Global hotkeys
├─ [2] System tray with menu
└─ [3] Enhanced terminal polish

Phase 2: CLI & Automation (Weeks 3-4)
├─ [4] Standalone CLI companion
├─ [5] Webhook system
└─ [6] Scripting API

Phase 3: Project Awareness (Weeks 5-6)
├─ [7] Git integration
├─ [8] Project profiles
└─ [9] VS Code extension

Phase 4: Analytics (Weeks 7-8)
├─ [10] Enhanced analytics dashboard
├─ [11] Data export (JSON/CSV)
└─ [12] Local API server

Phase 5: Advanced (Weeks 9+)
├─ [13] Vim mode
├─ [14] Plugin system
└─ [15] Multi-device sync
```

### Quick Wins vs Long-Term

| Quick Win | Effort | Impact |
|-----------|--------|--------|
| Global Hotkeys | Low | High |
| System Tray | Low | High |
| Terminal Polish | Low | Medium |
| CLI Companion | Medium | High |
| Webhooks | Medium | Medium |
| Git Integration | Medium | High |
| VS Code Extension | Medium | High |
| Analytics Dashboard | Medium | Medium |
| Plugin System | High | High |
| Multi-Device Sync | High | Medium |

---

## 8. Key Differentiators

### Why Developers Will Choose Zetta Focus

| Differentiator | Description |
|----------------|-------------|
| **Tauri Native** | Lightweight, fast, Rust-powered |
| **Terminal First** | Full CLI, keyboard-driven |
| **Scriptable** | Webhooks, API, automation |
| **Git Aware** | Knows your project context |
| **IDE Integrated** | VS Code, JetBrains, Neovim |
| **Data Ownership** | Export anytime, no lock-in |
| **Open Source** | Extensible, auditable |
| **Privacy First** | Local-first, no cloud required |

---

## 9. Next Steps

1. **Review this plan** - Does it align with product vision?
2. **Prioritize Phase 1** - Start with global hotkeys, system tray
3. **Define MVP** - What is the minimum set of features to launch?
4. **Technical spikes** - Prove feasibility of CLI, webhooks, git integration
5. **User research** - Talk to developers about their needs

---

## Appendix: Command Expansion

### New Dev Mode Commands to Implement

```bash
# Project Management
project current           # Show current project
project list             # List known projects
project switch [name]    # Switch project
project tag [tag]        # Add tag to session

# Git Integration (Dev Mode)
git branch              # Show current branch
git commit [ref]        # Show commit being worked on
git status              # Show repo status

# Session Management
session tag [tag]       # Tag current session
session notes [text]    # Add notes to session
session list            # List recent sessions

# Analytics (Dev Mode)
analytics daily         # Today's stats
analytics weekly       # This week's stats
analytics export       # Export all data
analytics project      # Time by project

# System Integration
hotkey list             # Show configured hotkeys
hotkey set [action]     # Bind new hotkey
tray enable/disable     # Toggle system tray

# Advanced
webhook list            # Show configured webhooks
webhook test [name]    # Test a webhook
api start               # Start local API server
```

---

*Document Version: 1.0*
*Created: 2026-02-20*
*For: Zetta Focus Console Developer Mode Enhancement*
