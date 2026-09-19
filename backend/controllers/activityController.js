const Activity = require("../models/Activity");
const { toFiniteNumber, sendModelError } = require("../utils/api");

// @desc    Get all activities for logged-in user
// @route   GET /api/activities
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Create a new activity
// @route   POST /api/activities
exports.createActivity = async (req, res) => {
  try {
    const { type, icon, duration, distance, calories, date } = req.body;
    const parsedDuration = toFiniteNumber(duration);
    const parsedDistance = distance === undefined ? 0 : toFiniteNumber(distance);
    const parsedCalories = toFiniteNumber(calories);

    if (
      !type ||
      parsedDuration === null ||
      parsedCalories === null ||
      parsedDistance === null ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid type, duration, calories, and date",
      });
    }

    if (parsedDuration < 0 || parsedCalories < 0 || parsedDistance < 0) {
      return res.status(400).json({
        success: false,
        message: "Duration, distance, and calories cannot be negative",
      });
    }

    if (Number.isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid activity date",
      });
    }

    const activity = await Activity.create({
      userId: req.user._id,
      type,
      icon: icon || "🏃",
      duration: parsedDuration,
      distance: parsedDistance,
      calories: parsedCalories,
      date,
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while creating activity");
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Make sure user owns the activity
    if (activity.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this activity",
      });
    }

    await Activity.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while deleting activity");
  }
};