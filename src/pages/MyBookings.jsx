import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTicketAlt, FaSearch, FaCalendarAlt, FaUser,
  FaCheckCircle, FaTimesCircle, FaDownload, FaPrint, FaArrowLeft,
  FaShieldAlt, FaExclamationTriangle, FaSpinner, FaReceipt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getBookingById, downloadVoucher, cancelBooking } from '../services/hotelApi';
import { useBooking } from '../context/BookingContext';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema } from '../utils/schemas';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';

const MyBookings = () => {
  const { addToast } = useBooking();
  const [searchId, setSearchId] = useState('');
  const [activeBooking, setActiveBooking] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [voucherText, setVoucherText] = useState(null);
  const [isDownloadingVoucher, setIsDownloadingVoucher] = useState(false);
  const [error, setError] = useState(null);

  // Load recent booking IDs from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('travelease_hotel_bookings') || '[]');
      if (Array.isArray(stored)) {
        setRecentBookings(stored);
        // If there's at least one recent booking, auto-load the latest one
        if (stored.length > 0 && stored[0].bookingId) {
          handleLookup(stored[0].bookingId);
        }
      }
    } catch (e) {
      console.warn('Error reading recent bookings:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLookup = async (idToLook) => {
    const bId = (idToLook || searchId || '').trim();
    if (!bId) {
      setError('Please enter a valid Booking Reference ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVoucherText(null);

    try {
      const res = await getBookingById(bId);
      if (res.success && res.booking) {
        setActiveBooking(res.booking);
        setSearchId(bId);
      } else {
        setError(res.message || 'No reservation found matching this reference ID');
        setActiveBooking(null);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve reservation');
      setActiveBooking(null);
    }

    setIsLoading(false);
  };

  const handleDownloadVoucher = async () => {
    if (!activeBooking?.bookingId) return;
    setIsDownloadingVoucher(true);
    try {
      const res = await downloadVoucher(activeBooking.bookingId);
      if (res.success && res.voucher) {
        setVoucherText(res.voucher);
        // Also trigger browser download as a text/html voucher file
        const blob = new Blob([res.voucher], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Voucher_${activeBooking.bookingId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addToast('Voucher downloaded successfully!', 'success');
      } else {
        addToast('Official voucher text received and displayed below.', 'info');
      }
    } catch (err) {
      addToast('Could not download voucher. Please print this page.', 'error');
    }
    setIsDownloadingVoucher(false);
  };

  const handleCancelBooking = async () => {
    if (!activeBooking?.bookingId) return;
    setIsCancelling(true);
    try {
      const res = await cancelBooking(activeBooking.bookingId);
      if (res.success) {
        addToast('Reservation cancelled successfully.', 'success');
        setActiveBooking(prev => ({ ...prev, status: 'CANCELLED' }));
        setShowCancelConfirm(false);
      } else {
        addToast(res.message || 'Failed to cancel reservation.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error cancelling reservation.', 'error');
    }
    setIsCancelling(false);
  };

  const schemas = [
    getWebPageSchema({
      name: 'Manage Hotel Bookings & Vouchers',
      description: 'Look up reservations, download vouchers, and manage check-in details with instant confirmation.',
      url: '/my-bookings',
      breadcrumb: true
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Hotels', url: '/hotels' },
      { name: 'My Bookings', url: '/my-bookings' }
    ], '/my-bookings')
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] text-slate-900 dark:text-slate-100 pt-24 pb-16 px-4">
      <JsonLd data={schemas} />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link
            to="/hotels"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-amber-400 mb-2 transition-colors"
          >
            <FaArrowLeft className="text-[10px]" /> Back to Hotel Search
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-black">
            <FaTicketAlt /> Reservation Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Manage Your Hotel Bookings
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Retrieve official LiteAPI reservations, download confirmed hotel vouchers, or cancel anytime with zero friction.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(searchId);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Booking Reference ID (e.g. 5DeMgVmY7)"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <ThreeUIButton
              type="submit"
              disabled={isLoading}
              variant="amber-glow"
              size="md"
              icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              className="shrink-0 disabled:opacity-60"
            >
              {isLoading ? 'Retrieving...' : 'Lookup Booking'}
            </ThreeUIButton>
          </form>

          {/* Quick Recent Chips */}
          {recentBookings.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400">Recent on this device:</span>
              {recentBookings.slice(0, 4).map((rb, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSearchId(rb.bookingId);
                    handleLookup(rb.bookingId);
                  }}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition-all ${
                    searchId === rb.bookingId
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {rb.bookingId} ({rb.hotelName ? rb.hotelName.split(' ')[0] : 'Hotel'})
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
              <FaExclamationTriangle className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Active Booking Voucher & Details Card */}
        {activeBooking && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            {/* Voucher Header Band */}
            <div className={`p-6 sm:p-8 ${
              activeBooking.status === 'CANCELLED'
                ? 'bg-gradient-to-r from-rose-900/60 to-slate-900'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
            } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    activeBooking.status === 'CANCELLED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                  }`}>
                    {activeBooking.status === 'CANCELLED' ? <FaTimesCircle className="inline mr-1" /> : <FaCheckCircle className="inline mr-1" />}
                    {activeBooking.status}
                  </span>
                  <span className="text-xs text-white/80 font-semibold">
                    LiteAPI Guaranteed
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">
                  {activeBooking.hotel?.name || 'Hotel Reservation'}
                </h2>
                <p className="text-xs text-white/80 mt-1">
                  Confirmation Reference: <span className="font-mono font-black text-white">{activeBooking.bookingId}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
                <ThreeUIButton
                  type="button"
                  onClick={handleDownloadVoucher}
                  disabled={isDownloadingVoucher}
                  variant="specular-dark"
                  size="sm"
                  icon={isDownloadingVoucher ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                >
                  Download Voucher
                </ThreeUIButton>
                <ThreeUIButton
                  type="button"
                  onClick={() => window.print()}
                  variant="specular-dark"
                  size="sm"
                  icon={<FaPrint />}
                >
                  Print
                </ThreeUIButton>
              </div>
            </div>

            {/* Details Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Key Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <FaCalendarAlt className="text-amber-400" /> Stay Dates
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {activeBooking.checkin} → {activeBooking.checkout}
                  </p>
                  <p className="text-[11px] text-slate-500">Official check-in from 2:00 PM</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <FaUser className="text-amber-400" /> Primary Guest
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {activeBooking.holder?.firstName} {activeBooking.holder?.lastName || ''}
                  </p>
                  <p className="text-[11px] text-slate-500">{activeBooking.holder?.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <FaReceipt className="text-amber-400" /> Total Paid
                  </div>
                  <p className="text-lg font-black text-amber-500">
                    {activeBooking.rooms?.[0]?.rate?.retailRate?.total?.amount
                      ? `${activeBooking.rooms[0].rate.retailRate.total.currency === 'INR' ? '₹' : '$'}${Number(activeBooking.rooms[0].rate.retailRate.total.amount).toLocaleString('en-IN')}`
                      : 'Prepaid in Full'}
                  </p>
                  <p className="text-[11px] text-slate-500">Taxes & fees included</p>
                </div>
              </div>

              {/* Booked Rooms Table */}
              {activeBooking.rooms && activeBooking.rooms.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Booked Accommodations
                  </h3>
                  <div className="space-y-2">
                    {activeBooking.rooms.map((rm, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {rm.roomType?.name || 'Deluxe Room'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {rm.boardName || 'Room Only'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {rm.adults || 1} Adult{(rm.adults || 1) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            Confirmed
                          </span>
                          <p className="text-[10px] text-emerald-500 font-bold">Instant Lock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Policy and Cancellation Button */}
              {activeBooking.status !== 'CANCELLED' && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-amber-500 text-xl shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        Need to change plans?
                      </p>
                      <p className="text-[11px] text-slate-500">
                        You can cancel this reservation anytime prior to hotel check-in.
                      </p>
                    </div>
                  </div>

                  <ThreeUIButton
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    variant="specular-dark"
                    size="sm"
                    className="!text-rose-500 hover:!bg-rose-500/10 shrink-0"
                  >
                    Cancel Reservation
                  </ThreeUIButton>
                </div>
              )}

              {/* Cancel Confirmation Modal */}
              <AnimatePresence>
                {showCancelConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.95 }}
                      className="bg-slate-900 p-6 rounded-3xl border border-slate-800 max-w-md w-full space-y-4"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl">
                        <FaExclamationTriangle />
                      </div>
                      <div className="text-center space-y-1">
                        <h4 className="text-base font-black text-white">Cancel this reservation?</h4>
                        <p className="text-xs text-slate-400">
                          Are you sure you want to cancel booking <span className="font-mono text-white">{activeBooking.bookingId}</span> at {activeBooking.hotel?.name}?
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <ThreeUIButton
                          type="button"
                          onClick={() => setShowCancelConfirm(false)}
                          variant="specular-dark"
                          size="md"
                          className="flex-1"
                        >
                          Keep Booking
                        </ThreeUIButton>
                        <ThreeUIButton
                          type="button"
                          onClick={handleCancelBooking}
                          disabled={isCancelling}
                          variant="specular-dark"
                          size="md"
                          icon={isCancelling ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                          className="flex-1 !bg-rose-500 hover:!bg-rose-600 !text-white"
                        >
                          {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                        </ThreeUIButton>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Voucher Preview if text received */}
              {voucherText && (
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Official Voucher Content
                  </h4>
                  <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 text-[11px] font-mono whitespace-pre-wrap overflow-x-auto border border-slate-800 max-h-64">
                    {voucherText}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
