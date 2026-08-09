import { lazy, Suspense } from 'react';
const LogoBrand = lazy(() => import('./header/Logo'));
const CommandSpotlight = lazy(
	() => import('./header/CommandSpotlight')
);
const ProfilePill = lazy(() => import('./header/ProfilePill'));
const VolumeControl = lazy(() => import('./header/VolumeControl'));
const ThemeToggle = lazy(() => import('./header/ThemeToggle'));
const SettingsButton = lazy(() => import('./header/SettingsButton'));
const ShortcutsMenu = lazy(() => import('./header/ShortcutsMenu'));

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
				<Suspense fallback={null}>
					<LogoBrand {...{ devMode }} />
				</Suspense>

				<Suspense fallback={null}>
					<CommandSpotlight onClick={onTerminalClick} />
				</Suspense>

				<div className='flex items-center justify-end gap-3 w-1/4'>
					<Suspense fallback={null}>
						<ProfilePill {...{ activeProfileName }} />
					</Suspense>

					<div className='h-4 w-[1px] bg-zetta-border mx-1' />

					<Suspense fallback={null}>
						<VolumeControl
							{...{
								volume,
								isMuted,
								onVolumeChange,
								onMuteToggle
							}}
						/>
					</Suspense>

					<Suspense fallback={null}>
						<ThemeToggle {...{ theme, onThemeChange }} />
					</Suspense>

					<Suspense fallback={null}>
						<SettingsButton onClick={onSettingsClick} />
					</Suspense>

					<Suspense fallback={null}>
						<ShortcutsMenu />
					</Suspense>

				</div>
			</div>
		</header>
	);
};

export default Header;
