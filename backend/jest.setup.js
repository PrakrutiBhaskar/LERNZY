// Mock environment variables for testing so tests don't fail without a .env file
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';

// Provide valid-looking dummy secrets for JWT functions
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-that-is-long-enough';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-that-is-long-enough';

// Use a safe origin for tests
process.env.CORS_ORIGINS = 'http://localhost:3000';

process.env.MAX_REQUESTS_PER_MINUTE = '1000';
process.env.AUTH_RATE_LIMIT_MAX = '1000';

jest.mock("./src/utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  http: jest.fn(),
  debug: jest.fn()
}));

jest.mock("./src/models/DeviceSession.model", () => {
  return {
    findOne: jest.fn().mockImplementation((query) => {
      // Create a long hash of a token mock
      const { hashToken } = require("./src/utils/crypto.utils");
      const { signRefreshToken } = require("./src/utils/jwt.utils");
      const token = signRefreshToken({ userId: query.userId?.toString() || "507f1f77bcf86cd799439011", tv: 0 });
      return Promise.resolve({
        userId: query.userId,
        deviceId: query.deviceId || "default-device",
        platform: "unknown",
        refreshTokenHash: hashToken(token),
        refreshVersion: 0,
        save: jest.fn().mockResolvedValue(true)
      });
    }),
    create: jest.fn().mockImplementation((doc) => {
      return Promise.resolve({
        ...doc,
        save: jest.fn().mockResolvedValue(true)
      });
    }),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
  };
});
