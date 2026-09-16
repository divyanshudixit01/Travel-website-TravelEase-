import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAIItinerary, getAIStatus, parsePromptToParams } from '../services/aiEngine';
import { generateDynamicItinerary } from '../services/dynamicTravelEngine';
import { useBooking } from '../context/BookingContext';
import { 
  getHotelsRoute, 
  getTrainsRoute, 
  getFlightsRoute, 
  getExploreRoute, 
  getDestinationsRoute, 
  hasTrainNetwork 
} from '../utils/travelBridge';
import {
  FaRoute, FaPlane, FaHotel, FaCheckCircle, FaStar,
  FaMapMarkerAlt, FaSlidersH, FaShareAlt, FaPrint, FaClock,
  FaCloudSun, FaArrowRight, FaArrowLeft,
  FaUsers, FaCalendarAlt, FaWallet, FaChevronRight,
  FaLightbulb, FaHeart, FaMountain,
  FaCamera, FaUmbrellaBeach, FaSpa, FaChild,
  FaTrain, FaBolt, FaExchangeAlt
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import {
  FiLoader, FiTerminal, FiZap, FiCpu, FiGlobe, FiSearch,
  FiCompass, FiTrendingUp
} from 'react-icons/fi';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getSoftwareApplicationSchema } from '../utils/schemas';
import { ThreeCard3D } from '../components/ui/ThreeCard3D';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';

// ─── Indian Rupee Currency Formatter ──────────────────────────────────────────
const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return `₹${Math.round(Number(amount)).toLocaleString('en-IN')}`;
};

// ─── Previous Authentic Images Restored ───────────────────────────────────────

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop',
];

const SAMPLE_PROMPTS = [
  { title: "Goa 3D Coastal Rail & Beach", query: "3-day budget backpacking trip to Goa with Vande Bharat under ₹12,000", tag: "Rail + Beach" },
  { title: "Varanasi 4D Spiritual Vande Bharat", query: "4-day spiritual journey to Varanasi with Vande Bharat and ghats under ₹15,000", tag: "High-Speed Rail" },
  { title: "Dubai 4D Luxury Retreat", query: "4-day luxury retreat in Dubai for 2 adults under ₹1,25,000", tag: "Flight + Metro" },
  { title: "Bali 5D Honeymoon Villa", query: "5-day honeymoon in Bali with private villa under ₹90,000", tag: "Flight" },
  { title: "Rajasthan 6D Royal Heritage", query: "6-day royal Rajasthan heritage tour with desert camp under ₹45,000", tag: "Express Rail" },
  { title: "Tokyo 3D Bullet Rail & Culture", query: "3-day Tokyo food and Shinkansen bullet rail tour under ₹1,40,000", tag: "Bullet Train" },
];

const VIBE_OPTIONS = [
  { label: 'Luxury & Culture', icon: FaCamera, color: 'text-amber-500' },
  { label: 'Beach & Relaxation', icon: FaUmbrellaBeach, color: 'text-cyan-500' },
  { label: 'Alpine & Treks', icon: FaMountain, color: 'text-emerald-500' },
  { label: 'Smart Budget Explorer', icon: FiTrendingUp, color: 'text-green-500' },
  { label: 'Romantic Escape', icon: FaHeart, color: 'text-rose-500' },
  { label: 'Family Vacation', icon: FaChild, color: 'text-violet-500' },
  { label: 'Spiritual & Heritage', icon: FaSpa, color: 'text-orange-500' },
  { label: 'High-Speed Rail Tour', icon: FaTrain, color: 'text-purple-500' },
];

// Swappable Destinations with previous authentic Unsplash images
const SWAPPABLE_DESTINATIONS = [
  {
    id: 'dubai',
    name: 'Dubai & Desert Oasis',
    country: 'UAE',
    category: 'luxury',
    tag: 'Emirates • Etihad Rail',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop',
    duration: '5D / 4N',
    startingPriceINR: 55000,
    rating: '4.88',
    trainOption: 'Dubai Metro Red Line & Etihad Rail',
    flightOption: 'Emirates EK-511 (3h 40m)',
    highlights: ['Burj Khalifa Level 148', 'Red Dunes Desert Safari', 'Marina Yacht Cruise'],
  },
  {
    id: 'goa',
    name: 'Goa Coastal Haven',
    country: 'India',
    category: 'rail',
    tag: 'Vande Bharat • Beachfront',
    image: 'https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?q=80&w=600&auto=format&fit=crop',
    duration: '3D / 2N',
    startingPriceINR: 12500,
    rating: '4.92',
    trainOption: 'Vande Bharat #22229 (Madgaon Ex)',
    flightOption: 'IndiGo 6E-512 (1h 10m)',
    highlights: ['Baga & Anjuna Beach', 'Chapora Fort Sunset', 'Spice Plantation Tour'],
  },
  {
    id: 'paris',
    name: 'Paris & Swiss Alps',
    country: 'France',
    category: 'alpine',
    tag: 'TGV & Glacier Express Rail',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop',
    duration: '6D / 5N',
    startingPriceINR: 115000,
    rating: '4.91',
    trainOption: 'Eurostar & TGV Lyria High-Speed (3h 05m)',
    flightOption: 'Air France AF-225 (8h 30m)',
    highlights: ['Eiffel Tower Summit', 'Glacier Express Scenic Train', 'Zermatt Matterhorn View'],
  },
  {
    id: 'bali',
    name: 'Bali & Nusa Penida',
    country: 'Indonesia',
    category: 'coastal',
    tag: 'Direct Flights • Private Villa',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop',
    duration: '6D / 5N',
    startingPriceINR: 48000,
    rating: '4.95',
    trainOption: 'Scenic Bali Coastal Express',
    flightOption: 'Air India / Vistara Direct (5h 50m)',
    highlights: ['Ubud Sacred Monkey Forest', 'Kelingking T-Rex Beach', 'Tegallalang Rice Terrace'],
  },
  {
    id: 'tokyo',
    name: 'Tokyo & Kyoto Shinkansen',
    country: 'Japan',
    category: 'luxury',
    tag: 'Shinkansen Bullet Rail (320 km/h)',
    image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=600&auto=format&fit=crop',
    duration: '7D / 6N',
    startingPriceINR: 98000,
    rating: '4.98',
    trainOption: 'Tokaido Shinkansen Bullet Train (2h 15m)',
    flightOption: 'ANA / Air India Direct (7h 45m)',
    highlights: ['Shibuya Crossing & Sky', 'Kyoto Fushimi Inari', 'Mount Fuji Day Trip'],
  },
  {
    id: 'manali',
    name: 'Manali & Rohtang Pass',
    country: 'India',
    category: 'alpine',
    tag: 'Una Vande Bharat • Snow Peaks',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600&auto=format&fit=crop',
    duration: '4D / 3N',
    startingPriceINR: 16500,
    rating: '4.89',
    trainOption: 'Vande Bharat Una #22447 + Scenic Cab',
    flightOption: 'Kullu Bhuntar Flight (1h 15m)',
    highlights: ['Solang Valley Paragliding', 'Atal Tunnel Expedition', 'Old Manali Apple Orchards'],
  },
  {
    id: 'varanasi',
    name: 'Varanasi Spiritual Ghats',
    country: 'India',
    category: 'rail',
    tag: 'IRCTC Vande Bharat #22436',
    image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=600&auto=format&fit=crop',
    duration: '4D / 3N',
    startingPriceINR: 14200,
    rating: '4.96',
    trainOption: 'Vande Bharat Express (8h 00m)',
    flightOption: 'Air India AI-406 (1h 25m)',
    highlights: ['Ganga Aarti at Dashashwamedh', 'Sarnath Buddhist Stupa', 'Sunrise Boat Ride'],
  },
  {
    id: 'maldives',
    name: 'Maldives Private Overwater Atoll',
    country: 'Maldives',
    category: 'luxury',
    tag: 'Direct Seaplane & Lagoon',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=600&auto=format&fit=crop',
    duration: '5D / 4N',
    startingPriceINR: 85000,
    rating: '4.97',
    trainOption: 'Island Speedboat Express',
    flightOption: 'IndiGo / Maldivian Direct (2h 45m)',
    highlights: ['Overwater Bungalow', 'Coral Reef Scuba Diving', 'Sunset Dolphin Cruise'],
  },
];

