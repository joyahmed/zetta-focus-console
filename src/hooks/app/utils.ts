import { invoke } from '@tauri-apps/api/core';
import { useCallback } from 'react';
import { AppUtilsProps } from './types';

export const appUtils = ({
	appState,
	setTerminalKey,
	setLicenseState,
	setTrialDaysRemaining,
	setProfileError,
	setProfileModalMode,
	setProfileModalOpen
}: AppUtilsProps) => {
	const processCommand = useCallback(
		async (command: string): Promise<string> => {
			if (command === 'clear') {
				setTerminalKey(k => k + 1);
				return '';
			}

			try {
				const result = await invoke<string>('execute_command', {
					command
				});
				return result;
			} catch (error) {
				return `Error: ${error}`;
			}
		},
		[]
	);

	const handleProfileSwitch = useCallback(
		async (profileId: string) => {
			try {
				await invoke('execute_command', {
					command: `profile ${profileId}`
				});
			} catch (error) {
				console.error(error);
			}
		},
		[]
	);

	const handleDevModeToggle = useCallback(async () => {
		if (!appState) return;
		const cmd = appState.dev_mode ? 'devmode off' : 'devmode on';
		try {
			await invoke('execute_command', { command: cmd });
		} catch (error) {
			console.error(error);
		}
	}, [appState?.dev_mode]);

	const handleAmbienceToggle = useCallback(async () => {
		if (!appState) return;
		const cmd = appState.ambience_enabled
			? 'ambience off'
			: 'ambience on';
		try {
			await invoke('execute_command', { command: cmd });
		} catch (error) {
			console.error(error);
		}
	}, [appState?.ambience_enabled]);

	const handleVolumeChange = useCallback(async (volume: number) => {
		try {
			await invoke('execute_command', {
				command: `sound volume ${volume}`
			});
		} catch (error) {
			console.error(error);
		}
	}, []);

	const handleMuteToggle = useCallback(async () => {
		try {
			await invoke('execute_command', { command: 'sound mute' });
		} catch (error) {
			console.error(error);
		}
	}, []);

	const handleSoundPlay = useCallback(async () => {
		try {
			await invoke('execute_command', { command: 'sound play' });
		} catch (error) {
			console.error(error);
		}
	}, []);

	const handleSoundStop = useCallback(async () => {
		try {
			await invoke('execute_command', { command: 'sound stop' });
		} catch (error) {
			console.error(error);
		}
	}, []);

	const handleBackgroundTypeChange = useCallback(
		async (type: 'gradient' | 'particles') => {
			try {
				await invoke('execute_command', {
					command: `background ${type}`
				});
			} catch (error) {
				console.error(error);
			}
		},
		[]
	);

	const handleResetSettings = useCallback(async () => {
		try {
			await invoke('execute_command', { command: 'reset' });
		} catch (error) {
			console.error(error);
		}
	}, []);

	const handleThemeChange = useCallback(async (theme: string) => {
		try {
			await invoke('set_theme', { theme });
		} catch (error) {
			console.error(error);
		}
	}, []);

	const handleCreateProfile = useCallback(
		async (profileData: {
			id?: string;
			name: string;
			focus_min: number;
			short_break_min: number;
			long_break_min: number;
			season: string;
			intensity: string;
			sound: string;
		}) => {
			let cmd: string;
			if (profileData.id) {
				// Edit mode
				cmd = `profile edit ${profileData.id} "${profileData.name}" ${profileData.focus_min} ${profileData.short_break_min} ${profileData.long_break_min} ${profileData.season} ${profileData.intensity} ${profileData.sound}`;
			} else {
				// Create mode
				cmd = `profile create "${profileData.name}" ${profileData.focus_min} ${profileData.short_break_min} ${profileData.long_break_min} ${profileData.season} ${profileData.intensity} ${profileData.sound}`;
			}
			return await processCommand(cmd);
		},
		[processCommand]
	);

	const openCreateProfile = useCallback(async () => {
		try {
			// Check if user can create profile based on license
			const result = await invoke<{
				can_create: boolean;
				is_pro: boolean;
				custom_profile_count: number;
				message: string;
			}>('can_create_profile');

			if (!result.can_create) {
				setProfileError(result.message);
				return;
			}
			setProfileError(null);
			setProfileModalMode('create');
			setProfileModalOpen(true);
		} catch (error) {
			setProfileError(String(error));
		}
	}, []);

	const openEditProfile = useCallback(() => {
		setProfileError(null);
		setProfileModalMode('edit');
		setProfileModalOpen(true);
	}, []);

	// Refresh license state (used by Header when license override changes)
	const refreshLicenseState = useCallback(async () => {
		try {
			const state = await invoke<{ license_type: string }>(
				'get_license'
			);
			setLicenseState(state);
			if (state.license_type === 'Trial') {
				const status = await invoke<{
					state: string;
					days_remaining: number;
				}>('get_trial_status');
				setTrialDaysRemaining(status.days_remaining);
			} else {
				setTrialDaysRemaining(null);
			}
		} catch (error) {
			console.error('Failed to refresh license state:', error);
		}
	}, []);

  return {
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
