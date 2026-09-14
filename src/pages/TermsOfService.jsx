import React from 'react';
import { motion } from 'framer-motion';
import { FaFileContract, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema } from '../utils/schemas';

const TermsOfService = () => {
  const termsSchemas = [
    getWebPageSchema({
      name: 'Terms of Service — TravelEase',
      description: 'Official terms and conditions governing bookings, cancellations, and ticketing on the TravelEase platform.',
      url: '/terms',
      breadcrumb: true,
    }),
    getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Terms of Service' }], '/terms'),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] text-slate-800 dark:text-slate-200 transition-colors duration-500 py-16 px-4 md:px-8" id="terms-page">
      <JsonLd data={termsSchemas} />

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <FaFileContract /> Universal Terms of Use
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Terms of Service & E-Commerce Agreement
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Please read these terms carefully before confirming reservations across our transport, accommodation, and fleet aggregation engines.
          </p>
        </motion.div>

        <div className="space-y-8">
          <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Role as Certified Travel Platform & Aggregator</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
              TravelEase acts as an authorized digital aggregator and technology interface connecting passengers directly with verified airlines, Indian Railways (IRCTC guidelines), licensed hoteliers, and licensed fleet networks (Uber, Rapido, Bharat Taxi).
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              When a booking is confirmed, the official e-ticket or driver dispatch token represents a binding service agreement governed by the underlying carrier's operating regulations.
            </p>
          </section>

          <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Fare Guarantees & Currency Conversion</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              All displayed prices include mandatory government taxes and fees. When paying in non-base currencies (USD, EUR, GBP, INR), conversion rates are calculated via live daily exchange rates with zero hidden markups.
            </p>
          </section>

          <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Account Integrity</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Users are responsible for ensuring accurate legal names matching government photo ID cards at airport security, train ticket checking, and hotel check-in desks.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
