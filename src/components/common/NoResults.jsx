import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaExclamationCircle, FaRocket, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { ThreeUIButton } from '../ui/ThreeUIButton';

/**
 * NoResults — Honest empty state for search pages.
 * Shows when API returns no results or service is unavailable.
 * 
 * @param {string} type - 'no-results' | 'coming-soon' | 'api-error'
 * @param {string} serviceName - e.g. 'Flights', 'Hotels', 'Car Rentals'
 * @param {string} searchQuery - what the user searched for
 * @param {Array} suggestions - alternative suggestions to show
 */
const NoResults = ({ 
  type = 'no-results', 
  serviceName = 'Results', 
  searchQuery = '',
  suggestions = [],
  onRetry = null,
}) => {
  const configs = {
    'no-results': {
      icon: <FaSearch className="w-8 h-8 text-slate-400" />,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      title: `No ${serviceName} Found`,
      description: searchQuery 
        ? `We couldn't find ${serviceName.toLowerCase()} matching "${searchQuery}". Try adjusting your search criteria.`
        : `No ${serviceName.toLowerCase()} available for this search. Try different dates or destinations.`,
      tips: [
        { icon: <FaCalendarAlt />, text: 'Try flexible dates or nearby dates' },
        { icon: <FaMapMarkerAlt />, text: 'Check for alternate airports or cities' },
      ],
    },
    'no-flights': {
      icon: <FaSearch className="w-8 h-8 text-amber-400" />,
      iconBg: 'bg-amber-50 dark:bg-amber-500/10',
      title: 'No Flight Routes Found',
      description: searchQuery
        ? `No active direct or connecting flights found for "${searchQuery}". Try flexible dates or major hub airports.`
        : 'No scheduled flights found matching your current filters. Try relaxing airline or stop preferences.',
      tips: [
        { icon: <FaCalendarAlt />, text: 'Check ±3 days for lower fares & open seats' },
        { icon: <FaMapMarkerAlt />, text: 'Try nearby international hub airports (e.g. DEL, BOM, DXB)' },
      ],
    },
    'no-hotels': {
      icon: <FaSearch className="w-8 h-8 text-indigo-400" />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
      title: 'No Properties Found',
      description: searchQuery
        ? `No hotels or luxury stays matched "${searchQuery}". Try expanding your search radius or resetting filters.`
        : 'No stays available for the selected criteria. Try adjusting budget or star rating filters.',
      tips: [
        { icon: <FaCalendarAlt />, text: 'Try shifting check-in dates by a few days' },
        { icon: <FaMapMarkerAlt />, text: 'Search popular nearby neighborhoods or city centers' },
      ],
    },
    'coming-soon': {
      icon: <FaRocket className="w-8 h-8 text-indigo-400" />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
      title: `${serviceName} — Coming Soon`,
      description: `We're actively integrating real-time ${serviceName.toLowerCase()} providers. This feature will be available shortly.`,
      tips: [],
    },
    'api-error': {
      icon: <FaExclamationCircle className="w-8 h-8 text-amber-400" />,
      iconBg: 'bg-amber-50 dark:bg-amber-500/10',
      title: 'Service Temporarily Unavailable',
      description: `Our ${serviceName.toLowerCase()} data provider is currently experiencing issues. Please try again in a few minutes.`,
      tips: [],
    },
  };

  const config = configs[type] || configs['no-results'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className={`w-20 h-20 rounded-2xl ${config.iconBg} flex items-center justify-center mb-6`}>
        {config.icon}
      </div>

      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
        {config.title}
      </h3>

      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mb-6">
        {config.description}
      </p>

      {/* Tips */}
      {config.tips.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {config.tips.map((tip, idx) => (
            <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="text-indigo-500">{tip.icon}</span>
              {tip.text}
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Popular alternatives</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((s, idx) => {
              const label = typeof s === 'string' ? s : (s?.label || s?.text || '');
              const onClick = typeof s === 'object' && s?.onClick ? s.onClick : undefined;
              return onClick ? (
                <button
                  key={idx}
                  type="button"
                  onClick={onClick}
                  className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-500/20 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                  {label}
                </button>
              ) : (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-500/20"
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onRetry && (
          <ThreeUIButton 
            onClick={onRetry}
            variant="amber-glow"
            size="sm"
          >
            Try Again
          </ThreeUIButton>
        )}
        <ThreeUIButton 
          to="/destinations" 
          variant="liquid-metal"
          size="sm"
        >
          Browse Destinations
        </ThreeUIButton>
      </div>
    </motion.div>
  );
};

export default NoResults;
