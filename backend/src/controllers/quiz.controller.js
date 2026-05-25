const QuizSubmission = require("../models/QuizSubmission.model");
const { successResponse } = require("../utils/response.utils");

/**
 * Submits a student quiz answer. Idempotent based on clientGeneratedId.
 */
const submitQuiz = async (req, res, next) => {
  try {
    const {
      questionId,
      selectedAnswer,
      correctness,
      score,
      completionTime,
      clientGeneratedId,
      schemaVersion = 1
    } = req.body;

    const studentId = req.user._id;

    // Duplicate prevention based on client-generated ID during offline syncing / retries
    if (clientGeneratedId) {
      const existing = await QuizSubmission.findOne({ clientGeneratedId });
      if (existing) {
        return successResponse(res, { submission: existing, isDuplicate: true }, "Quiz submission processed (duplicate)");
      }
    }

    const submission = await QuizSubmission.create({
      studentId,
      userId: studentId,
      questionId,
      selectedAnswer,
      correctness,
      score,
      completionTime,
      clientGeneratedId,
      schemaVersion
    });

    return successResponse(res, { submission, isDuplicate: false }, "Quiz submitted successfully", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches the quiz history for the authenticated student.
 */
const getQuizHistory = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const history = await QuizSubmission.find({ studentId }).sort({ createdAt: -1 });
    return successResponse(res, { history }, "Quiz history retrieved");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitQuiz,
  getQuizHistory
};
