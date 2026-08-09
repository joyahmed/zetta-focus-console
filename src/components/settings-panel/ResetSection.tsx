import { RefreshIcon } from '../timer-panel/icons';

interface ResetSectionProps {
	onResetSettings: () => void;
}

const ResetSection = ({ onResetSettings }: ResetSectionProps) => (
	<section>
		<h3
			className='text-sm font-medium uppercase tracking-wider mb-3'
			style={{ color: 'var(--text-secondary)' }}
		>
			Data
		</h3>
		<button
			onClick={onResetSettings}
			className='w-full p-3 rounded-lg border text-left transition-colors group flex items-center justify-between'
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--border-color)'
			}}
		>
			<div>
				<div
					className='text-sm group-hover:text-red-400'
					style={{ color: 'var(--text-primary)' }}
				>
					Reset Settings
				</div>
				<div
					className='text-xs mt-0.5'
					style={{ color: 'var(--text-muted)' }}
				>
					Restore default configuration
				</div>
			</div>
			<RefreshIcon className='w-5 h-5 text-[var(--text-muted)] group-hover:text-red-400 transition-colors' />
		</button>
	</section>
);

export default ResetSection;
