import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrain, FaArrowUp, FaCalendarAlt } from 'react-icons/fa';

const DynamicTransitHUD = ({
  fromCode,
  toCode,
  journeyDate,
  trainCount,
  runningCount,
  activeFilter,
  onFilterChange,
  onModifySearch
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show HUD when user has scrolled past 500px
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl"
        >
          <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-2xl border border-slate-200/60 dark:border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3">
            {/* Route Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#002B49] text-amber-400 flex items-center justify-center text-xs shrink-0">
                <FaTrain />
              </div>

              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{fromCode}</span>
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{toCode}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                    {runningCount} live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
                  <FaCalendarAlt className="text-[8px]" />
                  <span>{journeyDate}</span>
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="hidden sm:flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl">
              <button
                onClick={() => onFilterChange('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-[#002B49] text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                All ({trainCount})
              </button>
              <button
                onClick={() => onFilterChange('running')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  activeFilter === 'running'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                }`}
              >
                Live ({runningCount})
              </button>
            </div>

            {/* Modify Button */}
            <button
              onClick={onModifySearch}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/8 hover:bg-amber-500 hover:text-white text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition-all shrink-0"
            >
              <FaArrowUp className="text-[9px]" />
              <span className="hidden xs:inline">Modify</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DynamicTransitHUD;
