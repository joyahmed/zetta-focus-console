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
		<div className='glass-panel h-full flex-1 flex-col gap-3 md:gap-4  p-3 md:p-4 rounded-2xl border border-zetta-border bg-zetta-card hover:bg-zetta-bg transition-colors overfllow-hidden'>
			<div className='flex flex-col items-center shrink-0 w-full overflow-y-auto h-full gap-y-4'>
				{/* Header Section */}
				<div className='flex items-center justify-between  w-full'>
					<div className='flex items-center gap-2'>
						<div className='p-1.5 rounded-lg bg-zetta-bg border border-zetta-border'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-4 w-4 text-zetta-neon'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M3 3v18h18' />
								<path d='M18.7 8l-5.1 5.2-2.8-2.7L7 14.3' />
							</svg>
						</div>
						<h2 className='text-sm font-semibold tracking-wide text-zetta-text'>
							STATISTICS
						</h2>
					</div>

					{isTrial &&
						trialDaysRemaining !== null &&
						trialDaysRemaining !== undefined && (
							<div className='flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'>
								<span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse' />
								<span className='text-[10px] font-medium text-amber-500'>
									{trialDaysRemaining}d remaining
								</span>
							</div>
						)}
				</div>

				{/* Main Grid - Responsive */}
				<div className='grid grid-cols-2 xl:grid-cols-4 gap-2 md:gap-3 w-full'>
					{/* Sessions Card */}
					<div className='p-2.5 md:p-3 rounded-xl border border-zetta-border bg-zetta-bg/50 hover:bg-zetta-bg transition-colors group relative overflow-hidden'>
						<div className='absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-8 w-8 text-blue-400'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<circle cx='12' cy='12' r='10' />
								<polyline points='12 6 12 12 16 14' />
							</svg>
						</div>
						<div className='text-xs text-zetta-text-muted mb-1 font-medium tracking-wide'>
							TODAY
						</div>
						<div className='text-xl  font-bold text-zetta-text tracking-tight flex items-baseline gap-1.5'>
							{stats.sessions_today}
							<span className='text-xs font-normal text-zetta-text-muted'>
								sess
							</span>
						</div>
					</div>

					{/* Focus Time Card */}
					<div className='p-2.5 md:p-3 rounded-xl border border-zetta-border bg-zetta-bg/50 hover:bg-zetta-bg transition-colors group relative overflow-hidden min-h-0'>
						<div className='absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-8 w-8 text-purple-400'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z' />
							</svg>
						</div>
						<div className='text-xs text-zetta-text-muted mb-1 font-medium tracking-wide'>
							FOCUS TIME
						</div>
						<div className='text-xl  font-bold text-zetta-text tracking-tight flex items-baseline gap-1.5'>
							{stats.total_focus_minutes}
							<span className='text-xs font-normal text-zetta-text-muted'>
								min
							</span>
						</div>
					</div>

					{/* Streak Card */}
					<div className='p-2.5 md:p-3 rounded-xl border border-zetta-border bg-zetta-bg/50 hover:bg-zetta-bg transition-colors group relative overflow-hidden'>
						<div className='absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-8 w-8 text-orange-400'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
								<path d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
							</svg>
						</div>
						<div className='text-xs text-zetta-text-muted mb-1 font-medium tracking-wide'>
							STREAK
						</div>
						<div className='text-xl  font-bold text-zetta-text tracking-tight flex items-baseline gap-1.5'>
							{stats.current_streak}
							<span className='text-xs font-normal text-zetta-text-muted'>
								days
							</span>
						</div>
					</div>

					{/* Last Session Card */}
					<div className='p-2.5 md:p-3 rounded-xl border border-zetta-border bg-zetta-bg/50 hover:bg-zetta-bg transition-colors group relative overflow-hidden'>
						<div className='absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-8 w-8 text-emerald-400'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							>
								<path d='M12 20v-6M6 20V10M18 20V4' />
							</svg>
						</div>
						<div className='text-xs text-zetta-text-muted mb-1 font-medium tracking-wide'>
							LAST
						</div>
						<div className='text-xl font-bold text-zetta-text tracking-tight flex items-baseline gap-1.5'>
							{stats.last_session_duration}
							<span className='text-xs font-normal text-zetta-text-muted'>
								min
							</span>
						</div>
					</div>
				</div>

				{/* Engine State Section - Always visible */}
				<div className='p-2.5 md:p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5  w-full'>
					<div className='flex items-center gap-2 mb-2'>
						<div
							className={`w-1.5 h-1.5 rounded-full ${devMode ? 'bg-yellow-500 animate-pulse' : 'bg-zetta-text-muted'}`}
						/>
						<span className='text-[10px] uppercase tracking-wider font-bold text-yellow-500'>
							Engine Diagnostics
						</span>
					</div>
					<div className='grid grid-cols-2 gap-2 md:gap-4 text-[10px]'>
						<div className='flex flex-col gap-0.5'>
							<span className='text-zetta-text-muted font-medium'>
								TIMER STATUS
							</span>
							<span className='font-mono font-medium text-zetta-text bg-zetta-bg px-2 py-1 rounded border border-zetta-border truncate'>
								{timerStatus || 'IDLE'}
							</span>
						</div>
						<div className='flex flex-col gap-0.5'>
							<span className='text-zetta-text-muted font-medium'>
								ACTIVE PROFILE
							</span>
							<span className='font-medium text-zetta-text truncate'>
								{activeProfileName || '-'}
							</span>
						</div>
						<div className='flex flex-col gap-0.5'>
							<span className='text-zetta-text-muted font-medium'>
								FOCUS ENGINE
							</span>
							<span
								className={`font-mono font-medium px-2 py-1 rounded border ${devMode ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-zetta-bg text-zetta-text-muted border-zetta-border'}`}
							>
								{devMode ? 'ACTIVE' : 'STANDBY'}
							</span>
						</div>
						<div className='flex flex-col gap-0.5'>
							<span className='text-zetta-text-muted font-medium'>
								SYSTEM
							</span>
							<span className='font-mono font-medium text-zetta-text bg-zetta-bg px-2 py-1 rounded border border-zetta-border truncate'>
								--
							</span>
						</div>
					</div>
				</div>

				{/* System Monitors - Responsive flex container */}
				<div className='flex flex-col sm:flex-row gap-2 sm:gap-2 w-full'>
					<MonitorSection
						title='SYSTEM'
						memoryUsed={systemStats.memory_used}
						memoryTotal={systemStats.memory_total}
					/>

					<MonitorSection
						title='APP'
						memoryUsed={appStats.memory_used}
					/>
				</div>
			</div>
		</div>
	);
}
