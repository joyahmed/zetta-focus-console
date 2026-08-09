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
}: HeaderProps) => (
	<header className='w-full px-4 pt-6 pb-2 z-40 flex justify-center'>
		{/* The bar used to pick its shadow and its border from the theme by
		    hand — a black/5 border and shadow-sm in the light, a white/10 and
		    shadow-glass in the dark. Both are what `.glass-panel` and the
		    border tokens now say on their own. */}
		<div className='glass-panel flex items-center justify-between w-full rounded-2xl px-4 py-2.5 transition-all duration-300 hover:border-zetta-border hover:shadow-elevated'>
			<LogoBrand {...{ devMode }} />

			<CommandSpotlight onClick={onTerminalClick} />

			<div className='flex items-center justify-end gap-3 w-1/4'>
				<ProfilePill {...{ activeProfileName }} />

				<div className='h-4 w-[1px] bg-zetta-border mx-1' />

				<VolumeControl
					{...{ volume, isMuted, onVolumeChange, onMuteToggle }}
				/>

				<ThemeToggle {...{ theme, onThemeChange }} />

				<ShortcutsMenu />

				<SettingsButton onClick={onSettingsClick} />
			</div>
		</div>
	</header>
);

export default Header;
