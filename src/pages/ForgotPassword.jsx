import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeContext from '../context/ThemeContext';
import {
  FaArrowLeft, FaEnvelope, FaCheckCircle, FaLock, FaShieldAlt,
  FaPaperPlane, FaRedo
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import api from '../services/api';

const ForgotPassword = () => {
  const { theme } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setIsSent(true);
      setCountdown(60);
    } catch (err) {
      // Security standard: show success even if email does not exist to prevent account enumeration
      setIsSent(true);
      setCountdown(60);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center font-sans pt-20 lg:pt-16 pb-12" 
      id="forgot-password-page"
    >
      {/* ─── 1. Unified Full-Bleed Background Image (Spans entire screen) ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src="/auth-forgot-hero.jpg"
          alt="Aurora borealis over Nordic fjord with glass cabin"
          className="w-full h-full object-cover object-center scale-105 filter transition-all duration-1000"
        />

        {/* Seamless Color Blending Overlays — Merges aurora green, violet, and snow across page */}
        {theme === 'dark' ? (
          <>
            <div className="absolute inset-0 bg-[#070b14]/75 backdrop-blur-[14px]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#070b14]/90 via-[#070b14]/65 to-teal-950/25" />
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 85% 40%, rgba(16, 185, 129, 0.14), transparent 60%), radial-gradient(ellipse at 15% 75%, rgba(139, 92, 246, 0.12), transparent 60%)'
              }}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[12px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 via-white/45 to-indigo-50/55" />
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 80% 30%, rgba(20, 184, 166, 0.22), transparent 65%), radial-gradient(ellipse at 20% 80%, rgba(99, 102, 241, 0.18), transparent 65%), radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.45), transparent 75%)'
              }}
            />
          </>
        )}
      </div>

      {/* ─── 2. Main Content Layout (Harmonious Dual-Zone on Unified Canvas) ─── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
        
        {/* Left Brand & Storytelling Column */}
        <div className="w-full lg:w-[50%] flex flex-col justify-center">
          
          {/* Brand Identity Badge */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-3.5 w-fit group mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-2xl"
            aria-label="TravelEase Home"
            title="TravelEase — Home"
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-105 p-2 overflow-hidden"
              style={{
                background: theme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: theme === 'dark' ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid rgba(20, 184, 166, 0.45)',
                boxShadow: theme === 'dark' 
                  ? '0 10px 25px rgba(0,0,0,0.45), 0 0 20px rgba(20, 184, 166, 0.25)' 
                  : '0 10px 25px rgba(20, 184, 166, 0.2), 0 2px 10px rgba(0,0,0,0.06)',
              }}
            >
              <img 
                src="/brand/logo-mark.svg" 
                alt="TravelEase Logo" 
                className="w-full h-full object-contain filter drop-shadow group-hover:rotate-6 transition-transform duration-300" 
              />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white block drop-shadow-sm">
                Travel<span className="text-amber-500 dark:text-amber-400">Ease</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 block">
                Next-Gen Multi-Modal Travel OS
              </span>
            </div>
          </Link>

          {/* Heading Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-teal-700 dark:text-teal-300 mb-4 w-fit"
            style={{
              background: theme === 'dark' ? 'rgba(20, 184, 166, 0.15)' : 'rgba(204, 251, 241, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme === 'dark' ? '1px solid rgba(20, 184, 166, 0.3)' : '1px solid rgba(20, 184, 166, 0.4)',
            }}
          >
            <FaShieldAlt className="w-3.5 h-3.5" />
            <span>Account Security & Recovery</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-[1.12] tracking-tight mb-4 drop-shadow-sm"
          >
            Regain access to your
            <span className="block text-teal-600 dark:text-teal-400 drop-shadow-sm">
              travel world.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-slate-700 dark:text-slate-300 text-sm sm:text-base font-medium leading-relaxed mb-8 max-w-lg"
          >
            Your saved itineraries, flight bookings, and loyalty miles are safely encrypted. Enter your email and we'll dispatch an instant recovery link to resume your journey.
          </motion.p>

          {/* Security Highlights */}
          <div className="space-y-3 max-w-lg hidden sm:block">
            <div 
              className="flex items-center gap-3.5 p-3.5 rounded-2xl"
              style={{
                background: theme === 'dark' ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.60)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 bg-teal-500/15 text-teal-600 dark:text-teal-400">
                <FaLock />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white text-xs font-bold">End-to-End Link Tokenization</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">Time-limited single-use security tokens</p>
              </div>
            </div>

            <div 
              className="flex items-center gap-3.5 p-3.5 rounded-2xl"
              style={{
                background: theme === 'dark' ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.60)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.8)',
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <FaShieldAlt />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white text-xs font-bold">Account Enumeration Protection</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">Strict privacy for registered credentials</p>
              </div>
            </div>
          </div>

          {/* Security Credentials */}
          <div className="hidden sm:flex items-center gap-6 pt-6 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <FaLock className="text-emerald-500" /> 256-Bit SSL Protected
            </span>
            <span className="flex items-center gap-2">
              <FaShieldAlt className="text-sky-500" /> Verified Delivery
            </span>
          </div>
        </div>

        {/* Right Authentication Liquid Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-[46%] max-w-[460px]"
        >
          {/* ─── Ultra-Transparent Liquid Glass Card ─── */}
          <div 
            className="rounded-[32px] p-7 sm:p-9 relative overflow-hidden transition-all duration-300"
            style={{
              background: theme === 'dark' 
                ? 'rgba(15, 23, 42, 0.68)' 
                : 'rgba(255, 255, 255, 0.68)',
              backdropFilter: 'blur(32px) saturate(200%)',
              WebkitBackdropFilter: 'blur(32px) saturate(200%)',
              border: theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.14)'
                : '1px solid rgba(255, 255, 255, 0.85)',
              boxShadow: theme === 'dark'
                ? '0 30px 80px -15px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
                : '0 30px 80px -15px rgba(20, 184, 166, 0.12), 0 15px 35px -5px rgba(15, 23, 42, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
            }}
          >
            {/* Iridescent Top Reflection Rim */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-teal-400/80 to-transparent" />

            {!isSent ? (
              <>
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                    >
                      <FaArrowLeft className="w-3 h-3" /> Back to Sign In
                    </Link>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-500/10 dark:bg-white/[0.06] border border-teal-500/25 dark:border-white/10 shadow-sm">
                      <img src="/brand/logo-mark.svg" alt="TravelEase Mark" className="w-3.5 h-3.5 object-contain" />
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                        Travel<span className="text-amber-500 dark:text-amber-400">Ease</span>
                      </span>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    Reset Password
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                    Enter the email registered with your account, and we'll dispatch password recovery instructions.
                  </p>
                </div>

                {/* Error Notification */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      className="mb-5 overflow-hidden"
                    >
                      <div 
                        className="p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-3 border shadow-sm"
                        style={{
                          background: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 242, 242, 0.9)',
                          borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(252, 165, 165, 0.6)',
                          color: theme === 'dark' ? '#fca5a5' : '#b91c1c',
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                        <span>{errorMsg}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label 
                      htmlFor="forgot-email"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                    >
                      Your Account Email
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FaEnvelope 
                          className={`text-sm transition-colors duration-200 ${
                            focusedField === 'email' ? 'text-teal-500' : 'text-slate-400 dark:text-slate-400'
                          }`} 
                        />
                      </div>
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-[16px] sm:text-sm font-semibold transition-all duration-200 outline-none"
                        style={{
                          background: theme === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.65)',
                          border: focusedField === 'email'
                            ? '1.5px solid #14b8a6'
                            : theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
                          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                          boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(20, 184, 166, 0.15)' : 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="forgot-submit"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-600 to-amber-500 hover:from-teal-400 hover:via-emerald-500 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-teal-500/25 hover:shadow-2xl hover:shadow-teal-500/35 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 relative overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="relative z-10">Send Reset Instructions</span>
                        <FaPaperPlane className="relative z-10 text-xs group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success Confirmation State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-4"
              >
                <div 
                  className="w-16 h-16 rounded-3xl mx-auto mb-5 flex items-center justify-center shadow-xl"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <FaCheckCircle className="w-8 h-8 text-emerald-500" />
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  Check your inbox
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  If an account exists for <strong className="text-slate-900 dark:text-white">{email}</strong>, we've sent password reset instructions. Please check your spam folder if it doesn't appear shortly.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={() => {
                      setIsSent(false);
                    }}
                    className="w-full py-3 px-5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border"
                    style={{
                      background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                      color: countdown > 0 ? '#94a3b8' : theme === 'dark' ? '#f8fafc' : '#0f172a',
                    }}
                  >
                    <FaRedo className={`text-xs ${countdown > 0 ? '' : 'text-amber-500'}`} />
                    <span>{countdown > 0 ? `Resend available in ${countdown}s` : 'Try another email or resend'}</span>
                  </button>

                  <Link
                    to="/login"
                    className="block w-full py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                  >
                    Return to Sign In
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Security Guarantee Badges */}
            <div 
              className="mt-6 pt-5 flex items-center justify-center gap-6 text-[11px] font-bold text-slate-500 dark:text-slate-400"
              style={{
                borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <span className="flex items-center gap-1.5">
                <FaLock className="text-emerald-500" /> 256-Bit SSL
              </span>
              <span className="flex items-center gap-1.5">
                <FaShieldAlt className="text-sky-500" /> Verified Delivery
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
