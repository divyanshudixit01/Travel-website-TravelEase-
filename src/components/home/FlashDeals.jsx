import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFire, FaClock, FaStar, FaArrowRight } from 'react-icons/fa';
import { ThreeCard3D } from '../ui/ThreeCard3D';

export const FlashDeals = () => {
  const navigate = useNavigate();

  // Real-time Countdown Timer (Hours, Mins, Secs)
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 38,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const deals = [
    {
      id: 'deal-1',
      title: 'Grand Palace Heritage Suite',
      location: 'New Delhi, India',
      rating: '4.9',
      discount: '-68% FLASH',
      price: '₹4,800',
      origPrice: '₹15,000',
      remaining: 'Only 2 rooms left',
      progress: 85,
      image: '/hero_day_dolomites.jpg',
      path: '/hotels',
    },
    {
      id: 'deal-2',
      title: 'Vande Bharat Executive Class',
      location: 'New Delhi ➔ Varanasi',
      rating: '4.95',
      discount: 'TATKAL LIVE',
      price: '₹2,150',
      origPrice: '₹3,200',
      remaining: '4 seats in window quota',
      progress: 92,
      image: '/images/trains/ir_vande_bharat.jpg',
      path: '/trains',
    },
    {
      id: 'deal-3',
      title: 'Beachfront Sunset Villa',
      location: 'Goa Coastline, India',
      rating: '4.85',
      discount: '-45% WEEKEND',
      price: '₹3,900',
      origPrice: '₹7,200',
      remaining: '3 villas remaining',
      progress: 78,
      image: '/stories-greece-cove.jpg',
      path: '/homestays',
    },
    {
      id: 'deal-4',
      title: 'Direct Non-stop Flights',
      location: 'Mumbai ➔ Dubai Return',
      rating: '4.8',
      discount: '-32% AIRFARE',
      price: '₹15,400',
      origPrice: '₹22,800',
      remaining: 'Last 5 economy fares',
      progress: 64,
      image: '/hero_flying_plane.jpg',
      path: '/flights',
    },
  ];

  return (
    <section className="relative py-20 px-4 max-w-7xl mx-auto z-20" id="flash-deals-countdown">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <FaFire className="w-3.5 h-3.5 animate-pulse text-rose-500" />
            Limited Window Allocations
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Flash <span className="gradient-text">Privileges</span>
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl">
            Live inventory sweeps with steep flash discounts expiring when the timer reaches zero.
          </p>
        </div>

        {/* Global Countdown HUD */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <FaClock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">EXPIRES IN</div>
            <div className="flex items-center gap-1 font-mono text-sm font-black">
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-black/60 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-black/60 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Deals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {deals.map((deal) => (
          <ThreeCard3D
            key={deal.id}
            maxTilt={6}
            spotlightColor="rgba(244, 63, 94, 0.15)"
            onClick={() => navigate(deal.path)}
            className="group cursor-pointer flex flex-col justify-between"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden rounded-2xl m-3 border border-slate-200 dark:border-white/10">
              <img
                src={deal.image}
                alt={deal.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/hero_day_dolomites.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-mono font-bold text-[10px] shadow-lg">
                {deal.discount}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="font-mono text-[11px] text-slate-300">{deal.location}</span>
                <span className="flex items-center gap-1 font-mono font-bold text-amber-400">
                  <FaStar className="w-3 h-3" /> {deal.rating}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 pt-1 flex flex-col justify-between flex-grow">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                  {deal.title}
                </h4>

                {/* Progress Bar for Remaining Allocation */}
                <div className="mt-3 mb-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                    <span className="text-rose-500 dark:text-rose-400 font-semibold">{deal.remaining}</span>
                    <span>{deal.progress}% Claimed</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-1000"
                      style={{ width: `${deal.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] font-mono line-through text-slate-400 dark:text-slate-500 mr-1.5">{deal.origPrice}</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">{deal.price}</span>
                </div>

                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Claim <FaArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </ThreeCard3D>
        ))}
      </div>
    </section>
  );
};

export default FlashDeals;
