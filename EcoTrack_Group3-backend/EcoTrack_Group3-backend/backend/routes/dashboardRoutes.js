const express = require("express");

const router = express.Router();

const dashboardController =
  require("../controllers/dashboardController");

const auth =
  require("../middleware/auth");


// ======================================================
// DASHBOARD STATS
// ======================================================

router.get(
  "/stats",
  auth,
  dashboardController.getDashboardStats
);


// ======================================================
// LEADERBOARD
// ======================================================

router.get(
  "/leaderboard",
  auth,
  dashboardController.getLeaderboard
);


module.exports = router;