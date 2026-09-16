// ─── Universal TravelEase Cross-Service Navigation Bridge ─────────────────────
// Central single source of truth for city normalization, station/airport resolution,
// and bidirectional deep-link routing across all TravelEase services.

/**
 * Normalizes complex promotional destination titles into a clean city or territory name
 * e.g., "Varanasi Sacred Ghats" -> "Varanasi"
 *       "Taj Mahal & Agra Fort" -> "Agra"
 *       "The Emerald Backwaters" -> "Kerala"
 *       "The Golden Citadel" -> "Jaisalmer"
 *       "Roof of the World" -> "Ladakh"
 *       "Manali & Rohtang Snow Peaks" -> "Manali"
 */
export function normalizeCityName(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return 'Varanasi';

  const clean = rawInput.trim();
  const lower = clean.toLowerCase();

  // Well-known titles and cultural expedition chapters
  if (lower.includes('varanasi') || lower.includes('kashi') || lower.includes('banaras') || lower.includes('sacred threshold')) return 'Varanasi';
  if (lower.includes('taj') || lower.includes('agra')) return 'Agra';
  if (lower.includes('goa') || lower.includes('palolem') || lower.includes('panaji')) return 'Goa';
  if (lower.includes('manali') || lower.includes('rohtang') || lower.includes('solang')) return 'Manali';
  if (lower.includes('kerala') || lower.includes('alleppey') || lower.includes('munnar') || lower.includes('kumarakom') || lower.includes('emerald backwaters')) return 'Kerala';
  if (lower.includes('jaipur') || lower.includes('pink city')) return 'Jaipur';
  if (lower.includes('udaipur') || lower.includes('lake pichola')) return 'Udaipur';
  if (lower.includes('jaisalmer') || lower.includes('thar') || lower.includes('golden citadel')) return 'Jaisalmer';
  if (lower.includes('ladakh') || lower.includes('pangong') || lower.includes('leh') || lower.includes('roof of the world')) return 'Ladakh';
  if (lower.includes('ayodhya') || lower.includes('ram mandir')) return 'Ayodhya';
  if (lower.includes('kedarnath') || lower.includes('badrinath')) return 'Kedarnath';
  if (lower.includes('rishikesh') || lower.includes('haridwar')) return 'Rishikesh';
  if (lower.includes('amritsar') || lower.includes('golden temple')) return 'Amritsar';
  if (lower.includes('hampi') || lower.includes('vijayanagara')) return 'Hampi';
  if (lower.includes('andaman') || lower.includes('havelock') || lower.includes('radhanagar')) return 'Andaman';
  if (lower.includes('delhi') || lower.includes('new delhi')) return 'Delhi';
  if (lower.includes('mumbai') || lower.includes('bombay')) return 'Mumbai';
  if (lower.includes('bengaluru') || lower.includes('bangalore')) return 'Bengaluru';
  if (lower.includes('chennai') || lower.includes('madras')) return 'Chennai';
  if (lower.includes('kolkata') || lower.includes('calcutta')) return 'Kolkata';
  if (lower.includes('hyderabad')) return 'Hyderabad';
  if (lower.includes('lucknow')) return 'Lucknow';
  if (lower.includes('shimla')) return 'Shimla';
  if (lower.includes('srinagar') || lower.includes('kashmir')) return 'Srinagar';

  // Global Destinations
  if (lower.includes('bali') || lower.includes('ubud') || lower.includes('penida')) return 'Bali';
  if (lower.includes('dubai') || lower.includes('burj')) return 'Dubai';
  if (lower.includes('swiss') || lower.includes('zermatt') || lower.includes('matterhorn')) return 'Swiss Alps';
  if (lower.includes('kyoto') || lower.includes('arashiyama')) return 'Kyoto';
  if (lower.includes('tokyo') || lower.includes('shinjuku')) return 'Tokyo';
  if (lower.includes('paris') || lower.includes('eiffel')) return 'Paris';
  if (lower.includes('rome') || lower.includes('colosseum')) return 'Rome';
  if (lower.includes('amalfi') || lower.includes('positano') || lower.includes('capri')) return 'Amalfi Coast';
  if (lower.includes('santorini') || lower.includes('mykonos') || lower.includes('greece')) return 'Santorini';
  if (lower.includes('maldives')) return 'Maldives';
  if (lower.includes('london') || lower.includes('highlands') || lower.includes('scotland')) return 'London';
  if (lower.includes('cairo') || lower.includes('giza') || lower.includes('pyramids')) return 'Cairo';
  if (lower.includes('sydney')) return 'Sydney';
  if (lower.includes('petra') || lower.includes('jordan')) return 'Petra';
  if (lower.includes('machu picchu') || lower.includes('cusco') || lower.includes('peru')) return 'Machu Picchu';
  if (lower.includes('christ the redeemer') || lower.includes('rio')) return 'Rio de Janeiro';
  if (lower.includes('chichen itza') || lower.includes('cancun')) return 'Cancun';
  if (lower.includes('great wall') || lower.includes('beijing')) return 'Beijing';

  // Remove common prefix words like "trip to", "tour of", etc.
  return clean
    .replace(/^(?:trip to|tour of|explore|visit|guide to|vacation in|packages for)\s+/i, '')
    .split('&')[0]
    .split('·')[0]
    .trim();
}

