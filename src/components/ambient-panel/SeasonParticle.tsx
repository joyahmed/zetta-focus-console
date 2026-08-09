/**
 * One instance of the profile's own icon, drifting through the panel.
 *
 * A glyph rather than SVG or a gradient, and that is the cheap choice rather
 * than the lazy one: the renderer rasterises each emoji into a shared glyph
 * cache once and every particle reuses it, where an inline SVG is a separate
 * path subtree per particle and a gradient is a texture. What costs memory here
 * is the number of animated compositor layers, and that is the same either way.
 *
 * Everything that varies — where it enters, how big, how fast, how far it
 * wanders, how far it turns — is per particle, so a dozen copies of one
 * character do not read as a dozen copies of one character.
 */
const SeasonParticle = ({
	icon,
	particle,
	rises,
	isPaused,
	isLight,
	speedMultiplier
}: SeasonParticleProps) => (
	<div
		className='absolute select-none'
		style={
			{
				left: `${particle.x}%`,
				// Risers start at the floor; everything else starts above the top.
				top: rises ? undefined : 0,
				bottom: rises ? 0 : undefined,
				fontSize: particle.size,
				lineHeight: 1,
				'--particle-opacity': isLight ? 0.85 : particle.opacity,
				'--drift-mid': `${particle.drift}px`,
				'--drift-end': `${-particle.drift * 0.6}px`,
				'--spin': `${particle.spin}deg`,
				'--spin-half': `${Math.round(particle.spin / 2)}deg`,
				willChange: isPaused ? 'auto' : 'transform, opacity',
				animation: `${rises ? 'particleRise' : 'particleFall'} ${particle.duration * speedMultiplier}s ease-in-out ${particle.delay}s infinite`,
				// Backwards, so the delay renders the 0% keyframe rather than the
				// element's own style. Without it a particle sits visible at its
				// start line until its delay elapses — and for ever, if the scene
				// pauses first, since a paused animation never reaches keyframe
				// zero.
				animationFillMode: 'backwards',
				animationPlayState: isPaused ? 'paused' : 'running'
			} as React.CSSProperties
		}
	>
		{icon}
	</div>
);

export default SeasonParticle;
