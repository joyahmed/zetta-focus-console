import { SunIcon, MoonIcon, DesktopIcon } from './icons';

interface ThemeToggleProps {
	theme: string;
	onThemeChange: (theme: string) => void;
}

const ThemeToggle = ({ theme, onThemeChange }: ThemeToggleProps) => {
	const themes = ['dark', 'light', 'system'];
	const currentIndex = themes.indexOf(theme);
	const nextIndex = (currentIndex + 1) % themes.length;

	const handleToggle = () => onThemeChange(themes[nextIndex]);

	const themeIcons = {
		light: SunIcon,
		dark: MoonIcon,
		system: DesktopIcon
	};

	const ThemeIcon = themeIcons[theme as keyof typeof themeIcons] || MoonIcon;

	return (
		<button
			onClick={handleToggle}
			className='group relative p-2 rounded-lg text-zetta-text-muted hover:text-zetta-text hover:bg-zetta-bg transition-all'
		>
			<ThemeIcon className='h-4 w-4' />
			<div className='absolute top-full right-0 mt-2 px-2 py-1 bg-zetta-panel border border-zetta-border text-zetta-text text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg backdrop-blur-md'>
				Switch Theme
			</div>
		</button>
	);
};

export default ThemeToggle;
