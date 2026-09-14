import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import {
  FaCar, FaTaxi, FaBolt, FaExchangeAlt,
  FaUsers, FaSuitcase, FaStar, FaArrowRight, FaRoute
} from 'react-icons/fa';
import { RiGpsFill } from 'react-icons/ri';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema } from '../utils/schemas';

// ─── Supported Aggregator Partners ──────────────────────────────────────────
const FLEET_PROVIDERS = [
  { id: 'uber', name: 'Uber Express', badge: 'Official API Partner', logo: '🚕', color: 'from-black to-slate-800' },
  { id: 'rapido', name: 'Rapido Cabs & Auto', badge: 'Fastest ETA · Lowest Fare', logo: '⚡', color: 'from-amber-500 to-yellow-600' },
  { id: 'bharattaxi', name: 'Bharat Taxi', badge: 'Govt. Verified Fixed Rates', logo: '🇮🇳', color: 'from-emerald-600 to-teal-700' },
  { id: 'ola', name: 'Ola Fleet', badge: 'Prime Sedans & SUVs', logo: '🟢', color: 'from-lime-600 to-emerald-800' },
  { id: 'travelease', name: 'TravelEase Black Fleet', badge: 'Chauffeur & Luxury EVs', logo: '👑', color: 'from-purple-900 to-indigo-950' }
];

// ─── Preset Popular Corridors for Instant Dispatch ──────────────────────────
const POPULAR_LOCATIONS = [
  { city: 'Delhi NCR', pickup: 'Indira Gandhi Intl Airport T3', drop: 'Connaught Place, Central Delhi', distanceKm: 18, baseEtaMins: 3 },
  { city: 'Mumbai', pickup: 'Chhatrapati Shivaji Intl Airport T2', drop: 'Bandra Kurla Complex (BKC)', distanceKm: 12, baseEtaMins: 4 },
  { city: 'Bengaluru', pickup: 'Kempegowda Intl Airport', drop: 'Indiranagar 100ft Road', distanceKm: 38, baseEtaMins: 5 },
  { city: 'Hyderabad', pickup: 'Rajiv Gandhi Intl Airport', drop: 'Hitec City Mindspace', distanceKm: 32, baseEtaMins: 4 },
  { city: 'Varanasi', pickup: 'Varanasi Cantt Railway Station', drop: 'Dashashwamedh Ghat', distanceKm: 6, baseEtaMins: 2 },
  { city: 'Dubai', pickup: 'Dubai International Airport (DXB)', drop: 'Downtown Dubai & Burj Khalifa', distanceKm: 14, baseEtaMins: 3 }
];

