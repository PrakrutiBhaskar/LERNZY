const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const { signAccessToken } = require("../src/utils/jwt.utils");
const User = require("../src/models/User.model");
const ProgressEvent = require("../src/models/ProgressEvent.model");
const DeviceSession = require("../src/models/DeviceSession.model");
const ReplayDLQ = require("../src/models/ReplayDLQ.model");
const QuizSubmission = require("../src/models/QuizSubmission.model");
const aiService = require("../src/services/ai.service");
const { getRedis, getRedisStatus } = require("../src/services/cache.service");

// Mock cache service
jest.mock("../src/services/cache.service", () => {
  let redisStatus = "ready";
  return {
    getRedis: jest.fn().mockImplementation(() => {
      if (redisStatus === "disconnected") {
        return null;
      }
      return {
        ping: jest.fn().mockResolvedValue("PONG"),
        set: jest.fn().mockResolvedValue("OK"),
        get: jest.fn().mockResolvedValue(null)
      };
    }),
    getRedisStatus: jest.fn().mockImplementation(() => redisStatus),
    setRedisStatusForTesting: (status) => {
      redisStatus = status;
    }
  };
});

// Mock models
jest.mock("../src/models/User.model", () => {
  return {
    findById: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        name: "Test Student",
        points: 100,
        save: jest.fn().mockResolvedValue(true)
      })
    }),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    exists: jest.fn().mockResolvedValue(true)
  };
});

jest.mock("../src/models/ProgressEvent.model", () => {
  const mockDocs = [];
  return {
    schema: {
      obj: { status: {} },
      _hooks: { pre: { save: [] } }
    },
    findOne: jest.fn().mockImplementation((query) => {
      if (query.eventId === "dup-event" || query.clientGeneratedId === "dup-event") {
        return Promise.resolve({
          _id: "existing-id",
          eventId: "dup-event",
          status: "COMPLETED",
          save: jest.fn().mockResolvedValue(true)
        });
      }
      if (query.eventId === "failed-event" || query.clientGeneratedId === "failed-event") {
        return Promise.resolve({
          _id: "failed-id",
          eventId: "failed-event",
          status: "FAILED",
          retryCount: 1,
          save: jest.fn().mockResolvedValue(true)
        });
      }
      return Promise.resolve(null);
    }),
    create: jest.fn().mockImplementation((arg) => {
      const items = Array.isArray(arg) ? arg : [arg];
      const created = items.map((x, idx) => ({
        _id: `new-event-${idx}`,
        ...x,
        save: jest.fn().mockResolvedValue(true)
      }));
      return Promise.resolve(Array.isArray(arg) ? created : created[0]);
    })
  };
});

jest.mock("../src/models/ReplayDLQ.model", () => {
  return {
    create: jest.fn().mockResolvedValue({ _id: "dlq-doc-id" })
  };
});

jest.mock("../src/models/DeviceSession.model", () => {
  let sessions = [];
  return {
    findOne: jest.fn().mockImplementation((query) => {
      return sessions.find(s => s.userId === query.userId && s.deviceId === query.deviceId) || null;
    }),
    create: jest.fn().mockImplementation((doc) => {
      const s = { ...doc, save: jest.fn().mockResolvedValue(true) };
      sessions.push(s);
      return Promise.resolve(s);
    }),
    deleteMany: jest.fn().mockImplementation((query) => {
      sessions = sessions.filter(s => s.userId !== query.userId);
      return Promise.resolve({ deletedCount: sessions.length });
    }),
    deleteOne: jest.fn().mockImplementation((query) => {
      sessions = sessions.filter(s => !(s.userId === query.userId && s.deviceId === query.deviceId));
      return Promise.resolve({ deletedCount: 1 });
    }),
    setSessionsForTesting: (arr) => {
      sessions = arr;
    },
    getSessionsForTesting: () => sessions
  };
});

jest.mock("../src/models/QuizSubmission.model", () => {
  let hasSubmitted = false;
  return {
    findOne: jest.fn().mockImplementation((query) => {
      if (query.clientGeneratedId === "dup-quiz") {
        return Promise.resolve({ _id: "q-id" });
      }
      return Promise.resolve(null);
    }),
    create: jest.fn().mockImplementation((doc) => {
      return Promise.resolve({ _id: "q-id-new", ...doc });
    }),
    setHasSubmittedForTesting: (val) => {
      hasSubmitted = val;
    }
  };
});

// Mock achievement check service
jest.mock("../src/services/achievement.service", () => ({
  checkAndUnlock: jest.fn().mockResolvedValue([])
}));

const validUserId = "507f1f77bcf86cd799439011";
const validToken = signAccessToken({ userId: validUserId });

