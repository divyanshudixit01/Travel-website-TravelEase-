import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { 
  FaArrowRight, FaMapMarkerAlt, FaStar, FaHeart, FaRegHeart, 
  FaSearch, FaChevronLeft, FaChevronRight, FaPlay, FaPause,
  FaCalendarAlt, FaSun, FaCheckCircle, FaCompass, FaShieldAlt,
  FaPlane, FaHotel, FaCoffee, FaTag, FaSlidersH, FaUndo
} from 'react-icons/fa';
import { HiOutlineSparkles, HiOutlineLightningBolt } from 'react-icons/hi';
import { FiActivity, FiCompass, FiShield, FiPercent } from 'react-icons/fi';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getItemListSchema } from '../utils/schemas';
import { ThreeUIButton } from '../components/ui/ThreeUIButton';
import { SegmentedPillToggle } from '../components/ui/ThreeUIToggle';
import { ThreeCard3D } from '../components/ui/ThreeCard3D';

// Kinetic Slideshow Destination Inventory
const heroSlides = [
  {
    id: 'hero-swiss-alps',
    title: "Swiss Alps, Zermatt",
    country: "Switzerland",
    tagline: "Iconic Matterhorn Sunrise & Crystal Glacial Valleys",
    vibe: "Alpine Luxury",
    weather: "14°C Crisp Alpine",
    season: "Peak: Dec–Apr & Jul–Sep",
    startingPrice: "₹84,500",
    image: "/images/destinations/hero_swiss_alps.jpg",
    destName: "Swiss Alps",
    itineraryPrompt: "Plan a luxury 7-day scenic rail and alpine wellness trip to Zermatt, Interlaken, and the Swiss Alps"
  },
  {
    id: 'hero-varanasi-ghats',
    title: "Varanasi Ganges Ghats",
    country: "India",
    tagline: "Spiritual Twilight Ganga Aarti & Ancient Sandstone Steppes",
    vibe: "Sacred Heritage",
    weather: "24°C Evening Breeze",
    season: "Peak: Oct–Mar",
    startingPrice: "₹9,800",
    image: "/images/destinations/hero_varanasi_ghats.jpg",
    destName: "Varanasi Ghats",
    itineraryPrompt: "Plan a 4-day spiritual and cultural photography tour of Varanasi ghats, sunrise boat rides, and Sarnath"
  },
  {
    id: 'hero-bali-sunsets',
    title: "Bali Uluwatu & Ubud",
    country: "Indonesia",
    tagline: "Dramatic Ocean Cliffside Sanctuary & Royal Bamboo Villas",
    vibe: "Tropical Luxe",
    weather: "28°C Golden Sunset",
    season: "Peak: Apr–Oct",
    startingPrice: "₹34,500",
    image: "/images/destinations/hero_bali_sunsets.jpg",
    destName: "Bali",
    itineraryPrompt: "Plan a 6-day honeymoon retreat to Bali featuring cliffside villas in Uluwatu and jungle retreats in Ubud"
  },
  {
    id: 'hero-kyoto-bamboo',
    title: "Kyoto Arashiyama Groves",
    country: "Japan",
    tagline: "Zen Bamboo Sanctuaries, Morning Mist & Historic Torii Shrines",
    vibe: "Zen Heritage",
    weather: "19°C Serene Mist",
    season: "Peak: Mar–May & Oct–Nov",
    startingPrice: "₹62,800",
    image: "/images/destinations/hero_kyoto_bamboo.jpg",
    destName: "Kyoto",
    itineraryPrompt: "Plan a 6-day cultural and culinary odyssey through Kyoto, Arashiyama, Gion geisha district, and Fushimi Inari"
  },
  {
    id: 'hero-amalfi-coast',
    title: "Amalfi Coast, Positano",
    country: "Italy",
    tagline: "Pastel Cliffside Cascades, Private Yachts & Tyrrhenian Azure",
    vibe: "Riviera Elegance",
    weather: "26°C Sunset Glow",
    season: "Peak: May–Sep",
    startingPrice: "₹78,900",
    image: "/images/destinations/hero_amalfi_coast.jpg",
    destName: "Amalfi Coast",
    itineraryPrompt: "Plan a 5-day coastal luxury holiday along the Amalfi Coast, Positano, Capri boat cruise, and Ravello villas"
  }
];

// 7 Wonders of the World 3D Bento Inventory
const sevenWonders = [
  { 
    id: 'w-1', 
    title: "Great Wall of China", 
    location: "Huairou, China", 
    unescoYear: "1987",
    image: "/images/destinations/wonders_great_wall.jpg", 
    cols: "md:col-span-2 md:row-span-2",
    tag: "Ancient Wonder",
    description: "Spanning over 21,000 km across mountainous ridges, a testament to human perseverance."
  },
  { 
    id: 'w-2', 
    title: "Taj Mahal", 
    location: "Agra, India", 
    unescoYear: "1983",
    image: "/images/destinations/wonders_taj_mahal.jpg", 
    cols: "md:col-span-1 md:row-span-1",
    tag: "Marble Poetry",
    description: "Ivory-white marble mausoleum on the south bank of the Yamuna river."
  },
  { 
    id: 'w-3', 
    title: "Colosseum", 
    location: "Rome, Italy", 
    unescoYear: "1980",
    image: "/images/destinations/wonders_colosseum.jpg", 
    cols: "md:col-span-1 md:row-span-1",
    tag: "Imperial Amphitheatre",
    description: "The largest ancient amphitheatre ever built, standing in the heart of Rome."
  },
  { 
    id: 'w-4', 
    title: "Machu Picchu", 
    location: "Cusco Region, Peru", 
    unescoYear: "1983",
    image: "/images/destinations/wonders_machu_picchu.jpg", 
    cols: "md:col-span-1 md:row-span-1",
    tag: "Citadel in Clouds",
    description: "Inca citadel situated on a mountain ridge 2,430 metres above sea level."
  },
  { 
    id: 'w-5', 
    title: "Petra", 
    location: "Ma'an Governorate, Jordan", 
    unescoYear: "1985",
    image: "/images/destinations/wonders_petra.jpg", 
    cols: "md:col-span-1 md:row-span-1",
    tag: "Rose City",
    description: "Famous rock-cut architecture carved directly into the red sandstone cliffs."
  },
  { 
    id: 'w-6', 
    title: "Christ the Redeemer", 
    location: "Rio de Janeiro, Brazil", 
    unescoYear: "2012",
    image: "/images/destinations/wonders_christ_redeemer.jpg", 
    cols: "md:col-span-1 md:row-span-1",
    tag: "Art Deco Icon",
    description: "Overlooking Rio from the summit of Mount Corcovado in the Tijuca Forest."
  },
  { 
    id: 'w-7', 
    title: "Chichen Itza", 
    location: "Yucatan, Mexico", 
    unescoYear: "1988",
    image: "/images/destinations/wonders_chichen_itza.jpg", 
    cols: "md:col-span-2 md:row-span-1",
    tag: "Mayan Pyramid",
    description: "Monumental Mayan pyramid complex El Castillo demonstrating astronomical alignment."
  },
];

