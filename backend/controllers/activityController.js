const Activity = require("../models/Activity");

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

    // Validate input
    if (!type || duration === undefined || calories === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide type, duration, calories, and date",
      });
    }

    if (duration < 0 || calories < 0) {
      return res.status(400).json({
        success: false,
        message: "Duration and calories cannot be negative",
      });
    }

    const activity = await Activity.create({
      userId: req.user._id,
      type,
      icon: icon || "🏃",
      duration: Number(duration),
      distance: Number(distance) || 0,
      calories: Number(calories),
      date,
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Create activity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
    console.error("Delete activity error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};