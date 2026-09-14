import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { searchRealtimeTours } from '../services/realtimeDataEngine';
import { useBooking } from '../context/BookingContext';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { FaTicketAlt, FaTimes, FaArrowRight, FaMapMarkerAlt, FaCheckCircle, FaStar } from 'react-icons/fa';
import NoResults from '../components/common/NoResults';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema } from '../utils/schemas';

const Tours = () => {
  const navigate = useNavigate();
  const { formatPrice, setActiveBooking, addToast } = useBooking();

  const [location, setLocation] = useState('Dubai');
  const [tourResults, setTourResults] = useState([]);
  const [activeModal, setActiveModal] = useState(null);

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 250]);

  const handleSearch = useCallback(() => {
    const results = searchRealtimeTours(location);
    setTourResults(results);
  }, [location]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleConfirm = () => {
    if (!activeModal) return;
    const tourDraft = {
      serviceType: 'tour',
      itemTitle: activeModal.title,
      details: {
        location: activeModal.location,
        duration: activeModal.duration,
        groupSize: activeModal.groupSize,
        inclusions: (activeModal.inclusions || activeModal.highlights || []).join(', ')
      },
      priceUSD: activeModal.priceUSD,
      image: activeModal.image
    };
    setActiveBooking(tourDraft);
    addToast('Experience pass reserved! Proceeding to checkout.', 'success');
    navigate('/checkout');
  };

  const tourSchemas = useMemo(() => [
    getWebPageSchema({ name: 'Book Real-Time Guided Tours & Experiences — TravelEase', description: 'Book guided day trips, desert safaris, skip-the-line monument passes, and culinary experiences.', url: '/tours', breadcrumb: true }),
    getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Experiences' }], '/tours')
  ], []);

  return (
    <div className="bg-slate-50 dark:bg-[#0a0e1a] text-slate-900 dark:text-slate-100 transition-colors duration-500" id="tours-page">
      <JsonLd data={tourSchemas} />

      {/* Hero */}
      <section ref={heroRef} className="relative h-[75vh] min-h-[550px] w-full overflow-hidden flex items-center justify-center">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2070&auto=format&fit=crop" alt="Experiences Wallpaper" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-50 dark:to-[#0a0e1a]"></div>
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-12">
          <div className="inline-flex items-center gap-2 glass-crystal px-5 py-2 rounded-full mb-6 border border-white/20 shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-white text-xs font-black uppercase tracking-widest">Real-Time Guided Tours & Passes</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Book Unforgettable Experiences,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">In Any Destination Worldwide.</span>
          </h1>

          {/* Search Card */}
          <div className="glass-crystal p-6 rounded-3xl border border-white/20 shadow-2xl text-left max-w-4xl mx-auto flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-[10px] text-amber-300 font-bold uppercase mb-1">Destination / Landmark</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dubai, Paris, Agra, Bali..." className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white font-extrabold text-sm focus:outline-none focus:border-amber-400" />
            </div>
            <ThreeUIButton
              type="button"
              variant="amber-glow"
              size="lg"
              onClick={handleSearch}
              icon={<FaTicketAlt />}
            >
              Search Experiences
            </ThreeUIButton>
          </div>
        </div>
      </section>

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Guided Experiences in {location} ({tourResults.length})</h2>
        {tourResults.length === 0 ? (
          <NoResults
            type="coming-soon"
            serviceName="Guided Experiences & Day Tours"
            searchQuery={location}
            suggestions={[
              { label: 'Explore Top Destinations', onClick: () => navigate('/destinations') },
              { label: 'Generate Custom AI Itinerary', onClick: () => navigate('/itinerary') },
            ]}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tourResults.map(tr => (
              <div key={tr.id} className="card-elevated rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
                <div>
                  <div className="h-52 rounded-2xl overflow-hidden mb-4">
                    <img src={tr.image} alt={tr.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-amber-500 mb-1">
                    <span>{tr.duration}</span>
                    <span className="flex items-center gap-1"><FaStar /> {tr.rating} ({tr.reviewsCount})</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{tr.title}</h3>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mb-4"><FaMapMarkerAlt className="text-rose-500" /> {tr.location}</p>
                  <div className="space-y-1 mb-4">
                    {(tr.inclusions || tr.highlights || []).map((inc, i) => (
                      <p key={i} className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><FaCheckCircle className="text-emerald-500" /> {inc}</p>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Per Person</span>
                    <p className="text-2xl font-black text-amber-500">{formatPrice(tr.priceUSD)}</p>
                  </div>
                  <ThreeUIButton
                    variant="amber-glow"
                    size="sm"
                    onClick={() => setActiveModal(tr)}
                    icon={<FaArrowRight className="text-[10px]" />}
                  >
                    Book Pass
                  </ThreeUIButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setActiveModal(null)} />
            <div className="relative w-full max-w-lg glass-frost rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{activeModal.title}</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><FaTimes /></button>
              </div>
              <p className="text-sm font-bold text-amber-500 mb-6">{activeModal.duration} • {activeModal.location}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="text-2xl font-black text-amber-500">{formatPrice(activeModal.priceUSD)}</span>
                <ThreeUIButton
                  variant="liquid-metal"
                  size="md"
                  onClick={handleConfirm}
                  icon={<FaArrowRight className="text-[10px]" />}
                >
                  Confirm & Checkout
                </ThreeUIButton>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tours;
