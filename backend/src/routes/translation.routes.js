const express = require("express");
const { body } = require("express-validator");
const { translateText } = require("../controllers/translation.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validate.middleware");

const router = express.Router();

const translateValidators = [
  body("text").isString().trim().isLength({ min: 1, max: 5000 }).withMessage("text is required"),
  body("language").isString().trim().isIn(["en", "kn", "hi", "english", "kannada", "hindi"]).withMessage("Invalid target language")
];

router.post("/", authMiddleware, translateValidators, validateRequest, translateText);

module.exports = router;