/**
 * Resolve Railway Station Code for Indian Destinations
 */
export function resolveStationCode(cityOrName) {
  if (!cityOrName) return 'BSB';
  const c = cityOrName.toUpperCase().trim();
  if (c.length >= 2 && c.length <= 5 && !c.includes(' ')) return c;

  const stationMap = {
    'VARANASI': 'BSB',
    'KASHI': 'BSB',
    'BANARAS': 'BSB',
    'AGRA': 'AGC',
    'TAJ MAHAL': 'AGC',
    'NEW DELHI': 'NDLS',
    'DELHI': 'NDLS',
    'MUMBAI': 'CSMT',
    'BOMBAY': 'CSMT',
    'GOA': 'MAO',
    'MADGAON': 'MAO',
    'JAIPUR': 'JP',
    'UDAIPUR': 'UDZ',
    'MANALI': 'KLK',
    'KULLU': 'KLK',
    'SHIMLA': 'SML',
    'KERALA': 'ERS',
    'KOCHI': 'ERS',
    'ALLEPPEY': 'ALLP',
    'KEDARNATH': 'RKSH',
    'RISHIKESH': 'RKSH',
    'HARIDWAR': 'HW',
    'AYODHYA': 'AY',
    'AMRITSAR': 'ASR',
    'HAMPI': 'HPT',
    'LADAKH': 'JAT',
    'LEH': 'JAT',
    'JAISALMER': 'JSM',
    'BENGALURU': 'SBC',
    'BANGALORE': 'SBC',
    'CHENNAI': 'MAS',
    'KOLKATA': 'HWH',
    'HYDERABAD': 'SC',
    'LUCKNOW': 'LKO',
    'PRAYAGRAJ': 'PRYJ',
    'ALLAHABAD': 'PRYJ',
    'CHANDIGARH': 'CDG',
    'UNA': 'UHL',
    'SRINAGAR': 'SINA',
    'SHAHJAHANPUR': 'SPN',
    'SITAPUR': 'STP',
    'MIRZAPUR': 'MZP',
    'GORAKHPUR': 'GKP'
  };

  for (const [key, code] of Object.entries(stationMap)) {
    if (c.includes(key)) return code;
  }
  return 'NDLS';
}

/**
 * Resolve IATA Airport Code
 */
