const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    topic: { type: String, trim: true },
    board: { type: String, enum: ["ncert", "state"] },
    grade: { type: Number, min: 1, max: 12 },
    responseText: {
      type: String,
      required: true
    },
    language: {
      type: String,
      enum: ["en", "kn"],
      required: true
    },
    outputType: {
      type: String,
      enum: ["text", "voice", "sign-language"],
      required: true
    },
    tts: {
      provider: String,
      audioUrl: String
    },
    signLanguage: {
      animationSet: String,
      gestures: [
        {
          token: String,
          gestureId: String,
          animationUrl: String
        }
      ]
    },
    modelMeta: {
      provider: String,
      model: String
    }
  },
  {
    timestamps: true
  }
);

chatHistorySchema.index({ userId: 1, createdAt: -1 });

// Referential integrity check (Foreign Key validation)
chatHistorySchema.pre("save", async function validateUserId(next) {
  const User = mongoose.model("User");
  const userExists = await User.exists({ _id: this.userId });
  if (!userExists) {
    return next(new Error(`Referential Integrity Violation: User ID ${this.userId} does not exist.`));
  }
  next();
});

module.exports = mongoose.model("ChatHistory", chatHistorySchema);
