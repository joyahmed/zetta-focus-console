export const AMBIENT_ANIMATIONS = `
	/* One fall, one rise, and everything that differs between particles comes
	   in as a custom property: how far it wanders sideways, how far it turns,
	   and how opaque it gets at its brightest. Four sets of keyframes that
	   differed only in those numbers are one pair now.

	   Every step uses the same transform function list. Mixing them — a
	   translateY here, a translate3d there — leaves the browser interpolating
	   matrices, which is not what the numbers say. */
	@keyframes particleFall {
		0% {
			transform: translate3d(0, -14px, 0) rotate(0deg);
			opacity: 0;
		}
		10% { opacity: var(--particle-opacity, 1); }
		50% {
			transform: translate3d(var(--drift-mid, 28px), calc(var(--fall-distance, 220px) * 0.5), 0) rotate(var(--spin-half, 180deg));
		}
		88% { opacity: var(--particle-opacity, 1); }
		100% {
			transform: translate3d(var(--drift-end, -18px), var(--fall-distance, 220px), 0) rotate(var(--spin, 360deg));
			opacity: 0;
		}
	}

	@keyframes particleRise {
		0% {
			transform: translate3d(0, 14px, 0) rotate(0deg) scale(0.7);
			opacity: 0;
		}
		12% { opacity: var(--particle-opacity, 1); }
		50% {
			transform: translate3d(var(--drift-mid, 28px), calc(var(--fall-distance, 220px) * -0.5), 0) rotate(var(--spin-half, 180deg)) scale(1);
		}
		82% { opacity: calc(var(--particle-opacity, 1) * 0.8); }
		100% {
			transform: translate3d(var(--drift-end, -18px), calc(var(--fall-distance, 220px) * -1), 0) rotate(var(--spin, 360deg)) scale(0.55);
			opacity: 0;
		}
	}

`;
