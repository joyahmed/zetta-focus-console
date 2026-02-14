# Zetta Focus Console --- Full UI Architecture Plan

## Vision

Zetta Focus Console is not a typical Pomodoro app. It is a
command-driven productivity environment with modular UI and a
Rust-powered engine.

Frontend Stack: - Bun (runtime + package manager) - React (UI rendering
only) - TailwindCSS (styling system)

Backend: - Rust (Focus Engine via Tauri)

React = UI Renderer only\
Rust = Focus Engine

------------------------------------------------------------------------

# 1. Technology Stack

## Frontend

-   Bun (dev server, build tooling, dependency management)
-   React (component rendering only, no business logic)
-   TailwindCSS (utility-first styling)
-   TypeScript (strict mode)

## Backend

-   Rust (state machine, command engine, timer, profiles)
-   Tauri bridge for communication

------------------------------------------------------------------------

# 2. Core Layout (Linux Geek Grid Style)

## Grid Structure

    ┌──────────────────────────────────────────┐
    │                HEADER                    │
    ├───────────────┬──────────────────────────┤
    │     TIMER     │        PROFILE           │
    ├───────────────┼──────────────────────────┤
    │   TERMINAL    │          STATS           │
    └───────────────┴──────────────────────────┘

All panels are independent React components.

------------------------------------------------------------------------

# 3. UI Modules

## 3.1 Header

-   App title: Zetta Focus Console
-   Active Profile Name
-   Developer Mode indicator (if enabled)
-   Minimal icon controls

No business logic.

------------------------------------------------------------------------

## 3.2 Timer Panel

Displays: - Remaining time - Status (Idle / Running / Paused /
Completed) - Glow ring (color from Rust profile state) - Contextual
buttons (only relevant per state)

No countdown logic in React. Time comes from Rust events.

------------------------------------------------------------------------

## 3.3 Profile Panel

Displays: - Current profile name - Season label - Motion intensity
indicator - Background type indicator

Switching profile is done through terminal commands.

------------------------------------------------------------------------

## 3.4 Terminal Panel

Real command interface.

Features: - Scrollable history - JetBrains Mono font - Arrow key history
recall - Help command - Clear command - Structured output display

All command parsing is in Rust.

------------------------------------------------------------------------

## 3.5 Stats Panel

Displays: - Sessions completed today - Total focus time - Current
streak - Last session duration

Read-only state from Rust.

------------------------------------------------------------------------

# 4. TailwindCSS Design System

Base background: bg-\[#0f1115\]

Card background: bg-\[#151821\]

Borders: border border-\[#2a2f3a\]

Typography: font-mono (JetBrains Mono)

Spacing: p-6, gap-6 grid system

No heavy blur by default. Minimal glow using Tailwind utilities + custom
CSS.

------------------------------------------------------------------------

# 5. Background System

Default: - Gradient-based themes - Optional subtle particles

User may add: - Custom image - Custom video

Media stored inside app data directory (Tauri safe storage). No
arbitrary external path execution.

------------------------------------------------------------------------

# 6. Terminal Command Examples

focus start 25\
focus stop\
profile winter-deep\
season summer\
config show\
help

Future: system info\
memory usage

No unrestricted shell execution in public version.

------------------------------------------------------------------------

# 7. State Flow Architecture

Rust Engine → Emits Event → React Updates UI

React never mutates core state.

Event Example: state-updated

React listens using Tauri event listener.

------------------------------------------------------------------------

# 8. Phase Roadmap

Phase 1: - Grid layout - Timer panel - Terminal UI - Mock state using
local object

Phase 2: - Rust engine integration - Event-driven updates - Profile
registry in Rust

Phase 3: - Background customization - Advanced developer mode -
Plugin-ready architecture

------------------------------------------------------------------------

# Final Identity

Zetta Focus Console is:

-   Command-driven
-   Modular
-   Developer-first
-   Built with Bun + React + TailwindCSS
-   Powered by Rust
-   Public-safe
-   Extensible

This is not a cute Pomodoro app.

It is a Focus Operating Console.
