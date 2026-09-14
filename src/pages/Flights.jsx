import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { FlightSkeletonList } from '../components/common/LoadingSkeleton';
import NoResults from '../components/common/NoResults';
import { ThreeCloudsCanvas } from '../components/home/ThreeCloudsCanvas';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getServiceSchema } from '../utils/schemas';

// Modular Feature Components
import AirportAutocomplete from '../features/flights/components/AirportAutocomplete';
import FlightCard from '../features/flights/components/FlightCard';
import FlightFilters from '../features/flights/components/FlightFilters';
import FlightFareModal from '../features/flights/components/FlightFareModal';

import { searchLiveFlights, SPECIAL_FARES } from '../services/flightApi';
import { searchRealtimeFlights } from '../services/realtimeDataEngine';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';
import { FaPlane, FaExchangeAlt, FaSpinner, FaSearch } from 'react-icons/fa';

const Flights = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setActiveBooking, formatPrice, addToast, currency } = useBooking();

  // Search Parameters State
  const [fromAirport, setFromAirport] = useState(() => searchParams.get('from') || 'DEL');
  const [toAirport, setToAirport] = useState(() => searchParams.get('to') || 'DXB');
  const [departDate, setDepartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [tripType, setTripType] = useState('one-way'); // 'one-way' | 'round-trip'
  const [selectedSpecialFare, setSelectedSpecialFare] = useState('regular');

  // Filter State
  const [stopsFilter, setStopsFilter] = useState('all'); // 'all' | 'direct' | '1stop'
  const [selectedCabin, setSelectedCabin] = useState('ECONOMY');
  const [maxPrice, setMaxPrice] = useState(1200);
  const [selectedAirlines, setSelectedAirlines] = useState([]);

  // Data & Modal State
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalFlight, setActiveModalFlight] = useState(null);

  // Swap Airports Handler
  const handleSwapAirports = () => {
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
  };

  // Search Execution Handler
  const handleSearch = useCallback(async () => {
    setIsLoading(true);

    try {
      // 1. Attempt RapidAPI Live Search via proxy
      const liveRes = await searchLiveFlights({
        from: fromAirport,
        to: toAirport,
        departDate,
        returnDate: tripType === 'round-trip' ? returnDate : undefined,
        cabinClass: selectedCabin,
        currency: 'USD'
      });

      if (liveRes?.success && Array.isArray(liveRes.data) && liveRes.data.length > 0) {
        setFlights(liveRes.data);
      } else {
        // 2. Reliable Fallback to Verified Real-time Engine
        const fallback = searchRealtimeFlights(fromAirport, toAirport, departDate, selectedCabin);
        setFlights(fallback);
      }
    } catch (err) {
      const fallback = searchRealtimeFlights(fromAirport, toAirport, departDate, selectedCabin);
      setFlights(fallback);
    } finally {
      setIsLoading(false);
    }
  }, [fromAirport, toAirport, departDate, returnDate, tripType, selectedCabin]);

  // Initial Search trigger
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // Unique list of airlines available in current search
  const availableAirlines = useMemo(() => {
    const set = new Set();
    flights.forEach((f) => {
      if (f.airline) set.add(f.airline);
    });
    return Array.from(set);
  }, [flights]);

  const handleToggleAirline = (airline) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]
    );
  };

  const handleResetFilters = () => {
    setStopsFilter('all');
    setSelectedCabin('ECONOMY');
    setMaxPrice(1200);
    setSelectedAirlines([]);
  };

  // Filtered Flights Computation
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      // Stops Filter
      if (stopsFilter === 'direct' && f.stops !== 0) return false;
      if (stopsFilter === '1stop' && f.stops !== 1) return false;

      // Max Price Filter
      if (f.priceUSD > maxPrice) return false;

      // Airlines Filter
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(f.airline)) {
        return false;
      }

      return true;
    });
  }, [flights, stopsFilter, maxPrice, selectedAirlines]);

  // Handle Flight Booking Selection
  const handleSelectFlight = (flight) => {
    setActiveModalFlight(flight);
  };

  const handleConfirmFlightBooking = ({ flight, cabinClass, baggage, totalUSD }) => {
    setActiveModalFlight(null);

    const bookingDraft = {
      serviceType: 'flight',
      itemTitle: `${flight.airline} (${flight.from} ➔ ${flight.to})`,
      provider: flight.airline,
      priceUSD: totalUSD,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
      details: {
        flightNumber: flight.flightNumber,
        from: flight.from,
        to: flight.to,
        fromCity: flight.fromCity,
        toCity: flight.toCity,
        departDate,
        returnDate: tripType === 'round-trip' ? returnDate : null,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        cabinClass,
        baggageAllowance: baggage.name,
      }
    };

    setActiveBooking(bookingDraft);
    addToast(`${flight.airline} selected. Proceeding to verified checkout.`, 'success');
    navigate('/checkout');
  };

  // SEO Schemas
  const flightSchemas = useMemo(() => [
    getWebPageSchema({
      name: 'Book Live Flights — TravelEase Realtime Air Engine',
      description: 'Search and compare live global airline fares with zero convenience fee and verified IATA manifests.',
      url: '/flights',
      breadcrumb: true
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Flights' }
    ], '/flights'),
    getServiceSchema({
      name: 'TravelEase Flight Booking Service',
      description: 'Live global air ticketing engine connecting 16,000+ routes with instant Razorpay booking.',
      serviceType: 'FlightReservation'
    })
  ], []);

  return (
    <div className="relative bg-slate-50 dark:bg-[#0a0e1a] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-500" id="flights-page">
      <JsonLd data={flightSchemas} />

      {/* ─── Hero Section with Cinematic Flying Airliner Backdrop & Atmospheric Cloudscape ─── */}
      <section className="relative min-h-[540px] md:min-h-[580px] w-full overflow-hidden flex items-center justify-center pt-28 pb-20 px-4">
        {/* Cinematic Flying Plane Backdrop with Subtle Cruising Motion */}
        <motion.div
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 14, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute inset-0 z-0 select-none pointer-events-none"
        >
          <img
            src="/hero_flying_plane.jpg"
            alt="Commercial airliner soaring above sunset clouds"
            className="w-full h-full object-cover object-[center_35%] brightness-[0.86] contrast-[1.08] saturate-[1.05]"
          />
          {/* Multilayered Atmospheric Gradients for Dual Light/Dark Legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/40 to-slate-50/90 dark:to-[#0a0e1a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_30%,rgba(6,10,24,0.65)_100%)]" />
        </motion.div>

        {/* Ethereal Floating Clouds & Particle Stars Layer */}
        <ThreeCloudsCanvas className="z-[1] opacity-75" showAirplane={false} />

        <div className="relative z-10 max-w-6xl w-full mx-auto text-center">
          
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>IATA Certified Real-Time Airfares</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[11px] font-mono text-amber-300 shadow-sm">
              <FaPlane className="text-amber-400 rotate-[-20deg] text-xs" />
              <span>Cruising Altitude 38,000 ft · Live Fleet Radar</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-8 drop-shadow-lg">
            Fly Anywhere. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-500">Zero Convenience Fee.</span>
          </h1>

          {/* Master Search Engine Card */}
          <div className="glass-frost p-6 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl text-left backdrop-blur-xl">
            
            {/* Trip Type Tabs */}
            <div className="mb-6">
              <SegmentedPillToggle
                options={[
                  { id: 'one-way', label: 'One Way' },
                  { id: 'round-trip', label: 'Round Trip' }
                ]}
                value={tripType}
                onChange={setTripType}
                layoutId="flightsTripType"
                size="sm"
              />
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              
              {/* Origin Airport Autocomplete */}
              <div className="md:col-span-4">
                <AirportAutocomplete
                  label="From"
                  value={fromAirport}
                  onChange={setFromAirport}
                  type="origin"
                />
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex items-center justify-center pb-2">
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  title="Swap Origin & Destination"
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center border border-white/20 transition-transform active:rotate-180 duration-300"
                >
                  <FaExchangeAlt />
                </button>
              </div>

              {/* Destination Airport Autocomplete */}
              <div className="md:col-span-4">
                <AirportAutocomplete
                  label="To"
                  value={toAirport}
                  onChange={setToAirport}
                  type="destination"
                />
              </div>

              {/* Departure Date */}
              <div className={tripType === 'round-trip' ? "md:col-span-2" : "md:col-span-3"}>
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5">
                  Departure Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className="w-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 min-h-[56px]"
                  />
                </div>
              </div>

              {/* Return Date */}
              {tripType === 'round-trip' && (
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5">
                    Return Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 min-h-[56px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search Button Bar */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              
              {/* Special Fare Concessions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Special:</span>
                <SegmentedPillToggle
                  options={SPECIAL_FARES.slice(0, 3).map((fare) => ({
                    id: fare.id,
                    label: fare.label,
                  }))}
                  value={selectedSpecialFare}
                  onChange={setSelectedSpecialFare}
                  layoutId="flightsSpecialFares"
                  size="sm"
                />
              </div>

              <ThreeUIButton
                type="button"
                variant="amber-glow"
                size="lg"
                onClick={handleSearch}
                disabled={isLoading}
                icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                className="ml-auto"
              >
                Search Live Flights
              </ThreeUIButton>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Main Results Content ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Column: Modular Filter Sidebar */}
          <div className="lg:col-span-1">
            <FlightFilters
              stopsFilter={stopsFilter}
              setStopsFilter={setStopsFilter}
              selectedCabin={selectedCabin}
              setSelectedCabin={setSelectedCabin}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              availableAirlines={availableAirlines}
              selectedAirlines={selectedAirlines}
              onToggleAirline={handleToggleAirline}
              onResetFilters={handleResetFilters}
              formatPrice={formatPrice}
              totalResultsCount={filteredFlights.length}
            />
          </div>

          {/* Right Column: Flight Cards Feed */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Results Header Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Available Flights ({filteredFlights.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {fromAirport} ➔ {toAirport} · {departDate}
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                ₹0 Convenience Fee Guaranteed
              </span>
            </div>

            {/* Loading Skeleton */}
            {isLoading ? (
              <FlightSkeletonList count={4} />
            ) : filteredFlights.length === 0 ? (
              <NoResults
                type="no-flights"
                serviceName="Flight Routes"
                searchQuery={`${fromAirport} to ${toAirport}`}
                suggestions={[
                  { label: 'Reset Filter Criteria', onClick: handleResetFilters },
                  { label: 'Search Popular Corridor (DEL ➔ DXB)', onClick: () => { setFromAirport('DEL'); setToAirport('DXB'); } }
                ]}
              />
            ) : (
              <div className="space-y-4">
                {filteredFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    onSelect={handleSelectFlight}
                    formatPrice={formatPrice}
                    currency={currency}
                  />
                ))}
              </div>
            )}

          </div>

        </div>
      </main>

      {/* ─── Cabin & Baggage Upgrade Modal ───────────────────────────────── */}
      <FlightFareModal
        flight={activeModalFlight}
        isOpen={Boolean(activeModalFlight)}
        onClose={() => setActiveModalFlight(null)}
        onConfirmBooking={handleConfirmFlightBooking}
        formatPrice={formatPrice}
        currency={currency}
      />

    </div>
  );
};

export default Flights;
