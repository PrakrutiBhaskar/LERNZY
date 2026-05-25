class AppError extends Error {
  constructor(message, statusCode, code, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || "INTERNAL_ERROR";
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthError extends AppError {
  constructor(message = "Authentication failed", details = {}) {
    super(message, 401, "AUTH_ERROR", details);
  }
}

class ReplayError extends AppError {
  constructor(message = "Replay error detected", details = {}) {
    super(message, 400, "REPLAY_ERROR", details);
  }
}

class AIServiceError extends AppError {
  constructor(message = "AI service failure", details = {}) {
    super(message, 502, "AI_SERVICE_ERROR", details);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed", details = {}) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

class ConflictError extends AppError {
  constructor(message = "Sync conflict detected", details = {}) {
    super(message, 409, "SYNC_CONFLICT", details);
  }
}

class RateLimitError extends AppError {
  constructor(message = "Too many requests", details = {}) {
    super(message, 429, "RATE_LIMIT_ERROR", details);
  }
}

class SyncError extends AppError {
  constructor(message = "Sync failed", details = {}) {
    super(message, 400, "SYNC_ERROR", details);
  }
}

module.exports = {
  AppError,
  AuthError,
  ReplayError,
  AIServiceError,
  ValidationError,
  ConflictError,
  RateLimitError,
  SyncError
};
