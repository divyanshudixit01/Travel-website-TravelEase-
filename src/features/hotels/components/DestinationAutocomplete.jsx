import React, { useState, useRef, useEffect } from 'react';
import { POPULAR_DESTINATIONS, searchHotelDestinations } from '../../../services/hotelApi';
import { FaMapMarkerAlt, FaSearch, FaCheck } from 'react-icons/fa';

export const DestinationAutocomplete = ({
  value,
  onChange,
  onSelectDest,
  placeholder = 'City, destination or property name...'
}) => {
  const [query, setQuery] = useState(value || 'Dubai');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(POPULAR_DESTINATIONS);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (text) => {
    setQuery(text);
    setHighlightIndex(0);

    if (text.length >= 2) {
      try {
        const liveDest = await searchHotelDestinations(text);
        if (liveDest && liveDest.length > 0) {
          setSuggestions(liveDest);
          return;
        }
      } catch (e) {
        // ignore network delay and fallback to filter
      }
    }

    const filtered = POPULAR_DESTINATIONS.filter(d =>
      d.city.toLowerCase().includes(text.toLowerCase()) ||
      d.country.toLowerCase().includes(text.toLowerCase())
    );
    setSuggestions(filtered.length > 0 ? filtered : POPULAR_DESTINATIONS);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1 < suggestions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 >= 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[highlightIndex]) {
        handleSelect(suggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleSelect = (dest) => {
    onChange(dest.city);
    if (onSelectDest) onSelectDest(dest);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-[240px]">
      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
        <FaMapMarkerAlt className="text-amber-500 text-xs" />
        Destination City
      </label>

      {/* Input Trigger */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm font-extrabold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 min-h-[56px] shadow-sm"
        />
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
      </div>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden max-h-72 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 overflow-y-auto max-h-64">
            <span className="text-[10px] font-bold uppercase text-slate-400 px-3 py-1.5 block tracking-wider">
              Popular Verified Destinations
            </span>
            {suggestions.map((dest, idx) => {
              const isSelected = dest.city.toLowerCase() === value.toLowerCase();
              const isHighlighted = idx === highlightIndex;

              return (
                <button
                  key={`${dest.city}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(dest)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors min-h-[44px] ${
                    isHighlighted
                      ? 'bg-amber-500/15 text-slate-900 dark:text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{dest.flag || '📍'}</span>
                    <div>
                      <span className="font-extrabold text-sm block text-slate-900 dark:text-white">
                        {dest.city}
                      </span>
                      <span className="text-xs text-slate-400">
                        {dest.country}
                      </span>
                    </div>
                  </div>
                  {isSelected && <FaCheck className="text-amber-500 text-xs shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationAutocomplete;
