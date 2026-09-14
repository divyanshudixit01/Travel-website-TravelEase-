import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import {
  FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaKey, FaSignOutAlt,
  FaPassport, FaGlobe, FaBell, FaCheck, FaPen
} from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { addToast, userBookings } = useBooking();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    nationality: 'Indian',
    passportNumber: '',
    dateOfBirth: '',
  });

  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    bookingUpdates: true,
    promotions: false,
    newsletter: true,
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    setIsEditing(false);
    addToast('Profile updated successfully!', 'success');
  };

  const handleLogout = () => {
    logout();
    addToast('Signed out successfully.', 'info');
    navigate('/');
  };

  const totalBookings = userBookings.length;
  const confirmedBookings = userBookings.filter(b => b.status === 'Confirmed').length;
  const totalSpent = userBookings.reduce((sum, b) => sum + (b.totalUSD || b.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] py-10 px-4 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            My Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage your account, preferences, and travel documents
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="card-elevated p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-white text-3xl font-black shadow-lg shadow-indigo-500/25">
                {(user?.name || 'T').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name || 'Traveler'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
              
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{totalBookings}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Trips</p>
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{confirmedBookings}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Active</p>
                </div>
                <div>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {totalSpent > 0 ? `$${Math.round(totalSpent)}` : '—'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Spent</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-6 py-3 rounded-xl border-2 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          </motion.div>

          {/* Right — Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Info */}
            <div className="card-elevated p-8">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <FaUser className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Personal Information</h2>
                </div>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                >
                  {isEditing ? <><FaCheck /> Save</> : <><FaPen /> Edit</>}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'Full Name', icon: FaUser, key: 'name', type: 'text' },
                  { label: 'Email', icon: FaEnvelope, key: 'email', type: 'email' },
                  { label: 'Phone', icon: FaPhone, key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
                  { label: 'Nationality', icon: FaGlobe, key: 'nationality', type: 'text' },
                  { label: 'Passport Number', icon: FaPassport, key: 'passportNumber', type: 'text', placeholder: 'Optional — for intl bookings' },
                  { label: 'Date of Birth', icon: FaUser, key: 'dateOfBirth', type: 'date' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {field.label}
                    </label>
                    <div className="relative">
                      <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                      <input
                        type={field.type}
                        value={profileData[field.key]}
                        onChange={(e) => setProfileData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        disabled={!isEditing}
                        placeholder={field.placeholder || ''}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                          isEditing
                            ? 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none'
                            : 'bg-slate-50 dark:bg-slate-800/30 border border-transparent text-slate-700 dark:text-slate-300 cursor-default'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="card-elevated p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FaBell className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'priceAlerts', label: 'Price Drop Alerts', desc: 'Get notified when prices drop on your saved routes' },
                  { key: 'bookingUpdates', label: 'Booking Updates', desc: 'Check-in reminders, gate changes, and trip updates' },
                  { key: 'promotions', label: 'Deals & Promotions', desc: 'Exclusive offers and flash sale notifications' },
                  { key: 'newsletter', label: 'Travel Newsletter', desc: 'Weekly travel inspiration and destination guides' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${
                        notifications[item.key]
                          ? 'bg-indigo-500 justify-end'
                          : 'bg-slate-200 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="card-elevated p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FaShieldAlt className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Security</h2>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaKey className="text-slate-400" />
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Change Password</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Update your account password</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">→</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
