import FallingLeaf from './FallingLeaf';

/** Falling leaves. */
const AutumnScene = ({
	leaves,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: AutumnSceneProps) => (
	<div className='absolute inset-0 overflow-hidden'>
		{leaves.map(leaf => (
			<FallingLeaf
				key={leaf.id}
				{...{ leaf, glowColor, isPaused, isLight, speedMultiplier }}
			/>
		))}
	</div>
);

export default AutumnScene;
