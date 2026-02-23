const CloseIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-5 w-5'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
	>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M6 18L18 6M6 6l12 12'
		/>
	</svg>
);

interface SettingsHeaderProps {
	onClose: () => void;
}

const SettingsHeader = ({ onClose }: SettingsHeaderProps) => (
	<div
		className='flex items-center justify-between p-3 sm:p-4'
		style={{ borderBottom: '1px solid var(--border-color)' }}
	>
		<h2
			className='text-base font-semibold'
			style={{ color: 'var(--text-primary)' }}
		>
			Settings
		</h2>
		<button
			onClick={onClose}
			className='p-1 transition-colors rounded-full'
			style={{ color: 'var(--text-secondary)' }}
		>
			<CloseIcon />
		</button>
	</div>
);

export default SettingsHeader;
