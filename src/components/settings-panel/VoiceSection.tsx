import Toggle from './Toggle';


const VoiceIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-4 w-4'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
		/>
	</svg>
);

const VoiceSection = ({
	voiceEnabled,
	onVoiceToggle,
	isLight
}: VoiceSectionProps) => (
	<section>
		<h3
			className='text-sm font-medium uppercase tracking-wider mb-3'
			style={{ color: 'var(--text-secondary)' }}
		>
			Voice Announcements
		</h3>
		<div className='space-y-3'>
			<div
				className='flex items-center justify-between p-3 rounded-lg border'
				style={{
					backgroundColor: 'var(--bg-primary)',
					borderColor: 'var(--border-color)'
				}}
			>
				<div className='flex items-center gap-3'>
					<VoiceIcon />
					<div>
						<span
							className='text-sm'
							style={{ color: 'var(--text-primary)' }}
						>
							Voice Cues
						</span>
						<div
							className='text-xs mt-0.5'
							style={{ color: 'var(--text-muted)' }}
						>
							Session start/end announcements
						</div>
					</div>
				</div>
				<Toggle
					{...{
						enabled: voiceEnabled,
						onChange: onVoiceToggle,
						isLight
					}}
				/>
			</div>
		</div>
	</section>
);

export default VoiceSection;
