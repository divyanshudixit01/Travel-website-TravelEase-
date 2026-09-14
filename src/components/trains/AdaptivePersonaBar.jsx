import { motion } from 'framer-motion';
import { SegmentedPillToggle } from '../ui/ThreeUIToggle';
import { FaUserGraduate, FaBriefcase, FaHeart, FaPhoneAlt, FaWheelchair, FaClock } from 'react-icons/fa';

const PERSONAS = {
  PRO: {
    id: 'pro',
    label: 'Commuter Pro',
    subLabel: 'दैनिक व व्यावसायिक',
    icon: FaBriefcase,
    color: 'from-amber-500 to-orange-600',
    tag: 'Tatkal Dials · Live Radar · Seat Probability'
  },
  SENIOR: {
    id: 'senior',
    label: 'Senior Citizen Mode',
    subLabel: 'वरिष्ठ नागरिक (आरामदायक)',
    icon: FaHeart,
    color: 'from-emerald-500 to-teal-600',
    tag: 'Large High-Contrast Text · Lower Berths · 139 Helpline'
  },
  STUDENT: {
    id: 'student',
    label: 'Student & Explorer',
    subLabel: 'विद्यार्थी व युवा',
    icon: FaUserGraduate,
    color: 'from-cyan-500 to-blue-600',
    tag: 'Budget Sleeper/2S · Heritage Quiz & Badges'
  }
};

const AdaptivePersonaBar = ({ activePersona, onSelectPersona, tatkalTimer }) => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-6">
      {/* Slim Persona Pill Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Persona Toggle Pills */}
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <SegmentedPillToggle
            options={Object.values(PERSONAS).map((p) => {
              const Icon = p.icon;
              return {
                id: p.id,
                label: p.label,
                icon: <Icon className="text-sm" />,
              };
            })}
            value={activePersona}
            onChange={onSelectPersona}
            layoutId="trainsPersonaToggle"
            size="sm"
          />
        </div>

        {/* Contextual Info Pill */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300/80">
          {activePersona === 'pro' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/70 dark:bg-white/5 rounded-full border border-slate-300/70 dark:border-white/8">
              <FaClock className="text-amber-500 dark:text-amber-400 text-[10px]" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{tatkalTimer || 'Opens 10:00 AM IST'}</span>
            </div>
          )}
          {activePersona === 'senior' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/70 dark:bg-white/5 rounded-full border border-slate-300/70 dark:border-white/8">
              <FaWheelchair className="text-emerald-600 dark:text-emerald-400 text-[10px]" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Lower Berths Prioritized</span>
            </div>
          )}
          {activePersona === 'student' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/70 dark:bg-white/5 rounded-full border border-slate-300/70 dark:border-white/8">
              <FaUserGraduate className="text-cyan-600 dark:text-cyan-400 text-[10px]" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Budget Fares Unlocked</span>
            </div>
          )}
        </div>
      </div>

      {/* Senior Citizen Assistance — Subtle Ribbon */}
      {activePersona === 'senior' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 bg-emerald-500/10 dark:bg-emerald-500/8 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <FaWheelchair />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Senior Citizen Assistance Active
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Large fonts · Lower berths · Wheelchair stations highlighted
              </p>
            </div>
          </div>
          <a
            href="tel:139"
            className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500/20 hover:bg-emerald-700 dark:hover:bg-emerald-500/30 text-white dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-500/30 shadow-sm"
          >
            <FaPhoneAlt className="text-xs" />
            <span>Helpline 139</span>
          </a>
        </motion.div>
      )}
    </div>
  );
};

export default AdaptivePersonaBar;
