/**
 * Northern lights, in the profile's own colour.
 *
 * This replaces a stack of five blurred radial washes that, on a #050510
 * panel, read as a faint tint and nothing more — colours rather than a scene.
 * Ribbons have shape and direction, so they are legible as something even at
 * low opacity, and they are still only transforms on the compositor.
 *
 * Each band is a wide, short element with a soft horizontal falloff, curved by
 * its own border radius and blurred once. Hue is rotated per ribbon so the
 * bands separate from each other instead of reading as one smear.
 */
const RIBBONS: AuroraRibbon[] = [
	{
		key: 'a',
		top: '-14%',
		height: '52%',
		hueShift: 0,
		blur: 34,
		opacity: 0.55,
		sweep: 'auroraSweepA',
		speed: 1
	},
	{
		key: 'b',
		top: '8%',
		height: '44%',
		hueShift: 42,
		blur: 44,
		opacity: 0.4,
		sweep: 'auroraSweepB',
		speed: 1.45
	},
	{
		key: 'c',
		top: '30%',
		height: '48%',
		hueShift: -34,
		blur: 54,
		opacity: 0.3,
		sweep: 'auroraSweepC',
		speed: 1.9
	}
];

const AuroraBackground = ({
	glowColor,
	isLight,
	timer
}: AuroraBackgroundProps) => {
	const isRunning = timer.status === 'running';
	const isPaused = timer.status === 'paused';
	const isBreakSession =
		timer.session_type === 'short_break' ||
		timer.session_type === 'long_break';

	const progress =
		timer.total_seconds > 0
			? (timer.total_seconds - timer.remaining_seconds) / timer.total_seconds
			: 0;
	const clamped = Math.max(0, Math.min(1, progress));

	// The last fifth of a focus session brightens the sky. Not on breaks —
	// nothing about a break should feel like it is running out.
	const urgency = isRunning && !isBreakSession ? Math.max(0, (clamped - 0.8) / 0.2) : 0;

	const playState = isPaused ? 'paused' : 'running';

	// A break is the same sky, slower and calmer; idle is slower still.
	const tempo = isRunning ? (isBreakSession ? 1.6 : 1) : 2.2;
	const lift = isRunning ? (isBreakSession ? 0.8 : 1) : 0.7;

	return (
		<div className='absolute inset-0 overflow-hidden'>
			{RIBBONS.map(ribbon => (
				<div
					key={ribbon.key}
					className='absolute left-[-30%] w-[160%] rounded-[50%] pointer-events-none'
					style={
						{
							top: ribbon.top,
							height: ribbon.height,
							background: `linear-gradient(100deg, transparent 0%, ${glowColor}00 10%, ${glowColor}${isLight ? '55' : '7a'} 38%, ${glowColor}${isLight ? '3a' : '55'} 64%, ${glowColor}00 90%, transparent 100%)`,
							filter: `blur(${ribbon.blur}px) hue-rotate(${ribbon.hueShift}deg) saturate(1.35)`,
							mixBlendMode: isLight ? 'multiply' : 'screen',
							'--ribbon-opacity': ribbon.opacity * lift * (1 + urgency * 0.6),
							animation: `${ribbon.sweep} ${Math.round(26 * ribbon.speed * tempo)}s ease-in-out infinite alternate, auroraBreathe ${Math.round(11 * ribbon.speed * tempo)}s ease-in-out infinite`,
							animationPlayState: playState
						} as React.CSSProperties
					}
				/>
			))}

			{/* The glow the ribbons cast on the horizon. Without it they float,
			    and the bottom third of the panel stays flatly empty. */}
			<div
				className='absolute inset-x-0 bottom-0 h-1/3 pointer-events-none'
				style={{
					background: `linear-gradient(to top, ${glowColor}${isLight ? '22' : '2e'} 0%, transparent 100%)`,
					filter: 'blur(26px)',
					opacity: isRunning ? 0.9 : 0.6
				}}
			/>
		</div>
	);
};

export default AuroraBackground;
