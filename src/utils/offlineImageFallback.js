/**
 * TravelEase Universal Offline Image Resilience & Fallback Engine
 * Provides local bundled asset fallbacks for full offline operation without internet connectivity.
 */

export const LOCAL_OFFLINE_IMAGES = {
  destinations: [
    '/hero_day_dolomites.jpg',
    '/hero_day_alpine_valley.jpg',
    '/stories-greece-cove.jpg',
    '/stories-tokyo-culinary.jpg',
    '/stories-wakhan-pamir.jpg',
    '/hero_mountain_day.jpg',
    '/hero_mountain_night.jpg'
  ],
  hotels: [
    '/hero_day_dolomites.jpg',
    '/hero_day_alpine_valley.jpg',
    '/stories-greece-cove.jpg',
    '/stories-tokyo-culinary.jpg'
  ],
  trains: [
    '/train-hero.jpg',
    '/train-hero-alpine.jpg',
    '/train-hero-sunset.jpg',
    '/hero_mountain_day.jpg'
  ],
  flights: [
    '/hero_flying_plane.jpg'
  ],
  general: [
    '/hero_mountain_day.jpg',
    '/hero_mountain_night.jpg',
    '/brand/logo-mark.svg'
  ]
};

/**
 * Returns a guaranteed local bundled image URL for offline scenarios
 */
export const getOfflineFallback = (category = 'general', index = 0) => {
  const pool = LOCAL_OFFLINE_IMAGES[category] || LOCAL_OFFLINE_IMAGES.general;
  return pool[index % pool.length] || '/hero_day_dolomites.jpg';
};

/**
 * Universal onError handler for <img> elements to guarantee offline resilience
 */
export const handleOfflineImageError = (e, category = 'general', index = 0) => {
  if (!e || !e.target) return;
  e.target.onerror = null; // Prevent infinite fallback loops
  e.target.src = getOfflineFallback(category, index);
};
