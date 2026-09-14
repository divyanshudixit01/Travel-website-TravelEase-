import { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ThemeContext from '../context/ThemeContext';
import { useBooking } from '../context/BookingContext';
import { 
  FaHeart, FaRegHeart, FaShareAlt,
  FaRegBookmark, FaBookmark, FaSearch, FaMapMarkerAlt,
  FaCompass, FaArrowRight, FaTimes, FaClock,
  FaCamera, FaVolumeUp, FaVolumeMute, FaCheckCircle,
  FaQuoteLeft, FaGlobeAmericas
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema } from '../utils/schemas';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';

// Authentic, human-crafted travel dispatches
const authenticDispatches = [
  {
    id: 'wakhan-corridor',
    title: 'The Last Nomads of the High Pamir: Walking the Wakhan Corridor',
    deck: 'Four weeks living alongside the semi-nomadic Wakhi shepherds at 4,200 meters, where the Hindu Kush meets the roof of the world.',
    author: {
      name: 'Farhad Reza',
      role: 'High-Altitude Ethnographer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
      credentials: 'National Geographic Field Contributor'
    },
    image: '/stories-wakhan-pamir.jpg',
    category: 'Mountain Expeditions',
    location: 'Wakhan Corridor, Pamir Mountains',
    coordinates: '37°02′N 73°14′E',
    date: 'September 2026',
    readTime: '9 min read',
    gear: 'Leica SL2 • 50mm f/1.4 Summilux',
    elevation: '4,280m',
    publisher: 'National Geographic Partner',
    publisherSeal: 'NAT GEO EXPEDITIONS',
    likes: 1428,
    views: '24.6k',
    featured: true,
    excerpt: 'At 4,000 meters above sea level, the air tastes like cold flint. The sound of our yak caravan hooves striking river stones is the only percussion in a valley three hundred miles from the nearest paved road. Here, hospitality is not a courtesy; it is an ancient survival covenant.',
    content: [
      'The morning began at negative eight degrees Celsius inside a goat-hair yurt smelling of woodsmoke and salted yak butter tea (shir chai). Outside, the sun was just cresting the snow-caked spine of the Hindu Kush, casting mile-long shadows across glacial moraines.',
      'Our team was traveling on foot alongside Qurban, a 54-year-old shepherd who has crossed the 4,900-meter Irshad Pass twenty-six times. In this high borderland where Tajikistan, Afghanistan, and Pakistan converge, geopolitical lines mean far less than seasonal pasture snowmelt.',
      '"The mountain does not remember emperors," Qurban told me through steam swirling from his bowl. "It only remembers who walked with respect." By mid-afternoon, we reached the summer camp at Lake Chaqmaqtin, where fifty Wakhi families maintain an unbroken pastoral heritage spanning three millennia.'
    ],
    fieldNotes: {
      bestSeason: 'Late July to mid-September',
      permit: 'GBAO permit + Border zone endorsement',
      difficulty: 'Strenuous • Self-sufficient expedition',
      soundscape: 'Wind humming across prayer cairns and yak bells'
    }
  },
  {
    id: 'tokyo-ramen-dawn',
    title: 'Midnight Broth: 5 AM at Tsukiji’s Hidden 6-Seat Ramen Counter',
    deck: 'Behind steam-fogged sliding cedar doors in Chuo City, three generations boil tonkotsu broth for 36 hours for market workers and night owls.',
    author: {
      name: 'Kenji Takahashi',
      role: 'Culinary Documentarian',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop',
      credentials: 'Tokyo Gastronomic Society'
    },
    image: '/stories-tokyo-culinary.jpg',
    category: 'Culinary Journeys',
    location: 'Outer Tsukiji, Tokyo, Japan',
    coordinates: '35°39′N 139°46′E',
    date: 'August 2026',
    readTime: '6 min read',
    gear: 'Fujifilm X-Pro3 • 23mm f/2',
    elevation: '4m',
    publisher: 'Michelin Selected Dispatch',
    publisherSeal: 'MICHELIN DISPATCH',
    likes: 2190,
    views: '38.2k',
    featured: false,
    excerpt: 'Rain reflects the neon glow of blue hour over wet cobblestones. Inside Menya Shingen, the steam smells of simmered pork bones, ginger knots, and aged soy mash. Six stools, no menu translations, and thirty minutes of culinary perfection.',
    content: [
      'At 4:45 AM, Tokyo is silent except for the low electric hum of refrigerated fish trucks and the soft chop-chop of scallions behind the noren curtain of Menya Shingen. Master Watanabe, now seventy-two, has stood at this boiling kettle since 1978.',
      'There are only six wooden stools. To eat here is to participate in an unspoken ceremony of sensory focus. You do not check your smartphone. You listen to the wooden ladle stirring the broth, watch the flour dust fly as handmade alkaline noodles hit rolling water for precisely 52 seconds.',
      'The first sip of broth is deep and velvety—layered with dried niboshi sardines, kombu from Rishiri Island, and aged shoyu fermented in wooden cedar barrels in Chiba. It is warm, restorative, and grounded in centuries of artisan pride.'
    ],
    fieldNotes: {
      bestSeason: 'Year-round • Best on crisp autumn mornings',
      permit: 'Cash only • 1,100 JPY ($7 USD)',
      difficulty: 'Easy walk from Tsukiji-shijo Station',
      soundscape: 'Ladle on cast iron and morning fish carts'
    }
  },
  {
    id: 'mani-peloponnese-cove',
    title: 'Under the Olive Groves of Mani: Secret Coves of the Peloponnese',
    deck: 'Traversing the wild limestone finger of southern Greece, where stone tower houses look out over turquoise waters untouched by resort crowds.',
    author: {
      name: 'Daphne Katsaros',
      role: 'Mediterranean Marine Biologist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
      credentials: 'Aegean Maritime Institute'
    },
    image: '/stories-greece-cove.jpg',
    category: 'Coastal Escapes',
    location: 'Limeni & Cape Matapan, Greece',
    coordinates: '36°40′N 22°22′E',
    date: 'July 2026',
    readTime: '7 min read',
    gear: 'Sony A7R V • 24-70mm f/2.8 GM II',
    elevation: '12m',
    publisher: 'Condé Nast Traveler Pick',
    publisherSeal: 'CONDÉ NAST SELECTED',
    likes: 1856,
    views: '29.1k',
    featured: false,
    excerpt: 'The water in the cove of Limeni is so crystalline that anchored wooden caiques cast crisp shadows thirty feet below on white sea-pebbles. Time here is measured only by the chirping of cicadas in wild thyme shrubs.',
    content: [
      'The Mani Peninsula has always been a fortress. Shielded by the jagged ridge of Mount Taygetos, this sun-scorched tongue of limestone remained autonomous even through centuries of Ottoman dominance. Its inhabitants built fortified stone tower houses (pyrgi) that rise like chess rooks against the azure sky.',
      'Down in the secluded cove of Mezapos, we tied our wooden sailboat to an iron ring hammered into sea-smoothed rock two hundred years ago. The water temperature was a perfect 24 degrees Celsius, so clear that schools of silver bream glided beneath our hull as if suspended in thin air.',
      'Dinner at Takis’ stone tavern was grilled sea bream caught that afternoon, drizzled with peppery green oil pressed from olives clinging to the cliffs behind us, accompanied by crusty sourdough baked in a wood-fired hearth.'
    ],
    fieldNotes: {
      bestSeason: 'May to June & September to October',
      permit: 'None • Rental car recommended from Athens',
      difficulty: 'Moderate cliff path trails',
      soundscape: 'Gentle sea lap against stone jetty and cicadas'
    }
  },
  {
    id: 'arctic-fjord-igloo',
    title: 'Glass Igloos & Arctic Fjord Solitude Under the Aurora',
    deck: 'Winter expedition along Norway’s Senja island, testing cameras in sub-zero stillness while the northern lights dance across tidal waters.',
    author: {
      name: 'Astrid Lindqvist',
      role: 'Arctic Wilderness Guide',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
      credentials: 'Nordic Polar Expeditions'
    },
    image: '/auth-forgot-hero.jpg',
    category: 'Polar Expeditions',
    location: 'Senja Archipelago, Troms, Norway',
    coordinates: '69°24′N 17°31′E',
    date: 'November 2026',
    readTime: '8 min read',
    gear: 'Nikon Z8 • 14-24mm f/2.8 S',
    elevation: '45m',
    publisher: 'Outside Magazine Feature',
    publisherSeal: 'OUTSIDE FIELD EDIT',
    likes: 2430,
    views: '41.8k',
    featured: false,
    excerpt: 'At 11:20 PM, the fjord went electric green. Sheets of emerald, violet, and pale cyan aurora rippled across the sky, mirrored perfectly in the black glassy surface of the fjord outside our heated geodesic glass shelter.',
    content: [
      'The thermometer on the spruce post read minus fourteen Celsius, but inside the cedar and glass dome cabin, a cast-iron stove crackled with dry birch wood. Outside, silence is so complete you can hear the faint crackle of sea ice shifting with the tide.',
      'When the aurora arrives, it does not announce itself. It begins as a faint milky veil behind jagged granite sea cliffs before suddenly bursting into ribbons of magnetic plasma that race from zenith to horizon.',
      'Standing on snowshoes along the rocky shoreline, breathing air so crisp it feels pure as diamonds, you realize why the ancient Norse regarded the northern lights not merely as physics, but as an bridge between worlds.'
    ],
    fieldNotes: {
      bestSeason: 'October through March (peak solar cycle)',
      permit: 'Tromsø flight + 4WD rental with studded tires',
      difficulty: 'Cold-weather preparedness essential',
      soundscape: 'Cracking fjord ice and silence under the stars'
    }
  },
  {
    id: 'caledonian-sleeper',
    title: 'Midnight on the Caledonian: Sleeper Train Through the Cairngorms',
    deck: 'Boarding at London Euston and waking up to mist-draped heather, red deer stags, and roaring burns in the Scottish Highlands.',
    author: {
      name: 'Isla MacLeod',
      role: 'Slow Rail Travel Columnist',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop',
      credentials: 'Wanderlust UK Contributor'
    },
    image: '/train-hero-alpine.jpg',
    category: 'Slow Rail & Journeys',
    location: 'Highland Main Line, Scotland',
    coordinates: '57°28′N 04°13′W',
    date: 'October 2026',
    readTime: '5 min read',
    gear: 'Canon EOS R5 • 35mm f/1.8',
    elevation: '340m',
    publisher: 'Wanderlust UK Selected',
    publisherSeal: 'WANDERLUST CHOICE',
    likes: 1612,
    views: '21.4k',
    featured: false,
    excerpt: 'The rhythmic click-clack of steel rails is the ultimate lullaby. You fall asleep rolling past Birmingham and wake up to ancient Caledonian pine forests wrapped in morning fog.',
    content: [
      'There is no romance in modern air travel: security trays, boarding gates, and cabin pressure. But aboard the Caledonian Sleeper’s Club Car, sipping a 12-year-old single malt as the train rattles past twilight hills, travel recovers its lost poetry.',
      'By dawn, the carriage attendant knocked gently with a pot of hot coffee and warm shortbread. Pulling up the window blind revealed the wild expanses of Rannoch Moor—miles of golden peat bogs, granite boulders, and misty lochs reflecting dark mountain peaks.',
      'Watching three red deer stags raise their crowned heads as our sixteen-car train glided silently across the moor is a memory no airport departure lounge could ever provide.'
    ],
    fieldNotes: {
      bestSeason: 'Autumn (Sept-Nov) for golden heather foliage',
      permit: 'Book Club Room 6 weeks in advance',
      difficulty: 'Pure comfort and relaxation',
      soundscape: 'Rhythmic train bogies and Highland rain'
    }
  },
  {
    id: 'kumano-kodo-pilgrimage',
    title: 'Whispers in the Cedar Mist: Walking the Sacred Kumano Kodo',
    deck: 'Following thousand-year-old mossy stone staircases through the sacred mountains of Kii, staying in remote shukubo temple lodgings.',
    author: {
      name: 'Rowan Bennett',
      role: 'Cultural Documentarian',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop',
      credentials: 'UNESCO Heritage Fellow'
    },
    image: '/hero_day_alpine_valley.jpg',
    category: 'Cultural Pilgrimage',
    location: 'Kii Peninsula, Wakayama, Japan',
    coordinates: '33°50′N 135°46′E',
    date: 'June 2026',
    readTime: '11 min read',
    gear: 'Hasselblad X2D 100C • 38mm f/2.5',
    elevation: '860m',
    publisher: 'BBC Travel Feature',
    publisherSeal: 'BBC TRAVEL DISPATCH',
    likes: 1980,
    views: '33.5k',
    featured: false,
    excerpt: 'For over a millennium, emperors, aristocrats, and samurai walked these moss-covered stone trails (Nakahechi) in pursuit of spiritual renewal and harmony with the mountain kami.',
    content: [
      'The Kumano Kodo is one of only two pilgrimage routes recognized by UNESCO as World Heritage (alongside Spain’s Camino de Santiago). Walking it in the soft morning rain, with giant Japanese cedars towering sixty meters above like temple pillars, is an exercise in mindful humility.',
      'Every few kilometers, a small stone Oji shrine marks where ancient travelers paused to offer prayers and compose poetry. We stayed at a traditional minshuku in Yunomine Onsen, bathing in the Tsuboyu stone bath—the oldest hot spring in Japan, where sulfur-rich waters change color seven times a day.',
      'By the fifth day, reaching the thunderous Nachi Waterfall cascading behind the vermilion three-story pagoda of Seiganto-ji, the physical fatigue of climbing 40,000 stone steps vanished into pure awe.'
    ],
    fieldNotes: {
      bestSeason: 'April to May & October to November',
      permit: 'Luggage forwarding available between inns',
      difficulty: 'Moderate to challenging day climbs',
      soundscape: 'Temple bells, cedar wind, and rushing waterfalls'
    }
  },
  {
    id: 'maldives-atoll-reefs',
    title: 'Beyond the Overwater Villas: Marine Conservation in Raa Atoll',
    deck: 'Diving with manta rays and marine biologists rebuilding heat-resistant coral nurseries on remote Maldivian barrier reefs.',
    author: {
      name: 'Tariq Al-Mansoor',
      role: 'Ocean Conservationist',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop',
      credentials: 'Coral Restoration Foundation'
    },
    image: '/auth-travel-hero.jpg',
    category: 'Coastal Escapes',
    location: 'Raa & Baa Atolls, Maldives',
    coordinates: '05°38′N 72°55′E',
    date: 'May 2026',
    readTime: '7 min read',
    gear: 'Canon R5 • Nauticam Underwater Housing',
    elevation: '0m (Sea Level)',
    publisher: 'Lonely Planet Best in Travel',
    publisherSeal: 'LONELY PLANET EDIT',
    likes: 1740,
    views: '26.8k',
    featured: false,
    excerpt: 'Most people visit the Maldives to sleep in luxury. We came to freedive with ninety reef mantas feeding in a tight cyclone at Hanifaru Bay during the southwest monsoon.',
    content: [
      'Beneath the turquoise surface of the Indian Ocean, a silent ballet unfolds. Hanifaru Bay acts as a natural funnel for plankton pushed by monsoon currents, drawing dozens of oceanic manta rays that execute synchronized barrel rolls with wingspans exceeding twelve feet.',
      'Working alongside local Maldivian marine biologists on Maamunagau Island, we helped transplant two hundred micro-fragments of staghorn coral onto ceramic spider frames anchored to degraded sections of the outer barrier reef.',
      'Seeing juvenile clownfish and hawksbill sea turtles return to these artificial nurseries within just eight months proves that with community dedication, our oceans possess an astonishing capacity for regeneration.'
    ],
    fieldNotes: {
      bestSeason: 'June to October for manta feeding aggregations',
      permit: 'Hanifaru Bay marine park visitor pass required',
      difficulty: 'Snorkel and freediving competence',
      soundscape: 'Breathing through regulator and whale calls'
    }
  },
  {
    id: 'dolomites-tre-cime',
    title: 'Limestone Towers and Dawn Mist: The High Pass of Tre Cime',
    deck: 'Alpine bivouac at 2,450 meters watching the first pink alpenglow strike the vertical north faces of South Tyrol’s iconic peaks.',
    author: {
      name: 'Matteo Bernardi',
      role: 'Alpine Search & Rescue',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop',
      credentials: 'Club Alpino Italiano'
    },
    image: '/hero_day_dolomites.jpg',
    category: 'Mountain Expeditions',
    location: 'Sexten Dolomites, South Tyrol, Italy',
    coordinates: '46°37′N 12°18′E',
    date: 'April 2026',
    readTime: '10 min read',
    gear: 'Sony A1 • 70-200mm f/2.8 GM OSS II',
    elevation: '2,450m',
    publisher: 'Alpinist Journal',
    publisherSeal: 'ALPINIST EXPEDITION',
    likes: 2210,
    views: '35.4k',
    featured: false,
    excerpt: 'The rock of the Dolomites is fossilized prehistoric coral reef lifted three miles into the sky. At dawn, it turns from ash grey to blazing crimson in thirty breathtaking seconds.',
    content: [
      'Waking up at Rifugio Locatelli an hour before astronomical sunrise, the world is monochrome slate and freezing silence. Far below in the valley of Auronzo, a sea of cloud blankets the lowlands, leaving only the sharp towers of Tre Cime di Lavaredo piercing the sky like teeth.',
      'We strapped on crampons for the frozen traverse along the Paternsattel. As the sun broke over the Austrian border peaks, the phenomenon locals call Enrosadira (alpenglow) ignited the vertical limestone walls in shades of rose, amber, and gold.',
      'High alpine trekking strips away triviality. With every step on the rocky ledge, the crisp mountain air reminds you of the monumental patience of geological time.'
    ],
    fieldNotes: {
      bestSeason: 'July to late September for open via ferrata routes',
      permit: 'Toll road ticket for Rifugio Auronzo parking',
      difficulty: 'Moderate alpine trail • Good boots essential',
      soundscape: 'Alpine choughs calling and mountain breeze'
    }
  }
];

// Explorer Stories Reels (Instagram / Stories style avatar badges at top)
const explorerReels = [
  { name: 'Farhad', destination: 'Wakhan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop', storyId: 'wakhan-corridor', country: 'AF' },
  { name: 'Kenji', destination: 'Tokyo', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop', storyId: 'tokyo-ramen-dawn', country: 'JP' },
  { name: 'Daphne', destination: 'Mani', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop', storyId: 'mani-peloponnese-cove', country: 'GR' },
  { name: 'Astrid', destination: 'Senja', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop', storyId: 'arctic-fjord-igloo', country: 'NO' },
  { name: 'Isla', destination: 'Highlands', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop', storyId: 'caledonian-sleeper', country: 'UK' },
  { name: 'Rowan', destination: 'Kumano', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop', storyId: 'kumano-kodo-pilgrimage', country: 'JP' },
  { name: 'Tariq', destination: 'Maldives', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop', storyId: 'maldives-atoll-reefs', country: 'MV' },
  { name: 'Matteo', destination: 'Dolomites', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop', storyId: 'dolomites-tre-cime', country: 'IT' },
];

// Curated publisher badges
const editorialPartners = [
  { name: 'National Geographic Expeditions', code: 'NATGEO' },
  { name: 'Condé Nast Traveler', code: 'CONDÉ NAST' },
  { name: 'Lonely Planet', code: 'LONELY PLANET' },
  { name: 'BBC Travel', code: 'BBC TRAVEL' },
  { name: 'Outside Magazine', code: 'OUTSIDE' },
  { name: 'Wanderlust UK', code: 'WANDERLUST' },
];

const categories = [
  'All Dispatches',
  'Mountain Expeditions',
  'Culinary Journeys',
  'Coastal Escapes',
  'Polar Expeditions',
  'Slow Rail & Journeys',
  'Cultural Pilgrimage'
];

const Blog = () => {
  const { theme } = useContext(ThemeContext);
  const { addToast } = useBooking();

  const [activeCategory, setActiveCategory] = useState('All Dispatches');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('travelease_bookmarked_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [likedMap, setLikedMap] = useState({});
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  // Toggle bookmark
  const toggleBookmark = (id, e) => {
    if (e) e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('travelease_bookmarked_stories', JSON.stringify(next));
      } catch {}
      addToast(next.includes(id) ? 'Dispatch saved to your reading list.' : 'Dispatch removed from reading list.', 'info');
      return next;
    });
  };

  // Toggle like
  const toggleLike = (id, e) => {
    if (e) e.stopPropagation();
    setLikedMap(prev => {
      const currentlyLiked = prev[id];
      const nextState = !currentlyLiked;
      if (nextState) {
        addToast('Thanks for showing appreciation to the explorer!', 'success');
      }
      return { ...prev, [id]: nextState };
    });
  };

  // Share story
  const handleShare = (story, e) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.deck,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Story link copied to clipboard!', 'success');
    }
  };

  // Newsletter submit
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    setNewsletterSent(true);
    addToast('Subscribed! You will receive weekly field dispatches.', 'success');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSent(false), 5000);
  };

  // Filtered stories
  const filteredStories = useMemo(() => {
    return authenticDispatches.filter(story => {
      const matchesCategory = activeCategory === 'All Dispatches' || story.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        story.title.toLowerCase().includes(query) ||
        story.deck.toLowerCase().includes(query) ||
        story.location.toLowerCase().includes(query) ||
        story.author.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const featuredStory = authenticDispatches.find(s => s.featured) || authenticDispatches[0];

  const blogSchemas = [
    getWebPageSchema({
      type: 'CollectionPage',
      name: 'Travel Chronicles & Field Dispatches — TravelEase',
      description: 'Human-crafted travel narratives, high-altitude expeditions, culinary deep dives, and verified field notes from global explorers.',
      url: '/blog',
      breadcrumb: true,
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Stories & Dispatches' },
    ], '/blog')
  ];

  return (
    <div 
      className="min-h-screen relative overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-500 pt-20 pb-16"
      id="stories-landing-page"
    >
      <JsonLd data={blogSchemas} />

      {/* ─── Unified Full-Bleed Background (No Split / Continuous Atmosphere) ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <img
          src="/stories-wakhan-pamir.jpg"
          alt=""
          className="w-full h-full object-cover object-center scale-105 filter transition-all duration-1000 opacity-20 dark:opacity-15"
        />

        {/* Ambient Color Blending Overlays */}
        {theme === 'dark' ? (
          <>
            <div className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-[24px]" />
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 80% 20%, rgba(245, 158, 11, 0.12), transparent 60%), radial-gradient(ellipse at 20% 60%, rgba(14, 165, 233, 0.10), transparent 60%)'
              }}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-slate-50/85 backdrop-blur-[20px]" />
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 80% 20%, rgba(251, 191, 36, 0.18), transparent 65%), radial-gradient(ellipse at 20% 60%, rgba(56, 189, 248, 0.14), transparent 65%), radial-gradient(ellipse at 50% 90%, rgba(16, 185, 129, 0.10), transparent 65%)'
              }}
            />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* ─── 1. Compact Editorial Header & Explorer Stories Reel ─── */}
        <section className="pt-2">
          
          {/* Top Ticker & Journal Stamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/70 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-sm shadow-amber-500/25">
                Vol. IV • Autumn 2026
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide flex items-center gap-1.5">
                <FaCompass className="text-amber-500 text-xs" /> Unfiltered Field Chronicles & Authentic Expeditions
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>68 Countries Documented</span>
              <span>•</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">100% Ground Verified</span>
            </div>
          </div>

          {/* Explorer Stories Reel (Instagram / Editorial Style Strip) */}
          <div className="pt-5 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
              <HiOutlineSparkles className="text-amber-500" /> Active Explorers in the Field
            </p>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
              {explorerReels.map((reel, i) => {
                const targetStory = authenticDispatches.find(s => s.id === reel.storyId);
                return (
                  <button
                    key={i}
                    onClick={() => targetStory && setSelectedStory(targetStory)}
                    className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none cursor-pointer"
                  >
                    <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-sky-500 group-hover:scale-105 transition-transform duration-300 shadow-md">
                      <div className="p-0.5 bg-white dark:bg-slate-900 rounded-full">
                        <img
                          src={reel.avatar}
                          alt={reel.name}
                          className="w-13 h-13 rounded-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-1 right-0 text-[10px] px-1 rounded-md font-black bg-slate-900 text-white border border-white/20">
                        {reel.country}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition-colors">
                      {reel.name}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 -mt-1">
                      {reel.destination}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 2. Compact Headline & Publisher Accreditation Badges ─── */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Real journeys.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
                Told by those who walked them.
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium max-w-2xl mt-2 leading-relaxed">
              No sponsored fluff or artificial filler. Deep essays, camera field notes, local customs, and verified route logs from writers and photographers on the ground.
            </p>
          </div>

          {/* Publisher Seals Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            {editorialPartners.map((pub, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-300 shadow-sm"
                style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.75)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                  color: theme === 'dark' ? '#94a3b8' : '#475569',
                }}
              >
                {pub.name}
              </span>
            ))}
          </div>
        </section>

        {/* ─── 3. Compact Spotlight Masterpiece (Feature of the Week) ─── */}
        {featuredStory && (
          <section>
            <div 
              onClick={() => setSelectedStory(featuredStory)}
              className="group cursor-pointer rounded-[32px] overflow-hidden relative transition-all duration-500 hover:shadow-2xl shadow-xl border"
              style={{
                background: theme === 'dark' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.85)',
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Visual Image Half */}
                <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-[430px] overflow-hidden">
                  <img
                    src={featuredStory.image}
                    alt={featuredStory.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
                  
                  {/* Stamp & Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-lg">
                      Spotlight Dispatch
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md"
                      style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      {featuredStory.publisherSeal}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90 text-xs font-semibold lg:hidden">
                    <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-amber-400" /> {featuredStory.location}</span>
                    <span>{featuredStory.readTime}</span>
                  </div>
                </div>

                {/* Editorial Content Half */}
                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <div className="hidden lg:flex items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <FaMapMarkerAlt /> {featuredStory.location}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">{featuredStory.coordinates}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors tracking-tight leading-snug mb-3">
                      {featuredStory.title}
                    </h2>

                    <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                      {featuredStory.deck}
                    </p>

                    {/* Pull Quote Box */}
                    <div 
                      className="p-4 rounded-2xl mb-6 text-xs font-semibold italic text-slate-700 dark:text-slate-300 flex items-start gap-3 border"
                      style={{
                        background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(245, 158, 11, 0.05)',
                        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(245, 158, 11, 0.2)',
                      }}
                    >
                      <FaQuoteLeft className="text-amber-500 text-sm shrink-0 mt-0.5" />
                      <span>{featuredStory.excerpt}</span>
                    </div>
                  </div>

                  {/* Author & Action Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={featuredStory.author.avatar}
                        alt={featuredStory.author.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 shadow-sm"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {featuredStory.author.name}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {featuredStory.author.role}
                        </p>
                      </div>
                    </div>

                    <ThreeUIButton
                      type="button"
                      variant="amber-glow"
                      size="sm"
                      icon={FaArrowRight}
                      iconPosition="right"
                    >
                      Read Story
                    </ThreeUIButton>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── 4. Search & Filter Bar (Liquid Glass Nav) ─── */}
        <section className="sticky top-20 z-30">
          <div 
            className="p-3 sm:p-4 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-3 transition-all"
            style={{
              background: theme === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(25px) saturate(180%)',
              WebkitBackdropFilter: 'blur(25px) saturate(180%)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: theme === 'dark' ? '0 15px 35px -5px rgba(0,0,0,0.4)' : '0 15px 35px -5px rgba(15,23,42,0.06)',
            }}
          >
            {/* Categories */}
            <SegmentedPillToggle
              options={categories.map(c => ({ id: c, label: c }))}
              activeId={activeCategory}
              onChange={setActiveCategory}
              layoutId="blogCategoriesToggle"
              size="sm"
            />

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
              <input
                type="text"
                placeholder="Search writer, region, gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold outline-none transition-all"
                style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ─── 5. Dense, Highly Visual Stories Grid (No Empty Deserts) ─── */}
        <section>
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredStories.map((story) => {
                const isBookmarked = bookmarkedIds.includes(story.id);
                const isLiked = likedMap[story.id];
                const likeCount = story.likes + (isLiked ? 1 : 0);

                return (
                  <motion.article
                    key={story.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setSelectedStory(story)}
                    className="group cursor-pointer rounded-[28px] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-lg border relative"
                    style={{
                      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.72)',
                      backdropFilter: 'blur(28px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    {/* Visual Card Image */}
                    <div className="relative h-56 w-full overflow-hidden shrink-0">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md"
                          style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                          {story.category}
                        </span>
                      </div>

                      {/* Bookmark Icon */}
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(story.id, e)}
                        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
                        className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 hover:scale-110 shadow-md"
                        style={{
                          background: 'rgba(0,0,0,0.5)',
                          color: isBookmarked ? '#f59e0b' : '#ffffff',
                          border: '1px solid rgba(255,255,255,0.25)'
                        }}
                      >
                        {isBookmarked ? <FaBookmark size={12} /> : <FaRegBookmark size={12} />}
                      </button>

                      {/* Location & Read Time on Image */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-[11px] font-semibold">
                        <span className="flex items-center gap-1.5 drop-shadow">
                          <FaMapMarkerAlt className="text-amber-400" /> {story.location}
                        </span>
                        <span className="flex items-center gap-1 drop-shadow">
                          <FaClock className="text-white/80" /> {story.readTime}
                        </span>
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Camera Gear / Elevation Tag */}
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <FaCamera className="text-amber-500" /> {story.gear.split('•')[0]}
                          </span>
                          <span>{story.date}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors leading-snug tracking-tight mb-2.5 line-clamp-2">
                          {story.title}
                        </h3>

                        {/* Deck/Excerpt */}
                        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-5 line-clamp-2">
                          {story.deck}
                        </p>
                      </div>

                      {/* Author + Likes Footer */}
                      <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={story.author.avatar}
                            alt={story.author.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                              {story.author.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              {story.author.role}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => toggleLike(story.id, e)}
                            className="flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                            style={{ color: isLiked ? '#f43f5e' : '#94a3b8' }}
                          >
                            {isLiked ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
                            <span>{likeCount}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleShare(story, e)}
                            className="text-slate-400 hover:text-amber-500 dark:hover:text-white transition-colors cursor-pointer text-xs p-1"
                            title="Share"
                          >
                            <FaShareAlt />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            /* Never a blank space: helpful empty state with clear filters button */
            <div 
              className="p-12 sm:p-16 text-center rounded-[32px] border"
              style={{
                background: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0,0,0,0.08)',
              }}
            >
              <FaCompass className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-spin-slow" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No dispatches match your query</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                Try searching for a different country, region, or explore all categories.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('All Dispatches'); }}
                className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>

        {/* ─── 6. Compact Contributor & Weekly Field Digest Section ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          
          {/* Become an Explorer Writer Box */}
          <div 
            className="lg:col-span-5 p-7 sm:p-8 rounded-[32px] border flex flex-col justify-between relative overflow-hidden"
            style={{
              background: theme === 'dark' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(28px)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.85)',
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 mb-4">
                <FaGlobeAmericas /> Community Dispatches
              </span>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Have an expedition to share?
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                We publish authentic on-the-ground stories from solo trekkers, food ethnographers, and independent explorers. We compensate contributors and license original photo essays.
              </p>
            </div>

            <ThreeUIButton
              to="/contact"
              variant="specular-dark"
              size="md"
              icon={FaArrowRight}
              iconPosition="right"
              className="w-full sm:w-fit"
            >
              Submit Pitch or Field Diary
            </ThreeUIButton>
          </div>

          {/* Compact Newsletter Bar */}
          <div 
            className="lg:col-span-7 p-7 sm:p-8 rounded-[32px] border flex flex-col justify-between relative overflow-hidden"
            style={{
              background: theme === 'dark' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(28px)',
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.85)',
            }}
          >
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-500/10 mb-4">
                <FaCheckCircle /> The Friday Dispatch
              </span>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Get our curated travel journal weekly
              </h3>

              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-6 max-w-xl">
                One extraordinary story every Friday morning, plus secret flight deals, camera recommendations, and unlisted guesthouses. Never spam.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full sm:flex-1 px-4 py-3.5 rounded-2xl text-xs font-semibold outline-none transition-all"
                style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.04)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
                  color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                }}
              />
              <ThreeUIButton
                type="submit"
                variant="amber-glow"
                size="md"
                className="w-full sm:w-auto shrink-0"
              >
                {newsletterSent ? 'Subscribed ✓' : 'Subscribe to Journal'}
              </ThreeUIButton>
            </form>
          </div>

        </section>

      </div>

      {/* ─── 7. Interactive Liquid Glass Full Story Reader Modal ─── */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStory(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border z-10 no-scrollbar"
              style={{
                background: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)',
                backdropFilter: 'blur(36px)',
                WebkitBackdropFilter: 'blur(36px)',
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.9)',
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                aria-label="Close story"
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-transform active:scale-90"
              >
                <FaTimes size={15} />
              </button>

              {/* Modal Cover Image */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                <img
                  src={selectedStory.image}
                  alt={selectedStory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white">
                      {selectedStory.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                      {selectedStory.publisherSeal}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
                    {selectedStory.title}
                  </h2>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-10 space-y-8">
                
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={selectedStory.author.avatar}
                      alt={selectedStory.author.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-300 dark:border-slate-700"
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {selectedStory.author.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {selectedStory.author.role} • {selectedStory.author.credentials}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Like / Bookmark / Share) */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleLike(selectedStory.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-colors cursor-pointer"
                      style={{
                        background: likedMap[selectedStory.id] ? 'rgba(244,63,94,0.1)' : 'rgba(0,0,0,0.03)',
                        borderColor: likedMap[selectedStory.id] ? 'rgba(244,63,94,0.3)' : 'rgba(0,0,0,0.1)',
                        color: likedMap[selectedStory.id] ? '#f43f5e' : 'inherit'
                      }}
                    >
                      {likedMap[selectedStory.id] ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
                      <span>{selectedStory.likes + (likedMap[selectedStory.id] ? 1 : 0)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(selectedStory.id)}
                      className="p-2.5 rounded-2xl text-xs border transition-colors cursor-pointer"
                      style={{
                        background: bookmarkedIds.includes(selectedStory.id) ? 'rgba(245,158,11,0.1)' : 'rgba(0,0,0,0.03)',
                        borderColor: bookmarkedIds.includes(selectedStory.id) ? 'rgba(245,158,11,0.3)' : 'rgba(0,0,0,0.1)',
                        color: bookmarkedIds.includes(selectedStory.id) ? '#f59e0b' : 'inherit'
                      }}
                      title="Bookmark"
                    >
                      {bookmarkedIds.includes(selectedStory.id) ? <FaBookmark /> : <FaRegBookmark />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(selectedStory)}
                      className="p-2.5 rounded-2xl text-xs border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Share"
                    >
                      <FaShareAlt />
                    </button>
                  </div>
                </div>

                {/* Field Notes Quick Pill Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Location & GPS</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">{selectedStory.location}</p>
                    <p className="font-mono text-[10px] text-slate-500">{selectedStory.coordinates}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Camera Gear</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">{selectedStory.gear}</p>
                    <p className="text-[10px] text-slate-500">Natural Lighting</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Elevation</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{selectedStory.elevation}</p>
                    <p className="text-[10px] text-slate-500">{selectedStory.readTime}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Best Season</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">{selectedStory.fieldNotes.bestSeason}</p>
                    <p className="text-[10px] text-emerald-500 font-bold">{selectedStory.fieldNotes.difficulty.split('•')[0]}</p>
                  </div>
                </div>

                {/* Ambient Sound Simulator Pill */}
                <div 
                  className="p-3.5 rounded-2xl flex items-center justify-between border"
                  style={{
                    background: theme === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(254, 243, 199, 0.5)',
                    borderColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAudioPlaying(!isAudioPlaying);
                        addToast(isAudioPlaying ? 'Field sound paused' : `Now playing field audio: ${selectedStory.fieldNotes.soundscape}`, 'info');
                      }}
                      className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      {isAudioPlaying ? <FaVolumeUp size={14} /> : <FaVolumeMute size={14} />}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {isAudioPlaying ? 'Field Audio Active (Ambient)' : 'Play Field Recording'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {selectedStory.fieldNotes.soundscape}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold hidden sm:inline">
                    Binaural 48kHz
                  </span>
                </div>

                {/* Story Content Paragraphs */}
                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
                  {selectedStory.content.map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Bottom Curated Itinerary Prompt */}
                <div 
                  className="p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4"
                  style={{
                    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(248, 250, 252, 0.9)',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Inspired to visit {selectedStory.location}?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Explore live flight routes, boutique stays, and generate an AI itinerary for this region.
                    </p>
                  </div>

                  <Link
                    to="/itinerary"
                    onClick={() => setSelectedStory(null)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md shadow-amber-500/20 whitespace-nowrap transition-all"
                  >
                    Build AI Itinerary →
                  </Link>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Blog;