import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Primary landing page imported eagerly for instant first paint
import Home from './pages/Home';

// Lazy-load all secondary route pages for optimal bundle splitting
const Destinations = lazy(() => import('./pages/Destinations'));
const Explore = lazy(() => import('./pages/Explore'));
const Itinerary = lazy(() => import('./pages/Itinerary'));
const Blog = lazy(() => import('./pages/Blog'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Editor = lazy(() => import('./pages/Editor'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Real-time Service Pages
const Flights = lazy(() => import('./pages/Flights'));
const Hotels = lazy(() => import('./pages/Hotels'));
const CarRentals = lazy(() => import('./pages/CarRentals'));
const Trains = lazy(() => import('./pages/Trains'));
const Buses = lazy(() => import('./pages/Buses'));
const Homestays = lazy(() => import('./pages/Homestays'));
const Tours = lazy(() => import('./pages/Tours'));
const Checkout = lazy(() => import('./pages/Checkout'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

import Header from './components/common/Header';
import ErrorBoundary from './components/common/ErrorBoundary';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import ProtectedRoute from './components/common/ProtectedRoute';
import AIConcierge from './components/common/AIConcierge';
import RouteProgressBar from './components/common/RouteProgressBar';
import LiquidGlassMobileDock from './components/common/LiquidGlassMobileDock';
import { TravelProvider } from './context/TravelContext';
import { BookingProvider } from './context/BookingProvider';
import { AuthProvider } from './context/AuthContext';

// Branded TravelEase fallback loader for smooth route transition
const PageFallback = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 select-none">
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute inset-0 rounded-2xl bg-amber-500/20 animate-ping"></div>
      <div className="relative w-14 h-14 rounded-2xl bg-slate-950 border border-amber-500/40 p-2.5 shadow-2xl flex items-center justify-center">
        <img src="/brand/logo-mark.svg" alt="TravelEase Loading" className="w-full h-full object-contain animate-pulse" />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
      <span className="text-xs font-mono font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
        Loading TravelEase Experience...
      </span>
    </div>
  </div>
);

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
    <TravelProvider>
      <AuthProvider>
        <BookingProvider>
          <ScrollToTop />
          <RouteProgressBar />
          <Header />
          <main className="min-h-screen">
            <Suspense fallback={<PageFallback />}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  {/* Public Discovery Layer */}
                  <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                  <Route path="/destinations" element={<PageTransition><Destinations /></PageTransition>} />
                  <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
                  <Route path="/itinerary" element={<PageTransition><Itinerary /></PageTransition>} />
                  <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
                  <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                  <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                  <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                  <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                  <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
                  <Route path="/editor" element={<PageTransition><Editor /></PageTransition>} />
                  <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
                  <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
                  <Route path="/refund-policy" element={<PageTransition><RefundPolicy /></PageTransition>} />

                  {/* Dedicated Service Engine Routes */}
                  <Route path="/flights" element={<PageTransition><Flights /></PageTransition>} />
                  <Route path="/hotels" element={<PageTransition><Hotels /></PageTransition>} />
                  <Route path="/cars" element={<PageTransition><CarRentals /></PageTransition>} />
                  <Route path="/trains" element={<PageTransition><Trains /></PageTransition>} />
                  <Route path="/buses" element={<PageTransition><Buses /></PageTransition>} />
                  <Route path="/homestays" element={<PageTransition><Homestays /></PageTransition>} />
                  <Route path="/tours" element={<PageTransition><Tours /></PageTransition>} />
                  <Route path="/experiences" element={<PageTransition><Tours /></PageTransition>} />

                  {/* Protected Auth Routes (Require Authenticated User Login) */}
                  <Route 
                    path="/my-bookings" 
                    element={
                      <ProtectedRoute>
                        <PageTransition><MyBookings /></PageTransition>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/checkout" 
                    element={
                      <ProtectedRoute>
                        <PageTransition><Checkout /></PageTransition>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/booking-confirmation" 
                    element={
                      <ProtectedRoute>
                        <PageTransition><BookingConfirmation /></PageTransition>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <PageTransition><Dashboard /></PageTransition>
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <PageTransition><Profile /></PageTransition>
                      </ProtectedRoute>
                    } 
                  />
                  {/* 404 Catch-All — Must be last route */}
                  <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </main>
          {!['/login', '/register', '/forgot-password'].includes(location.pathname) && <Footer />}
          {/* Mobile Liquid Glass Dock — Quick thumb navigation on mobile screens */}
          {!['/login', '/register', '/forgot-password'].includes(location.pathname) && <LiquidGlassMobileDock />}
          {/* AI Concierge — Global Floating Widget */}
          {!['/login', '/register', '/forgot-password'].includes(location.pathname) && <AIConcierge />}
        </BookingProvider>
      </AuthProvider>
    </TravelProvider>
    </ErrorBoundary>
  );
}

export default App;