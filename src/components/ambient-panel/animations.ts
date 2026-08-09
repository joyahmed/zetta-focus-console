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

	@keyframes drift {
		0%, 100% {
			transform: translateY(0) translateX(0);
			opacity: 0;
		}
		20% {
			opacity: 0.8;
		}
		50% {
			transform: translateY(100px) translateX(30px);
			opacity: 0.6;
		}
		80% {
			opacity: 0.4;
		}
		100% {
			transform: translate3d(-20px, var(--fall-distance, 200px), 0);
			opacity: 0;
		}
	}

	@keyframes leafFall {
		0% {
			transform: translateY(-20px) translateX(0) rotate(0deg);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		50% {
			transform: translateY(100px) translateX(40px);
		}
		100% {
			transform: translate3d(-30px, var(--fall-distance, 220px), 0);
			opacity: 0;
		}
	}

	@keyframes leafRotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes shimmer {
		0%, 100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.05);
		}
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0) translateX(0);
		}
		25% {
			transform: translateY(-10px) translateX(5px);
		}
		50% {
			transform: translateY(0) translateX(10px);
		}
		75% {
			transform: translateY(10px) translateX(5px);
		}
	}

	@keyframes ambientGradientDrift {
		0% {
			transform: translate3d(-3%, -2%, 0) scale(1);
		}
		50% {
			transform: translate3d(2%, 1.5%, 0) scale(1.06);
		}
		100% {
			transform: translate3d(4%, -1%, 0) scale(1.02);
		}
	}

	@keyframes ambientGradientPulse {
		0%, 100% {
			transform: scale(1);
			filter: saturate(1);
		}
		50% {
			transform: scale(1.04);
			filter: saturate(1.2);
		}
	}

	@keyframes ambientUrgencyBloom {
		0%, 100% {
			transform: scale(0.98);
		}
		50% {
			transform: scale(1.06);
		}
	}

	.animation-paused {
		animation-play-state: paused !important;
	}
`;
