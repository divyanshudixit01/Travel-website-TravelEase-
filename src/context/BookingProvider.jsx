import React, { useState, useEffect } from 'react';
import { formatCurrency, generateBookingReference } from '../services/realtimeDataEngine';
import api from '../services/api';
import { BookingContext } from './BookingContext';

export const BookingProvider = ({ children }) => {
  // Global Currency State: 'USD', 'EUR', 'GBP', 'INR'
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('travelease_currency') || 'USD';
  });

  // User Saved Bookings
  const [userBookings, setUserBookings] = useState(() => {
    const saved = localStorage.getItem('travelease_user_bookings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
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
