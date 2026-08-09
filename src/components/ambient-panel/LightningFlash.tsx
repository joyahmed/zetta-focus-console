/**
 * Heat lightning behind the clouds.
 *
 * Deliberately a full-panel wash rather than a drawn bolt: a fork of lightning
 * across a small panel is a cartoon, whereas a sheet flash reads as weather and
 * costs one element. The double strike and the long dark gap between them live
 * in the keyframes, so nothing here runs per frame in JavaScript — a timer that
 * fires every few seconds to flip a boolean would keep React re-rendering the
 * whole scene for an effect the compositor can own outright.
 */
const LightningFlash = ({
	glowColor,
	isPaused,
	period,
	delay
}: LightningFlashProps) => (
	<div
		className='absolute inset-0 pointer-events-none'
		style={{
			background: `radial-gradient(ellipse at 60% 12%, #ffffff 0%, ${glowColor}aa 28%, transparent 62%)`,
			mixBlendMode: 'screen',
			animation: `lightningFlash ${period}s linear ${delay}s infinite`,
			animationPlayState: isPaused ? 'paused' : 'running'
		}}
	/>
);

export default LightningFlash;
