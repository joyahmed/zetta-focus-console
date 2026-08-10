# Working plan

What I am working on, in the order I mean to do it, and what is left before the
first public release. [ROADMAP.md](../ROADMAP.md) is the outward-facing version
— what the app should become; this is the list I keep for myself, so it is
blunter about what is unfinished and why.

The release machinery sits near the end on purpose: I would rather ship an app
I am happy with by hand once than spend the run-up to it maintaining a build
pipeline for a release that has not been cut yet.

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
- [x] **Screenshots** — see the section below. Ten of them, five states in both
      themes, in `docs/screenshots/`.
- [x] **Read `README.md` start to finish as somebody who has never seen the
      app**, and rewrite what does not survive it. Done, and the three known
      weak points with it. The picture now sits under the first two lines
      rather than under three paragraphs. "What it does" led with an
      eight-row feature table whose first three rows were the entire pitch and
      whose last five were a list; the three are prose now and the five are a
      list, which is what they always were. Install has moved above it, so the
      order is what it is, a picture of it, the one command that explains it,
      install, then everything else.

      The read-through also turned up, as last time, things the app was saying
      that were not true. `alarm on` answered "Voice announcements enabled" —
      the feature was removed and renamed to alarms in this same release and
      this one pair of strings was missed. `override` and `status` still
      reported the override in seconds ("Focus: 3000s") after the switch to
      minutes, which only ever reached the message printed when it was set.
      And the Shortcuts section listed two keys out of eleven; the shortcuts
      drawer has had the full set the whole time, and a screenshot of it is in
      the README, which is presumably how a two-row table went unnoticed.

---

## Screenshots

Blocking the first release, and wanted in three places at once: the README, the
GitHub release page, and the open-source page on the website — which is a
different repository, so these are captured once, here, and copied there rather
than taken twice.

They live in `docs/screenshots/`, named for what they show. **The spec moved to
[`docs/screenshots/README.md`](screenshots/README.md)** — a table of filename,
contents and where each one lands, which is the shape `zetta-com` settled on and
the thing that makes retaking them mechanical rather than a re-derivation. What
is left below is the reasoning behind it.

The current ten are one release behind: the statistics panel gained a seven-day
strip and the settings drawer was rebuilt, so `dashboard-*` and `settings-*`
need retaking. The week strip also needs a week — it draws real days and draws
empty ones empty, so those two are worth taking after a few days of ordinary
use rather than before.

**The set.** Five states, each in both themes, `-dark` and `-light`. Every shot
is the whole window rather than a cropped panel: the four panels together are
what the app *is*, and a cropped timer looks like every other timer.

- [x] `dashboard` — a session running, winter, ambience visible. The dark one
      goes at the top of the README.
- [x] `terminal` — the console open, with `timer 50m break 10m loop 3` typed
      and answered, and `s` under it. This is the pitch; if only one screenshot
      survives, it is this one.
- [x] `profile-dialog` — the profile form with a dropdown open, so the seasons
      and the check against the current one are visible.
- [x] `settings` — the settings drawer over the app.
- [x] `shortcuts` — the shortcuts drawer. Cheap to take while the drawer is
      already on screen, and it answers "what can I press".

**What keeps the set looking like a set:**

- The window at the size it opens at — 1500×1100, from `tauri.conf.json` — and
  not resized in between. That is what a new user sees, and `maxWidth` 1600 /
  `maxHeight` 1100 mean there is no larger capture to be had by dragging the
  frame, so the website scales these down rather than up.
- Every shot in both themes. The dark one is the default and the one I designed
  the app in; the light one exists because the website will want whichever
  suits the page it lands on.
- Real state, not invented state. There is no way to point the app at a
  throwaway profile directory anyway — `dirs::data_dir()` asks Windows for the
  known folder and ignores `%APPDATA%` in the environment — so the set is shot
  against the profiles and statistics I actually have, on a preset so that no
  personal profile is the headline.
- The same profile and season throughout, so the colours do not jump.
- A plausible clock. Not `25:00` on every shot, and not `00:07`.
- No dev mode badge, and nothing in the diagnostics showing a path off this
  machine.
- PNG, with the whole directory kept small — the pair of a state should cost
  what one screenshot ought to, not double. Repository objects are permanent,
  and this project has already squashed its history once over 42 MB of audio
  that could not be deleted any other way.

**Then the README.**

- [x] `dashboard-dark.png` immediately under the opening paragraph, before
      "Why a terminal".
- [x] `terminal-dark.png` inside "Why a terminal", under the command block it
      illustrates — the block used to ask the reader to imagine it, and it also
      said something the app did not do; see the note below.
