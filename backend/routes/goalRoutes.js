const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

// All goal routes require authentication
router.get("/", auth, getGoals);
router.post("/", auth, createGoal);
router.put("/:id", auth, updateGoal);
router.delete("/:id", auth, deleteGoal);

module.exports = router;