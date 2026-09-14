import { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, 
  FaPaperPlane, FaHeadset, FaComments,
  FaChevronDown, FaCheckCircle, FaRobot, FaBuilding
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getLocalBusinessSchema, getFAQSchema } from '../utils/schemas';
import api from '../services/api';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';

// Global HQ Offices Data
const officeLocations = [
  {
    id: 'ny',
    city: 'New York',
    country: 'USA',
    type: 'Global Headquarters',
    address: 'One World Trade Center, Suite 4500, New York, NY 10007',
    phone: '+1 (800) 123-4567',
    email: 'ny@travelease.com',
    hours: 'Mon - Fri: 8:00 AM - 8:00 PM EST',
    timezone: 'America/New_York',
    coords: '27.1751,78.0421',
    mapLink: 'https://maps.google.com/?q=One+World+Trade+Center+New+York'
  },
  {
    id: 'ldn',
    city: 'London',
    country: 'United Kingdom',
    type: 'EMEA Headquarters',
    address: 'The Shard, 32 London Bridge St, London SE1 9SG',
    phone: '+44 20 7946 0912',
    email: 'london@travelease.com',
    hours: 'Mon - Fri: 9:00 AM - 6:00 PM GMT',
    timezone: 'Europe/London',
    mapLink: 'https://maps.google.com/?q=The+Shard+London'
  },
  {
    id: 'tky',
    city: 'Tokyo',
    country: 'Japan',
    type: 'Asia-Pacific Hub',
    address: 'Roppongi Hills Mori Tower, 6-10-1 Roppongi, Minato City, Tokyo 106-6108',
    phone: '+81 3 5555 0143',
    email: 'tokyo@travelease.com',
    hours: 'Mon - Fri: 9:00 AM - 6:00 PM JST',
    timezone: 'Asia/Tokyo',
    mapLink: 'https://maps.google.com/?q=Roppongi+Hills+Tokyo'
  },
  {
    id: 'del',
    city: 'New Delhi',
    country: 'India',
    type: 'South Asia Hub',
    address: 'DLF Cyber City, Tower 10B, DLF Phase 2, Gurugram, HR 122002',
    phone: '+91 124 456 7890',
    email: 'delhi@travelease.com',
    hours: 'Mon - Sat: 9:30 AM - 6:30 PM IST',
    timezone: 'Asia/Kolkata',
    mapLink: 'https://maps.google.com/?q=DLF+Cyber+City+Gurugram'
  }
];

// Interactive FAQ Accordion Data
const faqItems = [
  {
    category: 'Bookings',
    question: 'How do I modify or cancel my existing travel booking?',
    answer: 'You can easily modify dates, traveler info, or cancel bookings directly from your Dashboard under the "My Trips" tab. Most flight and hotel bookings offer free cancellation up to 24 hours prior to departure.'
  },
  {
    category: 'Payments',
    question: 'Is my payment information secure and what currencies are supported?',
    answer: 'Yes! TravelEase uses bank-grade 256-bit SSL encryption and PCI DSS Level 1 compliance. We accept major Credit/Debit Cards, UPI, Net Banking, Apple Pay, Google Pay, and PayPal across 30+ currencies.'
  },
  {
    category: 'AI Concierge',
    question: 'How does the 24/7 AI Concierge assistance work?',
    answer: 'Our global AI Concierge is accessible directly via the floating widget on the bottom right of your screen. It can check flight delays, recommend local dining spots, update hotel reservations, and assist in emergencies 24/7.'
  },
  {
    category: 'Refunds',
    question: 'What is the standard refund timeline for cancelled trips?',
    answer: 'Refunds are automatically processed to your original payment method within 3 to 5 business days upon cancellation confirmation.'
  }
];

const topicOptions = [
  'General Inquiry', 'Booking Change', 'Partner with Us', 'Press & Media', 'Technical Support'
];

