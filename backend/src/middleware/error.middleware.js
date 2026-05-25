const logger = require("../utils/logger");

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Internal server error";

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = `Invalid format for field ${err.path}`;
  } else if (
    err.name === "MongoNetworkError" ||
    err.name === "MongoTimeoutError" ||
    err.name === "MongoServerSelectionError" ||
    err.message?.includes("timed out") ||
    err.message?.includes("connection pool")
  ) {
    statusCode = 503;
    code = "DATABASE_UNAVAILABLE";
    message = "The database is temporarily unavailable. Please try again in a moment.";
  }

  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && statusCode >= 500) {
    message = "Internal server error";
  }

  if (!isProduction || statusCode >= 500) {
    logger.error("unhandled_error", {
      statusCode,
      message: err.message,
      path: req.originalUrl,
      method: req.method,
      stack: err.stack
    });
  } else {
    logger.warn("client_error", {
      statusCode,
      message: err.message,
      path: req.originalUrl,
      method: req.method
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: {
      code
    }
  });
};

module.exports = errorHandler;
