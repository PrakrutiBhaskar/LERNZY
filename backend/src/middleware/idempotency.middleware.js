const { getRedis } = require("../services/cache.service");
const logger = require("../utils/logger");

const idempotency = async (req, res, next) => {
  const key = req.headers["idempotency-key"] || req.headers["x-idempotency-key"];

  if (!key || typeof key !== "string" || !key.trim()) {
    return next();
  }

  const redisClient = getRedis();
  if (!redisClient || redisClient.status !== "ready") {
    return next();
  }

  const cacheKey = `idempotency:${key.trim()}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const { statusCode, body, contentType } = JSON.parse(cached);
      logger.info("idempotency_hit", { key });
      res.setHeader("X-Cache-Idempotency", "HIT");
      res.status(statusCode);
      if (contentType) res.setHeader("Content-Type", contentType);
      return res.send(body);
    }

    // Intercept res.send to cache it on success
    const originalSend = res.send;
    res.send = function (body) {
      res.send = originalSend; // restore original

      // Only cache 2xx responses to prevent caching transient errors
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const contentType = res.getHeader("content-type");
        const payload = JSON.stringify({
          statusCode: res.statusCode,
          body,
          contentType
        });

        redisClient.set(cacheKey, payload, "EX", 300).catch((err) => {
          logger.warn("idempotency_cache_save_failed", { message: err.message });
        });
      }

      return originalSend.apply(res, arguments);
    };

    return next();
  } catch (error) {
    logger.warn("idempotency_error", { message: error.message });
    return next();
  }
};

module.exports = idempotency;
