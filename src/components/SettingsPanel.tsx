import Drawer from './Drawer';
import AmbientSection from './settings-panel/AmbientSection';
import SoundSection from './settings-panel/SoundSection';
import BackgroundSection from './settings-panel/BackgroundSection';
import DevModeSection from './settings-panel/DevModeSection';
import StrictModeSection from './settings-panel/StrictModeSection';
import ResetSection from './settings-panel/ResetSection';
import SettingsFooter from './settings-panel/SettingsFooter';
import VoiceSection from './settings-panel/VoiceSection';
import StartupSection from './settings-panel/StartupSection';

const SettingsPanel = ({
	isOpen,
	onClose,
	devMode,
	onDevModeToggle,
	ambienceEnabled,
	onAmbienceToggle,
	soundVolume,
	onVolumeChange,
	isMuted,
	onMuteToggle,
	playAmbientSound,
	onSoundPlay,
	onSoundStop,
	backgroundType,
	onBackgroundTypeChange,
	onResetSettings,
	theme,
	strictModeActive,
	onStrictModeToggle,
	voiceEnabled,
	onVoiceToggle
}: SettingsPanelProps) => {
	const isLight = theme === 'light';

	return (
		<Drawer isOpen={isOpen} onClose={onClose} title='Settings'>
				<div className='p-3 sm:p-4 space-y-4'>
					<AmbientSection
							{...{
								ambienceEnabled,
								onAmbienceToggle,
								isLight
							}}
						/>

					<SoundSection
							{...{
								soundVolume,
								onVolumeChange,
								isMuted,
								onMuteToggle,
								playAmbientSound,
								onSoundPlay,
								onSoundStop,
								isLight
							}}
						/>

					<VoiceSection
							{...{
								voiceEnabled: voiceEnabled || false,
								onVoiceToggle: onVoiceToggle || (() => {}),
								isLight
							}}
						/>

					<BackgroundSection
							{...{
								backgroundType,
								onBackgroundTypeChange
							}}
						/>

					<DevModeSection
							{...{
								devMode,
								onDevModeToggle,
								isLight
							}}
						/>

					<StrictModeSection
							{...{
								strictModeActive: strictModeActive || false,
								onStrictModeToggle: onStrictModeToggle || (() => {}),								isLight
							}}
						/>

					<ResetSection onResetSettings={onResetSettings} />

					<StartupSection isLight={isLight} />

					<SettingsFooter />
				</div>
		</Drawer>
	);
};

export default SettingsPanel;
