const express = require("express");
const { body } = require("express-validator");
const { signup, login, refresh, logout, getMe, updateMe } = require("../controllers/auth.controller");
const validateRequest = require("../middleware/validate.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

const strongPasswordRules = [
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must include an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must include a number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must include a special character")
];

router.post(
  "/signup",
  authLimiter,
  [
    body("name").isString().trim().isLength({ min: 2, max: 80 }),
    body("email").isEmail().normalizeEmail(),
    ...strongPasswordRules,
    body("preferredLanguage").optional().isIn(["en", "hi", "ta", "te", "bn", "kn"]),
    body("educationLevel").optional().isIn(["beginner", "intermediate", "advanced"]),
    body("board").optional().isIn(["ncert", "state"]),
    body("grade").optional().isInt({ min: 1, max: 12 }),
    body("interests").optional().isArray(),
    body("interests.*").optional().isString(),
    body("accessibility").optional().isIn(["none", "sign-preferred"]),
    body("locationTier").optional().isIn(["tier-1", "tier-2", "tier-3"])
  ],
  validateRequest,
  signup
);

router.post("/login", authLimiter, [body("email").isEmail().normalizeEmail(), body("password").isString().notEmpty()], validateRequest, login);

router.post(
  "/refresh",
  authLimiter,
  (req, res, next) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token || typeof token !== "string" || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: "refreshToken is required",
        data: null,
        error: { code: "VALIDATION_ERROR" }
      });
    }
    next();
  },
  refresh
);

router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().normalizeEmail()],
  validateRequest,
  (req, res) => {
    // Stub response for security: do not reveal if email exists.
    return res.status(200).json({
      success: true,
      message: "If that email address is in our database, we will send a password reset link to it.",
      data: null,
      error: null
    });
  }
);

router.post(
  "/reset-password",
  authLimiter,
  [
    body("token").isString().notEmpty(),
    ...strongPasswordRules
  ],
  validateRequest,
  (req, res) => {
    // Stub response
    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
      data: null,
      error: null
    });
  }
);

router.post("/logout", authMiddleware, logout);

router.get("/me", authMiddleware, getMe);

router.patch(
  "/me",
  authMiddleware,
  [
    body("name").optional().isString().trim().isLength({ min: 2, max: 80 }),
    body("preferredLanguage").optional().isIn(["en", "hi", "ta", "te", "bn", "kn"]),
    body("educationLevel").optional().isIn(["beginner", "intermediate", "advanced"]),
    body("board").optional().isIn(["ncert", "state"]),
    body("grade").optional().isInt({ min: 1, max: 12 }),
    body("interests").optional().isArray(),
    body("interests.*").optional().isString(),
    body("accessibility").optional().isIn(["none", "sign-preferred"]),
    body("locationTier").optional().isIn(["tier-1", "tier-2", "tier-3"])
  ],
  validateRequest,
  updateMe
);

module.exports = router;
