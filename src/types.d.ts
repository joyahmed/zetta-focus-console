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

/**Ambient Panel */
interface AmbientPanelProps {
	season: 'spring' | 'summer' | 'autumn' | 'winter';
	motionIntensity: 'low' | 'medium' | 'high';
	backgroundType: 'gradient' | 'particles' | 'custom';
	glowColor: string;
	isRunning: boolean;
	isEnabled: boolean;
	theme?: string;
}

interface Particle {
	id: number;
	x: number;
	size: number;
	delay: number;
	duration: number;
	opacity: number;
}

interface Leaf extends Particle {
	rotation: number;
	rotationDuration: number;
}
