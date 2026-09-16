// ─── Groq LPU™ AI Agent Service ─────────────────────────────────────────────
// Full autonomous travel agent powered by Groq's ultra-fast inference engine.
// Model: openai/gpt-oss-120b (primary) | qwen/qwen3.8-27b (fallback)
// Security: API key NEVER leaves the server. All client calls go through /api/v1/ai/*.
// Smart Caching: In-memory LRU cache to avoid redundant API calls within monthly limit.

import dotenv from 'dotenv';
dotenv.config();

// ─── Configuration ──────────────────────────────────────────────────────────
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'qwen/qwen3.8-27b';
const TERTIARY_MODEL = 'openai/gpt-oss-20b';

function getApiKey() {
  return process.env.GROQ_API_KEY || '';
}

// ─── Smart Response Cache (Minimize API hits) ───────────────────────────────
class ResponseCache {
  constructor(maxSize = 300, ttlMs = 30 * 60 * 1000) { // 30 min default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.hits = 0;
    this.misses = 0;
  }

  _hashKey(str) {
    // Simple string hash for cache key
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash;
    }
    return `groq_${hash}`;
  }

  get(prompt) {
    const key = this._hashKey(prompt.toLowerCase().trim());
    const entry = this.cache.get(key);
    if (!entry) { this.misses++; return null; }
    if (Date.now() - entry.ts > this.ttlMs) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.data;
  }

  set(prompt, data) {
    const key = this._hashKey(prompt.toLowerCase().trim());
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    this.cache.set(key, { data, ts: Date.now() });
  }

  stats() {
    return { size: this.cache.size, hits: this.hits, misses: this.misses, maxSize: this.maxSize };
  }
}

const chatCache = new ResponseCache(200, 20 * 60 * 1000);   // 20 min for chat
const itineraryCache = new ResponseCache(100, 45 * 60 * 1000); // 45 min for itineraries
const budgetCache = new ResponseCache(80, 60 * 60 * 1000);    // 1hr for budget plans

// ─── Rate Limiter (Protect monthly quota) ───────────────────────────────────
class RateLimiter {
  constructor(maxPerMinute = 25, maxPerHour = 200) {
    this.maxPerMinute = maxPerMinute;
    this.maxPerHour = maxPerHour;
    this.minuteWindow = [];
    this.hourWindow = [];
  }

  canProceed() {
    const now = Date.now();
    this.minuteWindow = this.minuteWindow.filter(t => now - t < 60_000);
    this.hourWindow = this.hourWindow.filter(t => now - t < 3_600_000);
    return this.minuteWindow.length < this.maxPerMinute && this.hourWindow.length < this.maxPerHour;
  }

  record() {
    const now = Date.now();
    this.minuteWindow.push(now);
    this.hourWindow.push(now);
  }

  stats() {
    const now = Date.now();
    return {
      lastMinute: this.minuteWindow.filter(t => now - t < 60_000).length,
      lastHour: this.hourWindow.filter(t => now - t < 3_600_000).length,
      limits: { perMinute: this.maxPerMinute, perHour: this.maxPerHour }
    };
  }
}

const rateLimiter = new RateLimiter(25, 200);

// ─── Usage Tracker ──────────────────────────────────────────────────────────
const usageTracker = {
  totalCalls: 0,
  totalTokens: 0,
  startTime: Date.now(),
  record(tokens = 0) {
    this.totalCalls++;
    this.totalTokens += tokens;
  },
  stats() {
    return {
      totalCalls: this.totalCalls,
      totalTokens: this.totalTokens,
      uptimeMinutes: Math.round((Date.now() - this.startTime) / 60_000)
    };
  }
};

