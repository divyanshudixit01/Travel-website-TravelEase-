import React from 'react';
import { FaStar, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { ThreeCard3D } from '../ui/ThreeCard3D';

export const Testimonials = () => {

  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Creative Director',
      location: 'New York, USA',
      route: 'JFK ➔ DPS (Bali)',
      content: 'TravelEase transformed our Bali vacation into pure architectural magic. From private cliffside villas to seamless Tatkal rail transfers in India on our return leg, every step was flawless.',
      rating: 5,
      trip: 'Bali Sanctuary & Ubud Villa',
      stamp: 'VERIFIED EXPLORER 2026',
      avatar: 'SJ',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Software Architect',
      location: 'Toronto, Canada',
      route: 'YYZ ➔ CDG (Europe)',
      content: 'The AI Trip Architect suggested a tucked-away family-run vineyard in Tuscany that was not on any travel blog. The real-time flight radar saved us $420 on return tickets.',
      rating: 5,
      trip: 'European Grand Rail Tour',
      stamp: 'AI ARCHITECT TESTED',
      avatar: 'MC',
    },
    {
      id: 3,
      name: 'Priya & Rahul Patel',
      role: 'Travel Enthusiasts',
      location: 'Mumbai, India',
      route: 'BOM ➔ NDLS ➔ VNS',
      content: 'Booked Vande Bharat Executive Class tickets with Tatkal prediction. Got confirmed berths within 30 seconds when IRCTC servers were crashing everywhere else. Pure lifesaver!',
      rating: 5,
      trip: 'Vande Bharat Spiritual Odyssey',
      stamp: 'IRCTC TATKAL CONFIRMED',
      avatar: 'PR',
    },
    {
      id: 4,
      name: 'David & Elena Rostova',
      role: 'Photographers',
      location: 'London, UK',
      route: 'LHR ➔ MLE (Maldives)',
      content: 'Our honeymoon in the Maldives exceeded all dreams. The private sunset seaplane transfer arranged through TravelEase Concierge was an awe-inspiring experience.',
      rating: 5,
      trip: 'Maldives Overwater Paradise',
      stamp: 'VIP CONCIERGE ACCESS',
      avatar: 'DE',
    },
  ];

  return (
    <section className="relative py-28 px-4 max-w-7xl mx-auto z-20" id="community-stories">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest mb-3">
          <HiOutlineSparkles className="w-3.5 h-3.5" />
          <span>Global Community Proof</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Trusted by <span className="text-gradient-primary">5,000,000+ travelers</span>
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-base max-w-xl mx-auto mt-3">
          Verified journeys, real confirmation rates, and unforgettable memories from every corner of the world.
        </p>
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
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-600 dark:text-amber-400 text-sm shadow-inner">
                    {rev.avatar}
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
              <span className="text-slate-500 flex items-center gap-1">
                <FaMapMarkerAlt className="text-slate-400" /> {rev.route}
              </span>
            </div>
          </ThreeCard3D>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;