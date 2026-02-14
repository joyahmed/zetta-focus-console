import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useCallback, useEffect, useState } from 'react';
import { AmbientPanel } from './components/AmbientPanel';
import { Header } from './components/Header';
import { ProfilePanel } from './components/ProfilePanel';
import { SettingsPanel } from './components/SettingsPanel';
import { SoundControl } from './components/SoundControl';
import { StatsPanel } from './components/StatsPanel';
import { TerminalPanel } from './components/TerminalPanel';
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
}

interface StateEvent {
	state: AppState;
}

function App() {
	const [appState, setAppState] = useState<AppState | null>(null);
	const [terminalKey, setTerminalKey] = useState(0);
	const [settingsOpen, setSettingsOpen] = useState(false);

	useEffect(() => {
		invoke<AppState>('get_state')
			.then(state => {
				setAppState(state);
			})
			.catch(console.error);

		const unlisten = listen<StateEvent>('state-updated', event => {
			setAppState(event.payload.state);
		});

		return () => {
			unlisten.then(fn => fn());
		};
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

	if (!appState) {
		return (
			<div className='h-screen w-screen bg-zetta-bg flex items-center justify-center'>
				<div className='text-gray-400'>Loading...</div>
			</div>
		);
	}

	return (
		<div className='h-screen w-screen bg-zetta-bg flex flex-col overflow-hidden'>
			<Header
				activeProfileName={appState.active_profile.name}
				devMode={appState.dev_mode}
				onSettingsClick={() => setSettingsOpen(true)}
			/>

			<main className='flex-1 p-3 md:p-6 overflow-auto'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 min-w-0'>
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

					<div className='min-h-0'>
						<ProfilePanel
							profile={appState.active_profile}
							profiles={appState.profiles}
							onProfileSwitch={handleProfileSwitch}
						/>
					</div>

					<div className='min-h-0'>
						<TerminalPanel
							key={terminalKey}
							onCommand={processCommand}
						/>
					</div>

					<div className='min-h-0'>
						<StatsPanel
							stats={appState.stats}
							systemStats={appState.system_stats}
							appStats={appState.app_stats}
						/>
					</div>

					{/* Ambient Panel - Full width at bottom */}
					<div className='min-h-0 md:col-span-2'>
						<AmbientPanel
							season={appState.active_profile.season}
							motionIntensity={
								appState.active_profile.motion_intensity
							}
							glowColor={appState.active_profile.glow_color}
							isRunning={appState.timer.status === 'running'}
							isEnabled={appState.ambience_enabled}
						/>
					</div>
				</div>
			</main>

			{/* Sound Control - Fixed at bottom */}
			<div className='fixed bottom-4 right-4 z-50'>
				<SoundControl
					isPlaying={appState.sound_state.is_playing}
					isMuted={appState.sound_state.is_muted}
					volume={appState.sound_state.volume}
					currentSound={appState.sound_state.current_sound}
				/>
			</div>

			<SettingsPanel
				isOpen={settingsOpen}
				onClose={() => setSettingsOpen(false)}
				devMode={appState.dev_mode}
				onDevModeToggle={handleDevModeToggle}
				ambienceEnabled={appState.ambience_enabled}
				onAmbienceToggle={handleAmbienceToggle}
			/>
		</div>
	);
}

export default App;
