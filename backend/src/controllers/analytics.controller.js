const AnalyticsEvent = require('../models/AnalyticsEvent.model');

/**
 * Log batched analytics events.
 * Expects an array of events in the request body.
 */
const logEvents = async (req, res, next) => {
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

/**
 * Group AnalyticsEvent records over a daily or weekly range to return aggregated summary metrics.
 */
const getActivitySummary = async (req, res, next) => {
  try {
    const { range = "weekly" } = req.query; // daily or weekly
    const daysLimit = range === "daily" ? 1 : 7;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysLimit);

    const summary = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: sinceDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            eventType: "$eventType"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          events: {
            $push: {
              eventType: "$_id.eventType",
              count: "$count"
            }
          },
          totalCount: { $sum: "$count" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      message: `${range} activity summary fetched`,
      data: summary,
      error: null
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  logEvents,
  getActivitySummary
};
