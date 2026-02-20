import { lazy, Suspense } from 'react';
import { useTimerPanel } from '../hooks/use-timer-panel';
const TimerBackground = lazy(
	() => import('./timer-panel/TimerBackground')
);
const SessionIndicator = lazy(
	() => import('./timer-panel/SessionIndicator')
);
const TimerRing = lazy(() => import('./timer-panel/TimerRing'));
const TimerDisplay = lazy(() => import('./timer-panel/TimerDisplay'));
const TimerControls = lazy(
	() => import('./timer-panel/TimerControls')
);

const RADIUS = 90;

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
		<div className='glass-panel h-full rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group'>
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

			<Suspense fallback={null}>
				<SessionIndicator
					{...{
						sessionType: timer.session_type,
						hasOverride,
						currentSession: timer.current_session,
						totalSessions: timer.total_sessions
					}}
				/>
			</Suspense>

			<div className='relative w-[12dvw] xl:w-64 aspect-square flex items-center justify-center my-6'>
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

				<Suspense fallback={null}>
					<TimerDisplay
						{...{
							formattedTime,
							isRunning,
							glowColor: effectiveGlowColor,
							currentSession: timer.current_session,
							totalSessions: timer.total_sessions
						}}
					/>
				</Suspense>
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
		</div>
	);
}
