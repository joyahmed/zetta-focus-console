import { PauseIcon, PlayIcon, RefreshIcon, StopIcon } from './icons';

const ControlButton = ({
	onClick,
	title,
	variant,
	children,
	disabled = false
}: ControlButtonProps) => {
	const baseStyles =
		'h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95';

	const variantStyles = {
		primary:
			'border-2 border-zetta-neon-secondary bg-zetta-neon-secondary/10 text-zetta-neon-secondary shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:bg-zetta-neon-secondary/20 hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]',
		secondary:
			'border border-zetta-border bg-zetta-card text-zetta-text backdrop-blur-sm hover:bg-zetta-text/5 hover:border-zetta-text/20',
		danger:
			'border border-red-500/30 bg-red-500/10 text-red-500 backdrop-blur-sm hover:bg-red-500/20 hover:border-red-500/50'
	};

	const disabledStyles =
		'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100';

	return (
		<button
			onClick={onClick}
			className={`${baseStyles} ${variantStyles[variant]} ${disabled ? disabledStyles : ''}`}
			title={title}
			disabled={disabled}
		>
			{children}
		</button>
	);
};


const TimerControls = ({
	status,
	onStart,
	onPause,
	onResume,
	onStop,
	isStrictModeBlocking = false
}: TimerControlsProps) => {
	// When strict mode is blocking, show only the stop button as disabled
	// and show a tooltip explaining why
	return (
		<div className='flex items-center justify-center gap-6 h-20 shrink-0 z-10'>
			{status === 'idle' && (
				<ControlButton
					{...{
						onClick: onStart,
						title: 'Start Focus',
						variant: 'primary'
					}}
				>
					<PlayIcon className='h-8 w-8 ml-1' />
				</ControlButton>
			)}

			{status === 'running' && (
				<ControlButton
					{...{
						onClick: onPause,
						title: isStrictModeBlocking
							? 'Pause disabled in Strict Mode'
							: 'Pause',
						variant: 'secondary',
						disabled: isStrictModeBlocking
					}}
				>
					<PauseIcon />
				</ControlButton>
			)}

			{(status === 'paused' || status === 'completed') && (
				<>
					<ControlButton
						{...{
							onClick: status === 'completed' ? onStart : onResume,
							title: status === 'completed' ? 'Restart' : 'Resume',
							variant: 'primary'
						}}
					>
						{status === 'completed' ? (
							<RefreshIcon />
						) : (
							<PlayIcon className='h-8 w-8 ml-1' />
						)}
					</ControlButton>

					{status === 'paused' && (
						<ControlButton
							{...{
								onClick: onStop,
								title: 'Stop',
								variant: 'danger'
							}}
						>
							<StopIcon />
						</ControlButton>
					)}
				</>
			)}

			{/* Strict Mode blocker overlay - shows when blocking */}
			{isStrictModeBlocking && status === 'running' && (
				<div className='absolute bottom-20 text-xs text-red-400 opacity-70'>
					Strict Mode: Session cannot be paused or stopped
				</div>
			)}
		</div>
	);
};

export default TimerControls;
