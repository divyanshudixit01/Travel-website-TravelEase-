import React, { useState, useRef, useEffect, useMemo } from 'react';
import { POPULAR_AIRPORTS, searchAirportsList } from '../../../services/flightApi';
import { GLOBAL_AIRPORTS } from '../../../services/realtimeDataEngine';
import { FaPlaneDeparture, FaPlaneArrival, FaSearch, FaCheck } from 'react-icons/fa';

export const AirportAutocomplete = ({
  label,
  value,
  onChange,
  type = 'origin', // 'origin' | 'destination'
  placeholder = 'Search city or airport code...'
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(POPULAR_AIRPORTS);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  // Selected airport descriptor
  const selectedAirport = useMemo(() => {
    return (
      POPULAR_AIRPORTS.find((a) => a.code === value) ||
      GLOBAL_AIRPORTS.find((a) => a.code === value) || {
        code: value,
        city: value,
        name: `${value} Airport`,
        flag: '✈️'
      }
    );
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle typing search
  const handleInputChange = async (text) => {
    setQuery(text);
    setHighlightIndex(0);
    const results = await searchAirportsList(text);
    setSuggestions(results);
  };

  // Keyboard navigation: ArrowDown, ArrowUp, Enter, Escape
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

  const handleSelect = (airport) => {
    onChange(airport.code);
    setIsOpen(false);
    setQuery('');
  };

  // Helper to highlight matching text
  const highlightMatch = (text, q) => {
    if (!q || !text) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.substring(0, idx)}
        <span className="font-extrabold text-amber-500 underline decoration-amber-400/50">
          {text.substring(idx, idx + q.length)}
        </span>
        {text.substring(idx + q.length)}
      </>
    );
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-[220px]">
      <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
        {type === 'origin' ? <FaPlaneDeparture className="text-amber-500 text-xs" /> : <FaPlaneArrival className="text-amber-500 text-xs" />}
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full text-left bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400/80 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 flex items-center justify-between shadow-sm group min-h-[56px]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
            {selectedAirport.flag || '✈️'}
          </span>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-slate-900 dark:text-white font-black text-lg tracking-tight font-mono">
                {selectedAirport.code}
              </span>
              <span className="text-slate-600 dark:text-slate-300 text-sm font-semibold truncate">
                · {selectedAirport.city}
              </span>
            </div>
            <span className="block text-[11px] text-slate-400 truncate">
              {selectedAirport.name}
            </span>
          </div>
        </div>
      </button>

      {/* Autocomplete Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search Input Filter */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50">
            <FaSearch className="text-slate-400 text-xs shrink-0 ml-1" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Suggestions List */}
          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {suggestions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No matching airports found for "{query}".
              </div>
            ) : (
              suggestions.map((airport, index) => {
                const isSelected = airport.code === value;
                const isHighlighted = index === highlightIndex;

                return (
                  <button
                    key={airport.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(airport)}
                    onMouseEnter={() => setHighlightIndex(index)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-colors min-h-[48px] ${
                      isHighlighted
                        ? 'bg-amber-500/15 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">{airport.flag || '✈️'}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                            {highlightMatch(airport.code, query)}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                            · {highlightMatch(airport.city, query)}, {airport.country}
                          </span>
                        </div>
                        <span className="block text-[11px] text-slate-400 truncate">
                          {highlightMatch(airport.name, query)}
                        </span>
                      </div>
                    </div>
                    {isSelected && <FaCheck className="text-amber-500 text-xs shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
