# Assets

The MIT licence in `LICENSE` covers the source code. The ambient audio is
third-party work under its own terms, listed here.

## Ambient audio

`src-tauri/sounds/` — four Vorbis loops, embedded into the binary at compile
time by `sound.rs`.

| File | Source | Licence | Attribution required |
|---|---|---|---|
| `fireplace.ogg` | _fill in_ | _fill in_ | _fill in_ |
| `soft_rain.ogg` | _fill in_ | _fill in_ | _fill in_ |
| `light_wind.ogg` | _fill in_ | _fill in_ | _fill in_ |
| `rain_window.ogg` | _fill in_ | _fill in_ | _fill in_ |

> [!IMPORTANT]
> **This table is not filled in yet, and it needs to be before the repository
> goes public.** "Downloaded from a free site" is not one licence — it is
> several, and they differ on the one point that matters here. Pixabay and
> Freesound's CC0 files need nothing. Freesound also hosts a great deal of
> CC-BY material, which *must* credit the author by name, and CC-BY-NC
> material, which cannot ship in a redistributable app at all. The obligation
> attaches per file, not per site.
>
> Redistributing audio inside an MIT-licensed binary is redistribution, so
> whatever each file requires applies here.

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
