# Zetta Focus Console — UI Layout Redesign Plan

## 1. Problem Statement

Current issues:

- Components feel oversized
- Layout lacks density balance
- Terminal takes too much visual weight
- Ambience placed at bottom feels disconnected
- Grid hierarchy is unclear

Goal:

Create a compact, modular, developer-grade layout with strong visual hierarchy and better spatial balance.

---

## 2. Design Principles

1. Density over emptiness (but not clutter)
2. Clear grid hierarchy
3. Functional zones
4. Compact typography scale
5. Ambient visuals integrated, not detached
6. Terminal treated as tool, not permanent block

---

## 3. Proposed Layout Structure (Desktop)

Use a 3x2 primary grid.

### Top Section (Core Control)

| Timer | Profile |
|-------|---------|

- Timer left (primary focus)
- Profile right (compact configuration overview)

Height: Medium (not dominant)

---

### Middle Section (Operational Tools)

| Stats | Ambience |
|-------|----------|

- Stats: compact system + session info
- Ambience: equal-sized tile
- Ambience no longer bottom-floating

Ambience becomes contextual visual tile.

---

### Bottom Section (Expandable)

Terminal removed from permanent layout.

Terminal becomes modal overlay triggered by shortcut.

---

## 4. Compact Sizing Rules

### Typography Scale

- Title: 18–20px
- Section headers: 14–16px
- Body: 12–14px
- Metrics: 13–15px

Avoid oversized labels.

---

### Panel Height Guidelines

- Timer panel: ~30% vertical space
- Middle grid: ~40%
- Remaining space: padding and breathing room

---

## 5. Ambience Redesign

Current issue:
Ambience placed at bottom feels detached.

New behavior:

- Integrated in middle grid
- Square or 4:3 ratio tile
- Subtle border
- Low motion intensity
- Optional expand button for immersive mode

Ambience should complement stats visually.

---

## 6. Grid System Recommendation

Use CSS Grid instead of flex stacking.

Example conceptual grid:

grid-template-rows:
  auto
  1fr

grid-template-columns:
  1fr 1fr

Each section modular and replaceable.

---

## 7. Visual Hierarchy

Primary Focus:
- Timer

Secondary:
- Stats

Tertiary:
- Profile + Ambience

Terminal:
- Modal only

---

## 8. Dev Console Identity Improvements

- Reduce padding
- Use tighter spacing scale (4px system)
- Slightly darker panel contrast
- Subtle glass effect only in modal
- Minimal drop shadows

Avoid “big card UI” feeling.

---

## 9. Optional Advanced Layout (Future)

Allow layout modes:

- Compact Mode (default)
- Immersive Mode (large timer + fullscreen ambience)
- Minimal Mode (timer + terminal only)

User selectable in settings.

---

## 10. Immediate Action Steps

1. Reduce global padding by 20–30%
2. Convert layout to structured grid
3. Move ambience to middle right
4. Convert terminal to modal
5. Reduce typography size slightly
6. Align panel heights visually

---

## 11. Final Vision

Zetta Focus Console should feel:

- Dense
- Intentional
- Engineer-oriented
- Balanced
- Structured

Not oversized.
Not dashboard-like.
Not fluffy.

---

End of UI Layout Redesign Plan
