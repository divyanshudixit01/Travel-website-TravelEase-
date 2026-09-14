import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ThreeCard3D — Perspective 3D Tilt Card with dynamic cursor specular reflection
 */
export const ThreeCard3D = ({
  children,
  className = '',
  maxTilt = 7,
  glare = true,
  spotlightColor = 'rgba(255, 255, 255, 0.12)',
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTilt({ rotateX, rotateY });
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="inline-block w-full"
      {...props}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ transformStyle: 'preserve-3d' }}
        className={`relative overflow-hidden rounded-3xl bg-white/90 dark:bg-[#141622]/85 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.07)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] transition-colors duration-300 hover:border-amber-400/50 dark:hover:border-white/25 ${className}`}
      >
        {/* Dynamic Specular Spotlight Glare */}
        {glare && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle 320px at ${glarePos.x}% ${glarePos.y}%, ${spotlightColor}, transparent 70%)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Ambient Top Rim Highlight */}
        <div
          className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/30 to-transparent pointer-events-none z-20"
          aria-hidden="true"
        />

        {/* Card Content with 3D Depth */}
        <div style={{ transform: 'translateZ(20px)' }} className="relative z-10 w-full h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default ThreeCard3D;