// User Stories with authentic Unsplash photos
const USER_STORIES = [
  {
    name: 'Priya & Rahul',
    trip: 'Honeymoon in Santorini',
    quote: 'TravelEase planned our entire 7-day honeymoon in seconds. The hotel it picked had the exact sunset view we dreamed of!',
    savings: '₹28,000',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=400&auto=format&fit=crop'
  },
  {
    name: 'Arjun S.',
    trip: 'Solo Backpacking in Vietnam',
    quote: 'I typed "budget trip to Vietnam for 10 days under ₹40k" and got a complete plan with real hostels and street food spots.',
    savings: '₹15,500',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=400&auto=format&fit=crop'
  },
  {
    name: 'The Sharma Family',
    trip: 'Family Holiday in Kerala',
    quote: 'Planning for 4 people is usually chaos. TravelEase handled everything — houseboat bookings, kid-friendly activities, even dietary needs!',
    savings: '₹32,000',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=400&auto=format&fit=crop'
  },
];

const FEATURE_CARDS = [
  {
    icon: FaTrain,
    title: 'Dual Transit: Plane & Train',
    desc: 'Compare live Vande Bharat & IRCTC trains with flight radar to choose speed or savings.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: FiCpu,
    title: 'Groq LPU™ Instant Architect',
    desc: 'Sub-second AI synthesizes complete trips with verified stays, attractions, and daily timelines.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: FaBolt,
    title: 'IRCTC Tatkal Seat Radar',
    desc: 'Instant prediction of Tatkal confirmation probability and executive chair car seat availability.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: FiGlobe,
    title: 'Rupee-Native Unified Booking',
    desc: 'Transparent pricing in Indian Rupees (₹) with zero hidden fees and direct 1-click checkout.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export const Itinerary = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { setActiveBooking, addToast } = useBooking();

  // State
  const [inputMode, setInputMode] = useState('prompt');
  const [prompt, setPrompt] = useState(() => searchParams.get('prompt') || searchParams.get('destination') || searchParams.get('q') || location.state?.prompt || location.state?.destination || '');
  const [targetDest, setTargetDest] = useState('Goa');
  const [days, setDays] = useState(4);
  const [pax, setPax] = useState(2);
  const [budgetINR, setBudgetINR] = useState(65000);
  const [selectedVibe, setSelectedVibe] = useState('High-Speed Rail Tour');
  const [activeDayTab, setActiveDayTab] = useState('all');
  const [selectedTransitMode, setSelectedTransitMode] = useState('compare'); // 'plane' | 'train' | 'compare'
  const [isGenerating, setIsGenerating] = useState(false);
  const [toolLogs, setToolLogs] = useState([]);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [aiOnline, setAiOnline] = useState(null);
  const [heroImgIdx, setHeroImgIdx] = useState(0);
  const [activeStory, setActiveStory] = useState(0);

  // Swappable Destinations State
  const [swappedIndex, setSwappedIndex] = useState(0);
  const [swappableCategory, setSwappableCategory] = useState('all');

  const resultsRef = useRef(null);
  const lastTriggeredQueryRef = useRef('');

  // Filter swappable destinations by category
  const filteredSwappables = SWAPPABLE_DESTINATIONS.filter(
    d => swappableCategory === 'all' || d.category === swappableCategory
  );
  const activeSwappedCard = filteredSwappables[swappedIndex % filteredSwappables.length] || SWAPPABLE_DESTINATIONS[0];

  // Check AI engine status
  useEffect(() => {
    getAIStatus()
      .then(s => setAiOnline(s.status === 'operational'))
      .catch(() => setAiOnline(false));
  }, []);

  // Rotate previous hero images every 6 seconds
  useEffect(() => {
    const t = setInterval(() => setHeroImgIdx(p => (p + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Rotate user testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveStory(p => (p + 1) % USER_STORIES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleNextSwap = () => {
    setSwappedIndex(prev => (prev + 1) % filteredSwappables.length);
  };

  const handlePrevSwap = () => {
    setSwappedIndex(prev => (prev - 1 + filteredSwappables.length) % filteredSwappables.length);
  };

  const triggerGeneration = useCallback(async (queryText) => {
    setIsGenerating(true);
    setToolLogs(['🧠 Synthesizing real-time itinerary & dual transit routes...']);
    setGeneratedItinerary(null);
    try {
      const result = await generateAIItinerary(queryText, (logMsg) => {
        setToolLogs(prev => [...prev, logMsg]);
      });
      setGeneratedItinerary(result);
      addToast(`AI synthesized package ready for ${result.destination}!`, 'success');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch {
      // 100% Dynamic Zero-Failure Fallback: Synthesize with realistic Vande Bharat & flight options
      const params = parsePromptToParams(queryText);
      const fallbackResult = generateDynamicItinerary(params.destination, params.days, params.budgetINR, params.vibe);
      setToolLogs(prev => [
        ...prev,
        `⚡ Dynamic Synthesis Engine engaged for: "${fallbackResult.destination}"`,
        `🚆 IRCTC Route: ${fallbackResult.train?.trainName} (${fallbackResult.train?.coachClass})`,
        `✈️ Air Transit: ${fallbackResult.flight?.airline}`,
        `🏨 Verified Stay: ${fallbackResult.hotel?.name} (⭐ ${fallbackResult.hotel?.starRating})`,
        `✅ ${fallbackResult.daysCount} Days complete day-by-day plan ready!`
      ]);
      setGeneratedItinerary(fallbackResult);
      addToast(`Dynamic package synthesized for ${fallbackResult.destination}!`, 'success');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } finally {
      setIsGenerating(false);
    }
  }, [addToast]);

  // Auto-trigger generation if coming from Hero, Explore, or Destinations with a query or router state
  useEffect(() => {
    const incomingPrompt = 
      searchParams.get('prompt') || 
      searchParams.get('destination') || 
      searchParams.get('q') || 
      location.state?.prompt || 
      location.state?.destination;

    const query = (incomingPrompt || '').trim();
    if (query && lastTriggeredQueryRef.current !== query) {
      lastTriggeredQueryRef.current = query;
      setPrompt(query);
      triggerGeneration(query);
    }
  }, [searchParams, location.state, triggerGeneration]);

  const handleGenerate = (e) => {
    e?.preventDefault();
    let query = prompt.trim();
    if (!query) {
      query = `Plan a ${days}-day ${selectedVibe.toLowerCase()} trip to ${targetDest} for ${pax} people with budget of ₹${budgetINR.toLocaleString('en-IN')}`;
    }
    triggerGeneration(query);
  };

  const handleSelectSwappedCard = (card) => {
    const q = `Plan a ${card.duration} trip to ${card.name} (${card.country}) for 2 travelers with Vande Bharat train and flight options under ₹${(card.startingPriceINR * 2).toLocaleString('en-IN')}`;
    setPrompt(q);
    triggerGeneration(q);
  };

  const handleBookEntireItinerary = () => {
    if (!generatedItinerary) return;

    // Calculate chosen transit details
    const chosenTransit = selectedTransitMode === 'train'
      ? {
          type: 'train',
          title: generatedItinerary.train?.trainName || 'Vande Bharat Express',
          details: `${generatedItinerary.train?.departureStation || ''} → ${generatedItinerary.train?.arrivalStation || ''} (${generatedItinerary.train?.coachClass || 'Executive Chair Car'})`,
          priceINR: (generatedItinerary.train?.priceINR || 2450) * (generatedItinerary.pax || 2)
        }
      : {
          type: 'flight',
          title: `${generatedItinerary.flight?.airline || 'Airline'} ${generatedItinerary.flight?.flightNumber || ''}`,
          details: `${generatedItinerary.flight?.from || ''} → ${generatedItinerary.flight?.to || ''} (${generatedItinerary.flight?.cabinClass || 'Economy'})`,
          priceINR: (generatedItinerary.flight?.priceINR || 5500) * (generatedItinerary.pax || 2)
        };

    const packagePriceINR = generatedItinerary.totalPackageINR || 45000;

    setActiveBooking({
      serviceType: 'ai-itinerary',
      itemTitle: `AI Package — ${generatedItinerary.destination} (${generatedItinerary.daysCount} Days)`,
      details: {
        destination: generatedItinerary.destination,
        duration: `${generatedItinerary.daysCount} Days`,
        pax: `${generatedItinerary.pax} Travelers`,
        chosenTransitMode: selectedTransitMode === 'train' ? 'Train Journey' : 'Flight Journey',
        transitDetails: chosenTransit.details,
        includedHotel: generatedItinerary.hotel?.name,
      },
      priceUSD: Math.round(packagePriceINR / 86.5),
      priceINR: packagePriceINR,
      image: generatedItinerary.hotel?.image || generatedItinerary.destinationImage
    });

    addToast(`Trip package with ${chosenTransit.title} locked! Proceeding to checkout.`, 'success');
    navigate('/checkout');
  };

  const schemas = [
    getWebPageSchema({
      name: 'AI Trip Planner with Plane & Train Options — TravelEase',
      description: 'Instant AI travel planning with both Vande Bharat trains & flights in Indian Rupees.',
      url: '/itinerary',
      breadcrumb: true
    }),
    getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'AI Trip Planner' }], '/itinerary'),
    getSoftwareApplicationSchema(),
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#06080d] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-500 selection:bg-amber-400 selection:text-black" id="itinerary-page">
      <JsonLd data={schemas} />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO SECTION WITH PREVIOUS ROTATING TRAVEL PHOTOGRAPHY
          ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" id="ai-hero-atmosphere">

        {/* Previous Rotating Background Images */}
        {HERO_IMAGES.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
            style={{ opacity: heroImgIdx === idx ? 1 : 0 }}
          >
            <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" loading={idx === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-transparent to-black/40" />

        {/* Soft atmospheric gradient blend into page body */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-[#06080d] to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-28 md:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Column (7 cols) — Headline, AI Badge, Prompt Box */}
            <div className="lg:col-span-7">

              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 mb-6"
              >
                <span className={`w-2 h-2 rounded-full ${aiOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className="text-[11px] font-mono font-semibold text-white/90 uppercase tracking-widest">
                  {aiOnline ? 'Groq LPU™ Engine Online' : 'Connecting Engine...'}
                </span>
                <span className="w-px h-3 bg-white/20" />
                <span className="text-[11px] font-mono text-amber-300 font-medium">IRCTC & Flights Grounded</span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] mb-5"
              >
                Plan your dream
                <br />
                trip in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">seconds.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed mb-7 font-sans"
              >
                World-class trip architecture powered by Groq LPU™. Automatically synthesizes verified itineraries with <strong className="text-amber-300 font-semibold">both Train (Vande Bharat / IRCTC)</strong> and <strong className="text-sky-300 font-semibold">Flight</strong> routes, 5★ stays, and daily timelines in <strong className="text-emerald-300 font-semibold">Indian Rupees (₹)</strong>.
              </motion.p>

              {/* Natural Language Prompt Input Bar */}
              <motion.form
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleGenerate}
                className="flex flex-col sm:flex-row gap-2.5 p-1.5 rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/20 shadow-2xl"
              >
                <div className="flex-1 flex items-center gap-3 px-4 py-2.5">
                  <FiSearch className="w-4 h-4 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Try: 3-day trip to Goa with Vande Bharat under ₹15,000"
                    className="w-full bg-transparent text-white placeholder-white/50 text-sm font-medium focus:outline-none"
                    disabled={isGenerating}
                  />
                </div>
                <ThreeUIButton
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  variant="amber-glow"
                  size="md"
                  icon={isGenerating ? FiLoader : HiOutlineSparkles}
                  className="shrink-0"
                >
                  {isGenerating ? 'Synthesizing...' : 'Build AI Trip'}
                </ThreeUIButton>
              </motion.form>

              {/* Quick Select Prompts */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap gap-2 mt-4"
              >
                {SAMPLE_PROMPTS.slice(0, 3).map((sp) => (
                  <button
                    key={sp.title}
                    type="button"
                    onClick={() => { setPrompt(sp.query); triggerGeneration(sp.query); }}
                    disabled={isGenerating}
                    className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-white/80 border border-white/15 hover:bg-amber-400/20 hover:border-amber-400/40 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span className="text-amber-400 text-[10px]">●</span>
                    <span>{sp.title}</span>
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Right Column (5 cols) — High-Impact Live Radar Bento Cards */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="lg:col-span-5 grid grid-cols-2 gap-3.5"
            >
              {/* Card 1: Train Radar */}
              <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-purple-500/30 hover:border-purple-500/50 transition-colors shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                  <FaTrain className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-white font-mono">Vande Bharat</div>
                <div className="text-[11px] text-purple-300 font-mono mt-0.5">IRCTC Live & Tatkal Radar</div>
              </div>

              {/* Card 2: Flight Radar */}
              <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-sky-500/30 hover:border-sky-500/50 transition-colors shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 shadow-[0_0_12px_rgba(14,165,233,0.3)]">
                  <FaPlane className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-white font-mono">450+ Airlines</div>
                <div className="text-[11px] text-sky-300 font-mono mt-0.5">Lowest Airfare Radar</div>
              </div>

              {/* Card 3: Hotel Radar */}
              <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-amber-500/30 hover:border-amber-500/50 transition-colors shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  <FaHotel className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-white font-mono">2M+ Stays</div>
                <div className="text-[11px] text-amber-300 font-mono mt-0.5">Heritage Palaces & Resorts</div>
              </div>

              {/* Card 4: Groq Speed */}
              <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-500/50 transition-colors shadow-lg">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <FiZap className="w-4 h-4" />
                </div>
                <div className="text-lg font-black text-white font-mono">&lt;1s Latency</div>
                <div className="text-[11px] text-emerald-300 font-mono mt-0.5">Groq LPU™ 120B Speed</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — SWAPPABLE TRENDING DESTINATIONS SHOWCASE
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 max-w-7xl mx-auto z-20" id="swappable-destinations-section">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              <span>Interactive Swappable Showcase</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">destinations</span> with rail & flights
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mt-2">
              Swipe or swap through top curated journeys. Each package includes both plane and high-speed train connectivity in Indian Rupees (₹).
            </p>
          </div>

          {/* Category Filter Pills */}
          <SegmentedPillToggle
            options={[
              { id: 'all', label: 'All Destinations' },
              { id: 'rail', label: '🚆 High-Speed Rail' },
              { id: 'coastal', label: '🌴 Coastal' },
              { id: 'alpine', label: '🏔️ Alpine' },
              { id: 'luxury', label: '✨ Global Luxury' },
            ]}
            value={swappableCategory}
            onChange={(id) => { setSwappableCategory(id); setSwappedIndex(0); }}
            layoutId="itinerarySwappableCategory"
            size="sm"
          />
        </div>

        {/* Primary Swappable 3D Showcase Card */}
        <div className="relative max-w-4xl mx-auto mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSwappedCard.id}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <ThreeCard3D
                maxTilt={5}
                spotlightColor="rgba(245, 158, 11, 0.15)"
                className="overflow-hidden rounded-3xl bg-white dark:bg-[#0b0f19]/90 border border-slate-200 dark:border-white/10 shadow-2xl"
              >
                <div className="grid grid-cols-1 md:grid-cols-12">

                  {/* Left: Destination Image & Badges (7 cols) */}
                  <div className="md:col-span-7 relative h-72 md:h-[420px] overflow-hidden">
                    <img
                      src={activeSwappedCard.image}
                      alt={activeSwappedCard.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                      <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-semibold flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-amber-400 w-3 h-3" />
                        {activeSwappedCard.country}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-black font-mono text-[10px] font-bold uppercase tracking-wider shadow">
                        {activeSwappedCard.duration}
                      </span>
                    </div>

                    {/* Bottom Overlay Title on Image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest mb-1">
                        {activeSwappedCard.tag}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {activeSwappedCard.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-amber-400">
                          <FaStar className="w-3.5 h-3.5" />
                          <span className="text-xs font-mono font-bold text-white">{activeSwappedCard.rating}</span>
                        </div>
                        <span className="text-white/40 text-xs">·</span>
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <FaCheckCircle className="w-3 h-3" /> AI Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Dual Transit Details & One-Click Plan CTA (5 cols) */}
                  <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-slate-50/50 dark:bg-transparent">
                    <div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        DUAL TRANSIT CONNECTIVITY
                      </div>

                      {/* Flight Route Preview */}
                      <Link 
                        to={getFlightsRoute(activeSwappedCard.name)}
                        className="block p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-sky-400 dark:hover:border-sky-400 mb-3 shadow-sm transition-all group"
                        title={`Check live flights to ${activeSwappedCard.name}`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-semibold text-sky-600 dark:text-sky-400 mb-1">
                          <span className="flex items-center gap-1.5">
                            <FaPlane className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /> Flight Radar
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px] group-hover:text-sky-500">Live ➔</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {activeSwappedCard.flightOption}
                        </div>
                      </Link>

                      {/* Train Route Preview */}
                      <Link 
                        to={getTrainsRoute(activeSwappedCard.name)}
                        className="block p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-purple-500/25 dark:border-purple-500/20 hover:border-purple-400 mb-4 shadow-sm transition-all group"
                        title={`Check live IRCTC trains to ${activeSwappedCard.name}`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-semibold text-purple-600 dark:text-purple-400 mb-1">
                          <span className="flex items-center gap-1.5">
                            <FaTrain className="w-3 h-3 group-hover:scale-110 transition-transform" /> High-Speed Train
                          </span>
                          <span className="text-emerald-500 text-[10px] font-bold group-hover:underline">Tatkal Live ➔</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {activeSwappedCard.trainOption}
                        </div>
                      </Link>

                      {/* Key Highlights */}
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        EXPERIENCE HIGHLIGHTS
                      </div>
                      <ul className="space-y-1.5 mb-6">
                        {activeSwappedCard.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <FaChevronRight className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            <span className="truncate">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Starting from</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                          {formatINR(activeSwappedCard.startingPriceINR)}
                        </span>
                      </div>

                      <ThreeUIButton
                        type="button"
                        onClick={() => handleSelectSwappedCard(activeSwappedCard)}
                        disabled={isGenerating}
                        variant="amber-glow"
                        size="md"
                        icon={HiOutlineSparkles}
                        className="w-full"
                      >
                        Plan This Trip with AI
                      </ThreeUIButton>
                    </div>
                  </div>
                </div>
              </ThreeCard3D>
            </motion.div>
          </AnimatePresence>

          {/* Swapper Navigation Controls (Left & Right Buttons) */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handlePrevSwap}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 transition-colors shadow-sm"
              aria-label="Previous destination"
            >
              <FaArrowLeft className="w-3 h-3 text-amber-500" />
              <span>Previous Swap</span>
            </button>

            {/* Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {filteredSwappables.map((d, idx) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSwappedIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === (swappedIndex % filteredSwappables.length)
                      ? 'w-8 bg-amber-500'
                      : 'w-2 bg-slate-300 dark:bg-white/20 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to ${d.name}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextSwap}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 transition-colors shadow-sm"
              aria-label="Next destination"
            >
              <span>Next Swap</span>
              <FaArrowRight className="w-3 h-3 text-amber-500" />
            </button>
          </div>
        </div>

        {/* Swappable Thumbnails Strip — Tap any card to swap it to primary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 pt-4">
          {filteredSwappables.map((dest, idx) => {
            const isSelected = idx === (swappedIndex % filteredSwappables.length);
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => setSwappedIndex(idx)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden border transition-all text-left group ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-105 z-10'
                    : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2">
                  <div className="text-[11px] font-bold text-white truncate">{dest.name}</div>
                  <div className="text-[9px] font-mono text-amber-400 font-semibold">{formatINR(dest.startingPriceINR)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — CUSTOM BUILDER IN INDIAN RUPEES (₹)
          ════════════════════════════════════════════════════════════════════ */}
      {!generatedItinerary && !isGenerating && (
        <section className="py-12 px-4" id="custom-builder-section">
          <div className="max-w-4xl mx-auto">

            {/* Mode Switcher */}
            <div className="flex justify-center mb-8">
              <SegmentedPillToggle
                options={[
                  { id: 'prompt', label: 'Natural Query', icon: FiSearch },
                  { id: 'sliders', label: 'Custom Rupee Builder', icon: FaSlidersH },
                ]}
                value={inputMode}
                onChange={setInputMode}
                layoutId="itineraryInputModeToggle"
                size="md"
              />
            </div>

            {inputMode === 'sliders' && (
              <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleGenerate}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b0f19]/80 border border-slate-200 dark:border-white/10 shadow-xl space-y-6"
              >
                {/* Destination */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-amber-500" /> Target Destination
                  </label>
                  <input
                    type="text"
                    value={targetDest}
                    onChange={(e) => setTargetDest(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-amber-400/30 mb-3"
                    placeholder="e.g. Goa, Varanasi, Dubai, Paris, Rajasthan, Manali..."
                  />
                  <div className="flex flex-wrap gap-2">
                    {['Goa', 'Varanasi', 'Dubai', 'Paris', 'Rajasthan', 'Bali', 'Manali', 'Tokyo'].map((name) => (
                      <button
                        type="button"
                        key={name}
                        onClick={() => setTargetDest(name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                          targetDest.toLowerCase() === name.toLowerCase()
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                            : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration & Travelers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <FaCalendarAlt className="w-3.5 h-3.5 text-amber-500" /> Duration
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{days} Days / {Math.max(days - 1, 1)} Nights</span>
                    </div>
                    <input type="range" min="1" max="14" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <FaUsers className="w-3.5 h-3.5 text-amber-500" /> Travelers
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{pax} {pax === 1 ? 'Guest' : 'Guests'}</span>
                    </div>
                    <input type="range" min="1" max="8" value={pax} onChange={(e) => setPax(Number(e.target.value))} className="w-full accent-amber-500 cursor-pointer" />
                  </div>
                </div>

                {/* Vibe Selection */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    <FaTrain className="w-3.5 h-3.5 text-purple-500" /> Travel Vibe & Transit Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {VIBE_OPTIONS.map((v) => {
                      const Icon = v.icon;
                      return (
                        <button
                          type="button"
                          key={v.label}
                          onClick={() => setSelectedVibe(v.label)}
                          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            selectedVibe === v.label
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                              : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.1]'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${selectedVibe === v.label ? 'text-current' : v.color}`} />
                          <span className="truncate text-[11px] font-mono">{v.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget in Indian Rupees (₹) */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FaWallet className="w-3.5 h-3.5 text-emerald-500" /> Total Package Budget (INR ₹)
                    </span>
                    <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">{formatINR(budgetINR)}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="500000"
                    step="5000"
                    value={budgetINR}
                    onChange={(e) => setBudgetINR(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span>₹5,000 (Backpacker)</span>
                    <span>₹1,00,000 (Premium)</span>
                    <span>₹5,00,000 (Luxury)</span>
                  </div>
                </div>

                <ThreeUIButton
                  type="submit"
                  disabled={isGenerating}
                  variant="amber-glow"
                  size="lg"
                  icon={isGenerating ? FiLoader : HiOutlineSparkles}
                  className="w-full"
                >
                  {isGenerating ? 'Synthesizing Plane & Train Routes...' : 'Build AI Trip Package'}
                </ThreeUIButton>
              </motion.form>
            )}

            {inputMode === 'prompt' && (
              <div className="text-center pt-2">
                <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mb-3">
                  Or switch to <button onClick={() => setInputMode('sliders')} className="text-amber-500 font-bold underline underline-offset-2 hover:text-amber-400">Custom Rupee Builder</button> for budget and day sliders
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SAMPLE_PROMPTS.slice(3).map((sp) => (
                    <button
                      key={sp.title}
                      type="button"
                      onClick={() => { setPrompt(sp.query); triggerGeneration(sp.query); }}
                      disabled={isGenerating}
                      className="text-[11px] font-mono px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.06] hover:border-amber-400/50 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                    >
                      {sp.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — FEATURE BENTO GRID (Landing Page Style)
          ════════════════════════════════════════════════════════════════════ */}
      {!generatedItinerary && !isGenerating && (
        <section className="py-12 px-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURE_CARDS.map((f, idx) => {
              const Icon = f.icon;
              return (
                <ThreeCard3D key={idx} maxTilt={5} spotlightColor="rgba(245, 158, 11, 0.1)">
                  <div className={`p-6 rounded-2xl bg-white dark:bg-[#0b0f19]/80 border ${f.border} h-full flex flex-col justify-between shadow-md`}>
                    <div>
                      <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center ${f.color} mb-4`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white mb-1.5">{f.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{f.desc}</p>
                    </div>
                  </div>
                </ThreeCard3D>
              );
            })}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — TRAVELER STORIES (PREVIOUS PHOTOS RESTORED)
          ════════════════════════════════════════════════════════════════════ */}
      {!generatedItinerary && !isGenerating && (
        <section className="py-12 px-4 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Loved by travelers worldwide
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verified itineraries planned and booked with AI speed.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {USER_STORIES.map((story, idx) => (
              idx === activeStory && (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6 p-6 rounded-3xl bg-white dark:bg-[#0b0f19]/80 border border-slate-200 dark:border-white/10 shadow-lg"
                >
                  <div className="w-full h-40 sm:h-full rounded-2xl overflow-hidden">
                    <img src={story.image} alt={story.trip} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {Array.from({ length: story.rating }, (_, i) => <FaStar key={i} className="w-3.5 h-3.5" />)}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic mb-4 font-sans">
                      "{story.quote}"
                    </p>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm font-mono">{story.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {story.trip} · Saved <span className="text-emerald-500 font-bold">{story.savings}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-5">
            {USER_STORIES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStory(idx)}
                className={`h-1.5 rounded-full transition-all ${idx === activeStory ? 'bg-amber-500 w-8' : 'bg-slate-300 dark:bg-slate-700 w-2'}`}
                aria-label={`Go to story ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 6 — LIVE AI EXECUTION TERMINAL
          ════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence>
          {toolLogs.length > 0 && !generatedItinerary && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-6 rounded-2xl bg-[#090c14] text-emerald-400 font-mono text-xs shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <span className="flex items-center gap-2 text-white/90 font-semibold text-xs">
                  <FiTerminal className="text-amber-400 w-4 h-4" />
                  Groq LPU™ Neural Architect · Real-Time Dual Transit Engine
                </span>
                <span className="text-amber-400 flex items-center gap-1.5 text-[10px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Grounding Plane & Train Routes...
                </span>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-2 text-slate-300">
                {toolLogs.map((log, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2">
                    <span className="text-amber-400 shrink-0">›</span>
                    <span className="leading-relaxed">{log}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 7 — GENERATED ITINERARY RESULTS
            ════════════════════════════════════════════════════════════════════ */}
        <div ref={resultsRef}>
          <AnimatePresence>
            {generatedItinerary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* 1. Verified Package Hero Card */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
                  <img
                    src={generatedItinerary.destinationImage || generatedItinerary.hotel?.image}
                    alt={generatedItinerary.destination}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />

                  <div className="relative z-10 p-8 md:p-12">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                        <FaCheckCircle className="w-3 h-3" /> AI Verified Package
                      </span>
                      {generatedItinerary.vibe && (
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-mono font-medium">
                          {generatedItinerary.vibe}
                        </span>
                      )}
                      {generatedItinerary._meta?.latencyMs && (
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-400 text-[10px] font-mono">
                          Groq LPU™ {generatedItinerary._meta.latencyMs}ms
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
                      <div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                          {generatedItinerary.destination}
                          {generatedItinerary.country && <span className="text-white/60 font-light">, {generatedItinerary.country}</span>}
                        </h2>
                        <p className="text-sm font-mono text-white/70">
                          {generatedItinerary.daysCount} Days / {Math.max(generatedItinerary.daysCount - 1, 1)} Nights · {generatedItinerary.pax} Travelers · Complete Flight, Train & Stay Package
                        </p>

                        {/* Cross-Service Ecosystem Navigation Bar */}
                        <div className="flex flex-wrap items-center gap-2 mt-3.5">
                          <Link
                            to={getHotelsRoute(generatedItinerary.destination)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <FaHotel className="text-amber-400 w-3 h-3" /> Stays in {generatedItinerary.destination}
                          </Link>
                          {hasTrainNetwork(generatedItinerary.destination) && (
                            <Link
                              to={getTrainsRoute(generatedItinerary.destination, generatedItinerary.origin || 'NDLS')}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <FaTrain className="text-emerald-400 w-3 h-3" /> Tatkal Trains
                            </Link>
                          )}
                          <Link
                            to={getFlightsRoute(generatedItinerary.destination, generatedItinerary.origin || 'DEL')}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <FaPlane className="text-sky-400 w-3 h-3" /> Live Flights
                          </Link>
                          <Link
                            to={getExploreRoute(generatedItinerary.destination)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <FaMapMarkerAlt className="text-rose-400 w-3 h-3" /> Interactive Map
                          </Link>
                          <Link
                            to={getDestinationsRoute(generatedItinerary.destination)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <FaRoute className="text-teal-400 w-3 h-3" /> Packages
                          </Link>
                        </div>
                      </div>

                      {/* Package Pricing Hub */}
                      <div className="p-6 rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/15 text-right shrink-0 min-w-[260px] shadow-xl">
                        <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-1">Total Package Price</div>
                        <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 mb-1">
                          {formatINR(generatedItinerary.totalPackageINR)}
                        </div>
                        {generatedItinerary.savingsINR > 0 && (
                          <div className="text-xs font-mono font-semibold text-emerald-400 mb-4">
                            Save {formatINR(generatedItinerary.savingsINR)} vs Booking Separately
                          </div>
                        )}
                        <ThreeUIButton
                          onClick={handleBookEntireItinerary}
                          variant="amber-glow"
                          size="md"
                          icon={FaCheckCircle}
                          className="w-full"
                        >
                          Book Entire Package
                        </ThreeUIButton>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DUAL TRANSIT JOURNEY HUB (Plane vs Train Options) */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b0f19]/90 border border-slate-200 dark:border-white/10 shadow-xl space-y-6">

                  {/* Transit Hub Header & Mode Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                        <FaExchangeAlt className="w-3 h-3" /> Dual Transit Architecture
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        Choose Your Journey: <span className="text-purple-500">Train</span> or <span className="text-sky-500">Plane</span>
                      </h3>
                    </div>

                    {/* Mode Toggle Pills */}
                    <SegmentedPillToggle
                      options={[
                        { id: 'compare', label: '⚡ Compare Both' },
                        { id: 'train', label: 'Train Journey', icon: FaTrain },
                        { id: 'plane', label: 'Flight Journey', icon: FaPlane },
                      ]}
                      value={selectedTransitMode}
                      onChange={setSelectedTransitMode}
                      layoutId="itineraryTransitModeToggle"
                      size="sm"
                    />
                  </div>

                  {/* AI Transit Intelligence Comparison Advice */}
                  {generatedItinerary.transitComparison?.flightVsTrainAdvice && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
                        <FiCompass className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-sans text-slate-800 dark:text-slate-200 leading-relaxed">
                        <strong className="text-amber-500 font-mono font-bold uppercase tracking-wider block mb-0.5">
                          AI Transit Recommendation
                        </strong>
                        {generatedItinerary.transitComparison.flightVsTrainAdvice}
                      </div>
                    </div>
                  )}

                  {/* Transit Cards Grid (Train & Flight) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* TRAIN JOURNEY CARD */}
                    {(selectedTransitMode === 'compare' || selectedTransitMode === 'train') && generatedItinerary.train && (
                      <div className={`p-6 rounded-2xl border transition-all ${
                        selectedTransitMode === 'train'
                          ? 'bg-purple-500/10 border-purple-500 shadow-xl'
                          : 'bg-white dark:bg-white/[0.02] border-purple-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                              <FaTrain className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                                High-Speed Rail & IRCTC
                              </span>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                {generatedItinerary.train.trainName}
                              </h4>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-mono font-bold">
                            {generatedItinerary.train.tatkalStatus || '98% Confirmed'}
                          </span>
                        </div>

                        {/* Train Stations & Timing Route */}
                        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 mb-4 font-mono">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-800 dark:text-slate-200 font-bold">
                              {generatedItinerary.train.departureStation || 'Origin Station'}
                            </span>
                            <span className="text-purple-400 font-semibold">{generatedItinerary.train.duration || '7h 30m'}</span>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">
                              {generatedItinerary.train.arrivalStation || generatedItinerary.destination}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{generatedItinerary.train.departureTime || '06:00 AM'}</span>
                            <span className="text-[10px] text-slate-400">──── {generatedItinerary.train.speed || '160 km/h'} ────▶</span>
                            <span>{generatedItinerary.train.arrivalTime || '01:30 PM'}</span>
                          </div>
                        </div>

                        {/* Coach Class & Features */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-4">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-mono font-semibold">
                            {generatedItinerary.train.coachClass || 'Executive Chair Car'}
                          </span>
                          {generatedItinerary.train.features?.slice(0, 2).map((f, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 text-[10px] font-mono">
                              {f}
                            </span>
                          ))}
                        </div>

                        {/* Train Price & Selection */}
                        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Fare per traveler</span>
                            <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                              {formatINR(generatedItinerary.train.priceINR)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThreeUIButton
                              type="button"
                              onClick={() => { setSelectedTransitMode('train'); addToast('Selected Train Journey for package!', 'info'); }}
                              variant={selectedTransitMode === 'train' ? 'liquid-metal' : 'specular-dark'}
                              size="sm"
                            >
                              {selectedTransitMode === 'train' ? '✓ Selected' : 'Choose Train'}
                            </ThreeUIButton>
                            <ThreeUIButton
                              to={getTrainsRoute(generatedItinerary.destination, generatedItinerary.origin || 'NDLS', generatedItinerary.train?.trainNumber)}
                              variant="amber-glow"
                              size="sm"
                              icon={<FaTrain className="w-3 h-3" />}
                              title="Book on Tatkal IRCTC Live Engine"
                            >
                              Book Live
                            </ThreeUIButton>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FLIGHT JOURNEY CARD */}
                    {(selectedTransitMode === 'compare' || selectedTransitMode === 'plane') && generatedItinerary.flight && (
                      <div className={`p-6 rounded-2xl border transition-all ${
                        selectedTransitMode === 'plane'
                          ? 'bg-sky-500/10 border-sky-500 shadow-xl'
                          : 'bg-white dark:bg-white/[0.02] border-sky-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                              <FaPlane className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                                Airfare Radar · Non-Stop
                              </span>
                              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                {generatedItinerary.flight.airline} {generatedItinerary.flight.flightNumber && `(${generatedItinerary.flight.flightNumber})`}
                              </h4>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-500 text-[10px] font-mono font-bold">
                            Lowest Airfare
                          </span>
                        </div>

                        {/* Flight Airports & Timing Route */}
                        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 mb-4 font-mono">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-800 dark:text-slate-200 font-bold">
                              {generatedItinerary.flight.from || 'Origin'}
                            </span>
                            <span className="text-sky-400 font-semibold">{generatedItinerary.flight.duration || '2h 15m'}</span>
                            <span className="text-slate-800 dark:text-slate-200 font-bold">
                              {generatedItinerary.flight.to || generatedItinerary.destination}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span>Direct Departure</span>
                            <span className="text-[10px] text-slate-400">──── Jet Speed ────▶</span>
                            <span>Direct Arrival</span>
                          </div>
                        </div>

                        {/* Cabin Class */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-4">
                          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-mono font-semibold">
                            {generatedItinerary.flight.cabinClass || 'Economy Classic'}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 text-[10px] font-mono">
                            Cabin Baggage Included
                          </span>
                        </div>

                        {/* Flight Price & Selection */}
                        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Fare per traveler</span>
                            <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                              {formatINR(generatedItinerary.flight.priceINR)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThreeUIButton
                              type="button"
                              onClick={() => { setSelectedTransitMode('plane'); addToast('Selected Flight Journey for package!', 'info'); }}
                              variant={selectedTransitMode === 'plane' ? 'liquid-metal' : 'specular-dark'}
                              size="sm"
                            >
                              {selectedTransitMode === 'plane' ? '✓ Selected' : 'Choose Flight'}
                            </ThreeUIButton>
                            <ThreeUIButton
                              to={getFlightsRoute(generatedItinerary.destination, generatedItinerary.origin || 'DEL')}
                              variant="amber-glow"
                              size="sm"
                              icon={<FaPlane className="w-3 h-3" />}
                              title="Live Flight Radar Search"
                            >
                              Book Flight
                            </ThreeUIButton>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Verified Stay & Weather Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Hotel Card (2 cols) */}
                  {generatedItinerary.hotel && (
                    <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#0b0f19]/90 border border-slate-200 dark:border-white/10 shadow-lg flex flex-col sm:flex-row gap-5">
                      <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden shrink-0 shadow-md">
                        <img
                          src={generatedItinerary.hotel.image || generatedItinerary.destinationImage}
                          alt={generatedItinerary.hotel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-amber-500 text-xs font-mono font-semibold uppercase mb-1">
                            <FaHotel className="w-3.5 h-3.5" /> Stay Included · <FaStar className="w-2.5 h-2.5" /> {generatedItinerary.hotel.starRating}★
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            {generatedItinerary.hotel.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {generatedItinerary.hotel.address}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {generatedItinerary.hotel.amenities?.slice(0, 3).map((a, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.03] text-[10px] font-mono text-slate-600 dark:text-slate-400">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {formatINR(generatedItinerary.hotel.pricePerNightINR)} <span className="text-xs font-normal text-slate-400">/ night</span>
                          </div>
                          <ThreeUIButton
                            to={getHotelsRoute(generatedItinerary.destination)}
                            variant="amber-glow"
                            size="sm"
                            icon={<FaHotel className="w-3 h-3" />}
                          >
                            Explore Verified Stays
                          </ThreeUIButton>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weather & Quick Actions Card (1 col) */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0b0f19]/90 border border-slate-200 dark:border-white/10 shadow-lg flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-amber-500 text-xs font-mono font-bold uppercase mb-2">
                        <FaCloudSun className="w-4 h-4" /> Destination Climate
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        {generatedItinerary.weatherForecast || 'Prime travel season with clear skies and comfortable temperatures.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">Actions:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToast('Itinerary link copied to clipboard!', 'info')}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Share Itinerary"
                        >
                          <FaShareAlt className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Print Itinerary"
                        >
                          <FaPrint className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setGeneratedItinerary(null); setToolLogs([]); setPrompt(''); }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-500 font-mono text-xs font-bold hover:bg-amber-500/25 transition-colors"
                          title="Create New Trip"
                        >
                          New Trip
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Day-by-Day Detailed Timeline with Activity Prices in ₹ */}
                {generatedItinerary.days?.length > 0 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b0f19]/90 border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <FaRoute className="text-amber-500 w-5 h-5" /> Verified Day-by-Day Itinerary
                        </h3>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          {generatedItinerary.days.reduce((a, d) => a + (d.items?.length || 0), 0)} scheduled experiences across {generatedItinerary.days.length} days
                        </p>
                      </div>

                      {/* Day Filter Tabs */}
                      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setActiveDayTab('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                            activeDayTab === 'all'
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          All Days
                        </button>
                        {generatedItinerary.days.map((d) => (
                          <button
                            key={d.dayNumber}
                            type="button"
                            onClick={() => setActiveDayTab(d.dayNumber)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                              activeDayTab === d.dayNumber
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Day {d.dayNumber}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timeline Days List */}
                    <div className="space-y-4">
                      {generatedItinerary.days
                        .filter(d => activeDayTab === 'all' || activeDayTab === d.dayNumber)
                        .map(day => (
                          <motion.div
                            key={day.dayNumber}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/[0.05] space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-bold flex items-center justify-center text-xs">
                                  {String(day.dayNumber).padStart(2, '0')}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">{day.title}</h4>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{day.items?.length || 0} activities</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {day.items?.map((item, iIdx) => (
                                <div
                                  key={iIdx}
                                  className="p-3.5 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] hover:border-amber-400/40 transition-colors"
                                >
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 mb-1">
                                    <FaClock className="w-2.5 h-2.5" /> {item.time}
                                    <span className="text-slate-300 dark:text-slate-600">·</span>
                                    <span className="uppercase text-slate-400 dark:text-slate-500">{item.type}</span>
                                  </div>
                                  <div className="text-[13px] font-bold text-slate-900 dark:text-white mb-1">{item.title}</div>
                                  {item.description && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-1.5 font-sans">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                                    {item.location && (
                                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                        <FaMapMarkerAlt className="w-2 h-2 text-amber-500" /> {item.location}
                                      </span>
                                    )}
                                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 ml-auto">
                                      {item.priceINR ? formatINR(item.priceINR) : 'Included'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                    </div>

                    {/* Bottom Booking CTA Bar */}
                    <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          Included Transit: <strong className="text-slate-900 dark:text-white font-bold">{selectedTransitMode === 'train' ? 'High-Speed Train (Vande Bharat)' : 'Scheduled Flight'}</strong>
                        </div>
                        <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                          Total Package: <span className="text-amber-500 text-lg">{formatINR(generatedItinerary.totalPackageINR)}</span>
                        </div>
                      </div>

                      <ThreeUIButton
                        onClick={handleBookEntireItinerary}
                        variant="amber-glow"
                        size="lg"
                        icon={FaCheckCircle}
                      >
                        Book Complete Trip Now
                      </ThreeUIButton>
                    </div>
                  </div>
                )}

                {/* 5. Insider Tips & Rail Connectivity Advice */}
                {(generatedItinerary.insiderTips?.length > 0 || generatedItinerary.transportTips?.length > 0) && (
                  <div className="p-6 rounded-3xl bg-amber-500/[0.06] border border-amber-500/20 space-y-3">
                    <h4 className="text-sm font-bold font-mono text-amber-500 flex items-center gap-2 uppercase tracking-wider">
                      <FaLightbulb className="w-4 h-4" /> Travel Architect Insider Tips
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[...(generatedItinerary.transportTips || []), ...(generatedItinerary.insiderTips || [])].slice(0, 6).map((tip, i) => (
                        <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <FaChevronRight className="w-2.5 h-2.5 text-amber-500 mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;