import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useCallback, useEffect, useState } from 'react';
import { AmbientPanel } from './components/AmbientPanel';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import { ProfileModal } from './components/ProfileModal';
import { ProfilePanel } from './components/ProfilePanel';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsPanel } from './components/StatsPanel';
import { TerminalModal } from './components/TerminalModal';
import { TimerPanel } from './components/TimerPanel';

interface TimerState {
	remaining_seconds: number;
	total_seconds: number;
	status: 'idle' | 'running' | 'paused' | 'completed';
	session_type: 'focus' | 'short_break' | 'long_break';
}

interface Profile {
	id: string;
	name: string;
	season: 'spring' | 'summer' | 'autumn' | 'winter';
	motion_intensity: 'low' | 'medium' | 'high';
	background_type: 'gradient' | 'particles' | 'custom';
	focus_duration: number;
	short_break_duration: number;
	long_break_duration: number;
	glow_color: string;
	sound_file: string;
	default_volume: number;
	is_preset: boolean;
}

interface Stats {
	sessions_today: number;
	total_focus_minutes: number;
	current_streak: number;
	last_session_duration: number;
}

interface SystemStats {
	cpu_usage: number;
	memory_used: number;
	memory_total: number;
}

interface AppStats {
	cpu_usage: number;
	memory_used: number;
}

interface SoundState {
	current_sound: string | null;
	volume: number;
	is_playing: boolean;
	is_muted: boolean;
}

interface SessionOverride {
	focus_duration: number | null;
	break_duration: number | null;
	loop_count: number | null;
}

interface AppState {
	timer: TimerState;
	active_profile: Profile;
	profiles: Profile[];
	stats: Stats;
	system_stats: SystemStats;
	app_stats: AppStats;
	dev_mode: boolean;
	sound_state: SoundState;
	session_override: SessionOverride | null;
	ambience_enabled: boolean;
	theme: string;
}

interface StateEvent {
	state: AppState;
}

function App() {
	const [appState, setAppState] = useState<AppState | null>(null);
	const [terminalKey, setTerminalKey] = useState(0);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
	const [terminalOpen, setTerminalOpen] = useState(false);
	const [profileModalOpen, setProfileModalOpen] = useState(false);
	const [profileModalMode, setProfileModalMode] = useState<
		'create' | 'edit'
	>('create');
	const [sessionSummary, setSessionSummary] = useState<string | null>(
		null
	);

	useEffect(() => {
		invoke<AppState>('get_state')
			.then(state => {
				setAppState(state);
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
				const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
				document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
			} else {
				document.documentElement.setAttribute('data-theme', theme);
			}
		};

		applyTheme(appState.theme);

		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = () => {
			if (appState.theme === 'system') {
				applyTheme('system');
			}
		};
		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
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

	const openCreateProfile = useCallback(() => {
		setProfileModalMode('create');
		setProfileModalOpen(true);
	}, []);

	const openEditProfile = useCallback(() => {
		setProfileModalMode('edit');
		setProfileModalOpen(true);
	}, []);

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
			/>

			{/* Compact 2x2 Grid Layout */}
			<main className='flex-1 p-4 overflow-auto'>
				<div
					className='grid grid-cols-2 gap-4 h-full'
					style={{ gridTemplateRows: '1fr 1fr' }}
				>
					{/* Top Left: Timer */}
					<div className='min-h-0'>
						<TimerPanel
							timer={appState.timer}
							glowColor={appState.active_profile.glow_color}
							sessionOverride={appState.session_override}
							onStart={() => processCommand('start')}
							onPause={() => processCommand('focus pause')}
							onResume={() => processCommand('focus resume')}
							onStop={() => processCommand('stop')}
						/>
					</div>

					{/* Top Right: Profile */}
					<div className='min-h-0'>
						<ProfilePanel
							profile={appState.active_profile}
							profiles={appState.profiles}
							onProfileSwitch={handleProfileSwitch}
							onCreateProfile={openCreateProfile}
							onEditProfile={openEditProfile}
						/>
					</div>

					{/* Bottom Left: Stats */}
					<div className='min-h-0'>
						<StatsPanel
							stats={appState.stats}
							systemStats={appState.system_stats}
							appStats={appState.app_stats}
							devMode={appState.dev_mode}
							timerStatus={appState.timer.status}
							activeProfileName={appState.active_profile.name}
						/>
					</div>

					{/* Bottom Right: Ambience */}
					<div className='min-h-0'>
						<AmbientPanel
							season={appState.active_profile.season}
							motionIntensity={
								appState.active_profile.motion_intensity
							}
							backgroundType={appState.active_profile.background_type}
							glowColor={appState.active_profile.glow_color}
							isRunning={appState.timer.status === 'running'}
							isEnabled={appState.ambience_enabled}
							theme={appState.theme}
						/>
					</div>
				</div>
			</main>

			{/* Terminal Modal */}
			<TerminalModal
				key={terminalKey}
				isOpen={terminalOpen}
				onClose={() => setTerminalOpen(false)}
				onCommand={processCommand}
				onHelp={() => {
					setHelpOpen(true);
				}}
				sessionSummary={sessionSummary}
				onSummaryRead={() => setSessionSummary(null)}
			/>

			<SettingsPanel
				isOpen={settingsOpen}
				onClose={() => setSettingsOpen(false)}
				devMode={appState.dev_mode}
				onDevModeToggle={handleDevModeToggle}
				ambienceEnabled={appState.ambience_enabled}
				onAmbienceToggle={handleAmbienceToggle}
				soundVolume={appState.sound_state.volume}
				onVolumeChange={handleVolumeChange}
				isMuted={appState.sound_state.is_muted}
				onMuteToggle={handleMuteToggle}
				isPlaying={appState.sound_state.is_playing}
				onSoundPlay={handleSoundPlay}
				onSoundStop={handleSoundStop}
				backgroundType={appState.active_profile.background_type}
				onBackgroundTypeChange={handleBackgroundTypeChange}
				onResetSettings={handleResetSettings}
				theme={appState.theme}
				onThemeChange={handleThemeChange}
			/>

			<HelpModal
				isOpen={helpOpen}
				onClose={() => setHelpOpen(false)}
			/>

			<ProfileModal
				isOpen={profileModalOpen}
				onClose={() => setProfileModalOpen(false)}
				mode={profileModalMode}
				profile={
					profileModalMode === 'edit'
						? {
								id: appState.active_profile.id,
								name: appState.active_profile.name,
								focus_duration:
									appState.active_profile.focus_duration,
								short_break_duration:
									appState.active_profile.short_break_duration,
								long_break_duration:
									appState.active_profile.long_break_duration,
								season: appState.active_profile.season,
								motion_intensity:
									appState.active_profile.motion_intensity,
								sound_file: appState.active_profile.sound_file
							}
						: undefined
				}
				onSubmit={handleCreateProfile}
			/>
		</div>
	);
}

export default App;
