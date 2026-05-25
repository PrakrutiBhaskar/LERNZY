const ProgressEvent = require("../models/ProgressEvent.model");
const User = require("../models/User.model");
const Achievement = require("../models/Achievement.model");
const achievementService = require("../services/achievement.service");
const { successResponse, errorResponse } = require("../utils/response.utils");
const { runWithTransaction } = require("../utils/transaction");
const ReplayDLQ = require("../models/ReplayDLQ.model");
const { ValidationError, ConflictError } = require("../utils/errors");
const metricsService = require("../services/metrics.service");

/**
 * Creates and logs progress events. Handles gamified XP points and triggers achievement milestones.
 */
const createEvent = async (req, res, next) => {
  try {
    const isBatch = Array.isArray(req.body);
    const events = isBatch ? req.body : [req.body];

    const diagnostics = {
      replayed: 0,
      duplicate: 0,
      failed: 0,
      retried: 0,
      discarded: 0
    };

    const processedEvents = [];
    const unlockedAchievementsList = [];

    // For a single event, if there is a LWW conflict, we MUST return 409 SYNC_CONFLICT
    if (!isBatch && events[0].clientTimestamp) {
      const singleEvent = events[0];
      const newerEvent = await ProgressEvent.findOne({
        userId: req.user._id,
        module: singleEvent.module,
        createdAt: { $gt: new Date(singleEvent.clientTimestamp) }
      });
      if (newerEvent) {
        return res.status(409).json({
          success: false,
          message: "Conflict: A newer progress event already exists on the server.",
          error: { code: "SYNC_CONFLICT" }
        });
      }
    }

    const processPayloadAndReward = async (eventDoc, type, moduleName, payload) => {
      let pointsAwarded = 0;
      await runWithTransaction(async (session) => {
        if (moduleName === "coding" && type === "lesson_completed") {
          pointsAwarded = 10;
        } else if (moduleName === "math" && type === "exercise_solved") {
          pointsAwarded = 5;
        }

        if (pointsAwarded > 0) {
          const user = await User.findById(req.user._id).session(session || null);
          if (user && typeof user.save === "function") {
            user.points = (user.points || 0) + pointsAwarded;
            await user.save(session ? { session } : {});
          }
        }
      });

      // Achievements
      const unlockedAchievements = await achievementService.checkAndUnlock(req.user._id, {
        type,
        payload
      });
      if (unlockedAchievements && unlockedAchievements.length > 0) {
        unlockedAchievementsList.push(...unlockedAchievements);
      }

      eventDoc.status = "COMPLETED";
      eventDoc.processedAt = new Date();
      if (typeof eventDoc.save === "function") {
        await eventDoc.save();
      }

      return pointsAwarded;
    };

    for (const rawEvent of events) {
      let eventDoc = null;
      try {
        const { type, module: moduleName, payload, clientTimestamp, clientGeneratedId, eventId, isRetry } = rawEvent;
        const targetTimestamp = clientTimestamp || rawEvent.timestamp || Date.now();
        const eventVersion = rawEvent.eventVersion || "1.0.0";
        const producerVersion = rawEvent.producerVersion || "1.0.0";

        // 1. Validate version compatibility (reject unsupported schema versions, trigger migrations if older versions match)
        let normalizedEventVersion = eventVersion;
        if (eventVersion !== "1.0.0") {
          if (eventVersion === "0.9.0" || eventVersion === "0.9") {
            // Trigger migration to 1.0.0
            normalizedEventVersion = "1.0.0";
          } else {
            throw new ValidationError(`Unsupported event schema version: ${eventVersion}`);
          }
        }

        // 2. Perform duplicate lookup by clientGeneratedId/eventId
        let existingEvent = null;
        if (eventId) {
          existingEvent = await ProgressEvent.findOne({ eventId });
        } else if (clientGeneratedId) {
          existingEvent = await ProgressEvent.findOne({ clientGeneratedId });
        }

        if (existingEvent) {
          if (existingEvent.status === "COMPLETED" || existingEvent.status === "DUPLICATE" || existingEvent.status === "DISCARDED") {
            diagnostics.duplicate++;
            if (metricsService && typeof metricsService.incrementReplayMetric === "function") {
              metricsService.incrementReplayMetric("duplicate");
            }
            processedEvents.push(existingEvent);
            continue;
          }

          if (existingEvent.status === "FAILED") {
            const MAX_REPLAY_RETRIES = parseInt(process.env.MAX_REPLAY_RETRIES, 10) || 3;
            existingEvent.retryCount = (existingEvent.retryCount || 0) + 1;
            existingEvent.lastRetriedAt = new Date();

            if (existingEvent.retryCount >= MAX_REPLAY_RETRIES) {
              existingEvent.status = "DISCARDED";
              existingEvent.discardReason = "MAX_RETRIES_EXCEEDED";
              if (typeof existingEvent.save === "function") {
                await existingEvent.save();
              }

              // Move to Dead Letter Queue (DLQ)
              await ReplayDLQ.create({
                payload: rawEvent.payload || {},
                failureReason: "Max retry limit exceeded",
                stackTrace: new Error("Max retry limit exceeded").stack,
                retryCount: existingEvent.retryCount,
                timestamp: new Date(),
                eventId: existingEvent.eventId || existingEvent.clientGeneratedId || "unknown",
                syncId: req.headers["x-sync-id"] || rawEvent.syncId || null
              });

              diagnostics.discarded++;
              if (metricsService && typeof metricsService.incrementReplayMetric === "function") {
                metricsService.incrementReplayMetric("discard");
              }
              processedEvents.push(existingEvent);
              continue;
            }

            eventDoc = existingEvent;
            eventDoc.status = "PROCESSING";
            if (typeof eventDoc.save === "function") {
              await eventDoc.save();
            }
            diagnostics.retried++;
            if (metricsService && typeof metricsService.incrementReplayMetric === "function") {
              metricsService.incrementReplayMetric("retry");
            }
          }
        }

        // 3. New Event Creation & LWW conflict check
        if (!existingEvent) {
          if (targetTimestamp) {
            const newerEvent = await ProgressEvent.findOne({
              userId: req.user._id,
              module: moduleName,
              createdAt: { $gt: new Date(targetTimestamp) }
            });
            if (newerEvent) {
              diagnostics.discarded++;
              if (metricsService && typeof metricsService.incrementReplayMetric === "function") {
                metricsService.incrementReplayMetric("discard");
              }
              const discardedArray = await ProgressEvent.create([{
                userId: req.user._id,
                studentId: req.user._id,
                type,
                module: moduleName,
                payload,
                clientGeneratedId,
                eventId: eventId || clientGeneratedId,
                timestamp: new Date(targetTimestamp),
                status: "DISCARDED",
                discardReason: "SYNC_CONFLICT",
                firstSeenAt: new Date(),
                eventVersion: normalizedEventVersion,
                producerVersion
              }]);
              eventDoc = discardedArray[0];
              processedEvents.push(eventDoc);
              continue;
            }
          }

          const createdArray = await ProgressEvent.create([{
            userId: req.user._id,
            studentId: req.user._id,
            type,
            module: moduleName,
            payload,
            clientGeneratedId,
            eventId: eventId || clientGeneratedId,
            timestamp: new Date(targetTimestamp),
            status: "PROCESSING",
            firstSeenAt: new Date(),
            eventVersion: normalizedEventVersion,
            producerVersion
          }]);
          eventDoc = createdArray[0];

          if (isRetry || rawEvent.retries > 0) {
            diagnostics.retried++;
            if (metricsService && typeof metricsService.incrementReplayMetric === "function") {
              metricsService.incrementReplayMetric("retry");
            }
          }
        }

        // 4. Process event XP & Achievements
        await processPayloadAndReward(eventDoc, type, moduleName, payload);

        diagnostics.replayed++;
        if (metricsService && typeof metricsService.incrementReplayMetric === "function") {
          metricsService.incrementReplayMetric("throughput");
        }
        processedEvents.push(eventDoc);

      } catch (err) {
        diagnostics.failed++;
        if (metricsService && typeof metricsService.incrementReplayMetric === "function") {
          metricsService.incrementReplayMetric("fail");
        }

        if (eventDoc) {
          eventDoc.status = "FAILED";
          if (typeof eventDoc.save === "function") {
            await eventDoc.save().catch(() => {});
          }
        }

        if (!isBatch) {
          throw err;
        }
      }
    }

    if (isBatch) {
      return successResponse(
        res,
        {
          diagnostics,
          events: processedEvents,
          unlockedAchievements: unlockedAchievementsList
        },
        "Progress events synced successfully",
        200
      );
    } else {
      const firstEvent = processedEvents[0];
      const pts = firstEvent ? (firstEvent.module === "coding" && firstEvent.type === "lesson_completed" ? 10 : (firstEvent.module === "math" && firstEvent.type === "exercise_solved" ? 5 : 0)) : 0;
      return successResponse(
        res,
        {
          event: firstEvent,
          pointsAwarded: pts,
          unlockedAchievements: unlockedAchievementsList
        },
        "Progress event logged",
        201
      );
    }
  } catch (error) {
    return next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const events = await ProgressEvent.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    return successResponse(res, { events });
  } catch (error) {
    return next(error);
  }
};

