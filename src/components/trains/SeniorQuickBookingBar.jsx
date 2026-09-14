import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaHeart, FaWheelchair, FaPhoneAlt, FaCheckCircle,
  FaPray, FaVolumeUp, FaVolumeMute
} from 'react-icons/fa';

// Web Audio API gentle accessibility confirmation chime
const playAccessChime = (freq = 523.25) => { // C5 pleasant chime
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
};

// Accessible Voice Cue for Seniors
const speakAccessibilityCue = (text) => {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92; // Slower, calm pacing for elder clarity
      utterance.pitch = 1.0;
      utterance.volume = 0.75;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {}
};

const PILGRIMAGE_PRESETS = [
  { name: 'Kashi Vishwanath', from: 'LKO', fromName: 'Lucknow', to: 'BSB', toName: 'Varanasi', icon: '🛕' },
  { name: 'Ayodhya Dham', from: 'LKO', fromName: 'Lucknow', to: 'AY', toName: 'Ayodhya', icon: '🚩' },
  { name: 'Haridwar Ganga', from: 'NDLS', fromName: 'Delhi', to: 'HW', toName: 'Haridwar', icon: '🌊' },
  { name: 'Tirupati Balaji', from: 'MAS', fromName: 'Chennai', to: 'TPTY', toName: 'Tirupati', icon: '🙏' },
  { name: 'Jagannath Puri', from: 'HWH', fromName: 'Howrah', to: 'PURI', toName: 'Puri', icon: '🛕' },
  { name: 'Shirdi Saibaba', from: 'CSMT', fromName: 'Mumbai', to: 'SNSI', toName: 'Shirdi', icon: '✨' },
];

const SeniorQuickBookingBar = ({
  onSelectRoute,
  requireLowerBerth,
  setRequireLowerBerth,
  requireWheelchair,
  setRequireWheelchair
}) => {
  const [voiceVoiceEnabled, setVoiceEnabled] = useState(true);

  const handleRouteClick = (p) => {
    playAccessChime(659.25);
    if (voiceVoiceEnabled) {
      speakAccessibilityCue(`Selecting sacred route for ${p.name}, from ${p.fromName} to ${p.toName}`);
    }
    onSelectRoute(p.from, p.to);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900/95 border-2 border-emerald-500/50 rounded-3xl p-6 md:p-8 shadow-xl dark:shadow-2xl text-left max-w-5xl mx-auto mb-8 text-slate-900 dark:text-white transition-colors"
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-emerald-500/20 dark:border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-400/50 flex items-center justify-center text-2xl text-emerald-600 dark:text-emerald-400 shrink-0">
            <FaHeart />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              वरिष्ठ नागरिक सेवा · Senior Citizen Care
            </h2>
            <p className="text-xs md:text-sm text-emerald-700 dark:text-emerald-200 font-semibold">
              Simplified high-contrast booking · Automatic lower berth priority · 24x7 RailMadad Assistance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playAccessChime(587);
              setVoiceEnabled(!voiceVoiceEnabled);
            }}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              voiceVoiceEnabled
                ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/20 text-slate-600 dark:text-slate-400'
            }`}
            title="Toggle Voice Assistant Cue"
          >
            {voiceVoiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            <span>{voiceVoiceEnabled ? 'Voice Guidance On' : 'Voice Off'}</span>
          </button>

          <a
            href="tel:139"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs md:text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <FaPhoneAlt />
            <span>Call 139 (Indian Railways Helpline)</span>
          </a>
        </div>
      </div>

      {/* Special Preferences for Elders with Audio Accessibility Chimes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
        <label
          onClick={() => {
            const next = !requireLowerBerth;
            playAccessChime(next ? 587 : 440);
            if (voiceVoiceEnabled) {
              speakAccessibilityCue(next ? 'Lower berth priority requested' : 'Lower berth priority deselected');
            }
            setRequireLowerBerth(next);
          }}
          className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
            requireLowerBerth
              ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 dark:border-emerald-400 text-slate-900 dark:text-white shadow-sm'
              : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border text-sm ${
            requireLowerBerth ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-white/30'
          }`}>
            {requireLowerBerth && <FaCheckCircle />}
          </div>
          <div>
            <p className="text-sm md:text-base font-black text-slate-900 dark:text-white">Lower Berth Priority (निचली बर्थ प्राथमिकता)</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">IRCTC Senior Citizen quota automatically requested</p>
          </div>
        </label>

        <label
          onClick={() => {
            const next = !requireWheelchair;
            playAccessChime(next ? 587 : 440);
            if (voiceVoiceEnabled) {
              speakAccessibilityCue(next ? 'Wheelchair assistance requested' : 'Wheelchair assistance deselected');
            }
            setRequireWheelchair(next);
          }}
          className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
            requireWheelchair
              ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 dark:border-emerald-400 text-slate-900 dark:text-white shadow-sm'
              : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border text-sm ${
            requireWheelchair ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-white/30'
          }`}>
            {requireWheelchair && <FaCheckCircle />}
          </div>
          <div>
            <p className="text-sm md:text-base font-black flex items-center gap-2 text-slate-900 dark:text-white">
              <FaWheelchair className="text-emerald-600 dark:text-emerald-400 text-xs" />
              Wheelchair & Battery Cart Assistance (व्हीलचेयर सहायता)
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Free station porter & wheelchair assistance at boarding</p>
          </div>
        </label>
      </div>

      {/* Popular Pilgrimage & Calm Travel Corridors */}
      <div className="pt-2">
        <p className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-300 tracking-wider mb-3 flex items-center gap-2">
          <FaPray />
          One-Click Pilgrimage & Spiritual Corridors (तीर्थ यात्रा मार्ग):
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PILGRIMAGE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleRouteClick(p)}
              className="p-3 bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 dark:hover:border-emerald-400/50 rounded-2xl text-left transition-all group shadow-sm"
            >
              <span className="text-lg block mb-1">{p.icon}</span>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 truncate">
                {p.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {p.fromName} ➔ {p.toName}
              </p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SeniorQuickBookingBar;
