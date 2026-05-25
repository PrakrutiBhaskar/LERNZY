const crypto = require("crypto");
let redisClient = null;

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl || redisClient) {
    return redisClient;
  }

  try {
    const Redis = require("ioredis");
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      lazyConnect: true
    });
    
    redisClient.on("error", (error) => {
      require("../utils/logger").error("Redis client error", { message: error.message });
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    require("../utils/logger").warn("Failed to connect to Redis, continuing without cache", { message: error.message });
    redisClient = null;
    return null;
  }
};

const getRedis = () => redisClient;

const getRedisStatus = () => {
  if (!redisClient) {
    return "disabled";
  }

  return redisClient.status || "unknown";
};

const buildAskCacheKey = ({ question, language, level, outputType }) => {
  const payload = JSON.stringify({
    question: question.trim().toLowerCase(),
    language,
    level,
    outputType
  });

  return `ai_tutor:${crypto.createHash("sha256").update(payload).digest("hex")}`;
};

const cacheGetJSON = async (key) => {
  const client = getRedis();

  if (!client) {
    return null;
  }

  try {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
};

const cacheSetJSON = async (key, value, ttlSeconds) => {
  const client = getRedis();

  if (!client || !ttlSeconds) {
    return;
  }

  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    // ignore cache failures
  }
};

module.exports = {
  initRedis,
  getRedis,
  getRedisStatus,
  buildAskCacheKey,
  cacheGetJSON,
  cacheSetJSON
};
