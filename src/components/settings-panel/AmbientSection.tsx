import Toggle from './Toggle';


const AmbientSection = ({
	ambienceEnabled,
	onAmbienceToggle,
	isLight
}: AmbientSectionProps) => (
	<section>
		<h3
			className='text-sm font-medium uppercase tracking-wider mb-3'
			style={{ color: 'var(--text-secondary)' }}
		>
			Visual
		</h3>
		<div
			className='flex items-center justify-between p-3 rounded-lg border'
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--border-color)'
			}}
		>
			<div>
				<span className='text-sm' style={{ color: 'var(--text-primary)' }}>
					Ambient Animations
				</span>
				<div className='text-xs mt-0.5' style={{ color: 'var(--text-muted)' }}>
					{isLight ? 'Disabled in light mode' : 'Seasonal visual effects'}
				</div>
			</div>
			<Toggle
				{...{
					enabled: ambienceEnabled,
					onChange: onAmbienceToggle,
					disabled: isLight,
					isLight
				}}
			/>
		</div>
	</section>
);

export default AmbientSection;