// Comprehensive 24+ Curated Destination Inventory with High-Density MMT Metadata
const globalEscapes = [
  {
    id: 'intl-bali',
    title: "Bali & Nusa Penida",
    country: "Indonesia",
    region: "Southeast Asia",
    dealPrice: "₹34,500",
    originalPrice: "₹48,000",
    emiPrice: "₹3,150/mo",
    discountBadge: "Save 28%",
    duration: "6N / 7D",
    rating: "4.9",
    reviewsCount: "2.4k",
    tag: "Tropical Sanctuary",
    vibe: "beaches",
    inclusions: ["Flights Included", "5★ Private Pool Villa", "Breakfast Included", "Speedboat Transfers"],
    image: "/images/destinations/hero_bali_sunsets.jpg",
    tagsList: ["trending", "honeymoon", "visafree"],
    companionFit: ["couple", "solo", "group"],
    budgetCategory: "comfort"
  },
  {
    id: 'intl-paris',
    title: "Paris & French Riviera",
    country: "France",
    region: "Western Europe",
    dealPrice: "₹71,900",
    originalPrice: "₹92,000",
    emiPrice: "₹6,400/mo",
    discountBadge: "Save 22%",
    duration: "5N / 6D",
    rating: "4.8",
    reviewsCount: "3.1k",
    tag: "Haute Couture & Art",
    vibe: "heritage",
    inclusions: ["Flights Included", "Boutique Hotel", "Eiffel Summit Pass", "Seine Dinner Cruise"],
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["trending", "honeymoon"],
    companionFit: ["couple", "solo"],
    budgetCategory: "luxe"
  },
  {
    id: 'intl-tokyo',
    title: "Tokyo & Mt. Fuji",
    country: "Japan",
    region: "East Asia",
    dealPrice: "₹76,400",
    originalPrice: "₹98,000",
    emiPrice: "₹6,900/mo",
    discountBadge: "Save 22%",
    duration: "6N / 7D",
    rating: "4.9",
    reviewsCount: "1.9k",
    tag: "Futuristic Metropolis",
    vibe: "luxe",
    inclusions: ["Flights Included", "4★ Shinjuku Tower", "JR Bullet Pass", "Mt. Fuji Onsen Tour"],
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["trending", "solo"],
    companionFit: ["solo", "group", "family"],
    budgetCategory: "luxe"
  },
  {
    id: 'intl-dubai',
    title: "Dubai Skyline & Desert",
    country: "UAE",
    region: "Middle East",
    dealPrice: "₹28,900",
    originalPrice: "₹42,000",
    emiPrice: "₹2,650/mo",
    discountBadge: "Save 31%",
    duration: "4N / 5D",
    rating: "4.9",
    reviewsCount: "4.6k",
    tag: "Ultra-Luxury Oasis",
    vibe: "luxe",
    inclusions: ["Flights Included", "5★ Marina Hotel", "Red Dunes Safari", "Burj Khalifa 124th Pass"],
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["trending", "honeymoon", "visafree"],
    companionFit: ["family", "couple", "group"],
    budgetCategory: "comfort"
  },
  {
    id: 'intl-maldives',
    title: "Maldives Private Atolls",
    country: "Maldives",
    region: "Indian Ocean",
    dealPrice: "₹52,900",
    originalPrice: "₹75,000",
    emiPrice: "₹4,800/mo",
    discountBadge: "Save 29%",
    duration: "4N / 5D",
    rating: "4.95",
    reviewsCount: "2.8k",
    tag: "Overwater Seclusion",
    vibe: "beaches",
    inclusions: ["Overwater Lagoon Villa", "All Meals & Cocktails", "Speedboat Transfer", "Snorkeling Tour"],
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["trending", "honeymoon", "visafree"],
    companionFit: ["couple"],
    budgetCategory: "luxe"
  },
  {
    id: 'intl-singapore',
    title: "Singapore Marina & Gardens",
    country: "Singapore",
    region: "Southeast Asia",
    dealPrice: "₹42,500",
    originalPrice: "₹58,000",
    emiPrice: "₹3,850/mo",
    discountBadge: "Save 27%",
    duration: "4N / 5D",
    rating: "4.8",
    reviewsCount: "2.2k",
    tag: "Garden Metropolis",
    vibe: "luxe",
    inclusions: ["Flights Included", "4★ Downtown Hotel", "Universal Studios Pass", "Night Safari Entry"],
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["family"],
    companionFit: ["family", "group"],
    budgetCategory: "comfort"
  },
  {
    id: 'intl-swiss',
    title: "Swiss Alps & Zermatt",
    country: "Switzerland",
    region: "Central Europe",
    dealPrice: "₹84,500",
    originalPrice: "₹1,15,000",
    emiPrice: "₹7,600/mo",
    discountBadge: "Save 26%",
    duration: "6N / 7D",
    rating: "4.95",
    reviewsCount: "1.7k",
    tag: "Alpine Panoramic",
    vibe: "mountains",
    inclusions: ["Flights Included", "Swiss First Class Pass", "Alpine Chalet", "Jungfraujoch Summit"],
    image: "/images/destinations/hero_swiss_alps.jpg",
    tagsList: ["trending", "honeymoon"],
    companionFit: ["couple", "family"],
    budgetCategory: "luxe"
  },
  {
    id: 'intl-santorini',
    title: "Santorini Oia Caldera",
    country: "Greece",
    region: "Aegean Sea",
    dealPrice: "₹66,000",
    originalPrice: "₹89,000",
    emiPrice: "₹5,900/mo",
    discountBadge: "Save 26%",
    duration: "5N / 6D",
    rating: "4.9",
    reviewsCount: "2.5k",
    tag: "Caldera Cliff Villa",
    vibe: "beaches",
    inclusions: ["Traditional Cave Suite", "Sunset Catamaran Cruise", "Wine Tasting Tour", "Airport Transfers"],
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["trending", "honeymoon"],
    companionFit: ["couple"],
    budgetCategory: "luxe"
  },
  {
    id: 'intl-amalfi',
    title: "Amalfi Coast & Positano",
    country: "Italy",
    region: "Southern Europe",
    dealPrice: "₹78,900",
    originalPrice: "₹1,05,000",
    emiPrice: "₹7,100/mo",
    discountBadge: "Save 25%",
    duration: "5N / 6D",
    rating: "4.9",
    reviewsCount: "1.5k",
    tag: "Riviera Elegance",
    vibe: "luxe",
    inclusions: ["Sea View Boutique Stay", "Capri Private Speedboat", "Limoncello Tour", "Chauffeur Transfer"],
    image: "/images/destinations/hero_amalfi_coast.jpg",
    tagsList: ["trending", "honeymoon"],
    companionFit: ["couple", "solo"],
    budgetCategory: "luxe"
  },
  {
    id: 'intl-iceland',
    title: "Iceland Northern Lights",
    country: "Iceland",
    region: "Nordic Atlantic",
    dealPrice: "₹89,500",
    originalPrice: "₹1,20,000",
    emiPrice: "₹8,100/mo",
    discountBadge: "Save 25%",
    duration: "6N / 7D",
    rating: "4.85",
    reviewsCount: "1.3k",
    tag: "Aurora & Glaciers",
    vibe: "nature",
    inclusions: ["Flights Included", "Superjeep Aurora Hunt", "Blue Lagoon Premium", "Golden Circle Tour"],
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["trending", "solo"],
    companionFit: ["solo", "group"],
    budgetCategory: "luxe"
  },
  {
    id: 'intl-kyoto',
    title: "Kyoto Ancient Sanctuaries",
    country: "Japan",
    region: "Kansai",
    dealPrice: "₹62,800",
    originalPrice: "₹85,000",
    emiPrice: "₹5,650/mo",
    discountBadge: "Save 26%",
    duration: "5N / 6D",
    rating: "4.9",
    reviewsCount: "2.1k",
    tag: "Imperial Gardens",
    vibe: "heritage",
    inclusions: ["Traditional Ryokan Stay", "Kaiseki Dinner Included", "Private Tea Ceremony", "Shinkansen Transit"],
    image: "/images/destinations/hero_kyoto_bamboo.jpg",
    tagsList: ["solo", "honeymoon"],
    companionFit: ["solo", "couple"],
    budgetCategory: "comfort"
  },
  {
    id: 'intl-london',
    title: "London Royal Heritage",
    country: "United Kingdom",
    region: "Western Europe",
    dealPrice: "₹67,500",
    originalPrice: "₹88,000",
    emiPrice: "₹6,100/mo",
    discountBadge: "Save 23%",
    duration: "5N / 6D",
    rating: "4.8",
    reviewsCount: "3.4k",
    tag: "Historic Capital",
    vibe: "heritage",
    inclusions: ["Flights Included", "4★ Central London Hotel", "Thames Cruise Pass", "London Eye VIP Pass"],
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["family"],
    companionFit: ["family", "solo"],
    budgetCategory: "comfort"
  }
];

