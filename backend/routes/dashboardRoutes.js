const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getDashboardStats } = require("../controllers/dashboardController");

// Dashboard stats route requires authentication
router.get("/stats", auth, getDashboardStats);

module.exports = router;