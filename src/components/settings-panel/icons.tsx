/** The three glyphs the settings drawer needs, drawn the same way. */
const StrokeIcon = ({ children, className = 'h-4 w-4' }: StrokeIconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
		strokeWidth={2}
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		{children}
	</svg>
);

export const BellIcon = () => (
	<StrokeIcon>
		<path d='M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
	</StrokeIcon>
);

export const PlayIcon = () => (
	<StrokeIcon>
		<path d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' />
		<path d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
	</StrokeIcon>
);

export const StopIcon = () => (
	<StrokeIcon>
		<path d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
		<path d='M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' />
	</StrokeIcon>
);
