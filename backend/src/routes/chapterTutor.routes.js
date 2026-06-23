const express = require("express");
const { body, param } = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");
const safetyMiddleware = require("../middleware/safety.middleware");
const { aiLimiter } = require("../middleware/rateLimit.middleware");
const {
  getChapterTutorSession,
  postChapterTutorMessage
} = require("../controllers/chapterTutor.controller");

const router = express.Router();

const routeParams = [
  param("subjectId").isString().trim().isLength({ min: 1, max: 120 }),
  param("chapterId").isString().trim().isLength({ min: 1, max: 160 })
];

const messageValidators = [
  ...routeParams,
  body("question").isString().trim().isLength({ min: 2, max: 1200 }),
  body("subjectName").optional().isString().trim().isLength({ max: 160 }),
  body("chapterTitle").optional().isString().trim().isLength({ max: 220 }),
  body("language").optional().isIn(["en", "kn", "hi", "english", "kannada", "hindi"]),
  body("board").optional().isIn(["ncert", "state"]),
  body("grade").optional().isInt({ min: 1, max: 12 }),
  body("difficulty").optional().isIn(["beginner", "intermediate", "advanced"]),
  body("retryOfMessageId").optional().isString().trim().isLength({ max: 120 }),
  body("chapterContext").optional().isObject(),
  body("chapterContext.learningObjectives").optional().isArray({ max: 10 }),
  body("chapterContext.keyConcepts").optional().isArray({ max: 12 }),
  body("chapterContext.examples").optional().isArray({ max: 8 }),
  body("chapterContext.formulas").optional().isArray({ max: 12 })
];

router.get("/:subjectId/:chapterId", authMiddleware, routeParams, validateRequest, getChapterTutorSession);

router.post(
  "/:subjectId/:chapterId/messages",
  authMiddleware,
  aiLimiter,
  messageValidators,
  validateRequest,
  safetyMiddleware,
  postChapterTutorMessage
);

module.exports = router;
