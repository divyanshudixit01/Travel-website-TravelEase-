import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SegmentedPillToggle } from '../ui/ThreeUIToggle';
import { FaHistory, FaCheckCircle, FaTrain } from 'react-icons/fa';
import { VandeBharatFrontIcon, BulletTrain320Icon } from './RailwayIcons';

// ─── Tab Definitions ─────────────────────────────────────────────
const STORY_TABS = [
  { id: 'heritage', label: '1853–2002 Heritage', icon: FaHistory },
  { id: 'modern', label: 'Make in India Era', icon: VandeBharatFrontIcon },
  { id: 'future', label: '2026–2030 Horizon', icon: BulletTrain320Icon },
  { id: 'locomotives', label: 'Locomotive Fleet', icon: FaTrain },
];

// ─── Data: 1853 to 2002 Milestones ──────────────────────────────
const HERITAGE_MILESTONES = [
  {
    year: '1853',
    title: 'The First Whistle · Bori Bunder to Thane',
    badge: 'Birth of Indian Railways',
    description: 'On 16 April 1853 at 3:35 PM, 3 steam locomotives—Sindh, Sultan, and Sahib—hauled 14 carriages and 400 passengers across 34 km, starting Asia’s largest rail network.',
    image: '/images/trains/ir_fairy_queen.jpg',
    stat: '34 km First Journey'
  },
  {
    year: '1855',
    title: 'The Fairy Queen (EIR-22)',
    badge: 'Guinness World Record',
    description: 'Constructed in Leeds, UK, the legendary Fairy Queen is the world’s oldest operating steam locomotive still running on mainlines for heritage journeys.',
    image: '/images/trains/ir_fairy_queen.jpg',
    stat: 'World’s Oldest Active Steam'
  },
  {
    year: '1903',
    title: 'Mountain Railways of India',
    badge: 'UNESCO World Heritage',
    description: 'Engineering masterpieces: Darjeeling Himalayan Railway (1881), Kalka–Shimla (1903), and Nilgiri Mountain Railway (1908, rack & pinion) conquering precipitous peaks.',
    image: '/images/trains/ir_darjeeling_toy_train.jpg',
    stat: '2,076m Altitude Climbed'
  },
  {
    year: '1925',
    title: 'First Electric Train in Asia',
    badge: '1500V DC Traction',
    description: 'On 3 February 1925, Indian Railways launched electric suburban trains between Victoria Terminus and Kurla, laying the foundation for Mumbai’s 7.5 million daily commuters.',
    image: '/train-hero-sunset.jpg',
    stat: 'Asia’s First Electric Rail'
  },
  {
    year: '1969',
    title: 'The Rajdhani Revolution',
    badge: 'High-Speed Luxury',
    description: 'Howrah Rajdhani Express set a new benchmark connecting Kolkata to New Delhi with fully air-conditioned coaches, onboard meals, and top speeds of 120 km/h.',
    image: '/train-hero.jpg',
    stat: '1,450 km Overnight Run'
  },
  {
    year: '2002',
    title: 'IRCTC Digital Revolution',
    badge: 'World’s Largest E-Booking',
    description: 'From just 27 tickets booked on day one in 2002 to processing over 1.4 million confirmed passenger reservations every 24 hours today.',
    image: '/train-hero-alpine.jpg',
    stat: '1.4M+ Daily Digital Tickets'
  }
];

