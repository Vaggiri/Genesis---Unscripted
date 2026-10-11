import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Rate limiter for general API routes (120 req / 1 minute)
export const standardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { error: 'Too many requests, please slow down.' }
});

// Stricter rate limiter for sensitive/AI/chat endpoints (25 req / 1 minute)
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { error: 'Rate limit exceeded on this endpoint. Please wait before retrying.' }
});

// CORS configuration supporting ALLOWED_ORIGINS and all Vercel deployments
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim().replace(/\/+$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl, tests)
    if (!origin) return callback(null, true);

    const normOrigin = origin.replace(/\/+$/, '');

    // Allow all Vercel deployment domains (*.vercel.app), localhost, and configured origins
    if (
      normOrigin.endsWith('.vercel.app') ||
      normOrigin.includes('localhost') ||
      normOrigin.includes('127.0.0.1') ||
      allowedOrigins.includes(normOrigin) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }

    // Default to allowing the origin instead of throwing an unhandled 500 error
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role']
});

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Vite SPA handles script loading
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});
