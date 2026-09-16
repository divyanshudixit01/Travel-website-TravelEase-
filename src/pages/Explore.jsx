import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { resolveDestination, getLiveExploreDestinations } from '../services/dynamicTravelEngine';
import { 
  FaSearch, 
  FaDirections, 
  FaStar, 
  FaCompass, 
  FaCrosshairs, 
  FaArrowRight,
  FaSun,
  FaHeart,
  FaRegHeart,
  FaTimes,
  FaLayerGroup,
  FaRoute,
  FaPlane,
  FaTrain,
  FaHotel,
  FaCalendarAlt,
  FaCheckCircle,
  FaSlidersH
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema } from '../utils/schemas';
import ThemeContext from '../context/ThemeContext';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';
import { 
  getHotelsRoute, 
  getTrainsRoute, 
  getFlightsRoute, 
  getItineraryRoute, 
  getDestinationsRoute, 
  hasTrainNetwork 
} from '../utils/travelBridge';

// Leaflet default icon asset fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Haversine distance calculator in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Map Tile Layer Providers
const MAP_STYLES = {
  voyager: {
    name: 'Clean Light',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  dark: {
    name: 'Midnight Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
  },
  satellite: {
    name: 'HD Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  terrain: {
    name: 'Topography',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
  }
};

// Custom Apple-style Glassmorphic Map Marker
const createCustomIcon = (color, price, isSelected = false, isDark = false) => {
  const bgBadge = isDark ? 'rgba(14, 18, 28, 0.95)' : 'rgba(255, 255, 255, 0.96)';
  const textColor = isDark ? '#ffffff' : '#0f172a';
  const borderColor = isSelected ? '#f59e0b' : isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(203, 213, 225, 0.85)';

  return L.divIcon({
    className: 'custom-map-pin-container',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: scale(${isSelected ? 1.22 : 1});
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        cursor: pointer;
      ">
        ${isSelected ? '<div class="pin-radar-ring" style="position: absolute; width: 52px; height: 52px; border-radius: 50%; border: 2px solid #f59e0b; top: -8px; pointer-events: none;"></div>' : ''}
        
        <!-- Price Pill Badge -->
        <div style="
          background: ${bgBadge};
          color: ${textColor};
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 800;
          font-size: 11px;
          padding: 3.5px 8.5px;
          border-radius: 9999px;
          box-shadow: 0 8px 20px -4px rgba(0,0,0,${isDark ? '0.7' : '0.15'});
          border: 1.5px solid ${borderColor};
          white-space: nowrap;
          margin-bottom: 3px;
          letter-spacing: -0.2px;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: ${color}; display: inline-block;"></span>
          ${price}
        </div>

        <!-- Pin Tip Needle -->
        <div style="
          background-color: ${color};
          width: 22px;
          height: 22px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        ">
          <div style="
            width: 7px;
            height: 7px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      </div>
    `,
    iconSize: [70, 52],
    iconAnchor: [35, 50],
    popupAnchor: [0, -45],
  });
};

const categoryColors = {
  beach: '#0ea5e9',
  mountain: '#10b981',
  heritage: '#f59e0b',
  city: '#8b5cf6',
  luxe: '#ec4899',
  nature: '#14b8a6'
};

// Live Dynamic Destination Dataset from Multi-API Engine
const destinationsData = getLiveExploreDestinations();

const categoryOptions = [
  { id: 'all', label: 'All Spots' },
  { id: 'beach', label: '🏖️ Beaches' },
  { id: 'mountain', label: '🏔️ Mountains' },
  { id: 'heritage', label: '🏛️ Heritage' },
  { id: 'luxe', label: '✨ Luxury' },
  { id: 'city', label: '🌆 Metropolis' },
];

// Helper to smoothly fly Leaflet camera
const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.6, easeLinearity: 0.25 });
    }
  }, [center, zoom, map]);
  return null;
};

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || searchParams.get('search') || '';

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [allDestinations, setAllDestinations] = useState(destinationsData);
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedDest, setSelectedDest] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  
  // Automatically adapt map style to active application theme
  const [mapStyleKey, setMapStyleKey] = useState(isDark ? 'dark' : 'voyager');
  const [mapCenter, setMapCenter] = useState([22.5937, 78.9629]); // Central India view
  const [mapZoom, setMapZoom] = useState(5);
  const [userPos, setUserPos] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(90000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailModalDest, setDetailModalDest] = useState(null);
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);

  // Sync default map tile when user toggles light/dark mode
  useEffect(() => {
    if (mapStyleKey === 'voyager' || mapStyleKey === 'dark') {
      setMapStyleKey(isDark ? 'dark' : 'voyager');
    }
  }, [isDark, mapStyleKey]);

  // Focus on selected destination & fly camera
  const handleSelectDest = useCallback((dest) => {
    setSelectedDest(dest);
    setMapCenter([dest.lat, dest.lng]);
    setMapZoom(12);
  }, []);

  // Dynamic Destination Resolver (OpenStreetMap Nominatim + Wikipedia + Weather)
  const handleDynamicSearch = useCallback(async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    const clean = queryText.trim();
    
    // Check if place already exists in our active destination pool
    const existing = allDestinations.find(d => 
      (d.name && d.name.toLowerCase().includes(clean.toLowerCase())) || 
      (clean.toLowerCase().includes((d.name || '').toLowerCase())) ||
      (d.title && d.title.toLowerCase().includes(clean.toLowerCase()))
    );

    if (existing) {
      handleSelectDest(existing);
      return;
    }

    // Otherwise dynamically resolve via OpenStreetMap Geocoding + Wikipedia REST API
    setIsResolving(true);
    try {
      const dynamicDest = await resolveDestination(clean);
      if (dynamicDest) {
        setAllDestinations(prev => {
          const exists = prev.some(d => d.id === dynamicDest.id || d.name.toLowerCase() === dynamicDest.name.toLowerCase());
          return exists ? prev : [dynamicDest, ...prev];
        });
        handleSelectDest(dynamicDest);
      }
    } catch (err) {
      console.warn('[Explore Dynamic Resolve Error]', err);
    } finally {
      setIsResolving(false);
    }
  }, [allDestinations, handleSelectDest]);

  // Sync with incoming URL query parameter (?q=Varanasi or ?q=Taj+Mahal)
  useEffect(() => {
    if (urlQuery) {
      setSearchQuery(urlQuery);
      handleDynamicSearch(urlQuery);
    }
  }, [urlQuery, handleDynamicSearch]);

  // Toggle favorite
  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  // Handle Geolocation
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserPos(coords);
          setMapCenter(coords);
          setMapZoom(9);
        },
        () => {
          console.warn('Unable to retrieve location. Using default map view.');
        }
      );
    }
  };

  // Filtered & Sorted Destinations
  const filteredDestinations = allDestinations
    .filter((dest) => {
      const destName = dest.name || dest.title || '';
      const destDesc = dest.description || '';
      const destTags = dest.tags || dest.highlights || [];

      const matchesCat = activeCategory === 'all' || dest.category === activeCategory;
      const matchesSearch = 
        !searchQuery.trim() ||
        destName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = dest.numericPrice <= maxPrice;
      const matchesRating = dest.rating >= minRating;
      return matchesCat && matchesSearch && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'priceLow') return a.numericPrice - b.numericPrice;
      if (sortBy === 'priceHigh') return b.numericPrice - a.numericPrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'nearest' && userPos) {
        const distA = calculateDistance(userPos[0], userPos[1], a.lat, a.lng);
        const distB = calculateDistance(userPos[0], userPos[1], b.lat, b.lng);
        return distA - distB;
      }
      return (b.reviews || 1000) - (a.reviews || 1000); // default popular
    });

  // Open Directions in Google Maps
  const handleGetDirections = (dest, e) => {
    if (e) e.stopPropagation();
    const originStr = userPos ? `${userPos[0]},${userPos[1]}` : 'Current+Location';
    const destUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${dest.lat},${dest.lng}`;
    window.open(destUrl, '_blank');
  };

  const exploreSchemas = [
    getWebPageSchema({ 
      name: 'Interactive World Map Explorer — TravelEase', 
      description: 'Explore world-class destinations with multi-layer maps, dynamic weather status, real-time distance calculation, and interactive flight/hotel booking integration.', 
      url: '/explore', 
      breadcrumb: true 
    }),
    getBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Explore' }], '/explore'),
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#06080d] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-500" id="explore-page">
      <JsonLd data={exploreSchemas} />

      {/* ============================================================
          1. FLOATING EXPLORER SUB-DOCK COMMAND BAR (Top-20 below fixed Header)
          ============================================================ */}
      <div className="absolute top-20 inset-x-4 sm:inset-x-8 z-30 flex items-center justify-between gap-3 pointer-events-none">
        
        {/* Left: Drawer Toggle & Telemetry Pill */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button 
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 dark:bg-[#0e111a]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/12 text-slate-900 dark:text-white hover:border-amber-400/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.7)] text-xs font-mono font-bold transition-all active:scale-95"
            title={sidebarOpen ? "Hide Explorer Hub" : "Show Explorer Hub"}
          >
            <FaCompass className="text-amber-500 text-sm animate-spin-slow" />
            <span className="hidden sm:inline">EXPLORER HUB</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px]">
              {filteredDestinations.length}
            </span>
          </button>
        </div>

        {/* Center: Segmented Category Switcher (Desktop / Tablet) */}
        <div className="hidden md:flex pointer-events-auto">
          <SegmentedPillToggle
            options={categoryOptions}
            value={activeCategory}
            onChange={setActiveCategory}
            size="sm"
          />
        </div>

        {/* Right: Map Layer Switcher & GPS Locator */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* Map Layer Switcher Dropdown */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowLayerDropdown(!showLayerDropdown)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#0e111a]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/12 text-slate-800 dark:text-white text-xs font-mono font-bold shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.7)] hover:border-amber-400/80 transition-all active:scale-95"
              title="Change Map Tile Style"
            >
              <FaLayerGroup className="text-amber-500 text-xs" />
              <span className="hidden sm:inline">{MAP_STYLES[mapStyleKey].name}</span>
            </button>

            <AnimatePresence>
              {showLayerDropdown && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-52 p-2 rounded-2xl bg-white/95 dark:bg-[#0e111a]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/12 shadow-2xl space-y-1 z-50"
                >
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2.5 py-1">Map Providers</div>
                  {Object.keys(MAP_STYLES).map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setMapStyleKey(key);
                        setShowLayerDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-between ${
                        mapStyleKey === key 
                          ? 'bg-amber-500 text-slate-950 shadow-sm' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{MAP_STYLES[key].name}</span>
                      {mapStyleKey === key && <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Locate My GPS Position Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            title="Locate My GPS Position"
            className="flex items-center justify-center w-9 h-9 rounded-2xl bg-white/95 dark:bg-[#0e111a]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/12 text-amber-500 hover:border-amber-400/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.7)] transition-all active:scale-95 group"
          >
            <FaCrosshairs className="w-3.5 h-3.5 group-hover:scale-110 group-hover:text-amber-400 transition-transform" />
          </button>
        </div>
      </div>

      {/* ============================================================
          2. MAIN MAP VIEWPORT & LEFT FLOATING HUB DRAWER
          ============================================================ */}
      <div className="relative flex-1 w-full h-full">
        
        {/* Left Floating Hub Drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -420, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -420, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="absolute left-4 sm:left-8 top-34 bottom-6 z-20 w-[calc(100vw-32px)] sm:w-[380px] rounded-3xl bg-white/95 dark:bg-[#0c0e18]/92 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border border-slate-200/90 dark:border-white/10 flex flex-col overflow-hidden"
            >
              {/* Drawer Header: Title & Filters Trigger */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200/80 dark:border-white/10">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Curated Destinations</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                      {filteredDestinations.length}
                    </span>
                  </h2>
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">Click any card to fly camera</p>
                </div>

                <button 
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
                    showFilters 
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-amber-400/50'
                  }`}
                >
                  <FaSlidersH className="text-xs" />
                  <span>FILTERS</span>
                </button>
              </div>

              {/* Quick Search Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    setSearchParams({ q: searchQuery.trim() });
                    handleDynamicSearch(searchQuery.trim());
                  }
                }}
                className="relative mb-3"
              >
                <button type="submit" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">
                  {isResolving ? (
                    <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <FaSearch className="w-3.5 h-3.5" />
                  )}
                </button>
                <input
                  type="text"
                  placeholder={isResolving ? "Resolving via OpenStreetMap..." : "Search ANY spot in India & World..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-16 py-2 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-mono font-bold transition-all shadow-sm"
                  >
                    Go
                  </button>
                </div>
              </form>

              {/* Mobile Category Pill Switcher (inside drawer if on mobile) */}
              <div className="md:hidden mb-3 overflow-x-auto no-scrollbar">
                <SegmentedPillToggle
                  options={categoryOptions}
                  value={activeCategory}
                  onChange={setActiveCategory}
                  size="sm"
                />
              </div>

              {/* Collapsible Filter Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-3 p-3.5 rounded-2xl bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 space-y-3 shrink-0"
                  >
                    <div>
                      <div className="flex justify-between text-[11px] font-mono font-bold mb-1 text-slate-700 dark:text-slate-300">
                        <span>Max Price</span>
                        <span className="text-amber-600 dark:text-amber-400">₹{maxPrice.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" 
                        min="4000" 
                        max="90000" 
                        step="2000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-white/20 rounded-lg"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono font-bold mb-1 text-slate-700 dark:text-slate-300">
                        <span>Min Rating</span>
                        <span className="text-amber-600 dark:text-amber-400">★ {minRating > 0 ? `${minRating}+` : 'Any'}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="0.5"
                        value={minRating}
                        onChange={(e) => setMinRating(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-white/20 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold mb-1 text-slate-700 dark:text-slate-300">Sort Destinations</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white dark:bg-[#131622] border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="popular">Most Popular Reviews</option>
                        <option value="rating">Highest Rated (★)</option>
                        <option value="priceLow">Price: Low to High</option>
                        <option value="priceHigh">Price: High to Low</option>
                        {userPos && <option value="nearest">Nearest to My GPS</option>}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Destinations Scrollable List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
                {filteredDestinations.map(dest => {
                  const distFromUser = userPos ? calculateDistance(userPos[0], userPos[1], dest.lat, dest.lng) : null;
                  const isFav = favorites.includes(dest.id);
                  const isSelected = selectedDest?.id === dest.id;

                  return (
                    <motion.div
                      key={dest.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleSelectDest(dest)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex gap-3 relative group ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/20 shadow-md ring-1 ring-amber-500/50'
                          : 'border-slate-200/90 dark:border-white/8 bg-white/90 dark:bg-white/[0.03] hover:border-amber-400/60 shadow-sm'
                      }`}
                    >
                      {/* Thumbnail with Weather Tag */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img 
                          src={dest.image} 
                          alt={dest.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9.5px] font-mono font-bold text-white flex items-center gap-1">
                          <FaSun className="text-amber-400 text-[8px]" />
                          {dest.weather?.temp || '24°C'}
                        </span>
                      </div>

                      {/* Info Body */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {dest.name}
                            </h3>
                            <button 
                              type="button"
                              onClick={(e) => toggleFavorite(dest.id, e)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                              aria-label="Save to favorites"
                            >
                              {isFav ? <FaHeart className="text-rose-500 w-3 h-3" /> : <FaRegHeart className="w-3 h-3" />}
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">
                            {dest.description}
                          </p>
                        </div>

                        {distFromUser && (
                          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                            <FaRoute className="w-2.5 h-2.5" /> {distFromUser.toLocaleString()} km away
                          </span>
                        )}

                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100 dark:border-white/5">
                          <span className="text-xs font-mono font-extrabold text-amber-600 dark:text-amber-400">
                            {dest.price} <span className="text-[9px] font-normal text-slate-500">/ person</span>
                          </span>

                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDetailModalDest(dest); }}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-500 hover:text-slate-950 transition-all"
                          >
                            DETAILS
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredDestinations.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs font-mono">
                    No destinations match your search filters.
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ============================================================
            3. LEAFLET INTERACTIVE MAP CONTAINER
            ============================================================ */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <TileLayer
            attribution={MAP_STYLES[mapStyleKey].attribution}
            url={MAP_STYLES[mapStyleKey].url}
          />

          <MapFlyTo center={mapCenter} zoom={mapZoom} />

          {/* User GPS Pin */}
          {userPos && (
            <Marker position={userPos} icon={createCustomIcon('#10b981', 'You', true, isDark)}>
              <Popup className="custom-leaflet-popup">
                <div className="p-3 text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Your Current GPS Location</span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination Pin Markers */}
          {filteredDestinations.map(dest => (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lng]}
              icon={createCustomIcon(categoryColors[dest.category] || '#f59e0b', dest.price, selectedDest?.id === dest.id, isDark)}
              eventHandlers={{
                click: () => handleSelectDest(dest),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="w-60 p-2.5 text-slate-900 dark:text-white">
                  <div className="relative h-28 rounded-xl overflow-hidden mb-2 shadow-inner">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full shadow-md">
                      {dest.category}
                    </span>
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9.5px] font-mono font-bold text-white flex items-center gap-1">
                      <FaStar className="text-amber-400 text-[8px]" /> {dest.rating}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs mb-1 text-slate-900 dark:text-white line-clamp-1">{dest.name}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mb-2 leading-relaxed">{dest.description}</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10 gap-2">
                    <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-xs">{dest.price}</span>
                    
                    <div className="flex items-center gap-1.5">
                      <a
                        href={getHotelsRoute(dest.name)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-[10px] transition-colors"
                        title="Verified Stays"
                      >
                        <FaHotel className="w-3 h-3 text-amber-500" />
                      </a>
                      {hasTrainNetwork(dest.name) && (
                        <a
                          href={getTrainsRoute(dest.name)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-[10px] transition-colors"
                          title="Tatkal Trains"
                        >
                          <FaTrain className="w-3 h-3 text-emerald-500" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setDetailModalDest(dest)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1 transition-all shadow-sm active:scale-95"
                      >
                        EXPLORE <FaArrowRight className="w-2 h-2" />
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ============================================================
          4. LUXURY DESTINATION DETAIL MODAL (Apple-Tier Experience Showcase)
          ============================================================ */}
      <AnimatePresence>
        {detailModalDest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setDetailModalDest(null)}
            />

            {/* Modal Window */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 25 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white/95 dark:bg-[#0e111a]/95 backdrop-blur-2xl p-5 md:p-7 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/90 dark:border-white/15 text-slate-900 dark:text-white"
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => setDetailModalDest(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-all z-10 shadow-sm"
                aria-label="Close modal"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>

              {/* Hero Image Banner */}
              <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-5 shadow-lg border border-slate-200/80 dark:border-white/10">
                <img src={detailModalDest.image} alt={detailModalDest.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase shadow-md">
                      {detailModalDest.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-mono font-bold flex items-center gap-1 border border-white/20">
                      <FaStar className="text-amber-400" /> {detailModalDest.rating} ({detailModalDest.reviews} reviews)
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{detailModalDest.name}</h2>
                </div>
              </div>

              {/* Telemetry Triad: Weather, Season, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">Weather Status</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                    <FaSun className="text-amber-500 text-xs" /> {detailModalDest.weather?.temp || '24°C'} ({detailModalDest.weather?.status || 'Pleasant'})
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">Best Season</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                    <FaCalendarAlt className="text-teal-500 text-xs" /> {detailModalDest.bestSeason || 'Year-Round'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">Price Estimate</span>
                  <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                    {detailModalDest.price} <span className="text-[9px] font-normal text-slate-500">/ person</span>
                  </p>
                </div>
              </div>

              {/* Description & Highlights */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">About This Experience</h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
                  {detailModalDest.description}
                </p>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider pt-2">Curated Highlights:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(detailModalDest.highlights || [
                    'Verified local guide tours',
                    'Scenic architectural landmarks',
                    'Exclusive stay privileges',
                    'Flexible concierge support'
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-2.5 rounded-xl">
                      <FaCheckCircle className="text-emerald-500 w-3 h-3 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dynamic Action Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-slate-200 dark:border-white/10">
                <ThreeUIButton 
                  variant="amber-glow"
                  size="md"
                  to={getItineraryRoute(detailModalDest.name)}
                  icon={<FaRoute className="w-3.5 h-3.5" />}
                  className="w-full text-center"
                >
                  Plan Route
                </ThreeUIButton>

                <ThreeUIButton 
                  variant="liquid-metal"
                  size="md"
                  to={getDestinationsRoute(detailModalDest.name)}
                  icon={<FaArrowRight className="w-3.5 h-3.5" />}
                  className="w-full text-center"
                >
                  Packages
                </ThreeUIButton>

                <ThreeUIButton 
                  variant="specular-dark"
                  size="md"
                  to={getHotelsRoute(detailModalDest.name)}
                  icon={<FaHotel className="w-3.5 h-3.5 text-amber-500" />}
                  className="w-full text-center"
                >
                  Verified Stays
                </ThreeUIButton>

                {hasTrainNetwork(detailModalDest.name) && (
                  <ThreeUIButton 
                    variant="specular-dark"
                    size="md"
                    to={getTrainsRoute(detailModalDest.name)}
                    icon={<FaTrain className="w-3.5 h-3.5 text-emerald-400" />}
                    className="w-full text-center"
                  >
                    Tatkal Trains
                  </ThreeUIButton>
                )}

                <ThreeUIButton 
                  variant="specular-dark"
                  size="md"
                  to={getFlightsRoute(detailModalDest.name)}
                  icon={<FaPlane className="w-3.5 h-3.5 text-sky-400" />}
                  className="w-full text-center"
                >
                  Live Flights
                </ThreeUIButton>

                <ThreeUIButton 
                  variant="specular-dark"
                  size="md"
                  onClick={(e) => handleGetDirections(detailModalDest, e)}
                  icon={<FaDirections className="w-3.5 h-3.5 text-amber-500" />}
                  className="w-full text-center"
                >
                  Directions
                </ThreeUIButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Explore;
