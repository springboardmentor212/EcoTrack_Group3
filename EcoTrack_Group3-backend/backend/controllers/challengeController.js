const Challenge = require("../models/Challenge");
const User = require("../models/User");
const { toFiniteNumber, sendModelError } = require("../utils/api");

// @desc    Get all challenges for logged-in user
// @route   GET /api/challenges
exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: challenges.length,
      data: challenges,
    });
  } catch (error) {
    console.error("Get challenges error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Create a new challenge
// @route   POST /api/challenges
exports.createChallenge = async (req, res) => {
  try {
    const { title, description, type, target, unit, points, endDate } = req.body;
    const parsedTarget = toFiniteNumber(target);
    const parsedPoints = points === undefined ? 10 : toFiniteNumber(points);

    if (!String(title || "").trim() || parsedTarget === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and target",
      });
    }

    if (parsedTarget < 0 || parsedPoints === null || parsedPoints < 0) {
      return res.status(400).json({
        success: false,
        message: "Target and points cannot be negative",
      });
    }

    const challenge = await Challenge.create({
      userId: req.user._id,
      title: String(title).trim(),
      description: description || "",
      type: type || "steps",
      target: parsedTarget,
      unit: unit || "steps",
      points: parsedPoints,
      progress: 0,
      completed: false,
      endDate: endDate || null,
    });

    res.status(201).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while creating challenge");
  }
};

// @desc    Update a challenge (progress, completion)
// @route   PUT /api/challenges/:id
exports.updateChallenge = async (req, res) => {
  try {
    const { progress, completed } = req.body;
    const parsedProgress = progress === undefined ? null : toFiniteNumber(progress);

    if (parsedProgress !== null && parsedProgress < 0) {
      return res.status(400).json({
        success: false,
        message: "Progress cannot be negative",
      });
    }

    if (completed !== undefined && typeof completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Completed must be a boolean",
      });
    }

    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    // Make sure user owns the challenge
    if (challenge.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this challenge",
      });
    }

    const wasCompleted = challenge.completed;
    const updateFields = {};
    if (parsedProgress !== null) {
      updateFields.progress = parsedProgress;
      updateFields.completed = parsedProgress >= challenge.target;
    }

    if (completed !== undefined) {
      updateFields.completed = completed;
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { returnDocument: "after", runValidators: true }
    );

    const user = await User.findById(req.user._id);
    if (user && updatedChallenge.completed !== wasCompleted) {
      user.totalPoints = Math.max(
        0,
        user.totalPoints +
          (updatedChallenge.completed ? updatedChallenge.points : -updatedChallenge.points)
      );
      await user.save();
    }

    res.json({
      success: true,
      data: updatedChallenge,
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while updating challenge");
  }
};

// @desc    Delete a challenge
// @route   DELETE /api/challenges/:id
exports.deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found",
      });
    }

    // Make sure user owns the challenge
    if (challenge.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this challenge",
      });
    }

    await Challenge.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Challenge deleted successfully",
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while deleting challenge");
  }
};