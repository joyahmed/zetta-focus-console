/**
 * Every icon this panel draws is the same 24x24 stroked box — only the shapes
 * inside differ — so the svg itself is written once and each icon is just its
 * geometry.
 */
const StrokeIcon = ({ className, children }: StrokeIconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		{children}
	</svg>
);

const ChartIcon = ({ className }: IconProps) => (
	<StrokeIcon {...{ className }}>
		<path d='M3 3v18h18' />
		<path d='M18.7 8l-5.1 5.2-2.8-2.7L7 14.3' />
	</StrokeIcon>
);

const ClockIcon = ({ className }: IconProps) => (
	<StrokeIcon {...{ className }}>
		<circle cx='12' cy='12' r='10' />
		<polyline points='12 6 12 12 16 14' />
	</StrokeIcon>
);

const BoltIcon = ({ className }: IconProps) => (
	<StrokeIcon {...{ className }}>
		<path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z' />
	</StrokeIcon>
);

const FlameIcon = ({ className }: IconProps) => (
	<StrokeIcon {...{ className }}>
		<path d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
		<path d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
	</StrokeIcon>
);

const BarsIcon = ({ className }: IconProps) => (
	<StrokeIcon {...{ className }}>
		<path d='M12 20v-6M6 20V10M18 20V4' />
	</StrokeIcon>
);

export { ChartIcon, ClockIcon, BoltIcon, FlameIcon, BarsIcon };
