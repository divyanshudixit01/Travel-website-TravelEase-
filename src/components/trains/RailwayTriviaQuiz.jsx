import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserGraduate, FaTrophy, FaCheck, FaTimes, FaRedo, FaStar } from 'react-icons/fa';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'When and between which stations did the first passenger train run in India?',
    options: [
      '16 April 1853 — Bori Bunder (Mumbai) to Thane',
      '15 August 1947 — New Delhi to Agra',
      '26 January 1950 — Howrah to Hooghly',
      '1 October 1888 — Victoria Terminus to Pune'
    ],
    correct: 0,
    fact: 'On 16 April 1853 at 3:35 PM, 3 locomotives named Sindh, Sultan, and Sahib pulled 14 carriages carrying 400 guests over 34 km!'
  },
  {
    id: 2,
    question: 'Which is the world’s oldest functioning steam locomotive, certified by Guinness World Records?',
    options: [
      'Black Beauty (1862)',
      'The Fairy Queen (Built in 1855)',
      'Flying Scotsman (1923)',
      'Deccan Queen (1930)'
    ],
    correct: 1,
    fact: 'The Fairy Queen (EIR-22) was built in 1855 and still operates heritage luxury runs between New Delhi and Alwar!'
  },
  {
    id: 3,
    question: 'How high is the Chenab Rail Arch Bridge, making it the highest railway bridge in the world?',
    options: [
      '250 meters above river level',
      '300 meters (same as Eiffel Tower)',
      '359 meters (35 meters taller than the Eiffel Tower)',
      '500 meters'
    ],
    correct: 2,
    fact: 'The colossal steel arch bridge over the Chenab River in Reasi, Jammu & Kashmir soars 359 meters above the river bed!'
  },
  {
    id: 4,
    question: 'Which Indian train covers the longest distance and takes 75 hours across 9 states?',
    options: [
      'Himsagar Express',
      'Vivek Express (Dibrugarh to Kanyakumari — 4,189 km)',
      'Grand Trunk Express',
      'Kerala Express'
    ],
    correct: 1,
    fact: 'Train #15906 Vivek Express covers 4,189 km from Assam to Tamil Nadu across 75 hours and 58 halts!'
  },
  {
    id: 5,
    question: 'Which unique railway station has its platform split exactly between two Indian states?',
    options: [
      'Nagpur Junction',
      'Navapur (Half in Maharashtra, half in Gujarat)',
      'Mughalsarai',
      'Jhansi Junction'
    ],
    correct: 1,
    fact: 'At Navapur station, the station master announces announcements in 4 languages because half the platform is in Maharashtra and half in Gujarat!'
  }
];

const RailwayTriviaQuiz = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFact, setShowFact] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (idx) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowFact(true);
    if (idx === q.correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowFact(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowFact(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto shadow-xl dark:shadow-2xl text-left my-8 text-slate-900 dark:text-white relative overflow-hidden transition-colors">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 dark:bg-cyan-500/20 border border-cyan-500/30 dark:border-cyan-400/40 flex items-center justify-center text-xl text-cyan-600 dark:text-cyan-400 shrink-0">
            <FaUserGraduate />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Indian Railways Heritage Explorer Quiz 🎓
            </h3>
            <p className="text-xs text-cyan-700 dark:text-cyan-300 font-semibold">
              Test your knowledge & earn the official TravelVerse Junior Rail Officer Badge!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-xl border border-slate-200 dark:border-white/15 text-xs font-black text-slate-800 dark:text-white">
          <FaStar className="text-amber-500 dark:text-amber-400" />
          <span>Score: {score} / {QUIZ_QUESTIONS.length}</span>
        </div>
      </div>

      {!isCompleted ? (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold mb-2">
            <span>QUESTION {currentIdx + 1} OF {QUIZ_QUESTIONS.length}</span>
            <span>{Math.round(((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100)}% Completed</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white mb-5 leading-relaxed">
            {q.question}
          </h4>

          <div className="space-y-3 mb-6">
            {q.options.map((opt, i) => {
              const isChosen = selectedOption === i;
              const isCorrect = i === q.correct;
              let btnStyle = 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-cyan-50/60 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200';

              if (selectedOption !== null) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-50 dark:bg-emerald-500/25 border-emerald-500 dark:border-emerald-400 text-emerald-800 dark:text-emerald-300 shadow-md shadow-emerald-500/20';
                } else if (isChosen) {
                  btnStyle = 'bg-rose-50 dark:bg-rose-500/25 border-rose-500 dark:border-rose-400 text-rose-800 dark:text-rose-300 shadow-md shadow-rose-500/20';
                }
              }

              return (
                <button
                  key={i}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelect(i)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs md:text-sm font-bold transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {selectedOption !== null && isCorrect && (
                    <FaCheck className="text-emerald-600 dark:text-emerald-400 text-sm shrink-0 ml-2" />
                  )}
                  {selectedOption !== null && isChosen && !isCorrect && (
                    <FaTimes className="text-rose-600 dark:text-rose-400 text-sm shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showFact && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/40 rounded-2xl mb-6 text-xs text-cyan-900 dark:text-cyan-200"
              >
                <p className="font-extrabold uppercase text-cyan-700 dark:text-cyan-400 text-[10px] mb-1">
                  💡 DID YOU KNOW? (ऐतिहासिक तथ्य)
                </p>
                <p className="leading-relaxed font-semibold">{q.fact}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedOption !== null && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-2xl text-xs md:text-sm font-black shadow-lg shadow-cyan-500/25 transition-all"
              >
                {currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question ➔' : 'View Your Badge 🏆'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Complete & Badge Award Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 mx-auto flex items-center justify-center text-4xl text-slate-950 shadow-2xl shadow-amber-500/30 mb-4 animate-bounce">
            <FaTrophy />
          </div>

          <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            Certified Rail Explorer
          </span>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
            Congratulations! You scored {score} / {QUIZ_QUESTIONS.length}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-2">
            {score >= 4
              ? 'Outstanding! You possess the knowledge of a true Chief Railway Historian.'
              : 'Great effort! You have unlocked the Junior Indian Railways Explorer badge.'}
          </p>

          {/* Badges Earned */}
          <div className="flex flex-wrap justify-center gap-3 my-6">
            <div className="p-3 bg-slate-50 dark:bg-white/5 border border-amber-500/40 rounded-2xl flex items-center gap-2.5 text-left shadow-sm">
              <span className="text-2xl">🚂</span>
              <div>
                <p className="text-xs font-black text-amber-700 dark:text-amber-300">Steam Pioneer Badge</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">1853 Heritage Connoisseur</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-white/5 border border-cyan-500/40 rounded-2xl flex items-center gap-2.5 text-left shadow-sm">
              <span className="text-2xl">🌉</span>
              <div>
                <p className="text-xs font-black text-cyan-700 dark:text-cyan-300">Chenab Arch Master</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Engineering Marvel Specialist</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-white/5 border border-emerald-500/40 rounded-2xl flex items-center gap-2.5 text-left shadow-sm">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-xs font-black text-emerald-700 dark:text-emerald-300">Vande Bharat Scholar</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Next-Gen Speedster</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/20 rounded-2xl text-xs font-black text-slate-800 dark:text-white transition-all"
          >
            <FaRedo className="text-xs" />
            <span>Retake Quiz</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default RailwayTriviaQuiz;
