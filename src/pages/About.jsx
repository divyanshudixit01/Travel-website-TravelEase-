import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaGlobeAmericas, FaShieldAlt, FaLeaf, FaRocket, 
  FaTimes, FaChevronRight, FaCompass, FaTrain, 
  FaWater, FaMountain, FaTree, FaHandsHelping, 
  FaCheckCircle, FaAward, FaSeedling, FaSun, 
  FaArrowRight, FaLinkedin, FaTwitter, FaGithub, 
  FaQuoteLeft, FaHeart, FaRecycle, FaChartLine,
  FaRoute, FaBolt
} from 'react-icons/fa';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getPersonSchema } from '../utils/schemas';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';

// Real Environmental & Nature Causes impacting India
const environmentalCauses = [
  {
    id: 'himalayas',
    title: 'Himalayan Glacial & Biosphere Shield',
    subtitle: 'Protecting High-Altitude Slopes & Zero-Waste Sacred Trails',
    tag: 'Mountain Ecosystems',
    region: 'Uttarakhand, Himachal & Ladakh',
    impactStat: '42,000+ kg',
    statLabel: 'High-Altitude Trash Recovered',
    accentColor: 'from-sky-500 to-indigo-600',
    badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-400/30',
    description: 'The Himalayan ranges supply freshwater to over 500 million people across South Asia. Unchecked mass tourism strains fragile alpine meadows and glacial headwaters. TravelEase implements strict zero-waste trekking standards, funds local Sherpa cleanup patrols, and distributes hikers to emerging sustainable homestays.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000&auto=format&fit=crop',
    icon: FaMountain,
    metrics: [
      { label: 'Alpine Trails Monitored', value: '180+ Trails' },
      { label: 'High-Pass Sherpas Supported', value: '1,250 Guides' },
      { label: 'Plastic Banned Corridors', value: '100% Zero-Single-Use' }
    ]
  },
  {
    id: 'rivers',
    title: 'Sacred Waters & Marine Rejuvenation',
    subtitle: 'Preserving the Holy Ganga, Sacred Ghats & Pristine Coastlines',
    tag: 'Aquatic Stewardship',
    region: 'Varanasi, Rishikesh, Goa & Kerala',
    impactStat: '18,500 kg',
    statLabel: 'River & Beach Plastics Intercepted',
    accentColor: 'from-teal-400 to-emerald-600',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
    description: 'From the sacred evening aarti on the Ganga to the delicate coral fringes of Malvan and the Andaman Sea, Indian waters are life itself. TravelEase partners directly with traditional wooden boat guilds in Varanasi to retrofit electric quiet motors and sponsors community coastal cleanups across Goa and Kerala.',
    image: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=2000&auto=format&fit=crop',
    icon: FaWater,
    metrics: [
      { label: 'Solar/Electric Boats Converted', value: '85+ Boats' },
      { label: 'Riverbank Cleanups Completed', value: '320+ Drives' },
      { label: 'Water Refill Stations Installed', value: '450+ Points' }
    ]
  },
  {
    id: 'ghats',
    title: 'Western Ghats & Tiger Corridors',
    subtitle: 'Safeguarding UNESCO World Biodiversity Hotspots',
    tag: 'Wildlife & Forest Canopy',
    region: 'Nilgiris, Periyar, Bandipur & Coorg',
    impactStat: '35,000+',
    statLabel: 'Native Endemic Trees Planted',
    accentColor: 'from-emerald-500 to-lime-600',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    description: 'Older than the Himalayas, the Western Ghats shelter more than 300 globally threatened species. We work with indigenous naturalists to ensure every wildlife safari respects safe animal corridors, anti-poaching watchtowers, and rainwater percolation pits that recharge parched valley aquifers.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2000&auto=format&fit=crop',
    icon: FaTree,
    metrics: [
      { label: 'Elephant Corridors Buffered', value: '14 Corridors' },
      { label: 'Indigenous Forest Trackers', value: '400+ Naturalists' },
      { label: 'Canopy Reforestation Area', value: '1,200 Acres' }
    ]
  },
  {
    id: 'rail',
    title: 'Green Rail Decarbonization (Vande Bharat First)',
    subtitle: 'Slashing 78% of Intercity Travel Emissions via Indian Railways',
    tag: 'Low-Carbon Transit',
    region: 'Pan-India Rail Network',
    impactStat: '2,400+ Tons',
    statLabel: 'CO2 Mitigated vs Domestic Flights',
    accentColor: 'from-amber-400 to-orange-600',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    description: 'Short-haul flights produce up to 5 times more greenhouse gases per passenger than electrified high-speed rail. TravelEase is the first platform in India to algorithmically prioritize IRCTC Vande Bharat Express corridors, pairing scenic rail voyages with electric first-and-last-mile chauffeurs.',
    image: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?q=80&w=2000&auto=format&fit=crop',
    icon: FaTrain,
    metrics: [
      { label: 'CO2 Slashed per Corridor', value: '-78% Avg' },
      { label: 'Vande Bharat Routes Synced', value: '54+ Corridors' },
      { label: 'EV Station Pickups Available', value: '120+ Hubs' }
    ]
  },
  {
    id: 'community',
    title: 'Rural Custodians & Living Handlooms',
    subtitle: 'Direct Livelihoods for Indigenous Artisans, Boatmen & Homestays',
    tag: 'Socio-Cultural Heritage',
    region: 'Kutch, Varanasi, Chettinad & Spiti',
    impactStat: '₹1.8 Cr+',
    statLabel: 'Direct Fair-Wage Revenue Transferred',
    accentColor: 'from-rose-500 to-purple-600',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
    description: 'True preservation cannot occur without economic justice for the native caretakers of our culture. We eliminate commercial middlemen: 100% of village tour fees, pottery workshops, and homestay tariffs go directly into the hands of local artisans, women-led cooperatives, and rural families.',
    image: 'https://images.unsplash.com/photo-1609949279531-cf48d64bed89?q=80&w=2000&auto=format&fit=crop',
    icon: FaHandsHelping,
    metrics: [
      { label: 'Artisan Families Partnered', value: '2,800+ Families' },
      { label: 'Women Self-Help Groups Supported', value: '140+ SHGs' },
      { label: 'Middleman Commission', value: '0% True Direct' }
    ]
  }
];

