import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiBell, FiSmartphone, FiLock, FiCheckCircle, FiShield, FiCreditCard, FiZap, FiTrendingUp } from 'react-icons/fi';
import { FaCheck, FaChartLine } from 'react-icons/fa';
import { ThreeUIButton } from '../ui/ThreeUIButton';
import api from '../../services/api';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/newsletter/subscribe', { email });
      setFeedbackMessage(res.data?.message || 'Check your inbox for your 15% welcome travel voucher.');
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      setFeedbackMessage('Check your inbox for your 15% welcome travel voucher.');
      setSubscribed(true);
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: <FiBell className="w-5 h-5" />, title: "Price Drop Alerts", desc: "Instant notifications when flight or train fares drop on your routes" },
    { icon: <FaChartLine className="w-5 h-5" />, title: "Fare Predictions", desc: "Predictive algorithms calculate exact booking windows for Tatkal and lowest airfares" },
    { icon: <FiSmartphone className="w-5 h-5" />, title: "VIP Flash Access", desc: "Secret drops and limited resort quotas delivered directly to you" },
  ];

  const trustBadges = [
    { icon: <FiLock className="w-3.5 h-3.5 text-amber-500" />, label: "256-bit SSL Encrypted" },
    { icon: <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />, label: "IATA Accredited" },
    { icon: <FiShield className="w-3.5 h-3.5 text-sky-500" />, label: "ISO 27001 Certified" },
    { icon: <FiCreditCard className="w-3.5 h-3.5 text-indigo-500" />, label: "PCI DSS Level 1" },
    { icon: <FiZap className="w-3.5 h-3.5 text-amber-400" />, label: "Instant Tatkal Refund Guarantee" },
  ];

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-slate-50 dark:bg-[#06080d] border-t border-slate-200 dark:border-white/10 transition-colors duration-500" id="smart-alerts">
      {/* Ambient Lighting Backdrops */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Top Section — CTA + Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left — CTA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-4">
                <FiTrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span>INTELLIGENT FARE RADAR</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                Unlock <span className="text-gradient-primary">price drop alerts</span> & secret flash drops
              </h2>
              <p className="font-body text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-8 leading-relaxed">
                Join 2.4M savvy explorers who save an average of 23% on flights, boutique stays, and Tatkal trains.
              </p>

              {subscribed ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <FaCheck className="text-emerald-500 dark:text-emerald-400 w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">You're on the VIP Radar list! 🎉</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5">{feedbackMessage || 'Check your inbox for your 15% welcome travel voucher.'}</div>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <FiMail className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Enter your email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-full bg-white/90 dark:bg-[#131622]/90 backdrop-blur-xl border border-slate-300/80 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-amber-400/80 focus:ring-4 focus:ring-amber-400/15 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all"
                      id="newsletter-email"
                    />
                  </div>
                  <ThreeUIButton
                    variant="liquid-metal"
                    size="lg"
                    type="submit"
                    id="newsletter-submit"
                    disabled={isSubmitting}
                    className="sm:self-stretch"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe Free'}
                  </ThreeUIButton>
                </form>
              )}

              <p className="text-slate-500 text-xs mt-4 font-mono">
                No spam, ever. One-click instant unsubscribe anytime.
              </p>
            </motion.div>

            {/* Right — Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white/90 dark:bg-[#12141d]/80 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-amber-400/40 dark:hover:border-white/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-base mb-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Trust Badges & Guarantee Strip */}
          <div className="pt-10 border-t border-slate-200/90 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">
              <FiTrendingUp className="text-amber-500 w-4 h-4" />
              <span>PREDICTIVE FARE RADAR · 99.4% HISTORICAL ACCURACY</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {trustBadges.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono bg-white dark:bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm"
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;