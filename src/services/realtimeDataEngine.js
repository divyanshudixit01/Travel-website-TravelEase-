// Real-time Data Engine & Universal Dynamic Search Generators for TravelEase Platform

import { generateDynamicHotels } from './dynamicTravelEngine.js';

// Exchange Rates relative to USD
export const EXCHANGE_RATES = {
  USD: { symbol: '$', rate: 1, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' },
  INR: { symbol: '₹', rate: 86.5, label: 'INR (₹)' }
};

// Global & Indian Airports Knowledge Base
export const GLOBAL_AIRPORTS = [
  { code: 'DEL', city: 'New Delhi', country: 'India', name: 'Indira Gandhi Intl Airport' },
  { code: 'BOM', city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Maharaj Intl' },
  { code: 'BLR', city: 'Bengaluru', country: 'India', name: 'Kempegowda International Airport' },
  { code: 'VNS', city: 'Varanasi', country: 'India', name: 'Lal Bahadur Shastri International Airport' },
  { code: 'AGR', city: 'Agra', country: 'India', name: 'Agra Civil Enclave Airport' },
  { code: 'GOI', city: 'Goa', country: 'India', name: 'Dabolim / Manohar International Airport' },
  { code: 'JAI', city: 'Jaipur', country: 'India', name: 'Jaipur International Airport' },
  { code: 'HYD', city: 'Hyderabad', country: 'India', name: 'Rajiv Gandhi International Airport' },
  { code: 'MAA', city: 'Chennai', country: 'India', name: 'Chennai International Airport' },
  { code: 'CCU', city: 'Kolkata', country: 'India', name: 'Netaji Subhash Chandra Bose Intl' },
  { code: 'IXL', city: 'Leh Ladakh', country: 'India', name: 'Kushok Bakula Rimpochee Airport' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', name: 'Dubai International Airport' },
  { code: 'AMM', city: 'Amman / Petra', country: 'Jordan', name: 'Queen Alia International Airport' },
  { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci–Fiumicino Airport' },
  { code: 'CUZ', city: 'Cusco / Machu Picchu', country: 'Peru', name: 'Alejandro Velasco Astete Airport' },
  { code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', name: 'Galeão International Airport' },
  { code: 'CUN', city: 'Cancún / Chichén Itzá', country: 'Mexico', name: 'Cancún International Airport' },
  { code: 'PEK', city: 'Beijing', country: 'China', name: 'Beijing Capital International Airport' },
  { code: 'ZRH', city: 'Zurich / Zermatt', country: 'Switzerland', name: 'Zurich International Airport' },
  { code: 'DPS', city: 'Bali', country: 'Indonesia', name: 'Ngurah Rai International Airport' },
  { code: 'KIX', city: 'Osaka / Kyoto', country: 'Japan', name: 'Kansai International Airport' },
  { code: 'NAP', city: 'Naples / Amalfi', country: 'Italy', name: 'Naples International Airport' },
  { code: 'JFK', city: 'New York', country: 'USA', name: 'John F. Kennedy Intl Airport' },
  { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Changi Airport' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', name: 'Haneda International Airport' },
  { code: 'LHR', city: 'London', country: 'UK', name: 'Heathrow Airport' },
  { code: 'SFO', city: 'San Francisco', country: 'USA', name: 'San Francisco Intl Airport' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA', name: 'Los Angeles Intl Airport' },
  { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Kingsford Smith Airport' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { code: 'ORD', city: 'Chicago', country: 'USA', name: "O'Hare International Airport" },
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

// Helper to look up airport city name
const lookupAirportCity = (code) => {
  const clean = (code || '').trim().toUpperCase();
  const match = GLOBAL_AIRPORTS.find(a => a.code === clean);
  return match ? match.city : clean || 'Departure City';
};

// ─── DYNAMIC FLIGHTS GENERATOR ───────────────────────────────────────────────
export const generateDynamicFlights = (fromCode = 'DEL', toCode = 'BOM', _date, cabinClass = 'Economy') => {
  const cleanFrom = (fromCode || 'DEL').trim().toUpperCase();
  const cleanTo = (toCode || 'BOM').trim().toUpperCase();
  const fromCity = lookupAirportCity(cleanFrom);
  const toCity = lookupAirportCity(cleanTo);

  const isDomesticIndia = ['DEL', 'BOM', 'BLR', 'VNS', 'AGR', 'GOI', 'JAI', 'HYD', 'MAA', 'CCU', 'IXL'].includes(cleanFrom) &&
                          ['DEL', 'BOM', 'BLR', 'VNS', 'AGR', 'GOI', 'JAI', 'HYD', 'MAA', 'CCU', 'IXL'].includes(cleanTo);

  const airlinePool = isDomesticIndia
    ? [
        { name: 'IndiGo', code: '6E', aircraft: 'Airbus A321neo', logo: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=120&auto=format&fit=crop&q=80', baseUSD: 78 },
        { name: 'Air India', code: 'AI', aircraft: 'Airbus A350-900', logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=120&auto=format&fit=crop&q=80', baseUSD: 95 },
        { name: 'Vistara (Air India)', code: 'UK', aircraft: 'Boeing 787-9 Dreamliner', logo: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=120&auto=format&fit=crop&q=80', baseUSD: 110 },
        { name: 'Akasa Air', code: 'QP', aircraft: 'Boeing 737 MAX 8', logo: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=120&auto=format&fit=crop&q=80', baseUSD: 68 }
      ]
    : [
        { name: 'Emirates', code: 'EK', aircraft: 'Boeing 777-300ER', logo: 'https://r-xx.bstatic.com/data/airlines_logo/EK.png', baseUSD: 340 },
        { name: 'Singapore Airlines', code: 'SQ', aircraft: 'Airbus A350-900 Ultra', logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=120&auto=format&fit=crop&q=80', baseUSD: 390 },
        { name: 'British Airways', code: 'BA', aircraft: 'Boeing 787-9 Dreamliner', logo: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=120&auto=format&fit=crop&q=80', baseUSD: 480 },
        { name: 'IndiGo Global', code: '6E', aircraft: 'Airbus A321XLR', logo: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=120&auto=format&fit=crop&q=80', baseUSD: 210 }
      ];

  const timeSlots = [
    { dep: '06:15 AM', arr: '08:35 AM', dur: isDomesticIndia ? '2h 20m' : '4h 15m' },
    { dep: '11:45 AM', arr: '02:10 PM', dur: isDomesticIndia ? '2h 25m' : '5h 30m' },
    { dep: '05:30 PM', arr: '07:55 PM', dur: isDomesticIndia ? '2h 25m' : '4h 45m' },
    { dep: '09:40 PM', arr: '12:05 AM (+1d)', dur: isDomesticIndia ? '2h 25m' : '6h 10m' }
  ];

  return airlinePool.map((airline, idx) => {
    const slot = timeSlots[idx % timeSlots.length];
    const flightNo = `${airline.code}-${100 + (idx * 211) % 899}`;
    const multiplier = cabinClass.toLowerCase() === 'business' ? 2.8 : 1.0;
    const priceUSD = Math.round(airline.baseUSD * multiplier);

    return {
      id: `dyn-fl-${cleanFrom.toLowerCase()}-${cleanTo.toLowerCase()}-${idx}`,
      airline: airline.name,
      airlineCode: airline.code,
      logo: airline.logo,
      flightNumber: flightNo,
      from: cleanFrom,
      fromCity,
      to: cleanTo,
      toCity,
      departureTime: slot.dep,
      arrivalTime: slot.arr,
      duration: slot.dur,
      stops: idx === 3 ? 1 : 0,
      stopDetails: idx === 3 ? '1 Short Stop (45m)' : 'Non-stop Direct',
      priceUSD,
      priceINR: Math.round(priceUSD * 86.5),
      cabinClass,
      availableSeats: 12 + idx * 4,
      rating: +(4.6 + (idx * 0.09)).toFixed(1),
      aircraft: airline.aircraft,
      amenities: [
        'Complimentary Refreshments',
        'High-Speed In-Flight WiFi',
        'Fast USB-C Power Ports',
        'Extra Seat Pitch & Comfort'
      ]
    };
  });
};

// Initial static seed for fast pre-renders
export const FLIGHTS_DATA = generateDynamicFlights('DEL', 'DXB');

export const searchRealtimeFlights = (fromCode, toCode, date, cabinClass = 'Economy') => {
  return generateDynamicFlights(fromCode, toCode, date, cabinClass);
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
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
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
    name: 'BrijRama Palace Heritage Ghat Sanctuary',
    city: 'Varanasi',
    country: 'India',
    tier: 'Heritage Boutique',
    address: 'Darbhanga Ghat, Dashashwamedh, Varanasi',
    lat: 25.3056,
    lng: 83.0104,
    image: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=1200&auto=format&fit=crop',
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
  const cleanCity = cityQuery.trim();
  if (!cleanCity) return HOTELS_DATA;

  const matches = HOTELS_DATA.filter(h =>
    h.city.toLowerCase().includes(cleanCity.toLowerCase()) ||
    h.country.toLowerCase().includes(cleanCity.toLowerCase()) ||
    h.name.toLowerCase().includes(cleanCity.toLowerCase())
  );

  if (matches.length > 0) return matches;

  // Dynamically generate authentic hotels for the queried city
  const generated = generateDynamicHotels(cleanCity);
  return generated.map(g => ({
    id: g.id,
    name: g.name,
    city: cleanCity,
    country: g.country,
    tier: g.tier,
    address: g.address,
    image: g.image,
    starRating: g.starRating,
    userRating: +g.userRating,
    reviewsCount: 840,
    pricePerNightUSD: g.pricePerNightUSD,
    pricePerNightINR: g.pricePerNightINR,
    freeCancellation: true,
    breakfastIncluded: true,
    amenities: g.amenities,
    rooms: [
      { id: 'r1', name: 'Deluxe City View Room', priceUSD: g.pricePerNightUSD, capacity: '2 Adults', size: '42 sq.m', bed: '1 King Bed' },
      { id: 'r2', name: 'Executive Suite', priceUSD: Math.round(g.pricePerNightUSD * 1.5), capacity: '2 Adults, 1 Child', size: '65 sq.m', bed: '1 King Bed' }
    ]
  }));
};

// ─── DYNAMIC BUSES GENERATOR ─────────────────────────────────────────────────
export const generateDynamicBuses = (fromCity = 'Delhi', toCity = 'Manali', _date) => {
  const origin = fromCity || 'Origin Hub';
  const dest = toCity || 'Destination';

  const operators = [
    {
      name: 'Zingbus Maxx Diamond Sleeper',
      busType: 'Volvo AC 9600 Multi-Axle Sleeper (2+1)',
      rating: 4.9,
      reviews: 3420,
      dep: '08:30 PM',
      arr: '06:15 AM (+1d)',
      dur: '9h 45m',
      distance: 520,
      priceUSD: 28,
      priceINR: 2350,
      seats: 9,
      status: '🟢 Live GPS · Highway Speed Telemetry Active',
      amenities: ['wifi', 'charging', 'blanket', 'water', 'restroom', 'live_tracking']
    },
    {
      name: 'IntrCity SmartBus Executive Lounge',
      busType: 'Scania Metrolink AC Luxury Sleeper',
      rating: 4.86,
      reviews: 2890,
      dep: '09:15 PM',
      arr: '07:00 AM (+1d)',
      dur: '9h 45m',
      distance: 520,
      priceUSD: 25,
      priceINR: 2150,
      seats: 14,
      status: '🟢 On-Time Departure · AC Pre-Cooled',
      amenities: ['wifi', 'charging', 'blanket', 'water', 'live_tracking']
    },
    {
      name: 'NueGo Green Electric Express',
      busType: 'Zero-Emission 100% Electric Ultra-Silent',
      rating: 4.92,
      reviews: 1740,
      dep: '07:00 PM',
      arr: '04:30 AM (+1d)',
      dur: '9h 30m',
      distance: 520,
      priceUSD: 26,
      priceINR: 2200,
      seats: 7,
      status: '🟢 Fast Charging 100% · Ready for Boarding',
      amenities: ['wifi', 'charging', 'water', 'live_tracking']
    },
    {
      name: 'VRL Travels I-Shift Royal Suite',
      busType: 'Volvo Multi-Axle Semi-Sleeper AC (2+2)',
      rating: 4.78,
      reviews: 4210,
      dep: '10:00 PM',
      arr: '08:15 AM (+1d)',
      dur: '10h 15m',
      distance: 520,
      priceUSD: 22,
      priceINR: 1850,
      seats: 16,
      status: '🟡 Gates Open for Verification',
      amenities: ['charging', 'blanket', 'water', 'live_tracking']
    },
    {
      name: 'Greenline Travels Club Class',
      busType: 'Mercedes-Benz Super High Deck Sleeper',
      rating: 4.88,
      reviews: 2150,
      dep: '08:00 PM',
      arr: '05:45 AM (+1d)',
      dur: '9h 45m',
      distance: 520,
      priceUSD: 27,
      priceINR: 2290,
      seats: 11,
      status: '🟢 Luggage Tagging & Express Boarding',
      amenities: ['wifi', 'charging', 'blanket', 'water', 'restroom', 'live_tracking']
    }
  ];

  return operators.map((op, idx) => ({
    id: `dyn-bus-${origin.toLowerCase().replace(/[^a-z0-9]/g, '')}-${dest.toLowerCase().replace(/[^a-z0-9]/g, '')}-${idx}`,
    operator: op.name,
    busType: op.busType,
    rating: op.rating,
    reviewsCount: op.reviews,
    departureTime: op.dep,
    arrivalTime: op.arr,
    duration: op.dur,
    distanceKm: op.distance,
    priceUSD: op.priceUSD,
    priceINR: op.priceINR,
    availableSeats: op.seats,
    liveStatus: op.status,
    pickupPoints: [
      `${origin} Central Metro Terminal Gate 1`,
      `${origin} Inter-State Hub & Lounge`,
      `${origin} Highway Expressway Toll Plaza`
    ],
    dropPoints: [
      `${dest} City Center Tourist Bus Terminal`,
      `${dest} Mall Road Interchange`,
      `${dest} Express Highway Junction`
    ],
    amenities: op.amenities
  }));
};

export const BUSES_DATA = generateDynamicBuses('Delhi', 'Manali');

export const searchRealtimeBuses = (fromCity = '', toCity = '', date) => {
  return generateDynamicBuses(fromCity || 'Delhi', toCity || 'Manali', date);
};

// ─── DYNAMIC HOMESTAYS GENERATOR ─────────────────────────────────────────────
export const generateDynamicHomestays = (locationQuery = 'Goa') => {
  const loc = locationQuery.trim() || 'Goa';

  const templates = [
    {
      titleSuffix: 'Coastal Plunge Pool Villa & Gardens',
      type: 'Private 4BHK Luxury Villa',
      bedrooms: 4,
      guests: 8,
      priceUSD: 280,
      priceINR: 24200,
      rating: 4.96,
      reviewsCount: 84,
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop',
      host: 'Superhost Priya',
      amenities: ['Private Plunge Pool', 'Direct Beach / Valley Path', 'Dedicated Chef Available', 'High-Speed Starlink WiFi']
    },
    {
      titleSuffix: 'Alpine Glass Chalet & Fireplace Retreat',
      type: 'Luxury Alpine Wood Chalet',
      bedrooms: 2,
      guests: 4,
      priceUSD: 190,
      priceINR: 16400,
      rating: 4.93,
      reviewsCount: 62,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop',
      host: 'Superhost Rohan',
      amenities: ['Indoor Fireplace', 'Panoramic Snow / Mountain Views', 'Heated Wooden Floors', 'Artisanal Breakfast']
    },
    {
      titleSuffix: 'Royal Heritage Haveli & Courtyard Suite',
      type: 'Private Heritage Suite',
      bedrooms: 3,
      guests: 6,
      priceUSD: 220,
      priceINR: 19000,
      rating: 4.95,
      reviewsCount: 94,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
      host: 'Rana Heritage Family',
      amenities: ['Sunset Rooftop Jharokha', 'Courtyard Garden', 'Classical Musicians on Request', 'Heritage Antiques']
    },
    {
      titleSuffix: 'Scenic Cliffside Architectural Estate',
      type: 'Ultra-Luxury 5BHK Estate',
      bedrooms: 5,
      guests: 10,
      priceUSD: 380,
      priceINR: 32800,
      rating: 4.98,
      reviewsCount: 112,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      host: 'Superhost Vikram & Elena',
      amenities: ['Infinity Pool Edge', 'Panoramic Skyline View', 'Private Butler & Chauffeur', 'Wine Cellar']
    }
  ];

  return templates.map((tpl, idx) => ({
    id: `dyn-home-${loc.toLowerCase().replace(/[^a-z0-9]/g, '')}-${idx}`,
    title: `${loc} ${tpl.titleSuffix}`,
    location: `${loc}, Scenic District`,
    type: tpl.type,
    bedrooms: tpl.bedrooms,
    guests: tpl.guests,
    pricePerNightUSD: tpl.priceUSD,
    pricePerNightINR: tpl.priceINR,
    rating: tpl.rating,
    reviewsCount: tpl.reviewsCount,
    image: tpl.image,
    host: tpl.host,
    amenities: tpl.amenities
  }));
};

export const HOMESTAYS_DATA = generateDynamicHomestays('Goa');

export const searchRealtimeHomestays = (location = '') => {
  return generateDynamicHomestays(location || 'Goa');
};

// ─── DYNAMIC TOURS & EXPERIENCES GENERATOR ───────────────────────────────────
export const generateDynamicTours = (locationQuery = 'Varanasi') => {
  const loc = locationQuery.trim() || 'Varanasi';

  const templates = [
    {
      titleSuffix: 'Sunrise Heritage Boat & Dawn Ceremonial Cruise',
      duration: '4 Hours',
      groupSize: 'Max 10 travelers',
      rating: 4.98,
      reviewsCount: 840,
      priceUSD: 35,
      priceINR: 2950,
      image: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=1200&auto=format&fit=crop',
      highlights: ['Private Hand-Rowed Wooden Boat', 'Dawn Golden Hour Panorama', 'VIP Ghat Seating for Morning Ceremony', 'Guided Heritage Storytelling']
    },
    {
      titleSuffix: 'VIP Skip-The-Line Royal Palace & Historic Monuments',
      duration: 'Full Day (7 Hours)',
      groupSize: 'Small Group (Max 8)',
      rating: 4.96,
      reviewsCount: 1420,
      priceUSD: 65,
      priceINR: 5600,
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop',
      highlights: ['Priority Monument Passes (No Queues)', 'Certified Art Historian Guide', 'Air-Conditioned Private Transfer', 'Royal Lunch Included']
    },
    {
      titleSuffix: 'Artisan Culinary Trail & Street Food Masterclass',
      duration: '3.5 Hours',
      groupSize: 'Max 6 food lovers',
      rating: 4.94,
      reviewsCount: 680,
      priceUSD: 40,
      priceINR: 3400,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
      highlights: ['8 Authentic Traditional Tastings', 'Secret Lanes & Spice Market Tour', 'Cooking Demonstration by Master Chef', 'Bottled Mineral Water & Chai']
    },
    {
      titleSuffix: 'Sunset Scenic Outskirts Safari & Stargazing Dinner',
      duration: '6 Hours',
      groupSize: 'Private 4x4 Vehicle',
      rating: 4.93,
      reviewsCount: 910,
      priceUSD: 75,
      priceINR: 6450,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      highlights: ['Scenic Countryside Off-Road Drive', 'Sunset Panorama Viewpoint', 'Candlelit Open-Air Feast', 'Astronomical Telescope Stargazing']
    }
  ];

  return templates.map((tpl, idx) => ({
    id: `dyn-tour-${loc.toLowerCase().replace(/[^a-z0-9]/g, '')}-${idx}`,
    title: `${loc} — ${tpl.titleSuffix}`,
    location: `${loc}, Iconic District`,
    duration: tpl.duration,
    groupSize: tpl.groupSize,
    rating: tpl.rating,
    reviewsCount: tpl.reviewsCount,
    priceUSD: tpl.priceUSD,
    priceINR: tpl.priceINR,
    image: tpl.image,
    highlights: tpl.highlights,
    inclusions: tpl.highlights
  }));
};

export const TOURS_DATA = generateDynamicTours('Varanasi');

export const searchRealtimeTours = (location = '') => {
  return generateDynamicTours(location || 'Varanasi');
};

export const searchRealtimeCruises = (destination = '') => {
  return generateDynamicTours(destination || 'Cruise Port').filter(t =>
    t.title.toLowerCase().includes('boat') ||
    t.title.toLowerCase().includes('cruise') ||
    t.title.toLowerCase().includes('sunrise')
  );
};

// ─── CARS & CABS FLEET ───────────────────────────────────────────────────────
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
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop',
    features: ['Spacious Recliner Captain Seats', 'Luggage Carrier', 'Hill-Trained Driver', 'All-India Tourist Permit']
  }
];

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