// Executive Leadership Team
const leadershipTeam = [
  {
    id: 1,
    name: 'Divyanshu Dixit',
    role: 'Founder & Chief Executive Officer (CEO)',
    title: 'Visionary Architect & Ecological Strategist',
    expertise: 'Sustainable Travel Tech, Dynamic Computing & National Eco-Tourism Alliances',
    quote: 'Travel must never be an extraction from nature or heritage. Through dynamic real-time computing and deep empathy for our soil, TravelEase ensures every expedition regenerates India’s ecosystems and celebrates our local custodians.',
    bio: 'Divyanshu founded TravelEase with a radical conviction: modern travel planning was broken, extractive, and disconnected from the land. With a background in distributed systems and sustainable tourism architecture, he spearheads our mission to harmonize real-time travel intelligence with on-the-ground ecological conservation across India. Divyanshu has established direct partnerships with Indian Railways (IRCTC), state biodiversity boards, and remote village homestay networks to ensure our technology generates lasting environmental and economic wealth for local communities.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    pillars: ['Regenerative Tourism', 'Dynamic Live Architecture', 'Zero Middleman Heritage'],
    linkedin: '#',
    twitter: '#',
    github: '#'
  },
  {
    id: 2,
    name: 'Anuj Kumar',
    role: 'Co-Founder & Chief Technology Officer (CTO)',
    title: 'Dynamic Intelligence & Low-Carbon Routing Architect',
    expertise: 'Distributed Systems, Real-Time Geospatial Engines & Predictive Travel Telemetry',
    quote: 'Every line of code and every algorithm we build is engineered to optimize human connection while minimizing planetary friction and carbon footprint.',
    bio: 'Anuj is the architectural mastermind behind TravelEase’s proprietary real-time dynamic engine. Former principal infrastructure engineer with deep expertise in low-latency distributed networks, Anuj designed our live multi-modal travel engine that dynamically coordinates live flight schedules, IRCTC train corridors, OpenStreetMap geocoding, and live Open-Meteo weather models in under 50 milliseconds. He pioneered TravelEase’s Green Route Scoring system, which calculates carbon impact per kilometer and intelligently surfaces electrified rail journeys over fossil-heavy transit.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    pillars: ['Real-Time Compute', 'Carbon-Aware Routing', 'Autonomous Geospatial AI'],
    linkedin: '#',
    twitter: '#',
    github: '#'
  },
  {
    id: 3,
    name: 'Kartik Mishra',
    role: 'Co-Founder & Chief Product Officer (CPO)',
    title: 'Regenerative Product Experience & Eco-Sanctuary Director',
    expertise: 'Human-Centered Design, Sustainable Hospitality & Boutique Heritage Curation',
    quote: 'We design experiences that do not simply book vacations, but instill deep reverence for our sacred landscapes, temples, rivers, and living communities.',
    bio: 'Kartik leads product experience, traveler empathy, and sustainable partner curation across the TravelEase ecosystem. With an obsessive eye for detail and extensive fieldwork across India’s fragile biosphere reserves—from Spiti Valley to the Nilgiris—Kartik created the TravelEase Eco-Sanctuary Standard. This rigorous audit certifies accommodations based on renewable energy use, rainwater harvesting, organic zero-waste kitchens, and fair local employment.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    pillars: ['Eco-Sanctuary Audit', 'Regenerative UX', 'Sacred Heritage Curation'],
    linkedin: '#',
    twitter: '#',
    github: '#'
  },
  {
    id: 4,
    name: 'Vinayak',
    role: 'Co-Founder & Head of Operations & Field Sanctuaries',
    title: 'Ground Network General & Zero-Waste Expedition Commander',
    expertise: 'Field Operations, Local Guide Cooperatives, High-Altitude Safety & Supply Chains',
    quote: 'The true soul of India beats in the hearts of our native guides, high-altitude sherpas, and rural artisans. Our duty is to back them with unflinching honor and safety.',
    bio: 'Vinayak oversees TravelEase’s extensive boots-on-the-ground operational backbone, commanding an active network of 3,500+ verified native guides, IRCTC station concierges, high-altitude rescue specialists, and rural homestay hosts. An avid mountaineer and logistics veteran, Vinayak established TravelEase’s zero-plastic expedition protocol and emergency response framework, guaranteeing 100% fair compensation paid instantly to field guides without platform cuts.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
    pillars: ['3,500+ Verified Guides', 'Zero-Plastic Protocols', 'Rapid Field Response'],
    linkedin: '#',
    twitter: '#',
    github: '#'
  },
  {
    id: 5,
    name: 'Kshitiz',
    role: 'Co-Founder & VP of Environmental Advocacy & Growth',
    title: 'National Conservation Alliances & Youth Eco-Tourism Lead',
    expertise: 'Environmental Policy, Swachh Bharat Travel Initiatives & Transparent Carbon Offsets',
    quote: 'Sustainable travel is no longer a luxury choice—it is a generational responsibility. We are igniting a nationwide youth movement to explore consciously.',
    bio: 'Kshitiz steers TravelEase’s nationwide environmental impact programs, public advocacy campaigns, and youth eco-tourism initiatives. Working hand-in-hand with conservation NGOs, forest departments, and river rejuvenation organizations, Kshitiz orchestrates our 1% For Nature fund. Every booking on TravelEase automatically channels verified micro-grants to grassroots afforestation in the Western Ghats, cleanup drives along the Ganges riverbank, and coastal mangrove restoration.',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    pillars: ['1% For Nature Fund', 'Ganga Cleanup Alliances', 'Youth Eco-Movement'],
    linkedin: '#',
    twitter: '#',
    github: '#'
  }
];

