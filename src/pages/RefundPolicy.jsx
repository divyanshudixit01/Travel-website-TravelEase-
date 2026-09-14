import React from 'react';
import { motion } from 'framer-motion';
import { FaUndo, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema } from '../utils/schemas';

const RefundPolicy = () => {
  const refundSchemas = [
    getWebPageSchema({
      name: 'Cancellation & Refund Policy — TravelEase',
      description: 'Official cancellation timelines, refund processing speeds, and Tatkal refund guarantees on TravelEase.',
      url: '/refund-policy',
      breadcrumb: true,
    }),
    getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Refund Policy' }], '/refund-policy'),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] text-slate-800 dark:text-slate-200 transition-colors duration-500 py-16 px-4 md:px-8" id="refund-page">
      <JsonLd data={refundSchemas} />

      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mb-8 hover:underline">
          <FaArrowLeft /> Back to TravelEase Portal
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-12 rounded-3xl bg-white dark:bg-[#0f1320] border border-slate-200 dark:border-white/10 shadow-2xl mb-10 relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <FaUndo /> 100% Transparent Timelines
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Cancellation & Refund Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Travel with complete peace of mind. We process cancellations instantly and return funds directly to your original payment method.
          </p>
        </motion.div>

        <div className="space-y-8">
          <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Service-Specific Cancellation Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                <div className="font-bold text-slate-900 dark:text-white mb-1">🏨 Hotel Stays</div>
                <p className="text-slate-600 dark:text-slate-400">Free cancellation up to 24–48 hours prior to check-in on all refundable room tiers.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                <div className="font-bold text-slate-900 dark:text-white mb-1">🚆 Indian Railway Trains</div>
                <p className="text-slate-600 dark:text-slate-400">Refunds processed according to standard IRCTC clerkage and cancellation rules. Waitlist tickets that do not confirm are auto-refunded in full.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                <div className="font-bold text-slate-900 dark:text-white mb-1">🚕 Cabs & Fleet Bookings</div>
                <p className="text-slate-600 dark:text-slate-400">Zero cancellation fee if cancelled within 5 minutes of driver allocation or if the driver is delayed beyond estimated arrival time.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                <div className="font-bold text-slate-900 dark:text-white mb-1">✈️ Flights</div>
                <p className="text-slate-600 dark:text-slate-400">Subject to airline fare rules. Flexi-fare tickets offer full airline credits or refunds directly to original card/UPI.</p>
              </div>
            </div>
          </section>

          <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Refund Processing Speeds</h2>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-2 font-mono">
              <li><strong className="text-slate-900 dark:text-white">UPI & NetBanking:</strong> Typically credited within 2 to 4 business hours.</li>
              <li><strong className="text-slate-900 dark:text-white">Credit & Debit Cards:</strong> 3 to 7 business days depending on your issuing bank.</li>
              <li><strong className="text-slate-900 dark:text-white">TravelEase Wallet:</strong> Instant credit (0 seconds) available for immediate rebooking.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
