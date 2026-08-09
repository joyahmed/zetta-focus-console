interface IconProps {
	className?: string;
}

const PlayIcon = ({ className = 'h-8 w-8' }: IconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		viewBox='0 0 24 24'
		fill='currentColor'
	>
		<path d='M8 5v14l11-7z' />
	</svg>
);

const PauseIcon = ({ className = 'h-8 w-8' }: IconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		viewBox='0 0 24 24'
		fill='currentColor'
	>
		<path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z' />
	</svg>
);

const RefreshIcon = ({ className = 'h-8 w-8' }: IconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		viewBox='0 0 24 24'
		fill='currentColor'
	>
		<path d='M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' />
	</svg>
);

const StopIcon = ({ className = 'h-6 w-6' }: IconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		viewBox='0 0 24 24'
		fill='currentColor'
	>
		<path d='M6 6h12v12H6z' />
	</svg>
);

export { PlayIcon, PauseIcon, RefreshIcon, StopIcon };
