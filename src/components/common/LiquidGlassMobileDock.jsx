import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaCompass, FaTrain, FaPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * LiquidGlassMobileDock.jsx — Mobile-First Floating Liquid Glass Command Dock (<768px)
 * Featuring the TravelEase Logo Mark as the elevated centerpiece button.
 * Clicking the TravelEase logo opens the TravelEase Concierge Desk.
 */
export const LiquidGlassMobileDock = () => {
  const location = useLocation();

  const triggerConcierge = () => {
    window.dispatchEvent(new CustomEvent('open-travelease-concierge'));
  };

  const navItems = [
    { to: '/', label: 'Home', icon: FaHome },
    { to: '/destinations', label: 'Explore', icon: FaCompass },
    // Centerpiece: TravelEase Logo (opens Travel Concierge)
    { isAiTrigger: true, label: 'Concierge', icon: null },
    { to: '/trains', label: 'Trains', badge: 'Tatkal', icon: FaTrain },
    { to: '/flights', label: 'Flights', icon: FaPlane },
  ];

  return (
    <nav 
      className="lg:hidden fixed bottom-3 inset-x-0 z-40 flex justify-center pointer-events-none select-none px-4"
      aria-label="Mobile Dock Navigation"
      id="liquid-glass-mobile-dock"
    >
      <div className="pointer-events-auto relative rounded-full bg-white/80 dark:bg-[#070b14]/85 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.65)] px-2.5 py-1.5 flex items-center justify-between gap-1 max-w-[370px] w-full pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]">
        
        {/* Ambient Top Specular Highlight */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 dark:via-white/25 to-transparent pointer-events-none" />

        {navItems.map((item) => {
          if (item.isAiTrigger) {
            return (
              <div key="center-ai" className="relative -top-2.5 flex flex-col items-center flex-none mx-0.5">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={triggerConcierge}
                  type="button"
                  aria-label="Open TravelEase Concierge Desk"
                  className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-[0_4px_16px_rgba(245,158,11,0.45)] flex items-center justify-center cursor-pointer group"
                >
                  <div className="w-full h-full rounded-full bg-slate-950 dark:bg-[#070b14] flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                    <img 
                      src="/brand/logo-mark.svg" 
                      alt="TravelEase Concierge" 
                      className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" 
                    />
                  </div>
                  {/* Pulsing live beacon dot */}
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                </motion.button>
                <span className="text-[8px] font-mono font-bold text-amber-600 dark:text-amber-400 mt-0.5 tracking-widest uppercase">
                  Concierge
                </span>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-full transition-all relative ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-3.5 h-3.5 transition-transform ${isActive ? 'scale-110 text-amber-600 dark:text-amber-400' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full text-[7px] font-mono font-bold bg-amber-500 text-black leading-tight shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-mono mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activePillDockIndicator"
                  className="w-1 h-1 rounded-full bg-amber-500 mt-0.5 shadow-sm" 
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default LiquidGlassMobileDock;
