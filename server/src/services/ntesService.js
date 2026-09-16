/**
 * NTES (National Train Enquiry System) Direct Live Connector
 * Zero API Keys required • Unlimited • 100% Free Official Indian Railways Feed
 * Direct integration with enquiry.indianrail.gov.in
 */

import cache from '../utils/cacheManager.js';

const NTES_BASE_URL = 'https://enquiry.indianrail.gov.in/mntes';

/**
 * Fetch Live Train Running Status from NTES
 * @param {string} trainNumber 5-digit Indian Railway train number
 * @param {string} journeyDate Date in YYYY-MM-DD or DD-MM-YYYY format
 */
export async function getNtesLiveStatus(trainNumber, journeyDate) {
  const cleanTrainNo = String(trainNumber || '').trim().replace(/\D/g, '');
  if (!cleanTrainNo) {
    return { success: false, message: 'Invalid train number' };
  }

  const cacheKey = `ntes_live_${cleanTrainNo}_${journeyDate || 'today'}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    // Format date for NTES (DD-MMM-YYYY or DD-MM-YYYY)
    let d = new Date();
    if (journeyDate && journeyDate.includes('-')) {
      const parts = journeyDate.split('-');
      if (parts[0].length === 4) {
        d = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        d = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    }

    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = months[d.getMonth()];
    const year = d.getFullYear();
    const formattedDate = `${day}-${monthStr}-${year}`;

    const url = `${NTES_BASE_URL}/q?opt=TrainRunningHistory&subOpt=ShowRunHistory&trainNo=${encodeURIComponent(cleanTrainNo)}&jDate=${encodeURIComponent(formattedDate)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, */*',
        'Referer': 'https://enquiry.indianrail.gov.in/'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const text = await response.text();
      let parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        // If HTML or partial JSON returned, check if structured
      }

      if (parsed && (parsed.stations || parsed.data)) {
        const result = {
          success: true,
          source: 'ntes_official_direct',
          data: parsed.data || parsed
        };
        cache.set(cacheKey, result, 30000); // 30s TTL
        return result;
      }
    }
  } catch (err) {
    clearTimeout(timeout);
    // Silent failover to primary RapidAPI or master schedule
  }

  return {
    success: false,
    source: 'ntes_direct',
    message: `NTES direct query unavailable for #${cleanTrainNo}`
  };
}

/**
 * Fetch Live Station Board (Departures & Arrivals) directly from NTES
 * @param {string} stationCode 
 * @param {number} windowHours (2 or 4 hours)
 */
export async function getNtesStationBoard(stationCode, windowHours = 2) {
  const cleanCode = String(stationCode || '').trim().toUpperCase();
  if (!cleanCode) return { success: false, message: 'Invalid station code' };

  const cacheKey = `ntes_board_${cleanCode}_${windowHours}h`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const url = `${NTES_BASE_URL}/q?opt=LiveStation&subOpt=ShowLiveStation&station=${encodeURIComponent(cleanCode)}&window=${windowHours}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://enquiry.indianrail.gov.in/'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const text = await response.text();
      let parsed = null;
      try { parsed = JSON.parse(text); } catch {}
      if (parsed && parsed.trains) {
        const result = {
          success: true,
          source: 'ntes_official_direct',
          station: cleanCode,
          trains: parsed.trains
        };
        cache.set(cacheKey, result, 45000); // 45s TTL
        return result;
      }
    }
  } catch (err) {
    clearTimeout(timeout);
  }

  return { success: false, message: 'NTES board unavailable' };
}
