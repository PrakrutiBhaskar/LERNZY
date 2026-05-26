require("dotenv").config({ override: true });

const app = require("./app");
const connectDatabase = require("./config/database");
const mongoose = require("mongoose");
const { validateEnvironment } = require("./config/env");
const { initRedis, getRedis } = require("./services/cache.service");
const logger = require("./utils/logger");

const PORT = Number(process.env.PORT || 5001);

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDatabase();
    
    // Execute database migrations
    const { runMigrations } = require("./migrations/runner");
    await runMigrations("up");

    await initRedis();

    const server = app.listen(PORT, () => {
      logger.info("server_started", { port: PORT });
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`Port ${PORT} is already in use. Update PORT in .env and restart.`);
      } else {
        logger.error("Server failed to bind", { message: error.message });
      }
      process.exit(1);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      server.close(async () => {
        logger.info("HTTP server closed.");
        
        try {
          if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            logger.info("MongoDB connection closed.");
          }
          
          const redisClient = getRedis();
          if (redisClient) {
            await redisClient.quit();
            logger.info("Redis connection closed.");
          }
        } catch (error) {
          logger.error("Error during graceful shutdown", { message: error.message });
        }
        
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  } catch (error) {
    logger.error("Failed to start backend", { message: error.message, stack: error.stack });
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { message: error.message, stack: error.stack });
  process.exit(1);
});

startServer();
