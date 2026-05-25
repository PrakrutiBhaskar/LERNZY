const express = require("express");
const { body } = require("express-validator");
const { submitQuiz, getQuizHistory } = require("../controllers/quiz.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/submit",
  [
    body("questionId").isString().trim().notEmpty().withMessage("questionId is required"),
    body("selectedAnswer").isString().trim().notEmpty().withMessage("selectedAnswer is required"),
    body("correctness").isBoolean().withMessage("correctness must be a boolean"),
    body("score").isNumeric().withMessage("score must be a number"),
    body("completionTime").isNumeric().withMessage("completionTime must be a number"),
    body("clientGeneratedId").optional().isString().trim()
  ],
  validateRequest,
  submitQuiz
);

router.get("/history", getQuizHistory);

module.exports = router;
