# Zetta Focus Console — Ambient Visual Implementation Plan

## 1. Philosophy

Ambience must enhance focus, not distract.

It must:
- Be minimal
- Be profile-driven
- Stay GPU-light
- Avoid heavy animation engines

Ambience is environmental support, not wallpaper dominance.

---

## 2. Layout Strategy

Use a dedicated grid tile for ambience.

Example layout:

[ Timer ]      [ Profile ]
[ Terminal ]   [ Stats ]
[ Ambient Tile ]

Ambient Tile:
- 200–250px square
- Low opacity animation
- Subtle visual
- Independent module

---

## 3. V1 Ambient Types

Winter:
- Minimal snow dots (max 15–20)
- Slow fall animation

Summer:
- Soft heat shimmer effect
- Subtle gradient glow

Spring:
- Light drifting particles
- Gentle motion

Autumn:
- 1–2 slow drifting leaves

---

## 4. Motion Intensity Levels

Low:
- Minimal particles
- Slow movement
- Almost static

Medium:
- Slightly increased motion

High:
- Subtle glow + more motion
- Still controlled

---

## 5. Implementation Approach

Frontend (React):
- Visual rendering only
- No business logic
- Controlled by profile + motion intensity

Rust:
- Emits active profile
- Emits motion intensity
- No animation logic in Rust

---

## 6. Performance Rules

- Avoid physics engines
- Avoid heavy canvas loops
- Avoid full-screen video backgrounds
- Avoid large Lottie files
- Prefer CSS animation or lightweight WebGL

---

## 7. UI Behavior

- Ambience must never override readability
- Should be optional
- Can be disabled from settings
- Should pause if timer stops (optional)

---

## 8. Future Enhancements

- Immersive full-screen mode
- Seasonal theme packs
- Profile-based gradient overlays
- Subtle blur layers
- Minimal ASCII terminal ambience mode

---

End of Ambient Visual Implementation Plan
