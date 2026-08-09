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
 * before its first fall, is a panel with nothing in it.
 */
const PARTICLE_COUNTS: Record<
	Profile['motion_intensity'],
	Record<Profile['season'], number>
> = {
	low: { winter: 9, spring: 8, summer: 7, autumn: 6 },
	medium: { winter: 13, spring: 12, summer: 11, autumn: 9 },
	high: { winter: 18, spring: 16, summer: 15, autumn: 12 }
};

/** Per-season character: how large the icon runs and how long it takes to
    cross. A leaf is a slow, large, wandering thing; a spark is small, quick
    and nearly straight. */
const PARTICLE_SHAPE: Record<
	Profile['season'],
	{ size: [number, number]; duration: [number, number]; drift: number }
> = {
	winter: { size: [9, 9], duration: [11, 11], drift: 34 },
	spring: { size: [10, 10], duration: [10, 10], drift: 46 },
	summer: { size: [8, 8], duration: [9, 8], drift: 30 },
	autumn: { size: [12, 12], duration: [12, 12], drift: 52 }
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

	const particleCount = useMemo(
		() => PARTICLE_COUNTS[motionIntensity][season],
		[motionIntensity, season]
	);

	const speedMultiplier = useMemo(() => {
		const speeds = { low: 1.5, medium: 1, high: 0.7 };
		return speeds[motionIntensity];
	}, [motionIntensity]);

	/**
	 * One set of particles, not four.
	 *
	 * Snow, blossom, embers and leaves were four arrays built by four
	 * near-identical `useMemo`s that differed in a handful of constants. The
	 * constants are in PARTICLE_SHAPE and this is the one array.
	 */
	const particles = useMemo<AmbientParticle[]>(() => {
		const shape = PARTICLE_SHAPE[season];

		return Array.from({ length: particleCount }, (_, i) => ({
			id: i,
			x: 4 + Math.random() * 92,
			size: shape.size[0] + Math.random() * shape.size[1],
			// Short delays: at up to fifteen seconds the scene took the better
			// part of a minute to fill and never looked continuous.
			delay: Math.random() * 7,
			duration: shape.duration[0] + Math.random() * shape.duration[1],
			opacity: 0.5 + Math.random() * 0.45,
			drift: (Math.random() - 0.5) * 2 * shape.drift,
			spin: Math.round((Math.random() - 0.3) * 540)
		}));
	}, [particleCount, season]);

	return { isPaused, particleCount, speedMultiplier, particles };
};
