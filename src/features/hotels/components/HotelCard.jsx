import React, { useState } from 'react';
import { ThreeUIButton } from '../../../components/ui/ThreeUIButton';
import {
  FaStar,
  FaMapMarkerAlt,
  FaCheck,
  FaWifi,
  FaSwimmingPool,
  FaSpa,
  FaUtensils,
  FaShieldAlt,
  FaImages,
  FaCompass
} from 'react-icons/fa';

const getAmenityIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('pool') || n.includes('swim')) return <FaSwimmingPool className="text-cyan-500" />;
  if (n.includes('spa') || n.includes('massage') || n.includes('wellness')) return <FaSpa className="text-purple-500" />;
  if (n.includes('wifi') || n.includes('internet')) return <FaWifi className="text-blue-500" />;
  if (n.includes('breakfast') || n.includes('dine') || n.includes('food') || n.includes('restaurant')) return <FaUtensils className="text-amber-500" />;
  return <FaCheck className="text-emerald-500" />;
};

export const HotelCard = ({
  hotel,
  onSelect,
  currency = 'INR'
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!hotel) return null;

  const photos = Array.isArray(hotel.photo_gallery) && hotel.photo_gallery.length > 0
    ? hotel.photo_gallery
    : [hotel.primary_photo || hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'];

  const currentPhoto = photos[activePhotoIdx] || photos[0];

  const displayPrice = hotel.priceFormatted || (
    currency === 'INR'
      ? `₹${Math.round(hotel.priceAmount || 3200).toLocaleString('en-IN')}`
      : `$${Math.round((hotel.priceAmount || 3200) / 85)}`
  );

  const starCount = Math.max(1, Math.min(5, Math.floor(hotel.starRating || 4)));

  return (
    <div className="card-elevated rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 group flex flex-col md:flex-row relative">
      
      {/* Aspect-Ratio Image Gallery Box with Interactive Thumbnail Switcher */}
      <div className="w-full md:w-80 relative aspect-[16/10] md:aspect-auto shrink-0 overflow-hidden bg-slate-900 flex flex-col justify-between">
        <div className="relative w-full h-full min-h-[200px]">
          <img
            src={currentPhoto}
            alt={hotel.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[11px] font-black flex items-center gap-1 shadow-lg">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: starCount }).map((_, i) => (
                  <FaStar key={i} className="text-[10px]" />
                ))}
              </div>
              <span className="ml-1 text-[10px] uppercase tracking-wider">{hotel.starRating ? `${hotel.starRating}★` : 'Hotel'}</span>
            </div>

            {hotel.dealBadge && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md w-max">
                {hotel.dealBadge}
              </span>
            )}
          </div>

          {/* OYO or Nearby Stay Pill */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 z-10 items-end">
            {hotel.is_oyo && (
              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-lg">
                OYO Rooms
              </span>
            )}
            {hotel.is_nearby && (
              <span className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/20">
                <FaCompass className="text-[9px]" /> Surrounding District
              </span>
            )}
          </div>

          {/* Interactive Photo Thumbnail Strip (MMT Style) */}
          {photos.length > 1 && (
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-20">
              <div className="flex items-center gap-1.5">
                {photos.slice(0, 4).map((imgUrl, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIdx(pIdx);
                    }}
                    className={`w-9 h-7 rounded-md overflow-hidden border-2 transition-all shadow-md ${
                      activePhotoIdx === pIdx ? 'border-amber-400 scale-105' : 'border-white/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <span className="text-[10px] text-white/90 font-bold bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                <FaImages className="text-[9px]" /> {photos.length} Photos
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hotel Details & Live Pricing */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Top Bar: Title & User Score */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                  {hotel.name}
                </h3>
                {hotel.is_nearby && (
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                    {hotel.nearby_label || 'Surrounding District'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <FaMapMarkerAlt className="text-amber-500 shrink-0 text-xs" />
                <span className="truncate">{hotel.address || `${hotel.city}, ${hotel.country}`}</span>
              </p>
            </div>

            {hotel.userRating && (
              <div className="text-right shrink-0 flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 block leading-tight">
                    {hotel.ratingText || (hotel.userRating >= 4.5 ? 'Superb' : 'Very Good')}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 block">
                    {hotel.reviewsCount ? `${hotel.reviewsCount} verified reviews` : 'Verified Stay'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                  {hotel.userRating}
                </div>
              </div>
            )}
          </div>

          {/* Highlights & Amenity Badges */}
          <div className="flex flex-wrap gap-1.5 my-3.5">
            {(hotel.amenities || ['Free WiFi', 'Breakfast Included', 'AC']).slice(0, 5).map((amenity, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium"
              >
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Free Cancellation Guarantee & Dynamic Rate CTA */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <FaShieldAlt className="text-xs shrink-0" />
              <span>{hotel.cancellation?.cancellation_text || 'Free Cancellation Available'}</span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Instant TravelEase voucher • Verified booking ID
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Per Night</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                {displayPrice}
              </div>
              <span className="text-[10px] text-slate-400 block">+ GST & fees included</span>
            </div>

            <div className="flex items-center gap-2">
              <ThreeUIButton
                type="button"
                variant="amber-glow"
                size="sm"
                onClick={() => onSelect(hotel)}
                className="whitespace-nowrap"
              >
                Select Rooms
              </ThreeUIButton>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default HotelCard;
