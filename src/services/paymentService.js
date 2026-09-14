// ─── TravelEase Payment Service — Razorpay Integration ─────────────────────
// India-first payment gateway: UPI, Cards, Net Banking, Wallets, EMI
// All payment logic is server-verified — no client-side amount manipulation possible.

import api from './api';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

// ─── Load Razorpay Script ────────────────────────────────────────────────────
let razorpayScriptLoaded = false;

const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (razorpayScriptLoaded || window.Razorpay) {
      razorpayScriptLoaded = true;
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      razorpayScriptLoaded = true;
      resolve(true);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay payment gateway. Please check your internet connection.'));
    };
    document.body.appendChild(script);
  });
};

// ─── Check Gateway Status ────────────────────────────────────────────────────
export const checkGatewayStatus = async () => {
  try {
    const res = await api.get('/payments/gateway-status');
    return res.data;
  } catch {
    return { success: false, configured: false, gateway: 'Razorpay' };
  }
};

// ─── Create Order & Open Razorpay Checkout ───────────────────────────────────
// Returns a Promise that resolves on successful payment, rejects on failure/dismiss
export const initiatePayment = async ({
  quoteToken,
  amountINR,
  currency = 'INR',
  bookingId,
  serviceTitle,
  customerName,
  customerEmail,
  customerPhone,
  passengerManifest,
  gstDetails,
  onPaymentStart,
  onPaymentProgress,
}) => {
  // 1. Load Razorpay SDK
  if (onPaymentProgress) onPaymentProgress('Loading secure payment gateway...');
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error('Payment gateway failed to load. Please refresh and try again.');
  }

  // 2. Create order on server using quoteToken if available
  if (onPaymentProgress) onPaymentProgress('Creating secure payment order...');
  const orderRes = await api.post('/payments/create-order', {
    quoteToken,
    amount: amountINR,
    currency,
    bookingId,
    serviceTitle,
    customerName,
    customerEmail,
    customerPhone,
    passengerManifest,
    gstDetails,
  });

  if (!orderRes.data?.success || !orderRes.data?.order?.id) {
    const errorMsg = orderRes.data?.message || 'Failed to create payment order.';
    // Check if gateway is not configured
    if (orderRes.data?.code === 'GATEWAY_NOT_CONFIGURED') {
      throw new Error('GATEWAY_NOT_CONFIGURED');
    }
    throw new Error(errorMsg);
  }

  const { order, key_id } = orderRes.data;

  // 3. Open Razorpay checkout
  if (onPaymentStart) onPaymentStart();

  return new Promise((resolve, reject) => {
    const options = {
      key: key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'TravelEase',
      description: serviceTitle || 'Travel Booking',
      order_id: order.id,
      prefill: {
        name: customerName || '',
        email: customerEmail || '',
        contact: customerPhone || '',
      },
      notes: {
        bookingId: bookingId || '',
        platform: 'TravelEase',
      },
      theme: {
        color: '#4f46e5', // Indigo — matches TravelEase brand
        backdrop_color: 'rgba(0, 0, 0, 0.7)',
      },
      modal: {
        ondismiss: () => {
          reject(new Error('PAYMENT_CANCELLED'));
        },
        confirm_close: true,
        animation: true,
      },
      handler: async (response) => {
        // 4. Verify payment signature on server
        try {
          if (onPaymentProgress) onPaymentProgress('Verifying payment security...');

          const verifyRes = await api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: orderRes.data?.bookingId || bookingId,
          });

          if (verifyRes.data?.success) {
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              method: 'razorpay',
            });
          } else {
            reject(new Error('Payment verification failed. Your money is safe — please contact support.'));
          }
        } catch (verifyErr) {
          reject(new Error('Payment verification error. Please contact support with payment ID: ' + response.razorpay_payment_id));
        }
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        const failReason = response.error?.description || 'Payment failed';
        reject(new Error(`PAYMENT_FAILED: ${failReason}`));
      });
      razorpay.open();
    } catch (e) {
      reject(new Error('Failed to open payment gateway. Please try again.'));
    }
  });
};

// ─── Request Refund ──────────────────────────────────────────────────────────
export const requestRefund = async (paymentId, amount = null, reason = 'Booking cancellation') => {
  try {
    const res = await api.post('/payments/refund', { paymentId, amount, reason });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Refund request failed.');
  }
};

// ─── Get Payment Status ──────────────────────────────────────────────────────
export const getPaymentStatus = async (paymentId) => {
  try {
    const res = await api.get(`/payments/status/${paymentId}`);
    return res.data;
  } catch (err) {
    throw new Error('Failed to fetch payment status.');
  }
};

// ─── Convert USD to INR for payment ──────────────────────────────────────────
// Razorpay processes in INR. This converts USD amounts for the gateway.
export const convertToINR = (amountUSD, exchangeRate = 86.5) => {
  return Math.round(amountUSD * exchangeRate);
};
