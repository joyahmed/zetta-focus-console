import SectionHeader from './SectionHeader';
import Toggle from './Toggle';


const StrictModeSection = ({
	strictModeActive,
	onStrictModeToggle,
	isLight
}: StrictModeSectionProps) => {
	return (
		<section>
			<SectionHeader title='Discipline' />
			<div
				className='flex items-center justify-between p-3 rounded-lg border'
				style={{
					backgroundColor: 'var(--bg-primary)',
					borderColor: 'var(--border-color)'
				}}
			>
				<div className='flex flex-col'>
					<span
						className='text-sm font-medium'
						style={{ color: 'var(--text-primary)' }}
					>
						Strict Mode
					</span>
					<span
						className='text-xs mt-0.5'
						style={{ color: 'var(--text-secondary)' }}
					>
						Prevent early stop/pause during sessions
					</span>
				</div>
				<Toggle
					{...{
						enabled: strictModeActive,
						onChange: onStrictModeToggle,
						isLight
					}}
				/>
			</div>
		</section>
	);
};

export default StrictModeSection;
