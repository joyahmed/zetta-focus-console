# 🎨 Zetta Focus Console --- Color Token System

## Core Philosophy

Colors must feel:

-   Engineered
-   Calm
-   Structured
-   Professional
-   Not flashy

Dark mode = Primary identity\
Light mode = Precision alternative

All colors should be defined as tokens. No hardcoded random values in
components.

------------------------------------------------------------------------

# 🧱 Global Semantic Tokens

These tokens represent meaning, not raw color.

--color-primary --color-accent --color-danger --color-muted
--color-border --color-background --color-surface --color-ring-base
--color-ring-progress

------------------------------------------------------------------------

# 🌑 Dark Mode Tokens

## Backgrounds

--color-background: #0f172a --color-surface: #111827

## Borders

--color-border: #1f2937

## Primary Accent (Warm Focus)

--color-primary: #f97316 --color-ring-progress: #f97316

Optional subtle glow: rgba(249, 115, 22, 0.25)

## Base Ring

--color-ring-base: #1e293b

## Danger

--color-danger: #ef4444

## Muted Text

--color-muted: #94a3b8

------------------------------------------------------------------------

# 🌤 Light Mode Tokens

## Backgrounds

--color-background: #f3f4f6 --color-surface: #ffffff

## Borders

--color-border: #d1d5db

## Primary Accent (Cool Precision)

--color-primary: #1d4ed8 --color-ring-progress: #1d4ed8

No glow in light mode.

## Base Ring

--color-ring-base: #9ca3af

## Danger

--color-danger: #dc2626

## Muted Text

--color-muted: #6b7280

------------------------------------------------------------------------

# 🔵 Timer Ring System

## Dark Mode

Base Ring: --color-ring-base\
Progress Arc: --color-ring-progress\
Glow: Optional, low intensity only

## Light Mode

Base Ring: --color-ring-base\
Progress Arc: --color-ring-progress\
No glow\
Flat stroke only

Stroke width ratio:

Base: 7px\
Progress: 9px

------------------------------------------------------------------------

# 🎛 Interactive Elements

## Primary Button

Background: --color-primary\
Text: #ffffff\
Hover: Slightly darker shade of primary

## Secondary Button

Background: Neutral surface\
Border: --color-border

## Danger Button

Background: Transparent\
Border: --color-danger\
Text: --color-danger

------------------------------------------------------------------------

# 📐 Rules

1.  Never mix orange and blue in same theme.
2.  Dark = warm accent.
3.  Light = cool accent.
4.  No neon saturation.
5.  No pure black or pure white.
6.  No heavy gradients except subtle background layering in dark mode.

------------------------------------------------------------------------

# 🎯 Final Goal

Color system must communicate:

Control.\
Precision.\
Calm focus.

Zetta Focus is a desktop engine --- not a decorative productivity app.
