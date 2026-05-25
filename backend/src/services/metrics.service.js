const mongoose = require("mongoose");
const { getRedis } = require("./cache.service");

const state = {
  replay: {
    throughput: 0,
    duplicate: 0,
    discard: 0,
    fail: 0,
    retry: 0
  },
  ai: {
    requests: 0,
    timeout: 0,
    provider_error: 0,
    rate_limit: 0,
    moderation_failure: 0,
    fallback_used: 0
  }
};

const incrementReplayMetric = (type) => {
  if (state.replay[type] !== undefined) {
    state.replay[type]++;
  }
};

const incrementAIMetric = (type) => {
  if (state.ai[type] !== undefined) {
    state.ai[type]++;
  }
};

const getMetrics = async () => {
  const totalReplays = state.replay.throughput + state.replay.duplicate + state.replay.discard + state.replay.fail;
  const replayRates = {
    throughputRate: totalReplays > 0 ? (state.replay.throughput / totalReplays) * 100 : 0,
    duplicateRate: totalReplays > 0 ? (state.replay.duplicate / totalReplays) * 100 : 0,
    discardRate: totalReplays > 0 ? (state.replay.discard / totalReplays) * 100 : 0,
    failRate: totalReplays > 0 ? (state.replay.fail / totalReplays) * 100 : 0,
    retryRate: totalReplays > 0 ? (state.replay.retry / totalReplays) * 100 : 0
  };

  const totalAI = state.ai.requests;
  const aiRates = {
    requests: state.ai.requests,
    timeoutPercentage: totalAI > 0 ? (state.ai.timeout / totalAI) * 100 : 0,
    providerErrorPercentage: totalAI > 0 ? (state.ai.provider_error / totalAI) * 100 : 0,
    rateLimitPercentage: totalAI > 0 ? (state.ai.rate_limit / totalAI) * 100 : 0,
    moderationFailurePercentage: totalAI > 0 ? (state.ai.moderation_failure / totalAI) * 100 : 0,
    fallbackUsedPercentage: totalAI > 0 ? (state.ai.fallback_used / totalAI) * 100 : 0
  };

  let mongoLatencyMs = 0;
  const mongoStart = Date.now();
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      mongoLatencyMs = Date.now() - mongoStart;
    } else {
      mongoLatencyMs = -1;
    }
  } catch (error) {
    mongoLatencyMs = -1;
  }

  let redisLatencyMs = 0;
  const redisClient = getRedis();
  if (redisClient && typeof redisClient.ping === "function") {
    const redisStart = Date.now();
    try {
      await redisClient.ping();
      redisLatencyMs = Date.now() - redisStart;
    } catch (error) {
      redisLatencyMs = -1;
    }
  } else {
    redisLatencyMs = -1;
  }

  return {
    replay: {
      raw: state.replay,
      rates: replayRates
    },
    ai: {
      raw: state.ai,
      rates: aiRates
    },
    latency: {
      mongodbMs: mongoLatencyMs,
      redisMs: redisLatencyMs
    }
  };
};

module.exports = {
  incrementReplayMetric,
  incrementAIMetric,
  getMetrics
};
