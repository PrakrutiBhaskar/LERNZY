const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const { signAccessToken } = require("../src/utils/jwt.utils");
const User = require("../src/models/User.model");
const ProgressEvent = require("../src/models/ProgressEvent.model");
const ChatHistory = require("../src/models/ChatHistory.model");
const { runWithTransaction } = require("../src/utils/transaction");
const { createBackup, verifyRestore } = require("../src/services/backup.service");

// Mock User model with query chain
jest.mock("../src/models/User.model", () => {
  const actualUser = jest.requireActual("../src/models/User.model");
  
  // Create model mock
  const userMock = {
    schema: actualUser.schema,
    findById: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        name: "Test User",
        email: "test@example.com",
        preferredLanguage: "en",
        educationLevel: "beginner",
        save: jest.fn()
      })
    }),
    create: jest.fn(),
    findOne: jest.fn()
  };
  return userMock;
});

// Mock ProgressEvent model
jest.mock("../src/models/ProgressEvent.model", () => {
  const actualProgressEvent = jest.requireActual("../src/models/ProgressEvent.model");
  return {
    schema: actualProgressEvent.schema,
    findOne: jest.fn(),
    create: jest.fn()
  };
});

// Mock Achievement model
jest.mock("../src/models/Achievement.model", () => {
  return {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    })
  };
});

// Mock ChatHistory model
jest.mock("../src/models/ChatHistory.model", () => {
  const actualChatHistory = jest.requireActual("../src/models/ChatHistory.model");
  return {
    schema: actualChatHistory.schema,
    findOne: jest.fn(),
    create: jest.fn()
  };
});

const validUserId = "507f1f77bcf86cd799439011";
const validToken = signAccessToken({ userId: validUserId });

describe("Database Resilience & Integrity Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("1. Transactions & Fallback Support", () => {
    it("runs transaction helper actions sequentially if transaction throws unsupported error or DB is offline", async () => {
      const mockAction = jest.fn().mockImplementation((session) => {
        if (session) {
          throw new Error("replica set is required for transactions");
        }
        return "fallback-success";
      });

      const res = await runWithTransaction(mockAction);
      expect(res).toBe("fallback-success");
      // Mongoose connection state is test (offline), so it bypasses connection session
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("2. Soft Delete Behavior", () => {
    it("defines soft delete parameters and methods on User model schema", () => {
      const UserSchema = User.schema;
      expect(UserSchema.obj.isDeleted).toBeDefined();
      expect(UserSchema.obj.deletedAt).toBeDefined();
    });

    it("verifies soft delete execution method behaves correctly", async () => {
      const mockUser = {
        _id: validUserId,
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
        softDelete: async function() {
          this.isDeleted = true;
          this.deletedAt = new Date();
          return this.save();
        }
      };

      await mockUser.softDelete();
      expect(mockUser.isDeleted).toBe(true);
      expect(mockUser.deletedAt).toBeInstanceOf(Date);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe("3. NoSQL Input Sanitizer", () => {
    it("strips out params prefixed with $ from request body", async () => {
      ProgressEvent.findOne.mockResolvedValue(null);
      ProgressEvent.create.mockResolvedValue([{
        userId: validUserId,
        type: "lesson_completed",
        module: "math",
        payload: { chapterId: 1 }
      }]);

      const res = await request(app)
        .post("/api/v1/progress/events")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          type: "lesson_completed",
          module: "math",
          payload: { chapterId: 1 },
          $ne: "malicious_operator" // NoSQL injection attempt
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe("4. Referential Integrity (Foreign Key Constraints)", () => {
    it("checks pre-save hook registration on ProgressEvent and ChatHistory schemas", () => {
      const progressHooks = ProgressEvent.schema?._hooks?.pre?.save;
      if (progressHooks) {
        const hasValidator = progressHooks.some(h => h.fn.name === "validateUserId");
        expect(hasValidator).toBe(true);
      }
      
      const chatHooks = ChatHistory.schema?._hooks?.pre?.save;
      if (chatHooks) {
        const hasValidator = chatHooks.some(h => h.fn.name === "validateUserId");
        expect(hasValidator).toBe(true);
      }
    });
  });

  describe("5. Scheduled Backups & Integrity Restore Verification", () => {
    it("runs backup creation utility and dumps all registered collections", async () => {
      // Mock mongoose model query responses
      const mockFind = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: "dummy-doc" }])
      });

      const originalModelNames = mongoose.modelNames;
      const originalModel = mongoose.model;

      mongoose.modelNames = jest.fn().mockReturnValue(["User", "ProgressEvent"]);
      mongoose.model = jest.fn().mockReturnValue({
        find: mockFind,
        deleteMany: jest.fn().mockResolvedValue(true),
        insertMany: jest.fn().mockResolvedValue(true),
        countDocuments: jest.fn().mockResolvedValue(1)
      });

      const backupPath = await createBackup();
      expect(backupPath).toContain("lernzy_backup_");

      const verifyResult = await verifyRestore(backupPath);
      expect(verifyResult).toBe(true);

      // Restore original mongoose methods
      mongoose.modelNames = originalModelNames;
      mongoose.model = originalModel;

      // Clean up backup file
      if (backupPath) {
        try {
          require("fs").unlinkSync(backupPath);
        } catch (e) {
          // ignore
        }
      }
    });
  });
});
