import Ember from './Ember';
import LightningFlash from './LightningFlash';

/**
 * A summer storm over embers.
 *
 * Summer used to be the one season with no particles at all — a single tinted
 * rectangle, which is why it read as the panel having failed to load. It now
 * carries the two effects that suit heat: sparks rising off the floor, and
 * sheet lightning behind them every twenty seconds or so.
 */
const SummerScene = ({
	embers,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: SummerSceneProps) => (
	<div className='absolute inset-0 overflow-hidden'>
		<LightningFlash
			{...{
				glowColor,
				isPaused,
				period: 19 * speedMultiplier,
				delay: 4
			}}
		/>

		{embers.map(particle => (
			<Ember
				key={particle.id}
				{...{ particle, glowColor, isPaused, isLight, speedMultiplier }}
			/>
		))}
	</div>
);

export default SummerScene;
