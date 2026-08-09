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
	const progress =
		timer.total_seconds > 0
			? ((timer.total_seconds - timer.remaining_seconds) /
					timer.total_seconds) *
				100
			: 0;

	const circumference = 2 * Math.PI * RADIUS;
	const isRunning = timer.status === 'running';
	const isStrictModeBlocking = Boolean(strictMode?.is_active) && isRunning;

	return {
		radius: RADIUS,
		circumference,
		strokeDashoffset: circumference - (progress / 100) * circumference,
		isRunning,
		formattedTime: formatTime(timer.remaining_seconds),
		hasOverride: isOverrideActive(sessionOverride),
		isStrictModeBlocking,
		effectiveGlowColor: isStrictModeBlocking ? STRICT_MODE_COLOR : glowColor
	};
};
