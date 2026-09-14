// Express Route for Pure Real-Time RapidAPI Flights
import express from 'express';
import {
  searchLiveFlightsAPI,
  searchLiveAirportsAPI,
  getLiveMinPriceAPI,
  getLiveFlightDetailsAPI
} from '../services/flightService.js';

const router = express.Router();

// GET /api/flights or /api/flights/search
router.get(['/', '/search'], async (req, res) => {
  try {
    const from = req.query.from || req.query.origin || req.query.originCode || req.query.src || 'DEL';
    const to = req.query.to || req.query.destination || req.query.destinationCode || req.query.dest || 'DXB';
    const departDate = req.query.departDate || req.query.date || req.query.departureDate || new Date().toISOString().split('T')[0];
    const { returnDate, adults, cabinClass, currency } = req.query;

    const result = await searchLiveFlightsAPI({
      from,
      to,
      departDate,
      returnDate,
      adults: Number(adults) || 1,
      cabinClass: cabinClass || 'ECONOMY',
      currency: currency || 'USD'
    });

    res.json(result);
  } catch (error) {
    console.error('[Flights Route Error]:', error.message);
    res.status(502).json({
      success: false,
      message: error.message || 'Failed to fetch live flight data from RapidAPI',
      data: []
    });
  }
});

// GET /api/flights/airports?query=Delhi
router.get('/airports', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await searchLiveAirportsAPI(query);
    res.json(result);
  } catch (error) {
    console.error('[Airports Route Error]:', error.message);
    res.status(502).json({
      success: false,
      message: error.message || 'Failed to search airports on RapidAPI',
      data: []
    });
  }
});

// GET /api/flights/min-price?from=DEL&to=DXB&departDate=2026-09-15
router.get('/min-price', async (req, res) => {
  try {
    const { from, to, departDate, currency } = req.query;
    if (!from || !to || !departDate) {
      return res.status(400).json({ success: false, message: 'Missing from, to or departDate' });
    }
    const result = await getLiveMinPriceAPI(from, to, departDate, currency);
    res.json(result);
  } catch (error) {
    console.error('[Min Price Route Error]:', error.message);
    res.status(502).json({
      success: false,
      message: error.message || 'Failed to fetch min price from RapidAPI'
    });
  }
});

// GET /api/flights/details?token=...
router.get('/details', async (req, res) => {
  try {
    const { token, currency } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing token' });
    }
    const result = await getLiveFlightDetailsAPI(token, currency);
    res.json(result);
  } catch (error) {
    console.error('[Flight Details Route Error]:', error.message);
    res.status(502).json({
      success: false,
      message: error.message || 'Failed to fetch flight details from RapidAPI'
    });
  }
});

export default router;
