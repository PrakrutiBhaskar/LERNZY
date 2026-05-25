const request = require("supertest");
const app = require("../src/app");
const { getRedis } = require("../src/services/cache.service");

// Mock cache service for testing idempotency cache
jest.mock("../src/services/cache.service", () => {
  const mockRedis = {
    status: "ready",
    get: jest.fn(),
    set: jest.fn().mockResolvedValue("OK")
  };
  return {
    getRedis: () => mockRedis,
    getRedisStatus: () => "ready"
  };
});

describe("API Hardening & Reliability Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("API Versioning", () => {
    it("serves health check on both /api and /api/v1 prefix", async () => {
      const resLegacy = await request(app).get("/api/health");
      expect(resLegacy.status).toBe(200);
      expect(resLegacy.body.success).toBe(true);

      const resV1 = await request(app).get("/api/v1/health");
      expect(resV1.status).toBe(200);
      expect(resV1.body.success).toBe(true);
    });
  });

  describe("Idempotency Middleware", () => {
    it("returns cached response if Idempotency-Key exists in Redis", async () => {
      const redisMock = getRedis();
      redisMock.get.mockResolvedValue(
        JSON.stringify({
          statusCode: 201,
          body: { success: true, cached: true },
          contentType: "application/json"
        })
      );

      // Call public creation endpoint with idempotency key
      const res = await request(app)
        .post("/api/v1/analytics/events")
        .set("Idempotency-Key", "test-key-123")
        .send({
          events: [
            { eventType: "click", sessionId: "test-sess", platform: "android" }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.cached).toBe(true);
      expect(res.headers["x-cache-idempotency"]).toBe("HIT");
      expect(redisMock.get).toHaveBeenCalledWith("idempotency:test-key-123");
    });
  });

  describe("Input Payload & Type Validations", () => {
    it("rejects invalid events array length in analytics logger", async () => {
      const res = await request(app)
        .post("/api/v1/analytics/events")
        .send({ events: [] }); // Empty array fails validation

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });
});