const Contact = () => {
  const [selectedTopic, setSelectedTopic] = useState('General Inquiry');
  const [selectedOffice, setSelectedOffice] = useState(officeLocations[0]);
  const [activeFaqCategory, setActiveFaqCategory] = useState('All');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(0);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Timezone clocks state
  const [officeTimes, setOfficeTimes] = useState({});

  useEffect(() => {
    const updateClocks = () => {
      const times = {};
      officeLocations.forEach(loc => {
        try {
          times[loc.id] = new Intl.DateTimeFormat('en-US', {
            timeZone: loc.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          }).format(new Date());
        } catch (e) {
          times[loc.id] = '12:00 PM';
        }
      });
      setOfficeTimes(times);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');
    
    try {
      await api.post('/inquiries', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject || selectedTopic,
        message: formData.message,
      });
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      setSubmitStatus('error');
      setErrorMessage(
        err.response?.data?.message || 
        'Unable to transmit message right now. Please verify your connection or email support@travelease.com directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = faqItems.filter(item => {
    const matchesCat = activeFaqCategory === 'All' || item.category === activeFaqCategory;
    const matchesSearch = item.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
                          item.answer.toLowerCase().includes(faqSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const contactSchemas = [
    getWebPageSchema({
      type: 'ContactPage',
      name: 'Contact TravelEase — 24/7 Global Support & Headquarters',
      description: 'Have questions, feedback, or need instant booking assistance? Reach out to TravelEase global team via phone, email, or live concierge.',
      url: '/contact',
      breadcrumb: true,
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Contact' },
    ], '/contact'),
    ...officeLocations.map(off => getLocalBusinessSchema({
      name: `TravelEase — ${off.city} Office`,
      streetAddress: off.address,
      city: off.city,
      country: off.country,
      telephone: off.phone,
      email: off.email,
    })),
    getFAQSchema(faqItems.map(f => ({ question: f.question, answer: f.answer }))),
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#0a0e1a] text-slate-900 dark:text-slate-100 transition-colors duration-500" id="contact-page">
      <JsonLd data={contactSchemas} />

      {/* Cinematic Hero Section with Global Timezone Clocks */}
      <section className="relative h-[75vh] min-h-[550px] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="Global Office Skyline" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-50 dark:to-[#0a0e1a]"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 glass-crystal px-5 py-2.5 rounded-full mb-6 border border-white/20 shadow-2xl"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-white text-xs font-black uppercase tracking-widest">24/7 Global Concierge Online</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight mb-6 drop-shadow-2xl"
          >
            We Are Here For<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">Every Step of Your Journey</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Connect with our global offices in New York, London, Tokyo, and New Delhi, or chat with our live AI Concierge.
          </motion.p>

          {/* Live Global Clocks Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            {officeLocations.map(off => (
              <div key={off.id} className="glass-crystal p-3 rounded-2xl border border-white/20 text-center">
                <p className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-0.5">{off.city}</p>
                <p className="text-sm font-black text-white font-mono">{officeTimes[off.id] || 'Loading...'}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-16">

        {/* Section 1: Interactive Contact Form & Live Support Sidebar */}
        <div className="grid lg:grid-cols-12 gap-12 items-start mb-24">
          
          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 card-elevated p-8 md:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800"
          >
            <div className="mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-amber-500 mb-2 block">Direct Inquiry</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Send Us a Message</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Our average human response time is under 15 minutes.</p>
            </div>

            {/* Topic Select Chips */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Topic</label>
              <div className="flex flex-wrap gap-2">
                {topicOptions.map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      selectedTopic === topic
                        ? 'bg-amber-500 text-white shadow-md scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="sarah@example.com"
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={`Inquiry regarding ${selectedTopic}...`}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="How can our travel concierges assist your upcoming journey?"
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                ></textarea>
              </div>

              <ThreeUIButton
                type="submit"
                disabled={isSubmitting}
                variant="amber-glow"
                size="lg"
                icon={isSubmitting ? null : FaPaperPlane}
                className="w-full shadow-amber-500/20"
              >
                {isSubmitting ? 'Transmitting...' : 'Send Priority Message'}
              </ThreeUIButton>

              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-center text-sm flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle /> Message received! A travel specialist will contact you within 2 business hours.
                  </motion.div>
                )}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-center text-sm flex items-center justify-center gap-2"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Right Sidebar: AI Concierge & Quick Contacts */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* AI Concierge Box */}
            <div className="card-elevated p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 text-2xl border border-amber-500/30">
                <FaRobot />
              </div>
              <h3 className="text-2xl font-black mb-2">Need Instant Help?</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Skip the line! Our global AI Concierge agent can update hotel reservations, answer visa questions, or build a custom itinerary right now.
              </p>
              
              <ThreeUIButton 
                onClick={() => {
                  const triggerBtn = document.getElementById('ai-concierge-trigger');
                  if (triggerBtn) triggerBtn.click();
                }}
                variant="amber-glow"
                size="md"
                icon={FaComments}
                className="w-full"
              >
                Launch Live AI Chat
              </ThreeUIButton>
            </div>

            {/* Quick Support Channels */}
            <div className="card-elevated p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                Support Channels
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center text-xl shrink-0">
                  <FaHeadset />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Sales & Custom Trips</h4>
                  <p className="text-xs text-slate-500 font-medium">+1 (800) 123-4567</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl shrink-0">
                  <FaEnvelope />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Email Concierge</h4>
                  <p className="text-xs text-slate-500 font-medium">support@travelease.com</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Global Offices Tab Switcher & Map Navigation */}
        <div className="mb-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3 block">Global Footprint</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Our Worldwide Headquarters</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Select a hub to view local details and launch GPS navigation.</p>
          </div>

          {/* Office Tabs */}
          <div className="flex justify-center mb-8">
            <SegmentedPillToggle
              options={officeLocations.map(off => ({
                id: off.id,
                label: `${off.city}, ${off.country}`,
                icon: FaBuilding
              }))}
              activeId={selectedOffice.id}
              onChange={(id) => setSelectedOffice(officeLocations.find(o => o.id === id))}
              layoutId="contactOfficeToggle"
              size="md"
            />
          </div>

          {/* Active Office Card */}
          <motion.div
            key={selectedOffice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-elevated p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 grid lg:grid-cols-2 gap-8 items-center"
          >
            <div>
              <span className="bg-amber-500/10 text-amber-500 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                {selectedOffice.type}
              </span>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{selectedOffice.city} Hub</h3>
              
              <div className="space-y-4 mb-8 text-sm text-slate-600 dark:text-slate-300 font-medium">
                <p className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-amber-500 mt-1 shrink-0" />
                  {selectedOffice.address}
                </p>
                <p className="flex items-center gap-3">
                  <FaPhone className="text-amber-500 shrink-0" />
                  {selectedOffice.phone}
                </p>
                <p className="flex items-center gap-3">
                  <FaEnvelope className="text-amber-500 shrink-0" />
                  {selectedOffice.email}
                </p>
                <p className="flex items-center gap-3">
                  <FaClock className="text-amber-500 shrink-0" />
                  {selectedOffice.hours}
                </p>
              </div>

              <ThreeUIButton 
                href={selectedOffice.mapLink}
                target="_blank"
                rel="noreferrer"
                variant="liquid-metal"
                size="md"
                icon={FaMapMarkerAlt}
                iconPosition="right"
              >
                Open Google Maps Navigation
              </ThreeUIButton>
            </div>

            <div className="relative h-72 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80" 
                alt={`${selectedOffice.city} Office`} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute bottom-4 left-4 glass-crystal px-4 py-2 rounded-xl text-white text-xs font-bold border border-white/20">
                📍 {selectedOffice.city} Local Time: {officeTimes[selectedOffice.id]}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 3: Interactive FAQ Accordion */}
        <div className="mb-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3 block">Help Center</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          </div>
          {/* FAQ Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <SegmentedPillToggle
              options={['All', 'Booking', 'Payment', 'Safety', 'AI Concierge', 'Refunds'].map((cat) => ({ id: cat, label: cat }))}
              activeId={activeFaqCategory}
              onChange={setActiveFaqCategory}
              layoutId="contactFaqToggle"
              size="sm"
            />
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="card-elevated rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                    className="w-full p-6 text-left font-black text-slate-900 dark:text-white text-base md:text-lg flex justify-between items-center gap-4 hover:text-amber-500 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <FaChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800/50 pt-4"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;