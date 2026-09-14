import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * ThreeUIButton — Production-ready ThreeUI inspired button
 * Variants:
 *  - 'liquid-metal': High-contrast platinum specular pill with light sweep
 *  - 'specular-dark': Obsidian glass with metallic rim highlight
 *  - 'amber-glow': Warm metallic gold/amber with soft ambient backglow
 *  - 'glass-frost': Subtle frosted glass with hairline specular border
 */
export const ThreeUIButton = ({
  children,
  icon,
  iconPosition = 'left',
  onClick,
  className = '',
  variant = 'liquid-metal',
  size = 'md',
  to,
  href,
  type = 'button',
  disabled = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 px-3.5 text-xs gap-1.5',
    md: 'h-10 px-5 text-xs gap-2',
    lg: 'h-12 px-7 text-sm gap-2.5',
  }[size] || 'h-10 px-5 text-xs gap-2';

  const iconSizeClass = {
    sm: 'w-3 h-3 text-xs',
    md: 'w-3.5 h-3.5 text-xs',
    lg: 'w-4 h-4 text-sm',
  }[size] || 'w-3.5 h-3.5 text-xs';

  const variantStyles = {
    'liquid-metal': `
      text-white dark:text-[#090a0f] font-bold tracking-wider uppercase
      bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950
      dark:bg-gradient-to-b dark:from-[#ffffff] dark:via-[#f0f2f8] dark:to-[#d8dceb]
      border border-slate-700/80 dark:border-white/80
      shadow-[0_8px_20px_-6px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]
      dark:shadow-[0_8px_20px_-6px_rgba(255,255,255,0.4),inset_0_1px_0_#ffffff,inset_0_-1px_0_rgba(0,0,0,0.18)]
      hover:from-black hover:to-slate-900
      dark:hover:from-[#ffffff] dark:hover:via-[#f5f7fc] dark:hover:to-[#e2e6f4]
      hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.45)]
      dark:hover:shadow-[0_12px_28px_-6px_rgba(255,255,255,0.6),inset_0_1px_0_#ffffff]
    `,
    'specular-dark': `
      text-slate-800 dark:text-[#e2e5ee] font-semibold tracking-wider uppercase
      bg-gradient-to-b from-white to-slate-100/90
      dark:bg-gradient-to-b dark:from-[#242630]/90 dark:to-[#121318]/95
      border border-slate-300/90 dark:border-white/12
      shadow-[0_6px_16px_-4px_rgba(0,0,0,0.06),inset_0_1px_0_#ffffff]
      dark:shadow-[0_12px_26px_-8px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.5)]
      hover:text-slate-950 dark:hover:text-white
      hover:border-slate-400 dark:hover:border-white/25
      hover:bg-gradient-to-b hover:from-slate-50 hover:to-slate-100
      dark:hover:bg-gradient-to-b dark:hover:from-[#2e313e]/95 dark:hover:to-[#171920]/95
      hover:shadow-[0_10px_22px_-4px_rgba(0,0,0,0.1),inset_0_1px_0_#ffffff]
      dark:hover:shadow-[0_16px_32px_-8px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.35)]
    `,
    'amber-glow': `
      text-slate-950 font-extrabold tracking-wider uppercase
      bg-gradient-to-b from-[#fbbf24] via-[#f59e0b] to-[#d97706]
      border border-amber-400/90 dark:border-amber-300/80
      shadow-[0_8px_24px_-4px_rgba(245,158,11,0.45),inset_0_1px_0_rgba(255,255,255,0.6)]
      hover:shadow-[0_12px_32px_-4px_rgba(245,158,11,0.65),inset_0_1px_0_rgba(255,255,255,0.8)]
    `,
    'glass-frost': `
      text-slate-700 dark:text-slate-200 font-medium tracking-wide
      bg-slate-100/90 dark:bg-white/[0.05] backdrop-blur-md
      border border-slate-300/80 dark:border-white/15
      shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_#ffffff]
      dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
      hover:text-slate-950 dark:hover:text-white
      hover:bg-slate-200/90 dark:hover:bg-white/[0.1]
      hover:border-slate-400 dark:hover:border-white/30
    `,
  }[variant] || '';

  const baseClasses = `
    relative inline-flex items-center justify-center
    rounded-full overflow-hidden select-none cursor-pointer
    font-mono transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses}
    ${variantStyles}
    ${className}
  `;

  const motionProps = {
    whileHover: disabled ? {} : { y: -1.5, scale: 1.015 },
    whileTap: disabled ? {} : { y: 0.5, scale: 0.975 },
    transition: { type: 'spring', stiffness: 450, damping: 25 },
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && (icon.$$typeof || icon.render))) {
      const IconComponent = icon;
      return <IconComponent className={iconSizeClass} aria-hidden="true" />;
    }
    return icon;
  };

  const iconElement = renderIcon();

  const content = (
    <>
      {/* Specular light sweep shimmer */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {iconElement && iconPosition === 'left' && (
        <span className="flex-none transition-transform duration-200 group-hover:scale-110">
          {iconElement}
        </span>
      )}
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
      {iconElement && iconPosition === 'right' && (
        <span className="flex-none transition-transform duration-200 group-hover:scale-110">
          {iconElement}
        </span>
      )}
    </>
  );

  const isFullWidth = className.includes('w-full');
  const wrapperClass = isFullWidth ? 'block w-full' : 'inline-block';

  if (to) {
    return (
      <motion.div {...motionProps} className={wrapperClass}>
        <Link
          to={disabled ? '#' : to}
          className={`group ${baseClasses}`}
          aria-disabled={disabled ? 'true' : undefined}
          onClick={disabled ? (e) => e.preventDefault() : onClick}
          {...props}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.a
        href={disabled ? undefined : href}
        className={`group ${baseClasses}`}
        aria-disabled={disabled ? 'true' : undefined}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        {...motionProps}
        {...props}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group ${baseClasses}`}
      {...motionProps}
      {...props}
    >
      {content}
    </motion.button>
  );
};

export default ThreeUIButton;
