const express = require("express");
const { body, param, query } = require("express-validator");
const { createFlashcard, getFlashcards, reviewFlashcard } = require("../controllers/flashcard.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  [
    body("topicId").isString().trim().isLength({ min: 1, max: 100 }).withMessage("topicId is required"),
    body("frontText").isString().trim().isLength({ min: 1, max: 1000 }).withMessage("frontText is required"),
    body("backText").isString().trim().isLength({ min: 1, max: 1000 }).withMessage("backText is required"),
    body("memoryHook").optional().isString().trim().isLength({ max: 1000 }),
    body("source").optional().isIn(["bundled", "ai_generated"])
  ],
  validateRequest,
  createFlashcard
);

router.get(
  "/",
  [
    query("topicId").optional().isString().trim(),
    query("dueOnly").optional().isIn(["true", "false"])
  ],
  validateRequest,
  getFlashcards
);

router.put(
  "/:id/review",
  [
    param("id").isMongoId().withMessage("Invalid flashcard ID"),
    body("rating").isIn(["easy", "good", "hard"]).withMessage("Invalid review rating")
  ],
  validateRequest,
  reviewFlashcard
);

module.exports = router;
