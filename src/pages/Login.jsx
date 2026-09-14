import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import {
  FaArrowRight, FaCheck, FaShieldAlt,
  FaLock, FaEnvelope, FaPlane, FaRoute, FaHeadset
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { addToast } = useBooking();

  const redirectPath = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim().toLowerCase(), password);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsLoading(false);
        addToast('Welcome back! Successfully signed in.', 'success');
        navigate(redirectPath, { replace: true });
      }, 800);
    } else {
      setIsLoading(false);
      setErrorMsg(result.message || 'Invalid email or password. Please try again.');
    }
  };

  const features = [
    { 
      icon: <FaRoute className="text-amber-500 dark:text-amber-400" />, 
      title: 'AI Smart Itineraries', 
      desc: 'Bespoke day-by-day travel plans curated in seconds' 
    },
    { 
      icon: <FaPlane className="text-sky-500 dark:text-sky-400" />, 
      title: 'Live Real-Time Booking', 
      desc: 'Direct fares for flights, luxury hotels & trains' 
    },
    { 
      icon: <FaHeadset className="text-emerald-500 dark:text-emerald-400" />, 
      title: '24/7 Concierge Support', 
      desc: 'Smart agent for rebooking, gates & local tips' 
    },
  ];

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center font-sans pt-20 lg:pt-16 pb-12" 
      id="login-page"
    >
      {/* ─── 1. Unified Full-Bleed Background Image (Spans entire screen) ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <img
          src="/auth-travel-hero.jpg"
          alt="Tropical paradise sunset beach"
          className="w-full h-full object-cover object-center scale-105 filter transition-all duration-1000"
        />

        {/* Seamless Color Blending Overlays — Merges image colors throughout the entire page */}
        {theme === 'dark' ? (
          <>
            {/* Dark Mode Color Veil */}
            <div className="absolute inset-0 bg-[#070b14]/75 backdrop-blur-[14px]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#070b14]/90 via-[#070b14]/65 to-amber-950/25" />
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 85% 40%, rgba(245, 158, 11, 0.14), transparent 60%), radial-gradient(ellipse at 15% 75%, rgba(14, 165, 233, 0.12), transparent 60%)'
              }}
            />
          </>
        ) : (
          <>
            {/* Light Mode Color Veil — Merges sunset amber, ocean turquoise, and white froth across the entire canvas */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[12px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 via-white/45 to-sky-50/55" />
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 80% 30%, rgba(251, 191, 36, 0.25), transparent 65%), radial-gradient(ellipse at 20% 80%, rgba(56, 189, 248, 0.20), transparent 65%), radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.45), transparent 75%)'
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
          <Link to="/" className="inline-flex items-center gap-3 w-fit group mb-6">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-105"
              style={{
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: theme === 'dark' ? '0 10px 25px rgba(0,0,0,0.3)' : '0 10px 25px rgba(245, 158, 11, 0.15)',
              }}
            >
              <HiOutlineSparkles className="w-6 h-6 text-amber-500 dark:text-amber-400 drop-shadow" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white block drop-shadow-sm">
                Travel<span className="text-amber-500 dark:text-amber-400">Ease</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 block">
                AI Travel Platform
              </span>
            </div>
          </Link>

          {/* Heading Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300 mb-4 w-fit"
            style={{
              background: theme === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(254, 243, 199, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme === 'dark' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.4)',
            }}
          >
            <HiOutlineSparkles className="w-3.5 h-3.5" />
            <span>Intelligent Global Travel</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-[1.12] tracking-tight mb-4 drop-shadow-sm"
          >
            Your next adventure
            <span className="block text-amber-600 dark:text-amber-400 drop-shadow-sm">
              starts right here.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-slate-700 dark:text-slate-300 text-sm sm:text-base font-medium leading-relaxed mb-8 max-w-lg"
          >
            Sign in to access synchronized itineraries, unlock member-only flight & hotel tariffs, and explore autonomous AI concierge planning.
          </motion.p>

          {/* Liquid Glass Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-3 max-w-lg hidden sm:block"
          >
            {features.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: theme === 'dark' ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.60)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: theme === 'dark' 
                    ? '0 8px 24px rgba(0, 0, 0, 0.25)' 
                    : '0 8px 24px rgba(15, 23, 42, 0.05)',
                }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 shadow-sm"
                  style={{
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.9)',
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white text-sm font-bold leading-snug">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Security Credentials */}
          <div className="hidden sm:flex items-center gap-6 pt-6 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <FaLock className="text-emerald-500" /> 256-Bit SSL Protection
            </span>
            <span className="flex items-center gap-2">
              <FaShieldAlt className="text-sky-500" /> SOC 2 Certified
            </span>
            <span className="flex items-center gap-2">
              <FaCheck className="text-amber-500" /> Verified Bookings
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
                : '0 30px 80px -15px rgba(245, 158, 11, 0.12), 0 15px 35px -5px rgba(15, 23, 42, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
            }}
          >
            {/* Iridescent Top Reflection Rim */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Welcome back
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                Sign in to manage your bookings and access personalized travel insights.
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="login-email"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FaEnvelope 
                      className={`text-sm transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-400'
                      }`} 
                    />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-[16px] sm:text-sm font-semibold transition-all duration-200 outline-none"
                    style={{
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.65)',
                      border: focusedField === 'email'
                        ? '1.5px solid #f59e0b'
                        : theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                      boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(245, 158, 11, 0.15)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label 
                    htmlFor="login-password"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FaLock 
                      className={`text-sm transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-400'
                      }`} 
                    />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-[16px] sm:text-sm font-semibold transition-all duration-200 outline-none"
                    style={{
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.65)',
                      border: focusedField === 'password'
                        ? '1.5px solid #f59e0b'
                        : theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
                      color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                      boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(245, 158, 11, 0.15)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-white p-1 rounded transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                      id="login-remember"
                    />
                    <div 
                      className={`w-[19px] h-[19px] rounded-lg transition-all flex items-center justify-center ${
                        rememberMe 
                          ? 'bg-amber-500 border-amber-500 text-white shadow-sm' 
                          : 'border text-transparent'
                      }`}
                      style={{
                        background: rememberMe ? '#f59e0b' : theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        borderColor: rememberMe ? '#f59e0b' : theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      }}
                    >
                      <FaCheck className="text-[10px]" />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Keep me signed in
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <ThreeUIButton
                id="login-submit"
                type="submit"
                disabled={isLoading || isSuccess}
                variant="amber-glow"
                size="lg"
                className="w-full mt-2"
              >
                {isLoading && !isSuccess ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : isSuccess ? (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="flex items-center gap-2 font-bold"
                  >
                    <FaCheck /> Authenticated
                  </motion.span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Sign In to TravelEase</span>
                    <FaArrowRight className="text-xs" />
                  </span>
                )}
              </ThreeUIButton>
            </form>

            {/* Security Badges */}
            <div 
              className="mt-6 pt-5 flex items-center justify-center gap-6 text-[11px] font-bold text-slate-500 dark:text-slate-400"
              style={{
                borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <span className="flex items-center gap-1.5">
                <FaLock className="text-emerald-500" /> SSL Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <FaShieldAlt className="text-sky-500" /> MongoDB Secured
              </span>
            </div>

            {/* Link to Register */}
            <p className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400 mt-4">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-amber-600 dark:text-amber-400 font-bold hover:text-amber-500 transition-colors underline-offset-4 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;