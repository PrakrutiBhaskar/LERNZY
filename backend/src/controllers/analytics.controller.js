const AnalyticsEvent = require('../models/AnalyticsEvent.model');

/**
 * Log batched analytics events.
 * Expects an array of events in the request body.
 */
exports.logEvents = async (req, res, next) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        message: "Expected an array of events",
        data: null,
        error: { code: "VALIDATION_ERROR" }
      });
    }

    // Process and sanitize events
    const sanitizedEvents = events.map((event) => {
      // Create a clean payload, ignoring any potentially sent PII (like userId or name)
      return {
        eventType: event.eventType,
        sessionId: event.sessionId || 'anonymous',
        platform: event.platform || 'web',
        metadata: event.metadata || {},
        timestamp: event.timestamp || new Date(),
      };
    });

    // Bulk insert into the DB
    if (sanitizedEvents.length > 0) {
      await AnalyticsEvent.insertMany(sanitizedEvents);
    }

    res.status(200).json({ success: true, count: sanitizedEvents.length });
  } catch (error) {
    console.error('Analytics event logging error:', error);
    next(error);
  }
};
