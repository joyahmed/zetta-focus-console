import LogoBrand from './header/Logo';
import CommandSpotlight from './header/CommandSpotlight';
import ProfilePill from './header/ProfilePill';
import VolumeControl from './header/VolumeControl';
import ThemeToggle from './header/ThemeToggle';
import SettingsButton from './header/SettingsButton';
import ShortcutsMenu from './header/ShortcutsMenu';

const Header = ({
	activeProfileName,
	devMode,
	onSettingsClick,
	onTerminalClick,
	volume,
	isMuted,
	onVolumeChange,
	onMuteToggle,
	theme,
	onThemeChange
}: HeaderProps) => {
	const isLight = theme === 'light';

	return (
		<header className='w-full px-4 pt-6 pb-2 z-40 flex justify-center'>
			<div
				className={`glass-panel flex items-center justify-between w-full rounded-2xl px-4 py-2.5 transition-all duration-300 ${
					isLight
						? 'shadow-sm border-black/5 hover:shadow-md'
						: 'shadow-glass hover:shadow-neon/20 hover:border-white/10'
				}`}
			>
				<LogoBrand {...{ devMode }} />

				<CommandSpotlight onClick={onTerminalClick} />

				<div className='flex items-center justify-end gap-3 w-1/4'>
					<ProfilePill {...{ activeProfileName }} />

					<div className='h-4 w-[1px] bg-zetta-border mx-1' />

					<VolumeControl
							{...{
								volume,
								isMuted,
								onVolumeChange,
								onMuteToggle
							}}
						/>

					<ThemeToggle {...{ theme, onThemeChange }} />
					
					<ShortcutsMenu />

					<SettingsButton onClick={onSettingsClick} />
				</div>
			</div>
		</header>
	);
};

export default Header;
