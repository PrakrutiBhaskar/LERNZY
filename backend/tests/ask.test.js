const request = require("supertest");
const app = require("../src/app");
const { signAccessToken } = require("../src/utils/jwt.utils");

jest.mock("../src/models/User.model", () => ({
  findById: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439011", name: "Test User", educationLevel: "beginner" })
  })
}));

jest.mock("../src/models/ChatHistory.model", () => ({
  create: jest.fn().mockResolvedValue({}),
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockResolvedValue([])
    })
  })
}));

// Mock ai service
jest.mock("../src/services/ai.service", () => ({
  generateTutorResponse: jest.fn().mockResolvedValue({
    text: "This is a fallback response",
    modelMeta: { provider: "fallback", model: "local-template" }
  }),
  streamTutorResponse: jest.fn()
}));

const validToken = signAccessToken({ userId: "507f1f77bcf86cd799439011" });

describe("POST /api/ask", () => {
  it("rejects request without question", async () => {
    const res = await request(app)
      .post("/api/ask")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        language: "en"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("handles valid request", async () => {
    const res = await request(app)
      .post("/api/ask")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        question: "Explain gravity",
        language: "en",
        outputType: "text"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.explanation).toBeDefined();
  });
});