// ─── Data: Modern Make in India Era ─────────────────────────────
const MODERN_MARVELS = [
  {
    title: 'Vande Bharat Express (Train 18)',
    speed: '160–180 km/h',
    badge: 'Indigenous Semi-High Speed',
    image: '/images/trains/ir_vande_bharat.jpg',
    description: 'Engineered at ICF Chennai under Make in India, featuring distributed electric traction, 180° rotating executive seats, bio-vacuum toilets, and airplane-standard sound damping.',
    points: [
      'Accelerates 0 to 100 km/h in just 52 seconds',
      'Intelligent automatic sensor-controlled sliding doors',
      'Pneumatic suspension ensuring smooth glass-of-water stability',
      'Emergency talkback to train conductor and driver'
    ]
  },
  {
    title: 'KAVACH SIL-4 Collision Protection Shield',
    speed: 'Microsecond Reaction',
    badge: 'Zero Collision Safety Shield',
    image: '/images/trains/ir_vande_bharat.jpg',
    description: 'India’s indigenous Automatic Train Protection (ATP) certified at Safety Integrity Level 4. Constantly calculates track distance via ultra-high radio frequencies to prevent head-on or rear-end collisions.',
    points: [
      'Automatic brake application if red signal passed (anti-SPAD)',
      'Direct RFID track sensors providing millimeter precision',
      'Automated dense fog audio-visual signal display in loco cab',
      '3 km emergency broadcast beacon to nearby trains'
    ]
  },
  {
    title: 'Namo Bharat & RapidX Regional Rail',
    speed: '160 km/h Regional Transit',
    badge: 'Next-Gen Commuter Speed',
    image: '/images/trains/ir_bullet_train_future.jpg',
    description: 'Transforming intercity regional connectivity across Delhi–NCR (Meerut corridor), linking suburban towns to city centers with European-style high-frequency transit.',
    points: [
      'Dedicated high-speed tracks with 15-minute intervals',
      'Level boarding with platform screen doors for passenger safety',
      'Premium business class coaches with Wi-Fi and laptop charging',
      'Cuts 82 km travel time down to under 50 minutes'
    ]
  }
];

// ─── Data: 2026–2030 Horizon ─────────────────────────────────────
const FUTURE_HORIZONS = [
  {
    title: 'Mumbai–Ahmedabad Bullet Train (MAHSR)',
    speed: '320 km/h',
    badge: 'High-Speed Rail (Shinkansen E5)',
    image: '/images/trains/ir_bullet_train_future.jpg',
    description: 'India’s flagship high-speed rail corridor linking Mumbai to Ahmedabad in 1 hour 58 minutes, powered by Japan’s zero-fatality Shinkansen technology.',
    points: [
      'India’s 1st Undersea Rail Tunnel (21 km across Thane Creek)',
      '12 elevated multi-modal integrated airport-style terminals',
      'Early earthquake detection sensors with auto-stop brakes',
      'Capacity to ferry over 18,000 passengers per hour'
    ]
  },
  {
    title: 'Chenab Rail Arch Bridge (USBRL)',
    speed: '359m River Deck Height',
    badge: 'World’s Highest Railway Bridge',
    image: '/images/trains/ir_chenab_bridge.jpg',
    description: 'Soaring 359 meters above the Chenab gorge in Jammu & Kashmir (35 meters taller than the Eiffel Tower), providing all-weather broad-gauge rail connectivity to Kashmir Valley.',
    points: [
      'Withstands high-velocity winds up to 266 km/h',
      'Engineered with blast-resistant special steel',
      'Connects Kashmir directly to the national railway grid',
      'Global civil engineering marvel of the century'
    ]
  },
  {
    title: 'Amrit Bharat 1,300+ Station Redevelopment',
    speed: '1,300+ Cities',
    badge: 'Airport-Standard Terminals',
    image: '/images/trains/ir_bullet_train_future.jpg',
    description: 'Masterplan reconstructing 1,300+ heritage railway stations into modern city transit hubs with expansive roof plazas, segregated concourses, and shopping arcades.',
    points: [
      'Segregated arrival and departure concourses',
      'Roof plazas with food courts, lounges, and kids play areas',
      'Divyangjan-friendly with 100% lifts and tactile braille paths',
      'Platinum LEED Green building standards with rooftop solar'
    ]
  },
  {
    title: '100% Broad Gauge Electrification & Net Zero 2030',
    speed: 'World No. 1 Green Network',
    badge: 'Green Energy Rail',
    image: '/train-hero-sunset.jpg',
    description: 'Indian Railways has achieved over 95%+ electrification of broad gauge routes, becoming the world’s largest carbon-neutral railway network by 2030.',
    points: [
      'Eliminating over 7.5 million tonnes of CO2 emissions annually',
      'Hydrogen for Heritage zero-emission trains on scenic hill routes',
      'Solar energy powering over 1,000 passenger stations',
      'Zero discharge bio-toilets across 100% passenger coaches'
    ]
  }
];

