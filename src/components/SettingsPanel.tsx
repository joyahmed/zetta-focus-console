import { lazy, Suspense } from 'react';
import Drawer from './Drawer';
const AmbientSection = lazy(
	() => import('./settings-panel/AmbientSection')
);
const SoundSection = lazy(
	() => import('./settings-panel/SoundSection')
);
const BackgroundSection = lazy(
	() => import('./settings-panel/BackgroundSection')
);
const ThemeSection = lazy(
	() => import('./settings-panel/ThemeSection')
);
const DevModeSection = lazy(
	() => import('./settings-panel/DevModeSection')
);
const StrictModeSection = lazy(
	() => import('./settings-panel/StrictModeSection')
);
const ResetSection = lazy(
	() => import('./settings-panel/ResetSection')
);
const SettingsFooter = lazy(
	() => import('./settings-panel/SettingsFooter')
);
const VoiceSection = lazy(
	() => import('./settings-panel/VoiceSection')
);
const StartupSection = lazy(
	() => import('./settings-panel/StartupSection')
);

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
	onThemeChange,
	strictModeActive,
	onStrictModeToggle,
	voiceEnabled,
	onVoiceToggle
}: SettingsPanelProps) => {
	const isLight = theme === 'light';

	return (
		<Drawer isOpen={isOpen} onClose={onClose} title='Settings'>
				<div className='p-3 sm:p-4 space-y-4'>
					<Suspense fallback={null}>
						<AmbientSection
							{...{
								ambienceEnabled,
								onAmbienceToggle,
								isLight
							}}
						/>
					</Suspense>

					<Suspense fallback={null}>
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
					</Suspense>

					<Suspense fallback={null}>
						<VoiceSection
							{...{
								voiceEnabled: voiceEnabled || false,
								onVoiceToggle: onVoiceToggle || (() => {}),
								isLight
							}}
						/>
					</Suspense>

					<Suspense fallback={null}>
						<BackgroundSection
							{...{
								backgroundType,
								onBackgroundTypeChange
							}}
						/>
					</Suspense>

					<Suspense fallback={null}>
						<ThemeSection
							{...{
								theme,
								onThemeChange
							}}
						/>
					</Suspense>

					<Suspense fallback={null}>
						<DevModeSection
							{...{
								devMode,
								onDevModeToggle,
								isLight
							}}
						/>
					</Suspense>

					<Suspense fallback={null}>
						<StrictModeSection
							{...{
								strictModeActive: strictModeActive || false,
								onStrictModeToggle: onStrictModeToggle || (() => {}),								isLight
							}}
						/>
					</Suspense>

					<Suspense fallback={null}>
						<ResetSection onResetSettings={onResetSettings} />
					</Suspense>

					<Suspense fallback={null}>
						<StartupSection isLight={isLight} />
					</Suspense>

					<Suspense fallback={null}>
						<SettingsFooter />
					</Suspense>
				</div>
		</Drawer>
	);
};

export default SettingsPanel;
