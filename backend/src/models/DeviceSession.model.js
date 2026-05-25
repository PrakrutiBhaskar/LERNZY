const mongoose = require("mongoose");

const deviceSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: { type: String, required: true },
    platform: { type: String, default: "unknown" },
    lastSeen: { type: Date, default: Date.now },
    refreshTokenHash: { type: String, required: true },
    refreshVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

deviceSessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model("DeviceSession", deviceSessionSchema);
