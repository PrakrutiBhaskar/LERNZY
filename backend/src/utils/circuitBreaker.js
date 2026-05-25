const logger = require("./logger");

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 3;
    this.cooldownPeriod = options.cooldownPeriod || 30000; // 30 seconds
    this.state = "CLOSED"; // CLOSED, OPEN, HALF-OPEN
    this.failures = 0;
    this.lastFailureTime = null;
  }

  async execute(action, fallback) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.cooldownPeriod) {
        this.state = "HALF-OPEN";
        logger.info(`circuit_breaker_half_open`, { name: this.name });
      } else {
        logger.warn(`circuit_breaker_open_fallback`, { name: this.name });
        return fallback();
      }
    }

    try {
      const result = await action();
      if (this.state === "HALF-OPEN") {
        this.state = "CLOSED";
        this.failures = 0;
        logger.info(`circuit_breaker_closed`, { name: this.name });
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      logger.warn(`circuit_breaker_failure`, {
        name: this.name,
        failures: this.failures,
        error: error.message
      });

      if (this.failures >= this.failureThreshold) {
        this.state = "OPEN";
        logger.error(`circuit_breaker_opened`, { name: this.name, threshold: this.failureThreshold });
      }

      return fallback();
    }
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options = {}, retries = 3, initialDelayMs = 200) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetch(url, options);

      // Retry on 429 Rate Limit or 5xx Server Errors
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        attempt++;
        if (attempt >= retries) {
          return response; // Return last response if exhausted
        }
        const delay = initialDelayMs * Math.pow(2, attempt);
        logger.warn(`fetch_retry_status`, { url, status: response.status, attempt, delay });
        await sleep(delay);
        continue;
      }

      return response;
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      const delay = initialDelayMs * Math.pow(2, attempt);
      logger.warn(`fetch_retry_error`, { url, error: error.message, attempt, delay });
      await sleep(delay);
    }
  }
};

module.exports = {
  CircuitBreaker,
  fetchWithRetry
};
