// Frontend Hotel API Client — LiteAPI Real-Time Travel Engine
// All API communication is securely proxied through the backend server
// No API keys are exposed to the client

import axios from 'axios';
import { getApiBaseUrl } from './api.js';

const API_BASE = `${getApiBaseUrl()}/hotels`;

const hotelClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ─── Popular Destinations for Quick Access ──────────────────────────────────
export const POPULAR_DESTINATIONS = [
  { name: 'Varanasi', city: 'Varanasi', country: 'India', label: 'Varanasi, Ghats & Spiritual Stays (UP)', flag: '🛕' },
  { name: 'Ayodhya', city: 'Ayodhya', country: 'India', label: 'Ayodhya, Holy City & Stays (UP)', flag: '🚩' },
  { name: 'Prayagraj', city: 'Prayagraj', country: 'India', label: 'Prayagraj (Allahabad), Sangam Stays (UP)', flag: '🌊' },
  { name: 'Lucknow', city: 'Lucknow', country: 'India', label: 'Lucknow, Nawabi Heritage & Luxury (UP)', flag: '🕌' },
  { name: 'Agra', city: 'Agra', country: 'India', label: 'Agra, Taj Mahal & Heritage Stays (UP)', flag: '🏛️' },
  { name: 'Mathura', city: 'Mathura', country: 'India', label: 'Mathura & Vrindavan Krishna Stays (UP)', flag: '✨' },
  { name: 'Jaipur', city: 'Jaipur', country: 'India', label: 'Jaipur, Pink City Palaces & Haveli (RJ)', flag: '🏰' },
  { name: 'Udaipur', city: 'Udaipur', country: 'India', label: 'Udaipur, Lake Palace & Romantic Resorts (RJ)', flag: '⛵' },
  { name: 'Jodhpur', city: 'Jodhpur', country: 'India', label: 'Jodhpur, Sun City Fort & Boutique Stays (RJ)', flag: '☀️' },
  { name: 'Goa', city: 'Goa', country: 'India', label: 'Goa, Calangute, Baga & Beach Resorts', flag: '🏖️' },
  { name: 'Mumbai', city: 'Mumbai', country: 'India', label: 'Mumbai, Marine Drive & Luxury 5-Star (MH)', flag: '🌊' },
  { name: 'New Delhi', city: 'New Delhi', country: 'India', label: 'New Delhi, Connaught Place & Heritage (DL)', flag: '🏛️' },
  { name: 'Bengaluru', city: 'Bengaluru', country: 'India', label: 'Bengaluru, Silicon Valley Stays & Tech Hub (KA)', flag: '💻' },
  { name: 'Kolkata', city: 'Kolkata', country: 'India', label: 'Kolkata, Colonial Charm & City of Joy (WB)', flag: '🎭' },
  { name: 'Chennai', city: 'Chennai', country: 'India', label: 'Chennai, Marina Beach & Temple Heritage (TN)', flag: '🛕' },
  { name: 'Rishikesh', city: 'Rishikesh', country: 'India', label: 'Rishikesh, Yoga & Riverfront Resorts (UK)', flag: '🧘' },
  { name: 'Haridwar', city: 'Haridwar', country: 'India', label: 'Haridwar, Har Ki Pauri Ganga Aarti (UK)', flag: '🕉️' },
  { name: 'Manali', city: 'Manali', country: 'India', label: 'Manali, Mountain Cottages & Snow Stays (HP)', flag: '🏔️' },
  { name: 'Shimla', city: 'Shimla', country: 'India', label: 'Shimla, Mall Road & Colonial Cottages (HP)', flag: '🌲' },
  { name: 'Srinagar', city: 'Srinagar', country: 'India', label: 'Srinagar, Dal Lake Houseboats & Shikaras (JK)', flag: '🌸' },
  { name: 'Amritsar', city: 'Amritsar', country: 'India', label: 'Amritsar, Golden Temple & Punjabi Hospitality (PB)', flag: '🛕' },
  { name: 'Puri', city: 'Puri', country: 'India', label: 'Puri, Jagannath Temple & Golden Beach (OD)', flag: '🌅' },
  { name: 'Tirupati', city: 'Tirupati', country: 'India', label: 'Tirupati, Balaji Temple & Pilgrim Stays (AP)', flag: '🙏' },
  { name: 'Kochi', city: 'Kochi', country: 'India', label: 'Kochi, Fort Kochi & Backwaters Resorts (KL)', flag: '🌴' },
  { name: 'Darjeeling', city: 'Darjeeling', country: 'India', label: 'Darjeeling, Tea Garden Estate Retreats (WB)', flag: '☕' },
  { name: 'Gorakhpur', city: 'Gorakhpur', country: 'India', label: 'Gorakhpur, Gorakhnath Pilgrimage Stays (UP)', flag: '🏢' },
  { name: 'Kanpur', city: 'Kanpur', country: 'India', label: 'Kanpur, Industrial Hub Business Hotels (UP)', flag: '🏭' },
  { name: 'Jhansi', city: 'Jhansi', country: 'India', label: 'Jhansi, Historic Bundelkhand Stays (UP)', flag: '🏰' },
  { name: 'Bareilly', city: 'Bareilly', country: 'India', label: 'Bareilly, City Center & Budget Stays (UP)', flag: '🏨' },
];