- [x] The light dashboard and the three dialogs in one gallery under "What it
      does", rather than scattered, with a line saying every shot has a twin.
- [x] Every image has alt text that says what is in it. A README is read on
      phones, in feed readers and by people who cannot see the picture.

Taking the pitch screenshot is what turned up that `timer 50m break 10m loop 3`
had never worked: each override handler read `args.first()` and dropped the
rest, so the headline command set the focus duration and silently discarded the
break and the count. Fixed, and the override reports itself in minutes now
rather than in seconds.

---

## Phase 1 — the gaps in v1

Real unfinished work, verified rather than remembered.

- [x] **Tray icon shows session state.** `src-tauri/src/tray.rs`. Rather than
      four checked-in PNGs, the icon is rasterised: the bundled app mark inside
      a ring that fills as the run goes on, violet for focus, green for a
      break, amber and thicker for Strict Mode, and a plain grey outline when
      idle. A paused arc keeps its position at reduced alpha, because a stopped
      clock should not look like a running one.

      Two things this had to avoid. The arc is quantised to twenty-four
      positions, so a fifty-minute session repaints the tray two dozen times
      instead of three thousand; and `apply` holds the last icon it set and
      returns before touching the OS when nothing would change.

      It also fixed the wrong half of an inversion. `update_tray_state` was a
      command the *frontend* called, reading the timer back out of a state
      event and posting it to Rust — the one thing this app is built not to do.
      The tray now reads the same `AppState` the event carries, from the one
      function that publishes both, so the two cannot disagree.

      One trap worth writing down, because nothing in the build catches it:
      `set_icon` and `set_tooltip` post their work to the main-thread event
      loop and block waiting for the reply. That is fine from a command, which
      runs on a worker thread, and a deadlock from `setup`, which runs on the
      main thread before that loop starts. The startup icon is passed to
      `TrayIconBuilder` instead. `cargo check`, `cargo test` and a full release
      build all pass on the version that hangs; only launching it finds out.
- [x] **Terminal history moved into Rust.** It sits in `preferences.json` next
      to everything else and is `#[serde(skip)]` on `AppState`, because the
      state event goes out once a second and a hundred lines of history have no
      business riding along with it — the console asks for it once when it
      opens. History written to `localStorage` by an earlier build is adopted
      on first launch and the key removed. There is a `history` command now
      too, and a `history clear`; until this moved there was no way to clear it
      at all.
- [ ] A short recording of the terminal. `timer 50m break 10m loop 3` is the
      whole pitch and currently you have to install the app to see it.

---

## Phase 2 — tidying

Not urgent. Worth doing when touching the surrounding code anyway.

- [x] **Tests for the engine.** `cargo test` ran nothing; it runs 38 now. The
      session cycle is covered end to end — start, the break a finished run
      rolls into, the wait at the next session, the long break that closes the
      cycle and retires the override — along with the compound override parser,
      ad-hoc runs, both kinds of stop, and Strict Mode's refusals. None of it
      goes through `tick_timer` or `process_command`, which would want a real
      second and a real audio device; the engine's own functions take
      `&mut AppState` and nothing else, so they are called directly and nothing
      touches the preferences file.

      Every bug the cycle has had was found by using the app: the loop count
      that was parsed and never applied, the compound command that kept only
      its first clause, the counter that went back to 1/4 whenever a break was
      stopped. There is a test for each of those three now.
- [x] **The settings drawer is a list.** Eight section files became a
      `SettingGroup`, a `SettingRow` and a table of entries. Between them the
      eight wrote the same row in three idioms, two of which painted it
      `--bg-primary` — the *page* colour, which is the one-flat-sheet problem
      the light theme was rebuilt to fix. Two clickable `div`s are buttons now,
      so they answer the keyboard.

      `Toggle` no longer takes `isLight`; it reads the theme's own tokens, and
      so does the volume track, which had two greys in a gradient. The switch
      also gained `role="switch"` and `aria-checked`, which it never had.
      `DevModeSection` went too — it returned `null` behind thirty lines of
      commented-out markup, and the `handleDevModeToggle` chain feeding it ran
      through four files to reach a component that rendered nothing.

      The one `isLight` left is `SeasonParticle`, and it stays: it computes a
      *per-particle* opacity rather than picking between two constants, so
      there is nothing for a token to replace. It is also derived once at the
      top of the panel and passed down as scene data, which is not the
      hand-threading this item was about.
