const rateLimit = require('express-rate-limit');

/**
 * API rate limiter middleware
 * Limits the number of requests from a single IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

/**
 * Login rate limiter middleware
 * Limits login attempts to prevent brute force attacks
 */
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts',
    message: 'Too many login attempts from this IP, please try again after an hour'
  }
});

/**
 * Registration rate limiter middleware
 * Limits registration attempts to prevent spam
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registration requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many registration attempts',
    message: 'Too many registration attempts from this IP, please try again after an hour'
  }
});

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter
};
