const User = require("../models/User");
const Challenge = require("../models/Challenge");


// Get all users for admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Admin users error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

//Get all challenges for admin 
exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: challenges.length,
      data: challenges,
    });
  } catch (error) {
    console.error("Admin challenges error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch challenges",
    });
  }
};