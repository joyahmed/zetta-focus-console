import { lazy } from 'react';
const ProfilePanel = lazy(() => import('../ProfilePanel'));
const StatsPanel = lazy(() => import('../stats-panel/StatsPanel'));
const AmbientPanel = lazy(() => import('../AmbientPanel'));
const TimerPanel = lazy(() => import('../TimerPanel'));

const AppPanels = ({
	appState,
	processCommand,
	handleProfileSwitch,
	openCreateProfile,
	openEditProfile,
	profileError,
	setProfileError,
	licenseState,
	trialDaysRemaining
}: AppPanelProps) => {
	return (
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
						strictMode={appState.strict_mode}
						currentTask={appState.current_task}
						onStart={() => processCommand('start')}
						onPause={() => processCommand('focus pause')}
						onResume={() => processCommand('focus resume')}
						onStop={() => processCommand('stop')}
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
						licenseType={licenseState?.license_type}
						trialDaysRemaining={trialDaysRemaining}
						stats={appState.stats}
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
						licenseType={licenseState?.license_type}
						trialDaysRemaining={trialDaysRemaining}
					/>
				</div>

				{/* Bottom Right: Ambience */}
				<div className='min-h-0'>
					<AmbientPanel
						season={appState.active_profile.season}
						motionIntensity={appState.active_profile.motion_intensity}
						backgroundType={appState.active_profile.background_type}
						glowColor={appState.active_profile.glow_color}
						isRunning={appState.timer.status === 'running'}
						isEnabled={appState.ambience_enabled}
						theme={appState.theme}
					/>
				</div>
			</div>
		</main>
	);
};

export default AppPanels;
