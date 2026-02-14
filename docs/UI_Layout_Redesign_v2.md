
# Zetta Focus Console — UI Layout Redesign v2

## 1. Core Problems Identified

- UI components feel oversized
- Terminal panel dominates layout
- Ambience placed at bottom feels disconnected
- Volume control lacks intentional placement
- Visual density too low for dev-console identity

Goal:
Create a compact, modular, engineer-grade layout with strong hierarchy and balance.

---

## 2. Design Principles

1. Density over emptiness (without clutter)
2. Clear grid hierarchy
3. Functional zoning
4. Compact typography
5. Ambient visuals integrated, not detached
6. Terminal treated as tool, not layout block

---

## 3. Proposed Desktop Layout

### Primary Grid (2x2)

Top Row:
| Timer | Profile |

Middle Row:
| Stats | Ambience |

Terminal:
Modal overlay only (not persistent in layout)

---

## 4. Terminal Redesign (Critical Fix)

### Problem
- Embedded terminal too large
- Dominates visual space
- Breaks balance

### Solution
Convert terminal to modal overlay.

Trigger:
- Ctrl + K
- `~`
- `:`

Close:
- Esc

### Modal Sizing Rules
- 70–85% width
- 60–75% height
- Centered
- Scrollable output area
- Fixed input line at bottom
- Slight backdrop blur
- Subtle glass morphism allowed here only

Terminal must feel like a tool mode, not a permanent UI block.

---

## 5. Volume UI Placement (Perfection Strategy)

Volume is global and contextual.

### Recommended Placement (Best)
Header bar — top right.

Small:
🔊 icon + thin horizontal slider

Near:
- Dev Mode toggle
- Settings button

Rules:
- No labels
- Minimal height
- 100–140px width max
- Non-dominant

### Alternative (Optional)
Inside ambience tile corner with hover reveal.

Do NOT:
- Create a separate volume card
- Make it large
- Add verbose text

Keep it micro and precise.

---

## 6. Ambience Repositioning

Problem:
Bottom placement feels detached.

Fix:
Move ambience into middle grid right side.

Ambience Tile:
- Square or 4:3 ratio
- Subtle border
- Low motion intensity
- Expand button for immersive mode
- Volume micro-control optional inside

Ambience must visually complement stats panel.

---

## 7. Typography & Density Adjustments

Reduce:
- Global padding by 20–30%
- Font sizes by 10–15%
- Card vertical spacing

Suggested scale:
- Title: 18px
- Section headers: 14–16px
- Body text: 12–14px
- Metrics: 13–15px

Avoid oversized headings.

---

## 8. Visual Hierarchy

Primary:
Timer

Secondary:
Stats

Tertiary:
Profile + Ambience

Terminal:
Modal tool only

Volume:
Micro control in header

---

## 9. Advanced Layout Modes (Future)

- Compact Mode (default)
- Immersive Mode (fullscreen ambience)
- Minimal Mode (timer + terminal only)

Selectable in settings.

---

## 10. Immediate Action Steps

1. Remove embedded terminal from grid
2. Implement modal terminal
3. Reduce typography scale
4. Convert layout to structured CSS grid
5. Move ambience to middle right
6. Place micro volume slider in header
7. Tighten spacing system (4px base)

---

## 11. Final Vision

Zetta Focus Console should feel:

- Dense
- Intentional
- Engineered
- Structured
- Minimal
- Console-grade

Not dashboard-heavy.
Not oversized.
Not fluffy.

---

End of UI Layout Redesign v2
