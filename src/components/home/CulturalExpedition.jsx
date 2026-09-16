import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCompass, FaArrowRight, FaHotel, FaTrain, FaPlane } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { ThreeCard3D } from '../ui/ThreeCard3D';
import { ThreeUIButton } from '../ui/ThreeUIButton';
import { getLiveCulturalExpeditions } from '../../services/dynamicTravelEngine';
import { useBooking } from '../../context/BookingContext';
import { 
  getHotelsRoute, 
  getTrainsRoute, 
  getFlightsRoute, 
  getExploreRoute, 
  getItineraryRoute,
  hasTrainNetwork 
} from '../../utils/travelBridge';

/**
 * CulturalExpedition — ThreeUI Kage-inspired Chapter Editorial Showcase:
 * Contemplative editorial grid, chapter indices (01, 02...), geographic telemetry,
 * hairline borders, and full dual Light / Dark mode responsiveness.
 */
export const CulturalExpedition = () => {
  const navigate = useNavigate();
  const { setActiveBooking, addToast } = useBooking();
  const [activeExpedition, setActiveExpedition] = useState(0);

  const expeditions = useMemo(() => getLiveCulturalExpeditions(), []);

  const handleReserveExpedition = (exp) => {
    setActiveBooking({
      serviceType: 'package',
      itemTitle: `${exp.title} — ${exp.subtitle} (${exp.duration})`,
      details: {
        destination: exp.title,
        region: exp.region,
        duration: exp.duration,
        transit: 'Vande Bharat / Express Rail Matrix Included',
        flight: 'Domestic Connecting Flights Available',
        hotel: 'Handpicked Heritage Haveli & Palace Stay',
        vibe: 'Cultural Odyssey',
      },
      priceINR: 18500,
      priceUSD: 214,
      image: exp.image,
    });
    addToast(`Expedition locked: ${exp.title}! Proceeding to checkout.`, 'success');
    navigate('/checkout');
  };

  return (
    <section 
      className="relative py-28 px-4 bg-slate-100/90 dark:bg-[#07090e] border-y border-slate-200/90 dark:border-white/10 overflow-hidden transition-colors duration-500" 
      id="cultural-expeditions"
    >
      {/* Background Subtle Watermark */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 text-[14vw] font-black text-slate-900/[0.03] dark:text-white/[0.015] select-none pointer-events-none font-mono tracking-wider">
        BHARAT
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
              <FaCompass className="w-3.5 h-3.5" />
              <span>Cultural Odyssey 2026</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Incredible <span className="text-gradient-primary">India Expeditions</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mt-2 max-w-xl">
              An architectural exploration of spiritual sanctuaries, ancient fortresses, and high-altitude Himalayan valleys.
            </p>
          </div>

          <div className="mt-4 md:mt-0 font-mono text-xs text-slate-500">
            CHAPTER [ {expeditions[activeExpedition].chapter} / 04 ]
          </div>
        </div>

        {/* 4-Column Editorial Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Showcase Hero (7 Cols) */}
          <div className="lg:col-span-7">
            <ThreeCard3D 
              spotlightColor="rgba(245, 158, 11, 0.15)"
              className="overflow-hidden flex flex-col h-full"
            >
              <div className="relative h-[340px] md:h-[420px] overflow-hidden">
                <motion.img
                  key={activeExpedition}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  src={expeditions[activeExpedition].image}
                  alt={expeditions[activeExpedition].title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/hero_mountain_day.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                {/* Geo Coordinates Telemetry Pill (replacing kanji) */}
                <div className="absolute top-6 right-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono tracking-wider pointer-events-none select-none shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>{expeditions[activeExpedition].coordinates}</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="inline-flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider mb-1.5">
                    <span>CHAPTER {expeditions[activeExpedition].chapter}</span>
                    <span className="text-white/40">·</span>
                    <span>{expeditions[activeExpedition].region}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-snug">
                    {expeditions[activeExpedition].title}
                  </h3>
                  <div className="text-slate-200 text-sm font-mono mt-1">
                    {expeditions[activeExpedition].subtitle}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-white dark:bg-[#0d0f17] flex flex-col justify-between flex-grow transition-colors duration-500">
                <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-6 font-medium">
                  {expeditions[activeExpedition].desc}
                </p>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {expeditions[activeExpedition].duration}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {expeditions[activeExpedition].weatherNow} · Best: {expeditions[activeExpedition].bestSeason}
                    </span>
                  </div>

                  {/* Multi-Modal Ecosystem Action Dock */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(getHotelsRoute(expeditions[activeExpedition].title))}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-amber-500/20"
                      title={`Search hotels in ${expeditions[activeExpedition].region}`}
                    >
                      <FaHotel className="w-3 h-3" /> Stays
                    </button>

                    {hasTrainNetwork(expeditions[activeExpedition].title) && (
                      <button
                        type="button"
                        onClick={() => navigate(getTrainsRoute(expeditions[activeExpedition].title))}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-purple-500/20"
                        title={`Search trains to ${expeditions[activeExpedition].region}`}
                      >
                        <FaTrain className="w-3 h-3" /> Trains
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(getFlightsRoute(expeditions[activeExpedition].title))}
                      className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-sky-500/20"
                      title={`Search flights to ${expeditions[activeExpedition].region}`}
                    >
                      <FaPlane className="w-3 h-3" /> Flights
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(getExploreRoute(expeditions[activeExpedition].title))}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border border-emerald-500/20"
                      title={`View ${expeditions[activeExpedition].region} on map`}
                    >
                      <FaCompass className="w-3 h-3" /> Map
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const exp = expeditions[activeExpedition];
                        const prompt = `Create an authentic cultural expedition itinerary for ${exp.title}, ${exp.region} covering ${exp.subtitle} for ${exp.duration}`;
                        navigate(getItineraryRoute(exp.title, prompt), { state: { prompt } });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-mono text-xs font-bold border border-slate-300 dark:border-white/15 transition-all flex items-center gap-1.5"
                    >
                      <HiOutlineSparkles className="w-3 h-3 text-amber-500" />
                      AI Plan
                    </button>

                    <ThreeUIButton
                      variant="liquid-metal"
                      size="sm"
                      onClick={() => handleReserveExpedition(expeditions[activeExpedition])}
                      icon={<FaCompass className="w-3 h-3 text-amber-500" />}
                      className="ml-auto"
                    >
                      Reserve Expedition
                    </ThreeUIButton>
                  </div>
                </div>
              </div>
            </ThreeCard3D>
          </div>

          {/* Right Chapter Selector Strip (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
            {expeditions.map((exp, idx) => {
              const isSelected = activeExpedition === idx;
              return (
                <div
                  key={exp.chapter}
                  onClick={() => setActiveExpedition(idx)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden group ${
                    isSelected
                      ? 'bg-white dark:bg-white/[0.08] border-amber-500 dark:border-amber-400/60 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30'
                      : 'bg-white/70 hover:bg-white dark:bg-white/[0.02] border-slate-200/90 hover:border-amber-400/40 dark:border-white/8 dark:hover:border-white/20 dark:hover:bg-white/[0.05] shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-black ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {exp.chapter}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600 font-mono">/</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {exp.title}
                      </h4>
                    </div>

                    {/* Clean Region Badge (replacing kanji) */}
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 group-hover:border-amber-400/40 transition-colors">
                      {exp.region}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono line-clamp-1 mb-2 font-medium">
                    {exp.subtitle}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{exp.duration.split('·')[0]}</span>
                    <span className={`flex items-center gap-1 transition-transform font-bold ${isSelected ? 'text-amber-600 dark:text-amber-400 translate-x-1' : 'text-slate-400 dark:text-slate-600 group-hover:text-amber-500'}`}>
                      Explore <FaArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default CulturalExpedition;
