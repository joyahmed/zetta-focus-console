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

- MIT licence, contributing guide with a copyright clause, asset provenance
  documentation, a roadmap and a working plan
- A single `Modal` shell shared by every dialog
- Keyboard shortcuts as a proper modal, grouped by purpose, marking the two
  shortcuts that work globally

### Changed

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

### Removed

- The licensing, payment, pricing and webhook layer. Strict Mode, developer
  diagnostics, runtime overrides and custom profiles are simply available.
- All debug logging on both sides. Genuine error paths are kept.
- Seven unreferenced files, including one whose only statement was a log
  saying it was no longer used, and the framework template's placeholder icons.

### Fixed

- Ambient audio no longer clicks at the loop point. MP3 carries encoder delay
  and padding that decode as silence at both ends; Vorbis is gapless.
- Profiles saved before the format change still resolve. Sound lookup matches
  on the name rather than the full filename, so an entry saved as
  `fireplace.mp3` still finds `fireplace.ogg` instead of falling back.
- A modal footer rendered a literal `0` before the first statistics probe
  landed, from a truthiness check on a numeric value.
