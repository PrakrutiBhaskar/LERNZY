const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    refreshTokenHash: {
      type: String,
      select: false
    },
    refreshTokenVersion: {
      type: Number,
      default: 0
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "ta", "te", "bn", "kn"],
      default: "en"
    },
    educationLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },
    board: {
      type: String,
      enum: ["ncert", "state"]
    },
    grade: {
      type: Number,
      min: 1,
      max: 12
    },
    interests: [{
      type: String
    }],
    accessibility: {
      type: String,
      enum: ["none", "sign-preferred"],
      default: "none"
    },
    locationTier: {
      type: String,
      enum: ["tier-1", "tier-2", "tier-3"]
    },
    points: {
      type: Number,
      default: 0
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student"
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Soft delete query filter hook
userSchema.pre(/^find/, function(next) {
  // If explicitly queried with { includeDeleted: true } via options, bypass filter
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Soft delete execution method
userSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
userSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
