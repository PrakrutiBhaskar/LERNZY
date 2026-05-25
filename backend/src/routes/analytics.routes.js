const express = require('express');
const { body, query } = require("express-validator");
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const validateRequest = require("../middleware/validate.middleware");
const idempotency = require("../middleware/idempotency.middleware");
const authMiddleware = require("../middleware/auth.middleware");

// Note: Logging is public for telemetry, but summary query is secure
router.post(
  '/events',
  idempotency,
  [
    body("events").isArray({ min: 1, max: 100 }).withMessage("events must be an array between 1 and 100 items"),
    body("events.*.eventType").isString().trim().notEmpty().withMessage("eventType is required"),
    body("events.*.sessionId").optional().isString().trim(),
    body("events.*.platform").optional().isString().trim(),
    body("events.*.metadata").optional().isObject()
  ],
  validateRequest,
  analyticsController.logEvents
);

router.get(
  '/summary',
  authMiddleware,
  [
    query("range").optional().isIn(["daily", "weekly"]).withMessage("range must be daily or weekly")
  ],
  validateRequest,
  analyticsController.getActivitySummary
);

module.exports = router;
