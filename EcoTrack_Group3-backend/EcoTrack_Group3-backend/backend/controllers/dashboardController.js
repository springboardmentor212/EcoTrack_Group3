const User = require("../models/User");
const Activity = require("../models/Activity");
const CarbonRecord = require("../models/CarbonRecord");
const Goal = require("../models/Goal");

// ======================================================
// GET DASHBOARD STATS
// ======================================================

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const activities = await Activity.find({
      user: userId
    }).sort({
      createdAt: -1
    });

    const carbonRecords = await CarbonRecord.find({
      user: userId
    }).sort({
      createdAt: -1
    });

    const goals = await Goal.find({
      user: userId
    });

    const totalMinutes = activities.reduce(
      (total, activity) =>
        total + Number(activity.duration || 0),
      0
    );

    const totalCalories = activities.reduce(
      (total, activity) =>
        total + Number(activity.calories || 0),
      0
    );

    const totalCarbon = carbonRecords.reduce(
      (total, record) =>
        total + Number(record.emission || 0),
      0
    );

    const completedGoals = goals.filter(
      (goal) =>
        goal.completed === true ||
        Number(goal.progress || 0) >= 100
    ).length;

    res.json({
      success: true,

      stats: {
        totalMinutes,
        totalCalories,
        activityCount: activities.length,
        totalCarbon: Number(totalCarbon.toFixed(2)),
        totalGoals: goals.length,
        completedGoals,
        totalPoints: Number(user.totalPoints || 0),
        streak: Number(user.streak || 0)
      }
    });

  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics"
    });
  }
};


// ======================================================
// GET LEADERBOARD
// ======================================================

exports.getLeaderboard = async (req, res) => {
  try {

    const users = await User.find({})
      .select("name avatar totalPoints")
      .sort({
        totalPoints: -1,
        name: 1
      });

    const leaderboard = users.map(
      (user, index) => ({
        name: user.name || "User",

        avatar: user.avatar || "👤",

        points: Number(user.totalPoints || 0),

        rank: index + 1,

        steps: 0,

        activities: 0,

        you:
          req.user &&
          String(user._id) ===
          String(req.user._id)
      })
    );

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {

    console.error(
      "Leaderboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load leaderboard"
    });
  }
};