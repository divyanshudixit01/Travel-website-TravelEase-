import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import {
  FaBus, FaExchangeAlt,
  FaStar, FaTimes, FaArrowRight, FaClock, FaWifi,
  FaBolt, FaCheckCircle, FaRestroom
} from 'react-icons/fa';
import { RiGpsFill } from 'react-icons/ri';
import { LuBedDouble } from 'react-icons/lu';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';
import { ThreeCard3D } from '../components/ui/ThreeCard3D';
import ThreeBusRouteCanvas from '../components/buses/ThreeBusRouteCanvas';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getServiceSchema } from '../utils/schemas';

// ─── Popular Bus Routes Knowledge Base ────────────────────────────────────────
const POPULAR_CITIES = [
  'Delhi', 'Manali', 'Shimla', 'Jaipur', 'Agra', 'Chandigarh',
  'Mumbai', 'Pune', 'Goa', 'Bengaluru', 'Chennai', 'Hyderabad',
  'Dubai', 'Abu Dhabi', 'London', 'Edinburgh'
];

// Expanded Bus Operators & Schedules
const LUXURY_BUS_OPERATORS = [
  {
    id: 'bus-zingbus-01',
    operator: 'Zingbus Maxx Diamond Sleeper',
    busType: 'Volvo AC 9600 Multi-Axle Sleeper (2+1)',
    rating: 4.9,
    reviewsCount: 3420,
    departureTime: '08:30 PM',
    arrivalTime: '06:15 AM (+1 day)',
    duration: '9h 45m',
    distanceKm: 540,
    priceUSD: 28,
    availableSeats: 9,
    liveStatus: '🟢 Live GPS · En Route on NH-44',
    pickupPoints: ['Kashmiri Gate Metro Gate 1', 'Majnu Ka Tilla Petrol Pump', 'Dhaula Kuan ISBT'],
    dropPoints: ['Private Bus Stand Manali', 'Mall Road Terminal', 'Green Tax Barrier'],
    amenities: ['wifi', 'charging', 'blanket', 'water', 'restroom', 'live_tracking']
  },
  {
    id: 'bus-intrcity-02',
    operator: 'IntrCity SmartBus Executive Lounge',
    busType: 'Scania Metrolink AC Luxury Sleeper',
    rating: 4.85,
    reviewsCount: 2890,
    departureTime: '09:15 PM',
    arrivalTime: '07:00 AM (+1 day)',
    duration: '9h 45m',
    distanceKm: 540,
    priceUSD: 25,
    availableSeats: 14,
    liveStatus: '🟢 Live GPS · On Time Departure',
    pickupPoints: ['Anand Vihar Hub Lounge', 'Kashmiri Gate Metro Gate 2'],
    dropPoints: ['Private Bus Stand Manali', 'Vashisht Chowk'],
    amenities: ['wifi', 'charging', 'blanket', 'water', 'live_tracking']
  },
  {
    id: 'bus-nuego-03',
    operator: 'NueGo Green Electric Luxury Express',
    busType: 'Zero-Emission 100% Electric Ultra-Silent',
    rating: 4.92,
    reviewsCount: 1740,
    departureTime: '07:00 PM',
    arrivalTime: '04:30 AM (+1 day)',
    duration: '9h 30m',
    distanceKm: 540,
    priceUSD: 26,
    availableSeats: 7,
    liveStatus: '🟢 Fast Charging Complete · Ready',
    pickupPoints: ['Majnu Ka Tilla', 'Kashmiri Gate', 'Karnal Bypass'],
    dropPoints: ['Manali Mall Road', 'Aleo Bridge'],
    amenities: ['wifi', 'charging', 'water', 'live_tracking']
  },
  {
    id: 'bus-vrl-04',
    operator: 'VRL Travels I-Shift Royal Suite',
    busType: 'Volvo Multi-Axle Semi-Sleeper AC (2+2)',
    rating: 4.78,
    reviewsCount: 4210,
    departureTime: '10:00 PM',
    arrivalTime: '08:15 AM (+1 day)',
    duration: '10h 15m',
    distanceKm: 540,
    priceUSD: 22,
    availableSeats: 16,
    liveStatus: '🟡 Scheduled · Boarding Gates Open',
    pickupPoints: ['RK Ashram Metro', 'Kashmiri Gate Gate 5'],
    dropPoints: ['Manali Private Stand', 'Prini Roundabout'],
    amenities: ['charging', 'blanket', 'water', 'live_tracking']
  },
  {
    id: 'bus-greenline-05',
    operator: 'Greenline Travels Club Class',
    busType: 'Mercedes-Benz Super High Deck Sleeper',
    rating: 4.88,
    reviewsCount: 1980,
    departureTime: '06:30 PM',
    arrivalTime: '04:00 AM (+1 day)',
    duration: '9h 30m',
    distanceKm: 540,
    priceUSD: 31,
    availableSeats: 5,
    liveStatus: '🟢 Live GPS · Highway Express Speed',
    pickupPoints: ['Dhaula Kuan', 'Kashmiri Gate', 'Rohini Sector 18'],
    dropPoints: ['Manali Bus Terminal', 'Solang Valley Link'],
    amenities: ['wifi', 'charging', 'blanket', 'water', 'restroom', 'live_tracking']
  }
];

