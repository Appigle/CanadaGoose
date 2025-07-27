const rateLimit = require('express-rate-limit');

// Rate limiting configuration for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 5, // much higher limit for tests
  message: {
    error: 'Too many login attempts, please try again later',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
  keyGenerator: (req, res) => {
    // Use IP address as the key
    return req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts, please try again later',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// General API rate limiting (less restrictive)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 100, // higher limit for tests
  message: {
    error: 'Too many API requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  apiLimiter,
};
