import { lazy, Suspense } from 'react';
import { useTimerPanel } from '../hooks/use-timer-panel';
const TimerBackground = lazy(
	() => import('./timer-panel/TimerBackground')
);
const TimerRing = lazy(() => import('./timer-panel/TimerRing'));
const TimerDisplay = lazy(() => import('./timer-panel/TimerDisplay'));
const TimerControls = lazy(
	() => import('./timer-panel/TimerControls')
);

const RADIUS = 90;

/** Minutes offered as one-click sessions. Short first — the whole point is
    the runs the profile durations do not cover. */
const QUICK_DURATIONS = [5, 15, 25, 50];

// Red color for Strict Mode
const STRICT_MODE_COLOR = '#ef4444';

export default function TimerPanel({
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
	theme: _theme = 'dark'
}: TimerPanelProps) {
	const { hasOverride, circumference, strokeDashoffset, formatTime } =
		useTimerPanel({
			timer,
			sessionOverride
		});

	const isRunning = timer.status === 'running';
	const formattedTime = formatTime(timer.remaining_seconds);

	// Determine effective glow color - use red when strict mode is active and running
	const effectiveGlowColor =
		strictMode?.is_active && isRunning
			? STRICT_MODE_COLOR
			: glowColor;

	// Check if strict mode is blocking controls
	const isStrictModeBlocking = strictMode?.is_active && isRunning;

	return (
		<div className='panel h-full p-6 flex flex-col items-center justify-center gap-1 relative overflow-hidden group'>
			{/* Strict Mode indicator */}
			{strictMode?.is_active && (
				<div className='absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/40'>
					<div className='w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse' />
					<span className='text-xs font-medium text-red-400'>
						Strict
					</span>
				</div>
			)}

			<Suspense fallback={null}>
				<TimerBackground
					{...{
						isRunning,
						glowColor: effectiveGlowColor
					}}
				/>
			</Suspense>

			{/* Session type, above the circle rather than inside it. In normal
			    flow with a height of its own, so the ring sizes around it
			    instead of into it. */}
			<div className='flex items-center justify-center h-5 shrink-0'>
				<span className='text-[10px] font-bold uppercase tracking-[0.2em] text-zetta-text-muted whitespace-nowrap'>
					{timer.session_type.replace('_', ' ')}
				</span>
			</div>

			{/* The ring takes whatever height is left after the fixed rows, and
			    derives its width from that. Sizing it by width instead meant a
			    short, wide panel asked for a circle taller than the space it had
			    — `overflow-hidden` then cut the top off, taking the session
			    label with it. Height is the scarce axis here, so height decides. */}
			<div className='flex-1 min-h-0 w-full flex items-center justify-center my-2'>
				<div className='relative h-full max-h-64 aspect-square min-h-[9rem] flex items-center justify-center'>
					<Suspense fallback={null}>
						<TimerRing
							{...{
								radius: RADIUS,
								circumference,
								strokeDashoffset,
								isRunning,
								glowColor: effectiveGlowColor,
								isStrictMode: strictMode?.is_active && isRunning
							}}
						/>
					</Suspense>

					{/* Inside the circle: the clock, position in the cycle, and any
				    override. Stacked rather than positioned at percentages, so
				    nothing needs nudging when a row appears or disappears — the
				    override row keeps its height either way. */}
					<div className='absolute inset-0 z-10 flex flex-col items-center justify-center px-[12%]'>
						<Suspense fallback={null}>
							<TimerDisplay
								{...{
									formattedTime,
									isRunning,
									glowColor: effectiveGlowColor
								}}
							/>
						</Suspense>

						<div className='flex items-center h-5 mt-1'>
							<span className='text-[10px] font-medium uppercase tracking-wider text-zetta-text-muted/70 whitespace-nowrap'>
								Session {timer.current_session}/{timer.total_sessions}
							</span>
						</div>

						<div className='flex items-center h-6'>
							{hasOverride && (
								<span className='px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/20 whitespace-nowrap'>
									Override
								</span>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Task display */}
			{currentTask && currentTask.title && isRunning && (
				<div className='mb-4 px-3 py-2 rounded-lg bg-zetta-bg/50 border border-zetta-border/50 backdrop-blur-sm'>
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

			<Suspense fallback={null}>
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
			</Suspense>

			{/* Quick durations.
			    Until now the only way to run anything other than the profile's
			    25 minutes was `timer 5m` in the terminal, or building a whole
			    custom profile for it. A five-minute session is not a profile.

			    The row keeps its height whether or not it has anything in it.
			    It only appears while idle, and if it collapsed on start the
			    ring would resize under the cursor every time you pressed play. */}

			<div className='relative z-10 flex items-center justify-center gap-2 h-[4.5rem] shrink-0'>
				{onQuickStart && timer.status === 'idle' && (
					<div className='flex flex-col gap-2'>
						<div className='flex gap-2'>
							{QUICK_DURATIONS.map(minutes => (
								<button
									key={minutes}
									onClick={() => onQuickStart(minutes)}
									title={`Start a ${minutes} minute session`}
									style={{
										['--chip-glow' as string]: effectiveGlowColor
									}}
									className='px-3 py-1.5 text-xs font-mono rounded-lg border transition-all duration-200
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
						</div>
						<span className='text-[10px] uppercase tracking-wider text-zetta-text-muted mr-0.5 text-center font-bold'>
							Quick
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
