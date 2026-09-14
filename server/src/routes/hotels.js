// Express Routes for LiteAPI Real-Time Hotel Engine
import express from 'express';
import {
  searchHotelDestinationsAPI,
  searchGoogleHotelsAPI,
  getPropertyDetailsAPI,
  getPropertyReviewsAPI,
  prebookHotelAPI,
  bookHotelAPI,
  getBookingByIdAPI,
  getBookingVoucherAPI,
  cancelBookingAPI,
  getCitiesAPI
} from '../services/hotelService.js';

const router = express.Router();

// GET /api/hotels/destinations?query=Varanasi
router.get('/destinations', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await searchHotelDestinationsAPI(query || '');
    res.json(result);
  } catch (error) {
    console.error('[Hotel Destinations Route Error]:', error.message);
    res.status(502).json({ success: false, message: error.message || 'Failed to search destinations', data: [] });
  }
});

// GET /api/hotels/cities?countryCode=IN
router.get('/cities', async (req, res) => {
  try {
    const { countryCode } = req.query;
    const result = await getCitiesAPI(countryCode || 'IN');
    res.json(result);
  } catch (error) {
    console.error('[Cities Route Error]:', error.message);
    res.status(502).json({ success: false, message: error.message, cities: [] });
  }
});

// GET /api/hotels or /api/hotels/search
router.get(['/', '/search'], async (req, res) => {
  try {
    const {
      destination, city,
      check_in, checkIn,
      check_out, checkOut,
      adults, children, rooms,
      property_type, currency,
      page, limit
    } = req.query;

    const result = await searchGoogleHotelsAPI({
      destination: destination || city || 'Varanasi',
      check_in: check_in || checkIn,
      check_out: check_out || checkOut,
      adults: Number(adults) || 2,
      children: Number(children) || 0,
      rooms: Number(rooms) || 1,
      property_type: property_type || 'all',
      currency: currency || 'INR',
      page: Number(page) || 1,
      limit: Number(limit) || 20
    });

    res.json(result);
  } catch (error) {
    console.error('[Hotel Search Route Error]:', error.message);
    res.status(502).json({ success: false, message: error.message || 'Failed to search hotels', properties: [] });
  }
});

// GET /api/hotels/property/:propertyId?currency=INR
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { currency } = req.query;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'propertyId is required' });
    }

    const result = await getPropertyDetailsAPI({
      property_id: propertyId,
      currency: currency || 'INR'
    });

    res.json(result);
  } catch (error) {
    console.error('[Hotel Property Details Route Error]:', error.message);
    res.status(502).json({ success: false, message: error.message || 'Failed to fetch property details' });
  }
});

// GET /api/hotels/property/:propertyId/reviews
router.get('/property/:propertyId/reviews', async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'propertyId is required' });
    }

    const result = await getPropertyReviewsAPI({ property_id: propertyId });
    res.json(result);
  } catch (error) {
    console.error('[Hotel Reviews Route Error]:', error.message);
    res.status(502).json({ success: false, message: error.message || 'Failed to fetch reviews' });
  }
});

// POST /api/hotels/prebook
router.post('/prebook', async (req, res) => {
  try {
    const { offerId } = req.body;
    if (!offerId) {
      return res.status(400).json({ success: false, message: 'offerId is required for rate lock' });
    }

    const result = await prebookHotelAPI({ offerId });
    res.json(result);
  } catch (error) {
    console.error('[Hotel Prebook Route Error]:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to prebook hotel offer' });
  }
});

// POST /api/hotels/book
router.post('/book', async (req, res) => {
  try {
    const { prebookId, holder, guests, payment } = req.body;
    if (!prebookId || !holder) {
      return res.status(400).json({ success: false, message: 'prebookId and holder (firstName, email) are required' });
    }

    const result = await bookHotelAPI({ prebookId, holder, guests, payment });
    res.json(result);
  } catch (error) {
    console.error('[Hotel Booking Route Error]:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to complete hotel booking' });
  }
});

// GET /api/hotels/booking/:bookingId — Retrieve booking details
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const result = await getBookingByIdAPI(bookingId);
    res.json(result);
  } catch (error) {
    console.error('[Booking Retrieval Route Error]:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to retrieve booking' });
  }
});

// GET /api/hotels/booking/:bookingId/voucher — Download voucher
router.get('/booking/:bookingId/voucher', async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const result = await getBookingVoucherAPI(bookingId);
    res.type(result.contentType || 'text/plain').send(result.voucher);
  } catch (error) {
    console.error('[Voucher Route Error]:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to download voucher' });
  }
});

// PUT /api/hotels/booking/:bookingId/cancel — Cancel booking
router.put('/booking/:bookingId/cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const result = await cancelBookingAPI(bookingId);
    res.json(result);
  } catch (error) {
    console.error('[Booking Cancel Route Error]:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to cancel booking' });
  }
});

export default router;
