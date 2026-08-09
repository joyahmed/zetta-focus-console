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

	// Idle values used to be 0x10 and 0x07 — about 6% and 3% alpha, behind 42px
	// of blur. On a dark background that is indistinguishable from nothing, so
	// the panel read as broken whenever the timer was not running, which is
	// most of the time anyone is looking at it. Idle is still quieter than a
	// running session; it is just visible.
	const baseOpacity = isLight ? '30' : isRunning ? '1a' : '14';
	const midOpacity = isLight ? '15' : isRunning ? '0d' : '0b';
	const driftDuration = isRunning ? (isBreakSession ? '32s' : '22s') : '48s';
	const pulseDuration = isRunning ? (isBreakSession ? '10s' : '6s') : '18s';
	const playState = isPaused ? 'paused' : 'running';
	const pulseOpacity = isRunning ? (isBreakSession ? 0.45 : 0.6) : 0.4;
	const accentOpacityA = isBreakSession ? '18' : '22';
	const accentOpacityB = isBreakSession ? '12' : '16';
	const spreadOpacity = isBreakSession ? '08' : '0d';

	return (
		<div className='relative w-full h-full overflow-hidden'>
			<div
				className='absolute inset-0 pointer-events-none'
				style={{
					background: `linear-gradient(155deg, ${getGlowColor(baseOpacity)} 0%, transparent 56%, ${getGlowColor(midOpacity)} 100%)`,
					filter: 'blur(42px)',
					animation: `ambientGradientDrift ${driftDuration} ease-in-out infinite alternate`,
					animationPlayState: playState
				}}
			/>
			<div
				className='absolute -top-[28%] left-1/2 -translate-x-1/2 w-[92%] h-[92%] rounded-full pointer-events-none'
				style={{
					background: `radial-gradient(ellipse at center, ${getGlowColor(accentOpacityA)} 0%, transparent 68%)`,
					filter: 'blur(54px)',
					animation: `ambientGradientPulse ${pulseDuration} ease-in-out infinite`,
					animationPlayState: playState,
					opacity: pulseOpacity,
					mixBlendMode: 'screen'
				}}
			/>
			<div
				className='absolute -bottom-[34%] left-1/2 -translate-x-1/2 w-[88%] h-[88%] rounded-full pointer-events-none'
				style={{
					background: `radial-gradient(ellipse at center, ${getGlowColor(accentOpacityB)} 0%, transparent 70%)`,
					filter: 'blur(58px)',
					animation: `ambientGradientDrift ${isBreakSession ? '38s' : '28s'} ease-in-out infinite alternate-reverse`,
					animationPlayState: playState,
					opacity: isRunning ? 0.85 : 0.65,
					mixBlendMode: 'screen'
				}}
			/>
			<div
				className='absolute inset-0 pointer-events-none'
				style={{
					background: `radial-gradient(circle at 50% 54%, ${getGlowColor(spreadOpacity)} 0%, transparent 72%)`,
					filter: 'blur(30px)',
					opacity: isRunning ? 0.8 : 0.6
				}}
			/>
			<div
				className='absolute inset-0 pointer-events-none'
				style={{
					background: `radial-gradient(circle at 50% 56%, ${getGlowColor('22')} 0%, transparent 68%)`,
					opacity: nearEndUrgency * 0.7,
					animation: 'ambientUrgencyBloom 3.5s ease-in-out infinite',
					animationPlayState: playState
				}}
			/>
		</div>
	);
};

export default GradientBackground;
