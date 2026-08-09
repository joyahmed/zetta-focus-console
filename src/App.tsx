import { lazy, Suspense } from 'react';
import { useApp } from './hooks/app/use-app';
//import { useVoiceCues } from './hooks/use-voice-cues';
const AppPanels = lazy(() => import('./components/app/AppPanels'));
const AppModals = lazy(() => import('./components/app/AppModals'));
const Header = lazy(() => import('./components/Header'));
const AppLoading = lazy(() => import('./components/app/AppLoading'));
const MeshBackground = lazy(
	() => import('./components/app/MeshBackground')
);

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
			<Suspense fallback={null}>
				<AppLoading />
			</Suspense>
		);
	}

	return (
		<div className='h-screen w-screen flex flex-col overflow-hidden relative'>
			<Suspense fallback={null}>
				<MeshBackground />
			</Suspense>

			<div className='relative z-10 flex flex-col h-full'>
				<Suspense fallback={null}>
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
				</Suspense>

				<Suspense fallback={null}>
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
				</Suspense>

				<Suspense fallback={null}>
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
				</Suspense>
			</div>
		</div>
	);
};

export default App;