const incredibleIndia = [
  {
    id: 'dom-goa',
    title: "Goa Palolem & Baga",
    country: "India",
    region: "Konkan Coast",
    dealPrice: "₹12,900",
    originalPrice: "₹18,500",
    emiPrice: "₹1,150/mo",
    discountBadge: "Save 30%",
    duration: "4N / 5D",
    rating: "4.8",
    reviewsCount: "5.8k",
    tag: "Sun, Sand & Shacks",
    vibe: "beaches",
    inclusions: ["Flights Included", "4★ Beachside Resort", "Breakfast Included", "North & South Goa Cab"],
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["trending", "budget", "honeymoon"],
    companionFit: ["group", "couple", "solo"],
    budgetCategory: "budget"
  },
  {
    id: 'dom-kerala',
    title: "Kerala Backwaters & Munnar",
    country: "India",
    region: "South India",
    dealPrice: "₹15,800",
    originalPrice: "₹22,000",
    emiPrice: "₹1,400/mo",
    discountBadge: "Save 28%",
    duration: "5N / 6D",
    rating: "4.9",
    reviewsCount: "4.2k",
    tag: "God's Own Country",
    vibe: "nature",
    inclusions: ["Luxury AC Houseboat", "Munnar Tea Estate Stay", "All Meals on Board", "Spice Plantation Walk"],
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["trending", "budget", "honeymoon"],
    companionFit: ["couple", "family"],
    budgetCategory: "budget"
  },
  {
    id: 'dom-jaipur',
    title: "Jaipur Forts & Palaces",
    country: "India",
    region: "Rajasthan",
    dealPrice: "₹11,400",
    originalPrice: "₹16,500",
    emiPrice: "₹1,050/mo",
    discountBadge: "Save 31%",
    duration: "3N / 4D",
    rating: "4.8",
    reviewsCount: "3.7k",
    tag: "Royal Heritage",
    vibe: "heritage",
    inclusions: ["Heritage Haveli Stay", "Chokhi Dhani Dinner", "Amer Fort Guided Pass", "Private AC Chauffeur"],
    image: "https://images.unsplash.com/photo-1609949279531-cf48d64bed89?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["budget", "trending"],
    companionFit: ["family", "solo", "couple"],
    budgetCategory: "budget"
  },
  {
    id: 'dom-spiti',
    title: "Himachal Spiti Valley",
    country: "India",
    region: "Himachal Pradesh",
    dealPrice: "₹18,900",
    originalPrice: "₹26,000",
    emiPrice: "₹1,700/mo",
    discountBadge: "Save 27%",
    duration: "6N / 7D",
    rating: "4.9",
    reviewsCount: "1.6k",
    tag: "Middle Land Expedition",
    vibe: "mountains",
    inclusions: ["4x4 Mountain Vehicle", "Key Monastery Homestays", "All Meals", "Oxygen Support Kit"],
    image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["budget", "solo", "trending"],
    companionFit: ["solo", "group"],
    budgetCategory: "budget"
  },
  {
    id: 'dom-andaman',
    title: "Andaman Havelock Island",
    country: "India",
    region: "Bay of Bengal",
    dealPrice: "₹24,800",
    originalPrice: "₹36,000",
    emiPrice: "₹2,250/mo",
    discountBadge: "Save 31%",
    duration: "5N / 6D",
    rating: "4.9",
    reviewsCount: "2.9k",
    tag: "Turquoise Haven",
    vibe: "beaches",
    inclusions: ["Beachfront Resort", "Makruzz Catamaran Tickets", "Scuba Diving Discovery", "Harbour Transfers"],
    image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["trending", "honeymoon"],
    companionFit: ["couple", "family"],
    budgetCategory: "comfort"
  },
  {
    id: 'dom-kashmir',
    title: "Kashmir Gulmarg & Srinagar",
    country: "India",
    region: "Kashmir Valley",
    dealPrice: "₹19,900",
    originalPrice: "₹28,000",
    emiPrice: "₹1,800/mo",
    discountBadge: "Save 29%",
    duration: "5N / 6D",
    rating: "4.95",
    reviewsCount: "3.9k",
    tag: "Paradise on Earth",
    vibe: "mountains",
    inclusions: ["Dal Lake Luxury Houseboat", "Gulmarg Gondola Ride", "Pahalgam Valley Cab", "Maple Kahwa Welcome"],
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["budget", "trending", "honeymoon"],
    companionFit: ["couple", "family"],
    budgetCategory: "budget"
  },
  {
    id: 'dom-varanasi',
    title: "Varanasi Ganges Aarti",
    country: "India",
    region: "Uttar Pradesh",
    dealPrice: "₹9,800",
    originalPrice: "₹14,500",
    emiPrice: "₹890/mo",
    discountBadge: "Save 32%",
    duration: "3N / 4D",
    rating: "4.9",
    reviewsCount: "2.6k",
    tag: "Sacred Ghats & Aarti",
    vibe: "heritage",
    inclusions: ["Heritage Riverside Hotel", "Private Sunrise Boat Tour", "Evening Aarti VIP Deck", "Kashi Vishwanath Pass"],
    image: "/images/destinations/hero_varanasi_ghats.jpg",
    tagsList: ["budget", "solo"],
    companionFit: ["solo", "family"],
    budgetCategory: "budget"
  },
  {
    id: 'dom-ladakh',
    title: "Ladakh Pangong & Nubra",
    country: "India",
    region: "Himalayas",
    dealPrice: "₹23,500",
    originalPrice: "₹34,000",
    emiPrice: "₹2,100/mo",
    discountBadge: "Save 31%",
    duration: "6N / 7D",
    rating: "4.9",
    reviewsCount: "2.8k",
    tag: "High Altitude Desert",
    vibe: "mountains",
    inclusions: ["Luxury Lakeview Camp", "Double Hump Camel Safari", "Inner Line Protected Permits", "Dedicated SUV"],
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["trending", "solo"],
    companionFit: ["solo", "group"],
    budgetCategory: "comfort"
  },
  {
    id: 'dom-rishikesh',
    title: "Rishikesh Himalayan Ganga",
    country: "India",
    region: "Uttarakhand",
    dealPrice: "₹7,900",
    originalPrice: "₹12,500",
    emiPrice: "₹720/mo",
    discountBadge: "Save 37%",
    duration: "3N / 4D",
    rating: "4.8",
    reviewsCount: "3.3k",
    tag: "Yoga & White Water",
    vibe: "nature",
    inclusions: ["Luxury Riverside Glamping", "16km River Rafting Pass", "Bonfire & BBQ Dinner", "Morning Yoga Sessions"],
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["budget", "solo"],
    companionFit: ["solo", "group"],
    budgetCategory: "budget"
  },
  {
    id: 'dom-coorg',
    title: "Coorg Misty Coffee Hills",
    country: "India",
    region: "Western Ghats",
    dealPrice: "₹12,500",
    originalPrice: "₹18,000",
    emiPrice: "₹1,120/mo",
    discountBadge: "Save 31%",
    duration: "3N / 4D",
    rating: "4.8",
    reviewsCount: "1.9k",
    tag: "Scotland of India",
    vibe: "nature",
    inclusions: ["Private Estate Bungalow", "Guided Coffee Cupping Tour", "Abbey Falls Sightseeing", "Coorg Special Cuisine"],
    image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["budget", "honeymoon"],
    companionFit: ["couple", "family"],
    budgetCategory: "budget"
  },
  {
    id: 'dom-ooty',
    title: "Ooty & Nilgiri Toy Train",
    country: "India",
    region: "Tamil Nadu",
    dealPrice: "₹11,900",
    originalPrice: "₹17,000",
    emiPrice: "₹1,080/mo",
    discountBadge: "Save 30%",
    duration: "3N / 4D",
    rating: "4.75",
    reviewsCount: "2.1k",
    tag: "Blue Mountain Haven",
    vibe: "mountains",
    inclusions: ["Heritage Colonial Suite", "Nilgiri Mountain Rail Tickets", "Tea Factory Experience", "Lake Boating Pass"],
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["budget"],
    companionFit: ["family", "couple"],
    budgetCategory: "budget"
  },
  {
    id: 'dom-udaipur',
    title: "Udaipur Royal City of Lakes",
    country: "India",
    region: "Rajasthan",
    dealPrice: "₹16,800",
    originalPrice: "₹24,000",
    emiPrice: "₹1,500/mo",
    discountBadge: "Save 30%",
    duration: "3N / 4D",
    rating: "4.9",
    reviewsCount: "3.5k",
    tag: "Venice of the East",
    vibe: "luxe",
    inclusions: ["Pichola Lakeview Heritage", "Sunset Solar Boat Cruise", "City Palace Royal Entry", "Candlelight Rooftop Dinner"],
    image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=1200&auto=format&fit=crop",
    tagsList: ["budget", "honeymoon", "trending"],
    companionFit: ["couple"],
    budgetCategory: "budget"
  }
];

