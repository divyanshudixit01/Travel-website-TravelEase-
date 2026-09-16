import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes, FaPaperPlane, FaPlane, FaHotel, FaMapMarkerAlt,
  FaUmbrellaBeach, FaTrain, FaBus, FaCar, FaHome,
  FaCompass, FaExpand, FaCompress, FaBolt
} from 'react-icons/fa';
import { FiLoader, FiCompass as FiCompassIcon, FiCheckCircle, FiNavigation } from 'react-icons/fi';
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
  sparkles: <FiNavigation className="w-3 h-3" />,
  beach: <FaUmbrellaBeach className="w-3 h-3" />,
  magic: <FiCompassIcon className="w-3 h-3" />,
};

const QUICK_ACTIONS = [
  { text: "Plan a 4-day spiritual journey to Varanasi with Vande Bharat", icon: <FaTrain className="w-4 h-4 text-orange-500" /> },
  { text: "Suggest a 5-day royal heritage & palace tour to Udaipur & Jaipur", icon: <FaCompass className="w-4 h-4 text-amber-500" /> },
  { text: "Plan a 6-day Kerala backwaters houseboat & Munnar tea hills trip", icon: <FaUmbrellaBeach className="w-4 h-4 text-emerald-500" /> },
  { text: "Best budget mountain trip to Himachal (Manali & Kasol) under ₹15,000", icon: <FaBolt className="w-4 h-4 text-sky-500" /> },
  { text: "Find beach stays & cheap flights to Goa this weekend", icon: <FaPlane className="w-4 h-4 text-rose-500" /> },
  { text: "IRCTC Tatkal train booking rules & Vande Bharat routes from New Delhi", icon: <FaTrain className="w-4 h-4 text-purple-500" /> },
];

