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

export { SlidersIcon, PlusIcon, PencilIcon };
