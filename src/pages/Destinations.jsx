import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useBooking } from '../context/BookingContext';
import { 
  resolveCityPackages,
  getLiveHeroSlides,
  getLiveSevenWonders,
  getLiveDestinationsCatalog
} from '../services/dynamicTravelEngine';
import { 
  FaArrowRight, FaMapMarkerAlt, FaStar, FaHeart, FaRegHeart, 
  FaSearch, FaChevronLeft, FaChevronRight, FaPlay, FaPause,
  FaCalendarAlt, FaSun, FaCheckCircle, FaCompass, FaShieldAlt,
  FaPlane, FaHotel, FaCoffee, FaTag, FaSlidersH, FaUndo,
  FaLandmark, FaGlobeAmericas, FaGlobeAsia, FaGlobeEurope,
  FaRoute, FaThLarge, FaEye, FaLightbulb, FaTrain
} from 'react-icons/fa';
import { HiOutlineSparkles, HiOutlineLightningBolt } from 'react-icons/hi';
import { FiActivity, FiCompass, FiShield, FiPercent } from 'react-icons/fi';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getItemListSchema } from '../utils/schemas';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';
import { ThreeCard3D } from '../components/ui/ThreeCard3D';
import { 
  getHotelsRoute, 
  getTrainsRoute, 
  getFlightsRoute, 
  getExploreRoute, 
  getItineraryRoute, 
  hasTrainNetwork 
} from '../utils/travelBridge';

// Kinetic Slideshow Destination Inventory (Live Dynamic Feed)
const heroSlides = getLiveHeroSlides();

// 7 Wonders of the World Masterpiece Inventory (Live Dynamic Feed)
const sevenWonders = getLiveSevenWonders();

// Comprehensive Curated Destination Inventory (Live Dynamic Feed)
const { incredibleIndia, globalEscapes } = getLiveDestinationsCatalog();

const vibeOptions = [
  { id: 'all', label: 'All Vibes', icon: '✨' },
  { id: 'beaches', label: 'Beaches & Islands', icon: '🏖️' },
  { id: 'mountains', label: 'Mountains & Treks', icon: '🏔️' },
  { id: 'heritage', label: 'Heritage & Culture', icon: '🏛️' },
  { id: 'luxe', label: 'Ultra-Luxury', icon: '✨' },
  { id: 'nature', label: 'Wildlife & Nature', icon: '🌿' }
];

const fastFilterChips = [
  { id: 'all', label: 'All Curations' },
  { id: 'trending', label: 'Trending Now 🔥' },
  { id: 'budget', label: 'Budget Under ₹20k 💰' },
  { id: 'honeymoon', label: 'Honeymoon 💍' },
  { id: 'solo', label: 'Solo Backpacker 🎒' },
  { id: 'visafree', label: 'Visa-Free for Indians 🛂' }
];

