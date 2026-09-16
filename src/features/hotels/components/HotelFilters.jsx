import React from 'react';
import { FaFilter, FaRedo, FaStar, FaBuilding, FaCrown, FaTag } from 'react-icons/fa';

export const HotelFilters = ({
  starFilter,
  setStarFilter,
  propertyTypeFilter = 'all',
  setPropertyTypeFilter,
  maxPrice,
  setMaxPrice,
  currency = 'INR',
  priceRangeLimit = currency === 'INR' ? 35000 : 600,
  selectedAmenities = [],
  onToggleAmenity,
  onResetFilters,
  formatPrice,
  totalResultsCount = 0
}) => {
  const POPULAR_AMENITIES = [
    'Swimming Pool',
    'Luxury Spa',
    'Free High-Speed WiFi',
    'Breakfast Included',
    'Air Conditioning',
    'Restaurant & Bar',
    'Valet Parking'
  ];

  const minPrice = currency === 'INR' ? 500 : 25;
  const step = currency === 'INR' ? 500 : 20;

  const formatBudget = (val) => {
    if (currency === 'INR') {
      return `₹${Number(val).toLocaleString('en-IN')}`;
    }
    return formatPrice ? formatPrice(val) : `$${val}`;
  };

  return (
    <aside className="card-elevated p-6 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 sticky top-24 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-black text-base text-slate-900 dark:text-white">
          <FaFilter className="text-amber-500 text-xs" />
          <span>Filters</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {totalResultsCount} stays
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

      {/* 1. Property Category Slabs (MMT Style) */}
      {setPropertyTypeFilter && (
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Property Category
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'all', label: 'All Stays', icon: <FaBuilding className="text-xs" /> },
              { id: 'RESORT', label: 'Luxury & 5★', icon: <FaCrown className="text-amber-400 text-xs" /> },
              { id: 'BUDGET_STAY', label: 'Budget & OYO', icon: <FaTag className="text-rose-500 text-xs" /> },
              { id: 'HOTEL', label: 'Standard Hotels', icon: <FaBuilding className="text-xs" /> },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setPropertyTypeFilter(cat.id)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all text-left flex items-center gap-1.5 ${
                  propertyTypeFilter === cat.id
                    ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400/50'
                }`}
              >
                {cat.icon}
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Star Rating Pills */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Star Rating
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: '3', label: '3★+' },
            { id: '4', label: '4★+' },
            { id: '5', label: '5★' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStarFilter(item.id)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all text-center ${
                starFilter === item.id
                  ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Nightly Budget Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Nightly Budget Up To
          </label>
          <span className="text-sm font-mono font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {formatBudget(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={minPrice}
          max={priceRangeLimit}
          step={step}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>{formatBudget(minPrice)}</span>
          <span>{formatBudget(priceRangeLimit)}</span>
        </div>
      </div>

      {/* 4. Verified Amenities Checklist */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Verified Amenities
        </label>
        <div className="space-y-2">
          {POPULAR_AMENITIES.map((amenity) => {
            const isChecked = selectedAmenities.includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer py-1"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleAmenity(amenity)}
                    className="rounded text-amber-500 focus:ring-amber-400 dark:bg-slate-800 dark:border-slate-700"
                  />
                  <span>{amenity}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

    </aside>
  );
};

export default HotelFilters;
