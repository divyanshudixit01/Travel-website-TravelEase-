// Frontend Hotel API Client — LiteAPI Real-Time Travel Engine
// All API communication is securely proxied through the backend server
// No API keys are exposed to the client

import axios from 'axios';

const rawBase = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL));
const API_BASE = rawBase
  ? `${rawBase.replace(/\/$/, '')}/hotels`
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/api/hotels'
    : 'http://localhost:5000/api/hotels');

const hotelClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ─── Popular Destinations for Quick Access ──────────────────────────────────
export const POPULAR_DESTINATIONS = [
  { name: 'Varanasi', city: 'Varanasi', country: 'India', label: 'Varanasi, Ghats & Spiritual Stays (UP)', flag: '🛕' },
  { name: 'Ayodhya', city: 'Ayodhya', country: 'India', label: 'Ayodhya, Holy City & Stays (UP)', flag: '🚩' },
  { name: 'Lucknow', city: 'Lucknow', country: 'India', label: 'Lucknow, Nawabi Heritage & Luxury (UP)', flag: '🕌' },
  { name: 'Agra', city: 'Agra', country: 'India', label: 'Agra, Taj Mahal & Heritage Stays (UP)', flag: '🏛️' },
  { name: 'Gorakhpur', city: 'Gorakhpur', country: 'India', label: 'Gorakhpur, Pilgrimage & City Stays (UP)', flag: '🏢' },
  { name: 'Prayagraj', city: 'Prayagraj', country: 'India', label: 'Prayagraj (Allahabad), Sangam Stays (UP)', flag: '🌊' },
  { name: 'Mathura', city: 'Mathura', country: 'India', label: 'Mathura & Vrindavan Stays (UP)', flag: '✨' },
  { name: 'Jhansi', city: 'Jhansi', country: 'India', label: 'Jhansi, Historic Fortress Stays (UP)', flag: '🏰' },
  { name: 'Kanpur', city: 'Kanpur', country: 'India', label: 'Kanpur, Industrial Hub Hotels (UP)', flag: '🏭' },
  { name: 'Bareilly', city: 'Bareilly', country: 'India', label: 'Bareilly, Budget & Business Stays (UP)', flag: '🏨' },
  { name: 'Goa', city: 'Goa', country: 'India', label: 'Goa, Beach Paradise & Resorts', flag: '🏖️' },
  { name: 'Jaipur', city: 'Jaipur', country: 'India', label: 'Jaipur, Royal Palaces & Haveli', flag: '🏰' },
  { name: 'New Delhi', city: 'New Delhi', country: 'India', label: 'New Delhi, 5★ Luxury & Heritage', flag: '🏛️' },
  { name: 'Mumbai', city: 'Mumbai', country: 'India', label: 'Mumbai, Sea Facing & Business', flag: '🌊' },
  { name: 'Rishikesh', city: 'Rishikesh', country: 'India', label: 'Rishikesh, Yoga & Riverfront Resorts', flag: '🧘' },
  { name: 'Manali', city: 'Manali', country: 'India', label: 'Manali, Mountain Cottages & Snow Stays', flag: '🏔️' },
];

// ─── 1. Search Hotels (Paginated) ──────────────────────────────────────────
export const searchGoogleHotels = async ({
  destination = 'Varanasi',
  checkIn,
  checkOut,
  adults = 2,
  children = 0,
  rooms = 1,
  currency = 'INR',
  property_type = 'all',
  page = 1,
  limit = 20
}) => {
  try {
    const res = await hotelClient.get('/search', {
      params: {
        destination,
        check_in: checkIn,
        check_out: checkOut,
        adults,
        children,
        rooms,
        currency,
        property_type,
        page,
        limit
      }
    });
    return res.data;
  } catch (err) {
    console.warn('[hotelApi] Hotels live search unavailable (falling back to real-time engine):', err.response?.data?.message || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to fetch hotels',
      properties: [],
      total_available: 0,
      page: 1,
      total_pages: 0,
      has_more: false
    };
  }
};

