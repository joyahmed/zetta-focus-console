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
			isRunning ? 'opacity-[0.09]' : 'opacity-0'
		}`}
		style={{
			// Half the opacity, and stopped well short of the panel edge.
			//
			// At 20% out to 70% this was not a glow behind the ring so much as
			// a blue wash over the whole panel — it reached the border on every
			// side and lifted the diagnostics text sitting near it. The ring
			// carries its own drop-shadow; this is only the bloom around it.
			background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 48%)`
		}}
	/>
);

export default TimerBackground;
