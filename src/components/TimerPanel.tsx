import { useTimerPanel } from '../hooks/use-timer-panel';
import {
	TimerBackground,
	TimerControls,
	TimerDisplay,
	TimerRing
} from './timer-panel';

/** Minutes offered as one-click sessions. Short first — the whole point is
    the runs the profile durations do not cover. */
const QUICK_DURATIONS = [5, 15, 25, 50];

const TimerPanel = ({
	timer,
	glowColor,
	sessionOverride,
	strictMode,
	currentTask,
	onStart,
	onPause,
	onResume,
	onStop,
	onQuickStart,
	onDurationChange,
	theme: _theme = 'dark'
}: TimerPanelProps) => {
	const {
		radius,
		circumference,
		strokeDashoffset,
		isRunning,
		showsCycle,
		formattedTime,
		hasOverride,
		isStrictModeBlocking,
		effectiveGlowColor
	} = useTimerPanel({ timer, sessionOverride, glowColor, strictMode });

	return (
		<div className='panel h-full p-6 flex flex-col items-center justify-center gap-1 relative overflow-hidden group'>
			{/* Strict Mode indicator */}
			{strictMode?.is_active && (
				<div className='absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/40'>
					<div className='w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse' />
					<span className='text-xs font-medium text-zetta-danger'>Strict</span>
				</div>
			)}

			<TimerBackground
				{...{ isRunning, glowColor: effectiveGlowColor }}
			/>

			{/* The ring takes whatever height is left after the fixed rows, and
			    derives its width from that. Sizing it by width instead meant a
			    short, wide panel asked for a circle taller than the space it had
			    — `overflow-hidden` then cut the top off, taking the session
			    label with it. Height is the scarce axis here, so height decides. */}
			<div className='shrink-0 w-full flex items-center justify-center my-2'>
				{/* Label and circle are one group with a tight gap, so the label
				    stays attached to the ring instead of drifting toward the top
				    of the panel as the available height changes. */}
				<div className='flex flex-col items-center gap-1.5'>
					<span className='text-[10px] font-bold uppercase tracking-[0.2em] text-zetta-text-muted whitespace-nowrap shrink-0'>
						{timer.session_type.replace('_', ' ')}
					</span>

					<div className='relative h-[clamp(9rem,26dvh,16rem)] aspect-square shrink-0 flex items-center justify-center'>
						<TimerRing
							{...{
								radius,
								circumference,
								strokeDashoffset,
								isRunning,
								glowColor: effectiveGlowColor,
								isStrictMode: isStrictModeBlocking
							}}
						/>

						{/* Just the clock inside the circle now. */}
						<div className='absolute inset-0 z-10 flex flex-col items-center justify-center px-[12%]'>
							<TimerDisplay
								{...{
									formattedTime,
									isRunning,
									glowColor: effectiveGlowColor,
									canEdit: timer.status === 'idle',
									onDurationChange
								}}
							/>
						</div>
					</div>

					{/* Cycle position and override, below the circle rather than
					    crowded inside it. Both rows keep their height whether or
					    not they have anything to say, so the circle above them
					    does not move when an override is set, cleared, or when a
					    one-off run drops the counter entirely. */}
					<div className='flex items-center h-5 shrink-0'>
						{showsCycle && (
							<span className='text-[10px] font-medium uppercase tracking-wider text-zetta-text-muted/70 whitespace-nowrap'>
								Session {timer.current_session}/
								{timer.total_sessions}
							</span>
						)}
					</div>

					<div className='flex items-center h-6 shrink-0'>
						{hasOverride && (
							<span className='px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/20 whitespace-nowrap'>
								Override
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Quick durations, pinned to the right edge of the panel.
			    Height is the scarce axis here — every clipping problem this panel
			    has had was vertical — so the one row that need not sit under the
			    timer moves off that axis. Taken out of the flow entirely rather
			    than made a flex column: in the row it competed with the circle
			    for width, and on a narrow window the two of them together
			    overflowed and the chips ended up on top of the ring. Absolute,
			    it cannot affect the circle's size or centring at all. */}
			<div className='absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 flex flex-col items-center gap-2'>
				{onQuickStart && timer.status === 'idle' && (
					<>
						<span className='text-[9px] uppercase tracking-wider text-zetta-text-muted font-bold'>
							Quick
						</span>
						{QUICK_DURATIONS.map(minutes => (
							<button
								key={minutes}
								onClick={() => onQuickStart(minutes)}
								title={`Start a ${minutes} minute session`}
								style={{
									['--chip-glow' as string]: effectiveGlowColor
								}}
								className='w-full py-1.5 text-xs font-mono rounded-lg border transition-all duration-200
									border-[color-mix(in_srgb,var(--chip-glow)_35%,transparent)]
									bg-[color-mix(in_srgb,var(--chip-glow)_10%,transparent)]
									text-zetta-text
									shadow-[0_0_10px_-2px_color-mix(in_srgb,var(--chip-glow)_45%,transparent)]
									hover:bg-[color-mix(in_srgb,var(--chip-glow)_22%,transparent)]
									hover:border-[color-mix(in_srgb,var(--chip-glow)_70%,transparent)]
									hover:shadow-[0_0_16px_-1px_color-mix(in_srgb,var(--chip-glow)_65%,transparent)]
									active:scale-95'
							>
								{minutes}m
							</button>
						))}
					</>
				)}
			</div>

			{/* Task display */}
			{currentTask && currentTask.title && isRunning && (
				<div className='mb-4 px-3 py-2 rounded-lg bg-zetta-panel border border-zetta-border backdrop-blur-sm'>
					<div className='flex items-center gap-2 text-sm'>
						<span
							className={`px-1.5 py-0.5 rounded text-xs font-medium ${
								currentTask.category === 'coding'
									? 'bg-blue-500/20 text-blue-400'
									: 'bg-purple-500/20 text-purple-400'
							}`}
						>
							{currentTask.category}
						</span>
						<span className='text-zetta-text-secondary'>
							{currentTask.title}
						</span>
					</div>
				</div>
			)}

			<TimerControls
				{...{
					status: timer.status,
					onStart,
					onPause,
					onResume,
					onStop,
					isStrictModeBlocking
				}}
			/>
		</div>
	);
};

export default TimerPanel;
