const express = require("express");
const { createEvent, getEvents, getMastery, getAchievements } = require("../controllers/progress.controller");
const authMiddleware = require("../middleware/auth.middleware");
const idempotency = require("../middleware/idempotency.middleware");

const router = express.Router();

// Custom validator supporting both single progress event and batch arrays
const validateProgressEvent = (req, res, next) => {
  const isArray = Array.isArray(req.body);
  const events = isArray ? req.body : [req.body];
  
  if (isArray && events.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details: [{ field: "body", message: "events array cannot be empty" }]
      }
    });
  }

  const details = [];
  
  events.forEach((ev, idx) => {
    const prefix = isArray ? `[${idx}].` : "";
    
    if (!ev || typeof ev.type !== "string" || !ev.type.trim()) {
      details.push({ field: `${prefix}type`, message: "type is required and must be a string" });
    } else if (ev.type.trim().length > 100) {
      details.push({ field: `${prefix}type`, message: "type must be at most 100 chars" });
    }
    
    if (!ev || typeof ev.module !== "string" || !ev.module.trim()) {
      details.push({ field: `${prefix}module`, message: "module is required and must be a string" });
    } else if (ev.module.trim().length > 100) {
      details.push({ field: `${prefix}module`, message: "module must be at most 100 chars" });
    }
    
    if (ev && ev.payload !== undefined && (typeof ev.payload !== "object" || ev.payload === null)) {
      details.push({ field: `${prefix}payload`, message: "payload must be an object" });
    }
    
    if (ev && ev.clientTimestamp !== undefined && typeof ev.clientTimestamp !== "number") {
      details.push({ field: `${prefix}clientTimestamp`, message: "clientTimestamp must be a number" });
    }
  });

  if (details.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: {
        code: "VALIDATION_ERROR",
        details
      }
    });
  }

  next();
};

router.use(authMiddleware);

router.post(
  "/events",
  idempotency,
  validateProgressEvent,
  createEvent
);

router.get("/events", getEvents);
router.get("/mastery", getMastery);
router.get("/achievements", getAchievements);

module.exports = router;
