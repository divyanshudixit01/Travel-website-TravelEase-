import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeUIButton } from '../../../components/ui/ThreeUIButton';
import { FaTimes, FaBed, FaUserFriends, FaCheck, FaStar, FaShieldAlt, FaExternalLinkAlt, FaUtensils } from 'react-icons/fa';

export const HotelRoomSelectorModal = ({
  hotel,
  isOpen,
  onClose,
  onConfirmBooking,
  onPartnerBooking,
  checkIn,
  checkOut,
  guestsCount = 2,
  roomsCount = 1,
  currency = 'INR'
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState(() => hotel?.rooms?.[0]?.id || 'default');
  const [modalPhotoIdx, setModalPhotoIdx] = useState(0);

  if (!isOpen || !hotel) return null;

  const photos = Array.isArray(hotel.photo_gallery) && hotel.photo_gallery.length > 0
    ? hotel.photo_gallery
    : [hotel.primary_photo || hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'];

  // Nights calculation
  const dIn = new Date(checkIn);
  const dOut = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((dOut - dIn) / (1000 * 60 * 60 * 24)) || 1);

  const roomsList = Array.isArray(hotel.rooms) && hotel.rooms.length > 0 ? hotel.rooms : [
    {
      id: `${hotel.id}-deluxe`,
      name: 'Deluxe Heritage Room',
      bed: '1 Extra-Large King Bed',
      size: '38 sq.m',
      capacity: '2 Adults, 1 Child',
      amenities: ['High Speed Wi-Fi', 'City View', 'Rain Shower'],
      priceAmount: hotel.priceAmount || 3200,
      freeCancellation: true,
      cancellationText: 'Free cancellation up to 24 hours before check-in',
      boardName: 'Room Only'
    },
    {
      id: `${hotel.id}-exec`,
      name: 'Executive Suite with Buffet Breakfast',
      bed: '1 King Bed + 1 Sofa Bed',
      size: '56 sq.m',
      capacity: '3 Adults',
      amenities: ['Complimentary Buffet Breakfast', 'Panoramic View', 'Bathtub & Lounge Access'],
      priceAmount: Math.round((hotel.priceAmount || 3200) * 1.45),
      freeCancellation: true,
      cancellationText: 'Free cancellation up to 48 hours before check-in',
      boardName: 'Breakfast Included'
    }
  ];

  const currentRoom = roomsList.find((r) => r.id === selectedRoomId) || roomsList[0];
  const roomPricePerNight = currentRoom.priceAmount || hotel.priceAmount || 3200;
  const totalBasePrice = roomPricePerNight * nights * roomsCount;
  const gstTax = Math.round(totalBasePrice * 0.12);
  const finalTotalPrice = totalBasePrice + gstTax;

  const formatMoney = (val) => {
    if (currency === 'INR') {
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    }
    return `$${Math.round(val / 85).toLocaleString()}`;
  };

  const handleProceedTravelEase = () => {
    onConfirmBooking({
      hotel,
      room: currentRoom,
      nights,
      roomsCount,
      guestsCount,
      totalAmount: finalTotalPrice,
      totalUSD: Math.round(finalTotalPrice / 85),
      currency
    });
  };

  const handleProceedPartner = () => {
    if (onPartnerBooking) {
      onPartnerBooking({ hotel, room: currentRoom });
    } else {
      const partnerUrl = hotel.booking_providers?.[0]?.booking_url || `https://www.google.com/travel/hotels?q=${encodeURIComponent(hotel.name + ' ' + (hotel.city || ''))}`;
      window.open(partnerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden max-h-[90vh] flex flex-col pb-safe"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 text-xs font-black flex items-center gap-1">
                  <FaStar className="text-xs" /> {hotel.starRating ? `${hotel.starRating}★ Verified Stay` : 'Verified Stay'}
                </span>
                <span className="text-slate-400 text-xs">· {hotel.city}, {hotel.country}</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1">
                {hotel.name}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Room Options Body */}
          <div className="p-6 overflow-y-auto space-y-4">
            
            {/* Authentic Photo Viewer & Thumbnail Bar */}
            {photos.length > 0 && (
              <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="relative aspect-[16/9] w-full max-h-52 overflow-hidden">
                  <img
                    src={photos[modalPhotoIdx] || photos[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-3 text-white text-[11px] font-bold bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    Verified Room & Property Photo ({modalPhotoIdx + 1} of {photos.length})
                  </span>
                </div>
                {photos.length > 1 && (
                  <div className="flex items-center gap-1.5 p-2 bg-slate-950 overflow-x-auto">
                    {photos.slice(0, 8).map((pUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setModalPhotoIdx(idx)}
                        className={`w-12 h-9 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                          modalPhotoIdx === idx ? 'border-amber-400 scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={pUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stay Summary Strip */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="font-bold text-amber-700 dark:text-amber-300">
                Reservation: {checkIn} ➔ {checkOut} ({nights} {nights === 1 ? 'Night' : 'Nights'})
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                {guestsCount} Guests · {roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'}
              </span>
            </div>

            {/* Room Cards */}
            <div className="space-y-3">
              {roomsList.map((room) => {
                const isSelected = selectedRoomId === room.id;
                const roomPrice = room.priceAmount || hotel.priceAmount || 3200;
                const roomTotal = roomPrice * nights * roomsCount;

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/5 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                            {room.name}
                          </h4>
                          {room.boardName && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              {room.boardName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <FaBed className="text-amber-500 text-xs" /> {room.bed || '1 King Bed'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaUserFriends className="text-indigo-500 text-xs" /> {room.capacity || `${guestsCount} Adults`}
                          </span>
                          {room.size && <span>· {room.size}</span>}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Per Night
                        </span>
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                          {formatMoney(roomPrice)}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Total: {formatMoney(roomTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <FaCheck className="text-[10px]" /> {room.cancellationText || 'Free Cancellation Available'}
                      </span>
                      <span className="text-slate-500 font-medium">
                        · Instant TravelEase Voucher
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tariff Breakdown Breakdown Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Room Charges ({nights} {nights === 1 ? 'night' : 'nights'} × {roomsCount} room):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatMoney(totalBasePrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Hospitality GST & Services (12%):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatMoney(gstTax)}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Net Total Payable:</span>
                <span className="font-mono text-base text-amber-600 dark:text-amber-400">{formatMoney(finalTotalPrice)}</span>
              </div>
            </div>

          </div>

          {/* Footer with Dual Booking CTAs */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total for {nights} {nights === 1 ? 'Night' : 'Nights'} (incl. GST)
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                {formatMoney(finalTotalPrice)}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleProceedPartner}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                title="Book on official partner site"
              >
                <span>Partner Direct</span>
                <FaExternalLinkAlt className="text-[10px]" />
              </button>

              <ThreeUIButton
                type="button"
                variant="amber-glow"
                size="lg"
                onClick={handleProceedTravelEase}
                className="flex-1 sm:flex-initial"
              >
                Reserve Room
              </ThreeUIButton>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HotelRoomSelectorModal;
