import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaStar, FaHeart, FaRegHeart, FaArrowRight, FaMapMarkerAlt,
  FaTrain, FaPlane, FaHotel, FaCompass
} from 'react-icons/fa';
import { FiNavigation, FiCompass } from 'react-icons/fi';
import { ThreeCard3D } from '../ui/ThreeCard3D';
import { SegmentedPillToggle } from '../ui/ThreeUIToggle';
import { ThreeUIButton } from '../ui/ThreeUIButton';
import { getLiveLandingDestinations } from '../../services/dynamicTravelEngine';
import { useBooking } from '../../context/BookingContext';
import { 
  getHotelsRoute, 
  getTrainsRoute, 
  getFlightsRoute, 
  getExploreRoute, 
  getItineraryRoute, 
  hasTrainNetwork 
} from '../../utils/travelBridge';

export const TrendingDestinations = () => {
  const navigate = useNavigate();
  const { setActiveBooking, addToast } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBookDest = (dest) => {
    const rawPrice = parseInt(String(dest.price || '18000').replace(/[^0-9]/g, ''), 10) || 18000;
    setActiveBooking({
      serviceType: 'package',
      itemTitle: `${dest.name} — ${dest.tag || 'Curated Escape'} (${dest.days || '5D/4N'})`,
      details: {
        destination: dest.name,
        country: dest.country,
        duration: dest.days,
        transit: 'Express Rail & Flight Network Available',
        hotel: 'Handpicked 5-Star Luxury Resort Stay',
        vibe: dest.category,
      },
      priceINR: rawPrice,
      priceUSD: Math.round(rawPrice / 86.5),
      image: dest.image,
    });
    addToast(`Reserved ${dest.name}! Proceeding to secure checkout.`, 'success');
    navigate('/checkout');
  };

  const categories = [
    { id: 'all', label: 'All Destinations' },
    { id: 'tropical', label: '🌴 Tropical & Coastal' },
    { id: 'alpine', label: '🏔️ Alpine & Snow' },
    { id: 'culture', label: '🏛️ Heritage & Spiritual' },
  ];

  const destinationItems = useMemo(() => getLiveLandingDestinations(), []);

  const filteredItems = destinationItems.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20" id="trending-destinations-showcase">
      {/* 3-Tier Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
            <FiCompass className="w-3.5 h-3.5 text-amber-500" />
            <span>CURATED GLOBAL EXPEDITIONS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Trending <span className="gradient-text">Destinations</span>
          </h2>
          <p className="font-body mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Curated, high-demand escapes with locked multi-modal routes, local verified stays, and real-time availability.
          </p>
        </div>

        {/* Category Pills */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:overflow-visible">
          <SegmentedPillToggle
            options={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      </div>

      {/* 3D Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((dest, index) => (
            <motion.div
              key={dest.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <ThreeCard3D
                depth={28}
                onClick={() => navigate(`/destinations?q=${encodeURIComponent(dest.name)}`)}
                className="group cursor-pointer flex flex-col h-full"
              >
                {/* Media Image */}
                <div className="relative h-64 overflow-hidden rounded-2xl m-3 border border-slate-200 dark:border-white/10 bg-slate-200 dark:bg-slate-800/80">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/hero_day_dolomites.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-semibold flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-amber-400 w-3 h-3" />
                      {dest.country}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(dest.id, e)}
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 transition-transform"
                      aria-label="Save to favorites"
                    >
                      {favorites[dest.id] ? (
                        <FaHeart className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <FaRegHeart className="w-3.5 h-3.5 text-white/80" />
                      )}
                    </button>
                  </div>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="text-[10.5px] font-mono font-bold text-amber-400 uppercase tracking-wider">{dest.tag}</span>
                      <div className="text-xs font-mono text-slate-300">{dest.days}</div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15">
                      <FaStar className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-bold text-white font-mono tabular-nums">{dest.rating}</span>
                      <span className="text-[10px] text-slate-400 font-mono tabular-nums">({dest.reviews})</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 pt-2 flex flex-col justify-between flex-grow">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">All-inclusive flights & 5★ resort package</p>
                    </div>

                    <div className="text-right flex-none">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Starting at</span>
                      <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">{dest.price}</div>
                    </div>
                  </div>

                  {/* Multi-Modal Action Toolbar */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(getHotelsRoute(dest.name));
                        }}
                        className="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors"
                        title={`View real hotels in ${dest.name}`}
                      >
                        <FaHotel className="w-2.5 h-2.5" /> Stays
                      </button>

                      {hasTrainNetwork(dest.name) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(getTrainsRoute(dest.name));
                          }}
                          className="px-2 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors"
                          title={`Search IRCTC trains to ${dest.name}`}
                        >
                          <FaTrain className="w-2.5 h-2.5" /> Trains
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(getFlightsRoute(dest.name));
                        }}
                        className="px-2 py-1 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors"
                        title={`Search flights to ${dest.name}`}
                      >
                        <FaPlane className="w-2.5 h-2.5" /> Flights
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(getExploreRoute(dest.name));
                        }}
                        className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors"
                        title={`View ${dest.name} on interactive map`}
                      >
                        <FaCompass className="w-2.5 h-2.5" /> Map
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const prompt = `Plan an unforgettable ${dest.days} journey to ${dest.name}, ${dest.country}`;
                          navigate(getItineraryRoute(dest.name, prompt), { state: { prompt } });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="Plan custom itinerary"
                      >
                        <FiNavigation className="w-3 h-3 text-amber-500" />
                        Plan Route
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookDest(dest);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-[11px] font-black flex items-center gap-1 transition-all shadow-sm active:scale-95 ml-auto"
                        title="Reserve this trip package"
                      >
                        Book Now <FaArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </ThreeCard3D>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Explore More Button */}
      <div className="mt-12 text-center">
        <ThreeUIButton
          variant="liquid-metal"
          size="lg"
          to="/destinations"
          icon={<FiCompass className="w-4 h-4 text-amber-500" />}
        >
          View Complete 190+ Destinations Catalog
        </ThreeUIButton>
      </div>
    </section>
  );
};

export default TrendingDestinations;
