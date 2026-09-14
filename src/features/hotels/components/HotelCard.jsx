import React from 'react';
import { ThreeUIButton } from '../../../components/ui/ThreeUIButton';
import { FaStar, FaMapMarkerAlt, FaCheck, FaWifi, FaSwimmingPool, FaSpa, FaUtensils } from 'react-icons/fa';

const getAmenityIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('pool') || n.includes('swim')) return <FaSwimmingPool className="text-cyan-500" />;
  if (n.includes('spa') || n.includes('massage')) return <FaSpa className="text-purple-500" />;
  if (n.includes('wifi')) return <FaWifi className="text-blue-500" />;
  if (n.includes('breakfast') || n.includes('dine') || n.includes('food')) return <FaUtensils className="text-amber-500" />;
  return <FaCheck className="text-emerald-500" />;
};

export const HotelCard = ({
  hotel,
  onSelect,
  formatPrice
}) => {
  return (
    <div className="card-elevated rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 group flex flex-col md:flex-row">
      
      {/* Aspect-Ratio Image Box (Eliminates CLS = 0) */}
      <div className="w-full md:w-80 relative aspect-[16/10] md:aspect-auto shrink-0 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/hero_day_dolomites.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />

        {/* Tier / Star Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-[11px] font-black flex items-center gap-1">
          <FaStar className="text-amber-400 text-xs" />
          <span>{hotel.starRating ? `${hotel.starRating}-Star` : 'Verified Hotel'}</span>
        </div>
      </div>

      {/* Hotel Information & Pricing */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Top Bar: Title & User Score */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                {hotel.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <FaMapMarkerAlt className="text-amber-500 shrink-0" />
                <span className="truncate">{hotel.address || `${hotel.city}, ${hotel.country}`}</span>
              </p>
            </div>

            {hotel.userRating && (
              <div className="text-right shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                  {hotel.userRating}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                  {hotel.reviewsCount ? `${hotel.reviewsCount} reviews` : 'Superb'}
                </span>
              </div>
            )}
          </div>

          {/* Highlights & Amenity Badges */}
          <div className="flex flex-wrap gap-1.5 my-4">
            {(hotel.amenities || ['Free WiFi', 'Breakfast Included', 'Pool']).slice(0, 4).map((amenity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium"
              >
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Free Cancellation Guarantee & Room Rate CTA */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <FaCheck className="text-xs" /> Free Cancellation Available
            </span>
            <span className="text-[11px] text-slate-400 block">
              Inclusive of all hospitality taxes & service charges
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Per Night</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                {formatPrice ? formatPrice(hotel.pricePerNightUSD || 120) : `$${hotel.pricePerNightUSD || 120}`}
              </div>
            </div>

            <ThreeUIButton
              type="button"
              variant="amber-glow"
              size="sm"
              onClick={() => onSelect(hotel)}
            >
              Select Rooms
            </ThreeUIButton>
          </div>
        </div>

      </div>

    </div>
  );
};

export default HotelCard;
