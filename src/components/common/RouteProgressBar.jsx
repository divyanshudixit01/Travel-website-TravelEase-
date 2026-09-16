import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteProgressBar — Top-of-page slim gradient progress bar
 * Renders smooth visual feedback across route navigations.
 */
export const RouteProgressBar = () => {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none overflow-hidden">
      <div className="h-full w-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 animate-route-progress shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
    </div>
  );
};

export default RouteProgressBar;
