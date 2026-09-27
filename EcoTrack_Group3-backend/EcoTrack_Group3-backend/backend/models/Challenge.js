const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["steps", "distance", "days", "plastic_free", "carbon_reduction"],
      default: "steps",
    },
    target: {
      type: Number,
      required: [true, "Target is required"],
      min: [0, "Target cannot be negative"],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
    },
    unit: {
      type: String,
      default: "steps",
    },
    points: {
      type: Number,
      default: 10,
      min: [0, "Points cannot be negative"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for efficient querying
challengeSchema.index({ userId: 1, completed: 1 });

module.exports = mongoose.model("Challenge", challengeSchema);