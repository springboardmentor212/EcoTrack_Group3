const Goal = require("../models/Goal");

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

    // Validate input
    if (!title || !target || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, target, and deadline",
      });
    }

    const goalProgress = Number(progress) || 0;

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      target,
      deadline,
      progress: goalProgress,
      completed: goalProgress >= 100,
    });

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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

    // Update fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (target !== undefined) updateFields.target = target;
    if (deadline !== undefined) updateFields.deadline = deadline;

    if (progress !== undefined) {
      updateFields.progress = Number(progress);
      updateFields.completed = Number(progress) >= 100;
    }

    if (completed !== undefined) {
      updateFields.completed = completed;
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Update goal error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
    console.error("Delete goal error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};