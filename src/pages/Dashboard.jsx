import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import AuthContext from '../context/AuthContext';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';
import { 
  FaUserCircle, FaSuitcase, FaTicketAlt, FaClock, FaCheckCircle, 
  FaTimesCircle, FaCoins, FaPrint, FaPlane, FaHotel, FaCar, FaCompass, FaBus, FaTrain, FaShip, FaHome, FaShieldAlt
} from 'react-icons/fa';

const Dashboard = () => {
  const { userBookings, cancelBooking, formatPrice } = useBooking();
  const { user } = useContext(AuthContext);

  const displayName = user?.name || 'Traveler';
  const displayEmail = user?.email || 'traveler@travelease.com';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'TE';

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'profile' | 'rewards'

  const getServiceIcon = (type) => {
    switch (type) {
      case 'flight': return <FaPlane />;
      case 'hotel': return <FaHotel />;
      case 'car': return <FaCar />;
      case 'train': return <FaTrain />;
      case 'bus': return <FaBus />;
      case 'cruise': return <FaShip />;
      case 'homestay': return <FaHome />;
      case 'tour': return <FaCompass />;
      default: return <FaTicketAlt />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] py-10 px-4 transition-colors duration-500" id="dashboard-page">
      <div className="max-w-7xl mx-auto">

        {/* Dashboard Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mesh-gradient-hero text-white rounded-3xl p-8 md:p-12 shadow-2xl mb-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute right-[-10%] top-[-20%] w-[50%] h-[150%] bg-white/5 rotate-12 pointer-events-none"></div>
          
          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-xl border border-white/30 shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-md">{displayName}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-1 rounded-full border border-emerald-400/30 font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                  <FaShieldAlt /> {user ? 'Verified Member' : 'Guest Traveler'}
                </span>
              </div>
              <p className="text-white/80 text-sm font-medium">{displayEmail} • Member since 2026</p>
            </div>
          </div>

          {/* Loyalty Stats */}
          <div className="flex items-center gap-4 glass-crystal px-6 py-4 rounded-2xl border border-white/20 shadow-xl relative z-10 w-full md:w-auto">
            <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center text-amber-300 border border-amber-400/30">
              <FaCoins className="text-2xl drop-shadow-md" />
            </div>
            <div>
              <div className="text-[10px] text-white/70 font-bold uppercase tracking-wider mb-0.5">Travel Rewards Balance</div>
              <div className="text-2xl font-black text-amber-300 drop-shadow-md">1,450 <span className="text-base text-amber-300/80 font-bold">Pts</span></div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Navigation Tabs */}
        <div className="mb-8 flex justify-center sm:justify-start">
          <SegmentedPillToggle
            options={[
              { id: 'bookings', label: `My Trips (${userBookings.length})`, icon: FaSuitcase },
              { id: 'profile', label: 'Profile', icon: FaUserCircle },
              { id: 'rewards', label: 'Rewards', icon: FaCoins },
            ]}
            value={activeTab}
            onChange={setActiveTab}
            layoutId="dashboardNavToggle"
            size="md"
          />
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'bookings' && (
              <motion.div 
                key="bookings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {userBookings.length === 0 ? (
                  <div className="card-elevated p-16 text-center">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                      <FaSuitcase size={40} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">No upcoming trips</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Start planning your next adventure today.</p>
                    <ThreeUIButton to="/destinations" variant="liquid-metal" size="md">
                      Explore Destinations
                    </ThreeUIButton>
                  </div>
                ) : (
                  userBookings.map((b, index) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={b.bookingId}
                      className="card-elevated overflow-hidden group"
                    >
                      <div className="flex flex-col lg:flex-row border-b border-slate-100 dark:border-slate-800">
                        {/* Status Bar for Mobile (Left side color bar on desktop) */}
                        <div className={`h-2 lg:h-auto lg:w-2 ${
                          b.status === 'Confirmed' ? 'bg-emerald-500' :
                          b.status === 'Completed' ? 'bg-blue-500' :
                          b.status === 'Cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}></div>

                        <div className="p-6 md:p-8 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-2xl shadow-sm shrink-0">
                              {getServiceIcon(b.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PNR: {b.bookingId}</span>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                                  b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                                  b.status === 'Completed' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' :
                                  b.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' :
                                  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                }`}>
                                  {b.status === 'Confirmed' && <FaCheckCircle />}
                                  {b.status === 'Completed' && <FaCheckCircle className="text-blue-500" />}
                                  {b.status === 'Cancelled' && <FaTimesCircle />}
                                  {b.status === 'Pending' && <FaClock />}
                                  {b.status}
                                </span>
                              </div>
                              <h3 className="text-2xl font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {b.serviceTitle}
                              </h3>
                              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">Booked: {b.createdAt}</p>
                            </div>
                          </div>

                          <div className="text-left md:text-right w-full md:w-auto pl-18 md:pl-0">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Total Paid</div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">{formatPrice(b.totalUSD)}</div>
                            <div className="text-xs font-semibold text-emerald-500 mt-1">Paid via {b.paymentMethod}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/30 p-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                        {b.details && Object.entries(b.details).slice(0, 4).map(([k, v]) => (
                          <div key={k} className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-semibold text-slate-900 dark:text-white truncate">{String(v)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 md:px-8 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                        <ThreeUIButton
                          to={`/booking-confirmation/${b.bookingId}`}
                          variant="specular-dark"
                          size="sm"
                          icon={FaPrint}
                          className="w-full sm:w-auto"
                        >
                          View Ticket
                        </ThreeUIButton>
                        {b.status !== 'Cancelled' && (
                          <ThreeUIButton 
                            onClick={() => cancelBooking(b.bookingId)}
                            variant="specular-dark"
                            size="sm"
                            icon={FaTimesCircle}
                            className="w-full sm:w-auto !text-rose-600 dark:!text-rose-400 hover:!bg-rose-500/10"
                          >
                            Cancel Trip
                          </ThreeUIButton>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card-elevated p-8 md:p-12 text-center"
              >
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FaUserCircle size={40} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Account & Traveler Profile</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-md mx-auto">
                  Manage your personal information, passport & travel documents, security settings, and notifications.
                </p>
                <ThreeUIButton to="/profile" variant="liquid-metal" size="md" icon={FaUserCircle}>
                  Open Profile Settings
                </ThreeUIButton>
              </motion.div>
            )}

            {activeTab === 'rewards' && (
              <motion.div 
                key="rewards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card-elevated p-8 md:p-12 text-center"
              >
                <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
                  <FaCoins size={40} />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Travel Rewards</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-md mx-auto">You have 1,450 points. Redeem them for free flight upgrades, hotel stays, and more.</p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <FaClock className="w-3.5 h-3.5" />
                  <span>Redemption Store Launching Soon</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