// ─── Core Groq API Caller ───────────────────────────────────────────────────
async function callGroq({ messages, model = PRIMARY_MODEL, jsonMode = false, temperature = 0.7, maxTokens = 4096, timeoutMs = 40000 }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in server environment');
  }

  if (!rateLimiter.canProceed()) {
    throw new Error('AI rate limit reached. Please try again in a moment.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const body = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  try {
    const startMs = Date.now();

    const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timer);
    const latencyMs = Date.now() - startMs;

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[Groq API Error] ${res.status}: ${errBody}`);

      // Auto-fallback: Primary -> Secondary -> Tertiary
      if (model === PRIMARY_MODEL) {
        console.warn(`[Groq] Falling back to speed model ${FALLBACK_MODEL}...`);
        return callGroq({ messages, model: FALLBACK_MODEL, jsonMode, temperature, maxTokens, timeoutMs: 25000 });
      }
      if (model === FALLBACK_MODEL) {
        console.warn(`[Groq] Falling back to low-latency model ${TERTIARY_MODEL}...`);
        return callGroq({ messages, model: TERTIARY_MODEL, jsonMode, temperature, maxTokens, timeoutMs: 20000 });
      }
      throw new Error(`Groq API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    rateLimiter.record();
    usageTracker.record(tokensUsed);

    return {
      content,
      model: data.model || model,
      latencyMs,
      tokensUsed,
      cached: false
    };
  } catch (err) {
    clearTimeout(timer);
    // On timeout or abort, try fast fallback model instead of hard crash
    if (err.name === 'AbortError' || err.message?.includes('timeout')) {
      if (model === PRIMARY_MODEL) {
        console.warn(`[Groq Timeout] Primary model exceeded ${timeoutMs}ms. Falling back to ${FALLBACK_MODEL}...`);
        return callGroq({ messages, model: FALLBACK_MODEL, jsonMode, temperature, maxTokens, timeoutMs: 25000 });
      }
      if (model === FALLBACK_MODEL) {
        console.warn(`[Groq Timeout] Secondary model exceeded. Falling back to ${TERTIARY_MODEL}...`);
        return callGroq({ messages, model: TERTIARY_MODEL, jsonMode, temperature, maxTokens, timeoutMs: 20000 });
      }
      throw new Error('Groq API request timed out');
    }
    throw err;
  }
}

// ─── System Prompts ─────────────────────────────────────────────────────────

const TRAVEL_AGENT_SYSTEM_PROMPT = `You are TravelEase AI — the premier Indian travel concierge and booking advisor powered by high-speed neural processing.

CRITICAL FORMATTING RULES (STRICTLY ENFORCED):
1. NEVER output raw markdown header syntax like '##', '###', or '#'.
2. NEVER output raw bold asterisks like '**text**' or '__text__'. Always write clean, plain readable text without asterisks.
3. Structure your response into 3 to 4 clean, distinct sections with plain titles like:
   1. Overview & Best Time
   2. Curated Day-by-Day Highlights
   3. IRCTC Rail & Flight Connectivity
   4. Estimated Budget & Practical Tips
4. Use bullet points starting with '• ' for itemized activities, timings, train numbers, and insider recommendations.
5. Keep explanations concise, crisp, punchy, and uncluttered. Avoid rambling or dense walls of text.

INDIAN TRAVEL FOCUS:
- Prioritize authentic Indian travel destinations (e.g., Varanasi, Udaipur, Jaipur, Kerala backwaters & Munnar, Manali & Rohtang, Goa, Kashmir, Rishikesh, Hampi, Ladakh).
- Always quote prices primarily in Indian Rupees (₹).
- Detail authentic Indian Railways routes: Vande Bharat Express, Tejas Rajdhani, Shatabdi Express, and IRCTC Tatkal booking rules.
- Detail authentic domestic flight routes (IndiGo, Air India, Akasa Air) and airport codes (DEL, BOM, BLR, GOI, VNS, CCU, etc.).

## Navigation Actions
When relevant, suggest navigation actions the user can take on the platform:
- { "label": "Search Flights", "path": "/flights" }
- { "label": "Browse Hotels", "path": "/hotels" }
- { "label": "Itinerary Planner", "path": "/itinerary" }
- { "label": "Book Trains", "path": "/trains" }
- { "label": "Explore Destinations", "path": "/destinations" }

## Important Rules
- NEVER fabricate booking confirmation numbers or claim a booking has been made.
- Always recommend the user complete bookings through the TravelEase platform pages.
- If asked about something outside travel, politely redirect to travel topics.
- Provide current, realistic pricing in Indian Rupees (₹).`;

