import React from 'react';

/**
 * BrandVectors.jsx — Centralized, High-Precision Vector Seals & Payment Marks
 * Eliminates raw emojis and AI-prototype placeholders with authentic brand marks.
 */

// 1. IRCTC Official Partner Seal
export const IrctcPartnerSeal = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="IRCTC Verified Partner">
    <circle cx="24" cy="24" r="23" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2" />
    <path d="M14 28V20C14 16.6863 16.6863 14 20 14H28C31.3137 14 34 16.6863 34 20V28" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="16" y="24" width="16" height="8" rx="2" fill="#2563EB" />
    <circle cx="19" cy="28" r="1.5" fill="#FFFFFF" />
    <circle cx="29" cy="28" r="1.5" fill="#FFFFFF" />
    <path d="M17 18H31" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 34L18 30M36 34L30 30" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 2. UPI AutoPay Vector Logo
export const UpiLogo = ({ className = "w-10 h-5" }) => (
  <svg className={className} viewBox="0 0 64 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="UPI AutoPay">
    <rect width="64" height="24" rx="4" fill="#0EA5E9" fillOpacity="0.12" stroke="#0EA5E9" strokeOpacity="0.3" />
    <path d="M18 6L12 18H16L20 8L24 18H28L22 6H18Z" fill="#0284C7" />
    <path d="M25 6L21 14H25L27 10L29 14H33L29 6H25Z" fill="#059669" />
    <text x="35" y="16" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="10" fill="currentColor">UPI</text>
  </svg>
);

// 3. RuPay Vector Logo
export const RuPayLogo = ({ className = "w-12 h-5" }) => (
  <svg className={className} viewBox="0 0 72 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="RuPay Global">
    <rect width="72" height="24" rx="4" fill="#F97316" fillOpacity="0.1" stroke="#F97316" strokeOpacity="0.25" />
    <path d="M10 6H16C18.2 6 19.5 7.2 19.5 9C19.5 10.8 18.2 12 16 12H13V18H10V6ZM13 10H16C16.8 10 17.2 9.6 17.2 9C17.2 8.4 16.8 8 16 8H13V10Z" fill="#EA580C" />
    <path d="M21 10H23.5V11C24.2 10.3 25.2 9.8 26.2 9.8C28.2 9.8 29.5 11.2 29.5 13.5V18H27V13.8C27 12.5 26.2 11.8 25.2 11.8C24.2 11.8 23.5 12.6 23.5 13.8V18H21V10Z" fill="#0284C7" />
    <text x="32" y="16" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="10" fill="currentColor">RuPay</text>
  </svg>
);

// 4. Visa Vector Mark
export const VisaLogo = ({ className = "w-10 h-5" }) => (
  <svg className={className} viewBox="0 0 54 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
    <rect width="54" height="24" rx="4" fill="#2563EB" fillOpacity="0.12" stroke="#2563EB" strokeOpacity="0.25" />
    <text x="7" y="17" fontFamily="Inter, sans-serif" fontWeight="900" fontStyle="italic" fontSize="14" fill="#1D4ED8" letterSpacing="0.05em">VISA</text>
  </svg>
);

// 5. Mastercard Interlocking Spheres
export const MastercardLogo = ({ className = "w-9 h-5" }) => (
  <svg className={className} viewBox="0 0 44 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
    <rect width="44" height="24" rx="4" fill="#EF4444" fillOpacity="0.1" stroke="#EF4444" strokeOpacity="0.2" />
    <circle cx="17" cy="12" r="7" fill="#EB001B" />
    <circle cx="27" cy="12" r="7" fill="#F79E1B" fillOpacity="0.88" />
  </svg>
);

// 6. Apple Pay Badge
export const ApplePayLogo = ({ className = "w-11 h-5" }) => (
  <svg className={className} viewBox="0 0 56 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Apple Pay">
    <rect width="56" height="24" rx="4" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.2" />
    <path d="M14.5 11.8C14.5 10.4 15.4 9.6 15.5 9.5C14.8 8.6 13.7 8.5 13.3 8.4C12.4 8.3 11.5 8.9 11 8.9C10.5 8.9 9.8 8.4 9.1 8.4C8.1 8.4 7.2 9 6.7 9.9C5.6 11.7 6.4 14.5 7.5 16.1C8.1 16.9 8.7 17.8 9.5 17.7C10.3 17.6 10.6 17.2 11.6 17.2C12.5 17.2 12.8 17.7 13.6 17.7C14.4 17.7 15 16.9 15.5 16.1C16.1 15.3 16.4 14.5 16.4 14.4C16.3 14.4 14.5 13.7 14.5 11.8ZM13.8 7.3C14.2 6.8 14.5 6.1 14.4 5.3C13.8 5.4 12.9 5.8 12.5 6.3C12.1 6.8 11.8 7.5 11.9 8.3C12.6 8.3 13.4 7.8 13.8 7.3Z" fill="currentColor" />
    <text x="21" y="16" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="10" fill="currentColor">Pay</text>
  </svg>
);

// 7. Secure 256-Bit SSL Shield Badge
export const SslShieldBadge = ({ className = "w-4 h-4 text-emerald-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// 8. IATA Accreditation Wing Crest
export const IataWingCrest = ({ className = "w-4 h-4 text-sky-500" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
    <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24" />
    <path d="M19.07 4.93l-4.24 4.24M9.17 14.83l-4.24 4.24" />
  </svg>
);

// 9. TravelEase Branded Compass Emblem (Vector)
export const TravelEaseEmblem = ({ className = "w-6 h-6", animated = false }) => (
  <span className={`inline-block shrink-0 ${animated ? 'animate-pulse' : ''} ${className}`}>
    <img src="/brand/logo-mark.svg" alt="TravelEase Brand Mark" className="w-full h-full object-contain" />
  </span>
);
