import { RefreshIcon } from './timer-panel/icons';
import Drawer from './Drawer';
import SettingGroup from './settings-panel/SettingGroup';
import SettingRow from './settings-panel/SettingRow';
import SettingsFooter from './settings-panel/SettingsFooter';
import Toggle from './settings-panel/Toggle';
import VolumeSlider from './settings-panel/VolumeSlider';
import { BellIcon, PlayIcon, StopIcon } from './settings-panel/icons';
import {
	STARTUP_SETTINGS,
	useStartupSettings
} from '../hooks/use-startup-settings';

/**
 * The settings drawer.
 *
 * This was eight section files, one per group, and between them they wrote the
 * same titled-heading-plus-rows structure eight times in three different
 * styling idioms — `zetta-*` tokens in one, inline `var(--bg-primary)` in the
 * next, a `glass-panel` with a hand-set border in the third. Two of those were
 * simply wrong: `--bg-primary` is the page colour, so rows painted with it were
 * the one-sheet-of-white problem the light theme was rebuilt to fix.
 *
 * The drawer is a list now. Each group is a title and a run of rows, each row
 * is a title, a description and a control, and `SettingRow` is the only thing
 * that knows what a row looks like. Adding a setting is adding an entry.
 */
const SettingsPanel = ({
	isOpen,
	onClose,
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
	strictModeActive,
	onStrictModeToggle,
	alarmEnabled,
	onAlarmToggle
}: SettingsPanelProps) => {
	const { values: startup, loading: startupLoading, toggle } =
		useStartupSettings();

	const groups: SettingGroupSpec[] = [
		{
			title: 'Visual',
			rows: [
				{
					key: 'ambience',
					title: 'Ambient Animations',
					description: 'Seasonal visual effects',
					control: (
						<Toggle
							enabled={ambienceEnabled}
							onChange={onAmbienceToggle}
						/>
					)
				}
			]
		},
		{
			title: 'Sound',
			rows: [
				{
					key: 'volume',
					title: 'Volume',
					control: (
						<span className='text-xs text-zetta-text-muted'>
							{soundVolume}%
						</span>
					),
					below: (
						<VolumeSlider
							volume={soundVolume}
							onVolumeChange={onVolumeChange}
						/>
					)
				},
				{
					key: 'mute',
					title: 'Mute',
					description: 'Silence ambient sound',
					control: <Toggle enabled={isMuted} onChange={onMuteToggle} />
				},
				{
					key: 'ambient-playback',
					title: playAmbientSound
						? 'Stop Ambient Sound'
						: 'Play Ambient Sound',
					description: playAmbientSound
						? 'Playing while the timer runs'
						: 'Plays while the timer runs',
					icon: playAmbientSound ? <StopIcon /> : <PlayIcon />,
					onClick: playAmbientSound ? onSoundStop : onSoundPlay,
					danger: playAmbientSound
				}
			]
		},
		{
			title: 'Session Alarms',
			rows: [
				{
					key: 'alarm',
					title: 'Alarm Tones',
					description:
						'A different tone for session end, break end and the end of the cycle',
					icon: <BellIcon />,
					control: (
						<Toggle
							enabled={alarmEnabled || false}
							onChange={onAlarmToggle || (() => {})}
						/>
					)
				}
			]
		},
		{
			title: 'Discipline',
			rows: [
				{
					key: 'strict',
					title: 'Strict Mode',
					description: 'Prevent early stop/pause during sessions',
					control: (
						<Toggle
							enabled={strictModeActive || false}
							onChange={onStrictModeToggle || (() => {})}
						/>
					)
				}
			]
		},
		{
			title: 'Startup',
			// The two startup preferences live behind Tauri commands rather
			// than in engine state, so they arrive a moment after the drawer
			// opens. Rendering the rows with a dead switch in the meantime
			// would invite a click that goes nowhere.
			loading: startupLoading,
			rows: STARTUP_SETTINGS.map(setting => ({
				key: setting.key,
				title: setting.title,
				description: setting.description,
				control: (
					<Toggle
						enabled={startup[setting.key]}
						onChange={() => toggle(setting)}
					/>
				)
			}))
		},
		{
			title: 'Data',
			rows: [
				{
					key: 'reset',
					title: 'Reset Settings',
					description: 'Restore default configuration',
					onClick: onResetSettings,
					danger: true,
					control: (
						<RefreshIcon className='w-5 h-5 text-zetta-text-muted group-hover:text-zetta-danger transition-colors' />
					)
				}
			]
		}
	];

	return (
		<Drawer {...{ isOpen, onClose, title: 'Settings' }}>
			<div className='p-3 sm:p-4 space-y-4'>
				{groups.map(group => (
					<SettingGroup key={group.title} title={group.title}>
						{group.loading
							? group.rows.map(row => (
									<div
										key={row.key}
										className='h-16 rounded-lg bg-zetta-panel animate-pulse'
									/>
								))
							: group.rows.map(({ key, ...row }) => (
									<SettingRow key={key} {...row} />
								))}
					</SettingGroup>
				))}

				<SettingsFooter />
			</div>
		</Drawer>
	);
};

export default SettingsPanel;
