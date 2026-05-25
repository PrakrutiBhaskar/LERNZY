const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format((info) => {
      try {
        const { getRequestId } = require("./context");
        const rid = getRequestId();
        if (rid) {
          info.requestId = rid;
        }
      } catch (err) {
        // ignore if context is loaded before setup
      }
      return info;
    })(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
          const metaText = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
          return stack
            ? `${timestamp} ${level}: ${message}\n${stack}`
            : `${timestamp} ${level}: ${message}${metaText}`;
        })
      )
    })
  ]
});

module.exports = logger;
