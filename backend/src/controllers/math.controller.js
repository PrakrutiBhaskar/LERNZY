const mathService = require("../services/math.service");
const MathAttempt = require("../models/MathAttempt.model");
const { successResponse, errorResponse } = require("../utils/response.utils");

const generateProblem = async (req, res, next) => {
  try {
    const { topic } = req.body;
    const user = req.user;
    
    // Adaptive difficulty logic
    const recentAttempts = await MathAttempt.find({ userId: user._id, topic: topic || "general" })
      .sort({ createdAt: -1 })
      .limit(3);
    
    let difficulty = 2; // default
    if (recentAttempts.length >= 3) {
      const correctCount = recentAttempts.filter(a => a.isCorrect).length;
      const lastDifficulty = recentAttempts[0].difficulty;
      if (correctCount === 3) difficulty = Math.min(5, lastDifficulty + 1);
      else if (correctCount <= 1) difficulty = Math.max(1, lastDifficulty - 1);
      else difficulty = lastDifficulty;
    }

    const problem = await mathService.generateProblem({
      grade: user.grade,
      topic: topic || "general",
      interests: user.interests,
      language: user.preferredLanguage,
      difficulty
    });

    problem.difficulty = difficulty;

    return successResponse(res, { problem });
  } catch (error) {
    return next(error);
  }
};

const submitAttempt = async (req, res, next) => {
  try {
    const { topic, difficulty, isCorrect, timeTakenSeconds } = req.body;
    
    const attempt = await MathAttempt.create({
      userId: req.user._id,
      topic,
      difficulty,
      isCorrect,
      timeTakenSeconds
    });

    return successResponse(res, { attempt }, "Attempt logged");
  } catch (error) {
    return next(error);
  }
};

module.exports = { generateProblem, submitAttempt };
