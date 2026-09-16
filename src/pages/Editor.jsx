import React from 'react';
import { motion } from 'framer-motion';
import { FaPenAlt, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Editor = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] pt-24 pb-12 px-4 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-500 mb-8 font-semibold transition-colors">
          <FaArrowLeft className="w-4 h-4" /> Back to Stories
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-elevated p-12 text-center rounded-3xl"
        >
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaPenAlt className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Premium Editor Coming Soon
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            We are building a world-class rich-text editing experience for you to draft, format, and publish your travel stories with effortless elegance. Stay tuned.
          </p>
          <Link to="/blog" className="btn-primary !px-8 inline-flex items-center gap-2">
            Return to Blog
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Editor;
