import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaCheckCircle, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { ThreeCard3D } from '../ui/ThreeCard3D';

export const Testimonials = () => {
  const navigate = useNavigate();

  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Creative Director',
      location: 'New York, USA',
      route: 'JFK ➔ DPS (Bali)',
      routePath: '/flights?from=JFK&to=DPS&destination=Bali',
      content: 'TravelEase transformed our Bali vacation into pure architectural magic. From private cliffside villas to seamless Tatkal rail transfers in India on our return leg, every step was flawless.',
      rating: 5,
      trip: 'Bali Sanctuary & Ubud Villa',
      stamp: 'VERIFIED EXPLORER 2026',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Software Architect',
      location: 'Toronto, Canada',
      route: 'YYZ ➔ CDG (Europe)',
      routePath: '/flights?from=YYZ&to=CDG&destination=Paris',
      content: 'The Route Architect suggested a tucked-away family-run vineyard in Tuscany that was not on any travel blog. The real-time flight radar saved us $420 on return tickets.',
      rating: 5,
      trip: 'European Grand Rail Tour',
      stamp: 'ROUTE ARCHITECT TESTED',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 3,
      name: 'Priya & Rahul Patel',
      role: 'Travel Enthusiasts',
      location: 'Mumbai, India',
      route: 'NDLS ➔ BSB (Varanasi)',
      routePath: '/trains?from=NDLS&to=BSB&destination=Varanasi',
      content: 'Booked Vande Bharat Executive Class tickets with Tatkal prediction. Got confirmed berths within 30 seconds when IRCTC servers were crashing everywhere else. Pure lifesaver!',
      rating: 5,
      trip: 'Vande Bharat Spiritual Odyssey',
      stamp: 'IRCTC TATKAL CONFIRMED',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 4,
      name: 'David & Elena Rostova',
      role: 'Photographers',
      location: 'London, UK',
      route: 'LHR ➔ MLE (Maldives)',
      routePath: '/flights?from=LHR&to=MLE&destination=Maldives',
      content: 'Our honeymoon in the Maldives exceeded all dreams. The private sunset seaplane transfer arranged through TravelEase Concierge was an awe-inspiring experience.',
      rating: 5,
      trip: 'Maldives Overwater Paradise',
      stamp: 'VIP CONCIERGE ACCESS',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20" id="community-stories">
      {/* 3-Tier Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
            <FaCheckCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>REAL TRAVELER COMMUNITY</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Trusted by <span className="text-gradient-primary">discerning travelers</span>
          </h2>
          <p className="font-body text-slate-600 dark:text-slate-400 text-sm md:text-base mt-3 max-w-xl leading-relaxed">
            Over 5 million expeditions planned, confirmed, and remembered. Verified community feedback from real bookings.
          </p>
        </div>

        <div className="mt-2 md:mt-0 font-mono text-xs text-slate-500 shrink-0">
          GLOBAL SATISFACTION: <span className="text-amber-500 font-bold tabular-nums">99.4%</span>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <ThreeCard3D
            key={rev.id}
            maxTilt={5}
            spotlightColor="rgba(245, 158, 11, 0.12)"
            className="p-6 md:p-8 flex flex-col justify-between"
          >
            <div>
              {/* Card Top: Passport Stamp + Rating */}
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-600 dark:text-amber-400 text-sm shadow-inner overflow-hidden shrink-0">
                    {rev.avatarUrl ? (
                      <img 
                        src={rev.avatarUrl} 
                        alt={rev.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }} 
                      />
                    ) : (
                      rev.avatar
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {rev.name}
                      <FaCheckCircle className="text-emerald-500 w-3.5 h-3.5" title="Verified Traveler" />
                    </h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{rev.role} · {rev.location}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 mb-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <FaStar key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 text-[9px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {rev.stamp}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-6 italic">
                "{rev.content}"
              </p>
            </div>

            {/* Bottom Meta */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-amber-600 dark:text-amber-400 font-bold">{rev.trip}</span>
              <button
                type="button"
                onClick={() => navigate(rev.routePath)}
                className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 flex items-center gap-1.5 transition-colors group cursor-pointer"
                title="Search this live travel route"
              >
                <FaMapMarkerAlt className="text-amber-500" />
                <span className="underline decoration-dotted underline-offset-2">{rev.route}</span>
                <FaArrowRight className="w-2 h-2 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </ThreeCard3D>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;