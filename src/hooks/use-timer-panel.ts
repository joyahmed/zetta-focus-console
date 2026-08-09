export const useTimerPanel = ({
	timer,
	sessionOverride
}: UseTimerPanelProps) => {
	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const getStatusLabel = (status: TimerState['status']): string => {
		switch (status) {
			case 'idle':
				return 'IDLE';
			case 'running':
				return 'RUNNING';
			case 'paused':
				return 'PAUSED';
			case 'completed':
				return 'COMPLETED';
			default:
				return 'IDLE';
		}
	};

	const isOverrideActive = (
		override: SessionOverride | null | undefined
	): boolean => {
		return (
			override !== null &&
			override !== undefined &&
			(override.focus_duration !== null ||
				override.break_duration !== null ||
				override.loop_count !== null)
		);
	};

	const progress =
		timer.total_seconds > 0
			? ((timer.total_seconds - timer.remaining_seconds) /
					timer.total_seconds) *
				100
			: 0;

	const circumference = 2 * Math.PI * 90;
	const strokeDashoffset =
		circumference - (progress / 100) * circumference;
	const hasOverride = isOverrideActive(sessionOverride);

	return {
		hasOverride,
		getStatusLabel,

		circumference,
		strokeDashoffset,

		formatTime,
		isOverrideActive
	};
};
