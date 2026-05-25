const request = require("supertest");
const app = require("../src/app");
const { signAccessToken } = require("../src/utils/jwt.utils");
const ProgressEvent = require("../src/models/ProgressEvent.model");

jest.mock("../src/models/User.model", () => ({
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439011", name: "Test User", points: 100, save: jest.fn() })
  })
}));

jest.mock("../src/models/Achievement.model", () => ({
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({})
}));

const validToken = signAccessToken({ userId: "507f1f77bcf86cd799439011" });

describe("Offline Sync & Conflict Resolution Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("permits standard progress event creation", async () => {
    const createSpy = jest.spyOn(ProgressEvent, "create").mockResolvedValue({
      userId: "507f1f77bcf86cd799439011",
      type: "lesson_completed",
      module: "math",
      payload: { chapterId: 1 }
    });
    
    const findSpy = jest.spyOn(ProgressEvent, "findOne").mockResolvedValue(null);

    const res = await request(app)
      .post("/api/v1/progress/events")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        type: "lesson_completed",
        module: "math",
        payload: { chapterId: 1 },
        clientTimestamp: Date.now()
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    
    createSpy.mockRestore();
    findSpy.mockRestore();
  });

  it("detects conflict and returns 409 when a newer server record exists", async () => {
    const findSpy = jest.spyOn(ProgressEvent, "findOne").mockResolvedValue({
      createdAt: new Date(Date.now() + 10000) // 10s newer than clientTimestamp
    });

    const res = await request(app)
      .post("/api/v1/progress/events")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        type: "lesson_completed",
        module: "math",
        payload: { chapterId: 1 },
        clientTimestamp: Date.now() - 5000 // 5s ago
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe("SYNC_CONFLICT");
    
    findSpy.mockRestore();
  });

  it("processes batch of progress events successfully", async () => {
    const findSpy = jest.spyOn(ProgressEvent, "findOne").mockResolvedValue(null);
    const createSpy = jest.spyOn(ProgressEvent, "create").mockImplementation((arr) => {
      return Promise.resolve(arr.map((item, idx) => ({ _id: `new-id-${idx}`, ...item })));
    });

    const res = await request(app)
      .post("/api/v1/progress/events")
      .set("Authorization", `Bearer ${validToken}`)
      .send([
        { type: "lesson_completed", module: "math", clientTimestamp: Date.now() },
        { type: "exercise_solved", module: "coding", clientTimestamp: Date.now() }
      ]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.diagnostics).toEqual({
      replayed: 2,
      duplicate: 0,
      failed: 0,
      retried: 0,
      discarded: 0
    });

    findSpy.mockRestore();
    createSpy.mockRestore();
  });

  it("handles mixed batch with duplicates, stale (conflict) events, and retries", async () => {
    const findSpy = jest.spyOn(ProgressEvent, "findOne").mockImplementation((query) => {
      if (query.eventId === "dup-id" || query.clientGeneratedId === "dup-id") {
        return Promise.resolve({ _id: "existing-event-id", eventId: "dup-id", type: "lesson_completed", module: "math" });
      }
      if (query.module === "stale-module" && query.createdAt?.$gt) {
        return Promise.resolve({ _id: "newer-event-id", createdAt: new Date() });
      }
      return Promise.resolve(null);
    });

    const createSpy = jest.spyOn(ProgressEvent, "create").mockImplementation((arr) => {
      return Promise.resolve(arr.map((item, idx) => ({ _id: `new-id-${idx}`, ...item })));
    });

    const res = await request(app)
      .post("/api/v1/progress/events")
      .set("Authorization", `Bearer ${validToken}`)
      .send([
        { type: "lesson_completed", module: "math", eventId: "dup-id", clientTimestamp: Date.now() }, // duplicate
        { type: "exercise_solved", module: "stale-module", clientTimestamp: Date.now() - 10000 }, // stale/conflict
        { type: "lesson_completed", module: "math", eventId: "new-id", clientTimestamp: Date.now(), isRetry: true } // replayed & retried
      ]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.diagnostics).toEqual({
      replayed: 1,
      duplicate: 1,
      failed: 0,
      retried: 1,
      discarded: 1
    });

    findSpy.mockRestore();
    createSpy.mockRestore();
  });
});
