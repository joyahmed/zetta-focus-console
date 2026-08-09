import SectionHeader from './SectionHeader';
import Toggle from './Toggle';

const BellIcon = () => (
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
			d='M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
		/>
	</svg>
);

const AlarmSection = ({
	alarmEnabled,
	onAlarmToggle,
	isLight
}: AlarmSectionProps) => (
	<section>
		<SectionHeader title='Session Alarms' />

		<div className='space-y-3'>
			<div
				className='flex items-center justify-between p-3 rounded-lg border'
				style={{
					backgroundColor: 'var(--bg-primary)',
					borderColor: 'var(--border-color)'
				}}
			>
				<div className='flex items-center gap-3'>
					<BellIcon />
					<div>
						<span
							className='text-sm'
							style={{ color: 'var(--text-primary)' }}
						>
							Alarm Tones
						</span>
						<div
							className='text-xs mt-0.5'
							style={{ color: 'var(--text-muted)' }}
						>
							A different tone for session end, break end and the
							end of the cycle
						</div>
					</div>
				</div>
				<Toggle
					{...{
						enabled: alarmEnabled,
						onChange: onAlarmToggle,
						isLight
					}}
				/>
			</div>
		</div>
	</section>
);

export default AlarmSection;
