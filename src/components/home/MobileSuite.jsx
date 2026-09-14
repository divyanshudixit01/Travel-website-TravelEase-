import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaApple, FaGooglePlay, FaTrain, FaPlane, FaRobot, FaCheckCircle, 
  FaStar, FaBolt, FaQrcode, FaWifi, FaBatteryFull, FaSignal 
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FiSmartphone, FiBell } from 'react-icons/fi';

export const MobileSuite = () => {
  const [activeScreen, setActiveScreen] = useState('tatkal'); // 'tatkal' | 'boarding' | 'concierge'
  const [showQrModal, setShowQrModal] = useState(false);

  const screens = [
    { id: 'tatkal', label: 'Tatkal Radar', icon: <FaTrain className="w-3.5 h-3.5" /> },
    { id: 'boarding', label: 'Smart Pass', icon: <FaPlane className="w-3.5 h-3.5" /> },
    { id: 'concierge', label: 'AI Concierge', icon: <FaRobot className="w-3.5 h-3.5" /> },
  ];

  const features = [
    {
      icon: <FaBolt className="w-4 h-4 text-amber-500" />,
      title: 'Sub-Second Tatkal Automation',
      desc: 'Auto-fills IRCTC captcha, handles multi-rail UPI autopay, and secures confirmed seats in under 200ms.',
    },
    {
      icon: <FiBell className="w-4 h-4 text-emerald-500" />,
      title: 'Real-Time Flight & Gate Radars',
      desc: 'Receive live push notifications for gate changes, baggage carousels, and delay predictions before the airport announces them.',
    },
    {
      icon: <HiOutlineSparkles className="w-4 h-4 text-sky-500" />,
      title: 'Offline Biometric Boarding Passes',
      desc: 'All tickets, train passes, and hotel vouchers cached securely offline with Apple Wallet and Google Wallet integration.',
    },
  ];

  return (
    <section className="relative py-28 px-4 overflow-hidden bg-slate-50 dark:bg-[#06080d] border-t border-slate-200/90 dark:border-white/10 transition-colors duration-500" id="mobile-suite">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/8 dark:bg-amber-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-indigo-500/8 dark:bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-sm">
            <FiSmartphone className="w-3.5 h-3.5" />
            <span>MOBILE SUITE · iOS & ANDROID ECOSYSTEM</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            The Entire World in Your Pocket.{' '}
            <span className="text-gradient-primary block sm:inline">Built for Pure Speed.</span>
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg font-medium leading-relaxed">
            Rated <span className="text-amber-500 font-bold">4.95/5</span> across 142,000+ verified explorer reviews. Experience zero-friction rail booking, biometric boarding passes, and autonomous travel intelligence.
          </p>
        </div>

        {/* Main Grid: Feature Highlights (Left) + iPhone 17 Pro Mockup (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left: Feature Suite & Download Station (7 Cols) */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* Feature Cards */}
            <div className="space-y-3.5">
              {features.map((feat, idx) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-5 rounded-2xl bg-white/95 dark:bg-[#0e111a]/85 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 hover:border-amber-400/50 dark:hover:border-white/20 transition-all shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-md group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                      {feat.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* App Rating Telemetry Pill */}
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
                <span className="font-bold">4.95 / 5.0</span> · Over 2.4 Million Active Mobile Expeditions
              </div>
            </div>

            {/* Download Buttons + Interactive QR Code Trigger */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="https://apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/80 shadow-sm hover:shadow dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/15 font-mono text-xs font-bold transition-all hover:scale-105 active:scale-95 group"
              >
                <FaApple className="w-5 h-5 text-slate-900 dark:text-white group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase leading-none font-sans font-medium">Download on</div>
                  <div className="text-sm font-bold font-sans text-slate-900 dark:text-white leading-tight">App Store</div>
                </div>
              </a>

              <a
                href="https://google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/80 shadow-sm hover:shadow dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/15 font-mono text-xs font-bold transition-all hover:scale-105 active:scale-95 group"
              >
                <FaGooglePlay className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase leading-none font-sans font-medium">Get it on</div>
                  <div className="text-sm font-bold font-sans text-slate-900 dark:text-white leading-tight">Google Play</div>
                </div>
              </a>

              <button
                type="button"
                onClick={() => setShowQrModal(!showQrModal)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-300/80 dark:border-white/12 text-xs font-mono font-bold transition-all shadow-sm hover:border-amber-400/50 active:scale-95"
              >
                <FaQrcode className="w-4 h-4 text-amber-500" />
                <span>SCAN QR</span>
              </button>
            </div>

            {/* Expandable QR Station */}
            <AnimatePresence>
              {showQrModal && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-5 rounded-2xl bg-white dark:bg-[#121520] border border-slate-200 dark:border-white/15 shadow-xl flex items-center gap-5 overflow-hidden"
                >
                  <div className="w-22 h-22 p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-sm flex items-center justify-center">
                    <div className="w-full h-full grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-lg">
                      <div className="bg-white rounded-sm col-span-2 row-span-2"></div>
                      <div className="bg-white rounded-sm"></div>
                      <div className="bg-amber-400 rounded-sm"></div>
                      <div className="bg-white rounded-sm"></div>
                      <div className="bg-white rounded-sm col-span-2 row-span-2"></div>
                      <div className="bg-white rounded-sm"></div>
                      <div className="bg-amber-400 rounded-sm"></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Instant App Direct Link</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Scan with any iOS or Android camera</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Compatible with iOS 16+ & Android 12+</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right: Authentic Apple iPhone 17 Pro Mockup (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Screen Switcher Control Bar */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-slate-200/80 dark:bg-white/5 border border-slate-300/80 dark:border-white/10 shadow-sm mb-6">
              {screens.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveScreen(s.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                    activeScreen === s.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm scale-105'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Authentic Apple iPhone 17 Pro Container */}
            <div className="relative flex items-center justify-center py-2">
              
              {/* iPhone 17 Pro Hardware Chassis */}
              <div className="relative w-[280px] sm:w-[295px] aspect-[9/18.8] rounded-[48px] p-[10px] bg-gradient-to-b from-stone-300 via-stone-200 to-stone-400 dark:from-zinc-800 dark:via-zinc-900 dark:to-black border-[3.5px] border-stone-300/90 dark:border-zinc-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22),0_0_25px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_65px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)] transition-all">
                
                {/* Physical Hardware Buttons */}
                {/* Left: Action Button */}
                <div className="w-[3px] h-3.5 bg-stone-400 dark:bg-zinc-600 rounded-l-sm absolute -left-[5.5px] top-[75px] shadow-sm" />
                {/* Left: Volume Up */}
                <div className="w-[3px] h-7 bg-stone-400 dark:bg-zinc-600 rounded-l-sm absolute -left-[5.5px] top-[102px] shadow-sm" />
                {/* Left: Volume Down */}
                <div className="w-[3px] h-7 bg-stone-400 dark:bg-zinc-600 rounded-l-sm absolute -left-[5.5px] top-[138px] shadow-sm" />
                {/* Right: Side Power Button */}
                <div className="w-[3px] h-10 bg-stone-400 dark:bg-zinc-600 rounded-r-sm absolute -right-[5.5px] top-[95px] shadow-sm" />
                {/* Right: iPhone 16/17 Pro Camera Control Sensor */}
                <div className="w-[2.5px] h-8 bg-stone-400/80 dark:bg-zinc-600/80 rounded-r-sm absolute -right-[5px] top-[185px] shadow-inner" />

                {/* Inner Bezel Screen Frame */}
                <div className="w-full h-full rounded-[38px] bg-slate-100 dark:bg-[#090b12] text-slate-900 dark:text-white overflow-hidden relative flex flex-col justify-between pt-3 pb-3 px-3.5 select-none border border-black/5 dark:border-white/5 transition-colors">
                  
                  {/* Dynamic Island (iPhone 17 Pro Pill) */}
                  <div className="w-24 h-[22px] bg-black rounded-full mx-auto flex items-center justify-between px-2.5 shadow-md z-40 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#0a1226] border border-blue-500/30" />
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />
                  </div>

                  {/* iOS Status Bar */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-400 px-1 mt-1 mb-2">
                    <span className="font-bold text-slate-900 dark:text-white">09:41</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <FaSignal className="w-2.5 h-2.5" />
                      <FaWifi className="w-3 h-3" />
                      <FaBatteryFull className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                  </div>

                  {/* Dynamic Screen Content */}
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    <AnimatePresence mode="wait">
                      
                      {/* SCREEN 1: IRCTC TATKAL RADAR */}
                      {activeScreen === 'tatkal' && (
                        <motion.div
                          key="tatkal"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-2.5"
                        >
                          {/* Live Radar Header Pill */}
                          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">TATKAL RADAR LIVE</span>
                            </div>
                            <span className="text-[9px] font-mono bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">98% CONFIRMED</span>
                          </div>

                          {/* Train Live Status Card */}
                          <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-xs text-slate-900 dark:text-white">22436 Vande Bharat</div>
                              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">160 km/h</span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <div>
                                <div className="text-[9px] text-slate-500 dark:text-slate-400">NDLS (NEW DELHI)</div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">06:00 AM</div>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[8.5px] text-amber-600 dark:text-amber-400 font-bold">8h 00m</span>
                                <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 to-emerald-400 my-0.5"></div>
                                <span className="text-[8.5px] text-emerald-600 dark:text-emerald-400 font-semibold">ON TIME</span>
                              </div>
                              <div className="text-right">
                                <div className="text-[9px] text-slate-500 dark:text-slate-400">BSB (VARANASI)</div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">02:00 PM</div>
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[10px] font-mono">
                              <span className="text-slate-500 dark:text-slate-400">Quota: Tatkal AC Exec</span>
                              <span className="text-amber-600 dark:text-amber-400 font-bold">₹1,750</span>
                            </div>
                          </div>

                          {/* Confirmed Seat Notification Banner */}
                          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2">
                            <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 w-3.5 h-3.5 shrink-0" />
                            <div>
                              <div className="text-[11px] font-bold text-slate-900 dark:text-white">Confirmed: Coach B4 · 42B</div>
                              <div className="text-[9px] font-mono text-emerald-700 dark:text-emerald-300">UPI Autopay in 182ms</div>
                            </div>
                          </div>

                          <div className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-mono text-[11px] font-bold text-center shadow-md">
                            ONE-TAP AUTOPAY READY
                          </div>
                        </motion.div>
                      )}

                      {/* SCREEN 2: SMART BOARDING PASS */}
                      {activeScreen === 'boarding' && (
                        <motion.div
                          key="boarding"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-2.5"
                        >
                          <div className="p-3 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-indigo-950/80 dark:to-slate-900 border border-slate-200/90 dark:border-white/15 shadow-sm space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400">EMIRATES · EK 512</span>
                              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">GATE OPEN</span>
                            </div>

                            <div className="flex items-center justify-between text-xs font-mono">
                              <div>
                                <div className="text-lg font-black text-slate-900 dark:text-white">DEL</div>
                                <div className="text-[9px] text-slate-500 dark:text-slate-400">Terminal 3</div>
                              </div>
                              <FaPlane className="text-amber-500 w-3.5 h-3.5" />
                              <div className="text-right">
                                <div className="text-lg font-black text-slate-900 dark:text-white">DXB</div>
                                <div className="text-[9px] text-slate-500 dark:text-slate-400">Terminal 1</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-slate-100 dark:border-white/10 text-center font-mono">
                              <div>
                                <div className="text-[8px] text-slate-500 dark:text-slate-400">GATE</div>
                                <div className="text-xs font-bold text-amber-600 dark:text-amber-400">14B</div>
                              </div>
                              <div>
                                <div className="text-[8px] text-slate-500 dark:text-slate-400">SEAT</div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">3A</div>
                              </div>
                              <div>
                                <div className="text-[8px] text-slate-500 dark:text-slate-400">ZONE</div>
                                <div className="text-xs font-bold text-sky-600 dark:text-sky-400">VIP</div>
                              </div>
                            </div>

                            {/* Scannable Barcode */}
                            <div className="flex flex-col items-center pt-0.5">
                              <div className="w-full h-7 bg-slate-900 dark:bg-white rounded flex items-center justify-center px-2">
                                <div className="w-full h-4 flex justify-between">
                                  {[...Array(24)].map((_, i) => (
                                    <div key={i} className={`h-full bg-white dark:bg-black ${i % 3 === 0 ? 'w-1' : 'w-0.5'}`}></div>
                                  ))}
                                </div>
                              </div>
                              <span className="text-[8px] font-mono text-slate-500 dark:text-slate-400 mt-1">EK-9482910385710</span>
                            </div>
                          </div>

                          <div className="p-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-[10px] font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between shadow-sm">
                            <span>Baggage: Carousel 04</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">LOADED</span>
                          </div>
                        </motion.div>
                      )}

                      {/* SCREEN 3: GEMINI 2.5 CONCIERGE */}
                      {activeScreen === 'concierge' && (
                        <motion.div
                          key="concierge"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-2 text-xs"
                        >
                          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-1.5">
                            <HiOutlineSparkles className="text-amber-500 w-3.5 h-3.5" />
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-300 text-[10px]">Gemini 2.5 Concierge</span>
                          </div>

                          {/* Chat Messages */}
                          <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 space-y-0.5 shadow-sm">
                            <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500">You · 09:39</div>
                            <p className="text-[11px] leading-snug">Find a quiet sunset rooftop cafe near Assi Ghat with river view.</p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-slate-800 dark:text-slate-200 space-y-0.5 shadow-sm">
                            <div className="text-[9px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              TravelEase AI · 09:40
                            </div>
                            <p className="text-[11px] leading-snug">
                              Reserved Table 4 at <strong>Pizzeria Vaatika Cafe</strong> facing sunset Aarti. 4 min walk.
                            </p>
                          </div>

                          <div className="p-2 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 flex items-center justify-between text-[10px] font-mono shadow-sm">
                            <span className="text-slate-500 dark:text-slate-400">Walking 280m</span>
                            <span className="text-amber-600 dark:text-amber-400 font-bold">START ROUTE</span>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* iPhone Bottom Home Indicator */}
                  <div className="w-24 h-1 bg-slate-400 dark:bg-white/40 rounded-full mx-auto mt-1 shrink-0" />
                </div>

                {/* Floating Telemetry Badge 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="absolute -left-7 bottom-12 p-2.5 rounded-2xl bg-white/95 dark:bg-[#10131f]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/15 text-slate-900 dark:text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.8)] hidden sm:flex items-center gap-2 text-xs font-mono pointer-events-none"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FaBolt className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">TATKAL RADAR</div>
                    <div className="font-bold text-slate-900 dark:text-white text-[11px]">Confirmed in 180ms</div>
                  </div>
                </motion.div>

                {/* Floating Telemetry Badge 2 */}
                <motion.div
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="absolute -right-7 top-16 p-2.5 rounded-2xl bg-white/95 dark:bg-[#10131f]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/15 text-slate-900 dark:text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.8)] hidden sm:flex items-center gap-2 text-xs font-mono pointer-events-none"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <FaPlane className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">FLIGHT 6E-204</div>
                    <div className="font-bold text-amber-600 dark:text-amber-300 text-[11px]">Gate 14B · Boarding</div>
                  </div>
                </motion.div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default MobileSuite;
