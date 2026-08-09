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
			animation: isPaused
				? 'none'
				: `snowfall ${particle.duration * speedMultiplier}s linear ${particle.delay}s infinite`
		}}
	/>
);

export default Snowflake;