describe("LERNZY Backend Hardening — Integration Simulation Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Replay Storm Test", () => {
    it("processes a storm of progress events correctly routing failures to retry & DLQ limits", async () => {
      const res = await request(app)
        .post("/api/v1/progress/events")
        .set("Authorization", `Bearer ${validToken}`)
        .send([
          { type: "lesson_completed", module: "coding", eventId: "new-event", clientTimestamp: Date.now() },
          { type: "lesson_completed", module: "math", eventId: "dup-event", clientTimestamp: Date.now() },
          { type: "exercise_solved", module: "math", eventId: "failed-event", clientTimestamp: Date.now() }
        ]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.diagnostics).toEqual({
        replayed: 2,
        duplicate: 1,
        failed: 0,
        retried: 1,
        discarded: 0
      });
    });

    it("routes to DLQ when event retry limit is exceeded", async () => {
      const ProgressEvent = require("../src/models/ProgressEvent.model");
      ProgressEvent.findOne.mockReturnValueOnce(Promise.resolve({
        _id: "failed-id-max",
        eventId: "max-failed-event",
        status: "FAILED",
        retryCount: 3,
        save: jest.fn().mockResolvedValue(true)
      }));

      const res = await request(app)
        .post("/api/v1/progress/events")
        .set("Authorization", `Bearer ${validToken}`)
        .send([
          { type: "exercise_solved", module: "math", eventId: "max-failed-event", clientTimestamp: Date.now() }
        ]);

      expect(res.status).toBe(200);
      expect(res.body.data.diagnostics.discarded).toBe(1);
      expect(res.body.data.diagnostics.replayed).toBe(0);
      
      const ReplayDLQ = require("../src/models/ReplayDLQ.model");
      expect(ReplayDLQ.create).toHaveBeenCalled();
    });
  });

  describe("2. Quiz Concurrency Test", () => {
    it("avoids race conditions by utilizing duplicate checking on clientGeneratedId", async () => {
      const QuizSubmission = require("../src/models/QuizSubmission.model");
      
      const firstRes = await request(app)
        .post("/api/v1/quiz/submit")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          questionId: "math-q1",
          selectedAnswer: "A",
          correctness: true,
          score: 10,
          completionTime: 5,
          clientGeneratedId: "new-quiz-id"
        });

      expect(firstRes.status).toBe(201);

      QuizSubmission.findOne.mockResolvedValueOnce({ _id: "existing-submission" });
      const secondRes = await request(app)
        .post("/api/v1/quiz/submit")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          questionId: "math-q1",
          selectedAnswer: "A",
          correctness: true,
          score: 10,
          completionTime: 5,
          clientGeneratedId: "new-quiz-id"
        });

      expect(secondRes.status).toBe(200);
      expect(secondRes.body.success).toBe(true);
    });
  });

  describe("3. AI Concurrency & Timeout Cascade Test", () => {
    it("enforces active queue limits and rejects requests when concurrency limit is hit", async () => {
      process.env.MAX_CONCURRENT_AI_CALLS = "2";

      const askPromises = [
        request(app).post("/api/v1/ask").set("Authorization", `Bearer ${validToken}`).send({ question: "Q1" }),
        request(app).post("/api/v1/ask").set("Authorization", `Bearer ${validToken}`).send({ question: "Q2" }),
        request(app).post("/api/v1/ask").set("Authorization", `Bearer ${validToken}`).send({ question: "Q3" })
      ];

      const responses = await Promise.all(askPromises);
      const isRejected = responses.some(res => res.status === 503 && res.body.error.code === "AI_CONCURRENCY_LIMIT_EXCEEDED");
      
      expect(isRejected).toBe(true);
    });
  });

  describe("4. Redis Graceful Failure Test", () => {
    it("gracefully falls back when Redis disconnections occur", async () => {
      const { setRedisStatusForTesting } = require("../src/services/cache.service");
      setRedisStatusForTesting("disconnected");

      const res = await request(app)
        .get("/api/v1/health")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.services.redis).toBe("disconnected");
    });
  });

  describe("5. Session Replay Protection Test", () => {
    it("invalidates all device sessions on refresh token reuse detection", async () => {
      const DeviceSession = require("../src/models/DeviceSession.model");
      
      const mockSession = {
        userId: validUserId,
        deviceId: "device-1",
        platform: "ios",
        refreshTokenHash: "different-hash",
        refreshVersion: 2,
        save: jest.fn()
      };
      
      DeviceSession.setSessionsForTesting([mockSession]);

      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: signAccessToken({ userId: validUserId, deviceId: "device-1", tv: 2 }) });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("REFRESH_BREACH_DETECTED");
      expect(DeviceSession.getSessionsForTesting().length).toBe(0);
    });
  });
});
