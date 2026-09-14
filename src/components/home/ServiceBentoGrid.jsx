import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTrain, FaPlane, FaHotel, 
  FaArrowRight, FaStar, FaBolt, FaCheckCircle
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FiTrendingDown, FiMapPin } from 'react-icons/fi';
import { ThreeCard3D } from '../ui/ThreeCard3D';
import { ThreeUIButton } from '../ui/ThreeUIButton';

export const ServiceBentoGrid = () => {
  const [activeTrainRoute, setActiveTrainRoute] = useState(0);

  const trainRoutes = [
    { no: '22436', name: 'Vande Bharat Express', from: 'New Delhi (NDLS)', to: 'Varanasi (BSB)', time: '8h 00m', prob: '98% Confirmed', speed: '130 km/h' },
    { no: '12002', name: 'Bhopal Shatabdi', from: 'New Delhi (NDLS)', to: 'Agra Cantt (AGC)', time: '1h 50m', prob: '95% Confirmed', speed: '150 km/h' },
    { no: '20608', name: 'Vande Bharat Mysuru', from: 'Chennai (MAS)', to: 'Bengaluru (SBC)', time: '4h 20m', prob: '97% Confirmed', speed: '130 km/h' },
  ];

  return (
    <section className="relative py-20 px-4 max-w-7xl mx-auto z-20" id="services-bento-grid">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
            <HiOutlineSparkles className="w-3.5 h-3.5" />
            <span>Integrated Travel Ecosystem</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for <span className="text-gradient-primary">seamless exploration</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base mt-2 max-w-xl">
            Live IRCTC Tatkal prediction, global flight radar, boutique stays, and AI generation — unified into one platform.
          </p>
        </div>

        <div className="mt-4 md:mt-0">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 uppercase tracking-wider group"
          >
            <span>Explore All 190+ Countries</span>
            <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-5">
        
        {/* CARD 1: FEATURED TRAINS RADAR (7 COLS) */}
        <div className="lg:col-span-7">
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-black">
                        IRCTC Verified
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
              <div className="p-4 rounded-2xl bg-slate-100/90 dark:bg-black/40 border border-slate-200/90 dark:border-white/10 mb-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ROUTE PREVIEW</span>
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
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-500 w-3 h-3" /> Zero Gateway Fee
                </span>
                <span className="flex items-center gap-1.5">
                  <FaBolt className="text-amber-500 w-3 h-3" /> Instant Tatkal Refund
                </span>
              </div>

              <ThreeUIButton
                variant="liquid-metal"
                size="md"
                to="/trains"
                icon={<FaTrain className="w-3.5 h-3.5 text-purple-600" />}
              >
                Launch Train Booking
              </ThreeUIButton>
            </div>
          </ThreeCard3D>
        </div>

        {/* CARD 2: FLIGHTS FARE RADAR (5 COLS) */}
        <div className="lg:col-span-5">
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

              <div className="space-y-2.5 mb-6">
                {[
                  { route: 'Delhi (DEL) ➔ Dubai (DXB)', price: '₹14,990', diff: 'Lowest in 30 days', airline: 'Emirates / Indigo' },
                  { route: 'Mumbai (BOM) ➔ Bali (DPS)', price: '₹22,400', diff: 'Trending Honeymoon', airline: 'Singapore Airlines' },
                  { route: 'Bangalore (BLR) ➔ Paris (CDG)', price: '₹41,200', diff: 'Direct Non-stop', airline: 'Air France' },
                ].map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 hover:border-amber-400/40 dark:hover:border-white/15 transition-colors flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{f.route}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{f.airline} · {f.diff}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{f.price}</div>
                      <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">Best Rate</div>
                    </div>
                  </div>
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
        <div className="lg:col-span-5">
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

              <div className="relative h-44 rounded-2xl overflow-hidden mb-4 border border-slate-200 dark:border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                  alt="Luxury Villa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-amber-400">Udaipur, India</div>
                    <div className="text-sm font-bold text-white">The Oberoi Udaivilas Heritage</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-300">From</div>
                    <div className="text-base font-extrabold text-white">₹24,500 <span className="text-xs font-normal text-slate-300">/night</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Member Perks: Free Breakfast</span>
              <ThreeUIButton
                variant="specular-dark"
                size="sm"
                to="/hotels"
              >
                Browse Hotels
              </ThreeUIButton>
            </div>
          </ThreeCard3D>
        </div>

        {/* CARD 4: SMART TRIP ARCHITECT (7 COLS) */}
        <div className="lg:col-span-7">
          <ThreeCard3D spotlightColor="rgba(245, 158, 11, 0.2)" className="p-6 md:p-8 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.35)]">
                    <HiOutlineSparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      AI Trip Architect
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                        Gemini 2.5
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Generates 100% custom day-by-day itineraries</p>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
                  Avg generation: 1.8s
                </div>
              </div>

              {/* 4 Interactive Steps */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { step: '01', title: 'Target & Vibe', desc: 'Pick cities & mood' },
                  { step: '02', title: 'Neural Match', desc: 'Flights + hotels sync' },
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
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Try: <span className="text-amber-600 dark:text-amber-400 font-mono">"7 days in Tokyo & Kyoto on ₹1.2L budget"</span>
              </span>

              <ThreeUIButton
                variant="amber-glow"
                size="md"
                to="/itinerary"
                icon={<HiOutlineSparkles className="w-4 h-4 text-black" />}
              >
                Generate My Itinerary
              </ThreeUIButton>
            </div>
          </ThreeCard3D>
        </div>

      </div>
    </section>
  );
};

export default ServiceBentoGrid;
