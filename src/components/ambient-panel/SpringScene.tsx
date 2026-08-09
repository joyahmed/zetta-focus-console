import SpringParticle from './SpringParticle';


const SpringScene = ({
	springParticles,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: SpringSceneProps) => {
	const baseOpacity = isLight ? '25' : '08';
	const midOpacity = isLight ? '10' : '03';

	return (
		<div className='relative w-full h-full overflow-hidden'>
			<div
				className='absolute inset-0'
				style={{
					background: `linear-gradient(135deg, ${glowColor}${baseOpacity} 0%, transparent 60%, ${glowColor}${midOpacity} 100%)`
				}}
			/>
			{springParticles.map((particle) => (
				<SpringParticle
					key={particle.id}
					{...{
						particle,
						glowColor,
						isPaused,
						isLight,
						speedMultiplier
					}}
				/>
			))}
		</div>
	);
};

export default SpringScene;
