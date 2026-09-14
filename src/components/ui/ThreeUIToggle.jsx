import React from 'react';
import { motion } from 'framer-motion';

/**
 * ThreeUIToggle — Tactile ThreeUI mechanical switches and spring segmented pill toggles
 */

// 1. Multi-segment pill toggle
export const SegmentedPillToggle = ({
  options = [],
  value,
  activeId,
  onChange,
  className = '',
  size = 'md',
  layoutId = 'segmentedPillActiveIndicator',
}) => {
  const currentValue = value !== undefined ? value : activeId;
  const sizeStyles = {
    sm: 'p-1 gap-1 text-[11px]',
    md: 'p-1.5 gap-1.5 text-xs',
    lg: 'p-2 gap-2 text-sm',
  }[size] || 'p-1.5 gap-1.5 text-xs';

  return (
    <div
      className={`relative inline-flex items-center rounded-full bg-slate-200/80 dark:bg-[#14161f]/80 backdrop-blur-xl border border-slate-300/80 dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_-6px_rgba(0,0,0,0.6)] ${sizeStyles} ${className}`}
    >
      {options.map((option) => {
        const isSelected = currentValue === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`relative px-3.5 py-1.5 rounded-full font-mono font-medium tracking-wider uppercase transition-colors duration-200 z-10 flex items-center gap-1.5 select-none ${
              isSelected ? 'text-white dark:text-[#090a0f] font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-gradient-to-b from-[#1e293b] to-[#0f172a] dark:from-[#ffffff] dark:via-[#edf0f8] dark:to-[#d4d8e6] border border-slate-700/50 dark:border-white/80 shadow-[0_4px_12px_rgba(15,23,42,0.25)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.4),inset_0_1px_0_#ffffff] z-[-1]"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            {option.icon && (
              <span className={`text-xs transition-transform ${isSelected ? 'scale-110' : 'opacity-70'}`}>
                {React.isValidElement(option.icon)
                  ? option.icon
                  : typeof option.icon === 'function' || (typeof option.icon === 'object' && option.icon !== null && (option.icon.$$typeof || option.icon.render))
                    ? React.createElement(option.icon, { className: 'w-3.5 h-3.5', 'aria-hidden': 'true' })
                    : option.icon}
              </span>
            )}
            <span>{option.label}</span>
            {option.badge && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-sans font-extrabold ${
                isSelected ? 'bg-amber-400 text-black' : 'bg-black/10 dark:bg-white/10 text-amber-600 dark:text-amber-300'
              }`}>
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedPillToggle;
