import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { HotelSkeletonList } from '../components/common/LoadingSkeleton';
import NoResults from '../components/common/NoResults';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getServiceSchema } from '../utils/schemas';

// Modular Feature Components
import DestinationAutocomplete from '../features/hotels/components/DestinationAutocomplete';
import HotelCard from '../features/hotels/components/HotelCard';
import HotelFilters from '../features/hotels/components/HotelFilters';
import HotelRoomSelectorModal from '../features/hotels/components/HotelRoomSelectorModal';

import { searchGoogleHotels } from '../services/hotelApi';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { 
  getTrainsRoute, 
  getFlightsRoute, 
  getExploreRoute, 
  getItineraryRoute, 
  getDestinationsRoute, 
  hasTrainNetwork 
} from '../utils/travelBridge';
import {
  FaSearch,
  FaCalendarAlt,
  FaUserFriends,
  FaDoorOpen,
  FaSpinner,
  FaSortAmountDown,
  FaCheckCircle,
  FaRupeeSign,
  FaDollarSign,
  FaChevronLeft,
  FaChevronRight,
  FaHotel,
  FaShieldAlt,
  FaTrain,
  FaPlane,
  FaRoute,
  FaMapMarkerAlt
} from 'react-icons/fa';

const Hotels = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setActiveBooking, addToast } = useBooking();

  // Search parameters
  const [destination, setDestination] = useState(() =>
    searchParams.get('destination') || searchParams.get('city') || searchParams.get('q') || 'Varanasi'
  );

  // Check-in & check-out dates (default +3 days and +6 days)
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  });
  const [guestsCount, setGuestsCount] = useState(2);
  const [roomsCount, setRoomsCount] = useState(1);

  // Currency: Default to INR (₹) as chosen by user, with toggle to USD ($)
  const [displayCurrency, setDisplayCurrency] = useState('INR');

  // Filters State
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all'); // 'all' | 'RESORT' | 'BUDGET_STAY' | 'HOTEL'
  const [starFilter, setStarFilter] = useState('all'); // 'all' | '3' | '4' | '5'
  const [maxPrice, setMaxPrice] = useState(30000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price_low' | 'price_high' | 'rating'

  // Pagination & Data State
  const [hotels, setHotels] = useState([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeEngine, setActiveEngine] = useState('LiteAPI Real-Time Engine');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalHotel, setActiveModalHotel] = useState(null);

  // Sync destination if URL query changes
  useEffect(() => {
    const queryCity = searchParams.get('destination') || searchParams.get('city') || searchParams.get('q');
    if (queryCity && queryCity !== destination) {
      setDestination(queryCity);
      setCurrentPage(1);
    }
  }, [searchParams, destination]);

  // Search Handler — 100% Real-Time Backend API (Zero Hardcoded Array Fallbacks)
  const handleSearch = useCallback(async (page = 1) => {
    setIsLoading(true);

    try {
      const liveRes = await searchGoogleHotels({
        destination: destination.trim() || 'Varanasi',
        checkIn,
        checkOut,
        adults: guestsCount,
        rooms: roomsCount,
        currency: displayCurrency,
        property_type: propertyTypeFilter,
        page,
        limit: 20
      });

      if (liveRes?.success && Array.isArray(liveRes.properties) && liveRes.properties.length > 0) {
        setHotels(liveRes.properties);
        setTotalAvailable(liveRes.total_available || liveRes.properties.length);
        setCurrentPage(liveRes.page || page);
        setTotalPages(liveRes.total_pages || Math.ceil((liveRes.total_available || liveRes.properties.length) / 20));
        setActiveEngine(liveRes.engine || 'LiteAPI Real-Time Engine');
      } else {
        setHotels([]);
        setTotalAvailable(0);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('[Hotels Page Search Error]:', err);
      setHotels([]);
      setTotalAvailable(0);
    } finally {
      setIsLoading(false);
    }
  }, [destination, checkIn, checkOut, guestsCount, roomsCount, displayCurrency, propertyTypeFilter]);

  // Trigger search on mount and when core parameters change
  useEffect(() => {
    handleSearch(1);
  }, [handleSearch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      handleSearch(newPage);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleToggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setStarFilter('all');
    setPropertyTypeFilter('all');
    setMaxPrice(displayCurrency === 'INR' ? 30000 : 500);
    setSelectedAmenities([]);
    setSortBy('recommended');
  };

  // Filtered & Sorted Hotels
  const filteredAndSortedHotels = useMemo(() => {
    let result = hotels.filter((h) => {
      // Star Filter
      if (starFilter !== 'all') {
        const requiredStars = Number(starFilter);
        if (Math.floor(h.starRating || 0) < requiredStars) return false;
      }

      // Max Price Filter
      const price = h.priceAmount || 3200;
      if (price > maxPrice) return false;

      // Amenities Filter
      if (selectedAmenities.length > 0) {
        const hotelAmenities = (h.allAmenities || h.amenities || []).map((a) => a.toLowerCase());
        const matchesAll = selectedAmenities.every((sa) =>
          hotelAmenities.some((ha) => ha.includes(sa.toLowerCase()))
        );
        if (!matchesAll) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price_low') {
      result.sort((a, b) => (a.priceAmount || 0) - (b.priceAmount || 0));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => (b.priceAmount || 0) - (a.priceAmount || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
    }

    return result;
  }, [hotels, starFilter, maxPrice, selectedAmenities, sortBy]);

  // Handle Room Selection & Modal
  const handleSelectHotel = (hotel) => {
    setActiveModalHotel(hotel);
  };

  // Action A: In-App TravelEase Dual Booking
  const handleConfirmRoomBooking = ({ hotel, room, nights, totalAmount, totalUSD, currency }) => {
    setActiveModalHotel(null);

    const bookingDraft = {
      serviceType: 'hotel',
      itemTitle: `${hotel.name} — ${room.name}`,
      provider: hotel.name,
      amount: totalAmount,
      totalUSD: totalUSD || Math.round(totalAmount / 85),
      priceUSD: totalUSD || Math.round(totalAmount / 85),
      currency: currency || displayCurrency,
      image: hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      details: {
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomName: room.name,
        location: `${hotel.city}, ${hotel.country}`,
        checkIn,
        checkOut,
        nights,
        guests: guestsCount,
        roomsCount,
        bedType: room.bed || '1 King Bed',
        pricePerNight: room.priceAmount || hotel.priceAmount || 3200,
        gstTax: Math.round(totalAmount * 0.12),
        bookingMode: 'TravelEase In-App Verified Voucher'
      }
    };

    setActiveBooking(bookingDraft);
    addToast(`${hotel.name} reserved! Proceeding to verified checkout.`, 'success');
    navigate('/checkout');
  };

  // Action B: External Partner Hand-off
  const handlePartnerBooking = ({ hotel, _room }) => {
    const partnerUrl = hotel.booking_providers?.[0]?.booking_url ||
      `https://www.google.com/travel/hotels?q=${encodeURIComponent(hotel.name + ' ' + (hotel.city || ''))}`;
    addToast(`Redirecting to official partner rate for ${hotel.name}...`, 'info');
    window.open(partnerUrl, '_blank', 'noopener,noreferrer');
  };

  // SEO Schemas
  const hotelSchemas = [
    getWebPageSchema({
      name: `Hotels & Resorts in ${destination} — TravelEase Real-Time Travel Engine`,
      description: `Compare verified hotels, resorts, and heritage stays in ${destination} with live wholesale rates in INR.`,
      url: '/hotels',
      breadcrumb: true
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Hotels' }
    ], '/hotels'),
    getServiceSchema({
      name: 'TravelEase Real-Time Hotel Reservation Engine',
      description: 'Zero-failure real-time lodging search & booking engine powered by LiteAPI and Pan-India Master Catalog.',
      serviceType: 'LodgingReservation'
    })
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#0a0e1a] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-500" id="hotels-page">
      <JsonLd data={hotelSchemas} />

      {/* ─── Hero Section with Modern Search Dock ───────────────────────────── */}
      <section className="relative min-h-[460px] w-full overflow-hidden flex items-center justify-center pt-24 pb-16 px-4">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Hotels Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-slate-50 dark:to-[#0a0e1a]" />
        </div>

        <div className="relative z-10 max-w-6xl w-full mx-auto text-center">
          
          {/* Top Live Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Real-Time Wholesale Hotel Engine • Pan-India</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-8 drop-shadow-md">
            Extraordinary Hotels. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">Guaranteed Real Rates.</span>
          </h1>

          {/* Master Hotel Search Card */}
          <div className="glass-frost p-6 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl text-left backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              
              {/* Destination Autocomplete */}
              <div className="md:col-span-4">
                <DestinationAutocomplete
                  value={destination}
                  onChange={(city) => {
                    setDestination(city);
                    setSearchParams({ destination: city });
                  }}
                  placeholder="Where are you staying in India?"
                />
              </div>

              {/* Check-In Date */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <FaCalendarAlt className="text-amber-500 text-xs" /> Check-In
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 min-h-[56px]"
                />
              </div>

              {/* Check-Out Date */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <FaCalendarAlt className="text-amber-500 text-xs" /> Check-Out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 min-h-[56px]"
                />
              </div>

              {/* Guests Count */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <FaUserFriends className="text-indigo-500 text-xs" /> Guests
                </label>
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 min-h-[56px]"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4+ Guests</option>
                </select>
              </div>

              {/* Rooms Count */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                  <FaDoorOpen className="text-amber-500 text-xs" /> Rooms
                </label>
                <select
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(Number(e.target.value))}
                  className="w-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400 min-h-[56px]"
                >
                  <option value={1}>1 Room</option>
                  <option value={2}>2 Rooms</option>
                  <option value={3}>3 Rooms</option>
                  <option value={4}>4+ Rooms</option>
                </select>
              </div>

            </div>

            {/* Bottom Search Trigger & Currency Switcher */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/80 font-semibold hidden sm:inline-block">
                  Display Currency:
                </span>
                <div className="inline-flex rounded-xl p-0.5 bg-black/40 border border-white/20">
                  <button
                    type="button"
                    onClick={() => setDisplayCurrency('INR')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all ${
                      displayCurrency === 'INR'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-white hover:text-amber-300'
                    }`}
                  >
                    <FaRupeeSign className="text-[10px]" /> INR (₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayCurrency('USD')}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all ${
                      displayCurrency === 'USD'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-white hover:text-amber-300'
                    }`}
                  >
                    <FaDollarSign className="text-[10px]" /> USD ($)
                  </button>
                </div>
              </div>

              <ThreeUIButton
                type="button"
                variant="amber-glow"
                size="lg"
                onClick={() => handleSearch(1)}
                disabled={isLoading}
                icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                className="w-full sm:w-auto"
              >
                Find Hotels
              </ThreeUIButton>
            </div>

          </div>

        </div>
      </section>
 
      {/* ─── Cross-Service Dynamic Travel Ecosystem Bar ─────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-sky-500/10 border border-slate-200/80 dark:border-white/10 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              Cross-Service Travel Hub for <span className="text-amber-500 font-extrabold">{destination}</span>:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hasTrainNetwork(destination) && (
              <Link
                to={getTrainsRoute(destination)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <FaTrain className="w-3 h-3 text-purple-500" /> Tatkal Trains
              </Link>
            )}
            <Link
              to={getFlightsRoute(destination)}
              className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-600 dark:text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FaPlane className="w-3 h-3 text-sky-500" /> Live Flights
            </Link>
            <Link
              to={getExploreRoute(destination)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FaMapMarkerAlt className="w-3 h-3 text-amber-500" /> Live Map
            </Link>
            <Link
              to={getItineraryRoute(destination)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FaRoute className="w-3 h-3 text-emerald-500" /> AI Itinerary
            </Link>
            <Link
              to={getDestinationsRoute(destination)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              Packages
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Main Results Feed ────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Column: Modular Hotel Filters */}
          <div className="lg:col-span-1">
            <HotelFilters
              starFilter={starFilter}
              setStarFilter={setStarFilter}
              propertyTypeFilter={propertyTypeFilter}
              setPropertyTypeFilter={setPropertyTypeFilter}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              currency={displayCurrency}
              priceRangeLimit={displayCurrency === 'INR' ? 35000 : 600}
              selectedAmenities={selectedAmenities}
              onToggleAmenity={handleToggleAmenity}
              onResetFilters={handleResetFilters}
              totalResultsCount={filteredAndSortedHotels.length}
            />
          </div>

          {/* Right Column: Hotel Listings & Sort Bar */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Results Title & Sorting Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FaHotel className="text-amber-500" />
                  <span>Stays in {destination}</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {totalAvailable} verified
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {checkIn} to {checkOut} · {guestsCount} Guests · {roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'}
                </p>
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline-block flex items-center gap-1">
                  <FaSortAmountDown className="text-[10px]" /> Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="recommended">Recommended / Popular</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Top Rated First</option>
                </select>
              </div>
            </div>

            {/* Engine & Transparency Notice */}
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1.5 font-bold">
                <FaShieldAlt className="text-amber-500" />
                <span>Powered by {activeEngine}</span>
              </span>
              <span className="text-[11px] font-medium hidden sm:inline-block">
                Transparent MMT-Grade Tariff • Zero Hidden Charges
              </span>
            </div>

            {/* Skeletons or Cards Feed */}
            {isLoading ? (
              <HotelSkeletonList count={4} />
            ) : filteredAndSortedHotels.length === 0 ? (
              <NoResults
                type="no-hotels"
                serviceName="Hotels & Resorts"
                searchQuery={destination}
                suggestions={[
                  { label: 'Reset Filter Slabs', onClick: handleResetFilters },
                  { label: 'Explore Varanasi Stays', onClick: () => setDestination('Varanasi') },
                  { label: 'Explore Ayodhya Stays', onClick: () => setDestination('Ayodhya') },
                  { label: 'Explore Goa Resorts', onClick: () => setDestination('Goa') }
                ]}
              />
            ) : (
              <div className="space-y-5">
                {filteredAndSortedHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onSelect={handleSelectHotel}
                    currency={displayCurrency}
                  />
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mt-8">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Page {currentPage} of {totalPages} ({totalAvailable} total hotels)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || isLoading}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                        <FaChevronLeft className="text-[10px]" /> Previous
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || isLoading}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                      >
                        Next <FaChevronRight className="text-[10px]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </main>

      {/* ─── Room Selector Modal ─────────────────────────────────────────── */}
      <HotelRoomSelectorModal
        hotel={activeModalHotel}
        isOpen={Boolean(activeModalHotel)}
        onClose={() => setActiveModalHotel(null)}
        onConfirmBooking={handleConfirmRoomBooking}
        onPartnerBooking={handlePartnerBooking}
        checkIn={checkIn}
        checkOut={checkOut}
        guestsCount={guestsCount}
        roomsCount={roomsCount}
        currency={displayCurrency}
      />

    </div>
  );
};

export default Hotels;
