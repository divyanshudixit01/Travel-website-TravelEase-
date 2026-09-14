/**
 * TravelEase Universal Offline Image Resilience & Fallback Engine
 * Provides local bundled asset fallbacks for full offline operation without internet connectivity.
 */

export const LOCAL_OFFLINE_IMAGES = {
  destinations: [
    '/images/destinations/hero_bali_sunsets.jpg',
    '/images/destinations/hero_amalfi_coast.jpg',
    '/images/destinations/hero_kyoto_bamboo.jpg',
    '/images/destinations/hero_swiss_alps.jpg',
    '/images/destinations/hero_varanasi_ghats.jpg',
    '/images/destinations/wonders_taj_mahal.jpg',
    '/images/destinations/wonders_colosseum.jpg',
    '/images/destinations/wonders_machu_picchu.jpg',
    '/images/destinations/wonders_petra.jpg',
    '/images/destinations/wonders_great_wall.jpg'
  ],
  hotels: [
    '/hero_day_dolomites.jpg',
    '/hero_day_alpine_valley.jpg',
    '/stories-greece-cove.jpg',
    '/stories-tokyo-culinary.jpg'
  ],
  trains: [
    '/images/trains/ir_vande_bharat.jpg',
    '/images/trains/ir_chenab_bridge.jpg',
    '/images/trains/ir_darjeeling_toy_train.jpg',
    '/images/trains/ir_fairy_queen.jpg',
    '/images/trains/ir_bullet_train_future.jpg',
    '/train-hero.jpg',
    '/train-hero-alpine.jpg',
    '/train-hero-sunset.jpg'
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
