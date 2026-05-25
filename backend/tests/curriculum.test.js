const request = require("supertest");
const app = require("../src/app");
const CurriculumNode = require("../src/models/CurriculumNode.model");

jest.mock("../src/middleware/auth.middleware", () => {
  return (req, res, next) => {
    req.user = { _id: "507f1f77bcf86cd799439011", educationLevel: "beginner" };
    next();
  };
});

describe("GET /api/curriculum", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return seeded curriculum nodes", async () => {
    const mockNodes = [
      {
        _id: "607f1f77bcf86cd799439022",
        name: "Grade 6",
        nodeType: "grade",
        parent: null
      },
      {
        _id: "607f1f77bcf86cd799439033",
        name: "Mathematics",
        nodeType: "concept",
        parent: { _id: "607f1f77bcf86cd799439022", name: "Grade 6" }
      }
    ];

    CurriculumNode.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockNodes)
      })
    });

    const res = await request(app)
      .get("/api/curriculum")
      .set("Authorization", "Bearer mock-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockNodes);
    expect(res.body.message).toBe("Curriculum nodes fetched successfully");
  });
});
