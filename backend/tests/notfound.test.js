const request = require("supertest");
const app = require("../src/app");

describe("404 Handler", () => {
  it("returns JSON for unknown routes", async () => {
    const res = await request(app).get("/api/unknown-endpoint-that-does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
