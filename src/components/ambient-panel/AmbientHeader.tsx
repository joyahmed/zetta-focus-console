const SunIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-4 w-4 text-zetta-neon'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
	>
		<path d='M12 2v4' />
		<path d='M12 18v4' />
		<path d='M4.93 4.93l2.83 2.83' />
		<path d='M16.24 16.24l2.83 2.83' />
		<path d='M2 12h4' />
		<path d='M18 12h4' />
		<path d='M4.93 19.07l2.83-2.83' />
		<path d='M16.24 7.76l2.83-2.83' />
	</svg>
);

const AmbientHeader = () => (
	<div className='flex items-center justify-between shrink-0 px-3 py-3 md:px-4 md:py-4 z-10 relative'>
		<div className='flex items-center gap-2'>
			<div className='p-1.5 rounded-lg bg-zetta-bg border border-zetta-border backdrop-blur-md'>
				<SunIcon />
			</div>
			<h2 className='text-sm font-semibold tracking-wide text-zetta-text drop-shadow-sm'>
				AMBIENCE
			</h2>
		</div>
	</div>
);

export default AmbientHeader;
