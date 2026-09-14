import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import {
  searchTrains, checkPnrStatus, getLiveStatus, checkSeatAvailability,
  searchStations, getStationBoard, getTrainSchedule, getMultiDayAvailability,
  TRAIN_CLASSES, POPULAR_STATIONS, searchTrainsDirectory, deduplicateTrainList
} from '../services/irctcApi';
import { ALL_INDIAN_STATIONS } from '../data/allIndianStations';
import {
  FaTrain, FaExchangeAlt, FaTimes, FaArrowRight,
  FaSearch, FaMapMarkerAlt, FaTicketAlt, FaSatelliteDish, FaChair,
  FaTimesCircle, FaSpinner, FaCheck, FaRedo, FaTachometerAlt, FaBolt,
  FaRoute, FaFilter, FaSortAmountDown, FaUserPlus, FaTrash,
  FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getServiceSchema } from '../utils/schemas';
import AdaptivePersonaBar from '../components/trains/AdaptivePersonaBar';
import SeniorQuickBookingBar from '../components/trains/SeniorQuickBookingBar';
import RailwayTriviaQuiz from '../components/trains/RailwayTriviaQuiz';
import HeritageStoryShowcase from '../components/trains/HeritageStoryShowcase';
import RailwayTrackLoader from '../components/trains/RailwayTrackLoader';
import DynamicTransitHUD from '../components/trains/DynamicTransitHUD';
import CinematicTrainFlyby from '../components/trains/CinematicTrainFlyby';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';

