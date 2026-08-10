# Changelog

Notable changes, newest first. Dates are release dates.

This file starts at the first public release. The app existed privately before
that — see the History section in the [README](README.md#history) for why the
git history begins at one commit.

---

## [Unreleased]

Work in progress is tracked in [docs/PLAN.md](docs/PLAN.md).

---

## [1.0.0] — unreleased

First public release. The engine, the terminal and the four seasons were built
before this point; what follows is what changed in preparing it to be released
free and open source.

### Added

- **A week of history.** The engine keeps a row per day — date, sessions, focus
  minutes, ninety of them — and the statistics panel draws the last seven as
  bars, today picked out, scaled against the best day in the window rather than
  a fixed target. Days with nothing in them are drawn empty rather than
  skipped. `stats` in the terminal grew the same summary. The four running
  totals covered today and all time, which are the two spans nobody judges
  their own work over.
- **`history` and `history clear`**, and tab completion that offers the whole
  command set. `timer`, `break` and `loop` were all missing from it — the three
  the app is pitched on.
- **Continuous integration.** `ci.yml` runs the Rust and frontend checks on
  every pull request; `release.yml` builds three platforms on a `v*` tag and
  attaches the installers to a draft release. No Intel macOS job: GitHub is
  retiring that image and a job asking for it holds the whole draft open, so
  the arm64 runner builds a universal binary instead.
- **A tray icon that shows the session.** The app mark inside a ring that fills
  as the run goes on — violet for focus, green for a break, amber and thicker in
  Strict Mode, a plain grey outline when idle, and dimmed while paused. It is
  rasterised from the bundled icon rather than shipped as a set of PNGs, and
  quantised to twenty-four arc positions so a fifty-minute session repaints the
  tray two dozen times instead of three thousand. The tray previously changed
  only its tooltip.
- **`history` and `history clear`**, and the console's history now lives in
  `preferences.json` beside everything else. It was in `localStorage`, which is
  the webview's storage rather than the app's, and there was no way to clear it.
  An existing history is adopted on first launch.
- **Tests for the session cycle.** `cargo test` ran nothing; it runs 38 now,
  covering the cycle end to end, the compound override parser, ad-hoc runs, both
  kinds of stop, and Strict Mode's refusals.
- **The session cycle.** A focus run now rolls into its break, the break waits
  for you when it ends, and the long break after the last run closes the cycle.
  `current_session` was previously assigned 1 in nine places and incremented in
  none, so the counter never moved and no break was ever started.
- **Three alarm tones** at the boundaries of that cycle — session end, break
  end, cycle end — synthesised with the Web Audio API rather than shipped as
  files, so nothing is added to the installer.
- **A clock you can type into.** Click it while idle and enter `25`, `5:30`,
  `90s` or `40m`. A duration on its own is a one-off run: no break after it, no
  session counter, and the override retires when it finishes.
- **Duplicate**, for basing a custom profile on a read-only preset.
- Inter and JetBrains Mono ship inside the binary. They were fetched from
  `fonts.googleapis.com` at startup, so the app had neither typeface offline.
- MIT licence, contributing guide with a copyright clause, asset provenance
  documentation, a roadmap and a working plan
- A single `Modal` shell shared by every dialog
- Keyboard shortcuts as a proper modal, grouped by purpose, marking the two
  shortcuts that work globally

### Changed

- **The settings drawer is a list.** Eight section files wrote the same row in
  three styling idioms, two of which painted it `--bg-primary` — the page
  colour, and the one-flat-sheet problem the light theme was rebuilt to fix.
  One `SettingRow` knows what a row looks like now, the two clickable `div`s
  are buttons, and `Toggle` no longer takes an `isLight` prop: it reads the
  theme's own tokens, and gained `role="switch"` and `aria-checked` with it.
- **The tray is painted by Rust, from the state Rust already holds.** It used to
  be a command the frontend called: the state listener read the timer back out
  of the event it had just received and posted it to Rust, which inverts the one
  rule this app has. One function now publishes the state event and the tray
  together, so they cannot disagree.
- **Eight dependencies removed** — `ed25519-dalek`, `rand`, `base64`, `sha2`,
  `aes-gcm`, `hex`, `hmac`, `dotenv` — and a `signing` feature, all left over
  from the licence-key and payment layer. Nothing had referred to any of them
  since that layer was removed; they were still compiled into every build.
- **Installer is 4.5 MB, down from roughly 46 MB.** Ambient audio went from
  42.0 MB to 2.16 MB: the four tracks were 256 kbps stereo MP3 running up to
  ten and a half minutes, played on an infinite loop, so everything past the
  loop point was inaudible weight. They are now 45-second Vorbis loops,
  crossfaded tail-to-head so the seam cannot be heard.
- **Startup memory is 8.1 MB, down from 19 MB.** Looping used
  `repeat_infinite()`, which wraps the source in rodio's `Buffered` and caches
  every decoded sample — about 7.9 MB of PCM held for as long as a sound was
  selected. Loops now re-decode from the embedded slice as the queue drains.
- Release builds use LTO, a single codegen unit and stripped symbols. They
  previously had no profile at all and shipped unoptimised.
- System statistics use one long-lived probe instead of building a full
  `System::new_all()` snapshot every five seconds. This also fixed CPU usage
  always reading zero, since it is a delta between two refreshes.
- Every dialog uses the same scrim and panel. There were previously four
  different backdrop opacities, one without a blur, and three unrelated widths.
- Application memory is reported with a fraction — 18.6 MB was being rounded
  and displayed as "18 MB" — and system memory switches to GB above 1024 MB.
- **Windows ships the NSIS installer only.** The build also produced an `.msi`,
  and Windows draws every `.msi` with a fixed icon out of `msiexec.exe` — the
  file type has no way to carry one of its own, so that download was always
  going to look unbranded next to the `.exe`. macOS and Linux are unchanged;
  the narrowing is a `tauri.windows.conf.json` beside the main config.

### Removed

- **Voice announcements.** They were written but never switched on, and could
  not have been: the hook called `useApp()`, so enabling it would have stood up
  a second copy of the root hook with duplicate event listeners and duplicate
  global shortcut registrations. The alarm tones take its place, and
  `voice_enabled` is `alarm_enabled` — preferences written before the rename
  still load.
- **The second ambience mode.** The animated background wash is gone, along
  with the app-wide violet gradient behind every panel. Both were wide, blurred,
  blend-mode composited layers, which is the most expensive thing a compositor
  can be asked to hold. The particles are the ambience.
- The licensing, payment, pricing and webhook layer. Strict Mode, developer
  diagnostics, runtime overrides and custom profiles are simply available.
- **`background gradient|particles`**, and the `background_type` field behind
  it. Nothing has read that field since the second ambience mode was removed,
  so the command set a value nobody looks at and reported success doing it.
- **`focus start|stop|pause|resume`**, a second copy of the session commands
  written before those existed and never updated — it hardcoded four sessions,
  ignored any override and never entered the cycle. `focus` is a synonym for
  `timer` now, which is what the compound parser always read it as.
- All debug logging on both sides. Genuine error paths are kept.
- Seven unreferenced files, including one whose only statement was a log
  saying it was no longer used, and the framework template's placeholder icons.

### Fixed

- **The ambience renders at all.** Every season laid its background and its
  particles out in normal flow rather than as overlays, so the particle layer
  sat a full panel-height below the visible area and was never on screen. In
  autumn the leaves also carried two animations both writing `transform`, and
  only the last one in the list wins that property — they spun on the spot.
- **Stopping a quick session no longer sweeps the progress ring off the
  circle.** `stop` reset `remaining_seconds` without resetting `total_seconds`,
  so a stopped 5-minute run reported 1500 remaining out of 300 — a progress of
  minus four hundred percent.
- **Profile edits are no longer overwritten as you make them.** The form seeded
  itself from an object the engine replaces on every event — once a second
  while a session runs — so each tick put every field back. Editing is also
  closed during a session, since the engine will not resize a run in progress.
- **Breaks are not counted as focus time.** Every finished timer was folded
  into the statistics.
- **Escape closes only the dialog on top.** Every open dialog listened on
  `window`, so one press closed the help list and the console together.
- The console no longer echoes what you type twice, and its text, the
  statistics labels and the command bar's keycaps all meet contrast.
- Ambient audio no longer clicks at the loop point. MP3 carries encoder delay
  and padding that decode as silence at both ends; Vorbis is gapless.
- Profiles saved before the format change still resolve. Sound lookup matches
  on the name rather than the full filename, so an entry saved as
  `fireplace.mp3` still finds `fireplace.ogg` instead of falling back.
- A modal footer rendered a literal `0` before the first statistics probe
  landed, from a truthiness check on a numeric value.
- `alarm on` and `alarm off` answered about "voice announcements", a feature
  removed and renamed to alarms in this same release. The preference and the
  help text were renamed; this one pair of strings was missed.
- `override` and `status` reported the session override in seconds — a
  `timer 50m` came back as "Focus: 3000s" — after every other place that prints
  it had switched to minutes.
- **The Windows installer carries the app's icon.** `bundle` set `icon`, which
  is what gets embedded in the `.exe`, but there was no `windows.nsis` block —
  so the installer itself fell back to the stock NSIS graphic, and the first
  thing anyone saw of the app was a generic setup icon. `installerIcon` and
  `uninstallerIcon` now point at the same `icon.ico` as everything else.