export function resolveAirportCode(cityOrName) {
  if (!cityOrName) return 'DEL';
  const c = cityOrName.toUpperCase().trim();
  if (c.length === 3 && !c.includes(' ')) return c;

  const airportMap = {
    'VARANASI': 'VNS',
    'KASHI': 'VNS',
    'AGRA': 'AGR',
    'TAJ MAHAL': 'AGR',
    'DELHI': 'DEL',
    'NEW DELHI': 'DEL',
    'MUMBAI': 'BOM',
    'BOMBAY': 'BOM',
    'GOA': 'GOI',
    'JAIPUR': 'JAI',
    'UDAIPUR': 'UDR',
    'MANALI': 'KUU',
    'KULLU': 'KUU',
    'KERALA': 'COK',
    'KOCHI': 'COK',
    'LADAKH': 'IXL',
    'LEH': 'IXL',
    'SRINAGAR': 'SXR',
    'KASHMIR': 'SXR',
    'AYODHYA': 'AYJ',
    'AMRITSAR': 'ATQ',
    'BENGALURU': 'BLR',
    'BANGALORE': 'BLR',
    'CHENNAI': 'MAA',
    'KOLKATA': 'CCU',
    'HYDERABAD': 'HYD',
    'ANDAMAN': 'IXZ',
    'PORT BLAIR': 'IXZ',
    'LUCKNOW': 'LKO',
    'DEHRADUN': 'DED',
    'RISHIKESH': 'DED',
    'CHANDIGARH': 'IXC',
    // International
    'DUBAI': 'DXB',
    'BALI': 'DPS',
    'SWITZERLAND': 'ZRH',
    'SWISS': 'ZRH',
    'ZERMATT': 'ZRH',
    'TOKYO': 'HND',
    'KYOTO': 'KIX',
    'JAPAN': 'HND',
    'PARIS': 'CDG',
    'FRANCE': 'CDG',
    'LONDON': 'LHR',
    'UK': 'LHR',
    'ROME': 'FCO',
    'ITALY': 'FCO',
    'AMALFI': 'NAP',
    'NAPLES': 'NAP',
    'SANTORINI': 'JTR',
    'GREECE': 'ATH',
    'MALDIVES': 'MLE',
    'CAIRO': 'CAI',
    'EGYPT': 'CAI',
    'SYDNEY': 'SYD',
    'AUSTRALIA': 'SYD',
    'PETRA': 'AMM',
    'JORDAN': 'AMM',
    'BEIJING': 'PEK',
    'CHINA': 'PEK',
    'CANCUN': 'CUN',
    'MEXICO': 'CUN',
    'RIO': 'GIG',
    'BRAZIL': 'GIG',
    'CUSCO': 'CUZ',
    'PERU': 'CUZ',
    'NEW YORK': 'JFK',
    'SINGAPORE': 'SIN',
    'BANGKOK': 'BKK'
  };

  for (const [key, code] of Object.entries(airportMap)) {
    if (c.includes(key)) return code;
  }
  return 'DEL';
}

/**
 * Check if destination has Indian Railways connectivity
 */
export function hasTrainNetwork(destName) {
  const norm = normalizeCityName(destName).toLowerCase();
  const nonTrainHubs = ['bali', 'dubai', 'maldives', 'paris', 'london', 'rome', 'cairo', 'sydney', 'petra', 'cancun', 'rio'];
  return !nonTrainHubs.some(h => norm.includes(h));
}

// ─── Deep-Link Route Generators ───────────────────────────────────────────────

export function getHotelsRoute(destination) {
  const city = normalizeCityName(destination);
  return `/hotels?destination=${encodeURIComponent(city)}&city=${encodeURIComponent(city)}`;
}

export function getTrainsRoute(destination, origin = 'NDLS') {
  const city = normalizeCityName(destination);
  const stnCode = resolveStationCode(city);
  return `/trains?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(stnCode)}&destination=${encodeURIComponent(city)}`;
}

export function getFlightsRoute(destination, origin = 'DEL') {
  const city = normalizeCityName(destination);
  const airCode = resolveAirportCode(city);
  return `/flights?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(airCode)}&destination=${encodeURIComponent(city)}`;
}

export function getExploreRoute(destination) {
  const city = normalizeCityName(destination);
  return `/explore?q=${encodeURIComponent(city)}`;
}

export function getItineraryRoute(destination, customPrompt = '') {
  const city = normalizeCityName(destination);
  const prompt = customPrompt || `Plan a comprehensive 4-day trip to ${city} with verified stays and transit options`;
  return `/itinerary?prompt=${encodeURIComponent(prompt)}&destination=${encodeURIComponent(city)}`;
}

export function getDestinationsRoute(destination) {
  const city = normalizeCityName(destination);
  return `/destinations?q=${encodeURIComponent(city)}`;
}
