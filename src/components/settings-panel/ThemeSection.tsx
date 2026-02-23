import RadioOption from './RadioOption';

interface ThemeSectionProps {
	theme: string;
	onThemeChange: (theme: string) => void;
}

const ThemeSection = ({ theme, onThemeChange }: ThemeSectionProps) => (
	<section>
		<h3
			className='text-sm font-medium uppercase tracking-wider mb-3'
			style={{ color: 'var(--text-secondary)' }}
		>
			Theme
		</h3>
		<div className='space-y-2'>
			<RadioOption
				{...{
					name: 'theme',
					value: 'dark',
					checked: theme === 'dark',
					onChange: () => onThemeChange('dark'),
					label: 'Dark'
				}}
			/>
			<RadioOption
				{...{
					name: 'theme',
					value: 'light',
					checked: theme === 'light',
					onChange: () => onThemeChange('light'),
					label: 'Light'
				}}
			/>
			<RadioOption
				{...{
					name: 'theme',
					value: 'system',
					checked: theme === 'system',
					onChange: () => onThemeChange('system'),
					label: 'System'
				}}
			/>
		</div>
	</section>
);

export default ThemeSection;
