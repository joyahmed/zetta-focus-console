import {
	formatClock,
	formatSoundName,
	formatUptime
} from '../utils/format';

const SESSION_LABELS: Record<TimerState['session_type'], string> = {
	focus: 'FOCUS',
	short_break: 'SHORT BREAK',
	long_break: 'LONG BREAK'
};

/**
 * The engine diagnostics list.
 *
 * Twelve rows, each a small decision about how one piece of state should read
 * — which is a dozen conditionals that were sitting in the middle of the panel
 * component, above its markup, in a fifty-line array literal.
 */
export const useStatsPanel = (appState: AppState): DiagnosticField[] => {
	const {
		timer,
		active_profile: profile,
		dev_mode: devMode,
		sound_state: sound,
		session_override: override,
		strict_mode: strict,
		current_task: task,
		ambience_enabled: ambience,
		alarm_enabled: alarm,
		app_start_time: appStartTime
	} = appState;

	const soundValue = () => {
		if (sound.is_muted) return 'MUTED';
		if (!sound.is_playing) return 'STOPPED';

		const name = formatSoundName(sound.current_sound ?? '') || 'ON';
		return `${name} ${sound.volume}%`;
	};

	return [
		{
			label: 'TIMER STATUS',
			value: (timer.status || 'idle').toUpperCase()
		},
		{
			label: 'SESSION',
			value: `${SESSION_LABELS[timer.session_type] ?? timer.session_type} ${timer.current_session}/${timer.total_sessions}`
		},
		{ label: 'REMAINING', value: formatClock(timer.remaining_seconds) },
		{ label: 'ACTIVE PROFILE', value: profile.name },
		{
			label: 'OVERRIDE',
			value: override ? 'SET' : 'NONE',
			accent: override ? 'warn' : undefined
		},
		{
			label: 'STRICT MODE',
			value: strict.is_active ? 'ENGAGED' : 'OFF',
			accent: strict.is_active ? 'warn' : undefined
		},
		{
			label: 'TASK',
			value: task.title.trim()
				? `${task.title} (${task.category})`
				: 'NONE'
		},
		{
			label: 'AMBIENCE',
			value: `${ambience ? 'ON' : 'OFF'} · ${profile.season.toUpperCase()}`
		},
		{ label: 'SOUND', value: soundValue() },
		{ label: 'ALARM', value: alarm ? 'ON' : 'OFF' },
		{
			label: 'DEV MODE',
			value: devMode ? 'ACTIVE' : 'STANDBY',
			accent: devMode ? 'good' : undefined
		},
		{ label: 'UPTIME', value: formatUptime(appStartTime) }
	];
};