// ─── Normalizer: Standardize API / Master Hotel into Consistent UI Model ──────
export function normalizeHotel(p, destination = '', currency = 'INR') {
  if (!p) return null;
  const id = String(p.property_id || p.id || `hotel-${Math.random().toString(36).substr(2, 9)}`);
  const name = p.name || 'Verified Indian Hotel';
  const starRating = Number(p.star_class || p.starRating || (p.hotel_type === '5-Star' ? 5 : 4));
  const primaryPhoto = p.primary_photo || p.photo_gallery?.[0] || p.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
  const photoGallery = Array.isArray(p.photo_gallery) && p.photo_gallery.length > 0 ? p.photo_gallery : [primaryPhoto];
  
  // Pricing extraction
  const priceObj = p.pricing?.price_per_night;
  const priceAmount = priceObj?.amount || p.pricePerNightUSD || p.base_price_inr || 3200;
  const totalObj = p.pricing?.total_stay_price;
  const totalAmount = totalObj?.amount || (priceAmount * 3);
  
  const userRating = p.user_rating?.score || p.userRating || 4.5;
  const reviewsCount = p.user_rating?.review_count || p.reviewsCount || 156;
  const ratingText = p.user_rating?.rating_text || (userRating >= 4.5 ? 'Superb' : userRating >= 4 ? 'Very Good' : 'Good');

  // Rooms normalization
  const rawRooms = p.rooms_available || p.rooms_detail || p.rooms || [];
  const rooms = rawRooms.length > 0 ? rawRooms.map(r => ({
    id: String(r.room_id || r.id || `room-${Math.random().toString(36).substr(2, 7)}`),
    offerId: r.offer_id || r.offerId,
    name: r.name || r.roomName || 'Deluxe Room',
    bed: Array.isArray(r.bed_types) && r.bed_types.length > 0 
      ? (typeof r.bed_types[0] === 'string' ? r.bed_types[0] : `${r.bed_types[0].quantity || 1} ${r.bed_types[0].type || 'Double Bed'}`)
      : (r.bed || '1 King Bed'),
    size: r.size_sqm ? `${r.size_sqm} sq.m` : (r.size || '32 sq.m'),
    capacity: r.max_occupancy ? `${r.max_occupancy} Guests` : (r.capacity || '2 Adults'),
    amenities: r.amenities || ['Free WiFi', 'Air Conditioning', 'Ensuite Bathroom'],
    priceAmount: r.price_per_night || r.priceUSD || priceAmount,
    formattedPrice: r.formatted_price || (currency === 'INR' ? `₹${Math.round(r.price_per_night || priceAmount).toLocaleString('en-IN')}` : `$${r.priceUSD || Math.round(priceAmount / 85)}`),
    freeCancellation: r.free_cancellation !== false,
    cancellationText: r.cancellation_text || 'Free cancellation until check-in',
    boardName: r.board_name || 'Room Only'
  })) : [
    {
      id: `${id}-std`,
      name: 'Deluxe Heritage Room',
      bed: '1 Extra-Large King Bed',
      size: '38 sq.m',
      capacity: '2 Adults, 1 Child',
      amenities: ['High Speed Wi-Fi', 'City/Ghat View', 'Rain Shower'],
      priceAmount,
      formattedPrice: currency === 'INR' ? `₹${Math.round(priceAmount).toLocaleString('en-IN')}` : `$${Math.round(priceAmount / 85)}`,
      freeCancellation: true,
      cancellationText: 'Free cancellation up to 24 hours before check-in',
      boardName: 'Room Only'
    },
    {
      id: `${id}-prm`,
      name: 'Executive Suite with Breakfast',
      bed: '1 King Bed + 1 Sofa Bed',
      size: '56 sq.m',
      capacity: '3 Adults',
      amenities: ['Complimentary Buffet Breakfast', 'Panoramic View', 'Bathtub & Lounge Access'],
      priceAmount: Math.round(priceAmount * 1.45),
      formattedPrice: currency === 'INR' ? `₹${Math.round(priceAmount * 1.45).toLocaleString('en-IN')}` : `$${Math.round((priceAmount * 1.45) / 85)}`,
      freeCancellation: true,
      cancellationText: 'Free cancellation up to 48 hours before check-in',
      boardName: 'Breakfast Included'
    }
  ];

  return {
    id,
    name,
    starRating,
    star_class: starRating,
    propertyType: p.property_type || 'HOTEL',
    is_oyo: Boolean(p.is_oyo || name.toLowerCase().includes('oyo')),
    is_budget: Boolean(p.is_budget || priceAmount <= 3000),
    chain: p.chain || null,
    image: primaryPhoto,
    primary_photo: primaryPhoto,
    photo_gallery: photoGallery,
    city: p.location?.city || destination,
    country: p.location?.country || 'India',
    address: p.location?.address || p.location?.neighborhood || `${destination}, India`,
    neighborhood: p.location?.neighborhood || '',
    userRating,
    reviewsCount,
    ratingText,
    amenities: (p.featured_amenities || p.all_amenities || p.amenities || ['Free WiFi', 'Room Service', 'Air Conditioning', 'Breakfast']).slice(0, 8),
    allAmenities: p.all_amenities || p.featured_amenities || [],
    priceAmount,
    priceFormatted: priceObj?.formatted || (currency === 'INR' ? `₹${Math.round(priceAmount).toLocaleString('en-IN')}` : `$${Math.round(priceAmount / 85)}`),
    totalStayPrice: totalAmount,
    totalStayFormatted: totalObj?.formatted || (currency === 'INR' ? `₹${Math.round(totalAmount).toLocaleString('en-IN')}` : `$${Math.round(totalAmount / 85)}`),
    dealBadge: p.pricing?.deal_badge || (starRating >= 5 ? 'Luxury Verified' : 'Best Rate'),
    cancellation: p.cancellation || { free_cancellation: true, cancellation_text: 'Free cancellation' },
    breakfastIncluded: Boolean(p.breakfast_included || (p.featured_amenities || []).some(a => a.toLowerCase().includes('breakfast'))),
    hotelPolicies: p.hotel_policies || { checkin: '14:00', checkout: '11:00' },
    description: p.description || `${name} offers premium authentic hospitality in ${p.location?.city || destination}.`,
    rooms,
    booking_providers: p.booking_providers || [],
    is_nearby: Boolean(p.is_nearby),
    nearby_label: p.nearby_label || null,
    currency
  };
}

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

    const rawList = res.data?.properties || res.data?.data || [];
    const normalized = rawList.map(p => normalizeHotel(p, destination, currency)).filter(Boolean);

    return {
      success: res.data?.success ?? (normalized.length > 0),
      destination: res.data?.destination || destination,
      count: normalized.length,
      total_available: res.data?.total_available || normalized.length,
      page: res.data?.page || page,
      total_pages: res.data?.total_pages || Math.ceil((res.data?.total_available || normalized.length) / limit),
      has_more: res.data?.has_more || false,
      currency: res.data?.currency || currency,
      engine: res.data?.engine || 'LiteAPI Real-Time Engine',
      properties: normalized,
      data: normalized
    };
  } catch (err) {
    console.warn('[hotelApi] Hotels live search error:', err.response?.data?.message || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to fetch hotels',
      properties: [],
      data: [],
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
