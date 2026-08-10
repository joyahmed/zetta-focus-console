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
- Runtime overrides (`timer 50m break 10m loop 3`) that survive a stop, and a
  full session cycle: focus, auto-break, and a long break that closes it
- Seasonal ambience — the profile’s own icon drifting through the panel
- Four seamless 45-second Vorbis loops
- Custom profiles, Strict Mode, session alarms, autostart, global shortcuts
- A tray icon that carries the session — a ring that fills as the run goes on,
  coloured for focus, break, strict and idle
- A week of history in the statistics panel, and in `stats`
- 5.0 MB installer, one JSON file of state, no network

---

## Next

**The first release.** The workflows are in place: a tag builds three platforms
and attaches the installers to a draft. What is left is installing one of them
on a machine that has never had the app — the tray, the global shortcuts and
the first-run defaults are exactly the things a development machine cannot
tell you about — and then publishing the draft.

**A recording of the terminal.** `timer 50m break 10m loop 3` is the entire
pitch. There are screenshots of it now; a few seconds of it being typed would
say more.

**More of the engine under test.** The session cycle and the day rollup are
covered, and two tests keep the command lists from drifting. Profiles, sound
state and the preference round-trip are not.

---

## Later

**Deeper engine instrumentation.** `devmode on`, `engine state` and `history`
expose some of the engine already. There is room for a real diagnostic surface —
session timing history, transition traces, what the engine did and when — for
people who want to operate the timer rather than just use it.

**More ambience.** Four seasons and four sounds is a floor, not a ceiling. The
particles are ordinary DOM and CSS — see `src/components/ambient-panel/`, which
is one scene component and one particle component. New audio has to clear the
licensing bar in [ASSETS.md](ASSETS.md).

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
