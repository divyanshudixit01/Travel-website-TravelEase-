import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeUIButton } from '../../../components/ui/ThreeUIButton';
import { FaTimes, FaBed, FaUserFriends, FaCheck, FaStar } from 'react-icons/fa';

export const HotelRoomSelectorModal = ({
  hotel,
  isOpen,
  onClose,
  onConfirmBooking,
  checkIn,
  checkOut,
  formatPrice
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState(() => hotel?.rooms?.[0]?.id || 'default');

  if (!isOpen || !hotel) return null;

  // Nights calculation
  const dIn = new Date(checkIn);
  const dOut = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((dOut - dIn) / (1000 * 60 * 60 * 24)) || 1);

  // Available room options
  const defaultRooms = [
    {
      id: 'deluxe-king',
      name: 'Deluxe King Room with City View',
      priceUSD: hotel.pricePerNightUSD || 120,
      bed: '1 Extra-Large King Bed',
      size: '42 sq.m',
      capacity: '2 Adults, 1 Child',
      amenities: ['City Skyline View', 'Free High-Speed WiFi', 'Ensuite Rain Shower']
    },
    {
      id: 'executive-suite',
      name: 'Executive Panoramic Suite',
      priceUSD: Math.round((hotel.pricePerNightUSD || 120) * 1.6),
      bed: '1 King Bed + 1 Sofa Bed',
      size: '65 sq.m',
      capacity: '3 Adults',
      amenities: ['Lounge Access', 'Panoramic View', 'Free Breakfast Included', 'Deep Soaking Tub']
    }
  ];

  const roomsList = hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms : defaultRooms;
  const currentRoom = roomsList.find((r) => r.id === selectedRoomId) || roomsList[0];
  const totalUSD = (currentRoom.priceUSD || hotel.pricePerNightUSD || 120) * nights;

  const handleProceed = () => {
    onConfirmBooking({
      hotel,
      room: currentRoom,
      nights,
      totalUSD
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        
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
                  <FaStar /> {hotel.starRating ? `${hotel.starRating}-Star` : 'Verified Luxury'}
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
            
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="font-bold text-amber-700 dark:text-amber-300">
                Reservation: {checkIn} ➔ {checkOut} ({nights} {nights === 1 ? 'Night' : 'Nights'})
              </span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">2 Guests</span>
            </div>

            <div className="space-y-3">
              {roomsList.map((room) => {
                const isSelected = selectedRoomId === room.id;
                const roomNightUSD = room.priceUSD || hotel.pricePerNightUSD || 120;
                const roomTotalUSD = roomNightUSD * nights;

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
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {room.name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <FaBed className="text-amber-500 text-xs" /> {room.bed || '1 King Bed'}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaUserFriends className="text-indigo-500 text-xs" /> {room.capacity || '2 Adults'}
                          </span>
                          {room.size && <span>· {room.size}</span>}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          {nights} {nights === 1 ? 'Night' : 'Nights'} Total
                        </span>
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                          {formatPrice ? formatPrice(roomTotalUSD) : `$${roomTotalUSD}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <FaCheck className="text-[10px]" /> Free Cancellation
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        · Free High-Speed WiFi Included
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Footer with Checkout CTA */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total for {nights} {nights === 1 ? 'Night' : 'Nights'}
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                {formatPrice ? formatPrice(totalUSD) : `$${totalUSD}`}
              </div>
            </div>

            <ThreeUIButton
              type="button"
              variant="amber-glow"
              size="lg"
              onClick={handleProceed}
            >
              Reserve Room
            </ThreeUIButton>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HotelRoomSelectorModal;
