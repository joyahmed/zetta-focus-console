/**
 * Heat lightning behind the clouds.
 *
 * Deliberately a full-panel wash rather than a drawn bolt: a fork of lightning
 * across a small panel is a cartoon, whereas a sheet flash reads as weather and
 * costs one element. The double strike and the long dark gap between them live
 * in the keyframes, so nothing here runs per frame in JavaScript — a timer that
 * fires every few seconds to flip a boolean would keep React re-rendering the
 * whole scene for an effect the compositor can own outright.
 *
 * Two things this has to get right, and did not:
 *
 * `opacity: 0` is the base state, and the animation fills backwards. Without
 * both, the element shows its *un-animated* style until the delay elapses —
 * which is the gradient at full strength — so summer opened with a static wash
 * across the panel, and kept it indefinitely whenever the timer was not
 * running, because a paused animation never reaches its first keyframe.
 *
 * No `mix-blend-mode`. Blending forces the compositor to keep a copy of
 * everything behind this element to blend against, for a full-panel layer,
 * permanently. The gradient is bright enough on a dark panel without it.
 */
const LightningFlash = ({
	glowColor,
	isPaused,
	period,
	delay
}: LightningFlashProps) => {
	// Unmounted rather than paused: freezing this one mid-strike would leave a
	// bright wash across the panel until the session resumed.
	if (isPaused) return null;

	return (
		<div
			className='absolute inset-0 pointer-events-none'
			style={{
				background: `radial-gradient(ellipse at 60% 10%, #ffffff 0%, ${glowColor}cc 26%, transparent 60%)`,
				opacity: 0,
				animation: `lightningFlash ${period}s linear ${delay}s infinite`,
				animationFillMode: 'backwards'
			}}
		/>
	);
};

export default LightningFlash;
