const SpringParticle = ({
	particle,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: SpringParticleProps) => (
	<div
		className={`absolute rounded-full ${isPaused ? 'animation-paused' : ''}`}
		style={{
			left: `${particle.x}%`,
			width: particle.size,
			height: particle.size,
			background: `
				radial-gradient(circle, ${glowColor} 0%, ${glowColor}88 40%, transparent 70%)
			`,
			boxShadow: `0 0 8px ${glowColor}`,
			opacity: isLight ? 0.7 : particle.opacity,
			willChange: isPaused ? 'auto' : 'transform, opacity',
			animation: isPaused
				? 'none'
				: `drift ${particle.duration * speedMultiplier}s ease-in-out ${particle.delay}s infinite`
		}}
	/>
);

export default SpringParticle;
