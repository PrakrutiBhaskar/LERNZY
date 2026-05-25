const request = require("supertest");
const app = require("../src/app");
const Flashcard = require("../src/models/Flashcard.model");
const Achievement = require("../src/models/Achievement.model");
const ProgressEvent = require("../src/models/ProgressEvent.model");
const AnalyticsEvent = require("../src/models/AnalyticsEvent.model");

jest.mock("../src/models/Flashcard.model");
jest.mock("../src/models/Achievement.model");
jest.mock("../src/models/ProgressEvent.model");
jest.mock("../src/models/AnalyticsEvent.model");

jest.mock("../src/middleware/auth.middleware", () => {
  return (req, res, next) => {
    req.user = { _id: "507f1f77bcf86cd799439011", preferredLanguage: "en", grade: 6 };
    next();
  };
});

describe("Phase 2 & Phase 3 Learning/Progress Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/code/evaluate", () => {
    it("returns correct structured evaluation for 'hello-world'", async () => {
      const res = await request(app)
        .post("/api/v1/code/evaluate")
        .send({
          code: "console.log('Hello, World!');",
          problemId: "hello-world"
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.passed).toBe(true);
      expect(res.body.data.score).toBe(100);
      expect(res.body.data.results[0].testCase).toContain("Print exactly");
    });

    it("returns failed evaluation for wrong 'hello-world' code", async () => {
      const res = await request(app)
        .post("/api/v1/code/evaluate")
        .send({
          code: "console.log('Wrong message');",
          problemId: "hello-world"
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.passed).toBe(false);
      expect(res.body.data.score).toBe(0);
    });
  });

  describe("POST /api/translation", () => {
    it("completes target language normalization and translation", async () => {
      const res = await request(app)
        .post("/api/v1/translation")
        .send({
          text: "Welcome",
          language: "kannada"
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.language).toBe("kn");
    });
  });

  describe("POST /api/tts", () => {
    it("generates regional text-to-speech audio structure", async () => {
      const res = await request(app)
        .post("/api/v1/tts")
        .send({
          text: "Hello",
          language: "en"
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.provider).toBeDefined();
    });
  });

  describe("Flashcard CRUD & SM-2 Review Routes", () => {
    it("creates a new flashcard successfully", async () => {
      const mockCard = {
        _id: "507f1f77bcf86cd799439099",
        userId: "507f1f77bcf86cd799439011",
        topicId: "fractions",
        frontText: "Q",
        backText: "A"
      };
      Flashcard.create.mockResolvedValue(mockCard);

      const res = await request(app)
        .post("/api/v1/flashcards")
        .send({
          topicId: "fractions",
          frontText: "Q",
          backText: "A"
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.flashcard).toEqual(mockCard);
    });

    it("gets flashcards list", async () => {
      const mockCards = [{ _id: "1", frontText: "Q" }];
      Flashcard.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCards)
      });

      const res = await request(app).get("/api/v1/flashcards");
      expect(res.status).toBe(200);
      expect(res.body.data.flashcards).toEqual(mockCards);
    });

    it("evaluates and advances scheduling on review", async () => {
      const mockCard = {
        _id: "507f1f77bcf86cd799439022",
        userId: "507f1f77bcf86cd799439011",
        repetitions: 0,
        intervalDays: 1,
        easeFactor: 2.5,
        save: jest.fn().mockResolvedValue(true)
      };
      Flashcard.findOne.mockResolvedValue(mockCard);

      const res = await request(app)
        .put("/api/v1/flashcards/507f1f77bcf86cd799439022/review")
        .send({ rating: "easy" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockCard.save).toHaveBeenCalled();
    });
  });

  describe("Progress Mastery & Analytics Activities Aggregations", () => {
    it("runs aggregated per-student mastery aggregation query", async () => {
      const mockMastery = [
        { module: "math", totalAttempts: 2, correctAttempts: 2, masteryPercentage: 100 }
      ];
      ProgressEvent.aggregate.mockResolvedValue(mockMastery);

      const res = await request(app).get("/api/v1/progress/mastery");
      expect(res.status).toBe(200);
      expect(res.body.data.mastery).toEqual(mockMastery);
    });

    it("retrieves student achievements badges", async () => {
      const mockAchievements = [{ badgeKey: "first_math_attempt" }];
      Achievement.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockAchievements)
      });

      const res = await request(app).get("/api/v1/progress/achievements");
      expect(res.status).toBe(200);
      expect(res.body.data.achievements).toEqual(mockAchievements);
    });

    it("runs daily/weekly analytics activity summaries aggregation", async () => {
      const mockSummary = [
        { _id: "2026-05-25", events: [{ eventType: "module_start", count: 3 }], totalCount: 3 }
      ];
      AnalyticsEvent.aggregate.mockResolvedValue(mockSummary);

      const res = await request(app).get("/api/v1/analytics/summary?range=weekly");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockSummary);
    });
  });
});
