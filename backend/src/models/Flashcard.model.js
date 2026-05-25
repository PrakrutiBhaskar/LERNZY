const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    topicId: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      enum: ["bundled", "ai_generated"],
      default: "bundled"
    },
    frontText: {
      type: String,
      required: true,
      trim: true
    },
    backText: {
      type: String,
      required: true,
      trim: true
    },
    memoryHook: {
      type: String,
      trim: true,
      default: ""
    },
    easeFactor: {
      type: Number,
      required: true,
      default: 2.5
    },
    intervalDays: {
      type: Number,
      required: true,
      default: 1
    },
    repetitions: {
      type: Number,
      required: true,
      default: 0
    },
    nextReviewAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    lastReviewedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes
flashcardSchema.index({ userId: 1, nextReviewAt: 1 });
flashcardSchema.index({ userId: 1, topicId: 1 });

module.exports = mongoose.model("Flashcard", flashcardSchema);
