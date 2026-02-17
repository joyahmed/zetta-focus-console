interface TimerDisplayProps {
	formattedTime: string;
	isRunning: boolean;
	glowColor: string;
	currentSession: number;
	totalSessions: number;
}

function TimerDisplay({
	formattedTime,
	isRunning,
	glowColor,
	currentSession,
	totalSessions
}: TimerDisplayProps) {
	const opacity = isRunning ? 1 : 0.7;
	const textShadow = isRunning ? `0 0 20px ${glowColor}50` : 'none';

	return (
		<div className='z-10 flex flex-col items-center gap-2'>
			<div
				className='font-mono text-[3dvw] xl:text-6xl font-medium tracking-wide tabular-nums transition-colors duration-300'
				style={{
					color: 'var(--text-primary)',
					opacity,
					textShadow
				}}
			>
				{formattedTime}
			</div>
			{/* Session indicator inside the circle */}
			<div className='flex items-center gap-1.5 mt-1'>
				{Array.from({ length: totalSessions }, (_, i) => (
					<div
						key={i}
						className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
							i < currentSession
								? 'bg-zetta-accent'
								: i === currentSession - 1
								? 'bg-zetta-accent/80 ring-1 ring-zetta-accent/30'
								: 'bg-zetta-text-muted/30'
						}`}
					/>
				))}
			</div>
		</div>
	);
}

export default TimerDisplay;
