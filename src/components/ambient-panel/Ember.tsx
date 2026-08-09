/** A spark rising off an unseen fire, cooling from white through the profile's
    colour as it climbs. Sizes and drifts come from the particle so no two take
    the same path. */
const Ember = ({
	particle,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: EmberProps) => (
	<div
		className='absolute rounded-full'
		style={
			{
				left: `${particle.x}%`,
				// Embers start at the floor and rise, which is the one effect
				// here that does not fall.
				bottom: 0,
				width: particle.size,
				height: particle.size,
				background: `radial-gradient(circle at 50% 40%, #fff6e0 0%, ${glowColor} 55%, ${glowColor}00 100%)`,
				boxShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}80`,
				'--particle-opacity': isLight ? 0.55 : particle.opacity,
				'--ember-drift': `${particle.drift}px`,
				willChange: isPaused ? 'auto' : 'transform, opacity',
				animation: `emberRise ${particle.duration * speedMultiplier}s ease-out ${particle.delay}s infinite`,
				animationFillMode: 'backwards',
				animationPlayState: isPaused ? 'paused' : 'running'
			} as React.CSSProperties
		}
	/>
);

export default Ember;
