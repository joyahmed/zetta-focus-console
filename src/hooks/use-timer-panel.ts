import { formatTime } from '../utils/format';

const RADIUS = 90;

/** Strict mode turns the ring and the glow red while a session is running. */
const STRICT_MODE_COLOR = '#ef4444';

/** An override is set if any one of its three fields is. */
const isOverrideActive = (
	override: SessionOverride | null | undefined
): boolean =>
	Boolean(
		override &&
			(override.focus_duration !== null ||
				override.break_duration !== null ||
				override.loop_count !== null)
	);

/**
 * Everything the timer panel draws, derived from the timer.
 *
 * The panel used to work out the effective glow colour and whether strict mode
 * was blocking the controls in its own body, so half the panel's reasoning
 * lived above its markup and half of it here.
 */
export const useTimerPanel = ({
	timer,
	sessionOverride,
	glowColor,
	strictMode
}: UseTimerPanelProps) => {
	/**
	 * Clamped, because the arc has nowhere sensible to go outside 0-100.
	 *
	 * The engine used to reset `remaining_seconds` on stop without resetting
	 * `total_seconds`, so a stopped 5-minute quick session reported 1500
	 * remaining out of 300 — minus four hundred percent — and the ring swept
	 * to five times its own circumference. That is fixed in stop_command, but
	 * a ratio of two independently-set fields should not be able to put the
	 * arc off the circle no matter what arrives.
	 */
	const progress =
		timer.total_seconds > 0
			? Math.min(
					100,
					Math.max(
						0,
						((timer.total_seconds - timer.remaining_seconds) /
							timer.total_seconds) *
							100
					)
				)
			: 0;

	const circumference = 2 * Math.PI * RADIUS;
	const isRunning = timer.status === 'running';
	const isStrictModeBlocking = Boolean(strictMode?.is_active) && isRunning;

	/**
	 * A run of one is not a cycle, so it does not get a counter.
	 *
	 * A duration typed into the clock or picked from the quick chips is a
	 * one-off; the engine gives it a total of one. "Session 1/4" there was the
	 * profile's cycle describing a run that had nothing to do with it.
	 */
	const showsCycle = timer.total_sessions > 1;

	return {
		radius: RADIUS,
		circumference,
		strokeDashoffset: circumference - (progress / 100) * circumference,
		isRunning,
		showsCycle,
		formattedTime: formatTime(timer.remaining_seconds),
		hasOverride: isOverrideActive(sessionOverride),
		isStrictModeBlocking,
		effectiveGlowColor: isStrictModeBlocking ? STRICT_MODE_COLOR : glowColor
	};
};
