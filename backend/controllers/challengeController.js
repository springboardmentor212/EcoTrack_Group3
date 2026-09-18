const Challenge = require("../models/Challenge");
const User = require("../models/User");

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

    if (!title || target === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and target",
      });
    }

    const challenge = await Challenge.create({
      userId: req.user._id,
      title,
      description: description || "",
      type: type || "steps",
      target: Number(target),
      unit: unit || "steps",
      points: Number(points) || 10,
      progress: 0,
      completed: false,
      endDate: endDate || null,
    });

    res.status(201).json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    console.error("Create challenge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update a challenge (progress, completion)
// @route   PUT /api/challenges/:id
exports.updateChallenge = async (req, res) => {
  try {
    const { progress, completed } = req.body;

    let challenge = await Challenge.findById(req.params.id);

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

    const updateFields = {};
    if (progress !== undefined) {
      updateFields.progress = Number(progress);
      updateFields.completed = Number(progress) >= challenge.target;
    }

    if (completed !== undefined) {
      updateFields.completed = completed;
    }

    challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    // If challenge completed, award points to user
    if (challenge.completed) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.totalPoints += challenge.points;
        await user.save();
      }
    }

    res.json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    console.error("Update challenge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
    console.error("Delete challenge error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};