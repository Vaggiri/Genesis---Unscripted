import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Rate limiter for general API routes (120 req / 1 minute)
export const standardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' }
});

// Stricter rate limiter for sensitive/AI/chat endpoints (25 req / 1 minute)
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded on this endpoint. Please wait before retrying.' }
});

// CORS configuration supporting ALLOWED_ORIGINS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl, tests) or matching origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error(`CORS origin ${origin} not permitted.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role']
});

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Vite SPA handles script loading
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});
