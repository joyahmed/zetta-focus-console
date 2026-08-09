import { getSeasonEmoji } from '../../utils/profile';
import SeasonParticle from './SeasonParticle';

/** Summer's icon rises off the heat; everything else falls. */
const RISING_SEASONS: Profile['season'][] = ['summer'];

/**
 * The whole ambience: the profile's icon, many times over.
 *
 * This replaces four near-identical scene components and four near-identical
 * particle components — snowflake, petal, leaf and ember — which between them
 * differed in a shape, a direction and a set of durations. All four are the
 * same idea, so they are one component and a table.
 *
 * Summer briefly had sheet lightning behind its particles. It went the same way
 * as the aurora and for the same reason: a full-panel gradient that flashed
 * every thirteen seconds is a full-panel gradient, whatever it is called, and
 * on a dark panel it read as the wash that had just been taken out. Particles
 * are the ambience — that is the whole rule.
 */
const SeasonScene = ({
	season,
	particles,
	isPaused,
	isLight,
	speedMultiplier
}: SeasonSceneProps) => {
	const icon = getSeasonEmoji(season);
	const rises = RISING_SEASONS.includes(season);

	return (
		<div className='absolute inset-0 overflow-hidden'>
			{particles.map(particle => (
				<SeasonParticle
					key={particle.id}
					{...{
						icon,
						particle,
						rises,
						isPaused,
						isLight,
						speedMultiplier
					}}
				/>
			))}
		</div>
	);
};

export default SeasonScene;
