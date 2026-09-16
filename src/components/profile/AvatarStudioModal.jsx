import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaCheck, FaCamera, FaUpload, FaLink, 
  FaTrashAlt, FaImage, FaUndo
} from 'react-icons/fa';
import { TRAVEL_AVATARS } from './travelAvatars';

export const AvatarStudioModal = ({ isOpen, onClose, currentAvatar, onSaveAvatar }) => {
  const [activeTab, setActiveTab] = useState('svg'); // 'svg' | 'custom'
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || TRAVEL_AVATARS[0].svgDataUri);
  const [customUrl, setCustomUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle local file upload (converts to compressed Base64 data URL)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      setUploadError('Please select a JPG, PNG, WEBP, or SVG image.');
      return;
    }

    // Limit to 4MB before compression
    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Image size exceeds 4MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Canvas compression to max 400x400
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setSelectedAvatar(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    try {
      new URL(customUrl.trim());
      setSelectedAvatar(customUrl.trim());
      setUploadError('');
    } catch {
      setUploadError('Please enter a valid HTTP/HTTPS image URL.');
    }
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" id="avatar-studio-modal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-[#0d121f]/95 text-slate-900 dark:text-white backdrop-blur-2xl border border-slate-200/90 dark:border-white/15 shadow-2xl shadow-slate-900/30 dark:shadow-black/90 overflow-hidden z-10"
        >
          {/* Top Decorative Rim */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-sky-400 to-indigo-500" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
                <FaCamera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Avatar Studio
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    APPLE & GOOGLE SPEC
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Personalize your identity with vector travel personas or a custom photo
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
              aria-label="Close modal"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Live Preview Hero */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl shadow-amber-500/20 bg-slate-900 flex items-center justify-center shrink-0">
                <img
                  src={selectedAvatar}
                  alt="Live Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                <FaCheck className="text-[8px]" /> Active
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Live Profile Look
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                This avatar syncs across the Navigation Dock, Booking Vouchers, Boarding Passes, and Concierge Chat.
              </p>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono text-amber-600 dark:text-amber-400">
                <span>Vector Res: Infinite DPI</span>
                <span>•</span>
                <span>P3 Color Wide Gamut</span>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-xl p-1 bg-slate-200/70 dark:bg-white/[0.06] border border-slate-300/60 dark:border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('svg')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'svg'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaImage className="text-amber-400" />
              <span>Curated Personas ({TRAVEL_AVATARS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'custom'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaCamera className="text-sky-400" />
              <span>Upload Custom Photo</span>
            </button>
          </div>

          {/* Tab 1: SVG Avatars Grid */}
          {activeTab === 'svg' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-h-[300px] overflow-y-auto pr-1 pb-2">
              {TRAVEL_AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.svgDataUri;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.svgDataUri)}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-center group relative ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                        : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:scale-[1.02]'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                        <FaCheck className="text-[9px]" />
                      </div>
                    )}
                    <div className="w-14 h-14 rounded-full overflow-hidden mb-2 shadow-md group-hover:rotate-3 transition-transform">
                      <img
                        src={avatar.svgDataUri}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">
                      {avatar.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate w-full">
                      {avatar.tag}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 2: Custom Photo Upload */}
          {activeTab === 'custom' && (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-amber-400 dark:hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-white/[0.02]"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-3">
                  <FaUpload className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Choose an image file from your device
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Supports PNG, JPG, WEBP, SVG up to 4MB
                </p>
                <span className="inline-block px-3 py-1 rounded-lg bg-amber-500 text-black text-xs font-bold shadow">
                  Browse Device
                </span>
              </div>

              {/* Or URL Input */}
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Or use an online Image URL
                </div>
                <form onSubmit={handleApplyUrl} className="flex gap-2">
                  <div className="relative flex-1">
                    <FaLink className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-white/10 dark:hover:bg-white/20 text-white text-xs font-bold transition-colors"
                  >
                    Apply URL
                  </button>
                </form>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {uploadError}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-5 mt-6 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setSelectedAvatar(TRAVEL_AVATARS[0].svgDataUri)}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5"
            >
              <FaUndo className="text-[10px]" /> Reset to Default
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5"
              >
                <FaCheck /> Save Avatar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
