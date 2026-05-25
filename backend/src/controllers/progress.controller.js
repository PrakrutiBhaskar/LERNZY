const ProgressEvent = require("../models/ProgressEvent.model");
const User = require("../models/User.model");
const Achievement = require("../models/Achievement.model");
const achievementService = require("../services/achievement.service");
const { successResponse, errorResponse } = require("../utils/response.utils");
const { runWithTransaction } = require("../utils/transaction");

/**
 * Creates and logs progress events. Handles gamified XP points and triggers achievement milestones.
 */
const createEvent = async (req, res, next) => {
  try {
    const { type, module: moduleName, payload, clientTimestamp } = req.body;
    
    // Conflict resolution: check if a newer record exists on the server
    if (clientTimestamp) {
      const newerEvent = await ProgressEvent.findOne({
        userId: req.user._id,
        module: moduleName,
        createdAt: { $gt: new Date(clientTimestamp) }
      });
      if (newerEvent) {
        return res.status(409).json({
          success: false,
          message: "Conflict: A newer progress event already exists on the server.",
          error: { code: "SYNC_CONFLICT" }
        });
      }
    }

    const result = await runWithTransaction(async (session) => {
      const eventArray = await ProgressEvent.create(
        [
          {
            userId: req.user._id,
            type,
            module: moduleName,
            payload
          }
        ],
        session ? { session } : {}
      );
      
      const event = eventArray[0];

      let pointsAwarded = 0;
      if (moduleName === "coding" && type === "lesson_completed") {
        pointsAwarded = 10;
      } else if (moduleName === "math" && type === "exercise_solved") {
        pointsAwarded = 5;
      }

      if (pointsAwarded > 0) {
        const user = await User.findById(req.user._id).session(session || null);
        if (user) {
          user.points = (user.points || 0) + pointsAwarded;
          await user.save(session ? { session } : {});
        }
      }

      return { event, pointsAwarded };
    });

    // Evaluate learning achievement milestones
    const unlockedAchievements = await achievementService.checkAndUnlock(req.user._id, {
      type,
      payload
    });

    return successResponse(
      res,
      { ...result, unlockedAchievements },
      "Progress event logged",
      201
    );
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
