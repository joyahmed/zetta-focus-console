//! Sound module - Audio playback management

use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink, Source};
use std::io::Cursor;
use std::sync::atomic::{AtomicBool, Ordering};

/// Get sound data based on sound file name
/// Returns the embedded sound data for the given sound file name
pub fn get_sound_data(sound_file: &str) -> &'static [u8] {
    match sound_file {
        "fireplace.mp3" => include_bytes!("../sounds/fireplace.mp3"),
        "soft_rain.mp3" => include_bytes!("../sounds/soft_rain.mp3"),
        "light_wind.mp3" => include_bytes!("../sounds/light_wind.mp3"),
        "rain_window.mp3" => include_bytes!("../sounds/rain_window.mp3"),
        _ => include_bytes!("../sounds/fireplace.mp3"), // Default fallback
    }
}

/// SoundManager handles audio playback for ambient sounds
pub struct SoundManager {
    sink: Option<Sink>,
    _stream: Option<OutputStream>,
    stream_handle: Option<OutputStreamHandle>,
    is_initialized: AtomicBool,
    current_sound_file: Option<String>,
}

impl SoundManager {
    pub fn new() -> Self {
        Self {
            sink: None,
            _stream: None,
            stream_handle: None,
            is_initialized: AtomicBool::new(false),
            current_sound_file: None,
        }
    }

    pub fn initialize(&mut self) -> Result<(), String> {
        if self.is_initialized.load(Ordering::SeqCst) {
            return Ok(());
        }

        match OutputStream::try_default() {
            Ok((stream, stream_handle)) => {
                self._stream = Some(stream);
                self.stream_handle = Some(stream_handle);
                self.is_initialized.store(true, Ordering::SeqCst);
                Ok(())
            }
            Err(e) => Err(format!("Failed to initialize audio: {}", e)),
        }
    }

    pub fn play(&mut self, sound_data: &'static [u8], volume: u8) -> Result<(), String> {
        if !self.is_initialized.load(Ordering::SeqCst) {
            self.initialize()?;
        }

        self.stop();

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
        // Loop the ambient sound indefinitely
        sink.append(source.repeat_infinite());

        self.sink = Some(sink);
        Ok(())
    }

    pub fn stop(&mut self) {
        if let Some(sink) = self.sink.take() {
            sink.stop();
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
