# Assets

The MIT licence in `LICENSE` covers the source code. The ambient audio is
third-party work under its own terms, listed here.

## Ambient audio

`src-tauri/sounds/` — four Vorbis loops, embedded into the binary at compile
time by `sound.rs`.

| File | Source | Licence | Attribution required |
|---|---|---|---|
| `fireplace.ogg` | Pixabay or Pexels | Site licence — see below | No |
| `soft_rain.ogg` | Pixabay or Pexels | Site licence — see below | No |
| `light_wind.ogg` | Pixabay or Pexels | Site licence — see below | No |
| `rain_window.ogg` | Pixabay or Pexels | Site licence — see below | No |

All four were downloaded from Pixabay or Pexels. Which of the two, and which
individual track, was not recorded at the time and is no longer known — the
files entered the repository in one commit in February 2026 with no note, and
nothing in the project's history since mentions a source.

That matters less than it would elsewhere, because **neither site licenses
per file**. Both apply one licence to everything they host:

- **Pixabay Content License** — free for commercial and non-commercial use, no
  attribution required, may be used in and distributed as part of a product.
  It forbids redistributing the files *as files* on a competing stock site, and
  selling them unaltered; embedding them in an application is squarely allowed.
  Material uploaded before January 2019 is CC0, which is more permissive still.
- **Pexels License** — the same shape: free to use, no attribution required,
  commercial use allowed, no redistribution as stock.

So whichever of the two each track came from, the obligations on this project
are identical and already met: nothing to credit, and shipping them inside the
binary is permitted.

> [!NOTE]
> The residual risk is that a file turns out not to have come from either site
> after all, in which case its real terms are unknown. The exposure is a
> takedown request against a free MIT app, and the remedy is cheap — replace
> the file with one whose provenance is recorded. If any of these are ever
> re-sourced, note the URL here at the time rather than afterwards.

## Fonts

`src/assets/fonts/` — bundled with the frontend, so the app renders in its own
typefaces offline. Both are SIL Open Font License 1.1, which permits
redistribution inside this binary; the full licence text ships beside the files.

| File | Source | Licence | Attribution required |
|---|---|---|---|
| `Inter-latin.woff2`, `Inter-latin-ext.woff2` | [rsms/inter](https://github.com/rsms/inter) v4, latin subsets as served by Google Fonts | SIL OFL 1.1 (`Inter-OFL.txt`) | No, but the licence must ship — it does |
| `JetBrainsMono-{Regular,Medium,Bold}.woff2` | [JetBrains/JetBrainsMono](https://github.com/JetBrains/JetBrainsMono) v2.304 | SIL OFL 1.1 (`JetBrainsMono-OFL.txt`) | No, but the licence must ship — it does |

Both were obtained through Google Fonts, which is a distribution channel rather
than a licensor: the terms come from the upstream projects and are SIL OFL 1.1
in both cases. Google Fonts hosts nothing under any other licence, so "free
from Google Fonts" and "OFL" mean the same thing here.

The OFL's one hard condition for a bundle like this is that the fonts are not
sold on their own and that the licence travels with them — which is why
`Inter-OFL.txt` and `JetBrainsMono-OFL.txt` sit beside the `.woff2` files and
ship with the app. Neither font may be renamed while still called "Inter" or
"JetBrains Mono"; they are not modified here, only subset by Google's own
service in Inter's case.

Inter is a variable font, so a single file per unicode subset covers weights
300–700. JetBrains Mono ships as three static weights because only three are
used: 400 for body monospace, 500 for the clock and numeric inputs, 700 for the
dev-mode badge. 414 KB of fonts in total.

Before this, `index.css` imported both from `fonts.googleapis.com`. A desktop
app that reaches the network to draw its own interface fails at exactly the
moment a focus timer is most useful — offline — and it sent a request to Google
on every launch from an app that otherwise talks to nothing.

## Processing

The originals were 256 kbps stereo MP3 running 1–10½ minutes. They are played
on an infinite loop, so length past the loop point is inaudible — and 42 MB of
the 44 MB bundle was these four files.

Each was cut to a 45-second seamless loop and re-encoded to Vorbis q3. The tail
of the loop is crossfaded against its own head over 3 seconds, taken from the
audio immediately following the loop body, so the seam is continuous rather
than butt-joined:

```
ffmpeg -i in.mp3 -filter_complex \
  "[0]atrim=start=$((S+L)):duration=$F,asetpts=PTS-STARTPTS[t]; \
   [0]atrim=start=$S:duration=$L,asetpts=PTS-STARTPTS[x]; \
   [t][x]acrossfade=d=$F:c1=tri:c2=tri[out]" \
  -map "[out]" -c:a libvorbis -q:a 3 -ar 44100 out.ogg
```

Vorbis rather than MP3 because MP3 carries encoder delay and padding that
decode as silence at both ends, which `repeat_infinite()` turns into an audible
gap on every pass. Vorbis is gapless.

Result: 42.0 MB → 2.16 MB.

## Icons

`src-tauri/icons/` and `app-icon.png` are original work, MIT alongside the code.
