interface CircleProps {
	radius: number;
	stroke: string;
	strokeWidth?: number;
	strokeDasharray?: number;
	strokeDashoffset?: number;
	strokeLinecap?: 'round' | 'butt' | 'square';
	className?: string;
	style?: React.CSSProperties;
	gradientId?: string;
}

const Circle = ({
	radius,
	stroke,
	strokeWidth = 4,
	strokeDasharray,
	strokeDashoffset,
	strokeLinecap,
	className,
	style,
	gradientId
}: CircleProps) => {
	// If gradientId is provided, use the gradient
	if (gradientId) {
		return (
			<circle
				cx='100'
				cy='100'
				r={radius}
				fill='none'
				stroke={`url(#${gradientId})`}
				strokeWidth={strokeWidth}
				strokeDasharray={strokeDasharray}
				strokeDashoffset={strokeDashoffset}
				strokeLinecap={strokeLinecap}
				className={className}
				style={style}
			/>
		);
	}

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
};

interface TimerRingProps {
	radius: number;
	circumference: number;
	strokeDashoffset: number;
	isRunning: boolean;
	glowColor: string;
	isStrictMode?: boolean;
}

const TimerRing = ({
	radius,
	circumference,
	strokeDashoffset,
	isRunning,
	glowColor,
	isStrictMode = false
}: TimerRingProps) => {
	const progressStroke = isRunning ? glowColor : 'var(--text-muted)';
	const progressStyle = isRunning
		? { filter: `drop-shadow(0 0 6px ${glowColor})` }
		: {};

	// Use gradient for strict mode
	const gradientId = isStrictMode
		? 'strict-mode-gradient'
		: undefined;

	return (
		<svg
			className='absolute w-full h-full -rotate-90 transform'
			viewBox='0 0 200 200'
		>
			{/* Define gradient for strict mode */}
			{isStrictMode && (
				<defs>
					<linearGradient
						id='strict-mode-gradient'
						x1='0%'
						y1='0%'
						x2='100%'
						y2='100%'
					>
						<stop offset='0%' stopColor='#ef4444' />
						<stop offset='50%' stopColor='#dc2626' />
						<stop offset='100%' stopColor='#b91c1c' />
					</linearGradient>
				</defs>
			)}

			<Circle
				{...{
					radius,
					stroke: 'var(--color-ring-base)'
				}}
			/>

			{/* Only the progress is animated, and only while a session is
			    running.

			    `transition-all` meant the stroke colour and the drop-shadow
			    animated over a full second alongside it, so starting or stopping
			    washed the whole ring through a slow colour change. And because
			    the offset jumps the length of the circle when a session begins
			    or is reset, the transition swept the arc all the way round —
			    twice, once for each change. While idle there is nothing to
			    animate, so it snaps. */}
			<Circle
				{...{
					radius,
					stroke: progressStroke,
					strokeLinecap: 'round',
					strokeDasharray: circumference,
					strokeDashoffset,
					className: isRunning
						? 'transition-[stroke-dashoffset] duration-1000 ease-linear'
						: 'transition-none',
					style: progressStyle,
					gradientId
				}}
			/>
		</svg>
	);
};

export default TimerRing;
