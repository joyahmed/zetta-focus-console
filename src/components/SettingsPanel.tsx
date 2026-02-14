interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  devMode: boolean;
  onDevModeToggle: () => void;
  ambienceEnabled: boolean;
  onAmbienceToggle: () => void;
  soundVolume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  isPlaying: boolean;
  onSoundPlay: () => void;
  onSoundStop: () => void;
  backgroundType: 'gradient' | 'particles' | 'custom';
  onBackgroundTypeChange: (type: 'gradient' | 'particles') => void;
  onResetSettings: () => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  devMode,
  onDevModeToggle,
  ambienceEnabled,
  onAmbienceToggle,
  soundVolume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
  isPlaying,
  onSoundPlay,
  onSoundStop,
  backgroundType,
  onBackgroundTypeChange,
  onResetSettings,
  theme,
  onThemeChange
}: SettingsPanelProps) {
  const isLight = theme === 'light';

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-80 max-sm:w-full sm:w-72 md:w-80 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)'
        }}
      >
        <div
          className="flex items-center justify-between p-3 sm:p-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <h2
            className="text-base sm:text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 overflow-y-auto h-[calc(100%-60px)]">
          <section>
            <h3
              className="text-sm font-medium uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Visual
            </h3>
            <div
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Ambient Animations</span>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isLight ? 'Disabled in light mode' : 'Seasonal visual effects'}
                </div>
              </div>
              <button
                onClick={onAmbienceToggle}
                disabled={isLight}
                className={`relative w-11 h-6 rounded-full transition-colors ${isLight ? 'opacity-50 cursor-not-allowed' : ''} ${ambienceEnabled ? 'bg-blue-500' : isLight ? 'bg-gray-300' : 'bg-gray-600'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${ambienceEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                  style={{ backgroundColor: isLight && !ambienceEnabled ? '#666' : 'white' }}
                />
              </button>
            </div>
          </section>

          <section>
            <h3
              className="text-sm font-medium uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Sound
            </h3>
            <div className="space-y-3">
              {/* Volume Control */}
              <div
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Volume</span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {soundVolume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume}
                  onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  style={{ backgroundColor: isLight ? '#d1d5db' : '#374151' }}
                />
              </div>

              {/* Mute Toggle */}
              <div
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Mute</span>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Silence ambient sound
                  </div>
                </div>
                <button
                  onClick={onMuteToggle}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isMuted ? 'bg-red-500' : isLight ? 'bg-gray-300' : 'bg-gray-600'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${isMuted ? 'translate-x-5' : 'translate-x-0'}`}
                    style={{ backgroundColor: isLight && !isMuted ? '#666' : 'white' }}
                  />
                </button>
              </div>

              {/* Play/Stop Button */}
              <button
                onClick={isPlaying ? onSoundStop : onSoundPlay}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  isPlaying
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'border-opacity-50'
                }`}
                style={{
                  backgroundColor: isPlaying ? undefined : 'var(--bg-primary)',
                  borderColor: isPlaying ? undefined : 'var(--border-color)',
                  color: isPlaying ? undefined : 'var(--text-primary)'
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  {isPlaying ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      <span className="text-sm">Stop Ambient Sound</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">Play Ambient Sound</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </section>

          <section>
            <h3
              className="text-sm font-medium uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Background Mode
            </h3>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${backgroundType === 'gradient' ? 'border-blue-500' : ''}`}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: backgroundType === 'gradient' ? undefined : 'var(--border-color)'
                }}
              >
                <input
                  type="radio"
                  name="bg"
                  checked={backgroundType === 'gradient'}
                  onChange={() => onBackgroundTypeChange('gradient')}
                  className="accent-blue-500"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Gradient Theme</span>
              </label>
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${backgroundType === 'particles' ? 'border-blue-500' : ''}`}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: backgroundType === 'particles' ? undefined : 'var(--border-color)'
                }}
              >
                <input
                  type="radio"
                  name="bg"
                  checked={backgroundType === 'particles'}
                  onChange={() => onBackgroundTypeChange('particles')}
                  className="accent-blue-500"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Subtle Particles</span>
              </label>
            </div>
          </section>

          <section>
            <h3
              className="text-sm font-medium uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Theme
            </h3>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${theme === 'dark' ? 'border-blue-500' : ''}`}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: theme === 'dark' ? undefined : 'var(--border-color)'
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  checked={theme === 'dark'}
                  onChange={() => onThemeChange('dark')}
                  className="accent-blue-500"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Dark</span>
              </label>
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${theme === 'light' ? 'border-blue-500' : ''}`}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: theme === 'light' ? undefined : 'var(--border-color)'
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  checked={theme === 'light'}
                  onChange={() => onThemeChange('light')}
                  className="accent-blue-500"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Light</span>
              </label>
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${theme === 'system' ? 'border-blue-500' : ''}`}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: theme === 'system' ? undefined : 'var(--border-color)'
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  checked={theme === 'system'}
                  onChange={() => onThemeChange('system')}
                  className="accent-blue-500"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>System</span>
              </label>
            </div>
          </section>

          <section>
            <h3
              className="text-sm font-medium uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Developer
            </h3>
            <div
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)'
              }}
            >
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Developer Mode</span>
              <button
                onClick={onDevModeToggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${devMode ? 'bg-blue-500' : isLight ? 'bg-gray-300' : 'bg-gray-600'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${devMode ? 'translate-x-5' : 'translate-x-0'}`}
                  style={{ backgroundColor: isLight && !devMode ? '#666' : 'white' }}
                />
              </button>
            </div>
          </section>

          <section>
            <h3
              className="text-sm font-medium uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Data
            </h3>
            <button
              onClick={onResetSettings}
              className="w-full p-3 rounded-lg border text-left transition-colors group"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div
                className="text-sm group-hover:text-red-400"
                style={{ color: 'var(--text-primary)' }}
              >
                Reset Settings
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Restore default configuration
              </div>
            </button>
          </section>

          <section
            className="pt-4"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <div
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Zetta Focus Console v1.0.0
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
