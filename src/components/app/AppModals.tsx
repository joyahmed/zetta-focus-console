import { lazy } from 'react';
const HelpModal = lazy(() => import('../HelpModal'));
const ProfileModal = lazy(() => import('../ProfileModal'));
const SettingsPanel = lazy(() => import('../SettingsPanel'));
const TerminalModal = lazy(() => import('../TerminalModal'));

const AppModals = ({
	appState,
	terminalKey,
	terminalOpen,
	setTerminalOpen,
	processCommand,
	setHelpOpen,
	sessionSummary,
	setSessionSummary,
	settingsOpen,
	setSettingsOpen,
	handleDevModeToggle,
	handleAmbienceToggle,
	handleVolumeChange,
	handleMuteToggle,
	handleSoundPlay,
	handleSoundStop,
	handleBackgroundTypeChange,
	handleResetSettings,
	handleThemeChange,
	helpOpen,
	profileModalOpen,
	setProfileModalOpen,
	profileModalMode,
	handleCreateProfile,
	refreshLicenseState,
	setProfileError,
	licenseState,
	voiceEnabled,
	onVoiceToggle
}: AppModelsProps) => {
	const isPro = licenseState?.license_type === 'Pro' || licenseState?.license_type === 'Founder' || licenseState?.license_type === 'Trial';

	return (
		<>
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
				theme={appState.theme}
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
				onLicenseChange={refreshLicenseState}
				strictModeActive={appState.strict_mode.is_active}
				onStrictModeToggle={() => {
					const cmd = appState.strict_mode.is_active
						? 'strict off'
						: 'strict on';
					processCommand(cmd);
				}}
				isPro={isPro}
				voiceEnabled={voiceEnabled}
				onVoiceToggle={onVoiceToggle}
			/>

			<HelpModal
				isOpen={helpOpen}
				onClose={() => setHelpOpen(false)}
			/>

			<ProfileModal
				isOpen={profileModalOpen}
				onClose={() => {
					setProfileModalOpen(false);
					setProfileError(null);
				}}
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
								sessions_per_cycle:
									appState.active_profile.sessions_per_cycle,
								season: appState.active_profile.season,
								motion_intensity:
									appState.active_profile.motion_intensity,
								sound_file: appState.active_profile.sound_file,
								background_type:
									appState.active_profile.background_type,
								glow_color: appState.active_profile.glow_color,
								default_volume:
									appState.active_profile.default_volume,
								is_preset: appState.active_profile.is_preset
							}
						: undefined
				}
				onSubmit={handleCreateProfile}
			/>
		</>
	);
};

export default AppModals;
