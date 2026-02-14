import { invoke } from '@tauri-apps/api/core';
import { Dispatch, SetStateAction, useEffect } from 'react';

interface AppReactivitiesProps {
	setAppState: Dispatch<SetStateAction<AppState | null>>;
}

export const appReactivities = ({
	setAppState
}: AppReactivitiesProps) => {
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
		});

		// Listen for session completion events
		const unlistenSession = listen<string>(
			'session-complete',
			event => {
				setSessionSummary(event.payload);
				setTerminalOpen(true); // Open terminal to show summary
			}
		);

		return () => {
			unlisten.then(fn => fn());
			unlistenSession.then(fn => fn());
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

	useEffect(() => {
		if (!appState) return;

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
	}, [appState?.timer.status]);
};
