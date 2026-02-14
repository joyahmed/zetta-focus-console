# 🔥 Zetta Focus Console --- Premium Timer Design Specification

## Core Philosophy

The timer is the primary visual element of Zetta Focus.

It must feel:

-   Precise
-   Engineered
-   Calm
-   Deterministic
-   Premium

Not playful. Not fitness-app styled. Not flashy.

------------------------------------------------------------------------

# 🎯 Structural Design

## Ring Architecture

Two-layer structure:

1.  Base Ring (Background)
2.  Progress Arc (Foreground)

------------------------------------------------------------------------

# 🟢 Base Ring (Background)

Purpose: Provide structure and visual grounding.

## Dark Mode

-   Stroke Width: 6px--8px
-   Color: Neutral slate tone (#1f2937 → #374151 range)
-   No glow
-   Low contrast but visible

## Light Mode

-   Stroke Width: 6px--8px
-   Color: Slightly darker neutral (#d1d5db → #9ca3af range)
-   Must be clearly visible
-   No blur
-   No shadow

Base ring should feel architectural, not decorative.

------------------------------------------------------------------------

# 🟠 Progress Arc (Foreground)

Purpose: Visual representation of time remaining.

## Stroke Width

-   8px--10px
-   Slightly thicker than base ring
-   Never exceed 10px

## Stroke Line Cap

-   round
-   Subtle rounded ends only

------------------------------------------------------------------------

# 🌑 Dark Mode Progress Style

-   Primary Accent: Soft orange (#f97316 range)
-   Optional subtle glow (very low intensity)
-   Glow blur: 4px--6px max
-   No neon effect

Optional micro enhancement: Very subtle animated gradient shift (2--3%
movement). Slow, calm, barely noticeable.

------------------------------------------------------------------------

# 🌤 Light Mode Progress Style

-   Flat accent color
-   No glow
-   No shadow
-   Clean stroke only

Light mode must feel minimal and precise.

------------------------------------------------------------------------

# 🔁 Motion Behavior

## Direction

Clockwise progression recommended.

## Animation

-   Smooth transition
-   Linear or very soft ease
-   No bounce
-   No elastic easing

Timer movement must feel controlled.

------------------------------------------------------------------------

# 🧠 Visual States

## Idle

-   Base ring visible
-   Progress arc hidden or at 0
-   No glow

## Running

-   Progress arc visible
-   Subtle visual emphasis
-   No dramatic animation

## Break

-   Slight color variation allowed (optional)
-   Must remain calm

## Complete

-   Brief subtle pulse (dark mode only)
-   300--500ms max
-   No explosive animation

------------------------------------------------------------------------

# 📐 Proportions

Recommended circle size:

-   Diameter: 220px--260px (desktop)
-   Inner whitespace must feel balanced
-   Timer text centered perfectly

Spacing between ring and timer text: Visually comfortable, not tight.

------------------------------------------------------------------------

# 🚫 What To Avoid

-   Thick, heavy strokes
-   High-saturation neon glow
-   Animated bouncing
-   Overly complex gradients
-   Fitness-watch styling
-   Too much drop shadow

------------------------------------------------------------------------

# 🎯 Final Goal

When someone looks at the timer, it should feel:

Reliable. Focused. Engineered.

It must communicate:

"This is a tool."

Not:

"This is a productivity toy."
