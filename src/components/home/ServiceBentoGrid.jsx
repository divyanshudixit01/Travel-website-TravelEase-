import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaTrain, FaPlane, FaHotel, 
  FaArrowRight, FaStar, FaBolt, FaCheckCircle
} from 'react-icons/fa';
import { FiTrendingDown, FiMapPin, FiNavigation, FiLayers } from 'react-icons/fi';
import { ThreeCard3D } from '../ui/ThreeCard3D';
import { ThreeUIButton } from '../ui/ThreeUIButton';
import { IrctcPartnerSeal } from '../common/BrandVectors';
import { 
  getHotelsRoute, 
  getFlightsRoute, 
  getItineraryRoute 
} from '../../utils/travelBridge';

export const ServiceBentoGrid = () => {
  const navigate = useNavigate();
  const [activeTrainRoute, setActiveTrainRoute] = useState(0);

  const trainRoutes = [
    { no: '22436', name: 'Vande Bharat Express', from: 'New Delhi (NDLS)', to: 'Varanasi (BSB)', destCity: 'Varanasi', time: '8h 00m', prob: '98% Confirmed', speed: '130 km/h' },
    { no: '12002', name: 'Bhopal Shatabdi', from: 'New Delhi (NDLS)', to: 'Agra Cantt (AGC)', destCity: 'Agra', time: '1h 50m', prob: '95% Confirmed', speed: '150 km/h' },
    { no: '20608', name: 'Vande Bharat Mysuru', from: 'Chennai (MAS)', to: 'Bengaluru (SBC)', destCity: 'Bengaluru', time: '4h 20m', prob: '97% Confirmed', speed: '130 km/h' },
  ];

  const flightMatrix = [
    { from: 'DEL', to: 'DXB', destName: 'Dubai', label: 'Delhi (DEL) ➔ Dubai (DXB)', price: '₹14,990', diff: 'Lowest in 30 days', airline: 'Emirates / Indigo' },
    { from: 'BOM', to: 'DPS', destName: 'Bali', label: 'Mumbai (BOM) ➔ Bali (DPS)', price: '₹22,400', diff: 'Trending Honeymoon', airline: 'Singapore Airlines' },
    { from: 'BLR', to: 'CDG', destName: 'Paris', label: 'Bangalore (BLR) ➔ Paris (CDG)', price: '₹41,200', diff: 'Direct Non-stop', airline: 'Air France' },
  ];

  const popularHotelHubs = ['Varanasi', 'Ayodhya', 'Udaipur', 'Goa', 'Jaipur', 'Manali'];

  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20" id="services-bento-grid">
      {/* 3-Tier Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
            <FiLayers className="w-3.5 h-3.5 text-amber-500" />
            <span>INTEGRATED TRAVEL ECOSYSTEM</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Engineered for <span className="text-gradient-primary">seamless exploration</span>
          </h2>
          <p className="font-body text-slate-600 dark:text-slate-400 text-sm md:text-base mt-3 max-w-xl leading-relaxed">
            Live IRCTC Tatkal prediction, global flight radar, boutique stays, and multi-modal route planning — unified into one platform.
          </p>
        </div>

        <div className="mt-2 md:mt-0 shrink-0">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 uppercase tracking-wider group tap-bounce"
          >
            <span>Explore All 190+ Countries</span>
            <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Bento Grid Container (Robust 12-col grid across all devices) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        
        {/* CARD 1: FEATURED TRAINS RADAR (7 COLS) */}
        <div className="md:col-span-2 lg:col-span-7">
          <ThreeCard3D spotlightColor="rgba(168, 85, 247, 0.15)" className="p-6 md:p-8 flex flex-col justify-between min-h-[420px]">
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <FaTrain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Train Journeys & Tatkal Live
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-black inline-flex items-center gap-1">
                        <IrctcPartnerSeal className="w-3 h-3" />
                        <span>IRCTC Verified</span>
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">High-speed rail booking with instant seat prediction</p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Tatkal Radar Active</span>
                </div>
              </div>

              {/* Interactive Route Selector Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
                {trainRoutes.map((route, idx) => (
                  <button
                    key={route.no}
                    type="button"
                    onClick={() => setActiveTrainRoute(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all border ${
                      activeTrainRoute === idx
                        ? 'bg-purple-600 dark:bg-purple-500/20 border-purple-500 text-white font-bold shadow-md'
                        : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    #{route.no} {route.name}
                  </button>
                ))}
              </div>

              {/* Live Train Route Card Preview */}
              <div 
                onClick={() => {
                  const current = trainRoutes[activeTrainRoute];
                  const fromCode = current.from.match(/\((.*?)\)/)?.[1] || 'NDLS';
                  const toCode = current.to.match(/\((.*?)\)/)?.[1] || 'BSB';
                  navigate(`/trains?from=${fromCode}&to=${toCode}&train=${current.no}`);
                }}
                className="p-4 rounded-2xl bg-slate-100/90 dark:bg-black/40 border border-slate-200/90 dark:border-white/10 mb-6 shadow-sm cursor-pointer hover:border-purple-400/50 transition-colors"
                title="Click to search this train corridor"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ROUTE PREVIEW · CLICK TO SEARCH</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{trainRoutes[activeTrainRoute].name}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{trainRoutes[activeTrainRoute].prob}</span>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">Speed: {trainRoutes[activeTrainRoute].speed}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-amber-500" />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{trainRoutes[activeTrainRoute].from}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                    <span>────── {trainRoutes[activeTrainRoute].time} ──────▶</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{trainRoutes[activeTrainRoute].to}</span>
                    <FiMapPin className="text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Link
                  to={getHotelsRoute(trainRoutes[activeTrainRoute].destCity)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-mono font-bold transition-colors"
                >
                  <FaHotel className="w-3 h-3" />
                  <span>Stays in {trainRoutes[activeTrainRoute].destCity}</span>
                </Link>
              </div>

              <ThreeUIButton
                variant="liquid-metal"
                size="md"
                to={`/trains?from=${trainRoutes[activeTrainRoute].from.match(/\((.*?)\)/)?.[1] || 'NDLS'}&to=${trainRoutes[activeTrainRoute].to.match(/\((.*?)\)/)?.[1] || 'BSB'}&train=${trainRoutes[activeTrainRoute].no}`}
                icon={<FaTrain className="w-3.5 h-3.5 text-purple-600" />}
              >
                Book #{trainRoutes[activeTrainRoute].no}
              </ThreeUIButton>
            </div>
          </ThreeCard3D>
        </div>

        {/* CARD 2: FLIGHTS FARE RADAR (5 COLS) */}
        <div className="md:col-span-2 lg:col-span-5">
          <ThreeCard3D spotlightColor="rgba(56, 189, 248, 0.15)" className="p-6 md:p-8 flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500 dark:text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                    <FaPlane className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global Flight Matrix</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Real-time airfare comparison</p>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-mono font-bold flex items-center gap-1">
                  <FiTrendingDown />
                  <span>-24% Today</span>
                </div>
              </div>

              {/* Clickable Flight Rows */}
              <div className="space-y-2.5 mb-6">
                {flightMatrix.map((f, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => navigate(getFlightsRoute(f.to, f.from))}
                    className="w-full text-left p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 hover:border-sky-400/50 dark:hover:border-sky-400/40 hover:bg-sky-50/50 dark:hover:bg-white/[0.05] transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {f.label}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{f.airline} · {f.diff}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">{f.price}</div>
                      <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center justify-end gap-1">
                        <span>Search</span>
                        <FaArrowRight className="w-2 h-2 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">1,400+ Global Airlines</span>
              <ThreeUIButton
                variant="specular-dark"
                size="sm"
                to="/flights"
                icon={<FaPlane className="w-3 h-3 text-sky-400" />}
              >
                Search Flights
              </ThreeUIButton>
            </div>
          </ThreeCard3D>
        </div>

        {/* CARD 3: HOTELS & SANCTUARY STAYS (5 COLS) */}
        <div className="md:col-span-2 lg:col-span-5">
          <ThreeCard3D spotlightColor="rgba(245, 158, 11, 0.15)" className="p-6 md:p-8 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <FaHotel className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Luxury & Boutique Stays</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Villas, castles & private sanctuaries</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-xs font-bold font-mono">
                  <FaStar className="w-3 h-3" />
                  <span>4.95 Rating</span>
                </div>
              </div>

              {/* Clickable Hotel Media Preview */}
              <div 
                onClick={() => navigate(getHotelsRoute('Udaipur'))}
                className="relative h-44 rounded-2xl overflow-hidden mb-3 border border-slate-200 dark:border-white/10 cursor-pointer group"
                title="Click to view verified hotels in Udaipur"
              >
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                  alt="Luxury Villa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-amber-400">Udaipur, India</div>
                    <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">The Oberoi Udaivilas Heritage</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-300">From</div>
                    <div className="text-base font-extrabold text-white font-mono">₹24,500 <span className="text-xs font-normal text-slate-300">/night</span></div>
                  </div>
                </div>
              </div>

              {/* Quick Hotel Destination Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold mr-1">Hotels in:</span>
                {popularHotelHubs.map((hub) => (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => navigate(getHotelsRoute(hub))}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-amber-400/20 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 border border-slate-200 dark:border-white/10 text-[10px] font-mono font-semibold transition-colors"
                  >
                    {hub}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Member Perks: Free Breakfast</span>
              <ThreeUIButton
                variant="specular-dark"
                size="sm"
                to={getHotelsRoute('Udaipur')}
              >
                Browse Hotels in Udaipur
              </ThreeUIButton>
            </div>
          </ThreeCard3D>
        </div>

        {/* CARD 4: SMART ROUTE ENGINE (7 COLS) */}
        <div className="md:col-span-2 lg:col-span-7">
          <ThreeCard3D spotlightColor="rgba(245, 158, 11, 0.2)" className="p-6 md:p-8 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.35)]">
                    <FiNavigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Multi-Modal Route Engine
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                        Dynamic Routing
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Generates 100% verified day-by-day travel itineraries</p>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
                  Avg compile: 1.2s
                </div>
              </div>

              {/* 4 Interactive Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { step: '01', title: 'Target & Vibe', desc: 'Pick cities & mood' },
                  { step: '02', title: 'Transit Match', desc: 'Flights + hotels sync' },
                  { step: '03', title: 'Route Optimizer', desc: 'Day-by-day map flow' },
                  { step: '04', title: 'Single Checkout', desc: 'Instant voucher issuance' },
                ].map((item) => (
                  <div key={item.step} className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/5 hover:border-amber-400/50 dark:hover:border-amber-400/30 transition-colors shadow-sm">
                    <div className="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">{item.step}</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{item.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-mono">Trending:</span>
                <Link
                  to={getItineraryRoute('Varanasi', 'Plan a 4-day spiritual journey to Varanasi with Vande Bharat Express and Ganga Aarti under ₹15,000')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold border border-amber-500/20 transition-colors"
                >
                  Varanasi (4D)
                </Link>
                <Link
                  to={getItineraryRoute('Kerala', 'Plan a 5-day Kerala backwaters houseboat and tea estate trip under ₹25,000')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/20 transition-colors"
                >
                  Kerala (5D)
                </Link>
              </div>

              <ThreeUIButton
                variant="amber-glow"
                size="md"
                to={`/itinerary?prompt=${encodeURIComponent('Plan a comprehensive 7-day trip to Tokyo & Kyoto with authentic cultural experiences, bullet train routes, and handpicked boutique stays under ₹1.2L budget')}`}
                icon={<FiNavigation className="w-4 h-4 text-black" />}
              >
                Build My Itinerary
              </ThreeUIButton>
            </div>
          </ThreeCard3D>
        </div>

      </div>
    </section>
  );
};

export default ServiceBentoGrid;
