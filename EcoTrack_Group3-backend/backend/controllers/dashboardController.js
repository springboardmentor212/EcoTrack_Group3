const Activity = require("../models/Activity");
const CarbonRecord = require("../models/CarbonRecord");
const Goal = require("../models/Goal");
const Challenge = require("../models/Challenge");
const User = require("../models/User");

// @desc    Get dashboard stats for logged-in user
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Activity stats
    const activities = await Activity.find({ userId });

    const totalMinutes = activities.reduce(
      (sum, a) => sum + Number(a.duration),
      0
    );

    const totalCalories = activities.reduce(
      (sum, a) => sum + Number(a.calories),
      0
    );

    const activityCount = activities.length;

    // Carbon stats
    const carbonRecords = await CarbonRecord.find({ userId });

    const totalCarbon = Number(
      carbonRecords
        .reduce(
          (sum, r) => sum + Number(r.emission),
          0
        )
        .toFixed(2)
    );

    // Goal stats
    const goals = await Goal.find({ userId });

    const totalGoals = goals.length;

    const completedGoals = goals.filter(
      (g) => g.completed
    ).length;

    // Challenge stats
    const challenges = await Challenge.find({ userId });

    const completedChallenges =
      challenges.filter(
        (c) => c.completed
      ).length;

    const earnedPoints =
      challenges
        .filter(
          (c) => c.completed
        )
        .reduce(
          (sum, c) =>
            sum + Number(c.points),
          0
        );

    // User stats
    const user =
      await User.findById(userId);

    res.json({
      success: true,

      data: {
        totalMinutes,

        totalCalories,

        activityCount,

        totalCarbon,

        totalGoals,

        completedGoals,

        completedChallenges,

        earnedPoints,

        currentStreak:
          user?.currentStreak || 0,

        totalPoints:
          user?.totalPoints || 0,

        level:
          user?.level || 1,

        recentActivities:
          activities.slice(0, 5)
      }
    });

  } catch (error) {

    console.error(
      "Dashboard stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};