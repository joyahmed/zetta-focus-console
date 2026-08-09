interface TimerDisplayProps {
	formattedTime: string;
	isRunning: boolean;
	glowColor: string;
}

/**
 * Just the clock.
 *
 * This used to draw a row of dots underneath for the position in the cycle,
 * which said the same thing as the "Session 1/4" line now sitting below it —
 * two indicators for one fact, stacked, in the middle of a circle.
 */
function TimerDisplay({
	formattedTime,
	isRunning,
	glowColor
}: TimerDisplayProps) {
	const opacity = isRunning ? 1 : 0.7;
	const textShadow = isRunning ? `0 0 20px ${glowColor}50` : 'none';

	return (
		<div
			className='z-10 font-mono text-[clamp(2rem,3.2dvw,3.75rem)] font-medium tracking-wide tabular-nums transition-colors duration-300'
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
