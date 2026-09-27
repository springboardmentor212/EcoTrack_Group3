const Goal = require("../models/Goal");
const { toFiniteNumber, sendModelError } = require("../utils/api");

// @desc    Get all goals for logged-in user
// @route   GET /api/goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
exports.createGoal = async (req, res) => {
  try {
    const { title, target, deadline, progress } = req.body;
    const goalProgress = progress === undefined ? 0 : toFiniteNumber(progress);

    if (!String(title || "").trim() || !String(target || "").trim() || !deadline || goalProgress === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, target, and deadline",
      });
    }

    if (goalProgress < 0 || goalProgress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be between 0 and 100",
      });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title: String(title).trim(),
      target: String(target).trim(),
      deadline,
      progress: goalProgress,
      completed: goalProgress >= 100,
    });

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while creating goal");
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
exports.updateGoal = async (req, res) => {
  try {
    const { progress, completed, title, target, deadline } = req.body;

    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    // Make sure user owns the goal
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this goal",
      });
    }

    const updateFields = {};
    if (title !== undefined) {
      const trimmedTitle = String(title).trim();
      if (!trimmedTitle) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }
      updateFields.title = trimmedTitle;
    }
    if (target !== undefined) {
      const trimmedTarget = String(target).trim();
      if (!trimmedTarget) {
        return res.status(400).json({
          success: false,
          message: "Target cannot be empty",
        });
      }
      updateFields.target = trimmedTarget;
    }
    if (deadline !== undefined) updateFields.deadline = deadline;

    if (progress !== undefined) {
      const parsedProgress = toFiniteNumber(progress);
      if (parsedProgress === null || parsedProgress < 0 || parsedProgress > 100) {
        return res.status(400).json({
          success: false,
          message: "Progress must be between 0 and 100",
        });
      }
      updateFields.progress = parsedProgress;
      updateFields.completed = parsedProgress >= 100;
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Completed must be a boolean",
        });
      }
      updateFields.completed = completed;
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, updateFields, {
      returnDocument: "after",
      runValidators: true,
    });

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while updating goal");
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    // Make sure user owns the goal
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this goal",
      });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while deleting goal");
  }
};