export const Destinations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setActiveBooking, addToast } = useBooking();
  const urlQuery = searchParams.get('q') || '';

  // State Management
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'india'
  const [activeVibe, setActiveVibe] = useState('all');
  const [activeFastFilter, setActiveFastFilter] = useState('all');
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [favorites, setFavorites] = useState({});
  const [activeWonderId, setActiveWonderId] = useState('w-1');
  const [wonderRegionFilter, setWonderRegionFilter] = useState('all');
  const [wonderViewMode, setWonderViewMode] = useState('spotlight'); // 'spotlight' | 'grid'

  // Dynamic OpenStreetMap + Wikipedia Multi-Package Resolver State
  const [dynamicCityData, setDynamicCityData] = useState(null);
  const [isResolvingDynamic, setIsResolvingDynamic] = useState(false);

  const fetchDynamicMatch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setDynamicCityData(null);
      return;
    }
    setIsResolvingDynamic(true);
    try {
      const res = await resolveCityPackages(query.trim());
      if (res && res.packages && res.packages.length > 0) {
        setDynamicCityData(res);
      } else {
        setDynamicCityData(null);
      }
    } catch (e) {
      console.warn('[Dynamic Destination Resolve]', e);
    } finally {
      setIsResolvingDynamic(false);
    }
  }, []);

  const handleBookPackage = (pkg) => {
    const rawPrice = typeof pkg.numericPrice === 'number' 
      ? pkg.numericPrice 
      : parseInt(String(pkg.dealPrice || pkg.price || '15000').replace(/[^0-9]/g, ''), 10) || 15000;
    const destTitle = pkg.city || pkg.title || 'Selected Destination';
    const subTitle = pkg.title || pkg.subtitle || 'Curated Expedition';
    setActiveBooking({
      serviceType: 'package',
      itemTitle: `${destTitle} — ${subTitle} (${pkg.duration || '5D/4N'})`,
      details: {
        destination: destTitle,
        country: pkg.country || 'Global',
        duration: pkg.duration || '5D/4N',
        transit: pkg.trainOption || pkg.transit || (pkg.tag ? `${pkg.tag} Included` : 'Express Rail/Transit Option Available'),
        flight: pkg.flightOption || pkg.flight || 'Direct & Connecting Flight Matrix Included',
        hotel: pkg.hotel || 'Handpicked Boutique 4-Star Resort Stay',
        vibe: pkg.vibe || pkg.region || 'Curated Experience',
        inclusions: pkg.inclusions || pkg.highlights || ['Hotel Stay', 'Guided Tour', 'Daily Breakfast']
      },
      priceINR: rawPrice,
      priceUSD: Math.round(rawPrice / 86.5),
      image: pkg.image
    });
    addToast(`Trip package reserved: ${destTitle}! Proceeding to secure checkout.`, 'success');
    navigate('/checkout');
  };

  const filteredWonders = useMemo(() => {
    if (wonderRegionFilter === 'all') return sevenWonders;
    return sevenWonders.filter((w) => w.region === wonderRegionFilter);
  }, [wonderRegionFilter]);

  const activeWonder = useMemo(() => {
    const found = sevenWonders.find((w) => w.id === activeWonderId);
    if (found && (wonderRegionFilter === 'all' || found.region === wonderRegionFilter)) {
      return found;
    }
    return filteredWonders[0] || sevenWonders[0];
  }, [activeWonderId, wonderRegionFilter, filteredWonders]);

  const [liveBackendDests, setLiveBackendDests] = useState([]);

  // Hero Slideshow Controls
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Recommender Quiz State
  const [quizBudget, setQuizBudget] = useState('budget'); // 'budget' | 'comfort' | 'luxe'
  const [quizCompanion, setQuizCompanion] = useState('couple'); // 'solo' | 'couple' | 'family' | 'group'

  // Fetch optional live backend destinations
  useEffect(() => {
    let cancelled = false;
    const fetchDestinations = async () => {
      try {
        const res = await api.get('/destinations');
        if (!cancelled && Array.isArray(res.data) && res.data.length > 0) {
          setLiveBackendDests(res.data);
        }
      } catch (err) {
        // Fallback to high-density static curated data seamlessly
      }
    };
    fetchDestinations();
    return () => { cancelled = true; };
  }, []);

  // Sync search input with URL params and auto-resolve
  useEffect(() => {
    if (urlQuery) {
      setSearchInput(urlQuery);
      const qLower = urlQuery.toLowerCase();
      const isIndiaLoc = ['india', 'varanasi', 'taj', 'agra', 'kedarnath', 'ayodhya', 'goa', 'kerala', 'jaipur', 'manali', 'hampi', 'ladakh', 'amritsar', 'pondicherry', 'udaipur', 'rishikesh', 'ooty', 'coorg'].some(k => qLower.includes(k));
      if (isIndiaLoc) {
        setActiveTab('india');
      }
      fetchDynamicMatch(urlQuery);
    }
  }, [urlQuery, fetchDynamicMatch]);

  // Slideshow Automated Ken Burns Interval
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered Cards Inventory Computation
  const currentCatalog = useMemo(() => {
    let list = searchInput.trim() 
      ? [...incredibleIndia, ...globalEscapes] 
      : (activeTab === 'global' ? globalEscapes : incredibleIndia);

    // Gracefully merge backend items if available
    if (liveBackendDests.length > 0) {
      const mergedBackend = liveBackendDests
        .filter(d => {
          const loc = (d.location || '').toLowerCase();
          const name = (d.name || d.title || '').toLowerCase();
          const isIndia = loc.includes('india') || name.includes('india') || ['goa', 'kerala', 'jaipur', 'himachal', 'andaman', 'kashmir', 'varanasi', 'ladakh', 'rishikesh', 'coorg', 'ooty', 'udaipur', 'agra'].some(s => loc.includes(s) || name.includes(s));
          return activeTab === 'india' ? isIndia : !isIndia;
        })
        .map(d => ({
          id: `live-${d._id || d.slug}`,
          title: d.name || d.title,
          country: d.location || (activeTab === 'india' ? 'India' : 'International'),
          region: d.location || 'Curated Escape',
          dealPrice: d.price ? (d.price.startsWith('₹') ? d.price : `₹${d.price}`) : (activeTab === 'india' ? '₹14,500' : '₹42,000'),
          originalPrice: activeTab === 'india' ? '₹19,900' : '₹58,000',
          emiPrice: activeTab === 'india' ? '₹1,200/mo' : '₹3,700/mo',
          discountBadge: 'Save 25%',
          duration: '5N / 6D',
          rating: String(d.rating || '4.85'),
          reviewsCount: '1.2k',
          tag: d.category || 'Live Certified Package',
          vibe: d.category === 'beach' ? 'beaches' : d.category === 'mountain' ? 'mountains' : d.category === 'heritage' ? 'heritage' : d.category === 'luxe' ? 'luxe' : 'nature',
          inclusions: ["Verified Stays", "Curated Sightseeing", "Airport / Station Transit", "24/7 Concierge"],
          image: d.image || (activeTab === 'india' ? 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=1200&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop'),
          tagsList: ["trending", "budget"],
          companionFit: ["couple", "solo", "family"],
          budgetCategory: "comfort"
        }));

      // Merge avoiding duplicates by title
      const existingTitles = new Set(list.map(item => item.title.toLowerCase()));
      const uniqueBackend = mergedBackend.filter(item => !existingTitles.has(item.title.toLowerCase()));
      list = [...list, ...uniqueBackend];
    }

    // Filter by Vibe
    if (activeVibe !== 'all') {
      list = list.filter(item => item.vibe === activeVibe);
    }

    // Filter by Fast Filter Chip
    if (activeFastFilter !== 'all') {
      if (activeFastFilter === 'trending') {
        list = list.filter(item => item.tagsList.includes('trending'));
      } else if (activeFastFilter === 'budget') {
        list = list.filter(item => {
          const numPrice = parseInt(item.dealPrice.replace(/[^0-9]/g, ''), 10);
          return numPrice <= 20000;
        });
      } else if (activeFastFilter === 'honeymoon') {
        list = list.filter(item => item.tagsList.includes('honeymoon'));
      } else if (activeFastFilter === 'solo') {
        list = list.filter(item => item.tagsList.includes('solo'));
      } else if (activeFastFilter === 'visafree') {
        list = list.filter(item => item.tagsList.includes('visafree') || item.country === 'India');
      }
    }

    // Filter by Search Query
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.country.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.inclusions.some(inc => inc.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, activeVibe, activeFastFilter, searchInput, liveBackendDests]);

  // Dynamic Recommendation Result based on Quiz Preferences
  const quizRecommendation = useMemo(() => {
    const all = [...globalEscapes, ...incredibleIndia];
    const match = all.find(item => 
      item.budgetCategory === quizBudget && 
      item.companionFit.includes(quizCompanion)
    ) || all[0];
    return match;
  }, [quizBudget, quizCompanion]);

  // Current Active Slide
  const currentSlide = heroSlides[currentSlideIndex];

  // SEO Schemas
  const destinationsSchemas = [
    getWebPageSchema({
      type: 'CollectionPage',
      name: 'Explore Handpicked Travel Destinations & Packages — TravelEase',
      description: 'Discover curated international and Indian travel destinations with verified packages, real-time rates, and instant booking synchronization.',
      url: '/destinations',
      breadcrumb: true,
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Destinations' },
    ], '/destinations'),
    getItemListSchema({
      name: 'Curated Global & Incredible India Travel Packages',
      description: 'Discover luxury and budget-friendly verified vacation packages on TravelEase',
      url: '/destinations',
      items: [
        ...globalEscapes.map(d => ({ name: d.title, url: '/destinations', image: d.image })),
        ...incredibleIndia.map(d => ({ name: d.title, url: '/destinations', image: d.image })),
      ],
    }),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-400" id="destinations-discovery-engine">
      <JsonLd data={destinationsSchemas} />

      {/* ── AMBIENT ATMOSPHERIC LIGHTING MESH (Full Light/Dark Mode Unification) ── */}
      {/* 1. Radiant Daylight Sun/Sky Overhead Aura */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-[radial-gradient(ellipse_85%_65%_at_50%_-15%,rgba(245,158,11,0.22),rgba(56,189,248,0.14),transparent_75%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(245,158,11,0.12),rgba(56,189,248,0.06),transparent_70%)] pointer-events-none z-0" />
      
      {/* 2. Concentrated Ambient Color Bloom directly behind the hero stage */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[520px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15)_0%,rgba(14,165,233,0.09)_45%,transparent_75%)] blur-3xl pointer-events-none z-0" />

      {/* 3. High-Precision Architectural Dot Lattice (Anchors empty margins to page structure) */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.1px,transparent_1.1px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-40 dark:opacity-20 pointer-events-none z-0" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-24 relative z-10 space-y-16 lg:space-y-24">
        
        {/* ==================================================================== */}
        {/* SECTION 1: HERO SECTION — KINETIC TRAVEL SLIDESHOW & TELEMETRY HUD  */}
        {/* ==================================================================== */}
        <div className="relative w-full h-[65vh] sm:h-[70vh] min-h-[520px] sm:min-h-[580px] max-h-[750px] rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3.2rem] overflow-hidden ring-1 ring-slate-900/10 dark:ring-white/10 border border-white/80 dark:border-white/10 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.16),0_12px_36px_-10px_rgba(245,158,11,0.15)] dark:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.15)] group">
          
          {/* Subtle Top Glass Rim Reflection for Physical Depth */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/25 to-transparent pointer-events-none z-30" />

          {/* Ken Burns Crossfade Image Layer */}
          <div className="absolute inset-0 bg-slate-950 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide.id}
                src={currentSlide.image}
                alt={currentSlide.title}
                initial={{ opacity: 0, scale: 1.0 }}
                animate={{ opacity: 1, scale: 1.06 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.8, ease: "easeInOut" },
                  scale: { duration: 6.5, ease: "easeOut" }
                }}
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none will-change-transform"
                loading="eager"
              />
            </AnimatePresence>

            {/* Balanced Editorial Cinema Multi-Gradients & Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-950/15 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none" />
          </div>

          {/* Overlaid Top Status Bar */}
          <div className="absolute top-6 left-6 right-6 lg:top-8 lg:left-10 lg:right-10 flex flex-wrap items-center justify-between gap-3 z-20 pointer-events-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/65 dark:bg-black/55 backdrop-blur-xl border border-white/25 text-xs font-mono text-white shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="font-bold tracking-wider uppercase text-[11px] text-amber-300">CURATED DISCOVERY</span>
              <span className="text-white/40">·</span>
              <span className="text-white/85 hidden sm:inline font-mono">120+ VERIFIED PACKAGES</span>
            </div>

            {/* Weather & Live Telemetry Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/65 dark:bg-black/55 backdrop-blur-xl border border-white/25 text-xs font-mono text-white shadow-xl">
              <div className="flex items-center gap-1.5 text-amber-300">
                <FaSun className="w-3.5 h-3.5 animate-[spin_12s_linear_infinite]" />
                <span className="font-bold">{currentSlide.weather}</span>
              </div>
              <span className="text-white/40">·</span>
              <span className="text-white/85 text-[11px] hidden md:inline">{currentSlide.season}</span>
            </div>
          </div>

          {/* Overlaid Bottom Telemetry HUD Content */}
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 lg:p-14 flex flex-col lg:flex-row items-end justify-between gap-8 z-20">
            
            {/* Destination Title & Details */}
            <div className="w-full lg:max-w-2xl text-left space-y-3">
              <motion.div 
                key={`badge-${currentSlide.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md"
              >
                <HiOutlineSparkles className="w-3.5 h-3.5" />
                <span>{currentSlide.vibe}</span>
                <span className="text-amber-400/50">|</span>
                <span>Starting {currentSlide.startingPrice}</span>
              </motion.div>

              <motion.h1 
                key={`title-${currentSlide.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]"
              >
                {currentSlide.title}
              </motion.h1>

              <motion.p
                key={`tagline-${currentSlide.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-sm sm:text-base lg:text-lg text-white/90 font-medium max-w-xl leading-relaxed [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]"
              >
                {currentSlide.tagline}
              </motion.p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <ThreeUIButton
                  onClick={() => navigate(getItineraryRoute(currentSlide.destName, currentSlide.itineraryPrompt), { state: { prompt: currentSlide.itineraryPrompt } })}
                  variant="amber-glow"
                  size="md"
                  icon={FaArrowRight}
                  iconPosition="right"
                  id="hero-plan-trip-btn"
                >
                  Plan AI Trip
                </ThreeUIButton>

                <ThreeUIButton
                  onClick={() => navigate(getHotelsRoute(currentSlide.destName))}
                  variant="glass-frost"
                  size="md"
                  icon={FaHotel}
                  id="hero-stays-btn"
                >
                  Verified Stays
                </ThreeUIButton>

                {hasTrainNetwork(currentSlide.destName) && (
                  <ThreeUIButton
                    onClick={() => navigate(getTrainsRoute(currentSlide.destName))}
                    variant="glass-frost"
                    size="md"
                    icon={FaTrain}
                    id="hero-trains-btn"
                  >
                    Trains
                  </ThreeUIButton>
                )}

                <ThreeUIButton
                  onClick={() => navigate(getFlightsRoute(currentSlide.destName))}
                  variant="glass-frost"
                  size="md"
                  icon={FaPlane}
                  id="hero-flights-btn"
                >
                  Flights
                </ThreeUIButton>
              </div>
            </div>

            {/* Slideshow Progress Bar, Nav Controls & Thumbnails */}
            <div className="w-full lg:w-auto flex flex-col items-start lg:items-end gap-3 bg-slate-950/65 dark:bg-black/55 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl border border-white/20 shadow-2xl">
              
              <div className="flex items-center justify-between w-full gap-4">
                <div className="text-[11px] font-mono text-white/70">
                  <span className="text-amber-400 font-bold">0{currentSlideIndex + 1}</span> / 0{heroSlides.length}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevSlide}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center border border-white/25 transition-all active:scale-95"
                    aria-label="Previous destination"
                  >
                    <FaChevronLeft className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-bold transition-all active:scale-95 shadow-lg shadow-amber-400/30"
                    aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                  >
                    {isPlaying ? <FaPause className="w-2.5 h-2.5" /> : <FaPlay className="w-2.5 h-2.5 translate-x-[1px]" />}
                  </button>

                  <button
                    onClick={handleNextSlide}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center border border-white/25 transition-all active:scale-95"
                    aria-label="Next destination"
                  >
                    <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Progress Thumbnail Strip */}
              <div className="flex items-center gap-2 pt-1 w-full justify-between">
                {heroSlides.map((slide, idx) => {
                  const isActive = idx === currentSlideIndex;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`relative h-1.5 sm:h-2 rounded-full transition-all duration-300 overflow-hidden ${
                        isActive ? 'w-14 sm:w-16 bg-white/30' : 'w-6 sm:w-8 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Jump to slide ${slide.title}`}
                    >
                      {isActive && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: isPlaying ? 5 : 0, ease: 'linear' }}
                          className="absolute inset-0 bg-amber-400 rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>


        {/* ==================================================================== */}
        {/* INTERACTIVE DISCOVERY COMMAND BAR & REAL-TIME STATS STRIP             */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-[#141622]/85 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.7)]">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              
              {/* Live Search Input */}
              <div className="relative w-full lg:w-96 flex items-center">
                <FaSearch className="absolute left-4 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchInput(val);
                    if (val.trim().length >= 2) {
                      fetchDynamicMatch(val.trim());
                    } else {
                      setDynamicCityData(null);
                    }
                  }}
                  placeholder={isResolvingDynamic ? "Resolving via OpenStreetMap..." : "Search ANY destination in India & World (e.g. Varanasi, Taj Mahal, Kedarnath)..."}
                  className="w-full pl-11 pr-10 py-2.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-colors"
                  id="destinations-search-input"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setDynamicCityData(null);
                    }}
                    className="absolute right-3.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Fast Filter Chips */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
                {fastFilterChips.map((chip) => {
                  const isSelected = activeFastFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setActiveFastFilter(chip.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all select-none ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/8'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Quick Telemetry Stats Strip */}
            <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <FiShield className="w-3.5 h-3.5 text-amber-500" />
                <span>120+ Verified Packages</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">IRCTC & IATA DIRECT SYNCED</span>
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-800 dark:text-slate-200 font-bold">4.9/5 TrustScore</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span>Best Rate Guarantee</span>
              </div>
            </div>
          </div>
        </div>


        {/* ==================================================================== */}
        {/* SECTION 2: DUAL-ENGINE NAVIGATION & TRAVEL VIBES                     */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            
            {/* Flagship Segmented Pill Toggle */}
            <SegmentedPillToggle
              options={[
                { id: 'global', label: 'Global Escapes ✈️' },
                { id: 'india', label: 'Incredible India 🇮🇳' }
              ]}
              value={activeTab}
              onChange={(tab) => {
                setActiveTab(tab);
                setActiveVibe('all');
              }}
              layoutId="destinationsCategoryToggle"
              size="lg"
            />

            {/* Secondary Filter Pill Row: Travel Vibes */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 scrollbar-none justify-start sm:justify-center">
              {vibeOptions.map((vibe) => {
                const isSelected = activeVibe === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    onClick={() => setActiveVibe(vibe.id)}
                    className={`px-4 py-2 rounded-full text-xs font-mono font-medium tracking-wide transition-all border select-none flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold border-transparent shadow-lg'
                        : 'bg-white/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span>{vibe.icon}</span>
                    <span>{vibe.label}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Results Counter Banner */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 px-2">
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-bold">{currentCatalog.length}</strong> matching packages
            </span>
            {(activeVibe !== 'all' || activeFastFilter !== 'all' || searchInput) && (
              <button
                onClick={() => {
                  setActiveVibe('all');
                  setActiveFastFilter('all');
                  setSearchInput('');
                }}
                className="inline-flex items-center gap-1.5 text-amber-500 hover:text-amber-400 font-bold"
              >
                <FaUndo className="w-2.5 h-2.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* DYNAMIC MULTI-API REAL-TIME DESTINATION & PACKAGES ENGINE */}
        {dynamicCityData && (
          <div className="mb-14 space-y-8">
            {/* Live City Telemetry HUD & Weather Header */}
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.5rem] p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 via-white/95 to-slate-50 dark:from-amber-500/15 dark:via-[#121422] dark:to-[#0c0e17] border-2 border-amber-400/50 shadow-2xl backdrop-blur-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row gap-7 items-start">
                <div className="relative w-full lg:w-80 h-56 rounded-3xl overflow-hidden shrink-0 shadow-lg">
                  <img 
                    src={dynamicCityData.cityProfile.image} 
                    alt={dynamicCityData.cityProfile.name} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  />
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-mono font-bold text-[11px] shadow-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                    <span>Real-time Live Engine</span>
                  </div>
                  <div className="absolute bottom-3.5 left-3.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white font-mono text-xs flex items-center gap-2 border border-white/15 shadow">
                    <FaSun className="text-amber-400 text-xs animate-[spin_10s_linear_infinite]" />
                    <span className="font-bold">{dynamicCityData.cityProfile.weather.temp}</span>
                    <span className="text-white/40">·</span>
                    <span>{dynamicCityData.cityProfile.weather.status}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3.5 w-full">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 flex-wrap">
                        <FaMapMarkerAlt className="text-amber-500" />
                        <span>{dynamicCityData.cityProfile.region}, {dynamicCityData.cityProfile.country}</span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{dynamicCityData.cityProfile.bestSeason}</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                        {dynamicCityData.cityProfile.name}
                      </h2>
                    </div>

                    {/* Live Telemetry Pills: AQI & Sunrise/Sunset */}
                    <div className="flex flex-wrap items-center gap-2">
                      {dynamicCityData.cityProfile.aqi && (
                        <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-mono">
                          <span className="text-slate-400 text-[10px] block">AIR QUALITY</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            AQI {dynamicCityData.cityProfile.aqi.aqi} · {dynamicCityData.cityProfile.aqi.aqiLabel}
                          </span>
                        </div>
                      )}
                      {dynamicCityData.cityProfile.aqi?.sunrise && (
                        <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-mono">
                          <span className="text-slate-400 text-[10px] block">SOLAR CYCLE</span>
                          <span className="font-bold text-amber-500">
                            🌅 {dynamicCityData.cityProfile.aqi.sunrise} · 🌇 {dynamicCityData.cityProfile.aqi.sunset}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                    {dynamicCityData.cityProfile.description}
                  </p>

                  {/* Master Action Strip */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <ThreeUIButton
                      variant="amber-glow"
                      size="sm"
                      to={`/itinerary?prompt=${encodeURIComponent(`Plan a 4-day trip to ${dynamicCityData.cityProfile.name}`)}`}
                      icon={<HiOutlineSparkles className="text-amber-950 dark:text-white" />}
                    >
                      AI Trip Architect
                    </ThreeUIButton>

                    <ThreeUIButton
                      variant="liquid-metal"
                      size="sm"
                      to={`/explore?q=${encodeURIComponent(dynamicCityData.cityProfile.name)}`}
                      icon={<FaMapMarkerAlt />}
                    >
                      View on Live Map
                    </ThreeUIButton>

                    <ThreeUIButton
                      variant="specular-dark"
                      size="sm"
                      to={`/hotels?destination=${encodeURIComponent(dynamicCityData.cityProfile.name)}`}
                      icon={<FaHotel />}
                    >
                      Browse City Hotels
                    </ThreeUIButton>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Grid of ALL 3-4 Real-Time Dynamic Trip Packages */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Verified Bookable Packages for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{dynamicCityData.cityProfile.name}</span>
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
                    Complete all-in-one travel packages with high-speed rail (Vande Bharat / IRCTC), flights, handpicked stays, and local tours.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 shrink-0 hidden sm:inline">
                  {dynamicCityData.packages.length} Real-Time Packages
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {dynamicCityData.packages.map((pkg, pIdx) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pIdx * 0.08 }}
                  >
                    <ThreeCard3D
                      depth={24}
                      className="rounded-[2rem] overflow-hidden bg-white dark:bg-[#121420]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-xl hover:border-amber-400/50 transition-all flex flex-col h-full"
                    >
                      {/* Package Photo with Badges */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                        <img 
                          src={pkg.image} 
                          alt={pkg.title} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/35 pointer-events-none" />

                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10.5px] font-mono font-bold tracking-wider shadow">
                            {pkg.badge}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-bold">
                            {pkg.duration}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold">
                            <FaStar className="w-3.5 h-3.5" />
                            <span className="text-white">{pkg.rating}</span>
                            <span className="text-white/40 text-[10px]">({pkg.reviewsCount})</span>
                          </div>
                          <span className="text-emerald-400 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/30">
                            {pkg.discountBadge}
                          </span>
                        </div>
                      </div>

                      {/* Package Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                            {pkg.vibe}
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                            {pkg.title}
                          </h4>

                          {/* Dual Transit Matrix */}
                          <div className="space-y-1.5 pt-3">
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-purple-500/20 text-[11px] font-mono text-slate-800 dark:text-slate-200">
                              <FaTrain className="text-purple-500 text-xs shrink-0" />
                              <span className="truncate">{pkg.trainOption}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-sky-500/20 text-[11px] font-mono text-slate-800 dark:text-slate-200">
                              <FaPlane className="text-sky-500 text-xs shrink-0" />
                              <span className="truncate">{pkg.flightOption}</span>
                            </div>
                          </div>

                          {/* Highlights Preview */}
                          <div className="space-y-1 pt-3">
                            {pkg.highlights.map((h, hIdx) => (
                              <div key={hIdx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 truncate">
                                <FaCheckCircle className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                                <span className="truncate">{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Price & Action Strip */}
                        <div className="pt-3 border-t border-slate-200 dark:border-white/10">
                          <div className="flex items-baseline justify-between mb-3">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 line-through mr-2">{pkg.originalPrice}</span>
                              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{pkg.dealPrice}</span>
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 ml-1">/ person</span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{pkg.emiPrice}</span>
                          </div>

                          {/* Multi-Modal Ecosystem Quick Shortcuts */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(getHotelsRoute(pkg.city || dynamicCityData.cityProfile.name));
                              }}
                              className="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors border border-amber-500/20"
                              title={`View verified hotels in ${pkg.city || dynamicCityData.cityProfile.name}`}
                            >
                              <FaHotel className="w-2.5 h-2.5" /> Stays
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(getTrainsRoute(pkg.city || dynamicCityData.cityProfile.name));
                              }}
                              className="px-2 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors border border-purple-500/20"
                              title={`Search trains to ${pkg.city || dynamicCityData.cityProfile.name}`}
                            >
                              <FaTrain className="w-2.5 h-2.5" /> Trains
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(getFlightsRoute(pkg.city || dynamicCityData.cityProfile.name));
                              }}
                              className="px-2 py-1 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors border border-sky-500/20"
                              title={`Search flights to ${pkg.city || dynamicCityData.cityProfile.name}`}
                            >
                              <FaPlane className="w-2.5 h-2.5" /> Flights
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(getExploreRoute(pkg.city || dynamicCityData.cityProfile.name));
                              }}
                              className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors border border-emerald-500/20"
                              title={`View ${pkg.city || dynamicCityData.cityProfile.name} on interactive map`}
                            >
                              <FaCompass className="w-2.5 h-2.5" /> Map
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <ThreeUIButton
                              variant="amber-glow"
                              size="sm"
                              onClick={() => handleBookPackage(pkg)}
                              icon={<FaArrowRight />}
                              iconPosition="right"
                            >
                              Book Package
                            </ThreeUIButton>

                            <ThreeUIButton
                              variant="specular-dark"
                              size="sm"
                              to={getItineraryRoute(pkg.city || dynamicCityData.cityProfile.name, pkg.itineraryPrompt)}
                              icon={<HiOutlineSparkles className="text-amber-500" />}
                            >
                              AI Customizer
                            </ThreeUIButton>
                          </div>
                        </div>
                      </div>
                    </ThreeCard3D>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SECTION 3: COMPREHENSIVE CARD INVENTORY — HIGH-DENSITY MMT TILES      */}
        {/* ==================================================================== */}
        {currentCatalog.length === 0 && !dynamicCityData ? (
          <div className="py-20 text-center rounded-3xl bg-white/50 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/10">
            <FiCompass className="w-12 h-12 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">No destinations found</h3>
            <p className="text-sm text-slate-500 font-mono mb-6">Try refining your search terms or clearing active filters.</p>
            <ThreeUIButton
              onClick={() => {
                setActiveVibe('all');
                setActiveFastFilter('all');
                setSearchInput('');
                setDynamicCityData(null);
              }}
              variant="specular-dark"
              size="sm"
            >
              Reset All Filters
            </ThreeUIButton>
          </div>
        ) : currentCatalog.length === 0 && dynamicCityData ? null : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-9"
          >
            <AnimatePresence mode="popLayout">
              {currentCatalog.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative rounded-[2rem] overflow-hidden bg-white/90 dark:bg-[#121420]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_45px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-amber-400/50 dark:hover:border-amber-400/40 transition-all duration-300 flex flex-col cursor-pointer"
                  onClick={() => {
                    setSearchInput(dest.title);
                    fetchDynamicMatch(dest.title);
                    const el = document.getElementById('dest-search-bar');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  
                  {/* Aspect Ratio Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img 
                      src={dest.image} 
                      alt={dest.title} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      loading="lazy"
                    />

                    {/* Gradient Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 pointer-events-none" />

                    {/* Top Floating Strip: Region + Rating + Wishlist Heart */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white font-bold shadow-md">
                          {dest.region}
                        </span>
                        <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 shadow-md">
                          <FaStar className="w-3 h-3 text-amber-400" />
                          <span>{dest.rating}</span>
                          <span className="text-white/40 text-[10px]">({dest.reviewsCount})</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(dest.id); }}
                        className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg"
                        aria-label="Toggle wishlist"
                      >
                        {favorites[dest.id] ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <FaHeart className="w-4 h-4 text-rose-500" />
                          </motion.div>
                        ) : (
                          <FaRegHeart className="w-4 h-4 text-white hover:text-rose-400" />
                        )}
                      </button>
                    </div>

                    {/* Bottom-Left Overlaid Duration Badge */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-2 z-10">
                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-mono font-bold tracking-wider shadow-md">
                        {dest.duration}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-medium">
                        {dest.tag}
                      </span>
                    </div>

                  </div>

                  {/* High-Density Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    
                    {/* Header Info */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {dest.title}
                        </h3>
                        <span className="text-xs font-mono font-bold text-slate-400 shrink-0 mt-1">
                          {dest.country}
                        </span>
                      </div>

                      {/* Inclusions Chips Strip */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {dest.inclusions.map((inc, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                          >
                            <FaCheckCircle className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400" />
                            {inc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Multi-Modal Ecosystem Action Strip */}
                    <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(getHotelsRoute(dest.title));
                          }}
                          className="px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors border border-amber-500/20"
                          title={`View verified stays in ${dest.title}`}
                        >
                          <FaHotel className="w-2.5 h-2.5" /> Stays
                        </button>

                        {hasTrainNetwork(dest.title) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(getTrainsRoute(dest.title));
                            }}
                            className="px-2 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors border border-purple-500/20"
                            title={`Search trains to ${dest.title}`}
                          >
                            <FaTrain className="w-2.5 h-2.5" /> Trains
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(getFlightsRoute(dest.title));
                          }}
                          className="px-2 py-1 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-400 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors border border-sky-500/20"
                          title={`Search flights to ${dest.title}`}
                        >
                          <FaPlane className="w-2.5 h-2.5" /> Flights
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(getExploreRoute(dest.title));
                          }}
                          className="px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10.5px] font-mono font-bold flex items-center gap-1 transition-colors border border-emerald-500/20"
                          title={`View ${dest.title} on map`}
                        >
                          <FaCompass className="w-2.5 h-2.5" /> Map
                        </button>
                      </div>

                      {/* Pricing Architecture (MMT-Style) & Action CTA */}
                      <div className="flex items-end justify-between gap-4 pt-1">
                        {/* Price Strip */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 line-through font-mono">
                              {dest.originalPrice}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {dest.discountBadge}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                              {dest.dealPrice}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">/ person</span>
                          </div>
                          <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                            or {dest.emiPrice} No-Cost EMI
                          </div>
                        </div>

                        {/* Action CTA Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <ThreeUIButton
                            onClick={(e) => {
                              e.stopPropagation();
                              const prompt = `Plan a comprehensive ${dest.duration} journey to ${dest.title}, ${dest.country} highlighting ${dest.inclusions.join(', ')}`;
                              navigate(getItineraryRoute(dest.title, prompt), { state: { prompt } });
                            }}
                            variant="glass-frost"
                            size="sm"
                            icon={HiOutlineSparkles}
                            className="shrink-0"
                            title="Plan AI Itinerary"
                          >
                            AI Plan
                          </ThreeUIButton>

                          <ThreeUIButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookPackage(dest);
                            }}
                            variant="amber-glow"
                            size="sm"
                            icon={FaArrowRight}
                            iconPosition="right"
                            className="shrink-0"
                            title="Book this Package"
                          >
                            Book
                          </ThreeUIButton>
                        </div>
                      </div>
                    </div>

                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}


        {/* ==================================================================== */}
        {/* SECTION 4: 7 WONDERS OF THE WORLD MASTERPIECE SHOWCASE                */}
        {/* ==================================================================== */}
        <section className="pt-10 space-y-8" id="wonders-showcase-section">
          
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200/80 dark:border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
                <HiOutlineSparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>UNESCO GLOBAL MASTERPIECES · THE 7 WONDERS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                The Seven Wonders <span className="gradient-text">of the World.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium max-w-2xl mt-1.5">
                Pinnacles of human perseverance and engineering. Explore architectural marvels, nearest multi-modal air and rail hubs, and generate bespoke itineraries.
              </p>
            </div>

            {/* Region Filters & View Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Region Filter Buttons */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-mono font-bold">
                {[
                  { id: 'all', label: 'All 7', icon: FaLandmark },
                  { id: 'asia', label: 'Asia (2)', icon: FaGlobeAsia },
                  { id: 'americas', label: 'Americas (3)', icon: FaGlobeAmericas },
                  { id: 'middle-east', label: 'Mid-East', icon: FaCompass },
                  { id: 'europe', label: 'Europe', icon: FaGlobeEurope }
                ].map((rf) => {
                  const Icon = rf.icon;
                  const isActive = wonderRegionFilter === rf.id;
                  return (
                    <button
                      key={rf.id}
                      type="button"
                      onClick={() => setWonderRegionFilter(rf.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{rf.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* View Mode Toggle: Spotlight vs Grid */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setWonderViewMode('spotlight')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    wonderViewMode === 'spotlight'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Interactive Spotlight Stage"
                >
                  <FaEye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Spotlight</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWonderViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    wonderViewMode === 'grid'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Full 7-Card Panorama Grid"
                >
                  <FaThLarge className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">All Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: INTERACTIVE CINEMATIC STAGE */}
          {wonderViewMode === 'spotlight' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Main Feature Stage (8 cols) */}
              <div className="lg:col-span-8 flex flex-col">
                <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-slate-950 flex-1 min-h-[580px] flex flex-col justify-between p-6 sm:p-10 group">
                  
                  {/* Background Layer with Crossfade */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeWonder.id}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.55 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <img
                        src={activeWonder.image}
                        alt={activeWonder.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        decoding="async"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/hero_mountain_day.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-black/35" />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent hidden md:block" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Top Bar Badges */}
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span>UNESCO {activeWonder.unescoYear}</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-mono font-semibold flex items-center gap-1.5">
                        <span className="text-base">{activeWonder.flag}</span>
                        <span>{activeWonder.country}</span>
                      </span>
                    </div>

                    <span className="px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-mono font-black tracking-wider uppercase shadow-md">
                      {activeWonder.tag}
                    </span>
                  </div>

                  {/* Stage Bottom Information */}
                  <div className="relative z-10 pt-20 space-y-5">
                    
                    {/* Location & Title */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                        <FaMapMarkerAlt className="w-3 h-3 text-amber-400" />
                        <span>{activeWonder.location}</span>
                      </div>
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                        {activeWonder.title}
                      </h3>
                      <p className="text-slate-200 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
                        {activeWonder.description}
                      </p>
                    </div>

                    {/* Insider Secret Callout */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-amber-400/30 text-xs text-amber-100 flex items-start gap-3 shadow-lg">
                      <div className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-400">
                        <FaLightbulb className="w-3.5 h-3.5" />
                      </div>
                      <div className="leading-relaxed">
                        <span className="font-mono font-bold text-amber-300 uppercase tracking-wide mr-1.5">INSIDER TIP:</span>
                        <span>{activeWonder.insiderTip}</span>
                      </div>
                    </div>

                    {/* Architectural & Transit Specs Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="p-3 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">BUILT ERA</div>
                        <div className="text-xs sm:text-sm font-black text-white mt-0.5">{activeWonder.builtEra}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">BEST SEASON</div>
                        <div className="text-xs sm:text-sm font-black text-amber-300 mt-0.5">{activeWonder.bestSeason}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 col-span-2 sm:col-span-1">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">TRANSIT HUB</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5 truncate" title={activeWonder.nearestTransit}>
                          {activeWonder.nearestTransit.split('·')[0]}
                        </div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/10 col-span-2 sm:col-span-1">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">EXPEDITION FARE</div>
                        <div className="text-xs sm:text-sm font-black text-emerald-400 mt-0.5">{activeWonder.estFare}</div>
                      </div>
                    </div>

                    {/* Dual Action CTA Buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <ThreeUIButton
                        variant="amber-glow"
                        size="md"
                        icon={FaArrowRight}
                        iconPosition="right"
                        onClick={() => navigate(`/itinerary?prompt=${encodeURIComponent(activeWonder.itineraryPrompt)}`, { state: { prompt: activeWonder.itineraryPrompt } })}
                      >
                        Plan AI Expedition with Groq™
                      </ThreeUIButton>

                      <ThreeUIButton
                        variant="specular-dark"
                        size="md"
                        icon={FaPlane}
                        onClick={() => navigate(`/flights?to=${encodeURIComponent(activeWonder.flightDest || 'DEL')}&destination=${encodeURIComponent(activeWonder.name)}`, { state: { destination: activeWonder.name } })}
                      >
                        Search Flights
                      </ThreeUIButton>

                      <button
                        type="button"
                        onClick={() => navigate(`/hotels?city=${encodeURIComponent(activeWonder.location.split(',')[0].trim())}`)}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold border border-white/15 transition-all flex items-center gap-2 hover:border-amber-400/40"
                      >
                        <FaHotel className="w-3.5 h-3.5 text-amber-400" />
                        <span>Find Boutique Stays</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Wonder Selector Stack (4 cols) */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between px-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <FaRoute className="w-3.5 h-3.5 text-amber-500" />
                    <span>SELECT WONDER ({filteredWonders.length})</span>
                  </span>
                  <span>CLICK TO VIEW</span>
                </div>

                {/* Scrollable / Stacked List of Wonders */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[540px] pr-1 scrollbar-thin">
                  {filteredWonders.map((w, index) => {
                    const isSelected = activeWonder.id === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setActiveWonderId(w.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 group relative ${
                          isSelected
                            ? 'bg-amber-500/15 dark:bg-amber-400/10 border-amber-500/60 dark:border-amber-400/50 shadow-md ring-1 ring-amber-400/30'
                            : 'bg-white/80 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.07] hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        {/* Thumbnail Image */}
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/15 bg-slate-800">
                          <img
                            src={w.image}
                            alt={w.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/hero_mountain_day.jpg';
                            }}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-amber-500/20 ring-2 ring-inset ring-amber-400" />
                          )}
                        </div>

                        {/* Title and Meta */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                              0{index + 1} · {w.country} {w.flag}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                            }`}>
                              {w.tag}
                            </span>
                          </div>

                          <h4 className={`text-sm font-bold truncate mt-0.5 transition-colors ${
                            isSelected
                              ? 'text-amber-600 dark:text-amber-300 font-black'
                              : 'text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400'
                          }`}>
                            {w.title}
                          </h4>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {w.builtEra} · {w.bestSeason}
                          </div>
                        </div>

                        {/* Active Arrow Indicator */}
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 text-xs shadow-sm">
                            <FaArrowRight className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Previous / Next Bar */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const curIdx = filteredWonders.findIndex(w => w.id === activeWonder.id);
                      const prevIdx = (curIdx - 1 + filteredWonders.length) % filteredWonders.length;
                      setActiveWonderId(filteredWonders[prevIdx].id);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    <FaChevronLeft className="w-3 h-3 text-amber-500" />
                    <span>Previous Wonder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const curIdx = filteredWonders.findIndex(w => w.id === activeWonder.id);
                      const nextIdx = (curIdx + 1) % filteredWonders.length;
                      setActiveWonderId(filteredWonders[nextIdx].id);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Next Wonder</span>
                    <FaChevronRight className="w-3 h-3 text-amber-500" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* VIEW MODE 2: BALANCED 7-CARD PANORAMA GRID (Zero Empty Holes) */}
          {wonderViewMode === 'grid' && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredWonders.map((wonder) => (
                <div key={wonder.id} className="h-full flex flex-col">
                  <ThreeCard3D
                    maxTilt={6}
                    glare={true}
                    spotlightColor="rgba(245, 158, 11, 0.16)"
                    className="h-full rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121422] shadow-lg flex flex-col group"
                  >
                    {/* Card Media Header */}
                    <div className="relative h-60 overflow-hidden bg-slate-950">
                      <img
                        src={wonder.image}
                        alt={wonder.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/hero_mountain_day.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-bold">
                          UNESCO {wonder.unescoYear}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-mono font-black tracking-wider uppercase shadow-sm">
                          {wonder.tag}
                        </span>
                      </div>

                      {/* Flag and Location */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
                        <span className="flex items-center gap-1.5 font-bold">
                          <span className="text-sm">{wonder.flag}</span>
                          <span>{wonder.country}</span>
                        </span>
                        <span className="text-amber-300 font-bold">{wonder.estFare}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                          <FaMapMarkerAlt className="w-3 h-3" />
                          <span className="truncate">{wonder.location}</span>
                        </div>

                        <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                          {wonder.title}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 mt-2 leading-relaxed">
                          {wonder.description}
                        </p>

                        {/* Specs Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10">
                            🏛️ {wonder.builtEra}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10">
                            ☀️ {wonder.bestSeason}
                          </span>
                        </div>
                      </div>

                      {/* Card Action */}
                      <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveWonderId(wonder.id);
                            setWonderViewMode('spotlight');
                            document.getElementById('wonders-showcase-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-xs font-mono font-bold text-slate-500 hover:text-amber-500 transition-colors flex items-center gap-1"
                        >
                          <FaEye className="w-3 h-3" />
                          <span>Spotlight</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/itinerary?prompt=${encodeURIComponent(wonder.itineraryPrompt)}`, { state: { prompt: wonder.itineraryPrompt } })}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Plan AI Trip</span>
                          <FaArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>

                    </div>
                  </ThreeCard3D>
                </div>
              ))}
            </motion.div>
          )}

        </section>


        {/* ==================================================================== */}
        {/* SECTION 5: "TRAVELER PREFERENCES" 2-CLICK QUIZ RECOMMENDER           */}
        {/* ==================================================================== */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white/90 dark:bg-[#121422]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 p-8 sm:p-12 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
          
          {/* Specular Backglows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: 2-Click Questionnaire */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-500 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
                  <HiOutlineLightningBolt className="w-3.5 h-3.5" />
                  <span>AI TRIP RECOMMENDER</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  Not sure where to venture?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Answer 2 quick preferences and let our neural engine reveal your ideal getaway.
                </p>
              </div>

              {/* Step 1: Budget Selection */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Select Your Budget Tier
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'budget', label: 'Budget < ₹25k', desc: 'Backpacker & Value' },
                    { id: 'comfort', label: 'Comfort ₹25k–₹60k', desc: '4★ Flights & Stays' },
                    { id: 'luxe', label: 'Ultra-Luxe ₹60k+', desc: '5★ Private Villas' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setQuizBudget(tier.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        quizBudget === tier.id
                          ? 'bg-amber-400/15 border-amber-400 text-slate-950 dark:text-white shadow-md'
                          : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold">{tier.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Companion Selection */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Who Are You Traveling With?
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'solo', label: 'Solo Explorer', emoji: '🎒' },
                    { id: 'couple', label: 'Couple / Romantic', emoji: '💍' },
                    { id: 'family', label: 'Family Vacation', emoji: '👨‍👩‍👧' },
                    { id: 'group', label: 'Adventure Group', emoji: '🏔️' }
                  ].map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => setQuizCompanion(comp.id)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        quizCompanion === comp.id
                          ? 'bg-amber-400/15 border-amber-400 text-slate-950 dark:text-white shadow-md'
                          : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="text-lg mb-1">{comp.emoji}</div>
                      <div className="text-[11px] font-mono font-bold">{comp.label}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Dynamic Matched Destination Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 text-white space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <HiOutlineSparkles className="w-4 h-4" /> 98% MATCH FOR YOU
                  </span>
                  <span className="text-white/60">{quizRecommendation.duration}</span>
                </div>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src={quizRecommendation.image}
                    alt={quizRecommendation.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-amber-300 font-bold uppercase">{quizRecommendation.country}</div>
                      <h4 className="text-xl font-black text-white">{quizRecommendation.title}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/60 line-through font-mono">{quizRecommendation.originalPrice}</div>
                      <div className="text-lg font-black text-amber-400">{quizRecommendation.dealPrice}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {quizRecommendation.inclusions.slice(0, 3).map((inc, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/10">
                      ✓ {inc}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <ThreeUIButton
                    onClick={() => {
                      const prompt = `Plan a ${quizRecommendation.duration} trip to ${quizRecommendation.title} in ${quizRecommendation.country} with focus on ${quizRecommendation.tag}`;
                      navigate(`/itinerary?prompt=${encodeURIComponent(prompt)}`, { state: { prompt } });
                    }}
                    variant="amber-glow"
                    size="md"
                    icon={FaArrowRight}
                    iconPosition="right"
                    className="w-full"
                  >
                    Build Custom Itinerary
                  </ThreeUIButton>
                </div>
              </div>
            </div>

          </div>
        </div>


        {/* ==================================================================== */}
        {/* SECTION 6: DESIGN HARMONY & SEAMLESS FOOTER BLEND                     */}
        {/* ==================================================================== */}
        <div className="relative pt-6 pb-2 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Ready to embark on your journey?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Over 40,000 travelers have redefined their horizon with TravelEase's neural-assisted vacation engine.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <ThreeUIButton
                to="/itinerary"
                variant="liquid-metal"
                size="md"
                icon={FaCompass}
              >
                Launch AI Trip Architect
              </ThreeUIButton>
            </div>
          </div>
        </div>

      </div>

      {/* Seamless Radial Ambient Bottom Gradient fading into Footer */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-100/90 dark:from-[#06080d] via-slate-100/40 dark:via-[#06080d]/80 to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default Destinations;