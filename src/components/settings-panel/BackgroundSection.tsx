import RadioOption from './RadioOption';
import SectionHeader from './SectionHeader';

/** The two ambience modes. The stored value stays `gradient` — it is a Rust
    enum the preferences file has been written with — but what it draws is the
    aurora, so that is what it is called here. */
const BACKGROUND_MODES: BackgroundMode[] = [
	{ value: 'gradient', label: 'Aurora' },
	{ value: 'particles', label: 'Seasonal Particles' }
];

const BackgroundSection = ({
	backgroundType,
	onBackgroundTypeChange
}: BackgroundSectionProps) => (
	<section>
		<SectionHeader title='Background Mode' />

		<div
			className='space-y-2 p-2 rounded-lg'
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--border-color)'
			}}
		>
			{BACKGROUND_MODES.map(mode => (
				<RadioOption
					key={mode.value}
					{...{
						name: 'bg',
						value: mode.value,
						checked: backgroundType === mode.value,
						onChange: () => onBackgroundTypeChange(mode.value),
						label: mode.label,
						className: ' glass-panel backdrop-blur-xl'
					}}
				/>
			))}
		</div>
	</section>
);

export default BackgroundSection;
