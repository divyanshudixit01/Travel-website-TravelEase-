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
import { TravelProvider } from './context/TravelContext';
import { BookingProvider } from './context/BookingProvider';
import { AuthProvider } from './context/AuthContext';

// Sleek fallback loader for smooth route transition
const PageFallback = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-amber-400/20 animate-ping"></div>
      <div className="w-12 h-12 rounded-full border-2 border-t-amber-500 border-r-transparent border-b-amber-500 border-l-transparent animate-spin"></div>
    </div>
    <span className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 animate-pulse">
      Loading Experience...
    </span>
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
                    path="/booking-confirmation/:id" 
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
          {/* AI Concierge — Global Floating Widget */}
          {!['/login', '/register', '/forgot-password'].includes(location.pathname) && <AIConcierge />}
        </BookingProvider>
      </AuthProvider>
    </TravelProvider>
    </ErrorBoundary>
  );
}

export default App;