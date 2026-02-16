import { lazy } from 'react';
const MonitorSection = lazy(() => import('./MonitorSection'));

export default function StatsPanel({
	stats,
	systemStats,
	appStats,
	devMode,
	timerStatus,
	activeProfileName,
	licenseType,
	trialDaysRemaining
}: StatsPanelProps) {
	const isTrial = licenseType === 'Trial';

	return (
		<div className='p-2 md:p-3 lg:p-4 bg-zetta-card border border-zetta-border rounded-lg h-full flex flex-col gap-2 md:gap-3 overflow-auto'>
			<div className='flex items-center justify-between flex-shrink-0'>
				<h2
					className='text-xs md:text-sm font-medium uppercase tracking-wider'
					style={{ color: 'var(--text-secondary)' }}
				>
					Statistics
				</h2>
				{isTrial &&
					trialDaysRemaining !== null &&
					trialDaysRemaining !== undefined && (
						<div className='flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 rounded border border-amber-500/30'>
							<span
								className='text-[10px] md:text-xs font-medium'
								style={{ color: '#f59e0b' }}
							>
								Trial
							</span>
							<span
								className='text-[10px] md:text-xs'
								style={{ color: '#f59e0b' }}
							>
								{trialDaysRemaining}d left
							</span>
						</div>
					)}
			</div>

			<div className='grid grid-cols-2 gap-4 md:gap-6 flex-shrink-0 px-2'>
				<div className='flex flex-col'>
					<div
						className='text-xl md:text-2xl font-semibold tracking-tight'
						style={{ color: 'var(--text-primary)' }}
					>
						{stats.sessions_today}
					</div>
					<div
						className='text-[10px] md:text-xs uppercase tracking-wide'
						style={{ color: 'var(--text-muted)' }}
					>
						Sessions Today
					</div>
				</div>

				<div className='flex flex-col'>
					<div
						className='text-xl md:text-2xl font-semibold tracking-tight'
						style={{ color: 'var(--text-primary)' }}
					>
						{stats.total_focus_minutes}
					</div>
					<div
						className='text-[10px] md:text-xs uppercase tracking-wide'
						style={{ color: 'var(--text-muted)' }}
					>
						Total Focus (min)
					</div>
				</div>

				<div className='flex flex-col'>
					<div
						className='text-xl md:text-2xl font-semibold tracking-tight'
						style={{ color: 'var(--text-primary)' }}
					>
						{stats.current_streak}
					</div>
					<div
						className='text-[10px] md:text-xs uppercase tracking-wide'
						style={{ color: 'var(--text-muted)' }}
					>
						Current Streak
					</div>
				</div>

				<div className='flex flex-col'>
					<div
						className='text-xl md:text-2xl font-semibold tracking-tight'
						style={{ color: 'var(--text-primary)' }}
					>
						{stats.last_session_duration}
					</div>
					<div
						className='text-[10px] md:text-xs uppercase tracking-wide'
						style={{ color: 'var(--text-muted)' }}
					>
						Last Session (min)
					</div>
				</div>
			</div>

			{/* Dev Mode: Engine State Section */}
			{devMode && (
				<div className='p-3 rounded border border-yellow-500/20 bg-yellow-500/5 flex-shrink-0'>
					<div className='flex items-center gap-2 mb-2'>
						<span
							className='text-[10px] uppercase tracking-wider font-medium'
							style={{ color: '#ca8a04' }}
						>
							Engine State
						</span>
					</div>
					<div className='grid grid-cols-2 gap-4 text-[10px]'>
						<div className='flex flex-col'>
							<span style={{ color: 'var(--text-muted)' }}>Timer</span>
							<span
								style={{ color: 'var(--text-primary)' }}
								className='font-mono font-medium'
							>
								{timerStatus || 'idle'}
							</span>
						</div>
						<div className='flex flex-col'>
							<span style={{ color: 'var(--text-muted)' }}>Profile</span>
							<span style={{ color: 'var(--text-primary)' }} className='font-medium'>
								{activeProfileName || '-'}
							</span>
						</div>
					</div>
				</div>
			)}

			<div className='flex gap-2'>
				<MonitorSection
					title='System Monitor'
					memoryUsed={systemStats.memory_used}
					memoryTotal={systemStats.memory_total}
				/>

				<MonitorSection
					title='App Monitor'
					memoryUsed={appStats.memory_used}
				/>
			</div>
		</div>
	);
}
