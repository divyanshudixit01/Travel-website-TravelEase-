import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaSearch, FaArrowRight, FaTrain, FaPlane, FaHotel, 
  FaPlay, FaPause, FaChevronLeft, FaChevronRight, FaMapMarkerAlt
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FiCompass, FiCheckCircle } from 'react-icons/fi';
import { ThreeUIButton } from '../ui/ThreeUIButton';
import { 
  getHotelsRoute, 
  getTrainsRoute, 
  getFlightsRoute, 
  getItineraryRoute, 
  getDestinationsRoute 
} from '../../utils/travelBridge';

// ─── 5 NARRATIVE CHAPTERS OF TRAVELEASE (100% Authentic Data & Assets) ─────────
const HERO_CHAPTERS = [
  {
    id: 'welcome',
    chapterNumber: 'CHAPTER 01',
    badge: 'GATEWAY TO TRAVELEASE OS',
    badgeIcon: HiOutlineSparkles,
    headline: 'Your Gateway to 190+ Countries,',
    highlight: 'Unified by Speed & Precision',
    tagline: 'Experience the next-generation travel platform unifying verified Tatkal rail, live flight radar, authentic boutique stays, and sub-second AI itineraries in one intelligent ecosystem.',
    image: '/images/destinations/hero_swiss_alps.jpg',
    telemetry: '190+ COUNTRIES · ZERO CONVENIENCE FEES',
    searchMode: 'search',
    searchPlaceholder: "Search any destination worldwide: 'Varanasi', 'Taj Mahal', 'Goa', 'Swiss Alps'...",
    primaryBtn: {
      label: 'Explore 190+ Destinations',
      route: '/destinations',
      icon: FaArrowRight,
      variant: 'amber-glow',
    },
    secondaryBtn: {
      label: 'Launch AI Architect',
      route: '/itinerary',
      icon: HiOutlineSparkles,
      variant: 'liquid-metal',
    },
    quickPills: [
      { label: 'Varanasi Ghats', route: '/destinations?q=Varanasi' },
      { label: 'Taj Mahal Sunrise', route: '/destinations?q=Taj Mahal' },
      { label: 'Kedarnath Shrine', route: '/destinations?q=Kedarnath' },
      { label: 'Ayodhya Heritage', route: '/destinations?q=Ayodhya' },
      { label: 'Goa Coastal Villa', route: '/destinations?q=Goa' },
      { label: 'Swiss Alps Zermatt', route: '/destinations?q=Swiss Alps' },
    ]
  },
  {
    id: 'trains',
    chapterNumber: 'CHAPTER 02',
    badge: 'IRCTC TATKAL & BULLET RAIL OS',
    badgeIcon: FaTrain,
    headline: 'Book Confirmed Train Berths Across',
    highlight: 'All 28 Indian States with AI Radar',
    tagline: 'Real-time Vande Bharat, Rajdhani & Shatabdi timetables with AI confirmation probability, multi-day availability radar, and direct IRCTC Tatkal booking.',
    image: '/images/trains/ir_vande_bharat.jpg',
    telemetry: 'LIVE IRCTC TIMETABLES · 98% CONFIRMED TATKAL RADAR',
    searchMode: 'trains',
    searchPlaceholder: "Search Indian Railways corridor: 'Varanasi', 'New Delhi', 'Agra', 'Goa'...",
    primaryBtn: {
      label: 'Book Tatkal Trains',
      route: '/trains',
      icon: FaTrain,
      variant: 'amber-glow',
    },
    secondaryBtn: {
      label: 'Seat Availability Radar',
      route: '/trains?tab=availability',
      icon: FiCheckCircle,
      variant: 'liquid-metal',
    },
    quickPills: [
      { label: 'NDLS ➔ BSB (Vande Bharat #22436)', route: '/trains?from=NDLS&to=BSB&train=22436' },
      { label: 'CSMT ➔ MAO (Goa Express)', route: '/trains?from=CSMT&to=MAO' },
      { label: 'NDLS ➔ AGC (Gatimaan 160 km/h)', route: '/trains?from=NDLS&to=AGC' },
      { label: 'NDLS ➔ AY (Ayodhya Vande Bharat)', route: '/trains?from=NDLS&to=AY' },
    ]
  },
  {
    id: 'flights',
    chapterNumber: 'CHAPTER 03',
    badge: 'GLOBAL & DOMESTIC FLIGHT RADAR',
    badgeIcon: FaPlane,
    headline: 'Non-Stop Corridors & Sub-Second Airfares',
    highlight: 'Across 1,400+ Global Airlines',
    tagline: 'Track real-time flight matrix with zero platform markups, student & senior citizen concessions, and transparent luggage allowances.',
    image: '/hero_flying_plane.jpg',
    telemetry: '1,400+ AIRLINES MONITORED · LIVE RADAR SYNC',
    searchMode: 'flights',
    searchPlaceholder: "Search live airfares: 'Dubai', 'Bali', 'Goa', 'Paris', 'Tokyo'...",
    primaryBtn: {
      label: 'Search Live Flights',
      route: '/flights',
      icon: FaPlane,
      variant: 'amber-glow',
    },
    secondaryBtn: {
      label: 'Compare Airfare Matrix',
      route: '/flights?from=DEL&to=DXB',
      icon: FiCompass,
      variant: 'liquid-metal',
    },
    quickPills: [
      { label: 'DEL ➔ DXB (Dubai Non-Stop)', route: '/flights?from=DEL&to=DXB' },
      { label: 'BOM ➔ DPS (Bali Escape)', route: '/flights?from=BOM&to=DPS' },
      { label: 'BLR ➔ CDG (Paris Direct)', route: '/flights?from=BLR&to=CDG' },
      { label: 'DEL ➔ GOI (Goa Beachfront)', route: '/flights?from=DEL&to=GOI' },
    ]
  },
  {
    id: 'hotels',
    chapterNumber: 'CHAPTER 04',
    badge: 'VERIFIED STAYS & HERITAGE HAVENS',
    badgeIcon: FaHotel,
    headline: 'Handpicked Villas, Palaces & Resorts',
    highlight: 'With 100% Verified Photography',
    tagline: 'Explore 5-star heritage palaces, cliffside infinity pools, and boutique sanctuaries with transparent Indian Rupee (₹) rates and verified guest ratings.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop',
    telemetry: '85,000+ VERIFIED PROPERTIES · REAL AMENITIES',
    searchMode: 'hotels',
    searchPlaceholder: "Search verified hotels in any city: 'Varanasi', 'Ayodhya', 'Udaipur', 'Goa'...",
    primaryBtn: {
      label: 'Explore Verified Stays',
      route: '/hotels',
      icon: FaHotel,
      variant: 'amber-glow',
    },
    secondaryBtn: {
      label: 'Stays in Varanasi',
      route: '/hotels?destination=Varanasi',
      icon: FaMapMarkerAlt,
      variant: 'liquid-metal',
    },
    quickPills: [
      { label: 'Udaipur Palaces', route: '/hotels?destination=Udaipur' },
      { label: 'Varanasi Ghats Stays', route: '/hotels?destination=Varanasi' },
      { label: 'Goa Beachfront Villas', route: '/hotels?destination=Goa' },
      { label: 'Ayodhya Heritage Stays', route: '/hotels?destination=Ayodhya' },
      { label: 'Manali Snow Chalets', route: '/hotels?destination=Manali' },
    ]
  },
  {
    id: 'ai',
    chapterNumber: 'CHAPTER 05',
    badge: 'GROQ LPU™ AI TRIP ARCHITECT',
    badgeIcon: HiOutlineSparkles,
    headline: 'Sub-Second Custom Travel Itineraries',
    highlight: 'Synthesizing Trains, Flights & Stays',
    tagline: 'Describe your trip in plain language. Our AI engine builds a day-by-day itinerary with verified trains, flights, hotels, and activities ready to book in one click.',
    image: '/images/destinations/hero_varanasi_ghats.jpg',
    telemetry: '✦ GROQ LPU™ ACCELERATED · 100% PERSONALIZED',
    searchMode: 'ai',
    searchPlaceholder: "Describe your dream trip: '4-day spiritual journey to Varanasi under ₹15,000'...",
    primaryBtn: {
      label: 'Launch AI Trip Architect',
      route: '/itinerary',
      icon: HiOutlineSparkles,
      variant: 'amber-glow',
    },
    secondaryBtn: {
      label: 'Interactive GIS Map',
      route: '/explore',
      icon: FiCompass,
      variant: 'liquid-metal',
    },
    quickPills: [
      { label: 'Varanasi 4D Spiritual Rail', route: '/itinerary?prompt=Plan a 4-day spiritual trip to Varanasi with Vande Bharat under ₹15000' },
      { label: 'Goa 3D Coastal Rail & Beach', route: '/itinerary?prompt=3-day budget trip to Goa with Vande Bharat under ₹12000' },
      { label: 'Dubai 4D Luxury Retreat', route: '/itinerary?prompt=4-day luxury retreat in Dubai for 2 adults under ₹125000' },
      { label: 'Rajasthan 6D Royal Heritage', route: '/itinerary?prompt=6-day royal Rajasthan heritage tour with desert camp under ₹45000' },
    ]
  },
];

