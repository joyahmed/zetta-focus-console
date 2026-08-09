const SummerScene = ({ glowColor, isLight }: SummerSceneProps) => {
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
		</div>
	);
};

export default SummerScene;
