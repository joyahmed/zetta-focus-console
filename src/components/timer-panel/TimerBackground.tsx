interface TimerBackgroundProps {
	isRunning: boolean;
	glowColor: string;
}

/**
 * The glow behind the ring.
 *
 * The gradient is always painted and only its opacity changes. Swapping
 * `background` between a gradient and `none` cannot be transitioned — there is
 * nothing to interpolate — so the glow used to pop in and out the instant a
 * session started or stopped, while `transition-opacity` sat there doing
 * nothing on an opacity that never moved.
 */
const TimerBackground = ({ isRunning, glowColor }: TimerBackgroundProps) => (
	<div
		className={`absolute inset-0 transition-opacity duration-700 ease-out pointer-events-none ${
			isRunning ? 'opacity-20' : 'opacity-0'
		}`}
		style={{
			background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`
		}}
	/>
);

export default TimerBackground;
