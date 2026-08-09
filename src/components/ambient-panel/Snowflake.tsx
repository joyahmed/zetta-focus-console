interface SnowflakeProps {
	particle: Particle;
	glowColor: string;
	isPaused: boolean;
	isLight: boolean;
	speedMultiplier: number;
}

const Snowflake = ({
	particle,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: SnowflakeProps) => (
	<div
		className={`absolute rounded-full ${isPaused ? 'animation-paused' : ''}`}
		style={{
			left: `${particle.x}%`,
			width: particle.size,
			height: particle.size,
			background: `
				radial-gradient(circle at 30% 30%, #ffffff 0%, #ffffffcc 40%, #ffffff66 70%, transparent 100%)
			`,
			boxShadow: `0 0 6px ${glowColor}`,
			opacity: isLight ? 0.7 : particle.opacity,
			// Promote to its own compositor layer. Without this the browser is
			// free to repaint the glow on every frame, which at 4K is the
			// difference between the scene costing nothing and costing the
			// whole frame budget.
			willChange: isPaused ? 'auto' : 'transform, opacity',
			animation: isPaused
				? 'none'
				: `snowfall ${particle.duration * speedMultiplier}s linear ${particle.delay}s infinite`
		}}
	/>
);

export default Snowflake;
