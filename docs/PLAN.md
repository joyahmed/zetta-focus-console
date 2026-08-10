# Working plan

The tracked checklist for getting to a first public release and what follows.
[ROADMAP.md](../ROADMAP.md) says *what* the app should become; this says what is
actually being worked on, in order.

Tick things here as they land.

---

## Phase 0 — before the first release

Blocking. None of the rest matters if these are not done.

- [x] **Audio provenance settled.** All four tracks came from Pixabay or
      Pexels. Neither site licenses per file — one site-wide licence covers
      everything they host, both allow commercial use and distribution inside a
      product, and neither requires attribution. So the terms are the same
      either way and there is nothing to credit. Recorded in
      [ASSETS.md](../ASSETS.md).
- [x] ~~Replace any track that is non-commercial.~~ Not applicable: neither
      site hosts non-commercial-only material.
- [ ] Re-encode any *future* track to match the others — 45 s, Vorbis q3,
      44.1 kHz, 3 s crossfade tail-to-head. The exact `ffmpeg` command is in
      `ASSETS.md`.
- [ ] **Screenshots** — see the section below. The README has none, which for
      an app whose whole argument is how it looks and how it is driven means
      the argument is currently made entirely in prose.
- [ ] **Read `README.md` start to finish as somebody who has never seen the
      app**, and rewrite what does not survive it. Known weak points: it opens
      with a wall of text before showing anything; "What it does" is a
      feature table where the first three rows are the actual pitch and the
      rest is a list; the commands section is longer than everything else
      combined and sits above the parts a newcomer needs first. Order should
      be: what it is, a picture of it, the one command that explains it, then
      install, then the full reference.

---

## Screenshots

Blocking the first release, and wanted in three places at once: the README, the
GitHub release page, and the open-source page on the website — which is a
different repository, so these are captured once, here, and copied there rather
than taken twice.

They live in `docs/screenshots/`, named for what they show.

**The set.** Every shot is the whole window, not a cropped panel: the four
panels together are what the app *is*, and a cropped timer looks like every
other timer.

- [ ] `dashboard-dark.png` — a session running, winter, ambience visible.
      The one that goes at the top of the README.
- [ ] `dashboard-light.png` — the same window, same profile, same season,
      `Ctrl+D` away. Paired with the one above so the two read as one app.
- [ ] `terminal.png` — the console open, with `timer 50m break 10m loop 3`
      typed and answered, and `s` under it. This is the pitch; if only one
      screenshot survives, it is this one.
- [ ] `profile-dialog.png` — the profile form with a dropdown open, so the
      seasons and the check against the current one are visible.
- [ ] `settings.png` — the settings drawer over the app.
- [ ] `shortcuts.png` — the shortcuts drawer. Cheap to take while the drawer
      code is already on screen, and it answers "what can I press".

**Rules, so the set looks like a set.**

- One window size for every shot — 1440×900, and do not resize between them.
- The same profile and season throughout, so the colours do not jump.
- A plausible clock. Not `25:00` on every shot, and not `00:07`.
- Dark first: it is the default theme and the one the app was designed in.
- No personal profile names, no dev mode badge, and no diagnostics showing a
  path from this machine.
- PNG, and keep the whole directory under about 2 MB. Repository objects are
  permanent — this project has already squashed its history once over 42 MB of
  audio nobody could delete afterwards. Resize before committing, not after.

**Then the README.** Once the images exist:

- [ ] `dashboard-dark.png` immediately under the opening paragraph, before
      "Why a terminal".
- [ ] `terminal.png` inside "Why a terminal", next to the command block it
      illustrates — the block currently asks the reader to imagine it.
- [ ] The light pair and the dialogs in one small gallery further down, near
      "What it does", rather than scattered.
- [ ] Every image gets alt text that says what is in it. A README is read on
      phones, in feed readers and by people who cannot see the picture.

---

## Phase 1 — releases and CI

- [ ] Add `.github/workflows/release.yml` — build on tag, three platforms,
      attach installers to a draft release.
- [ ] **Do not add an Intel macOS job.** GitHub is retiring the `macos-13`
      image; a job asking for it is not scheduled at all, sits queued
      indefinitely, and holds the whole release open because a draft cannot be
      published until every platform lands. Build
      `--target universal-apple-darwin` on the arm64 runner if Intel is needed.
