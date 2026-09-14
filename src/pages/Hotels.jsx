import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { HOTELS_DATA, searchRealtimeHotels } from '../services/realtimeDataEngine';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { FaSearch, FaCalendarAlt, FaUserFriends, FaDoorOpen, FaSpinner } from 'react-icons/fa';

const Hotels = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setActiveBooking, formatPrice, addToast, currency } = useBooking();

  // Search parameters
  const [destination, setDestination] = useState(() => searchParams.get('city') || 'Dubai');
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

  // Filters State
  const [starFilter, setStarFilter] = useState('all'); // 'all' | '3' | '4' | '5'
  const [maxPrice, setMaxPrice] = useState(600);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Data & Modal State
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalHotel, setActiveModalHotel] = useState(null);

  // Search Handler
  const handleSearch = useCallback(async () => {
    setIsLoading(true);

    try {
      // 1. Attempt Live Hotel Search
      const liveRes = await searchGoogleHotels({
        query: destination,
        checkIn,
        checkOut,
        adults: guestsCount,
        currency: 'USD'
      });

      if (liveRes?.success && Array.isArray(liveRes.data) && liveRes.data.length > 0) {
        setHotels(liveRes.data);
      } else {
        // 2. Reliable Fallback to Verified Local Engine
        const fallback = searchRealtimeHotels(destination);
        setHotels(fallback.length > 0 ? fallback : HOTELS_DATA);
      }
    } catch (err) {
      const fallback = searchRealtimeHotels(destination);
      setHotels(fallback.length > 0 ? fallback : HOTELS_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [destination, checkIn, checkOut, guestsCount]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleToggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setStarFilter('all');
    setMaxPrice(600);
    setSelectedAmenities([]);
  };

  // Filtered Hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      // Star Filter
      if (starFilter !== 'all') {
        const requiredStars = Number(starFilter);
        if (Math.floor(h.starRating || 0) < requiredStars) return false;
      }

      // Max Price Filter
      const price = h.pricePerNightUSD || 120;
      if (price > maxPrice) return false;

      // Amenities Filter
      if (selectedAmenities.length > 0) {
        const hotelAmenities = (h.amenities || []).map((a) => a.toLowerCase());
        const matchesAll = selectedAmenities.every((sa) =>
          hotelAmenities.some((ha) => ha.includes(sa.toLowerCase()))
        );
        if (!matchesAll) return false;
      }

      return true;
    });
  }, [hotels, starFilter, maxPrice, selectedAmenities]);

  // Handle Room Booking
  const handleSelectHotel = (hotel) => {
    setActiveModalHotel(hotel);
  };

  const handleConfirmRoomBooking = ({ hotel, room, nights, totalUSD }) => {
    setActiveModalHotel(null);

    const bookingDraft = {
      serviceType: 'hotel',
      itemTitle: `${hotel.name} — ${room.name}`,
      provider: hotel.name,
      priceUSD: totalUSD,
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
        pricePerNightUSD: room.priceUSD || hotel.pricePerNightUSD || 120
      }
    };

    setActiveBooking(bookingDraft);
    addToast(`${hotel.name} room selected! Proceeding to verified checkout.`, 'success');
    navigate('/checkout');
  };

  // SEO Schemas
  const hotelSchemas = [
    getWebPageSchema({
      name: 'Book Luxury Hotels & Resorts — TravelEase Verified Network',
      description: 'Reserve 5-star suites and boutique heritage retreats with free cancellation and verified hospitality rates.',
      url: '/hotels',
      breadcrumb: true
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Hotels' }
    ], '/hotels'),
    getServiceSchema({
      name: 'TravelEase Hotel Reservation Engine',
      description: 'Curated hotel & resort reservation engine with transparent room-level rates and instant confirmation.',
      serviceType: 'LodgingReservation'
    })
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#0a0e1a] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-500" id="hotels-page">
      <JsonLd data={hotelSchemas} />

      {/* ─── Hero Section with Visual Luxury Imagery ───────────────────────── */}
      <section className="relative min-h-[460px] w-full overflow-hidden flex items-center justify-center pt-24 pb-16 px-4">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury Hotels Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-50 dark:to-[#0a0e1a]" />
        </div>

        <div className="relative z-10 max-w-6xl w-full mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Verified 5-Star & Heritage Stays</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-8 drop-shadow-md">
            Extraordinary Hotels. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">Uncompromised Luxury.</span>
          </h1>

          {/* Master Hotel Search Card */}
          <div className="glass-frost p-6 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl text-left backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              
              {/* Destination Autocomplete */}
              <div className="md:col-span-4">
                <DestinationAutocomplete
                  value={destination}
                  onChange={setDestination}
                  placeholder="Where are you staying?"
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

            {/* Bottom Search Trigger */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/80 font-semibold hidden sm:inline-block">
                All bookings include zero booking fees & 24/7 concierge support.
              </span>

              <ThreeUIButton
                type="button"
                variant="amber-glow"
                size="lg"
                onClick={handleSearch}
                disabled={isLoading}
                icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                className="ml-auto"
              >
                Find Hotels
              </ThreeUIButton>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Main Results Feed ────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Column: Modular Hotel Filters */}
          <div className="lg:col-span-1">
            <HotelFilters
              starFilter={starFilter}
              setStarFilter={setStarFilter}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              selectedAmenities={selectedAmenities}
              onToggleAmenity={handleToggleAmenity}
              onResetFilters={handleResetFilters}
              formatPrice={formatPrice}
              totalResultsCount={filteredHotels.length}
            />
          </div>

          {/* Right Column: Hotel Listings */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Results Title Banner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Properties in {destination} ({filteredHotels.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {checkIn} to {checkOut} · {guestsCount} Guests
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Rate Parity Guaranteed
              </span>
            </div>

            {/* Skeletons or Cards Feed */}
            {isLoading ? (
              <HotelSkeletonList count={3} />
            ) : filteredHotels.length === 0 ? (
              <NoResults
                type="no-hotels"
                serviceName="Hotels & Resorts"
                searchQuery={destination}
                suggestions={[
                  { label: 'Reset Filter Slabs', onClick: handleResetFilters },
                  { label: 'Explore Dubai Luxury Hotels', onClick: () => setDestination('Dubai') },
                  { label: 'Browse Mumbai Heritage Hotels', onClick: () => setDestination('Mumbai') }
                ]}
              />
            ) : (
              <div className="space-y-6">
                {filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onSelect={handleSelectHotel}
                    formatPrice={formatPrice}
                    currency={currency}
                  />
                ))}
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
        checkIn={checkIn}
        checkOut={checkOut}
        formatPrice={formatPrice}
        currency={currency}
      />

    </div>
  );
};

export default Hotels;
