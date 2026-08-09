import { appReactivities } from './reactivities';
import { appStates } from './states';
import { appUtils } from './utils';

export const useApp = () => {
	const {
		appState,
		setAppState,
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
		setSessionSummary,
		setTerminalOpen,
		settingsOpen,
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
		handleResetSettings,
		handleThemeChange,
		handleCreateProfile,
		openCreateProfile,
		openEditProfile,
		openDuplicateProfile,
		handleAlarmToggle
	} = appUtils({
		appState,
		setTerminalKey,
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
		handleResetSettings,
		handleThemeChange,
		handleCreateProfile,
		openCreateProfile,
		openEditProfile,
		openDuplicateProfile,
		handleAlarmToggle
	};
};
