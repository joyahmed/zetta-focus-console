//! Sound module - Audio playback management

use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink};
use std::io::Cursor;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

/// How many decoded copies of the track to keep queued ahead of the playhead.
/// Two is enough for the seam to be gapless — one playing, one ready — without
/// holding a third decode in memory.
const QUEUE_DEPTH: usize = 2;

/// Get sound data based on sound file name
/// Returns the embedded sound data for the given sound file name
///
/// The tracks are Vorbis rather than MP3 on purpose. Every one of these is
/// played on a loop, and MP3 carries encoder delay and padding that decode as
/// silence at each end — audible as a gap on every pass. Vorbis is gapless.
///
/// They are also 45-second loops rather than the full recordings. Looping makes
/// length inaudible, and the originals were 256 kbps stereo running up to ten
/// and a half minutes: 42 MB of the bundle to say what 2 MB says.
pub fn get_sound_data(sound_file: &str) -> &'static [u8] {
    // Matched on the stem, not the whole filename: preferences written before
    // the switch to Vorbis still say "fireplace.mp3", and matching the literal
    // would drop every one of them onto the fallback — every profile silently
    // playing fireplace.
    let stem = sound_file
        .rsplit_once('.')
        .map(|(stem, _ext)| stem)
        .unwrap_or(sound_file);

    match stem {
        "soft_rain" => include_bytes!("../sounds/soft_rain.ogg"),
        "light_wind" => include_bytes!("../sounds/light_wind.ogg"),
        "rain_window" => include_bytes!("../sounds/rain_window.ogg"),
        // fireplace, and anything unrecognised
        _ => include_bytes!("../sounds/fireplace.ogg"),
    }
}

/// SoundManager handles audio playback for ambient sounds
pub struct SoundManager {
    sink: Option<Arc<Sink>>,
    _stream: Option<OutputStream>,
    stream_handle: Option<OutputStreamHandle>,
    /// Cleared to tell the refill thread of a previous track to exit.
    refilling: Option<Arc<AtomicBool>>,
}

impl SoundManager {
    pub fn new() -> Self {
        Self {
            sink: None,
            _stream: None,
            stream_handle: None,
            refilling: None,
        }
    }

    /// Play a track on a continuous loop.
    ///
    /// Looping is done by decoding the track again each time the queue runs
    /// low, rather than with `repeat_infinite()`. That combinator wraps the
    /// source in rodio's `Buffered`, which caches every decoded sample so it
    /// can replay them — for a 45-second stereo track at 44.1 kHz that is
    /// ~7.9 MB of i16 PCM held for as long as the sound is selected, and it was
    /// the largest single allocation in the process.
    ///
    /// Re-decoding costs a few milliseconds of CPU per pass, against a source
    /// that is a ~550 KB slice of the binary and never copied. Memory stays
    /// flat at whatever rodio needs for the samples actually in flight.
    pub fn play(&mut self, sound_data: &'static [u8], volume: u8) -> Result<(), String> {
        // Recreate output stream to recover from invalidated audio backends after stop().
        self.reinitialize()?;

        let stream_handle = self
            .stream_handle
            .as_ref()
            .ok_or_else(|| "Audio stream not initialized".to_string())?;

        let sink =
            Sink::try_new(stream_handle).map_err(|e| format!("Failed to create sink: {}", e))?;
        sink.set_volume((volume as f32) / 100.0);

        for _ in 0..QUEUE_DEPTH {
            sink.append(decode(sound_data)?);
        }

        let sink = Arc::new(sink);
        let refilling = Arc::new(AtomicBool::new(true));

        // Top the queue back up as it drains. The thread holds only an Arc to
        // the sink and a 'static slice, so it cannot outlive anything it reads.
        let thread_sink = Arc::clone(&sink);
        let thread_flag = Arc::clone(&refilling);
        thread::spawn(move || {
            while thread_flag.load(Ordering::Relaxed) {
                // Two owners left (here and SoundManager) means nothing else
                // holds this sink; if it drops to one, the manager moved on.
                if Arc::strong_count(&thread_sink) < 2 {
                    break;
                }
                if thread_sink.len() < QUEUE_DEPTH {
                    match decode(sound_data) {
                        Ok(source) => thread_sink.append(source),
                        Err(e) => {
                            eprintln!("[SOUND] Failed to re-decode for loop: {}", e);
                            break;
                        }
                    }
                }
                thread::sleep(Duration::from_millis(500));
            }
        });

        self.sink = Some(sink);
        self.refilling = Some(refilling);
        Ok(())
    }

    fn reinitialize(&mut self) -> Result<(), String> {
        self.stop();

        match OutputStream::try_default() {
            Ok((stream, stream_handle)) => {
                self._stream = Some(stream);
                self.stream_handle = Some(stream_handle);
                Ok(())
            }
            Err(e) => Err(format!("Failed to initialize audio: {}", e)),
        }
    }

    pub fn stop(&mut self) {
        if let Some(flag) = self.refilling.take() {
            flag.store(false, Ordering::Relaxed);
        }
        if let Some(sink) = self.sink.take() {
            sink.stop();
        }
    }

    pub fn set_volume(&mut self, volume: u8) {
        if let Some(sink) = &self.sink {
            sink.set_volume((volume as f32) / 100.0);
        }
    }

    pub fn pause(&mut self) {
        if let Some(sink) = &self.sink {
            sink.pause();
        }
    }

    pub fn resume(&mut self) {
        if let Some(sink) = &self.sink {
            sink.play();
        }
    }

    pub fn is_playing(&self) -> bool {
        self.sink
            .as_ref()
            .map(|s| !s.is_paused() && !s.empty())
            .unwrap_or(false)
    }
}

fn decode(sound_data: &'static [u8]) -> Result<Decoder<Cursor<&'static [u8]>>, String> {
    Decoder::new(Cursor::new(sound_data)).map_err(|e| format!("Failed to decode audio: {}", e))
}

unsafe impl Send for SoundManager {}
unsafe impl Sync for SoundManager {}

impl Default for SoundManager {
    fn default() -> Self {
        Self::new()
    }
}