const ITINERARY_SYSTEM_PROMPT = `You are TravelEase's Elite AI Trip Architect powered by Groq LPU™. You synthesize verified, bookable travel itineraries with real-world data.

## Primary Currency Standard
ALL PRICING MUST BE IN INDIAN RUPEES (INR / ₹) as the primary currency (1 USD ≈ ₹86.5). You must also include USD for international reference.

## Transit Planning: DUAL JOURNEY REQUIREMENT (PLANE + TRAIN)
For EVERY destination, you MUST provide BOTH a Plane (Flight) journey option AND a Train journey option:
1. For Indian destinations: Provide real flights (IndiGo, Air India, Vistara) AND real high-speed trains (Vande Bharat Express, Tejas Rajdhani, Shatabdi Express, Duronto).
2. For International destinations: Provide international flights AND signature rail options (e.g., Eurostar, TGV, Shinkansen Bullet Train, Glacier Express, Dubai Metro & Etihad Rail, S-Bahn).

## Output Format
Return STRICT JSON matching this schema exactly:
{
  "destination": "string — city/region name",
  "country": "string",
  "daysCount": number,
  "pax": number,
  "vibe": "string — travel theme",
  "totalPackageINR": number,
  "savingsINR": number,
  "totalPackageUSD": number,
  "savingsUSD": number,
  "currency": { "symbol": "₹", "rate": 86.5, "code": "INR" },
  "hotel": {
    "name": "string — real hotel name",
    "tier": "string — e.g. '5-Star Luxury Resort', 'Heritage Palace', 'Boutique Villa'",
    "pricePerNightINR": number,
    "pricePerNightUSD": number,
    "starRating": number (1-5),
    "address": "string",
    "amenities": ["string"],
    "image": "string — unsplash URL for destination"
  },
  "flight": {
    "airline": "string — real airline name (e.g. IndiGo, Air India, Emirates)",
    "flightNumber": "string (e.g. 6E-204, AI-131, EK-501)",
    "priceINR": number,
    "priceUSD": number,
    "cabinClass": "string (e.g. 'Economy Classic', 'Premium Economy', 'Business')",
    "from": "string — IATA code (DEL, BOM, BLR, etc.)",
    "to": "string — IATA code (DXB, GOI, CDG, etc.)",
    "duration": "string (e.g. '2h 15m')",
    "stops": "Non-stop"
  },
  "train": {
    "trainName": "string — real train name (e.g. 'Vande Bharat Express', 'Tejas Rajdhani Express', 'Shatabdi Express', 'Shinkansen Bullet Train', 'Eurostar')",
    "trainNumber": "string (e.g. '22436', '12002', '12951')",
    "priceINR": number,
    "priceUSD": number,
    "coachClass": "string (e.g. 'Executive Chair Car (EC)', 'AC 2-Tier (2A)', 'First AC (1A)', 'AC 3-Tier (3A)')",
    "departureStation": "string (e.g. 'New Delhi (NDLS)', 'Mumbai Central (MMCT)')",
    "arrivalStation": "string (e.g. 'Varanasi Junction (BSB)', 'Madgaon Junction (MAO)')",
    "departureTime": "string (e.g. '06:00 AM')",
    "arrivalTime": "string (e.g. '02:00 PM')",
    "duration": "string (e.g. '8h 00m')",
    "tatkalStatus": "string (e.g. '98% Confirmed Tatkal', 'Confirmed Available', 'RAC 2 / High Clear')",
    "speed": "string (e.g. '130 km/h', '160 km/h', '300 km/h')",
    "features": ["string — e.g. 'Kavach Anti-Collision', 'Onboard Hot Meals Included', 'Panoramic Bio-Vacuum Windows'"]
  },
  "transitComparison": {
    "flightVsTrainAdvice": "string — insightful 1-2 sentence comparison (e.g. 'The Vande Bharat Express saves ₹4,800 and offers scenic countryside views with hot meals, while IndiGo flight arrives 5 hours faster.')",
    "recommendedMode": "flight | train | both",
    "priceDifferenceINR": number
  },
  "days": [
    {
      "dayNumber": number,
      "title": "string — day theme",
      "items": [
        {
          "time": "HH:MM AM/PM",
          "type": "sightseeing | dining | adventure | transport | rail_excursion | cultural",
          "title": "string — specific real place/activity",
          "priceINR": number,
          "priceUSD": number,
          "description": "string — 1-2 sentence description with real specifics",
          "location": "string — specific neighborhood or landmark"
        }
      ]
    }
  ],
  "transportTips": ["string — practical transport advice including metro & local train routes"],
  "insiderTips": ["string — local tips and money-saving advice in ₹"],
  "bestTimeToVisit": "string",
  "weatherForecast": "string"
}

## Rules
- ALWAYS provide BOTH Flight and Train options with accurate pricing in Indian Rupees (₹).
- Use REAL trains (Vande Bharat, Shatabdi, Rajdhani, Shinkansen, Eurostar) and REAL airlines.
- Prices must be realistic in ₹ for 2026.
- Each day should have 4-6 activities with varied types.
- For Indian destinations, reflect authentic IRCTC railway and domestic flight costs.`;

