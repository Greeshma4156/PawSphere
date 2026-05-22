import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import logger from '../utils/logger.js';

/**
 * Helmet security headers
 */
export const setupHelmet = () => helmet();

/**
 * CORS configuration – allow origin from env or all in dev
 */
export const setupCors = () => {
  const allowedOrigin = process.env.CORS_ORIGIN || '*';
  return cors({ origin: allowedOrigin, credentials: true });
};

/**
 * Rate limiting – 100 requests per 15 minutes per IP by default
 */
export const setupRateLimiter = () => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP ${req.ip}`);
      res.status(429).json({ success: false, error: 'Too many requests, please try again later.' });
    },
  });
  return limiter;
};

/**
 * MongoDB query sanitization – remove $ operators
 */
export const setupSanitizer = () => mongoSanitize();

/**
 * XSS protection – clean user input
 */
export const setupXss = () => xss();

/**
 * Apply all security middlewares to the Express app
 */
export const applySecurity = (app) => {
  app.use(setupHelmet());
  app.use(setupCors());
  app.use(setupRateLimiter());
  app.use(setupSanitizer());
  app.use(setupXss());
};
