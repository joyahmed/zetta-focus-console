interface TimerDisplayProps {
	formattedTime: string;
	isRunning: boolean;
	glowColor: string;
}

function TimerDisplay({
	formattedTime,
	isRunning,
	glowColor
}: TimerDisplayProps) {
	const opacity = isRunning ? 1 : 0.7;
	const textShadow = isRunning ? `0 0 20px ${glowColor}50` : 'none';

	return (
		<div
			className='z-10 font-mono text-[3dvw] xl:text-6xl font-medium tracking-wide tabular-nums transition-colors duration-300'
			style={{
				color: 'var(--text-primary)',
				opacity,
				textShadow
			}}
		>
			{formattedTime}
		</div>
	);
}

export default TimerDisplay;