const CarRentals = () => {
  const navigate = useNavigate();
  const { setActiveBooking, addToast, currency } = useBooking();

  // Mode Selection: 'on-demand-cabs' | 'outstation' | 'self-drive'
  const [serviceMode, setServiceMode] = useState('on-demand-cabs');

  // Route state
  const [city, setCity] = useState('Delhi NCR');
  const [pickup, setPickup] = useState('Indira Gandhi Intl Airport T3');
  const [drop, setDrop] = useState('Connaught Place, Central Delhi');
  const [distanceKm, setDistanceKm] = useState(18);

  // Filter state
  const [selectedVehicleType, setSelectedVehicleType] = useState('all'); // 'all' | 'cab' | 'auto' | 'bike' | 'suv' | 'luxury'

  // Self-drive state
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 200]);

  // Handle preset selection
  const handleSelectPreset = (preset) => {
    setCity(preset.city);
    setPickup(preset.pickup);
    setDrop(preset.drop);
    setDistanceKm(preset.distanceKm);
    addToast(`Route updated to ${preset.pickup} ➔ ${preset.drop}`, 'info');
  };

  const handleSwapRoute = () => {
    const temp = pickup;
    setPickup(drop);
    setDrop(temp);
    addToast('Pick-up and drop locations swapped!', 'info');
  };

  // Real-time dynamic aggregator ride options calculated based on distance & partner algorithms
  const liveRides = useMemo(() => {
    const km = Math.max(3, distanceKm);

    return [
      // 1. Rapido Auto & Bike (Short, fast, high availability)
      {
        id: 'rapido-auto',
        provider: 'Rapido',
        providerBadge: 'Auto & Quick City Run',
        providerLogo: '⚡',
        name: 'Rapido Auto Express',
        category: 'auto',
        vehicleType: 'Bajaj Compact / Piaggio CNG Auto',
        seats: 3,
        luggage: '1 Medium Bag',
        etaMins: 2,
        fareINR: Math.round(45 + km * 14),
        rating: 4.85,
        ratingCount: '240k+',
        features: ['No Surge Pricing', 'Direct Metred Fare', 'Instant OTP Start'],
        tag: 'Lowest Price Guaranteed',
        tagColor: 'amber'
      },
      // 2. Uber Go
      {
        id: 'uber-go',
        provider: 'Uber',
        providerBadge: 'Affordable Everyday AC Cabs',
        providerLogo: '🚕',
        name: 'Uber Go (AC Hatchback)',
        category: 'cab',
        vehicleType: 'WagonR / Maruti Swift AC',
        seats: 4,
        luggage: '2 Luggage Bags',
        etaMins: 3,
        fareINR: Math.round(90 + km * 19),
        rating: 4.88,
        ratingCount: '580k+',
        features: ['Full AC Guaranteed', 'Live GPS Safety Tracking', 'Airbag Equipped'],
        tag: 'Most Popular',
        tagColor: 'emerald'
      },
      // 3. Bharat Taxi (Govt. approved, zero cancellation)
      {
        id: 'bharat-sedan',
        provider: 'Bharat Taxi',
        providerBadge: 'Govt. Verified Fixed Fares',
        providerLogo: '🇮🇳',
        name: 'Bharat Taxi City Sedan',
        category: 'cab',
        vehicleType: 'Tata Tigor / Swift Dzire Tour',
        seats: 4,
        luggage: '3 Bags',
        etaMins: 4,
        fareINR: Math.round(110 + km * 18),
        rating: 4.92,
        ratingCount: '95k+',
        features: ['Zero Driver Cancellation', 'Fixed Per-KM Rate', 'Commercial Verified Driver'],
        tag: 'Zero Cancellation Guarantee',
        tagColor: 'teal'
      },
      // 4. Uber Premier / Executive
      {
        id: 'uber-premier',
        provider: 'Uber',
        providerBadge: 'Top-Rated Drivers & Comfy Sedans',
        providerLogo: '🚕',
        name: 'Uber Premier Sedan',
        category: 'cab',
        vehicleType: 'Honda City / Hyundai Verna / Ciaz',
        seats: 4,
        luggage: '3 Large Bags',
        etaMins: 4,
        fareINR: Math.round(150 + km * 25),
        rating: 4.95,
        ratingCount: '320k+',
        features: ['Executive Legroom', 'Complimentary Water', 'Top 5% Rated Drivers'],
        tag: 'Executive Comfort',
        tagColor: 'indigo'
      },
      // 5. Ola Prime SUV / Uber XL
      {
        id: 'ola-suv',
        provider: 'Ola Fleet',
        providerBadge: 'Spacious 6-Seater Family Ride',
        providerLogo: '🟢',
        name: 'Ola Prime SUV (6-Seater)',
        category: 'suv',
        vehicleType: 'Toyota Innova Crysta / Ertiga Hybrid',
        seats: 6,
        luggage: '5 Large Bags',
        etaMins: 5,
        fareINR: Math.round(180 + km * 32),
        rating: 4.87,
        ratingCount: '190k+',
        features: ['6 Full Seats', 'Dual Climate AC', 'Roof Carrier Available'],
        tag: 'Family & Luggage Choice',
        tagColor: 'purple'
      },
      // 6. TravelEase Black Luxury EV
      {
        id: 'travelease-ev',
        provider: 'TravelEase Black Fleet',
        providerBadge: 'Zero Emission VIP Chauffeur',
        providerLogo: '👑',
        name: 'Tesla Model Y & Ioniq 5 Chauffeur',
        category: 'luxury',
        vehicleType: 'Tesla Model Y / Hyundai Ioniq 5 EV',
        seats: 4,
        luggage: '4 Bags',
        etaMins: 6,
        fareINR: Math.round(350 + km * 45),
        rating: 4.98,
        ratingCount: '15k+',
        features: ['Pure Electric Whisper Quiet', 'In-Car High Speed WiFi', 'Uniformed Chauffeur'],
        tag: 'VIP Electric Class',
        tagColor: 'sky'
      }
    ];
  }, [distanceKm]);

  // Self-Drive Fleet
  const selfDriveFleet = [
    {
      id: 'self-tesla-y',
      name: 'Tesla Model Y Long Range AWD',
      brand: 'Tesla',
      category: 'Electric Luxury SUV',
      seats: 5,
      range: '525 km per charge',
      pricePerDayINR: 5800,
      pricePerDayUSD: 68,
      rating: 4.95,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
      features: ['Autopilot Included', 'Supercharger Network Free', 'Zero Security Deposit via TravelEase Pass']
    },
    {
      id: 'self-bmw-5',
      name: 'BMW 5 Series M-Sport Executive',
      brand: 'BMW',
      category: 'Luxury Sports Sedan',
      seats: 5,
      range: 'Unlimited Mileage',
      pricePerDayINR: 7500,
      pricePerDayUSD: 88,
      rating: 4.92,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      features: ['Harman Kardon Audio', 'Sunroof & M-Package', 'Doorstep Airport Drop & Collect']
    },
    {
      id: 'self-thar-4x4',
      name: 'Mahindra Thar Earth Edition 4x4',
      brand: 'Mahindra',
      category: 'Off-Road Adventure Convertible',
      seats: 4,
      range: 'Unlimited Mountain Permit',
      pricePerDayINR: 3900,
      pricePerDayUSD: 46,
      rating: 4.89,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      features: ['Hard-top 4WD High/Low', 'All-Terrain Tyres', 'GPS Trail Navigation']
    }
  ];

  // Filtered ride results
  const filteredRides = useMemo(() => {
    if (selectedVehicleType === 'all') return liveRides;
    return liveRides.filter(r => r.category === selectedVehicleType);
  }, [liveRides, selectedVehicleType]);

  // Unified Direct Booking Action (Works across Uber, Rapido, Bharat Taxi directly using TravelEase Account!)
  const handleBookRide = (ride) => {
    const fareUSD = Math.max(5, Math.round(ride.fareINR / 86.5));
    
    const rideDraft = {
      serviceType: 'cab',
      provider: ride.provider,
      itemTitle: `${ride.name} (${ride.provider})`,
      details: {
        provider: ride.provider,
        vehicleModel: ride.vehicleType,
        pickupLocation: pickup,
        dropLocation: drop,
        estimatedDistance: `${distanceKm} km`,
        estimatedTime: `${Math.round(distanceKm * 2.2 + 5)} mins`,
        driverDispatchEta: `${ride.etaMins} mins away`,
        fareCalculated: `₹${ride.fareINR.toLocaleString('en-IN')}`,
        travelEasePass: 'Unified Single-Login Dispatch (No 3rd-party app needed)'
      },
      priceUSD: fareUSD,
      totalUSD: fareUSD,
      amount: ride.fareINR,
      amountUSD: fareUSD,
      currency: currency === 'INR' ? 'INR' : 'USD',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80'
    };

    setActiveBooking(rideDraft);
    addToast(`Locked in ${ride.name} via ${ride.provider}! Proceeding to unified checkout.`, 'success');
    navigate('/checkout');
  };

  // Self Drive Booking
  const handleBookSelfDrive = (car) => {
    const days = Math.max(1, Math.round((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)));
    const totalUSD = car.pricePerDayUSD * days;
    const totalINR = car.pricePerDayINR * days;

    const selfDriveDraft = {
      serviceType: 'car-rental',
      provider: 'TravelEase Fleet',
      itemTitle: `${car.name} (${days} Days Self-Drive)`,
      details: {
        vehicle: car.name,
        category: car.category,
        pickupCity: city,
        pickupDate: pickupDate,
        returnDate: returnDate,
        totalDays: `${days} Days`,
        mileage: car.range,
        insurance: 'Zero-Deductible Comprehensive Coverage Included'
      },
      priceUSD: totalUSD,
      totalUSD: totalUSD,
      amount: totalINR,
      amountUSD: totalUSD,
      currency: currency === 'INR' ? 'INR' : 'USD',
      image: car.image
    };

    setActiveBooking(selfDriveDraft);
    addToast(`Reserved ${car.name} for ${days} days! Proceeding to checkout.`, 'success');
    navigate('/checkout');
  };

  const seoSchemas = [
    getWebPageSchema({
      name: 'Unified Cab & Car Rental Hub — Uber, Rapido, Bharat Taxi & Self-Drive on TravelEase',
      description: 'Book Uber, Rapido, Bharat Taxi, and luxury self-drive rentals directly from one single TravelEase account without downloading multiple cab apps.',
      url: '/cars',
      breadcrumb: true
    }),
    getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Cabs & Car Rentals' }], '/cars')
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#06080d] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-500" id="cabs-rentals-hub">
      <JsonLd data={seoSchemas} />

      {/* ─── 1. CINEMATIC HERO SECTION WITH HIGHWAY & LUXURY FLEET BACKDROP ─── */}
      <section ref={heroRef} className="relative h-[82vh] min-h-[620px] w-full overflow-hidden flex items-center justify-center">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop"
            alt="Highway Fleet Wallpaper"
            className="w-full h-full object-cover brightness-[0.85] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-slate-50 dark:to-[#06080d]"></div>
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-14">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-6 shadow-2xl">
            <RiGpsFill className="text-emerald-400 animate-pulse" />
            <span>Unified Cab & Fleet Aggregator · 1 Login for All Apps</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-none mb-6 drop-shadow-xl">
            Uber, Rapido, Bharat Taxi.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500">
              One Unified Checkout.
            </span>
          </h1>

          <p className="text-slate-200 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-medium leading-relaxed drop-shadow">
            Stop switching between 4 different apps. Compare live fares, driver ETAs, and book directly using your TravelEase login—with zero extra accounts needed.
          </p>

          {/* Mode Tabs */}
          <div className="mb-6 flex justify-center">
            <SegmentedPillToggle
              options={[
                { id: 'on-demand-cabs', label: '⚡ City Cabs (Uber · Rapido · Bharat Taxi)' },
                { id: 'self-drive', label: '🚗 Luxury & EV Self-Drive' }
              ]}
              value={serviceMode}
              onChange={setServiceMode}
              layoutId="carRentalServiceMode"
              size="md"
            />
          </div>

          {/* Partner Brand Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {FLEET_PROVIDERS.map(p => (
              <span
                key={p.id}
                className="px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white/90 flex items-center gap-1.5 shadow-sm"
              >
                <span>{p.logo}</span>
                <span className="font-bold">{p.name}</span>
                <span className="text-amber-400">· {p.badge.split('·')[0]}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 2. LIVE DISPATCH SEARCH & ROUTE CONSOLE ─── */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-30">
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0e121d] border border-slate-200 dark:border-white/10 shadow-2xl">
          
          {serviceMode === 'on-demand-cabs' ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6">
                
                {/* City Selector */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">Metropolitan Hub</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="Delhi NCR">Delhi NCR (Gurgaon / Noida)</option>
                    <option value="Mumbai">Mumbai Metropolitan (MMR)</option>
                    <option value="Bengaluru">Bengaluru (Electronic City / Airport)</option>
                    <option value="Hyderabad">Hyderabad (Hitec City / Secunderabad)</option>
                    <option value="Varanasi">Varanasi (Ghats / Airport)</option>
                    <option value="Dubai">Dubai & Abu Dhabi UAE</option>
                  </select>
                </div>

                {/* Pick-up */}
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pick-Up Location
                  </label>
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Airport terminal, railway station, or street"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Swap */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center pb-2">
                  <button
                    type="button"
                    onClick={handleSwapRoute}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-transform hover:rotate-180"
                    title="Swap Pick-up and Drop"
                  >
                    <FaExchangeAlt />
                  </button>
                </div>

                {/* Drop-off */}
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Drop-Off Destination
                  </label>
                  <input
                    type="text"
                    value={drop}
                    onChange={(e) => setDrop(e.target.value)}
                    placeholder="Hotel, landmark, office, or residential address"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Quick Preset Corridors */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-mono font-bold text-slate-400 mr-2">Top Corridors:</span>
                {POPULAR_LOCATIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-500/15 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 border border-slate-200 dark:border-white/5 transition-all"
                  >
                    {preset.city}: {preset.pickup.split(' ')[0]} ➔ {preset.drop.split(' ')[0]} ({preset.distanceKm} km)
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Self-Drive Form
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">Pick-Up City & Delivery</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Delhi NCR, Mumbai, Goa, Bengaluru..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">Pick-Up Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-400 mb-1.5">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="md:col-span-2">
                <ThreeUIButton
                  type="button"
                  variant="amber-glow"
                  size="md"
                  className="w-full"
                  onClick={() => addToast('Self-drive fleet updated for dates!', 'success')}
                  icon={<FaCar />}
                >
                  Refresh Fleet
                </ThreeUIButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── 3. MAIN AGGREGATOR RIDE CARDS OR SELF-DRIVE GRID ─── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        {serviceMode === 'on-demand-cabs' ? (
          <div>
            {/* Header with Route Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-500 mb-1">
                  <FaRoute /> {distanceKm} km Estimated Route · ~{Math.round(distanceKm * 2.2 + 5)} mins travel time
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Available Rides Across All Networks ({filteredRides.length})
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Compare fares side-by-side. One tap dispatches the driver directly with your TravelEase account.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="overflow-x-auto pb-2 scrollbar-none">
                <SegmentedPillToggle
                  options={[
                    { id: 'all', label: 'All Cabs' },
                    { id: 'auto', label: 'Auto (Rapido)' },
                    { id: 'cab', label: 'Sedans (Uber · Bharat)' },
                    { id: 'suv', label: '6-Seater SUV' },
                    { id: 'luxury', label: 'VIP Electric' }
                  ]}
                  value={selectedVehicleType}
                  onChange={setSelectedVehicleType}
                  layoutId="carRentalVehicleType"
                  size="sm"
                />
              </div>
            </div>

            {/* Aggregated Ride Cards List */}
            <div className="space-y-4">
              {filteredRides.map((ride) => {
                const fareFormattedINR = `₹${ride.fareINR.toLocaleString('en-IN')}`;
                const fareFormattedUSD = `$${Math.max(5, Math.round(ride.fareINR / 86.5))}`;

                return (
                  <motion.div
                    key={ride.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-3xl bg-white dark:bg-[#0e121d] border border-slate-200 dark:border-white/10 hover:border-amber-400/60 dark:hover:border-amber-400/50 transition-all shadow-sm hover:shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
                  >
                    {/* Left info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                        {ride.providerLogo}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-mono font-black uppercase">
                            {ride.provider}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                            <FaBolt className="text-[10px]" /> {ride.etaMins} mins away
                          </span>
                          <span className="text-xs text-amber-500 font-bold flex items-center gap-1 font-mono">
                            <FaStar className="text-[10px]" /> {ride.rating} ({ride.ratingCount})
                          </span>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                          {ride.name}
                        </h3>

                        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span>{ride.vehicleType}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><FaUsers /> {ride.seats} Seats</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><FaSuitcase /> {ride.luggage}</span>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {ride.features.map((feat, idx) => (
                            <span key={idx} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Price & Dispatch Button */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left lg:text-right">
                        <div className="text-[10px] font-mono uppercase text-slate-400">Locked In Fare</div>
                        <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                          {fareFormattedINR}
                          <span className="text-xs font-medium text-slate-400 ml-1.5">({fareFormattedUSD})</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ Tolls & Taxes Included
                        </span>
                      </div>

                      <ThreeUIButton
                        variant="amber-glow"
                        size="md"
                        onClick={() => handleBookRide(ride)}
                        icon={<FaArrowRight className="text-xs" />}
                      >
                        Book with TravelEase ID
                      </ThreeUIButton>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          // Self-Drive Fleet Grid
          <div>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                Premium Self-Drive Fleet
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Doorstep delivery at airports or hotels with zero security deposit when booking with TravelEase Verified ID.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {selfDriveFleet.map(car => (
                <div
                  key={car.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#0e121d] border border-slate-200 dark:border-white/10 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="h-52 rounded-2xl overflow-hidden mb-5">
                      <img src={car.image} alt={car.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-amber-500 mb-1">
                      <span>{car.category}</span>
                      <span className="flex items-center gap-1"><FaStar /> {car.rating}</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                      {car.name}
                    </h3>

                    <div className="space-y-1.5 my-4">
                      {car.features.map((f, i) => (
                        <div key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <span className="text-emerald-500">✓</span> {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-4">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400">Daily Rate</div>
                      <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                        ₹{car.pricePerDayINR.toLocaleString('en-IN')}{' '}
                        <span className="text-xs text-slate-400 font-normal">(${car.pricePerDayUSD})</span>
                      </div>
                    </div>

                    <ThreeUIButton
                      variant="liquid-metal"
                      size="sm"
                      onClick={() => handleBookSelfDrive(car)}
                    >
                      Reserve Fleet
                    </ThreeUIButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ─── 4. WHY TRAVELEASE UNIFIED CAB AGGREGATOR (VALUE PROP) ─── */}
      <section className="py-16 px-4 bg-slate-100 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Why Book Cabs Directly via TravelEase?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              We eliminate the hassle of managing individual accounts, credit cards, and apps for every mobility service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e121d] border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl mb-4 font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Zero Extra Accounts</h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                No need to register on Uber, download Rapido, or enter OTPs across 5 apps. Your single TravelEase ID issues instant verified dispatch tokens.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e121d] border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl mb-4 font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Automated Best Fare Engine</h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                Our algorithm constantly indexes surge prices between Uber, Rapido, and Bharat Taxi to display the true cheapest ride in real-time.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0e121d] border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl mb-4 font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Unified Travel Receipt & Points</h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                All cab expenses sync cleanly into your unified trip itinerary, GST invoice, and TravelEase Loyalty Rewards balance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarRentals;
