const mongoose = require("mongoose");

const mathAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    difficulty: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    timeTakenSeconds: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MathAttempt", mathAttemptSchema);