- [ ] Linux runners need `webkit2gtk` and `libasound2-dev`. The second is what
      `rodio` builds against for ALSA — without it the build fails as a Rust
      error rather than an obviously missing package.
- [ ] Tag `v1.0.0` and cut the first release.
- [ ] Install the built artifact on a machine that has never had the app, and
      check the tray, the global shortcuts, and first-run defaults.
- [ ] Add a pull-request workflow: `cargo check`, `cargo fmt --check`,
      `tsc --noEmit`, `vite build`. All four pass today; this keeps them
      passing.

---

## Phase 2 — the gaps in v1

Real unfinished work, verified rather than remembered.

- [ ] **Tray icon should show session state.** It currently changes only its
      tooltip — `update_tray_state` in `src-tauri/src/lib.rs` says so in a
      comment. Needs icon variants for focus, break, idle and strict.
- [ ] **Move terminal history into Rust.** It is in `localStorage` today
      (`src/hooks/use-terminal-modal.ts`), which contradicts the rule that Rust
      owns state. It belongs next to preferences on disk.
- [ ] A short recording of the terminal. `timer 50m break 10m loop 3` is the
      whole pitch and currently you have to install the app to see it.

---

## Phase 3 — tidying

Not urgent. Worth doing when touching the surrounding code anyway.

- [ ] **Tests for the engine.** `cargo test` runs nothing. The session cycle is
      a state machine — start, tick, advance, stop — and every bug found in it
      so far was found by using the app rather than by the repository.
- [ ] The files in `src/components/settings-panel/` share enough
      structure to be driven by a list instead. They are also the last place
      still threading an `isLight` prop by hand.
- [ ] Revisit the older UI audit — a couple of its findings are fixed
      (the debug command name mismatch, the `System::new_all()` cost in
      `tick_system_stats`), the rest were never rechecked.
- [ ] Decide whether the four ambient tracks want a fifth.

---

## Phase 4 — after release

- [ ] Use the app on Linux and macOS. Both build; neither has been used in
      anger.
- [ ] Session history worth reading — the stats panel counts sessions but says
      nothing about a week.
- [ ] Deeper engine instrumentation, per [ROADMAP.md](../ROADMAP.md).

---

## Done

- [x] **The light theme.** Surfaces are a stack of five — page, card, elevated,
      panel, inset — where `--bg-primary` used to be the page, every field and
      every row at once, which is why light mode read as one sheet of white.
      The three `!important` "force white" overrides on the dialogs are gone,
      the console no longer hand-branches on `isLight`, and solid colours are
      declared as channels so Tailwind's opacity modifiers compile at all —
      `bg-zetta-bg/50` and every focus ring in the profile form were silently
      emitting no CSS.
- [x] **The ambience draws in both themes.** It used to answer the light theme
      with a pastel gradient reading "Ambience disabled in light mode", with
      the settings switch greyed out to match.
- [x] **A dropdown of our own.** The three native `<select>`s opened a Win32
      popup in the system colours in the middle of a themed dialog. `Select`
      portals its list, because the dialog body scrolls and would clip it.
- [x] **Custom profiles can be deleted.** `profile delete` existed in the
      engine and nothing in the interface called it.
- [x] Ambient audio 42.0 MB → 2.16 MB. Forty-five second seamless Vorbis loops
      replacing MP3 recordings that ran up to ten and a half minutes.
- [x] Looping without rodio's `Buffered`, which was caching ~8 MB of decoded
      PCM. Startup memory 19 MB → 8.1 MB.
- [x] Licensing, payment, pricing and webhook layer removed.
- [x] One long-lived `sysinfo` probe instead of `System::new_all()` every five
      seconds; also fixed CPU always reporting zero.
- [x] `[profile.release]` with LTO, one codegen unit and stripped symbols.
      Installer 4.5 MB from an 11.6 MB binary.
- [x] MIT `LICENSE`, a real `README.md`, `CONTRIBUTING.md`, `ASSETS.md`,
      `ROADMAP.md`.
- [x] A single `Modal` shell — the dialogs previously used four different
      scrims and three widths, and the shortcuts panel was a clipped dropdown.
- [x] All debug logging removed from both sides; genuine error paths kept.
- [x] App identity fixed — the crate was `zetta-app`, described as "A Tauri
      App", authored by `you`.

Verification, all currently clean:

```bash
cd src-tauri && cargo check && cargo fmt --check
bun run build          # tsc --noEmit, then vite build
bun run tauri build    # 4.9 MB NSIS installer
```
