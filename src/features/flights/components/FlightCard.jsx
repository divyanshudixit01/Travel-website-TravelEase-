import React from 'react';
import AirlineLogo from '../../../components/common/AirlineLogo';
import { ThreeUIButton } from '../../../components/ui/ThreeUIButton';
import { FaPlane, FaWifi, FaUtensils, FaSuitcase, FaClock } from 'react-icons/fa';

export const FlightCard = ({
  flight,
  onSelect,
  formatPrice
}) => {
  const isDirect = flight.stops === 0;

  return (
    <div className="card-elevated p-6 hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 group relative overflow-hidden bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl">
      
      {/* Top Bar: Airline & Rating */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <AirlineLogo airline={flight.airline} code={flight.airlineCode} className="w-10 h-10 rounded-xl shadow-sm" />
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              {flight.airline}
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                {flight.flightNumber}
              </span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {flight.aircraft || 'Modern Airliner'} · {flight.cabinClass || 'Economy'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {flight.rating && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1">
              ★ {flight.rating}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
            {isDirect ? 'Direct Flight' : `${flight.stops} Stop`}
          </span>
        </div>
      </div>

      {/* Center Route Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
        
        {/* Origin */}
        <div className="md:col-span-3 text-left">
          <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
            {flight.departureTime}
          </span>
          <div className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">
            {flight.from} <span className="text-xs font-normal text-slate-500">· {flight.fromCity}</span>
          </div>
        </div>

        {/* Duration Timeline Graphic */}
        <div className="md:col-span-6 flex flex-col items-center justify-center px-4">
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1.5">
            <FaClock className="text-[10px]" />
            <span className="font-mono tabular-nums">{flight.duration}</span>
          </div>

          <div className="w-full flex items-center gap-2 relative">
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <div className="flex-1 h-[2px] bg-slate-200 dark:bg-slate-700 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-500 opacity-80" />
              <FaPlane className="absolute left-1/2 -top-1.5 -translate-x-1/2 text-amber-500 text-xs transform group-hover:scale-125 transition-transform" />
            </div>
            <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
          </div>

          <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
            {flight.stopDetails || (isDirect ? 'Non-Stop' : `${flight.stops} Layover`)}
          </span>
        </div>

        {/* Destination */}
        <div className="md:col-span-3 text-left md:text-right">
          <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
            {flight.arrivalTime}
          </span>
          <div className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">
            {flight.to} <span className="text-xs font-normal text-slate-500">· {flight.toCity}</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Amenities, Price & Select Action */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Amenity Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium">
            <FaSuitcase className="text-xs text-amber-500" /> Standard Bag Included
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium">
            <FaUtensils className="text-xs text-emerald-500" /> Meal Service
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium">
            <FaWifi className="text-xs text-blue-500" /> WiFi
          </span>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Per Adult</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
              {formatPrice ? formatPrice(flight.priceUSD) : `$${flight.priceUSD}`}
            </div>
          </div>

          <ThreeUIButton
            type="button"
            variant="amber-glow"
            size="sm"
            onClick={() => onSelect(flight)}
          >
            Select Flight
          </ThreeUIButton>
        </div>
      </div>

    </div>
  );
};

export default FlightCard;
