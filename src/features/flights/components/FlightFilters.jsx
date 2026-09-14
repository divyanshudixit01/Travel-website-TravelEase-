import React from 'react';
import { FaFilter, FaRedo } from 'react-icons/fa';

export const FlightFilters = ({
  stopsFilter,
  setStopsFilter,
  selectedCabin,
  setSelectedCabin,
  maxPrice,
  setMaxPrice,
  priceRangeLimit = 1500,
  availableAirlines = [],
  selectedAirlines = [],
  onToggleAirline,
  onResetFilters,
  formatPrice,
  totalResultsCount = 0
}) => {
  return (
    <aside className="card-elevated p-6 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 sticky top-24 space-y-6">
      
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-black text-base text-slate-900 dark:text-white">
          <FaFilter className="text-amber-500 text-xs" />
          <span>Filters</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {totalResultsCount} flights
          </span>
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-bold text-slate-400 hover:text-amber-500 flex items-center gap-1 transition-colors"
        >
          <FaRedo className="text-[10px]" /> Reset
        </button>
      </div>

      {/* 1. Stops Filter */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Stops / Layovers
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'all', label: 'Any' },
            { id: 'direct', label: 'Direct' },
            { id: '1stop', label: '1 Stop' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStopsFilter(item.id)}
              className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                stopsFilter === item.id
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Cabin Class */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Cabin Class
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'ECONOMY', label: 'Economy' },
            { id: 'PREMIUM_ECONOMY', label: 'Premium' },
            { id: 'BUSINESS', label: 'Business' },
            { id: 'FIRST', label: 'First Class' }
          ].map((cabin) => (
            <button
              key={cabin.id}
              type="button"
              onClick={() => setSelectedCabin(cabin.id)}
              className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all text-center ${
                selectedCabin === cabin.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400/50'
              }`}
            >
              {cabin.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Max Price Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Max Budget
          </label>
          <span className="text-sm font-mono font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {formatPrice ? formatPrice(maxPrice) : `$${maxPrice}`}
          </span>
        </div>
        <input
          type="range"
          min="50"
          max={priceRangeLimit}
          step="25"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>$50</span>
          <span>${priceRangeLimit}</span>
        </div>
      </div>

      {/* 4. Airlines Multiselect */}
      {availableAirlines.length > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Airlines ({availableAirlines.length})
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {availableAirlines.map((airline) => {
              const isChecked = selectedAirlines.includes(airline);
              return (
                <label
                  key={airline}
                  className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer py-1"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleAirline(airline)}
                      className="rounded text-amber-500 focus:ring-amber-400 dark:bg-slate-800 dark:border-slate-700"
                    />
                    <span>{airline}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

    </aside>
  );
};

export default FlightFilters;
