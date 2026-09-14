import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaPlane, FaHotel, FaArrowLeft, FaCompass } from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { icon: <FaPlane />, label: 'Search Flights', path: '/flights', color: 'from-sky-500 to-blue-600' },
    { icon: <FaHotel />, label: 'Find Hotels', path: '/hotels', color: 'from-purple-500 to-indigo-600' },
    { icon: <FaCompass />, label: 'Explore Destinations', path: '/destinations', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] flex items-center justify-center p-4 transition-colors duration-500">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1 className="text-[10rem] md:text-[14rem] font-black leading-none bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent select-none">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            Looks like you've wandered off the map
          </h2>
          <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-10">
            The page you're looking for doesn't exist or has been moved. Let's get you back to planning your next adventure.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <FaHome className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5">
            Popular pages
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.path}
                className="group flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center text-white text-sm shadow-sm`}>
                  {link.icon}
                </div>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
