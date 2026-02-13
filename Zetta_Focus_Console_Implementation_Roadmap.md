# Zetta Focus Console --- Implementation Roadmap

## Strategic Question

Should we complete UI functionality first?

Yes.

Not business logic. Not fake timer logic. But UI completeness and
interaction wiring must be finished before Rust engine integration.

Reason: - UI defines required engine surface area - Prevents backend
overengineering - Clarifies command interface requirements - Forces
clean component boundaries

------------------------------------------------------------------------

# Phase 1 --- UI Completion (Frontend Only)

Goal: Make the UI structurally complete without adding business logic.

## 1. Terminal UI Must Be Fully Functional (Frontend Level)

-   Input field
-   Command history storage (temporary)
-   Arrow key recall
-   Scrollable output
-   Clear command (frontend only)
-   Help command mock output
-   Auto-scroll on new output
-   Proper monospace styling
-   Cursor blink

No real command execution yet. Just structural behavior.

------------------------------------------------------------------------

## 2. Timer Panel --- Visual Completeness

-   Circular progress animation (CSS only)
-   Idle / Running / Paused visual states
-   Contextual buttons (show/hide correctly)
-   Glow color changes via mock profile
-   Smooth state transition animation

Do NOT implement countdown logic.

------------------------------------------------------------------------

## 3. Profile Panel --- Static but Dynamic-Ready

-   Profile name display
-   Motion intensity bar visual
-   Background type indicator
-   Mock profile switching button
-   Visual change when profile switches (color tint only)

No actual profile engine yet.

------------------------------------------------------------------------

## 4. Stats Panel --- UI Behavior Only

-   Count-up animation mock
-   Placeholder stats
-   Layout polish
-   Subtle hover effects

No persistence.

------------------------------------------------------------------------

## 5. Settings Skeleton

Even if not working yet:

-   Settings button in header
-   Slide-out panel animation
-   Sections prepared:
    -   Background mode
    -   Developer mode toggle
    -   Reset settings
-   UI structure only

------------------------------------------------------------------------

# Phase 2 --- Rust Engine Skeleton

After UI is stable:

## 1. Create Core Rust Engine Structure

-   AppState
-   TimerState
-   Profile registry
-   Command parser stub
-   Event emission system

No advanced features yet.

------------------------------------------------------------------------

## 2. Replace Mock State

React stops using mock state. React listens to Rust events only.

UI becomes pure renderer.

------------------------------------------------------------------------

# Phase 3 --- Real Features

Implement in order:

1.  Real command parsing
2.  Real timer state machine
3.  Profile switching
4.  Persistence
5.  System info commands
6.  Background system
7.  System info
8.  Memory usage
9.  CPU usage


------------------------------------------------------------------------

# Critical Rules

-   React never owns core logic
-   Rust never renders UI
-   All communication via Tauri events
-   No useEffect-based timer loops
-   No business logic inside components

------------------------------------------------------------------------

# Philosophy

Build structure first. Then engine. Then power features.

UI must be complete before brain integration.

This prevents redesign cycles and keeps architecture clean.

------------------------------------------------------------------------

Zetta Focus Console is being built as a product-grade desktop tool, not
a demo app.
