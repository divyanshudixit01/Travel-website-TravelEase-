import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaPlane, FaHotel, FaCar, FaTrain, FaBus, FaUmbrellaBeach, FaHiking,
  FaUserCircle, FaChevronDown, FaSignOutAlt, FaSuitcase, FaSearch, FaTimes, FaBars, FaHome, FaCompass
} from 'react-icons/fa';
import { FiSun, FiMoon, FiGrid, FiCompass as FiCompassIcon, FiBookOpen } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import { useBooking } from '../../context/BookingContext';
import { createTopDockController } from '../../shaders/animated-top-dock/topDockController';
import '@designcodeio/threeui/style.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currency, setCurrency, userBookings, addToast } = useBooking();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const dockRef = useRef(null);
  const megaMenuRef = useRef(null);
  const currencyRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchOverlayRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Initialize ThreeUI AnimatedTopDock Spring Controller (desktop >= 1024px)
  useEffect(() => {
    const root = dockRef.current;
    if (!root) return undefined;

    return createTopDockController(root, () => ({
      proximity: 125,
      spring: 0.22,
      damping: 0.66,
      widthGrowth: 18,
      heightGrowth: 14,
      drop: 4.5,
      lockTrack: true,
    }));
  }, []);

  // Close all popups & drawers on route change
  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsCurrencyOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Outside click & ESC listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target) && !e.target.closest('#dock-book-btn')) {
        setIsMegaMenuOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target) && !e.target.closest('#dock-currency-btn')) {
        setIsCurrencyOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target) && !e.target.closest('#dock-user-btn')) {
        setIsUserDropdownOpen(false);
      }
      if (searchOverlayRef.current && !searchOverlayRef.current.contains(e.target) && !e.target.closest('#dock-search-btn')) {
        setSearchOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('#mobile-nav-toggle-btn')) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setIsCurrencyOpen(false);
        setIsUserDropdownOpen(false);
        setIsMenuOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully.', 'info');
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      navigate(`/destinations?q=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setIsMenuOpen(false);
      setMobileSearchQuery('');
    }
  };

  const bookingServices = [
    { path: '/trains', label: 'Trains', badge: 'IRCTC Live', icon: <FaTrain />, desc: 'Confirmed Tatkal & seat prediction', color: 'text-purple-400' },
    { path: '/flights', label: 'Flights', icon: <FaPlane />, desc: 'Compare & book lowest airfares', color: 'text-sky-400' },
    { path: '/hotels', label: 'Hotels', icon: <FaHotel />, desc: 'Luxury stays & boutique villas', color: 'text-amber-400' },
    { path: '/buses', label: 'Buses', icon: <FaBus />, desc: 'AC sleeper & Volvo intercity', color: 'text-rose-400' },
    { path: '/homestays', label: 'Homestays', icon: <FaUmbrellaBeach />, desc: 'Authentic local stays & retreats', color: 'text-teal-400' },
    { path: '/cars', label: 'Cabs & Rentals', badge: 'Uber • Rapido', icon: <FaCar />, desc: 'Uber, Rapido, Bharat Taxi & Self-Drive', color: 'text-emerald-400' },
    { path: '/tours', label: 'Experiences', icon: <FaHiking />, desc: 'Guided adventures & sightseeing', color: 'text-orange-400' },
  ];

  const currencies = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  ];

  const currentCurrencySymbol = currencies.find(c => c.code === currency)?.symbol || '$';

  const isBookRoute = [
    '/flights', '/hotels', '/trains', '/buses', '/homestays', '/cars', '/tours', '/my-bookings'
  ].includes(location.pathname);

  const quickDestinations = ['Bali', 'Goa', 'Paris', 'Varanasi', 'Dubai', 'Tokyo'];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none py-2 px-2.5 sm:px-4" id="main-header">
        <div className="pointer-events-auto relative w-full max-w-7xl flex flex-col items-center">
          
          {/* THREEUI ANIMATED TOP DOCK COMMAND BAR */}
          <div className="travelease-command-bar-wrapper" data-dock-frame>
            <div className="travelease-command-bar">
              {/* 1. BRAND ON THE LEFT */}
              <Link to="/" className="travelease-brand-left" aria-label="TravelEase Home" title="TravelEase — Home">
                <span className="travelease-brand-mark overflow-hidden p-0.5" aria-hidden="true">
                  <img src="/brand/logo-mark.svg" alt="TravelEase Mark" className="w-full h-full object-contain" />
                </span>
                <span className="travelease-brand-text">
                  Travel<span className="text-amber-400">Ease</span>
                </span>
              </Link>

              {/* 2. THREEUI SPRING DOCK IN CENTER (DESKTOP ONLY >= 1024px) */}
              <nav 
                ref={dockRef} 
                className="travelease-dock-track" 
                aria-label="Primary Navigation" 
                data-dock-state="idle" 
                data-dock-max="0.00"
              >
                {/* HOME */}
                <button
                  className="atd-item"
                  data-dock-item
                  type="button"
                  aria-pressed={location.pathname === '/'}
                  onClick={() => navigate('/')}
                >
                  <span className="atd-icon" aria-hidden="true">
                    <FaHome />
                  </span>
                  <span>HOME</span>
                </button>

                {/* EXPLORE */}
                <button
                  className="atd-item"
                  data-dock-item
                  type="button"
                  aria-pressed={location.pathname === '/destinations'}
                  onClick={() => navigate('/destinations')}
                >
                  <span className="atd-icon" aria-hidden="true">
                    <FaCompass />
                  </span>
                  <span>EXPLORE</span>
                </button>

                {/* AI PLANNER */}
                <button
                  className="atd-item"
                  data-dock-item
                  type="button"
                  aria-pressed={location.pathname === '/itinerary'}
                  onClick={() => navigate('/itinerary')}
                >
                  <span className="atd-icon" aria-hidden="true">
                    <HiOutlineSparkles className="text-amber-400" />
                  </span>
                  <span>AI PLANNER</span>
                </button>

                {/* BOOK (Mega Menu Dropdown) */}
                <button
                  id="dock-book-btn"
                  className="atd-item"
                  data-dock-item
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={isMegaMenuOpen}
                  aria-pressed={isMegaMenuOpen || isBookRoute}
                  onClick={() => {
                    setIsMegaMenuOpen(!isMegaMenuOpen);
                    setIsCurrencyOpen(false);
                    setIsUserDropdownOpen(false);
                    setSearchOpen(false);
                  }}
                >
                  <span className="atd-icon" aria-hidden="true">
                    <FaSuitcase className="text-amber-400" />
                  </span>
                  <span>BOOK</span>
                  <FaChevronDown className={`w-2 h-2 ml-0.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-amber-400' : 'opacity-70'}`} />
                </button>

                {/* STORIES */}
                <button
                  className="atd-item"
                  data-dock-item
                  type="button"
                  aria-pressed={location.pathname === '/blog'}
                  onClick={() => navigate('/blog')}
                >
                  <span className="atd-icon" aria-hidden="true">
                    <FiBookOpen />
                  </span>
                  <span>STORIES</span>
                </button>
              </nav>

              {/* 3. UTILITY ACTIONS ON THE RIGHT */}
              <div className="travelease-actions-right">
                {/* Search trigger */}
                <button
                  id="dock-search-btn"
                  className="travelease-action-btn icon-only"
                  type="button"
                  aria-label="Search destinations and trips"
                  aria-pressed={searchOpen}
                  onClick={() => {
                    setSearchOpen(!searchOpen);
                    setIsMegaMenuOpen(false);
                    setIsCurrencyOpen(false);
                    setIsUserDropdownOpen(false);
                    setIsMenuOpen(false);
                  }}
                  title="Search"
                >
                  <FaSearch className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                </button>

                {/* Currency selector (visible >= 640px) */}
                <button
                  id="dock-currency-btn"
                  className="travelease-action-btn travelease-sm-up"
                  type="button"
                  aria-label="Select currency"
                  aria-haspopup="true"
                  aria-expanded={isCurrencyOpen}
                  aria-pressed={isCurrencyOpen}
                  onClick={() => {
                    setIsCurrencyOpen(!isCurrencyOpen);
                    setIsMegaMenuOpen(false);
                    setIsUserDropdownOpen(false);
                    setSearchOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="text-[10px] font-bold text-amber-400">{currentCurrencySymbol}</span>
                  <span className="text-[10px] ml-1">{currency}</span>
                </button>

                {/* Theme toggle */}
                <button
                  id="theme-toggle-btn"
                  className="travelease-action-btn icon-only"
                  type="button"
                  aria-label="Toggle dark/light mode"
                  onClick={toggleTheme}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? (
                    <FiSun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <FiMoon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
                  )}
                </button>

                {/* Sign In CTA or User Profile */}
                {isAuthenticated && user ? (
                  <button
                    id="dock-user-btn"
                    className="travelease-action-btn px-2 sm:px-2.5 bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                    type="button"
                    aria-label="User account menu"
                    aria-haspopup="true"
                    aria-expanded={isUserDropdownOpen}
                    aria-pressed={isUserDropdownOpen}
                    onClick={() => {
                      setIsUserDropdownOpen(!isUserDropdownOpen);
                      setIsMegaMenuOpen(false);
                      setIsCurrencyOpen(false);
                      setSearchOpen(false);
                    }}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="User Avatar" className="w-4 h-4 rounded-full object-cover border border-amber-400 shrink-0" />
                    ) : (
                      <FaUserCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className="text-[10.5px] font-bold max-w-[55px] sm:max-w-[70px] truncate ml-1 hidden xs:inline">
                      {user.name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                  </button>
                ) : (
                  <button
                    className="travelease-cta-btn travelease-sm-up"
                    type="button"
                    aria-label="Sign In"
                    onClick={() => navigate('/login')}
                  >
                    <span>SIGN IN</span>
                  </button>
                )}

                {/* Mobile & Tablet Hamburger Toggle (< 1024px) */}
                <button
                  id="mobile-nav-toggle-btn"
                  className="travelease-action-btn icon-only travelease-mobile-toggle"
                  type="button"
                  aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={isMenuOpen}
                  onClick={() => {
                    setIsMenuOpen(!isMenuOpen);
                    setIsMegaMenuOpen(false);
                    setSearchOpen(false);
                    setIsCurrencyOpen(false);
                    setIsUserDropdownOpen(false);
                  }}
                >
                  {isMenuOpen ? (
                    <FaTimes className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <FaBars className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================
             MEGA MENU DROPDOWN (BOOKING SERVICES - DESKTOP)
             ============================================================ */}
          <AnimatePresence>
            {isMegaMenuOpen && (
              <motion.div
                ref={megaMenuRef}
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full mt-2.5 w-[620px] max-w-[95vw] rounded-2xl p-5 z-50 bg-white/95 dark:bg-[#0d1117]/95 text-slate-900 dark:text-white backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 shadow-2xl shadow-slate-900/15 dark:shadow-black/80"
                id="mega-menu-dropdown"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <FiGrid className="text-amber-500 dark:text-amber-400 w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">All Travel Services</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400/90 font-medium">REAL-TIME BEST RATES</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {bookingServices.map((service) => {
                    const isSelected = location.pathname === service.path;
                    return (
                      <Link
                        key={service.path}
                        to={service.path}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all group ${
                          isSelected
                            ? 'bg-amber-500/15 border border-amber-500/30 shadow-sm'
                            : 'bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/60 dark:border-transparent'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200/80 dark:border-transparent flex items-center justify-center flex-none ${service.color} group-hover:scale-110 transition-transform shadow-sm`}>
                          {service.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {service.label}
                            {service.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400 text-black">
                                {service.badge}
                              </span>
                            )}
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 ml-auto" />}
                          </div>
                          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{service.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-4">
                    <Link to="/my-bookings" onClick={() => setIsMegaMenuOpen(false)} className="hover:text-amber-500 dark:hover:text-amber-400 flex items-center gap-1.5 font-medium transition-colors">
                      <FaSuitcase className="w-3 h-3 text-amber-500 dark:text-amber-400" /> My Bookings
                    </Link>
                    <Link to="/explore" onClick={() => setIsMegaMenuOpen(false)} className="hover:text-amber-500 dark:hover:text-amber-400 flex items-center gap-1.5 font-medium transition-colors">
                      <FiCompassIcon className="w-3 h-3 text-sky-500 dark:text-sky-400" /> Interactive Map
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link to="/about" onClick={() => setIsMegaMenuOpen(false)} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">About</Link>
                    <span>·</span>
                    <Link to="/contact" onClick={() => setIsMegaMenuOpen(false)} className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Contact</Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================
             SEARCH OVERLAY
             ============================================================ */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                ref={searchOverlayRef}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2.5 w-[500px] max-w-[95vw] rounded-2xl p-4 z-50 bg-white/95 dark:bg-[#0e121a]/95 text-slate-900 dark:text-white backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 shadow-2xl shadow-slate-900/15 dark:shadow-black/80"
              >
                <form onSubmit={handleSearch} className="relative">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Where do you want to explore?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-mono font-bold text-[10px] shadow"
                  >
                    SEARCH
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400">Quick:</span>
                  {quickDestinations.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => {
                        navigate(`/destinations?q=${encodeURIComponent(dest)}`);
                        setSearchOpen(false);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 text-[11px] transition-colors"
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================
             CURRENCY DROPDOWN (DESKTOP / TABLET)
             ============================================================ */}
          <AnimatePresence>
            {isCurrencyOpen && (
              <motion.div
                ref={currencyRef}
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full mt-2.5 w-48 rounded-xl p-2 z-50 bg-white/95 dark:bg-[#0e121a]/95 text-slate-900 dark:text-white backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 shadow-xl shadow-slate-900/15 dark:shadow-black/80"
              >
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10 mb-1">
                  Select Currency
                </div>
                {currencies.map((curr) => (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      setCurrency(curr.code);
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currency === curr.code
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{curr.label}</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{curr.symbol} {curr.code}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================
             USER ACCOUNT DROPDOWN (DESKTOP / TABLET)
             ============================================================ */}
          <AnimatePresence>
            {isUserDropdownOpen && isAuthenticated && user && (
              <motion.div
                ref={userMenuRef}
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full mt-2.5 right-0 w-52 rounded-xl p-3 z-50 bg-white/95 dark:bg-[#0e121a]/95 text-slate-900 dark:text-white backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 shadow-xl shadow-slate-900/15 dark:shadow-black/80"
              >
                <div className="pb-2.5 mb-2 border-b border-slate-200 dark:border-white/10 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-amber-500/40 bg-slate-900 p-0.5 shadow-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name || 'Traveler'}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <FaSuitcase className="text-amber-500 dark:text-amber-400" />
                  <span>Dashboard & Bookings</span>
                  {userBookings?.length > 0 && (
                    <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      {userBookings.length}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <FaUserCircle className="text-amber-500 dark:text-amber-400" />
                  <span>Profile & Settings</span>
                </Link>

                <div className="my-1.5 border-t border-slate-200 dark:border-white/10" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================
             MOBILE NAVIGATION DRAWER & BACKDROP (VIEWPORT < 1024px)
             ============================================================ */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                  aria-hidden="true"
                />

                {/* Main mobile drawer */}
                <motion.div
                  ref={mobileMenuRef}
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:hidden mt-2.5 w-[calc(100vw-20px)] max-w-lg rounded-2xl p-4 sm:p-5 z-50 bg-white/95 dark:bg-[#0d1117]/95 text-slate-900 dark:text-white backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 shadow-2xl shadow-slate-900/25 dark:shadow-black/90 max-h-[85vh] overflow-y-auto"
                  id="mobile-navigation-drawer"
                >
                  {/* Top Bar inside Drawer */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-900 border border-amber-500/30 overflow-hidden flex items-center justify-center p-0.5 shadow-md">
                        <img src="/brand/logo-mark.svg" alt="TravelEase Mark" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">Travel<span className="text-amber-500">Ease</span></span>
                        <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">2.0</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle dark/light mode"
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-amber-500/20 transition-colors"
                      >
                        {theme === 'dark' ? <FiSun className="w-3.5 h-3.5 text-amber-400" /> : <FiMoon className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close navigation menu"
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-rose-500/20 hover:text-rose-500 transition-colors"
                      >
                        <FaTimes className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 1. Mobile Search Bar */}
                  <form onSubmit={handleMobileSearch} className="relative mb-3.5">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search destinations, trains, stays..."
                      value={mobileSearchQuery}
                      onChange={(e) => setMobileSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-20 py-2 rounded-xl bg-slate-100/90 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400 transition-all"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-[10px] shadow transition-colors"
                    >
                      SEARCH
                    </button>
                  </form>

                  {/* Quick Chips */}
                  <div className="flex flex-wrap items-center gap-1 mb-3.5 text-[11px]">
                    <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">Trending:</span>
                    {quickDestinations.map((dest) => (
                      <button
                        key={dest}
                        type="button"
                        onClick={() => {
                          navigate(`/destinations?q=${encodeURIComponent(dest)}`);
                          setIsMenuOpen(false);
                        }}
                        className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-500 text-[10.5px] transition-colors"
                      >
                        {dest}
                      </button>
                    ))}
                  </div>

                  {/* 2. Primary Navigation Links */}
                  <div className="space-y-1 mb-4">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 px-1">Explore TravelEase</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { path: '/', label: 'HOME', icon: <FaHome /> },
                        { path: '/destinations', label: 'EXPLORE', icon: <FaCompass /> },
                        { path: '/itinerary', label: 'AI PLANNER', badge: 'AI', icon: <HiOutlineSparkles className="text-amber-400" /> },
                        { path: '/blog', label: 'STORIES', icon: <FiBookOpen /> },
                        { path: '/explore', label: 'MAP EXPLORE', icon: <FiCompassIcon className="text-sky-400" /> },
                        { path: '/my-bookings', label: 'MY BOOKINGS', icon: <FaSuitcase className="text-amber-400" />, count: userBookings?.length },
                      ].map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                                : 'bg-slate-100/70 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                            }`}
                          >
                            <span className="text-sm">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <span className={`ml-auto px-1 py-0.2 rounded text-[8.5px] font-mono font-bold ${isActive ? 'bg-black text-amber-400' : 'bg-amber-400 text-black'}`}>
                                {item.badge}
                              </span>
                            )}
                            {item.count > 0 && (
                              <span className="ml-auto px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300">
                                {item.count}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Booking Services Grid */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 mb-4">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        <FiGrid className="w-3 h-3 text-amber-500" />
                        <span>Booking Services</span>
                      </div>
                      <span className="text-[9.5px] font-mono text-amber-600 dark:text-amber-400 font-bold">Best Rates Live</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {bookingServices.map((service) => {
                        const isSelected = location.pathname === service.path;
                        return (
                          <Link
                            key={service.path}
                            to={service.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500/40 shadow-sm'
                                : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/70 dark:border-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-transparent flex items-center justify-center flex-none ${service.color} text-xs shadow-sm`}>
                              {service.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[11.5px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                <span className="truncate">{service.label}</span>
                                {service.badge && (
                                  <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-400 text-black flex-none">
                                    {service.badge.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                              <div className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{service.desc}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Currency Switcher */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 mb-4">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Currency</span>
                      <span className="text-[10px] font-mono text-amber-500 font-bold">Active: {currentCurrencySymbol} {currency}</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {currencies.map((curr) => (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => {
                            setCurrency(curr.code);
                            addToast(`Currency switched to ${curr.code} (${curr.symbol})`, 'info');
                          }}
                          className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold transition-all ${
                            currency === curr.code
                              ? 'bg-amber-500 text-black shadow'
                              : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
                          }`}
                        >
                          <span>{curr.symbol}</span>
                          <span>{curr.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. User Account & Authentication Section */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 mb-3">
                    {isAuthenticated && user ? (
                      <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08]">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
                            <FaUserCircle className="w-6 h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name || 'Traveler'}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                          <Link
                            to="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 text-xs font-medium hover:text-amber-500 transition-colors shadow-sm"
                          >
                            <FaSuitcase className="text-amber-500 w-3 h-3" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 text-xs font-medium hover:text-amber-500 transition-colors shadow-sm"
                          >
                            <FaUserCircle className="text-amber-500 w-3 h-3" />
                            <span>Profile</span>
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                        >
                          <FaSignOutAlt className="w-3 h-3" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Link
                          to="/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs text-center shadow transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.14] text-slate-800 dark:text-white font-semibold text-xs text-center border border-slate-200/80 dark:border-white/10 transition-colors"
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* 6. Footer Links */}
                  <div className="pt-2 border-t border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-1">
                    <div className="flex items-center gap-2.5">
                      <Link to="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-amber-500 transition-colors">About</Link>
                      <span>·</span>
                      <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="hover:text-amber-500 transition-colors">Contact</Link>
                      <span>·</span>
                      <Link to="/terms" onClick={() => setIsMenuOpen(false)} className="hover:text-amber-500 transition-colors">Terms</Link>
                      <span>·</span>
                      <Link to="/privacy" onClick={() => setIsMenuOpen(false)} className="hover:text-amber-500 transition-colors">Privacy</Link>
                    </div>
                    <span className="font-mono opacity-60">190+ Countries</span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </div>
      </header>
    </>
  );
};

export default Header;