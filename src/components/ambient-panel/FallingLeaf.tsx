/**
 * One leaf, falling and turning as it goes.
 *
 * The turn is part of `leafFall` rather than a second animation: two
 * animations on one element both writing `transform` do not compose — the last
 * one declared takes the property outright, which is why these used to spin on
 * the spot and never fall. How far it turns comes from the leaf, so no two
 * tumble alike.
 */
const FallingLeaf = ({
	leaf,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: FallingLeafProps) => {
	const spin = 360 + Math.round(leaf.rotation);

	return (
		<div
			className='absolute'
			style={
				{
					left: `${leaf.x}%`,
					top: 0,
					fontSize: leaf.size,
					lineHeight: 1,
					'--particle-opacity': isLight ? 1 : leaf.opacity,
					color: glowColor,
					textShadow: `0 0 6px ${glowColor}66`,
					'--leaf-spin': `${spin}deg`,
					'--leaf-spin-half': `${Math.round(spin / 2)}deg`,
					willChange: isPaused ? 'auto' : 'transform, opacity',
					animation: `leafFall ${leaf.duration * speedMultiplier}s ease-in-out ${leaf.delay}s infinite`,
					animationFillMode: 'backwards',
					animationPlayState: isPaused ? 'paused' : 'running'
				} as React.CSSProperties
			}
		>
			🍂
		</div>
	);
};

export default FallingLeaf;
