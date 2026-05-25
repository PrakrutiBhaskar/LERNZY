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
