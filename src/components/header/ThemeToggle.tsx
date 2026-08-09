import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from './icons';


/**
 * Two states, not three.
 *
 * This used to cycle dark -> light -> system, which made following the
 * operating system something you had to go looking for, two clicks past where
 * you started. Following the system is now simply what the app does until you
 * say otherwise: `system` is the default, and the first press of this button
 * resolves it to whichever theme is *not* currently showing. `theme system` in
 * the terminal hands control back.
 */
const ThemeToggle = ({ theme, onThemeChange }: ThemeToggleProps) => {
	const [systemPrefersDark, setSystemPrefersDark] = useState(
		() => window.matchMedia('(prefers-color-scheme: dark)').matches
	);

	useEffect(() => {
		const query = window.matchMedia('(prefers-color-scheme: dark)');
		const onChange = (e: MediaQueryListEvent) =>
			setSystemPrefersDark(e.matches);

		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	}, []);

	const followingSystem = theme === 'system';
	const showingDark = followingSystem ? systemPrefersDark : theme === 'dark';

	const handleToggle = () => onThemeChange(showingDark ? 'light' : 'dark');

	const ThemeIcon = showingDark ? MoonIcon : SunIcon;

	return (
		<button
			onClick={handleToggle}
			aria-label={`Switch to ${showingDark ? 'light' : 'dark'} theme`}
			className='group relative p-2 rounded-lg text-zetta-text-muted hover:text-zetta-text hover:bg-zetta-bg transition-all'
		>
			<ThemeIcon className='h-4 w-4' />

			{/* A quiet mark that the theme is not a choice yet, it is the
			    system's. It disappears the moment you pick one. */}
			{followingSystem && (
				<span className='absolute bottom-1 right-1 w-1 h-1 rounded-full bg-zetta-neon' />
			)}

			<div className='absolute top-full right-0 mt-2 px-2 py-1 bg-zetta-panel border border-zetta-border text-zetta-text text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg backdrop-blur-md'>
				{followingSystem
					? 'Following system'
					: `Switch to ${showingDark ? 'light' : 'dark'}`}
			</div>
		</button>
	);
};

export default ThemeToggle;
