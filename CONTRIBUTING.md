# Contributing

Bug reports and pull requests are welcome.

## Getting set up

Needs [Rust](https://rustup.rs), Node 20+ and pnpm. On Linux, also the Tauri
system dependencies — webkit2gtk, plus `libasound2-dev`, which `rodio` builds
against for audio. A missing ALSA header surfaces as a Rust compile error, not
an obviously missing package.

```bash
pnpm install
pnpm tauri dev
```

## Before you open a pull request

```bash
pnpm build                          # tsc --noEmit, then vite build
cd src-tauri && cargo check         # must be clean — no warnings
```

Both are currently green with zero warnings. Please keep them that way; a
warning nobody intends to fix trains everyone to ignore the ones that matter.

## The one architectural rule

**Rust owns the state.** The timer, active profile, sound state and strict mode
live in `AppState` on the Rust side. The React layer subscribes to
`state-updated` events and renders what it is told.

Do not add a `useState` that mirrors engine state, and do not run a timer in
JavaScript. If the UI needs to change something, it sends a command through
`execute_command` and waits for the state event. This is what keeps the window
and the engine from disagreeing, and it is the rule most worth protecting here.

## Adding a terminal command

1. Add a handler function in `src-tauri/src/commands/timer.rs`.
2. Register it in the `match cmd` block in `process_command`.
3. Add it to the help text in `help_command` so it is discoverable.

Commands return a `String` that the terminal prints. Keep the output short and
literal — no ASCII art, no exclamation marks.

## Audio

The four ambient tracks are 45-second seamless Vorbis loops embedded at compile
time. If you are adding one, match that: 45 seconds, Vorbis q3, 44.1 kHz, and
crossfade the tail against the head so the loop point is inaudible. The exact
ffmpeg invocation is in [ASSETS.md](ASSETS.md).

ffmpeg is only ever used to prepare a file before committing it. It is not a
build or runtime dependency.

Any track you contribute must be one you can license for redistribution inside
an MIT binary, and it has to be recorded in the table in `ASSETS.md`. Please
don't add audio without it.

## Style

Match what is already there. Comments explain *why* a thing is done, not what
the line does — if a choice looks odd, the comment should say what goes wrong
without it.

## Copyright in contributions

By opening a pull request you agree that:

- You wrote the contribution, or otherwise have the right to submit it.
- You grant Joy Ahmed a perpetual, worldwide, irrevocable licence to use,
  modify, sublicense and relicense your contribution, including under terms
  different from the MIT licence this project currently uses.
- You keep the copyright in your own work. This grant is in addition to the
  MIT licence, not instead of it.

This is here so the project can change licence later without having to track
down every past contributor for permission. It does not take anything away from
you, and it does not affect your right to use your own code however you like.

If you would rather not agree to this, open an issue describing the change
instead of a pull request — a good bug report is worth as much as a patch.
