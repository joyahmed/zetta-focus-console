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
	profileError,
	setProfileError,
}: AppPanelProps) => {
	return (
		<main className='flex-1 p-4 overflow-auto'>
			<div
				className='grid grid-cols-2 gap-4 h-full w-full'
				style={{ gridTemplateRows: '1fr 1fr' }}
			>
				{/* Top Left: Timer */}
				<div className='min-h-0'>
					<TimerPanel
						timer={appState.timer}
						glowColor={appState.active_profile.glow_color}
						sessionOverride={appState.session_override}
						strictMode={appState.strict_mode}
						currentTask={appState.current_task}
						onStart={() => processCommand('start')}
						onPause={() => processCommand('focus pause')}
						onResume={() => processCommand('focus resume')}
						onStop={() => processCommand('stop')}
						onQuickStart={async minutes => {
							await processCommand(`timer ${minutes}m`);
							await processCommand('start');
						}}
						theme={appState.theme}
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
						errorMessage={profileError}
						onErrorDismiss={() => setProfileError(null)}
						stats={appState.stats}
					/>
				</div>

				{/* Bottom Left: Stats */}
				<div className='min-h-0'>
					<StatsPanel appState={appState} />
				</div>

				{/* Bottom Right: Ambience */}
				<div className='min-h-0'>
					<AmbientPanel
						season={appState.active_profile.season}
						motionIntensity={appState.active_profile.motion_intensity}
						backgroundType={appState.active_profile.background_type}
						glowColor={appState.active_profile.glow_color}
						timer={appState.timer}
						isEnabled={appState.ambience_enabled}
						theme={appState.theme}
					/>
				</div>
			</div>
		</main>
	);
};

export default AppPanels;
