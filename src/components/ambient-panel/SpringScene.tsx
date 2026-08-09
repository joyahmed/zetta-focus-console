import Petal from './Petal';

/** Blossom on the wind. */
const SpringScene = ({
	springParticles,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: SpringSceneProps) => (
	<div className='absolute inset-0 overflow-hidden'>
		{springParticles.map(particle => (
			<Petal
				key={particle.id}
				{...{ particle, glowColor, isPaused, isLight, speedMultiplier }}
			/>
		))}
	</div>
);

export default SpringScene;
