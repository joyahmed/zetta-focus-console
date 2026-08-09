import Drawer from './Drawer';
import AmbientSection from './settings-panel/AmbientSection';
import SoundSection from './settings-panel/SoundSection';
import DevModeSection from './settings-panel/DevModeSection';
import StrictModeSection from './settings-panel/StrictModeSection';
import ResetSection from './settings-panel/ResetSection';
import SettingsFooter from './settings-panel/SettingsFooter';
import AlarmSection from './settings-panel/AlarmSection';
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
	onResetSettings,
	theme,
	strictModeActive,
	onStrictModeToggle,
	alarmEnabled,
	onAlarmToggle
}: SettingsPanelProps) => {
	const isLight = theme === 'light';

	return (
		<Drawer {...{ isOpen, onClose, title: 'Settings' }}>
			<div className='p-3 sm:p-4 space-y-4'>
				<AmbientSection
					{...{ ambienceEnabled, onAmbienceToggle, isLight }}
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

				<AlarmSection
					{...{
						alarmEnabled: alarmEnabled || false,
						onAlarmToggle: onAlarmToggle || (() => {}),
						isLight
					}}
				/>


				<DevModeSection {...{ devMode, onDevModeToggle, isLight }} />

				<StrictModeSection
					{...{
						strictModeActive: strictModeActive || false,
						onStrictModeToggle: onStrictModeToggle || (() => {}),
						isLight
					}}
				/>

				<ResetSection {...{ onResetSettings }} />

				<StartupSection {...{ isLight }} />

				<SettingsFooter />
			</div>
		</Drawer>
	);
};

export default SettingsPanel;
