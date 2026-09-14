import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaLock, FaUserCheck, FaDatabase, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema } from '../utils/schemas';

const PrivacyPolicy = () => {
  const privacySchemas = [
    getWebPageSchema({
      name: 'Privacy & Security Policy — TravelEase',
      description: 'Transparent overview of how TravelEase encrypts and safeguards your personal data, reservations, and payment credentials.',
      url: '/privacy',
      breadcrumb: true,
    }),
    getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Privacy Policy' }], '/privacy'),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] text-slate-800 dark:text-slate-200 transition-colors duration-500 py-16 px-4 md:px-8" id="privacy-page">
      <JsonLd data={privacySchemas} />

      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mb-8 hover:underline">
          <FaArrowLeft /> Back to TravelEase Portal
        </Link>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-12 rounded-3xl bg-white dark:bg-[#0f1320] border border-slate-200 dark:border-white/10 shadow-2xl mb-10 relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <FaShieldAlt /> 256-Bit TLS · Data Sovereignty
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Privacy & Data Security Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Effective Date: September 2026. TravelEase is committed to absolute transparency regarding how your identity, travel bookings, and payment tokens are protected.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <FaLock />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Data We Collect</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              We collect only the information strictly required to verify, reserve, and issue your official e-tickets across global airlines, IRCTC Indian Railways, hotel networks, and unified cab fleets:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-1.5 ml-2 font-mono">
              <li>Primary Traveler Name, Government ID / Passport number (where required by carriers).</li>
              <li>Encrypted Contact Details: Email address for ticket delivery and phone number for SMS gate/train updates.</li>
              <li>Tokenized Payment References (credit card numbers are never stored in plaintext).</li>
            </ul>
          </section>

          <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                <FaDatabase />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Unified Cab & Fleet Dispatch Data</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              When booking rides via our integrated Cab Aggregator (Uber, Rapido, Bharat Taxi), your TravelEase identity is used to generate a secure ride token. We share only your designated pick-up and drop-off coordinates with the driver partner. Your personal credentials remain completely private.
            </p>
          </section>

          <section className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <FaUserCheck />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Your Rights & Data Deletion</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              You maintain complete control over your personal data. You may request a complete export of all past reservations or demand irrevocable erasure of your account by contacting our compliance officer at <span className="font-mono text-amber-500">privacy@travelease.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
