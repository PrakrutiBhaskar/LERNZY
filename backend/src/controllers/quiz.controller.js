const QuizSubmission = require("../models/QuizSubmission.model");
const User = require("../models/User.model");
const CurriculumNode = require("../models/CurriculumNode.model");
const { ValidationError } = require("../utils/errors");
const { successResponse } = require("../utils/response.utils");

/**
 * Submits a student quiz answer. Idempotent based on clientGeneratedId.
 */
const submitQuiz = async (req, res, next) => {
  try {
    const {
      questionId,
      selectedAnswer,
      completionTime,
      clientGeneratedId,
      schemaVersion = 1
    } = req.body;

    const studentId = req.user._id;

    // Duplicate prevention based on client-generated ID during offline syncing / retries
    if (clientGeneratedId) {
      const existing = await QuizSubmission.findOne({ studentId, clientGeneratedId });
      if (existing) {
        return successResponse(res, { submission: existing, isDuplicate: true }, "Quiz submission processed (duplicate)");
      }
    }

    // Server-authoritative quiz validation
    const node = await CurriculumNode.findOne({ "metadata.quizQuestions.id": questionId });
    if (!node) {
      throw new ValidationError("Question not found");
    }

    const quizQuestions = node.metadata.quizQuestions;
    const question = quizQuestions.find((q) => q.id === questionId);
    if (!question) {
      throw new ValidationError("Question not found in curriculum node");
    }

    const correctIndex = question.correct_index;
    let correctness = false;

    // Support both numeric/index and string comparisons for selectedAnswer
    const isIndex = typeof selectedAnswer === "number" || (!isNaN(Number(selectedAnswer)) && String(selectedAnswer).trim() !== "");
    if (isIndex) {
      correctness = Number(selectedAnswer) === correctIndex;
    } else {
      const correctTextEn = question.options.en[correctIndex];
      const correctTextHi = question.options.hi?.[correctIndex];
      const correctTextKn = question.options.kn?.[correctIndex];
      correctness = selectedAnswer === correctTextEn || selectedAnswer === correctTextHi || selectedAnswer === correctTextKn;
    }

    const score = correctness ? 1 : 0;
    const pointsAwarded = correctness ? 5 : 0;

    if (pointsAwarded > 0) {
      const user = await User.findById(studentId);
      if (user) {
        user.points = (user.points || 0) + pointsAwarded;
        await user.save();
      }
    }

    const submission = await QuizSubmission.create({
      studentId,
      userId: studentId,
      questionId,
      selectedAnswer: String(selectedAnswer),
      correctness,
      score,
      completionTime,
      clientGeneratedId,
      schemaVersion
    });

    return successResponse(res, { submission, isDuplicate: false, pointsAwarded }, "Quiz submitted successfully", 201);
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
