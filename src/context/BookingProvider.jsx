import React, { useState, useEffect } from 'react';
import { formatCurrency, generateBookingReference } from '../services/realtimeDataEngine';
import api from '../services/api';
import { BookingContext } from './BookingContext';

// Initial rich multi-modal seed bookings for MMT-grade interactive experience
const DEFAULT_SEED_BOOKINGS = [
  {
    bookingId: 'AI-8902B',
    type: 'flight',
    serviceType: 'flight',
    provider: 'Air India',
    airlineCode: 'AI',
    flightNumber: 'AI 805',
    serviceTitle: 'Delhi (DEL) → Mumbai (BOM)',
    origin: 'New Delhi (DEL)',
    originCode: 'DEL',
    originTerminal: 'Terminal 3',
    destination: 'Mumbai (BOM)',
    destinationCode: 'BOM',
    destinationTerminal: 'Terminal 2',
    departureDate: '2026-09-22',
    departureTime: '07:15 AM',
    arrivalDate: '2026-09-22',
    arrivalTime: '09:30 AM',
    duration: '2h 15m',
    flightType: 'Non-stop',
    cabinClass: 'Economy Prime',
    seat: '12A (Window)',
    gate: '42B',
    boardingPassReady: true,
    pnr: 'AI8902B',
    passengerName: 'Alex Johnson',
    passengerCount: 1,
    baggage: '15 kg Check-in + 7 kg Cabin',
    meal: 'Hot Breakfast Included',
    amountUSD: 94,
    totalUSD: 94,
    currency: 'INR',
    amount: 7850,
    status: 'Confirmed',
    createdAt: '2026-09-12'
  },
  {
    bookingId: 'IR-2849105432',
    type: 'train',
    serviceType: 'train',
    provider: 'Indian Railways (IRCTC)',
    trainNumber: '22436',
    trainName: 'Vande Bharat Express',
    serviceTitle: 'Vande Bharat Express (22436)',
    origin: 'New Delhi (NDLS)',
    originCode: 'NDLS',
    originPlatform: 'Platform 16',
    destination: 'Varanasi Junction (BSB)',
    destinationCode: 'BSB',
    destinationPlatform: 'Platform 1',
    departureDate: '2026-09-28',
    departureTime: '06:00 AM',
    arrivalDate: '2026-09-28',
    arrivalTime: '02:00 PM',
    duration: '8h 00m',
    classType: 'Executive Class (EC)',
    coach: 'E1',
    berth: '18 (Window Seat)',
    chartStatus: 'Chart Prepared • Confirmed',
    pnr: '2849105432',
    passengerName: 'Alex Johnson',
    passengerCount: 1,
    catering: 'Complimentary Morning Tea & Lunch',
    amountUSD: 36,
    totalUSD: 36,
    currency: 'INR',
    amount: 3020,
    status: 'Confirmed',
    createdAt: '2026-09-10'
  },
  {
    bookingId: 'HTL-89104',
    type: 'hotel',
    serviceType: 'hotel',
    provider: 'The Oberoi Hotels & Resorts',
    serviceTitle: 'The Oberoi Amarvilas, Agra',
    hotelName: 'The Oberoi Amarvilas, Agra',
    starRating: 5,
    location: 'Taj East Gate Road, Agra, India',
    roomType: 'Premier Taj View Luxury Room',
    checkInDate: '2026-08-15',
    checkOutDate: '2026-08-17',
    checkInTime: '02:00 PM',
    checkOutTime: '12:00 PM',
    nights: 2,
    guests: '2 Adults',
    amenities: ['Taj Mahal View Balcony', 'Butler Service', 'Complimentary Champagne & Breakfast', 'Free Wi-Fi'],
    pnr: 'OBR-AGRA-89104',
    passengerName: 'Alex Johnson',
    amountUSD: 520,
    totalUSD: 520,
    currency: 'INR',
    amount: 43500,
    status: 'Completed',
    createdAt: '2026-08-01'
  },
  {
    bookingId: 'CAB-77120',
    type: 'car',
    serviceType: 'car',
    provider: 'Uber Intercity Premier',
    serviceTitle: 'DEL Airport to Gurugram Cyber City',
    vehicleModel: 'Toyota Camry Hybrid (Sedan)',
    driverName: 'Rajesh Sharma',
    driverRating: '4.92 ★ (1,240 trips)',
    pickupDate: '2026-09-02',
    pickupTime: '11:45 AM',
    dropoffTime: '12:35 PM',
    distance: '18.4 km',
    pnr: 'UBER-IND-77120',
    passengerName: 'Alex Johnson',
    amountUSD: 18,
    totalUSD: 18,
    currency: 'INR',
    amount: 1480,
    status: 'Completed',
    createdAt: '2026-09-02'
  },
  {
    bookingId: 'BUS-33910',
    type: 'bus',
    serviceType: 'bus',
    provider: 'Zingbus Electric Premium',
    serviceTitle: 'Delhi (Kashmere Gate) → Manali Mall Road',
    busType: 'Volvo AC Multi-Axle Sleeper (2+1)',
    origin: 'ISBT Kashmere Gate, Delhi',
    destination: 'Private Bus Stand, Manali',
    departureDate: '2026-07-10',
    departureTime: '08:30 PM',
    arrivalDate: '2026-07-11',
    arrivalTime: '09:00 AM',
    seat: 'Upper Berth U4',
    pnr: 'ZING-DEL-MNL-33910',
    passengerName: 'Alex Johnson',
    amountUSD: 24,
    totalUSD: 24,
    currency: 'INR',
    amount: 1980,
    status: 'Cancelled',
    refundStatus: 'Full Refund Processed (₹1,980 to Original Source)',
    createdAt: '2026-07-02'
  }
];

