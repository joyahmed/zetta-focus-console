import { useTimerPanel } from '../hooks/use-timer-panel';

export default function TimerPanel({
	timer,
	glowColor,
	sessionOverride,
	onStart,
	onPause,
	onResume,
	onStop,
	theme = 'dark'
}: TimerPanelProps) {
	const isLight = theme === 'light';

	// Premium colors based on spec - using CSS variable tokens
	const baseRingColor = isLight
		? 'var(--color-ring-base)'
		: 'var(--color-ring-base)';
	const progressColor = 'var(--color-ring-progress)';
	const progressGlow = isLight
		? 'none'
		: 'drop-shadow(0 0 5px var(--color-ring-progress))';

	const {
		hasOverride,
		getStatusLabel,
		circumference,
		strokeDashoffset,
		formatTime
	} = useTimerPanel({
		timer,
		sessionOverride
	});

	return (
		<div className='flex flex-col items-center justify-center p-3 md:p-4 bg-zetta-card border border-zetta-border rounded-lg h-full'>
			{/* Override Indicator */}
			{hasOverride && (
				<div className='mb-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full'>
					<span className='text-xs font-medium text-amber-400 uppercase tracking-wider'>
						⚡ Override Active
					</span>
				</div>
			)}

			<div className='flex items-center gap-2 mb-2 md:mb-3'>
				<span
					className='w-2 h-2 rounded-full'
					style={{
						backgroundColor:
							timer.status === 'running'
								? glowColor
								: 'var(--text-muted)',
						boxShadow:
							timer.status === 'running'
								? `0 0 8px ${glowColor}`
								: 'none'
					}}
				/>
				<span
					className='text-xs font-medium uppercase tracking-wider'
					style={{ color: 'var(--text-secondary)' }}
				>
					{getStatusLabel(timer.status)}
				</span>
			</div>

			<div className='relative w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 flex items-center justify-center'>
				<svg
					className='absolute w-full h-full -rotate-90'
					viewBox='0 0 200 200'
				>
					{/* Base Ring - Background */}
					<circle
						cx='100'
						cy='100'
						r='90'
						fill='none'
						stroke={baseRingColor}
						strokeWidth='7'
					/>
					{/* Progress Arc - Foreground */}
					<circle
						cx='100'
						cy='100'
						r='90'
						fill='none'
						stroke={progressColor}
						strokeWidth='9'
						strokeLinecap='round'
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						className={`transition-all duration-1000 ease-linear ${timer.status === 'completed' ? 'animate-pulse' : ''}`}
						style={{
							filter: progressGlow
						}}
					/>
				</svg>
				<div
					className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight'
					style={{ color: 'var(--text-primary)' }}
				>
					{formatTime(timer.remaining_seconds)}
				</div>
			</div>

			<div className='flex gap-2 md:gap-3 mt-3 md:mt-4'>
				{timer.status === 'idle' && (
					<button
						onClick={onStart}
						className='px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium bg-zetta-border hover:opacity-80 rounded transition-colors'
						style={{ color: 'var(--text-primary)' }}
					>
						START
					</button>
				)}
				{timer.status === 'running' && (
					<button
						onClick={onPause}
						className='px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium bg-zetta-border hover:opacity-80 rounded transition-colors'
						style={{ color: 'var(--text-primary)' }}
					>
						PAUSE
					</button>
				)}
				{timer.status === 'paused' && (
					<>
						<button
							onClick={onResume}
							className='px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium bg-zetta-border hover:opacity-80 rounded transition-colors'
							style={{ color: 'var(--text-primary)' }}
						>
							RESUME
						</button>
						<button
							onClick={onStop}
							className='px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium border rounded transition-colors'
							style={{
								color: '#ef4444',
								borderColor: 'rgba(239, 68, 68, 0.3)'
							}}
						>
							STOP
						</button>
					</>
				)}
				{timer.status === 'completed' && (
					<button
						onClick={onStart}
						className='px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-medium bg-zetta-border hover:opacity-80 rounded transition-colors'
						style={{ color: 'var(--text-primary)' }}
					>
						RESTART
					</button>
				)}
			</div>

			<div
				className='mt-2 md:mt-3 text-xs uppercase tracking-wider'
				style={{ color: 'var(--text-muted)' }}
			>
				{timer.session_type === 'focus'
					? 'Focus Session'
					: timer.session_type === 'short_break'
						? 'Short Break'
						: 'Long Break'}
			</div>
		</div>
	);
}
