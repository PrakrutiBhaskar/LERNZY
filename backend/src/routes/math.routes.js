const express = require("express");
const { body } = require("express-validator");
const { generateProblem, submitAttempt } = require("../controllers/math.controller");
const validateRequest = require("../middleware/validate.middleware");
const authMiddleware = require("../middleware/auth.middleware");

const { aiLimiter } = require("../middleware/rateLimit.middleware");
const idempotency = require("../middleware/idempotency.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/generate",
  aiLimiter,
  [
    body("topic").optional().isString().trim().isLength({ max: 100 })
  ],
  validateRequest,
  generateProblem
);

router.post(
  "/attempt",
  idempotency,
  [
    body("topic").isString().trim().isLength({ min: 1, max: 100 }).withMessage("topic is required"),
    body("difficulty").isInt({ min: 1, max: 5 }),
    body("isCorrect").isBoolean(),
    body("timeTakenSeconds").optional().isInt({ min: 0 })
  ],
  validateRequest,
  submitAttempt
);

module.exports = router;
