import { useApp } from './hooks/app/use-app';
//import { useVoiceCues } from './hooks/use-voice-cues';
import AppPanels from './components/app/AppPanels';
import AppModals from './components/app/AppModals';
import Header from './components/Header';
import AppLoading from './components/app/AppLoading';
import MeshBackground from './components/app/MeshBackground';

const App = () => {
	const {
		/** state */
		appState,
		settingsOpen,
		setSettingsOpen,
		setTerminalOpen,
		terminalKey,
		terminalOpen,
		sessionSummary,
		setSessionSummary,
		helpOpen,
		setHelpOpen,
		profileError,
		setProfileError,
		profileModalOpen,
		setProfileModalOpen,
		profileModalMode,

		/** utils */
		processCommand,
		handleProfileSwitch,
		handleDevModeToggle,
		handleAmbienceToggle,
		handleVolumeChange,
		handleMuteToggle,
		handleSoundPlay,
		handleSoundStop,
		handleBackgroundTypeChange,
		handleResetSettings,
		handleThemeChange,
		handleCreateProfile,
		openCreateProfile,
		openEditProfile,
		handleVoiceToggle
	} = useApp();

	// Initialize voice cues
	//useVoiceCues();



	if (!appState) {
		return (
			<AppLoading />
		);
	}

	return (
		<div className='h-screen w-screen flex flex-col overflow-hidden relative'>
			<MeshBackground />

			<div className='relative z-10 flex flex-col h-full'>
				<Header
						{...{
							activeProfileName: appState.active_profile.name,
							devMode: appState.dev_mode,
							onSettingsClick: () => setSettingsOpen(true),
							onTerminalClick: () => setTerminalOpen(true),
							volume: appState.sound_state.volume,
							isMuted: appState.sound_state.is_muted,
							onVolumeChange: handleVolumeChange,
							onMuteToggle: handleMuteToggle,
							theme: appState.theme,
							onThemeChange: handleThemeChange,
						}}
					/>

				<AppPanels
						{...{
							appState,
							processCommand,
							handleProfileSwitch,
							openCreateProfile,
							openEditProfile,
							profileError,
							setProfileError,
						}}
					/>

				<AppModals
						{...{
							appState,
							terminalKey,
							terminalOpen,
							setTerminalOpen,
							processCommand,
							setHelpOpen,
							sessionSummary,
							setSessionSummary,
							settingsOpen,
							setSettingsOpen,
							handleDevModeToggle,
							handleAmbienceToggle,
							handleVolumeChange,
							handleMuteToggle,
							handleSoundPlay,
							handleSoundStop,
							handleBackgroundTypeChange,
							handleResetSettings,
							helpOpen,
							profileModalOpen,
							setProfileModalOpen,
							profileModalMode,
							handleCreateProfile,
												setProfileError,
																	voiceEnabled: appState.voice_enabled,
							onVoiceToggle: handleVoiceToggle
						}}
					/>
			</div>
		</div>
	);
};

export default App;
