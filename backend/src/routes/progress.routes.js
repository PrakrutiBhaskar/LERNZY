const express = require("express");
const { body } = require("express-validator");
const { createEvent, getEvents } = require("../controllers/progress.controller");
const validateRequest = require("../middleware/validate.middleware");
const authMiddleware = require("../middleware/auth.middleware");

const idempotency = require("../middleware/idempotency.middleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/events",
  idempotency,
  [
    body("type").isString().trim().isLength({ min: 1, max: 100 }).withMessage("type is required"),
    body("module").isString().trim().isLength({ min: 1, max: 100 }).withMessage("module is required"),
    body("payload").optional().isObject(),
    body("clientTimestamp").optional().isNumeric().withMessage("clientTimestamp must be a number")
  ],
  validateRequest,
  createEvent
);

router.get("/events", getEvents);

module.exports = router;
