/**
 * Every type in the app.
 *
 * This is an ambient declaration file, so nothing here is imported — the names
 * are simply in scope everywhere. React's own types are reached through the
 * `React.` namespace, which @types/react exposes globally; the bare
 * `SetStateAction` this file used to write resolved to nothing at all, and only
 * went unnoticed because `skipLibCheck` was on and declaration files were never
 * checked. It is off now.
 *
 * Organised by area, and each name is declared exactly once. Interfaces merge
 * silently when they are not, which is how `Profile` came to be declared three
 * times with three different ideas of what `season` is.
 */

/* ==========================================================================
   Shared
   ========================================================================== */

interface IconProps {
	className?: string;
}

interface StrokeIconProps extends IconProps {
	children: React.ReactNode;
}

interface SelectOption {
	value: string;
	label: string;
}

/* ==========================================================================
   Engine state — mirrors src-tauri/src/types.rs
   ========================================================================== */

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

/** The Rust enums behind season, motion_intensity and background_type all
    serialise lowercase, so they arrive as these exact strings. */
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
	alarm_enabled: boolean;
	app_start_time: number;
	last_session_date: string;
}

interface StateEvent {
	state: AppState;
}

/* ==========================================================================
   App shell
   ========================================================================== */

interface AppPanelProps {
	appState: AppState;
	processCommand: (command: string) => Promise<string>;
	handleProfileSwitch: (profileId: string) => Promise<void>;
	openCreateProfile: () => void;
	openEditProfile: () => void;
	openDuplicateProfile: () => void;
	profileError: string | null;
	setProfileError: (value: React.SetStateAction<string | null>) => void;
}

interface AppModalsProps {
	appState: AppState;
	terminalKey: number;
	terminalOpen: boolean;
	setTerminalOpen: (value: React.SetStateAction<boolean>) => void;
	processCommand: (command: string) => Promise<string>;
	setHelpOpen: (value: React.SetStateAction<boolean>) => void;
	sessionSummary: string | null;
	setSessionSummary: (value: React.SetStateAction<string | null>) => void;
	settingsOpen: boolean;
	setSettingsOpen: (value: React.SetStateAction<boolean>) => void;
	handleDevModeToggle: () => Promise<void>;
	handleVolumeChange: (volume: number) => Promise<void>;
	handleMuteToggle: () => Promise<void>;
	handleAmbienceToggle: () => Promise<void>;
	handleSoundPlay: () => Promise<void>;
	handleSoundStop: () => Promise<void>;
	handleResetSettings: () => Promise<void>;
	helpOpen: boolean;

	profileModalOpen: boolean;
	setProfileModalOpen: (value: React.SetStateAction<boolean>) => void;
	profileModalMode: ProfileModalMode;
	handleCreateProfile: (profileData: ProfileFormData) => Promise<string>;
	setProfileError: (value: React.SetStateAction<string | null>) => void;
	alarmEnabled?: boolean;
	onAlarmToggle?: () => void;
}

/* ==========================================================================
   Shells — Modal and Drawer
   ========================================================================== */

type ModalSize = 'sm' | 'form' | 'md' | 'lg';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	/** Omit to supply the whole header yourself as the first child. */
	title?: React.ReactNode;
	size?: ModalSize;
	/** Fills the available height rather than hugging its content. */
	fillHeight?: boolean;
	/** For the one dialog that needs an opaque panel in light mode. */
	panelClassName?: string;
	children: React.ReactNode;
}

interface DrawerProps {
	isOpen: boolean;
	onClose: () => void;
	title: React.ReactNode;
	children: React.ReactNode;
}

/* ==========================================================================
   Header
   ========================================================================== */

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

interface LogoBrandProps {
	devMode?: boolean;
}

interface ProfilePillProps {
	activeProfileName: string;
}

interface CommandSpotlightProps {
	onClick: () => void;
}

interface SettingsButtonProps {
	onClick: () => void;
}

interface ThemeToggleProps {
	theme: string;
	onThemeChange: (theme: string) => void;
}

interface VolumeControlProps {
	volume: number;
	isMuted: boolean;
	onVolumeChange: (volume: number) => void;
	onMuteToggle: () => void;
}

interface Shortcut {
	key: string;
	description: string;
	/** Works even when the app is not focused. */
	global?: boolean;
}

interface ShortcutGroup {
	title: string;
	shortcuts: Shortcut[];
}

/* ==========================================================================
   Ambient panel
   ========================================================================== */

interface AmbientPanelProps {
	season: 'spring' | 'summer' | 'autumn' | 'winter';
	motionIntensity: 'low' | 'medium' | 'high';
	timer: TimerState;
	isEnabled: boolean;
	theme?: string;
}

/**
 * One drifting instance of the profile's icon.
 *
 * Snow, blossom, embers and leaves were four interfaces and four generators
 * that differed in a handful of constants. This is all of them.
 */
