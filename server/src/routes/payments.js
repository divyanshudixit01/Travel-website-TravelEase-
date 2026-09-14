// ─── Razorpay Payment Gateway Integration ────────────────────────────────────
// India-first payment processing: UPI, Cards, Net Banking, Wallets, EMI
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import WebhookEvent from '../models/WebhookEvent.js';
import { verifyQuoteToken } from '../services/pricingService.js';
import { sendBookingConfirmationEmail } from '../services/emailService.js';

const router = express.Router();

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// ─── 1. Create Payment Order (Server-Authoritative) ───────────────────────────
// Requires a valid quoteToken to prevent client-side price manipulation
router.post('/create-order', async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured. Please contact support.',
        code: 'GATEWAY_NOT_CONFIGURED',
      });
    }

    const {
      quoteToken,
      bookingId,
      customerName,
      customerEmail,
      customerPhone,
      passengerManifest,
      gstDetails,
    } = req.body;

    let authorizedAmountINR;
    let authorizedTitle;
    let serviceType = 'travel';
    let travelDetails = {};
    let fareBreakdown = {};
    let amountUSD = 0;

    // Strictly require and validate cryptographic quoteToken
    if (!quoteToken) {
      return res.status(400).json({
        success: false,
        message: 'quoteToken is required to establish authoritative fare.',
        code: 'QUOTE_TOKEN_REQUIRED',
      });
    }

    const verification = verifyQuoteToken(quoteToken);
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.reason || 'Invalid or expired quote token. Please re-check fares.',
        code: 'QUOTE_INVALID_OR_EXPIRED',
      });
    }

    authorizedAmountINR = verification.quote.amountINR;
    authorizedTitle = verification.quote.itemTitle;
    serviceType = verification.quote.serviceType;
    travelDetails = verification.quote.travelDetails || {};
    fareBreakdown = verification.quote.fareBreakdown || {};
    amountUSD = verification.quote.amountUSD || Math.round(authorizedAmountINR / 86.5);

    if (!authorizedAmountINR || authorizedAmountINR <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount.' });
    }

    const generatedBookingId =
      bookingId ||
      `TE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Razorpay expects amount in smallest currency unit (paise for INR)
    const amountInPaise = Math.round(authorizedAmountINR * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: generatedBookingId,
      notes: {
        bookingId: generatedBookingId,
        serviceTitle: authorizedTitle,
        customerEmail: customerEmail || '',
        customerName: customerName || '',
        gstin: gstDetails?.gstin || '',
        companyName: gstDetails?.companyName || '',
        platform: 'TravelEase',
      },
    });

    // Create or update pre-booking record in Pending state
    try {
      await Booking.findOneAndUpdate(
        { bookingId: generatedBookingId },
        {
          bookingId: generatedBookingId,
          customerEmail: customerEmail || 'traveler@travelease.com',
          customerName: customerName || 'Valued Traveler',
          customerPhone: customerPhone || '',
          serviceType: serviceType || 'tour',
          serviceTitle: authorizedTitle,
          details: {
            ...travelDetails,
            passengerManifest: passengerManifest || [],
            claimGst: Boolean(gstDetails?.gstin),
          },
          amount: authorizedAmountINR,
          currency: 'INR',
          amountUSD,
          status: 'Pending',
          paymentStatus: 'Pending',
          razorpayOrderId: order.id,
          gstDetails: gstDetails || {},
          fareBreakdown,
        },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn('[Payments] Non-fatal pre-booking reservation notice:', dbErr.message);
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      bookingId: generatedBookingId,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('[Payments] Order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order. Please try again.',
    });
  }
});

// ─── 2. Verify Payment Signature & Transition Booking ─────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters.',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway configuration missing secret.',
      });
    }

    // Generate expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

    // Constant-time comparison guarded against length mismatches
    const expectedBuf = Buffer.from(expectedSignature);
    const signatureBuf = Buffer.from(razorpay_signature);
    const isValid =
      expectedBuf.byteLength === signatureBuf.byteLength &&
      crypto.timingSafeEqual(expectedBuf, signatureBuf);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Signature mismatch.',
      });
    }

    // Update booking in MongoDB to Confirmed & Paid
    let booking = null;
    if (bookingId) {
      booking = await Booking.findOne({ bookingId: bookingId.trim().toUpperCase() });
    }
    if (!booking && razorpay_order_id) {
      booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });
    }

    if (booking) {
      booking.status = 'Confirmed';
      booking.paymentStatus = 'Paid';
      booking.razorpayPaymentId = razorpay_payment_id;
      booking.razorpayOrderId = razorpay_order_id;
      booking.paymentMethod = `Razorpay (${razorpay_payment_id})`;
      await booking.save();

      // Dispatch confirmation email
      sendBookingConfirmationEmail(booking, booking.customerEmail).catch((err) => {
        console.warn('[Payments Verify] Email notice:', err.message);
      });
    }

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully.',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      booking,
    });
  } catch (error) {
    console.error('[Payments] Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification error. Please contact support.',
    });
  }
});

// ─── 3. Get Payment Status ────────────────────────────────────────────────────
router.get('/status/:paymentId', async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured.' });
    }

    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount / 100,
        currency: payment.currency,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        created_at: payment.created_at,
      },
    });
  } catch (error) {
    console.error('[Payments] Status check error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment status.' });
  }
});

// ─── 4. Process Refund via Razorpay API ────────────────────────────────────────
router.post('/refund', async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured.' });
    }

    const { paymentId, bookingId, amount, reason = 'Customer requested cancellation' } = req.body;

    let targetPaymentId = paymentId;
    let targetBooking = null;

    if (bookingId) {
      targetBooking = await Booking.findOne({ bookingId: bookingId.trim().toUpperCase() });
      if (targetBooking?.razorpayPaymentId) {
        targetPaymentId = targetBooking.razorpayPaymentId;
      }
    }

    if (!targetPaymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required to process refund.' });
    }

    const refundOptions = {
      notes: { reason, platform: 'TravelEase' },
    };

    if (amount && Number(amount) > 0) {
      refundOptions.amount = Math.round(Number(amount) * 100);
    }

    const refund = await razorpay.payments.refund(targetPaymentId, refundOptions);

    if (targetBooking) {
      targetBooking.status = 'Cancelled';
      targetBooking.paymentStatus = 'Refunded';
      await targetBooking.save();
    }

    res.json({
      success: true,
      message: 'Refund initiated successfully via Razorpay.',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        speed_processed: refund.speed_processed,
      },
    });
  } catch (error) {
    console.error('[Payments] Refund error:', error);
    res.status(500).json({
      success: false,
      message: error.error?.description || error.message || 'Refund processing failed.',
    });
  }
});

// ─── 5. Gateway Status Check ──────────────────────────────────────────────────
router.get('/gateway-status', (req, res) => {
  const razorpay = getRazorpayInstance();
  res.json({
    success: true,
    configured: Boolean(razorpay),
    gateway: 'Razorpay',
    modes: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'EMI'],
    testMode: process.env.NODE_ENV !== 'production',
  });
});

// ─── 6. Razorpay Webhook with Raw-Buffer HMAC & Idempotency ───────────────────
router.post('/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('[Payments Webhook] RAZORPAY_WEBHOOK_SECRET is not configured on the server.');
      return res.status(503).json({
        success: false,
        message: 'Webhook secret is not configured on the server.',
      });
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      console.warn('[Payments Webhook] Rejected webhook request with missing signature header.');
      return res.status(401).json({
        success: false,
        message: 'Missing x-razorpay-signature header.',
      });
    }

    // Use rawBody buffer captured by express.json verify middleware
    const bodyBuffer = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(bodyBuffer).digest('hex');

    const expectedBuf = Buffer.from(expectedSignature);
    const signatureBuf = Buffer.from(signature);

    const isSigValid =
      expectedBuf.byteLength === signatureBuf.byteLength &&
      crypto.timingSafeEqual(expectedBuf, signatureBuf);

    if (!isSigValid) {
      console.warn('[Payments Webhook] Rejected invalid HMAC signature.');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;
    const paymentEntity = payload?.payment?.entity;
    const orderEntity = payload?.order?.entity;
    const notes = paymentEntity?.notes || orderEntity?.notes || {};
    const bookingId = notes.bookingId;
    const paymentId = paymentEntity?.id;
    const orderId = paymentEntity?.order_id || orderEntity?.id;

    const eventId = req.body.event_id || `${event}_${paymentId || orderId || Date.now()}`;

    // Idempotency check: prevent duplicate event processing
    try {
      const existing = await WebhookEvent.findOne({ eventId });
      if (existing) {
        console.log(`[Payments Webhook] Event ${eventId} already processed. Skipping duplicate.`);
        return res.json({ status: 'already_processed' });
      }

      await WebhookEvent.create({
        eventId,
        eventType: event,
        paymentId: paymentId || '',
        orderId: orderId || '',
        bookingId: bookingId || '',
        payload: req.body,
      });
    } catch (idempErr) {
      console.warn('[Payments Webhook] Idempotency notice:', idempErr.message);
    }

    console.log(`[Payments Webhook] Processing event: ${event} for booking: ${bookingId}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      if (bookingId || orderId) {
        const query = bookingId ? { bookingId } : { razorpayOrderId: orderId };
        const booking = await Booking.findOne(query);

        if (booking) {
          booking.paymentStatus = 'Paid';
          booking.status = 'Confirmed';
          if (paymentId) booking.razorpayPaymentId = paymentId;
          if (orderId) booking.razorpayOrderId = orderId;
          await booking.save();
          console.log(`[Payments Webhook] Confirmed booking: ${booking.bookingId}`);

          sendBookingConfirmationEmail(booking, booking.customerEmail).catch((err) => {
            console.warn('[Payments Webhook] Email notice:', err.message);
          });
        }
      }
    } else if (event === 'payment.failed') {
      if (bookingId || orderId) {
        const query = bookingId ? { bookingId } : { razorpayOrderId: orderId };
        await Booking.findOneAndUpdate(query, { paymentStatus: 'Failed' });
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('[Payments Webhook Error]:', error.message);
    res.status(500).json({ success: false, message: 'Webhook error' });
  }
});

export default router;
