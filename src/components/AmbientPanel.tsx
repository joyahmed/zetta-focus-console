import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useAmbientPanel } from '../hooks/use-ambient-panel';
import { AMBIENT_ANIMATIONS } from './ambient-panel';

const AmbientHeader = lazy(() => import('./ambient-panel/AmbientHeader'));
const SeasonIndicator = lazy(() => import('./ambient-panel/SeasonIndicator'));
const LightModePlaceholder = lazy(
	() => import('./ambient-panel/LightModePlaceholder')
);
const GradientBackground = lazy(
	() => import('./ambient-panel/GradientBackground')
);
const WinterScene = lazy(() => import('./ambient-panel/WinterScene'));
const SummerScene = lazy(() => import('./ambient-panel/SummerScene'));
const SpringScene = lazy(() => import('./ambient-panel/SpringScene'));
const AutumnScene = lazy(() => import('./ambient-panel/AutumnScene'));

const AmbientPanel = ({
	season,
	motionIntensity,
	backgroundType,
	glowColor,
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

	const { isPaused, speedMultiplier, snowParticles, leaves, springParticles } =
		useAmbientPanel({
			season,
			motionIntensity,
			isRunning
		});

	if (!isEnabled) {
		return null;
	}

	const renderSeasonContent = () => {
		if (isLight) {
			return <LightModePlaceholder />;
		}

		const sceneProps = {
			glowColor,
			isPaused,
			isLight,
			speedMultiplier
		};

		if (backgroundType === 'gradient') {
			return <GradientBackground {...{ glowColor, isLight, timer }} />;
		}

		switch (season) {
			case 'winter':
				return (
					<>
						<GradientBackground {...{ glowColor, isLight, timer }} />
						<WinterScene
							{...{
								...sceneProps,
								snowParticles
							}}
						/>
					</>
				);
			case 'summer':
				return (
					<>
						<GradientBackground {...{ glowColor, isLight, timer }} />
						<SummerScene {...{ glowColor, isLight }} />
					</>
				);
			case 'spring':
				return (
					<>
						<GradientBackground {...{ glowColor, isLight, timer }} />
						<SpringScene
							{...{
								...sceneProps,
								springParticles
							}}
						/>
					</>
				);
			case 'autumn':
				return (
					<>
						<GradientBackground {...{ glowColor, isLight, timer }} />
						<AutumnScene
							{...{
								...sceneProps,
								leaves
							}}
						/>
					</>
				);
		}
	};

	return (
		<div className='glass-panel h-full relative rounded-xl border border-zetta-border bg-zetta-card hover:bg-zetta-bg transition-colors overflow-hidden flex flex-col'>
			<Suspense fallback={null}>
				<AmbientHeader />
			</Suspense>

			<div
				ref={sceneRef}
				className='flex-1 relative min-h-[200px] -mt-16'
				style={
					{
						'--fall-distance': `${fallDistance}px`
					} as React.CSSProperties
				}
			>
				<Suspense fallback={null}>{renderSeasonContent()}</Suspense>

				<Suspense fallback={null}>
					<SeasonIndicator
						{...{
							season,
							motionIntensity,
							backgroundType,
							isLight
						}}
					/>
				</Suspense>
			</div>

			<style>{AMBIENT_ANIMATIONS}</style>
		</div>
	);
};

export default AmbientPanel;
