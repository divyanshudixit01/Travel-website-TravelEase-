import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaPrint, FaDownload, FaPlane, FaTrain, FaHotel, FaCar, FaBus, 
  FaCheckCircle, FaQrcode, FaBarcode, FaShieldAlt, FaShareAlt, FaSuitcaseRolling, FaInfoCircle
} from 'react-icons/fa';

export const BookingTicketModal = ({ isOpen, onClose, booking }) => {
  if (!isOpen || !booking) return null;

  const isFlight = booking.type === 'flight' || booking.serviceType === 'flight';
  const isTrain = booking.type === 'train' || booking.serviceType === 'train';
  const isHotel = booking.type === 'hotel' || booking.serviceType === 'hotel';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textData = `
================================================================
           TRAVELEASE 2.0 OFFICIAL ELECTRONIC TRAVEL VOUCHER
================================================================
Booking Reference: ${booking.bookingId}
PNR: ${booking.pnr || booking.bookingId}
Status: ${booking.status || 'CONFIRMED'}
Service: ${booking.serviceTitle || booking.title || 'Travel Booking'}
Provider: ${booking.provider || 'TravelEase Direct'}
Passenger: ${booking.passengerName || 'Valued Traveler'}

DETAILS:
----------------------------------------------------------------
${isFlight ? `
Flight: ${booking.flightNumber || 'Direct'}
Route: ${booking.origin || ''} (${booking.originCode || ''}) -> ${booking.destination || ''} (${booking.destinationCode || ''})
Departure: ${booking.departureDate || ''} at ${booking.departureTime || ''}
Arrival: ${booking.arrivalDate || ''} at ${booking.arrivalTime || ''}
Terminal: ${booking.originTerminal || 'Main'} | Gate: ${booking.gate || 'TBA'} | Seat: ${booking.seat || 'Assigned'}
Cabin: ${booking.cabinClass || 'Economy'} | Baggage: ${booking.baggage || '15kg check-in'}
` : isTrain ? `
Train: ${booking.trainNumber || ''} - ${booking.trainName || ''}
Route: ${booking.origin || ''} (${booking.originPlatform || ''}) -> ${booking.destination || ''}
Departure: ${booking.departureDate || ''} at ${booking.departureTime || ''}
Class: ${booking.classType || 'Sleeper'} | Coach: ${booking.coach || 'B1'} | Berth: ${booking.berth || '12'}
IRCTC Chart Status: ${booking.chartStatus || 'Confirmed'}
` : isHotel ? `
Hotel: ${booking.hotelName || booking.serviceTitle}
Location: ${booking.location || 'City Center'}
Dates: Check-in ${booking.checkInDate} -> Check-out ${booking.checkOutDate}
Room Type: ${booking.roomType || 'Standard Deluxe'} | Guests: ${booking.guests || '1 Guest'}
` : `
Service Details: ${booking.serviceTitle}
Date: ${booking.departureDate || booking.pickupDate || 'Scheduled'}
Seat/Vehicle: ${booking.seat || booking.vehicleModel || 'Standard'}
`}

PAYMENT & VERIFICATION:
----------------------------------------------------------------
Total Amount Paid: ${booking.amount ? `INR ${booking.amount}` : `$${booking.amountUSD || booking.totalUSD || 100}`}
Payment Verification: 256-Bit Bank Grade SSL Verified
Issued By: TravelEase Global Operating System (IATA & IRCTC Certified)
================================================================
    `;

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TravelEase_Ticket_${booking.bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" id="ticket-modal-container">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl my-auto rounded-3xl bg-white dark:bg-[#0c101c] text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-white/15 overflow-hidden z-10"
        >
          {/* Top Decorative Airport Strip */}
          <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500" />

          {/* Ticket Header */}
          <div className="p-6 sm:p-8 pb-4 border-b border-dashed border-slate-200 dark:border-white/15">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-500/40 p-1.5 flex items-center justify-center shadow-md">
                  <img src="/brand/logo-mark.svg" alt="TravelEase Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                      Travel<span className="text-amber-500">Ease</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      OFFICIAL E-TICKET
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    VERIFIED BOOKING • {booking.provider || 'TravelEase OS'}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Close ticket"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Core Ticket Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* PNR & Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Booking Reference / PNR</span>
                <div className="text-lg sm:text-xl font-mono font-black text-amber-500 dark:text-amber-400">
                  {booking.pnr || booking.bookingId}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  booking.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                  booking.status === 'Completed' ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30' :
                  'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}>
                  <FaCheckCircle className="text-xs" /> {booking.status || 'CONFIRMED'}
                </span>
              </div>
            </div>

            {/* Flight / Train / Hotel Boarding Layout */}
            {isFlight && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  <span>FLIGHT: {booking.flightNumber}</span>
                  <span>CABIN: {booking.cabinClass}</span>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{booking.originCode || 'DEL'}</div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{booking.origin}</div>
                    <div className="text-xs text-amber-500 font-bold mt-1">{booking.departureTime}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-4">
                    <span className="text-[10px] font-mono text-slate-400">{booking.duration} • Non-Stop</span>
                    <div className="relative w-full flex items-center my-1">
                      <div className="h-[2px] w-full bg-slate-300 dark:bg-white/20" />
                      <FaPlane className="absolute left-1/2 -translate-x-1/2 text-amber-400 text-sm rotate-90" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">On Schedule</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{booking.destinationCode || 'BOM'}</div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{booking.destination}</div>
                    <div className="text-xs text-amber-500 font-bold mt-1">{booking.arrivalTime}</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">TERMINAL</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{booking.originTerminal || 'T3'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">GATE</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{booking.gate || '42B'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">SEAT</span>
                    <span className="text-xs font-bold text-amber-500">{booking.seat || '12A'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">BAGGAGE</span>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white truncate block">15kg + 7kg</span>
                  </div>
                </div>
              </div>
            )}

            {isTrain && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><FaTrain className="text-amber-500" /> {booking.trainName} ({booking.trainNumber})</span>
                  <span>{booking.classType}</span>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{booking.originCode || 'NDLS'}</div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{booking.origin}</div>
                    <div className="text-xs text-amber-500 font-bold mt-1">{booking.departureTime} • {booking.departureDate}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-4">
                    <span className="text-[10px] font-mono text-slate-400">{booking.duration}</span>
                    <div className="relative w-full flex items-center my-1">
                      <div className="h-[2px] w-full bg-slate-300 dark:bg-white/20" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute left-1/2 -translate-x-1/2" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">{booking.chartStatus || 'Confirmed'}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{booking.destinationCode || 'BSB'}</div>
                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{booking.destination}</div>
                    <div className="text-xs text-amber-500 font-bold mt-1">{booking.arrivalTime}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">COACH</span>
                    <span className="text-sm font-bold text-amber-500">{booking.coach || 'E1'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">BERTH / SEAT</span>
                    <span className="text-sm font-bold text-amber-500">{booking.berth || '18'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">MEAL INCLUDED</span>
                    <span className="text-xs font-bold text-emerald-500">Yes (Veg/Non)</span>
                  </div>
                </div>
              </div>
            )}

            {isHotel && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{booking.hotelName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{booking.location}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 font-bold text-xs">
                    {'★'.repeat(booking.starRating || 5)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">CHECK-IN</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{booking.checkInDate}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">CHECK-OUT</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{booking.checkOutDate}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">ROOM TYPE</span>
                    <span className="text-[11px] font-bold text-amber-500 truncate block">{booking.roomType || 'Luxury Suite'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[9px] font-mono text-slate-400 block">GUESTS</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{booking.guests || '2 Adults'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Passenger & Fare Matrix */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Primary Traveler</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{booking.passengerName || 'Alex Johnson'}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400">Total Fare (Tax Inclusive)</span>
                <div className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {booking.amount ? `₹${booking.amount.toLocaleString()}` : `$${booking.totalUSD || 100}`}
                </div>
              </div>
            </div>

            {/* Simulated Barcode & Security Stamp */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/10 p-1 flex items-center justify-center border border-slate-200 dark:border-white/10">
                  <FaQrcode className="w-8 h-8 text-slate-900 dark:text-white" />
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <div>SCAN AT GATE / HOTEL DESK</div>
                  <div className="text-slate-400">REF: {booking.bookingId}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <FaShieldAlt className="text-emerald-500" />
                <span>256-BIT ENCRYPTED VOUCHER</span>
              </div>
            </div>
          </div>

          {/* Ticket Footer Actions */}
          <div className="p-4 sm:p-6 bg-slate-100/80 dark:bg-white/[0.04] border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-white flex items-center gap-2 transition-colors shadow-sm"
            >
              <FaPrint className="text-amber-500" /> Print Ticket
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-2 transition-colors shadow-md shadow-amber-500/20"
              >
                <FaDownload /> Download E-Ticket
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
