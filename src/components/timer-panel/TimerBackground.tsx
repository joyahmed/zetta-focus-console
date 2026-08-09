interface TimerBackgroundProps {
	isRunning: boolean;
	glowColor: string;
}

function TimerBackground({
	isRunning,
	glowColor
}: TimerBackgroundProps) {
	const background = isRunning
		? `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`
		: 'none';

	return (
		<div
			className='absolute inset-0 opacity-20 transition-opacity duration-1000 pointer-events-none'
			style={{ background }}
		/>
	);
}

export default TimerBackground;
