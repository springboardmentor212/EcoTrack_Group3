const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user","admin"],
      default: "user",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create a hashed reset token and store only its hash.
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Method to update activity streak
userSchema.methods.updateStreak = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastActiveDate) {
    this.currentStreak = 1;
    this.lastActiveDate = today;
    return;
  }

  const lastActive = new Date(this.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) {
    this.currentStreak += 1;
  } else if (diffDays > 1) {
    this.currentStreak = 1;
  }

  this.lastActiveDate = today;
};

module.exports = mongoose.model("User", userSchema);