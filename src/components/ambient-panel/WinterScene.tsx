import Snowflake from './Snowflake';

/** Snowfall. */
const WinterScene = ({
	snowParticles,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: WinterSceneProps) => (
	<div className='absolute inset-0 overflow-hidden'>
		{snowParticles.map(particle => (
			<Snowflake
				key={particle.id}
				{...{ particle, glowColor, isPaused, isLight, speedMultiplier }}
			/>
		))}
	</div>
);

export default WinterScene;
