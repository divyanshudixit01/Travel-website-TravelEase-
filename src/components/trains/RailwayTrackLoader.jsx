import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VandeBharatFrontIcon } from './RailwayIcons';

const STATUS_MESSAGES = [
  'Querying 5,200+ Pan-India Timetables across 8,990 Stations...',
  'Synchronizing Real-Time Station Platform Beacons & GPS Radar...',
  'Calculating Instant IRCTC Confirmation Probabilities & Quotas...',
  'Validating Live Coach Compositions & Seat Class Availabilities...',
  'Checking Guaranteed Lower Berth & Senior Citizen Quotas...'
];

const RailwayTrackLoader = ({ message = 'Searching Indian Railways Live...' }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-12 px-4 max-w-2xl mx-auto text-center">
      {/* ═══════ MINIMALIST RAILWAY TRACK & TRAIN ENGINE ═══════ */}
      <div className="relative h-24 w-full max-w-sm mx-auto flex items-center justify-center overflow-hidden mb-6">
        {/* Soft Ambient Radial Halo */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-[#002B49]/15 to-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Railway Track Cross-Ties (Sleepers) */}
        <div className="absolute bottom-5 left-0 right-0 h-3 flex items-center justify-between opacity-30">
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-3 bg-slate-400 dark:bg-slate-500 rounded-sm"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.08 }}
            />
          ))}
        </div>

        {/* Dual Steel Rails */}
        <div className="absolute bottom-7 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#002B49] dark:via-cyan-400 to-transparent opacity-80" />
        <div className="absolute bottom-4 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />

        {/* Aerodynamic Vande Bharat Locomotive */}
        <motion.div
          animate={{ x: [-140, 140] }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: [0.45, 0, 0.55, 1],
            repeatType: 'reverse'
          }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Forward Light Projection */}
          <div className="absolute -right-14 top-2 w-16 h-8 bg-gradient-to-r from-amber-300/40 via-amber-200/10 to-transparent blur-sm transform -rotate-6 pointer-events-none" />

          {/* Locomotive Body */}
          <div className="w-12 h-12 rounded-2xl bg-[#002B49] border border-amber-400/40 p-2 shadow-lg flex items-center justify-center text-amber-400">
            <VandeBharatFrontIcon className="w-8 h-8 text-amber-300" />
          </div>

          {/* Wheel Spark Indicator */}
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 0.4 }}
            className="w-3 h-1 bg-amber-400 rounded-full blur-[1px] mt-1"
          />
        </motion.div>
      </div>

      {/* ═══════ STATUS HEADING & DYNAMIC ROTATING SUBTEXT ═══════ */}
      <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
        {message}
      </h3>

      <div className="h-7 mt-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.25 }}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>{STATUS_MESSAGES[msgIndex]}</span>
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ═══════ MINIMALIST SHIMMER SKELETON CARDS (DRIBBLE IRCTC STYLE) ═══════ */}
      <div className="mt-6 space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 relative overflow-hidden shadow-sm text-left"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
                </div>
                <div className="w-56 h-5 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="w-36 h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="w-24 h-9 bg-amber-500/20 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RailwayTrackLoader;
