import HelpModal from '../HelpModal';
import ProfileModal from '../ProfileModal';
import SettingsPanel from '../SettingsPanel';
import TerminalModal from '../TerminalModal';

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
	handleResetSettings,
	helpOpen,
	profileModalOpen,
	setProfileModalOpen,
	profileModalMode,
	handleCreateProfile,
	setProfileError,
	voiceEnabled,
	onVoiceToggle
}: AppModalsProps) => {

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
				playAmbientSound={appState.sound_state.play_ambient_sound}
				onSoundPlay={handleSoundPlay}
				onSoundStop={handleSoundStop}
				onResetSettings={handleResetSettings}
				theme={appState.theme}
				strictModeActive={appState.strict_mode.is_active}
				onStrictModeToggle={() => {
					const cmd = appState.strict_mode.is_active
						? 'strict off'
						: 'strict on';
					processCommand(cmd);
				}}
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
					// Both edit and duplicate seed from the active profile; only
					// create starts blank. This used to copy the profile out
					// field by field into an object identical to its source.
					profileModalMode === 'create'
						? undefined
						: appState.active_profile
				}
				onSubmit={handleCreateProfile}
			/>
		</>
	);
};

export default AppModals;
