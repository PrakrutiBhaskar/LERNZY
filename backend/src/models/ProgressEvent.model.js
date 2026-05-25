const mongoose = require("mongoose");

const progressEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: String, unique: true, sparse: true },
    eventType: { type: String, required: true },
    lessonId: { type: String, trim: true },
    module: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed },
    clientGeneratedId: { type: String, trim: true },
    schemaVersion: { type: Number, default: 1 },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for query speed & duplicate prevention
progressEventSchema.index({ studentId: 1 });
progressEventSchema.index({ eventId: 1 });
progressEventSchema.index({ lessonId: 1 });
progressEventSchema.index({ createdAt: 1 });

// Referential integrity check (Foreign Key validation)
progressEventSchema.pre("save", async function validateUserId(next) {
  const User = mongoose.model("User");
  const targetId = this.userId || this.studentId;
  const userExists = await User.exists({ _id: targetId });
  if (!userExists) {
    return next(new Error(`Referential Integrity Violation: User ID ${targetId} does not exist.`));
  }
  if (!this.userId) this.userId = targetId;
  if (!this.studentId) this.studentId = targetId;
  next();
});

module.exports = mongoose.model("ProgressEvent", progressEventSchema);
