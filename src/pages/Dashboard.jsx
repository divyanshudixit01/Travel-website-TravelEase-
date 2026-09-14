import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import AuthContext from '../context/AuthContext';
import { 
  FaPlane, FaHotel, FaCar, FaTrain, FaBus, FaCompass, 
  FaSuitcase, FaTicketAlt, FaCoins, FaCheckCircle, FaTimesCircle, 
  FaSearch, FaFilter, FaDownload, FaPrint, FaQrcode, FaShieldAlt, 
  FaExternalLinkAlt, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserEdit,
  FaChevronRight, FaCopy, FaCheck, FaExclamationTriangle, FaTimes
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FiActivity, FiArrowUpRight, FiCompass } from 'react-icons/fi';
import { BookingTicketModal } from '../components/bookings/BookingTicketModal';
import { AvatarStudioModal } from '../components/profile/AvatarStudioModal';
import { TRAVEL_AVATARS } from '../components/profile/travelAvatars';

const Dashboard = () => {
  const { userBookings, cancelBooking, addToast } = useBooking();
  const { user, updateUser } = useContext(AuthContext);

  // Filter States
  const [statusTab, setStatusTab] = useState('upcoming'); // 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [selectedService, setSelectedService] = useState('all'); // 'all' | 'flight' | 'train' | 'hotel' | 'car' | 'bus'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [ticketModalBooking, setTicketModalBooking] = useState(null);
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [copiedPnr, setCopiedPnr] = useState('');

  // User details
  const displayName = user?.name || 'Alex Johnson';
  const displayEmail = user?.email || 'alex.johnson@travelease.com';
  const activeAvatar = user?.avatar || TRAVEL_AVATARS[0].svgDataUri;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedPnr(text);
    addToast(`Copied PNR ${text} to clipboard`, 'info');
    setTimeout(() => setCopiedPnr(''), 3000);
  };

  // Filtered Bookings calculation
  const filteredBookings = useMemo(() => {
    return userBookings.filter((booking) => {
      // 1. Status Filter
      if (statusTab === 'upcoming') {
        if (booking.status !== 'Confirmed') return false;
      } else if (statusTab === 'completed') {
        if (booking.status !== 'Completed') return false;
      } else if (statusTab === 'cancelled') {
        if (booking.status !== 'Cancelled') return false;
      }

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

  // Statistics
  const upcomingCount = userBookings.filter(b => b.status === 'Confirmed').length;
  const completedCount = userBookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = userBookings.filter(b => b.status === 'Cancelled').length;

  const handleConfirmCancel = (bookingId) => {
    cancelBooking(bookingId);
    setCancellingBookingId(null);
    addToast(`Reservation ${bookingId} has been cancelled. Refund initiated.`, 'success');
  };

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white pt-24 pb-20 px-3 sm:px-6 lg:px-8 transition-colors duration-500" id="dashboard-page">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. HERO PROFILE & COMMAND BAR OVERHAUL */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl p-6 sm:p-8 lg:p-10 bg-white/80 dark:bg-[#0d121f]/90 border border-slate-200/90 dark:border-white/15 shadow-2xl shadow-slate-900/10 dark:shadow-black/70 overflow-hidden backdrop-blur-2xl"
        >
          {/* Ambient Lighting Gradients */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            
            {/* Identity Cluster */}
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Interactive Avatar */}
              <div className="relative group">
                <div 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-amber-400 p-0.5 shadow-xl bg-slate-900 cursor-pointer group-hover:scale-105 transition-transform"
                  onClick={() => setIsAvatarStudioOpen(true)}
                  title="Click to change avatar or photo"
                >
                  <img
                    src={activeAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarStudioOpen(true)}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-md transition-all hover:scale-110"
                  aria-label="Edit avatar"
                  title="Change avatar"
                >
                  <FaUserEdit className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    {displayName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                    <HiOutlineSparkles /> INFINITE VIP EXPLORER
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mb-3">
                  {displayEmail} • Member since 2026
                </p>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    IRCTC Direct Tatkal Active
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20">
                    <FaShieldAlt /> Verified Traveler
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Cluster */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-white/10">
              <Link
                to="/itinerary"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <HiOutlineSparkles /> Plan with AI
              </Link>
              <Link
                to="/trains"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <FaTrain className="text-amber-400" /> Book Train
              </Link>
              <Link
                to="/profile"
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                Profile & Settings
              </Link>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">Upcoming Departures</span>
              <div className="text-2xl font-black text-amber-500 dark:text-amber-400 font-mono">
                {upcomingCount}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">Completed Trips</span>
              <div className="text-2xl font-black text-emerald-500 dark:text-emerald-400 font-mono">
                {completedCount}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">TravelRewards Points</span>
              <div className="text-2xl font-black text-sky-500 dark:text-sky-400 font-mono">
                1,450 <span className="text-xs font-sans text-slate-400">Pts</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5">
              <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">IRCTC Radar Sync</span>
              <div className="text-2xl font-black text-purple-500 dark:text-purple-400 font-mono flex items-center gap-1.5">
                99.9% <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">NOMINAL</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. MAKEMYTRIP (MMT) BOOKINGS MANAGEMENT HUB */}
        <div className="space-y-6">

          {/* Controls Bar: Status Tabs + Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 dark:bg-white/[0.06] border border-slate-300/70 dark:border-white/10 overflow-x-auto">
              {[
                { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
                { id: 'completed', label: 'Completed', count: completedCount },
                { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
                { id: 'all', label: 'All Trips', count: userBookings.length },
              ].map((tab) => {
                const isActive = statusTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-mono ${
                      isActive ? 'bg-amber-500 text-black font-bold' : 'bg-slate-300 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Search Bar */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search by PNR, train no, flight, hotel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
            </div>
          </div>

          {/* Service Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 mr-1 shrink-0">Service:</span>
            {[
              { id: 'all', label: 'All Services' },
              { id: 'flight', label: 'Flights', icon: <FaPlane /> },
              { id: 'train', label: 'IRCTC Trains', icon: <FaTrain /> },
              { id: 'hotel', label: 'Stays', icon: <FaHotel /> },
              { id: 'car', label: 'Cabs', icon: <FaCar /> },
              { id: 'bus', label: 'Buses', icon: <FaBus /> },
            ].map((svc) => {
              const isSelected = selectedService === svc.id;
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedService(svc.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-black font-bold shadow-sm shadow-amber-500/20'
                      : 'bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  {svc.icon && <span>{svc.icon}</span>}
                  <span>{svc.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. BOOKINGS FEED / CARDS */}
          {filteredBookings.length === 0 ? (
            /* Empty State */
            <div className="p-12 sm:p-16 rounded-3xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto text-2xl shadow-sm">
                <FaSuitcase />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                No reservations found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `No bookings matched your search query "${searchQuery}". Try clearing your search.`
                  : `You don't have any ${statusTab} bookings in this category right now.`}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-xs font-bold"
                  >
                    Clear Search
                  </button>
                ) : (
                  <Link
                    to="/destinations"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-md shadow-amber-500/20 transition-all"
                  >
                    Explore Destinations
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* Rich Booking Cards */
            <div className="space-y-4">
              {filteredBookings.map((b) => {
                const badge = getServiceBadge(b.type || b.serviceType);
                const isConfirmed = b.status === 'Confirmed';
                const isCompleted = b.status === 'Completed';

                return (
                  <motion.div
                    key={b.bookingId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-white dark:bg-[#0c101c] border border-slate-200/90 dark:border-white/10 shadow-lg hover:shadow-xl transition-all overflow-hidden group"
                  >
                    {/* Top Status Stripe */}
                    <div className={`h-1.5 w-full ${
                      isConfirmed ? 'bg-emerald-500' : isCompleted ? 'bg-sky-500' : 'bg-rose-500'
                    }`} />

                    <div className="p-5 sm:p-7 space-y-5">
                      
                      {/* Card Header: Service Badge + PNR + Status */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.color}`}>
                            {badge.icon}
                            <span>{b.provider || badge.label}</span>
                          </span>
                          
                          {/* PNR Chip */}
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

                        {/* Status Label */}
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            isConfirmed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' :
                            isCompleted ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25' :
                            'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-500' : isCompleted ? 'bg-sky-500' : 'bg-rose-500'}`} />
                            {b.status || 'Confirmed'}
                          </span>

                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
                              {b.amount ? `₹${b.amount.toLocaleString()}` : `$${b.totalUSD || 100}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content: Route Diagram & Details */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        
                        {/* Route Timeline (8 cols) */}
                        <div className="md:col-span-8">
                          {b.type === 'flight' ? (
                            <div>
                              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                                {b.flightNumber} • {b.cabinClass}
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">{b.originCode}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{b.origin}</div>
                                  <div className="text-xs font-bold text-amber-500 mt-0.5">{b.departureDate} at {b.departureTime}</div>
                                </div>
                                <div className="flex-1 flex flex-col items-center px-4">
                                  <span className="text-[10px] font-mono text-slate-400">{b.duration}</span>
                                  <div className="relative w-full flex items-center my-1">
                                    <div className="h-[2px] w-full bg-slate-200 dark:bg-white/20" />
                                    <FaPlane className="text-amber-400 text-xs absolute left-1/2 -translate-x-1/2 rotate-90" />
                                  </div>
                                  <span className="text-[10px] font-mono text-emerald-500">{b.flightType}</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">{b.destinationCode}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{b.destination}</div>
                                  <div className="text-xs font-bold text-amber-500 mt-0.5">{b.arrivalTime}</div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                <span>Terminal: {b.originTerminal}</span>
                                <span>•</span>
                                <span>Seat: {b.seat}</span>
                                <span>•</span>
                                <span>Gate: {b.gate}</span>
                              </div>
                            </div>
                          ) : b.type === 'train' ? (
                            <div>
                              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                                <FaTrain className="text-amber-400" /> {b.trainName} ({b.trainNumber})
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <div className="text-xl font-black font-mono text-slate-900 dark:text-white">{b.originCode}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{b.origin}</div>
                                  <div className="text-xs font-bold text-amber-500 mt-0.5">{b.departureDate} at {b.departureTime}</div>
                                </div>
                                <div className="flex-1 flex flex-col items-center px-4">
                                  <span className="text-[10px] font-mono text-slate-400">{b.duration}</span>
                                  <div className="relative w-full flex items-center my-1">
                                    <div className="h-[2px] w-full bg-slate-200 dark:bg-white/20" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500 absolute left-1/2 -translate-x-1/2" />
                                  </div>
                                  <span className="text-[10px] font-mono text-emerald-500">{b.chartStatus}</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-black font-mono text-slate-900 dark:text-white">{b.destinationCode}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{b.destination}</div>
                                  <div className="text-xs font-bold text-amber-500 mt-0.5">{b.arrivalTime}</div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                <span>Coach: {b.coach}</span>
                                <span>•</span>
                                <span>Berth: {b.berth}</span>
                                <span>•</span>
                                <span>Class: {b.classType}</span>
                              </div>
                            </div>
                          ) : b.type === 'hotel' ? (
                            <div>
                              <h4 className="text-base font-black text-slate-900 dark:text-white">{b.hotelName}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{b.location}</p>
                              <div className="flex flex-wrap items-center gap-4 text-xs">
                                <div>
                                  <span className="text-[10px] font-mono text-slate-400 block">CHECK-IN</span>
                                  <span className="font-bold text-slate-900 dark:text-white">{b.checkInDate}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-mono text-slate-400 block">CHECK-OUT</span>
                                  <span className="font-bold text-slate-900 dark:text-white">{b.checkOutDate}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-mono text-slate-400 block">ROOM TYPE</span>
                                  <span className="font-bold text-amber-500">{b.roomType}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h4 className="text-base font-black text-slate-900 dark:text-white">{b.serviceTitle}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {b.vehicleModel || b.busType || 'Confirmed Travel Booking'}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-500">
                                <span>Date: {b.departureDate || b.pickupDate || b.createdAt}</span>
                                {b.seat && <span>Seat: {b.seat}</span>}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions (4 cols) */}
                        <div className="md:col-span-4 flex flex-col justify-center gap-2 pt-4 md:pt-0 md:border-l border-slate-100 dark:border-white/5 md:pl-6">
                          
                          {/* 1. View E-Ticket / Boarding Pass */}
                          <button
                            type="button"
                            onClick={() => setTicketModalBooking(b)}
                            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                          >
                            <FaTicketAlt /> View E-Ticket
                          </button>

                          {/* 2. Download Voucher */}
                          <button
                            type="button"
                            onClick={() => setTicketModalBooking(b)}
                            className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                          >
                            <FaDownload className="text-slate-400 text-[10px]" /> Download PDF
                          </button>

                          {/* 3. Cancel Action (only if confirmed) */}
                          {isConfirmed && (
                            <button
                              type="button"
                              onClick={() => setCancellingBookingId(b.bookingId)}
                              className="w-full py-1.5 px-3 rounded-lg text-rose-500 hover:bg-rose-500/10 text-[11px] font-bold transition-colors"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TICKET / BOARDING PASS MODAL */}
      <BookingTicketModal
        isOpen={!!ticketModalBooking}
        onClose={() => setTicketModalBooking(null)}
        booking={ticketModalBooking}
      />

      {/* AVATAR STUDIO MODAL */}
      <AvatarStudioModal
        isOpen={isAvatarStudioOpen}
        onClose={() => setIsAvatarStudioOpen(false)}
        currentAvatar={activeAvatar}
        onSaveAvatar={(newAvatar) => {
          updateUser({ avatar: newAvatar, avatarType: 'custom' });
          addToast('Avatar updated successfully across TravelEase!', 'success');
        }}
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
                Are you sure you want to cancel booking <strong className="text-slate-900 dark:text-white font-mono">{cancellingBookingId}</strong>? As per TravelEase cancellation policy, refundable amounts are returned to your original payment method in 2-3 business days.
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

export default Dashboard;
