interface GradientBackgroundProps {
	glowColor: string;
	isLight: boolean;
}

const GradientBackground = ({
	glowColor,
	isLight
}: GradientBackgroundProps) => {
	const getGlowColor = (opacity: string) =>
		isLight ? glowColor : glowColor + opacity;

	const baseOpacity = isLight ? '30' : '10';
	const midOpacity = isLight ? '15' : '05';

	return (
		<div className='relative w-full h-full overflow-hidden'>
			<div
				className='absolute inset-0 pointer-events-none'
				style={{
					background: `
						radial-gradient(circle at 30% 20%, ${getGlowColor('25')} 0%, transparent 40%),
						radial-gradient(circle at 80% 80%, ${getGlowColor('15')} 0%, transparent 50%)
					`,
					filter: 'blur(60px)'
				}}
			/>
			<div
				className='absolute inset-0'
				style={{
					background: `linear-gradient(135deg, ${getGlowColor(baseOpacity)} 0%, transparent 60%, ${getGlowColor(midOpacity)} 100%)`
				}}
			/>
		</div>
	);
};

export default GradientBackground;
