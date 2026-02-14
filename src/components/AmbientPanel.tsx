import { useEffect, useMemo, useState } from 'react';

interface AmbientPanelProps {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  motionIntensity: 'low' | 'medium' | 'high';
  backgroundType: 'gradient' | 'particles' | 'custom';
  glowColor: string;
  isRunning: boolean;
  isEnabled: boolean;
}

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface Leaf extends Particle {
  rotation: number;
  rotationDuration: number;
}

export function AmbientPanel({
  season,
  motionIntensity,
  backgroundType,
  glowColor,
  isRunning,
  isEnabled,
}: AmbientPanelProps) {
  const [isPaused, setIsPaused] = useState(false);

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
        return season === 'winter' ? 15 : season === 'autumn' ? 3 : 12;
      case 'high':
        return season === 'winter' ? 20 : season === 'autumn' ? 4 : 16;
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
      opacity: 0.3 + Math.random() * 0.4,
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
      rotationDuration: 5 + Math.random() * 10,
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
      opacity: 0.2 + Math.random() * 0.3,
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

  // Generate generic ambient particles (always visible in particles mode)
  const ambientParticles = useMemo<Particle[]>(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 0.5 + Math.random() * 1,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      opacity: 0.05 + Math.random() * 0.1,
    }));
  }, []);

  // Render gradient-only background (no particles)
  const renderGradientBackground = () => {
    return (
      <div className="relative w-full h-full overflow-hidden">
        {/* Static gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${glowColor}10 0%, transparent 50%, ${glowColor}05 100%)`,
          }}
        />
        {/* Subtle radial glow */}
        <div
          className="absolute w-40 h-40 rounded-full blur-3xl opacity-20"
          style={{
            background: glowColor,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Corner accents */}
        <div
          className="absolute w-20 h-20 rounded-full blur-2xl opacity-10"
          style={{
            background: glowColor,
            left: '10%',
            top: '20%',
          }}
        />
        <div
          className="absolute w-16 h-16 rounded-full blur-2xl opacity-10"
          style={{
            background: glowColor,
            right: '15%',
            bottom: '30%',
          }}
        />
      </div>
    );
  };

  // Render particles background (with seasonal animations + ambient particles)
  const renderParticlesBackground = () => {
    return (
      <div className="relative w-full h-full overflow-hidden">
        {/* Ambient floating particles - always visible */}
        {ambientParticles.map(particle => (
          <div
            key={particle.id}
            className={`absolute rounded-full bg-white ${isPaused ? 'animation-paused' : ''}`}
            style={{
              left: `${particle.x}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              animation: isPaused
                ? 'none'
                : `ambientFloat ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            }}
          />
        ))}
        {/* Seasonal particles */}
        {season === 'winter' && (
          <>
            {snowParticles.map(particle => (
              <div
                key={`snow-${particle.id}`}
                className={`absolute rounded-full bg-white ${isPaused ? 'animation-paused' : ''}`}
                style={{
                  left: `${particle.x}%`,
                  width: particle.size,
                  height: particle.size,
                  opacity: particle.opacity,
                  animation: isPaused
                    ? 'none'
                    : `snowfall ${particle.duration * speedMultiplier}s linear ${particle.delay}s infinite`,
                }}
              />
            ))}
            {/* Subtle ground glow */}
            <div
              className="absolute bottom-0 left-0 right-0 h-8 opacity-20"
              style={{
                background: `linear-gradient(to top, ${glowColor}, transparent)`,
              }}
            />
          </>
        )}

        {season === 'summer' && (
          <>
            {/* Heat shimmer effect */}
            <div
              className={`absolute inset-0 ${isPaused ? 'animation-paused' : ''}`}
              style={{
                background: `radial-gradient(ellipse at 50% 100%, ${glowColor}20, transparent 70%)`,
                animation: isPaused ? 'none' : `shimmer ${3 * speedMultiplier}s ease-in-out infinite`,
              }}
            />
            {/* Gradient glow orbs */}
            <div
              className="absolute w-16 h-16 rounded-full blur-xl"
              style={{
                background: `${glowColor}30`,
                left: '20%',
                top: '30%',
                animation: isPaused ? 'none' : `float ${8 * speedMultiplier}s ease-in-out infinite`,
              }}
            />
            <div
              className="absolute w-12 h-12 rounded-full blur-xl"
              style={{
                background: `${glowColor}20`,
                right: '25%',
                top: '50%',
                animation: isPaused ? 'none' : `float ${10 * speedMultiplier}s ease-in-out 2s infinite`,
              }}
            />
          </>
        )}

        {season === 'spring' && (
          <>
            {/* Drifting particles */}
            {springParticles.map(particle => (
              <div
                key={`spring-${particle.id}`}
                className={`absolute rounded-full ${isPaused ? 'animation-paused' : ''}`}
                style={{
                  left: `${particle.x}%`,
                  width: particle.size,
                  height: particle.size,
                  background: glowColor,
                  opacity: particle.opacity,
                  animation: isPaused
                    ? 'none'
                    : `drift ${particle.duration * speedMultiplier}s ease-in-out ${particle.delay}s infinite`,
                }}
              />
            ))}
            {/* Subtle glow */}
            <div
              className="absolute w-20 h-20 rounded-full blur-2xl opacity-30"
              style={{
                background: glowColor,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </>
        )}

        {season === 'autumn' && (
          <>
            {/* Drifting leaves */}
            {leaves.map(leaf => (
              <div
                key={`leaf-${leaf.id}`}
                className={`absolute ${isPaused ? 'animation-paused' : ''}`}
                style={{
                  left: `${leaf.x}%`,
                  top: '-20px',
                  fontSize: leaf.size,
                  opacity: leaf.opacity,
                  animation: isPaused
                    ? 'none'
                    : `leafFall ${leaf.duration * speedMultiplier}s ease-in-out ${leaf.delay}s infinite, leafRotate ${leaf.rotationDuration}s linear ${leaf.delay}s infinite`,
                }}
              >
                {/* Warm glow */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-12 opacity-20"
                  style={{
                    background: `linear-gradient(to top, ${glowColor}, transparent)`,
                  }}
                />
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  // Choose render mode based on backgroundType
  const renderSeasonContent = () => {
    if (backgroundType === 'gradient') {
      return renderGradientBackground();
    }
    return renderParticlesBackground();
  };

  return (
    <div className="flex flex-col h-full bg-zetta-card border border-zetta-border rounded-lg overflow-hidden">
      <div className="px-2 md:px-4 py-1.5 md:py-2 border-b border-zetta-border bg-zetta-bg/50">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Ambience
        </span>
      </div>

      <div className="flex-1 relative min-h-[200px]">
        {renderSeasonContent()}

        {/* Season indicator */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 capitalize opacity-50">
          {season} · {motionIntensity} · {backgroundType}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes ambientFloat {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          20% {
            opacity: 0.3;
          }
          50% {
            transform: translateY(80px) translateX(10px);
            opacity: 0.2;
          }
          80% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(160px) translateX(-5px);
            opacity: 0;
          }
        }

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
}
