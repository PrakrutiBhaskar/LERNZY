const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.MAX_REQUESTS_PER_MINUTE || 120),
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
    data: null,
    error: { code: "RATE_LIMIT_AUTH" }
  }
});

const aiLimiter = rateLimit({
  windowMs: Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 60 * 1000),
  max: Number(process.env.AI_RATE_LIMIT_MAX || 15),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? `user:${req.user._id.toString()}` : `ip:${req.ip}`;
  },
  message: {
    success: false,
    message: "Too many AI tutoring requests. Please wait a moment before asking again.",
    data: null,
    error: { code: "RATE_LIMIT_AI" }
  }
});

module.exports = {
  globalLimiter,
  authLimiter,
  aiLimiter
};
