jest.mock("../src/models/ProgressEvent.model", () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock("../src/models/QuizSubmission.model", () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock("../src/models/User.model", () => ({
  findById: jest.fn()
}));

jest.mock("../src/models/CurriculumNode.model", () => ({
  findOne: jest.fn()
}));

jest.mock("../src/models/Achievement.model", () => ({
  find: jest.fn()
}));

jest.mock("../src/models/ReplayDLQ.model", () => ({
  create: jest.fn()
}));

jest.mock("../src/services/achievement.service", () => ({
  checkAndUnlock: jest.fn().mockResolvedValue([])
}));

jest.mock("../src/services/metrics.service", () => ({
  incrementReplayMetric: jest.fn()
}));

const ProgressEvent = require("../src/models/ProgressEvent.model");
const QuizSubmission = require("../src/models/QuizSubmission.model");
const progressController = require("../src/controllers/progress.controller");
const quizController = require("../src/controllers/quiz.controller");

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
}

describe("IDOR scoping for sync deduplication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("scopes progress eventId duplicate lookup to the authenticated user", async () => {
    ProgressEvent.findOne.mockResolvedValueOnce({
      _id: "existing-event",
      userId: "user-a",
      eventId: "shared-event-id",
      status: "COMPLETED"
    });

    const req = {
      user: { _id: "user-a" },
      headers: {},
      body: {
        type: "lesson_completed",
        module: "math",
        eventId: "shared-event-id"
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    await progressController.createEvent(req, res, next);

    expect(ProgressEvent.findOne).toHaveBeenCalledWith({
      userId: "user-a",
      eventId: "shared-event-id"
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("scopes quiz clientGeneratedId duplicate lookup to the authenticated student", async () => {
    QuizSubmission.findOne.mockResolvedValueOnce({
      _id: "existing-submission",
      studentId: "user-a",
      clientGeneratedId: "shared-client-id"
    });

    const req = {
      user: { _id: "user-a" },
      body: {
        questionId: "math-q1",
        selectedAnswer: "A",
        completionTime: 5,
        clientGeneratedId: "shared-client-id"
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    await quizController.submitQuiz(req, res, next);

    expect(QuizSubmission.findOne).toHaveBeenCalledWith({
      studentId: "user-a",
      clientGeneratedId: "shared-client-id"
    });
    expect(next).not.toHaveBeenCalled();
  });
});