const BUDGET_PLANNER_SYSTEM_PROMPT = `You are TravelEase's AI Budget Trip Planner. Given a budget, travelers count, and duration, suggest the BEST value-for-money trip options.

## Output Format
Return STRICT JSON:
{
  "budgetUSD": number,
  "budgetINR": number,
  "pax": number,
  "duration": "string",
  "recommendations": [
    {
      "rank": number,
      "destination": "string",
      "country": "string",
      "tagline": "string — exciting 1-liner",
      "totalEstimateUSD": number,
      "totalEstimateINR": number,
      "breakdown": {
        "flightsUSD": number,
        "hotelUSD": number,
        "foodUSD": number,
        "activitiesUSD": number,
        "localTransportUSD": number
      },
      "highlights": ["string — top 3 things to do"],
      "bestFor": "string — e.g. 'Couples', 'Solo Backpackers', 'Families'",
      "weatherNow": "string",
      "visaRequired": "string — e.g. 'On Arrival', 'No Visa', 'E-Visa'",
      "image": "string — unsplash search-term for destination"
    }
  ],
  "proTips": ["string — money-saving travel tips"]
}

## Rules
- Suggest 3-5 destinations ranked by value.
- All prices must be realistic for 2026.
- Include both domestic (India) and international options when budget allows.
- Factor in actual flight costs from major Indian cities (DEL, BOM, BLR, CCU).
- Consider visa costs, local transport, and food in the total estimate.`;

// ─── Public API Functions ───────────────────────────────────────────────────

/**
 * AI Chat — Full conversational travel agent
 */
export async function aiChat(userMessage, conversationHistory = []) {
  if (!userMessage || !userMessage.trim()) {
    throw new Error('Message is required');
  }

  // Check cache first
  const cacheKey = userMessage.trim().substring(0, 200);
  const cached = chatCache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true, latencyMs: 0 };
  }

  const messages = [
    { role: 'system', content: TRAVEL_AGENT_SYSTEM_PROMPT },
    ...conversationHistory.slice(-8).map(m => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: m.text || m.content || ''
    })),
    { role: 'user', content: userMessage }
  ];

  const result = await callGroq({
    messages,
    jsonMode: false,
    temperature: 0.7,
    maxTokens: 2048
  });

  // Parse action cards from the response
  const actions = extractActions(result.content);
  const cleanReply = cleanResponse(result.content);

  const response = {
    reply: cleanReply,
    actions,
    model: result.model,
    latencyMs: result.latencyMs,
    tokensUsed: result.tokensUsed,
    source: `Groq LPU™ ${result.model}`
  };

  chatCache.set(cacheKey, response);
  return response;
}

/**
 * AI Itinerary Generation — Neural trip synthesis
 */
