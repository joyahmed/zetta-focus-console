import { useEffect, useMemo, useState } from 'react';


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
	const particleCount = useMemo(() => {
		const counts = {
			low: { winter: 10, autumn: 2, default: 8 },
			medium: { winter: 15, autumn: 3, default: 12 },
			high: { winter: 20, autumn: 4, default: 16 }
		};

		const intensityCounts = counts[motionIntensity];
		return season === 'winter'
			? intensityCounts.winter
			: season === 'autumn'
				? intensityCounts.autumn
				: intensityCounts.default;
	}, [motionIntensity, season]);

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
			x: 10 + Math.random() * 80,
			size: 8 + Math.random() * 8,
			delay: Math.random() * 15,
			duration: 15 + Math.random() * 20,
			opacity: 0.4 + Math.random() * 0.3,
			rotation: Math.random() * 360,
			rotationDuration: 5 + Math.random() * 10
		}));
	}, [particleCount]);

	const springParticles = useMemo<Particle[]>(() => {
		return Array.from({ length: particleCount }, (_, i) => ({
			id: i,
			x: Math.random() * 100,
			size: 1 + Math.random() * 2,
			delay: Math.random() * 8,
			duration: 6 + Math.random() * 10,
			opacity: 0.2 + Math.random() * 0.3
		}));
	}, [particleCount]);

	return {
		isPaused,
		particleCount,
		speedMultiplier,
		snowParticles,
		leaves,
		springParticles
	};
};
