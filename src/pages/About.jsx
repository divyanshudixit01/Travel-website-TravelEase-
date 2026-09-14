import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaGlobeAmericas, FaShieldAlt, FaLightbulb, 
  FaLinkedin, FaTwitter, FaSuitcaseRolling,
  FaLeaf, FaRocket, FaTimes, FaChevronRight, FaCompass
} from 'react-icons/fa';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getPersonSchema } from '../utils/schemas';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';

// Leadership Team Data with rich bios
const teamMembers = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'Founder & CEO',
    expertise: 'Sustainable Tourism & Product Strategy',
    bio: '15+ years transforming travel experiences. Former VP of Product at Expedia, Alex founded TravelEase in 2024 to revolutionize personalized trip curation using autonomous AI agents and direct local guide partnerships.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=687&q=80',
    linkedin: '#',
    twitter: '#'
  },
  {
    id: 2,
    name: 'Elena Rostova',
    role: 'Chief AI Architect',
    expertise: 'Neural Search & Travel Intelligence',
    bio: 'Former Senior AI Researcher at Google Brain. Elena leads our proprietary multi-modal itinerary engine that analyzes millions of live flight, hotel, and weather data points per second.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=688&q=80',
    linkedin: '#',
    twitter: '#'
  },
  {
    id: 3,
    name: 'Marcus Vance',
    role: 'Head of Global Operations',
    expertise: 'Local Partner Network & Safety',
    bio: 'Over 12 years managing luxury expedition tours across South America, Southeast Asia, and Africa. Marcus oversees our network of 2,500+ verified local guides and 24/7 concierge operations.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=687&q=80',
    linkedin: '#',
    twitter: '#'
  },
  {
    id: 4,
    name: 'Aisha Patel',
    role: 'VP of Customer Experience',
    expertise: 'Omnichannel Concierge & Hospitality',
    bio: 'Hospitality veteran with a background at Ritz-Carlton. Aisha leads our 24/7 global support team ensuring every traveler receives royal treatment before, during, and after their trip.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=687&q=80',
    linkedin: '#',
    twitter: '#'
  }
];

// History Milestones
const milestones = [
  {
    year: '2024',
    title: 'The Inception',
    desc: 'Founded in San Francisco by a team of travel veterans and AI researchers with a mission to eliminate tedious trip planning.',
    icon: <FaRocket className="text-amber-400" />
  },
  {
    year: '2025',
    title: 'Autonomous AI Engine Launch',
    desc: 'Pioneered instant verified itinerary generation combining flight schedules, boutique stays, and real-time weather predictions.',
    icon: <FaLightbulb className="text-amber-400" />
  },
  {
    year: '2026',
    title: 'Global Expansion & Carbon Neutrality',
    desc: 'Crossed 500,000 satisfied travelers across 120+ countries while committing 1% of every booking to local eco-restoration funds.',
    icon: <FaGlobeAmericas className="text-amber-400" />
  }
];

