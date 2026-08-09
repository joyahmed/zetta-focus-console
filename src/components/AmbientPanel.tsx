import { useEffect, useRef, useState } from 'react';
import { useAmbientPanel } from '../hooks/use-ambient-panel';
import { AMBIENT_ANIMATIONS } from './ambient-panel';

import AmbientHeader from './ambient-panel/AmbientHeader';
import SeasonIndicator from './ambient-panel/SeasonIndicator';
import SeasonScene from './ambient-panel/SeasonScene';

const AmbientPanel = ({
	season,
	motionIntensity,
	timer,
	isEnabled,
	theme = 'dark'
}: AmbientPanelProps) => {
	const isLight = theme === 'light';
	const isRunning = timer.status === 'running';

	// The fall animations used to end at a hardcoded 220px. On a large display
	// this panel is far taller than that, so particles faded out a third of the
	// way down and the scene read as an empty box. Measured once per resize and
	// handed to CSS as a variable — the animation itself stays on the
	// compositor and never consults layout.
	const sceneRef = useRef<HTMLDivElement>(null);
	const [fallDistance, setFallDistance] = useState(220);

	useEffect(() => {
		const element = sceneRef.current;
		if (!element) return;

		const observer = new ResizeObserver(([entry]) => {
			// A little past the bottom edge so particles leave the frame
			// rather than blinking out at it.
			setFallDistance(entry.contentRect.height + 40);
		});

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const { isPaused, speedMultiplier, particles } = useAmbientPanel({
		season,
		motionIntensity,
		isRunning
	});

	if (!isEnabled) {
		return null;
	}

	/*
	 * Particles, and nothing behind them.
	 *
	 * There used to be a second mode — a full-panel wash, latterly an aurora —
	 * rendered either instead of or stacked underneath the particles. It is
	 * gone. A wide, soft, animated backdrop is the most expensive thing a
	 * compositor can be asked for: blurs and blend modes each force the element
	 * onto its own layer with its own texture, and a blend mode makes the
	 * compositor keep a copy of everything behind it as well. Particles are a
	 * handful of tiny layers by comparison, and they were always the part worth
	 * looking at.
	 *
	 * The light theme used to get a static pastel gradient and the words
	 * "Ambience disabled in light mode" instead of any of this — the one panel
	 * in the app that simply stopped working when you pressed Ctrl+D. Nothing
	 * about a season needs a dark background; the particles just needed to be
	 * drawn for it, which is a shade of opacity and a shadow under the glyph.
	 */

	return (
		<div className='panel h-full relative overflow-hidden flex flex-col'>
			<AmbientHeader />

			<div
				ref={sceneRef}
				className='flex-1 relative min-h-[200px] -mt-16'
				style={
					{
						'--fall-distance': `${fallDistance}px`
					} as React.CSSProperties
				}
			>
				<SeasonScene
					{...{ season, particles, isPaused, isLight, speedMultiplier }}
				/>

				<SeasonIndicator {...{ season, motionIntensity }} />
			</div>

			<style>{AMBIENT_ANIMATIONS}</style>
		</div>
	);
};

export default AmbientPanel;
