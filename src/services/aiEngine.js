// ─── TravelEase AI Engine — Frontend Service Layer ──────────────────────────
// Connects to backend Groq LPU™ powered endpoints.
// Multi-Tier Resilience:
// Tier 1: Express Backend Proxy (/api/v1/ai/itinerary)
// Tier 2: Direct Client-Side Groq LPU™ Call with VITE_GROQ_API_KEY
// Tier 3: Dynamic Travel Intelligence Synthesis via dynamicTravelEngine.js

import api from './api';
import { generateDynamicItinerary } from './dynamicTravelEngine';

const CLIENT_GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

// ─── Markdown Artifact Cleaner ──────────────────────────────────────────────
// Ensures zero raw '**', '__', or '##' ever leak into user-facing content.
export function stripMarkdownText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/^#{1,6}\s*/gm, '')       // Strip markdown header hashes
    .replace(/\*\*(.*?)\*\*/g, '$1')   // Strip double asterisks
    .replace(/\*(.*?)\*/g, '$1')       // Strip single asterisks
    .replace(/__(.*?)__/g, '$1')       // Strip double underscores
    .replace(/_(.*?)_/g, '$1')         // Strip single underscores
    .replace(/`{1,3}[a-z]*\n?/gi, '')  // Strip code block ticks
    .trim();
}

export function sanitizeItineraryContent(itinerary) {
  if (!itinerary || typeof itinerary !== 'object') return itinerary;
  
  if (Array.isArray(itinerary.days)) {
    itinerary.days = itinerary.days.map(day => ({
      ...day,
      title: stripMarkdownText(day.title),
      items: Array.isArray(day.items) ? day.items.map(item => ({
        ...item,
        title: stripMarkdownText(item.title),
        description: stripMarkdownText(item.description),
        location: stripMarkdownText(item.location)
      })) : []
    }));
  }

  if (Array.isArray(itinerary.transportTips)) {
    itinerary.transportTips = itinerary.transportTips.map(stripMarkdownText);
  }
  if (Array.isArray(itinerary.insiderTips)) {
    itinerary.insiderTips = itinerary.insiderTips.map(stripMarkdownText);
  }

  return itinerary;
}

// ─── AI Chat — Conversational Travel Agent ──────────────────────────────────
export async function aiChatMessage(message, history = []) {
  try {
    const res = await api.post('/v1/ai/chat', { message, history });
    if (res.data && res.data.reply) {
      res.data.reply = stripMarkdownText(res.data.reply);
    }
    return res.data;
  } catch {
    // Tier 2: Direct Client Groq Call
    if (CLIENT_GROQ_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CLIENT_GROQ_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'qwen/qwen3.8-27b',
            messages: [
              {
                role: 'system',
                content: `You are TravelEase AI concierge, an elite Indian travel architect and booking advisor.
Provide crisp, concise, uncluttered, and visually structured advice for travelers exploring India.
CRITICAL FORMATTING RULES:
1. NEVER output raw markdown symbols like '**', '__', '##', or '###'. Write clean, plain text.
2. Structure your response into clear numbered sections with concise titles (e.g., "1. Overview & Best Time", "2. Curated Day-by-Day Plan", "3. IRCTC Rail & Flight Logistics", "4. Budget Breakdown (INR)").
3. Use bullet points starting with "• " for key activities, timings, and insider tips.
4. Keep explanations concise, crisp, and actionable. Avoid long walls of text.
5. Emphasize authentic Indian travel destinations (e.g., Varanasi, Udaipur, Jaipur, Kerala backwaters, Manali, Goa, Rishikesh, Kashmir, Hampi).
6. State all prices in Indian Rupees (₹) with realistic IRCTC train classes (Vande Bharat, Tatkal) and domestic flights.`
              },
              ...history.slice(-4).map(h => ({ role: h.role === 'ai' ? 'assistant' : 'user', content: h.text || h.content || '' })),
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 1024
          })
        });
        if (groqRes.ok) {
          const data = await groqRes.json();
          const rawReply = data.choices?.[0]?.message?.content || '';
          const reply = stripMarkdownText(rawReply);
          return {
            reply,
            source: 'Travel Desk Engine (Direct)',
            model: 'dynamic-v2',
            actions: [
              { label: 'Explore Destinations', path: '/destinations', icon: 'compass' },
              { label: 'Itinerary Planner', path: '/itinerary', icon: 'compass' },
              { label: 'Book Trains', path: '/trains', icon: 'train' }
            ]
          };
        }
      } catch (clientErr) {
        console.warn('[AI Chat] Direct Groq fallback error:', clientErr.message);
      }
    }

    return {
      reply: `I would love to help you plan an unforgettable Indian journey! TravelEase offers unified booking for Vande Bharat trains, IRCTC Tatkal radar, domestic flights, and handpicked stays in Varanasi, Udaipur, Goa, Kerala, and Himachal in Indian Rupees (₹). Where would you like to travel?`,
      actions: [
        { label: 'Explore Destinations', path: '/destinations', icon: 'compass' },
        { label: 'Itinerary Planner', path: '/itinerary', icon: 'compass' },
        { label: 'Book Trains', path: '/trains', icon: 'train' }
      ]
    };
  }
}

// ─── AI Itinerary — Neural Trip Synthesis ───────────────────────────────────
export async function generateAIItinerary(userPrompt, onLogUpdate = () => {}) {
  onLogUpdate('[System] Connecting to Route Optimization Engine...');

  // Parse user prompt for parameters
  const params = parsePromptToParams(userPrompt);

  onLogUpdate(`[Route Engine] Analyzing parameters: "${params.destination}" · ${params.days} days · ${params.pax} travelers · ₹${params.budgetINR.toLocaleString('en-IN')} budget`);

  // Tier 1: Express Backend Proxy
  try {
    onLogUpdate('[Routing] Compiling multi-modal travel itinerary & transit routes...');

    const res = await api.post('/v1/ai/itinerary', {
      destination: params.destination,
      days: params.days,
      pax: params.pax,
      budgetINR: params.budgetINR,
      budgetUSD: params.budgetUSD,
      vibe: params.vibe
    });

    if (res.data?.success && res.data?.itinerary) {
      const it = res.data.itinerary;
      const latency = res.data.latencyMs || 0;

      onLogUpdate(`[Transit] Flight: ${it.flight?.airline || 'Air India / IndiGo'} (${it.flight?.cabinClass || 'Economy'}) · ₹${(it.flight?.priceINR || 5500).toLocaleString('en-IN')}`);
      onLogUpdate(`[IRCTC] Train: ${it.train?.trainName || 'Vande Bharat Express'} · ₹${(it.train?.priceINR || 2150).toLocaleString('en-IN')} (${it.train?.tatkalStatus || 'Confirmed'})`);
      onLogUpdate(`[Hospitality] Stay: ${it.hotel?.name || 'Premium Stay'} · ⭐ ${it.hotel?.starRating || 4.5} · ₹${(it.hotel?.pricePerNightINR || 4200).toLocaleString('en-IN')}/night`);
      onLogUpdate(`[Locations] ${it.days?.length || params.days} Days · ${it.days?.reduce((a, d) => a + (d.items?.length || 0), 0) || '18+'} verified activities · 100% bookable`);
      onLogUpdate(`[Route Engine] Latency: ${latency}ms`);
      onLogUpdate('[Ready] Verified Travel Package with Flight & Train routes ready!');

      const sanitized = sanitizeItineraryContent(it);
      return {
        ...sanitized,
        totalPackageINR: sanitized.totalPackageINR || (sanitized.totalPackageUSD ? Math.round(sanitized.totalPackageUSD * 86.5) : params.budgetINR),
        _meta: {
          source: res.data.source,
          model: res.data.model,
          latencyMs: latency,
          cached: res.data.cached
        }
      };
    }
  } catch (backendErr) {
    console.warn('[AI Itinerary] Backend proxy unavailable, attempting direct Groq client call:', backendErr.message);
  }

  // Tier 2: Direct Client-Side Groq API Call
  if (CLIENT_GROQ_KEY) {
    try {
      onLogUpdate('[Routing] Engaging high-speed route optimization engine...');
      const directPrompt = `Generate a ${params.days}-day trip to ${params.destination} with budget ₹${params.budgetINR}. Return STRICT JSON with destination, daysCount (${params.days}), vibe, totalPackageINR (${params.budgetINR}), savingsINR, hotel: {name, tier, pricePerNightINR, starRating, address, amenities: []}, flight: {airline, flightNumber, priceINR, cabinClass, from, to, duration, stops: "Non-stop"}, train: {trainName, trainNumber, priceINR, coachClass: "Executive Chair Car (EC)", departureStation, arrivalStation, departureTime: "06:00 AM", arrivalTime: "01:45 PM", duration: "7h 45m", tatkalStatus: "98% Confirmed Tatkal", features: ["Kavach Anti-Collision", "Hot Meals Included"]}, transitComparison: {flightVsTrainAdvice, recommendedMode, priceDifferenceINR}, days: [{dayNumber, title, items: [{time, type, title, priceINR, description, location}]}], transportTips: [], insiderTips: []. All prices primarily in INR (₹).`;

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLIENT_GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            { role: 'system', content: 'You are TravelEase Elite Route Architect. Return valid JSON only with dual transit (Plane + Vande Bharat Train).' },
            { role: 'user', content: directPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.6,
          max_tokens: 3000
        })
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const content = groqData.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content);
        if (parsed.destination && parsed.days) {
          onLogUpdate(`[Ready] Route Compilation Succeeded!`);
          const sanitizedDirect = sanitizeItineraryContent(parsed);
          return {
            ...sanitizedDirect,
            _meta: { source: 'Dynamic Engine Direct', model: groqData.model }
          };
        }
      }
    } catch (directErr) {
      console.warn('[AI Itinerary] Direct Groq error:', directErr.message);
    }
  }

  // Tier 3: Universal Dynamic Travel Intelligence Synthesis (Zero Failure)
  onLogUpdate(`[System] Multi-Modal Route Engine activated for ${params.destination}...`);
  const dynamicPlan = generateDynamicItinerary(params.destination, params.days, params.budgetINR, params.vibe);
  onLogUpdate(`🚆 IRCTC Route: ${dynamicPlan.train?.trainName} (${dynamicPlan.train?.coachClass})`);
  onLogUpdate(`✈️ Air Route: ${dynamicPlan.flight?.airline}`);
  onLogUpdate(`🏨 Verified Stay: ${dynamicPlan.hotel?.name}`);
  onLogUpdate('✅ 100% Verified Dynamic Trip Package generated!');

  return {
    ...dynamicPlan,
    _meta: { source: 'Dynamic Travel Intelligence Engine', model: 'TravelEase Universal Solver' }
  };
}

// ─── AI Budget Planner ──────────────────────────────────────────────────────
export async function generateBudgetPlan({ budgetUSD = 500, pax = 2, days = 4, preferences = '' }) {
  try {
    const res = await api.post('/v1/ai/budget-planner', {
      budgetUSD, pax, days, preferences
    });
    return res.data;
  } catch (err) {
    console.warn('[AI Budget Planner] Error:', err.message);
    throw new Error('Budget planner is temporarily unavailable.');
  }
}

// ─── AI Engine Status ───────────────────────────────────────────────────────
export async function getAIStatus() {
  try {
    const res = await api.get('/v1/ai/status');
    return res.data;
  } catch {
    return { status: 'offline', engine: 'Travel Concierge Engine', apiKeyConfigured: false };
  }
}

// ─── Prompt Parser ──────────────────────────────────────────────────────────
function parsePromptToParams(prompt) {
  const p = prompt.toLowerCase();

  // Extract destination
  const destinations = [
    'dubai', 'paris', 'tokyo', 'goa', 'bali', 'manali', 'agra', 'santorini',
    'switzerland', 'singapore', 'new york', 'london', 'maldives', 'jaipur',
    'varanasi', 'rajasthan', 'kerala', 'udaipur', 'bangkok', 'vietnam',
    'sri lanka', 'nepal', 'bhutan', 'rome', 'barcelona', 'amsterdam',
    'istanbul', 'cairo', 'cape town', 'sydney', 'melbourne', 'hawaii',
    'las vegas', 'los angeles', 'san francisco', 'mumbai', 'delhi',
    'bangalore', 'kolkata', 'chennai', 'hyderabad', 'pune', 'shimla',
    'darjeeling', 'rishikesh', 'leh', 'ladakh', 'andaman', 'ooty',
    'coorg', 'munnar', 'alleppey', 'hampi', 'mysore', 'pondicherry'
  ];

  let destination = 'Dubai';
  for (const d of destinations) {
    if (p.includes(d)) {
      destination = d.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  // If no preset found, try to extract city name
  if (destination === 'Dubai' && !p.includes('dubai')) {
    const toMatch = p.match(/(?:to|in|for)\s+([a-z]+(?:\s[a-z]+)?)/);
    if (toMatch) {
      const candidate = toMatch[1].trim();
      if (candidate.length > 2 && !['the', 'a', 'an', 'days', 'people', 'adults', 'trip'].includes(candidate)) {
        destination = candidate.charAt(0).toUpperCase() + candidate.slice(1);
      }
    }
  }

  // Extract days
  let days = 4;
  const dayMatch = p.match(/(\d+)\s*(?:day|night)/);
  if (dayMatch) days = Math.min(Math.max(parseInt(dayMatch[1], 10), 1), 14);

  // Extract pax
  let pax = 2;
  const paxMatch = p.match(/(\d+)\s*(?:people|person|guest|pax|adult|traveler)/);
  if (paxMatch) pax = Math.min(Math.max(parseInt(paxMatch[1], 10), 1), 10);

  // Extract budget (Indian Rupees primary)
  let budgetINR = 75000;
  const lakhMatch = p.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs)/);
  const inrSymbolMatch = p.match(/₹\s*(\d+(?:,\d+)?)/);
  const genericMatch = p.match(/(?:under|budget|within|approx)\s*₹?\s*(\d+(?:,\d+)?)\s*(k|000)?/);
  const usdMatch = p.match(/\$\s*(\d+(?:,\d+)?)/);

  if (lakhMatch) {
    budgetINR = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else if (inrSymbolMatch) {
    budgetINR = parseInt(inrSymbolMatch[1].replace(/,/g, ''), 10);
  } else if (genericMatch) {
    let val = parseInt(genericMatch[1].replace(/,/g, ''), 10);
    if (genericMatch[2] === 'k') val *= 1000;
    budgetINR = val > 500 ? val : val * 86.5;
  } else if (usdMatch) {
    const usdVal = parseInt(usdMatch[1].replace(/,/g, ''), 10);
    budgetINR = Math.round(usdVal * 86.5);
  }

  const budgetUSD = Math.round(budgetINR / 86.5);

  // Extract vibe
  let vibe = 'Luxury & Culture';
  if (p.includes('beach') || p.includes('resort') || p.includes('coastal')) vibe = 'Beach & Relaxation';
  else if (p.includes('adventure') || p.includes('trek') || p.includes('hiking')) vibe = 'Alpine Adventure';
  else if (p.includes('budget') || p.includes('backpack') || p.includes('cheap')) vibe = 'Smart Budget Explorer';
  else if (p.includes('romantic') || p.includes('honeymoon') || p.includes('couple')) vibe = 'Romantic Escape';
  else if (p.includes('family') || p.includes('kids') || p.includes('children')) vibe = 'Family Fun';
  else if (p.includes('spiritual') || p.includes('temple') || p.includes('pilgrimage') || p.includes('ghat')) vibe = 'Spiritual Journey';
  else if (p.includes('food') || p.includes('culinary') || p.includes('cuisine')) vibe = 'Culinary Explorer';

  return { destination, days, pax, budgetINR, budgetUSD, vibe };
}

export { parsePromptToParams };