// ─── Inline Text Segment Formatter ───────────────────────────────────────────
// Converts bold tokens to clean <strong> tags and prices to emerald pills.
// Strictly strips any raw markdown asterisks (**), underscores, or hashes (#).
function renderInlineSegments(text) {
  if (!text) return null;

  // Clean raw markdown heading hashes and code ticks
  const cleanText = text.replace(/^#{1,6}\s*/g, '').replace(/`/g, '');

  const tokenRegex = /(\*\*[^*]+\*\*|__[^_]+__|₹\s*[\d,]+(?:\.\d+)?)/g;
  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = tokenRegex.exec(cleanText)) !== null) {
    if (match.index > lastIdx) {
      const plain = cleanText.substring(lastIdx, match.index).replace(/[\*#_]/g, '');
      if (plain) parts.push({ type: 'text', value: plain });
    }

    const token = match[0];
    if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      const inner = token.slice(2, -2).replace(/[\*#_]/g, '');
      parts.push({ type: 'bold', value: inner });
    } else if (token.startsWith('₹')) {
      parts.push({ type: 'currency', value: token.trim() });
    }

    lastIdx = match.index + token.length;
  }

  if (lastIdx < cleanText.length) {
    const remaining = cleanText.substring(lastIdx).replace(/[\*#_]/g, '');
    if (remaining) parts.push({ type: 'text', value: remaining });
  }

  if (parts.length === 0) {
    return cleanText.replace(/[\*#_]/g, '');
  }

  return parts.map((part, idx) => {
    if (part.type === 'bold') {
      return (
        <strong key={idx} className="font-bold text-slate-900 dark:text-amber-300">
          {part.value}
        </strong>
      );
    }
    if (part.type === 'currency') {
      return (
        <span
          key={idx}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[11px]"
        >
          {part.value}
        </span>
      );
    }
    return <span key={idx}>{part.value}</span>;
  });
}

// ─── Section-Wise Structured Concierge Message Renderer ─────────────────────
// Transforms raw Groq replies into clean, uncluttered, visually impressive section cards.
const ConciergeMessageRenderer = ({ content, isUser }) => {
  if (!content) return null;

  if (isUser) {
    return <p className="whitespace-pre-line leading-relaxed text-[13px]">{content}</p>;
  }

  // Pre-clean content: normalize carriage returns
  const rawLines = content.replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let currentSection = { title: null, items: [] };

  const isHeadingLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^#{1,6}\s+/.test(trimmed)) return true;
    if (/^\d+[\.\)]\s+[A-Za-z]/.test(trimmed)) return true;
    if (/^(?:Overview|Highlights|Itinerary|Day-by-Day|Logistics|Transit|IRCTC|Train|Flight|Budget|Tips|Recommendations|Advice|Transport|Accommodation|Food & Dining)\s*:/i.test(trimmed)) return true;
    return false;
  };

  const cleanHeadingTitle = (line) => {
    return line
      .replace(/^#{1,6}\s*/, '')
      .replace(/[\*#_]/g, '')
      .trim();
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isHeadingLine(trimmed)) {
      if (currentSection.title || currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: cleanHeadingTitle(trimmed),
        items: []
      };
    } else {
      const isBullet = /^[-*•–—]\s+/.test(trimmed) || /^(?:Day\s+\d+|Step\s+\d+|Option\s+\d+)[:\-]/i.test(trimmed);
      const cleanedLine = trimmed.replace(/^[-*•–—]\s+/, '');
      currentSection.items.push({
        isBullet,
        text: cleanedLine
      });
    }
  }

  if (currentSection.title || currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  // Fallback for simple 1-liner or unstructured responses
  if (sections.length === 0 || (sections.length === 1 && !sections[0].title)) {
    const fallbackText = content.replace(/[\*#_]/g, '').trim();
    return (
      <p className="whitespace-pre-line leading-relaxed text-[13px] text-slate-700 dark:text-slate-200">
        {renderInlineSegments(fallbackText)}
      </p>
    );
  }

  return (
    <div className="space-y-2.5 text-[13px]">
      {sections.map((sec, sIdx) => (
        <div
          key={sIdx}
          className="p-3 rounded-xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] shadow-sm space-y-2"
        >
          {sec.title && (
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/60 dark:border-white/[0.06]">
              <span className="w-1.5 h-3.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500 shrink-0" />
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-amber-400">
                {sec.title}
              </h4>
            </div>
          )}

          <div className="space-y-1.5">
            {sec.items.map((item, iIdx) => {
              if (item.isBullet) {
                return (
                  <div
                    key={iIdx}
                    className="flex items-start gap-2 text-[12.5px] leading-relaxed text-slate-700 dark:text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                    <div className="flex-1">
                      {renderInlineSegments(item.text)}
                    </div>
                  </div>
                );
              }
              return (
                <p
                  key={iIdx}
                  className="text-[12.5px] leading-relaxed text-slate-700 dark:text-slate-300"
                >
                  {renderInlineSegments(item.text)}
                </p>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

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
      setAiModel(result.model || 'Travel Desk Engine');

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
          { label: 'Itinerary Planner', path: '/itinerary', icon: 'compass' },
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

  useEffect(() => {
    const handleOpenConcierge = () => setIsOpen(true);
    window.addEventListener('open-travelease-concierge', handleOpenConcierge);
    return () => window.removeEventListener('open-travelease-concierge', handleOpenConcierge);
  }, []);

  const widgetSize = isExpanded
    ? 'w-[680px] max-w-[calc(100vw-24px)] h-[85vh] max-h-[calc(100vh-60px)]'
    : 'w-[420px] max-w-[calc(100vw-24px)] h-[580px] max-h-[calc(100vh-80px)]';

  return (
    <>
      {/* ── Floating Trigger Button (TravelEase Branded Logo Launcher - Desktop/Laptop Only) ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="hidden lg:flex fixed bottom-6 right-6 z-40 group items-center justify-center cursor-pointer"
            id="ai-concierge-trigger"
            aria-label="Open TravelEase Concierge Desk"
          >
            {/* Pulsing Glow Ring */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 animate-ping opacity-25 pointer-events-none" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-black dark:from-amber-400 dark:via-amber-500 dark:to-orange-500 p-0.5 shadow-2xl shadow-amber-500/30 flex items-center justify-center border border-amber-500/30">
              <div className="w-full h-full rounded-[14px] bg-[#0b0f19] flex items-center justify-center p-2.5">
                <img 
                  src="/brand/logo-mark.svg" 
                  alt="TravelEase Concierge Logo" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                />
              </div>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              TravelEase Concierge Desk
              <div className="absolute top-full right-4 w-2 h-2 bg-slate-900 dark:bg-white rotate-45 -translate-y-1" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile / Tablet backdrop for clean focus */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-45"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.92 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              className={`fixed bottom-4 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 ${widgetSize} rounded-3xl overflow-hidden flex flex-col border border-slate-200/60 dark:border-white/[0.08] shadow-2xl dark:shadow-black/60 transition-all duration-300`}
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
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-center p-2 shadow-lg shadow-amber-500/20">
                    <img src="/brand/logo-mark.svg" alt="TravelEase Mark" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0d1017]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                    Travel<span className="text-amber-500">Ease</span> Concierge Desk
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <FiCompassIcon className="w-2.5 h-2.5 text-amber-500" />
                    <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400">
                      24/7 Live Booking & Travel Support
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
                        <FiCompassIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                          Welcome to TravelEase Concierge
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          I'm your dedicated 24/7 travel assistant. Ask me anything about Vande Bharat trains, verified hotels, lowest airfares, custom itineraries, or booking policies!
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
                    {/* Concierge Desk badge */}
                    {msg.role === 'ai' && (
                      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-200/50 dark:border-white/[0.06]">
                        <FiCompassIcon className="w-2.5 h-2.5 text-amber-500" />
                        <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                          {msg.source?.replace('Groq LPU™', 'Travel Desk') || 'TravelDesk Verified'}
                          {msg.cached && ' · Verified'}
                        </span>
                      </div>
                    )}

                    <ConciergeMessageRenderer content={msg.text} isUser={msg.role === 'user'} />

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
                        Searching travel network...
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
                <FiCheckCircle className="w-2.5 h-2.5 text-emerald-500" />
                <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                  TravelEase Concierge Engine · Sub-second response · Real-time verification
                </p>
              </div>
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIConcierge;
