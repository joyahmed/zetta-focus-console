
/** Unix seconds -> "2h 14m". The engine records when it started, not how long
    it has run, so the elapsed time is derived here rather than ticked. */
const formatUptime = (startedAtUnixSeconds?: number): string => {
	if (!startedAtUnixSeconds) return '--';

	const seconds = Math.max(
		0,
		Math.floor(Date.now() / 1000) - startedAtUnixSeconds
	);
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) return `${hours}h ${minutes}m`;
	if (minutes > 0) return `${minutes}m`;
	return `${seconds}s`;
};

const SESSION_LABELS: Record<string, string> = {
	focus: 'FOCUS',
	short_break: 'SHORT BREAK',
	long_break: 'LONG BREAK'
};

const clock = (totalSeconds: number): string => {
	const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
	const seconds = Math.max(0, totalSeconds) % 60;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export default function StatsPanel({ appState }: StatsPanelProps) {
	const {
		timer,
		active_profile: profile,
		stats,
		dev_mode: devMode,
		sound_state: sound,
		session_override: override,
		strict_mode: strict,
		current_task: task,
		ambience_enabled: ambience,
		voice_enabled: voice,
		app_start_time: appStartTime
	} = appState;

	const fields: {
		label: string;
		value: string;
		accent?: 'good' | 'warn';
	}[] = [
		{ label: 'TIMER STATUS', value: (timer.status || 'idle').toUpperCase() },
		{
			label: 'SESSION',
			value: `${SESSION_LABELS[timer.session_type] ?? timer.session_type} ${timer.current_session}/${timer.total_sessions}`
		},
		{ label: 'REMAINING', value: clock(timer.remaining_seconds) },
		{ label: 'ACTIVE PROFILE', value: profile.name },
		{
			label: 'OVERRIDE',
			value: override ? 'SET' : 'NONE',
			accent: override ? 'warn' : undefined
		},
		{
			label: 'STRICT MODE',
			value: strict.is_active ? 'ENGAGED' : 'OFF',
			accent: strict.is_active ? 'warn' : undefined
		},
		{
			label: 'TASK',
			value: task.title.trim() ? `${task.title} (${task.category})` : 'NONE'
		},
		{
			label: 'AMBIENCE',
			value: `${ambience ? 'ON' : 'OFF'} · ${profile.background_type.toUpperCase()}`
		},
		{
			label: 'SOUND',
			value: sound.is_muted
				? 'MUTED'
				: sound.is_playing
					? `${(sound.current_sound ?? '').replace(/\.[^.]+$/, '') || 'ON'} ${sound.volume}%`
					: 'STOPPED'
		},
		{
			label: 'VOICE',
			value: voice ? 'ON' : 'OFF'
		},
		{
			label: 'DEV MODE',
			value: devMode ? 'ACTIVE' : 'STANDBY',
			accent: devMode ? 'good' : undefined
		},
		{ label: 'UPTIME', value: formatUptime(appStartTime) }
	];

	return (
		<div className='panel h-full flex flex-col gap-3 md:gap-4 p-3 md:p-4 overflow-hidden'>
			{/* The grid gives this panel an equal half of the window, which is
			    more room than its content needs. Rather than leaving a void
			    underneath, the sections space out and the meters sit against
			    the bottom edge. */}
			<div className='flex flex-col w-full h-full min-h-0 gap-y-3'>
				{/* Header Section */}
				<div className='flex items-center justify-between w-full shrink-0'>
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
				</div>

				{/* Main Grid - Responsive */}
				<div className='flex flex-wrap gap-2 w-full shrink-0'>
					{/* Sessions Card */}
					<div className='flex-1 basis-28 min-w-0 p-3 rounded-xl border border-zetta-border bg-zetta-bg/50 hover:bg-zetta-bg transition-colors group relative overflow-hidden'>
						<div className='absolute right-1.5 top-1.5 opacity-15 group-hover:opacity-25 transition-opacity'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 text-blue-400'
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
						<div className='text-2xl font-bold text-zetta-text tracking-tight flex items-baseline gap-1.5'>
							{stats.sessions_today}
							<span className='text-xs font-normal text-zetta-text-muted'>
								sess
							</span>
						</div>
					</div>

					{/* Focus Time Card */}
					<div className='flex-1 basis-28 min-w-0 p-3 rounded-xl border border-zetta-border bg-zetta-bg/50 hover:bg-zetta-bg transition-colors group relative overflow-hidden'>
						<div className='absolute right-1.5 top-1.5 opacity-15 group-hover:opacity-25 transition-opacity'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 text-purple-400'
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
						<div className='text-2xl font-bold text-zetta-text tracking-tight flex items-baseline gap-1.5'>
							{stats.total_focus_minutes}
							<span className='text-xs font-normal text-zetta-text-muted'>
								min
							</span>
						</div>
					</div>

					{/* Streak Card */}
					<div className='flex-1 basis-28 min-w-0 p-3 rounded-xl border border-zetta-border bg-zetta-bg/50 hover:bg-zetta-bg transition-colors group relative overflow-hidden'>
						<div className='absolute right-1.5 top-1.5 opacity-15 group-hover:opacity-25 transition-opacity'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 text-orange-400'
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
						<div className='text-2xl font-bold text-zetta-text tracking-tight flex items-baseline gap-1.5'>
							{stats.current_streak}
							<span className='text-xs font-normal text-zetta-text-muted'>
								days
							</span>
						</div>
					</div>

					{/* Last Session Card */}
					<div className='flex-1 basis-28 min-w-0 p-3 rounded-xl border border-zetta-border bg-zetta-bg/50 hover:bg-zetta-bg transition-colors group relative overflow-hidden'>
						<div className='absolute right-1.5 top-1.5 opacity-15 group-hover:opacity-25 transition-opacity'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-5 w-5 text-emerald-400'
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
						<div className='text-2xl font-bold text-zetta-text tracking-tight flex items-baseline gap-1.5'>
							{stats.last_session_duration}
							<span className='text-xs font-normal text-zetta-text-muted'>
								min
							</span>
						</div>
					</div>
				</div>

				{/* Engine diagnostics.
				    This used to show four fields and then stretch to fill the
				    panel, which reads worse than a short box — a large empty
				    container with a border around nothing. The engine knows a
				    good deal more than four things about itself, and a panel
				    called diagnostics should say so. */}
				<div className='p-2.5 md:p-3 rounded-xl border border-zetta-border bg-zetta-bg/50 w-full flex-1 flex flex-col min-h-0'>
					<div className='flex items-center gap-2 mb-2 shrink-0'>
						<div
							className={`w-1.5 h-1.5 rounded-full ${devMode ? 'bg-zetta-neon animate-pulse' : 'bg-zetta-text-muted'}`}
						/>
						<span className='text-[10px] uppercase tracking-wider font-semibold text-zetta-text-muted'>
							Engine Diagnostics
						</span>
					</div>

					{/* Rows, not boxes.
					    Each value used to sit in a filled, bordered rectangle
					    stretched to fill the row — twelve heavy blocks with faint
					    labels, which read as a different application bolted into
					    the panel. The value carries the weight now and the label
					    is the quiet part, separated by a hairline rather than
					    enclosed. */}
					<dl className='grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-2.5 content-start flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1'>
						{fields.map(field => (
							<div
								key={field.label}
								className='flex flex-col gap-0.5 min-w-0 pb-1.5 border-b border-zetta-border/50'
							>
								<dt className='text-[9px] uppercase tracking-wider text-zetta-text-muted'>
									{field.label}
								</dt>
								<dd
									className={`font-mono text-[11px] truncate ${
										field.accent === 'good'
											? 'text-green-400'
											: field.accent === 'warn'
												? 'text-amber-400'
												: 'text-zetta-text'
									}`}
								>
									{field.value}
								</dd>
							</div>
						))}
					</dl>
				</div>

			</div>
		</div>
	);
}
