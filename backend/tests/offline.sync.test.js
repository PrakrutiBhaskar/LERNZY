const request = require("supertest");
const app = require("../src/app");
const { signAccessToken } = require("../src/utils/jwt.utils");
const ProgressEvent = require("../src/models/ProgressEvent.model");

jest.mock("../src/models/User.model", () => ({
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439011", name: "Test User", points: 100, save: jest.fn() })
  })
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
});