- [x] **The older UI audit, re-derived.** The document itself went in the
      history squash, so rather than revisit it this rechecked the two classes
      it covered — commands that do not match what the app says about them, and
      work done that need not be. Five findings:

      Tab completion was missing `timer`, `break` and `loop`, the three the app
      is pitched on. The help list had drifted back into a sample of the
      command set, which is exactly what its own comment forbids.
      `background gradient|particles` set a field nothing has read since the
      second ambience mode was removed, and reported success doing it — gone,
      with the field and the enum. `focus` was a broken second copy of
      start/stop/pause/resume that hardcoded four sessions and never entered
      the cycle; it is a synonym for `timer` now, which is what the compound
      parser always read it as. And `system`, `memory` and `cpu` each built a
      `System::new_all()` — the same waste as `tick_system_stats`, walking
      every process and disk to print two numbers.

      Two tests now read the engine's dispatch match out of its own source and
      assert both lists name every arm. They caught three commands I had missed
      while fixing the others, which is the argument for them.
- [ ] Decide whether the four ambient tracks want a fifth. **Not mine to
      decide** — it is a taste call and a licensing one, and any new track has
      to clear the bar in `ASSETS.md` and be re-encoded to match. Left open.

---

## Phase 3 — releases and CI

Last, and deliberately so. Everything above is the app; this is the machinery
for handing it over, and it is worth nothing until there is something worth
handing over. The first build can go out by hand.

- [x] **`.github/workflows/release.yml`** — builds on a `v*` tag across three
      platforms and attaches the installers to a draft release. Also runnable
      by hand, so the matrix can be exercised without spending a tag to find
      out that a runner image moved. `fail-fast` is off: a draft with two of
      three installers is worth having while the third is fixed.
- [x] **No Intel macOS job.** The plan said universal-on-arm64; the workflow
      ships Apple silicon only, which is a change worth writing down. Both
      avoid the retired image. Universal doubles the download for every Mac
      user to serve the shrinking half, in an app whose pitch includes a 5.0 MB
      installer — so it is the documented escape hatch rather than the default.
      One line in `release.yml` switches it back.
- [x] Linux job installs `libasound2-dev` alongside `webkit2gtk`, plus
      `libxdo-dev` for the global shortcuts and `libayatana-appindicator3-dev`
      for the tray. Taken from `zetta-com`, which has already found out on a
      bare runner which of these a Tauri bundle actually needs. Both workflows
      use the same list, so CI fails for the same missing package the release
      build would.
- [x] **A pull-request workflow** — `ci.yml`, on every PR and on main. Split
      into a Rust job and a frontend job so a formatting mistake fails in
      seconds rather than after a full dependency tree, and it runs
      `cargo test` as well as the four originally listed. Branch runs cancel
      their predecessor; main runs do not.
- [ ] Tag `v1.0.0` and cut the first release. **Yours to press.** The machinery
      is in place and the tag is the trigger, but publishing is outward-facing
      and one-way, and it should not happen before the line below.
- [ ] Install the built artifact on a machine that has never had the app, and
      check the tray, the global shortcuts, and first-run defaults. Needs a
      second machine; cannot be done from here.

---

## Phase 4 — after release

- [ ] Use the app on Linux and macOS. Both build; neither has been used in
      anger. Needs those machines.
- [x] **Session history worth reading.** The engine keeps a row per day —
      date, sessions, focus minutes, ninety of them — and the panel draws the
      last seven as bars under the headline cards, today picked out, scaled
      against the best day in the window rather than a fixed target, because
      the app has no opinion about how long you should work. Days with nothing
      in them are drawn empty rather than skipped: a week with Tuesday missing
      is not a six-day week. `stats` grew the same summary.

      It is `#[serde(skip)]` on `AppState` for the same reason the console
      history is — it changes a few times a day and the state event goes out
      once a second, so the panel asks on mount and on `session-complete`.
      `record_completed_session` is split so the rollup takes the date as a
      parameter and writes nothing, which is what makes the day boundaries
      testable without touching the real preferences file.
- [ ] Deeper engine instrumentation, per [ROADMAP.md](../ROADMAP.md). Left
      open deliberately: the roadmap files this under **Later** and asks for an
      issue first, because the shape is not settled.

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
- [x] Eight dependencies dropped — `ed25519-dalek`, `rand`, `base64`, `sha2`,
      `aes-gcm`, `hex`, `hmac`, `dotenv` and a `signing` feature, all left over
      from the licence-key and payment layer. Nothing in `src/` had referred to
      any of them since that layer was removed; they were still being compiled
      into every build.

Verification, all currently clean:

```bash
cd src-tauri && cargo check && cargo fmt --check && cargo test
bun run build          # tsc --noEmit, then vite build
bun run tauri build    # 5.0 MB NSIS installer
```
