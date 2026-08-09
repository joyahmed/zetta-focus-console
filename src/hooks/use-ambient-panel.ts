import { useEffect, useMemo, useState } from 'react';

/**
 * How many particles each season runs at each intensity.
 *
 * Counts stay fixed regardless of display size. Each particle is an
 * independently animated compositor layer, and scaling them with the viewport
 * is exactly the wrong trade on a 4K panel — the cost of the scene is the
 * number of moving layers, not their size. Visibility at large sizes is
 * handled by making the fall distance follow the container instead.
 *
 * Autumn used to be 2, 3 and 4. Two leaves, each waiting up to fifteen seconds
 * before its first fall, is a panel with nothing in it. Leaves are much larger
 * than snowflakes so they still want the lowest count — just not that low.
 */
const PARTICLE_COUNTS: Record<
	Profile['motion_intensity'],
	Record<Profile['season'], number>
> = {
	low: { winter: 10, spring: 8, summer: 7, autumn: 6 },
	medium: { winter: 15, spring: 12, summer: 11, autumn: 9 },
	high: { winter: 20, spring: 16, summer: 15, autumn: 12 }
};


export const useAmbientPanel = ({
	season,
	motionIntensity,
	isRunning
}: UseAmbientPanelProps) => {
	const [isPaused, setIsPaused] = useState(false);

	useEffect(() => {
		setIsPaused(!isRunning);
	}, [isRunning]);

	// Counts stay fixed regardless of display size. Each particle is an
	// independently animated compositor layer, and scaling them with the
	// viewport is exactly the wrong trade on a 4K panel — the cost of the scene
	// is the number of moving layers, not their size. Visibility at large sizes
	// is handled by making the fall distance follow the container instead.
	const particleCount = useMemo(
		() => PARTICLE_COUNTS[motionIntensity][season],
		[motionIntensity, season]
	);

	const speedMultiplier = useMemo(() => {
		const speeds = { low: 1.5, medium: 1, high: 0.7 };
		return speeds[motionIntensity];
	}, [motionIntensity]);

	const snowParticles = useMemo<Particle[]>(() => {
		return Array.from({ length: particleCount }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			size: 2 + Math.random() * 3,
			delay: Math.random() * 10,
			duration: 8 + Math.random() * 12,
			opacity: 0.3 + Math.random() * 0.4
		}));
	}, [particleCount]);

	const leaves = useMemo<Leaf[]>(() => {
		return Array.from({ length: particleCount }, (_, i) => ({
			id: i,
			x: 6 + Math.random() * 88,
			size: 10 + Math.random() * 10,
			// Was up to 15s of delay on a 15-35s fall, so the scene took the
			// better part of a minute to fill and never looked continuous.
			delay: Math.random() * 8,
			duration: 12 + Math.random() * 12,
			opacity: 0.55 + Math.random() * 0.35,
			rotation: Math.random() * 360
		}));
	}, [particleCount]);

	// Bigger and more opaque than the 1-3px specks these were, because they are
	// petals now rather than pollen and a 2px oval is indistinguishable from
	// the snow.
	const springParticles = useMemo<Particle[]>(() => {
		return Array.from({ length: particleCount }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			size: 3 + Math.random() * 4,
			delay: Math.random() * 8,
			duration: 9 + Math.random() * 9,
			opacity: 0.5 + Math.random() * 0.4
		}));
	}, [particleCount]);

	/** Sparks off a fire: fewer and slower than snow, and each carries its own
	    sideways drift so they do not rise in parallel lines. */
	const embers = useMemo<Ember[]>(() => {
		return Array.from({ length: particleCount }, (_, i) => ({
			id: i,
			x: 8 + Math.random() * 84,
			size: 2 + Math.random() * 3,
			delay: Math.random() * 12,
			duration: 9 + Math.random() * 10,
			opacity: 0.45 + Math.random() * 0.45,
			drift: -40 + Math.random() * 80
		}));
	}, [particleCount]);

	return {
		isPaused,
		particleCount,
		speedMultiplier,
		snowParticles,
		leaves,
		springParticles,
		embers
	};
};
