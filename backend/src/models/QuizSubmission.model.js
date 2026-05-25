const mongoose = require("mongoose");

const quizSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    questionId: {
      type: String,
      required: true,
      trim: true
    },
    selectedAnswer: {
      type: String,
      required: true,
      trim: true
    },
    correctness: {
      type: Boolean,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    completionTime: {
      type: Number, // duration in seconds
      required: true
    },
    clientGeneratedId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    schemaVersion: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

// Indexes
quizSubmissionSchema.index({ studentId: 1 });
quizSubmissionSchema.index({ questionId: 1 });
quizSubmissionSchema.index({ createdAt: 1 });

// Sync userId & studentId pre-save
quizSubmissionSchema.pre("save", function (next) {
  if (this.userId && !this.studentId) this.studentId = this.userId;
  if (this.studentId && !this.userId) this.userId = this.studentId;
  next();
});

module.exports = mongoose.model("QuizSubmission", quizSubmissionSchema);
