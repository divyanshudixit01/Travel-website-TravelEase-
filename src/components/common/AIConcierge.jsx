import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSparkles } from 'react-icons/hi';
import {
  FaTimes, FaPaperPlane, FaPlane, FaHotel, FaMapMarkerAlt,
  FaUmbrellaBeach, FaMagic, FaTrain, FaBus, FaCar, FaHome,
  FaCompass, FaExpand, FaCompress, FaBolt, FaRobot
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { aiChatMessage } from '../../services/aiEngine';

const ICON_MAP = {
  plane: <FaPlane className="w-3 h-3" />,
  hotel: <FaHotel className="w-3 h-3" />,
  train: <FaTrain className="w-3 h-3" />,
  bus: <FaBus className="w-3 h-3" />,
  car: <FaCar className="w-3 h-3" />,
  home: <FaHome className="w-3 h-3" />,
  compass: <FaCompass className="w-3 h-3" />,
  sparkles: <HiOutlineSparkles className="w-3 h-3" />,
  beach: <FaUmbrellaBeach className="w-3 h-3" />,
  magic: <FaMagic className="w-3 h-3" />,
};

const QUICK_ACTIONS = [
  { text: "Best budget trips under ₹15,000", icon: <FaBolt className="w-4 h-4 text-amber-500" /> },
  { text: "Find cheap flights to Goa this weekend", icon: <FaPlane className="w-4 h-4 text-sky-500" /> },
  { text: "Plan a 5-day honeymoon in Bali", icon: <FaUmbrellaBeach className="w-4 h-4 text-emerald-500" /> },
  { text: "Suggest a luxury Dubai trip for 2 adults", icon: <FaMagic className="w-4 h-4 text-purple-500" /> },
  { text: "IRCTC Tatkal train availability to Varanasi", icon: <FaTrain className="w-4 h-4 text-orange-500" /> },
  { text: "Compare hotels in Manali under ₹3000/night", icon: <FaHotel className="w-4 h-4 text-rose-500" /> },
];

const AIConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [latency, setLatency] = useState(null);
  const [aiModel, setAiModel] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setLatency(null);

    try {
      const startMs = performance.now();
      const result = await aiChatMessage(text.trim(), messages.slice(-8));
      const clientLatency = Math.round(performance.now() - startMs);

      setLatency(result.latencyMs || clientLatency);
      setAiModel(result.model || 'Groq LPU™');

      setMessages(prev => [...prev, {
        role: 'ai',
        text: result.reply || result.message || 'I\'m here to help you plan the perfect trip!',
        actions: result.actions || [],
        source: result.source,
        cached: result.cached
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "I'm having trouble connecting right now. Please make sure the backend server is running on port 5000, then try again! In the meantime, you can explore our platform directly.",
        actions: [
          { label: 'AI Trip Planner', path: '/itinerary', icon: 'sparkles' },
          { label: 'Explore Destinations', path: '/destinations', icon: 'compass' },
          { label: 'Search Flights', path: '/flights', icon: 'plane' },
        ]
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleActionClick = (action) => {
    const params = action.params
      ? '?' + Object.entries(action.params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
      : '';
    navigate(action.path + params);
    setIsOpen(false);
  };

  const widgetSize = isExpanded
    ? 'w-[680px] max-w-[calc(100vw-32px)] h-[85vh] max-h-[calc(100vh-60px)]'
    : 'w-[420px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-80px)]';

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group"
            id="ai-concierge-trigger"
          >
            {/* Pulsing Glow Ring */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 animate-ping opacity-25" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white flex items-center justify-center shadow-2xl shadow-amber-500/40">
              <HiOutlineSparkles className="w-6 h-6" />
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              ⚡ AI Travel Agent
              <div className="absolute top-full right-4 w-2 h-2 bg-slate-900 dark:bg-white rotate-45 -translate-y-1" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className={`fixed bottom-6 right-6 z-50 ${widgetSize} rounded-3xl overflow-hidden flex flex-col border border-slate-200/60 dark:border-white/[0.08] shadow-2xl dark:shadow-black/60 transition-all duration-300`}
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.98) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
            }}
            id="ai-concierge-window"
          >
            {/* Dark mode background override */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c14]/[0.98] via-[#0d1017]/[0.98] to-[#0f1220]/[0.98] dark:block hidden pointer-events-none" />

            {/* ─── Header ─── */}
            <div className="relative z-10 flex items-center justify-between px-5 py-3.5 border-b border-slate-200/60 dark:border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <FaRobot className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0d1017]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">TravelEase AI</h3>
                  <div className="flex items-center gap-1.5">
                    <FaBolt className="w-2.5 h-2.5 text-amber-500" />
                    <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400">
                      Groq LPU™ 120B
                    </span>
                    {latency !== null && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 ml-1">
                        · {latency}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all"
                  title={isExpanded ? 'Compact' : 'Expand'}
                >
                  {isExpanded ? <FaCompress className="w-3 h-3" /> : <FaExpand className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* ─── Messages Area ─── */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">

              {/* Welcome State */}
              {messages.length === 0 && (
                <div className="space-y-4">
                  {/* Welcome Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/[0.06] dark:to-orange-500/[0.04] border border-amber-200/40 dark:border-amber-500/10">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                        <HiOutlineSparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                          Welcome to TravelEase AI! ✨
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          I'm your 24/7 AI travel agent powered by <strong className="text-amber-600 dark:text-amber-400">Groq LPU™</strong> for ultra-fast responses. Ask me anything about flights, hotels, trains, budget trips, itineraries, or travel planning!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Pills */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                      Try asking
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.text}
                          onClick={() => sendMessage(action.text)}
                          className="flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-amber-400/50 hover:bg-amber-50/50 dark:hover:bg-amber-500/[0.05] transition-all group"
                        >
                          <div className="p-1 rounded-lg bg-slate-50 dark:bg-white/[0.04] group-hover:bg-amber-100/60 dark:group-hover:bg-amber-500/10 transition-colors shrink-0">
                            {action.icon}
                          </div>
                          <span className="line-clamp-1">{action.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-br-md shadow-lg shadow-amber-500/20'
                        : 'bg-slate-100/80 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 rounded-bl-md border border-slate-200/50 dark:border-white/[0.06]'
                    }`}
                  >
                    {/* AI badge */}
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-200/50 dark:border-white/[0.06]">
                        <FaBolt className="w-2.5 h-2.5 text-amber-500" />
                        <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                          {msg.source || 'Groq LPU™'}
                          {msg.cached && ' · Cached'}
                        </span>
                      </div>
                    )}

                    <p className="whitespace-pre-line leading-relaxed text-[13px]">{msg.text}</p>

                    {/* Action Buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-200/40 dark:border-white/[0.06]">
                        {msg.actions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleActionClick(action)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all
                              bg-white/90 dark:bg-white/[0.08] text-slate-700 dark:text-white
                              border border-slate-200/80 dark:border-white/[0.1]
                              hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400
                              hover:bg-amber-50 dark:hover:bg-amber-500/[0.08]
                              shadow-sm hover:shadow-md"
                          >
                            {ICON_MAP[action.icon] || <FaMapMarkerAlt className="w-3 h-3" />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100/80 dark:bg-white/[0.04] rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200/50 dark:border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        AI thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── Input Bar ─── */}
            <div className="relative z-10 shrink-0 border-t border-slate-200/60 dark:border-white/[0.06] p-3 bg-white/80 dark:bg-[#0a0c14]/80 backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about flights, hotels, trips, budgets..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTyping}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all disabled:opacity-50"
                  id="ai-chat-input"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 transition-shadow hover:shadow-xl hover:shadow-amber-500/30"
                  id="ai-chat-send"
                >
                  {isTyping
                    ? <FiLoader className="w-4 h-4 animate-spin" />
                    : <FaPaperPlane className="w-3.5 h-3.5" />
                  }
                </motion.button>
              </form>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <FaBolt className="w-2 h-2 text-amber-500" />
                <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                  Powered by Groq LPU™ · {aiModel || 'openai/gpt-oss-120b'} · Sub-second inference
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIConcierge;
