const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    error: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Trust the first proxy (load balancer) for getting real client IP
  trustProxy: 1,
  // Use a custom key generator that's aware of proxy settings
  keyGenerator: (req) => {
    // Get the real IP address, considering proxy headers
    return req.ip || req.connection.remoteAddress;
  }
});

module.exports = apiLimiter;
