import RadioOption from './RadioOption';

interface BackgroundSectionProps {
	backgroundType: 'gradient' | 'particles' | 'custom';
	onBackgroundTypeChange: (type: 'gradient' | 'particles') => void;
}

const BackgroundSection = ({
	backgroundType,
	onBackgroundTypeChange
}: BackgroundSectionProps) => (
	<section>
		<h3
			className='text-sm font-medium uppercase tracking-wider mb-3'
			style={{ color: 'var(--text-secondary)' }}
		>
			Background Mode
		</h3>
		<div className='space-y-2 p-2 rounded-lg'
		style={{
					backgroundColor: 'var(--bg-primary)',
					borderColor: 'var(--border-color)'
			}}>

			<RadioOption
				{...{
					name: 'bg',
					value: 'gradient',
					checked: backgroundType === 'gradient',
					onChange: () => onBackgroundTypeChange('gradient'),
					label: 'Gradient Theme',
					className:' glass-panel bg-black/5 backdrop-blur-xl'
				}}
			/>
			<RadioOption
				{...{
					name: 'bg',
					value: 'particles',
					checked: backgroundType === 'particles',
					onChange: () => onBackgroundTypeChange('particles'),
					label: 'Subtle Particles',
					className:' glass-panel bg-black/5 backdrop-blur-xl'
				}}
			/>
		</div>
	</section>
);

export default BackgroundSection;
