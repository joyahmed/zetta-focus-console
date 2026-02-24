interface GradientBackgroundProps {
	glowColor: string;
	isLight: boolean;
	timer: TimerState;
}

const GradientBackground = ({
	glowColor,
	isLight,
	timer
}: GradientBackgroundProps) => {
	const getGlowColor = (opacity: string) =>
		isLight ? glowColor : glowColor + opacity;

	const isRunning = timer.status === 'running';
	const isPaused = timer.status === 'paused';
	const isBreakSession =
		timer.session_type === 'short_break' || timer.session_type === 'long_break';

	const progress =
		timer.total_seconds > 0
			? (timer.total_seconds - timer.remaining_seconds) / timer.total_seconds
			: 0;
	const clampedProgress = Math.max(0, Math.min(1, progress));
	const nearEndUrgency = isRunning ? Math.max(0, (clampedProgress - 0.8) / 0.2) : 0;

	const baseOpacity = isLight ? '30' : isRunning ? '1a' : '10';
	const midOpacity = isLight ? '15' : isRunning ? '0d' : '07';
	const driftDuration = isRunning ? (isBreakSession ? '32s' : '22s') : '48s';
	const pulseDuration = isRunning ? (isBreakSession ? '10s' : '6s') : '18s';
	const playState = isPaused ? 'paused' : 'running';
	const pulseOpacity = isRunning ? (isBreakSession ? 0.45 : 0.6) : 0.25;

	return (
		<div className='relative w-full h-full overflow-hidden'>
			<div
				className='absolute inset-0 pointer-events-none'
				style={{
					background: `
						radial-gradient(circle at 25% 18%, ${getGlowColor('26')} 0%, transparent 42%),
						radial-gradient(circle at 78% 82%, ${getGlowColor(isBreakSession ? '14' : '18')} 0%, transparent 52%),
						radial-gradient(circle at 52% 58%, ${getGlowColor(isBreakSession ? '10' : '16')} 0%, transparent 62%)
					`,
					filter: 'blur(64px)',
					animation: `ambientGradientDrift ${driftDuration} ease-in-out infinite alternate`,
					animationPlayState: playState
				}}
			/>
			<div
				className='absolute inset-0'
				style={{
					background: `linear-gradient(135deg, ${getGlowColor(baseOpacity)} 0%, transparent 58%, ${getGlowColor(midOpacity)} 100%)`,
					animation: `ambientGradientPulse ${pulseDuration} ease-in-out infinite`,
					animationPlayState: playState,
					opacity: pulseOpacity
				}}
			/>
			<div
				className='absolute inset-0 pointer-events-none'
				style={{
					background: `radial-gradient(circle at 50% 60%, ${getGlowColor('22')} 0%, transparent 68%)`,
					opacity: nearEndUrgency * 0.7,
					animation: 'ambientUrgencyBloom 3.5s ease-in-out infinite',
					animationPlayState: playState
				}}
			/>
		</div>
	);
};

export default GradientBackground;