interface AmbientParticle {
	id: number;
	/** Percent across the panel. */
	x: number;
	/** Font size in px — these are glyphs, not shapes. */
	size: number;
	delay: number;
	duration: number;
	/** Peak opacity, read by the keyframes as --particle-opacity. */
	opacity: number;
	/** Sideways wander at the halfway point, in px; may be negative. */
	drift: number;
	/** Degrees of turn over the whole journey. */
	spin: number;
}

/** What every scene and particle animates against. */
interface SceneProps {
	glowColor: string;
	isPaused: boolean;
	isLight: boolean;
	speedMultiplier: number;
}

interface SeasonSceneProps extends Omit<SceneProps, 'glowColor'> {
	season: Profile['season'];
	particles: AmbientParticle[];
}

interface SeasonParticleProps extends Omit<SceneProps, 'glowColor'> {
	/** The profile's own icon, one glyph. */
	icon: string;
	particle: AmbientParticle;
	/** Summer's heat rises; everything else falls. */
	rises: boolean;
}

interface SeasonIndicatorProps {
	season: AmbientPanelProps['season'];
	motionIntensity: AmbientPanelProps['motionIntensity'];
	isLight: boolean;
}

/* ==========================================================================
   Timer panel
   ========================================================================== */

type TimerStatus = TimerState['status'];

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
	/** Set a duration override and start, in one press. */
	onQuickStart?: (minutes: number) => void;
	/** Set the focus duration from the clock itself, idle only. */
	onDurationChange?: (duration: string) => void;
	theme?: string;
}

interface TimerBackgroundProps {
	isRunning: boolean;
	glowColor: string;
}

interface TimerDisplayProps {
	formattedTime: string;
	isRunning: boolean;
	glowColor: string;
	/** Only while the timer is idle — the engine refuses an override on a
	    running session. */
	canEdit?: boolean;
	onDurationChange?: (duration: string) => void;
}

interface TimerControlsProps {
	status: TimerStatus;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
	isStrictModeBlocking?: boolean;
}

interface ControlButtonProps {
	onClick: () => void;
	title: string;
	variant: 'primary' | 'secondary' | 'danger';
	children: React.ReactNode;
	disabled?: boolean;
}

interface CircleProps {
	radius: number;
	stroke: string;
	strokeWidth?: number;
	strokeDasharray?: number;
	strokeDashoffset?: number;
	strokeLinecap?: 'round' | 'butt' | 'square';
	className?: string;
	style?: React.CSSProperties;
	gradientId?: string;
}

interface TimerRingProps {
	radius: number;
	circumference: number;
	strokeDashoffset: number;
	isRunning: boolean;
	glowColor: string;
	isStrictMode?: boolean;
}

/* ==========================================================================
   Stats panel
   ========================================================================== */

interface StatsPanelProps {
	/** The whole engine state — this panel is a state inspector, and threading
	    a dozen individual props through for it was noise. */
	appState: AppState;
}

/** One of the four headline cards. `read` picks the field so the card is pure
    data — nothing about it is written twice. */
interface StatCard {
	label: string;
	unit: string;
	/** Tailwind text colour for the watermark icon. */
	tone: string;
	Icon: (props: IconProps) => React.JSX.Element;
	read: (stats: Stats) => number;
}

/** A row of the engine diagnostics list. */
interface DiagnosticField {
	label: string;
	value: string;
	accent?: 'good' | 'warn';
}

/* ==========================================================================
   Profile panel
   ========================================================================== */

interface ProfilePanelProps {
	profile: Profile;
	profiles: Profile[];
	onProfileSwitch: (profileId: string) => void;
	onCreateProfile?: () => void;
	onEditProfile?: () => void;
	onDuplicateProfile?: () => void;
	/** Editing is closed while a session runs — see ProfilePanel. */
	isSessionRunning?: boolean;
	errorMessage?: string | null;
	onErrorDismiss?: () => void;
	stats?: Stats;
}

interface DetailRowProps {
	label: string;
	value: string;
	capitalize?: boolean;
}

/** One of the panel's footer buttons. The Tailwind classes are held whole
    rather than composed from a colour name, because the JIT scanner only sees
    class names it can read literally in the source. */
interface ProfileAction {
	key: 'create' | 'edit' | 'duplicate';
	label: string;
	Icon: (props: IconProps) => React.JSX.Element;
	/** Border and background, including hover. */
	frame: string;
	/** Gradient origin for the wash that rises on hover. */
	wash: string;
	text: string;
}

/* ==========================================================================
   Profile modal
   ========================================================================== */

/** What the modal submits. Minutes, not seconds — the engine converts. */
interface ProfileFormData {
	/** Only for edit mode. */
	id?: string | undefined;
	name: string;
	focus_min: number;
	short_break_min: number;
	long_break_min: number;
	sessions_per_cycle: number;
	season: string;
	intensity: string;
	sound: string;
}

