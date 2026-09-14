import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { ThreeCard3D } from '../ui/ThreeCard3D';
import { SegmentedPillToggle } from '../ui/ThreeUIToggle';
import { ThreeUIButton } from '../ui/ThreeUIButton';

export const TrendingDestinations = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: 'all', label: 'All Destinations' },
    { id: 'tropical', label: '🌴 Tropical' },
    { id: 'alpine', label: '🏔️ Alpine & Treks' },
    { id: 'culture', label: '⛩️ Heritage & Culture' },
    { id: 'luxury', label: '✨ Luxury Escapes' },
  ];

  const destinationItems = [
    {
      id: 'bali',
      category: 'tropical',
      name: 'Bali & Nusa Penida',
      country: 'Indonesia',
      price: '₹45,000',
      rating: '4.95',
      reviews: '1,240',
      tag: 'Tropical Sanctuary',
      image: '/images/destinations/hero_bali_sunsets.jpg',
      days: '6 Days / 5 Nights',
    },
    {
      id: 'paris',
      category: 'culture',
      name: 'Paris & Versailles',
      country: 'France',
      price: '₹85,000',
      rating: '4.88',
      reviews: '890',
      tag: 'City of Lights',
      image: '/images/destinations/hero_amalfi_coast.jpg',
      days: '7 Days / 6 Nights',
    },
    {
      id: 'tokyo',
      category: 'culture',
      name: 'Tokyo & Kyoto Rail',
      country: 'Japan',
      price: '₹72,000',
      rating: '4.96',
      reviews: '2,150',
      tag: 'Shinkansen Expedition',
      image: '/images/destinations/hero_kyoto_bamboo.jpg',
      days: '8 Days / 7 Nights',
    },
    {
      id: 'swiss',
      category: 'alpine',
      name: 'Swiss Alps & Zermatt',
      country: 'Switzerland',
      price: '₹1,12,000',
      rating: '4.98',
      reviews: '740',
      tag: 'Glacier Express',
      image: '/images/destinations/hero_swiss_alps.jpg',
      days: '6 Days / 5 Nights',
    },
    {
      id: 'maldives',
      category: 'luxury',
      name: 'Overwater Private Atoll',
      country: 'Maldives',
      price: '₹95,000',
      rating: '4.97',
      reviews: '960',
      tag: 'Ocean Villa',
      image: '/stories-greece-cove.jpg',
      days: '5 Days / 4 Nights',
    },
    {
      id: 'dubai',
      category: 'luxury',
      name: 'Dubai & Desert Oasis',
      country: 'UAE',
      price: '₹55,000',
      rating: '4.78',
      reviews: '1,530',
      tag: 'Futuristic Luxury',
      image: '/images/destinations/wonders_petra.jpg',
      days: '5 Days / 4 Nights',
    },
  ];

  const filteredItems = destinationItems.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <section className="relative py-20 px-4 max-w-7xl mx-auto z-20" id="trending-destinations-showcase">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <HiOutlineSparkles className="w-3.5 h-3.5 animate-spin" />
            Top Global Itineraries
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Trending <span className="gradient-text">Destinations</span>
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl">
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
                onClick={() => navigate('/destinations')}
                className="group cursor-pointer flex flex-col h-full"
              >
                {/* Media Image */}
                <div className="relative h-64 overflow-hidden rounded-2xl m-3 border border-slate-200 dark:border-white/10">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
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
                      <span className="text-xs font-bold text-white font-mono">{dest.rating}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({dest.reviews})</span>
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
                      <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{dest.price}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Free Cancellation
                    </span>

                    <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View Itinerary <FaArrowRight className="w-2.5 h-2.5" />
                    </span>
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
          icon={<HiOutlineSparkles className="w-4 h-4 text-amber-500" />}
        >
          View Complete 190+ Destinations Catalog
        </ThreeUIButton>
      </div>
    </section>
  );
};

export default TrendingDestinations;
