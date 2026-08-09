const FallingLeaf = ({
	leaf,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: FallingLeafProps) => (
	<div
		className={`absolute ${isPaused ? 'animation-paused' : ''}`}
		style={{
			left: `${leaf.x}%`,
			top: '-20px',
			fontSize: leaf.size,
			opacity: isLight ? 1.0 : leaf.opacity,
			color: glowColor,
			willChange: isPaused ? 'auto' : 'transform, opacity',
			animation: isPaused
				? 'none'
				: `leafFall ${leaf.duration * speedMultiplier}s ease-in-out ${leaf.delay}s infinite, leafRotate ${leaf.rotationDuration}s linear ${leaf.delay}s infinite`
		}}
	>
		🍂
		<div
			className='absolute bottom-0 left-0 right-0 h-12'
			style={{
				background: `linear-gradient(to top, ${glowColor}, transparent)`,
				opacity: isLight ? 0.2 : 0.2
			}}
		/>
	</div>
);

export default FallingLeaf;