/**
 * Aggregates ProgressEvent collections to compute per-student, per-node (module) mastery percentages.
 */
const getMastery = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const mastery = await ProgressEvent.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$module",
          totalAttempts: { $sum: 1 },
          correctAttempts: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$payload.isCorrect", true] },
                    { $eq: ["$payload.correct", true] }
                  ]
                },
                1,
                0
              ]
            }
          },
          avgScore: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$payload.score", null] },
                    { $ne: ["$payload.total", null] },
                    { $gt: ["$payload.total", 0] }
                  ]
                },
                { $divide: ["$payload.score", "$payload.total"] },
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          module: "$_id",
          totalAttempts: 1,
          correctAttempts: 1,
          masteryPercentage: {
            $cond: [
              { $gt: ["$totalAttempts", 0] },
              {
                $multiply: [
                  {
                    $cond: [
                      { $ne: ["$avgScore", null] },
                      "$avgScore",
                      { $divide: ["$correctAttempts", "$totalAttempts"] }
                    ]
                  },
                  100
                ]
              },
              0
            ]
          }
        }
      }
    ]);

    return successResponse(res, { mastery }, "Mastery percentages calculated");
  } catch (error) {
    return next(error);
  }
};

/**
 * Expose achievements collection query to fetch badges earned by the student.
 */
const getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ userId: req.user._id }).sort({ earnedAt: -1 });
    return successResponse(res, { achievements }, "Achievements retrieved");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getMastery,
  getAchievements
};
