import { lazy } from 'react';
import { useApp } from './hooks/app/use-app';
const AppPanels = lazy(() => import('./components/app/AppPanels'));
const AppModals = lazy(() => import('./components/app/AppModals'));
const Header = lazy(() => import('./components/Header'));

const App = () => {
	const {
		/** state */
		appState,
		settingsOpen,
		setSettingsOpen,
		setTerminalOpen,
		licenseState,
		trialDaysRemaining,
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
		refreshLicenseState
	} = useApp();

	if (!appState) {
		return (
			<div className='h-screen w-screen bg-zetta-bg flex items-center justify-center'>
				<div className='text-gray-400 text-sm'>Loading...</div>
			</div>
		);
	}

	return (
		<div className='h-screen w-screen bg-zetta-bg flex flex-col overflow-hidden'>
			<Header
				activeProfileName={appState.active_profile.name}
				devMode={appState.dev_mode}
				onSettingsClick={() => setSettingsOpen(true)}
				onTerminalClick={() => setTerminalOpen(true)}
				volume={appState.sound_state.volume}
				isMuted={appState.sound_state.is_muted}
				onVolumeChange={handleVolumeChange}
				onMuteToggle={handleMuteToggle}
				theme={appState.theme}
				onThemeChange={handleThemeChange}
				licenseState={licenseState}
				trialDaysRemaining={trialDaysRemaining}
				onLicenseChange={refreshLicenseState}
			/>

			{/* Compact 2x2 Grid Layout */}
			<AppPanels
				{...{
					appState,
					processCommand,
					handleProfileSwitch,
					openCreateProfile,
					openEditProfile,
					profileError,
					setProfileError,
					licenseState,
					trialDaysRemaining
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
					handleThemeChange,
					helpOpen,
					profileModalOpen,
					setProfileModalOpen,
					profileModalMode,
					handleCreateProfile
				}}
			/>
		</div>
	);
};

export default App;
