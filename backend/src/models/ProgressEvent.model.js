const mongoose = require("mongoose");

const progressEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    module: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Referential integrity check (Foreign Key validation)
progressEventSchema.pre("save", async function validateUserId(next) {
  const User = mongoose.model("User");
  const userExists = await User.exists({ _id: this.userId });
  if (!userExists) {
    return next(new Error(`Referential Integrity Violation: User ID ${this.userId} does not exist.`));
  }
  next();
});

module.exports = mongoose.model("ProgressEvent", progressEventSchema);
