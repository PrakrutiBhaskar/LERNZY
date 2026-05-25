const express = require('express');
const { body } = require("express-validator");
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const validateRequest = require("../middleware/validate.middleware");
const idempotency = require("../middleware/idempotency.middleware");

// Note: Analytics route is intentionally not protected by auth middleware
// to allow telemetry from unauthenticated/anonymous sessions as well.

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

module.exports = router;
