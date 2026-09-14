import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaStar, FaBolt } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FiTag, FiTrendingDown, FiCheckCircle } from 'react-icons/fi';
import { ThreeUIButton } from '../ui/ThreeUIButton';
import { SegmentedPillToggle } from '../ui/ThreeUIToggle';

const ThreeCloudsCanvas = lazy(() =>
  import('./ThreeHeroCanvas').then((m) => ({ default: m.ThreeCloudsCanvas }))
);

export const HeroSection = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('search'); // 'search' | 'ai'
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [heroTextIndex, setHeroTextIndex] = useState(0);

  // Cinematic Parallax Scroll Motion on Hero Imagery
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.14]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.70]);

  const heroTexts = [
    { chapter: 'CHAPTER 01', line1: 'Your next adventure', line2: 'starts with a single thought' },
    { chapter: 'CHAPTER 02', line1: 'Explore the uncharted', line2: 'guided by intelligent speed' },
    { chapter: 'CHAPTER 03', line1: 'Dream destinations', line2: "at prices you will adore" },
  ];

  const liveStats = [
    '190+ countries across 6 continents',
    '12,847 journeys booked today',
    '4.95★ average traveler rating',
    '₹2.4 Cr saved on Tatkal & boutique stays this week',
    'AI Trip Architect: Instant tailored itineraries',
  ];

  const popularPrompts = [
    { label: 'Bali 5-Day Retreat', query: 'Bali under ₹80k for 5 days' },
    { label: 'Vande Bharat Tatkal', query: 'Delhi to Varanasi Vande Bharat' },
    { label: 'Swiss Alps Honeymoon', query: 'Romantic trip to Switzerland' },
    { label: 'Goa Coastal Villa', query: 'Private beach villa in Goa' },
    { label: 'Kyoto Cultural Rail', query: 'Kyoto temple and rail tour' },
  ];

  const tickerItems = [
    { text: 'AI Trip Architect: 1.8s generation time across 190+ countries', icon: <HiOutlineSparkles className="text-sky-400" /> },
    { text: '18 travelers booked Vande Bharat Varanasi in the last hour', icon: <FaBolt className="text-amber-400" /> },
    { text: 'Delhi ➔ Dubai airfares dropped -24% today', icon: <FiTrendingDown className="text-emerald-400" /> },
    { text: 'IRCTC Tatkal seat prediction live: 98% confirmation rate', icon: <FiCheckCircle className="text-purple-400" /> },
    { text: 'Bali luxury resorts: Save up to ₹14,000 this weekend', icon: <FiTag className="text-amber-400" /> },
    { text: 'Swiss Alps Luxury Chalets: Early bird summer rates available', icon: <FaStar className="text-amber-400" /> },
  ];

  useEffect(() => {
    const textTimer = setInterval(() => {
      setHeroTextIndex((prev) => (prev + 1) % heroTexts.length);
    }, 6000);
    const statTimer = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % liveStats.length);
    }, 3500);
    return () => {
      clearInterval(textTimer);
      clearInterval(statTimer);
    };
  }, [heroTexts.length, liveStats.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchMode === 'ai') {
        navigate(`/itinerary?prompt=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/destinations?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <section ref={heroRef} className="relative min-h-[94vh] flex flex-col justify-between overflow-hidden bg-transparent transition-colors duration-500" id="hero-section">
      {/* 0. DYNAMIC DUAL-MODE 8K PHOTOREALISTIC MOUNTAIN BACKDROP WITH PARALLAX SCROLL MOTION */}
      <motion.div
        style={{ y: bgY, scale: bgScale, opacity: bgOpacity }}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none will-change-transform"
      >
        {/* Light Mode: Natural Swiss Alps panorama above cloud sea at sunrise */}
        <img
          src="/hero_mountain_day.jpg"
          alt="Natural Swiss Alps Mountain Valley Sunrise (Valais, Switzerland)"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-[50%_25%] sm:object-[50%_30%] md:object-center brightness-105 contrast-[1.02] transition-opacity duration-1000 ease-in-out dark:opacity-0"
        />

        {/* Dark Mode: Natural Alpine mountain peaks under authentic Milky Way & starry night */}
        <img
          src="/hero_mountain_night.jpg"
          alt="Natural Alpine Mountain Peaks Under Milky Way Galaxy and Shooting Star"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-[50%_25%] sm:object-[50%_30%] md:object-center brightness-100 contrast-[1.05] opacity-0 transition-opacity duration-1000 ease-in-out dark:opacity-100"
        />

        {/* Natural Location Indicator Badge */}
        <div className="absolute bottom-6 left-6 z-10 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white/90 shadow-sm pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="dark:hidden">📍 Valais, Swiss Alps · Natural Golden Sunrise</span>
          <span className="hidden dark:inline">📍 Alpine Range · Authentic Milky Way & Shooting Star</span>
        </div>

        {/* Cinematic Atmospheric Lighting Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 via-transparent to-slate-50/80 dark:from-slate-950/40 dark:via-transparent dark:to-[#06080d]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_30%,rgba(0,0,0,0.35)_100%)] dark:bg-[radial-gradient(ellipse_at_top,transparent_30%,rgba(6,8,13,0.55)_100%)]" />
      </motion.div>

      {/* 1. THREE.JS ATMOSPHERE: CELESTIAL SKY (SUN/MOON/STARS/SHOOTING STARS) + 3D PARALLAX + ETHEREAL CLOUDS (NO PLANES) */}
      <Suspense fallback={null}>
        <ThreeCloudsCanvas showAirplane={false} />
      </Suspense>

      {/* 2. HERO CONTENT CONTAINER */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 sm:pt-28 md:pt-36 pb-10 sm:pb-12 flex flex-col items-center text-center">
        
        {/* Live Status Pill with Spring Flip */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-[#131622]/90 backdrop-blur-xl border border-slate-200 dark:border-white/12 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <AnimatePresence mode="wait">
            <motion.span
              key={currentStatIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200"
            >
              {liveStats[currentStatIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Editorial Headline with Zero-Blink Hardware-Accelerated Container */}
        <div className="relative w-full max-w-6xl h-[145px] sm:h-[175px] md:h-[205px] mb-4 sm:mb-6 flex items-center justify-center">
          <AnimatePresence initial={false}>
            <motion.div
              key={heroTextIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ transform: 'translateZ(0)', willChange: 'opacity, transform' }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 sm:px-4"
            >
              <div className="text-amber-500 dark:text-amber-400 font-mono text-[11px] sm:text-xs md:text-sm font-bold tracking-widest uppercase mb-1.5 sm:mb-2 select-none">
                {heroTexts[heroTextIndex].chapter}
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-[2.75rem] lg:text-[3.15rem] xl:text-[3.35rem] font-extrabold tracking-tight leading-[1.15] sm:leading-[1.12] select-none [text-shadow:0_2px_12px_rgba(255,255,255,0.7)] dark:[text-shadow:0_2px_18px_rgba(0,0,0,0.85)]">
                <span className="block text-slate-900 dark:text-white whitespace-normal sm:whitespace-nowrap">
                  {heroTexts[heroTextIndex].line1}
                </span>
                <span className="block text-gradient-primary whitespace-normal sm:whitespace-nowrap">
                  {heroTexts[heroTextIndex].line2}
                </span>
              </h1>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-slate-900 dark:text-slate-200 font-semibold text-sm sm:text-lg md:text-xl max-w-2xl mx-auto px-2 mt-1 sm:mt-2 leading-relaxed [text-shadow:0_1px_8px_rgba(255,255,255,0.8)] dark:[text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
          Intelligent trip planning across 190+ countries. Verified Tatkal trains, flights, boutique stays, and curated experiences.
        </p>

        {/* ThreeUI Mode Switch (Search vs AI Architect) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <SegmentedPillToggle
            options={[
              { id: 'search', label: '⚡ Instant Search' },
              { id: 'ai', label: '✦ AI Trip Architect', badge: 'NEW' },
            ]}
            value={searchMode}
            onChange={setSearchMode}
            size="sm"
          />
        </motion.div>

        {/* Interactive Search / AI Prompt Input Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-2xl mb-6"
        >
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute left-4.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              {searchMode === 'ai' ? (
                <HiOutlineSparkles className="w-5 h-5 text-amber-500 dark:text-amber-400 animate-spin-slow" />
              ) : (
                <FaSearch className="w-4 h-4 text-slate-400 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors" />
              )}
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchMode === 'ai'
                  ? "Describe your dream trip: '7-day romantic getaway to Bali under ₹80k'..."
                  : "Search destinations, train routes, flights, or hotels..."
              }
              className="w-full pl-12 pr-32 py-4.5 rounded-full bg-white/95 dark:bg-[#141624]/90 backdrop-blur-2xl border border-slate-300/80 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-amber-400/80 focus:ring-4 focus:ring-amber-400/15 shadow-[0_16px_36px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300"
              id="hero-search-input"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <ThreeUIButton
                variant="amber-glow"
                size="sm"
                type="submit"
                id="hero-search-btn"
              >
                {searchMode === 'ai' ? 'Generate' : 'Explore'}
              </ThreeUIButton>
            </div>
          </form>

          {/* Quick suggestions pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px] font-semibold">Trending:</span>
            {popularPrompts.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setSearchQuery(item.query);
                  if (searchMode !== 'ai' && item.label.includes('Retreat')) setSearchMode('ai');
                }}
                className="px-3 py-1 rounded-full bg-white/90 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white border border-slate-300/80 dark:border-white/15 font-mono text-[11px] shadow-sm hover:shadow transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Master CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-2"
        >
          <ThreeUIButton
            variant="liquid-metal"
            size="lg"
            to="/destinations"
            icon={<FaArrowRight className="w-3.5 h-3.5" />}
          >
            Explore 190+ Destinations
          </ThreeUIButton>

          <ThreeUIButton
            variant="specular-dark"
            size="lg"
            to="/itinerary"
            icon={<HiOutlineSparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
          >
            Launch AI Trip Architect
          </ThreeUIButton>
        </motion.div>
      </div>

      {/* 3. LIVE TICKER STRIP AT BOTTOM */}
      <div className="relative z-10 w-full border-t border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0c0e17]/80 backdrop-blur-xl py-3 overflow-hidden" id="hero-live-ticker">
        <div className="flex animate-ticker whitespace-nowrap">
          <div className="flex shrink-0 gap-8 items-center">
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 text-xs font-mono text-slate-700 dark:text-slate-300"
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;