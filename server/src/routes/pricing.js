import express from 'express';
import { createSignedQuote, verifyQuoteToken, SUPPORTED_EXCHANGE_RATES, USD_TO_INR_RATE } from '../services/pricingService.js';

const router = express.Router();

/**
 * GET /api/pricing/exchange-rates
 * Returns authoritative server exchange rates
 */
router.get('/exchange-rates', (_req, res) => {
  res.json({
    success: true,
    base: 'USD',
    inrRate: USD_TO_INR_RATE,
    rates: SUPPORTED_EXCHANGE_RATES,
    timestamp: Date.now(),
  });
});

/**
 * POST /api/pricing/quote
 * Generate a server-authoritative signed fare quote valid for 15 minutes
 */
router.post('/quote', (req, res) => {
  try {
    const {
      serviceType,
      itemTitle,
      flightNumber,
      from,
      to,
      departDate,
      returnDate,
      cabinClass,
      baseFareUSD,
      passengers,
      selectedBaggage,
      selectedMeals,
      hotelId,
      roomName,
      checkIn,
      checkOut,
      guests,
      roomsCount,
      ratePerNightUSD,
      provider,
      basePriceUSD,
      quantity,
      details,
      promoCode
    } = req.body;

    if (!serviceType) {
      return res.status(400).json({
        success: false,
        message: 'serviceType is required to generate a fare quote.',
      });
    }

    const quoteData = createSignedQuote({
      serviceType,
      itemTitle,
      flightNumber,
      from,
      to,
      departDate,
      returnDate,
      cabinClass,
      baseFareUSD,
      passengers,
      selectedBaggage,
      selectedMeals,
      hotelId,
      roomName,
      checkIn,
      checkOut,
      guests,
      roomsCount,
      ratePerNightUSD,
      provider,
      basePriceUSD,
      quantity,
      details,
      promoCode
    });

    res.json({
      success: true,
      ...quoteData,
    });
  } catch (error) {
    console.error('[Pricing Quote Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate fare quote. Please try again.',
    });
  }
});

/**
 * POST /api/pricing/verify
 * Validate an existing quote token
 */
router.post('/verify', (req, res) => {
  try {
    const { quoteToken } = req.body;
    const verification = verifyQuoteToken(quoteToken);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.reason,
      });
    }

    res.json({
      success: true,
      quote: verification.quote,
    });
  } catch (error) {
    console.error('[Pricing Verify Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify quote token.',
    });
  }
});

export default router;
