import express from 'express';
import Booking from '../models/Booking.js';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import { sendBookingConfirmationEmail } from '../services/emailService.js';

const router = express.Router();

const getAuthUser = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
};

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// ─── 1. Create or Sync a Booking ──────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const {
      bookingId,
      customerEmail,
      customerName,
      customerPhone,
      serviceType,
      provider = 'TravelEase Direct',
      serviceTitle,
      details,
      amount,
      currency = 'INR',
      amountUSD,
      paymentMethod = 'Razorpay Gateway',
      image,
      qrCodeData,
      gstDetails,
      razorpayPaymentId,
      razorpayOrderId,
      convenienceFee = 0,
      fareBreakdown,
    } = req.body;

    if (!serviceTitle || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required booking details.' });
    }

    const generatedId =
      bookingId ||
      `TE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const email = customerEmail || authUser?.email || 'traveler@travelease.com';
    const name = customerName || authUser?.name || 'Valued Traveler';

    // A booking is only Confirmed if it has a confirmed payment ID from Razorpay or an admin token
    const isPaid = Boolean(razorpayPaymentId);
    const initialStatus = isPaid ? 'Confirmed' : 'Pending';
    const initialPaymentStatus = isPaid ? 'Paid' : 'Pending';

    const bookingData = {
      bookingId: generatedId,
      user: authUser?.id || null,
      customerEmail: email,
      customerName: name,
      customerPhone: customerPhone || '',
      serviceType: serviceType || 'tour',
      provider,
      serviceTitle,
      details: details || {},
      amount: Number(amount) || 0,
      currency,
      amountUSD: Number(amountUSD) || Math.round((Number(amount) || 0) / 86.5),
      status: initialStatus,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      image: image || '',
      qrCodeData: qrCodeData || `TRAVELEASE-CONFIRMED-${generatedId}-${email}`,
      gstDetails: gstDetails || { companyName: '', gstin: '', companyAddress: '' },
      razorpayPaymentId: razorpayPaymentId || '',
      razorpayOrderId: razorpayOrderId || '',
      convenienceFee: Number(convenienceFee) || 0,
      fareBreakdown: fareBreakdown || {
        baseFare: Number(amount) || 0,
        taxesAndGst: 0,
        discounts: 0,
        convenienceFee: Number(convenienceFee) || 0,
      },
    };

    const booking = await Booking.findOneAndUpdate({ bookingId: generatedId }, bookingData, {
      upsert: true,
      new: true,
    });

    if (isPaid) {
      sendBookingConfirmationEmail(booking, email).catch((err) => {
        console.warn('[Bookings Route] Email notification notice:', err.message);
      });
    }

    res.status(201).json({
      success: true,
      message: isPaid
        ? 'Booking confirmed and recorded successfully.'
        : 'Booking draft created in pending state.',
      booking,
    });
  } catch (error) {
    console.error('[Bookings Route Create Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Error saving booking.' });
  }
});

// ─── 2. Get User Bookings ──────────────────────────────────────────────────────
router.get('/my-bookings', async (req, res) => {
  try {
    const authUser = getAuthUser(req);
    const emailQuery = req.query.email || authUser?.email;

    let filter = {};
    if (authUser?.id) {
      filter = { $or: [{ user: authUser.id }, { customerEmail: authUser.email }] };
    } else if (emailQuery) {
      filter = { customerEmail: emailQuery };
    }

    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('[Bookings Route Fetch Error]:', error);
    res.status(500).json({ success: false, message: 'Error retrieving bookings.' });
  }
});

// ─── 3. Get Single Booking by ID (Authoritative Hydration) ─────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id.trim().toUpperCase();

    const booking =
      (await Booking.findOne({ bookingId: cleanId })) ||
      (await Booking.findById(id).catch(() => null));

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking reference not found in central database.',
      });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('[Bookings Route ID Error]:', error);
    res.status(500).json({ success: false, message: 'Error retrieving reservation details.' });
  }
});

// ─── 4. Cancel Booking with Regulatory Penalty & Gateway Refund ────────────────
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = id.trim().toUpperCase();
    const { reason = 'Customer requested cancellation' } = req.body;

    const booking = await Booking.findOne({ bookingId: cleanId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found.' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    // Cancellation Policy Calculator
    const totalAmount = Number(booking.amount) || 0;
    let penaltyPercent = 0.10; // Default 10% processing penalty

    if (booking.serviceType === 'hotel') {
      const checkInDate = new Date(booking.details?.checkIn || booking.createdAt);
      const hoursUntilCheckIn = (checkInDate - new Date()) / (1000 * 60 * 60);
      if (hoursUntilCheckIn > 48) penaltyPercent = 0.05; // Free cancellation / 5% processing fee
      else if (hoursUntilCheckIn > 24) penaltyPercent = 0.50; // 1-night / 50% penalty
      else penaltyPercent = 1.0; // Non-refundable within 24 hours
    } else if (booking.serviceType === 'flight') {
      penaltyPercent = 0.20; // 20% airline penalty, statutory airport fees refunded
    }

    const penaltyAmount = Math.round(totalAmount * penaltyPercent);
    const refundAmount = Math.max(0, totalAmount - penaltyAmount);

    let refundResult = null;
    const razorpay = getRazorpayInstance();

    // Trigger automated refund via Razorpay if payment was captured
    if (razorpay && booking.razorpayPaymentId && refundAmount > 0) {
      try {
        refundResult = await razorpay.payments.refund(booking.razorpayPaymentId, {
          amount: Math.round(refundAmount * 100), // paise
          notes: {
            reason,
            bookingId: booking.bookingId,
            platform: 'TravelEase',
          },
        });
        console.log(`[Bookings Cancel] Gateway refund initiated for ${booking.bookingId}: ₹${refundAmount}`);
      } catch (refundErr) {
        console.warn('[Bookings Cancel] Non-fatal gateway refund notice:', refundErr.message);
      }
    }

    booking.status = 'Cancelled';
    booking.paymentStatus = refundAmount > 0 ? 'Refunded' : 'Paid';
    booking.details = {
      ...booking.details,
      cancellation: {
        cancelledAt: new Date().toISOString(),
        reason,
        penaltyAmount,
        refundAmount,
        refundId: refundResult?.id || 'MANUAL-DISPATCH',
      },
    };
    await booking.save();

    res.json({
      success: true,
      message: `Booking ${cleanId} has been cancelled. Refund of ₹${refundAmount.toLocaleString('en-IN')} initiated.`,
      cancellation: {
        penaltyAmount,
        refundAmount,
        currency: booking.currency || 'INR',
        refundId: refundResult?.id,
      },
      booking,
    });
  } catch (error) {
    console.error('[Bookings Route Cancel Error]:', error);
    res.status(500).json({ success: false, message: 'Error processing cancellation.' });
  }
});

export default router;
