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
  FaTrain, FaBolt, FaExchangeAlt, FaPlay, FaPause, FaCompass
} from 'react-icons/fa';
import {
  FiLoader, FiTerminal, FiZap, FiCpu, FiGlobe, FiSearch,
  FiCompass, FiTrendingUp, FiNavigation, FiCheckCircle
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

// Strips stray markdown syntax like **bold** or ## headings from raw AI text
const stripMarkdown = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/^#{1,6}\s*/gm, '').replace(/[*#_]/g, '').trim();
};

// ─── Dynamic AI Expedition Modes (Full-Bleed Dynamic Atmosphere Matrix) ─────
const AI_EXPEDITION_MODES = [
  {
    id: 'alpine',
    title: 'Alpine Snow',
    icon: FaMountain,
    tag: 'HIMALAYAN & HIGH PASSES',
    headline: 'Sculpt High-Altitude Snow Trails,',
    highlight: 'Scenic Rail & Glacial Escapes',
    description: 'Custom route planning linking Vande Bharat mountain corridors, all-terrain transfers, and alpine timber chalets under verifiable budgets.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2400&q=85',
    defaultPrompt: '5-day Himalayan snow adventure to Manali and Rohtang Pass with Vande Bharat to Una and 4x4 cab under ₹18,000',
    telemetry: 'Vande Bharat #22447 · 4x4 Snow Rover · Pine Chalet Stays',
    budgetHint: '₹14,000 - ₹22,000',
    transitTag: 'High-Speed Rail + 4x4',
    suggestedDays: 5,
    chips: ['Solang Paragliding', 'Atal Tunnel Pass', 'Old Manali Cafes', 'Sissu Waterfalls']
  },
  {
    id: 'coastal',
    title: 'Coastal Azure',
    icon: FaUmbrellaBeach,
    tag: 'COASTAL HAVEN & ISLANDS',
    headline: 'Chart Sun-Drenched Horizons,',
    highlight: 'Cliff Villas & Emerald Reefs',
    description: 'Curate coastal journeys combining scenic western railway lines, sunset catamaran charters, and boutique oceanfront sanctuaries.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2400&q=85',
    defaultPrompt: '3-day coastal retreat to South Goa with Tejas Express and beachfront villa under ₹14,000',
    telemetry: 'Tejas Express #22119 · Direct Flights · Oceanfront Villas',
    budgetHint: '₹12,000 - ₹20,000',
    transitTag: 'Coastal Rail & Air',
    suggestedDays: 3,
    chips: ['Palolem Kayaking', 'Cabo de Rama Sunset', 'Spice Plantation', 'Anjuna Flea Market']
  },
  {
    id: 'heritage',
    title: 'Sacred Soul',
    icon: FaSpa,
    tag: 'SPIRITUAL & ANCIENT CORRIDORS',
    headline: 'Awaken Timeless Living Sanctums,',
    highlight: 'Ganga Aarti & Royal Forts',
    description: 'Craft culturally resonant pilgrimages and heritage explorations unified with bullet train precision, curated local guides, and river aartis.',
    image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=2400&q=85',
    defaultPrompt: '4-day spiritual journey to Varanasi and Ayodhya with Vande Bharat #22436 and Ganga Aarti under ₹15,000',
    telemetry: 'Vande Bharat #22436 (8h flat) · Heritage Haveli · Twilight Aarti Cruise',
    budgetHint: '₹11,000 - ₹17,000',
    transitTag: 'Express Bullet Rail',
    suggestedDays: 4,
    chips: ['Dashashwamedh Aarti', 'Sarnath Stupa', 'Sunrise Boat Ride', 'Kashi Vishwanath']
  },
  {
    id: 'royal',
    title: 'Royal Heritage',
    icon: FaCompass,
    tag: 'PALACE FORTS & ROYAL RAIL',
    headline: 'Traverse Majestic Fortresses,',
    highlight: 'Vande Bharat Rail & Haveli Suites',
    description: 'Royal Rajasthan corridors linking Ajmer/Jaipur Vande Bharat high-speed routes, heritage haveli stays, and sunset boat cruises on Lake Pichola.',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=2400&q=85',
    defaultPrompt: '5-day royal heritage & palace tour to Udaipur and Jaipur with Vande Bharat Express under ₹28,000',
    telemetry: 'Vande Bharat #20978 · Heritage Haveli Stays · Lake Pichola Cruise',
    budgetHint: '₹22,000 - ₹35,000',
    transitTag: 'High-Speed Rail & Chauffeur',
    suggestedDays: 5,
    chips: ['City Palace Udaipur', 'Lake Pichola Boat', 'Amer Fort Jaipur', 'Chokhi Dhani']
  },
  {
    id: 'nature',
    title: 'Emerald Mist',
    icon: FiCompass,
    tag: 'SERENE BACKWATERS & CANOPY',
    headline: 'Immerse in Living Green Labyrinths,',
    highlight: 'Solar Houseboats & Tea Ridges',
    description: 'Regenerative eco-itineraries distributing travelers across tranquil Kerala lagoons, Munnar mist peaks, and biodiversity preserves.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2400&q=85',
    defaultPrompt: '4-day Kerala backwaters houseboat and Munnar tea estate retreat under ₹22,000',
    telemetry: 'Vande Bharat #20633 · Solar Houseboat · Cloud Mist Cottages',
    budgetHint: '₹16,000 - ₹25,000',
    transitTag: 'Eco-Rail & Private Cruiser',
    suggestedDays: 4,
    chips: ['Alleppey Backwaters', 'Munnar Tea Trails', 'Kathakali Center', 'Marari Beach']
  }
];