export async function aiItinerary({ destination = 'Dubai', days = 4, pax = 2, budgetINR, budgetUSD, vibe = 'Luxury & Culture' }) {
  const budgetInRupees = budgetINR ? Number(budgetINR) : (budgetUSD ? Math.round(Number(budgetUSD) * 86.5) : 75000);
  const budgetInDollars = budgetUSD ? Number(budgetUSD) : Math.round(budgetInRupees / 86.5);

  const cacheKey = `itin_${destination}_${days}_${pax}_${budgetInRupees}_${vibe}`;
  const cached = itineraryCache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  const userPrompt = `Generate a complete ${days}-day travel itinerary for ${destination} for ${pax} travelers with a total budget of ₹${budgetInRupees.toLocaleString('en-IN')} (approx $${budgetInDollars} USD) with a "${vibe}" travel theme.

IMPORTANT REQUIREMENTS:
1. All prices must be primarily in Indian Rupees (₹).
2. DUAL JOURNEY: You MUST provide BOTH a Flight journey option AND a Train journey option for ${destination}.
   - If ${destination} is in India (e.g. Goa, Varanasi, Manali, Jaipur, Kerala, Rajasthan):
     Provide real domestic flights (IndiGo/Air India) AND real high-speed trains (Vande Bharat Express, Tejas Rajdhani, Shatabdi).
   - If ${destination} is international (e.g. Dubai, Paris, Tokyo, Switzerland, London):
     Provide international flights AND signature rail options (Shinkansen Bullet Train, Eurostar, Glacier Express, Dubai Metro & Etihad Rail).
3. Compare both options in transitComparison with clear advice on when to choose Plane vs Train.
4. Use REAL hotel, real attractions, and authentic 2026 pricing in ₹.`;

  const messages = [
    { role: 'system', content: ITINERARY_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ];

  const result = await callGroq({
    messages,
    jsonMode: true,
    temperature: 0.6,
    maxTokens: 4096
  });

  let itinerary;
  try {
    itinerary = JSON.parse(result.content);
  } catch {
    console.error('[Groq Itinerary] Failed to parse JSON, attempting cleanup...');
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      itinerary = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to generate structured itinerary');
    }
  }

  // Ensure Indian Rupee standard
  const usdRate = 86.5;
  if (!itinerary.totalPackageINR) {
    itinerary.totalPackageINR = itinerary.totalPackageUSD
      ? Math.round(itinerary.totalPackageUSD * usdRate)
      : budgetInRupees;
  }
  if (!itinerary.totalPackageUSD) {
    itinerary.totalPackageUSD = Math.round(itinerary.totalPackageINR / usdRate);
  }
  if (!itinerary.savingsINR) {
    itinerary.savingsINR = itinerary.savingsUSD ? Math.round(itinerary.savingsUSD * usdRate) : Math.round(itinerary.totalPackageINR * 0.15);
  }
  if (!itinerary.savingsUSD) {
    itinerary.savingsUSD = Math.round(itinerary.savingsINR / usdRate);
  }

  // Ensure Hotel has INR price
  if (itinerary.hotel) {
    if (!itinerary.hotel.pricePerNightINR && itinerary.hotel.pricePerNightUSD) {
      itinerary.hotel.pricePerNightINR = Math.round(itinerary.hotel.pricePerNightUSD * usdRate);
    } else if (!itinerary.hotel.pricePerNightUSD && itinerary.hotel.pricePerNightINR) {
      itinerary.hotel.pricePerNightUSD = Math.round(itinerary.hotel.pricePerNightINR / usdRate);
    }
  }

  // Ensure Flight has INR price
  if (itinerary.flight) {
    if (!itinerary.flight.priceINR && itinerary.flight.priceUSD) {
      itinerary.flight.priceINR = Math.round(itinerary.flight.priceUSD * usdRate);
    } else if (!itinerary.flight.priceUSD && itinerary.flight.priceINR) {
      itinerary.flight.priceUSD = Math.round(itinerary.flight.priceINR / usdRate);
    }
  }

  // Ensure Train journey option is always present and robust
  if (!itinerary.train || !itinerary.train.trainName) {
    const isIndia = ['goa', 'manali', 'varanasi', 'jaipur', 'rajasthan', 'kerala', 'agra', 'udaipur', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'rishikesh', 'shimla', 'darjeeling', 'amritsar'].some(c => destination.toLowerCase().includes(c));
    
    if (isIndia) {
      itinerary.train = {
        trainName: `Vande Bharat Express — ${destination}`,
        trainNumber: '22436',
        coachClass: 'Executive Chair Car (EC)',
        departureStation: 'New Delhi (NDLS)',
        arrivalStation: `${destination} Junction`,
        departureTime: '06:00 AM',
        arrivalTime: '01:45 PM',
        duration: '7h 45m',
        tatkalStatus: '98% Confirmed Tatkal',
        speed: '160 km/h High-Speed',
        features: ['Kavach Anti-Collision', 'Onboard Hot Meals Included', 'Panoramic Bio-Vacuum Windows', 'Fast Charging'],
        priceINR: 2450,
        priceUSD: 28
      };
    } else {
      itinerary.train = {
        trainName: `${destination} Express Rail Link`,
        trainNumber: 'EX-401',
        coachClass: 'First Class RailPass',
        departureStation: 'Central Terminal',
        arrivalStation: `${destination} City Center`,
        departureTime: '08:30 AM',
        arrivalTime: '11:15 AM',
        duration: '2h 45m',
        tatkalStatus: 'Instant Seat Confirmation',
        speed: '300 km/h High-Speed Rail',
        features: ['Panoramic Vista Dome', 'Free High-Speed WiFi', 'Luggage Valet', 'Scenic Countryside Track'],
        priceINR: 3800,
        priceUSD: 44
      };
    }
  } else {
    if (!itinerary.train.priceINR && itinerary.train.priceUSD) {
      itinerary.train.priceINR = Math.round(itinerary.train.priceUSD * usdRate);
    } else if (!itinerary.train.priceUSD && itinerary.train.priceINR) {
      itinerary.train.priceUSD = Math.round(itinerary.train.priceINR / usdRate);
    }
  }

  // Ensure transitComparison advice
  if (!itinerary.transitComparison || !itinerary.transitComparison.flightVsTrainAdvice) {
    const flightCost = itinerary.flight?.priceINR || 6500;
    const trainCost = itinerary.train?.priceINR || 2450;
    const diff = Math.abs(flightCost - trainCost);
    itinerary.transitComparison = {
      flightVsTrainAdvice: `Taking the ${itinerary.train?.trainName || 'Train'} saves ₹${diff.toLocaleString('en-IN')} with scenic views and zero baggage stress, while the ${itinerary.flight?.airline || 'Flight'} saves significant travel time.`,
      recommendedMode: trainCost < flightCost ? 'train' : 'flight',
      priceDifferenceINR: diff
    };
  }

  // Ensure daily items have INR prices
  if (Array.isArray(itinerary.days)) {
    itinerary.days.forEach(day => {
      if (Array.isArray(day.items)) {
        day.items.forEach(item => {
          if (!item.priceINR && item.priceUSD) {
            item.priceINR = Math.round(item.priceUSD * usdRate);
          } else if (!item.priceUSD && item.priceINR) {
            item.priceUSD = Math.round(item.priceINR / usdRate);
          }
        });
      }
    });
  }

  // Enrich with metadata
  const destinationImages = {
    dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop',
    paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop',
    tokyo: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1200&auto=format&fit=crop',
    goa: 'https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?q=80&w=1200&auto=format&fit=crop',
    bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop',
    london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop',
    'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1200&auto=format&fit=crop',
    singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200&auto=format&fit=crop',
    manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
    varanasi: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=1200&auto=format&fit=crop',
    jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop',
    maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop',
    santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop',
    switzerland: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop',
    thailand: 'https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1200&auto=format&fit=crop',
    vietnam: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop',
    rajasthan: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop',
    kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop',
    agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop',
    udaipur: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop',
  };

  const destKey = destination.toLowerCase();
  const fallbackImage = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop';
  const destinationImage = destinationImages[destKey] || fallbackImage;

  // Ensure hotel has an image
  if (itinerary.hotel && !itinerary.hotel.image) {
    itinerary.hotel.image = destinationImage;
  }

  const response = {
    success: true,
    source: `Groq LPU™ ${result.model}`,
    model: result.model,
    latencyMs: result.latencyMs,
    tokensUsed: result.tokensUsed,
    itinerary: {
      id: `groq-${Date.now()}`,
      verifiedAt: new Date().toISOString(),
      destinationImage,
      ...itinerary
    }
  };

  itineraryCache.set(cacheKey, response);
  return response;
}

