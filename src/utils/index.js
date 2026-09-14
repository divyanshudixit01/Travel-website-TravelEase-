/**
 * TravelEase Utilities Barrel Export
 * Centralized export point for shared utility helpers and schema generators.
 * @module utils
 */

export * from './schemas';

/**
 * Format a Date object or ISO string into a human-readable string
 * @param {Date|string} date 
 * @param {Intl.DateTimeFormatOptions} options 
 * @returns {string}
 */
export const formatDate = (date, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', options);
};

/**
 * Truncate a text string cleanly at word boundary
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trim()}...`;
};

/**
 * Safe class names joiner utility
 * @param  {...any} classes 
 * @returns {string}
 */
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
