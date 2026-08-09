/** The panel's icons share one stroked 24x24 box; only the geometry differs. */
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

const SlidersIcon = ({ className }: IconProps) => (
	<StrokeIcon {...{ className }}>
		<line x1='4' y1='21' x2='4' y2='14' />
		<line x1='4' y1='10' x2='4' y2='3' />
		<line x1='12' y1='21' x2='12' y2='12' />
		<line x1='12' y1='8' x2='12' y2='3' />
		<line x1='20' y1='21' x2='20' y2='16' />
		<line x1='20' y1='12' x2='20' y2='3' />
		<line x1='1' y1='14' x2='7' y2='14' />
		<line x1='9' y1='8' x2='15' y2='8' />
		<line x1='17' y1='16' x2='23' y2='16' />
	</StrokeIcon>
);

const PlusIcon = ({ className }: IconProps) => (
	<StrokeIcon {...{ className }}>
		<path d='M12 4v16m8-8H4' />
	</StrokeIcon>
);

const PencilIcon = ({ className }: IconProps) => (
	<StrokeIcon {...{ className }}>
		<path d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
	</StrokeIcon>
);

const CopyIcon = ({ className }: IconProps) => (
	<StrokeIcon {...{ className }}>
		<rect x='9' y='9' width='11' height='11' rx='2' />
		<path d='M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1' />
	</StrokeIcon>
);

const TrashIcon = ({ className }: IconProps) => (
	<StrokeIcon {...{ className }}>
		<path d='M3 6h18' />
		<path d='M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2' />
		<path d='M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6' />
		<line x1='10' y1='11' x2='10' y2='17' />
		<line x1='14' y1='11' x2='14' y2='17' />
	</StrokeIcon>
);

export { SlidersIcon, PlusIcon, PencilIcon, CopyIcon, TrashIcon };
