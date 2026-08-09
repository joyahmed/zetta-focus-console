interface AppPanelProps {
	appState: AppState;
	processCommand: (command: string) => Promise<string>;
	handleProfileSwitch: (profileId: string) => Promise<void>;
	openCreateProfile: () => void;
	openEditProfile: () => void;
	profileError: string | null;
	setProfileError: (value: SetStateAction<string | null>) => void;
}

interface AppModelsProps {
	appState: AppState;
	terminalKey: number;
	terminalOpen: boolean;
	setTerminalOpen: (value: SetStateAction<boolean>) => void;
	processCommand: (command: string) => Promise<string>;
	setHelpOpen: (value: SetStateAction<boolean>) => void;
	sessionSummary: string | null;
	setSessionSummary: (value: SetStateAction<string | null>) => void;
	settingsOpen: boolean;
	setSettingsOpen: (value: SetStateAction<boolean>) => void;
	handleDevModeToggle: () => Promise<void>;
	handleVolumeChange: (volume: number) => Promise<void>;
	handleMuteToggle: () => Promise<void>;
	handleAmbienceToggle: () => Promise<void>;
	handleMuteToggle: () => Promise<void>;
	handleSoundPlay: () => Promise<void>;
	handleSoundStop: () => Promise<void>;
	handleBackgroundTypeChange: (
		type: 'gradient' | 'particles'
	) => Promise<void>;
	handleResetSettings: () => Promise<void>;
	handleThemeChange: (theme: string) => Promise<void>;
	helpOpen: boolean;

	profileModalOpen: boolean;
	setProfileModalOpen: (value: SetStateAction<boolean>) => void;
	profileModalMode: 'create' | 'edit';
	handleCreateProfile: (profileData: {
		id?: string | undefined;
		name: string;
		focus_min: number;
		short_break_min: number;
		long_break_min: number;
		sessions_per_cycle: number;
		season: string;
		intensity: string;
		sound: string;
	}) => Promise<string>;
	setProfileError: (value: SetStateAction<string | null>) => void;
	voiceEnabled?: boolean;
	onVoiceToggle?: () => void;
}

interface TimerState {
	remaining_seconds: number;
	total_seconds: number;
	status: 'idle' | 'running' | 'paused' | 'completed';
	session_type: 'focus' | 'short_break' | 'long_break';
	/** Current session number in the cycle (1-indexed) */
	current_session: number;
	/** Total number of sessions in the cycle */
	total_sessions: number;
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
	/** Number of focus sessions per cycle */
	sessions_per_cycle: number;
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

interface SoundState {
	current_sound: string | null;
	play_ambient_sound: boolean;
	volume: number;
	is_playing: boolean;
	is_muted: boolean;
}

interface SessionOverride {
	focus_duration: number | null;
	break_duration: number | null;
	loop_count: number | null;
}

interface StrictModeState {
	is_active: boolean;
	session_start_timestamp: number | null;
	was_force_closed: boolean;
}

interface CurrentTask {
	category: 'coding' | 'other';
	title: string;
}

interface AppState {
	timer: TimerState;
	active_profile: Profile;
	profiles: Profile[];
	stats: Stats;
	dev_mode: boolean;
	sound_state: SoundState;
	session_override: SessionOverride | null;
	ambience_enabled: boolean;
	theme: string;
	strict_mode: StrictModeState;
	current_task: CurrentTask;
	voice_enabled: boolean;
	app_start_time: number;
	last_session_date: string;
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
	timer: TimerState;
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

interface HeaderProps {
	activeProfileName: string;
	devMode: boolean;
	onSettingsClick: () => void;
	onTerminalClick: () => void;
	volume: number;
	isMuted: boolean;
	onVolumeChange: (volume: number) => void;
	onMuteToggle: () => void;
	theme: string;
	onThemeChange: (theme: string) => void;
}

interface HelpModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface CommandGroup {
	title: string;
	commands: {
		cmd: string;
		description: string;
	}[];
}

/** Profile  */
interface Profile {
	id: string;
	name: string;
	focus_duration: number;
	short_break_duration: number;
	long_break_duration: number;
	season: string;
	motion_intensity: string;
	sound_file: string;
}

interface ProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	mode: 'create' | 'edit';
	profile?: Profile | undefined; // Required for edit mode
	onSubmit: (profileData: {
		id?: string; // Only for edit mode
		name: string;
		focus_min: number;
		short_break_min: number;
		long_break_min: number;
		sessions_per_cycle: number;
		season: string;
		intensity: string;
		sound: string;
	}) => Promise<string>;
}

/** Profile Panel */

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
	is_preset: boolean;
}

interface ProfilePanelProps {
	profile: Profile;
	profiles: Profile[];
	onProfileSwitch: (profileId: string) => void;
	onCreateProfile?: () => void;
	onEditProfile?: () => void;
	errorMessage?: string | null;
	onErrorDismiss?: () => void;
	stats?: Stats;
}

/** Settings Panel */
interface SettingsPanelProps {
	isOpen: boolean;
	onClose: () => void;
	devMode: boolean;
	onDevModeToggle: () => void;
	ambienceEnabled: boolean;
	onAmbienceToggle: () => void;
	soundVolume: number;
	onVolumeChange: (volume: number) => void;
	isMuted: boolean;
	onMuteToggle: () => void;
	playAmbientSound: boolean;
	onSoundPlay: () => void;
	onSoundStop: () => void;
	backgroundType: 'gradient' | 'particles' | 'custom';
	onBackgroundTypeChange: (type: 'gradient' | 'particles') => void;
	onResetSettings: () => void;
	theme: string;
	onThemeChange: (theme: string) => void;
	strictModeActive?: boolean;
	onStrictModeToggle?: () => void;
	voiceEnabled?: boolean;
	onVoiceToggle?: () => void;
}

/** Sound Control */
interface SoundControlProps {
	isPlaying: boolean;
	isMuted: boolean;
	volume: number;
	currentSound: string | null;
}

/** StatsPanelProps  */
interface Stats {
	sessions_today: number;
	total_focus_minutes: number;
	current_streak: number;
	last_session_duration: number;
}

interface StatsPanelProps {
	/** The whole engine state — this panel is a state inspector, and threading
	    a dozen individual props through for it was noise. */
	appState: AppState;
}

/**Terminal Modal  */

interface TerminalLine {
	type: 'input' | 'output' | 'error' | 'success';
	content: string;
}

interface TerminalModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCommand: (command: string) => Promise<string>;
	onHelp: () => void;
	sessionSummary?: string | null;
	onSummaryRead?: () => void;
	theme: string;
}

/** Timer Panel */

interface TimerState {
	remaining_seconds: number;
	total_seconds: number;
	status: 'idle' | 'running' | 'paused' | 'completed';
	session_type: 'focus' | 'short_break' | 'long_break';
	/** Current session number in the cycle (1-indexed) */
	current_session: number;
	/** Total number of sessions in the cycle */
	total_sessions: number;
}

interface SessionOverride {
	focus_duration: number | null;
	break_duration: number | null;
	loop_count: number | null;
}

interface TimerPanelProps {
	timer: TimerState;
	glowColor: string;
	sessionOverride?: SessionOverride | null;
	strictMode?: StrictModeState | null;
	currentTask?: CurrentTask | null;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
	theme?: string;
}
