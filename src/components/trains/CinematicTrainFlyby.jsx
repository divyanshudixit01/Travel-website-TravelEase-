import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrain } from 'react-icons/fa';

/**
 * Natural Indian Railways Metro/Vande Bharat Platform Story Sequence:
 * 1. Train arrives from the left and smoothly halts at the center of the platform.
 * 2. As soon as the train stops, the pneumatic gates automatically slide open.
 * 3. The waiting passenger on the platform turns and walks directly through the open gate into the coach.
 * 4. The moment the passenger enters inside, the gates slide shut.
 * 5. Train immediately surges forward, accelerating to the end of the page.
 * 6. As the train leaves, the main train booking page opens automatically (no clicks or skip needed).
 */
const CinematicTrainFlyby = ({ isPlaying, onFinish }) => {
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  // Animation phases:
  // 'arriving'           (0s - 1.2s): Train glides in and stops at center
  // 'doors_open'         (1.2s - 1.7s): Gates automatically slide open
  // 'passenger_entering' (1.7s - 2.6s): Passenger walks forward into train gate
  // 'doors_closing'      (2.6s - 3.2s): Passenger is inside, gates slide shut
  // 'departing'          (3.2s - 4.1s): Train accelerates rapidly off screen
  // 'finished'           (4.1s): Main page opens automatically
  const [phase, setPhase] = useState('arriving');

  useEffect(() => {
    if (!isPlaying) {
      setPhase('arriving');
      return;
    }

    setPhase('arriving');

    // 1. Train halts at center -> Gates automatically open at 1.2s
    const t1 = setTimeout(() => {
      setPhase('doors_open');
    }, 1200);

    // 2. Passenger walks toward and enters the gate at 1.7s
    const t2 = setTimeout(() => {
      setPhase('passenger_entering');
    }, 1700);

    // 3. Passenger is inside -> Gates slide shut at 2.6s
    const t3 = setTimeout(() => {
      setPhase('doors_closing');
    }, 2600);

    // 4. Gates closed -> Train accelerates to end of page at 3.2s
    const t4 = setTimeout(() => {
      setPhase('departing');
    }, 3200);

    // 5. Train exits -> Reveal main booking page automatically at 4.1s
    const t5 = setTimeout(() => {
      setPhase('finished');
      if (onFinishRef.current) onFinishRef.current();
    }, 4100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isPlaying]);

  if (!isPlaying || phase === 'finished') return null;

  const doorsAreOpen = phase === 'doors_open' || phase === 'passenger_entering';
  const isDeparting = phase === 'departing';
  const hasEntered = phase === 'doors_closing' || phase === 'departing';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between bg-[#111A24] text-white select-none pointer-events-none"
      >
        {/* ═══════════════════════════════════════════════════════════
            1. AUTHENTIC INDIAN RAILWAYS STATION PLATFORM SCENERY
            ═══════════════════════════════════════════════════════════ */}

        {/* Ambient Station Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1522] via-[#142334] to-[#1A2C3D] pointer-events-none" />

        {/* Indian Railways Industrial Canopy Roof & Steel Trusses */}
        <div className="absolute top-0 left-0 right-0 h-40 z-10 pointer-events-none overflow-hidden">
          {/* Corrugated Zinc Roof Slabs */}
          <div className="w-full h-12 bg-gradient-to-b from-slate-950 via-slate-800 to-slate-900 border-b-4 border-slate-700 shadow-xl" />

          {/* Triangular Steel Rafters with Industrial Rivets */}
          <div className="w-full h-28 flex justify-between px-6 sm:px-14 pt-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-2.5 h-16 bg-slate-600 shadow-md" />
                <div className="w-14 h-1 bg-slate-500 rotate-45 -mt-10" />
                <div className="w-14 h-1 bg-slate-500 -rotate-45 -mt-1" />
                <div className="w-1 h-5 bg-slate-400 mt-2" />
                <div className="w-7 h-2 bg-amber-100 rounded-full shadow-[0_0_12px_rgba(254,240,138,0.7)]" />
              </div>
            ))}
          </div>

          {/* Overhead Electric Catenary (OHE) Wire */}
          <div className="absolute top-24 left-0 right-0 h-[1.5px] bg-slate-400/50 border-t border-dashed border-slate-400/40" />
        </div>

        {/* Station Overhead Details (Yellow Board, Clock, LED Board) */}
        <div className="relative z-20 pt-5 px-6 sm:px-12 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Iconic Indian Railways Yellow Station Signboard */}
            <div className="bg-[#FFD200] border-4 border-black px-4 py-1.5 rounded-md shadow-2xl text-black flex flex-col items-center min-w-[190px] sm:min-w-[240px]">
              <div className="flex items-center gap-2 font-black text-sm sm:text-base tracking-tight">
                <span className="font-serif">NEW DELHI</span>
                <span>·</span>
                <span>नई दिल्ली</span>
              </div>
              <div className="flex items-center justify-between w-full border-t border-black/70 pt-0.5 mt-0.5 text-[9px] font-bold text-black/90">
                <span>NDLS</span>
                <span>समुद्र तल से: 216M</span>
                <span>PLATFORM 1</span>
              </div>
            </div>

            {/* Platform Plaque */}
            <div className="hidden sm:flex flex-col items-center bg-[#7B1113] border-2 border-white/80 text-white px-3 py-1 rounded shadow-lg">
              <span className="text-[8px] font-bold uppercase tracking-wider">PLATFORM</span>
              <span className="text-lg font-black leading-none text-amber-300">1</span>
            </div>
          </div>

          {/* Analog Station Clock */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white border-4 border-slate-800 shadow-xl flex items-center justify-center relative">
              <div className="w-1 h-3 bg-black absolute top-2 rounded-full" />
              <div className="w-2.5 h-0.5 bg-black absolute right-2.5 rounded-full" />
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 z-10" />
              <div className="w-full h-full rounded-full border border-slate-300 flex items-center justify-center">
                <span className="text-[6px] font-black text-slate-800 tracking-tighter mt-3.5">IR</span>
              </div>
            </div>

            {/* Departure Info Banner */}
            <div className="hidden md:block bg-black/90 border border-amber-500/40 px-3 py-1.5 rounded-md shadow-lg">
              <div className="text-[9px] font-mono text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>22436 VANDE BHARAT EXP · DEPARTING TO DESTINATION</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            2. THE UNIFIED STAGE: TRACK, TRAIN & FOREGROUND PLATFORM
            ═══════════════════════════════════════════════════════════ */}
        <div className="relative w-full h-[65vh] flex flex-col justify-end overflow-hidden">
          
          {/* ─── BALLAST GRAVEL & STEEL TRACK (Directly behind the platform edge) ─── */}
          <div className="absolute bottom-[130px] left-0 right-0 h-16 bg-[#2B2625] border-t-2 border-[#1E1A19] flex flex-col justify-between shadow-inner z-10">
            {/* Railway Sleepers / Ties */}
            <div className="w-full h-full flex justify-between px-1 opacity-75">
              {[...Array(44)].map((_, i) => (
                <div key={i} className="w-2 h-full bg-[#4A423D] border-x border-[#1E1A19]" />
              ))}
            </div>
            {/* Top Steel Rail */}
            <div className="absolute top-2 left-0 right-0 h-[3px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            {/* Bottom Steel Rail */}
            <div className="absolute bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          </div>

          {/* ─── MOVING TRAIN RAKE (Sits directly on the rails at bottom: 130px) ─── */}
          <motion.div
            initial={{ x: '-130vw' }}
            animate={{
              x: isDeparting ? '135vw' : 0
            }}
            transition={{
              duration: isDeparting ? 0.9 : 1.2,
              ease: isDeparting ? [0.45, 0, 0.9, 0.2] : [0.18, 1, 0.32, 1]
            }}
            className="absolute bottom-[134px] left-0 right-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
              {/* 1. Trailing Coach B3 (Left) */}
              <div className="relative w-48 sm:w-64 h-44 sm:h-52 bg-[#002B49] border-y-2 border-l-2 border-slate-700 rounded-l-2xl order-1 flex items-center justify-around p-3 overflow-hidden shadow-2xl">
                {[1, 2].map((i) => (
                  <div key={i} className="w-16 sm:w-20 h-20 sm:h-24 bg-gradient-to-b from-sky-950 to-slate-900 rounded-xl border border-slate-600 p-1">
                    <div className="w-full h-full bg-amber-400/10 rounded flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-amber-200/40 blur-[2px]" />
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Main Center Passenger Coach B4 (Boarding Entrance) */}
              <div className="relative w-[340px] sm:w-[460px] h-44 sm:h-52 bg-[#002B49] border-y-2 border-slate-700 order-2 flex flex-col justify-between p-3 overflow-hidden shadow-2xl">
                {/* Coach Signage */}
                <div className="flex items-center justify-between px-2 pt-1 border-b border-white/10 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-amber-400">COACH B4</span>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">AC CHAIR CAR / EXECUTIVE</span>
                  </div>
                  <div className="bg-black/90 px-2 py-0.5 rounded border border-amber-500/50 text-[9px] font-mono font-black text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>NDLS ➔ DESTINATION</span>
                  </div>
                </div>

                {/* ── AUTOMATIC PNEUMATIC SLIDING GATES (EXACTLY IN CENTER) ── */}
                <div className="relative my-auto w-48 sm:w-60 h-32 sm:h-36 mx-auto bg-slate-950 rounded-t-xl border-t-2 border-x-2 border-slate-600 overflow-hidden flex items-center justify-center shadow-inner">
                  
                  {/* Overhead Door Status Light */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/90 border border-white/25">
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                        doorsAreOpen
                          ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                          : 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse'
                      }`}
                    />
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-200">
                      {doorsAreOpen ? 'GATE OPEN' : 'GATES CLOSED'}
                    </span>
                  </div>

                  {/* ── Warm Illuminated Coach Interior ── */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 via-[#0A4D68] to-[#001D33] p-2 flex flex-col justify-between items-center text-center">
                    <div className="pt-3">
                      <p className="text-[9px] font-black text-amber-300 uppercase tracking-widest">
                        RESERVED COMPARTMENT
                      </p>
                      <p className="text-xs font-black text-white">
                        Welcome to Indian Railways
                      </p>
                    </div>

                    {/* Boarding Confirmation Status */}
                    <motion.div
                      animate={
                        hasEntered
                          ? { scale: [0.8, 1.05, 1], opacity: 1 }
                          : { scale: 0.8, opacity: 0 }
                      }
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center"
                    >
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] shadow-lg">
                        ✓ Passenger Boarded
                      </span>
                    </motion.div>

                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  </div>

                  {/* ── Left Sliding Door Leaf ── */}
                  <motion.div
                    animate={doorsAreOpen ? { x: '-95%' } : { x: '0%' }}
                    transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                    className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 border-r border-slate-700 z-20 flex flex-col justify-center items-center shadow-xl"
                  >
                    <div className="w-12 sm:w-16 h-20 sm:h-24 bg-gradient-to-b from-sky-950 to-slate-900 rounded-lg border border-slate-500 p-1 flex items-center justify-center">
                      <div className="w-full h-full bg-sky-400/20 rounded border border-white/20" />
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-slate-900" />
                  </motion.div>

                  {/* ── Right Sliding Door Leaf ── */}
                  <motion.div
                    animate={doorsAreOpen ? { x: '95%' } : { x: '0%' }}
                    transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                    className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-slate-200 via-slate-300 to-slate-200 border-l border-slate-700 z-20 flex flex-col justify-center items-center shadow-xl"
                  >
                    <div className="w-12 sm:w-16 h-20 sm:h-24 bg-gradient-to-b from-sky-950 to-slate-900 rounded-lg border border-slate-500 p-1 flex items-center justify-center">
                      <div className="w-full h-full bg-sky-400/20 rounded border border-white/20" />
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
                  </motion.div>
                </div>

                {/* Bottom Coach Accent Stripe */}
                <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-full mt-1" />
              </div>

              {/* 3. Aerodynamic Locomotive Nose (Leading Right) */}
              <div className="relative w-64 sm:w-80 h-44 sm:h-52 bg-gradient-to-r from-[#002B49] via-[#0B3C61] to-[#D9E2EC] rounded-r-[110px] border-y-2 border-r-2 border-amber-400/40 flex items-center overflow-hidden order-3 shadow-2xl">
                {/* Cockpit Windshield */}
                <div className="absolute top-6 right-8 w-24 h-16 bg-gradient-to-tr from-slate-950 via-sky-950 to-sky-400/50 rounded-r-3xl rounded-l-md border border-sky-400/80 transform skew-x-12 shadow-inner" />
                
                {/* Twin High-Intensity LED Headlights */}
                <div className="absolute bottom-10 right-4 flex flex-col gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[0_0_20px_#fde047] animate-pulse" />
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[0_0_20px_#fde047] animate-pulse" />
                </div>

                {/* Indian Tricolor Speed Cheatline */}
                <div className="absolute bottom-5 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-white to-emerald-500" />
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════
              3. THE FOREGROUND PLATFORM (Rises flush with the train floor)
              ═══════════════════════════════════════════════════════════ */}
          <div className="relative z-30 h-[130px] bg-gradient-to-b from-[#2A313A] via-[#1E242B] to-[#12161A] border-t-4 border-slate-600 shadow-[0_-15px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between px-6 pb-4 pt-0">
            
            {/* Yellow Tactile Blistered Safety Warning Strip along Platform Edge */}
            <div className="w-full h-3.5 bg-yellow-400 border-b border-yellow-600 rounded-b-sm flex items-center justify-around overflow-hidden shadow-inner -mt-[2px]">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="w-1 h-2.5 bg-black/40 rounded-full" />
              ))}
            </div>

            {/* Platform Floor Texture & Station Status Narration */}
            <div className="max-w-4xl mx-auto w-full flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
                <FaTrain className="text-amber-400 text-sm" />
                <span>
                  {phase === 'arriving' && 'Train 22436 arriving at Platform 1...'}
                  {phase === 'doors_open' && 'Train halted at platform · Automatic gates opening...'}
                  {phase === 'passenger_entering' && 'Passenger boarding coach B4...'}
                  {phase === 'doors_closing' && 'Passenger inside coach · Gates closed...'}
                  {phase === 'departing' && 'Departing to destination · Opening Train Portal...'}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Automated Boarding Transition</span>
              </div>
            </div>

            {/* ─── PASSENGER FIGURE STANDING ON PLATFORM DIRECTLY IN FRONT OF GATE ─── */}
            <motion.div
              initial={{ y: 0, scale: 1, opacity: 1 }}
              animate={
                phase === 'arriving'
                  ? { y: 0, scale: 1, opacity: 1 } // Standing waiting on platform
                  : phase === 'doors_open'
                  ? { y: -4, scale: 1, opacity: 1 } // Prepares to move as gate opens
                  : phase === 'passenger_entering'
                  ? { y: -50, scale: 0.72, opacity: [1, 0.9, 0] } // Walks 50px UP directly into coach doorway
                  : { y: -50, scale: 0.72, opacity: 0 } // Disappears inside coach cabin
              }
              transition={
                phase === 'passenger_entering'
                  ? { duration: 0.8, ease: [0.25, 1, 0.5, 1] }
                  : { duration: 0.25 }
              }
              className="absolute top-2 left-1/2 -translate-x-1/2 flex items-end gap-2 pointer-events-none z-40"
            >
              {/* Red Travel Trolley Suitcase */}
              <div className="w-4 h-9 bg-red-800 rounded border border-red-950 flex flex-col justify-between p-0.5 shadow-xl">
                <div className="w-2 h-1 bg-slate-900 mx-auto rounded-t" />
                <div className="w-full h-0.5 bg-amber-400" />
                <div className="w-full flex justify-between">
                  <span className="w-1 h-1 rounded-full bg-black" />
                  <span className="w-1 h-1 rounded-full bg-black" />
                </div>
              </div>

              {/* Passenger Body */}
              <div className="flex flex-col items-center">
                {/* Head with cap */}
                <div className="w-5 h-5 rounded-full bg-amber-200 border-2 border-slate-900 shadow-sm relative">
                  <div className="w-4 h-1.5 bg-[#002B49] rounded-t-full absolute -top-0.5 left-0.5" />
                </div>
                {/* Torso with travel jacket & backpack */}
                <div className="w-7 h-9 bg-[#002B49] rounded-t-md border-x border-slate-800 shadow-md relative">
                  <div className="w-1.5 h-6 bg-amber-600 rounded-sm absolute left-0.5 top-1" />
                  <div className="w-1.5 h-6 bg-amber-600 rounded-sm absolute right-0.5 top-1" />
                </div>
                {/* Legs */}
                <div className="flex gap-1 -mt-0.5">
                  <div className="w-2.5 h-8 bg-slate-800 rounded-b" />
                  <div className="w-2.5 h-8 bg-slate-800 rounded-b" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CinematicTrainFlyby;
