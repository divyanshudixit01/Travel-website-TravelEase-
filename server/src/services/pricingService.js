import crypto from 'crypto';

// Enforce strict cryptographic quote secrets
const resolveQuoteSecret = () => {
  const secret = process.env.QUOTE_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[FATAL SECURITY ERROR] QUOTE_SECRET or JWT_SECRET must be configured in production.');
    }
    return 'travelease-secure-quote-dev-secret-local-only-2026';
  }
  return secret;
};

// Immediate production startup sanity assertion
if (process.env.NODE_ENV === 'production' && !process.env.QUOTE_SECRET && !process.env.JWT_SECRET) {
  throw new Error('[FATAL SECURITY ERROR] QUOTE_SECRET or JWT_SECRET must be configured in production.');
}

const QUOTE_TTL_MS = 15 * 60 * 1000; // 15 minutes validity
export const USD_TO_INR_RATE = 86.5;

export const SUPPORTED_EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 86.5,
  AED: 3.67,
  SGD: 1.34,
  THB: 34.5,
  JPY: 149.5,
  AUD: 1.53,
};

/**
 * Generate a unique quote reference
 */
export const generateQuoteId = (prefix = 'QUO') => {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
};

/**
 * Canonical JSON stringification (recursive key sorting)
 * Guarantees deterministic HMAC-SHA256 signature generation across runtimes
 */
