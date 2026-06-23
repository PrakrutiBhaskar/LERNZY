const mongoose = require("mongoose");

const chapterTutorMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "tutor"],
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6000
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    questionType: {
      type: String,
      enum: ["doubt", "practice", "mcq", "short-answer", "challenge", "summary", "exam", "test"],
      default: "doubt"
    },
    modelMeta: {
      provider: String,
      model: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const chapterTutorSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    subjectId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    chapterId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    chapterTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220
    },
    messages: [chapterTutorMessageSchema],
    analytics: {
      questionCount: { type: Number, default: 0 },
      retryCount: { type: Number, default: 0 },
      practiceRequestCount: { type: Number, default: 0 },
      lastDifficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
      },
      commonDoubts: [
        {
          term: String,
          count: Number
        }
      ],
      lastAskedAt: Date
    }
  },
  {
    timestamps: true
  }
);

chapterTutorSessionSchema.index({ userId: 1, subjectId: 1, chapterId: 1 }, { unique: true });
chapterTutorSessionSchema.index({ subjectId: 1, chapterId: 1, "analytics.questionCount": -1 });

module.exports = mongoose.model("ChapterTutorSession", chapterTutorSessionSchema);
