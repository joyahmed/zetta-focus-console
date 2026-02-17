interface CircleProps {
	radius: number;
	stroke: string;
	strokeWidth?: number;
	strokeDasharray?: number;
	strokeDashoffset?: number;
	strokeLinecap?: 'round' | 'butt' | 'square';
	className?: string;
	style?: React.CSSProperties;
}

const Circle = ({
	radius,
	stroke,
	strokeWidth = 4,
	strokeDasharray,
	strokeDashoffset,
	strokeLinecap,
	className,
	style
}: CircleProps) => {
	return (
		<circle
			cx='100'
			cy='100'
			r={radius}
			fill='none'
			stroke={stroke}
			strokeWidth={strokeWidth}
			strokeDasharray={strokeDasharray}
			strokeDashoffset={strokeDashoffset}
			strokeLinecap={strokeLinecap}
			className={className}
			style={style}
		/>
	);
}

interface TimerRingProps {
	radius: number;
	circumference: number;
	strokeDashoffset: number;
	isRunning: boolean;
	glowColor: string;
}

const TimerRing = ({
	radius,
	circumference,
	strokeDashoffset,
	isRunning,
	glowColor
}: TimerRingProps) => {
	const progressStroke = isRunning ? glowColor : 'var(--text-muted)';
	const progressStyle = isRunning
		? { filter: `drop-shadow(0 0 6px ${glowColor})` }
		: {};

	return (
		<svg
			className='absolute w-full h-full -rotate-90 transform'
			viewBox='0 0 200 200'
		>
			<Circle
				{...{
					radius,
					stroke: 'var(--color-ring-base)'
				}}
			/>

			<Circle
				{...{
					radius,
					stroke: progressStroke,
					strokeLinecap: 'round',
					strokeDasharray: circumference,
					strokeDashoffset,
					className: 'transition-all duration-1000 ease-linear',
					style: progressStyle
				}}
			/>
		</svg>
	);
}

export default TimerRing;
