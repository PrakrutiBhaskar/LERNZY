const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User.model");
const DeviceSession = require("../src/models/DeviceSession.model");
const { signRefreshToken } = require("../src/utils/jwt.utils");
const { hashToken } = require("../src/utils/crypto.utils");

jest.mock("../src/models/User.model");

describe("Auth Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles signup", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
      preferredLanguage: "en",
      educationLevel: "beginner",
      save: jest.fn()
    });

    const res = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
      preferredLanguage: "en",
      educationLevel: "beginner"
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("handles login", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        name: "Test User",
        email: "test@example.com",
        preferredLanguage: "en",
        educationLevel: "beginner",
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn()
      })
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "Password123!"
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("handles refresh token", async () => {
    const refreshToken = signRefreshToken({ userId: "507f1f77bcf86cd799439011", tv: 0 });
    const hashed = hashToken(refreshToken);

    User.findById.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      refreshTokenHash: hashed,
      refreshTokenVersion: 0,
      save: jest.fn()
    });

    DeviceSession.findOne.mockResolvedValue({
      userId: "507f1f77bcf86cd799439011",
      deviceId: "default-device",
      platform: "unknown",
      refreshTokenHash: hashed,
      refreshVersion: 0,
      save: jest.fn().mockResolvedValue(true)
    });

    const res = await request(app).post("/api/auth/refresh").send({
      refreshToken
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });
});
