const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Activity type is required"],
      enum: {
        values: ["Walking", "Running", "Cycling", "Swimming", "Hiking", "Yoga"],
        message: "{VALUE} is not a valid activity type",
      },
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [0, "Duration cannot be negative"],
    },
    distance: {
      type: Number,
      required: [true, "Distance is required"],
      min: [0, "Distance cannot be negative"],
    },
    calories: {
      type: Number,
      required: [true, "Calories is required"],
      min: [0, "Calories cannot be negative"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for efficient querying by user and date
activitySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Activity", activitySchema);