const About = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 300]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.1]);

  const aboutSchemas = [
    getWebPageSchema({
      type: 'AboutPage',
      name: 'About TravelEase — Redefining Global Travel Experience',
      description: 'Learn about TravelEase, the AI-powered travel platform founded in 2024. Meet our team of travel experts and technologists.',
      url: '/about',
      breadcrumb: true,
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'About' },
    ], '/about'),
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'TravelEase Leadership Team',
      itemListElement: teamMembers.map((person, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: getPersonSchema({
          name: person.name,
          jobTitle: person.role,
          image: person.image,
          description: person.bio
        })
      }))
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#0a0e1a] text-slate-900 dark:text-slate-100 transition-colors duration-500" id="about-page">
      <JsonLd data={aboutSchemas} />

      {/* Apple-Level Parallax Hero Section */}
      <section ref={heroRef} className="relative h-[85vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
        <motion.div 
          style={{ y: y1, scale }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
            alt="Scenic World Travel" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-50 dark:to-[#0a0e1a]"></div>
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 glass-crystal px-5 py-2.5 rounded-full mb-8 border border-white/20 shadow-2xl"
          >
            <FaSuitcaseRolling className="text-amber-400 w-4 h-4" />
            <span className="text-white text-xs font-black uppercase tracking-widest">Our Vision & Journey</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 drop-shadow-2xl"
          >
            Redefining Travel Through<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">AI & Human Passion</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed mb-12 drop-shadow-lg"
          >
            We empower global adventurers with intelligent itineraries, verified local partners, and instant 1-click bookings.
          </motion.p>

          {/* Floating Metric Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { label: 'Destinations', value: '120+ Countries' },
              { label: 'Happy Travelers', value: '500k+' },
              { label: 'Global Rating', value: '4.9 ★' },
              { label: 'Verified Partners', value: '2,500+' }
            ].map((stat, idx) => (
              <div key={idx} className="glass-crystal p-4 rounded-2xl border border-white/20 shadow-xl backdrop-blur-md">
                <p className="text-2xl font-black text-amber-400 mb-1">{stat.value}</p>
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-20">

        {/* Section 1: Who We Are */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-28">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3 block">Who We Are</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              We Believe Travel Planning Should Be Effortless.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              TravelEase was born out of a simple observation: modern travelers spend an average of 30+ hours jumping between spreadsheets, reviews, and travel sites just to organize a single vacation.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              By combining real-time flight data, verified boutique hotel inventory, and intelligent AI route optimization, we transform trip planning into a 60-second joy.
            </p>

            <div className="flex flex-wrap gap-4">
              <ThreeUIButton to="/explore" variant="liquid-metal" size="lg" icon={FaCompass} iconPosition="right">
                Explore Interactive Map
              </ThreeUIButton>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-2xl group">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1470&q=80" 
                alt="TravelEase Team" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                  Global Family
                </span>
                <p className="text-xl font-bold">150+ Passionate Innovators Operating Across 12 Timezones</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 2: Core Values Grid */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3 block">Our Guiding Pillars</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Built on Trust, Fueled by Innovation</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Every feature we build and partner we verify adheres to these uncompromised standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <FaGlobeAmericas className="w-8 h-8 text-sky-500" />, 
                title: 'Authentic Local Connection', 
                desc: 'We bypass tourist traps. Every experience is vetted alongside native guides who share authentic cultural roots.',
                bg: 'bg-sky-500/10 border-sky-500/20'
              },
              { 
                icon: <FaShieldAlt className="w-8 h-8 text-emerald-500" />, 
                title: '100% Price Lock & Security', 
                desc: 'Zero hidden fees. We lock in live rates for flights, stays, and activities with military-grade 256-bit SSL protection.',
                bg: 'bg-emerald-500/10 border-emerald-500/20'
              },
              { 
                icon: <FaLightbulb className="w-8 h-8 text-amber-500" />, 
                title: 'AI Intelligence Engine', 
                desc: 'Our proprietary algorithm builds dynamic itineraries tailored specifically to your budget, travel rhythm, and preferences.',
                bg: 'bg-amber-500/10 border-amber-500/20'
              },
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="card-elevated p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-16 h-16 rounded-2xl ${item.bg} border flex items-center justify-center mb-6`}>
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 3: Interactive History Timeline */}
        <div className="mb-28 card-elevated p-8 md:p-14 rounded-3xl bg-slate-900 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3 block">Milestones</span>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Our Journey So Far</h2>
            <p className="text-slate-300 text-lg">From a small Silicon Valley desk to a global travel infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {milestones.map((m, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-amber-400">{m.year}</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    {m.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{m.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 4: Leadership Team with Modal Bio */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3 block">Meet the Minds</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Leadership Team</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Click any team member to view their full background and vision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedMember(member)}
                className="card-interactive rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 group cursor-pointer"
              >
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-black">{member.name}</h3>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">{member.role}</p>
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between bg-white dark:bg-slate-900">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">View Leadership Bio</span>
                  <FaChevronRight className="text-amber-500 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 5: Sustainable Tourism Commitment */}
        <div className="card-elevated p-8 md:p-14 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white mb-28 relative overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase mb-6 border border-emerald-500/30">
                <FaLeaf /> 1% For The Planet
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                Travel That Leaves Earth Better Than We Found It.
              </h2>
              <p className="text-emerald-100 text-lg leading-relaxed mb-8">
                We believe global exploration must protect local environments. For every booking made on TravelEase, we fund certified carbon removal programs and direct micro-grants to indigenous guides.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-black text-amber-400">12,500 Tons</p>
                  <p className="text-xs font-bold text-emerald-200 uppercase">CO2 Offset Funded</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-amber-400">450+ Communities</p>
                  <p className="text-xs font-bold text-emerald-200 uppercase">Directly Supported</p>
                </div>
              </div>
            </div>

            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop" 
                alt="Sustainable Nature" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>

      </div>

      {/* Team Member Bio Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setSelectedMember(null)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-xl glass-frost rounded-3xl p-8 shadow-2xl border border-white/20 text-slate-900 dark:text-white"
            >
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <FaTimes />
              </button>

              <div className="flex items-center gap-5 mb-6">
                <img src={selectedMember.image} alt={selectedMember.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                <div>
                  <h3 className="text-2xl font-black">{selectedMember.name}</h3>
                  <p className="text-sm font-bold text-amber-500 uppercase tracking-wider">{selectedMember.role}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{selectedMember.expertise}</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                {selectedMember.bio}
              </p>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Connect Direct</span>
                <div className="flex gap-3">
                  <a href={selectedMember.linkedin} className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all">
                    <FaLinkedin />
                  </a>
                  <a href={selectedMember.twitter} className="w-9 h-9 rounded-full bg-sky-400/10 text-sky-400 flex items-center justify-center hover:bg-sky-400 hover:text-white transition-all">
                    <FaTwitter />
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

export default About;