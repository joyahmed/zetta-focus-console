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
	const { hasOverride, circumference, strokeDashoffset, formatTime } =
		useTimerPanel({
			timer,
			sessionOverride
		});

	// Dynamic glow based on timer state
	const isRunning = timer.status === 'running';

	// Stroke config
	const radius = 90;

	return (
		<div className='glass-panel h-full rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group'>
			{/* Background ambient glow */}
			<div
				className='absolute inset-0 opacity-20 transition-opacity duration-1000'
				style={{
					background: isRunning
						? `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`
						: 'none'
				}}
			/>

			{/* Session Indicator */}
			<div className='absolute top-6 flex flex-col items-center gap-2'>
				<span className='text-[10px] font-bold uppercase tracking-[0.2em] text-zetta-text-muted'>
					{timer.session_type.replace('_', ' ')}
				</span>

				{hasOverride && (
					<span className='px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/20'>
						Override
					</span>
				)}
			</div>

			{/* Timer Ring & Display */}
			<div className='relative w-[12dvw] xl:w-64 aspect-square flex items-center justify-center my-6'>
				<svg
					className='absolute w-full h-full -rotate-90 transform'
					viewBox='0 0 200 200'
				>
					{/* Track */}
					<circle
						cx='100'
						cy='100'
						r={radius}
						fill='none'
						stroke='var(--color-ring-base)'
						strokeWidth='4'
					/>

					{/* Progress with Glow */}
					<circle
						cx='100'
						cy='100'
						r={radius}
						fill='none'
						stroke={isRunning ? glowColor : 'var(--text-muted)'}
						strokeWidth='4'
						strokeLinecap='round'
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						className='transition-all duration-1000 ease-linear'
						style={{
							filter: isRunning
								? `drop-shadow(0 0 6px ${glowColor})`
								: 'none'
						}}
					/>
				</svg>

				{/* Time Display */}
				<div
					className='z-10 font-mono text-[3dvw] xl:text-6xl font-medium tracking-wide tabular-nums transition-colors duration-300'
					style={{
						color: 'var(--text-primary)',
						opacity: isRunning ? 1 : 0.7,
						textShadow: isRunning ? `0 0 20px ${glowColor}50` : 'none'
					}}
				>
					{formatTime(timer.remaining_seconds)}
				</div>
			</div>

			{/* Controls - Iconic & Minimal */}
			<div className='flex items-center gap-6 z-10'>
				{timer.status === 'idle' && (
					<button
						onClick={onStart}
						className='group relative h-16 w-16 rounded-full flex items-center justify-center border-2 border-zetta-neon-secondary bg-zetta-neon-secondary/10 text-zetta-neon-secondary transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:bg-zetta-neon-secondary/20 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95'
						title='Start Focus'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-8 w-8 ml-1'
							viewBox='0 0 24 24'
							fill='currentColor'
						>
							<path d='M8 5v14l11-7z' />
						</svg>
					</button>
				)}

				{timer.status === 'running' && (
					<button
						onClick={onPause}
						className='h-16 w-16 rounded-full flex items-center justify-center border border-zetta-border bg-zetta-card text-zetta-text backdrop-blur-sm transition-all duration-300 hover:bg-zetta-text/5 hover:border-zetta-text/20 hover:scale-105 active:scale-95'
						title='Pause'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-8 w-8'
							viewBox='0 0 24 24'
							fill='currentColor'
						>
							<path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
						</svg>
					</button>
				)}

				{(timer.status === 'paused' ||
					timer.status === 'completed') && (
					<>
						<button
							onClick={
								timer.status === 'completed' ? onStart : onResume
							}
							className='group relative h-16 w-16 rounded-full flex items-center justify-center border-2 border-zetta-neon-secondary bg-zetta-neon-secondary/10 text-zetta-neon-secondary transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:bg-zetta-neon-secondary/20 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95'
							title={
								timer.status === 'completed' ? 'Restart' : 'Resume'
							}
						>
							{timer.status === 'completed' ? (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-8 w-8'
									viewBox='0 0 24 24'
									fill='currentColor'
								>
									<path d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' />
								</svg>
							) : (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-8 w-8 ml-1'
									viewBox='0 0 24 24'
									fill='currentColor'
								>
									<path d='M8 5v14l11-7z' />
								</svg>
							)}
						</button>

						{timer.status === 'paused' && (
							<button
								onClick={onStop}
								className='h-16 w-16 rounded-full flex items-center justify-center border border-red-500/30 bg-red-500/10 text-red-500 backdrop-blur-sm transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/50 hover:scale-105 active:scale-95'
								title='Stop'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-6 w-6'
									viewBox='0 0 24 24'
									fill='currentColor'
								>
									<path d='M6 6h12v12H6z' />
								</svg>
							</button>
						)}
					</>
				)}
			</div>
		</div>
	);
}