// ─── 2. Search Destinations / Autocomplete ──────────────────────────────────
export const searchHotelDestinations = async (query = '') => {
  try {
    if (!query || query.trim().length < 2) {
      return POPULAR_DESTINATIONS;
    }
    const res = await hotelClient.get('/destinations', { params: { query } });
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('[hotelApi] Destination search error:', err.message);
  }

  // Filter local reference list as fallback
  const q = query.toLowerCase().trim();
  return POPULAR_DESTINATIONS.filter(d =>
    d.city.toLowerCase().includes(q) ||
    d.name.toLowerCase().includes(q) ||
    d.country.toLowerCase().includes(q)
  );
};

// ─── 3. Get Cities (4,361 Indian cities from LiteAPI) ───────────────────────
export const getCities = async (countryCode = 'IN') => {
  try {
    const res = await hotelClient.get('/cities', { params: { countryCode } });
    return res.data;
  } catch (err) {
    console.error('[hotelApi] Cities error:', err.message);
    return { success: false, cities: [] };
  }
};

// ─── 4. Get Property Details ────────────────────────────────────────────────
export const getPropertyDetails = async (propertyId, currency = 'INR') => {
  try {
    const res = await hotelClient.get(`/property/${propertyId}`, { params: { currency } });
    return res.data;
  } catch (err) {
    console.error('[hotelApi] Property details error:', err.message);
    return { success: false, property: null };
  }
};

// ─── 5. Get Property Reviews (Sentiment Analysis) ──────────────────────────
export const getPropertyReviews = async (propertyId) => {
  try {
    const res = await hotelClient.get(`/property/${propertyId}/reviews`);
    return res.data;
  } catch (err) {
    console.error('[hotelApi] Property reviews error:', err.message);
    return { success: false, sentiment: null };
  }
};

// ─── 6. Prebook Hotel (Lock in Rate & Policies) ─────────────────────────────
export const prebookHotel = async ({ offerId }) => {
  try {
    const res = await hotelClient.post('/prebook', { offerId });
    return res.data;
  } catch (err) {
    console.error('[hotelApi] Prebook error:', err.response?.data?.message || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to lock hotel rate'
    };
  }
};

// ─── 7. Book Hotel (Instant Confirmation & Voucher) ─────────────────────────
export const bookHotel = async ({ prebookId, holder, guests, payment }) => {
  try {
    const res = await hotelClient.post('/book', { prebookId, holder, guests, payment });
    return res.data;
  } catch (err) {
    console.error('[hotelApi] Booking error:', err.response?.data?.message || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to confirm reservation'
    };
  }
};

// ─── 8. Retrieve Booking by ID ──────────────────────────────────────────────
export const getBookingById = async (bookingId) => {
  try {
    const res = await hotelClient.get(`/booking/${bookingId}`);
    return res.data;
  } catch (err) {
    console.error('[hotelApi] Booking retrieval error:', err.response?.data?.message || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Booking not found'
    };
  }
};

// ─── 9. Download Booking Voucher ────────────────────────────────────────────
export const downloadVoucher = async (bookingId) => {
  try {
    const res = await hotelClient.get(`/booking/${bookingId}/voucher`, {
      responseType: 'text'
    });
    return { success: true, voucher: res.data };
  } catch (err) {
    console.error('[hotelApi] Voucher error:', err.response?.data?.message || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Voucher not available'
    };
  }
};

// ─── 10. Cancel Booking ─────────────────────────────────────────────────────
export const cancelBooking = async (bookingId) => {
  try {
    const res = await hotelClient.put(`/booking/${bookingId}/cancel`);
    return res.data;
  } catch (err) {
    console.error('[hotelApi] Cancel error:', err.response?.data?.message || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Cancellation failed'
    };
  }
};