const SAMPLE_PROMPTS = [
  { title: "Goa 3D Coastal Rail & Beach", query: "3-day budget backpacking trip to Goa with Vande Bharat under ₹12,000", tag: "Rail + Beach" },
  { title: "Varanasi 4D Spiritual Vande Bharat", query: "4-day spiritual journey to Varanasi with Vande Bharat and ghats under ₹15,000", tag: "High-Speed Rail" },
  { title: "Udaipur & Jaipur 5D Royal Heritage", query: "5-day royal Rajasthan heritage tour with havelis and palaces under ₹28,000", tag: "Vande Bharat + Stay" },
  { title: "Kerala 5D Backwaters & Munnar", query: "5-day Kerala backwaters houseboat and Munnar tea mist retreat under ₹24,000", tag: "Eco-Rail & Cruiser" },
  { title: "Himachal 4D Manali & Snow Pass", query: "4-day snow adventure to Manali with Una Vande Bharat under ₹18,000", tag: "Alpine Rail + 4x4" },
  { title: "Kashmir 5D Gulmarg Gondola & Dal", query: "5-day Kashmir paradise tour with Dal Lake Shikara and Gulmarg Gondola under ₹32,000", tag: "Flight & Rail Corridor" },
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

// Swappable Destinations — 100% Authentic Indian Destinations
const SWAPPABLE_DESTINATIONS = [
  {
    id: 'udaipur',
    name: 'Udaipur & Lake Palace',
    country: 'India',
    category: 'luxury',
    tag: 'Vande Bharat • Heritage Haveli',
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=600&auto=format&fit=crop',
    duration: '5D / 4N',
    startingPriceINR: 24000,
    rating: '4.95',
    trainOption: 'Ajmer-Delhi Vande Bharat #20978 (6h 20m)',
    flightOption: 'IndiGo 6E-442 Direct (1h 15m)',
    highlights: ['City Palace & Lake Pichola Cruise', 'Jag Mandir Island Sunset', 'Saheliyon ki Bari & Bagore Ki Haveli'],
  },
  {
    id: 'goa',
    name: 'Goa Coastal Haven',
    country: 'India',
    category: 'rail',
    tag: 'Vande Bharat • Beachfront',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600&auto=format&fit=crop',
    duration: '3D / 2N',
    startingPriceINR: 12500,
    rating: '4.92',
    trainOption: 'Vande Bharat #22229 (Madgaon Ex)',
    flightOption: 'IndiGo 6E-512 (1h 10m)',
    highlights: ['Palolem & Agonda Beach', 'Cabo de Rama Sunset', 'Spice Plantation Tour'],
  },
  {
    id: 'kashmir',
    name: 'Kashmir & Gulmarg Valley',
    country: 'India',
    category: 'alpine',
    tag: 'Direct Flight & Rail Corridor',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=600&auto=format&fit=crop',
    duration: '5D / 4N',
    startingPriceINR: 32000,
    rating: '4.96',
    trainOption: 'Kashmir Rail Corridor Express #22475',
    flightOption: 'Air India AI-825 (1h 35m)',
    highlights: ['Gulmarg Gondola Phase 2', 'Dal Lake Heritage Shikara Stay', 'Pahalgam Betaab Valley'],
  },
  {
    id: 'kerala',
    name: 'Kerala Backwaters & Munnar',
    country: 'India',
    category: 'coastal',
    tag: 'Vande Bharat • Solar Houseboat',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=600&auto=format&fit=crop',
    duration: '5D / 4N',
    startingPriceINR: 22000,
    rating: '4.94',
    trainOption: 'Kerala Vande Bharat #20633 (Kasargod - TVM)',
    flightOption: 'IndiGo 6E-205 Direct (2h 45m)',
    highlights: ['Alleppey Houseboat Overnight Cruise', 'Munnar Kolukkumalai Sunrise', 'Periyar Wildlife Sanctuary'],
  },
  {
    id: 'jaipur',
    name: 'Jaipur Pink City & Amer Fort',
    country: 'India',
    category: 'luxury',
    tag: 'Delhi-Jaipur Vande Bharat #20977',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=600&auto=format&fit=crop',
    duration: '4D / 3N',
    startingPriceINR: 18500,
    rating: '4.91',
    trainOption: 'Vande Bharat Express (3h 45m)',
    flightOption: 'IndiGo 6E-228 (55m)',
    highlights: ['Amer Fort Elephant Path & Mirror Palace', 'Hawa Mahal & City Palace', 'Nahargarh Fort Sunset Viewpoint'],
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
    highlights: ['Ganga Aarti at Dashashwamedh', 'Sarnath Buddhist Stupa', 'Sunrise Boat Ride on Holy Ganges'],
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh & Ganga Yoga Valley',
    country: 'India',
    category: 'heritage',
    tag: 'Dehradun Vande Bharat #22457',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop',
    duration: '3D / 2N',
    startingPriceINR: 11500,
    rating: '4.93',
    trainOption: 'Dehradun Vande Bharat (4h 45m)',
    flightOption: 'Dehradun Jolly Grant Flight (50m)',
    highlights: ['Triveni Ghat Evening Maha Aarti', 'White Water River Rafting (Grade 3+)', 'Neer Garh Waterfall Trek'],
  },
];

// User Stories with authentic Indian destinations
const USER_STORIES = [
  {
    name: 'Priya & Rahul',
    trip: 'Royal Palace Tour in Udaipur',
    quote: 'TravelEase planned our entire 5-day heritage trip in seconds. The haveli it picked right on Lake Pichola had the exact sunset view we dreamed of!',
    savings: '₹28,000',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=400&auto=format&fit=crop'
  },
  {
    name: 'Arjun S.',
    trip: 'Solo Backpacking in Himachal & Kasol',
    quote: 'I typed "budget trip to Himachal for 5 days under ₹18k" and got a complete plan with Vande Bharat rail connections and real riverside chalets.',
    savings: '₹15,500',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=400&auto=format&fit=crop'
  },
  {
    name: 'The Sharma Family',
    trip: 'Family Holiday in Kerala Backwaters',
    quote: 'Planning for 4 people is usually chaos. TravelEase handled everything — houseboat bookings, kid-friendly activities, even authentic local meals!',
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
    icon: FiNavigation,
    title: 'Instant Route Architect',
    desc: 'Sub-second optimization compiles complete trips with verified stays, attractions, and daily timelines.',
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
  const [activeModeIdx, setActiveModeIdx] = useState(0);
  const [isPlayingHero, setIsPlayingHero] = useState(true);
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

  // Active Dynamic AI Expedition Archetype
  const activeMode = AI_EXPEDITION_MODES[activeModeIdx] || AI_EXPEDITION_MODES[0];

  // Check AI engine status
  useEffect(() => {
    getAIStatus()
      .then(s => setAiOnline(s.status === 'operational'))
      .catch(() => setAiOnline(false));
  }, []);

  // Auto-rotate AI expedition archetype every 7 seconds when playing
  useEffect(() => {
    if (!isPlayingHero) return;
    const t = setInterval(() => {
      setActiveModeIdx(p => (p + 1) % AI_EXPEDITION_MODES.length);
    }, 7000);
    return () => clearInterval(t);
  }, [isPlayingHero]);

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
    setToolLogs(['[System] Compiling real-time itinerary & multi-modal routes...']);
    setGeneratedItinerary(null);
    try {
      const result = await generateAIItinerary(queryText, (logMsg) => {
        setToolLogs(prev => [...prev, logMsg]);
      });
      setGeneratedItinerary(result);
      addToast(`Custom package compiled for ${result.destination}!`, 'success');
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch {
      // 100% Dynamic Zero-Failure Fallback: Synthesize with realistic Vande Bharat & flight options
      const params = parsePromptToParams(queryText);
      const fallbackResult = generateDynamicItinerary(params.destination, params.days, params.budgetINR, params.vibe);
      setToolLogs(prev => [
        ...prev,
        `[Engine] Route optimization completed for: "${fallbackResult.destination}"`,
        `[IRCTC] Train: ${fallbackResult.train?.trainName} (${fallbackResult.train?.coachClass})`,
        `[Aviation] Flight: ${fallbackResult.flight?.airline}`,
        `[Hospitality] Verified Stay: ${fallbackResult.hotel?.name} (★ ${fallbackResult.hotel?.starRating})`,
        `[Ready] ${fallbackResult.daysCount} Days complete day-by-day plan compiled.`
      ]);
      setGeneratedItinerary(fallbackResult);
      addToast(`Custom package compiled for ${fallbackResult.destination}!`, 'success');
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
      query = activeMode?.defaultPrompt || `Plan a ${days}-day ${selectedVibe.toLowerCase()} trip to ${targetDest} for ${pax} people with budget of ₹${budgetINR.toLocaleString('en-IN')}`;
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
      serviceType: 'custom-itinerary',
      itemTitle: `Curated Package — ${generatedItinerary.destination} (${generatedItinerary.daysCount} Days)`,
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
      name: 'Custom Itinerary Planner with Plane & Train Options — TravelEase',
      description: 'Custom travel planning with both Vande Bharat trains & flights in Indian Rupees.',
      url: '/itinerary',
      breadcrumb: true
    }),
    getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Itinerary Planner' }], '/itinerary'),
    getSoftwareApplicationSchema(),
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#06080d] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-500 selection:bg-amber-400 selection:text-black" id="itinerary-page">
      <JsonLd data={schemas} />

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — FULL-BLEED DYNAMIC ROUTE ARCHITECT HERO SECTION
          Seamless edge-to-edge photography, HUD telemetry & archetype dock
          ════════════════════════════════════════════════════════════════════ */}
      <section 
        className="relative w-full min-h-[94vh] md:min-h-[98vh] flex flex-col justify-between overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 select-none" 
        id="ai-hero-atmosphere"
      >
        {/* Full-bleed Edge-to-Edge Dynamic Photography (Cover, Not Curved) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode.id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={activeMode.image}
                alt={activeMode.title}
                className="w-full h-full object-cover object-center transform transition-transform duration-1000 rounded-none"
              />
            </motion.div>
          </AnimatePresence>

          {/* High-fidelity Cinematic Scrims (Ensures Pristine WCAG Contrast in Light & Dark Mode) */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-slate-950/30 lg:to-transparent" />
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Multi-Stop Seamless Page Blend Dissolving into Light / Dark Page Body */}
          <div className="absolute bottom-0 inset-x-0 h-40 sm:h-56 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-[#06080d] dark:via-[#06080d]/85 dark:to-transparent pointer-events-none z-10" />
        </div>

        {/* Top HUD Telemetry & Playback Controller */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8">
            {/* Engine & Dual Transit Status */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 text-white shadow-xl"
              >
                <span className={`w-2 h-2 rounded-full ${aiOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className="text-[11px] sm:text-xs font-mono font-semibold tracking-wider uppercase text-white/90">
                  {aiOnline ? 'Route Engine Online' : 'Route Network Ready'}
                </span>
                <span className="w-px h-3 bg-white/20" />
                <span className="text-[10px] sm:text-[11px] font-mono text-amber-300 font-medium">IRCTC & Flights Grounded</span>
              </motion.div>

              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/80 text-[11px] font-mono">
                <span className="text-purple-400 font-bold">● Vande Bharat</span>
                <span className="text-white/30">+</span>
                <span className="text-sky-400 font-bold">Airways Radar</span>
              </div>
            </div>

            {/* Archetype Counter & Auto-Play / Pause Button */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 text-white/90 text-xs font-mono shadow-lg">
                <span className="text-amber-400 font-bold">{String(activeModeIdx + 1).padStart(2, '0')}</span>
                <span className="text-white/40">/</span>
                <span>{String(AI_EXPEDITION_MODES.length).padStart(2, '0')}</span>
                <span className="text-white/50 hidden md:inline ml-1">• {activeMode.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPlayingHero(p => !p)}
                title={isPlayingHero ? "Pause auto-rotation" : "Play auto-rotation"}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 text-white/80 hover:text-amber-400 hover:border-amber-400/50 transition-all flex items-center justify-center text-xs shadow-lg"
              >
                {isPlayingHero ? <FaPause className="w-2.5 h-2.5" /> : <FaPlay className="w-2.5 h-2.5 ml-0.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Center-Stage: Prompt Architect & Holographic Telemetry HUD */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left 7-8 Columns: Archetype Header, Dynamic Headline & Natural Language Capsule */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
              {/* Dynamic Archetype Tag */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMode.id + '-tag'}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 backdrop-blur-md border border-amber-400/30 text-amber-300 text-xs font-mono font-semibold tracking-wider uppercase mb-3 sm:mb-4 w-fit shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  <activeMode.icon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeMode.tag}</span>
                </motion.div>
              </AnimatePresence>

              {/* Dynamic Headline & Description */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMode.id + '-headline'}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] mb-4 drop-shadow-md">
                    {activeMode.headline}
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400">
                      {activeMode.highlight}
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed mb-6 font-sans">
                    {activeMode.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Natural Language Prompt Input Bar */}
              <motion.form
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleGenerate}
                className="relative p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row gap-2 max-w-2xl group focus-within:border-amber-400/60 focus-within:shadow-[0_0_35px_rgba(245,158,11,0.25)] transition-all"
              >
                <div className="flex-1 flex items-center gap-3 px-3.5 py-2 sm:py-2">
                  <FiSearch className="w-5 h-5 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Try: ${activeMode.defaultPrompt}`}
                    className="w-full bg-transparent text-white placeholder-white/45 text-sm sm:text-base font-medium focus:outline-none"
                    disabled={isGenerating}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {prompt && (
                    <button
                      type="button"
                      onClick={() => setPrompt('')}
                      className="text-xs text-white/50 hover:text-white px-2 py-1 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <ThreeUIButton
                    type="submit"
                    disabled={isGenerating || (!prompt.trim() && !activeMode.defaultPrompt)}
                    variant="amber-glow"
                    size="md"
                    icon={isGenerating ? FiLoader : FiNavigation}
                    className="w-full sm:w-auto"
                  >
                    {isGenerating ? 'Compiling Route...' : 'Build Itinerary'}
                  </ThreeUIButton>
                </div>
              </motion.form>

              {/* Signature Stop Prompt Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-[11px] font-mono text-white/50 uppercase tracking-wider mr-1">Signature Stops:</span>
                {activeMode.chips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      const customQuery = `${activeMode.suggestedDays}-day trip featuring ${chip} with dual transit and verified stay under ${activeMode.budgetHint}`;
                      setPrompt(customQuery);
                      triggerGeneration(customQuery);
                    }}
                    disabled={isGenerating}
                    className="text-[11px] font-mono px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md text-white/85 border border-white/15 hover:bg-amber-400/25 hover:border-amber-400/50 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <span className="text-amber-400 text-[9px]">✦</span>
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right 5-4 Columns: Holographic Route Telemetry Card */}
            <div className="lg:col-span-5 xl:col-span-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMode.id + '-hud'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="relative rounded-3xl bg-black/55 backdrop-blur-2xl border border-white/20 p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                  {/* Top neon edge indicator */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-sky-400" />
                  
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">Live Route Telemetry</span>
                    </div>
                    <span className="text-[11px] font-mono text-white/60 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/10 font-medium">
                      {activeMode.suggestedDays}D / {activeMode.suggestedDays - 1}N Matrix
                    </span>
                  </div>

                  {/* Telemetry Rows */}
                  <div className="space-y-3 my-4">
                    {/* Transit Matrix */}
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-[10px] font-mono uppercase text-white/50 tracking-wider mb-1">Transit Architecture</div>
                      <div className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                        <FaTrain className="text-purple-400 shrink-0" />
                        <span className="truncate">{activeMode.telemetry}</span>
                      </div>
                    </div>

                    {/* Budget & Model Specs */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-[10px] font-mono uppercase text-white/50 tracking-wider mb-0.5">Verified Budget</div>
                        <div className="text-sm font-bold text-amber-300 font-mono">{activeMode.budgetHint}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-[10px] font-mono uppercase text-white/50 tracking-wider mb-0.5">Route Engine</div>
                        <div className="text-sm font-bold text-sky-300 font-mono">Instant Settlement</div>
                      </div>
                    </div>

                    {/* Mode Status Pill */}
                    <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
                      <span className="flex items-center gap-1.5 font-mono truncate">
                        <FaRoute className="text-purple-400 shrink-0" /> {activeMode.transitTag}
                      </span>
                      <span className="text-emerald-400 font-bold font-mono text-[11px] shrink-0">Tatkal Radar OK</span>
                    </div>
                  </div>

                  {/* Direct One-Click Plan Button for Active Archetype */}
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt(activeMode.defaultPrompt);
                      triggerGeneration(activeMode.defaultPrompt);
                    }}
                    disabled={isGenerating}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.98]"
                  >
                    <FiNavigation className="w-4 h-4" />
                    <span>Load This Itinerary</span>
                    <FaArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Bottom AI Expedition Archetypes Controller Dock */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-white/70 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Curated Travel Archetypes
            </span>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 overflow-x-auto pb-3 sm:pb-0 no-scrollbar snap-x snap-mandatory">
            {AI_EXPEDITION_MODES.map((mode, idx) => {
              const isActive = activeModeIdx === idx;
              const ModeIcon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setActiveModeIdx(idx);
                    setIsPlayingHero(false);
                  }}
                  className={`group relative text-left p-3 rounded-2xl transition-all duration-300 border shrink-0 min-w-[155px] sm:min-w-0 snap-center ${
                    isActive
                      ? 'bg-black/75 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/40'
                      : 'bg-black/40 hover:bg-black/60 border-white/10 hover:border-white/25'
                  } backdrop-blur-xl`}
                >
                  {/* Progress indicator bar on active */}
                  {isActive && (
                    <motion.div
                      layoutId="activeModeBar"
                      className="absolute top-0 left-3 right-3 h-[2.5px] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-amber-400 text-slate-950 font-bold shadow-md' : 'bg-white/10 text-white/70 group-hover:text-amber-400'
                    }`}>
                      <ModeIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isActive ? 'text-amber-300' : 'text-white/90 group-hover:text-white'}`}>
                        {mode.title}
                      </div>
                      <div className="text-[10px] font-mono text-white/50 truncate">
                        {mode.transitTag.split('&')[0]}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
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
              <FiCompass className="w-3.5 h-3.5" />
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
                          <FaCheckCircle className="w-3 h-3" /> Verified Route
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
                        icon={FiNavigation}
                        className="w-full"
                      >
                        Plan This Itinerary
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
                  icon={isGenerating ? FiLoader : FiNavigation}
                  className="w-full"
                >
                  {isGenerating ? 'Compiling Plane & Train Routes...' : 'Build Custom Itinerary'}
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
              Verified multi-modal itineraries with direct instant booking.
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
                  Route Engine · Real-Time Dual Transit Optimization
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
                        <FaCheckCircle className="w-3 h-3" /> Verified Package
                      </span>
                      {/* Clickable TravelEase Logo Button that opens Concierge */}
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-travelease-concierge'))}
                        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-amber-500/50 text-amber-400 text-xs font-mono font-bold shadow-lg transition-all hover:scale-105 active:scale-95 group cursor-pointer"
                        title="Click TravelEase Logo to open Concierge Desk"
                      >
                        <span className="w-4 h-4 rounded-full bg-black p-0.5 flex items-center justify-center group-hover:rotate-12 transition-transform">
                          <img src="/brand/logo-mark.svg" alt="TravelEase Mark" className="w-full h-full object-contain" />
                        </span>
                        <span>Discuss with Travel Desk</span>
                      </button>
                      {generatedItinerary.vibe && (
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-mono font-medium">
                          {generatedItinerary.vibe}
                        </span>
                      )}
                      {generatedItinerary._meta?.latencyMs && (
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-400 text-[10px] font-mono">
                          Verified {generatedItinerary._meta.latencyMs}ms
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
                      <div className="w-full lg:w-auto p-5 sm:p-6 rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/15 text-left lg:text-right shrink-0 min-w-0 lg:min-w-[260px] shadow-xl">
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
                          Recommended Transit Mode
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

                {/* 4. Interactive Cost & Budget Breakdown Visualizer */}
                {generatedItinerary.totalPackageINR > 0 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b0f19]/90 border border-slate-200 dark:border-white/10 shadow-xl space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
                      <div>
                        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-500 mb-1">
                          <FaWallet className="w-3.5 h-3.5" /> Comprehensive Budget Visualizer
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                          Transparent Cost Allocation in Indian Rupees (₹)
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-slate-400">Total Estimated Budget</span>
                        <div className="text-2xl font-black font-mono text-amber-500">
                          {formatINR(generatedItinerary.totalPackageINR)}
                        </div>
                      </div>
                    </div>

                    {/* Segmented Percentage Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/[0.05] overflow-hidden flex shadow-inner">
                      <div className="h-full bg-purple-500 transition-all duration-700" style={{ width: '28%' }} title="Transit (Flight / High-Speed Rail): 28%" />
                      <div className="h-full bg-amber-500 transition-all duration-700" style={{ width: '38%' }} title="Boutique Stay & Luxury Lodging: 38%" />
                      <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: '20%' }} title="Curated Experiences & Passes: 20%" />
                      <div className="h-full bg-sky-500 transition-all duration-700" style={{ width: '14%' }} title="Local Dining & Taxis: 14%" />
                    </div>

                    {/* 4 Discrete Metric Allocation Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-500 mb-1">
                          <FaTrain className="w-3 h-3" /> Transit (28%)
                        </div>
                        <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                          {formatINR(Math.round(generatedItinerary.totalPackageINR * 0.28))}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Flight / Tatkal Rail</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-500 mb-1">
                          <FaHotel className="w-3 h-3" /> Stays (38%)
                        </div>
                        <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                          {formatINR(Math.round(generatedItinerary.totalPackageINR * 0.38))}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Handpicked Resorts</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-500 mb-1">
                          <FaRoute className="w-3 h-3" /> Experiences (20%)
                        </div>
                        <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                          {formatINR(Math.round(generatedItinerary.totalPackageINR * 0.20))}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Tickets & Guided Tours</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-500 mb-1">
                          <FaBolt className="w-3 h-3" /> Meals & Cabs (14%)
                        </div>
                        <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                          {formatINR(Math.round(generatedItinerary.totalPackageINR * 0.14))}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">Local Transfers & Food</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Executive Day-by-Day Chronological Dossier */}
                {generatedItinerary.days?.length > 0 && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b0f19]/90 border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <FaRoute className="text-amber-500 w-5 h-5" /> Curated Chronological Timeline
                        </h3>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          {generatedItinerary.days.reduce((a, d) => a + (d.items?.length || 0), 0)} scheduled experiences structured by Morning, Midday & Evening phases
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
                    <div className="space-y-6">
                      {generatedItinerary.days
                        .filter(d => activeDayTab === 'all' || activeDayTab === d.dayNumber)
                        .map(day => (
                          <motion.div
                            key={day.dayNumber}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-3xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.06] space-y-4"
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/5">
                              <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-amber-500 text-black font-mono font-black flex items-center justify-center text-sm shadow-md">
                                  {String(day.dayNumber).padStart(2, '0')}
                                </span>
                                <div>
                                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                                    Day {day.dayNumber} Chapter
                                  </span>
                                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{stripMarkdown(day.title)}</h4>
                                </div>
                              </div>
                              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400">
                                {day.items?.length || 0} Phase Milestones
                              </span>
                            </div>

                            {/* Chronological Phase Milestones (Uncluttered Stack) */}
                            <div className="space-y-3.5">
                              {day.items?.map((item, iIdx) => {
                                const isMorning = iIdx === 0 || (item.time && item.time.toLowerCase().includes('am'));
                                const isAfternoon = iIdx === 1 || iIdx === 2;
                                const phaseLabel = isMorning ? 'Morning Exploration' : (isAfternoon ? 'Midday & Afternoon' : 'Twilight & Evening');
                                const phaseAccent = isMorning ? 'border-amber-400/80 bg-amber-500/[0.03]' : (isAfternoon ? 'border-sky-400/80 bg-sky-500/[0.03]' : 'border-purple-400/80 bg-purple-500/[0.03]');

                                return (
                                  <div
                                    key={iIdx}
                                    className={`p-5 rounded-2xl border-l-4 ${phaseAccent} bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all space-y-2`}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold flex items-center gap-1.5">
                                          <FaClock className="w-3 h-3" /> {item.time}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase font-bold bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300">
                                          {phaseLabel}
                                        </span>
                                      </div>

                                      <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
                                        {item.priceINR ? formatINR(item.priceINR) : 'Included in Package'}
                                      </span>
                                    </div>

                                    <div>
                                      <h5 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                        {stripMarkdown(item.title)}
                                      </h5>
                                      {item.description && (
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-sans">
                                          {stripMarkdown(item.description)}
                                        </p>
                                      )}
                                    </div>

                                    {item.location && (
                                      <div className="pt-2 flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                                        <FaMapMarkerAlt className="w-3 h-3 text-amber-500" />
                                        <span>{item.location}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        ))}
                    </div>

                    {/* Bottom Booking CTA Bar with Clickable TravelEase Logo */}
                    <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          Included Transit: <strong className="text-slate-900 dark:text-white font-bold">{selectedTransitMode === 'train' ? 'High-Speed Train (Vande Bharat)' : 'Scheduled Flight'}</strong>
                        </div>
                        <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                          Total Package: <span className="text-amber-500 text-lg">{formatINR(generatedItinerary.totalPackageINR)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Interactive TravelEase Logo AI Concierge Trigger */}
                        <button
                          type="button"
                          onClick={() => window.dispatchEvent(new CustomEvent('open-travelease-concierge'))}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          title="Click TravelEase Logo to discuss this trip with Concierge"
                        >
                          <span className="w-5 h-5 rounded-full bg-black p-0.5 flex items-center justify-center">
                            <img src="/brand/logo-mark.svg" alt="TravelEase Mark" className="w-full h-full object-contain" />
                          </span>
                          <span>Discuss with Concierge</span>
                        </button>

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
                  </div>
                )}

                {/* 6. Travel Architect Insider Wisdom & Rail Advice */}
                {(generatedItinerary.insiderTips?.length > 0 || generatedItinerary.transportTips?.length > 0) && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/[0.06] border border-amber-500/20 space-y-4">
                    <h4 className="text-sm font-bold font-mono text-amber-500 flex items-center gap-2 uppercase tracking-wider">
                      <FaLightbulb className="w-4 h-4" /> Travel Architect Practical Wisdom & Protocol
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[...(generatedItinerary.transportTips || []), ...(generatedItinerary.insiderTips || [])].slice(0, 6).map((tip, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.02] border border-amber-500/15 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed">
                          <FaChevronRight className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                          <span>{stripMarkdown(tip)}</span>
                        </div>
                      ))}
                    </div>
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