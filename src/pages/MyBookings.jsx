import React, { useState, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import AuthContext from '../context/AuthContext';
import { 
  FaTicketAlt, FaSearch, FaPlane, FaTrain, FaHotel, FaCar, FaBus, 
  FaCheckCircle, FaDownload, FaArrowLeft, FaSuitcase, FaCopy, FaCheck,
  FaCalendarAlt, FaTimes, FaShieldAlt, FaExclamationTriangle
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema } from '../utils/schemas';
import { BookingTicketModal } from '../components/bookings/BookingTicketModal';

const MyBookings = () => {
  const { userBookings, cancelBooking, addToast } = useBooking();
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [selectedService, setSelectedService] = useState('all'); // 'all' | 'flight' | 'train' | 'hotel' | 'car' | 'bus'
  
  // Modals
  const [ticketModalBooking, setTicketModalBooking] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [copiedPnr, setCopiedPnr] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPnr(text);
    addToast(`Copied PNR ${text} to clipboard`, 'info');
    setTimeout(() => setCopiedPnr(''), 3000);
  };

  const handleConfirmCancel = (bookingId) => {
    cancelBooking(bookingId);
    setCancellingBookingId(null);
    addToast(`Reservation ${bookingId} has been cancelled successfully.`, 'success');
  };

  // Filter logic
  const filteredBookings = useMemo(() => {
    return userBookings.filter((booking) => {
      // 1. Status Filter
      if (statusTab === 'upcoming' && booking.status !== 'Confirmed') return false;
      if (statusTab === 'completed' && booking.status !== 'Completed') return false;
      if (statusTab === 'cancelled' && booking.status !== 'Cancelled') return false;

      // 2. Service Category Filter
      if (selectedService !== 'all') {
        const bType = booking.type || booking.serviceType;
        if (bType !== selectedService) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const pnr = (booking.pnr || booking.bookingId || '').toLowerCase();
        const title = (booking.serviceTitle || booking.title || '').toLowerCase();
        const provider = (booking.provider || '').toLowerCase();
        const origin = (booking.origin || '').toLowerCase();
        const dest = (booking.destination || '').toLowerCase();
        const hotel = (booking.hotelName || '').toLowerCase();

        return pnr.includes(query) || title.includes(query) || provider.includes(query) || 
               origin.includes(query) || dest.includes(query) || hotel.includes(query);
      }

      return true;
    });
  }, [userBookings, statusTab, selectedService, searchQuery]);

  const upcomingCount = userBookings.filter(b => b.status === 'Confirmed').length;
  const completedCount = userBookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = userBookings.filter(b => b.status === 'Cancelled').length;

  const getServiceBadge = (type) => {
    switch (type) {
      case 'flight':
        return { label: 'Flight', icon: <FaPlane />, color: 'bg-sky-500/15 text-sky-500 border-sky-500/30' };
      case 'train':
        return { label: 'IRCTC Train', icon: <FaTrain />, color: 'bg-amber-500/15 text-amber-500 border-amber-500/30' };
      case 'hotel':
        return { label: 'Stay / Resort', icon: <FaHotel />, color: 'bg-purple-500/15 text-purple-500 border-purple-500/30' };
      case 'car':
        return { label: 'Cab & Rental', icon: <FaCar />, color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' };
      case 'bus':
        return { label: 'Express Bus', icon: <FaBus />, color: 'bg-rose-500/15 text-rose-500 border-rose-500/30' };
      default:
        return { label: 'Trip', icon: <FaSuitcase />, color: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30' };
    }
  };

  const schemas = [
    getWebPageSchema({
      name: 'Manage All Bookings & Vouchers',
      description: 'Look up reservations, download vouchers, view boarding passes, and manage check-in details with instant confirmation.',
      url: '/my-bookings',
      breadcrumb: true
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'My Bookings', url: '/my-bookings' }
    ], '/my-bookings')
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white pt-32 pb-20 px-4 transition-colors duration-500 flex items-center justify-center" id="my-bookings-auth-gate">
        <JsonLd data={schemas} />
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#121422] border border-slate-200 dark:border-white/10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 text-2xl shadow-inner">
            <FaShieldAlt />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
              Authentication Required
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Sign In to View Bookings
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Please sign in with your TravelEase credentials or create a new account to view your confirmed tickets, boarding passes, and booking history.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/login', { state: { from: { pathname: '/my-bookings' } } })}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs font-mono tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20"
            >
              Sign In to Your Account
            </button>

            <button
              type="button"
              onClick={() => navigate('/register', { state: { from: { pathname: '/my-bookings' } } })}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.10] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs font-mono tracking-wider uppercase transition-all"
            >
              Create Free Account
            </button>
          </div>

          <div className="pt-2">
            <Link to="/" className="text-xs text-slate-400 hover:text-amber-500 transition-colors">
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white pt-24 pb-20 px-3 sm:px-6 lg:px-8 transition-colors duration-500" id="my-bookings-page">
      <JsonLd data={schemas} />

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-amber-400 mb-2 transition-colors"
            >
              <FaArrowLeft className="text-[10px]" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                MMT LUXE SYSTEM
              </span>
              <span className="text-xs text-slate-400 font-mono">• {userBookings.length} Active & Past Bookings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              My Trips & Reservations
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/itinerary"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <HiOutlineSparkles /> AI Trip Planner
            </Link>
          </div>
        </div>

        {/* Search & PNR Lookup Hero */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0c101c] border border-slate-200/90 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Enter PNR, Flight No (e.g. AI 805), Train No (22436), Hotel or City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 overflow-x-auto">
              {[
                { id: 'all', label: 'All Trips', count: userBookings.length },
                { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
                { id: 'completed', label: 'Completed', count: completedCount },
                { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
              ].map((tab) => {
                const isActive = statusTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500 text-black font-black shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                      isActive ? 'bg-black text-amber-400' : 'bg-slate-300 dark:bg-white/10'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Service Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'flight', label: 'Flights' },
                { id: 'train', label: 'Trains' },
                { id: 'hotel', label: 'Stays' },
                { id: 'car', label: 'Cabs' },
                { id: 'bus', label: 'Buses' },
              ].map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedService(svc.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedService === svc.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  {svc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Feed */}
        {filteredBookings.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-[#0c101c] border border-slate-200 dark:border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto text-2xl">
              <FaSuitcase />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              No matching bookings found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Try modifying your search query or selecting a different service category.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-xs font-bold"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const badge = getServiceBadge(b.type || b.serviceType);
              const isConfirmed = b.status === 'Confirmed';
              const isCompleted = b.status === 'Completed';

              return (
                <div
                  key={b.bookingId}
                  className="rounded-3xl bg-white dark:bg-[#0c101c] border border-slate-200/90 dark:border-white/10 shadow-lg p-6 space-y-5"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.color}`}>
                        {badge.icon}
                        <span>{b.provider || badge.label}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(b.pnr || b.bookingId)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] hover:bg-amber-500/15 text-slate-700 dark:text-slate-300 hover:text-amber-500 text-[11px] font-mono font-bold transition-colors"
                        title="Click to copy PNR"
                      >
                        <span>PNR: {b.pnr || b.bookingId}</span>
                        {copiedPnr === (b.pnr || b.bookingId) ? (
                          <FaCheck className="text-emerald-500 text-[10px]" />
                        ) : (
                          <FaCopy className="text-slate-400 text-[10px]" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider ${
                        isConfirmed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' :
                        isCompleted ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25' :
                        'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                      }`}>
                        {b.status || 'Confirmed'}
                      </span>

                      <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                        {b.amount ? `₹${b.amount.toLocaleString()}` : `$${b.totalUSD || 100}`}
                      </span>
                    </div>
                  </div>

                  {/* Trip Summary Details */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {b.serviceTitle || b.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {b.departureDate && <span>Date: {b.departureDate}</span>}
                        {b.checkInDate && <span>Dates: {b.checkInDate} to {b.checkOutDate}</span>}
                        {b.seat && <span>Seat: {b.seat}</span>}
                        {b.coach && <span>Coach: {b.coach}, Berth: {b.berth}</span>}
                        <span>Traveler: {b.passengerName || 'Alex Johnson'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => setTicketModalBooking(b)}
                        className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-colors flex items-center justify-center gap-2 shadow"
                      >
                        <FaTicketAlt /> View E-Ticket
                      </button>

                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() => setCancellingBookingId(b.bookingId)}
                          className="px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TICKET / BOARDING PASS MODAL */}
      <BookingTicketModal
        isOpen={!!ticketModalBooking}
        onClose={() => setTicketModalBooking(null)}
        booking={ticketModalBooking}
      />

      {/* CANCELLATION CONFIRMATION MODAL */}
      <AnimatePresence>
        {cancellingBookingId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingBookingId(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl p-6 bg-white dark:bg-[#0f1422] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-white/10 z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center text-xl">
                <FaExclamationTriangle />
              </div>
              <h3 className="text-lg font-black">Cancel Reservation?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to cancel booking <strong className="text-slate-900 dark:text-white font-mono">{cancellingBookingId}</strong>? Full refund will be automatically credited to your payment source.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingBookingId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmCancel(cancellingBookingId)}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md transition-colors"
                >
                  Confirm Cancellation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookings;
