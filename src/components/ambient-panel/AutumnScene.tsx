import FallingLeaf from './FallingLeaf';


const AutumnScene = ({
	leaves,
	glowColor,
	isPaused,
	isLight,
	speedMultiplier
}: AutumnSceneProps) => {
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
			{leaves.map((leaf) => (
				<FallingLeaf
					key={leaf.id}
					{...{
						leaf,
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

export default AutumnScene;
