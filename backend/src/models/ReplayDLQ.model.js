const mongoose = require("mongoose");

const replayDLQSchema = new mongoose.Schema(
  {
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    failureReason: { type: String },
    stackTrace: { type: String },
    retryCount: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    eventId: { type: String, required: true, index: true },
    syncId: { type: String, index: true }
  },
  { timestamps: true, collection: "failed_replay_events" }
);

module.exports = mongoose.model("ReplayDLQ", replayDLQSchema);
