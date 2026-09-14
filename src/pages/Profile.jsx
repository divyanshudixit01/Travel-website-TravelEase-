import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import {
  FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaKey, FaSignOutAlt,
  FaPassport, FaGlobe, FaBell, FaCheck, FaPen, FaCamera, FaIdCard,
  FaPlaneDeparture, FaTrain, FaUsers, FaPlus, FaTrashAlt, FaMobileAlt,
  FaLock, FaCheckCircle, FaExclamationCircle, FaUserCheck
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { FiCheckCircle, FiShield, FiSmartphone } from 'react-icons/fi';
import { AvatarStudioModal } from '../components/profile/AvatarStudioModal';
import { TRAVEL_AVATARS } from '../components/profile/travelAvatars';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useContext(AuthContext);
  const { addToast, userBookings } = useBooking();

  // Avatar Modal State
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);

  // Tab State: 'personal' | 'documents' | 'travelers' | 'preferences' | 'security'
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingDocs, setIsEditingDocs] = useState(false);

  // Profile Form Data
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Alex Johnson',
    email: user?.email || 'alex.johnson@travelease.com',
    phone: user?.phone || '+91 98765 43210',
    nationality: user?.nationality || 'Indian',
    passportNumber: user?.passportNumber || 'Z4920194',
    passportExpiry: user?.passportExpiry || '2032-11-15',
    dateOfBirth: user?.dateOfBirth || '1994-06-20',
    gender: user?.gender || 'Male',
    bio: user?.bio || 'Passionate explorer of mountain trails, IRCTC heritage railways, and boutique sanctuaries.',
    frequentFlyer: user?.frequentFlyer || 'AI-902841 (Star Alliance Gold)',
    irctcUserId: user?.irctcUserId || 'alex_traveler_irctc',
    gstNumber: user?.gstNumber || '07AAAAA0000A1Z5',
  });

  // Saved Co-Travelers
  const [savedTravelers, setSavedTravelers] = useState(user?.savedTravelers || [
    { id: '1', name: 'Sophia Johnson', relation: 'Spouse', age: 30, gender: 'Female', seatPref: 'Window', mealPref: 'Vegetarian' },
    { id: '2', name: 'Leo Johnson', relation: 'Child', age: 7, gender: 'Male', seatPref: 'Aisle', mealPref: 'Child Meal' },
  ]);
  const [newTravelerName, setNewTravelerName] = useState('');
  const [newTravelerRelation, setNewTravelerRelation] = useState('Family');

  // Preferences
  const [preferences, setPreferences] = useState({
    seatPreference: user?.seatPreference || 'Window',
    mealPreference: user?.mealPreference || 'Vegetarian',
    priceAlerts: true,
    whatsappUpdates: true,
    gateAlerts: true,
    promotions: false,
    newsletter: true,
  });

  // Security Toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const activeAvatar = user?.avatar || TRAVEL_AVATARS[0].svgDataUri;

  // Stats calculation
  const totalBookings = userBookings.length;
  const confirmedBookings = userBookings.filter(b => b.status === 'Confirmed').length;
  const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalUSD || b.amount || 0), 0);

  const handleSavePersonal = () => {
    setIsEditingPersonal(false);
    updateUser(profileData);
    addToast('Personal information updated successfully!', 'success');
  };

  const handleSaveDocs = () => {
    setIsEditingDocs(false);
    updateUser(profileData);
    addToast('Travel documents & IDs updated successfully!', 'success');
  };

  const handleAddTraveler = (e) => {
    e.preventDefault();
    if (!newTravelerName.trim()) return;
    const traveler = {
      id: Date.now().toString(),
      name: newTravelerName.trim(),
      relation: newTravelerRelation,
      age: 28,
      gender: 'Other',
      seatPref: 'Window',
      mealPref: 'Standard'
    };
    const updated = [...savedTravelers, traveler];
    setSavedTravelers(updated);
    updateUser({ savedTravelers: updated });
    setNewTravelerName('');
    addToast(`Added ${traveler.name} to saved co-travelers!`, 'success');
  };

  const handleDeleteTraveler = (id) => {
    const updated = savedTravelers.filter(t => t.id !== id);
    setSavedTravelers(updated);
    updateUser({ savedTravelers: updated });
    addToast('Co-traveler removed.', 'info');
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white pt-24 pb-20 px-3 sm:px-6 lg:px-8 transition-colors duration-500" id="profile-page">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
              <Link to="/dashboard" className="hover:text-amber-500 transition-colors">Dashboard</Link>
              <span>/</span>
              <span className="text-amber-500">Account & Profile Settings</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Profile & Preferences
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAvatarStudioOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs transition-colors flex items-center gap-2"
            >
              <FaCamera /> Change Avatar / Photo
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs transition-colors"
            >
              Back to Bookings
            </Link>
          </div>
        </div>

        {/* Main Grid: Left Identity Card + Right Bento Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ========================================================
              LEFT COLUMN: PROFILE IDENTITY & REWARDS TILE (4 cols)
             ======================================================== */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#0c101c] border border-slate-200/90 dark:border-white/10 shadow-xl space-y-6 lg:sticky lg:top-24"
          >
            {/* Avatar & Member Tag */}
            <div className="text-center">
              <div className="relative inline-block mx-auto mb-4 group">
                <div 
                  className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400 p-0.5 shadow-2xl bg-slate-900 cursor-pointer group-hover:scale-105 transition-transform"
                  onClick={() => setIsAvatarStudioOpen(true)}
                  title="Click to open Avatar Studio"
                >
                  <img
                    src={activeAvatar}
                    alt={profileData.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarStudioOpen(true)}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-lg transition-transform hover:scale-110"
                  aria-label="Change photo"
                >
                  <FaCamera className="w-3.5 h-3.5" />
                </button>
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                {profileData.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                {profileData.email}
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10.5px] font-mono font-bold">
                <HiOutlineSparkles /> INFINITE VIP MEMBER
              </div>
            </div>

            {/* Loyalty Tier Progress Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-slate-500 dark:text-slate-400">LOYALTY TIER</span>
                <span className="text-amber-500">1,450 / 2,000 Pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: '72.5%' }} />
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 text-right">
                550 pts to Obsidian Black Status
              </div>
            </div>

            {/* Travel Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <div className="text-base font-black font-mono text-slate-900 dark:text-white">{totalBookings}</div>
                <div className="text-[9.5px] font-mono uppercase text-slate-400">Total Trips</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <div className="text-base font-black font-mono text-emerald-500">{confirmedBookings}</div>
                <div className="text-[9.5px] font-mono uppercase text-slate-400">Active</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
                <div className="text-base font-black font-mono text-amber-500">
                  {totalSpent > 0 ? `₹${Math.round(totalSpent).toLocaleString()}` : '—'}
                </div>
                <div className="text-[9.5px] font-mono uppercase text-slate-400">Spent</div>
              </div>
            </div>

            {/* Verified Certifications */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <FiCheckCircle />
                <span>IRCTC Certified Booking Account</span>
              </div>
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <FiShield />
                <span>256-Bit Bank-Grade Specular Vault</span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <FaSignOutAlt /> Sign Out of Account
            </button>
          </motion.div>

          {/* ========================================================
              RIGHT COLUMN: SPECULAR BENTO SETTINGS TABS (8 cols)
             ======================================================== */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 space-y-6"
          >
            {/* Bento Navigation Bar */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 dark:bg-white/[0.06] border border-slate-300/70 dark:border-white/10 overflow-x-auto">
              {[
                { id: 'personal', label: 'Personal Info', icon: <FaUser /> },
                { id: 'documents', label: 'Documents & IDs', icon: <FaIdCard /> },
                { id: 'travelers', label: `Co-Travelers (${savedTravelers.length})`, icon: <FaUsers /> },
                { id: 'preferences', label: 'Preferences', icon: <FaBell /> },
                { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: PERSONAL INFORMATION */}
            {activeTab === 'personal' && (
              <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0c101c] border border-slate-200/90 dark:border-white/10 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Personal Profile</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Used for flight tickets, hotel check-ins, and communication</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => isEditingPersonal ? handleSavePersonal() : setIsEditingPersonal(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {isEditingPersonal ? <><FaCheck /> Save Profile</> : <><FaPen /> Edit Info</>}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 font-bold">Full Legal Name</label>
                    <input
                      type="text"
                      disabled={!isEditingPersonal}
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isEditingPersonal ? 'bg-slate-100 dark:bg-white/10 border border-amber-400 text-slate-900 dark:text-white focus:outline-none' : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 font-bold">Email Address</label>
                    <input
                      type="email"
                      disabled={!isEditingPersonal}
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isEditingPersonal ? 'bg-slate-100 dark:bg-white/10 border border-amber-400 text-slate-900 dark:text-white focus:outline-none' : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 font-bold">Mobile Phone Number</label>
                    <input
                      type="tel"
                      disabled={!isEditingPersonal}
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isEditingPersonal ? 'bg-slate-100 dark:bg-white/10 border border-amber-400 text-slate-900 dark:text-white focus:outline-none' : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 font-bold">Nationality</label>
                    <input
                      type="text"
                      disabled={!isEditingPersonal}
                      value={profileData.nationality}
                      onChange={(e) => setProfileData(prev => ({ ...prev, nationality: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isEditingPersonal ? 'bg-slate-100 dark:bg-white/10 border border-amber-400 text-slate-900 dark:text-white focus:outline-none' : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 font-bold">Date of Birth</label>
                    <input
                      type="date"
                      disabled={!isEditingPersonal}
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isEditingPersonal ? 'bg-slate-100 dark:bg-white/10 border border-amber-400 text-slate-900 dark:text-white focus:outline-none' : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 font-bold">Gender</label>
                    <select
                      disabled={!isEditingPersonal}
                      value={profileData.gender}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isEditingPersonal ? 'bg-slate-100 dark:bg-white/10 border border-amber-400 text-slate-900 dark:text-white focus:outline-none' : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-Binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 font-bold">Travel Bio & Motto</label>
                    <textarea
                      rows={2}
                      disabled={!isEditingPersonal}
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-colors resize-none ${
                        isEditingPersonal ? 'bg-slate-100 dark:bg-white/10 border border-amber-400 text-slate-900 dark:text-white focus:outline-none' : 'bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DOCUMENTS & FREQUENT TRAVEL IDs */}
            {activeTab === 'documents' && (
              <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0c101c] border border-slate-200/90 dark:border-white/10 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Travel Documents & IDs</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pre-saved for instantaneous 1-click IRCTC Tatkal & Flight checkouts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => isEditingDocs ? handleSaveDocs() : setIsEditingDocs(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    {isEditingDocs ? <><FaCheck /> Save IDs</> : <><FaPen /> Edit IDs</>}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-500">
                      <FaPassport />
                      <span>PASSPORT DETAILS</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Passport Number</label>
                      <input
                        type="text"
                        disabled={!isEditingDocs}
                        value={profileData.passportNumber}
                        onChange={(e) => setProfileData(prev => ({ ...prev, passportNumber: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        disabled={!isEditingDocs}
                        value={profileData.passportExpiry}
                        onChange={(e) => setProfileData(prev => ({ ...prev, passportExpiry: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-500">
                      <FaTrain />
                      <span>IRCTC USER ID</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">IRCTC Registered Username</label>
                      <input
                        type="text"
                        disabled={!isEditingDocs}
                        value={profileData.irctcUserId}
                        onChange={(e) => setProfileData(prev => ({ ...prev, irctcUserId: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Enables 1-click Tatkal authorization & seat lock
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-500">
                      <FaPlaneDeparture />
                      <span>FREQUENT FLYER ID</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Airline & Member Number</label>
                      <input
                        type="text"
                        disabled={!isEditingDocs}
                        value={profileData.frequentFlyer}
                        onChange={(e) => setProfileData(prev => ({ ...prev, frequentFlyer: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-500">
                      <FaIdCard />
                      <span>GST / TAX INVOICE DETAILS</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">GSTIN Number (Optional)</label>
                      <input
                        type="text"
                        disabled={!isEditingDocs}
                        value={profileData.gstNumber}
                        onChange={(e) => setProfileData(prev => ({ ...prev, gstNumber: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SAVED CO-TRAVELERS */}
            {activeTab === 'travelers' && (
              <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0c101c] border border-slate-200/90 dark:border-white/10 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Co-Travelers (Family & Friends)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Add passenger profiles for instantaneous multi-ticket booking</p>
                  </div>
                </div>

                {/* Add New Traveler Form */}
                <form onSubmit={handleAddTraveler} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Traveler Full Name"
                    value={newTravelerName}
                    onChange={(e) => setNewTravelerName(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-amber-400"
                  />
                  <select
                    value={newTravelerRelation}
                    onChange={(e) => setNewTravelerRelation(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10"
                  >
                    <option>Spouse</option>
                    <option>Child</option>
                    <option>Parent</option>
                    <option>Colleague</option>
                    <option>Friend</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <FaPlus /> Add Traveler
                  </button>
                </form>

                {/* Travelers List */}
                <div className="space-y-3">
                  {savedTravelers.map((traveler) => (
                    <div
                      key={traveler.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-sm">
                          {traveler.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{traveler.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                              {traveler.relation}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{traveler.gender}, Age {traveler.age}</span>
                            <span>•</span>
                            <span>Prefers {traveler.seatPref} Seat & {traveler.mealPref}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTraveler(traveler.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete traveler"
                      >
                        <FaTrashAlt className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: PREFERENCES & NOTIFICATIONS */}
            {activeTab === 'preferences' && (
              <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0c101c] border border-slate-200/90 dark:border-white/10 shadow-xl space-y-6">
                <div className="pb-4 border-b border-slate-100 dark:border-white/10">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Travel Preferences & Smart Alerts</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Configure auto-selection for seats and real-time travel telemetry</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">Default Seat Preference</label>
                    <select
                      value={preferences.seatPreference}
                      onChange={(e) => {
                        setPreferences(prev => ({ ...prev, seatPreference: e.target.value }));
                        updateUser({ seatPreference: e.target.value });
                        addToast(`Default seat set to ${e.target.value}`, 'success');
                      }}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10"
                    >
                      <option>Window</option>
                      <option>Aisle</option>
                      <option>Extra Legroom</option>
                      <option>No Preference</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-bold">Default Meal Preference</label>
                    <select
                      value={preferences.mealPreference}
                      onChange={(e) => {
                        setPreferences(prev => ({ ...prev, mealPreference: e.target.value }));
                        updateUser({ mealPreference: e.target.value });
                        addToast(`Default meal set to ${e.target.value}`, 'success');
                      }}
                      className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10"
                    >
                      <option>Vegetarian</option>
                      <option>Non-Vegetarian</option>
                      <option>Jain Pure Veg</option>
                      <option>Vegan</option>
                      <option>Diabetic Friendly</option>
                    </select>
                  </div>
                </div>

                {/* Toggle List */}
                <div className="space-y-3">
                  {[
                    { key: 'priceAlerts', title: 'Airfare Drop Radar', desc: 'Notify instantly when tracked flight or stay drops in price' },
                    { key: 'whatsappUpdates', title: 'WhatsApp Live Trip Updates', desc: 'Receive Tatkal confirmation and gate changes on WhatsApp' },
                    { key: 'gateAlerts', title: 'Real-time Airport Gate Alerts', desc: 'Push notifications for gate assignment and boarding calls' },
                    { key: 'newsletter', title: 'Curated Itinerary Chronicles', desc: 'Weekly AI travel inspiration and secret sanctuary guides' },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = !preferences[item.key];
                          setPreferences(prev => ({ ...prev, [item.key]: val }));
                          addToast(`${item.title} ${val ? 'enabled' : 'disabled'}.`, 'info');
                        }}
                        className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                          preferences[item.key] ? 'bg-amber-500 justify-end' : 'bg-slate-300 dark:bg-white/10 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY & ACCESS */}
            {activeTab === 'security' && (
              <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#0c101c] border border-slate-200/90 dark:border-white/10 shadow-xl space-y-6">
                <div className="pb-4 border-b border-slate-100 dark:border-white/10">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Security & Devices</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Manage password, two-factor authorization, and active logins</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-base">
                        <FaKey />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Account Password</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Last changed 2 months ago</div>
                      </div>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-amber-500 hover:text-black font-bold text-xs transition-colors"
                    >
                      Update Password
                    </Link>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-base">
                        <FaShieldAlt />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Require SMS or authenticator code on new sign-ins</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        addToast(`Two-factor authorization ${!twoFactorEnabled ? 'activated' : 'disabled'}.`, 'info');
                      }}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                        twoFactorEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-white/10 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>

                  {/* Active Sessions */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
                    <div className="text-xs font-mono font-bold uppercase text-slate-400">Active Authorized Sessions</div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                        <FiSmartphone className="text-emerald-500" />
                        <span>Chrome on Windows (Current Session)</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold">ACTIVE NOW</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* AVATAR STUDIO MODAL */}
      <AvatarStudioModal
        isOpen={isAvatarStudioOpen}
        onClose={() => setIsAvatarStudioOpen(false)}
        currentAvatar={activeAvatar}
        onSaveAvatar={(newAvatar) => {
          updateUser({ avatar: newAvatar, avatarType: 'custom' });
          addToast('Avatar updated across all TravelEase touchpoints!', 'success');
        }}
      />
    </div>
  );
};

export default Profile;