interface ProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	mode: ProfileModalMode;
	/** Required for edit mode. */
	profile?: Profile | undefined;
	onSubmit: (profileData: ProfileFormData) => Promise<string>;
}

interface LabelledSelectProps {
	label: string;
	value: string;
	options: SelectOption[];
	onChange: (value: string) => void;
}

interface NumberInputProps {
	value: number;
	onChange: (value: number) => void;
	min: number;
	max: number;
	label: string;
	/** Rendered after the label, e.g. "Focus (min)". */
	unit?: string;
	step?: number;
	precision?: number;
}

/**
 * Create, edit, or duplicate.
 *
 * Duplicate exists because the engine holds presets read-only —
 * `can_edit_profile` refuses them — so the only way to base a profile on
 * Winter Deep is to copy it into a custom one. It is the create path with the
 * fields seeded and no id.
 */
type ProfileModalMode = 'create' | 'edit' | 'duplicate';

interface ProfileModalCopy {
	title: string;
	submitLabel: string;
	submittingLabel: string;
	/** Tailwind classes for the submit button, spelled out for the JIT scan. */
	accent: string;
}

/* ==========================================================================
   Settings panel
   ========================================================================== */

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
	onResetSettings: () => void;
	theme: string;
	strictModeActive?: boolean;
	onStrictModeToggle?: () => void;
	alarmEnabled?: boolean;
	onAlarmToggle?: () => void;
}

interface SectionHeaderProps {
	title: string;
}

interface ToggleProps {
	enabled: boolean;
	onChange: () => void;
	disabled?: boolean;
	isLight: boolean;
}

interface AmbientSectionProps {
	ambienceEnabled: boolean;
	onAmbienceToggle: () => void;
	isLight: boolean;
}

interface DevModeSectionProps {
	devMode: boolean;
	onDevModeToggle: () => void;
	isLight: boolean;
}

interface ResetSectionProps {
	onResetSettings: () => void;
}

interface SoundSectionProps {
	soundVolume: number;
	onVolumeChange: (volume: number) => void;
	isMuted: boolean;
	onMuteToggle: () => void;
	playAmbientSound: boolean;
	onSoundPlay: () => void;
	onSoundStop: () => void;
	isLight: boolean;
}

interface StartupSectionProps {
	isLight: boolean;
}

/** A startup preference and the two Tauri commands that read and write it. */
interface StartupSetting {
	key: keyof StartupSettingValues;
	title: string;
	description: string;
	getCommand: string;
	setCommand: string;
}

interface StartupSettingValues {
	autostart: boolean;
	startMinimized: boolean;
}

interface StrictModeSectionProps {
	strictModeActive: boolean;
	onStrictModeToggle: () => void;
	isLight: boolean;
}

interface AlarmSectionProps {
	alarmEnabled: boolean;
	onAlarmToggle: () => void;
	isLight: boolean;
}

/* ==========================================================================
   Terminal and help modals
   ========================================================================== */

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

/* ==========================================================================
   Hooks
   ========================================================================== */

interface CommonStatesProps {
	appState: AppState | null;
}

interface AppReactivitiesProps extends CommonStatesProps {
	setTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
	settingsOpen: boolean;
	setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	setAppState: React.Dispatch<React.SetStateAction<AppState | null>>;
	setSessionSummary: React.Dispatch<React.SetStateAction<string | null>>;
}

interface AppUtilsProps extends CommonStatesProps {
	setTerminalKey: React.Dispatch<React.SetStateAction<number>>;
	setProfileError: React.Dispatch<React.SetStateAction<string | null>>;
	setProfileModalMode: React.Dispatch<React.SetStateAction<ProfileModalMode>>;
	setProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UseAmbientPanelProps {
	season: AmbientPanelProps['season'];
	motionIntensity: AmbientPanelProps['motionIntensity'];
	isRunning: boolean;
}

interface UseTimerPanelProps {
	timer: TimerState;
	sessionOverride: SessionOverride | null | undefined;
	glowColor: string;
	strictMode: StrictModeState | null | undefined;
}

interface UseProfileModalProps {
	isOpen: boolean;
	mode: ProfileModalMode;
	profile?: Profile | undefined;
	onClose: () => void;
	onSubmit: (profileData: ProfileFormData) => Promise<string>;
}

interface UseModalDismissProps {
	isOpen: boolean;
	onClose: () => void;
}

interface UseEditableDurationProps {
	/** What the clock currently reads, used to seed the field. */
	value: string;
	canEdit: boolean;
	/** Receives a duration the engine accepts, e.g. "1500s". */
	onCommit: (duration: string) => void;
}

interface UseHelpModalProps {
	isOpen: boolean;
}

interface UseTerminalModalProps {
	isOpen: boolean;
	onCommand: (command: string) => Promise<string>;
	onHelp: () => void;
	sessionSummary?: string | null;
	onSummaryRead?: () => void;
	isLight: boolean;
}

