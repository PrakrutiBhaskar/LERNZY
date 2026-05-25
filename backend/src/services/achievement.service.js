const Achievement = require("../models/Achievement.model");
const ProgressEvent = require("../models/ProgressEvent.model");
const MathAttempt = require("../models/MathAttempt.model");

/**
 * Checks for milestone completions and unlocks badges for the student.
 * IDEMPOTENT: Uses try-catch with compound unique index to prevent duplicate achievements.
 */
const checkAndUnlock = async (userId, sourceEvent = {}) => {
  try {
    const unlocks = [];

    // 1. Math Milestones
    if (sourceEvent.type === "math_attempt") {
      // First Math Attempt
      const existingMath = await Achievement.findOne({ userId, badgeKey: "first_math_attempt" });
      if (!existingMath) {
        try {
          const badge = await Achievement.create({ userId, badgeKey: "first_math_attempt" });
          unlocks.push(badge);
        } catch (e) {
          // Ignore unique index collision errors
        }
      }

      // 5 Math Correct Exercises
      const correctCount = await MathAttempt.countDocuments({ userId, isCorrect: true });
      if (correctCount >= 5) {
        const existingMaster = await Achievement.findOne({ userId, badgeKey: "math_master_5" });
        if (!existingMaster) {
          try {
            const badge = await Achievement.create({ userId, badgeKey: "math_master_5" });
            unlocks.push(badge);
          } catch (e) {
            // Ignore unique index collision
          }
        }
      }
    }

    // 2. Lesson Progress Milestones
    if (sourceEvent.type === "lesson_completed" || sourceEvent.type === "lesson_complete") {
      const existingLesson = await Achievement.findOne({ userId, badgeKey: "first_lesson" });
      if (!existingLesson) {
        try {
          const badge = await Achievement.create({ userId, badgeKey: "first_lesson" });
          unlocks.push(badge);
        } catch (e) {
          // Ignore unique index collision
        }
      }
    }

    // 3. Quiz Milestones
    if (
      sourceEvent.type === "quiz_completed" &&
      sourceEvent.payload &&
      sourceEvent.payload.score === sourceEvent.payload.total &&
      sourceEvent.payload.total > 0
    ) {
      const existingQuiz = await Achievement.findOne({ userId, badgeKey: "perfect_quiz" });
      if (!existingQuiz) {
        try {
          const badge = await Achievement.create({ userId, badgeKey: "perfect_quiz" });
          unlocks.push(badge);
        } catch (e) {
          // Ignore unique index collision
        }
      }
    }

    return unlocks;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to process achievement check:", error);
    return [];
  }
};

module.exports = {
  checkAndUnlock
};
