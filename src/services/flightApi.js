// Frontend Flight API Client
// All RapidAPI communication is securely proxied through the backend server (http://localhost:5000/api/flights)
// No API keys are exposed to the client

import axios from 'axios';
import { getApiBaseUrl } from './api.js';

const API_BASE = `${getApiBaseUrl()}/flights`;

const flightClient = axios.create({
  baseURL: API_BASE,
  timeout: 18000,
  headers: { 'Content-Type': 'application/json' }
});

// ─── Popular IATA Air Hubs for Autocomplete Reference ─────────────────────────
export const POPULAR_AIRPORTS = [
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport', country: 'India', flag: '🇮🇳' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International', country: 'India', flag: '🇮🇳' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', country: 'India', flag: '🇮🇳' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', country: 'India', flag: '🇮🇳' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Chandra Bose Intl', country: 'India', flag: '🇮🇳' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', country: 'India', flag: '🇮🇳' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE', flag: '🇦🇪' },
  { code: 'LHR', city: 'London', name: 'London Heathrow Airport', country: 'UK', flag: '🇬🇧' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'USA', flag: '🇺🇸' },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore', flag: '🇸🇬' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand', flag: '🇹🇭' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France', flag: '🇫🇷' },
  { code: 'HND', city: 'Tokyo', name: 'Tokyo Haneda Airport', country: 'Japan', flag: '🇯🇵' },
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport', country: 'Australia', flag: '🇦🇺' }
];

// ─── Special Fare Categories ──────────────────────────────────────────────────
export const SPECIAL_FARES = [
  { id: 'regular', label: 'Regular Fare', badge: 'Standard', desc: 'Standard adult fares & flexible options' },
  { id: 'student', label: 'Student Fare', badge: 'Extra 10kg Bag', desc: 'Special discount + Extra baggage for valid student ID' },
  { id: 'senior', label: 'Senior Citizen', badge: 'Up to 15% Off', desc: 'Exclusive concessions for travelers aged 60+' },
  { id: 'armed', label: 'Armed Forces', badge: '50% Base Off', desc: 'For serving & retired military personnel & dependents' },
  { id: 'doctor', label: 'Doctors & Nurses', badge: 'Special Care', desc: 'Appreciation discounts for healthcare heroes' }
];

// ─── Cabin Classes ───────────────────────────────────────────────────────────
export const CABIN_CLASSES = [
  { id: 'ECONOMY', name: 'Economy', desc: 'Standard seat pitch, meal & entertainment' },
  { id: 'PREMIUM_ECONOMY', name: 'Premium Economy', desc: 'Extra legroom & priority check-in' },
  { id: 'BUSINESS', name: 'Business Class', desc: 'Lie-flat bed, lounge access & gourmet dining' },
  { id: 'FIRST', name: 'First Class Suite', desc: 'Private enclosed suite & fine dining' }
];

// ─── In-Flight Meal Options ───────────────────────────────────────────────────
export const MEAL_OPTIONS = [
  { id: 'free_standard', name: 'Complimentary Airline Hot Meal', price: 0, tag: 'Included', desc: 'Seasonal entrée with bread roll, dessert & beverage' },
  { id: 'asian_veg', name: 'Asian Vegetarian Thali', price: 12, tag: 'Special', desc: 'Paneer dish, lentils, basmati rice & dessert' },
  { id: 'jain_meal', name: 'Strict Jain Vegetarian', price: 12, tag: 'Dietary', desc: 'Cooked without root vegetables, onion, or garlic' },
  { id: 'halal_gourmet', name: 'Halal Spiced Biryani', price: 15, tag: 'Special', desc: 'Slow-cooked spiced meat with saffron rice & accompaniments' },
  { id: 'continental', name: 'Continental Grilled Entrée', price: 18, tag: 'Premium', desc: 'Grilled chicken or fish with herb potatoes & vegetables' }
];

// ─── Baggage Options ──────────────────────────────────────────────────────────
export const BAGGAGE_OPTIONS = [
  { id: 'standard', name: 'Ticket Included Baggage', weight: 'Standard Allowance', price: 0 },
  { id: 'extra_5kg', name: 'Extra +5 kg Check-in Baggage', weight: '+5 kg', price: 28 },
  { id: 'extra_10kg', name: 'Extra +10 kg Check-in Baggage', weight: '+10 kg', price: 48 },
  { id: 'extra_20kg', name: 'Extra +20 kg Heavy Allowance', weight: '+20 kg', price: 85 }
];

// ─── 1. Search Live Flights via RapidAPI ──────────────────────────────────────
export const searchLiveFlights = async ({
  from = 'DEL',
  to = 'DXB',
  departDate,
  returnDate,
  adults = 1,
  cabinClass = 'ECONOMY',
  currency = 'USD'
}) => {
  try {
    const res = await flightClient.get('/search', {
      params: { from, to, departDate, returnDate, adults, cabinClass, currency }
    });
    return res.data;
  } catch (err) {
    console.warn('[flightApi] Live search unavailable (falling back to real-time engine):', err.response?.data?.message || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to connect to Flight API',
      data: []
    };
  }
};

// ─── 2. Search Live Airports / Autocomplete ───────────────────────────────────
export const searchAirportsList = async (query = '') => {
  try {
    if (!query || query.trim().length < 2) {
      return POPULAR_AIRPORTS;
    }
    const res = await flightClient.get('/airports', { params: { query } });
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('[flightApi] Airport search error:', err.message);
  }

  // Filter reference list if live search has network delay
  const q = query.toLowerCase().trim();
  return POPULAR_AIRPORTS.filter(a =>
    a.code.toLowerCase().includes(q) ||
    a.city.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.country.toLowerCase().includes(q)
  );
};

// ─── 3. Get Live Min Price / Calendar ─────────────────────────────────────────
export const getLiveMinPrice = async (from, to, departDate, currency = 'USD') => {
  try {
    const res = await flightClient.get('/min-price', {
      params: { from, to, departDate, currency }
    });
    return res.data;
  } catch (err) {
    console.warn('[flightApi] Min price error:', err.message);
    return { success: false, data: null };
  }
};

// ─── 4. Get Live Flight Details ───────────────────────────────────────────────
export const getLiveFlightDetails = async (token, currency = 'USD') => {
  try {
    const res = await flightClient.get('/details', {
      params: { token, currency }
    });
    return res.data;
  } catch (err) {
    console.warn('[flightApi] Flight details fallback:', err.message);
    return { success: false, data: null };
  }
};
