import { useEditableDuration } from '../../hooks/use-editable-duration';

/** The clock and its input must match to the pixel, or the middle of the ring
    jumps the moment it is clicked. */
const TYPE_STYLES =
	'font-mono text-[clamp(2rem,3.2dvw,3.75rem)] font-medium tracking-wide tabular-nums';

/**
 * Just the clock — and, while the timer is idle, the field that sets it.
 *
 * This used to draw a row of dots underneath for the position in the cycle,
 * which said the same thing as the "Session 1/4" line now sitting below it —
 * two indicators for one fact, stacked, in the middle of a circle.
 */
const TimerDisplay = ({
	formattedTime,
	isRunning,
	glowColor,
	canEdit = false,
	onDurationChange
}: TimerDisplayProps) => {
	const editable = canEdit && Boolean(onDurationChange);

	const {
		isEditing,
		draft,
		setDraft,
		inputRef,
		start,
		commit,
		handleKeyDown
	} = useEditableDuration({
		value: formattedTime,
		canEdit: editable,
		onCommit: onDurationChange ?? (() => {})
	});

	if (isEditing) {
		return (
			<input
				ref={inputRef}
				value={draft}
				onChange={e => setDraft(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={commit}
				aria-label='Session duration'
				className={`${TYPE_STYLES} z-10 w-[4.5em] bg-transparent text-center outline-none border-b-2 border-dashed`}
				style={{
					color: 'var(--text-primary)',
					borderColor: `${glowColor}80`
				}}
			/>
		);
	}

	return (
		<button
			type='button'
			onClick={start}
			disabled={!editable}
			title={editable ? 'Click to set the duration' : undefined}
			className={`${TYPE_STYLES} z-10 transition-colors duration-300 ${
				editable ? 'cursor-text' : 'cursor-default'
			}`}
			style={{
				color: 'var(--text-primary)',
				opacity: isRunning ? 1 : 0.7,
				textShadow: isRunning ? `0 0 20px ${glowColor}50` : 'none'
			}}
		>
			{formattedTime}
		</button>
	);
};

export default TimerDisplay;
