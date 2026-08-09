import { invoke } from '@tauri-apps/api/core';
import { useCallback } from 'react';

export const appUtils = ({
	appState,
	setTerminalKey,
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
		async (profileData: ProfileFormData) => {
			let cmd: string;
			if (profileData.id) {
				// Edit mode
				cmd = `profile edit ${profileData.id} "${profileData.name}" ${profileData.focus_min} ${profileData.short_break_min} ${profileData.long_break_min} ${profileData.sessions_per_cycle} ${profileData.season} ${profileData.intensity} ${profileData.sound}`;
			} else {
				// Create mode
				cmd = `profile create "${profileData.name}" ${profileData.focus_min} ${profileData.short_break_min} ${profileData.long_break_min} ${profileData.sessions_per_cycle} ${profileData.season} ${profileData.intensity} ${profileData.sound}`;
			}
			return await processCommand(cmd);
		},
		[processCommand]
	);

	const openCreateProfile = useCallback(() => {
		setProfileError(null);
		setProfileModalMode('create');
		setProfileModalOpen(true);
	}, []);

	const openEditProfile = useCallback(() => {
		setProfileError(null);
		setProfileModalMode('edit');
		setProfileModalOpen(true);
	}, []);

	/** Presets are read-only in the engine, so the way to change one is to
	    copy it into a profile that is not. */
	const openDuplicateProfile = useCallback(() => {
		setProfileError(null);
		setProfileModalMode('duplicate');
		setProfileModalOpen(true);
	}, []);

	const handleAlarmToggle = useCallback(async () => {
		if (!appState) return;
		const cmd = appState.alarm_enabled ? 'alarm off' : 'alarm on';
		try {
			await invoke('execute_command', { command: cmd });
		} catch (error) {
			console.error(error);
		}
	}, [appState?.alarm_enabled]);

	return {
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
