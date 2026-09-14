import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import destinationRoutes from './routes/destinations.js';
import itineraryRoutes from './routes/itineraries.js';
import blogRoutes from './routes/blog.js';
import aiRoutes from './routes/ai.js';
import irctcRoutes from './routes/irctc.js';
import flightRoutes from './routes/flights.js';
import hotelRoutes from './routes/hotels.js';
import bookingRoutes from './routes/bookings.js';
import inquiryRoutes from './routes/inquiry.js';
import newsletterRoutes from './routes/newsletter.js';
import paymentRoutes from './routes/payments.js';
import pricingRoutes from './routes/pricing.js';
import sanitizeMiddleware from './utils/sanitize.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────────────────
// Helmet sets secure HTTP headers with complete Content Security Policy
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com", "https://*.tile.openstreetmap.org", "https://open.er-api.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://*.tile.openstreetmap.org", "https://cdn.razorpay.com", "https://assets.stickpng.com", "https://logos-world.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Rate limiting — protect against brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 auth attempts per IP per window
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Max 100 requests per IP per minute
  message: { success: false, message: 'Rate limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// ─── CORS Configuration ──────────────────────────────────────────────────────
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map(u => u.trim())
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'http://localhost:3000'
];

const allowedOrigins = [...new Set([...clientUrls, ...defaultDevOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser with size limit to prevent payload attacks
// Captures raw body buffer for authentic HMAC webhook verification
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api/payments/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeMiddleware);

// ─── Routes ───────────────────────────────────────────────────────────────────
// Auth routes with stricter rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Service routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/irctc', irctcRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pricing', pricingRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : (mongoose.connection.readyState === 2 ? 'connecting' : 'disconnected');
  res.json({
    status: 'OK',
    message: 'TravelEase API is running.',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(`[Server Error] ${req.method} ${req.path}:`, err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again.'
      : err.message || 'Internal Server Error'
  });
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// ─── MongoDB Connection with Smart Retry & IPv4 Fallback ────────────────────────
const rawMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelease';

const connectDB = async (retries = 3) => {
  let targetUri = rawMongoUri;

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(targetUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ Connected to MongoDB: ${mongoose.connection.host} (Database: ${mongoose.connection.name})`);
      return;
    } catch (err) {
      // Auto-fallback: If localhost failed due to Windows IPv6 ::1 resolution, switch to IPv4 127.0.0.1
      if (targetUri.includes('localhost')) {
        targetUri = targetUri.replace('localhost', '127.0.0.1');
      }

      if (i === retries - 1) {
        console.warn(`⚠️ MongoDB connection unavailable (${err.message}). Server running with in-memory & cached fallback data.`);
      } else {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 TravelEase Backend Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
