import { lazy, Suspense } from 'react';
import { useSettingPanel } from '../hooks/use-setting-panel';

const SettingsHeader = lazy(
	() => import('./settings-panel/SettingsHeader')
);
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
const LicenseSection = lazy(
	() => import('./settings-panel/LicenseSection')
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
	isPlaying,
	onSoundPlay,
	onSoundStop,
	backgroundType,
	onBackgroundTypeChange,
	onResetSettings,
	theme,
	onThemeChange,
	onLicenseChange,
	strictModeActive,
	onStrictModeToggle,
	isPro,
	voiceEnabled,
	onVoiceToggle
}: SettingsPanelProps) => {
	const isLight = theme === 'light';

	const {
		currentLicense,
		trialDaysRemaining,
		handleActivateLicense,
		licenseKey,
		setLicenseKey,
		licenseMessage
	} = useSettingPanel(onLicenseChange);

	return (
		<>
			<div
				className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
				onClick={onClose}
			/>
			<div
				className={`fixed top-0 right-0 h-full w-80 max-sm:w-full sm:w-72 md:w-96 z-50 transform transition-transform duration-300 glass-panel border-l border-zetta-border ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
			>
				<Suspense fallback={null}>
					<SettingsHeader onClose={onClose} />
				</Suspense>

				<div className='p-3 sm:p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)]'>
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
								isPlaying,
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
								onStrictModeToggle: onStrictModeToggle || (() => {}),
								isPro: isPro || false,
								isLight
							}}
						/>
					</Suspense>

					<Suspense fallback={null}>
						<ResetSection onResetSettings={onResetSettings} />
					</Suspense>

					<Suspense fallback={null}>
						<LicenseSection
							{...{
								currentLicense,
								trialDaysRemaining,
								licenseKey,
								setLicenseKey,
								licenseMessage,
								handleActivateLicense
							}}
						/>
					</Suspense>

					<Suspense fallback={null}>
						<StartupSection isLight={isLight} />
					</Suspense>

					<Suspense fallback={null}>
						<SettingsFooter />
					</Suspense>
				</div>
			</div>
		</>
	);
};

export default SettingsPanel;
