import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';

/** The two startup preferences, and the commands behind each. They were two
    copies of the same load, the same toggle and the same row of markup. */
export const STARTUP_SETTINGS: StartupSetting[] = [
	{
		key: 'autostart',
		title: 'Start with Windows',
		description: 'Launch app when Windows starts',
		getCommand: 'get_autostart_enabled',
		setCommand: 'set_autostart_enabled'
	},
	{
		key: 'startMinimized',
		title: 'Start Minimized',
		description: 'Start app minimized to system tray',
		getCommand: 'get_start_minimized',
		setCommand: 'set_start_minimized'
	}
];

const INITIAL: StartupSettingValues = {
	autostart: false,
	startMinimized: false
};

export const useStartupSettings = () => {
	const [values, setValues] = useState<StartupSettingValues>(INITIAL);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const loaded = await Promise.all(
					STARTUP_SETTINGS.map(setting =>
						invoke<boolean>(setting.getCommand)
					)
				);

				setValues(
					STARTUP_SETTINGS.reduce(
						(acc, setting, index) => ({
							...acc,
							[setting.key]: loaded[index]
						}),
						INITIAL
					)
				);
			} catch (error) {
				console.error('Failed to load startup settings:', error);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, []);

	const toggle = async (setting: StartupSetting) => {
		const enabled = !values[setting.key];

		try {
			await invoke(setting.setCommand, { enabled });
			setValues(prev => ({ ...prev, [setting.key]: enabled }));
		} catch (error) {
			console.error(`Failed to toggle ${setting.key}:`, error);
		}
	};

	return { values, loading, toggle };
};
