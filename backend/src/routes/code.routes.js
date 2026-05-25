const express = require("express");
const { body } = require("express-validator");
const { explainCode, evaluateCode } = require("../controllers/code.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");
const safetyMiddleware = require("../middleware/safety.middleware");

const { aiLimiter } = require("../middleware/rateLimit.middleware");

const router = express.Router();

const explainValidators = [
  body("code").isString().trim().isLength({ min: 1, max: 5000 }).withMessage("Code is required and must be under 5000 characters"),
  body("errorText").optional().isString().trim().isLength({ max: 1000 }),
  body("output").optional().isString().trim().isLength({ max: 2000 }),
  body("language").optional().isString().trim().isLength({ max: 50 })
];

const evaluateValidators = [
  body("code").isString().trim().isLength({ min: 1, max: 10000 }).withMessage("Code is required"),
  body("problemId").isString().trim().isLength({ min: 1, max: 100 }).withMessage("problemId is required")
];

router.post("/explain", authMiddleware, aiLimiter, explainValidators, validateRequest, safetyMiddleware, explainCode);
router.post("/evaluate", authMiddleware, evaluateValidators, validateRequest, evaluateCode);

module.exports = router;
