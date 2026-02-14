
# Zetta Focus Console — Day/Night Theme Strategy

## 1. Theme Philosophy

Zetta Focus Console should support two primary themes:

- Dark Mode (Primary Identity)
- Light Mode (Professional Alternative)

Themes must feel:

- Clean
- Structured
- Developer-oriented
- Not flashy
- Not extreme (#000 or #FFF)

---

## 2. Core Rule

Avoid:

- Pure black (#000000)
- Pure white (#FFFFFF)

Use neutral tones instead.

---

## 3. Dark Mode (Primary)

Dark mode reflects the console identity.

### Suggested Palette

Background:
#0f1115 or #121417

Panels:
#1a1d23

Borders:
rgba(255,255,255,0.06)

Primary Text:
#e6e8ec

Secondary Text:
#9aa0a6

Accent:
Muted cyan or soft blue

Dark mode should feel:
- Dense
- Calm
- Focused
- Engineered

---

## 4. Light Mode (Secondary)

Light mode should feel:

- Clean
- Professional
- Minimal
- Technical

### Suggested Palette

Background:
#f5f6f8

Panels:
#ffffff

Borders:
rgba(0,0,0,0.08)

Primary Text:
#1b1e24

Secondary Text:
#6b7280

Accent:
Slightly darker blue than dark mode

Avoid playful or overly bright design.

---

## 5. Glassmorphism Behavior

Glass allowed only in:

- Terminal modal
- Settings modal

Dark mode:
- 8–12px blur
- 0.08–0.15 opacity

Light mode:
- Softer blur
- Reduced transparency
- Maintain readability

Do NOT apply glass to main grid panels.

---

## 6. Theme Switching

Allow switching via:

- Header toggle (🌙 / ☀)
- Settings panel
- Terminal command

Terminal Commands:

theme dark
theme light
theme system

Theme switching must:
- Be instant
- Not reload app
- Not cause layout shift

---

## 7. Accent Strategy

Option A:
Keep accent consistent across themes.

Option B:
Slightly adjust accent brightness per theme.

Recommendation:
Keep brand accent consistent, adjust saturation subtly per theme.

---

## 8. System Theme Support

Optional:

Allow “Use system theme” setting.
App detects OS preference and adapts automatically.

---

## 9. Typography Behavior

Ensure:

- High contrast in both modes
- No thin fonts
- No ultra-light text
- Readability over aesthetics

---

## 10. Identity Outcome

Dark Mode:
Primary developer identity.

Light Mode:
Professional clean alternative.

Both must feel cohesive, not separate products.

---

End of Theme Strategy