// Interactive Carbon & Nature Impact Calculator Data
const transitOptions = [
  { id: 'train', name: 'IRCTC Vande Bharat Express', co2Kg: 18, ecoScore: 'A+ (Elite Green)', savingsPercent: 78, icon: FaTrain },
  { id: 'ev', name: 'Electric Intercity Express', co2Kg: 24, ecoScore: 'A (Clean Mobility)', savingsPercent: 70, icon: FaBolt },
  { id: 'flight', name: 'Standard Domestic Flight', co2Kg: 110, ecoScore: 'D (High Carbon)', savingsPercent: 0, icon: FaRocket },
];

export const About = () => {
  const [activeCauseIndex, setActiveCauseIndex] = useState(0);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedTransit, setSelectedTransit] = useState(transitOptions[0]);
  const [travelerCount, setTravelerCount] = useState(2);
  const [tripDistanceKm, setTripDistanceKm] = useState(650);

  const heroRef = useRef(null);

  const activeCause = environmentalCauses[activeCauseIndex];

  // Auto-cycle through real environmental causes smoothly if user is idle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCauseIndex((prev) => (prev + 1) % environmentalCauses.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const totalCo2Emitted = Math.round(selectedTransit.co2Kg * (tripDistanceKm / 500) * travelerCount);
  const totalCo2Saved = Math.max(0, Math.round((transitOptions[2].co2Kg - selectedTransit.co2Kg) * (tripDistanceKm / 500) * travelerCount));
  const treesSupported = Math.max(1, Math.round(totalCo2Saved / 15));
  const localRupeesFunded = Math.round(travelerCount * (tripDistanceKm * 0.8));

  const aboutSchemas = [
    getWebPageSchema({
      type: 'AboutPage',
      name: 'About TravelEase — Dynamic Travel & Environmental Stewardship in India',
      description: 'Discover how TravelEase transforms travel in India through real-time dynamic computing, green rail mobility, and deep ecological restoration across the Himalayas, Ganges, and Western Ghats.',
      url: '/about',
      breadcrumb: true,
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'About Us' },
    ], '/about'),
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TravelEase',
      founder: {
        '@type': 'Person',
        name: 'Divyanshu Dixit'
      },
      foundingDate: '2024',
      description: 'Next-generation multi-modal travel platform committed to regenerative tourism and environmental conservation in India.'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'TravelEase Executive Leadership Team',
      itemListElement: leadershipTeam.map((leader, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: getPersonSchema({
          name: leader.name,
          jobTitle: leader.role,
          image: leader.image,
          description: leader.bio
        })
      }))
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#06080d] text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden" id="about-page">
      <JsonLd data={aboutSchemas} />

      {/* ============================================================
          1. DYNAMIC HERO SECTION WITH REAL IMAGES & REAL CAUSES
          ============================================================ */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col justify-between pt-24 pb-16 overflow-hidden">
        {/* Dynamic Background Image with Animated Fade Transition */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCause.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <img
                src={activeCause.image}
                alt={activeCause.title}
                className="w-full h-full object-cover object-center brightness-[0.75] dark:brightness-[0.45] contrast-[1.05]"
              />
              {/* Deep cinematic scrim ensures crystal-clear readability in both light & dark mode */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent"></div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hero Top Motive Pill */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap items-center gap-3 mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 shadow-2xl backdrop-blur-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <FaLeaf className="text-emerald-400 text-xs" />
              <span className="text-xs font-mono font-black uppercase tracking-widest text-emerald-300">
                Regenerative Tourism for India
              </span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white/90 border border-white/20 text-xs font-mono backdrop-blur-md">
              <FaGlobeAmericas className="text-amber-400 text-xs" />
              <span>Real-Time Dynamic Travel Engine</span>
            </div>
          </motion.div>

          {/* Dynamic Cause Main Headline */}
          <div className="max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCause.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -25 }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-block mb-3">
                  <span className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${activeCause.badgeColor} backdrop-blur-md`}>
                    {causeTag(activeCause)}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-5 drop-shadow-2xl">
                  {activeCause.title}
                </h1>

                <p className="text-base sm:text-xl text-slate-100/90 font-medium leading-relaxed max-w-3xl mb-8 drop-shadow-lg">
                  {activeCause.description}
                </p>

                {/* Hero Cause Telemetry Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-white/25 text-white backdrop-blur-xl shadow-2xl">
                    <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400 mb-0.5">
                      {activeCause.impactStat}
                    </div>
                    <div className="text-[11px] font-mono text-slate-200 uppercase tracking-wider font-semibold">
                      {activeCause.statLabel}
                    </div>
                  </div>

                  {activeCause.metrics.map((met, idx) => (
                    <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-black/50 border border-white/25 text-white backdrop-blur-xl shadow-2xl">
                      <div className="text-lg sm:text-xl font-mono font-bold text-emerald-300 mb-0.5">
                        {met.value}
                      </div>
                      <div className="text-[11px] font-mono text-slate-200 uppercase tracking-wider font-semibold">
                        {met.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <ThreeUIButton to="/explore" variant="liquid-metal" size="lg" icon={FaCompass} iconPosition="right">
                Explore Interactive Map
              </ThreeUIButton>

              <a
                href="#causes-section"
                className="px-6 py-3.5 rounded-full glass-smoke border border-white/30 text-white hover:bg-white/20 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Discover All 5 Causes</span>
                <FaArrowRight className="text-amber-400 text-xs" />
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic Cause Switcher Pill Bar (Pinned at Hero Bottom) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12">
          <div className="p-2 sm:p-2.5 rounded-3xl bg-slate-900/80 dark:bg-black/80 backdrop-blur-2xl border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between px-3 py-1.5 mb-1 text-[11px] font-mono font-bold text-slate-300">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <FaSeedling className="text-emerald-400" /> Interactive Cause Selector:
              </span>
              <span className="text-amber-400">
                {activeCauseIndex + 1} of {environmentalCauses.length} Protected Zones
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {environmentalCauses.map((cause, idx) => {
                const IconComponent = cause.icon;
                const isActive = activeCauseIndex === idx;
                return (
                  <button
                    key={cause.id}
                    type="button"
                    onClick={() => setActiveCauseIndex(idx)}
                    className={`text-left p-2.5 sm:p-3 rounded-2xl transition-all flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg scale-[1.02]'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/5'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-white/10 text-amber-300'
                    }`}>
                      <IconComponent className="text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono font-black truncate">{cause.tag}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                        {cause.region}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. THE TRAVELEASE DYNAMIC MOTIVE & NATURE PHILOSOPHY
          ============================================================ */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold uppercase tracking-wider border border-amber-500/20">
              <FaRecycle className="text-sm" /> The TravelEase Dynamic Manifesto
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Traditional Travel Exploits.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500">
                TravelEase Regenerates.
              </span>
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              India boasts some of the most sacred rivers, towering mountain pinnacles, and ancient spiritual monuments on Earth. Yet conventional tourism platforms funnel millions of travelers into the same crowded pinch-points, overwhelming local waste infrastructure, inflating living costs for locals, and eroding delicate ecosystems.
            </p>

            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              We built TravelEase to pioneer <strong className="text-slate-900 dark:text-white">Dynamic Regenerative Exploration</strong>. By leveraging real-time geospatial computing, live Open-Meteo weather intelligence, and live IRCTC rail connectivity, our platform gently redistributes travel volume away from overburdened hubs toward authentic, certified rural homestays and community cooperatives.
            </p>

            {/* Core Motive Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">1% Direct</div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">Funded into Local Eco-Restoration</div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">0% Middleman</div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">Village Guild Earnings Retained</div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm col-span-2 sm:col-span-1">
                <div className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400">100% Carbon</div>
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">Calculated & Compensated Paths</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"
                alt="Pristine Nature"
                className="w-full h-[520px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>

              {/* Floating Live Telemetry Cards over Image */}
              <div className="absolute top-6 right-6 glass-frost px-4 py-2 rounded-2xl border border-white/20 text-white font-mono text-xs shadow-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Pan-India Live Carbon Telemetry</span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-mono font-black uppercase">
                  <FaShieldAlt /> Biosphere Protection Commitment
                </div>
                <h3 className="text-2xl font-black">Empowering 3,500+ Native Guardians</h3>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  Every booking is verified against local ecological capacity thresholds. We ensure that our presence enriches the local flora, cleans up the sacred ghats, and preserves tribal heritage for centuries to come.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            3. REAL ENVIRONMENTAL CAUSES & NATURE IMPACT (DEEP-DIVE GRID)
            ============================================================ */}
        <div id="causes-section" className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
              <FaTree className="text-sm" /> Five Pillars of National Impact
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Real Causes. Measurable Impact on India’s Nature.
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              We do not treat sustainability as a marketing catchphrase. Here are the five real environmental causes we actively support through every trip booked on TravelEase.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {environmentalCauses.map((cause, idx) => {
              const CauseIcon = cause.icon;
              return (
                <motion.div
                  key={cause.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-3xl overflow-hidden bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/10 hover:border-amber-400/80 transition-all duration-300 shadow-lg flex flex-col justify-between group"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={cause.image}
                      alt={cause.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-mono text-[11px] font-bold border border-white/20">
                        {cause.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <CauseIcon className="text-amber-400 text-sm" />
                        <span className="text-xs font-mono font-bold text-slate-300">{cause.region}</span>
                      </div>
                      <h3 className="text-lg font-black tracking-tight">{cause.title}</h3>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {cause.subtitle}
                    </p>

                    <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-xl font-mono font-black text-amber-600 dark:text-amber-400">{cause.impactStat}</div>
                        <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">{cause.statLabel}</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-500">
                        <FaAward className="text-lg" />
                      </div>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                      {cause.metrics.map((m, mIdx) => (
                        <li key={mIdx} className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-500 dark:text-slate-400">{m.label}:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{m.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            4. INTERACTIVE CARBON & NATURE IMPACT SIMULATOR
            ============================================================ */}
        <div className="mb-28 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0e1726] to-emerald-950 text-white border border-white/15 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider mb-3 border border-emerald-500/30">
              <FaChartLine /> Live Ecological Simulator
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              Calculate Your Environmental Footprint
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Test how choosing electrified Indian Railways (IRCTC Vande Bharat) over air travel directly preserves India’s clean air, supports afforestation, and funds local village custodians.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Select Transit Mode:
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {transitOptions.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = selectedTransit.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedTransit(opt)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg scale-102'
                            : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <OptIcon className="text-base" />
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/30 text-white font-bold">
                            {opt.ecoScore.split(' ')[0]}
                          </span>
                        </div>
                        <div className="text-xs font-bold leading-tight">{opt.name}</div>
                        <div className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                          {opt.co2Kg} kg CO2/500km
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-mono font-bold text-slate-300 mb-1">
                    <span>Expedition Distance:</span>
                    <span className="text-amber-400 font-black">{tripDistanceKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="2200"
                    step="50"
                    value={tripDistanceKm}
                    onChange={(e) => setTripDistanceKm(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-white/20 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span>Delhi-Varanasi (780km)</span>
                    <span>Kashmir-Kanyakumari</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono font-bold text-slate-300 mb-1">
                    <span>Traveler Party Size:</span>
                    <span className="text-amber-400 font-black">{travelerCount} Explorers</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={travelerCount}
                    onChange={(e) => setTravelerCount(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-white/20 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span>Solo Explorer</span>
                    <span>10 Group Expedition</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Live Computation Telemetry Box */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">Live Eco Computation</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-400/30">
                  {selectedTransit.ecoScore}
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Estimated Carbon Output:</span>
                  <span className="font-extrabold text-amber-400 text-sm">{totalCo2Emitted} kg CO2</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300">CO2 Slashed vs Flight:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">-{totalCo2Saved} kg (-{selectedTransit.savingsPercent}%)</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Trees Equivalent Protected:</span>
                  <span className="font-extrabold text-teal-300 text-sm">~{treesSupported} Native Trees</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Direct Eco-Fund Channeled:</span>
                  <span className="font-extrabold text-amber-300 text-sm">₹{localRupeesFunded.toLocaleString('en-IN')} INR</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  💡 By booking Vande Bharat through TravelEase, your expedition actively mitigates carbon while funding native riverbank cleanups and local guide families.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            5. EXECUTIVE LEADERSHIP TEAM (5 LEADERS)
            ============================================================ */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-4 border border-amber-500/20">
              <FaAward className="text-sm" /> Executive Leadership
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Meet the Minds Behind TravelEase
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Founded and led by passionate engineers, environmental advocates, and field operations pioneers dedicated to redefining how humanity discovers India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {leadershipTeam.map((leader, idx) => (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedLeader(leader)}
                className="rounded-3xl overflow-hidden bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-amber-400/80 shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Photo & Role Card */}
                <div>
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90"></div>

                    <div className="absolute top-4 right-4">
                      <span className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-amber-400 font-mono text-xs font-black flex items-center justify-center border border-white/20">
                        0{leader.id}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <h3 className="text-2xl font-black tracking-tight">{leader.name}</h3>
                      <p className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mt-0.5">
                        {leader.role}
                      </p>
                    </div>
                  </div>

                  {/* Body Brief */}
                  <div className="p-6 space-y-3">
                    <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 line-clamp-1">
                      {leader.title}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">
                      {leader.quote}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {leader.pillars.map((pil, pIdx) => (
                        <span
                          key={pIdx}
                          className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                        >
                          {pil}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors">
                  <span>View Full Executive Profile</span>
                  <FaChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ============================================================
            6. MILESTONES & ROADMAP TO 2030
            ============================================================ */}
        <div className="mb-24 p-8 sm:p-14 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-400 mb-2 block">
              Historical Timeline
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mb-3">Our Journey So Far</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              From an audacious idea born out of the sacred ghats of Varanasi to India’s most technologically advanced conscious travel platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {[
              {
                year: '2024',
                title: 'The Clean Travel Inception',
                desc: 'Founded by Divyanshu Dixit and the core engineering team with the singular mission of solving overtourism and empowering local Indian custodians.',
                icon: FaRocket
              },
              {
                year: '2025',
                title: 'Dynamic Rail Engine Launch',
                desc: 'Unveiled the first real-time multi-modal routing engine integrating IRCTC Vande Bharat express corridors with live weather and low-carbon dispatchers.',
                icon: FaTrain
              },
              {
                year: '2026',
                title: '500,000+ Explorers & 1% Fund',
                desc: 'Empowering over half a million conscious travelers while channeling 1% of every booking to high-altitude Himalayan cleanups and Western Ghats afforestation.',
                icon: FaLeaf
              }
            ].map((m, idx) => {
              const MilestoneIcon = m.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-mono font-black text-amber-400">{m.year}</span>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                        <MilestoneIcon className="text-lg" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{m.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            7. CALL TO ACTION: START YOUR CONSCIOUS EXPEDITION
            ============================================================ */}
        <div className="text-center max-w-4xl mx-auto py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-6 border border-emerald-500/20">
            <FaRoute className="text-sm" /> Join the Conscious Movement
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
            Ready to Experience India Responsibly?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
            Explore world-class destinations on our live interactive map, sync your next journey with electrified rail corridors, and leave the land richer than you found it.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <ThreeUIButton to="/explore" variant="amber-glow" size="lg" icon={FaCompass} iconPosition="right">
              Open Interactive World Map
            </ThreeUIButton>

            <Link
              to="/itinerary"
              className="px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl active:scale-95 flex items-center gap-2"
            >
              <span>Plan Custom Itinerary</span>
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          8. EXECUTIVE LEADER DETAILED BIO MODAL
          ============================================================ */}
      <AnimatePresence>
        {selectedLeader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedLeader(null)}
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0f1422] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setSelectedLeader(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
                <img
                  src={selectedLeader.image}
                  alt={selectedLeader.name}
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg border border-white/20 shrink-0"
                />
                <div>
                  <div className="text-[11px] font-mono font-bold text-amber-500 uppercase tracking-wider mb-0.5">
                    {selectedLeader.role}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black">{selectedLeader.name}</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold mt-1">
                    {selectedLeader.title}
                  </p>
                </div>
              </div>

              {/* Quote Card */}
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 mb-6 flex gap-3">
                <FaQuoteLeft className="text-amber-500 text-lg shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed">
                  "{selectedLeader.quote}"
                </p>
              </div>

              {/* Full Bio */}
              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                  Executive Background & Ecological Mission
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedLeader.bio}
                </p>

                <div className="pt-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase block mb-2">Core Strategic Focus:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedLeader.pillars.map((pil, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-slate-300"
                      >
                        ✓ {pil}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connect Direct */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Leadership Network</span>
                <div className="flex gap-2">
                  <a
                    href={selectedLeader.linkedin}
                    className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"
                    title="LinkedIn"
                  >
                    <FaLinkedin />
                  </a>
                  <a
                    href={selectedLeader.twitter}
                    className="w-9 h-9 rounded-xl bg-sky-400/10 text-sky-400 flex items-center justify-center hover:bg-sky-400 hover:text-white transition-all"
                    title="Twitter"
                  >
                    <FaTwitter />
                  </a>
                  <a
                    href={selectedLeader.github}
                    className="w-9 h-9 rounded-xl bg-slate-800/10 dark:bg-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    title="GitHub"
                  >
                    <FaGithub />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper for cause tag badge text
function causeTag(cause) {
  return `${cause.tag} · ${cause.region}`;
}

export default About;