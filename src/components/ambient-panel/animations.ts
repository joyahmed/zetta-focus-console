export const AMBIENT_ANIMATIONS = `
	@keyframes snowfall {
		0% {
			transform: translate3d(0, -10px, 0);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			transform: translate3d(20px, var(--fall-distance, 220px), 0);
			opacity: 0;
		}
	}

	/* Fall and spin in one animation.
	   These were two — leafFall and leafRotate — declared on the same element,
	   and both animated the transform property. Only the last one in the list
	   wins that property outright, so the leaves spun on the spot at the top of
	   the panel and never fell at all. The keyframes also mixed transform
	   function lists (translateY/translateX in one step, translate3d in the
	   next), which a browser can only interpolate as matrices; every step here
	   uses the same list. */
	@keyframes leafFall {
		0% {
			transform: translate3d(0, -12px, 0) rotate(0deg);
			opacity: 0;
		}
		10% { opacity: 1; }
		50% {
			transform: translate3d(38px, calc(var(--fall-distance, 220px) * 0.5), 0) rotate(var(--leaf-spin-half, 240deg));
		}
		90% { opacity: 0.9; }
		100% {
			transform: translate3d(-26px, var(--fall-distance, 220px), 0) rotate(var(--leaf-spin, 480deg));
			opacity: 0;
		}
	}

	/* Aurora. Each ribbon is a wide, soft band that sweeps and stretches;
	   only transforms and opacity animate, so the blur is rasterised once and
	   the whole scene stays on the compositor. */
	@keyframes auroraSweepA {
		0%   { transform: translate3d(-14%, 6%, 0) rotate(-7deg) scaleY(1); }
		50%  { transform: translate3d(6%, -4%, 0) rotate(-2deg) scaleY(1.3); }
		100% { transform: translate3d(-2%, 8%, 0) rotate(-10deg) scaleY(0.85); }
	}

	@keyframes auroraSweepB {
		0%   { transform: translate3d(8%, -3%, 0) rotate(5deg) scaleY(0.9); }
		50%  { transform: translate3d(-10%, 5%, 0) rotate(1deg) scaleY(1.25); }
		100% { transform: translate3d(4%, -6%, 0) rotate(7deg) scaleY(1.05); }
	}

	@keyframes auroraSweepC {
		0%   { transform: translate3d(-6%, 10%, 0) rotate(3deg) scaleY(1.1); }
		50%  { transform: translate3d(10%, 2%, 0) rotate(-4deg) scaleY(0.8); }
		100% { transform: translate3d(-12%, 7%, 0) rotate(2deg) scaleY(1.2); }
	}

	@keyframes auroraBreathe {
		0%, 100% { opacity: var(--ribbon-opacity, 0.5); }
		50%      { opacity: calc(var(--ribbon-opacity, 0.5) * 1.5); }
	}

	/* Embers rise, wander, and burn out before the top. */
	@keyframes emberRise {
		0% {
			transform: translate3d(0, 0, 0) scale(0.6);
			opacity: 0;
		}
		12% { opacity: 1; }
		70% { opacity: 0.8; }
		100% {
			transform: translate3d(var(--ember-drift, 24px), calc(var(--fall-distance, 220px) * -1), 0) scale(0.2);
			opacity: 0;
		}
	}

	/* Two strikes close together, then a long wait — the pattern is in the
	   timing function, not in JavaScript. */
	@keyframes lightningFlash {
		0%, 100%      { opacity: 0; }
		1.2%          { opacity: 0.85; }
		2.4%          { opacity: 0.05; }
		3.2%          { opacity: 0.6; }
		5%            { opacity: 0; }
	}

	@keyframes petalFall {
		0% {
			transform: translate3d(0, -12px, 0) rotate(0deg);
			opacity: 0;
		}
		10% { opacity: 1; }
		50% {
			transform: translate3d(28px, calc(var(--fall-distance, 220px) * 0.5), 0) rotate(180deg);
		}
		90% { opacity: 0.9; }
		100% {
			transform: translate3d(-16px, var(--fall-distance, 220px), 0) rotate(400deg);
			opacity: 0;
		}
	}
`;
