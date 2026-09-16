import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import AuthContext from '../context/AuthContext';
import { initiatePayment, checkGatewayStatus, convertToINR } from '../services/paymentService';
import { requestFareQuote } from '../services/pricingApi';
import { 
  FaShieldAlt, FaLock, FaCreditCard, FaCheckCircle, 
  FaTicketAlt, FaTag, FaSpinner, FaUser, FaEnvelope, FaPhone, 
  FaPlaneDeparture, FaHotel, FaCar, FaTrain, FaBus, FaCompass, FaHome,
  FaExclamationTriangle, FaRedo, FaTimes, FaPassport, FaClock, FaGlobe
} from 'react-icons/fa';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';

// ─── Form Validation ──────────────────────────────────────────────────────────
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned) || /^\d{10,15}$/.test(cleaned);
};

const validateName = (name) => {
  return name.trim().length >= 2 && /^[a-zA-Z\s'.,-]+$/.test(name.trim());
};

const validateGstin = (code) => {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(code.trim().toUpperCase());
};

const validatePassport = (num) => {
  return /^[A-Z0-9]{6,12}$/i.test((num || '').trim());
};

const validatePassportExpiry = (expiryDate, travelDate) => {
  if (!expiryDate) return false;
  const exp = new Date(expiryDate);
  const ref = travelDate ? new Date(travelDate) : new Date();
  const diffDays = (exp - ref) / (1000 * 60 * 60 * 24);
  return diffDays >= 180; // IATA standard: minimum 6 months validity
};

const Checkout = () => {
  const navigate = useNavigate();
  const { activeBooking, formatPrice, confirmBooking, addToast } = useBooking();
  const { user, isAuthenticated } = useContext(AuthContext);

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // International Passport State (for IATA flight compliance)
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [nationality, setNationality] = useState('Indian');
  
  // Corporate GST State
  const [claimGst, setClaimGst] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Validation errors & touched
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');

  // Additional co-passengers / travelers
  const [coPassengers, setCoPassengers] = useState([]);

  // Server Authoritative Quote State
  const [quoteData, setQuoteData] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [_quoteError, setQuoteError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  // Payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [gatewayConfigured, setGatewayConfigured] = useState(null);

  // Detect if current booking is an international flight
  const isFlight = activeBooking?.serviceType === 'flight';
  const isInternationalFlight = useMemo(() => {
    if (!isFlight) return false;
    const from = activeBooking?.details?.from || '';
    const to = activeBooking?.details?.to || '';
    const domesticIndianHubs = ['DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'PNQ', 'AMD', 'GOI', 'COK', 'JAI', 'VNS'];
    const title = activeBooking?.itemTitle || '';
    if (title.includes('DXB') || title.includes('LHR') || title.includes('JFK') || title.includes('SIN') || title.includes('Emirates') || title.includes('British Airways')) {
      return true;
    }
    if (from && to) {
      const fromIsDomestic = domesticIndianHubs.includes(from.toUpperCase());
      const toIsDomestic = domesticIndianHubs.includes(to.toUpperCase());
      return !(fromIsDomestic && toIsDomestic);
    }
    return false;
  }, [isFlight, activeBooking]);

  // Check if payment gateway is configured on mount
  useEffect(() => {
    const checkGateway = async () => {
      const status = await checkGatewayStatus();
      setGatewayConfigured(status?.configured || false);
    };
    checkGateway();
  }, []);

  // Fetch Server-Authoritative Quote
  const fetchQuote = useCallback(async () => {
    if (!activeBooking) return;
    setQuoteLoading(true);
    setQuoteError(null);

    try {
      const passengersCount = {
        adults: 1 + coPassengers.filter(p => p.type === 'adult' || !p.type).length,
        children: coPassengers.filter(p => p.type === 'child').length,
        infants: coPassengers.filter(p => p.type === 'infant').length,
      };

      const quoteParams = {
        serviceType: activeBooking.serviceType,
        itemTitle: activeBooking.itemTitle,
        flightNumber: activeBooking.details?.flightNumber,
        from: activeBooking.details?.from,
        to: activeBooking.details?.to,
        departDate: activeBooking.details?.departDate,
        returnDate: activeBooking.details?.returnDate,
        cabinClass: activeBooking.details?.cabinClass || 'ECONOMY',
        baseFareUSD: activeBooking.priceUSD || activeBooking.details?.priceUSD || 150,
        passengers: passengersCount,
        hotelId: activeBooking.details?.hotelId,
        roomName: activeBooking.details?.roomName,
        checkIn: activeBooking.details?.checkIn,
        checkOut: activeBooking.details?.checkOut,
        guests: activeBooking.details?.guests || 2,
        ratePerNightUSD: activeBooking.details?.pricePerNightUSD || 120,
        provider: activeBooking.provider,
        promoCode: appliedPromo,
        quantity: 1,
      };

      const res = await requestFareQuote(quoteParams);
      if (res.success && res.quoteToken) {
        setQuoteData(res);
        setTimeLeft(res.expiresInSeconds || 900);
      }
    } catch (err) {
      console.warn('[Checkout Quote Notice]:', err.message);
      setQuoteError(err.message || 'Could not verify server quote. Using local rate cache.');
    } finally {
      setQuoteLoading(false);
    }
  }, [activeBooking, coPassengers, appliedPromo]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  // Quote expiration countdown timer
  useEffect(() => {
    if (!quoteData?.expiresAt) return;
    const interval = setInterval(() => {
      const secondsLeft = Math.max(0, Math.floor((quoteData.expiresAt - Date.now()) / 1000));
      setTimeLeft(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [quoteData]);

  // Co-passenger handlers
  const addCoPassenger = () => {
    if (coPassengers.length >= 8) {
      addToast('Maximum 9 travelers allowed per reservation.', 'warning');
      return;
    }
    setCoPassengers(prev => [...prev, { id: Date.now(), name: '', age: '', gender: 'Preference', type: 'adult', passportNumber: '', passportExpiry: '' }]);
  };

  const removeCoPassenger = (id) => {
    setCoPassengers(prev => prev.filter(p => p.id !== id));
  };

  const updateCoPassenger = (id, key, val) => {
    setCoPassengers(prev => prev.map(p => p.id === id ? { ...p, [key]: val } : p));
  };

  // Field validation
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'fullName':
        if (!value.trim()) newErrors.fullName = 'Full legal name is required';
        else if (!validateName(value)) newErrors.fullName = 'Please enter a valid name (letters only)';
        else delete newErrors.fullName;
        break;
      case 'email':
        if (!value.trim()) newErrors.email = 'Email address is required for e-ticket';
        else if (!validateEmail(value)) newErrors.email = 'Please enter a valid email address';
        else delete newErrors.email;
        break;
      case 'phone':
        if (!value.trim()) newErrors.phone = 'Phone number is required for SMS boarding updates';
        else if (!validatePhone(value)) newErrors.phone = 'Please enter a valid phone number (10 digits)';
        else delete newErrors.phone;
        break;
      case 'passportNumber':
        if (isInternationalFlight) {
          if (!value.trim()) newErrors.passportNumber = 'Passport number is required for international travel';
          else if (!validatePassport(value)) newErrors.passportNumber = 'Invalid passport format (6-12 alphanumeric characters)';
          else delete newErrors.passportNumber;
        }
        break;
      case 'passportExpiry':
        if (isInternationalFlight) {
          if (!value.trim()) newErrors.passportExpiry = 'Passport expiry date is required';
          else if (!validatePassportExpiry(value, activeBooking?.details?.departDate)) {
            newErrors.passportExpiry = 'Passport must be valid for at least 6 months beyond travel date (IATA rule)';
          } else delete newErrors.passportExpiry;
        }
        break;
      case 'gstin':
        if (claimGst && !value.trim()) newErrors.gstin = 'GSTIN is required for tax claim';
        else if (claimGst && !validateGstin(value)) newErrors.gstin = 'Invalid GSTIN (15 chars: e.g. 07AAAAA0000A1Z5)';
        else delete newErrors.gstin;
        break;
      case 'companyName':
        if (claimGst && !value.trim()) newErrors.companyName = 'Registered company name is required';
        else delete newErrors.companyName;
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const values = { fullName, email, phone, passportNumber, passportExpiry, gstin, companyName };
    validateField(field, values[field]);
  };

  const validateAllFields = () => {
    const newErrors = {};
    
    if (!fullName.trim()) newErrors.fullName = 'Full legal name is required';
    else if (!validateName(fullName)) newErrors.fullName = 'Please enter a valid legal name';

    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email address';

    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!validatePhone(phone)) newErrors.phone = 'Please enter a valid phone number';

    if (isInternationalFlight) {
      if (!passportNumber.trim()) newErrors.passportNumber = 'Passport number is mandatory for international flights';
      else if (!validatePassport(passportNumber)) newErrors.passportNumber = 'Invalid passport number format';

      if (!passportExpiry.trim()) newErrors.passportExpiry = 'Passport expiry date is mandatory';
      else if (!validatePassportExpiry(passportExpiry, activeBooking?.details?.departDate)) {
        newErrors.passportExpiry = 'Passport must be valid at least 6 months beyond travel date';
      }
    }

    if (claimGst) {
      if (!companyName.trim()) newErrors.companyName = 'Company name is required for GST invoice';
      if (!gstin.trim()) newErrors.gstin = 'GSTIN is required';
      else if (!validateGstin(gstin)) newErrors.gstin = 'Invalid 15-character GSTIN format';
    }

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      passportNumber: true,
      passportExpiry: true,
      companyName: true,
      gstin: true
    });

    return Object.keys(newErrors).length === 0;
  };

  if (!activeBooking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] flex flex-col items-center justify-center p-4 transition-colors duration-500">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elevated p-12 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <FaTicketAlt size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Cart is Empty</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">Select a flight, hotel, or experience to proceed to checkout.</p>
          <ThreeUIButton to="/destinations" variant="liquid-metal" size="md" className="w-full">
            Explore Destinations
          </ThreeUIButton>
        </motion.div>
      </div>
    );
  }

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'WELCOME10' || code === 'STORY2026' || code === 'FIRST50') {
      setAppliedPromo(code);
      addToast(`Promo ${code} applied! Server quote updating...`, 'success');
    } else {
      addToast('Invalid promo code. Try WELCOME10 or FIRST50', 'warning');
    }
  };

  // Authoritative Pricing derived from Server Quote (with graceful fallback)
  const breakdown = quoteData?.quote?.fareBreakdown;
  const finalTotalINR = quoteData?.quote?.amountINR || convertToINR(activeBooking.priceUSD || 150);
  const finalTotalUSD = quoteData?.quote?.amountUSD || activeBooking.priceUSD || 150;
  const baseFareUSD = breakdown?.baseFareUSD || activeBooking.priceUSD || 150;
  const taxesUSD = breakdown?.taxesAndGstUSD || Math.round(baseFareUSD * 0.12);
  const discountUSD = breakdown?.discountUSD || 0;

  const handlePayNow = async () => {
    if (!isAuthenticated || !user) {
      addToast('Authentication Required: Please log in or create an account to finalize your booking.', 'error');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    if (!validateAllFields()) {
      addToast('Please fill in all required traveler details correctly.', 'warning');
      return;
    }

    if (timeLeft <= 0) {
      addToast('Fare quote has expired. Refreshing latest fares...', 'warning');
      await fetchQuote();
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setPaymentError(null);

    try {
      const gstPayload = claimGst ? {
        companyName: companyName.trim(),
        gstin: gstin.trim().toUpperCase(),
        companyAddress: companyAddress.trim()
      } : undefined;

      const fullManifest = [
        {
          name: fullName.trim(),
          type: 'adult',
          isLead: true,
          passportNumber: isInternationalFlight ? passportNumber.trim().toUpperCase() : undefined,
          passportExpiry: isInternationalFlight ? passportExpiry : undefined,
          nationality: isInternationalFlight ? nationality : 'Indian',
        },
        ...coPassengers.map(p => ({
          name: p.name.trim(),
          age: Number(p.age) || 30,
          gender: p.gender,
          type: p.type || 'adult',
          passportNumber: isInternationalFlight ? p.passportNumber?.trim().toUpperCase() : undefined,
          passportExpiry: isInternationalFlight ? p.passportExpiry : undefined,
        }))
      ];

      const paymentResult = await initiatePayment({
        quoteToken: quoteData?.quoteToken,
        amountINR: finalTotalINR,
        currency: 'INR',
        bookingId: quoteData?.quoteId ? `TE-${quoteData.quoteId.replace('TEQ-', '')}` : `TE-${Date.now().toString(36).toUpperCase()}`,
        serviceTitle: quoteData?.quote?.itemTitle || activeBooking.itemTitle,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        passengerManifest: fullManifest,
        gstDetails: gstPayload,
        onPaymentStart: () => {
          setPaymentStatus('gateway_open');
        },
        onPaymentProgress: () => {
          setPaymentStatus('verifying');
        },
      });

      // Payment successful — confirm booking
      setPaymentStatus('success');
      
      const confirmed = confirmBooking({
        type: activeBooking.serviceType,
        serviceType: activeBooking.serviceType,
        serviceTitle: quoteData?.quote?.itemTitle || activeBooking.itemTitle,
        provider: activeBooking.provider || 'TravelEase Direct',
        details: {
          ...activeBooking.details,
          ...quoteData?.quote?.travelDetails,
          paymentId: paymentResult.paymentId,
          orderId: paymentResult.orderId,
          passengerManifest: fullManifest,
          totalTravelers: fullManifest.length,
          claimGst,
          gstDetails: gstPayload,
          convenienceFee: 0,
          fareBreakdown: {
            baseFareUSD,
            taxesUSD,
            discountUSD,
            convenienceFee: 0,
            finalTotalINR,
          },
        },
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        totalUSD: finalTotalUSD,
        amount: finalTotalINR,
        currency: 'INR',
        paymentMethod: `Razorpay (${paymentResult.paymentId})`,
        passengerName: fullName,
        image: activeBooking.image,
        razorpayPaymentId: paymentResult.paymentId,
        razorpayOrderId: paymentResult.orderId,
        gstDetails: gstPayload,
        convenienceFee: 0,
      });

      addToast('Payment verified! Booking confirmed.', 'success');
      
      setTimeout(() => {
        navigate(`/booking-confirmation/${confirmed.bookingId}`);
      }, 800);

    } catch (err) {
      setIsProcessing(false);
      
      if (err.message === 'PAYMENT_CANCELLED') {
        setPaymentStatus('cancelled');
        setPaymentError('Payment was cancelled. You can retry anytime.');
        addToast('Payment cancelled. No charges were made.', 'warning');
      } else if (err.message === 'GATEWAY_NOT_CONFIGURED') {
        setPaymentStatus('failed');
        setPaymentError('Payment gateway is being configured. Please contact support.');
        addToast('Payment gateway is not configured.', 'warning');
      } else if (err.message?.startsWith('PAYMENT_FAILED:')) {
        setPaymentStatus('failed');
        const reason = err.message.replace('PAYMENT_FAILED: ', '');
        setPaymentError(`Payment failed: ${reason}. Please try a different payment method.`);
        addToast(`Payment failed: ${reason}`, 'warning');
      } else {
        setPaymentStatus('failed');
        setPaymentError(err.message || 'An unexpected error occurred. Please try again.');
        addToast('Payment verification error.', 'warning');
      }
    }
  };

  const getServiceIcon = () => {
    switch (activeBooking.serviceType) {
      case 'flight': return <FaPlaneDeparture />;
      case 'hotel': return <FaHotel />;
      case 'car':
      case 'cab': return <FaCar />;
      case 'train': return <FaTrain />;
      case 'bus': return <FaBus />;
      case 'homestay': return <FaHome />;
      case 'tour': return <FaCompass />;
      default: return <FaTicketAlt />;
    }
  };

  const FormField = ({ label, icon: Icon, type = 'text', value, onChange, onBlur, error, touched: fieldTouched, placeholder, ...props }) => (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label} <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        {Icon && <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 ${error && fieldTouched ? 'text-red-400' : 'text-slate-400'}`} />}
        <input 
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${
            error && fieldTouched 
              ? 'border-red-400 dark:border-red-500 focus:border-red-500' 
              : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
          } rounded-xl ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none transition-colors`}
          {...props}
        />
      </div>
      {error && fieldTouched && (
        <motion.p 
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400 flex items-center gap-1"
        >
          <FaExclamationTriangle className="w-3 h-3" /> {error}
        </motion.p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] py-10 px-4 transition-colors duration-500" id="checkout-page">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-200 dark:border-emerald-500/20">
            <FaShieldAlt /> 256-bit Bank Grade Checkout
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Review & Finalize Booking
          </h1>
        </motion.div>

        {/* 15-Minute Fare Lock Countdown HUD */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FaClock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Authoritative Fare Lock Active
              </p>
              <p className="text-sm font-semibold text-slate-200">
                {quoteLoading ? 'Refreshing server quote...' : 'This rate is cryptographically locked for you'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl font-mono font-black text-base border ${
              timeLeft < 180 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse' 
                : 'bg-slate-800/80 border-slate-700 text-amber-300'
            }`}>
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            {timeLeft <= 180 && (
              <ThreeUIButton
                onClick={fetchQuote}
                disabled={quoteLoading}
                variant="amber-glow"
                size="sm"
                icon={FaRedo}
                className="shrink-0"
              >
                Extend
              </ThreeUIButton>
            )}
          </div>
        </div>

        {/* Gateway Notice if in Test Mode */}
        {gatewayConfigured === false && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Test Gateway Mode Active</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Razorpay API keys not yet added to server .env. Payments will be simulated for staging testing.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column - Traveler Manifest & Invoicing */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Primary Traveler Info */}
            <div className="card-elevated p-8">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <FaUser className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Primary Passenger Manifest</h2>
                    <p className="text-xs text-slate-400">Lead passenger as shown on government travel ID</p>
                  </div>
                </div>

                {isInternationalFlight && (
                  <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <FaPassport /> International Route
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    label="Full Legal Name (as on Passport / Aadhaar)"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    error={errors.fullName}
                    touched={touched.fullName}
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <FormField
                  label="Email Address (for E-Ticket Voucher)"
                  icon={FaEnvelope}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={errors.email}
                  touched={touched.email}
                  placeholder="traveler@example.com"
                />
                <FormField
                  label="Mobile Number (SMS Flight Updates)"
                  icon={FaPhone}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  error={errors.phone}
                  touched={touched.phone}
                  placeholder="+91 98765 43210"
                />

                {/* International Flight IATA Passport Fields */}
                {isInternationalFlight && (
                  <div className="md:col-span-2 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                      <FaGlobe /> Mandatory International Flight Manifest
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <FormField
                          label="Passport Number"
                          icon={FaPassport}
                          value={passportNumber}
                          onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                          onBlur={() => handleBlur('passportNumber')}
                          error={errors.passportNumber}
                          touched={touched.passportNumber}
                          placeholder="e.g. Z1234567"
                        />
                      </div>
                      <div>
                        <FormField
                          label="Passport Expiry Date"
                          type="date"
                          value={passportExpiry}
                          onChange={(e) => setPassportExpiry(e.target.value)}
                          onBlur={() => handleBlur('passportExpiry')}
                          error={errors.passportExpiry}
                          touched={touched.passportExpiry}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Nationality <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="Indian">India (🇮🇳)</option>
                          <option value="Emirati">United Arab Emirates (🇦🇪)</option>
                          <option value="British">United Kingdom (🇬🇧)</option>
                          <option value="American">United States (🇺🇸)</option>
                          <option value="Singaporean">Singapore (🇸🇬)</option>
                          <option value="Other">Other Nationality</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Travelers Section */}
                <div className="md:col-span-2 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Additional Passengers</h3>
                      <p className="text-xs text-slate-400">Add co-travelers (Adults, Children, or Infants)</p>
                    </div>
                    <ThreeUIButton
                      type="button"
                      onClick={addCoPassenger}
                      variant="specular-dark"
                      size="sm"
                    >
                      + Add Co-Passenger
                    </ThreeUIButton>
                  </div>

                  {coPassengers.length > 0 && (
                    <div className="space-y-3">
                      {coPassengers.map((passenger, idx) => (
                        <div key={passenger.id} className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-slate-400">Traveler #{idx + 2}</span>
                            <button
                              type="button"
                              onClick={() => removeCoPassenger(passenger.id)}
                              className="text-rose-500 hover:text-rose-600 text-xs font-bold"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <input
                              type="text"
                              placeholder="Full Legal Name"
                              value={passenger.name}
                              onChange={(e) => updateCoPassenger(passenger.id, 'name', e.target.value)}
                              className="sm:col-span-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-400"
                            />
                            <select
                              value={passenger.type || 'adult'}
                              onChange={(e) => updateCoPassenger(passenger.id, 'type', e.target.value)}
                              className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-400"
                            >
                              <option value="adult">Adult (12+)</option>
                              <option value="child">Child (2-11)</option>
                              <option value="infant">Infant (0-2)</option>
                            </select>
                            <select
                              value={passenger.gender || 'Preference'}
                              onChange={(e) => updateCoPassenger(passenger.id, 'gender', e.target.value)}
                              className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-400"
                            >
                              <option value="Preference">Preference (Gender)</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {isInternationalFlight && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <input
                                type="text"
                                placeholder="Passport Number"
                                value={passenger.passportNumber}
                                onChange={(e) => updateCoPassenger(passenger.id, 'passportNumber', e.target.value.toUpperCase())}
                                className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-400"
                              />
                              <input
                                type="date"
                                placeholder="Passport Expiry"
                                value={passenger.passportExpiry}
                                onChange={(e) => updateCoPassenger(passenger.id, 'passportExpiry', e.target.value)}
                                className="bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-400"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* GST Corporate Invoicing */}
                <div className="md:col-span-2 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs tracking-wider">
                        GST
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          Claim GST Input Tax Credit
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase">Business</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Generate B2B compliant tax invoice for corporate expenses</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={claimGst}
                        onChange={(e) => setClaimGst(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <AnimatePresence>
                    {claimGst && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80"
                      >
                        <FormField
                          label="Registered Company Name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          onBlur={() => handleBlur('companyName')}
                          error={errors.companyName}
                          touched={touched.companyName}
                          placeholder="Acme Technologies Pvt Ltd"
                        />
                        <FormField
                          label="GSTIN Number (15 Digits)"
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          onBlur={() => handleBlur('gstin')}
                          error={errors.gstin}
                          touched={touched.gstin}
                          placeholder="07AAAAA0000A1Z5"
                          maxLength={15}
                        />
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Company Address (for SAC invoice)
                          </label>
                          <input
                            type="text"
                            value={companyAddress}
                            onChange={(e) => setCompanyAddress(e.target.value)}
                            placeholder="e.g. Cyber City, DLF Phase 2, Gurugram, Haryana"
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Payment Gateway Trust Card */}
            <div className="card-elevated p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <FaCreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Secure Payment Methods</h2>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                    <FaLock className="text-indigo-500 w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300">Razorpay Encrypted Processing</p>
                    <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">UPI, Net Banking, Credit/Debit Cards, Wallets, EMI</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Google Pay', 'PhonePe', 'Paytm UPI', 'Visa', 'Mastercard', 'RuPay', 'HDFC / ICICI / SBI', 'Cred'].map((method) => (
                    <span key={method} className="px-3 py-1 bg-white dark:bg-slate-800/60 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {method}
                    </span>
                  ))}
                </div>
                
                <p className="text-xs text-indigo-600/60 dark:text-indigo-400/50">
                  Card details are processed with end-to-end encryption. TravelEase never stores CVV or banking credentials.
                </p>
              </div>

              {/* Payment Error Dismissible Banner */}
              <AnimatePresence mode="wait">
                {paymentError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 bg-red-50 dark:bg-red-500/10 rounded-xl p-4 border border-red-200 dark:border-red-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-800 dark:text-red-300">{paymentError}</p>
                        <button 
                          onClick={() => { setPaymentError(null); setPaymentStatus(null); }}
                          className="mt-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-800 flex items-center gap-1"
                        >
                          <FaTimes className="w-3 h-3" /> Dismiss
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column - Authoritative Fare Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card-elevated sticky top-24 overflow-hidden shadow-2xl">
              
              {/* Item Thumbnail */}
              <div className="h-40 relative">
                <img src={activeBooking.image} alt={activeBooking.itemTitle} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider mb-1">
                    {getServiceIcon()} {activeBooking.serviceType}
                  </div>
                  <h3 className="text-lg font-extrabold text-white line-clamp-1">{activeBooking.itemTitle}</h3>
                </div>
              </div>

              {/* Service Details Snippet */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <ul className="space-y-2 text-xs">
                  {Object.entries(activeBooking.details || {}).slice(0, 4).map(([key, value]) => (
                    typeof value === 'string' || typeof value === 'number' ? (
                      <li key={key} className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-semibold text-slate-900 dark:text-white text-right truncate max-w-[60%]">{value}</span>
                      </li>
                    ) : null
                  ))}
                </ul>
              </div>

              {/* Promo Code Input */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="WELCOME10" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <ThreeUIButton onClick={applyPromo} variant="liquid-metal" size="sm" className="whitespace-nowrap">
                    Apply
                  </ThreeUIButton>
                </div>
              </div>

              {/* Server-Verified Fare Breakdown */}
              <div className="p-5 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Base Fare ({1 + coPassengers.length} Travelers)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPrice(baseFareUSD)}</span>
                </div>
                
                {discountUSD > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="font-bold">Promo Concession</span>
                    <span className="font-bold">-{formatPrice(discountUSD)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Taxes, GST & Airport Fees</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPrice(taxesUSD)}</span>
                </div>

                {/* Zero Convenience Fee Guarantee */}
                <div className="flex justify-between items-center text-xs py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <FaCheckCircle className="text-emerald-500 w-3 h-3 shrink-0" />
                    <span className="font-bold">Convenience Fee</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="line-through text-slate-400 text-[10px]">₹399</span>
                    <span className="font-extrabold text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full uppercase">
                      ₹0 FREE
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payable</span>
                    <span className="text-xs font-mono font-bold text-slate-500">₹{finalTotalINR.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {formatPrice(finalTotalUSD)}
                  </span>
                </div>
              </div>

              {/* Pay Now Button */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/30">
                <ThreeUIButton
                  onClick={handlePayNow}
                  disabled={isProcessing || paymentStatus === 'success' || quoteLoading}
                  variant="amber-glow"
                  size="lg"
                  className="w-full shadow-xl shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      {paymentStatus === 'verifying' ? 'Verifying Gateway...' : 'Connecting...'}
                    </>
                  ) : paymentStatus === 'success' ? (
                    <>
                      <FaCheckCircle /> Confirmed!
                    </>
                  ) : paymentStatus === 'failed' || paymentStatus === 'cancelled' ? (
                    <>
                      <FaRedo /> Retry Pay — ₹{finalTotalINR.toLocaleString('en-IN')}
                    </>
                  ) : (
                    <>
                      <FaLock /> Pay ₹{finalTotalINR.toLocaleString('en-IN')}
                    </>
                  )}
                </ThreeUIButton>
                
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-3 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <FaShieldAlt className="text-emerald-500" /> Instant Bank Confirmation · Safe & Encrypted
                </p>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
