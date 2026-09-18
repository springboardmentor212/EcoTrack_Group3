const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    target: {
      type: String,
      required: [true, "Target is required"],
      trim: true,
      maxlength: [100, "Target cannot exceed 100 characters"],
    },
    deadline: {
      type: String,
      required: [true, "Deadline is required"],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for efficient querying
goalSchema.index({ userId: 1, completed: 1 });

module.exports = mongoose.model("Goal", goalSchema);