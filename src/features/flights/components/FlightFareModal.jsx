import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AirlineLogo from '../../../components/common/AirlineLogo';
import { ThreeUIButton } from '../../../components/ui/ThreeUIButton';
import { CABIN_CLASSES, BAGGAGE_OPTIONS } from '../../../services/flightApi';
import { FaTimes, FaSuitcase } from 'react-icons/fa';

export const FlightFareModal = ({
  flight,
  isOpen,
  onClose,
  onConfirmBooking,
  formatPrice
}) => {
  const [selectedCabin, setSelectedCabin] = useState(flight?.cabinClass || 'ECONOMY');
  const [selectedBaggage, setSelectedBaggage] = useState('standard');

  if (!isOpen || !flight) return null;

  // Multiplier logic for upgraded cabin
  let cabinPriceMultiplier = 1;
  if (selectedCabin === 'PREMIUM_ECONOMY') cabinPriceMultiplier = 1.35;
  else if (selectedCabin === 'BUSINESS') cabinPriceMultiplier = 2.2;
  else if (selectedCabin === 'FIRST') cabinPriceMultiplier = 3.5;

  const baggageObj = BAGGAGE_OPTIONS.find(b => b.id === selectedBaggage) || BAGGAGE_OPTIONS[0];
  const baggageExtraUSD = baggageObj.price || 0;

  const baseUSD = Math.round(flight.priceUSD * cabinPriceMultiplier);
  const totalUSD = baseUSD + baggageExtraUSD;

  const handleProceed = () => {
    onConfirmBooking({
      flight,
      cabinClass: selectedCabin,
      baggage: baggageObj,
      totalUSD
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Window / Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden max-h-[90vh] flex flex-col pb-safe"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <AirlineLogo airline={flight.airline} code={flight.airlineCode} className="w-10 h-10 rounded-xl" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  {flight.airline} · {flight.flightNumber}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {flight.from} ({flight.fromCity}) ➔ {flight.to} ({flight.toCity})
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* 1. Cabin Selection */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                1. Select Cabin Experience
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CABIN_CLASSES.map((cabin) => {
                  const isSelected = selectedCabin === cabin.id;
                  let multiplier = 1;
                  if (cabin.id === 'PREMIUM_ECONOMY') multiplier = 1.35;
                  if (cabin.id === 'BUSINESS') multiplier = 2.2;
                  if (cabin.id === 'FIRST') multiplier = 3.5;

                  const cabinPrice = Math.round(flight.priceUSD * multiplier);

                  return (
                    <div
                      key={cabin.id}
                      onClick={() => setSelectedCabin(cabin.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/5 shadow-md'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {cabin.name}
                        </span>
                        <span className="font-mono font-black text-sm text-amber-600 dark:text-amber-400 tabular-nums">
                          {formatPrice ? formatPrice(cabinPrice) : `$${cabinPrice}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {cabin.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Baggage Allowance */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                2. Baggage Upgrades
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BAGGAGE_OPTIONS.map((bag) => {
                  const isSelected = selectedBaggage === bag.id;
                  return (
                    <div
                      key={bag.id}
                      onClick={() => setSelectedBaggage(bag.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FaSuitcase className={isSelected ? 'text-indigo-500' : 'text-slate-400'} />
                        <span className="text-xs">{bag.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold">
                        {bag.price === 0 ? 'Included' : `+${formatPrice ? formatPrice(bag.price) : `$${bag.price}`}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Modal Footer with Fare Summary & Checkout Button */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total per Traveler
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
              Continue to Checkout
            </ThreeUIButton>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FlightFareModal;
