//! Sound module - Audio playback management

use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink, Source};
use std::io::Cursor;

/// Get sound data based on sound file name
/// Returns the embedded sound data for the given sound file name
///
/// The tracks are Vorbis rather than MP3 on purpose. Every one of these is
/// played through `repeat_infinite()`, and MP3 carries encoder delay and
/// padding that decode as silence at each end — audible as a gap on every
/// loop. Vorbis is gapless, so the seam is inaudible.
///
/// They are also 45-second loops rather than the full recordings. Looping
/// makes length inaudible, and the originals were 256 kbps stereo running up
/// to ten and a half minutes: 42 MB of the bundle to say what 2 MB says.
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
    sink: Option<Sink>,
    _stream: Option<OutputStream>,
    stream_handle: Option<OutputStreamHandle>,
}

impl SoundManager {
    pub fn new() -> Self {
        Self {
            sink: None,
            _stream: None,
            stream_handle: None,
        }
    }

    pub fn play(&mut self, sound_data: &'static [u8], volume: u8) -> Result<(), String> {
        // Recreate output stream to recover from invalidated audio backends after stop().
        self.reinitialize()?;

        let cursor = Cursor::new(sound_data);
        let source = Decoder::new(cursor).map_err(|e| format!("Failed to decode audio: {}", e))?;

        let stream_handle = self
            .stream_handle
            .as_ref()
            .ok_or_else(|| "Audio stream not initialized".to_string())?;

        let sink =
            Sink::try_new(stream_handle).map_err(|e| format!("Failed to create sink: {}", e))?;

        let volume_float = (volume as f32) / 100.0;
        sink.set_volume(volume_float);
        sink.append(source.repeat_infinite());

        self.sink = Some(sink);
        Ok(())
    }

    fn reinitialize(&mut self) -> Result<(), String> {
        if let Some(sink) = self.sink.take() {
            sink.stop();
        }

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
        if let Some(sink) = self.sink.take() {
            sink.stop();
            // sink is dropped here, which is fine - stream_handle remains valid
        }
    }

    pub fn set_volume(&mut self, volume: u8) {
        if let Some(sink) = &self.sink {
            let volume_float = (volume as f32) / 100.0;
            sink.set_volume(volume_float);
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

unsafe impl Send for SoundManager {}
unsafe impl Sync for SoundManager {}

impl Default for SoundManager {
    fn default() -> Self {
        Self::new()
    }
}