export const BookingProvider = ({ children }) => {
  // Global Currency State: 'USD', 'EUR', 'GBP', 'INR'
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('travelease_currency') || 'USD';
  });

  // User Saved Bookings (Hydrated with real interactive multi-modal seed if empty)
  const [userBookings, setUserBookings] = useState(() => {
    const saved = localStorage.getItem('travelease_user_bookings');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* fallback to default */ }
    }
    return DEFAULT_SEED_BOOKINGS;
  });

  // Current Active Booking Draft in progress (Flight, Hotel, Car, Train, etc.)
  const [activeBooking, setActiveBooking] = useState(null);

  // Active Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Sync currency to local storage
  useEffect(() => {
    localStorage.setItem('travelease_currency', currency);
  }, [currency]);

  // Sync bookings to local storage
  useEffect(() => {
    localStorage.setItem('travelease_user_bookings', JSON.stringify(userBookings));
  }, [userBookings]);

  // Toast notification trigger
  const addToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Convert USD price to current currency format string
  const formatPrice = (amountUSD) => {
    return formatCurrency(amountUSD, currency);
  };

  // Process and finalize a new booking transaction
  const confirmBooking = (bookingData) => {
    const bId = bookingData.bookingId || generateBookingReference('TE');
    const newBooking = {
      bookingId: bId,
      ...bookingData,
      status: 'Confirmed',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUserBookings(prev => [newBooking, ...prev]);
    setActiveBooking(null);
    addToast(`Booking ${newBooking.bookingId} confirmed successfully!`, 'success');

    // Asynchronously synchronize with centralized backend database
    api.post('/bookings', {
      bookingId: newBooking.bookingId,
      customerEmail: newBooking.customerEmail || localStorage.getItem('travelease_user_email') || 'traveler@travelease.com',
      customerName: newBooking.passengerName || newBooking.customerName || 'Valued Traveler',
      customerPhone: newBooking.customerPhone || '',
      serviceType: newBooking.type || newBooking.serviceType || 'tour',
      provider: newBooking.provider || 'TravelEase Direct',
      serviceTitle: newBooking.serviceTitle || newBooking.title || 'Travel Booking',
      details: newBooking.details || {},
      amount: newBooking.amount || newBooking.totalUSD || newBooking.priceUSD || 100,
      currency: newBooking.currency || currency || 'USD',
      amountUSD: newBooking.totalUSD || newBooking.priceUSD || 100,
      paymentMethod: newBooking.paymentMethod || 'Instant Pay',
      image: newBooking.image || '',
      qrCodeData: `TRAVELEASE-CONFIRMED-${newBooking.bookingId}`
    }).catch(() => {
      // Local reservation safely cached in offline/dev fallback
    });

    return newBooking;
  };

  // Search History State
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('travelease_search_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem('travelease_recently_viewed');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  // Sync search history & recently viewed to localStorage
  useEffect(() => {
    localStorage.setItem('travelease_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('travelease_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addToSearchHistory = (searchItem) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(s => s.query !== searchItem.query);
      return [{ ...searchItem, timestamp: Date.now() }, ...filtered].slice(0, 10);
    });
  };

  const clearSearchHistory = () => setSearchHistory([]);

  const addToRecentlyViewed = (item) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      return [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, 10);
    });
  };

  const clearRecentlyViewed = () => setRecentlyViewed([]);

  // Update booking lifecycle state: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'
  const updateBookingStatus = (bookingId, newStatus) => {
    setUserBookings(prev =>
      prev.map(b => b.bookingId === bookingId ? { ...b, status: newStatus } : b)
    );
    api.put(`/bookings/${bookingId}/status`, { status: newStatus }).catch(() => {});
    addToast(`Booking ${bookingId} status changed to ${newStatus}.`, 'info');
  };

  // Cancel booking
  const cancelBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'Cancelled');
  };

  return (
    <BookingContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        userBookings,
        activeBooking,
        setActiveBooking,
        confirmBooking,
        cancelBooking,
        updateBookingStatus,
        searchHistory,
        addToSearchHistory,
        clearSearchHistory,
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
        toasts,
        addToast
      }}
    >
      {children}
      
      {/* Dynamic Toast Renderer */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl text-white font-medium text-sm flex items-center justify-between transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
              toast.type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
              'bg-gradient-to-r from-blue-600 to-indigo-700'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </BookingContext.Provider>
  );
};

export default BookingProvider;
