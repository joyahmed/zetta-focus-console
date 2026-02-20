import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useEffect, useRef } from 'react';
import { AppReactivitiesProps } from './types';

export const appReactivities = ({
	appState,
	setAppState,
	setLicenseState,
	setTrialDaysRemaining,
	setSessionSummary,
	setTerminalOpen,
	setSettingsOpen
}: AppReactivitiesProps) => {
	// Use ref to track current appState for event handlers
	const appStateRef = useRef(appState);
	const setTerminalOpenRef = useRef(setTerminalOpen);
	const setSettingsOpenRef = useRef(setSettingsOpen);

	// Keep refs updated
	appStateRef.current = appState;
	setTerminalOpenRef.current = setTerminalOpen;
	setSettingsOpenRef.current = setSettingsOpen;

	// Handler for global actions (from shortcuts or tray)
	const handleGlobalAction = async (action: string) => {
		const currentState = appStateRef.current;
		const terminalOpenFn = setTerminalOpenRef.current;
		const settingsOpenFn = setSettingsOpenRef.current;

		try {
			switch (action) {
				case 'start_stop':
					// Toggle start/stop based on current state
					if (currentState?.timer.status === 'running') {
						await invoke('execute_command', { command: 'stop' });
					} else if (
						currentState?.timer.status === 'idle' ||
						currentState?.timer.status === 'completed'
					) {
						await invoke('execute_command', { command: 'start' });
					}
					break;
				case 'pause_resume':
					// Toggle pause/resume based on current state
					if (currentState?.timer.status === 'running') {
						await invoke('execute_command', { command: 'pause' });
					} else if (currentState?.timer.status === 'paused') {
						await invoke('execute_command', { command: 'resume' });
					}
					break;
				case 'toggle_terminal':
					terminalOpenFn(prev => !prev);
					break;
				case 'start':
					await invoke('execute_command', { command: 'start' });
					break;
				case 'stop':
					await invoke('execute_command', { command: 'stop' });
					break;
				case 'pause':
					await invoke('execute_command', { command: 'pause' });
					break;
				case 'resume':
					await invoke('execute_command', { command: 'resume' });
					break;
				case 'settings':
					settingsOpenFn(true);
					break;
			}
		} catch (error) {
			console.error(
				'[Frontend] Error handling global action:',
				error
			);
		}
	};

	useEffect(() => {
		invoke<AppState>('get_state')
			.then(state => {
				setAppState(state);
			})
			.catch(console.error);

		// Fetch license state
		invoke<{ license_type: string }>('get_license')
			.then(state => {
				setLicenseState(state);
				// Fetch trial days if Trial
				if (state.license_type === 'Trial') {
					invoke<{ state: string; days_remaining: number }>(
						'get_trial_status'
					)
						.then(status =>
							setTrialDaysRemaining(status.days_remaining)
						)
						.catch(() => {});
				}
			})
			.catch(console.error);

		const unlisten = listen<StateEvent>('state-updated', event => {
			setAppState(event.payload.state);
			// Update tray state based on timer status
			const timer = event.payload.state.timer;
			const strictMode = event.payload.state.strict_mode;
			invoke('update_tray_state', {
				status: timer.status,
				sessionType: timer.session_type,
				strictModeActive: strictMode?.is_active || false
			}).catch(() => {});
		});

		// Listen for session completion events
		const unlistenSession = listen<string>(
			'session-complete',
			event => {
				setSessionSummary(event.payload);
				setTerminalOpen(true); // Open terminal to show summary
			}
		);

		// Listen for global shortcut events from backend
		const unlistenGlobalShortcut = listen<string>(
			'global-shortcut',
			event => {
				console.log(
					'[Frontend] Global shortcut received:',
					event.payload
				);
				handleGlobalAction(event.payload);
			}
		);

		// Listen for tray action events from backend
		const unlistenTrayAction = listen<string>(
			'tray-action',
			event => {
				console.log(
					'[Frontend] Tray action received:',
					event.payload
				);
				handleGlobalAction(event.payload);
			}
		);

		return () => {
			unlisten.then(fn => fn());
			unlistenSession.then(fn => fn());
			unlistenGlobalShortcut.then(fn => fn());
			unlistenTrayAction.then(fn => fn());
		};
	}, []);

	// Apply theme to document
	useEffect(() => {
		if (!appState) return;

		const applyTheme = (theme: string) => {
			if (theme === 'system') {
				// Check system preference
				const prefersDark = window.matchMedia(
					'(prefers-color-scheme: dark)'
				).matches;
				document.documentElement.setAttribute(
					'data-theme',
					prefersDark ? 'dark' : 'light'
				);
			} else {
				document.documentElement.setAttribute('data-theme', theme);
			}
		};

		applyTheme(appState.theme);

		// Listen for system theme changes
		const mediaQuery = window.matchMedia(
			'(prefers-color-scheme: dark)'
		);
		const handleChange = () => {
			if (appState.theme === 'system') {
				applyTheme('system');
			}
		};
		mediaQuery.addEventListener('change', handleChange);
		return () =>
			mediaQuery.removeEventListener('change', handleChange);
	}, [appState?.theme]);

	// Global keyboard shortcuts
	useEffect(() => {
		const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
			// Ctrl+T to open terminal (per Command Palette spec)
			if ((e.ctrlKey || e.metaKey) && e.key === 't') {
				e.preventDefault();
				setTerminalOpen(prev => !prev);
			}
			// ` or ~ to open terminal (alternative shortcut)
			if (e.key === '`' && !e.ctrlKey && !e.metaKey) {
				if (document.activeElement?.tagName !== 'INPUT') {
					e.preventDefault();
					setTerminalOpen(prev => !prev);
				}
			}
		};

		window.addEventListener('keydown', handleGlobalKeyDown);
		return () =>
			window.removeEventListener('keydown', handleGlobalKeyDown);
	}, []);

	// Timer tick and system stats intervals - stable, only cleared on unmount
	useEffect(() => {
		const timerInterval = setInterval(() => {
			invoke('tick_timer').catch(console.error);
		}, 1000);

		const systemInterval = setInterval(() => {
			invoke('tick_system_stats').catch(console.error);
		}, 5000);

		return () => {
			clearInterval(timerInterval);
			clearInterval(systemInterval);
		};
	}, []);
};
