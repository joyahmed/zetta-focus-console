import { useEffect, useState } from 'react';
import { DesktopIcon, MoonIcon, SunIcon } from '../header/icons';

interface ThemeSectionProps {
	theme: string;
	onThemeChange: (theme: string) => void;
}

const styles = {
	light: { background: '#FFFFFFB3', color: '#111827' },
	dark: { background: '#050510', color: '#ffffff' }
};

const options = [
	{ value: 'light', Icon: SunIcon },
	{ value: 'system', Icon: DesktopIcon },
	{ value: 'dark', Icon: MoonIcon }
];

const ThemeSection = ({
	theme,
	onThemeChange
}: ThemeSectionProps) => {
	const [sysDark, setSysDark] = useState(
		window.matchMedia('(prefers-color-scheme: dark)').matches
	);

	useEffect(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		mq.addEventListener('change', e => setSysDark(e.matches));
		return () =>
			mq.removeEventListener('change', e => setSysDark(e.matches));
	}, []);

	const getStyle = (value: string) =>
		styles[
			value === 'system'
				? sysDark
					? 'dark'
					: 'light'
				: (value as 'light' | 'dark')
		];
	const isDark = theme === 'dark' || (theme === 'system' && sysDark);
	return (
		<section>
			<h3
				className='text-sm font-medium uppercase tracking-wider mb-3'
				style={{ color: 'var(--text-secondary)' }}
			>
				Theme
			</h3>
			<div className='flex gap-2 p-2 rounded-xl'>
				{options.map(({ value, Icon }) => (
					<button
						key={value}
						onClick={() => onThemeChange(value)}
						className='flex-1 flex items-center justify-center rounded-lg p-2 transition-all'
						style={
							theme === value
								? {
										...getStyle(value),
										color: '#0284c7',
										boxShadow: isDark
											? `
		0 1px 0 rgba(255,255,255,0.06),
		0 6px 14px rgba(0,0,0,0.85),
		0 2px 6px rgba(0,0,0,0.6),
		inset 0 0 0 1px rgba(255,255,255,0.02)
	  `
											: '0 1px 0 rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.22), 0 2px 3px rgba(0,0,0,0.14)'
									}
								: {
										background: 'transparent',
										color: 'var(--text-muted, #555e6e)'
									}
						}
					>
						<Icon className='w-5 h-5' />
					</button>
				))}
			</div>
		</section>
	);
};

export default ThemeSection;
