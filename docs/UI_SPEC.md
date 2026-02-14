# 🎨 Zetta Focus Console --- UI Design Specification

## Core Identity

Zetta Focus Console UI must feel:

-   Developer-grade
-   Structured
-   Deterministic
-   Dense but clean
-   Intentional, not decorative

Dark mode is primary. Light mode is secondary.

------------------------------------------------------------------------

# 🌑 Dark Mode (Primary Experience)

## Visual Direction

-   Deep neutral base (no pure black)
-   Bluish gradient background (subtle, not dramatic)
-   Soft glow highlights
-   Strong contrast hierarchy
-   Minimal motion

### Background Gradient (Recommended Direction)

Subtle layered gradient:

-   Base: #0f172a → #111827
-   Accent overlay: soft blue tint (low opacity)
-   No high saturation
-   No heavy glow

Dark mode should feel:

Focused. Engineered. Calm.

------------------------------------------------------------------------

# 🌤 Light Mode (Secondary Experience)

## Visual Direction

-   No pure white
-   Soft neutral base (#f3f4f6 / #e5e7eb range)
-   Reduced ambience
-   Clean borders for structure

Ambience in light mode: - Disabled by default - Optional minimal static
gradient only - No animated overlays

Light mode must feel:

Clean. Minimal. Professional.

Not decorative.

------------------------------------------------------------------------

# 🧱 Layout Structure

## Grid Layout

Top Row: - Timer (Left) - Active Profile (Right)

Bottom Row: - Statistics (Left) - Ambience Panel (Right)

Terminal: - Modal overlay only - Triggered via Ctrl + T - Not embedded
permanently

------------------------------------------------------------------------

# 🔵 Timer Panel

## Design Rules

-   Clear circular ring
-   Strong contrast in dark mode
-   Slightly stronger border contrast in light mode
-   Start button must be visually grounded

Timer state must be visible: - Idle - Running - Break - Complete

No flashy animations.

------------------------------------------------------------------------

# 📊 Statistics Panel

## Design Rules

-   Compact cards
-   Clear typography hierarchy
-   Subtle borders (dark: low contrast, light: slightly stronger)
-   No shadow-heavy cards

Must feel structured, not dashboardy.

------------------------------------------------------------------------

# 🌫 Ambience Panel

## Dark Mode

-   Subtle animated gradient
-   Soft blur
-   Low motion intensity
-   No GPU-heavy effects

## Light Mode

-   Static gradient only
-   Or disabled with intentional message

Ambience must support focus, not distract.

------------------------------------------------------------------------

# 🔠 Typography

-   Monospace elements for technical sections
-   Clean sans-serif for general UI
-   Clear size hierarchy
-   No excessive font weights

------------------------------------------------------------------------

# 🎛 Micro-Interactions

Allowed:

-   Subtle hover state
-   Soft fade transitions
-   Minimal scale effect on buttons

Not allowed:

-   Bounce animations
-   Large motion shifts
-   Floating elements
-   Distracting particles

------------------------------------------------------------------------

# 🧠 Visual Hierarchy Rules

1.  Timer is primary.
2.  Active Profile is secondary.
3.  Stats support behavior insight.
4.  Ambience supports atmosphere.
5.  Terminal is a tool layer, not UI layer.

------------------------------------------------------------------------

# 🚫 What To Avoid

-   Over-glassmorphism in main grid
-   Too many accent colors
-   Saturated gradients
-   Video backgrounds
-   High CPU animations

------------------------------------------------------------------------

# 🎯 Final Goal

UI must feel:

Intentional. Calm. Powerful. Engineered.

Zetta Focus Console is not a productivity toy. It is a focus engine with
a structured interface.
