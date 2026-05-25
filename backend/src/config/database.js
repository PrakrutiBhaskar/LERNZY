const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in environment variables.");
  }

  // Enable query logging in staging/debugging environments
  const isStaging = process.env.NODE_ENV === "staging";
  const queryLoggingEnabled = process.env.QUERY_LOGGING === "true" || isStaging;
  if (queryLoggingEnabled) {
    mongoose.set("debug", (collectionName, method, query, doc) => {
      logger.info(`[Mongoose Query Log] ${collectionName}.${method}`, { query, doc });
    });
  }

  // Handle connection errors gracefully without unhandled crashes
  mongoose.connection.on("error", (err) => {
    logger.error("Database connection error occurred:", { error: err.message });
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("Database connection disconnected.");
  });

  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== "production",
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });
};

module.exports = connectDatabase;
