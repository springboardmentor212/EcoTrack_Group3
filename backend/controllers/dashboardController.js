const Activity = require("../models/Activity");
const CarbonRecord = require("../models/CarbonRecord");
const Goal = require("../models/Goal");
const Challenge = require("../models/Challenge");
const User = require("../models/User");

const round = (value) => Number(Number(value || 0).toFixed(2));

const getPeriodStart = (period) => {
  const now = new Date();

  if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (period === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }

  return null;
};

const toDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// GET /api/dashboard/stats
// Optional period: all | week | month | year
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const period = ["all", "week", "month", "year"].includes(req.query.period)
      ? req.query.period
      : "all";

    const periodStart = getPeriodStart(period);
    const carbonFilter = { userId };

    if (periodStart) {
      carbonFilter.date = { $gte: periodStart.toISOString().slice(0, 10) };
    }

    const [activities, carbonRecords, goals, challenges, user] = await Promise.all([
      Activity.find({ userId }).sort({ date: -1, createdAt: -1 }),
      CarbonRecord.find(carbonFilter).sort({ date: 1 }),
      Goal.find({ userId }).sort({ deadline: 1 }),
      Challenge.find({ userId }),
      User.findById(userId),
    ]);

    const totalMinutes = round(
      activities.reduce((sum, a) => sum + Number(a.duration || 0), 0)
    );
    const totalCalories = round(
      activities.reduce((sum, a) => sum + Number(a.calories || 0), 0)
    );
    const totalCarbon = round(
      carbonRecords.reduce((sum, r) => sum + Number(r.emission || 0), 0)
    );

    const categoryMap = {};
    carbonRecords.forEach((record) => {
      categoryMap[record.category] =
        round((categoryMap[record.category] || 0) + Number(record.emission));
    });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, emission]) => ({
        category,
        emission,
        percentage: totalCarbon
          ? round((emission / totalCarbon) * 100)
          : 0,
      }))
      .sort((a, b) => b.emission - a.emission);

    const dailyMap = {};
    carbonRecords.forEach((record) => {
      const key = String(record.date).slice(0, 10);
      dailyMap[key] = round((dailyMap[key] || 0) + Number(record.emission));
    });

    const trend = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, emission]) => ({ date, emission }));

    const completedGoals = goals.filter((goal) => goal.completed).length;
    const overdueGoals = goals.filter((goal) => {
      const deadline = toDate(goal.deadline);
      return deadline && !goal.completed && deadline < new Date();
    }).length;

    const completedChallenges = challenges.filter((challenge) => challenge.completed);
    const earnedPoints = completedChallenges.reduce(
      (sum, challenge) => sum + Number(challenge.points || 0),
      0
    );

    res.json({
      success: true,
      data: {
        period,
        totalMinutes,
        totalCalories,
        activityCount: activities.length,
        totalCarbon,
        totalGoals: goals.length,
        completedGoals,
        overdueGoals,
        activeGoals: goals.length - completedGoals,
        completedChallenges: completedChallenges.length,
        earnedPoints,
        currentStreak: user?.currentStreak || 0,
        totalPoints: user?.totalPoints || 0,
        level: user?.level || 1,
        recentActivities: activities.slice(0, 5),
        categoryBreakdown,
        trend,
        sustainability: {
          trackedRecords: carbonRecords.length,
          averageEmissionPerRecord: carbonRecords.length
            ? round(totalCarbon / carbonRecords.length)
            : 0,
          goalCompletionRate: goals.length
            ? round((completedGoals / goals.length) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
