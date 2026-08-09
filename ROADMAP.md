# Roadmap

Where Zetta Focus Console is, and where it is going. This replaces a pile of
older planning documents that described a product with paid tiers; that is not
what this is any more, so they were removed rather than edited.

Nothing here is a promise with a date on it. It is the order things are likely
to happen in, and an explicit list of things that will not.

---

## Where it is — v1.0

The engine is done and the app is usable every day.

- Rust owns the timer, profiles, sound and strict mode; the UI renders state
  events and keeps no clock of its own
- A terminal with aliases, tab completion, persistent history and ~30 commands
- Runtime overrides (`timer 50m break 10m loop 3`) that survive a stop
- Four seasonal ambient scenes, drawn in CSS
- Four seamless 45-second Vorbis loops
- Custom profiles, Strict Mode, voice cues, autostart, tray, global shortcuts
- 4.5 MB installer, ~8 MB resident, one JSON file of state, no network

---

## Next

**Tray icon that shows state.** The tray currently changes its tooltip and
nothing else — `update_tray_state` in `lib.rs` says as much in a comment. It
should carry the session in its icon: focus, break, idle, and strict. This is
the most visible unfinished thing in the app.

**Terminal history belongs in Rust.** It is currently in `localStorage`
(`use-terminal-modal.ts`), which contradicts the one architectural rule this
project has — Rust owns state. It should sit next to preferences on disk.

**Screenshots and a recording.** `timer 50m break 10m loop 3` is the entire
pitch, and right now you have to install the app to see it.

**A pull-request check.** `cargo check`, `cargo fmt --check`, `tsc --noEmit`
and `vite build` are all clean today. Something should keep them that way.

---

## Later

**Deeper engine instrumentation.** `devmode on` and `engine state` expose some
of the engine already. There is room for a real diagnostic surface — session
timing history, transition traces, what the engine did and when — for people
who want to operate the timer rather than just use it.

**More ambience.** Four seasons and four sounds is a floor, not a ceiling. The
scenes are ordinary DOM and CSS, so new ones are approachable — see
`src/components/ambient-panel/`. New audio has to clear the licensing bar in
[ASSETS.md](ASSETS.md).

**Session history worth reading.** The stats panel counts sessions. It does not
yet tell you anything about your week.

**Linux and macOS testing.** Both build. Neither has been used in anger. Bug
reports from either are especially welcome.

---

## Not planned

These come up often for focus apps. They are listed so nobody spends a weekend
on a pull request that gets declined:

| | |
|---|---|
| **Cloud sync and accounts** | The app opens no sockets, and that is a feature. Your data is one file you own. |
| **Team or shared sessions** | This is a single-person tool. |
| **A todo manager** | `task set` binds an intention to a session. It is not a backlog, and it should not grow into one. |
| **Git or editor integrations** | A timer that watches your commits is a different product. |
| **A plugin system** | The terminal is the extension point. Add a command. |
| **Gamification** | No streaks-as-guilt, no badges, no confetti. |

The point of the list is that the app stays small. Most of the entries above
would each cost more than everything currently in `src-tauri/`.

---

## Contributing to any of this

Pick something from **Next**, or open an issue first if it is from **Later** —
those are less settled and worth agreeing on before you write code. See
[CONTRIBUTING.md](CONTRIBUTING.md) for setup and the one rule that matters.