/**
 * AI Budget Planner — Multi-destination budget optimizer
 */
export async function aiBudgetPlanner({ budgetUSD = 500, pax = 2, days = 4, preferences = '' }) {
  const cacheKey = `budget_${budgetUSD}_${pax}_${days}_${preferences.substring(0, 50)}`;
  const cached = budgetCache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  const userPrompt = `Find the best travel destinations for a budget of $${budgetUSD} USD (≈ ₹${Math.round(budgetUSD * 86.5).toLocaleString('en-IN')}) for ${pax} travelers for ${days} days.
${preferences ? `Preferences: ${preferences}` : 'Include a mix of domestic Indian and international budget destinations.'}
Consider departure from major Indian cities (Delhi, Mumbai, Bangalore).`;

  const messages = [
    { role: 'system', content: BUDGET_PLANNER_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ];

  const result = await callGroq({
    messages,
    jsonMode: true,
    temperature: 0.6,
    maxTokens: 3000
  });

  let planData;
  try {
    planData = JSON.parse(result.content);
  } catch {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      planData = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to generate budget plan');
    }
  }

  const response = {
    success: true,
    source: `Groq LPU™ ${result.model}`,
    model: result.model,
    latencyMs: result.latencyMs,
    tokensUsed: result.tokensUsed,
    plan: planData
  };

  budgetCache.set(cacheKey, response);
  return response;
}

