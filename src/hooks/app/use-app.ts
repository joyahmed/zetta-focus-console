import { appReactivities } from './reactivities';
import { appStates } from './states';
import { appUtils } from './utils';

export const useApp = () => {
	const {
		appState,
		setAppState,
		licenseState,
		setLicenseState,
		trialDaysRemaining,
		setTrialDaysRemaining,
		terminalKey,
		setTerminalKey,
		settingsOpen,
		setSettingsOpen,
		helpOpen,
		setHelpOpen,
		terminalOpen,
		setTerminalOpen,
		profileModalOpen,
		setProfileModalOpen,
		profileModalMode,
		setProfileModalMode,
		sessionSummary,
		setSessionSummary,
		profileError,
		setProfileError
	} = appStates();

	appReactivities({
		appState,
		setAppState,
		setLicenseState,
		setTrialDaysRemaining,
		setSessionSummary,
		setTerminalOpen,
		setSettingsOpen
	});

	const {
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
	} = appUtils({
		appState,
		setTerminalKey,
		setLicenseState,
		setTrialDaysRemaining,
		setProfileError,
		setProfileModalMode,
		setProfileModalOpen
	});

	return {
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
	};
};
