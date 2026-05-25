const Flashcard = require("../models/Flashcard.model");
const { successResponse, errorResponse } = require("../utils/response.utils");

/**
 * Create a new flashcard.
 */
const createFlashcard = async (req, res, next) => {
  try {
    const { topicId, frontText, backText, memoryHook, source = "bundled", clientGeneratedId, schemaVersion = 1 } = req.body;

    // Deduplication checks for replay/retry requests
    if (clientGeneratedId) {
      const existing = await Flashcard.findOne({ clientGeneratedId, userId: req.user._id });
      if (existing) {
        return successResponse(res, { flashcard: existing, isDuplicate: true }, "Flashcard processed (duplicate)", 200);
      }
    }

    const flashcard = await Flashcard.create({
      userId: req.user._id,
      studentId: req.user._id,
      topicId,
      source,
      frontText,
      backText,
      memoryHook: memoryHook || "",
      clientGeneratedId,
      schemaVersion
    });

    return successResponse(res, { flashcard, isDuplicate: false }, "Flashcard created", 201);
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetch flashcards for the authenticated student.
 */
const getFlashcards = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { topicId, dueOnly } = req.query;

    const query = { userId };

    if (topicId) {
      query.topicId = topicId;
    }

    if (dueOnly === "true") {
      query.nextReviewAt = { $lte: new Date() };
    }

    const flashcards = await Flashcard.find(query).sort({ nextReviewAt: 1 });
    return successResponse(res, { flashcards }, "Flashcards retrieved");
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetch flashcards that are due for review (nextReviewAt <= now).
 */
const getDueFlashcards = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const flashcards = await Flashcard.find({
      userId,
      nextReviewAt: { $lte: new Date() }
    }).sort({ nextReviewAt: 1 });

    return successResponse(res, { flashcards }, "Due flashcards retrieved");
  } catch (error) {
    return next(error);
  }
};

/**
 * Record a spaced repetition review attempt and advance scheduling using the SM-2 algorithm.
 */
const reviewFlashcard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body; // easy, good, hard

    const flashcard = await Flashcard.findOne({ _id: id, userId: req.user._id });
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: "Flashcard not found",
        error: { code: "NOT_FOUND" }
      });
    }

    // Convert string rating to numeric Quality (q) matching SM-2 spec
    let q = 4; // 'good'
    if (rating === "easy") q = 5;
    else if (rating === "hard") q = 2;

    let repetitions = flashcard.repetitions;
    let intervalDays = flashcard.intervalDays;
    let easeFactor = flashcard.easeFactor;

    if (q < 3) {
      // Repetition failed; reset count and start over
      repetitions = 0;
      intervalDays = 1;
    } else {
      if (repetitions === 0) {
        intervalDays = 1;
      } else if (repetitions === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      repetitions += 1;
    }

    // Update ease factor (min constraint of 1.3)
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);

    // Calculate next review timestamp
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

    // Persist card
    flashcard.repetitions = repetitions;
    flashcard.intervalDays = intervalDays;
    flashcard.easeFactor = easeFactor;
    flashcard.nextReviewAt = nextReviewAt;
    flashcard.lastReviewedAt = new Date();

    await flashcard.save();

    return successResponse(res, { flashcard }, "Review logged, schedule updated");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createFlashcard,
  getFlashcards,
  getDueFlashcards,
  reviewFlashcard
};
