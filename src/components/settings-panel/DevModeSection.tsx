import Toggle from './Toggle';

interface DevModeSectionProps {
	devMode: boolean;
	onDevModeToggle: () => void;
	isLight: boolean;
}

const DevModeSection = ({
	devMode,
	onDevModeToggle,
	isLight
}: DevModeSectionProps) => (
	<section>
		<h3
			className='text-sm font-medium uppercase tracking-wider mb-3'
			style={{ color: 'var(--text-secondary)' }}
		>
			Developer
		</h3>
		<div
			className='flex items-center justify-between p-3 rounded-lg border'
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--border-color)'
			}}
		>
			<span className='text-sm' style={{ color: 'var(--text-primary)' }}>
				Developer Mode
			</span>
			<Toggle
				{...{
					enabled: devMode,
					onChange: onDevModeToggle,
					isLight
				}}
			/>
		</div>
	</section>
);

export default DevModeSection;
