const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    badgeKey: {
      type: String,
      required: true,
      trim: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Ensure a user can only earn each badge once
achievementSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });

module.exports = mongoose.model("Achievement", achievementSchema);