export const Buses = () => {
  const navigate = useNavigate();
  const { formatPrice, setActiveBooking, addToast } = useBooking();

  // Media Background Mode ('video' | 'photo') matching Trains.jsx
  const [heroMediaMode, setHeroMediaMode] = useState('video');

  // Search State
  const [fromCity, setFromCity] = useState('Delhi');
  const [toCity, setToCity] = useState('Manali');
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [selectedBusType, setSelectedBusType] = useState('all');

  // Filters & Sorting
  const [timeFilter, setTimeFilter] = useState('all'); // all | morning | evening | night
  const [hasRestroomOnly, setHasRestroomOnly] = useState(false);
  const [hasWifiOnly, setHasWifiOnly] = useState(false);
  const [sortBy, setSortBy] = useState('earliest');

  // Interactive Seat Selection Modal State
  const [activeBusModal, setActiveBusModal] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState('lower'); // 'lower' | 'upper'
  const [selectedSeats, setSelectedSeats] = useState(['L4']);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [selectedDrop, setSelectedDrop] = useState('');

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 180]);

  // Swap Route
  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
    addToast(`Swapped bus route to ${toCity} ➔ ${fromCity}`, 'info');
  };

  // Filter Pipeline
  const filteredBuses = useMemo(() => {
    let list = [...LUXURY_BUS_OPERATORS];

    // Bus class filter
    if (selectedBusType === 'sleeper') {
      list = list.filter((b) => b.busType.toLowerCase().includes('sleeper'));
    } else if (selectedBusType === 'electric') {
      list = list.filter((b) => b.busType.toLowerCase().includes('electric'));
    } else if (selectedBusType === 'seater') {
      list = list.filter((b) => b.busType.toLowerCase().includes('seater'));
    }

    // Departure time filter
    if (timeFilter === 'evening') {
      list = list.filter((b) => b.departureTime.includes('06:') || b.departureTime.includes('07:'));
    } else if (timeFilter === 'night') {
      list = list.filter((b) => b.departureTime.includes('08:') || b.departureTime.includes('09:') || b.departureTime.includes('10:'));
    }

    // Amenities filters
    if (hasRestroomOnly) {
      list = list.filter((b) => b.amenities.includes('restroom'));
    }
    if (hasWifiOnly) {
      list = list.filter((b) => b.amenities.includes('wifi'));
    }

    // Sorting
    if (sortBy === 'cheapest') list.sort((a, b) => a.priceUSD - b.priceUSD);
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'fastest') list.sort((a, b) => parseInt(a.duration, 10) - parseInt(b.duration, 10));
    else if (sortBy === 'earliest') list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

    return list;
  }, [selectedBusType, timeFilter, hasRestroomOnly, hasWifiOnly, sortBy]);

  // Open Seat Modal
  const handleOpenSeatModal = (bus) => {
    setActiveBusModal(bus);
    setSelectedPickup(bus.pickupPoints[0]);
    setSelectedDrop(bus.dropPoints[0]);
    setSelectedSeats(['L4']);
  };

  // Toggle seat selection
  const handleToggleSeat = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  // Confirm Bus Reservation
  const handleConfirmBus = () => {
    if (!activeBusModal || selectedSeats.length === 0) return;

    const totalPrice = activeBusModal.priceUSD * selectedSeats.length;

    const busDraft = {
      serviceType: 'bus',
      itemTitle: `${activeBusModal.operator}`,
      details: {
        route: `${fromCity} ➔ ${toCity}`,
        from: fromCity,
        to: toCity,
        busType: activeBusModal.busType,
        departureTime: activeBusModal.departureTime,
        arrivalTime: activeBusModal.arrivalTime,
        duration: activeBusModal.duration,
        date: travelDate,
        seats: selectedSeats.join(', '),
        seatsCount: selectedSeats.length,
        boardingPoint: selectedPickup,
        dropPoint: selectedDrop,
        liveTracking: 'Enabled (SMS & App GPS stream)'
      },
      priceUSD: totalPrice,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
    };

    setActiveBooking(busDraft);
    addToast(`${selectedSeats.length} luxury berths reserved! Proceeding to checkout.`, 'success');
    navigate('/checkout');
  };

  const busSchemas = useMemo(() => [
    getWebPageSchema({
      name: 'Book Luxury Intercity Volvo Sleeper Buses — TravelEase',
      description: 'Book verified Volvo AC sleeper buses, electric coaches, and executive express routes with live GPS tracking.',
      url: '/buses',
      breadcrumb: true
    }),
    getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Buses' }], '/buses'),
    getServiceSchema({
      name: 'TravelEase Intercity Bus Network',
      description: 'Real-time luxury intercity bus booking engine with interactive berth layouts.',
      url: '/buses',
      serviceType: 'Bus Ticketing Engine'
    })
  ], []);

  return (
    <div className="relative bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-500">
      <JsonLd data={busSchemas} />

      {/* ═══════════════════════════════════════════════════════════════════════════
          1. CINEMATIC HERO SECTION (Matching Trains.jsx with Looping Highway Video)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative pt-28 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Dynamic Background: Highway Video Loop + Mountain Pass Photo */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {heroMediaMode === 'video' ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop"
              className="w-full h-full object-cover object-center scale-105 brightness-[0.90] contrast-[1.08] transition-opacity duration-700"
            >
              <source src="/bus-highway.webm" type="video/webm" />
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop"
                alt="Highway Travel Vista"
                className="w-full h-full object-cover"
              />
            </video>
          ) : (
            <motion.img
              initial={{ scale: 1 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
              src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop"
              alt="Luxury Coach Mountain Highway"
              className="w-full h-full object-cover object-center brightness-[0.90] contrast-[1.08]"
            />
          )}

          {/* Multilayered cinematic overlays for dual light/dark mode legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/20 to-black/40 dark:from-[#070a13] dark:via-[#070a13]/50 dark:to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/30 to-transparent dark:from-[#070a13]/90 dark:via-[#070a13]/40 dark:to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.22)_0%,transparent_65%)]" />

          {/* Three.js 3D Highway Route Canvas */}
          <ThreeBusRouteCanvas />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top Status Bar: Live Network & Media Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/40 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 text-xs text-white font-medium shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Intercity Highway Network · 4,800+ Verified Luxury Coaches · Live GPS Fleet</span>
            </div>

            {/* Media Mode Selector */}
            <div className="flex items-center p-1 bg-black/40 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/15 text-xs">
              <button
                type="button"
                onClick={() => setHeroMediaMode('video')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  heroMediaMode === 'video'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span>🎬 Highway Express</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroMediaMode('photo')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  heroMediaMode === 'photo'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span>🌄 Scenic Pass</span>
              </button>
            </div>
          </div>

          {/* Header Title */}
          <div className="max-w-3xl mb-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-amber-300 dark:text-amber-400 font-extrabold text-xs uppercase tracking-[0.2em] mb-3"
            >
              <FaBus className="text-base animate-pulse" />
              <span>TravelEase Intercity Coach Suite</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-4 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
            >
              Intercity Express Travel,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 drop-shadow-[0_4px_28px_rgba(245,158,11,0.45)]">
                Luxury on Wheels.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/85 text-sm sm:text-base font-medium max-w-xl leading-relaxed drop-shadow-md"
            >
              Book AC Volvo sleepers, electric smart coaches, and executive express buses with live GPS tracking and dual-deck berth maps.
            </motion.p>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════
              SEARCH COMMAND CARD (ThreeUI Glassmorphic Design)
          ═══════════════════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-3xl bg-white/95 dark:bg-[#0c0f1d]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 p-5 sm:p-7 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85)] relative"
          >
            {/* Class Pill Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/80 dark:border-white/5">
                {[
                  { id: 'all', label: 'All Luxury Coaches' },
                  { id: 'sleeper', label: 'AC Sleeper (2+1)' },
                  { id: 'electric', label: 'Electric SmartBus' },
                  { id: 'seater', label: 'Executive Seater' }
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedBusType(c.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                      selectedBusType === c.id
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Quick Date Chips */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Quick Date:
                </span>
                {[
                  { label: 'Today', offset: 0 },
                  { label: 'Tomorrow', offset: 1 },
                  { label: 'This Weekend', offset: 3 }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + chip.offset);
                      setTravelDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-amber-400 transition-all"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              {/* Origin City */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5">
                  Leaving From
                </label>
                <div className="relative">
                  <select
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="w-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/90 dark:border-white/10 hover:border-amber-400/80 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-black text-sm focus:outline-none focus:border-amber-500 shadow-sm cursor-pointer"
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="hidden md:flex md:col-span-1 justify-center pb-2">
                <button
                  type="button"
                  onClick={handleSwapCities}
                  title="Swap Origin and Destination"
                  className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all duration-300 shadow-sm active:scale-95 group"
                >
                  <FaExchangeAlt className="text-xs group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>

              {/* Destination City */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5">
                  Going To
                </label>
                <div className="relative">
                  <select
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="w-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/90 dark:border-white/10 hover:border-amber-400/80 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-black text-sm focus:outline-none focus:border-amber-500 shadow-sm cursor-pointer"
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Travel Date */}
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border border-slate-200/90 dark:border-white/10 hover:border-amber-400/80 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-amber-500 shadow-sm cursor-pointer"
                />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-500" /> Free Cancellation up to 6h before
                </span>
                <span className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-500" /> Zero Convenience Fee Guarantee
                </span>
              </div>

              <ThreeUIButton
                variant="amber-glow"
                size="md"
                onClick={() => addToast(`Searching live coaches for ${fromCity} ➔ ${toCity}`, 'info')}
                icon={<FaBus />}
                className="w-full sm:w-auto"
              >
                Search Live Buses
              </ThreeUIButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          2. FILTER & TIME SUB-DOCK
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-20 z-30 bg-slate-50/90 dark:bg-[#070a13]/90 backdrop-blur-xl border-y border-slate-200/80 dark:border-white/10 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          {/* Time Filter Pills */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Departure:</span>
            <SegmentedPillToggle
              options={[
                { id: 'all', label: 'All Times' },
                { id: 'evening', label: 'Evening (6-8 PM)' },
                { id: 'night', label: 'Night (8-11 PM)' }
              ]}
              value={timeFilter}
              onChange={setTimeFilter}
              size="sm"
            />
          </div>

          {/* Amenities Quick Toggles */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHasRestroomOnly(!hasRestroomOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                hasRestroomOnly
                  ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              <FaRestroom /> Washroom Onboard
            </button>

            <button
              type="button"
              onClick={() => setHasWifiOnly(!hasWifiOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                hasWifiOnly
                  ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              <FaWifi /> High-Speed Wi-Fi
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-sm cursor-pointer"
            >
              <option value="earliest">Earliest Departure</option>
              <option value="cheapest">Cheapest Fare</option>
              <option value="rating">Top Operator Rating</option>
              <option value="fastest">Fastest Journey</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          3. BUS CARDS FEED
      ═══════════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Verified Coaches: {fromCity} ➔ {toCity}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Found {filteredBuses.length} express departures · Travel date {travelDate}
            </p>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Verified AIS-140 GPS Feed
          </div>
        </div>

        {/* Bus Cards Deck */}
        <div className="space-y-4">
          {filteredBuses.map((bus) => (
            <ThreeCard3D key={bus.id} maxTilt={3} className="w-full">
              <div className="p-5 sm:p-7">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Operator Info */}
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] tracking-wider uppercase">
                        Premium Partner
                      </span>
                      <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                        <FaStar className="text-[10px]" />
                        <span>{bus.rating}</span>
                        <span className="text-slate-400 font-normal">({bus.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {bus.operator}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {bus.busType}
                    </p>

                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <RiGpsFill className="text-emerald-500 text-xs" />
                      <span>{bus.liveStatus}</span>
                    </div>
                  </div>

                  {/* Route & Times */}
                  <div className="lg:col-span-5 flex items-center justify-between gap-4 px-2 sm:px-4">
                    {/* Departure */}
                    <div className="text-left">
                      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {bus.departureTime}
                      </p>
                      <p className="text-xs font-black text-amber-500">{fromCity}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {bus.pickupPoints[0]}
                      </p>
                    </div>

                    {/* Timeline Graphic */}
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <FaClock className="text-[10px]" /> {bus.duration}
                      </span>

                      <div className="w-full flex items-center relative my-1">
                        <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-700 rounded-full relative">
                          <div className="absolute inset-y-0 left-0 bg-amber-500 w-2/3 rounded-full" />
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 -top-2 bg-slate-50 dark:bg-[#0c0f1d] px-1 text-amber-500">
                          <FaBus className="text-xs" />
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-slate-400 mt-1">
                        {bus.distanceKm} km Intercity Run
                      </span>
                    </div>

                    {/* Arrival */}
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {bus.arrivalTime}
                      </p>
                      <p className="text-xs font-black text-amber-500">{toCity}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {bus.dropPoints[0]}
                      </p>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/10">
                    <div className="text-left lg:text-right">
                      <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatPrice(bus.priceUSD)}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">per sleeper berth</p>
                    </div>

                    <ThreeUIButton
                      variant="amber-glow"
                      size="sm"
                      onClick={() => handleOpenSeatModal(bus)}
                      icon={<FaArrowRight />}
                    >
                      Select Seats
                    </ThreeUIButton>
                  </div>
                </div>

                {/* Amenities Badges Footer */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-3">
                    {bus.amenities.includes('wifi') && (
                      <span className="flex items-center gap-1">
                        <FaWifi className="text-amber-500" /> High-Speed Wi-Fi
                      </span>
                    )}
                    {bus.amenities.includes('charging') && (
                      <span className="flex items-center gap-1">
                        <FaBolt className="text-amber-500" /> Individual USB Socket
                      </span>
                    )}
                    {bus.amenities.includes('blanket') && (
                      <span className="flex items-center gap-1">
                        <LuBedDouble className="text-amber-500" /> Sanitized Pillow & Blanket
                      </span>
                    )}
                    {bus.amenities.includes('restroom') && (
                      <span className="flex items-center gap-1">
                        <FaRestroom className="text-amber-500" /> Clean Bio-Toilet
                      </span>
                    )}
                  </div>

                  <span className="font-extrabold text-rose-500 text-[11px]">
                    Only {bus.availableSeats} single berths left
                  </span>
                </div>
              </div>
            </ThreeCard3D>
          ))}
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════════
          4. INTERACTIVE DUAL-DECK SEAT & BOARDING MODAL
      ═══════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeBusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveBusModal(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0e121e] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Select Bus Sleeper Berths
                  </h3>
                  <p className="text-xs text-amber-500 font-bold">
                    {activeBusModal.operator} · {fromCity} ➔ {toCity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveBusModal(null)}
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Deck Switcher Toggle */}
              <div className="flex items-center justify-center">
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedDeck('lower')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedDeck === 'lower'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Lower Deck (Standard Berths)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDeck('upper')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedDeck === 'upper'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Upper Deck (Panoramic View)
                  </button>
                </div>
              </div>

              {/* Interactive Sleeper Berth Grid */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-3xl border border-slate-200/80 dark:border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-4 px-2">
                  <span>Front / Driver Cabin</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600" /> Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-500" /> Selected
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700" /> Booked
                    </span>
                  </div>
                </div>

                {/* 2+1 Layout */}
                <div className="grid grid-cols-4 gap-3">
                  {(selectedDeck === 'lower'
                    ? ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12']
                    : ['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12']
                  ).map((seatId, idx) => {
                    const isSelected = selectedSeats.includes(seatId);
                    const isBooked = seatId === 'L2' || seatId === 'U5' || seatId === 'L8';

                    return (
                      <button
                        key={seatId}
                        type="button"
                        disabled={isBooked}
                        onClick={() => handleToggleSeat(seatId)}
                        className={`py-3 px-2 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 ${
                          isBooked
                            ? 'bg-slate-200 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed border border-transparent'
                            : isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-md scale-105 border border-amber-400'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-400 border border-slate-200 dark:border-white/10'
                        }`}
                      >
                        <LuBedDouble className="text-base" />
                        <span>{seatId}</span>
                        <span className="text-[9px] opacity-70">
                          {idx % 3 === 0 ? 'Window' : 'Single'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Boarding & Drop-off Point Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Pick-Up Location in {fromCity}
                  </label>
                  <select
                    value={selectedPickup}
                    onChange={(e) => setSelectedPickup(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {activeBusModal.pickupPoints.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Drop-off Location in {toCity}
                  </label>
                  <select
                    value={selectedDrop}
                    onChange={(e) => setSelectedDrop(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {activeBusModal.dropPoints.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Summary & Confirm Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Selected Berths: {selectedSeats.join(', ') || 'None'}
                  </p>
                  <p className="text-3xl font-black text-amber-500">
                    {formatPrice(activeBusModal.priceUSD * selectedSeats.length)}
                  </p>
                </div>

                <ThreeUIButton
                  variant="amber-glow"
                  size="md"
                  disabled={selectedSeats.length === 0}
                  onClick={handleConfirmBus}
                  icon={<FaArrowRight />}
                >
                  Confirm & Reserve Ticket
                </ThreeUIButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Buses;
