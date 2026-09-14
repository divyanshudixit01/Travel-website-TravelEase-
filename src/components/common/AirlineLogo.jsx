import React, { useState } from 'react';
import { FaPlane } from 'react-icons/fa';

// Airline brand color mapping
const AIRLINE_COLORS = {
  '6E': { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' }, // IndiGo
  'AI': { bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' }, // Air India
  'EK': { bg: 'bg-red-700', text: 'text-amber-300', border: 'border-red-800' }, // Emirates
  'QP': { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' }, // Akasa Air
  'UK': { bg: 'bg-purple-900', text: 'text-amber-300', border: 'border-purple-950' }, // Vistara
  'SG': { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700' }, // SpiceJet
  'SQ': { bg: 'bg-amber-500', text: 'text-blue-950', border: 'border-amber-600' }, // Singapore Airlines
  'QR': { bg: 'bg-rose-900', text: 'text-white', border: 'border-rose-950' }, // Qatar Airways
  'BA': { bg: 'bg-blue-800', text: 'text-red-400', border: 'border-blue-900' }, // British Airways
  'LH': { bg: 'bg-amber-400', text: 'text-blue-950', border: 'border-amber-500' }, // Lufthansa
  'AF': { bg: 'bg-blue-900', text: 'text-white', border: 'border-blue-950' }, // Air France
  'DEFAULT': { bg: 'bg-slate-700 dark:bg-slate-800', text: 'text-amber-400', border: 'border-slate-600' }
};

export const AirlineLogo = ({ logo, airlineName = '', airlineCode = '', className = 'w-12 h-12' }) => {
  const [imgError, setImgError] = useState(false);

  // Extract code if not passed
  const code = (airlineCode || airlineName.slice(0, 2) || 'FL').toUpperCase();
  const colorScheme = AIRLINE_COLORS[code] || AIRLINE_COLORS.DEFAULT;

  // Derive preferred logo URL from carrier code if current logo is missing or is an unsplash placeholder
  const isUnsplash = logo && logo.includes('images.unsplash.com');
  const effectiveLogo = (!logo || isUnsplash) && code.length === 2
    ? `https://r-xx.bstatic.com/data/airlines_logo/${code}.png`
    : logo;

  if (imgError || !effectiveLogo || isUnsplash) {
    return (
      <div 
        className={`${className} rounded-2xl ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border} flex flex-col items-center justify-center font-mono font-bold text-xs shadow-sm select-none p-1 shrink-0`}
        title={airlineName || code}
      >
        <FaPlane className="text-[10px] mb-0.5 opacity-80" />
        <span className="tracking-tight text-[11px] leading-none">{code.slice(0, 3)}</span>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-2xl bg-white dark:bg-slate-800 p-2 border border-slate-200/90 dark:border-white/10 shadow-sm flex items-center justify-center shrink-0`}>
      <img
        src={effectiveLogo}
        alt={airlineName || 'Airline'}
        className="w-full h-full object-contain rounded-lg"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </div>
  );
};

export default AirlineLogo;
