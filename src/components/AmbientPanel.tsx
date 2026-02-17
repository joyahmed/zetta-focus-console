import { useEffect, useMemo, useState } from 'react';

const AmbientPanel = ({
	season,
	motionIntensity,
	backgroundType,
	glowColor,
	isRunning,
	isEnabled,
	theme = 'dark'
}: AmbientPanelProps) => {
	const [isPaused, setIsPaused] = useState(false);
	const isLight = theme === 'light';

	// Calculate visible glow colors for light mode (more opaque)
	const getGlowColor = (opacity: string) => {
		if (isLight) {
			// In light mode, use more visible colors by removing alpha or using a darker variant
			return glowColor;
		}
		return glowColor + opacity;
	};

	// Pause animation when timer stops
	useEffect(() => {
		setIsPaused(!isRunning);
	}, [isRunning]);

	// Get particle count based on intensity
	const particleCount = useMemo(() => {
		switch (motionIntensity) {
			case 'low':
				return season === 'winter' ? 10 : season === 'autumn' ? 2 : 8;
			case 'medium':
				return season === 'winter'
					? 15
					: season === 'autumn'
						? 3
						: 12;
			case 'high':
				return season === 'winter'
					? 20
					: season === 'autumn'
						? 4
						: 16;
		}
	}, [motionIntensity, season]);

	// Generate snow particles for winter
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

	// Generate leaves for autumn
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

	// Generate particles for spring
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

	// Get animation duration multiplier based on intensity
	const speedMultiplier = useMemo(() => {
		switch (motionIntensity) {
			case 'low':
				return 1.5;
			case 'medium':
				return 1;
			case 'high':
				return 0.7;
		}
	}, [motionIntensity]);

	if (!isEnabled) {
		return null;
	}

	// Render gradient-only background (no particles)
	const renderGradientBackground = () => {
		// Subtle gradient - no circles or moon-like shapes
		const baseOpacity = isLight ? '30' : '10';
		const midOpacity = isLight ? '15' : '05';

		return (
			<div className='relative w-full h-full overflow-hidden'>
				{/* Radial ambient glow */}
				<div
					className='absolute inset-0 pointer-events-none'
					style={{
						background: `
      radial-gradient(circle at 30% 20%, ${getGlowColor('25')} 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, ${getGlowColor('15')} 0%, transparent 50%)
    `,
						filter: 'blur(60px)'
					}}
				/>

				{/* Main gradient overlay */}
				<div
					className='absolute inset-0'
					style={{
						background: `linear-gradient(135deg, ${getGlowColor(baseOpacity)} 0%, transparent 60%, ${getGlowColor(midOpacity)} 100%)`
					}}
				/>
			</div>
		);
	};

	// Render particles background (with seasonal animations)
	const renderParticlesBackground = () => {
		// Light mode opacity adjustments - more subtle
		const baseOpacity = isLight ? '25' : '08';
		const midOpacity = isLight ? '10' : '03';
		const particleOpacity = isLight ? 0.7 : 0.4;

		switch (season) {
			case 'winter':
				return (
					<div className='relative w-full h-full overflow-hidden'>
						{/* Subtle gradient base */}
						<div
							className='absolute inset-0'
							style={{
								background: `linear-gradient(135deg, ${glowColor}${baseOpacity} 0%, transparent 60%, ${glowColor}${midOpacity} 100%)`
							}}
						/>
						{/* Snow particles */}
						{snowParticles.map(particle => (
							<div
								key={particle.id}
								className={`absolute rounded-full ${isPaused ? 'animation-paused' : ''}`}
								style={{
									left: `${particle.x}%`,
									width: particle.size,
									height: particle.size,
									background: `
  radial-gradient(circle at 30% 30%, #ffffff 0%, #ffffffcc 40%, #ffffff66 70%, transparent 100%)
`,
									boxShadow: `0 0 6px ${glowColor}`,
									opacity: isLight
										? particleOpacity
										: particle.opacity,
									animation: isPaused
										? 'none'
										: `snowfall ${particle.duration * speedMultiplier}s linear ${particle.delay}s infinite`
								}}
							/>
						))}
					</div>
				);

			case 'summer':
				return (
					<div className='relative w-full h-full overflow-hidden'>
						{/* Subtle gradient base */}
						<div
							className='absolute inset-0'
							style={{
								background: `linear-gradient(135deg, ${glowColor}${baseOpacity} 0%, transparent 60%, ${glowColor}${midOpacity} 100%)`
							}}
						/>
					</div>
				);

			case 'spring':
				return (
					<div className='relative w-full h-full overflow-hidden'>
						{/* Subtle gradient base */}
						<div
							className='absolute inset-0'
							style={{
								background: `linear-gradient(135deg, ${glowColor}${baseOpacity} 0%, transparent 60%, ${glowColor}${midOpacity} 100%)`
							}}
						/>
						{/* Drifting particles */}
						{springParticles.map(particle => (
							<div
								key={particle.id}
								className={`absolute rounded-full ${isPaused ? 'animation-paused' : ''}`}
								style={{
									left: `${particle.x}%`,
									width: particle.size,
									height: particle.size,
									background: `
  radial-gradient(circle, ${glowColor} 0%, ${glowColor}88 40%, transparent 70%)
`,
									boxShadow: `0 0 8px ${glowColor}`,
									opacity: isLight
										? particleOpacity
										: particle.opacity,
									animation: isPaused
										? 'none'
										: `drift ${particle.duration * speedMultiplier}s ease-in-out ${particle.delay}s infinite`
								}}
							/>
						))}
					</div>
				);

			case 'autumn':
				return (
					<div className='relative w-full h-full overflow-hidden'>
						{/* Subtle gradient base */}
						<div
							className='absolute inset-0'
							style={{
								background: `linear-gradient(135deg, ${glowColor}${baseOpacity} 0%, transparent 60%, ${glowColor}${midOpacity} 100%)`
							}}
						/>
						{/* Drifting leaves */}
						{leaves.map(leaf => (
							<div
								key={leaf.id}
								className={`absolute ${isPaused ? 'animation-paused' : ''}`}
								style={{
									left: `${leaf.x}%`,
									top: '-20px',
									fontSize: leaf.size,
									opacity: isLight ? 1.0 : leaf.opacity,
									color: glowColor,
									animation: isPaused
										? 'none'
										: `leafFall ${leaf.duration * speedMultiplier}s ease-in-out ${leaf.delay}s infinite, leafRotate ${leaf.rotationDuration}s linear ${leaf.delay}s infinite`
								}}
							>
								🍂
								{/* Warm gradient */}
								<div
									className='absolute bottom-0 left-0 right-0 h-12'
									style={{
										background: `linear-gradient(to top, ${glowColor}, transparent)`,
										opacity: isLight ? 0.2 : 0.2
									}}
								/>
							</div>
						))}
					</div>
				);
		}
	};

	// Choose render mode based on backgroundType
	const renderSeasonContent = () => {
		// Show message in light mode - ambience not supported
		if (isLight) {
			return (
				<div
					className='relative w-full h-full flex items-center justify-center'
					style={{
						background:
							'linear-gradient(135deg, #f3e7e9 0%, #e3eeff 50%, #f5f7fa 100%)'
					}}
				>
					<div className='text-center p-4'>
						<div className='text-4xl mb-2'>☀️</div>
						<div
							className='text-xs font-medium'
							style={{ color: '#4b5563' }}
						>
							Ambience disabled in light mode
						</div>
						<div
							className='text-[10px] mt-1'
							style={{ color: '#6b7280' }}
						>
							Switch to dark mode for ambient effects
						</div>
					</div>
				</div>
			);
		}

		if (backgroundType === 'gradient') {
			return renderGradientBackground();
		}
		return renderParticlesBackground();
	};

	return (
		<div className='glass-panel h-full relative rounded-xl border border-zetta-border bg-zetta-card hover:bg-zetta-bg transition-colors overflow-hidden flex flex-col'>
			{/* Header Section */}
			<div className='flex items-center justify-between shrink-0 px-3 py-3 md:px-4 md:py-4 z-10 relative'>
				<div className='flex items-center gap-2'>
					<div className='p-1.5 rounded-lg bg-zetta-bg border border-zetta-border backdrop-blur-md'>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zetta-neon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 2v4" />
							<path d="M12 18v4" />
							<path d="M4.93 4.93l2.83 2.83" />
							<path d="M16.24 16.24l2.83 2.83" />
							<path d="M2 12h4" />
							<path d="M18 12h4" />
							<path d="M4.93 19.07l2.83-2.83" />
							<path d="M16.24 7.76l2.83-2.83" />
						</svg>
					</div>
					<h2
						className='text-sm font-semibold tracking-wide text-zetta-text drop-shadow-sm'
					>
						AMBIENCE
					</h2>
				</div>
			</div>

			<div className='flex-1 relative min-h-[200px] -mt-16'>
				{renderSeasonContent()}

				{/* Season indicator */}
				<div
					className='absolute bottom-2 right-2 text-xs capitalize'
					style={{ color: isLight ? '#6b7280' : 'var(--text-muted)' }}
				>
					{season} · {motionIntensity} · {backgroundType}
				</div>
			</div>

			{/* CSS Animations */}
			<style>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-10px) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(220px) translateX(20px);
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
            transform: translateY(200px) translateX(-20px);
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
            transform: translateY(220px) translateX(-30px);
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

        .animation-paused {
          animation-play-state: paused !important;
        }
      `}</style>
		</div>
	);
};

export default AmbientPanel;

