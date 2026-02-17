import { lazy, Suspense } from 'react';
import { useTimerPanel } from '../hooks/use-timer-panel';
const TimerBackground = lazy(() => import('./timer-panel/TimerBackground'));
const SessionIndicator = lazy(() => import('./timer-panel/SessionIndicator'));
const TimerRing = lazy(() => import('./timer-panel/TimerRing'));
const TimerDisplay = lazy(() => import('./timer-panel/TimerDisplay'));
const TimerControls = lazy(() => import('./timer-panel/TimerControls'));

const RADIUS = 90;

export default function TimerPanel({
	timer,
	glowColor,
	sessionOverride,
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

	return (
		<div className='glass-panel h-full rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group'>
			<Suspense fallback={null}>
				<TimerBackground
					{...{
						isRunning,
						glowColor
					}}
				/>
			</Suspense>

			<Suspense fallback={null}>
				<SessionIndicator
					{...{
						sessionType: timer.session_type,
						hasOverride
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
							glowColor
						}}
					/>
				</Suspense>

				<Suspense fallback={null}>
					<TimerDisplay
						{...{
							formattedTime,
							isRunning,
							glowColor
						}}
					/>
				</Suspense>
			</div>

			<Suspense fallback={null}>
				<TimerControls
					{...{
						status: timer.status,
						onStart,
						onPause,
						onResume,
						onStop
					}}
				/>
			</Suspense>
		</div>
	);
}