// ─── Data: Locomotive Fleet ─────────────────────────────────────
const LOCOMOTIVE_FLEET = [
  {
    code: 'WAP-7',
    name: 'The Passenger Workhorse',
    power: '6,000 Horsepower',
    speed: '140 km/h Top Speed',
    type: '3-Phase AC Electric',
    description: 'The backbone of Indian Railways express travel. Capable of hauling 24-coach trains with regenerative braking that feeds power back into the national grid.',
    badgeColor: 'border-blue-500/30 text-blue-600 dark:text-blue-400'
  },
  {
    code: 'WAG-12B',
    name: 'Heavy Freight Monster',
    power: '12,000 Horsepower',
    speed: '120 km/h Top Speed',
    type: 'Twin-Section Electric',
    description: 'One of the most powerful locomotives manufactured globally, built at Madhepura, Bihar. It effortlessly hauls 6,000-tonne freight trains across steep mountain gradients.',
    badgeColor: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
  },
  {
    code: 'Train 18 (EMU)',
    name: 'Vande Bharat Trainset',
    power: '12,800 kW Distributed Power',
    speed: '180 km/h Tested',
    type: 'Distributed Traction',
    description: 'Eliminates separate locomotives by placing electric traction motors beneath alternate coaches, delivering lightning-fast acceleration and smooth braking.',
    badgeColor: 'border-amber-500/30 text-amber-600 dark:text-amber-400'
  }
];

const HeritageStoryShowcase = () => {
  const [activeTab, setActiveTab] = useState('heritage');

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#071326] border-t border-slate-200 dark:border-slate-800 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ─── Section Header (Dribbble IRCTC Minimalist) ─── */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#002B49]/10 dark:bg-amber-400/10 text-[#002B49] dark:text-amber-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 border border-[#002B49]/15 dark:border-amber-400/20">
            <FaHistory className="text-xs" />
            <span>Chronicles of Indian Railways</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            From 1853 Steam to the <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-[#002B49] dark:from-amber-400 dark:to-cyan-400">
              320 km/h Bullet Train Era
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-3 font-normal">
            Explore 170+ years of engineering resilience, indigenous Make-in-India technology, and the futuristic transport network uniting 1.4 billion citizens.
          </p>
        </div>

        {/* ─── Interactive Tab Bar ─── */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
          <SegmentedPillToggle
            options={STORY_TABS.map((tab) => {
              const Icon = tab.icon;
              return {
                id: tab.id,
                label: tab.label,
                icon: <Icon className="text-sm" />,
              };
            })}
            value={activeTab}
            onChange={setActiveTab}
            layoutId="heritageStoryTabs"
            size="md"
          />
        </div>

        {/* ─── TAB CONTENT (MINIMALIST BENTO GRIDS) ─── */}
        <AnimatePresence mode="wait">
          {/* TAB 1: 1853–2002 HERITAGE */}
          {activeTab === 'heritage' && (
            <motion.div
              key="tab-heritage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {HERITAGE_MILESTONES.map((item, idx) => (
                <div
                  key={item.year || idx}
                  className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-[#002B49]/90 text-amber-400 text-xs font-black rounded-xl border border-amber-400/30">
                      {item.year}
                    </span>
                    <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/20">
                      {item.stat}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                        {item.badge}
                      </p>
                      <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 2: MAKE IN INDIA MODERN ERA */}
          {activeTab === 'modern' && (
            <motion.div
              key="tab-modern"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {MODERN_MARVELS.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 rounded-2xl overflow-hidden mb-5 relative">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-xl">
                        {item.speed}
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                      {item.badge}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <ul className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                    {item.points.map((pt, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <FaCheckCircle className="text-emerald-500 text-xs mt-0.5 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 3: 2026–2030 HORIZON */}
          {activeTab === 'future' && (
            <motion.div
              key="tab-future"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {FUTURE_HORIZONS.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row"
                >
                  <div className="md:w-5/12 h-52 md:h-auto relative overflow-hidden shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                    <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-[#002B49] text-amber-300 text-xs font-black rounded-xl border border-amber-400/30">
                      {item.speed}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                        {item.badge}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>
                    <ul className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3.5">
                      {item.points.slice(0, 3).map((pt, i) => (
                        <li key={i} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <FaCheckCircle className="text-emerald-500 text-[10px] mt-0.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* TAB 4: LOCOMOTIVE FLEET */}
          {activeTab === 'locomotives' && (
            <motion.div
              key="tab-locomotives"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {LOCOMOTIVE_FLEET.map((loco) => (
                <div
                  key={loco.code}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-amber-400/40 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-xl bg-[#002B49] text-amber-400 font-black text-xs border border-amber-400/30">
                      {loco.code}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {loco.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                    {loco.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    {loco.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Power</span>
                      <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{loco.power}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Speed</span>
                      <p className="text-xs font-black text-amber-500 mt-0.5">{loco.speed}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default HeritageStoryShowcase;
