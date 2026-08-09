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
- [ ] Read `README.md` start to finish as somebody who has never seen the app.

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
- [ ] Screenshots into `docs/screenshots/` and the README.
- [ ] A short recording of the terminal. `timer 50m break 10m loop 3` is the
      whole pitch and currently you have to install the app to see it.

---

## Phase 3 — tidying

Not urgent. Worth doing when touching the surrounding code anyway.

- [ ] **Tests for the engine.** `cargo test` runs nothing. The session cycle is
      a state machine — start, tick, advance, stop — and every bug found in it
      so far was found by using the app rather than by the repository.
- [ ] **The light theme.** `AmbientPanel` swaps the entire panel for a static
      placeholder when the theme is light, so the particles never render at
      all; and the console hand-branches on `isLight` for nearly every colour
      it draws, where the rest of the app uses tokens that switch themselves.
- [ ] The files in `src/components/settings-panel/` share enough
      structure to be driven by a list instead.
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
