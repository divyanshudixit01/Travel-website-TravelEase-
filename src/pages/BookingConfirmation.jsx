import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import api from '../services/api';
import { 
  FaCheckCircle, FaPrint, FaDownload,
  FaArrowRight, FaTicketAlt, FaShieldAlt,
  FaUserFriends, FaBuilding
} from 'react-icons/fa';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';

const BookingConfirmation = () => {
  const { id } = useParams();
  const { userBookings, formatPrice } = useBooking();

  const [booking, setBooking] = useState(() => {
    return userBookings.find(b => b.bookingId?.toUpperCase() === id?.toUpperCase()) || null;
  });
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState(null);

  // Authoritative server hydration from MongoDB
  useEffect(() => {
    let isMounted = true;

    const fetchAuthoritativeBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        if (isMounted && res.data?.success && res.data.booking) {
          setBooking(res.data.booking);
          setError(null);
        }
      } catch (err) {
        if (isMounted && !booking) {
          setError('Booking reference not found in central database.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchAuthoritativeBooking();
    }
    return () => { isMounted = false; };
  }, [id, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Hydrating Official E-Ticket from Central Database...
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] flex flex-col items-center justify-center p-4 transition-colors duration-500">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elevated p-12 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <FaTicketAlt size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Booking Not Found</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
            {error || `We couldn't locate reservation reference "${id}".`}
          </p>
          <ThreeUIButton to="/" variant="liquid-metal" size="md" className="w-full">
            Return to Home
          </ThreeUIButton>
        </motion.div>
      </div>
    );
  }

  const manifest = booking.details?.passengerManifest || [];
  const gst = booking.gstDetails || booking.details?.gstDetails;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] py-10 px-4 transition-colors duration-500 print:bg-white print:p-0" id="confirmation-page">
      <div className="max-w-3xl mx-auto">

        {/* Confirmation Header Banner - Hidden in Print */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="print:hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-8 shadow-2xl mb-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[200%] bg-white/10 rotate-12 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-900/20">
              <FaCheckCircle className="text-white w-8 h-8" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/20">
              <FaShieldAlt className="text-emerald-100" /> Confirmed & Issued · PNR Active
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black mt-2 mb-3 tracking-tight">Booking Confirmed!</h1>
            <p className="text-emerald-50 text-sm font-medium max-w-lg mx-auto">
              Your digital e-ticket voucher has been authorized by the carrier and recorded to your account.
            </p>
          </div>
        </motion.div>

        {/* E-Ticket Card - Formatted for Screen and Print */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated relative overflow-hidden print:shadow-none print:border-2 print:border-slate-800 print:rounded-2xl"
        >
          
          {/* Ticket Header */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Electronic Ticket / PNR</span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 print:text-black tracking-widest font-mono">
                {booking.bookingId}
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Status: <span className="text-emerald-500 font-bold uppercase">{booking.status || 'Confirmed'}</span> · Payment: <span className="font-bold">{booking.paymentStatus || 'Paid'}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto print:hidden">
              <ThreeUIButton
                onClick={handlePrint}
                variant="specular-dark"
                size="sm"
                icon={FaPrint}
                className="flex-1 sm:flex-none"
              >
                Print Pass
              </ThreeUIButton>
              <ThreeUIButton
                onClick={handlePrint}
                variant="amber-glow"
                size="sm"
                icon={FaDownload}
                className="flex-1 sm:flex-none"
              >
                Save Boarding Pass
              </ThreeUIButton>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FaTicketAlt />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white print:text-black line-clamp-1">
                  {booking.serviceTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provider: {booking.provider || 'TravelEase Network'} · Service: {booking.serviceType?.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Primary Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold mb-1">Lead Traveler</span>
                <span className="font-extrabold text-slate-900 dark:text-white print:text-black text-sm">{booking.customerName || booking.passengerName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold mb-1">Contact Email</span>
                <span className="font-semibold text-slate-900 dark:text-white print:text-black text-xs truncate block">{booking.customerEmail}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold mb-1">Payment Reference</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-xs truncate block">{booking.razorpayPaymentId || booking.paymentMethod || 'Verified Gateway'}</span>
              </div>
            </div>

            {/* Passenger Manifest Table */}
            {manifest.length > 0 && (
              <div className="mb-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <FaUserFriends /> Manifested Passengers ({manifest.length})
                </div>
                <div className="space-y-2">
                  {manifest.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-200 dark:border-slate-700/40 last:border-none">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {idx + 1}. {p.name} {p.isLead && <span className="text-[10px] text-emerald-500 font-bold">(Lead)</span>}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {p.passportNumber ? `Passport: ${p.passportNumber}` : `Age: ${p.age || 'Adult'} (${p.gender || 'Standard'})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Details Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Reservation Itinerary</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
                {booking.details && Object.entries(booking.details).map(([k, v]) => {
                  if (typeof v === 'object' || k === 'passengerManifest' || k === 'gstDetails') return null;
                  return (
                    <li key={k} className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                      <span className="text-slate-500 dark:text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="font-bold text-slate-900 dark:text-white print:text-black">{String(v)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Corporate GST Tax Invoice Snippet */}
            {gst && gst.gstin && (
              <div className="mb-8 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs">
                <div className="flex items-center gap-2 mb-2 font-bold text-indigo-900 dark:text-indigo-300">
                  <FaBuilding /> Corporate Tax Invoice Record (SAC 998555)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>Company: <span className="font-semibold">{gst.companyName}</span></div>
                  <div>GSTIN: <span className="font-mono font-semibold">{gst.gstin}</span></div>
                </div>
              </div>
            )}

            {/* Footer Summary with Barcode / QR */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="text-center md:text-left w-full md:w-auto">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid (Inclusive of GST)</span>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 print:text-black">
                  {booking.currency === 'INR' || !booking.currency ? `₹${(booking.amount || 0).toLocaleString('en-IN')}` : formatPrice(booking.amountUSD || booking.amount)}
                </div>
              </div>
              
              <div className="flex flex-col items-center shrink-0">
                <div className="w-24 h-24 bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`https://travelease.com/verify/${booking.bookingId || 'TE-VERIFIED'}`)}`}
                    alt={`Verification QR Code for ${booking.bookingId}`} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="30" height="30" fill="black"/><rect x="60" y="10" width="30" height="30" fill="black"/><rect x="10" y="60" width="30" height="30" fill="black"/></svg>';
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-wider">IATA Boarding QR</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Notch */}
          <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 dark:bg-[#06080d] rounded-full transform -translate-y-1/2 print:hidden"></div>
          <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 dark:bg-[#06080d] rounded-full transform -translate-y-1/2 print:hidden"></div>
        </motion.div>

        {/* Dashboard Link - Hidden in Print */}
        <div className="text-center mt-12 print:hidden">
          <ThreeUIButton 
            to="/" 
            variant="specular-dark" 
            size="sm" 
            icon={FaArrowRight} 
            iconPosition="left"
          >
            Return to Home
          </ThreeUIButton>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmation;
