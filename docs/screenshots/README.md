# Screenshots

What to capture, and where each one goes in the top-level `README.md`. Save with
these exact filenames — the README references them by name, and two of them by
their `-light` twin as well.

Take them from a **release build after a full restart**, not from `tauri dev`:
the window size, the tray icon and the global shortcuts all come from
`tauri.conf.json` and the Rust side, and none of them are applied by a hot
reload.

Capture the **whole window** and nothing behind it. The four panels together are
what the app is, and a cropped timer looks like every other timer. No
annotations — no boxes, arrows or highlights. These are the product, not a bug
report.

---

## The set

Five states, each in both themes. `Ctrl+D` switches.

| File | What is in it | Where it goes |
|---|---|---|
| `dashboard-dark.png` | A session running, winter, ambience visible, a plausible clock. The one that has to sell it. | Top of the README, under the first two lines |
| `terminal-dark.png` | The console open with `timer 50m break 10m loop 3` typed and answered, and `s` under it. If only one of these survives, it is this one. | Inside "Why a terminal", under the command block |
| `dashboard-light.png` | The same window, same session, light theme | The gallery under "What it does" |
| `profile-dialog-dark.png` | The profile form with the season dropdown open, so the four seasons and the check against the current one are visible | The gallery |
| `settings-dark.png` | The settings drawer over the app | The gallery |
| `shortcuts-dark.png` | The shortcuts drawer. Cheap to take while a drawer is already open, and it answers "what can I press" | The gallery |

Every one of the five also gets a `-light` twin, because the website will want
whichever suits the page it lands on.

---

## What keeps the set looking like a set

- **The window at the size it opens at** — 1500×1100, from `tauri.conf.json` —
  and not resized in between. `maxWidth` 1600 and `maxHeight` 1100 mean there is
  no larger capture to be had by dragging the frame, so the website scales these
  down rather than up.
- **The same profile and season throughout**, so the colours do not jump.
- **A preset as the headline**, not a personal profile.
- **A plausible clock.** Not `25:00` on every shot, and not `00:07`. Starting a
  50-minute override and waiting half a minute gives a good one.
- **No dev mode badge**, and nothing in the diagnostics showing a path off this
  machine.
- **Real state, not invented state.** There is no way to point the app at a
  throwaway profile directory anyway — `dirs::data_dir()` asks Windows for the
  known folder and ignores `%APPDATA%` in the environment.
- **PNG, and keep the directory small.** The pair for a state should cost what
  one screenshot ought to, not double. Repository objects are permanent, and
  this project has already squashed its history once over 42 MB of audio that
  could not be deleted any other way.

---

## Before the next set

The ten currently in this directory were taken on 2026-08-10 and are **one
release behind**. Two things have changed in the window since:

- The statistics panel has a **seven-day strip** under the headline cards.
- The **settings drawer was rebuilt** — same settings, different rows.

So `dashboard-*`, `settings-*` and, to a lesser extent, `shortcuts-*` all need
retaking. `terminal-*` and `profile-dialog-*` are still accurate.

**The week strip needs a week.** It draws the last seven days from
`session_history`, and it is honest — days with nothing in them are drawn empty.
A machine that has not run a session in months shows seven empty bars, which is
a true picture of that machine and a poor picture of the feature. Seeding it
would be inventing state, which is the one thing this set does not do. So the
dashboard shots are worth taking after a few days of ordinary use, not before.
