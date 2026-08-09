import ProfilePanel from '../ProfilePanel';
import StatsPanel from '../stats-panel/StatsPanel';
import AmbientPanel from '../AmbientPanel';
import TimerPanel from '../TimerPanel';

const AppPanels = ({
	appState,
	processCommand,
	handleProfileSwitch,
	openCreateProfile,
	openEditProfile,
	openDuplicateProfile,
	profileError,
	setProfileError
}: AppPanelProps) => {
	const { active_profile: profile } = appState;

	const timerProps: TimerPanelProps = {
		timer: appState.timer,
		glowColor: profile.glow_color,
		sessionOverride: appState.session_override,
		strictMode: appState.strict_mode,
		currentTask: appState.current_task,
		onStart: () => processCommand('start'),
		onPause: () => processCommand('focus pause'),
		onResume: () => processCommand('focus resume'),
		onStop: () => processCommand('stop'),
		onQuickStart: async minutes => {
			await processCommand(`timer ${minutes}m`);
			await processCommand('start');
		},
		onDurationChange: (duration: string) => {
			processCommand(`timer ${duration}`);
		},
		theme: appState.theme
	};

	const profileProps: ProfilePanelProps = {
		profile,
		profiles: appState.profiles,
		onProfileSwitch: handleProfileSwitch,
		onCreateProfile: openCreateProfile,
		onEditProfile: openEditProfile,
		onDuplicateProfile: openDuplicateProfile,
		errorMessage: profileError,
		onErrorDismiss: () => setProfileError(null),
		stats: appState.stats
	};

	const ambientProps: AmbientPanelProps = {
		season: profile.season,
		motionIntensity: profile.motion_intensity,
		backgroundType: profile.background_type,
		glowColor: profile.glow_color,
		timer: appState.timer,
		isEnabled: appState.ambience_enabled,
		theme: appState.theme
	};

	return (
		<main className='flex-1 p-4 overflow-auto'>
			<div
				className='grid grid-cols-2 gap-4 h-full w-full'
				style={{ gridTemplateRows: '1fr 1fr' }}
			>
				{/* Top Left: Timer */}
				<div className='min-h-0'>
					<TimerPanel {...timerProps} />
				</div>

				{/* Top Right: Profile */}
				<div className='min-h-0'>
					<ProfilePanel {...profileProps} />
				</div>

				{/* Bottom Left: Stats */}
				<div className='min-h-0'>
					<StatsPanel {...{ appState }} />
				</div>

				{/* Bottom Right: Ambience */}
				<div className='min-h-0'>
					<AmbientPanel {...ambientProps} />
				</div>
			</div>
		</main>
	);
};

export default AppPanels;