// Faster & smoother autoplay cadence (4.0s per chapter)
const AUTOPLAY_INTERVAL_MS = 4000;

export const HeroSection = () => {
  const navigate = useNavigate();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeChapter = HERO_CHAPTERS[currentChapterIndex];

  // Advance to next chapter
  const handleNext = useCallback(() => {
    setCurrentChapterIndex((prev) => (prev + 1) % HERO_CHAPTERS.length);
  }, []);

  // Return to previous chapter
  const handlePrev = useCallback(() => {
    setCurrentChapterIndex((prev) => (prev - 1 + HERO_CHAPTERS.length) % HERO_CHAPTERS.length);
  }, []);

  // Jump to specific chapter
  const handleSelectChapter = useCallback((index) => {
    setCurrentChapterIndex(index);
  }, []);

  // Responsive, fluid, automatic slideshow advancing
  useEffect(() => {
    if (!isPlaying || isInputFocused) return;

    const timer = setInterval(() => {
      setCurrentChapterIndex((prev) => (prev + 1) % HERO_CHAPTERS.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPlaying, isInputFocused, currentChapterIndex]);

  // Unified Search Submission handler based on active chapter mode
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const clean = searchQuery.trim();
    if (!clean) return;

    const mode = activeChapter.searchMode;
    if (mode === 'hotels') {
      navigate(getHotelsRoute(clean));
    } else if (mode === 'trains') {
      navigate(getTrainsRoute(clean));
    } else if (mode === 'flights') {
      navigate(getFlightsRoute(clean));
    } else if (mode === 'ai') {
      navigate(getItineraryRoute(clean));
    } else {
      navigate(getDestinationsRoute(clean));
    }
  };

  return (
    <section 
      className="relative w-full overflow-hidden pt-20 sm:pt-24 pb-6 bg-transparent transition-colors duration-500" 
      id="hero-section"
    >
      {/* ── AMBIENT ATMOSPHERIC LIGHTING MESH (Full Light/Dark Mode Unification) ── */}
      {/* 1. Radiant Daylight Sun/Sky Overhead Aura (Luminous in Light Mode, Moody in Dark Mode) */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-[radial-gradient(ellipse_85%_65%_at_50%_-15%,rgba(245,158,11,0.22),rgba(56,189,248,0.14),transparent_75%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(245,158,11,0.12),rgba(56,189,248,0.06),transparent_70%)] pointer-events-none z-0" />
      
      {/* 2. Concentrated Ambient Color Bloom directly behind the hero stage */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[520px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15)_0%,rgba(14,165,233,0.09)_45%,transparent_75%)] blur-3xl pointer-events-none z-0" />

      {/* 3. High-Precision Architectural Dot Lattice (Anchors empty margins to the page structure) */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.1px,transparent_1.1px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-40 dark:opacity-20 pointer-events-none z-0" />

      {/* 4. Smooth Bottom Ambient Gradient Bridge into ServiceBentoGrid */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-b from-transparent via-slate-100/50 dark:via-[#06080d]/50 to-slate-50 dark:to-[#06080d] pointer-events-none z-0" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        
        {/* ==================================================================== */}
        {/* LUXURY CONTAINED HERO STAGE (Dual-Ring Glass Bevel & Dynamic Elevation) */}
        {/* ==================================================================== */}
        <div className="relative w-full min-h-[580px] sm:min-h-[620px] md:min-h-[660px] lg:h-[72vh] lg:max-h-[760px] rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3.2rem] overflow-hidden ring-1 ring-slate-900/10 dark:ring-white/10 border border-white/80 dark:border-white/10 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.16),0_12px_36px_-10px_rgba(245,158,11,0.15)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.15)] group">
          
          {/* Subtle Top Glass Rim Reflection for Physical Depth */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/25 to-transparent pointer-events-none z-30" />

          {/* Ken Burns Crossfade Background Imagery with Silky-Smooth Acceleration */}
          <div className="absolute inset-0 bg-slate-950 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeChapter.id}
                src={activeChapter.image}
                alt={activeChapter.headline}
                initial={{ opacity: 0, scale: 1.0 }}
                animate={{ opacity: 1, scale: 1.05 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  scale: { duration: 4.0, ease: "linear" }
                }}
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none will-change-transform"
                loading="eager"
              />
            </AnimatePresence>

            {/* Balanced Editorial Cinema Multi-Gradients & Vignette (Crystal Legibility + Vivid Imagery) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/15 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none" />
          </div>

          {/* ================================================================ */}
          {/* TOP STATUS, TELEMETRY & CHAPTER NAVIGATION BAR                   */}
          {/* ================================================================ */}
          <div className="absolute top-5 left-5 right-5 sm:top-7 sm:left-8 sm:right-8 flex flex-wrap items-center justify-between gap-3 z-20 pointer-events-auto">
            
            {/* Live System Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-950/65 dark:bg-black/55 backdrop-blur-xl border border-white/25 text-xs font-mono text-white shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="font-bold tracking-wider uppercase text-[10px] sm:text-[11px] text-amber-300">
                {activeChapter.telemetry}
              </span>
            </div>

            {/* Chapter Navigation Rail (Desktop & Tablet) */}
            <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-slate-950/65 dark:bg-black/55 backdrop-blur-xl border border-white/20 shadow-xl">
              {HERO_CHAPTERS.map((chapter, idx) => {
                const isSelected = idx === currentChapterIndex;
                const IconComponent = chapter.badgeIcon;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => handleSelectChapter(idx)}
                    className={`relative px-3.5 py-1 rounded-full text-[11px] font-mono font-bold transition-all duration-300 flex items-center gap-1.5 active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.55)] scale-105 font-extrabold'
                        : 'text-white/80 hover:text-white hover:bg-white/15'
                    }`}
                    title={chapter.badge}
                  >
                    <IconComponent className="w-2.5 h-2.5" />
                    <span>0{idx + 1}</span>
                    <span className="hidden lg:inline capitalize">
                      {chapter.id === 'welcome' ? 'Welcome' : chapter.id === 'ai' ? 'AI Planner' : chapter.id}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Play/Pause & Left/Right Manual Controls with Instant Dynamic Feedback */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-950/65 dark:bg-black/55 backdrop-blur-xl border border-white/20 shadow-xl text-white">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 text-xs active:scale-90 ${
                  isPlaying
                    ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50 hover:bg-amber-500/40 shadow-sm'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
                title={isPlaying ? 'Pause Slideshow' : 'Resume Auto-Play'}
                aria-label={isPlaying ? 'Pause Slideshow' : 'Resume Auto-Play'}
              >
                {isPlaying ? (
                  <FaPause className="w-2.5 h-2.5" />
                ) : (
                  <FaPlay className="w-2.5 h-2.5 translate-x-0.5 text-amber-400" />
                )}
              </button>
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/25 text-white/85 hover:text-white transition-all text-xs active:scale-90"
                title="Previous Chapter"
                aria-label="Previous Chapter"
              >
                <FaChevronLeft className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/25 text-white/85 hover:text-white transition-all text-xs active:scale-90"
                title="Next Chapter"
                aria-label="Next Chapter"
              >
                <FaChevronRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* ================================================================ */}
          {/* BOTTOM TELEMETRY HUD & INTERACTIVE ACTION STAGE                   */}
          {/* ================================================================ */}
          <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-end gap-5 z-20 pointer-events-auto">
            
            {/* Chapter Header Content */}
            <div className="w-full max-w-3xl text-left space-y-2.5 sm:space-y-3.5">
              
              {/* Chapter Badge */}
              <motion.div
                key={`badge-${activeChapter.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md"
              >
                <activeChapter.badgeIcon className="w-3 h-3" />
                <span>{activeChapter.chapterNumber}</span>
                <span className="text-amber-400/40">·</span>
                <span>{activeChapter.badge}</span>
              </motion.div>

              {/* Dynamic Headline */}
              <motion.h1
                key={`headline-${activeChapter.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]"
              >
                <span className="block">{activeChapter.headline}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white">
                  {activeChapter.highlight}
                </span>
              </motion.h1>

              {/* Editorial Tagline */}
              <motion.p
                key={`tagline-${activeChapter.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className="text-xs sm:text-sm md:text-base text-white/90 font-medium max-w-2xl leading-relaxed [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]"
              >
                {activeChapter.tagline}
              </motion.p>
            </div>

            {/* ============================================================== */}
            {/* ADAPTIVE LIVE SEARCH BAR (Directly Connected to Active Chapter) */}
            {/* ============================================================== */}
            <div className="w-full max-w-3xl">
              <form onSubmit={handleSearchSubmit} className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                  {activeChapter.searchMode === 'ai' ? (
                    <HiOutlineSparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  ) : activeChapter.searchMode === 'trains' ? (
                    <FaTrain className="w-4 h-4 text-purple-400" />
                  ) : activeChapter.searchMode === 'flights' ? (
                    <FaPlane className="w-4 h-4 text-sky-400" />
                  ) : activeChapter.searchMode === 'hotels' ? (
                    <FaHotel className="w-4 h-4 text-amber-400" />
                  ) : (
                    <FaSearch className="w-4 h-4 text-amber-400" />
                  )}
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={activeChapter.searchPlaceholder}
                  className="w-full pl-11 pr-28 sm:pr-32 py-3.5 sm:py-4 rounded-2xl bg-slate-950/70 hover:bg-slate-950/80 focus:bg-slate-950/90 dark:bg-black/65 backdrop-blur-2xl border border-white/30 hover:border-white/45 focus:border-amber-400 text-white placeholder-white/70 text-xs sm:text-sm font-medium focus:outline-none shadow-2xl transition-all"
                  id="hero-chapter-search-input"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <ThreeUIButton
                    variant="amber-glow"
                    size="sm"
                    type="submit"
                    id="hero-chapter-search-btn"
                  >
                    {activeChapter.searchMode === 'ai'
                      ? 'Plan Trip'
                      : activeChapter.searchMode === 'trains'
                      ? 'Search Rail'
                      : activeChapter.searchMode === 'flights'
                      ? 'Find Flights'
                      : activeChapter.searchMode === 'hotels'
                      ? 'Find Stays'
                      : 'Explore'}
                  </ThreeUIButton>
                </div>
              </form>

              {/* Action Buttons & Quick Corridor Links */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                {/* Primary & Secondary 1-Click Route Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <ThreeUIButton
                    to={activeChapter.primaryBtn.route}
                    variant={activeChapter.primaryBtn.variant}
                    size="sm"
                    icon={<activeChapter.primaryBtn.icon className="w-3 h-3" />}
                    id={`hero-primary-btn-${activeChapter.id}`}
                  >
                    {activeChapter.primaryBtn.label}
                  </ThreeUIButton>

                  <ThreeUIButton
                    to={activeChapter.secondaryBtn.route}
                    variant={activeChapter.secondaryBtn.variant}
                    size="sm"
                    icon={<activeChapter.secondaryBtn.icon className="w-3 h-3" />}
                    id={`hero-secondary-btn-${activeChapter.id}`}
                  >
                    {activeChapter.secondaryBtn.label}
                  </ThreeUIButton>
                </div>

                {/* Quick Corridor / City Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                  <span className="text-white/70 hidden sm:inline">Quick:</span>
                  {activeChapter.quickPills.slice(0, 3).map((pill, pIdx) => (
                    <Link
                      key={pIdx}
                      to={pill.route}
                      className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-amber-500 hover:text-slate-950 border border-white/25 text-white/95 hover:border-amber-400 transition-all shadow-sm font-medium"
                    >
                      {pill.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Chapter Navigation Dots */}
        <div className="flex md:hidden items-center justify-center gap-2 pt-2">
          {HERO_CHAPTERS.map((chapter, idx) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => handleSelectChapter(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentChapterIndex ? 'w-8 bg-amber-500' : 'w-2 bg-slate-300 dark:bg-white/20'
              }`}
              aria-label={`Jump to Chapter ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 2. REAL-TIME PLATFORM TELEMETRY TICKER STRIP                        */}
      {/* ==================================================================== */}
      <div className="relative z-10 w-full border-y border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-[#0c0e17]/80 backdrop-blur-xl py-3.5 mt-8 shadow-sm overflow-hidden" id="hero-live-ticker">
        <div className="flex animate-ticker whitespace-nowrap">
          <div className="flex shrink-0 gap-8 items-center">
            {[
              { text: 'Dynamic Geocoding Live: Explore any place across India & World', icon: <HiOutlineSparkles className="text-sky-400" /> },
              { text: 'IRCTC Tatkal Engine: Live Vande Bharat seat prediction active', icon: <FaTrain className="text-amber-400" /> },
              { text: 'Sub-Second Flight Matrix: Monitored over 1,400+ airlines', icon: <FaPlane className="text-sky-400" /> },
              { text: 'Verified Boutique Stays: Real photos & authentic amenities', icon: <FaHotel className="text-emerald-400" /> },
              { text: 'Groq LPU™ Trip Architect: 1-click automatic itinerary ready', icon: <HiOutlineSparkles className="text-purple-400" /> },
              { text: 'OpenStreetMap + Wikipedia: Real photos & live telemetry', icon: <FiCompass className="text-teal-400" /> },
              { text: 'Dynamic Geocoding Live: Explore any place across India & World', icon: <HiOutlineSparkles className="text-sky-400" /> },
              { text: 'IRCTC Tatkal Engine: Live Vande Bharat seat prediction active', icon: <FaTrain className="text-amber-400" /> },
            ].map((item, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/8 text-xs font-mono text-slate-700 dark:text-slate-300"
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