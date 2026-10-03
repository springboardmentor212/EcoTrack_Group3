const Goal = require("../models/Goal");
const { toFiniteNumber, sendModelError } = require("../utils/api");

// GET /api/goals
// Supports: status=active|completed|overdue, search, deadlineBefore,
// deadlineAfter, sortBy=deadline|progress|createdAt, order=asc|desc.
exports.getGoals = async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    if (req.query.status === "completed") filter.completed = true;
    if (req.query.status === "active") filter.completed = false;

    if (req.query.search) {
      filter.title = { $regex: req.query.search.trim(), $options: "i" };
    }

    if (req.query.deadlineBefore || req.query.deadlineAfter) {
      filter.deadline = {};
      if (req.query.deadlineBefore) filter.deadline.$lte = req.query.deadlineBefore;
      if (req.query.deadlineAfter) filter.deadline.$gte = req.query.deadlineAfter;
    }

    let goals = await Goal.find(filter);

    if (req.query.status === "overdue") {
      const today = new Date().toISOString().slice(0, 10);
      goals = goals.filter((goal) => !goal.completed && goal.deadline < today);
    }

    const allowedSorts = new Set(["deadline", "progress", "createdAt"]);
    const sortBy = allowedSorts.has(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const direction = req.query.order === "asc" ? 1 : -1;

    goals.sort((a, b) => {
      const left = a[sortBy];
      const right = b[sortBy];

      if (sortBy === "progress") return (Number(left) - Number(right)) * direction;

      const leftValue = new Date(left).getTime();
      const rightValue = new Date(right).getTime();
      if (Number.isNaN(leftValue) || Number.isNaN(rightValue)) {
        return String(left).localeCompare(String(right)) * direction;
      }
      return (leftValue - rightValue) * direction;
    });

    res.json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/goals
exports.createGoal = async (req, res) => {
  try {
    const { title, target, deadline, progress } = req.body;
    const goalProgress = progress === undefined ? 0 : toFiniteNumber(progress);

    if (
      !String(title || "").trim() ||
      !String(target || "").trim() ||
      !deadline ||
      goalProgress === null
    ) {
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

    if (Number.isNaN(Date.parse(deadline))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid deadline",
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

// PUT /api/goals/:id
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this goal",
      });
    }

    const { progress, completed, title, target, deadline } = req.body;
    const updateFields = {};

    if (title !== undefined) {
      const value = String(title).trim();
      if (!value) return res.status(400).json({ success: false, message: "Title cannot be empty" });
      updateFields.title = value;
    }

    if (target !== undefined) {
      const value = String(target).trim();
      if (!value) return res.status(400).json({ success: false, message: "Target cannot be empty" });
      updateFields.target = value;
    }

    if (deadline !== undefined) {
      if (Number.isNaN(Date.parse(deadline))) {
        return res.status(400).json({ success: false, message: "Please provide a valid deadline" });
      }
      updateFields.deadline = deadline;
    }

    if (progress !== undefined) {
      const value = toFiniteNumber(progress);
      if (value === null || value < 0 || value > 100) {
        return res.status(400).json({
          success: false,
          message: "Progress must be between 0 and 100",
        });
      }
      updateFields.progress = value;
      updateFields.completed = value >= 100;
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Completed must be a boolean",
        });
      }
      updateFields.completed = completed;
      if (completed && progress === undefined) updateFields.progress = 100;
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedGoal,
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while updating goal");
  }
};

// DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this goal",
      });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while deleting goal");
  }
};
