import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaCompass } from 'react-icons/fa';
import { ThreeCard3D } from '../ui/ThreeCard3D';
import { ThreeUIButton } from '../ui/ThreeUIButton';

/**
 * CulturalExpedition — ThreeUI Kage-inspired Chapter Editorial Showcase:
 * Contemplative editorial grid, chapter indices (01, 02...), geographic telemetry,
 * hairline borders, and full dual Light / Dark mode responsiveness.
 */
export const CulturalExpedition = () => {
  const [activeExpedition, setActiveExpedition] = useState(0);

  const expeditions = [
    {
      chapter: '01',
      title: 'The Emerald Backwaters',
      subtitle: 'Alleppey & Kumarakom, Kerala',
      region: 'KERALA',
      locationTag: 'SOUTH INDIA',
      coordinates: '9.4981° N, 76.3388° E',
      desc: 'Gliding silently aboard a handcrafted teak houseboat at dawn, through lotus-carpeted canals where time surrenders to the tide.',
      duration: '5 Nights · Private Houseboat & Ayurvedic Spa',
      image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    },
    {
      chapter: '02',
      title: 'The Golden Citadel',
      subtitle: 'Jaisalmer & Jodhpur, Rajasthan',
      region: 'RAJASTHAN',
      locationTag: 'THAR DESERT',
      coordinates: '26.9157° N, 70.9083° E',
      desc: 'Living sandstone fortresses rising from the Thar sands. Night camps beneath Milky Way constellations and royal Rajput banquets.',
      duration: '6 Nights · Desert Glamping & Royal Haveli',
      image: 'https://images.unsplash.com/photo-1709338572902-a6fc2559d684?auto=format&fit=crop&w=1200&q=80',
    },
    {
      chapter: '03',
      title: 'The Sacred Threshold',
      subtitle: 'Varanasi Ghats & Sarnath, Uttar Pradesh',
      region: 'VARANASI',
      locationTag: 'GANGETIC PLAINS',
      coordinates: '25.3176° N, 82.9739° E',
      desc: 'The ancient spiritual heart where sacred fires reflect along the Ganga. Evening Maha Aarti ceremonies echoing through millennia.',
      duration: '4 Nights · Riverside Heritage Sanctuary',
      image: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=1200&q=80',
    },
    {
      chapter: '04',
      title: 'Roof of the World',
      subtitle: 'Ladakh, Pangong Tso & Nubra Valley',
      region: 'LADAKH',
      locationTag: 'TRANS-HIMALAYAS',
      coordinates: '34.1526° N, 77.5771° E',
      desc: 'High-altitude Tibetan Buddhist gompas clinging to sheer granite cliffs, crossing Khardung La into sapphire-blue glacial lakes.',
      duration: '7 Nights · High-Pass Expedition & Monasteries',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    },
  ];

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
        {/* Editorial Section Header (ThreeUI Kage Style) */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
            <span>CHAPTER 02 — THE SACRED ARCHIPELAGO</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-3xl leading-tight">
            WHERE STILLNESS REVEALS THE <span className="text-gradient-primary">UNSEEN REALMS</span>.
          </h2>

          <p className="text-slate-600 dark:text-slate-400 font-medium text-base md:text-lg max-w-2xl mt-4 leading-relaxed">
            Step beyond conventional itineraries into India’s most contemplative landscapes, where craftsmanship, heritage, and quiet grandeur shape the journey.
          </p>
        </div>

        {/* 4-Column Editorial Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Showcase Hero (7 Cols) */}
          <div className="lg:col-span-7">
            <ThreeCard3D maxTilt={5} spotlightColor="rgba(245, 158, 11, 0.2)" className="h-full flex flex-col justify-between overflow-hidden shadow-md dark:shadow-none">
              <div className="relative h-[340px] md:h-[420px] overflow-hidden">
                <motion.img
                  key={activeExpedition}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  src={expeditions[activeExpedition].image}
                  alt={expeditions[activeExpedition].title}
                  className="w-full h-full object-cover"
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

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-medium">
                    {expeditions[activeExpedition].duration}
                  </span>

                  <ThreeUIButton
                    variant="liquid-metal"
                    size="md"
                    to="/destinations"
                    icon={<FaCompass className="w-3.5 h-3.5 text-amber-500" />}
                  >
                    Reserve Expedition
                  </ThreeUIButton>
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
