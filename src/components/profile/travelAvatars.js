/**
 * TravelEase Signature SVG Avatars Collection
 * Apple & Google design inspired vector travel personas.
 * Encoded as optimized SVG Data URIs for universal compatibility across <img> tags, Canvas, and localStorage.
 */

export const TRAVEL_AVATARS = [
  {
    id: 'aviator',
    name: 'The Supersonic Aviator',
    tag: 'Flight Pioneer',
    accent: '#38bdf8',
    bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <radialGradient id="avBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="%2338bdf8"/>
          <stop offset="100%" stop-color="%230c4a6e"/>
        </radialGradient>
        <linearGradient id="visor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23f59e0b"/>
          <stop offset="50%" stop-color="%23ec4899"/>
          <stop offset="100%" stop-color="%2338bdf8"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(%23avBg)"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="%2338bdf8" stroke-width="1.5" stroke-opacity="0.3"/>
      <!-- Pilot Helmet -->
      <path d="M36 68 C36 42, 84 42, 84 68 C84 82, 36 82, 36 68 Z" fill="%230f172a"/>
      <!-- Goggles / Visor -->
      <path d="M38 58 C38 48, 82 48, 82 58 C82 68, 38 68, 38 58 Z" fill="url(%23visor)" rx="10"/>
      <ellipse cx="60" cy="57" rx="18" ry="4" fill="%23ffffff" opacity="0.4"/>
      <!-- Wings Emblem -->
      <path d="M60 76 L52 82 L60 88 L68 82 Z" fill="%23f59e0b"/>
      <path d="M46 80 L36 83 L42 86 L50 83 Z" fill="%23f59e0b" opacity="0.9"/>
      <path d="M74 80 L84 83 L78 86 L70 83 Z" fill="%23f59e0b" opacity="0.9"/>
      <circle cx="60" cy="82" r="2.5" fill="%23ffffff"/>
      <!-- Star Accent -->
      <circle cx="28" cy="36" r="1.5" fill="%23ffffff" opacity="0.8"/>
      <circle cx="92" cy="38" r="2" fill="%23f59e0b" opacity="0.8"/>
    </svg>`
  },
  {
    id: 'globetrotter',
    name: 'The Globetrotter',
    tag: 'World Explorer',
    accent: '#f59e0b',
    bg: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <radialGradient id="gtBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="%23fbbf24"/>
          <stop offset="100%" stop-color="%2378350f"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(%23gtBg)"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="%23fbbf24" stroke-width="1.5" stroke-opacity="0.3"/>
      <!-- Fedora Hat -->
      <path d="M26 62 Q60 52 94 62 Q60 67 26 62 Z" fill="%23b45309"/>
      <path d="M40 60 C40 38, 80 38, 80 60 Z" fill="%2392400e"/>
      <path d="M40 56 Q60 58 80 56 L80 60 Q60 62 40 60 Z" fill="%23f59e0b"/>
      <!-- Explorer Compass Emblem -->
      <circle cx="60" cy="80" r="14" fill="%231e293b" stroke="%23fbbf24" stroke-width="2"/>
      <polygon points="60,70 63,79 70,80 63,81 60,90 57,81 50,80 57,79" fill="%23ef4444"/>
      <polygon points="60,70 63,79 70,80 63,81" fill="%23f59e0b"/>
      <circle cx="60" cy="80" r="2.5" fill="%23ffffff"/>
    </svg>`
  },
  {
    id: 'alpine',
    name: 'The Alpine Trekker',
    tag: 'Mountain Nomad',
    accent: '#10b981',
    bg: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <radialGradient id="alpBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="%2334d399"/>
          <stop offset="100%" stop-color="%23064e3b"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(%23alpBg)"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="%2334d399" stroke-width="1.5" stroke-opacity="0.3"/>
      <!-- Mountain Peak silhouette behind -->
      <polygon points="60,32 36,66 84,66" fill="%230f172a" opacity="0.3"/>
      <polygon points="60,32 54,42 66,42" fill="%23ffffff" opacity="0.9"/>
      <!-- Beanie -->
      <path d="M38 64 C38 42, 82 42, 82 64 Z" fill="%23047857"/>
      <circle cx="60" cy="42" r="5" fill="%23fbbf24"/>
      <rect x="36" y="62" width="48" height="10" rx="4" fill="%23065f46"/>
      <!-- Snow Goggles -->
      <rect x="42" y="70" width="36" height="16" rx="8" fill="%230f172a" stroke="%2334d399" stroke-width="2"/>
      <ellipse cx="52" cy="78" rx="6" ry="4" fill="%2338bdf8" opacity="0.8"/>
      <ellipse cx="68" cy="78" rx="6" ry="4" fill="%2338bdf8" opacity="0.8"/>
      <path d="M48 76 Q52 74 56 76" stroke="%23ffffff" stroke-width="1.5" fill="none"/>
      <path d="M64 76 Q68 74 72 76" stroke="%23ffffff" stroke-width="1.5" fill="none"/>
    </svg>`
  },
  {
    id: 'cosmic',
    name: 'The Cosmic Voyager',
    tag: 'Celestial Wanderer',
    accent: '#a855f7',
    bg: 'linear-gradient(135deg, #7e22ce 0%, #3b0764 100%)',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <radialGradient id="cosBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="%23c084fc"/>
          <stop offset="100%" stop-color="%233b0764"/>
        </radialGradient>
        <linearGradient id="cosVisor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%2306b6d4"/>
          <stop offset="50%" stop-color="%238b5cf6"/>
          <stop offset="100%" stop-color="%23f43f5e"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(%23cosBg)"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="%23c084fc" stroke-width="1.5" stroke-opacity="0.3"/>
      <!-- Astronaut Helmet -->
      <circle cx="60" cy="60" r="26" fill="%23f8fafc"/>
      <rect x="42" y="78" width="36" height="10" rx="3" fill="%23cbd5e1"/>
      <!-- Visor with Nebula -->
      <ellipse cx="60" cy="58" rx="19" ry="14" fill="url(%23cosVisor)"/>
      <ellipse cx="54" cy="53" rx="6" ry="2.5" fill="%23ffffff" opacity="0.6" transform="rotate(-15 54 53)"/>
      <circle cx="70" cy="62" r="1" fill="%23ffffff"/>
      <circle cx="64" cy="66" r="1.5" fill="%23ffffff" opacity="0.8"/>
    </svg>`
  },
  {
    id: 'oceanic',
    name: 'The Oceanic Diver',
    tag: 'Island Specialist',
    accent: '#06b6d4',
    bg: 'linear-gradient(135deg, #0891b2 0%, #164e63 100%)',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <radialGradient id="ocBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="%2322d3ee"/>
          <stop offset="100%" stop-color="%23164e63"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(%23ocBg)"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="%2322d3ee" stroke-width="1.5" stroke-opacity="0.3"/>
      <!-- Diver Mask -->
      <path d="M38 52 C38 40, 82 40, 82 52 C82 72, 70 78, 60 78 C50 78, 38 72, 38 52 Z" fill="%230f172a" stroke="%2306b6d4" stroke-width="3"/>
      <ellipse cx="50" cy="56" rx="9" ry="10" fill="%2338bdf8" opacity="0.75"/>
      <ellipse cx="70" cy="56" rx="9" ry="10" fill="%2338bdf8" opacity="0.75"/>
      <ellipse cx="48" cy="52" rx="3" ry="4" fill="%23ffffff" opacity="0.6"/>
      <ellipse cx="68" cy="52" rx="3" ry="4" fill="%23ffffff" opacity="0.6"/>
      <!-- Snorkel Pipe -->
      <path d="M84 56 C88 56, 92 64, 92 76 L88 76 C88 66, 86 60, 82 60 Z" fill="%23f59e0b"/>
      <!-- Air Bubbles -->
      <circle cx="34" cy="40" r="3" fill="%23ffffff" opacity="0.6"/>
      <circle cx="30" cy="30" r="2" fill="%23ffffff" opacity="0.4"/>
      <circle cx="36" cy="22" r="1.5" fill="%23ffffff" opacity="0.5"/>
    </svg>`
  },
  {
    id: 'jetsetter',
    name: 'The Urban Jetsetter',
    tag: 'Luxury Voyeur',
    accent: '#e2e8f0',
    bg: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <radialGradient id="jsBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="%2364748b"/>
          <stop offset="100%" stop-color="%230f172a"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(%23jsBg)"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-opacity="0.3"/>
      <!-- Haircut -->
      <path d="M38 48 C38 32, 82 32, 82 48 C82 52, 38 52, 38 48 Z" fill="%23090d16"/>
      <!-- Head -->
      <circle cx="60" cy="60" r="18" fill="%23fed7aa"/>
      <!-- Designer Sunglasses -->
      <path d="M42 56 L58 56 L56 66 L44 66 Z" fill="%230f172a" stroke="%23f59e0b" stroke-width="1.5"/>
      <path d="M62 56 L78 56 L76 66 L64 66 Z" fill="%230f172a" stroke="%23f59e0b" stroke-width="1.5"/>
      <line x1="58" y1="58" x2="62" y2="58" stroke="%23f59e0b" stroke-width="1.5"/>
      <!-- Suit Collar & Tie -->
      <polygon points="46,82 60,92 74,82 68,98 52,98" fill="%23ffffff"/>
      <polygon points="58,84 62,84 61,96 59,96" fill="%23f59e0b"/>
    </svg>`
  },
  {
    id: 'nomad',
    name: 'The Eco Nomad',
    tag: 'Sustainable Backpacker',
    accent: '#84cc16',
    bg: 'linear-gradient(135deg, #65a30d 0%, #365314 100%)',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <radialGradient id="nomBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="%23a3e635"/>
          <stop offset="100%" stop-color="%23365314"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(%23nomBg)"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="%23a3e635" stroke-width="1.5" stroke-opacity="0.3"/>
      <!-- Headband / Bandana -->
      <ellipse cx="60" cy="50" rx="22" ry="12" fill="%23ea580c"/>
      <rect x="38" y="48" width="44" height="6" rx="2" fill="%23f59e0b"/>
      <!-- Round Wireframe Glasses -->
      <circle cx="51" cy="62" r="7" fill="%23f8fafc" opacity="0.3" stroke="%231e293b" stroke-width="2"/>
      <circle cx="69" cy="62" r="7" fill="%23f8fafc" opacity="0.3" stroke="%231e293b" stroke-width="2"/>
      <line x1="58" y1="62" x2="62" y2="62" stroke="%231e293b" stroke-width="2"/>
      <!-- Leaf Insignia -->
      <path d="M60 76 Q66 72 68 80 Q62 84 60 76 Z" fill="%2384cc16"/>
      <line x1="60" y1="76" x2="68" y2="80" stroke="%23365314" stroke-width="0.8"/>
    </svg>`
  },
  {
    id: 'railmaster',
    name: 'The Heritage Railmaster',
    tag: 'Iron Trail Captain',
    accent: '#f97316',
    bg: 'linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <radialGradient id="rmBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="%23fb923c"/>
          <stop offset="100%" stop-color="%237c2d12"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(%23rmBg)"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="%23fb923c" stroke-width="1.5" stroke-opacity="0.3"/>
      <!-- Train Captain Cap -->
      <path d="M34 56 C34 40, 86 40, 86 56 Z" fill="%230f172a"/>
      <rect x="32" y="54" width="56" height="8" rx="3" fill="%231e293b"/>
      <path d="M30 62 Q60 67 90 62 Q60 65 30 62 Z" fill="%230f172a"/>
      <!-- Golden Locomotive Badge -->
      <circle cx="60" cy="48" r="5" fill="%23f59e0b" stroke="%23ffffff" stroke-width="1"/>
      <path d="M58 46 L62 46 L61 50 L59 50 Z" fill="%230f172a"/>
      <!-- Pocket Watch Chain -->
      <path d="M48 80 Q60 90 72 80" stroke="%23f59e0b" stroke-width="2" fill="none" stroke-dasharray="2 3"/>
      <circle cx="60" cy="85" r="3" fill="%23f59e0b"/>
    </svg>`
  }
];