const vibeOptions = [
  { id: 'all', label: 'All Vibes', icon: '✨' },
  { id: 'beaches', label: 'Beaches & Islands', icon: '🏖️' },
  { id: 'mountains', label: 'Mountains & Treks', icon: '🏔️' },
  { id: 'heritage', label: 'Heritage & Culture', icon: '🏛️' },
  { id: 'luxe', label: 'Ultra-Luxury', icon: '✨' },
  { id: 'nature', label: 'Wildlife & Nature', icon: '🌿' }
];

const fastFilterChips = [
  { id: 'all', label: 'All Curations' },
  { id: 'trending', label: 'Trending Now 🔥' },
  { id: 'budget', label: 'Budget Under ₹20k 💰' },
  { id: 'honeymoon', label: 'Honeymoon 💍' },
  { id: 'solo', label: 'Solo Backpacker 🎒' },
  { id: 'visafree', label: 'Visa-Free for Indians 🛂' }
];

export const Destinations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  // State Management
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'india'
  const [activeVibe, setActiveVibe] = useState('all');
  const [activeFastFilter, setActiveFastFilter] = useState('all');
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [favorites, setFavorites] = useState({});
  const [showAllWonders, setShowAllWonders] = useState(false);
  const [liveBackendDests, setLiveBackendDests] = useState([]);

  // Hero Slideshow Controls
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Recommender Quiz State
  const [quizBudget, setQuizBudget] = useState('budget'); // 'budget' | 'comfort' | 'luxe'
  const [quizCompanion, setQuizCompanion] = useState('couple'); // 'solo' | 'couple' | 'family' | 'group'

  // Fetch optional live backend destinations
  useEffect(() => {
    let cancelled = false;
    const fetchDestinations = async () => {
      try {
        const res = await api.get('/destinations');
        if (!cancelled && Array.isArray(res.data) && res.data.length > 0) {
          setLiveBackendDests(res.data);
        }
      } catch (err) {
        // Fallback to high-density static curated data seamlessly
      }
    };
    fetchDestinations();
    return () => { cancelled = true; };
  }, []);

  // Sync search input with URL params
  useEffect(() => {
    if (urlQuery && urlQuery !== searchInput) {
      setSearchInput(urlQuery);
    }
  }, [urlQuery, searchInput]);

  // Slideshow Automated Ken Burns Interval
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered Cards Inventory Computation
  const currentCatalog = useMemo(() => {
    let list = activeTab === 'global' ? globalEscapes : incredibleIndia;

    // Gracefully merge backend items if available
    if (liveBackendDests.length > 0) {
      const mergedBackend = liveBackendDests
        .filter(d => {
          const loc = (d.location || '').toLowerCase();
          const name = (d.name || d.title || '').toLowerCase();
          const isIndia = loc.includes('india') || name.includes('india') || ['goa', 'kerala', 'jaipur', 'himachal', 'andaman', 'kashmir', 'varanasi', 'ladakh', 'rishikesh', 'coorg', 'ooty', 'udaipur', 'agra'].some(s => loc.includes(s) || name.includes(s));
          return activeTab === 'india' ? isIndia : !isIndia;
        })
        .map(d => ({
          id: `live-${d._id || d.slug}`,
          title: d.name || d.title,
          country: d.location || (activeTab === 'india' ? 'India' : 'International'),
          region: d.location || 'Curated Escape',
          dealPrice: d.price ? (d.price.startsWith('₹') ? d.price : `₹${d.price}`) : (activeTab === 'india' ? '₹14,500' : '₹42,000'),
          originalPrice: activeTab === 'india' ? '₹19,900' : '₹58,000',
          emiPrice: activeTab === 'india' ? '₹1,200/mo' : '₹3,700/mo',
          discountBadge: 'Save 25%',
          duration: '5N / 6D',
          rating: String(d.rating || '4.85'),
          reviewsCount: '1.2k',
          tag: d.category || 'Live Certified Package',
          vibe: d.category === 'beach' ? 'beaches' : d.category === 'mountain' ? 'mountains' : d.category === 'heritage' ? 'heritage' : d.category === 'luxe' ? 'luxe' : 'nature',
          inclusions: ["Verified Stays", "Curated Sightseeing", "Airport / Station Transit", "24/7 Concierge"],
          image: d.image || (activeTab === 'india' ? '/images/destinations/hero_varanasi_ghats.jpg' : '/images/destinations/hero_bali_sunsets.jpg'),
          tagsList: ["trending", "budget"],
          companionFit: ["couple", "solo", "family"],
          budgetCategory: "comfort"
        }));

      // Merge avoiding duplicates by title
      const existingTitles = new Set(list.map(item => item.title.toLowerCase()));
      const uniqueBackend = mergedBackend.filter(item => !existingTitles.has(item.title.toLowerCase()));
      list = [...list, ...uniqueBackend];
    }

    // Filter by Vibe
    if (activeVibe !== 'all') {
      list = list.filter(item => item.vibe === activeVibe);
    }

    // Filter by Fast Filter Chip
    if (activeFastFilter !== 'all') {
      if (activeFastFilter === 'trending') {
        list = list.filter(item => item.tagsList.includes('trending'));
      } else if (activeFastFilter === 'budget') {
        list = list.filter(item => {
          const numPrice = parseInt(item.dealPrice.replace(/[^0-9]/g, ''), 10);
          return numPrice <= 20000;
        });
      } else if (activeFastFilter === 'honeymoon') {
        list = list.filter(item => item.tagsList.includes('honeymoon'));
      } else if (activeFastFilter === 'solo') {
        list = list.filter(item => item.tagsList.includes('solo'));
      } else if (activeFastFilter === 'visafree') {
        list = list.filter(item => item.tagsList.includes('visafree') || item.country === 'India');
      }
    }

    // Filter by Search Query
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.country.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.inclusions.some(inc => inc.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeTab, activeVibe, activeFastFilter, searchInput, liveBackendDests]);

  // Dynamic Recommendation Result based on Quiz Preferences
  const quizRecommendation = useMemo(() => {
    const all = [...globalEscapes, ...incredibleIndia];
    const match = all.find(item => 
      item.budgetCategory === quizBudget && 
      item.companionFit.includes(quizCompanion)
    ) || all[0];
    return match;
  }, [quizBudget, quizCompanion]);

  // Current Active Slide
  const currentSlide = heroSlides[currentSlideIndex];

  // SEO Schemas
  const destinationsSchemas = [
    getWebPageSchema({
      type: 'CollectionPage',
      name: 'Explore Handpicked Travel Destinations & Packages — TravelEase',
      description: 'Discover curated international and Indian travel destinations with verified packages, real-time rates, and instant booking synchronization.',
      url: '/destinations',
      breadcrumb: true,
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Destinations' },
    ], '/destinations'),
    getItemListSchema({
      name: 'Curated Global & Incredible India Travel Packages',
      description: 'Discover luxury and budget-friendly verified vacation packages on TravelEase',
      url: '/destinations',
      items: [
        ...globalEscapes.map(d => ({ name: d.title, url: '/destinations', image: d.image })),
        ...incredibleIndia.map(d => ({ name: d.title, url: '/destinations', image: d.image })),
      ],
    }),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080d] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-400" id="destinations-discovery-engine">
      <JsonLd data={destinationsSchemas} />

      {/* Top Ambient Specular Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.09)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 relative z-10 space-y-16 lg:space-y-24">
        
        {/* ==================================================================== */}
        {/* SECTION 1: HERO SECTION — KINETIC TRAVEL SLIDESHOW & TELEMETRY HUD  */}
        {/* ==================================================================== */}
        <div className="relative w-full h-[70vh] min-h-[580px] max-h-[750px] rounded-[2.5rem] lg:rounded-[3.2rem] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)] border border-slate-200/90 dark:border-white/10 group">
          
          {/* Ken Burns Crossfade Image Layer */}
          <div className="absolute inset-0 bg-slate-950 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide.id}
                src={currentSlide.image}
                alt={currentSlide.title}
                initial={{ opacity: 0, scale: 1.0 }}
                animate={{ opacity: 1, scale: 1.06 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.8, ease: "easeInOut" },
                  scale: { duration: 6.5, ease: "easeOut" }
                }}
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                loading="eager"
              />
            </AnimatePresence>

            {/* Specular Vignette & Editorial Multi-Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          </div>

          {/* Overlaid Top Status Bar */}
          <div className="absolute top-6 left-6 right-6 lg:top-8 lg:left-10 lg:right-10 flex flex-wrap items-center justify-between gap-3 z-20 pointer-events-auto">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-xs font-mono text-white shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="font-bold tracking-wider uppercase text-[11px] text-amber-300">CURATED DISCOVERY</span>
              <span className="text-white/40">·</span>
              <span className="text-white/80 hidden sm:inline font-mono">120+ VERIFIED PACKAGES</span>
            </div>

            {/* Weather & Live Telemetry Pill */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-xs font-mono text-white shadow-lg">
              <div className="flex items-center gap-1.5 text-amber-300">
                <FaSun className="w-3.5 h-3.5 animate-[spin_12s_linear_infinite]" />
                <span className="font-bold">{currentSlide.weather}</span>
              </div>
              <span className="text-white/40">·</span>
              <span className="text-white/80 text-[11px] hidden md:inline">{currentSlide.season}</span>
            </div>
          </div>

          {/* Overlaid Bottom Telemetry HUD Content */}
          <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 lg:p-14 flex flex-col lg:flex-row items-end justify-between gap-8 z-20">
            
            {/* Destination Title & Details */}
            <div className="w-full lg:max-w-2xl text-left space-y-3">
              <motion.div 
                key={`badge-${currentSlide.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md"
              >
                <HiOutlineSparkles className="w-3.5 h-3.5" />
                <span>{currentSlide.vibe}</span>
                <span className="text-amber-400/50">|</span>
                <span>Starting {currentSlide.startingPrice}</span>
              </motion.div>

              <motion.h1 
                key={`title-${currentSlide.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05]"
              >
                {currentSlide.title}
              </motion.h1>

              <motion.p
                key={`tagline-${currentSlide.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-sm sm:text-base lg:text-lg text-white/85 font-medium max-w-xl leading-relaxed"
              >
                {currentSlide.tagline}
              </motion.p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <ThreeUIButton
                  onClick={() => navigate('/itinerary', { state: { prompt: currentSlide.itineraryPrompt } })}
                  variant="amber-glow"
                  size="md"
                  icon={FaArrowRight}
                  iconPosition="right"
                  id="hero-plan-trip-btn"
                >
                  Plan This Trip
                </ThreeUIButton>

                <ThreeUIButton
                  onClick={() => navigate('/flights', { state: { destination: currentSlide.destName } })}
                  variant="glass-frost"
                  size="md"
                  icon={FaPlane}
                  id="hero-flights-btn"
                >
                  Flight Deals
                </ThreeUIButton>
              </div>
            </div>

            {/* Slideshow Progress Bar, Nav Controls & Thumbnails */}
            <div className="w-full lg:w-auto flex flex-col items-start lg:items-end gap-3 bg-black/40 backdrop-blur-xl p-3.5 sm:p-4 rounded-3xl border border-white/15 shadow-2xl">
              
              <div className="flex items-center justify-between w-full gap-4">
                <div className="text-[11px] font-mono text-white/70">
                  <span className="text-amber-400 font-bold">0{currentSlideIndex + 1}</span> / 0{heroSlides.length}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevSlide}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95"
                    aria-label="Previous destination"
                  >
                    <FaChevronLeft className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-bold transition-all active:scale-95 shadow-lg shadow-amber-400/20"
                    aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                  >
                    {isPlaying ? <FaPause className="w-2.5 h-2.5" /> : <FaPlay className="w-2.5 h-2.5 translate-x-[1px]" />}
                  </button>

                  <button
                    onClick={handleNextSlide}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95"
                    aria-label="Next destination"
                  >
                    <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Progress Thumbnail Strip */}
              <div className="flex items-center gap-2 pt-1 w-full justify-between">
                {heroSlides.map((slide, idx) => {
                  const isActive = idx === currentSlideIndex;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`relative h-1.5 sm:h-2 rounded-full transition-all duration-300 overflow-hidden ${
                        isActive ? 'w-14 sm:w-16 bg-white/30' : 'w-6 sm:w-8 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Jump to slide ${slide.title}`}
                    >
                      {isActive && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: isPlaying ? 5 : 0, ease: 'linear' }}
                          className="absolute inset-0 bg-amber-400 rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>


        {/* ==================================================================== */}
        {/* INTERACTIVE DISCOVERY COMMAND BAR & REAL-TIME STATS STRIP             */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-[#141622]/85 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.7)]">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              
              {/* Live Search Input */}
              <div className="relative w-full lg:w-96 flex items-center">
                <FaSearch className="absolute left-4 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search destinations, tags, regions (e.g. Bali, Spiti, Villa)..."
                  className="w-full pl-11 pr-10 py-2.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-colors"
                  id="destinations-search-input"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput('')}
                    className="absolute right-3.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Fast Filter Chips */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
                {fastFilterChips.map((chip) => {
                  const isSelected = activeFastFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setActiveFastFilter(chip.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all select-none ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/8'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Quick Telemetry Stats Strip */}
            <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <FiShield className="w-3.5 h-3.5 text-amber-500" />
                <span>120+ Verified Packages</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">IRCTC & IATA DIRECT SYNCED</span>
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-800 dark:text-slate-200 font-bold">4.9/5 TrustScore</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span>Best Rate Guarantee</span>
              </div>
            </div>
          </div>
        </div>


        {/* ==================================================================== */}
        {/* SECTION 2: DUAL-ENGINE NAVIGATION & TRAVEL VIBES                     */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            
            {/* Flagship Segmented Pill Toggle */}
            <SegmentedPillToggle
              options={[
                { id: 'global', label: 'Global Escapes ✈️' },
                { id: 'india', label: 'Incredible India 🇮🇳' }
              ]}
              value={activeTab}
              onChange={(tab) => {
                setActiveTab(tab);
                setActiveVibe('all');
              }}
              layoutId="destinationsCategoryToggle"
              size="lg"
            />

            {/* Secondary Filter Pill Row: Travel Vibes */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 scrollbar-none justify-start sm:justify-center">
              {vibeOptions.map((vibe) => {
                const isSelected = activeVibe === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    onClick={() => setActiveVibe(vibe.id)}
                    className={`px-4 py-2 rounded-full text-xs font-mono font-medium tracking-wide transition-all border select-none flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold border-transparent shadow-lg'
                        : 'bg-white/80 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span>{vibe.icon}</span>
                    <span>{vibe.label}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Results Counter Banner */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 px-2">
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-bold">{currentCatalog.length}</strong> matching packages
            </span>
            {(activeVibe !== 'all' || activeFastFilter !== 'all' || searchInput) && (
              <button
                onClick={() => {
                  setActiveVibe('all');
                  setActiveFastFilter('all');
                  setSearchInput('');
                }}
                className="inline-flex items-center gap-1.5 text-amber-500 hover:text-amber-400 font-bold"
              >
                <FaUndo className="w-2.5 h-2.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>


        {/* ==================================================================== */}
        {/* SECTION 3: COMPREHENSIVE CARD INVENTORY — HIGH-DENSITY MMT TILES      */}
        {/* ==================================================================== */}
        {currentCatalog.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white/50 dark:bg-white/[0.02] border border-dashed border-slate-300 dark:border-white/10">
            <FiCompass className="w-12 h-12 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">No destinations found</h3>
            <p className="text-sm text-slate-500 font-mono mb-6">Try refining your search terms or clearing active filters.</p>
            <ThreeUIButton
              onClick={() => {
                setActiveVibe('all');
                setActiveFastFilter('all');
                setSearchInput('');
              }}
              variant="specular-dark"
              size="sm"
            >
              Reset All Filters
            </ThreeUIButton>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-9"
          >
            <AnimatePresence mode="popLayout">
              {currentCatalog.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative rounded-[2rem] overflow-hidden bg-white/90 dark:bg-[#121420]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_45px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] hover:border-amber-400/50 dark:hover:border-amber-400/40 transition-all duration-300 flex flex-col cursor-pointer"
                  onClick={() => navigate('/flights', { state: { destination: dest.title } })}
                >
                  
                  {/* Aspect Ratio Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img 
                      src={dest.image} 
                      alt={dest.title} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      loading="lazy"
                    />

                    {/* Gradient Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40 pointer-events-none" />

                    {/* Top Floating Strip: Region + Rating + Wishlist Heart */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white font-bold shadow-md">
                          {dest.region}
                        </span>
                        <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 shadow-md">
                          <FaStar className="w-3 h-3 text-amber-400" />
                          <span>{dest.rating}</span>
                          <span className="text-white/40 text-[10px]">({dest.reviewsCount})</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(dest.id); }}
                        className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg"
                        aria-label="Toggle wishlist"
                      >
                        {favorites[dest.id] ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <FaHeart className="w-4 h-4 text-rose-500" />
                          </motion.div>
                        ) : (
                          <FaRegHeart className="w-4 h-4 text-white hover:text-rose-400" />
                        )}
                      </button>
                    </div>

                    {/* Bottom-Left Overlaid Duration Badge */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-2 z-10">
                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-mono font-bold tracking-wider shadow-md">
                        {dest.duration}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-medium">
                        {dest.tag}
                      </span>
                    </div>

                  </div>

                  {/* High-Density Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    
                    {/* Header Info */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {dest.title}
                        </h3>
                        <span className="text-xs font-mono font-bold text-slate-400 shrink-0 mt-1">
                          {dest.country}
                        </span>
                      </div>

                      {/* Inclusions Chips Strip */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {dest.inclusions.map((inc, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                          >
                            <FaCheckCircle className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400" />
                            {inc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Architecture (MMT-Style) & Action CTA */}
                    <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-end justify-between gap-4">
                      
                      {/* Price Strip */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 line-through font-mono">
                            {dest.originalPrice}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {dest.discountBadge}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {dest.dealPrice}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">/ person</span>
                        </div>
                        <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                          or {dest.emiPrice} No-Cost EMI
                        </div>
                      </div>

                      {/* Primary ThreeUI Button */}
                      <ThreeUIButton
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/flights', { state: { destination: dest.title } });
                        }}
                        variant="amber-glow"
                        size="sm"
                        icon={FaArrowRight}
                        iconPosition="right"
                        className="shrink-0"
                      >
                        Book
                      </ThreeUIButton>

                    </div>

                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}


        {/* ==================================================================== */}
        {/* SECTION 4: 7 WONDERS OF THE WORLD 3D BENTO SHOWCASE                  */}
        {/* ==================================================================== */}
        <div className="pt-8 space-y-8" id="wonders-showcase-section">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
                <HiOutlineSparkles className="w-3.5 h-3.5" />
                <span>UNESCO GLOBAL MASTERPIECES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                The 7 Wonders of the World.
              </h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl mt-1">
                Monuments that defy imagination, captured with perspective 3D specular tilt physics.
              </p>
            </div>

            <ThreeUIButton
              onClick={() => setShowAllWonders(!showAllWonders)}
              variant="specular-dark"
              size="sm"
              icon={FaArrowRight}
              iconPosition="right"
            >
              {showAllWonders ? 'Collapse Grid' : 'View All 7 Wonders'}
            </ThreeUIButton>
          </div>

          {/* 3D Bento Showcase Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px] md:auto-rows-[340px]">
            <AnimatePresence>
              {sevenWonders.slice(0, showAllWonders ? 7 : 4).map((wonder) => (
                <div
                  key={wonder.id}
                  className={`${wonder.cols} h-full`}
                >
                  <ThreeCard3D
                    maxTilt={8}
                    glare={true}
                    spotlightColor="rgba(245, 158, 11, 0.16)"
                    className="h-full cursor-pointer group"
                    onClick={() => navigate('/itinerary', { state: { prompt: `Plan a luxury architectural journey to the ${wonder.title} in ${wonder.location}` } })}
                  >
                    {/* Background Image Layer */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950">
                      <img
                        src={wonder.image}
                        alt={wonder.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
                    </div>

                    {/* Wonder Card Metadata */}
                    <div className="relative z-10 h-full p-6 sm:p-8 flex flex-col justify-between">
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono font-bold">
                          UNESCO {wonder.unescoYear}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-mono font-bold tracking-wider">
                          {wonder.tag}
                        </span>
                      </div>

                      {/* Bottom Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase">
                          <FaMapMarkerAlt className="w-3 h-3" />
                          <span>{wonder.location}</span>
                        </div>

                        <h4 className="text-2xl sm:text-3xl font-black text-white leading-tight group-hover:text-amber-300 transition-colors">
                          {wonder.title}
                        </h4>

                        <p className="text-xs sm:text-sm text-white/80 font-medium line-clamp-2">
                          {wonder.description}
                        </p>

                        <div className="pt-2 flex items-center gap-2 text-xs font-mono font-bold text-amber-400 group-hover:translate-x-1.5 transition-transform">
                          <span>Generate Custom Itinerary</span>
                          <FaArrowRight className="w-3 h-3" />
                        </div>
                      </div>

                    </div>
                  </ThreeCard3D>
                </div>
              ))}
            </AnimatePresence>
          </motion.div>

        </div>


        {/* ==================================================================== */}
        {/* SECTION 5: "TRAVELER PREFERENCES" 2-CLICK QUIZ RECOMMENDER           */}
        {/* ==================================================================== */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white/90 dark:bg-[#121422]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 p-8 sm:p-12 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
          
          {/* Specular Backglows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: 2-Click Questionnaire */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-500 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
                  <HiOutlineLightningBolt className="w-3.5 h-3.5" />
                  <span>AI TRIP RECOMMENDER</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  Not sure where to venture?
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Answer 2 quick preferences and let our neural engine reveal your ideal getaway.
                </p>
              </div>

              {/* Step 1: Budget Selection */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Select Your Budget Tier
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'budget', label: 'Budget < ₹25k', desc: 'Backpacker & Value' },
                    { id: 'comfort', label: 'Comfort ₹25k–₹60k', desc: '4★ Flights & Stays' },
                    { id: 'luxe', label: 'Ultra-Luxe ₹60k+', desc: '5★ Private Villas' }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setQuizBudget(tier.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        quizBudget === tier.id
                          ? 'bg-amber-400/15 border-amber-400 text-slate-950 dark:text-white shadow-md'
                          : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold">{tier.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Companion Selection */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Who Are You Traveling With?
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'solo', label: 'Solo Explorer', emoji: '🎒' },
                    { id: 'couple', label: 'Couple / Romantic', emoji: '💍' },
                    { id: 'family', label: 'Family Vacation', emoji: '👨‍👩‍👧' },
                    { id: 'group', label: 'Adventure Group', emoji: '🏔️' }
                  ].map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => setQuizCompanion(comp.id)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        quizCompanion === comp.id
                          ? 'bg-amber-400/15 border-amber-400 text-slate-950 dark:text-white shadow-md'
                          : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="text-lg mb-1">{comp.emoji}</div>
                      <div className="text-[11px] font-mono font-bold">{comp.label}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Dynamic Matched Destination Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl p-6 text-white space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <HiOutlineSparkles className="w-4 h-4" /> 98% MATCH FOR YOU
                  </span>
                  <span className="text-white/60">{quizRecommendation.duration}</span>
                </div>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                  <img
                    src={quizRecommendation.image}
                    alt={quizRecommendation.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-amber-300 font-bold uppercase">{quizRecommendation.country}</div>
                      <h4 className="text-xl font-black text-white">{quizRecommendation.title}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/60 line-through font-mono">{quizRecommendation.originalPrice}</div>
                      <div className="text-lg font-black text-amber-400">{quizRecommendation.dealPrice}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {quizRecommendation.inclusions.slice(0, 3).map((inc, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/10">
                      ✓ {inc}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <ThreeUIButton
                    onClick={() => navigate('/itinerary', { state: { prompt: `Plan a ${quizRecommendation.duration} trip to ${quizRecommendation.title} in ${quizRecommendation.country} with focus on ${quizRecommendation.tag}` } })}
                    variant="amber-glow"
                    size="md"
                    icon={FaArrowRight}
                    iconPosition="right"
                    className="w-full"
                  >
                    Build Custom Itinerary
                  </ThreeUIButton>
                </div>
              </div>
            </div>

          </div>
        </div>


        {/* ==================================================================== */}
        {/* SECTION 6: DESIGN HARMONY & SEAMLESS FOOTER BLEND                     */}
        {/* ==================================================================== */}
        <div className="relative pt-6 pb-2 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Ready to embark on your journey?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Over 40,000 travelers have redefined their horizon with TravelEase's neural-assisted vacation engine.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <ThreeUIButton
                to="/itinerary"
                variant="liquid-metal"
                size="md"
                icon={FaCompass}
              >
                Launch AI Trip Architect
              </ThreeUIButton>
            </div>
          </div>
        </div>

      </div>

      {/* Seamless Radial Ambient Bottom Gradient fading into Footer */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-100/90 dark:from-[#06080d] via-slate-100/40 dark:via-[#06080d]/80 to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default Destinations;