export const canonicalStringify = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return '{' + keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(obj[k])}`).join(',') + '}';
};

/**
 * Sign payload with HMAC SHA-256 using canonical serialization
 */
const signPayload = (payload) => {
  const jsonStr = canonicalStringify(payload);
  return crypto.createHmac('sha256', resolveQuoteSecret()).update(jsonStr).digest('hex');
};

/**
 * Server-authoritative baseline fare validator
 * Enforces realistic floor prices to prevent $1 quote forging
 */
export const resolveAuthoritativeBaseFare = (serviceType, details = {}, clientBaseFare = 0) => {
  const numericClient = Number(clientBaseFare) || 0;

  if (serviceType === 'flight') {
    const from = String(details.from || '').trim().toUpperCase();
    const to = String(details.to || '').trim().toUpperCase();
    const title = String(details.itemTitle || '').trim().toUpperCase();

    const indianAirports = [
      'DEL', 'BOM', 'BLR', 'MAA', 'CCU', 'HYD', 'PNQ', 'AMD',
      'GOI', 'COK', 'JAI', 'VNS', 'ATQ', 'IXC', 'PAT', 'BBI',
      'GAU', 'TRV', 'IXB', 'SXR', 'IXL'
    ];

    const isDomestic = from && to && indianAirports.includes(from) && indianAirports.includes(to);
    const isExplicitIntl =
      ['DXB', 'LHR', 'JFK', 'SIN', 'BKK', 'KUL', 'NRT', 'CDG', 'SYD'].includes(from) ||
      ['DXB', 'LHR', 'JFK', 'SIN', 'BKK', 'KUL', 'NRT', 'CDG', 'SYD'].includes(to) ||
      title.includes('EMIRATES') || title.includes('BRITISH AIRWAYS') || title.includes('SINGAPORE');

    // Flight floor: $200 for international, $50 for domestic
    const floor = (isExplicitIntl || (!isDomestic && (from || to))) ? 200 : 50;
    return Math.max(floor, numericClient);
  }

  if (serviceType === 'hotel') {
    // Hotel floor: $60/night baseline
    const floor = 60;
    return Math.max(floor, numericClient);
  }

  if (serviceType === 'train') {
    // Train floor: $15 baseline
    const floor = 15;
    return Math.max(floor, numericClient);
  }

  // Tours, buses, cabs, homestays floor: $30 baseline
  const defaultFloor = 30;
  return Math.max(defaultFloor, numericClient);
};

/**
 * Calculate flight quote server-side with baseline protection
 */
export const calculateFlightQuote = ({
  itemTitle,
  flightNumber,
  from,
  to,
  departDate,
  returnDate,
  cabinClass = 'ECONOMY',
  baseFareUSD = 200,
  passengers = { adults: 1, children: 0, infants: 0 },
  selectedBaggage = [],
  selectedMeals = [],
  promoCode = ''
}) => {
  const adults = Math.max(1, Number(passengers.adults) || 1);
  const children = Math.max(0, Number(passengers.children) || 0);
  const infants = Math.max(0, Number(passengers.infants) || 0);

  // Authoritative base fare resolution
  const authoritativeBaseUSD = resolveAuthoritativeBaseFare(
    'flight',
    { from, to, itemTitle, flightNumber },
    baseFareUSD
  );

  // Cabin multiplier
  let cabinMultiplier = 1;
  if (cabinClass === 'PREMIUM_ECONOMY') cabinMultiplier = 1.35;
  else if (cabinClass === 'BUSINESS') cabinMultiplier = 2.2;
  else if (cabinClass === 'FIRST') cabinMultiplier = 3.5;

  const adjustedBasePerAdult = authoritativeBaseUSD * cabinMultiplier;
  const adultBaseTotal = adjustedBasePerAdult * adults;
  const childBaseTotal = adjustedBasePerAdult * 0.75 * children;
  const infantBaseTotal = adjustedBasePerAdult * 0.10 * infants;
  const rawBaseFareUSD = adultBaseTotal + childBaseTotal + infantBaseTotal;

  // Roundtrip multiplier if return date provided
  const isRoundTrip = Boolean(returnDate && returnDate !== departDate);
  const tripMultiplier = isRoundTrip ? 1.85 : 1.0;
  const baseFareUSDTotal = Math.round(rawBaseFareUSD * tripMultiplier);

  // Add-ons / Ancillaries
  let baggageTotalUSD = 0;
  if (Array.isArray(selectedBaggage)) {
    baggageTotalUSD = selectedBaggage.reduce((sum, item) => sum + (Number(item.priceUSD) || Number(item.price) || 0), 0);
  }

  let mealTotalUSD = 0;
  if (Array.isArray(selectedMeals)) {
    mealTotalUSD = selectedMeals.reduce((sum, item) => sum + (Number(item.priceUSD) || Number(item.price) || 0), 0);
  }

  const ancillariesUSD = baggageTotalUSD + mealTotalUSD;

  // Taxes & Government Airport Surcharges (12% on Economy, 18% on Business/First)
  const taxRate = ['BUSINESS', 'FIRST'].includes(cabinClass) ? 0.18 : 0.12;
  const taxesAndGstUSD = Math.round(baseFareUSDTotal * taxRate);

  // Promo discount verification
  let discountUSD = 0;
  const cleanPromo = (promoCode || '').trim().toUpperCase();
  if (cleanPromo === 'WELCOME10') {
    discountUSD = Math.round(baseFareUSDTotal * 0.10);
  } else if (cleanPromo === 'FIRST50' || cleanPromo === 'STORY2026') {
    discountUSD = Math.round(baseFareUSDTotal * 0.15);
  }

  const totalUSD = Math.max(1, baseFareUSDTotal + taxesAndGstUSD + ancillariesUSD - discountUSD);
  const totalINR = Math.round(totalUSD * USD_TO_INR_RATE);

  return {
    serviceType: 'flight',
    itemTitle: itemTitle || `Flight ${flightNumber || ''} (${from} ➔ ${to})`,
    travelDetails: {
      flightNumber,
      from,
      to,
      departDate,
      returnDate: isRoundTrip ? returnDate : null,
      isRoundTrip,
      cabinClass,
      passengers: { adults, children, infants },
      totalTravelers: adults + children + infants,
      selectedBaggage,
      selectedMeals,
    },
    currency: 'INR',
    amountINR: totalINR,
    amountUSD: totalUSD,
    fareBreakdown: {
      baseFareUSD: baseFareUSDTotal,
      taxesAndGstUSD,
      ancillariesUSD,
      discountUSD,
      totalUSD,
      baseFareINR: Math.round(baseFareUSDTotal * USD_TO_INR_RATE),
      taxesAndGstINR: Math.round(taxesAndGstUSD * USD_TO_INR_RATE),
      ancillariesINR: Math.round(ancillariesUSD * USD_TO_INR_RATE),
      discountINR: Math.round(discountUSD * USD_TO_INR_RATE),
      convenienceFeeINR: 0,
      finalTotalINR: totalINR,
    },
  };
};

/**
 * Calculate hotel quote server-side with baseline protection
 */
export const calculateHotelQuote = ({
  itemTitle,
  hotelId,
  roomName,
  checkIn,
  checkOut,
  guests = 2,
  roomsCount = 1,
  ratePerNightUSD = 120,
  promoCode = ''
}) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const timeDiff = checkOutDate - checkInDate;
  const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) || 1);

  const parsedRooms = Math.max(1, Number(roomsCount) || 1);
  const baseRate = resolveAuthoritativeBaseFare('hotel', { hotelId, roomName }, ratePerNightUSD);
  const rawBaseUSD = baseRate * nights * parsedRooms;

  // Indian Hospitality GST slab:
  // <= ₹7,500/night (~$86) = 12% GST, > ₹7,500/night = 18% GST
  const perNightINR = baseRate * USD_TO_INR_RATE;
  const gstRate = perNightINR > 7500 ? 0.18 : 0.12;
  const taxesAndGstUSD = Math.round(rawBaseUSD * gstRate);
  const propertyFeeUSD = Math.round(rawBaseUSD * 0.04); // 4% service & maintenance

  let discountUSD = 0;
  const cleanPromo = (promoCode || '').trim().toUpperCase();
  if (cleanPromo === 'WELCOME10') {
    discountUSD = Math.round(rawBaseUSD * 0.10);
  } else if (cleanPromo === 'STORY2026' || cleanPromo === 'FIRST50') {
    discountUSD = Math.round(rawBaseUSD * 0.15);
  }

  const totalUSD = Math.max(1, rawBaseUSD + taxesAndGstUSD + propertyFeeUSD - discountUSD);
  const totalINR = Math.round(totalUSD * USD_TO_INR_RATE);

  return {
    serviceType: 'hotel',
    itemTitle: itemTitle || `${roomName || 'Deluxe Room'} - Verified Hotel`,
    travelDetails: {
      hotelId,
      roomName,
      checkIn,
      checkOut,
      nights,
      roomsCount: parsedRooms,
      guests: Number(guests) || 2,
    },
    currency: 'INR',
    amountINR: totalINR,
    amountUSD: totalUSD,
    fareBreakdown: {
      baseFareUSD: rawBaseUSD,
      taxesAndGstUSD,
      ancillariesUSD: propertyFeeUSD,
      discountUSD,
      totalUSD,
      baseFareINR: Math.round(rawBaseUSD * USD_TO_INR_RATE),
      taxesAndGstINR: Math.round(taxesAndGstUSD * USD_TO_INR_RATE),
      propertyFeeINR: Math.round(propertyFeeUSD * USD_TO_INR_RATE),
      discountINR: Math.round(discountUSD * USD_TO_INR_RATE),
      convenienceFeeINR: 0,
      finalTotalINR: totalINR,
    },
  };
};

/**
 * Generic partner quote (Buses, Cabs, Homestays, Tours)
 */
export const calculatePartnerQuote = ({
  serviceType = 'tour',
  itemTitle,
  provider = 'TravelEase Partner Network',
  basePriceUSD = 50,
  quantity = 1,
  details = {},
  promoCode = ''
}) => {
  const qty = Math.max(1, Number(quantity) || 1);
  const baseUSD = resolveAuthoritativeBaseFare(serviceType, { provider, ...details }, basePriceUSD) * qty;
  const taxesUSD = Math.round(baseUSD * 0.12);

  let discountUSD = 0;
  const cleanPromo = (promoCode || '').trim().toUpperCase();
  if (cleanPromo === 'WELCOME10') discountUSD = Math.round(baseUSD * 0.10);
  else if (cleanPromo === 'STORY2026') discountUSD = Math.round(baseUSD * 0.15);

  const totalUSD = Math.max(1, baseUSD + taxesUSD - discountUSD);
  const totalINR = Math.round(totalUSD * USD_TO_INR_RATE);

  return {
    serviceType,
    provider,
    itemTitle: itemTitle || `TravelEase Verified ${serviceType.toUpperCase()}`,
    travelDetails: {
      ...details,
      quantity: qty,
    },
    currency: 'INR',
    amountINR: totalINR,
    amountUSD: totalUSD,
    fareBreakdown: {
      baseFareUSD: baseUSD,
      taxesAndGstUSD: taxesUSD,
      ancillariesUSD: 0,
      discountUSD,
      totalUSD,
      baseFareINR: Math.round(baseUSD * USD_TO_INR_RATE),
      taxesAndGstINR: Math.round(taxesUSD * USD_TO_INR_RATE),
      discountINR: Math.round(discountUSD * USD_TO_INR_RATE),
      convenienceFeeINR: 0,
      finalTotalINR: totalINR,
    },
  };
};

/**
 * Issues a cryptographically signed quote token
 */
export const createSignedQuote = (quoteRequest) => {
  const quoteId = generateQuoteId('TEQ');
  const now = Date.now();
  const expiresAt = now + QUOTE_TTL_MS;

  let computed;
  if (quoteRequest.serviceType === 'flight') {
    computed = calculateFlightQuote(quoteRequest);
  } else if (quoteRequest.serviceType === 'hotel') {
    computed = calculateHotelQuote(quoteRequest);
  } else {
    computed = calculatePartnerQuote(quoteRequest);
  }

  const payloadToSign = {
    quoteId,
    serviceType: computed.serviceType,
    itemTitle: computed.itemTitle,
    travelDetails: computed.travelDetails,
    currency: computed.currency,
    amountINR: computed.amountINR,
    amountUSD: computed.amountUSD,
    fareBreakdown: computed.fareBreakdown,
    createdAt: now,
    expiresAt,
  };

  const signature = signPayload(payloadToSign);
  const quoteToken = Buffer.from(JSON.stringify({ ...payloadToSign, signature })).toString('base64url');

  return {
    quoteId,
    quoteToken,
    expiresAt,
    expiresInSeconds: Math.round(QUOTE_TTL_MS / 1000),
    quote: payloadToSign,
  };
};

/**
 * Validates and decodes quoteToken
 */
export const verifyQuoteToken = (quoteToken) => {
  if (!quoteToken) {
    return { valid: false, reason: 'Missing quote token.' };
  }

  try {
    const rawJson = Buffer.from(quoteToken, 'base64url').toString('utf-8');
    const parsed = JSON.parse(rawJson);
    const { signature, ...payload } = parsed;

    if (!signature) {
      return { valid: false, reason: 'Quote token is unsigned.' };
    }

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return { valid: false, reason: 'Quote token has expired. Fares have updated.' };
    }

    // Check signature with timing-safe comparison guarded against length mismatch
    const expectedSig = signPayload(payload);
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.byteLength !== expectedBuf.byteLength || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false, reason: 'Quote signature is invalid or tampered.' };
    }

    return { valid: true, quote: payload };
  } catch (err) {
    return { valid: false, reason: 'Malformed quote token.' };
  }
};
