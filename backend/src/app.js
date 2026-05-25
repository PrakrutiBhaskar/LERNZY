const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const askRoutes = require("./routes/ask.routes");
const historyRoutes = require("./routes/history.routes");
const progressRoutes = require("./routes/progress.routes");
const mathRoutes = require("./routes/math.routes");
const codeRoutes = require("./routes/code.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const curriculumRoutes = require("./routes/curriculum.routes");
const translationRoutes = require("./routes/translation.routes");
const ttsRoutes = require("./routes/tts.routes");
const flashcardRoutes = require("./routes/flashcard.routes");
const subjectsRoutes = require("./routes/subjects.routes");
const topicsRoutes = require("./routes/topics.routes");
const lessonsRoutes = require("./routes/lessons.routes");
const quizRoutes = require("./routes/quiz.routes");
const errorHandler = require("./middleware/error.middleware");
const sanitizeRequest = require("./middleware/sanitize.middleware");
const nosqlSanitize = require("./middleware/nosqlSanitize.middleware");
const { globalLimiter } = require("./middleware/rateLimit.middleware");
const { parseAllowedOrigins } = require("./utils/cors.utils");
const { getRedisStatus } = require("./services/cache.service");
const logger = require("./utils/logger");

const app = express();

const allowedOrigins = parseAllowedOrigins();

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const corsError = new Error("CORS origin denied");
      corsError.statusCode = 403;
      corsError.code = "CORS_DENIED";
      return callback(corsError);
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
      data: null,
      error: { code: "INVALID_JSON" }
    });
  }
  next(err);
});

app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.use(sanitizeRequest);
app.use(nosqlSanitize);

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
    stream: {
      write: (msg) => logger.http(msg.trim())
    }
  })
);

app.use(globalLimiter);

// Group v1 Routes
const v1Router = express.Router();

v1Router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Tutor backend is healthy",
    data: null,
    error: null
  });
});

v1Router.get("/health/ready", (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  const redisStatus = getRedisStatus();
  const redisReady = redisStatus === "ready" || redisStatus === "connect" || redisStatus === "disabled";
  const ready = mongoReady && redisReady;

  return res.status(ready ? 200 : 503).json({
    success: ready,
    message: ready ? "Backend is ready" : "Backend is not ready",
    data: {
      services: {
        mongo: mongoReady ? "ready" : "not_ready",
        redis: redisStatus
      }
    },
    error: ready ? null : { code: "SERVICE_NOT_READY" }
  });
});

v1Router.use("/auth", authRoutes);
v1Router.use("/ask", askRoutes);
v1Router.use("/history", historyRoutes);
v1Router.use("/progress", progressRoutes);
v1Router.use("/math", mathRoutes);
v1Router.use("/code", codeRoutes);
v1Router.use("/analytics", analyticsRoutes);
v1Router.use("/curriculum", curriculumRoutes);
v1Router.use("/translation", translationRoutes);
v1Router.use("/tts", ttsRoutes);
v1Router.use("/flashcards", flashcardRoutes);
v1Router.use("/subjects", subjectsRoutes);
v1Router.use("/topics", topicsRoutes);
v1Router.use("/lessons", lessonsRoutes);
v1Router.use("/quiz", quizRoutes);

// Mount versioned & legacy fallback APIs
app.use("/api/v1", v1Router);
app.use("/api", v1Router);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    data: null,
    error: { code: "NOT_FOUND" }
  });
});

app.use(errorHandler);

module.exports = app;