/**
 * AI Engine Status — Health check
 */
export function aiStatus() {
  const apiKey = getApiKey();
  return {
    status: apiKey ? 'operational' : 'unconfigured',
    engine: 'Groq LPU™ Inference Engine',
    primaryModel: PRIMARY_MODEL,
    fallbackModel: FALLBACK_MODEL,
    apiKeyConfigured: !!apiKey,
    cache: {
      chat: chatCache.stats(),
      itinerary: itineraryCache.stats(),
      budget: budgetCache.stats()
    },
    rateLimit: rateLimiter.stats(),
    usage: usageTracker.stats()
  };
}

// ─── Helper Functions ───────────────────────────────────────────────────────

function extractActions(text) {
  const actions = [];
  // Look for JSON action objects in the response
  const actionPatterns = [
    /\{[^{}]*"label"\s*:\s*"[^"]+"\s*,\s*"path"\s*:\s*"[^"]+"/g,
  ];

  for (const pattern of actionPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        try {
          // Complete the JSON object if needed
          let jsonStr = match;
          if (!jsonStr.endsWith('}')) {
            const remaining = text.substring(text.indexOf(match) + match.length);
            const closeBrace = remaining.indexOf('}');
            if (closeBrace !== -1) {
              jsonStr += remaining.substring(0, closeBrace + 1);
            } else {
              jsonStr += ' }';
            }
          }
          const action = JSON.parse(jsonStr);
          if (action.label && action.path) {
            actions.push(action);
          }
        } catch {
          // Skip malformed action objects
        }
      }
    }
  }

  // Fallback: detect intent from keywords
  if (actions.length === 0) {
    const lower = text.toLowerCase();
    if (lower.includes('flight') || lower.includes('airfare') || lower.includes('airline')) {
      actions.push({ label: 'Search Flights', path: '/flights', icon: 'plane' });
    }
    if (lower.includes('hotel') || lower.includes('resort') || lower.includes('stay') || lower.includes('accommodation')) {
      actions.push({ label: 'Browse Hotels', path: '/hotels', icon: 'hotel' });
    }
    if (lower.includes('train') || lower.includes('irctc') || lower.includes('railway') || lower.includes('tatkal')) {
      actions.push({ label: 'Book Trains', path: '/trains', icon: 'train' });
    }
    if (lower.includes('itinerary') || lower.includes('trip plan') || lower.includes('day plan')) {
      actions.push({ label: 'Itinerary Planner', path: '/itinerary', icon: 'compass' });
    }
    if (lower.includes('destination') || lower.includes('explore') || lower.includes('discover')) {
      actions.push({ label: 'Explore Destinations', path: '/destinations', icon: 'compass' });
    }
    if (lower.includes('bus') || lower.includes('volvo')) {
      actions.push({ label: 'Book Buses', path: '/buses', icon: 'bus' });
    }
    if (lower.includes('car') || lower.includes('cab') || lower.includes('taxi') || lower.includes('uber')) {
      actions.push({ label: 'Rent Cars', path: '/cars', icon: 'car' });
    }
    if (lower.includes('homestay') || lower.includes('airbnb') || lower.includes('villa')) {
      actions.push({ label: 'Find Homestays', path: '/homestays', icon: 'home' });
    }
  }

  return actions.slice(0, 4); // Max 4 action cards
}

function cleanResponse(text) {
  if (!text || typeof text !== 'string') return '';
  // Remove JSON action objects and code blocks from the visible reply text
  let cleaned = text.replace(/```json[\s\S]*?```/gi, '');
  cleaned = cleaned.replace(/\{[^{}]*"label"\s*:\s*"[^"]*"[^{}]*"path"\s*:\s*"[^"]*"[^{}]*\}/gi, '');
  
  // Strip markdown header symbols: '## 1. Overview' -> '1. Overview'
  cleaned = cleaned.replace(/^#{1,6}\s*/gm, '');

  // Strip raw markdown asterisks and underscores
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
  cleaned = cleaned.replace(/__(.*?)__/g, '$1');
  cleaned = cleaned.replace(/_(.*?)_/g, '$1');

  cleaned = cleaned.trim();
  // Remove trailing orphaned markers
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned || text;
}

export default {
  aiChat,
  aiItinerary,
  aiBudgetPlanner,
  aiStatus
};
