// Real-time Data Engine & Universal Dynamic Search Generators for TravelEase Platform

// Exchange Rates relative to USD
export const EXCHANGE_RATES = {
  USD: { symbol: '$', rate: 1, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' },
  INR: { symbol: '₹', rate: 86.5, label: 'INR (₹)' }
};

// Global Airports Knowledge Base
export const GLOBAL_AIRPORTS = [
  { code: 'DEL', city: 'New Delhi', country: 'India', name: 'Indira Gandhi Intl Airport' },
  { code: 'BOM', city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Maharaj Intl' },
  { code: 'BLR', city: 'Bengaluru', country: 'India', name: 'Kempegowda International Airport' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International Airport' },
  { code: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy Intl Airport' },
  { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Changi Airport' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', name: 'Haneda International Airport' },
  { code: 'LHR', city: 'London', country: 'UK', name: 'Heathrow Airport' },
  { code: 'SFO', city: 'San Francisco', country: 'USA', name: 'San Francisco Intl Airport' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA', name: 'Los Angeles Intl Airport' },
  { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Kingsford Smith Airport' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { code: 'ORD', city: 'Chicago', country: 'USA', name: 'O\'Hare International Airport' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Schiphol Airport' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' }
];

// Formatter utility
export const formatCurrency = (amountInUSD, currencyCode = 'USD') => {
  const currencyInfo = EXCHANGE_RATES[currencyCode] || EXCHANGE_RATES.USD;
  const converted = amountInUSD * currencyInfo.rate;

  if (currencyCode === 'INR') {
    return `${currencyInfo.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  }
  return `${currencyInfo.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Generate realistic PNR / Booking ID
export const generateBookingReference = (prefix = 'TE') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
};

// ─── FLIGHTS ENGINE ──────────────────────────────────────────────────────────
export const FLIGHTS_DATA = [
  {
    id: 'fl-101',
    airline: 'Emirates',
    airlineCode: 'EK',
    logo: 'https://r-xx.bstatic.com/data/airlines_logo/EK.png',
    flightNumber: 'EK-511',
    from: 'DEL',
    fromCity: 'New Delhi',
    to: 'DXB',
    toCity: 'Dubai',
    departureTime: '06:30 AM',
    arrivalTime: '09:15 AM',
    duration: '3h 45m',
    stops: 0,
    stopDetails: 'Non-stop Direct',
    priceUSD: 240,
    cabinClass: 'Economy',
    availableSeats: 14,
    rating: 4.8,
    aircraft: 'Boeing 777-300ER',
    amenities: ['In-flight WiFi', 'Hot Multi-Course Meal', 'USB Power Ports', 'ICE Entertainment']
  },
  {
    id: 'fl-102',
    airline: 'Air India',
    airlineCode: 'AI',
    logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop&q=60',
    flightNumber: 'AI-805',
    from: 'DEL',
    fromCity: 'New Delhi',
    to: 'BOM',
    toCity: 'Mumbai',
    departureTime: '08:00 AM',
    arrivalTime: '10:15 AM',
    duration: '2h 15m',
    stops: 0,
    stopDetails: 'Non-stop Direct',
    priceUSD: 85,
    cabinClass: 'Economy',
    availableSeats: 22,
    rating: 4.6,
    aircraft: 'Airbus A350-900',
    amenities: ['Complementary Hot Breakfast', 'Extra Legroom', 'USB Charging']
  },
  {
    id: 'fl-103',
    airline: 'British Airways',
    airlineCode: 'BA',
    logo: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=100&auto=format&fit=crop&q=60',
    flightNumber: 'BA-142',
    from: 'DEL',
    fromCity: 'New Delhi',
    to: 'LHR',
    toCity: 'London',
    departureTime: '02:30 AM',
    arrivalTime: '07:10 AM',
    duration: '9h 10m',
    stops: 0,
    stopDetails: 'Non-stop Direct',
    priceUSD: 620,
    cabinClass: 'Economy',
    availableSeats: 8,
    rating: 4.7,
    aircraft: 'Boeing 787-9 Dreamliner',
    amenities: ['Full British Breakfast', 'High-Speed Satellite WiFi', 'Noise-Cancelling Audio']
  },
  {
    id: 'fl-104',
    airline: 'IndiGo',
    airlineCode: '6E',
    logo: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=100&auto=format&fit=crop&q=60',
    flightNumber: '6E-204',
    from: 'BOM',
    fromCity: 'Mumbai',
    to: 'DXB',
    toCity: 'Dubai',
    departureTime: '11:45 PM',
    arrivalTime: '01:30 AM',
    duration: '3h 15m',
    stops: 0,
    stopDetails: 'Non-stop Direct',
    priceUSD: 165,
    cabinClass: 'Economy',
    availableSeats: 19,
    rating: 4.5,
    aircraft: 'Airbus A321neo',
    amenities: ['On-time Guarantee', 'Pre-book Hot Snacks', 'Priority Boarding']
  }
];

export const searchRealtimeFlights = (fromCode, toCode, _date, _cabinClass = 'Economy') => {
  const cleanFrom = (fromCode || '').trim().toUpperCase();
  const cleanTo = (toCode || '').trim().toUpperCase();

  const matches = FLIGHTS_DATA.filter(f => f.from === cleanFrom && f.to === cleanTo);
  if (matches.length > 0) return matches;

  // If no exact match, return smart curated flights from the origin airport
  const fromMatches = FLIGHTS_DATA.filter(f => f.from === cleanFrom);
  return fromMatches.length > 0 ? fromMatches : FLIGHTS_DATA.slice(0, 2);
};

// ─── HOTELS ENGINE ───────────────────────────────────────────────────────────
export const HOTELS_DATA = [
  {
    id: 'ht-201',
    name: 'Atlantis The Royal Resort & Spa',
    city: 'Dubai',
    country: 'United Arab Emirates',
    tier: 'Luxury 5-Star',
    address: 'Crescent Rd, Palm Jumeirah, Dubai',
    lat: 25.1304,
    lng: 55.1171,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    starRating: 5,
    userRating: 4.9,
    reviewsCount: 1420,
    pricePerNightUSD: 350,
    freeCancellation: true,
    breakfastIncluded: true,
    amenities: ['Infinity Pool', 'Private Beach', 'Luxury Spa', '24/7 Butler Service', 'Free High-Speed WiFi'],
    rooms: [
      { id: 'r1', name: 'Ocean View Deluxe King', priceUSD: 350, capacity: '2 Adults', size: '55 sq.m', bed: '1 King Bed' },
      { id: 'r2', name: 'Palm View Sky Suite', priceUSD: 580, capacity: '2 Adults, 1 Child', size: '95 sq.m', bed: '1 King Bed' }
    ]
  },
  {
    id: 'ht-202',
    name: 'The Taj Mahal Palace & Tower',
    city: 'Mumbai',
    country: 'India',
    tier: 'Heritage Luxury 5-Star',
    address: 'Apollo Bunder, Colaba, Mumbai',
    lat: 18.9217,
    lng: 72.8332,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    starRating: 5,
    userRating: 4.95,
    reviewsCount: 3840,
    pricePerNightUSD: 280,
    freeCancellation: true,
    breakfastIncluded: true,
    amenities: ['Sea View Gateway Pool', 'Jiva Luxury Spa', 'Heritage Walk', 'Fine Dining Restaurants'],
    rooms: [
      { id: 'r1', name: 'Luxury Grande Room City View', priceUSD: 280, capacity: '2 Adults', size: '42 sq.m', bed: '1 King Bed' },
      { id: 'r2', name: 'Sea View Palace Suite', priceUSD: 620, capacity: '2 Adults', size: '80 sq.m', bed: '1 King Bed' }
    ]
  },
  {
    id: 'ht-203',
    name: 'BrijRama Palace Heritage Ghat Hotel',
    city: 'Varanasi',
    country: 'India',
    tier: 'Heritage Boutique',
    address: 'Darbhanga Ghat, Dashashwamedh, Varanasi',
    lat: 25.3056,
    lng: 83.0104,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    starRating: 5,
    userRating: 4.9,
    reviewsCount: 1120,
    pricePerNightUSD: 210,
    freeCancellation: true,
    breakfastIncluded: true,
    amenities: ['Direct Ganga Ghat View', 'Classical Morning Sitar', 'Pure Vegetarian Fine Dining', 'Private Boat Transfer'],
    rooms: [
      { id: 'r1', name: 'Nadidhara River View Suite', priceUSD: 210, capacity: '2 Adults', size: '45 sq.m', bed: '1 King Bed' }
    ]
  }
];

export const searchRealtimeHotels = (cityQuery = '') => {
  const cleanCity = cityQuery.trim().toLowerCase();
  if (!cleanCity) return HOTELS_DATA;

  const matches = HOTELS_DATA.filter(h =>
    h.city.toLowerCase().includes(cleanCity) ||
    h.country.toLowerCase().includes(cleanCity) ||
    h.name.toLowerCase().includes(cleanCity)
  );

  return matches.length > 0 ? matches : HOTELS_DATA;
};

// ─── VERIFIED PARTNER FLEETS (Cabs, Buses, Homestays, Tours) ──────────────────
export const CARS_DATA = [
  {
    id: 'car-blusmart-01',
    provider: 'BluSmart EV Fleet',
    vehicleName: 'Tata Tigor EV Prime',
    type: 'Electric Sedan',
    badge: '100% Zero Emission · Guaranteed No Cancellation',
    seats: 4,
    bags: 2,
    transmission: 'Automatic',
    rating: 4.95,
    tripsCount: 18400,
    pricePerKmUSD: 0.28,
    baseFareUSD: 14,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    features: ['Air Conditioned', 'Live GPS Tracking', 'Zero Surge Pricing', 'Verified Chauffeur']
  },
  {
    id: 'car-uber-black-02',
    provider: 'TravelEase Black Fleet',
    vehicleName: 'Mercedes-Benz E-Class & BMW 5',
    type: 'Luxury Chauffeur',
    badge: 'Executive VIP Transfer',
    seats: 4,
    bags: 3,
    transmission: 'Automatic',
    rating: 4.98,
    tripsCount: 4200,
    pricePerKmUSD: 0.95,
    baseFareUSD: 65,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    features: ['Chilled Bottled Water', 'Airport Meet & Greet', 'Complimentary In-Car WiFi', 'English-Speaking Driver']
  },
  {
    id: 'car-savaari-suv-03',
    provider: 'Savaari Outstation Verified',
    vehicleName: 'Toyota Innova Crysta ZX',
    type: 'Premium SUV',
    badge: 'Best for Hill Stations & Family',
    seats: 7,
    bags: 5,
    transmission: 'Manual',
    rating: 4.88,
    tripsCount: 9600,
    pricePerKmUSD: 0.42,
    baseFareUSD: 38,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    features: ['Spacious Recliner Captain Seats', 'Luggage Carrier', 'Hill-Trained Driver', 'All-India Tourist Permit']
  }
];

export const BUSES_DATA = [
  {
    id: 'bus-zing-01',
    operator: 'Zingbus Maxx Diamond Sleeper',
    partnerBadge: 'TravelEase Premier Bus Partner',
    busType: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
    rating: 4.9,
    reviewsCount: 3420,
    departureTime: '08:30 PM',
    arrivalTime: '06:15 AM (+1 day)',
    duration: '9h 45m',
    priceUSD: 24,
    availableSeats: 9,
    amenities: ['High-Speed WiFi', 'Individual LCD Screen', 'Sanitized Duvet & Pillow', 'Live GPS Tracking']
  },
  {
    id: 'bus-intrcity-02',
    operator: 'IntrCity SmartBus Executive Lounge',
    partnerBadge: 'Verified Clean Bus · Safe Travel',
    busType: 'Scania Metrolink AC Luxury Sleeper',
    rating: 4.85,
    reviewsCount: 2890,
    departureTime: '09:15 PM',
    arrivalTime: '07:00 AM (+1 day)',
    duration: '9h 45m',
    priceUSD: 22,
    availableSeats: 14,
    amenities: ['Smart Air Purifier', 'USB Fast Charging', 'Complimentary Mineral Water', 'Restroom on Board']
  }
];

export const HOMESTAYS_DATA = [
  {
    id: 'home-goa-01',
    title: 'Casa Sol Coastal Beachfront Villa',
    location: 'Goa, Anjuna Beach',
    type: 'Private 4BHK Luxury Villa',
    bedrooms: 4,
    guests: 8,
    pricePerNightUSD: 280,
    rating: 4.96,
    reviewsCount: 84,
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    host: 'Superhost Priya',
    amenities: ['Private Plunge Pool', 'Direct Beach Path', 'Dedicated Chef Available', 'High-Speed Starlink WiFi']
  },
  {
    id: 'home-manali-02',
    title: 'The Cedar Alpine Glass Chalet',
    location: 'Manali, Old Manali Apple Orchards',
    type: 'Heated Himalayan Chalet',
    bedrooms: 2,
    guests: 4,
    pricePerNightUSD: 140,
    rating: 4.92,
    reviewsCount: 126,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    host: 'Superhost Vikram',
    amenities: ['Floor-to-Ceiling Snow Views', 'Wood-Fired Fireplace', 'Radiator Heating', 'Home-Cooked Pahadi Meals']
  },
  {
    id: 'home-udaipur-03',
    title: 'Lake Pichola Royal Heritage Haveli',
    location: 'Udaipur, Lake Pichola Ghat',
    type: 'Private Heritage Suite',
    bedrooms: 3,
    guests: 6,
    pricePerNightUSD: 210,
    rating: 4.94,
    reviewsCount: 68,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    host: 'Rana Family Superhost',
    amenities: ['Sunset Rooftop Jharokha', 'Courtyard Garden', 'Classical Musicians on Request', 'Heritage Antiques']
  }
];

export const TOURS_DATA = [
  {
    id: 'tour-varanasi-01',
    title: 'Varanasi Sunrise Heritage Boat & Ganga Aarti Ceremony',
    location: 'Varanasi, India',
    duration: '4 Hours',
    groupSize: 'Max 10 travelers',
    rating: 4.98,
    reviewsCount: 840,
    priceUSD: 35,
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    highlights: ['Private Hand-Rowed Wooden Boat', 'Dawn Subah-e-Banaras View', 'VIP Ghat Seating for evening Aarti', 'Guided Heritage Storytelling']
  },
  {
    id: 'tour-dubai-02',
    title: 'VIP Red Dune Desert Safari with BBQ Dinner & Stargazing',
    location: 'Dubai, UAE',
    duration: '6 Hours',
    groupSize: 'Small Group 4x4',
    rating: 4.95,
    reviewsCount: 1920,
    priceUSD: 75,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    highlights: ['Dune Bashing in Land Cruiser', 'Sandboarding on High Dunes', 'Bedouin Camp Buffet BBQ', 'Live Falconry & Fire Show']
  },
  {
    id: 'tour-bali-03',
    title: 'Bali Sacred Temples, Rice Terraces & Jungle Swing Expedition',
    location: 'Ubud, Bali, Indonesia',
    duration: 'Full Day (8 Hours)',
    groupSize: 'Private Car & Guide',
    rating: 4.92,
    reviewsCount: 1430,
    priceUSD: 60,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    highlights: ['Uluwatu Cliffside Temple', 'Tegalalang Emerald Terraces', 'Luwak Coffee Plantation Tasting', 'Private Air-Conditioned Van']
  }
];

// ─── SEARCH HANDLERS WITH SMART MATCHING ──────────────────────────────────────
export const searchRealtimeCars = (cityQuery = '') => {
  const clean = cityQuery.trim().toLowerCase();
  if (!clean) return CARS_DATA;
  const filtered = CARS_DATA.filter(c =>
    c.provider.toLowerCase().includes(clean) ||
    c.vehicleName.toLowerCase().includes(clean) ||
    c.type.toLowerCase().includes(clean)
  );
  return filtered.length > 0 ? filtered : CARS_DATA;
};

export const searchRealtimeBuses = (_fromCity = '', _toCity = '') => {
  return BUSES_DATA;
};

export const searchRealtimeHomestays = (location = '') => {
  const clean = location.trim().toLowerCase();
  if (!clean) return HOMESTAYS_DATA;
  const matches = HOMESTAYS_DATA.filter(h =>
    h.location.toLowerCase().includes(clean) ||
    h.title.toLowerCase().includes(clean)
  );
  return matches.length > 0 ? matches : HOMESTAYS_DATA;
};

export const searchRealtimeCruises = (_destination = '') => {
  return TOURS_DATA.filter(t => t.title.toLowerCase().includes('boat') || t.title.toLowerCase().includes('cruise'));
};

export const searchRealtimeTours = (location = '') => {
  const clean = location.trim().toLowerCase();
  if (!clean) return TOURS_DATA;
  const matches = TOURS_DATA.filter(t =>
    t.location.toLowerCase().includes(clean) ||
    t.title.toLowerCase().includes(clean)
  );
  return matches.length > 0 ? matches : TOURS_DATA;
};
