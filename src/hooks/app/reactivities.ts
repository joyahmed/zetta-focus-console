import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useEffect, useRef } from 'react';
import { AppReactivitiesProps } from './types';

export const appReactivities = ({
	appState,
	setAppState,
	setSessionSummary,
	setTerminalOpen,
	settingsOpen,
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

		console.log('[Frontend] handleGlobalAction:', action);

		try {
			switch (action) {
				// Timer controls
				case 'start_stop':
					if (currentState?.timer?.status === 'running') {
						await invoke('execute_command', { command: 'stop' });
					} else if (
						currentState?.timer?.status === 'idle' ||
						currentState?.timer?.status === 'completed'
					) {
						await invoke('execute_command', { command: 'start' });
					}
					break;
				case 'pause_resume':
					if (currentState?.timer?.status === 'running') {
						await invoke('execute_command', { command: 'pause' });
					} else if (currentState?.timer?.status === 'paused') {
						await invoke('execute_command', { command: 'resume' });
					}
					break;
				case 'toggle_terminal':
					terminalOpenFn(prev => !prev);
					break;

				// Settings & UI
				case 'settings':
					settingsOpenFn(true);
					break;
				case 'toggle_theme':
					await invoke('execute_command', {
						command: 'theme toggle'
					});
					break;

				// Sound & Volume
				case 'toggle_mute':
					await invoke('execute_command', { command: 'sound mute' });
					break;
				case 'volume_up':
					await invoke('execute_command', {
						command: 'sound volume up'
					});
					break;
				case 'volume_down':
					await invoke('execute_command', {
						command: 'sound volume down'
					});
					break;

				// Special features
				case 'toggle_voice':
					await invoke('execute_command', {
						command: currentState?.voice_enabled
							? 'voice off'
							: 'voice on'
					});
					break;
				case 'toggle_particles':
					await invoke('execute_command', {
						command:
							currentState?.active_profile?.background_type ===
							'particles'
								? 'background gradient'
								: 'background particles'
					});
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

	// Use ref to access appState in keyboard handler
	// const appStateRef = useRef(appState);
	appStateRef.current = appState;

	// In-app keyboard shortcuts (only work when app is in focus)
	useEffect(() => {
		console.log('[DEBUG] Keyboard effect running - adding listener');

		const handleKeyDown = async (e: KeyboardEvent) => {
			console.log(
				'[DEBUG] Key pressed:',
				e.key,
				'ctrl:',
				e.ctrlKey,
				'shift:',
				e.shiftKey
			);

			// Ignore if user is typing in an input field
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement ||
				e.target instanceof HTMLSelectElement
			) {
				return;
			}

			const key = e.key.toLowerCase();
			const ctrl = e.ctrlKey || e.metaKey;

			// Ctrl+S - Start/Stop
			if (ctrl && key === 's') {
				e.preventDefault();
				e.stopPropagation();
				console.log('[SHORTCUT] Ctrl+S: Start/Stop');
				const status = appStateRef.current?.timer?.status;
				if (status === 'running') {
					await invoke('execute_command', { command: 'stop' });
				} else if (status === 'idle' || status === 'completed') {
					await invoke('execute_command', { command: 'start' });
				}
			}
			// Ctrl+P - Pause/Resume
			else if (ctrl && key === 'p') {
				e.preventDefault();
				e.stopPropagation();
				console.log('[SHORTCUT] Ctrl+P: Pause/Resume');
				const status = appStateRef.current?.timer?.status;
				if (status === 'running') {
					await invoke('execute_command', { command: 'pause' });
				} else if (status === 'paused') {
					await invoke('execute_command', { command: 'resume' });
				}
			}
			// Ctrl+T - Toggle terminal
			else if (ctrl && key === 't') {
				e.preventDefault();
				e.stopPropagation();
				console.log('[SHORTCUT] Ctrl+T: Toggle terminal');
				setTerminalOpen(prev => !prev);
			}
			// Ctrl+, - Settings (toggle)
			else if (ctrl && e.key === ',') {
				e.preventDefault();
				e.stopPropagation();
				console.log(
					'[SHORTCUT] Ctrl+,: Settings - current:',
					settingsOpen
				);
				setSettingsOpen(prev => {
					console.log('[SHORTCUT] Toggling settings:', !prev);
					return !prev;
				});
			}
			// Ctrl+D - Toggle theme
			else if (ctrl && key === 'd') {
				e.preventDefault();
				e.stopPropagation();
				console.log('[SHORTCUT] Ctrl+D: Toggle theme');
				await invoke('execute_command', { command: 'theme toggle' });
			}
			// Ctrl+M - Mute
			else if (ctrl && key === 'm') {
				e.preventDefault();
				e.stopPropagation();
				console.log('[SHORTCUT] Ctrl+M: Mute');
				await invoke('execute_command', { command: 'sound mute' });
			}
			// Ctrl+= / Ctrl++ - Volume up
			else if (
				ctrl &&
				(key === '=' ||
					key === '+' ||
					key === 'add' ||
					e.code === 'Equal' ||
					e.code === 'NumpadAdd')
			) {
				e.preventDefault();
				e.stopPropagation();
				console.log('[SHORTCUT] Ctrl+=/+: Volume up');
				await invoke('execute_command', {
					command: 'sound volume up'
				});
			}
			// Ctrl+- - Volume down
			else if (
				ctrl &&
				(key === '-' ||
					key === 'subtract' ||
					e.code === 'Minus' ||
					e.code === 'NumpadSubtract')
			) {
				e.preventDefault();
				e.stopPropagation();
				console.log('[SHORTCUT] Ctrl+-: Volume down');
				await invoke('execute_command', {
					command: 'sound volume down'
				});
			}
			// Ctrl+V - Voice cues
			else if (ctrl && !e.shiftKey && key === 'v') {
				e.preventDefault();
				e.stopPropagation();
				const voiceEnabled = appStateRef.current?.voice_enabled;
				await invoke('execute_command', {
					command: voiceEnabled ? 'voice off' : 'voice on'
				});
			}
			// Ctrl+B - Toggle background particles
			else if (
				ctrl &&
				!e.shiftKey &&
				(key === 'b' || e.code === 'KeyB')
			) {
				e.preventDefault();
				e.stopPropagation();
				const currentBackground =
					appStateRef.current?.active_profile?.background_type;
				await invoke('execute_command', {
					command:
						currentBackground === 'particles'
							? 'background gradient'
							: 'background particles'
				});
			}
		};

		// Capture phase gives this handler the best chance to intercept browser defaults.
		document.addEventListener('keydown', handleKeyDown, true);
		return () =>
			document.removeEventListener('keydown', handleKeyDown, true);
	}, [setTerminalOpen, setSettingsOpen]);
};;
