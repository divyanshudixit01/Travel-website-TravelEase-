import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, 
  FaHeart, FaArrowUp
} from 'react-icons/fa';
import { FiCheckCircle, FiLock, FiGlobe, FiShield, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { 
  IrctcPartnerSeal, UpiLogo, RuPayLogo, VisaLogo, MastercardLogo, ApplePayLogo 
} from './BrandVectors';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    explore: [
      { name: 'Trending Destinations', path: '/destinations' },
      { name: 'Custom Itinerary Planner', path: '/itinerary', badge: 'INSTANT' },
      { name: 'Travel Chronicles', path: '/blog' },
      { name: 'Interactive Map Explorer', path: '/explore' },
      { name: 'Curated Boutique Stays', path: '/hotels' },
    ],
    services: [
      { name: 'IRCTC Train Booking', path: '/trains', badge: 'TATKAL LIVE' },
      { name: 'Global Flights Radar', path: '/flights' },
      { name: 'Luxury Sanctuary Stays', path: '/hotels' },
      { name: 'Boutique Homestays', path: '/homestays' },
      { name: 'Airport Express Cabs', path: '/cars' },
    ],
    intelligence: [
      { name: 'Multi-Modal Route Engine', path: '/itinerary' },
      { name: 'Tatkal Seat Probability Radar', path: '/trains', badge: '98% ACC' },
      { name: 'Airfare Drop Radar', path: '/flights' },
      { name: 'Live Train Running Status', path: '/trains' },
      { name: 'Interactive 3D Destination Matrix', path: '/explore' },
    ],
    company: [
      { name: 'About TravelEase', path: '/about' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cancellation & Refunds', path: '/refund-policy' },
      { name: 'Contact Concierge', path: '/contact' },
    ],
  };

  const socials = [
    { icon: <FaTwitter className="w-3.5 h-3.5" />, label: 'Twitter', href: 'https://twitter.com' },
    { icon: <FaInstagram className="w-3.5 h-3.5" />, label: 'Instagram', href: 'https://instagram.com' },
    { icon: <FaLinkedin className="w-3.5 h-3.5" />, label: 'LinkedIn', href: 'https://linkedin.com' },
    { icon: <FaYoutube className="w-3.5 h-3.5" />, label: 'YouTube', href: 'https://youtube.com' },
    { icon: <FaFacebook className="w-3.5 h-3.5" />, label: 'Facebook', href: 'https://facebook.com' },
  ];

  return (
    <footer 
      className="relative bg-slate-50 dark:bg-[#06080d] text-slate-600 dark:text-slate-400 pt-16 sm:pt-20 pb-32 lg:pb-16 overflow-hidden border-t border-slate-200/80 dark:border-white/10 transition-colors duration-500" 
      id="site-footer"
    >
      {/* ThreeUI Ambient Glow Layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[220px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Command Strip — Operational Status + System Reassurance + Scroll-to-top */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-10 mb-12 border-b border-slate-200 dark:border-white/10">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            {/* Live operational badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-mono shadow-sm">
              <IrctcPartnerSeal className="w-4 h-4" />
              <span className="text-slate-900 dark:text-slate-200 font-bold">IRCTC AUTHORIZED PARTNER</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">LIVE TATKAL RADAR 99.9%</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/[0.03] border border-slate-300/60 dark:border-white/8 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <FiShield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>100% REFUND GUARANTEE</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>ZERO CONVENIENCE MARKUPS</span>
            </div>

            <div className="hidden xl:inline-flex items-center gap-1.5 text-xs font-mono text-slate-500">
              <FiGlobe className="w-3.5 h-3.5 text-slate-400" />
              <span>190+ Countries Supported</span>
            </div>
          </div>

          {/* ThreeUI Specular Scroll to Top Pill */}
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 hover:border-slate-300 dark:border-white/12 dark:hover:border-white/25 text-xs font-mono text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all shadow-sm dark:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)]"
            aria-label="Return to top of page"
            id="footer-scroll-top-btn"
          >
            <span className="font-bold tracking-wider">BACK TO TOP</span>
            <FaArrowUp className="w-3 h-3 text-amber-500 dark:text-amber-400" />
          </motion.button>
        </div>

        {/* Main Grid: Brand + Directory Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-16">
          
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              {/* Brand Wordmark */}
              <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-amber-500/30 overflow-hidden flex items-center justify-center p-1.5 shadow-[0_4px_16px_rgba(6,182,212,0.25)] group-hover:scale-105 transition-transform">
                  <img src="/brand/logo-mark.svg" alt="TravelEase Mark" className="w-full h-full object-contain" />
                </div>
                <span className="font-brand text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Travel<span className="text-gradient-primary">Ease</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-white/10 border border-amber-500/20 dark:border-white/15 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                  Verified
                </span>
              </Link>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mb-6 font-medium">
                India's premier intelligent travel platform. Real-time Tatkal seat radar, global flight comparison, handpicked boutique stays, and personalized AI itineraries.
              </p>

              {/* Verified Trust Badges */}
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300">
                  <FiCheckCircle className="text-emerald-500 dark:text-emerald-400 w-3.5 h-3.5 shrink-0" />
                  <span>IATA Accredited & Official IRCTC Verified Agent</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300">
                  <FiLock className="text-amber-500 dark:text-amber-400 w-3.5 h-3.5 shrink-0" />
                  <span>256-Bit Bank Grade SSL Encryption</span>
                </div>
              </div>

              {/* Mini Tatkal Telemetry Capsule */}
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-slate-400 max-w-sm shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    IRCTC Direct Gateway
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">STATUS: ACTIVE</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>Tatkal Sync: Instant</span>
                  <span>Confirmation Rate: 98.4%</span>
                </div>
              </div>
            </div>

            {/* Social ThreeUI Tactile Buttons */}
            <div className="flex items-center gap-2 pt-6">
              {socials.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200 hover:border-amber-400/50 dark:border-white/10 dark:hover:border-white/25 flex items-center justify-center text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-all shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns (8 cols: 4 x 2 cols) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                  <span>{category}</span>
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors duration-200 flex items-center justify-between group py-0.5"
                      >
                        <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-transparent group-hover:bg-amber-400 transition-colors" />
                          <span>{link.name}</span>
                        </span>
                        {link.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 dark:border-amber-400/30">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Payment Partners & Security Strip */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 font-bold">
                Verified Gateways:
              </span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                <IrctcPartnerSeal className="w-4 h-4" />
                <span>IRCTC Certified</span>
              </div>
              <UpiLogo className="h-6 w-auto" />
              <RuPayLogo className="h-6 w-auto" />
              <VisaLogo className="h-6 w-auto" />
              <MastercardLogo className="h-6 w-auto" />
              <ApplePayLogo className="h-6 w-auto" />
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 text-slate-700 dark:text-slate-300 shadow-sm">
                English (IN)
              </span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/8 text-amber-600 dark:text-amber-400 font-bold shadow-sm">
                INR (₹) Live
              </span>
            </div>
          </div>
        </div>

        {/* Copyright & Signoff */}
        <div className="border-t border-slate-200 dark:border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} TravelEase OS™. All rights reserved. Registered IRCTC Tatkal Travel Partner.</p>
          <p className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            Crafted with <FaHeart className="text-rose-500 w-3 h-3 animate-pulse" /> for Explorers worldwide 🇮🇳
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;