// ─── Debounce Hook ───────────────────────────────────────────────
const useDebounce = (value, delay = 100) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ─── Skeleton Loader ─────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800/60 rounded-2xl ${className}`} />
);

// ─── Tab Definitions ─────────────────────────────────────────────
const TABS = [
  { id: 'search', label: 'Book Trains', icon: FaSearch },
  { id: 'station-board', label: 'Station Board', icon: FaTachometerAlt },
  { id: 'pnr', label: 'PNR Status', icon: FaTicketAlt },
  { id: 'live', label: 'Live Tracking', icon: FaSatelliteDish },
  { id: 'availability', label: 'Seat Check', icon: FaChair },
];

// ─── Real-Time Sync Hook ─────────────────────────────────────────
const useRealtimeTrainSync = ({ activeTab, liveTrainNumber, boardStationCode, onPollLive, onPollBoard }) => {
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  useEffect(() => {
    if (activeTab !== 'live' && activeTab !== 'station-board') return;
    const intervalMs = activeTab === 'live' ? 15000 : 20000;
    const interval = setInterval(() => {
      if (document.hidden) return;
      if (activeTab === 'live' && liveTrainNumber) {
        onPollLive();
        setLastUpdated(Date.now());
      } else if (activeTab === 'station-board' && boardStationCode) {
        onPollBoard();
        setLastUpdated(Date.now());
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [activeTab, liveTrainNumber, boardStationCode, onPollLive, onPollBoard]);

  const triggerManualRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === 'live' && liveTrainNumber) {
      await onPollLive();
    } else if (activeTab === 'station-board' && boardStationCode) {
      await onPollBoard();
    }
    setLastUpdated(Date.now());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return { lastUpdated, secondsAgo, isRefreshing, triggerManualRefresh };
};

// ─── Station Autocomplete Input (Decoupled State & Keyboard Nav) ──
const StationInput = ({ label, value, onChange, placeholder }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(POPULAR_STATIONS.slice(0, 8));
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 80);
  const wrapperRef = useRef(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (value) {
      const match = ALL_INDIAN_STATIONS.find(s => s.code.toUpperCase() === value.toUpperCase()) ||
                    POPULAR_STATIONS.find(s => s.code.toUpperCase() === value.toUpperCase());
      if (match) {
        setQuery(`${match.name} (${match.code})`);
      } else {
        setQuery(value);
      }
    } else {
      setQuery('');
    }
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
        if (query && !value) {
          const direct = ALL_INDIAN_STATIONS.find(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.code.toLowerCase() === query.toLowerCase()
          );
          if (direct) {
            isInternalUpdate.current = true;
            onChange(direct.code);
            setQuery(`${direct.name} (${direct.code})`);
          }
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [query, value, onChange]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsSearching(true);
      try {
        const res = await searchStations(debouncedQuery);
        if (!cancelled && res?.data && res.data.length > 0) {
          setSuggestions(res.data.slice(0, 10));
          setSelectedIndex(-1);
          setIsSearching(false);
          return;
        }
      } catch {}
      if (!cancelled) setIsSearching(false);
    })();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleSelect = (station) => {
    const code = station.station_code || station.code;
    const name = station.station_name || station.name;
    isInternalUpdate.current = true;
    setQuery(`${name} (${code})`);
    onChange(code);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <FaMapMarkerAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-xs" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setShowDropdown(true);
            if (!val.trim()) {
              onChange('');
            } else {
              const codeMatch = val.match(/\(([A-Z0-9]{2,5})\)/i) || val.match(/^([A-Z0-9]{2,5})$/i);
              if (codeMatch) {
                isInternalUpdate.current = true;
                onChange(codeMatch[1].toUpperCase());
              }
            }
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Station name or code'}
          className="trains-input"
        />
        {isSearching && <FaSpinner className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 animate-spin text-xs" />}
      </div>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-80 sm:w-96 left-0 mt-2 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto"
          >
            <div className="px-3.5 py-2 border-b border-slate-50 dark:border-slate-800/60 flex items-center justify-between text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              <span>Matching Stations</span>
              <span>{suggestions.length} results</span>
            </div>
            {suggestions.map((s, i) => {
              const code = s.station_code || s.code;
              const name = s.station_name || s.name;
              const city = s.city || '';
              const state = s.state || '';
              const isCurrent = value === code;
              const isHighlighted = selectedIndex === i;

              return (
                <button
                  key={code || i}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between group ${
                    isCurrent ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''
                  } ${isHighlighted ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-11 h-6 bg-[#002B49] text-amber-400 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">
                      {code}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#002B49] dark:group-hover:text-amber-400 transition-colors truncate">
                        {name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {city}{state ? ` · ${state}` : ''}
                      </p>
                    </div>
                  </div>
                  {isCurrent && <FaCheck className="text-amber-500 text-[10px] shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Train Autocomplete Input (Clean 5-Digit Number Extraction) ───
const TrainAutocompleteInput = ({ label, value, onChange, placeholder }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 100);
  const wrapperRef = useRef(null);
  const isInternal = useRef(false);

  useEffect(() => {
    if (isInternal.current) {
      isInternal.current = false;
      return;
    }
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    (async () => {
      setIsSearching(true);
      try {
        const res = await searchTrainsDirectory(debouncedQuery.trim());
        if (!cancelled && res?.trains) {
          setSuggestions(res.trains.slice(0, 8));
          setSelectedIndex(-1);
        }
      } catch {}
      if (!cancelled) setIsSearching(false);
    })();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleSelect = (trn) => {
    isInternal.current = true;
    setQuery(`${trn.train_number} - ${trn.train_name}`);
    onChange(trn.train_number);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <FaTrain className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-xs" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setShowDropdown(true);
            const digits = val.replace(/\D/g, '');
            if (digits.length >= 4) {
              isInternal.current = true;
              onChange(digits.slice(0, 5));
            } else {
              onChange(val);
            }
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Train number or name'}
          className="trains-input"
        />
        {isSearching && <FaSpinner className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 animate-spin text-xs" />}
      </div>

      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-80 sm:w-96 left-0 mt-2 bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto"
          >
            <div className="px-3.5 py-2 border-b border-slate-50 dark:border-slate-800/60 flex items-center justify-between text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
              <span>Matching Trains</span>
              <span>{suggestions.length} results</span>
            </div>
            {suggestions.map((trn, i) => (
              <button
                key={trn.train_number || i}
                type="button"
                onClick={() => handleSelect(trn)}
                className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between group ${
                  selectedIndex === i ? 'bg-slate-100 dark:bg-slate-800' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-12 h-6 bg-[#002B49] text-amber-400 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0">
                    {trn.train_number}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#002B49] dark:group-hover:text-amber-400 truncate">
                      {trn.train_name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {trn.from_code} → {trn.to_code} · {trn.train_type}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN TRAINS COMPONENT — PRODUCTION REAL-TIME RE-ENGINEERING
// ═══════════════════════════════════════════════════════════════════
const Trains = () => {
  const navigate = useNavigate();
  const { setActiveBooking, addToast } = useBooking();

  // ── Cinematic Flyby State ──
  const [isFlybyPlaying, setIsFlybyPlaying] = useState(true);
  const handleFlybyFinish = useCallback(() => setIsFlybyPlaying(false), []);

  // ── Tab State ──
  const [activeTab, setActiveTab] = useState('search');

  // ── Search State ──
  const [fromCode, setFromCode] = useState('LKO');
  const [toCode, setToCode] = useState('NDLS');
  const [journeyDate, setJourneyDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [trainResults, setTrainResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeTrainModal, setActiveTrainModal] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchSummary, setSearchSummary] = useState(null);
  const [coachModalTrain, setCoachModalTrain] = useState(null);

  // ── Advanced Sorting & Multi-Dimensional Filtering ──
  const [trainFilter, setTrainFilter] = useState('all'); // 'all' | 'running' | 'non-running'
  const [sortBy, setSortBy] = useState('departure_asc'); // 'departure_asc' | 'duration_asc' | 'fare_asc' | 'rating_desc' | 'arrival_asc'
  const [selectedTrainTypes, setSelectedTrainTypes] = useState([]); // ['VANDE BHARAT', 'SUPERFAST', 'SHATABDI']
  const [selectedClasses, setSelectedClasses] = useState([]); // ['1A', '2A', '3A', 'CC', 'SL']
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]); // ['early_morning', 'morning', 'afternoon', 'night']
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // ── 6-Day Seat Availability Calendar State ──
  const [activeMatrixTrain, setActiveMatrixTrain] = useState(null);
  const [matrixData, setMatrixData] = useState([]);
  const [isMatrixLoading, setIsMatrixLoading] = useState(false);

  // ── Multi-Passenger Booking State (Up to 6 Passengers) ──
  const [passengerList, setPassengerList] = useState([
    { id: 1, name: '', age: '', gender: 'Male', berth: 'No Preference' }
  ]);
  const [selectedQuota, setSelectedQuota] = useState('GN'); // GN, TQ, SS (Senior), LD (Ladies)

  // ── PNR Tab State ──
  const [pnrNumber, setPnrNumber] = useState('');
  const [pnrData, setPnrData] = useState(null);
  const [isPnrLoading, setIsPnrLoading] = useState(false);
  const [pnrError, setPnrError] = useState('');

  // ── Live Tracking Tab State ──
  const [liveTrainNumber, setLiveTrainNumber] = useState('12004');
  const [liveDate, setLiveDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [liveData, setLiveData] = useState(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');
  const [showAllHalts, setShowAllHalts] = useState(false);

  // ── Station Live Board Tab State ──
  const [boardStationCode, setBoardStationCode] = useState('SPN');
  const [boardData, setBoardData] = useState(null);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState('');
  const [boardFilter, setBoardFilter] = useState('all'); // 'all' | 'departures' | 'arrivals'
  const [boardSearch, setBoardSearch] = useState('');

  // ── Seat Availability Tab State ──
  const [availTrainNumber, setAvailTrainNumber] = useState('12004');
  const [availFrom, setAvailFrom] = useState('LKO');
  const [availTo, setAvailTo] = useState('NDLS');
  const [availDate, setAvailDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [availClass, setAvailClass] = useState('3A');
  const [availData, setAvailData] = useState(null);
  const [isAvailLoading, setIsAvailLoading] = useState(false);
  const [availError, setAvailError] = useState('');

  // ── Timetable Schedule Modal State ──
  const [scheduleModalTrain, setScheduleModalTrain] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  // ── Persona State ──
  const [activePersona, setActivePersona] = useState('pro');
  const [requireLowerBerth, setRequireLowerBerth] = useState(false);
  const [requireWheelchair, setRequireWheelchair] = useState(false);
  const [tatkalCountdown, setTatkalCountdown] = useState('');
  const [heroMediaMode, setHeroMediaMode] = useState('video');

  // ── Parallax ──
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 180]);

  // Tatkal Countdown Timer (10:00 AM AC / 11:00 AM Non-AC IST)
  useEffect(() => {
    const calcTatkal = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const ist = new Date(utc + (3600000 * 5.5));
      const hours = ist.getHours();
      const mins = ist.getMinutes();
      const secs = ist.getSeconds();

      if (hours < 10) {
        const diffMins = (9 - hours) * 60 + (59 - mins);
        const diffSecs = 59 - secs;
        setTatkalCountdown(`AC opens in ${diffMins}m ${diffSecs}s (10:00 AM IST)`);
      } else if (hours === 10) {
        const diffMins = 59 - mins;
        const diffSecs = 59 - secs;
        setTatkalCountdown(`Non-AC opens in ${diffMins}m ${diffSecs}s (11:00 AM IST)`);
      } else {
        setTatkalCountdown('Next Window: Tomorrow 10:00 AM IST');
      }
    };
    calcTatkal();
    const interval = setInterval(calcTatkal, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPersona = (personaId) => {
    setActivePersona(personaId);
    if (personaId === 'senior') {
      setRequireLowerBerth(true);
      setSelectedQuota('SS');
      addToast('Senior Citizen Mode active: Lower Berths & 139 Helpline prioritized', 'info');
    } else if (personaId === 'student') {
      addToast('Student Mode active: Budget fares & Railway Quiz unlocked', 'info');
    } else {
      setSelectedQuota('GN');
      addToast('Commuter Pro Mode: Tatkal dials & live radar active', 'info');
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  // Search Trains
  const handleSearchTrains = useCallback(async (customDate) => {
    const targetDate = typeof customDate === 'string' ? customDate : journeyDate;
    if (!fromCode || !toCode) {
      addToast('Please select both origin and destination stations', 'warning');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    setTrainResults([]);
    try {
      const res = await searchTrains(fromCode, toCode, targetDate);
      const rawTrains = Array.isArray(res?.data) ? res.data : (res?.data?.data || res?.data?.trains || []);
      const trains = deduplicateTrainList(rawTrains);
      if (Array.isArray(trains) && trains.length > 0) {
        setTrainResults(trains);
        const runningCount = trains.filter(t => t.runs_on_date !== false).length;
        const nonRunningCount = trains.filter(t => t.runs_on_date === false).length;

        setSearchSummary({
          total: trains.length,
          running: runningCount,
          nonRunning: nonRunningCount,
          day: res.selected_day || '',
          dateFormatted: res.selected_date_formatted || targetDate,
          route: res.route || `${fromCode} → ${toCode}`
        });
        addToast(`Found ${trains.length} trains (${runningCount} operating on selected date)`, 'success');
      } else {
        setSearchError('No trains found for this route and date. Try a different date or corridor.');
      }
    } catch {
      setSearchError('Unable to fetch train data. Please try again.');
    }
    setIsSearching(false);
  }, [fromCode, toCode, journeyDate, addToast]);

  const handleSwapStations = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
    addToast('Stations swapped!', 'info');
  };

  const handleSwitchToNextRun = (nextRunDateStr) => {
    if (!nextRunDateStr) return;
    setJourneyDate(nextRunDateStr);
    addToast(`Switching journey date to ${nextRunDateStr}...`, 'info');
    setTimeout(() => handleSearchTrains(nextRunDateStr), 100);
  };

  // Live Status Check
  const handleCheckLiveStatus = useCallback(async () => {
    if (!liveTrainNumber) {
      addToast('Please enter a train number', 'warning');
      return;
    }
    setIsLiveLoading(true);
    setLiveError('');
    try {
      const res = await getLiveStatus(liveTrainNumber, liveDate);
      if (res?.success && res?.data) {
        setLiveData(res.data);
      } else {
        setLiveError(res?.message || 'Could not fetch live status. Train may not be operating today.');
      }
    } catch {
      setLiveError('Failed to fetch live tracking telemetry.');
    }
    setIsLiveLoading(false);
  }, [liveTrainNumber, liveDate, addToast]);

  // Live Station Board Check
  const handleFetchStationBoard = useCallback(async (code) => {
    const targetCode = (code || boardStationCode || '').toUpperCase().trim();
    if (!targetCode) {
      addToast('Please select a station code', 'warning');
      return;
    }
    setIsBoardLoading(true);
    setBoardError('');
    try {
      const res = await getStationBoard(targetCode);
      if (res?.success && Array.isArray(res?.trains)) {
        setBoardData(res);
      } else {
        setBoardError(res?.message || `No live trains currently reported for station ${targetCode}.`);
      }
    } catch {
      setBoardError('Failed to fetch live station departures & arrivals board.');
    }
    setIsBoardLoading(false);
  }, [boardStationCode, addToast]);

  // Real-Time Polling Hook
  const { secondsAgo, isRefreshing, triggerManualRefresh } = useRealtimeTrainSync({
    activeTab,
    liveTrainNumber,
    boardStationCode,
    onPollLive: handleCheckLiveStatus,
    onPollBoard: () => handleFetchStationBoard(boardStationCode)
  });

  // PNR Status Check
  const handleCheckPnr = useCallback(async () => {
    if (!pnrNumber || pnrNumber.length !== 10) {
      addToast('Please enter a valid 10-digit PNR number', 'warning');
      return;
    }
    setIsPnrLoading(true);
    setPnrError('');
    setPnrData(null);
    try {
      const res = await checkPnrStatus(pnrNumber);
      if (res?.success && res?.data) {
        setPnrData(res.data);
        addToast('PNR status fetched successfully!', 'success');
      } else {
        setPnrError(res?.message || 'Could not retrieve PNR status. The PNR may be invalid or expired.');
      }
    } catch {
      setPnrError('Failed to fetch PNR status.');
    }
    setIsPnrLoading(false);
  }, [pnrNumber, addToast]);

  // Seat Availability Single Check
  const handleCheckAvailability = useCallback(async () => {
    if (!availTrainNumber || !availFrom || !availTo) {
      addToast('Please fill all fields', 'warning');
      return;
    }
    setIsAvailLoading(true);
    setAvailError('');
    setAvailData(null);
    try {
      const res = await checkSeatAvailability(availTrainNumber, availFrom, availTo, availDate, availClass);
      if (res?.success && res?.data) {
        setAvailData(res.data);
      } else {
        setAvailError(res?.message || 'Could not fetch seat availability.');
      }
    } catch {
      setAvailError('Failed to fetch seat availability.');
    }
    setIsAvailLoading(false);
  }, [availTrainNumber, availFrom, availTo, availDate, availClass, addToast]);

  // 6-Day Seat Matrix Open
  const handleOpenSeatMatrix = async (train, cls) => {
    const targetClass = cls || '3A';
    setActiveMatrixTrain({ train, classCode: targetClass });
    setIsMatrixLoading(true);
    setMatrixData([]);
    try {
      const res = await getMultiDayAvailability(train.train_number, fromCode, toCode, journeyDate, targetClass, 6);
      if (res?.matrix) {
        setMatrixData(res.matrix);
      }
    } catch {}
    setIsMatrixLoading(false);
  };

  // Timetable Schedule Modal Handler
  const handleOpenSchedule = useCallback(async (trainNumber, trainName) => {
    setScheduleModalTrain({ trainNumber, trainName });
    setIsScheduleLoading(true);
    setScheduleData(null);
    try {
      const res = await getTrainSchedule(trainNumber);
      if (res?.success && res?.data) {
        setScheduleData(res.data);
      }
    } catch {}
    setIsScheduleLoading(false);
  }, []);

  // Quick live track jump
  const handleQuickLiveTrack = (trainNo) => {
    setLiveTrainNumber(trainNo);
    setActiveTab('live');
    window.scrollTo({ top: 480, behavior: 'smooth' });
    setTimeout(() => handleCheckLiveStatus(), 100);
  };

  // Multi-Passenger Management
  const handleAddPassenger = () => {
    if (passengerList.length >= 6) {
      addToast('Maximum 6 passengers per ticket as per IRCTC guidelines', 'warning');
      return;
    }
    setPassengerList(prev => [
      ...prev,
      { id: Date.now(), name: '', age: '', gender: 'Male', berth: 'No Preference' }
    ]);
  };

  const handleRemovePassenger = (id) => {
    if (passengerList.length <= 1) {
      addToast('At least 1 passenger is required', 'warning');
      return;
    }
    setPassengerList(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdatePassenger = (id, field, value) => {
    setPassengerList(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Book Train & Forward to Checkout
  const handleConfirmTrain = () => {
    if (!activeTrainModal) return;

    // Validation
    for (let i = 0; i < passengerList.length; i++) {
      const p = passengerList[i];
      if (!p.name || p.name.trim().length < 2) {
        addToast(`Please enter full name for Passenger ${i + 1}`, 'warning');
        return;
      }
      const ageNum = parseInt(p.age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        addToast(`Please enter a valid age (1-120) for Passenger ${i + 1}`, 'warning');
        return;
      }
    }

    const train = activeTrainModal;
    const rawFare = train.fare || train.price || train.base_fare || selectedClass?.fare || 450;
    const singleBaseFare = typeof rawFare === 'object' ? (rawFare[selectedClass?.code] || 450) : Number(rawFare) || 450;
    const irctcFee = 17.70;
    const totalBaseFare = singleBaseFare * passengerList.length;
    const totalPayableINR = totalBaseFare + (irctcFee * passengerList.length);
    const totalUSD = Math.max(3, Math.round(totalPayableINR / 86.5));

    const trainDraft = {
      serviceType: 'train',
      provider: 'Indian Railways / IRCTC',
      itemTitle: `${train.train_name || train.trainName || 'Express'} (${train.train_number || train.trainNumber || ''})`,
      details: {
        route: `${train.from_station_name || train.from || fromCode} → ${train.to_station_name || train.to || toCode}`,
        departureTime: train.departure_time || train.from_std || '',
        arrivalTime: train.arrival_time || train.to_std || '',
        duration: train.duration || train.travel_time || '',
        travelClass: selectedClass?.name || selectedClass?.code || '3A (AC 3-Tier)',
        date: journeyDate,
        trainNumber: train.train_number || train.trainNumber || '',
        ticketFare: `₹${totalPayableINR.toLocaleString('en-IN')}`,
        passengers: passengerList.map(p => ({
          name: p.name.trim(),
          age: p.age,
          gender: p.gender,
          berth: p.berth
        })),
        passengerCount: passengerList.length,
        quota: selectedQuota,
        baseFare: totalBaseFare,
        convenienceFee: irctcFee * passengerList.length
      },
      priceUSD: totalUSD,
      totalUSD: totalUSD,
      amount: totalPayableINR,
      amountUSD: totalUSD,
      currency: 'INR',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80'
    };

    setActiveBooking(trainDraft);
    addToast(`Train ticket reserved for ${passengerList.length} passenger(s) — ₹${totalPayableINR}! Proceeding to checkout.`, 'success');
    navigate('/checkout');
  };

  // ── Filtered & Sorted Search Results ──
  const filteredAndSortedTrains = useMemo(() => {
    let result = [...trainResults];

    // 1. Running Filter
    if (trainFilter === 'running') {
      result = result.filter(t => t.runs_on_date !== false);
    } else if (trainFilter === 'non-running') {
      result = result.filter(t => t.runs_on_date === false);
    }

    // 2. Train Types Filter
    if (selectedTrainTypes.length > 0) {
      result = result.filter(t => {
        const typeStr = (t.train_type || t.type || '').toUpperCase();
        return selectedTrainTypes.some(sel => typeStr.includes(sel.toUpperCase()));
      });
    }

    // 3. Classes Filter
    if (selectedClasses.length > 0) {
      result = result.filter(t => {
        const classes = t.available_classes || [];
        return selectedClasses.some(c => classes.includes(c));
      });
    }

    // 4. Time Slot Filter
    if (selectedTimeSlots.length > 0) {
      result = result.filter(t => {
        const dep = t.departure_time || t.from_std || '08:00';
        const [h] = dep.split(':').map(Number);
        return selectedTimeSlots.some(slot => {
          if (slot === 'early_morning') return h >= 0 && h < 6;
          if (slot === 'morning') return h >= 6 && h < 12;
          if (slot === 'afternoon') return h >= 12 && h < 18;
          if (slot === 'night') return h >= 18 && h <= 23;
          return false;
        });
      });
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'departure_asc') {
        return (a.departure_time || a.from_std || '').localeCompare(b.departure_time || b.from_std || '');
      }
      if (sortBy === 'arrival_asc') {
        return (a.arrival_time || a.to_std || '').localeCompare(b.arrival_time || b.to_std || '');
      }
      if (sortBy === 'duration_asc') {
        const getDurMins = (trn) => {
          const d = trn.duration || trn.travel_time || '6h 00m';
          const hMatch = d.match(/(\d+)h/);
          const mMatch = d.match(/(\d+)m/);
          return (hMatch ? parseInt(hMatch[1], 10) * 60 : 0) + (mMatch ? parseInt(mMatch[1], 10) : 0);
        };
        return getDurMins(a) - getDurMins(b);
      }
      if (sortBy === 'fare_asc') {
        const getMinFare = (trn) => {
          if (typeof trn.fare === 'object') {
            const vals = Object.values(trn.fare).filter(Boolean);
            return vals.length > 0 ? Math.min(...vals) : 450;
          }
          return Number(trn.fare) || 450;
        };
        return getMinFare(a) - getMinFare(b);
      }
      if (sortBy === 'rating_desc') {
        return (b.rating || 4.5) - (a.rating || 4.5);
      }
      return 0;
    });

    return result;
  }, [trainResults, trainFilter, selectedTrainTypes, selectedClasses, selectedTimeSlots, sortBy]);

  // ── Filtered Station Board Trains ──
  const displayedBoardTrains = useMemo(() => {
    if (!boardData?.trains) return [];
    let list = boardData.trains;
    if (boardFilter === 'departures') {
      list = list.filter(t => t.scheduled_departure && t.scheduled_departure !== '--');
    } else if (boardFilter === 'arrivals') {
      list = list.filter(t => t.scheduled_arrival && t.scheduled_arrival !== '--');
    }
    if (boardSearch.trim()) {
      const q = boardSearch.trim().toLowerCase();
      list = list.filter(t =>
        (t.train_name && t.train_name.toLowerCase().includes(q)) ||
        (t.train_number && t.train_number.toLowerCase().includes(q)) ||
        (t.destination && t.destination.toLowerCase().includes(q)) ||
        (t.source && t.source.toLowerCase().includes(q))
      );
    }
    return list;
  }, [boardData, boardFilter, boardSearch]);

  // SEO Schemas
  const trainSchemas = [
    getWebPageSchema({ name: 'IRCTC Real-Time Train Booking — TravelEase', description: 'Real-time IRCTC timetable search, live GPS tracking, 6-day seat matrix, and multi-passenger booking.', url: '/trains', breadcrumb: true }),
    getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Trains' }], '/trains'),
    getServiceSchema({ name: 'TravelEase Live Indian Railway Engine', description: 'Real-time IRCTC integration for train search, PNR tracking, and live GPS status.', url: '/trains', serviceType: 'Train Booking Engine' }),
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#071326] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-500" id="trains-page">
      <JsonLd data={trainSchemas} />

      {/* ═══════ 1. CINEMATIC FLYBY ═══════ */}
      <CinematicTrainFlyby
        isPlaying={isFlybyPlaying}
        onFinish={handleFlybyFinish}
      />

      {/* ═══════ 2. HERO SECTION ═══════ */}
      <section ref={heroRef} className="relative pt-24 pb-28 md:pt-28 md:pb-36 overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {heroMediaMode === 'video' ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/train-hero-sunset.jpg"
              className="w-full h-full object-cover object-center scale-105 brightness-[0.98] contrast-[1.05] transition-opacity duration-700"
            >
              <source src="/train-moving.webm" type="video/webm" />
              <img
                src="/train-hero-sunset.jpg"
                alt="Scenic Train Journey Sunset"
                className="w-full h-full object-cover object-center brightness-[0.98] contrast-[1.05]"
              />
            </video>
          ) : (
            <motion.img
              initial={{ scale: 1 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }}
              src="/train-hero-sunset.jpg"
              alt="Vande Bharat Mountain Sunset"
              className="w-full h-full object-cover object-center brightness-[0.98] contrast-[1.05]"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/95 via-slate-900/15 to-black/35 dark:from-[#071326] dark:via-[#071326]/30 dark:to-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/25 to-transparent dark:from-[#071326]/85 dark:via-[#071326]/30 dark:to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,166,35,0.25)_0%,transparent_60%)]" />
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          {/* Top Bar with Real-Time HUD */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 text-[11px] text-slate-200 font-medium shadow-lg">
              <span className="trains-live-pulse" />
              <span>Live IRCTC Network · 8,990 Stations · 5,200+ Trains</span>
              {(activeTab === 'live' || activeTab === 'station-board') && (
                <span className="ml-2 pl-2 border-l border-white/20 text-emerald-400 font-bold flex items-center gap-1.5">
                  <FaBolt className="text-[10px]" />
                  <span>Sync {secondsAgo}s ago</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SegmentedPillToggle
                options={[
                  { id: 'video', label: '🎬 Moving Train' },
                  { id: 'photo', label: '🌅 Sunset' },
                ]}
                value={heroMediaMode}
                onChange={setHeroMediaMode}
                layoutId="trainsHeroMediaMode"
                size="sm"
              />

              {(activeTab === 'live' || activeTab === 'station-board') && (
                <ThreeUIButton
                  type="button"
                  variant="specular-dark"
                  size="sm"
                  onClick={triggerManualRefresh}
                  disabled={isRefreshing}
                  icon={<FaRedo className={`text-xs ${isRefreshing ? 'animate-spin' : ''}`} />}
                  title="Manual Real-Time Refresh"
                >
                  <span className="hidden sm:inline">Refresh</span>
                </ThreeUIButton>
              )}

              <ThreeUIButton
                type="button"
                variant="specular-dark"
                size="sm"
                onClick={() => setIsFlybyPlaying(true)}
                icon={<FaBolt className="text-xs text-amber-400" />}
              >
                <span className="hidden sm:inline">Flyby Animation</span>
              </ThreeUIButton>
            </div>
          </div>

          {/* Hero Typography & Spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                <span>Real-Time Indian Railways Engine</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                Book Your Train<br />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(245,166,35,0.4)]">
                  Journey
                </span>
              </h1>
              <p className="text-slate-200/90 text-sm sm:text-base font-normal mt-3.5 max-w-lg leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                Live IRCTC timetable search, real-time GPS telemetry radar, 6-day availability matrix, and zero-cancellation Tatkal booking.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 mt-5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200">
                  <span className="text-amber-400">⚡</span> 130 km/h Vande Bharat Express
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200">
                  <span className="text-emerald-400">✓</span> Multi-Passenger Support
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/35 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200">
                  <span className="text-cyan-400">📡</span> Live Telemetry Radar
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative p-5 sm:p-6 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/20 shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      Featured Express
                    </span>
                    <span className="text-xs font-bold text-amber-300">#22436 Vande Bharat</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>On Time · 130 km/h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between my-3 py-2 border-y border-white/10">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">Origin</p>
                    <h4 className="text-base font-extrabold text-white">New Delhi</h4>
                    <p className="text-xs text-amber-400 font-bold">NDLS · 06:00</p>
                  </div>
                  <div className="flex flex-col items-center px-3">
                    <span className="text-[10px] text-slate-300 font-semibold mb-1">8h 00m</span>
                    <div className="w-24 h-0.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 relative">
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[8px] shadow-[0_0_8px_rgba(245,166,35,0.8)]">
                        🚆
                      </span>
                    </div>
                    <span className="text-[9px] text-emerald-400 mt-1 font-semibold">759 km</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-400 font-medium">Destination</p>
                    <h4 className="text-base font-extrabold text-white">Varanasi</h4>
                    <p className="text-xs text-amber-400 font-bold">BSB · 14:00</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-semibold uppercase">Seat Matrix</span>
                    <span className="font-extrabold text-emerald-400 text-xs">CC: AVL 48 · EC: AVL 12</span>
                  </div>
                  <ThreeUIButton
                    type="button"
                    variant="amber-glow"
                    size="sm"
                    onClick={() => {
                      setFromCode('NDLS');
                      setToCode('BSB');
                      setActiveTab('search');
                      handleSearchTrains();
                    }}
                    icon={<FaArrowRight className="text-[9px]" />}
                  >
                    Instant Book
                  </ThreeUIButton>
                </div>
              </div>
            </div>
          </div>

          <AdaptivePersonaBar
            activePersona={activePersona}
            onSelectPersona={handleSelectPersona}
            tatkalTimer={tatkalCountdown}
          />

          {/* ═══════ 3. CONSOLE TABS ═══════ */}
          <div className="trains-glass-console rounded-[28px] p-6 md:p-8 text-slate-900 dark:text-white">
            <div className="mb-7 overflow-x-auto pb-1 scrollbar-none">
              <SegmentedPillToggle
                options={TABS.map((tab) => {
                  const Icon = tab.icon;
                  return {
                    id: tab.id,
                    label: tab.label,
                    icon: <Icon className="text-xs" />,
                  };
                })}
                value={activeTab}
                onChange={setActiveTab}
                layoutId="trainsConsoleTabs"
                size="md"
              />
            </div>

            {/* ─── TAB 1: SEARCH TRAINS ─── */}
            {activeTab === 'search' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
                {activePersona === 'senior' && (
                  <SeniorQuickBookingBar
                    onSelectRoute={(from, to) => {
                      setFromCode(from);
                      setToCode(to);
                      addToast(`Selected sacred route: ${from} → ${to}`, 'info');
                      setTimeout(() => handleSearchTrains(), 150);
                    }}
                    onSearch={handleSearchTrains}
                    requireLowerBerth={requireLowerBerth}
                    setRequireLowerBerth={setRequireLowerBerth}
                    requireWheelchair={requireWheelchair}
                    setRequireWheelchair={setRequireWheelchair}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-4">
                    <StationInput label="From" value={fromCode} onChange={setFromCode} placeholder="Origin station" />
                  </div>
                  <div className="md:col-span-1 flex items-end justify-center pb-1">
                    <button
                      type="button"
                      onClick={handleSwapStations}
                      className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/60 hover:bg-amber-500 hover:text-white flex items-center justify-center text-slate-400 transition-all"
                      title="Swap stations"
                    >
                      <FaExchangeAlt className="text-xs" />
                    </button>
                  </div>
                  <div className="md:col-span-4">
                    <StationInput label="To" value={toCode} onChange={setToCode} placeholder="Destination station" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="trains-input !pl-4"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { label: 'Today', offset: 0 },
                      { label: 'Tomorrow', offset: 1 },
                      { label: '+2 Days', offset: 2 },
                      { label: '+3 Days', offset: 3 },
                    ].map((d) => {
                      const target = new Date();
                      target.setDate(target.getDate() + d.offset);
                      const dateStr = target.toISOString().split('T')[0];
                      const isSelected = journeyDate === dateStr;
                      return (
                        <button
                          key={d.label}
                          type="button"
                          onClick={() => setJourneyDate(dateStr)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#002B49] text-amber-400'
                              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>

                  <ThreeUIButton
                    variant="amber-glow"
                    size="lg"
                    onClick={() => handleSearchTrains()}
                    disabled={isSearching}
                    icon={isSearching ? <FaSpinner className="animate-spin" /> : <FaSearch className="text-xs" />}
                  >
                    {isSearching ? 'Searching...' : 'Search Trains'}
                  </ThreeUIButton>
                </div>
              </motion.div>
            )}

            {/* ─── TAB 2: STATION LIVE BOARD ─── */}
            {activeTab === 'station-board' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-8">
                    <StationInput
                      label="Station"
                      value={boardStationCode}
                      onChange={setBoardStationCode}
                      placeholder="Search station by name or code"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <ThreeUIButton
                      variant="liquid-metal"
                      size="lg"
                      className="w-full"
                      onClick={() => handleFetchStationBoard(boardStationCode)}
                      disabled={isBoardLoading}
                      icon={isBoardLoading ? <FaSpinner className="animate-spin" /> : <FaTachometerAlt className="text-xs" />}
                    >
                      Show Live Board
                    </ThreeUIButton>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 mr-1">Quick:</span>
                  {[
                    { code: 'SPN', name: 'Shahjahanpur' },
                    { code: 'LKO', name: 'Lucknow' },
                    { code: 'NDLS', name: 'New Delhi' },
                    { code: 'BE', name: 'Bareilly' },
                    { code: 'CNB', name: 'Kanpur' },
                    { code: 'BSB', name: 'Varanasi' },
                    { code: 'MMCT', name: 'Mumbai' }
                  ].map(s => (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => {
                        setBoardStationCode(s.code);
                        setTimeout(() => handleFetchStationBoard(s.code), 50);
                      }}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all ${
                        boardStationCode === s.code
                          ? 'bg-[#002B49] text-amber-400'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── TAB 3: PNR STATUS ─── */}
            {activeTab === 'pnr' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-w-lg mx-auto py-4 text-center">
                <p className="text-sm text-slate-400 mb-4">Enter your 10-digit Indian Railways PNR number</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={pnrNumber}
                    onChange={(e) => setPnrNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="PNR Number (10 Digits)"
                    maxLength={10}
                    className="trains-pnr-input flex-1"
                  />
                  <ThreeUIButton
                    variant="liquid-metal"
                    size="lg"
                    onClick={handleCheckPnr}
                    disabled={isPnrLoading}
                    icon={isPnrLoading ? <FaSpinner className="animate-spin" /> : <FaSearch className="text-xs" />}
                    className="shrink-0"
                  >
                    Check
                  </ThreeUIButton>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs">
                  <span className="text-slate-400">Sample:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPnrNumber('2458910245');
                      setTimeout(handleCheckPnr, 50);
                    }}
                    className="text-amber-500 dark:text-amber-400 font-semibold hover:underline"
                  >
                    2458910245
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── TAB 4: LIVE TRACKING ─── */}
            {activeTab === 'live' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-5">
                    <TrainAutocompleteInput
                      label="Train"
                      value={liveTrainNumber}
                      onChange={setLiveTrainNumber}
                      placeholder="Train number or name"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={liveDate}
                      onChange={(e) => setLiveDate(e.target.value)}
                      className="trains-input !pl-4"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <ThreeUIButton
                      variant="amber-glow"
                      size="lg"
                      className="w-full"
                      onClick={handleCheckLiveStatus}
                      disabled={isLiveLoading}
                      icon={isLiveLoading ? <FaSpinner className="animate-spin" /> : <FaSatelliteDish className="text-xs" />}
                    >
                      Track Live
                    </ThreeUIButton>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 mr-1">Quick:</span>
                  {[
                    { num: '12004', name: 'Lucknow Shatabdi' },
                    { num: '22436', name: 'Vande Bharat' },
                    { num: '12230', name: 'Lucknow Mail' },
                    { num: '12430', name: 'AC Superfast' }
                  ].map(t => (
                    <button
                      key={t.num}
                      type="button"
                      onClick={() => {
                        setLiveTrainNumber(t.num);
                        setTimeout(handleCheckLiveStatus, 50);
                      }}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all ${
                        liveTrainNumber === t.num
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {t.num} · {t.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── TAB 5: SEAT AVAILABILITY ─── */}
            {activeTab === 'availability' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-3">
                    <TrainAutocompleteInput
                      label="Train"
                      value={availTrainNumber}
                      onChange={setAvailTrainNumber}
                      placeholder="Train no."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <StationInput label="From" value={availFrom} onChange={setAvailFrom} placeholder="Origin station" />
                  </div>
                  <div className="md:col-span-2">
                    <StationInput label="To" value={availTo} onChange={setAvailTo} placeholder="Destination station" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={availDate}
                      onChange={(e) => setAvailDate(e.target.value)}
                      className="trains-input !pl-3 text-xs"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                      Class
                    </label>
                    <select
                      value={availClass}
                      onChange={(e) => setAvailClass(e.target.value)}
                      className="trains-input !pl-2 !pr-2 appearance-none cursor-pointer text-xs"
                    >
                      {TRAIN_CLASSES.map(c => (
                        <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900">{c.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <ThreeUIButton
                      variant="liquid-metal"
                      size="lg"
                      className="w-full"
                      onClick={handleCheckAvailability}
                      disabled={isAvailLoading}
                      icon={isAvailLoading ? <FaSpinner className="animate-spin" /> : <FaChair className="text-xs" />}
                    >
                      Check
                    </ThreeUIButton>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ 4. RESULTS DISPLAY AREA ═══════ */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-36">
        <AnimatePresence mode="wait">

          {/* ─── TAB 1: TRAIN SEARCH RESULTS ─── */}
          {activeTab === 'search' && (
            <motion.div key="search-results-pane" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isSearching ? (
                <RailwayTrackLoader message="Scanning Pan-India Timetables & Live Availability Matrix..." />
              ) : searchError ? (
                <div className="text-center py-20">
                  <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl">
                    <FaTrain />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Trains Found</h3>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">{searchError}</p>
                </div>
              ) : trainResults.length > 0 ? (
                (() => {
                  const fromStationObj = ALL_INDIAN_STATIONS.find(s => s.code.toUpperCase() === fromCode?.toUpperCase());
                  const toStationObj = ALL_INDIAN_STATIONS.find(s => s.code.toUpperCase() === toCode?.toUpperCase());
                  const fromLabel = fromStationObj ? `${fromStationObj.name} (${fromStationObj.code})` : (fromCode || 'Origin');
                  const toLabel = toStationObj ? `${toStationObj.name} (${toStationObj.code})` : (toCode || 'Destination');

                  return (
                    <div className="space-y-6">
                      {/* Corridor Header & Controls */}
                      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Railway Corridor</span>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                              {fromLabel} <span className="text-amber-500">→</span> {toLabel}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {searchSummary?.dateFormatted || journeyDate} · Showing {filteredAndSortedTrains.length} of {trainResults.length} trains
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                              <FaSortAmountDown className="text-slate-400 text-xs" />
                              <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-transparent border-none text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                              >
                                <option value="departure_asc" className="bg-white dark:bg-slate-900">Departure: Earliest</option>
                                <option value="duration_asc" className="bg-white dark:bg-slate-900">Duration: Fastest First</option>
                                <option value="fare_asc" className="bg-white dark:bg-slate-900">Fare: Lowest First</option>
                                <option value="rating_desc" className="bg-white dark:bg-slate-900">Punctuality & Rating</option>
                                <option value="arrival_asc" className="bg-white dark:bg-slate-900">Arrival: Earliest</option>
                              </select>
                            </div>

                            {/* Filter Drawer Toggle */}
                            <button
                              type="button"
                              onClick={() => setShowFiltersDrawer(prev => !prev)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                showFiltersDrawer || selectedTrainTypes.length > 0 || selectedClasses.length > 0 || selectedTimeSlots.length > 0
                                  ? 'bg-[#002B49] text-amber-400 shadow-md'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <FaFilter className="text-xs" />
                              <span>Filters</span>
                              {(selectedTrainTypes.length + selectedClasses.length + selectedTimeSlots.length) > 0 && (
                                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                                  {selectedTrainTypes.length + selectedClasses.length + selectedTimeSlots.length}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Running Status Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/40 rounded-xl w-fit">
                          <button
                            onClick={() => setTrainFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              trainFilter === 'all'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            All ({trainResults.length})
                          </button>
                          <button
                            onClick={() => setTrainFilter('running')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              trainFilter === 'running'
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Running ({searchSummary?.running ?? trainResults.filter(t => t.runs_on_date !== false).length})
                          </button>
                          <button
                            onClick={() => setTrainFilter('non-running')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              trainFilter === 'non-running'
                                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            Not Running ({searchSummary?.nonRunning ?? trainResults.filter(t => t.runs_on_date === false).length})
                          </button>
                        </div>

                        {/* Advanced Filters Drawer */}
                        <AnimatePresence>
                          {showFiltersDrawer && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-400 block mb-2 uppercase text-[10px]">Train Type</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {['Vande Bharat', 'Shatabdi', 'Rajdhani', 'Superfast', 'Express'].map(type => {
                                    const isSel = selectedTrainTypes.includes(type);
                                    return (
                                      <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                          setSelectedTrainTypes(prev =>
                                            isSel ? prev.filter(t => t !== type) : [...prev, type]
                                          );
                                        }}
                                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                                          isSel
                                            ? 'bg-amber-500 text-slate-950 font-bold'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                      >
                                        {type}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div>
                                <span className="font-bold text-slate-400 block mb-2 uppercase text-[10px]">Departure Time Slot</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    { id: 'early_morning', label: 'Early Morning (00:00 - 06:00)' },
                                    { id: 'morning', label: 'Morning (06:00 - 12:00)' },
                                    { id: 'afternoon', label: 'Afternoon (12:00 - 18:00)' },
                                    { id: 'night', label: 'Night (18:00 - 24:00)' },
                                  ].map(slot => {
                                    const isSel = selectedTimeSlots.includes(slot.id);
                                    return (
                                      <button
                                        key={slot.id}
                                        type="button"
                                        onClick={() => {
                                          setSelectedTimeSlots(prev =>
                                            isSel ? prev.filter(s => s !== slot.id) : [...prev, slot.id]
                                          );
                                        }}
                                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                                          isSel
                                            ? 'bg-cyan-600 text-white font-bold'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                      >
                                        {slot.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {(selectedTrainTypes.length > 0 || selectedTimeSlots.length > 0) && (
                                <div className="pt-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTrainTypes([]);
                                      setSelectedTimeSlots([]);
                                      setSelectedClasses([]);
                                    }}
                                    className="text-[11px] font-bold text-rose-500 hover:underline"
                                  >
                                    Reset Filters
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Train List Cards */}
                      <div className="space-y-4">
                        {filteredAndSortedTrains.map((train, idx) => {
                          const trainName = train.train_name || train.trainName || 'Express Train';
                          const trainNum = train.train_number || train.trainNumber || '';
                          const depTime = (train.departure_time && train.departure_time !== '--') ? train.departure_time : (train.from_std && train.from_std !== '--' ? train.from_std : '08:30');
                          const arrTime = (train.arrival_time && train.arrival_time !== '--') ? train.arrival_time : (train.to_std && train.to_std !== '--' ? train.to_std : '17:45');
                          const duration = train.duration || '6h 30m';
                          const fromStn = train.from_station_name || train.from?.name || fromCode;
                          const toStn = train.to_station_name || train.to?.name || toCode;
                          const trainType = train.train_type || train.type || 'Express';
                          const runsOnDate = train.runs_on_date !== false;

                          return (
                            <motion.div
                              key={train.train_number || idx}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(idx * 0.04, 0.4), duration: 0.3 }}
                              className={`trains-card bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/60 rounded-3xl p-5 md:p-6 shadow-sm ${
                                runsOnDate ? 'trains-card-running' : 'trains-card-not-running'
                              }`}
                            >
                              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                                {/* Left Identity */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <span className="px-2 py-0.5 bg-[#002B49] text-amber-400 text-[10px] font-bold rounded-md">
                                      {trainNum}
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-400 uppercase">
                                      {trainType}
                                    </span>
                                    {runsOnDate ? (
                                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Runs {searchSummary?.day || 'selected date'}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-semibold text-rose-500">
                                        Not running on date
                                      </span>
                                    )}
                                  </div>

                                  <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
                                    {trainName}
                                  </h3>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {train.running_days_display || 'Runs Daily'} · {train.cleanliness || '4.7/5 Clean'} · {train.punctuality || '95% On-Time'}
                                  </p>

                                  {!runsOnDate && train.next_running_date && (
                                    <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-900/10 border border-rose-200/60 dark:border-rose-800/30 flex items-center justify-between text-xs">
                                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                                        Next run: {train.next_running_date.dateFormatted} ({train.next_running_date.dayCode})
                                      </span>
                                      <ThreeUIButton
                                        variant="liquid-metal"
                                        size="sm"
                                        onClick={() => handleSwitchToNextRun(train.next_running_date.dateStr)}
                                        icon={<FaArrowRight className="text-[8px]" />}
                                      >
                                        Switch
                                      </ThreeUIButton>
                                    </div>
                                  )}
                                </div>

                                {/* Center Times */}
                                <div className="flex items-center gap-0 shrink-0">
                                  <div className="text-center">
                                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{depTime}</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5 truncate max-w-28">{fromStn}</p>
                                  </div>

                                  <div className="flex flex-col items-center mx-4 sm:mx-6">
                                    <span className="text-[10px] text-slate-400 font-medium mb-1">{duration}</span>
                                    <div className="trains-route-connector w-16 sm:w-24" />
                                    <span className="text-[9px] text-slate-400 mt-1">{train.distance_km ? `${train.distance_km} km` : ''}</span>
                                  </div>

                                  <div className="text-center">
                                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{arrTime}</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5 truncate max-w-28">{toStn}</p>
                                  </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => handleQuickLiveTrack(trainNum)}
                                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                                    title="Live GPS tracking"
                                  >
                                    <FaSatelliteDish className="text-xs" />
                                  </button>
                                  <button
                                    onClick={() => setCoachModalTrain(train)}
                                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                                    title="Coach layout"
                                  >
                                    <IoMdTrain className="text-sm" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenSchedule(trainNum, trainName)}
                                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all"
                                    title="Route halts"
                                  >
                                    <FaRoute className="text-xs" />
                                  </button>
                                  <ThreeUIButton
                                    variant={runsOnDate ? 'amber-glow' : 'specular-dark'}
                                    size="sm"
                                    disabled={!runsOnDate}
                                    onClick={() => {
                                      if (runsOnDate) {
                                        setActiveTrainModal(train);
                                        const defaultClass = TRAIN_CLASSES.find(c => (train.available_classes || []).includes(c.code)) || TRAIN_CLASSES[2];
                                        setSelectedClass(defaultClass);
                                      }
                                    }}
                                    icon={runsOnDate ? <FaArrowRight className="text-[9px]" /> : undefined}
                                  >
                                    {runsOnDate ? 'Book' : 'N/A'}
                                  </ThreeUIButton>
                                </div>
                              </div>

                              {/* Class Availability Matrix Pills */}
                              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/40 overflow-x-auto scrollbar-none">
                                {(train.available_classes || ['3A', 'SL']).map(cls => {
                                  const avail = train.availability_by_class?.[cls] || {
                                    status_text: 'AVL 42',
                                    badge_color: 'emerald',
                                    fare: typeof train.fare === 'object' ? (train.fare[cls] || 450) : 450
                                  };
                                  const isAvail = avail.badge_color === 'emerald';
                                  const isRac = avail.badge_color === 'amber';

                                  return (
                                    <button
                                      key={cls}
                                      onClick={() => handleOpenSeatMatrix(train, cls)}
                                      className={`shrink-0 px-3.5 py-2 rounded-xl border transition-all text-left ${
                                        isAvail
                                          ? 'bg-emerald-50/40 dark:bg-emerald-900/10 border-emerald-200/60 dark:border-emerald-800/30 hover:border-emerald-400'
                                          : isRac
                                          ? 'bg-amber-50/40 dark:bg-amber-900/10 border-amber-200/60 dark:border-amber-800/30 hover:border-amber-400'
                                          : 'bg-rose-50/40 dark:bg-rose-900/10 border-rose-200/60 dark:border-rose-800/30 hover:border-rose-400'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{cls}</span>
                                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">₹{avail.fare}</span>
                                      </div>
                                      <div className="flex items-center justify-between gap-2 mt-0.5">
                                        <span className={`text-[10px] font-semibold ${
                                          isAvail ? 'text-emerald-600 dark:text-emerald-400' : isRac ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500'
                                        }`}>
                                          {avail.status_text}
                                        </span>
                                        <span className="text-[9px] text-slate-400 hover:underline">6d calendar</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {activePersona === 'student' && (
                        <div className="mt-8">
                          <RailwayTriviaQuiz />
                        </div>
                      )}

                      <DynamicTransitHUD
                        fromCode={fromCode}
                        toCode={toCode}
                        journeyDate={searchSummary?.dateFormatted || journeyDate}
                        trainCount={filteredAndSortedTrains.length}
                        runningCount={searchSummary?.running ?? trainResults.filter(t => t.runs_on_date !== false).length}
                        activeFilter={trainFilter}
                        onFilterChange={setTrainFilter}
                        onModifySearch={() => window.scrollTo({ top: 380, behavior: 'smooth' })}
                      />
                    </div>
                  );
                })()
              ) : (
                <div className="py-12 space-y-10">
                  <div className="text-center max-w-xl mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-tr from-[#002B49] to-[#004270] text-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-xl shadow-[#002B49]/20">
                      <FaTrain />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Explore Popular Indian Rail Corridors
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Select a premier high-speed express route below or search custom stations above.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { from: 'NDLS', fromName: 'New Delhi', to: 'LKO', toName: 'Lucknow', train: 'Lucknow Shatabdi / Vande Bharat', time: '6h 25m', fare: '₹450', badge: 'High Frequency' },
                      { from: 'MMCT', fromName: 'Mumbai Central', to: 'ADI', toName: 'Ahmedabad', train: 'Mumbai Vande Bharat Express', time: '5h 15m', fare: '₹510', badge: 'Express Corridor' },
                      { from: 'NDLS', fromName: 'New Delhi', to: 'BSB', toName: 'Varanasi', train: 'Vande Bharat / Kashi Express', time: '8h 00m', fare: '₹590', badge: 'Sacred Heritage' },
                      { from: 'SBC', fromName: 'Bengaluru', to: 'MAS', toName: 'Chennai Central', train: 'Mysuru Chennai Shatabdi', time: '4h 30m', fare: '₹385', badge: 'Fast Transit' },
                      { from: 'HWH', fromName: 'Howrah', to: 'PURI', toName: 'Puri', train: 'Puri Vande Bharat Express', time: '6h 10m', fare: '₹420', badge: 'Coastal Line' },
                      { from: 'NDLS', fromName: 'New Delhi', to: 'MMCT', toName: 'Mumbai Central', train: 'Mumbai Rajdhani Express', time: '15h 40m', fare: '₹1,250', badge: 'Premier Flagship' }
                    ].map((route) => (
                      <div
                        key={`${route.from}-${route.to}`}
                        onClick={() => {
                          setFromCode(route.from);
                          setToCode(route.to);
                          setTimeout(() => handleSearchTrains(), 50);
                          window.scrollTo({ top: 380, behavior: 'smooth' });
                        }}
                        className="group cursor-pointer p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/40 hover:border-amber-400/60 hover:shadow-xl hover:-translate-y-1 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                            {route.badge}
                          </span>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">from {route.fare}</span>
                        </div>

                        <div className="flex items-center justify-between my-2">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">From</span>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                              {route.fromName} ({route.from})
                            </h4>
                          </div>
                          <span className="text-amber-500 font-bold px-2">→</span>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">To</span>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                              {route.toName} ({route.to})
                            </h4>
                          </div>
                        </div>

                        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between text-xs text-slate-400">
                          <span className="truncate max-w-[170px]">{route.train}</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            {route.time} <FaArrowRight className="text-[9px] text-amber-500" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── TAB 2: STATION LIVE BOARD RESULTS ─── */}
          {activeTab === 'station-board' && (
            <motion.div key="board-results-pane" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isBoardLoading ? (
                <RailwayTrackLoader message="Connecting to Live Station Board..." />
              ) : boardError ? (
                <div className="text-center py-16">
                  <FaTimesCircle className="text-2xl text-rose-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Station Board Notice</h3>
                  <p className="text-sm text-slate-400 mb-4">{boardError}</p>
                  <button onClick={() => handleFetchStationBoard(boardStationCode)} className="px-5 py-2 bg-[#002B49] text-white rounded-xl text-xs font-bold transition-all hover:bg-[#003865]">
                    Retry
                  </button>
                </div>
              ) : boardData && Array.isArray(boardData.trains) ? (
                (() => {
                  const stationObj = ALL_INDIAN_STATIONS.find(s => s.code.toUpperCase() === boardStationCode?.toUpperCase());
                  const stnName = stationObj ? stationObj.name : `Station [${boardStationCode}]`;

                  return (
                    <div className="space-y-4">
                      {/* Station Header & Filter Controls */}
                      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{stnName}</h2>
                              <span className="px-2 py-0.5 rounded-md bg-[#002B49] text-amber-400 text-[10px] font-bold">
                                {boardStationCode.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Live platform departures & arrivals · Synced {secondsAgo}s ago
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="text"
                              value={boardSearch}
                              onChange={(e) => setBoardSearch(e.target.value)}
                              placeholder="Filter trains or destination..."
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                            />

                            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                              <button
                                onClick={() => setBoardFilter('all')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  boardFilter === 'all' ? 'bg-[#002B49] text-white shadow-sm' : 'text-slate-400'
                                }`}
                              >
                                All
                              </button>
                              <button
                                onClick={() => setBoardFilter('departures')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  boardFilter === 'departures' ? 'bg-[#002B49] text-white shadow-sm' : 'text-slate-400'
                                }`}
                              >
                                Departures
                              </button>
                              <button
                                onClick={() => setBoardFilter('arrivals')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  boardFilter === 'arrivals' ? 'bg-[#002B49] text-white shadow-sm' : 'text-slate-400'
                                }`}
                              >
                                Arrivals
                              </button>
                            </div>

                            <button
                              onClick={() => handleFetchStationBoard(boardStationCode)}
                              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
                            >
                              <FaRedo className={`text-xs ${isBoardLoading || isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Train List Rows */}
                      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/30 overflow-hidden">
                        {displayedBoardTrains.length > 0 ? (
                          displayedBoardTrains.map((t, idx) => (
                            <div
                              key={t.train_number || idx}
                              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/20 ${
                                idx !== 0 ? 'border-t border-slate-50 dark:border-slate-800/20' : ''
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="px-1.5 py-0.5 bg-[#002B49] text-amber-400 text-[10px] font-bold rounded-md">
                                    {t.train_number}
                                  </span>
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    PF {t.platform || '1'}
                                  </span>
                                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> On time
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.train_name}</h4>
                                <p className="text-[11px] text-slate-400">{t.source} → {t.destination}</p>
                              </div>

                              <div className="flex items-center gap-6 text-center shrink-0">
                                <div>
                                  <span className="text-[10px] text-slate-400 block">Arr</span>
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">{t.scheduled_arrival || '--:--'}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-amber-500 block">Dep</span>
                                  <span className="text-sm font-bold text-amber-600">{t.scheduled_departure || '--:--'}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleQuickLiveTrack(t.train_number)}
                                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                >
                                  Track
                                </button>
                                <button
                                  onClick={() => handleOpenSchedule(t.train_number, t.train_name)}
                                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                  Route
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center text-xs text-slate-400">
                            No trains match current board filter or search query.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </motion.div>
          )}

          {/* ─── TAB 3: PNR STATUS RESULTS ─── */}
          {activeTab === 'pnr' && (
            <motion.div key="pnr-results-pane" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isPnrLoading ? (
                <div className="max-w-lg mx-auto space-y-3 py-8">
                  <Skeleton className="h-6 w-40 mx-auto" />
                  <Skeleton className="h-44 w-full" />
                </div>
              ) : pnrError ? (
                <div className="text-center py-16 max-w-lg mx-auto">
                  <FaTimesCircle className="text-2xl text-rose-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">PNR Record Notice</h3>
                  <p className="text-sm text-slate-400">{pnrError}</p>
                </div>
              ) : pnrData ? (
                <div className="max-w-xl mx-auto bg-white dark:bg-slate-900/70 rounded-3xl border border-slate-200/80 dark:border-slate-800/60 overflow-hidden shadow-xl">
                  <div className="bg-[#002B49] p-6 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Official PNR Record</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        CNF Confirmed
                      </span>
                    </div>
                    <h3 className="text-2xl font-black mt-1">PNR: {pnrData.pnr_number || pnrNumber}</h3>
                    <p className="text-xs text-slate-300 mt-0.5 font-medium">
                      {pnrData.train_name || 'Superfast Express'} (#{pnrData.train_number || '12230'}) · {pnrData.from_station || ''} → {pnrData.to_station || ''}
                    </p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800/40">
                      <span className="text-slate-400">Journey Date: <strong className="text-slate-800 dark:text-slate-200">{pnrData.date_of_journey || 'Upcoming'}</strong></span>
                      <span className="text-slate-400">Chart: <strong className="text-emerald-500 font-bold">{pnrData.chart_status || 'Not Prepared'}</strong></span>
                    </div>

                    <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Passenger Berth Allocation</h4>
                    <div className="space-y-2">
                      {(pnrData.passengers || [{ passenger_num: 1, booking_status: 'CNF', current_status: 'CNF', coach: 'B2', berth: '27 (LB)' }]).map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/30 text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Passenger {p.passenger_num || i + 1}</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">Coach {p.coach || 'B2'} / Berth {p.berth || '27 (LB)'}</span>
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg text-xs">
                            {p.current_status || 'CNF'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* ─── TAB 4: LIVE TRACKING RESULTS (FIXED STATION NAME BUG & TELEMETRY GAUGE) ─── */}
          {activeTab === 'live' && (
            <motion.div key="live-results-pane" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isLiveLoading ? (
                <RailwayTrackLoader message="Interrogating Live Satellite Radar Telemetry..." />
              ) : liveError ? (
                <div className="text-center py-16 max-w-lg mx-auto">
                  <FaTimesCircle className="text-2xl text-rose-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Tracking Notice</h3>
                  <p className="text-sm text-slate-400">{liveError}</p>
                </div>
              ) : liveData ? (
                (() => {
                  const trainInfo = liveData.train || liveData;
                  const currentStationCode = liveData.current_station || liveData.data?.current_station || 'EN_ROUTE';
                  const currentStationName = liveData.current_station_name || liveData.data?.current_station_name || currentStationCode;
                  const nextStationCode = liveData.next_station || liveData.data?.next_station;
                  const nextStationName = liveData.next_station_name || liveData.data?.next_station_name;
                  const stationsList = liveData.stations || liveData.data?.stations || [];
                  const speedKmh = liveData.speed_kmh || liveData.data?.speed_kmh || 95;
                  const progressPct = liveData.progress_percent || liveData.data?.progress_percent || 65;

                  return (
                    <div className="space-y-6">
                      {/* High-Tech Telemetry Gauge HUD */}
                      <div className="bg-gradient-to-r from-[#002B49] to-[#071d36] text-white p-6 md:p-8 rounded-3xl shadow-xl border border-white/10 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-full border border-emerald-400/30">
                                <span className="trains-live-pulse" /> LIVE TELEMETRY
                              </span>
                              <span className="text-xs text-amber-400 font-bold">#{liveTrainNumber}</span>
                              <span className="text-xs text-slate-300 font-medium">Sync {secondsAgo}s ago</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black">
                              {trainInfo.train_name || 'Express Train'}
                            </h2>
                            <p className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-amber-400 text-xs" />
                              <span>Near <strong>{currentStationName}</strong> ({currentStationCode})</span>
                              {nextStationName && (
                                <span className="text-emerald-400">➔ Heading towards {nextStationName} ({nextStationCode})</span>
                              )}
                            </p>
                          </div>

                          {/* Speedometer Gauge Box */}
                          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
                            <div className="text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block">GPS Velocity</span>
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-3xl font-black text-amber-400">{speedKmh}</span>
                                <span className="text-xs text-slate-300 font-bold">km/h</span>
                              </div>
                            </div>
                            <div className="h-8 w-px bg-white/15" />
                            <div className="text-center">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Punctuality</span>
                              <span className="text-xs font-bold text-emerald-400">Right On Time</span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-2 text-slate-300">
                            <span>Journey Progress</span>
                            <span className="text-amber-400">{progressPct}% Completed</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPct}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 rounded-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* All Stations Full Route Halts Timeline */}
                      <div className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800/40 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Route Halts & Expected Times</h3>
                            <p className="text-xs text-slate-400">Showing full journey station halts sequence</p>
                          </div>
                          {stationsList.length > 8 && (
                            <button
                              type="button"
                              onClick={() => setShowAllHalts(prev => !prev)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition-colors"
                            >
                              {showAllHalts ? <>Collapse Halts <FaChevronUp className="text-[10px]" /></> : <>Show All {stationsList.length} Halts <FaChevronDown className="text-[10px]" /></>}
                            </button>
                          )}
                        </div>

                        <div className="relative pl-8">
                          <div className="trains-timeline-line" />
                          {(showAllHalts ? stationsList : stationsList.slice(0, 10)).map((stn, idx) => {
                            const isCurrent = stn.is_current;
                            const isPassed = stn.is_passed;

                            return (
                              <div key={idx} className={`relative flex items-center justify-between py-3.5 ${isCurrent ? 'bg-amber-50/60 dark:bg-amber-950/20 -mx-4 px-4 rounded-xl' : ''}`}>
                                <div className={`absolute left-[-23px] w-[11px] h-[11px] rounded-full border-2 z-10 transition-all ${
                                  isCurrent
                                    ? 'bg-amber-400 border-amber-400 scale-125 shadow-[0_0_10px_rgba(245,166,35,0.8)]'
                                    : isPassed
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'bg-white dark:bg-slate-900 border-slate-400'
                                }`} />

                                <div className="min-w-0 pr-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold text-sm truncate ${isCurrent ? 'text-amber-500 font-black' : 'text-slate-900 dark:text-white'}`}>
                                      {stn.stationName}
                                    </span>
                                    <span className="text-[10px] text-slate-400">({stn.stationCode})</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                      PF {stn.expected_platform || 1}
                                    </span>
                                    {isCurrent && (
                                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                                        Current Position
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Halt {stn.haltTime || '2m'} · Distance {stn.distanceKm || 0} km
                                  </span>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className={`font-bold text-sm block ${isCurrent ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {stn.departureTime || stn.arrivalTime || '--:--'}
                                  </span>
                                  <span className="text-[10px] text-emerald-500 font-semibold">On Time</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </motion.div>
          )}

          {/* ─── TAB 5: SEAT AVAILABILITY RESULTS ─── */}
          {activeTab === 'availability' && (
            <motion.div key="avail-results-pane" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {isAvailLoading ? (
                <RailwayTrackLoader message="Querying IRCTC Seat Matrix & 6-Day Forecast..." />
              ) : availError ? (
                <div className="text-center py-16 max-w-lg mx-auto">
                  <FaTimesCircle className="text-2xl text-rose-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Availability Notice</h3>
                  <p className="text-sm text-slate-400">{availError}</p>
                </div>
              ) : availData ? (
                (() => {
                  const avail = availData;
                  const statusText = avail.status_text || 'AVL 48';
                  const isAvailable = statusText.toUpperCase().includes('AVL');

                  return (
                    <div className="max-w-md mx-auto bg-white dark:bg-slate-900/70 rounded-3xl border border-slate-200/80 dark:border-slate-800/60 p-7 text-center shadow-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Live IRCTC Seat Matrix</span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                        Train #{availTrainNumber} · Class {availClass}
                      </h3>
                      <div className="my-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/40">
                        <span className={`text-4xl font-black tracking-tight ${isAvailable ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {statusText}
                        </span>
                        <p className="text-xs text-slate-400 mt-2 font-medium">
                          Confirmation: <strong className="text-emerald-500">{avail.confirm_probability || '100% Guaranteed'}</strong> · Fare: ₹{avail.fare || 480}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setFromCode(availFrom);
                          setToCode(availTo);
                          setActiveTab('search');
                          handleSearchTrains();
                        }}
                        className="trains-cta-glow px-7 py-3 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2"
                      >
                        <span>Book on TravelEase</span>
                        <FaArrowRight className="text-[10px]" />
                      </button>
                    </div>
                  );
                })()
              ) : null}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ═══════ 5. 6-DAY SEAT AVAILABILITY MATRIX MODAL ═══════ */}
      <AnimatePresence>
        {activeMatrixTrain && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActiveMatrixTrain(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">6-Day Real-Time Availability Calendar</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {activeMatrixTrain.train?.train_name} (#{activeMatrixTrain.train?.train_number}) · {activeMatrixTrain.classCode}
                  </h3>
                  <p className="text-xs text-slate-400">Click any date to instantly book with guaranteed seat status</p>
                </div>
                <button
                  onClick={() => setActiveMatrixTrain(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {isMatrixLoading ? (
                <div className="py-12 text-center">
                  <FaSpinner className="animate-spin text-2xl text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Querying live 6-day IRCTC seat matrix...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {matrixData.map((cell) => {
                    const isAvail = cell.badge_color === 'emerald';
                    const isRac = cell.badge_color === 'amber';

                    return (
                      <div
                        key={cell.dateStr}
                        onClick={() => {
                          setJourneyDate(cell.dateStr);
                          setActiveTrainModal(activeMatrixTrain.train);
                          setSelectedClass(TRAIN_CLASSES.find(c => c.code === activeMatrixTrain.classCode) || { code: activeMatrixTrain.classCode, fare: cell.fare });
                          setActiveMatrixTrain(null);
                        }}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
                          isAvail
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40 hover:border-emerald-500'
                            : isRac
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/40 hover:border-amber-500'
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/40 hover:border-rose-500'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-900 dark:text-white">{cell.dateFormatted}</span>
                          <span className="text-[10px] text-slate-400">{cell.dayName}</span>
                        </div>
                        <div className={`text-sm font-extrabold my-1 ${
                          isAvail ? 'text-emerald-600 dark:text-emerald-400' : isRac ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500'
                        }`}>
                          {cell.status_text}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                          <span>₹{cell.fare}</span>
                          <span className="text-emerald-500 font-semibold">{cell.confirm_probability}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════ 6. MULTI-PASSENGER BOOKING MODAL ═══════ */}
      <AnimatePresence>
        {activeTrainModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActiveTrainModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Confirm Train Reservation</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {activeTrainModal.train_name} (#{activeTrainModal.train_number})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeTrainModal.departure_time} → {activeTrainModal.arrival_time} · {journeyDate}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTrainModal(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* Travel Class Selection */}
              <div>
                <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#002B49] text-amber-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  Select Travel Class
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {TRAIN_CLASSES.slice(0, 6).map(cls => {
                    const isAvailable = (activeTrainModal.available_classes || []).includes(cls.code);
                    const isSelected = selectedClass?.code === cls.code;
                    const fare = typeof activeTrainModal.fare === 'object' ? (activeTrainModal.fare[cls.code] || 450) : 450;
                    return (
                      <button
                        key={cls.code}
                        type="button"
                        onClick={() => { if (isAvailable) setSelectedClass({ ...cls, fare }); }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          !isAvailable
                            ? 'opacity-30 cursor-not-allowed border-slate-100 dark:border-slate-800/20'
                            : isSelected
                            ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-900/10'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-800 dark:text-slate-200">{cls.code}</span>
                          <span className="text-amber-600">₹{fare}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{cls.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quota Selection */}
              <div>
                <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#002B49] text-amber-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  Reservation Quota
                </h4>
                <div className="overflow-x-auto pb-1 scrollbar-none">
                  <SegmentedPillToggle
                    options={[
                      { id: 'GN', label: 'General' },
                      { id: 'TQ', label: 'Tatkal' },
                      { id: 'SS', label: 'Senior' },
                      { id: 'LD', label: 'Ladies' },
                    ]}
                    value={selectedQuota}
                    onChange={setSelectedQuota}
                    layoutId="trainsQuotaToggle"
                    size="sm"
                  />
                </div>
              </div>

              {/* Multi-Passenger Details */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#002B49] text-amber-400 flex items-center justify-center text-[10px] font-bold">3</span>
                    Passengers ({passengerList.length}/6)
                  </h4>
                  {passengerList.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddPassenger}
                      className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1"
                    >
                      <FaUserPlus className="text-xs" /> Add Passenger
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {passengerList.map((p, idx) => (
                    <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Passenger {idx + 1}</span>
                        {passengerList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePassenger(p.id)}
                            className="text-rose-400 hover:text-rose-600 p-1"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleUpdatePassenger(p.id, 'name', e.target.value)}
                        placeholder="Full Name (as per Govt ID)"
                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                      />

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={p.age}
                          onChange={(e) => handleUpdatePassenger(p.id, 'age', e.target.value)}
                          placeholder="Age"
                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                        />
                        <select
                          value={p.gender}
                          onChange={(e) => handleUpdatePassenger(p.id, 'gender', e.target.value)}
                          className="px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Transgender">Transgender</option>
                        </select>
                        <select
                          value={p.berth}
                          onChange={(e) => handleUpdatePassenger(p.id, 'berth', e.target.value)}
                          className="px-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                        >
                          <option value="No Preference">No Preference</option>
                          <option value="Lower">Lower Berth</option>
                          <option value="Middle">Middle Berth</option>
                          <option value="Upper">Upper Berth</option>
                          <option value="Side Lower">Side Lower</option>
                          <option value="Side Upper">Side Upper</option>
                          <option value="Window">Window Seat</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation */}
              {(() => {
                const classCode = selectedClass?.code || '3A';
                const baseFare = typeof activeTrainModal.fare === 'object'
                  ? (activeTrainModal.fare[classCode] || 450)
                  : (activeTrainModal.price || 450);
                const count = passengerList.length;
                const irctcFee = 17.70 * count;
                const totalPayable = (baseFare * count) + irctcFee;

                return (
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 text-xs space-y-2">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Base Fare ({classCode} × {count} pax)</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">₹{baseFare * count}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>IRCTC Convenience Fee</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">₹{irctcFee.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 flex justify-between items-center font-bold">
                      <span className="text-slate-800 dark:text-slate-200">Total Payable</span>
                      <span className="text-xl text-amber-600 dark:text-amber-400 font-black">₹{totalPayable.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2.5">
                <ThreeUIButton
                  type="button"
                  variant="amber-glow"
                  size="lg"
                  onClick={handleConfirmTrain}
                  icon={<FaArrowRight className="text-xs" />}
                >
                  Proceed to Payment
                </ThreeUIButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════ 7. COACH SEQUENCE MODAL ═══════ */}
      <AnimatePresence>
        {coachModalTrain && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setCoachModalTrain(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Coach Composition Layout</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    #{coachModalTrain.train_number} {coachModalTrain.train_name}
                  </h3>
                  <p className="text-xs text-slate-400">Standard 22-Coach LHB Rake Formation</p>
                </div>
                <button
                  onClick={() => setCoachModalTrain(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <div className="overflow-x-auto py-6 scrollbar-none">
                <div className="flex items-center gap-2 min-w-max">
                  <div className="px-3.5 py-2.5 bg-[#002B49] text-amber-400 rounded-l-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <FaTrain /> Engine WAP-7
                  </div>
                  {['SLR', 'GEN', 'S1', 'S2', 'S3', 'S4', 'S5', 'PC', 'B1', 'B2', 'B3', 'B4', 'A1', 'A2', 'H1', 'SLR'].map((c, i) => (
                    <div key={i} className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 text-center">
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════ 8. TIMETABLE SCHEDULE MODAL ═══════ */}
      <AnimatePresence>
        {scheduleModalTrain && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setScheduleModalTrain(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {scheduleModalTrain.trainName} (#{scheduleModalTrain.trainNumber})
                  </h3>
                  <p className="text-xs text-slate-400">Complete Timetable & Station Halts</p>
                </div>
                <button
                  onClick={() => setScheduleModalTrain(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {isScheduleLoading ? (
                <div className="py-12 text-center">
                  <FaSpinner className="animate-spin text-xl text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading timetable...</p>
                </div>
              ) : scheduleData && Array.isArray(scheduleData.schedule) ? (
                <div className="space-y-2">
                  {scheduleData.schedule.map((stop, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{stop.stationName}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({stop.stationCode}) · PF {stop.platform || 1}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{stop.arrivalTime || '--'} / {stop.departureTime || '--'}</span>
                        <span className="text-[10px] text-slate-400 block">{stop.distanceKm || 0} km</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════ 9. HERITAGE STORY SHOWCASE ═══════ */}
      <HeritageStoryShowcase />
    </div>
  );
};

export default Trains;
