const express = require("express");
const { body } = require("express-validator");
const { generateSpeech } = require("../controllers/tts.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

const ttsValidators = [
  body("text").isString().trim().isLength({ min: 1, max: 1000 }).withMessage("text is required and must be under 1000 characters"),
  body("language").isString().trim().isIn(["en", "kn", "hi", "english", "kannada", "hindi"]).withMessage("Invalid language code")
];

router.post("/", authMiddleware, ttsValidators, validateRequest, generateSpeech);

module.exports = router;
