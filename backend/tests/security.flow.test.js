const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User.model");
const { restrictTo } = require("../src/middleware/auth.middleware");

jest.mock("../src/models/User.model");
jest.mock("../src/services/cache.service", () => ({
  getRedis: () => null,
  getRedisStatus: () => "disabled"
}));

describe("Security Flow Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Account Lockout Logic", () => {
    it("denies login if user is locked out", async () => {
      const futureDate = new Date(Date.now() + 15 * 60 * 1000);
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: "507f1f77bcf86cd799439011",
          email: "locked@example.com",
          lockUntil: futureDate,
          loginAttempts: 5,
          comparePassword: jest.fn().mockResolvedValue(false),
          save: jest.fn()
        })
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "locked@example.com",
        password: "Password123!"
      });

      expect(res.status).toBe(423);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("ACCOUNT_LOCKED");
    });

    it("locks user on the fifth consecutive failure", async () => {
      const mockSave = jest.fn();
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "fail@example.com",
        loginAttempts: 4,
        comparePassword: jest.fn().mockResolvedValue(false),
        save: mockSave
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "fail@example.com",
        password: "WrongPassword1!"
      });

      expect(res.status).toBe(423);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("ACCOUNT_LOCKED");
      expect(mockUser.lockUntil).toBeDefined();
      expect(mockUser.loginAttempts).toBe(5);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe("Role-Based Access Control (RBAC)", () => {
    it("allows request when user matches required role", () => {
      const req = { user: { role: "admin" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const middleware = restrictTo("admin");
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("blocks request with 403 when user does not match role", () => {
      const req = { user: { role: "student" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const middleware = restrictTo("admin");
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: { code: "FORBIDDEN" }
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});
