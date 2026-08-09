import { getSeasonEmoji } from '../../utils/profile';
import LightningFlash from './LightningFlash';
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
 */
const SeasonScene = ({
	season,
	particles,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: SeasonSceneProps) => {
	const icon = getSeasonEmoji(season);
	const rises = RISING_SEASONS.includes(season);

	return (
		<div className='absolute inset-0 overflow-hidden'>
			{/* Summer keeps its weather. Lightning is not a particle — it is the
			    sky behind them — so it stays its own thing. */}
			{season === 'summer' && (
				<LightningFlash
					{...{
						glowColor,
						isPaused,
						period: 19 * speedMultiplier,
						delay: 4
					}}
				/>
			)}

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
