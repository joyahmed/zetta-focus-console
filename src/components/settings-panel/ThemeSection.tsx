import { useEffect, useState } from 'react';
import { DesktopIcon, MoonIcon, SunIcon } from '../header/icons';

interface ThemeSectionProps {
	theme: string;
	onThemeChange: (theme: string) => void;
}

const styles = {
	light: { background: '#d1d5db', color: '#111827' },
	dark: { background: '#172033', color: '#ffffff' }
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

	return (
		<section>
			<h3
				className='text-sm font-medium uppercase tracking-wider mb-3'
				style={{ color: 'var(--text-secondary)' }}
			>
				Theme
			</h3>
			<div
				className='flex gap-2 p-2 rounded-xl'
				style={{ background: 'var(--bg-primary)' }}
			>
				{options.map(({ value, Icon }) => (
					<button
						key={value}
						onClick={() => onThemeChange(value)}
						className='flex-1 flex items-center justify-center rounded-lg p-2 transition-all'
						style={
							theme === value
								? {
										...getStyle(value),
										color: '#0284c7'
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
