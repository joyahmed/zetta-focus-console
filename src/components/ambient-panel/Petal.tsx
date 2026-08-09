/** Blossom. An oval rather than a dot, and it tumbles as it falls — spring was
    drawing the same round speck as winter, in a different colour. */
const Petal = ({
	particle,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: PetalProps) => (
	<div
		className='absolute'
		style={
			{
			left: `${particle.x}%`,
			width: particle.size * 2.4,
			height: particle.size * 1.5,
			borderRadius: '60% 40% 55% 45% / 65% 60% 40% 35%',
			background: `linear-gradient(135deg, #ffffffdd 0%, ${glowColor} 60%, ${glowColor}88 100%)`,
			boxShadow: `0 0 6px ${glowColor}66`,
			'--particle-opacity': isLight ? 0.75 : particle.opacity,
			willChange: isPaused ? 'auto' : 'transform, opacity',
			animation: `petalFall ${particle.duration * speedMultiplier}s ease-in-out ${particle.delay}s infinite`,
			animationFillMode: 'backwards',
			animationPlayState: isPaused ? 'paused' : 'running'
			} as React.CSSProperties
		}
	/>
);

export default Petal;
