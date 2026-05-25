const ProgressEvent = require("../models/ProgressEvent.model");
const User = require("../models/User.model");
const { successResponse, errorResponse } = require("../utils/response.utils");
const { runWithTransaction } = require("../utils/transaction");

const createEvent = async (req, res, next) => {
  try {
    const { type, module, payload, clientTimestamp } = req.body;
    
    // Conflict resolution: check if a newer record exists on the server
    if (clientTimestamp) {
      const newerEvent = await ProgressEvent.findOne({
        userId: req.user._id,
        module,
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
            module,
            payload
          }
        ],
        session ? { session } : {}
      );
      
      const event = eventArray[0];

      let pointsAwarded = 0;
      if (module === "coding" && type === "lesson_completed") {
        pointsAwarded = 10;
      } else if (module === "math" && type === "exercise_solved") {
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

    return successResponse(res, result, "Progress event logged", 201);
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

module.exports = { createEvent, getEvents };
